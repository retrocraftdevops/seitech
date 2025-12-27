# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import AccessError, ValidationError


class ChatChannel(models.Model):
    """Multi-level chat channels for different user types"""
    _name = 'seitech.chat.channel'
    _description = 'Chat Channel'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'last_message_date desc, create_date desc'

    name = fields.Char(
        string='Channel Name',
        required=True,
        tracking=True,
    )
    channel_type = fields.Selection([
        ('public_support', 'Public Support'),  # Public users chat with agents
        ('student_instructor', 'Student-Instructor'),  # Student with specific instructor
        ('student_support', 'Student Support'),  # Student with support agents
        ('instructor_admin', 'Instructor-Admin'),  # Instructor with admin
        ('group', 'Study Group'),  # Group chat for study groups
        ('course', 'Course Discussion'),  # Course-wide discussion
        ('direct', 'Direct Message'),  # One-on-one chat
    ], string='Channel Type', required=True, default='direct', index=True)
    
    # Participants
    member_ids = fields.Many2many(
        'res.users',
        'chat_channel_member_rel',
        'channel_id',
        'user_id',
        string='Members',
    )
    moderator_ids = fields.Many2many(
        'res.users',
        'chat_channel_moderator_rel',
        'channel_id',
        'user_id',
        string='Moderators',
    )
    
    # Related Records
    course_id = fields.Many2one(
        'slide.channel',
        string='Related Course',
        ondelete='cascade',
    )
    study_group_id = fields.Many2one(
        'seitech.study.group',
        string='Related Study Group',
        ondelete='cascade',
    )
    enrollment_id = fields.Many2one(
        'seitech.enrollment',
        string='Related Enrollment',
        ondelete='cascade',
    )
    
    # Messages
    message_ids = fields.One2many(
        'seitech.chat.message',
        'channel_id',
        string='Messages',
    )
    message_count = fields.Integer(
        string='Message Count',
        compute='_compute_message_count',
        store=True,
    )
    unread_count = fields.Integer(
        string='Unread Messages',
        compute='_compute_unread_count',
    )
    last_message_date = fields.Datetime(
        string='Last Message',
        compute='_compute_last_message',
        store=True,
    )
    last_message_preview = fields.Char(
        string='Last Message Preview',
        compute='_compute_last_message',
        store=True,
    )
    
    # Status
    state = fields.Selection([
        ('active', 'Active'),
        ('archived', 'Archived'),
        ('closed', 'Closed'),
    ], string='Status', default='active', required=True, tracking=True)
    
    is_public = fields.Boolean(
        string='Public Channel',
        default=False,
        help='Public channels are visible to all users',
    )
    
    # Session Info (for support channels)
    session_token = fields.Char(
        string='Session Token',
        help='Anonymous session identifier for public users',
    )
    visitor_info = fields.Json(
        string='Visitor Info',
        help='Anonymous visitor information (IP, browser, etc)',
    )
    
    # Timestamps
    created_by = fields.Many2one(
        'res.users',
        string='Created By',
        default=lambda self: self.env.user,
        readonly=True,
    )
    
    @api.depends('message_ids')
    def _compute_message_count(self):
        for channel in self:
            channel.message_count = len(channel.message_ids)
    
    def _compute_unread_count(self):
        """Compute unread messages for current user"""
        for channel in self:
            if self.env.user:
                channel.unread_count = self.env['seitech.chat.message'].search_count([
                    ('channel_id', '=', channel.id),
                    ('author_id', '!=', self.env.user.id),
                    ('read_by_ids', 'not in', self.env.user.id),
                ])
            else:
                channel.unread_count = 0
    
    @api.depends('message_ids', 'message_ids.create_date', 'message_ids.content')
    def _compute_last_message(self):
        for channel in self:
            last_msg = channel.message_ids.sorted('create_date', reverse=True)[:1]
            if last_msg:
                channel.last_message_date = last_msg.create_date
                # Strip HTML tags for preview
                content = last_msg.content or ''
                preview = content[:100] + '...' if len(content) > 100 else content
                channel.last_message_preview = preview
            else:
                channel.last_message_date = False
                channel.last_message_preview = False
    
    @api.model
    def create_support_channel(self, session_token=None, visitor_info=None):
        """Create a public support channel for anonymous users"""
        # Find available support agents
        agent_group = self.env.ref('seitech_elearning.group_elearning_support_agent', raise_if_not_found=False)
        agents = agent_group.users if agent_group else self.env['res.users']
        
        channel = self.create({
            'name': _('Support Chat #%s') % self.env['ir.sequence'].next_by_code('seitech.chat.channel') or 'NEW',
            'channel_type': 'public_support',
            'is_public': True,
            'session_token': session_token,
            'visitor_info': visitor_info,
            'member_ids': [(6, 0, agents.ids)],
            'moderator_ids': [(6, 0, agents.ids)],
        })
        
        return channel
    
    @api.model
    def create_student_instructor_channel(self, student_id, instructor_id, course_id=None):
        """Create direct channel between student and instructor"""
        # Check if channel already exists
        existing = self.search([
            ('channel_type', '=', 'student_instructor'),
            ('member_ids', 'in', [student_id, instructor_id]),
            ('course_id', '=', course_id),
        ], limit=1)
        
        if existing:
            return existing
        
        student = self.env['res.users'].browse(student_id)
        instructor = self.env['res.users'].browse(instructor_id)
        course = self.env['slide.channel'].browse(course_id) if course_id else None
        
        name_parts = [student.name, instructor.name]
        if course:
            name_parts.append(course.name)
        
        channel = self.create({
            'name': ' - '.join(name_parts),
            'channel_type': 'student_instructor',
            'member_ids': [(6, 0, [student_id, instructor_id])],
            'moderator_ids': [(6, 0, [instructor_id])],
            'course_id': course_id,
        })
        
        return channel
    
    @api.model
    def get_or_create_direct_channel(self, user_ids):
        """Get or create direct message channel between users"""
        if len(user_ids) != 2:
            raise ValidationError(_('Direct channels must have exactly 2 members'))
        
        # Check if channel exists
        existing = self.search([
            ('channel_type', '=', 'direct'),
            ('member_ids', 'in', user_ids[0]),
            ('member_ids', 'in', user_ids[1]),
        ], limit=1)
        
        if existing:
            return existing
        
        users = self.env['res.users'].browse(user_ids)
        channel = self.create({
            'name': ' & '.join(users.mapped('name')),
            'channel_type': 'direct',
            'member_ids': [(6, 0, user_ids)],
        })
        
        return channel
    
    def action_send_message(self, content, attachment_ids=None):
        """Send message to this channel"""
        self.ensure_one()
        
        # Check if user can send messages
        if not self._can_send_message():
            raise AccessError(_('You cannot send messages to this channel'))
        
        message = self.env['seitech.chat.message'].create({
            'channel_id': self.id,
            'author_id': self.env.user.id if self.env.user else False,
            'content': content,
            'attachment_ids': [(6, 0, attachment_ids or [])],
        })
        
        # Notify channel members
        self._notify_new_message(message)
        
        return message
    
    def action_mark_read(self):
        """Mark all messages as read for current user"""
        self.ensure_one()
        if self.env.user:
            unread_messages = self.message_ids.filtered(
                lambda m: self.env.user not in m.read_by_ids
            )
            for msg in unread_messages:
                msg.read_by_ids = [(4, self.env.user.id)]
    
    def action_archive(self):
        """Archive channel"""
        self.write({'state': 'archived'})
    
    def action_close(self):
        """Close channel (for support tickets)"""
        self.write({'state': 'closed'})
    
    def _can_send_message(self):
        """Check if current user can send messages"""
        self.ensure_one()
        
        # Public support channels allow anonymous users
        if self.channel_type == 'public_support':
            return True
        
        # Other channels require membership
        if self.env.user in self.member_ids:
            return True
        
        # Admins can always send
        if self.env.user.has_group('seitech_elearning.group_elearning_manager'):
            return True
        
        return False
    
    def _notify_new_message(self, message):
        """Send real-time notification to channel members"""
        self.ensure_one()
        
        # Send bus notification for real-time updates
        notifications = []
        for member in self.member_ids:
            if member != message.author_id:
                notifications.append((
                    member.partner_id,
                    'seitech.chat/new_message',
                    {
                        'channel_id': self.id,
                        'message': message.read()[0],
                    }
                ))
        
        if notifications:
            self.env['bus.bus']._sendmany(notifications)
    
    @api.model
    def get_user_channels(self, channel_types=None):
        """Get all channels for current user"""
        domain = [
            ('member_ids', 'in', self.env.user.id),
            ('state', '=', 'active'),
        ]
        
        if channel_types:
            domain.append(('channel_type', 'in', channel_types))
        
        return self.search(domain)


class ChatMessage(models.Model):
    """Chat messages"""
    _name = 'seitech.chat.message'
    _description = 'Chat Message'
    _order = 'create_date asc'
    
    channel_id = fields.Many2one(
        'seitech.chat.channel',
        string='Channel',
        required=True,
        ondelete='cascade',
        index=True,
    )
    author_id = fields.Many2one(
        'res.users',
        string='Author',
        ondelete='set null',
    )
    author_name = fields.Char(
        string='Author Name',
        help='Name for anonymous users',
    )
    
    content = fields.Text(
        string='Message',
        required=True,
    )
    message_type = fields.Selection([
        ('text', 'Text'),
        ('file', 'File'),
        ('image', 'Image'),
        ('system', 'System Message'),
    ], string='Type', default='text', required=True)
    
    # Attachments
    attachment_ids = fields.Many2many(
        'ir.attachment',
        'chat_message_attachment_rel',
        'message_id',
        'attachment_id',
        string='Attachments',
    )
    
    # Read Tracking
    read_by_ids = fields.Many2many(
        'res.users',
        'chat_message_read_rel',
        'message_id',
        'user_id',
        string='Read By',
    )
    is_read = fields.Boolean(
        string='Is Read',
        compute='_compute_is_read',
    )
    
    # Reply/Thread
    parent_id = fields.Many2one(
        'seitech.chat.message',
        string='Reply To',
        ondelete='set null',
    )
    reply_count = fields.Integer(
        string='Replies',
        compute='_compute_reply_count',
    )
    
    # Reactions
    reaction_ids = fields.One2many(
        'seitech.chat.reaction',
        'message_id',
        string='Reactions',
    )
    
    create_date = fields.Datetime(
        string='Sent At',
        readonly=True,
    )
    
    @api.depends('read_by_ids')
    def _compute_is_read(self):
        for message in self:
            message.is_read = self.env.user in message.read_by_ids
    
    def _compute_reply_count(self):
        for message in self:
            message.reply_count = self.env['seitech.chat.message'].search_count([
                ('parent_id', '=', message.id)
            ])
    
    @api.model
    def create(self, vals):
        """Override to set author name for anonymous users"""
        if not vals.get('author_id') and not vals.get('author_name'):
            vals['author_name'] = _('Guest')
        
        message = super().create(vals)
        
        # Auto-mark as read by author
        if message.author_id:
            message.read_by_ids = [(4, message.author_id.id)]
        
        return message
    
    def action_toggle_reaction(self, emoji):
        """Add or remove reaction"""
        self.ensure_one()
        
        existing = self.env['seitech.chat.reaction'].search([
            ('message_id', '=', self.id),
            ('user_id', '=', self.env.user.id),
            ('emoji', '=', emoji),
        ], limit=1)
        
        if existing:
            existing.unlink()
        else:
            self.env['seitech.chat.reaction'].create({
                'message_id': self.id,
                'user_id': self.env.user.id,
                'emoji': emoji,
            })


class ChatReaction(models.Model):
    """Message reactions/emojis"""
    _name = 'seitech.chat.reaction'
    _description = 'Chat Reaction'
    
    message_id = fields.Many2one(
        'seitech.chat.message',
        string='Message',
        required=True,
        ondelete='cascade',
    )
    user_id = fields.Many2one(
        'res.users',
        string='User',
        required=True,
        ondelete='cascade',
    )
    emoji = fields.Char(
        string='Emoji',
        required=True,
    )
    
    _sql_constraints = [
        ('unique_reaction', 'unique(message_id, user_id, emoji)',
         'You can only react once with the same emoji!')
    ]
