# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError


class StudyGroup(models.Model):
    _name = 'seitech.study.group'
    _description = 'Study Group'
    _inherit = ['mail.thread', 'mail.activity.mixin', 'image.mixin']
    _order = 'is_featured desc, member_count desc, create_date desc'

    name = fields.Char(
        string='Group Name',
        required=True,
        tracking=True,
        index=True,
    )
    description = fields.Html(
        string='Description',
        sanitize_attributes=True,
        sanitize_style=True,
    )
    
    # Group Settings
    group_type = fields.Selection(
        [
            ('course', 'Course Study Group'),
            ('skill', 'Skill-Based Group'),
            ('project', 'Project Collaboration'),
            ('general', 'General Learning'),
        ],
        string='Group Type',
        required=True,
        default='general',
    )
    privacy = fields.Selection(
        [
            ('public', 'Public'),
            ('private', 'Private'),
            ('secret', 'Secret'),
        ],
        string='Privacy',
        required=True,
        default='public',
        tracking=True,
    )
    join_policy = fields.Selection(
        [
            ('open', 'Open - Anyone can join'),
            ('approval', 'Approval Required'),
            ('invitation', 'Invitation Only'),
        ],
        string='Join Policy',
        required=True,
        default='open',
    )
    
    # Related Content
    course_id = fields.Many2one(
        'slide.channel',
        string='Related Course',
        ondelete='cascade',
    )
    skill_ids = fields.Many2many(
        'seitech.skill',
        string='Focus Skills',
    )
    learning_path_id = fields.Many2one(
        'seitech.learning.path',
        string='Learning Path',
        ondelete='cascade',
    )
    
    # Members
    owner_id = fields.Many2one(
        'res.users',
        string='Owner',
        required=True,
        default=lambda self: self.env.user,
        index=True,
    )
    member_ids = fields.One2many(
        'seitech.study.group.member',
        'group_id',
        string='Members',
    )
    member_count = fields.Integer(
        string='Member Count',
        compute='_compute_member_count',
        store=True,
    )
    max_members = fields.Integer(
        string='Maximum Members',
        default=50,
        help='0 for unlimited',
    )
    
    # Activity
    discussion_ids = fields.One2many(
        'seitech.discussion',
        'study_group_id',
        string='Discussions',
    )
    discussion_count = fields.Integer(
        string='Discussions',
        compute='_compute_discussion_count',
        store=True,
    )
    
    # Schedule
    schedule_ids = fields.One2many(
        'seitech.study.session',
        'group_id',
        string='Study Sessions',
    )
    next_session_id = fields.Many2one(
        'seitech.study.session',
        string='Next Session',
        compute='_compute_next_session',
    )
    
    # Status
    state = fields.Selection(
        [
            ('draft', 'Draft'),
            ('active', 'Active'),
            ('archived', 'Archived'),
        ],
        string='Status',
        default='draft',
        required=True,
        tracking=True,
    )
    is_featured = fields.Boolean(
        string='Featured',
        default=False,
    )
    
    # Goals and Progress
    goal = fields.Text(
        string='Group Goal',
    )
    progress_percentage = fields.Float(
        string='Progress',
        compute='_compute_progress',
        store=True,
    )
    
    # Timestamps
    last_activity_date = fields.Datetime(
        string='Last Activity',
        default=fields.Datetime.now,
        readonly=True,
    )
    
    @api.depends('member_ids')
    def _compute_member_count(self):
        for group in self:
            group.member_count = len(group.member_ids.filtered(lambda m: m.state == 'active'))
    
    @api.depends('discussion_ids')
    def _compute_discussion_count(self):
        for group in self:
            group.discussion_count = len(group.discussion_ids)
    
    @api.depends('schedule_ids')
    def _compute_next_session(self):
        now = fields.Datetime.now()
        for group in self:
            next_session = group.schedule_ids.filtered(
                lambda s: s.scheduled_date > now and s.state == 'scheduled'
            ).sorted('scheduled_date')
            group.next_session_id = next_session[0] if next_session else False
    
    @api.depends('member_ids.progress_percentage')
    def _compute_progress(self):
        for group in self:
            active_members = group.member_ids.filtered(lambda m: m.state == 'active')
            if active_members:
                group.progress_percentage = sum(active_members.mapped('progress_percentage')) / len(active_members)
            else:
                group.progress_percentage = 0.0
    
    @api.constrains('max_members', 'member_count')
    def _check_max_members(self):
        for group in self:
            if group.max_members > 0 and group.member_count > group.max_members:
                raise ValidationError(_('Group has reached maximum member limit.'))
    
    def action_activate(self):
        """Activate the study group"""
        self.ensure_one()
        self.state = 'active'
    
    def action_archive(self):
        """Archive the study group"""
        self.ensure_one()
        self.state = 'archived'
    
    def action_join(self):
        """Current user joins the group"""
        self.ensure_one()
        user = self.env.user
        
        # Check if already a member
        existing = self.member_ids.filtered(lambda m: m.user_id == user)
        if existing:
            raise UserError(_('You are already a member of this group.'))
        
        # Check max members
        if self.max_members > 0 and self.member_count >= self.max_members:
            raise UserError(_('This group has reached its maximum capacity.'))
        
        # Create membership based on join policy
        if self.join_policy == 'open':
            self.env['seitech.study.group.member'].create({
                'group_id': self.id,
                'user_id': user.id,
                'role': 'member',
                'state': 'active',
            })
            return {'status': 'joined'}
        elif self.join_policy == 'approval':
            self.env['seitech.study.group.member'].create({
                'group_id': self.id,
                'user_id': user.id,
                'role': 'member',
                'state': 'pending',
            })
            return {'status': 'pending_approval'}
        else:
            raise UserError(_('This group is invitation only.'))
    
    def action_leave(self):
        """Current user leaves the group"""
        self.ensure_one()
        user = self.env.user
        
        if user == self.owner_id:
            raise UserError(_('Group owner cannot leave. Transfer ownership first.'))
        
        member = self.member_ids.filtered(lambda m: m.user_id == user)
        if member:
            member.unlink()
        return {'status': 'left'}
    
    def action_invite_users(self, user_ids):
        """Invite users to the group"""
        self.ensure_one()
        if self.env.user != self.owner_id:
            moderators = self.member_ids.filtered(lambda m: m.role in ['moderator', 'admin'])
            if self.env.user not in moderators.mapped('user_id'):
                raise UserError(_('Only group owner or moderators can invite users.'))
        
        invited_count = 0
        for user_id in user_ids:
            existing = self.member_ids.filtered(lambda m: m.user_id.id == user_id)
            if not existing:
                self.env['seitech.study.group.member'].create({
                    'group_id': self.id,
                    'user_id': user_id,
                    'role': 'member',
                    'state': 'invited',
                })
                invited_count += 1
        
        return {'invited': invited_count}
    
    @api.model
    def get_recommended_groups(self, user_id=None, limit=10):
        """Get recommended study groups for a user"""
        if not user_id:
            user_id = self.env.user.id
        
        user = self.env['res.users'].browse(user_id)
        
        # Get user's enrollments and skills
        enrollments = self.env['seitech.enrollment'].search([
            ('user_id', '=', user_id),
            ('state', 'in', ['active', 'completed']),
        ])
        course_ids = enrollments.mapped('course_id.id')
        
        user_skills = self.env['seitech.user.skill'].search([
            ('user_id', '=', user_id),
        ])
        skill_ids = user_skills.mapped('skill_id.id')
        
        # Find groups related to user's interests
        groups = self.search([
            ('state', '=', 'active'),
            ('privacy', 'in', ['public', 'private']),
            '|', '|',
            ('course_id', 'in', course_ids),
            ('skill_ids', 'in', skill_ids),
            ('group_type', '=', 'general'),
        ], limit=limit * 2)
        
        # Filter out groups user is already in
        current_groups = self.env['seitech.study.group.member'].search([
            ('user_id', '=', user_id),
            ('state', '=', 'active'),
        ]).mapped('group_id.id')
        
        recommended = groups.filtered(lambda g: g.id not in current_groups)
        return recommended[:limit]


class StudySession(models.Model):
    _name = 'seitech.study.session'
    _description = 'Study Session'
    _order = 'scheduled_date desc'

    name = fields.Char(
        string='Session Name',
        required=True,
    )
    group_id = fields.Many2one(
        'seitech.study.group',
        string='Study Group',
        required=True,
        ondelete='cascade',
    )
    description = fields.Text(
        string='Description',
    )
    scheduled_date = fields.Datetime(
        string='Scheduled Date',
        required=True,
    )
    duration = fields.Float(
        string='Duration (hours)',
        default=1.0,
    )
    meeting_url = fields.Char(
        string='Meeting URL',
    )
    state = fields.Selection(
        [
            ('scheduled', 'Scheduled'),
            ('ongoing', 'Ongoing'),
            ('completed', 'Completed'),
            ('cancelled', 'Cancelled'),
        ],
        string='Status',
        default='scheduled',
        required=True,
    )
    attendee_count = fields.Integer(
        string='Attendees',
        default=0,
    )
