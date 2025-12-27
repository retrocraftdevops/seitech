# Quick Start: Chat System Integration

## 🚀 5-Minute Integration Guide

### Step 1: Add Public Support Chat (Anonymous Users)

Add to any public page for instant support:

```tsx
// app/page.tsx or any public page
import { PublicSupportChat } from '@/components/chat';

export default function HomePage() {
  return (
    <main>
      {/* Your existing content */}
      
      {/* Add this line - that's it! */}
      <PublicSupportChat />
    </main>
  );
}
```

**Result:** Floating chat button appears bottom-right. Visitors can chat without login.

---

### Step 2: Add to Student Dashboard

```tsx
// app/(student)/dashboard/layout.tsx
import { ChatProvider, ChatInterface } from '@/components/chat';

export default function StudentLayout({ children }) {
  return (
    <ChatProvider>
      <div className="flex h-screen">
        <main className="flex-1">
          {children}
        </main>
        
        {/* Floating chat for students */}
        <ChatInterface mode="floating" />
      </div>
    </ChatProvider>
  );
}
```

**Result:** Students see floating chat with access to instructors, support, and peers.

---

### Step 3: Add "Chat with Instructor" Button

```tsx
// components/CourseInstructor.tsx
'use client';

import { useChat } from '@/components/chat';

export function InstructorCard({ instructor, courseId }) {
  const { createStudentInstructorChannel } = useChat();
  
  return (
    <div className="instructor-card">
      <h3>{instructor.name}</h3>
      <button 
        onClick={async () => {
          await createStudentInstructorChannel(instructor.id, courseId);
        }}
        className="btn-primary"
      >
        💬 Chat with Instructor
      </button>
    </div>
  );
}
```

**Result:** One-click to start instructor chat.

---

### Step 4: Admin Support Dashboard

```tsx
// app/(admin)/support/page.tsx
import { ChatProvider, ChatInterface } from '@/components/chat';

export default function SupportDashboard() {
  return (
    <ChatProvider>
      <div className="h-screen">
        <ChatInterface mode="sidebar" />
      </div>
    </ChatProvider>
  );
}
```

**Result:** Full-screen support ticket interface for agents.

---

## 🎨 Display Modes

### Mode 1: Floating (Recommended for most pages)
```tsx
<ChatInterface mode="floating" />
```
- Appears as button bottom-right
- Expands to popup window
- Doesn't interfere with page content
- **Use for:** Student dashboard, course pages, general pages

### Mode 2: Sidebar (For dedicated chat pages)
```tsx
<ChatInterface mode="sidebar" />
```
- Split-screen: channels list + messages
- Takes full height of container
- **Use for:** Admin dashboard, support center

### Mode 3: Fullscreen (For modal overlay)
```tsx
<ChatInterface mode="fullscreen" />
```
- Covers entire screen
- Close button included
- **Use for:** Mobile apps, focus mode

---

## 🔧 Configuration Options

### Customize Chat Button Position

```tsx
// Add custom styles
<div className="relative">
  <ChatInterface mode="floating" />
  <style jsx global>{`
    .chat-button {
      bottom: 2rem;
      right: 2rem;
    }
  `}</style>
</div>
```

### Auto-open Chat

```tsx
<ChatInterface mode="floating" defaultOpen={true} />
```

### Filter Channel Types

```tsx
'use client';

import { useChat } from '@/components/chat';
import { useEffect } from 'react';

export function MyComponent() {
  const { refreshChannels } = useChat();
  
  useEffect(() => {
    // Only show instructor channels
    refreshChannels(['student_instructor']);
  }, []);
  
  return <ChatInterface mode="sidebar" />;
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Course Page with Instructor Chat

```tsx
// app/courses/[id]/page.tsx
'use client';

import { ChatProvider, useChat } from '@/components/chat';

function CourseContent({ course, instructor }) {
  const { createStudentInstructorChannel } = useChat();
  
  return (
    <div>
      <h1>{course.name}</h1>
      
      <div className="instructor-section">
        <img src={instructor.avatar} alt={instructor.name} />
        <h3>{instructor.name}</h3>
        <button onClick={() => createStudentInstructorChannel(instructor.id, course.id)}>
          Ask Instructor
        </button>
      </div>
      
      {/* Course content */}
    </div>
  );
}

export default function CoursePage({ params }) {
  return (
    <ChatProvider>
      <CourseContent course={...} instructor={...} />
      <ChatInterface mode="floating" />
    </ChatProvider>
  );
}
```

### Use Case 2: Support Page

```tsx
// app/support/page.tsx
import { PublicSupportChat } from '@/components/chat';

export default function SupportPage() {
  return (
    <div className="container mx-auto py-12">
      <h1>Need Help?</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2>FAQs</h2>
          {/* FAQ content */}
        </div>
        
        <div>
          <h2>Live Chat</h2>
          <p>Chat with our support team</p>
          {/* This will open automatically */}
        </div>
      </div>
      
      <PublicSupportChat />
    </div>
  );
}
```

### Use Case 3: Study Group Chat

```tsx
// app/study-groups/[id]/page.tsx
'use client';

import { ChatProvider, useChat } from '@/components/chat';

export default function StudyGroupPage({ groupId }) {
  const { channels, setActiveChannel } = useChat();
  
  useEffect(() => {
    // Find and open the study group channel
    const groupChannel = channels.find(ch => 
      ch.type === 'group' && ch.study_group_id === groupId
    );
    if (groupChannel) {
      setActiveChannel(groupChannel);
    }
  }, [channels, groupId]);
  
  return (
    <ChatProvider>
      <div className="h-screen">
        <ChatInterface mode="sidebar" />
      </div>
    </ChatProvider>
  );
}
```

---

## 🔐 Access Control Cheat Sheet

| Component | Requires Login | Suitable For |
|-----------|---------------|--------------|
| `PublicSupportChat` | ❌ No | Homepage, public pages |
| `ChatInterface` | ✅ Yes | Student/instructor dashboards |
| `ChatProvider` | ✅ Yes | Wrapped components |

---

## 🎨 Styling & Theming

### Customize Colors

The chat uses your Tailwind theme automatically. Primary color comes from `tailwind.config.ts`:

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        // ... your brand colors
        600: '#0284c7',  // This is used for chat
      }
    }
  }
}
```

### Override Specific Styles

```tsx
// components/CustomChat.tsx
import { ChatInterface } from '@/components/chat';

export function CustomChat() {
  return (
    <div className="custom-chat">
      <ChatInterface mode="floating" />
      <style jsx global>{`
        .custom-chat button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>
    </div>
  );
}
```

---

## 📱 Mobile Optimization

The chat is fully responsive out of the box:

- **Desktop:** Full features, sidebar mode available
- **Tablet:** Floating mode recommended
- **Mobile:** Optimized touch targets, full-screen on open

### Force Mobile Layout

```tsx
'use client';

import { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/chat';

export function ResponsiveChat() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  return (
    <ChatInterface 
      mode={isMobile ? 'fullscreen' : 'floating'} 
    />
  );
}
```

---

## 🧪 Testing Your Integration

### 1. Test Public Support (No Login Required)

1. Visit any page with `<PublicSupportChat />`
2. Click the chat button (bottom-right)
3. Type a message
4. Check Odoo backend:
   - Go to **E-Learning → Chat → Support Chats**
   - Your message should appear

### 2. Test Student-Instructor Chat

1. Login as a student
2. Go to a course page
3. Click "Chat with Instructor"
4. Send a message
5. Login as the instructor
6. Check chat - message should be there

### 3. Test Direct Messages

1. Login as any user
2. Open chat interface
3. Click "Direct Messages"
4. Start a new conversation
5. Login as the other user
6. Verify message received

---

## 🚨 Troubleshooting

### Chat button not appearing

**Check:**
```tsx
// Make sure component is imported
import { PublicSupportChat } from '@/components/chat';

// Make sure it's rendered
<PublicSupportChat />

// Check browser console for errors
```

### Messages not sending

**Check:**
1. Odoo is running: `docker compose ps`
2. API endpoint is accessible: `http://localhost:8069/api/chat/channels`
3. Browser console for network errors

### Can't see channels

**Check:**
1. User is logged in: `console.log(user)`
2. User has proper group: Odoo → Settings → Users → Groups
3. ChatProvider is wrapping your component

---

## 📚 API Reference

### `useChat()` Hook

```tsx
const {
  channels,              // Array<Channel>
  activeChannel,         // Channel | null
  messages,             // Array<Message>
  loading,              // boolean
  setActiveChannel,     // (channel: Channel) => void
  sendMessage,          // (content: string) => Promise<void>
  createDirectChannel,  // (userId: number) => Promise<number>
  createStudentInstructorChannel, // (instructorId, courseId?) => Promise<number>
  toggleReaction,       // (messageId: number, emoji: string) => Promise<void>
  sendTypingIndicator,  // (channelId: number) => void
  refreshChannels,      // () => Promise<void>
} = useChat();
```

### Channel Types

```typescript
type ChannelType = 
  | 'public_support'        // Public → Support
  | 'student_instructor'    // Student → Instructor
  | 'student_support'       // Student → Support
  | 'instructor_admin'      // Instructor → Admin
  | 'group'                 // Study group
  | 'course'                // Course-wide
  | 'direct';               // One-on-one
```

---

## 🎉 You're Ready!

Start with adding `<PublicSupportChat />` to your homepage, then gradually integrate chat into more areas of your application.

**Need help?** Check the full documentation in `docs/CHAT_SYSTEM_IMPLEMENTATION.md`

---

**Quick Links:**
- [Full Documentation](./docs/CHAT_SYSTEM_IMPLEMENTATION.md)
- [Implementation Summary](./CHAT_IMPLEMENTATION_SUMMARY.md)
- [Odoo Backend](http://localhost:8069)
- [Frontend Dev](http://localhost:4000)
