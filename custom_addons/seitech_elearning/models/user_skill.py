# -*- coding: utf-8 -*-
"""User skill profile model."""
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta


class UserSkill(models.Model):
    """User skill acquisition and proficiency tracking."""
    _name = 'seitech.user.skill'
    _description = 'User Skill Profile'
    _order = 'user_id, current_level desc, points desc, skill_id'

    user_id = fields.Many2one(
        'res.users',
        string='User',
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
    current_level = fields.Selection([
        ('awareness', 'Awareness'),
        ('foundational', 'Foundational'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ], string='Current Level', required=True, default='awareness')
    
    target_level = fields.Selection([
        ('foundational', 'Foundational'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ], string='Target Level')
    
    points = fields.Integer(
        string='Skill Points',
        default=0,
        help='Total points earned for this skill',
    )
    
    progress_percentage = fields.Float(
        string='Progress to Target',
        compute='_compute_progress',
        store=True,
    )
    
    # Verification
    verified = fields.Boolean(
        string='Verified',
        default=False,
        help='Skill verified through assessment',
    )
    verified_date = fields.Datetime(
        string='Verification Date',
    )
    verified_by_id = fields.Many2one(
        'res.users',
        string='Verified By',
    )
    verification_score = fields.Float(
        string='Verification Score',
    )
    
    # Source tracking
    acquired_through_ids = fields.Many2many(
        'slide.channel',
        string='Acquired Through',
        help='Courses that contributed to this skill',
    )
    acquired_count = fields.Integer(
        compute='_compute_acquired_count',
        string='Courses Completed',
        store=True,
    )
    
    # Timestamps
    first_acquired = fields.Datetime(
        string='First Acquired',
        default=fields.Datetime.now,
    )
    last_updated = fields.Datetime(
        string='Last Updated',
        default=fields.Datetime.now,
    )
    last_practiced = fields.Datetime(
        string='Last Practiced',
        help='Last time skill was used/practiced',
    )
    
    # Relations
    user_name = fields.Char(
        related='user_id.name',
        string='User Name',
        store=True,
    )
    skill_name = fields.Char(
        related='skill_id.name',
        string='Skill Name',
        store=True,
    )
    skill_category = fields.Selection(
        related='skill_id.category',
        string='Category',
        store=True,
    )
    
    # Badge
    badge_id = fields.Many2one(
        'gamification.badge',
        string='Badge Earned',
    )
    
    _sql_constraints = [
        ('unique_user_skill', 'UNIQUE(user_id, skill_id)',
         'A user can only have one record per skill.'),
        ('check_points', 'CHECK(points >= 0)',
         'Points must be non-negative.'),
        ('check_verification_score', 'CHECK(verification_score >= 0 AND verification_score <= 100)',
         'Verification score must be between 0 and 100.'),
    ]

    @api.depends('acquired_through_ids')
    def _compute_acquired_count(self):
        """Count courses that contributed to this skill."""
        for record in self:
            record.acquired_count = len(record.acquired_through_ids)

    @api.depends('current_level', 'target_level', 'points')
    def _compute_progress(self):
        """Calculate progress towards target level."""
        level_points = {
            'awareness': 0,
            'foundational': 50,
            'intermediate': 150,
            'advanced': 300,
            'expert': 500,
        }
        
        for record in self:
            if not record.target_level:
                record.progress_percentage = 100.0
                continue
            
            current_points = level_points[record.current_level]
            target_points = level_points[record.target_level]
            
            if target_points <= current_points:
                record.progress_percentage = 100.0
            else:
                # Progress based on points towards target
                points_needed = target_points - current_points
                points_gained = min(record.points, points_needed)
                record.progress_percentage = (points_gained / points_needed) * 100

    @api.constrains('current_level', 'target_level')
    def _check_target_level(self):
        """Ensure target level is higher than current."""
        level_order = ['awareness', 'foundational', 'intermediate', 'advanced', 'expert']
        
        for record in self:
            if record.target_level:
                current_idx = level_order.index(record.current_level)
                target_idx = level_order.index(record.target_level)
                if target_idx <= current_idx:
                    raise ValidationError(_('Target level must be higher than current level.'))

    def action_verify_skill(self, score, verifier_id=None):
        """Mark skill as verified."""
        self.ensure_one()
        
        self.write({
            'verified': True,
            'verified_date': fields.Datetime.now(),
            'verified_by_id': verifier_id or self.env.user.id,
            'verification_score': score,
        })
        
        # Award badge if advanced/expert
        if self.current_level in ['advanced', 'expert']:
            self._award_skill_badge()
        
        return True

    def action_level_up(self):
        """Upgrade skill to next level."""
        self.ensure_one()
        
        level_progression = {
            'awareness': 'foundational',
            'foundational': 'intermediate',
            'intermediate': 'advanced',
            'advanced': 'expert',
        }
        
        if self.current_level == 'expert':
            raise ValidationError(_('Already at maximum skill level.'))
        
        next_level = level_progression[self.current_level]
        self.write({
            'current_level': next_level,
            'last_updated': fields.Datetime.now(),
        })
        
        # Award points for leveling up
        bonus_points = {
            'foundational': 50,
            'intermediate': 100,
            'advanced': 200,
            'expert': 500,
        }
        self.points += bonus_points[next_level]
        
        # Check for badge
        if next_level in ['advanced', 'expert']:
            self._award_skill_badge()
        
        # Notify user
        self.user_id.notify_info(
            message=_('Congratulations! Your %s skill has leveled up to %s!') % (
                self.skill_name, next_level.capitalize()
            )
        )
        
        return True

    def _award_skill_badge(self):
        """Award badge for skill achievement."""
        Badge = self.env['gamification.badge']
        
        # Find or create skill badge
        badge_name = f'{self.skill_name} - {self.current_level.capitalize()}'
        badge = Badge.search([('name', '=', badge_name)], limit=1)
        
        if not badge:
            badge = Badge.create({
                'name': badge_name,
                'description': f'Achieved {self.current_level} level in {self.skill_name}',
                'image': False,  # Would need actual badge images
            })
        
        # Award badge
        self.env['gamification.badge.user'].create({
            'user_id': self.user_id.id,
            'badge_id': badge.id,
            'comment': f'Skill verified at {self.current_level} level',
        })
        
        self.badge_id = badge.id

    def update_last_practiced(self):
        """Update last practice timestamp."""
        self.write({'last_practiced': fields.Datetime.now()})

    @api.model
    def get_skill_gaps(self, user_id, target_skills):
        """Identify skill gaps for a user.
        
        Args:
            user_id: User ID to check
            target_skills: List of (skill_id, level) tuples
            
        Returns:
            List of skills user needs to acquire or improve
        """
        gaps = []
        level_values = {
            'awareness': 1,
            'foundational': 2,
            'intermediate': 3,
            'advanced': 4,
            'expert': 5,
        }
        
        for skill_id, target_level in target_skills:
            user_skill = self.search([
                ('user_id', '=', user_id),
                ('skill_id', '=', skill_id),
            ], limit=1)
            
            if not user_skill:
                # Missing skill
                gaps.append({
                    'skill_id': skill_id,
                    'current_level': None,
                    'target_level': target_level,
                    'gap_size': level_values[target_level],
                })
            else:
                current_value = level_values[user_skill.current_level]
                target_value = level_values[target_level]
                
                if current_value < target_value:
                    # Skill below target
                    gaps.append({
                        'skill_id': skill_id,
                        'current_level': user_skill.current_level,
                        'target_level': target_level,
                        'gap_size': target_value - current_value,
                    })
        
        # Sort by gap size (largest first)
        gaps.sort(key=lambda x: x['gap_size'], reverse=True)
        return gaps

    @api.model
    def get_user_skill_profile(self, user_id):
        """Get comprehensive skill profile for a user."""
        skills = self.search([('user_id', '=', user_id)])
        
        profile = {
            'total_skills': len(skills),
            'verified_skills': len(skills.filtered('verified')),
            'expert_skills': len(skills.filtered(lambda s: s.current_level == 'expert')),
            'advanced_skills': len(skills.filtered(lambda s: s.current_level == 'advanced')),
            'total_points': sum(skills.mapped('points')),
            'categories': {},
        }
        
        # Group by category
        for skill in skills:
            cat = skill.skill_category or 'other'
            if cat not in profile['categories']:
                profile['categories'][cat] = {
                    'count': 0,
                    'verified': 0,
                    'points': 0,
                }
            profile['categories'][cat]['count'] += 1
            if skill.verified:
                profile['categories'][cat]['verified'] += 1
            profile['categories'][cat]['points'] += skill.points
        
        return profile

    def name_get(self):
        """Custom name display."""
        result = []
        for record in self:
            verified = '✓' if record.verified else ''
            name = f'{record.user_name} - {record.skill_name} ({record.current_level}) {verified}'
            result.append((record.id, name))
        return result
