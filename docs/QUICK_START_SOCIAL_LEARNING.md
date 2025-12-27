# Quick Start Guide - Social Learning Features

## Prerequisites

- Node.js 20+ installed
- Odoo 19.0 running with seitech_elearning module installed
- Frontend Next.js app set up

## Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

The following packages are included:
- `socket.io-client@^4.7.2` - WebSocket client
- `framer-motion@^11.5.4` - Animations
- `lucide-react@^0.446.0` - Icons
- `date-fns@^4.1.0` - Date formatting

### 2. Configure Environment

Create or update `frontend/.env.local`:

```env
# WebSocket URL (production)
NEXT_PUBLIC_WS_URL=https://your-domain.com

# App URL for CORS
NEXT_PUBLIC_APP_URL=https://your-domain.com

# For development
NEXT_PUBLIC_WS_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:4000
```

### 3. Update Odoo Module

```bash
# From project root
./scripts/dev.sh update seitech_elearning
```

This will install the new Social Learning models:
- seitech.discussion
- seitech.discussion.reply
- seitech.study.group
- seitech.study.group.member
- seitech.learning.streak
- seitech.leaderboard
- seitech.notification

### 4. Start Services

**Terminal 1 - Odoo:**
```bash
./scripts/dev.sh start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Usage

### Add NotificationCenter to Header

```tsx
// src/components/layout/Header.tsx
import NotificationCenter from '@/components/social/NotificationCenter';

export default function Header() {
  return (
    <header>
      {/* ... other header content ... */}
      <NotificationCenter />
    </header>
  );
}
```

### Add StreakWidget to Dashboard

```tsx
// src/app/dashboard/page.tsx
import StreakWidget from '@/components/social/StreakWidget';

export default function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1">
        <StreakWidget userId={currentUserId} />
      </div>
      {/* ... other dashboard widgets ... */}
    </div>
  );
}
```

### Create Discussion Forum Page

```tsx
// src/app/forums/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Discussion } from '@/types/social';

export default function ForumsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    const response = await fetch('/api/discussions?page=1&per_page=20');
    const data = await response.json();
    setDiscussions(data.items);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Discussion Forums</h1>
      <div className="space-y-4">
        {discussions.map((discussion) => (
          <div key={discussion.id} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold">{discussion.name}</h3>
            <p className="text-gray-600 mt-2">{discussion.content?.substring(0, 150)}...</p>
            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
              <span>👍 {discussion.upvote_count}</span>
              <span>💬 {discussion.reply_count}</span>
              <span>👁️ {discussion.view_count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Create Discussion Detail Page

```tsx
// src/app/forums/[id]/page.tsx
import DiscussionThread from '@/components/social/DiscussionThread';

export default function DiscussionPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-6">
      <DiscussionThread discussionId={parseInt(params.id)} />
    </div>
  );
}
```

### Create Study Groups Page

```tsx
// src/app/groups/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { StudyGroup } from '@/types/social';
import StudyGroupCard from '@/components/social/StudyGroupCard';

export default function GroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const response = await fetch('/api/study-groups');
    const data = await response.json();
    setGroups(data.items);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Study Groups</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <StudyGroupCard
            key={group.id}
            group={group}
            onClick={() => window.location.href = `/groups/${group.id}`}
          />
        ))}
      </div>
    </div>
  );
}
```

### Create Leaderboard Page

```tsx
// src/app/leaderboard/page.tsx
import LeaderboardTable from '@/components/social/LeaderboardTable';

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto p-6">
      <LeaderboardTable
        initialCategory="overall"
        initialPeriod="weekly"
        topN={100}
        showFilters
      />
    </div>
  );
}
```

## Testing

### Test API Endpoints

```bash
# Test discussions list
curl http://localhost:4000/api/discussions

# Test discussion creation
curl -X POST http://localhost:4000/api/discussions \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Discussion","content":"Test content","category":"general"}'

# Test upvote
curl -X POST http://localhost:4000/api/discussions/1/upvote

# Test study group join
curl -X POST http://localhost:4000/api/study-groups/1/join

# Test leaderboard
curl http://localhost:4000/api/leaderboard?category=overall&period=weekly
```

### Test WebSocket Connection

Open browser console and run:

```javascript
const socket = io('http://localhost:4000', {
  path: '/api/socket',
});

socket.on('connect', () => {
  console.log('Connected');
});

socket.on('notification', (data) => {
  console.log('Notification:', data);
});
```

## Troubleshooting

### WebSocket Connection Failed

1. Ensure Socket.IO endpoint is initialized:
   ```bash
   curl http://localhost:4000/api/socket
   ```

2. Check CORS settings in `lib/socket.ts`:
   ```typescript
   cors: {
     origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000',
     methods: ['GET', 'POST'],
     credentials: true,
   }
   ```

### API Returns 401 Unauthorized

Ensure Odoo session is active:
```bash
# Check if logged into Odoo
curl http://localhost:8069/web/session/get_session_info
```

### Models Not Found in Odoo

Update the module:
```bash
./scripts/dev.sh update seitech_elearning
```

Or restart Odoo with module upgrade:
```bash
./scripts/dev.sh restart -u seitech_elearning
```

### Notifications Not Showing

1. Check browser notification permissions
2. Ensure WebSocket connection is active
3. Verify notification API endpoints:
   ```bash
   curl http://localhost:4000/api/notifications
   ```

## Production Deployment

### 1. Build Frontend

```bash
cd frontend
npm run build
npm start
```

### 2. Configure Reverse Proxy (Nginx)

```nginx
# WebSocket upgrade
location /api/socket/ {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}

# API routes
location /api/ {
    proxy_pass http://localhost:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### 3. Enable SSL for WebSocket

Update `NEXT_PUBLIC_WS_URL` to use `wss://`:
```env
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

### 4. Scale with Redis (Optional)

For multi-instance deployments:

```bash
npm install @socket.io/redis-adapter redis
```

Update `lib/socket.ts`:
```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

## Next Steps

1. Create page routes for forums, groups, leaderboard
2. Integrate components into existing pages
3. Test all features end-to-end
4. Run accessibility audit
5. Deploy to production

## Support

For issues or questions:
- Check [SOCIAL_LEARNING_COMPLETE.md](./SOCIAL_LEARNING_COMPLETE.md) for detailed documentation
- Review [IMPLEMENTATION_STATUS_FINAL.md](./IMPLEMENTATION_STATUS_FINAL.md) for implementation status
- Check Odoo logs: `./scripts/dev.sh logs`
- Check Next.js logs: `cd frontend && npm run dev`

---

**Happy Learning! 🎓**
