# -*- coding: utf-8 -*-
"""AI-powered course recommendation engine."""
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta
import json
import logging

_logger = logging.getLogger(__name__)


class CourseRecommendation(models.Model):
    """Personalized course recommendations for users."""
    _name = 'seitech.recommendation'
    _description = 'Course Recommendation'
    _order = 'score desc, created_date desc'
    _rec_name = 'course_id'

    user_id = fields.Many2one(
        'res.users',
        string='User',
        required=True,
        ondelete='cascade',
        index=True,
    )
    course_id = fields.Many2one(
        'slide.channel',
        string='Recommended Course',
        required=True,
        ondelete='cascade',
        index=True,
    )
    
    # Recommendation scoring
    score = fields.Float(
        string='Recommendation Score',
        required=True,
        help='0-100 score indicating recommendation strength',
    )
    algorithm = fields.Selection([
        ('collaborative', 'Collaborative Filtering'),
        ('content', 'Content-Based'),
        ('skill_gap', 'Skill Gap Analysis'),
        ('trending', 'Trending'),
        ('instructor', 'Instructor-Based'),
        ('hybrid', 'Hybrid'),
    ], string='Algorithm Used', required=True)
    
    # Reasoning
    reason_type = fields.Selection([
        ('similar_users', 'Users Like You'),
        ('course_similarity', 'Similar to Courses You Liked'),
        ('skill_requirement', 'Matches Your Skill Goals'),
        ('trending', 'Currently Trending'),
        ('instructor_match', 'From Instructors You Follow'),
        ('path_requirement', 'Required for Learning Path'),
        ('category_interest', 'Based on Your Interests'),
    ], string='Reason Type', required=True)
    
    reason_text = fields.Text(
        string='Explanation',
        help='Human-readable explanation of why this course is recommended',
    )
    reason_data = fields.Text(
        string='Reasoning Data (JSON)',
        help='Structured data supporting the recommendation',
    )
    
    # User interaction
    status = fields.Selection([
        ('pending', 'Pending'),
        ('viewed', 'Viewed'),
        ('enrolled', 'Enrolled'),
        ('dismissed', 'Dismissed'),
        ('saved', 'Saved for Later'),
    ], string='Status', default='pending', required=True)
    
    viewed_date = fields.Datetime(string='Viewed Date')
    action_date = fields.Datetime(string='Action Date')
    
    # Metadata
    created_date = fields.Datetime(
        string='Created',
        default=fields.Datetime.now,
        required=True,
    )
    expires_date = fields.Datetime(
        string='Expires',
        help='Recommendation expires after this date',
    )
    is_expired = fields.Boolean(
        compute='_compute_is_expired',
        string='Expired',
        store=True,
    )
    
    # Relations
    user_name = fields.Char(related='user_id.name', string='User', store=True)
    course_name = fields.Char(related='course_id.name', string='Course', store=True)
    course_category_id = fields.Many2one(
        related='course_id.seitech_category_id',
        string='Category',
        store=True,
    )
    
    _sql_constraints = [
        ('check_score', 'CHECK(score >= 0 AND score <= 100)',
         'Score must be between 0 and 100.'),
    ]

    @api.depends('expires_date')
    def _compute_is_expired(self):
        """Check if recommendation has expired."""
        now = fields.Datetime.now()
        for record in self:
            record.is_expired = record.expires_date and record.expires_date < now

    def action_viewed(self):
        """Mark recommendation as viewed."""
        self.write({
            'status': 'viewed',
            'viewed_date': fields.Datetime.now(),
        })

    def action_enroll(self):
        """User enrolled in recommended course."""
        self.ensure_one()
        
        # Create enrollment
        enrollment = self.env['seitech.enrollment'].create({
            'user_id': self.user_id.id,
            'channel_id': self.course_id.id,
            'source': 'recommendation',
        })
        
        self.write({
            'status': 'enrolled',
            'action_date': fields.Datetime.now(),
        })
        
        # Update recommendation effectiveness metrics
        self._update_algorithm_performance(positive=True)
        
        return enrollment

    def action_dismiss(self):
        """User dismissed recommendation."""
        self.write({
            'status': 'dismissed',
            'action_date': fields.Datetime.now(),
        })
        
        # Update metrics (negative feedback)
        self._update_algorithm_performance(positive=False)

    def action_save(self):
        """User saved recommendation for later."""
        self.write({
            'status': 'saved',
            'action_date': fields.Datetime.now(),
        })

    def _update_algorithm_performance(self, positive=True):
        """Track algorithm effectiveness."""
        # This would update ML model performance tracking
        # For now, just log
        _logger.info(
            'Recommendation %s for user %s: algorithm=%s, score=%.2f, positive=%s',
            self.course_id.name, self.user_id.name, self.algorithm, self.score, positive
        )

    @api.model
    def generate_recommendations(self, user_id, limit=10, algorithm=None):
        """Generate personalized course recommendations for a user.
        
        Args:
            user_id: User ID to generate recommendations for
            limit: Maximum number of recommendations
            algorithm: Specific algorithm to use (None = hybrid)
            
        Returns:
            Recordset of recommendations
        """
        user = self.env['res.users'].browse(user_id)
        
        # Clear expired recommendations
        self._cleanup_expired_recommendations(user_id)
        
        if algorithm:
            # Use specific algorithm
            if algorithm == 'collaborative':
                courses = self._collaborative_filtering(user_id, limit)
            elif algorithm == 'content':
                courses = self._content_based_filtering(user_id, limit)
            elif algorithm == 'skill_gap':
                courses = self._skill_gap_recommendations(user_id, limit)
            elif algorithm == 'trending':
                courses = self._trending_recommendations(user_id, limit)
            else:
                courses = []
        else:
            # Hybrid approach - combine multiple algorithms
            courses = self._hybrid_recommendations(user_id, limit)
        
        # Create recommendation records
        recommendations = self.env['seitech.recommendation']
        for course_data in courses:
            recommendations |= self.create({
                'user_id': user_id,
                'course_id': course_data['course_id'],
                'score': course_data['score'],
                'algorithm': course_data['algorithm'],
                'reason_type': course_data['reason_type'],
                'reason_text': course_data['reason_text'],
                'reason_data': json.dumps(course_data.get('data', {})),
                'expires_date': fields.Datetime.now() + timedelta(days=7),
            })
        
        return recommendations

    @api.model
    def _collaborative_filtering(self, user_id, limit=10):
        """Recommend courses based on similar users."""
        # Find similar users (users who took similar courses)
        user_enrollments = self.env['seitech.enrollment'].search([
            ('user_id', '=', user_id),
            ('state', 'in', ['active', 'completed']),
        ])
        course_ids = user_enrollments.mapped('channel_id').ids
        
        # Find users with similar enrollments
        similar_enrollments = self.env['seitech.enrollment'].search([
            ('channel_id', 'in', course_ids),
            ('user_id', '!=', user_id),
            ('state', 'in', ['active', 'completed']),
        ])
        
        # Count overlap
        user_course_counts = {}
        for enroll in similar_enrollments:
            uid = enroll.user_id.id
            user_course_counts[uid] = user_course_counts.get(uid, 0) + 1
        
        # Get top similar users
        similar_users = sorted(
            user_course_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        similar_user_ids = [uid for uid, _ in similar_users]
        
        # Get courses these users took but target user didn't
        recommended_courses = self.env['seitech.enrollment'].search([
            ('user_id', 'in', similar_user_ids),
            ('channel_id', 'not in', course_ids),
            ('state', 'in', ['active', 'completed']),
        ])
        
        # Score and rank
        course_scores = {}
        for enroll in recommended_courses:
            cid = enroll.channel_id.id
            # Weight by similarity of user
            user_similarity = user_course_counts.get(enroll.user_id.id, 0) / len(course_ids)
            course_scores[cid] = course_scores.get(cid, 0) + user_similarity
        
        # Build results
        results = []
        for cid, score in sorted(course_scores.items(), key=lambda x: x[1], reverse=True)[:limit]:
            course = self.env['slide.channel'].browse(cid)
            results.append({
                'course_id': cid,
                'score': min(score * 100, 100),
                'algorithm': 'collaborative',
                'reason_type': 'similar_users',
                'reason_text': f'Students who took similar courses also enjoyed {course.name}',
                'data': {'similar_users': len(similar_user_ids)},
            })
        
        return results

    @api.model
    def _content_based_filtering(self, user_id, limit=10):
        """Recommend courses similar to ones user liked."""
        # Get user's completed courses with high ratings
        enrollments = self.env['seitech.enrollment'].search([
            ('user_id', '=', user_id),
            ('state', '=', 'completed'),
        ])
        
        liked_courses = enrollments.filtered(lambda e: e.completion_percentage >= 90)
        if not liked_courses:
            return []
        
        # Get categories/tags of liked courses
        categories = liked_courses.mapped('channel_id.seitech_category_id')
        tags = liked_courses.mapped('channel_id.tag_ids')
        
        # Find similar courses
        similar_courses = self.env['slide.channel'].search([
            '|',
            ('seitech_category_id', 'in', categories.ids),
            ('tag_ids', 'in', tags.ids),
            ('id', 'not in', liked_courses.mapped('channel_id').ids),
            ('is_published', '=', True),
        ], limit=limit * 2)
        
        # Score by overlap
        results = []
        for course in similar_courses:
            score = 0
            if course.seitech_category_id in categories:
                score += 50
            tag_overlap = len(set(course.tag_ids.ids) & set(tags.ids))
            score += min(tag_overlap * 10, 50)
            
            if score > 30:  # Threshold
                results.append({
                    'course_id': course.id,
                    'score': score,
                    'algorithm': 'content',
                    'reason_type': 'course_similarity',
                    'reason_text': f'Similar to courses you completed: {liked_courses[0].channel_id.name}',
                    'data': {'tag_overlap': tag_overlap},
                })
        
        return sorted(results, key=lambda x: x['score'], reverse=True)[:limit]

    @api.model
    def _skill_gap_recommendations(self, user_id, limit=10):
        """Recommend courses to fill skill gaps."""
        # Get user's active learning paths
        paths = self.env['seitech.learning.path'].search([
            ('user_id', '=', user_id),
            ('state', '=', 'active'),
        ])
        
        if not paths:
            return []
        
        # Collect target skills from paths
        target_skills = []
        for path in paths:
            target_skills.extend([
                (skill.id, 'intermediate') for skill in path.skill_ids
            ])
        
        # Get skill gaps
        gaps = self.env['seitech.user.skill'].get_skill_gaps(user_id, target_skills)
        
        # Find courses teaching these skills
        results = []
        for gap in gaps[:limit]:
            courses = self.env['seitech.course.skill'].get_courses_teaching_skill(
                gap['skill_id'],
                level=gap['target_level']
            )
            
            for course in courses:
                skill = self.env['seitech.skill'].browse(gap['skill_id'])
                results.append({
                    'course_id': course.id,
                    'score': 80 + gap['gap_size'] * 4,  # Higher score for bigger gaps
                    'algorithm': 'skill_gap',
                    'reason_type': 'skill_requirement',
                    'reason_text': f'Builds {skill.name} skills needed for your learning path',
                    'data': {'gap_size': gap['gap_size']},
                })
        
        return sorted(results, key=lambda x: x['score'], reverse=True)[:limit]

    @api.model
    def _trending_recommendations(self, user_id, limit=10):
        """Recommend trending courses."""
        # Get courses with high recent enrollment
        thirty_days_ago = fields.Datetime.now() - timedelta(days=30)
        
        recent_enrollments = self.env['seitech.enrollment'].read_group(
            [('create_date', '>=', thirty_days_ago)],
            ['channel_id'],
            ['channel_id'],
        )
        
        # Sort by enrollment count
        trending = sorted(
            recent_enrollments,
            key=lambda x: x['channel_id_count'],
            reverse=True
        )[:limit]
        
        results = []
        for item in trending:
            course = self.env['slide.channel'].browse(item['channel_id'][0])
            results.append({
                'course_id': course.id,
                'score': min(item['channel_id_count'] * 2, 100),
                'algorithm': 'trending',
                'reason_type': 'trending',
                'reason_text': f'Currently trending with {item["channel_id_count"]} new enrollments',
                'data': {'enrollment_count': item['channel_id_count']},
            })
        
        return results

    @api.model
    def _hybrid_recommendations(self, user_id, limit=10):
        """Combine multiple algorithms for best recommendations."""
        all_recs = []
        
        # Get from each algorithm (fewer per algorithm)
        per_algo = max(3, limit // 4)
        
        all_recs.extend(self._skill_gap_recommendations(user_id, per_algo))
        all_recs.extend(self._collaborative_filtering(user_id, per_algo))
        all_recs.extend(self._content_based_filtering(user_id, per_algo))
        all_recs.extend(self._trending_recommendations(user_id, per_algo))
        
        # Remove duplicates (keep highest score)
        seen_courses = {}
        for rec in all_recs:
            cid = rec['course_id']
            if cid not in seen_courses or rec['score'] > seen_courses[cid]['score']:
                seen_courses[cid] = rec
                seen_courses[cid]['algorithm'] = 'hybrid'
        
        # Sort and limit
        results = sorted(
            seen_courses.values(),
            key=lambda x: x['score'],
            reverse=True
        )[:limit]
        
        return results

    @api.model
    def _cleanup_expired_recommendations(self, user_id):
        """Remove expired recommendations."""
        expired = self.search([
            ('user_id', '=', user_id),
            ('is_expired', '=', True),
        ])
        expired.unlink()

    @api.model
    def get_user_recommendations(self, user_id, status='pending', limit=10):
        """Get existing recommendations for a user."""
        return self.search([
            ('user_id', '=', user_id),
            ('status', '=', status),
            ('is_expired', '=', False),
        ], limit=limit, order='score desc')

    def name_get(self):
        """Custom name display."""
        result = []
        for record in self:
            name = f'{record.course_name} (Score: {record.score:.0f})'
            result.append((record.id, name))
        return result
