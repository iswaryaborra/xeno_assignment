import { Router, Request, Response } from 'express';
import axios from 'axios';
import prisma from '../prisma/client';
import { evaluateSegmentRules, SegmentRule } from '../services/segmentService';

const router = Router();

const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:4001';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

function normalizeCustomer(c: Record<string, unknown> & { tagsJson?: string; orders?: unknown[] }) {
  const { tagsJson, ...rest } = c;
  return { ...rest, tags: tagsJson ? JSON.parse(tagsJson as string) : [], orders: c.orders };
}

function normalizeSegment(s: Record<string, unknown> & { rulesJson?: string }) {
  const { rulesJson, ...rest } = s;
  return { ...rest, rules: rulesJson ? JSON.parse(rulesJson as string) : [] };
}

// ─── GET /api/campaigns ───────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        segment: true,
        metrics: true,
        logs: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { customer: { select: { name: true, email: true } } },
        },
      },
    });

    const shaped = campaigns.map(c => ({
      id: c.id,
      name: c.name,
      segment: c.segment.name,
      segmentId: c.segmentId,
      channel: c.channel,
      status: c.status,
      launchDate: c.launchDate?.toISOString().split('T')[0] ?? null,
      messageCopy: c.messageCopy,
      metrics: c.metrics
        ? { audienceSize: c.metrics.audienceSize, sent: c.metrics.sent, delivered: c.metrics.delivered, opened: c.metrics.opened, clicked: c.metrics.clicked, converted: c.metrics.converted, revenue: c.metrics.revenue }
        : { audienceSize: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 },
      recipients: c.logs.map(l => ({
        name: l.customer.name,
        email: l.customer.email,
        status: l.status,
        time: l.sentAt?.toLocaleString('en-IN') ?? 'Pending',
      })),
    }));

    res.json(shaped);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// ─── POST /api/campaigns ──────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, segmentId, channel, messageCopy } = req.body as { name: string; segmentId: string; channel: string; messageCopy: string };
    if (!name || !segmentId || !channel || !messageCopy) {
      res.status(400).json({ error: 'name, segmentId, channel, messageCopy are required' }); return;
    }

    const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
    if (!segment) { res.status(404).json({ error: 'Segment not found' }); return; }

    const campaign = await prisma.campaign.create({
      data: { name, segmentId, channel, messageCopy, status: 'Draft' },
      include: { segment: true, metrics: true },
    });

    res.status(201).json(campaign);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// ─── POST /api/campaigns/:id/launch ──────────────────────────────────────────
router.post('/:id/launch', async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { segment: true },
    });

    if (!campaign) { res.status(404).json({ error: 'Campaign not found' }); return; }
    if (campaign.status === 'In Progress' || campaign.status === 'Sent') {
      res.status(400).json({ error: 'Campaign already launched' }); return;
    }

    // Resolve segment customers
    const rawSeg = campaign.segment as Record<string, unknown> & { rulesJson?: string };
    const rules: SegmentRule[] = JSON.parse(rawSeg.rulesJson || '[]');
    const logic = campaign.segment.logic as 'AND' | 'OR';

    const allRaw = await prisma.customer.findMany({ include: { orders: { include: { items: true } } } });
    const allCustomers = allRaw.map(c => normalizeCustomer(c as Record<string, unknown> & { tagsJson?: string; orders?: unknown[] }));
    const targetCustomers = evaluateSegmentRules(allCustomers as Parameters<typeof evaluateSegmentRules>[0], rules, logic);
    const audienceSize = targetCustomers.length;

    // Update campaign status
    await prisma.campaign.update({ where: { id: campaign.id }, data: { status: 'In Progress', launchDate: new Date() } });
    await prisma.segment.update({ where: { id: campaign.segmentId }, data: { lastUsed: new Date() } });

    // Create CommunicationLogs
    for (const c of targetCustomers) {
      try {
        await prisma.communicationLog.create({ data: { campaignId: campaign.id, customerId: c.id, channel: campaign.channel, status: 'PENDING' } });
      } catch { /* skip dup */ }
    }

    // Create initial metrics
    await prisma.campaignMetrics.upsert({
      where: { campaignId: campaign.id },
      update: { audienceSize },
      create: { campaignId: campaign.id, audienceSize },
    });

    res.json({ success: true, campaignId: campaign.id, audienceSize, message: 'Campaign launched. Dispatching messages...' });

    // Async dispatch
    setImmediate(async () => {
      try {
        const logs = await prisma.communicationLog.findMany({
          where: { campaignId: campaign.id, status: 'PENDING' },
          include: { customer: true },
        });

        await axios.post(`${CHANNEL_SERVICE_URL}/dispatch`, {
          campaignId: campaign.id,
          channel: campaign.channel,
          messageCopy: campaign.messageCopy,
          webhookUrl: `${BACKEND_URL}/api/webhook/delivery`,
          recipients: logs.map(l => ({
            logId: l.id,
            customerId: l.customerId,
            name: l.customer.name,
            email: l.customer.email,
            phone: l.customer.phone,
            channelPreference: l.customer.channelPreference,
          })),
        }, { timeout: 5000 });
      } catch (err) {
        console.warn('[DISPATCH] Channel service unavailable — running local simulation');
        await simulateDispatchLocally(campaign.id);
      }
    });

  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// ─── Local fallback simulation ─────────────────────────────────────────────────
async function simulateDispatchLocally(campaignId: string) {
  const logs = await prisma.communicationLog.findMany({ where: { campaignId, status: 'PENDING' } });

  for (const log of logs) {
    const delayMs = Math.random() * 8000;
    setTimeout(async () => {
      const isDelivered = Math.random() > 0.03;
      const isOpened = isDelivered && Math.random() > 0.25;
      const isClicked = isOpened && Math.random() > 0.55;
      const isConverted = isClicked && Math.random() > 0.75;
      const now = new Date();

      await prisma.communicationLog.update({
        where: { id: log.id },
        data: {
          status: !isDelivered ? 'FAILED' : isConverted ? 'CONVERTED' : isClicked ? 'CLICKED' : isOpened ? 'OPENED' : 'DELIVERED',
          sentAt: now,
          deliveredAt: isDelivered ? new Date(now.getTime() + 1000) : null,
          openedAt: isOpened ? new Date(now.getTime() + 5000) : null,
          clickedAt: isClicked ? new Date(now.getTime() + 8000) : null,
          convertedAt: isConverted ? new Date(now.getTime() + 30000) : null,
          failedAt: !isDelivered ? now : null,
          vendorId: `LOCAL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        },
      });

      await recalculateCampaignMetrics(campaignId);
    }, delayMs);
  }
}

// ─── Metrics recalculator ─────────────────────────────────────────────────────
export async function recalculateCampaignMetrics(campaignId: string) {
  const logs = await prisma.communicationLog.findMany({ where: { campaignId } });
  const total = logs.length;
  const sent = logs.filter(l => l.status !== 'PENDING').length;
  const delivered = logs.filter(l => ['DELIVERED', 'OPENED', 'CLICKED', 'CONVERTED'].includes(l.status)).length;
  const opened = logs.filter(l => ['OPENED', 'CLICKED', 'CONVERTED'].includes(l.status)).length;
  const clicked = logs.filter(l => ['CLICKED', 'CONVERTED'].includes(l.status)).length;
  const converted = logs.filter(l => l.status === 'CONVERTED').length;
  const revenue = converted * 3500;

  await prisma.campaignMetrics.update({ where: { campaignId }, data: { audienceSize: total, sent, delivered, opened, clicked, converted, revenue } });

  const pending = logs.filter(l => l.status === 'PENDING').length;
  if (pending === 0 && total > 0) {
    await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'Sent' } });
  }
}

export default router;
