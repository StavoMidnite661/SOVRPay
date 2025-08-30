import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function DeFiProtocols() {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [poolSelection, setPoolSelection] = useState('');

  const defiProtocols = [
    {
      id: 'yield_farming',
      name: 'Yield Farming',
      icon: 'fas fa-seedling',
      description: 'Earn rewards by providing liquidity to RWA token pools',
      apy: '12.4%',
      tvl: '$45.2M',
      risk: 'Medium',
      badge: 'High Yield',
      badgeColor: 'bg-green-600 text-white'
    },
    {
      id: 'staking',
      name: 'SOVR Staking',
      icon: 'fas fa-lock',
      description: 'Stake SOVR tokens to earn governance rewards and fee shares',
      apy: '8.7%',
      tvl: '$128.5M',
      risk: 'Low',
      badge: 'Stable',
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'lending',
      name: 'RWA Lending',
      icon: 'fas fa-hand-holding-usd',
      description: 'Lend your RWA tokens and earn interest from borrowers',
      apy: '6.2%',
      tvl: '$67.8M',
      risk: 'Low',
      badge: 'Conservative',
      badgeColor: 'bg-gray-600 text-white'
    },
    {
      id: 'governance',
      name: 'DAO Governance',
      icon: 'fas fa-vote-yea',
      description: 'Participate in protocol governance and earn voting rewards',
      apy: '4.1%',
      tvl: '$234.1M',
      risk: 'Very Low',
      badge: 'Governance',
      badgeColor: 'bg-purple-600 text-white'
    }
  ];

  const liquidityPools = [
    {
      name: 'SOVR/ETH',
      apy: '15.2%',
      tvl: '$12.3M',
      volume24h: '$2.1M',
      fees: '0.3%'
    },
    {
      name: 'RWA-RE/USDC',
      apy: '11.8%',
      tvl: '$8.7M',
      volume24h: '$890K',
      fees: '0.25%'
    },
    {
      name: 'RWA-GOLD/DAI',
      apy: '9.4%',
      tvl: '$15.6M',
      volume24h: '$1.2M',
      fees: '0.2%'
    },
    {
      name: 'SOVR/USDT',
      apy: '13.7%',
      tvl: '$19.4M',
      volume24h: '$3.4M',
      fees: '0.3%'
    }
  ];

  const governanceProposals = [
    {
      id: 'PROP-001',
      title: 'Increase RWA Tokenization Fee Structure',
      description: 'Proposal to adjust tokenization fees from 0.5% to 0.75% to fund protocol development',
      status: 'Active',
      votes: { for: 12500000, against: 2100000 },
      timeLeft: '3 days',
      quorum: '15M SOVR'
    },
    {
      id: 'PROP-002',
      title: 'Add Support for Carbon Credit Tokenization',
      description: 'Enable tokenization of verified carbon credits with integrated ESG tracking',
      status: 'Pending',
      votes: { for: 8900000, against: 1200000 },
      timeLeft: '7 days',
      quorum: '15M SOVR'
    },
    {
      id: 'PROP-003',
      title: 'Launch Cross-Chain Bridge to Polygon',
      description: 'Deploy SOVR tokens and RWA assets to Polygon for lower fees',
      status: 'Executed',
      votes: { for: 18200000, against: 800000 },
      timeLeft: 'Completed',
      quorum: '15M SOVR'
    }
  ];

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">DeFi Protocols & Governance</h1>
          <p className="text-xl text-muted-foreground">
            Participate in the SOVR Pay DeFi ecosystem with yield farming, staking, and governance
          </p>
        </div>

        <Tabs defaultValue="protocols" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="protocols">DeFi Protocols</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity Pools</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="treasury">Treasury</TabsTrigger>
          </TabsList>

          <TabsContent value="protocols" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Protocol Selection */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Available Protocols</h2>
                <div className="space-y-4">
                  {defiProtocols.map((protocol) => (
                    <Card
                      key={protocol.id}
                      className={`cursor-pointer transition-colors ${
                        selectedProtocol === protocol.id
                          ? 'border-primary'
                          : 'border-border hover:border-primary'
                      }`}
                      onClick={() => setSelectedProtocol(protocol.id)}
                      data-testid={`protocol-${protocol.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <i className={`${protocol.icon} text-primary text-xl`}></i>
                            <h3 className="font-semibold">{protocol.name}</h3>
                          </div>
                          <Badge className={`text-xs ${protocol.badgeColor}`}>
                            {protocol.badge}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{protocol.description}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">APY:</span>
                            <span className="font-medium text-green-500 ml-1">{protocol.apy}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">TVL:</span>
                            <span className="font-medium ml-1">{protocol.tvl}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Risk:</span>
                            <span className="font-medium ml-1">{protocol.risk}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Protocol Interaction */}
              <div>
                {selectedProtocol ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {defiProtocols.find(p => p.id === selectedProtocol)?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="stake-amount">Amount to Stake/Provide</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="stake-amount"
                            placeholder="0.00"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            data-testid="input-stake-amount"
                          />
                          <Button variant="outline" size="default">
                            MAX
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Estimated Annual Rewards:</span>
                          <span className="font-medium text-green-500">
                            {stakeAmount ? `${(parseFloat(stakeAmount) * 0.124).toFixed(2)} SOVR` : '0.00 SOVR'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Daily Rewards:</span>
                          <span className="font-medium">
                            {stakeAmount ? `${(parseFloat(stakeAmount) * 0.124 / 365).toFixed(4)} SOVR` : '0.00 SOVR'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Lock Period:</span>
                          <span className="font-medium">
                            {selectedProtocol === 'staking' ? '30 days' : 'None'}
                          </span>
                        </div>
                      </div>

                      <Button className="w-full" data-testid="button-stake">
                        <i className="fas fa-coins mr-2"></i>
                        {selectedProtocol === 'staking' ? 'Stake SOVR' : 
                         selectedProtocol === 'lending' ? 'Lend Assets' :
                         selectedProtocol === 'governance' ? 'Delegate Votes' : 'Provide Liquidity'}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <i className="fas fa-chart-line text-4xl text-primary mb-4"></i>
                      <h3 className="text-xl font-semibold mb-2">Select a Protocol</h3>
                      <p className="text-muted-foreground">
                        Choose a DeFi protocol to start earning rewards
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="liquidity" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {liquidityPools.map((pool, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{pool.name}</h3>
                      <Badge className="bg-green-600 text-white text-xs">
                        {pool.apy} APY
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">TVL:</span>
                        <span className="font-medium ml-2">{pool.tvl}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">24h Volume:</span>
                        <span className="font-medium ml-2">{pool.volume24h}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fees:</span>
                        <span className="font-medium ml-2">{pool.fees}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Your Share:</span>
                        <span className="font-medium ml-2">0.00%</span>
                      </div>
                    </div>
                    <Button className="w-full mt-3" size="sm">
                      Add Liquidity
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="governance" className="space-y-8">
            <div className="space-y-6">
              {governanceProposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{proposal.id}</Badge>
                        <h3 className="font-semibold">{proposal.title}</h3>
                      </div>
                      <Badge 
                        className={`text-xs ${
                          proposal.status === 'Active' 
                            ? 'bg-green-600 text-white'
                            : proposal.status === 'Pending'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {proposal.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{proposal.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>For: {(proposal.votes.for / 1000000).toFixed(1)}M SOVR</span>
                          <span>Against: {(proposal.votes.against / 1000000).toFixed(1)}M SOVR</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${(proposal.votes.for / (proposal.votes.for + proposal.votes.against)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>Time Left: <span className="font-medium">{proposal.timeLeft}</span></div>
                        <div>Quorum: <span className="font-medium">{proposal.quorum}</span></div>
                      </div>
                    </div>

                    {proposal.status === 'Active' && (
                      <div className="flex space-x-2">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700">
                          Vote For
                        </Button>
                        <Button className="flex-1" variant="destructive">
                          Vote Against
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="treasury" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Protocol Treasury</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">$127.8M</div>
                  <div className="text-sm text-muted-foreground mb-4">Total Treasury Value</div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>SOVR Tokens:</span>
                      <span className="font-medium">45.2M ($67.8M)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RWA Assets:</span>
                      <span className="font-medium">$34.5M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stablecoins:</span>
                      <span className="font-medium">$18.7M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other Assets:</span>
                      <span className="font-medium">$6.8M</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Streams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Trading Fees</span>
                        <span className="font-medium">$234K/month</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tokenization Fees</span>
                        <span className="font-medium">$156K/month</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Lending Interest</span>
                        <span className="font-medium">$89K/month</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '17%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Other Revenue</span>
                        <span className="font-medium">$42K/month</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '8%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Staking Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-green-500">8.7%</div>
                    <div className="text-sm text-muted-foreground">Current APY</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Staked:</span>
                      <span className="font-medium">67.8M SOVR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Staking Ratio:</span>
                      <span className="font-medium">68.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Your Stake:</span>
                      <span className="font-medium">0 SOVR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Claimable Rewards:</span>
                      <span className="font-medium text-green-500">0 SOVR</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    Claim Rewards
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}