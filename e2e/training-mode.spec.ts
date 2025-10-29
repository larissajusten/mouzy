import { test, expect } from '@playwright/test';

test.describe('Training Mode', () => {
  test('should start training mode and show game elements', async ({ page }) => {
    await page.goto('/');
    
    await page.getByTestId('button-training').click();
    
    await expect(page).toHaveURL(/\/training/);
    
    // Should show initial difficulty
    await expect(page.getByText(/Nível/i)).toBeVisible();
    
    // Should show score
    await expect(page.getByText(/Pontuação/i)).toBeVisible();
    
    // Should show precision
    await expect(page.getByText(/Precisão/i)).toBeVisible();
  });

  test('should display collectible items', async ({ page }) => {
    await page.goto('/training');
    
    // Wait for items to load
    await page.waitForSelector('[data-testid^="item-"]', { timeout: 5000 });
    
    const items = await page.locator('[data-testid^="item-"]').count();
    expect(items).toBeGreaterThan(0);
  });

  test('should have back button', async ({ page }) => {
    await page.goto('/training');
    
    await expect(page.getByTestId('button-back')).toBeVisible();
    
    await page.getByTestId('button-back').click();
    
    await expect(page).toHaveURL('/');
  });
});
