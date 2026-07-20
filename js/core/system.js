/**
 * macOS Web Desktop - Core System
 * Unified window manager, virtual file system, theme engine, and app lifecycle
 */

// ============================================
// Configuration & State
// ============================================
const CONFIG = {
  bootDuration: 2500,
  screensaverTimeout: 60000,
  lockTimeout: 30000,
  autoSaveInterval: 5000,
  defaultWallpaper: 'assets/wallpapers/sonoma-light.svg',
  darkWallpaper: 'assets/wallpapers/sonoma-dark.svg',
  maxWindows: 20,
  minWindowWidth: 300,
  minWindowHeight: 200,
};

const APPS = {
  finder: { name: 'Finder', icon: 'assets/icons/finder.svg', width: 800, height: 500, canOpenMultiple: false },
  safari: { name: 'Safari', icon: 'assets/icons/safari.svg', width: 900, height: 600, canOpenMultiple: true },
  terminal: { name: '终端', icon: 'assets/icons/terminal.svg', width: 700, height: 450, canOpenMultiple: true },
  notes: { name: '备忘录', icon: 'assets/icons/notes.svg', width: 700, height: 500, canOpenMultiple: false },
  textedit: { name: '文本编辑', icon: 'assets/icons/textedit.svg', width: 700, height: 500, canOpenMultiple: true },
  calendar: { name: '日历', icon: 'assets/icons/calendar.svg', width: 700, height: 550, canOpenMultiple: false },
  photos: { name: '照片', icon: 'assets/icons/photos.svg', width: 800, height: 600, canOpenMultiple: false },
  settings: { name: '系统设置', icon: 'assets/icons/settings.svg', width: 700, height: 500, canOpenMultiple: false },
};

// ============================================
// Virtual File System
// ============================================
class VirtualFileSystem {
  constructor() {
    this.loadFromStorage();
    if (!this.root) {
      this.initDefaultFS();
    }
  }

  initDefaultFS() {
    const now = new Date().toISOString();
    this.root = {
      type: 'folder',
      name: '/',
      created: now,
      modified: now,
      children: {
        '桌面': { type: 'folder', name: '桌面', created: now, modified: now, children: {} },
        '文稿': { 
          type: 'folder', name: '文稿', created: now, modified: now, 
          children: {
            '欢迎使用.txt': { type: 'file', name: '欢迎使用.txt', content: '欢迎使用 macOS Web 桌面！\n\n这是一个功能完整的网页版 macOS 模拟系统。\n\n功能包括：\n- 虚拟文件系统\n- 多窗口管理\n- 文本编辑\n- Safari 浏览器\n- 终端模拟器\n- 备忘录\n- 日历\n- 照片管理\n\n所有数据保存在浏览器本地存储中。', created: now, modified: now },
            '备忘录笔记.txt': { type: 'file', name: '备忘录笔记.txt', content: '我的第一条备忘录笔记。\n\n可以在这里记录重要事项。', created: now, modified: now },
          }
        },
        '下载': { type: 'folder', name: '下载', created: now, modified: now, children: {} },
        '图片': { 
          type: 'folder', name: '图片', created: now, modified: now,
          children: {
            '截图1.png': { type: 'file', name: '截图1.png', content: '🖼️', created: now, modified: now },
            '截图2.png': { type: 'file', name: '截图2.png', content: '📸', created: now, modified: now },
          }
        },
        '应用程序': { type: 'folder', name: '应用程序', created: now, modified: now, children: {} },
      }
    };
    this.saveToStorage();
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('macos_vfs');
      if (data) {
        this.root = JSON.parse(data);
      }
    } catch (e) {
      console.warn('VFS load failed, initializing default');
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('macos_vfs', JSON.stringify(this.root));
    } catch (e) {
      console.warn('VFS save failed');
    }
  }

  resolvePath(path) {
    if (path === '/' || path === '') return this.root;
    const parts = path.split('/').filter(p => p);
    let current = this.root;
    for (const part of parts) {
      if (!current.children || !current.children[part]) return null;
      current = current.children[part];
    }
    return current;
  }

  listDir(path) {
    const node = this.resolvePath(path);
    if (!node || node.type !== 'folder') return [];
    return Object.values(node.children);
  }

  readFile(path) {
    const node = this.resolvePath(path);
    if (!node || node.type !== 'file') return null;
    return node.content;
  }

  writeFile(path, content) {
    const parts = path.split('/').filter(p => p);
    const filename = parts.pop();
    let current = this.root;
    for (const part of parts) {
      if (!current.children[part]) {
        current.children[part] = { type: 'folder', name: part, created: new Date().toISOString(), modified: new Date().toISOString(), children: {} };
      }
      current = current.children[part];
    }
    const now = new Date().toISOString();
    if (current.children[filename]) {
      current.children[filename].content = content;
      current.children[filename].modified = now;
    } else {
      current.children[filename] = { type: 'file', name: filename, content, created: now, modified: now };
    }
    this.saveToStorage();
    return true;
  }

  deleteFile(path) {
    const parts = path.split('/').filter(p => p);
    const filename = parts.pop();
    let current = this.root;
    for (const part of parts) {
      if (!current.children[part]) return false;
      current = current.children[part];
    }
    if (current.children[filename]) {
      delete current.children[filename];
      this.saveToStorage();
      return true;
    }
    return false;
  }

  createFolder(path) {
    const parts = path.split('/').filter(p => p);
    const folderName = parts.pop();
    let current = this.root;
    for (const part of parts) {
      if (!current.children[part]) {
        current.children[part] = { type: 'folder', name: part, created: new Date().toISOString(), modified: new Date().toISOString(), children: {} };
      }
      current = current.children[part];
    }
    if (!current.children[folderName]) {
      const now = new Date().toISOString();
      current.children[folderName] = { type: 'folder', name: folderName, created: now, modified: now, children: {} };
      this.saveToStorage();
      return true;
    }
    return false;
  }

  exists(path) {
    return this.resolvePath(path) !== null;
  }
}

// ============================================
// Theme Engine
// ============================================
class ThemeEngine {
  constructor() {
    this.currentTheme = localStorage.getItem('macos_theme') || 'auto';
    this.applyTheme(this.currentTheme);
    this.setupAutoTheme();
  }

  setupAutoTheme() {
    if (this.currentTheme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => this.applyTheme('auto'));
    }
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('macos_theme', theme);

    let effectiveTheme = theme;
    if (theme === 'auto') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', effectiveTheme);

    // Update wallpaper
    const desktop = document.getElementById('desktop');
    const lockScreen = document.getElementById('lock-screen');
    const wallpaper = effectiveTheme === 'dark' ? CONFIG.darkWallpaper : CONFIG.defaultWallpaper;

    if (desktop) desktop.style.backgroundImage = `url(${wallpaper})`;
    if (lockScreen) lockScreen.style.backgroundImage = `url(${wallpaper})`;

    // Dispatch event for apps
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: effectiveTheme } }));
  }

  getTheme() {
    return this.currentTheme;
  }

  isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }
}

// ============================================
// Window Manager
// ============================================
class WindowManager {
  constructor() {
    this.windows = new Map();
    this.zIndex = 100;
    this.activeWindowId = null;
    this.windowLayer = document.getElementById('window-layer');
    this.setupGlobalEvents();
  }

  createWindow(appId, options = {}) {
    const app = APPS[appId];
    if (!app) return null;

    // Check if single-instance app already open
    if (!app.canOpenMultiple) {
      for (const [id, win] of this.windows) {
        if (win.appId === appId && !win.minimized) {
          this.focusWindow(id);
          return id;
        }
      }
    }

    const windowId = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const width = options.width || app.width;
    const height = options.height || app.height;

    // Center window
    const screenW = window.innerWidth;
    const screenH = window.innerHeight - 28; // menu bar
    const left = Math.max(20, (screenW - width) / 2 + (this.windows.size * 20) % 100);
    const top = Math.max(48, (screenH - height) / 2 + (this.windows.size * 20) % 100);

    const winEl = document.createElement('div');
    winEl.className = 'mac-window focused';
    winEl.id = windowId;
    winEl.style.width = `${width}px`;
    winEl.style.height = `${height}px`;
    winEl.style.left = `${left}px`;
    winEl.style.top = `${top}px`;
    winEl.style.zIndex = ++this.zIndex;

    // Title bar
    const titlebar = document.createElement('div');
    titlebar.className = 'window-titlebar';
    titlebar.innerHTML = `
      <div class="window-controls">
        <button class="window-btn close" data-action="close" title="关闭"></button>
        <button class="window-btn minimize" data-action="minimize" title="最小化"></button>
        <button class="window-btn maximize" data-action="maximize" title="最大化"></button>
      </div>
      <div class="window-title">${options.title || app.name}</div>
      <div class="window-toolbar"></div>
    `;

    // Content area
    const content = document.createElement('div');
    content.className = 'window-content';
    content.id = `${windowId}-content`;

    // Resize handles
    const handles = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'];
    handles.forEach(dir => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-${dir}`;
      handle.dataset.resize = dir;
      winEl.appendChild(handle);
    });

    winEl.appendChild(titlebar);
    winEl.appendChild(content);
    this.windowLayer.appendChild(winEl);

    // Store window data
    this.windows.set(windowId, {
      id: windowId,
      appId,
      element: winEl,
      title: options.title || app.name,
      minimized: false,
      maximized: false,
      fullscreen: false,
      prevState: null,
      appInstance: null,
    });

    // Setup events
    this.setupWindowEvents(windowId, winEl, titlebar);
    this.focusWindow(windowId);
    this.updateDock();

    // Initialize app
    this.initApp(windowId, appId, options);

    return windowId;
  }

  initApp(windowId, appId, options) {
    const win = this.windows.get(windowId);
    const content = document.getElementById(`${windowId}-content`);

    // App initialization
    switch (appId) {
      case 'finder':
        win.appInstance = new FinderApp(windowId, content, options);
        break;
      case 'safari':
        win.appInstance = new SafariApp(windowId, content, options);
        break;
      case 'terminal':
        win.appInstance = new TerminalApp(windowId, content, options);
        break;
      case 'notes':
        win.appInstance = new NotesApp(windowId, content, options);
        break;
      case 'textedit':
        win.appInstance = new TextEditApp(windowId, content, options);
        break;
      case 'calendar':
        win.appInstance = new CalendarApp(windowId, content, options);
        break;
      case 'photos':
        win.appInstance = new PhotosApp(windowId, content, options);
        break;
      case 'settings':
        win.appInstance = new SettingsApp(windowId, content, options);
        break;
    }
  }

  setupWindowEvents(windowId, winEl, titlebar) {
    // Focus on click
    winEl.addEventListener('mousedown', () => this.focusWindow(windowId));

    // Window controls
    titlebar.querySelectorAll('.window-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        switch (action) {
          case 'close': this.closeWindow(windowId); break;
          case 'minimize': this.minimizeWindow(windowId); break;
          case 'maximize': this.toggleMaximize(windowId); break;
        }
      });
    });

    // Dragging
    let isDragging = false;
    let dragOffsetX, dragOffsetY;

    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.window-btn')) return;
      const win = this.windows.get(windowId);
      if (win.maximized || win.fullscreen) return;

      isDragging = true;
      dragOffsetX = e.clientX - winEl.offsetLeft;
      dragOffsetY = e.clientY - winEl.offsetTop;
      winEl.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = e.clientX - dragOffsetX;
      const y = e.clientY - dragOffsetY;
      winEl.style.left = `${Math.max(0, x)}px`;
      winEl.style.top = `${Math.max(28, y)}px`;
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        winEl.style.transition = '';
      }
    });

    // Resizing
    let isResizing = false;
    let resizeDir = '';
    let startX, startY, startW, startH, startL, startT;

    winEl.querySelectorAll('.resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        const win = this.windows.get(windowId);
        if (win.maximized || win.fullscreen) return;

        isResizing = true;
        resizeDir = handle.dataset.resize;
        startX = e.clientX;
        startY = e.clientY;
        startW = winEl.offsetWidth;
        startH = winEl.offsetHeight;
        startL = winEl.offsetLeft;
        startT = winEl.offsetTop;
        winEl.style.transition = 'none';
      });
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (resizeDir.includes('e')) {
        const newW = Math.max(CONFIG.minWindowWidth, startW + dx);
        winEl.style.width = `${newW}px`;
      }
      if (resizeDir.includes('s')) {
        const newH = Math.max(CONFIG.minWindowHeight, startH + dy);
        winEl.style.height = `${newH}px`;
      }
      if (resizeDir.includes('w')) {
        const newW = Math.max(CONFIG.minWindowWidth, startW - dx);
        if (newW > CONFIG.minWindowWidth) {
          winEl.style.width = `${newW}px`;
          winEl.style.left = `${startL + dx}px`;
        }
      }
      if (resizeDir.includes('n')) {
        const newH = Math.max(CONFIG.minWindowHeight, startH - dy);
        if (newH > CONFIG.minWindowHeight) {
          winEl.style.height = `${newH}px`;
          winEl.style.top = `${startT + dy}px`;
        }
      }
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        winEl.style.transition = '';
      }
    });
  }

  focusWindow(windowId) {
    if (!this.windows.has(windowId)) return;

    // Unfocus previous
    if (this.activeWindowId && this.windows.has(this.activeWindowId)) {
      const prev = this.windows.get(this.activeWindowId);
      prev.element.classList.remove('focused');
    }

    // Focus new
    const win = this.windows.get(windowId);
    win.element.style.zIndex = ++this.zIndex;
    win.element.classList.add('focused');
    this.activeWindowId = windowId;

    // Update menu bar title
    const menuTitle = document.querySelector('.menu-item[data-menu="app"]');
    if (menuTitle) menuTitle.textContent = win.title;

    this.updateDock();
  }

  closeWindow(windowId) {
    const win = this.windows.get(windowId);
    if (!win) return;

    if (win.appInstance && win.appInstance.onClose) {
      win.appInstance.onClose();
    }

    win.element.remove();
    this.windows.delete(windowId);

    if (this.activeWindowId === windowId) {
      this.activeWindowId = null;
      // Focus next window
      let maxZ = 0;
      let nextWin = null;
      for (const [id, w] of this.windows) {
        if (!w.minimized && w.element.style.zIndex > maxZ) {
          maxZ = w.element.style.zIndex;
          nextWin = id;
        }
      }
      if (nextWin) this.focusWindow(nextWin);
    }

    this.updateDock();
  }

  minimizeWindow(windowId) {
    const win = this.windows.get(windowId);
    if (!win) return;

    win.minimized = true;
    win.element.classList.add('minimized');

    if (this.activeWindowId === windowId) {
      this.activeWindowId = null;
      let maxZ = 0;
      let nextWin = null;
      for (const [id, w] of this.windows) {
        if (!w.minimized && w.element.style.zIndex > maxZ) {
          maxZ = w.element.style.zIndex;
          nextWin = id;
        }
      }
      if (nextWin) this.focusWindow(nextWin);
    }

    this.updateDock();
  }

  restoreWindow(windowId) {
    const win = this.windows.get(windowId);
    if (!win) return;

    win.minimized = false;
    win.element.classList.remove('minimized');
    this.focusWindow(windowId);
    this.updateDock();
  }

  toggleMaximize(windowId) {
    const win = this.windows.get(windowId);
    if (!win) return;

    if (win.maximized) {
      win.maximized = false;
      win.element.classList.remove('maximized');
      if (win.prevState) {
        win.element.style.left = win.prevState.left;
        win.element.style.top = win.prevState.top;
        win.element.style.width = win.prevState.width;
        win.element.style.height = win.prevState.height;
      }
    } else {
      win.prevState = {
        left: win.element.style.left,
        top: win.element.style.top,
        width: win.element.style.width,
        height: win.element.style.height,
      };
      win.maximized = true;
      win.element.classList.add('maximized');
    }

    this.focusWindow(windowId);
  }

  toggleFullscreen(windowId) {
    const win = this.windows.get(windowId);
    if (!win) return;

    if (win.fullscreen) {
      win.fullscreen = false;
      win.element.classList.remove('fullscreen');
      if (win.prevState) {
        win.element.style.left = win.prevState.left;
        win.element.style.top = win.prevState.top;
        win.element.style.width = win.prevState.width;
        win.element.style.height = win.prevState.height;
      }
    } else {
      if (!win.maximized) {
        win.prevState = {
          left: win.element.style.left,
          top: win.element.style.top,
          width: win.element.style.width,
          height: win.element.style.height,
        };
      }
      win.fullscreen = true;
      win.maximized = false;
      win.element.classList.remove('maximized');
      win.element.classList.add('fullscreen');
    }
  }

  updateDock() {
    document.querySelectorAll('.dock-item').forEach(item => {
      const appId = item.dataset.app;
      if (!appId) return;

      let hasOpen = false;
      let hasMinimized = false;

      for (const [id, win] of this.windows) {
        if (win.appId === appId) {
          hasOpen = true;
          if (win.minimized) hasMinimized = true;
        }
      }

      item.classList.toggle('active', hasOpen);
      const indicator = item.querySelector('.dock-indicator');
      if (indicator) {
        indicator.style.background = hasMinimized ? 'var(--mac-yellow)' : (hasOpen ? 'var(--text-primary)' : 'var(--text-secondary)');
      }
    });
  }

  setupGlobalEvents() {
    // Close all windows shortcut
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close menus, spotlight, etc.
        this.closeAllMenus();
      }
    });
  }

  closeAllMenus() {
    document.querySelectorAll('.menu-dropdown, #control-center, #notification-center, #spotlight, .context-menu').forEach(el => {
      el.classList.remove('show');
    });
  }

  getWindowById(windowId) {
    return this.windows.get(windowId);
  }

  getWindowsByApp(appId) {
    return Array.from(this.windows.values()).filter(w => w.appId === appId);
  }
}

// ============================================
// Boot Manager
// ============================================
class BootManager {
  constructor() {
    this.bootScreen = document.getElementById('boot-screen');
    this.lockScreen = document.getElementById('lock-screen');
    this.desktop = document.getElementById('desktop');
    this.progressFill = document.querySelector('.progress-fill');
  }

  async boot() {
    // Simulate boot progress
    const steps = [0, 20, 45, 70, 90, 100];
    for (const progress of steps) {
      await this.delay(300 + Math.random() * 400);
      this.progressFill.style.width = `${progress}%`;
    }

    await this.delay(300);
    this.bootScreen.style.opacity = '0';

    await this.delay(500);
    this.bootScreen.classList.add('hidden');
    this.showLockScreen();
  }

  showLockScreen() {
    this.updateLockTime();
    this.lockScreen.style.display = 'flex';

    // Auto-update time
    this.timeInterval = setInterval(() => this.updateLockTime(), 1000);

    // Unlock on click/space
    const unlockHandler = (e) => {
      if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'Enter') return;
      this.unlock();
      document.removeEventListener('click', unlockHandler);
      document.removeEventListener('keydown', unlockHandler);
    };

    document.addEventListener('click', unlockHandler);
    document.addEventListener('keydown', unlockHandler);
  }

  updateLockTime() {
    const now = new Date();
    const timeEl = document.querySelector('.lock-time');
    const dateEl = document.querySelector('.lock-date');

    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
    }
  }

  unlock() {
    clearInterval(this.timeInterval);
    this.lockScreen.style.transform = 'translateY(-100%)';
    this.lockScreen.style.opacity = '0';

    setTimeout(() => {
      this.lockScreen.style.display = 'none';
      this.desktop.style.opacity = '1';
      this.desktop.style.transform = 'scale(1)';
    }, 500);
  }

  shutdown() {
    const shutdownScreen = document.getElementById('shutdown-screen');
    shutdownScreen.classList.add('active');

    setTimeout(() => {
      // Reload page to simulate restart
      window.location.reload();
    }, 3000);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================
// Screensaver Manager
// ============================================
class ScreensaverManager {
  constructor() {
    this.screensaver = document.getElementById('screensaver');
    this.canvas = document.getElementById('screensaver-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.timeout = null;
    this.active = false;
    this.animationId = null;

    this.setupIdleDetection();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  setupIdleDetection() {
    const resetTimer = () => {
      if (this.active) {
        this.stop();
      }
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.start(), CONFIG.screensaverTimeout);
    };

    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    this.active = true;
    this.screensaver.classList.add('active');
    this.animate();
  }

  stop() {
    this.active = false;
    this.screensaver.classList.remove('active');
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  animate() {
    if (!this.active) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, w, h);

    // Draw floating particles
    const time = Date.now() * 0.001;
    for (let i = 0; i < 50; i++) {
      const x = (Math.sin(time * 0.3 + i * 0.5) * 0.5 + 0.5) * w;
      const y = (Math.cos(time * 0.2 + i * 0.7) * 0.5 + 0.5) * h;
      const size = Math.sin(time + i) * 2 + 3;
      const alpha = Math.sin(time * 0.5 + i) * 0.3 + 0.3;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 150, 255, ${alpha})`;
      ctx.fill();
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// Menu Manager
// ============================================
class MenuManager {
  constructor() {
    this.activeMenu = null;
    this.setupMenus();
  }

  setupMenus() {
    // Apple menu
    const appleBtn = document.querySelector('.menu-apple');
    if (appleBtn) {
      appleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu('apple-menu');
      });
    }

    // App menu
    const appBtn = document.querySelector('.menu-item[data-menu="app"]');
    if (appBtn) {
      appBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu('app-menu');
      });
    }

    // File menu
    const fileBtn = document.querySelector('.menu-item[data-menu="file"]');
    if (fileBtn) {
      fileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu('file-menu');
      });
    }

    // Edit menu
    const editBtn = document.querySelector('.menu-item[data-menu="edit"]');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu('edit-menu');
      });
    }

    // View menu
    const viewBtn = document.querySelector('.menu-item[data-menu="view"]');
    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu('view-menu');
      });
    }

    // Close menus on outside click
    document.addEventListener('click', () => {
      this.closeAllMenus();
    });
  }

  toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (!menu) return;

    if (this.activeMenu === menuId) {
      this.closeAllMenus();
      return;
    }

    this.closeAllMenus();
    menu.classList.add('show');
    this.activeMenu = menuId;
  }

  closeAllMenus() {
    document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('show'));
    this.activeMenu = null;
  }
}

// ============================================
// Spotlight Manager
// ============================================
class SpotlightManager {
  constructor() {
    this.spotlight = document.getElementById('spotlight');
    this.input = document.getElementById('spotlight-input');
    this.results = document.querySelector('.spotlight-results');
    this.selectedIndex = -1;
    this.setupEvents();
  }

  setupEvents() {
    // Cmd+Space or Ctrl+Space to open
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape') {
        this.close();
      }
    });

    this.input.addEventListener('input', () => this.search());
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectPrev();
      } else if (e.key === 'Enter') {
        this.executeSelected();
      }
    });
  }

  toggle() {
    if (this.spotlight.classList.contains('show')) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.spotlight.classList.add('show');
    this.input.value = '';
    this.input.focus();
    this.results.innerHTML = '';
    this.selectedIndex = -1;
  }

  close() {
    this.spotlight.classList.remove('show');
    this.input.blur();
  }

  search() {
    const query = this.input.value.trim().toLowerCase();
    this.results.innerHTML = '';
    this.selectedIndex = -1;

    if (!query) return;

    const results = [];

    // Search apps
    for (const [appId, app] of Object.entries(APPS)) {
      if (app.name.toLowerCase().includes(query)) {
        results.push({ type: 'app', id: appId, name: app.name, icon: app.icon, desc: '应用程序' });
      }
    }

    // Search files
    this.searchFiles(window.vfs.root, '', query, results);

    // Render results
    if (results.length === 0) {
      this.results.innerHTML = '<div class="spotlight-section"><div class="spotlight-result"><div class="spotlight-result-info"><div class="spotlight-result-name">无结果</div></div></div></div>';
      return;
    }

    const apps = results.filter(r => r.type === 'app');
    const files = results.filter(r => r.type === 'file');

    if (apps.length > 0) {
      this.renderSection('应用程序', apps);
    }
    if (files.length > 0) {
      this.renderSection('文件', files);
    }
  }

  searchFiles(node, path, query, results) {
    if (node.type === 'file') {
      if (node.name.toLowerCase().includes(query)) {
        results.push({ type: 'file', name: node.name, path: path + '/' + node.name, desc: '文件', icon: '📄' });
      }
    } else if (node.children) {
      for (const [name, child] of Object.entries(node.children)) {
        this.searchFiles(child, path + '/' + name, query, results);
      }
    }
  }

  renderSection(title, items) {
    const section = document.createElement('div');
    section.className = 'spotlight-section';
    section.innerHTML = `<div class="spotlight-section-title">${title}</div>`;

    items.forEach((item, index) => {
      const result = document.createElement('div');
      result.className = 'spotlight-result';
      result.dataset.index = index;
      result.innerHTML = `
        <img src="${item.icon || ''}" alt="" onerror="this.style.display='none'">
        <div class="spotlight-result-info">
          <div class="spotlight-result-name">${item.name}</div>
          <div class="spotlight-result-desc">${item.desc}</div>
        </div>
      `;
      result.addEventListener('click', () => this.execute(item));
      section.appendChild(result);
    });

    this.results.appendChild(section);
  }

  selectNext() {
    const items = this.results.querySelectorAll('.spotlight-result');
    if (items.length === 0) return;
    this.selectedIndex = (this.selectedIndex + 1) % items.length;
    this.updateSelection(items);
  }

  selectPrev() {
    const items = this.results.querySelectorAll('.spotlight-result');
    if (items.length === 0) return;
    this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
    this.updateSelection(items);
  }

  updateSelection(items) {
    items.forEach((item, i) => {
      item.classList.toggle('selected', i === this.selectedIndex);
    });
  }

  executeSelected() {
    const items = this.results.querySelectorAll('.spotlight-result');
    if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
      items[this.selectedIndex].click();
    }
  }

  execute(item) {
    this.close();
    if (item.type === 'app') {
      window.wm.createWindow(item.id);
    } else if (item.type === 'file') {
      window.wm.createWindow('textedit', { filePath: item.path, title: item.name });
    }
  }
}

// ============================================
// Context Menu Manager
// ============================================
class ContextMenuManager {
  constructor() {
    this.menu = null;
    this.setupEvents();
  }

  setupEvents() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.show(e.clientX, e.clientY);
    });

    document.addEventListener('click', () => {
      this.hide();
    });
  }

  show(x, y) {
    this.hide();

    const menu = document.createElement('div');
    menu.className = 'context-menu show';
    menu.style.left = `${Math.min(x, window.innerWidth - 200)}px`;
    menu.style.top = `${Math.min(y, window.innerHeight - 200)}px`;

    menu.innerHTML = `
      <div class="context-menu-item" data-action="new-folder">新建文件夹</div>
      <div class="context-menu-item" data-action="new-file">新建文件</div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" data-action="change-wallpaper">更改桌面背景</div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" data-action="sort">排序方式</div>
      <div class="context-menu-item" data-action="view">显示选项</div>
    `;

    menu.querySelectorAll('.context-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleAction(item.dataset.action);
        this.hide();
      });
    });

    document.body.appendChild(menu);
    this.menu = menu;
  }

  hide() {
    if (this.menu) {
      this.menu.remove();
      this.menu = null;
    }
  }

  handleAction(action) {
    switch (action) {
      case 'new-folder':
        window.wm.createWindow('finder');
        break;
      case 'new-file':
        window.wm.createWindow('textedit');
        break;
      case 'change-wallpaper':
        window.wm.createWindow('settings');
        break;
    }
  }
}

// ============================================
// Global instances
// ============================================
window.vfs = new VirtualFileSystem();
window.theme = new ThemeEngine();
