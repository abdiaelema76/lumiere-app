// ============================================================
// LUMIÈRE — jobs.js
// Job Tracker — Kanban board with coloured status columns, CRUD
// ============================================================

const JOB_STATUSES = [
  { id:'wishlist',    label:'Wishlist',      color:'#c8b4e8', bg:'#ede5f8', icon:'⭐' },
  { id:'applied',     label:'Applied',       color:'#87b8e8', bg:'#daeaf8', icon:'📤' },
  { id:'interviewing',label:'Interviewing',  color:'#f5c842', bg:'#fdf3c8', icon:'💬' },
  { id:'offer',       label:'Offer',         color:'#6abf7b', bg:'#d4f0da', icon:'🎉' },
  { id:'rejected',    label:'Rejected',      color:'#e06c75', bg:'#fde0e2', icon:'❌' },
  { id:'ghosted',     label:'Ghosted',       color:'#b09890', bg:'#f0e8e2', icon:'👻' },
];

const jobsModule = {
  jobs: [],
  editingId: null,
  filterStatus: 'all',
  filterText: '',

  init() {
    this.jobs = JSON.parse(localStorage.getItem('lumiere_jobs') || '[]');
    this.setupEvents();
    this.render();
  },

  save() { localStorage.setItem('lumiere_jobs', JSON.stringify(this.jobs)); },

  setupEvents() {
    document.getElementById('addJobBtn')?.addEventListener('click', () => this.openModal());
    document.getElementById('saveJobBtn')?.addEventListener('click', () => this.saveJob());
    document.getElementById('cancelJobBtn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('jobModal')?.addEventListener('click', e => { if(e.target.id === 'jobModal') this.closeModal(); });
    document.getElementById('jobSearch')?.addEventListener('input', e => { this.filterText = e.target.value.toLowerCase(); this.render(); });
    document.querySelectorAll('#section-jobs .job-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#section-jobs .job-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterStatus = btn.dataset.status;
        this.render();
      });
    });
    // View toggle
    document.getElementById('jobViewKanban')?.addEventListener('click', () => this.setView('kanban'));
    document.getElementById('jobViewList')?.addEventListener('click', () => this.setView('list'));
  },

  setView(view) {
    document.getElementById('jobViewKanban').classList.toggle('active', view === 'kanban');
    document.getElementById('jobViewList').classList.toggle('active', view === 'list');
    document.getElementById('jobKanbanView').classList.toggle('hidden', view !== 'kanban');
    document.getElementById('jobListView').classList.toggle('hidden', view !== 'list');
  },

  render() {
    this.renderStats();
    this.renderKanban();
    this.renderList();
  },

  getFiltered() {
    let jobs = [...this.jobs];
    if (this.filterStatus !== 'all') jobs = jobs.filter(j => j.status === this.filterStatus);
    if (this.filterText) jobs = jobs.filter(j =>
      j.company.toLowerCase().includes(this.filterText) ||
      j.role.toLowerCase().includes(this.filterText) ||
      (j.notes||'').toLowerCase().includes(this.filterText)
    );
    return jobs.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  renderStats() {
    const stats = document.getElementById('jobStats');
    if (!stats) return;
    const total = this.jobs.length;
    const counts = {};
    JOB_STATUSES.forEach(s => counts[s.id] = this.jobs.filter(j => j.status === s.id).length);
    const responseRate = total > 0 ? Math.round(((counts.interviewing||0) + (counts.offer||0)) / total * 100) : 0;
    stats.innerHTML = JOB_STATUSES.map(s => `
      <div class="job-stat-pill" style="background:${s.bg};border-color:${s.color}20">
        <span style="font-size:1rem">${s.icon}</span>
        <span style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:${s.color};font-weight:500">${counts[s.id]||0}</span>
        <span style="font-size:0.72rem;color:var(--text-3)">${s.label}</span>
      </div>`).join('') +
      `<div class="job-stat-pill" style="background:var(--surface-2);border-color:var(--border)">
        <span style="font-size:1rem">📊</span>
        <span style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:var(--accent);font-weight:500">${responseRate}%</span>
        <span style="font-size:0.72rem;color:var(--text-3)">Response Rate</span>
      </div>`;
  },

  renderKanban() {
    const board = document.getElementById('jobKanbanBoard');
    if (!board) return;
    board.innerHTML = JOB_STATUSES.map(status => {
      const colJobs = this.jobs.filter(j => j.status === status.id);
      return `<div class="kanban-col">
        <div class="kanban-col-header" style="border-top:3px solid ${status.color}">
          <span class="kanban-col-icon">${status.icon}</span>
          <span class="kanban-col-title" style="color:${status.color}">${status.label}</span>
          <span class="kanban-col-count" style="background:${status.bg};color:${status.color}">${colJobs.length}</span>
        </div>
        <div class="kanban-col-body" id="kanban-col-${status.id}">
          ${colJobs.map(j => this.renderJobCard(j, status)).join('')}
          <button class="kanban-add-btn" onclick="jobsModule.openModal(null, '${status.id}')" style="color:${status.color}">+ Add Job</button>
        </div>
      </div>`;
    }).join('');
  },

  renderJobCard(job, status) {
    const s = status || JOB_STATUSES.find(s => s.id === job.status) || JOB_STATUSES[0];
    const date = job.appliedDate ? new Date(job.appliedDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '';
    return `<div class="job-card" draggable="true" data-id="${job.id}">
      <div class="job-card-header">
        <div>
          <div class="job-card-role">${job.role}</div>
          <div class="job-card-company">🏢 ${job.company}</div>
        </div>
        <div style="display:flex;gap:0.2rem;opacity:0;transition:opacity 0.2s" class="job-card-actions">
          <button onclick="jobsModule.openModal('${job.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.8rem;padding:0.2rem" title="Edit">✎</button>
          <button onclick="jobsModule.deleteJob('${job.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.85rem;padding:0.2rem" title="Delete">✕</button>
        </div>
      </div>
      <div class="job-card-footer">
        ${job.salary ? `<span style="font-size:0.72rem;color:var(--text-2)">💰 ${job.salary}</span>` : ''}
        ${job.location ? `<span style="font-size:0.72rem;color:var(--text-3)">📍 ${job.location}</span>` : ''}
        ${date ? `<span style="font-size:0.7rem;color:var(--text-3);margin-left:auto">${date}</span>` : ''}
      </div>
      ${job.notes ? `<div style="font-size:0.75rem;color:var(--text-3);margin-top:0.4rem;border-top:1px solid var(--border);padding-top:0.4rem">${job.notes.substring(0,60)}${job.notes.length>60?'…':''}</div>` : ''}
      <!-- Quick status change -->
      <select onchange="jobsModule.changeStatus('${job.id}', this.value)" style="width:100%;margin-top:0.5rem;font-size:0.72rem;border:1px solid ${s.color}40;background:${s.bg};color:${s.color};border-radius:6px;padding:0.2rem 0.4rem;cursor:pointer;font-family:'DM Sans',sans-serif">
        ${JOB_STATUSES.map(st => `<option value="${st.id}" ${st.id===job.status?'selected':''}>${st.icon} ${st.label}</option>`).join('')}
      </select>
    </div>`;
  },

  renderList() {
    const container = document.getElementById('jobListContainer');
    if (!container) return;
    const jobs = this.getFiltered();
    if (!jobs.length) { container.innerHTML='<p class="empty-hint">No jobs found. Start tracking! 💼</p>'; return; }
    container.innerHTML = `<table class="job-table">
      <thead><tr>
        <th>Role</th><th>Company</th><th>Status</th><th>Applied</th><th>Salary</th><th>Location</th><th></th>
      </tr></thead>
      <tbody>
        ${jobs.map(j => {
          const s = JOB_STATUSES.find(st=>st.id===j.status)||JOB_STATUSES[0];
          const date = j.appliedDate ? new Date(j.appliedDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';
          return `<tr class="job-table-row">
            <td style="font-weight:500;color:var(--text)">${j.role}</td>
            <td style="color:var(--text-2)">${j.company}</td>
            <td><span class="job-status-badge" style="background:${s.bg};color:${s.color};border:1px solid ${s.color}40">${s.icon} ${s.label}</span></td>
            <td style="color:var(--text-3);font-size:0.85rem">${date}</td>
            <td style="color:var(--text-3);font-size:0.85rem">${j.salary||'—'}</td>
            <td style="color:var(--text-3);font-size:0.85rem">${j.location||'—'}</td>
            <td style="white-space:nowrap">
              <button onclick="jobsModule.openModal('${j.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.85rem;padding:0.2rem 0.4rem" title="Edit">✎</button>
              <button onclick="jobsModule.deleteJob('${j.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.9rem;padding:0.2rem 0.4rem" title="Delete">✕</button>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  },

  changeStatus(jobId, newStatus) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return;
    job.status = newStatus;
    job.updatedAt = new Date().toISOString();
    this.save();
    this.render();
    const s = JOB_STATUSES.find(s => s.id === newStatus);
    showToast(`Moved to ${s?.label||newStatus} ${s?.icon||'✦'}`);
  },

  openModal(jobId = null, defaultStatus = 'wishlist') {
    this.editingId = jobId;
    const job = jobId ? this.jobs.find(j => j.id === jobId) : null;
    document.getElementById('jobModalTitle').textContent = job ? 'Edit Job ✎' : 'Add Job ✦';
    document.getElementById('jobRoleInput').value = job ? job.role : '';
    document.getElementById('jobCompanyInput').value = job ? job.company : '';
    document.getElementById('jobStatusSelect').value = job ? job.status : defaultStatus;
    document.getElementById('jobLocationInput').value = job ? (job.location||'') : '';
    document.getElementById('jobSalaryInput').value = job ? (job.salary||'') : '';
    document.getElementById('jobUrlInput').value = job ? (job.url||'') : '';
    document.getElementById('jobDateInput').value = job ? (job.appliedDate||'') : new Date().toISOString().split('T')[0];
    document.getElementById('jobNotesInput').value = job ? (job.notes||'') : '';
    document.getElementById('jobModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('jobRoleInput')?.focus(), 80);
  },

  closeModal() { document.getElementById('jobModal').classList.add('hidden'); this.editingId = null; },

  saveJob() {
    const role = document.getElementById('jobRoleInput').value.trim();
    const company = document.getElementById('jobCompanyInput').value.trim();
    if (!role || !company) { showToast('Enter role and company name'); return; }
    const jobData = {
      id: this.editingId || Date.now().toString(),
      role, company,
      status: document.getElementById('jobStatusSelect').value,
      location: document.getElementById('jobLocationInput').value.trim(),
      salary: document.getElementById('jobSalaryInput').value.trim(),
      url: document.getElementById('jobUrlInput').value.trim(),
      appliedDate: document.getElementById('jobDateInput').value,
      notes: document.getElementById('jobNotesInput').value.trim(),
      updatedAt: new Date().toISOString(),
      createdAt: this.editingId ? (this.jobs.find(j=>j.id===this.editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };
    if (this.editingId) {
      const idx = this.jobs.findIndex(j => j.id === this.editingId);
      if (idx >= 0) this.jobs[idx] = jobData;
    } else {
      this.jobs.push(jobData);
    }
    this.save(); this.closeModal(); this.render();
    showToast(this.editingId ? 'Job updated ✦' : 'Job added ✦');
  },

  deleteJob(id) {
    if (!confirm('Delete this job application?')) return;
    this.jobs = this.jobs.filter(j => j.id !== id);
    this.save(); this.render();
    showToast('Job removed');
  }
};
