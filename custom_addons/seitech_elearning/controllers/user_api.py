# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request, Response
import json


class UserAPIController(http.Controller):
    """API endpoints for user role and permission management."""

    @http.route('/api/user/permissions', type='json', auth='user', methods=['POST'], csrf=False)
    def get_user_permissions(self):
        """Get permissions for current user."""
        try:
            user = request.env.user
            permissions = user.get_user_permissions()

            return {
                'success': True,
                'data': {
                    'user_id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'role': user.seitech_role,
                    'permissions': permissions,
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @http.route('/api/user/check-permission', type='json', auth='user', methods=['POST'], csrf=False)
    def check_permission(self, permission):
        """Check if current user has a specific permission."""
        try:
            user = request.env.user
            has_perm = user.has_permission(permission)

            return {
                'success': True,
                'data': {
                    'permission': permission,
                    'has_permission': has_perm,
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @http.route('/api/user/role', type='json', auth='user', methods=['POST'], csrf=False)
    def get_user_role(self):
        """Get current user's role and basic info."""
        try:
            user = request.env.user

            # Get instructor profile if exists
            instructor_data = None
            if user.instructor_id:
                instructor_data = {
                    'id': user.instructor_id.id,
                    'name': user.instructor_id.name,
                    'course_count': user.instructor_id.course_count,
                    'total_students': user.instructor_id.total_students,
                    'average_rating': user.instructor_id.average_rating,
                }

            return {
                'success': True,
                'data': {
                    'user_id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'role': user.seitech_role,
                    'instructor': instructor_data,
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @http.route('/api/users/list', type='json', auth='user', methods=['POST'], csrf=False)
    def list_users(self, role=None, limit=100, offset=0):
        """List users with optional role filter. Only for admins and managers."""
        try:
            user = request.env.user

            # Check permission
            if not user.has_permission('users.view'):
                return {
                    'success': False,
                    'error': 'Unauthorized: You do not have permission to view users'
                }

            domain = [('active', '=', True)]
            if role:
                domain.append(('seitech_role', '=', role))

            users = request.env['res.users'].search(domain, limit=limit, offset=offset)

            users_data = []
            for u in users:
                users_data.append({
                    'id': u.id,
                    'name': u.name,
                    'email': u.email,
                    'login': u.login,
                    'role': u.seitech_role,
                    'active': u.active,
                    'has_instructor_profile': bool(u.instructor_id),
                })

            return {
                'success': True,
                'data': {
                    'users': users_data,
                    'total': len(users),
                    'limit': limit,
                    'offset': offset,
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @http.route('/api/users/<int:user_id>/update-role', type='json', auth='user', methods=['POST'], csrf=False)
    def update_user_role(self, user_id, role):
        """Update user role. Only for admins."""
        try:
            current_user = request.env.user

            # Check permission
            if not current_user.has_permission('users.edit'):
                return {
                    'success': False,
                    'error': 'Unauthorized: You do not have permission to edit users'
                }

            # Validate role
            valid_roles = ['student', 'student_admin', 'instructor', 'manager', 'admin']
            if role not in valid_roles:
                return {
                    'success': False,
                    'error': f'Invalid role: {role}'
                }

            target_user = request.env['res.users'].browse(user_id)
            if not target_user.exists():
                return {
                    'success': False,
                    'error': 'User not found'
                }

            # Prevent self-demotion from admin
            if current_user.id == user_id and current_user.seitech_role == 'admin' and role != 'admin':
                return {
                    'success': False,
                    'error': 'You cannot demote yourself from administrator role'
                }

            target_user.write({'seitech_role': role})

            return {
                'success': True,
                'data': {
                    'user_id': target_user.id,
                    'name': target_user.name,
                    'role': target_user.seitech_role,
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @http.route('/api/roles/list', type='json', auth='user', methods=['POST'], csrf=False)
    def list_roles(self):
        """Get list of all available roles with their permissions."""
        try:
            user = request.env.user

            roles = {
                'student': {
                    'name': 'Student',
                    'description': 'Basic student access',
                    'permissions': user.get_permissions_for_role('student'),
                },
                'student_admin': {
                    'name': 'Student Admin',
                    'description': 'Student with additional view permissions',
                    'permissions': user.get_permissions_for_role('student_admin'),
                },
                'instructor': {
                    'name': 'Instructor',
                    'description': 'Can create and manage courses',
                    'permissions': user.get_permissions_for_role('instructor'),
                },
                'manager': {
                    'name': 'Manager',
                    'description': 'Can manage users, instructors, and all courses',
                    'permissions': user.get_permissions_for_role('manager'),
                },
                'admin': {
                    'name': 'Administrator',
                    'description': 'Full system access',
                    'permissions': user.get_permissions_for_role('admin'),
                },
            }

            return {
                'success': True,
                'data': roles
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @http.route('/api/user/stats', type='json', auth='user', methods=['POST'], csrf=False)
    def get_user_stats(self):
        """Get statistics about users. Only for admins and managers."""
        try:
            user = request.env.user

            # Check permission
            if not user.has_permission('users.view'):
                return {
                    'success': False,
                    'error': 'Unauthorized: You do not have permission to view user statistics'
                }

            Users = request.env['res.users']

            stats = {
                'total_users': Users.search_count([('active', '=', True)]),
                'students': Users.search_count([('seitech_role', '=', 'student'), ('active', '=', True)]),
                'student_admins': Users.search_count([('seitech_role', '=', 'student_admin'), ('active', '=', True)]),
                'instructors': Users.search_count([('seitech_role', '=', 'instructor'), ('active', '=', True)]),
                'managers': Users.search_count([('seitech_role', '=', 'manager'), ('active', '=', True)]),
                'admins': Users.search_count([('seitech_role', '=', 'admin'), ('active', '=', True)]),
            }

            return {
                'success': True,
                'data': stats
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
