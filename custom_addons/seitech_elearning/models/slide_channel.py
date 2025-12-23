# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError


class SlideChannel(models.Model):
    """Extends slide.channel with e-learning features."""
    _inherit = 'slide.channel'

    # Pricing
    is_paid = fields.Boolean(string='Paid Course', default=False)
    list_price = fields.Float(string='Price', digits='Product Price', default=0.0)
    currency_id = fields.Many2one(
        'res.currency',
        string='Currency',
        default=lambda self: self.env.company.currency_id,
    )
    sale_price = fields.Float(string='Sale Price', digits='Product Price')
    is_on_sale = fields.Boolean(string='On Sale', default=False)
    product_id = fields.Many2one(
        'product.product',
        string='Product',
        help='Product linked for e-commerce integration',
    )

    # Category
    seitech_category_id = fields.Many2one(
        'seitech.course.category',
        string='Course Category',
        index=True,
    )

    # Course details
    difficulty_level = fields.Selection([
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ], string='Difficulty Level', default='beginner')
    language = fields.Selection([
        ('en', 'English'),
        ('fr', 'French'),
        ('pt', 'Portuguese'),
        ('zu', 'Zulu'),
        ('af', 'Afrikaans'),
    ], string='Language', default='en')
    prerequisites = fields.Text(string='Prerequisites')
    learning_outcomes = fields.Text(string='What You Will Learn')
    target_audience = fields.Text(string='Target Audience')

    # Instructors
    instructor_ids = fields.Many2many(
        'seitech.instructor',
        'course_instructor_rel',
        'channel_id',
        'instructor_id',
        string='Instructors',
    )
    primary_instructor_id = fields.Many2one(
        'seitech.instructor',
        string='Primary Instructor',
    )

    # Scheduling
    start_date = fields.Date(string='Start Date')
    end_date = fields.Date(string='End Date')
    enrollment_deadline = fields.Date(string='Enrollment Deadline')
    max_enrollments = fields.Integer(string='Maximum Enrollments', default=0)

    # Enrollment tracking
    enrollment_ids = fields.One2many(
        'seitech.enrollment',
        'channel_id',
        string='Enrollments',
    )
    enrollment_count = fields.Integer(
        string='Enrollments',
        compute='_compute_enrollment_count',
        store=True,
    )
    active_enrollment_count = fields.Integer(
        string='Active Enrollments',
        compute='_compute_enrollment_count',
        store=True,
    )

    # Certificates
    certificate_template_id = fields.Many2one(
        'seitech.certificate.template',
        string='Certificate Template',
    )
    enable_certificate = fields.Boolean(string='Enable Certificate', default=True)
    min_completion_for_certificate = fields.Float(
        string='Min. Completion for Certificate (%)',
        default=80.0,
    )

    # Discussion
    enable_discussions = fields.Boolean(string='Enable Discussions', default=True)
    # forum_id = fields.Many2one('forum.forum', string='Discussion Forum')  # Disabled - forum module not installed

    # Gamification
    points_for_completion = fields.Integer(string='Points for Completion', default=100)
    badge_id = fields.Many2one('gamification.badge', string='Completion Badge')

    # Media
    intro_video_url = fields.Char(string='Intro Video URL')
    banner_image = fields.Binary(string='Banner Image', attachment=True)

    # SEO
    meta_title = fields.Char(string='Meta Title')
    meta_description = fields.Text(string='Meta Description')
    meta_keywords = fields.Char(string='Meta Keywords')

    # Computed fields
    display_price = fields.Char(
        string='Display Price',
        compute='_compute_display_price',
    )
    is_enrollment_open = fields.Boolean(
        string='Enrollment Open',
        compute='_compute_is_enrollment_open',
    )

    @api.depends('enrollment_ids', 'enrollment_ids.state')
    def _compute_enrollment_count(self):
        for channel in self:
            enrollments = channel.enrollment_ids
            channel.enrollment_count = len(enrollments)
            channel.active_enrollment_count = len(
                enrollments.filtered(lambda e: e.state == 'active')
            )

    @api.depends('is_paid', 'list_price', 'is_on_sale', 'sale_price', 'currency_id')
    def _compute_display_price(self):
        for channel in self:
            if not channel.is_paid:
                channel.display_price = 'Free'
            elif channel.is_on_sale and channel.sale_price:
                channel.display_price = f'{channel.currency_id.symbol}{channel.sale_price:.2f}'
            else:
                channel.display_price = f'{channel.currency_id.symbol}{channel.list_price:.2f}'

    @api.depends('enrollment_deadline', 'max_enrollments', 'active_enrollment_count')
    def _compute_is_enrollment_open(self):
        today = fields.Date.today()
        for channel in self:
            deadline_ok = not channel.enrollment_deadline or channel.enrollment_deadline >= today
            capacity_ok = not channel.max_enrollments or channel.active_enrollment_count < channel.max_enrollments
            channel.is_enrollment_open = deadline_ok and capacity_ok

    @api.constrains('min_completion_for_certificate')
    def _check_min_completion(self):
        for channel in self:
            if channel.min_completion_for_certificate < 0 or channel.min_completion_for_certificate > 100:
                raise ValidationError('Minimum completion percentage must be between 0 and 100.')

    @api.constrains('start_date', 'end_date')
    def _check_dates(self):
        for channel in self:
            if channel.start_date and channel.end_date:
                if channel.start_date > channel.end_date:
                    raise ValidationError('End date must be after start date.')

    def action_create_product(self):
        """Create a linked product for e-commerce."""
        self.ensure_one()
        if self.product_id:
            return

        product = self.env['product.product'].create({
            'name': self.name,
            'type': 'service',
            'list_price': self.list_price,
            'sale_ok': True,
            'purchase_ok': False,
            'description_sale': self.description_short,
            'image_1920': self.image_1920,
        })
        self.product_id = product.id
        return product

    def action_view_enrollments(self):
        """View all enrollments for this course."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Enrollments - {self.name}',
            'res_model': 'seitech.enrollment',
            'view_mode': 'list,form',
            'domain': [('channel_id', '=', self.id)],
            'context': {'default_channel_id': self.id},
        }

    def action_view_certificates(self):
        """View all certificates issued for this course."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Certificates - {self.name}',
            'res_model': 'seitech.certificate',
            'view_mode': 'list,form',
            'domain': [('channel_id', '=', self.id)],
        }
