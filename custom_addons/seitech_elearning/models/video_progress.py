# -*- coding: utf-8 -*-
"""Video progress tracking for lessons."""
from odoo import models, fields, api, _
from datetime import datetime


class VideoProgress(models.Model):
    """Track video watching progress per user per lesson."""
    _name = 'seitech.video.progress'
    _description = 'Video Progress'
    _order = 'write_date desc'

    slide_id = fields.Many2one(
        'slide.slide',
        string='Lesson',
        required=True,
        ondelete='cascade',
        index=True,
    )
    user_id = fields.Many2one(
        'res.users',
        string='User',
        required=True,
        ondelete='cascade',
        index=True,
    )
    channel_id = fields.Many2one(
        'slide.channel',
        string='Course',
        related='slide_id.channel_id',
        store=True,
    )

    # Progress data
    current_position = fields.Integer(
        string='Current Position (seconds)',
        default=0,
        help='Last watched position in seconds',
    )
    max_position = fields.Integer(
        string='Maximum Position (seconds)',
        default=0,
        help='Furthest point watched',
    )
    video_duration = fields.Integer(
        string='Video Duration (seconds)',
        default=0,
    )
    watch_percentage = fields.Float(
        string='Watch %',
        compute='_compute_watch_percentage',
        store=True,
    )

    # Time tracking
    total_watch_time = fields.Integer(
        string='Total Watch Time (seconds)',
        default=0,
        help='Cumulative time spent watching',
    )
    session_count = fields.Integer(
        string='Session Count',
        default=0,
        help='Number of times video was accessed',
    )
    first_watch_date = fields.Datetime(
        string='First Watch',
        readonly=True,
    )
    last_watch_date = fields.Datetime(
        string='Last Watch',
        readonly=True,
    )

    # Completion
    is_completed = fields.Boolean(
        string='Completed',
        default=False,
        help='True when user has watched required percentage',
    )
    completion_date = fields.Datetime(
        string='Completion Date',
    )
    completion_threshold = fields.Float(
        string='Completion Threshold %',
        default=80.0,
        help='Percentage required to mark as complete',
    )

    # Playback preferences (remembered for user)
    playback_speed = fields.Float(
        string='Playback Speed',
        default=1.0,
    )
    preferred_quality = fields.Selection([
        ('auto', 'Auto'),
        ('1080p', '1080p'),
        ('720p', '720p'),
        ('480p', '480p'),
        ('360p', '360p'),
    ], string='Preferred Quality', default='auto')
    captions_enabled = fields.Boolean(
        string='Captions Enabled',
        default=False,
    )

    _sql_constraints = [
        ('unique_user_slide', 'UNIQUE(user_id, slide_id)',
         'Progress record must be unique per user per lesson.'),
    ]

    @api.depends('max_position', 'video_duration')
    def _compute_watch_percentage(self):
        for record in self:
            if record.video_duration > 0:
                record.watch_percentage = min(
                    (record.max_position / record.video_duration) * 100,
                    100.0
                )
            else:
                record.watch_percentage = 0.0

    @api.model
    def update_progress(self, slide_id, position, duration=None):
        """Update video progress for current user.
        
        Args:
            slide_id: ID of the slide/lesson
            position: Current video position in seconds
            duration: Total video duration (optional, for first call)
        
        Returns:
            dict with progress data
        """
        user_id = self.env.user.id
        progress = self.search([
            ('slide_id', '=', slide_id),
            ('user_id', '=', user_id),
        ], limit=1)

        now = fields.Datetime.now()

        if not progress:
            # Create new progress record
            vals = {
                'slide_id': slide_id,
                'user_id': user_id,
                'current_position': position,
                'max_position': position,
                'video_duration': duration or 0,
                'first_watch_date': now,
                'last_watch_date': now,
                'session_count': 1,
            }
            progress = self.create(vals)
        else:
            # Update existing progress
            vals = {
                'current_position': position,
                'last_watch_date': now,
            }
            if position > progress.max_position:
                vals['max_position'] = position
            if duration and duration != progress.video_duration:
                vals['video_duration'] = duration
            
            # Increment session if last watch was > 30 min ago
            if progress.last_watch_date:
                time_diff = (now - progress.last_watch_date).total_seconds()
                if time_diff > 1800:  # 30 minutes
                    vals['session_count'] = progress.session_count + 1

            progress.write(vals)

        # Check for completion
        if not progress.is_completed:
            progress._check_completion()

        return {
            'id': progress.id,
            'current_position': progress.current_position,
            'max_position': progress.max_position,
            'watch_percentage': progress.watch_percentage,
            'is_completed': progress.is_completed,
        }

    def _check_completion(self):
        """Check if video should be marked as completed."""
        self.ensure_one()
        if self.watch_percentage >= self.completion_threshold:
            self.write({
                'is_completed': True,
                'completion_date': fields.Datetime.now(),
            })
            # Trigger slide completion in Odoo's system
            self._mark_slide_completed()
            # Award points if gamification is enabled
            self._award_completion_points()

    def _mark_slide_completed(self):
        """Mark the slide as completed in Odoo's native system."""
        self.ensure_one()
        slide = self.slide_id
        if slide and self.user_id:
            # Use Odoo's native slide completion
            slide_partner = self.env['slide.slide.partner'].search([
                ('slide_id', '=', slide.id),
                ('partner_id', '=', self.user_id.partner_id.id),
            ], limit=1)
            if slide_partner:
                slide_partner.write({'completed': True})
            else:
                self.env['slide.slide.partner'].create({
                    'slide_id': slide.id,
                    'partner_id': self.user_id.partner_id.id,
                    'completed': True,
                })

    def _award_completion_points(self):
        """Award gamification points for lesson completion."""
        self.ensure_one()
        PointsModel = self.env['seitech.student.points']
        # Check if already awarded for this lesson
        existing = PointsModel.search([
            ('user_id', '=', self.user_id.id),
            ('slide_id', '=', self.slide_id.id),
            ('activity_type', '=', 'lesson_complete'),
        ], limit=1)
        if not existing:
            PointsModel.award_points(
                user_id=self.user_id.id,
                points=10,  # Base points for lesson completion
                activity_type='lesson_complete',
                slide_id=self.slide_id.id,
                channel_id=self.channel_id.id,
            )
        # Check and award badges for lessons completed
        self._check_lesson_badges()

    def _check_lesson_badges(self):
        """Check and award any earned badges after lesson completion."""
        self.ensure_one()
        Badge = self.env['seitech.badge']
        
        # Check badges for lessons_completed criteria
        Badge.check_and_award_badges(
            user_id=self.user_id.id,
            trigger_type='lessons_completed',
            channel_id=self.channel_id.id,
        )
        
        # Also check point-based badges
        Badge.check_and_award_badges(
            user_id=self.user_id.id,
            trigger_type='points_earned',
        )

    @api.model
    def get_course_progress(self, channel_id):
        """Get overall course progress for current user."""
        user_id = self.env.user.id
        slides = self.env['slide.slide'].search([
            ('channel_id', '=', channel_id),
            ('is_category', '=', False),
        ])
        
        progress_records = self.search([
            ('user_id', '=', user_id),
            ('slide_id', 'in', slides.ids),
        ])

        completed_count = len(progress_records.filtered('is_completed'))
        total_count = len(slides)

        return {
            'total_lessons': total_count,
            'completed_lessons': completed_count,
            'completion_percentage': (completed_count / total_count * 100) if total_count else 0,
            'progress_by_lesson': {
                p.slide_id.id: {
                    'watch_percentage': p.watch_percentage,
                    'is_completed': p.is_completed,
                    'current_position': p.current_position,
                }
                for p in progress_records
            },
        }


class WatchSession(models.Model):
    """Individual watch sessions for analytics."""
    _name = 'seitech.watch.session'
    _description = 'Watch Session'
    _order = 'start_time desc'

    progress_id = fields.Many2one(
        'seitech.video.progress',
        string='Progress',
        required=True,
        ondelete='cascade',
    )
    slide_id = fields.Many2one(
        'slide.slide',
        string='Lesson',
        related='progress_id.slide_id',
        store=True,
    )
    user_id = fields.Many2one(
        'res.users',
        string='User',
        related='progress_id.user_id',
        store=True,
    )

    # Session data
    start_time = fields.Datetime(
        string='Start Time',
        default=fields.Datetime.now,
    )
    end_time = fields.Datetime(
        string='End Time',
    )
    start_position = fields.Integer(
        string='Start Position',
        default=0,
    )
    end_position = fields.Integer(
        string='End Position',
        default=0,
    )
    duration = fields.Integer(
        string='Duration (seconds)',
        compute='_compute_duration',
        store=True,
    )

    # Device info
    device_type = fields.Selection([
        ('desktop', 'Desktop'),
        ('tablet', 'Tablet'),
        ('mobile', 'Mobile'),
    ], string='Device Type')
    browser = fields.Char(string='Browser')
    ip_address = fields.Char(string='IP Address')

    @api.depends('start_time', 'end_time')
    def _compute_duration(self):
        for session in self:
            if session.start_time and session.end_time:
                session.duration = int((session.end_time - session.start_time).total_seconds())
            else:
                session.duration = 0
