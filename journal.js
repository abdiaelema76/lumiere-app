// ============================================================
// LUMIÈRE — journal.js  v4  (full CRUD)
// ============================================================

const journalModule = {
  entries: [],
  selectedMood: null,
  editingDate: null,
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),

  init() {
    this.load();
    this.setupEvents();
    this.openEditor(this.todayStr());
  },

  load() {
    this.entries = JSON.parse(localStorage.getItem('lumiere_journal') || '[]');
  },

  save() {
    localStorage.setItem('lumiere_journal', JSON.stringify(this.entries));
  },

  todayStr() {
    return new Date().toISOString().split('T')[0];
  },

  refresh() {
    this.load();
    this.renderSidebar();
    this.openEditor(this.editingDate || this.todayStr());
  },

  showTab(tab) {
    ['write','calendar','analysis'].forEach(t => {
      document.getElementById('journalWriteView')?.classList.toggle('hidden', t !== tab && tab === 'calendar' || tab === 'analysis' && t === 'write' || tab === 'write' && t !== 'write');
    });
    document.getElementById('journalWriteView').classList.toggle('hidden', tab !== 'write');
    document.getElementById('journalCalendarView').classList.toggle('hidden', tab !== 'calendar');
    document.getElementById('journalAnalysisView').classList.toggle('hidden', tab !== 'analysis');
    document.querySelectorAll('#section-journal .view-btn').forEach(b => b.classList.remove('active'));
    const map = { write:'jTab-write', calendar:'jTab-calendar', analysis:'jTab-analysis' };
    document.getElementById(map[tab])?.classList.add('active');
    if (tab === 'calendar') this.renderCalendar();
    if (tab === 'analysis') this.renderAnalysis();
  },

  // ── EDITOR ────────────────────────────────────────────────
  openEditor(ds) {
    this.editingDate = ds;
    const entry = this.entries.find(e => e.date === ds);
    const isToday = ds === this.todayStr();
    const d = new Date(ds + 'T12:00:00');
    const label = d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
    document.getElementById('journalTodayLabel').textContent = isToday ? '✦ ' + label : '✎ ' + label;

    // Set the date picker
    const dp = document.getElementById('journalDatePicker');
    if (dp) dp.value = ds;

    const ta = document.getElementById('journalTextarea');
    if (ta) ta.value = entry ? (entry.text || '') : '';

    this.selectedMood = entry ? (entry.mood || null) : null;
    document.querySelectorAll('.mood-btn').forEach(b => {
      b.classList.toggle('selected', !!this.selectedMood && b.dataset.mood === this.selectedMood);
    });
    this.updateWordCount();
    this.renderSidebar();
  },

  newToday() {
    const ta = document.getElementById('journalTextarea');
    if (ta) { ta.value = ''; ta.focus(); }
    this.selectedMood = null;
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    this.editingDate = this.todayStr();
    const dp = document.getElementById('journalDatePicker');
    if (dp) dp.value = this.editingDate;
    const d = new Date();
    const label = d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
    document.getElementById('journalTodayLabel').textContent = '✦ ' + label;
    this.updateWordCount();
    this.renderSidebar();
    showToast('New entry ready — start writing 🌸');
  },

  newEntryForDate(ds) {
    const dp = document.getElementById('journalDatePicker');
    if (dp) dp.value = ds;
    this.openEditor(ds);
    const ta = document.getElementById('journalTextarea');
    if (ta) ta.focus();
    this.showTab('write');
  },

  saveEntry() {
    const ta = document.getElementById('journalTextarea');
    const text = ta ? ta.value.trim() : '';
    if (!text) { showToast('Write something first 🌸'); return; }
    const ds = this.editingDate || this.todayStr();
    const idx = this.entries.findIndex(e => e.date === ds);
    const entry = { date: ds, text, mood: this.selectedMood, savedAt: new Date().toISOString() };
    if (idx >= 0) this.entries[idx] = entry;
    else this.entries.push(entry);
    this.save();
    this.renderSidebar();
    if (typeof dashboardModule !== 'undefined') dashboardModule.refresh();
    showToast('Entry saved ✦');
  },

  deleteEntry(ds) {
    if (!confirm('Delete this journal entry? This cannot be undone.')) return;
    this.entries = this.entries.filter(e => e.date !== ds);
    this.save();
    if (ds === this.editingDate) {
      document.getElementById('journalTextarea').value = '';
      this.selectedMood = null;
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
      this.updateWordCount();
    }
    this.renderSidebar();
    if (typeof dashboardModule !== 'undefined') dashboardModule.refresh();
    showToast('Entry deleted');
  },

  editEntry(ds) {
    this.showTab('write');
    this.openEditor(ds);
    document.getElementById('journalTextarea')?.focus();
  },

  // ── SIDEBAR ───────────────────────────────────────────────
  renderSidebar() {
    const container = document.getElementById('journalEntriesSidebar');
    if (!container) return;
    const sorted = [...this.entries].sort((a,b) => b.date.localeCompare(a.date));
    if (!sorted.length) {
      container.innerHTML = '<p style="font-size:0.78rem;color:var(--text-3);padding:0.3rem 0">No entries yet. Start writing! 🌸</p>';
      return;
    }
    const moodEmoji = { happy:'😊', calm:'😌', motivated:'🔥', tired:'😴', stressed:'😰' };
    container.innerHTML = sorted.map(e => {
      const label = new Date(e.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
      const preview = (e.text||'').replace(/\n/g,' ').substring(0,48);
      const active = e.date === this.editingDate ? ' active' : '';
      return `<div class="journal-entry-item${active}">
        <div onclick="journalModule.openEditor('${e.date}')" style="flex:1;cursor:pointer;min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:0.3rem">
            <span class="jei-date">${label}</span>
            <span style="font-size:0.9rem">${moodEmoji[e.mood]||''}</span>
          </div>
          <div class="jei-preview">${preview||'(empty)'}…</div>
        </div>
        <div style="display:flex;gap:0.2rem;flex-shrink:0;margin-left:0.3rem">
          <button onclick="journalModule.editEntry('${e.date}')" title="Edit" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.8rem;padding:0.2rem 0.3rem;border-radius:4px" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-3)'">✎</button>
          <button onclick="journalModule.deleteEntry('${e.date}')" title="Delete" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.85rem;padding:0.2rem 0.3rem;border-radius:4px" onmouseover="this.style.color='#e06c75'" onmouseout="this.style.color='var(--text-3)'">✕</button>
        </div>
      </div>`;
    }).join('');
  },

  updateWordCount() {
    const ta = document.getElementById('journalTextarea');
    const wc = document.getElementById('journalWordCount');
    if (!ta || !wc) return;
    const words = ta.value.trim().split(/\s+/).filter(Boolean).length;
    wc.textContent = `${words} word${words!==1?'s':''}`;
  },

  searchEntries(q) {
    const container = document.getElementById('journalEntriesSidebar');
    if (!container) return;
    if (!q.trim()) { this.renderSidebar(); return; }
    const lq = q.toLowerCase();
    const matches = this.entries.filter(e => (e.text||'').toLowerCase().includes(lq));
    const moodEmoji = { happy:'😊', calm:'😌', motivated:'🔥', tired:'😴', stressed:'😰' };
    if (!matches.length) { container.innerHTML = '<p style="font-size:0.78rem;color:var(--text-3)">No matches.</p>'; return; }
    container.innerHTML = matches.sort((a,b)=>b.date.localeCompare(a.date)).map(e => {
      const label = new Date(e.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
      const preview = (e.text||'').replace(/\n/g,' ').substring(0,48);
      return `<div class="journal-entry-item">
        <div onclick="journalModule.openEditor('${e.date}')" style="flex:1;cursor:pointer;min-width:0">
          <div style="display:flex;justify-content:space-between">
            <span class="jei-date">${label}</span><span>${moodEmoji[e.mood]||''}</span>
          </div>
          <div class="jei-preview">${preview}…</div>
        </div>
        <button onclick="journalModule.deleteEntry('${e.date}')" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.85rem;padding:0.2rem;flex-shrink:0">✕</button>
      </div>`;
    }).join('');
  },

  renderCalendar() {
    const cal = document.getElementById('journalCalendar');
    if (!cal) return;
    const d = new Date(this.calYear, this.calMonth, 1);
    const monthName = d.toLocaleDateString('en-US',{month:'long',year:'numeric'});
    const entryDates = new Set(this.entries.map(e => e.date));
    const today = this.todayStr();
    const daysInMonth = new Date(this.calYear, this.calMonth+1, 0).getDate();
    const firstDay = d.getDay();
    let cells = ['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>`<div class="cal-day-label">${d}</div>`).join('');
    for (let i = 0; i < firstDay; i++) cells += '<div class="cal-day empty"></div>';
    for (let day = 1; day <= daysInMonth; day++) {
      const ds = `${this.calYear}-${String(this.calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const cls = ['cal-day', entryDates.has(ds)?'has-entry':'', ds===today?'today':''].filter(Boolean).join(' ');
      cells += `<div class="${cls}" data-ds="${ds}" onclick="journalModule.selectCalDate('${ds}')">${day}</div>`;
    }
    cal.innerHTML = `
      <div class="cal-header">
        <button class="nav-arrow" onclick="journalModule.calNav(-1)">‹</button>
        <span class="cal-title">${monthName}</span>
        <button class="nav-arrow" onclick="journalModule.calNav(1)">›</button>
      </div>
      <div class="cal-grid">${cells}</div>`;
  },

  calNav(dir) {
    this.calMonth += dir;
    if (this.calMonth < 0) { this.calMonth = 11; this.calYear--; }
    if (this.calMonth > 11) { this.calMonth = 0; this.calYear++; }
    this.renderCalendar();
  },

  selectCalDate(ds) {
    document.querySelectorAll('.cal-day.selected').forEach(el=>el.classList.remove('selected'));
    document.querySelector(`.cal-day[data-ds="${ds}"]`)?.classList.add('selected');
    const entry = this.entries.find(e=>e.date===ds);
    this.showCalPreview(entry, ds);
  },

  showCalPreview(entry, ds) {
    const preview = document.getElementById('journalEntryPreview');
    if (!preview) return;
    const moodEmoji = {happy:'😊',calm:'😌',motivated:'🔥',tired:'😴',stressed:'😰'};
    const dateLabel = new Date(ds+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    if (!entry) {
      preview.innerHTML = `<p style="color:var(--text-3);font-size:0.9rem;margin-bottom:1rem">No entry for ${dateLabel}.</p>
        <button class="btn-soft" onclick="journalModule.newEntryForDate('${ds}')">✎ Write entry for this day</button>`;
      return;
    }
    preview.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem">
        <span style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:var(--text)">${dateLabel}</span>
        <div style="display:flex;align-items:center;gap:0.4rem">
          ${entry.mood?`<span style="font-size:1.3rem">${moodEmoji[entry.mood]}</span>`:''}
          <button class="btn-soft" style="font-size:0.75rem;padding:0.25rem 0.7rem" onclick="journalModule.editEntry('${ds}')">Edit ✎</button>
          <button class="btn-ghost" style="font-size:0.75rem;padding:0.25rem 0.7rem;color:#e06c75;border-color:#e06c75" onclick="journalModule.deleteEntry('${ds}')">Delete ✕</button>
        </div>
      </div>
      <p style="font-family:'Cormorant Garamond',serif;font-size:1.05rem;line-height:1.85;color:var(--text);white-space:pre-wrap">${entry.text}</p>`;
  },

  renderAnalysis() {
    const container = document.getElementById('analysisContent');
    if (!container) return;
    this.load();
    if (this.entries.length < 3) {
      container.innerHTML = '<p class="empty-hint">Write at least 3 journal entries to unlock your weekly analysis. 🌸</p>';
      return;
    }
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate()-7);
    const week = this.entries.filter(e => new Date(e.date) >= weekStart);
    if (!week.length) { container.innerHTML = '<p class="empty-hint">No entries this week yet.</p>'; return; }
    const moods = week.map(e=>e.mood).filter(Boolean);
    const moodCount = moods.reduce((a,b)=>{a[b]=(a[b]||0)+1;return a;},{});
    const topMood = Object.entries(moodCount).sort((a,b)=>b[1]-a[1])[0];
    const moodEmoji = {happy:'😊',calm:'😌',motivated:'🔥',tired:'😴',stressed:'😰'};
    const allText = week.map(e=>e.text||'').join(' ').toLowerCase();
    const themes = ['focus','study','work','rest','happy','productive','creative','health','goals','discipline','progress','grateful','proud'].filter(k=>allText.includes(k));
    const hasAch = ['completed','finished','achieved','done','accomplished','proud','succeeded'].some(w=>allText.includes(w));
    const tips = [];
    if ((moodCount.stressed||0)>=2) tips.push('You felt stressed more than once. Consider lighter planning.');
    if ((moodCount.tired||0)>=2) tips.push('Rest appeared often. Honor your body\'s needs.');
    if ((moodCount.happy||0)>=3||(moodCount.motivated||0)>=3) tips.push('High energy and positivity this week. Ride this wave!');
    if (week.length>=5) tips.push('You showed up almost every day. That consistency is your achievement.');
    if (!tips.length) tips.push('Keep writing. Patterns reveal themselves over time. You are doing beautifully.');
    container.innerHTML = `
      <div class="analysis-section"><h4>✦ This Week</h4>
        <div class="analysis-item">You wrote <strong>${week.length}</strong> entr${week.length===1?'y':'ies'} this week.</div>
        ${topMood?`<div class="analysis-item">${moodEmoji[topMood[0]]||''} Dominant mood: <strong>${topMood[0]}</strong> (${topMood[1]}×).</div>`:''}
      </div>
      ${themes.length?`<div class="analysis-section"><h4>🌸 Themes</h4>${themes.slice(0,5).map(t=>`<div class="analysis-item">You wrote about <strong>${t}</strong>.</div>`).join('')}</div>`:''}
      ${hasAch?`<div class="analysis-section"><h4>🏆 Progress</h4><div class="analysis-item">Your entries reflect completion and achievement.</div></div>`:''}
      <div class="analysis-section"><h4>💜 Reflection</h4>${tips.map(t=>`<div class="analysis-item">${t}</div>`).join('')}</div>`;
  },

  setupEvents() {
    document.getElementById('saveJournalBtn')?.addEventListener('click', () => this.saveEntry());
    document.getElementById('journalTextarea')?.addEventListener('input', () => this.updateWordCount());
    document.getElementById('journalSearch')?.addEventListener('input', e => this.searchEntries(e.target.value));
    document.getElementById('journalNewBtn')?.addEventListener('click', () => this.newToday());

    // Date picker
    document.getElementById('journalDatePicker')?.addEventListener('change', e => {
      if (e.target.value) this.openEditor(e.target.value);
    });

    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedMood = btn.dataset.mood;
      });
    });

    document.getElementById('jTab-write')?.addEventListener('click', () => this.showTab('write'));
    document.getElementById('jTab-calendar')?.addEventListener('click', () => this.showTab('calendar'));
    document.getElementById('jTab-analysis')?.addEventListener('click', () => this.showTab('analysis'));
  }
};
