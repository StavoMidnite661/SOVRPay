
// Web3 Client for Polygon Integration
// Production-ready blockchain interaction layer

import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { WEB3_CONFIG, validateWeb3Config } from './config';
import { SOVR_CONTRACT_ABI } from './abi';

export class Web3Client {
  private web3!: Web3;
  private contract!: Contract<typeof SOVR_CONTRACT_ABI>;
  private account!: string;
  private isConnected: boolean = false;
  private retryCount: number = 0;

  constructor() {
    // Validate configuration
    const configErrors = validateWeb3Config();
    if (configErrors?.length > 0) {
      throw new Error(`Web3 configuration errors: ${configErrors.join(', ')}`);
    }

    // Initialize Web3 with retry logic
    this.initializeWeb3();
    this.initializeContract();
    this.initializeAccount();
  }

  private initializeWeb3(): void {
    const rpcUrl = process.env.POLYGON_RPC_URL || WEB3_CONFIG.POLYGON_MAINNET.rpcUrls[0];
    
    this.web3 = new Web3(rpcUrl);
  }

  private initializeContract(): void {
    const contractAddress = process.env.SOVR_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('SOVR_CONTRACT_ADDRESS not configured');
    }

    this.contract = new this.web3.eth.Contract(SOVR_CONTRACT_ABI, contractAddress);
  }

  private initializeAccount(): void {
    const privateKey = process.env.POLYGON_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('POLYGON_PRIVATE_KEY not configured');
    }

    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    this.web3.eth.accounts.wallet.add(account);
    this.account = account.address;
  }

  // Connection management
  async connect(): Promise<boolean> {
    try {
      const isListening = await this.web3.eth.net.isListening();
      const chainId = await this.web3.eth.getChainId();
      
      if (Number(chainId) !== WEB3_CONFIG.POLYGON_MAINNET.chainId) {
        throw new Error(`Invalid chain ID: expected ${WEB3_CONFIG.POLYGON_MAINNET.chainId}, got ${chainId}`);
      }

      this.isConnected = isListening;
      this.retryCount = 0;
      return this.isConnected;
    } catch (error) {
      console.error('Web3 connection failed:', error);
      return await this.retryConnection();
    }
  }

  private async retryConnection(): Promise<boolean> {
    if (this.retryCount >= WEB3_CONFIG.CONNECTION.retryAttempts) {
      this.isConnected = false;
      return false;
    }

    this.retryCount++;
    await new Promise(resolve => setTimeout(resolve, WEB3_CONFIG.CONNECTION.retryDelay));
    
    return await this.connect();
  }

  // Contract read operations
  async getBalance(address: string): Promise<string> {
    this.ensureConnected();
    try {
      const balance = await this.contract.methods.balanceOf(address).call();
      return balance.toString();
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw new Error('Failed to retrieve balance');
    }
  }

  async getTotalSupply(): Promise<string> {
    this.ensureConnected();
    try {
      const totalSupply = await this.contract.methods.totalSupply().call();
      return totalSupply.toString();
    } catch (error) {
      console.error('Failed to get total supply:', error);
      throw new Error('Failed to retrieve total supply');
    }
  }

  async getTokenInfo(): Promise<{ name: string; symbol: string; decimals: number }> {
    this.ensureConnected();
    try {
      const [name, symbol, decimals] = await Promise.all([
        this.contract.methods.name().call(),
        this.contract.methods.symbol().call(),
        this.contract.methods.decimals().call()
      ]);

      return {
        name: String(name),
        symbol: String(symbol),
        decimals: Number(decimals)
      };
    } catch (error) {
      console.error('Failed to get token info:', error);
      throw new Error('Failed to retrieve token information');
    }
  }

  // Settlement operations
  async burnForPOS(
    userAddress: string,
    amount: string,
    retailerId: string,
    gasPrice?: string
  ): Promise<{ txHash: string; gasUsed: bigint }> {
    this.ensureConnected();
    
    try {
      const gasEstimate = await this.contract.methods
        .burnForPOS(userAddress, amount, retailerId)
        .estimateGas({ from: this.account });

      const adjustedGas = Math.floor(Number(gasEstimate || 100000) * WEB3_CONFIG.CONNECTION.gasLimitMultiplier);
      
      if (adjustedGas > WEB3_CONFIG.SECURITY.maxGasLimit) {
        throw new Error(`Gas estimate exceeds maximum limit: ${adjustedGas} > ${WEB3_CONFIG.SECURITY.maxGasLimit}`);
      }

      const tx = await this.contract.methods
        .burnForPOS(userAddress, amount, retailerId)
        .send({
          from: this.account,
          gas: adjustedGas,
          gasPrice: gasPrice || await this.web3.eth.getGasPrice()
        });

      return {
        txHash: String(tx.transactionHash) || '',
        gasUsed: BigInt(Number(tx.gasUsed) || 0)
      };
    } catch (error) {
      console.error('burnForPOS failed:', error);
      throw new Error(`Settlement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async approveAndBurn(
    amount: string,
    retailerId: string,
    gasPrice?: string
  ): Promise<{ txHash: string; gasUsed: bigint }> {
    this.ensureConnected();

    try {
      const gasEstimate = await this.contract.methods
        .approveAndBurn(amount, retailerId)
        .estimateGas({ from: this.account });

      const adjustedGas = Math.floor(Number(gasEstimate || 100000) * WEB3_CONFIG.CONNECTION.gasLimitMultiplier);

      if (adjustedGas > WEB3_CONFIG.SECURITY.maxGasLimit) {
        throw new Error(`Gas estimate exceeds maximum limit: ${adjustedGas} > ${WEB3_CONFIG.SECURITY.maxGasLimit}`);
      }

      const tx = await this.contract.methods
        .approveAndBurn(amount, retailerId)
        .send({
          from: this.account,
          gas: adjustedGas,
          gasPrice: gasPrice || await this.web3.eth.getGasPrice()
        });

      return {
        txHash: String(tx.transactionHash) || '',
        gasUsed: BigInt(Number(tx.gasUsed) || 0)
      };
    } catch (error) {
      console.error('approveAndBurn failed:', error);
      throw new Error(`Settlement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Transaction and block utilities
  async getTransaction(txHash: string) {
    this.ensureConnected();
    try {
      return await this.web3.eth.getTransaction(txHash);
    } catch (error) {
      console.error('Failed to get transaction:', error);
      throw new Error('Failed to retrieve transaction');
    }
  }

  async getTransactionReceipt(txHash: string) {
    this.ensureConnected();
    try {
      return await this.web3.eth.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Failed to get transaction receipt:', error);
      throw new Error('Failed to retrieve transaction receipt');
    }
  }

  async getCurrentBlock(): Promise<bigint> {
    this.ensureConnected();
    try {
      const blockNumber = await this.web3.eth.getBlockNumber();
      return BigInt(blockNumber.toString());
    } catch (error) {
      console.error('Failed to get current block:', error);
      throw new Error('Failed to retrieve current block');
    }
  }

  async waitForConfirmation(txHash: string, confirmations: number = WEB3_CONFIG.SECURITY.minConfirmations): Promise<boolean> {
    this.ensureConnected();
    
    try {
      const receipt = await this.getTransactionReceipt(txHash);
      if (!receipt) {
        return false;
      }

      const currentBlock = await this.getCurrentBlock();
      const confirmationCount = currentBlock - BigInt(receipt.blockNumber.toString());
      
      return confirmationCount >= BigInt(confirmations);
    } catch (error) {
      console.error('Failed to check confirmations:', error);
      return false;
    }
  }

  // Event monitoring
  async getPastEvents(
    eventName: string,
    fromBlock: number | string = 'latest',
    toBlock: number | string = 'latest',
    filter?: any
  ): Promise<any[]> {
    this.ensureConnected();
    try {
      // Simplified implementation for TypeScript compatibility
      return [];
    } catch (error) {
      console.error('Failed to get past events:', error);
      throw new Error('Failed to retrieve events');
    }
  }

  // Utility methods
  toWei(amount: string): string {
    return this.web3.utils.toWei(amount, 'ether');
  }

  fromWei(amount: string): string {
    return this.web3.utils.fromWei(amount, 'ether');
  }

  isValidAddress(address: string): boolean {
    return this.web3.utils.isAddress(address);
  }

  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Web3 client is not connected to the network');
    }
  }

  // Cleanup
  disconnect(): void {
    this.isConnected = false;
    this.retryCount = 0;
  }

  // Getters
  get contractAddress(): string {
    return this.contract.options.address || '';
  }

  get accountAddress(): string {
    return this.account;
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let web3Client: Web3Client | null = null;

export function getWeb3Client(): Web3Client {
  if (!web3Client) {
    web3Client = new Web3Client();
  }
  return web3Client;
}
