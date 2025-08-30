
// Web3 Configuration for SOVR Pay Checkout System
// Production-ready Polygon mainnet integration

export const WEB3_CONFIG = {
  // Polygon Mainnet Configuration
  POLYGON_MAINNET: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrls: [
      'https://polygon-rpc.com',
      'https://rpc-mainnet.matic.network',
      'https://rpc-mainnet.maticvigil.com',
      'https://rpc.ankr.com/polygon'
    ],
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'POL',
      symbol: 'POL',
      decimals: 18
    }
  },

  // Smart Contract Configuration
  SOVR_CONTRACT: {
    address: process.env.SOVR_CONTRACT_ADDRESS || '',
    deploymentBlock: 0, // Set to actual deployment block for event filtering
  },

  // Connection Settings
  CONNECTION: {
    timeout: 15000,
    retryAttempts: 3,
    retryDelay: 1000,
    gasLimitMultiplier: 1.2, // 20% buffer on gas estimates
  },

  // Event Monitoring
  EVENTS: {
    pollingInterval: 5000, // 5 seconds
    blockRange: 100, // Blocks to scan per batch
    maxRetries: 5,
  },

  // Security Settings
  SECURITY: {
    maxGasLimit: 500000, // Maximum gas limit for transactions
    minConfirmations: 12, // Minimum block confirmations for finality
  }
} as const;

// Validate environment variables
export function validateWeb3Config(): string[] {
  const errors: string[] = [];

  if (!process.env.SOVR_CONTRACT_ADDRESS) {
    errors.push('SOVR_CONTRACT_ADDRESS environment variable is required');
  }

  if (!process.env.POLYGON_PRIVATE_KEY) {
    errors.push('POLYGON_PRIVATE_KEY environment variable is required');
  }

  if (!process.env.POLYGON_RPC_URL && !WEB3_CONFIG.POLYGON_MAINNET.rpcUrls[0]) {
    errors.push('POLYGON_RPC_URL environment variable or default RPC URL is required');
  }

  return errors;
}
