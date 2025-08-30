
// Landing Page for SOVR Pay Checkout
// Public-facing introduction to the payment system

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Zap, 
  Globe, 
  CreditCard, 
  BarChart3, 
  Lock,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Military-grade security with immutable transaction records on Polygon mainnet'
    },
    {
      icon: Zap,
      title: 'Instant Settlement',
      description: 'Real-time payment processing with burn-for-finality mechanics'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Accept payments from anywhere with no geographic restrictions'
    },
    {
      icon: CreditCard,
      title: 'No Fiat Dependencies',
      description: 'Pure blockchain settlements using SOVR Credit tokens'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Comprehensive payment tracking and settlement analytics'
    },
    {
      icon: Lock,
      title: 'Production Ready',
      description: 'Enterprise-grade infrastructure with 99.9% uptime guarantee'
    }
  ];

  const benefits = [
    'Zero chargeback risk with blockchain finality',
    'Lower transaction fees than traditional processors',
    'Real-time settlement with immediate finality',
    'No bank dependencies or account holds',
    'Global accessibility without regional restrictions',
    'Complete transaction transparency and audit trails'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold gradient-text">SOVR Pay</span>
              <Badge variant="secondary" className="ml-2">Checkout</Badge>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#integration" className="text-muted-foreground hover:text-foreground transition-colors">
                Integration
              </Link>
              <Link href="/auth/signin" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Button asChild>
                <Link href="/auth/signup">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="space-y-6 max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-4">
            <Zap className="w-3 h-3 mr-1" />
            Powered by Polygon Blockchain
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Professional Blockchain
            <span className="gradient-text"> Payment Processing</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Accept payments using SOVR Credit with instant blockchain settlement. 
            No fiat dependencies, no chargebacks, no geographic restrictions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Start Integration <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto max-w-6xl px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Built for Modern Commerce</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade payment infrastructure designed for the decentralized economy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="military-card military-hover h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/20 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose SOVR Pay?</h2>
              <p className="text-muted-foreground mb-8">
                Traditional payment processors come with high fees, chargeback risks, 
                and geographic limitations. SOVR Pay eliminates these problems with 
                blockchain-native settlement.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="military-card p-6">
              <CardContent className="space-y-6 p-0">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Settlement Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">burnForPOS</span>
                      <Badge variant="secondary">Immediate</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">approveAndBurn</span>
                      <Badge variant="secondary">Two-step</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Network Details</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Network:</span>
                      <span className="text-foreground">Polygon Mainnet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chain ID:</span>
                      <span className="text-foreground">137</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Token:</span>
                      <span className="text-foreground">SOVR Credit</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section id="integration" className="container mx-auto max-w-6xl px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple Integration</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes with our comprehensive API and SDKs
          </p>
        </div>

        <Card className="military-card max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>API Integration Example</span>
            </CardTitle>
            <CardDescription>
              Create and process payments with simple HTTP requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm">
              <div className="text-primary">// Create a payment</div>
              <div className="mt-2">
                <span className="text-blue-400">POST</span> /api/payments/create
              </div>
              <div className="text-muted-foreground mt-2">
                {JSON.stringify({
                  amount: "100.00",
                  currency: "USD",
                  paymentMethod: "QR_CODE",
                  description: "Product purchase"
                }, null, 2)}
              </div>
              
              <div className="text-primary mt-6">// Settle payment</div>
              <div className="mt-2">
                <span className="text-blue-400">POST</span> /api/payments/settle
              </div>
              <div className="text-muted-foreground mt-2">
                {JSON.stringify({
                  paymentId: "payment_id",
                  settlementType: "BURN_FOR_POS",
                  userAddress: "0x..."
                }, null, 2)}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-t border-border/40 py-20">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the future of payment processing with blockchain-native settlements
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Create Account <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/signin">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">SOVR Pay Checkout</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Powered by blockchain technology
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
