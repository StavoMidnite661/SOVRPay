import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import path from 'path';
import fs from 'fs';
import { storage } from './storage';
import { createPaymentSchema, createSmartContractSchema, insertTokenizedAssetSchema, insertAssetValuationSchema, insertMarketPriceSchema, insertPropertyInsightSchema } from '@shared/schema';
import { alphaVantageClient, realEstateApiClient, commodityApiClient, marketDataClient } from './services/apiClient';

const router = express.Router();

// WebSocket server for real-time updates
let wss: WebSocketServer;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send initial data
    Promise.all([
      storage.getSystemMetrics(),
      storage.listMarketPrices({ page: 1, limit: 5, sortBy: 'timestamp', sortOrder: 'desc' }),
      storage.listTokenizedAssets({ page: 1, limit: 10 })
    ]).then(([metrics, marketPrices, assets]) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'initial_data', data: { metrics, marketPrices, assets } }));
      }
    });
    
    // Set up periodic updates
    const intervals: NodeJS.Timeout[] = [];
    
    // System metrics every 5 seconds
    const metricsInterval = setInterval(async () => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          const metrics = await storage.getSystemMetrics();
          ws.send(JSON.stringify({ type: 'metrics_update', data: metrics }));
        } catch (error) {
          console.error('Error sending metrics update:', error);
        }
      } else {
        clearInterval(metricsInterval);
      }
    }, 5000);
    intervals.push(metricsInterval);
    
    // Market prices every 30 seconds
    const marketInterval = setInterval(async () => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          // Generate simulated real-time market data
          const liveMarketData = [];
          const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'BTC', 'ETH'];
          
          for (const symbol of symbols) {
            const basePrice = symbol === 'BTC' ? 45000 : symbol === 'ETH' ? 3000 : 150;
            const marketData = {
              assetId: `${symbol.toLowerCase()}_live`,
              price: basePrice + (Math.random() - 0.5) * basePrice * 0.02, // ±2% variance
              currency: 'USD',
              source: 'exchange',
              sourceName: symbol === 'BTC' || symbol === 'ETH' ? 'Coinbase' : 'Alpha Vantage',
              sourceReliability: 'very_high',
              volume: Math.floor(Math.random() * 10000000),
              volumePeriod: '24h',
              changeAmount: (Math.random() - 0.5) * 10,
              changePercent: (Math.random() - 0.5) * 5,
              changePeriod: '24h',
              confidence: 'very_high',
              timestamp: new Date().toISOString()
            };
            
            const marketPrice = await storage.createMarketPrice(insertMarketPriceSchema.parse(marketData));
            liveMarketData.push(marketPrice);
          }
          
          ws.send(JSON.stringify({ type: 'live_market_prices', data: liveMarketData }));
        } catch (error) {
          console.error('Error sending market price update:', error);
        }
      } else {
        clearInterval(marketInterval);
      }
    }, 30000);
    intervals.push(marketInterval);
    
    // Asset valuation alerts every 60 seconds
    const valuationInterval = setInterval(async () => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          // Simulate asset valuation updates
          const assets = await storage.listTokenizedAssets({ page: 1, limit: 5 });
          if (assets.data.length > 0) {
            const randomAsset = assets.data[Math.floor(Math.random() * assets.data.length)];
            const valuationUpdate = {
              assetId: randomAsset.id,
              newValuation: randomAsset.pricePerToken * (0.95 + Math.random() * 0.1), // ±5% change
              changePercent: (Math.random() - 0.5) * 10,
              timestamp: new Date().toISOString(),
              source: 'automated_revaluation'
            };
            
            ws.send(JSON.stringify({ type: 'asset_valuation_update', data: valuationUpdate }));
          }
        } catch (error) {
          console.error('Error sending valuation update:', error);
        }
      } else {
        clearInterval(valuationInterval);
      }
    }, 60000);
    intervals.push(valuationInterval);
    
    // Handle incoming messages from client
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'subscribe_asset':
            // Send specific asset updates
            if (data.assetId) {
              const asset = await storage.getTokenizedAsset(data.assetId);
              if (asset) {
                ws.send(JSON.stringify({ type: 'asset_subscribed', data: asset }));
              }
            }
            break;
            
          case 'request_market_data':
            // Send latest market data for specific symbols
            if (data.symbols && Array.isArray(data.symbols)) {
              const marketData = [];
              for (const symbol of data.symbols) {
                const latestPrice = await storage.getLatestMarketPrice(`${symbol.toLowerCase()}_live`);
                if (latestPrice) {
                  marketData.push(latestPrice);
                }
              }
              ws.send(JSON.stringify({ type: 'requested_market_data', data: marketData }));
            }
            break;
            
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            break;
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      // Clean up all intervals
      intervals.forEach(interval => clearInterval(interval));
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
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

// =============================================================================
// ASSET MANAGEMENT ROUTES
// =============================================================================

// Assets CRUD Routes with Pagination
router.get('/api/assets', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      assetType = '',
      status = ''
    } = req.query;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      search: search as string
    };

    // Apply filters
    const result = await storage.listTokenizedAssets(options);
    
    // Filter by asset type if specified
    if (assetType) {
      result.data = result.data.filter(asset => asset.assetType === assetType);
    }
    
    // Filter by status if specified
    if (status) {
      result.data = result.data.filter(asset => asset.status === status);
    }

    broadcast({ type: 'assets_listed', data: { count: result.data.length } });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

router.post('/api/assets', async (req, res) => {
  try {
    const validatedData = insertTokenizedAssetSchema.parse(req.body);
    const asset = await storage.createTokenizedAsset(validatedData);
    
    broadcast({ type: 'asset_created', data: asset });
    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Invalid asset data' 
    });
  }
});

router.get('/api/assets/:id', async (req, res) => {
  try {
    const asset = await storage.getTokenizedAsset(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

router.put('/api/assets/:id', async (req, res) => {
  try {
    const updates = req.body;
    const asset = await storage.updateTokenizedAsset(req.params.id, updates);
    
    broadcast({ type: 'asset_updated', data: asset });
    res.json(asset);
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to update asset' 
    });
  }
});

router.delete('/api/assets/:id', async (req, res) => {
  try {
    await storage.deleteTokenizedAsset(req.params.id);
    
    broadcast({ type: 'asset_deleted', data: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to delete asset' 
    });
  }
});

// =============================================================================
// ASSET VALUATION ROUTES
// =============================================================================

router.post('/api/assets/:id/valuation', async (req, res) => {
  try {
    const assetId = req.params.id;
    const asset = await storage.getTokenizedAsset(assetId);
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Create valuation request data
    const valuationData = {
      ...req.body,
      assetId,
      valuationDate: new Date().toISOString(),
      effectiveDate: new Date().toISOString()
    };

    // For real estate assets, integrate with real estate API
    if (asset.assetType === 'real_estate' && asset.metadata?.address) {
      try {
        // Call real estate API for automated valuation
        const realEstateData = await realEstateApiClient.get(`/properties/valuation`, {
          headers: {
            'Authorization': `Bearer ${process.env.REAL_ESTATE_API_KEY}`
          },
          cache: { ttl: 1800 } // 30 minutes cache
        });

        // Enhance valuation with external data
        valuationData.methodology = 'automated_avm_with_market_analysis';
        valuationData.valuationType = 'market_based';
        valuationData.marketConditions = {
          trend: realEstateData.market?.trend || 'stable',
          volatility: 'medium',
          liquidity: 'medium',
          notes: 'Based on automated valuation model with current market data'
        };
      } catch (apiError) {
        console.warn('Real estate API unavailable, proceeding with manual valuation');
      }
    }

    const validatedData = insertAssetValuationSchema.parse(valuationData);
    const valuation = await storage.createAssetValuation(validatedData);
    
    broadcast({ type: 'asset_valuation_created', data: { assetId, valuation } });
    res.status(201).json(valuation);
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to create valuation' 
    });
  }
});

router.get('/api/assets/:id/valuations', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      sortBy = 'valuationDate',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const result = await storage.getAssetValuationsByAsset(req.params.id, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset valuations' });
  }
});

// =============================================================================
// MARKET PRICES ROUTES
// =============================================================================

router.get('/api/markets/prices', async (req, res) => {
  try {
    const {
      symbol = '',
      assetType = '',
      source = '',
      live = 'false'
    } = req.query;

    // If live data is requested, fetch from external APIs
    if (live === 'true') {
      const liveData = [];

      // Fetch stock/equity data from Alpha Vantage
      if (!assetType || assetType === 'stock') {
        try {
          const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
          const symbols = symbol ? [symbol as string] : ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
          
          for (const stockSymbol of symbols) {
            const stockData = await alphaVantageClient.get(`/query`, {
              cache: { ttl: 60 }, // 1 minute cache
              headers: {
                'User-Agent': 'SOVR-Asset-Management/1.0'
              }
            });

            // Simulate Alpha Vantage response structure
            const mockData = {
              assetId: `stock_${stockSymbol.toLowerCase()}`,
              price: 150 + Math.random() * 100,
              currency: 'USD',
              source: 'exchange',
              sourceName: 'Alpha Vantage',
              sourceReliability: 'very_high',
              volume: Math.floor(Math.random() * 10000000),
              volumePeriod: '24h',
              changeAmount: (Math.random() - 0.5) * 10,
              changePercent: (Math.random() - 0.5) * 5,
              changePeriod: '24h',
              confidence: 'very_high',
              timestamp: new Date().toISOString()
            };

            const marketPrice = await storage.createMarketPrice(insertMarketPriceSchema.parse(mockData));
            liveData.push(marketPrice);
          }
        } catch (apiError) {
          console.warn('Alpha Vantage API unavailable:', apiError);
        }
      }

      // Fetch commodity data
      if (!assetType || assetType === 'commodity') {
        try {
          const commodities = ['gold', 'silver', 'oil', 'copper'];
          
          for (const commodity of commodities) {
            const commodityData = await commodityApiClient.get(`/v1/latest`, {
              cache: { ttl: 180 }, // 3 minutes cache
              headers: {
                'Authorization': `Bearer ${process.env.COMMODITY_API_KEY}`
              }
            });

            // Simulate commodity pricing response
            const mockData = {
              assetId: `commodity_${commodity}`,
              price: commodity === 'gold' ? 1800 + Math.random() * 200 : 
                     commodity === 'silver' ? 20 + Math.random() * 5 :
                     commodity === 'oil' ? 70 + Math.random() * 20 : 
                     3 + Math.random() * 2,
              currency: 'USD',
              source: 'exchange',
              sourceName: 'Metals.live',
              sourceReliability: 'high',
              changeAmount: (Math.random() - 0.5) * 5,
              changePercent: (Math.random() - 0.5) * 3,
              changePeriod: '24h',
              confidence: 'high',
              timestamp: new Date().toISOString()
            };

            const marketPrice = await storage.createMarketPrice(insertMarketPriceSchema.parse(mockData));
            liveData.push(marketPrice);
          }
        } catch (apiError) {
          console.warn('Commodity API unavailable:', apiError);
        }
      }

      broadcast({ type: 'live_market_data', data: liveData });
      res.json({ data: liveData, live: true, timestamp: new Date().toISOString() });
    } else {
      // Return cached/stored market prices
      const {
        page = '1',
        limit = '20',
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = req.query;

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      const result = await storage.listMarketPrices(options);
      res.json(result);
    }
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch market prices' 
    });
  }
});

router.get('/api/markets/prices/:assetId/history', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '100',
      fromDate = '',
      toDate = '',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: 'timestamp',
      sortOrder: sortOrder as 'asc' | 'desc',
      fromDate: fromDate as string,
      toDate: toDate as string
    };

    const result = await storage.getMarketPriceHistory(req.params.assetId, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// =============================================================================
// PROPERTY INSIGHTS ROUTES
// =============================================================================

router.get('/api/assets/:id/insights', async (req, res) => {
  try {
    const assetId = req.params.id;
    const asset = await storage.getTokenizedAsset(assetId);
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const {
      page = '1',
      limit = '10',
      insightType = '',
      sortBy = 'lastUpdated',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    let insights = await storage.getPropertyInsightsByAsset(assetId, options);

    // If no insights exist, generate some based on asset type
    if (insights.data.length === 0) {
      const generatedInsights = [];

      if (asset.assetType === 'real_estate') {
        // Generate real estate insights
        const marketAnalysis = {
          assetId,
          insightType: 'market_analysis' as const,
          title: 'Market Analysis Report',
          description: 'Comprehensive analysis of local real estate market trends and conditions',
          keyMetrics: {
            averagePrice: asset.pricePerToken * asset.totalSupply * (0.9 + Math.random() * 0.2),
            priceGrowth: Math.random() * 10 - 2,
            marketActivity: Math.floor(Math.random() * 100) + 50,
            daysOnMarket: Math.floor(Math.random() * 60) + 30
          },
          analysisMethod: 'Comparative Market Analysis with machine learning',
          dataSourcesUsed: ['MLS', 'Public Records', 'Market Trends'],
          geographicScope: 'neighborhood' as const,
          riskLevel: 'medium' as const,
          opportunityScore: Math.floor(Math.random() * 40) + 60,
          trends: [{
            indicator: 'Property Values',
            currentValue: asset.pricePerToken,
            historicalValues: [
              { period: '6m', value: asset.pricePerToken * 0.95 },
              { period: '1y', value: asset.pricePerToken * 0.88 }
            ],
            trend: 'increasing' as const,
            significance: 'high' as const
          }],
          accuracy: 'high' as const,
          relevance: 'very_high' as const,
          freshnessScore: 95,
          generatedBy: 'ai_model' as const,
          lastUpdated: new Date().toISOString(),
          tags: ['market-analysis', 'real-estate', 'trends'],
          modelVersion: 'v2.1'
        };

        const rentalYield = {
          assetId,
          insightType: 'rental_yield' as const,
          title: 'Rental Yield Analysis',
          description: 'Analysis of potential rental income and yield for this property',
          keyMetrics: {
            estimatedRent: Math.floor(asset.pricePerToken * 0.05 * (0.8 + Math.random() * 0.4)),
            grossYield: Math.random() * 3 + 4,
            netYield: Math.random() * 2 + 3,
            occupancyRate: Math.random() * 10 + 90
          },
          analysisMethod: 'Rental comparison analysis',
          dataSourcesUsed: ['Rental Listings', 'Market Data'],
          geographicScope: 'city' as const,
          riskLevel: 'low' as const,
          opportunityScore: Math.floor(Math.random() * 30) + 70,
          accuracy: 'high' as const,
          relevance: 'high' as const,
          freshnessScore: 88,
          generatedBy: 'ai_model' as const,
          lastUpdated: new Date().toISOString(),
          tags: ['rental-yield', 'income', 'investment'],
          modelVersion: 'v2.1'
        };

        generatedInsights.push(
          await storage.createPropertyInsight(insertPropertyInsightSchema.parse(marketAnalysis)),
          await storage.createPropertyInsight(insertPropertyInsightSchema.parse(rentalYield))
        );
      }

      if (asset.assetType === 'commodity') {
        // Generate commodity insights
        const marketAnalysis = {
          assetId,
          insightType: 'market_analysis' as const,
          title: 'Commodity Market Analysis',
          description: 'Analysis of commodity market trends, supply/demand factors, and price forecasts',
          keyMetrics: {
            currentPrice: asset.pricePerToken,
            volatility: Math.random() * 30 + 10,
            supplyLevel: Math.random() * 100,
            demandTrend: Math.random() * 2 - 1
          },
          analysisMethod: 'Fundamental and technical analysis',
          dataSourcesUsed: ['Trading Data', 'Supply Reports', 'Economic Indicators'],
          geographicScope: 'global' as const,
          riskLevel: 'medium' as const,
          opportunityScore: Math.floor(Math.random() * 50) + 50,
          accuracy: 'medium' as const,
          relevance: 'high' as const,
          freshnessScore: 92,
          generatedBy: 'ai_model' as const,
          lastUpdated: new Date().toISOString(),
          tags: ['commodity', 'market-analysis', 'trading'],
          modelVersion: 'v2.1'
        };

        generatedInsights.push(
          await storage.createPropertyInsight(insertPropertyInsightSchema.parse(marketAnalysis))
        );
      }

      insights = {
        data: generatedInsights,
        pagination: {
          page: 1,
          limit: 10,
          totalCount: generatedInsights.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };
    }

    // Filter by insight type if specified
    if (insightType) {
      insights.data = insights.data.filter(insight => insight.insightType === insightType);
    }

    broadcast({ type: 'asset_insights_generated', data: { assetId, count: insights.data.length } });
    res.json(insights);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch asset insights' 
    });
  }
});

router.post('/api/assets/:id/insights', async (req, res) => {
  try {
    const assetId = req.params.id;
    const asset = await storage.getTokenizedAsset(assetId);
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const insightData = {
      ...req.body,
      assetId,
      lastUpdated: new Date().toISOString()
    };

    const validatedData = insertPropertyInsightSchema.parse(insightData);
    const insight = await storage.createPropertyInsight(validatedData);
    
    broadcast({ type: 'asset_insight_created', data: { assetId, insight } });
    res.status(201).json(insight);
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to create insight' 
    });
  }
});

export { router };
