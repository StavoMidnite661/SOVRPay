
// SOVRCreditBridgePOS Smart Contract ABI
// Complete ABI for production interactions

export const SOVR_CONTRACT_ABI = [
  // Token Information
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },

  // Core Settlement Functions
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "string", "name": "retailerId", "type": "string"}
    ],
    "name": "burnForPOS",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "string", "name": "retailerId", "type": "string"}
    ],
    "name": "approveAndBurn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Standard ERC20 Functions
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },

  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": true, "internalType": "string", "name": "retailerId", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "POSPurchase",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "note", "type": "string"}
    ],
    "name": "TransferWithNote",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "reason", "type": "string"}
    ],
    "name": "CreditIssued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "spender", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
    ],
    "name": "Approval",
    "type": "event"
  }
] as const;

// Event signatures for efficient filtering
export const EVENT_SIGNATURES = {
  POSPurchase: '0x' + require('crypto').createHash('sha256').update('POSPurchase(address,uint256,string,uint256)').digest('hex').slice(0, 8),
  TransferWithNote: '0x' + require('crypto').createHash('sha256').update('TransferWithNote(address,address,uint256,string)').digest('hex').slice(0, 8),
  CreditIssued: '0x' + require('crypto').createHash('sha256').update('CreditIssued(address,uint256,string)').digest('hex').slice(0, 8),
  Transfer: '0x' + require('crypto').createHash('sha256').update('Transfer(address,address,uint256)').digest('hex').slice(0, 8),
  Approval: '0x' + require('crypto').createHash('sha256').update('Approval(address,address,uint256)').digest('hex').slice(0, 8)
} as const;

// Function selectors
export const FUNCTION_SELECTORS = {
  burnForPOS: '0x' + require('crypto').createHash('sha256').update('burnForPOS(address,uint256,string)').digest('hex').slice(0, 8),
  approveAndBurn: '0x' + require('crypto').createHash('sha256').update('approveAndBurn(uint256,string)').digest('hex').slice(0, 8),
  transfer: '0x' + require('crypto').createHash('sha256').update('transfer(address,uint256)').digest('hex').slice(0, 8),
  approve: '0x' + require('crypto').createHash('sha256').update('approve(address,uint256)').digest('hex').slice(0, 8)
} as const;
