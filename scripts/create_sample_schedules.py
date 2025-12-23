#!/usr/bin/env python3
"""Create sample schedule data for testing."""
import sys
import os
from datetime import datetime, timedelta

# Add Odoo to path
sys.path.insert(0, '/opt/odoo/odoo')

import odoo
from odoo import api, SUPERUSER_ID

def create_sample_schedules():
    """Create sample schedule records."""
    odoo.tools.config.parse_config(['--config=/opt/odoo/config/odoo.conf'])
    db_name = 'seitech'
    registry = odoo.modules.registry.Registry.new(db_name)

    with registry.cursor() as cr:
        env = api.Environment(cr, SUPERUSER_ID, {})

        # Get courses
        courses = env['slide.channel'].search([], limit=6)
        if not courses:
            print("No courses found! Please create courses first.")
            return

        # Get or create instructors
        Instructor = env['seitech.instructor']

        instructors_data = [
            {
                'name': 'John Smith',
                'title': 'Senior Health & Safety Consultant',
                'short_bio': '20+ years experience in occupational health and safety management',
                'email': 'john.smith@seitech.co.uk',
                'state': 'active',
            },
            {
                'name': 'Sarah Johnson',
                'title': 'Fire Safety Expert & Trainer',
                'short_bio': 'Certified Fire Risk Assessor with 15 years in fire safety training',
                'email': 'sarah.johnson@seitech.co.uk',
                'state': 'active',
            },
            {
                'name': 'Michael Brown',
                'title': 'IOSH Certified Trainer',
                'short_bio': 'Expert in workplace safety management and leadership',
                'email': 'michael.brown@seitech.co.uk',
                'state': 'active',
            },
            {
                'name': 'Emma Wilson',
                'title': 'First Aid Training Lead',
                'short_bio': 'Qualsafe-certified First Aid instructor with medical background',
                'email': 'emma.wilson@seitech.co.uk',
                'state': 'active',
            },
        ]

        instructors = []
        for data in instructors_data:
            existing = Instructor.search([('email', '=', data['email'])], limit=1)
            if existing:
                instructors.append(existing)
                print(f"Instructor exists: {data['name']}")
            else:
                instructor = Instructor.create(data)
                instructors.append(instructor)
                print(f"Created instructor: {data['name']}")

        # Create schedules
        Schedule = env['seitech.schedule']

        now = datetime.utcnow()

        schedules_data = [
            {
                'name': 'IOSH Managing Safely - Live Virtual Session',
                'channel_id': courses.filtered(lambda c: 'IOSH Managing' in c.name)[:1].id or courses[0].id,
                'instructor_id': instructors[2].id if len(instructors) > 2 else instructors[0].id,
                'start_datetime': now + timedelta(days=2, hours=9),
                'end_datetime': now + timedelta(days=2, hours=12),
                'meeting_type': 'zoom',
                'meeting_url': 'https://zoom.us/j/example',
                'max_attendees': 30,
                'registration_required': True,
                'state': 'scheduled',
                'description': '<p>Interactive live virtual session covering key aspects of the IOSH Managing Safely course with Q&A.</p>',
            },
            {
                'name': 'Fire Safety Awareness - Classroom Training',
                'channel_id': courses.filtered(lambda c: 'Fire' in c.name)[:1].id or courses[0].id,
                'instructor_id': instructors[1].id if len(instructors) > 1 else instructors[0].id,
                'start_datetime': now + timedelta(days=3, hours=10),
                'end_datetime': now + timedelta(days=3, hours=14),
                'meeting_type': 'in_person',
                'location': 'London Training Centre, 123 High Street, London EC1A',
                'max_attendees': 20,
                'registration_required': True,
                'state': 'scheduled',
                'description': '<p>Hands-on fire safety training including practical fire extinguisher exercises.</p>',
            },
            {
                'name': 'NEBOSH General Certificate - Live Q&A Session',
                'channel_id': courses.filtered(lambda c: 'NEBOSH' in c.name)[:1].id or courses[0].id,
                'instructor_id': instructors[0].id,
                'start_datetime': now + timedelta(days=5, hours=14),
                'end_datetime': now + timedelta(days=5, hours=16),
                'meeting_type': 'teams',
                'meeting_url': 'https://teams.microsoft.com/example',
                'max_attendees': 50,
                'registration_required': True,
                'state': 'scheduled',
                'description': '<p>Open Q&A session for NEBOSH students to clarify concepts and exam preparation tips.</p>',
            },
            {
                'name': 'First Aid at Work - Practical Assessment',
                'channel_id': courses.filtered(lambda c: 'First Aid' in c.name)[:1].id or courses[0].id,
                'instructor_id': instructors[3].id if len(instructors) > 3 else instructors[0].id,
                'start_datetime': now + timedelta(days=7, hours=9),
                'end_datetime': now + timedelta(days=7, hours=15),
                'meeting_type': 'in_person',
                'location': 'Birmingham Training Centre, 45 Station Road, Birmingham B1',
                'max_attendees': 15,
                'registration_required': True,
                'state': 'scheduled',
                'description': '<p>Practical first aid assessment day including CPR, wound care, and emergency scenarios.</p>',
            },
            {
                'name': 'IOSH Working Safely - Virtual Workshop',
                'channel_id': courses.filtered(lambda c: 'IOSH Working' in c.name)[:1].id or courses[0].id,
                'instructor_id': instructors[2].id if len(instructors) > 2 else instructors[0].id,
                'start_datetime': now + timedelta(days=10, hours=10),
                'end_datetime': now + timedelta(days=10, hours=13),
                'meeting_type': 'zoom',
                'meeting_url': 'https://zoom.us/j/example2',
                'max_attendees': 40,
                'registration_required': True,
                'state': 'scheduled',
                'description': '<p>Interactive workshop covering workplace safety fundamentals for all employees.</p>',
            },
            {
                'name': 'Manual Handling Training - Onsite Session',
                'channel_id': courses.filtered(lambda c: 'Manual' in c.name)[:1].id or courses[0].id,
                'instructor_id': instructors[0].id,
                'start_datetime': now + timedelta(days=12, hours=9),
                'end_datetime': now + timedelta(days=12, hours=12),
                'meeting_type': 'in_person',
                'location': 'Manchester Training Centre, 78 Victoria Street, Manchester M1',
                'max_attendees': 12,
                'registration_required': True,
                'state': 'scheduled',
                'description': '<p>Practical manual handling training with hands-on lifting technique demonstrations.</p>',
            },
        ]

        created_count = 0
        for data in schedules_data:
            # Check if similar schedule exists
            existing = Schedule.search([
                ('name', '=', data['name']),
                ('start_datetime', '>=', now),
            ], limit=1)

            if existing:
                print(f"Schedule exists: {data['name']}")
            else:
                schedule = Schedule.create(data)
                created_count += 1
                print(f"Created schedule: {data['name']}")

        cr.commit()
        print(f"\nTotal schedules created: {created_count}")
        print(f"Total schedules in system: {Schedule.search_count([('state', '=', 'scheduled')])}")


if __name__ == '__main__':
    create_sample_schedules()
