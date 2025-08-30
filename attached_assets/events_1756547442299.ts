
// Blockchain Event Monitoring and Processing
// Real-time event handling for SOVR Pay settlements

import { getWeb3Client } from './client';
import { EVENT_SIGNATURES } from './abi';
import { WEB3_CONFIG } from './config';
import { prisma } from '../db';

export interface ProcessedEvent {
  id: string;
  eventType: string;
  transactionHash: string;
  blockNumber: bigint;
  logIndex: number;
  eventData: any;
  rawData: any;
  processed: boolean;
}

export class EventMonitor {
  private web3Client = getWeb3Client();
  private isMonitoring = false;
  private lastProcessedBlock = BigInt(0);
  private retryCount = 0;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Get the last processed block from database
      const lastEvent = await prisma.blockchainEvent.findFirst({
        orderBy: { blockNumber: 'desc' },
        select: { blockNumber: true }
      });

      if (lastEvent) {
        this.lastProcessedBlock = lastEvent.blockNumber;
      } else {
        // Start from deployment block or recent block
        const currentBlock = await this.web3Client.getCurrentBlock();
        this.lastProcessedBlock = currentBlock - BigInt(1000); // Start 1000 blocks ago
      }
    } catch (error) {
      console.error('Failed to initialize event monitor:', error);
      // Fallback to current block
      try {
        const currentBlock = await this.web3Client.getCurrentBlock();
        this.lastProcessedBlock = currentBlock;
      } catch (blockError) {
        console.error('Failed to get current block:', blockError);
        this.lastProcessedBlock = BigInt(0);
      }
    }
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('Event monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    console.log(`Starting event monitoring from block ${this.lastProcessedBlock.toString()}`);

    // Start the monitoring loop
    this.monitoringLoop();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('Event monitoring stopped');
  }

  private async monitoringLoop(): Promise<void> {
    while (this.isMonitoring) {
      try {
        await this.processNewEvents();
        this.retryCount = 0; // Reset retry count on success
        
        // Wait before next polling cycle
        await new Promise(resolve => setTimeout(resolve, WEB3_CONFIG.EVENTS.pollingInterval));
      } catch (error) {
        console.error('Error in monitoring loop:', error);
        await this.handleMonitoringError();
      }
    }
  }

  private async processNewEvents(): Promise<void> {
    try {
      const currentBlock = await this.web3Client.getCurrentBlock();
      const toBlock = this.lastProcessedBlock + BigInt(WEB3_CONFIG.EVENTS.blockRange);
      const actualToBlock = toBlock > currentBlock ? currentBlock : toBlock;

      if (actualToBlock <= this.lastProcessedBlock) {
        return; // No new blocks to process
      }

      console.log(`Processing events from block ${this.lastProcessedBlock.toString()} to ${actualToBlock.toString()}`);

      // Get all relevant events
      const events = await this.web3Client.getPastEvents('allEvents', 
        Number(this.lastProcessedBlock),
        Number(actualToBlock)
      );

      // Process each event
      for (const event of events) {
        await this.processEvent(event);
      }

      // Update last processed block
      this.lastProcessedBlock = actualToBlock;
      
      console.log(`Processed ${events?.length || 0} events up to block ${actualToBlock.toString()}`);
    } catch (error) {
      console.error('Failed to process new events:', error);
      throw error;
    }
  }

  private async processEvent(event: any): Promise<void> {
    try {
      // Check if event already exists
      const existingEvent = await prisma.blockchainEvent.findUnique({
        where: {
          transactionHash_logIndex: {
            transactionHash: event.transactionHash,
            logIndex: event.logIndex
          }
        }
      });

      if (existingEvent) {
        return; // Event already processed
      }

      // Determine event type
      const eventType = this.getEventType(event);
      if (!eventType) {
        console.warn(`Unknown event type for transaction ${event.transactionHash}:${event.logIndex}`);
        return;
      }

      // Store event in database
      const storedEvent = await prisma.blockchainEvent.create({
        data: {
          eventType,
          contractAddress: event.address,
          transactionHash: event.transactionHash,
          blockNumber: BigInt(Number(event.blockNumber)),
          logIndex: Number(event.logIndex),
          eventData: event.returnValues || {},
          rawData: event,
          processed: false
        }
      });

      // Process specific event types
      await this.handleSpecificEvent(storedEvent, event);

      // Mark as processed
      await prisma.blockchainEvent.update({
        where: { id: storedEvent.id },
        data: { 
          processed: true,
          processedAt: new Date()
        }
      });

      console.log(`Processed ${eventType} event: ${event.transactionHash}:${event.logIndex}`);
    } catch (error) {
      console.error(`Failed to process event ${event?.transactionHash}:${event?.logIndex}:`, error);
      
      // Store error for debugging
      try {
        await prisma.blockchainEvent.upsert({
          where: {
            transactionHash_logIndex: {
              transactionHash: event.transactionHash,
              logIndex: event.logIndex
            }
          },
          create: {
            eventType: 'ERROR',
            contractAddress: event.address || '',
            transactionHash: event.transactionHash,
            blockNumber: BigInt(Number(event.blockNumber) || 0),
            logIndex: Number(event.logIndex),
            eventData: {},
            rawData: event,
            processed: false,
            processingError: error instanceof Error ? error.message : 'Unknown error'
          },
          update: {
            processingError: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      } catch (dbError) {
        console.error('Failed to store event processing error:', dbError);
      }
    }
  }

  private getEventType(event: any): string | null {
    if (!event.topics || event.topics.length === 0) {
      return null;
    }

    const signature = event.topics[0];
    
    // Match against known event signatures
    for (const [eventName, eventSig] of Object.entries(EVENT_SIGNATURES)) {
      if (signature === eventSig) {
        return eventName;
      }
    }

    return null;
  }

  private async handleSpecificEvent(storedEvent: any, rawEvent: any): Promise<void> {
    switch (storedEvent.eventType) {
      case 'POSPurchase':
        await this.handlePOSPurchaseEvent(storedEvent, rawEvent);
        break;
      case 'TransferWithNote':
        await this.handleTransferWithNoteEvent(storedEvent, rawEvent);
        break;
      case 'CreditIssued':
        await this.handleCreditIssuedEvent(storedEvent, rawEvent);
        break;
      default:
        // Generic event handling
        break;
    }
  }

  private async handlePOSPurchaseEvent(storedEvent: any, rawEvent: any): Promise<void> {
    try {
      const { user, amount, retailerId } = rawEvent.returnValues || {};
      
      if (!retailerId) {
        console.warn('POSPurchase event missing retailerId');
        return;
      }

      // Find the retailer
      const retailer = await prisma.retailer.findFirst({
        where: { id: retailerId }
      });

      if (!retailer) {
        console.warn(`Unknown retailer ID in POSPurchase event: ${retailerId}`);
        return;
      }

      // Update related payment if exists
      const payment = await prisma.payment.findFirst({
        where: {
          retailerId: retailer.id,
          transactionHash: rawEvent.transactionHash,
          status: { in: ['PENDING', 'PROCESSING'] }
        }
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'CONFIRMED',
            blockNumber: BigInt(rawEvent.blockNumber.toString()),
            updatedAt: new Date()
          }
        });

        console.log(`Updated payment ${payment.id} status to CONFIRMED`);
      }

      // Create or update settlement record
      await this.createOrUpdateSettlement(retailer.id, 'BURN_FOR_POS', amount, rawEvent);
      
    } catch (error) {
      console.error('Failed to handle POSPurchase event:', error);
      throw error;
    }
  }

  private async handleTransferWithNoteEvent(storedEvent: any, rawEvent: any): Promise<void> {
    try {
      const { from, to, amount, note } = rawEvent.returnValues || {};
      
      // Log transfer for audit purposes
      console.log(`Transfer event: ${from} -> ${to}, amount: ${amount}, note: ${note}`);
      
      // Additional processing could be added here for transfer tracking
    } catch (error) {
      console.error('Failed to handle TransferWithNote event:', error);
      throw error;
    }
  }

  private async handleCreditIssuedEvent(storedEvent: any, rawEvent: any): Promise<void> {
    try {
      const { to, amount, reason } = rawEvent.returnValues || {};
      
      // Log credit issuance
      console.log(`Credit issued: ${to}, amount: ${amount}, reason: ${reason}`);
      
      // Additional processing could be added here for credit tracking
    } catch (error) {
      console.error('Failed to handle CreditIssued event:', error);
      throw error;
    }
  }

  private async createOrUpdateSettlement(
    retailerId: string,
    settlementType: 'BURN_FOR_POS' | 'APPROVE_AND_BURN',
    amount: string,
    rawEvent: any
  ): Promise<void> {
    try {
      await prisma.settlement.create({
        data: {
          retailerId,
          settlementType,
          totalAmount: amount,
          status: 'CONFIRMED',
          transactionHash: rawEvent.transactionHash,
          blockNumber: BigInt(rawEvent.blockNumber.toString()),
          burnAmount: amount,
          eventSignature: rawEvent.topics?.[0] || '',
          eventData: rawEvent.returnValues || {},
          confirmedAt: new Date()
        }
      });

      console.log(`Created settlement record for retailer ${retailerId}`);
    } catch (error) {
      console.error('Failed to create settlement record:', error);
      throw error;
    }
  }

  private async handleMonitoringError(): Promise<void> {
    this.retryCount++;
    
    if (this.retryCount >= WEB3_CONFIG.EVENTS.maxRetries) {
      console.error(`Event monitoring failed after ${WEB3_CONFIG.EVENTS.maxRetries} retries. Stopping monitoring.`);
      this.stopMonitoring();
      return;
    }

    const delay = Math.pow(2, this.retryCount) * 1000; // Exponential backoff
    console.log(`Event monitoring error, retrying in ${delay}ms (attempt ${this.retryCount}/${WEB3_CONFIG.EVENTS.maxRetries})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Get monitoring status
  getStatus(): { isMonitoring: boolean; lastProcessedBlock: string; retryCount: number } {
    return {
      isMonitoring: this.isMonitoring,
      lastProcessedBlock: this.lastProcessedBlock.toString(),
      retryCount: this.retryCount
    };
  }
}

// Singleton instance
let eventMonitor: EventMonitor | null = null;

export function getEventMonitor(): EventMonitor {
  if (!eventMonitor) {
    eventMonitor = new EventMonitor();
  }
  return eventMonitor;
}

// Helper function to manually process specific transaction
export async function processTransactionEvents(txHash: string): Promise<ProcessedEvent[]> {
  const web3Client = getWeb3Client();
  const results: ProcessedEvent[] = [];

  try {
    const receipt = await web3Client.getTransactionReceipt(txHash);
    if (!receipt?.logs) {
      return results;
    }

    for (const log of receipt.logs) {
      // Process each log entry
      const eventType = getEventTypeFromLog(log);
      if (!eventType) continue;

      const processedEvent: ProcessedEvent = {
        id: `${txHash}-${log.logIndex}`,
        eventType,
        transactionHash: txHash,
        blockNumber: BigInt(Number(receipt.blockNumber)),
        logIndex: Number(log.logIndex) || 0,
        eventData: log.data || {},
        rawData: log,
        processed: true
      };

      results.push(processedEvent);
    }

    return results;
  } catch (error) {
    console.error(`Failed to process transaction events for ${txHash}:`, error);
    throw error;
  }
}

function getEventTypeFromLog(log: any): string | null {
  if (!log.topics || log.topics.length === 0) {
    return null;
  }

  const signature = log.topics[0];
  
  for (const [eventName, eventSig] of Object.entries(EVENT_SIGNATURES)) {
    if (signature === eventSig) {
      return eventName;
    }
  }

  return null;
}
