# -*- coding: utf-8 -*-
from odoo import models, fields, api


class CmsFaqCategory(models.Model):
    """FAQ Categories"""
    _name = 'seitech.cms.faq.category'
    _description = 'FAQ Category'
    _order = 'sequence, name'

    name = fields.Char(string='Category Name', required=True)
    slug = fields.Char(string='URL Slug', required=True)
    description = fields.Text(string='Description')
    icon = fields.Char(string='Icon Name', help='Lucide icon name')
    faq_ids = fields.One2many('seitech.cms.faq', 'category_id', string='FAQs')
    faq_count = fields.Integer(string='FAQ Count', compute='_compute_faq_count')
    is_published = fields.Boolean(string='Published', default=True)
    sequence = fields.Integer(string='Sequence', default=10)

    _sql_constraints = [
        ('slug_unique', 'UNIQUE(slug)', 'Category slug must be unique!')
    ]

    @api.depends('faq_ids')
    def _compute_faq_count(self):
        for category in self:
            category.faq_count = len(category.faq_ids.filtered('is_published'))

    def get_api_data(self):
        """Return data formatted for API response"""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description or '',
            'icon': self.icon or '',
            'faqCount': self.faq_count,
            'faqs': [faq.get_api_data() for faq in self.faq_ids.filtered('is_published')],
        }


class CmsFaq(models.Model):
    """Frequently Asked Questions"""
    _name = 'seitech.cms.faq'
    _description = 'FAQ'
    _order = 'category_id, sequence, id'

    question = fields.Char(string='Question', required=True)
    answer = fields.Html(string='Answer', required=True)
    short_answer = fields.Text(string='Short Answer', help='Brief answer for preview')

    category_id = fields.Many2one('seitech.cms.faq.category', string='Category')

    # Related to specific content
    page_ids = fields.Many2many('seitech.cms.page', string='Related Pages')
    course_name = fields.Char(string='Related Course/Service Name')

    # Settings
    is_featured = fields.Boolean(string='Featured', default=False)
    is_published = fields.Boolean(string='Published', default=True)
    sequence = fields.Integer(string='Sequence', default=10)

    # Analytics
    view_count = fields.Integer(string='View Count', default=0)
    helpful_count = fields.Integer(string='Helpful Count', default=0)
    not_helpful_count = fields.Integer(string='Not Helpful Count', default=0)

    def get_api_data(self):
        """Return data formatted for API response"""
        self.ensure_one()
        return {
            'id': self.id,
            'question': self.question,
            'answer': self.answer,
            'shortAnswer': self.short_answer or '',
            'categoryId': self.category_id.id if self.category_id else None,
            'categoryName': self.category_id.name if self.category_id else None,
            'categorySlug': self.category_id.slug if self.category_id else None,
            'isFeatured': self.is_featured,
            'viewCount': self.view_count,
            'helpfulCount': self.helpful_count,
        }

    def action_mark_helpful(self):
        """Increment helpful count"""
        self.helpful_count += 1

    def action_mark_not_helpful(self):
        """Increment not helpful count"""
        self.not_helpful_count += 1

    def action_increment_views(self):
        """Increment view count"""
        self.view_count += 1
