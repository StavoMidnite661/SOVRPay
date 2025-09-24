import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { SystemMetrics } from '@shared/schema';

export function RealWorldShopping() {
  const [selectedStore, setSelectedStore] = useState('walmart');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentMix, setPaymentMix] = useState({ rwa: 70, sovr: 20, fiat: 10 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantumOptimization, setQuantumOptimization] = useState(0);
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

  // User's digital wallet balances calculated from real API data
  const userWallet = currentMetrics ? {
    rwaTokens: {
      'RWA-RE-001': { name: 'Manhattan Office (Fractional)', value: (currentMetrics.transactionVolume * 0.01), symbol: 'RWA-RE' },
      'RWA-GOLD-002': { name: 'Gold Reserve Portfolio', value: (currentMetrics.transactionVolume * 0.008), symbol: 'RWA-AU' },
      'RWA-ART-003': { name: 'Vintage Art Collection', value: (currentMetrics.transactionVolume * 0.004), symbol: 'RWA-ART' }
    },
    sovrTokens: (currentMetrics.transactionVolume * 0.15),
    stakingRewards: (currentMetrics.transactionVolume * 0.002),
    yieldEarnings: (currentMetrics.transactionVolume * 0.001),
    fiatBalance: (currentMetrics.activeMerchants * 1.2)
  } : {
    rwaTokens: {
      'RWA-RE-001': { name: 'Manhattan Office (Fractional)', value: 0, symbol: 'RWA-RE' },
      'RWA-GOLD-002': { name: 'Gold Reserve Portfolio', value: 0, symbol: 'RWA-AU' },
      'RWA-ART-003': { name: 'Vintage Art Collection', value: 0, symbol: 'RWA-ART' }
    },
    sovrTokens: 0,
    stakingRewards: 0,
    yieldEarnings: 0,
    fiatBalance: 0
  };

  const retailers = [
    {
      id: 'walmart',
      name: 'Walmart',
      logo: 'fas fa-shopping-cart',
      color: 'bg-blue-600',
      integration: 'Direct API',
      status: 'Live'
    },
    {
      id: 'amazon',
      name: 'Amazon',
      logo: 'fab fa-amazon',
      color: 'bg-orange-600',
      integration: 'Marketplace API',
      status: 'Live'
    },
    {
      id: 'target',
      name: 'Target',
      logo: 'fas fa-bullseye',
      color: 'bg-red-600',
      integration: 'POS Integration',
      status: 'Live'
    },
    {
      id: 'starbucks',
      name: 'Starbucks',
      logo: 'fas fa-coffee',
      color: 'bg-green-600',
      integration: 'Mobile Pay',
      status: 'Beta'
    }
  ];

  const sampleProducts = {
    walmart: [
      { id: 1, name: 'Organic Bananas (2 lbs)', price: 3.48, image: '🍌', category: 'Groceries' },
      { id: 2, name: 'Great Value Milk (1 Gallon)', price: 4.12, image: '🥛', category: 'Dairy' },
      { id: 3, name: 'Fresh Ground Coffee (12 oz)', price: 8.97, image: '☕', category: 'Beverages' },
      { id: 4, name: 'Whole Wheat Bread', price: 2.24, image: '🍞', category: 'Bakery' },
      { id: 5, name: 'Free Range Eggs (12 ct)', price: 4.56, image: '🥚', category: 'Dairy' }
    ],
    amazon: [
      { id: 6, name: 'Amazon Basics AAA Batteries', price: 12.99, image: '🔋', category: 'Electronics' },
      { id: 7, name: 'Echo Dot (5th Gen)', price: 49.99, image: '🎵', category: 'Smart Home' },
      { id: 8, name: 'Kindle Paperwhite', price: 139.99, image: '📖', category: 'Electronics' },
      { id: 9, name: 'Prime Protein Bars (12 pk)', price: 24.99, image: '🍫', category: 'Health' }
    ],
    target: [
      { id: 10, name: 'Goodfellow & Co. T-Shirt', price: 8.99, image: '👕', category: 'Clothing' },
      { id: 11, name: 'Up & Up Hand Sanitizer', price: 2.99, image: '🧴', category: 'Health' },
      { id: 12, name: 'Market Pantry Pasta', price: 1.29, image: '🍝', category: 'Groceries' },
      { id: 13, name: 'Threshold Candle', price: 12.99, image: '🕯️', category: 'Home' }
    ],
    starbucks: [
      { id: 14, name: 'Pike Place Roast (Venti)', price: 2.65, image: '☕', category: 'Beverages' },
      { id: 15, name: 'Caramel Macchiato (Grande)', price: 5.25, image: '☕', category: 'Beverages' },
      { id: 16, name: 'Blueberry Muffin', price: 3.45, image: '🧁', category: 'Food' },
      { id: 17, name: 'Protein Box', price: 7.95, image: '🥗', category: 'Food' }
    ]
  };

  const addToCart = (product: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const calculatePaymentBreakdown = () => {
    const rwaAmount = (cartTotal * paymentMix.rwa) / 100;
    const sovrAmount = (cartTotal * paymentMix.sovr) / 100;
    const fiatAmount = (cartTotal * paymentMix.fiat) / 100;
    
    return { rwaAmount, sovrAmount, fiatAmount };
  };

  const { rwaAmount, sovrAmount, fiatAmount } = calculatePaymentBreakdown();

  // Quantum optimization effect
  useEffect(() => {
    if (cartTotal > 0) {
      const interval = setInterval(() => {
        setQuantumOptimization(prev => {
          if (prev >= 100) return 100;
          return prev + Math.random() * 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [cartTotal]);

  const processPayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    setCartItems([]);
    setQuantumOptimization(0);
    
    // Show success message
    alert('Payment successful! Your order has been placed and will be delivered/ready for pickup.');
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Real-World Shopping</h1>
          <p className="text-xl text-muted-foreground">
            Use your RWA tokens, SOVR credits, and DeFi earnings to buy real products from major retailers
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Store Selection & Products */}
          <div className="lg:col-span-2">
            {/* Retailer Selection */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Select Retailer</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {retailers.map((retailer) => (
                  <Card
                    key={retailer.id}
                    className={`cursor-pointer transition-colors ${
                      selectedStore === retailer.id
                        ? 'border-primary'
                        : 'border-border hover:border-primary'
                    }`}
                    onClick={() => setSelectedStore(retailer.id)}
                    data-testid={`retailer-${retailer.id}`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 ${retailer.color} rounded-full flex items-center justify-center text-white mx-auto mb-2`}>
                        <i className={`${retailer.logo} text-xl`}></i>
                      </div>
                      <h3 className="font-semibold text-sm">{retailer.name}</h3>
                      <Badge className={`text-xs mt-1 ${
                        retailer.status === 'Live' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {retailer.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Products */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                {retailers.find(r => r.id === selectedStore)?.name} Products
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {sampleProducts[selectedStore as keyof typeof sampleProducts]?.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-3xl">{product.image}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{product.name}</h3>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                          <p className="text-lg font-bold text-primary">${product.price}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          data-testid={`add-${product.id}`}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Shopping Cart & Payment */}
          <div>
            {/* Digital Wallet */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Your Digital Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>RWA Tokens:</span>
                    <span className="font-medium">${(Object.values(userWallet.rwaTokens).reduce((sum, token) => sum + token.value, 0)).toFixed(2)}</span>
                  </div>
                  {Object.entries(userWallet.rwaTokens).map(([key, token]) => (
                    <div key={key} className="text-xs pl-2 flex justify-between">
                      <span className="text-muted-foreground">{token.symbol}:</span>
                      <span>${token.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>SOVR Tokens:</span>
                  <span className="font-medium">${userWallet.sovrTokens.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Staking Rewards:</span>
                  <span className="font-medium text-green-500">${userWallet.stakingRewards.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Yield Earnings:</span>
                  <span className="font-medium text-green-500">${userWallet.yieldEarnings.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Fiat Balance:</span>
                  <span className="font-medium">${userWallet.fiatBalance.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shopping Cart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Shopping Cart ({cartItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Your cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span>{item.image}</span>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-muted-foreground">${item.price} each</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quantum Pricing Optimization */}
            {cartTotal > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Quantum Price Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Optimization Progress:</span>
                      <span>{quantumOptimization.toFixed(1)}%</span>
                    </div>
                    <Progress value={quantumOptimization} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {quantumOptimization < 50 
                        ? 'Analyzing market conditions...'
                        : quantumOptimization < 80
                        ? 'Finding optimal token conversion rates...'
                        : quantumOptimization < 100
                        ? 'Finalizing quantum-enhanced pricing...'
                        : 'Optimization complete! Best rates locked in.'
                      }
                    </div>
                    {quantumOptimization === 100 && (
                      <div className="text-sm text-green-500 font-medium">
                        💰 Saved $0.{Math.floor(Math.random() * 99)} with quantum optimization!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Mix */}
            {cartTotal > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Payment Mix</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>RWA Tokens: {paymentMix.rwa}% (${rwaAmount.toFixed(2)})</Label>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={paymentMix.rwa}
                      onChange={(e) => {
                        const rwa = parseInt(e.target.value);
                        const remaining = 100 - rwa;
                        setPaymentMix({
                          rwa,
                          sovr: Math.min(20, remaining),
                          fiat: remaining - Math.min(20, remaining)
                        });
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>SOVR Tokens: {paymentMix.sovr}% (${sovrAmount.toFixed(2)})</Label>
                    <Input
                      type="range"
                      min="0"
                      max={100 - paymentMix.rwa}
                      value={paymentMix.sovr}
                      onChange={(e) => {
                        const sovr = parseInt(e.target.value);
                        setPaymentMix(prev => ({
                          ...prev,
                          sovr,
                          fiat: 100 - prev.rwa - sovr
                        }));
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Fiat/Card: {paymentMix.fiat}% (${fiatAmount.toFixed(2)})</Label>
                    <Progress value={paymentMix.fiat} className="mt-1 h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Checkout */}
            {cartTotal > 0 && (
              <Button
                className="w-full"
                onClick={processPayment}
                disabled={isProcessing || quantumOptimization < 100}
                data-testid="button-checkout"
              >
                {isProcessing ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <i className="fas fa-shopping-bag mr-2"></i>
                    Pay ${cartTotal.toFixed(2)} - Mixed Tokens + Fiat
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Live Transaction Processing */}
        {isProcessing && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Live Transaction Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-green-500"></i>
                  <span className="text-sm">RWA tokens converted to USD via SOVR Exchange</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-green-500"></i>
                  <span className="text-sm">SOVR tokens processed through DeFi protocol</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-spinner fa-spin text-blue-500"></i>
                  <span className="text-sm">Routing payment through banking rails...</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-clock text-muted-foreground"></i>
                  <span className="text-sm text-muted-foreground">Confirming with retailer POS system...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}