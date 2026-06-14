// Database Seed — populates initial Xeno CRM data (SQLite compatible)
import prisma from '../prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const CUSTOMER_SEEDS = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210', city: 'Bangalore', totalOrders: 6, totalSpend: 24500, lastPurchaseDate: '2026-05-15', tags: ['VIP', 'Footwear', 'Frequent Buyer'], channelPreference: 'WhatsApp', orders: [{ externalId: 'ORD-101', date: '2026-05-15', amount: 8500, items: [{ name: 'Apex Run Sneakers', category: 'Footwear', price: 8500 }] }, { externalId: 'ORD-087', date: '2026-04-10', amount: 4500, items: [{ name: 'Vibe Canvas Shoes', category: 'Footwear', price: 4500 }] }] },
  { name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+91 91234 56789', city: 'Mumbai', totalOrders: 9, totalSpend: 42000, lastPurchaseDate: '2026-06-02', tags: ['VIP', 'Skincare', 'Frequent Buyer'], channelPreference: 'Email', orders: [{ externalId: 'ORD-109', date: '2026-06-02', amount: 6200, items: [{ name: 'Vitamin C Glow Serum', category: 'Skincare', price: 3200 }, { name: 'Hydrating Face Cream', category: 'Skincare', price: 3000 }] }] },
  { name: 'Ishaan Verma', email: 'ishaan.verma@example.com', phone: '+91 98123 45670', city: 'Delhi', totalOrders: 2, totalSpend: 3200, lastPurchaseDate: '2026-01-10', tags: ['Lapsed', 'Apparel'], channelPreference: 'SMS', orders: [{ externalId: 'ORD-042', date: '2026-01-10', amount: 3200, items: [{ name: 'Oversized Cotton Tee', category: 'Apparel', price: 1800 }] }] },
  { name: 'Ananya Rao', email: 'ananya.rao@example.com', phone: '+91 99456 78901', city: 'Bangalore', totalOrders: 12, totalSpend: 68000, lastPurchaseDate: '2026-06-12', tags: ['VIP', 'High Spender', 'Skincare', 'Apparel'], channelPreference: 'WhatsApp', orders: [{ externalId: 'ORD-115', date: '2026-06-12', amount: 15400, items: [{ name: 'Summer Linen Suit', category: 'Apparel', price: 12000 }, { name: 'Sun Barrier Cream', category: 'Skincare', price: 3400 }] }] },
  { name: 'Aditya Nair', email: 'aditya.nair@example.com', phone: '+91 96123 78945', city: 'Chennai', totalOrders: 1, totalSpend: 4500, lastPurchaseDate: '2026-03-14', tags: ['Lapsed 90 Days', 'Footwear', 'Single Purchase'], channelPreference: 'Email', orders: [{ externalId: 'ORD-071', date: '2026-03-14', amount: 4500, items: [{ name: 'Vibe Canvas Shoes', category: 'Footwear', price: 4500 }] }] },
  { name: 'Rohan Mehta', email: 'rohan.mehta@example.com', phone: '+91 97856 34120', city: 'Mumbai', totalOrders: 4, totalSpend: 15500, lastPurchaseDate: '2026-05-20', tags: ['Apparel', 'Accessories'], channelPreference: 'RCS', orders: [{ externalId: 'ORD-103', date: '2026-05-20', amount: 5500, items: [{ name: 'Slim Fit Denim', category: 'Apparel', price: 3500 }, { name: 'Leather Keyring', category: 'Accessories', price: 2000 }] }] },
  { name: 'Kriti Sen', email: 'kriti.sen@example.com', phone: '+91 99887 76655', city: 'Delhi', totalOrders: 3, totalSpend: 8200, lastPurchaseDate: '2026-04-05', tags: ['Skincare'], channelPreference: 'WhatsApp', orders: [{ externalId: 'ORD-082', date: '2026-04-05', amount: 3200, items: [{ name: 'Vitamin C Glow Serum', category: 'Skincare', price: 3200 }] }] },
  { name: 'Kabir Malhotra', email: 'kabir.mal@example.com', phone: '+91 98223 34455', city: 'Bangalore', totalOrders: 7, totalSpend: 31000, lastPurchaseDate: '2026-06-10', tags: ['VIP', 'Footwear', 'Apparel'], channelPreference: 'WhatsApp', orders: [{ externalId: 'ORD-112', date: '2026-06-10', amount: 8900, items: [{ name: 'Apex Run Sneakers', category: 'Footwear', price: 8900 }] }] },
  { name: 'Sanya Gupta', email: 'sanya.g@example.com', phone: '+91 91776 54321', city: 'Delhi', totalOrders: 1, totalSpend: 1900, lastPurchaseDate: '2026-05-30', tags: ['New Joiners', 'Apparel', 'Single Purchase'], channelPreference: 'Email', orders: [{ externalId: 'ORD-108', date: '2026-05-30', amount: 1900, items: [{ name: 'Cropped Summer Top', category: 'Apparel', price: 1900 }] }] },
  { name: 'Vikram Singh', email: 'vikram.s@example.com', phone: '+91 93245 67890', city: 'Chennai', totalOrders: 5, totalSpend: 19800, lastPurchaseDate: '2026-06-08', tags: ['Accessories', 'Footwear'], channelPreference: 'SMS', orders: [{ externalId: 'ORD-111', date: '2026-06-08', amount: 7500, items: [{ name: 'Leather Messenger Bag', category: 'Accessories', price: 7500 }] }] },
];

// Generate 40 more customers
const firstNames = ['Arjun','Meera','Rishi','Neha','Dev','Tara','Rohan','Dia','Nikhil','Zoya','Kunal','Rhea','Varun','Alisha','Siddharth','Janhvi','Yash','Avani','Ranveer','Kiara','Vijay','Shreya','Manish','Kavya','Samir','Tanvi','Pranav','Ishita','Aman','Pooja','Abhishek','Sakshi','Karthik','Swati','Harsh','Anjali','Gaurav','Sneha','Vivek','Shruti'];
const lastNames = ['Roy','Iyer','Kapoor','Reddy','Chatterjee','Bose','Joshi','Choudhury','Fernandes','Deshmukh','Das','Pillai','Menon','Bhat','Saxena','Trivedi','Wadhwa','Oberoi','Bakshi','Pandey','Mishra','Grover','Dhillon','Shetty','Venkatesh','Naidu','Srinivasan','Balakrishnan','Dubey','Jha','Tiwari','Verma','Garg','Bansal','Singhal','Kulkarni','Patil','Prasad','Rana','Dutta'];
const cities = ['Mumbai','Delhi','Bangalore','Chennai'];
const preferences = ['WhatsApp','Email','SMS','RCS'];
const CATEGORIES = ['Apparel','Footwear','Accessories','Skincare'];

for (let i = 0; i < 40; i++) {
  const totalOrders = (i % 7) + 1;
  const purchaseGapDays = (i * 4) + 5;
  const lastPurchaseDateObj = new Date(2026, 5, 14);
  lastPurchaseDateObj.setDate(lastPurchaseDateObj.getDate() - purchaseGapDays);
  const lastPurchaseDate = lastPurchaseDateObj.toISOString().split('T')[0];
  let totalSpend = 0;
  const orders: Array<{externalId:string; date:string; amount:number; items:Array<{name:string; category:string; price:number}>}> = [];
  const activeTags: string[] = [];

  for (let o = 0; o < totalOrders; o++) {
    const orderDateObj = new Date(lastPurchaseDateObj);
    orderDateObj.setDate(orderDateObj.getDate() - (o * 30));
    const amount = (o + 1) * 2000 + (i * 100);
    totalSpend += amount;
    const cat = CATEGORIES[o % CATEGORIES.length];
    const itemName = o % 2 === 0 ? (cat==='Apparel'?'Oversized Cotton Tee':cat==='Footwear'?'Vibe Canvas Shoes':cat==='Accessories'?'Designer Sunglasses':'Vitamin C Glow Serum') : (cat==='Apparel'?'Slim Fit Denim':cat==='Footwear'?'Apex Run Sneakers':cat==='Accessories'?'Premium Leather Belt':'Hydrating Face Cream');
    orders.push({ externalId: `ORD-${200+i*10+o}`, date: orderDateObj.toISOString().split('T')[0], amount, items: [{ name: itemName, category: cat, price: amount }] });
    if (!activeTags.includes(cat)) activeTags.push(cat);
  }
  if (totalSpend > 25000) activeTags.push('VIP');
  if (totalOrders >= 5) activeTags.push('Frequent Buyer');
  if (totalOrders === 1) activeTags.push('Single Purchase');
  if (purchaseGapDays > 90) activeTags.push('Lapsed 90 Days');
  else if (purchaseGapDays <= 15) activeTags.push('New Joiners');

  CUSTOMER_SEEDS.push({
    name: `${firstNames[i]} ${lastNames[i]}`,
    email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@example.com`,
    phone: `+91 98${(100+(i*111)%900)} ${(10000+(i*4321)%90000)}`,
    city: cities[i % cities.length],
    totalOrders, totalSpend, lastPurchaseDate,
    tags: activeTags.slice(0, 4),
    channelPreference: preferences[i % preferences.length],
    orders,
  });
}

async function main() {
  console.log('\n🌱 Seeding Xeno CRM SQLite database...\n');

  // ── Seed Customers ──
  console.log('→ Seeding customers...');
  let customerCount = 0;
  for (const c of CUSTOMER_SEEDS) {
    try {
      await prisma.customer.upsert({
        where: { email: c.email },
        update: { name: c.name, phone: c.phone, city: c.city, totalOrders: c.totalOrders, totalSpend: c.totalSpend, lastPurchaseDate: new Date(c.lastPurchaseDate), tagsJson: JSON.stringify(c.tags), channelPreference: c.channelPreference },
        create: {
          name: c.name, email: c.email, phone: c.phone, city: c.city, totalOrders: c.totalOrders, totalSpend: c.totalSpend, lastPurchaseDate: new Date(c.lastPurchaseDate), tagsJson: JSON.stringify(c.tags), channelPreference: c.channelPreference,
          orders: {
            create: c.orders.map(o => ({
              externalId: o.externalId, amount: o.amount, date: new Date(o.date),
              items: { create: o.items.map(item => ({ name: item.name, category: item.category, price: item.price })) },
            })),
          },
        },
      });
      customerCount++;
      process.stdout.write(`\r   Seeded: ${customerCount} customers`);
    } catch { /* skip */ }
  }
  console.log(`\n   ✓ ${customerCount} customers seeded`);

  // ── Seed Segments ──
  console.log('\n→ Seeding segments...');
  const segDefs = [
    { name: 'High Value Customers', rules: [{ field: 'totalSpend', operator: '>', value: 20000 }], logic: 'AND' },
    { name: 'Lapsed 90 Days', rules: [{ field: 'lastPurchase', operator: '>', value: 90 }], logic: 'AND' },
    { name: 'New Joiners', rules: [{ field: 'lastPurchase', operator: '<=', value: 30 }, { field: 'totalOrders', operator: '<=', value: 2 }], logic: 'AND' },
    { name: 'Frequent Buyers', rules: [{ field: 'totalOrders', operator: '>=', value: 4 }], logic: 'AND' },
    { name: 'Single Purchase', rules: [{ field: 'totalOrders', operator: '=', value: 1 }], logic: 'AND' },
  ];
  const seededSegments: Record<string, string> = {};
  for (const s of segDefs) {
    const existing = await prisma.segment.findFirst({ where: { name: s.name } });
    if (!existing) {
      const seg = await prisma.segment.create({ data: { name: s.name, rulesJson: JSON.stringify(s.rules), logic: s.logic, size: 0, lastUsed: new Date() } });
      seededSegments[s.name] = seg.id;
    } else { seededSegments[s.name] = existing.id; }
  }
  console.log(`   ✓ ${segDefs.length} segments seeded`);

  // ── Seed Campaigns ──
  console.log('\n→ Seeding campaigns...');
  const campDefs = [
    { name: 'Summer Skincare Blast', segmentName: 'High Value Customers', channel: 'Email', status: 'Sent', launchDate: '2026-05-24', messageCopy: 'Hi {{first_name}},\n\nSummer is here! Use code GLOW20 for 20% off your next skincare purchase.\n\nShop now: xeno.shop/skincare', metrics: { audienceSize: 24, sent: 24, delivered: 23, opened: 19, clicked: 12, converted: 4, revenue: 28400 } },
    { name: 'Diwali Festive Sneaker Drop', segmentName: 'Frequent Buyers', channel: 'WhatsApp', status: 'Sent', launchDate: '2026-06-14', messageCopy: 'Hey {{first_name}}! ⚡\n\nCelebrate this festive season in style. Click to reveal your VIP discount: xeno.shop/festive-drop', metrics: { audienceSize: 32, sent: 32, delivered: 31, opened: 28, clicked: 16, converted: 3, revenue: 19500 } },
    { name: 'Cart Abandonment SMS', segmentName: 'Single Purchase', channel: 'SMS', status: 'Sent', launchDate: '2026-06-01', messageCopy: 'Hey {{first_name}}, we noticed you left something behind. Grab it now with free shipping. Use code FREESHIP at checkout. xeno.shop/cart', metrics: { audienceSize: 48, sent: 48, delivered: 47, opened: 42, clicked: 18, converted: 2, revenue: 5400 } },
  ];

  for (const camp of campDefs) {
    const segmentId = seededSegments[camp.segmentName];
    if (!segmentId) continue;
    const existing = await prisma.campaign.findFirst({ where: { name: camp.name } });
    if (!existing) {
      const campaign = await prisma.campaign.create({ data: { name: camp.name, segmentId, channel: camp.channel, messageCopy: camp.messageCopy, status: camp.status, launchDate: new Date(camp.launchDate) } });
      await prisma.campaignMetrics.create({ data: { campaignId: campaign.id, ...camp.metrics } });

      // Sample communication logs
      const sampleRecipients = [
        { email: 'priya.patel@example.com', status: 'CONVERTED' },
        { email: 'ananya.rao@example.com', status: 'CONVERTED' },
        { email: 'aarav.sharma@example.com', status: 'OPENED' },
        { email: 'kriti.sen@example.com', status: 'CLICKED' },
        { email: 'aditya.nair@example.com', status: 'DELIVERED' },
      ];
      for (const r of sampleRecipients) {
        const cust = await prisma.customer.findUnique({ where: { email: r.email } });
        if (!cust) continue;
        try {
          await prisma.communicationLog.create({ data: { campaignId: campaign.id, customerId: cust.id, channel: camp.channel, status: r.status, sentAt: new Date(camp.launchDate), deliveredAt: ['DELIVERED','OPENED','CLICKED','CONVERTED'].includes(r.status) ? new Date(camp.launchDate) : null, openedAt: ['OPENED','CLICKED','CONVERTED'].includes(r.status) ? new Date(camp.launchDate) : null, clickedAt: ['CLICKED','CONVERTED'].includes(r.status) ? new Date(camp.launchDate) : null, convertedAt: r.status==='CONVERTED' ? new Date(camp.launchDate) : null } });
        } catch { /* skip */ }
      }
    }
  }
  console.log(`   ✓ ${campDefs.length} campaigns seeded\n`);
  console.log('✅ Database seeded successfully!\n');
}

main().catch(e => { console.error('❌ Seed error:', e); process.exit(1); }).finally(() => prisma.$disconnect());
