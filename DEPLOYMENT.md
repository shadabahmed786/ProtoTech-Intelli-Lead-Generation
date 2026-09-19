# ProtoTech Intelli — Website Deployment Guide

This guide details how to deploy **ProtoTech Intelli Lead Generation** as a live, publicly accessible website.

---

## Deployment Options at a Glance

| Method | Recommended For | Cost | Setup Time | Database |
| :--- | :--- | :--- | :--- | :--- |
| **Vercel + Supabase** | Production / Fast Serverless | **Free** | 3 mins | PostgreSQL (Cloud) |
| **Railway / Render** | All-in-One Cloud | **Free / Low Cost** | 2 mins | PostgreSQL or SQLite |
| **Docker / VPS** | Self-hosted (DigitalOcean, Hetzner, AWS) | **$0 - $5/mo** | 5 mins | Persistent SQLite or PostgreSQL |

---

## Option 1: Deploy on Vercel + Supabase (Recommended)

### Step 1: Create a Free Supabase Database
1. Go to [https://supabase.com](https://supabase.com) and create a free account.
2. Click **New Project**, choose a region close to your target users, and set a database password.
3. In your Supabase project settings, go to **Database** → **Connection String** → **URI**.
4. Copy the connection string:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

### Step 2: Switch Prisma to PostgreSQL
In your local repository:
```bash
npm run db:switch:postgres
npx prisma db push
npx tsx prisma/seed.ts
git add .
git commit -m "chore: enable postgresql for Supabase deployment"
git push origin main
```

### Step 3: Deploy to Vercel
1. Go to [https://vercel.com](https://vercel.com) and click **Add New Project**.
2. Import the GitHub repository: `shadabahmed786/ProtoTech-Intelli-Lead-Generation`.
3. In **Environment Variables**, add:
   - `DATABASE_URL`: Your Supabase connection string.
4. Click **Deploy**.
5. Your website is immediately live at `https://your-project.vercel.app`!

---

## Option 2: Deploy with Docker & Docker Compose (Any VPS / Cloud)

ProtoTech Intelli includes a production-ready multi-stage `Dockerfile` and `docker-compose.yml`.

### On any Linux VPS (Ubuntu / Debian / CentOS):
```bash
# 1. Clone repository
git clone https://github.com/shadabahmed786/ProtoTech-Intelli-Lead-Generation.git
cd ProtoTech-Intelli-Lead-Generation

# 2. Start container with volume persistence
docker compose up -d --build
```
- The application will start at `http://YOUR_SERVER_IP:3000`.
- Data is automatically persisted inside Docker volume `prototech-data`.
- Health check is live at `http://YOUR_SERVER_IP:3000/api/health`.

### Setup Free SSL with Caddy or Cloudflare Tunnel:
```caddy
yourdomain.com {
    reverse_proxy localhost:3000
}
```

---

## Option 3: Deploy on Railway / Render

1. Open [https://railway.app](https://railway.app) or [https://render.com](https://render.com).
2. Click **Deploy from GitHub repo** and select `ProtoTech-Intelli-Lead-Generation`.
3. Set the environment variable:
   - `NODE_ENV=production`
   - `DATABASE_URL=file:/app/data/dev.db` (if using persistent disk) or your external PostgreSQL connection string.
4. Click **Deploy**.

---

## Health Check & Monitoring

The system exposes a lightweight uptime endpoint:
```
GET /api/health
```
Response:
```json
{
  "status": "healthy",
  "service": "ProtoTech Intelli",
  "version": "1.0.0",
  "timestamp": "2026-09-19T10:00:00.000Z",
  "database": "connected"
}
```
