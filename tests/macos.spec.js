/**
 * macOS Web Desktop - Playwright Tests
 * Run with: npx playwright test
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'file://' + __dirname + '/../index.html';

// Helper to wait for boot
async function waitForBoot(page) {
  await page.goto(BASE_URL);
  // Wait for boot screen to disappear
  await page.waitForSelector('#boot-screen', { state: 'hidden', timeout: 10000 });
  // Wait for lock screen
  await page.waitForSelector('#lock-screen', { state: 'visible', timeout: 5000 });
}

// Helper to unlock
async function unlockScreen(page) {
  await page.click('#lock-screen');
  await page.waitForSelector('#lock-screen', { state: 'hidden', timeout: 5000 });
}

test.describe('Boot & Lock Screen', () => {
  test('boot screen shows progress and transitions to lock screen', async ({ page }) => {
    await page.goto(BASE_URL);

    // Boot screen should be visible
    const bootScreen = page.locator('#boot-screen');
    await expect(bootScreen).toBeVisible();

    // Apple logo should be present
    await expect(bootScreen.locator('.apple-logo')).toBeVisible();

    // Progress bar should exist
    await expect(bootScreen.locator('.progress-bar')).toBeVisible();

    // Wait for boot to complete
    await page.waitForSelector('#boot-screen', { state: 'hidden', timeout: 10000 });

    // Lock screen should appear
    const lockScreen = page.locator('#lock-screen');
    await expect(lockScreen).toBeVisible();

    // Time should be displayed
    await expect(lockScreen.locator('.lock-time')).toBeVisible();
    await expect(lockScreen.locator('.lock-date')).toBeVisible();
  });

  test('lock screen unlocks on click', async ({ page }) => {
    await waitForBoot(page);

    const lockScreen = page.locator('#lock-screen');
    await expect(lockScreen).toBeVisible();

    // Click to unlock
    await lockScreen.click();

    // Should transition to desktop
    await page.waitForSelector('#lock-screen', { state: 'hidden', timeout: 5000 });
    await expect(page.locator('#desktop')).toBeVisible();
  });
});

test.describe('Desktop & Menu Bar', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBoot(page);
    await unlockScreen(page);
  });

  test('menu bar is visible with correct items', async ({ page }) => {
    const menuBar = page.locator('#menu-bar');
    await expect(menuBar).toBeVisible();

    // Check menu items
    await expect(menuBar.locator('.menu-apple')).toBeVisible();
    await expect(menuBar.locator('.menu-item[data-menu="app"]')).toBeVisible();
    await expect(menuBar.locator('.menu-item[data-menu="file"]')).toBeVisible();
    await expect(menuBar.locator('.menu-item[data-menu="edit"]')).toBeVisible();
    await expect(menuBar.locator('.menu-item[data-menu="view"]')).toBeVisible();

    // Check right side items
    await expect(menuBar.locator('#menu-date')).toBeVisible();
    await expect(menuBar.locator('#menu-control-center')).toBeVisible();
    await expect(menuBar.locator('#menu-notifications')).toBeVisible();
  });

  test('apple menu opens and closes', async ({ page }) => {
    await page.click('.menu-apple');

    const appleMenu = page.locator('#apple-menu');
    await expect(appleMenu).toBeVisible();

    // Check menu items
    await expect(appleMenu.locator('text=关于本机')).toBeVisible();
    await expect(appleMenu.locator('text=系统设置...')).toBeVisible();
    await expect(appleMenu.locator('text=关机...')).toBeVisible();

    // Click elsewhere to close
    await page.click('#desktop');
    await expect(appleMenu).toBeHidden();
  });

  test('desktop icons are visible and clickable', async ({ page }) => {
    const desktopIcons = page.locator('#desktop-icons');
    await expect(desktopIcons).toBeVisible();

    // Check all app icons exist
    const apps = ['finder', 'safari', 'settings', 'terminal', 'textedit', 'notes', 'calendar', 'photos'];
    for (const app of apps) {
      const icon = desktopIcons.locator(`[data-app="${app}"]`);
      await expect(icon).toBeVisible();
    }
  });
});

test.describe('Dock', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBoot(page);
    await unlockScreen(page);
  });

  test('dock is visible with all app icons', async ({ page }) => {
    const dock = page.locator('#dock');
    await expect(dock).toBeVisible();

    // Check dock items
    const apps = ['finder', 'safari', 'terminal', 'textedit', 'notes', 'calendar', 'photos', 'settings'];
    for (const app of apps) {
      const item = dock.locator(`[data-app="${app}"]`);
      await expect(item).toBeVisible();
    }
  });

  test('dock item opens app on click', async ({ page }) => {
    await page.click('.dock-item[data-app="finder"]');

    // Window should appear
    await page.waitForSelector('.mac-window', { timeout: 5000 });
    const window = page.locator('.mac-window');
    await expect(window).toBeVisible();

    // Window should have Finder title
    await expect(window.locator('.window-title')).toContainText('Finder');
  });

  test('dock shows active indicator for open apps', async ({ page }) => {
    await page.click('.dock-item[data-app="finder"]');

    // Dock item should have active class
    const dockItem = page.locator('.dock-item[data-app="finder"]');
    await expect(dockItem).toHaveClass(/active/);
  });
});

test.describe('Window Manager', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBoot(page);
    await unlockScreen(page);
  });

  test('window opens with correct structure', async ({ page }) => {
    await page.click('.dock-item[data-app="finder"]');

    const window = page.locator('.mac-window');
    await expect(window).toBeVisible();

    // Check window structure
    await expect(window.locator('.window-titlebar')).toBeVisible();
    await expect(window.locator('.window-controls')).toBeVisible();
    await expect(window.locator('.window-btn.close')).toBeVisible();
    await expect(window.locator('.window-btn.minimize')).toBeVisible();
    await expect(window.locator('.window-btn.maximize')).toBeVisible();
    await expect(window.locator('.window-content')).toBeVisible();
  });

  test('window close button works', async ({ page }) => {
    await page.click('.dock-item[data-app="finder"]');

    const window = page.locator('.mac-window');
    await expect(window).toBeVisible();

    // Click close button
    await window.locator('.window-btn.close').click();

    // Window should be removed
    await expect(window).toBeHidden();
  });

  test('window minimize button works', async ({ page }) => {
    await page.click('.dock-item[data-app="finder"]');

    const window = page.locator('.mac-window');
    await expect(window).toBeVisible();

    // Click minimize
    await window.locator('.window-btn.minimize').click();

    // Window should be minimized (hidden but still in DOM)
    await expect(window).toHaveClass(/minimized/);
  });

  test('window maximize/restore works', async ({ page }) => {
    await page.click('.dock-item[data-app="finder"]');

    const window = page.locator('.mac-window');
    await expect(window).toBeVisible();

    // Click maximize
    await window.locator('.window-btn.maximize').click();
    await expect(window).toHaveClass(/maximized/);

    // Click again to restore
    await window.locator('.window-btn.maximize').click();
    await expect(window).not.toHaveClass(/maximized/);
  });

  test('window can be dragged', async ({ page }) => {
    await page.click('.dock-item[data-app="finder"]');

    const window = page.locator('.mac-window');
    await expect(window).toBeVisible();

    // Get initial position
    const initialBox = await window.boundingBox();

    // Drag titlebar
    const titlebar = window.locator('.window-titlebar');
    await titlebar.dragTo(page.locator('#desktop'), {
      targetPosition: { x: 100, y: 100 }
    });

    // Position should have changed
    const newBox = await window.boundingBox();
    expect(newBox.x).not.toBe(initialBox.x);
  });

  test('multiple windows can be opened', async ({ page }) => {
    await page.click('.dock-item[data-app="finder"]');
    await page.click('.dock-item[data-app="safari"]');
    await page.click('.dock-item[data-app="terminal"]');

    const windows = page.locator('.mac-window');
    await expect(windows).toHaveCount(3);
  });

  test('window focus changes on click', async ({ page }) => {
    await page.click('.dock-item[data-app="finder"]');
    await page.click('.dock-item[data-app="safari"]');

    const windows = page.locator('.mac-window');
    await expect(windows).toHaveCount(2);

    // Safari should be focused (last opened)
    const safariWindow = windows.nth(1);
    await expect(safariWindow).toHaveClass(/focused/);

    // Click Finder window to focus it
    const finderWindow = windows.nth(0);
    await finderWindow.click();
    await expect(finderWindow).toHaveClass(/focused/);
    await expect(safariWindow).not.toHaveClass(/focused/);
  });
});

test.describe('Applications', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBoot(page);
    await unlockScreen(page);
  });

  test('Finder app loads with sidebar and content', async ({ page }) => {
    await page.click('.dock-item[data-app="finder"]');

    const content = page.locator('.finder-window');
    await expect(content).toBeVisible();

    // Check sidebar
    await expect(content.locator('.finder-sidebar')).toBeVisible();
    await expect(content.locator('.finder-sidebar-item')).toHaveCount(5);

    // Check main area
    await expect(content.locator('.finder-main')).toBeVisible();
    await expect(content.locator('.finder-toolbar')).toBeVisible();
    await expect(content.locator('.finder-content')).toBeVisible();
  });

  test('Safari app loads with address bar', async ({ page }) => {
    await page.click('.dock-item[data-app="safari"]');

    const content = page.locator('.safari-content');
    await expect(content).toBeVisible();

    // Check toolbar
    await expect(content.locator('.safari-toolbar')).toBeVisible();
    await expect(content.locator('.safari-address-bar')).toBeVisible();
    await expect(content.locator('.safari-address-bar input')).toBeVisible();
  });

  test('Terminal app loads with prompt', async ({ page }) => {
    await page.click('.dock-item[data-app="terminal"]');

    const content = page.locator('.terminal-content');
    await expect(content).toBeVisible();

    // Check for prompt
    await expect(content.locator('.terminal-prompt')).toBeVisible();
    await expect(content.locator('.terminal-input')).toBeVisible();
  });

  test('TextEdit app loads with editor', async ({ page }) => {
    await page.click('.dock-item[data-app="textedit"]');

    const content = page.locator('.textedit-content');
    await expect(content).toBeVisible();

    // Check toolbar and editor
    await expect(content.locator('.textedit-toolbar')).toBeVisible();
    await expect(content.locator('.textedit-editor')).toBeVisible();
  });

  test('Notes app loads with sidebar and editor', async ({ page }) => {
    await page.click('.dock-item[data-app="notes"]');

    const content = page.locator('.notes-content');
    await expect(content).toBeVisible();

    await expect(content.locator('.notes-sidebar')).toBeVisible();
    await expect(content.locator('.notes-list')).toBeVisible();
    await expect(content.locator('.notes-editor')).toBeVisible();
  });

  test('Calendar app loads with grid', async ({ page }) => {
    await page.click('.dock-item[data-app="calendar"]');

    const content = page.locator('.calendar-content');
    await expect(content).toBeVisible();

    await expect(content.locator('.calendar-header')).toBeVisible();
    await expect(content.locator('.calendar-grid')).toBeVisible();

    // Should have day headers
    const dayHeaders = content.locator('.calendar-day-header');
    await expect(dayHeaders).toHaveCount(7);
  });

  test('Settings app loads with sections', async ({ page }) => {
    await page.click('.dock-item[data-app="settings"]');

    const content = page.locator('.settings-content');
    await expect(content).toBeVisible();

    await expect(content.locator('.settings-sidebar')).toBeVisible();
    await expect(content.locator('.settings-main')).toBeVisible();

    // Check sidebar items
    const items = content.locator('.settings-sidebar-item');
    await expect(items).toHaveCount(6);
  });
});

test.describe('TextEdit Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBoot(page);
    await unlockScreen(page);
    await page.click('.dock-item[data-app="textedit"]');
  });

  test('can type text in editor', async ({ page }) => {
    const editor = page.locator('.textedit-editor');
    await expect(editor).toBeVisible();

    await editor.fill('Hello macOS Web Desktop!');
    await expect(editor).toHaveValue('Hello macOS Web Desktop!');
  });

  test('can save file', async ({ page }) => {
    const editor = page.locator('.textedit-editor');
    await editor.fill('Test content for saving');

    // Click save button
    await page.click('[data-action="save"]');

    // Should show save dialog (prompt)
    // In test, we handle the prompt
    page.on('dialog', dialog => dialog.accept('test-file.txt'));

    // Title should update
    const title = page.locator('.window-title');
    await expect(title).toContainText('test-file.txt');
  });

  test('toolbar buttons are clickable', async ({ page }) => {
    await expect(page.locator('[data-action="bold"]')).toBeVisible();
    await expect(page.locator('[data-action="italic"]')).toBeVisible();
    await expect(page.locator('[data-action="underline"]')).toBeVisible();
    await expect(page.locator('[data-action="save"]')).toBeVisible();
  });
});

test.describe('Spotlight', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBoot(page);
    await unlockScreen(page);
  });

  test('Spotlight opens with Cmd+Space', async ({ page }) => {
    await page.keyboard.press('Control+Space');

    const spotlight = page.locator('#spotlight');
    await expect(spotlight).toBeVisible();

    await expect(spotlight.locator('#spotlight-input')).toBeFocused();
  });

  test('Spotlight closes with Escape', async ({ page }) => {
    await page.keyboard.press('Control+Space');
    await expect(page.locator('#spotlight')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('#spotlight')).toBeHidden();
  });

  test('Spotlight shows search results', async ({ page }) => {
    await page.keyboard.press('Control+Space');

    const input = page.locator('#spotlight-input');
    await input.fill('Finder');

    // Results should appear
    await page.waitForTimeout(300);
    const results = page.locator('.spotlight-result');
    await expect(results.first()).toBeVisible();
  });
});

test.describe('Control Center', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBoot(page);
    await unlockScreen(page);
  });

  test('Control Center opens on click', async ({ page }) => {
    await page.click('#menu-control-center');

    const cc = page.locator('#control-center');
    await expect(cc).toBeVisible();

    // Check tiles
    await expect(cc.locator('.cc-tile')).toHaveCount(6);
  });

  test('Control Center tiles toggle', async ({ page }) => {
    await page.click('#menu-control-center');

    const tile = page.locator('.cc-tile[data-toggle="airplane"]');
    await expect(tile).not.toHaveClass(/active/);

    await tile.click();
    await expect(tile).toHaveClass(/active/);

    await tile.click();
    await expect(tile).not.toHaveClass(/active/);
  });
});

test.describe('Notification Center', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBoot(page);
    await unlockScreen(page);
  });

  test('Notification Center opens on click', async ({ page }) => {
    await page.click('#menu-notifications');

    const nc = page.locator('#notification-center');
    await expect(nc).toBeVisible();

    // Check notifications
    await expect(nc.locator('.nc-item')).toHaveCount(3);
  });
});

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBoot(page);
    await unlockScreen(page);
  });

  test('theme can be changed in settings', async ({ page }) => {
    await page.click('.dock-item[data-app="settings"]');

    // Click appearance section
    await page.click('.settings-sidebar-item[data-section="appearance"]');

    // Change theme to dark
    await page.selectOption('#theme-select', 'dark');

    // Check if dark theme is applied
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('Virtual File System', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBoot(page);
    await unlockScreen(page);
  });

  test('Finder shows default folders', async ({ page }) => {
    await page.click('.dock-item[data-app="finder"]');

    // Check default folders in sidebar
    await expect(page.locator('.finder-sidebar-item:has-text("桌面")')).toBeVisible();
    await expect(page.locator('.finder-sidebar-item:has-text("文稿")')).toBeVisible();
    await expect(page.locator('.finder-sidebar-item:has-text("下载")')).toBeVisible();
  });

  test('Terminal can list files', async ({ page }) => {
    await page.click('.dock-item[data-app="terminal"]');

    const input = page.locator('.terminal-input');
    await input.fill('ls');
    await input.press('Enter');

    // Should show output
    await page.waitForTimeout(200);
    const output = page.locator('.terminal-output');
    await expect(output).toContainText('桌面');
  });
});

test.describe('Persistence', () => {
  test('settings persist after reload', async ({ page }) => {
    await waitForBoot(page);
    await unlockScreen(page);

    // Open settings and change theme
    await page.click('.dock-item[data-app="settings"]');
    await page.click('.settings-sidebar-item[data-section="appearance"]');
    await page.selectOption('#theme-select', 'dark');

    // Reload page
    await page.reload();
    await waitForBoot(page);
    await unlockScreen(page);

    // Theme should still be dark
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('Responsive Layout', () => {
  test('layout adapts to mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await waitForBoot(page);
    await unlockScreen(page);

    // Desktop should still be visible
    await expect(page.locator('#desktop')).toBeVisible();
    await expect(page.locator('#dock')).toBeVisible();
    await expect(page.locator('#menu-bar')).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBoot(page);
    await unlockScreen(page);
  });

  test('console has no errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for any async errors
    await page.waitForTimeout(2000);

    // Filter out expected errors (like missing favicon)
    const unexpectedErrors = errors.filter(e => !e.includes('favicon'));
    expect(unexpectedErrors).toHaveLength(0);
  });

  test('app handles rapid window open/close', async ({ page }) => {
    // Rapidly open and close windows
    for (let i = 0; i < 5; i++) {
      await page.click('.dock-item[data-app="finder"]');
      await page.waitForTimeout(100);
      const window = page.locator('.mac-window');
      if (await window.isVisible()) {
        await window.locator('.window-btn.close').click();
      }
    }

    // Should not crash - desktop still visible
    await expect(page.locator('#desktop')).toBeVisible();
  });
});

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBoot(page);
    await unlockScreen(page);
  });

  test('Cmd+W closes active window', async ({ page }) => {
    await page.click('.dock-item[data-app="finder"]');
    await expect(page.locator('.mac-window')).toBeVisible();

    await page.keyboard.press('Control+w');
    await expect(page.locator('.mac-window')).toBeHidden();
  });

  test('Cmd+N opens new window', async ({ page }) => {
    await page.keyboard.press('Control+n');
    await expect(page.locator('.mac-window')).toBeVisible();
  });
});
