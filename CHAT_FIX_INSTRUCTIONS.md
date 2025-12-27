# Chat System Fix Instructions

## Current Status

✅ **Controller Code**: All CORS headers and endpoints are correctly implemented  
❌ **Odoo Server**: Needs restart to load updated controller code  
❌ **Database Tables**: Module needs to be installed/upgraded  

## Quick Fix Steps

### Step 1: Upgrade the Module (Create Database Tables)

```bash
cd /home/rodrickmakore/projects/seitech

# Option A: If you have direct access to Odoo
python3 -m odoo -c config/odoo.conf -u seitech_elearning -d seitech --stop-after-init

# Option B: Via Odoo UI
# 1. Go to http://localhost:8069
# 2. Login as admin
# 3. Go to Apps → Search "Seitech E-Learning"
# 4. Click "Upgrade"
```

### Step 2: Restart Odoo Server

**If running via systemd:**
```bash
sudo systemctl restart odoo
```

**If running manually:**
```bash
# Stop the current process (Ctrl+C or kill PID)
# Then restart:
python3 -m odoo -c config/odoo.conf
```

**If running in Docker:**
```bash
docker compose restart odoo
```

**If running via the process found:**
```bash
# Find the process
ps aux | grep odoo | grep -v grep

# Restart it (adjust based on your setup)
sudo systemctl restart odoo
# OR
kill <PID> && python3 -m odoo -c config/odoo.conf
```

### Step 3: Verify Fix

Run the test script:
```bash
./scripts/test-chat-api.sh
```

Or test manually:
```bash
# Test CORS
curl -X OPTIONS http://localhost:8069/api/chat/support \
  -H "Origin: http://localhost:4000" \
  -H "Access-Control-Request-Method: POST" \
  -i | grep -i "access-control"

# Test API
curl -X POST http://localhost:8069/api/chat/support \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:4000" \
  -d '{"name":"Test","email":"test@test.com"}'
```

### Step 4: Test Frontend

1. Ensure frontend is running: `cd frontend && npm run dev`
2. Open http://localhost:4000
3. Click chat widget
4. Enter name and email
5. Click "Start Chatting"

## Expected Results

After fixing:

✅ **CORS Headers**: Should see `Access-Control-Allow-Origin: *` in response  
✅ **Database**: Should create channel successfully (no "does not exist" error)  
✅ **Frontend**: Chat should connect and show "Online" status  
✅ **Messages**: Should be able to send and receive messages  

## Troubleshooting

### Issue: Still getting CORS errors

**Solution**: 
1. Verify Odoo was restarted
2. Check Odoo logs: `tail -f logs/odoo.log`
3. Verify controller file was saved: `grep -r "Access-Control-Allow-Origin" custom_addons/seitech_elearning/controllers/chat.py`

### Issue: Database tables still missing

**Solution**:
1. Check module is installed: In Odoo UI → Apps → Search "seitech_elearning"
2. If not installed, install it first, then upgrade
3. Check database connection in `config/odoo.conf`
4. Verify database name is correct

### Issue: Module upgrade fails

**Solution**:
1. Check Odoo logs for errors
2. Verify all dependencies are installed
3. Try installing module first: `-i seitech_elearning` then upgrade: `-u seitech_elearning`

## Verification Checklist

- [ ] Module upgraded successfully
- [ ] Odoo server restarted
- [ ] CORS headers present in API responses
- [ ] Database tables created (no "does not exist" errors)
- [ ] Frontend can connect to chat
- [ ] Can send messages
- [ ] Can receive messages

## Files Modified

- ✅ `custom_addons/seitech_elearning/controllers/chat.py` - CORS headers added
- ✅ `frontend/src/components/chat/PublicSupportChat.tsx` - Error handling improved
- ✅ `frontend/src/components/chat/ChatContext.tsx` - Error handling improved
- ✅ `frontend/public/site.webmanifest` - Created
- ✅ `frontend/public/images/hero-pattern.svg` - Created
- ✅ `frontend/public/apple-touch-icon.png` - Created

All code changes are complete. Only server restart and module upgrade needed.

