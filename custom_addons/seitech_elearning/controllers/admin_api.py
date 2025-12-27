# -*- coding: utf-8 -*-
import json
import logging
from odoo import http
from odoo.http import request
from odoo.exceptions import AccessDenied, ValidationError

_logger = logging.getLogger(__name__)


class AdminApiController(http.Controller):
    """REST API for admin dashboard - consumed by Next.js frontend."""

    def _json_response(self, data, status=200):
        """Return a JSON response."""
        return request.make_response(
            json.dumps(data),
            headers=[
                ('Content-Type', 'application/json'),
                ('Access-Control-Allow-Origin', '*'),
                ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'),
                ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
                ('Access-Control-Allow-Credentials', 'true'),
            ],
            status=status
        )

    def _check_admin_access(self):
        """Check if user has admin/manager access."""
        user = request.env.user
        if not user or user._is_public():
            return False, 'Unauthorized'

        # Check if user has admin groups
        is_admin = user.has_group('base.group_system')
        is_manager = user.has_group('website_slides.group_website_slides_manager')

        if not (is_admin or is_manager):
            # Also check if user is an active instructor (they can manage their own content)
            instructor = request.env['seitech.instructor'].sudo().search([
                ('user_id', '=', user.id),
                ('state', '=', 'active')
            ], limit=1)
            if not instructor:
                return False, 'Insufficient permissions'
            return True, 'instructor'

        return True, 'admin' if is_admin else 'manager'

    # ============================================================================
    # Dashboard Analytics
    # ============================================================================

    @http.route('/api/admin/analytics/overview', type='http', auth='user', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def get_dashboard_overview(self, **kwargs):
        """Get dashboard overview analytics."""
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({})

        try:
            has_access, result = self._check_admin_access()
            if not has_access:
                return self._json_response({
                    'success': False,
                    'message': result
                }, status=403)

            # Get counts
            total_users = request.env['res.users'].sudo().search_count([
                ('active', '=', True),
                ('share', '=', False)
            ])
            total_courses = request.env['slide.channel'].sudo().search_count([])
            total_enrollments = request.env['seitech.enrollment'].sudo().search_count([])
            total_instructors = request.env['seitech.instructor'].sudo().search_count([
                ('state', '=', 'active')
            ])

            # Calculate revenue (from paid enrollments)
            enrollments = request.env['seitech.enrollment'].sudo().search([
                ('state', 'in', ['active', 'completed']),
                ('enrollment_type', '=', 'paid')
            ])
            total_revenue = sum(enrollments.mapped('amount_paid'))

            # Active enrollments
            active_enrollments = request.env['seitech.enrollment'].sudo().search_count([
                ('state', '=', 'active')
            ])

            # Recent enrollments (last 30 days)
            from datetime import datetime, timedelta
            thirty_days_ago = datetime.now() - timedelta(days=30)
            recent_enrollments = request.env['seitech.enrollment'].sudo().search_count([
                ('enrollment_date', '>=', thirty_days_ago)
            ])

            # Certificates issued
            total_certificates = request.env['seitech.certificate'].sudo().search_count([
                ('state', '=', 'issued')
            ])

            return self._json_response({
                'success': True,
                'data': {
                    'totalUsers': total_users,
                    'totalCourses': total_courses,
                    'totalEnrollments': total_enrollments,
                    'totalInstructors': total_instructors,
                    'totalRevenue': total_revenue,
                    'activeEnrollments': active_enrollments,
                    'recentEnrollments': recent_enrollments,
                    'totalCertificates': total_certificates,
                }
            })
        except Exception as e:
            _logger.exception('Get dashboard overview error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    # ============================================================================
    # User Management
    # ============================================================================

    @http.route('/api/admin/users', type='http', auth='user', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def list_users(self, **kwargs):
        """List users with pagination, search, and filtering."""
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({})

        try:
            has_access, result = self._check_admin_access()
            if not has_access:
                return self._json_response({
                    'success': False,
                    'message': result
                }, status=403)

            User = request.env['res.users'].sudo()

            # Build domain
            domain = [('active', '=', True), ('share', '=', False)]

            # Search filter
            search = kwargs.get('search', '').strip()
            if search:
                domain += [
                    '|', '|',
                    ('name', 'ilike', search),
                    ('login', 'ilike', search),
                    ('partner_id.email', 'ilike', search)
                ]

            # Role filter - check groups
            role = kwargs.get('role', '').strip()
            if role == 'admin':
                domain.append(('groups_id', 'in', [request.env.ref('base.group_system').id]))
            elif role == 'instructor':
                # Users who have instructor records
                instructors = request.env['seitech.instructor'].sudo().search([
                    ('state', '=', 'active')
                ])
                domain.append(('id', 'in', instructors.mapped('user_id').ids))

            # Pagination
            page = int(kwargs.get('page', 1))
            limit = min(int(kwargs.get('limit', 20)), 100)
            offset = (page - 1) * limit

            # Get total count
            total = User.search_count(domain)

            # Get users
            users = User.search(domain, offset=offset, limit=limit, order='create_date desc')

            # Format user data
            user_data = []
            for user in users:
                # Check if instructor
                instructor = request.env['seitech.instructor'].sudo().search([
                    ('user_id', '=', user.id)
                ], limit=1)

                # Get enrollment count
                enrollment_count = request.env['seitech.enrollment'].sudo().search_count([
                    ('user_id', '=', user.id)
                ])

                user_data.append({
                    'id': user.id,
                    'name': user.name,
                    'email': user.login,
                    'phone': user.partner_id.phone or '',
                    'image': f'/web/image/res.partner/{user.partner_id.id}/image_128' if user.partner_id.image_128 else None,
                    'isAdmin': user.has_group('base.group_system'),
                    'isInstructor': bool(instructor),
                    'instructorId': instructor.id if instructor else None,
                    'enrollmentCount': enrollment_count,
                    'active': user.active,
                    'createdAt': user.create_date.isoformat() if user.create_date else None,
                    'lastLogin': user.login_date.isoformat() if user.login_date else None,
                })

            return self._json_response({
                'success': True,
                'data': {
                    'users': user_data,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total,
                        'totalPages': (total + limit - 1) // limit,
                    }
                }
            })
        except Exception as e:
            _logger.exception('List users error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    @http.route('/api/admin/users', type='http', auth='user', methods=['POST'], csrf=False, cors='*')
    def create_user(self, **kwargs):
        """Create a new user."""
        try:
            has_access, result = self._check_admin_access()
            if not has_access or result == 'instructor':
                return self._json_response({
                    'success': False,
                    'message': 'Insufficient permissions'
                }, status=403)

            data = json.loads(request.httprequest.data.decode('utf-8'))
            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '')
            is_instructor = data.get('isInstructor', False)

            if not name or not email or not password:
                return self._json_response({
                    'success': False,
                    'message': 'Name, email, and password are required'
                }, status=400)

            # Check if user already exists
            User = request.env['res.users'].sudo()
            existing = User.search([('login', '=', email)], limit=1)
            if existing:
                return self._json_response({
                    'success': False,
                    'message': 'A user with this email already exists'
                }, status=409)

            # Create user
            portal_group = request.env.ref('base.group_portal')
            user = User.create({
                'name': name,
                'login': email,
                'password': password,
                'groups_id': [(6, 0, [portal_group.id])],
            })

            # Create instructor profile if requested
            instructor = None
            if is_instructor:
                instructor = request.env['seitech.instructor'].sudo().create({
                    'name': name,
                    'user_id': user.id,
                    'email': email,
                    'state': 'active',
                })

            return self._json_response({
                'success': True,
                'message': 'User created successfully',
                'data': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.login,
                    'isInstructor': bool(instructor),
                    'instructorId': instructor.id if instructor else None,
                }
            })
        except Exception as e:
            _logger.exception('Create user error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    @http.route('/api/admin/users/<int:user_id>', type='http', auth='user', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def get_user(self, user_id, **kwargs):
        """Get user details."""
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({})

        try:
            has_access, result = self._check_admin_access()
            if not has_access:
                return self._json_response({
                    'success': False,
                    'message': result
                }, status=403)

            user = request.env['res.users'].sudo().browse(user_id)
            if not user.exists():
                return self._json_response({
                    'success': False,
                    'message': 'User not found'
                }, status=404)

            # Get instructor profile
            instructor = request.env['seitech.instructor'].sudo().search([
                ('user_id', '=', user.id)
            ], limit=1)

            # Get enrollments
            enrollments = request.env['seitech.enrollment'].sudo().search([
                ('user_id', '=', user.id)
            ])

            # Get certificates
            certificates = request.env['seitech.certificate'].sudo().search([
                ('user_id', '=', user.id),
                ('state', '=', 'issued')
            ])

            user_data = {
                'id': user.id,
                'name': user.name,
                'email': user.login,
                'phone': user.partner_id.phone or '',
                'image': f'/web/image/res.partner/{user.partner_id.id}/image_128' if user.partner_id.image_128 else None,
                'isAdmin': user.has_group('base.group_system'),
                'isInstructor': bool(instructor),
                'instructorId': instructor.id if instructor else None,
                'active': user.active,
                'enrollmentCount': len(enrollments),
                'certificateCount': len(certificates),
                'createdAt': user.create_date.isoformat() if user.create_date else None,
                'lastLogin': user.login_date.isoformat() if user.login_date else None,
            }

            return self._json_response({
                'success': True,
                'data': user_data
            })
        except Exception as e:
            _logger.exception('Get user error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    @http.route('/api/admin/users/<int:user_id>', type='http', auth='user', methods=['PUT'], csrf=False, cors='*')
    def update_user(self, user_id, **kwargs):
        """Update user details."""
        try:
            has_access, result = self._check_admin_access()
            if not has_access or result == 'instructor':
                return self._json_response({
                    'success': False,
                    'message': 'Insufficient permissions'
                }, status=403)

            data = json.loads(request.httprequest.data.decode('utf-8'))

            user = request.env['res.users'].sudo().browse(user_id)
            if not user.exists():
                return self._json_response({
                    'success': False,
                    'message': 'User not found'
                }, status=404)

            # Update user fields
            update_vals = {}
            if 'name' in data:
                update_vals['name'] = data['name'].strip()
            if 'email' in data:
                update_vals['login'] = data['email'].strip()
            if 'active' in data:
                update_vals['active'] = data['active']

            if update_vals:
                user.write(update_vals)

            # Update partner fields
            partner_vals = {}
            if 'phone' in data:
                partner_vals['phone'] = data['phone']
            if partner_vals:
                user.partner_id.write(partner_vals)

            return self._json_response({
                'success': True,
                'message': 'User updated successfully',
                'data': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.login,
                }
            })
        except Exception as e:
            _logger.exception('Update user error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    @http.route('/api/admin/users/<int:user_id>', type='http', auth='user', methods=['DELETE'], csrf=False, cors='*')
    def delete_user(self, user_id, **kwargs):
        """Delete (deactivate) user."""
        try:
            has_access, result = self._check_admin_access()
            if not has_access or result == 'instructor':
                return self._json_response({
                    'success': False,
                    'message': 'Insufficient permissions'
                }, status=403)

            user = request.env['res.users'].sudo().browse(user_id)
            if not user.exists():
                return self._json_response({
                    'success': False,
                    'message': 'User not found'
                }, status=404)

            # Deactivate instead of delete
            user.write({'active': False})

            return self._json_response({
                'success': True,
                'message': 'User deactivated successfully'
            })
        except Exception as e:
            _logger.exception('Delete user error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    # ============================================================================
    # Instructor Management
    # ============================================================================

    @http.route('/api/admin/instructors', type='http', auth='user', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def list_instructors(self, **kwargs):
        """List instructors with pagination and search."""
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({})

        try:
            has_access, result = self._check_admin_access()
            if not has_access:
                return self._json_response({
                    'success': False,
                    'message': result
                }, status=403)

            Instructor = request.env['seitech.instructor'].sudo()

            # Build domain
            domain = []

            # Search filter
            search = kwargs.get('search', '').strip()
            if search:
                domain += [
                    '|', '|',
                    ('name', 'ilike', search),
                    ('email', 'ilike', search),
                    ('expertise', 'ilike', search)
                ]

            # State filter
            state = kwargs.get('state', '').strip()
            if state:
                domain.append(('state', '=', state))

            # Pagination
            page = int(kwargs.get('page', 1))
            limit = min(int(kwargs.get('limit', 20)), 100)
            offset = (page - 1) * limit

            # Get total count
            total = Instructor.search_count(domain)

            # Get instructors
            instructors = Instructor.search(domain, offset=offset, limit=limit, order='create_date desc')

            # Format instructor data
            instructor_data = []
            for instructor in instructors:
                instructor_data.append({
                    'id': instructor.id,
                    'name': instructor.name,
                    'email': instructor.email or '',
                    'phone': instructor.phone or '',
                    'title': instructor.title or '',
                    'expertise': instructor.expertise or '',
                    'bio': instructor.short_bio or '',
                    'image': f'/web/image/seitech.instructor/{instructor.id}/image' if instructor.image else None,
                    'courseCount': instructor.course_count,
                    'totalStudents': instructor.total_students,
                    'totalEnrollments': instructor.total_enrollments,
                    'averageRating': instructor.average_rating,
                    'totalReviews': instructor.total_reviews,
                    'totalRevenue': instructor.total_revenue,
                    'state': instructor.state,
                    'isFeatured': instructor.is_featured,
                    'userId': instructor.user_id.id if instructor.user_id else None,
                    'createdAt': instructor.create_date.isoformat() if instructor.create_date else None,
                })

            return self._json_response({
                'success': True,
                'data': {
                    'instructors': instructor_data,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total,
                        'totalPages': (total + limit - 1) // limit,
                    }
                }
            })
        except Exception as e:
            _logger.exception('List instructors error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    @http.route('/api/admin/instructors', type='http', auth='user', methods=['POST'], csrf=False, cors='*')
    def create_instructor(self, **kwargs):
        """Create a new instructor."""
        try:
            has_access, result = self._check_admin_access()
            if not has_access or result == 'instructor':
                return self._json_response({
                    'success': False,
                    'message': 'Insufficient permissions'
                }, status=403)

            data = json.loads(request.httprequest.data.decode('utf-8'))
            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            user_id = data.get('userId')

            if not name:
                return self._json_response({
                    'success': False,
                    'message': 'Name is required'
                }, status=400)

            # Create instructor
            instructor_vals = {
                'name': name,
                'email': email,
                'phone': data.get('phone', ''),
                'title': data.get('title', ''),
                'expertise': data.get('expertise', ''),
                'short_bio': data.get('bio', ''),
                'state': 'active',
            }

            if user_id:
                instructor_vals['user_id'] = user_id

            instructor = request.env['seitech.instructor'].sudo().create(instructor_vals)

            return self._json_response({
                'success': True,
                'message': 'Instructor created successfully',
                'data': {
                    'id': instructor.id,
                    'name': instructor.name,
                    'email': instructor.email,
                }
            })
        except Exception as e:
            _logger.exception('Create instructor error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    @http.route('/api/admin/instructors/<int:instructor_id>', type='http', auth='user', methods=['PUT'], csrf=False, cors='*')
    def update_instructor(self, instructor_id, **kwargs):
        """Update instructor details."""
        try:
            has_access, result = self._check_admin_access()
            if not has_access or result == 'instructor':
                return self._json_response({
                    'success': False,
                    'message': 'Insufficient permissions'
                }, status=403)

            data = json.loads(request.httprequest.data.decode('utf-8'))

            instructor = request.env['seitech.instructor'].sudo().browse(instructor_id)
            if not instructor.exists():
                return self._json_response({
                    'success': False,
                    'message': 'Instructor not found'
                }, status=404)

            # Update instructor fields
            update_vals = {}
            if 'name' in data:
                update_vals['name'] = data['name'].strip()
            if 'email' in data:
                update_vals['email'] = data['email'].strip()
            if 'phone' in data:
                update_vals['phone'] = data['phone']
            if 'title' in data:
                update_vals['title'] = data['title']
            if 'expertise' in data:
                update_vals['expertise'] = data['expertise']
            if 'bio' in data:
                update_vals['short_bio'] = data['bio']
            if 'state' in data:
                update_vals['state'] = data['state']
            if 'isFeatured' in data:
                update_vals['is_featured'] = data['isFeatured']

            if update_vals:
                instructor.write(update_vals)

            return self._json_response({
                'success': True,
                'message': 'Instructor updated successfully'
            })
        except Exception as e:
            _logger.exception('Update instructor error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    # ============================================================================
    # Course Management
    # ============================================================================

    @http.route('/api/admin/courses', type='http', auth='user', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def list_admin_courses(self, **kwargs):
        """List all courses for admin (including unpublished)."""
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({})

        try:
            has_access, result = self._check_admin_access()
            if not has_access:
                return self._json_response({
                    'success': False,
                    'message': result
                }, status=403)

            Channel = request.env['slide.channel'].sudo()

            # Build domain
            domain = []

            # For instructors, only show their courses
            if result == 'instructor':
                instructor = request.env['seitech.instructor'].sudo().search([
                    ('user_id', '=', request.env.user.id)
                ], limit=1)
                if instructor:
                    domain.append(('id', 'in', instructor.channel_ids.ids))

            # Search filter
            search = kwargs.get('search', '').strip()
            if search:
                domain += [
                    '|', '|',
                    ('name', 'ilike', search),
                    ('description', 'ilike', search),
                    ('description_short', 'ilike', search)
                ]

            # Category filter
            category_id = kwargs.get('categoryId')
            if category_id:
                domain.append(('seitech_category_id', '=', int(category_id)))

            # Published filter
            is_published = kwargs.get('isPublished')
            if is_published is not None:
                domain.append(('is_published', '=', is_published == 'true'))

            # Pagination
            page = int(kwargs.get('page', 1))
            limit = min(int(kwargs.get('limit', 20)), 100)
            offset = (page - 1) * limit

            # Get total count
            total = Channel.search_count(domain)

            # Get courses
            courses = Channel.search(domain, offset=offset, limit=limit, order='create_date desc')

            # Format course data
            course_data = []
            for course in courses:
                course_data.append({
                    'id': course.id,
                    'name': course.name,
                    'slug': course.seo_name or str(course.id),
                    'description': course.description_short or '',
                    'imageUrl': f'/web/image/slide.channel/{course.id}/image_512' if course.image_512 else None,
                    'price': course.list_price or 0,
                    'categoryId': course.seitech_category_id.id if course.seitech_category_id else None,
                    'categoryName': course.seitech_category_id.name if course.seitech_category_id else '',
                    'enrollmentCount': course.enrollment_count or course.members_count or 0,
                    'totalSlides': course.total_slides or 0,
                    'ratingAvg': course.rating_avg or 0,
                    'isPublished': course.is_published,
                    'isPaid': course.is_paid,
                    'instructorId': course.primary_instructor_id.id if course.primary_instructor_id else None,
                    'instructorName': course.primary_instructor_id.name if course.primary_instructor_id else '',
                    'createdAt': course.create_date.isoformat() if course.create_date else None,
                })

            return self._json_response({
                'success': True,
                'data': {
                    'courses': course_data,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total,
                        'totalPages': (total + limit - 1) // limit,
                    }
                }
            })
        except Exception as e:
            _logger.exception('List admin courses error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    @http.route('/api/admin/courses', type='http', auth='user', methods=['POST'], csrf=False, cors='*')
    def create_course(self, **kwargs):
        """Create a new course."""
        try:
            has_access, result = self._check_admin_access()
            if not has_access:
                return self._json_response({
                    'success': False,
                    'message': 'Insufficient permissions'
                }, status=403)

            data = json.loads(request.httprequest.data.decode('utf-8'))
            name = data.get('name', '').strip()

            if not name:
                return self._json_response({
                    'success': False,
                    'message': 'Course name is required'
                }, status=400)

            # Create course
            course_vals = {
                'name': name,
                'description': data.get('description', ''),
                'description_short': data.get('shortDescription', ''),
                'is_published': data.get('isPublished', False),
                'channel_type': 'training',
            }

            # Optional fields
            if data.get('categoryId'):
                course_vals['seitech_category_id'] = data['categoryId']
            if data.get('price'):
                course_vals['list_price'] = data['price']
                course_vals['is_paid'] = data['price'] > 0
            if data.get('instructorId'):
                course_vals['primary_instructor_id'] = data['instructorId']

            course = request.env['slide.channel'].sudo().create(course_vals)

            return self._json_response({
                'success': True,
                'message': 'Course created successfully',
                'data': {
                    'id': course.id,
                    'name': course.name,
                    'slug': course.seo_name or str(course.id),
                }
            })
        except Exception as e:
            _logger.exception('Create course error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    @http.route('/api/admin/courses/<int:course_id>', type='http', auth='user', methods=['PUT'], csrf=False, cors='*')
    def update_course(self, course_id, **kwargs):
        """Update course details."""
        try:
            has_access, result = self._check_admin_access()
            if not has_access:
                return self._json_response({
                    'success': False,
                    'message': 'Insufficient permissions'
                }, status=403)

            data = json.loads(request.httprequest.data.decode('utf-8'))

            course = request.env['slide.channel'].sudo().browse(course_id)
            if not course.exists():
                return self._json_response({
                    'success': False,
                    'message': 'Course not found'
                }, status=404)

            # Check if instructor can only edit their own courses
            if result == 'instructor':
                instructor = request.env['seitech.instructor'].sudo().search([
                    ('user_id', '=', request.env.user.id)
                ], limit=1)
                if instructor and course.id not in instructor.channel_ids.ids:
                    return self._json_response({
                        'success': False,
                        'message': 'You can only edit your own courses'
                    }, status=403)

            # Update course fields
            update_vals = {}
            if 'name' in data:
                update_vals['name'] = data['name'].strip()
            if 'description' in data:
                update_vals['description'] = data['description']
            if 'shortDescription' in data:
                update_vals['description_short'] = data['shortDescription']
            if 'isPublished' in data:
                update_vals['is_published'] = data['isPublished']
            if 'price' in data:
                update_vals['list_price'] = data['price']
                update_vals['is_paid'] = data['price'] > 0
            if 'categoryId' in data:
                update_vals['seitech_category_id'] = data['categoryId']
            if 'instructorId' in data:
                update_vals['primary_instructor_id'] = data['instructorId']

            if update_vals:
                course.write(update_vals)

            return self._json_response({
                'success': True,
                'message': 'Course updated successfully'
            })
        except Exception as e:
            _logger.exception('Update course error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    # ============================================================================
    # Enrollment Management
    # ============================================================================

    @http.route('/api/admin/enrollments', type='http', auth='user', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def list_enrollments(self, **kwargs):
        """List enrollments with pagination and filtering."""
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({})

        try:
            has_access, result = self._check_admin_access()
            if not has_access:
                return self._json_response({
                    'success': False,
                    'message': result
                }, status=403)

            Enrollment = request.env['seitech.enrollment'].sudo()

            # Build domain
            domain = []

            # Course filter
            course_id = kwargs.get('courseId')
            if course_id:
                domain.append(('channel_id', '=', int(course_id)))

            # User filter
            user_id = kwargs.get('userId')
            if user_id:
                domain.append(('user_id', '=', int(user_id)))

            # State filter
            state = kwargs.get('state')
            if state:
                domain.append(('state', '=', state))

            # Pagination
            page = int(kwargs.get('page', 1))
            limit = min(int(kwargs.get('limit', 20)), 100)
            offset = (page - 1) * limit

            # Get total count
            total = Enrollment.search_count(domain)

            # Get enrollments
            enrollments = Enrollment.search(domain, offset=offset, limit=limit, order='create_date desc')

            # Format enrollment data
            enrollment_data = []
            for enrollment in enrollments:
                enrollment_data.append({
                    'id': enrollment.id,
                    'reference': enrollment.name,
                    'userId': enrollment.user_id.id,
                    'userName': enrollment.user_id.name,
                    'userEmail': enrollment.user_id.login,
                    'courseId': enrollment.channel_id.id,
                    'courseName': enrollment.channel_id.name,
                    'enrollmentDate': enrollment.enrollment_date.isoformat() if enrollment.enrollment_date else None,
                    'expirationDate': enrollment.expiration_date.isoformat() if enrollment.expiration_date else None,
                    'state': enrollment.state,
                    'enrollmentType': enrollment.enrollment_type,
                    'amountPaid': enrollment.amount_paid,
                    'completionPercentage': enrollment.completion_percentage,
                    'completedSlides': enrollment.completed_slides,
                    'totalSlides': enrollment.total_slides,
                    'certificateIssued': enrollment.certificate_issued,
                    'certificateId': enrollment.certificate_id.id if enrollment.certificate_id else None,
                })

            return self._json_response({
                'success': True,
                'data': {
                    'enrollments': enrollment_data,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total,
                        'totalPages': (total + limit - 1) // limit,
                    }
                }
            })
        except Exception as e:
            _logger.exception('List enrollments error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    @http.route('/api/admin/enrollments', type='http', auth='user', methods=['POST'], csrf=False, cors='*')
    def create_enrollment(self, **kwargs):
        """Create a new enrollment."""
        try:
            has_access, result = self._check_admin_access()
            if not has_access:
                return self._json_response({
                    'success': False,
                    'message': 'Insufficient permissions'
                }, status=403)

            data = json.loads(request.httprequest.data.decode('utf-8'))
            user_id = data.get('userId')
            course_id = data.get('courseId')

            if not user_id or not course_id:
                return self._json_response({
                    'success': False,
                    'message': 'User ID and Course ID are required'
                }, status=400)

            # Check if enrollment already exists
            existing = request.env['seitech.enrollment'].sudo().search([
                ('user_id', '=', user_id),
                ('channel_id', '=', course_id)
            ], limit=1)

            if existing:
                return self._json_response({
                    'success': False,
                    'message': 'User is already enrolled in this course'
                }, status=409)

            # Create enrollment
            enrollment_vals = {
                'user_id': user_id,
                'channel_id': course_id,
                'state': data.get('state', 'active'),
                'enrollment_type': data.get('enrollmentType', 'free'),
            }

            if data.get('amountPaid'):
                enrollment_vals['amount_paid'] = data['amountPaid']

            enrollment = request.env['seitech.enrollment'].sudo().create(enrollment_vals)

            # Activate if state is active
            if enrollment.state == 'active':
                enrollment.action_activate()

            return self._json_response({
                'success': True,
                'message': 'Enrollment created successfully',
                'data': {
                    'id': enrollment.id,
                    'reference': enrollment.name,
                }
            })
        except Exception as e:
            _logger.exception('Create enrollment error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    @http.route('/api/admin/enrollments/<int:enrollment_id>', type='http', auth='user', methods=['PUT'], csrf=False, cors='*')
    def update_enrollment(self, enrollment_id, **kwargs):
        """Update enrollment details."""
        try:
            has_access, result = self._check_admin_access()
            if not has_access:
                return self._json_response({
                    'success': False,
                    'message': 'Insufficient permissions'
                }, status=403)

            data = json.loads(request.httprequest.data.decode('utf-8'))

            enrollment = request.env['seitech.enrollment'].sudo().browse(enrollment_id)
            if not enrollment.exists():
                return self._json_response({
                    'success': False,
                    'message': 'Enrollment not found'
                }, status=404)

            # Update enrollment fields
            update_vals = {}
            if 'state' in data:
                update_vals['state'] = data['state']
            if 'enrollmentType' in data:
                update_vals['enrollment_type'] = data['enrollmentType']
            if 'amountPaid' in data:
                update_vals['amount_paid'] = data['amountPaid']
            if 'expirationDate' in data:
                update_vals['expiration_date'] = data['expirationDate']

            if update_vals:
                enrollment.write(update_vals)

            return self._json_response({
                'success': True,
                'message': 'Enrollment updated successfully'
            })
        except Exception as e:
            _logger.exception('Update enrollment error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    # ============================================================================
    # Certificate Management
    # ============================================================================

    @http.route('/api/admin/certificates', type='http', auth='user', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def list_certificates(self, **kwargs):
        """List certificates with pagination and filtering."""
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({})

        try:
            has_access, result = self._check_admin_access()
            if not has_access:
                return self._json_response({
                    'success': False,
                    'message': result
                }, status=403)

            Certificate = request.env['seitech.certificate'].sudo()

            # Build domain
            domain = []

            # Course filter
            course_id = kwargs.get('courseId')
            if course_id:
                domain.append(('channel_id', '=', int(course_id)))

            # User filter
            user_id = kwargs.get('userId')
            if user_id:
                domain.append(('user_id', '=', int(user_id)))

            # State filter
            state = kwargs.get('state', 'issued')
            if state:
                domain.append(('state', '=', state))

            # Pagination
            page = int(kwargs.get('page', 1))
            limit = min(int(kwargs.get('limit', 20)), 100)
            offset = (page - 1) * limit

            # Get total count
            total = Certificate.search_count(domain)

            # Get certificates
            certificates = Certificate.search(domain, offset=offset, limit=limit, order='issue_date desc')

            # Format certificate data
            certificate_data = []
            for cert in certificates:
                certificate_data.append({
                    'id': cert.id,
                    'certificateNumber': cert.name,
                    'verificationCode': cert.verification_code,
                    'userId': cert.user_id.id,
                    'userName': cert.user_id.name,
                    'userEmail': cert.user_id.login,
                    'courseId': cert.channel_id.id,
                    'courseName': cert.channel_id.name,
                    'issueDate': cert.issue_date.isoformat() if cert.issue_date else None,
                    'expirationDate': cert.expiration_date.isoformat() if cert.expiration_date else None,
                    'state': cert.state,
                    'completionPercentage': cert.completion_percentage,
                    'instructorId': cert.instructor_id.id if cert.instructor_id else None,
                    'instructorName': cert.instructor_id.name if cert.instructor_id else '',
                })

            return self._json_response({
                'success': True,
                'data': {
                    'certificates': certificate_data,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total,
                        'totalPages': (total + limit - 1) // limit,
                    }
                }
            })
        except Exception as e:
            _logger.exception('List certificates error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)

    @http.route('/api/admin/certificates/<int:certificate_id>/revoke', type='http', auth='user', methods=['POST'], csrf=False, cors='*')
    def revoke_certificate(self, certificate_id, **kwargs):
        """Revoke a certificate."""
        try:
            has_access, result = self._check_admin_access()
            if not has_access or result == 'instructor':
                return self._json_response({
                    'success': False,
                    'message': 'Insufficient permissions'
                }, status=403)

            data = json.loads(request.httprequest.data.decode('utf-8'))
            reason = data.get('reason', '')

            certificate = request.env['seitech.certificate'].sudo().browse(certificate_id)
            if not certificate.exists():
                return self._json_response({
                    'success': False,
                    'message': 'Certificate not found'
                }, status=404)

            certificate.write({
                'revocation_reason': reason,
            })
            certificate.action_revoke()

            return self._json_response({
                'success': True,
                'message': 'Certificate revoked successfully'
            })
        except Exception as e:
            _logger.exception('Revoke certificate error')
            return self._json_response({
                'success': False,
                'message': str(e)
            }, status=500)
