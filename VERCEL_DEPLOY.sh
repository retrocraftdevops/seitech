#!/bin/bash
# Seitech Frontend - Vercel Deployment Script
# This script sets up environment variables and deploys to Vercel

set -e

echo "========================================"
echo "Seitech Frontend - Vercel Deployment"
echo "========================================"
echo ""

# Step 1: Verify Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Step 2: Login
echo "🔐 Logging in to Vercel..."
vercel login

echo ""
echo "========================================"
echo "Setting Production Environment Variables"
echo "========================================"

# Production env vars
vercel env set NEXT_PUBLIC_ODOO_URL http://45.76.138.109:8069 production
vercel env set NEXT_PUBLIC_SITE_URL https://seitech-frontend.vercel.app production
vercel env set ODOO_DATABASE seitech_production production
vercel env set ODOO_ADMIN_USER admin production
vercel env set ODOO_ADMIN_PASSWORD admin production

echo ""
echo "========================================"
echo "Setting Preview Environment Variables"
echo "========================================"

# Preview env vars (optional, for branch deployments)
vercel env set NEXT_PUBLIC_ODOO_URL http://45.76.138.109:8069 preview
vercel env set NEXT_PUBLIC_SITE_URL https://seitech-frontend.vercel.app preview
vercel env set ODOO_DATABASE seitech_production preview
vercel env set ODOO_ADMIN_USER admin preview
vercel env set ODOO_ADMIN_PASSWORD admin preview

echo ""
echo "========================================"
echo "Verifying Environment Variables"
echo "========================================"

vercel env ls

echo ""
echo "========================================"
echo "Triggering Production Deployment"
echo "========================================"

vercel --prod

echo ""
echo "========================================"
echo "✅ Deployment Complete!"
echo "========================================"
echo ""
echo "Test the deployment:"
echo "  curl -s https://seitech-frontend.vercel.app/api/dashboard/stats"
echo ""
echo "Or visit:"
echo "  https://seitech-frontend.vercel.app/login"
echo ""
