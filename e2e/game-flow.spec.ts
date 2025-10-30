import { test, expect } from '@playwright/test';

test.describe('Game Flow', () => {
  test('should display home page with game title', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByTestId('text-game-title')).toBeVisible();
    await expect(page.getByTestId('text-game-title')).toHaveText(/Mouzzy/i);
  });

  test('should navigate to create room page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByTestId('input-player-name').fill('Jogador Teste');
    await page.getByTestId('button-create-room').click();
    
    await expect(page).toHaveURL(/\/create/);
    await expect(page.getByTestId('text-page-title')).toHaveText(/Nova Sala/i);
  });

  test('should create a room and show lobby', async ({ page }) => {
    await page.goto('/');
    
    await page.getByTestId('input-player-name').fill('Host Player');
    await page.getByTestId('button-create-room').click();
    
    await page.getByTestId('select-timer').click();
    await page.getByText('1 minuto').click();
    
    await page.getByTestId('select-difficulty').click();
    await page.getByText('Vogais').click();
    
    await page.getByTestId('button-create').click();
    
    await expect(page).toHaveURL(/\/lobby\//);
    await expect(page.getByTestId('text-room-code')).toBeVisible();
    await expect(page.getByText('Host Player')).toBeVisible();
  });

  test('should navigate to achievements page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByTestId('button-achievements').click();
    
    await expect(page).toHaveURL(/\/achievements/);
    await expect(page.getByTestId('text-page-title')).toHaveText(/Conquistas/i);
  });

  test('should navigate to training mode', async ({ page }) => {
    await page.goto('/');
    
    await page.getByTestId('button-training').click();
    
    await expect(page).toHaveURL(/\/training/);
    await expect(page.getByTestId('text-page-title')).toHaveText(/Treino/i);
  });
});
