const API_BASE = '/api';

export async function fetchApi(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export const api = {
  user: {
    get: () => fetchApi('/user'),
  },
  
  documents: {
    list: () => fetchApi('/documents'),
    get: (id) => fetchApi(`/documents/${id}`),
    create: (data) => fetchApi('/documents', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchApi(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchApi(`/documents/${id}`, { method: 'DELETE' }),
  },
  
  filings: {
    list: () => fetchApi('/filings'),
    create: (data) => fetchApi('/filings', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchApi(`/filings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  auditLogs: {
    list: () => fetchApi('/audit-logs'),
  },
  
  analytics: {
    track: (event) => fetchApi('/analytics/track', { method: 'POST', body: JSON.stringify(event) }),
    get: () => fetchApi('/analytics'),
  },
  
  wallet: {
    connect: (walletAddress, networkId) => fetchApi('/wallet/connect', { 
      method: 'POST', 
      body: JSON.stringify({ walletAddress, networkId }) 
    }),
  },
  
  blockchain: {
    verify: (hash) => fetchApi('/blockchain/verify', { method: 'POST', body: JSON.stringify({ hash }) }),
  },
};

export function trackEvent(eventType, eventName, metadata = {}) {
  api.analytics.track({
    eventType,
    eventName,
    pageUrl: window.location.pathname,
    referrer: document.referrer,
    metadata,
  }).catch(console.error);
}

export function trackPageView(url) {
  trackEvent('pageview', 'page_view', { url });
}
