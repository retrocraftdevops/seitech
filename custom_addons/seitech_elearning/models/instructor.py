# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class Instructor(models.Model):
    """Instructor profiles for e-learning courses."""
    _name = 'seitech.instructor'
    _description = 'Course Instructor'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'name'

    name = fields.Char(string='Name', required=True, tracking=True)
    user_id = fields.Many2one(
        'res.users',
        string='User Account',
        ondelete='restrict',
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Contact',
        compute='_compute_partner_id',
        store=True,
    )

    # Profile
    image = fields.Binary(string='Photo', attachment=True)
    bio = fields.Html(string='Biography')
    short_bio = fields.Char(string='Short Bio', size=200)
    title = fields.Char(string='Professional Title')
    expertise = fields.Char(string='Areas of Expertise')
    qualifications = fields.Text(string='Qualifications')

    # Contact
    email = fields.Char(string='Email', tracking=True)
    phone = fields.Char(string='Phone')
    website = fields.Char(string='Website')

    # Social media
    linkedin_url = fields.Char(string='LinkedIn')
    twitter_url = fields.Char(string='Twitter/X')
    youtube_url = fields.Char(string='YouTube')
    github_url = fields.Char(string='GitHub')

    # Courses
    channel_ids = fields.Many2many(
        'slide.channel',
        'course_instructor_rel',
        'instructor_id',
        'channel_id',
        string='Courses',
    )
    primary_channel_ids = fields.One2many(
        'slide.channel',
        'primary_instructor_id',
        string='Primary Courses',
    )
    course_count = fields.Integer(
        string='Courses',
        compute='_compute_course_count',
        store=True,
    )

    # Students
    total_students = fields.Integer(
        string='Total Students',
        compute='_compute_student_stats',
    )
    total_enrollments = fields.Integer(
        string='Total Enrollments',
        compute='_compute_student_stats',
    )

    # Ratings
    average_rating = fields.Float(
        string='Average Rating',
        compute='_compute_rating',
        store=True,
        digits=(2, 1),
    )
    total_reviews = fields.Integer(
        string='Total Reviews',
        compute='_compute_rating',
        store=True,
    )

    # Revenue
    currency_id = fields.Many2one(
        'res.currency',
        string='Currency',
        default=lambda self: self.env.company.currency_id,
    )
    total_revenue = fields.Monetary(
        string='Total Revenue',
        compute='_compute_revenue',
        currency_field='currency_id',
    )
    commission_rate = fields.Float(
        string='Commission Rate (%)',
        default=70,
        help='Percentage of course revenue paid to instructor',
    )

    # Status
    state = fields.Selection([
        ('pending', 'Pending Approval'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('inactive', 'Inactive'),
    ], string='Status', default='pending', tracking=True)
    is_featured = fields.Boolean(string='Featured Instructor', default=False)

    # Documents
    contract_attachment_id = fields.Many2one(
        'ir.attachment',
        string='Contract',
    )
    tax_document_id = fields.Many2one(
        'ir.attachment',
        string='Tax Document',
    )

    # Scheduled classes
    schedule_ids = fields.One2many(
        'seitech.schedule',
        'instructor_id',
        string='Scheduled Classes',
    )

    @api.depends('user_id')
    def _compute_partner_id(self):
        for instructor in self:
            instructor.partner_id = instructor.user_id.partner_id if instructor.user_id else False

    @api.depends('channel_ids')
    def _compute_course_count(self):
        for instructor in self:
            instructor.course_count = len(instructor.channel_ids)

    def _compute_student_stats(self):
        for instructor in self:
            enrollments = self.env['seitech.enrollment'].search([
                ('channel_id', 'in', instructor.channel_ids.ids),
                ('state', 'in', ['active', 'completed']),
            ])
            instructor.total_enrollments = len(enrollments)
            instructor.total_students = len(enrollments.mapped('user_id'))

    @api.depends('channel_ids.rating_ids')
    def _compute_rating(self):
        for instructor in self:
            ratings = self.env['rating.rating'].search([
                ('res_model', '=', 'slide.channel'),
                ('res_id', 'in', instructor.channel_ids.ids),
                ('consumed', '=', True),
            ])
            instructor.total_reviews = len(ratings)
            if ratings:
                instructor.average_rating = sum(r.rating for r in ratings) / len(ratings)
            else:
                instructor.average_rating = 0

    def _compute_revenue(self):
        for instructor in self:
            # Calculate from enrollments with payments
            enrollments = self.env['seitech.enrollment'].search([
                ('channel_id', 'in', instructor.channel_ids.ids),
                ('state', 'in', ['active', 'completed']),
                ('enrollment_type', '=', 'paid'),
            ])
            instructor.total_revenue = sum(enrollments.mapped('amount_paid'))

    def action_approve(self):
        """Approve instructor."""
        self.write({'state': 'active'})

    def action_suspend(self):
        """Suspend instructor."""
        self.write({'state': 'suspended'})

    def action_reactivate(self):
        """Reactivate instructor."""
        self.write({'state': 'active'})

    def action_view_courses(self):
        """View instructor's courses."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Courses - {self.name}',
            'res_model': 'slide.channel',
            'view_mode': 'list,form',
            'domain': [('id', 'in', self.channel_ids.ids)],
        }

    def action_view_enrollments(self):
        """View enrollments for instructor's courses."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Enrollments - {self.name}',
            'res_model': 'seitech.enrollment',
            'view_mode': 'list,form',
            'domain': [('channel_id', 'in', self.channel_ids.ids)],
        }

    def action_view_schedules(self):
        """View scheduled classes."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Scheduled Classes - {self.name}',
            'res_model': 'seitech.schedule',
            'view_mode': 'list,calendar,form',
            'domain': [('instructor_id', '=', self.id)],
            'context': {'default_instructor_id': self.id},
        }

    @api.model
    def create_from_user(self, user):
        """Create instructor profile from user."""
        return self.create({
            'name': user.name,
            'user_id': user.id,
            'email': user.email,
            'state': 'pending',
        })
