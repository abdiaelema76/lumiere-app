// ============================================================
// LUMIÈRE — focus.js  (timestamp-based, accurate for any duration)
// ============================================================

const FOCUS_QUOTES = [
  '"Do the work. The universe rewards action."',
  '"Consistency is a form of self-love."',
  '"You don\'t have to feel like it. You just have to start."',
  '"One focused hour changes everything."',
  '"Your future self is watching. Make her proud."',
  '"Silence is productive. Use it."',
  '"Deep work is a superpower in a distracted world."',
  '"You are not behind. You are exactly where you need to begin."',
  '"The secret of getting ahead is getting started."',
  '"Focus is the art of knowing what to ignore."',
];

const focusModule = {
  mode: 'focus',
  running: false,
  totalMs: 25 * 60 * 1000,       // total milliseconds for session
  startTimestamp: null,           // Date.now() when timer started
  pausedRemaining: null,          // ms remaining when paused
  rafId: null,                    // requestAnimationFrame id
  sessions: [],

  init() {
    this.sessions = JSON.parse(localStorage.getItem('lumiere_focus_log') || '[]');
    this.setupEvents();
    this.restoreState();
    this.updateStats();
    this.rotateFocusQuote();
  },

  // ── PERSIST STATE ─────────────────────────────────────────
  saveState() {
    const state = {
      mode: this.mode,
      running: this.running,
      totalMs: this.totalMs,
      startTimestamp: this.startTimestamp,
      pausedRemaining: this.pausedRemaining,
      durations: {
        focus: parseInt(document.getElementById('focusDuration')?.value)||25,
        fun:   parseInt(document.getElementById('funDuration')?.value)||10,
        rest:  parseInt(document.getElementById('restDuration')?.value)||5,
      }
    };
    localStorage.setItem('lumiere_timer_state', JSON.stringify(state));
  },

  restoreState() {
    const raw = localStorage.getItem('lumiere_timer_state');
    if (!raw) { this.setMode('focus'); return; }
    try {
      const s = JSON.parse(raw);
      this.mode = s.mode || 'focus';
      this.totalMs = s.totalMs || 25*60*1000;
      // Restore duration inputs
      if (s.durations) {
        if (document.getElementById('focusDuration')) document.getElementById('focusDuration').value = s.durations.focus;
        if (document.getElementById('funDuration'))   document.getElementById('funDuration').value   = s.durations.fun;
        if (document.getElementById('restDuration'))  document.getElementById('restDuration').value  = s.durations.rest;
      }
      // Update mode buttons
      document.querySelectorAll('.timer-mode-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.mode === this.mode);
      });
      document.getElementById('timerModeLabel').textContent = this.mode.charAt(0).toUpperCase() + this.mode.slice(1);

      if (s.running && s.startTimestamp) {
        // Timer was running when page closed — calculate remaining
        const elapsed = Date.now() - s.startTimestamp;
        const remaining = (s.pausedRemaining || this.totalMs) - elapsed;
        if (remaining > 0) {
          this.pausedRemaining = remaining;
          this.startTimestamp = null;
          this.running = false;
          this.renderFrame();
          // Auto-resume
          this.startTimer();
        } else {
          // Session completed while away — log it silently
          this.pausedRemaining = null;
          this.renderFrameFromMs(0);
          this.updateRingFromFraction(0);
        }
      } else if (s.pausedRemaining != null) {
        this.pausedRemaining = s.pausedRemaining;
        this.running = false;
        this.renderFrameFromMs(s.pausedRemaining);
        this.updateRingFromFraction(s.pausedRemaining / this.totalMs);
        document.getElementById('timerStart').textContent = '▶ Resume';
      } else {
        this.pausedRemaining = null;
        this.renderFrameFromMs(this.totalMs);
        this.updateRingFromFraction(1);
      }
    } catch(e) {
      this.setMode('focus');
    }
  },

  // ── EVENTS ────────────────────────────────────────────────
  setupEvents() {
    document.getElementById('timerStart')?.addEventListener('click', () => this.toggleTimer());
    document.getElementById('timerReset')?.addEventListener('click', () => this.resetTimer());

    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.timer-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setMode(btn.dataset.mode);
      });
    });

    ['focusDuration','funDuration','restDuration'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        if (!this.running) this.setMode(this.mode);
      });
    });

    // Save state on visibility change (tab switch / browser close)
    document.addEventListener('visibilitychange', () => this.saveState());
    window.addEventListener('beforeunload', () => this.saveState());
  },

  // ── TIMER CONTROL ─────────────────────────────────────────
  setMode(mode) {
    if (this.running) this.stopTimerInternal();
    this.mode = mode;
    const durations = {
      focus: parseInt(document.getElementById('focusDuration')?.value)||25,
      fun:   parseInt(document.getElementById('funDuration')?.value)||10,
      rest:  parseInt(document.getElementById('restDuration')?.value)||5,
    };
    this.totalMs = durations[mode] * 60 * 1000;
    this.pausedRemaining = null;
    this.startTimestamp = null;
    const label = mode.charAt(0).toUpperCase() + mode.slice(1);
    document.getElementById('timerModeLabel').textContent = label;
    document.getElementById('timerStart').textContent = '▶ Start';
    this.running = false;
    this.renderFrameFromMs(this.totalMs);
    this.updateRingFromFraction(1);
    this.saveState();
  },

  toggleTimer() {
    if (this.running) this.pauseTimer();
    else this.startTimer();
  },

  startTimer() {
    const remaining = this.pausedRemaining != null ? this.pausedRemaining : this.totalMs;
    this.startTimestamp = Date.now();
    this.pausedRemaining = remaining;   // used as reference point
    this.running = true;
    document.getElementById('timerStart').textContent = '⏸ Pause';
    this.saveState();
    this.scheduleTick();
  },

  pauseTimer() {
    const remaining = this.calcRemaining();
    this.pausedRemaining = Math.max(0, remaining);
    this.startTimestamp = null;
    this.running = false;
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    document.getElementById('timerStart').textContent = '▶ Resume';
    this.renderFrameFromMs(this.pausedRemaining);
    this.updateRingFromFraction(this.pausedRemaining / this.totalMs);
    this.saveState();
  },

  stopTimerInternal() {
    this.running = false;
    this.startTimestamp = null;
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
  },

  resetTimer() {
    this.stopTimerInternal();
    this.pausedRemaining = null;
    document.getElementById('timerStart').textContent = '▶ Start';
    this.renderFrameFromMs(this.totalMs);
    this.updateRingFromFraction(1);
    this.saveState();
  },

  // ── TICK: requestAnimationFrame for smooth, accurate timing ──
  scheduleTick() {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(() => {
      const remaining = this.calcRemaining();
      if (remaining <= 0) {
        this.renderFrameFromMs(0);
        this.updateRingFromFraction(0);
        this.completeSession();
        return;
      }
      this.renderFrameFromMs(remaining);
      this.updateRingFromFraction(remaining / this.totalMs);
      // Re-schedule every ~250ms (not every frame, saves CPU)
      setTimeout(() => { if (this.running) this.scheduleTick(); }, 250);
    });
  },

  calcRemaining() {
    if (!this.running || this.startTimestamp == null) return this.pausedRemaining || this.totalMs;
    const elapsed = Date.now() - this.startTimestamp;
    return (this.pausedRemaining || this.totalMs) - elapsed;
  },

  // ── RENDER ────────────────────────────────────────────────
  renderFrame() {
    const remaining = this.calcRemaining();
    this.renderFrameFromMs(remaining);
    this.updateRingFromFraction(remaining / this.totalMs);
  },

  renderFrameFromMs(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSec / 60).toString().padStart(2,'0');
    const s = (totalSec % 60).toString().padStart(2,'0');
    const display = document.getElementById('timerDisplay');
    if (display) display.textContent = `${m}:${s}`;
    if (this.running) document.title = `${m}:${s} — Lumière`;
    else document.title = 'Lumière — Your Life Dashboard';
  },

  updateRingFromFraction(fraction) {
    const circumference = 2 * Math.PI * 88; // 552.9
    const clamped = Math.max(0, Math.min(1, fraction));
    const offset = circumference * (1 - clamped);
    const ring = document.getElementById('timerRingProgress');
    if (!ring) return;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
    const colors = { focus:'#e8a4a4', fun:'#a4c8e8', rest:'#b8e0b8' };
    ring.style.stroke = colors[this.mode] || '#e8a4a4';
  },

  // ── SESSION COMPLETE ──────────────────────────────────────
  completeSession() {
    this.stopTimerInternal();
    this.pausedRemaining = null;
    this.startTimestamp = null;
    document.getElementById('timerStart').textContent = '▶ Start';
    this.saveState();

    const minutes = Math.round(this.totalMs / 60000);
    const today = new Date().toISOString().split('T')[0];
    const session = {
      mode: this.mode,
      minutes,
      date: today,
      time: new Date().toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' })
    };
    this.sessions.push(session);
    localStorage.setItem('lumiere_focus_log', JSON.stringify(this.sessions));
    this.updateStats();
    if (typeof dashboardModule !== 'undefined') dashboardModule.refresh();

    const msgs = {
      focus: `Focus session complete! ${minutes} minutes of deep work. 🌸`,
      fun:   'Fun time is up! Back to work 💪',
      rest:  'Rest complete — ready to focus? ✦'
    };
    showToast(msgs[this.mode] || 'Session complete!', 4000);
    this.rotateFocusQuote();

    if (Notification.permission === 'granted') {
      new Notification('Lumière ✦', { body: msgs[this.mode] });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  },

  // ── STATS ─────────────────────────────────────────────────
  updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayFocus = this.sessions.filter(s => s.date === today && s.mode === 'focus');
    const totalMin = todayFocus.reduce((sum, s) => sum + s.minutes, 0);
    const el = document.getElementById('focusSessionsCount');
    const el2 = document.getElementById('focusTotalTime');
    if (el) el.textContent = todayFocus.length;
    if (el2) el2.textContent = totalMin + ' min';

    const log = document.getElementById('sessionLog');
    if (!log) return;
    const allToday = this.sessions.filter(s => s.date === today);
    if (!allToday.length) {
      log.innerHTML = '<p class="empty-hint">No sessions yet today.</p>';
      return;
    }
    const emoji = { focus:'🎯', fun:'🎉', rest:'💤' };
    log.innerHTML = [...allToday].reverse().map(s =>
      `<div class="session-log-item">${emoji[s.mode]||''} ${s.mode} — ${s.minutes} min at ${s.time}</div>`
    ).join('');
  },

  rotateFocusQuote() {
    const q = FOCUS_QUOTES[Math.floor(Math.random() * FOCUS_QUOTES.length)];
    const el = document.getElementById('focusQuote');
    if (el) el.textContent = q;
  }
};
