import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { SystemMetrics } from '@shared/schema';

export function BrowserExtension() {
  const [isExtensionActive, setIsExtensionActive] = useState(false);
  const [detectedForms, setDetectedForms] = useState(0);
  const [mockWebsite, setMockWebsite] = useState('amazon');
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState({ rwa: 60, sovr: 30, card: 10 });
  const [showMixAdjustment, setShowMixAdjustment] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState<SystemMetrics | null>(null);
  const { lastMessage } = useWebSocket('/ws');

  const { data: metrics } = useQuery<SystemMetrics>({
    queryKey: ['/api/metrics'],
  });

  useEffect(() => {
    if (lastMessage?.type === 'metrics') {
      setLiveMetrics(lastMessage.data);
    }
  }, [lastMessage]);

  const currentMetrics = liveMetrics || metrics;

  const downloadExtension = async () => {
    try {
      // Use the API endpoint for reliable download
      const response = await fetch('/api/download-extension');
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sovr-pay-extension.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show installation instructions
      alert(`📦 Extension downloaded successfully! 

To install:
1. Extract the ZIP file to a folder on your computer
2. Open Chrome and go to chrome://extensions/
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked extension"
5. Select the extracted "sovr-extension" folder
6. The SOVR Pay extension will appear in your toolbar!

Then visit any shopping site (Amazon, Walmart, etc.) and watch the magic happen! ✨

The extension will automatically detect checkout forms and inject SOVR Pay options.`);
    } catch (error) {
      console.error('Download error:', error);
      alert('❌ Download failed. Please try again or contact support.');
    }
  };

  // Simulate form detection
  useEffect(() => {
    if (isExtensionActive) {
      const interval = setInterval(() => {
        setDetectedForms(prev => Math.min(prev + 1, 5));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isExtensionActive]);

  const websites = [
    { id: 'amazon', name: 'Amazon', icon: 'fab fa-amazon', color: 'bg-orange-600' },
    { id: 'walmart', name: 'Walmart', icon: 'fas fa-shopping-cart', color: 'bg-blue-600' },
    { id: 'target', name: 'Target', icon: 'fas fa-bullseye', color: 'bg-red-600' },
    { id: 'shopify', name: 'Shopify Store', icon: 'fab fa-shopify', color: 'bg-green-600' },
    { id: 'ebay', name: 'eBay', icon: 'fab fa-ebay', color: 'bg-purple-600' }
  ];

  const extensionFeatures = [
    {
      title: 'Universal Form Detection',
      description: 'Automatically detects payment forms on ANY website',
      icon: 'fas fa-search',
      code: `// Extension scans for payment forms
const paymentSelectors = [
  'input[name*="card"]',
  'input[id*="credit"]', 
  'form[action*="checkout"]',
  '.payment-form',
  '#payment-method'
];

document.querySelectorAll(paymentSelectors.join(','))
  .forEach(form => injectSovrButton(form));`
    },
    {
      title: 'Virtual Card Generation',
      description: 'Creates virtual card numbers that route through SOVR Pay',
      icon: 'fas fa-credit-card',
      code: `// Generate virtual card for any purchase
const generateVirtualCard = async (amount, tokens) => {
  const response = await sovrAPI.createVirtualCard({
    amount,
    tokenMix: tokens,
    merchantCategory: detectMerchant(),
    expiresIn: '1hour'
  });
  
  return {
    number: response.cardNumber, // 4532 1234 5678 9012
    expiry: response.expiry,     // 12/26
    cvv: response.cvv,          // 123
    routesTo: 'SOVR_PAY_PROCESSOR'
  };
};`
    },
    {
      title: 'Payment Overlay Injection',
      description: 'Shows token payment options without merchant integration',
      icon: 'fas fa-layer-group',
      code: `// Inject payment overlay on checkout pages
const injectPaymentOverlay = () => {
  const overlay = document.createElement('div');
  overlay.innerHTML = \`
    <div class="sovr-pay-overlay">
      <h3>Pay with Digital Assets</h3>
      <div class="token-selector">
        <label>RWA Tokens: 60%</label>
        <label>SOVR Credits: 30%</label>
        <label>Credit Card: 10%</label>
      </div>
      <button onclick="processWithSovr()">
        Use SOVR Pay
      </button>
    </div>
  \`;
  document.body.appendChild(overlay);
};`
    },
    {
      title: 'Real-time Settlement',
      description: 'Processes mixed payments instantly through banking rails',
      icon: 'fas fa-bolt',
      code: `// Real-time payment processing
const processPayment = async (formData) => {
  // 1. Convert tokens to fiat instantly
  const conversion = await convertTokensToUSD(selectedTokens);
  
  // 2. Generate virtual card with exact amount
  const virtualCard = await generateVirtualCard(
    formData.amount,
    conversion
  );
  
  // 3. Auto-fill merchant's form
  fillPaymentForm({
    cardNumber: virtualCard.number,
    expiry: virtualCard.expiry,
    cvv: virtualCard.cvv
  });
  
  // 4. Submit form - merchant sees normal card payment
  document.querySelector('#checkout-form').submit();
};`
    }
  ];

  const mockCheckoutForm = {
    amazon: {
      product: 'Echo Dot (5th Gen)',
      price: 49.99,
      fields: ['Card Number', 'Expiry Date', 'CVV', 'Name on Card', 'Billing Address']
    },
    walmart: {
      product: 'Grocery Cart',
      price: 87.42,
      fields: ['Card Number', 'Expiration', 'Security Code', 'Cardholder Name']
    },
    target: {
      product: 'Goodfellow T-Shirt',
      price: 12.99,
      fields: ['Payment Method', 'Card Details', 'Billing Info']
    },
    shopify: {
      product: 'Premium Widget',
      price: 129.00,
      fields: ['Credit Card', 'Expiry', 'CVC', 'Name']
    },
    ebay: {
      product: 'Vintage Collectible',
      price: 234.50,
      fields: ['Payment Details', 'Card Information']
    }
  };

  const currentSite = mockCheckoutForm[mockWebsite as keyof typeof mockCheckoutForm];

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">SOVR Pay Browser Extension</h1>
          <p className="text-xl text-muted-foreground">
            Universal payment injection - use your tokens on ANY website, just like Privacy.com
          </p>
        </div>

        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="features">How It Works</TabsTrigger>
            <TabsTrigger value="installation">Install Extension</TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Extension Control Panel */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Extension Control</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Extension Status</Label>
                      <Button
                        variant={isExtensionActive ? "destructive" : "default"}
                        size="sm"
                        onClick={() => {
                          setIsExtensionActive(!isExtensionActive);
                          if (!isExtensionActive) setDetectedForms(0);
                        }}
                        data-testid="toggle-extension"
                      >
                        {isExtensionActive ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                    
                    {isExtensionActive && (
                      <>
                        <div className="text-sm">
                          <span className="text-green-500">● Active</span> - Scanning for payment forms
                        </div>
                        <div className="text-sm">
                          Forms detected: <span className="font-semibold">{detectedForms}</span>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div>
                      <Label>Test Website</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {websites.map((site) => (
                          <Button
                            key={site.id}
                            variant={mockWebsite === site.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMockWebsite(site.id)}
                            className="text-xs"
                          >
                            <i className={`${site.icon} mr-1`}></i>
                            {site.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Digital Wallet */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Your Wallet</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {currentMetrics ? (
                      <>
                        <div className="flex justify-between">
                          <span>RWA Tokens:</span>
                          <span className="font-medium">${(currentMetrics.transactionVolume * 0.01).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SOVR Credits:</span>
                          <span className="font-medium">${(currentMetrics.transactionVolume * 0.15).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Staking Rewards:</span>
                          <span className="font-medium text-green-500">${(currentMetrics.transactionVolume * 0.002).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Available for Spending:</span>
                          <span className="font-bold text-primary">${(currentMetrics.transactionVolume * 0.162).toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>RWA Tokens:</span>
                          <span className="font-medium">$0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SOVR Credits:</span>
                          <span className="font-medium">$0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Staking Rewards:</span>
                          <span className="font-medium text-green-500">$0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Available for Spending:</span>
                          <span className="font-bold text-primary">$0.00</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Mock Website Checkout */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <i className={websites.find(w => w.id === mockWebsite)?.icon}></i>
                        <span>{websites.find(w => w.id === mockWebsite)?.name} Checkout</span>
                      </CardTitle>
                      {isExtensionActive && (
                        <Badge className="bg-green-600 text-white">
                          SOVR Extension Active
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Product Info */}
                    <div className="bg-secondary/20 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold mb-2">{currentSite.product}</h3>
                      <p className="text-2xl font-bold text-primary">${currentSite.price}</p>
                    </div>

                    {/* Payment Form */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Payment Information</h4>
                      {currentSite.fields.map((field, index) => (
                        <div key={index}>
                          <Label htmlFor={`field-${index}`}>{field}</Label>
                          <Input
                            id={`field-${index}`}
                            placeholder={field.includes('Card') || field.includes('Number') ? '•••• •••• •••• ••••' : ''}
                            disabled={!isExtensionActive}
                          />
                        </div>
                      ))}

                      {/* SOVR Pay Injection */}
                      {isExtensionActive && (
                        <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-primary flex items-center">
                              <i className="fas fa-coins mr-2"></i>
                              Pay with Digital Assets
                            </h4>
                            <Badge className="bg-primary text-primary-foreground">
                              SOVR Extension
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="text-sm">
                              <div className="flex justify-between mb-1">
                                <span>RWA Tokens ({selectedTokens.rwa}%):</span>
                                <span className="font-medium">${(currentSite.price * selectedTokens.rwa / 100).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span>SOVR Credits ({selectedTokens.sovr}%):</span>
                                <span className="font-medium">${(currentSite.price * selectedTokens.sovr / 100).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span>Credit Card ({selectedTokens.card}%):</span>
                                <span className="font-medium">${(currentSite.price * selectedTokens.card / 100).toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Mix Adjustment Controls */}
                            {showMixAdjustment && (
                              <div className="space-y-3 border-t pt-3">
                                <div className="text-sm font-medium">Adjust Payment Mix</div>
                                
                                <div className="space-y-3">
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <Label>RWA Tokens</Label>
                                      <span className="text-sm">{selectedTokens.rwa}%</span>
                                    </div>
                                    <Slider
                                      value={[selectedTokens.rwa]}
                                      onValueChange={(value) => {
                                        const newRwa = value[0];
                                        const remaining = 100 - newRwa;
                                        const sovrRatio = selectedTokens.sovr / (selectedTokens.sovr + selectedTokens.card);
                                        setSelectedTokens({
                                          rwa: newRwa,
                                          sovr: Math.round(remaining * sovrRatio),
                                          card: Math.round(remaining * (1 - sovrRatio))
                                        });
                                      }}
                                      max={90}
                                      step={5}
                                      className="w-full"
                                      data-testid="slider-rwa"
                                    />
                                  </div>
                                  
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <Label>SOVR Credits</Label>
                                      <span className="text-sm">{selectedTokens.sovr}%</span>
                                    </div>
                                    <Slider
                                      value={[selectedTokens.sovr]}
                                      onValueChange={(value) => {
                                        const newSovr = value[0];
                                        const remaining = 100 - newSovr;
                                        const rwaRatio = selectedTokens.rwa / (selectedTokens.rwa + selectedTokens.card);
                                        setSelectedTokens({
                                          rwa: Math.round(remaining * rwaRatio),
                                          sovr: newSovr,
                                          card: Math.round(remaining * (1 - rwaRatio))
                                        });
                                      }}
                                      max={80}
                                      step={5}
                                      className="w-full"
                                      data-testid="slider-sovr"
                                    />
                                  </div>
                                  
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <Label>Credit Card</Label>
                                      <span className="text-sm">{selectedTokens.card}%</span>
                                    </div>
                                    <Slider
                                      value={[selectedTokens.card]}
                                      onValueChange={(value) => {
                                        const newCard = value[0];
                                        const remaining = 100 - newCard;
                                        const rwaRatio = selectedTokens.rwa / (selectedTokens.rwa + selectedTokens.sovr);
                                        setSelectedTokens({
                                          rwa: Math.round(remaining * rwaRatio),
                                          sovr: Math.round(remaining * (1 - rwaRatio)),
                                          card: newCard
                                        });
                                      }}
                                      max={50}
                                      step={5}
                                      className="w-full"
                                      data-testid="slider-card"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex space-x-2">
                              <Button
                                className="flex-1"
                                onClick={() => setShowPaymentOverlay(true)}
                                data-testid="pay-with-sovr"
                              >
                                <i className="fas fa-rocket mr-2"></i>
                                Pay with SOVR
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowMixAdjustment(!showMixAdjustment)}
                                data-testid="adjust-mix"
                              >
                                {showMixAdjustment ? 'Hide Mix' : 'Adjust Mix'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <Button 
                        className="w-full" 
                        variant={isExtensionActive ? "secondary" : "default"}
                        disabled={isExtensionActive}
                      >
                        {isExtensionActive ? 'Use SOVR Pay Above ↑' : 'Complete Order'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Payment Processing Overlay */}
            {showPaymentOverlay && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Processing SOVR Payment</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPaymentOverlay(false)}
                      >
                        ×
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-check-circle text-green-500"></i>
                        <span className="text-sm">Converting RWA tokens to USD</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-check-circle text-green-500"></i>
                        <span className="text-sm">Processing SOVR credit payment</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-spinner fa-spin text-blue-500"></i>
                        <span className="text-sm">Generating virtual card...</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-clock text-muted-foreground"></i>
                        <span className="text-sm text-muted-foreground">Auto-filling merchant form...</span>
                      </div>
                    </div>

                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <div className="text-sm font-medium mb-2">Virtual Card Generated:</div>
                      <div className="font-mono text-xs space-y-1">
                        <div>4532 1234 5678 9012</div>
                        <div>EXP: 12/26 • CVV: 123</div>
                        <div className="text-muted-foreground">Routes to: SOVR_PAY_PROCESSOR</div>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => {
                        setShowPaymentOverlay(false);
                        alert('Payment successful! Order confirmed.');
                      }}
                    >
                      Complete Payment
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="features" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {extensionFeatures.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className={`${feature.icon} text-primary`}></i>
                      <span>{feature.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <div className="code-highlight rounded-lg p-3">
                      <pre className="text-xs font-mono overflow-x-auto">
                        <code>{feature.code}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="installation" className="space-y-8">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Install SOVR Pay Extension</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                        1
                      </div>
                      <div>
                        <div className="font-medium">Download Extension</div>
                        <div className="text-sm text-muted-foreground">
                          Available for Chrome, Firefox, Safari, and Edge
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                        2
                      </div>
                      <div>
                        <div className="font-medium">Connect Your Wallet</div>
                        <div className="text-sm text-muted-foreground">
                          Link your RWA tokens, SOVR credits, and DeFi positions
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                        3
                      </div>
                      <div>
                        <div className="font-medium">Shop Anywhere</div>
                        <div className="text-sm text-muted-foreground">
                          Use your digital assets on ANY website with checkout forms
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      className="flex-1"
                      onClick={downloadExtension}
                      data-testid="download-chrome-extension"
                    >
                      <i className="fas fa-download mr-2"></i>
                      Download for Chrome
                    </Button>
                    <Button variant="outline" className="flex-1" disabled>
                      <i className="fab fa-firefox mr-2"></i>
                      Firefox (Soon)
                    </Button>
                  </div>

                  <div className="bg-accent/10 p-4 rounded-lg">
                    <div className="font-medium mb-2">🔒 Privacy & Security</div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Extension never sees your private keys</li>
                      <li>• All transactions are encrypted end-to-end</li>
                      <li>• Virtual cards expire after each purchase</li>
                      <li>• Full audit trail for every transaction</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}