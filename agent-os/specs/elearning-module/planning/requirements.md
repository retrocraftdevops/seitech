# Requirements - E-Learning Module

## Feature Description

Comprehensive LMS module extending Odoo's website_slides with advanced features including enrollments, certificates, quizzes, assignments, payments, and gamification.

## Core Requirements

### Enrollment System
- Create `seitech.enrollment` model linking users to courses
- Track enrollment state (pending, active, completed, expired, cancelled)
- Calculate progress based on lesson completion
- Support enrollment types (free, paid, gift, bulk)
- Automatic expiration handling
- Certificate generation on completion

### Certificate System
- Create `seitech.certificate` model for course certificates
- Auto-generate unique certificate numbers
- QR code generation for verification
- PDF report for certificate download
- Public verification page (/certificate/verify/{number})
- Template system for different certificate designs
- Optional expiration dates

### Assessment/Quiz System
- Extend `survey.survey` for course quizzes
- Add course_id and lesson_id linking
- Implement passing score requirements
- Support multiple question types
- Random question selection from pool
- Time limits with auto-submit
- Multiple attempt tracking
- Show/hide correct answers option

### Assignment System
- Create `seitech.assignment` model
- Create `seitech.assignment.submission` model
- File upload support (PDF, DOC, images)
- Due dates with late penalty
- Instructor grading workflow
- Resubmission capability
- Feedback system

### Payment Integration
- Create `seitech.payment` model
- Integrate with Odoo payment providers
- Paystack custom integration
- Coupon/discount code system
- Payment state tracking
- Refund handling
- Invoice generation

### Scheduling System
- Create `seitech.schedule` for live classes
- Calendar widget integration
- Meeting URL management
- Reminder email automation
- Attendance tracking
- Recording URL storage

### Gamification
- Create `seitech.gamification.points` for points tracking
- Create `seitech.gamification.badge` for achievements
- Leaderboard computation
- Points for various actions
- Badge unlock criteria
- Profile display

## Technical Requirements

### Security
- Proper access rights for all new models
- Record rules for user data isolation
- Instructor access to their course data only
- Admin full access
- Portal user limited access

### Performance
- Indexed fields for frequent queries
- Computed fields with store=True where appropriate
- Batch operations for bulk enrollment
- Lazy loading for dashboard data

### API Endpoints
```python
# Course enrollment
POST /api/course/enroll
POST /api/course/unenroll

# Progress tracking
POST /api/course/progress
GET /api/course/progress/{course_id}

# Quiz submission
POST /api/quiz/submit
GET /api/quiz/results/{quiz_id}

# Certificate
GET /api/certificate/{id}
GET /certificate/verify/{number}  # Public page

# Payment
POST /api/payment/initiate
POST /api/payment/webhook/{provider}
```

## Integration Points

### Input
- website_slides for course/lesson data
- res.users for user data
- survey for quiz functionality
- payment for payment providers

### Output
- Enrollment records
- Certificates
- Quiz results
- Payment records
- Progress tracking data

### External Services
- Payment gateways (Stripe, PayPal, Paystack)
- Email service (Odoo mail)
- File storage (Odoo attachments)

## Data Model Summary

```
slide.channel (course) ──────┐
       │                     │
       ├── slide.slide (lesson)
       │         │
       │         ├── seitech.assignment
       │         │         │
       │         │         └── seitech.assignment.submission
       │         │
       │         └── survey.survey (quiz)
       │
       ├── seitech.enrollment
       │         │
       │         ├── seitech.payment
       │         │
       │         └── seitech.certificate
       │
       └── seitech.schedule (live class)
```

## Success Criteria

1. All 12 feature categories implemented
2. Full CRUD operations working
3. Security tests passing
4. API endpoints tested
5. UI views complete
6. Migration from PHP verified
7. Performance benchmarks met

## Reference

- PHP Database Schema: `/well-known/uploads/install.sql`
- Odoo Standards: `agent-os/standards/odoo/`
- Testing Standards: `agent-os/standards/testing/odoo-testing.md`
