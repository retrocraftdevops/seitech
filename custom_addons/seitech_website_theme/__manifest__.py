{
    'name': 'Seitech Website Theme',
    'version': '19.0.1.0.0',
    'category': 'Website/Theme',
    'summary': 'Modern enterprise website theme for Seitech International',
    'description': """
        Seitech Website Theme
        =====================

        A modern, professional website theme with:
        - Clean, enterprise-grade design
        - Teal/Cyan color scheme
        - Responsive mobile-first layout
        - Custom snippets for website builder
        - E-learning integration templates

        Features:
        - Sticky mega-menu header
        - Multi-column footer with newsletter
        - Hero sections with gradient backgrounds
        - Feature grids and stats sections
        - Testimonials and CTA components
        - Course listing and detail templates
    """,
    'author': 'Seitech International',
    'website': 'https://www.seitech.co.za',
    'license': 'LGPL-3',
    'depends': [
        'website',
        'website_slides',
        'seitech_base',
    ],
    'data': [
        'data/theme_data.xml',
        'views/layouts.xml',
        'views/snippets.xml',
        'templates/layout/header.xml',
        'templates/layout/footer.xml',
        'templates/pages/homepage.xml',
        'templates/snippets/s_hero_section.xml',
        'templates/snippets/s_feature_grid.xml',
        'templates/snippets/s_stats_section.xml',
        'templates/snippets/s_testimonials.xml',
        'templates/snippets/s_cta_section.xml',
        # E-Learning Template Overrides
        'templates/elearning/course_main.xml',
        'templates/elearning/slide_fullscreen.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'seitech_website_theme/static/src/scss/variables.scss',
            'seitech_website_theme/static/src/scss/mixins.scss',
            'seitech_website_theme/static/src/scss/components/_buttons.scss',
            'seitech_website_theme/static/src/scss/components/_cards.scss',
            'seitech_website_theme/static/src/scss/components/_navigation.scss',
            'seitech_website_theme/static/src/scss/components/_forms.scss',
            'seitech_website_theme/static/src/scss/components/_badges.scss',
            'seitech_website_theme/static/src/scss/pages/_homepage.scss',
            'seitech_website_theme/static/src/scss/pages/_courses.scss',
            'seitech_website_theme/static/src/scss/pages/_course_detail.scss',
            'seitech_website_theme/static/src/scss/pages/_dashboard.scss',
            'seitech_website_theme/static/src/scss/pages/_instructor.scss',
            'seitech_website_theme/static/src/scss/pages/_checkout.scss',
            'seitech_website_theme/static/src/scss/pages/_elearning.scss',
            'seitech_website_theme/static/src/scss/pages/_elearning_overrides.scss',
            'seitech_website_theme/static/src/scss/main.scss',
            'seitech_website_theme/static/src/js/theme.js',
            'seitech_website_theme/static/src/js/components/mega_menu.js',
            'seitech_website_theme/static/src/js/course_detail.js',
        ],
    },
    'images': [
        'static/description/theme_preview.png',
    ],
    'demo': [],
    'installable': True,
    'application': False,
    'auto_install': False,
}
