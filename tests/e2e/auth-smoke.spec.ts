import { expect, test } from '@playwright/test';

test('login and register pages render core auth UI', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'MausamOG' })).toBeVisible();
  await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible();

  await page.goto('/register');
  await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /email signup link/i })).toBeVisible();
});

test('dashboard redirects anonymous users to login-sensitive auth flow', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});
