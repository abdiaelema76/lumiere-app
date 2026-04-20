// ============================================================
// LUMIÈRE — dashboard.js  (v3)
// ============================================================

const QUOTES = [
  { text:"Discipline is choosing between what you want now and what you want most.", author:"Augusta F. Kantra" },
  { text:"She remembered who she was and the game changed.", author:"Lalah Delia" },
  { text:"You are allowed to be both a masterpiece and a work in progress.", author:"Sophia Bush" },
  { text:"Small steps every day are building your future self.", author:"Lumière" },
  { text:"You stayed consistent this week. That's your real glow.", author:"Lumière" },
  { text:"The most powerful thing you can do is show up, even when you don't feel like it.", author:"Lumière" },
  { text:"Your energy is sacred. Protect it. Direct it. Let it bloom.", author:"Lumière" },
  { text:"Growth is not always visible. Trust the roots.", author:"Lumière" },
  { text:"One intentional hour is worth ten distracted ones.", author:"Lumière" },
  { text:"Rest is not a reward. It is part of the process.", author:"Lumière" },
  { text:"Consistency over perfection, always.", author:"Lumière" },
  { text:"Do the work. The universe rewards action.", author:"Lumière" },
];

const WEEKLY_MSGS = [
  "Keep showing up. Every small act of discipline is a love letter to your future self.",
  "You are doing better than you think. Be gentle with yourself.",
  "Consistency is a form of self-love. You are proving that to yourself.",
  "The work you do in quiet moments defines the person you become.",
  "Progress isn't always loud. Sometimes it looks like rest, reflection, and trying again.",
  "Your only competition is who you were yesterday.",
  "Every day you choose growth is a day you choose yourself.",
];

const dashboardModule = {
  init() {
    this.updateGreeting();
    this.loadQuote();
    this.renderCustomQuotes();
    this.loadWeeklyMessageEditor();
    this.refresh();
    document.getElementById('refreshQuote')?.addEventListener('click', () => this.loadQuote(true));
  },

  updateGreeting() {
    const h = new Date().getHours();
    const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    document.querySelector('#section-dashboard .section-title').textContent = `${greeting}, love ✦`;
    const d = new Date();
    document.getElementById('dashboardDate').textContent =
      d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  },

  loadQuote(forceNew = false) {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('lumiere_daily_quote') || '{}');
    if (!forceNew && saved.date === today) {
      document.getElementById('quoteText').textContent = saved.text;
      document.getElementById('quoteAuthor').textContent = '— ' + saved.author;
      return;
    }
    const custom = JSON.parse(localStorage.getItem('lumiere_custom_quotes') || '[]');
    const all = [...QUOTES, ...custom.map(q => ({ text: q.text, author: q.author || 'You' }))];
    const q = all[Math.floor(Math.random() * all.length)];
    localStorage.setItem('lumiere_daily_quote', JSON.stringify({ date: today, text: q.text, author: q.author }));
    const textEl = document.getElementById('quoteText');
    textEl.style.opacity = '0';
    setTimeout(() => {
      textEl.textContent = q.text;
      document.getElementById('quoteAuthor').textContent = '— ' + q.author;
      textEl.style.transition = 'opacity 0.5s';
      textEl.style.opacity = '1';
    }, 200);
  },

  refresh() {
    this.updateTaskProgress();
    this.updateFocusProgress();
    this.updateWeeklyAchievements();
    this.updateWeeklyMotivation();
    this.updateInsights();
    this.updateDashboardTasks();
  },

  updateTaskProgress() {
    const today = new Date().toISOString().split('T')[0];
    const tasks = JSON.parse(localStorage.getItem('lumiere_tasks') || '[]');
    const todayTasks = tasks.filter(t => t.date === today);
    const done = todayTasks.filter(t => t.completed).length;
    const total = todayTasks.length;
    document.getElementById('tasksCompletedStat').textContent = `${done} / ${total}`;
    document.getElementById('dailyProgressBar').style.width = (total > 0 ? Math.round(done/total*100) : 0) + '%';
  },

  updateFocusProgress() {
    const today = new Date().toISOString().split('T')[0];
    const log = JSON.parse(localStorage.getItem('lumiere_focus_log') || '[]');
    const mins = log.filter(s => s.date === today && s.mode === 'focus').reduce((a,b) => a + b.minutes, 0);
    document.getElementById('focusTimeStat').textContent = `${mins} min`;
    document.getElementById('focusProgressBar').style.width = Math.min(100, Math.round(mins/120*100)) + '%';
  },

  updateWeeklyAchievements() {
    const now = new Date();
    const ws = new Date(now); ws.setDate(now.getDate() - now.getDay()); ws.setHours(0,0,0,0);
    const tasks = JSON.parse(localStorage.getItem('lumiere_tasks') || '[]');
    const wt = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt) >= ws).length;
    const journal = JSON.parse(localStorage.getItem('lumiere_journal') || '[]');
    const wj = journal.filter(e => new Date(e.date) >= ws).length;
    const log = JSON.parse(localStorage.getItem('lumiere_focus_log') || '[]');
    const wfh = (log.filter(s => new Date(s.date) >= ws && s.mode === 'focus').reduce((a,b) => a+b.minutes, 0) / 60).toFixed(1);
    document.getElementById('weekTasks').textContent = wt;
    document.getElementById('weekJournal').textContent = wj;
    document.getElementById('weekFocus').textContent = wfh;
    document.getElementById('weekStreak').textContent = this.calcStreak(tasks);
  },

  calcStreak(tasks) {
    const doneByDate = {};
    tasks.filter(t => t.completed && t.completedAt).forEach(t => { doneByDate[t.completedAt.split('T')[0]] = true; });
    let streak = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().split('T')[0];
      if (doneByDate[key]) { streak++; d.setDate(d.getDate()-1); } else break;
    }
    return streak;
  },

  updateWeeklyMotivation() {
    const custom = localStorage.getItem('lumiere_weekly_message');
    const msg = custom || WEEKLY_MSGS[Math.floor(Date.now()/(7*24*60*60*1000)) % WEEKLY_MSGS.length];
    document.getElementById('weeklyMotivation').textContent = msg;
  },

  updateInsights() {
    const container = document.getElementById('insightsList');
    if (!container) return;
    const ws = new Date(); ws.setDate(ws.getDate()-7);
    const tasks = JSON.parse(localStorage.getItem('lumiere_tasks') || '[]');
    const rt = tasks.filter(t => new Date(t.date) >= ws);
    const done = rt.filter(t => t.completed).length;
    const total = rt.length;
    const log = JSON.parse(localStorage.getItem('lumiere_focus_log') || '[]');
    const wfm = log.filter(s => new Date(s.date) >= ws && s.mode === 'focus').reduce((a,b) => a+b.minutes, 0);
    const journal = JSON.parse(localStorage.getItem('lumiere_journal') || '[]');
    const wj = journal.filter(e => new Date(e.date) >= ws);
    const insights = [];
    if (total === 0) {
      insights.push({ type:'neutral', text:'Start adding tasks to unlock your personal insights.' });
    } else {
      const rate = Math.round(done/total*100);
      if (rate >= 80) insights.push({ type:'positive', text:`You completed ${rate}% of your tasks this week. You're crushing it. 🌸` });
      else if (rate >= 50) insights.push({ type:'neutral', text:`You completed ${rate}% of tasks. Keep that momentum going!` });
      else insights.push({ type:'gentle', text:`You completed ${rate}% of tasks. Consider planning fewer, more focused tasks next week.` });
    }
    if (wfm >= 300) insights.push({ type:'positive', text:`You logged ${Math.round(wfm/60)} hours of deep focus. Extraordinary dedication.` });
    else if (wfm > 0) insights.push({ type:'neutral', text:`${wfm} minutes of focused work this week. Keep building that habit.` });
    if (wj.length >= 5) insights.push({ type:'positive', text:'You journaled almost every day this week. Your self-awareness is growing beautifully.' });
    else if (wj.length >= 2) insights.push({ type:'neutral', text:`${wj.length} journal entries this week. Reflection is your superpower.` });
    const moods = wj.map(e => e.mood).filter(Boolean);
    if (moods.length >= 3) {
      const mc = moods.reduce((a,b) => { a[b]=(a[b]||0)+1; return a; }, {});
      const top = Object.entries(mc).sort((a,b) => b[1]-a[1])[0][0];
      const mm = { happy:'joyful', calm:'calm and grounded', motivated:'energized', tired:'tired — rest is needed', stressed:'stressed — be gentle with yourself' };
      if (mm[top]) insights.push({ type:'gentle', text:`You felt mostly ${mm[top]} this week.` });
    }
    container.innerHTML = insights.map(i => `<div class="insight-item ${i.type}"><span class="insight-icon">✦</span><span>${i.text}</span></div>`).join('') ||
      '<div class="insight-item neutral"><span class="insight-icon">✦</span><span>Use the app for a week to see your personal insights.</span></div>';
  },

  updateDashboardTasks() {
    const today = new Date().toISOString().split('T')[0];
    const tasks = JSON.parse(localStorage.getItem('lumiere_tasks') || '[]').filter(t => t.date === today).slice(0,5);
    const container = document.getElementById('dashboardTasks');
    if (!container) return;
    if (!tasks.length) { container.innerHTML = '<p class="empty-hint">No tasks for today — head to Planner to add some 🌿</p>'; return; }
    container.innerHTML = tasks.map(t => `
      <div style="display:flex;align-items:center;gap:0.6rem;padding:0.4rem 0;border-bottom:1px solid var(--border)">
        <span style="color:${t.completed?'var(--sage)':'var(--accent)'};font-size:1rem">${t.completed?'✓':'○'}</span>
        <span style="font-size:0.86rem;${t.completed?'text-decoration:line-through;opacity:0.5':''}">${t.title}</span>
        <span class="task-cat-badge" style="margin-left:auto">${t.category||''}</span>
      </div>`).join('');
  },

  // ── CUSTOM QUOTES ────────────────────────────────────────────
  addCustomQuote() {
    const text = document.getElementById('customQuoteText')?.value.trim();
    if (!text) { showToast('Enter a quote first 🌸'); return; }
    const author = document.getElementById('customQuoteAuthor')?.value.trim() || 'You';
    const quotes = JSON.parse(localStorage.getItem('lumiere_custom_quotes') || '[]');
    quotes.push({ id: Date.now().toString(), text, author });
    localStorage.setItem('lumiere_custom_quotes', JSON.stringify(quotes));
    document.getElementById('customQuoteText').value = '';
    document.getElementById('customQuoteAuthor').value = '';
    this.renderCustomQuotes();
    showToast('Quote added ✦');
  },

  deleteCustomQuote(id) {
    const quotes = JSON.parse(localStorage.getItem('lumiere_custom_quotes') || '[]').filter(q => q.id !== id);
    localStorage.setItem('lumiere_custom_quotes', JSON.stringify(quotes));
    this.renderCustomQuotes();
    showToast('Quote removed');
  },

  renderCustomQuotes() {
    const container = document.getElementById('customQuotesList');
    if (!container) return;
    const quotes = JSON.parse(localStorage.getItem('lumiere_custom_quotes') || '[]');
    if (!quotes.length) {
      container.innerHTML = '<p style="font-size:0.78rem;color:var(--text-3);padding:0.3rem 0">No custom quotes yet. Add your first one below!</p>';
      return;
    }
    container.innerHTML = quotes.map(q => `
      <div class="custom-quote-item">
        <div style="flex:1;min-width:0">
          <div style="font-family:'Cormorant Garamond',serif;font-size:0.95rem;font-style:italic;color:var(--text)">"${q.text}"</div>
          <div style="font-size:0.72rem;color:var(--text-3);margin-top:0.2rem">— ${q.author}</div>
        </div>
        <button onclick="dashboardModule.deleteCustomQuote('${q.id}')" title="Remove"
          style="background:none;border:none;color:var(--text-3);cursor:pointer;font-size:1rem;padding:0.2rem;flex-shrink:0;line-height:1">×</button>
      </div>`).join('');
  },

  // ── WEEKLY MESSAGE ───────────────────────────────────────────
  saveWeeklyMessage() {
    const msg = document.getElementById('weeklyMessageInput')?.value.trim();
    if (!msg) { showToast('Write a message first 🌸'); return; }
    localStorage.setItem('lumiere_weekly_message', msg);
    document.getElementById('weeklyMotivation').textContent = msg;
    showToast('Weekly message saved ✦');
  },

  clearWeeklyMessage() {
    localStorage.removeItem('lumiere_weekly_message');
    if (document.getElementById('weeklyMessageInput')) document.getElementById('weeklyMessageInput').value = '';
    this.updateWeeklyMotivation();
    showToast('Reverted to auto message');
  },

  loadWeeklyMessageEditor() {
    const saved = localStorage.getItem('lumiere_weekly_message');
    const input = document.getElementById('weeklyMessageInput');
    if (saved && input) input.value = saved;
  }
};
