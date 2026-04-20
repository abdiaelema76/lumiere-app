// ============================================================
// LUMIÈRE — notes.js  v4
// Tab-based editor: Write tab | IDE tab
// ============================================================

const notesModule = {
  notes: [],
  currentId: null,
  activeFilter: 'all',
  autoTimer: null,
  activeTab: 'write', // 'write' | 'ide'

  init() {
    this.notes = JSON.parse(localStorage.getItem('lumiere_notes') || '[]');
    this.renderList();
    this.setupEvents();
  },

  setupEvents() {
    document.getElementById('newNoteBtn')?.addEventListener('click', () => this.createNew());
    document.getElementById('noteSaveBtn')?.addEventListener('click', () => this.saveCurrent());
    document.getElementById('noteDeleteBtn')?.addEventListener('click', () => this.deleteCurrent());
    document.getElementById('notePinBtn')?.addEventListener('click', () => this.togglePin());
    document.getElementById('notesSearch')?.addEventListener('input', e => this.renderList(e.target.value));

    // Tab switcher
    document.getElementById('noteTabWrite')?.addEventListener('click', () => this.switchTab('write'));
    document.getElementById('noteTabIDE')?.addEventListener('click', () => this.switchTab('ide'));

    // IDE run button
    document.getElementById('noteRunBtn')?.addEventListener('click', () => this.runCode());
    document.getElementById('noteClearOutputBtn')?.addEventListener('click', () => this.clearOutput());

    // IDE lang change
    document.getElementById('noteCodeLang')?.addEventListener('change', () => {
      this.clearOutput();
    });

    // Tab key → 2 spaces in code editor
    document.getElementById('noteCodeEditor')?.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const ta = e.target, s = ta.selectionStart;
        ta.value = ta.value.slice(0, s) + '  ' + ta.value.slice(ta.selectionEnd);
        ta.selectionStart = ta.selectionEnd = s + 2;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); this.runCode(); }
    });

    // Filter buttons
    document.querySelectorAll('#section-notes .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#section-notes .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter;
        this.renderList();
      });
    });

    // Auto-save on typing
    document.getElementById('richEditor')?.addEventListener('input', () => this.scheduleAutoSave());
    document.getElementById('noteCodeEditor')?.addEventListener('input', () => this.scheduleAutoSave());
    document.getElementById('noteTitleInput')?.addEventListener('input', () => this.scheduleAutoSave());
  },

  scheduleAutoSave() {
    clearTimeout(this.autoTimer);
    this.autoTimer = setTimeout(() => this.saveCurrent(true), 1500);
  },

  switchTab(tab) {
    this.activeTab = tab;
    // Save current content before switching
    if (this.currentId) this.saveCurrent(true);

    document.getElementById('noteTabWrite')?.classList.toggle('active', tab === 'write');
    document.getElementById('noteTabIDE')?.classList.toggle('active', tab === 'ide');
    document.getElementById('noteWritePanel')?.classList.toggle('hidden', tab !== 'write');
    document.getElementById('noteIDEPanel')?.classList.toggle('hidden', tab !== 'ide');

    // Load the right content for the active note
    if (this.currentId) {
      const note = this.notes.find(n => n.id === this.currentId);
      if (note && tab === 'ide') {
        document.getElementById('noteCodeEditor').value = note.codeContent || '';
        document.getElementById('noteCodeLang').value = note.codeLang || 'javascript';
      }
      if (note && tab === 'write') {
        document.getElementById('richEditor').innerHTML = note.content || '';
      }
    }
  },

  createNew() {
    const note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      codeContent: '',
      codeLang: 'javascript',
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.notes.unshift(note);
    this.persist();
    this.renderList();
    this.openNote(note.id);
  },

  openNote(id) {
    this.currentId = id;
    const note = this.notes.find(n => n.id === id);
    if (!note) return;

    document.getElementById('noteEditorEmpty').classList.add('hidden');
    document.getElementById('noteEditorForm').classList.remove('hidden');

    document.getElementById('noteTitleInput').value = note.title || '';

    // Pin button state
    this.refreshPinBtn(note.pinned);

    // Load both editors
    document.getElementById('richEditor').innerHTML = note.content || '';
    document.getElementById('noteCodeEditor').value = note.codeContent || '';
    document.getElementById('noteCodeLang').value = note.codeLang || 'javascript';

    // Clear output
    this.clearOutput();

    // Keep current tab, just update content
    document.getElementById('noteTabWrite').classList.toggle('active', this.activeTab === 'write');
    document.getElementById('noteTabIDE').classList.toggle('active', this.activeTab === 'ide');
    document.getElementById('noteWritePanel').classList.toggle('hidden', this.activeTab !== 'write');
    document.getElementById('noteIDEPanel').classList.toggle('hidden', this.activeTab !== 'ide');

    document.querySelectorAll('.note-card').forEach(c => c.classList.remove('active'));
    document.querySelector(`.note-card[data-id="${id}"]`)?.classList.add('active');
  },

  refreshPinBtn(pinned) {
    const btn = document.getElementById('notePinBtn');
    if (!btn) return;
    btn.textContent = pinned ? '📌 Pinned' : '📌 Pin';
    btn.style.background = pinned ? 'var(--pink-soft)' : 'none';
    btn.style.border = pinned ? '1.5px solid var(--pink)' : '1px solid var(--border)';
    btn.style.color = pinned ? 'var(--text)' : 'var(--text-3)';
  },

  saveCurrent(silent = false) {
    if (!this.currentId) return;
    const note = this.notes.find(n => n.id === this.currentId);
    if (!note) return;
    note.title = document.getElementById('noteTitleInput').value || 'Untitled Note';
    note.content = document.getElementById('richEditor').innerHTML;
    note.codeContent = document.getElementById('noteCodeEditor').value;
    note.codeLang = document.getElementById('noteCodeLang').value;
    note.updatedAt = new Date().toISOString();
    this.persist();
    this.renderList();
    document.querySelector(`.note-card[data-id="${this.currentId}"]`)?.classList.add('active');
    if (!silent) showToast('Note saved ✦');
  },

  deleteCurrent() {
    if (!this.currentId) return;
    if (!confirm('Delete this note? This cannot be undone.')) return;
    this.notes = this.notes.filter(n => n.id !== this.currentId);
    this.currentId = null;
    this.persist();
    document.getElementById('noteEditorEmpty').classList.remove('hidden');
    document.getElementById('noteEditorForm').classList.add('hidden');
    this.renderList();
    showToast('Note deleted');
  },

  togglePin() {
    if (!this.currentId) return;
    const note = this.notes.find(n => n.id === this.currentId);
    if (!note) return;
    note.pinned = !note.pinned;
    note.updatedAt = new Date().toISOString();
    this.refreshPinBtn(note.pinned);
    this.persist();
    this.renderList();
    document.querySelector(`.note-card[data-id="${this.currentId}"]`)?.classList.add('active');
    showToast(note.pinned ? 'Note pinned 📌' : 'Note unpinned');
  },

  getFiltered(q = '') {
    let list = [...this.notes];
    if (this.activeFilter === 'pinned') list = list.filter(n => n.pinned);
    else if (this.activeFilter !== 'all') list = list.filter(n => (n.type||'personal') === this.activeFilter);
    if (q.trim()) {
      const lq = q.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(lq) ||
        (n.content||'').toLowerCase().includes(lq) ||
        (n.codeContent||'').toLowerCase().includes(lq)
      );
    }
    return list.sort((a,b) => (b.pinned?1:0)-(a.pinned?1:0) || new Date(b.updatedAt)-new Date(a.updatedAt));
  },

  renderList(q = '') {
    const list = document.getElementById('notesList');
    if (!list) return;
    const notes = this.getFiltered(q);
    if (!notes.length) { list.innerHTML = '<p class="empty-hint">No notes found 🌿</p>'; return; }
    list.innerHTML = notes.map(n => {
      const date = new Date(n.updatedAt).toLocaleDateString('en-US', { month:'short', day:'numeric' });
      const textPreview = n.content.replace(/<[^>]+>/g,'').substring(0,45);
      const codePreview = n.codeContent ? '💻 ' + n.codeContent.substring(0,30) : '';
      const preview = textPreview || codePreview || 'Empty note…';
      const isActive = n.id === this.currentId ? ' active' : '';
      const hasCode = n.codeContent && n.codeContent.trim().length > 0;
      return `<div class="note-card${isActive}" data-id="${n.id}" onclick="notesModule.openNote('${n.id}')">
        <div class="note-card-title">${n.pinned?'📌 ':''}${n.title}${hasCode?' <span style="font-size:0.65rem;background:var(--lavender-soft);color:var(--lavender);padding:0.1rem 0.4rem;border-radius:4px;margin-left:0.3rem">IDE</span>':''}</div>
        <div style="font-size:0.75rem;color:var(--text-3);margin-bottom:0.3rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${preview}</div>
        <div class="note-card-meta"><span class="note-card-date">${date}</span></div>
      </div>`;
    }).join('');
  },

  // ── IDE: RUN CODE ───────────────────────────────────────────
  runCode() {
    const lang = document.getElementById('noteCodeLang').value;
    const code = document.getElementById('noteCodeEditor').value;
    const wrap = document.getElementById('noteOutputWrap');
    const out = document.getElementById('noteCodeOutput');
    if (!code.trim()) { showToast('Write some code first 💻'); return; }
    wrap.classList.remove('hidden');
    out.innerHTML = '';

    if (lang === 'html') {
      out.innerHTML = `<iframe id="noteHtmlFrame" style="width:100%;height:300px;border:none;background:#fff;border-radius:8px"></iframe>`;
      setTimeout(() => { document.getElementById('noteHtmlFrame').srcdoc = code; }, 50);
      return;
    }

    if (lang === 'javascript') {
      const logs = [];
      const _log = console.log, _err = console.error, _warn = console.warn;
      const cap = type => (...args) => {
        const text = args.map(a => { try { return typeof a === 'object' && a !== null ? JSON.stringify(a,null,2) : String(a); } catch(e){return String(a);} }).join(' ');
        logs.push({ type, text });
      };
      console.log = cap('log'); console.error = cap('error'); console.warn = cap('warn');
      try {
        // eslint-disable-next-line no-new-func
        const result = new Function(code)();
        if (result !== undefined) logs.push({ type:'return', text:'← '+String(result) });
      } catch(e) {
        logs.push({ type:'error', text:'✕ '+e.message });
      } finally {
        console.log=_log; console.error=_err; console.warn=_warn;
      }
      if (!logs.length) logs.push({ type:'ok', text:'✓ Ran with no output.' });
      const colors = { log:'#c8e0c8', error:'#e06c75', warn:'#e5c07b', return:'#c8b4e8', ok:'#98c379' };
      out.innerHTML = logs.map(l =>
        `<div style="color:${colors[l.type]||'#c8e0c8'};padding:0.1rem 0;font-family:monospace;font-size:0.84rem;white-space:pre-wrap">${this.esc(l.text)}</div>`
      ).join('');
      return;
    }

    const msgs = {
      python:'🐍 Python runs server-side. Code saved — paste into a Python environment.',
      css:'🎨 CSS saved. Combine with an HTML file to see the effect.',
      other:'✦ Code saved.'
    };
    out.innerHTML = `<span style="color:#a0a0c0;font-size:0.84rem">${msgs[lang]||msgs.other}</span>`;
  },

  clearOutput() {
    document.getElementById('noteCodeOutput').innerHTML = '';
    document.getElementById('noteOutputWrap')?.classList.add('hidden');
  },

  esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },

  persist() {
    localStorage.setItem('lumiere_notes', JSON.stringify(this.notes));
  }
};
