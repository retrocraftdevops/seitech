# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError


class StudyGroupMember(models.Model):
    _name = 'seitech.study.group.member'
    _description = 'Study Group Member'
    _order = 'role desc, contribution_score desc, join_date desc'
    _rec_name = 'user_id'

    group_id = fields.Many2one(
        'seitech.study.group',
        string='Study Group',
        required=True,
        ondelete='cascade',
        index=True,
    )
    user_id = fields.Many2one(
        'res.users',
        string='User',
        required=True,
        ondelete='cascade',
        index=True,
    )
    
    # Role and Status
    role = fields.Selection(
        [
            ('member', 'Member'),
            ('moderator', 'Moderator'),
            ('admin', 'Administrator'),
        ],
        string='Role',
        required=True,
        default='member',
    )
    state = fields.Selection(
        [
            ('invited', 'Invited'),
            ('pending', 'Pending Approval'),
            ('active', 'Active'),
            ('inactive', 'Inactive'),
            ('banned', 'Banned'),
        ],
        string='Status',
        required=True,
        default='pending',
    )
    
    # Contributions and Activity
    contribution_score = fields.Integer(
        string='Contribution Score',
        default=0,
        help='Points earned from group activities',
    )
    discussion_count = fields.Integer(
        string='Discussions Created',
        compute='_compute_activity_stats',
        store=True,
    )
    reply_count = fields.Integer(
        string='Replies Posted',
        compute='_compute_activity_stats',
        store=True,
    )
    helpful_count = fields.Integer(
        string='Helpful Answers',
        default=0,
        help='Number of best answers',
    )
    
    # Engagement
    last_activity_date = fields.Datetime(
        string='Last Activity',
        readonly=True,
    )
    sessions_attended = fields.Integer(
        string='Sessions Attended',
        default=0,
    )
    
    # Progress Tracking
    progress_percentage = fields.Float(
        string='Progress',
        default=0.0,
        help='Progress in group learning path',
    )
    
    # Badges and Recognition
    badge_ids = fields.Many2many(
        'gamification.badge',
        string='Badges Earned',
    )
    
    # Timestamps
    join_date = fields.Datetime(
        string='Join Date',
        default=fields.Datetime.now,
        readonly=True,
    )
    approved_date = fields.Datetime(
        string='Approved Date',
        readonly=True,
    )
    
    # Computed Fields
    user_name = fields.Char(
        related='user_id.name',
        string='User Name',
        readonly=True,
    )
    user_avatar = fields.Image(
        related='user_id.image_128',
        readonly=True,
    )
    group_name = fields.Char(
        related='group_id.name',
        string='Group Name',
        readonly=True,
    )
    is_owner = fields.Boolean(
        string='Is Owner',
        compute='_compute_is_owner',
        store=True,
    )
    
    @api.depends('user_id', 'group_id.owner_id')
    def _compute_is_owner(self):
        for member in self:
            member.is_owner = (member.user_id == member.group_id.owner_id)
    
    @api.depends('user_id')
    def _compute_activity_stats(self):
        for member in self:
            # Count discussions created in this group
            member.discussion_count = self.env['seitech.discussion'].search_count([
                ('study_group_id', '=', member.group_id.id),
                ('author_id', '=', member.user_id.id),
            ])
            
            # Count replies in group discussions
            group_discussions = self.env['seitech.discussion'].search([
                ('study_group_id', '=', member.group_id.id),
            ])
            member.reply_count = self.env['seitech.discussion.reply'].search_count([
                ('discussion_id', 'in', group_discussions.ids),
                ('author_id', '=', member.user_id.id),
            ])
    
    _sql_constraints = [
        ('user_group_unique', 'unique(user_id, group_id)', 'User is already a member of this group!')
    ]
    
    @api.constrains('role', 'group_id')
    def _check_role_permissions(self):
        for member in self:
            # Only owner can have admin role
            if member.role == 'admin' and not member.is_owner:
                raise ValidationError(_('Only group owner can have admin role.'))
    
    def action_approve(self):
        """Approve pending membership"""
        self.ensure_one()
        if self.state != 'pending':
            raise UserError(_('Only pending members can be approved.'))
        
        # Check permissions
        if self.env.user != self.group_id.owner_id:
            moderators = self.search([
                ('group_id', '=', self.group_id.id),
                ('user_id', '=', self.env.user.id),
                ('role', 'in', ['moderator', 'admin']),
                ('state', '=', 'active'),
            ])
            if not moderators:
                raise UserError(_('Only group owner or moderators can approve members.'))
        
        self.write({
            'state': 'active',
            'approved_date': fields.Datetime.now(),
        })
        
        # Notify user
        self._notify_user_approved()
        return True
    
    def action_reject(self):
        """Reject pending membership"""
        self.ensure_one()
        if self.state != 'pending':
            raise UserError(_('Only pending members can be rejected.'))
        
        self.unlink()
        return True
    
    def action_promote_to_moderator(self):
        """Promote member to moderator"""
        self.ensure_one()
        if self.env.user != self.group_id.owner_id:
            raise UserError(_('Only group owner can promote members.'))
        
        if self.state != 'active':
            raise UserError(_('Only active members can be promoted.'))
        
        self.role = 'moderator'
        return True
    
    def action_demote_to_member(self):
        """Demote moderator to member"""
        self.ensure_one()
        if self.env.user != self.group_id.owner_id:
            raise UserError(_('Only group owner can demote moderators.'))
        
        if self.role == 'admin':
            raise UserError(_('Cannot demote group owner.'))
        
        self.role = 'member'
        return True
    
    def action_remove(self):
        """Remove member from group"""
        self.ensure_one()
        
        if self.is_owner:
            raise UserError(_('Cannot remove group owner. Transfer ownership first.'))
        
        # Check permissions
        if self.env.user != self.group_id.owner_id:
            moderators = self.search([
                ('group_id', '=', self.group_id.id),
                ('user_id', '=', self.env.user.id),
                ('role', 'in', ['moderator', 'admin']),
                ('state', '=', 'active'),
            ])
            if not moderators and self.env.user != self.user_id:
                raise UserError(_('You do not have permission to remove this member.'))
        
        self.unlink()
        return True
    
    def action_ban(self):
        """Ban member from group"""
        self.ensure_one()
        
        if self.is_owner:
            raise UserError(_('Cannot ban group owner.'))
        
        # Check permissions
        if self.env.user != self.group_id.owner_id:
            moderators = self.search([
                ('group_id', '=', self.group_id.id),
                ('user_id', '=', self.env.user.id),
                ('role', 'in', ['moderator', 'admin']),
                ('state', '=', 'active'),
            ])
            if not moderators:
                raise UserError(_('Only owner or moderators can ban members.'))
        
        self.state = 'banned'
        return True
    
    def action_award_points(self, points, reason=None):
        """Award contribution points to member"""
        self.ensure_one()
        self.contribution_score += points
        self.last_activity_date = fields.Datetime.now()
        
        # Log the award
        self.message_post(
            body=_('Awarded %d points. Reason: %s') % (points, reason or 'Activity'),
            subtype_xmlid='mail.mt_note',
        )
        return True
    
    def action_increment_helpful(self):
        """Increment helpful answer count"""
        self.ensure_one()
        self.helpful_count += 1
        self.action_award_points(20, 'Best Answer')
    
    def _notify_user_approved(self):
        """Notify user when membership is approved"""
        self.ensure_one()
        # Send notification to user
        pass
    
    @api.model
    def get_top_contributors(self, group_id, limit=10):
        """Get top contributors in a group"""
        return self.search([
            ('group_id', '=', group_id),
            ('state', '=', 'active'),
        ], order='contribution_score desc, helpful_count desc', limit=limit)
    
    @api.model
    def get_member_stats(self, user_id, group_id):
        """Get detailed stats for a member"""
        member = self.search([
            ('user_id', '=', user_id),
            ('group_id', '=', group_id),
        ], limit=1)
        
        if not member:
            return None
        
        # Calculate rank
        all_members = self.search([
            ('group_id', '=', group_id),
            ('state', '=', 'active'),
        ], order='contribution_score desc')
        rank = next((i + 1 for i, m in enumerate(all_members) if m.id == member.id), 0)
        
        return {
            'member_id': member.id,
            'contribution_score': member.contribution_score,
            'discussion_count': member.discussion_count,
            'reply_count': member.reply_count,
            'helpful_count': member.helpful_count,
            'sessions_attended': member.sessions_attended,
            'progress_percentage': member.progress_percentage,
            'rank': rank,
            'total_members': len(all_members),
            'role': member.role,
            'join_date': member.join_date,
        }
