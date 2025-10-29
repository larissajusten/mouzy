import { test, expect } from '@playwright/test';

test.describe('Multiplayer Features', () => {
  test('should allow two players to join the same room', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    try {
      // Player 1 creates a room
      await page1.goto('/');
      await page1.getByTestId('input-player-name').fill('Player 1');
      await page1.getByTestId('button-create-room').click();
      
      await page1.getByTestId('select-timer').click();
      await page1.getByText('1 minuto').click();
      
      await page1.getByTestId('select-difficulty').click();
      await page1.getByText('Vogais').click();
      
      await page1.getByTestId('button-create').click();
      
      await expect(page1).toHaveURL(/\/lobby\//);
      
      const roomCode = await page1.getByTestId('text-room-code').textContent();
      expect(roomCode).toBeTruthy();
      
      // Player 2 joins the room
      await page2.goto('/');
      await page2.getByTestId('input-player-name').fill('Player 2');
      await page2.getByTestId('button-join-room').click();
      
      await page2.getByTestId('input-room-code').fill(roomCode!);
      await page2.getByTestId('button-join').click();
      
      await expect(page2).toHaveURL(/\/lobby\//);
      
      // Both players should see each other
      await expect(page1.getByText('Player 2')).toBeVisible();
      await expect(page2.getByText('Player 1')).toBeVisible();
      
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('should show player count in lobby', async ({ page }) => {
    await page.goto('/');
    
    await page.getByTestId('input-player-name').fill('Solo Player');
    await page.getByTestId('button-create-room').click();
    
    await page.getByTestId('select-timer').click();
    await page.getByText('1 minuto').click();
    
    await page.getByTestId('select-difficulty').click();
    await page.getByText('Vogais').click();
    
    await page.getByTestId('button-create').click();
    
    await expect(page.getByText(/Jogadores.*\(1\)/i)).toBeVisible();
  });
});
