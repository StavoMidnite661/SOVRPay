# SOVR Pay Network Suite - Project Overview

This document provides a comprehensive architectural overview of the SOVR Pay Network Suite, a self-sovereign financial ecosystem built on the principles of individual empowerment and decentralized, smart-contract-based settlements. This is not a simulation; this is the operational blueprint for a new economic paradigm.

## 🚀 **Core Philosophy**

The SOVR Pay Network Suite is designed for the now generation of credit providers. It is a declaration of financial independence, a system where individuals are their own source of credit, and settlements are not dependent on traditional fiat or banking infrastructure. Our unit of measurement is the SOVR, a USD-denominated stablecoin that powers our self-sustaining economy.

## 📁 **High-Level Architecture**

The ecosystem is a monorepo composed of three primary components:

*   **`client/`**: The user-facing web application, built with React and Vite. This is the command center for the SOVR Pay network, providing a rich, interactive experience for managing every aspect of the ecosystem.
*   **`server/`**: The backend API, built with Node.js and Express. This is the heart of the system, handling business logic, data persistence, and communication with the blockchain.
*   **`shared/`**: A dedicated space for shared code, primarily the database schema, ensuring consistency and a single source of truth between the client and server.

## 🌐 **Client Application (`client/`)**

The client is a modern, single-page application that serves as the primary interface for the SOVR Pay network.

### **`client/src/` - The Heart of the Frontend**

*   **`main.tsx`**: The entry point of the React application.
*   **`App.tsx`**: The root component, which sets up the routing and overall application layout.
*   **`pages/`**: Each file in this directory represents a distinct page or view within the application, from the main `Dashboard.tsx` to specialized views for `SmartContracts.tsx` and `RWATokenization.tsx`.
*   **`components/`**: Reusable UI components that are used across different pages. This includes both generic UI elements (in `components/ui/`) and application-specific components.
*   **`hooks/`**: Custom React hooks that encapsulate and reuse stateful logic, such as `useWebSocket.ts` for real-time communication.
*   **`lib/`**: Utility functions and libraries, such as the `queryClient.ts` for data fetching and caching.

### **`client/public/` - Static Assets**

*   This directory contains static assets, including the `sovr-extension/` which is a complete Chrome extension for interacting with the SOVR network directly from the browser.

## 🐍 **Backend Server (`server/`)**

The server is the engine of the SOVR Pay ecosystem, responsible for all the heavy lifting.

### **`server/` - Core Server Logic**

*   **`index.ts`**: The main entry point for the backend server.
*   **`routes.ts`**: Defines the API endpoints and how they map to different services.
*   **`services/`**: Contains the core business logic of the application.
*   **`storage.ts`**: Manages the connection to the PostgreSQL database.
*   **`receiptService.ts`**: A specialized service for handling and processing transaction receipts.
*   **`vite.ts`**:  Handles the integration with the Vite development server for a seamless development experience.

## 🔗 **Shared Resources (`shared/`)**

This directory is the connective tissue of the monorepo, ensuring that the client and server are always in sync.

*   **`schema.ts`**: This is the single source of truth for the database schema, defined using Drizzle ORM. This file is imported by both the client and the server, ensuring that there are no discrepancies in data structures.

## ⚙️ **Project Configuration**

*   **`package.json`**: The central configuration file for the project, defining dependencies, scripts, and other project-level settings.
*   **`drizzle.config.ts`**: The configuration file for Drizzle ORM, which is used for database migrations and schema management.
*   **`tsconfig.json`**: The TypeScript configuration for the project.
*   **`vite.config.ts`**: The configuration file for the Vite development server.
*   **`docker-compose.yml`**: A Docker Compose file for setting up the local development environment, including the PostgreSQL database.

## 🌍 **The Big Picture: Data Flow and Interactions**

1.  **User Interaction**: The user interacts with the `client` application, which provides a rich and intuitive interface for managing their financial activities.
2.  **API Communication**: The `client` communicates with the `server` via a RESTful API, sending and receiving data as needed.
3.  **Business Logic**: The `server` processes these requests, applying the core business logic of the SOVR Pay ecosystem.
4.  **Data Persistence**: The `server` uses the `shared/schema.ts` to interact with the PostgreSQL database, ensuring that all data is stored in a consistent and reliable manner.
5.  **Smart Contract Interaction**: For on-chain transactions, the `server` interacts with the appropriate smart contracts, creating a seamless bridge between the off-chain and on-chain worlds.
6.  **Real-Time Updates**: The `server` uses WebSockets to push real-time updates to the `client`, ensuring that the user always has the most up-to-date information.

This is the living architecture of the SOVR Pay Network Suite, a system designed for a future where finance is open, transparent, and in the hands of the individual.