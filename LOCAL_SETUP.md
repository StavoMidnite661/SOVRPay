# Local Development Setup Guide

## Quick Start for Local Testing

### 1. Modify Environment Variables

There are three ways to set environment variables for local development:

#### Method 1: Using .env File (Recommended)

```bash
# 1. Copy the example file
cp .env.example .env

# 2. Edit the .env file with your values
nano .env  # or code .env, vim .env, etc.

# 3. The app will automatically load these variables
npm run dev
```

#### Method 2: Using Replit Secrets (On Replit)

1. Click on the "Secrets" tab in the left sidebar (🔒 icon)
2. Add your environment variables:
   - Key: `DATABASE_URL`
   - Value: `postgresql://user:pass@host:port/db`
3. Click "Add secret"
4. Restart the application

#### Method 3: Command Line (Temporary)

```bash
# Set variables for a single command
DATABASE_URL="postgresql://..." STRIPE_SECRET_KEY="sk_test_..." npm run dev

# Or export for the session
export DATABASE_URL="postgresql://..."
export STRIPE_SECRET_KEY="sk_test_..."
npm run dev
```

### 2. Minimum Required Variables for Local Development

Create a `.env` file with these essentials:

```bash
# Core Settings
NODE_ENV=development
PORT=5000

# Database (choose one option below)
# Option 1: Local PostgreSQL
DATABASE_URL=postgresql://sovr_admin:password@localhost:5432/sovr_pay_db

# Option 2: Neon (Serverless)
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/sovr_pay_db

# Option 3: Supabase
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# Security (generate random strings)
JWT_SECRET=dev-jwt-secret-change-in-production
SESSION_SECRET=dev-session-secret-change-in-production

# Email (SendGrid - get free key at app.sendgrid.com)
SENDGRID_API_KEY=SG.your-key-here
SENDGRID_FROM_EMAIL=test@yourdomain.com

# Payments (Stripe test keys from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your-key-here
STRIPE_PUBLISHABLE_KEY=pk_test_your-key-here

# Blockchain (Alchemy - free at alchemy.com)
ALCHEMY_API_KEY=your-alchemy-key-here
```

---

## Complete Local PostgreSQL Setup

### Step 1: Install PostgreSQL

**On macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**On Windows:**
1. Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run installer and follow wizard
3. Remember the password you set for 'postgres' user

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Or on Ubuntu
sudo -u postgres psql

# Create database and user
CREATE DATABASE sovr_pay_db;
CREATE USER sovr_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sovr_pay_db TO sovr_admin;
ALTER DATABASE sovr_pay_db OWNER TO sovr_admin;

# Switch to the database
\c sovr_pay_db

# Enable required extensions (IMPORTANT!)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

# Exit
\q
```

### Step 3: Test Connection

```bash
# Test connection
psql postgresql://sovr_admin:your_secure_password@localhost:5432/sovr_pay_db

# If successful, you'll see:
# sovr_pay_db=>

# Exit
\q
```

### Step 4: Add to .env

```bash
DATABASE_URL=postgresql://sovr_admin:your_secure_password@localhost:5432/sovr_pay_db
```

### Step 5: Run Migrations

```bash
# Push database schema
npm run db:push

# Verify with Drizzle Studio
npm run db:studio
# Opens http://localhost:3000 to view your database
```

---

## Database Schema Reference

### Complete Table Structure

```sql
-- Core Payment Tables
payments (id, amount, currency, status, method, customer_email, transaction_hash, ...)
smart_contracts (id, name, type, address, network, status, gas_used, ...)
transactions (id, payment_id, type, amount, currency, status, block_number, ...)

-- Asset Management
tokenized_assets (id, name, symbol, asset_type, total_supply, price_per_token, network, ...)
asset_valuations (id, asset_id, valuation_type, valuation_amount, confidence_level, ...)
market_prices (id, asset_id, price, source, volume, rsi, moving_average_7d, ...)
property_insights (id, asset_id, insight_type, key_metrics, risk_level, ...)

-- User & Notifications
user_notification_preferences (user_id, email, enable_email_receipts, timezone, ...)
transaction_receipts (id, receipt_number, transaction_type, user_email, amount, ...)
transaction_events (id, event_type, transaction_id, event_data, processed_at, ...)
notification_templates (id, name, transaction_type, format, html_template, ...)

-- Shopping
products (id, retailer, title, price, availability, categories, ...)

-- Logging
api_requests (id, endpoint, method, response_code, response_time, ...)
```

### Relationships

```
payments 1→∞ transactions (payment_id)
tokenized_assets 1→∞ asset_valuations (asset_id)
tokenized_assets 1→∞ market_prices (asset_id)
tokenized_assets 1→∞ property_insights (asset_id)
```

---

## API Keys Setup Guide

### 1. SendGrid (Email - FREE)

**Get Key:**
1. Sign up at [app.sendgrid.com](https://app.sendgrid.com)
2. Go to Settings → API Keys
3. Click "Create API Key"
4. Name: "SOVR Pay Local Dev"
5. Select "Full Access"
6. Copy key immediately (shown once)

**Verify Sender:**
1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Enter your email
4. Verify email address

**Add to .env:**
```bash
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=your-verified@email.com
```

### 2. Stripe (Payments - FREE)

**Get Keys:**
1. Sign up at [dashboard.stripe.com](https://dashboard.stripe.com/register)
2. Go to Developers → API Keys
3. Copy "Secret key" (sk_test_...)
4. Copy "Publishable key" (pk_test_...)

**Add to .env:**
```bash
STRIPE_SECRET_KEY=sk_test_xxx...
STRIPE_PUBLISHABLE_KEY=pk_test_xxx...
```

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future date, any CVC

### 3. Alchemy (Blockchain - FREE)

**Get Key:**
1. Sign up at [alchemy.com](https://www.alchemy.com/)
2. Click "Create App"
3. Name: "SOVR Pay Local"
4. Chain: Polygon
5. Network: Polygon Mumbai (testnet)
6. Copy API key

**Add to .env:**
```bash
ALCHEMY_API_KEY=xxx...
```

### 4. Twilio (SMS - OPTIONAL)

**Get Keys:**
1. Sign up at [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Get $15 free credit
3. Go to Console
4. Copy Account SID and Auth Token
5. Get a phone number (free trial)

**Add to .env:**
```bash
TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=xxx...
TWILIO_PHONE_NUMBER=+1234567890
```

### 5. Google Gemini AI (OPTIONAL - for Asset Analysis)

**Get Key:**
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

**Add to .env:**
```bash
GOOGLE_API_KEY=xxx...
```

### 6. Shopping APIs (OPTIONAL)

**Best Buy API (FREE - 50k calls/day):**
1. Sign up at [developer.bestbuy.com](https://developer.bestbuy.com/)
2. Create app → Copy API key

**Serper.dev (FREE - 2500 searches/month):**
1. Sign up at [serper.dev](https://serper.dev/)
2. Copy API key from dashboard

**Add to .env:**
```bash
BESTBUY_API_KEY=xxx...
SERPER_API_KEY=xxx...
REDCIRCLE_API_KEY=xxx... # Optional for Target products
```

---

## Running the Application

### Development Mode

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:push

# Start dev server (with hot reload)
npm run dev
```

App runs at: `http://localhost:5000`

### Production Build

```bash
# Build the app
npm run build

# Start production server
npm start
```

### Database Management

```bash
# Open Drizzle Studio (database GUI)
npm run db:studio

# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly (dev only)
npm run db:push
```

---

## Troubleshooting

### "Cannot connect to database"

1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   
   # Ubuntu
   sudo systemctl status postgresql
   ```

2. Verify connection string:
   ```bash
   echo $DATABASE_URL
   ```

3. Test manual connection:
   ```bash
   psql $DATABASE_URL
   ```

### "SendGrid authentication failed"

1. Check API key is correct
2. Verify sender email in SendGrid dashboard
3. Check for trailing spaces in .env file

### "Port 5000 already in use"

```bash
# Find what's using the port
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3000 npm run dev
```

### "Module not found" errors

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear TypeScript cache
npm run check
```

### Database schema mismatch

```bash
# Reset database (CAUTION: deletes all data)
npm run db:push

# Or manually drop and recreate
psql postgres
DROP DATABASE sovr_pay_db;
CREATE DATABASE sovr_pay_db;
\q

npm run db:push
```

---

## Testing Guide

### Test Payment Flow

1. Start the app: `npm run dev`
2. Go to `http://localhost:5000`
3. Navigate to "Payments" → "Create Payment"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Check receipt in email (if SendGrid configured)

### Test Smart Contract Deployment

1. Go to "Smart Contracts"
2. Click "Deploy Contract"
3. Select template
4. Configure parameters
5. Click "Deploy"
6. Check transaction status

### Test Asset Tokenization

1. Go to "RWA Tokenization"
2. Click "Create Asset"
3. Fill in asset details
4. Upload compliance documents
5. Submit for approval

### Test Shopping Feature

1. Go to "Real World Shopping"
2. Search for a product
3. View product details
4. Add to cart
5. Checkout with SOVR credits

---

## AWS Deployment Guide

### AWS RDS PostgreSQL Setup

1. **Create RDS Instance:**
   ```bash
   # Using AWS CLI
   aws rds create-db-instance \
     --db-instance-identifier sovr-pay-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username sovradmin \
     --master-user-password YourSecurePassword \
     --allocated-storage 20 \
     --vpc-security-group-ids sg-xxx \
     --publicly-accessible
   ```

2. **Get Connection Details:**
   ```bash
   aws rds describe-db-instances \
     --db-instance-identifier sovr-pay-db \
     --query 'DBInstances[0].Endpoint'
   ```

3. **Update .env:**
   ```bash
   DATABASE_URL=postgresql://sovradmin:YourSecurePassword@sovr-pay-db.xxx.us-east-1.rds.amazonaws.com:5432/postgres
   ```

### AWS EC2 Application Server

1. **Launch EC2 Instance:**
   - AMI: Ubuntu 22.04 LTS
   - Type: t3.medium
   - Security Group: Allow ports 22, 80, 443, 5000

2. **Setup Application:**
   ```bash
   # SSH into instance
   ssh -i key.pem ubuntu@ec2-xxx.compute.amazonaws.com
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Clone repo
   git clone https://github.com/your-org/sovr-pay.git
   cd sovr-pay
   
   # Install dependencies
   npm install
   
   # Create .env file
   nano .env
   # Paste your environment variables
   
   # Build
   npm run build
   
   # Install PM2
   sudo npm install -g pm2
   
   # Start app
   pm2 start npm --name sovr-pay -- start
   pm2 save
   pm2 startup
   ```

---

## Development Checklist

- [ ] PostgreSQL installed and running
- [ ] Database created with correct permissions
- [ ] `.env` file configured with all required variables
- [ ] Dependencies installed (`npm install`)
- [ ] Database schema applied (`npm run db:push`)
- [ ] SendGrid API key configured and sender verified
- [ ] Stripe test keys added to `.env`
- [ ] Alchemy API key configured
- [ ] Application builds successfully (`npm run build`)
- [ ] Development server starts (`npm run dev`)
- [ ] Can access app at `http://localhost:5000`
- [ ] Test payment completes successfully
- [ ] Email receipt delivered (if configured)

---

## Next Steps

1. **Complete API Setup**: Get remaining API keys from [SETUP.md](./SETUP.md)
2. **Configure Production**: Update `.env` with production values
3. **Deploy**: Choose deployment option (Vercel, AWS, Docker)
4. **Monitor**: Set up error tracking with Sentry
5. **Scale**: Add Redis for caching and rate limiting

---

## Support

- **Setup Issues**: Check [SETUP.md](./SETUP.md) troubleshooting section
- **API Documentation**: See individual API provider docs
- **GitHub Issues**: [Report issues](https://github.com/your-org/sovr-pay/issues)
- **Community**: Join Discord for help
