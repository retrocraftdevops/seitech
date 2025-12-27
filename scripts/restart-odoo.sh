#!/bin/bash
# Restart Odoo Server Script

set -e

echo "=========================================="
echo "Odoo Server Restart"
echo "=========================================="

# Find Odoo processes
ODOO_PIDS=$(ps aux | grep -E "python.*odoo|/usr/bin/odoo" | grep -v grep | awk '{print $2}')

if [ -z "$ODOO_PIDS" ]; then
    echo "❌ No Odoo processes found"
    echo "   Odoo might not be running"
    exit 1
fi

echo "Found Odoo process(es):"
ps aux | grep -E "python.*odoo|/usr/bin/odoo" | grep -v grep | head -2

echo ""
read -p "Do you want to restart Odoo? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Try systemd first
if systemctl is-active --quiet odoo 2>/dev/null; then
    echo "Restarting via systemd..."
    sudo systemctl restart odoo
    echo "✅ Odoo restarted via systemd"
    exit 0
fi

# Otherwise kill and provide instructions
echo "Stopping Odoo processes..."
for pid in $ODOO_PIDS; do
    echo "  Killing PID $pid..."
    kill $pid 2>/dev/null || sudo kill $pid 2>/dev/null
done

sleep 2

echo ""
echo "✅ Odoo stopped"
echo ""
echo "To start Odoo again, run:"
echo "  python3 -m odoo -c config/odoo.conf"
echo ""
echo "Or if using systemd:"
echo "  sudo systemctl start odoo"

