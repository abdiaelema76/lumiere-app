// ============================================================
// LUMIÈRE — journal.js
// ============================================================

const journalModule = {
  entries: [],
  selectedMood: null,
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  activeTab: 'write',

  init() {
    this.entries = JSON.parse(localStorage.getItem('lumiere_journal') || '[]');
    this.setupEvents();
    this.refresh();
  },

  setupEvents() {
    document.getElementById('saveJournalBtn').addEventListener('click', () => this.saveEntry());
    document.getElementById('journalTextarea').addEventListener('input', () => this.updateWordCount());
    document.getElementById('journalSearch').addEventListener('input', e => this.searchEntries(e.target.value));

    // Mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedMood = btn.dataset.mood;
      });
    });

    // Tabs
    document.getElementById('journalWriteTab').addEventListener('click', () => this.switchTab('write'));
    document.getElementById('journalCalendarTab').addEventListener('click', () => this.switchTab('calendar'));
    document.getElementById('journalAnalysisTab').addEventListener('click', () => this.switchTab('analysis'));
  },

  switchTab(tab) {
    this.activeTab = tab;
    ['write','calendar','analysis'].forEach(t => {
      document.getElementById(`journalWriteView`).classList.toggle('hidden', t !== tab && tab !== 'write' ? true : tab !== t);
      // fix below properly:
    });
    document.getElementById('journalWriteView').classList.toggle('hidden', tab !== 'write');
    document.getElementById('journalCalendarView').classList.toggle('hidden', tab !== 'calendar');
    document.getElementById('journalAnalysisView').classList.toggle('hidden', tab !== 'analysis');

    document.querySelectorAll('.header-actions .view-btn').forEach(b => b.classList.remove('active'));
    const tabBtn = { write:'journalWriteTab', calendar:'journalCalendarTab', analysis:'journalAnalysisTab' }[tab];
    document.getElementById(tabBtn)?.classList.add('active');

    if (tab === 'calendar') this.renderCalendar();
    if (tab === 'analysis') this.renderAnalysis();
  },

  refresh() {
    this.updateTodayLabel();
    this.loadTodayEntry();
    this.updateWordCount();
  },

  updateTodayLabel() {
    const d = new Date();
    document.getElementById('journalTodayLabel').textContent = d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  },

  loadTodayEntry() {
    const today = new Date().toISOString().split('T')[0];
    const entry = this.entries.find(e => e.date === today);
    if (entry) {
      document.getElementById('journalTextarea').value = entry.text || '';
      this.selectedMood = entry.mood || null;
      if (entry.mood) {
        document.querySelectorAll('.mood-btn').forEach(b => {
          b.classList.toggle('selected', b.dataset.mood === entry.mood);
        });
      }
    } else {
      document.getElementById('journalTextarea').value = '';
    }
    this.updateWordCount();
  },

  updateWordCount() {
    const words = document.getElementById('journalTextarea').value.trim().split(/\s+/).filter(Boolean).length;
    document.getElementById('journalWordCount').textContent = `${words} word${words !== 1 ? 's' : ''}`;
  },

  saveEntry() {
    const text = document.getElementById('journalTextarea').value.trim();
    if (!text) { showToast('Write something before saving 🌸'); return; }
    const today = new Date().toISOString().split('T')[0];
    const existing = this.entries.findIndex(e => e.date === today);
    const entry = { date: today, text, mood: this.selectedMood, savedAt: new Date().toISOString() };
    if (existing >= 0) this.entries[existing] = entry;
    else this.entries.push(entry);
    this.saveEntries();
    showToast('Entry saved ✦');
    dashboardModule.refresh();
  },

  searchEntries(q) {
    if (!q.trim() || this.activeTab !== 'calendar') return;
    const lq = q.toLowerCase();
    const results = this.entries.filter(e => (e.text||'').toLowerCase().includes(lq));
    const preview = document.getElementById('journalEntryPreview');
    if (!results.length) { preview.innerHTML = '<p class="empty-hint">No entries matching that search.</p>'; return; }
    this.renderEntryPreview(results[0]);
  },

  renderCalendar() {
    const cal = document.getElementById('journalCalendar');
    const d = new Date(this.calYear, this.calMonth, 1);
    const monthName = d.toLocaleDateString('en-US', { month:'long', year:'numeric' });
    const entryDates = new Set(this.entries.map(e => e.date));
    const today = new Date().toISOString().split('T')[0];
    const daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    const firstDay = d.getDay();

    let grid = '<div class="cal-grid">';
    ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(day => {
      grid += `<div class="cal-day-label">${day}</div>`;
    });
    for (let i = 0; i < firstDay; i++) grid += '<div class="cal-day empty"></div>';
    for (let day = 1; day <= daysInMonth; day++) {
      const ds = `${this.calYear}-${String(this.calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const hasEntry = entryDates.has(ds);
      const isToday = ds === today;
      grid += `<div class="cal-day${hasEntry?' has-entry':''}${isToday?' today':''}" onclick="journalModule.selectCalDate('${ds}')">${day}</div>`;
    }
    grid += '</div>';

    cal.innerHTML = `
      <div class="cal-header">
        <button class="nav-arrow" onclick="journalModule.changeCalMonth(-1)">‹</button>
        <span class="cal-title">${monthName}</span>
        <button class="nav-arrow" onclick="journalModule.changeCalMonth(1)">›</button>
      </div>
      ${grid}`;
  },

  changeCalMonth(dir) {
    this.calMonth += dir;
    if (this.calMonth < 0) { this.calMonth = 11; this.calYear--; }
    if (this.calMonth > 11) { this.calMonth = 0; this.calYear++; }
    this.renderCalendar();
  },

  selectCalDate(ds) {
    const entry = this.entries.find(e => e.date === ds);
    document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
    const cells = document.querySelectorAll('.cal-day');
    cells.forEach(cell => {
      if (cell.onclick && cell.onclick.toString().includes(ds)) cell.classList.add('selected');
    });
    this.renderEntryPreview(entry, ds);
  },

  renderEntryPreview(entry, ds = null) {
    const preview = document.getElementById('journalEntryPreview');
    if (!entry) {
      const dateLabel = ds ? new Date(ds + 'T12:00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' }) : '';
      preview.innerHTML = `<p class="empty-hint">${dateLabel ? `No entry for ${dateLabel}.` : 'Select a date with an entry.'}</p>`;
      return;
    }
    const dateLabel = new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
    const moodEmoji = { happy:'😊', calm:'😌', motivated:'🔥', tired:'😴', stressed:'😰' };
    preview.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <span style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:var(--text)">${dateLabel}</span>
        ${entry.mood ? `<span style="font-size:1.4rem">${moodEmoji[entry.mood]||''}</span>` : ''}
      </div>
      <p style="font-family:'Cormorant Garamond',serif;font-size:1.05rem;line-height:1.85;color:var(--text);white-space:pre-wrap">${entry.text}</p>`;
  },

  renderAnalysis() {
    const container = document.getElementById('analysisContent');
    if (this.entries.length < 3) {
      container.innerHTML = '<p class="empty-hint">Write at least 3 journal entries to unlock your weekly analysis. 🌸</p>';
      return;
    }

    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
    const weekEntries = this.entries.filter(e => new Date(e.date) >= weekStart);

    if (!weekEntries.length) {
      container.innerHTML = '<p class="empty-hint">No entries this week. Start writing to see your analysis.</p>';
      return;
    }

    // Mood analysis
    const moods = weekEntries.map(e => e.mood).filter(Boolean);
    const moodCount = moods.reduce((a,b) => { a[b]=(a[b]||0)+1; return a; }, {});
    const topMood = Object.entries(moodCount).sort((a,b)=>b[1]-a[1])[0];
    const moodEmoji = { happy:'😊', calm:'😌', motivated:'🔥', tired:'😴', stressed:'😰' };

    // Word frequency for themes
    const allText = weekEntries.map(e => e.text||'').join(' ').toLowerCase();
    const keywords = ['focus','study','work','rest','tired','happy','anxious','productive','creative','health','family','friends','goals','discipline','progress'];
    const themes = keywords.filter(k => allText.includes(k));

    // Achievements (things mentioned positively)
    const achieveWords = ['completed','finished','achieved','done','accomplished','proud','succeeded','managed'];
    const achievements = achieveWords.filter(w => allText.includes(w));

    container.innerHTML = `
      <div class="analysis-section">
        <h4>✦ This Week's Summary</h4>
        <div class="analysis-item">You wrote ${weekEntries.length} journal entr${weekEntries.length === 1?'y':'ies'} this week. That's beautiful self-awareness.</div>
        ${topMood ? `<div class="analysis-item">${moodEmoji[topMood[0]]||''} Your dominant mood was <strong>${topMood[0]}</strong> — you felt this way ${topMood[1]} time${topMood[1]>1?'s':''}.</div>` : ''}
      </div>
      ${themes.length ? `<div class="analysis-section">
        <h4>🌸 Recurring Themes</h4>
        ${themes.slice(0,5).map(t => `<div class="analysis-item">You wrote about <strong>${t}</strong> this week.</div>`).join('')}
      </div>` : ''}
      ${achievements.length ? `<div class="analysis-section">
        <h4>🏆 Signs of Progress</h4>
        <div class="analysis-item">Your entries show language of completion and achievement — you're getting things done.</div>
      </div>` : ''}
      <div class="analysis-section">
        <h4>💜 Gentle Reflection</h4>
        ${this.generateGentleFeedback(weekEntries, moodCount)}
      </div>`;
  },

  generateGentleFeedback(entries, moodCount) {
    const tips = [];
    if (moodCount.stressed >= 2) tips.push('<div class="analysis-item">You felt stressed more than once this week. Consider lighter planning and more breathing room.</div>');
    if (moodCount.tired >= 2) tips.push('<div class="analysis-item">Rest showed up often in your week. Your body is asking for recovery — honor that.</div>');
    if (moodCount.happy >= 3 || moodCount.motivated >= 3) tips.push('<div class="analysis-item">You were in a high-energy, positive space this week. Ride this momentum.</div>');
    if (entries.length >= 5) tips.push('<div class="analysis-item">You showed up for yourself almost every day. That consistency is your real achievement.</div>');
    if (!tips.length) tips.push('<div class="analysis-item">Keep writing. The patterns in your life will reveal themselves over time. You are doing beautifully.</div>');
    return tips.join('');
  },

  saveEntries() {
    localStorage.setItem('lumiere_journal', JSON.stringify(this.entries));
  }
};
