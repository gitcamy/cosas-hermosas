# Supabase Prisma Setup Guide

Follow these steps to set up Prisma with your Supabase database.

## Step 1: Create Prisma User in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Open the file `supabase-prisma-setup.sql` in this project
5. **IMPORTANT**: Replace `YOUR_SECURE_PASSWORD_HERE` with a strong password
   - Use a password generator: https://www.lastpass.com/features/password-generator
   - Save this password - you'll need it for the connection string
6. Copy the entire SQL script and paste it into the SQL Editor
7. Click **Run** to execute the script

## Step 2: Get Your Connection String

1. In your Supabase Dashboard, go to **Project Settings** → **Database**
2. Scroll down to **Connection string** section
3. Select **Session pooler** mode (port 5432)
4. Copy the connection string - it will look like:
   ```
   postgres://postgres.yqugnapnktztsliqpdbp:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```

## Step 3: Update Your Connection String

1. Replace `postgres` in the connection string with `prisma`:
   ```
   postgres://prisma.yqugnapnktztsliqpdbp:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```

2. Replace `[YOUR-PASSWORD]` with the password you created in Step 1

3. Update your `.env.local` file with the complete connection string:
   ```bash
   DATABASE_URL="postgres://prisma.yqugnapnktztsliqpdbp:YOUR_ACTUAL_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
   ```

## Step 4: Test the Connection

1. Regenerate Prisma Client:
   ```bash
   pnpm prisma generate
   ```
   or
   ```bash
   npx prisma generate
   ```

2. Push your schema to the database (if tables don't exist yet):
   ```bash
   pnpm db:push
   ```
   or
   ```bash
   npx prisma db push
   ```

3. Start your development server:
   ```bash
   pnpm dev
   ```

## Troubleshooting

### Error: "the URL must start with the protocol `postgresql://` or `postgres://`"
- Make sure your `DATABASE_URL` starts with `postgres://` (not `https://`)
- Check that you're using the Session pooler connection string (port 5432)

### Error: "password authentication failed"
- Verify the password in your connection string matches the one you set in Step 1
- Make sure you replaced `postgres` with `prisma` in the connection string

### Error: "relation does not exist"
- Your database tables might not exist yet
- Run `pnpm db:push` to create the tables from your Prisma schema

## Reference

- [Supabase Prisma Guide](https://supabase.com/docs/guides/database/prisma)
- [Prisma Documentation](https://www.prisma.io/docs)

