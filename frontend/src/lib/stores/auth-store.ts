import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import type { UserRole, Permission } from '@/types/admin';

// Extended User type with role and permissions
export interface AuthUser extends User {
  role: UserRole;
  permissions: Permission[];
  instructorId?: number;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;

  // Permission helpers
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isInstructor: () => boolean;
  canAccessAdmin: () => boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Helper function to normalize user data with backwards compatibility
const normalizeUserData = (userData: any): AuthUser | null => {
  if (!userData) return null;

  return {
    ...userData,
    role: userData.role || 'student', // Default to 'student' if not provided
    permissions: userData.permissions || [], // Default to empty array if not provided
    instructorId: userData.instructorId,
  } as AuthUser;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const result = await res.json();

          if (!res.ok || !result.success) {
            throw new Error(result.message || 'Login failed');
          }

          const user = normalizeUserData(result.data?.user);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ user: null, isAuthenticated: false });
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await res.json();

          if (!res.ok || !result.success) {
            throw new Error(result.message || 'Registration failed');
          }

          // Registration doesn't auto-login, just return success
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      refreshUser: async () => {
        try {
          const res = await fetch('/api/auth/me');
          const result = await res.json();
          if (res.ok && result.success && result.data) {
            const user = normalizeUserData(result.data);
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      // Permission helper methods
      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        return user.permissions.includes(permission);
      },

      hasAnyPermission: (permissions) => {
        const { user } = get();
        if (!user) return false;
        return permissions.some((permission) => user.permissions.includes(permission));
      },

      hasAllPermissions: (permissions) => {
        const { user } = get();
        if (!user) return false;
        return permissions.every((permission) => user.permissions.includes(permission));
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      isManager: () => {
        const { user } = get();
        return user?.role === 'manager';
      },

      isInstructor: () => {
        const { user } = get();
        return user?.role === 'instructor';
      },

      canAccessAdmin: () => {
        const { user } = get();
        if (!user) return false;
        // Admin, manager, instructor, and student_admin can access admin panel
        return ['admin', 'manager', 'instructor', 'student_admin'].includes(user.role);
      },
    }),
    {
      name: 'seitech-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
