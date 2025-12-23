# E-Learning Module Specification

**Module**: `seitech_elearning`
**Version**: 19.0.1.0.0
**Status**: Planned

## Overview

Comprehensive e-learning/LMS module extending Odoo's `website_slides` with advanced features including enhanced certificates, quizzes, assignments, payments, and gamification.

## Objectives

1. Migrate all features from the PHP e-learning application
2. Extend Odoo's native e-learning capabilities
3. Implement enterprise-grade LMS features
4. Maintain full feature parity with the legacy system

## Dependencies

- `website_slides` - Core e-learning
- `survey` - Assessment/quiz system
- `website_sale` - E-commerce integration
- `payment` - Payment processing
- `seitech_website_theme` - Design theme
- `seitech_base` - Base customizations

## Feature Categories

### 1. Course Management (extends slide.channel)

**New Fields:**
- `pricing_type` - Selection: free, one_time, subscription
- `price` - Monetary field
- `currency_id` - Currency reference
- `prerequisite_ids` - Many2many to other courses
- `max_enrollments` - Integer (capacity limit)
- `enrollment_deadline` - Datetime
- `is_featured` - Boolean
- `difficulty_level` - Selection: beginner, intermediate, advanced

**New Methods:**
- `check_prerequisites(user_id)` - Verify prerequisites met
- `get_pricing(user_id)` - Calculate price with discounts
- `action_publish()` - Publish with validations

### 2. Lesson Management (extends slide.slide)

**New Fields:**
- `lesson_type` - Selection: video, text, quiz, assignment, live
- `attachments` - Many2many to ir.attachment
- `min_watch_percentage` - Integer (completion threshold)
- `captions` - Text field for subtitles
- `prerequisites` - Many2many to other lessons

**New Methods:**
- `mark_complete(user_id)` - Mark lesson complete
- `get_next_lesson()` - Return next lesson in sequence

### 3. Enrollment System (new model: seitech.enrollment)

**Fields:**
```python
class SeitectEnrollment(models.Model):
    _name = 'seitech.enrollment'
    _description = 'Course Enrollment'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    user_id = fields.Many2one('res.users', required=True)
    course_id = fields.Many2one('slide.channel', required=True)
    enrollment_date = fields.Datetime(default=fields.Datetime.now)
    expiration_date = fields.Datetime()
    state = fields.Selection([
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ], default='pending', tracking=True)
    progress = fields.Float(compute='_compute_progress', store=True)
    completion_date = fields.Datetime()
    certificate_id = fields.Many2one('seitech.certificate')
    payment_id = fields.Many2one('seitech.payment')
    enrollment_type = fields.Selection([
        ('free', 'Free'),
        ('paid', 'Paid'),
        ('gift', 'Gift'),
        ('bulk', 'Bulk'),
    ])
```

**Methods:**
- `action_activate()` - Activate enrollment
- `action_complete()` - Complete and generate certificate
- `update_progress()` - Recalculate progress
- `check_expiration()` - Handle expired enrollments

### 4. Assessment System (extends survey.survey)

**New Fields:**
- `course_id` - Link to course
- `lesson_id` - Link to specific lesson
- `quiz_type` - Selection: practice, graded, exam
- `passing_score` - Float percentage
- `max_attempts` - Integer
- `time_limit` - Integer (minutes)
- `randomize_questions` - Boolean
- `show_correct_answers` - Boolean

**Question Types:**
- Multiple choice (single answer)
- Multiple choice (multiple answers)
- True/False
- Fill in the blank
- Short answer (manual grading)
- Essay (manual grading)

### 5. Assignment System (new model: seitech.assignment)

**Fields:**
```python
class SeitectAssignment(models.Model):
    _name = 'seitech.assignment'
    _description = 'Course Assignment'

    name = fields.Char(required=True)
    course_id = fields.Many2one('slide.channel')
    lesson_id = fields.Many2one('slide.slide')
    description = fields.Html()
    instructions = fields.Html()
    due_date = fields.Datetime()
    max_score = fields.Float(default=100)
    allow_late_submission = fields.Boolean()
    late_penalty = fields.Float()  # Percentage
    allowed_file_types = fields.Char()
    max_file_size = fields.Integer()  # MB
    resubmission_allowed = fields.Boolean()
```

**Submission Model:**
```python
class SeitectSubmission(models.Model):
    _name = 'seitech.assignment.submission'

    assignment_id = fields.Many2one('seitech.assignment')
    user_id = fields.Many2one('res.users')
    submission_date = fields.Datetime()
    file_ids = fields.Many2many('ir.attachment')
    text_content = fields.Html()
    score = fields.Float()
    feedback = fields.Html()
    state = fields.Selection([
        ('submitted', 'Submitted'),
        ('grading', 'Grading'),
        ('graded', 'Graded'),
        ('resubmit', 'Resubmit Required'),
    ])
```

### 6. Certificate System (new model: seitech.certificate)

**Fields:**
```python
class SeitectCertificate(models.Model):
    _name = 'seitech.certificate'
    _description = 'Course Certificate'

    name = fields.Char(compute='_compute_name')
    user_id = fields.Many2one('res.users')
    course_id = fields.Many2one('slide.channel')
    enrollment_id = fields.Many2one('seitech.enrollment')
    issue_date = fields.Date(default=fields.Date.today)
    expiration_date = fields.Date()
    certificate_number = fields.Char(readonly=True)
    qr_code = fields.Binary(compute='_compute_qr_code')
    verification_url = fields.Char(compute='_compute_verification_url')
    pdf_file = fields.Binary()
    template_id = fields.Many2one('seitech.certificate.template')
```

**Features:**
- Auto-generation on course completion
- PDF generation with custom templates
- QR code for verification
- Public verification page
- Optional expiration
- Bulk certificate generation wizard

### 7. Instructor Management (extends res.partner)

**New Fields on res.partner:**
- `is_instructor` - Boolean
- `instructor_bio` - Html
- `instructor_title` - Char
- `specializations` - Many2many to tags
- `course_ids` - One2many to courses
- `rating` - Float (computed average)
- `total_students` - Integer (computed)

**Instructor Dashboard:**
- Course analytics
- Student progress
- Revenue tracking
- Assignment grading queue
- Message inbox

### 8. Scheduling System (new model: seitech.schedule)

**Fields:**
```python
class SeitectSchedule(models.Model):
    _name = 'seitech.schedule'
    _description = 'Live Class Schedule'

    name = fields.Char(required=True)
    course_id = fields.Many2one('slide.channel')
    instructor_id = fields.Many2one('res.partner')
    start_datetime = fields.Datetime(required=True)
    end_datetime = fields.Datetime(required=True)
    timezone = fields.Selection(...)
    meeting_url = fields.Char()
    meeting_type = fields.Selection([
        ('zoom', 'Zoom'),
        ('meet', 'Google Meet'),
        ('teams', 'MS Teams'),
        ('bbb', 'BigBlueButton'),
        ('custom', 'Custom'),
    ])
    max_attendees = fields.Integer()
    attendee_ids = fields.Many2many('res.users')
    reminder_sent = fields.Boolean()
    recording_url = fields.Char()
```

**Features:**
- Calendar integration
- Booking system
- Reminder notifications (email, push)
- Attendance tracking
- Recording storage

### 9. Payment Integration

**Supported Gateways:**
- Stripe (Odoo native)
- PayPal (Odoo native)
- Paystack (custom integration)

**Payment Model:**
```python
class SeitectPayment(models.Model):
    _name = 'seitech.payment'
    _description = 'Course Payment'

    enrollment_id = fields.Many2one('seitech.enrollment')
    user_id = fields.Many2one('res.users')
    amount = fields.Monetary()
    currency_id = fields.Many2one('res.currency')
    payment_method = fields.Selection(...)
    transaction_id = fields.Char()
    state = fields.Selection([
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ])
    coupon_id = fields.Many2one('seitech.coupon')
    discount_amount = fields.Monetary()
```

**Coupon System:**
- Percentage or fixed discount
- Usage limits
- Expiration dates
- Course-specific coupons

### 10. Gamification

**Points System:**
- Points for course completion
- Points for quiz scores
- Points for assignments
- Daily login points

**Badge System:**
- Course completion badges
- Streak badges
- Achievement badges
- Leaderboard display

**Leaderboard:**
- Weekly/monthly/all-time
- Course-specific or global
- Friend comparisons

### 11. User Features

**Student Dashboard:**
- My courses (in progress, completed)
- Progress overview
- Upcoming live classes
- Notifications
- Certificates
- Achievements/badges

**Additional Features:**
- Wishlist
- Course notes
- Bookmarks
- Discussion forums
- Course reviews and ratings

### 12. Admin Features

**Analytics Dashboards:**
- Course analytics (enrollments, completions, revenue)
- Student analytics (active, retention, progress)
- Revenue reports
- Instructor performance

**Management Tools:**
- Bulk enrollment
- Email templates
- Notification management
- Report generation

## File Structure

```
seitech_elearning/
├── __manifest__.py
├── __init__.py
├── models/
│   ├── __init__.py
│   ├── slide_channel.py      # Course extensions
│   ├── slide_slide.py        # Lesson extensions
│   ├── enrollment.py         # Enrollment system
│   ├── certificate.py        # Certificate system
│   ├── quiz.py               # Assessment extensions
│   ├── assignment.py         # Assignment system
│   ├── schedule.py           # Scheduling
│   ├── payment.py            # Payment system
│   ├── instructor.py         # Instructor features
│   ├── gamification.py       # Points/badges
│   └── coupon.py             # Discount coupons
├── views/
│   ├── course_views.xml
│   ├── enrollment_views.xml
│   ├── certificate_views.xml
│   ├── quiz_views.xml
│   ├── assignment_views.xml
│   ├── schedule_views.xml
│   ├── payment_views.xml
│   ├── dashboard_views.xml
│   ├── website_templates.xml
│   └── menus.xml
├── controllers/
│   ├── __init__.py
│   ├── main.py
│   ├── course.py
│   ├── enrollment.py
│   ├── certificate.py
│   ├── quiz.py
│   └── payment.py
├── security/
│   ├── groups.xml
│   ├── ir.model.access.csv
│   └── record_rules.xml
├── data/
│   ├── email_templates.xml
│   ├── certificate_templates.xml
│   ├── category_data.xml
│   └── cron.xml
├── reports/
│   ├── certificate_report.xml
│   └── enrollment_report.xml
├── wizards/
│   ├── __init__.py
│   ├── bulk_enrollment.py
│   └── certificate_generation.py
├── static/
│   └── src/
│       ├── scss/
│       │   └── elearning.scss
│       ├── js/
│       │   ├── course_player.js
│       │   ├── quiz_interaction.js
│       │   ├── progress_tracker.js
│       │   └── video_player.js
│       └── xml/
│           └── templates.xml
└── tests/
    ├── __init__.py
    ├── test_enrollment.py
    ├── test_certificate.py
    ├── test_payment.py
    └── test_controllers.py
```

## Testing Strategy

- Unit tests for all models (90% coverage)
- Integration tests for controllers
- UI tests for critical user flows
- Security tests for access rights
- Performance tests for queries

## Migration Plan

1. Map PHP tables to Odoo models
2. Create migration scripts
3. Run in sequence: users → courses → enrollments → content → payments
4. Validate data integrity
5. Generate migration report

## Success Criteria

1. All PHP features implemented
2. Security tests pass
3. Performance benchmarks met
4. User acceptance testing complete
5. Documentation complete
