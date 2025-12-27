#!/usr/bin/env python3
"""
Script to populate Odoo with comprehensive course data
Replaces all mock data with real Odoo records
"""

import sys
import os

# Add Odoo to path
sys.path.append('/opt/odoo/odoo')

import odoo
from odoo import api, SUPERUSER_ID
from odoo.modules.registry import Registry

# Configure Odoo
odoo.tools.config.parse_config(['-c', '/opt/odoo/config/odoo.conf'])

def main():
    dbname = 'seitech'  # Database name
    
    registry = Registry.new(dbname)
    with registry.cursor() as cr:
        env = api.Environment(cr, SUPERUSER_ID, {})
        
        print("=" * 80)
        print("POPULATING ODOO WITH COURSE DATA")
        print("=" * 80)
        
        # Create categories
        print("\n1. Creating Course Categories...")
        categories = create_categories(env)
        
        # Create instructors
        print("\n2. Creating Instructors...")
        instructors = create_instructors(env)
        
        # Create skills
        print("\n3. Creating Skills...")
        skills = create_skills(env)
        
        # Create courses
        print("\n4. Creating Courses...")
        courses = create_courses(env, categories, instructors, skills)
        
        # Create lessons/slides
        print("\n5. Creating Lessons...")
        create_lessons(env, courses)
        
        # Create sample enrollments
        print("\n6. Creating Sample Enrollments...")
        create_enrollments(env, courses)
        
        # Commit changes
        cr.commit()
        
        print("\n" + "=" * 80)
        print("DATA POPULATION COMPLETE!")
        print("=" * 80)
        print(f"Categories: {len(categories)}")
        print(f"Instructors: {len(instructors)}")
        print(f"Skills: {len(skills)}")
        print(f"Courses: {len(courses)}")


def create_categories(env):
    """Create course categories"""
    Category = env['seitech.course.category'].sudo()
    
    categories_data = [
        {
            'name': 'Health & Safety',
            'slug': 'health-safety',
            'description': 'Comprehensive health and safety training programs',
            'icon': 'fa-heartbeat',
            'color': '#ef4444',
            'sequence': 1,
        },
        {
            'name': 'Business & Management',
            'slug': 'business-management',
            'description': 'Professional development and business skills',
            'icon': 'fa-briefcase',
            'color': '#3b82f6',
            'sequence': 2,
        },
        {
            'name': 'Technology & IT',
            'slug': 'technology-it',
            'description': 'Technical skills and IT certifications',
            'icon': 'fa-laptop-code',
            'color': '#8b5cf6',
            'sequence': 3,
        },
        {
            'name': 'Hospitality & Food Safety',
            'slug': 'hospitality-food-safety',
            'description': 'Food safety and hospitality industry training',
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
            'description': 'Career advancement and soft skills',
            'icon': 'fa-user-graduate',
            'color': '#06b6d4',
            'sequence': 6,
        },
    ]
    
    categories = {}
    for data in categories_data:
        # Check if exists
        existing = Category.search([('slug', '=', data['slug'])], limit=1)
        if existing:
            categories[data['slug']] = existing
            print(f"  ✓ Category exists: {data['name']}")
        else:
            cat = Category.create(data)
            categories[data['slug']] = cat
            print(f"  ✓ Created: {data['name']}")
    
    return categories


def create_instructors(env):
    """Create instructor profiles"""
    Instructor = env['seitech.instructor'].sudo()
    Partner = env['res.partner'].sudo()
    User = env['res.users'].sudo()
    
    instructors_data = [
        {
            'name': 'Dr. Sarah Johnson',
            'email': 'sarah.johnson@seitech.com',
            'bio': 'Health and Safety expert with 15+ years experience',
            'specialties': ['Health & Safety', 'Risk Management'],
        },
        {
            'name': 'Prof. Michael Chen',
            'email': 'michael.chen@seitech.com',
            'bio': 'Technology educator and software architect',
            'specialties': ['Web Development', 'Cloud Computing'],
        },
        {
            'name': 'Emma Williams',
            'email': 'emma.williams@seitech.com',
            'bio': 'Business strategist and certified trainer',
            'specialties': ['Business Management', 'Leadership'],
        },
        {
            'name': 'David Martinez',
            'email': 'david.martinez@seitech.com',
            'bio': 'Food safety consultant with industry certifications',
            'specialties': ['Food Safety', 'HACCP'],
        },
    ]
    
    instructors = {}
    for data in instructors_data:
        # Check if user exists
        existing_user = User.search([('login', '=', data['email'])], limit=1)
        if existing_user:
            # Find instructor profile
            existing_inst = Instructor.search([('user_id', '=', existing_user.id)], limit=1)
            if existing_inst:
                instructors[data['email']] = existing_inst
                print(f"  ✓ Instructor exists: {data['name']}")
                continue
        
        # Create partner
        partner = Partner.create({
            'name': data['name'],
            'email': data['email'],
            'is_company': False,
        })
        
        # Create user
        user = User.create({
            'name': data['name'],
            'login': data['email'],
            'email': data['email'],
            'partner_id': partner.id,
        })
        
        # Add user to instructor group
        user.write({'groups_id': [(4, env.ref('seitech_elearning.group_elearning_instructor').id)]})
        
        # Create instructor profile
        instructor = Instructor.create({
            'user_id': user.id,
            'bio': data['bio'],
            'specialties': ', '.join(data['specialties']),
        })
        
        instructors[data['email']] = instructor
        print(f"  ✓ Created: {data['name']}")
    
    return instructors


def create_skills(env):
    """Create skill taxonomy"""
    Skill = env['seitech.skill'].sudo()
    
    skills_data = [
        {'name': 'Risk Assessment', 'category': 'safety'},
        {'name': 'Emergency Response', 'category': 'safety'},
        {'name': 'Python Programming', 'category': 'technical'},
        {'name': 'JavaScript', 'category': 'technical'},
        {'name': 'Project Management', 'category': 'business'},
        {'name': 'Leadership', 'category': 'business'},
        {'name': 'Food Hygiene', 'category': 'hospitality'},
        {'name': 'HACCP', 'category': 'hospitality'},
    ]
    
    skills = {}
    for data in skills_data:
        existing = Skill.search([('name', '=', data['name'])], limit=1)
        if existing:
            skills[data['name']] = existing
            print(f"  ✓ Skill exists: {data['name']}")
        else:
            skill = Skill.create(data)
            skills[data['name']] = skill
            print(f"  ✓ Created: {data['name']}")
    
    return skills


def create_courses(env, categories, instructors, skills):
    """Create comprehensive courses"""
    Course = env['slide.channel'].sudo()
    
    courses_data = [
        {
            'name': 'Health & Safety in the Workplace',
            'category': 'health-safety',
            'instructor': 'sarah.johnson@seitech.com',
            'description': 'Comprehensive workplace health and safety training covering risk assessment, emergency procedures, and compliance.',
            'price': 149.99,
            'duration': 8,
            'level': 'beginner',
            'skills': ['Risk Assessment', 'Emergency Response'],
        },
        {
            'name': 'First Aid Certification',
            'category': 'health-safety',
            'instructor': 'sarah.johnson@seitech.com',
            'description': 'Official First Aid certification course covering CPR, emergency response, and medical procedures.',
            'price': 199.99,
            'duration': 16,
            'level': 'intermediate',
            'skills': ['Emergency Response'],
        },
        {
            'name': 'Full Stack Web Development',
            'category': 'technology-it',
            'instructor': 'michael.chen@seitech.com',
            'description': 'Complete web development bootcamp covering HTML, CSS, JavaScript, Python, and modern frameworks.',
            'price': 499.99,
            'duration': 120,
            'level': 'intermediate',
            'skills': ['Python Programming', 'JavaScript'],
        },
        {
            'name': 'Business Management Fundamentals',
            'category': 'business-management',
            'instructor': 'emma.williams@seitech.com',
            'description': 'Essential business management skills including planning, organization, leadership, and strategy.',
            'price': 299.99,
            'duration': 40,
            'level': 'beginner',
            'skills': ['Project Management', 'Leadership'],
        },
        {
            'name': 'Food Safety Level 2',
            'category': 'hospitality-food-safety',
            'instructor': 'david.martinez@seitech.com',
            'description': 'Industry-standard food safety certification covering hygiene, HACCP, and food handling.',
            'price': 129.99,
            'duration': 12,
            'level': 'beginner',
            'skills': ['Food Hygiene', 'HACCP'],
        },
        {
            'name': 'Leadership Excellence',
            'category': 'professional-development',
            'instructor': 'emma.williams@seitech.com',
            'description': 'Advanced leadership training for managers and aspiring leaders.',
            'price': 399.99,
            'duration': 24,
            'level': 'advanced',
            'skills': ['Leadership', 'Project Management'],
        },
    ]
    
    courses = {}
    for data in courses_data:
        # Check if exists
        existing = Course.search([('name', '=', data['name'])], limit=1)
        if existing:
            courses[data['name']] = existing
            print(f"  ✓ Course exists: {data['name']}")
            continue
        
        category = categories.get(data['category'])
        instructor = instructors.get(data['instructor'])
        
        if not category or not instructor:
            print(f"  ✗ Skipping {data['name']} - missing dependencies")
            continue
        
        # Create course
        course = Course.create({
            'name': data['name'],
            'seitech_category_id': category.id,
            'description': data['description'],
            'user_id': instructor.user_id.id,
            'website_published': True,
            'is_published': True,
            'enroll': 'payment',
            'list_price': data['price'],
        })
        
        courses[data['name']] = course
        print(f"  ✓ Created: {data['name']} (${data['price']})")
    
    return courses


def create_lessons(env, courses):
    """Create lessons/slides for courses"""
    Slide = env['slide.slide'].sudo()
    
    lessons_per_course = {
        'Health & Safety in the Workplace': [
            {'name': 'Introduction to Workplace Safety', 'type': 'video', 'duration': 15},
            {'name': 'Risk Assessment Basics', 'type': 'video', 'duration': 20},
            {'name': 'Emergency Procedures', 'type': 'video', 'duration': 25},
            {'name': 'Safety Quiz', 'type': 'quiz', 'duration': 10},
        ],
        'Full Stack Web Development': [
            {'name': 'HTML & CSS Fundamentals', 'type': 'video', 'duration': 45},
            {'name': 'JavaScript Basics', 'type': 'video', 'duration': 60},
            {'name': 'Python Introduction', 'type': 'video', 'duration': 50},
            {'name': 'Building Your First App', 'type': 'video', 'duration': 90},
        ],
        'Food Safety Level 2': [
            {'name': 'Food Hygiene Basics', 'type': 'video', 'duration': 20},
            {'name': 'HACCP Principles', 'type': 'video', 'duration': 30},
            {'name': 'Final Assessment', 'type': 'quiz', 'duration': 15},
        ],
    }
    
    total_created = 0
    for course_name, lessons in lessons_per_course.items():
        course = courses.get(course_name)
        if not course:
            continue
        
        sequence = 1
        for lesson_data in lessons:
            # Check if exists
            existing = Slide.search([
                ('channel_id', '=', course.id),
                ('name', '=', lesson_data['name'])
            ], limit=1)
            
            if existing:
                continue
            
            slide_type = 'article' if lesson_data['type'] == 'video' else 'quiz'
            
            Slide.create({
                'name': lesson_data['name'],
                'channel_id': course.id,
                'slide_category': 'video' if lesson_data['type'] == 'video' else 'quiz',
                'is_published': True,
                'sequence': sequence,
                'completion_time': lesson_data['duration'] / 60,  # Convert to hours
            })
            
            sequence += 1
            total_created += 1
    
    print(f"  ✓ Created {total_created} lessons")
    return total_created


def create_enrollments(env, courses):
    """Create sample enrollments for testing"""
    Enrollment = env['seitech.enrollment'].sudo()
    User = env['res.users'].sudo()
    
    # Get or create a test student
    test_user = User.search([('login', '=', 'student@test.com')], limit=1)
    if not test_user:
        partner = env['res.partner'].sudo().create({
            'name': 'Test Student',
            'email': 'student@test.com',
        })
        test_user = User.create({
            'name': 'Test Student',
            'login': 'student@test.com',
            'email': 'student@test.com',
            'partner_id': partner.id,
        })
        # Add to student group
        test_user.write({'groups_id': [(4, env.ref('seitech_elearning.group_elearning_student').id)]})
    
    # Enroll in a few courses
    enrolled = 0
    for course_name in list(courses.keys())[:3]:
        course = courses[course_name]
        
        # Check if already enrolled
        existing = Enrollment.search([
            ('user_id', '=', test_user.id),
            ('channel_id', '=', course.id)
        ], limit=1)
        
        if not existing:
            Enrollment.create({
                'user_id': test_user.id,
                'channel_id': course.id,
                'state': 'active',
                'source': 'direct',
            })
            enrolled += 1
    
    print(f"  ✓ Created {enrolled} enrollments for test user")
    return enrolled


if __name__ == '__main__':
    main()
