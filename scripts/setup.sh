#!/bin/bash
#
# Seitech Odoo Setup Script
# Initial setup for development environment
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================"
echo -e "Seitech Odoo Development Setup"
echo -e "========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Docker installed"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Docker Compose installed"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL client not found. Please install postgresql-client.${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} PostgreSQL client installed"

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo -e "${RED}PostgreSQL is not running on localhost:5432${NC}"
    echo -e "Start PostgreSQL with: ${YELLOW}sudo systemctl start postgresql${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} PostgreSQL is running"

echo ""

# Create directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p "$PROJECT_DIR"/{config,logs,data/filestore,backups}
echo -e "  ${GREEN}✓${NC} Directories created"

# Copy .env if it doesn't exist
if [ ! -f "$PROJECT_DIR/.env" ]; then
    cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
    echo -e "  ${GREEN}✓${NC} Created .env from .env.example"
else
    echo -e "  ${YELLOW}⚠${NC} .env already exists, skipping"
fi

# Check for Odoo source
echo ""
echo -e "${YELLOW}Checking Odoo source...${NC}"

if [ -d "$PROJECT_DIR/odoo" ] && [ -f "$PROJECT_DIR/odoo/odoo-bin" ]; then
    echo -e "  ${GREEN}✓${NC} Odoo source found"
else
    echo -e "  ${YELLOW}⚠${NC} Odoo source not found at $PROJECT_DIR/odoo"
    echo -e "     Please copy or symlink Odoo 19.0 source to: ${YELLOW}$PROJECT_DIR/odoo${NC}"
fi

if [ -d "$PROJECT_DIR/enterprise" ]; then
    echo -e "  ${GREEN}✓${NC} Enterprise addons found"
else
    echo -e "  ${YELLOW}⚠${NC} Enterprise addons not found at $PROJECT_DIR/enterprise"
    echo -e "     Please copy or symlink Enterprise addons to: ${YELLOW}$PROJECT_DIR/enterprise${NC}"
fi

# Check custom addons
echo ""
echo -e "${YELLOW}Checking custom addons...${NC}"
for module in seitech_base seitech_website_theme seitech_elearning; do
    if [ -d "$PROJECT_DIR/custom_addons/$module" ]; then
        echo -e "  ${GREEN}✓${NC} $module"
    else
        echo -e "  ${RED}✗${NC} $module not found"
    fi
done

# Setup PostgreSQL user if needed
echo ""
echo -e "${YELLOW}PostgreSQL Setup${NC}"
echo -e "To create the Odoo database user, run:"
echo -e "  ${YELLOW}sudo -u postgres createuser -s odoo${NC}"
echo -e "  ${YELLOW}sudo -u postgres psql -c \"ALTER USER odoo PASSWORD 'odoo';\"${NC}"
echo ""
echo -e "To create the database:"
echo -e "  ${YELLOW}sudo -u postgres createdb -O odoo seitech${NC}"

echo ""
echo -e "${GREEN}========================================"
echo -e "Setup Complete!"
echo -e "========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "1. Ensure Odoo source is at: ${YELLOW}$PROJECT_DIR/odoo${NC}"
echo -e "2. Create database user: ${YELLOW}sudo -u postgres createuser -s odoo${NC}"
echo -e "3. Build Docker image: ${YELLOW}docker-compose build${NC}"
echo -e "4. Start Odoo: ${YELLOW}docker-compose up -d${NC}"
echo -e "5. View logs: ${YELLOW}docker-compose logs -f${NC}"
echo ""
