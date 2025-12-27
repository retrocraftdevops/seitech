#!/bin/bash

###############################################################################
# Enhanced Production Readiness Test Suite v2
# Handles redirects properly and provides detailed analysis
###############################################################################

set -e

BASE_URL="http://localhost:4000"
API_BASE="$BASE_URL/api"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RESULTS_DIR="test-results"
RESULTS_FILE="$RESULTS_DIR/test-run-$TIMESTAMP.txt"
JSON_FILE="$RESULTS_DIR/test-run-$TIMESTAMP.json"
FAILED_TESTS=0
PASSED_TESTS=0
WARNING_TESTS=0

mkdir -p "$RESULTS_DIR"

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║         COMPREHENSIVE PRODUCTION READINESS TEST SUITE v2                 ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Testing against: $BASE_URL"
echo "Started at: $(date)"
echo ""

# Initialize
{
    echo "Testing against: $BASE_URL"
    echo "Started at: $(date)"
    echo ""
} > "$RESULTS_FILE"

echo "{\"test_run\": {\"started_at\": \"$(date -Iseconds)\", \"base_url\": \"$BASE_URL\", \"tests\": [" > "$JSON_FILE"

###############################################################################
# Test Helper Functions
###############################################################################

test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_codes="${3:-200,307,308}"  # Accept redirects
    local method="${4:-GET}"
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" -L "$url" 2>&1)
    
    # Check if response matches any expected code
    local found=false
    IFS=',' read -ra CODES <<< "$expected_codes"
    for code in "${CODES[@]}"; do
        if [ "$response" == "$code" ]; then
            found=true
            break
        fi
    done
    
    if [ "$found" = true ]; then
        if [[ "$response" == "307" || "$response" == "308" ]]; then
            echo "⚠️  REDIRECT (HTTP $response)" | tee -a "$RESULTS_FILE"
            WARNING_TESTS=$((WARNING_TESTS + 1))
        else
            echo "✅ PASS (HTTP $response)" | tee -a "$RESULTS_FILE"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        fi
        echo "{\"name\": \"$name\", \"url\": \"$url\", \"expected\": \"$expected_codes\", \"actual\": $response, \"status\": \"pass\"}," >> "$JSON_FILE"
        return 0
    else
        echo "❌ FAIL (Expected: $expected_codes, Got: $response)" | tee -a "$RESULTS_FILE"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "{\"name\": \"$name\", \"url\": \"$url\", \"expected\": \"$expected_codes\", \"actual\": $response, \"status\": \"fail\"}," >> "$JSON_FILE"
        return 1
    fi
}

test_json_api() {
    local name="$1"
    local url="$2"
    
    echo -n "Testing $name... "
    
    response=$(curl -s "$url" 2>&1)
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)
    
    # Check HTTP code first
    if [ "$http_code" != "200" ]; then
        echo "❌ FAIL (HTTP $http_code)" | tee -a "$RESULTS_FILE"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "{\"name\": \"$name\", \"url\": \"$url\", \"http_code\": $http_code, \"status\": \"fail\", \"reason\": \"http_error\"}," >> "$JSON_FILE"
        return 1
    fi
    
    # Check if valid JSON
    if echo "$response" | jq . > /dev/null 2>&1; then
        # Check if success field exists and is true
        success=$(echo "$response" | jq -r '.success // .data // true' 2>/dev/null)
        if [ "$success" != "false" ] && [ "$success" != "null" ]; then
            echo "✅ PASS (Valid JSON, HTTP 200)" | tee -a "$RESULTS_FILE"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            echo "{\"name\": \"$name\", \"url\": \"$url\", \"status\": \"pass\", \"type\": \"json_api\"}," >> "$JSON_FILE"
            return 0
        else
            echo "⚠️  WARN (JSON valid but success=false)" | tee -a "$RESULTS_FILE"
            WARNING_TESTS=$((WARNING_TESTS + 1))
            echo "{\"name\": \"$name\", \"url\": \"$url\", \"status\": \"warning\", \"reason\": \"success_false\"}," >> "$JSON_FILE"
            return 0
        fi
    else
        echo "❌ FAIL (Invalid JSON)" | tee -a "$RESULTS_FILE"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "{\"name\": \"$name\", \"url\": \"$url\", \"status\": \"fail\", \"reason\": \"invalid_json\"}," >> "$JSON_FILE"
        return 1
    fi
}

section_header() {
    local title="$1"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════" | tee -a "$RESULTS_FILE"
    echo "$title" | tee -a "$RESULTS_FILE"
    echo "═══════════════════════════════════════════════════════════════════════════" | tee -a "$RESULTS_FILE"
    echo ""
}

###############################################################################
# TEST PHASES
###############################################################################

section_header "PHASE 1: PUBLIC PAGES"

test_endpoint "Homepage" "$BASE_URL/" "200"
test_endpoint "About Page" "$BASE_URL/about" "200"
test_endpoint "Contact Page" "$BASE_URL/contact" "200"
test_endpoint "Privacy Policy" "$BASE_URL/privacy" "200"
test_endpoint "Terms & Conditions" "$BASE_URL/terms" "200"
test_endpoint "Team Page" "$BASE_URL/about/team" "200"
test_endpoint "Accreditations Page" "$BASE_URL/about/accreditations" "200"

section_header "PHASE 2: COURSES & TRAINING"

test_endpoint "Courses Catalog" "$BASE_URL/courses" "200"
test_endpoint "E-Learning Page" "$BASE_URL/e-learning" "200"
test_endpoint "Face-to-Face Training" "$BASE_URL/face-to-face" "200"
test_endpoint "Virtual Learning" "$BASE_URL/virtual-learning" "200"
test_endpoint "In-House Training" "$BASE_URL/in-house-training" "200"
test_endpoint "Schedule Page" "$BASE_URL/schedule" "200"
test_endpoint "Categories Index" "$BASE_URL/categories" "200,307"
test_endpoint "Health Safety Category" "$BASE_URL/categories/health-safety" "200,307"

section_header "PHASE 3: SERVICES & CONSULTANCY"

test_endpoint "Services Page" "$BASE_URL/services" "200"
test_endpoint "Free Consultation" "$BASE_URL/free-consultation" "200"

section_header "PHASE 4: BLOG"

test_endpoint "Blog Index" "$BASE_URL/blog" "200"

section_header "PHASE 5: AUTHENTICATION"

test_endpoint "Login Page" "$BASE_URL/login" "200"
test_endpoint "Register Page" "$BASE_URL/register" "200"
test_endpoint "Forgot Password" "$BASE_URL/forgot-password" "200"

section_header "PHASE 6: USER DASHBOARD (Protected)"

test_endpoint "Dashboard" "$BASE_URL/dashboard" "200,307,401"
test_endpoint "My Courses" "$BASE_URL/my-courses" "200,307,401"
test_endpoint "My Learning" "$BASE_URL/my-learning" "200,307,401"
test_endpoint "Profile" "$BASE_URL/profile" "200,307,401"
test_endpoint "Settings" "$BASE_URL/settings" "200,307,401"
test_endpoint "Certificates" "$BASE_URL/certificates" "200,307,401"
test_endpoint "Achievements" "$BASE_URL/achievements" "200,307,401"
test_endpoint "Leaderboard" "$BASE_URL/leaderboard" "200,307,401"

section_header "PHASE 7: COMMERCE"

test_endpoint "Cart" "$BASE_URL/cart" "200"
test_endpoint "Checkout" "$BASE_URL/checkout" "200,307"

section_header "PHASE 8: ADMIN PANEL (Protected)"

test_endpoint "Admin Dashboard" "$BASE_URL/admin" "200,307,401"
test_endpoint "Admin Analytics" "$BASE_URL/admin/analytics" "200,307,401"
test_endpoint "Admin Users" "$BASE_URL/admin/users" "200,307,401"
test_endpoint "Admin Certificates" "$BASE_URL/admin/certificates" "200,307,401"
test_endpoint "Admin Settings" "$BASE_URL/admin/settings" "200,307,401"

section_header "PHASE 9: API ENDPOINTS"

test_json_api "API: Courses List" "$API_BASE/courses"
test_json_api "API: Categories" "$API_BASE/categories"
test_json_api "API: Blog Posts" "$API_BASE/blog"
test_json_api "API: CMS Services" "$API_BASE/cms/services"
test_json_api "API: CMS Partners" "$API_BASE/cms/partners"
test_json_api "API: CMS Testimonials" "$API_BASE/cms/testimonials"
test_json_api "API: CMS Team" "$API_BASE/cms/team"
test_json_api "API: CMS FAQs" "$API_BASE/cms/faqs"
test_json_api "API: CMS Homepage" "$API_BASE/cms/homepage"
test_json_api "API: CMS Statistics" "$API_BASE/cms/statistics"
test_json_api "API: Schedules" "$API_BASE/schedules"
test_json_api "API: Gamification Badges" "$API_BASE/gamification/badges"
test_json_api "API: Leaderboard" "$API_BASE/gamification/leaderboard"

section_header "PHASE 10: SEO & METADATA"

test_endpoint "Robots.txt" "$BASE_URL/robots.txt" "200"
test_endpoint "Sitemap XML" "$BASE_URL/sitemap.xml" "200"

###############################################################################
# RESULTS SUMMARY
###############################################################################

echo "]}}}" >> "$JSON_FILE"

TOTAL_TESTS=$((PASSED_TESTS + FAILED_TESTS + WARNING_TESTS))
if [ $TOTAL_TESTS -eq 0 ]; then
    SUCCESS_RATE=0
else
    SUCCESS_RATE=$(( (PASSED_TESTS + WARNING_TESTS) * 100 / TOTAL_TESTS ))
fi

section_header "TEST RESULTS SUMMARY"

{
    echo "Total Tests:    $TOTAL_TESTS"
    echo "Passed:         $PASSED_TESTS ✅"
    echo "Warnings:       $WARNING_TESTS ⚠️"
    echo "Failed:         $FAILED_TESTS ❌"
    echo "Success Rate:   $SUCCESS_RATE%"
    echo ""
    echo "Results saved to: $RESULTS_FILE"
    echo "JSON report: $JSON_FILE"
    echo "Completed at: $(date)"
    echo ""
} | tee -a "$RESULTS_FILE"

# Production readiness assessment
if [ $FAILED_TESTS -eq 0 ] && [ $SUCCESS_RATE -ge 95 ]; then
    echo "✅ PRODUCTION READY: All tests passed!" | tee -a "$RESULTS_FILE"
    exit 0
elif [ $SUCCESS_RATE -ge 90 ]; then
    echo "⚠️  NEARLY READY: Success rate >= 90%, minor issues detected" | tee -a "$RESULTS_FILE"
    exit 0
elif [ $SUCCESS_RATE -ge 75 ]; then
    echo "⚠️  NEEDS WORK: Success rate 75-89%, several issues need fixing" | tee -a "$RESULTS_FILE"
    exit 1
else
    echo "❌ NOT READY: Success rate < 75%, major issues detected" | tee -a "$RESULTS_FILE"
    exit 1
fi
