#!/usr/bin/env python3
"""
Script to populate Odoo with NVQ and Certification Courses
Uses XML-RPC to communicate with Odoo
"""

import xmlrpc.client
import sys
import os

# Odoo connection settings
ODOO_URL = os.environ.get('ODOO_URL', 'http://localhost:8069')
ODOO_DB = os.environ.get('ODOO_DB', 'seitech')
ODOO_USER = os.environ.get('ODOO_USER', 'admin')
ODOO_PASSWORD = os.environ.get('ODOO_PASSWORD', 'admin')

# NVQ Courses from the approved courses document
NVQ_COURSES = [
    # Level 1
    {
        'name': 'ProQual Level 1 Award in Health and Safety in a Construction Environment',
        'level': 'Level 1',
        'category': 'Health & Safety',
        'description': '''This qualification is designed for workers who need a solid understanding of health and safety in construction environments.

Key Learning Outcomes:
- Understanding health and safety legislation
- Risk assessment fundamentals
- Working safely on construction sites
- Personal protective equipment (PPE)
- Emergency procedures

Ideal for: New entrants to the construction industry, apprentices, and those requiring the CSCS Green Card.''',
        'price': 149.99,
        'duration': 8,
    },
    # Level 2
    {
        'name': 'Level 2 Award in Asbestos Awareness (600/6386/5)',
        'level': 'Level 2',
        'category': 'Health & Safety',
        'description': '''Comprehensive training on asbestos awareness for construction and maintenance workers.

Key Learning Outcomes:
- Types of asbestos and their properties
- Health risks associated with asbestos exposure
- Legal requirements and regulations
- Identifying asbestos-containing materials
- Safe working procedures

Certification: Ofqual regulated qualification.''',
        'price': 89.99,
        'duration': 4,
    },
    {
        'name': 'ProQual Level 2 Award for Fire Marshals',
        'level': 'Level 2',
        'category': 'Health & Safety',
        'description': '''Essential training for workplace fire marshals and wardens.

Key Learning Outcomes:
- Fire prevention and safety measures
- Emergency evacuation procedures
- Fire extinguisher operation
- Risk assessment for fire hazards
- Communication during emergencies

Ideal for: Designated fire marshals, health and safety personnel, and team leaders.''',
        'price': 129.99,
        'duration': 6,
    },
    {
        'name': 'ProQual Level 2 Award in Foundational Fire Risk Assessment',
        'level': 'Level 2',
        'category': 'Health & Safety',
        'description': '''Foundation course for conducting fire risk assessments in various premises.

Key Learning Outcomes:
- Fire risk assessment methodology
- Identifying fire hazards
- Evaluating fire risks
- Implementing control measures
- Documentation and record keeping

Ideal for: Building managers, facilities managers, and safety officers.''',
        'price': 199.99,
        'duration': 12,
    },
    {
        'name': 'Level 2 Award in Assessing Vocationally Related Achievement (600/2005/2)',
        'level': 'Level 2',
        'category': 'Professional Development',
        'description': '''Qualification for those who assess vocational skills and knowledge.

Key Learning Outcomes:
- Understanding assessment principles
- Planning assessment activities
- Conducting assessments
- Making assessment decisions
- Quality assurance in assessment

Ideal for: Trainers, supervisors, and those involved in workplace assessment.''',
        'price': 299.99,
        'duration': 16,
    },
    # Level 3
    {
        'name': 'Level 3 Award in The Inspection and Testing of Fire Resisting Door Installations (603/4995/5)',
        'level': 'Level 3',
        'category': 'Construction & Trade Skills',
        'description': '''Specialist qualification for inspecting and testing fire doors.

Key Learning Outcomes:
- Fire door components and standards
- Inspection techniques and criteria
- Testing procedures
- Identifying defects and issues
- Reporting and documentation

Certification: Third-party certified qualification for fire door inspectors.''',
        'price': 449.99,
        'duration': 16,
    },
    {
        'name': 'ProQual Level 3 Award in Environmental Management',
        'level': 'Level 3',
        'category': 'Business & Management',
        'description': '''Environmental management training for workplace leaders.

Key Learning Outcomes:
- Environmental legislation and compliance
- Environmental management systems
- Waste management principles
- Sustainability practices
- Environmental risk assessment

Ideal for: Site managers, project managers, and environmental coordinators.''',
        'price': 349.99,
        'duration': 20,
    },
    {
        'name': 'ProQual Level 3 NVQ Certificate in Occupational Health and Safety',
        'level': 'Level 3',
        'category': 'Health & Safety',
        'description': '''Comprehensive NVQ certification in occupational health and safety.

Key Learning Outcomes:
- Health and safety legislation and policy
- Risk assessment and management
- Incident investigation
- Monitoring and auditing
- Managing health and safety

Recognition: Nationally recognized NVQ qualification.''',
        'price': 899.99,
        'duration': 60,
    },
    {
        'name': 'ProQual Level 3 Award in Intermediate Fire Risk Assessment',
        'level': 'Level 3',
        'category': 'Health & Safety',
        'description': '''Intermediate level training for conducting comprehensive fire risk assessments.

Key Learning Outcomes:
- Complex fire risk assessment techniques
- Analyzing fire protection measures
- Developing fire safety strategies
- Regulatory compliance
- Advanced documentation

Ideal for: Fire safety consultants, building surveyors, and safety managers.''',
        'price': 349.99,
        'duration': 16,
    },
    {
        'name': 'ProQual Level 3 Award in Education and Training',
        'level': 'Level 3',
        'category': 'Professional Development',
        'description': '''Essential qualification for trainers and educators in vocational settings.

Key Learning Outcomes:
- Planning and delivering training sessions
- Understanding learner needs
- Using resources effectively
- Assessment for learning
- Reflective practice

Formerly known as PTLLS. Ideal for: Aspiring trainers, instructors, and teachers.''',
        'price': 399.99,
        'duration': 24,
    },
    {
        'name': 'ProQual Level 3 Certificate in Teaching, Training and Assessment',
        'level': 'Level 3',
        'category': 'Professional Development',
        'description': '''Advanced certificate for professional trainers and assessors.

Key Learning Outcomes:
- Curriculum design and development
- Advanced teaching methodologies
- Assessment strategies
- Quality assurance
- Professional development

This qualification is more comprehensive than the Award in Education and Training.''',
        'price': 599.99,
        'duration': 40,
    },
    # Level 4
    {
        'name': 'Level 4 Award in Advanced Fire Risk Assessment (610/4737/5)',
        'level': 'Level 4',
        'category': 'Health & Safety',
        'description': '''Advanced qualification for complex fire risk assessment scenarios.

Key Learning Outcomes:
- Complex building fire safety analysis
- Engineered fire safety solutions
- Fire modeling and simulation concepts
- Expert witness reporting
- Advanced regulatory interpretation

Ideal for: Senior fire safety consultants and engineers.''',
        'price': 599.99,
        'duration': 24,
    },
    {
        'name': 'ProQual Level 4 Award in the Internal Quality Assurance of Assessment Processes and Practice',
        'level': 'Level 4',
        'category': 'Professional Development',
        'description': '''Qualification for internal quality assurance of assessment systems.

Key Learning Outcomes:
- Quality assurance principles
- Monitoring assessment practices
- Standardizing assessment decisions
        - Supporting assessor development
- Maintaining quality systems

Ideal for: Lead assessors, IQA coordinators, and training managers.''',
        'price': 449.99,
        'duration': 20,
    },
    {
        'name': 'ProQual Level 4 Certificate in Leading the Internal Quality Assurance of Assessment Processes and Practice',
        'level': 'Level 4',
        'category': 'Professional Development',
        'description': '''Leadership qualification for managing IQA teams and processes.

Key Learning Outcomes:
- Leading IQA teams
- Developing IQA policies
- Strategic quality management
- External quality assurance liaison
- Continuous improvement

Ideal for: Quality managers, assessment center managers, and training directors.''',
        'price': 649.99,
        'duration': 32,
    },
    # Level 6
    {
        'name': 'Level 6 NVQ Diploma in Occupational Health and Safety Practice (603/3106/9)',
        'level': 'Level 6',
        'category': 'Health & Safety',
        'description': '''Advanced NVQ diploma for health and safety professionals.

Key Learning Outcomes:
- Strategic health and safety management
- Organizational safety culture development
- Advanced risk management
- Legal compliance at organizational level
- Health and safety leadership

Ideal for: Health and safety managers, consultants, and directors.''',
        'price': 1999.99,
        'duration': 120,
    },
    # Level 7
    {
        'name': 'Level 7 Diploma in Strategic Health and Safety Leadership and Management (603/6851/2)',
        'level': 'Level 7',
        'category': 'Health & Safety',
        'description': '''Executive level diploma for strategic health and safety leadership.

Key Learning Outcomes:
- Strategic health and safety planning
- Board-level safety governance
- Organizational change management
- Global safety standards
- Executive leadership skills

Ideal for: Directors, senior executives, and chief safety officers.''',
        'price': 2999.99,
        'duration': 160,
    },
    {
        'name': 'Level 7 Diploma in Environmental Management (610/5231/0)',
        'level': 'Level 7',
        'category': 'Business & Management',
        'description': '''Executive level diploma in strategic environmental management.

Key Learning Outcomes:
- Environmental strategy development
- Sustainability governance
- Environmental impact assessment
- Carbon management
- Green business transformation

Ideal for: Environmental directors, sustainability managers, and executives.''',
        'price': 2799.99,
        'duration': 160,
    },
]

# Certification Services
CERTIFICATION_SERVICES = [
    {
        'name': 'CHAS (Contractors Health and Safety Assessment Scheme) Certification Support',
        'category': 'Certifications',
        'description': '''Complete support package for achieving CHAS certification.

Benefits of CHAS Certification:
- Demonstrates health and safety compliance
- Enhances company reputation and credibility
- Access to public sector contracts
- Reduced risk of workplace accidents
- Industry-recognized accreditation

Our Service Includes:
- Gap analysis and readiness assessment
- Documentation preparation
- Policy development
- Implementation support
- Application assistance''',
        'price': 499.99,
        'duration': 20,
    },
    {
        'name': 'Constructionline Certification Support',
        'category': 'Certifications',
        'description': '''Expert assistance for Constructionline registration and certification.

Benefits of Constructionline:
- Simplified pre-qualification process
- Increased visibility to clients
- Streamlined procurement
- Compliance verification
- Industry networking opportunities

Our Service Includes:
- Documentation review
- PQQ completion support
- Financial verification preparation
- Health and safety compliance check
- Ongoing support during registration''',
        'price': 449.99,
        'duration': 16,
    },
    {
        'name': 'SafeContractor Certification Support',
        'category': 'Certifications',
        'description': '''Comprehensive support for SafeContractor accreditation.

Benefits of SafeContractor:
- Verified health and safety standards
- Competitive advantage
- Client assurance
- Risk reduction
- Access to larger contracts

Our Service Includes:
- Health and safety audit
- Document preparation
- Policy review and development
- Application support
- Annual renewal assistance''',
        'price': 399.99,
        'duration': 12,
    },
    {
        'name': 'SMAS (Safety Management Advisory Services) Certification Support',
        'category': 'Certifications',
        'description': '''Full support package for SMAS accreditation.

Benefits of SMAS:
- SSIP accreditation recognition
- Industry-wide trust
- Simplified tendering
- Continuous improvement focus
- Market credibility

Our Service Includes:
- Initial assessment
- Documentation development
- Safety management system review
- Application preparation
- Post-accreditation support''',
        'price': 429.99,
        'duration': 14,
    },
]


def connect_to_odoo():
    """Establish connection to Odoo server"""
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')

    # Authenticate
    uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_PASSWORD, {})
    if not uid:
        raise Exception("Authentication failed")

    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
    return uid, models


def create_course_categories(uid, models):
    """Create course categories"""
    categories = {}
    category_data = [
        {'name': 'Health & Safety', 'sequence': 1},
        {'name': 'Professional Development', 'sequence': 2},
        {'name': 'Business & Management', 'sequence': 3},
        {'name': 'Construction & Trade Skills', 'sequence': 4},
        {'name': 'Certifications', 'sequence': 5},
    ]

    for cat in category_data:
        # Check if exists
        existing = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'slide.channel.tag', 'search',
            [[('name', '=', cat['name'])]]
        )

        if existing:
            categories[cat['name']] = existing[0]
            print(f"  - Category exists: {cat['name']}")
        else:
            cat_id = models.execute_kw(
                ODOO_DB, uid, ODOO_PASSWORD,
                'slide.channel.tag', 'create',
                [cat]
            )
            categories[cat['name']] = cat_id
            print(f"  + Created category: {cat['name']}")

    return categories


def create_courses(uid, models, categories):
    """Create courses from the NVQ courses list"""
    courses_created = 0
    courses_existing = 0

    all_courses = NVQ_COURSES + CERTIFICATION_SERVICES

    for course in all_courses:
        # Check if course already exists
        existing = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'slide.channel', 'search',
            [[('name', '=', course['name'])]]
        )

        if existing:
            courses_existing += 1
            print(f"  - Exists: {course['name'][:50]}...")
            continue

        # Get category ID
        cat_name = course.get('category', 'Health & Safety')
        tag_ids = [categories.get(cat_name, categories.get('Health & Safety'))]

        # Create course data
        course_data = {
            'name': course['name'],
            'description': course.get('description', ''),
            'website_published': True,
            'is_published': True,
            'enroll': 'payment',  # Paid enrollment
            'channel_type': 'training',
            'visibility': 'public',
            'tag_ids': [(6, 0, tag_ids)],  # Set tags
        }

        try:
            course_id = models.execute_kw(
                ODOO_DB, uid, ODOO_PASSWORD,
                'slide.channel', 'create',
                [course_data]
            )
            courses_created += 1
            print(f"  + Created: {course['name'][:50]}...")

            # Create a sample intro slide
            slide_data = {
                'name': 'Course Overview',
                'channel_id': course_id,
                'slide_category': 'article',
                'is_published': True,
                'is_preview': True,
                'html_content': f'''
<div class="course-overview">
    <h2>Welcome to {course['name']}</h2>
    <div class="course-details">
        <p><strong>Level:</strong> {course.get('level', 'Professional')}</p>
        <p><strong>Duration:</strong> {course.get('duration', 8)} hours</p>
        <p><strong>Price:</strong> £{course.get('price', 99.99)}</p>
    </div>
    <div class="course-description">
        {course.get('description', '').replace(chr(10), '<br>')}
    </div>
</div>
''',
            }

            models.execute_kw(
                ODOO_DB, uid, ODOO_PASSWORD,
                'slide.slide', 'create',
                [slide_data]
            )

        except Exception as e:
            print(f"  ! Error creating {course['name'][:30]}: {e}")

    return courses_created, courses_existing


def main():
    print("=" * 70)
    print("SEITECH NVQ & Certification Course Population")
    print("=" * 70)

    print(f"\nConnecting to Odoo at {ODOO_URL}...")
    try:
        uid, models = connect_to_odoo()
        print(f"Connected as user ID: {uid}")
    except Exception as e:
        print(f"Connection failed: {e}")
        sys.exit(1)

    print("\n1. Creating Course Categories...")
    categories = create_course_categories(uid, models)

    print(f"\n2. Creating Courses ({len(NVQ_COURSES)} NVQ + {len(CERTIFICATION_SERVICES)} Certification)...")
    created, existing = create_courses(uid, models, categories)

    print("\n" + "=" * 70)
    print("POPULATION COMPLETE")
    print("=" * 70)
    print(f"Categories: {len(categories)}")
    print(f"Courses created: {created}")
    print(f"Courses already existed: {existing}")
    print(f"Total courses: {created + existing}")


if __name__ == '__main__':
    main()
