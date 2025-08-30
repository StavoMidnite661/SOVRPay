
// Web3 Integration Layer - Main Export
// Centralized exports for SOVR Pay blockchain integration

export { Web3Client, getWeb3Client } from './client';
export { EventMonitor, getEventMonitor, processTransactionEvents } from './events';
export { WEB3_CONFIG, validateWeb3Config } from './config';
export { SOVR_CONTRACT_ABI, EVENT_SIGNATURES, FUNCTION_SELECTORS } from './abi';

// Type definitions
export interface SettlementRequest {
  userAddress: string;
  amount: string;
  retailerId: string;
  settlementType: 'BURN_FOR_POS' | 'APPROVE_AND_BURN';
  gasPrice?: string;
}

export interface SettlementResult {
  txHash: string;
  gasUsed: bigint;
  blockNumber?: bigint;
  confirmed?: boolean;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  contractAddress: string;
}

export interface BlockchainStatus {
  connected: boolean;
  chainId: number;
  currentBlock: bigint;
  gasPrice: string;
}

// Utility functions
export function formatAmount(amount: string, decimals: number = 18): string {
  try {
    const web3Client = getWeb3Client();
    return web3Client.fromWei(amount);
  } catch {
    return '0';
  }
}

export function parseAmount(amount: string, decimals: number = 18): string {
  try {
    const web3Client = getWeb3Client();
    return web3Client.toWei(amount);
  } catch {
    return '0';
  }
}

export function isValidPolygonAddress(address: string): boolean {
  try {
    const web3Client = getWeb3Client();
    return web3Client.isValidAddress(address);
  } catch {
    return false;
  }
}

// Service initialization
export async function initializeWeb3Services(): Promise<boolean> {
  try {
    const web3Client = getWeb3Client();
    const connected = await web3Client.connect();
    
    if (!connected) {
      console.error('Failed to connect to Polygon network');
      return false;
    }

    // Start event monitoring
    const eventMonitor = getEventMonitor();
    await eventMonitor.startMonitoring();
    
    console.log('Web3 services initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Web3 services:', error);
    return false;
  }
}

export function shutdownWeb3Services(): void {
  try {
    const eventMonitor = getEventMonitor();
    eventMonitor.stopMonitoring();
    
    const web3Client = getWeb3Client();
    web3Client.disconnect();
    
    console.log('Web3 services shutdown successfully');
  } catch (error) {
    console.error('Error during Web3 services shutdown:', error);
  }
}
