# Module Upgrade Fix

## Issue Fixed

✅ **Removed invalid `category_id` field** from `group_elearning_support_agent` definition.

The error was:
```
ValueError: Invalid field 'category_id' in 'res.groups'
```

## Current Status

The group definition is now correct and matches other groups in `elearning_groups.xml`.

## If Upgrade Still Fails

### Option 1: Uninstall and Reinstall

1. Go to http://localhost:8069
2. Apps → Search "Seitech E-Learning"
3. Click "Uninstall"
4. Wait for completion
5. Click "Install"
6. Then "Upgrade" if needed

### Option 2: Manual Group Creation

If the group already exists partially, you can:

1. Go to Settings → Users & Companies → Groups
2. Search for "Support Agent"
3. If it exists, delete it
4. Then upgrade the module

### Option 3: Database Cleanup

If there are partial records:

```sql
-- Connect to database
psql -d seitech -U odoo

-- Check for existing group
SELECT id, name FROM res_groups WHERE name = 'Support Agent';

-- If exists and causing issues, you may need to:
-- 1. Delete access rules referencing it
-- 2. Delete the group
-- 3. Then upgrade module
```

## Verification

After successful upgrade, test:

```bash
curl -X POST http://localhost:8069/api/chat/support \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:4000" \
  -d '{"name":"Test","email":"test@test.com"}'
```

Should return:
```json
{
  "success": true,
  "channel_id": 1,
  "session_token": "..."
}
```

## Files Fixed

- ✅ `custom_addons/seitech_elearning/security/elearning_groups.xml`
  - Removed `category_id` field from support agent group

