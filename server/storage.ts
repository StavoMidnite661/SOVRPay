import { 
  Payment, 
  SmartContract, 
  Transaction, 
  ApiRequest, 
  SystemMetrics, 
  GeographicData,
  TransactionReceipt,
  UserNotificationPreferences,
  TransactionEvent,
  TokenizedAsset,
  InsertTokenizedAsset,
  AssetValuation,
  InsertAssetValuation,
  MarketPrice,
  InsertMarketPrice,
  PropertyInsight,
  InsertPropertyInsight
} from '@shared/schema';

// Pagination interface
export interface PaginationOptions {
  page?: number; // 1-based page number
  limit?: number; // items per page
  sortBy?: string; // field to sort by
  sortOrder?: 'asc' | 'desc';
  search?: string; // search term
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

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
  
  // Receipt and Notification Management
  saveTransactionReceipt(receipt: TransactionReceipt): Promise<TransactionReceipt>;
  getTransactionReceipt(receiptId: string): Promise<TransactionReceipt | null>;
  getTransactionReceiptsByUser(userId: string): Promise<TransactionReceipt[]>;
  updateReceiptStatus(receiptId: string, status: string, notificationHistory?: any[]): Promise<void>;
  
  // User Notification Preferences
  saveUserNotificationPreferences(preferences: Omit<UserNotificationPreferences, 'id'>): Promise<UserNotificationPreferences>;
  getUserNotificationPreferences(userId: string): Promise<UserNotificationPreferences | null>;
  updateUserNotificationPreferences(userId: string, updates: Partial<UserNotificationPreferences>): Promise<void>;
  
  // Transaction Events for Receipt Generation
  createTransactionEvent(event: Omit<TransactionEvent, 'id'>): Promise<TransactionEvent>;
  getUnprocessedTransactionEvents(): Promise<TransactionEvent[]>;
  markTransactionEventProcessed(eventId: string): Promise<void>;
  getApiRequests(limit?: number): Promise<ApiRequest[]>;

  // System Metrics
  getSystemMetrics(): Promise<SystemMetrics>;
  updateSystemMetrics(metrics: Partial<SystemMetrics>): Promise<SystemMetrics>;

  // Geographic Data
  getGeographicData(): Promise<GeographicData[]>;

  // Tokenized Assets
  createTokenizedAsset(asset: InsertTokenizedAsset): Promise<TokenizedAsset>;
  getTokenizedAsset(id: string): Promise<TokenizedAsset | null>;
  listTokenizedAssets(options?: PaginationOptions): Promise<PaginatedResult<TokenizedAsset>>;
  updateTokenizedAsset(id: string, updates: Partial<TokenizedAsset>): Promise<TokenizedAsset>;
  deleteTokenizedAsset(id: string): Promise<void>;

  // Asset Valuations
  createAssetValuation(valuation: InsertAssetValuation): Promise<AssetValuation>;
  getAssetValuation(id: string): Promise<AssetValuation | null>;
  getAssetValuationsByAsset(assetId: string, options?: PaginationOptions): Promise<PaginatedResult<AssetValuation>>;
  listAssetValuations(options?: PaginationOptions): Promise<PaginatedResult<AssetValuation>>;
  updateAssetValuation(id: string, updates: Partial<AssetValuation>): Promise<AssetValuation>;
  deleteAssetValuation(id: string): Promise<void>;

  // Market Prices
  createMarketPrice(price: InsertMarketPrice): Promise<MarketPrice>;
  getMarketPrice(id: string): Promise<MarketPrice | null>;
  getLatestMarketPrice(assetId: string): Promise<MarketPrice | null>;
  getMarketPriceHistory(assetId: string, options?: PaginationOptions & { fromDate?: string; toDate?: string }): Promise<PaginatedResult<MarketPrice>>;
  listMarketPrices(options?: PaginationOptions): Promise<PaginatedResult<MarketPrice>>;
  updateMarketPrice(id: string, updates: Partial<MarketPrice>): Promise<MarketPrice>;
  deleteMarketPrice(id: string): Promise<void>;

  // Property Insights
  createPropertyInsight(insight: InsertPropertyInsight): Promise<PropertyInsight>;
  getPropertyInsight(id: string): Promise<PropertyInsight | null>;
  getPropertyInsightsByAsset(assetId: string, options?: PaginationOptions): Promise<PaginatedResult<PropertyInsight>>;
  listPropertyInsights(options?: PaginationOptions): Promise<PaginatedResult<PropertyInsight>>;
  updatePropertyInsight(id: string, updates: Partial<PropertyInsight>): Promise<PropertyInsight>;
  deletePropertyInsight(id: string): Promise<void>;
}

class MemStorage implements IStorage {
  private payments: Payment[] = [];
  private smartContracts: SmartContract[] = [];
  private transactions: Transaction[] = [];
  private apiRequests: ApiRequest[] = [];
  private transactionReceipts: TransactionReceipt[] = [];
  private userNotificationPreferences: UserNotificationPreferences[] = [];
  private transactionEvents: TransactionEvent[] = [];
  // Asset-related storage
  private tokenizedAssets: TokenizedAsset[] = [];
  private assetValuations: AssetValuation[] = [];
  private marketPrices: MarketPrice[] = [];
  private propertyInsights: PropertyInsight[] = [];
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

  // Receipt Management Implementation
  async saveTransactionReceipt(receipt: TransactionReceipt): Promise<TransactionReceipt> {
    // Preserve the existing ID to maintain consistency with immutable references
    this.transactionReceipts.push(receipt);
    return receipt;
  }

  async getTransactionReceipt(receiptId: string): Promise<TransactionReceipt | null> {
    return this.transactionReceipts.find(r => r.id === receiptId) || null;
  }

  async getTransactionReceiptsByUser(userId: string): Promise<TransactionReceipt[]> {
    return this.transactionReceipts.filter(r => r.userId === userId);
  }

  async updateReceiptStatus(receiptId: string, status: string, notificationHistory?: any[]): Promise<void> {
    const receipt = this.transactionReceipts.find(r => r.id === receiptId);
    if (receipt) {
      receipt.status = status as any;
      if (notificationHistory) {
        receipt.notificationHistory = notificationHistory;
      }
      if (status === 'sent') {
        receipt.sentAt = new Date().toISOString();
      }
      if (status === 'delivered') {
        receipt.deliveredAt = new Date().toISOString();
      }
    }
  }

  // User Notification Preferences Implementation
  async saveUserNotificationPreferences(preferences: Omit<UserNotificationPreferences, 'id'>): Promise<UserNotificationPreferences> {
    const newPreferences: UserNotificationPreferences = {
      ...preferences,
    };
    this.userNotificationPreferences.push(newPreferences);
    return newPreferences;
  }

  async getUserNotificationPreferences(userId: string): Promise<UserNotificationPreferences | null> {
    return this.userNotificationPreferences.find(p => p.userId === userId) || null;
  }

  async updateUserNotificationPreferences(userId: string, updates: Partial<UserNotificationPreferences>): Promise<void> {
    const preferences = this.userNotificationPreferences.find(p => p.userId === userId);
    if (preferences) {
      Object.assign(preferences, updates);
      preferences.updatedAt = new Date().toISOString();
    }
  }

  // Transaction Events Implementation
  async createTransactionEvent(event: Omit<TransactionEvent, 'id'>): Promise<TransactionEvent> {
    const newEvent: TransactionEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    this.transactionEvents.push(newEvent);
    return newEvent;
  }

  async getUnprocessedTransactionEvents(): Promise<TransactionEvent[]> {
    return this.transactionEvents.filter(e => !e.processedAt);
  }

  async markTransactionEventProcessed(eventId: string): Promise<void> {
    const event = this.transactionEvents.find(e => e.id === eventId);
    if (event) {
      event.processedAt = new Date().toISOString();
    }
  }

  // Helper method for pagination
  private paginate<T>(items: T[], options: PaginationOptions = {}): PaginatedResult<T> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = ''
    } = options;

    let filteredItems = [...items];

    // Apply search filter if provided
    if (search) {
      filteredItems = filteredItems.filter(item =>
        JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    filteredItems.sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const totalCount = filteredItems.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filteredItems.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Tokenized Assets Implementation
  async createTokenizedAsset(asset: InsertTokenizedAsset): Promise<TokenizedAsset> {
    const newAsset: TokenizedAsset = {
      ...asset,
      id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tokenizedAssets.push(newAsset);
    return newAsset;
  }

  async getTokenizedAsset(id: string): Promise<TokenizedAsset | null> {
    return this.tokenizedAssets.find(a => a.id === id) || null;
  }

  async listTokenizedAssets(options?: PaginationOptions): Promise<PaginatedResult<TokenizedAsset>> {
    return this.paginate(this.tokenizedAssets, options);
  }

  async updateTokenizedAsset(id: string, updates: Partial<TokenizedAsset>): Promise<TokenizedAsset> {
    const asset = this.tokenizedAssets.find(a => a.id === id);
    if (!asset) throw new Error('Tokenized asset not found');

    Object.assign(asset, updates);
    asset.updatedAt = new Date().toISOString();

    return asset;
  }

  async deleteTokenizedAsset(id: string): Promise<void> {
    const index = this.tokenizedAssets.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Tokenized asset not found');
    this.tokenizedAssets.splice(index, 1);
  }

  // Asset Valuations Implementation
  async createAssetValuation(valuation: InsertAssetValuation): Promise<AssetValuation> {
    const newValuation: AssetValuation = {
      ...valuation,
      id: `valuation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.assetValuations.push(newValuation);
    return newValuation;
  }

  async getAssetValuation(id: string): Promise<AssetValuation | null> {
    return this.assetValuations.find(v => v.id === id) || null;
  }

  async getAssetValuationsByAsset(assetId: string, options?: PaginationOptions): Promise<PaginatedResult<AssetValuation>> {
    const valuations = this.assetValuations.filter(v => v.assetId === assetId);
    return this.paginate(valuations, options);
  }

  async listAssetValuations(options?: PaginationOptions): Promise<PaginatedResult<AssetValuation>> {
    return this.paginate(this.assetValuations, options);
  }

  async updateAssetValuation(id: string, updates: Partial<AssetValuation>): Promise<AssetValuation> {
    const valuation = this.assetValuations.find(v => v.id === id);
    if (!valuation) throw new Error('Asset valuation not found');

    Object.assign(valuation, updates);
    valuation.updatedAt = new Date().toISOString();

    return valuation;
  }

  async deleteAssetValuation(id: string): Promise<void> {
    const index = this.assetValuations.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Asset valuation not found');
    this.assetValuations.splice(index, 1);
  }

  // Market Prices Implementation
  async createMarketPrice(price: InsertMarketPrice): Promise<MarketPrice> {
    const newPrice: MarketPrice = {
      ...price,
      id: `price_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    this.marketPrices.push(newPrice);
    return newPrice;
  }

  async getMarketPrice(id: string): Promise<MarketPrice | null> {
    return this.marketPrices.find(p => p.id === id) || null;
  }

  async getLatestMarketPrice(assetId: string): Promise<MarketPrice | null> {
    const prices = this.marketPrices
      .filter(p => p.assetId === assetId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return prices[0] || null;
  }

  async getMarketPriceHistory(
    assetId: string, 
    options?: PaginationOptions & { fromDate?: string; toDate?: string }
  ): Promise<PaginatedResult<MarketPrice>> {
    let prices = this.marketPrices.filter(p => p.assetId === assetId);

    // Apply date filters if provided
    if (options?.fromDate) {
      prices = prices.filter(p => new Date(p.timestamp) >= new Date(options.fromDate!));
    }
    if (options?.toDate) {
      prices = prices.filter(p => new Date(p.timestamp) <= new Date(options.toDate!));
    }

    return this.paginate(prices, options);
  }

  async listMarketPrices(options?: PaginationOptions): Promise<PaginatedResult<MarketPrice>> {
    return this.paginate(this.marketPrices, options);
  }

  async updateMarketPrice(id: string, updates: Partial<MarketPrice>): Promise<MarketPrice> {
    const price = this.marketPrices.find(p => p.id === id);
    if (!price) throw new Error('Market price not found');

    Object.assign(price, updates);
    return price;
  }

  async deleteMarketPrice(id: string): Promise<void> {
    const index = this.marketPrices.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Market price not found');
    this.marketPrices.splice(index, 1);
  }

  // Property Insights Implementation
  async createPropertyInsight(insight: InsertPropertyInsight): Promise<PropertyInsight> {
    const newInsight: PropertyInsight = {
      ...insight,
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      views: 0,
      bookmarks: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.propertyInsights.push(newInsight);
    return newInsight;
  }

  async getPropertyInsight(id: string): Promise<PropertyInsight | null> {
    return this.propertyInsights.find(i => i.id === id) || null;
  }

  async getPropertyInsightsByAsset(assetId: string, options?: PaginationOptions): Promise<PaginatedResult<PropertyInsight>> {
    const insights = this.propertyInsights.filter(i => i.assetId === assetId);
    return this.paginate(insights, options);
  }

  async listPropertyInsights(options?: PaginationOptions): Promise<PaginatedResult<PropertyInsight>> {
    return this.paginate(this.propertyInsights, options);
  }

  async updatePropertyInsight(id: string, updates: Partial<PropertyInsight>): Promise<PropertyInsight> {
    const insight = this.propertyInsights.find(i => i.id === id);
    if (!insight) throw new Error('Property insight not found');

    Object.assign(insight, updates);
    insight.updatedAt = new Date().toISOString();

    return insight;
  }

  async deletePropertyInsight(id: string): Promise<void> {
    const index = this.propertyInsights.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Property insight not found');
    this.propertyInsights.splice(index, 1);
  }
}

export const storage = new MemStorage();
