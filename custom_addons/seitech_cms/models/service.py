# -*- coding: utf-8 -*-
from odoo import models, fields, api


class CmsServiceCategory(models.Model):
    """Consultancy Service Categories"""
    _name = 'seitech.cms.service.category'
    _description = 'Service Category'
    _order = 'sequence, name'

    name = fields.Char(string='Category Name', required=True)
    slug = fields.Char(string='URL Slug', required=True)
    description = fields.Text(string='Description')
    icon = fields.Char(string='Icon Name', help='Lucide icon name')
    service_ids = fields.One2many('seitech.cms.service', 'category_id', string='Services')
    service_count = fields.Integer(string='Service Count', compute='_compute_service_count')
    is_published = fields.Boolean(string='Published', default=True)
    sequence = fields.Integer(string='Sequence', default=10)

    _sql_constraints = [
        ('slug_unique', 'UNIQUE(slug)', 'Category slug must be unique!')
    ]

    @api.depends('service_ids')
    def _compute_service_count(self):
        for category in self:
            category.service_count = len(category.service_ids.filtered('is_published'))

    def get_api_data(self):
        """Return data formatted for API response"""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description or '',
            'icon': self.icon or '',
            'serviceCount': self.service_count,
        }


class CmsService(models.Model):
    """Consultancy Services"""
    _name = 'seitech.cms.service'
    _description = 'Consultancy Service'
    _order = 'category_id, sequence, name'

    name = fields.Char(string='Service Name', required=True)
    slug = fields.Char(string='URL Slug', required=True)
    short_description = fields.Text(string='Short Description')
    full_description = fields.Html(string='Full Description')
    icon_name = fields.Char(string='Icon Name', help='Lucide icon name (e.g., Flame, Shield)')
    image = fields.Binary(string='Service Image')

    category_id = fields.Many2one('seitech.cms.service.category', string='Category')

    # Features & Benefits (stored as JSON or line-separated text)
    features = fields.Text(string='Features', help='One feature per line')
    benefits = fields.Text(string='Benefits', help='One benefit per line')

    # Pricing
    pricing_type = fields.Selection([
        ('free', 'Free'),
        ('fixed', 'Fixed Price'),
        ('quote', 'Get a Quote'),
        ('hourly', 'Hourly Rate'),
        ('package', 'Package'),
    ], string='Pricing Type', default='quote')
    price_from = fields.Float(string='Price From')
    price_to = fields.Float(string='Price To')
    price_currency = fields.Char(string='Currency', default='GBP')

    # Process/Steps
    process_steps = fields.Text(string='Process Steps', help='JSON array of steps')

    # Related courses - stored as text (comma-separated slugs or IDs)
    # Using text field to avoid dependency on website_slides module
    related_courses = fields.Text(string='Related Courses', help='Comma-separated course slugs')

    # SEO
    meta_title = fields.Char(string='Meta Title')
    meta_description = fields.Text(string='Meta Description')

    # Display settings
    is_featured = fields.Boolean(string='Featured', default=False)
    is_published = fields.Boolean(string='Published', default=True)
    show_on_homepage = fields.Boolean(string='Show on Homepage', default=False)
    sequence = fields.Integer(string='Sequence', default=10)

    _sql_constraints = [
        ('slug_unique', 'UNIQUE(slug)', 'Service slug must be unique!')
    ]

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('slug') and vals.get('name'):
                vals['slug'] = vals['name'].lower().replace(' ', '-').replace('&', 'and')
        return super().create(vals_list)

    def _get_features_list(self):
        """Convert features text to list"""
        if not self.features:
            return []
        return [f.strip() for f in self.features.split('\n') if f.strip()]

    def _get_benefits_list(self):
        """Convert benefits text to list"""
        if not self.benefits:
            return []
        return [b.strip() for b in self.benefits.split('\n') if b.strip()]

    def get_api_data(self):
        """Return data formatted for API response"""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'shortDescription': self.short_description or '',
            'fullDescription': self.full_description or '',
            'iconName': self.icon_name or 'Settings',
            'image': f'/web/image/seitech.cms.service/{self.id}/image' if self.image else None,
            'categoryId': self.category_id.id if self.category_id else None,
            'categoryName': self.category_id.name if self.category_id else None,
            'categorySlug': self.category_id.slug if self.category_id else None,
            'features': self._get_features_list(),
            'benefits': self._get_benefits_list(),
            'pricingType': self.pricing_type or 'quote',
            'priceFrom': self.price_from,
            'priceTo': self.price_to,
            'priceCurrency': self.price_currency or 'GBP',
            'isFeatured': self.is_featured,
            'metaTitle': self.meta_title or self.name,
            'metaDescription': self.meta_description or self.short_description or '',
        }


class CmsStatistic(models.Model):
    """Site Statistics/Metrics for display"""
    _name = 'seitech.cms.statistic'
    _description = 'Site Statistic'
    _order = 'sequence'

    name = fields.Char(string='Statistic Name', required=True)
    value = fields.Char(string='Display Value', required=True, help='e.g., "5,000+", "98%"')
    numeric_value = fields.Float(string='Numeric Value', help='For sorting/comparison')
    suffix = fields.Char(string='Suffix', help='e.g., "+", "%", "years"')
    description = fields.Char(string='Description')
    icon = fields.Char(string='Icon Name')

    stat_type = fields.Selection([
        ('counter', 'Counter'),
        ('percentage', 'Percentage'),
        ('text', 'Text'),
    ], string='Type', default='counter')

    # Display
    display_location = fields.Selection([
        ('hero', 'Hero Section'),
        ('about', 'About Page'),
        ('footer', 'Footer'),
        ('homepage', 'Homepage Statistics'),
        ('accreditations', 'Accreditations Section'),
    ], string='Display Location', default='homepage')
    is_published = fields.Boolean(string='Published', default=True)
    sequence = fields.Integer(string='Sequence', default=10)

    def get_api_data(self):
        """Return data formatted for API response"""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'value': self.value,
            'numericValue': self.numeric_value,
            'suffix': self.suffix or '',
            'description': self.description or '',
            'icon': self.icon or '',
            'statType': self.stat_type,
            'displayLocation': self.display_location,
        }
