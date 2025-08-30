import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Integration() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const integrationSteps = [
    {
      number: 1,
      title: 'API Key Generation',
      description: 'Generate secure API keys for your application with customizable permissions.',
    },
    {
      number: 2,
      title: 'SDK Installation',
      description: 'Install our lightweight SDK for your preferred programming language.',
    },
    {
      number: 3,
      title: 'Webhook Configuration',
      description: 'Set up webhooks to receive real-time payment notifications.',
    },
    {
      number: 4,
      title: 'Testing & Deployment',
      description: 'Test your integration in our sandbox environment before going live.',
    },
  ];

  const platforms = [
    { id: 'shopify', name: 'Shopify', icon: 'fab fa-shopify' },
    { id: 'woocommerce', name: 'WooCommerce', icon: 'fab fa-wordpress' },
    { id: 'magento', name: 'Magento', icon: 'fab fa-magento' },
    { id: 'custom', name: 'Custom', icon: 'fas fa-code' },
  ];

  const codeExample = `import { SovrPay } from '@sovr/payment-sdk';

const sovrPay = new SovrPay({
  apiKey: 'your-api-key',
  environment: 'sandbox'
});

const payment = await sovrPay.createPayment({
  amount: 1000,
  currency: 'USD',
  description: 'Order #12345',
  customer: {
    email: 'customer@example.com'
  }
});

// Handle payment result
if (payment.status === 'completed') {
  console.log('Payment successful!');
}`;

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-muted/20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Integration Wizard</h1>
          <p className="text-xl text-muted-foreground">Step-by-step guide to integrate SOVR Pay into your platform</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Integration Steps */}
          <div>
            <div className="space-y-6">
              {integrationSteps.map((step) => (
                <Card key={step.number} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                        {step.number}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground text-sm">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <Button 
                className="w-full" 
                size="lg"
                data-testid="button-start-wizard"
              >
                <i className="fas fa-play mr-2"></i>
                Start Integration Wizard
              </Button>
            </div>
          </div>

          {/* Code Example */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Integration Example</CardTitle>
                  <Button variant="ghost" size="sm">
                    <i className="fas fa-copy text-xs"></i>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="code-highlight rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm font-mono">{codeExample}</code>
                </pre>
              </CardContent>
            </Card>

            {/* Platform Integration Options */}
            <div className="grid grid-cols-2 gap-4">
              {platforms.map((platform) => (
                <Card
                  key={platform.id}
                  className={`cursor-pointer transition-colors ${
                    selectedPlatform === platform.id 
                      ? 'border-primary' 
                      : 'border-border hover:border-primary'
                  }`}
                  onClick={() => setSelectedPlatform(platform.id)}
                  data-testid={`platform-${platform.id}`}
                >
                  <CardContent className="p-4 text-center">
                    <i className={`${platform.icon} text-2xl text-primary mb-2`}></i>
                    <div className="font-medium">{platform.name}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
