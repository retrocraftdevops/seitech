# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from datetime import datetime, timedelta


class LearningStreak(models.Model):
    _name = 'seitech.learning.streak'
    _description = 'Learning Streak Tracker'
    _order = 'current_streak desc, longest_streak desc'

    user_id = fields.Many2one(
        'res.users',
        string='User',
        required=True,
        ondelete='cascade',
        index=True,
    )
    
    # Streak Counts
    current_streak = fields.Integer(
        string='Current Streak',
        default=0,
        help='Current consecutive days of activity',
    )
    longest_streak = fields.Integer(
        string='Longest Streak',
        default=0,
        help='Longest streak ever achieved',
    )
    total_days_active = fields.Integer(
        string='Total Active Days',
        default=0,
        help='Total number of days with activity',
    )
    
    # Weekly Streaks
    current_week_days = fields.Integer(
        string='Days This Week',
        default=0,
    )
    perfect_weeks = fields.Integer(
        string='Perfect Weeks',
        default=0,
        help='Weeks with activity every day',
    )
    
    # Monthly Streaks
    current_month_days = fields.Integer(
        string='Days This Month',
        default=0,
    )
    perfect_months = fields.Integer(
        string='Perfect Months',
        default=0,
        help='Months with at least 20 days of activity',
    )
    
    # Last Activity
    last_activity_date = fields.Date(
        string='Last Activity Date',
        readonly=True,
    )
    last_activity_type = fields.Selection(
        [
            ('lesson_complete', 'Lesson Completed'),
            ('course_enroll', 'Course Enrolled'),
            ('quiz_taken', 'Quiz Taken'),
            ('discussion_post', 'Discussion Posted'),
            ('reply_post', 'Reply Posted'),
            ('group_activity', 'Group Activity'),
        ],
        string='Last Activity Type',
        readonly=True,
    )
    
    # Freeze Days (streak protection)
    freeze_days_available = fields.Integer(
        string='Freeze Days Available',
        default=0,
        help='Days that can protect the streak',
    )
    freeze_days_used = fields.Integer(
        string='Freeze Days Used',
        default=0,
    )
    
    # Milestones
    milestone_ids = fields.One2many(
        'seitech.streak.milestone',
        'streak_id',
        string='Milestones Achieved',
    )
    next_milestone = fields.Integer(
        string='Next Milestone',
        compute='_compute_next_milestone',
    )
    
    # Status
    is_frozen = fields.Boolean(
        string='Streak Frozen',
        default=False,
        help='Streak is protected from breaking',
    )
    frozen_until = fields.Date(
        string='Frozen Until',
    )
    
    # Stats
    activities_today = fields.Integer(
        string='Activities Today',
        default=0,
    )
    daily_goal = fields.Integer(
        string='Daily Goal',
        default=1,
        help='Minimum activities to maintain streak',
    )
    daily_goal_met = fields.Boolean(
        string='Daily Goal Met',
        compute='_compute_daily_goal_met',
    )
    
    # Computed Fields
    user_name = fields.Char(
        related='user_id.name',
        string='User Name',
        readonly=True,
    )
    
    @api.depends('current_streak')
    def _compute_next_milestone(self):
        milestones = [7, 14, 30, 60, 100, 180, 365]
        for streak in self:
            next_milestone = next((m for m in milestones if m > streak.current_streak), 0)
            streak.next_milestone = next_milestone
    
    @api.depends('activities_today', 'daily_goal')
    def _compute_daily_goal_met(self):
        for streak in self:
            streak.daily_goal_met = streak.activities_today >= streak.daily_goal
    
    _sql_constraints = [
        ('user_unique', 'unique(user_id)', 'User can only have one streak record!')
    ]
    
    @api.model
    def record_activity(self, user_id, activity_type):
        """Record an activity and update streak"""
        streak = self.search([('user_id', '=', user_id)], limit=1)
        if not streak:
            streak = self.create({'user_id': user_id})
        
        today = fields.Date.today()
        
        # Increment activities today
        if streak.last_activity_date == today:
            streak.activities_today += 1
        else:
            # New day
            streak.activities_today = 1
            
            # Check if streak continues
            if streak.last_activity_date:
                days_diff = (today - streak.last_activity_date).days
                
                if days_diff == 1:
                    # Consecutive day - increment streak
                    streak.current_streak += 1
                    streak.total_days_active += 1
                    streak.current_week_days += 1
                    streak.current_month_days += 1
                    
                    # Update longest streak
                    if streak.current_streak > streak.longest_streak:
                        streak.longest_streak = streak.current_streak
                    
                    # Check for milestones
                    streak._check_milestones()
                    
                elif days_diff > 1:
                    # Streak broken - check for freeze
                    if streak.is_frozen and streak.frozen_until >= today:
                        # Streak protected
                        pass
                    else:
                        # Reset streak
                        streak._reset_streak()
                        streak.current_streak = 1
                        streak.total_days_active += 1
            else:
                # First activity ever
                streak.current_streak = 1
                streak.total_days_active = 1
                streak.current_week_days = 1
                streak.current_month_days = 1
        
        # Update last activity
        streak.write({
            'last_activity_date': today,
            'last_activity_type': activity_type,
        })
        
        # Check weekly/monthly milestones
        streak._check_weekly_monthly()
        
        return streak
    
    def action_freeze_streak(self, days=1):
        """Use a freeze day to protect streak"""
        self.ensure_one()
        
        if self.freeze_days_available < days:
            raise UserError(_('Not enough freeze days available.'))
        
        self.write({
            'freeze_days_available': self.freeze_days_available - days,
            'freeze_days_used': self.freeze_days_used + days,
            'is_frozen': True,
            'frozen_until': fields.Date.today() + timedelta(days=days),
        })
        return True
    
    def action_earn_freeze_day(self):
        """Earn a freeze day as a reward"""
        self.ensure_one()
        self.freeze_days_available += 1
    
    def _reset_streak(self):
        """Reset current streak (called when broken)"""
        self.ensure_one()
        # Log the broken streak
        self.message_post(
            body=_('Streak broken at %d days. Longest: %d days') % (
                self.current_streak, self.longest_streak
            ),
            subtype_xmlid='mail.mt_note',
        )
        self.current_streak = 0
    
    def _check_milestones(self):
        """Check if new milestones are achieved"""
        self.ensure_one()
        milestone_days = [7, 14, 30, 60, 100, 180, 365, 500, 1000]
        
        for days in milestone_days:
            if self.current_streak == days:
                # Check if milestone already exists
                existing = self.milestone_ids.filtered(lambda m: m.milestone_days == days)
                if not existing:
                    self.env['seitech.streak.milestone'].create({
                        'streak_id': self.id,
                        'milestone_type': 'streak',
                        'milestone_days': days,
                        'achieved_date': fields.Date.today(),
                    })
                    
                    # Award freeze day for certain milestones
                    if days in [30, 100, 365]:
                        self.action_earn_freeze_day()
    
    def _check_weekly_monthly(self):
        """Check for weekly and monthly achievements"""
        self.ensure_one()
        today = fields.Date.today()
        
        # Check if it's end of week (Sunday)
        if today.weekday() == 6:
            if self.current_week_days == 7:
                self.perfect_weeks += 1
                # Create milestone
                self.env['seitech.streak.milestone'].create({
                    'streak_id': self.id,
                    'milestone_type': 'perfect_week',
                    'milestone_days': self.perfect_weeks,
                    'achieved_date': today,
                })
            self.current_week_days = 0
        
        # Check if it's end of month
        if today.day == 1:
            if self.current_month_days >= 20:
                self.perfect_months += 1
                self.env['seitech.streak.milestone'].create({
                    'streak_id': self.id,
                    'milestone_type': 'perfect_month',
                    'milestone_days': self.perfect_months,
                    'achieved_date': today,
                })
            self.current_month_days = 0
    
    @api.model
    def get_leaderboard(self, period='current', limit=10):
        """Get streak leaderboard"""
        order = 'current_streak desc' if period == 'current' else 'longest_streak desc'
        return self.search([], order=order, limit=limit)
    
    @api.model
    def get_user_streak_stats(self, user_id):
        """Get detailed streak statistics for a user"""
        streak = self.search([('user_id', '=', user_id)], limit=1)
        if not streak:
            return None
        
        # Calculate rank
        all_streaks = self.search([], order='current_streak desc')
        rank = next((i + 1 for i, s in enumerate(all_streaks) if s.id == streak.id), 0)
        
        return {
            'current_streak': streak.current_streak,
            'longest_streak': streak.longest_streak,
            'total_days_active': streak.total_days_active,
            'perfect_weeks': streak.perfect_weeks,
            'perfect_months': streak.perfect_months,
            'freeze_days_available': streak.freeze_days_available,
            'next_milestone': streak.next_milestone,
            'daily_goal_met': streak.daily_goal_met,
            'activities_today': streak.activities_today,
            'rank': rank,
            'total_users': len(all_streaks),
        }


class StreakMilestone(models.Model):
    _name = 'seitech.streak.milestone'
    _description = 'Streak Milestone'
    _order = 'achieved_date desc'

    streak_id = fields.Many2one(
        'seitech.learning.streak',
        string='Streak',
        required=True,
        ondelete='cascade',
    )
    milestone_type = fields.Selection(
        [
            ('streak', 'Streak Days'),
            ('perfect_week', 'Perfect Week'),
            ('perfect_month', 'Perfect Month'),
            ('freeze_earned', 'Freeze Day Earned'),
        ],
        string='Type',
        required=True,
    )
    milestone_days = fields.Integer(
        string='Milestone Value',
        required=True,
    )
    achieved_date = fields.Date(
        string='Achieved Date',
        default=fields.Date.today,
        required=True,
    )
    
    user_id = fields.Many2one(
        related='streak_id.user_id',
        string='User',
        readonly=True,
        store=True,
    )
