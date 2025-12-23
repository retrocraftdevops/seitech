# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from odoo.exceptions import AccessError


class EnrollmentController(http.Controller):
    """Controllers for course enrollment."""

    @http.route('/course/<int:course_id>/enroll', type='http', auth='user', website=True)
    def enroll_course(self, course_id, **kwargs):
        """Enroll in a course."""
        Channel = request.env['slide.channel'].sudo()
        Enrollment = request.env['seitech.enrollment'].sudo()
        user = request.env.user

        course = Channel.browse(course_id)
        if not course.exists() or not course.is_published:
            return request.redirect('/courses')

        # Check if already enrolled
        existing = Enrollment.search([
            ('channel_id', '=', course_id),
            ('user_id', '=', user.id),
        ], limit=1)

        if existing:
            return request.redirect(f'/slides/{course_id}')

        # Check enrollment availability
        if not course.is_enrollment_open:
            return request.render('seitech_elearning.enrollment_closed', {
                'course': course,
            })

        # Free course - direct enrollment
        if not course.is_paid:
            enrollment = Enrollment.create({
                'channel_id': course_id,
                'user_id': user.id,
                'enrollment_type': 'free',
                'state': 'active',
            })
            enrollment.action_activate()
            return request.redirect(f'/slides/{course_id}')

        # Paid course - redirect to checkout
        return request.redirect(f'/course/{course_id}/checkout')

    @http.route('/course/<int:course_id>/checkout', type='http', auth='user', website=True)
    def course_checkout(self, course_id, **kwargs):
        """Checkout page for paid courses."""
        Channel = request.env['slide.channel'].sudo()
        course = Channel.browse(course_id)

        if not course.exists() or not course.is_published:
            return request.redirect('/courses')

        if not course.is_paid:
            return request.redirect(f'/course/{course_id}/enroll')

        # Create or get product
        if not course.product_id:
            course.action_create_product()

        return request.render('seitech_elearning.course_checkout', {
            'course': course,
        })

    @http.route('/course/enrollment/confirm', type='json', auth='user')
    def confirm_enrollment(self, course_id, payment_data=None, **kwargs):
        """Confirm enrollment after payment."""
        Channel = request.env['slide.channel'].sudo()
        Enrollment = request.env['seitech.enrollment'].sudo()
        user = request.env.user

        course = Channel.browse(course_id)
        if not course.exists():
            return {'success': False, 'error': 'Course not found'}

        # Check if already enrolled
        existing = Enrollment.search([
            ('channel_id', '=', course_id),
            ('user_id', '=', user.id),
        ], limit=1)

        if existing:
            return {'success': True, 'redirect': f'/slides/{course_id}'}

        # Create enrollment
        enrollment_type = 'paid' if course.is_paid else 'free'
        enrollment = Enrollment.create({
            'channel_id': course_id,
            'user_id': user.id,
            'enrollment_type': enrollment_type,
            'amount_paid': course.list_price if course.is_paid else 0,
            'state': 'active',
        })
        enrollment.action_activate()

        return {'success': True, 'redirect': f'/slides/{course_id}'}

    @http.route('/api/enrollment/progress', type='json', auth='user')
    def update_progress(self, enrollment_id=None, slide_id=None, completed=False, **kwargs):
        """Update lesson progress via API."""
        user = request.env.user

        if slide_id:
            # Mark slide as completed
            Slide = request.env['slide.slide'].sudo()
            slide = Slide.browse(slide_id)
            if slide.exists():
                slide._action_set_completed(user.partner_id)

                # Update enrollment activity
                Enrollment = request.env['seitech.enrollment'].sudo()
                enrollment = Enrollment.search([
                    ('channel_id', '=', slide.channel_id.id),
                    ('user_id', '=', user.id),
                ], limit=1)
                if enrollment:
                    enrollment.last_activity_date = request.env['fields'].Datetime.now()

                    # Check if course is completed
                    if enrollment.completion_percentage >= 100:
                        enrollment.action_complete()

                return {'success': True, 'completed': True}

        return {'success': False}

    @http.route('/api/enrollment/time', type='json', auth='user')
    def update_time_spent(self, enrollment_id, minutes, **kwargs):
        """Update time spent on course."""
        Enrollment = request.env['seitech.enrollment'].sudo()
        user = request.env.user

        enrollment = Enrollment.browse(enrollment_id)
        if enrollment.exists() and enrollment.user_id.id == user.id:
            enrollment.time_spent += minutes
            enrollment.last_activity_date = request.env['fields'].Datetime.now()
            return {'success': True}

        return {'success': False}
