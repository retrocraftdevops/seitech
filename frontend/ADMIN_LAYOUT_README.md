# Admin Layout and Navigation Components

This document describes the admin layout and navigation system created for the SEI Tech International platform.

## Directory Structure

```
/src/app/(admin)/
├── layout.tsx              # Admin layout wrapper with auth protection
└── page.tsx                # Admin dashboard page (existing)

/src/components/features/admin/
├── AdminSidebar.tsx        # Main navigation sidebar
├── AdminHeader.tsx         # Top header with search, notifications, user menu
├── StatsCard.tsx          # Reusable stat card component (existing)
├── RecentActivity.tsx     # Activity feed component (existing)
├── QuickActions.tsx       # Quick action buttons grid (existing)
└── index.ts               # Barrel export file

/src/lib/utils/
└── permissions.ts         # Permission and role utilities (existing)
```

## Created Files

### 1. `/src/app/(admin)/layout.tsx`

Admin layout wrapper that provides:
- **Route Protection**: Redirects unauthenticated users to login
- **Role-Based Access**: Only allows admin, manager, instructor, and student_admin roles
- **Permission Checking**: Validates route access based on user permissions
- **Layout Structure**: Provides sidebar and header for all admin pages
- **Loading States**: Shows loading skeleton while checking authentication

**Key Features:**
- Uses `useAuthStore` for authentication state
- Implements `canAccessAdminPanel` and `canAccessRoute` permission checks
- Preserves redirect URL for post-login navigation
- Responsive layout with mobile support

### 2. `/src/components/features/admin/AdminSidebar.tsx`

Navigation sidebar component with:
- **Logo & Branding**: SEI Tech logo and name
- **Navigation Menu**: Permission-filtered navigation items
- **Active State**: Highlights current page
- **Collapsible Design**: Desktop collapse/expand functionality
- **Mobile Support**: Full-screen mobile menu with backdrop
- **User Info**: Shows user avatar and role at bottom

**Navigation Items:**
- Dashboard (all roles)
- Users (requires `users.view`)
- Instructors (requires `instructors.view`)
- Courses (requires `courses.view`)
- Enrollments (requires `enrollments.view`)
- Certificates (requires `certificates.view`)
- Analytics (requires `analytics.view`)
- Settings (requires `settings.view`)

**Icons Used:**
- LayoutDashboard, Users, GraduationCap, BookOpen, UserCheck, Award, BarChart3, Settings
- ChevronLeft, ChevronRight, X (UI controls)

### 3. `/src/components/features/admin/AdminHeader.tsx`

Top header component featuring:
- **Breadcrumbs**: Auto-generated from current pathname
- **Search Bar**: Placeholder for search functionality (desktop only)
- **Notifications**: Dropdown with sample notifications and badge
- **User Menu**: Dropdown with profile, settings, and logout

**Notifications Features:**
- Red badge indicator for unread notifications
- Scrollable list of recent activities
- "View all notifications" link
- Click-outside-to-close behavior

**User Menu Features:**
- User avatar with initials
- Name and role display
- Profile link
- Settings link
- Sign out button
- Click-outside-to-close behavior

### 4. `/src/components/features/admin/index.ts`

Barrel export file for easier imports:
```typescript
export { AdminSidebar } from './AdminSidebar';
export { AdminHeader } from './AdminHeader';
export { StatsCard } from './StatsCard';
export { RecentActivity } from './RecentActivity';
export { QuickActions } from './QuickActions';
```

## Usage

### Basic Layout Usage

The layout is automatically applied to all routes under `/admin`:

```typescript
// Any page at /admin/* will use this layout
export default function MyAdminPage() {
  return (
    <div>
      <h1>My Admin Page</h1>
      {/* Content here */}
    </div>
  );
}
```

### Using Admin Components

```typescript
import { StatsCard, RecentActivity, QuickActions } from '@/components/features/admin';
import { Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <StatsCard
        title="Total Users"
        value={1234}
        icon={Users}
        trend={{ value: 12, isPositive: true }}
        description="vs last month"
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
      />

      <QuickActions />
      <RecentActivity activities={activities} />
    </div>
  );
}
```

## Permission System

The admin layout uses a comprehensive permission system:

### Role Hierarchy
- **student**: No admin access
- **student_admin**: Limited admin access (users, enrollments view)
- **instructor**: Course and enrollment management
- **manager**: Full management except system settings
- **admin**: Complete system access

### Permission Functions

From `/src/lib/utils/permissions.ts`:

```typescript
// Check if user can access admin panel
canAccessAdminPanel(role: UserRole): boolean

// Check if user can access specific route
canAccessRoute(role: UserRole, route: string): boolean

// Check for specific permission
hasPermission(role: UserRole, permission: Permission): boolean

// Check for any of multiple permissions
hasAnyPermission(role: UserRole, permissions: Permission[]): boolean

// Check for all of multiple permissions
hasAllPermissions(role: UserRole, permissions: Permission[]): boolean

// Get role display name
getRoleDisplayName(role: UserRole): string

// Get role badge color classes
getRoleBadgeColor(role: UserRole): string
```

## Styling

All components use Tailwind CSS with the following design principles:

### Colors
- **Primary**: Blue (600, 700) for primary actions
- **Success**: Green (500, 600) for positive trends
- **Warning**: Orange (500, 600) for warnings
- **Error**: Red (500, 600) for errors
- **Neutral**: Gray (50-900) for backgrounds and text

### Layout
- **Sidebar Width**: 64 (16rem) expanded, 16 (4rem) collapsed
- **Header Height**: 16 (4rem)
- **Spacing**: Consistent 6 (1.5rem) gaps
- **Border Radius**: 0.5rem (8px) for cards and buttons

### Responsive Breakpoints
- **Mobile**: < 1024px (full-width content, hidden sidebar)
- **Desktop**: >= 1024px (sidebar visible, collapsible)

## Dependencies

Required packages (already in package.json):
- `next`: 14.2.15
- `react`: 18.3.1
- `lucide-react`: 0.446.0
- `zustand`: 4.5.5
- `tailwindcss`: 3.4.12

## Authentication Flow

1. User navigates to `/admin/*`
2. Layout checks `isLoading` from auth store
3. If loading, shows loading skeleton
4. If not authenticated, redirects to `/login?redirect=/admin/*`
5. If authenticated but not admin role, redirects to `/dashboard`
6. If authenticated and admin role, checks route permissions
7. If no route permission, redirects to `/admin` (dashboard)
8. If all checks pass, renders page with layout

## Mobile Considerations

- Sidebar hidden on mobile (< 1024px)
- Floating action button for mobile menu
- Mobile menu slides in from left
- Dark backdrop when menu open
- Click outside to close
- Search bar hidden on small screens (< 768px)

## Future Enhancements

Potential improvements:
1. Real-time notifications using WebSocket
2. Search functionality implementation
3. Keyboard shortcuts for navigation
4. Theme switching (light/dark mode)
5. Customizable sidebar order
6. Recently viewed pages
7. Notification preferences
8. Sidebar favorites/pinned items

## Testing

To test the admin layout:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/admin`

3. Test authentication:
   - Without login -> should redirect to `/login`
   - With student role -> should redirect to `/dashboard`
   - With admin/manager role -> should show admin dashboard

4. Test navigation:
   - Click each menu item
   - Verify active states
   - Test breadcrumbs

5. Test responsive design:
   - Collapse sidebar on desktop
   - Open mobile menu
   - Test click-outside-to-close

## Troubleshooting

### Issue: Sidebar not showing
- Check if user role is admin/manager/instructor/student_admin
- Verify `canAccessAdminPanel` returns true
- Check browser console for errors

### Issue: Navigation items missing
- Verify user has required permissions
- Check `ROLE_PERMISSIONS` in `/src/lib/utils/permissions.ts`

### Issue: Redirect loop
- Check authentication state in auth store
- Verify route permissions configuration
- Check for infinite useEffect dependencies

### Issue: Styles not applied
- Ensure Tailwind is properly configured
- Check for CSS conflicts
- Verify class names are correct
