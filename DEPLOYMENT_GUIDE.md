# SAFE GUARD: Local & Vercel Deployment Guide

This guide provides step-by-step instructions for running **SAFE GUARD** locally on a laptop and deploying the web application to **Vercel** with Supabase PostgreSQL integration.

---

## 1. Local Laptop Deployment

### Prerequisites
- Node.js 18.x or higher (tested on Node v25)
- npm or pnpm
- Web browser with camera permissions enabled (Google Chrome, Microsoft Edge, or Firefox recommended)

### Step 1: Install Dependencies
Open terminal in the project directory:
```bash
cd "SAFE GUARD AI"
npm install --legacy-peer-deps
```

### Step 2: Configure Environment Variables
Copy `.env.example` to create `.env.local`:
```bash
cp .env.example .env.local
```
Configure your environment variables:
```ini
# Supabase Cloud Project Configuration (Optional for initial demo)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
```

> **Note on Demo Mode**: If you do not have a live Supabase instance configured, SAFE GUARD automatically runs in **Local Offline Demo Mode**. All data is safely stored in browser storage (`localStorage` and `IndexedDB`), allowing 100% of the functionality to be demonstrated immediately without cloud setup.

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Run the Production Build Locally
```bash
npm run build
npm start
```
The server will start at `http://localhost:3000` with optimized static pages and serverless API routes.

---

## 2. Deploying to Vercel

SAFE GUARD is architected specifically to be deployed to Vercel without continuous AI serverless loop bottlenecks.

### Step 1: Push Repository to GitHub
```bash
git init
git add .
git commit -m "feat: complete SAFE GUARD driver safety platform"
git branch -M main
git remote add origin https://github.com/<your-username>/safeguard-ai.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Select your `safeguard-ai` repository.
4. Framework Preset: **Next.js** (Auto-detected).
5. Root Directory: `./` (leave default).

### Step 3: Configure Environment Variables in Vercel
In the Vercel project settings, add the following environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Public Key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (Keep secret)

### Step 4: Deploy
Click **Deploy**. Vercel will build and deploy the Next.js App Router application within 2 minutes.

---

## 3. Supabase Cloud Database Setup

To connect to a live Supabase cloud database:
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open [`supabase/schema.sql`](file:///d:/SAFE%20GUARD%20AI/supabase/schema.sql) from the repository.
4. Paste the entire SQL script into the editor and click **Run**.
5. This creates all 12 tables, UUID extensions, helper functions, foreign key constraints, indexes, and Row Level Security (RLS) policies.
6. Copy your Project URL and Anon API key from **Project Settings $\rightarrow$ API** into `.env.local`.

---

## 4. Verification Checklist
- [x] Camera permissions prompt appears on `/driver`.
- [x] Web Audio sirens sound without errors after user click.
- [x] Language switcher works in English and Telugu.
- [x] Admin can export CSV safety reports.
- [x] Leaflet OpenStreetMap renders smoothly.

