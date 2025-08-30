// SOVR Pay Background Service Worker

console.log('🌐 SOVR Pay Background Service Started');

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('🎉 SOVR Pay Extension Installed');
    
    // Set default settings
    chrome.storage.sync.set({
      sovrEnabled: true,
      defaultMix: { rwa: 60, sovr: 30, card: 10 },
      autoFill: true
    });

    // Open welcome page
    chrome.tabs.create({
      url: 'popup.html'
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Background received message:', request);
  
  switch (request.action) {
    case 'generateVirtualCard':
      handleVirtualCardGeneration(request, sendResponse);
      return true; // Keep message channel open
      
    case 'processPayment':
      handlePaymentProcessing(request, sendResponse);
      return true;
      
    case 'getWalletBalance':
      getWalletBalance(sendResponse);
      return true;
      
    case 'updateSettings':
      updateSettings(request.settings, sendResponse);
      return true;
  }
});

async function handleVirtualCardGeneration(request, sendResponse) {
  try {
    console.log('💳 Generating virtual card for amount:', request.amount);
    
    // Simulate API call to SOVR Pay backend
    const virtualCard = {
      number: generateCardNumber(),
      expiry: generateExpiry(),
      cvv: generateCVV(),
      routingInfo: 'SOVR_PAY_PROCESSOR',
      amount: request.amount,
      tokenMix: request.tokenMix || { rwa: 60, sovr: 30, card: 10 },
      expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
      merchantInfo: {
        domain: request.domain,
        category: detectMerchantCategory(request.domain)
      }
    };

    // Store card details for tracking
    chrome.storage.local.set({
      [`card_${virtualCard.number.replace(/\s/g, '')}`]: virtualCard
    });

    sendResponse({ success: true, card: virtualCard });
  } catch (error) {
    console.error('❌ Virtual card generation failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handlePaymentProcessing(request, sendResponse) {
  try {
    console.log('💰 Processing SOVR payment:', request);
    
    // Simulate payment processing steps
    const steps = [
      { step: 'tokenConversion', message: 'Converting tokens to USD', delay: 800 },
      { step: 'sovrCredit', message: 'Processing SOVR credits', delay: 600 },
      { step: 'bankingRails', message: 'Routing through banking rails', delay: 900 },
      { step: 'settlement', message: 'Settlement complete', delay: 400 }
    ];

    for (const stepInfo of steps) {
      await new Promise(resolve => setTimeout(resolve, stepInfo.delay));
      
      // Send progress update
      chrome.tabs.sendMessage(request.tabId, {
        action: 'paymentProgress',
        step: stepInfo.step,
        message: stepInfo.message
      });
    }

    // Generate transaction record
    const transaction = {
      id: generateTransactionId(),
      amount: request.amount,
      timestamp: Date.now(),
      tokenMix: request.tokenMix,
      merchant: request.merchant,
      status: 'completed',
      virtualCard: request.virtualCard
    };

    // Store transaction
    chrome.storage.local.get(['transactions'], (result) => {
      const transactions = result.transactions || [];
      transactions.push(transaction);
      chrome.storage.local.set({ transactions });
    });

    sendResponse({ success: true, transaction });
  } catch (error) {
    console.error('❌ Payment processing failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function getWalletBalance(sendResponse) {
  try {
    // Simulate wallet balance fetch
    const balance = {
      rwaTokens: 2588.75,
      sovrCredits: 15420.80,
      stakingRewards: 245.60,
      totalAvailable: 18255.15,
      lastUpdated: Date.now()
    };

    sendResponse({ success: true, balance });
  } catch (error) {
    console.error('❌ Wallet balance fetch failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

function updateSettings(settings, sendResponse) {
  chrome.storage.sync.set(settings, () => {
    console.log('⚙️ Settings updated:', settings);
    sendResponse({ success: true });
  });
}

// Utility functions
function generateCardNumber() {
  // Generate realistic-looking card number (not real)
  const prefixes = ['4532', '4556', '4716', '5425', '5555'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.random().toString().slice(2, 14).padEnd(12, '0');
  return `${prefix} ${suffix.slice(0, 4)} ${suffix.slice(4, 8)} ${suffix.slice(8, 12)}`;
}

function generateExpiry() {
  const now = new Date();
  const futureMonth = (now.getMonth() + 1 + Math.floor(Math.random() * 24)) % 12 + 1;
  const futureYear = now.getFullYear() + Math.floor(Math.random() * 3) + 1;
  return `${futureMonth.toString().padStart(2, '0')}/${futureYear.toString().slice(-2)}`;
}

function generateCVV() {
  return Math.floor(Math.random() * 900 + 100).toString();
}

function generateTransactionId() {
  return 'sovr_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function detectMerchantCategory(domain) {
  const categories = {
    'amazon.': 'marketplace',
    'walmart.': 'retail',
    'target.': 'retail',
    'starbucks.': 'food_beverage',
    'shopify': 'ecommerce',
    'stripe.': 'payment_processor'
  };

  for (const [key, category] of Object.entries(categories)) {
    if (domain.includes(key)) return category;
  }
  
  return 'general';
}

// Badge management
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Update badge based on detected payment forms
    chrome.storage.sync.get(['sovrEnabled'], (result) => {
      if (result.sovrEnabled) {
        chrome.action.setBadgeText({ text: '●', tabId });
        chrome.action.setBadgeBackgroundColor({ color: '#6366f1', tabId });
      } else {
        chrome.action.setBadgeText({ text: '', tabId });
      }
    });
  }
});