# -*- coding: utf-8 -*-
from odoo import models, fields, api


class CmsTeamMember(models.Model):
    """Team Members / Instructors / Staff"""
    _name = 'seitech.cms.team.member'
    _description = 'Team Member'
    _order = 'sequence, name'

    name = fields.Char(string='Full Name', required=True)
    slug = fields.Char(string='URL Slug')
    image = fields.Binary(string='Photo')
    job_title = fields.Char(string='Job Title')
    department = fields.Selection([
        ('leadership', 'Leadership'),
        ('training', 'Training & Development'),
        ('consultancy', 'Consultancy'),
        ('sales', 'Sales'),
        ('support', 'Customer Support'),
        ('admin', 'Administration'),
    ], string='Department')

    # Bio
    short_bio = fields.Char(string='Short Bio', size=200)
    full_bio = fields.Html(string='Full Biography')

    # Qualifications
    qualifications = fields.Text(string='Qualifications')
    certifications = fields.Text(string='Certifications')
    specializations = fields.Char(string='Specializations')

    # Social Links
    email = fields.Char(string='Email')
    phone = fields.Char(string='Phone')
    linkedin_url = fields.Char(string='LinkedIn URL')
    twitter_url = fields.Char(string='Twitter URL')

    # Settings
    is_instructor = fields.Boolean(string='Is Instructor', default=False)
    is_featured = fields.Boolean(string='Featured', default=False)
    is_published = fields.Boolean(string='Published', default=True)
    show_on_homepage = fields.Boolean(string='Show on Homepage', default=False)
    sequence = fields.Integer(string='Sequence', default=10)

    # Related
    partner_id = fields.Many2one('res.partner', string='Related Contact')
    # Note: instructor_id removed - use is_instructor boolean instead

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('slug') and vals.get('name'):
                vals['slug'] = vals['name'].lower().replace(' ', '-')
        return super().create(vals_list)

    def get_api_data(self):
        """Return data formatted for API response"""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug or '',
            'image': f'/web/image/seitech.cms.team.member/{self.id}/image' if self.image else None,
            'jobTitle': self.job_title or '',
            'department': self.department or '',
            'shortBio': self.short_bio or '',
            'fullBio': self.full_bio or '',
            'qualifications': self.qualifications or '',
            'certifications': self.certifications or '',
            'specializations': self.specializations or '',
            'email': self.email or '',
            'linkedinUrl': self.linkedin_url or '',
            'twitterUrl': self.twitter_url or '',
            'isInstructor': self.is_instructor,
            'isFeatured': self.is_featured,
        }
