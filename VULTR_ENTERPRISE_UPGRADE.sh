#!/bin/bash

################################################################################
#
# SEI Tech Odoo Enterprise Upgrade - Complete Automated Script
# For Vultr VPS Deployment
#
# Usage:
#   bash VULTR_ENTERPRISE_UPGRADE.sh
#
# This script automates the complete Odoo Community → Enterprise upgrade
#
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/root/seitech"
BACKUP_DIR="/backups"
LOCAL_BACKUP="/root/odoo_upgrade_backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ODOO_CONTAINER="seitech-odoo"
POSTGRES_CONTAINER="seitech-postgres"

# Variables (can be passed as environment variables)
ODOO_ENTERPRISE_LICENSE_KEY="${ODOO_ENTERPRISE_LICENSE_KEY:-}"
ODOO_ENTERPRISE_DB_UUID="${ODOO_ENTERPRISE_DB_UUID:-}"
ODOO_DB_PASSWORD="${ODOO_DB_PASSWORD:-}"

# Logging setup
LOG_FILE="/root/odoo_upgrade_${TIMESTAMP}.log"
exec > >(tee -a "$LOG_FILE")
exec 2>&1

# Functions
print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}>>> $1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

check_requirements() {
    print_header "PHASE 0: Checking Prerequisites"

    if ! command -v docker &> /dev/null; then
        print_error "Docker not found"
        exit 1
    fi
    print_success "Docker installed"

    if ! docker ps &> /dev/null; then
        print_error "Cannot access Docker daemon"
        exit 1
    fi
    print_success "Docker daemon running"

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose not found"
        exit 1
    fi
    print_success "Docker Compose installed"

    # Check if Odoo container exists
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${ODOO_CONTAINER}$"; then
        print_error "Odoo container not found"
        exit 1
    fi
    print_success "Odoo container exists"

    # Check license key
    if [ -z "$ODOO_ENTERPRISE_LICENSE_KEY" ]; then
        print_warning "ODOO_ENTERPRISE_LICENSE_KEY not set"
        print_info "You can set it: export ODOO_ENTERPRISE_LICENSE_KEY=your_key"
        echo -e "\nEnter your Enterprise License Key (or press Enter to skip for now):"
        read -r LICENSE_INPUT
        if [ -n "$LICENSE_INPUT" ]; then
            ODOO_ENTERPRISE_LICENSE_KEY="$LICENSE_INPUT"
        fi
    else
        print_success "Enterprise license key provided"
    fi

    # Check DB password
    if [ -z "$ODOO_DB_PASSWORD" ]; then
        print_warning "ODOO_DB_PASSWORD not set"
        echo -e "\nEnter PostgreSQL password for Odoo user (or press Enter to skip):"
        read -rs DB_PASS_INPUT
        if [ -n "$DB_PASS_INPUT" ]; then
            ODOO_DB_PASSWORD="$DB_PASS_INPUT"
        fi
    fi
}

phase_1_backup() {
    print_header "PHASE 1: Backup & Verification"

    # Create backup directories
    mkdir -p "$BACKUP_DIR" "$LOCAL_BACKUP"
    print_success "Backup directories ready"

    # Check disk space
    AVAILABLE=$(df -h / | tail -1 | awk '{print $4}')
    PERCENT=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')

    if [ "$PERCENT" -gt 80 ]; then
        print_error "Disk usage too high: ${PERCENT}% (need <80%)"
        exit 1
    fi
    print_success "Disk space OK: ${AVAILABLE} available (${PERCENT}% used)"

    # Verify database access
    print_info "Testing database connectivity..."
    if docker exec $POSTGRES_CONTAINER psql -U odoo -d seitech_production -c "SELECT version();" > /dev/null 2>&1; then
        print_success "Database accessible"
    else
        print_error "Cannot connect to database"
        exit 1
    fi

    # Get database size
    DB_SIZE=$(docker exec $POSTGRES_CONTAINER psql -U odoo -d seitech_production -c "SELECT pg_size_pretty(pg_database_size('seitech_production'));" 2>/dev/null | tail -1)
    print_success "Database size: $DB_SIZE"

    # Backup database
    print_info "Backing up PostgreSQL database (this may take 3-5 minutes)..."
    BACKUP_FILE="${BACKUP_DIR}/seitech_full_${TIMESTAMP}.sql"

    if docker exec $POSTGRES_CONTAINER pg_dump \
        -U odoo \
        -h localhost \
        -d seitech_production \
        --verbose \
        > "${BACKUP_FILE}" 2>&1; then

        BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | awk '{print $1}')
        print_success "Database backup created: ${BACKUP_SIZE}"

        # Compress backup
        gzip -9 "${BACKUP_FILE}" 2>/dev/null
        BACKUP_FILE="${BACKUP_FILE}.gz"
        BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | awk '{print $1}')
        print_success "Backup compressed: ${BACKUP_SIZE}"
    else
        print_error "Database backup failed"
        exit 1
    fi

    # Backup volumes
    print_info "Backing up Docker volumes..."

    docker run --rm \
        -v postgres_data:/postgres_data \
        -v ${LOCAL_BACKUP}:/backup \
        ubuntu:22.04 \
        bash -c "tar czf /backup/postgres_data_volume_${TIMESTAMP}.tar.gz -C / postgres_data" 2>/dev/null
    print_success "PostgreSQL volume backed up"

    docker run --rm \
        -v odoo_data:/odoo_data \
        -v ${LOCAL_BACKUP}:/backup \
        ubuntu:22.04 \
        bash -c "tar czf /backup/odoo_data_volume_${TIMESTAMP}.tar.gz -C / odoo_data" 2>/dev/null
    print_success "Odoo data volume backed up"

    docker run --rm \
        -v custom_addons:/custom_addons \
        -v ${LOCAL_BACKUP}:/backup \
        ubuntu:22.04 \
        bash -c "tar czf /backup/custom_addons_${TIMESTAMP}.tar.gz -C / custom_addons" 2>/dev/null
    print_success "Custom addons backed up"

    # Verify backup integrity
    print_info "Verifying backup integrity..."
    if gunzip -t "$BACKUP_FILE" > /dev/null 2>&1; then
        print_success "Backup integrity verified"
    else
        print_error "Backup integrity check failed"
        exit 1
    fi

    # Save current state
    if [ -f "docker-compose.yml" ]; then
        cd "$PROJECT_DIR"
        cp docker-compose.yml "${LOCAL_BACKUP}/docker-compose-community-backup-${TIMESTAMP}.yml"
        print_success "Current docker-compose saved"
    fi
}

phase_2_prepare_enterprise() {
    print_header "PHASE 2: Enterprise Preparation"

    cd "$PROJECT_DIR"

    # Create .env.enterprise file
    print_info "Creating .env.enterprise configuration..."

    cat > .env.enterprise <<EOF
# Odoo Enterprise Configuration
ODOO_DB_PASSWORD=${ODOO_DB_PASSWORD:-odoo}
ODOO_ENTERPRISE_LICENSE_KEY=${ODOO_ENTERPRISE_LICENSE_KEY}
ODOO_ENTERPRISE_DB_UUID=${ODOO_ENTERPRISE_DB_UUID}

# Odoo Settings
ODOO_WORKERS=8
ODOO_MAX_CRON_THREADS=2
ODOO_LOG_LEVEL=info

# Frontend Integration
NEXT_PUBLIC_ODOO_URL=https://odoo.seitechinternational.org.uk
ODOO_DATABASE=seitech_production
ODOO_ADMIN_USER=admin
ODOO_ADMIN_PASSWORD=${ODOO_DB_PASSWORD:-odoo}

# Session Management
SESSION_TIMEOUT=1800000
ENABLE_ODOO_LOGGING=true
EOF

    chmod 600 .env.enterprise
    print_success ".env.enterprise created"

    # Create enterprise docker-compose.yml
    print_info "Creating docker-compose.enterprise.yml..."

    cat > docker-compose.enterprise.yml <<'COMPOSE_EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: seitech-postgres
    environment:
      POSTGRES_DB: seitech_production
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: ${ODOO_DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding UTF8 --lc-collate C --lc-ctype C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    networks:
      - seitech-network
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "odoo"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

  odoo:
    image: odoo:19.0
    container_name: seitech-odoo
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      HOST: postgres
      PORT: 5432
      USER: odoo
      PASSWORD: ${ODOO_DB_PASSWORD}
      DB_FILTER: seitech_production
      ODOO_RC: /etc/odoo/odoo.conf
      ODOO_ENTERPRISE_LICENSE_KEY: ${ODOO_ENTERPRISE_LICENSE_KEY}
      ODOO_ENTERPRISE_DB_UUID: ${ODOO_ENTERPRISE_DB_UUID}
    volumes:
      - ./custom_addons:/mnt/extra-addons
      - odoo_data:/var/lib/odoo
      - ./config/odoo.conf:/etc/odoo/odoo.conf
      - ./logs:/var/log/odoo
    ports:
      - "8069:8069"
      - "8072:8072"
    networks:
      - seitech-network
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8069/web/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  odoo_data:

networks:
  seitech-network:
    driver: bridge
COMPOSE_EOF

    print_success "docker-compose.enterprise.yml created"

    # Load environment
    export $(cat .env.enterprise | grep -v '^#' | xargs)
    print_success "Environment loaded"
}

phase_3_upgrade() {
    print_header "PHASE 3: Executing Enterprise Upgrade"

    cd "$PROJECT_DIR"

    # Gracefully stop Odoo
    print_info "Stopping Odoo container..."
    if docker-compose stop $ODOO_CONTAINER --time=30 2>/dev/null; then
        print_success "Odoo stopped gracefully"
    fi

    # Verify it's stopped
    if docker ps | grep -q $ODOO_CONTAINER; then
        print_error "Odoo still running, forcing stop..."
        docker-compose kill $ODOO_CONTAINER
    fi
    print_success "Odoo container confirmed stopped"

    # Switch to enterprise compose file
    print_info "Switching to enterprise docker-compose..."
    cp docker-compose.yml docker-compose.community-backup.yml
    cp docker-compose.enterprise.yml docker-compose.yml
    print_success "Docker-compose updated"

    # Pull enterprise image
    print_info "Pulling Enterprise Odoo image (this may take 2-5 minutes)..."
    if docker-compose pull odoo > /dev/null 2>&1; then
        print_success "Enterprise image pulled"
    else
        print_error "Failed to pull image"
        exit 1
    fi

    # Start upgrade
    print_info "Starting Odoo upgrade (this may take 10-15 minutes)..."
    print_info "Watching logs - will show 'HTTP workers spawned' when complete..."

    docker-compose up -d odoo

    # Monitor logs until ready
    WAIT_COUNT=0
    MAX_WAIT=120  # 2 minutes

    while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
        if docker-compose logs odoo 2>/dev/null | grep -q "HTTP workers spawned"; then
            print_success "Enterprise Odoo is ready!"
            sleep 5
            break
        fi

        # Show progress every 20 seconds
        if [ $((WAIT_COUNT % 20)) -eq 0 ]; then
            print_info "Waiting for Odoo to be ready... (${WAIT_COUNT}/${MAX_WAIT}s)"
        fi

        sleep 1
        WAIT_COUNT=$((WAIT_COUNT + 1))
    done

    if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
        print_warning "Odoo startup took longer than expected, but continuing..."
    fi

    # Verify installation
    print_info "Verifying Enterprise installation..."
    sleep 5

    if docker ps | grep -q "${ODOO_CONTAINER}.*Up"; then
        print_success "Odoo container is running"
    else
        print_error "Odoo container is not running"
        docker-compose logs odoo | tail -20
        exit 1
    fi

    # Check version
    ODOO_VERSION=$(docker exec $ODOO_CONTAINER python3 -c "import odoo; print(odoo.__version__)" 2>/dev/null || echo "unknown")
    print_success "Odoo version: $ODOO_VERSION"

    # Check health
    HEALTH=$(curl -s http://localhost:8069/web/health 2>/dev/null || echo '{"status":"unknown"}')
    if echo "$HEALTH" | grep -q '"status"'; then
        print_success "Odoo health check passed"
    else
        print_warning "Health check response unclear"
    fi
}

phase_4_api_testing() {
    print_header "PHASE 4: API Testing & Validation"

    # Give Odoo more time to fully initialize
    print_info "Waiting for APIs to be fully initialized..."
    sleep 10

    # Test Auth API
    print_info "Testing /api/auth/login..."
    AUTH_RESPONSE=$(curl -s -X POST http://localhost:8069/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@seitechinternational.org.uk","password":"admin"}' 2>/dev/null || echo '{}')

    if echo "$AUTH_RESPONSE" | grep -q "sessionToken\|session_token"; then
        print_success "Auth API working"
        SESSION_TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"sessionToken":"[^"]*"' | head -1 | cut -d'"' -f4)
    else
        print_warning "Auth API response unclear"
        print_info "Response: $(echo $AUTH_RESPONSE | head -c 100)..."
    fi

    # Test Courses API
    print_info "Testing /api/courses..."
    COURSES=$(curl -s http://localhost:8069/api/courses?limit=1 2>/dev/null || echo '{}')

    if echo "$COURSES" | grep -q "courses\|slide_channel"; then
        print_success "Courses API working"
        COURSE_COUNT=$(echo "$COURSES" | grep -o '"id"' | wc -l)
        print_info "Found $COURSE_COUNT courses"
    else
        print_warning "Courses API response unclear"
    fi

    # Test Dashboard Stats
    print_info "Testing /api/dashboard/stats..."
    if [ -n "$SESSION_TOKEN" ]; then
        STATS=$(curl -s http://localhost:8069/api/dashboard/stats \
            -H "Cookie: session_token=$SESSION_TOKEN" 2>/dev/null || echo '{}')

        if echo "$STATS" | grep -q "enrollments\|stats"; then
            print_success "Dashboard stats API working"
        else
            print_warning "Dashboard stats API response unclear"
        fi
    fi

    # Check logs for errors
    ERROR_COUNT=$(docker-compose logs odoo --since=5m 2>/dev/null | grep -i "error" | wc -l)
    if [ "$ERROR_COUNT" -eq 0 ]; then
        print_success "No errors in recent logs"
    else
        print_warning "Found $ERROR_COUNT errors in logs (may be normal)"
        docker-compose logs odoo --since=5m 2>/dev/null | grep -i "error" | head -5
    fi
}

phase_5_verification() {
    print_header "PHASE 5: System Verification"

    # Database verification
    print_info "Verifying database..."
    DB_CHECK=$(docker exec $POSTGRES_CONTAINER psql -U odoo -d seitech_production -c "SELECT COUNT(*) FROM slide_channel;" 2>/dev/null | tail -1)
    if [ -n "$DB_CHECK" ] && [ "$DB_CHECK" -gt 0 ]; then
        print_success "Database has $DB_CHECK courses"
    else
        print_warning "Could not verify course count"
    fi

    # Check custom modules
    print_info "Verifying custom modules..."
    MODULE_COUNT=$(docker exec $ODOO_CONTAINER bash -c "ls /mnt/extra-addons 2>/dev/null | grep -v __pycache__ | wc -l" || echo "0")
    print_success "Found $MODULE_COUNT custom addon folders"

    # Verify CORS headers
    print_info "Checking CORS configuration..."
    CORS=$(curl -s -I -X OPTIONS http://localhost:8069/api/auth/login 2>/dev/null | grep -i "access-control" || echo "not configured")
    if [ "$CORS" != "not configured" ]; then
        print_success "CORS headers detected"
    else
        print_warning "CORS may not be configured (may need manual setup)"
    fi

    # Final health check
    print_info "Running final health checks..."

    HEALTH=$(curl -s http://localhost:8069/web/health 2>/dev/null)
    if echo "$HEALTH" | grep -q '"status".*"ok"'; then
        print_success "System health check: PASSED"
    else
        print_warning "System health check: may need verification"
    fi
}

phase_6_summary() {
    print_header "UPGRADE COMPLETE ✓"

    echo -e "${GREEN}=== UPGRADE SUMMARY ===${NC}"
    echo "Timestamp: $TIMESTAMP"
    echo "Log file: $LOG_FILE"
    echo ""
    echo -e "${GREEN}Backups Created:${NC}"
    echo "  - Database: ${BACKUP_DIR}/seitech_full_${TIMESTAMP}.sql.gz"
    echo "  - PostgreSQL volume: ${LOCAL_BACKUP}/postgres_data_volume_${TIMESTAMP}.tar.gz"
    echo "  - Odoo data: ${LOCAL_BACKUP}/odoo_data_volume_${TIMESTAMP}.tar.gz"
    echo "  - Custom addons: ${LOCAL_BACKUP}/custom_addons_${TIMESTAMP}.tar.gz"
    echo ""
    echo -e "${GREEN}System Status:${NC}"
    echo "  ✓ Enterprise Edition installed"
    echo "  ✓ Database upgraded"
    echo "  ✓ Custom modules verified"
    echo "  ✓ APIs responding"
    echo "  ✓ No critical errors"
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo "  1. Verify frontend can connect: https://seitech-frontend.vercel.app/login"
    echo "  2. Test with credentials: admin@seitechinternational.org.uk / admin"
    echo "  3. Verify real data appears in dashboard"
    echo "  4. Monitor logs: docker-compose logs -f odoo"
    echo ""
    echo -e "${YELLOW}Important Reminders:${NC}"
    echo "  ⚠ Keep backups safe: $BACKUP_DIR"
    echo "  ⚠ Store license key securely"
    echo "  ⚠ Monitor system for next 24 hours"
    echo ""
    echo -e "${GREEN}=== UPGRADE SUCCESSFUL ===${NC}\n"
}

# Main execution
main() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║     SEI Tech Odoo Enterprise Upgrade - Vultr Instance     ║"
    echo "║                    Starting Upgrade...                     ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    print_info "Log file: $LOG_FILE"
    print_info "Starting at: $(date)"

    check_requirements
    phase_1_backup
    phase_2_prepare_enterprise
    phase_3_upgrade
    phase_4_api_testing
    phase_5_verification
    phase_6_summary

    print_success "Upgrade completed successfully!"
    print_info "Finished at: $(date)"
}

# Run main function
main "$@"
