# SOVR Pay Network Suite - System Architecture

This document provides a detailed, file-by-file architectural overview of the current SOVR Pay Network Suite. It is a precise map of the existing codebase, intended to serve as a definitive reference for the development team.

## 📁 **Root Directory**

The root of the monorepo contains the primary configuration files that govern the entire project.

- **`package.json`**: Defines scripts, dependencies, and project metadata.
- **`docker-compose.yml`**: Configures the Docker environment for local development, including the PostgreSQL database.
- **`drizzle.config.ts`**: Configuration for Drizzle ORM, used for database migrations.
- **`tsconfig.json`**: TypeScript configuration for the entire project.
- **`vite.config.ts`**: Configuration for the Vite development server.
- **`postcss.config.js`**: Configuration for PostCSS.
- **`tailwind.config.ts`**: Configuration for Tailwind CSS.

---

## 🌐 **Client Application (`client/`)**

The `client/` directory contains the complete source code for the user-facing web application.

- **`index.html`**: The main HTML file and entry point for the client application.

### `client/src/` - Client Source Code

- **`main.tsx`**: The main entry point for the React application.
- **`App.tsx`**: The root React component, responsible for routing and global layout.
- **`index.css`**: Global CSS styles for the application.

#### `client/src/pages/` - Application Pages

This directory contains the top-level components for each page of the application.

- **`Dashboard.tsx`**: The main dashboard and landing page.
- **`ApiTesting.tsx`**: A dedicated page for testing API endpoints.
- **`BankingCompliance.tsx`**: A view for banking and compliance information.
- **`BrowserExtension.tsx`**: A page related to the browser extension.
- **`DeFiProtocols.tsx`**: A view for interacting with DeFi protocols.
- **`EcosystemDemo.tsx`**: A demonstration of the SOVR ecosystem.
- **`Integration.tsx`**: A page for managing integrations.
- **`IntegrationHub.tsx`**: A central hub for all integrations.
- **`Monitoring.tsx`**: The main monitoring dashboard.
- **`RWATokenization.tsx`**: A page for Real World Asset tokenization.
- **`RealWorldShopping.tsx`**: A view for real-world shopping experiences.
- **`SmartContracts.tsx`**: A page for interacting with smart contracts.
- **`not-found.tsx`**: The "404 Not Found" page.

#### `client/src/components/` - Reusable Components

- **`ApiTester.tsx`**: A component for testing APIs.
- **`ContractDeployer.tsx`**: A component for deploying smart contracts.
- **`MonitoringCharts.tsx`**: Components for displaying monitoring data.
- **`Navigation.tsx`**: The main navigation component.
- **`TransactionFlow.tsx`**: A component for visualizing transaction flows.

##### `client/src/components/ui/` - UI Primitives

This directory contains a rich library of reusable, primitive UI components, built with shadcn/ui. These components are the building blocks of the application's user interface.

- `accordion.tsx`
- `alert-dialog.tsx`
- `alert.tsx`
- `aspect-ratio.tsx`
- `avatar.tsx`
- `badge.tsx`
- `breadcrumb.tsx`
- `button.tsx`
- `calendar.tsx`
- `card.tsx`
- `carousel.tsx`
- `chart.tsx`
- `checkbox.tsx`
- `collapsible.tsx`
- `command.tsx`
- `context-menu.tsx`
- `dialog.tsx`
- `drawer.tsx`
- `dropdown-menu.tsx`
- `form.tsx`
- `hover-card.tsx`
- `input-otp.tsx`
- `input.tsx`
- `label.tsx`
- `menubar.tsx`
- `navigation-menu.tsx`
- `pagination.tsx`
- `popover.tsx`
- `progress.tsx`
- `radio-group.tsx`
- `resizable.tsx`
- `scroll-area.tsx`
- `select.tsx`
- `separator.tsx`
- `sheet.tsx`
- `sidebar.tsx`
- `skeleton.tsx`
- `slider.tsx`
- `switch.tsx`
- `table.tsx`
- `tabs.tsx`
- `textarea.tsx`
- `toast.tsx`
- `toaster.tsx`
- `toggle-group.tsx`
- `toggle.tsx`
- `tooltip.tsx`

#### `client/src/hooks/` - Custom React Hooks

- **`use-mobile.tsx`**: A hook for detecting mobile devices.
- **`use-toast.ts`**: A hook for displaying toast notifications.
- **`useWebSocket.ts`**: A hook for managing WebSocket connections.

#### `client/src/lib/` - Client-Side Libraries and Utilities

- **`queryClient.ts`**: Configuration for the React Query client.
- **`theme.ts`**: Theme configuration for the application.
- **`utils.ts`**: General utility functions.

---

## 🔌 **Browser Extension (`public/sovr-extension/`)**

This directory contains the complete source code for the SOVR Pay Chrome Extension.

- **`manifest.json`**: The extension's manifest file.
- **`background.js`**: The background script for the extension.
- **`content.js`**: The content script for the extension.
- **`popup.html`**, **`popup.js`**, **`popup-styles.css`**: The UI for the extension's popup.
- **`icon16.png`**, **`icon32.png`**, **`icon48.png`**, **`icon128.png`**: Icons for the extension.

---

## ⚙️ **Backend Server (`server/`)**

The `server/` directory contains the source code for the Node.js backend.

- **`index.ts`**: The main entry point for the server.
- **`routes.ts`**: Defines the API routes.
- **`storage.ts`**: Manages the database connection.
- **`receiptService.ts`**: A service for handling receipts.
- **`test.ts`**: Test-related code.
- **`vite.ts`**: Integration with the Vite development server.

### `server/services/` - Backend Services

- **`apiClient.ts`**: A client for making requests to external APIs.

---

## 🔗 **Shared Code (`shared/`)**

- **`schema.ts`**: The Drizzle ORM schema, defining the structure of the database. This is the single source of truth for data models across the entire application.
