# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError


class DiscussionReply(models.Model):
    _name = 'seitech.discussion.reply'
    _description = 'Discussion Reply'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'is_best_answer desc, upvote_count desc, create_date asc'
    _rec_name = 'content'

    discussion_id = fields.Many2one(
        'seitech.discussion',
        string='Discussion',
        required=True,
        ondelete='cascade',
        index=True,
    )
    content = fields.Html(
        string='Reply Content',
        required=True,
        sanitize_attributes=True,
        sanitize_style=True,
    )
    author_id = fields.Many2one(
        'res.users',
        string='Author',
        required=True,
        default=lambda self: self.env.user,
        index=True,
    )
    
    # Nested Replies (Threading)
    parent_id = fields.Many2one(
        'seitech.discussion.reply',
        string='Parent Reply',
        ondelete='cascade',
        index=True,
    )
    child_ids = fields.One2many(
        'seitech.discussion.reply',
        'parent_id',
        string='Child Replies',
    )
    thread_level = fields.Integer(
        string='Thread Level',
        compute='_compute_thread_level',
        store=True,
    )
    
    # Engagement
    upvote_ids = fields.Many2many(
        'res.users',
        'reply_upvote_rel',
        'reply_id',
        'user_id',
        string='Upvotes',
    )
    upvote_count = fields.Integer(
        string='Upvotes',
        compute='_compute_upvote_count',
        store=True,
    )
    
    # Status
    state = fields.Selection(
        [
            ('published', 'Published'),
            ('edited', 'Edited'),
            ('deleted', 'Deleted'),
            ('flagged', 'Flagged'),
        ],
        string='Status',
        default='published',
        required=True,
    )
    is_best_answer = fields.Boolean(
        string='Best Answer',
        compute='_compute_is_best_answer',
        store=True,
    )
    is_by_instructor = fields.Boolean(
        string='By Instructor',
        compute='_compute_is_by_instructor',
        store=True,
    )
    is_by_author = fields.Boolean(
        string='By Discussion Author',
        compute='_compute_is_by_author',
        store=True,
    )
    
    # Timestamps
    edited_date = fields.Datetime(
        string='Last Edited',
        readonly=True,
    )
    
    # Computed Fields
    author_name = fields.Char(
        related='author_id.name',
        string='Author Name',
        readonly=True,
    )
    author_avatar = fields.Image(
        related='author_id.image_128',
        readonly=True,
    )
    discussion_title = fields.Char(
        related='discussion_id.name',
        string='Discussion Title',
        readonly=True,
    )
    
    @api.depends('parent_id')
    def _compute_thread_level(self):
        for reply in self:
            level = 0
            current = reply.parent_id
            while current:
                level += 1
                current = current.parent_id
            reply.thread_level = level
    
    @api.depends('upvote_ids')
    def _compute_upvote_count(self):
        for reply in self:
            reply.upvote_count = len(reply.upvote_ids)
    
    @api.depends('discussion_id.best_answer_id')
    def _compute_is_best_answer(self):
        for reply in self:
            reply.is_best_answer = (reply.discussion_id.best_answer_id == reply)
    
    @api.depends('author_id')
    def _compute_is_by_instructor(self):
        instructor_group = self.env.ref('seitech_elearning.group_elearning_instructor')
        for reply in self:
            reply.is_by_instructor = instructor_group in reply.author_id.groups_id
    
    @api.depends('author_id', 'discussion_id.author_id')
    def _compute_is_by_author(self):
        for reply in self:
            reply.is_by_author = (reply.author_id == reply.discussion_id.author_id)
    
    @api.constrains('parent_id')
    def _check_parent_id(self):
        for reply in self:
            if reply.parent_id:
                if reply.parent_id.discussion_id != reply.discussion_id:
                    raise ValidationError(_('Parent reply must be from the same discussion.'))
                # Limit nesting level
                if reply.thread_level > 5:
                    raise ValidationError(_('Reply nesting cannot exceed 5 levels.'))
    
    @api.model_create_multi
    def create(self, vals_list):
        replies = super().create(vals_list)
        for reply in replies:
            # Update discussion last activity
            reply.discussion_id.last_activity_date = fields.Datetime.now()
            # Award points to reply author
            reply._award_author_points(2)
        return replies
    
    def write(self, vals):
        if 'content' in vals and not vals.get('edited_date'):
            vals['edited_date'] = fields.Datetime.now()
            vals['state'] = 'edited'
        return super().write(vals)
    
    def action_upvote(self):
        """Toggle upvote for current user"""
        self.ensure_one()
        user = self.env.user
        if user in self.upvote_ids:
            self.upvote_ids = [(3, user.id)]
        else:
            self.upvote_ids = [(4, user.id)]
            # Award points to author
            self._award_author_points(3)
        return {'upvoted': user in self.upvote_ids}
    
    def action_mark_best_answer(self):
        """Mark this reply as best answer"""
        self.ensure_one()
        return self.discussion_id.action_set_best_answer(self.id)
    
    def action_delete(self):
        """Soft delete reply"""
        self.ensure_one()
        if self.author_id != self.env.user:
            raise UserError(_('You can only delete your own replies.'))
        self.state = 'deleted'
    
    def action_flag(self):
        """Flag reply for moderation"""
        self.ensure_one()
        self.state = 'flagged'
        self._notify_moderators()
    
    def _award_author_points(self, points):
        """Award points to reply author"""
        if not self.author_id:
            return
        # Update user points
        pass
    
    def _notify_moderators(self):
        """Notify moderators of flagged content"""
        self.ensure_one()
        moderators = self.env.ref('seitech_elearning.group_elearning_instructor').users
        # Send notification
        pass
    
    @api.model
    def get_reply_tree(self, discussion_id):
        """Get nested reply structure for a discussion"""
        replies = self.search([
            ('discussion_id', '=', discussion_id),
            ('state', '!=', 'deleted'),
        ])
        
        # Build tree structure
        reply_map = {}
        root_replies = []
        
        for reply in replies:
            reply_map[reply.id] = {
                'id': reply.id,
                'content': reply.content,
                'author': reply.author_name,
                'author_avatar': reply.author_avatar,
                'upvote_count': reply.upvote_count,
                'is_best_answer': reply.is_best_answer,
                'is_by_instructor': reply.is_by_instructor,
                'create_date': reply.create_date,
                'children': [],
            }
        
        for reply in replies:
            reply_data = reply_map[reply.id]
            if reply.parent_id:
                parent_data = reply_map.get(reply.parent_id.id)
                if parent_data:
                    parent_data['children'].append(reply_data)
            else:
                root_replies.append(reply_data)
        
        return root_replies
