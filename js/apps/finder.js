/**
 * Finder App
 */
class FinderApp {
  constructor(windowId, container, options) {
    this.windowId = windowId;
    this.container = container;
    this.currentPath = options.path || '/桌面';
    this.viewMode = 'icon';
    this.selectedItems = new Set();
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="finder-window">
        <div class="finder-sidebar">
          <div class="finder-sidebar-section">
            <div class="finder-sidebar-title">个人收藏</div>
            <div class="finder-sidebar-item active" data-path="/桌面"><span class="fi">📁</span> 桌面</div>
            <div class="finder-sidebar-item" data-path="/文稿"><span class="fi">📄</span> 文稿</div>
            <div class="finder-sidebar-item" data-path="/下载"><span class="fi">⬇️</span> 下载</div>
            <div class="finder-sidebar-item" data-path="/图片"><span class="fi">🖼️</span> 图片</div>
            <div class="finder-sidebar-item" data-path="/应用程序"><span class="fi">🚀</span> 应用程序</div>
          </div>
        </div>
        <div class="finder-main">
          <div class="finder-toolbar">
            <button data-action="back">◀</button>
            <button data-action="forward">▶</button>
            <div class="finder-path">${this.getDisplayPath()}</div>
            <button data-action="view-icon">⊞</button>
            <button data-action="view-list">☰</button>
          </div>
          <div class="finder-content" id="finder-content-${this.windowId}"></div>
        </div>
      </div>
    `;

    this.setupEvents();
    this.loadDirectory();
  }

  getDisplayPath() {
    return this.currentPath === '/' ? 'Macintosh HD' : this.currentPath.replace(/^\//, '');
  }

  setupEvents() {
    // Sidebar navigation
    this.container.querySelectorAll('.finder-sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        this.container.querySelectorAll('.finder-sidebar-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.currentPath = item.dataset.path;
        this.loadDirectory();
      });
    });

    // Toolbar
    this.container.querySelectorAll('.finder-toolbar button').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'view-icon') this.viewMode = 'icon';
        if (action === 'view-list') this.viewMode = 'list';
        this.loadDirectory();
      });
    });
  }

  loadDirectory() {
    const content = this.container.querySelector(`#finder-content-${this.windowId}`);
    const items = window.vfs.listDir(this.currentPath);

    // Update path display
    const pathEl = this.container.querySelector('.finder-path');
    if (pathEl) pathEl.textContent = this.getDisplayPath();

    if (items.length === 0) {
      content.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">此文件夹为空</div>';
      return;
    }

    content.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = this.viewMode === 'icon' ? 'finder-grid' : '';

    if (this.viewMode === 'list') {
      grid.style.display = 'flex';
      grid.style.flexDirection = 'column';
    }

    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'finder-item';
      el.dataset.name = item.name;

      const icon = item.type === 'folder' ? '📁' : this.getFileIcon(item.name);

      el.innerHTML = `
        <div class="finder-item-icon">${icon}</div>
        <div class="finder-item-name">${item.name}</div>
      `;

      el.addEventListener('click', (e) => {
        if (e.detail === 2) {
          // Double click
          if (item.type === 'folder') {
            this.currentPath = this.currentPath + '/' + item.name;
            this.loadDirectory();
          } else {
            // Open file
            window.wm.createWindow('textedit', { filePath: this.currentPath + '/' + item.name, title: item.name });
          }
        } else {
          // Single click - select
          this.container.querySelectorAll('.finder-item').forEach(i => i.classList.remove('selected'));
          el.classList.add('selected');
        }
      });

      grid.appendChild(el);
    });

    content.appendChild(grid);
  }

  getFileIcon(filename) {
    if (filename.endsWith('.txt')) return '📄';
    if (filename.endsWith('.png') || filename.endsWith('.jpg')) return '🖼️';
    if (filename.endsWith('.js')) return '📜';
    if (filename.endsWith('.html')) return '🌐';
    return '📄';
  }

  onClose() {
    // Cleanup if needed
  }
}
