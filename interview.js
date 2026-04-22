// ============================================================
// LUMIÈRE — interview.js
// Interview Prep module — Coding, Behavioral, System Design, Notes
// Uses the same isolated CodeBlockInstance from notes.js
// ============================================================

// ── SHARED CODE RUNNER (mirrors CodeBlockInstance from notes.js) ─
// We don't modify notes.js — we replicate the safe pattern here.
class IPCodeBlock {
  constructor(id, lang, content) {
    this.id      = id;
    this.lang    = lang || 'javascript';
    this.content = content || '';
    this.output  = '';
    this.running = false;
  }

  async run() {
    if (this.running) return;
    this.running = true;
    const out  = document.getElementById(`ip-out-content-${this.id}`);
    const wrap = document.getElementById(`ip-out-${this.id}`);
    const btn  = document.getElementById(`ip-run-${this.id}`);
    if (!out || !wrap) { this.running = false; return; }
    wrap.classList.remove('hidden');
    out.innerHTML = '<span style="color:#8a7898;font-size:0.82rem">Running…</span>';
    if (btn) btn.disabled = true;

    try {
      if (this.lang === 'html' || this.lang === 'css') this._runHTML(out);
      else if (this.lang === 'python') await this._runPython(out);
      else this._runJS(out);
    } catch(e) {
      out.innerHTML = `<div class="out-error">Error: ${ipEsc(e.message)}</div>`;
    } finally {
      this.running = false;
      if (btn) btn.disabled = false;
      this.output = out.innerHTML;
      if (typeof interviewModule !== 'undefined') interviewModule.scheduleSave();
    }
  }

  _runJS(out) {
    const logs = [];
    const orig = { log: console.log, error: console.error, warn: console.warn, info: console.info };
    const cap = type => (...args) => {
      logs.push({ type, text: args.map(a => { try { return typeof a === 'object' && a !== null ? JSON.stringify(a, null, 2) : String(a); } catch(e) { return String(a); } }).join(' ') });
    };
    console.log = cap('log'); console.error = cap('error'); console.warn = cap('warn'); console.info = cap('info');
    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(this.content)();
      if (result !== undefined) logs.push({ type: 'return', text: '← ' + String(result) });
    } catch(e) {
      logs.push({ type: 'error', text: e.message });
    } finally {
      console.log = orig.log; console.error = orig.error; console.warn = orig.warn; console.info = orig.info;
    }
    if (!logs.length) { out.innerHTML = '<div class="out-ok">✓ Ran with no output.</div>'; return; }
    const cls = { log:'out-line', error:'out-error', warn:'out-warn', return:'out-return', info:'out-info' };
    out.innerHTML = logs.map(l => `<div class="${cls[l.type]||'out-line'}">${ipEsc(l.text)}</div>`).join('');
  }

  async _runPython(out) {
    const statusEl = document.getElementById(`ip-pyodide-status-${this.id}`);
    if (statusEl) statusEl.textContent = 'Loading…';
    out.innerHTML = '<div class="out-line" style="color:#f5c842">⏳ Loading Python (~5s first time)…</div>';
    try {
      const pyodide = await PyodideLoader.get();
      if (statusEl) statusEl.textContent = '';
      pyodide.runPython('import sys\nfrom io import StringIO\n_ip_buf = StringIO()\nsys.stdout = _ip_buf\nsys.stderr = _ip_buf');
      try {
        pyodide.runPython(this.content);
        const output = pyodide.runPython('_ip_buf.getvalue()');
        pyodide.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
        out.innerHTML = output.trim()
          ? output.split('\n').map(l => `<div class="out-line">${ipEsc(l)}</div>`).join('')
          : '<div class="out-ok">✓ Ran with no output.</div>';
      } catch(e) {
        pyodide.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
        out.innerHTML = `<div class="out-error">❌ ${ipEsc(e.message)}</div>`;
      }
    } catch(e) {
      if (statusEl) statusEl.textContent = '';
      out.innerHTML = '<div class="out-error">Could not load Python. Check internet connection.</div>';
    }
  }

  _runHTML(out) {
    const code = this.lang === 'css'
      ? `<!DOCTYPE html><html><head><style>${this.content}</style></head><body><p>CSS preview</p><div class="example">Example</div></body></html>`
      : this.content;
    out.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:280px;border:none;background:white;border-radius:8px';
    out.appendChild(iframe);
    iframe.srcdoc = code;
  }
}

function ipEsc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function ipGenId() {
  return 'ip' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

// ── INTERVIEW MODULE ──────────────────────────────────────────
const interviewModule = {
  data: {
    coding:    [],   // { id, title, content:'', blocks:[] }
    behavioral:[],   // { id, title, content, category }
    sysdesign: [],   // { id, title, sections:{problem,approach,scalability,database,notes} }
    general:   []    // { id, title, blocks:[] }  (mixed text+code like notes)
  },
  currentTab: 'coding',
  currentEntryId: null,
  codeInstances: {},  // ip-id → IPCodeBlock
  saveTimer: null,

  init() {
    const saved = localStorage.getItem('lumiere_interview');
    if (saved) {
      try { Object.assign(this.data, JSON.parse(saved)); } catch(e) {}
    }
    this._seedDefaults();
    this.setupEvents();
    this.renderTab('coding');
  },

  _seedDefaults() {
    if (!this.data.behavioral.length) {
      [
        { title:'Tell me about yourself', category:'intro' },
        { title:'Why this company?', category:'motivation' },
        { title:'Strengths', category:'strengths' },
        { title:'Weaknesses', category:'weaknesses' },
        { title:'STAR: Greatest achievement', category:'star' },
        { title:'STAR: Challenging situation', category:'star' },
        { title:'Where do you see yourself in 5 years?', category:'future' },
      ].forEach(b => this.data.behavioral.push({ id: ipGenId(), title: b.title, category: b.category, content: '' }));
    }
    if (!this.data.sysdesign.length) {
      [
        { title:'Design a URL Shortener' },
        { title:'Design a Chat System' },
        { title:'Design a Rate Limiter' },
      ].forEach(s => this.data.sysdesign.push({
        id: ipGenId(), title: s.title,
        sections: { problem:'', approach:'', scalability:'', database:'', notes:'' }
      }));
    }
  },

  save() { localStorage.setItem('lumiere_interview', JSON.stringify(this.data)); },
  scheduleSave() { clearTimeout(this.saveTimer); this.saveTimer = setTimeout(() => this.save(), 1000); },

  setupEvents() {
    document.querySelectorAll('#section-interview .ip-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.renderTab(btn.dataset.tab));
    });
    document.getElementById('ipAddEntryBtn')?.addEventListener('click', () => this.addEntry());
  },

  renderTab(tab) {
    this.currentTab = tab;
    this.currentEntryId = null;
    this.codeInstances = {};

    document.querySelectorAll('#section-interview .ip-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`#section-interview .ip-tab-btn[data-tab="${tab}"]`)?.classList.add('active');

    // Update add button label
    const labels = { coding:'+ Problem', behavioral:'+ Answer Template', sysdesign:'+ Design Question', general:'+ Note' };
    const addBtn = document.getElementById('ipAddEntryBtn');
    if (addBtn) addBtn.textContent = labels[tab] || '+ Add';

    const content = document.getElementById('ipContent');
    if (!content) return;

    if (tab === 'coding')    this.renderCodingTab(content);
    if (tab === 'behavioral')this.renderBehavioralTab(content);
    if (tab === 'sysdesign') this.renderSysDesignTab(content);
    if (tab === 'general')   this.renderGeneralTab(content);
  },

  addEntry() {
    const tab = this.currentTab;
    const title = prompt(`Entry title:`);
    if (!title || !title.trim()) return;
    const id = ipGenId();

    if (tab === 'coding') {
      this.data.coding.push({ id, title: title.trim(), description: '', blocks: [{ id: ipGenId(), type:'code', lang:'javascript', content:'// Write your solution here\n', output:'' }] });
    } else if (tab === 'behavioral') {
      this.data.behavioral.push({ id, title: title.trim(), category:'custom', content:'' });
    } else if (tab === 'sysdesign') {
      this.data.sysdesign.push({ id, title: title.trim(), sections:{ problem:'', approach:'', scalability:'', database:'', notes:'' } });
    } else if (tab === 'general') {
      this.data.general.push({ id, title: title.trim(), blocks:[{ id: ipGenId(), type:'text', content:'' }] });
    }
    this.save();
    this.renderTab(tab);
    // Auto-open the new entry
    setTimeout(() => this.openEntry(id), 100);
  },

  deleteEntry(id) {
    if (!confirm('Delete this entry?')) return;
    const tab = this.currentTab;
    this.data[tab] = this.data[tab].filter(e => e.id !== id);
    this.save();
    this.renderTab(tab);
  },

  // ── CODING TAB ────────────────────────────────────────────
  renderCodingTab(container) {
    const entries = this.data.coding;
    container.innerHTML = `
      <div class="ip-layout">
        <div class="ip-entry-list">
          ${!entries.length ? '<p class="empty-hint">No problems yet. Add your first!</p>' :
            entries.map(e => `<div class="ip-entry-item${e.id===this.currentEntryId?' active':''}" onclick="interviewModule.openEntry('${e.id}')">
              <div class="ip-entry-title">💻 ${e.title}</div>
              <div class="ip-entry-meta">${e.blocks?.filter(b=>b.type==='code').length||0} code block${(e.blocks?.filter(b=>b.type==='code').length||0)!==1?'s':''}</div>
            </div>`).join('')}
        </div>
        <div class="ip-editor-area" id="ipEditorArea">
          <div class="ip-editor-empty"><div style="font-size:2rem;opacity:0.3">💻</div><p style="color:var(--text-3)">Select a problem or add a new one</p></div>
        </div>
      </div>`;
    if (this.currentEntryId) this.openEntry(this.currentEntryId);
  },

  // ── BEHAVIORAL TAB ────────────────────────────────────────
  renderBehavioralTab(container) {
    const entries = this.data.behavioral;
    const catColor = { intro:'#87b8e8', motivation:'#f5c842', strengths:'#6abf7b', weaknesses:'#e06c75', star:'#c8b4e8', future:'#f2b8c0', custom:'#b0b0c8' };
    const catLabel = { intro:'Intro', motivation:'Motivation', strengths:'Strength', weaknesses:'Weakness', star:'STAR', future:'Future', custom:'Custom' };
    container.innerHTML = `
      <div class="ip-layout">
        <div class="ip-entry-list">
          ${entries.map(e => `<div class="ip-entry-item${e.id===this.currentEntryId?' active':''}" onclick="interviewModule.openEntry('${e.id}')">
            <div class="ip-entry-title">${e.title}</div>
            <div class="ip-entry-meta"><span style="background:${catColor[e.category]||'#ccc'}22;color:${catColor[e.category]||'#888'};font-size:0.68rem;padding:0.1rem 0.4rem;border-radius:4px">${catLabel[e.category]||'Note'}</span></div>
          </div>`).join('')}
        </div>
        <div class="ip-editor-area" id="ipEditorArea">
          <div class="ip-editor-empty"><div style="font-size:2rem;opacity:0.3">💬</div><p style="color:var(--text-3)">Select a question to write your answer</p></div>
        </div>
      </div>`;
    if (this.currentEntryId) this.openEntry(this.currentEntryId);
  },

  // ── SYSTEM DESIGN TAB ─────────────────────────────────────
  renderSysDesignTab(container) {
    const entries = this.data.sysdesign;
    container.innerHTML = `
      <div class="ip-layout">
        <div class="ip-entry-list">
          ${entries.map(e => `<div class="ip-entry-item${e.id===this.currentEntryId?' active':''}" onclick="interviewModule.openEntry('${e.id}')">
            <div class="ip-entry-title">🏗 ${e.title}</div>
          </div>`).join('')}
        </div>
        <div class="ip-editor-area" id="ipEditorArea">
          <div class="ip-editor-empty"><div style="font-size:2rem;opacity:0.3">🏗</div><p style="color:var(--text-3)">Select a design question to structure your answer</p></div>
        </div>
      </div>`;
    if (this.currentEntryId) this.openEntry(this.currentEntryId);
  },

  // ── GENERAL NOTES TAB ─────────────────────────────────────
  renderGeneralTab(container) {
    const entries = this.data.general;
    container.innerHTML = `
      <div class="ip-layout">
        <div class="ip-entry-list">
          ${!entries.length ? '<p class="empty-hint">No notes yet.</p>' :
            entries.map(e => `<div class="ip-entry-item${e.id===this.currentEntryId?' active':''}" onclick="interviewModule.openEntry('${e.id}')">
              <div class="ip-entry-title">📝 ${e.title}</div>
              <div class="ip-entry-meta">${e.blocks?.length||0} block${(e.blocks?.length||0)!==1?'s':''}</div>
            </div>`).join('')}
        </div>
        <div class="ip-editor-area" id="ipEditorArea">
          <div class="ip-editor-empty"><div style="font-size:2rem;opacity:0.3">📝</div><p style="color:var(--text-3)">Select a note to edit</p></div>
        </div>
      </div>`;
    if (this.currentEntryId) this.openEntry(this.currentEntryId);
  },

  // ── OPEN AN ENTRY ─────────────────────────────────────────
  openEntry(id) {
    this.currentEntryId = id;
    document.querySelectorAll('.ip-entry-item').forEach(el => el.classList.toggle('active', el.onclick?.toString().includes(id)));

    const area = document.getElementById('ipEditorArea');
    if (!area) return;

    const tab = this.currentTab;
    const entry = this.data[tab]?.find(e => e.id === id);
    if (!entry) return;

    if (tab === 'coding')    this.renderCodingEditor(area, entry);
    if (tab === 'behavioral')this.renderBehavioralEditor(area, entry);
    if (tab === 'sysdesign') this.renderSysDesignEditor(area, entry);
    if (tab === 'general')   this.renderGeneralEditor(area, entry);
  },

  // ── CODING EDITOR ─────────────────────────────────────────
  renderCodingEditor(area, entry) {
    area.innerHTML = `
      <div class="ip-editor-header">
        <div>
          <input class="ip-title-input" id="ipEntryTitle" value="${ipEsc(entry.title)}" placeholder="Problem title"/>
          <div class="ip-editor-toolbar">
            <button class="ip-toolbar-btn" onclick="interviewModule.ipAddCodeBlock('${entry.id}','coding')">⟨/⟩ Add Code Block</button>
            <button class="ip-toolbar-btn" onclick="interviewModule.ipAddTextBlock('${entry.id}','coding')">+ Text</button>
            <button class="ip-toolbar-btn ip-save-btn" onclick="interviewModule.saveEditorState('${entry.id}','coding')">Save ✦</button>
            <button class="ip-toolbar-btn ip-del-btn" onclick="interviewModule.deleteEntry('${entry.id}')">Delete</button>
          </div>
        </div>
      </div>
      <div class="ip-blocks-container" id="ipBlocks-${entry.id}"></div>`;

    document.getElementById('ipEntryTitle')?.addEventListener('input', e => { entry.title = e.target.value; this.scheduleSave(); this._refreshEntryList(); });
    this._renderBlocks(entry, 'coding');
  },

  // ── BEHAVIORAL EDITOR ─────────────────────────────────────
  renderBehavioralEditor(area, entry) {
    const tips = {
      intro: '💡 Structure: Who you are → Key experiences → Why you\'re here',
      motivation: '💡 Research the company: mission, culture, recent news. Be specific.',
      strengths: '💡 Name 2-3 strengths with evidence. Tie to the role.',
      weaknesses: '💡 Be honest. Show self-awareness and what you\'re doing to improve.',
      star: '💡 STAR: Situation → Task → Action → Result. Quantify results.',
      future: '💡 Align your goals with the company\'s growth. Show ambition + realism.',
      custom: ''
    };
    area.innerHTML = `
      <div class="ip-editor-header">
        <input class="ip-title-input" id="ipEntryTitle" value="${ipEsc(entry.title)}" placeholder="Question"/>
        <div class="ip-editor-toolbar">
          <button class="ip-toolbar-btn ip-save-btn" onclick="interviewModule.saveBehavioral('${entry.id}')">Save ✦</button>
          <button class="ip-toolbar-btn ip-del-btn" onclick="interviewModule.deleteEntry('${entry.id}')">Delete</button>
        </div>
      </div>
      ${tips[entry.category] ? `<div class="ip-tip">${tips[entry.category]}</div>` : ''}
      <div class="ip-rich-toolbar">
        <button onclick="interviewModule._behFmt('bold')"><b>B</b></button>
        <button onclick="interviewModule._behFmt('italic')"><i>I</i></button>
        <button onclick="interviewModule._behFmt('underline')"><u>U</u></button>
        <button onclick="interviewModule._behFmt('insertUnorderedList')">≡</button>
        <button onclick="interviewModule._behFmt('insertOrderedList')">1.</button>
        <button onclick="interviewModule._behFmt('formatBlock','h3')">H</button>
      </div>
      <div class="ip-rich-editor" id="ipBehEditor" contenteditable="true">${entry.content||''}</div>
      <div style="margin-top:0.6rem;font-size:0.78rem;color:var(--text-3)">Auto-saves as you type.</div>`;

    document.getElementById('ipEntryTitle')?.addEventListener('input', e => { entry.title = e.target.value; this.scheduleSave(); this._refreshEntryList(); });
    const editor = document.getElementById('ipBehEditor');
    editor?.addEventListener('input', () => { entry.content = editor.innerHTML; this.scheduleSave(); });
  },

  _behFmt(cmd, val) {
    const el = document.getElementById('ipBehEditor');
    if (el) { el.focus(); document.execCommand(cmd, false, val||null); }
  },

  saveBehavioral(id) {
    const entry = this.data.behavioral.find(e => e.id === id);
    if (!entry) return;
    const editor = document.getElementById('ipBehEditor');
    if (editor) entry.content = editor.innerHTML;
    this.save();
    showToast('Answer saved ✦');
  },

  // ── SYSTEM DESIGN EDITOR ──────────────────────────────────
  renderSysDesignEditor(area, entry) {
    const s = entry.sections || {};
    const fields = [
      { key:'problem',     label:'📋 Problem Statement',         ph:'Describe the system requirements, constraints, and goals...' },
      { key:'approach',    label:'🏗 High-Level Approach',       ph:'Describe your overall architecture...' },
      { key:'scalability', label:'📈 Scalability Considerations', ph:'How will you handle scale? Load balancing, caching, CDN...' },
      { key:'database',    label:'🗄 Database Design',           ph:'Schema design, SQL vs NoSQL, sharding strategy...' },
      { key:'notes',       label:'📝 Additional Notes',          ph:'Edge cases, trade-offs, follow-up questions...' },
    ];
    area.innerHTML = `
      <div class="ip-editor-header">
        <input class="ip-title-input" id="ipEntryTitle" value="${ipEsc(entry.title)}" placeholder="Design question"/>
        <div class="ip-editor-toolbar">
          <button class="ip-toolbar-btn ip-save-btn" onclick="interviewModule.saveSysDesign('${entry.id}')">Save ✦</button>
          <button class="ip-toolbar-btn ip-del-btn" onclick="interviewModule.deleteEntry('${entry.id}')">Delete</button>
        </div>
      </div>
      <div class="ip-sysdesign-fields" id="ipSysFields-${entry.id}">
        ${fields.map(f => `
          <div class="ip-field">
            <div class="ip-field-label">${f.label}</div>
            <textarea class="ip-field-textarea" id="ipad-${entry.id}-${f.key}" placeholder="${f.ph}" rows="4">${ipEsc(s[f.key]||'')}</textarea>
          </div>`).join('')}
      </div>`;

    document.getElementById('ipEntryTitle')?.addEventListener('input', e => { entry.title = e.target.value; this.scheduleSave(); this._refreshEntryList(); });
    fields.forEach(f => {
      const el = document.getElementById(`ipad-${entry.id}-${f.key}`);
      el?.addEventListener('input', () => { entry.sections[f.key] = el.value; this.scheduleSave(); });
    });
  },

  saveSysDesign(id) {
    const entry = this.data.sysdesign.find(e => e.id === id);
    if (!entry) return;
    const fields = ['problem','approach','scalability','database','notes'];
    fields.forEach(k => {
      const el = document.getElementById(`ipad-${id}-${k}`);
      if (el) entry.sections[k] = el.value;
    });
    this.save();
    showToast('Design saved ✦');
  },

  // ── GENERAL EDITOR ────────────────────────────────────────
  renderGeneralEditor(area, entry) {
    area.innerHTML = `
      <div class="ip-editor-header">
        <input class="ip-title-input" id="ipEntryTitle" value="${ipEsc(entry.title)}" placeholder="Note title"/>
        <div class="ip-editor-toolbar">
          <button class="ip-toolbar-btn" onclick="interviewModule._genFmt('bold')"><b>B</b></button>
          <button class="ip-toolbar-btn" onclick="interviewModule._genFmt('italic')"><i>I</i></button>
          <button class="ip-toolbar-btn" onclick="interviewModule._genFmt('insertUnorderedList')">≡</button>
          <button class="ip-toolbar-btn" onclick="interviewModule._genFmt('formatBlock','h3')">H</button>
          <span style="width:1px;height:20px;background:var(--border);margin:0 0.3rem"></span>
          <button class="ip-toolbar-btn" onclick="interviewModule.ipAddTextBlock('${entry.id}','general')">+ Text</button>
          <button class="ip-toolbar-btn" onclick="interviewModule.ipAddCodeBlock('${entry.id}','general')">⟨/⟩ Code</button>
          <button class="ip-toolbar-btn ip-save-btn" onclick="interviewModule.saveEditorState('${entry.id}','general')">Save ✦</button>
          <button class="ip-toolbar-btn ip-del-btn" onclick="interviewModule.deleteEntry('${entry.id}')">Delete</button>
        </div>
      </div>
      <div class="ip-blocks-container" id="ipBlocks-${entry.id}"></div>`;

    document.getElementById('ipEntryTitle')?.addEventListener('input', e => { entry.title = e.target.value; this.scheduleSave(); this._refreshEntryList(); });
    this._renderBlocks(entry, 'general');
  },

  _genFmt(cmd, val) {
    const active = document.activeElement;
    if (active && active.classList.contains('ip-text-editor')) { document.execCommand(cmd, false, val||null); }
  },

  // ── BLOCK SYSTEM (shared between coding + general) ────────
  _renderBlocks(entry, tab) {
    const container = document.getElementById(`ipBlocks-${entry.id}`);
    if (!container) return;
    container.innerHTML = '';
    (entry.blocks||[]).forEach((block, idx) => {
      const el = block.type === 'code'
        ? this._buildCodeBlock(entry, block, idx, tab)
        : this._buildTextBlock(entry, block, idx, tab);
      container.appendChild(el);
    });
  },

  _buildTextBlock(entry, block, idx, tab) {
    const wrap = document.createElement('div');
    wrap.className = 'ip-block ip-block-text';
    wrap.dataset.id = block.id;
    wrap.innerHTML = `
      <div class="ip-block-bar">
        <span class="ip-block-label">Text</span>
        <div style="margin-left:auto;display:flex;gap:0.2rem">
          ${idx > 0 ? `<button class="block-btn" onclick="interviewModule.moveBlock('${entry.id}','${block.id}',-1,'${tab}')">↑</button>` : ''}
          ${idx < (entry.blocks.length-1) ? `<button class="block-btn" onclick="interviewModule.moveBlock('${entry.id}','${block.id}',1,'${tab}')">↓</button>` : ''}
          ${entry.blocks.length > 1 ? `<button class="block-btn danger" onclick="interviewModule.removeBlock('${entry.id}','${block.id}','${tab}')">✕</button>` : ''}
        </div>
      </div>
      <div class="ip-text-editor" contenteditable="true" data-block-id="${block.id}">${block.content||''}</div>`;

    const editor = wrap.querySelector('.ip-text-editor');
    editor.addEventListener('input', () => { block.content = editor.innerHTML; this.scheduleSave(); });
    editor.addEventListener('focus', () => { document.querySelectorAll('.ip-block').forEach(b=>b.classList.remove('ip-block-focused')); wrap.classList.add('ip-block-focused'); });
    editor.addEventListener('keydown', e => {
      if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;'); }
    });
    return wrap;
  },

  _buildCodeBlock(entry, block, idx, tab) {
    const instKey = `${entry.id}-${block.id}`;
    if (!this.codeInstances[instKey]) {
      this.codeInstances[instKey] = new IPCodeBlock(block.id, block.lang||'javascript', block.content||'');
    }
    const inst = this.codeInstances[instKey];

    const wrap = document.createElement('div');
    wrap.className = 'ip-block ip-block-code';
    wrap.dataset.id = block.id;

    const langOpts = ['javascript','python','html','css','other'].map(l =>
      `<option value="${l}" ${l===(block.lang||'javascript')?'selected':''}>${l==='javascript'?'JavaScript':l==='python'?'Python 🐍':l.toUpperCase()}</option>`
    ).join('');

    wrap.innerHTML = `
      <div class="ip-block-bar">
        <span class="ip-block-label code-label">⟨/⟩ Code</span>
        <select class="block-lang-select" id="ip-lang-${block.id}" onchange="interviewModule.onLangChange('${instKey}','${block.id}',this.value,'${tab}','${entry.id}')">${langOpts}</select>
        <span id="ip-pyodide-status-${block.id}" style="font-size:0.68rem;color:var(--text-3)"></span>
        <div style="margin-left:auto;display:flex;gap:0.2rem">
          ${idx > 0 ? `<button class="block-btn" onclick="interviewModule.moveBlock('${entry.id}','${block.id}',-1,'${tab}')">↑</button>` : ''}
          ${idx < (entry.blocks.length-1) ? `<button class="block-btn" onclick="interviewModule.moveBlock('${entry.id}','${block.id}',1,'${tab}')">↓</button>` : ''}
          <button class="block-btn danger" onclick="interviewModule.removeBlock('${entry.id}','${block.id}','${tab}')">✕</button>
        </div>
      </div>
      <div class="code-block-editor-wrap">
        <textarea class="block-code-editor" id="ip-code-${block.id}" spellcheck="false" autocorrect="off">${ipEsc(inst.content)}</textarea>
        <div class="code-block-controls">
          <button class="block-run-btn" id="ip-run-${block.id}">▶ Run</button>
          <button class="block-reset-btn" onclick="interviewModule.clearBlockOutput('${block.id}')">✕ Clear</button>
          <span style="font-size:0.7rem;color:var(--text-3)">Ctrl+Enter</span>
        </div>
      </div>
      <div class="block-output-wrap hidden" id="ip-out-${block.id}">
        <div class="block-output-bar"><span>Output</span></div>
        <div class="block-output" id="ip-out-content-${block.id}">${inst.output||''}</div>
      </div>`;

    if (inst.output) wrap.querySelector(`#ip-out-${block.id}`)?.classList.remove('hidden');

    const textarea = wrap.querySelector(`#ip-code-${block.id}`);
    const runBtn   = wrap.querySelector(`#ip-run-${block.id}`);

    textarea.addEventListener('input', () => { inst.content = textarea.value; block.content = textarea.value; this.scheduleSave(); });
    textarea.addEventListener('keydown', e => {
      if (e.key === 'Tab') { e.preventDefault(); const s=textarea.selectionStart; textarea.value=textarea.value.slice(0,s)+'  '+textarea.value.slice(textarea.selectionEnd); textarea.selectionStart=textarea.selectionEnd=s+2; }
      if ((e.ctrlKey||e.metaKey) && e.key==='Enter') { e.preventDefault(); inst.run(); }
    });
    textarea.addEventListener('focus', () => { document.querySelectorAll('.ip-block').forEach(b=>b.classList.remove('ip-block-focused')); wrap.classList.add('ip-block-focused'); });
    runBtn.addEventListener('click', () => inst.run());
    return wrap;
  },

  onLangChange(instKey, blockId, lang, tab, entryId) {
    const inst = this.codeInstances[instKey];
    if (inst) inst.lang = lang;
    const entry = this.data[tab]?.find(e => e.id === entryId);
    const block = entry?.blocks?.find(b => b.id === blockId);
    if (block) block.lang = lang;
    this.scheduleSave();
  },

  clearBlockOutput(blockId) {
    document.getElementById(`ip-out-${blockId}`)?.classList.add('hidden');
    const outEl = document.getElementById(`ip-out-content-${blockId}`);
    if (outEl) outEl.innerHTML = '';
    // Clear in instance
    Object.values(this.codeInstances).forEach(inst => { if (inst.id === blockId) inst.output = ''; });
  },

  ipAddCodeBlock(entryId, tab) {
    const entry = this.data[tab]?.find(e => e.id === entryId);
    if (!entry) return;
    const block = { id: ipGenId(), type:'code', lang:'javascript', content:'// Write your code here\nconsole.log("Hello!");\n', output:'' };
    entry.blocks = entry.blocks || [];
    entry.blocks.push(block);
    this.scheduleSave();
    this._renderBlocks(entry, tab);
    setTimeout(() => { document.getElementById(`ip-code-${block.id}`)?.focus(); }, 50);
  },

  ipAddTextBlock(entryId, tab) {
    const entry = this.data[tab]?.find(e => e.id === entryId);
    if (!entry) return;
    const block = { id: ipGenId(), type:'text', content:'' };
    entry.blocks = entry.blocks || [];
    entry.blocks.push(block);
    this.scheduleSave();
    this._renderBlocks(entry, tab);
    setTimeout(() => { document.querySelector(`.ip-text-editor[data-block-id="${block.id}"]`)?.focus(); }, 50);
  },

  moveBlock(entryId, blockId, dir, tab) {
    const entry = this.data[tab]?.find(e => e.id === entryId);
    if (!entry) return;
    const idx = entry.blocks.findIndex(b => b.id === blockId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= entry.blocks.length) return;
    const [b] = entry.blocks.splice(idx, 1);
    entry.blocks.splice(newIdx, 0, b);
    this.scheduleSave();
    this._renderBlocks(entry, tab);
  },

  removeBlock(entryId, blockId, tab) {
    const entry = this.data[tab]?.find(e => e.id === entryId);
    if (!entry || entry.blocks.length <= 1) { showToast('Need at least one block'); return; }
    entry.blocks = entry.blocks.filter(b => b.id !== blockId);
    delete this.codeInstances[`${entryId}-${blockId}`];
    this.scheduleSave();
    this._renderBlocks(entry, tab);
  },

  saveEditorState(entryId, tab) {
    const entry = this.data[tab]?.find(e => e.id === entryId);
    if (!entry) return;
    // Sync text block content from DOM
    (entry.blocks||[]).forEach(block => {
      if (block.type === 'text') {
        const el = document.querySelector(`.ip-text-editor[data-block-id="${block.id}"]`);
        if (el) block.content = el.innerHTML;
      } else {
        const ta = document.getElementById(`ip-code-${block.id}`);
        if (ta) block.content = ta.value;
        const langEl = document.getElementById(`ip-lang-${block.id}`);
        if (langEl) block.lang = langEl.value;
        const instKey = `${entryId}-${block.id}`;
        if (this.codeInstances[instKey]) block.output = this.codeInstances[instKey].output || '';
      }
    });
    this.save();
    showToast('Saved ✦');
  },

  _refreshEntryList() {
    // Refresh just the list labels without re-rendering the editor
    document.querySelectorAll('.ip-entry-item').forEach(el => {
      const id = el.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
      if (!id) return;
      const entry = this.data[this.currentTab]?.find(e => e.id === id);
      if (entry) {
        const titleEl = el.querySelector('.ip-entry-title');
        if (titleEl) titleEl.textContent = entry.title;
      }
    });
  }
};
