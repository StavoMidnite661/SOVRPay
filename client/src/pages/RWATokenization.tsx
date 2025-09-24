import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { SystemMetrics, TokenizedAsset, AssetValuation, MarketPrice, PropertyInsight, InsertTokenizedAsset } from '@shared/schema';
import { insertTokenizedAssetSchema } from '@shared/schema';
import { z } from 'zod';

// Form input schema - for form inputs before transformation
const assetFormInputSchema = insertTokenizedAssetSchema.extend({
  tokenSupply: z.string(),
  minimumInvestment: z.string(), 
  managementFee: z.string(),
});

// Form schema with transformations for submission
const assetFormSchema = insertTokenizedAssetSchema.extend({
  tokenSupply: z.string().transform(val => parseInt(val)),
  minimumInvestment: z.string().transform(val => parseFloat(val)),
  managementFee: z.string().transform(val => parseFloat(val)),
});

type AssetFormInputData = z.infer<typeof assetFormInputSchema>;
type AssetFormData = z.infer<typeof assetFormSchema>;

export function RWATokenization() {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [tokenizationMethod, setTokenizationMethod] = useState('');
  const [assetValue, setAssetValue] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<SystemMetrics | null>(null);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<TokenizedAsset | null>(null);
  const [currentLedgerPage, setCurrentLedgerPage] = useState(1);
  const [liveMarketPrices, setLiveMarketPrices] = useState<MarketPrice[]>([]);
  const [assetValuationUpdates, setAssetValuationUpdates] = useState<any[]>([]);
  const { lastMessage } = useWebSocket('/ws');
  const { toast } = useToast();

  // Data fetching hooks
  const { data: metrics } = useQuery<SystemMetrics>({
    queryKey: ['/api/metrics'],
  });

  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ['/api/assets', currentLedgerPage],
    queryFn: async () => {
      const response = await fetch(`/api/assets?page=${currentLedgerPage}&limit=10&sortBy=createdAt&sortOrder=desc`);
      return response.json();
    },
  });

  const { data: marketPricesData } = useQuery({
    queryKey: ['/api/markets/prices'],
    queryFn: async () => {
      const response = await fetch('/api/markets/prices?page=1&limit=20&sortBy=timestamp&sortOrder=desc');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Asset creation form
  const form = useForm<AssetFormInputData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: '',
      symbol: '',
      description: '',
      assetType: 'real_estate' as const,
      totalSupply: 1000000,
      availableSupply: 1000000,
      pricePerToken: 1.0,
      currency: 'USD',
      network: 'polygon' as const,
      tokenStandard: 'ERC20' as const,
      underlyingAssetValue: 1000000,
      lastValuationDate: new Date().toISOString().split('T')[0],
      regulatoryStatus: 'pending' as const,
      jurisdictions: ['US'],
      complianceDocuments: [],
      isListed: false,
      tradingEnabled: false,
      tokenSupply: '1000000',
      minimumInvestment: '100',
      managementFee: '2.5',
    },
  });

  // Asset creation mutation
  const createAssetMutation = useMutation({
    mutationFn: async (data: InsertTokenizedAsset) => {
      return apiRequest('/api/assets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Asset Created',
        description: `Successfully created tokenized asset: ${data.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      form.reset();
      setSelectedAsset(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create asset. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // WebSocket message handling
  useEffect(() => {
    if (lastMessage?.type === 'metrics_update') {
      setLiveMetrics(lastMessage.data);
    } else if (lastMessage?.type === 'live_market_prices') {
      setLiveMarketPrices(lastMessage.data || []);
    } else if (lastMessage?.type === 'asset_valuation_update') {
      setAssetValuationUpdates(prev => [lastMessage.data, ...prev.slice(0, 9)]);
      toast({
        title: 'Valuation Update',
        description: `Asset valuation updated: ${lastMessage.data.changePercent > 0 ? '+' : ''}${lastMessage.data.changePercent.toFixed(2)}%`,
      });
    } else if (lastMessage?.type === 'asset_created') {
      toast({
        title: 'New Asset',
        description: `New asset tokenized: ${lastMessage.data.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
    }
  }, [lastMessage, toast]);

  const currentMetrics = liveMetrics || metrics;
  const currentMarketPrices = liveMarketPrices.length > 0 ? liveMarketPrices : marketPricesData?.data || [];
  const assets = assetsData?.data || [];

  // Form submission handler
  const onSubmit = async (data: AssetFormInputData) => {
    try {
      const assetData: InsertTokenizedAsset = {
        name: data.name,
        symbol: data.symbol,
        description: data.description,
        assetType: data.assetType,
        totalSupply: data.totalSupply,
        availableSupply: data.totalSupply,
        pricePerToken: data.pricePerToken,
        currency: data.currency,
        network: data.network,
        tokenStandard: data.tokenStandard,
        underlyingAssetValue: data.underlyingAssetValue,
        lastValuationDate: data.lastValuationDate,
        regulatoryStatus: data.regulatoryStatus,
        jurisdictions: data.jurisdictions,
        complianceDocuments: [],
        isListed: false,
        tradingEnabled: false,
        minimumInvestment: parseFloat(data.minimumInvestment),
        metadata: {
          tokenSupply: parseInt(data.tokenSupply),
          managementFee: parseFloat(data.managementFee),
          tokenizationMethod: tokenizationMethod,
        },
      };
      
      await createAssetMutation.mutateAsync(assetData);
    } catch (error) {
      console.error('Asset creation failed:', error);
    }
  };

  // Helper function to get asset type from ID
  const getAssetTypeFromId = (id: string) => {
    return assetTypes.find(type => type.id === id);
  };

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
      id: 'commodity',
      name: 'Commodities',
      icon: 'fas fa-coins',
      description: 'Gold, silver, oil, agricultural products, and raw materials',
      value: '$100K - $10M',
      methods: ['Physical Backing', 'Futures-Based', 'Synthetic Exposure'],
      badge: 'Stable',
      badgeColor: 'bg-accent text-accent-foreground'
    },
    {
      id: 'artwork',
      name: 'Art & Collectibles',
      icon: 'fas fa-palette',
      description: 'Fine art, rare collectibles, luxury items, and cultural assets',
      value: '$50K - $5M',
      methods: ['Custody Model', 'Shared Ownership', 'Insurance Backed'],
      badge: 'Premium',
      badgeColor: 'bg-purple-600 text-white'
    },
    {
      id: 'collectible',
      name: 'Collectibles',
      icon: 'fas fa-gem',
      description: 'Rare collectibles, vintage items, and specialty assets',
      value: '$10K - $2M',
      methods: ['Authentication Based', 'Fractionalized', 'Vault Storage'],
      badge: 'Specialty',
      badgeColor: 'bg-violet-600 text-white'
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
      id: 'stock',
      name: 'Stock Equity',
      icon: 'fas fa-chart-line',
      description: 'Public and private company shares, equity tokens',
      value: '$25K - $10M',
      methods: ['Equity Tokens', 'Profit Sharing', 'Voting Rights'],
      badge: 'Growth',
      badgeColor: 'bg-orange-600 text-white'
    },
    {
      id: 'bond',
      name: 'Bonds & Debt',
      icon: 'fas fa-file-contract',
      description: 'Government bonds, corporate debt, and fixed income securities',
      value: '$5K - $50M',
      methods: ['Payment Streams', 'Interest Bearing', 'Credit Enhancement'],
      badge: 'Fixed Income',
      badgeColor: 'bg-gray-600 text-white'
    }
  ];

  const tokenizationProcess = [
    {
      step: 1,
      title: 'Asset Valuation',
      description: 'Professional appraisal and due diligence',
      status: 'completed',
      details: [
        'Third-party property assessment',
        'Market analysis and comparable sales',
        'Financial audit and cash flow review',
        'Legal title and ownership verification'
      ]
    },
    {
      step: 2,
      title: 'Legal Framework',
      description: 'Structure legal ownership and compliance',
      status: 'in_progress',
      details: [
        'Special Purpose Vehicle (SPV) creation',
        'Securities law compliance review',
        'Investor accreditation requirements',
        'Regulatory jurisdiction analysis'
      ]
    },
    {
      step: 3,
      title: 'Smart Contract Deployment',
      description: 'Deploy ERC-1155 or ERC-721 contracts',
      status: 'pending',
      details: [
        'Contract code development and testing',
        'Security audit by third-party firm',
        'Deployment to Polygon mainnet',
        'Contract verification and documentation'
      ]
    },
    {
      step: 4,
      title: 'Token Minting',
      description: 'Mint tokens representing asset ownership',
      status: 'pending',
      details: [
        'Calculate token supply and fractions',
        'Mint initial token allocation',
        'Set up distribution mechanisms',
        'Configure governance and voting rights'
      ]
    },
    {
      step: 5,
      title: 'Market Launch',
      description: 'List tokens on secondary markets',
      status: 'pending',
      details: [
        'List on SOVR Pay marketplace',
        'Integration with external exchanges',
        'Market maker and liquidity setup',
        'Marketing and investor outreach'
      ]
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

            {/* Asset Creation Form */}
            {selectedAsset && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Asset Tokenization Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Asset Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter asset name" {...field} data-testid="input-asset-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="symbol"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Token Symbol</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., PROP" {...field} data-testid="input-token-symbol" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Asset Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Detailed description of the asset to be tokenized..."
                                {...field}
                                data-testid="textarea-asset-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="underlyingAssetValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Asset Value (USD)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Enter asset value"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  data-testid="input-asset-value"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div>
                          <Label htmlFor="tokenization-method">Tokenization Method</Label>
                          <Select value={tokenizationMethod} onValueChange={setTokenizationMethod}>
                            <SelectTrigger data-testid="select-tokenization-method">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAssetTypeFromId(selectedAsset)?.methods.map((method) => (
                                <SelectItem key={method} value={method.toLowerCase().replace(/\s+/g, '_')}>
                                  {method}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="tokenSupply"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Token Supply</FormLabel>
                              <FormControl>
                                <Input placeholder="1,000,000" {...field} data-testid="input-token-supply" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="minimumInvestment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Investment ($)</FormLabel>
                              <FormControl>
                                <Input placeholder="100" {...field} data-testid="input-min-investment" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="managementFee"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Management Fee (%)</FormLabel>
                              <FormControl>
                                <Input placeholder="2.5" {...field} data-testid="input-management-fee" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="network"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blockchain Network</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select network" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="ethereum">Ethereum</SelectItem>
                                  <SelectItem value="polygon">Polygon</SelectItem>
                                  <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                                  <SelectItem value="optimism">Optimism</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="tokenStandard"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Token Standard</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select standard" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="ERC20">ERC-20 (Fungible)</SelectItem>
                                  <SelectItem value="ERC721">ERC-721 (NFT)</SelectItem>
                                  <SelectItem value="ERC1155">ERC-1155 (Multi-Token)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={createAssetMutation.isPending}
                        data-testid="button-start-tokenization"
                      >
                        {createAssetMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating Asset...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-rocket mr-2"></i>
                            Create Tokenized Asset
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tokenization Process */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Tokenization Process</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {tokenizationProcess.map((process, index) => (
                    <Collapsible
                      key={process.step}
                      open={expandedStep === process.step}
                      onOpenChange={(isOpen) => setExpandedStep(isOpen ? process.step : null)}
                    >
                      <CollapsibleTrigger className="w-full" data-testid={`step-${process.step}`}>
                        <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
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
                          <div className="flex-1 text-left">
                            <h4 className="font-medium mb-1">{process.title}</h4>
                            <p className="text-sm text-muted-foreground">{process.description}</p>
                          </div>
                          <i className={`fas fa-chevron-${expandedStep === process.step ? 'up' : 'down'} text-xs text-muted-foreground mt-2`}></i>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-12 mt-2 p-3 bg-secondary/20 rounded-lg">
                          <h5 className="font-medium text-sm mb-2">Required Actions:</h5>
                          <ul className="space-y-1">
                            {process.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="text-sm text-muted-foreground flex items-center">
                                <i className="fas fa-circle text-xs mr-2"></i>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Live Market Pricing */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Live Market Pricing
                  <Badge variant="outline" className="animate-pulse">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentMarketPrices.length > 0 ? (
                  <div className="space-y-3">
                    {currentMarketPrices.slice(0, 5).map((price: MarketPrice, index: number) => (
                      <div key={price.id || index} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <i className="fas fa-chart-line text-primary text-xs"></i>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{price.assetId?.replace('_live', '').toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground">{price.sourceName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${price.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          <p className={`text-xs ${
                            (price.changePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {(price.changePercent || 0) >= 0 ? '+' : ''}{(price.changePercent || 0).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Market Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Market Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {currentMetrics ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Total RWA Market Cap</span>
                      <span className="font-semibold">${(currentMetrics.transactionVolume * 0.5 / 1000).toFixed(1)}B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Active Tokenizations</span>
                      <span className="font-semibold">{Math.round(currentMetrics.activeMerchants * 0.5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Yield</span>
                      <span className="font-semibold text-green-500">{(currentMetrics.successRate * 0.08).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Platform Fee</span>
                      <span className="font-semibold">0.5%</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Valuation Updates */}
            {assetValuationUpdates.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Valuations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {assetValuationUpdates.slice(0, 3).map((update, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            update.changePercent > 0 ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm">{update.assetId}</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          update.changePercent > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {update.changePercent > 0 ? '+' : ''}{update.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Asset Ledger Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Asset Ledger</h2>
            <Badge variant="outline" className="font-mono">
              {assets.length} Assets
            </Badge>
          </div>
          
          {assetsLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Supply</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No tokenized assets found. Create your first asset above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      assets.map((asset: TokenizedAsset) => (
                        <TableRow key={asset.id} className="hover:bg-secondary/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <i className="fas fa-cube text-primary text-xs"></i>
                              </div>
                              <div>
                                <p className="font-medium">{asset.name}</p>
                                <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {assetTypes.find(type => type.id === asset.assetType)?.name || asset.assetType.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">
                            ${asset.underlyingAssetValue.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono">
                            {asset.totalSupply.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono">
                            ${asset.pricePerToken.toFixed(4)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={asset.status === 'active' ? 'default' : 'secondary'}
                              className={`${asset.status === 'active' ? 'bg-green-600' : ''}`}
                            >
                              {asset.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedAssetDetail(asset)}
                                  data-testid={`button-asset-detail-${asset.id}`}
                                >
                                  <i className="fas fa-eye mr-1"></i>
                                  Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center space-x-2">
                                    <i className="fas fa-cube text-primary"></i>
                                    <span>{asset.name} ({asset.symbol})</span>
                                  </DialogTitle>
                                </DialogHeader>
                                <AssetDetailModal asset={asset} />
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          
          {/* Pagination */}
          {assetsData?.pagination && assetsData.pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentLedgerPage(prev => Math.max(1, prev - 1))}
                      className={currentLedgerPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, assetsData.pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentLedgerPage(pageNum)}
                          isActive={currentLedgerPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {assetsData.pagination.totalPages > 5 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentLedgerPage(prev => Math.min(assetsData.pagination.totalPages, prev + 1))}
                      className={currentLedgerPage === assetsData.pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Asset Detail Modal Component
function AssetDetailModal({ asset }: { asset: TokenizedAsset }) {
  const { data: valuations } = useQuery({
    queryKey: ['/api/assets', asset.id, 'valuations'],
    queryFn: async () => {
      const response = await fetch(`/api/assets/${asset.id}/valuations`);
      return response.json();
    },
  });

  const { data: insights } = useQuery({
    queryKey: ['/api/assets', asset.id, 'insights'],
    queryFn: async () => {
      const response = await fetch(`/api/assets/${asset.id}/insights`);
      return response.json();
    },
  });

  const { data: priceHistory } = useQuery({
    queryKey: ['/api/markets/prices', asset.id, 'history'],
    queryFn: async () => {
      const response = await fetch(`/api/markets/prices/${asset.id}/history?limit=30`);
      return response.json();
    },
  });

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="valuation">Valuation</TabsTrigger>
        <TabsTrigger value="market">Market Data</TabsTrigger>
        <TabsTrigger value="insights">Insights</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4 mt-4">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asset Type:</span>
                <Badge>{asset.assetType.replace('_', ' ')}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-mono">{asset.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token Standard:</span>
                <span className="font-mono">{asset.tokenStandard}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Regulatory Status:</span>
                <Badge variant={asset.regulatoryStatus === 'compliant' ? 'default' : 'secondary'}>
                  {asset.regulatoryStatus}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trading:</span>
                <Badge variant={asset.tradingEnabled ? 'default' : 'secondary'}>
                  {asset.tradingEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Underlying Value:</span>
                <span className="font-mono">${asset.underlyingAssetValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Supply:</span>
                <span className="font-mono">{asset.totalSupply.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available Supply:</span>
                <span className="font-mono">{asset.availableSupply.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per Token:</span>
                <span className="font-mono">${asset.pricePerToken.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min. Investment:</span>
                <span className="font-mono">${asset.minimumInvestment?.toLocaleString() || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{asset.description || 'No description available.'}</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="valuation" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Valuation History</CardTitle>
          </CardHeader>
          <CardContent>
            {valuations?.data?.length > 0 ? (
              <div className="space-y-4">
                {valuations.data.map((valuation: AssetValuation) => (
                  <div key={valuation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge>{valuation.valuationType}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(valuation.valuationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">
                        ${valuation.valuationAmount.toLocaleString()}
                      </span>
                      <Badge variant={valuation.status === 'approved' ? 'default' : 'secondary'}>
                        {valuation.status}
                      </Badge>
                    </div>
                    {valuation.methodology && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Methodology: {valuation.methodology}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No valuation history available.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="market" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
          </CardHeader>
          <CardContent>
            {priceHistory?.data?.length > 0 ? (
              <div className="space-y-3">
                {priceHistory.data.slice(0, 10).map((price: MarketPrice) => (
                  <div key={price.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-mono">${price.price.toFixed(4)}</p>
                      <p className="text-sm text-muted-foreground">{price.sourceName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(price.timestamp).toLocaleString()}
                      </p>
                      {price.changePercent && (
                        <p className={`text-sm ${
                          price.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {price.changePercent >= 0 ? '+' : ''}{price.changePercent.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No price history available.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="insights" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Property Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {insights?.data?.length > 0 ? (
              <div className="space-y-4">
                {insights.data.map((insight: PropertyInsight) => (
                  <div key={insight.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge>{insight.insightType.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    
                    {insight.keyMetrics && Object.keys(insight.keyMetrics).length > 0 && (
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        {Object.entries(insight.keyMetrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{key.replace('_', ' ')}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {insight.riskLevel && (
                      <div className="mt-3">
                        <Badge 
                          variant={insight.riskLevel === 'low' ? 'default' : 
                                 insight.riskLevel === 'medium' ? 'secondary' : 'destructive'}
                        >
                          Risk: {insight.riskLevel}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No insights available for this asset.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}