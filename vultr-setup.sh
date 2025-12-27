#!/bin/bash
#
# Seitech Odoo Setup Script for Vultr (Non-Docker)
# This script sets up Git Sparse Checkout to pull only Odoo-related files
# Usage: bash vultr-setup.sh
#

set -e

echo "=========================================="
echo "Seitech Odoo - Vultr Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ODOO_USER="odoo"
ODOO_HOME="/opt/odoo"
REPO_URL="https://github.com/retrocraftdevops/seitech.git"
BRANCH="main"

echo -e "${YELLOW}Step 1: Creating Odoo directory structure...${NC}"
if [ ! -d "$ODOO_HOME" ]; then
    sudo mkdir -p "$ODOO_HOME"
    sudo chown -R "$ODOO_USER:$ODOO_USER" "$ODOO_HOME"
    echo -e "${GREEN}✓ Created $ODOO_HOME${NC}"
else
    echo -e "${YELLOW}⚠ $ODOO_HOME already exists${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Initializing Git repository with sparse checkout...${NC}"
cd "$ODOO_HOME"

if [ ! -d ".git" ]; then
    # Initialize empty git repo
    sudo -u "$ODOO_USER" git init
    sudo -u "$ODOO_USER" git remote add origin "$REPO_URL"
    echo -e "${GREEN}✓ Git repository initialized${NC}"
else
    echo -e "${YELLOW}⚠ Git repository already exists${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Configuring sparse checkout...${NC}"
sudo -u "$ODOO_USER" git config core.sparseCheckout true

# Create sparse checkout file
SPARSE_FILE=".git/info/sparse-checkout"
sudo -u "$ODOO_USER" mkdir -p "$(dirname $SPARSE_FILE)"

cat > "/tmp/sparse-checkout-temp" << 'EOF'
# Odoo core and custom addons
custom_addons/
odoo-source/

# Configuration files
config/

# Environment files
.env.production
.env.example

# Odoo configuration
odoo.conf
EOF

sudo -u "$ODOO_USER" cp "/tmp/sparse-checkout-temp" "$SPARSE_FILE"
rm "/tmp/sparse-checkout-temp"

echo -e "${GREEN}✓ Sparse checkout configured${NC}"
echo "  Files that will be synced:"
echo "    - custom_addons/"
echo "    - odoo-source/"
echo "    - config/"
echo "    - .env.production"
echo "    - .env.example"
echo ""

echo -e "${YELLOW}Step 4: Fetching from repository...${NC}"
sudo -u "$ODOO_USER" git fetch origin "$BRANCH"
echo -e "${GREEN}✓ Repository fetched${NC}"

echo ""
echo -e "${YELLOW}Step 5: Checking out branch...${NC}"
sudo -u "$ODOO_USER" git checkout "$BRANCH"
echo -e "${GREEN}✓ Checked out $BRANCH${NC}"

echo ""
echo -e "${YELLOW}Step 6: Creating deployment script...${NC}"

cat > "/tmp/deploy-script-temp" << 'EOF'
#!/bin/bash
# Deployment script for Seitech Odoo on Vultr
# Usage: ./deploy.sh

set -e

ODOO_HOME="/opt/odoo"
ODOO_USER="odoo"
ODOO_SERVICE="odoo"

cd "$ODOO_HOME"

echo "=========================================="
echo "Deploying Seitech Odoo"
echo "=========================================="
echo ""

echo "Step 1: Fetching latest changes from GitHub..."
sudo -u "$ODOO_USER" git fetch origin main
echo "✓ Fetched"

echo ""
echo "Step 2: Pulling latest code..."
sudo -u "$ODOO_USER" git pull origin main
echo "✓ Pulled"

echo ""
echo "Step 3: Restarting Odoo service..."
sudo systemctl restart "$ODOO_SERVICE"
echo "✓ Restarted"

echo ""
echo "Deployment complete!"
COMMIT=$(sudo -u "$ODOO_USER" git rev-parse HEAD)
echo "Current commit: $COMMIT"
echo "Timestamp: $(date)" >> /var/log/odoo/deployments.log
EOF

sudo cp "/tmp/deploy-script-temp" "$ODOO_HOME/deploy.sh"
sudo chmod +x "$ODOO_HOME/deploy.sh"
sudo chown "$ODOO_USER:$ODOO_USER" "$ODOO_HOME/deploy.sh"
rm "/tmp/deploy-script-temp"

echo -e "${GREEN}✓ Deployment script created at $ODOO_HOME/deploy.sh${NC}"

echo ""
echo -e "${YELLOW}Step 7: Setting up deployment log directory...${NC}"
sudo mkdir -p /var/log/odoo
sudo touch /var/log/odoo/deployments.log
sudo chown "$ODOO_USER:$ODOO_USER" /var/log/odoo/deployments.log
echo -e "${GREEN}✓ Log directory created${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Current directory contents:"
ls -lah "$ODOO_HOME"
echo ""
echo "Git status:"
cd "$ODOO_HOME" && git status
echo ""
echo "Next steps:"
echo "1. Verify .env.production exists and has correct settings"
echo "2. Start/restart your Odoo service"
echo "3. To deploy future changes, run: $ODOO_HOME/deploy.sh"
echo ""
