export function TransactionFlow() {
  return (
    <div className="bg-card rounded-lg p-8 border border-border">
      <h3 className="text-2xl font-semibold mb-6 text-center">Transaction Flow Visualization</h3>
      <div className="flex items-center justify-between relative transaction-flow">
        <div className="flow-line top-1/2 transform -translate-y-1/2"></div>
        
        <div className="flex flex-col items-center z-10">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2 border-2 border-primary">
            <i className="fas fa-user text-primary text-xl"></i>
          </div>
          <span className="text-sm font-medium">Customer</span>
        </div>

        <div className="flex flex-col items-center z-10">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2 border-2 border-accent">
            <i className="fas fa-store text-accent text-xl"></i>
          </div>
          <span className="text-sm font-medium">Merchant</span>
        </div>

        <div className="flex flex-col items-center z-10">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2 border-2 border-primary">
            <i className="fas fa-shield-alt text-primary text-xl"></i>
          </div>
          <span className="text-sm font-medium">SOVR Pay</span>
        </div>

        <div className="flex flex-col items-center z-10">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2 border-2 border-accent">
            <i className="fas fa-university text-accent text-xl"></i>
          </div>
          <span className="text-sm font-medium">Bank</span>
        </div>

        <div className="flex flex-col items-center z-10">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2 border-2 border-primary">
            <i className="fas fa-check-circle text-primary text-xl"></i>
          </div>
          <span className="text-sm font-medium">Confirmed</span>
        </div>
      </div>
    </div>
  );
}
