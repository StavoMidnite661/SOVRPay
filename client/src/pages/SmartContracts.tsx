import { ContractDeployer } from '@/components/ContractDeployer';

export function SmartContracts() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-muted/20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Smart Contract Deployment</h1>
          <p className="text-xl text-muted-foreground">Deploy and interact with payment smart contracts</p>
        </div>

        <ContractDeployer />
      </div>
    </div>
  );
}
