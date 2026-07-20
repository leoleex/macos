/**
 * TextEdit App - Full text editing functionality
 */
class TextEditApp {
  constructor(windowId, container, options) {
    this.windowId = windowId;
    this.container = container;
    this.filePath = options.filePath || null;
    this.content = '';
    this.isModified = false;
    this.fontSize = 14;
    this.fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif';

    this.loadFile();
    this.render();
    this.setupAutoSave();
  }

  loadFile() {
    if (this.filePath) {
      const content = window.vfs.readFile(this.filePath);
      if (content !== null) {
        this.content = content;
      }
    }
  }

  render() {
    const title = this.filePath ? this.filePath.split('/').pop() : '未命名';

    this.container.innerHTML = `
      <div class="textedit-content">
        <div class="textedit-toolbar">
          <select id="font-family-${this.windowId}">
            <option value="system">系统字体</option>
            <option value="serif">宋体</option>
            <option value="monospace">等宽字体</option>
          </select>
          <select id="font-size-${this.windowId}">
            <option value="12">12</option>
            <option value="14" selected>14</option>
            <option value="16">16</option>
            <option value="18">18</option>
            <option value="24">24</option>
          </select>
          <button data-action="bold" title="粗体"><b>B</b></button>
          <button data-action="italic" title="斜体"><i>I</i></button>
          <button data-action="underline" title="下划线"><u>U</u></button>
          <div style="flex:1"></div>
          <button data-action="save" title="保存">💾 保存</button>
        </div>
        <textarea id="editor-${this.windowId}" class="textedit-editor" placeholder="在此输入文本...">${this.escapeHtml(this.content)}</textarea>
      </div>
    `;

    this.editor = this.container.querySelector(`#editor-${this.windowId}`);
    this.setupEvents();
    this.updateTitle(title);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  setupEvents() {
    // Text change tracking
    this.editor.addEventListener('input', () => {
      this.isModified = true;
      this.content = this.editor.value;
      this.updateTitleIndicator();
    });

    // Toolbar actions
    this.container.querySelectorAll('.textedit-toolbar button').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        switch (action) {
          case 'save':
            this.saveFile();
            break;
          case 'bold':
            this.wrapSelection('**', '**');
            break;
          case 'italic':
            this.wrapSelection('*', '*');
            break;
          case 'underline':
            this.wrapSelection('_', '_');
            break;
        }
      });
    });

    // Font family
    const fontSelect = this.container.querySelector(`#font-family-${this.windowId}`);
    fontSelect.addEventListener('change', () => {
      const fonts = {
        'system': '-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif',
        'serif': '"Songti SC", "SimSun", "STSong", serif',
        'monospace': '"SF Mono", "Menlo", "Monaco", "Courier New", monospace',
      };
      this.editor.style.fontFamily = fonts[fontSelect.value] || fonts['system'];
    });

    // Font size
    const sizeSelect = this.container.querySelector(`#font-size-${this.windowId}`);
    sizeSelect.addEventListener('change', () => {
      this.editor.style.fontSize = sizeSelect.value + 'px';
    });

    // Keyboard shortcuts
    this.editor.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        this.saveFile();
      }
    });
  }

  wrapSelection(before, after) {
    const start = this.editor.selectionStart;
    const end = this.editor.selectionEnd;
    const selected = this.editor.value.substring(start, end);

    if (selected) {
      const newText = before + selected + after;
      this.editor.setRangeText(newText, start, end, 'end');
      this.editor.selectionStart = start + before.length;
      this.editor.selectionEnd = end + before.length;
      this.content = this.editor.value;
      this.isModified = true;
      this.updateTitleIndicator();
    }
  }

  saveFile() {
    if (!this.filePath) {
      // Prompt for filename
      const filename = prompt('输入文件名:', '未命名.txt');
      if (!filename) return;
      this.filePath = '/文稿/' + filename;
    }

    window.vfs.writeFile(this.filePath, this.editor.value);
    this.isModified = false;
    this.updateTitleIndicator();

    // Show save indicator
    const saveBtn = this.container.querySelector('[data-action="save"]');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '✓ 已保存';
    setTimeout(() => {
      saveBtn.textContent = originalText;
    }, 1500);
  }

  setupAutoSave() {
    setInterval(() => {
      if (this.isModified && this.filePath) {
        window.vfs.writeFile(this.filePath, this.editor.value);
        this.isModified = false;
        this.updateTitleIndicator();
      }
    }, CONFIG.autoSaveInterval);
  }

  updateTitle(name) {
    const win = window.wm.getWindowById(this.windowId);
    if (win) {
      win.title = name;
      const titleEl = win.element.querySelector('.window-title');
      if (titleEl) titleEl.textContent = name + (this.isModified ? ' ●' : '');
    }
  }

  updateTitleIndicator() {
    const win = window.wm.getWindowById(this.windowId);
    if (win) {
      const titleEl = win.element.querySelector('.window-title');
      if (titleEl) {
        const baseTitle = this.filePath ? this.filePath.split('/').pop() : '未命名';
        titleEl.textContent = baseTitle + (this.isModified ? ' ●' : '');
      }
    }
  }

  onClose() {
    if (this.isModified) {
      this.saveFile();
    }
  }
}
