# -*- coding: utf-8 -*-
import uuid
import hashlib
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class CertificateTemplate(models.Model):
    """Certificate template for courses."""
    _name = 'seitech.certificate.template'
    _description = 'Certificate Template'
    _order = 'name'

    name = fields.Char(string='Template Name', required=True)
    description = fields.Text(string='Description')
    is_active = fields.Boolean(string='Active', default=True)

    # Design
    background_image = fields.Binary(string='Background Image', attachment=True)
    logo = fields.Binary(string='Logo', attachment=True)
    primary_color = fields.Char(string='Primary Color', default='#0284c7')
    secondary_color = fields.Char(string='Secondary Color', default='#334155')

    # Content
    title = fields.Char(string='Certificate Title', default='Certificate of Completion')
    subtitle = fields.Char(string='Subtitle')
    body_text = fields.Html(
        string='Body Text',
        default='''<p>This is to certify that</p>
<p><strong>{{student_name}}</strong></p>
<p>has successfully completed the course</p>
<p><strong>{{course_name}}</strong></p>
<p>on {{completion_date}}</p>''',
    )
    footer_text = fields.Text(string='Footer Text')

    # Signatures
    signature_1_name = fields.Char(string='Signature 1 Name')
    signature_1_title = fields.Char(string='Signature 1 Title')
    signature_1_image = fields.Binary(string='Signature 1 Image', attachment=True)
    signature_2_name = fields.Char(string='Signature 2 Name')
    signature_2_title = fields.Char(string='Signature 2 Title')
    signature_2_image = fields.Binary(string='Signature 2 Image', attachment=True)

    # Options
    include_qr_code = fields.Boolean(string='Include QR Code', default=True)
    include_course_details = fields.Boolean(string='Include Course Details', default=True)
    expiration_period = fields.Integer(
        string='Expiration Period (months)',
        default=0,
        help='0 = no expiration',
    )


class Certificate(models.Model):
    """Issued certificates for course completions."""
    _name = 'seitech.certificate'
    _description = 'Certificate'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'issue_date desc'

    name = fields.Char(
        string='Certificate Number',
        required=True,
        copy=False,
        readonly=True,
        default=lambda self: _('New'),
    )
    verification_code = fields.Char(
        string='Verification Code',
        required=True,
        copy=False,
        readonly=True,
        index=True,
    )
    verification_url = fields.Char(
        string='Verification URL',
        compute='_compute_verification_url',
    )

    # Relations
    enrollment_id = fields.Many2one(
        'seitech.enrollment',
        string='Enrollment',
        ondelete='cascade',
    )
    channel_id = fields.Many2one(
        'slide.channel',
        string='Course',
        required=True,
    )
    user_id = fields.Many2one(
        'res.users',
        string='Student',
        required=True,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Contact',
        related='user_id.partner_id',
        store=True,
    )
    template_id = fields.Many2one(
        'seitech.certificate.template',
        string='Template',
    )

    # Details
    issue_date = fields.Datetime(
        string='Issue Date',
        default=fields.Datetime.now,
        required=True,
    )
    expiration_date = fields.Datetime(string='Expiration Date')
    state = fields.Selection([
        ('draft', 'Draft'),
        ('issued', 'Issued'),
        ('expired', 'Expired'),
        ('revoked', 'Revoked'),
    ], string='Status', default='draft', tracking=True)

    # Course completion data (snapshot at time of issue)
    completion_date = fields.Datetime(string='Completion Date')
    completion_percentage = fields.Float(string='Completion %')
    quiz_average = fields.Float(string='Quiz Average %')
    time_spent = fields.Integer(string='Time Spent (hours)')

    # Instructor signature
    instructor_id = fields.Many2one(
        'seitech.instructor',
        string='Issuing Instructor',
    )

    # PDF
    certificate_pdf = fields.Binary(string='Certificate PDF', attachment=True)
    certificate_filename = fields.Char(string='PDF Filename')

    # QR Code
    qr_code = fields.Binary(string='QR Code', attachment=True)

    # Revocation
    revocation_reason = fields.Text(string='Revocation Reason')
    revoked_date = fields.Datetime(string='Revoked Date')
    revoked_by_id = fields.Many2one('res.users', string='Revoked By')

    _sql_constraints = [
        ('unique_verification_code', 'UNIQUE(verification_code)',
         'Verification code must be unique.'),
    ]

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('seitech.certificate') or _('New')
            if not vals.get('verification_code'):
                vals['verification_code'] = self._generate_verification_code()
        records = super().create(vals_list)
        for record in records:
            record._generate_qr_code()
        return records

    def _generate_verification_code(self):
        """Generate unique verification code."""
        code = str(uuid.uuid4()).replace('-', '').upper()[:12]
        # Create checksum
        checksum = hashlib.md5(code.encode()).hexdigest()[:4].upper()
        return f'CERT-{code}-{checksum}'

    def _compute_verification_url(self):
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        for cert in self:
            cert.verification_url = f'{base_url}/certificate/verify/{cert.verification_code}'

    def _generate_qr_code(self):
        """Generate QR code for certificate verification."""
        try:
            import qrcode
            import io
            import base64

            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(self.verification_url)
            qr.make(fit=True)

            img = qr.make_image(fill_color='black', back_color='white')
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            self.qr_code = base64.b64encode(buffer.getvalue())
        except ImportError:
            # qrcode library not installed
            pass

    def action_issue(self):
        """Issue the certificate."""
        for cert in self:
            if cert.state == 'draft':
                # Capture completion data
                enrollment = cert.enrollment_id
                if enrollment:
                    cert.completion_percentage = enrollment.completion_percentage
                    cert.time_spent = enrollment.time_spent // 60  # Convert to hours

                cert.state = 'issued'
                cert.issue_date = fields.Datetime.now()

                # Set expiration if template has one
                if cert.template_id and cert.template_id.expiration_period:
                    from dateutil.relativedelta import relativedelta
                    cert.expiration_date = fields.Datetime.now() + relativedelta(
                        months=cert.template_id.expiration_period
                    )

                # Generate PDF
                cert.action_generate_pdf()

                # Send certificate email
                cert._send_certificate_email()
        return True

    def action_revoke(self):
        """Revoke the certificate."""
        for cert in self:
            if cert.state == 'issued':
                cert.state = 'revoked'
                cert.revoked_date = fields.Datetime.now()
                cert.revoked_by_id = self.env.user.id
        return True

    def action_generate_pdf(self):
        """Generate PDF certificate."""
        self.ensure_one()
        report = self.env.ref('seitech_elearning.action_report_certificate')
        pdf_content, content_type = report._render_qweb_pdf([self.id])
        self.certificate_pdf = pdf_content
        self.certificate_filename = f'{self.name}.pdf'
        return True

    def _send_certificate_email(self):
        """Send certificate via email."""
        template = self.env.ref(
            'seitech_elearning.certificate_issued_email',
            raise_if_not_found=False
        )
        if template:
            template.send_mail(self.id, force_send=True)

    @api.model
    def verify_certificate(self, verification_code):
        """Verify certificate by code."""
        cert = self.search([('verification_code', '=', verification_code)], limit=1)
        if not cert:
            return {'valid': False, 'error': 'Certificate not found'}
        if cert.state == 'revoked':
            return {'valid': False, 'error': 'Certificate has been revoked', 'certificate': cert}
        if cert.state == 'expired':
            return {'valid': False, 'error': 'Certificate has expired', 'certificate': cert}
        if cert.state != 'issued':
            return {'valid': False, 'error': 'Certificate is not valid', 'certificate': cert}
        return {'valid': True, 'certificate': cert}

    @api.model
    def _cron_check_expirations(self):
        """Check and mark expired certificates."""
        now = fields.Datetime.now()
        expired = self.search([
            ('state', '=', 'issued'),
            ('expiration_date', '!=', False),
            ('expiration_date', '<', now),
        ])
        expired.write({'state': 'expired'})
