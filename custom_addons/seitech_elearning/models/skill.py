# -*- coding: utf-8 -*-
"""Skill framework models for competency tracking."""
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class Skill(models.Model):
    """Skills and competencies that can be acquired through learning."""
    _name = 'seitech.skill'
    _description = 'Learning Skill'
    _order = 'category, sequence, name'
    _parent_name = 'parent_id'
    _parent_store = True

    name = fields.Char(
        string='Skill Name',
        required=True,
        translate=True,
        index=True,
    )
    code = fields.Char(
        string='Code',
        required=True,
        index=True,
        help='Unique identifier for the skill',
    )
    description = fields.Text(
        string='Description',
        translate=True,
    )
    
    # Hierarchy
    parent_id = fields.Many2one(
        'seitech.skill',
        string='Parent Skill',
        ondelete='cascade',
        index=True,
    )
    parent_path = fields.Char(index=True)
    child_ids = fields.One2many(
        'seitech.skill',
        'parent_id',
        string='Sub-Skills',
    )
    
    # Classification
    category = fields.Selection([
        ('technical', 'Technical Skills'),
        ('soft', 'Soft Skills'),
        ('compliance', 'Compliance & Regulatory'),
        ('leadership', 'Leadership'),
        ('management', 'Management'),
        ('health_safety', 'Health & Safety'),
        ('quality', 'Quality Assurance'),
        ('other', 'Other'),
    ], string='Category', required=True, default='technical', index=True)
    
    # Proficiency levels
    level_count = fields.Integer(
        string='Proficiency Levels',
        default=5,
        help='Number of proficiency levels for this skill',
    )
    level_names = fields.Text(
        string='Level Names (JSON)',
        default='["Awareness", "Foundational", "Intermediate", "Advanced", "Expert"]',
        help='JSON array of level names',
    )
    
    # Visual
    icon = fields.Char(
        string='Icon',
        default='fa-certificate',
        help='Font Awesome icon class',
    )
    color = fields.Char(
        string='Color',
        default='#0284c7',
        help='Hex color code',
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
    )
    
    # Status
    is_active = fields.Boolean(
        string='Active',
        default=True,
    )
    is_verified = fields.Boolean(
        string='Requires Verification',
        default=False,
        help='Skill must be verified through assessment',
    )
    
    # Industry/Domain
    industry_ids = fields.Many2many(
        'res.partner.industry',
        string='Industries',
        help='Industries where this skill is relevant',
    )
    
    # Relations
    course_skill_ids = fields.One2many(
        'seitech.course.skill',
        'skill_id',
        string='Course Mappings',
    )
    user_skill_ids = fields.One2many(
        'seitech.user.skill',
        'skill_id',
        string='User Skills',
    )
    
    # Statistics
    total_courses = fields.Integer(
        string='Courses Teaching',
        compute='_compute_stats',
        store=True,
    )
    total_learners = fields.Integer(
        string='Learners with Skill',
        compute='_compute_stats',
        store=True,
    )
    average_proficiency = fields.Float(
        string='Avg Proficiency',
        compute='_compute_stats',
        digits=(3, 2),
    )
    
    # Trending
    is_trending = fields.Boolean(
        string='Trending',
        compute='_compute_trending',
        store=True,
        help='Skill is trending based on recent interest',
    )
    trend_score = fields.Float(
        string='Trend Score',
        compute='_compute_trending',
        store=True,
    )
    
    _sql_constraints = [
        ('code_unique', 'UNIQUE(code)', 'Skill code must be unique.'),
        ('check_level_count', 'CHECK(level_count > 0 AND level_count <= 10)',
         'Level count must be between 1 and 10.'),
    ]

    @api.depends('course_skill_ids', 'user_skill_ids')
    def _compute_stats(self):
        """Calculate skill statistics."""
        for skill in self:
            skill.total_courses = len(skill.course_skill_ids.mapped('channel_id'))
            
            user_skills = skill.user_skill_ids
            skill.total_learners = len(user_skills.mapped('user_id'))
            
            if user_skills:
                # Convert levels to numeric for averaging
                level_values = {
                    'awareness': 1,
                    'foundational': 2,
                    'intermediate': 3,
                    'advanced': 4,
                    'expert': 5,
                }
                total = sum(level_values.get(us.current_level, 0) for us in user_skills)
                skill.average_proficiency = total / len(user_skills) if user_skills else 0
            else:
                skill.average_proficiency = 0.0

    def _compute_trending(self):
        """Calculate if skill is trending based on recent activity."""
        from datetime import datetime, timedelta
        
        thirty_days_ago = fields.Datetime.now() - timedelta(days=30)
        
        for skill in self:
            # Count recent enrollments in courses teaching this skill
            recent_enrollments = self.env['seitech.enrollment'].search_count([
                ('channel_id', 'in', skill.course_skill_ids.mapped('channel_id').ids),
                ('create_date', '>=', thirty_days_ago),
            ])
            
            # Count recent skill acquisitions
            recent_acquisitions = self.env['seitech.user.skill'].search_count([
                ('skill_id', '=', skill.id),
                ('last_updated', '>=', thirty_days_ago),
            ])
            
            # Calculate trend score (higher = more trending)
            skill.trend_score = (recent_enrollments * 0.6) + (recent_acquisitions * 0.4)
            skill.is_trending = skill.trend_score > 10  # Threshold for trending

    @api.constrains('parent_id')
    def _check_parent_recursion(self):
        """Prevent circular parent relationships."""
        if not self._check_recursion():
            raise ValidationError(_('You cannot create recursive skill hierarchies.'))

    def get_full_path(self):
        """Get full hierarchical path of skill."""
        self.ensure_one()
        path = [self.name]
        current = self.parent_id
        while current:
            path.insert(0, current.name)
            current = current.parent_id
        return ' > '.join(path)

    def get_all_children(self):
        """Get all descendant skills."""
        self.ensure_one()
        children = self.child_ids
        for child in self.child_ids:
            children |= child.get_all_children()
        return children

    def get_related_skills(self, limit=5):
        """Get related skills based on course overlap."""
        self.ensure_one()
        
        # Find courses that teach this skill
        course_ids = self.course_skill_ids.mapped('channel_id').ids
        
        if not course_ids:
            return self.env['seitech.skill']
        
        # Find other skills taught in same courses
        related_skills = self.env['seitech.course.skill'].search([
            ('channel_id', 'in', course_ids),
            ('skill_id', '!=', self.id),
        ]).mapped('skill_id')
        
        # Sort by frequency
        skill_count = {}
        for skill in related_skills:
            skill_count[skill.id] = skill_count.get(skill.id, 0) + 1
        
        sorted_skills = sorted(skill_count.items(), key=lambda x: x[1], reverse=True)
        skill_ids = [skill_id for skill_id, count in sorted_skills[:limit]]
        
        return self.env['seitech.skill'].browse(skill_ids)

    @api.model
    def get_trending_skills(self, limit=10):
        """Get currently trending skills."""
        return self.search([
            ('is_active', '=', True),
            ('is_trending', '=', True),
        ], order='trend_score desc', limit=limit)

    @api.model
    def get_skills_by_category(self, category):
        """Get all skills in a category."""
        return self.search([
            ('category', '=', category),
            ('is_active', '=', True),
        ], order='sequence, name')

    def action_view_courses(self):
        """View courses teaching this skill."""
        self.ensure_one()
        course_ids = self.course_skill_ids.mapped('channel_id').ids
        
        return {
            'type': 'ir.actions.act_window',
            'name': _('Courses - %s') % self.name,
            'res_model': 'slide.channel',
            'view_mode': 'kanban,tree,form',
            'domain': [('id', 'in', course_ids)],
            'context': {'default_skill_id': self.id},
        }

    def action_view_learners(self):
        """View learners with this skill."""
        self.ensure_one()
        user_ids = self.user_skill_ids.mapped('user_id').ids
        
        return {
            'type': 'ir.actions.act_window',
            'name': _('Learners - %s') % self.name,
            'res_model': 'res.users',
            'view_mode': 'tree,form',
            'domain': [('id', 'in', user_ids)],
        }

    def name_get(self):
        """Custom name display with hierarchy."""
        result = []
        for skill in self:
            if skill.parent_id:
                name = f'{skill.parent_id.name} / {skill.name}'
            else:
                name = skill.name
            result.append((skill.id, name))
        return result
