// ============================================================
// LUMIÈRE — dashboard.js
// ============================================================

const QUOTES = [
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Augusta F. Kantra" },
  { text: "She remembered who she was and the game changed.", author: "Lalah Delia" },
  { text: "You are allowed to be both a masterpiece and a work in progress.", author: "Sophia Bush" },
  { text: "Small steps every day are building your future self.", author: "Lumière" },
  { text: "You stayed consistent this week. That's your real glow.", author: "Lumière" },
  { text: "The most powerful thing you can do is show up, even when you don't feel like it.", author: "Lumière" },
  { text: "Your energy is sacred. Protect it. Direct it. Let it bloom.", author: "Lumière" },
  { text: "Growth is not always visible. Trust the roots.", author: "Lumière" },
  { text: "She was not the same. She had grown soft in the places that mattered.", author: "Lumière" },
  { text: "One intentional hour is worth ten distracted ones.", author: "Lumière" },
  { text: "Rest is not a reward. It is part of the process.", author: "Lumière" },
  { text: "Consistency over perfection, always.", author: "Lumière" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The woman who follows the crowd will usually go no further than the crowd. The woman who walks alone is likely to find herself in places no one has ever been before.", author: "Albert Einstein" },
];

const WEEKLY_MESSAGES = [
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
    this.updateDate();
    this.loadQuote();
    document.getElementById('refreshQuote').addEventListener('click', () => this.loadQuote(true));
    this.refresh();
  },

  updateDate() {
    const d = new Date();
    const opts = { weekday:'long', month:'long', day:'numeric', year:'numeric' };
    document.getElementById('dashboardDate').textContent = d.toLocaleDateString('en-US', opts);

    // Update greeting based on time
    const h = d.getHours();
    let greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const titleEl = document.querySelector('#section-dashboard .section-title');
    if (titleEl) titleEl.textContent = `${greeting}, love ✦`;
  },

  loadQuote(forceNew = false) {
    const today = new Date().toDateString();
    let saved = JSON.parse(localStorage.getItem('lumiere_daily_quote') || '{}');
    if (!forceNew && saved.date === today) {
      document.getElementById('quoteText').textContent = saved.text;
      document.getElementById('quoteAuthor').textContent = '— ' + saved.author;
      return;
    }
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    localStorage.setItem('lumiere_daily_quote', JSON.stringify({ date: today, text: q.text, author: q.author }));
    const textEl = document.getElementById('quoteText');
    const authorEl = document.getElementById('quoteAuthor');
    textEl.style.opacity = '0';
    setTimeout(() => {
      textEl.textContent = q.text;
      authorEl.textContent = '— ' + q.author;
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
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    document.getElementById('dailyProgressBar').style.width = pct + '%';
  },

  updateFocusProgress() {
    const today = new Date().toISOString().split('T')[0];
    const focusData = JSON.parse(localStorage.getItem('lumiere_focus_log') || '[]');
    const todayMinutes = focusData
      .filter(s => s.date === today && s.mode === 'focus')
      .reduce((sum, s) => sum + s.minutes, 0);
    document.getElementById('focusTimeStat').textContent = `${todayMinutes} min`;
    const goalMinutes = 120; // 2hr daily goal
    const pct = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));
    document.getElementById('focusProgressBar').style.width = pct + '%';
  },

  updateWeeklyAchievements() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0,0,0,0);

    const tasks = JSON.parse(localStorage.getItem('lumiere_tasks') || '[]');
    const weekTasks = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt) >= weekStart).length;

    const journal = JSON.parse(localStorage.getItem('lumiere_journal') || '[]');
    const weekJournal = journal.filter(e => new Date(e.date) >= weekStart).length;

    const focusLog = JSON.parse(localStorage.getItem('lumiere_focus_log') || '[]');
    const weekFocusMin = focusLog
      .filter(s => new Date(s.date) >= weekStart && s.mode === 'focus')
      .reduce((sum, s) => sum + s.minutes, 0);
    const weekFocusHours = (weekFocusMin / 60).toFixed(1);

    // Streak: count consecutive days with at least 1 completed task
    const streak = this.calcStreak(tasks);

    document.getElementById('weekTasks').textContent = weekTasks;
    document.getElementById('weekJournal').textContent = weekJournal;
    document.getElementById('weekFocus').textContent = weekFocusHours;
    document.getElementById('weekStreak').textContent = streak;
  },

  calcStreak(tasks) {
    const doneByDate = {};
    tasks.filter(t => t.completed && t.completedAt).forEach(t => {
      const d = t.completedAt.split('T')[0];
      doneByDate[d] = true;
    });
    let streak = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().split('T')[0];
      if (doneByDate[key]) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  },

  updateWeeklyMotivation() {
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const msg = WEEKLY_MESSAGES[weekNum % WEEKLY_MESSAGES.length];
    document.getElementById('weeklyMotivation').textContent = msg;
  },

  updateInsights() {
    const container = document.getElementById('insightsList');
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7); weekStart.setHours(0,0,0,0);

    const tasks = JSON.parse(localStorage.getItem('lumiere_tasks') || '[]');
    const recentTasks = tasks.filter(t => new Date(t.date) >= weekStart);
    const completed = recentTasks.filter(t => t.completed).length;
    const total = recentTasks.length;

    const focusLog = JSON.parse(localStorage.getItem('lumiere_focus_log') || '[]');
    const weekFocusMin = focusLog.filter(s => new Date(s.date) >= weekStart && s.mode === 'focus').reduce((a,b) => a + b.minutes, 0);

    const journal = JSON.parse(localStorage.getItem('lumiere_journal') || '[]');
    const weekJournal = journal.filter(e => new Date(e.date) >= weekStart);

    const insights = [];

    if (total === 0) {
      insights.push({ type:'neutral', text: 'Start adding tasks to unlock your personal insights.' });
    } else {
      const rate = Math.round((completed / total) * 100);
      if (rate >= 80) insights.push({ type:'positive', text: `You completed ${rate}% of your tasks this week. You're crushing it. 🌸` });
      else if (rate >= 50) insights.push({ type:'neutral', text: `You completed ${rate}% of tasks. Solid progress — keep the momentum going!` });
      else insights.push({ type:'gentle', text: `You completed ${rate}% of tasks. Consider planning fewer, more focused tasks next week.` });
    }

    if (weekFocusMin >= 300) {
      insights.push({ type:'positive', text: `You logged ${Math.round(weekFocusMin/60)} hours of deep focus this week. That's extraordinary dedication.` });
    } else if (weekFocusMin > 0) {
      insights.push({ type:'neutral', text: `You completed ${weekFocusMin} minutes of focused work. Keep building that habit.` });
    }

    if (weekJournal.length >= 5) {
      insights.push({ type:'positive', text: 'You journaled almost every day this week. Your self-awareness is growing beautifully.' });
    } else if (weekJournal.length >= 2) {
      insights.push({ type:'neutral', text: 'You wrote ' + weekJournal.length + ' journal entries this week. Reflection is your superpower.' });
    }

    // Mood insight
    const moods = weekJournal.map(e => e.mood).filter(Boolean);
    if (moods.length >= 3) {
      const moodCount = moods.reduce((a,b) => { a[b]=(a[b]||0)+1; return a; }, {});
      const topMood = Object.entries(moodCount).sort((a,b)=>b[1]-a[1])[0][0];
      const moodMsg = { happy:'joyful and optimistic', calm:'calm and grounded', motivated:'energized and focused', tired:'tired — remember to rest', stressed:'stressed — be gentle with yourself' };
      if (moodMsg[topMood]) insights.push({ type:'gentle', text: `You felt mostly ${moodMsg[topMood]} this week. ${topMood === 'stressed' || topMood === 'tired' ? 'Your feelings are valid. 💜' : 'Keep nurturing that energy. ✨'}` });
    }

    container.innerHTML = insights.map(i => `
      <div class="insight-item ${i.type}">
        <span class="insight-icon">✦</span>
        <span>${i.text}</span>
      </div>`).join('') || '<div class="insight-item neutral"><span class="insight-icon">✦</span><span>Use the app for a week to see your personal insights.</span></div>';
  },

  updateDashboardTasks() {
    const today = new Date().toISOString().split('T')[0];
    const tasks = JSON.parse(localStorage.getItem('lumiere_tasks') || '[]');
    const todayTasks = tasks.filter(t => t.date === today).slice(0, 5);
    const container = document.getElementById('dashboardTasks');
    if (!todayTasks.length) {
      container.innerHTML = '<p class="empty-hint">No tasks for today — head to Planner to add some 🌿</p>';
      return;
    }
    container.innerHTML = todayTasks.map(t => `
      <div style="display:flex;align-items:center;gap:0.6rem;padding:0.4rem 0;border-bottom:1px solid var(--border)">
        <span style="color:${t.completed?'var(--sage)':'var(--accent)'}">${t.completed?'✓':'○'}</span>
        <span style="font-size:0.86rem;${t.completed?'text-decoration:line-through;opacity:0.55':''}">${t.title}</span>
        <span class="task-cat-badge" style="margin-left:auto">${t.category||'personal'}</span>
      </div>`).join('');
  }
};
