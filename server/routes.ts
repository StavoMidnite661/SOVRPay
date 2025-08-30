import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import path from 'path';
import { storage } from './storage';
import { createPaymentSchema, createSmartContractSchema } from '@shared/schema';

const router = express.Router();

// WebSocket server for real-time updates
let wss: WebSocketServer;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
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
      console.log('WebSocket client disconnected');
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
          amount: 1000,
          currency: 'USD',
          created_at: new Date().toISOString(),
          transaction_id: 'txn_abcdef123456'
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
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="sovr-pay-extension.zip"');
    res.setHeader('Content-Length', require('fs').statSync(file).size);
    
    res.download(file, 'sovr-pay-extension.zip', (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).send('Error downloading extension');
      }
    });
  } catch (error) {
    console.error('Extension download error:', error);
    res.status(404).json({ error: 'Extension file not found' });
  }
});

export { router };
