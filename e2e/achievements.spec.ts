import { test, expect } from '@playwright/test';

test.describe('Achievements', () => {
  test('should display achievements page', async ({ page }) => {
    await page.goto('/achievements');
    
    await expect(page.getByTestId('text-page-title')).toHaveText(/Conquistas/i);
  });

  test('should show achievement categories', async ({ page }) => {
    await page.goto('/achievements');
    
    await expect(page.getByText(/Coleção/i)).toBeVisible();
    await expect(page.getByText(/Precisão/i)).toBeVisible();
    await expect(page.getByText(/Dificuldade/i)).toBeVisible();
    await expect(page.getByText(/Social/i)).toBeVisible();
  });

  test('should have back button to return home', async ({ page }) => {
    await page.goto('/achievements');
    
    await expect(page.getByTestId('button-back')).toBeVisible();
    
    await page.getByTestId('button-back').click();
    
    await expect(page).toHaveURL('/');
  });

  test('should display achievement cards', async ({ page }) => {
    await page.goto('/achievements');
    
    const achievementCards = await page.locator('[data-testid^="achievement-"]').count();
    expect(achievementCards).toBeGreaterThan(0);
  });
});
