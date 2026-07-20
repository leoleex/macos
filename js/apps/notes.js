/**
 * Notes App
 */
class NotesApp {
  constructor(windowId, container, options) {
    this.windowId = windowId;
    this.container = container;
    this.notes = this.loadNotes();
    this.activeNoteId = this.notes.length > 0 ? this.notes[0].id : null;
    this.render();
  }

  loadNotes() {
    try {
      const data = localStorage.getItem('macos_notes');
      if (data) return JSON.parse(data);
    } catch (e) {}

    return [
      { id: '1', title: '欢迎使用备忘录', content: '这是 macOS Web 桌面的备忘录应用。\n\n您可以：\n- 创建新备忘录\n- 编辑现有备忘录\n- 所有数据自动保存到本地存储', created: new Date().toISOString(), modified: new Date().toISOString() },
      { id: '2', title: '待办事项', content: '1. 完成项目文档\n2. 回复邮件\n3. 准备会议材料', created: new Date().toISOString(), modified: new Date().toISOString() },
    ];
  }

  saveNotes() {
    localStorage.setItem('macos_notes', JSON.stringify(this.notes));
  }

  render() {
    this.container.innerHTML = `
      <div class="notes-content">
        <div class="notes-sidebar">
          <div class="notes-sidebar-header">
            <h3>备忘录</h3>
            <button data-action="new">+</button>
          </div>
          <div class="notes-list" id="notes-list-${this.windowId}"></div>
        </div>
        <div class="notes-editor">
          <textarea id="notes-editor-${this.windowId}" placeholder="在此输入内容..."></textarea>
        </div>
      </div>
    `;

    this.renderNoteList();
    this.loadActiveNote();
    this.setupEvents();
  }

  renderNoteList() {
    const list = this.container.querySelector(`#notes-list-${this.windowId}`);
    list.innerHTML = '';

    this.notes.forEach(note => {
      const item = document.createElement('div');
      item.className = 'notes-list-item' + (note.id === this.activeNoteId ? ' active' : '');
      item.dataset.id = note.id;

      const preview = note.content.split('\n')[0] || '无内容';
      item.innerHTML = `
        <div class="notes-list-item-title">${note.title || '无标题'}</div>
        <div class="notes-list-item-preview">${preview}</div>
      `;

      item.addEventListener('click', () => {
        this.saveCurrentNote();
        this.activeNoteId = note.id;
        this.renderNoteList();
        this.loadActiveNote();
      });

      list.appendChild(item);
    });
  }

  loadActiveNote() {
    const editor = this.container.querySelector(`#notes-editor-${this.windowId}`);
    const note = this.notes.find(n => n.id === this.activeNoteId);
    if (note && editor) {
      editor.value = note.content;
    }
  }

  saveCurrentNote() {
    const editor = this.container.querySelector(`#notes-editor-${this.windowId}`);
    const note = this.notes.find(n => n.id === this.activeNoteId);
    if (note && editor) {
      note.content = editor.value;
      note.title = editor.value.split('\n')[0].substring(0, 30) || '无标题';
      note.modified = new Date().toISOString();
      this.saveNotes();
    }
  }

  setupEvents() {
    // New note button
    this.container.querySelector('[data-action="new"]').addEventListener('click', () => {
      this.saveCurrentNote();
      const newNote = {
        id: Date.now().toString(),
        title: '新备忘录',
        content: '',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      };
      this.notes.unshift(newNote);
      this.activeNoteId = newNote.id;
      this.saveNotes();
      this.renderNoteList();
      this.loadActiveNote();
    });

    // Auto-save on input
    const editor = this.container.querySelector(`#notes-editor-${this.windowId}`);
    editor.addEventListener('input', () => {
      this.saveCurrentNote();
      this.renderNoteList();
    });
  }

  onClose() {
    this.saveCurrentNote();
  }
}
