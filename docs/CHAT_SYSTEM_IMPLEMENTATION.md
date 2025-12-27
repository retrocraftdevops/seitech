# Multi-Level Chat System Implementation

## Overview

I've implemented a comprehensive multi-level chat system that integrates with Odoo's mail/discuss module and provides real-time communication across different user types:

1. **Public Users** → Support Agents
2. **Students** → Instructors
3. **Students** → Support Agents
4. **Instructors** → Admins
5. **Study Groups** → Group Members
6. **Course Discussions** → All enrolled students

## Architecture

### Backend (Odoo)

#### Models Created

**`seitech.chat.channel`** - Main chat channel model
- Support for multiple channel types:
  - `public_support` - Anonymous users with support agents
  - `student_instructor` - Direct student-instructor communication
  - `student_support` - Students with support team
  - `instructor_admin` - Instructors with administrators
  - `group` - Study group discussions
  - `course` - Course-wide discussions
  - `direct` - One-on-one private messages

- Features:
  - Member management with moderators
  - Unread message tracking per user
  - Message counts and previews
  - Session tokens for anonymous users
  - Related records (course, study group, enrollment)
  - State management (active/archived/closed)

**`seitech.chat.message`** - Chat messages
- Rich message content with HTML support
- File attachments support
- Message reactions/emojis
- Threading/replies (parent_id)
- Read receipts tracking
- Author attribution (users or anonymous)
- Message types: text, file, image, system

**`seitech.chat.reaction`** - Message reactions
- Emoji reactions on messages
- One reaction per user per emoji
- Real-time reaction updates

#### API Endpoints

**Authenticated Routes** (for logged-in users):
- `POST /api/chat/channels` - Get user's channels
- `POST /api/chat/channel/<id>` - Get channel details
- `POST /api/chat/messages` - Get channel messages with pagination
- `POST /api/chat/send` - Send message to channel
- `POST /api/chat/create-direct` - Create/get direct message channel
- `POST /api/chat/create-student-instructor` - Create student-instructor channel
- `POST /api/chat/reaction` - Toggle message reaction
- `POST /api/chat/typing` - Send typing indicator

**Public Routes** (for anonymous users):
- `POST /api/chat/support` - Create public support channel
- `POST /api/chat/support/send` - Send message to support (with session token)

### Frontend (Next.js/React)

#### Components Created

**1. ChatContext.tsx** - State Management
- React Context for global chat state
- Manages channels, messages, active channel
- API integration with Odoo backend
- Real-time updates via polling (5-second interval)
- Message sending and reaction handling

**2. ChatWindow.tsx** - Main Chat Interface
- Full-featured chat window
- Message bubbles with avatars
- Attachment display
- Typing indicators
- Reactions display
- Minimize/maximize controls
- Voice/video call buttons (UI ready)

**3. ChatSidebar.tsx** - Channel List
- Channel navigation and filtering
- Unread count badges
- Search functionality
- Channel type filters
- Last message previews
- Timestamps with relative formatting

**4. ChatInterface.tsx** - Container Component
- Three modes:
  - **sidebar** - Full-page split view
  - **floating** - Popup window (default)
  - **fullscreen** - Modal overlay
- Responsive design
- Persistent state

**5. PublicSupportChat.tsx** - Anonymous Support Widget
- Floating support button for public users
- Anonymous session management
- Session persistence via localStorage
- Real-time message updates
- Guest name collection
- Connection status indicators

## Routing & Access Control

### Channel Type Routing

| User Type | Can Access | Channel Types |
|-----------|-----------|---------------|
| **Public (Anonymous)** | Support agents | `public_support` |
| **Students** | Instructors, Support, Other students | `student_instructor`, `student_support`, `direct`, `group`, `course` |
| **Instructors** | Students, Admins, Support | `student_instructor`, `instructor_admin`, `direct`, `course` |
| **Admins** | Everyone | All types |
| **Support Agents** | Public users, Students | `public_support`, `student_support` |

### Security

**Record Rules** (Odoo):
- Users can only see channels they are members of
- Moderators have additional permissions
- Admins can see all channels
- Public users can only access their session's support channel

**Access Rights**:
- Students: Read/Write own messages, Read channels
- Instructors: Read/Write all, Unlink own
- Managers: Full CRUD access
- Support Agents: Read/Write for support channels
- Public: Read-only access to own support channel

## Usage Examples

### 1. Adding Public Support Chat to Homepage

```tsx
// app/page.tsx
import { PublicSupportChat } from '@/components/chat';

export default function HomePage() {
  return (
    <div>
      {/* Your page content */}
      
      <PublicSupportChat />
    </div>
  );
}
```

### 2. Student Dashboard with Chat

```tsx
// app/(student)/dashboard/page.tsx
import { ChatInterface, ChatProvider } from '@/components/chat';

export default function StudentDashboard() {
  return (
    <ChatProvider>
      <div className="flex h-screen">
        <main className="flex-1">
          {/* Dashboard content */}
        </main>
        
        <ChatInterface mode="sidebar" />
      </div>
    </ChatProvider>
  );
}
```

### 3. Starting Instructor Chat from Course Page

```tsx
// components/CourseInstructor.tsx
import { useChat } from '@/components/chat';

export function CourseInstructor({ instructorId, courseId }) {
  const { createStudentInstructorChannel, setActiveChannel, channels } = useChat();
  
  const handleChatWithInstructor = async () => {
    const channelId = await createStudentInstructorChannel(instructorId, courseId);
    const channel = channels.find(ch => ch.id === channelId);
    if (channel) {
      setActiveChannel(channel);
    }
  };
  
  return (
    <button onClick={handleChatWithInstructor}>
      Chat with Instructor
    </button>
  );
}
```

### 4. Floating Chat Widget

```tsx
// app/layout.tsx
import { ChatInterface } from '@/components/chat';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        
        <ChatInterface mode="floating" defaultOpen={false} />
      </body>
    </html>
  );
}
```

## Odoo Integration

### Installing the Module

```bash
# Update the module
./scripts/dev.sh update seitech_elearning

# Or install fresh
./scripts/dev.sh install seitech_elearning
```

### Creating Support Agent Group

1. Go to Settings → Users & Companies → Groups
2. Find "Support Agent" group (created automatically)
3. Add users who should handle support chats

### Accessing Chat in Odoo Backend

- **E-Learning → Chat → Channels** - View all channels
- **E-Learning → Chat → Support Chats** - View public support requests
- **E-Learning → Chat → All Messages** - Admin view of all messages

## Real-Time Updates

### Current Implementation: Polling
- Messages refresh every 5 seconds
- Lightweight API calls
- Automatic background updates

### Future Enhancement: WebSocket
For production, consider upgrading to WebSocket via Odoo's bus system:

```python
# In chat_channel.py
self.env['bus.bus']._sendmany(notifications)
```

Frontend can listen via:
```javascript
import { bus } from '@odoo/owl';

bus.addEventListener('seitech.chat/new_message', (event) => {
  // Handle new message
});
```

## Features Implemented

✅ **Multi-level routing** - Different channels for different user relationships
✅ **Anonymous support** - Public users can chat without login
✅ **Session persistence** - Support chats persist across page reloads
✅ **Read receipts** - Track which messages have been read
✅ **Typing indicators** - Show when users are typing
✅ **Message reactions** - Emoji reactions on messages
✅ **File attachments** - Share files in chats
✅ **Threading** - Reply to specific messages
✅ **Channel search** - Find conversations quickly
✅ **Unread counters** - Badge notifications for new messages
✅ **Responsive design** - Works on mobile and desktop
✅ **Multiple modes** - Sidebar, floating, fullscreen
✅ **Odoo integration** - Full backend integration with Odoo mail system

## Next Steps

### Recommended Enhancements

1. **WebSocket Integration**
   - Replace polling with real-time WebSocket
   - Use Odoo's bus.bus for instant notifications

2. **Voice/Video Calls**
   - Integrate WebRTC for video calls
   - Use services like Jitsi or Twilio

3. **Push Notifications**
   - Browser push notifications for new messages
   - Email notifications for offline users

4. **Rich Media**
   - Image preview in chat
   - Link previews with metadata
   - GIF and emoji picker

5. **Advanced Features**
   - Message search within channels
   - Message pinning
   - User presence indicators (online/offline)
   - Message editing and deletion
   - Chat export/archive

6. **Analytics**
   - Response time tracking
   - Agent performance metrics
   - Chat satisfaction ratings

## Testing

### Backend Testing

```bash
# Test in Odoo shell
docker compose exec odoo python3 /opt/odoo/odoo/odoo-bin shell -c /opt/odoo/config/odoo.conf

# Create test channel
channel = env['seitech.chat.channel'].create({
    'name': 'Test Chat',
    'channel_type': 'direct',
    'member_ids': [(6, 0, [env.user.id])]
})

# Send test message
message = channel.action_send_message('Hello World!')
```

### Frontend Testing

```bash
cd frontend
npm run dev

# Visit http://localhost:4000
# Test floating chat widget
# Test public support chat
```

## File Structure

```
custom_addons/seitech_elearning/
├── models/
│   └── chat_channel.py          # Chat models
├── controllers/
│   └── chat.py                  # API endpoints
├── security/
│   ├── chat_security.xml        # Groups and sequences
│   └── ir.model.access.csv      # Access rights
└── views/
    └── chat_views.xml           # Backend UI views

frontend/src/components/chat/
├── ChatContext.tsx              # State management
├── ChatWindow.tsx               # Main chat UI
├── ChatSidebar.tsx              # Channel list
├── ChatInterface.tsx            # Container
├── PublicSupportChat.tsx        # Anonymous support
└── index.ts                     # Exports
```

## Configuration

### Environment Variables

```bash
# frontend/.env.local
NEXT_PUBLIC_ODOO_URL=http://localhost:8069
NEXT_PUBLIC_ODOO_DB=seitech_dev
```

### Odoo Settings

1. Enable "Discuss" app (already included via mail.thread)
2. Configure email for notifications (optional)
3. Set up support agent users
4. Configure CORS for frontend API access

## Troubleshooting

**Issue**: Messages not showing
- Check Odoo logs: `./scripts/dev.sh logs`
- Verify API endpoints are accessible
- Check browser console for errors

**Issue**: Can't create channels
- Verify user has proper permissions
- Check security groups in Odoo
- Ensure module is fully installed

**Issue**: Public support not working
- Check CORS settings in Odoo
- Verify session token generation
- Check browser localStorage

## Support

For issues or questions:
1. Check Odoo logs: `docker compose logs odoo`
2. Check frontend console: Browser DevTools
3. Review API responses in Network tab
4. Verify database records in Odoo backend

---

**Status**: ✅ Fully implemented and ready for testing
**Compatibility**: Odoo 19.0, Next.js 14+
**Author**: Seitech Development Team
**Date**: December 2024
