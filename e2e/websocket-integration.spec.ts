import { test, expect } from '@playwright/test';

test.describe('WebSocket Integration - Item Spawning & Collection', () => {
  test('should spawn items and allow collection with correct key press', async ({ page }) => {
    // Create room as host
    await page.goto('http://localhost:5001');
    await page.fill('[data-testid="input-player-name"]', 'TestPlayer1');
    await page.click('[data-testid="button-create-room"]');

    // Wait for lobby
    await expect(page.locator('[data-testid="text-room-code"]')).toBeVisible();
    const roomCode = await page.locator('[data-testid="text-room-code"]').textContent();

    // Start game
    await page.click('[data-testid="button-start-game"]');
    
    // Wait for game to start
    await expect(page.locator('[data-testid="game-arena"]')).toBeVisible({ timeout: 10000 });

    // Wait for items to spawn (should happen automatically)
    await page.waitForTimeout(1000);
    
    // Check that items are present in the DOM
    const items = page.locator('[data-testid^="item-"]');
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThan(0);

    // Get the first item
    const firstItem = items.first();
    await expect(firstItem).toBeVisible();

    // Move mouse over the item to trigger letter prompt
    const itemBox = await firstItem.boundingBox();
    if (itemBox) {
      await page.mouse.move(itemBox.x + itemBox.width / 2, itemBox.y + itemBox.height / 2);
      
      // Wait for letter prompt to appear
      await expect(page.locator('[data-testid="letter-prompt"]')).toBeVisible({ timeout: 5001 });
      
      // Get the letter to press
      const letterText = await page.locator('[data-testid="text-letter"]').textContent();
      expect(letterText).toBeTruthy();
      
      const letter = letterText!.trim();
      const requiresShift = letter === letter.toUpperCase() && letter !== letter.toLowerCase();

      // Get initial score
      const initialScoreText = await page.locator('[data-testid="text-score-TestPlayer1"]').textContent();
      const initialScore = parseInt(initialScoreText || '0');

      // Press the correct key
      if (requiresShift) {
        await page.keyboard.press(`Shift+${letter.toLowerCase()}`);
      } else {
        await page.keyboard.press(letter.toLowerCase());
      }

      // Wait a bit for the score update via WebSocket
      await page.waitForTimeout(500);

      // Verify score increased
      const newScoreText = await page.locator('[data-testid="text-score-TestPlayer1"]').textContent();
      const newScore = parseInt(newScoreText || '0');
      expect(newScore).toBeGreaterThan(initialScore);

      // Verify letter prompt disappears
      await expect(page.locator('[data-testid="letter-prompt"]')).not.toBeVisible({ timeout: 2000 });
      
      // Verify the item was removed from DOM (collected)
      await expect(firstItem).not.toBeVisible({ timeout: 2000 });
    }
  });

  test('should spawn new items after collection', async ({ page }) => {
    // Create room and start game
    await page.goto('http://localhost:5001');
    await page.fill('[data-testid="input-player-name"]', 'ItemSpawnTester');
    await page.click('[data-testid="button-create-room"]');
    await page.click('[data-testid="button-start-game"]');
    
    await expect(page.locator('[data-testid="game-arena"]')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Count initial items
    const initialItems = page.locator('[data-testid^="item-"]');
    const initialCount = await initialItems.count();
    expect(initialCount).toBeGreaterThan(0);

    // Collect one item
    const firstItem = initialItems.first();
    const itemBox = await firstItem.boundingBox();
    if (itemBox) {
      await page.mouse.move(itemBox.x + itemBox.width / 2, itemBox.y + itemBox.height / 2);
      await expect(page.locator('[data-testid="letter-prompt"]')).toBeVisible({ timeout: 3000 });
      
      const letterText = await page.locator('[data-testid="text-letter"]').textContent();
      const letter = letterText!.trim();
      const requiresShift = letter === letter.toUpperCase() && letter !== letter.toLowerCase();

      if (requiresShift) {
        await page.keyboard.press(`Shift+${letter.toLowerCase()}`);
      } else {
        await page.keyboard.press(letter.toLowerCase());
      }

      // Wait for item to be removed
      await page.waitForTimeout(500);
    }

    // Wait for new items to spawn
    await page.waitForTimeout(2000);

    // Verify items are still present (new ones spawned)
    const newItems = page.locator('[data-testid^="item-"]');
    const newCount = await newItems.count();
    expect(newCount).toBeGreaterThan(0);
  });
});

test.describe('WebSocket Integration - Player Reconnection', () => {
  test('should maintain game state when player reconnects within grace period', async ({ browser }) => {
    // Create two browser contexts for two players
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Player 1 creates room
      await page1.goto('http://localhost:5001');
      await page1.fill('[data-testid="input-player-name"]', 'Player1');
      await page1.click('[data-testid="button-create-room"]');
      
      await expect(page1.locator('[data-testid="text-room-code"]')).toBeVisible();
      const roomCode = await page1.locator('[data-testid="text-room-code"]').textContent();

      // Player 2 joins
      await page2.goto('http://localhost:5001');
      await page2.fill('[data-testid="input-player-name"]', 'Player2');
      await page2.click('[data-testid="button-join-room"]');
      await page2.fill('[data-testid="input-room-code"]', roomCode!);
      await page2.click('[data-testid="button-join"]');

      // Wait for Player 2 to appear in lobby
      await expect(page1.locator('text=Player2')).toBeVisible();

      // Start game
      await page1.click('[data-testid="button-start-game"]');
      await expect(page1.locator('[data-testid="game-arena"]')).toBeVisible({ timeout: 10000 });
      await expect(page2.locator('[data-testid="game-arena"]')).toBeVisible({ timeout: 10000 });

      // Verify both players are in scoreboard
      await expect(page1.locator('[data-testid="text-score-Player1"]')).toBeVisible();
      await expect(page1.locator('[data-testid="text-score-Player2"]')).toBeVisible();
      await expect(page2.locator('[data-testid="text-score-Player1"]')).toBeVisible();
      await expect(page2.locator('[data-testid="text-score-Player2"]')).toBeVisible();

      // Player 2 refreshes page (simulating disconnect/reconnect)
      await page2.reload();

      // Player 2 should be redirected to home (lost game state on client)
      // But should be able to rejoin within grace period
      await expect(page2.locator('[data-testid="input-player-name"]')).toBeVisible({ timeout: 5001 });
      
      // Rejoin with same name
      await page2.fill('[data-testid="input-player-name"]', 'Player2');
      await page2.click('[data-testid="button-join-room"]');
      await page2.fill('[data-testid="input-room-code"]', roomCode!);
      await page2.click('[data-testid="button-join"]');

      // Should rejoin the game in progress
      await expect(page2.locator('[data-testid="game-arena"]')).toBeVisible({ timeout: 10000 });

      // Verify Player 2 is still in the scoreboard on both screens
      await expect(page1.locator('[data-testid="text-score-Player2"]')).toBeVisible();
      await expect(page2.locator('[data-testid="text-score-Player2"]')).toBeVisible();
      
      // Verify game is still running
      await expect(page1.locator('[data-testid="game-arena"]')).toBeVisible();
      await expect(page2.locator('[data-testid="game-arena"]')).toBeVisible();
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('should remove player after grace period expires without reconnection', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Player 1 creates room
      await page1.goto('http://localhost:5001');
      await page1.fill('[data-testid="input-player-name"]', 'HostPlayer');
      await page1.click('[data-testid="button-create-room"]');
      
      await expect(page1.locator('[data-testid="text-room-code"]')).toBeVisible();
      const roomCode = await page1.locator('[data-testid="text-room-code"]').textContent();

      // Player 2 joins
      await page2.goto('http://localhost:5001');
      await page2.fill('[data-testid="input-player-name"]', 'DisconnectPlayer');
      await page2.click('[data-testid="button-join-room"]');
      await page2.fill('[data-testid="input-room-code"]', roomCode!);
      await page2.click('[data-testid="button-join"]');

      await expect(page1.locator('text=DisconnectPlayer')).toBeVisible();

      // Start game
      await page1.click('[data-testid="button-start-game"]');
      await expect(page1.locator('[data-testid="game-arena"]')).toBeVisible({ timeout: 10000 });

      // Verify both players in scoreboard
      await expect(page1.locator('[data-testid="text-score-DisconnectPlayer"]')).toBeVisible();

      // Close Player 2's page (disconnect)
      await page2.close();

      // Wait for grace period to expire (30 seconds + buffer)
      // Note: This test will take ~35 seconds to complete
      await page1.waitForTimeout(35001);

      // Verify DisconnectPlayer was removed from scoreboard
      await expect(page1.locator('[data-testid="text-score-DisconnectPlayer"]')).not.toBeVisible({ timeout: 5001 });
      
      // Verify HostPlayer is still there
      await expect(page1.locator('[data-testid="text-score-HostPlayer"]')).toBeVisible();
    } finally {
      await context1.close();
      if (!page2.isClosed()) {
        await context2.close();
      }
    }
  });
});

test.describe('WebSocket Integration - Multiplayer Score Synchronization', () => {
  test('should synchronize scores in real-time between multiple players', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Player 1 creates room
      await page1.goto('http://localhost:5001');
      await page1.fill('[data-testid="input-player-name"]', 'SyncPlayer1');
      await page1.click('[data-testid="button-create-room"]');
      
      await expect(page1.locator('[data-testid="text-room-code"]')).toBeVisible();
      const roomCode = await page1.locator('[data-testid="text-room-code"]').textContent();

      // Player 2 joins
      await page2.goto('http://localhost:5001');
      await page2.fill('[data-testid="input-player-name"]', 'SyncPlayer2');
      await page2.click('[data-testid="button-join-room"]');
      await page2.fill('[data-testid="input-room-code"]', roomCode!);
      await page2.click('[data-testid="button-join"]');

      await expect(page1.locator('text=SyncPlayer2')).toBeVisible();

      // Start game
      await page1.click('[data-testid="button-start-game"]');
      await expect(page1.locator('[data-testid="game-arena"]')).toBeVisible({ timeout: 10000 });
      await expect(page2.locator('[data-testid="game-arena"]')).toBeVisible({ timeout: 10000 });

      // Get initial scores
      const p1InitialScore1 = await page1.locator('[data-testid="text-score-SyncPlayer1"]').textContent();
      const p1InitialScore2 = await page2.locator('[data-testid="text-score-SyncPlayer1"]').textContent();
      expect(p1InitialScore1).toBe('0');
      expect(p1InitialScore2).toBe('0');

      await page1.waitForTimeout(1000);

      // Player 1 collects an item
      const items1 = page1.locator('[data-testid^="item-"]');
      const firstItem1 = items1.first();
      const itemBox1 = await firstItem1.boundingBox();
      
      if (itemBox1) {
        await page1.mouse.move(itemBox1.x + itemBox1.width / 2, itemBox1.y + itemBox1.height / 2);
        await expect(page1.locator('[data-testid="letter-prompt"]')).toBeVisible({ timeout: 3000 });
        
        const letterText1 = await page1.locator('[data-testid="text-letter"]').textContent();
        const letter1 = letterText1!.trim();
        const requiresShift1 = letter1 === letter1.toUpperCase() && letter1 !== letter1.toLowerCase();

        if (requiresShift1) {
          await page1.keyboard.press(`Shift+${letter1.toLowerCase()}`);
        } else {
          await page1.keyboard.press(letter1.toLowerCase());
        }

        // Wait for WebSocket sync
        await page1.waitForTimeout(1000);

        // Verify score updated on Player 1's screen
        const p1NewScore1 = await page1.locator('[data-testid="text-score-SyncPlayer1"]').textContent();
        expect(parseInt(p1NewScore1 || '0')).toBeGreaterThan(0);

        // Verify score also updated on Player 2's screen (real-time sync)
        const p1NewScore2 = await page2.locator('[data-testid="text-score-SyncPlayer1"]').textContent();
        expect(p1NewScore2).toBe(p1NewScore1);
      }

      await page2.waitForTimeout(1000);

      // Player 2 collects an item
      const items2 = page2.locator('[data-testid^="item-"]');
      const firstItem2 = items2.first();
      const itemBox2 = await firstItem2.boundingBox();
      
      if (itemBox2) {
        await page2.mouse.move(itemBox2.x + itemBox2.width / 2, itemBox2.y + itemBox2.height / 2);
        await expect(page2.locator('[data-testid="letter-prompt"]')).toBeVisible({ timeout: 3000 });
        
        const letterText2 = await page2.locator('[data-testid="text-letter"]').textContent();
        const letter2 = letterText2!.trim();
        const requiresShift2 = letter2 === letter2.toUpperCase() && letter2 !== letter2.toLowerCase();

        if (requiresShift2) {
          await page2.keyboard.press(`Shift+${letter2.toLowerCase()}`);
        } else {
          await page2.keyboard.press(letter2.toLowerCase());
        }

        // Wait for WebSocket sync
        await page2.waitForTimeout(1000);

        // Verify score updated on Player 2's screen
        const p2NewScore2 = await page2.locator('[data-testid="text-score-SyncPlayer2"]').textContent();
        expect(parseInt(p2NewScore2 || '0')).toBeGreaterThan(0);

        // Verify score also updated on Player 1's screen (real-time sync)
        const p2NewScore1 = await page1.locator('[data-testid="text-score-SyncPlayer2"]').textContent();
        expect(p2NewScore1).toBe(p2NewScore2);
      }

      // Verify both players see the same scores
      const finalP1Score1 = await page1.locator('[data-testid="text-score-SyncPlayer1"]').textContent();
      const finalP1Score2 = await page2.locator('[data-testid="text-score-SyncPlayer1"]').textContent();
      expect(finalP1Score1).toBe(finalP1Score2);

      const finalP2Score1 = await page1.locator('[data-testid="text-score-SyncPlayer2"]').textContent();
      const finalP2Score2 = await page2.locator('[data-testid="text-score-SyncPlayer2"]').textContent();
      expect(finalP2Score1).toBe(finalP2Score2);

    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('should keep scoreboard sorted by score across all players', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const context3 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    const page3 = await context3.newPage();

    try {
      // Player 1 creates room
      await page1.goto('http://localhost:5001');
      await page1.fill('[data-testid="input-player-name"]', 'Alpha');
      await page1.click('[data-testid="button-create-room"]');
      
      await expect(page1.locator('[data-testid="text-room-code"]')).toBeVisible();
      const roomCode = await page1.locator('[data-testid="text-room-code"]').textContent();

      // Player 2 joins
      await page2.goto('http://localhost:5001');
      await page2.fill('[data-testid="input-player-name"]', 'Beta');
      await page2.click('[data-testid="button-join-room"]');
      await page2.fill('[data-testid="input-room-code"]', roomCode!);
      await page2.click('[data-testid="button-join"]');

      // Player 3 joins
      await page3.goto('http://localhost:5001');
      await page3.fill('[data-testid="input-player-name"]', 'Gamma');
      await page3.click('[data-testid="button-join-room"]');
      await page3.fill('[data-testid="input-room-code"]', roomCode!);
      await page3.click('[data-testid="button-join"]');

      await expect(page1.locator('text=Beta')).toBeVisible();
      await expect(page1.locator('text=Gamma')).toBeVisible();

      // Start game
      await page1.click('[data-testid="button-start-game"]');
      await expect(page1.locator('[data-testid="game-arena"]')).toBeVisible({ timeout: 10000 });
      await expect(page2.locator('[data-testid="game-arena"]')).toBeVisible({ timeout: 10000 });
      await expect(page3.locator('[data-testid="game-arena"]')).toBeVisible({ timeout: 10000 });

      await page1.waitForTimeout(1000);

      // All players collect items (different amounts)
      // Player 1 collects 1 item
      const collectItem = async (page: any, playerName: string) => {
        const items = page.locator('[data-testid^="item-"]');
        const item = items.first();
        const box = await item.boundingBox();
        
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.locator('[data-testid="letter-prompt"]').waitFor({ state: 'visible', timeout: 3000 });
          
          const letterText = await page.locator('[data-testid="text-letter"]').textContent();
          const letter = letterText!.trim();
          const requiresShift = letter === letter.toUpperCase() && letter !== letter.toLowerCase();

          if (requiresShift) {
            await page.keyboard.press(`Shift+${letter.toLowerCase()}`);
          } else {
            await page.keyboard.press(letter.toLowerCase());
          }
          
          await page.waitForTimeout(800);
        }
      };

      // Collect items
      await collectItem(page2, 'Beta'); // Beta gets points
      await collectItem(page2, 'Beta'); // Beta gets more points
      await collectItem(page3, 'Gamma'); // Gamma gets points

      await page1.waitForTimeout(1500);

      // Check scoreboard order on all pages
      const checkScoreboardOrder = async (page: any) => {
        const playerNames = await page.locator('[data-testid^="player-rank-"]').allTextContents();
        const scores = await Promise.all(
          ['Alpha', 'Beta', 'Gamma'].map(async name => {
            const scoreText = await page.locator(`[data-testid="text-score-${name}"]`).textContent();
            return parseInt(scoreText || '0');
          })
        );

        // Verify scores are in descending order in the scoreboard
        const sortedScores = [...scores].sort((a, b) => b - a);
        
        // The first player in the list should have the highest score
        const firstPlayerScore = await page.locator('[data-testid^="text-score-"]').first().textContent();
        expect(parseInt(firstPlayerScore || '0')).toBe(sortedScores[0]);
      };

      await checkScoreboardOrder(page1);
      await checkScoreboardOrder(page2);
      await checkScoreboardOrder(page3);

    } finally {
      await context1.close();
      await context2.close();
      await context3.close();
    }
  });
});
