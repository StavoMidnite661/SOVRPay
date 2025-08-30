// SOVR Pay Extension Popup Script

document.addEventListener('DOMContentLoaded', function() {
  console.log('🎛️ SOVR Pay Popup Loaded');
  
  // Load current settings and status
  loadExtensionStatus();
  loadWalletBalance();
  loadPaymentMix();
  loadRecentTransactions();
  
  // Set up event listeners
  setupEventListeners();
});

function loadExtensionStatus() {
  chrome.storage.sync.get(['sovrEnabled'], (result) => {
    const isEnabled = result.sovrEnabled !== false;
    updateStatusUI(isEnabled);
  });
}

function updateStatusUI(isEnabled) {
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const toggleBtn = document.getElementById('toggleExtension');
  const toggleText = document.getElementById('toggleText');
  
  if (isEnabled) {
    statusIndicator.classList.remove('disabled');
    statusText.textContent = 'Active';
    toggleBtn.classList.remove('disabled');
    toggleText.textContent = 'Disable Extension';
  } else {
    statusIndicator.classList.add('disabled');
    statusText.textContent = 'Disabled';
    toggleBtn.classList.add('disabled');
    toggleText.textContent = 'Enable Extension';
  }
}

function loadWalletBalance() {
  // Get wallet balance from background script
  chrome.runtime.sendMessage({ action: 'getWalletBalance' }, (response) => {
    if (response && response.success) {
      const balance = response.balance;
      document.getElementById('rwaBalance').textContent = `$${balance.rwaTokens.toLocaleString()}`;
      document.getElementById('sovrBalance').textContent = `$${balance.sovrCredits.toLocaleString()}`;
      document.getElementById('stakingBalance').textContent = `$${balance.stakingRewards.toLocaleString()}`;
      document.getElementById('totalBalance').textContent = `$${balance.totalAvailable.toLocaleString()}`;
    }
  });
}

function loadPaymentMix() {
  chrome.storage.sync.get(['defaultMix'], (result) => {
    const mix = result.defaultMix || { rwa: 60, sovr: 30, card: 10 };
    
    document.getElementById('rwaSlider').value = mix.rwa;
    document.getElementById('sovrSlider').value = mix.sovr;
    document.getElementById('cardSlider').value = mix.card;
    
    document.getElementById('rwaPercent').textContent = `${mix.rwa}%`;
    document.getElementById('sovrPercent').textContent = `${mix.sovr}%`;
    document.getElementById('cardPercent').textContent = `${mix.card}%`;
  });
}

function loadRecentTransactions() {
  chrome.storage.local.get(['transactions'], (result) => {
    const transactions = result.transactions || [];
    const recentTransactions = transactions.slice(-5).reverse(); // Last 5 transactions
    
    const container = document.getElementById('recentTransactions');
    
    if (recentTransactions.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: #64748b; font-size: 12px; padding: 16px;">
          No recent transactions
        </div>
      `;
      return;
    }
    
    container.innerHTML = recentTransactions.map(tx => `
      <div class="transaction-item">
        <div class="transaction-info">
          <div class="merchant">${tx.merchant || 'Unknown Merchant'}</div>
          <div class="amount">$${tx.amount.toFixed(2)}</div>
        </div>
        <div class="transaction-status">✅ ${tx.status}</div>
      </div>
    `).join('');
  });
}

function setupEventListeners() {
  // Extension toggle
  document.getElementById('toggleExtension').addEventListener('click', function() {
    chrome.storage.sync.get(['sovrEnabled'], (result) => {
      const newStatus = !(result.sovrEnabled !== false);
      chrome.storage.sync.set({ sovrEnabled: newStatus }, () => {
        updateStatusUI(newStatus);
        
        // Notify all tabs about the status change
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              action: 'extensionToggled',
              enabled: newStatus
            }).catch(() => {
              // Ignore errors for tabs that don't have content script
            });
          });
        });
      });
    });
  });

  // Payment mix sliders
  const sliders = ['rwa', 'sovr', 'card'];
  sliders.forEach(type => {
    const slider = document.getElementById(`${type}Slider`);
    const percent = document.getElementById(`${type}Percent`);
    
    slider.addEventListener('input', function() {
      const value = parseInt(this.value);
      percent.textContent = `${value}%`;
      updatePaymentMix();
    });
  });

  // Settings button
  document.getElementById('openSettings').addEventListener('click', function() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('settings.html')
    });
  });

  // Dashboard link
  document.getElementById('viewDashboard').addEventListener('click', function() {
    chrome.tabs.create({
      url: 'https://your-repl-url.replit.app' // Replace with actual Replit URL
    });
  });

  // Support link
  document.getElementById('support').addEventListener('click', function() {
    chrome.tabs.create({
      url: 'mailto:support@sovrpay.com'
    });
  });
}

function updatePaymentMix() {
  const rwa = parseInt(document.getElementById('rwaSlider').value);
  const sovr = parseInt(document.getElementById('sovrSlider').value);
  const card = parseInt(document.getElementById('cardSlider').value);
  
  // Normalize to 100%
  const total = rwa + sovr + card;
  if (total !== 100) {
    // Auto-adjust to maintain 100%
    const diff = 100 - total;
    const cardValue = Math.max(0, Math.min(100, card + diff));
    document.getElementById('cardSlider').value = cardValue;
    document.getElementById('cardPercent').textContent = `${cardValue}%`;
  }
  
  const mix = {
    rwa: parseInt(document.getElementById('rwaSlider').value),
    sovr: parseInt(document.getElementById('sovrSlider').value),
    card: parseInt(document.getElementById('cardSlider').value)
  };
  
  chrome.storage.sync.set({ defaultMix: mix });
}

// Refresh data periodically
setInterval(() => {
  loadWalletBalance();
  loadRecentTransactions();
}, 30000); // Every 30 seconds