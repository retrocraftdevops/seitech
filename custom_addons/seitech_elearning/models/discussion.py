# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError


class Discussion(models.Model):
    _name = 'seitech.discussion'
    _description = 'Learning Discussion Thread'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'is_pinned desc, upvote_count desc, create_date desc'

    name = fields.Char(
        string='Title',
        required=True,
        tracking=True,
        index=True,
    )
    content = fields.Html(
        string='Content',
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
    category = fields.Selection(
        [
            ('question', 'Question'),
            ('discussion', 'Discussion'),
            ('announcement', 'Announcement'),
            ('resource', 'Resource Sharing'),
            ('feedback', 'Feedback'),
        ],
        string='Category',
        required=True,
        default='question',
        tracking=True,
    )
    
    # Related Course/Content
    course_id = fields.Many2one(
        'slide.channel',
        string='Related Course',
        ondelete='cascade',
        index=True,
    )
    slide_id = fields.Many2one(
        'slide.slide',
        string='Related Lesson',
        ondelete='cascade',
        index=True,
    )
    study_group_id = fields.Many2one(
        'seitech.study.group',
        string='Study Group',
        ondelete='cascade',
        index=True,
    )
    
    # Tags and Topics
    tag_ids = fields.Many2many(
        'seitech.discussion.tag',
        string='Tags',
    )
    skill_ids = fields.Many2many(
        'seitech.skill',
        string='Related Skills',
    )
    
    # Replies
    reply_ids = fields.One2many(
        'seitech.discussion.reply',
        'discussion_id',
        string='Replies',
    )
    reply_count = fields.Integer(
        string='Reply Count',
        compute='_compute_reply_count',
        store=True,
    )
    
    # Engagement Metrics
    upvote_ids = fields.Many2many(
        'res.users',
        'discussion_upvote_rel',
        'discussion_id',
        'user_id',
        string='Upvotes',
    )
    upvote_count = fields.Integer(
        string='Upvotes',
        compute='_compute_upvote_count',
        store=True,
    )
    view_count = fields.Integer(
        string='Views',
        default=0,
        readonly=True,
    )
    
    # Status and Moderation
    state = fields.Selection(
        [
            ('draft', 'Draft'),
            ('published', 'Published'),
            ('resolved', 'Resolved'),
            ('closed', 'Closed'),
            ('flagged', 'Flagged'),
        ],
        string='Status',
        default='draft',
        required=True,
        tracking=True,
    )
    is_pinned = fields.Boolean(
        string='Pinned',
        default=False,
        tracking=True,
    )
    is_locked = fields.Boolean(
        string='Locked',
        default=False,
        help='Prevent new replies',
    )
    is_featured = fields.Boolean(
        string='Featured',
        default=False,
    )
    
    # Best Answer
    best_answer_id = fields.Many2one(
        'seitech.discussion.reply',
        string='Best Answer',
        domain="[('discussion_id', '=', id)]",
    )
    has_best_answer = fields.Boolean(
        string='Has Best Answer',
        compute='_compute_has_best_answer',
        store=True,
    )
    
    # Timestamps
    published_date = fields.Datetime(
        string='Published Date',
        readonly=True,
    )
    last_activity_date = fields.Datetime(
        string='Last Activity',
        default=fields.Datetime.now,
        readonly=True,
    )
    resolved_date = fields.Datetime(
        string='Resolved Date',
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
    
    @api.depends('reply_ids')
    def _compute_reply_count(self):
        for discussion in self:
            discussion.reply_count = len(discussion.reply_ids)
    
    @api.depends('upvote_ids')
    def _compute_upvote_count(self):
        for discussion in self:
            discussion.upvote_count = len(discussion.upvote_ids)
    
    @api.depends('best_answer_id')
    def _compute_has_best_answer(self):
        for discussion in self:
            discussion.has_best_answer = bool(discussion.best_answer_id)
    
    @api.constrains('best_answer_id')
    def _check_best_answer(self):
        for discussion in self:
            if discussion.best_answer_id and discussion.best_answer_id.discussion_id != discussion:
                raise ValidationError(_('Best answer must belong to this discussion.'))
    
    def action_publish(self):
        """Publish the discussion"""
        self.ensure_one()
        if self.state == 'draft':
            self.write({
                'state': 'published',
                'published_date': fields.Datetime.now(),
            })
            self._notify_followers()
    
    def action_resolve(self):
        """Mark discussion as resolved"""
        self.ensure_one()
        if self.state in ['published', 'draft']:
            self.write({
                'state': 'resolved',
                'resolved_date': fields.Datetime.now(),
            })
    
    def action_close(self):
        """Close the discussion"""
        self.ensure_one()
        self.write({
            'state': 'closed',
            'is_locked': True,
        })
    
    def action_reopen(self):
        """Reopen closed discussion"""
        self.ensure_one()
        if self.state == 'closed':
            self.write({
                'state': 'published',
                'is_locked': False,
            })
    
    def action_flag(self):
        """Flag discussion for moderation"""
        self.ensure_one()
        self.write({'state': 'flagged'})
        # Notify moderators
        self._notify_moderators()
    
    def action_toggle_pin(self):
        """Toggle pin status"""
        self.ensure_one()
        self.is_pinned = not self.is_pinned
    
    def action_toggle_lock(self):
        """Toggle lock status"""
        self.ensure_one()
        self.is_locked = not self.is_locked
    
    def action_upvote(self):
        """Toggle upvote for current user"""
        self.ensure_one()
        user = self.env.user
        if user in self.upvote_ids:
            self.upvote_ids = [(3, user.id)]
        else:
            self.upvote_ids = [(4, user.id)]
            # Award points to author
            self._award_author_points(5)
        return {'upvoted': user in self.upvote_ids}
    
    def action_increment_view(self):
        """Increment view count"""
        self.ensure_one()
        self.view_count += 1
    
    def action_set_best_answer(self, reply_id):
        """Set best answer for this discussion"""
        self.ensure_one()
        reply = self.env['seitech.discussion.reply'].browse(reply_id)
        if reply.discussion_id != self:
            raise ValidationError(_('Reply does not belong to this discussion.'))
        
        # Only author can set best answer
        if self.author_id != self.env.user:
            raise UserError(_('Only the discussion author can mark the best answer.'))
        
        self.best_answer_id = reply
        if self.state == 'published':
            self.action_resolve()
        
        # Award points to reply author
        reply._award_author_points(20)
        return True
    
    def _award_author_points(self, points):
        """Award points to discussion author"""
        if not self.author_id:
            return
        
        # Update user points (integrate with gamification)
        # This could be extended to update leaderboard
        pass
    
    def _notify_followers(self):
        """Notify followers when discussion is published"""
        self.ensure_one()
        if self.course_id:
            # Notify course followers
            pass
        if self.study_group_id:
            # Notify group members
            pass
    
    def _notify_moderators(self):
        """Notify moderators of flagged content"""
        self.ensure_one()
        moderators = self.env.ref('seitech_elearning.group_elearning_instructor').users
        # Send notification to moderators
        pass
    
    @api.model
    def get_trending_discussions(self, limit=10, days=7):
        """Get trending discussions based on activity"""
        date_from = fields.Datetime.now() - fields.timedelta(days=days)
        discussions = self.search([
            ('state', '=', 'published'),
            ('last_activity_date', '>=', date_from),
        ], order='upvote_count desc, reply_count desc, view_count desc', limit=limit)
        return discussions
    
    @api.model
    def get_unanswered_questions(self, limit=10):
        """Get questions without replies"""
        return self.search([
            ('category', '=', 'question'),
            ('state', '=', 'published'),
            ('reply_count', '=', 0),
        ], order='create_date desc', limit=limit)


class DiscussionTag(models.Model):
    _name = 'seitech.discussion.tag'
    _description = 'Discussion Tag'
    _order = 'name'

    name = fields.Char(
        string='Tag Name',
        required=True,
        index=True,
    )
    color = fields.Integer(
        string='Color',
        default=0,
    )
    discussion_count = fields.Integer(
        string='Discussion Count',
        compute='_compute_discussion_count',
    )
    
    @api.depends('name')
    def _compute_discussion_count(self):
        for tag in self:
            tag.discussion_count = self.env['seitech.discussion'].search_count([
                ('tag_ids', 'in', tag.id)
            ])
    
    _sql_constraints = [
        ('name_unique', 'unique(name)', 'Tag name must be unique!')
    ]
