import { Payment, SmartContract, Transaction, ApiRequest, SystemMetrics, GeographicData } from '@shared/schema';

export interface IStorage {
  // Payments
  createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;
  getPayment(id: string): Promise<Payment | null>;
  listPayments(limit?: number): Promise<Payment[]>;
  updatePaymentStatus(id: string, status: Payment['status'], transactionHash?: string): Promise<Payment>;

  // Smart Contracts
  createSmartContract(contract: Omit<SmartContract, 'id' | 'createdAt' | 'updatedAt'>): Promise<SmartContract>;
  getSmartContract(id: string): Promise<SmartContract | null>;
  listSmartContracts(): Promise<SmartContract[]>;
  updateSmartContract(id: string, updates: Partial<SmartContract>): Promise<SmartContract>;

  // Transactions
  createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  getTransactions(paymentId?: string): Promise<Transaction[]>;

  // API Requests (for testing/logging)
  logApiRequest(request: Omit<ApiRequest, 'id'>): Promise<ApiRequest>;
  getApiRequests(limit?: number): Promise<ApiRequest[]>;

  // System Metrics
  getSystemMetrics(): Promise<SystemMetrics>;
  updateSystemMetrics(metrics: Partial<SystemMetrics>): Promise<SystemMetrics>;

  // Geographic Data
  getGeographicData(): Promise<GeographicData[]>;
}

class MemStorage implements IStorage {
  private payments: Payment[] = [];
  private smartContracts: SmartContract[] = [];
  private transactions: Transaction[] = [];
  private apiRequests: ApiRequest[] = [];
  private systemMetrics: SystemMetrics = {
    transactionVolume: 2400000,
    successRate: 98.7,
    activeMerchants: 1847,
    averageResponseTime: 45,
    timestamp: new Date().toISOString(),
  };
  private geographicData: GeographicData[] = [
    { country: 'United States', countryCode: 'US', percentage: 45, transactionCount: 1080000 },
    { country: 'United Kingdom', countryCode: 'GB', percentage: 23, transactionCount: 552000 },
    { country: 'Germany', countryCode: 'DE', percentage: 18, transactionCount: 432000 },
    { country: 'Canada', countryCode: 'CA', percentage: 14, transactionCount: 336000 },
  ];

  async createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const newPayment: Payment = {
      ...payment,
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.payments.push(newPayment);
    return newPayment;
  }

  async getPayment(id: string): Promise<Payment | null> {
    return this.payments.find(p => p.id === id) || null;
  }

  async listPayments(limit = 10): Promise<Payment[]> {
    return this.payments.slice(-limit).reverse();
  }

  async updatePaymentStatus(id: string, status: Payment['status'], transactionHash?: string): Promise<Payment> {
    const payment = this.payments.find(p => p.id === id);
    if (!payment) throw new Error('Payment not found');
    
    payment.status = status;
    payment.updatedAt = new Date().toISOString();
    if (transactionHash) payment.transactionHash = transactionHash;
    
    return payment;
  }

  async createSmartContract(contract: Omit<SmartContract, 'id' | 'createdAt' | 'updatedAt'>): Promise<SmartContract> {
    const newContract: SmartContract = {
      ...contract,
      id: `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'deploying',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.smartContracts.push(newContract);
    
    // Simulate deployment process
    setTimeout(() => {
      newContract.status = 'deployed';
      newContract.address = `0x${Math.random().toString(16).substr(2, 40)}`;
      newContract.gasUsed = Math.floor(Math.random() * 100000) + 45000;
      newContract.deploymentCost = newContract.gasUsed * 0.00000002; // Mock gas price
      newContract.updatedAt = new Date().toISOString();
    }, 3000);
    
    return newContract;
  }

  async getSmartContract(id: string): Promise<SmartContract | null> {
    return this.smartContracts.find(c => c.id === id) || null;
  }

  async listSmartContracts(): Promise<SmartContract[]> {
    return this.smartContracts;
  }

  async updateSmartContract(id: string, updates: Partial<SmartContract>): Promise<SmartContract> {
    const contract = this.smartContracts.find(c => c.id === id);
    if (!contract) throw new Error('Smart contract not found');
    
    Object.assign(contract, updates);
    contract.updatedAt = new Date().toISOString();
    
    return contract;
  }

  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  async getTransactions(paymentId?: string): Promise<Transaction[]> {
    if (paymentId) {
      return this.transactions.filter(t => t.paymentId === paymentId);
    }
    return this.transactions.slice(-20).reverse();
  }

  async logApiRequest(request: Omit<ApiRequest, 'id'>): Promise<ApiRequest> {
    const newRequest: ApiRequest = {
      ...request,
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    this.apiRequests.push(newRequest);
    return newRequest;
  }

  async getApiRequests(limit = 50): Promise<ApiRequest[]> {
    return this.apiRequests.slice(-limit).reverse();
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    // Add some variance to simulate real-time data
    const variance = 0.95 + Math.random() * 0.1; // ±5% variance
    return {
      ...this.systemMetrics,
      transactionVolume: Math.floor(this.systemMetrics.transactionVolume * variance),
      averageResponseTime: Math.floor(this.systemMetrics.averageResponseTime * variance),
      timestamp: new Date().toISOString(),
    };
  }

  async updateSystemMetrics(metrics: Partial<SystemMetrics>): Promise<SystemMetrics> {
    this.systemMetrics = {
      ...this.systemMetrics,
      ...metrics,
      timestamp: new Date().toISOString(),
    };
    return this.systemMetrics;
  }

  async getGeographicData(): Promise<GeographicData[]> {
    return this.geographicData;
  }
}

export const storage = new MemStorage();
