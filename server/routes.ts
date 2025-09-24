import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import path from 'path';
import fs from 'fs';
import { storage } from './storage';
import { createPaymentSchema, createSmartContractSchema } from '@shared/schema';

const router = express.Router();

// WebSocket server for real-time updates
let wss: WebSocketServer;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });
  
  wss.on('connection', (ws) => {
    // WebSocket client connected
    
    // Send initial metrics
    storage.getSystemMetrics().then(metrics => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'metrics', data: metrics }));
      }
    });
    
    // Send periodic updates
    const interval = setInterval(async () => {
      if (ws.readyState === WebSocket.OPEN) {
        const metrics = await storage.getSystemMetrics();
        ws.send(JSON.stringify({ type: 'metrics', data: metrics }));
      } else {
        clearInterval(interval);
      }
    }, 5000);
    
    ws.on('close', () => {
      // WebSocket client disconnected
      clearInterval(interval);
    });
  });
}

function broadcast(message: any) {
  if (wss) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

// Payment Routes
router.post('/api/payments', async (req, res) => {
  try {
    const validatedData = createPaymentSchema.parse(req.body);
    const paymentData = { ...validatedData, status: 'pending' as const };
    const payment = await storage.createPayment(paymentData);
    
    // Simulate payment processing
    setTimeout(async () => {
      const updatedPayment = await storage.updatePaymentStatus(
        payment.id, 
        'confirmed', 
        `0x${Math.random().toString(16).substr(2, 64)}`
      );
      broadcast({ type: 'payment_update', data: updatedPayment });
    }, 2000);
    
    broadcast({ type: 'payment_created', data: payment });
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
  }
});

router.get('/api/payments/:id', async (req, res) => {
  try {
    const payment = await storage.getPayment(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/payments', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const payments = await storage.listPayments(limit);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Smart Contract Routes
router.post('/api/contracts', async (req, res) => {
  try {
    const validatedData = createSmartContractSchema.parse(req.body);
    const contractData = { ...validatedData, status: 'deploying' as const };
    const contract = await storage.createSmartContract(contractData);
    
    broadcast({ type: 'contract_deployment_started', data: contract });
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
  }
});

router.get('/api/contracts', async (req, res) => {
  try {
    const contracts = await storage.listSmartContracts();
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/contracts/:id', async (req, res) => {
  try {
    const contract = await storage.getSmartContract(req.params.id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transaction Routes
router.get('/api/transactions', async (req, res) => {
  try {
    const paymentId = req.query.paymentId as string;
    const transactions = await storage.getTransactions(paymentId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// System Metrics Routes
router.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await storage.getSystemMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/geographic-data', async (req, res) => {
  try {
    const data = await storage.getGeographicData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API Testing Routes
router.post('/api/test', async (req, res) => {
  try {
    const { endpoint, method, body } = req.body;
    const startTime = Date.now();
    
    // Simulate API response
    let responseCode = 200;
    let responseBody = {};
    
    switch (endpoint) {
      case '/v1/payments':
        responseBody = {
          id: `pay_${Date.now()}`,
          status: 'completed',
          amount: body?.amount || 1000,
          currency: body?.currency || 'USD',
          created_at: new Date().toISOString(),
          transaction_id: `txn_${Math.random().toString(36).substr(2, 12)}`
        };
        break;
      case '/v1/payments/{id}':
        responseBody = {
          id: 'pay_1234567890',
          status: 'completed',
          amount: 2500,
          currency: 'USD',
          created_at: '2024-01-15T10:30:00.000Z',
          transaction_id: 'txn_abcdef123456',
          customer: {
            id: 'cust_abc123',
            email: 'customer@example.com',
            name: 'John Doe'
          },
          payment_method: {
            type: 'card',
            card: {
              brand: 'mastercard',
              last4: '1234',
              exp_month: 8,
              exp_year: 2026
            }
          }
        };
        break;
      case '/v1/transactions':
        responseBody = {
          object: 'list',
          data: [
            {
              id: 'txn_789012345',
              type: 'payment',
              amount: 1500,
              currency: 'USD',
              status: 'succeeded',
              created: '2024-01-15T14:20:00.000Z',
              description: 'Product purchase'
            },
            {
              id: 'txn_678901234',
              type: 'refund',
              amount: -500,
              currency: 'USD',
              status: 'succeeded',
              created: '2024-01-14T09:15:00.000Z',
              description: 'Partial refund'
            },
            {
              id: 'txn_567890123',
              type: 'payment',
              amount: 3200,
              currency: 'USD',
              status: 'pending',
              created: '2024-01-13T16:45:00.000Z',
              description: 'Subscription payment'
            }
          ],
          has_more: false,
          total_count: 3
        };
        break;
      case '/v1/refunds':
        responseBody = {
          id: 'rf_' + Math.random().toString(36).substring(7),
          amount: body?.amount || 1000,
          currency: body?.currency || 'USD',
          status: 'succeeded',
          reason: body?.reason || 'requested_by_customer',
          created: new Date().toISOString(),
          payment_intent: body?.payment_intent || 'pay_1234567890',
          metadata: body?.metadata || {
            refund_reason: 'Customer not satisfied'
          }
        };
        break;
      default:
        responseCode = 404;
        responseBody = { error: 'Endpoint not found' };
    }
    
    const responseTime = Date.now() - startTime + Math.floor(Math.random() * 50) + 10;
    
    const apiRequest = await storage.logApiRequest({
      endpoint,
      method,
      requestBody: body,
      responseCode,
      responseBody,
      responseTime,
      timestamp: new Date().toISOString(),
    });
    
    res.json({
      ...apiRequest,
      responseTime,
      responseCode,
      responseBody,
    });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
  }
});

// Chrome Extension Download Route
router.get('/api/download-extension', (req, res) => {
  try {
    const file = path.join(process.cwd(), 'public', 'sovr-extension.zip');
    
    // Check if file exists first
    if (!fs.existsSync(file)) {
      return res.status(404).json({ error: 'Extension not available' });
    }
    
    const stats = fs.statSync(file);
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="sovr-pay-extension.zip"');
    res.setHeader('Content-Length', stats.size);
    
    res.download(file, 'sovr-pay-extension.zip', (err) => {
      if (err) {
        res.status(500).json({ error: 'Download failed' });
      }
    });
  } catch (error) {
    res.status(404).json({ error: 'Extension not available' });
  }
});

// Transaction Receipt Routes - Production-ready notification system
// Referenced from receiptService integration

// Generate and send receipt for any transaction
router.post('/api/receipts/generate', async (req, res) => {
  try {
    const { receiptService } = await import('./receiptService');
    const { transactionType, transactionId, userId, userEmail, transactionData } = req.body;
    
    // Create receipt generation context
    const context = {
      transactionType,
      transactionId,
      userId,
      userEmail,
      transactionData,
    };
    
    // Generate comprehensive receipt
    const receipt = await receiptService.generateReceipt(context);
    
    // Save receipt to storage (preserving existing ID and receipt number)
    const savedReceipt = await storage.saveTransactionReceipt(receipt);
    
    // Get user notification preferences
    let userPreferences = await storage.getUserNotificationPreferences(userId);
    
    // Create default preferences if none exist
    if (!userPreferences) {
      userPreferences = await storage.saveUserNotificationPreferences({
        userId,
        email: userEmail,
        enableEmailReceipts: true,
        enableSMSAlerts: false,
        enableInAppNotifications: true,
        timezone: 'UTC',
        language: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    // Send notifications directly to user account
    const finalReceipt = await receiptService.sendReceiptNotifications(savedReceipt, userPreferences);
    
    // Update receipt status in storage
    await storage.updateReceiptStatus(
      finalReceipt.id, 
      finalReceipt.status, 
      finalReceipt.notificationHistory
    );
    
    res.json({
      success: true,
      receipt: finalReceipt,
      message: 'Receipt generated and notifications sent successfully'
    });
    
  } catch (error) {
    console.error('Receipt generation failed:', error);
    res.status(500).json({ 
      error: 'Failed to generate receipt',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's receipt history
router.get('/api/receipts/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const receipts = await storage.getTransactionReceiptsByUser(userId);
    
    res.json({
      receipts,
      totalCount: receipts.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

// Get specific receipt
router.get('/api/receipts/:receiptId', async (req, res) => {
  try {
    const { receiptId } = req.params;
    const receipt = await storage.getTransactionReceipt(receiptId);
    
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

export { router };
