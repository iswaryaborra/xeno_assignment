import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

import customerRoutes from './routes/customers';
import segmentRoutes from './routes/segments';
import campaignRoutes from './routes/campaigns';
import analyticsRoutes from './routes/analytics';
import aiRoutes from './routes/ai';
import webhookRoutes from './routes/webhook';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/customers', customerRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/webhook', webhookRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Xeno CRM Backend running on http://localhost:${PORT}`);
  console.log(`   Channel Service expected at: ${process.env.CHANNEL_SERVICE_URL || 'http://localhost:4001'}`);
  console.log(`   Database: ${process.env.DATABASE_URL ? 'Connected' : '⚠️  DATABASE_URL not set'}`);
  console.log(`   Gemini AI: ${process.env.GEMINI_API_KEY ? 'Enabled' : 'Fallback mode (keyword simulator)'}\n`);
});

export default app;
