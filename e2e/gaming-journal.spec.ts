import { test, expect } from '@playwright/test';

test.describe('Gaming Journal', () => {
  test.describe('Landing Page', () => {
    test('should display the landing page', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/Gaming/);
    });

    test('should have login buttons', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /discord/i })).toBeVisible();
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

    test('should redirect to Google OAuth', async ({ page }) => {
      await page.goto('/api/auth/google');
      // Should redirect to Google's OAuth page
      await expect(page).toHaveURL(/accounts\.google\.com/);
    });

    test('should redirect to Discord OAuth', async ({ page }) => {
      await page.goto('/api/auth/discord');
      // Should redirect to Discord's OAuth page
      await expect(page).toHaveURL(/discord\.com/);
    });
  });
});

test.describe('API Validation', () => {
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
