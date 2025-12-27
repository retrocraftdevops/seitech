# SEI Tech Frontend - Quick Reference Guide

## 🚀 Quick Start

### Start Frontend
```bash
cd frontend
npm run dev
# Access at http://localhost:4000
```

### Stop Frontend
```bash
# Find and kill process
fuser -k 4000/tcp
# Or
lsof -ti:4000 | xargs kill -9
```

## 📁 Key Files & Directories

### Chat System
```
frontend/src/components/chat/
├── ChatContext.tsx          # State management (use client)
├── ChatWindow.tsx           # Main chat interface
├── ChatSidebar.tsx          # Channel list
├── ChatInterface.tsx        # Wrapper component
├── PublicSupportChat.tsx    # Floating support widget
└── index.ts                 # Exports
```

### API Integration
```
frontend/src/lib/
├── odoo-api.ts             # Axios Odoo client
├── api/
│   ├── odoo-client.ts      # JSON-RPC client
│   ├── courses.ts          # Course endpoints
│   └── cms.ts              # CMS endpoints
└── auth.ts                 # Authentication
```

### Pages
```
frontend/src/app/
├── (marketing)/            # Public marketing pages
├── (training)/             # Training pages
├── (dashboard)/            # Protected user pages
├── (admin)/                # Admin pages
├── (auth)/                 # Auth pages
└── (commerce)/             # Cart & checkout
```

## 🎯 Current Status

### ✅ Working
- All routes loading (200 OK)
- Chat UI complete
- API client configured
- Authentication flow
- Responsive design

### ⚠️ Needs Backend
- Chat messaging (endpoints required)
- Schedule API (`website_slug` field issue)
- File uploads for chat

## 🛠️ Common Tasks

### Add New Page
```bash
# Create page in appropriate route group
touch frontend/src/app/(marketing)/new-page/page.tsx
```

```tsx
export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
}
```

### Add API Endpoint
```bash
touch frontend/src/app/api/new-endpoint/route.ts
```

```tsx
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ data: 'response' });
}
```

### Use Chat in Component
```tsx
import { useChat } from '@/components/chat';

function MyComponent() {
  const { sendMessage, messages } = useChat();
  
  const handleSend = async () => {
    await sendMessage('Hello!');
  };
  
  return <button onClick={handleSend}>Send</button>;
}
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill all node processes
pkill -f "node.*4000"

# Or force kill specific port
fuser -k 4000/tcp
```

### Module Not Found
```bash
# Clear cache and reinstall
cd frontend
rm -rf .next node_modules
npm install
```

### Odoo API Errors
Check `.env.local`:
```env
NEXT_PUBLIC_ODOO_URL=http://localhost:8069
```

Verify Odoo is running:
```bash
curl http://localhost:8069/web/database/selector
```

## 📊 Testing

### Test Single Route
```bash
curl -v http://localhost:4000/courses
```

### Test API Endpoint
```bash
curl http://localhost:4000/api/auth/me
```

### Check Build
```bash
cd frontend
npm run build
```

## 🔧 Configuration

### Environment Variables
```env
# frontend/.env.local
NEXT_PUBLIC_ODOO_URL=http://localhost:8069
NEXT_PUBLIC_WS_URL=ws://localhost:8069
NEXT_PUBLIC_APP_URL=http://localhost:4000
```

### TypeScript Config
```json
// frontend/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 📚 Documentation Files

- `FRONTEND_IMPLEMENTATION_STATUS.md` - Full implementation details
- `FRONTEND_ROUTE_TESTING.md` - Test results and API status
- `docs/chat-implementation.md` - Chat system documentation
- `docs/api-integration.md` - API integration guide

## 🚨 Critical Information

### Chat Backend Requirements
Create in Odoo: `custom_addons/seitech_elearning/controllers/chat.py`

Required endpoints:
- `/api/chat/channels` - Get user channels
- `/api/chat/messages` - Get messages
- `/api/chat/send` - Send message
- `/api/chat/support` - Public support
- `/api/chat/support/send` - Public support message

### Schedule API Fix
Add to `slide.channel` model:
```python
website_slug = fields.Char(
    string='Website Slug',
    compute='_compute_website_slug',
    store=True
)
```

## 💡 Tips

1. **Always use `use client` directive** for components using hooks
2. **Check browser console** for runtime errors
3. **Use React DevTools** for debugging state
4. **Monitor Network tab** for API issues
5. **Clear `.next` folder** if seeing stale data

## 🎨 UI Components

### Import Common Components
```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
```

### Use Chat Components
```tsx
import { ChatInterface } from '@/components/chat';
import { PublicSupportChat } from '@/components/chat';

// In your page
<PublicSupportChat /> // Auto-shows on all public pages
```

## 🔐 Authentication

### Check Auth Status
```tsx
import { useAuth } from '@/components/providers/AuthProvider';

function MyComponent() {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;
  
  return <div>Welcome {user.name}</div>;
}
```

### Protected Route
```tsx
// middleware.ts handles this automatically
// Public routes: /, /about, /courses, etc.
// Protected: /dashboard/*, /admin/*
// Auth: /login, /register
```

## 📱 Responsive Design

### Tailwind Breakpoints
```tsx
<div className="
  text-sm md:text-base lg:text-lg
  p-4 md:p-6 lg:p-8
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
">
```

## 🎯 Next Actions

1. **Implement chat backend** (4-6 hours)
2. **Fix schedule API** (30 mins)
3. **Add static assets** (15 mins)
4. **Test all routes manually** (1 hour)
5. **Deploy to staging** (2 hours)

---

**Last Updated**: December 24, 2024
**Frontend Status**: 🟢 OPERATIONAL
**Chat Status**: 🟡 FRONTEND READY (Backend Pending)
