# 🚀 Deployment Guide - Seitech E-Learning Platform

## Overview

This guide provides step-by-step instructions for deploying the Seitech E-Learning Platform to production.

---

## Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / Debian 11+ / RHEL 8+
- **CPU**: 4+ cores recommended
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 50GB+ SSD
- **Network**: Static IP with ports 80, 443, 5432, 8069 accessible

### Software Requirements
- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **Node.js**: 18.17+ (for frontend)
- **PostgreSQL**: 15+ (can run in Docker or standalone)
- **Nginx**: 1.18+ (reverse proxy)
- **SSL Certificate**: Let's Encrypt or commercial

---

## Architecture

```
┌─────────────────┐
│   CloudFlare    │ (Optional CDN)
└────────┬────────┘
         │
┌────────▼────────┐
│  Nginx (HTTPS)  │ :443
└────────┬────────┘
         │
    ┌────┴─────┬────────────────┐
    │          │                │
┌───▼───┐  ┌───▼───┐      ┌────▼─────┐
│ Odoo  │  │Next.js│      │Socket.IO │
│ :8069 │  │ :3000 │      │  :3001   │
└───┬───┘  └───────┘      └──────────┘
    │
┌───▼────────┐
│PostgreSQL  │
│   :5432    │
└────────────┘
```

---

## Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget vim ufw
```

### 1.2 Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker
```

### 1.3 Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 1.4 Configure Firewall
```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

---

## Step 2: Clone Repository

```bash
cd /opt
sudo git clone https://github.com/retrocraftdevops/seitech.git
sudo chown -R $USER:$USER seitech
cd seitech
```

---

## Step 3: Environment Configuration

### 3.1 Backend Environment
Create `/opt/seitech/.env`:
```bash
# Odoo Configuration
ODOO_VERSION=19.0
ODOO_LICENSE=M251219268990828
POSTGRES_USER=odoo
POSTGRES_PASSWORD=<CHANGE_ME_SECURE_PASSWORD>
POSTGRES_DB=odoo
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Paths
ADDONS_PATH=/opt/odoo/addons,/opt/odoo/enterprise,/opt/odoo/custom_addons
DATA_DIR=/opt/odoo/data

# Admin
ADMIN_PASSWD=<CHANGE_ME_ADMIN_PASSWORD>

# Session
SESSION_SECRET=<CHANGE_ME_RANDOM_STRING>

# Production settings
WORKERS=4
MAX_CRON_THREADS=2
LIMIT_MEMORY_HARD=2684354560
LIMIT_MEMORY_SOFT=2147483648
LIMIT_TIME_CPU=600
LIMIT_TIME_REAL=1200
```

### 3.2 Frontend Environment
Create `/opt/seitech/frontend/.env.production`:
```bash
# API URLs
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://socket.yourdomain.com
NEXT_PUBLIC_ODOO_DB=odoo

# Auth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<CHANGE_ME_RANDOM_STRING>

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Environment
NODE_ENV=production
```

### 3.3 Generate Secrets
```bash
# Generate random secrets
openssl rand -base64 32  # For SESSION_SECRET
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 16  # For POSTGRES_PASSWORD
```

---

## Step 4: SSL Certificate Setup

### 4.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 4.2 Obtain Certificate
```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com -d socket.yourdomain.com
```

---

## Step 5: Nginx Configuration

Create `/etc/nginx/sites-available/seitech`:
```nginx
# Frontend
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Odoo Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    client_max_body_size 100M;
    proxy_read_timeout 720s;
    proxy_connect_timeout 720s;
    proxy_send_timeout 720s;

    location / {
        proxy_pass http://localhost:8069;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    location /longpolling {
        proxy_pass http://localhost:8072;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Socket.IO
server {
    listen 80;
    server_name socket.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name socket.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable configuration:
```bash
sudo ln -s /etc/nginx/sites-available/seitech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 6: Build and Deploy

### 6.1 Build Backend
```bash
cd /opt/seitech
docker-compose -f docker-compose.yml build
```

### 6.2 Build Frontend
```bash
cd /opt/seitech/frontend
npm install --production
npm run build
```

### 6.3 Start Services
```bash
# Start backend
cd /opt/seitech
docker-compose up -d

# Wait for Odoo to initialize (2-3 minutes)
docker-compose logs -f odoo

# Install/update modules
docker-compose exec odoo python3 /opt/odoo/odoo/odoo-bin \
    -c /opt/odoo/config/odoo.conf \
    -d odoo \
    -i seitech_base,seitech_website_theme,seitech_elearning \
    --stop-after-init

# Start frontend with PM2
cd /opt/seitech/frontend
npm install -g pm2
pm2 start npm --name "seitech-frontend" -- start
pm2 startup
pm2 save
```

---

## Step 7: Database Initialization

### 7.1 Create Admin User
```bash
docker-compose exec odoo python3 /opt/odoo/odoo/odoo-bin shell -c /opt/odoo/config/odoo.conf -d odoo
```

In Python shell:
```python
# Create admin user
user = env['res.users'].create({
    'name': 'Administrator',
    'login': 'admin@yourdomain.com',
    'password': 'ChangeMe123!',
    'groups_id': [(6, 0, [env.ref('base.group_system').id])]
})

# Add to eLearning groups
user.groups_id = [(4, env.ref('seitech_elearning.group_elearning_manager').id)]
env.cr.commit()
exit()
```

### 7.2 Import Sample Data (Optional)
```bash
cd /opt/seitech
python3 scripts/setup_courses.py
```

---

## Step 8: Monitoring Setup

### 8.1 Install Monitoring Tools
```bash
# Install Prometheus Node Exporter
wget https://github.com/prometheus/node_exporter/releases/latest/download/node_exporter-*-linux-amd64.tar.gz
tar xvfz node_exporter-*-linux-amd64.tar.gz
sudo mv node_exporter-*/node_exporter /usr/local/bin/
sudo useradd -rs /bin/false node_exporter

# Create systemd service
sudo tee /etc/systemd/system/node_exporter.service <<EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

### 8.2 Log Rotation
Create `/etc/logrotate.d/seitech`:
```
/opt/seitech/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 odoo odoo
    sharedscripts
    postrotate
        docker-compose -f /opt/seitech/docker-compose.yml restart odoo > /dev/null
    endscript
}
```

---

## Step 9: Backup Configuration

### 9.1 Database Backup Script
Create `/opt/seitech/scripts/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/seitech/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/odoo_backup_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T db pg_dump -U odoo odoo | gzip > $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "odoo_backup_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
# aws s3 cp $BACKUP_FILE s3://your-bucket/backups/

echo "Backup completed: $BACKUP_FILE"
```

Make executable:
```bash
chmod +x /opt/seitech/scripts/backup.sh
```

### 9.2 Cron Job
```bash
crontab -e
```

Add:
```
# Daily backup at 2 AM
0 2 * * * /opt/seitech/scripts/backup.sh >> /var/log/seitech-backup.log 2>&1

# SSL renewal check
0 0 1 * * certbot renew --quiet
```

---

## Step 10: Security Hardening

### 10.1 SSH Hardening
Edit `/etc/ssh/sshd_config`:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

### 10.2 Fail2Ban
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

Create `/etc/fail2ban/jail.local`:
```ini
[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
```

### 10.3 PostgreSQL Security
```bash
# Connect to database
docker-compose exec db psql -U postgres

-- In PostgreSQL:
ALTER USER odoo WITH PASSWORD '<new_secure_password>';
REVOKE ALL ON DATABASE postgres FROM PUBLIC;
\q
```

---

## Step 11: Performance Optimization

### 11.1 Odoo Configuration
Edit `/opt/seitech/config/odoo.conf`:
```ini
[options]
workers = 8
max_cron_threads = 2
limit_memory_hard = 2684354560
limit_memory_soft = 2147483648
limit_time_cpu = 600
limit_time_real = 1200
limit_request = 8192
db_maxconn = 64
```

### 11.2 PostgreSQL Tuning
Create `/opt/seitech/config/postgresql.conf`:
```ini
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
max_connections = 100
```

### 11.3 Nginx Caching
Add to Nginx server block:
```nginx
# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Enable gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

---

## Step 12: Health Checks

### 12.1 Create Health Check Script
Create `/opt/seitech/scripts/health_check.sh`:
```bash
#!/bin/bash

# Check Odoo
if ! curl -f http://localhost:8069/web/health > /dev/null 2>&1; then
    echo "Odoo is down!"
    docker-compose restart odoo
fi

# Check Frontend
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "Frontend is down!"
    pm2 restart seitech-frontend
fi

# Check PostgreSQL
if ! docker-compose exec -T db pg_isready -U odoo > /dev/null 2>&1; then
    echo "PostgreSQL is down!"
    docker-compose restart db
fi
```

### 12.2 Add to Cron
```bash
*/5 * * * * /opt/seitech/scripts/health_check.sh >> /var/log/seitech-health.log 2>&1
```

---

## Step 13: Post-Deployment Verification

### 13.1 Smoke Tests
```bash
# Test backend API
curl https://api.yourdomain.com/web/database/list

# Test frontend
curl https://yourdomain.com

# Test WebSocket
curl https://socket.yourdomain.com/socket.io/

# Test SSL
curl -I https://yourdomain.com
```

### 13.2 User Acceptance Testing
1. Login as admin
2. Create test course
3. Enroll test student
4. Complete a lesson
5. Post in discussion forum
6. Join a study group
7. Check streak widget
8. Verify leaderboard updates
9. Test real-time notifications
10. Generate certificate

---

## Troubleshooting

### Common Issues

**Odoo won't start**:
```bash
docker-compose logs odoo
# Check PostgreSQL connection
docker-compose exec odoo ping db
```

**Frontend build fails**:
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

**SSL certificate issues**:
```bash
sudo certbot renew --dry-run
sudo certbot certificates
```

**Database connection errors**:
```bash
# Check PostgreSQL status
docker-compose exec db pg_isready -U odoo
# Restart database
docker-compose restart db
```

---

## Maintenance

### Weekly Tasks
- Review error logs
- Check disk space
- Monitor resource usage
- Review security logs

### Monthly Tasks
- Update dependencies
- Review backups
- Security audit
- Performance optimization

### Quarterly Tasks
- Odoo version updates
- Frontend framework updates
- Security penetration testing
- Disaster recovery drill

---

## Support

For deployment issues:
- **Documentation**: `/docs` directory
- **Logs**: `/opt/seitech/logs`
- **GitHub Issues**: https://github.com/retrocraftdevops/seitech/issues

---

**Deployment Complete!** 🎉

Your Seitech E-Learning Platform is now live at:
- Frontend: https://yourdomain.com
- Backend: https://api.yourdomain.com
- WebSocket: https://socket.yourdomain.com
