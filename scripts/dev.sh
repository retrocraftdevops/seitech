#!/bin/bash
#
# Seitech Odoo Development Helper Script
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

show_help() {
    echo -e "${BLUE}Seitech Odoo Development Commands${NC}"
    echo ""
    echo "Usage: ./scripts/dev.sh <command>"
    echo ""
    echo "Commands:"
    echo "  start       Start Odoo in development mode"
    echo "  stop        Stop Odoo"
    echo "  restart     Restart Odoo"
    echo "  logs        Show Odoo logs"
    echo "  shell       Open Odoo shell"
    echo "  bash        Open bash in container"
    echo "  build       Build Docker image"
    echo "  rebuild     Rebuild Docker image (no cache)"
    echo "  update      Update modules"
    echo "  install     Install modules"
    echo "  backup      Backup database"
    echo "  restore     Restore database"
    echo "  status      Show container status"
    echo "  psql        Connect to PostgreSQL"
    echo ""
}

start() {
    echo -e "${GREEN}Starting Odoo in development mode...${NC}"
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    echo -e "${GREEN}Odoo started at http://localhost:8069${NC}"
}

stop() {
    echo -e "${YELLOW}Stopping Odoo...${NC}"
    docker compose down
}

restart() {
    stop
    start
}

logs() {
    docker compose logs -f
}

shell() {
    docker compose exec odoo bash -c "PYTHONPATH=/opt/odoo/odoo python3 -m odoo shell -c /opt/odoo/config/odoo.conf"
}

open_bash() {
    docker compose exec odoo bash
}

build() {
    echo -e "${GREEN}Building Docker image...${NC}"
    docker compose build
}

rebuild() {
    echo -e "${GREEN}Rebuilding Docker image (no cache)...${NC}"
    docker compose build --no-cache
}

update_modules() {
    if [ -z "$2" ]; then
        echo -e "${RED}Please specify modules to update${NC}"
        echo "Usage: ./scripts/dev.sh update module1,module2"
        exit 1
    fi
    echo -e "${GREEN}Updating modules: $2${NC}"
    docker compose exec odoo bash -c "PYTHONPATH=/opt/odoo/odoo python3 -m odoo -c /opt/odoo/config/odoo.conf -u $2 --stop-after-init"
}

install_modules() {
    if [ -z "$2" ]; then
        echo -e "${RED}Please specify modules to install${NC}"
        echo "Usage: ./scripts/dev.sh install module1,module2"
        exit 1
    fi
    echo -e "${GREEN}Installing modules: $2${NC}"
    docker compose exec odoo bash -c "PYTHONPATH=/opt/odoo/odoo python3 -m odoo -c /opt/odoo/config/odoo.conf -i $2 --stop-after-init"
}

backup_db() {
    local db_name=${DB_NAME:-seitech}
    local backup_file="$PROJECT_DIR/backups/${db_name}_$(date +%Y%m%d_%H%M%S).sql"
    echo -e "${GREEN}Backing up database to $backup_file${NC}"
    pg_dump -U odoo -h localhost "$db_name" > "$backup_file"
    echo -e "${GREEN}Backup complete: $backup_file${NC}"
}

restore_db() {
    if [ -z "$2" ]; then
        echo -e "${RED}Please specify backup file to restore${NC}"
        echo "Usage: ./scripts/dev.sh restore backup_file.sql"
        exit 1
    fi
    local db_name=${DB_NAME:-seitech}
    echo -e "${YELLOW}WARNING: This will overwrite database $db_name${NC}"
    read -p "Are you sure? (y/N) " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        echo -e "${GREEN}Restoring database from $2${NC}"
        psql -U odoo -h localhost "$db_name" < "$2"
        echo -e "${GREEN}Restore complete${NC}"
    fi
}

status() {
    docker compose ps
}

connect_psql() {
    local db_name=${DB_NAME:-seitech}
    psql -U odoo -h localhost "$db_name"
}

# Main
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    shell)
        shell
        ;;
    bash)
        open_bash
        ;;
    build)
        build
        ;;
    rebuild)
        rebuild
        ;;
    update)
        update_modules "$@"
        ;;
    install)
        install_modules "$@"
        ;;
    backup)
        backup_db
        ;;
    restore)
        restore_db "$@"
        ;;
    status)
        status
        ;;
    psql)
        connect_psql
        ;;
    *)
        show_help
        ;;
esac
