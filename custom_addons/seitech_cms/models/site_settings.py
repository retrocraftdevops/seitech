# -*- coding: utf-8 -*-
from odoo import models, fields, api


class CmsSiteSettings(models.Model):
    """Global Site Settings - Singleton pattern"""
    _name = 'seitech.cms.site.settings'
    _description = 'Site Settings'

    name = fields.Char(string='Site Name', default='SEI Tech International')

    # Branding
    logo = fields.Binary(string='Logo')
    logo_dark = fields.Binary(string='Logo (Dark Mode)')
    favicon = fields.Binary(string='Favicon')
    tagline = fields.Char(string='Tagline')

    # Contact Information
    company_name = fields.Char(string='Company Name')
    email = fields.Char(string='Email')
    phone = fields.Char(string='Phone')
    phone_secondary = fields.Char(string='Secondary Phone')
    whatsapp = fields.Char(string='WhatsApp Number')

    # Address
    address_line1 = fields.Char(string='Address Line 1')
    address_line2 = fields.Char(string='Address Line 2')
    city = fields.Char(string='City')
    postcode = fields.Char(string='Postcode')
    country = fields.Char(string='Country', default='United Kingdom')
    google_maps_url = fields.Char(string='Google Maps URL')
    google_maps_embed = fields.Text(string='Google Maps Embed Code')

    # Social Media
    facebook_url = fields.Char(string='Facebook URL')
    twitter_url = fields.Char(string='Twitter URL')
    linkedin_url = fields.Char(string='LinkedIn URL')
    instagram_url = fields.Char(string='Instagram URL')
    youtube_url = fields.Char(string='YouTube URL')
    tiktok_url = fields.Char(string='TikTok URL')

    # Business Hours
    business_hours = fields.Text(string='Business Hours (JSON)')
    timezone = fields.Char(string='Timezone', default='Europe/London')

    # SEO Defaults
    default_meta_title = fields.Char(string='Default Meta Title')
    default_meta_description = fields.Text(string='Default Meta Description')
    default_og_image = fields.Binary(string='Default OG Image')
    google_analytics_id = fields.Char(string='Google Analytics ID')
    google_tag_manager_id = fields.Char(string='Google Tag Manager ID')

    # Legal
    company_number = fields.Char(string='Company Registration Number')
    vat_number = fields.Char(string='VAT Number')
    privacy_policy_url = fields.Char(string='Privacy Policy URL')
    terms_url = fields.Char(string='Terms of Service URL')
    cookie_policy_url = fields.Char(string='Cookie Policy URL')

    # Notifications
    notification_email = fields.Char(string='Notification Email')
    contact_form_recipient = fields.Char(string='Contact Form Recipient')
    booking_notification_email = fields.Char(string='Booking Notification Email')

    # Features/Flags
    enable_live_chat = fields.Boolean(string='Enable Live Chat', default=False)
    enable_newsletter = fields.Boolean(string='Enable Newsletter', default=True)
    maintenance_mode = fields.Boolean(string='Maintenance Mode', default=False)
    maintenance_message = fields.Text(string='Maintenance Message')

    # Footer
    footer_text = fields.Html(string='Footer Text')
    copyright_text = fields.Char(string='Copyright Text')

    @api.model
    def get_settings(self):
        """Get or create singleton settings record"""
        settings = self.search([], limit=1)
        if not settings:
            settings = self.create({'name': 'SEI Tech International'})
        return settings

    def get_api_data(self):
        """Return data formatted for API response"""
        self.ensure_one()
        return {
            'siteName': self.name,
            'logo': f'/web/image/seitech.cms.site.settings/{self.id}/logo' if self.logo else None,
            'logoDark': f'/web/image/seitech.cms.site.settings/{self.id}/logo_dark' if self.logo_dark else None,
            'favicon': f'/web/image/seitech.cms.site.settings/{self.id}/favicon' if self.favicon else None,
            'tagline': self.tagline or '',
            'contact': {
                'companyName': self.company_name or '',
                'email': self.email or '',
                'phone': self.phone or '',
                'phoneSecondary': self.phone_secondary or '',
                'whatsapp': self.whatsapp or '',
                'address': {
                    'line1': self.address_line1 or '',
                    'line2': self.address_line2 or '',
                    'city': self.city or '',
                    'postcode': self.postcode or '',
                    'country': self.country or '',
                },
                'googleMapsUrl': self.google_maps_url or '',
            },
            'social': {
                'facebook': self.facebook_url or '',
                'twitter': self.twitter_url or '',
                'linkedin': self.linkedin_url or '',
                'instagram': self.instagram_url or '',
                'youtube': self.youtube_url or '',
                'tiktok': self.tiktok_url or '',
            },
            'businessHours': self.business_hours or '{}',
            'timezone': self.timezone or 'Europe/London',
            'seo': {
                'defaultMetaTitle': self.default_meta_title or '',
                'defaultMetaDescription': self.default_meta_description or '',
                'defaultOgImage': f'/web/image/seitech.cms.site.settings/{self.id}/default_og_image' if self.default_og_image else None,
                'googleAnalyticsId': self.google_analytics_id or '',
                'googleTagManagerId': self.google_tag_manager_id or '',
            },
            'legal': {
                'companyNumber': self.company_number or '',
                'vatNumber': self.vat_number or '',
                'privacyPolicyUrl': self.privacy_policy_url or '/privacy',
                'termsUrl': self.terms_url or '/terms',
                'cookiePolicyUrl': self.cookie_policy_url or '/cookies',
            },
            'features': {
                'enableLiveChat': self.enable_live_chat,
                'enableNewsletter': self.enable_newsletter,
                'maintenanceMode': self.maintenance_mode,
                'maintenanceMessage': self.maintenance_message or '',
            },
            'footer': {
                'text': self.footer_text or '',
                'copyright': self.copyright_text or f'© {fields.Date.today().year} SEI Tech International. All rights reserved.',
            },
        }


class CmsNavigation(models.Model):
    """Navigation Menu Items"""
    _name = 'seitech.cms.navigation'
    _description = 'Navigation Menu'
    _order = 'menu_type, sequence'

    name = fields.Char(string='Menu Item Name', required=True)
    menu_type = fields.Selection([
        ('header', 'Header Menu'),
        ('footer_company', 'Footer - Company'),
        ('footer_services', 'Footer - Services'),
        ('footer_resources', 'Footer - Resources'),
        ('footer_legal', 'Footer - Legal'),
        ('mobile', 'Mobile Menu'),
    ], string='Menu Type', required=True, default='header')

    url = fields.Char(string='URL')
    page_id = fields.Many2one('seitech.cms.page', string='Linked Page')
    parent_id = fields.Many2one('seitech.cms.navigation', string='Parent Menu')
    child_ids = fields.One2many('seitech.cms.navigation', 'parent_id', string='Submenu Items')

    # Settings
    icon = fields.Char(string='Icon Name')
    description = fields.Char(string='Description', help='For mega menu descriptions')
    open_new_tab = fields.Boolean(string='Open in New Tab')
    is_published = fields.Boolean(string='Published', default=True)
    is_highlighted = fields.Boolean(string='Highlighted', help='For CTA buttons in nav')
    sequence = fields.Integer(string='Sequence', default=10)

    def get_api_data(self):
        """Return data formatted for API response"""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'url': self.url or (f'/{self.page_id.slug}' if self.page_id else '#'),
            'icon': self.icon or '',
            'description': self.description or '',
            'openNewTab': self.open_new_tab,
            'isHighlighted': self.is_highlighted,
            'children': [child.get_api_data() for child in self.child_ids.filtered('is_published')],
        }
