# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from datetime import datetime, timedelta


class Leaderboard(models.Model):
    _name = 'seitech.leaderboard'
    _description = 'Learning Leaderboard'
    _order = 'rank asc'
    _rec_name = 'user_id'

    user_id = fields.Many2one(
        'res.users',
        string='User',
        required=True,
        ondelete='cascade',
        index=True,
    )
    
    # Ranking
    rank = fields.Integer(
        string='Rank',
        readonly=True,
        index=True,
    )
    previous_rank = fields.Integer(
        string='Previous Rank',
        readonly=True,
    )
    rank_change = fields.Integer(
        string='Rank Change',
        compute='_compute_rank_change',
        store=True,
    )
    
    # Category and Period
    category = fields.Selection(
        [
            ('overall', 'Overall'),
            ('points', 'Points'),
            ('courses', 'Courses Completed'),
            ('skills', 'Skills Mastered'),
            ('streak', 'Learning Streak'),
            ('discussions', 'Discussion Contribution'),
            ('certifications', 'Certifications'),
        ],
        string='Category',
        required=True,
        default='overall',
        index=True,
    )
    period = fields.Selection(
        [
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
            ('yearly', 'Yearly'),
            ('all_time', 'All Time'),
        ],
        string='Period',
        required=True,
        default='all_time',
        index=True,
    )
    
    # Scores
    score = fields.Float(
        string='Score',
        required=True,
        default=0.0,
    )
    previous_score = fields.Float(
        string='Previous Score',
        default=0.0,
    )
    score_change = fields.Float(
        string='Score Change',
        compute='_compute_score_change',
        store=True,
    )
    
    # Detailed Metrics
    total_points = fields.Integer(
        string='Total Points',
        default=0,
    )
    courses_completed = fields.Integer(
        string='Courses Completed',
        default=0,
    )
    skills_mastered = fields.Integer(
        string='Skills Mastered',
        default=0,
    )
    current_streak = fields.Integer(
        string='Current Streak',
        default=0,
    )
    discussions_created = fields.Integer(
        string='Discussions Created',
        default=0,
    )
    replies_posted = fields.Integer(
        string='Replies Posted',
        default=0,
    )
    certifications_earned = fields.Integer(
        string='Certifications',
        default=0,
    )
    
    # Timestamps
    period_start = fields.Date(
        string='Period Start',
        required=True,
    )
    period_end = fields.Date(
        string='Period End',
        required=True,
    )
    last_updated = fields.Datetime(
        string='Last Updated',
        default=fields.Datetime.now,
        readonly=True,
    )
    
    # Computed Fields
    user_name = fields.Char(
        related='user_id.name',
        string='User Name',
        readonly=True,
    )
    user_avatar = fields.Image(
        related='user_id.image_128',
        readonly=True,
    )
    percentile = fields.Float(
        string='Percentile',
        compute='_compute_percentile',
        help='Top X% of all users',
    )
    
    @api.depends('rank', 'previous_rank')
    def _compute_rank_change(self):
        for record in self:
            if record.previous_rank:
                # Negative means moving up (better rank)
                record.rank_change = record.previous_rank - record.rank
            else:
                record.rank_change = 0
    
    @api.depends('score', 'previous_score')
    def _compute_score_change(self):
        for record in self:
            record.score_change = record.score - record.previous_score
    
    @api.depends('rank', 'category', 'period')
    def _compute_percentile(self):
        for record in self:
            total_users = self.search_count([
                ('category', '=', record.category),
                ('period', '=', record.period),
            ])
            if total_users > 0:
                record.percentile = (1 - (record.rank / total_users)) * 100
            else:
                record.percentile = 0.0
    
    _sql_constraints = [
        ('user_category_period_unique', 
         'unique(user_id, category, period, period_start)', 
         'User can only have one entry per category and period!')
    ]
    
    @api.model
    def update_leaderboards(self, period='all', categories=None):
        """Update leaderboard rankings for specified period and categories"""
        if categories is None:
            categories = ['overall', 'points', 'courses', 'skills', 'streak', 
                         'discussions', 'certifications']
        
        periods_to_update = [period] if period != 'all' else [
            'daily', 'weekly', 'monthly', 'yearly', 'all_time'
        ]
        
        for period_type in periods_to_update:
            period_start, period_end = self._get_period_dates(period_type)
            
            for category in categories:
                self._update_category_leaderboard(category, period_type, period_start, period_end)
    
    @api.model
    def _get_period_dates(self, period):
        """Get start and end dates for a period"""
        today = fields.Date.today()
        
        if period == 'daily':
            return today, today
        elif period == 'weekly':
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=6)
            return start, end
        elif period == 'monthly':
            start = today.replace(day=1)
            # Get last day of month
            if today.month == 12:
                end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
            return start, end
        elif period == 'yearly':
            start = today.replace(month=1, day=1)
            end = today.replace(month=12, day=31)
            return start, end
        else:  # all_time
            return fields.Date.from_string('2020-01-01'), today
    
    @api.model
    def _update_category_leaderboard(self, category, period, period_start, period_end):
        """Update leaderboard for a specific category and period"""
        # Get all active users
        users = self.env['res.users'].search([
            ('active', '=', True),
            ('share', '=', False),  # Exclude portal users
        ])
        
        user_scores = []
        for user in users:
            score = self._calculate_user_score(user.id, category, period_start, period_end)
            if score > 0:  # Only include users with activity
                user_scores.append({
                    'user_id': user.id,
                    'score': score,
                })
        
        # Sort by score descending
        user_scores.sort(key=lambda x: x['score'], reverse=True)
        
        # Update or create leaderboard entries
        for idx, user_data in enumerate(user_scores, start=1):
            existing = self.search([
                ('user_id', '=', user_data['user_id']),
                ('category', '=', category),
                ('period', '=', period),
                ('period_start', '=', period_start),
            ], limit=1)
            
            values = self._prepare_leaderboard_values(
                user_data['user_id'], category, period, 
                period_start, period_end, idx, user_data['score']
            )
            
            if existing:
                values['previous_rank'] = existing.rank
                values['previous_score'] = existing.score
                existing.write(values)
            else:
                self.create(values)
    
    @api.model
    def _calculate_user_score(self, user_id, category, period_start, period_end):
        """Calculate user score for specific category and period"""
        if category == 'points':
            # Sum all points from various activities
            enrollments = self.env['seitech.enrollment'].search([
                ('user_id', '=', user_id),
                ('completion_date', '>=', period_start),
                ('completion_date', '<=', period_end),
            ])
            return sum(e.points_earned or 0 for e in enrollments)
        
        elif category == 'courses':
            # Count completed courses
            return self.env['seitech.enrollment'].search_count([
                ('user_id', '=', user_id),
                ('state', '=', 'completed'),
                ('completion_date', '>=', period_start),
                ('completion_date', '<=', period_end),
            ])
        
        elif category == 'skills':
            # Count skills at expert or advanced level
            return self.env['seitech.user.skill'].search_count([
                ('user_id', '=', user_id),
                ('current_level', 'in', ['advanced', 'expert']),
                ('last_activity_date', '>=', period_start),
                ('last_activity_date', '<=', period_end),
            ])
        
        elif category == 'streak':
            # Get current streak
            streak = self.env['seitech.learning.streak'].search([
                ('user_id', '=', user_id),
            ], limit=1)
            return streak.current_streak if streak else 0
        
        elif category == 'discussions':
            # Count discussions and replies with upvotes
            discussions = self.env['seitech.discussion'].search([
                ('author_id', '=', user_id),
                ('create_date', '>=', period_start),
                ('create_date', '<=', period_end),
            ])
            replies = self.env['seitech.discussion.reply'].search([
                ('author_id', '=', user_id),
                ('create_date', '>=', period_start),
                ('create_date', '<=', period_end),
            ])
            discussion_score = sum(d.upvote_count * 2 for d in discussions) + len(discussions)
            reply_score = sum(r.upvote_count for r in replies) + len(replies)
            return discussion_score + reply_score
        
        elif category == 'certifications':
            # Count certificates earned
            return self.env['seitech.certificate'].search_count([
                ('user_id', '=', user_id),
                ('issue_date', '>=', period_start),
                ('issue_date', '<=', period_end),
            ])
        
        elif category == 'overall':
            # Weighted combination of all categories
            points = self._calculate_user_score(user_id, 'points', period_start, period_end) * 0.3
            courses = self._calculate_user_score(user_id, 'courses', period_start, period_end) * 100 * 0.25
            skills = self._calculate_user_score(user_id, 'skills', period_start, period_end) * 50 * 0.2
            streak = self._calculate_user_score(user_id, 'streak', period_start, period_end) * 10 * 0.1
            discussions = self._calculate_user_score(user_id, 'discussions', period_start, period_end) * 0.1
            certs = self._calculate_user_score(user_id, 'certifications', period_start, period_end) * 200 * 0.05
            return points + courses + skills + streak + discussions + certs
        
        return 0.0
    
    @api.model
    def _prepare_leaderboard_values(self, user_id, category, period, 
                                     period_start, period_end, rank, score):
        """Prepare values for leaderboard entry"""
        values = {
            'user_id': user_id,
            'category': category,
            'period': period,
            'period_start': period_start,
            'period_end': period_end,
            'rank': rank,
            'score': score,
            'last_updated': fields.Datetime.now(),
        }
        
        # Add detailed metrics
        if category in ['overall', 'points']:
            enrollments = self.env['seitech.enrollment'].search([
                ('user_id', '=', user_id),
                ('completion_date', '>=', period_start),
                ('completion_date', '<=', period_end),
            ])
            values['total_points'] = sum(e.points_earned or 0 for e in enrollments)
        
        if category in ['overall', 'courses']:
            values['courses_completed'] = self.env['seitech.enrollment'].search_count([
                ('user_id', '=', user_id),
                ('state', '=', 'completed'),
                ('completion_date', '>=', period_start),
                ('completion_date', '<=', period_end),
            ])
        
        if category in ['overall', 'skills']:
            values['skills_mastered'] = self.env['seitech.user.skill'].search_count([
                ('user_id', '=', user_id),
                ('current_level', 'in', ['advanced', 'expert']),
            ])
        
        if category in ['overall', 'streak']:
            streak = self.env['seitech.learning.streak'].search([
                ('user_id', '=', user_id),
            ], limit=1)
            values['current_streak'] = streak.current_streak if streak else 0
        
        return values
    
    @api.model
    def get_user_rankings(self, user_id, categories=None):
        """Get user's rankings across all categories and periods"""
        if categories is None:
            categories = ['overall', 'points', 'courses', 'skills', 'streak', 
                         'discussions', 'certifications']
        
        rankings = {}
        for category in categories:
            rankings[category] = {}
            for period in ['daily', 'weekly', 'monthly', 'all_time']:
                period_start, period_end = self._get_period_dates(period)
                entry = self.search([
                    ('user_id', '=', user_id),
                    ('category', '=', category),
                    ('period', '=', period),
                    ('period_start', '=', period_start),
                ], limit=1)
                
                if entry:
                    rankings[category][period] = {
                        'rank': entry.rank,
                        'score': entry.score,
                        'rank_change': entry.rank_change,
                        'percentile': entry.percentile,
                    }
                else:
                    rankings[category][period] = None
        
        return rankings
    
    @api.model
    def get_top_users(self, category='overall', period='all_time', limit=10):
        """Get top users for a category and period"""
        today = fields.Date.today()
        period_start, period_end = self._get_period_dates(period)
        
        return self.search([
            ('category', '=', category),
            ('period', '=', period),
            ('period_start', '=', period_start),
        ], order='rank asc', limit=limit)
