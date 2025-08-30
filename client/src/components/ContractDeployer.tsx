import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import type { SmartContract, CreateSmartContract } from '@shared/schema';

export function ContractDeployer() {
  const [contractName, setContractName] = useState('MyPaymentContract');
  const [selectedTemplate, setSelectedTemplate] = useState('simple_payment');
  const [selectedNetwork, setSelectedNetwork] = useState('testnet');
  
  const queryClient = useQueryClient();

  const contractTemplates = [
    {
      type: 'simple_payment' as const,
      name: 'Simple Payment Contract',
      description: 'Basic payment processing with escrow functionality',
      gasEstimate: 45000,
      badge: 'Template',
      badgeColor: 'bg-primary text-primary-foreground',
    },
    {
      type: 'subscription' as const,
      name: 'Subscription Contract',
      description: 'Recurring payment processing with automatic billing',
      gasEstimate: 68000,
      badge: 'Template',
      badgeColor: 'bg-accent text-accent-foreground',
    },
    {
      type: 'multi_party_escrow' as const,
      name: 'Multi-Party Escrow',
      description: 'Complex escrow with multiple stakeholders and conditions',
      gasEstimate: 92000,
      badge: 'Template',
      badgeColor: 'bg-secondary text-secondary-foreground',
    },
  ];

  const { data: contracts = [] } = useQuery<SmartContract[]>({
    queryKey: ['/api/contracts'],
  });

  const deployContractMutation = useMutation({
    mutationFn: (data: CreateSmartContract) => apiRequest('/api/contracts', {
      method: 'POST',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
    },
  });

  const handleDeploy = () => {
    const template = contractTemplates.find(t => t.type === selectedTemplate);
    if (!template) return;

    deployContractMutation.mutate({
      name: contractName,
      type: selectedTemplate,
      network: selectedNetwork as any,
      parameters: {
        escrowDuration: '7 days',
        feePercentage: '2.5%',
        minAmount: '0.01 ETH',
      },
    });
  };

  const selectedTemplateData = contractTemplates.find(t => t.type === selectedTemplate);

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      {/* Contract Templates */}
      <div>
        <h3 className="text-xl font-semibold mb-6">Contract Templates</h3>
        <div className="space-y-4">
          {contractTemplates.map((template) => (
            <div
              key={template.type}
              className={`bg-card p-4 rounded-lg border transition-colors cursor-pointer ${
                selectedTemplate === template.type
                  ? 'border-primary'
                  : 'border-border hover:border-primary'
              }`}
              onClick={() => setSelectedTemplate(template.type)}
              data-testid={`template-${template.type}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{template.name}</h4>
                <Badge className={`text-xs ${template.badgeColor}`}>
                  {template.badge}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Gas estimate: ~{template.gasEstimate.toLocaleString()}
                </span>
                <button className="text-xs text-primary hover:text-primary/80">
                  Deploy →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button className="w-full" variant="outline">
            <i className="fas fa-code mr-2"></i>
            Custom Contract Builder
          </Button>
        </div>
      </div>

      {/* Deployment Interface */}
      <div>
        <h3 className="text-xl font-semibold mb-6">Contract Deployment</h3>
        <Card>
          <CardHeader>
            <CardTitle>{selectedTemplateData?.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contract-name" className="block text-sm font-medium mb-2">
                Contract Name
              </Label>
              <Input
                id="contract-name"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                data-testid="input-contract-name"
              />
            </div>
            
            <div>
              <Label htmlFor="network" className="block text-sm font-medium mb-2">
                Network
              </Label>
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger data-testid="select-network">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="bsc">BSC</SelectItem>
                  <SelectItem value="testnet">Testnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block text-sm font-medium mb-2">Initial Parameters</Label>
              <div className="bg-secondary rounded-md p-3 font-mono text-xs">
                <div>escrowDuration: 7 days</div>
                <div>feePercentage: 2.5%</div>
                <div>minAmount: 0.01 ETH</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Estimated Gas:</span>
              <span className="font-medium">
                {selectedTemplateData?.gasEstimate.toLocaleString()} (~$12.50)
              </span>
            </div>
            
            <Button
              className="w-full"
              onClick={handleDeploy}
              disabled={deployContractMutation.isPending}
              data-testid="button-deploy-contract"
            >
              <i className="fas fa-rocket mr-2"></i>
              {deployContractMutation.isPending ? 'Deploying...' : 'Deploy Contract'}
            </Button>
          </CardContent>
        </Card>

        {/* Deployed Contracts */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Your Deployed Contracts</h4>
          <div className="space-y-2">
            {contracts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No contracts deployed yet
              </div>
            ) : (
              contracts.map((contract) => (
                <div key={contract.id} className="bg-card p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{contract.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {contract.address || 'Deploying...'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${
                        contract.status === 'deployed' 
                          ? 'bg-green-600 text-white'
                          : contract.status === 'deploying'
                          ? 'bg-blue-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}>
                        {contract.status}
                      </Badge>
                      {contract.status === 'deployed' && (
                        <button className="text-xs text-primary hover:text-primary/80">
                          Interact
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
