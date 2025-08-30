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
            <div className="hidden md:flex space-x-8 ml-8">
              <button 
                onClick={() => scrollToSection('overview')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Overview
              </button>
              <Link href="/integration">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  Integration
                </button>
              </Link>
              <Link href="/api-testing">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  API Testing
                </button>
              </Link>
              <Link href="/smart-contracts">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  Smart Contracts
                </button>
              </Link>
              <Link href="/monitoring">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
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
