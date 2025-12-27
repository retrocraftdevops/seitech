# Seitech Odoo - Vultr Deployment Guide

## Overview

This guide covers deploying Seitech Odoo on Vultr using Git Sparse Checkout. This approach:
- ✅ Only syncs Odoo-related files (~500MB instead of 2GB+)
- ✅ Uses version control for auditing
- ✅ Enables quick rollbacks
- ✅ Automates deployments

## Initial Setup on Vultr

### Prerequisites
- Vultr server with Ubuntu 20.04+ or similar Linux
- Odoo 19.0 installed and running
- Git installed (`sudo apt-get install git`)
- SSH access with root or sudo privileges

### Step 1: Initial Setup (One-time)

On your **local machine**:

```bash
# Make setup script executable
chmod +x vultr-setup.sh

# Copy to Vultr and execute
scp vultr-setup.sh root@45.76.138.109:/tmp/
ssh root@45.76.138.109 "bash /tmp/vultr-setup.sh"
```

This script will:
1. Create `/opt/odoo` directory
2. Initialize Git repository with sparse checkout
3. Configure which directories to sync
4. Fetch initial code from GitHub
5. Create deployment script at `/opt/odoo/deploy.sh`
6. Set up deployment logging

### Step 2: Verify Setup

```bash
ssh root@45.76.138.109

# Check directory structure
ls -la /opt/odoo/

# Verify sparse checkout config
cat /opt/odoo/.git/info/sparse-checkout

# Check git status
cd /opt/odoo && git status
```

Expected output:
```
custom_addons/
odoo-source/
config/
.env.production
.env.example
```

### Step 3: Configure Environment

```bash
ssh root@45.76.138.109

# Copy production environment file
cp /opt/odoo/.env.example /opt/odoo/.env.production

# Edit with your settings
nano /opt/odoo/.env.production
```

Key variables to set:
```
SERVER_IP=45.76.138.109
DB_HOST=localhost (or your DB server)
DB_PORT=5432
DB_USER=odoo
DB_PASSWORD=<secure-password>
DB_NAME=seitech
HTTP_PORT=8069
ADMIN_PASSWORD=<secure-password>
DOMAIN=api.seitechinternational.org.uk
```

---

## Daily Deployment Workflow

### Option A: Automated Deployment (Recommended)

On your **local machine**:

```bash
# Make deployment script executable
chmod +x deploy-to-vultr.sh

# Deploy with a commit message
./deploy-to-vultr.sh "Fix seitech_elearning module validation errors"
```

This will:
1. Commit your changes locally
2. Push to GitHub
3. SSH into Vultr server
4. Pull latest changes (sparse checkout)
5. Restart Odoo service
6. Log the deployment

### Option B: Manual Deployment

If you prefer manual control:

```bash
# On Vultr server
ssh root@45.76.138.109
cd /opt/odoo
git fetch origin main
git pull origin main
sudo systemctl restart odoo

# Check status
sudo systemctl status odoo
tail -f /var/log/odoo/odoo.log
```

---

## File Structure

The sparse checkout pulls these directories:

```
/opt/odoo/
├── custom_addons/           ← Your custom modules (seitech_elearning, etc)
├── odoo-source/             ← Odoo core source (symlink or actual)
├── config/                  ← Odoo configuration files
├── .env.production          ← Production environment variables
├── .git/                    ← Git repository (sparse checkout config)
└── deploy.sh                ← Auto-generated deployment script
```

**NOT included** (saves ~1.5GB):
- frontend/ (Next.js app)
- legacy-php/ (PHP legacy code)
- docker files
- node_modules, vendor, etc.

---

## Rollback Guide

### If Something Goes Wrong

```bash
# SSH into Vultr
ssh root@45.76.138.109
cd /opt/odoo

# View deployment history
cat /var/log/odoo/deployments.log

# View git history
git log --oneline -10

# Rollback to previous commit
git revert HEAD
# OR reset to specific commit
git reset --hard <commit-hash>

# Restart Odoo
sudo systemctl restart odoo
```

### Quick Rollback Example

```bash
# Rollback last deployment
ssh root@45.76.138.109 "cd /opt/odoo && git revert HEAD && sudo systemctl restart odoo"
```

---

## Troubleshooting

### Sparse Checkout Not Working

```bash
# Verify sparse checkout is enabled
cd /opt/odoo
git config core.sparseCheckout
# Should output: true

# Verify sparse-checkout file exists
cat .git/info/sparse-checkout
```

### Git Pull Pulls Too Many Files

```bash
# Check .git/info/sparse-checkout contents
cat .git/info/sparse-checkout

# Recreate sparse-checkout if corrupted
git config core.sparseCheckout true
echo "custom_addons/" > .git/info/sparse-checkout
echo "odoo-source/" >> .git/info/sparse-checkout
echo "config/" >> .git/info/sparse-checkout
```

### Odoo Module Not Reloading

```bash
# Force module reload through Odoo
ssh root@45.76.138.109

# Method 1: Restart service
sudo systemctl restart odoo

# Method 2: Check Odoo logs
tail -f /var/log/odoo/odoo.log

# Method 3: Verify module files exist
ls -la /opt/odoo/custom_addons/seitech_elearning/
```

---

## Monitoring

### Check Deployment Status

```bash
# View recent deployments
ssh root@45.76.138.109
cat /var/log/odoo/deployments.log

# View Odoo status
sudo systemctl status odoo

# View Odoo logs
tail -f /var/log/odoo/odoo.log

# Check disk usage
df -h /opt/odoo/
```

### Check Git Status

```bash
ssh root@45.76.138.109
cd /opt/odoo
git status
git log --oneline -5
```

---

## Performance Notes

**Disk Space Savings:**
- Full repository: ~2GB
- Sparse checkout (Odoo only): ~500MB
- Savings: ~75% ✅

**Sync Time:**
- Typical pull: <5 seconds
- No unnecessary files to transfer

---

## Security Best Practices

1. **SSH Keys**: Use SSH keys, not passwords
   ```bash
   ssh-keygen -t ed25519
   ssh-copy-id root@45.76.138.109
   ```

2. **Permissions**: Verify correct file permissions
   ```bash
   ls -la /opt/odoo/
   # Should be owned by odoo user
   ```

3. **.env.production**: Never commit to git
   ```bash
   # Verify .gitignore
   cat .gitignore | grep .env
   ```

4. **Deployments**: Review changes before pushing
   ```bash
   git diff HEAD~1..HEAD
   ```

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy changes | `./deploy-to-vultr.sh "message"` |
| Check status | `ssh root@45.76.138.109 "cd /opt/odoo && git status"` |
| View logs | `ssh root@45.76.138.109 "tail -f /var/log/odoo/odoo.log"` |
| Rollback | `ssh root@45.76.138.109 "cd /opt/odoo && git revert HEAD && sudo systemctl restart odoo"` |
| Disk usage | `ssh root@45.76.138.109 "df -h /opt/odoo/"` |

---

## Support

For issues:
1. Check `/var/log/odoo/deployments.log`
2. Review Odoo logs in `/var/log/odoo/odoo.log`
3. Verify git configuration: `cd /opt/odoo && git config --list`
4. Check sparse-checkout config: `cat .git/info/sparse-checkout`
