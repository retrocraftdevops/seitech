# -*- coding: utf-8 -*-
"""Learning path models for personalized learning journeys."""
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError
from datetime import datetime, timedelta
import json
import logging

_logger = logging.getLogger(__name__)


class LearningPath(models.Model):
    """Personalized learning path for users."""
    _name = 'seitech.learning.path'
    _description = 'Learning Path'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char(
        string='Path Name',
        required=True,
        tracking=True,
    )
    user_id = fields.Many2one(
        'res.users',
        string='Learner',
        required=True,
        default=lambda self: self.env.user,
        index=True,
        tracking=True,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Contact',
        related='user_id.partner_id',
        store=True,
    )

    # Path configuration
    path_type = fields.Selection([
        ('auto', 'AI Generated'),
        ('manual', 'Manual'),
        ('career', 'Career Path'),
        ('certification', 'Certification Track'),
        ('template', 'From Template'),
    ], string='Type', default='manual', required=True, tracking=True)
    
    description = fields.Html(
        string='Description',
        help='Detailed description of the learning path',
    )
    goal_description = fields.Text(
        string='Learning Goal',
        help='User\'s stated learning objective',
    )

    # Timeline
    target_completion_date = fields.Date(
        string='Target Completion',
        tracking=True,
    )
    weekly_commitment_hours = fields.Integer(
        string='Weekly Hours',
        default=5,
        help='Expected hours per week dedicated to learning',
    )
    start_date = fields.Date(
        string='Start Date',
        default=fields.Date.today,
    )

    # Learning preferences
    learning_style = fields.Selection([
        ('visual', 'Visual Learner'),
        ('reading', 'Reading/Writing'),
        ('kinesthetic', 'Hands-on/Kinesthetic'),
        ('auditory', 'Audio/Video'),
        ('mixed', 'Mixed Style'),
    ], string='Learning Style', default='mixed')
    
    difficulty_preference = fields.Selection([
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('adaptive', 'Adaptive (Start Easy, Progress)'),
    ], string='Difficulty Preference', default='adaptive')

    # State
    state = fields.Selection([
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    ], string='Status', default='draft', required=True, tracking=True)

    # Relations
    node_ids = fields.One2many(
        'seitech.learning.path.node',
        'path_id',
        string='Path Nodes',
    )
    skill_goal_ids = fields.Many2many(
        'seitech.skill',
        'learning_path_skill_goal_rel',
        'path_id',
        'skill_id',
        string='Target Skills',
        help='Skills to acquire through this path',
    )
    prerequisite_path_ids = fields.Many2many(
        'seitech.learning.path',
        'learning_path_prerequisite_rel',
        'path_id',
        'prerequisite_id',
        string='Prerequisite Paths',
    )

    # Progress tracking
    progress_percentage = fields.Float(
        string='Progress (%)',
        compute='_compute_progress',
        store=True,
        group_operator='avg',
    )
    completed_nodes = fields.Integer(
        string='Completed Courses',
        compute='_compute_progress',
        store=True,
    )
    total_nodes = fields.Integer(
        string='Total Courses',
        compute='_compute_progress',
        store=True,
    )

    # Time estimates
    estimated_hours_total = fields.Float(
        string='Total Hours',
        compute='_compute_estimates',
        store=True,
        help='Total estimated hours to complete path',
    )
    estimated_completion_date = fields.Date(
        string='Estimated Completion',
        compute='_compute_estimates',
        store=True,
    )
    hours_spent = fields.Float(
        string='Hours Spent',
        compute='_compute_time_spent',
        help='Actual hours spent on path courses',
    )

    # Analytics
    last_activity_date = fields.Datetime(
        string='Last Activity',
        help='Last time user interacted with path',
    )
    completion_date = fields.Datetime(
        string='Completed On',
        readonly=True,
    )

    # AI generation metadata
    ai_generated = fields.Boolean(
        string='AI Generated',
        default=False,
    )
    ai_confidence_score = fields.Float(
        string='AI Confidence',
        help='Confidence score of AI path generation (0-1)',
    )
    generation_context = fields.Text(
        string='Generation Context',
        help='JSON data used for AI generation',
    )

    # Template
    is_template = fields.Boolean(
        string='Is Template',
        default=False,
        help='Can be used as template by others',
    )
    template_category = fields.Selection([
        ('health_safety', 'Health & Safety'),
        ('management', 'Management'),
        ('technical', 'Technical Skills'),
        ('compliance', 'Compliance'),
        ('leadership', 'Leadership'),
        ('other', 'Other'),
    ], string='Template Category')

    _sql_constraints = [
        ('check_weekly_hours', 'CHECK(weekly_commitment_hours > 0 AND weekly_commitment_hours <= 168)',
         'Weekly hours must be between 1 and 168'),
        ('check_progress', 'CHECK(progress_percentage >= 0 AND progress_percentage <= 100)',
         'Progress must be between 0 and 100'),
    ]

    @api.depends('node_ids', 'node_ids.is_completed', 'node_ids.node_type')
    def _compute_progress(self):
        """Calculate path completion progress."""
        for path in self:
            nodes = path.node_ids.filtered(lambda n: n.node_type in ('required', 'optional'))
            required_nodes = nodes.filtered(lambda n: n.node_type == 'required')
            
            path.total_nodes = len(nodes)
            if not nodes:
                path.completed_nodes = 0
                path.progress_percentage = 0.0
                continue
            
            completed = nodes.filtered(lambda n: n.is_completed)
            path.completed_nodes = len(completed)
            
            # Weight required courses more heavily
            if required_nodes:
                required_completed = sum(1 for n in completed if n.node_type == 'required')
                required_weight = 0.8
                optional_weight = 0.2
                
                required_progress = (required_completed / len(required_nodes)) * required_weight
                optional_nodes = nodes - required_nodes
                optional_progress = 0
                if optional_nodes:
                    optional_completed = len(completed - required_nodes.filtered(lambda n: n.is_completed))
                    optional_progress = (optional_completed / len(optional_nodes)) * optional_weight
                
                path.progress_percentage = (required_progress + optional_progress) * 100
            else:
                path.progress_percentage = (len(completed) / len(nodes)) * 100

    @api.depends('node_ids', 'node_ids.channel_id.slide_ids', 'weekly_commitment_hours', 'start_date')
    def _compute_estimates(self):
        """Calculate estimated completion time."""
        for path in self:
            total_hours = 0.0
            for node in path.node_ids:
                if node.channel_id:
                    # Sum lesson durations
                    for slide in node.channel_id.slide_ids:
                        total_hours += slide.completion_time or 0.25  # Default 15 min
            
            path.estimated_hours_total = total_hours
            
            # Calculate completion date
            if path.weekly_commitment_hours and path.start_date:
                weeks_needed = total_hours / path.weekly_commitment_hours
                path.estimated_completion_date = path.start_date + timedelta(weeks=weeks_needed)
            else:
                path.estimated_completion_date = False

    def _compute_time_spent(self):
        """Calculate actual time spent on path courses."""
        for path in self:
            total_minutes = 0
            enrollments = self.env['seitech.enrollment'].search([
                ('user_id', '=', path.user_id.id),
                ('channel_id', 'in', path.node_ids.mapped('channel_id').ids),
            ])
            total_minutes = sum(enrollments.mapped('time_spent'))
            path.hours_spent = total_minutes / 60.0

    @api.constrains('prerequisite_path_ids')
    def _check_prerequisite_cycle(self):
        """Prevent circular prerequisite dependencies."""
        for path in self:
            if path in path.prerequisite_path_ids:
                raise ValidationError(_('A learning path cannot be its own prerequisite.'))
            
            # Check for cycles using DFS
            visited = set()
            def has_cycle(current_path):
                if current_path.id in visited:
                    return True
                visited.add(current_path.id)
                for prereq in current_path.prerequisite_path_ids:
                    if has_cycle(prereq):
                        return True
                visited.remove(current_path.id)
                return False
            
            if has_cycle(path):
                raise ValidationError(_('Circular prerequisite dependency detected.'))

    def action_activate(self):
        """Activate the learning path."""
        self.ensure_one()
        if not self.node_ids:
            raise UserError(_('Cannot activate an empty learning path. Please add courses first.'))
        
        self.write({
            'state': 'active',
            'start_date': self.start_date or fields.Date.today(),
        })
        
        # Auto-enroll in first unlocked course
        unlocked_nodes = self.node_ids.filtered(lambda n: n.is_unlocked and not n.is_completed)
        if unlocked_nodes:
            first_node = unlocked_nodes.sorted('sequence')[0]
            first_node.action_enroll()
        
        # Send activation notification
        self.message_post(
            body=_('Learning path activated. Good luck on your learning journey!'),
            subject=_('Path Activated'),
            message_type='notification',
        )
        return True

    def action_complete(self):
        """Mark path as completed."""
        self.ensure_one()
        if self.progress_percentage < 100:
            raise UserError(_('Path is not yet fully completed.'))
        
        self.write({
            'state': 'completed',
            'completion_date': fields.Datetime.now(),
        })
        
        # Award completion points
        self.env['seitech.student.points'].award_points(
            user_id=self.user_id.id,
            points=200,
            activity_type='manual',
            description=f'Completed learning path: {self.name}',
        )
        
        # Check for badges
        self._check_path_badges()
        
        return True

    def action_hold(self):
        """Put path on hold."""
        self.write({'state': 'on_hold'})

    def action_resume(self):
        """Resume path from hold."""
        self.write({'state': 'active'})

    def action_archive_path(self):
        """Archive the path."""
        self.write({'state': 'archived'})

    def generate_ai_path(self):
        """Generate AI-powered learning path based on user goals and skills."""
        self.ensure_one()
        
        if not self.goal_description and not self.skill_goal_ids:
            raise UserError(_('Please specify your learning goal or target skills to generate an AI path.'))
        
        # Get user's current skill profile
        user_skills = self.env['seitech.user.skill'].search([
            ('user_id', '=', self.user_id.id)
        ])
        
        # Get user's enrollment history
        completed_courses = self.env['seitech.enrollment'].search([
            ('user_id', '=', self.user_id.id),
            ('state', '=', 'completed'),
        ]).mapped('channel_id')
        
        # Build context
        context = {
            'user_id': self.user_id.id,
            'goal': self.goal_description,
            'target_skills': self.skill_goal_ids.mapped('name'),
            'current_skills': [(s.skill_id.name, s.current_level) for s in user_skills],
            'completed_courses': completed_courses.mapped('name'),
            'learning_style': self.learning_style,
            'difficulty_preference': self.difficulty_preference,
            'weekly_hours': self.weekly_commitment_hours,
        }
        
        # Call AI generation algorithm
        recommended_courses = self._ai_recommend_courses(context)
        
        # Create path nodes
        sequence = 10
        for course_data in recommended_courses:
            self.env['seitech.learning.path.node'].create({
                'path_id': self.id,
                'channel_id': course_data['course_id'],
                'sequence': sequence,
                'node_type': course_data.get('type', 'required'),
                'ai_reason': course_data.get('reason', ''),
            })
            sequence += 10
        
        self.write({
            'ai_generated': True,
            'ai_confidence_score': recommended_courses[0].get('confidence', 0.8) if recommended_courses else 0,
            'generation_context': json.dumps(context),
            'path_type': 'auto',
        })
        
        self.message_post(
            body=_('AI has generated %d course recommendations for your learning path.') % len(recommended_courses),
            subject=_('AI Path Generated'),
        )
        
        return True

    def _ai_recommend_courses(self, context):
        """AI algorithm to recommend courses based on context.
        
        Returns list of dicts: [{'course_id': int, 'type': str, 'reason': str, 'confidence': float}]
        """
        recommended = []
        
        # 1. Find courses that teach target skills
        if context.get('target_skills'):
            skill_courses = self.env['seitech.course.skill'].search([
                ('skill_id.name', 'in', context['target_skills']),
                ('channel_id.is_published', '=', True),
                ('channel_id', 'not in', [c.id for c in context.get('completed_courses', [])]),
            ])
            
            for cs in skill_courses:
                recommended.append({
                    'course_id': cs.channel_id.id,
                    'type': 'required',
                    'reason': f'Teaches {cs.skill_id.name} ({cs.proficiency_level})',
                    'confidence': 0.9,
                })
        
        # 2. Find courses in similar categories
        if context.get('completed_courses'):
            categories = context['completed_courses'].mapped('seitech_category_id')
            similar_courses = self.env['slide.channel'].search([
                ('seitech_category_id', 'in', categories.ids),
                ('is_published', '=', True),
                ('id', 'not in', context.get('completed_courses', []).ids),
            ], limit=5)
            
            for course in similar_courses:
                if course.id not in [r['course_id'] for r in recommended]:
                    recommended.append({
                        'course_id': course.id,
                        'type': 'optional',
                        'reason': 'Based on your completed courses',
                        'confidence': 0.7,
                    })
        
        # 3. Match difficulty preference
        difficulty_map = {
            'beginner': 'beginner',
            'intermediate': 'intermediate',
            'advanced': 'advanced',
            'adaptive': 'beginner',  # Start with beginner for adaptive
        }
        
        # Filter and sort by confidence
        recommended = sorted(recommended, key=lambda x: x['confidence'], reverse=True)
        
        return recommended[:15]  # Return top 15 recommendations

    def recalculate_path(self):
        """Recalculate path based on current progress."""
        self.ensure_one()
        
        # Check if user is falling behind or ahead
        if self.target_completion_date:
            today = fields.Date.today()
            days_remaining = (self.target_completion_date - today).days
            
            if days_remaining < 0:
                # Already past deadline
                self.message_post(
                    body=_('You have passed your target completion date. Consider adjusting your timeline.'),
                    subject=_('Timeline Update'),
                )
            else:
                # Calculate if on track
                required_pace = (100 - self.progress_percentage) / days_remaining if days_remaining > 0 else 100
                current_pace = self.progress_percentage / max((today - self.start_date).days, 1)
                
                if required_pace > current_pace * 1.5:
                    # Falling behind significantly
                    self.message_post(
                        body=_('You may be falling behind schedule. Consider increasing your weekly hours or adjusting your timeline.'),
                        subject=_('Pace Check'),
                    )
        
        # Unlock next courses
        for node in self.node_ids.filtered(lambda n: not n.is_unlocked):
            node._compute_is_unlocked()
        
        return True

    def get_next_action(self):
        """Get next recommended action for user."""
        self.ensure_one()
        
        # Find next unlocked incomplete course
        next_nodes = self.node_ids.filtered(
            lambda n: n.is_unlocked and not n.is_completed
        ).sorted('sequence')
        
        if not next_nodes:
            if self.progress_percentage >= 100:
                return {
                    'action': 'complete',
                    'message': 'Congratulations! Complete your learning path.',
                    'course_id': False,
                }
            else:
                return {
                    'action': 'wait',
                    'message': 'Complete current courses to unlock more.',
                    'course_id': False,
                }
        
        next_node = next_nodes[0]
        
        # Check if already enrolled
        enrollment = self.env['seitech.enrollment'].search([
            ('user_id', '=', self.user_id.id),
            ('channel_id', '=', next_node.channel_id.id),
        ], limit=1)
        
        if enrollment and enrollment.state == 'active':
            return {
                'action': 'continue',
                'message': f'Continue learning: {next_node.channel_id.name}',
                'course_id': next_node.channel_id.id,
                'enrollment_id': enrollment.id,
            }
        else:
            return {
                'action': 'enroll',
                'message': f'Start next course: {next_node.channel_id.name}',
                'course_id': next_node.channel_id.id,
                'node_id': next_node.id,
            }

    def clone_as_template(self):
        """Clone this path as a template for others."""
        self.ensure_one()
        
        template = self.copy({
            'name': f'{self.name} (Template)',
            'user_id': self.env.user.id,
            'is_template': True,
            'state': 'draft',
            'progress_percentage': 0,
            'ai_generated': False,
        })
        
        return {
            'type': 'ir.actions.act_window',
            'name': _('Path Template'),
            'res_model': 'seitech.learning.path',
            'res_id': template.id,
            'view_mode': 'form',
            'target': 'current',
        }

    def _check_path_badges(self):
        """Check and award badges for path completion."""
        Badge = self.env['seitech.badge']
        
        # Check for path completion badges
        if self.path_type == 'certification':
            badge = Badge.search([('code', '=', 'certification_path_complete')], limit=1)
            if badge:
                badge.award_to_user(self.user_id.id)
        
        # Check for multiple path completions
        completed_paths = self.search_count([
            ('user_id', '=', self.user_id.id),
            ('state', '=', 'completed'),
        ])
        
        if completed_paths >= 5:
            badge = Badge.search([('code', '=', 'path_master')], limit=1)
            if badge:
                badge.award_to_user(self.user_id.id)

    def action_view_nodes(self):
        """View path nodes."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Path Courses'),
            'res_model': 'seitech.learning.path.node',
            'view_mode': 'tree,form',
            'domain': [('path_id', '=', self.id)],
            'context': {'default_path_id': self.id},
        }
