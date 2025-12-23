# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError


class CertificateGenerationWizard(models.TransientModel):
    """Wizard for generating certificates for completed enrollments."""
    _name = 'seitech.certificate.generation.wizard'
    _description = 'Certificate Generation Wizard'

    channel_id = fields.Many2one(
        'slide.channel',
        string='Course',
        required=True,
        domain=[('enable_certificate', '=', True)],
    )
    template_id = fields.Many2one(
        'seitech.certificate.template',
        string='Certificate Template',
        domain=[('is_active', '=', True)],
    )
    min_completion = fields.Float(
        string='Minimum Completion %',
        default=80.0,
    )
    enrollment_ids = fields.Many2many(
        'seitech.enrollment',
        string='Eligible Enrollments',
        compute='_compute_eligible_enrollments',
    )
    enrollment_count = fields.Integer(
        string='Eligible Count',
        compute='_compute_eligible_enrollments',
    )
    issue_date = fields.Datetime(
        string='Issue Date',
        default=fields.Datetime.now,
    )
    instructor_id = fields.Many2one(
        'seitech.instructor',
        string='Issuing Instructor',
    )
    send_notification = fields.Boolean(
        string='Send Notification Email',
        default=True,
    )

    @api.depends('channel_id', 'min_completion')
    def _compute_eligible_enrollments(self):
        for wizard in self:
            if wizard.channel_id:
                enrollments = self.env['seitech.enrollment'].search([
                    ('channel_id', '=', wizard.channel_id.id),
                    ('state', 'in', ['active', 'completed']),
                    ('completion_percentage', '>=', wizard.min_completion),
                    ('certificate_id', '=', False),
                ])
                wizard.enrollment_ids = enrollments
                wizard.enrollment_count = len(enrollments)
            else:
                wizard.enrollment_ids = False
                wizard.enrollment_count = 0

    @api.onchange('channel_id')
    def _onchange_channel_id(self):
        if self.channel_id:
            self.template_id = self.channel_id.certificate_template_id
            self.min_completion = self.channel_id.min_completion_for_certificate
            if self.channel_id.primary_instructor_id:
                self.instructor_id = self.channel_id.primary_instructor_id

    def action_generate(self):
        """Generate certificates for eligible enrollments."""
        self.ensure_one()
        Certificate = self.env['seitech.certificate']

        if not self.enrollment_ids:
            raise UserError(_('No eligible enrollments found.'))

        created = 0
        errors = []

        for enrollment in self.enrollment_ids:
            try:
                certificate = Certificate.create({
                    'enrollment_id': enrollment.id,
                    'channel_id': self.channel_id.id,
                    'user_id': enrollment.user_id.id,
                    'template_id': self.template_id.id if self.template_id else False,
                    'issue_date': self.issue_date,
                    'instructor_id': self.instructor_id.id if self.instructor_id else False,
                    'completion_date': fields.Datetime.now(),
                    'completion_percentage': enrollment.completion_percentage,
                    'time_spent': enrollment.time_spent // 60,
                })

                # Issue the certificate
                certificate.action_issue()

                # Link to enrollment
                enrollment.certificate_id = certificate.id

                if self.send_notification:
                    certificate._send_certificate_email()

                created += 1

            except Exception as e:
                errors.append(f'{enrollment.user_id.name}: {str(e)}')

        # Show result
        message = f'Generated {created} certificates successfully.'
        if errors:
            message += f' {len(errors)} errors occurred.'

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Certificate Generation Complete',
                'message': message,
                'type': 'success' if not errors else 'warning',
                'sticky': False,
            }
        }
