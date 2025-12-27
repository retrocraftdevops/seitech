# -*- coding: utf-8 -*-
from odoo import models, fields, api


class ResUsers(models.Model):
    _inherit = 'res.users'

    seitech_role = fields.Selection([
        ('student', 'Student'),
        ('student_admin', 'Student Admin'),
        ('instructor', 'Instructor'),
        ('manager', 'Manager'),
        ('admin', 'Administrator'),
    ], string='SEI Tech Role', default='student')

    instructor_id = fields.Many2one('seitech.instructor', string='Instructor Profile')

    @api.model
    def get_permissions_for_role(self, role):
        """Return list of permissions for a given role"""
        permissions = {
            'student': [],
            'student_admin': ['users.view', 'enrollments.view'],
            'instructor': [
                'courses.view', 'courses.create', 'courses.edit',
                'enrollments.view', 'certificates.view', 'analytics.view'
            ],
            'manager': [
                'users.view', 'users.create', 'users.edit', 'users.delete',
                'instructors.view', 'instructors.create', 'instructors.edit', 'instructors.delete',
                'courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'courses.publish',
                'enrollments.view', 'enrollments.create', 'enrollments.edit', 'enrollments.delete',
                'certificates.view', 'certificates.issue',
                'analytics.view'
            ],
            'admin': [
                'users.view', 'users.create', 'users.edit', 'users.delete',
                'instructors.view', 'instructors.create', 'instructors.edit', 'instructors.delete',
                'courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'courses.publish',
                'enrollments.view', 'enrollments.create', 'enrollments.edit', 'enrollments.delete',
                'certificates.view', 'certificates.issue', 'certificates.revoke',
                'analytics.view', 'settings.view', 'settings.edit'
            ]
        }
        return permissions.get(role, [])

    def get_user_permissions(self):
        """Get permissions for current user based on their seitech_role"""
        self.ensure_one()
        return self.get_permissions_for_role(self.seitech_role)

    def has_permission(self, permission):
        """Check if user has a specific permission"""
        self.ensure_one()
        user_permissions = self.get_user_permissions()
        return permission in user_permissions

    @api.model
    def create(self, vals):
        """Override create to set default groups based on seitech_role"""
        user = super(ResUsers, self).create(vals)
        if 'seitech_role' in vals:
            user._update_groups_from_role()
        return user

    def write(self, vals):
        """Override write to update groups when seitech_role changes"""
        res = super(ResUsers, self).write(vals)
        if 'seitech_role' in vals:
            self._update_groups_from_role()
        return res

    def _update_groups_from_role(self):
        """Update Odoo groups based on seitech_role"""
        for user in self:
            if user.seitech_role == 'admin':
                group = self.env.ref('seitech_elearning.group_elearning_admin')
                user.groups_id = [(4, group.id)]
            elif user.seitech_role == 'manager':
                group = self.env.ref('seitech_elearning.group_elearning_manager')
                user.groups_id = [(4, group.id)]
            elif user.seitech_role == 'instructor':
                group = self.env.ref('seitech_elearning.group_elearning_instructor')
                user.groups_id = [(4, group.id)]
            elif user.seitech_role in ('student', 'student_admin'):
                group = self.env.ref('seitech_elearning.group_elearning_student')
                user.groups_id = [(4, group.id)]
