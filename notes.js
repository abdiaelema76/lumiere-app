// ============================================================
// LUMIÈRE — notes.js
// ============================================================

const notesModule = {
  notes: [],
  currentNoteId: null,
  activeFilter: 'all',
  autoSaveTimer: null,

  init() {
    this.notes = JSON.parse(localStorage.getItem('lumiere_notes') || '[]');
    this.renderNotesList();
    this.setupEvents();
  },

  setupEvents() {
    document.getElementById('newNoteBtn').addEventListener('click', () => this.createNewNote());
    document.getElementById('noteSaveBtn').addEventListener('click', () => this.saveCurrentNote());
    document.getElementById('noteDeleteBtn').addEventListener('click', () => this.deleteCurrentNote());
    document.getElementById('notePinBtn').addEventListener('click', () => this.togglePin());
    document.getElementById('noteTypeSelect').addEventListener('change', e => {
      this.switchEditorMode(e.target.value === 'coding');
    });
    document.getElementById('notesSearch').addEventListener('input', e => this.searchNotes(e.target.value));
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter;
        this.renderNotesList();
      });
    });
    // Auto-save on typing
    document.getElementById('richEditor').addEventListener('input', () => this.scheduleAutoSave());
    document.getElementById('codeEditor').addEventListener('input', () => this.scheduleAutoSave());
    document.getElementById('noteTitleInput').addEventListener('input', () => this.scheduleAutoSave());
  },

  scheduleAutoSave() {
    clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => this.saveCurrentNote(true), 1200);
  },

  createNewNote() {
    const note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      type: 'personal',
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.notes.unshift(note);
    this.saveNotes();
    this.renderNotesList();
    this.openNote(note.id);
  },

  openNote(id) {
    this.currentNoteId = id;
    const note = this.notes.find(n => n.id === id);
    if (!note) return;
    document.getElementById('noteEditorEmpty').classList.add('hidden');
    document.getElementById('noteEditorForm').classList.remove('hidden');
    document.getElementById('noteTitleInput').value = note.title;
    document.getElementById('noteTypeSelect').value = note.type;
    document.getElementById('notePinBtn').classList.toggle('pinned', note.pinned);
    const isCoding = note.type === 'coding';
    this.switchEditorMode(isCoding);
    if (isCoding) {
      document.getElementById('codeEditor').value = note.content || '';
    } else {
      document.getElementById('richEditor').innerHTML = note.content || '';
    }
    document.querySelectorAll('.note-card').forEach(c => c.classList.remove('active'));
    const card = document.querySelector(`.note-card[data-id="${id}"]`);
    if (card) card.classList.add('active');
  },

  switchEditorMode(isCoding) {
    document.getElementById('richEditorWrap').classList.toggle('hidden', isCoding);
    document.getElementById('codeEditorWrap').classList.toggle('hidden', !isCoding);
  },

  saveCurrentNote(silent = false) {
    if (!this.currentNoteId) return;
    const note = this.notes.find(n => n.id === this.currentNoteId);
    if (!note) return;
    note.title = document.getElementById('noteTitleInput').value || 'Untitled Note';
    note.type = document.getElementById('noteTypeSelect').value;
    const isCoding = note.type === 'coding';
    note.content = isCoding ? document.getElementById('codeEditor').value : document.getElementById('richEditor').innerHTML;
    note.updatedAt = new Date().toISOString();
    this.saveNotes();
    this.renderNotesList();
    document.querySelector(`.note-card[data-id="${this.currentNoteId}"]`)?.classList.add('active');
    if (!silent) showToast('Note saved ✦');
  },

  deleteCurrentNote() {
    if (!this.currentNoteId) return;
    if (!confirm('Delete this note?')) return;
    this.notes = this.notes.filter(n => n.id !== this.currentNoteId);
    this.saveNotes();
    this.currentNoteId = null;
    document.getElementById('noteEditorEmpty').classList.remove('hidden');
    document.getElementById('noteEditorForm').classList.add('hidden');
    this.renderNotesList();
    showToast('Note deleted');
  },

  togglePin() {
    if (!this.currentNoteId) return;
    const note = this.notes.find(n => n.id === this.currentNoteId);
    if (!note) return;
    note.pinned = !note.pinned;
    document.getElementById('notePinBtn').classList.toggle('pinned', note.pinned);
    this.saveNotes();
    this.renderNotesList();
    document.querySelector(`.note-card[data-id="${this.currentNoteId}"]`)?.classList.add('active');
    showToast(note.pinned ? 'Note pinned 📌' : 'Note unpinned');
  },

  searchNotes(q) {
    this.renderNotesList(q);
  },

  getFilteredNotes(q = '') {
    let filtered = [...this.notes];
    if (this.activeFilter === 'pinned') filtered = filtered.filter(n => n.pinned);
    else if (this.activeFilter !== 'all') filtered = filtered.filter(n => n.type === this.activeFilter);
    if (q.trim()) {
      const lq = q.toLowerCase();
      filtered = filtered.filter(n => n.title.toLowerCase().includes(lq) || (n.content||'').toLowerCase().includes(lq));
    }
    return filtered.sort((a,b) => (b.pinned - a.pinned) || (new Date(b.updatedAt) - new Date(a.updatedAt)));
  },

  renderNotesList(q = '') {
    const list = document.getElementById('notesList');
    const notes = this.getFilteredNotes(q);
    if (!notes.length) {
      list.innerHTML = '<p class="empty-hint">No notes found 🌿</p>';
      return;
    }
    list.innerHTML = notes.map(n => {
      const date = new Date(n.updatedAt).toLocaleDateString('en-US', { month:'short', day:'numeric' });
      const preview = n.type === 'coding'
        ? (n.content || '').substring(0, 60)
        : (n.content || '').replace(/<[^>]+>/g,'').substring(0, 60);
      return `<div class="note-card${n.id === this.currentNoteId ? ' active':''}" data-id="${n.id}" onclick="notesModule.openNote('${n.id}')">
        <div class="note-card-title">${n.title}</div>
        <div style="font-size:0.77rem;color:var(--text-3);margin-bottom:0.3rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${preview || 'Empty note…'}</div>
        <div class="note-card-meta">
          <span class="note-tag${n.pinned?' pinned':''}">${n.pinned?'📌 ':''}${n.type}</span>
          <span class="note-card-date">${date}</span>
        </div>
      </div>`;
    }).join('');
  },

  saveNotes() {
    localStorage.setItem('lumiere_notes', JSON.stringify(this.notes));
  }
};
