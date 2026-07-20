/**
 * Calendar App
 */
class CalendarApp {
  constructor(windowId, container, options) {
    this.windowId = windowId;
    this.container = container;
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.events = this.loadEvents();
    this.render();
  }

  loadEvents() {
    try {
      const data = localStorage.getItem('macos_calendar_events');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {};
  }

  saveEvents() {
    localStorage.setItem('macos_calendar_events', JSON.stringify(this.events));
  }

  render() {
    this.container.innerHTML = `
      <div class="calendar-content">
        <div class="calendar-header">
          <button data-action="prev">◀</button>
          <h2>${this.getMonthYear()}</h2>
          <button data-action="today">今天</button>
          <button data-action="next">▶</button>
        </div>
        <div class="calendar-grid" id="calendar-grid-${this.windowId}"></div>
      </div>
    `;

    this.renderGrid();
    this.setupEvents();
  }

  getMonthYear() {
    return this.currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
  }

  renderGrid() {
    const grid = this.container.querySelector(`#calendar-grid-${this.windowId}`);
    grid.innerHTML = '';

    // Day headers
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    days.forEach(day => {
      const header = document.createElement('div');
      header.className = 'calendar-day-header';
      header.textContent = day;
      grid.appendChild(header);
    });

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = document.createElement('div');
      day.className = 'calendar-day other-month';
      day.innerHTML = `<div class="calendar-day-number">${daysInPrevMonth - i}</div>`;
      grid.appendChild(day);
    }

    // Current month days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const day = document.createElement('div');
      day.className = 'calendar-day';

      if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
        day.classList.add('today');
      }

      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = this.events[dateKey] || [];

      let eventsHtml = '';
      dayEvents.slice(0, 3).forEach(evt => {
        eventsHtml += `<div class="calendar-event">${evt.title}</div>`;
      });

      day.innerHTML = `
        <div class="calendar-day-number">${i}</div>
        <div class="calendar-day-events">${eventsHtml}</div>
      `;

      day.addEventListener('click', () => {
        this.selectedDate = new Date(year, month, i);
        this.addEvent(dateKey);
      });

      grid.appendChild(day);
    }

    // Next month days
    const remainingCells = 42 - (firstDay + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
      const day = document.createElement('div');
      day.className = 'calendar-day other-month';
      day.innerHTML = `<div class="calendar-day-number">${i}</div>`;
      grid.appendChild(day);
    }
  }

  addEvent(dateKey) {
    const title = prompt('输入事件标题:');
    if (title) {
      if (!this.events[dateKey]) this.events[dateKey] = [];
      this.events[dateKey].push({ title, time: new Date().toISOString() });
      this.saveEvents();
      this.renderGrid();
    }
  }

  setupEvents() {
    this.container.querySelector('[data-action="prev"]').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
    });

    this.container.querySelector('[data-action="next"]').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
    });

    this.container.querySelector('[data-action="today"]').addEventListener('click', () => {
      this.currentDate = new Date();
      this.render();
    });
  }

  onClose() {}
}
