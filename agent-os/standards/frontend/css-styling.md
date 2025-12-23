# CSS/SCSS Styling Standards

Standards for styling Odoo modules following the Seitech design theme.

## Design Tokens

### Color Variables

```scss
// Primary Colors
$seitech-primary: #0284c7;
$seitech-primary-light: #38bdf8;
$seitech-primary-dark: #0369a1;
$seitech-secondary: #0e9384;

// Neutral Palette
$seitech-white: #ffffff;
$seitech-gray-50: #f8fafc;
$seitech-gray-100: #f1f5f9;
$seitech-gray-200: #e2e8f0;
$seitech-gray-300: #cbd5e1;
$seitech-gray-400: #94a3b8;
$seitech-gray-500: #64748b;
$seitech-gray-600: #475569;
$seitech-gray-700: #334155;
$seitech-gray-800: #1e293b;
$seitech-gray-900: #0f172a;

// Semantic Colors
$seitech-success: #22c55e;
$seitech-warning: #f59e0b;
$seitech-danger: #ef4444;
$seitech-info: #3b82f6;

// Text Colors
$seitech-text-primary: #0b1220;
$seitech-text-secondary: #667085;
$seitech-text-muted: #9ca3af;

// Border Colors
$seitech-border: #e4e7ec;
$seitech-border-light: #f3f4f6;
```

### Typography Scale

```scss
// Font Family
$font-family-base: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

// Font Sizes
$font-size-xs: 0.75rem;    // 12px
$font-size-sm: 0.875rem;   // 14px
$font-size-base: 1rem;     // 16px
$font-size-lg: 1.125rem;   // 18px
$font-size-xl: 1.25rem;    // 20px
$font-size-2xl: 1.5rem;    // 24px
$font-size-3xl: 1.875rem;  // 30px
$font-size-4xl: 2.25rem;   // 36px
$font-size-5xl: 3rem;      // 48px
$font-size-6xl: 3.75rem;   // 60px

// Font Weights
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
$font-weight-extrabold: 800;

// Line Heights
$line-height-tight: 1.25;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;
```

### Spacing Scale

```scss
$spacing-0: 0;
$spacing-1: 0.25rem;   // 4px
$spacing-2: 0.5rem;    // 8px
$spacing-3: 0.75rem;   // 12px
$spacing-4: 1rem;      // 16px
$spacing-5: 1.25rem;   // 20px
$spacing-6: 1.5rem;    // 24px
$spacing-8: 2rem;      // 32px
$spacing-10: 2.5rem;   // 40px
$spacing-12: 3rem;     // 48px
$spacing-16: 4rem;     // 64px
$spacing-20: 5rem;     // 80px
$spacing-24: 6rem;     // 96px
$spacing-32: 8rem;     // 128px
```

### Border Radius

```scss
$radius-none: 0;
$radius-sm: 0.25rem;   // 4px
$radius-base: 0.5rem;  // 8px
$radius-md: 0.75rem;   // 12px
$radius-lg: 1rem;      // 16px
$radius-xl: 1.25rem;   // 20px
$radius-2xl: 1.5rem;   // 24px
$radius-full: 9999px;  // Pill shape
```

### Shadows

```scss
$shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
$shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
$shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
$shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
$shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
$shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

## Component Styles

### Buttons

```scss
// Base Button
.btn-seitech {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-6;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  line-height: $line-height-tight;
  border-radius: $radius-full;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba($seitech-primary, 0.2);
  }
}

// Primary Button
.btn-seitech-primary {
  @extend .btn-seitech;
  background-color: $seitech-primary;
  color: $seitech-white;
  border: none;
  box-shadow: 0 4px 14px 0 rgba($seitech-primary, 0.25);

  &:hover {
    background-color: $seitech-primary-dark;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px 0 rgba($seitech-primary, 0.35);
  }

  &:active {
    transform: translateY(0);
  }
}

// Secondary/Outline Button
.btn-seitech-secondary {
  @extend .btn-seitech;
  background-color: transparent;
  color: $seitech-gray-700;
  border: 1px solid $seitech-gray-300;

  &:hover {
    background-color: $seitech-gray-50;
    border-color: $seitech-gray-400;
  }
}

// Ghost Button
.btn-seitech-ghost {
  @extend .btn-seitech;
  background-color: transparent;
  color: $seitech-gray-900;
  border: none;

  &:hover {
    color: $seitech-primary;
  }
}

// Button Sizes
.btn-seitech-sm {
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-sm;
}

.btn-seitech-lg {
  padding: $spacing-4 $spacing-8;
  font-size: $font-size-lg;
}
```

### Cards

```scss
.card-seitech {
  background-color: $seitech-white;
  border-radius: $radius-2xl;
  box-shadow: $shadow-sm;
  border: 1px solid $seitech-gray-100;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: $shadow-lg;
    border-color: $seitech-primary-light;
    transform: translateY(-2px);
  }

  .card-seitech-header {
    padding: $spacing-6;
    border-bottom: 1px solid $seitech-gray-100;
  }

  .card-seitech-body {
    padding: $spacing-6;
  }

  .card-seitech-footer {
    padding: $spacing-4 $spacing-6;
    background-color: $seitech-gray-50;
    border-top: 1px solid $seitech-gray-100;
  }
}

// Featured Card
.card-seitech-featured {
  @extend .card-seitech;
  border: 2px solid $seitech-primary;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, $seitech-primary, $seitech-secondary);
  }
}
```

### Badges

```scss
.badge-seitech {
  display: inline-flex;
  align-items: center;
  padding: $spacing-1 $spacing-3;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  line-height: 1;
  border-radius: $radius-full;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-seitech-primary {
  @extend .badge-seitech;
  background-color: rgba($seitech-primary, 0.1);
  color: $seitech-primary;
  border: 1px solid rgba($seitech-primary, 0.2);
}

.badge-seitech-success {
  @extend .badge-seitech;
  background-color: rgba($seitech-success, 0.1);
  color: darken($seitech-success, 10%);
  border: 1px solid rgba($seitech-success, 0.2);
}

.badge-seitech-warning {
  @extend .badge-seitech;
  background-color: rgba($seitech-warning, 0.1);
  color: darken($seitech-warning, 10%);
  border: 1px solid rgba($seitech-warning, 0.2);
}

.badge-seitech-danger {
  @extend .badge-seitech;
  background-color: rgba($seitech-danger, 0.1);
  color: $seitech-danger;
  border: 1px solid rgba($seitech-danger, 0.2);
}
```

### Form Elements

```scss
.input-seitech {
  width: 100%;
  padding: $spacing-3 $spacing-4;
  font-size: $font-size-base;
  line-height: $line-height-normal;
  color: $seitech-text-primary;
  background-color: $seitech-white;
  border: 1px solid $seitech-gray-300;
  border-radius: $radius-lg;
  transition: all 0.2s ease;

  &::placeholder {
    color: $seitech-gray-500;
  }

  &:focus {
    outline: none;
    border-color: $seitech-primary;
    box-shadow: 0 0 0 3px rgba($seitech-primary, 0.1);
  }

  &:disabled {
    background-color: $seitech-gray-100;
    cursor: not-allowed;
  }
}

.label-seitech {
  display: block;
  margin-bottom: $spacing-2;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $seitech-gray-700;
}

.form-group-seitech {
  margin-bottom: $spacing-6;
}
```

## Layout Patterns

### Container

```scss
.container-seitech {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 $spacing-6;

  @media (min-width: 640px) {
    padding: 0 $spacing-8;
  }
}
```

### Section

```scss
.section-seitech {
  padding: $spacing-16 0;

  @media (min-width: 1024px) {
    padding: $spacing-24 0;
  }

  &.section-gray {
    background-color: $seitech-gray-50;
  }

  &.section-dark {
    background-color: $seitech-gray-900;
    color: $seitech-white;
  }

  &.section-primary {
    background-color: $seitech-primary;
    color: $seitech-white;
  }
}

.section-header {
  text-align: center;
  max-width: 768px;
  margin: 0 auto $spacing-12;

  .section-title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $seitech-gray-900;
    margin-bottom: $spacing-4;

    @media (min-width: 1024px) {
      font-size: $font-size-4xl;
    }
  }

  .section-subtitle {
    font-size: $font-size-lg;
    color: $seitech-gray-600;
  }
}
```

### Grid

```scss
.grid-seitech {
  display: grid;
  gap: $spacing-8;

  &.grid-cols-2 {
    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &.grid-cols-3 {
    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &.grid-cols-4 {
    @media (min-width: 1024px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}
```

## Responsive Breakpoints

```scss
// Mobile first breakpoints
$breakpoint-sm: 640px;   // Small devices
$breakpoint-md: 768px;   // Medium devices
$breakpoint-lg: 1024px;  // Large devices
$breakpoint-xl: 1280px;  // Extra large devices
$breakpoint-2xl: 1536px; // 2X large devices

// Usage
@mixin sm {
  @media (min-width: $breakpoint-sm) { @content; }
}

@mixin md {
  @media (min-width: $breakpoint-md) { @content; }
}

@mixin lg {
  @media (min-width: $breakpoint-lg) { @content; }
}

@mixin xl {
  @media (min-width: $breakpoint-xl) { @content; }
}
```

## Animation Utilities

```scss
// Transitions
.transition-all {
  transition: all 0.3s ease;
}

.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.transition-transform {
  transition: transform 0.2s ease;
}

// Hover effects
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-xl;
  }
}

.hover-scale {
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
}

// Fade animations
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease forwards;
}

.animate-fadeInUp {
  animation: fadeInUp 0.4s ease forwards;
}
```

## File Organization

```
static/src/scss/
├── _variables.scss         # Design tokens
├── _mixins.scss            # Reusable mixins
├── _utilities.scss         # Utility classes
├── components/
│   ├── _buttons.scss
│   ├── _cards.scss
│   ├── _badges.scss
│   ├── _forms.scss
│   └── _navigation.scss
├── layouts/
│   ├── _header.scss
│   ├── _footer.scss
│   └── _sections.scss
├── pages/
│   ├── _homepage.scss
│   ├── _courses.scss
│   └── _dashboard.scss
└── main.scss               # Main entry point
```

## Best Practices

1. **Use variables**: Never hardcode colors or sizes
2. **Mobile first**: Start with mobile styles, add breakpoints up
3. **BEM naming**: Block__Element--Modifier
4. **Avoid !important**: Use specificity properly
5. **Keep it DRY**: Use mixins and extends
6. **Test cross-browser**: Check on major browsers
7. **Optimize**: Remove unused CSS
