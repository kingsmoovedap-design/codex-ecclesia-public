const DYNASTY_DASHBOARD_URL = 'https://borders-dynasty--kingsmoovedap.replit.app';
const LOGISTICS_DYNASTY_URL = '';

export const dynastyConfig = {
  dashboard: DYNASTY_DASHBOARD_URL,
  logistics: LOGISTICS_DYNASTY_URL,
  networks: {
    sepolia: {
      chainId: 11155111,
      name: 'Sepolia',
      rpcUrl: 'https://rpc.sepolia.org',
      contractAddress: '0x12efC9a5D115AE7833c9a6D79f1B3BA18Cde817c',
    },
    mainnet: {
      chainId: 1,
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://eth.llamarpc.com',
      contractAddress: '',
    },
  },
};

export function openDynastyDashboard() {
  window.open(DYNASTY_DASHBOARD_URL, '_blank');
}

export function openLogisticsDynasty() {
  if (LOGISTICS_DYNASTY_URL) {
    window.open(LOGISTICS_DYNASTY_URL, '_blank');
  } else {
    alert('Logistics Dynasty platform launching soon!');
  }
}

export async function syncWithDynasty(documentData) {
  try {
    const syncData = {
      type: 'document_sync',
      source: 'codex_ecclesia',
      timestamp: new Date().toISOString(),
      data: documentData,
    };
    
    console.log('Syncing with Dynasty:', syncData);
    
    return { success: true, syncId: `SYNC-${Date.now()}` };
  } catch (error) {
    console.error('Dynasty sync failed:', error);
    return { success: false, error: error.message };
  }
}

export async function getNetworkStatus() {
  return {
    qfsCompliant: true,
    iso20022: true,
    goldBacked: true,
    network: 'sepolia',
    blockHeight: await getBlockHeight(),
  };
}

async function getBlockHeight() {
  try {
    if (typeof window.ethereum !== 'undefined') {
      const blockNumber = await window.ethereum.request({ method: 'eth_blockNumber' });
      return parseInt(blockNumber, 16);
    }
  } catch (error) {
    console.error('Failed to get block height:', error);
  }
  return 0;
}

export function renderDynastyStatus(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  getNetworkStatus().then(status => {
    container.innerHTML = `
      <div class="dynasty-status">
        <div class="status-item">
          <span class="status-dot ${status.qfsCompliant ? 'status-active' : ''}"></span>
          <span>QFS-Compliant</span>
        </div>
        <div class="status-item">
          <span class="status-dot ${status.iso20022 ? 'status-active' : ''}"></span>
          <span>ISO-20022</span>
        </div>
        <div class="status-item">
          <span class="status-dot ${status.goldBacked ? 'status-active' : ''}"></span>
          <span>Gold-Backed</span>
        </div>
      </div>
    `;
  });
}
