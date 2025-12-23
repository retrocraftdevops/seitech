# -*- coding: utf-8 -*-
import json
import logging
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class ConsultationApiController(http.Controller):
    """REST API for consultation requests - consumed by Next.js frontend."""

    def _json_response(self, data, status=200):
        """Return a JSON response."""
        return request.make_response(
            json.dumps(data),
            headers=[
                ('Content-Type', 'application/json'),
                ('Access-Control-Allow-Origin', '*'),
                ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
                ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
            ],
            status=status
        )

    @http.route('/api/consultation', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False, cors='*')
    def create_consultation(self, **kwargs):
        """
        Create a new consultation request.

        POST body: {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "01234567890",
            "company_name": "Company Ltd",
            "services": ["training", "fire-risk"],
            "message": "I need help with...",
            "preferred_contact": "email"
        }
        """
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({})

        try:
            data = json.loads(request.httprequest.data.decode('utf-8'))
            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            phone = data.get('phone', '').strip()
            company_name = data.get('company_name', '').strip()
            services = data.get('services', [])
            message = data.get('message', '').strip()
            preferred_contact = data.get('preferred_contact', 'email')

            if not name or not email or not phone:
                return self._json_response({
                    'success': False,
                    'message': 'Name, email, and phone are required',
                    'data': None,
                }, status=400)

            # Format services list
            services_text = ', '.join(services) if services else 'Not specified'

            # Create CRM lead
            Lead = request.env['crm.lead'].sudo()
            lead = Lead.create({
                'name': f'Free Consultation - {name}',
                'contact_name': name,
                'email_from': email,
                'phone': phone,
                'partner_name': company_name or False,
                'description': f"""
<strong>Free Consultation Request</strong>

<strong>Contact Preference:</strong> {preferred_contact.title()}

<strong>Services Interested In:</strong> {services_text}

<strong>Message:</strong>
{message or 'No additional message provided.'}
                """.strip(),
                'type': 'opportunity',
                'priority': '2',  # High priority
            })

            return self._json_response({
                'success': True,
                'message': 'Consultation request submitted successfully',
                'data': {
                    'id': lead.id,
                },
            })

        except Exception as e:
            _logger.exception('Consultation request error')
            return self._json_response({
                'success': False,
                'message': str(e),
                'data': None,
            }, status=500)
