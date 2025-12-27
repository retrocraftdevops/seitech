#!/bin/bash

################################################################################
#
# SSH Key Setup for Vultr Instance
# This script installs the public key on your Vultr instance
#
# Usage: bash SETUP_SSH_KEYS.sh
#
################################################################################

# Configuration
VULTR_IP="45.76.138.109"
VULTR_USER="root"
DB_PASSWORD="6,wDD*iQCG6+4A?H"
SSH_KEY_FILE="$HOME/.ssh/vultr_seitech.pub"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}SSH Key Setup for Vultr${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Check if SSH key exists
if [ ! -f "$SSH_KEY_FILE" ]; then
    echo -e "${RED}✗ SSH key not found at $SSH_KEY_FILE${NC}"
    echo "Please run the key generation first"
    exit 1
fi

echo -e "${GREEN}✓ SSH key found${NC}"
echo "Public Key: $SSH_KEY_FILE"
echo ""

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${BLUE}Installing sshpass for automated SSH setup...${NC}"

    # Detect OS and install accordingly
    if command -v apt-get &> /dev/null; then
        sudo apt-get update -qq
        sudo apt-get install -y sshpass > /dev/null 2>&1
    elif command -v yum &> /dev/null; then
        sudo yum install -y sshpass > /dev/null 2>&1
    elif command -v brew &> /dev/null; then
        brew install sshpass > /dev/null 2>&1
    else
        echo -e "${RED}Cannot install sshpass automatically${NC}"
        echo "Please install manually: apt-get install sshpass (Debian/Ubuntu) or brew install sshpass (Mac)"
        exit 1
    fi

    if command -v sshpass &> /dev/null; then
        echo -e "${GREEN}✓ sshpass installed${NC}"
    else
        echo -e "${RED}✗ sshpass installation failed${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}Setting up authorized_keys on Vultr...${NC}\n"

# Create authorized_keys directory and file
PUBLIC_KEY=$(cat "$SSH_KEY_FILE")

# Use sshpass to automate SSH password entry
sshpass -p "$DB_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VULTR_USER@$VULTR_IP" <<'SCRIPT'
# Create .ssh directory if needed
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add public key to authorized_keys
if [ ! -f ~/.ssh/authorized_keys ]; then
    touch ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
fi

SCRIPT

# Send the public key
sshpass -p "$DB_PASSWORD" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$SSH_KEY_FILE" "$VULTR_USER@$VULTR_IP:/tmp/vultr_seitech.pub" 2>/dev/null

# Append the key to authorized_keys
sshpass -p "$DB_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VULTR_USER@$VULTR_IP" <<'SCRIPT'
cat /tmp/vultr_seitech.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
rm /tmp/vultr_seitech.pub

echo "Public key installed"
SCRIPT

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Public key successfully installed on Vultr${NC}"
else
    echo -e "${RED}✗ Failed to install public key${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Testing key-based SSH connection...${NC}"

# Test SSH connection with key
if ssh -i "$HOME/.ssh/vultr_seitech" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VULTR_USER@$VULTR_IP" "echo 'SSH Connection Successful'" 2>/dev/null; then
    echo -e "${GREEN}✓ SSH key authentication working!${NC}"
else
    echo -e "${RED}✗ SSH key authentication test failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}SSH Setup Complete!${NC}"
echo -e "${GREEN}======================================${NC}\n"

echo "You can now connect with:"
echo -e "${BLUE}ssh vultr-seitech${NC}"
echo ""
echo "Or with explicit key:"
echo -e "${BLUE}ssh -i ~/.ssh/vultr_seitech root@45.76.138.109${NC}"
echo ""

# Add to known_hosts
ssh-keyscan -t ed25519 45.76.138.109 >> ~/.ssh/known_hosts 2>/dev/null

echo -e "${GREEN}✓ Host key added to known_hosts${NC}\n"

echo "Next steps:"
echo "1. ssh vultr-seitech"
echo "2. cd /root/seitech"
echo "3. bash VULTR_ENTERPRISE_UPGRADE.sh"
