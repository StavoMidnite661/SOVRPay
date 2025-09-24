/**
 * Centralized API Client Service
 * 
 * Provides a unified interface for all external API calls with:
 * - Rate limiting
 * - Request/response caching
 * - Comprehensive error handling
 * - Request retries with exponential backoff
 * - Request deduplication
 * - Circuit breaker pattern
 * - Monitoring and metrics
 */

interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
  cache?: {
    enabled: boolean;
    defaultTtl: number; // seconds
  };
  circuitBreaker?: {
    failureThreshold: number;
    resetTimeout: number;
  };
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  cache?: {
    enabled?: boolean;
    ttl?: number; // seconds
    key?: string; // custom cache key
  };
  retries?: number;
  skipRateLimit?: boolean;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

export class ApiClient {
  private config: Required<ApiClientConfig>;
  private cache = new Map<string, CacheEntry>();
  private rateLimitMap = new Map<string, RateLimitEntry>();
  private pendingRequests = new Map<string, Promise<any>>();
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private requestCount = 0;
  private successCount = 0;
  private errorCount = 0;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || '',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      rateLimit: config.rateLimit || { requests: 100, windowMs: 60000 },
      cache: config.cache || { enabled: true, defaultTtl: 300 },
      circuitBreaker: config.circuitBreaker || { failureThreshold: 5, resetTimeout: 60000 },
    };

    // Clean up expired cache entries periodically
    setInterval(() => this.cleanupCache(), 60000);
  }

  /**
   * Make an HTTP request with all the built-in features
   */
  async request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    const fullUrl = this.buildUrl(url);
    const requestKey = this.generateRequestKey(fullUrl, options);

    // Check circuit breaker
    if (this.isCircuitOpen(fullUrl)) {
      throw new Error(`Circuit breaker is open for ${fullUrl}`);
    }

    // Check for existing pending request (request deduplication)
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    // Check cache first
    if (options.method === 'GET' || !options.method) {
      const cached = this.getFromCache(requestKey, options.cache);
      if (cached !== null) {
        return cached;
      }
    }

    // Check rate limit
    if (!options.skipRateLimit && !this.checkRateLimit(fullUrl)) {
      throw new Error(`Rate limit exceeded for ${fullUrl}`);
    }

    // Create the request promise
    const requestPromise = this.executeRequest<T>(fullUrl, options, requestKey);
    
    // Store pending request for deduplication
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      this.recordSuccess(fullUrl);
      
      // Cache successful GET requests
      if ((options.method === 'GET' || !options.method) && options.cache?.enabled !== false) {
        this.setCache(requestKey, result, options.cache);
      }

      return result;
    } catch (error) {
      this.recordFailure(fullUrl);
      throw error;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(requestKey);
    }
  }

  /**
   * Convenience method for GET requests
   */
  async get<T = any>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * Convenience method for POST requests
   */
  async post<T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  /**
   * Convenience method for PUT requests
   */
  async put<T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  /**
   * Convenience method for DELETE requests
   */
  async delete<T = any>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * Convenience method for PATCH requests
   */
  async patch<T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PATCH', body });
  }

  /**
   * Get API client statistics
   */
  getStats() {
    return {
      totalRequests: this.requestCount,
      successfulRequests: this.successCount,
      failedRequests: this.errorCount,
      successRate: this.requestCount > 0 ? (this.successCount / this.requestCount) * 100 : 0,
      cacheSize: this.cache.size,
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([url, state]) => ({
        url,
        state: state.state,
        failures: state.failures,
      })),
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reset circuit breakers
   */
  resetCircuitBreakers(): void {
    this.circuitBreakers.clear();
  }

  private async executeRequest<T>(url: string, options: RequestOptions, requestKey: string): Promise<T> {
    const maxRetries = options.retries ?? this.config.retries;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        this.requestCount++;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);

        const fetchOptions: RequestInit = {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          signal: controller.signal,
        };

        if (options.body && options.method !== 'GET') {
          fetchOptions.body = typeof options.body === 'string' 
            ? options.body 
            : JSON.stringify(options.body);
        }

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        let data: any;

        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error(`Request timeout for ${url}`);
          }
          if (error.message.includes('HTTP 4')) {
            // Don't retry client errors (4xx)
            throw error;
          }
        }

        // Wait before retrying
        if (attempt < maxRetries) {
          await this.sleep(this.config.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError!;
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${this.config.baseURL}${path}`;
  }

  private generateRequestKey(url: string, options: RequestOptions): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  private getFromCache(key: string, cacheOptions?: RequestOptions['cache']): any | null {
    if (cacheOptions?.enabled === false || !this.config.cache.enabled) {
      return null;
    }

    const cacheKey = cacheOptions?.key || key;
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now > entry.timestamp + (entry.ttl * 1000)) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: any, cacheOptions?: RequestOptions['cache']): void {
    if (cacheOptions?.enabled === false || !this.config.cache.enabled) {
      return;
    }

    const cacheKey = cacheOptions?.key || key;
    const ttl = cacheOptions?.ttl || this.config.cache.defaultTtl;

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private checkRateLimit(url: string): boolean {
    const now = Date.now();
    const windowMs = this.config.rateLimit.windowMs;
    const maxRequests = this.config.rateLimit.requests;

    const entry = this.rateLimitMap.get(url);
    
    if (!entry || now > entry.resetTime) {
      this.rateLimitMap.set(url, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  private isCircuitOpen(url: string): boolean {
    const breaker = this.circuitBreakers.get(url);
    
    if (!breaker) {
      return false;
    }

    const now = Date.now();
    
    if (breaker.state === 'open') {
      if (now > breaker.lastFailure + this.config.circuitBreaker.resetTimeout) {
        breaker.state = 'half-open';
        return false;
      }
      return true;
    }

    return false;
  }

  private recordSuccess(url: string): void {
    this.successCount++;
    
    const breaker = this.circuitBreakers.get(url);
    if (breaker && breaker.state === 'half-open') {
      breaker.state = 'closed';
      breaker.failures = 0;
    }
  }

  private recordFailure(url: string): void {
    this.errorCount++;
    
    const breaker = this.circuitBreakers.get(url) || {
      failures: 0,
      lastFailure: 0,
      state: 'closed' as const,
    };

    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.failures >= this.config.circuitBreaker.failureThreshold) {
      breaker.state = 'open';
    }

    this.circuitBreakers.set(url, breaker);
  }

  private cleanupCache(): void {
    const now = Date.now();
    
    const entriesToDelete: string[] = [];
    this.cache.forEach((entry, key) => {
      if (now > entry.timestamp + (entry.ttl * 1000)) {
        entriesToDelete.push(key);
      }
    });
    
    entriesToDelete.forEach(key => this.cache.delete(key));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Default instance for general use
export const apiClient = new ApiClient();

// Specialized instances for different services
export const assetApiClient = new ApiClient({
  baseURL: process.env.ASSET_API_BASE_URL || '',
  timeout: 15000,
  rateLimit: { requests: 50, windowMs: 60000 },
  cache: { enabled: true, defaultTtl: 600 }, // 10 minutes cache for asset data
});

// Alpha Vantage API Client for market data
export const alphaVantageClient = new ApiClient({
  baseURL: 'https://www.alphavantage.co',
  timeout: 15000,
  rateLimit: { requests: 5, windowMs: 60000 }, // Alpha Vantage free tier limit
  cache: { enabled: true, defaultTtl: 300 }, // 5 minutes cache for market data
});

// Real Estate API Client for property valuations  
export const realEstateApiClient = new ApiClient({
  baseURL: process.env.REAL_ESTATE_API_BASE_URL || 'https://api.rentspree.com',
  timeout: 20000,
  rateLimit: { requests: 60, windowMs: 60000 },
  cache: { enabled: true, defaultTtl: 1800 }, // 30 minutes cache for property data
});

// Commodity Pricing API Client
export const commodityApiClient = new ApiClient({
  baseURL: process.env.COMMODITY_API_BASE_URL || 'https://api.metals.live',
  timeout: 10000,
  rateLimit: { requests: 100, windowMs: 60000 },
  cache: { enabled: true, defaultTtl: 180 }, // 3 minutes cache for commodity prices
});

export const marketDataClient = new ApiClient({
  baseURL: process.env.MARKET_DATA_API_BASE_URL || '',
  timeout: 10000,
  rateLimit: { requests: 200, windowMs: 60000 },
  cache: { enabled: true, defaultTtl: 60 }, // 1 minute cache for market data
});

export const valuationApiClient = new ApiClient({
  baseURL: process.env.VALUATION_API_BASE_URL || '',
  timeout: 30000,
  rateLimit: { requests: 20, windowMs: 60000 },
  cache: { enabled: true, defaultTtl: 3600 }, // 1 hour cache for valuations
});

export const complianceApiClient = new ApiClient({
  baseURL: process.env.COMPLIANCE_API_BASE_URL || '',
  timeout: 20000,
  rateLimit: { requests: 30, windowMs: 60000 },
  cache: { enabled: false, defaultTtl: 0 }, // No caching for compliance data
});

// Export types for external use
export type { ApiClientConfig, RequestOptions };