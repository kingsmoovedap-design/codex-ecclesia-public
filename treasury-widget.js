const TreasuryWidget = {
  config: null,
  provider: null,
  signer: null,
  contract: null,
  userAddress: null,

  async init() {
    try {
      const response = await fetch('treasury-config.json');
      this.config = await response.json();
      this.updateDisplay();
    } catch (error) {
      console.error('Failed to load treasury config:', error);
    }
  },

  updateDisplay() {
    const contractHash = document.getElementById('contractHash');
    const walletAddress = document.getElementById('walletAddress');
    if (contractHash) contractHash.textContent = this.config.contract.address;
    if (walletAddress) walletAddress.textContent = this.config.treasury.wallet;
  },

  async connect() {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this feature');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.config.network.chainId }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: this.config.network.chainId,
              chainName: this.config.network.name,
              rpcUrls: this.config.network.rpc,
              nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 }
            }]
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
          return;
        }
      }
    }

    try {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await this.provider.send('eth_requestAccounts', []);
      this.signer = this.provider.getSigner();
      this.userAddress = await this.signer.getAddress();

      this.contract = new ethers.Contract(
        this.config.contract.address,
        this.config.abi,
        this.signer
      );

      this.updateWalletUI();
      await this.fetchBalances();
      await this.fetchLiveContractData();
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  },

  updateWalletUI() {
    const walletStatus = document.getElementById('walletStatus');
    const connectBtn = document.getElementById('connectWalletBtn');
    const balanceDisplay = document.getElementById('walletBalanceDisplay');
    const transferSection = document.getElementById('transferSection');
    const defiSection = document.getElementById('defiSection');
    const liveData = document.getElementById('liveContractData');

    if (walletStatus) {
      walletStatus.innerHTML = `<span class="wallet-connected">Connected: ${this.userAddress.slice(0,6)}...${this.userAddress.slice(-4)}</span>`;
    }
    if (connectBtn) connectBtn.textContent = 'Connected';
    if (balanceDisplay) balanceDisplay.style.display = 'block';
    if (transferSection) transferSection.style.display = 'block';
    if (defiSection) defiSection.style.display = 'block';
    if (liveData) liveData.style.display = 'block';
  },

  async fetchBalances() {
    try {
      const ethBalance = await this.provider.getBalance(this.userAddress);
      const bscBalance = await this.contract.balanceOf(this.userAddress);

      const ethBalanceEl = document.getElementById('ethBalance');
      const walletBalance = document.getElementById('walletBalance');

      if (ethBalanceEl) ethBalanceEl.textContent = parseFloat(ethers.utils.formatEther(ethBalance)).toFixed(4) + ' ETH';
      if (walletBalance) walletBalance.textContent = parseFloat(ethers.utils.formatEther(bscBalance)).toFixed(4) + ' BSC';
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    }
  },

  async fetchLiveContractData() {
    try {
      const name = await this.contract.name();
      const symbol = await this.contract.symbol();
      const totalSupply = await this.contract.totalSupply();

      const nameEl = document.getElementById('liveCoinName');
      const symbolEl = document.getElementById('liveCoinSymbol');
      const supplyEl = document.getElementById('liveTotalSupply');

      if (nameEl) nameEl.textContent = name;
      if (symbolEl) symbolEl.textContent = symbol;
      if (supplyEl) supplyEl.textContent = parseFloat(ethers.utils.formatEther(totalSupply)).toLocaleString() + ' BSC';
    } catch (error) {
      console.error('Failed to fetch contract data:', error);
    }
  },

  async transfer() {
    const recipient = document.getElementById('transferRecipient').value;
    const amount = document.getElementById('transferAmount').value;

    if (!recipient || !amount) {
      alert('Please enter recipient address and amount');
      return;
    }

    try {
      const tx = await this.contract.transfer(recipient, ethers.utils.parseEther(amount));
      alert('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      alert('Transfer successful!');
      await this.fetchBalances();
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer failed: ' + (error.reason || error.message));
    }
  },

  async approve() {
    const spender = document.getElementById('approveSpender').value;
    const amountInput = document.getElementById('approveAmount').value;

    if (!spender) {
      alert('Please enter spender address');
      return;
    }

    let amount;
    if (!amountInput || amountInput.toLowerCase() === 'max') {
      amount = ethers.constants.MaxUint256;
    } else {
      amount = ethers.utils.parseEther(amountInput);
    }

    try {
      const tx = await this.contract.approve(spender, amount);
      alert('Approval submitted. Waiting for confirmation...');
      await tx.wait();
      alert('Approval successful!');
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Approval failed: ' + (error.reason || error.message));
    }
  },

  async checkAllowance() {
    const spender = document.getElementById('checkAllowanceSpender').value;
    const allowanceDisplay = document.getElementById('allowanceDisplay');

    if (!spender || !this.userAddress) {
      if (allowanceDisplay) allowanceDisplay.textContent = '--';
      return;
    }

    try {
      const allowance = await this.contract.allowance(this.userAddress, spender);
      if (allowanceDisplay) {
        if (allowance.eq(ethers.constants.MaxUint256)) {
          allowanceDisplay.textContent = 'Unlimited';
        } else {
          allowanceDisplay.textContent = parseFloat(ethers.utils.formatEther(allowance)).toFixed(4) + ' BSC';
        }
      }
    } catch (error) {
      console.error('Failed to check allowance:', error);
    }
  },

  copyAddress(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      navigator.clipboard.writeText(element.textContent);
      alert('Address copied to clipboard!');
    }
  },

  openEtherscan() {
    if (this.config && this.config.links) {
      window.open(this.config.links.etherscan, '_blank');
    }
  }
};

function showDefiTab(tabName) {
  document.querySelectorAll('.defi-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.defi-tab-content').forEach(content => content.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(tabName + 'Tab').classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  TreasuryWidget.init();
});

if (window.ethereum) {
  window.ethereum.on('accountsChanged', () => {
    TreasuryWidget.connect();
  });
  window.ethereum.on('chainChanged', () => {
    window.location.reload();
  });
}
