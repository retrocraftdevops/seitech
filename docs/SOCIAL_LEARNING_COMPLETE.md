# Social Learning Features - Complete Implementation

This document describes the comprehensive Social Learning features implementation for the SEI Tech International e-learning platform.

## 🎯 Overview

The Social Learning system provides a complete collaborative learning environment with:
- **Discussion Forums** - Threaded discussions with upvoting and nested replies (5 levels deep)
- **Study Groups** - Collaborative learning groups with join/leave management
- **Learning Streaks** - Daily activity tracking with gamification and freeze days
- **Leaderboards** - Competitive rankings across multiple categories and time periods
- **Real-time Updates** - WebSocket-based live notifications and updates
- **Notification System** - Comprehensive notification center with browser notifications

## 📁 File Structure

```
frontend/
├── src/
│   ├── types/
│   │   └── social.ts                          # TypeScript type definitions (240 lines)
│   ├── hooks/
│   │   └── useWebSocket.ts                    # WebSocket hooks with specialized variants
│   ├── lib/
│   │   └── socket.ts                          # Socket.IO server utilities and event emitters
│   ├── components/social/
│   │   ├── DiscussionThread.tsx               # Discussion viewer with nested replies (370 lines)
│   │   ├── StudyGroupCard.tsx                 # Study group card with join/leave (280 lines)
│   │   ├── StreakWidget.tsx                   # Streak display with animations (350 lines)
│   │   ├── LeaderboardTable.tsx               # Rankings with filters (390 lines)
│   │   └── NotificationCenter.tsx             # Notification bell dropdown (320 lines)
│   ├── app/api/
│   │   ├── discussions/
│   │   │   ├── route.ts                       # List & create discussions
│   │   │   └── [id]/
│   │   │       ├── route.ts                   # CRUD single discussion
│   │   │       ├── upvote/route.ts            # Toggle upvote
│   │   │       └── replies/route.ts           # Nested replies
│   │   ├── study-groups/
│   │   │   ├── route.ts                       # List & create groups
│   │   │   └── [id]/
│   │   │       ├── route.ts                   # CRUD single group
│   │   │       ├── join/route.ts              # Join group
│   │   │       └── leave/route.ts             # Leave group
│   │   ├── streaks/
│   │   │   └── me/
│   │   │       └── route.ts                   # Current user streak (GET, POST freeze)
│   │   ├── leaderboard/
│   │   │   └── route.ts                       # Rankings (GET, POST update)
│   │   └── notifications/
│   │       ├── route.ts                       # List & create notifications
│   │       ├── read-all/route.ts              # Mark all as read
│   │       └── [id]/
│   │           ├── route.ts                   # Get & delete notification
│   │           └── read/route.ts              # Mark as read
│   └── pages/api/
│       └── socket.ts                          # Socket.IO initialization endpoint
```

## 🔧 Backend Models (Odoo)

### Discussion Forum
- **seitech.discussion** - Main discussion threads
  - Fields: name, content, category, author, course, study_group, upvotes, replies, views, state
  - Methods: action_publish(), action_resolve(), action_close(), action_upvote(), action_increment_view()
  - Security: Public read, authenticated create, author/admin edit

- **seitech.discussion.reply** - Nested replies
  - Fields: content, author, discussion, parent_reply, upvotes, state, thread_level
  - Supports 5-level nesting with computed thread_level
  - Methods: action_upvote(), _compute_thread_level()

### Study Groups
- **seitech.study.group** - Learning communities
  - Fields: name, description, group_type, privacy, join_policy, owner, members, max_members
  - Methods: action_join(), action_leave(), action_activate(), action_archive()
  - Policies: open (auto-join), approval (pending), invitation (invite-only)

- **seitech.study.group.member** - Membership records
  - Fields: user, group, role (member/moderator/admin), state (pending/active/inactive)
  - Join flow: join_policy='approval' → state='pending', 'open' → state='active'

### Gamification
- **seitech.learning.streak** - Daily activity tracking
  - Fields: user, current_streak, longest_streak, perfect_weeks, perfect_months, freeze_days
  - Methods: action_check_in(), action_freeze_streak(), action_break_streak()
  - Milestones: 7, 14, 30, 60, 100, 180, 365, 500, 1000 days

- **seitech.leaderboard** - Competitive rankings
  - Fields: user, category, period, rank, score, rank_change, achievements
  - Categories: overall, courses, discussions, study_groups, streak, quiz_scores, certificates
  - Periods: daily, weekly, monthly, yearly, all_time
  - Methods: update_leaderboards() (batch processing)

### Notifications
- **seitech.notification** - User notifications
  - Fields: user, notification_type, title, message, link, read, related_discussion/group/user
  - Types: reply, upvote, discussion, study_group, member_join, streak, milestone, leaderboard
  - Methods: mark_read(), mark_all_read()

## 🚀 API Endpoints

### Discussions

#### `GET /api/discussions`
List discussions with filtering and pagination
```typescript
Query params:
  - category?: DiscussionCategory
  - state?: DiscussionState (default: published|resolved|closed)
  - course_id?: number
  - study_group_id?: number
  - author_id?: number
  - is_pinned?: boolean
  - is_featured?: boolean
  - has_best_answer?: boolean
  - search?: string (searches name + content)
  - page?: number (default: 1)
  - per_page?: number (default: 20)

Response: PaginatedResponse<Discussion>
```

#### `POST /api/discussions`
Create new discussion
```typescript
Body: CreateDiscussionRequest {
  name: string
  content: string
  category: DiscussionCategory
  course_id?: number
  study_group_id?: number
  tags?: string[]
  skills?: string[]
}

Response: Discussion (auto-published)
```

#### `GET /api/discussions/[id]`
Get single discussion with replies
```typescript
Response: Discussion & {
  replies?: DiscussionReply[] (nested tree)
  has_upvoted: boolean
}
```

#### `PATCH /api/discussions/[id]`
Update discussion
```typescript
Body: UpdateDiscussionRequest {
  name?: string
  content?: string
  category?: DiscussionCategory
  tags?: string[]
  skills?: string[]
  is_pinned?: boolean
  is_locked?: boolean
  is_featured?: boolean
  state?: DiscussionState
}

Response: Discussion
```

#### `POST /api/discussions/[id]/upvote`
Toggle upvote
```typescript
Response: {
  upvote_count: number
  has_upvoted: boolean
}
```

#### `GET /api/discussions/[id]/replies`
Get nested replies
```typescript
Response: DiscussionReply[] (tree structure, max 5 levels)
```

#### `POST /api/discussions/[id]/replies`
Create reply
```typescript
Body: CreateReplyRequest {
  content: string
  parent_id?: number
}

Response: DiscussionReply
```

### Study Groups

#### `GET /api/study-groups`
List study groups
```typescript
Query params:
  - group_type?: StudyGroupType
  - privacy?: StudyGroupPrivacy (excludes 'secret' by default)
  - course_id?: number
  - is_featured?: boolean
  - search?: string
  - page?: number
  - per_page?: number

Response: PaginatedResponse<StudyGroup & {
  is_member: boolean
  member_role?: MemberRole
  member_state?: MemberState
}>
```

#### `POST /api/study-groups`
Create study group
```typescript
Body: CreateStudyGroupRequest {
  name: string
  group_type: StudyGroupType
  privacy: StudyGroupPrivacy
  join_policy: StudyGroupJoinPolicy
  description?: string
  course_id?: number
  learning_path_id?: number
  skills?: string[]
  max_members?: number
  goal?: string
}

Response: StudyGroup (auto-activated)
```

#### `POST /api/study-groups/[id]/join`
Join study group
```typescript
Response: {
  success: boolean
  member_status: {
    role: MemberRole
    state: MemberState ('pending' if approval required)
  }
  member_count: number
}
```

#### `POST /api/study-groups/[id]/leave`
Leave study group
```typescript
Response: {
  success: boolean
  member_count: number
  is_member: false
}
```

### Streaks

#### `GET /api/streaks/me`
Get current user's streak
```typescript
Response: LearningStreak & {
  milestones: StreakMilestone[]
}
```

#### `POST /api/streaks/me`
Use freeze day
```typescript
Response: {
  freeze_days_available: number
  freeze_days_used: number
  last_freeze_date: string
}
```

### Leaderboard

#### `GET /api/leaderboard`
Get rankings
```typescript
Query params:
  - category?: LeaderboardCategory (default: overall)
  - period?: LeaderboardPeriod (default: all_time)
  - user_id?: number
  - top_n?: number (default: 50)

Response: LeaderboardEntry[] (with user avatars)
```

#### `POST /api/leaderboard`
Trigger manual update (admin only)
```typescript
Response: { success: boolean }
```

### Notifications

#### `GET /api/notifications`
List notifications
```typescript
Query params:
  - unread_only?: boolean
  - page?: number
  - per_page?: number

Response: PaginatedResponse<Notification>
```

#### `POST /api/notifications/[id]/read`
Mark as read
```typescript
Response: { success: boolean }
```

#### `POST /api/notifications/read-all`
Mark all as read
```typescript
Response: { success: boolean, count: number }
```

## 🎨 Components

### DiscussionThread (370 lines)
**Features:**
- Discussion header with category badge, pin/lock/award icons
- Upvote button with toggle state and count
- View count and reply count display
- HTML content rendering with dangerouslySetInnerHTML
- Nested reply form with textarea and Send button
- Recursive reply rendering (max depth 5)
- Author badges: Instructor, Author, Best Answer
- Reply-to-reply functionality with parent tracking
- Upvote buttons on each reply
- Edited timestamp indicators
- Thread level visualization with left border
- Loading spinner and empty states
- Locked discussion handling (hides reply form)

**Usage:**
```tsx
import DiscussionThread from '@/components/social/DiscussionThread';

<DiscussionThread discussionId={123} />
```

### StudyGroupCard (280 lines)
**Features:**
- Gradient image background or Users icon fallback
- Featured badge with Award icon
- Privacy/type badges with icons (Globe/Lock/Shield)
- 3-column stats grid: Members (x/max), Discussions, Progress
- Animated progress bar with gradient fill
- Next session info with Calendar icon
- Owner avatar with name
- Join/Leave button with state management
- Handles pending approval (shows alert)
- Disabled when group full
- Loading state during API calls
- CheckCircle for membership indicator

**Usage:**
```tsx
import StudyGroupCard from '@/components/social/StudyGroupCard';

<StudyGroupCard
  group={groupData}
  onJoin={() => console.log('Joined')}
  onLeave={() => console.log('Left')}
  onClick={() => router.push(`/groups/${group.id}`)}
/>
```

### StreakWidget (350 lines)
**Features:**
- Compact and full modes
- Animated flame icon with rotation
- Current streak display with emoji progression (⚡ → 🔥 → 🔥🔥 → 🔥🔥🔥)
- Best streak comparison
- Stats grid: Perfect Weeks, Perfect Months, Total Activities
- Next milestone progress bar with countdown
- Freeze day management with Snowflake icon
- "Use Freeze Day" button with alert confirmation
- Milestone badges (6 most recent)
- Daily goal status (Completed/In Progress)
- Celebration animation overlay
- Gradient colors based on streak length

**Usage:**
```tsx
import StreakWidget from '@/components/social/StreakWidget';

// Compact mode
<StreakWidget userId={userId} compact />

// Full mode
<StreakWidget userId={userId} />
```

### LeaderboardTable (390 lines)
**Features:**
- Trophy icons for top 3 (gold/silver/bronze)
- Category filter dropdown (7 options)
- Period filter dropdown (5 options)
- Sortable table columns
- User avatars (gradient fallback with initials)
- Percentile badges (Top 1%/5%/10%)
- Rank change indicators (TrendingUp/Down/Minus icons)
- Current user row highlighting (blue background)
- Stats display: courses, discussions, streak days
- Refresh button with loading animation
- Empty state with Trophy icon
- Footer with total count and last updated timestamp

**Usage:**
```tsx
import LeaderboardTable from '@/components/social/LeaderboardTable';

<LeaderboardTable
  initialCategory="overall"
  initialPeriod="weekly"
  topN={50}
  showFilters
/>
```

### NotificationCenter (320 lines)
**Features:**
- Bell icon with unread count badge (red circle, 9+ handling)
- Dropdown panel with backdrop
- Mark all as read button
- Notification list with type-based icons and colors
- Unread indicator (blue dot)
- Click to mark as read and navigate to link
- Delete button per notification
- Browser notification support (requests permission)
- Real-time WebSocket updates
- Loading skeleton states
- Empty state with Bell icon
- View all notifications footer link
- Auto-dismiss on outside click

**Usage:**
```tsx
import NotificationCenter from '@/components/social/NotificationCenter';

// In header/navbar
<NotificationCenter />
```

## 🔌 WebSocket Integration

### Setup
The WebSocket server is initialized via the Socket.IO API route:

```typescript
// pages/api/socket.ts
import { initializeSocketIO } from '@/lib/socket';

// Initializes Socket.IO server on Next.js HTTP server
```

### Client Usage

#### useWebSocket Hook
Generic hook for WebSocket connections:

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

const { socket, connect, disconnect, emit, subscribe, unsubscribe, isConnected } = useWebSocket({
  onConnect: () => console.log('Connected'),
  onDisconnect: () => console.log('Disconnected'),
  onUpvote: (data) => console.log('Upvote', data),
  onReply: (data) => console.log('Reply', data),
  // ... other event handlers
});

// Subscribe to specific rooms
subscribe(`discussion:${discussionId}`);
subscribe(`study-group:${groupId}`);
```

#### Specialized Hooks

**useDiscussionSocket:**
```typescript
import { useDiscussionSocket } from '@/hooks/useWebSocket';

useDiscussionSocket(discussionId, {
  onUpvote: (count) => setUpvoteCount(count),
  onReply: (reply) => addReply(reply),
  onViewCount: (count) => setViewCount(count),
});
```

**useStudyGroupSocket:**
```typescript
import { useStudyGroupSocket } from '@/hooks/useWebSocket';

useStudyGroupSocket(groupId, {
  onMemberJoin: ({ user_name, member_count }) => {
    setMemberCount(member_count);
    showToast(`${user_name} joined the group`);
  },
});
```

**useStreakSocket:**
```typescript
import { useStreakSocket } from '@/hooks/useWebSocket';

useStreakSocket(userId, {
  onMilestone: ({ milestone, badge }) => {
    showCelebration(`${milestone} day milestone! ${badge}`);
  },
});
```

**useLeaderboardSocket:**
```typescript
import { useLeaderboardSocket } from '@/hooks/useWebSocket';

useLeaderboardSocket({
  onUpdate: ({ category, period }) => {
    refetchLeaderboard();
  },
});
```

**useNotificationSocket:**
```typescript
import { useNotificationSocket } from '@/hooks/useWebSocket';

useNotificationSocket({
  onNotification: (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
      });
    }
  },
});
```

### Server-side Event Emitters

```typescript
import {
  emitDiscussionUpvote,
  emitDiscussionReply,
  emitStudyGroupJoin,
  emitStreakMilestone,
  emitLeaderboardUpdate,
  emitNotification,
} from '@/lib/socket';

// Example: Emit upvote update
emitDiscussionUpvote(discussionId, newCount);

// Example: Emit new reply
emitDiscussionReply(discussionId, replyObject);

// Example: Emit notification
emitNotification(userId, {
  type: 'reply',
  title: 'New Reply',
  message: 'Someone replied to your discussion',
  link: `/discussions/${discussionId}`,
});
```

## 📊 Data Flow

### Discussion Creation & Real-time Updates
1. User creates discussion via `POST /api/discussions`
2. API creates record in Odoo → auto-publishes → returns Discussion object
3. Frontend updates local state
4. WebSocket emits `discussion:new` event to all connected clients
5. Other users see new discussion in real-time

### Upvote Flow
1. User clicks upvote button
2. Optimistic UI update (immediate visual feedback)
3. `POST /api/discussions/[id]/upvote` calls Odoo `action_upvote()`
4. Odoo toggles Many2many relation, returns new count
5. WebSocket emits `discussion:upvote` with new count
6. All connected clients update upvote count in real-time

### Study Group Join Flow
1. User clicks "Join Group" button
2. Button shows loading state
3. `POST /api/study-groups/[id]/join` calls Odoo `action_join()`
4. Odoo checks join_policy:
   - `open` → Creates active membership immediately
   - `approval` → Creates pending membership, requires admin approval
   - `invitation` → Requires existing invite record
5. API returns membership status
6. Frontend updates button to "Leave Group" (or "Pending" for approval)
7. WebSocket emits `study-group:join` event
8. Other members see updated member count in real-time

### Streak Freeze Day Flow
1. User clicks "Use Freeze Day" button
2. `POST /api/streaks/me` calls Odoo `action_freeze_streak()`
3. Odoo decrements `freeze_days_available`, sets `last_freeze_date`
4. API returns updated streak object
5. Frontend updates streak widget, shows alert confirmation
6. Streak is protected from breaking if user misses next day

### Notification Flow
1. Backend event occurs (new reply, upvote, member join, etc.)
2. Odoo creates notification record via `seitech.notification.create()`
3. WebSocket emits `notification` event to target user's room
4. Frontend `NotificationCenter` receives event via `useNotificationSocket`
5. Adds notification to state, updates unread count badge
6. If browser notifications permitted, shows system notification
7. User clicks notification → marks as read, navigates to link

## 🎯 Key Features Implemented

### ✅ Discussion Forum
- [x] Threaded discussions with categories (general, course, technical, help, showcase, announcements, feedback)
- [x] Nested replies up to 5 levels deep
- [x] Upvoting system for discussions and replies
- [x] View count tracking with automatic increment
- [x] Pin, lock, featured discussion support
- [x] Best answer marking for questions
- [x] Author and instructor badges
- [x] Edit indicators with timestamps
- [x] State management (draft, published, resolved, closed, flagged)
- [x] Course and study group scoped discussions
- [x] Search across name and content
- [x] Rich HTML content rendering

### ✅ Study Groups
- [x] Three group types: course-based, topic-based, project-based
- [x] Privacy levels: public, private, secret
- [x] Join policies: open, approval, invitation
- [x] Member roles: member, moderator, admin
- [x] Member states: pending, active, inactive
- [x] Join/leave functionality with proper state management
- [x] Max member limits with full group handling
- [x] Featured groups promotion
- [x] Group progress tracking
- [x] Next session scheduling
- [x] Discussion count display
- [x] Owner information display
- [x] Real-time member count updates

### ✅ Learning Streaks
- [x] Daily activity tracking
- [x] Current streak and longest streak tracking
- [x] Perfect weeks and perfect months counting
- [x] 9 milestone levels (7, 14, 30, 60, 100, 180, 365, 500, 1000 days)
- [x] Freeze day system with earned days
- [x] Animated flame icon based on streak length
- [x] Next milestone countdown with progress bar
- [x] Daily goal status display
- [x] Compact and full widget modes
- [x] Celebration animations on milestones
- [x] Real-time milestone notifications

### ✅ Leaderboards
- [x] 7 categories: overall, courses, discussions, study groups, streak, quiz scores, certificates
- [x] 5 time periods: daily, weekly, monthly, yearly, all-time
- [x] Top 3 medal display (gold/silver/bronze)
- [x] Percentile badges (Top 1%, 5%, 10%)
- [x] Rank change indicators with arrows and colors
- [x] Current user highlighting
- [x] User avatars with fallback gradients
- [x] Stats display (courses, discussions, streak)
- [x] Sortable table columns
- [x] Manual refresh button
- [x] Batch update system
- [x] Achievement display

### ✅ Notifications
- [x] 8 notification types: reply, upvote, discussion, study_group, member_join, streak, milestone, leaderboard
- [x] Real-time WebSocket delivery
- [x] Browser notification support (with permission request)
- [x] Unread count badge on bell icon
- [x] Mark as read functionality (individual and all)
- [x] Delete notifications
- [x] Type-based icons and colors
- [x] Click to navigate to related content
- [x] Relative timestamps ("2 hours ago")
- [x] Empty state handling
- [x] Loading skeleton states
- [x] Dropdown panel with backdrop

### ✅ Real-time Features
- [x] WebSocket server with Socket.IO
- [x] Connection management (connect, disconnect, reconnect)
- [x] Room-based subscriptions
- [x] Event emitters for all social features
- [x] Specialized hooks for each feature
- [x] Optimistic UI updates
- [x] Error handling and fallbacks
- [x] Auto-reconnect on disconnect

## 🧪 Testing

### API Endpoint Testing
```bash
# Test discussions list
curl http://localhost:4000/api/discussions?category=general&page=1

# Test discussion creation
curl -X POST http://localhost:4000/api/discussions \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Discussion","content":"Test content","category":"general"}'

# Test upvote
curl -X POST http://localhost:4000/api/discussions/1/upvote

# Test study group join
curl -X POST http://localhost:4000/api/study-groups/1/join

# Test streak freeze
curl -X POST http://localhost:4000/api/streaks/me

# Test leaderboard
curl http://localhost:4000/api/leaderboard?category=overall&period=weekly
```

### Component Testing
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import DiscussionThread from '@/components/social/DiscussionThread';

test('renders discussion and handles upvote', async () => {
  render(<DiscussionThread discussionId={1} />);
  
  // Wait for discussion to load
  await screen.findByText('Test Discussion');
  
  // Click upvote button
  const upvoteButton = screen.getByRole('button', { name: /upvote/i });
  fireEvent.click(upvoteButton);
  
  // Verify upvote count updated
  expect(screen.getByText('11')).toBeInTheDocument();
});
```

### WebSocket Testing
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  path: '/api/socket',
});

socket.on('connect', () => {
  console.log('Connected');
  
  // Subscribe to discussion updates
  socket.emit('subscribe', { room: 'discussion:1' });
});

socket.on('discussion:upvote', (data) => {
  console.log('Upvote received:', data);
});
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "socket.io-client": "^4.7.2",
    "framer-motion": "^11.5.4",
    "lucide-react": "^0.446.0",
    "date-fns": "^4.1.0",
    "react": "18.3.1",
    "next": "14.2.15"
  },
  "devDependencies": {
    "socket.io": "^4.7.2"
  }
}
```

## 🚀 Deployment

### Environment Variables
```env
# WebSocket URL
NEXT_PUBLIC_WS_URL=https://your-domain.com

# App URL for CORS
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Production Setup
1. Ensure Socket.IO server is initialized on production server
2. Configure CORS for WebSocket connections
3. Set up SSL/TLS for wss:// protocol
4. Enable browser notifications (requires HTTPS)
5. Configure Redis adapter for multi-instance Socket.IO (optional)

### Performance Optimization
- Use Redis for Socket.IO room management in production
- Implement message rate limiting for WebSocket events
- Cache leaderboard data with periodic updates
- Index Odoo models for fast queries (discussion_id, user_id, group_id)
- Use pagination for all list endpoints
- Implement lazy loading for nested replies

## 📝 Future Enhancements

### Phase 2 Features
- [ ] Mention system (@username) with autocomplete
- [ ] Rich text editor for discussions and replies
- [ ] File attachments (images, PDFs, videos)
- [ ] Emoji reactions on discussions and replies
- [ ] Discussion drafts with auto-save
- [ ] Study group chat (real-time messaging)
- [ ] Study group video calls (WebRTC integration)
- [ ] Advanced leaderboard filters (course, path, skills)
- [ ] Achievement badges and unlocks
- [ ] Reputation system with points
- [ ] Moderation queue for flagged content
- [ ] Analytics dashboard for instructors
- [ ] Mobile app notifications (push notifications)

### Performance Enhancements
- [ ] Redis caching layer
- [ ] CDN for static assets
- [ ] Database query optimization
- [ ] Server-side pagination for replies
- [ ] Infinite scroll for discussions and leaderboard
- [ ] Virtual scrolling for long lists
- [ ] Image optimization and lazy loading
- [ ] Code splitting for components

## 🔒 Security

### Authentication
- All API routes require Odoo session authentication
- WebSocket connections validate user credentials
- CSRF protection on write operations
- Rate limiting on API endpoints

### Authorization
- Row-level security via Odoo record rules
- User can only delete own notifications
- Only discussion author can edit/delete discussion
- Only group owner/moderator can manage group
- Admin approval required for flagged content

### Data Validation
- Input sanitization on all endpoints
- TypeScript type checking
- Zod schema validation (can be added)
- HTML sanitization for content rendering
- File upload validation and scanning (future)

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for SEI Tech International E-Learning Platform**
