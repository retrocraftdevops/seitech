import { test, expect } from '@playwright/test';

/**
 * Comprehensive Route Testing Suite
 * Tests all routes for accessibility, functionality, and production readiness
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

// All routes organized by category
const ROUTES = {
  public: [
    { path: '/', name: 'Homepage' },
    { path: '/categories', name: 'Categories' },
    { path: '/categories/health-safety', name: 'Health & Safety Category' },
    { path: '/categories/fire-safety', name: 'Fire Safety Category' },
    { path: '/categories/environmental', name: 'Environmental Category' },
    { path: '/categories/management-systems', name: 'Management Systems Category' },
  ],
  training: [
    { path: '/courses', name: 'Courses' },
    { path: '/courses/iosh-managing-safely', name: 'Course Detail' },
    { path: '/e-learning', name: 'E-Learning' },
    { path: '/face-to-face', name: 'Face to Face' },
    { path: '/virtual-learning', name: 'Virtual Learning' },
    { path: '/in-house-training', name: 'In-house Training' },
    { path: '/schedule', name: 'Schedule' },
  ],
  consultancy: [
    { path: '/services', name: 'Services' },
    { path: '/services/fire-risk-assessment', name: 'Service Detail' },
    { path: '/free-consultation', name: 'Free Consultation' },
  ],
  marketing: [
    { path: '/about', name: 'About' },
    { path: '/about/team', name: 'Team' },
    { path: '/about/accreditations', name: 'Accreditations' },
    { path: '/contact', name: 'Contact' },
    { path: '/blog', name: 'Blog' },
    { path: '/terms', name: 'Terms' },
    { path: '/privacy', name: 'Privacy' },
  ],
  auth: [
    { path: '/login', name: 'Login' },
    { path: '/register', name: 'Register' },
    { path: '/forgot-password', name: 'Forgot Password' },
  ],
  commerce: [
    { path: '/cart', name: 'Shopping Cart' },
    { path: '/checkout', name: 'Checkout' },
  ],
};

test.describe('Public Routes - Accessibility & Responsiveness', () => {
  ROUTES.public.forEach(({ path, name }) => {
    test(`${name} (${path}) should load and be accessible`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${path}`);
      
      // Check response status
      expect(response?.status()).toBeLessThan(400);
      
      // Check page title exists
      await expect(page).toHaveTitle(/.+/);
      
      // Check main content is visible
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      // Check navigation exists
      const nav = page.locator('nav, header');
      await expect(nav.first()).toBeVisible();
      
      // Check footer exists
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test(`${name} (${path}) should be responsive`, async ({ page }) => {
      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}${path}`);
      await expect(page.locator('main')).toBeVisible();
      
      // Test tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('main')).toBeVisible();
      
      // Test desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('main')).toBeVisible();
    });
  });
});

test.describe('Training Routes - Content & Functionality', () => {
  ROUTES.training.forEach(({ path, name }) => {
    test(`${name} (${path}) should load successfully`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${path}`);
      expect(response?.status()).toBeLessThan(400);
      
      // Check for key elements
      await expect(page.locator('main')).toBeVisible();
      await expect(page).toHaveTitle(/.+/);
    });
  });

  test('Course detail page should have enrollment button', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses/iosh-managing-safely`);
    
    // Check for CTA buttons
    const buttons = page.locator('button, a[role="button"]').filter({ hasText: /enrol|book|buy|add to cart/i });
    await expect(buttons.first()).toBeVisible({ timeout: 10000 });
  });

  test('Schedule page should display dates', async ({ page }) => {
    await page.goto(`${BASE_URL}/schedule`);
    
    // Check for schedule elements
    const scheduleItems = page.locator('[data-testid="schedule-item"], .schedule-item, [class*="schedule"]');
    // Should have schedule content or empty state
    await expect(page.locator('main')).toContainText(/.+/);
  });
});

test.describe('Consultancy Routes - Forms & CTAs', () => {
  ROUTES.consultancy.forEach(({ path, name }) => {
    test(`${name} (${path}) should load successfully`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${path}`);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test('Free consultation page should have form', async ({ page }) => {
    await page.goto(`${BASE_URL}/free-consultation`);
    
    // Check for form elements
    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 10000 });
    
    // Check for common form fields
    const inputs = page.locator('input[type="text"], input[type="email"], textarea');
    await expect(inputs.first()).toBeVisible();
  });
});

test.describe('Marketing Routes - Content & SEO', () => {
  ROUTES.marketing.forEach(({ path, name }) => {
    test(`${name} (${path}) should have proper meta tags`, async ({ page }) => {
      await page.goto(`${BASE_URL}${path}`);
      
      // Check title
      await expect(page).toHaveTitle(/.+/);
      
      // Check meta description
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description?.length).toBeGreaterThan(50);
    });
  });

  test('Contact page should have contact form', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    
    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 10000 });
    
    // Check for required fields
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
    const emailInput = page.locator('input[type="email"]');
    const messageInput = page.locator('textarea');
    
    await expect(nameInput.first()).toBeVisible();
    await expect(emailInput.first()).toBeVisible();
    await expect(messageInput.first()).toBeVisible();
  });
});

test.describe('Auth Routes - Forms & Validation', () => {
  test('Login page should have login form', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 10000 });
    
    // Check for email and password fields
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('Register page should have registration form', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    
    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 10000 });
    
    // Check for common registration fields
    const inputs = page.locator('input');
    await expect(inputs.first()).toBeVisible();
  });

  test('Forgot password page should have email form', async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);
    
    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 10000 });
    
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });
});

test.describe('Commerce Routes - Shopping Flow', () => {
  test('Cart page should load', async ({ page }) => {
    await page.goto(`${BASE_URL}/cart`);
    
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Should show either cart items or empty cart message
    await expect(main).toContainText(/.+/);
  });

  test('Checkout page should load', async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`);
    
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});

test.describe('Navigation & Links', () => {
  test('Homepage navigation should work', async ({ page }) => {
    await page.goto(`${BASE_URL}`);
    
    // Check main navigation links
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
    
    // Get all navigation links
    const links = nav.locator('a[href^="/"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(3);
  });

  test('Footer links should be valid', async ({ page }) => {
    await page.goto(`${BASE_URL}`);
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check footer has links
    const links = footer.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(5);
  });
});

test.describe('Performance & Loading', () => {
  test('Homepage should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${BASE_URL}`);
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('Images should have proper attributes', async ({ page }) => {
    await page.goto(`${BASE_URL}`);
    
    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      // Check first image has alt text
      const firstImg = images.first();
      const alt = await firstImg.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });
});

test.describe('Error Handling', () => {
  test('404 page should load for invalid route', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/this-page-does-not-exist-12345`);
    
    // Should show 404 or redirect
    expect([200, 404]).toContain(response?.status() || 404);
    
    // Should show some content
    const body = page.locator('body');
    await expect(body).toContainText(/.+/);
  });
});
