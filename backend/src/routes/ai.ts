import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

// ── Gemini AI client (optional — fallback to keyword simulator if not configured) ──
let geminiModel: { generateContent: (prompt: string) => Promise<{ response: { text: () => string } }> } | null = null;

async function initGemini() {
  try {
    if (!process.env.GEMINI_API_KEY) return;
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('[AI] Gemini API initialized ✓');
  } catch (err) {
    console.warn('[AI] Gemini unavailable — using keyword fallback:', err instanceof Error ? err.message : err);
  }
}
initGemini();

// ─── Helper: call Gemini or return null ───────────────────────────────────────
async function callGemini(prompt: string): Promise<string | null> {
  if (!geminiModel) return null;
  try {
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.warn('[AI] Gemini call failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

// ─── POST /api/ai/segment ─────────────────────────────────────────────────────
// Converts natural language prompt → segment rules JSON
router.post('/segment', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body as { prompt: string };
    if (!prompt) {
      res.status(400).json({ error: 'prompt is required' });
      return;
    }

    const geminiPrompt = `You are an AI for a CRM called Xeno. 
Convert this customer segment description into a JSON rules array.

Available fields: totalSpend (number in INR), totalOrders (number), lastPurchase (days ago), city (Mumbai/Delhi/Bangalore/Chennai), productCategory (Apparel/Footwear/Accessories/Skincare)
Available operators: >, <, >=, <=, =
Logic: AND or OR

User input: "${prompt}"

Respond ONLY with valid JSON in this exact format:
{
  "rules": [{"field": "totalSpend", "operator": ">", "value": 20000}],
  "logic": "AND",
  "explanation": "Human readable explanation of the rules"
}`;

    const geminiResponse = await callGemini(geminiPrompt);

    if (geminiResponse) {
      try {
        const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          res.json(parsed);
          return;
        }
      } catch {
        // fall through to keyword fallback
      }
    }

    // ── Keyword fallback ──
    const result = parseSegmentKeywords(prompt);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// ─── POST /api/ai/message ─────────────────────────────────────────────────────
// Generates marketing message copy for a given intent + channel
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { intent, channel } = req.body as { intent: string; channel: string };
    if (!intent || !channel) {
      res.status(400).json({ error: 'intent and channel are required' });
      return;
    }

    const geminiPrompt = `You are a D2C marketing copywriter for Xeno CRM.
Write a high-converting ${channel} marketing message for the following intent: "${intent}"

Requirements:
- Use {{first_name}} for personalization
- Use {{last_order_date}} where relevant
- Keep it concise and action-oriented
- For WhatsApp: casual, emoji-friendly, under 200 chars if possible
- For SMS: very short, include a link placeholder like xeno.shop/link
- For Email: include a subject line, professional but warm
- For RCS: like SMS but with a CTA button mention

Respond with ONLY the message copy, no explanation.`;

    const geminiResponse = await callGemini(geminiPrompt);
    if (geminiResponse) {
      res.json({ copy: geminiResponse.trim() });
      return;
    }

    // ── Keyword fallback ──
    const copy = generateMessageKeyword(intent, channel);
    res.json({ copy });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
// AI chat assistant — answers questions about the customer database
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { query, context } = req.body as {
      query: string;
      context?: {
        customerCount?: number;
        totalSpend?: number;
        avgSpend?: number;
        campaignCount?: number;
      };
    };

    if (!query) {
      res.status(400).json({ error: 'query is required' });
      return;
    }

    const geminiPrompt = `You are XENO AI Copilot, an intelligent assistant for a D2C CRM platform.

Context about this business:
- Total customers: ${context?.customerCount ?? 'unknown'}
- Total GMV: ₹${context?.totalSpend?.toLocaleString() ?? 'unknown'}
- Average CLV: ₹${context?.avgSpend?.toLocaleString() ?? 'unknown'}
- Active campaigns: ${context?.campaignCount ?? 'unknown'}

The user asks: "${query}"

You can help with:
1. Explaining customer segments or analytics
2. Suggesting marketing strategies
3. Drafting campaign copy
4. Answering questions about CRM best practices

If the user wants to CREATE a segment, respond with a JSON action block at the end:
[ACTION:create_segment:{"prompt": "user intent here"}]

If the user wants to CREATE a campaign, respond with:
[ACTION:create_campaign:{"channel": "WhatsApp", "name": "campaign name", "template": "message template"}]

Keep responses concise and helpful. Use markdown formatting.`;

    const geminiResponse = await callGemini(geminiPrompt);

    if (geminiResponse) {
      // Parse any action blocks
      const actionMatch = geminiResponse.match(/\[ACTION:(\w+):(\{.*?\})\]/s);
      let suggestedAction = null;
      let cleanAnswer = geminiResponse.replace(/\[ACTION:.*?\]/s, '').trim();

      if (actionMatch) {
        try {
          const actionType = actionMatch[1];
          const actionData = JSON.parse(actionMatch[2]);
          if (actionType === 'create_segment') {
            suggestedAction = {
              type: 'create_segment',
              label: 'Open Segment Builder',
              prompt: actionData.prompt,
            };
          } else if (actionType === 'create_campaign') {
            suggestedAction = {
              type: 'create_campaign',
              label: 'Create Campaign',
              ...actionData,
            };
          }
        } catch {
          // ignore parse error
        }
      }

      res.json({ answer: cleanAnswer, suggestedAction });
      return;
    }

    // ── Keyword fallback ──
    const fallback = processChatKeyword(query);
    res.json(fallback);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// ─── Keyword-based fallbacks (same logic as frontend aiSimulator.js) ───────────

function parseSegmentKeywords(prompt: string) {
  const text = prompt.toLowerCase();
  const rules: Array<{ field: string; operator: string; value: string | number }> = [];
  let explanation = 'AI translated rules: ';

  if (text.includes('bangalore') || text.includes('bengaluru')) {
    rules.push({ field: 'city', operator: '=', value: 'Bangalore' });
    explanation += 'City is Bangalore';
  } else if (text.includes('delhi')) {
    rules.push({ field: 'city', operator: '=', value: 'Delhi' });
    explanation += 'City is Delhi';
  } else if (text.includes('mumbai')) {
    rules.push({ field: 'city', operator: '=', value: 'Mumbai' });
    explanation += 'City is Mumbai';
  } else if (text.includes('chennai')) {
    rules.push({ field: 'city', operator: '=', value: 'Chennai' });
    explanation += 'City is Chennai';
  }

  if (text.includes('top spender') || text.includes('high value')) {
    rules.push({ field: 'totalSpend', operator: '>', value: 25000 });
    explanation += (rules.length > 1 ? ' AND ' : '') + 'Total Spend > ₹25,000';
  }

  if (text.includes('frequent') || text.includes('loyal')) {
    rules.push({ field: 'totalOrders', operator: '>=', value: 5 });
    explanation += (rules.length > 1 ? ' AND ' : '') + 'Orders >= 5';
  } else if (text.includes('single') || text.includes('once')) {
    rules.push({ field: 'totalOrders', operator: '=', value: 1 });
    explanation += (rules.length > 1 ? ' AND ' : '') + 'Orders = 1';
  }

  if (text.includes('90 days') || text.includes('lapsed')) {
    rules.push({ field: 'lastPurchase', operator: '>', value: 90 });
    explanation += (rules.length > 1 ? ' AND ' : '') + 'Last purchase > 90 days ago';
  } else if (text.includes('60 days')) {
    rules.push({ field: 'lastPurchase', operator: '>', value: 60 });
    explanation += (rules.length > 1 ? ' AND ' : '') + 'Last purchase > 60 days ago';
  } else if (text.includes('recent') || text.includes('active')) {
    rules.push({ field: 'lastPurchase', operator: '<=', value: 30 });
    explanation += (rules.length > 1 ? ' AND ' : '') + 'Last purchase <= 30 days ago';
  }

  if (text.includes('footwear') || text.includes('sneaker') || text.includes('shoes')) {
    rules.push({ field: 'productCategory', operator: '=', value: 'Footwear' });
    explanation += (rules.length > 1 ? ' AND ' : '') + 'Bought Footwear';
  } else if (text.includes('skincare') || text.includes('beauty')) {
    rules.push({ field: 'productCategory', operator: '=', value: 'Skincare' });
    explanation += (rules.length > 1 ? ' AND ' : '') + 'Bought Skincare';
  }

  if (rules.length === 0) {
    rules.push({ field: 'totalSpend', operator: '>', value: 5000 });
    explanation = 'General rule: Total Spend > ₹5,000 (no specific filters detected)';
  }

  return { rules, logic: 'AND', explanation };
}

function generateMessageKeyword(intent: string, channel: string): string {
  const text = intent.toLowerCase();

  if (channel === 'WhatsApp') {
    if (text.includes('diwali') || text.includes('festive')) {
      return `Hey {{first_name}}! 🪔✨\n\nCelebrate this festive season with XENO. Get *20% OFF* our premium collection.\n\nUse code *DIWALI20* at checkout.\n👉 xeno.shop/festive`;
    }
    if (text.includes('lapsed') || text.includes('comeback') || text.includes('miss')) {
      return `Hi {{first_name}},\n\nWe miss you! 🥺 It's been a while since {{last_order_date}}.\n\nHere's a special *15% OFF* voucher. Use *COMEBACK15* at checkout.\n\nBrowse new arrivals: xeno.shop/new`;
    }
    return `Hey {{first_name}}! 👋\n\nCheck out our latest arrivals tailored just for you.\n\nShop here: xeno.shop/new`;
  }

  if (channel === 'SMS') {
    return `Hey {{first_name}}, we miss you! Get 15% off your next purchase using code COMEBACK15. Check our latest styles: xeno.shop/new`;
  }

  if (channel === 'Email') {
    return `Subject: Exclusive Offer Just For You, {{first_name}}!\n\nDear {{first_name}},\n\nAs a valued Xeno shopper, we have a special offer just for you.\n\nUse code WELCOME15 for 15% off your next order.\n\nShop Now: xeno.shop/new\n\nBest,\nTeam XENO`;
  }

  return `Hi {{first_name}}! ⚡ Get 10% off using code HELLO10 at checkout: xeno.shop/rcs`;
}

function processChatKeyword(query: string) {
  const text = query.toLowerCase();

  if (text.includes('revenue') || text.includes('stats') || text.includes('overview')) {
    return {
      answer: `Here is a quick summary:\n\n- Use the **Analytics** tab to view detailed campaign performance\n- Check the **Dashboard** for an overview of customer count, messages sent, and delivery rates\n- Every campaign you launch will show real-time conversion data here`,
    };
  }

  if (text.includes('segment')) {
    return {
      answer: `I can help you create a customer segment! Describe your target audience and I will generate the rules.\n\nExamples:\n- "Customers in Mumbai who spent over ₹20,000"\n- "Lapsed shoppers who haven't bought in 90 days"\n- "Frequent buyers with 5+ orders"`,
      suggestedAction: {
        type: 'create_segment',
        label: 'Open Segment Builder',
        prompt: query,
      },
    };
  }

  if (text.includes('campaign') || text.includes('message') || text.includes('draft')) {
    return {
      answer: `Let me draft a campaign for you! Click below to open the Campaign Creator with a pre-filled template.`,
      suggestedAction: {
        type: 'create_campaign',
        label: 'Create New Campaign',
        channel: 'WhatsApp',
        name: 'AI Generated Campaign',
        template: `Hey {{first_name}}! 👋\n\nCheck out our latest arrivals tailored just for you.\n\nShop here: xeno.shop/new`,
      },
    };
  }

  return {
    answer: `I can help you with:\n\n- 🎯 **Segment Building** — "Create a segment of high-value customers"\n- ✍️ **Message Drafting** — "Write a WhatsApp message for lapsed shoppers"\n- 📊 **Analytics** — "Show me my campaign performance"\n\nWhat would you like to do?`,
  };
}

export default router;
