import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function IntegrationHub() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const integrationMethods = [
    {
      id: 'rest_api',
      name: 'REST API',
      icon: 'fas fa-code',
      description: 'Direct API integration for custom applications',
      complexity: 'Medium',
      timeframe: '1-2 weeks',
      badge: 'Most Popular',
      badgeColor: 'bg-primary text-primary-foreground'
    },
    {
      id: 'webhooks',
      name: 'Webhooks',
      icon: 'fas fa-bolt',
      description: 'Real-time event notifications and callbacks',
      complexity: 'Low',
      timeframe: '2-3 days',
      badge: 'Real-time',
      badgeColor: 'bg-accent text-accent-foreground'
    },
    {
      id: 'sdk_libraries',
      name: 'SDK Libraries',
      icon: 'fas fa-cube',
      description: 'Pre-built libraries for popular frameworks',
      complexity: 'Low',
      timeframe: '1 day',
      badge: 'Easy Setup',
      badgeColor: 'bg-green-600 text-white'
    },
    {
      id: 'white_label',
      name: 'White Label',
      icon: 'fas fa-paint-brush',
      description: 'Complete branded payment solution',
      complexity: 'High',
      timeframe: '4-6 weeks',
      badge: 'Enterprise',
      badgeColor: 'bg-purple-600 text-white'
    }
  ];

  const platforms = [
    {
      category: 'E-commerce',
      platforms: [
        { name: 'Shopify', icon: 'fab fa-shopify', status: 'Available', integrations: 12500 },
        { name: 'WooCommerce', icon: 'fab fa-wordpress', status: 'Available', integrations: 8900 },
        { name: 'Magento', icon: 'fab fa-magento', status: 'Available', integrations: 3400 },
        { name: 'BigCommerce', icon: 'fas fa-shopping-cart', status: 'Available', integrations: 1800 },
        { name: 'PrestaShop', icon: 'fas fa-store', status: 'Beta', integrations: 450 },
        { name: 'OpenCart', icon: 'fas fa-shopping-bag', status: 'Coming Soon', integrations: 0 }
      ]
    },
    {
      category: 'Financial Platforms',
      platforms: [
        { name: 'QuickBooks', icon: 'fas fa-calculator', status: 'Available', integrations: 15600 },
        { name: 'Xero', icon: 'fas fa-chart-bar', status: 'Available', integrations: 7800 },
        { name: 'FreshBooks', icon: 'fas fa-file-invoice', status: 'Available', integrations: 2100 },
        { name: 'Sage', icon: 'fas fa-coins', status: 'Beta', integrations: 890 },
        { name: 'Wave', icon: 'fas fa-wave-square', status: 'Coming Soon', integrations: 0 },
        { name: 'Zoho Books', icon: 'fas fa-book', status: 'Coming Soon', integrations: 0 }
      ]
    },
    {
      category: 'Business Applications',
      platforms: [
        { name: 'Salesforce', icon: 'fab fa-salesforce', status: 'Available', integrations: 24500 },
        { name: 'HubSpot', icon: 'fas fa-hubspot', status: 'Available', integrations: 12300 },
        { name: 'Zendesk', icon: 'fas fa-headset', status: 'Available', integrations: 8900 },
        { name: 'Slack', icon: 'fab fa-slack', status: 'Available', integrations: 5600 },
        { name: 'Microsoft Teams', icon: 'fab fa-microsoft', status: 'Beta', integrations: 1200 },
        { name: 'Discord', icon: 'fab fa-discord', status: 'Beta', integrations: 780 }
      ]
    },
    {
      category: 'Development Frameworks',
      platforms: [
        { name: 'React/Next.js', icon: 'fab fa-react', status: 'Available', integrations: 45600 },
        { name: 'Vue.js/Nuxt', icon: 'fab fa-vuejs', status: 'Available', integrations: 18900 },
        { name: 'Angular', icon: 'fab fa-angular', status: 'Available', integrations: 12400 },
        { name: 'Laravel', icon: 'fab fa-laravel', status: 'Available', integrations: 8700 },
        { name: 'Django', icon: 'fab fa-python', status: 'Available', integrations: 6500 },
        { name: 'Ruby on Rails', icon: 'fas fa-gem', status: 'Available', integrations: 3200 }
      ]
    }
  ];

  const codeExamples = {
    rest_api: `// REST API Integration Example
const sovrPay = new SovrPayAPI({
  apiKey: process.env.SOVR_API_KEY,
  environment: 'production'
});

// Create Payment
const payment = await sovrPay.payments.create({
  amount: 10000, // $100.00 in cents
  currency: 'USD',
  description: 'Product purchase',
  customer: {
    email: 'customer@example.com',
    wallet: '0x742d35Cc6634C0532925a3b8d'
  },
  rwa_asset: {
    type: 'real_estate',
    token_id: 'RWA_001',
    fractional_amount: 0.1
  }
});

console.log('Payment URL:', payment.checkout_url);`,

    webhooks: `// Webhook Handler Example
app.post('/webhooks/sovr-pay', (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'payment.completed':
      handlePaymentCompleted(event.data);
      break;
    case 'rwa.tokenized':
      handleAssetTokenized(event.data);
      break;
    case 'integration.connected':
      handleIntegrationConnected(event.data);
      break;
  }
  
  res.status(200).send('OK');
});

function handlePaymentCompleted(payment) {
  // Update order status
  // Send confirmation email
  // Update inventory
}`,

    sdk_libraries: `// SDK Library Example (React)
import { SovrPayProvider, usePayment } from '@sovr/react-sdk';

function App() {
  return (
    <SovrPayProvider apiKey="pk_live_...">
      <PaymentForm />
    </SovrPayProvider>
  );
}

function PaymentForm() {
  const { createPayment, isLoading } = usePayment();
  
  const handlePayment = async () => {
    const payment = await createPayment({
      amount: 5000,
      currency: 'USD',
      rwa_integration: true
    });
    
    window.location.href = payment.checkout_url;
  };
  
  return (
    <button onClick={handlePayment} disabled={isLoading}>
      Pay with SOVR
    </button>
  );
}`,

    white_label: `// White Label Configuration
const whiteLabel = new SovrWhiteLabel({
  organization: 'your-company',
  branding: {
    logo: 'https://yoursite.com/logo.png',
    primaryColor: '#1a365d',
    accentColor: '#00d4aa',
    fontFamily: 'Inter'
  },
  features: {
    rwa_tokenization: true,
    defi_protocols: true,
    banking_rails: true,
    custom_domains: true
  },
  compliance: {
    kyc_enabled: true,
    aml_checks: true,
    jurisdictions: ['US', 'EU', 'UK']
  }
});

await whiteLabel.deploy();`
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Integration Hub</h1>
          <p className="text-xl text-muted-foreground">
            Connect your applications to the SOVR Pay ecosystem with multiple integration methods
          </p>
        </div>

        <Tabs defaultValue="methods" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="methods">Integration Methods</TabsTrigger>
            <TabsTrigger value="platforms">Platform Support</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="methods" className="space-y-8">
            {/* Integration Methods */}
            <div className="grid md:grid-cols-2 gap-6">
              {integrationMethods.map((method) => (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-colors ${
                    selectedIntegration === method.id
                      ? 'border-primary'
                      : 'border-border hover:border-primary'
                  }`}
                  onClick={() => setSelectedIntegration(method.id)}
                  data-testid={`integration-${method.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <i className={`${method.icon} text-primary text-2xl`}></i>
                        <h3 className="text-xl font-semibold">{method.name}</h3>
                      </div>
                      <Badge className={`text-xs ${method.badgeColor}`}>
                        {method.badge}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{method.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Complexity:</span>
                        <span className="font-medium ml-2">{method.complexity}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timeframe:</span>
                        <span className="font-medium ml-2">{method.timeframe}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Integration Details */}
            {selectedIntegration && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {integrationMethods.find(m => m.id === selectedIntegration)?.name} Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-3">Implementation Steps</h4>
                      <div className="space-y-3">
                        {[
                          'Generate API credentials',
                          'Install SDK or configure endpoints',
                          'Implement authentication',
                          'Set up webhook handlers',
                          'Test in sandbox environment',
                          'Deploy to production'
                        ].map((step, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold">
                              {index + 1}
                            </div>
                            <span className="text-sm">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Features Available</h4>
                      <div className="space-y-2">
                        {[
                          'Payment Processing',
                          'RWA Tokenization',
                          'DeFi Protocols',
                          'Banking Rails',
                          'Real-time Analytics',
                          'Compliance Tools'
                        ].map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <i className="fas fa-check text-green-500 text-xs"></i>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-6" data-testid="button-start-integration">
                    <i className="fas fa-rocket mr-2"></i>
                    Start Integration
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="platforms" className="space-y-8">
            {platforms.map((category) => (
              <div key={category.category}>
                <h3 className="text-xl font-semibold mb-4">{category.category}</h3>
                <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {category.platforms.map((platform) => (
                    <Card key={platform.name} className="text-center">
                      <CardContent className="p-4">
                        <i className={`${platform.icon} text-2xl text-primary mb-2`}></i>
                        <h4 className="font-medium text-sm mb-2">{platform.name}</h4>
                        <Badge 
                          className={`text-xs mb-2 ${
                            platform.status === 'Available' 
                              ? 'bg-green-600 text-white'
                              : platform.status === 'Beta'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-600 text-white'
                          }`}
                        >
                          {platform.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {platform.integrations.toLocaleString()} integrations
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="examples" className="space-y-8">
            <div className="grid gap-6">
              {Object.entries(codeExamples).map(([key, code]) => (
                <Card key={key}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {integrationMethods.find(m => m.id === key)?.name} Example
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        <i className="fas fa-copy text-xs"></i>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="code-highlight rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm font-mono">{code}</code>
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}