# -*- coding: utf-8 -*-
"""Course-Skill mapping model."""
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class CourseSkill(models.Model):
    """Mapping between courses and skills they teach."""
    _name = 'seitech.course.skill'
    _description = 'Course-Skill Mapping'
    _order = 'channel_id, is_primary desc, proficiency_level, skill_id'

    channel_id = fields.Many2one(
        'slide.channel',
        string='Course',
        required=True,
        ondelete='cascade',
        index=True,
    )
    skill_id = fields.Many2one(
        'seitech.skill',
        string='Skill',
        required=True,
        ondelete='cascade',
        index=True,
    )
    
    # Proficiency
    proficiency_level = fields.Selection([
        ('awareness', 'Awareness'),
        ('foundational', 'Foundational'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ], string='Level Taught', required=True, default='foundational')
    
    skill_points = fields.Integer(
        string='Skill Points',
        default=10,
        help='Points awarded for completing this course',
    )
    
    # Importance
    is_primary = fields.Boolean(
        string='Primary Skill',
        default=False,
        help='Is this a primary skill taught in the course?',
    )
    weight = fields.Float(
        string='Weight',
        default=1.0,
        help='Weight of this skill in the course (0-1)',
    )
    
    # Assessment
    assessment_required = fields.Boolean(
        string='Requires Assessment',
        default=False,
        help='Requires passing an assessment to verify skill',
    )
    min_assessment_score = fields.Float(
        string='Min Score (%)',
        default=70.0,
        help='Minimum assessment score to verify skill',
    )
    
    # Relations
    course_name = fields.Char(
        related='channel_id.name',
        string='Course Name',
        store=True,
    )
    skill_name = fields.Char(
        related='skill_id.name',
        string='Skill Name',
        store=True,
    )
    skill_category = fields.Selection(
        related='skill_id.category',
        string='Skill Category',
        store=True,
    )
    
    _sql_constraints = [
        ('unique_course_skill', 'UNIQUE(channel_id, skill_id)',
         'A skill can only be mapped once per course.'),
        ('check_skill_points', 'CHECK(skill_points >= 0)',
         'Skill points must be non-negative.'),
        ('check_weight', 'CHECK(weight >= 0 AND weight <= 1)',
         'Weight must be between 0 and 1.'),
    ]

    @api.constrains('min_assessment_score')
    def _check_assessment_score(self):
        """Validate assessment score."""
        for record in self:
            if record.assessment_required:
                if record.min_assessment_score < 0 or record.min_assessment_score > 100:
                    raise ValidationError(_('Assessment score must be between 0 and 100.'))

    def award_skill_to_user(self, user_id):
        """Award this skill to user upon course completion."""
        self.ensure_one()
        
        UserSkill = self.env['seitech.user.skill']
        
        # Check if user already has this skill
        user_skill = UserSkill.search([
            ('user_id', '=', user_id),
            ('skill_id', '=', self.skill_id.id),
        ], limit=1)
        
        level_values = {
            'awareness': 1,
            'foundational': 2,
            'intermediate': 3,
            'advanced': 4,
            'expert': 5,
        }
        
        new_level_value = level_values[self.proficiency_level]
        
        if user_skill:
            # Update if higher level
            current_level_value = level_values[user_skill.current_level]
            if new_level_value > current_level_value:
                user_skill.write({
                    'current_level': self.proficiency_level,
                    'points': user_skill.points + self.skill_points,
                    'last_updated': fields.Datetime.now(),
                })
                # Add course to acquired_through
                user_skill.acquired_through_ids = [(4, self.channel_id.id)]
            else:
                # Just add points
                user_skill.points += self.skill_points
        else:
            # Create new skill
            user_skill = UserSkill.create({
                'user_id': user_id,
                'skill_id': self.skill_id.id,
                'current_level': self.proficiency_level,
                'points': self.skill_points,
                'verified': not self.assessment_required,
                'acquired_through_ids': [(4, self.channel_id.id)],
            })
        
        return user_skill

    @api.model
    def get_courses_teaching_skill(self, skill_id, level=None):
        """Get courses that teach a specific skill at a given level."""
        domain = [('skill_id', '=', skill_id)]
        if level:
            domain.append(('proficiency_level', '=', level))
        
        mappings = self.search(domain)
        return mappings.mapped('channel_id')

    @api.model
    def bulk_map_skills(self, course_id, skill_data):
        """Bulk create course-skill mappings.
        
        Args:
            course_id: ID of the course
            skill_data: List of dicts with keys: skill_id, proficiency_level, is_primary, etc.
        """
        created = self.env['seitech.course.skill']
        for data in skill_data:
            data['channel_id'] = course_id
            created |= self.create(data)
        return created

    def name_get(self):
        """Custom name display."""
        result = []
        for record in self:
            name = f'{record.channel_id.name} - {record.skill_id.name} ({record.proficiency_level})'
            result.append((record.id, name))
        return result
