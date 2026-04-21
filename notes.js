// ============================================================
// LUMIÈRE — notes.js  v5
// Block-based editor: Text blocks + Runnable Code blocks
// Pyodide for Python, iframe for HTML, Function() for JS
// ============================================================

// ── PYODIDE LOADER ──────────────────────────────────────────
let _pyodide = null;
let _pyodideLoading = false;
let _pyodideCallbacks = [];

function loadPyodide() {
  return new Promise((resolve, reject) => {
    if (_pyodide) { resolve(_pyodide); return; }
    _pyodideCallbacks.push({ resolve, reject });
    if (_pyodideLoading) return;
    _pyodideLoading = true;

    // Inject Pyodide script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
    script.onload = async () => {
      try {
        // eslint-disable-next-line no-undef
        _pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/' });
        _pyodideCallbacks.forEach(cb => cb.resolve(_pyodide));
      } catch(e) {
        _pyodideCallbacks.forEach(cb => cb.reject(e));
      }
      _pyodideCallbacks = [];
    };
    script.onerror = e => {
      _pyodideCallbacks.forEach(cb => cb.reject(e));
      _pyodideCallbacks = [];
      _pyodideLoading = false;
    };
    document.head.appendChild(script);
  });
}

// ── BLOCK ID GENERATOR ──────────────────────────────────────
function genId() {
  return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── NOTES MODULE ─────────────────────────────────────────────
const notesModule = {
  notes: [],
  currentId: null,
  activeFilter: 'all',
  autoTimer: null,
  // blocks for current note: [{ id, type:'text'|'code', content, lang, output }]
  blocks: [],

  init() {
    this.notes = JSON.parse(localStorage.getItem('lumiere_notes') || '[]');
    // Migrate old notes (single content string) to block format
    this.notes.forEach(n => {
      if (!n.blocks) {
        n.blocks = [];
        if (n.content) n.blocks.push({ id: genId(), type: 'text', content: n.content });
        if (n.codeContent) n.blocks.push({ id: genId(), type: 'code', content: n.codeContent, lang: n.codeLang || 'javascript', output: '' });
      }
    });
    this.persist();
    this.renderList();
    this.setupEvents();
  },

  setupEvents() {
    document.getElementById('newNoteBtn')?.addEventListener('click', () => this.createNew());
    document.getElementById('noteSaveBtn')?.addEventListener('click', () => this.saveCurrent());
    document.getElementById('noteDeleteBtn')?.addEventListener('click', () => this.deleteCurrent());
    document.getElementById('notePinBtn')?.addEventListener('click', () => this.togglePin());
    document.getElementById('notesSearch')?.addEventListener('input', e => this.renderList(e.target.value));
    document.getElementById('noteTypeSelect')?.addEventListener('change', () => this.scheduleAutoSave());
    document.querySelectorAll('#section-notes .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#section-notes .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter;
        this.renderList();
      });
    });
    document.getElementById('noteTitleInput')?.addEventListener('input', () => this.scheduleAutoSave());
    // Toolbar buttons
    document.getElementById('noteToolbarBold')?.addEventListener('click', () => this.execFormatCmd('bold'));
    document.getElementById('noteToolbarItalic')?.addEventListener('click', () => this.execFormatCmd('italic'));
    document.getElementById('noteToolbarUnderline')?.addEventListener('click', () => this.execFormatCmd('underline'));
    document.getElementById('noteToolbarUL')?.addEventListener('click', () => this.execFormatCmd('insertUnorderedList'));
    document.getElementById('noteToolbarOL')?.addEventListener('click', () => this.execFormatCmd('insertOrderedList'));
    document.getElementById('noteToolbarH')?.addEventListener('click', () => this.execFormatCmd('formatBlock', 'h2'));
    document.getElementById('noteToolbarCode')?.addEventListener('click', () => this.insertCodeBlock());
    document.getElementById('noteToolbarText')?.addEventListener('click', () => this.insertTextBlock());
  },

  // Focus the last focused text block before running toolbar cmd
  execFormatCmd(cmd, val) {
    // Try to re-focus the last active block editor
    const active = document.querySelector('.block-text-editor:focus') ||
      document.querySelector('.block-text-editor');
    if (active) { active.focus(); document.execCommand(cmd, false, val || null); }
  },

  // ── CREATE / OPEN ────────────────────────────────────────
  createNew() {
    const note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      blocks: [{ id: genId(), type: 'text', content: '', lang: 'javascript', output: '' }],
      pinned: false,
      type: 'personal',
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
    document.getElementById('noteTypeSelect').value = note.type || 'personal';

    this.refreshPinBtn(note.pinned);
    this.blocks = JSON.parse(JSON.stringify(note.blocks || []));
    if (!this.blocks.length) {
      this.blocks.push({ id: genId(), type: 'text', content: '', lang: 'javascript', output: '' });
    }
    this.renderBlocks();

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

  // ── BLOCKS RENDERING ─────────────────────────────────────
  renderBlocks() {
    const container = document.getElementById('noteBlocksContainer');
    if (!container) return;
    container.innerHTML = '';
    this.blocks.forEach((block, idx) => {
      container.appendChild(block.type === 'code'
        ? this.buildCodeBlock(block, idx)
        : this.buildTextBlock(block, idx));
    });
  },

  buildTextBlock(block, idx) {
    const wrap = document.createElement('div');
    wrap.className = 'note-block note-block-text';
    wrap.dataset.id = block.id;
    wrap.innerHTML = `
      <div class="block-actions">
        <span class="block-type-label">Text</span>
        <div class="block-btns">
          ${idx > 0 ? `<button class="block-btn" onclick="notesModule.moveBlock('${block.id}',-1)" title="Move up">↑</button>` : ''}
          ${idx < this.blocks.length-1 ? `<button class="block-btn" onclick="notesModule.moveBlock('${block.id}',1)" title="Move down">↓</button>` : ''}
          ${this.blocks.length > 1 ? `<button class="block-btn danger" onclick="notesModule.removeBlock('${block.id}')" title="Remove block">✕</button>` : ''}
        </div>
      </div>
      <div class="block-text-editor" contenteditable="true" data-block-id="${block.id}">${block.content || ''}</div>`;

    const editor = wrap.querySelector('.block-text-editor');
    editor.addEventListener('input', () => {
      block.content = editor.innerHTML;
      this.scheduleAutoSave();
    });
    editor.addEventListener('focus', () => {
      document.querySelectorAll('.note-block').forEach(b => b.classList.remove('block-focused'));
      wrap.classList.add('block-focused');
    });
    // Tab = indent, Shift+Tab = unindent
    editor.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertHTML', false, e.shiftKey ? '' : '&nbsp;&nbsp;&nbsp;&nbsp;');
      }
    });
    return wrap;
  },

  buildCodeBlock(block, idx) {
    const wrap = document.createElement('div');
    wrap.className = 'note-block note-block-code';
    wrap.dataset.id = block.id;

    const langOpts = ['javascript','python','html','css','other'].map(l =>
      `<option value="${l}" ${l === (block.lang||'javascript') ? 'selected' : ''}>${l === 'javascript' ? 'JavaScript' : l === 'python' ? 'Python 🐍' : l.toUpperCase()}</option>`
    ).join('');

    wrap.innerHTML = `
      <div class="block-actions">
        <span class="block-type-label code-label">⟨/⟩ Code</span>
        <div style="display:flex;align-items:center;gap:0.4rem;flex:1">
          <select class="block-lang-select" data-block-id="${block.id}">${langOpts}</select>
          <span id="pyodide-status-${block.id}" style="font-size:0.68rem;color:var(--text-3)"></span>
        </div>
        <div class="block-btns">
          ${idx > 0 ? `<button class="block-btn" onclick="notesModule.moveBlock('${block.id}',-1)" title="Move up">↑</button>` : ''}
          ${idx < this.blocks.length-1 ? `<button class="block-btn" onclick="notesModule.moveBlock('${block.id}',1)" title="Move down">↓</button>` : ''}
          <button class="block-btn danger" onclick="notesModule.removeBlock('${block.id}')" title="Remove block">✕</button>
        </div>
      </div>
      <div class="code-block-editor-wrap">
        <textarea class="block-code-editor" data-block-id="${block.id}" spellcheck="false" autocorrect="off" autocapitalize="off">${this.esc(block.content||'')}</textarea>
        <div class="code-block-controls">
          <button class="block-run-btn" data-block-id="${block.id}">▶ Run</button>
          <button class="block-reset-btn" data-block-id="${block.id}" title="Reset to saved code">↺ Reset</button>
          <span style="font-size:0.7rem;color:var(--text-3)">Ctrl+Enter</span>
        </div>
      </div>
      <div class="block-output-wrap hidden" id="out-${block.id}">
        <div class="block-output-bar">
          <span id="out-label-${block.id}">Output</span>
          <button onclick="notesModule.clearBlockOutput('${block.id}')" style="background:none;border:none;color:#8a7898;cursor:pointer;font-size:0.72rem">✕ Clear</button>
        </div>
        <div class="block-output" id="out-content-${block.id}"></div>
      </div>`;

    // Wire events after building
    const textarea = wrap.querySelector('.block-code-editor');
    const langSelect = wrap.querySelector('.block-lang-select');

    textarea.addEventListener('input', () => {
      block.content = textarea.value;
      this.scheduleAutoSave();
    });
    textarea.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = textarea.selectionStart;
        textarea.value = textarea.value.slice(0,s) + '  ' + textarea.value.slice(textarea.selectionEnd);
        textarea.selectionStart = textarea.selectionEnd = s + 2;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.runCodeBlock(block.id);
      }
    });
    textarea.addEventListener('focus', () => {
      document.querySelectorAll('.note-block').forEach(b => b.classList.remove('block-focused'));
      wrap.classList.add('block-focused');
    });

    langSelect.addEventListener('change', () => {
      block.lang = langSelect.value;
      this.scheduleAutoSave();
    });

    wrap.querySelector('.block-run-btn').addEventListener('click', () => this.runCodeBlock(block.id));
    wrap.querySelector('.block-reset-btn').addEventListener('click', () => this.resetCodeBlock(block.id));

    // Restore previous output if any
    if (block.output) {
      const outWrap = wrap.querySelector(`#out-${block.id}`);
      const outContent = wrap.querySelector(`#out-content-${block.id}`);
      if (outWrap && outContent) {
        outContent.innerHTML = block.output;
        outWrap.classList.remove('hidden');
      }
    }

    return wrap;
  },

  // ── BLOCK OPERATIONS ─────────────────────────────────────
  insertTextBlock() {
    const block = { id: genId(), type: 'text', content: '', output: '' };
    this.blocks.push(block);
    this.renderBlocks();
    // Focus newly added block
    setTimeout(() => {
      const el = document.querySelector(`[data-block-id="${block.id}"].block-text-editor`);
      el?.focus();
    }, 50);
    this.scheduleAutoSave();
  },

  insertCodeBlock() {
    const block = { id: genId(), type: 'code', content: '// Write your code here\nconsole.log("Hello, World!");', lang: 'javascript', output: '' };
    this.blocks.push(block);
    this.renderBlocks();
    setTimeout(() => {
      const el = document.querySelector(`[data-block-id="${block.id}"].block-code-editor`);
      el?.focus();
    }, 50);
    this.scheduleAutoSave();
  },

  removeBlock(blockId) {
    if (this.blocks.length <= 1) { showToast('A note must have at least one block.'); return; }
    this.blocks = this.blocks.filter(b => b.id !== blockId);
    this.renderBlocks();
    this.scheduleAutoSave();
  },

  moveBlock(blockId, dir) {
    const idx = this.blocks.findIndex(b => b.id === blockId);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= this.blocks.length) return;
    const [block] = this.blocks.splice(idx, 1);
    this.blocks.splice(newIdx, 0, block);
    this.renderBlocks();
    this.scheduleAutoSave();
  },

  // ── CODE EXECUTION ───────────────────────────────────────
  async runCodeBlock(blockId) {
    const block = this.blocks.find(b => b.id === blockId);
    if (!block) return;

    // Get current textarea value
    const ta = document.querySelector(`.block-code-editor[data-block-id="${blockId}"]`);
    if (ta) block.content = ta.value;

    const outWrap = document.getElementById('out-' + blockId);
    const outContent = document.getElementById('out-content-' + blockId);
    const outLabel = document.getElementById('out-label-' + blockId);
    const runBtn = document.querySelector(`.block-run-btn[data-block-id="${blockId}"]`);
    if (!outWrap || !outContent) return;

    outWrap.classList.remove('hidden');
    outContent.innerHTML = '<span style="color:#8a7898;font-size:0.82rem">Running…</span>';
    if (runBtn) runBtn.disabled = true;

    const lang = block.lang || 'javascript';

    try {
      if (lang === 'html' || lang === 'css') {
        this.runHTML(block, outWrap, outContent, outLabel);
      } else if (lang === 'python') {
        await this.runPython(block, blockId, outWrap, outContent, outLabel);
      } else {
        this.runJS(block, outWrap, outContent, outLabel);
      }
    } catch(e) {
      outContent.innerHTML = `<div class="out-error">Unexpected error: ${this.esc(e.message)}</div>`;
    } finally {
      if (runBtn) runBtn.disabled = false;
      // Save output to block
      block.output = outContent.innerHTML;
      this.scheduleAutoSave();
    }
  },

  runJS(block, outWrap, outContent, outLabel) {
    outLabel.textContent = 'Console Output';
    const logs = [];
    const _l = console.log, _e = console.error, _w = console.warn, _i = console.info;
    const cap = type => (...args) => {
      const text = args.map(a => {
        try { return typeof a === 'object' && a !== null ? JSON.stringify(a, null, 2) : String(a); }
        catch(e) { return String(a); }
      }).join(' ');
      logs.push({ type, text });
    };
    console.log = cap('log'); console.error = cap('error');
    console.warn = cap('warn'); console.info = cap('info');
    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(block.content)();
      if (result !== undefined) logs.push({ type: 'return', text: '← ' + String(result) });
    } catch(e) {
      logs.push({ type: 'error', text: e.message });
    } finally {
      console.log = _l; console.error = _e; console.warn = _w; console.info = _i;
    }
    if (!logs.length) {
      outContent.innerHTML = '<div class="out-ok">✓ Ran with no output.</div>';
    } else {
      const cls = { log:'out-line', error:'out-error', warn:'out-warn', return:'out-return', info:'out-info' };
      outContent.innerHTML = logs.map(l =>
        `<div class="${cls[l.type]||'out-line'}">${this.esc(l.text)}</div>`
      ).join('');
    }
  },

  async runPython(block, blockId, outWrap, outContent, outLabel) {
    outLabel.textContent = 'Python Output';
    const statusEl = document.getElementById('pyodide-status-' + blockId);
    if (statusEl) statusEl.textContent = 'Loading Python…';
    outContent.innerHTML = '<div class="out-line" style="color:#f5c842">⏳ Loading Python runtime (first run takes ~5s)…</div>';

    try {
      const pyodide = await loadPyodide();
      if (statusEl) statusEl.textContent = '';

      // Capture stdout
      pyodide.runPython(`
import sys
from io import StringIO
_lumiere_buf = StringIO()
sys.stdout = _lumiere_buf
sys.stderr = _lumiere_buf
`);
      try {
        pyodide.runPython(block.content);
        const output = pyodide.runPython('_lumiere_buf.getvalue()');
        // Reset stdout
        pyodide.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
        if (!output.trim()) {
          outContent.innerHTML = '<div class="out-ok">✓ Ran with no output.</div>';
        } else {
          outContent.innerHTML = output.split('\n').filter(l => l !== undefined)
            .map(l => `<div class="out-line">${this.esc(l)}</div>`).join('');
        }
      } catch(e) {
        pyodide.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
        outContent.innerHTML = `<div class="out-error">❌ ${this.esc(e.message)}</div>`;
      }
    } catch(e) {
      if (statusEl) statusEl.textContent = '';
      // Fallback if Pyodide fails to load
      outContent.innerHTML = `
        <div class="out-error">Could not load Python runtime. Check your internet connection.</div>
        <div class="out-line" style="color:#8a7898;margin-top:0.4rem">Tip: Python requires an internet connection to load on first use.</div>`;
    }
  },

  runHTML(block, outWrap, outContent, outLabel) {
    outLabel.textContent = block.lang === 'css' ? 'CSS Preview' : 'HTML Preview';
    const code = block.lang === 'css'
      ? `<!DOCTYPE html><html><head><style>${block.content}</style></head><body><p>CSS applied. Add HTML here to see it in context.</p><div class="example">Example element</div></body></html>`
      : block.content;
    outContent.innerHTML = `<iframe style="width:100%;height:320px;border:none;background:white;border-radius:8px" srcdoc="${this.esc(code).replace(/"/g,'&quot;')}"></iframe>`;
    // Use srcdoc properly
    const iframe = outContent.querySelector('iframe');
    if (iframe) {
      iframe.removeAttribute('srcdoc');
      iframe.srcdoc = code;
    }
  },

  resetCodeBlock(blockId) {
    const block = this.blocks.find(b => b.id === blockId);
    if (!block) return;
    // Find the original saved content
    const note = this.notes.find(n => n.id === this.currentId);
    const savedBlock = note?.blocks?.find(b => b.id === blockId);
    if (savedBlock) {
      block.content = savedBlock.content;
      const ta = document.querySelector(`.block-code-editor[data-block-id="${blockId}"]`);
      if (ta) ta.value = block.content;
    }
    this.clearBlockOutput(blockId);
    showToast('Code reset to last saved version');
  },

  clearBlockOutput(blockId) {
    const wrap = document.getElementById('out-' + blockId);
    const content = document.getElementById('out-content-' + blockId);
    if (wrap) wrap.classList.add('hidden');
    if (content) content.innerHTML = '';
    const block = this.blocks.find(b => b.id === blockId);
    if (block) block.output = '';
  },

  // ── SAVE / DELETE / PIN ──────────────────────────────────
  scheduleAutoSave() {
    clearTimeout(this.autoTimer);
    this.autoTimer = setTimeout(() => this.saveCurrent(true), 1500);
  },

  saveCurrent(silent = false) {
    if (!this.currentId) return;
    const note = this.notes.find(n => n.id === this.currentId);
    if (!note) return;
    // Sync block content from DOM before saving
    this.syncBlocksFromDOM();
    note.title = document.getElementById('noteTitleInput').value || 'Untitled Note';
    note.type = document.getElementById('noteTypeSelect').value;
    note.blocks = JSON.parse(JSON.stringify(this.blocks));
    // Legacy fields for sidebar search
    note.content = this.blocks.filter(b => b.type === 'text').map(b => b.content.replace(/<[^>]+>/g,'')).join(' ');
    note.codeContent = this.blocks.filter(b => b.type === 'code').map(b => b.content).join('\n');
    note.updatedAt = new Date().toISOString();
    this.persist();
    this.renderList();
    document.querySelector(`.note-card[data-id="${this.currentId}"]`)?.classList.add('active');
    if (!silent) showToast('Note saved ✦');
  },

  syncBlocksFromDOM() {
    // Pull live values from DOM into this.blocks before saving
    this.blocks.forEach(block => {
      if (block.type === 'text') {
        const el = document.querySelector(`.block-text-editor[data-block-id="${block.id}"]`);
        if (el) block.content = el.innerHTML;
      } else {
        const el = document.querySelector(`.block-code-editor[data-block-id="${block.id}"]`);
        if (el) block.content = el.value;
        const langEl = document.querySelector(`.block-lang-select[data-block-id="${block.id}"]`);
        if (langEl) block.lang = langEl.value;
        const outEl = document.getElementById('out-content-' + block.id);
        if (outEl) block.output = outEl.innerHTML;
      }
    });
  },

  deleteCurrent() {
    if (!this.currentId) return;
    if (!confirm('Delete this note? This cannot be undone.')) return;
    this.notes = this.notes.filter(n => n.id !== this.currentId);
    this.currentId = null;
    this.blocks = [];
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

  // ── LIST RENDERING ────────────────────────────────────────
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
      const textPreview = (n.content||'').replace(/<[^>]+>/g,'').substring(0,50) || 'Empty note…';
      const hasCode = (n.blocks||[]).some(b => b.type === 'code');
      const isActive = n.id === this.currentId ? ' active' : '';
      return `<div class="note-card${isActive}" data-id="${n.id}" onclick="notesModule.openNote('${n.id}')">
        <div class="note-card-title">${n.pinned?'📌 ':''}${n.title}${hasCode?'<span class="note-code-badge">⟨/⟩</span>':''}</div>
        <div style="font-size:0.75rem;color:var(--text-3);margin-bottom:0.3rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${textPreview}</div>
        <div class="note-card-meta">
          <span class="note-tag">${n.type||'personal'}</span>
          <span class="note-card-date">${date}</span>
        </div>
      </div>`;
    }).join('');
  },

  esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },

  persist() {
    localStorage.setItem('lumiere_notes', JSON.stringify(this.notes));
  }
};
