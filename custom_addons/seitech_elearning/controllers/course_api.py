# -*- coding: utf-8 -*-
import json
from odoo import http
from odoo.http import request


class CourseApiController(http.Controller):
    """REST API for courses - consumed by Next.js frontend."""

    def _json_response(self, data, status=200):
        """Return a JSON response."""
        return request.make_response(
            json.dumps(data),
            headers=[
                ('Content-Type', 'application/json'),
                ('Access-Control-Allow-Origin', '*'),
                ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
                ('Access-Control-Allow-Headers', 'Content-Type'),
            ],
            status=status
        )

    def _get_course_data(self, course):
        """Format course data for API response."""
        return {
            'id': course.id,
            'name': course.name,
            'slug': course.seo_name or str(course.id),
            'description': course.description or '',
            'shortDescription': course.description_short or '',
            'imageUrl': f'/web/image/slide.channel/{course.id}/image_1920' if course.image_1920 else None,
            'thumbnailUrl': f'/web/image/slide.channel/{course.id}/image_512' if course.image_512 else None,
            'listPrice': course.list_price or 0,
            'discountPrice': course.sale_price if course.sale_price and course.sale_price < course.list_price else None,
            'currency': course.currency_id.name if course.currency_id else 'GBP',
            'categoryId': course.seitech_category_id.id if course.seitech_category_id else None,
            'categoryName': course.seitech_category_id.name if course.seitech_category_id else '',
            'deliveryMethod': course.channel_type or 'training',
            'difficultyLevel': course.difficulty_level or 'beginner',
            'accreditation': None,  # Add if field exists
            'duration': course.total_time or 0,
            'totalSlides': course.total_slides or 0,
            'totalQuizzes': course.nbr_quiz or 0,
            'ratingAvg': course.rating_avg or 0,
            'ratingCount': course.rating_count or 0,
            'enrollmentCount': course.enrollment_count or course.members_count or 0,
            'instructorId': course.primary_instructor_id.id if course.primary_instructor_id else None,
            'instructorName': course.primary_instructor_id.name if course.primary_instructor_id else (course.user_id.name if course.user_id else ''),
            'instructorAvatar': f'/web/image/seitech.instructor/{course.primary_instructor_id.id}/image' if course.primary_instructor_id and course.primary_instructor_id.image else None,
            'outcomes': course.learning_outcomes.split('\n') if course.learning_outcomes else [],
            'requirements': course.prerequisites.split('\n') if course.prerequisites else [],
            'targetAudience': course.target_audience or '',
            'metaTitle': course.meta_title or course.name,
            'metaDescription': course.meta_description or course.description_short or '',
            'keywords': course.meta_keywords.split(',') if course.meta_keywords else [],
            'isPublished': course.is_published,
            'isFeatured': False,  # Add field if exists
            'isPaid': course.is_paid,
            'createdAt': course.create_date.isoformat() if course.create_date else None,
            'updatedAt': course.write_date.isoformat() if course.write_date else None,
        }

    @http.route('/api/courses', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def get_courses(self, **kwargs):
        """
        Get list of published courses with filtering and pagination.

        Query params:
            - page: Page number (default: 1)
            - limit: Items per page (default: 12)
            - category: Category slug or ID
            - level: beginner, intermediate, advanced
            - delivery: e-learning, face-to-face, virtual, in-house
            - search: Search term
            - sortBy: popularity, price-asc, price-desc, rating, newest
        """
        try:
            Channel = request.env['slide.channel'].sudo()

            # Build domain
            domain = [('is_published', '=', True)]

            # Category filter
            if kwargs.get('category'):
                try:
                    cat_id = int(kwargs['category'])
                    domain.append(('seitech_category_id', '=', cat_id))
                except ValueError:
                    # Try slug lookup
                    Category = request.env['seitech.course.category'].sudo()
                    cat = Category.search([('slug', '=', kwargs['category'])], limit=1)
                    if cat:
                        domain.append(('seitech_category_id', '=', cat.id))

            # Level filter
            if kwargs.get('level'):
                domain.append(('difficulty_level', '=', kwargs['level']))

            # Search filter
            if kwargs.get('search'):
                domain += [
                    '|', '|',
                    ('name', 'ilike', kwargs['search']),
                    ('description', 'ilike', kwargs['search']),
                    ('description_short', 'ilike', kwargs['search']),
                ]

            # Price filter
            if kwargs.get('priceMin'):
                domain.append(('list_price', '>=', float(kwargs['priceMin'])))
            if kwargs.get('priceMax'):
                domain.append(('list_price', '<=', float(kwargs['priceMax'])))

            # Sorting
            sort_by = kwargs.get('sortBy', 'popularity')
            order_mapping = {
                'popularity': 'enrollment_count desc, create_date desc',
                'newest': 'create_date desc',
                'rating': 'rating_avg desc',
                'price-asc': 'list_price asc',
                'price-desc': 'list_price desc',
            }
            order = order_mapping.get(sort_by, 'enrollment_count desc')

            # Pagination
            page = int(kwargs.get('page', 1))
            limit = min(int(kwargs.get('limit', 12)), 100)
            offset = (page - 1) * limit

            # Get total count
            total = Channel.search_count(domain)

            # Get courses
            courses = Channel.search(domain, offset=offset, limit=limit, order=order)

            # Get categories for filter options
            Category = request.env['seitech.course.category'].sudo()
            categories = Category.search([('is_published', '=', True)])
            category_data = [{
                'id': cat.id,
                'name': cat.name,
                'slug': cat.slug or str(cat.id),
                'description': cat.description or '',
                'courseCount': cat.course_count or 0,
                'parentId': cat.parent_id.id if cat.parent_id else None,
            } for cat in categories]

            return self._json_response({
                'success': True,
                'data': {
                    'courses': [self._get_course_data(c) for c in courses],
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total,
                        'totalPages': (total + limit - 1) // limit,
                    },
                    'categories': category_data,
                    'filters': {
                        'levels': ['beginner', 'intermediate', 'advanced'],
                        'deliveryMethods': ['e-learning', 'face-to-face', 'virtual', 'in-house'],
                        'priceRange': {'min': 0, 'max': 5000},
                    },
                },
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e),
                'data': None,
            }, status=500)

    @http.route('/api/courses/slug/<string:slug>', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def get_course_by_slug(self, slug, **kwargs):
        """Get single course details by slug."""
        try:
            Channel = request.env['slide.channel'].sudo()
            # Search by seo_name (slug) or by ID if numeric
            course = Channel.search([
                ('seo_name', '=', slug),
                ('is_published', '=', True),
            ], limit=1)

            if not course:
                # Try searching by ID as fallback
                try:
                    course_id = int(slug)
                    course = Channel.browse(course_id)
                    if not course.exists() or not course.is_published:
                        course = None
                except (ValueError, TypeError):
                    course = None

            if not course:
                return self._json_response({
                    'success': False,
                    'message': 'Course not found',
                    'data': None,
                }, status=404)

            return self._get_course_detail_response(course)
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e),
                'data': None,
            }, status=500)

    def _get_course_detail_response(self, course):
        """Build detailed course response with curriculum and FAQs."""
        # Get curriculum (slides grouped by category)
        curriculum = []
        if course.slide_ids:
            categories_map = {}
            for slide in course.slide_ids.sorted(key=lambda s: s.sequence):
                cat_id = slide.category_id.id if slide.category_id else 0
                cat_name = slide.category_id.name if slide.category_id else 'Uncategorized'

                if cat_id not in categories_map:
                    categories_map[cat_id] = {
                        'id': cat_id,
                        'name': cat_name,
                        'slides': [],
                    }

                categories_map[cat_id]['slides'].append({
                    'id': slide.id,
                    'name': slide.name,
                    'slideType': slide.slide_type,
                    'duration': slide.completion_time or 0,
                    'isPreview': slide.is_preview or False,
                })

            curriculum = list(categories_map.values())

        # Get course FAQs (if slide.channel.faq model exists)
        faqs = []
        try:
            if hasattr(course, 'faq_ids') and course.faq_ids:
                faqs = [{'question': f.question, 'answer': f.answer} for f in course.faq_ids]
        except Exception:
            pass

        course_data = self._get_course_data(course)
        course_data['curriculum'] = curriculum
        course_data['faqs'] = faqs

        return self._json_response({
            'success': True,
            'data': course_data,
        })

    @http.route('/api/courses/<int:course_id>', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def get_course_detail(self, course_id, **kwargs):
        """Get single course details by ID."""
        try:
            Channel = request.env['slide.channel'].sudo()
            course = Channel.browse(course_id)

            if not course.exists() or not course.is_published:
                return self._json_response({
                    'success': False,
                    'message': 'Course not found',
                    'data': None,
                }, status=404)

            return self._get_course_detail_response(course)
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e),
                'data': None,
            }, status=500)

    @http.route('/api/courses/featured', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def get_featured_courses(self, **kwargs):
        """Get featured/popular courses for homepage."""
        try:
            Channel = request.env['slide.channel'].sudo()
            limit = int(kwargs.get('limit', 6))

            courses = Channel.search([
                ('is_published', '=', True),
            ], limit=limit, order='members_count desc, rating_avg desc')

            return self._json_response({
                'success': True,
                'data': [self._get_course_data(c) for c in courses],
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e),
                'data': None,
            }, status=500)

    @http.route('/api/categories', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def get_categories(self, **kwargs):
        """Get course categories."""
        try:
            Category = request.env['seitech.course.category'].sudo()
            categories = Category.search([('is_published', '=', True)], order='sequence, name')

            data = [{
                'id': cat.id,
                'name': cat.name,
                'slug': cat.slug or str(cat.id),
                'description': cat.description or '',
                'icon': cat.icon or '',
                'imageUrl': f'/web/image/seitech.course.category/{cat.id}/image' if cat.image else None,
                'courseCount': cat.course_count or 0,
                'parentId': cat.parent_id.id if cat.parent_id else None,
                'children': [{
                    'id': c.id,
                    'name': c.name,
                    'slug': c.slug or str(c.id),
                    'courseCount': c.course_count or 0,
                } for c in cat.child_ids.filtered('is_published')],
            } for cat in categories.filtered(lambda c: not c.parent_id)]

            return self._json_response({
                'success': True,
                'data': data,
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e),
                'data': None,
            }, status=500)
