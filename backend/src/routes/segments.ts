import { Router, Request, Response } from 'express';
import prisma from '../prisma/client';
import { evaluateSegmentRules, SegmentRule } from '../services/segmentService';

const router = Router();

// Normalize segment — parse rulesJson
function normalizeSegment(s: Record<string, unknown> & { rulesJson?: string }) {
  const { rulesJson, ...rest } = s;
  return { ...rest, rules: rulesJson ? JSON.parse(rulesJson as string) : [] };
}

// Normalize customer — parse tagsJson
function normalizeCustomer(c: Record<string, unknown> & { tagsJson?: string; orders?: unknown[] }) {
  const { tagsJson, ...rest } = c;
  return { ...rest, tags: tagsJson ? JSON.parse(tagsJson as string) : [] };
}

// ─── GET /api/segments ────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const raw = await prisma.segment.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(raw.map(s => normalizeSegment(s as Record<string, unknown> & { rulesJson?: string })));
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// ─── GET /api/segments/:id ────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const raw = await prisma.segment.findUnique({ where: { id: req.params.id } });
    if (!raw) { res.status(404).json({ error: 'Segment not found' }); return; }
    res.json(normalizeSegment(raw as Record<string, unknown> & { rulesJson?: string }));
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// ─── GET /api/segments/:id/customers ─────────────────────────────────────────
router.get('/:id/customers', async (req: Request, res: Response) => {
  try {
    const raw = await prisma.segment.findUnique({ where: { id: req.params.id } });
    if (!raw) { res.status(404).json({ error: 'Segment not found' }); return; }

    const rules: SegmentRule[] = JSON.parse((raw as Record<string, unknown> & { rulesJson?: string }).rulesJson || '[]');
    const logic = raw.logic as 'AND' | 'OR';

    const allRaw = await prisma.customer.findMany({ include: { orders: { include: { items: true } } } });
    const allCustomers = allRaw.map(c => ({
      ...normalizeCustomer(c as Record<string, unknown> & { tagsJson?: string; orders?: unknown[] }),
      orders: c.orders,
    }));

    const matched = evaluateSegmentRules(allCustomers as Parameters<typeof evaluateSegmentRules>[0], rules, logic);
    res.json({ customers: matched, size: matched.length });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// ─── POST /api/segments/preview ───────────────────────────────────────────────
router.post('/preview', async (req: Request, res: Response) => {
  try {
    const { rules, logic = 'AND' } = req.body as { rules: SegmentRule[]; logic: 'AND' | 'OR' };
    if (!Array.isArray(rules) || rules.length === 0) { res.json({ size: 0 }); return; }

    const allRaw = await prisma.customer.findMany({ include: { orders: { include: { items: true } } } });
    const allCustomers = allRaw.map(c => ({
      ...normalizeCustomer(c as Record<string, unknown> & { tagsJson?: string; orders?: unknown[] }),
      orders: c.orders,
    }));

    const matched = evaluateSegmentRules(allCustomers as Parameters<typeof evaluateSegmentRules>[0], rules, logic);
    res.json({ size: matched.length, customerIds: matched.map(c => c.id) });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// ─── POST /api/segments ───────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, rules, logic = 'AND' } = req.body as { name: string; rules: SegmentRule[]; logic: 'AND' | 'OR' };
    if (!name || !Array.isArray(rules) || rules.length === 0) {
      res.status(400).json({ error: 'name and rules[] are required' }); return;
    }

    const allRaw = await prisma.customer.findMany({ include: { orders: { include: { items: true } } } });
    const allCustomers = allRaw.map(c => ({
      ...normalizeCustomer(c as Record<string, unknown> & { tagsJson?: string; orders?: unknown[] }),
      orders: c.orders,
    }));
    const matched = evaluateSegmentRules(allCustomers as Parameters<typeof evaluateSegmentRules>[0], rules, logic);

    const seg = await prisma.segment.create({
      data: { name, rulesJson: JSON.stringify(rules), logic, size: matched.length },
    });

    res.status(201).json(normalizeSegment(seg as Record<string, unknown> & { rulesJson?: string }));
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// ─── DELETE /api/segments/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.segment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

export default router;
