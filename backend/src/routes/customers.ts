import { Router, Request, Response } from 'express';
import prisma from '../prisma/client';

const router = Router();

// Helper to normalize customer (parse tagsJson → tags array)
function normalizeCustomer(c: Record<string, unknown> & { tagsJson?: string; orders?: unknown[] }) {
  const { tagsJson, ...rest } = c;
  return {
    ...rest,
    tags: tagsJson ? JSON.parse(tagsJson as string) : [],
    orders: (c.orders as Array<Record<string, unknown>>)?.map(normalizeOrder),
  };
}

function normalizeOrder(o: Record<string, unknown>) {
  return o; // orders don't have JSON fields
}

// ─── GET /api/customers ───────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search = '',
      city,
      sortField = 'totalSpend',
      sortOrder = 'desc',
      page = '1',
      limit = '500',
    } = req.query as Record<string, string>;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    if (city && city !== 'All') where.city = city;

    const allowedSortFields = ['name', 'totalSpend', 'totalOrders', 'lastPurchaseDate', 'createdAt'];
    const orderField = allowedSortFields.includes(sortField) ? sortField : 'totalSpend';

    const [rawCustomers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { [orderField]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take,
        include: {
          orders: {
            include: { items: true },
            orderBy: { date: 'desc' },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    const customers = rawCustomers.map(c => normalizeCustomer(c as Record<string, unknown> & { tagsJson?: string; orders?: unknown[] }));
    res.json({ customers, total, page: parseInt(page), limit: take });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// ─── GET /api/customers/:id ───────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const raw = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { orders: { include: { items: true }, orderBy: { date: 'desc' } } },
    });

    if (!raw) { res.status(404).json({ error: 'Customer not found' }); return; }
    res.json(normalizeCustomer(raw as Record<string, unknown> & { tagsJson?: string; orders?: unknown[] }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// ─── POST /api/customers ──────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, city, totalOrders = 0, totalSpend = 0, lastPurchaseDate, tags = [], channelPreference = 'WhatsApp', orders = [] } = req.body;

    if (!name || !email) { res.status(400).json({ error: 'name and email are required' }); return; }

    const raw = await prisma.customer.create({
      data: {
        name, email, phone, city,
        totalOrders: parseInt(totalOrders),
        totalSpend: parseFloat(totalSpend),
        lastPurchaseDate: lastPurchaseDate ? new Date(lastPurchaseDate) : null,
        tagsJson: JSON.stringify(Array.isArray(tags) ? tags : []),
        channelPreference,
        orders: {
          create: orders.map((o: { id?: string; date: string; amount: number; items?: Array<{ name: string; category: string; price: number }> }) => ({
            externalId: o.id,
            amount: o.amount,
            date: new Date(o.date),
            items: { create: (o.items || []).map((item: { name: string; category: string; price: number }) => ({ name: item.name, category: item.category, price: item.price })) },
          })),
        },
      },
      include: { orders: { include: { items: true } } },
    });

    res.status(201).json(normalizeCustomer(raw as Record<string, unknown> & { tagsJson?: string; orders?: unknown[] }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('Unique constraint')) { res.status(409).json({ error: 'Customer with this email already exists' }); return; }
    res.status(500).json({ error: message });
  }
});

// ─── POST /api/customers/bulk ─────────────────────────────────────────────────
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { customers } = req.body as { customers: Array<{ name: string; email: string; phone?: string; city?: string; totalOrders?: number; totalSpend?: number; lastPurchaseDate?: string; tags?: string[]; channelPreference?: string }> };

    if (!Array.isArray(customers) || customers.length === 0) {
      res.status(400).json({ error: 'customers array is required' }); return;
    }

    let imported = 0; let skipped = 0;
    for (const c of customers) {
      if (!c.name || !c.email) { skipped++; continue; }
      try {
        await prisma.customer.upsert({
          where: { email: c.email },
          update: { name: c.name, phone: c.phone, city: c.city, totalOrders: c.totalOrders ?? 0, totalSpend: c.totalSpend ?? 0, lastPurchaseDate: c.lastPurchaseDate ? new Date(c.lastPurchaseDate) : null, tagsJson: JSON.stringify(c.tags ?? []), channelPreference: c.channelPreference ?? 'WhatsApp' },
          create: { name: c.name, email: c.email, phone: c.phone, city: c.city, totalOrders: c.totalOrders ?? 0, totalSpend: c.totalSpend ?? 0, lastPurchaseDate: c.lastPurchaseDate ? new Date(c.lastPurchaseDate) : null, tagsJson: JSON.stringify(c.tags ?? []), channelPreference: c.channelPreference ?? 'WhatsApp' },
        });
        imported++;
      } catch { skipped++; }
    }

    res.status(201).json({ imported, skipped });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// ─── DELETE /api/customers/:id ────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;
