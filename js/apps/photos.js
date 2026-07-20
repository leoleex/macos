/**
 * Photos App
 */
class PhotosApp {
  constructor(windowId, container, options) {
    this.windowId = windowId;
    this.container = container;
    this.photos = this.loadPhotos();
    this.render();
  }

  loadPhotos() {
    try {
      const data = localStorage.getItem('macos_photos');
      if (data) return JSON.parse(data);
    } catch (e) {}

    // Generate some demo photos
    return [
      { id: '1', emoji: '🏔️', name: '山景' },
      { id: '2', emoji: '🌅', name: '日出' },
      { id: '3', emoji: '🌊', name: '海滩' },
      { id: '4', emoji: '🌸', name: '樱花' },
      { id: '5', emoji: '🏙️', name: '城市' },
      { id: '6', emoji: '🌲', name: '森林' },
      { id: '7', emoji: '🌈', name: '彩虹' },
      { id: '8', emoji: '⭐', name: '星空' },
    ];
  }

  savePhotos() {
    localStorage.setItem('macos_photos', JSON.stringify(this.photos));
  }

  render() {
    this.container.innerHTML = `
      <div class="photos-content">
        <div class="photos-toolbar">
          <button data-view="grid" class="active">⊞ 网格</button>
          <button data-view="list">☰ 列表</button>
          <div style="flex:1"></div>
          <button data-action="import">+ 导入</button>
        </div>
        <div class="photos-grid" id="photos-grid-${this.windowId}"></div>
      </div>
    `;

    this.renderGrid();
    this.setupEvents();
  }

  renderGrid() {
    const grid = this.container.querySelector(`#photos-grid-${this.windowId}`);
    grid.innerHTML = '';

    this.photos.forEach(photo => {
      const item = document.createElement('div');
      item.className = 'photo-item';
      item.innerHTML = photo.emoji;
      item.title = photo.name;

      item.addEventListener('click', () => {
        alert(`照片: ${photo.name}\n(演示模式 - 实际应用可显示大图)`);
      });

      grid.appendChild(item);
    });
  }

  setupEvents() {
    this.container.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    this.container.querySelector('[data-action="import"]').addEventListener('click', () => {
      const emojis = ['🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎺', '🎻'];
      const names = ['艺术', '戏剧', '马戏', '目标', '骰子', '吉他', '小号', '小提琴'];
      const idx = Math.floor(Math.random() * emojis.length);
      this.photos.push({ id: Date.now().toString(), emoji: emojis[idx], name: names[idx] });
      this.savePhotos();
      this.renderGrid();
    });
  }

  onClose() {}
}
