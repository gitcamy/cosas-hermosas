# How to Get Your Supabase Connection String

## Step 1: Get the Pooler Connection String

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** → **Database**
4. Scroll down to **Connection string** section
5. Select **Session pooler** mode (port 5432)
6. Copy the connection string

The connection string will look like:
```
postgres://postgres.yqugnapnktztsliqpdbp:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

## Step 2: Update for Prisma

1. Replace `postgres` with `prisma` at the start (if you created a Prisma user)
2. Or keep `postgres` if you're using the default postgres user
3. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 3: Add SSL Parameter (if needed)

If you get connection errors, add `?sslmode=require` to the end:
```
postgresql://postgres:FPPXJzJXes2NzrJF@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

## Important Notes

- **Pooler connection** (`.pooler.supabase.com`) is recommended for Prisma
- **Direct connection** (`db.xxx.supabase.co`) may not work from all networks
- Make sure your database is not paused (Supabase free tier pauses after inactivity)
- If using a Prisma user, make sure you ran the SQL setup script first

## Troubleshooting

### "Can't reach database server"
- Use the pooler connection string instead of direct connection
- Check if your database is paused (unpause it in Supabase Dashboard)
- Verify your IP is allowed (check Supabase Dashboard → Settings → Database)

### "Password authentication failed"
- Verify the password is correct
- If using Prisma user, make sure you created it with the SQL script

