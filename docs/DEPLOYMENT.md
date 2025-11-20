# 🚀 HabitFlow Production Deployment Guide

This comprehensive guide covers deploying HabitFlow to production environments with best practices for security, performance, monitoring, and scalability.

## 📋 Table of Contents

- [Overview](#-overview)
- [Prerequisites](#-prerequisites)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Application Deployment](#-application-deployment)
- [Web Server Configuration](#-web-server-configuration)
- [SSL/TLS Configuration](#-ssltls-configuration)
- [Monitoring & Logging](#-monitoring--logging)
- [Performance Optimization](#-performance-optimization)
- [Security Hardening](#-security-hardening)
- [Backup Strategy](#-backup-strategy)
- [Troubleshooting](#-troubleshooting)

## 🎯 Overview

HabitFlow production deployment consists of:

- **Django API**: Gunicorn WSGI server with multiple workers
- **React Frontend**: Static files served by Nginx or CDN
- **Database**: PostgreSQL 15+ with connection pooling
- **Cache**: Redis for sessions, rate limiting, and Celery
- **Reverse Proxy**: Nginx for SSL termination and static files
- **Process Management**: Supervisor or systemd
- **Monitoring**: Application logs, health checks, metrics

### Architecture Diagram
```
[Users] → [Load Balancer] → [Nginx] → [Gunicorn] → [Django API]
                              ↓              ↓
                         [Static Files]  [PostgreSQL]
                                            ↓
                                        [Redis Cache]
                                            ↓
                                     [Celery Workers]
```

## 🔧 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ LTS or CentOS 8+
- **RAM**: Minimum 2GB (4GB+ recommended)
- **Storage**: 20GB+ SSD
- **CPU**: 2+ cores recommended
- **Network**: Public IP with domains configured

### Required Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    postgresql-15 \
    redis-server \
    nginx \
    supervisor \
    git \
    curl \
    certbot \
    python3-certbot-nginx

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

## ⚙️ Environment Configuration

### 1. Create Application User
```bash
# Create dedicated user for the application
sudo useradd --system --shell /bin/bash --home /opt/habitflow habitflow
sudo mkdir -p /opt/habitflow
sudo chown habitflow:habitflow /opt/habitflow
```

### 2. Clone and Setup Application
```bash
# Switch to application user
sudo -u habitflow -i

# Clone repository
cd /opt/habitflow
git clone https://github.com/MSCRAFI/habitflow.git app
cd app

# Setup Python environment
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install poetry
poetry install --only=main
```

### 3. Environment Variables
```bash
# Create production environment file
sudo -u habitflow tee /opt/habitflow/app/backend/.env.production << 'EOF'
# Django Core Settings
DEBUG=False
SECRET_KEY=your-super-secret-key-here-use-python-secrets-module
ALLOWED_HOSTS=habitflow.scrafi.dev,www.habitflow.scrafi.dev
CORS_ALLOWED_ORIGINS=https://habitflow.scrafi.dev,https://www.habitflow.scrafi.dev

# Database Configuration
DATABASE_URL=postgresql://habitflow_user:secure_password@localhost:5432/habitflow_db
CONN_MAX_AGE=600

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
CACHE_URL=redis://localhost:6379/1

# Email Configuration (for notifications)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-app@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Media and Static Files
MEDIA_URL=/media/
STATIC_URL=/static/
USE_S3=False  # Set to True for AWS S3

# AWS S3 Configuration (if using)
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
# AWS_STORAGE_BUCKET_NAME=your-bucket
# AWS_S3_REGION_NAME=us-east-1

# Security Headers
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SECURE_CONTENT_TYPE_NOSNIFF=True
SECURE_BROWSER_XSS_FILTER=True

# Logging
LOG_LEVEL=INFO
SENTRY_DSN=  # Add Sentry DSN for error monitoring

# Performance
GUNICORN_WORKERS=4
GUNICORN_MAX_REQUESTS=1000
GUNICORN_TIMEOUT=30
EOF

# Secure the environment file
sudo chmod 600 /opt/habitflow/app/backend/.env.production
```

## 🗃️ Database Setup

### 1. PostgreSQL Configuration
```bash
# Switch to postgres user
sudo -u postgres -i

# Create database and user
createdb habitflow_db
createuser habitflow_user
psql -c "ALTER USER habitflow_user WITH PASSWORD 'secure_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE habitflow_db TO habitflow_user;"
psql -c "ALTER USER habitflow_user CREATEDB;"

# Exit postgres user
exit
```

### 2. Database Security
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/15/main/postgresql.conf

# Key settings:
# listen_addresses = 'localhost'
# max_connections = 100
# shared_buffers = 256MB
# effective_cache_size = 1GB

sudo nano /etc/postgresql/15/main/pg_hba.conf

# Ensure local connections use md5:
# local   all             all                                     md5
# host    all             all             127.0.0.1/32            md5

# Restart PostgreSQL
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

### 3. Redis Configuration
```bash
# Configure Redis
sudo nano /etc/redis/redis.conf

# Key settings:
# bind 127.0.0.1
# protected-mode yes
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

## 🚀 Application Deployment

### 1. Database Migration
```bash
# Switch to application user
sudo -u habitflow -i
cd /opt/habitflow/app/backend
source ../venv/bin/activate

# Set environment
export DJANGO_SETTINGS_MODULE=core.settings.production

# Run migrations
python manage.py migrate
python manage.py collectstatic --noinput

# Create superuser (optional)
python manage.py createsuperuser

# Load initial data (if any)
python manage.py loaddata fixtures/initial_data.json
```

### 2. Build Frontend
```bash
# Build React frontend
cd /opt/habitflow/app/frontend

# Install dependencies
npm ci --production

# Build for production
npm run build

# Move built files to serve location
sudo mkdir -p /var/www/habitflow
sudo cp -r build/* /var/www/habitflow/
sudo chown -R www-data:www-data /var/www/habitflow
```

### 3. Gunicorn Configuration
```bash
# Create Gunicorn configuration
sudo -u habitflow tee /opt/habitflow/app/backend/gunicorn.conf.py << 'EOF'
import multiprocessing
import os

# Server socket
bind = "127.0.0.1:8000"
backlog = 2048

# Worker processes
workers = int(os.getenv('GUNICORN_WORKERS', multiprocessing.cpu_count() * 2 + 1))
worker_class = "sync"
worker_connections = 1000
timeout = int(os.getenv('GUNICORN_TIMEOUT', 30))
keepalive = 2
max_requests = int(os.getenv('GUNICORN_MAX_REQUESTS', 1000))
max_requests_jitter = 100

# Logging
accesslog = "/var/log/habitflow/gunicorn-access.log"
errorlog = "/var/log/habitflow/gunicorn-error.log"
loglevel = "info"

# Process naming
proc_name = "habitflow-api"

# Security
limit_request_line = 4096
limit_request_fields = 100
limit_request_field_size = 8190

# Preload application
preload_app = True

# Enable hot reload in development only
reload = False
EOF
```

## 🌐 Web Server Configuration

### 1. Nginx Configuration
```bash
# Create Nginx site configuration
sudo tee /etc/nginx/sites-available/habitflow << 'EOF'
upstream habitflow_api {
    server 127.0.0.1:8000 fail_timeout=0;
}

server {
    listen 80;
    server_name habitflow.scrafi.dev www.habitflow.scrafi.dev;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name habitflow.scrafi.dev www.habitflow.scrafi.dev;

    # SSL configuration (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/habitflow.scrafi.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/habitflow.scrafi.dev/privkey.pem;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; media-src 'self'; object-src 'none'; frame-ancestors 'none';" always;

    # Root directory
    root /var/www/habitflow;
    index index.html;

    # Max file upload size
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/javascript
        application/json
        application/rss+xml
        application/xml
        image/svg+xml
        text/css
        text/javascript
        text/plain
        text/xml;

    # API endpoints
    location /api/ {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_redirect off;
        proxy_pass http://habitflow_api;
        
        # Timeout settings
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Admin interface
    location /admin/ {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_redirect off;
        proxy_pass http://habitflow_api;
    }

    # Django static files
    location /static/ {
        alias /opt/habitflow/app/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # User uploaded media
    location /media/ {
        alias /opt/habitflow/app/backend/media/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # React app - serve all other routes
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }

    # Health check endpoint
    location /health/ {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/habitflow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL/TLS Configuration

### 1. Obtain SSL Certificates
```bash
# Install SSL certificate using Certbot
sudo certbot --nginx -d habitflow.scrafi.dev -d www.habitflow.scrafi.dev

# Test automatic renewal
sudo certbot renew --dry-run

# Setup automatic renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## 📊 Monitoring & Logging

### 1. Log Directory Setup
```bash
# Create log directories
sudo mkdir -p /var/log/habitflow
sudo chown habitflow:habitflow /var/log/habitflow
```

### 2. Supervisor Configuration
```bash
# Create supervisor configuration for Gunicorn
sudo tee /etc/supervisor/conf.d/habitflow-api.conf << 'EOF'
[program:habitflow-api]
command=/opt/habitflow/venv/bin/gunicorn --config /opt/habitflow/app/backend/gunicorn.conf.py core.wsgi:application
directory=/opt/habitflow/app/backend
user=habitflow
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/habitflow/gunicorn-supervisor.log
environment=DJANGO_SETTINGS_MODULE=core.settings.production,PATH=/opt/habitflow/venv/bin:%(ENV_PATH)s
EOF

# Create supervisor configuration for Celery worker
sudo tee /etc/supervisor/conf.d/habitflow-celery.conf << 'EOF'
[program:habitflow-celery]
command=/opt/habitflow/venv/bin/celery -A core worker -l info
directory=/opt/habitflow/app/backend
user=habitflow
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/habitflow/celery.log
environment=DJANGO_SETTINGS_MODULE=core.settings.production,PATH=/opt/habitflow/venv/bin:%(ENV_PATH)s
EOF

# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start habitflow-api
sudo supervisorctl start habitflow-celery
```

### 3. Log Rotation
```bash
# Configure log rotation
sudo tee /etc/logrotate.d/habitflow << 'EOF'
/var/log/habitflow/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 habitflow habitflow
    postrotate
        supervisorctl restart habitflow-api
        supervisorctl restart habitflow-celery
    endscript
}
EOF
```

## ⚡ Performance Optimization

### 1. Database Optimization
```bash
# PostgreSQL performance tuning
sudo tee -a /etc/postgresql/15/main/postgresql.conf << 'EOF'

# Performance tuning
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
max_worker_processes = 4
max_parallel_workers_per_gather = 2
max_parallel_workers = 4
EOF

sudo systemctl restart postgresql
```

### 2. Redis Optimization
```bash
# Redis performance settings
sudo tee -a /etc/redis/redis.conf << 'EOF'

# Performance settings
maxmemory 512mb
maxmemory-policy allkeys-lru
tcp-keepalive 300
timeout 0
tcp-backlog 511

# Persistence (disable for cache-only usage)
save ""
EOF

sudo systemctl restart redis-server
```

### 3. Application Performance
```python
# Add to Django settings (core/settings/production.py)

# Database connection pooling
DATABASES['default']['OPTIONS'] = {
    'MAX_CONNS': 20,
    'OPTIONS': {
        'MAX_CONNS': 20
    }
}

# Cache configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 20,
                'retry_on_timeout': True,
            }
        },
        'KEY_PREFIX': 'habitflow',
        'TIMEOUT': 300,
    }
}

# Session configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
SESSION_COOKIE_AGE = 86400  # 1 day
```

## 🛡️ Security Hardening

### 1. Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2ban Setup
```bash
# Install and configure Fail2ban
sudo apt install fail2ban

sudo tee /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. System Updates
```bash
# Setup automatic security updates
sudo apt install unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot "true";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades
```

## 💾 Backup Strategy

### 1. Database Backup Script
```bash
# Create backup script
sudo -u habitflow tee /opt/habitflow/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/habitflow/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="habitflow_db"
DB_USER="habitflow_user"

mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Media files backup (if not using S3)
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz -C /opt/habitflow/app/backend media/

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

sudo chmod +x /opt/habitflow/backup.sh

# Setup daily backup cron job
echo "0 2 * * * /opt/habitflow/backup.sh" | sudo -u habitflow crontab -
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. 502 Bad Gateway Error
```bash
# Check Gunicorn status
sudo supervisorctl status habitflow-api

# Check Gunicorn logs
sudo tail -f /var/log/habitflow/gunicorn-error.log

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo supervisorctl restart habitflow-api
sudo systemctl restart nginx
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connectivity
sudo -u habitflow psql -h localhost -U habitflow_user -d habitflow_db -c "SELECT 1;"

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### 3. High Memory Usage
```bash
# Check memory usage
free -h
sudo htop

# Check application processes
ps aux | grep gunicorn
ps aux | grep celery

# Adjust Gunicorn worker count
# Edit /opt/habitflow/app/backend/gunicorn.conf.py
# Restart: sudo supervisorctl restart habitflow-api
```

#### 4. Slow Response Times
```bash
# Check database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Enable query logging in PostgreSQL
echo "log_statement = 'all'" | sudo tee -a /etc/postgresql/15/main/postgresql.conf
sudo systemctl restart postgresql

# Check Redis performance
redis-cli info stats
redis-cli slowlog get 10
```

### Health Check Script
```bash
# Create health check script
sudo tee /opt/habitflow/health_check.sh << 'EOF'
#!/bin/bash

# Check API health
if curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
    echo "✓ API is healthy"
else
    echo "✗ API is down"
    exit 1
fi

# Check database
if sudo -u habitflow psql -h localhost -U habitflow_user -d habitflow_db -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✓ Database is healthy"
else
    echo "✗ Database is down"
    exit 1
fi

# Check Redis
if redis-cli ping > /dev/null 2>&1; then
    echo "✓ Redis is healthy"
else
    echo "✗ Redis is down"
    exit 1
fi

echo "All services are healthy!"
EOF

sudo chmod +x /opt/habitflow/health_check.sh

# Run health check
/opt/habitflow/health_check.sh
```

---

## 🎉 Deployment Complete!

Your HabitFlow application should now be running in production! 

### Final Checklist:
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall configured and enabled
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented
- [ ] Health checks passing
- [ ] Performance optimization applied
- [ ] Security hardening completed

### Access Points:
- **Application**: https://habitflow.scrafi.dev
- **API Documentation**: https://habitflow.scrafi.dev/api/schema/swagger-ui/
- **Admin Panel**: https://habitflow.scrafi.dev/admin/

For ongoing maintenance and monitoring, check the logs regularly and ensure all services are running optimally. Set up alerts for critical issues and monitor application performance metrics.
