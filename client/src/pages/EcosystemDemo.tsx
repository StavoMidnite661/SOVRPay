import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function EcosystemDemo() {
  const [currentDemo, setCurrentDemo] = useState<string | null>(null);
  const [demoProgress, setDemoProgress] = useState(0);
  const [demoStep, setDemoStep] = useState(0);

  const demoScenarios = [
    {
      id: 'real_estate_purchase',
      title: 'Real Estate Purchase with RWA Tokenization',
      description: 'Complete end-to-end demo of purchasing fractional real estate using SOVR Pay',
      duration: '3 minutes',
      complexity: 'Advanced',
      badge: 'Popular',
      badgeColor: 'bg-primary text-primary-foreground',
      steps: [
        'Customer selects property to invest in',
        'KYC verification and compliance checks',
        'Asset valuation and legal framework setup',
        'Smart contract deployment for tokenization',
        'Payment processing with crypto/fiat conversion',
        'Token minting and transfer to customer wallet',
        'Secondary market listing and trading capabilities'
      ]
    },
    {
      id: 'merchant_integration',
      title: 'E-commerce Merchant Integration',
      description: 'How online merchants integrate SOVR Pay for traditional and RWA payments',
      duration: '2 minutes',
      complexity: 'Medium',
      badge: 'Essential',
      badgeColor: 'bg-accent text-accent-foreground',
      steps: [
        'Merchant signs up and gets API credentials',
        'Install SOVR Pay SDK in e-commerce platform',
        'Configure payment methods and RWA options',
        'Customer places order with mixed payment types',
        'Real-time payment processing and settlement',
        'Automated invoice generation and accounting',
        'Analytics dashboard and reporting'
      ]
    },
    {
      id: 'defi_protocol_usage',
      title: 'DeFi Protocol Integration',
      description: 'Using SOVR Pay tokens in DeFi protocols for yield farming and lending',
      duration: '4 minutes',
      complexity: 'Expert',
      badge: 'Advanced',
      badgeColor: 'bg-purple-600 text-white',
      steps: [
        'Connect wallet to SOVR DeFi dashboard',
        'Deposit RWA tokens into liquidity pools',
        'Enable automated yield farming strategies',
        'Participate in governance voting',
        'Use tokens as collateral for lending',
        'Cross-chain bridge to other networks',
        'Harvest rewards and compound returns'
      ]
    },
    {
      id: 'banking_compliance',
      title: 'Banking Rails & Compliance',
      description: 'How SOVR Pay connects to traditional banking with full regulatory compliance',
      duration: '3 minutes',
      complexity: 'Advanced',
      badge: 'Enterprise',
      badgeColor: 'bg-blue-600 text-white',
      steps: [
        'Bank account linking and verification',
        'ISO 20022 message formatting',
        'AML/KYC automated compliance checks',
        'Cross-border payment routing',
        'Real-time settlement via banking rails',
        'Regulatory reporting and audit trails',
        'Multi-jurisdiction compliance management'
      ]
    }
  ];

  const liveMetrics = {
    totalTransactions: 2847692,
    totalVolume: '$847.3M',
    rwaTokenized: '$156.7M',
    activeMerchants: 12847,
    defiTvl: '$234.1M',
    uptimePercent: 99.97
  };

  useEffect(() => {
    if (currentDemo) {
      const interval = setInterval(() => {
        setDemoProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
        
        if (demoProgress > 0 && demoProgress % 15 === 0) {
          setDemoStep(prev => Math.min(prev + 1, 6));
        }
      }, 200);

      return () => clearInterval(interval);
    }
  }, [currentDemo, demoProgress]);

  const startDemo = (demoId: string) => {
    setCurrentDemo(demoId);
    setDemoProgress(0);
    setDemoStep(0);
  };

  const resetDemo = () => {
    setCurrentDemo(null);
    setDemoProgress(0);
    setDemoStep(0);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Live Ecosystem Demonstration</h1>
          <p className="text-xl text-muted-foreground">
            Experience the complete SOVR Pay ecosystem in action with interactive live demos
          </p>
        </div>

        {/* Live Metrics Dashboard */}
        <div className="grid md:grid-cols-6 gap-4 mb-12">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary" data-testid="metric-transactions">
                {liveMetrics.totalTransactions.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Transactions</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent" data-testid="metric-volume">
                {liveMetrics.totalVolume}
              </div>
              <div className="text-xs text-muted-foreground">Total Volume</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary" data-testid="metric-rwa">
                {liveMetrics.rwaTokenized}
              </div>
              <div className="text-xs text-muted-foreground">RWA Tokenized</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent" data-testid="metric-merchants">
                {liveMetrics.activeMerchants.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Active Merchants</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary" data-testid="metric-defi">
                {liveMetrics.defiTvl}
              </div>
              <div className="text-xs text-muted-foreground">DeFi TVL</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500" data-testid="metric-uptime">
                {liveMetrics.uptimePercent}%
              </div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Scenarios */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Scenario Selection */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Choose Your Demo Experience</h2>
            <div className="space-y-4">
              {demoScenarios.map((scenario) => (
                <Card
                  key={scenario.id}
                  className={`cursor-pointer transition-colors ${
                    currentDemo === scenario.id
                      ? 'border-primary'
                      : 'border-border hover:border-primary'
                  }`}
                  onClick={() => startDemo(scenario.id)}
                  data-testid={`demo-${scenario.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{scenario.title}</h3>
                      <Badge className={`text-xs ${scenario.badgeColor}`}>
                        {scenario.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">
                          <i className="fas fa-clock mr-1"></i>
                          {scenario.duration}
                        </span>
                        <span className="text-muted-foreground">
                          <i className="fas fa-signal mr-1"></i>
                          {scenario.complexity}
                        </span>
                      </div>
                      <Button size="sm" variant="ghost">
                        Start Demo →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Demo Execution */}
          <div>
            {currentDemo ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {demoScenarios.find(s => s.id === currentDemo)?.title}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={resetDemo}>
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Demo Progress</span>
                        <span className="text-sm text-muted-foreground">{demoProgress}%</span>
                      </div>
                      <Progress value={demoProgress} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      {demoScenarios
                        .find(s => s.id === currentDemo)
                        ?.steps.map((step, index) => (
                          <div
                            key={index}
                            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                              index < demoStep
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : index === demoStep
                                ? 'bg-primary/10'
                                : 'bg-secondary/20'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                              index < demoStep
                                ? 'bg-green-600 text-white'
                                : index === demoStep
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground'
                            }`}>
                              {index < demoStep ? (
                                <i className="fas fa-check"></i>
                              ) : (
                                index + 1
                              )}
                            </div>
                            <span className={`text-sm ${
                              index <= demoStep ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {step}
                            </span>
                          </div>
                        ))}
                    </div>

                    {demoProgress === 100 && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <i className="fas fa-check-circle text-green-600"></i>
                          <span className="font-semibold text-green-700 dark:text-green-400">
                            Demo Completed Successfully!
                          </span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          You've experienced the complete SOVR Pay workflow. Ready to integrate?
                        </p>
                        <Button className="mt-3 bg-green-600 hover:bg-green-700" size="sm">
                          Start Your Integration
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <i className="fas fa-play-circle text-4xl text-primary mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">Select a Demo to Begin</h3>
                  <p className="text-muted-foreground">
                    Choose any scenario from the left to see the complete SOVR Pay ecosystem in action
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Integration Timeline */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Typical Integration Timeline</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                phase: 'Discovery',
                duration: '1-2 days',
                tasks: ['API exploration', 'Requirements gathering', 'Technical consultation']
              },
              {
                phase: 'Development',
                duration: '1-2 weeks',
                tasks: ['SDK integration', 'Custom development', 'Testing and debugging']
              },
              {
                phase: 'Testing',
                duration: '3-5 days',
                tasks: ['Sandbox testing', 'Security audit', 'Performance optimization']
              },
              {
                phase: 'Launch',
                duration: '1-2 days',
                tasks: ['Production deployment', 'Monitoring setup', 'Go-live support']
              }
            ].map((phase, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold mx-auto mb-2">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold">{phase.phase}</h3>
                    <p className="text-sm text-accent">{phase.duration}</p>
                  </div>
                  <ul className="space-y-1">
                    {phase.tasks.map((task, taskIndex) => (
                      <li key={taskIndex} className="text-xs text-muted-foreground flex items-center">
                        <i className="fas fa-check text-green-500 text-xs mr-2"></i>
                        {task}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}