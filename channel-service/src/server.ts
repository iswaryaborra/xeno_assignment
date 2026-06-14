import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ─── Types ────────────────────────────────────────────────────────────────────
interface Recipient {
  logId: string;
  customerId: string;
  name: string;
  email?: string;
  phone?: string;
  channelPreference?: string;
}

interface DispatchRequest {
  campaignId: string;
  channel: string;
  messageCopy: string;
  webhookUrl: string;
  recipients: Recipient[];
}

// ─── Channel-specific delivery simulation ─────────────────────────────────────
// Each channel has different simulated delivery characteristics
const CHANNEL_DELIVERY_RATES: Record<string, { delivery: number; open: number; click: number; conversion: number; minDelayMs: number; maxDelayMs: number }> = {
  WhatsApp: { delivery: 0.98, open: 0.82, click: 0.42, conversion: 0.12, minDelayMs: 500, maxDelayMs: 5000 },
  SMS: { delivery: 0.96, open: 0.74, click: 0.28, conversion: 0.07, minDelayMs: 200, maxDelayMs: 3000 },
  Email: { delivery: 0.94, open: 0.55, click: 0.25, conversion: 0.08, minDelayMs: 1000, maxDelayMs: 8000 },
  RCS: { delivery: 0.92, open: 0.65, click: 0.32, conversion: 0.09, minDelayMs: 500, maxDelayMs: 4000 },
};

function getChannelRates(channel: string) {
  return CHANNEL_DELIVERY_RATES[channel] ?? CHANNEL_DELIVERY_RATES.WhatsApp;
}

// ─── Send webhook callback to main backend ────────────────────────────────────
async function sendWebhook(webhookUrl: string, logId: string, status: string, vendorId: string) {
  try {
    await axios.post(webhookUrl, {
      logId,
      status,
      vendorId,
      timestamp: new Date().toISOString(),
    }, { timeout: 5000 });
    console.log(`  [WEBHOOK] logId=${logId} → ${status}`);
  } catch (err) {
    console.warn(`  [WEBHOOK FAILED] logId=${logId}:`, err instanceof Error ? err.message : err);
  }
}

// ─── Process a single recipient through the delivery lifecycle ────────────────
function processRecipient(recipient: Recipient, channel: string, webhookUrl: string) {
  const rates = getChannelRates(channel);
  const vendorId = `${channel.toUpperCase()}-${uuidv4().slice(0, 8).toUpperCase()}`;

  // Randomize delay within channel range
  const baseDelay = rates.minDelayMs + Math.random() * (rates.maxDelayMs - rates.minDelayMs);

  setTimeout(async () => {
    // Stage 1: SENT
    await sendWebhook(webhookUrl, recipient.logId, 'SENT', vendorId);

    // Stage 2: DELIVERED or FAILED
    const isDelivered = Math.random() < rates.delivery;
    if (!isDelivered) {
      await sendWebhook(webhookUrl, recipient.logId, 'FAILED', vendorId);
      return;
    }

    await new Promise(r => setTimeout(r, 500));
    await sendWebhook(webhookUrl, recipient.logId, 'DELIVERED', vendorId);

    // Stage 3: OPENED
    const isOpened = Math.random() < rates.open;
    if (!isOpened) return;

    await new Promise(r => setTimeout(r, 1000 + Math.random() * 3000));
    await sendWebhook(webhookUrl, recipient.logId, 'OPENED', vendorId);

    // Stage 4: CLICKED
    const isClicked = Math.random() < rates.click;
    if (!isClicked) return;

    await new Promise(r => setTimeout(r, 500 + Math.random() * 2000));
    await sendWebhook(webhookUrl, recipient.logId, 'CLICKED', vendorId);

    // Stage 5: CONVERTED
    const isConverted = Math.random() < rates.conversion;
    if (!isConverted) return;

    await new Promise(r => setTimeout(r, 2000 + Math.random() * 5000));
    await sendWebhook(webhookUrl, recipient.logId, 'CONVERTED', vendorId);

  }, baseDelay * (0.5 + Math.random())); // stagger across recipients
}

// ─── POST /dispatch ───────────────────────────────────────────────────────────
// Main dispatch endpoint — accepts campaign + recipients, simulates delivery
app.post('/dispatch', (req, res) => {
  const { campaignId, channel, messageCopy, webhookUrl, recipients } = req.body as DispatchRequest;

  if (!campaignId || !channel || !recipients?.length) {
    res.status(400).json({ error: 'campaignId, channel, and recipients[] are required' });
    return;
  }

  const effectiveWebhookUrl = webhookUrl || `${BACKEND_URL}/api/webhook/delivery`;

  console.log(`\n[CHANNEL SERVICE] Dispatching campaign ${campaignId}`);
  console.log(`  Channel: ${channel}`);
  console.log(`  Recipients: ${recipients.length}`);
  console.log(`  Webhook: ${effectiveWebhookUrl}\n`);

  // Respond immediately — processing is async
  res.json({
    accepted: recipients.length,
    campaignId,
    channel,
    message: `${recipients.length} messages queued for ${channel} delivery`,
  });

  // ── Async dispatch per recipient ──
  for (const recipient of recipients) {
    processRecipient(recipient, channel, effectiveWebhookUrl);
  }
});

// ─── GET /health ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'xeno-channel-service',
    timestamp: new Date().toISOString(),
    backendUrl: BACKEND_URL,
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n📡 Xeno Channel Service running on http://localhost:${PORT}`);
  console.log(`   Delivery webhooks → ${BACKEND_URL}/api/webhook/delivery`);
  console.log('   Channels: WhatsApp | SMS | Email | RCS\n');
});

export default app;
