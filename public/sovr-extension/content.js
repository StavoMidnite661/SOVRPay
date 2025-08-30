// SOVR Pay Content Script - Injects into all websites
console.log('🚀 SOVR Pay Extension Activated');

class SovrPayInjector {
  constructor() {
    this.isActive = false;
    this.detectedForms = [];
    this.wallet = {
      rwaTokens: 2588.75,
      sovrCredits: 15420.80,
      stakingRewards: 245.60
    };
    this.init();
  }

  init() {
    // Check if extension is enabled
    chrome.storage.sync.get(['sovrEnabled'], (result) => {
      this.isActive = result.sovrEnabled !== false; // Default to true
      if (this.isActive) {
        this.scanForPaymentForms();
        this.setupObserver();
      }
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.sovrEnabled) {
        this.isActive = changes.sovrEnabled.newValue;
        if (this.isActive) {
          this.scanForPaymentForms();
        } else {
          this.removeSovrElements();
        }
      }
    });
  }

  scanForPaymentForms() {
    console.log('🔍 Scanning for payment forms...');
    
    // Payment form selectors (covers most e-commerce sites)
    const paymentSelectors = [
      'input[name*="card"]',
      'input[id*="credit"]',
      'input[name*="number"]',
      'input[id*="cardnumber"]',
      'input[placeholder*="card"]',
      'input[placeholder*="4444"]',
      'form[action*="checkout"]',
      'form[action*="payment"]',
      '.payment-form',
      '#payment-method',
      '.checkout-form',
      'input[data-testid*="card"]'
    ];

    const foundElements = document.querySelectorAll(paymentSelectors.join(','));
    
    if (foundElements.length > 0) {
      console.log(`💳 Found ${foundElements.length} payment elements`);
      this.injectSovrPay(foundElements);
    }

    // Special handling for popular sites
    this.handlePopularSites();
  }

  handlePopularSites() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('amazon.')) {
      this.handleAmazon();
    } else if (hostname.includes('walmart.')) {
      this.handleWalmart();
    } else if (hostname.includes('target.')) {
      this.handleTarget();
    } else if (hostname.includes('shopify') || hostname.includes('myshopify')) {
      this.handleShopify();
    }
  }

  handleAmazon() {
    // Amazon-specific injection
    const paymentMethods = document.querySelector('#payChangeButtonId') || 
                          document.querySelector('[data-testid="payment-method"]') ||
                          document.querySelector('.pmts-portal-component');
    
    if (paymentMethods && !document.querySelector('.sovr-pay-injected')) {
      this.injectSovrButton(paymentMethods, 'amazon');
    }
  }

  handleWalmart() {
    // Walmart-specific injection  
    const paymentSection = document.querySelector('[data-automation-id="payment-section"]') ||
                          document.querySelector('.payment-method-container') ||
                          document.querySelector('[data-testid="payment-method"]');
    
    if (paymentSection && !document.querySelector('.sovr-pay-injected')) {
      this.injectSovrButton(paymentSection, 'walmart');
    }
  }

  handleTarget() {
    // Target-specific injection
    const paymentArea = document.querySelector('[data-test="payment-method"]') ||
                       document.querySelector('.payment-group') ||
                       document.querySelector('#payment');
    
    if (paymentArea && !document.querySelector('.sovr-pay-injected')) {
      this.injectSovrButton(paymentArea, 'target');
    }
  }

  handleShopify() {
    // Shopify universal injection
    const checkoutForm = document.querySelector('[data-step="payment_method"]') ||
                        document.querySelector('.payment-method-list') ||
                        document.querySelector('#checkout_payment_gateway');
    
    if (checkoutForm && !document.querySelector('.sovr-pay-injected')) {
      this.injectSovrButton(checkoutForm, 'shopify');
    }
  }

  injectSovrPay(elements) {
    elements.forEach((element, index) => {
      if (!element.closest('.sovr-pay-injected')) {
        setTimeout(() => this.injectSovrButton(element, 'generic'), index * 100);
      }
    });
  }

  injectSovrButton(targetElement, siteType = 'generic') {
    // Create SOVR Pay injection container
    const sovrContainer = document.createElement('div');
    sovrContainer.className = 'sovr-pay-injected';
    sovrContainer.innerHTML = `
      <div style="
        border: 2px solid #6366f1;
        border-radius: 8px;
        padding: 16px;
        margin: 12px 0;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="
              background: #6366f1;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              font-weight: bold;
            ">S</div>
            <h4 style="margin: 0; color: #6366f1; font-size: 16px; font-weight: 600;">
              Pay with Digital Assets
            </h4>
          </div>
          <span style="
            background: #6366f1;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
          ">SOVR Extension</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div style="text-align: center; padding: 8px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
              <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">RWA Tokens</div>
              <div style="font-weight: 600; color: #1e293b;">60%</div>
            </div>
            <div style="text-align: center; padding: 8px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
              <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">SOVR Credits</div>
              <div style="font-weight: 600; color: #1e293b;">30%</div>
            </div>
            <div style="text-align: center; padding: 8px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
              <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">Credit Card</div>
              <div style="font-weight: 600; color: #1e293b;">10%</div>
            </div>
          </div>
          
          <div style="font-size: 12px; color: #64748b; text-align: center;">
            Available: $${(this.wallet.rwaTokens + this.wallet.sovrCredits + this.wallet.stakingRewards).toLocaleString()}
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button id="sovr-pay-btn" style="
            flex: 1;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
          " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 20px rgba(99, 102, 241, 0.4)'" 
             onmouseout="this.style.transform=''; this.style.boxShadow=''">
            🚀 Pay with SOVR
          </button>
          <button style="
            padding: 12px;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            color: #6b7280;
            font-size: 12px;
          ">Adjust Mix</button>
        </div>
      </div>
    `;

    // Insert after target element
    targetElement.parentNode.insertBefore(sovrContainer, targetElement.nextSibling);

    // Add click handler
    const payButton = sovrContainer.querySelector('#sovr-pay-btn');
    payButton.addEventListener('click', () => this.handleSovrPayment(siteType));

    console.log(`✅ SOVR Pay injected into ${siteType} site`);
  }

  async handleSovrPayment(siteType) {
    console.log(`💳 Processing SOVR payment on ${siteType} site`);
    
    // Show processing overlay
    this.showProcessingOverlay();
    
    // Simulate payment processing
    await this.processPayment();
    
    // Generate virtual card
    const virtualCard = await this.generateVirtualCard();
    
    // Auto-fill form if possible
    this.autoFillPaymentForm(virtualCard);
    
    // Hide overlay
    setTimeout(() => {
      this.hideProcessingOverlay();
      alert('🎉 SOVR Payment Successful! Virtual card has been generated and payment form filled.');
    }, 3000);
  }

  showProcessingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'sovr-processing-overlay';
    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">
        <div style="
          background: white;
          padding: 32px;
          border-radius: 12px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        ">
          <div style="
            width: 48px;
            height: 48px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          "></div>
          <h3 style="margin: 0 0 16px 0; color: #1e293b;">Processing SOVR Payment</h3>
          <div id="processing-steps" style="text-align: left; space-y: 8px;">
            <div style="margin-bottom: 8px; color: #059669;">✅ Converting RWA tokens to USD</div>
            <div style="margin-bottom: 8px; color: #059669;">✅ Processing SOVR credit payment</div>
            <div style="margin-bottom: 8px; color: #2563eb;">🔄 Generating virtual card...</div>
            <div style="margin-bottom: 8px; color: #6b7280;">⏳ Auto-filling payment form...</div>
          </div>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(overlay);
  }

  hideProcessingOverlay() {
    const overlay = document.getElementById('sovr-processing-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  async processPayment() {
    // Simulate token conversion and payment processing
    return new Promise(resolve => {
      setTimeout(() => {
        const steps = document.querySelectorAll('#processing-steps div');
        if (steps[2]) steps[2].innerHTML = '✅ Virtual card generated';
        if (steps[3]) steps[3].innerHTML = '🔄 Auto-filling payment form...';
        resolve();
      }, 1500);
    });
  }

  async generateVirtualCard() {
    // Generate realistic virtual card details
    const cardNumber = '4532 1234 5678 9012';
    const expiry = '12/26';
    const cvv = '123';
    
    return { cardNumber, expiry, cvv };
  }

  autoFillPaymentForm(virtualCard) {
    // Try to find and fill payment form fields
    const cardNumberFields = document.querySelectorAll('input[name*="card"], input[id*="card"], input[placeholder*="card"]');
    const expiryFields = document.querySelectorAll('input[name*="expir"], input[id*="expir"], input[placeholder*="expir"]');
    const cvvFields = document.querySelectorAll('input[name*="cvv"], input[id*="cvc"], input[name*="security"]');

    // Fill card number
    cardNumberFields.forEach(field => {
      if (field.type !== 'hidden') {
        field.value = virtualCard.cardNumber;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Fill expiry
    expiryFields.forEach(field => {
      if (field.type !== 'hidden') {
        field.value = virtualCard.expiry;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Fill CVV
    cvvFields.forEach(field => {
      if (field.type !== 'hidden') {
        field.value = virtualCard.cvv;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    console.log('💳 Auto-filled payment form with virtual card');
  }

  setupObserver() {
    // Watch for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Delay to allow DOM to settle
          setTimeout(() => {
            if (this.isActive) {
              this.scanForPaymentForms();
            }
          }, 500);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  removeSovrElements() {
    const elements = document.querySelectorAll('.sovr-pay-injected');
    elements.forEach(el => el.remove());
  }
}

// Initialize SOVR Pay injector when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SovrPayInjector();
  });
} else {
  new SovrPayInjector();
}

// Also initialize on dynamic page changes (SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => {
      new SovrPayInjector();
    }, 1000);
  }
}).observe(document, { subtree: true, childList: true });