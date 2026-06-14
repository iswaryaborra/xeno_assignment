import { Router, Request, Response } from 'express';
import prisma from '../prisma/client';

const router = Router();

// ─── GET /api/analytics/overview ─────────────────────────────────────────────
// Returns aggregate stats across ALL campaigns (from real DB events)
router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const [campaigns, allLogs, customerCount] = await Promise.all([
      prisma.campaign.findMany({ include: { metrics: true } }),
      prisma.communicationLog.findMany(),
      prisma.customer.count(),
    ]);

    const totalSent = allLogs.filter((l) => l.status !== 'PENDING').length;
    const totalDelivered = allLogs.filter((l) =>
      ['DELIVERED', 'OPENED', 'CLICKED', 'CONVERTED'].includes(l.status)
    ).length;
    const totalOpened = allLogs.filter((l) =>
      ['OPENED', 'CLICKED', 'CONVERTED'].includes(l.status)
    ).length;
    const totalClicked = allLogs.filter((l) =>
      ['CLICKED', 'CONVERTED'].includes(l.status)
    ).length;
    const totalConverted = allLogs.filter((l) => l.status === 'CONVERTED').length;
    const totalRevenue = campaigns.reduce((sum, c) => sum + (c.metrics?.revenue ?? 0), 0);

    const activeCampaigns = campaigns.filter(
      (c) => c.status === 'In Progress' || c.status === 'Scheduled'
    ).length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const sentToday = allLogs.filter(
      (l) => l.sentAt && l.sentAt >= todayStart
    ).length;

    res.json({
      customerCount,
      campaignCount: campaigns.length,
      activeCampaigns,
      sentToday,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalConverted,
      totalRevenue,
      deliveryRate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0',
      openRate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0',
      clickRate: totalDelivered > 0 ? ((totalClicked / totalDelivered) * 100).toFixed(1) : '0',
      conversionRate: totalDelivered > 0 ? ((totalConverted / totalDelivered) * 100).toFixed(1) : '0',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// ─── GET /api/analytics/campaigns/:id ────────────────────────────────────────
// Returns real event-driven analytics for a single campaign
router.get('/campaigns/:id', async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        metrics: true,
        segment: true,
        logs: {
          orderBy: { createdAt: 'asc' },
          include: { customer: { select: { name: true, email: true } } },
        },
      },
    });

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const logs = campaign.logs;

    // ── Funnel metrics from real events ──
    const sent = logs.filter((l) => l.status !== 'PENDING').length;
    const delivered = logs.filter((l) =>
      ['DELIVERED', 'OPENED', 'CLICKED', 'CONVERTED'].includes(l.status)
    ).length;
    const opened = logs.filter((l) =>
      ['OPENED', 'CLICKED', 'CONVERTED'].includes(l.status)
    ).length;
    const clicked = logs.filter((l) =>
      ['CLICKED', 'CONVERTED'].includes(l.status)
    ).length;
    const converted = logs.filter((l) => l.status === 'CONVERTED').length;
    const failed = logs.filter((l) => l.status === 'FAILED').length;

    // ── Timeline: hourly delivery distribution ──
    const deliveredLogs = logs.filter((l) => l.deliveredAt);
    const timelineMap: Record<string, number> = {};
    for (const l of deliveredLogs) {
      const hour = new Date(l.deliveredAt!).getHours();
      const key = `${hour}h`;
      timelineMap[key] = (timelineMap[key] ?? 0) + 1;
    }

    const timeline = Array.from({ length: 25 }, (_, h) => ({
      hour: `${h}h`,
      count: timelineMap[`${h}h`] ?? 0,
    })).filter((_, h) => h <= 24);

    // ── Recipients log ──
    const recipients = logs.map((l) => ({
      name: l.customer.name,
      email: l.customer.email,
      status: l.status,
      time: l.sentAt?.toLocaleString('en-IN') ?? 'Pending',
    }));

    res.json({
      id: campaign.id,
      name: campaign.name,
      channel: campaign.channel,
      segment: campaign.segment.name,
      status: campaign.status,
      launchDate: campaign.launchDate?.toISOString().split('T')[0] ?? null,
      metrics: {
        audienceSize: logs.length,
        sent,
        delivered,
        opened,
        clicked,
        converted,
        failed,
        revenue: campaign.metrics?.revenue ?? converted * 3500,
      },
      timeline,
      recipients,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;
