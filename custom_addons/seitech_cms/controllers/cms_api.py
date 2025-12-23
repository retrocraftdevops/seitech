# -*- coding: utf-8 -*-
import json
from odoo import http
from odoo.http import request, Response


class CmsApiController(http.Controller):
    """REST API Controller for CMS Content"""

    def _json_response(self, data, status=200):
        """Helper to return JSON response"""
        return Response(
            json.dumps(data, default=str),
            status=status,
            headers={'Content-Type': 'application/json'}
        )

    # ==================== Site Settings ====================

    @http.route('/api/cms/settings', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_site_settings(self):
        """Get global site settings"""
        try:
            settings = request.env['seitech.cms.site.settings'].sudo().get_settings()
            return self._json_response({
                'success': True,
                'data': settings.get_api_data()
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    @http.route('/api/cms/navigation/<string:menu_type>', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_navigation(self, menu_type):
        """Get navigation menu by type"""
        try:
            items = request.env['seitech.cms.navigation'].sudo().search([
                ('menu_type', '=', menu_type),
                ('is_published', '=', True),
                ('parent_id', '=', False),  # Only top-level items
            ])
            return self._json_response({
                'success': True,
                'data': [item.get_api_data() for item in items]
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    # ==================== Pages & Sections ====================

    @http.route('/api/cms/pages', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_pages(self):
        """Get all published pages"""
        try:
            pages = request.env['seitech.cms.page'].sudo().search([
                ('is_published', '=', True)
            ])
            return self._json_response({
                'success': True,
                'data': [page.get_api_data() for page in pages]
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    @http.route('/api/cms/pages/<string:slug>', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_page_by_slug(self, slug):
        """Get page content by slug"""
        try:
            page = request.env['seitech.cms.page'].sudo().search([
                ('slug', '=', slug),
                ('is_published', '=', True)
            ], limit=1)

            if not page:
                return self._json_response({
                    'success': False,
                    'message': 'Page not found'
                }, 404)

            return self._json_response({
                'success': True,
                'data': page.get_api_data()
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    @http.route('/api/cms/sections/<string:identifier>', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_section_by_identifier(self, identifier):
        """Get a specific section by identifier"""
        try:
            section = request.env['seitech.cms.section'].sudo().search([
                ('identifier', '=', identifier),
                ('is_published', '=', True)
            ], limit=1)

            if not section:
                return self._json_response({
                    'success': False,
                    'message': 'Section not found'
                }, 404)

            return self._json_response({
                'success': True,
                'data': section.get_api_data()
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    # ==================== Testimonials ====================

    @http.route('/api/cms/testimonials', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_testimonials(self, **kwargs):
        """Get testimonials with optional filtering"""
        try:
            domain = [('is_published', '=', True)]

            # Filter by featured
            if kwargs.get('featured'):
                domain.append(('is_featured', '=', True))

            # Filter by service type
            if kwargs.get('service_type'):
                domain.append(('service_type', '=', kwargs['service_type']))

            # Filter by course name
            if kwargs.get('course_name'):
                domain.append(('course_name', 'ilike', kwargs['course_name']))

            # Pagination
            limit = int(kwargs.get('limit', 10))
            offset = int(kwargs.get('offset', 0))

            testimonials = request.env['seitech.cms.testimonial'].sudo().search(
                domain, limit=limit, offset=offset, order='sequence, id desc'
            )
            total = request.env['seitech.cms.testimonial'].sudo().search_count(domain)

            return self._json_response({
                'success': True,
                'data': {
                    'testimonials': [t.get_api_data() for t in testimonials],
                    'pagination': {
                        'total': total,
                        'limit': limit,
                        'offset': offset,
                    }
                }
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    # ==================== FAQs ====================

    @http.route('/api/cms/faqs', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_faqs(self, **kwargs):
        """Get FAQs with optional filtering"""
        try:
            domain = [('is_published', '=', True)]

            # Filter by category
            if kwargs.get('category_id'):
                domain.append(('category_id', '=', int(kwargs['category_id'])))
            if kwargs.get('category_slug'):
                category = request.env['seitech.cms.faq.category'].sudo().search([
                    ('slug', '=', kwargs['category_slug'])
                ], limit=1)
                if category:
                    domain.append(('category_id', '=', category.id))

            # Filter by featured
            if kwargs.get('featured'):
                domain.append(('is_featured', '=', True))

            # Pagination
            limit = int(kwargs.get('limit', 50))
            offset = int(kwargs.get('offset', 0))

            faqs = request.env['seitech.cms.faq'].sudo().search(
                domain, limit=limit, offset=offset, order='sequence, id'
            )
            total = request.env['seitech.cms.faq'].sudo().search_count(domain)

            return self._json_response({
                'success': True,
                'data': {
                    'faqs': [f.get_api_data() for f in faqs],
                    'pagination': {
                        'total': total,
                        'limit': limit,
                        'offset': offset,
                    }
                }
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    @http.route('/api/cms/faq-categories', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_faq_categories(self):
        """Get all FAQ categories"""
        try:
            categories = request.env['seitech.cms.faq.category'].sudo().search([
                ('is_published', '=', True)
            ])
            return self._json_response({
                'success': True,
                'data': [c.get_api_data() for c in categories]
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    @http.route('/api/cms/faqs/<int:faq_id>/helpful', type='http', auth='public', methods=['POST'], csrf=False, cors='*')
    def mark_faq_helpful(self, faq_id, **kwargs):
        """Mark FAQ as helpful or not"""
        try:
            faq = request.env['seitech.cms.faq'].sudo().browse(faq_id)
            if not faq.exists():
                return self._json_response({
                    'success': False,
                    'message': 'FAQ not found'
                }, 404)

            helpful = kwargs.get('helpful', 'true').lower() == 'true'
            if helpful:
                faq.action_mark_helpful()
            else:
                faq.action_mark_not_helpful()

            return self._json_response({
                'success': True,
                'message': 'Feedback recorded'
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    # ==================== Team Members ====================

    @http.route('/api/cms/team', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_team_members(self, **kwargs):
        """Get team members with optional filtering"""
        try:
            domain = [('is_published', '=', True)]

            # Filter by department
            if kwargs.get('department'):
                domain.append(('department', '=', kwargs['department']))

            # Filter by featured
            if kwargs.get('featured'):
                domain.append(('is_featured', '=', True))

            # Filter by instructor
            if kwargs.get('instructors_only'):
                domain.append(('is_instructor', '=', True))

            # Filter by homepage
            if kwargs.get('homepage'):
                domain.append(('show_on_homepage', '=', True))

            members = request.env['seitech.cms.team.member'].sudo().search(
                domain, order='sequence, name'
            )

            return self._json_response({
                'success': True,
                'data': [m.get_api_data() for m in members]
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    @http.route('/api/cms/team/<string:slug>', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_team_member(self, slug):
        """Get single team member by slug"""
        try:
            member = request.env['seitech.cms.team.member'].sudo().search([
                ('slug', '=', slug),
                ('is_published', '=', True)
            ], limit=1)

            if not member:
                return self._json_response({
                    'success': False,
                    'message': 'Team member not found'
                }, 404)

            return self._json_response({
                'success': True,
                'data': member.get_api_data()
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    # ==================== Partners/Accreditations ====================

    @http.route('/api/cms/partners', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_partners(self, **kwargs):
        """Get partners/accreditations with optional filtering"""
        try:
            domain = [('is_published', '=', True)]

            # Filter by type
            if kwargs.get('type'):
                domain.append(('partner_type', '=', kwargs['type']))

            # Filter by featured
            if kwargs.get('featured'):
                domain.append(('is_featured', '=', True))

            # Filter by homepage
            if kwargs.get('homepage'):
                domain.append(('show_on_homepage', '=', True))

            partners = request.env['seitech.cms.partner'].sudo().search(
                domain, order='partner_type, sequence, name'
            )

            return self._json_response({
                'success': True,
                'data': [p.get_api_data() for p in partners]
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    # ==================== Services ====================

    @http.route('/api/cms/services', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_services(self, **kwargs):
        """Get consultancy services with optional filtering"""
        try:
            domain = [('is_published', '=', True)]

            # Filter by category
            if kwargs.get('category_id'):
                domain.append(('category_id', '=', int(kwargs['category_id'])))
            if kwargs.get('category_slug'):
                category = request.env['seitech.cms.service.category'].sudo().search([
                    ('slug', '=', kwargs['category_slug'])
                ], limit=1)
                if category:
                    domain.append(('category_id', '=', category.id))

            # Filter by featured
            if kwargs.get('featured'):
                domain.append(('is_featured', '=', True))

            # Filter by homepage
            if kwargs.get('homepage'):
                domain.append(('show_on_homepage', '=', True))

            # Pagination
            limit = int(kwargs.get('limit', 50))
            offset = int(kwargs.get('offset', 0))

            services = request.env['seitech.cms.service'].sudo().search(
                domain, limit=limit, offset=offset, order='category_id, sequence, name'
            )
            total = request.env['seitech.cms.service'].sudo().search_count(domain)

            return self._json_response({
                'success': True,
                'data': {
                    'services': [s.get_api_data() for s in services],
                    'pagination': {
                        'total': total,
                        'limit': limit,
                        'offset': offset,
                    }
                }
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    @http.route('/api/cms/services/<string:slug>', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_service_by_slug(self, slug):
        """Get single service by slug"""
        try:
            service = request.env['seitech.cms.service'].sudo().search([
                ('slug', '=', slug),
                ('is_published', '=', True)
            ], limit=1)

            if not service:
                return self._json_response({
                    'success': False,
                    'message': 'Service not found'
                }, 404)

            return self._json_response({
                'success': True,
                'data': service.get_api_data()
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    @http.route('/api/cms/service-categories', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_service_categories(self):
        """Get all service categories"""
        try:
            categories = request.env['seitech.cms.service.category'].sudo().search([
                ('is_published', '=', True)
            ], order='sequence, name')
            return self._json_response({
                'success': True,
                'data': [c.get_api_data() for c in categories]
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    # ==================== Statistics ====================

    @http.route('/api/cms/statistics', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_statistics(self, **kwargs):
        """Get site statistics with optional filtering"""
        try:
            domain = [('is_published', '=', True)]

            # Filter by location
            if kwargs.get('location'):
                domain.append(('display_location', '=', kwargs['location']))

            # Filter by type
            if kwargs.get('type'):
                domain.append(('stat_type', '=', kwargs['type']))

            statistics = request.env['seitech.cms.statistic'].sudo().search(
                domain, order='sequence'
            )

            return self._json_response({
                'success': True,
                'data': [s.get_api_data() for s in statistics]
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)

    # ==================== Combined Homepage Data ====================

    @http.route('/api/cms/homepage', type='http', auth='public', methods=['GET'], csrf=False, cors='*')
    def get_homepage_data(self):
        """Get all homepage content in a single request"""
        try:
            # Get homepage page sections
            homepage = request.env['seitech.cms.page'].sudo().search([
                ('slug', '=', 'home'),
                ('is_published', '=', True)
            ], limit=1)

            # Get featured testimonials
            testimonials = request.env['seitech.cms.testimonial'].sudo().search([
                ('is_published', '=', True),
                ('is_featured', '=', True)
            ], limit=6)

            # Get homepage partners
            partners = request.env['seitech.cms.partner'].sudo().search([
                ('is_published', '=', True),
                ('show_on_homepage', '=', True)
            ])

            # Get homepage team members
            team = request.env['seitech.cms.team.member'].sudo().search([
                ('is_published', '=', True),
                ('show_on_homepage', '=', True)
            ])

            # Get featured FAQs
            faqs = request.env['seitech.cms.faq'].sudo().search([
                ('is_published', '=', True),
                ('is_featured', '=', True)
            ], limit=6)

            # Get homepage statistics
            statistics = request.env['seitech.cms.statistic'].sudo().search([
                ('is_published', '=', True),
                ('display_location', '=', 'homepage')
            ], order='sequence')

            # Get featured services
            services = request.env['seitech.cms.service'].sudo().search([
                ('is_published', '=', True),
                ('show_on_homepage', '=', True)
            ], order='sequence', limit=6)

            # Get site settings
            settings = request.env['seitech.cms.site.settings'].sudo().get_settings()

            return self._json_response({
                'success': True,
                'data': {
                    'page': homepage.get_api_data() if homepage else None,
                    'testimonials': [t.get_api_data() for t in testimonials],
                    'partners': [p.get_api_data() for p in partners],
                    'team': [m.get_api_data() for m in team],
                    'faqs': [f.get_api_data() for f in faqs],
                    'statistics': [s.get_api_data() for s in statistics],
                    'services': [s.get_api_data() for s in services],
                    'settings': settings.get_api_data(),
                }
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e)
            }, 500)
