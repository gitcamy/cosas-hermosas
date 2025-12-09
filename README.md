# Ecommerce Template

A modern, full-featured ecommerce platform built with Next.js, Prisma, PostgreSQL, and Stripe.

## Features

- 🛍️ **Product Management** - Upload and manage products with variants, images, and options
- 💳 **Stripe Payments** - Secure checkout with Stripe
- 🛒 **Shopping Cart** - Full cart functionality with persistent storage
- 📦 **Order Management** - Complete order tracking and customer management
- 🎨 **Beautiful UI** - Modern, responsive design
- 🚀 **Vercel Ready** - Optimized for Vercel deployment

## Tech Stack

- **Framework**: Next.js 15
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI

## Local Development Setup

### Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **pnpm** - Install with: `npm install -g pnpm`
3. **Vercel CLI** - Install with: `npm install -g vercel`

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   Create a `.env.local` file in the root directory (see Environment Variables section below).

3. Run the development server:
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

### Building for Production

```bash
pnpm build
pnpm start
```

## Vercel CLI Deployment

### First-time Setup

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Link your project:**
   ```bash
   vercel link
   ```
   This will prompt you to:
   - Select or create a Vercel project
   - Link to an existing project or create a new one

3. **Set environment variables:**
   ```bash
   vercel env add DATABASE_URL
   vercel env add STRIPE_SECRET_KEY
   vercel env add STRIPE_WEBHOOK_SECRET
   ```
   See the Environment Variables section below for details.

### Deploying

**Preview Deployment:**
```bash
vercel
```

**Production Deployment:**
```bash
vercel --prod
```

### Other Useful Commands

- **View deployments:**
  ```bash
  vercel ls
  ```

- **View project info:**
  ```bash
  vercel inspect
  ```

- **Pull environment variables:**
  ```bash
  vercel env pull .env.local
  ```

- **Run local production build:**
  ```bash
  vercel dev
  ```
  This runs a local server that mimics Vercel's production environment.

### Database Setup

This app uses PostgreSQL with Prisma. You'll need to set up a database:

1. **Local Development**: Use a local PostgreSQL database or a service like [Supabase](https://supabase.com) or [Neon](https://neon.tech)
2. **Production**: Use Vercel Postgres or any PostgreSQL provider

**Setting up the database:**

1. Create a `.env.local` file with your database URL:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
   ```

2. Run migrations:
   ```bash
   pnpm db:push
   ```

   Or for production:
   ```bash
   pnpm db:migrate
   ```

### Stripe Setup

1. Create a [Stripe account](https://stripe.com) (free to start)
2. Get your API keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
3. Add your keys to `.env.local`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. Set up webhook endpoint in Stripe Dashboard:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`

### Environment Variables

Create a `.env.local` file with the following:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For Vercel deployment:**

Set these in Vercel Dashboard → Project Settings → Environment Variables, or use:

```bash
vercel env add DATABASE_URL
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
```

### Admin Panel

Access the admin panel to manage products:

- **Products**: `/admin/products` - View and manage all products
- **Add Product**: `/admin/products/new` - Create a new product

### Product Management

Products can be created through:
1. The admin panel at `/admin/products/new`
2. The API endpoint at `/api/admin/products` (POST)

Each product can have:
- Multiple images
- Variants (size, color, etc.)
- Options (product options like Color, Size)
- Collections (categories)
- Pricing and inventory
