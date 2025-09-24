import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Payment Schema
export const paymentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['pending', 'processing', 'confirmed', 'failed', 'expired']),
  method: z.enum(['wallet_connect', 'qr_code', 'direct_transfer']),
  customerEmail: z.string().email().optional(),
  customerWallet: z.string().optional(),
  orderId: z.string().optional(),
  description: z.string().optional(),
  transactionHash: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createPaymentSchema = paymentSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true,
  transactionHash: true 
});

export type Payment = z.infer<typeof paymentSchema>;
export type CreatePayment = z.infer<typeof createPaymentSchema>;

// Smart Contract Schema
export const smartContractSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['simple_payment', 'subscription', 'multi_party_escrow']),
  address: z.string().optional(),
  network: z.enum(['ethereum', 'polygon', 'bsc', 'testnet']),
  status: z.enum(['deploying', 'deployed', 'failed']),
  gasUsed: z.number().optional(),
  deploymentCost: z.number().optional(),
  parameters: z.record(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createSmartContractSchema = smartContractSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  address: true,
  gasUsed: true,
  deploymentCost: true
});

export type SmartContract = z.infer<typeof smartContractSchema>;
export type CreateSmartContract = z.infer<typeof createSmartContractSchema>;

// Transaction Schema
export const transactionSchema = z.object({
  id: z.string(),
  paymentId: z.string(),
  type: z.enum(['payment', 'refund', 'settlement']),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['pending', 'confirmed', 'failed']),
  blockNumber: z.number().optional(),
  gasUsed: z.number().optional(),
  fee: z.number().optional(),
  createdAt: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;

// API Request Schema
export const apiRequestSchema = z.object({
  id: z.string(),
  endpoint: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  requestBody: z.record(z.any()).optional(),
  responseCode: z.number(),
  responseBody: z.record(z.any()),
  responseTime: z.number(),
  timestamp: z.string(),
});

export type ApiRequest = z.infer<typeof apiRequestSchema>;

// System Metrics Schema
export const systemMetricsSchema = z.object({
  transactionVolume: z.number(),
  successRate: z.number(),
  activeMerchants: z.number(),
  averageResponseTime: z.number(),
  timestamp: z.string(),
});

export type SystemMetrics = z.infer<typeof systemMetricsSchema>;

// Geographic Data Schema
export const geographicDataSchema = z.object({
  country: z.string(),
  countryCode: z.string(),
  percentage: z.number(),
  transactionCount: z.number(),
});

export type GeographicData = z.infer<typeof geographicDataSchema>;

// User Notification Preferences Schema
export const userNotificationPreferencesSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  enableEmailReceipts: z.boolean().default(true),
  enableSMSAlerts: z.boolean().default(false),
  enableInAppNotifications: z.boolean().default(true),
  timezone: z.string().default('UTC'),
  language: z.string().default('en'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserNotificationPreferences = z.infer<typeof userNotificationPreferencesSchema>;

// Transaction Receipt Schema - Unified for all transaction types
export const transactionReceiptSchema = z.object({
  id: z.string(),
  receiptNumber: z.string(), // Human-readable receipt number (e.g., RCP-2024-001234)
  transactionType: z.enum(['payment', 'tokenization', 'defi_stake', 'defi_unstake', 'compliance_kyc', 'smart_contract_deploy', 'refund', 'settlement']),
  transactionId: z.string(), // Reference to the original transaction
  userId: z.string(),
  userEmail: z.string().email(),
  
  // Financial Details
  amount: z.number().optional(),
  currency: z.string().optional(),
  exchangeRate: z.number().optional(),
  feeAmount: z.number().optional(),
  netAmount: z.number().optional(),
  
  // Transaction-Specific Data
  assetDetails: z.object({
    name: z.string().optional(),
    symbol: z.string().optional(),
    contractAddress: z.string().optional(),
    tokenId: z.string().optional(),
    quantity: z.number().optional(),
  }).optional(),
  
  // Blockchain Information
  networkDetails: z.object({
    network: z.string().optional(),
    blockNumber: z.number().optional(),
    transactionHash: z.string().optional(),
    gasUsed: z.number().optional(),
    gasFee: z.number().optional(),
  }).optional(),
  
  // Compliance Information
  complianceData: z.object({
    kycStatus: z.string().optional(),
    amlChecked: z.boolean().optional(),
    jurisdictionCode: z.string().optional(),
    regulatoryReference: z.string().optional(),
    reportingRequired: z.boolean().optional(),
  }).optional(),
  
  // Receipt Status and Delivery
  status: z.enum(['generated', 'sent', 'delivered', 'failed']),
  generatedAt: z.string(),
  sentAt: z.string().optional(),
  deliveredAt: z.string().optional(),
  
  // Document Storage
  receiptDocuments: z.array(z.object({
    format: z.enum(['html', 'pdf', 'json', 'xml']),
    storageUrl: z.string(),
    size: z.number(),
    checksum: z.string(),
  })),
  
  // Notification Delivery Status
  notificationHistory: z.array(z.object({
    method: z.enum(['email', 'sms', 'in_app', 'webhook']),
    recipient: z.string(),
    status: z.enum(['pending', 'sent', 'delivered', 'failed', 'bounced']),
    sentAt: z.string(),
    deliveredAt: z.string().optional(),
    errorMessage: z.string().optional(),
    providerResponse: z.record(z.any()).optional(),
  })),
  
  // Audit and Security
  immutableReference: z.string(), // Hash of receipt content for integrity verification
  metadata: z.record(z.any()).optional(),
});

export const createTransactionReceiptSchema = transactionReceiptSchema.omit({
  status: true,
  sentAt: true,
  deliveredAt: true,
});

export type TransactionReceipt = z.infer<typeof transactionReceiptSchema>;
export type CreateTransactionReceipt = z.infer<typeof createTransactionReceiptSchema>;

// Transaction Event Schema - For unified event orchestration
export const transactionEventSchema = z.object({
  id: z.string(),
  eventType: z.enum(['payment_completed', 'tokenization_completed', 'defi_stake_completed', 'defi_unstake_completed', 'compliance_check_completed', 'smart_contract_deployed', 'refund_processed', 'settlement_completed']),
  transactionId: z.string(),
  userId: z.string(),
  domain: z.enum(['payments', 'tokenization', 'defi', 'compliance', 'smart_contracts']),
  
  // Event Data Payload
  eventData: z.record(z.any()),
  
  // Processing Status
  receiptGenerated: z.boolean().default(false),
  notificationsSent: z.boolean().default(false),
  
  // Timestamps
  createdAt: z.string(),
  processedAt: z.string().optional(),
  
  // Audit Trail
  processingErrors: z.array(z.object({
    component: z.string(),
    error: z.string(),
    timestamp: z.string(),
  })).optional(),
});

export type TransactionEvent = z.infer<typeof transactionEventSchema>;

// Notification Template Schema
export const notificationTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  transactionType: z.enum(['payment', 'tokenization', 'defi_stake', 'defi_unstake', 'compliance_kyc', 'smart_contract_deploy', 'refund', 'settlement']),
  format: z.enum(['email', 'sms', 'in_app']),
  
  // Template Content
  subject: z.string().optional(), // For email
  htmlTemplate: z.string().optional(),
  textTemplate: z.string().optional(),
  
  // Template Variables
  variables: z.array(z.string()),
  
  // Branding and Styling
  brandingEnabled: z.boolean().default(true),
  customStyling: z.record(z.any()).optional(),
  
  // Compliance Requirements
  includeDisclaimer: z.boolean().default(true),
  disclaimerText: z.string().optional(),
  
  // Status
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type NotificationTemplate = z.infer<typeof notificationTemplateSchema>;

// Tokenized Asset Schema
export const tokenizedAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  description: z.string().optional(),
  assetType: z.enum(['real_estate', 'commodity', 'stock', 'bond', 'artwork', 'collectible', 'intellectual_property']),
  totalSupply: z.number(),
  availableSupply: z.number(),
  pricePerToken: z.number(),
  currency: z.string().default('USD'),
  
  // Blockchain Information
  contractAddress: z.string().optional(),
  network: z.enum(['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'testnet']),
  tokenStandard: z.enum(['ERC20', 'ERC721', 'ERC1155']),
  
  // Asset Details
  underlyingAssetValue: z.number(),
  lastValuationDate: z.string(),
  nextValuationDate: z.string().optional(),
  
  // Compliance and Legal
  regulatoryStatus: z.enum(['compliant', 'pending', 'non_compliant']),
  jurisdictions: z.array(z.string()),
  complianceDocuments: z.array(z.object({
    type: z.string(),
    url: z.string(),
    uploadedAt: z.string(),
  })),
  
  // Trading Information
  isListed: z.boolean().default(false),
  tradingEnabled: z.boolean().default(false),
  minimumInvestment: z.number().optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
  status: z.enum(['draft', 'pending_approval', 'active', 'suspended', 'retired']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertTokenizedAssetSchema = tokenizedAssetSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  contractAddress: true,
});

export type TokenizedAsset = z.infer<typeof tokenizedAssetSchema>;
export type InsertTokenizedAsset = z.infer<typeof insertTokenizedAssetSchema>;

// Asset Valuation Schema
export const assetValuationSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  valuationType: z.enum(['appraisal', 'market_based', 'income_based', 'cost_based', 'automated']),
  valuationAmount: z.number(),
  currency: z.string().default('USD'),
  
  // Valuation Details
  valuationDate: z.string(),
  effectiveDate: z.string(),
  expirationDate: z.string().optional(),
  
  // Valuation Source
  valuatorId: z.string().optional(),
  valuatorName: z.string().optional(),
  valuatorLicense: z.string().optional(),
  valuationFirm: z.string().optional(),
  
  // Supporting Information
  methodology: z.string().optional(),
  assumptions: z.array(z.string()).optional(),
  comparables: z.array(z.object({
    property: z.string(),
    salePrice: z.number(),
    saleDate: z.string(),
    adjustments: z.record(z.number()).optional(),
  })).optional(),
  
  // Market Conditions
  marketConditions: z.object({
    trend: z.enum(['rising', 'stable', 'declining']),
    volatility: z.enum(['low', 'medium', 'high']),
    liquidity: z.enum(['high', 'medium', 'low']),
    notes: z.string().optional(),
  }).optional(),
  
  // Confidence and Risk
  confidenceLevel: z.enum(['very_high', 'high', 'medium', 'low']),
  riskFactors: z.array(z.string()).optional(),
  
  // Supporting Documents
  documents: z.array(z.object({
    type: z.string(),
    name: z.string(),
    url: z.string(),
    uploadedAt: z.string(),
  })),
  
  // Approval and Status
  status: z.enum(['draft', 'pending_review', 'approved', 'rejected', 'expired']),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
  
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertAssetValuationSchema = assetValuationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  approvedBy: true,
  approvedAt: true,
});

export type AssetValuation = z.infer<typeof assetValuationSchema>;
export type InsertAssetValuation = z.infer<typeof insertAssetValuationSchema>;

// Market Price Schema
export const marketPriceSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  price: z.number(),
  currency: z.string().default('USD'),
  
  // Price Source
  source: z.enum(['exchange', 'otc', 'appraisal', 'index', 'algorithmic']),
  sourceName: z.string(),
  sourceReliability: z.enum(['very_high', 'high', 'medium', 'low']),
  
  // Trading Information
  volume: z.number().optional(),
  volumePeriod: z.enum(['1h', '24h', '7d', '30d']).optional(),
  lastTradeTime: z.string().optional(),
  
  // Price Movement
  changeAmount: z.number().optional(),
  changePercent: z.number().optional(),
  changePeriod: z.enum(['1h', '24h', '7d', '30d']).optional(),
  
  // OHLC Data (for charting)
  open: z.number().optional(),
  high: z.number().optional(),
  low: z.number().optional(),
  close: z.number().optional(),
  
  // Market Context
  marketCap: z.number().optional(),
  circulatingSupply: z.number().optional(),
  
  // Technical Indicators
  rsi: z.number().optional(), // Relative Strength Index
  movingAverage7d: z.number().optional(),
  movingAverage30d: z.number().optional(),
  volatility: z.number().optional(),
  
  // Data Quality
  confidence: z.enum(['very_high', 'high', 'medium', 'low']),
  staleness: z.number().optional(), // Minutes since last update
  
  timestamp: z.string(),
  createdAt: z.string(),
});

export const insertMarketPriceSchema = marketPriceSchema.omit({
  id: true,
  createdAt: true,
});

export type MarketPrice = z.infer<typeof marketPriceSchema>;
export type InsertMarketPrice = z.infer<typeof insertMarketPriceSchema>;

// Property Insight Schema
export const propertyInsightSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  insightType: z.enum(['market_analysis', 'rental_yield', 'appreciation_forecast', 'risk_assessment', 'comparable_analysis', 'demographic_analysis', 'infrastructure_impact']),
  title: z.string(),
  description: z.string(),
  
  // Insight Data
  keyMetrics: z.record(z.union([z.string(), z.number(), z.boolean()])),
  
  // Analysis Details
  analysisMethod: z.string().optional(),
  dataSourcesUsed: z.array(z.string()),
  sampleSize: z.number().optional(),
  confidenceInterval: z.number().optional(),
  
  // Forecast Information (if applicable)
  forecastPeriod: z.enum(['1_month', '3_months', '6_months', '1_year', '3_years', '5_years']).optional(),
  forecastAccuracy: z.number().optional(), // Historical accuracy percentage
  
  // Geographic and Market Context
  geographicScope: z.enum(['neighborhood', 'city', 'county', 'state', 'region', 'national']),
  marketSegment: z.string().optional(),
  
  // Risk and Opportunity Indicators
  riskLevel: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
  opportunityScore: z.number().optional(), // 0-100 scale
  
  // Comparable Properties (for real estate)
  comparables: z.array(z.object({
    address: z.string(),
    distance: z.number(), // in miles/km
    similarity: z.number(), // 0-100 percentage
    keyDifferences: z.array(z.string()),
    adjustments: z.record(z.number()).optional(),
  })).optional(),
  
  // Market Trends
  trends: z.array(z.object({
    indicator: z.string(),
    currentValue: z.number(),
    historicalValues: z.array(z.object({
      period: z.string(),
      value: z.number(),
    })),
    trend: z.enum(['increasing', 'stable', 'decreasing']),
    significance: z.enum(['high', 'medium', 'low']),
  })).optional(),
  
  // Supporting Documentation
  charts: z.array(z.object({
    type: z.string(),
    title: z.string(),
    dataUrl: z.string().optional(),
    imageUrl: z.string().optional(),
  })).optional(),
  
  reports: z.array(z.object({
    title: z.string(),
    format: z.enum(['pdf', 'excel', 'json']),
    url: z.string(),
    generatedAt: z.string(),
  })).optional(),
  
  // Insight Quality
  accuracy: z.enum(['very_high', 'high', 'medium', 'low']),
  relevance: z.enum(['very_high', 'high', 'medium', 'low']),
  freshnessScore: z.number().optional(), // 0-100, based on data recency
  
  // User Interaction
  views: z.number().default(0),
  bookmarks: z.number().default(0),
  shares: z.number().default(0),
  
  // Automated Analysis
  generatedBy: z.enum(['human_analyst', 'ai_model', 'hybrid']),
  modelVersion: z.string().optional(),
  lastUpdated: z.string(),
  
  // Status and Lifecycle
  status: z.enum(['active', 'outdated', 'under_review', 'archived']),
  publishedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  
  // Metadata
  tags: z.array(z.string()),
  metadata: z.record(z.any()).optional(),
  
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertPropertyInsightSchema = propertyInsightSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  views: true,
  bookmarks: true,
  shares: true,
  publishedAt: true,
});

export type PropertyInsight = z.infer<typeof propertyInsightSchema>;
export type InsertPropertyInsight = z.infer<typeof insertPropertyInsightSchema>;
