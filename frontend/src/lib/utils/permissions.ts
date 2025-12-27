import { UserRole, Permission } from '@/types/admin';

// Role hierarchy - higher roles inherit lower role permissions
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  student: 0,
  student_admin: 1,
  instructor: 2,
  manager: 3,
  admin: 4,
};

// Permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  student: [],
  student_admin: [
    'users.view',
    'enrollments.view',
  ],
  instructor: [
    'courses.view',
    'courses.create',
    'courses.edit',
    'enrollments.view',
    'certificates.view',
    'analytics.view',
  ],
  manager: [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'instructors.view', 'instructors.create', 'instructors.edit', 'instructors.delete',
    'courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'courses.publish',
    'enrollments.view', 'enrollments.create', 'enrollments.edit', 'enrollments.delete',
    'certificates.view', 'certificates.issue',
    'analytics.view',
  ],
  admin: [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'instructors.view', 'instructors.create', 'instructors.edit', 'instructors.delete',
    'courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'courses.publish',
    'enrollments.view', 'enrollments.create', 'enrollments.edit', 'enrollments.delete',
    'certificates.view', 'certificates.issue', 'certificates.revoke',
    'analytics.view', 'settings.view', 'settings.edit',
  ],
};

// Admin routes and required permissions
export const ADMIN_ROUTES: Record<string, Permission | Permission[]> = {
  '/admin': [],  // Dashboard - accessible to all admin roles
  '/admin/users': 'users.view',
  '/admin/users/new': 'users.create',
  '/admin/instructors': 'instructors.view',
  '/admin/instructors/new': 'instructors.create',
  '/admin/courses': 'courses.view',
  '/admin/courses/new': 'courses.create',
  '/admin/enrollments': 'enrollments.view',
  '/admin/enrollments/bulk': 'enrollments.create',
  '/admin/certificates': 'certificates.view',
  '/admin/analytics': 'analytics.view',
  '/admin/settings': 'settings.view',
};

// Check if user has a specific permission
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

// Check if user has any of the permissions
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return permissions.some(p => rolePermissions.includes(p));
}

// Check if user has all of the permissions
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return permissions.every(p => rolePermissions.includes(p));
}

// Check if user can access a route
export function canAccessRoute(role: UserRole, route: string): boolean {
  // Admin roles that can access admin panel
  if (!['admin', 'manager', 'instructor', 'student_admin'].includes(role)) {
    return false;
  }
  
  // Find matching route
  const routePermissions = ADMIN_ROUTES[route];
  if (routePermissions === undefined) {
    // Check for dynamic routes
    for (const [pattern, perms] of Object.entries(ADMIN_ROUTES)) {
      if (route.startsWith(pattern.replace('/new', '').replace('/[', ''))) {
        if (Array.isArray(perms)) {
          return perms.length === 0 || hasAnyPermission(role, perms);
        }
        return hasPermission(role, perms);
      }
    }
    return true; // Unknown routes - allow and let page handle
  }
  
  if (Array.isArray(routePermissions)) {
    return routePermissions.length === 0 || hasAnyPermission(role, routePermissions);
  }
  
  return hasPermission(role, routePermissions);
}

// Get all permissions for a role
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Check if role is admin level
export function isAdminRole(role: UserRole): boolean {
  return role === 'admin';
}

// Check if role can access admin panel
export function canAccessAdminPanel(role: UserRole): boolean {
  return ['admin', 'manager', 'instructor', 'student_admin'].includes(role);
}

// Get display name for role
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    student: 'Student',
    student_admin: 'Student Admin',
    instructor: 'Instructor',
    manager: 'Manager',
    admin: 'Administrator',
  };
  return names[role] || role;
}

// Get role badge color
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    student: 'bg-gray-100 text-gray-800',
    student_admin: 'bg-blue-100 text-blue-800',
    instructor: 'bg-purple-100 text-purple-800',
    manager: 'bg-orange-100 text-orange-800',
    admin: 'bg-red-100 text-red-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}
