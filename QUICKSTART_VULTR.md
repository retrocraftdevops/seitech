# Seitech Odoo on Vultr - Quick Start Guide

## ✅ What's Been Set Up

Your Seitech Odoo deployment is now configured for **non-Docker production on Vultr** with:

1. **Git Sparse Checkout** - Only syncs Odoo files (~500MB, not 2GB+)
2. **Automated Deployment Scripts** - Push → GitHub → Vultr in seconds
3. **Module Fixes** - seitech_elearning module is fixed and ready
4. **Complete Documentation** - Everything you need to deploy

---

## 🚀 First-Time Setup (On Vultr Server)

Run this **once** on your Vultr server to initialize everything:

```bash
# SSH into Vultr
ssh root@45.76.138.109

# Download and run setup script
curl -o /tmp/vultr-setup.sh https://raw.githubusercontent.com/retrocraftdevops/seitech/main/vultr-setup.sh
bash /tmp/vultr-setup.sh
```

This will:
- Initialize Git with sparse checkout
- Pull only Odoo-related files
- Create deployment script at `/opt/odoo/deploy.sh`
- Set up deployment logging

---

## 📤 Deploy Changes (Regular Workflow)

**From your local machine**, deploy changes in one command:

```bash
# Go to your seitech directory
cd ~/projects/seitech

# Make your deployment script executable (one-time)
chmod +x deploy-to-vultr.sh

# Deploy with a commit message
./deploy-to-vultr.sh "Fix seitech_elearning module validation"
```

This will:
1. ✅ Commit your changes locally
2. ✅ Push to GitHub
3. ✅ SSH to Vultr
4. ✅ Pull latest code (sparse checkout)
5. ✅ Restart Odoo service
6. ✅ Log the deployment

**That's it!** Your changes are live on production.

---

## 📋 What Gets Synced to Vultr

```
/opt/odoo/
├── custom_addons/           ← Your modules (seitech_elearning, etc)
├── odoo-source/             ← Odoo core (symlink or actual)
├── config/                  ← Odoo configuration
└── .env.production          ← Environment variables
```

**NOT synced** (saves ~75% disk space):
- frontend/ (Next.js)
- legacy-php/ (PHP code)
- Docker files
- node_modules, etc.

---

## 🔍 Check Deployment Status

```bash
# View recent deployments
ssh root@45.76.138.109 "cat /var/log/odoo/deployments.log"

# Check Odoo status
ssh root@45.76.138.109 "sudo systemctl status odoo"

# View live logs
ssh root@45.76.138.109 "tail -f /var/log/odoo/odoo.log"
```

---

## ⏮️ Rollback if Needed

```bash
# SSH to Vultr
ssh root@45.76.138.109

# View history
cd /opt/odoo && git log --oneline -5

# Rollback (undo last deployment)
git revert HEAD
sudo systemctl restart odoo
```

---

## 📊 Disk Space Savings

| Setup | Size |
|-------|------|
| Full Repository Clone | ~2 GB |
| Sparse Checkout (Odoo only) | ~500 MB |
| **Savings** | **~75%** ✅ |

---

## 📚 Full Documentation

For detailed information, see:

- **VULTR_DEPLOYMENT.md** - Complete deployment guide
- **DOCKER_DEPRECATION.md** - Why we moved away from Docker
- **vultr-setup.sh** - Server initialization script
- **deploy-to-vultr.sh** - Local deployment script

---

## ✨ Recent Fixes Applied

The following fixes have been committed and are ready to deploy:

1. **seitech_elearning module** - Fixed missing action methods and field mismatches
   - Added: `action_view_enrollments`, `action_cancel`, `action_reset_to_draft`
   - Added: `action_view_skill_gaps`, `action_generate_recommendations`
   - Fixed: Field name references in views
   - Added: `cancelled` state

---

## 🆘 Troubleshooting

### Deployment takes too long?
- First deploy takes longer due to initial git pull
- Subsequent deploys are ~5 seconds
- Check: `ssh root@45.76.138.109 "cd /opt/odoo && git status"`

### Module not reloading?
- Check Odoo logs: `ssh root@45.76.138.109 "tail -f /var/log/odoo/odoo.log"`
- Verify files exist: `ssh root@45.76.138.109 "ls -la /opt/odoo/custom_addons/seitech_elearning/"`

### Git clone pulling too many files?
- Verify sparse checkout: `ssh root@45.76.138.109 "cat /opt/odoo/.git/info/sparse-checkout"`
- If broken, fix with: `git config core.sparseCheckout true`

---

## 📞 Support

All documentation is in the repository root:
- `VULTR_DEPLOYMENT.md` - Full guide
- `DOCKER_DEPRECATION.md` - Architecture explanation
- `vultr-setup.sh` - Setup script with comments
- `deploy-to-vultr.sh` - Deploy script with comments

---

## 🎯 Next Steps

1. **First time?** Run `vultr-setup.sh` on Vultr
2. **Ready to deploy?** Use `./deploy-to-vultr.sh "message"`
3. **Want details?** Read `VULTR_DEPLOYMENT.md`

**Happy deploying!** 🚀
