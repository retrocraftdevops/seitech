# Seitech E-Learning Platform - Copilot Instructions

## Project Overview

Odoo 19.0 Enterprise e-learning platform migrated from PHP CodeIgniter. Three custom modules in `custom_addons/`:
- **seitech_base** - Foundation module with company branding
- **seitech_website_theme** - Teal/cyan design system (#0284c7)
- **seitech_elearning** - LMS extending `website_slides` with enrollments, certificates, assignments

**Enterprise License**: `M251219268990828`

## Architecture & Module Dependencies

```
seitech_elearning → seitech_website_theme → seitech_base → base
                 ↘ website_slides, survey, website_sale, payment
```

All models use `seitech.` prefix (e.g., `seitech.enrollment`, `seitech.certificate`). E-learning extends core Odoo models (`slide.channel`, `slide.slide`) via `_inherit`.

## Development Commands

```bash
./scripts/dev.sh start          # Start with docker-compose (dev mode)
./scripts/dev.sh logs           # Tail Odoo logs
./scripts/dev.sh update seitech_elearning   # Update module
./scripts/dev.sh install seitech_base,seitech_elearning  # Install modules
./scripts/dev.sh shell          # Odoo interactive shell
./scripts/dev.sh backup         # Backup PostgreSQL database
```

Access at http://localhost:8069 after `docker compose up -d`.

## Legacy PHP Migration Mapping

### Database Tables → Odoo Models
| PHP Table | Odoo Model | Notes |
|-----------|------------|-------|
| `users` | `res.users` + `res.partner` | Users split into login/contact |
| `course` | `slide.channel` | Extended with pricing, categories |
| `lesson` | `slide.slide` | Video/article content |
| `section` | `slide.slide` (is_category=True) | Course sections as parent slides |
| `category` | `seitech.course.category` | Custom category hierarchy |
| `enrol` | `seitech.enrollment` | Enrollment with payment tracking |
| `payment` | `account.payment` + `seitech.enrollment` | Linked to enrollments |
| `quiz_results` | `survey.user_input` | Odoo survey module |
| `question` | `survey.question` | Quiz questions |
| `blogs` | `blog.post` | Odoo blog module |
| `contact` | `crm.lead` | Contact form submissions |
| `coupons` | `loyalty.card` | Odoo loyalty/coupons |

### PHP Controllers → Odoo Controllers/Routes
| PHP Controller | Odoo Route | Implementation |
|----------------|------------|----------------|
| `Home.php` | `/`, `/courses` | [controllers/main.py](custom_addons/seitech_elearning/controllers/main.py) |
| `User.php` | `/my/dashboard`, `/my/courses` | Student/instructor dashboard |
| `Payment.php` | Integrated with `website_sale` | Checkout flow |
| `Admin.php` | Backend views | Standard Odoo backend |
| `Login.php` | `/web/login` | Odoo auth |
| `Sign_up.php` | `/web/signup` | Odoo auth |

### PHP Views → Odoo Templates
| PHP View Folder | Odoo Templates |
|-----------------|----------------|
| `frontend/default-new/` | `seitech_website_theme/templates/` |
| `home.php` | `templates/pages/homepage.xml` |
| `courses_page.php` | `templates/elearning/course_main.xml` |
| `course_page.php` | `templates/elearning/slide_fullscreen.xml` |
| `shopping_cart.php` | `website_sale` templates |
| `backend/` | Standard Odoo backend views |

### Key Features to Port
1. **Course Catalog** - Category filtering, search, pricing display
2. **Video Player** - YouTube/Vimeo/HTML5 with progress tracking
3. **Quiz System** - Multiple choice, true/false, fill-in-blank
4. **Certificates** - PDF generation with QR verification
5. **Payments** - Stripe, PayPal, Razorpay integration
6. **Instructor Dashboard** - Course creation, analytics
7. **Student Dashboard** - Progress, certificates, enrollments
8. **Live Classes** - BigBlueButton/Zoom integration
9. **Gamification** - Points, badges, leaderboards
10. **Multi-language** - 16 language JSON files in `legacy-php/languages/`

## Code Patterns

### Models (see [enrollment.py](custom_addons/seitech_elearning/models/enrollment.py))
- Inherit `mail.thread`, `mail.activity.mixin` for chatter
- Use `_order`, tracking fields, computed fields with `@api.depends`
- Sequence references via `ir.sequence` in `create()` override

### Security (see [ir.model.access.csv](custom_addons/seitech_elearning/security/ir.model.access.csv))
- Three user groups: `group_elearning_student`, `group_elearning_instructor`, `group_elearning_manager`
- Grant public read access to catalogs, restrict writes to managers
- Record rules in `security/record_rules.xml` for row-level security

### Views (see [enrollment_views.xml](custom_addons/seitech_elearning/views/enrollment_views.xml))
- Use `invisible="state != 'draft'"` (not `attrs`) for visibility
- Statusbar widget for state fields, progressbar for completion
- Stat buttons in `oe_button_box` for related record navigation

### Controllers (see [controllers/main.py](custom_addons/seitech_elearning/controllers/main.py))
- Public routes: `auth='public'`, User routes: `auth='user'`
- Use `request.env['model'].sudo()` for public access
- Pagination via `request.website.pager()`

### Assets in `__manifest__.py`
```python
'assets': {
    'web.assets_backend': ['module/static/src/scss/*.scss'],
    'web.assets_frontend': ['module/static/src/js/*.js'],
}
```

## Design System

Primary: `#0284c7` (teal), Surface: `#f8fafc`, Text: `#0b1220`. See [variables.scss](custom_addons/seitech_website_theme/static/src/scss/variables.scss) for full palette. Use rounded corners (`rounded-2xl`), subtle shadows, generous spacing.

## Key Files

- [agent-os/standards/WORLD_CLASS_DEVELOPMENT_STANDARDS.md](agent-os/standards/WORLD_CLASS_DEVELOPMENT_STANDARDS.md) - Coding standards
- [CLAUDE_PROMPT_ODOO_MIGRATION.md](CLAUDE_PROMPT_ODOO_MIGRATION.md) - Migration context from PHP
- [config/odoo.conf](config/odoo.conf) - Odoo configuration
- [legacy-php/uploads/install.sql](legacy-php/uploads/install.sql) - Original database schema
- [legacy-php/application/models/Crud_model.php](legacy-php/application/models/Crud_model.php) - Main PHP model (5300+ lines)
- [legacy-php/](legacy-php/) - Original PHP application (reference only)

## Testing

Tests go in `custom_addons/seitech_elearning/tests/`. Run with:
```bash
docker compose exec odoo python3 /opt/odoo/odoo/odoo-bin -c /opt/odoo/config/odoo.conf --test-enable -i seitech_elearning --stop-after-init
```

## Common Gotchas

- PostgreSQL runs on host (not Docker), connect via `localhost:5432`
- Odoo source mounted at `/opt/odoo/odoo` from `./odoo` symlink
- Enterprise addons at `/opt/odoo/enterprise` - must be populated before use
- Module updates require restart or `-u module_name` flag
- XML data files order matters in manifest - security before views
