#!/bin/bash
set -e

# SSL Certificate Setup Script for Odoo
# Run this after DNS is configured

SERVER_IP="45.76.138.109"
SERVER_USER="root"
DOMAIN="api.seitechinternational.org.uk"
EMAIL="admin@seitechinternational.org.uk"

echo "Setting up SSL certificate for ${DOMAIN}..."

ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
    set -e
    
    # Obtain SSL certificate
    certbot --nginx \
        -d ${DOMAIN} \
        --non-interactive \
        --agree-tos \
        --email ${EMAIL} \
        --redirect
    
    # Test auto-renewal
    certbot renew --dry-run
    
    echo "✓ SSL certificate installed"
ENDSSH

echo "✓ SSL setup complete!"
echo ""
echo "Certificate will auto-renew via cron job"
echo "Test renewal: certbot renew --dry-run"

