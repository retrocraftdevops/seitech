# Website Theme Module Specification

**Module**: `seitech_website_theme`
**Version**: 19.0.1.0.0
**Status**: Planned

## Overview

Custom Odoo website theme for Seitech International, implementing a modern enterprise design system based on the Ensemble design theme.

## Objectives

1. Create a professional, modern website theme
2. Implement a consistent design system
3. Provide reusable components for the e-learning platform
4. Ensure mobile responsiveness and accessibility

## Dependencies

- `website`
- `website_slides`
- `seitech_base`

## Design System

### Color Palette
- Primary: Teal/Cyan (#0284c7)
- Secondary: #0e9384
- Background: #ffffff
- Surface: #f8fafc
- Text Primary: #0b1220
- Text Secondary: #667085
- Border: #e4e7ec

### Typography
- Font Family: System font stack
- Headlines: 36-60px, bold
- Body: 16-18px, regular
- Small: 12-14px

### Components
- Rounded corners (16px for cards)
- Pill-shaped buttons
- Subtle shadows with ring borders
- Smooth hover transitions

## Features

### 1. Custom Layouts
- Sticky header with mega menu
- Multi-column footer with newsletter signup
- Responsive mobile navigation (hamburger menu)
- Breadcrumb navigation

### 2. Homepage Components
- Hero section with gradient background
- Stats section (4-column grid)
- Feature grid (3-column cards)
- Testimonials carousel
- CTA sections
- Client logos section

### 3. E-Learning Integration
- Course listing templates
- Course detail page layout
- Learning dashboard layout
- Certificate display page
- Instructor profile pages

### 4. Snippets (Website Builder)
- Hero section snippet
- Feature grid snippet
- Stats counter snippet
- Testimonials snippet
- CTA section snippet
- Course cards snippet

### 5. Customization Options
- Theme color picker (primary color)
- Logo upload
- Font selection (preset options)
- Layout options (header style, footer columns)

## File Structure

```
seitech_website_theme/
├── __manifest__.py
├── __init__.py
├── data/
│   └── theme_data.xml
├── static/
│   ├── description/
│   │   ├── icon.png
│   │   └── index.html
│   └── src/
│       ├── scss/
│       │   ├── _variables.scss
│       │   ├── _mixins.scss
│       │   ├── bootstrap_overridden.scss
│       │   ├── components/
│       │   │   ├── _buttons.scss
│       │   │   ├── _cards.scss
│       │   │   ├── _navigation.scss
│       │   │   └── _forms.scss
│       │   └── pages/
│       │       ├── _homepage.scss
│       │       └── _elearning.scss
│       └── js/
│           ├── theme.js
│           └── components/
│               ├── mega_menu.js
│               └── animations.js
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
        ├── s_hero_section.xml
        ├── s_feature_grid.xml
        ├── s_testimonials.xml
        └── s_cta_section.xml
```

## Technical Requirements

### SCSS Architecture
- Use CSS custom properties for theming
- BEM naming convention
- Mobile-first responsive design
- No external dependencies (use Bootstrap included in Odoo)

### JavaScript
- OWL components for interactive elements
- Lazy loading for below-fold content
- Smooth animations with CSS transitions
- No jQuery (use vanilla JS or OWL)

### Performance
- Optimized images (WebP format)
- Minified assets in production
- Lazy loading images
- Critical CSS inlined

### Accessibility
- WCAG AA compliance
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states visible
- Color contrast ratios met

## Testing

- Visual regression testing
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile device testing
- Accessibility audit (WAVE, axe)
- Performance audit (Lighthouse)

## Deliverables

1. Complete module with all components
2. Design system documentation
3. Snippet usage guide
4. Customization guide
5. Performance benchmarks
