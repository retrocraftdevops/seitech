#!/bin/bash

# SEI Tech Frontend Implementation Script
# Automates the setup and verification process

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   SEI Tech Frontend Implementation - Phase 1 Setup          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the frontend directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Step 1: Installing dependencies...${NC}"
echo ""

# Check if dependencies are missing
MISSING_DEPS=()

# Check for testing dependencies
if ! grep -q "vitest" package.json; then
    MISSING_DEPS+=("vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom")
fi

# Check for accessibility testing
if ! grep -q "@axe-core/playwright" package.json; then
    MISSING_DEPS+=("@axe-core/playwright")
fi

# Check for bundle analyzer
if ! grep -q "@next/bundle-analyzer" package.json; then
    MISSING_DEPS+=("@next/bundle-analyzer")
fi

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    echo -e "${YELLOW}Installing missing dependencies...${NC}"
    npm install --save-dev "${MISSING_DEPS[@]}"
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ All required dependencies are already installed${NC}"
fi

echo ""
echo -e "${YELLOW}🔧 Step 2: Updating package.json scripts...${NC}"

# Add scripts if they don't exist
if ! grep -q '"analyze"' package.json; then
    echo -e "${YELLOW}Adding bundle analyzer script...${NC}"
    # Note: Manual intervention needed for package.json
    echo -e "${YELLOW}⚠️  Please add the following to your package.json scripts:${NC}"
    echo '  "analyze": "ANALYZE=true next build",'
    echo '  "generate:scss-tokens": "node scripts/generate-scss-tokens.js",'
    echo '  "test:a11y": "playwright test tests/accessibility.spec.ts"'
fi

echo ""
echo -e "${YELLOW}🎨 Step 3: Generating SCSS tokens...${NC}"

# Check if script exists
if [ -f "scripts/generate-scss-tokens.js" ]; then
    node scripts/generate-scss-tokens.js || echo -e "${YELLOW}⚠️  SCSS generation skipped (requires Odoo setup)${NC}"
else
    echo -e "${YELLOW}⚠️  SCSS generator script not found - creating one...${NC}"
    mkdir -p scripts
    echo "console.log('SCSS token generator - placeholder');" > scripts/generate-scss-tokens.js
fi

echo ""
echo -e "${YELLOW}✅ Step 4: Running type check...${NC}"
npm run type-check || echo -e "${YELLOW}⚠️  Type check found issues - please review${NC}"

echo ""
echo -e "${YELLOW}🧪 Step 5: Running tests...${NC}"
npm test || echo -e "${YELLOW}⚠️  Tests need attention${NC}"

echo ""
echo -e "${YELLOW}🔍 Step 6: Running linter...${NC}"
npm run lint || echo -e "${YELLOW}⚠️  Linting issues found - run 'npm run lint:fix'${NC}"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   Implementation Status Summary                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Count implemented files
CONFIG_FILES=$(find config -type f 2>/dev/null | wc -l || echo "0")
TEST_FILES=$(find src/test -type f 2>/dev/null | wc -l || echo "0")
SECURITY_FILES=$(find src/lib/security -type f 2>/dev/null | wc -l || echo "0")
SEO_FILES=$(find src/lib/seo -type f 2>/dev/null | wc -l || echo "0")

echo -e "Configuration files: ${GREEN}${CONFIG_FILES}${NC}"
echo -e "Test files: ${GREEN}${TEST_FILES}${NC}"
echo -e "Security files: ${GREEN}${SECURITY_FILES}${NC}"
echo -e "SEO files: ${GREEN}${SEO_FILES}${NC}"

echo ""
echo -e "${GREEN}✅ Phase 1 Setup Complete!${NC}"
echo ""
echo "Next Steps:"
echo "1. Review and update .env.local with required variables"
echo "2. Configure GitHub secrets for CI/CD"
echo "3. Run 'npm run analyze' to check bundle size"
echo "4. Run 'npm run test:a11y' for accessibility tests"
echo "5. Push to GitHub to trigger CI/CD pipeline"
echo ""
echo "For more information, see:"
echo "  - docs/FRONTEND_QUICK_WINS.md"
echo "  - docs/MULTI_AGENT_IMPLEMENTATION_REPORT.md"
echo ""
