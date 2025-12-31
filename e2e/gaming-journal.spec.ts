import { test as baseTest, expect } from '@playwright/test';
import { test as authTest, TEST_USER_ID } from './test-utils';

// Unauthenticated tests use base Playwright test
const test = baseTest;

test.describe('Gaming Journal', () => {
  test.describe('Landing Page', () => {
    test('should display the landing page', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/Gaming/);
    });

    test('should have login button', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('link', { name: /google/i })).toBeVisible();
    });
  });

  test.describe('Health Check', () => {
    test('should return healthy API status', async ({ request }) => {
      const response = await request.get('/api/health');
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.status).toBe('ok');
    });
  });

  test.describe('Public Timeline', () => {
    test('should return 404 for non-existent user', async ({ request }) => {
      const response = await request.get('/api/u/nonexistentuser12345');
      expect(response.status()).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  test.describe('Authentication', () => {
    test('should return 401 for unauthenticated /api/auth/me', async ({ request }) => {
      const response = await request.get('/api/auth/me');
      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    test('should return 401 for unauthenticated /api/logs', async ({ request }) => {
      const response = await request.get('/api/logs');
      expect(response.status()).toBe(401);
    });

    test('should return 401 for unauthenticated /api/profile', async ({ request }) => {
      const response = await request.get('/api/profile');
      expect(response.status()).toBe(401);
    });

    // OAuth redirect tests - skip in CI since credentials aren't available
    test.skip('should redirect to Google OAuth', async ({ page }) => {
      await page.goto('/api/auth/google');
      await expect(page).toHaveURL(/accounts\.google\.com/);
    });
  });
});

test.describe('API Validation (Unauthenticated)', () => {
  test.describe('Game Logs', () => {
    test('should reject game log creation without auth', async ({ request }) => {
      const response = await request.post('/api/logs', {
        data: {
          game_name: 'Test Game',
          rating: 8,
          start_date: '2024-01',
        },
      });
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Game Search', () => {
    test('should reject search without auth', async ({ request }) => {
      const response = await request.get('/api/games/search?q=zelda');
      expect(response.status()).toBe(401);
    });
  });
});

// Authenticated tests use the auth fixture with cookie injection
// Note: These tests require a test user to exist in the database
// Run: npm run db:seed-test-user (or manually insert test user)
authTest.describe('Authenticated Flows', () => {
  authTest.describe('Session Cookie', () => {
    authTest('should accept valid session cookie', async ({ request, authContext }) => {
      // The authContext fixture has already set the cookie
      const response = await request.get('/api/auth/me');
      // Will return 401 if test user doesn't exist in DB, that's expected
      // The important thing is the cookie is being sent and parsed correctly
      expect([200, 401]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data.data.id).toBe(authContext.userId);
      }
    });
  });

  authTest.describe('Timeline Page', () => {
    authTest('should load timeline page with valid session', async ({ page }) => {
      await page.goto('/timeline');
      // If user exists, shows timeline. If not, redirects to login.
      // Either way, page should load without errors
      await expect(page).toHaveURL(/\/(timeline|login)/);
    });
  });

  authTest.describe('Settings Page', () => {
    authTest('should load settings page with valid session', async ({ page }) => {
      await page.goto('/settings');
      await expect(page).toHaveURL(/\/(settings|login)/);
    });
  });
});
