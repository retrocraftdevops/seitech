# -*- coding: utf-8 -*-
from odoo import models, fields, api, _


class StudentPoints(models.Model):
    """Points earned by students for various activities."""
    _name = 'seitech.student.points'
    _description = 'Student Points'
    _order = 'create_date desc'

    user_id = fields.Many2one(
        'res.users',
        string='Student',
        required=True,
        ondelete='cascade',
        index=True,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Contact',
        related='user_id.partner_id',
        store=True,
    )
    points = fields.Integer(string='Points', required=True)
    activity_type = fields.Selection([
        ('course_enroll', 'Course Enrollment'),
        ('lesson_complete', 'Lesson Completion'),
        ('course_complete', 'Course Completion'),
        ('quiz_pass', 'Quiz Passed'),
        ('quiz_perfect', 'Perfect Quiz Score'),
        ('assignment_submit', 'Assignment Submitted'),
        ('assignment_pass', 'Assignment Passed'),
        ('review_write', 'Review Written'),
        ('forum_post', 'Forum Post'),
        ('forum_answer', 'Forum Answer'),
        ('streak_bonus', 'Learning Streak Bonus'),
        ('badge_earned', 'Badge Earned'),
        ('referral', 'Referral Bonus'),
        ('manual', 'Manual Adjustment'),
    ], string='Activity Type', required=True)
    description = fields.Char(string='Description')

    # Related records
    channel_id = fields.Many2one('slide.channel', string='Course')
    slide_id = fields.Many2one('slide.slide', string='Lesson')
    enrollment_id = fields.Many2one('seitech.enrollment', string='Enrollment')

    # Timestamp
    earn_date = fields.Datetime(
        string='Earned Date',
        default=fields.Datetime.now,
    )

    @api.model
    def award_points(self, user_id, points, activity_type, description=None, **kwargs):
        """Award points to a user."""
        return self.create({
            'user_id': user_id,
            'points': points,
            'activity_type': activity_type,
            'description': description or dict(self._fields['activity_type'].selection).get(activity_type),
            **kwargs,
        })


class StudentBadge(models.Model):
    """Badges earned by students."""
    _name = 'seitech.student.badge'
    _description = 'Student Badge'
    _order = 'earn_date desc'

    user_id = fields.Many2one(
        'res.users',
        string='Student',
        required=True,
        ondelete='cascade',
        index=True,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Contact',
        related='user_id.partner_id',
        store=True,
    )
    badge_id = fields.Many2one(
        'seitech.badge',
        string='Badge',
        required=True,
        ondelete='cascade',
    )
    earn_date = fields.Datetime(
        string='Earned Date',
        default=fields.Datetime.now,
    )

    # Related records
    channel_id = fields.Many2one('slide.channel', string='Course')
    enrollment_id = fields.Many2one('seitech.enrollment', string='Enrollment')

    _sql_constraints = [
        ('unique_badge', 'UNIQUE(user_id, badge_id)',
         'User has already earned this badge.'),
    ]


class Badge(models.Model):
    """Badge definitions for gamification."""
    _name = 'seitech.badge'
    _description = 'Learning Badge'
    _order = 'sequence, name'

    name = fields.Char(string='Name', required=True, translate=True)
    description = fields.Text(string='Description', translate=True)
    image = fields.Binary(string='Image', attachment=True)
    icon = fields.Char(string='Icon Class', help='Font Awesome class')
    color = fields.Char(string='Color', default='#0284c7')
    sequence = fields.Integer(string='Sequence', default=10)

    # Badge type
    badge_type = fields.Selection([
        ('achievement', 'Achievement'),
        ('milestone', 'Milestone'),
        ('skill', 'Skill'),
        ('event', 'Event'),
        ('special', 'Special'),
    ], string='Type', default='achievement', required=True)

    # Earning criteria
    auto_award = fields.Boolean(
        string='Auto Award',
        default=True,
        help='Automatically award when criteria are met',
    )
    criteria_type = fields.Selection([
        ('courses_completed', 'Courses Completed'),
        ('lessons_completed', 'Lessons Completed'),
        ('points_earned', 'Points Earned'),
        ('quizzes_passed', 'Quizzes Passed'),
        ('assignments_passed', 'Assignments Passed'),
        ('reviews_written', 'Reviews Written'),
        ('streak_days', 'Learning Streak Days'),
        ('specific_course', 'Specific Course Completed'),
        ('manual', 'Manual Award Only'),
    ], string='Criteria Type', default='manual')
    criteria_value = fields.Integer(
        string='Criteria Value',
        default=1,
        help='Number required to earn badge',
    )
    criteria_channel_id = fields.Many2one(
        'slide.channel',
        string='Specific Course',
        help='Course that must be completed (for specific_course criteria)',
    )

    # Points
    points_awarded = fields.Integer(
        string='Points Awarded',
        default=50,
        help='Points given when badge is earned',
    )

    # Statistics
    student_badge_ids = fields.One2many(
        'seitech.student.badge',
        'badge_id',
        string='Earned By',
    )
    earned_count = fields.Integer(
        string='Times Earned',
        compute='_compute_earned_count',
    )

    # Status
    is_active = fields.Boolean(string='Active', default=True)

    @api.depends('student_badge_ids')
    def _compute_earned_count(self):
        for badge in self:
            badge.earned_count = len(badge.student_badge_ids)

    def award_to_user(self, user_id, channel_id=None, enrollment_id=None):
        """Award this badge to a user."""
        self.ensure_one()
        StudentBadge = self.env['seitech.student.badge']

        # Check if already earned
        existing = StudentBadge.search([
            ('user_id', '=', user_id),
            ('badge_id', '=', self.id),
        ], limit=1)
        if existing:
            return existing

        # Award badge
        student_badge = StudentBadge.create({
            'user_id': user_id,
            'badge_id': self.id,
            'channel_id': channel_id,
            'enrollment_id': enrollment_id,
        })

        # Award points for earning badge
        if self.points_awarded:
            self.env['seitech.student.points'].award_points(
                user_id=user_id,
                points=self.points_awarded,
                activity_type='badge_earned',
                description=f'Earned badge: {self.name}',
            )

        return student_badge

    @api.model
    def check_and_award_badges(self, user_id, trigger_type=None, channel_id=None):
        """Check all auto-award badges and award any that user qualifies for.
        
        Args:
            user_id: The user to check badges for
            trigger_type: Optional filter for criteria type (courses_completed, lessons_completed, etc.)
            channel_id: Optional course ID for specific course badges
        
        Returns:
            list of newly awarded badge records
        """
        awarded = []
        domain = [('auto_award', '=', True), ('is_active', '=', True)]
        if trigger_type:
            domain.append(('criteria_type', '=', trigger_type))
        
        badges = self.search(domain)
        user = self.env['res.users'].browse(user_id)

        for badge in badges:
            # Skip if user already has this badge
            if self.env['seitech.student.badge'].search_count([
                ('user_id', '=', user_id),
                ('badge_id', '=', badge.id),
            ]):
                continue

            # Check if criteria are met
            if badge._check_criteria_met(user, channel_id):
                awarded_badge = badge.award_to_user(
                    user_id=user_id,
                    channel_id=channel_id,
                )
                if awarded_badge:
                    awarded.append(awarded_badge)

        return awarded

    def _check_criteria_met(self, user, channel_id=None):
        """Check if user meets the criteria for this badge.
        
        Args:
            user: res.users record
            channel_id: Optional course ID
        
        Returns:
            bool: True if criteria are met
        """
        self.ensure_one()
        criteria_type = self.criteria_type
        criteria_value = self.criteria_value

        if criteria_type == 'courses_completed':
            count = self.env['seitech.enrollment'].search_count([
                ('user_id', '=', user.id),
                ('state', '=', 'completed'),
            ])
            return count >= criteria_value

        elif criteria_type == 'lessons_completed':
            count = self.env['slide.slide.partner'].search_count([
                ('partner_id', '=', user.partner_id.id),
                ('completed', '=', True),
            ])
            return count >= criteria_value

        elif criteria_type == 'points_earned':
            total_points = sum(self.env['seitech.student.points'].search([
                ('user_id', '=', user.id),
            ]).mapped('points'))
            return total_points >= criteria_value

        elif criteria_type == 'quizzes_passed':
            count = self.env['seitech.student.points'].search_count([
                ('user_id', '=', user.id),
                ('activity_type', '=', 'quiz_pass'),
            ])
            return count >= criteria_value

        elif criteria_type == 'reviews_written':
            count = self.env['seitech.student.points'].search_count([
                ('user_id', '=', user.id),
                ('activity_type', '=', 'review_write'),
            ])
            return count >= criteria_value

        elif criteria_type == 'streak_days':
            return user.current_streak >= criteria_value

        elif criteria_type == 'specific_course':
            if not self.criteria_channel_id:
                return False
            # Check if specific course is completed
            return self.env['seitech.enrollment'].search_count([
                ('user_id', '=', user.id),
                ('channel_id', '=', self.criteria_channel_id.id),
                ('state', '=', 'completed'),
            ]) > 0

        elif criteria_type == 'manual':
            # Manual badges are never auto-awarded
            return False

        return False


class StudentLeaderboard(models.Model):
    """Computed leaderboard for students."""
    _name = 'seitech.student.leaderboard'
    _description = 'Student Leaderboard'
    _auto = False
    _order = 'total_points desc, courses_completed desc'

    user_id = fields.Many2one('res.users', string='Student', readonly=True)
    partner_id = fields.Many2one('res.partner', string='Contact', readonly=True)
    total_points = fields.Integer(string='Total Points', readonly=True)
    courses_completed = fields.Integer(string='Courses Completed', readonly=True)
    badges_earned = fields.Integer(string='Badges Earned', readonly=True)
    rank = fields.Integer(string='Rank', readonly=True)

    def init(self):
        """Create or replace the view."""
        self.env.cr.execute("""
            CREATE OR REPLACE VIEW seitech_student_leaderboard AS (
                SELECT
                    row_number() OVER (ORDER BY COALESCE(points.total_points, 0) DESC) as id,
                    row_number() OVER (ORDER BY COALESCE(points.total_points, 0) DESC) as rank,
                    u.id as user_id,
                    u.partner_id as partner_id,
                    COALESCE(points.total_points, 0) as total_points,
                    COALESCE(courses.courses_completed, 0) as courses_completed,
                    COALESCE(badges.badges_earned, 0) as badges_earned
                FROM res_users u
                LEFT JOIN (
                    SELECT user_id, SUM(points) as total_points
                    FROM seitech_student_points
                    GROUP BY user_id
                ) points ON points.user_id = u.id
                LEFT JOIN (
                    SELECT user_id, COUNT(*) as courses_completed
                    FROM seitech_enrollment
                    WHERE state = 'completed'
                    GROUP BY user_id
                ) courses ON courses.user_id = u.id
                LEFT JOIN (
                    SELECT user_id, COUNT(*) as badges_earned
                    FROM seitech_student_badge
                    GROUP BY user_id
                ) badges ON badges.user_id = u.id
                WHERE (points.total_points > 0 OR courses.courses_completed > 0 OR badges.badges_earned > 0)
            )
        """)


class ResUsers(models.Model):
    """Extend res.users with gamification fields."""
    _inherit = 'res.users'

    # Points
    total_points = fields.Integer(
        string='Total Points',
        compute='_compute_gamification_stats',
    )
    point_ids = fields.One2many(
        'seitech.student.points',
        'user_id',
        string='Points History',
    )

    # Badges (named student_badge_ids to avoid conflict with hr_gamification)
    student_badge_ids = fields.One2many(
        'seitech.student.badge',
        'user_id',
        string='Student Badges',
    )
    student_badge_count = fields.Integer(
        string='Badges Earned',
        compute='_compute_gamification_stats',
    )

    # Learning streak
    current_streak = fields.Integer(
        string='Current Streak (days)',
        compute='_compute_learning_streak',
    )
    longest_streak = fields.Integer(
        string='Longest Streak (days)',
        default=0,
    )
    last_learning_date = fields.Date(string='Last Learning Date')

    def _compute_gamification_stats(self):
        Points = self.env['seitech.student.points']
        Badges = self.env['seitech.student.badge']
        for user in self:
            user.total_points = sum(Points.search([
                ('user_id', '=', user.id)
            ]).mapped('points'))
            user.student_badge_count = Badges.search_count([
                ('user_id', '=', user.id)
            ])

    def _compute_learning_streak(self):
        today = fields.Date.today()
        for user in self:
            if not user.last_learning_date:
                user.current_streak = 0
                continue

            delta = (today - user.last_learning_date).days
            if delta > 1:
                user.current_streak = 0
            else:
                # Would need proper tracking to calculate actual streak
                user.current_streak = 1

    def record_learning_activity(self):
        """Record that user did learning activity today."""
        today = fields.Date.today()
        for user in self:
            yesterday = today - fields.Date.timedelta(days=1)
            if user.last_learning_date == yesterday:
                # Continuing streak
                user.current_streak += 1
                if user.current_streak > user.longest_streak:
                    user.longest_streak = user.current_streak
                # Check for streak bonus
                if user.current_streak % 7 == 0:
                    self.env['seitech.student.points'].award_points(
                        user_id=user.id,
                        points=user.current_streak * 5,
                        activity_type='streak_bonus',
                        description=f'{user.current_streak} day learning streak!',
                    )
            elif user.last_learning_date != today:
                user.current_streak = 1
            user.last_learning_date = today
