# -*- coding: utf-8 -*-
from odoo import models, fields, api


class CmsPartner(models.Model):
    """Partners, Accreditations, Client Logos"""
    _name = 'seitech.cms.partner'
    _description = 'CMS Partner/Accreditation'
    _order = 'partner_type, sequence, name'

    name = fields.Char(string='Partner Name', required=True)
    logo = fields.Binary(string='Logo')
    logo_dark = fields.Binary(string='Logo (Dark Mode)')
    website_url = fields.Char(string='Website URL')
    description = fields.Text(string='Description')

    partner_type = fields.Selection([
        ('accreditation', 'Accreditation Body'),
        ('certification', 'Certification Body'),
        ('client', 'Client'),
        ('partner', 'Partner'),
        ('sponsor', 'Sponsor'),
        ('association', 'Professional Association'),
    ], string='Partner Type', required=True, default='partner')

    # For accreditations
    accreditation_number = fields.Char(string='Accreditation Number')
    accreditation_expiry = fields.Date(string='Accreditation Expiry')
    certificate_url = fields.Char(string='Certificate URL')

    # Display settings
    is_featured = fields.Boolean(string='Featured', default=False)
    is_published = fields.Boolean(string='Published', default=True)
    show_on_homepage = fields.Boolean(string='Show on Homepage', default=True)
    sequence = fields.Integer(string='Sequence', default=10)

    # Related
    partner_id = fields.Many2one('res.partner', string='Related Partner Record')

    def get_api_data(self):
        """Return data formatted for API response"""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'logo': f'/web/image/seitech.cms.partner/{self.id}/logo' if self.logo else None,
            'logoDark': f'/web/image/seitech.cms.partner/{self.id}/logo_dark' if self.logo_dark else None,
            'websiteUrl': self.website_url or '',
            'description': self.description or '',
            'partnerType': self.partner_type,
            'accreditationNumber': self.accreditation_number or '',
            'accreditationExpiry': self.accreditation_expiry.isoformat() if self.accreditation_expiry else None,
            'certificateUrl': self.certificate_url or '',
            'isFeatured': self.is_featured,
        }
