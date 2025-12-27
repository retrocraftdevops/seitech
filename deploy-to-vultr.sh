#!/bin/bash
#
# Local deployment script for Seitech Odoo on Vultr
# This script pushes changes to GitHub and triggers deployment on Vultr
# Usage: ./deploy-to-vultr.sh "Your commit message"
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
VULTR_HOST="45.76.138.109"
VULTR_USER="root"
ODOO_HOME="/opt/odoo"

# Check if commit message provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Commit message required${NC}"
    echo "Usage: ./deploy-to-vultr.sh \"Your commit message\""
    exit 1
fi

COMMIT_MSG="$1"

echo -e "${BLUE}=========================================="
echo "Seitech Odoo - Deployment to Vultr"
echo "==========================================${NC}"
echo ""

# Check git status
echo -e "${YELLOW}Step 1: Checking git status...${NC}"
if git diff-index --quiet HEAD --; then
    echo -e "${RED}✗ No changes to commit${NC}"
    exit 0
fi

CHANGED_FILES=$(git diff --name-only HEAD)
echo -e "${GREEN}✓ Changes found:${NC}"
echo "$CHANGED_FILES" | sed 's/^/  /'
echo ""

# Commit changes
echo -e "${YELLOW}Step 2: Committing changes to GitHub...${NC}"
git add -A
git commit -m "$COMMIT_MSG"
echo -e "${GREEN}✓ Committed${NC}"

# Push to GitHub
echo ""
echo -e "${YELLOW}Step 3: Pushing to GitHub...${NC}"
git push origin main
echo -e "${GREEN}✓ Pushed to GitHub${NC}"

# Deploy on Vultr
echo ""
echo -e "${YELLOW}Step 4: Deploying on Vultr...${NC}"
ssh "$VULTR_USER@$VULTR_HOST" "bash $ODOO_HOME/deploy.sh"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo "✓ Deployment Successful!"
    echo "==========================================${NC}"
    echo ""
    echo "Deployment Summary:"
    echo "  Server: $VULTR_HOST"
    echo "  Location: $ODOO_HOME"
    echo "  Branch: main"
    echo "  GitHub: https://github.com/retrocraftdevops/seitech"
    echo ""
    echo "To check deployment status:"
    echo "  ssh $VULTR_USER@$VULTR_HOST"
    echo "  systemctl status odoo"
    echo ""
else
    echo -e "${RED}✗ Deployment failed!${NC}"
    exit 1
fi
