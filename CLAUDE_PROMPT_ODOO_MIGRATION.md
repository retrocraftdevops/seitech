# Claude Prompt: Odoo Migration & Module Development for Seitech International

## Context
Seitech International operates an e-learning platform built with PHP (CodeIgniter framework). The application is located at `/home/rodrickmakore/projects/seitech/oldsite/seitech/well-known/` and includes features for course management, user enrollment, certificates, payments, schedules, and more. We need to migrate this to Odoo and create two comprehensive modules with a modern, professional design theme.

## Your Mission

Create a complete **agent-os** structure following enterprise development standards, then develop **two Odoo modules**:

1. **Website Theme Module** - Custom Odoo website theme with modern design
2. **E-Learning Module** - Comprehensive e-learning/LMS extension with advanced features

Both modules must apply the design theme described below and follow Odoo best practices.

---

## Phase 1: Agent-OS Structure Setup

### 1.1 Create Agent-OS Directory Structure
```
seitech/
├── agent-os/
│   ├── README.md
│   ├── config.yml
│   ├── standards/
│   │   ├── WORLD_CLASS_DEVELOPMENT_STANDARDS.md
│   │   ├── odoo/
│   │   │   ├── module-structure.md
│   │   │   ├── xml-templates.md
│   │   │   ├── python-standards.md
│   │   │   └── security-standards.md
│   │   ├── frontend/
│   │   │   ├── qweb-templates.md
│   │   │   ├── javascript-standards.md
│   │   │   └── css-styling.md
│   │   └── testing/
│   │       └── odoo-testing.md
│   ├── specs/
│   │   ├── website-theme-module/
│   │   │   ├── spec.md
│   │   │   ├── planning/
│   │   │   │   └── requirements.md
│   │   │   ├── implementation/
│   │   │   └── verification/
│   │   └── elearning-module/
│   │       ├── spec.md
│   │       ├── planning/
│   │       │   └── requirements.md
│   │       ├── implementation/
│   │       └── verification/
│   └── templates/
│       └── odoo-module-template.md
```

### 1.2 Create Standards Documentation
- **WORLD_CLASS_DEVELOPMENT_STANDARDS.md**: Adapt from Ensemble project standards, focusing on Odoo-specific requirements
- **Module Structure Standards**: Odoo module organization, manifest files, security rules
- **Python Standards**: PEP 8, Odoo ORM patterns, transaction handling
- **QWeb Template Standards**: Template structure, inheritance, performance
- **Security Standards**: Access rights, record rules, data protection

### 1.3 Create Specification Templates
- Use the Ensemble agent-os spec format
- Include: requirements, technical design, database schema, UI/UX design, testing strategy, implementation plan

---

## Phase 2: Design Theme Application

### 2.1 Design Theme Reference
Apply this modern, professional design theme to both modules:

**Color Palette:**
- Primary: Teal/Cyan (`#0284c7` / `#0e9384`)
- Background: White (`#ffffff`)
- Surface: Light gray (`#f8fafc`)
- Text: Dark gray (`#0b1220` / `gray-900`)
- Borders: Subtle gray (`#e4e7ec`)

**Typography:**
- System font stack (sans-serif)
- Hero headlines: 36-60px, bold
- Section headlines: 30-36px, bold
- Body: 16-18px, regular
- Clear hierarchy with tight tracking

**Visual Elements:**
- Rounded corners: `rounded-2xl` (16px) for cards, `rounded-full` for buttons
- Shadows: Subtle to prominent (`shadow-sm` to `shadow-2xl`)
- Spacing: Generous padding (64-112px sections, 24-32px cards)
- Gradients: Dark hero backgrounds, text gradient accents
- Hover states: Smooth transitions, enhanced shadows

**Component Patterns:**
- Buttons: Pill-shaped, primary color, shadow effects
- Cards: White background, subtle shadow, ring borders
- Badges: Rounded pills with colored backgrounds
- Sections: Alternating white/gray backgrounds
- Navigation: Sticky header, mega menu dropdowns

**Full theme details**: See `/home/rodrickmakore/projects/ensemble/apps/website/DESIGN_THEME_DESCRIPTION.md`

### 2.2 Theme Implementation Requirements
- Create reusable QWeb templates with theme classes
- Custom CSS/SCSS following the design system
- Responsive design (mobile-first, breakpoints: sm, md, lg)
- Accessibility: WCAG AA compliance, ARIA labels, keyboard navigation
- Performance: Optimized assets, lazy loading, efficient rendering

---

## Phase 3: Website Theme Module

### 3.1 Module Structure
```
seitech_website_theme/
├── __manifest__.py
├── __init__.py
├── data/
│   └── theme_data.xml
├── static/
│   ├── description/
│   │   ├── icon.png
│   │   └── theme_preview.png
│   ├── src/
│   │   ├── scss/
│   │   │   ├── bootstrap_overridden.scss
│   │   │   ├── custom_variables.scss
│   │   │   ├── components/
│   │   │   │   ├── _buttons.scss
│   │   │   │   ├── _cards.scss
│   │   │   │   ├── _navigation.scss
│   │   │   │   └── _forms.scss
│   │   │   └── pages/
│   │   │       ├── _homepage.scss
│   │   │       └── _elearning.scss
│   │   └── js/
│   │       ├── theme.js
│   │       └── components/
│   │           ├── mega_menu.js
│   │           └── animations.js
│   └── img/
├── views/
│   ├── layouts.xml
│   ├── pages.xml
│   ├── snippets.xml
│   └── options.xml
└── templates/
    ├── layout/
    │   ├── header.xml
    │   ├── footer.xml
    │   └── main_layout.xml
    ├── pages/
    │   ├── homepage.xml
    │   └── elearning_home.xml
    └── snippets/
        ├── hero_section.xml
        ├── feature_grid.xml
        ├── testimonials.xml
        └── cta_section.xml
```

### 3.2 Required Features
1. **Custom Layouts**
   - Sticky header with mega menu
   - Multi-column footer with newsletter
   - Responsive navigation (mobile hamburger menu)
   - Breadcrumb navigation

2. **Homepage Components**
   - Hero section with gradient background
   - Stats section (4-column grid)
   - Feature grid (3-column cards)
   - Testimonials section
   - CTA sections
   - Client logos section

3. **Design System Implementation**
   - SCSS variables for colors, spacing, typography
   - Reusable component classes
   - Responsive utilities
   - Animation utilities

4. **E-Learning Integration**
   - Custom templates for course listings
   - Course detail pages
   - Learning dashboard
   - Certificate display pages

5. **Customization Options**
   - Theme color picker
   - Logo upload
   - Font selection
   - Layout options

---

## Phase 4: E-Learning Module

### 4.1 Module Structure
```
seitech_elearning/
├── __manifest__.py
├── __init__.py
├── models/
│   ├── __init__.py
│   ├── course.py
│   ├── lesson.py
│   ├── enrollment.py
│   ├── certificate.py
│   ├── quiz.py
│   ├── assignment.py
│   ├── schedule.py
│   ├── instructor.py
│   ├── category.py
│   └── payment.py
├── views/
│   ├── course_views.xml
│   ├── lesson_views.xml
│   ├── enrollment_views.xml
│   ├── certificate_views.xml
│   ├── quiz_views.xml
│   ├── dashboard_views.xml
│   └── website_views.xml
├── controllers/
│   ├── __init__.py
│   ├── main.py
│   ├── course_controller.py
│   ├── enrollment_controller.py
│   └── certificate_controller.py
├── security/
│   ├── ir.model.access.csv
│   └── record_rules.xml
├── data/
│   ├── course_data.xml
│   └── category_data.xml
├── reports/
│   ├── certificate_report.xml
│   └── enrollment_report.xml
├── wizards/
│   ├── __init__.py
│   ├── bulk_enrollment.py
│   └── certificate_generation.py
└── static/
    ├── description/
    │   └── icon.png
    ├── src/
    │   ├── scss/
    │   │   └── elearning.scss
    │   └── js/
    │       ├── course_player.js
    │       ├── quiz_interaction.js
    │       └── progress_tracker.js
    └── img/
```

### 4.2 Core Features (From PHP Application Analysis)

**Course Management:**
- Course creation with categories/subcategories
- Course thumbnails and banners
- Course pricing (free, paid, subscription)
- Course prerequisites and dependencies
- Course sections and lessons
- Course visibility (public, private, draft)
- Course ratings and reviews
- Course tags and search

**Lesson Management:**
- Multiple lesson types (video, text, quiz, assignment, live)
- Video lessons with progress tracking
- Video player with controls (play, pause, seek, speed)
- Video captions/subtitles support
- Lesson attachments and resources
- Lesson duration tracking
- Lesson completion requirements
- Lesson prerequisites

**Enrollment System:**
- Student enrollment (free, paid, gift)
- Enrollment status tracking
- Enrollment expiration dates
- Bulk enrollment
- Waitlist management
- Enrollment notifications

**Progress Tracking:**
- Course completion percentage
- Lesson completion tracking
- Time spent per course/lesson
- Last accessed lesson
- Progress reports
- Learning analytics dashboard

**Assessment & Quizzes:**
- Quiz creation with multiple question types
  - Multiple choice
  - True/False
  - Fill in the blank
  - Short answer
  - Essay questions
- Question bank management
- Random question selection
- Time limits for quizzes
- Passing score configuration
- Quiz attempts tracking
- Automatic grading
- Manual grading for essays
- Quiz results and feedback

**Assignments:**
- Assignment creation and submission
- File upload support
- Assignment deadlines
- Instructor grading
- Assignment feedback
- Assignment resubmission

**Certificates:**
- Certificate template design
- Automatic certificate generation
- Certificate PDF generation
- QR code on certificates
- Certificate verification
- Certificate download
- Certificate expiration (optional)

**Instructor Management:**
- Instructor profiles
- Instructor course assignment
- Instructor permissions
- Instructor dashboard
- Instructor earnings (if applicable)

**Scheduling System:**
- Live class scheduling
- Calendar integration
- Booking system
- Reminder notifications
- Attendance tracking

**Payment Integration:**
- Multiple payment gateways (Stripe, PayPal, Razorpay, Paystack, etc.)
- Course pricing
- Discount codes and coupons
- Gift course purchases
- Subscription management
- Payment history
- Invoice generation

**User Features:**
- Student dashboard
- My courses page
- Wishlist functionality
- Course comparison
- Learning path creation
- Notes and bookmarks
- Discussion forums
- Course reviews and ratings

**Admin Features:**
- Course analytics
- Student analytics
- Revenue reports
- Enrollment reports
- Certificate reports
- System settings
- Email templates
- Notification management

### 4.3 Advanced E-Learning Features (Enterprise-Grade)

**Gamification:**
- Points and badges system
- Leaderboards
- Achievements
- Progress milestones
- Rewards system

**Social Learning:**
- Discussion forums per course
- Peer-to-peer messaging
- Study groups
- Social sharing
- Course recommendations

**Adaptive Learning:**
- Learning path recommendations
- Personalized content
- Difficulty adjustment
- Remedial content suggestions

**Mobile Learning:**
- Responsive design
- Offline course access
- Mobile app integration (future)
- Push notifications

**Compliance & Reporting:**
- SCORM compliance (optional)
- xAPI/Tin Can API support
- Learning records store
- Compliance reporting
- Audit trails

**Multi-language Support:**
- Course translation
- Interface translation
- Multi-language content
- Language-specific certificates

**Integration Features:**
- Single Sign-On (SSO)
- LDAP/Active Directory
- API for third-party integrations
- Webhook support
- Calendar sync (Google, Outlook)

### 4.4 Well-Known Features Implementation

Based on the PHP application structure, ensure these are fully implemented:

1. **Course Categories**: Hierarchical categories with thumbnails, icons, slugs
2. **Course Forums**: Discussion forums integrated with courses
3. **Blog Integration**: Course-related blog posts
4. **Resource Files**: Downloadable resources per course/lesson
5. **Video Processing**: Video upload, encoding, streaming
6. **Email Notifications**: Automated emails for enrollments, completions, etc.
7. **User Roles**: Student, Instructor, Admin with proper permissions
8. **Multi-tenant Support**: If applicable for Seitech's business model
9. **API Endpoints**: RESTful API for mobile apps and integrations
10. **Analytics Dashboard**: Comprehensive learning analytics

---

## Phase 5: Implementation Requirements

### 5.1 Database Design
- Design comprehensive database schema
- Use Odoo ORM best practices
- Implement proper relationships (many2one, one2many, many2many)
- Add proper indexes for performance
- Include audit fields (create_date, write_date, create_uid, write_uid)

### 5.2 Security
- Implement proper access rights (ir.model.access.csv)
- Create record rules for data security
- Implement row-level security
- Secure file uploads
- Protect sensitive data (payments, personal info)
- Implement CSRF protection
- Follow OWASP guidelines

### 5.3 Performance
- Optimize database queries (avoid N+1 queries)
- Implement caching where appropriate
- Lazy loading for heavy content
- Optimize media assets
- Database indexing strategy
- Query optimization

### 5.4 Testing
- Unit tests for models
- Integration tests for controllers
- UI tests for website templates
- Performance tests
- Security tests

### 5.5 Documentation
- Module documentation (README.md)
- API documentation
- User guides
- Developer documentation
- Installation instructions
- Migration guide from PHP

---

## Phase 6: Migration Strategy

### 6.1 Data Migration
- Analyze PHP database structure
- Map PHP tables to Odoo models
- Create migration scripts
- Data validation and cleanup
- Test migration on staging

### 6.2 Feature Parity
- Ensure all existing features are implemented
- Document any feature gaps
- Plan for feature enhancements
- User acceptance testing

### 6.3 URL Redirection
- Map old PHP URLs to new Odoo URLs
- Implement 301 redirects
- Preserve SEO rankings
- Update sitemap

---

## Deliverables Checklist

### Agent-OS Structure
- [ ] Complete agent-os directory structure
- [ ] Standards documentation
- [ ] Specification templates
- [ ] Development guidelines

### Website Theme Module
- [ ] Complete module structure
- [ ] Custom layouts and templates
- [ ] Design system implementation (SCSS)
- [ ] Responsive components
- [ ] Customization options
- [ ] Documentation

### E-Learning Module
- [ ] Complete module structure
- [ ] All core features implemented
- [ ] Advanced features implemented
- [ ] Security implementation
- [ ] Performance optimization
- [ ] Testing suite
- [ ] Documentation

### Migration
- [ ] Data migration scripts
- [ ] Feature parity verification
- [ ] URL redirection plan
- [ ] Migration documentation

---

## Quality Standards

Follow these principles throughout:

1. **Completeness**: All features fully implemented, no placeholders
2. **Code Quality**: PEP 8, Odoo best practices, clean code
3. **Security**: Proper access rights, data protection, secure coding
4. **Performance**: Optimized queries, caching, efficient rendering
5. **User Experience**: Intuitive UI, responsive design, accessibility
6. **Documentation**: Comprehensive docs for users and developers
7. **Testing**: Unit, integration, and UI tests
8. **Maintainability**: Well-structured, documented, extensible code

---

## Getting Started

1. **Review PHP Application**: Analyze `/home/rodrickmakore/projects/seitech/oldsite/seitech/well-known/` to understand existing features
2. **Review Design Theme**: Study `/home/rodrickmakore/projects/ensemble/apps/website/DESIGN_THEME_DESCRIPTION.md`
3. **Review Agent-OS Standards**: Study `/home/rodrickmakore/projects/ensemble/agent-os/` structure
4. **Create Agent-OS Structure**: Set up the directory structure and standards
5. **Create Specifications**: Write detailed specs for both modules
6. **Implement Modules**: Develop both modules following specifications
7. **Test & Verify**: Comprehensive testing and verification
8. **Document**: Complete documentation for all components

---

## Notes

- This is for **Seitech International**, not Ensemble
- Target platform: **Odoo** (latest stable version)
- Design theme must be applied consistently across both modules
- All features from PHP application must be migrated and enhanced
- Follow enterprise-grade development standards
- Ensure production-ready code (no TODOs, no placeholders)

Begin by creating the agent-os structure and specifications, then proceed with implementation.

