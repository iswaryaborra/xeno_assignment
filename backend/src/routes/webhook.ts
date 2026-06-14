import { Router, Request, Response } from 'express';
import prisma from '../prisma/client';
import { recalculateCampaignMetrics } from './campaigns';

const router = Router();

// ─── POST /api/webhook/delivery ───────────────────────────────────────────────
// Called by Channel Service when a message delivery status changes.
// Body: { logId, status, vendorId, timestamp? }
// Status values: SENT | DELIVERED | OPENED | CLICKED | CONVERTED | FAILED
router.post('/delivery', async (req: Request, res: Response) => {
  try {
    const { logId, status, vendorId, timestamp } = req.body as {
      logId: string;
      status: string;
      vendorId?: string;
      timestamp?: string;
    };

    if (!logId || !status) {
      res.status(400).json({ error: 'logId and status are required' });
      return;
    }

    const validStatuses = ['SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'CONVERTED', 'FAILED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    // Find the log
    const log = await prisma.communicationLog.findUnique({ where: { id: logId } });
    if (!log) {
      res.status(404).json({ error: 'Communication log not found' });
      return;
    }

    const ts = timestamp ? new Date(timestamp) : new Date();
    const normalizedStatus = status.toUpperCase();

    // Update log with lifecycle timestamps
    const updateData: Record<string, unknown> = {
      status: normalizedStatus,
      vendorId: vendorId ?? log.vendorId,
    };

    if (normalizedStatus === 'SENT') updateData.sentAt = ts;
    if (normalizedStatus === 'DELIVERED') updateData.deliveredAt = ts;
    if (normalizedStatus === 'OPENED') {
      updateData.openedAt = ts;
      if (!log.deliveredAt) updateData.deliveredAt = ts; // backfill
    }
    if (normalizedStatus === 'CLICKED') {
      updateData.clickedAt = ts;
      if (!log.openedAt) updateData.openedAt = ts;
      if (!log.deliveredAt) updateData.deliveredAt = ts;
    }
    if (normalizedStatus === 'CONVERTED') {
      updateData.convertedAt = ts;
      if (!log.clickedAt) updateData.clickedAt = ts;
      if (!log.openedAt) updateData.openedAt = ts;
      if (!log.deliveredAt) updateData.deliveredAt = ts;
    }
    if (normalizedStatus === 'FAILED') updateData.failedAt = ts;

    await prisma.communicationLog.update({
      where: { id: logId },
      data: updateData,
    });

    // Recalculate campaign-level metrics
    await recalculateCampaignMetrics(log.campaignId);

    res.json({ success: true, logId, status: normalizedStatus });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// ─── GET /api/webhook/logs ────────────────────────────────────────────────────
// Debug endpoint to inspect recent webhook calls
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.query as { campaignId?: string };
    const where = campaignId ? { campaignId } : {};

    const logs = await prisma.communicationLog.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 100,
      include: {
        customer: { select: { name: true, email: true } },
        campaign: { select: { name: true, channel: true } },
      },
    });

    res.json(logs);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;
