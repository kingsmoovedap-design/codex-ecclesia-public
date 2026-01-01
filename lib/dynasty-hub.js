const DYNASTY_PLATFORMS = {
  codexEcclesia: {
    name: 'Codex Ecclesia',
    url: '/',
    icon: '☩',
    description: 'Legal Documents & Scrolls',
  },
  dynastyDashboard: {
    name: 'Dynasty Dashboard',
    url: 'https://borders-dynasty--kingsmoovedap.replit.app',
    icon: '👑',
    description: 'Central Command Hub',
    external: true,
  },
  logistics: {
    name: 'Logistics Dynasty',
    url: '/logistics-dynasty.html',
    icon: '🚚',
    description: 'Supply Chain Platform',
  },
  treasury: {
    name: 'BSC Treasury',
    url: '/borders-sovereign-coin.html',
    icon: '🪙',
    description: 'Sovereign Coin & Wallet',
  },
  omegaPortal: {
    name: 'Omega Portal',
    url: '/omega-portal.html',
    icon: '📜',
    description: 'Document Drafting',
  },
  dashboard: {
    name: 'Dashboard',
    url: '/dashboard.html',
    icon: '📊',
    description: 'Personal Overview',
  },
};

const CODEX_API_BASE = window.location.origin;
const DYNASTY_API_BASE = 'https://borders-dynasty--kingsmoovedap.replit.app';

export async function fetchCodexStatus() {
  try {
    const response = await fetch(`${CODEX_API_BASE}/api/public/status`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Codex status:', error);
    return { status: 'unknown' };
  }
}

export async function fetchCodexStats() {
  try {
    const response = await fetch(`${CODEX_API_BASE}/api/public/stats`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Codex stats:', error);
    return { totalDocuments: 0, totalFilings: 0 };
  }
}

export async function syncToDynasty(data) {
  try {
    const response = await fetch(`${CODEX_API_BASE}/api/public/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'codex_ecclesia',
        type: data.type || 'general',
        data: data,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Sync to Dynasty failed:', error);
    return { success: false, error: error.message };
  }
}

export function createDynastyHub(options = {}) {
  const { position = 'bottom-right', collapsed = true, theme = 'gold' } = options;

  const hubContainer = document.createElement('div');
  hubContainer.id = 'dynasty-hub';
  hubContainer.className = `dynasty-hub ${position} ${collapsed ? 'collapsed' : ''} theme-${theme}`;

  hubContainer.innerHTML = `
    <style>
      #dynasty-hub {
        position: fixed;
        z-index: 9999;
        font-family: Georgia, serif;
      }
      #dynasty-hub.bottom-right { bottom: 20px; right: 20px; }
      #dynasty-hub.bottom-left { bottom: 20px; left: 20px; }
      #dynasty-hub.top-right { top: 20px; right: 20px; }
      #dynasty-hub.top-left { top: 20px; left: 20px; }
      
      .dynasty-hub-toggle {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #d4af37, #8b5a2b);
        border: 2px solid #ffd700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4);
        transition: all 0.3s ease;
      }
      .dynasty-hub-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(212, 175, 55, 0.6);
      }
      
      .dynasty-hub-menu {
        position: absolute;
        bottom: 70px;
        right: 0;
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #d4af37;
        border-radius: 12px;
        padding: 0.5rem;
        min-width: 240px;
        display: none;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      }
      #dynasty-hub:not(.collapsed) .dynasty-hub-menu { display: block; }
      
      .dynasty-hub-header {
        padding: 0.75rem;
        border-bottom: 1px solid rgba(212, 175, 55, 0.3);
        text-align: center;
        color: #d4af37;
        font-weight: bold;
        font-size: 0.9rem;
      }
      
      .dynasty-hub-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        color: #f5f5dc;
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.2s;
      }
      .dynasty-hub-item:hover {
        background: rgba(212, 175, 55, 0.2);
        color: #ffd700;
      }
      .dynasty-hub-item-icon {
        font-size: 1.25rem;
        width: 32px;
        text-align: center;
      }
      .dynasty-hub-item-info {
        flex: 1;
      }
      .dynasty-hub-item-name {
        font-weight: bold;
        font-size: 0.9rem;
      }
      .dynasty-hub-item-desc {
        font-size: 0.7rem;
        opacity: 0.7;
      }
      .dynasty-hub-external {
        font-size: 0.6rem;
        opacity: 0.5;
      }
      
      .dynasty-hub-status {
        padding: 0.5rem 0.75rem;
        border-top: 1px solid rgba(212, 175, 55, 0.3);
        margin-top: 0.25rem;
      }
      .dynasty-hub-status-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.7rem;
        color: #aaa;
        padding: 0.25rem 0;
      }
      .dynasty-hub-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #4ade80;
      }
      .dynasty-hub-status-dot.offline { background: #f87171; }
    </style>
    
    <div class="dynasty-hub-menu">
      <div class="dynasty-hub-header">Dynasty Ecosystem</div>
      ${Object.entries(DYNASTY_PLATFORMS).map(([key, platform]) => `
        <a href="${platform.url}" class="dynasty-hub-item" ${platform.external ? 'target="_blank"' : ''}>
          <span class="dynasty-hub-item-icon">${platform.icon}</span>
          <div class="dynasty-hub-item-info">
            <div class="dynasty-hub-item-name">${platform.name}</div>
            <div class="dynasty-hub-item-desc">${platform.description}</div>
          </div>
          ${platform.external ? '<span class="dynasty-hub-external">↗</span>' : ''}
        </a>
      `).join('')}
      <div class="dynasty-hub-status">
        <div class="dynasty-hub-status-row">
          <span class="dynasty-hub-status-dot"></span>
          <span>QFS-Compliant</span>
        </div>
        <div class="dynasty-hub-status-row">
          <span class="dynasty-hub-status-dot"></span>
          <span>ISO-20022</span>
        </div>
        <div class="dynasty-hub-status-row">
          <span class="dynasty-hub-status-dot"></span>
          <span>Gold-Backed</span>
        </div>
      </div>
    </div>
    
    <button class="dynasty-hub-toggle" title="Dynasty Hub">👑</button>
  `;

  const toggle = hubContainer.querySelector('.dynasty-hub-toggle');
  toggle.addEventListener('click', () => {
    hubContainer.classList.toggle('collapsed');
  });

  document.addEventListener('click', (e) => {
    if (!hubContainer.contains(e.target)) {
      hubContainer.classList.add('collapsed');
    }
  });

  document.body.appendChild(hubContainer);
  return hubContainer;
}

export function createEmbeddableWidget(type, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  switch (type) {
    case 'status':
      fetchCodexStatus().then(status => {
        container.innerHTML = `
          <div class="dynasty-widget status-widget">
            <div class="widget-header">Platform Status</div>
            <div class="widget-status ${status.status === 'operational' ? 'online' : 'offline'}">
              ${status.status === 'operational' ? 'Operational' : 'Unknown'}
            </div>
          </div>
        `;
      });
      break;

    case 'stats':
      fetchCodexStats().then(stats => {
        container.innerHTML = `
          <div class="dynasty-widget stats-widget">
            <div class="widget-header">Codex Ecclesia</div>
            <div class="widget-stats">
              <div class="stat-item">
                <span class="stat-value">${stats.totalDocuments}</span>
                <span class="stat-label">Documents</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${stats.totalFilings}</span>
                <span class="stat-label">Filings</span>
              </div>
            </div>
            <div class="widget-compliance">
              <span class="compliance-badge">QFS</span>
              <span class="compliance-badge">ISO-20022</span>
              <span class="compliance-badge">Gold-Backed</span>
            </div>
          </div>
        `;
      });
      break;

    case 'coin':
      container.innerHTML = `
        <div class="dynasty-widget coin-widget">
          <div class="widget-header">BSC Token</div>
          <div class="coin-info">
            <span class="coin-icon">🪙</span>
            <span class="coin-name">Borders Sovereign Coin</span>
          </div>
          <div class="coin-network">Sepolia Testnet</div>
          <a href="/borders-sovereign-coin.html" class="widget-link">View Details</a>
        </div>
      `;
      break;

    case 'quick-nav':
      container.innerHTML = `
        <div class="dynasty-widget nav-widget">
          <div class="widget-header">Quick Access</div>
          <div class="quick-links">
            <a href="/omega-portal.html" class="quick-link">📜 Draft Document</a>
            <a href="/dashboard.html" class="quick-link">📊 Dashboard</a>
            <a href="/logistics-dynasty.html" class="quick-link">🚚 Logistics</a>
            <a href="https://borders-dynasty--kingsmoovedap.replit.app" target="_blank" class="quick-link">👑 Dynasty Hub</a>
          </div>
        </div>
      `;
      break;
  }
}

if (typeof window !== 'undefined') {
  window.DynastyHub = {
    create: createDynastyHub,
    widget: createEmbeddableWidget,
    sync: syncToDynasty,
    fetchStatus: fetchCodexStatus,
    fetchStats: fetchCodexStats,
    platforms: DYNASTY_PLATFORMS,
  };
}
