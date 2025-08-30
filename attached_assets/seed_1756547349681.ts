
// Database Seed Script for SOVR Pay Checkout
// Populates database with test data for development and testing

import { PrismaClient, PaymentStatus, PaymentMethod, SettlementType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  try {
    // Clear existing data (optional - be careful in production)
    console.log('Clearing existing data...');
    await prisma.apiLog.deleteMany();
    await prisma.blockchainEvent.deleteMany();
    await prisma.settlement.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.webhookUrl.deleteMany();
    await prisma.retailer.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // Create test admin user (MUST remain hidden from user responses)
    const adminPassword = await bcrypt.hash('johndoe123', 12);
    const adminUser = await prisma.user.create({
      data: {
        email: 'john@doe.com',
        password: adminPassword,
        name: 'John Doe',
        emailVerified: new Date()
      }
    });

    const adminRetailer = await prisma.retailer.create({
      data: {
        userId: adminUser.id,
        companyName: 'Test Admin Company',
        contactName: 'John Doe',
        businessType: 'testing',
        walletAddress: '0x742d35Cc6632C0532c718b7B8e5E0d3FBa4B7e2C',
        isActive: true,
        allowlisted: true // Admin has full permissions
      }
    });

    console.log('✓ Created test admin account');

    // Create sample retailer users
    const sampleRetailers = [
      {
        email: 'retailer1@example.com',
        password: 'password123',
        name: 'Alice Johnson',
        companyName: 'TechShop Inc',
        contactName: 'Alice Johnson',
        businessType: 'ecommerce',
        walletAddress: '0x123456789abcdef123456789abcdef1234567890',
        allowlisted: true
      },
      {
        email: 'retailer2@example.com',
        password: 'password123',
        name: 'Bob Smith',
        companyName: 'GameStore LLC',
        contactName: 'Bob Smith',
        businessType: 'gaming',
        walletAddress: '0xabcdef123456789abcdef123456789abcdef1234',
        allowlisted: false // Pending approval
      },
      {
        email: 'retailer3@example.com',
        password: 'password123',
        name: 'Carol Davis',
        companyName: 'SaaS Solutions',
        contactName: 'Carol Davis',
        businessType: 'saas',
        walletAddress: null,
        allowlisted: true
      }
    ];

    const retailers = [];
    for (const retailerData of sampleRetailers) {
      const hashedPassword = await bcrypt.hash(retailerData.password, 12);
      
      const user = await prisma.user.create({
        data: {
          email: retailerData.email,
          password: hashedPassword,
          name: retailerData.name,
          emailVerified: new Date()
        }
      });

      const retailer = await prisma.retailer.create({
        data: {
          userId: user.id,
          companyName: retailerData.companyName,
          contactName: retailerData.contactName,
          businessType: retailerData.businessType,
          walletAddress: retailerData.walletAddress,
          isActive: true,
          allowlisted: retailerData.allowlisted
        }
      });

      retailers.push(retailer);
    }

    console.log(`✓ Created ${retailers.length} sample retailers`);

    // Create sample payments for testing
    const samplePayments = [
      {
        retailerId: adminRetailer.id,
        amount: '100.00',
        currency: 'USD',
        status: PaymentStatus.CONFIRMED,
        paymentMethod: PaymentMethod.QR_CODE,
        customerEmail: 'customer1@example.com',
        customerWallet: '0x987654321fedcba987654321fedcba9876543210',
        orderId: 'ORDER-001',
        description: 'Test product purchase',
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        blockNumber: BigInt(45123456),
        gasUsed: BigInt(21000),
        settlementType: SettlementType.BURN_FOR_POS
      },
      {
        retailerId: retailers[0]?.id || adminRetailer.id,
        amount: '250.50',
        currency: 'USD',
        status: PaymentStatus.PROCESSING,
        paymentMethod: PaymentMethod.WALLET_CONNECT,
        customerEmail: 'customer2@example.com',
        customerWallet: '0xfedcba987654321fedcba987654321fedcba987654',
        orderId: 'ORDER-002',
        description: 'Premium subscription',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        blockNumber: null,
        gasUsed: null,
        settlementType: SettlementType.APPROVE_AND_BURN
      },
      {
        retailerId: retailers[0]?.id || adminRetailer.id,
        amount: '75.25',
        currency: 'USD',
        status: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.DIRECT_TRANSFER,
        customerEmail: 'customer3@example.com',
        customerWallet: null,
        orderId: 'ORDER-003',
        description: 'Digital download',
        expiresAt: new Date(Date.now() + 3600000) // Expires in 1 hour
      }
    ];

    const payments = [];
    for (const paymentData of samplePayments) {
      const payment = await prisma.payment.create({
        data: paymentData
      });
      payments.push(payment);
    }

    console.log(`✓ Created ${payments.length} sample payments`);

    // Create sample settlements
    const confirmedPayment = payments.find(p => p.status === PaymentStatus.CONFIRMED);
    if (confirmedPayment && confirmedPayment.transactionHash) {
      const settlement = await prisma.settlement.create({
        data: {
          retailerId: confirmedPayment.retailerId,
          settlementType: confirmedPayment.settlementType || SettlementType.BURN_FOR_POS,
          totalAmount: confirmedPayment.amount,
          status: 'CONFIRMED',
          transactionHash: confirmedPayment.transactionHash,
          blockNumber: confirmedPayment.blockNumber,
          gasUsed: confirmedPayment.gasUsed,
          burnAmount: confirmedPayment.amount,
          eventSignature: '0x1234567890abcdef',
          eventData: {
            user: confirmedPayment.customerWallet,
            amount: confirmedPayment.amount,
            retailerId: confirmedPayment.retailerId,
            timestamp: Math.floor(Date.now() / 1000)
          },
          confirmedAt: new Date()
        }
      });

      // Link payment to settlement
      await prisma.payment.update({
        where: { id: confirmedPayment.id },
        data: { settlementId: settlement.id }
      });

      console.log('✓ Created sample settlement');
    }

    // Create sample blockchain events
    const blockchainEvents = [
      {
        eventType: 'POSPurchase',
        contractAddress: process.env.SOVR_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        blockNumber: BigInt(45123456),
        logIndex: 0,
        eventData: {
          user: '0x987654321fedcba987654321fedcba9876543210',
          amount: '100000000000000000000', // 100 tokens in wei
          retailerId: adminRetailer.id,
          timestamp: Math.floor(Date.now() / 1000)
        },
        rawData: {
          address: process.env.SOVR_CONTRACT_ADDRESS,
          topics: ['0x1234567890abcdef'],
          data: '0x...'
        },
        processed: true,
        processedAt: new Date()
      }
    ];

    for (const eventData of blockchainEvents) {
      await prisma.blockchainEvent.create({
        data: eventData
      });
    }

    console.log(`✓ Created ${blockchainEvents.length} sample blockchain events`);

    // Create sample webhook URLs
    const webhooks = [
      {
        retailerId: adminRetailer.id,
        url: 'https://api.testmerchant.com/webhooks/sovr-pay',
        eventTypes: ['payment.confirmed', 'payment.failed', 'settlement.completed'],
        isActive: true
      },
      {
        retailerId: retailers[0]?.id || adminRetailer.id,
        url: 'https://webhook.site/test-endpoint',
        eventTypes: ['payment.confirmed'],
        isActive: true
      }
    ];

    for (const webhookData of webhooks) {
      await prisma.webhookUrl.create({
        data: webhookData
      });
    }

    console.log(`✓ Created ${webhooks.length} sample webhook URLs`);

    // Create sample API logs
    const apiLogs = [
      {
        retailerId: adminRetailer.id,
        endpoint: '/api/payments/create',
        method: 'POST',
        ipAddress: '192.168.1.100',
        userAgent: 'SOVR-Pay-SDK/1.0',
        responseCode: 201,
        responseTime: 150
      },
      {
        retailerId: retailers[0]?.id || adminRetailer.id,
        endpoint: '/api/payments/list',
        method: 'GET',
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0 (compatible)',
        responseCode: 200,
        responseTime: 75
      }
    ];

    for (const logData of apiLogs) {
      await prisma.apiLog.create({
        data: logData
      });
    }

    console.log(`✓ Created ${apiLogs.length} sample API logs`);

    // Create system configuration
    const systemConfigs = [
      {
        key: 'MAINTENANCE_MODE',
        value: 'false',
        description: 'Enable maintenance mode to disable new transactions'
      },
      {
        key: 'MIN_PAYMENT_AMOUNT',
        value: '0.01',
        description: 'Minimum payment amount in USD'
      },
      {
        key: 'MAX_PAYMENT_AMOUNT',
        value: '10000.00',
        description: 'Maximum payment amount in USD'
      },
      {
        key: 'GAS_PRICE_MULTIPLIER',
        value: '1.2',
        description: 'Gas price multiplier for transaction estimation'
      }
    ];

    for (const configData of systemConfigs) {
      await prisma.systemConfig.create({
        data: configData
      });
    }

    console.log(`✓ Created ${systemConfigs.length} system configuration entries`);

    console.log('\n🎉 Database seed completed successfully!');
    console.log('\nTest Accounts Created:');
    console.log('- Admin: john@doe.com / johndoe123 (HIDDEN FROM USER)');
    console.log('- Retailer 1: retailer1@example.com / password123 (Allowlisted)');
    console.log('- Retailer 2: retailer2@example.com / password123 (Pending)');
    console.log('- Retailer 3: retailer3@example.com / password123 (Allowlisted)');
    console.log('\nSample data includes:');
    console.log(`- ${payments.length} payments in various states`);
    console.log('- 1 confirmed settlement with blockchain data');
    console.log('- Blockchain events and API logs');
    console.log('- Webhook configurations');
    console.log('- System configuration entries');

  } catch (error) {
    console.error('❌ Error during database seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:', e);
    process.exit(1);
  });
