/**
 * Settings App
 */
class SettingsApp {
  constructor(windowId, container, options) {
    this.windowId = windowId;
    this.container = container;
    this.activeSection = 'general';
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="settings-content">
        <div class="settings-sidebar">
          <div class="settings-sidebar-item active" data-section="general"><span class="fi">⚙️</span> 通用</div>
          <div class="settings-sidebar-item" data-section="appearance"><span class="fi">🎨</span> 外观</div>
          <div class="settings-sidebar-item" data-section="dock"><span class="fi">🚀</span> Dock</div>
          <div class="settings-sidebar-item" data-section="wallpaper"><span class="fi">🖼️</span> 桌面与屏保</div>
          <div class="settings-sidebar-item" data-section="accessibility"><span class="fi">♿</span> 辅助功能</div>
          <div class="settings-sidebar-item" data-section="about"><span class="fi">ℹ️</span> 关于</div>
        </div>
        <div class="settings-main" id="settings-main-${this.windowId}"></div>
      </div>
    `;

    this.renderSection(this.activeSection);
    this.setupEvents();
  }

  renderSection(section) {
    const main = this.container.querySelector(`#settings-main-${this.windowId}`);

    switch (section) {
      case 'general':
        main.innerHTML = `
          <div class="settings-section">
            <h2>通用</h2>
            <div class="settings-row">
              <div>
                <div class="settings-row-label">自动保存</div>
                <div class="settings-row-desc">自动保存文档更改</div>
              </div>
              <div class="toggle-switch active" data-setting="autosave"></div>
            </div>
            <div class="settings-row">
              <div>
                <div class="settings-row-label">启动时恢复窗口</div>
                <div class="settings-row-desc">重新打开上次使用的窗口</div>
              </div>
              <div class="toggle-switch active" data-setting="restore"></div>
            </div>
            <div class="settings-row">
              <div>
                <div class="settings-row-label">显示最近项目</div>
                <div class="settings-row-desc">在菜单中显示最近使用的项目</div>
              </div>
              <div class="toggle-switch active" data-setting="recent"></div>
            </div>
          </div>
        `;
        break;

      case 'appearance':
        const currentTheme = window.theme.getTheme();
        main.innerHTML = `
          <div class="settings-section">
            <h2>外观</h2>
            <div class="settings-row">
              <div>
                <div class="settings-row-label">外观模式</div>
                <div class="settings-row-desc">选择系统外观</div>
              </div>
              <select id="theme-select" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);">
                <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>浅色</option>
                <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>深色</option>
                <option value="auto" ${currentTheme === 'auto' ? 'selected' : ''}>自动</option>
              </select>
            </div>
            <div class="settings-row">
              <div>
                <div class="settings-row-label">强调色</div>
                <div class="settings-row-desc">选择系统强调色</div>
              </div>
              <div style="display:flex;gap:8px;">
                <div style="width:24px;height:24px;border-radius:50%;background:#007AFF;cursor:pointer;border:2px solid white;box-shadow:0 0 0 1px #ccc;"></div>
                <div style="width:24px;height:24px;border-radius:50%;background:#FF2D55;cursor:pointer;"></div>
                <div style="width:24px;height:24px;border-radius:50%;background:#FF9500;cursor:pointer;"></div>
                <div style="width:24px;height:24px;border-radius:50%;background:#28C840;cursor:pointer;"></div>
                <div style="width:24px;height:24px;border-radius:50%;background:#AF52DE;cursor:pointer;"></div>
              </div>
            </div>
          </div>
        `;

        const themeSelect = main.querySelector('#theme-select');
        if (themeSelect) {
          themeSelect.addEventListener('change', () => {
            window.theme.applyTheme(themeSelect.value);
          });
        }
        break;

      case 'dock':
        main.innerHTML = `
          <div class="settings-section">
            <h2>Dock</h2>
            <div class="settings-row">
              <div>
                <div class="settings-row-label">自动隐藏 Dock</div>
                <div class="settings-row-desc">不使用时自动隐藏 Dock</div>
              </div>
              <div class="toggle-switch" data-setting="dock-autohide"></div>
            </div>
            <div class="settings-row">
              <div>
                <div class="settings-row-label">显示放大效果</div>
                <div class="settings-row-desc">鼠标悬停时放大图标</div>
              </div>
              <div class="toggle-switch active" data-setting="dock-magnify"></div>
            </div>
            <div class="settings-row">
              <div>
                <div class="settings-row-label">Dock 位置</div>
              </div>
              <select style="padding:4px 8px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);">
                <option>底部</option>
                <option>左侧</option>
                <option>右侧</option>
              </select>
            </div>
          </div>
        `;
        break;

      case 'wallpaper':
        main.innerHTML = `
          <div class="settings-section">
            <h2>桌面与屏保</h2>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px;">
              <div class="wallpaper-option" data-wallpaper="assets/wallpapers/sonoma-light.svg" style="aspect-ratio:16/9;border-radius:8px;overflow:hidden;cursor:pointer;border:2px solid var(--selected-bg);">
                <img src="assets/wallpapers/sonoma-light.svg" style="width:100%;height:100%;object-fit:cover;">
              </div>
              <div class="wallpaper-option" data-wallpaper="assets/wallpapers/sonoma-dark.svg" style="aspect-ratio:16/9;border-radius:8px;overflow:hidden;cursor:pointer;border:2px solid transparent;">
                <img src="assets/wallpapers/sonoma-dark.svg" style="width:100%;height:100%;object-fit:cover;">
              </div>
              <div class="wallpaper-option" data-wallpaper="assets/wallpapers/abstract.svg" style="aspect-ratio:16/9;border-radius:8px;overflow:hidden;cursor:pointer;border:2px solid transparent;">
                <img src="assets/wallpapers/abstract.svg" style="width:100%;height:100%;object-fit:cover;">
              </div>
            </div>
            <div style="margin-top:20px;">
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">屏保启动时间</div>
                </div>
                <select style="padding:4px 8px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);">
                  <option>1 分钟</option>
                  <option selected>5 分钟</option>
                  <option>10 分钟</option>
                  <option>30 分钟</option>
                  <option>永不</option>
                </select>
              </div>
            </div>
          </div>
        `;

        main.querySelectorAll('.wallpaper-option').forEach(opt => {
          opt.addEventListener('click', () => {
            main.querySelectorAll('.wallpaper-option').forEach(o => o.style.borderColor = 'transparent');
            opt.style.borderColor = 'var(--selected-bg)';
            const desktop = document.getElementById('desktop');
            const lockScreen = document.getElementById('lock-screen');
            if (desktop) desktop.style.backgroundImage = `url(${opt.dataset.wallpaper})`;
            if (lockScreen) lockScreen.style.backgroundImage = `url(${opt.dataset.wallpaper})`;
            localStorage.setItem('macos_wallpaper', opt.dataset.wallpaper);
          });
        });
        break;

      case 'accessibility':
        main.innerHTML = `
          <div class="settings-section">
            <h2>辅助功能</h2>
            <div class="settings-row">
              <div>
                <div class="settings-row-label">减少透明度</div>
                <div class="settings-row-desc">降低界面元素的透明度</div>
              </div>
              <div class="toggle-switch" data-setting="reduce-transparency"></div>
            </div>
            <div class="settings-row">
              <div>
                <div class="settings-row-label">增强对比度</div>
                <div class="settings-row-desc">增加界面元素的对比度</div>
              </div>
              <div class="toggle-switch" data-setting="increase-contrast"></div>
            </div>
            <div class="settings-row">
              <div>
                <div class="settings-row-label">减少动态效果</div>
                <div class="settings-row-desc">减少界面动画</div>
              </div>
              <div class="toggle-switch" data-setting="reduce-motion"></div>
            </div>
          </div>
        `;
        break;

      case 'about':
        main.innerHTML = `
          <div class="settings-section">
            <h2>关于</h2>
            <div style="text-align:center;padding:40px 0;">
              <div style="font-size:64px;margin-bottom:16px;">🖥️</div>
              <div style="font-size:20px;font-weight:600;margin-bottom:8px;">macOS Web Desktop</div>
              <div style="font-size:14px;color:var(--text-secondary);margin-bottom:4px;">版本 1.0</div>
              <div style="font-size:13px;color:var(--text-tertiary);">基于 HTML/CSS/JavaScript 构建</div>
              <div style="margin-top:24px;padding:16px;background:var(--bg-secondary);border-radius:8px;text-align:left;">
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--separator);">
                  <span>处理器</span><span>Web Engine</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--separator);">
                  <span>内存</span><span>浏览器分配</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--separator);">
                  <span>存储</span><span>LocalStorage</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;">
                  <span>分辨率</span><span>${window.innerWidth} × ${window.innerHeight}</span>
                </div>
              </div>
            </div>
          </div>
        `;
        break;
    }

    // Setup toggle switches
    main.querySelectorAll('.toggle-switch').forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        const setting = toggle.dataset.setting;
        const value = toggle.classList.contains('active');
        localStorage.setItem(`macos_setting_${setting}`, value);

        if (setting === 'dock-autohide') {
          document.getElementById('dock').classList.toggle('auto-hide', value);
        }
      });

      // Load saved state
      const saved = localStorage.getItem(`macos_setting_${toggle.dataset.setting}`);
      if (saved !== null) {
        toggle.classList.toggle('active', saved === 'true');
      }
    });
  }

  setupEvents() {
    this.container.querySelectorAll('.settings-sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        this.container.querySelectorAll('.settings-sidebar-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.activeSection = item.dataset.section;
        this.renderSection(this.activeSection);
      });
    });
  }

  onClose() {}
}
