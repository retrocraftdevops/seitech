{
    'name': 'Seitech International Base',
    'version': '19.0.1.0.0',
    'category': 'Seitech/Base',
    'summary': 'Base module for Seitech International customizations',
    'description': """
        Seitech International Base Module
        ==================================
        This module provides the foundation for all Seitech International customizations.

        Features:
        - Company branding and configuration
        - Common utilities and helpers
        - Base customizations
    """,
    'author': 'Seitech International',
    'website': 'https://www.seitech.co.za',
    'license': 'LGPL-3',
    'depends': ['base', 'web'],
    'data': [
        'security/ir.model.access.csv',
        # 'views/views.xml',
        # 'data/data.xml',
    ],
    'demo': [],
    'installable': True,
    'application': True,
    'auto_install': False,
}
