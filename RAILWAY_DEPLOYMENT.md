# Railway Deployment Guide

This guide walks you through deploying the AGM App to Railway.

## Prerequisites

1. **Railway Account** — Sign up at https://railway.app
2. **GitHub Repository** — This repo is already on GitHub at https://github.com/programmermelayu/agm-app

## Step-by-Step Deployment

### 1. Connect GitHub to Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account and select `agm-app` repository
5. Select branch: `001-agm-app-mvp`

### 2. Add PostgreSQL Database

1. In Railway dashboard, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Wait for it to be provisioned (takes ~1 minute)
4. Railway automatically adds `DATABASE_URL` environment variable

### 3. Add Redis Service

1. Click **"+ New"** → **"Database"** → **"Redis"**
2. Wait for provisioning
3. Railway automatically adds `REDIS_URL` environment variable

### 4. Set Environment Variables

In the **Variables** section of your project, add:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=<generate-a-secure-32-char-string>
JWT_EXPIRY=24h

# Email Configuration - Choose ONE:

# Option A: Gmail (recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Option B: SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# Email From Address
SMTP_FROM=noreply@muktamar.com

# Logging
LOG_LEVEL=info

# CORS & Frontend
CORS_ORIGIN=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# Environment
ENVIRONMENT=production
```

**Note:** `DATABASE_URL` and `REDIS_URL` are automatically set by Railway. Don't add them manually.

### 5. Configure Gmail App Password (if using Gmail)

If using Gmail for emails:

1. Enable 2-factor authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password
5. Use it as `SMTP_PASS` in Railway

### 6. Deploy

1. Railway auto-deploys when you push to the branch
2. The `Procfile` automatically runs migrations: `npm run migrate:latest && npm start`
3. Monitor deployment in Railway dashboard

### 7. Verify Deployment

Once deployed:

1. Get the production URL from Railway dashboard
2. Test the API: `https://your-app.railway.app/api/v1/health`
3. Check logs in Railway dashboard for any errors

## Frontend Deployment (Optional - Choose One)

### Option A: Serve from Backend (Easiest)

Frontend is built and served by backend. No additional steps needed.

### Option B: Deploy Frontend Separately

Deploy to Vercel, Netlify, or another provider:

1. Create a frontend repository (or separate branch)
2. Set `VITE_API_BASE_URL=https://your-backend.railway.app/api/v1`
3. Deploy to your hosting provider

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `DATABASE_URL` | Auto | PostgreSQL connection string (Railway) |
| `REDIS_URL` | Auto | Redis connection string (Railway) |
| `JWT_SECRET` | Yes | Min 32 characters, secure random string |
| `JWT_EXPIRY` | No | JWT expiry time (default: 24h) |
| `SMTP_HOST` | Yes | Email SMTP host |
| `SMTP_PORT` | Yes | Email SMTP port (587 for TLS) |
| `SMTP_USER` | Yes | Email account username |
| `SMTP_PASS` | Yes | Email account password |
| `SMTP_FROM` | No | Email from address |
| `CORS_ORIGIN` | Yes | Frontend domain (for CORS) |
| `FRONTEND_URL` | Yes | Frontend URL (for RSVP links) |
| `LOG_LEVEL` | No | Logging level (debug/info/warn/error) |

## Troubleshooting

### Database Connection Failed
- Check `DATABASE_URL` is set (Railway should do this automatically)
- Verify PostgreSQL service is running in Railway
- Check logs: `npm run migrate:latest`

### Redis Connection Failed
- Check `REDIS_URL` is set
- Verify Redis service is running in Railway
- Check logs for connection errors

### Emails Not Sending
- Verify SMTP credentials are correct
- For Gmail: ensure app password is used, not account password
- Check logs in Railway dashboard

### Migrations Not Running
- Procfile should auto-run migrations
- If stuck, manually trigger: SSH into Railway dyno and run `npm run migrate:latest`

## Database Migrations

Migrations run automatically via Procfile on every deploy:

```bash
npm run migrate:latest
```

To create new migrations locally:

```bash
npm run migrate:make <migration_name>
```

## Rollback

To rollback a migration:

```bash
npm run migrate:rollback
```

## Monitoring

Railway provides built-in monitoring:

1. **Logs** — View real-time logs in dashboard
2. **Metrics** — CPU, memory, and disk usage
3. **Deployment History** — Track all deployments

## Support

For issues:

1. Check Railway logs in dashboard
2. Check GitHub Actions for build errors
3. Test locally with `npm run dev`
4. Check Railway status: https://status.railway.app
