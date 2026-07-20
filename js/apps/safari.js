/**
 * Safari App
 */
class SafariApp {
  constructor(windowId, container, options) {
    this.windowId = windowId;
    this.container = container;
    this.history = [];
    this.historyIndex = -1;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="safari-content">
        <div class="safari-toolbar">
          <button data-action="back" disabled>◀</button>
          <button data-action="forward" disabled>▶</button>
          <button data-action="reload">↻</button>
          <div class="safari-address-bar">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="搜索或输入网址" value="">
          </div>
          <button data-action="share">⇧</button>
        </div>
        <div class="safari-viewport" id="safari-viewport-${this.windowId}">
          <div class="safari-welcome">
            <h2>Safari</h2>
            <p>输入网址或搜索关键词开始浏览</p>
            <div class="safari-favorites">
              <div class="safari-fav-item" data-url="https://www.baidu.com">
                <div class="safari-fav-icon">🔴</div>
                <div class="safari-fav-name">百度</div>
              </div>
              <div class="safari-fav-item" data-url="https://www.bing.com">
                <div class="safari-fav-icon">🔵</div>
                <div class="safari-fav-name">必应</div>
              </div>
              <div class="safari-fav-item" data-url="https://github.com">
                <div class="safari-fav-icon">🐙</div>
                <div class="safari-fav-name">GitHub</div>
              </div>
              <div class="safari-fav-item" data-url="https://stackoverflow.com">
                <div class="safari-fav-icon">📚</div>
                <div class="safari-fav-name">Stack Overflow</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupEvents();
  }

  setupEvents() {
    const backBtn = this.container.querySelector('[data-action="back"]');
    const forwardBtn = this.container.querySelector('[data-action="forward"]');
    const reloadBtn = this.container.querySelector('[data-action="reload"]');
    const addressInput = this.container.querySelector('.safari-address-bar input');
    const viewport = this.container.querySelector(`#safari-viewport-${this.windowId}`);

    backBtn.addEventListener('click', () => this.goBack());
    forwardBtn.addEventListener('click', () => this.goForward());
    reloadBtn.addEventListener('click', () => this.reload());

    addressInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.navigate(addressInput.value);
      }
    });

    // Favorites
    this.container.querySelectorAll('.safari-fav-item').forEach(item => {
      item.addEventListener('click', () => {
        this.navigate(item.dataset.url);
      });
    });
  }

  navigate(url) {
    if (!url) return;

    // If not a URL, search with Bing
    let targetUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (!url.includes('.') || url.includes(' ')) {
        targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
      } else {
        targetUrl = `https://${url}`;
      }
    }

    const viewport = this.container.querySelector(`#safari-viewport-${this.windowId}`);
    const addressInput = this.container.querySelector('.safari-address-bar input');

    // Add to history
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(targetUrl);
    this.historyIndex++;

    this.updateButtons();
    addressInput.value = targetUrl;

    // Load in iframe
    viewport.innerHTML = `<iframe src="${targetUrl}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>`;

    // Update window title
    const win = window.wm.getWindowById(this.windowId);
    if (win) {
      win.title = 'Safari - ' + url;
      const titleEl = win.element.querySelector('.window-title');
      if (titleEl) titleEl.textContent = win.title;
    }
  }

  goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.loadUrl(this.history[this.historyIndex]);
    }
  }

  goForward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.loadUrl(this.history[this.historyIndex]);
    }
  }

  reload() {
    if (this.historyIndex >= 0) {
      this.loadUrl(this.history[this.historyIndex]);
    }
  }

  loadUrl(url) {
    const viewport = this.container.querySelector(`#safari-viewport-${this.windowId}`);
    const addressInput = this.container.querySelector('.safari-address-bar input');

    viewport.innerHTML = `<iframe src="${url}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>`;
    addressInput.value = url;
    this.updateButtons();
  }

  updateButtons() {
    const backBtn = this.container.querySelector('[data-action="back"]');
    const forwardBtn = this.container.querySelector('[data-action="forward"]');

    backBtn.disabled = this.historyIndex <= 0;
    forwardBtn.disabled = this.historyIndex >= this.history.length - 1;
  }

  onClose() {}
}
