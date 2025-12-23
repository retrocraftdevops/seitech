# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request


class SeitectElearningMain(http.Controller):
    """Main website controllers for e-learning."""

    @http.route('/courses', type='http', auth='public', website=True)
    def courses_page(self, category=None, search=None, price=None, level=None,
                     language=None, rating=None, sort_by=None, page=1, **kwargs):
        """
        Course listing page with full filtering support.
        
        Migrated from PHP: courses_page.php + courses_page_sidebar.php
        Filters: category, price (free/paid), level, language, rating
        """
        Channel = request.env['slide.channel'].sudo()
        Category = request.env['seitech.course.category'].sudo()
        Language = request.env['res.lang'].sudo()

        domain = [('is_published', '=', True)]

        # Category filter
        selected_category = category if category and category != 'all' else None
        if selected_category:
            try:
                cat_id = int(selected_category)
                # Include subcategories
                cat_obj = Category.browse(cat_id)
                if cat_obj.exists():
                    cat_ids = [cat_id] + cat_obj.child_ids.ids
                    domain.append(('seitech_category_id', 'in', cat_ids))
            except (ValueError, TypeError):
                pass

        # Search filter
        if search:
            domain += [
                '|', '|',
                ('name', 'ilike', search),
                ('description', 'ilike', search),
                ('seitech_category_id.name', 'ilike', search),
            ]

        # Price filter
        selected_price = price if price and price != 'all' else None
        if selected_price == 'free':
            domain.append(('is_paid', '=', False))
        elif selected_price == 'paid':
            domain.append(('is_paid', '=', True))

        # Level filter
        selected_level = level if level and level != 'all' else None
        if selected_level in ['beginner', 'intermediate', 'advanced']:
            domain.append(('difficulty_level', '=', selected_level))

        # Language filter
        selected_language = language if language and language != 'all' else None
        if selected_language:
            domain.append(('course_language', '=', selected_language))

        # Rating filter
        selected_rating = rating if rating and rating != 'all' else None
        if selected_rating:
            try:
                rating_val = int(selected_rating)
                domain.append(('rating_avg', '>=', rating_val))
            except (ValueError, TypeError):
                pass

        # Sorting
        selected_sorting = sort_by or 'popularity'
        order_mapping = {
            'popularity': 'members_count desc, create_date desc',
            'newest': 'create_date desc',
            'rating': 'rating_avg desc, rating_count desc',
            'price_asc': 'list_price asc',
            'price_desc': 'list_price desc',
        }
        order = order_mapping.get(selected_sorting, 'create_date desc')

        # Get total count before pagination
        total_courses = Channel.search_count(domain)

        # Pagination
        per_page = 12
        pager = request.website.pager(
            url='/courses',
            total=total_courses,
            page=int(page),
            step=per_page,
            url_args={
                'category': category,
                'search': search,
                'price': price,
                'level': level,
                'language': language,
                'rating': rating,
                'sort_by': sort_by,
            },
        )

        courses = Channel.search(
            domain,
            limit=per_page,
            offset=pager['offset'],
            order=order,
        )

        # Get categories with course counts
        categories = Category.search([
            ('is_published', '=', True),
            ('parent_id', '=', False),
        ])

        # Get available languages
        languages = Language.search([('active', '=', True)])

        # Build active filters list for display
        active_filters = []
        base_url = '/courses?'
        url_params = []
        if search:
            url_params.append(f'search={search}')
        
        if selected_category:
            cat_obj = Category.browse(int(selected_category))
            if cat_obj.exists():
                remove_url = base_url + '&'.join([p for p in url_params if not p.startswith('category=')])
                active_filters.append({
                    'type': 'category',
                    'label': f'Category: {cat_obj.name}',
                    'remove_url': remove_url or '/courses',
                })
        
        if selected_price:
            active_filters.append({
                'type': 'price',
                'label': f'Price: {selected_price.capitalize()}',
                'remove_url': '/courses',
            })
        
        if selected_level:
            active_filters.append({
                'type': 'level',
                'label': f'Level: {selected_level.capitalize()}',
                'remove_url': '/courses',
            })
        
        if selected_rating:
            active_filters.append({
                'type': 'rating',
                'label': f'Rating: {selected_rating}+ stars',
                'remove_url': '/courses',
            })

        return request.render('seitech_elearning.courses_page', {
            'courses': courses,
            'categories': categories,
            'languages': languages,
            'total_courses': total_courses,
            'search': search,
            'selected_category': selected_category,
            'selected_price': selected_price,
            'selected_level': selected_level,
            'selected_language': selected_language,
            'selected_rating': selected_rating,
            'selected_sorting': selected_sorting,
            'active_filters': active_filters,
            'pager': pager,
        })

    @http.route('/my/dashboard', type='http', auth='user', website=True)
    def student_dashboard(self, **kwargs):
        """Student dashboard page."""
        user = request.env.user
        Enrollment = request.env['seitech.enrollment'].sudo()
        Certificate = request.env['seitech.certificate'].sudo()
        StudentBadge = request.env['seitech.student.badge'].sudo()
        StudentPoints = request.env['seitech.student.points'].sudo()
        Schedule = request.env['seitech.schedule'].sudo()
        ScheduleAttendee = request.env['seitech.schedule.attendee'].sudo()

        # Get enrollments
        enrollments = Enrollment.search([
            ('user_id', '=', user.id),
            ('state', 'in', ['active', 'completed']),
        ], order='last_activity_date desc', limit=5)

        # Get certificates
        certificates = Certificate.search([
            ('user_id', '=', user.id),
            ('state', '=', 'issued'),
        ])

        # Get badges
        badges = StudentBadge.search([('user_id', '=', user.id)])

        # Get points
        points = StudentPoints.search([('user_id', '=', user.id)])
        total_points = sum(p.points for p in points)

        # Get upcoming classes
        attendee_records = ScheduleAttendee.search([
            ('user_id', '=', user.id),
            ('state', '=', 'registered'),
        ])
        upcoming_classes = Schedule.search([
            ('id', 'in', attendee_records.mapped('schedule_id').ids),
            ('state', '=', 'scheduled'),
            ('start_datetime', '>=', request.env['fields'].Datetime.now()),
        ], order='start_datetime', limit=3)

        # Stats
        stats = {
            'enrolled_courses': Enrollment.search_count([
                ('user_id', '=', user.id),
                ('state', '=', 'active'),
            ]),
            'completed_courses': Enrollment.search_count([
                ('user_id', '=', user.id),
                ('state', '=', 'completed'),
            ]),
            'certificates': len(certificates),
            'total_points': total_points,
        }

        return request.render('seitech_elearning.student_dashboard', {
            'enrollments': enrollments,
            'certificates': certificates,
            'badges': badges,
            'upcoming_classes': upcoming_classes,
            'stats': stats,
        })

    @http.route('/my/courses', type='http', auth='user', website=True)
    def my_courses(self, **kwargs):
        """User's enrolled courses page."""
        user = request.env.user
        Enrollment = request.env['seitech.enrollment'].sudo()

        enrollments = Enrollment.search([
            ('user_id', '=', user.id),
        ], order='create_date desc')

        return request.render('seitech_elearning.my_courses', {
            'enrollments': enrollments,
        })

    @http.route('/my/certificates', type='http', auth='user', website=True)
    def my_certificates(self, **kwargs):
        """User's certificates page."""
        user = request.env.user
        Certificate = request.env['seitech.certificate'].sudo()

        certificates = Certificate.search([
            ('user_id', '=', user.id),
            ('state', '=', 'issued'),
        ], order='issue_date desc')

        return request.render('seitech_elearning.my_certificates', {
            'certificates': certificates,
        })

    @http.route('/course/<model("slide.channel"):course>', type='http', auth='public', website=True)
    def course_detail(self, course, **kwargs):
        """
        Course detail page with full information.
        
        Migrated from PHP: course_page.php
        Features: Overview, Curriculum, Instructor, Reviews tabs
        """
        if not course.is_published and not request.env.user.has_group('website.group_website_designer'):
            return request.not_found()

        # Check if user is enrolled
        is_enrolled = False
        if not request.env.user._is_public():
            Enrollment = request.env['seitech.enrollment'].sudo()
            is_enrolled = Enrollment.search_count([
                ('user_id', '=', request.env.user.id),
                ('channel_id', '=', course.id),
                ('state', 'in', ['active', 'completed']),
            ]) > 0

        # Get related courses (same category or similar)
        related_courses = []
        Channel = request.env['slide.channel'].sudo()
        if course.seitech_category_id:
            related_courses = Channel.search([
                ('id', '!=', course.id),
                ('is_published', '=', True),
                ('seitech_category_id', '=', course.seitech_category_id.id),
            ], limit=4)
        
        # If not enough related courses, get popular ones
        if len(related_courses) < 4:
            more_courses = Channel.search([
                ('id', '!=', course.id),
                ('id', 'not in', related_courses.ids if related_courses else []),
                ('is_published', '=', True),
            ], limit=4 - len(related_courses), order='members_count desc')
            related_courses = related_courses | more_courses

        # Quiz count
        quiz_count = len(course.slide_ids.filtered(lambda s: s.slide_type == 'quiz'))

        return request.render('seitech_website_theme.course_detail_page', {
            'course': course,
            'is_enrolled': is_enrolled,
            'related_courses': related_courses,
            'quiz_count': quiz_count,
        })

    @http.route('/course/wishlist/toggle', type='json', auth='user', website=True)
    def toggle_wishlist(self, course_id, **kwargs):
        """Toggle course in user's wishlist."""
        Wishlist = request.env['seitech.wishlist'].sudo()
        user = request.env.user

        existing = Wishlist.search([
            ('user_id', '=', user.id),
            ('channel_id', '=', course_id),
        ], limit=1)

        if existing:
            existing.unlink()
            return {'added': False, 'message': 'Removed from wishlist'}
        else:
            Wishlist.create({
                'user_id': user.id,
                'channel_id': course_id,
            })
            return {'added': True, 'message': 'Added to wishlist'}

    # =========================================================================
    # INSTRUCTOR ROUTES
    # Migrated from PHP: backend/user/dashboard.php, courses.php, payout_report.php
    # =========================================================================

    def _get_instructor_for_user(self, user=None):
        """Get instructor record for current user or return None."""
        user = user or request.env.user
        Instructor = request.env['seitech.instructor'].sudo()
        return Instructor.search([('user_id', '=', user.id)], limit=1)

    def _get_instructor_stats(self, instructor):
        """Calculate stats for instructor dashboard."""
        Channel = request.env['slide.channel'].sudo()
        Enrollment = request.env['seitech.enrollment'].sudo()

        # Get instructor's courses
        courses = Channel.search([
            '|',
            ('primary_instructor_id', '=', instructor.id),
            ('instructor_ids', 'in', [instructor.id]),
        ])

        active_courses = courses.filtered(lambda c: c.is_published)
        pending_courses = courses.filtered(lambda c: not c.is_published)
        free_courses = courses.filtered(lambda c: not c.is_paid)
        paid_courses = courses.filtered(lambda c: c.is_paid)

        # Get enrollments for instructor's courses
        enrollments = Enrollment.search([
            ('channel_id', 'in', courses.ids),
            ('state', 'in', ['active', 'completed']),
        ])

        # Calculate earnings
        total_earnings = sum(e.amount_paid or 0 for e in enrollments) * (instructor.commission_rate / 100)
        pending_balance = sum(
            e.amount_paid or 0 for e in enrollments.filtered(lambda e: e.state == 'active')
        ) * (instructor.commission_rate / 100)

        return {
            'total_courses': len(courses),
            'active_courses': len(active_courses),
            'pending_courses': len(pending_courses),
            'draft_courses': len(pending_courses),
            'free_courses': len(free_courses),
            'paid_courses': len(paid_courses),
            'total_students': len(enrollments.mapped('user_id')),
            'total_enrollments': len(enrollments),
            'total_earnings': total_earnings,
            'pending_balance': pending_balance,
            'total_paid': total_earnings - pending_balance,
        }

    @http.route('/instructor/<model("seitech.instructor"):instructor>', type='http', auth='public', website=True)
    def instructor_profile(self, instructor, **kwargs):
        """
        Public instructor profile page.
        
        Migrated from PHP: frontend/default-new/instructor_page.php
        """
        if instructor.state != 'active':
            return request.not_found()

        Channel = request.env['slide.channel'].sudo()
        courses = Channel.search([
            '|',
            ('primary_instructor_id', '=', instructor.id),
            ('instructor_ids', 'in', [instructor.id]),
            ('is_published', '=', True),
        ], order='members_count desc', limit=20)

        return request.render('seitech_elearning.instructor_profile_page', {
            'instructor': instructor,
            'courses': courses,
        })

    @http.route('/instructors', type='http', auth='public', website=True)
    def instructors_list(self, **kwargs):
        """List all active instructors."""
        Instructor = request.env['seitech.instructor'].sudo()
        instructors = Instructor.search([
            ('state', '=', 'active'),
        ], order='is_featured desc, course_count desc')

        return request.render('seitech_elearning.instructors_list', {
            'instructors': instructors,
        })

    @http.route('/instructor/dashboard', type='http', auth='user', website=True)
    def instructor_dashboard(self, **kwargs):
        """
        Instructor dashboard with stats and overview.
        
        Migrated from PHP: backend/user/dashboard.php
        """
        instructor = self._get_instructor_for_user()
        if not instructor:
            return request.redirect('/become-instructor')

        stats = self._get_instructor_stats(instructor)

        # Get recent enrollments
        Channel = request.env['slide.channel'].sudo()
        Enrollment = request.env['seitech.enrollment'].sudo()
        
        instructor_courses = Channel.search([
            '|',
            ('primary_instructor_id', '=', instructor.id),
            ('instructor_ids', 'in', [instructor.id]),
        ])

        recent_enrollments = Enrollment.search([
            ('channel_id', 'in', instructor_courses.ids),
        ], order='create_date desc', limit=10)

        return request.render('seitech_elearning.instructor_dashboard', {
            'instructor': instructor,
            'stats': stats,
            'recent_enrollments': recent_enrollments,
            'active_menu': 'dashboard',
        })

    @http.route('/instructor/courses', type='http', auth='user', website=True)
    def instructor_courses(self, **kwargs):
        """
        Instructor courses list.
        
        Migrated from PHP: backend/user/courses.php
        """
        instructor = self._get_instructor_for_user()
        if not instructor:
            return request.redirect('/become-instructor')

        Channel = request.env['slide.channel'].sudo()
        courses = Channel.search([
            '|',
            ('primary_instructor_id', '=', instructor.id),
            ('instructor_ids', 'in', [instructor.id]),
        ], order='create_date desc')

        stats = self._get_instructor_stats(instructor)

        return request.render('seitech_elearning.instructor_courses', {
            'instructor': instructor,
            'courses': courses,
            'stats': stats,
            'active_menu': 'courses',
        })

    @http.route('/instructor/earnings', type='http', auth='user', website=True)
    def instructor_earnings(self, **kwargs):
        """
        Instructor earnings and payout page.
        
        Migrated from PHP: backend/user/payout_report.php
        """
        instructor = self._get_instructor_for_user()
        if not instructor:
            return request.redirect('/become-instructor')

        stats = self._get_instructor_stats(instructor)

        # For now, transactions is empty - would need an InstructorTransaction model
        transactions = []

        return request.render('seitech_elearning.instructor_earnings', {
            'instructor': instructor,
            'stats': stats,
            'transactions': transactions,
            'active_menu': 'earnings',
        })

