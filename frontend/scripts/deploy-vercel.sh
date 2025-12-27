#!/bin/bash
# Vercel Deployment Script
# This script helps deploy the frontend to Vercel

set -e

echo "🚀 SEI Tech International - Vercel Deployment"
echo "=============================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

echo ""
echo "📦 Building project..."
npm run build

echo ""
echo "🌐 Deploying to Vercel..."
echo ""

# Deploy to production
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Verify environment variables in Vercel dashboard"
echo "2. Configure custom domain if needed"
echo "3. Test the deployed application"
echo ""
echo "🔗 View your deployment at: https://vercel.com/dashboard"

