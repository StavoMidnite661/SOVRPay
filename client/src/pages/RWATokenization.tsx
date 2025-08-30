import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function RWATokenization() {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [tokenizationMethod, setTokenizationMethod] = useState('');
  const [assetValue, setAssetValue] = useState('');
  const [assetDescription, setAssetDescription] = useState('');

  const assetTypes = [
    {
      id: 'real_estate',
      name: 'Real Estate',
      icon: 'fas fa-building',
      description: 'Tokenize property, commercial buildings, and land assets',
      value: '$2.5M - $50M',
      methods: ['Fractional Ownership', 'REIT Structure', 'Direct Tokenization'],
      badge: 'Popular',
      badgeColor: 'bg-primary text-primary-foreground'
    },
    {
      id: 'commodities',
      name: 'Commodities',
      icon: 'fas fa-coins',
      description: 'Gold, silver, oil, agricultural products, and raw materials',
      value: '$100K - $10M',
      methods: ['Physical Backing', 'Futures-Based', 'Synthetic Exposure'],
      badge: 'Stable',
      badgeColor: 'bg-accent text-accent-foreground'
    },
    {
      id: 'art_collectibles',
      name: 'Art & Collectibles',
      icon: 'fas fa-palette',
      description: 'Fine art, rare collectibles, luxury items, and cultural assets',
      value: '$50K - $5M',
      methods: ['Custody Model', 'Shared Ownership', 'Insurance Backed'],
      badge: 'Premium',
      badgeColor: 'bg-purple-600 text-white'
    },
    {
      id: 'intellectual_property',
      name: 'Intellectual Property',
      icon: 'fas fa-lightbulb',
      description: 'Patents, trademarks, copyrights, and licensing rights',
      value: '$10K - $1M',
      methods: ['Revenue Share', 'License Tokenization', 'Royalty Streams'],
      badge: 'Innovation',
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      icon: 'fas fa-road',
      description: 'Bridges, roads, utilities, and public infrastructure projects',
      value: '$1M - $100M',
      methods: ['Bond Tokenization', 'Revenue Based', 'PPP Structure'],
      badge: 'Government',
      badgeColor: 'bg-green-600 text-white'
    },
    {
      id: 'business_equity',
      name: 'Business Equity',
      icon: 'fas fa-chart-line',
      description: 'Private company shares, startup equity, and business ownership',
      value: '$25K - $10M',
      methods: ['Equity Tokens', 'Profit Sharing', 'Voting Rights'],
      badge: 'Growth',
      badgeColor: 'bg-orange-600 text-white'
    },
    {
      id: 'debt_instruments',
      name: 'Debt Instruments',
      icon: 'fas fa-file-contract',
      description: 'Loans, bonds, invoices, and other debt-based assets',
      value: '$5K - $50M',
      methods: ['Payment Streams', 'Interest Bearing', 'Credit Enhancement'],
      badge: 'Fixed Income',
      badgeColor: 'bg-gray-600 text-white'
    },
    {
      id: 'carbon_credits',
      name: 'Carbon Credits',
      icon: 'fas fa-leaf',
      description: 'Environmental credits, carbon offsets, and sustainability assets',
      value: '$1K - $1M',
      methods: ['Verified Carbon', 'Renewable Energy', 'Nature Based'],
      badge: 'ESG',
      badgeColor: 'bg-emerald-600 text-white'
    }
  ];

  const tokenizationProcess = [
    {
      step: 1,
      title: 'Asset Valuation',
      description: 'Professional appraisal and due diligence',
      status: 'completed'
    },
    {
      step: 2,
      title: 'Legal Framework',
      description: 'Structure legal ownership and compliance',
      status: 'in_progress'
    },
    {
      step: 3,
      title: 'Smart Contract Deployment',
      description: 'Deploy ERC-1155 or ERC-721 contracts',
      status: 'pending'
    },
    {
      step: 4,
      title: 'Token Minting',
      description: 'Mint tokens representing asset ownership',
      status: 'pending'
    },
    {
      step: 5,
      title: 'Market Launch',
      description: 'List tokens on secondary markets',
      status: 'pending'
    }
  ];

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">RWA Tokenization Framework</h1>
          <p className="text-xl text-muted-foreground">
            Transform any real-world asset into tradeable digital tokens with multiple tokenization methodologies
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Asset Selection */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Select Asset Type</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {assetTypes.map((asset) => (
                <Card
                  key={asset.id}
                  className={`cursor-pointer transition-colors ${
                    selectedAsset === asset.id
                      ? 'border-primary'
                      : 'border-border hover:border-primary'
                  }`}
                  onClick={() => setSelectedAsset(asset.id)}
                  data-testid={`asset-${asset.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <i className={`${asset.icon} text-primary text-xl`}></i>
                        <h3 className="font-semibold">{asset.name}</h3>
                      </div>
                      <Badge className={`text-xs ${asset.badgeColor}`}>
                        {asset.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{asset.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-accent font-medium">{asset.value}</span>
                      <span className="text-muted-foreground">{asset.methods.length} methods</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tokenization Configuration */}
            {selectedAsset && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Asset Tokenization Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="asset-value">Asset Value (USD)</Label>
                      <Input
                        id="asset-value"
                        placeholder="Enter asset value"
                        value={assetValue}
                        onChange={(e) => setAssetValue(e.target.value)}
                        data-testid="input-asset-value"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tokenization-method">Tokenization Method</Label>
                      <Select value={tokenizationMethod} onValueChange={setTokenizationMethod}>
                        <SelectTrigger data-testid="select-tokenization-method">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {assetTypes.find(a => a.id === selectedAsset)?.methods.map((method) => (
                            <SelectItem key={method} value={method.toLowerCase().replace(/\s+/g, '_')}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="asset-description">Asset Description</Label>
                    <Textarea
                      id="asset-description"
                      placeholder="Detailed description of the asset to be tokenized..."
                      value={assetDescription}
                      onChange={(e) => setAssetDescription(e.target.value)}
                      data-testid="textarea-asset-description"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="token-supply">Total Token Supply</Label>
                      <Input id="token-supply" placeholder="1,000,000" data-testid="input-token-supply" />
                    </div>
                    <div>
                      <Label htmlFor="min-investment">Minimum Investment</Label>
                      <Input id="min-investment" placeholder="$100" data-testid="input-min-investment" />
                    </div>
                    <div>
                      <Label htmlFor="management-fee">Management Fee (%)</Label>
                      <Input id="management-fee" placeholder="2.5" data-testid="input-management-fee" />
                    </div>
                  </div>
                  <Button className="w-full" data-testid="button-start-tokenization">
                    <i className="fas fa-rocket mr-2"></i>
                    Start Tokenization Process
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tokenization Process */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Tokenization Process</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {tokenizationProcess.map((process, index) => (
                    <div key={process.step} className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        process.status === 'completed' 
                          ? 'bg-green-600 text-white'
                          : process.status === 'in_progress'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {process.status === 'completed' ? (
                          <i className="fas fa-check text-xs"></i>
                        ) : (
                          process.step
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{process.title}</h4>
                        <p className="text-sm text-muted-foreground">{process.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Market Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total RWA Market Cap</span>
                    <span className="font-semibold">$2.3B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Tokenizations</span>
                    <span className="font-semibold">847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Yield</span>
                    <span className="font-semibold text-green-500">8.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Platform Fee</span>
                    <span className="font-semibold">0.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Tokenizations */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Active Tokenizations</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Manhattan Office Building',
                type: 'Real Estate',
                value: '$12.5M',
                tokens: '2,500,000',
                yield: '6.2%',
                status: 'Active'
              },
              {
                name: 'Gold Reserves Portfolio',
                type: 'Commodities',
                value: '$5.8M',
                tokens: '580,000',
                yield: '4.1%',
                status: 'Active'
              },
              {
                name: 'Vintage Art Collection',
                type: 'Art & Collectibles',
                value: '$2.1M',
                tokens: '210,000',
                yield: '12.3%',
                status: 'Upcoming'
              }
            ].map((tokenization, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{tokenization.name}</h3>
                    <Badge 
                      className={`text-xs ${
                        tokenization.status === 'Active' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {tokenization.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{tokenization.type}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Asset Value:</span>
                      <span className="font-medium">{tokenization.value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Token Supply:</span>
                      <span className="font-medium">{tokenization.tokens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Yield:</span>
                      <span className="font-medium text-green-500">{tokenization.yield}</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}