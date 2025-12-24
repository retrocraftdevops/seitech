# -*- coding: utf-8 -*-
{
    'name': 'SEI Tech CMS',
    'version': '19.0.1.0.0',
    'category': 'Website',
    'summary': 'Content Management System for SEI Tech Frontend',
    'description': """
SEI Tech CMS Module
====================
This module provides content management capabilities for the SEI Tech
Next.js frontend application.

Features:
---------
* Page Sections (Hero, Features, CTAs)
* Testimonials
* FAQs
* Team Members
* Partners/Accreditations
* Site Settings
* Menu Management
* API endpoints for headless CMS

All content is editable from the admin backend and served via REST API
to the Next.js frontend.
    """,
    'author': 'SEI Tech International',
    'website': 'https://seitech.co.uk',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'mail',
        'website',
        'seitech_base',
    ],
    'data': [
        # Security
        'security/cms_security.xml',
        'security/ir.model.access.csv',
        # Data
        'data/cms_data.xml',
        # Views
        'views/page_section_views.xml',
        'views/testimonial_views.xml',
        'views/faq_views.xml',
        'views/team_member_views.xml',
        'views/partner_views.xml',
        'views/site_settings_views.xml',
        'views/service_views.xml',
        'views/menu_views.xml',
        # Seed Data
        'data/service_data.xml',
        'data/team_data.xml',
        'data/testimonial_data.xml',
        'data/partner_data.xml',
        'data/faq_data.xml',
        'data/statistic_data.xml',
        'data/site_settings_data.xml',
        'data/page_data.xml',
        'data/section_data.xml',
        'data/navigation_data.xml',
    ],
    'demo': [
        'data/demo_data.xml',
    ],
    'assets': {},
    'installable': True,
    'application': True,
    'auto_install': False,
}
