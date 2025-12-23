# -*- coding: utf-8 -*-
"""Order API controller for course purchases."""
import json
import logging
from odoo import http
from odoo.http import request, Response

_logger = logging.getLogger(__name__)


class OrderAPIController(http.Controller):
    """REST API for course orders and checkout."""

    def _json_response(self, data, status=200):
        """Return JSON response with proper headers."""
        return Response(
            json.dumps(data),
            status=status,
            mimetype='application/json',
            headers={
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        )

    @http.route('/api/orders', type='http', auth='none', methods=['OPTIONS'], csrf=False)
    def orders_options(self, **kwargs):
        """Handle CORS preflight for orders endpoint."""
        return Response(
            status=204,
            headers={
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        )

    @http.route('/api/orders', type='http', auth='public', methods=['POST'], csrf=False)
    def create_order(self, **kwargs):
        """
        Create a new order with course enrollments.

        Expected JSON body:
        {
            "customer": {
                "email": "customer@example.com",
                "firstName": "John",
                "lastName": "Doe",
                "companyName": "Company Ltd" (optional)
            },
            "items": [
                {
                    "courseId": 1,
                    "price": 295.00
                }
            ],
            "paymentMethod": "card" (optional, for future payment integration)
        }
        """
        try:
            # Parse request body
            data = json.loads(request.httprequest.data.decode('utf-8'))
            customer_data = data.get('customer', {})
            items = data.get('items', [])

            if not customer_data.get('email'):
                return self._json_response({
                    'success': False,
                    'error': 'Customer email is required'
                }, status=400)

            if not items:
                return self._json_response({
                    'success': False,
                    'error': 'No items in order'
                }, status=400)

            # Get or create partner
            partner = self._get_or_create_partner(customer_data)
            if not partner:
                return self._json_response({
                    'success': False,
                    'error': 'Failed to create customer'
                }, status=500)

            # Get or create user for the partner
            user = self._get_or_create_user(partner)

            # Create order lines
            order_lines = []
            course_ids = []
            Channel = request.env['slide.channel'].sudo()

            for item in items:
                course_id = item.get('courseId')
                course = Channel.browse(course_id)

                if not course.exists():
                    _logger.warning(f"Course {course_id} not found")
                    continue

                course_ids.append(course_id)

                # Get or create product for course
                if not course.product_id:
                    course.action_create_product()

                if course.product_id:
                    order_lines.append((0, 0, {
                        'product_id': course.product_id.id,
                        'product_uom_qty': 1,
                        'price_unit': item.get('price', course.list_price),
                        'name': course.name,
                    }))
                else:
                    # Create order line without product (service)
                    order_lines.append((0, 0, {
                        'display_type': 'line_section',
                        'name': course.name,
                    }))

            if not course_ids:
                return self._json_response({
                    'success': False,
                    'error': 'No valid courses found'
                }, status=400)

            # Create sale order
            SaleOrder = request.env['sale.order'].sudo()
            order = SaleOrder.create({
                'partner_id': partner.id,
                'order_line': order_lines if order_lines else False,
                'state': 'draft',
            })

            # For now, confirm the order immediately (simulating successful payment)
            # In production, this would happen after payment confirmation
            try:
                order.action_confirm()
            except Exception as e:
                _logger.warning(f"Could not confirm order: {e}")

            # Create enrollments directly (as payment is simulated)
            enrollments = self._create_enrollments(order, user, course_ids)

            return self._json_response({
                'success': True,
                'data': {
                    'orderId': order.id,
                    'orderReference': order.name,
                    'total': order.amount_total,
                    'currency': order.currency_id.name,
                    'status': order.state,
                    'enrollments': [{
                        'id': e.id,
                        'courseName': e.channel_id.name,
                        'courseSlug': e.channel_id.seo_name or str(e.channel_id.id),
                        'status': e.state,
                    } for e in enrollments]
                }
            })

        except json.JSONDecodeError:
            return self._json_response({
                'success': False,
                'error': 'Invalid JSON in request body'
            }, status=400)
        except Exception as e:
            _logger.exception("Error creating order")
            return self._json_response({
                'success': False,
                'error': str(e)
            }, status=500)

    def _get_or_create_partner(self, customer_data):
        """Get or create a partner from customer data."""
        Partner = request.env['res.partner'].sudo()
        email = customer_data.get('email', '').strip().lower()

        # Search for existing partner
        partner = Partner.search([('email', '=ilike', email)], limit=1)

        if partner:
            return partner

        # Create new partner
        name = f"{customer_data.get('firstName', '')} {customer_data.get('lastName', '')}".strip()
        if not name:
            name = email.split('@')[0]

        partner = Partner.create({
            'name': name,
            'email': email,
            'company_name': customer_data.get('companyName', ''),
            'customer_rank': 1,
        })

        return partner

    def _get_or_create_user(self, partner):
        """Get or create a portal user for the partner."""
        User = request.env['res.users'].sudo()
        _logger.info(f"Looking for user for partner {partner.id} ({partner.email})")

        # Check if user already exists by partner
        user = User.search([('partner_id', '=', partner.id)], limit=1)
        if user:
            _logger.info(f"Found user by partner_id: {user.id}")
            return user

        # Check by login/email
        user = User.search([('login', '=ilike', partner.email)], limit=1)
        if user:
            _logger.info(f"Found user by login: {user.id}")
            # Link user to partner if not linked
            if not user.partner_id or user.partner_id.id != partner.id:
                _logger.info(f"Updating user partner_id from {user.partner_id.id if user.partner_id else None} to {partner.id}")
            return user

        # Create portal user directly
        try:
            # Get portal group
            portal_group = request.env.ref('base.group_portal', raise_if_not_found=False)
            if not portal_group:
                _logger.error("Portal group not found - base.group_portal does not exist")
                return None

            _logger.info(f"Creating new portal user for {partner.email}")
            # In Odoo 19, we must set group_ids during creation to override defaults
            # The default _default_groups assigns base.group_user which conflicts with portal
            user = User.with_context(no_reset_password=True).create({
                'name': partner.name,
                'login': partner.email,
                'email': partner.email,
                'partner_id': partner.id,
                'active': True,
                'group_ids': [(6, 0, [portal_group.id])],  # Replace all groups with just portal
            })
            _logger.info(f"Created portal user: {user.id}")
            return user
        except Exception as e:
            _logger.exception(f"Could not create portal user for {partner.email}: {e}")
            return None

    def _create_enrollments(self, order, user, course_ids):
        """Create enrollments for all courses in the order."""
        Enrollment = request.env['seitech.enrollment'].sudo()
        Channel = request.env['slide.channel'].sudo()
        enrollments = []

        _logger.info(f"Creating enrollments for order {order.id}, user {user.id if user else None}, courses {course_ids}")

        if not user:
            _logger.error("No user provided for enrollment creation - user is None")
            return enrollments

        for course_id in course_ids:
            course = Channel.browse(course_id)
            if not course.exists():
                _logger.warning(f"Course {course_id} not found")
                continue

            _logger.info(f"Processing enrollment for course {course.id} ({course.name})")

            # Check if already enrolled
            existing = Enrollment.search([
                ('channel_id', '=', course.id),
                ('user_id', '=', user.id),
            ], limit=1)

            if existing:
                _logger.info(f"User already enrolled in course {course_id}, enrollment {existing.id}, state: {existing.state}")
                # Activate if pending (simulating payment confirmation)
                if existing.state in ('draft', 'pending'):
                    _logger.info(f"Activating existing enrollment {existing.id}")
                    existing.action_activate()
                enrollments.append(existing)
                continue

            # Create enrollment
            try:
                _logger.info(f"Creating new enrollment for user {user.id} in course {course.id}")
                enrollment = Enrollment.create({
                    'channel_id': course.id,
                    'user_id': user.id,
                    'enrollment_type': 'paid',
                    'amount_paid': course.list_price,
                    'sale_order_id': order.id,
                    'state': 'draft',  # Start as draft, action_activate will set to active
                })
                _logger.info(f"Created enrollment {enrollment.id}, activating...")
                enrollment.action_activate()
                _logger.info(f"Enrollment {enrollment.id} activated, state: {enrollment.state}")
                enrollments.append(enrollment)
            except Exception as e:
                _logger.exception(f"Failed to create enrollment for course {course_id}: {e}")

        return enrollments

    @http.route('/api/orders/<int:order_id>', type='http', auth='public', methods=['GET'], csrf=False)
    def get_order(self, order_id, **kwargs):
        """Get order details by ID."""
        try:
            SaleOrder = request.env['sale.order'].sudo()
            order = SaleOrder.browse(order_id)

            if not order.exists():
                return self._json_response({
                    'success': False,
                    'error': 'Order not found'
                }, status=404)

            return self._json_response({
                'success': True,
                'data': {
                    'id': order.id,
                    'reference': order.name,
                    'total': order.amount_total,
                    'currency': order.currency_id.name,
                    'status': order.state,
                    'customer': {
                        'name': order.partner_id.name,
                        'email': order.partner_id.email,
                    },
                    'items': [{
                        'name': line.name,
                        'quantity': line.product_uom_qty,
                        'price': line.price_unit,
                        'total': line.price_total,
                    } for line in order.order_line],
                    'createdAt': order.create_date.isoformat() if order.create_date else None,
                }
            })

        except Exception as e:
            _logger.exception("Error fetching order")
            return self._json_response({
                'success': False,
                'error': str(e)
            }, status=500)

    @http.route('/api/orders/by-email/<string:email>', type='http', auth='public', methods=['GET'], csrf=False)
    def get_orders_by_email(self, email, **kwargs):
        """Get orders for a customer by email."""
        try:
            Partner = request.env['res.partner'].sudo()
            partner = Partner.search([('email', '=ilike', email)], limit=1)

            if not partner:
                return self._json_response({
                    'success': True,
                    'data': []
                })

            SaleOrder = request.env['sale.order'].sudo()
            orders = SaleOrder.search([
                ('partner_id', '=', partner.id)
            ], order='create_date desc', limit=20)

            return self._json_response({
                'success': True,
                'data': [{
                    'id': order.id,
                    'reference': order.name,
                    'total': order.amount_total,
                    'status': order.state,
                    'createdAt': order.create_date.isoformat() if order.create_date else None,
                } for order in orders]
            })

        except Exception as e:
            _logger.exception("Error fetching orders by email")
            return self._json_response({
                'success': False,
                'error': str(e)
            }, status=500)
