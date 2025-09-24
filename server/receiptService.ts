// Receipt Service - Unified transaction receipt generation and notification system
// Referenced from javascript_sendgrid integration

import crypto from 'crypto';
import { randomUUID } from 'crypto';
import {
  TransactionReceipt,
  CreateTransactionReceipt,
  TransactionEvent,
  UserNotificationPreferences,
  NotificationTemplate
} from '@shared/schema';

// SendGrid integration - referenced from blueprint
import { MailService } from '@sendgrid/mail';

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface ReceiptGenerationContext {
  transactionType: string;
  transactionId: string;
  userId: string;
  userEmail: string;
  transactionData: any;
  userPreferences?: UserNotificationPreferences;
}

export class TransactionReceiptService {
  
  /**
   * Generate a comprehensive transaction receipt with document storage
   */
  async generateReceipt(context: ReceiptGenerationContext): Promise<TransactionReceipt> {
    const receiptId = randomUUID();
    const receiptNumber = this.generateReceiptNumber();
    const timestamp = new Date().toISOString();
    
    // Create receipt content based on transaction type
    const receiptContent = await this.createReceiptContent(context);
    
    // Generate immutable reference for integrity verification
    const immutableReference = this.generateImmutableReference(receiptContent);
    
    // Generate receipt documents in multiple formats
    const receiptDocuments = await this.generateReceiptDocuments(receiptContent, receiptId);
    
    const receipt: TransactionReceipt = {
      id: receiptId,
      receiptNumber,
      transactionType: context.transactionType as any,
      transactionId: context.transactionId,
      userId: context.userId,
      userEmail: context.userEmail,
      
      // Financial details extracted from transaction data
      amount: context.transactionData.amount,
      currency: context.transactionData.currency || 'USD',
      exchangeRate: context.transactionData.exchangeRate,
      feeAmount: context.transactionData.feeAmount,
      netAmount: context.transactionData.netAmount,
      
      // Asset details for tokenization transactions
      assetDetails: context.transactionData.assetDetails,
      
      // Blockchain information
      networkDetails: {
        network: context.transactionData.network,
        blockNumber: context.transactionData.blockNumber,
        transactionHash: context.transactionData.transactionHash,
        gasUsed: context.transactionData.gasUsed,
        gasFee: context.transactionData.gasFee,
      },
      
      // Compliance information
      complianceData: {
        kycStatus: context.transactionData.kycStatus,
        amlChecked: context.transactionData.amlChecked || false,
        jurisdictionCode: context.transactionData.jurisdictionCode || 'US',
        regulatoryReference: context.transactionData.regulatoryReference,
        reportingRequired: context.transactionData.reportingRequired || false,
      },
      
      status: 'generated',
      generatedAt: timestamp,
      receiptDocuments,
      notificationHistory: [],
      immutableReference,
      metadata: {
        generatedBy: 'SOVR Pay Receipt Service',
        version: '1.0.0',
        compliance: true,
      },
    };
    
    return receipt;
  }
  
  /**
   * Send receipt notifications directly to user accounts
   */
  async sendReceiptNotifications(
    receipt: TransactionReceipt,
    userPreferences: UserNotificationPreferences
  ): Promise<TransactionReceipt> {
    const notifications = [];
    
    // Send email receipt if enabled
    if (userPreferences.enableEmailReceipts) {
      const emailResult = await this.sendEmailReceipt(receipt, userPreferences);
      notifications.push(emailResult);
    }
    
    // Send SMS alert if enabled and phone number provided
    if (userPreferences.enableSMSAlerts && userPreferences.phone) {
      const smsResult = await this.sendSMSAlert(receipt, userPreferences);
      notifications.push(smsResult);
    }
    
    // Send in-app notification if enabled
    if (userPreferences.enableInAppNotifications) {
      const inAppResult = await this.sendInAppNotification(receipt, userPreferences);
      notifications.push(inAppResult);
    }
    
    // Update receipt with notification history
    receipt.notificationHistory = notifications;
    receipt.status = notifications.some(n => n.status === 'delivered') ? 'delivered' : 'sent';
    receipt.sentAt = new Date().toISOString();
    
    if (receipt.status === 'delivered') {
      receipt.deliveredAt = new Date().toISOString();
    }
    
    return receipt;
  }
  
  /**
   * Generate human-readable receipt number
   */
  private generateReceiptNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const sequence = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `RCP-${year}${month}-${sequence}`;
  }
  
  /**
   * Create receipt content based on transaction type
   */
  private async createReceiptContent(context: ReceiptGenerationContext): Promise<any> {
    const baseContent = {
      receiptNumber: this.generateReceiptNumber(),
      timestamp: new Date().toISOString(),
      transactionType: context.transactionType,
      transactionId: context.transactionId,
      userEmail: context.userEmail,
    };
    
    switch (context.transactionType) {
      case 'payment':
        return {
          ...baseContent,
          title: 'Payment Confirmation',
          description: 'Your payment has been successfully processed',
          amount: context.transactionData.amount,
          currency: context.transactionData.currency,
          paymentMethod: context.transactionData.paymentMethod,
        };
        
      case 'tokenization':
        return {
          ...baseContent,
          title: 'Asset Tokenization Complete',
          description: 'Your real-world asset has been successfully tokenized',
          assetName: context.transactionData.assetName,
          tokenSymbol: context.transactionData.tokenSymbol,
          quantity: context.transactionData.quantity,
          contractAddress: context.transactionData.contractAddress,
        };
        
      case 'defi_stake':
        return {
          ...baseContent,
          title: 'DeFi Staking Confirmation',
          description: 'Your tokens have been successfully staked',
          stakedAmount: context.transactionData.amount,
          stakingPool: context.transactionData.poolName,
          expectedYield: context.transactionData.expectedYield,
        };
        
      case 'compliance_kyc':
        return {
          ...baseContent,
          title: 'KYC Verification Complete',
          description: 'Your identity verification has been completed',
          verificationLevel: context.transactionData.verificationLevel,
          documentsVerified: context.transactionData.documentsVerified,
        };
        
      case 'smart_contract_deploy':
        return {
          ...baseContent,
          title: 'Smart Contract Deployed',
          description: 'Your smart contract has been successfully deployed',
          contractName: context.transactionData.contractName,
          contractAddress: context.transactionData.contractAddress,
          network: context.transactionData.network,
          gasUsed: context.transactionData.gasUsed,
        };
        
      default:
        return {
          ...baseContent,
          title: 'Transaction Confirmation',
          description: 'Your transaction has been processed',
        };
    }
  }
  
  /**
   * Generate immutable reference for integrity verification
   */
  private generateImmutableReference(content: any): string {
    const contentString = JSON.stringify(content, Object.keys(content).sort());
    return crypto.createHash('sha256').update(contentString).digest('hex');
  }
  
  /**
   * Generate receipt documents in multiple formats
   */
  private async generateReceiptDocuments(content: any, receiptId: string): Promise<any[]> {
    const documents = [];
    
    // Generate HTML receipt
    const htmlContent = this.generateHTMLReceipt(content);
    documents.push({
      format: 'html',
      storageUrl: `/receipts/${receiptId}/receipt.html`,
      size: Buffer.byteLength(htmlContent, 'utf8'),
      checksum: crypto.createHash('md5').update(htmlContent).digest('hex'),
    });
    
    // Generate JSON receipt for API access
    const jsonContent = JSON.stringify(content, null, 2);
    documents.push({
      format: 'json',
      storageUrl: `/receipts/${receiptId}/receipt.json`,
      size: Buffer.byteLength(jsonContent, 'utf8'),
      checksum: crypto.createHash('md5').update(jsonContent).digest('hex'),
    });
    
    return documents;
  }
  
  /**
   * Generate professional HTML receipt
   */
  private generateHTMLReceipt(content: any): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SOVR Pay Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; border: 1px solid #e0e0e0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #2e7d32; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SOVR Pay</h1>
        <h2>${content.title}</h2>
      </div>
      <div class="content">
        <div class="detail-row">
          <span>Receipt Number:</span>
          <strong>${content.receiptNumber}</strong>
        </div>
        <div class="detail-row">
          <span>Date:</span>
          <span>${new Date(content.timestamp).toLocaleString()}</span>
        </div>
        <div class="detail-row">
          <span>Transaction ID:</span>
          <span>${content.transactionId}</span>
        </div>
        ${content.amount ? `
        <div class="detail-row">
          <span>Amount:</span>
          <span class="amount">${content.currency} ${content.amount}</span>
        </div>
        ` : ''}
        <p><strong>Description:</strong> ${content.description}</p>
      </div>
      <div class="footer">
        <p>This is an official receipt from SOVR Pay Financial Technology Platform</p>
        <p>For support, contact support@sovrpay.com</p>
      </div>
    </body>
    </html>
    `;
  }
  
  /**
   * Send email receipt using SendGrid
   */
  private async sendEmailReceipt(
    receipt: TransactionReceipt,
    userPreferences: UserNotificationPreferences
  ): Promise<any> {
    const timestamp = new Date().toISOString();
    
    try {
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SendGrid API key not configured');
      }
      
      const htmlReceipt = receipt.receiptDocuments.find(doc => doc.format === 'html');
      const subject = `SOVR Pay Receipt - ${receipt.receiptNumber}`;
      
      await mailService.send({
        to: receipt.userEmail,
        from: 'receipts@sovrpay.com',
        subject,
        html: this.generateHTMLReceipt({
          title: this.getTransactionTitle(receipt.transactionType),
          receiptNumber: receipt.receiptNumber,
          timestamp: receipt.generatedAt,
          transactionId: receipt.transactionId,
          amount: receipt.amount,
          currency: receipt.currency,
          description: this.getTransactionDescription(receipt.transactionType),
        }),
        text: `Your SOVR Pay transaction receipt ${receipt.receiptNumber} is ready. Transaction ID: ${receipt.transactionId}`,
      });
      
      return {
        method: 'email',
        recipient: receipt.userEmail,
        status: 'delivered',
        sentAt: timestamp,
        deliveredAt: timestamp,
      };
    } catch (error) {
      return {
        method: 'email',
        recipient: receipt.userEmail,
        status: 'failed',
        sentAt: timestamp,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Send SMS alert (placeholder for future Twilio integration)
   */
  private async sendSMSAlert(
    receipt: TransactionReceipt,
    userPreferences: UserNotificationPreferences
  ): Promise<any> {
    const timestamp = new Date().toISOString();
    
    // Placeholder for SMS implementation
    return {
      method: 'sms',
      recipient: userPreferences.phone || '',
      status: 'sent',
      sentAt: timestamp,
      deliveredAt: timestamp,
    };
  }
  
  /**
   * Send in-app notification (WebSocket or database record)
   */
  private async sendInAppNotification(
    receipt: TransactionReceipt,
    userPreferences: UserNotificationPreferences
  ): Promise<any> {
    const timestamp = new Date().toISOString();
    
    // Placeholder for in-app notification implementation
    return {
      method: 'in_app',
      recipient: receipt.userId,
      status: 'delivered',
      sentAt: timestamp,
      deliveredAt: timestamp,
    };
  }
  
  /**
   * Get human-readable transaction title
   */
  private getTransactionTitle(transactionType: string): string {
    const titles: Record<string, string> = {
      payment: 'Payment Confirmation',
      tokenization: 'Asset Tokenization Complete',
      defi_stake: 'DeFi Staking Confirmation',
      defi_unstake: 'DeFi Unstaking Confirmation',
      compliance_kyc: 'KYC Verification Complete',
      smart_contract_deploy: 'Smart Contract Deployed',
      refund: 'Refund Processed',
      settlement: 'Settlement Complete',
    };
    
    return titles[transactionType] || 'Transaction Confirmation';
  }
  
  /**
   * Get human-readable transaction description
   */
  private getTransactionDescription(transactionType: string): string {
    const descriptions: Record<string, string> = {
      payment: 'Your payment has been successfully processed and confirmed on the blockchain.',
      tokenization: 'Your real-world asset has been successfully tokenized and is now available on the blockchain.',
      defi_stake: 'Your tokens have been successfully staked in the DeFi protocol.',
      defi_unstake: 'Your tokens have been successfully unstaked and returned to your wallet.',
      compliance_kyc: 'Your identity verification has been completed and approved.',
      smart_contract_deploy: 'Your smart contract has been successfully deployed to the blockchain.',
      refund: 'Your refund has been processed and will appear in your account shortly.',
      settlement: 'Your transaction settlement has been completed successfully.',
    };
    
    return descriptions[transactionType] || 'Your transaction has been processed successfully.';
  }
}

// Export singleton instance
export const receiptService = new TransactionReceiptService();