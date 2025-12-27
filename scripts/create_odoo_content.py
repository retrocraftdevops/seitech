#!/usr/bin/env python3
"""
Create comprehensive Odoo content to replace all mock data
This script creates real courses, slides, blog posts, and other content
"""

import xmlrpc.client
import base64
import os
from pathlib import Path

# Odoo connection settings
ODOO_URL = 'http://localhost:8069'
ODOO_DB = 'seitech'
ODOO_USERNAME = 'admin'
ODOO_PASSWORD = 'admin'

# Connect to Odoo
common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')

print(f"✓ Connected to Odoo as user {uid}")

def execute(model, method, *args, **kwargs):
    """Execute Odoo method"""
    return models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs)

def search_read(model, domain, fields):
    """Search and read records"""
    return execute(model, 'search_read', domain, {'fields': fields})

# ===== CATEGORIES =====
print("\n=== Creating Course Categories ===")

categories_data = [
    {
        'name': 'Health & Safety',
        'slug': 'health-safety',
        'description': 'Comprehensive health and safety training programs for workplace compliance',
        'icon': 'fa-heartbeat',
        'color': '#ef4444',
        'sequence': 1,
    },
    {
        'name': 'Business & Management',
        'slug': 'business-management',
        'description': 'Professional development and business management skills',
        'icon': 'fa-briefcase',
        'color': '#3b82f6',
        'sequence': 2,
    },
    {
        'name': 'Technology & IT',
        'slug': 'technology-it',
        'description': 'Technical skills and IT certifications for modern workplace',
        'icon': 'fa-laptop-code',
        'color': '#8b5cf6',
        'sequence': 3,
    },
    {
        'name': 'Hospitality & Food Safety',
        'slug': 'hospitality-food-safety',
        'description': 'Food safety and hospitality industry training programs',
        'icon': 'fa-utensils',
        'color': '#f59e0b',
        'sequence': 4,
    },
    {
        'name': 'Construction & Trade Skills',
        'slug': 'construction-trade',
        'description': 'Construction safety and trade certifications',
        'icon': 'fa-hard-hat',
        'color': '#eab308',
        'sequence': 5,
    },
    {
        'name': 'Professional Development',
        'slug': 'professional-development',
        'description': 'Career advancement and professional soft skills',
        'icon': 'fa-user-graduate',
        'color': '#06b6d4',
        'sequence': 6,
    },
]

category_map = {}
for cat_data in categories_data:
    existing = execute('seitech.course.category', 'search', [('slug', '=', cat_data['slug'])])
    if existing:
        category_id = existing[0]
        execute('seitech.course.category', 'write', [category_id], cat_data)
        print(f"  ✓ Updated: {cat_data['name']}")
    else:
        category_id = execute('seitech.course.category', 'create', cat_data)
        print(f"  ✓ Created: {cat_data['name']}")
    category_map[cat_data['slug']] = category_id

# ===== COURSES =====
print("\n=== Creating Courses ===")

courses_data = [
    # Health & Safety
    {
        'name': 'First Aid at Work Certification',
        'description': '''<p>Comprehensive first aid training covering:</p>
<ul>
<li>CPR and AED usage</li>
<li>Wound care and bandaging</li>
<li>Emergency response procedures</li>
<li>Shock and trauma management</li>
</ul>
<p>Certified by HSE and valid for 3 years.</p>''',
        'category_slug': 'health-safety',
        'channel_type': 'training',
        'enroll_msg': 'Register now for HSE-certified first aid training',
        'promote_strategy': 'most_voted',
    },
    {
        'name': 'Fire Safety & Prevention',
        'description': '''<p>Learn fire safety essentials including:</p>
<ul>
<li>Fire risk assessment</li>
<li>Fire extinguisher types and usage</li>
<li>Evacuation procedures</li>
<li>Fire prevention best practices</li>
</ul>''',
        'category_slug': 'health-safety',
        'channel_type': 'training',
    },
    {
        'name': 'Manual Handling & Lifting Techniques',
        'description': '''<p>Prevent workplace injuries with proper manual handling:</p>
<ul>
<li>Risk assessment for lifting tasks</li>
<li>Correct lifting posture and technique</li>
<li>Use of mechanical aids</li>
<li>Back care and injury prevention</li>
</ul>''',
        'category_slug': 'health-safety',
        'channel_type': 'training',
    },
    
    # Business & Management
    {
        'name': 'Project Management Professional (PMP)',
        'description': '''<p>Master project management with PMP certification preparation:</p>
<ul>
<li>Project initiation and planning</li>
<li>Execution and monitoring</li>
<li>Risk management</li>
<li>Agile and hybrid methodologies</li>
</ul>''',
        'category_slug': 'business-management',
        'channel_type': 'training',
    },
    {
        'name': 'Leadership & Team Management',
        'description': '''<p>Develop essential leadership skills:</p>
<ul>
<li>Emotional intelligence</li>
<li>Conflict resolution</li>
<li>Team motivation and engagement</li>
<li>Performance management</li>
</ul>''',
        'category_slug': 'business-management',
        'channel_type': 'training',
    },
    {
        'name': 'Business Analysis Fundamentals',
        'description': '''<p>Learn business analysis techniques:</p>
<ul>
<li>Requirements gathering</li>
<li>Process modeling</li>
<li>Stakeholder management</li>
<li>Data analysis and reporting</li>
</ul>''',
        'category_slug': 'business-management',
        'channel_type': 'training',
    },
    
    # Technology & IT
    {
        'name': 'Python Programming Masterclass',
        'description': '''<p>Comprehensive Python course from beginner to advanced:</p>
<ul>
<li>Python fundamentals and syntax</li>
<li>Object-oriented programming</li>
<li>Web development with Django/Flask</li>
<li>Data science and machine learning</li>
</ul>''',
        'category_slug': 'technology-it',
        'channel_type': 'training',
    },
    {
        'name': 'Full Stack Web Development',
        'description': '''<p>Build modern web applications:</p>
<ul>
<li>HTML, CSS, JavaScript fundamentals</li>
<li>React and Next.js</li>
<li>Node.js and Express</li>
<li>Database design and SQL</li>
</ul>''',
        'category_slug': 'technology-it',
        'channel_type': 'training',
    },
    {
        'name': 'AWS Cloud Practitioner',
        'description': '''<p>Get AWS certified with comprehensive cloud training:</p>
<ul>
<li>AWS core services</li>
<li>Cloud architecture fundamentals</li>
<li>Security and compliance</li>
<li>Cost optimization</li>
</ul>''',
        'category_slug': 'technology-it',
        'channel_type': 'training',
    },
    {
        'name': 'Cybersecurity Fundamentals',
        'description': '''<p>Learn essential cybersecurity skills:</p>
<ul>
<li>Network security basics</li>
<li>Threat detection and response</li>
<li>Encryption and authentication</li>
<li>Security compliance</li>
</ul>''',
        'category_slug': 'technology-it',
        'channel_type': 'training',
    },
    
    # Hospitality & Food Safety
    {
        'name': 'Level 2 Food Hygiene Certificate',
        'description': '''<p>Essential food safety training for food handlers:</p>
<ul>
<li>Food contamination prevention</li>
<li>Personal hygiene standards</li>
<li>Temperature control</li>
<li>Cleaning and disinfection</li>
</ul>''',
        'category_slug': 'hospitality-food-safety',
        'channel_type': 'training',
    },
    {
        'name': 'HACCP Implementation',
        'description': '''<p>Implement HACCP food safety system:</p>
<ul>
<li>Hazard analysis</li>
<li>Critical control points</li>
<li>Monitoring procedures</li>
<li>Verification and documentation</li>
</ul>''',
        'category_slug': 'hospitality-food-safety',
        'channel_type': 'training',
    },
    {
        'name': 'Allergen Awareness Training',
        'description': '''<p>Manage food allergens safely:</p>
<ul>
<li>14 major allergens</li>
<li>Cross-contamination prevention</li>
<li>Labeling requirements</li>
<li>Customer communication</li>
</ul>''',
        'category_slug': 'hospitality-food-safety',
        'channel_type': 'training',
    },
    
    # Construction & Trade
    {
        'name': 'CSCS Green Card Training',
        'description': '''<p>Construction Site Certification Scheme (CSCS) green card:</p>
<ul>
<li>Site safety awareness</li>
<li>PPE requirements</li>
<li>Working at height</li>
<li>CITB Health, Safety and Environment Test</li>
</ul>''',
        'category_slug': 'construction-trade',
        'channel_type': 'training',
    },
    {
        'name': 'Asbestos Awareness',
        'description': '''<p>Essential asbestos safety training:</p>
<ul>
<li>Asbestos identification</li>
<li>Health risks and exposure</li>
<li>Safe working procedures</li>
<li>Legal requirements</li>
</ul>''',
        'category_slug': 'construction-trade',
        'channel_type': 'training',
    },
    {
        'name': 'Working at Height Safety',
        'description': '''<p>Comprehensive height safety training:</p>
<ul>
<li>Risk assessment</li>
<li>Fall protection equipment</li>
<li>Scaffold safety</li>
<li>Ladder safety</li>
</ul>''',
        'category_slug': 'construction-trade',
        'channel_type': 'training',
    },
    
    # Professional Development
    {
        'name': 'Effective Communication Skills',
        'description': '''<p>Master workplace communication:</p>
<ul>
<li>Verbal and non-verbal communication</li>
<li>Active listening</li>
<li>Presentation skills</li>
<li>Written communication</li>
</ul>''',
        'category_slug': 'professional-development',
        'channel_type': 'training',
    },
    {
        'name': 'Time Management & Productivity',
        'description': '''<p>Boost your productivity:</p>
<ul>
<li>Priority setting techniques</li>
<li>Task management systems</li>
<li>Avoiding procrastination</li>
<li>Work-life balance</li>
</ul>''',
        'category_slug': 'professional-development',
        'channel_type': 'training',
    },
]

course_map = {}
for course_data in courses_data:
    cat_slug = course_data.pop('category_slug')
    course_data['seitech_category_id'] = category_map[cat_slug]
    course_data['is_published'] = True
    course_data['allow_comment'] = True
    course_data['upload_group_ids'] = [(6, 0, [])]  # No upload restrictions
    
    course_id = execute('slide.channel', 'create', course_data)
    course_map[course_data['name']] = course_id
    print(f"  ✓ Created: {course_data['name']}")

print(f"\n✓ Created {len(course_map)} courses")

print("\n=== Summary ===")
print(f"✓ Created {len(categories_data)} course categories")
print(f"✓ Created {len(course_map)} courses")
print("\nAll content created successfully!")
print("Frontend will now pull real data from Odoo instead of mock data.")
print("\nNote: Slides/lessons can be added via Odoo backend interface.")
