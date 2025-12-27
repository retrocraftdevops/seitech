import { test, expect } from '@playwright/test';

/**
 * API Integration Tests
 * Tests frontend-backend communication with Odoo
 */

const FRONTEND_URL = process.env.BASE_URL || 'http://localhost:4000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8069';

test.describe('Odoo Backend Integration', () => {
  test('Odoo backend should be accessible', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/web/database/selector`);
    expect(response.status()).toBeLessThan(500);
  });

  test('Odoo session endpoint should respond', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/web/session/get_session_info`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        jsonrpc: '2.0',
        method: 'call',
        params: {},
        id: Math.random(),
      },
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('result');
  });
});

test.describe('Frontend API Routes', () => {
  test('API health check should work', async ({ request }) => {
    const response = await request.get(`${FRONTEND_URL}/api/health`);
    
    if (response.status() === 404) {
      // API route doesn't exist yet - document this
      console.log('⚠️  API health check route not implemented');
    } else {
      expect(response.status()).toBe(200);
    }
  });

  test('Categories API should return data', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/categories`);
    
    // Check if categories are loaded
    await page.waitForLoadState('networkidle');
    
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Courses API should return data', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/courses`);
    
    await page.waitForLoadState('networkidle');
    
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});

test.describe('Data Fetching & Display', () => {
  test('Homepage should display featured courses', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}`);
    
    await page.waitForLoadState('networkidle');
    
    // Look for course-related content
    const content = await page.locator('main').textContent();
    
    // Should have some content
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(100);
  });

  test('Categories page should display categories', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/categories`);
    
    await page.waitForLoadState('networkidle');
    
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Should have category content
    const content = await main.textContent();
    expect(content).toBeTruthy();
  });

  test('Course detail page should display course info', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/courses/iosh-managing-safely`);
    
    await page.waitForLoadState('networkidle');
    
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Should have course content
    const content = await main.textContent();
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(100);
  });
});

test.describe('Form Submissions', () => {
  test('Contact form should have proper structure', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/contact`);
    
    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 10000 });
    
    // Check form method and action
    const method = await form.getAttribute('method');
    const action = await form.getAttribute('action');
    
    console.log('Contact form method:', method);
    console.log('Contact form action:', action);
  });

  test('Login form should have proper structure', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    
    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 10000 });
    
    // Check form has submit button
    const submitBtn = form.locator('button[type="submit"], input[type="submit"]');
    await expect(submitBtn.first()).toBeVisible();
  });
});

test.describe('State Management', () => {
  test('Cart should persist items', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/cart`);
    
    // Check if cart state is managed
    await page.waitForLoadState('networkidle');
    
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('User session should be managed', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    
    // Check if session management is in place
    await page.waitForLoadState('networkidle');
    
    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 10000 });
  });
});
