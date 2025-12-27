{
    'name': 'Seitech E-Learning',
    'version': '19.0.1.0.0',
    'category': 'Website/eLearning',
    'summary': 'Seitech International E-Learning Platform',
    'description': """
        Seitech E-Learning Platform
        ===========================

        Comprehensive LMS module with:

        Features:
        - Enhanced course management with pricing
        - Student enrollment system with payments
        - Certificate generation with QR verification
        - Quiz/assessment system
        - Assignment submissions
        - Live class scheduling
        - Instructor management
        - Progress tracking
        - Gamification (points & badges)
        - Student dashboard
        - Admin analytics

        Migrated from PHP CodeIgniter e-learning application.
    """,
    'author': 'Seitech International',
    'website': 'https://www.seitech.co.za',
    'license': 'LGPL-3',
    'depends': [
        'seitech_base',
        'seitech_website_theme',
        'website_slides',
        'survey',
        'website_sale',
        'payment',
        'rating',
        'calendar',
    ],
    'data': [
        # Security (order matters - groups must be defined before CSV references them)
        'security/elearning_groups.xml',
        'security/chat_security.xml',  # Must be before ir.model.access.csv
        'security/ir.model.access.csv',
        'security/record_rules.xml',
        'security/adaptive_learning_rules.xml',
        'security/social_learning_rules.xml',
        'security/admin_access.xml',
        # Data
        'data/sequence_data.xml',
        'data/email_templates.xml',
        'data/cron_data.xml',
        'data/badge_data.xml',
        'data/demo_content.xml',
        # Reports (must be before views that reference them)
        'reports/certificate_report.xml',
        # Views
        'views/res_users_views.xml',
        'views/enrollment_views.xml',
        'views/certificate_views.xml',
        'views/assignment_views.xml',
        'views/schedule_views.xml',
        'views/instructor_views.xml',
        'views/course_views.xml',
        'views/gamification_views.xml',
        'views/learning_path_views.xml',
        'views/skill_views.xml',
        'views/recommendation_views.xml',
        'views/discussion_views.xml',
        'views/study_group_views.xml',
        'views/streak_views.xml',
        'views/leaderboard_views.xml',
        'views/chat_views.xml',
        'views/dashboard_views.xml',
        'views/menus.xml',
        # Website Templates
        'views/website_templates.xml',
        'views/student_dashboard.xml',
        'views/instructor_dashboard.xml',
        'views/checkout_templates.xml',
        # Student Portal Templates
        'templates/student_dashboard.xml',
        'templates/portal_pages.xml',
        'templates/quiz_templates.xml',
        # Wizards
        'wizards/bulk_enrollment_views.xml',
        'wizards/certificate_generation_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'seitech_elearning/static/src/xml/dashboard.xml',
            'seitech_elearning/static/src/scss/backend.scss',
            'seitech_elearning/static/src/js/dashboard.js',
        ],
        'web.assets_frontend': [
            'seitech_elearning/static/src/scss/frontend.scss',
            'seitech_elearning/static/src/js/course_player.js',
            'seitech_elearning/static/src/js/progress_tracker.js',
        ],
    },
    'demo': [],
    'installable': True,
    'application': True,
    'auto_install': False,
}
