// ============================================================
// LUMIÈRE — focus.js
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
];

const focusModule = {
  mode: 'focus',
  running: false,
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  interval: null,
  sessions: [],

  init() {
    this.sessions = JSON.parse(localStorage.getItem('lumiere_focus_log') || '[]');
    this.setupEvents();
    this.updateDisplay();
    this.updateStats();
    this.rotateFocusQuote();
  },

  setupEvents() {
    document.getElementById('timerStart').addEventListener('click', () => this.toggleTimer());
    document.getElementById('timerReset').addEventListener('click', () => this.resetTimer());

    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.timer-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setMode(btn.dataset.mode);
      });
    });

    ['focusDuration','funDuration','restDuration'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => {
        if (!this.running) this.setMode(this.mode);
      });
    });
  },

  setMode(mode) {
    if (this.running) this.stopTimer();
    this.mode = mode;
    const durations = {
      focus: parseInt(document.getElementById('focusDuration').value) || 25,
      fun: parseInt(document.getElementById('funDuration').value) || 10,
      rest: parseInt(document.getElementById('restDuration').value) || 5,
    };
    this.totalSeconds = durations[mode] * 60;
    this.remainingSeconds = this.totalSeconds;
    document.getElementById('timerModeLabel').textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    document.getElementById('timerStart').textContent = '▶ Start';
    this.running = false;
    this.updateDisplay();
    this.updateRing(1);
  },

  toggleTimer() {
    if (this.running) this.pauseTimer();
    else this.startTimer();
  },

  startTimer() {
    this.running = true;
    document.getElementById('timerStart').textContent = '⏸ Pause';
    this.interval = setInterval(() => this.tick(), 1000);
  },

  pauseTimer() {
    this.running = false;
    document.getElementById('timerStart').textContent = '▶ Resume';
    clearInterval(this.interval);
  },

  stopTimer() {
    this.running = false;
    clearInterval(this.interval);
    document.getElementById('timerStart').textContent = '▶ Start';
  },

  resetTimer() {
    this.stopTimer();
    this.setMode(this.mode);
  },

  tick() {
    if (this.remainingSeconds <= 0) {
      this.completeSession();
      return;
    }
    this.remainingSeconds--;
    this.updateDisplay();
    this.updateRing(this.remainingSeconds / this.totalSeconds);
  },

  completeSession() {
    this.stopTimer();
    this.remainingSeconds = 0;
    this.updateDisplay();
    this.updateRing(0);

    const minutes = Math.round(this.totalSeconds / 60);
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
    dashboardModule.refresh();

    // Notification
    const modeLabels = { focus: 'Focus session complete! Time to breathe. 🌸', fun: 'Fun time is up! Back to work 💪', rest: 'Rest complete — ready to focus? ✦' };
    showToast(modeLabels[this.mode] || 'Session complete!', 4000);

    // Rotate quote
    this.rotateFocusQuote();

    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification('Lumière', { body: modeLabels[this.mode], icon: '✦' });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  },

  updateDisplay() {
    const m = Math.floor(this.remainingSeconds / 60).toString().padStart(2,'0');
    const s = (this.remainingSeconds % 60).toString().padStart(2,'0');
    document.getElementById('timerDisplay').textContent = `${m}:${s}`;
    // Update page title
    if (this.running) document.title = `${m}:${s} — Lumière`;
    else document.title = 'Lumière — Your Life Dashboard';
  },

  updateRing(progress) {
    const circumference = 2 * Math.PI * 88; // ~553
    const offset = circumference * (1 - progress);
    const ring = document.getElementById('timerRingProgress');
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;

    // Color based on mode
    const colors = { focus: '#e8a4a4', fun: '#a4c8e8', rest: '#b8e0b8' };
    ring.style.stroke = colors[this.mode] || '#e8a4a4';
  },

  updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = this.sessions.filter(s => s.date === today && s.mode === 'focus');
    const totalMin = todaySessions.reduce((sum, s) => sum + s.minutes, 0);

    document.getElementById('focusSessionsCount').textContent = todaySessions.length;
    document.getElementById('focusTotalTime').textContent = totalMin + ' min';

    const log = document.getElementById('sessionLog');
    const allToday = this.sessions.filter(s => s.date === today);
    if (!allToday.length) {
      log.innerHTML = '<p class="empty-hint">No sessions yet today.</p>';
      return;
    }
    log.innerHTML = [...allToday].reverse().map(s => {
      const modeEmoji = { focus:'🎯', fun:'🎉', rest:'💤' };
      return `<div class="session-log-item">${modeEmoji[s.mode]||''} ${s.mode} — ${s.minutes} min at ${s.time}</div>`;
    }).join('');
  },

  rotateFocusQuote() {
    const q = FOCUS_QUOTES[Math.floor(Math.random() * FOCUS_QUOTES.length)];
    document.getElementById('focusQuote').textContent = q;
  }
};
