# Requirements - Website Theme Module

## Feature Description

Create a custom Odoo website theme implementing the Seitech design system with modern components, responsive layouts, and website builder integration.

## Core Requirements

### Design System Implementation
- Implement color palette as SCSS variables and CSS custom properties
- Create typography scale with proper hierarchy
- Define spacing scale for consistent layouts
- Implement shadow system for depth
- Create border radius tokens

### Layout Components
- Sticky header with logo, navigation, and CTA buttons
- Mega menu with multi-column dropdown
- Responsive mobile navigation (hamburger menu with slide-out)
- Footer with multiple columns, newsletter signup, and social links
- Breadcrumb navigation component

### Page Templates
- Homepage with hero, features, stats, testimonials, CTA
- Course listing page with filters and grid
- Course detail page with sidebar
- Learning dashboard layout
- User profile/account pages
- Certificate verification page

### Website Builder Snippets
- Hero section (multiple variants)
- Feature grid (2, 3, 4 columns)
- Stats counter with animation
- Testimonials (carousel and grid)
- CTA sections (light and dark)
- Course cards
- Instructor cards
- Pricing tables
- FAQ accordion

### Customization Options (Website Editor)
- Primary color picker
- Secondary color picker
- Logo upload with sizing options
- Header style (transparent, solid, sticky)
- Footer column configuration
- Font family selection

## Technical Requirements

### SCSS Structure
```scss
// Variables
$seitech-primary: #0284c7;
$seitech-radius-lg: 1rem;
// ... all design tokens

// Mixins
@mixin card-hover { ... }
@mixin button-base { ... }

// Components
.btn-seitech-primary { ... }
.card-seitech { ... }
```

### JavaScript Requirements
- Mega menu hover/click behavior
- Smooth scroll navigation
- Lazy image loading
- Animation on scroll (optional)
- Mobile menu toggle

### Asset Registration
```python
'assets': {
    'web.assets_frontend': [
        ('replace', 'web/static/src/scss/bootstrap_overridden.scss',
         'seitech_website_theme/static/src/scss/bootstrap_overridden.scss'),
        'seitech_website_theme/static/src/scss/main.scss',
        'seitech_website_theme/static/src/js/theme.js',
    ],
}
```

## Integration Points

- **Input**: Design theme reference, Odoo website module
- **Output**: Themed website, reusable snippets
- **Dependencies**: website, website_slides, seitech_base

## Success Criteria

1. All design tokens implemented and documented
2. Header/footer work on all page sizes
3. All snippets available in website builder
4. Mobile responsive (tested on real devices)
5. Lighthouse performance score > 90
6. WCAG AA accessibility compliance
7. Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

## Example Component

### Hero Section Snippet
```xml
<template id="s_hero_seitech" name="Hero Section">
    <section class="s_hero_seitech py-5" data-snippet="s_hero_seitech">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <span class="badge-seitech-primary mb-3">New</span>
                    <h1 class="hero-title">Transform Your Learning Journey</h1>
                    <p class="hero-subtitle">Access world-class courses...</p>
                    <div class="hero-buttons">
                        <a href="#" class="btn-seitech-primary">Get Started</a>
                        <a href="#" class="btn-seitech-secondary">Learn More</a>
                    </div>
                </div>
                <div class="col-lg-6">
                    <img src="/path/to/hero-image.jpg" class="hero-image"/>
                </div>
            </div>
        </div>
    </section>
</template>
```

## Reference

- Design Theme: `/ensemble/apps/website/DESIGN_THEME_DESCRIPTION.md`
- CSS Standards: `agent-os/standards/frontend/css-styling.md`
- QWeb Standards: `agent-os/standards/frontend/qweb-templates.md`
