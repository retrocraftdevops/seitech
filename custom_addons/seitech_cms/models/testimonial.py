# -*- coding: utf-8 -*-
from odoo import models, fields, api


class CmsTestimonial(models.Model):
    """Customer Testimonials"""
    _name = 'seitech.cms.testimonial'
    _description = 'CMS Testimonial'
    _order = 'sequence, id'

    name = fields.Char(string='Customer Name', required=True)
    title = fields.Char(string='Job Title')
    company = fields.Char(string='Company')
    avatar = fields.Binary(string='Avatar/Photo')
    content = fields.Text(string='Testimonial Content', required=True)
    rating = fields.Selection([
        ('1', '1 Star'),
        ('2', '2 Stars'),
        ('3', '3 Stars'),
        ('4', '4 Stars'),
        ('5', '5 Stars'),
    ], string='Rating', default='5')

    # Related service (course_id removed - no dependency on website_slides)
    course_name = fields.Char(string='Related Course/Service Name')
    service_type = fields.Selection([
        ('training', 'Training'),
        ('consultancy', 'Consultancy'),
        ('elearning', 'E-Learning'),
        ('general', 'General'),
    ], string='Service Type', default='general')

    # Display settings
    is_featured = fields.Boolean(string='Featured', default=False)
    is_published = fields.Boolean(string='Published', default=True)
    sequence = fields.Integer(string='Sequence', default=10)

    # Source
    source = fields.Selection([
        ('google', 'Google Reviews'),
        ('trustpilot', 'Trustpilot'),
        ('linkedin', 'LinkedIn'),
        ('direct', 'Direct Feedback'),
        ('survey', 'Survey'),
    ], string='Source', default='direct')
    source_url = fields.Char(string='Source URL')
    date = fields.Date(string='Testimonial Date', default=fields.Date.today)

    def get_api_data(self):
        """Return data formatted for API response"""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'title': self.title or '',
            'company': self.company or '',
            'avatar': f'/web/image/seitech.cms.testimonial/{self.id}/avatar' if self.avatar else None,
            'content': self.content,
            'rating': int(self.rating) if self.rating else 5,
            'courseName': self.course_name or '',
            'serviceType': self.service_type or 'general',
            'isFeatured': self.is_featured,
            'source': self.source or 'direct',
            'sourceUrl': self.source_url or '',
            'date': self.date.isoformat() if self.date else None,
        }
