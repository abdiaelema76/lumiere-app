// ============================================================
// LUMIÈRE — notes.js  v6
// Block-based editor. Each code block is a fully isolated object
// with its own state — no shared IDs, no global eval handlers.
// ============================================================

// ── PYODIDE LOADER (singleton) ───────────────────────────────
const PyodideLoader = (() => {
  let instance = null;
  let loading = false;
  const callbacks = [];

  return {
    get() {
      return new Promise((resolve, reject) => {
        if (instance) { resolve(instance); return; }
        callbacks.push({ resolve, reject });
        if (loading) return;
        loading = true;
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
        s.onload = async () => {
          try {
            // eslint-disable-next-line no-undef
            instance = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/' });
            callbacks.forEach(cb => cb.resolve(instance));
          } catch(e) { callbacks.forEach(cb => cb.reject(e)); }
          callbacks.length = 0;
        };
        s.onerror = e => { callbacks.forEach(cb => cb.reject(e)); callbacks.length = 0; loading = false; };
        document.head.appendChild(s);
      });
    }
  };
})();

// ── BLOCK CLASS: each code block manages itself ──────────────
class CodeBlockInstance {
  constructor(blockData) {
    this.id = blockData.id;
    this.content = blockData.content || '';
    this.lang = blockData.lang || 'javascript';
    this.output = blockData.output || '';
    this.running = false;
  }

  toData() {
    return { id: this.id, type: 'code', content: this.content, lang: this.lang, output: this.output };
  }

  // Run code — fully self-contained, no globals modified outside this scope
  async run() {
    if (this.running) return;
    this.running = true;
    const out = document.getElementById(`out-content-${this.id}`);
    const wrap = document.getElementById(`out-${this.id}`);
    const btn = document.getElementById(`run-${this.id}`);
    if (!out || !wrap) { this.running = false; return; }
    wrap.classList.remove('hidden');
    out.innerHTML = '<span style="color:#8a7898;font-size:0.82rem">Running…</span>';
    if (btn) btn.disabled = true;

    const lang = this.lang;
    try {
      if (lang === 'html' || lang === 'css') { this._runHTML(out); }
      else if (lang === 'python') { await this._runPython(out); }
      else { this._runJS(out); }
    } catch(e) {
      out.innerHTML = `<div class="out-error">Unexpected error: ${esc(e.message)}</div>`;
    } finally {
      this.running = false;
      if (btn) btn.disabled = false;
      this.output = out.innerHTML;
      // Notify notes module to auto-save
      if (typeof notesModule !== 'undefined') notesModule.scheduleAutoSave();
    }
  }

  _runJS(out) {
    const logs = [];
    // Create local console captures — restore immediately after eval
    const orig = { log: console.log, error: console.error, warn: console.warn, info: console.info };
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
      const result = new Function(this.content)();
      if (result !== undefined) logs.push({ type: 'return', text: '← ' + String(result) });
    } catch(e) {
      logs.push({ type: 'error', text: e.message });
    } finally {
      // Always restore — even if error thrown
      console.log = orig.log; console.error = orig.error;
      console.warn = orig.warn; console.info = orig.info;
    }
    if (!logs.length) { out.innerHTML = '<div class="out-ok">✓ Ran with no output.</div>'; return; }
    const cls = { log:'out-line', error:'out-error', warn:'out-warn', return:'out-return', info:'out-info' };
    out.innerHTML = logs.map(l => `<div class="${cls[l.type]||'out-line'}">${esc(l.text)}</div>`).join('');
  }

  async _runPython(out) {
    const statusEl = document.getElementById(`pyodide-status-${this.id}`);
    if (statusEl) statusEl.textContent = 'Loading Python…';
    out.innerHTML = '<div class="out-line" style="color:#f5c842">⏳ Loading Python (first run ~5s)…</div>';
    try {
      const pyodide = await PyodideLoader.get();
      if (statusEl) statusEl.textContent = '';
      // Capture stdout/stderr per execution
      pyodide.runPython(`
import sys
from io import StringIO
_buf = StringIO()
sys.stdout = _buf
sys.stderr = _buf
`);
      try {
        pyodide.runPython(this.content);
        const output = pyodide.runPython('_buf.getvalue()');
        pyodide.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
        out.innerHTML = output.trim()
          ? output.split('\n').map(l => `<div class="out-line">${esc(l)}</div>`).join('')
          : '<div class="out-ok">✓ Ran with no output.</div>';
      } catch(e) {
        pyodide.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
        out.innerHTML = `<div class="out-error">❌ ${esc(e.message)}</div>`;
      }
    } catch(e) {
      if (statusEl) statusEl.textContent = '';
      out.innerHTML = `<div class="out-error">Could not load Python. Check your internet connection.</div>`;
    }
  }

  _runHTML(out) {
    const code = this.lang === 'css'
      ? `<!DOCTYPE html><html><head><style>${this.content}</style></head><body><div class="example">Example element</div><p>Your CSS is applied.</p></body></html>`
      : this.content;
    out.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:300px;border:none;background:white;border-radius:8px';
    out.appendChild(iframe);
    iframe.srcdoc = code;
  }
}

// ── BLOCK ID GENERATOR ───────────────────────────────────────
function genId() {
  return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── NOTES MODULE ─────────────────────────────────────────────
const notesModule = {
  notes: [],
  currentId: null,
  activeFilter: 'all',
  autoTimer: null,
  blocks: [],              // array of { id, type:'text'|'code', content, lang?, output? }
  codeInstances: {},       // id → CodeBlockInstance  (live, not serialised)

  init() {
    this.notes = JSON.parse(localStorage.getItem('lumiere_notes') || '[]');
    this._migrateOldNotes();
    this.persist();
    this.renderList();
    this.setupEvents();
  },

  _migrateOldNotes() {
    this.notes.forEach(n => {
      if (!n.blocks) {
        n.blocks = [];
        if (n.content) n.blocks.push({ id: genId(), type:'text', content: n.content });
        if (n.codeContent) n.blocks.push({ id: genId(), type:'code', content: n.codeContent, lang: n.codeLang||'javascript', output:'' });
        if (!n.blocks.length) n.blocks.push({ id: genId(), type:'text', content:'' });
      }
    });
  },

  setupEvents() {
    document.getElementById('newNoteBtn')?.addEventListener('click', () => this.createNew());
    document.getElementById('noteSaveBtn')?.addEventListener('click', () => this.saveCurrent());
    document.getElementById('noteDeleteBtn')?.addEventListener('click', () => this.deleteCurrent());
    document.getElementById('notePinBtn')?.addEventListener('click', () => this.togglePin());
    document.getElementById('notesSearch')?.addEventListener('input', e => this.renderList(e.target.value));
    document.getElementById('noteTypeSelect')?.addEventListener('change', () => this.scheduleAutoSave());
    document.getElementById('noteTitleInput')?.addEventListener('input', () => this.scheduleAutoSave());

    document.querySelectorAll('#section-notes .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#section-notes .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter;
        this.renderList();
      });
    });

    // Toolbar buttons
    document.getElementById('noteToolbarBold')?.addEventListener('click',      () => this._fmt('bold'));
    document.getElementById('noteToolbarItalic')?.addEventListener('click',    () => this._fmt('italic'));
    document.getElementById('noteToolbarUnderline')?.addEventListener('click', () => this._fmt('underline'));
    document.getElementById('noteToolbarUL')?.addEventListener('click',        () => this._fmt('insertUnorderedList'));
    document.getElementById('noteToolbarOL')?.addEventListener('click',        () => this._fmt('insertOrderedList'));
    document.getElementById('noteToolbarH')?.addEventListener('click',         () => this._fmt('formatBlock','h2'));
    document.getElementById('noteToolbarCode')?.addEventListener('click',      () => this.insertCodeBlock());
    document.getElementById('noteToolbarText')?.addEventListener('click',      () => this.insertTextBlock());
  },

  _fmt(cmd, val) {
    const active = document.activeElement;
    if (active && active.classList.contains('block-text-editor')) {
      document.execCommand(cmd, false, val || null);
    } else {
      // focus the last text block and apply
      const editors = document.querySelectorAll('.block-text-editor');
      if (editors.length) { editors[editors.length-1].focus(); document.execCommand(cmd, false, val||null); }
    }
  },

  // ── OPEN / CREATE ─────────────────────────────────────────
  createNew() {
    const note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      type: 'personal',
      pinned: false,
      blocks: [{ id: genId(), type:'text', content:'', output:'' }],
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
    this._refreshPinBtn(note.pinned);

    // Deep copy blocks; rebuild instances map
    this.blocks = JSON.parse(JSON.stringify(note.blocks || []));
    if (!this.blocks.length) this.blocks.push({ id: genId(), type:'text', content:'' });
    this.codeInstances = {};
    this.blocks.filter(b => b.type==='code').forEach(b => {
      this.codeInstances[b.id] = new CodeBlockInstance(b);
    });

    this.renderBlocks();
    document.querySelectorAll('.note-card').forEach(c => c.classList.remove('active'));
    document.querySelector(`.note-card[data-id="${id}"]`)?.classList.add('active');
  },

  _refreshPinBtn(pinned) {
    const btn = document.getElementById('notePinBtn');
    if (!btn) return;
    btn.textContent = pinned ? '📌 Pinned' : '📌 Pin';
    btn.style.background = pinned ? 'var(--pink-soft)' : 'none';
    btn.style.border     = pinned ? '1.5px solid var(--pink)' : '1px solid var(--border)';
    btn.style.color      = pinned ? 'var(--text)' : 'var(--text-3)';
  },

  // ── RENDER BLOCKS ─────────────────────────────────────────
  renderBlocks() {
    const container = document.getElementById('noteBlocksContainer');
    if (!container) return;
    container.innerHTML = '';
    this.blocks.forEach((block, idx) => {
      const el = block.type === 'code' ? this._buildCodeBlock(block, idx) : this._buildTextBlock(block, idx);
      container.appendChild(el);
    });
  },

  _blockControls(block, idx) {
    const isCode = block.type === 'code';
    return `<div class="block-actions">
      <span class="block-type-label ${isCode?'code-label':''}">${isCode?'⟨/⟩ Code':'Text'}</span>
      ${isCode ? `<select class="block-lang-select" id="lang-${block.id}" onchange="notesModule._onLangChange('${block.id}',this.value)">
        ${['javascript','python','html','css','other'].map(l=>`<option value="${l}" ${l===(block.lang||'javascript')?'selected':''}>${l==='javascript'?'JavaScript':l==='python'?'Python 🐍':l.toUpperCase()}</option>`).join('')}
      </select>
      <span id="pyodide-status-${block.id}" style="font-size:0.68rem;color:var(--text-3)"></span>` : ''}
      <div class="block-btns" style="margin-left:auto">
        ${idx > 0 ? `<button class="block-btn" onclick="notesModule.moveBlock('${block.id}',-1)" title="Move up">↑</button>` : ''}
        ${idx < this.blocks.length-1 ? `<button class="block-btn" onclick="notesModule.moveBlock('${block.id}',1)" title="Move down">↓</button>` : ''}
        ${this.blocks.length > 1 ? `<button class="block-btn danger" onclick="notesModule.removeBlock('${block.id}')" title="Remove">✕</button>` : ''}
      </div>
    </div>`;
  },

  _buildTextBlock(block, idx) {
    const wrap = document.createElement('div');
    wrap.className = 'note-block note-block-text';
    wrap.dataset.id = block.id;
    wrap.innerHTML = this._blockControls(block, idx) +
      `<div class="block-text-editor" contenteditable="true" data-block-id="${block.id}">${block.content||''}</div>`;

    const editor = wrap.querySelector('.block-text-editor');
    editor.addEventListener('input', () => { block.content = editor.innerHTML; this.scheduleAutoSave(); });
    editor.addEventListener('focus', () => { document.querySelectorAll('.note-block').forEach(b=>b.classList.remove('block-focused')); wrap.classList.add('block-focused'); });
    editor.addEventListener('keydown', e => {
      if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertHTML',false,e.shiftKey?'':'&nbsp;&nbsp;&nbsp;&nbsp;'); }
    });
    return wrap;
  },

  _buildCodeBlock(block, idx) {
    // Ensure instance exists
    if (!this.codeInstances[block.id]) {
      this.codeInstances[block.id] = new CodeBlockInstance(block);
    }
    const inst = this.codeInstances[block.id];

    const wrap = document.createElement('div');
    wrap.className = 'note-block note-block-code';
    wrap.dataset.id = block.id;
    wrap.innerHTML = this._blockControls(block, idx) +
      `<div class="code-block-editor-wrap">
        <textarea class="block-code-editor" id="code-${block.id}" spellcheck="false" autocorrect="off" autocapitalize="off">${esc(inst.content)}</textarea>
        <div class="code-block-controls">
          <button class="block-run-btn" id="run-${block.id}">▶ Run</button>
          <button class="block-reset-btn" id="reset-${block.id}" title="Reset to saved">↺ Reset</button>
          <span style="font-size:0.7rem;color:var(--text-3)">Ctrl+Enter</span>
        </div>
      </div>
      <div class="block-output-wrap hidden" id="out-${block.id}">
        <div class="block-output-bar">
          <span id="out-label-${block.id}">Output</span>
          <button onclick="notesModule.clearBlockOutput('${block.id}')" style="background:none;border:none;color:#8a7898;cursor:pointer;font-size:0.72rem">✕ Clear</button>
        </div>
        <div class="block-output" id="out-content-${block.id}">${inst.output||''}</div>
      </div>`;

    // Restore saved output if exists
    if (inst.output) wrap.querySelector(`#out-${block.id}`)?.classList.remove('hidden');

    const textarea = wrap.querySelector(`#code-${block.id}`);
    const runBtn   = wrap.querySelector(`#run-${block.id}`);
    const resetBtn = wrap.querySelector(`#reset-${block.id}`);

    // Sync textarea → instance (closure captures inst directly)
    textarea.addEventListener('input', () => { inst.content = textarea.value; block.content = textarea.value; this.scheduleAutoSave(); });
    textarea.addEventListener('keydown', e => {
      if (e.key === 'Tab') { e.preventDefault(); const s=textarea.selectionStart; textarea.value=textarea.value.slice(0,s)+'  '+textarea.value.slice(textarea.selectionEnd); textarea.selectionStart=textarea.selectionEnd=s+2; }
      if ((e.ctrlKey||e.metaKey) && e.key === 'Enter') { e.preventDefault(); inst.run(); }
    });
    textarea.addEventListener('focus', () => { document.querySelectorAll('.note-block').forEach(b=>b.classList.remove('block-focused')); wrap.classList.add('block-focused'); });

    runBtn.addEventListener('click', () => inst.run());
    resetBtn.addEventListener('click', () => this.resetCodeBlock(block.id));

    return wrap;
  },

  _onLangChange(blockId, lang) {
    const block = this.blocks.find(b=>b.id===blockId);
    if (block) block.lang = lang;
    const inst = this.codeInstances[blockId];
    if (inst) inst.lang = lang;
    this.scheduleAutoSave();
  },

  // ── BLOCK OPERATIONS ──────────────────────────────────────
  insertTextBlock() {
    const block = { id: genId(), type:'text', content:'' };
    this.blocks.push(block);
    this.renderBlocks();
    setTimeout(() => {
      const el = document.querySelector(`.block-text-editor[data-block-id="${block.id}"]`);
      el?.focus();
    }, 50);
    this.scheduleAutoSave();
  },

  insertCodeBlock() {
    const block = { id: genId(), type:'code', content:'// Write your code here\nconsole.log("Hello, World!");', lang:'javascript', output:'' };
    this.blocks.push(block);
    this.codeInstances[block.id] = new CodeBlockInstance(block);
    this.renderBlocks();
    setTimeout(() => {
      const el = document.getElementById(`code-${block.id}`);
      el?.focus();
    }, 50);
    this.scheduleAutoSave();
  },

  removeBlock(blockId) {
    if (this.blocks.length <= 1) { showToast('A note must have at least one block.'); return; }
    this.blocks = this.blocks.filter(b => b.id !== blockId);
    delete this.codeInstances[blockId];
    this.renderBlocks();
    this.scheduleAutoSave();
  },

  moveBlock(blockId, dir) {
    const idx = this.blocks.findIndex(b => b.id === blockId);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= this.blocks.length) return;
    const [blk] = this.blocks.splice(idx, 1);
    this.blocks.splice(newIdx, 0, blk);
    this.renderBlocks();
    this.scheduleAutoSave();
  },

  resetCodeBlock(blockId) {
    const note = this.notes.find(n => n.id === this.currentId);
    const savedBlock = note?.blocks?.find(b => b.id === blockId);
    const inst = this.codeInstances[blockId];
    if (savedBlock && inst) {
      inst.content = savedBlock.content || '';
      const ta = document.getElementById(`code-${blockId}`);
      if (ta) ta.value = inst.content;
      const block = this.blocks.find(b=>b.id===blockId);
      if (block) block.content = inst.content;
    }
    this.clearBlockOutput(blockId);
    showToast('Reset to last saved version');
  },

  clearBlockOutput(blockId) {
    const wrap = document.getElementById(`out-${blockId}`);
    const content = document.getElementById(`out-content-${blockId}`);
    if (wrap) wrap.classList.add('hidden');
    if (content) content.innerHTML = '';
    const inst = this.codeInstances[blockId];
    if (inst) inst.output = '';
    const block = this.blocks.find(b=>b.id===blockId);
    if (block) block.output = '';
  },

  // ── SAVE ─────────────────────────────────────────────────
  scheduleAutoSave() {
    clearTimeout(this.autoTimer);
    this.autoTimer = setTimeout(() => this.saveCurrent(true), 1500);
  },

  saveCurrent(silent=false) {
    if (!this.currentId) return;
    const note = this.notes.find(n => n.id === this.currentId);
    if (!note) return;
    this._syncFromDOM();
    note.title    = document.getElementById('noteTitleInput').value || 'Untitled Note';
    note.type     = document.getElementById('noteTypeSelect').value || 'personal';
    note.blocks   = JSON.parse(JSON.stringify(this.blocks));
    note.content  = this.blocks.filter(b=>b.type==='text').map(b=>b.content.replace(/<[^>]+>/g,'')).join(' ');
    note.codeContent = this.blocks.filter(b=>b.type==='code').map(b=>b.content).join('\n');
    note.updatedAt = new Date().toISOString();
    this.persist();
    this.renderList();
    document.querySelector(`.note-card[data-id="${this.currentId}"]`)?.classList.add('active');
    if (!silent) showToast('Note saved ✦');
  },

  _syncFromDOM() {
    this.blocks.forEach(block => {
      if (block.type === 'text') {
        const el = document.querySelector(`.block-text-editor[data-block-id="${block.id}"]`);
        if (el) block.content = el.innerHTML;
      } else {
        const ta = document.getElementById(`code-${block.id}`);
        if (ta) { block.content = ta.value; }
        const langEl = document.getElementById(`lang-${block.id}`);
        if (langEl) { block.lang = langEl.value; }
        const inst = this.codeInstances[block.id];
        if (inst) block.output = inst.output || '';
      }
    });
  },

  deleteCurrent() {
    if (!this.currentId) return;
    if (!confirm('Delete this note?')) return;
    this.notes = this.notes.filter(n => n.id !== this.currentId);
    this.currentId = null;
    this.blocks = [];
    this.codeInstances = {};
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
    this._refreshPinBtn(note.pinned);
    this.persist();
    this.renderList();
    document.querySelector(`.note-card[data-id="${this.currentId}"]`)?.classList.add('active');
    showToast(note.pinned ? 'Note pinned 📌' : 'Note unpinned');
  },

  // ── LIST ─────────────────────────────────────────────────
  getFiltered(q='') {
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
    return list.sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)||new Date(b.updatedAt)-new Date(a.updatedAt));
  },

  renderList(q='') {
    const list = document.getElementById('notesList');
    if (!list) return;
    const notes = this.getFiltered(q);
    if (!notes.length) { list.innerHTML='<p class="empty-hint">No notes found 🌿</p>'; return; }
    list.innerHTML = notes.map(n => {
      const date  = new Date(n.updatedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'});
      const preview = (n.content||'').replace(/<[^>]+>/g,'').substring(0,50)||'Empty note…';
      const hasCode = (n.blocks||[]).some(b=>b.type==='code');
      const active = n.id === this.currentId ? ' active' : '';
      return `<div class="note-card${active}" data-id="${n.id}" onclick="notesModule.openNote('${n.id}')">
        <div class="note-card-title">${n.pinned?'📌 ':''}${n.title}${hasCode?'<span class="note-code-badge">⟨/⟩</span>':''}</div>
        <div style="font-size:0.75rem;color:var(--text-3);margin-bottom:0.3rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${preview}</div>
        <div class="note-card-meta"><span class="note-tag">${n.type||'personal'}</span><span class="note-card-date">${date}</span></div>
      </div>`;
    }).join('');
  },

  persist() { localStorage.setItem('lumiere_notes', JSON.stringify(this.notes)); }
};
