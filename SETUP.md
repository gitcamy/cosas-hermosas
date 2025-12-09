# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Set Up Environment Variables**
   Create a `.env.local` file:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Set Up Database**
   ```bash
   pnpm db:push
   ```

4. **Run Development Server**
   ```bash
   pnpm dev
   ```

## Database Setup Options

### Option 1: Local PostgreSQL
Install PostgreSQL locally and create a database:
```bash
createdb mydb
DATABASE_URL="postgresql://localhost:5432/mydb" pnpm db:push
```

### Option 2: Supabase (Free)
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string from Project Settings → Database
4. Use it as your `DATABASE_URL`

### Option 3: Neon (Free)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use it as your `DATABASE_URL`

## Stripe Setup

1. **Create Account**: Sign up at [stripe.com](https://stripe.com)
2. **Get API Keys**: 
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Copy your Secret Key and Publishable Key
3. **Set Up Webhook**:
   - Go to [Webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select event: `checkout.session.completed`
   - Copy the webhook secret

## Adding Your First Product

1. Start the dev server: `pnpm dev`
2. Navigate to `/admin/products/new`
3. Fill in product details and submit
4. View your product at `/admin/products`

## Deployment to Vercel

1. **Push to GitHub**
2. **Import to Vercel**
3. **Add Environment Variables**:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
   - `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL

4. **Set Up Vercel Postgres** (optional):
   - In Vercel Dashboard → Storage
   - Create a Postgres database
   - It will automatically set `DATABASE_URL`

5. **Run Migrations**:
   ```bash
   vercel env pull .env.local
   pnpm db:push
   ```

6. **Update Stripe Webhook**:
   - Update webhook URL to your Vercel domain
   - Update `NEXT_PUBLIC_APP_URL` in Vercel

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check if your database allows connections from your IP
- For production, ensure SSL is enabled

### Stripe Webhook Issues
- Verify webhook secret matches in Stripe Dashboard
- Check webhook URL is accessible
- View webhook logs in Stripe Dashboard

### Product Images
- Use publicly accessible image URLs
- Or set up image hosting (Cloudinary, AWS S3, etc.)
- Update `next.config.mjs` with your image domains

