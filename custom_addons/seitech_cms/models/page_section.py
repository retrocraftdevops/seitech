# -*- coding: utf-8 -*-
from odoo import models, fields, api


class CmsPage(models.Model):
    """CMS Page - represents a page on the frontend"""
    _name = 'seitech.cms.page'
    _description = 'CMS Page'
    _order = 'sequence, name'

    name = fields.Char(string='Page Name', required=True)
    slug = fields.Char(string='URL Slug', required=True, index=True)
    title = fields.Char(string='Page Title (SEO)')
    meta_description = fields.Text(string='Meta Description')
    meta_keywords = fields.Char(string='Meta Keywords')
    og_image = fields.Binary(string='OG Image')
    is_published = fields.Boolean(string='Published', default=True)
    sequence = fields.Integer(string='Sequence', default=10)
    section_ids = fields.One2many('seitech.cms.section', 'page_id', string='Sections')

    _sql_constraints = [
        ('slug_unique', 'UNIQUE(slug)', 'Page slug must be unique!')
    ]

    def get_api_data(self):
        """Return data formatted for API response"""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'title': self.title or self.name,
            'metaDescription': self.meta_description or '',
            'metaKeywords': self.meta_keywords or '',
            'ogImage': f'/web/image/seitech.cms.page/{self.id}/og_image' if self.og_image else None,
            'sections': [section.get_api_data() for section in self.section_ids.filtered('is_published')],
        }


class CmsSection(models.Model):
    """CMS Section - represents a section within a page"""
    _name = 'seitech.cms.section'
    _description = 'CMS Page Section'
    _order = 'sequence, id'

    name = fields.Char(string='Section Name', required=True)
    identifier = fields.Char(
        string='Identifier',
        required=True,
        help='Unique identifier used in frontend (e.g., hero, features, cta)'
    )
    page_id = fields.Many2one('seitech.cms.page', string='Page', ondelete='cascade')
    section_type = fields.Selection([
        ('hero', 'Hero Section'),
        ('features', 'Features Grid'),
        ('services', 'Services Overview'),
        ('cta', 'Call to Action'),
        ('stats', 'Statistics'),
        ('testimonials', 'Testimonials'),
        ('faq', 'FAQ Section'),
        ('team', 'Team Members'),
        ('partners', 'Partners/Logos'),
        ('pricing', 'Pricing'),
        ('contact', 'Contact Form'),
        ('content', 'Rich Content'),
        ('gallery', 'Image Gallery'),
        ('video', 'Video Section'),
        ('custom', 'Custom Section'),
    ], string='Section Type', required=True, default='content')

    # Content fields
    title = fields.Char(string='Title')
    subtitle = fields.Char(string='Subtitle')
    description = fields.Html(string='Description')
    content = fields.Html(string='Rich Content')

    # Media
    image = fields.Binary(string='Image')
    image_alt = fields.Char(string='Image Alt Text')
    background_image = fields.Binary(string='Background Image')
    video_url = fields.Char(string='Video URL')

    # Styling
    background_color = fields.Char(string='Background Color', default='white')
    text_color = fields.Char(string='Text Color', default='dark')
    layout = fields.Selection([
        ('default', 'Default'),
        ('centered', 'Centered'),
        ('left', 'Image Left'),
        ('right', 'Image Right'),
        ('full-width', 'Full Width'),
        ('grid', 'Grid Layout'),
    ], string='Layout', default='default')

    # CTA Buttons
    cta_text = fields.Char(string='Primary CTA Text')
    cta_url = fields.Char(string='Primary CTA URL')
    cta_style = fields.Selection([
        ('primary', 'Primary'),
        ('secondary', 'Secondary'),
        ('outline', 'Outline'),
    ], string='Primary CTA Style', default='primary')
    secondary_cta_text = fields.Char(string='Secondary CTA Text')
    secondary_cta_url = fields.Char(string='Secondary CTA URL')

    # Items (for features, services, stats, etc.)
    item_ids = fields.One2many('seitech.cms.section.item', 'section_id', string='Items')

    # Settings
    is_published = fields.Boolean(string='Published', default=True)
    sequence = fields.Integer(string='Sequence', default=10)
    css_class = fields.Char(string='Custom CSS Class')

    # Related records (for dynamic sections)
    testimonial_ids = fields.Many2many('seitech.cms.testimonial', string='Testimonials')
    faq_ids = fields.Many2many('seitech.cms.faq', string='FAQs')
    team_member_ids = fields.Many2many('seitech.cms.team.member', string='Team Members')
    partner_ids = fields.Many2many('seitech.cms.partner', string='Partners')

    def get_api_data(self):
        """Return data formatted for API response"""
        self.ensure_one()
        data = {
            'id': self.id,
            'identifier': self.identifier,
            'type': self.section_type,
            'title': self.title or '',
            'subtitle': self.subtitle or '',
            'description': self.description or '',
            'content': self.content or '',
            'image': f'/web/image/seitech.cms.section/{self.id}/image' if self.image else None,
            'imageAlt': self.image_alt or '',
            'backgroundImage': f'/web/image/seitech.cms.section/{self.id}/background_image' if self.background_image else None,
            'videoUrl': self.video_url or '',
            'backgroundColor': self.background_color or 'white',
            'textColor': self.text_color or 'dark',
            'layout': self.layout or 'default',
            'ctaText': self.cta_text or '',
            'ctaUrl': self.cta_url or '',
            'ctaStyle': self.cta_style or 'primary',
            'secondaryCtaText': self.secondary_cta_text or '',
            'secondaryCtaUrl': self.secondary_cta_url or '',
            'cssClass': self.css_class or '',
            'items': [item.get_api_data() for item in self.item_ids],
            'sequence': self.sequence,
        }

        # Add related records based on section type
        if self.section_type == 'testimonials' and self.testimonial_ids:
            data['testimonials'] = [t.get_api_data() for t in self.testimonial_ids.filtered('is_published')]
        if self.section_type == 'faq' and self.faq_ids:
            data['faqs'] = [f.get_api_data() for f in self.faq_ids.filtered('is_published')]
        if self.section_type == 'team' and self.team_member_ids:
            data['teamMembers'] = [m.get_api_data() for m in self.team_member_ids.filtered('is_published')]
        if self.section_type == 'partners' and self.partner_ids:
            data['partners'] = [p.get_api_data() for p in self.partner_ids.filtered('is_published')]

        return data


class CmsSectionItem(models.Model):
    """Section Items - for features, services, stats, etc."""
    _name = 'seitech.cms.section.item'
    _description = 'CMS Section Item'
    _order = 'sequence, id'

    name = fields.Char(string='Item Name', required=True)
    section_id = fields.Many2one('seitech.cms.section', string='Section', ondelete='cascade')

    # Content
    title = fields.Char(string='Title')
    subtitle = fields.Char(string='Subtitle')
    description = fields.Text(string='Description')
    content = fields.Html(string='Rich Content')

    # Media
    icon = fields.Char(string='Icon Name', help='Lucide icon name (e.g., shield, book-open)')
    icon_color = fields.Char(string='Icon Color')
    image = fields.Binary(string='Image')
    image_alt = fields.Char(string='Image Alt Text')

    # Link
    url = fields.Char(string='URL')
    url_text = fields.Char(string='Link Text')
    open_new_tab = fields.Boolean(string='Open in New Tab')

    # Stats (for stats sections)
    stat_value = fields.Char(string='Statistic Value')
    stat_suffix = fields.Char(string='Statistic Suffix', help='e.g., +, %, k')
    stat_prefix = fields.Char(string='Statistic Prefix', help='e.g., $, £')

    # Settings
    is_published = fields.Boolean(string='Published', default=True)
    sequence = fields.Integer(string='Sequence', default=10)
    css_class = fields.Char(string='Custom CSS Class')

    def get_api_data(self):
        """Return data formatted for API response"""
        self.ensure_one()
        return {
            'id': self.id,
            'title': self.title or self.name,
            'subtitle': self.subtitle or '',
            'description': self.description or '',
            'content': self.content or '',
            'icon': self.icon or '',
            'iconColor': self.icon_color or '',
            'image': f'/web/image/seitech.cms.section.item/{self.id}/image' if self.image else None,
            'imageAlt': self.image_alt or '',
            'url': self.url or '',
            'urlText': self.url_text or '',
            'openNewTab': self.open_new_tab,
            'statValue': self.stat_value or '',
            'statSuffix': self.stat_suffix or '',
            'statPrefix': self.stat_prefix or '',
            'cssClass': self.css_class or '',
            'sequence': self.sequence,
        }
