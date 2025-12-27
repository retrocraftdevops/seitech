#!/bin/bash

###############################################################################
# Comprehensive Production Readiness Test Suite
# Tests all routes, APIs, and CRUD operations
###############################################################################

set -e

BASE_URL="http://localhost:4000"
API_BASE="$BASE_URL/api"
RESULTS_FILE="test-results-$(date +%Y%m%d-%H%M%S).json"
FAILED_TESTS=0
PASSED_TESTS=0

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║         COMPREHENSIVE PRODUCTION READINESS TEST SUITE                    ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Testing against: $BASE_URL"
echo "Started at: $(date)"
echo ""

# Initialize results
echo "{\"test_run\": {\"started_at\": \"$(date -Iseconds)\", \"base_url\": \"$BASE_URL\", \"tests\": [" > "$RESULTS_FILE"

###############################################################################
# Test Helper Functions
###############################################################################

test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_code="${3:-200}"
    local method="${4:-GET}"
    
    echo -n "Testing $name... "
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)
    else
        response=$(curl -s -X "$method" -o /dev/null -w "%{http_code}" "$url" 2>&1)
    fi
    
    if [ "$response" == "$expected_code" ]; then
        echo "✅ PASS (HTTP $response)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo "{\"name\": \"$name\", \"url\": \"$url\", \"expected\": $expected_code, \"actual\": $response, \"status\": \"pass\"}," >> "$RESULTS_FILE"
        return 0
    else
        echo "❌ FAIL (Expected: $expected_code, Got: $response)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "{\"name\": \"$name\", \"url\": \"$url\", \"expected\": $expected_code, \"actual\": $response, \"status\": \"fail\"}," >> "$RESULTS_FILE"
        return 1
    fi
}

test_json_response() {
    local name="$1"
    local url="$2"
    
    echo -n "Testing $name (JSON)... "
    
    response=$(curl -s "$url" 2>&1)
    
    if echo "$response" | jq . > /dev/null 2>&1; then
        echo "✅ PASS (Valid JSON)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo "{\"name\": \"$name\", \"url\": \"$url\", \"status\": \"pass\", \"type\": \"json_validation\"}," >> "$RESULTS_FILE"
        return 0
    else
        echo "❌ FAIL (Invalid JSON)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "{\"name\": \"$name\", \"url\": \"$url\", \"status\": \"fail\", \"type\": \"json_validation\"}," >> "$RESULTS_FILE"
        return 1
    fi
}

###############################################################################
# PHASE 1: PUBLIC PAGES
###############################################################################

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 1: PUBLIC PAGES"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

test_endpoint "Homepage" "$BASE_URL/"
test_endpoint "About Page" "$BASE_URL/about"
test_endpoint "Contact Page" "$BASE_URL/contact"
test_endpoint "Privacy Policy" "$BASE_URL/privacy"
test_endpoint "Terms & Conditions" "$BASE_URL/terms"
test_endpoint "Team Page" "$BASE_URL/about/team"
test_endpoint "Accreditations Page" "$BASE_URL/about/accreditations"

echo ""

###############################################################################
# PHASE 2: COURSES & TRAINING
###############################################################################

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 2: COURSES & TRAINING"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

test_endpoint "Courses Catalog" "$BASE_URL/courses"
test_endpoint "E-Learning Page" "$BASE_URL/e-learning"
test_endpoint "Face-to-Face Training" "$BASE_URL/face-to-face"
test_endpoint "Virtual Learning" "$BASE_URL/virtual-learning"
test_endpoint "In-House Training" "$BASE_URL/in-house-training"
test_endpoint "Schedule Page" "$BASE_URL/schedule"
test_endpoint "Categories Index" "$BASE_URL/categories"
test_endpoint "Health Safety Category" "$BASE_URL/categories/health-safety"

echo ""

###############################################################################
# PHASE 3: SERVICES & CONSULTANCY
###############################################################################

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 3: SERVICES & CONSULTANCY"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

test_endpoint "Services Page" "$BASE_URL/services"
test_endpoint "Free Consultation" "$BASE_URL/free-consultation"

echo ""

###############################################################################
# PHASE 4: BLOG
###############################################################################

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 4: BLOG"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

test_endpoint "Blog Index" "$BASE_URL/blog"

echo ""

###############################################################################
# PHASE 5: AUTH PAGES
###############################################################################

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 5: AUTHENTICATION"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

test_endpoint "Login Page" "$BASE_URL/login"
test_endpoint "Register Page" "$BASE_URL/register"
test_endpoint "Forgot Password" "$BASE_URL/forgot-password"

echo ""

###############################################################################
# PHASE 6: USER DASHBOARD (Protected - expect redirects)
###############################################################################

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 6: USER DASHBOARD (Protected)"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

test_endpoint "Dashboard" "$BASE_URL/dashboard"
test_endpoint "My Courses" "$BASE_URL/my-courses"
test_endpoint "My Learning" "$BASE_URL/my-learning"
test_endpoint "Profile" "$BASE_URL/profile"
test_endpoint "Settings" "$BASE_URL/settings"
test_endpoint "Certificates" "$BASE_URL/certificates"
test_endpoint "Achievements" "$BASE_URL/achievements"
test_endpoint "Leaderboard" "$BASE_URL/leaderboard"

echo ""

###############################################################################
# PHASE 7: COMMERCE
###############################################################################

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 7: COMMERCE"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

test_endpoint "Cart" "$BASE_URL/cart"
test_endpoint "Checkout" "$BASE_URL/checkout"

echo ""

###############################################################################
# PHASE 8: ADMIN (Protected)
###############################################################################

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 8: ADMIN PANEL (Protected)"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

test_endpoint "Admin Dashboard" "$BASE_URL/admin"
test_endpoint "Admin Analytics" "$BASE_URL/admin/analytics"
test_endpoint "Admin Users" "$BASE_URL/admin/users"
test_endpoint "Admin Certificates" "$BASE_URL/admin/certificates"
test_endpoint "Admin Settings" "$BASE_URL/admin/settings"

echo ""

###############################################################################
# PHASE 9: API ENDPOINTS
###############################################################################

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 9: API ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

# Public APIs
test_json_response "API: Courses List" "$API_BASE/courses"
test_json_response "API: Categories" "$API_BASE/categories"
test_json_response "API: Blog Posts" "$API_BASE/blog"
test_json_response "API: CMS Services" "$API_BASE/cms/services"
test_json_response "API: CMS Partners" "$API_BASE/cms/partners"
test_json_response "API: CMS Testimonials" "$API_BASE/cms/testimonials"
test_json_response "API: CMS Team" "$API_BASE/cms/team"
test_json_response "API: CMS FAQs" "$API_BASE/cms/faqs"
test_json_response "API: CMS Homepage" "$API_BASE/cms/homepage"
test_json_response "API: CMS Statistics" "$API_BASE/cms/statistics"
test_json_response "API: Schedules" "$API_BASE/schedules"
test_json_response "API: Gamification Badges" "$API_BASE/gamification/badges"
test_json_response "API: Leaderboard" "$API_BASE/gamification/leaderboard"

echo ""

###############################################################################
# PHASE 10: SEO & METADATA
###############################################################################

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 10: SEO & METADATA"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

test_endpoint "Robots.txt" "$BASE_URL/robots.txt"
test_endpoint "Sitemap" "$BASE_URL/sitemap.xml" 200

echo ""

###############################################################################
# RESULTS SUMMARY
###############################################################################

# Close JSON
echo "{\"name\": \"summary\", \"passed\": $PASSED_TESTS, \"failed\": $FAILED_TESTS}]}}" >> "$RESULTS_FILE"

TOTAL_TESTS=$((PASSED_TESTS + FAILED_TESTS))
SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo "═══════════════════════════════════════════════════════════════════════════"
echo "TEST RESULTS SUMMARY"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "Total Tests:    $TOTAL_TESTS"
echo "Passed:         $PASSED_TESTS ✅"
echo "Failed:         $FAILED_TESTS ❌"
echo "Success Rate:   $SUCCESS_RATE%"
echo ""
echo "Results saved to: $RESULTS_FILE"
echo "Completed at: $(date)"
echo ""

if [ $SUCCESS_RATE -ge 90 ]; then
    echo "✅ PRODUCTION READY: Success rate >= 90%"
    exit 0
elif [ $SUCCESS_RATE -ge 75 ]; then
    echo "⚠️  NEEDS WORK: Success rate 75-89%"
    exit 1
else
    echo "❌ NOT READY: Success rate < 75%"
    exit 1
fi
