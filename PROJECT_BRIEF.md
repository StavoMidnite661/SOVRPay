
# Project Brief: SOVR Pay Network Suite

## 1. High-Level Overview

**What is this application?**
The SOVR Pay Network Suite is a comprehensive financial technology platform designed to bridge the gap between traditional finance and the decentralized, digital economy. It functions as a complete ecosystem for tokenizing real-world assets (RWAs), processing complex payments, and managing digital financial operations.

**What does it do?**
The platform allows users and businesses to:
*   **Tokenize Real-World Assets:** Convert physical or traditional assets (like real estate, art, commodities, and bonds) into tradable digital tokens on a blockchain.
*   **Process Mixed-Asset Payments:** Enable seamless real-world shopping experiences where users can pay with a combination of RWA tokens, SOVR credits (the native platform currency), and traditional fiat currency.
*   **Integrate with Existing Systems:** Provide developers with robust REST APIs, SDKs, and Webhooks to connect e-commerce platforms, financial applications, and business tools to the SOVR Pay network.
*   **Universal Payments:** Offer a browser extension that injects payment options onto any website's checkout form, allowing users to spend their digital assets anywhere, even without direct merchant integration.
*   **Manage Compliance:** Handle complex banking and regulatory requirements, including KYC/AML checks and ISO 20022 messaging for cross-border payments.
*   **Monitor the Ecosystem:** Provide a real-time command center to monitor system health, transaction volume, market prices, and other key metrics across the entire platform.

**What is its purpose?**
The core purpose of the SOVR Pay Network Suite is to unlock the liquidity of real-world assets by bringing them onto the blockchain. It aims to create a future where any asset can be fractionalized, traded, and used for everyday payments as easily as fiat currency, all while maintaining institutional-grade security and compliance.

---

## 2. To-Do List for Next Agent

The front-end of the application is largely complete but is currently operating with a temporary in-memory storage system, which prevents any data from being saved. The immediate priority is to build and connect the persistent database backend.

**Objective:** Implement the full database storage layer to make the application functional.

**Key Steps:**
1.  **Understand the Database Schema:**
    *   The database schema is defined in `shared/schema.ts` using `zod`. This file is the single source of truth for all data models.
    *   The Drizzle ORM configuration is in `drizzle.config.ts`, which confirms the use of PostgreSQL and points to the schema file.

2.  **Implement the Storage Layer (`server/storage.ts`):**
    *   The current file `server/storage.ts` contains a placeholder `MemStorage` class. This entire file needs to be rewritten.
    *   **Task:** Create a new `Storage` class that connects to the PostgreSQL database using `drizzle-orm`.
    *   **Task:** Implement all necessary storage methods that are called from `server/routes.ts`. This involves writing Drizzle ORM queries for each function. Below is a non-exhaustive list of critical methods to implement:
        *   `getSystemMetrics()`
        *   `logApiRequest()`
        *   `createTokenizedAsset(data: InsertTokenizedAsset)`
        *   `getTokenizedAsset(id: string)`
        *   `listTokenizedAssets(options)`
        *   `updateTokenizedAsset(id: string, updates)`
        *   `deleteTokenizedAsset(id: string)`
        *   `createAssetValuation(data: InsertAssetValuation)`
        *   `getAssetValuationsByAsset(assetId: string, options)`
        *   `createMarketPrice(data: InsertMarketPrice)`
        *   `listMarketPrices(options)`
        *   `getMarketPriceHistory(assetId: string, options)`
        *   `createPropertyInsight(data: InsertPropertyInsight)`
        *   `getPropertyInsightsByAsset(assetId: string, options)`
        *   And many others related to payments, contracts, receipts, etc. Refer to `server/routes.ts` for a complete list of calls to `storage`.

3.  **Database Migration:**
    *   After implementing the storage layer and correctly configuring the connection (`DATABASE_URL` environment variable), run `drizzle-kit generate` to create the initial SQL migration file.
    *   Run `drizzle-kit migrate` to apply the schema to the database.

4.  **Testing:**
    *   Once the storage layer is implemented, thoroughly test all API endpoints to ensure they correctly interact with the database.
    *   Pay special attention to the RWA Tokenization page, as it is the most complex feature. Verify that creating, listing, and viewing asset details all work as expected.
    *   Confirm that the dashboard and monitoring pages populate with real data from the database.

---

## 3. Data Sheet: TigerBeetle Ledger Integration

Based on the project architecture documents, TigerBeetle serves as the primary ledger for all financial transactions, providing speed and integrity before transactions are potentially settled on a blockchain.

**Purpose & Role:**
TigerBeetle is a high-performance, distributed financial accounting database. In this system, it acts as a real-time, fault-tolerant ledger. Its role is to:
*   **Guarantee Speed:** Process a high volume of transactions with extremely low latency, which is critical for real-world payment scenarios.
*   **Ensure Correctness:** Prevent overdrafts and double-spends at the ledger level before more expensive or slower operations (like blockchain settlement) occur.
*   **Provide an Audit Trail:** Act as the primary, immutable source of truth for all account balances and transfers within the SOVR Pay ecosystem.

**Architecture & Data Flow:**
The payment processing flow explicitly places TigerBeetle at its core:

`Client/Mobile App → Payment API (FastAPI) → Validation → **TigerBeetle** → Blockchain → Confirmation`

1.  A payment is initiated by a client.
2.  The Payment API validates the request.
3.  The `Payment Service` communicates with the `Transaction Processor` in the `tigerbeetle/` directory.
4.  The `Transaction Processor` creates and commits a two-phase transfer on the TigerBeetle ledger, moving funds between the corresponding accounts (e.g., from a user's account to a merchant's account).
5.  Only after the TigerBeetle transfer is successful does the system proceed with subsequent steps, such as blockchain settlement or notifying the user.

**Key System Components:**
The integration is managed through a dedicated Python module:
*   `tigerbeetle/`
    *   `ledger_client.py`: Establishes and manages the connection to the TigerBeetle cluster.
    *   `account_manager.py`: Handles the creation and management of accounts within TigerBeetle (e.g., creating new accounts for users, merchants).
    *   `transaction_processor.py`: Implements the logic for posting transfers between accounts, likely using TigerBeetle's two-phase transfer system for safety.

**Configuration:**
The following environment variables are required to connect to the TigerBeetle cluster:

```
# TigerBeetle
TIGERBEETLE_CLUSTER_ID=0
TIGERBEETLE_REPLICA_ADDRESSES=127.0.0.1:3000
```

**Key Operations to Implement:**
*   **Account Creation:** The `account_manager.py` must be able to create new accounts on the ledger. Each user and merchant on the SOVR Pay platform will need a corresponding account in TigerBeetle to hold their balances.
*   **Transaction Processing:** The `transaction_processor.py` must handle:
    *   **`create_transfer`:** A function that takes a debit account, a credit account, and an amount. It should execute a two-phase transfer to ensure atomicity.
    *   **`lookup_accounts`:** A function to query the balance and state of one or more accounts.
    *   **`get_account_history`:** A function to retrieve all transfers related to a specific account for audit and user-facing history.
