import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect, useState } from 'react';
import type { SystemMetrics, GeographicData } from '@shared/schema';

export function MonitoringCharts() {
  const [liveMetrics, setLiveMetrics] = useState<SystemMetrics | null>(null);
  
  const { lastMessage } = useWebSocket('/ws');

  const { data: metrics } = useQuery<SystemMetrics>({
    queryKey: ['/api/metrics'],
  });

  const { data: geoData = [] } = useQuery<GeographicData[]>({
    queryKey: ['/api/geographic-data'],
  });

  useEffect(() => {
    if (lastMessage?.type === 'metrics') {
      setLiveMetrics(lastMessage.data);
    }
  }, [lastMessage]);

  const currentMetrics = liveMetrics || metrics;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getFlagEmoji = (countryCode: string) => {
    const flags: Record<string, string> = {
      'US': '🇺🇸',
      'GB': '🇬🇧',
      'DE': '🇩🇪',
      'CA': '🇨🇦',
    };
    return flags[countryCode] || '🌍';
  };

  if (!currentMetrics) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Transaction Volume */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Transaction Volume</h3>
              <i className="fas fa-chart-bar text-primary"></i>
            </div>
            <div className="text-3xl font-bold text-primary mb-2" data-testid="text-transaction-volume">
              {formatCurrency(currentMetrics.transactionVolume)}
            </div>
            <div className="text-sm text-muted-foreground mb-4">Last 24 hours</div>
            <div className="h-20 bg-gradient-to-r from-primary/20 to-accent/20 rounded-md relative">
              {/* Mock chart visualization */}
              <div className="absolute bottom-0 left-0 w-full h-full flex items-end space-x-1 p-2">
                {[4, 8, 12, 6, 16, 10, 14].map((height, index) => (
                  <div
                    key={index}
                    className="bg-primary flex-1 rounded-sm"
                    style={{ height: `${height * 4}px` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Success Rate</h3>
              <i className="fas fa-check-circle text-accent"></i>
            </div>
            <div className="text-3xl font-bold text-accent mb-2" data-testid="text-success-rate">
              {currentMetrics.successRate}%
            </div>
            <div className="text-sm text-muted-foreground mb-4">Last 30 days</div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-500" 
                style={{ width: `${currentMetrics.successRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Active Merchants */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Active Merchants</h3>
              <i className="fas fa-users text-primary"></i>
            </div>
            <div className="text-3xl font-bold text-primary mb-2" data-testid="text-active-merchants">
              {currentMetrics.activeMerchants.toLocaleString()}
            </div>
            <div className="text-sm text-green-500 mb-4">+12% vs last month</div>
            <div className="text-xs text-muted-foreground">
              Online: {Math.floor(currentMetrics.activeMerchants * 0.88).toLocaleString()} • 
              Offline: {Math.floor(currentMetrics.activeMerchants * 0.12).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Transaction Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction Timeline</CardTitle>
              <select className="bg-input border border-border rounded px-2 py-1 text-xs">
                <option>Last 24h</option>
                <option>Last 7d</option>
                <option>Last 30d</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end space-x-2">
              {/* Mock chart bars */}
              {[30, 45, 60, 75, 90, 65, 80, 55, 70, 95].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 bg-primary/60 rounded-t transition-all duration-500"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {geoData.map((country) => (
                <div key={country.countryCode} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flag-icon">{getFlagEmoji(country.countryCode)}</span>
                    <span className="text-sm">{country.country}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${country.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{country.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert System */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            <div className="p-4 flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">All systems operational</div>
                <div className="text-xs text-muted-foreground">Last checked: 2 minutes ago</div>
              </div>
              <Badge variant="secondary" className="text-xs text-green-500">Normal</Badge>
            </div>
            <div className="p-4 flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Elevated response times detected</div>
                <div className="text-xs text-muted-foreground">
                  Average: {currentMetrics.averageResponseTime}ms (normal: 50ms)
                </div>
              </div>
              <Badge variant="secondary" className="text-xs text-yellow-500">Warning</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
