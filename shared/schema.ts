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
