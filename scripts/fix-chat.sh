#!/bin/bash
# Fix Chat System - Upgrade Module and Restart Odoo

set -e

echo "=========================================="
echo "Chat System Fix Script"
echo "=========================================="

# Get database name from config or use default
DB_NAME=$(grep "db_name" config/odoo.conf 2>/dev/null | cut -d'=' -f2 | tr -d ' ' || echo "seitech")

echo "📦 Step 1: Upgrading seitech_elearning module..."
echo "Database: $DB_NAME"

# Try to upgrade the module
if command -v python3 &> /dev/null; then
    # Check if we can find odoo binary
    ODOO_BIN=""
    if [ -f "./odoo/odoo-bin" ]; then
        ODOO_BIN="./odoo/odoo-bin"
    elif [ -f "./odoo-source/odoo-bin" ]; then
        ODOO_BIN="./odoo-source/odoo-bin"
    elif command -v odoo &> /dev/null; then
        ODOO_BIN="odoo"
    fi
    
    if [ -n "$ODOO_BIN" ]; then
        echo "Using Odoo binary: $ODOO_BIN"
        python3 $ODOO_BIN -c config/odoo.conf -u seitech_elearning -d "$DB_NAME" --stop-after-init 2>&1 | tail -20
        echo "✅ Module upgrade completed"
    else
        echo "⚠️  Could not find Odoo binary. Please upgrade manually:"
        echo "   python3 -m odoo -c config/odoo.conf -u seitech_elearning -d $DB_NAME --stop-after-init"
    fi
else
    echo "⚠️  Python3 not found. Please upgrade module manually."
fi

echo ""
echo "🔄 Step 2: Restarting Odoo..."
echo "Please restart Odoo server to load updated controllers."
echo ""
echo "If using systemd:"
echo "  sudo systemctl restart odoo"
echo ""
echo "If running manually, stop and restart:"
echo "  ./odoo-bin -c config/odoo.conf"
echo ""
echo "If using Docker:"
echo "  docker compose restart odoo"
echo ""

echo "🧪 Step 3: Testing endpoints..."
echo ""

# Test if Odoo is running
if curl -s http://localhost:8069/web/health > /dev/null 2>&1; then
    echo "✅ Odoo is running on port 8069"
    
    # Test CORS
    echo ""
    echo "Testing CORS headers..."
    CORS_TEST=$(curl -s -X OPTIONS http://localhost:8069/api/chat/support \
        -H "Origin: http://localhost:4000" \
        -H "Access-Control-Request-Method: POST" \
        -i 2>&1 | grep -i "access-control" || echo "NO_CORS")
    
    if [ "$CORS_TEST" != "NO_CORS" ]; then
        echo "✅ CORS headers found:"
        echo "$CORS_TEST"
    else
        echo "❌ CORS headers NOT found - Odoo needs to be restarted!"
    fi
    
    # Test database tables
    echo ""
    echo "Testing database tables..."
    DB_TEST=$(curl -s -X POST http://localhost:8069/api/chat/support \
        -H "Content-Type: application/json" \
        -d '{"name":"Test","email":"test@test.com"}' 2>&1 | grep -o "does not exist" || echo "OK")
    
    if [ "$DB_TEST" = "does not exist" ]; then
        echo "❌ Database tables missing - Module needs to be installed/upgraded!"
    else
        echo "✅ Database tables exist"
    fi
else
    echo "❌ Odoo is not running on port 8069"
fi

echo ""
echo "=========================================="
echo "Next Steps:"
echo "1. If module upgrade failed, run it manually"
echo "2. Restart Odoo server"
echo "3. Test chat widget at http://localhost:4000"
echo "=========================================="

