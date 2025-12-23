# -*- coding: utf-8 -*-
import json
import logging
from odoo import http
from odoo.http import request
from odoo.exceptions import AccessDenied

_logger = logging.getLogger(__name__)


class AuthApiController(http.Controller):
    """REST API for authentication - consumed by Next.js frontend."""

    def _json_response(self, data, status=200):
        """Return a JSON response."""
        return request.make_response(
            json.dumps(data),
            headers=[
                ('Content-Type', 'application/json'),
                ('Access-Control-Allow-Origin', '*'),
                ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
                ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
                ('Access-Control-Allow-Credentials', 'true'),
            ],
            status=status
        )

    @http.route('/api/auth/login', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False, cors='*')
    def login(self, **kwargs):
        """
        Authenticate user and return session info.

        POST body: { "email": "user@example.com", "password": "password" }
        """
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({})

        try:
            # Parse JSON body
            data = json.loads(request.httprequest.data.decode('utf-8'))
            email = data.get('email', '').strip()
            password = data.get('password', '')

            if not email or not password:
                return self._json_response({
                    'success': False,
                    'message': 'Email and password are required',
                    'data': None,
                }, status=400)

            # Authenticate using Odoo 19 authenticate method
            try:
                User = request.env['res.users'].sudo()
                # Odoo 19 authenticate expects credential dict with type, login, password
                credential = {
                    'type': 'password',
                    'login': email,
                    'password': password,
                }
                user_agent_env = {'interactive': True}
                auth_info = User.authenticate(credential, user_agent_env)
                uid = auth_info.get('uid')
            except AccessDenied:
                return self._json_response({
                    'success': False,
                    'message': 'Invalid email or password',
                    'data': None,
                }, status=401)
            except Exception as auth_error:
                _logger.exception(f'Authentication error: {auth_error}')
                return self._json_response({
                    'success': False,
                    'message': str(auth_error),
                    'data': None,
                }, status=500)

            if not uid:
                return self._json_response({
                    'success': False,
                    'message': 'Invalid email or password',
                    'data': None,
                }, status=401)

            # Get user info
            user = request.env['res.users'].sudo().browse(uid)
            partner = user.partner_id

            # Get enrollments count
            Enrollment = request.env['seitech.enrollment'].sudo()
            enrollments_count = Enrollment.search_count([
                ('user_id', '=', uid),
                ('state', 'in', ['active', 'completed']),
            ])

            # Get certificates count
            Certificate = request.env['seitech.certificate'].sudo()
            certificates_count = Certificate.search_count([
                ('user_id', '=', uid),
                ('state', '=', 'issued'),
            ])

            user_data = {
                'id': uid,
                'email': user.login,
                'name': user.name,
                'firstName': user.name.split()[0] if user.name else '',
                'lastName': ' '.join(user.name.split()[1:]) if user.name and len(user.name.split()) > 1 else '',
                'partnerId': partner.id,
                'phone': partner.phone or '',
                'image': f'/web/image/res.partner/{partner.id}/image_128' if partner.image_128 else None,
                'isInstructor': False,
                'enrollmentsCount': enrollments_count,
                'certificatesCount': certificates_count,
            }

            # Check if user is an instructor
            Instructor = request.env['seitech.instructor'].sudo()
            instructor = Instructor.search([('user_id', '=', uid)], limit=1)
            if instructor:
                user_data['isInstructor'] = True
                user_data['instructorId'] = instructor.id

            # Generate session token
            session_token = request.session.sid

            return self._json_response({
                'success': True,
                'message': 'Login successful',
                'data': {
                    'user': user_data,
                    'sessionToken': session_token,
                },
            })

        except Exception as e:
            _logger.exception('Login error')
            return self._json_response({
                'success': False,
                'message': str(e),
                'data': None,
            }, status=500)

    @http.route('/api/auth/logout', type='http', auth='user', methods=['POST', 'OPTIONS'], csrf=False, cors='*')
    def logout(self, **kwargs):
        """Log out the current user."""
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({})

        try:
            request.session.logout()
            return self._json_response({
                'success': True,
                'message': 'Logged out successfully',
                'data': None,
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e),
                'data': None,
            }, status=500)

    @http.route('/api/auth/me', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def get_current_user(self, **kwargs):
        """Get current authenticated user info."""
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({})

        try:
            user = request.env.user
            if user._is_public():
                return self._json_response({
                    'success': False,
                    'message': 'Not authenticated',
                    'data': None,
                }, status=401)

            partner = user.partner_id

            # Get enrollments count
            Enrollment = request.env['seitech.enrollment'].sudo()
            enrollments_count = Enrollment.search_count([
                ('user_id', '=', user.id),
                ('state', 'in', ['active', 'completed']),
            ])

            # Get certificates count
            Certificate = request.env['seitech.certificate'].sudo()
            certificates_count = Certificate.search_count([
                ('user_id', '=', user.id),
                ('state', '=', 'issued'),
            ])

            user_data = {
                'id': user.id,
                'email': user.login,
                'name': user.name,
                'firstName': user.name.split()[0] if user.name else '',
                'lastName': ' '.join(user.name.split()[1:]) if user.name and len(user.name.split()) > 1 else '',
                'partnerId': partner.id,
                'phone': partner.phone or '',
                'image': f'/web/image/res.partner/{partner.id}/image_128' if partner.image_128 else None,
                'isInstructor': False,
                'enrollmentsCount': enrollments_count,
                'certificatesCount': certificates_count,
            }

            # Check if user is an instructor
            Instructor = request.env['seitech.instructor'].sudo()
            instructor = Instructor.search([('user_id', '=', user.id)], limit=1)
            if instructor:
                user_data['isInstructor'] = True
                user_data['instructorId'] = instructor.id

            return self._json_response({
                'success': True,
                'data': user_data,
            })

        except Exception as e:
            _logger.exception('Get current user error')
            return self._json_response({
                'success': False,
                'message': str(e),
                'data': None,
            }, status=500)

    @http.route('/api/auth/register', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False, cors='*')
    def register(self, **kwargs):
        """
        Register a new user.

        POST body: { "name": "John Doe", "email": "john@example.com", "password": "password" }
        """
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({})

        try:
            data = json.loads(request.httprequest.data.decode('utf-8'))
            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '')

            if not name or not email or not password:
                return self._json_response({
                    'success': False,
                    'message': 'Name, email, and password are required',
                    'data': None,
                }, status=400)

            # Check if user already exists
            User = request.env['res.users'].sudo()
            existing = User.search([('login', '=', email)], limit=1)
            if existing:
                return self._json_response({
                    'success': False,
                    'message': 'An account with this email already exists',
                    'data': None,
                }, status=409)

            # Create portal user (Odoo 19 uses group_ids not groups_id)
            portal_group = request.env['ir.model.data'].sudo()._xmlid_to_res_id('base.group_portal')
            group_ids = [(6, 0, [portal_group])] if portal_group else []
            user = User.create({
                'name': name,
                'login': email,
                'password': password,
                'group_ids': group_ids,
            })

            return self._json_response({
                'success': True,
                'message': 'Registration successful. You can now log in.',
                'data': {
                    'id': user.id,
                    'email': user.login,
                    'name': user.name,
                },
            })

        except Exception as e:
            _logger.exception('Registration error')
            return self._json_response({
                'success': False,
                'message': str(e),
                'data': None,
            }, status=500)
