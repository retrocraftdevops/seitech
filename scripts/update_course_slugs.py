#!/usr/bin/env python3
"""
Script to update course SEO names (slugs) in Odoo.
Run this script to set proper URL slugs for all courses.
"""
import xmlrpc.client
import re


def slugify(text):
    """Convert text to URL-friendly slug."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')


def main():
    # Odoo connection settings
    url = 'http://localhost:8069'
    db = 'seitech'
    username = 'admin'
    password = 'admin'  # Change this to your admin password

    # Connect to Odoo
    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, username, password, {})

    if not uid:
        print("Failed to authenticate. Check your credentials.")
        return

    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

    # Get all published courses
    courses = models.execute_kw(db, uid, password, 'slide.channel', 'search_read', [
        [('is_published', '=', True)]
    ], {'fields': ['id', 'name', 'seo_name']})

    print(f"Found {len(courses)} published courses")

    for course in courses:
        current_slug = course.get('seo_name') or ''
        new_slug = slugify(course['name'])

        # Add delivery method suffix if not present
        # This is just an example - you might want different logic
        if 'e-learning' not in new_slug and 'elearning' not in new_slug:
            # Check course type and add appropriate suffix
            pass

        if current_slug != new_slug:
            print(f"Updating course {course['id']}: '{course['name']}'")
            print(f"  Old slug: '{current_slug}' -> New slug: '{new_slug}'")

            models.execute_kw(db, uid, password, 'slide.channel', 'write', [
                [course['id']], {'seo_name': new_slug}
            ])
            print("  Updated!")
        else:
            print(f"Course {course['id']} already has correct slug: '{current_slug}'")

    print("\nDone! Course slugs have been updated.")


if __name__ == '__main__':
    main()
