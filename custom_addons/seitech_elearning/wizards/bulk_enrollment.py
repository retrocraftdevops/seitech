# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError


class BulkEnrollmentWizard(models.TransientModel):
    """Wizard for bulk enrollment of users to courses."""
    _name = 'seitech.bulk.enrollment.wizard'
    _description = 'Bulk Enrollment Wizard'

    channel_id = fields.Many2one(
        'slide.channel',
        string='Course',
        required=True,
        domain=[('is_published', '=', True)],
    )
    user_ids = fields.Many2many(
        'res.users',
        string='Students',
        required=True,
    )
    enrollment_type = fields.Selection([
        ('free', 'Free'),
        ('corporate', 'Corporate'),
        ('scholarship', 'Scholarship'),
    ], string='Enrollment Type', default='free', required=True)
    expiration_date = fields.Datetime(string='Expiration Date')
    company_sponsor_id = fields.Many2one(
        'res.partner',
        string='Sponsor Company',
    )
    send_notification = fields.Boolean(
        string='Send Notification Email',
        default=True,
    )
    notes = fields.Text(string='Notes')

    @api.onchange('enrollment_type')
    def _onchange_enrollment_type(self):
        if self.enrollment_type != 'corporate':
            self.company_sponsor_id = False

    def action_enroll(self):
        """Create enrollments for selected users."""
        self.ensure_one()
        Enrollment = self.env['seitech.enrollment']

        created = 0
        skipped = 0
        errors = []

        for user in self.user_ids:
            # Check if already enrolled
            existing = Enrollment.search([
                ('channel_id', '=', self.channel_id.id),
                ('user_id', '=', user.id),
            ], limit=1)

            if existing:
                skipped += 1
                continue

            try:
                enrollment = Enrollment.create({
                    'channel_id': self.channel_id.id,
                    'user_id': user.id,
                    'enrollment_type': self.enrollment_type,
                    'expiration_date': self.expiration_date,
                    'company_sponsor_id': self.company_sponsor_id.id if self.company_sponsor_id else False,
                    'notes': self.notes,
                    'state': 'active',
                })
                enrollment.action_activate()
                created += 1

                if self.send_notification:
                    enrollment._send_enrollment_email('welcome')

            except Exception as e:
                errors.append(f'{user.name}: {str(e)}')

        # Show result
        message = f'Enrolled {created} students successfully.'
        if skipped:
            message += f' {skipped} already enrolled.'
        if errors:
            message += f' {len(errors)} errors occurred.'

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Bulk Enrollment Complete',
                'message': message,
                'type': 'success' if not errors else 'warning',
                'sticky': False,
            }
        }


class BulkEnrollmentWizardView(models.Model):
    """View registration for bulk enrollment wizard."""
    _inherit = 'ir.ui.view'
