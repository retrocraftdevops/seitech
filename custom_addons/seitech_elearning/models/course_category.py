# -*- coding: utf-8 -*-
from odoo import models, fields, api


class CourseCategory(models.Model):
    """Extended course categories for better organization."""
    _name = 'seitech.course.category'
    _description = 'Course Category'
    _order = 'sequence, name'
    _parent_store = True

    name = fields.Char(string='Name', required=True, translate=True)
    slug = fields.Char(string='URL Slug', index=True)
    description = fields.Text(string='Description', translate=True)
    parent_id = fields.Many2one(
        'seitech.course.category',
        string='Parent Category',
        index=True,
        ondelete='cascade',
    )
    parent_path = fields.Char(index=True, unaccent=False)
    child_ids = fields.One2many(
        'seitech.course.category',
        'parent_id',
        string='Subcategories',
    )
    sequence = fields.Integer(string='Sequence', default=10)
    icon = fields.Char(string='Icon Class', help='Font Awesome icon class')
    image = fields.Binary(string='Image', attachment=True)
    color = fields.Char(string='Color', default='#0284c7')
    is_published = fields.Boolean(string='Published', default=True)

    # Related courses
    channel_ids = fields.One2many(
        'slide.channel',
        'seitech_category_id',
        string='Courses',
    )
    course_count = fields.Integer(
        string='Number of Courses',
        compute='_compute_course_count',
        store=True,
    )

    @api.depends('channel_ids')
    def _compute_course_count(self):
        for category in self:
            category.course_count = len(category.channel_ids.filtered('is_published'))

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('slug') and vals.get('name'):
                vals['slug'] = self._generate_slug(vals['name'])
        return super().create(vals_list)

    def _generate_slug(self, name):
        """Generate URL-friendly slug from name."""
        import re
        slug = name.lower().strip()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug

    @api.constrains('parent_id')
    def _check_parent_id(self):
        if not self._check_recursion():
            raise models.ValidationError('Error! You cannot create recursive categories.')
