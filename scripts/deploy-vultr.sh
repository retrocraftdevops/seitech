#!/bin/bash
set -e

# Seitech Odoo Production Deployment Script for Vultr
# This script deploys Odoo to the Vultr server

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SERVER_IP="45.76.138.109"
SERVER_USER="root"
SERVER_PASSWORD="6,wDD*iQCG6+4A?H"
DEPLOY_DIR="/opt/seitech"
ENV_FILE=".env.production"

# Check for sshpass
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}Installing sshpass for password authentication...${NC}"
    sudo apt-get update -qq && sudo apt-get install -y sshpass 2>/dev/null || {
        echo -e "${RED}Error: sshpass is required for password authentication${NC}"
        echo "Please install: sudo apt-get install -y sshpass"
        exit 1
    }
fi

# SSH functions with password
ssh_cmd() {
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$@"
}

scp_cmd() {
    sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$@"
}

echo -e "${BLUE}========================================"
echo -e "Seitech Odoo Production Deployment"
echo -e "Vultr Server: ${SERVER_IP}"
echo -e "========================================${NC}"
echo ""

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: $ENV_FILE not found!${NC}"
    echo "Please create .env.production with production credentials"
    exit 1
fi

echo -e "${YELLOW}Step 1: Testing SSH connection...${NC}"
if ! ssh_cmd -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_IP} "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${RED}Error: Cannot connect to server${NC}"
    echo "Please ensure:"
    echo "  1. Server is running"
    echo "  2. SSH key is configured or password authentication is enabled"
    echo "  3. Firewall allows SSH (port 22)"
    exit 1
fi
echo -e "${GREEN}✓ SSH connection successful${NC}"
echo ""

echo -e "${YELLOW}Step 2: Preparing server...${NC}"
ssh_cmd ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    set -e
    
    # Update system
    echo "Updating system packages..."
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get upgrade -y -qq
    
    # Install required packages
    echo "Installing Docker and dependencies..."
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        apt-get install -y docker-compose-plugin
    fi
    
    # Install Nginx
    if ! command -v nginx &> /dev/null; then
        apt-get install -y nginx certbot python3-certbot-nginx
    fi
    
    # Install UFW firewall
    if ! command -v ufw &> /dev/null; then
        apt-get install -y ufw
    fi
    
    echo "✓ Server preparation complete"
ENDSSH
echo -e "${GREEN}✓ Server prepared${NC}"
echo ""

echo -e "${YELLOW}Step 3: Stopping and removing old Odoo setup...${NC}"
ssh_cmd ${SERVER_USER}@${SERVER_IP} << ENDSSH
    set -e
    
    # Stop any existing containers
    cd ${DEPLOY_DIR} 2>/dev/null || true
    if [ -f docker-compose.yml ] || [ -f docker-compose.prod.yml ]; then
        docker compose down -v 2>/dev/null || true
        docker-compose down -v 2>/dev/null || true
    fi
    
    # Remove old containers
    docker stop seitech-odoo seitech-postgres 2>/dev/null || true
    docker rm seitech-odoo seitech-postgres 2>/dev/null || true
    
    # Clean up old volumes (optional - uncomment if you want to start fresh)
    # docker volume rm seitech_postgres_data seitech_odoo_data seitech_odoo_logs 2>/dev/null || true
    
    echo "✓ Old setup removed"
ENDSSH
echo -e "${GREEN}✓ Old setup cleaned${NC}"
echo ""

echo -e "${YELLOW}Step 4: Creating deployment directory...${NC}"
ssh_cmd ${SERVER_USER}@${SERVER_IP} << ENDSSH
    set -e
    
    mkdir -p ${DEPLOY_DIR}
    cd ${DEPLOY_DIR}
    mkdir -p config logs data/filestore backups
    echo "✓ Directory structure created"
ENDSSH
echo -e "${GREEN}✓ Directory created${NC}"
echo ""

echo -e "${YELLOW}Step 5: Uploading project files...${NC}"
# Create a temporary tar archive (excluding unnecessary files)
# Follow symlinks to include odoo-source content
tar --exclude='.git' \
    --exclude='node_modules' \
    --exclude='frontend' \
    --exclude='.next' \
    --exclude='data/filestore/*' \
    --exclude='logs/*' \
    --exclude='*.log' \
    -h \
    -czf /tmp/seitech-deploy.tar.gz \
    -C /home/rodrickmakore/projects/seitech \
    .

# Upload archive to home directory (more space)
scp_cmd /tmp/seitech-deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:/root/seitech-deploy.tar.gz

# Extract on server
ssh_cmd ${SERVER_USER}@${SERVER_IP} << ENDSSH
    set -e
    cd ${DEPLOY_DIR}
    tar -xzf /root/seitech-deploy.tar.gz
    rm /root/seitech-deploy.tar.gz
    echo "✓ Files uploaded and extracted"
ENDSSH

rm /tmp/seitech-deploy.tar.gz
echo -e "${GREEN}✓ Files uploaded${NC}"
echo ""

echo -e "${YELLOW}Step 6: Uploading environment file...${NC}"
scp_cmd ${ENV_FILE} ${SERVER_USER}@${SERVER_IP}:${DEPLOY_DIR}/.env
echo -e "${GREEN}✓ Environment file uploaded${NC}"
echo ""

echo -e "${YELLOW}Step 7: Configuring firewall...${NC}"
ssh_cmd ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    set -e
    
    # Configure UFW
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow 22/tcp
    
    # Allow HTTP/HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow Odoo (only from localhost/Nginx)
    # Port 8069 should only be accessible via Nginx
    
    # Enable firewall
    ufw --force enable
    
    echo "✓ Firewall configured"
ENDSSH
echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""

echo -e "${YELLOW}Step 8: Building and starting services...${NC}"
ssh_cmd ${SERVER_USER}@${SERVER_IP} << ENDSSH
    set -e
    cd ${DEPLOY_DIR}
    
    # Remove odoo and enterprise directories if they exist (Docker will mount them)
    # These should be empty or symlinks, but if they're directories from extraction, remove them
    if [ -d odoo ] && [ ! -L odoo ]; then
        echo "Removing odoo directory (will be mounted by Docker)..."
        rm -rf odoo
    fi
    if [ -d enterprise ] && [ ! -L enterprise ]; then
        echo "Removing enterprise directory (will be mounted by Docker)..."
        rm -rf enterprise
    fi
    
    # Create empty directories for Docker to mount
    mkdir -p odoo enterprise
    
    # Load environment variables
    export \$(cat .env | grep -v '^#' | xargs)
    
    # Build and start
    docker compose -f docker-compose.prod.yml --env-file .env up -d --build
    
    echo "✓ Services started"
ENDSSH
echo -e "${GREEN}✓ Services started${NC}"
echo ""

echo -e "${YELLOW}Step 9: Waiting for services to be ready...${NC}"
sleep 10
for i in {1..30}; do
    if ssh_cmd ${SERVER_USER}@${SERVER_IP} "curl -f http://localhost:8069/web/health" 2>/dev/null; then
        echo -e "${GREEN}✓ Odoo is ready!${NC}"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 5
done
echo ""

echo -e "${YELLOW}Step 10: Setting up Nginx reverse proxy...${NC}"
# Upload Nginx config
scp_cmd scripts/nginx-odoo.conf ${SERVER_USER}@${SERVER_IP}:/tmp/nginx-odoo.conf
ssh_cmd ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    set -e
    
    # Backup existing config
    if [ -f /etc/nginx/sites-available/odoo ]; then
        mv /etc/nginx/sites-available/odoo /etc/nginx/sites-available/odoo.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Copy new config
    cp /tmp/nginx-odoo.conf /etc/nginx/sites-available/odoo
    rm /tmp/nginx-odoo.conf
    
    # Enable site
    ln -sf /etc/nginx/sites-available/odoo /etc/nginx/sites-enabled/
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload
    nginx -t && systemctl reload nginx
    
    echo "✓ Nginx configured"
ENDSSH
echo -e "${GREEN}✓ Nginx configured${NC}"
echo ""

echo -e "${BLUE}========================================"
echo -e "Deployment Complete!"
echo -e "========================================${NC}"
echo ""
echo -e "${GREEN}Server Information:${NC}"
echo "  IP Address: ${SERVER_IP}"
echo "  Odoo Direct: http://${SERVER_IP}:8069"
echo "  Nginx Proxy: http://${SERVER_IP}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Configure DNS to point to ${SERVER_IP}"
echo "  2. Run SSL certificate setup:"
echo "     ssh ${SERVER_USER}@${SERVER_IP} 'certbot --nginx -d api.seitechinternational.org.uk'"
echo "  3. Install Odoo modules via web interface"
echo "  4. Update frontend .env with API URL"
echo ""
echo -e "${BLUE}Access URLs (after DNS setup):${NC}"
echo "  API: https://api.seitechinternational.org.uk"
echo "  Web: http://${SERVER_IP}:8069 (direct, before DNS)"
echo ""

