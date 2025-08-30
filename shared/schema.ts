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
