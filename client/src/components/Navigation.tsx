import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const [location] = useLocation();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <i className="fas fa-coins text-background text-sm"></i>
              </div>
              <span className="text-xl font-bold">SOVR Pay</span>
            </Link>
            <div className="hidden lg:flex space-x-6 ml-8">
              <button 
                onClick={() => scrollToSection('overview')}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Overview
              </button>
              <Link href="/ecosystem-demo">
                <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Live Demo
                </button>
              </Link>
              <Link href="/real-world-shopping">
                <button className="text-primary hover:text-primary/80 transition-colors text-sm font-medium">
                  🛒 Live Shopping
                </button>
              </Link>
              <Link href="/rwa-tokenization">
                <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  RWA Tokenization
                </button>
              </Link>
              <Link href="/integration-hub">
                <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Integration Hub
                </button>
              </Link>
              <Link href="/api-testing">
                <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  API Testing
                </button>
              </Link>
              <Link href="/smart-contracts">
                <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Smart Contracts
                </button>
              </Link>
              <Link href="/defi-protocols">
                <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  DeFi Protocols
                </button>
              </Link>
              <Link href="/banking-compliance">
                <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Banking & Compliance
                </button>
              </Link>
              <Link href="/monitoring">
                <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Monitoring
                </button>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="secondary" size="sm">
              Documentation
            </Button>
            <Button size="sm" className="font-medium">
              Start Integration
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
