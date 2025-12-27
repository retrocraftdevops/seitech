#!/bin/bash
# Test Chat API Endpoints

set -e

echo "=========================================="
echo "Chat API Connectivity Test"
echo "=========================================="

BASE_URL="http://localhost:8069"
ORIGIN="http://localhost:4000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo ""
    echo "Testing: $description"
    echo "  $method $endpoint"
    
    if [ "$method" = "OPTIONS" ]; then
        response=$(curl -s -w "\n%{http_code}" -X OPTIONS "$BASE_URL$endpoint" \
            -H "Origin: $ORIGIN" \
            -H "Access-Control-Request-Method: POST" \
            -H "Access-Control-Request-Headers: Content-Type" \
            -i 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Origin: $ORIGIN" \
            -d "$data" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -1)
    headers=$(echo "$response" | grep -i "access-control" || echo "")
    body=$(echo "$response" | sed '$d' | tail -5)
    
    if [ -n "$headers" ]; then
        echo -e "  ${GREEN}✅ CORS headers present${NC}"
        echo "$headers" | sed 's/^/    /'
    else
        echo -e "  ${RED}❌ No CORS headers${NC}"
    fi
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
        echo -e "  ${GREEN}✅ HTTP Status: $http_code${NC}"
    else
        echo -e "  ${RED}❌ HTTP Status: $http_code${NC}"
    fi
    
    if echo "$body" | grep -q "does not exist"; then
        echo -e "  ${RED}❌ Database tables missing!${NC}"
        echo "    Run: python3 -m odoo -c config/odoo.conf -u seitech_elearning -d seitech --stop-after-init"
    elif echo "$body" | grep -q "success.*true"; then
        echo -e "  ${GREEN}✅ API working correctly${NC}"
    fi
    
    echo "$body" | sed 's/^/    /'
}

# Test 1: OPTIONS preflight
test_endpoint "OPTIONS" "/api/chat/support" "" "CORS Preflight (OPTIONS)"

# Test 2: Create support channel
test_endpoint "POST" "/api/chat/support" '{"name":"Test User","email":"test@example.com"}' "Create Support Channel"

# Test 3: OPTIONS for channels
test_endpoint "OPTIONS" "/api/chat/channels" "" "CORS Preflight for Channels"

echo ""
echo "=========================================="
echo "Summary:"
echo "=========================================="
echo "If CORS headers are missing:"
echo "  → Restart Odoo server"
echo ""
echo "If database tables are missing:"
echo "  → Upgrade module: python3 -m odoo -c config/odoo.conf -u seitech_elearning -d seitech --stop-after-init"
echo ""
echo "After fixing, run this script again to verify."
echo "=========================================="

