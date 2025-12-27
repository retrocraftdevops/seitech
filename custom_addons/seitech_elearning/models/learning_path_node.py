# -*- coding: utf-8 -*-
"""Learning path node model representing courses in a learning path."""
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError


class LearningPathNode(models.Model):
    """Individual course node in a learning path."""
    _name = 'seitech.learning.path.node'
    _description = 'Learning Path Node'
    _order = 'path_id, sequence, id'

    path_id = fields.Many2one(
        'seitech.learning.path',
        string='Learning Path',
        required=True,
        ondelete='cascade',
        index=True,
    )
    user_id = fields.Many2one(
        'res.users',
        string='Learner',
        related='path_id.user_id',
        store=True,
        index=True,
    )
    
    channel_id = fields.Many2one(
        'slide.channel',
        string='Course',
        required=True,
        ondelete='cascade',
    )
    
    sequence = fields.Integer(
        string='Sequence',
        default=10,
        help='Order in the learning path',
    )
    
    # Node configuration
    node_type = fields.Selection([
        ('required', 'Required'),
        ('optional', 'Optional'),
        ('assessment', 'Assessment'),
        ('milestone', 'Milestone'),
    ], string='Type', default='required', required=True)
    
    description = fields.Text(
        string='Notes',
        help='Optional notes about why this course is included',
    )
    
    # Prerequisite handling
    prerequisite_node_ids = fields.Many2many(
        'seitech.learning.path.node',
        'path_node_prerequisite_rel',
        'node_id',
        'prerequisite_id',
        string='Prerequisite Courses',
        help='Courses that must be completed before this one',
    )
    dependent_node_ids = fields.Many2many(
        'seitech.learning.path.node',
        'path_node_prerequisite_rel',
        'prerequisite_id',
        'node_id',
        string='Unlocks Courses',
        help='Courses unlocked after completing this one',
    )
    
    # Unlock mechanism
    is_unlocked = fields.Boolean(
        string='Unlocked',
        compute='_compute_is_unlocked',
        store=True,
        help='Whether the course is available to start',
    )
    unlock_date = fields.Date(
        string='Unlock Date',
        compute='_compute_unlock_date',
        store=True,
        help='Date when course becomes available',
    )
    
    # Completion tracking
    is_completed = fields.Boolean(
        string='Completed',
        compute='_compute_completion',
        store=True,
    )
    completion_date = fields.Datetime(
        string='Completed On',
        compute='_compute_completion',
        store=True,
    )
    completion_percentage = fields.Float(
        string='Progress',
        compute='_compute_completion',
        store=True,
    )
    
    # Enrollment link
    enrollment_id = fields.Many2one(
        'seitech.enrollment',
        string='Enrollment',
        compute='_compute_enrollment',
        store=True,
    )
    enrollment_state = fields.Selection(
        string='Enrollment Status',
        related='enrollment_id.state',
    )
    
    # Time estimates
    estimated_hours = fields.Float(
        string='Est. Hours',
        related='channel_id.total_time',
        help='Estimated hours to complete',
    )
    time_spent = fields.Float(
        string='Time Spent',
        compute='_compute_time_spent',
        help='Actual time spent (hours)',
    )
    
    # AI metadata
    ai_reason = fields.Char(
        string='AI Recommendation Reason',
        help='Why AI recommended this course',
    )
    ai_confidence = fields.Float(
        string='AI Confidence',
        help='AI confidence score (0-1)',
    )
    
    # Deadline (optional)
    deadline = fields.Date(
        string='Deadline',
        help='Optional deadline for completing this course',
    )
    
    _sql_constraints = [
        ('unique_path_channel', 'UNIQUE(path_id, channel_id)',
         'A course can only appear once in a learning path.'),
    ]

    @api.depends('prerequisite_node_ids', 'prerequisite_node_ids.is_completed')
    def _compute_is_unlocked(self):
        """Check if all prerequisites are completed."""
        for node in self:
            if not node.prerequisite_node_ids:
                node.is_unlocked = True
            else:
                # All prerequisites must be completed
                node.is_unlocked = all(prereq.is_completed for prereq in node.prerequisite_node_ids)

    @api.depends('prerequisite_node_ids', 'prerequisite_node_ids.completion_date', 'path_id.start_date')
    def _compute_unlock_date(self):
        """Calculate when course will be unlocked."""
        for node in self:
            if not node.prerequisite_node_ids:
                node.unlock_date = node.path_id.start_date or fields.Date.today()
            else:
                # Get latest prerequisite completion date
                prereq_dates = node.prerequisite_node_ids.filtered(
                    lambda n: n.completion_date
                ).mapped('completion_date')
                
                if prereq_dates:
                    node.unlock_date = max(prereq_dates).date()
                elif all(node.prerequisite_node_ids.mapped('is_completed')):
                    node.unlock_date = fields.Date.today()
                else:
                    node.unlock_date = False

    @api.depends('user_id', 'channel_id')
    def _compute_enrollment(self):
        """Find related enrollment."""
        for node in self:
            if node.user_id and node.channel_id:
                enrollment = self.env['seitech.enrollment'].search([
                    ('user_id', '=', node.user_id.id),
                    ('channel_id', '=', node.channel_id.id),
                ], limit=1, order='create_date desc')
                node.enrollment_id = enrollment
            else:
                node.enrollment_id = False

    @api.depends('enrollment_id', 'enrollment_id.state', 'enrollment_id.completion_percentage')
    def _compute_completion(self):
        """Calculate completion status."""
        for node in self:
            if node.enrollment_id:
                node.is_completed = node.enrollment_id.state == 'completed'
                node.completion_date = node.enrollment_id.completion_date if node.is_completed else False
                node.completion_percentage = node.enrollment_id.completion_percentage
            else:
                node.is_completed = False
                node.completion_date = False
                node.completion_percentage = 0.0

    def _compute_time_spent(self):
        """Calculate time spent on course."""
        for node in self:
            if node.enrollment_id:
                node.time_spent = node.enrollment_id.time_spent / 60.0  # Convert minutes to hours
            else:
                node.time_spent = 0.0

    @api.constrains('prerequisite_node_ids')
    def _check_prerequisite_cycle(self):
        """Prevent circular prerequisite dependencies."""
        for node in self:
            if node in node.prerequisite_node_ids:
                raise ValidationError(_('A node cannot be its own prerequisite.'))
            
            # Check same path
            if any(prereq.path_id != node.path_id for prereq in node.prerequisite_node_ids):
                raise ValidationError(_('Prerequisites must be from the same learning path.'))
            
            # Check for cycles using DFS
            visited = set()
            def has_cycle(current_node):
                if current_node.id in visited:
                    return True
                visited.add(current_node.id)
                for prereq in current_node.prerequisite_node_ids:
                    if has_cycle(prereq):
                        return True
                visited.remove(current_node.id)
                return False
            
            if has_cycle(node):
                raise ValidationError(_('Circular prerequisite dependency detected.'))

    @api.constrains('deadline', 'path_id.target_completion_date')
    def _check_deadline(self):
        """Ensure node deadline is before path deadline."""
        for node in self:
            if node.deadline and node.path_id.target_completion_date:
                if node.deadline > node.path_id.target_completion_date:
                    raise ValidationError(
                        _('Course deadline cannot be after path target completion date.')
                    )

    def action_enroll(self):
        """Enroll user in this course."""
        self.ensure_one()
        
        if not self.is_unlocked:
            raise UserError(_('This course is locked. Complete prerequisites first.'))
        
        # Check if already enrolled
        if self.enrollment_id:
            if self.enrollment_id.state in ('active', 'completed'):
                raise UserError(_('You are already enrolled in this course.'))
            elif self.enrollment_id.state == 'cancelled':
                # Reactivate cancelled enrollment
                self.enrollment_id.state = 'active'
                return self.enrollment_id
        
        # Create new enrollment
        enrollment_vals = {
            'user_id': self.user_id.id,
            'channel_id': self.channel_id.id,
            'enrollment_type': 'free' if not self.channel_id.is_paid else 'paid',
        }
        
        # Auto-activate if free course
        if not self.channel_id.is_paid:
            enrollment_vals['state'] = 'active'
        
        enrollment = self.env['seitech.enrollment'].create(enrollment_vals)
        
        # Activate enrollment if free
        if not self.channel_id.is_paid:
            enrollment.action_activate()
        
        # Update last activity
        self.path_id.last_activity_date = fields.Datetime.now()
        
        return enrollment

    def action_view_course(self):
        """Open course details."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': self.channel_id.name,
            'res_model': 'slide.channel',
            'res_id': self.channel_id.id,
            'view_mode': 'form',
            'target': 'current',
        }

    def action_view_enrollment(self):
        """Open enrollment details."""
        self.ensure_one()
        if not self.enrollment_id:
            raise UserError(_('No enrollment found for this course.'))
        
        return {
            'type': 'ir.actions.act_window',
            'name': _('Enrollment'),
            'res_model': 'seitech.enrollment',
            'res_id': self.enrollment_id.id,
            'view_mode': 'form',
            'target': 'current',
        }

    def action_mark_complete(self):
        """Manually mark as complete (for milestones/assessments)."""
        self.ensure_one()
        
        if self.node_type not in ('milestone', 'assessment'):
            raise UserError(_('Only milestone and assessment nodes can be manually completed.'))
        
        if not self.enrollment_id:
            raise UserError(_('No enrollment found. Enroll in the course first.'))
        
        if self.enrollment_id.state != 'completed':
            self.enrollment_id.action_complete()
        
        # Check if path should be completed
        if self.path_id.progress_percentage >= 100:
            self.path_id.action_complete()
        
        return True

    def action_unlock_override(self):
        """Admin override to unlock node regardless of prerequisites."""
        self.ensure_one()
        
        if not self.env.user.has_group('seitech_elearning.group_elearning_manager'):
            raise UserError(_('Only administrators can override prerequisites.'))
        
        # Create a note about the override
        self.path_id.message_post(
            body=_('Course "%s" manually unlocked by %s') % (self.channel_id.name, self.env.user.name),
            subject=_('Override Applied'),
        )
        
        # Temporarily remove prerequisites
        self.prerequisite_node_ids = [(5, 0, 0)]
        
        return True

    def action_set_deadline(self):
        """Open wizard to set deadline."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Set Deadline'),
            'res_model': 'seitech.learning.path.node',
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
            'views': [(False, 'form')],
            'context': {'form_view_initial_mode': 'edit'},
        }

    @api.model
    def check_overdue_deadlines(self):
        """Cron job to check overdue node deadlines and send notifications."""
        today = fields.Date.today()
        
        # Find overdue nodes
        overdue_nodes = self.search([
            ('deadline', '<', today),
            ('is_completed', '=', False),
            ('path_id.state', '=', 'active'),
        ])
        
        # Group by user
        user_nodes = {}
        for node in overdue_nodes:
            if node.user_id.id not in user_nodes:
                user_nodes[node.user_id.id] = []
            user_nodes[node.user_id.id].append(node)
        
        # Send notifications
        for user_id, nodes in user_nodes.items():
            user = self.env['res.users'].browse(user_id)
            body = _('You have %d overdue courses in your learning paths:') % len(nodes)
            body += '<ul>'
            for node in nodes:
                body += f'<li>{node.channel_id.name} (Due: {node.deadline})</li>'
            body += '</ul>'
            
            # Send email
            self.env['mail.mail'].create({
                'subject': 'Overdue Learning Path Courses',
                'body_html': body,
                'email_to': user.email,
                'auto_delete': True,
            }).send()
        
        return True

    def name_get(self):
        """Custom name display."""
        result = []
        for node in self:
            name = f'{node.channel_id.name}'
            if node.node_type != 'required':
                name += f' ({dict(node._fields["node_type"].selection)[node.node_type]})'
            result.append((node.id, name))
        return result
