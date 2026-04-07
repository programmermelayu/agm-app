# Deployment Guide

This guide covers deploying the Muktamar AGM Management System to production.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL 14+ instance or managed database service
- Redis instance or managed service
- SMTP email service (SendGrid, Gmail, etc.)
- SSL/TLS certificates
- Domain name

## Deployment Options

### Option 1: Docker Compose (Recommended for Small to Medium Deployments)

#### 1. Prepare Environment

Create a production `.env` file:

```bash
cd backend
cp .env.example .env.production
```

Edit `.env.production`:

```
NODE_ENV=production
PORT=5000

# Database (use managed service in production)
DB_HOST=your-db-host.rds.amazonaws.com
DB_PORT=5432
DB_NAME=muktamar_agm_prod
DB_USER=postgres
DB_PASSWORD=<strong-password>

# JWT
JWT_SECRET=<generate-strong-random-string>
JWT_EXPIRY=24h

# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
SMTP_FROM=noreply@yourdomain.com

# Redis (use managed service in production)
REDIS_HOST=your-redis-host.elasticache.amazonaws.com
REDIS_PORT=6379

# Domains
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

#### 2. Build and Start Services

```bash
# Build images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Run migrations
docker exec muktamar_backend npm run migrate:latest

# Check health
curl https://yourdomain.com/api/v1/health
```

### Option 2: Kubernetes Deployment

#### 1. Create Namespace

```bash
kubectl create namespace muktamar
```

#### 2. Create Secrets

```bash
kubectl create secret generic muktamar-secrets \
  --from-literal=db-password=<password> \
  --from-literal=jwt-secret=<secret> \
  --from-literal=smtp-password=<password> \
  -n muktamar
```

#### 3. Apply Manifests

Create `k8s/deployment.yaml` with appropriate resources and apply:

```bash
kubectl apply -f k8s/ -n muktamar
```

### Option 3: Traditional VPS (Using systemd)

#### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL and Redis
sudo apt install -y postgresql redis-server
```

#### 2. Setup Application

```bash
# Clone repository
git clone <repo-url> /var/www/muktamar
cd /var/www/muktamar

# Install dependencies
npm install --production

# Build frontend
cd frontend && npm run build && cd ..

# Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env with production values
```

#### 3. Create Systemd Service

Create `/etc/systemd/system/muktamar.service`:

```ini
[Unit]
Description=Muktamar AGM Management System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/muktamar/backend
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/muktamar/app.log
StandardError=append:/var/log/muktamar/error.log

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable muktamar
sudo systemctl start muktamar
```

## Post-Deployment

### 1. Database Setup

```bash
# Run migrations
npm run migrate:latest

# (Optional) Seed initial data
npm run seed:dev
```

### 2. SSL/TLS Configuration

Using Nginx as reverse proxy with Let's Encrypt:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

### 3. Nginx Configuration

Create `/etc/nginx/sites-available/muktamar`:

```nginx
upstream backend {
    server localhost:5000;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        root /var/www/muktamar/frontend/dist;
        try_files $uri /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

Enable and test:

```bash
sudo ln -s /etc/nginx/sites-available/muktamar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Monitoring and Logging

#### Setup Log Rotation

Create `/etc/logrotate.d/muktamar`:

```
/var/log/muktamar/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload muktamar > /dev/null 2>&1 || true
    endscript
}
```

#### Monitor Application Health

```bash
# Check service status
sudo systemctl status muktamar

# View logs
sudo journalctl -u muktamar -f

# Monitor resource usage
top -p $(pgrep -f "node src/server.js")
```

## Security Checklist

- [ ] Change default database passwords
- [ ] Generate strong JWT secret (min 32 chars)
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Enable password hashing verification
- [ ] Setup monitoring and alerts
- [ ] Configure database backups
- [ ] Implement security headers
- [ ] Rotate secrets regularly
- [ ] Monitor failed login attempts
- [ ] Setup application logging
- [ ] Test disaster recovery

## Performance Tuning

### Database Connection Pool

Adjust in backend `.env`:

```
# PostgreSQL pool settings
DB_POOL_MIN=5
DB_POOL_MAX=20
```

### Redis Configuration

For production Redis:

```
# Increase max memory
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### Frontend Optimization

Built with Vite - production build is already optimized:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

## Backup Strategy

### Database Backups

Daily automated backups:

```bash
#!/bin/bash
# /etc/cron.daily/muktamar-backup

BACKUP_DIR="/var/backups/muktamar"
DATE=$(date +%Y%m%d_%H%M%S)

pg_dump -h localhost -U postgres muktamar_agm_prod | \
    gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
```

### Application Code

Using git for version control and automated deployments.

## Troubleshooting

### Application Won't Start

```bash
# Check service status
sudo systemctl status muktamar

# View error logs
sudo journalctl -u muktamar -n 50

# Check if port is in use
sudo lsof -i :5000
```

### Database Connection Issues

```bash
# Test connection
psql -h <host> -U postgres -d muktamar_agm_prod

# Check connection pool
# Query active connections in PostgreSQL
SELECT count(*) FROM pg_stat_activity;
```

### Email Not Sending

```bash
# Check email logs in application
tail -f /var/log/muktamar/error.log | grep -i email

# Test SMTP configuration
curl -v telnet://<smtp-host>:<smtp-port>
```

## Rollback Procedure

If deployment fails:

```bash
# Stop current version
sudo systemctl stop muktamar

# Revert to previous version
git checkout <previous-commit>

# Reinstall dependencies
npm install --production

# Run migrations (if needed)
npm run migrate:latest

# Restart
sudo systemctl start muktamar
```

## Support

For deployment issues:
1. Check logs: `journalctl -u muktamar -f`
2. Review configuration in `backend/.env`
3. Verify database connectivity
4. Check Redis connectivity
5. Test API health endpoint
