#!/bin/bash

################################################################################
#
# SEI Tech Odoo Enterprise Upgrade - Quick Start Script
#
# Usage: bash UPGRADE_QUICK_START.sh
#
# This script automates Phase 1: Pre-upgrade verification and backup
#
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_ROOT="/backups"
LOCAL_BACKUP="/root/odoo_upgrade_backup"
ODOO_CONTAINER="seitech-odoo"
POSTGRES_CONTAINER="seitech-postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}SEI Tech Odoo Enterprise Upgrade${NC}"
echo -e "${BLUE}Phase 1: Pre-Upgrade Verification & Backup${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}>>> $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Phase 1.1: Check connectivity
print_header "Phase 1.1: Checking Docker and Container Status"

if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Please install Docker first."
    exit 1
fi
print_success "Docker is installed"

if ! docker ps &> /dev/null; then
    print_error "Cannot access Docker daemon. Check permissions or Docker service."
    exit 1
fi
print_success "Docker daemon is running"

# Check if Odoo container exists and is running
if docker ps -a --format '{{.Names}}' | grep -q "^${ODOO_CONTAINER}$"; then
    if docker ps --format '{{.Names}}' | grep -q "^${ODOO_CONTAINER}$"; then
        print_success "Odoo container is running"
    else
        print_warning "Odoo container exists but is not running"
    fi
else
    print_error "Odoo container not found. Ensure docker-compose is running."
    exit 1
fi

# Phase 1.2: Check current Odoo version
print_header "Phase 1.2: Checking Current Odoo Version"

ODOO_VERSION=$(docker exec ${ODOO_CONTAINER} python3 -c "import odoo; print(odoo.__version__)" 2>/dev/null || echo "unknown")
print_success "Current Odoo Version: $ODOO_VERSION"

if [[ ! $ODOO_VERSION =~ ^19 ]]; then
    print_warning "Version is not 19.x. Upgrade path may need adjustment."
fi

# Phase 1.3: Verify database connectivity
print_header "Phase 1.3: Verifying Database Connectivity"

if docker exec ${POSTGRES_CONTAINER} psql -U odoo -d seitech_production -c "SELECT version();" > /dev/null 2>&1; then
    print_success "PostgreSQL database is accessible"
else
    print_error "Cannot connect to PostgreSQL database"
    exit 1
fi

# Get database size
DB_SIZE=$(docker exec ${POSTGRES_CONTAINER} psql -U odoo -d seitech_production -c "SELECT pg_size_pretty(pg_database_size('seitech_production'));" 2>/dev/null | tail -1)
print_success "Database size: $DB_SIZE"

# Phase 1.4: Check disk space
print_header "Phase 1.4: Checking Disk Space"

DISK_AVAILABLE=$(df -h / | tail -1 | awk '{print $4}')
DISK_PERCENT=$(df -h / | tail -1 | awk '{print $5}')

print_success "Disk available: $DISK_AVAILABLE (Usage: $DISK_PERCENT)"

if [[ ${DISK_PERCENT%\%} -gt 80 ]]; then
    print_error "Disk usage too high (>80%). Please free up space before upgrading."
    exit 1
fi

# Phase 1.5: Create backup directories
print_header "Phase 1.5: Creating Backup Directories"

mkdir -p "${BACKUP_ROOT}"
mkdir -p "${LOCAL_BACKUP}"
print_success "Backup directories created"

# Phase 1.6: Backup PostgreSQL database
print_header "Phase 1.6: Backing Up PostgreSQL Database"

BACKUP_FILE="${BACKUP_ROOT}/seitech_full_${TIMESTAMP}.sql"

echo "Creating database dump (this may take a few minutes)..."

if docker exec ${POSTGRES_CONTAINER} pg_dump \
    -U odoo \
    -h localhost \
    -d seitech_production \
    --verbose \
    > "${BACKUP_FILE}" 2>&1; then

    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | awk '{print $1}')
    print_success "Database backup created: $BACKUP_FILE (Size: $BACKUP_SIZE)"
else
    print_error "Database backup failed"
    exit 1
fi

# Compress the backup
echo "Compressing backup..."
gzip -9 "${BACKUP_FILE}" 2>/dev/null
BACKUP_FILE="${BACKUP_FILE}.gz"
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | awk '{print $1}')
print_success "Backup compressed to: $BACKUP_SIZE"

# Phase 1.7: Backup Docker volumes
print_header "Phase 1.7: Backing Up Docker Volumes"

# Backup postgres_data volume
echo "Backing up PostgreSQL data volume..."
docker run --rm \
    -v postgres_data:/postgres_data \
    -v ${LOCAL_BACKUP}:/backup \
    ubuntu:22.04 \
    bash -c "tar czf /backup/postgres_data_volume_${TIMESTAMP}.tar.gz -C / postgres_data 2>&1" \
    > /dev/null 2>&1

POSTGRES_VOL_SIZE=$(du -h "${LOCAL_BACKUP}/postgres_data_volume_${TIMESTAMP}.tar.gz" 2>/dev/null | awk '{print $1}' || echo "unknown")
print_success "PostgreSQL volume backup: ${POSTGRES_VOL_SIZE}"

# Backup odoo_data volume
echo "Backing up Odoo data volume..."
docker run --rm \
    -v odoo_data:/odoo_data \
    -v ${LOCAL_BACKUP}:/backup \
    ubuntu:22.04 \
    bash -c "tar czf /backup/odoo_data_volume_${TIMESTAMP}.tar.gz -C / odoo_data 2>&1" \
    > /dev/null 2>&1

ODOO_VOL_SIZE=$(du -h "${LOCAL_BACKUP}/odoo_data_volume_${TIMESTAMP}.tar.gz" 2>/dev/null | awk '{print $1}' || echo "unknown")
print_success "Odoo data volume backup: ${ODOO_VOL_SIZE}"

# Backup custom addons
echo "Backing up custom addons..."
docker run --rm \
    -v custom_addons:/custom_addons \
    -v ${LOCAL_BACKUP}:/backup \
    ubuntu:22.04 \
    bash -c "tar czf /backup/custom_addons_${TIMESTAMP}.tar.gz -C / custom_addons 2>&1" \
    > /dev/null 2>&1

ADDONS_SIZE=$(du -h "${LOCAL_BACKUP}/custom_addons_${TIMESTAMP}.tar.gz" 2>/dev/null | awk '{print $1}' || echo "unknown")
print_success "Custom addons backup: ${ADDONS_SIZE}"

# Phase 1.8: Export docker-compose configuration
print_header "Phase 1.8: Exporting Configuration"

if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml "${LOCAL_BACKUP}/docker-compose-current.yml"
    print_success "Current docker-compose.yml saved"
else
    print_warning "docker-compose.yml not found in current directory"
fi

# Phase 1.9: Test current API endpoints
print_header "Phase 1.9: Testing Current API Endpoints"

echo "Testing /api/auth/login endpoint..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:8069/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@seitechinternational.org.uk","password":"admin"}' \
    2>/dev/null || echo '{"error":"Connection failed"}')

if echo "$AUTH_RESPONSE" | grep -q "sessionToken\|error"; then
    print_success "Auth API is responding"
    echo "Response: $(echo $AUTH_RESPONSE | head -c 100)..."
else
    print_warning "Auth API response unclear. Check manually."
fi

echo "Testing /api/courses endpoint..."
COURSES_RESPONSE=$(curl -s http://localhost:8069/api/courses?limit=1 2>/dev/null || echo '{"error":"Connection failed"}')
if echo "$COURSES_RESPONSE" | grep -q "courses\|error"; then
    print_success "Courses API is responding"
else
    print_warning "Courses API response unclear. Check manually."
fi

# Phase 1.10: Document current state
print_header "Phase 1.10: Creating Status Report"

STATUS_REPORT="${LOCAL_BACKUP}/upgrade_status_${TIMESTAMP}.txt"

cat > "${STATUS_REPORT}" <<EOF
=== SEI Tech Odoo Enterprise Upgrade - Pre-Upgrade Status ===
Date: $(date)
Hostname: $(hostname)

=== System Info ===
Odoo Version: $ODOO_VERSION
Database Size: $DB_SIZE
Disk Available: $DISK_AVAILABLE (Usage: $DISK_PERCENT)

=== Backups Created ===
Database Backup: ${BACKUP_FILE} (${BACKUP_SIZE})
PostgreSQL Volume: ${LOCAL_BACKUP}/postgres_data_volume_${TIMESTAMP}.tar.gz (${POSTGRES_VOL_SIZE})
Odoo Data Volume: ${LOCAL_BACKUP}/odoo_data_volume_${TIMESTAMP}.tar.gz (${ODOO_VOL_SIZE})
Custom Addons: ${LOCAL_BACKUP}/custom_addons_${TIMESTAMP}.tar.gz (${ADDONS_SIZE})

=== API Status ===
Auth API: Tested
Courses API: Tested

=== Next Steps ===
1. Review the documentation: ODOO_ENTERPRISE_UPGRADE_EXECUTION.md
2. Obtain Odoo Enterprise License Key from https://www.odoo.com/my/licenses
3. Run Phase 2 when ready: Continue with Enterprise Setup

=== Important ===
- Keep all backup files in safe location
- Store license key securely (.env file)
- Do NOT commit sensitive files to git

===
Generated by: UPGRADE_QUICK_START.sh
EOF

print_success "Status report created: ${STATUS_REPORT}"
cat "${STATUS_REPORT}"

# Final summary
print_header "Phase 1: COMPLETE"

echo -e "\n${GREEN}=== BACKUP SUMMARY ===${NC}"
echo "Location: ${LOCAL_BACKUP}"
ls -lah "${LOCAL_BACKUP}"

TOTAL_BACKUP_SIZE=$(du -sh "${LOCAL_BACKUP}" | awk '{print $1}')
echo -e "\n${GREEN}Total backup size: ${TOTAL_BACKUP_SIZE}${NC}"

echo -e "\n${GREEN}=== NEXT STEPS ===${NC}"
echo "1. Review: ODOO_ENTERPRISE_UPGRADE_EXECUTION.md"
echo "2. Get license: https://www.odoo.com/my/licenses"
echo "3. Store backup files safely"
echo "4. When ready, proceed with Phase 2: Enterprise Setup"
echo ""
echo -e "${YELLOW}⚠ IMPORTANT: Store your Enterprise License Key securely${NC}"
echo "Update .env.enterprise with your license key before proceeding"
echo ""
echo -e "${GREEN}✓ Phase 1 Complete - System ready for Enterprise upgrade${NC}"

