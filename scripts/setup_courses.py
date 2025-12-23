#!/usr/bin/env python3
"""
Script to set up courses in Odoo with proper delivery methods and slugs.
This ensures the frontend and backend are in sync.
"""
import xmlrpc.client
import re


def slugify(text):
    """Convert text to URL-friendly slug."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')


# Course definitions with delivery methods
COURSES = [
    # E-Learning Courses
    {
        'name': 'IOSH Working Safely',
        'slug': 'iosh-working-safely',
        'channel_type': 'training',  # 'training' is the default, represents e-learning in Odoo slides
        'difficulty_level': 'beginner',
        'list_price': 95.0,
        'description_short': '<p>Essential safety training for all employees, covering workplace hazards and personal safety responsibilities.</p>',
    },
    {
        'name': 'IOSH Managing Safely',
        'slug': 'iosh-managing-safely',
        'channel_type': 'training',
        'difficulty_level': 'intermediate',
        'list_price': 295.0,
        'description_short': '<p>The IOSH Managing Safely course is ideal for managers and supervisors who need a broader understanding of health and safety.</p>',
    },
    {
        'name': 'Fire Safety Awareness',
        'slug': 'fire-safety-awareness',
        'channel_type': 'training',
        'difficulty_level': 'beginner',
        'list_price': 25.0,
        'description_short': '<p>Essential fire safety training covering prevention, procedures, and emergency response.</p>',
    },
    {
        'name': 'Manual Handling Training',
        'slug': 'manual-handling-training',
        'channel_type': 'training',
        'difficulty_level': 'beginner',
        'list_price': 35.0,
        'description_short': '<p>Learn safe lifting techniques to prevent workplace injuries and comply with regulations.</p>',
    },
    {
        'name': 'First Aid at Work (3 Day)',
        'slug': 'first-aid-at-work-3-day',
        'channel_type': 'training',
        'difficulty_level': 'intermediate',
        'list_price': 245.0,
        'description_short': '<p>Comprehensive first aid training for workplace first aiders, Qualsafe accredited.</p>',
    },
    {
        'name': 'NEBOSH National General Certificate',
        'slug': 'nebosh-national-general-certificate',
        'channel_type': 'training',
        'difficulty_level': 'advanced',
        'list_price': 1195.0,
        'description_short': '<p>The gold standard qualification for health and safety professionals, recognized globally by employers.</p>',
    },
    # Additional courses that frontend expects
    {
        'name': 'DSE Assessment Training',
        'slug': 'dse-assessment-training',
        'channel_type': 'training',
        'difficulty_level': 'beginner',
        'list_price': 25.0,
        'description_short': '<p>Conduct display screen equipment assessments and maintain healthy workstation setups.</p>',
        'create_if_missing': True,
    },
    {
        'name': 'Fire Warden Training',
        'slug': 'fire-warden-training',
        'channel_type': 'training',
        'difficulty_level': 'beginner',
        'list_price': 45.0,
        'description_short': '<p>Essential training for designated fire wardens covering emergency procedures and responsibilities.</p>',
        'create_if_missing': True,
    },
    {
        'name': 'Mental Health First Aid',
        'slug': 'mental-health-first-aid',
        'channel_type': 'training',
        'difficulty_level': 'intermediate',
        'list_price': 195.0,
        'description_short': '<p>Learn to recognize signs of mental health issues and provide initial support in the workplace.</p>',
        'create_if_missing': True,
    },
]


def main():
    # Odoo connection settings
    url = 'http://localhost:8069'
    db = 'seitech'
    username = 'admin'
    password = 'admin'

    # Connect to Odoo
    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, username, password, {})

    if not uid:
        print("Failed to authenticate. Check your credentials.")
        return

    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

    print("Updating existing courses and creating missing ones...\n")

    for course_def in COURSES:
        # Search for existing course by name
        existing = models.execute_kw(db, uid, password, 'slide.channel', 'search_read', [
            [('name', '=', course_def['name'])]
        ], {'fields': ['id', 'name', 'seo_name'], 'limit': 1})

        if existing:
            # Update existing course
            course_id = existing[0]['id']
            print(f"Updating: {course_def['name']} (ID: {course_id})")

            update_vals = {
                'seo_name': course_def['slug'],
                'channel_type': course_def.get('channel_type', 'training'),
                'difficulty_level': course_def.get('difficulty_level', 'beginner'),
            }

            models.execute_kw(db, uid, password, 'slide.channel', 'write', [
                [course_id], update_vals
            ])
            print(f"  -> Slug: {course_def['slug']}")

        elif course_def.get('create_if_missing'):
            # Create new course
            print(f"Creating: {course_def['name']}")

            new_course = {
                'name': course_def['name'],
                'seo_name': course_def['slug'],
                'channel_type': course_def.get('channel_type', 'training'),
                'difficulty_level': course_def.get('difficulty_level', 'beginner'),
                'list_price': course_def.get('list_price', 0),
                'description_short': course_def.get('description_short', ''),
                'is_published': True,
                'enroll': 'public',
                'visibility': 'public',
            }

            course_id = models.execute_kw(db, uid, password, 'slide.channel', 'create', [new_course])
            print(f"  -> Created with ID: {course_id}, Slug: {course_def['slug']}")
        else:
            print(f"Skipping (not found): {course_def['name']}")

    print("\n" + "=" * 50)
    print("Final course list:")
    print("=" * 50)

    # List all courses
    all_courses = models.execute_kw(db, uid, password, 'slide.channel', 'search_read', [
        [('is_published', '=', True)]
    ], {'fields': ['id', 'name', 'seo_name', 'channel_type', 'list_price'], 'order': 'name'})

    for c in all_courses:
        print(f"  {c['id']:3} | {c['seo_name']:40} | £{c['list_price']:>7.0f} | {c['name']}")

    print(f"\nTotal: {len(all_courses)} courses")


if __name__ == '__main__':
    main()
