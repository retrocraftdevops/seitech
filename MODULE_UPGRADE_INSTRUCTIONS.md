# Module Upgrade Instructions

## Current Status

✅ **Odoo Restarted**: Server running with updated code  
✅ **CORS Working**: All endpoints return CORS headers  
❌ **Database Tables**: Missing - Module needs upgrade  

## Quick Upgrade Steps

### Option 1: Via Odoo Web Interface (Recommended)

1. **Open Odoo**: http://localhost:8069
2. **Login** with admin credentials
3. **Enable Developer Mode** (if not already):
   - Go to Settings
   - Click "Activate Developer Mode" at the bottom
4. **Go to Apps** menu
5. **Remove Apps Filter**: Click "Apps" to show all apps
6. **Search** for "Seitech E-Learning" or "seitech_elearning"
7. **Click the module** to open it
8. **Click "Upgrade"** button (top right)

### Option 2: Via Odoo Shell

If you have shell access:

```bash
# Access Odoo shell
python3 -c "
import xmlrpc.client
url = 'http://localhost:8069'
db = 'seitech'
username = 'admin'
password = 'admin'  # Change if different

common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, username, password, {})

if uid:
    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
    module_ids = models.execute_kw(
        db, uid, password,
        'ir.module.module', 'search',
        [[('name', '=', 'seitech_elearning')]]
    )
    if module_ids:
        models.execute_kw(
            db, uid, password,
            'ir.module.module', 'button_immediate_upgrade',
            [module_ids]
        )
        print('Module upgrade initiated')
    else:
        print('Module not found')
else:
    print('Authentication failed')
"
```

### Option 3: Command Line (if odoo-bin available)

```bash
# Find odoo-bin
find /opt /usr -name odoo-bin 2>/dev/null

# Then run upgrade
/path/to/odoo-bin -c config/odoo.conf -u seitech_elearning -d seitech --stop-after-init

# Restart Odoo after
python3 -m odoo -c config/odoo.conf --dev=all
```

## Verification

After upgrade, test the API:

```bash
curl -X POST http://localhost:8069/api/chat/support \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:4000" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "channel_id": 1,
  "session_token": "..."
}
```

## What Gets Created

The upgrade will create these database tables:
- `seitech_chat_channel` - Chat channels
- `seitech_chat_message` - Chat messages  
- `seitech_chat_reaction` - Message reactions

## Troubleshooting

### Module Not Found
- Check module is installed: Apps → Search "seitech_elearning"
- If not installed, install it first, then upgrade

### Upgrade Fails
- Check Odoo logs: `tail -f logs/odoo.log`
- Ensure database connection is working
- Try restarting Odoo after upgrade

### Tables Still Missing
- Verify upgrade completed successfully
- Check database directly (if you have access)
- Try upgrading again

## After Successful Upgrade

1. ✅ Database tables created
2. ✅ API can create channels
3. ✅ Frontend can connect
4. ✅ Chat system fully functional

Run test script to verify:
```bash
./scripts/test-chat-api.sh
```

