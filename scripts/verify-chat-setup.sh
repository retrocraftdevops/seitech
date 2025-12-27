#!/bin/bash
# Comprehensive Chat System Verification

set -e

echo "=========================================="
echo "Chat System Verification"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}❌ $1${NC}"
        ((FAIL++))
        return 1
    fi
}

echo ""
echo "${BLUE}1. Code Verification${NC}"
echo "-------------------"

# Check controller file exists
[ -f "custom_addons/seitech_elearning/controllers/chat.py" ] && check "Controller file exists" || check "Controller file missing"

# Check CORS code
grep -q "Access-Control-Allow-Origin" custom_addons/seitech_elearning/controllers/chat.py && \
    check "CORS headers in controller code" || check "CORS headers missing in code"

# Check OPTIONS handlers
grep -q "def support_options" custom_addons/seitech_elearning/controllers/chat.py && \
    check "OPTIONS handler exists" || check "OPTIONS handler missing"

# Check frontend files
[ -f "frontend/public/site.webmanifest" ] && check "site.webmanifest exists" || check "site.webmanifest missing"
[ -f "frontend/public/images/hero-pattern.svg" ] && check "hero-pattern.svg exists" || check "hero-pattern.svg missing"
[ -f "frontend/public/apple-touch-icon.png" ] && check "apple-touch-icon.png exists" || check "apple-touch-icon.png missing"

echo ""
echo "${BLUE}2. Server Status${NC}"
echo "-------------------"

# Check Odoo is running
if curl -s http://localhost:8069/web/health > /dev/null 2>&1; then
    check "Odoo server is running"
else
    check "Odoo server is NOT running"
fi

# Check frontend is running
if curl -s http://localhost:4000 > /dev/null 2>&1; then
    check "Frontend server is running"
else
    check "Frontend server is NOT running"
fi

echo ""
echo "${BLUE}3. API Connectivity${NC}"
echo "-------------------"

# Test CORS
CORS_HEADERS=$(curl -s -X OPTIONS http://localhost:8069/api/chat/support \
    -H "Origin: http://localhost:4000" \
    -H "Access-Control-Request-Method: POST" \
    -i 2>&1 | grep -i "access-control" || echo "")

if [ -n "$CORS_HEADERS" ]; then
    check "CORS headers present in API response"
    echo "   $CORS_HEADERS" | sed 's/^/   /'
else
    check "CORS headers NOT present (Odoo needs restart)"
fi

# Test database
DB_TEST=$(curl -s -X POST http://localhost:8069/api/chat/support \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com"}' 2>&1)

if echo "$DB_TEST" | grep -q "does not exist"; then
    check "Database tables missing (module needs upgrade)"
    echo "   Run: python3 -m odoo -c config/odoo.conf -u seitech_elearning -d seitech --stop-after-init"
elif echo "$DB_TEST" | grep -q '"success":true'; then
    check "Database tables exist and API working"
else
    check "API returned error (check response)"
    echo "   Response: $DB_TEST" | head -3 | sed 's/^/   /'
fi

echo ""
echo "${BLUE}4. Summary${NC}"
echo "-------------------"
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Chat system is ready.${NC}"
elif [ $FAIL -le 2 ]; then
    echo -e "${YELLOW}⚠️  Some issues found. See CHAT_FIX_INSTRUCTIONS.md${NC}"
else
    echo -e "${RED}❌ Multiple issues found. See CHAT_FIX_INSTRUCTIONS.md${NC}"
fi

echo ""
echo "Next steps:"
echo "1. If CORS missing → Restart Odoo"
echo "2. If tables missing → Upgrade module"
echo "3. Run: ./scripts/test-chat-api.sh to test endpoints"
echo "=========================================="

