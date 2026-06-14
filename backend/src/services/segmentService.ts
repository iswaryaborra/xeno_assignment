// Segment rule evaluator — mirrors the frontend Segments.jsx logic
// but runs against real Prisma Customer objects with nested orders

export interface SegmentRule {
  field: 'totalSpend' | 'totalOrders' | 'lastPurchase' | 'city' | 'productCategory';
  operator: '>' | '<' | '>=' | '<=' | '=';
  value: string | number;
}

interface CustomerWithOrders {
  id: string;
  totalSpend: number;
  totalOrders: number;
  lastPurchaseDate: Date | null;
  city: string | null;
  orders: Array<{
    items: Array<{
      category: string;
    }>;
  }>;
  [key: string]: unknown;
}

const REFERENCE_DATE = new Date(); // Today

function evaluateRule(customer: CustomerWithOrders, rule: SegmentRule): boolean {
  const { field, operator, value } = rule;

  let customerValue: number | string;

  switch (field) {
    case 'totalSpend':
      customerValue = customer.totalSpend;
      break;
    case 'totalOrders':
      customerValue = customer.totalOrders;
      break;
    case 'lastPurchase': {
      if (!customer.lastPurchaseDate) return false;
      const diffMs = Math.abs(REFERENCE_DATE.getTime() - new Date(customer.lastPurchaseDate).getTime());
      customerValue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      break;
    }
    case 'city':
      customerValue = (customer.city ?? '').toLowerCase();
      return customerValue === String(value).toLowerCase();
    case 'productCategory': {
      const categories = customer.orders.flatMap((o) => o.items.map((i) => i.category.toLowerCase()));
      return categories.includes(String(value).toLowerCase());
    }
    default:
      return false;
  }

  const numCustomerValue = parseFloat(String(customerValue));
  const numValue = parseFloat(String(value));

  switch (operator) {
    case '>': return numCustomerValue > numValue;
    case '<': return numCustomerValue < numValue;
    case '>=': return numCustomerValue >= numValue;
    case '<=': return numCustomerValue <= numValue;
    case '=': return numCustomerValue === numValue;
    default: return false;
  }
}

export function evaluateSegmentRules<T extends CustomerWithOrders>(
  customers: T[],
  rules: SegmentRule[],
  logic: 'AND' | 'OR' = 'AND'
): T[] {
  if (!rules || rules.length === 0) return [];

  return customers.filter((customer) => {
    const results = rules.map((rule) => evaluateRule(customer, rule));
    return logic === 'AND'
      ? results.every(Boolean)
      : results.some(Boolean);
  });
}
