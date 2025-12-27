#!/bin/bash

# Odoo Integration Testing Script
# Tests all API endpoints after removing mock data

set -e

BASE_URL="http://localhost:4000"
ADMIN_TOKEN=""  # Would need actual session token

echo "====================================="
echo "Odoo Integration Test Suite"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

test_endpoint() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"
  
  echo -n "Testing $name... "
  
  response=$(curl -s -w "\n%{http_code}" "$url")
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
    ((TESTS_PASSED++))
    return 0
  else
    echo -e "${RED}✗ FAILED${NC} (Expected $expected_status, got $status_code)"
    echo "Response: $body"
    ((TESTS_FAILED++))
    return 1
  fi
}

echo "1. Testing Public Endpoints"
echo "----------------------------"
test_endpoint "Courses API" "$BASE_URL/api/courses"
test_endpoint "Courses with filters" "$BASE_URL/api/courses?limit=5&featured=true"
test_endpoint "Blog API" "$BASE_URL/api/blog"
test_endpoint "Blog with pagination" "$BASE_URL/api/blog?page=1&limit=5"
test_endpoint "Categories API" "$BASE_URL/api/categories"
test_endpoint "Schedules API" "$BASE_URL/api/schedules"
echo ""

echo "2. Testing Course Endpoints"
echo "----------------------------"
test_endpoint "Course by ID" "$BASE_URL/api/courses/4"
test_endpoint "Course by slug" "$BASE_URL/api/courses/slug/violence-aggression-and-bullying-awareness"
test_endpoint "Invalid course" "$BASE_URL/api/courses/99999" 404
echo ""

echo "3. Testing Blog Endpoints"
echo "----------------------------"
test_endpoint "Blog post by slug" "$BASE_URL/api/blog/test-post" 200
echo ""

echo "4. Testing Gamification"
echo "----------------------------"
test_endpoint "Leaderboard" "$BASE_URL/api/gamification/leaderboard"
test_endpoint "Badges" "$BASE_URL/api/gamification/badges"
echo ""

echo "5. Checking Odoo Connectivity"
echo "----------------------------"
echo -n "Odoo backend at http://localhost:8069... "
if curl -s -f http://localhost:8069/web/database/selector > /dev/null; then
  echo -e "${GREEN}✓ ONLINE${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ OFFLINE${NC}"
  ((TESTS_FAILED++))
fi
echo ""

echo "6. Checking for Mock Data in Codebase"
echo "---------------------------------------"
echo "Searching for mock data patterns..."
cd "$(dirname "$0")/.."

mock_files=$(find src/app/api -name "*.ts" -type f -exec grep -l "mockUsers\|mockCourses\|mockInstructors\|mockBlogPosts" {} \; 2>/dev/null || true)

if [ -z "$mock_files" ]; then
  echo -e "${GREEN}✓ No mock data arrays found in API routes${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ Mock data still exists in:${NC}"
  echo "$mock_files"
  ((TESTS_FAILED++))
fi
echo ""

echo "7. Checking Service Layer"
echo "----------------------------"
if [ -f "src/lib/services/odoo-data-service.ts" ]; then
  echo -e "${GREEN}✓ Odoo Data Service exists${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ Odoo Data Service missing${NC}"
  ((TESTS_FAILED++))
fi
echo ""

echo "====================================="
echo "Test Results"
echo "====================================="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total:  $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed! ✓${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed! ✗${NC}"
  exit 1
fi
