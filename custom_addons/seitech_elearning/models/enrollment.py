# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
from datetime import timedelta


class Enrollment(models.Model):
    """Course enrollment management."""
    _name = 'seitech.enrollment'
    _description = 'Course Enrollment'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char(
        string='Reference',
        required=True,
        copy=False,
        readonly=True,
        default=lambda self: _('New'),
    )
    channel_id = fields.Many2one(
        'slide.channel',
        string='Course',
        required=True,
        ondelete='cascade',
        tracking=True,
    )
    user_id = fields.Many2one(
        'res.users',
        string='Student',
        required=True,
        ondelete='cascade',
        tracking=True,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Contact',
        related='user_id.partner_id',
        store=True,
    )

    # Enrollment details
    enrollment_date = fields.Datetime(
        string='Enrollment Date',
        default=fields.Datetime.now,
        required=True,
    )
    expiration_date = fields.Datetime(string='Expiration Date')
    state = fields.Selection([
        ('draft', 'Draft'),
        ('pending', 'Pending Payment'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
        ('suspended', 'Suspended'),
    ], string='Status', default='draft', required=True, tracking=True)

    # Enrollment type
    enrollment_type = fields.Selection([
        ('free', 'Free'),
        ('paid', 'Paid'),
        ('gift', 'Gift'),
        ('scholarship', 'Scholarship'),
        ('corporate', 'Corporate'),
        ('trial', 'Trial'),
    ], string='Enrollment Type', default='free', required=True)

    # Payment
    amount_paid = fields.Float(string='Amount Paid', digits='Product Price')
    currency_id = fields.Many2one(
        'res.currency',
        string='Currency',
        default=lambda self: self.env.company.currency_id,
    )
    payment_id = fields.Many2one('account.payment', string='Payment')
    sale_order_id = fields.Many2one('sale.order', string='Sale Order')
    invoice_id = fields.Many2one('account.move', string='Invoice')

    # Progress tracking
    completion_percentage = fields.Float(
        string='Completion %',
        compute='_compute_completion',
        store=True,
    )
    completed_slides = fields.Integer(
        string='Completed Lessons',
        compute='_compute_completion',
        store=True,
    )
    total_slides = fields.Integer(
        string='Total Lessons',
        compute='_compute_completion',
        store=True,
    )
    last_activity_date = fields.Datetime(string='Last Activity')
    time_spent = fields.Integer(string='Time Spent (minutes)', default=0)

    # Certificate
    certificate_id = fields.Many2one(
        'seitech.certificate',
        string='Certificate',
        readonly=True,
    )
    certificate_issued = fields.Boolean(
        string='Certificate Issued',
        compute='_compute_certificate_issued',
        store=True,
    )

    # Gift enrollment
    gifted_by_id = fields.Many2one('res.users', string='Gifted By')
    gift_message = fields.Text(string='Gift Message')

    # Corporate enrollment
    company_sponsor_id = fields.Many2one('res.partner', string='Sponsor Company')

    # Notes
    notes = fields.Text(string='Internal Notes')

    _sql_constraints = [
        ('unique_enrollment', 'UNIQUE(channel_id, user_id)',
         'A student can only enroll once in a course.'),
    ]

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('seitech.enrollment') or _('New')
        return super().create(vals_list)

    @api.depends('channel_id.slide_ids', 'user_id')
    def _compute_completion(self):
        SlidePartner = self.env['slide.slide.partner']
        for enrollment in self:
            slides = enrollment.channel_id.slide_ids
            enrollment.total_slides = len(slides)
            if enrollment.user_id and slides:
                completed = SlidePartner.search_count([
                    ('slide_id', 'in', slides.ids),
                    ('partner_id', '=', enrollment.partner_id.id),
                    ('completed', '=', True),
                ])
                enrollment.completed_slides = completed
                enrollment.completion_percentage = (completed / len(slides)) * 100 if slides else 0
            else:
                enrollment.completed_slides = 0
                enrollment.completion_percentage = 0

    @api.depends('certificate_id')
    def _compute_certificate_issued(self):
        for enrollment in self:
            enrollment.certificate_issued = bool(enrollment.certificate_id)

    def action_activate(self):
        """Activate enrollment."""
        for enrollment in self:
            if enrollment.state in ('draft', 'pending'):
                enrollment.state = 'active'
                # Add user to channel members
                enrollment.channel_id._action_add_members(enrollment.partner_id)
                # Send welcome email
                enrollment._send_enrollment_email('welcome')
        return True

    def action_complete(self):
        """Mark enrollment as completed."""
        for enrollment in self:
            if enrollment.state == 'active':
                enrollment.state = 'completed'
                # Award points for course completion
                enrollment._award_completion_points()
                # Check and award badges
                enrollment._check_badges()
                # Issue certificate if eligible
                enrollment._check_issue_certificate()
        return True

    def _award_completion_points(self):
        """Award gamification points for course completion."""
        self.ensure_one()
        PointsModel = self.env['seitech.student.points']
        # Check if already awarded for this course
        existing = PointsModel.search([
            ('user_id', '=', self.user_id.id),
            ('channel_id', '=', self.channel_id.id),
            ('activity_type', '=', 'course_complete'),
        ], limit=1)
        if not existing:
            PointsModel.award_points(
                user_id=self.user_id.id,
                points=100,  # Base points for course completion
                activity_type='course_complete',
                description=f'Completed course: {self.channel_id.name}',
                channel_id=self.channel_id.id,
                enrollment_id=self.id,
            )

    def _check_badges(self):
        """Check and award any earned badges after course completion."""
        self.ensure_one()
        Badge = self.env['seitech.badge']
        
        # Check badges for courses_completed criteria
        Badge.check_and_award_badges(
            user_id=self.user_id.id,
            trigger_type='courses_completed',
            channel_id=self.channel_id.id,
        )
        
        # Check badges for specific_course criteria
        Badge.check_and_award_badges(
            user_id=self.user_id.id,
            trigger_type='specific_course',
            channel_id=self.channel_id.id,
        )
        
        # Check point-based badges (since completion awards points)
        Badge.check_and_award_badges(
            user_id=self.user_id.id,
            trigger_type='points_earned',
        )

    def action_cancel(self):
        """Cancel enrollment."""
        for enrollment in self:
            if enrollment.state not in ('completed', 'cancelled'):
                enrollment.state = 'cancelled'
        return True

    def action_suspend(self):
        """Suspend enrollment."""
        for enrollment in self:
            if enrollment.state == 'active':
                enrollment.state = 'suspended'
        return True

    def action_reactivate(self):
        """Reactivate suspended enrollment."""
        for enrollment in self:
            if enrollment.state == 'suspended':
                enrollment.state = 'active'
        return True

    def _check_issue_certificate(self):
        """Check if certificate should be issued and create it."""
        self.ensure_one()
        channel = self.channel_id
        if not channel.enable_certificate:
            return False
        if self.certificate_id:
            return False
        if self.completion_percentage < channel.min_completion_for_certificate:
            return False

        # Create certificate
        certificate = self.env['seitech.certificate'].create({
            'enrollment_id': self.id,
            'channel_id': channel.id,
            'user_id': self.user_id.id,
            'template_id': channel.certificate_template_id.id,
        })
        self.certificate_id = certificate.id
        return certificate

    def _send_enrollment_email(self, template_type):
        """Send enrollment-related email."""
        template_map = {
            'welcome': 'seitech_elearning.enrollment_welcome_email',
            'completed': 'seitech_elearning.enrollment_completed_email',
            'expiring': 'seitech_elearning.enrollment_expiring_email',
        }
        template_xmlid = template_map.get(template_type)
        if template_xmlid:
            template = self.env.ref(template_xmlid, raise_if_not_found=False)
            if template:
                template.send_mail(self.id, force_send=True)

    @api.model
    def _cron_check_expirations(self):
        """Cron job to check and handle expired enrollments."""
        now = fields.Datetime.now()
        # Mark expired enrollments
        expired = self.search([
            ('state', '=', 'active'),
            ('expiration_date', '!=', False),
            ('expiration_date', '<', now),
        ])
        expired.write({'state': 'expired'})

        # Send expiration warnings (7 days before)
        warning_date = now + timedelta(days=7)
        expiring = self.search([
            ('state', '=', 'active'),
            ('expiration_date', '!=', False),
            ('expiration_date', '>=', now),
            ('expiration_date', '<=', warning_date),
        ])
        for enrollment in expiring:
            enrollment._send_enrollment_email('expiring')

    def action_view_certificate(self):
        """View the certificate for this enrollment."""
        self.ensure_one()
        if not self.certificate_id:
            raise UserError(_('No certificate has been issued for this enrollment.'))
        return {
            'type': 'ir.actions.act_window',
            'name': 'Certificate',
            'res_model': 'seitech.certificate',
            'res_id': self.certificate_id.id,
            'view_mode': 'form',
        }
