'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  UserCog,
  Eye,
  Mail,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { AdminUser, UserRole } from '@/types/admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from '@/components/ui/Dialog';
import { format } from 'date-fns';

interface UserTableProps {
  users: AdminUser[];
  isLoading?: boolean;
}

export function UserTable({ users, isLoading }: UserTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

  const getRoleBadgeVariant = (role: UserRole) => {
    const variants: Record<UserRole, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
      student: 'default',
      student_admin: 'info',
      instructor: 'primary',
      manager: 'warning',
      admin: 'danger',
    };
    return variants[role] || 'default';
  };

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      student: 'Student',
      student_admin: 'Student Admin',
      instructor: 'Instructor',
      manager: 'Manager',
      admin: 'Admin',
    };
    return labels[role] || role;
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      // TODO: Implement actual API call
      // await fetch(`/api/admin/users/${selectedUser.id}`, { method: 'DELETE' });
      console.log('Deleting user:', selectedUser.id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleEdit = (userId: number) => {
    router.push(`/users/${userId}`);
  };

  const handleView = (userId: number) => {
    router.push(`/users/${userId}`);
  };

  const openDeleteDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    setActionMenuOpen(null);
  };

  if (isLoading) {
    return <UserTableSkeleton />;
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
        <div className="max-w-sm mx-auto">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <UserCog className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500 mb-6">
            Get started by creating your first user.
          </p>
          <Button onClick={() => router.push('/users/new')}>Create User</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Inactive</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {user.lastLogin ? (
                    <span className="text-sm text-gray-600">
                      {format(new Date(user.lastLogin), 'MMM d, yyyy')}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Never</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleView(user.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEdit(user.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openDeleteDialog(user)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {selectedUser && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {selectedUser.firstName.charAt(0)}
                        {selectedUser.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{selectedUser.name}</div>
                    <div className="text-sm text-gray-500">{selectedUser.email}</div>
                  </div>
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UserTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
