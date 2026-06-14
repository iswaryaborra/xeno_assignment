// AI Simulator for XENO CRM

// 1. AI Segment Builder - converts plain English to segment rules
export function parseSegmentPrompt(prompt) {
  const text = prompt.toLowerCase();
  const rules = [];
  let explanation = "AI translated rules: ";
  
  // Parse City
  if (text.includes('bangalore') || text.includes('bengaluru')) {
    rules.push({ field: 'city', operator: '=', value: 'Bangalore' });
    explanation += "City is Bangalore";
  } else if (text.includes('delhi')) {
    rules.push({ field: 'city', operator: '=', value: 'Delhi' });
    explanation += "City is Delhi";
  } else if (text.includes('mumbai') || text.includes('bombay')) {
    rules.push({ field: 'city', operator: '=', value: 'Mumbai' });
    explanation += "City is Mumbai";
  } else if (text.includes('chennai')) {
    rules.push({ field: 'city', operator: '=', value: 'Chennai' });
    explanation += "City is Chennai";
  }

  // Parse Spend
  if (text.includes('top spender') || text.includes('high value') || text.includes('spender')) {
    const minSpend = text.includes('top') ? 25000 : 15000;
    rules.push({ field: 'totalSpend', operator: '>', value: minSpend });
    explanation += (rules.length > 1 ? " AND " : "") + `Total Spend > ₹${minSpend}`;
  } else if (text.includes('spend >') || text.includes('spend greater than')) {
    const match = text.match(/spend\s*(?:>|greater than)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
    const amount = match ? parseInt(match[1]) : 10000;
    rules.push({ field: 'totalSpend', operator: '>', value: amount });
    explanation += (rules.length > 1 ? " AND " : "") + `Total Spend > ₹${amount}`;
  }

  // Parse Orders
  if (text.includes('3+ times') || text.includes('3 or more times') || text.includes('bought 3+')) {
    rules.push({ field: 'totalOrders', operator: '>=', value: 3 });
    explanation += (rules.length > 1 ? " AND " : "") + "Orders >= 3";
  } else if (text.includes('frequent') || text.includes('loyal')) {
    rules.push({ field: 'totalOrders', operator: '>=', value: 5 });
    explanation += (rules.length > 1 ? " AND " : "") + "Orders >= 5";
  } else if (text.includes('single') || text.includes('once')) {
    rules.push({ field: 'totalOrders', operator: '=', value: 1 });
    explanation += (rules.length > 1 ? " AND " : "") + "Orders = 1";
  }

  // Parse Category
  if (text.includes('sneakers') || text.includes('footwear') || text.includes('shoes')) {
    rules.push({ field: 'productCategory', operator: '=', value: 'Footwear' });
    explanation += (rules.length > 1 ? " AND " : "") + "Category is Footwear";
  } else if (text.includes('skincare') || text.includes('beauty') || text.includes('serum') || text.includes('cream')) {
    rules.push({ field: 'productCategory', operator: '=', value: 'Skincare' });
    explanation += (rules.length > 1 ? " AND " : "") + "Category is Skincare";
  } else if (text.includes('clothes') || text.includes('apparel') || text.includes('shirts') || text.includes('tee')) {
    rules.push({ field: 'productCategory', operator: '=', value: 'Apparel' });
    explanation += (rules.length > 1 ? " AND " : "") + "Category is Apparel";
  } else if (text.includes('accessories') || text.includes('handbag') || text.includes('bags') || text.includes('watch')) {
    rules.push({ field: 'productCategory', operator: '=', value: 'Accessories' });
    explanation += (rules.length > 1 ? " AND " : "") + "Category is Accessories";
  }

  // Parse Lapsed (Recency)
  if (text.includes('60 days') || text.includes('2 months')) {
    rules.push({ field: 'lastPurchase', operator: '>', value: 60 });
    explanation += (rules.length > 1 ? " AND " : "") + "Last purchase > 60 days ago";
  } else if (text.includes('90 days') || text.includes('3 months') || text.includes('lapsed')) {
    rules.push({ field: 'lastPurchase', operator: '>', value: 90 });
    explanation += (rules.length > 1 ? " AND " : "") + "Last purchase > 90 days ago";
  } else if (text.includes('active') || text.includes('recent')) {
    rules.push({ field: 'lastPurchase', operator: '<=', value: 30 });
    explanation += (rules.length > 1 ? " AND " : "") + "Last purchase <= 30 days ago";
  }

  // Default fallback if no keywords matched
  if (rules.length === 0) {
    rules.push({ field: 'totalSpend', operator: '>', value: 5000 });
    explanation = "AI generated general rule: Total Spend > ₹5,000 (no specific filters recognized)";
  }

  return { rules, explanation, logic: 'AND' };
}

// 2. AI Message Composer - generates personalized copywriting based on intent
export function generateMessageCopy(intent, channel) {
  const intentLower = intent.toLowerCase();
  
  if (channel === 'WhatsApp') {
    if (intentLower.includes('diwali') || intentLower.includes('sale') || intentLower.includes('festive')) {
      return `Hey {{first_name}}! 🪔✨\n\nCelebrate this festive season with XENO. Get *20% OFF* our premium collection. Since you last shopped with us on {{last_order_date}}, we’ve added stunning new designs.\n\nUse code *DIWALI20* at checkout.\n👉 xeno.shop/festive`;
    }
    if (intentLower.includes('lapsed') || intentLower.includes('reengage') || intentLower.includes('discount')) {
      return `Hi {{first_name}},\n\nWe miss you! 🥺 We noticed it’s been a while since your last order on {{last_order_date}}.\n\nTo welcome you back, here’s a special *15% OFF* voucher. Use *COMEBACK15* on checkout.\n\nBrowse new arrivals: xeno.shop/new`;
    }
    return `Hey {{first_name}}! 👋\n\nCheck out our latest arrivals tailored just for you. Get early access today.\n\nShop here: xeno.shop/early`;
  }
  
  if (channel === 'SMS') {
    if (intentLower.includes('lapsed') || intentLower.includes('discount') || intentLower.includes('reengage')) {
      return `Hey {{first_name}}, we miss you! Get 15% off your next purchase using code COMEBACK15. Check our latest styles: xeno.shop/new`;
    }
    return `Hey {{first_name}}! Exclusive VIP early access is now open. Shop new trends today: xeno.shop/vip`;
  }
  
  if (channel === 'Email') {
    if (intentLower.includes('diwali') || intentLower.includes('festive') || intentLower.includes('sale')) {
      return `Subject: 🪔 Exclusive 20% Off - XENO Festive Collection!

Dear {{first_name}},

Celebrate this festive season with XENO. We are thrilled to offer you early access to our Diwali Festive Drop.

As a valued shopper (your last order was on {{last_order_date}}), we're offering you an exclusive 20% discount. 

Use code **DIWALI20** at checkout.

Explore the Collection: xeno.shop/festive

Warm regards,
Team XENO`;
    }
    return `Subject: We miss you, {{first_name}}! Here is 15% off

Dear {{first_name}},

It has been a while since you last ordered with us on {{last_order_date}}. 

We've launched new skincare and apparel ranges that we think you'd love! Take 15% off your next order with code **COMEBACK15**.

Shop Now: xeno.shop/new

Best,
Team XENO`;
  }
  
  // RCS fallback
  return `Hi {{first_name}}! ⚡ Re-engage with XENO today. Get 10% off using code HELLO10 at checkout: xeno.shop/rcs`;
}

// 3. Smart Send-Time Suggestion
export function getSendTimeSuggestion(segmentName) {
  const name = (segmentName || '').toLowerCase();
  
  if (name.includes('high value') || name.includes('vip')) {
    return {
      time: 'Tuesday at 7:00 PM',
      reason: 'VIP shoppers engage best during weekday evenings after work hours (highest open rates recorded between 6:30 PM and 8:00 PM).'
    };
  }
  if (name.includes('lapsed')) {
    return {
      time: 'Sunday at 11:30 AM',
      reason: 'Lapsed shoppers show a 24% higher click-through rate when re-engaged during late Sunday morning leisure periods.'
    };
  }
  if (name.includes('new') || name.includes('joiners')) {
    return {
      time: 'Immediately (Real-Time)',
      reason: 'Welcome campaigns perform best when sent within 1 hour of customer sign-up or first purchase.'
    };
  }
  
  return {
    time: 'Thursday at 4:30 PM',
    reason: 'Mid-week afternoon send time shows the most consistent delivery-to-open efficiency across general segments.'
  };
}

// 4. AI Chat Assistant - processes natural language queries on the customer database
export function processChatQuery(query, customers) {
  const text = query.toLowerCase();
  
  // Query 1: Top spenders in Bangalore
  if (text.includes('top spender') && text.includes('bangalore')) {
    const list = customers
      .filter(c => c.city.toLowerCase() === 'bangalore')
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 5);
      
    let answer = `Here are the top 5 high-spending customers in **Bangalore**:\n\n`;
    list.forEach((c, idx) => {
      answer += `${idx + 1}. **${c.name}** - Spend: ₹${c.totalSpend.toLocaleString()} (${c.totalOrders} orders, Last purchase: ${c.lastPurchaseDate})\n`;
    });
    answer += `\nWould you like me to auto-generate a segment containing these high-value Bangalore shoppers?`;
    
    return {
      answer,
      suggestedAction: {
        label: 'Create Bangalore High Spenders Segment',
        type: 'create_segment',
        prompt: 'Bangalore top spenders spend > 20000'
      }
    };
  }
  
  // Query 2: Create a segment of customers who bought 3+ times
  if (text.includes('segment') && (text.includes('3+') || text.includes('3 or more') || text.includes('3 times'))) {
    const count = customers.filter(c => c.totalOrders >= 3).length;
    const answer = `Based on your database, there are **${count} customers** who have made 3 or more purchases.\n\nI have generated the rule set for this. You can click the button below to load this directly in the Segment Builder.`;
    
    return {
      answer,
      suggestedAction: {
        label: 'Load Segment Rules (Orders >= 3)',
        type: 'create_segment',
        prompt: 'customers who bought 3+ times'
      }
    };
  }
  
  // Query 3: Draft a WhatsApp message for a Diwali sale
  if (text.includes('draft') || text.includes('write') || text.includes('message') || text.includes('diwali')) {
    const copy = generateMessageCopy('Diwali festive sale discount', 'WhatsApp');
    const answer = `Here is a custom, high-converting WhatsApp message draft for your Diwali sale:\n\n\`\`\`text\n${copy}\n\`\`\`\n\nYou can load this directly into a new campaign draft by clicking below.`;
    
    return {
      answer,
      suggestedAction: {
        label: 'Create Diwali WhatsApp Campaign',
        type: 'create_campaign',
        channel: 'WhatsApp',
        template: copy,
        name: 'Diwali Festive Launch'
      }
    };
  }
  
  // Query 4: General metrics query
  if (text.includes('revenue') || text.includes('total spend') || text.includes('stats')) {
    const totalCustomers = customers.length;
    const totalSpendVal = customers.reduce((sum, c) => sum + c.totalSpend, 0);
    const avgSpend = Math.round(totalSpendVal / totalCustomers);
    
    return {
      answer: `Here is a quick summary of your customer base stats:\n\n` + 
              `- **Total Customer Records**: ${totalCustomers}\n` +
              `- **Accumulated Spend (GMV)**: ₹${totalSpendVal.toLocaleString()}\n` +
              `- **Average Order Value (AOV)**: ₹${Math.round(totalSpendVal / customers.reduce((sum, c) => sum + c.totalOrders, 0)).toLocaleString()}\n` +
              `- **Average Customer Lifetime Value (CLV)**: ₹${avgSpend.toLocaleString()}\n\n` +
              `Let me know if you would like me to segment these by city or purchase recency!`
    };
  }

  // Fallback
  return {
    answer: `I can help you analyze shoppers, build segments, and write high-converting copy! Try asking me:\n\n` +
            `- *"Who are my top spenders in Bangalore?"*\n` +
            `- *"Create a segment of customers who bought 3+ times"*\n` +
            `- *"Draft a WhatsApp message for a Diwali sale"*`
  };
}
