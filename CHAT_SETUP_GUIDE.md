# Chat System Setup Guide

## Overview

This guide provides comprehensive instructions for setting up and fixing the chat widget system.

## Issues Fixed

### 1. CORS Configuration ✅
- Added CORS headers to all chat API endpoints
- Implemented OPTIONS handlers for preflight requests
- Added `cors='*'` parameter to all public routes

### 2. Missing API Endpoints ✅
- Added `/api/chat/support/<channel_id>/messages` endpoint
- Added `/api/chat/support/<channel_id>/poll` endpoint
- Added `/api/chat/support/upload` endpoint for file attachments

### 3. Missing Frontend Files ✅
- Created `/frontend/public/site.webmanifest`
- Created `/frontend/public/images/hero-pattern.svg`

### 4. Frontend Improvements ✅
- Fixed enter key handler in chat input
- Improved error handling and user feedback
- Reduced excessive debug logging
- Better connection status management

## Installation Steps

### Step 1: Install/Upgrade Odoo Module

The chat system requires the database tables to be created. Run:

```bash
# Option 1: Via Odoo UI
# Go to Apps → Search "Seitech E-Learning" → Upgrade

# Option 2: Via Command Line
cd /home/rodrickmakore/projects/seitech
./odoo-bin -u seitech_elearning -d your_database_name --stop-after-init
```

This will create the following database tables:
- `seitech_chat_channel`
- `seitech_chat_message`
- `seitech_chat_reaction`

### Step 2: Restart Odoo Server

After upgrading the module, restart Odoo to load the updated controllers:

```bash
# If running via systemd
sudo systemctl restart odoo

# If running manually
# Stop current process and restart
./odoo-bin -c config/odoo.conf
```

### Step 3: Verify Installation

1. **Check Database Tables:**
```sql
-- Connect to PostgreSQL
psql -d your_database_name

-- Verify tables exist
\dt seitech_chat_*
```

2. **Test API Endpoint:**
```bash
curl -X POST http://localhost:8069/api/chat/support \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

Expected response:
```json
{
  "success": true,
  "channel_id": 1,
  "session_token": "..."
}
```

### Step 4: Configure Support Agents

1. Go to Odoo: **Settings → Users & Companies → Groups**
2. Find "Support Agent" group
3. Add users who should handle support chats

Or via command:
```python
# In Odoo shell
agent_group = env.ref('seitech_elearning.group_elearning_support_agent')
user = env['res.users'].search([('login', '=', 'agent@example.com')])
agent_group.users = [(4, user.id)]
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Create Support Channel
```
POST /api/chat/support
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}

Response:
{
  "success": true,
  "channel_id": 1,
  "session_token": "abc123..."
}
```

#### Send Message
```
POST /api/chat/support/send
Content-Type: application/json

{
  "channel_id": 1,
  "session_token": "abc123...",
  "content": "Hello!",
  "author_name": "John Doe"
}
```

#### Get Messages
```
GET /api/chat/support/{channel_id}/messages
Headers:
  X-Session-Token: abc123...

Response:
{
  "success": true,
  "messages": [...]
}
```

#### Poll for New Messages
```
GET /api/chat/support/{channel_id}/poll?session_token=abc123...&last_message_id=0

Response:
{
  "success": true,
  "messages": [...],
  "is_typing": false
}
```

#### Upload File
```
POST /api/chat/support/upload
Content-Type: multipart/form-data

channel_id: 1
session_token: abc123...
file: [binary file data]
author_name: John Doe

Response:
{
  "success": true,
  "message_id": 1,
  "file_url": "/web/content/123"
}
```

## Frontend Configuration

### Environment Variables

Ensure `.env.local` has:
```env
NEXT_PUBLIC_ODOO_URL=http://localhost:8069
```

### Testing the Chat Widget

1. Start frontend:
```bash
cd frontend
npm run dev
```

2. Open browser: http://localhost:4000

3. Click the chat widget button (bottom-right)

4. Enter name and email

5. Click "Start Chatting"

## Troubleshooting

### Issue: "relation seitech_chat_channel does not exist"

**Solution:** Install/upgrade the module:
```bash
./odoo-bin -u seitech_elearning -d your_database
```

### Issue: CORS errors in browser console

**Solution:** 
1. Verify CORS headers are in controller (already fixed)
2. Restart Odoo server
3. Check browser console for specific error

### Issue: Chat shows "Offline" status

**Possible causes:**
1. Database tables not created → Install module
2. API endpoint not found → Check Odoo logs
3. Network error → Check Odoo is running on port 8069

### Issue: Messages not appearing

**Check:**
1. Session token is valid
2. Channel ID matches
3. Messages exist in database:
```sql
SELECT * FROM seitech_chat_message WHERE channel_id = 1;
```

## Architecture

### Models

- **seitech.chat.channel**: Chat channels (support, direct, group, etc.)
- **seitech.chat.message**: Individual messages
- **seitech.chat.reaction**: Message reactions/emojis

### Frontend Components

- **PublicSupportChat.tsx**: Public support widget
- **ChatWindow.tsx**: Main chat interface
- **ChatSidebar.tsx**: Channel list
- **ChatContext.tsx**: State management

## Security

- Public endpoints use session tokens for authentication
- Support agents must be in "Support Agent" group
- File uploads are validated and stored securely
- CORS is configured for localhost development

## Next Steps

1. ✅ Install/upgrade module
2. ✅ Restart Odoo
3. ✅ Configure support agents
4. ✅ Test chat widget
5. ✅ Monitor logs for errors

## Support

If issues persist:
1. Check Odoo logs: `tail -f logs/odoo.log`
2. Check browser console for errors
3. Verify database tables exist
4. Test API endpoints directly with curl

