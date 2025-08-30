import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/pages/Dashboard';
import { EcosystemDemo } from '@/pages/EcosystemDemo';
import { RealWorldShopping } from '@/pages/RealWorldShopping';
import { BrowserExtension } from '@/pages/BrowserExtension';
import { RWATokenization } from '@/pages/RWATokenization';
import { IntegrationHub } from '@/pages/IntegrationHub';
import { Integration } from '@/pages/Integration';
import { ApiTesting } from '@/pages/ApiTesting';
import { SmartContracts } from '@/pages/SmartContracts';
import { DeFiProtocols } from '@/pages/DeFiProtocols';
import { BankingCompliance } from '@/pages/BankingCompliance';
import { Monitoring } from '@/pages/Monitoring';
import NotFound from '@/pages/not-found';
import { queryClient } from '@/lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        
        <main>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/ecosystem-demo" component={EcosystemDemo} />
            <Route path="/real-world-shopping" component={RealWorldShopping} />
            <Route path="/browser-extension" component={BrowserExtension} />
            <Route path="/rwa-tokenization" component={RWATokenization} />
            <Route path="/integration-hub" component={IntegrationHub} />
            <Route path="/integration" component={Integration} />
            <Route path="/api-testing" component={ApiTesting} />
            <Route path="/smart-contracts" component={SmartContracts} />
            <Route path="/defi-protocols" component={DeFiProtocols} />
            <Route path="/banking-compliance" component={BankingCompliance} />
            <Route path="/monitoring" component={Monitoring} />
            <Route component={NotFound} />
          </Switch>
        </main>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <i className="fas fa-coins text-background text-sm"></i>
                  </div>
                  <span className="text-xl font-bold">SOVR Pay</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  The complete payment ecosystem for the digital economy. Secure, fast, and reliable.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Products</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Payment Processing</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Smart Contracts</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Analytics</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">API Documentation</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Contact Support</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2024 SOVR Pay. All rights reserved.</p>
            </div>
          </div>
        </footer>

        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
