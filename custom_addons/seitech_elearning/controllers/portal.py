# -*- coding: utf-8 -*-
"""Student portal controllers for dashboard and progress tracking."""
from odoo import http, _
from odoo.http import request
from odoo.exceptions import AccessError
import json


class StudentPortal(http.Controller):
    """Student dashboard and learning portal."""

    def _check_user_authenticated(self):
        """Ensure user is logged in."""
        if request.env.user._is_public():
            return request.redirect('/web/login?redirect=/my/learning')
        return None

    @http.route('/my/learning', type='http', auth='user', website=True)
    def student_dashboard(self, **kwargs):
        """
        Student learning dashboard.
        
        Shows: enrolled courses, progress, recent activity, achievements.
        Migrated from PHP: dashboard.php
        """
        user = request.env.user
        Enrollment = request.env['seitech.enrollment'].sudo()
        Certificate = request.env['seitech.certificate'].sudo()
        Points = request.env['seitech.student.points'].sudo()
        Badge = request.env['seitech.student.badge'].sudo()

        # Get user enrollments
        enrollments = Enrollment.search([
            ('user_id', '=', user.id),
            ('state', 'in', ['active', 'completed']),
        ], order='last_activity_date desc', limit=10)

        # Active courses (in progress)
        active_enrollments = enrollments.filtered(
            lambda e: e.state == 'active' and e.completion_percentage < 100
        )

        # Completed courses
        completed_enrollments = enrollments.filtered(
            lambda e: e.state == 'completed' or e.completion_percentage >= 100
        )

        # Certificates
        certificates = Certificate.search([
            ('user_id', '=', user.id),
            ('state', '=', 'issued'),
        ], order='issue_date desc')

        # Calculate stats
        total_points = sum(Points.search([('user_id', '=', user.id)]).mapped('points'))
        badges = Badge.search([('user_id', '=', user.id)])

        # Learning streak (consecutive days)
        streak = self._calculate_learning_streak(user.id)

        values = {
            'user': user,
            'active_enrollments': active_enrollments,
            'completed_enrollments': completed_enrollments,
            'certificates': certificates,
            'total_points': total_points,
            'badges': badges,
            'learning_streak': streak,
            'total_courses': len(enrollments),
            'completed_count': len(completed_enrollments),
        }
        return request.render('seitech_elearning.student_dashboard', values)

    @http.route('/my/courses', type='http', auth='user', website=True)
    def my_courses(self, status='all', **kwargs):
        """
        List all enrolled courses with filtering.
        
        Migrated from PHP: my_courses.php
        """
        user = request.env.user
        Enrollment = request.env['seitech.enrollment'].sudo()

        domain = [('user_id', '=', user.id)]

        if status == 'active':
            domain.append(('state', '=', 'active'))
        elif status == 'completed':
            domain.append(('state', '=', 'completed'))
        elif status == 'expired':
            domain.append(('state', '=', 'expired'))

        enrollments = Enrollment.search(domain, order='enrollment_date desc')

        values = {
            'enrollments': enrollments,
            'current_status': status,
        }
        return request.render('seitech_elearning.my_courses', values)

    @http.route('/my/certificates', type='http', auth='user', website=True)
    def my_certificates(self, **kwargs):
        """
        List user's certificates.
        
        Migrated from PHP: my_certificates.php
        """
        user = request.env.user
        Certificate = request.env['seitech.certificate'].sudo()

        certificates = Certificate.search([
            ('user_id', '=', user.id),
        ], order='issue_date desc')

        values = {
            'certificates': certificates,
        }
        return request.render('seitech_elearning.my_certificates', values)

    @http.route('/my/achievements', type='http', auth='user', website=True)
    def my_achievements(self, **kwargs):
        """
        Gamification achievements page.
        
        Migrated from PHP: achievements.php
        """
        user = request.env.user
        Points = request.env['seitech.student.points'].sudo()
        Badge = request.env['seitech.student.badge'].sudo()
        AllBadges = request.env['seitech.badge'].sudo()

        # User's points history
        points_history = Points.search([
            ('user_id', '=', user.id),
        ], order='earn_date desc', limit=50)

        # User's earned badges
        earned_badges = Badge.search([('user_id', '=', user.id)])
        earned_badge_ids = earned_badges.mapped('badge_id').ids

        # All available badges
        all_badges = AllBadges.search([])
        unearned_badges = all_badges.filtered(lambda b: b.id not in earned_badge_ids)

        # Stats
        total_points = sum(points_history.mapped('points'))

        # Leaderboard position
        leaderboard_position = self._get_leaderboard_position(user.id, total_points)

        values = {
            'points_history': points_history,
            'earned_badges': earned_badges,
            'unearned_badges': unearned_badges,
            'total_points': total_points,
            'leaderboard_position': leaderboard_position,
        }
        return request.render('seitech_elearning.my_achievements', values)

    @http.route('/my/progress/<int:enrollment_id>', type='http', auth='user', website=True)
    def course_progress(self, enrollment_id, **kwargs):
        """
        Detailed progress for a specific course.
        """
        user = request.env.user
        Enrollment = request.env['seitech.enrollment'].sudo()

        enrollment = Enrollment.browse(enrollment_id)
        if not enrollment.exists() or enrollment.user_id.id != user.id:
            return request.redirect('/my/learning')

        course = enrollment.channel_id
        VideoProgress = request.env['seitech.video.progress'].sudo()

        # Get all lessons
        lessons = request.env['slide.slide'].sudo().search([
            ('channel_id', '=', course.id),
            ('is_category', '=', False),
        ], order='sequence')

        # Get progress for each lesson
        progress_data = []
        for lesson in lessons:
            progress = VideoProgress.search([
                ('slide_id', '=', lesson.id),
                ('user_id', '=', user.id),
            ], limit=1)
            progress_data.append({
                'lesson': lesson,
                'progress': progress,
            })

        values = {
            'enrollment': enrollment,
            'course': course,
            'progress_data': progress_data,
        }
        return request.render('seitech_elearning.course_progress', values)

    def _calculate_learning_streak(self, user_id):
        """Calculate consecutive days of learning activity."""
        VideoProgress = request.env['seitech.video.progress'].sudo()
        from datetime import datetime, timedelta

        streak = 0
        today = datetime.now().date()

        for i in range(365):  # Check up to a year back
            check_date = today - timedelta(days=i)
            activity = VideoProgress.search([
                ('user_id', '=', user_id),
                ('last_watch_date', '>=', datetime.combine(check_date, datetime.min.time())),
                ('last_watch_date', '<', datetime.combine(check_date + timedelta(days=1), datetime.min.time())),
            ], limit=1)
            if activity:
                streak += 1
            else:
                if i > 0:  # Allow for today not having activity yet
                    break
        return streak

    def _get_leaderboard_position(self, user_id, total_points):
        """Get user's position on the leaderboard."""
        request.env.cr.execute("""
            SELECT COUNT(DISTINCT user_id) + 1 AS position
            FROM seitech_student_points
            GROUP BY user_id
            HAVING SUM(points) > %s
        """, (total_points,))
        result = request.env.cr.fetchone()
        return result[0] if result else 1


class VideoProgressAPI(http.Controller):
    """JSON API for video progress tracking."""

    @http.route('/elearning/video/progress', type='json', auth='user', methods=['POST'])
    def update_video_progress(self, slide_id, position, duration=None, **kwargs):
        """
        Update video watching progress.
        
        Called periodically by video player to save position.
        
        Args:
            slide_id: ID of the lesson
            position: Current video position in seconds
            duration: Total video duration (optional)
        
        Returns:
            dict with updated progress data
        """
        try:
            VideoProgress = request.env['seitech.video.progress'].sudo()
            result = VideoProgress.update_progress(
                slide_id=int(slide_id),
                position=int(position),
                duration=int(duration) if duration else None,
            )
            return {'success': True, 'data': result}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/elearning/video/progress/<int:slide_id>', type='json', auth='user', methods=['GET'])
    def get_video_progress(self, slide_id, **kwargs):
        """
        Get video progress for current user.
        
        Returns saved position to resume playback.
        """
        try:
            VideoProgress = request.env['seitech.video.progress'].sudo()
            progress = VideoProgress.search([
                ('slide_id', '=', slide_id),
                ('user_id', '=', request.env.user.id),
            ], limit=1)

            if progress:
                return {
                    'success': True,
                    'data': {
                        'current_position': progress.current_position,
                        'max_position': progress.max_position,
                        'watch_percentage': progress.watch_percentage,
                        'is_completed': progress.is_completed,
                        'playback_speed': progress.playback_speed,
                        'preferred_quality': progress.preferred_quality,
                        'captions_enabled': progress.captions_enabled,
                    }
                }
            else:
                return {'success': True, 'data': None}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/elearning/course/progress/<int:channel_id>', type='json', auth='user', methods=['GET'])
    def get_course_progress(self, channel_id, **kwargs):
        """
        Get overall course progress for current user.
        """
        try:
            VideoProgress = request.env['seitech.video.progress'].sudo()
            result = VideoProgress.get_course_progress(channel_id)
            return {'success': True, 'data': result}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/elearning/video/preferences', type='json', auth='user', methods=['POST'])
    def save_video_preferences(self, slide_id, playback_speed=None, quality=None, captions=None, **kwargs):
        """
        Save user's video playback preferences.
        """
        try:
            VideoProgress = request.env['seitech.video.progress'].sudo()
            progress = VideoProgress.search([
                ('slide_id', '=', int(slide_id)),
                ('user_id', '=', request.env.user.id),
            ], limit=1)

            if progress:
                vals = {}
                if playback_speed is not None:
                    vals['playback_speed'] = float(playback_speed)
                if quality is not None:
                    vals['preferred_quality'] = quality
                if captions is not None:
                    vals['captions_enabled'] = bool(captions)
                if vals:
                    progress.write(vals)
                return {'success': True}
            else:
                return {'success': False, 'error': 'No progress record found'}
        except Exception as e:
            return {'success': False, 'error': str(e)}


class LeaderboardController(http.Controller):
    """Leaderboard and gamification endpoints."""

    @http.route('/leaderboard', type='http', auth='public', website=True)
    def leaderboard_page(self, period='all', **kwargs):
        """
        Public leaderboard page.
        """
        Points = request.env['seitech.student.points'].sudo()

        # Build domain based on period
        domain = []
        if period == 'week':
            from datetime import datetime, timedelta
            week_ago = datetime.now() - timedelta(days=7)
            domain.append(('earn_date', '>=', week_ago))
        elif period == 'month':
            from datetime import datetime, timedelta
            month_ago = datetime.now() - timedelta(days=30)
            domain.append(('earn_date', '>=', month_ago))

        # Get top users by points
        request.env.cr.execute("""
            SELECT 
                user_id, 
                SUM(points) as total_points,
                COUNT(DISTINCT channel_id) as courses_count
            FROM seitech_student_points
            WHERE (%s = '' OR earn_date >= %s::timestamp)
            GROUP BY user_id
            ORDER BY total_points DESC
            LIMIT 50
        """, ('' if period == 'all' else period, 
              domain[0][2] if domain else '1970-01-01'))

        leaderboard_data = []
        for row in request.env.cr.fetchall():
            user = request.env['res.users'].sudo().browse(row[0])
            if user.exists():
                leaderboard_data.append({
                    'user': user,
                    'total_points': row[1],
                    'courses_count': row[2],
                })

        values = {
            'leaderboard': leaderboard_data,
            'current_period': period,
            'current_user': request.env.user if not request.env.user._is_public() else None,
        }
        return request.render('seitech_elearning.leaderboard_page', values)
