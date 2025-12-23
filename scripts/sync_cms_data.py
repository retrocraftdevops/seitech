#!/usr/bin/env python3
"""
Sync CMS data from XML files to Odoo database.
This script forces updates to records even when noupdate="1" is set.
"""
import sys
sys.path.insert(0, '/opt/odoo/odoo')

import odoo
from odoo import api, SUPERUSER_ID


def sync_cms_data():
    """Force sync CMS data to match frontend exactly."""
    odoo.tools.config.parse_config(['--config=/opt/odoo/config/odoo.conf'])
    db_name = 'seitech'
    registry = odoo.modules.registry.Registry.new(db_name)

    with registry.cursor() as cr:
        env = api.Environment(cr, SUPERUSER_ID, {})

        # ============ Update Sections ============
        Section = env['seitech.cms.section']

        sections_updates = {
            'section_home_hero': {
                'title': 'See the Risks. Secure the Workplace.',
                'subtitle': 'IOSH, Qualsafe & NEBOSH Accredited',
                'description': "Professional health, safety, and environmental training and consultancy services. Empowering professionals with cutting-edge knowledge and compliance solutions.",
                'cta_text': 'Explore Training',
                'cta_url': '/courses',
                'secondary_cta_text': 'View Consultancy',
                'secondary_cta_url': '/services',
            },
            'section_home_services': {
                'title': 'Two Pillars of Excellence',
                'subtitle': 'Our Services',
                'description': "Whether you need to upskill your team or ensure workplace compliance, SEI Tech delivers world-class training and consultancy solutions.",
                'cta_text': 'Explore Courses',
                'secondary_cta_text': 'View All Services',
            },
            'section_home_training': {
                'title': 'Choose Your Learning Style',
                'subtitle': 'Flexible Learning',
                'description': "We offer multiple training delivery methods to suit your schedule, budget, and learning preferences.",
            },
            'section_home_stats': {
                'title': 'Proven Track Record of Excellence',
                'description': "Our numbers speak for themselves - delivering quality training and consultancy services across the UK",
            },
            'section_home_accreditations': {
                'title': 'Accredited by Leading Bodies',
                'subtitle': 'Industry Recognition',
                'description': "Our courses are recognised and accredited by the UK's leading health, safety, and training organisations.",
            },
            'section_home_testimonials': {
                'title': 'What Our Clients Say',
                'description': "Trusted by leading organizations across the UK for professional training and consultancy services.",
            },
            'section_home_cta': {
                'title': 'Ready to Elevate Your Safety Standards?',
                'description': "Whether you need training for your team or expert consultancy support, we're here to help. Book a free consultation to discuss your requirements.",
                'cta_text': 'Book Free Consultation',
                'secondary_cta_text': '+44 1233 438817',
            },
        }

        for xml_id, values in sections_updates.items():
            try:
                ext_id = env.ref(f'seitech_cms.{xml_id}', raise_if_not_found=False)
                if ext_id:
                    ext_id.write(values)
                    print(f"Updated section: {xml_id}")
                else:
                    print(f"Section not found: {xml_id}")
            except Exception as e:
                print(f"Error updating {xml_id}: {e}")

        # ============ Update Testimonials ============
        Testimonial = env['seitech.cms.testimonial']

        testimonials_updates = {
            'testimonial_sarah_johnson': {
                'content': "SEI Tech provided exceptional NEBOSH training for our team. The instructors were knowledgeable, engaging, and the material was highly relevant to our industry. Our safety culture has improved significantly.",
            },
            'testimonial_michael_chen': {
                'content': "The consultancy services from SEI Tech transformed our approach to workplace safety. Their team conducted thorough audits and provided actionable recommendations that exceeded our expectations.",
            },
            'testimonial_emma_williams': {
                'content': "Outstanding training delivery! The e-learning platform is user-friendly and the course content is comprehensive. We've trained over 200 staff members with a 100% pass rate.",
            },
        }

        for xml_id, values in testimonials_updates.items():
            try:
                ext_id = env.ref(f'seitech_cms.{xml_id}', raise_if_not_found=False)
                if ext_id:
                    ext_id.write(values)
                    print(f"Updated testimonial: {xml_id}")
                else:
                    print(f"Testimonial not found: {xml_id}")
            except Exception as e:
                print(f"Error updating {xml_id}: {e}")

        # ============ Update Team Members ============
        Team = env['seitech.cms.team.member']

        team_updates = {
            'team_member_james': {
                'short_bio': "Over 20 years of experience in health and safety management. Former HSE inspector with expertise in risk management and compliance.",
                'qualifications': "NEBOSH Diploma, IOSH, Chartered MIIRSM",
            },
            'team_member_sarah': {
                'short_bio': "Passionate about education with 15+ years delivering professional training. Specializes in NEBOSH and IOSH qualifications.",
                'qualifications': "NEBOSH Certificate, PGCE, IOSH Managing Safely",
            },
            'team_member_michael': {
                'short_bio': "Construction and manufacturing specialist with deep knowledge of industry-specific regulations and best practices.",
                'qualifications': "NEBOSH Construction, IOSH, CDM Regulations",
            },
        }

        for xml_id, values in team_updates.items():
            try:
                ext_id = env.ref(f'seitech_cms.{xml_id}', raise_if_not_found=False)
                if ext_id:
                    ext_id.write(values)
                    print(f"Updated team member: {xml_id}")
                else:
                    print(f"Team member not found: {xml_id}")
            except Exception as e:
                print(f"Error updating {xml_id}: {e}")

        # ============ Update FAQs ============
        FAQ = env['seitech.cms.faq']

        faq_updates = {
            'faq_accreditations': {
                'answer': "SEI Tech International is accredited by leading health and safety organizations including IOSH (Institution of Occupational Safety and Health), NEBOSH (National Examination Board in Occupational Safety and Health), and Qualsafe Awards. All our courses are recognized and meet industry standards.",
                'short_answer': "IOSH, NEBOSH, and Qualsafe accredited.",
            },
            'faq_training_methods': {
                'answer': "Yes, we offer flexible training delivery options to suit your needs. Choose from e-learning courses for self-paced online study, virtual classroom sessions with live instructors, or traditional in-person training at our centers or your workplace.",
                'short_answer': "Yes, e-learning, virtual, and in-person options.",
            },
            'faq_certificate_time': {
                'answer': "Upon successful completion of your course and passing any required assessments, you will receive your digital certificate within 5-7 working days. Physical certificates are also available and typically arrive within 2-3 weeks.",
                'short_answer': "Digital certificates within 5-7 working days.",
            },
            'faq_workplace_training': {
                'answer': "Absolutely! We offer on-site training delivery across the UK. This is ideal for organizations training multiple employees and allows us to tailor the content to your specific workplace and industry requirements. Contact us for a customized quote.",
                'short_answer': "Yes, on-site training available UK-wide.",
            },
            'faq_group_discounts': {
                'answer': "Yes, we offer competitive group booking discounts for organizations training multiple employees. Discounts typically start at 10% for 5+ delegates and increase with larger groups. Contact our team for a tailored quote based on your requirements.",
                'short_answer': "Yes, discounts from 10% for 5+ delegates.",
            },
        }

        for xml_id, values in faq_updates.items():
            try:
                ext_id = env.ref(f'seitech_cms.{xml_id}', raise_if_not_found=False)
                if ext_id:
                    ext_id.write(values)
                    print(f"Updated FAQ: {xml_id}")
                else:
                    print(f"FAQ not found: {xml_id}")
            except Exception as e:
                print(f"Error updating {xml_id}: {e}")

        # ============ Update Statistics ============
        Stat = env['seitech.cms.statistic']

        stat_updates = {
            'stat_professionals_trained': {
                'description': "Across various industries and sectors",
            },
            'stat_years_experience': {
                'description': "In health, safety, and environmental training",
            },
            'stat_accreditations': {
                'description': "Including IOSH, NEBOSH, and Qualsafe",
            },
        }

        for xml_id, values in stat_updates.items():
            try:
                ext_id = env.ref(f'seitech_cms.{xml_id}', raise_if_not_found=False)
                if ext_id:
                    ext_id.write(values)
                    print(f"Updated statistic: {xml_id}")
                else:
                    print(f"Statistic not found: {xml_id}")
            except Exception as e:
                print(f"Error updating {xml_id}: {e}")

        # ============ Update Partners/Accreditations ============
        Partner = env['seitech.cms.partner']

        partner_updates = {
            'partner_iosh': {
                'description': "Approved training provider for IOSH Managing Safely and Working Safely courses.",
            },
            'partner_qualsafe': {
                'name': 'Qualsafe',
                'description': "Approved centre for first aid, health & safety and social care qualifications.",
            },
            'partner_nebosh': {
                'description': "Delivering NEBOSH General and Construction certificates.",
            },
            'partner_proqual': {
                'description': "NVQ qualifications in occupational health and safety.",
            },
        }

        for xml_id, values in partner_updates.items():
            try:
                ext_id = env.ref(f'seitech_cms.{xml_id}', raise_if_not_found=False)
                if ext_id:
                    ext_id.write(values)
                    print(f"Updated partner: {xml_id}")
                else:
                    print(f"Partner not found: {xml_id}")
            except Exception as e:
                print(f"Error updating {xml_id}: {e}")

        cr.commit()
        print("\n✓ CMS data sync completed successfully!")


if __name__ == '__main__':
    sync_cms_data()
