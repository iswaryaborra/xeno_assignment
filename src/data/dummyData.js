// Product Categories
export const CATEGORIES = ['Apparel', 'Footwear', 'Accessories', 'Skincare'];

// 50 Sample Customers
export const CUSTOMERS = [
  {
    id: 'CUST-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    city: 'Bangalore',
    totalOrders: 6,
    totalSpend: 24500,
    lastPurchaseDate: '2026-05-15',
    tags: ['VIP', 'Footwear', 'Frequent Buyer'],
    channelPreference: 'WhatsApp',
    campaigns: ['Diwali Festive Sneaker Drop', 'Summer Skincare Blast'],
    orders: [
      { id: 'ORD-101', date: '2026-05-15', amount: 8500, items: [{ name: 'Apex Run Sneakers', category: 'Footwear', price: 8500 }] },
      { id: 'ORD-087', date: '2026-04-10', amount: 4500, items: [{ name: 'Vibe Canvas Shoes', category: 'Footwear', price: 4500 }] },
      { id: 'ORD-062', date: '2026-02-18', amount: 3500, items: [{ name: 'Premium Leather Belt', category: 'Accessories', price: 3500 }] },
      { id: 'ORD-031', date: '2025-11-05', amount: 8000, items: [{ name: 'Chrono Gold Watch', category: 'Accessories', price: 8000 }] }
    ]
  },
  {
    id: 'CUST-002',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 91234 56789',
    city: 'Mumbai',
    totalOrders: 9,
    totalSpend: 42000,
    lastPurchaseDate: '2026-06-02',
    tags: ['VIP', 'Skincare', 'Frequent Buyer'],
    channelPreference: 'Email',
    campaigns: ['Summer Skincare Blast'],
    orders: [
      { id: 'ORD-109', date: '2026-06-02', amount: 6200, items: [{ name: 'Vitamin C Glow Serum', category: 'Skincare', price: 3200 }, { name: 'Hydrating Face Cream', category: 'Skincare', price: 3000 }] },
      { id: 'ORD-095', date: '2026-04-28', amount: 12000, items: [{ name: 'Designer Handbag', category: 'Accessories', price: 12000 }] },
      { id: 'ORD-076', date: '2026-03-05', amount: 9800, items: [{ name: 'Classic Silk Dress', category: 'Apparel', price: 9800 }] }
    ]
  },
  {
    id: 'CUST-003',
    name: 'Ishaan Verma',
    email: 'ishaan.verma@example.com',
    phone: '+91 98123 45670',
    city: 'Delhi',
    totalOrders: 2,
    totalSpend: 3200,
    lastPurchaseDate: '2026-01-10',
    tags: ['Lapsed', 'Apparel', 'Single Purchase'],
    channelPreference: 'SMS',
    campaigns: ['Cart Abandonment SMS'],
    orders: [
      { id: 'ORD-042', date: '2026-01-10', amount: 3200, items: [{ name: 'Oversized Cotton Tee', category: 'Apparel', price: 1800 }, { name: 'Classic Crew Socks', category: 'Accessories', price: 1400 }] }
    ]
  },
  {
    id: 'CUST-004',
    name: 'Ananya Rao',
    email: 'ananya.rao@example.com',
    phone: '+91 99456 78901',
    city: 'Bangalore',
    totalOrders: 12,
    totalSpend: 68000,
    lastPurchaseDate: '2026-06-12',
    tags: ['VIP', 'High Spender', 'Skincare', 'Apparel'],
    channelPreference: 'WhatsApp',
    campaigns: ['Diwali Festive Sneaker Drop', 'Summer Skincare Blast'],
    orders: [
      { id: 'ORD-115', date: '2026-06-12', amount: 15400, items: [{ name: 'Summer Linen Suit', category: 'Apparel', price: 12000 }, { name: 'Sun Barrier Cream', category: 'Skincare', price: 3400 }] },
      { id: 'ORD-100', date: '2026-05-02', amount: 8500, items: [{ name: 'Apex Run Sneakers', category: 'Footwear', price: 8500 }] },
      { id: 'ORD-080', date: '2026-03-12', amount: 14500, items: [{ name: 'Hyaluronic Serum XL', category: 'Skincare', price: 6500 }, { name: 'Designer Sunglasses', category: 'Accessories', price: 8000 }] }
    ]
  },
  {
    id: 'CUST-005',
    name: 'Aditya Nair',
    email: 'aditya.nair@example.com',
    phone: '+91 96123 78945',
    city: 'Chennai',
    totalOrders: 1,
    totalSpend: 4500,
    lastPurchaseDate: '2026-03-14',
    tags: ['Lapsed 90 Days', 'Footwear', 'Single Purchase'],
    channelPreference: 'Email',
    campaigns: ['Diwali Festive Sneaker Drop'],
    orders: [
      { id: 'ORD-071', date: '2026-03-14', amount: 4500, items: [{ name: 'Vibe Canvas Shoes', category: 'Footwear', price: 4500 }] }
    ]
  },
  {
    id: 'CUST-006',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@example.com',
    phone: '+91 97856 34120',
    city: 'Mumbai',
    totalOrders: 4,
    totalSpend: 15500,
    lastPurchaseDate: '2026-05-20',
    tags: ['Apparel', 'Accessories'],
    channelPreference: 'RCS',
    campaigns: ['Diwali Festive Sneaker Drop'],
    orders: [
      { id: 'ORD-103', date: '2026-05-20', amount: 5500, items: [{ name: 'Slim Fit Denim', category: 'Apparel', price: 3500 }, { name: 'Leather Keyring', category: 'Accessories', price: 2000 }] }
    ]
  },
  {
    id: 'CUST-007',
    name: 'Kriti Sen',
    email: 'kriti.sen@example.com',
    phone: '+91 99887 76655',
    city: 'Delhi',
    totalOrders: 3,
    totalSpend: 8200,
    lastPurchaseDate: '2026-04-05',
    tags: ['Skincare'],
    channelPreference: 'WhatsApp',
    campaigns: ['Summer Skincare Blast'],
    orders: [
      { id: 'ORD-082', date: '2026-04-05', amount: 3200, items: [{ name: 'Vitamin C Glow Serum', category: 'Skincare', price: 3200 }] }
    ]
  },
  {
    id: 'CUST-008',
    name: 'Kabir Malhotra',
    email: 'kabir.mal@example.com',
    phone: '+91 98223 34455',
    city: 'Bangalore',
    totalOrders: 7,
    totalSpend: 31000,
    lastPurchaseDate: '2026-06-10',
    tags: ['VIP', 'Footwear', 'Apparel'],
    channelPreference: 'WhatsApp',
    campaigns: ['Diwali Festive Sneaker Drop'],
    orders: [
      { id: 'ORD-112', date: '2026-06-10', amount: 8900, items: [{ name: 'Apex Run Sneakers', category: 'Footwear', price: 8900 }] }
    ]
  },
  {
    id: 'CUST-009',
    name: 'Sanya Gupta',
    email: 'sanya.g@example.com',
    phone: '+91 91776 54321',
    city: 'Delhi',
    totalOrders: 1,
    totalSpend: 1900,
    lastPurchaseDate: '2026-05-30',
    tags: ['New Joiners', 'Apparel', 'Single Purchase'],
    channelPreference: 'Email',
    campaigns: [],
    orders: [
      { id: 'ORD-108', date: '2026-05-30', amount: 1900, items: [{ name: 'Cropped Summer Top', category: 'Apparel', price: 1900 }] }
    ]
  },
  {
    id: 'CUST-010',
    name: 'Vikram Singh',
    email: 'vikram.s@example.com',
    phone: '+91 93245 67890',
    city: 'Chennai',
    totalOrders: 5,
    totalSpend: 19800,
    lastPurchaseDate: '2026-06-08',
    tags: ['Accessories', 'Footwear'],
    channelPreference: 'SMS',
    campaigns: ['Cart Abandonment SMS'],
    orders: [
      { id: 'ORD-111', date: '2026-06-08', amount: 7500, items: [{ name: 'Leather Messenger Bag', category: 'Accessories', price: 7500 }] }
    ]
  },
  // Adding 40 more customers programmatically in exports below
];

// Helper array to populate remaining 40 customers to ensure they span across Mumbai, Delhi, Bangalore, Chennai with diverse metrics
const firstNames = ['Arjun', 'Meera', 'Rishi', 'Neha', 'Dev', 'Tara', 'Rohan', 'Dia', 'Nikhil', 'Zoya', 'Kunal', 'Rhea', 'Varun', 'Alisha', 'Siddharth', 'Janhvi', 'Yash', 'Avani', 'Ranveer', 'Kiara', 'Vijay', 'Shreya', 'Manish', 'Kavya', 'Samir', 'Tanvi', 'Pranav', 'Ishita', 'Aman', 'Pooja', 'Abhishek', 'Sakshi', 'Karthik', 'Swati', 'Harsh', 'Anjali', 'Gaurav', 'Sneha', 'Vivek', 'Shruti'];
const lastNames = ['Roy', 'Iyer', 'Kapoor', 'Reddy', 'Chatterjee', 'Bose', 'Joshi', 'Choudhury', 'Fernandes', 'Deshmukh', 'Das', 'Pillai', 'Menon', 'Bhat', 'Saxena', 'Trivedi', 'Wadhwa', 'Oberoi', 'Bakshi', 'Pandey', 'Mishra', 'Grover', 'Dhillon', 'Shetty', 'Venkatesh', 'Naidu', 'Srinivasan', 'Balakrishnan', 'Dubey', 'Jha', 'Tiwari', 'Verma', 'Garg', 'Bansal', 'Singhal', 'Kulkarni', 'Patil', 'Prasad', 'Rana', 'Dutta'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'];
const preferences = ['WhatsApp', 'Email', 'SMS', 'RCS'];

for (let i = 0; i < 40; i++) {
  const name = `${firstNames[i]} ${lastNames[i]}`;
  const email = `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@example.com`;
  const phone = `+91 98${Math.floor(100 + Math.random() * 900)} ${Math.floor(10000 + Math.random() * 90000)}`;
  const city = cities[i % cities.length];
  const pref = preferences[i % preferences.length];
  
  // Create orders
  const totalOrders = (i % 7) + 1; // 1 to 7
  let totalSpend = 0;
  const orders = [];
  const activeTags = [];
  
  const purchaseGapDays = (i * 4) + 5; // varied purchase recency
  const lastPurchaseDateObj = new Date(2026, 5, 14); // reference date June 14, 2026
  lastPurchaseDateObj.setDate(lastPurchaseDateObj.getDate() - purchaseGapDays);
  const lastPurchaseDate = lastPurchaseDateObj.toISOString().split('T')[0];
  
  for (let o = 0; o < totalOrders; o++) {
    const orderDateObj = new Date(lastPurchaseDateObj);
    orderDateObj.setDate(orderDateObj.getDate() - (o * 30));
    const amount = (o + 1) * 2000 + (i * 100);
    totalSpend += amount;
    
    // Choose item based on index
    let itemCategory = CATEGORIES[o % CATEGORIES.length];
    let itemName = '';
    
    if (itemCategory === 'Apparel') {
      itemName = o % 2 === 0 ? 'Oversized Cotton Tee' : 'Slim Fit Denim';
    } else if (itemCategory === 'Footwear') {
      itemName = o % 2 === 0 ? 'Vibe Canvas Shoes' : 'Apex Run Sneakers';
    } else if (itemCategory === 'Accessories') {
      itemName = o % 2 === 0 ? 'Designer Sunglasses' : 'Premium Leather Belt';
    } else {
      itemName = o % 2 === 0 ? 'Vitamin C Glow Serum' : 'Hydrating Face Cream';
    }
    
    orders.push({
      id: `ORD-${200 + i * 10 + o}`,
      date: orderDateObj.toISOString().split('T')[0],
      amount,
      items: [{ name: itemName, category: itemCategory, price: amount }]
    });
    
    if (!activeTags.includes(itemCategory)) {
      activeTags.push(itemCategory);
    }
  }
  
  // Set tags
  if (totalSpend > 25000) activeTags.push('VIP');
  if (totalOrders >= 5) activeTags.push('Frequent Buyer');
  if (totalOrders === 1) activeTags.push('Single Purchase');
  if (purchaseGapDays > 90) activeTags.push('Lapsed 90 Days');
  else if (purchaseGapDays <= 15) activeTags.push('New Joiners');
  
  CUSTOMERS.push({
    id: `CUST-${String(11 + i).padStart(3, '0')}`,
    name,
    email,
    phone,
    city,
    totalOrders,
    totalSpend,
    lastPurchaseDate,
    tags: activeTags.slice(0, 4),
    channelPreference: pref,
    campaigns: i % 3 === 0 ? ['Summer Skincare Blast'] : (i % 3 === 1 ? ['Diwali Festive Sneaker Drop'] : []),
    orders
  });
}

// 5 Pre-Built Segments
export const PREBUILT_SEGMENTS = [
  {
    id: 'seg-1',
    name: 'High Value Customers',
    size: 14,
    createdDate: '2026-01-15',
    lastUsed: '2026-06-10',
    rules: [
      { field: 'totalSpend', operator: '>', value: 20000 }
    ],
    logic: 'AND'
  },
  {
    id: 'seg-2',
    name: 'Lapsed 90 Days',
    size: 18,
    createdDate: '2026-02-01',
    lastUsed: '2026-05-28',
    rules: [
      { field: 'lastPurchase', operator: '>', value: 90 }
    ],
    logic: 'AND'
  },
  {
    id: 'seg-3',
    name: 'New Joiners',
    size: 8,
    createdDate: '2026-05-01',
    lastUsed: '2026-06-12',
    rules: [
      { field: 'lastPurchase', operator: '<=', value: 30 },
      { field: 'totalOrders', operator: '<=', value: 2 }
    ],
    logic: 'AND'
  },
  {
    id: 'seg-4',
    name: 'Frequent Buyers',
    size: 21,
    createdDate: '2026-01-20',
    lastUsed: '2026-06-08',
    rules: [
      { field: 'totalOrders', operator: '>=', value: 4 }
    ],
    logic: 'AND'
  },
  {
    id: 'seg-5',
    name: 'Single Purchase',
    size: 12,
    createdDate: '2026-03-10',
    lastUsed: '2026-06-01',
    rules: [
      { field: 'totalOrders', operator: '=', value: 1 }
    ],
    logic: 'AND'
  }
];

// 3 Sample Campaigns with Realistic Analytics Data
export const INITIAL_CAMPAIGNS = [
  {
    id: 'camp-1',
    name: 'Summer Skincare Blast',
    segment: 'High Value Customers',
    channel: 'Email',
    status: 'Sent',
    launchDate: '2026-05-24',
    metrics: {
      audienceSize: 24,
      sent: 24,
      delivered: 23,
      opened: 19,
      clicked: 12,
      converted: 4,
      revenue: 28400
    },
    messageCopy: 'Hi {{first_name}},\n\nSummer is here! Rehydrate your skin with our best-selling Skincare range. Since your last purchase on {{last_order_date}}, we’ve launched new Hydra-Glow formulas.\n\nUse code GLOW20 for 20% off your next purchase.\n\nShop now: xeno.shop/skincare',
    recipients: [
      { name: 'Priya Patel', email: 'priya.patel@example.com', status: 'Converted', time: '2026-05-24 10:15 AM' },
      { name: 'Ananya Rao', email: 'ananya.rao@example.com', status: 'Converted', time: '2026-05-24 11:30 AM' },
      { name: 'Aarav Sharma', email: 'aarav.sharma@example.com', status: 'Opened', time: '2026-05-24 10:05 AM' },
      { name: 'Kriti Sen', email: 'kriti.sen@example.com', status: 'Clicked', time: '2026-05-24 12:45 PM' },
      { name: 'Aditya Nair', email: 'aditya.nair@example.com', status: 'Delivered', time: '2026-05-24 10:00 AM' }
    ]
  },
  {
    id: 'camp-2',
    name: 'Diwali Festive Sneaker Drop',
    segment: 'Frequent Buyers',
    channel: 'WhatsApp',
    status: 'In Progress',
    launchDate: '2026-06-14',
    metrics: {
      audienceSize: 32,
      sent: 32,
      delivered: 31,
      opened: 28,
      clicked: 16,
      converted: 3,
      revenue: 19500
    },
    messageCopy: 'Hey {{first_name}}! ⚡\n\nCelebrate this festive season in style. The Apex Run Sneaker Series is now live. Get early access and grab your pair before they sell out.\n\nClick to reveal your VIP discount: xeno.shop/festive-drop',
    recipients: [
      { name: 'Aarav Sharma', email: 'aarav.sharma@example.com', status: 'Converted', time: '2026-06-14 06:12 PM' },
      { name: 'Kabir Malhotra', email: 'kabir.mal@example.com', status: 'Clicked', time: '2026-06-14 06:05 PM' },
      { name: 'Rohan Mehta', email: 'rohan.mehta@example.com', status: 'Opened', time: '2026-06-14 06:01 PM' },
      { name: 'Vikram Singh', email: 'vikram.s@example.com', status: 'Delivered', time: '2026-06-14 06:00 PM' }
    ]
  },
  {
    id: 'camp-3',
    name: 'Cart Abandonment SMS',
    segment: 'Single Purchase',
    channel: 'SMS',
    status: 'Sent',
    launchDate: '2026-06-01',
    metrics: {
      audienceSize: 48,
      sent: 48,
      delivered: 47,
      opened: 42,
      clicked: 18,
      converted: 2,
      revenue: 5400
    },
    messageCopy: 'Hey {{first_name}}, we noticed you left something behind. Grab it now with free shipping. Use code FREESHIP at checkout. xeno.shop/cart',
    recipients: [
      { name: 'Ishaan Verma', email: 'ishaan.verma@example.com', status: 'Clicked', time: '2026-06-01 03:22 PM' },
      { name: 'Aditya Nair', email: 'aditya.nair@example.com', status: 'Opened', time: '2026-06-01 03:05 PM' }
    ]
  }
];
