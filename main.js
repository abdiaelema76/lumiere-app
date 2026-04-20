// ============================================================
// LUMIÈRE — main.js v4
// ============================================================

const app = {
  init() {
    this.setupNav();
    this.setupTheme();
    this.setupFAB();
    this.setupGlobalSearch();
    this.setupMobile();
    this.updateSidebarDate();
    dashboardModule.init();
    notesModule.init();
    plannerModule.init();
    journalModule.init();
    focusModule.init();
    budgetModule.init();
    learnModule.init();
    jobsModule.init();
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); this.openGlobalSearch(); }
      if (e.key === 'Escape') {
        document.getElementById('searchOverlay').classList.add('hidden');
        document.getElementById('taskModal').classList.add('hidden');
        document.getElementById('txModal')?.classList.add('hidden');
        document.getElementById('fabMenu').classList.add('hidden');
      }
    });
  },

  navigate(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('section-' + section)?.classList.add('active');
    document.querySelector('.nav-btn[data-section="' + section + '"]')?.classList.add('active');
    document.getElementById('sidebar').classList.remove('open');
    if (section === 'dashboard') dashboardModule.refresh();
    if (section === 'journal') journalModule.refresh();
    if (section === 'planner') plannerModule.refresh();
    if (section === 'budget') budgetModule.render();
    if (section === 'learn') learnModule.renderTopics();
    if (section === 'jobs') jobsModule.render();
  },

  setupNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.navigate(btn.dataset.section));
    });
  },

  setupTheme() {
    const saved = localStorage.getItem('lumiere_theme') || 'light';
    this.applyTheme(saved);
    document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
    document.getElementById('themeToggleMobile')?.addEventListener('click', () => this.toggleTheme());
  },

  applyTheme(theme) {
    document.body.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
    document.querySelectorAll('.theme-icon, .theme-toggle-mobile').forEach(i => {
      i.textContent = theme === 'dark' ? '☀' : '☽';
    });
  },

  toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    const theme = isDark ? 'light' : 'dark';
    localStorage.setItem('lumiere_theme', theme);
    this.applyTheme(theme);
  },

  setupFAB() {
    const fab = document.getElementById('fabBtn');
    const menu = document.getElementById('fabMenu');
    fab.addEventListener('click', () => menu.classList.toggle('hidden'));
    document.addEventListener('click', e => {
      if (!fab.contains(e.target) && !menu.contains(e.target)) menu.classList.add('hidden');
    });
  },

  quickAdd(type) {
    document.getElementById('fabMenu').classList.add('hidden');
    if (type === 'task')   { this.navigate('planner'); setTimeout(() => plannerModule.openTaskModal(), 200); }
    if (type === 'note')   { this.navigate('notes'); setTimeout(() => notesModule.createNew(), 200); }
    if (type === 'journal'){ this.navigate('journal'); setTimeout(() => journalModule.newToday(), 200); }
    if (type === 'budget') { this.navigate('budget'); setTimeout(() => budgetModule.openTxModal(), 200); }
  },

  setupGlobalSearch() {
    const overlay = document.getElementById('searchOverlay');
    document.getElementById('closeSearch').addEventListener('click', () => overlay.classList.add('hidden'));
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.add('hidden'); });
    document.getElementById('globalSearchInput').addEventListener('input', e => this.runGlobalSearch(e.target.value));
  },

  openGlobalSearch() {
    document.getElementById('searchOverlay').classList.remove('hidden');
    document.getElementById('globalSearchInput').focus();
  },

  runGlobalSearch(q) {
    const results = document.getElementById('globalSearchResults');
    if (!q.trim()) { results.innerHTML = ''; return; }
    const lq = q.toLowerCase();
    let items = [];
    JSON.parse(localStorage.getItem('lumiere_notes') || '[]')
      .filter(n => n.title.toLowerCase().includes(lq) || (n.content||'').toLowerCase().includes(lq))
      .forEach(n => items.push({ type:'Note', title:n.title, section:'notes' }));
    JSON.parse(localStorage.getItem('lumiere_tasks') || '[]')
      .filter(t => t.title.toLowerCase().includes(lq))
      .forEach(t => items.push({ type:'Task', title:t.title, section:'planner' }));
    JSON.parse(localStorage.getItem('lumiere_journal') || '[]')
      .filter(e => (e.text||'').toLowerCase().includes(lq))
      .forEach(e => items.push({ type:'Journal', title:e.date, section:'journal' }));
    JSON.parse(localStorage.getItem('lumiere_transactions') || '[]')
      .filter(t => t.title.toLowerCase().includes(lq))
      .forEach(t => items.push({ type:'Budget', title:t.title+' ($'+t.amount+')', section:'budget' }));
    results.innerHTML = items.length
      ? items.map(i => `<div class="search-result-item" onclick="app.navigate('${i.section}');document.getElementById('searchOverlay').classList.add('hidden')">
          <span class="result-type">${i.type}</span><span class="result-title">${i.title}</span></div>`).join('')
      : '<p class="empty-hint">No results found.</p>';
  },

  setupMobile() {
    document.getElementById('hamburger').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  },

  updateSidebarDate() {
    const d = new Date();
    document.getElementById('sidebarDate').textContent = d.toLocaleDateString('en-US', { month:'short', day:'numeric' });
  }
};

function showToast(msg, duration=2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), duration);
}

function execCmd(cmd, val) {
  document.execCommand(cmd, false, val || null);
  document.getElementById('richEditor').focus();
}

function insertPrompt(text) {
  const ta = document.getElementById('journalTextarea');
  if (!ta) return;
  const prefix = ta.value ? '\n\n' : '';
  ta.value += prefix + text + '\n';
  ta.focus();
  ta.setSelectionRange(ta.value.length, ta.value.length);
  journalModule.updateWordCount();
}

window.addEventListener('DOMContentLoaded', () => app.init());
