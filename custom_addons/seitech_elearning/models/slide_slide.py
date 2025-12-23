# -*- coding: utf-8 -*-
from odoo import models, fields, api


class SlideSlide(models.Model):
    """Extends slide.slide with additional lesson features."""
    _inherit = 'slide.slide'

    # Slide type extensions (extending existing slide_type field)
    slide_type = fields.Selection(
        selection_add=[
            ('assignment', 'Assignment'),
            ('live_class', 'Live Class'),
            ('downloadable', 'Downloadable Resource'),
        ],
        ondelete={
            'assignment': 'cascade',
            'live_class': 'cascade',
            'downloadable': 'cascade',
        },
    )

    # Assignment link
    assignment_id = fields.Many2one(
        'seitech.assignment',
        string='Assignment',
        help='Linked assignment for this lesson',
    )

    # Live class link
    schedule_id = fields.Many2one(
        'seitech.schedule',
        string='Live Class Schedule',
    )

    # Enhanced video fields
    video_provider = fields.Selection([
        ('youtube', 'YouTube'),
        ('vimeo', 'Vimeo'),
        ('custom', 'Custom Video'),
        ('upload', 'Uploaded Video'),
    ], string='Video Provider')
    video_duration_seconds = fields.Integer(string='Duration (seconds)')
    video_thumbnail = fields.Binary(string='Video Thumbnail', attachment=True)
    enable_captions = fields.Boolean(string='Enable Captions', default=False)
    caption_file = fields.Binary(string='Caption File (VTT)', attachment=True)
    caption_filename = fields.Char(string='Caption Filename')

    # Resources/Attachments
    resource_ids = fields.One2many(
        'seitech.slide.resource',
        'slide_id',
        string='Resources',
    )
    resource_count = fields.Integer(
        string='Resources',
        compute='_compute_resource_count',
    )

    # Completion requirements
    completion_requirement = fields.Selection([
        ('none', 'None'),
        ('view', 'View/Play'),
        ('quiz', 'Pass Quiz'),
        ('assignment', 'Submit Assignment'),
        ('manual', 'Instructor Approval'),
    ], string='Completion Requirement', default='view')
    required_completion_time = fields.Integer(
        string='Min. Time on Page (seconds)',
        default=0,
        help='Minimum time user must spend on page to mark complete',
    )

    # Quiz integration
    survey_id = fields.Many2one(
        'survey.survey',
        string='Quiz',
        help='Quiz associated with this lesson',
    )
    quiz_passing_score = fields.Float(
        string='Passing Score (%)',
        default=70.0,
    )
    quiz_attempts_allowed = fields.Integer(
        string='Attempts Allowed',
        default=0,
        help='0 = unlimited',
    )

    # Notes and bookmarks
    note_ids = fields.One2many(
        'seitech.slide.note',
        'slide_id',
        string='Student Notes',
    )

    # SEO
    meta_title = fields.Char(string='Meta Title')
    meta_description = fields.Text(string='Meta Description')

    # Instructor notes
    instructor_notes = fields.Html(string='Instructor Notes')

    # Preview
    is_preview = fields.Boolean(
        string='Free Preview',
        default=False,
        help='Allow non-enrolled users to preview this lesson',
    )

    @api.depends('resource_ids')
    def _compute_resource_count(self):
        for slide in self:
            slide.resource_count = len(slide.resource_ids)

    def action_view_resources(self):
        """View resources attached to this lesson."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Resources - {self.name}',
            'res_model': 'seitech.slide.resource',
            'view_mode': 'list,form',
            'domain': [('slide_id', '=', self.id)],
            'context': {'default_slide_id': self.id},
        }

    def check_quiz_completion(self, user_id):
        """Check if user has passed the quiz for this slide.
        
        Args:
            user_id: ID of the user
        
        Returns:
            dict with quiz status: passed, score, attempts
        """
        self.ensure_one()
        if not self.survey_id:
            return {'has_quiz': False}

        user = self.env['res.users'].browse(user_id)
        UserInput = self.env['survey.user_input']

        # Get all quiz attempts by this user
        attempts = UserInput.search([
            ('survey_id', '=', self.survey_id.id),
            ('partner_id', '=', user.partner_id.id),
            ('state', '=', 'done'),
        ], order='create_date desc')

        if not attempts:
            return {
                'has_quiz': True,
                'passed': False,
                'attempts_used': 0,
                'attempts_remaining': self.quiz_attempts_allowed or -1,  # -1 = unlimited
                'best_score': 0,
            }

        best_attempt = max(attempts, key=lambda a: a.scoring_percentage or 0)
        passed = (best_attempt.scoring_percentage or 0) >= self.quiz_passing_score

        attempts_remaining = -1
        if self.quiz_attempts_allowed > 0:
            attempts_remaining = max(0, self.quiz_attempts_allowed - len(attempts))

        return {
            'has_quiz': True,
            'passed': passed,
            'attempts_used': len(attempts),
            'attempts_remaining': attempts_remaining,
            'best_score': best_attempt.scoring_percentage or 0,
            'last_attempt_id': attempts[0].id if attempts else None,
        }

    def _handle_quiz_passed(self, user_id, score):
        """Handle gamification awards when quiz is passed.
        
        Args:
            user_id: ID of the user
            score: The score achieved (0-100)
        """
        self.ensure_one()
        PointsModel = self.env['seitech.student.points']
        Badge = self.env['seitech.badge']

        # Check if already awarded for this quiz
        existing = PointsModel.search([
            ('user_id', '=', user_id),
            ('slide_id', '=', self.id),
            ('activity_type', '=', 'quiz_pass'),
        ], limit=1)

        if not existing:
            # Award base points for passing quiz
            PointsModel.award_points(
                user_id=user_id,
                points=25,
                activity_type='quiz_pass',
                description=f'Passed quiz: {self.name}',
                slide_id=self.id,
                channel_id=self.channel_id.id,
            )

            # Award bonus for perfect score
            if score >= 100:
                PointsModel.award_points(
                    user_id=user_id,
                    points=25,  # Bonus for perfect
                    activity_type='quiz_perfect',
                    description=f'Perfect score on: {self.name}',
                    slide_id=self.id,
                    channel_id=self.channel_id.id,
                )

            # Check for quiz-related badges
            Badge.check_and_award_badges(
                user_id=user_id,
                trigger_type='quizzes_passed',
                channel_id=self.channel_id.id,
            )


class SlideResource(models.Model):
    """Downloadable resources attached to lessons."""
    _name = 'seitech.slide.resource'
    _description = 'Lesson Resource'
    _order = 'sequence, id'

    name = fields.Char(string='Name', required=True)
    slide_id = fields.Many2one(
        'slide.slide',
        string='Lesson',
        required=True,
        ondelete='cascade',
    )
    sequence = fields.Integer(string='Sequence', default=10)
    resource_type = fields.Selection([
        ('document', 'Document'),
        ('link', 'External Link'),
        ('code', 'Code Sample'),
        ('template', 'Template'),
        ('other', 'Other'),
    ], string='Type', default='document', required=True)
    file = fields.Binary(string='File', attachment=True)
    filename = fields.Char(string='Filename')
    url = fields.Char(string='URL')
    description = fields.Text(string='Description')
    download_count = fields.Integer(string='Downloads', default=0)


class SlideNote(models.Model):
    """Student notes on lessons."""
    _name = 'seitech.slide.note'
    _description = 'Student Note'
    _order = 'create_date desc'

    slide_id = fields.Many2one(
        'slide.slide',
        string='Lesson',
        required=True,
        ondelete='cascade',
    )
    user_id = fields.Many2one(
        'res.users',
        string='User',
        required=True,
        default=lambda self: self.env.user,
    )
    content = fields.Text(string='Note', required=True)
    timestamp = fields.Integer(
        string='Video Timestamp (seconds)',
        help='Video position when note was created',
    )
    is_private = fields.Boolean(string='Private', default=True)
