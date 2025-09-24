import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { SmartContract, CreateSmartContract } from '@shared/schema';

export function ContractDeployer() {
  const [contractName, setContractName] = useState('MyPaymentContract');
  const [selectedTemplate, setSelectedTemplate] = useState('simple_payment');
  const [selectedNetwork, setSelectedNetwork] = useState('testnet');
  const [interactingContract, setInteractingContract] = useState<SmartContract | null>(null);
  const [methodInputs, setMethodInputs] = useState<{ [key: string]: string }>({});
  const [callResults, setCallResults] = useState<{ [key: string]: any }>({});
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    queryFn: () => {
      // Return empty array initially - contracts will be managed by mutations
      return [];
    },
  });

  const deployContractMutation = useMutation({
    mutationFn: async (data: CreateSmartContract) => {
      // Simulate contract deployment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock contract address
      const address = '0x' + Math.random().toString(16).substr(2, 40);
      
      const deployedContract: SmartContract = {
        id: Date.now().toString(),
        name: data.name,
        type: data.type,
        network: data.network,
        address,
        status: 'deployed',
        parameters: data.parameters,
        createdAt: new Date().toISOString(),
      };
      
      return deployedContract;
    },
    onSuccess: (deployedContract) => {
      // Update the local contracts list
      queryClient.setQueryData(['/api/contracts'], (oldData: SmartContract[] = []) => {
        const filtered = oldData.filter(c => c.name !== deployedContract.name);
        return [...filtered, deployedContract];
      });
      
      toast({
        title: "Contract Deployed Successfully",
        description: `${deployedContract.name} has been deployed to ${deployedContract.network}`,
      });
    },
    onError: () => {
      toast({
        title: "Deployment Failed",
        description: "There was an error deploying your contract. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeploy = () => {
    const template = contractTemplates.find(t => t.type === selectedTemplate);
    if (!template) return;

    // Add deploying contract to the list immediately
    const deployingContract: SmartContract = {
      id: Date.now().toString(),
      name: contractName,
      type: selectedTemplate as CreateSmartContract['type'],
      network: selectedNetwork as CreateSmartContract['network'],
      address: '',
      status: 'deploying',
      parameters: {
        escrowDuration: '7 days',
        feePercentage: '2.5%',
        minAmount: '0.01 ETH',
      },
      createdAt: new Date().toISOString(),
    };
    
    queryClient.setQueryData(['/api/contracts'], (oldData: SmartContract[] = []) => {
      const filtered = oldData.filter(c => c.name !== deployingContract.name);
      return [...filtered, deployingContract];
    });

    deployContractMutation.mutate({
      name: contractName,
      type: selectedTemplate as CreateSmartContract['type'],
      network: selectedNetwork as CreateSmartContract['network'],
      parameters: {
        escrowDuration: '7 days',
        feePercentage: '2.5%',
        minAmount: '0.01 ETH',
      },
    });
  };

  const selectedTemplateData = contractTemplates.find(t => t.type === selectedTemplate);

  // Contract interaction methods based on template type
  const getContractMethods = (contract: SmartContract) => {
    const baseMethods = [
      { name: 'getBalance', type: 'read', inputs: [], description: 'Get contract balance' },
      { name: 'getOwner', type: 'read', inputs: [], description: 'Get contract owner' },
    ];

    switch (contract.type) {
      case 'simple_payment':
        return [
          ...baseMethods,
          { name: 'createPayment', type: 'write', inputs: [{ name: 'amount', type: 'uint256' }, { name: 'recipient', type: 'address' }], description: 'Create a new payment' },
          { name: 'releasePayment', type: 'write', inputs: [{ name: 'paymentId', type: 'uint256' }], description: 'Release escrowed payment' },
          { name: 'getPayment', type: 'read', inputs: [{ name: 'paymentId', type: 'uint256' }], description: 'Get payment details' },
        ];
      case 'subscription':
        return [
          ...baseMethods,
          { name: 'subscribe', type: 'write', inputs: [{ name: 'planId', type: 'uint256' }], description: 'Subscribe to a plan' },
          { name: 'cancelSubscription', type: 'write', inputs: [], description: 'Cancel active subscription' },
          { name: 'getSubscription', type: 'read', inputs: [{ name: 'user', type: 'address' }], description: 'Get subscription details' },
        ];
      case 'multi_party_escrow':
        return [
          ...baseMethods,
          { name: 'createEscrow', type: 'write', inputs: [{ name: 'parties', type: 'address[]' }, { name: 'amount', type: 'uint256' }], description: 'Create multi-party escrow' },
          { name: 'approveRelease', type: 'write', inputs: [{ name: 'escrowId', type: 'uint256' }], description: 'Approve escrow release' },
          { name: 'getEscrow', type: 'read', inputs: [{ name: 'escrowId', type: 'uint256' }], description: 'Get escrow details' },
        ];
      default:
        return baseMethods;
    }
  };

  const handleMethodCall = async (contract: SmartContract, method: any) => {
    const inputs = methodInputs[method.name] || '';
    const inputParams = inputs ? inputs.split(',').map(s => s.trim()) : [];

    try {
      // Simulate contract interaction
      if (method.type === 'read') {
        // Simulate read call
        const result = await new Promise(resolve => {
          setTimeout(() => {
            switch (method.name) {
              case 'getBalance':
                resolve('1.5 ETH');
                break;
              case 'getOwner':
                resolve('0x742d35Cc6164C4532B4C22D8C1F9FBE5B6b4A9eC');
                break;
              case 'getPayment':
                resolve({ id: inputParams[0] || '1', amount: '0.5 ETH', recipient: '0x123...', status: 'pending' });
                break;
              default:
                resolve('Success');
            }
          }, 1000);
        });
        
        setCallResults(prev => ({ ...prev, [method.name]: result }));
        toast({
          title: "Read Call Successful",
          description: `Method ${method.name} executed successfully`,
        });
      } else {
        // Simulate write transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setCallResults(prev => ({ ...prev, [method.name]: 'Transaction successful - Hash: 0xabc123...' }));
        toast({
          title: "Transaction Successful",
          description: `Method ${method.name} executed successfully`,
        });
      }
    } catch (error) {
      toast({
        title: "Contract Call Failed",
        description: "There was an error calling the contract method",
        variant: "destructive",
      });
    }
  };

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
                        <button 
                          className="text-xs text-primary hover:text-primary/80"
                          onClick={() => setInteractingContract(contract)}
                          data-testid={`button-interact-${contract.id}`}
                        >
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

      {/* Contract Interaction Modal */}
      {interactingContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="contract-interaction-modal">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-4xl mx-4 border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                Contract Interaction - {interactingContract.name}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setInteractingContract(null);
                  setMethodInputs({});
                  setCallResults({});
                }}
                data-testid="button-close-interaction-modal"
              >
                ✕
              </Button>
            </div>
            
            <div className="mb-6">
              <div className="bg-secondary rounded-md p-3 text-sm">
                <div><strong>Contract Address:</strong> {interactingContract.address}</div>
                <div><strong>Network:</strong> {interactingContract.network}</div>
                <div><strong>Type:</strong> {interactingContract.type}</div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-semibold">Available Methods</h4>
              
              {getContractMethods(interactingContract).map((method) => (
                <Card key={method.name} className="border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{method.name}</CardTitle>
                      <Badge className={`text-xs ${
                        method.type === 'read' 
                          ? 'bg-blue-600 text-white'
                          : 'bg-green-600 text-white'
                      }`}>
                        {method.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {method.inputs.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">
                          Parameters: {method.inputs.map(input => `${input.name} (${input.type})`).join(', ')}
                        </Label>
                        <Input
                          placeholder="Enter parameters separated by commas"
                          value={methodInputs[method.name] || ''}
                          onChange={(e) => setMethodInputs(prev => ({ ...prev, [method.name]: e.target.value }))}
                          className="mt-1"
                          data-testid={`input-method-${method.name}`}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Button
                        onClick={() => handleMethodCall(interactingContract, method)}
                        size="sm"
                        variant={method.type === 'read' ? 'outline' : 'default'}
                        data-testid={`button-call-${method.name}`}
                      >
                        <i className={`fas ${method.type === 'read' ? 'fa-eye' : 'fa-paper-plane'} mr-2`}></i>
                        {method.type === 'read' ? 'Call' : 'Send Transaction'}
                      </Button>
                      
                      {callResults[method.name] && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Result: </span>
                          <span className="font-mono bg-secondary px-2 py-1 rounded text-xs">
                            {typeof callResults[method.name] === 'object' 
                              ? JSON.stringify(callResults[method.name])
                              : callResults[method.name]
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
