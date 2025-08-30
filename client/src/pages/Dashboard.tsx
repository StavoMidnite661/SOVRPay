import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { TransactionFlow } from '@/components/TransactionFlow';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect, useState } from 'react';
import type { SystemMetrics } from '@shared/schema';

export function Dashboard() {
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              SOVR Pay Network Suite
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Complete financial technology ecosystem with RWA tokenization, DeFi protocols, banking compliance, 
              and seamless integration. Experience the future of digital finance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="pulse-glow"
                onClick={() => scrollToSection('overview')}
                data-testid="button-start-demo"
              >
                <i className="fas fa-rocket mr-2"></i>
                Start Live Demo
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                data-testid="button-documentation"
              >
                <i className="fas fa-book mr-2"></i>
                View Documentation
              </Button>
            </div>
          </div>

          {/* Stats */}
          {currentMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <div className="text-3xl font-bold text-primary mb-2 stat-counter">99.9%</div>
                <div className="text-muted-foreground">Uptime</div>
              </div>
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <div className="text-3xl font-bold text-accent mb-2 stat-counter">
                  {currentMetrics.averageResponseTime}ms
                </div>
                <div className="text-muted-foreground">Avg Response</div>
              </div>
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <div className="text-3xl font-bold text-primary mb-2 stat-counter">1M+</div>
                <div className="text-muted-foreground">Transactions</div>
              </div>
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <div className="text-3xl font-bold text-accent mb-2 stat-counter">150+</div>
                <div className="text-muted-foreground">Countries</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">SOVR Pay Ecosystem</h2>
            <p className="text-xl text-muted-foreground">Comprehensive payment infrastructure for the digital economy</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="gradient-border">
              <div className="p-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-credit-card text-primary-foreground text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">Payment Processing</h3>
                <p className="text-muted-foreground mb-4">Lightning-fast payment processing with support for traditional and digital currencies.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><i className="fas fa-check text-accent w-4 mr-2"></i>Real-time settlements</li>
                  <li className="flex items-center"><i className="fas fa-check text-accent w-4 mr-2"></i>Multi-currency support</li>
                  <li className="flex items-center"><i className="fas fa-check text-accent w-4 mr-2"></i>Fraud protection</li>
                </ul>
              </div>
            </div>

            <div className="gradient-border">
              <div className="p-6">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-code text-accent-foreground text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Contracts</h3>
                <p className="text-muted-foreground mb-4">Automated, secure, and transparent contract execution on the blockchain.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><i className="fas fa-check text-accent w-4 mr-2"></i>Automated execution</li>
                  <li className="flex items-center"><i className="fas fa-check text-accent w-4 mr-2"></i>Immutable records</li>
                  <li className="flex items-center"><i className="fas fa-check text-accent w-4 mr-2"></i>Gas optimization</li>
                </ul>
              </div>
            </div>

            <div className="gradient-border">
              <div className="p-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-chart-line text-primary-foreground text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">Analytics & Insights</h3>
                <p className="text-muted-foreground mb-4">Comprehensive analytics and real-time insights for informed decision-making.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><i className="fas fa-check text-accent w-4 mr-2"></i>Real-time dashboards</li>
                  <li className="flex items-center"><i className="fas fa-check text-accent w-4 mr-2"></i>Custom reports</li>
                  <li className="flex items-center"><i className="fas fa-check text-accent w-4 mr-2"></i>Predictive analytics</li>
                </ul>
              </div>
            </div>
          </div>

          <TransactionFlow />
        </div>
      </section>
    </div>
  );
}
