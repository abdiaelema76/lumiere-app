// ============================================================
// LUMIÈRE — planner.js  (with task editing)
// ============================================================

const plannerModule = {
  tasks: [],
  currentDate: new Date(),
  currentView: 'day',
  currentCatFilter: 'all',
  editingTaskId: null,
  draggedId: null,

  init() {
    this.tasks = JSON.parse(localStorage.getItem('lumiere_tasks') || '[]');
    this.setupEvents();
    this.refresh();
  },

  setupEvents() {
    document.getElementById('newTaskBtn').addEventListener('click', () => this.openTaskModal());
    document.getElementById('saveTaskBtn').addEventListener('click', () => this.saveTask());
    document.getElementById('cancelTaskBtn').addEventListener('click', () => this.closeModal());
    document.getElementById('taskModal').addEventListener('click', e => {
      if (e.target.id === 'taskModal') this.closeModal();
    });

    document.getElementById('prevDay').addEventListener('click', () => {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
      this.renderDayView();
    });
    document.getElementById('nextDay').addEventListener('click', () => {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
      this.renderDayView();
    });

    document.querySelectorAll('.view-btn[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn[data-view]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentView = btn.dataset.view;
        document.getElementById('dayView').classList.toggle('hidden', this.currentView !== 'day');
        document.getElementById('weekView').classList.toggle('hidden', this.currentView !== 'week');
        this.refresh();
      });
    });

    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentCatFilter = chip.dataset.cat;
        this.renderDayView();
      });
    });

    document.getElementById('taskTitleInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.saveTask();
      if (e.key === 'Escape') this.closeModal();
    });

    // Update modal title dynamically
    document.getElementById('taskModal').addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeModal();
    });
  },

  openTaskModal(task = null) {
    this.editingTaskId = task ? task.id : null;
    const today = new Date().toISOString().split('T')[0];

    // Update modal title
    document.querySelector('#taskModal .modal-title').textContent =
      task ? 'Edit Task ✎' : 'New Task ✦';
    document.getElementById('saveTaskBtn').textContent =
      task ? 'Save Changes' : 'Add Task';

    document.getElementById('taskTitleInput').value = task ? task.title : '';
    document.getElementById('taskCategory').value = task ? task.category : 'personal';
    document.getElementById('taskDate').value = task
      ? task.date
      : (this.currentDate.toISOString().split('T')[0] || today);
    document.getElementById('taskTime').value = task ? (task.time || '') : '';
    document.getElementById('taskReminder').checked = task ? (task.reminder || false) : false;

    document.getElementById('taskModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('taskTitleInput').focus(), 80);
  },

  closeModal() {
    document.getElementById('taskModal').classList.add('hidden');
    this.editingTaskId = null;
  },

  saveTask() {
    const title = document.getElementById('taskTitleInput').value.trim();
    if (!title) { showToast('Please enter a task title'); return; }

    const taskData = {
      title,
      category: document.getElementById('taskCategory').value,
      date: document.getElementById('taskDate').value,
      time: document.getElementById('taskTime').value,
      reminder: document.getElementById('taskReminder').checked,
    };

    if (this.editingTaskId) {
      const t = this.tasks.find(t => t.id === this.editingTaskId);
      if (t) Object.assign(t, taskData);
      showToast('Task updated ✦');
    } else {
      this.tasks.push({
        id: Date.now().toString(),
        completed: false,
        createdAt: new Date().toISOString(),
        ...taskData
      });
      showToast('Task added ✦');
    }

    this.saveTasks();
    this.closeModal();
    this.refresh();
    if (typeof dashboardModule !== 'undefined') dashboardModule.refresh();
    if (taskData.reminder && taskData.time) this.scheduleReminder(taskData);
  },

  scheduleReminder(task) {
    const now = new Date();
    const [h, m] = task.time.split(':').map(Number);
    const target = new Date(task.date);
    target.setHours(h, m, 0);
    const ms = target - now;
    if (ms > 0 && ms < 24 * 60 * 60 * 1000) {
      setTimeout(() => showToast(`⏰ Reminder: ${task.title}`), ms);
    }
  },

  editTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) this.openTaskModal(task);
  },

  toggleTask(id) {
    const t = this.tasks.find(t => t.id === id);
    if (!t) return;
    t.completed = !t.completed;
    t.completedAt = t.completed ? new Date().toISOString() : null;
    this.saveTasks();
    this.refresh();
    if (typeof dashboardModule !== 'undefined') dashboardModule.refresh();
  },

  deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
    this.refresh();
    if (typeof dashboardModule !== 'undefined') dashboardModule.refresh();
    showToast('Task removed');
  },

  refresh() {
    if (this.currentView === 'day') this.renderDayView();
    else this.renderWeekView();
  },

  renderDayView() {
    const dateStr = this.currentDate.toISOString().split('T')[0];
    document.getElementById('plannerDayTitle').textContent =
      this.currentDate.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

    let dayTasks = this.tasks.filter(t => t.date === dateStr);
    if (this.currentCatFilter !== 'all') {
      dayTasks = dayTasks.filter(t => t.category === this.currentCatFilter);
    }
    dayTasks.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    const container = document.getElementById('dayTasksList');
    if (!dayTasks.length) {
      container.innerHTML = '<p class="empty-hint">No tasks for this day. A clear schedule is a gift. 🌸</p>';
      return;
    }
    container.innerHTML = dayTasks.map(t => this.renderTaskItem(t)).join('');
    this.setupDragDrop();
  },

  renderTaskItem(t) {
    const catEmoji = { work:'💼', study:'📚', personal:'🌸', business:'💡', fun:'🎉' };
    return `<div class="task-item${t.completed ? ' completed' : ''}" data-id="${t.id}" draggable="true">
      <button class="task-check${t.completed ? ' checked' : ''}"
        onclick="plannerModule.toggleTask('${t.id}')"
        title="${t.completed ? 'Mark incomplete' : 'Mark complete'}">
      </button>
      <div class="task-info" style="flex:1">
        <div class="task-title">${t.title}</div>
        <div class="task-meta">
          <span class="task-cat-badge">${catEmoji[t.category] || ''} ${t.category}</span>
          ${t.time ? `<span class="task-time">🕐 ${t.time}</span>` : ''}
          ${t.reminder ? '<span class="task-time">⏰</span>' : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="task-edit-btn"
          onclick="plannerModule.editTask('${t.id}')"
          title="Edit task">✎</button>
        <button class="task-delete-btn"
          onclick="plannerModule.deleteTask('${t.id}')"
          title="Delete task">✕</button>
      </div>
    </div>`;
  },

  renderWeekView() {
    const grid = document.getElementById('weekGrid');
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());

    grid.innerHTML = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const ds = d.toISOString().split('T')[0];
      const dayTasks = this.tasks.filter(t => t.date === ds);
      const isToday = ds === now.toISOString().split('T')[0];
      return `<div class="week-day-col">
        <div class="week-day-header${isToday ? ' today' : ''}">
          ${d.toLocaleDateString('en-US', { weekday:'short' })}
          <span class="day-num">${d.getDate()}</span>
        </div>
        ${dayTasks.map(t => `
          <div class="week-task-mini${t.completed ? ' completed' : ''}"
            title="${t.title}"
            style="display:flex;align-items:center;gap:0.2rem;justify-content:space-between">
            <span onclick="plannerModule.toggleTask('${t.id}')" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer">${t.title}</span>
            <span onclick="plannerModule.editTask('${t.id}')" style="cursor:pointer;opacity:0.6;font-size:0.65rem;flex-shrink:0">✎</span>
          </div>`).join('')}
        <button onclick="plannerModule.currentDate=new Date('${ds}');plannerModule.openTaskModal()"
          style="background:none;border:1px dashed var(--border);border-radius:6px;padding:0.2rem;font-size:0.7rem;color:var(--text-3);cursor:pointer;width:100%;margin-top:0.3rem">+ add</button>
      </div>`;
    }).join('');
  },

  setupDragDrop() {
    const items = document.querySelectorAll('.task-item[draggable]');
    items.forEach(item => {
      item.addEventListener('dragstart', () => {
        this.draggedId = item.dataset.id;
        item.style.opacity = '0.5';
      });
      item.addEventListener('dragend', () => { item.style.opacity = ''; });
      item.addEventListener('dragover', e => {
        e.preventDefault();
        item.style.transform = 'translateX(4px)';
      });
      item.addEventListener('dragleave', () => { item.style.transform = ''; });
      item.addEventListener('drop', e => {
        e.preventDefault();
        item.style.transform = '';
        if (this.draggedId && this.draggedId !== item.dataset.id) {
          const fromIdx = this.tasks.findIndex(t => t.id === this.draggedId);
          const toIdx = this.tasks.findIndex(t => t.id === item.dataset.id);
          if (fromIdx !== -1 && toIdx !== -1) {
            const [moved] = this.tasks.splice(fromIdx, 1);
            this.tasks.splice(toIdx, 0, moved);
            this.saveTasks();
            this.renderDayView();
          }
        }
      });
    });
  },

  saveTasks() {
    localStorage.setItem('lumiere_tasks', JSON.stringify(this.tasks));
  }
};
