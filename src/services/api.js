// Frontend API Service — wraps all backend calls
// Vite proxy routes /api/* → http://localhost:3001 in development

const BASE_URL = ''  // Empty = use Vite proxy (relative URLs)

// ─── Generic fetch helper ─────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorBody.error || `API error ${response.status}`);
  }

  return response.json();
}

// ─── Customers ────────────────────────────────────────────────────────────────
export const customersApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/customers${qs ? `?${qs}` : ''}`);
  },

  getById: (id) => apiFetch(`/api/customers/${id}`),

  create: (data) => apiFetch('/api/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Bulk import (CSV → JSON array)
  bulkImport: (customers) => apiFetch('/api/customers/bulk', {
    method: 'POST',
    body: JSON.stringify({ customers }),
  }),

  update: (id, data) => apiFetch(`/api/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiFetch(`/api/customers/${id}`, { method: 'DELETE' }),
};

// ─── Segments ─────────────────────────────────────────────────────────────────
export const segmentsApi = {
  getAll: () => apiFetch('/api/segments'),

  getById: (id) => apiFetch(`/api/segments/${id}`),

  // Real-time preview without saving
  preview: (rules, logic = 'AND') => apiFetch('/api/segments/preview', {
    method: 'POST',
    body: JSON.stringify({ rules, logic }),
  }),

  create: (data) => apiFetch('/api/segments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiFetch(`/api/segments/${id}`, { method: 'DELETE' }),

  getCustomers: (id) => apiFetch(`/api/segments/${id}/customers`),
};

// ─── Campaigns ────────────────────────────────────────────────────────────────
export const campaignsApi = {
  getAll: () => apiFetch('/api/campaigns'),

  getById: (id) => apiFetch(`/api/campaigns/${id}`),

  create: (data) => apiFetch('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  launch: (id) => apiFetch(`/api/campaigns/${id}/launch`, {
    method: 'POST',
  }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getOverview: () => apiFetch('/api/analytics/overview'),

  getCampaign: (id) => apiFetch(`/api/analytics/campaigns/${id}`),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiApi = {
  parseSegment: (prompt) => apiFetch('/api/ai/segment', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  }),

  generateMessage: (intent, channel) => apiFetch('/api/ai/message', {
    method: 'POST',
    body: JSON.stringify({ intent, channel }),
  }),

  chat: (query, context = {}) => apiFetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ query, context }),
  }),
};

// ─── Health check ─────────────────────────────────────────────────────────────
export const checkBackend = () => apiFetch('/health').catch(() => null);
