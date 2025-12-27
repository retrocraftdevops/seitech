#!/bin/bash
set -e

# Seitech Odoo Entrypoint Script

ODOO_HOME=${ODOO_HOME:-/opt/odoo}
ODOO_CONFIG=${ODOO_HOME}/config/odoo.conf

# Add Odoo source to Python path
export PYTHONPATH="${ODOO_HOME}/odoo:${PYTHONPATH}"

# Function to wait for PostgreSQL
wait_for_postgres() {
    echo "Waiting for PostgreSQL..."
    local host=${DB_HOST:-localhost}
    local port=${DB_PORT:-5432}
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if pg_isready -h "$host" -p "$port" > /dev/null 2>&1; then
            echo "PostgreSQL is ready!"
            return 0
        fi
        echo "Attempt $attempt/$max_attempts: PostgreSQL not ready, waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo "ERROR: PostgreSQL not available after $max_attempts attempts"
    exit 1
}

# Generate config file
generate_config() {
    echo "Generating Odoo configuration..."
    cat > "$ODOO_CONFIG" << EOF
[options]
; Database
db_host = ${DB_HOST:-localhost}
db_port = ${DB_PORT:-5432}
db_user = ${DB_USER:-odoo}
db_password = ${DB_PASSWORD:-odoo}
db_name = ${DB_NAME:-seitech}
db_template = template0

; Paths
addons_path = ${ODOO_HOME}/odoo/odoo/addons,${ODOO_HOME}/custom_addons
data_dir = ${ODOO_HOME}/data

; Server
http_port = ${HTTP_PORT:-8069}
http_interface = 0.0.0.0
longpolling_port = ${LONGPOLLING_PORT:-8072}
workers = ${WORKERS:-0}
max_cron_threads = ${MAX_CRON_THREADS:-2}

; Logging
logfile = ${ODOO_HOME}/logs/odoo.log
log_level = ${LOG_LEVEL:-info}
log_handler = :INFO

; Security
admin_passwd = ${ADMIN_PASSWORD:-admin}
list_db = ${LIST_DB:-True}

; Performance
limit_memory_hard = ${LIMIT_MEMORY_HARD:-2684354560}
limit_memory_soft = ${LIMIT_MEMORY_SOFT:-2147483648}
limit_time_cpu = ${LIMIT_TIME_CPU:-600}
limit_time_real = ${LIMIT_TIME_REAL:-1200}

; Proxy
proxy_mode = ${PROXY_MODE:-False}
EOF
    echo "Configuration generated at $ODOO_CONFIG"
}

# Main execution
main() {
    echo "========================================"
    echo "Seitech Odoo 19.0 Enterprise"
    echo "========================================"

    # Wait for PostgreSQL
    wait_for_postgres

    # Generate config
    generate_config

    # Determine command
    case "$1" in
        odoo)
            shift
            echo "Starting Odoo..."
            # Add odoo to Python path and run CLI
            export PYTHONPATH="/opt/odoo/odoo:${PYTHONPATH}"
            exec python3 -c "from odoo.cli.command import main; main()" -c "$ODOO_CONFIG" "$@"
            ;;
        shell)
            shift
            echo "Starting Odoo shell..."
            exec python3 /opt/odoo/odoo/odoo-bin shell -c "$ODOO_CONFIG" "$@"
            ;;
        scaffold)
            shift
            echo "Running scaffold..."
            exec python3 /opt/odoo/odoo/odoo-bin scaffold "$@"
            ;;
        upgrade)
            shift
            echo "Upgrading modules: $@"
            exec python3 /opt/odoo/odoo/odoo-bin -c "$ODOO_CONFIG" -u "$@" --stop-after-init
            ;;
        install)
            shift
            echo "Installing modules: $@"
            exec python3 /opt/odoo/odoo/odoo-bin -c "$ODOO_CONFIG" -i "$@" --stop-after-init
            ;;
        *)
            exec "$@"
            ;;
    esac
}

main "$@"
