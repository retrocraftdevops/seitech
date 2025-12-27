# Quick Fix Guide - SEI Tech Frontend

**For:** Rodrickmakore  
**Status:** Server Running ✅  
**URL:** http://localhost:4000

---

## ✅ What's Working Right Now

1. **Server is running** on port 4000
2. **Homepage loads** (200 OK)
3. **Chat system is integrated** in the code
4. **API endpoints responding** (auth, CMS)
5. **No server crashes** - stable

---

## ⚠️ Issues to Fix

### 1. Odoo API Field Error (CRITICAL)

**Error:**
```
Error: Invalid field 'website_slug' on 'slide.channel'
```

**Location:** `/api/schedules` endpoint

**Fix Options:**

**Option A - Add field to Odoo:**
```bash
# SSH to Odoo server or use Odoo UI
# Add 'website_slug' field to slide.channel model
# OR use existing field like 'website_url'
```

**Option B - Update API query:**
```bash
cd /home/rodrickmakore/projects/seitech/frontend
```

Find and edit: `src/app/api/schedules/route.ts`

Change line ~170 from:
```typescript
fields: ['id', 'name', 'website_slug', ...],
```

To:
```typescript
fields: ['id', 'name', 'website_url', ...],
// Or remove 'website_slug' entirely
```

---

### 2. Missing Assets (LOW PRIORITY)

**Missing files:**
- `/public/images/hero-pattern.svg`
- `/public/site.webmanifest`

**Quick fix:**
```bash
cd /home/rodrickmakore/projects/seitech/frontend/public

# Create basic manifest
cat > site.webmanifest << 'EOF'
{
  "name": "SEI Tech International",
  "short_name": "SEI Tech",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ],
  "theme_color": "#16a34a",
  "background_color": "#ffffff",
  "display": "standalone"
}
EOF

# Create placeholder SVG
mkdir -p images
cat > images/hero-pattern.svg << 'EOF'
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
    <circle cx="10" cy="10" r="2" fill="rgba(2, 132, 199, 0.1)"/>
  </pattern>
  <rect width="100" height="100" fill="url(#pattern)"/>
</svg>
EOF
```

---

### 3. Category Page Redirect

**Issue:** `/categories/health-safety` returns 307

**Quick check:**
```bash
cd /home/rodrickmakore/projects/seitech/frontend

# Check middleware
cat src/middleware.ts | grep -A 10 "categories"

# Check category page
cat src/app/categories/[slug]/page.tsx | head -50
```

**Likely cause:** Middleware redirecting or route not matching

---

## 🎯 Verify Chat is Visible

**Steps:**
1. Open browser: http://localhost:4000
2. Look for floating button in **bottom-right corner**
3. Should see a chat icon (message bubble)
4. Click to open chat interface

**If not visible:**
```bash
# Check browser console for errors
# Open Developer Tools (F12)
# Look for JavaScript errors
# Check if PublicSupportChat component rendered
```

**Troubleshoot:**
```bash
cd /home/rodrickmakore/projects/seitech/frontend

# Check component exists
ls -la src/components/chat/PublicSupportChat.tsx

# Verify it's imported in layout
grep "PublicSupportChat" src/app/layout.tsx

# Check for CSS issues
grep -r "z-index" src/components/chat/
```

---

## 🚀 Server Management

### Start Server (if not running)
```bash
cd /home/rodrickmakore/projects/seitech/frontend
npm run dev
```

### Stop Server
```bash
# Press Ctrl+C in the terminal running npm run dev
# Or find and kill process:
ps aux | grep "next dev"
kill -9 [PID]
```

### Restart Server (if issues)
```bash
cd /home/rodrickmakore/projects/seitech/frontend
rm -rf .next
npm run dev
```

### Check Server Status
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/
# Should return: 200
```

---

## 📊 Quick Health Check

**Run these commands to verify everything:**

```bash
cd /home/rodrickmakore/projects/seitech/frontend

# 1. Check homepage
curl -s -o /dev/null -w "Homepage: %{http_code}\n" http://localhost:4000/

# 2. Check auth API
curl -s -o /dev/null -w "Auth API: %{http_code}\n" http://localhost:4000/api/auth/me

# 3. Check CMS API
curl -s -o /dev/null -w "CMS API: %{http_code}\n" http://localhost:4000/api/cms/sections/home-hero

# 4. Check categories
curl -s -o /dev/null -w "Categories: %{http_code}\n" http://localhost:4000/categories/health-safety

# 5. List running processes
ps aux | grep "node.*next" | grep -v grep
```

**Expected output:**
```
Homepage: 200
Auth API: 200
CMS API: 200
Categories: 307 (or 200 after fix)
[Node processes listed]
```

---

## 🐛 If Server Won't Start

### 1. Check for port conflict
```bash
lsof -i :4000
# If something is using port 4000:
kill -9 [PID]
```

### 2. Clean build
```bash
cd /home/rodrickmakore/projects/seitech/frontend
rm -rf .next node_modules
npm install
npm run dev
```

### 3. Check Node version
```bash
node --version
# Should be v18+ or v20+
```

### 4. Check dependencies
```bash
cd /home/rodrickmakore/projects/seitech/frontend
npm list --depth=0
# Look for missing or broken packages
```

---

## 📱 Test from Browser

**Open these URLs in your browser:**

1. **Homepage:** http://localhost:4000/
   - Should load normally
   - Check for chat widget (bottom-right)

2. **About:** http://localhost:4000/about
   - Test navigation

3. **Categories:** http://localhost:4000/categories
   - Check course listings

4. **Dashboard:** http://localhost:4000/dashboard
   - May need login

5. **API Test:** http://localhost:4000/api/auth/me
   - Should return JSON (user data or error)

---

## 💬 Chat Troubleshooting

### Chat not visible?

**Check 1 - Component mounted:**
```bash
grep -n "PublicSupportChat" /home/rodrickmakore/projects/seitech/frontend/src/app/layout.tsx
# Should show line number where it's imported
```

**Check 2 - Console errors:**
- Open browser DevTools (F12)
- Go to Console tab
- Look for errors mentioning "chat" or "PublicSupport"

**Check 3 - CSS visibility:**
```bash
# Check if component has proper z-index
cat /home/rodrickmakore/projects/seitech/frontend/src/components/chat/PublicSupportChat.tsx | grep -i "z-index\|fixed\|absolute"
```

**Manual verification:**
```bash
# View the component source
cat /home/rodrickmakore/projects/seitech/frontend/src/components/chat/PublicSupportChat.tsx | head -100
```

---

## 🔧 Quick Fixes Applied Today

1. ✅ **Removed duplicate dashboard routes**
   - Deleted `/src/app/dashboard/`
   - Deleted `/src/app/(dashboard)/dashboard/`
   - Now only `/(dashboard)/page.tsx` exists

2. ✅ **Cleared build cache**
   - Removed `.next` directory
   - Forced clean rebuild

3. ✅ **Verified chat integration**
   - Confirmed components exist
   - Confirmed mounted in layout
   - Needs visual browser test

---

## 📞 Emergency Commands

### Server completely broken?
```bash
cd /home/rodrickmakore/projects/seitech/frontend

# Nuclear option - full reset
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Need to revert changes?
```bash
cd /home/rodrickmakore/projects/seitech
git status
git log --oneline -10
# git checkout [commit-hash]  # If needed
```

### Backup current state
```bash
cd /home/rodrickmakore/projects/seitech
tar -czf frontend-backup-$(date +%Y%m%d-%H%M%S).tar.gz frontend/
```

---

## ✅ Success Indicators

**Your frontend is healthy if:**
- ✅ `npm run dev` starts without errors
- ✅ Homepage loads in browser (200)
- ✅ No red errors in terminal
- ✅ Hot reload works (changes appear after save)
- ✅ API endpoints return data
- ✅ Chat widget visible in browser

---

## 📋 Daily Checklist

**Before starting work:**
- [ ] Start frontend: `npm run dev`
- [ ] Check homepage loads
- [ ] Check terminal for errors
- [ ] Verify chat visible
- [ ] Test key user flows

**Before committing:**
- [ ] Run tests: `npm test`
- [ ] Run type check: `npm run type-check`
- [ ] Run linter: `npm run lint`
- [ ] Check for console errors
- [ ] Test in browser

---

## 🎯 Next Session Goals

1. **Fix Odoo API error** (website_slug)
2. **Add missing assets** (SVG, manifest)
3. **Test all routes** systematically
4. **Verify chat** in browser
5. **Performance testing**

---

**Need help?** Check the comprehensive docs:
- `FRONTEND_STATUS_REPORT.md` - Full status
- `IMPLEMENTATION_SUMMARY_FINAL.md` - This session's work
- `ACCESS_GUIDE.md` - Feature access guide

---

**Current Status:** ✅ RUNNING  
**Last Updated:** 2024-12-24 23:30 UTC  
**Server:** http://localhost:4000  
**Terminal:** Keep `npm run dev` running!
