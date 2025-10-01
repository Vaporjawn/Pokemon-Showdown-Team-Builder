import { test, expect } from '@playwright/test';

test.describe('Pokemon Team Builder E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application correctly', async ({ page }) => {
    await expect(page.locator('h5:has-text("Pokémon Hub")')).toBeVisible();
    await expect(page.locator('text=Team Builder & Pokédex')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Test Team Builder tab (should be active by default)
    await expect(page.locator('[role="tabpanel"]')).toContainText('Team Builder');

    // Click Pokédex tab
    await page.click('[role="tab"]:has-text("Pokédex")');
    await expect(page.locator('[role="tabpanel"]')).toContainText('Pokédex');

    // Click back to Team Builder
    await page.click('[role="tab"]:has-text("Team Builder")');
    await expect(page.locator('[role="tabpanel"]')).toContainText('Team Builder');
  });

  test('should open background selector', async ({ page }) => {
    // Click the palette button in the app bar
    await page.click('[aria-label="change background"]');

    // Should open background selector dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Should still display main elements
    await expect(page.locator('h5:has-text("Pokémon Hub")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Team Builder")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Pokédex")')).toBeVisible();
  });

  test('should handle accessibility navigation', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to navigate to tabs
    await expect(page.locator('[role="tab"]:focus')).toBeVisible();

    // Test ARIA labels
    await expect(page.locator('[aria-label="change background"]')).toBeVisible();
  });
});