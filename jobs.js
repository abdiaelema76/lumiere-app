// ============================================================
// LUMIÈRE — jobs.js  v2
// Dashboard summary → drill-down model. Clean, not cluttered.
// ============================================================

const JOB_STATUSES = [
  { id:'wishlist',     label:'Wishlist',     color:'#c8b4e8', bg:'#ede5f8', icon:'⭐', desc:'Jobs you want to apply to' },
  { id:'applied',      label:'Applied',      color:'#87b8e8', bg:'#daeaf8', icon:'📤', desc:'Applications sent' },
  { id:'interviewing', label:'Interviewing', color:'#f5c842', bg:'#fdf3c8', icon:'💬', desc:'Active interview process' },
  { id:'offer',        label:'Offer',        color:'#6abf7b', bg:'#d4f0da', icon:'🎉', desc:'Offers received' },
  { id:'rejected',     label:'Rejected',     color:'#e06c75', bg:'#fde0e2', icon:'❌', desc:'Rejections' },
  { id:'ghosted',      label:'Ghosted',      color:'#b09890', bg:'#f0e8e2', icon:'👻', desc:'No response received' },
];

const jobsModule = {
  jobs: [],
  editingId: null,
  drillStatus: null,     // which status is currently drilled into (null = summary view)
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
    document.getElementById('jobModal')?.addEventListener('click', e => {
      if (e.target.id === 'jobModal') this.closeModal();
    });
    document.getElementById('jobSearch')?.addEventListener('input', e => {
      this.filterText = e.target.value.toLowerCase();
      if (this.drillStatus) this.renderDrillDown(this.drillStatus);
      else this.renderSummary();
    });
    document.getElementById('jobDrillBack')?.addEventListener('click', () => this.exitDrillDown());
    document.getElementById('jobModal')?.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeModal();
    });
  },

  // ── RENDER: top-level summary ──────────────────────────────
  render() {
    this.drillStatus = null;
    this.renderSummary();
    this.renderPipelineBar();
  },

  renderSummary() {
    const summaryView = document.getElementById('jobSummaryView');
    const drillView   = document.getElementById('jobDrillView');
    if (summaryView) summaryView.classList.remove('hidden');
    if (drillView)   drillView.classList.add('hidden');

    const grid = document.getElementById('jobStatusGrid');
    if (!grid) return;

    const lq = this.filterText;
    const filtered = lq ? this.jobs.filter(j =>
      j.company.toLowerCase().includes(lq) || j.role.toLowerCase().includes(lq)
    ) : this.jobs;

    grid.innerHTML = JOB_STATUSES.map(s => {
      const count = filtered.filter(j => j.status === s.id).length;
      const recent = filtered.filter(j => j.status === s.id)
        .sort((a,b) => new Date(b.updatedAt||b.createdAt) - new Date(a.updatedAt||a.createdAt))
        .slice(0,3);
      return `<div class="job-status-tile" onclick="jobsModule.drillDown('${s.id}')" style="--sc:${s.color};--sbg:${s.bg}">
        <div class="jst-header">
          <div class="jst-icon">${s.icon}</div>
          <div>
            <div class="jst-label" style="color:${s.color}">${s.label}</div>
            <div class="jst-desc">${s.desc}</div>
          </div>
          <div class="jst-count" style="background:${s.bg};color:${s.color}">${count}</div>
        </div>
        ${recent.length ? `<div class="jst-preview">
          ${recent.map(j=>`<div class="jst-row">
            <span class="jst-role">${j.role}</span>
            <span class="jst-company">@ ${j.company}</span>
            ${j.appliedDate?`<span class="jst-date">${new Date(j.appliedDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>`:''}
          </div>`).join('')}
          ${filtered.filter(j=>j.status===s.id).length > 3 ? `<div style="font-size:0.72rem;color:${s.color};padding:0.2rem 0">+${filtered.filter(j=>j.status===s.id).length-3} more → click to see all</div>` : ''}
        </div>` : `<div style="font-size:0.78rem;color:var(--text-3);padding:0.5rem 0 0.2rem">No jobs here yet</div>`}
      </div>`;
    }).join('');
  },

  renderPipelineBar() {
    const bar = document.getElementById('jobPipelineBar');
    if (!bar) return;
    const total = this.jobs.length;
    if (!total) { bar.innerHTML='<p class="empty-hint" style="padding:0.5rem">No jobs tracked yet. Add your first application!</p>'; return; }
    const activeStatuses = ['applied','interviewing','offer'];
    const active = this.jobs.filter(j=>activeStatuses.includes(j.status)).length;
    const responseRate = total>0?Math.round((this.jobs.filter(j=>['interviewing','offer'].includes(j.status)).length/Math.max(1,this.jobs.filter(j=>j.status!=='wishlist').length))*100):0;
    bar.innerHTML = `
      <div class="pipeline-stats">
        <div class="pipeline-stat"><span class="ps-num">${total}</span><span class="ps-label">Total</span></div>
        <div class="pipeline-stat"><span class="ps-num">${active}</span><span class="ps-label">Active</span></div>
        <div class="pipeline-stat"><span class="ps-num" style="color:var(--sage)">${responseRate}%</span><span class="ps-label">Response Rate</span></div>
        <div class="pipeline-stat"><span class="ps-num" style="color:#6abf7b">${this.jobs.filter(j=>j.status==='offer').length}</span><span class="ps-label">Offers</span></div>
      </div>
      <div class="pipeline-track">
        ${JOB_STATUSES.map(s=>{
          const cnt=this.jobs.filter(j=>j.status===s.id).length;
          const w=total>0?Math.max(4,Math.round(cnt/total*100)):0;
          return cnt>0?`<div class="pt-seg" style="width:${w}%;background:${s.color}" title="${s.label}: ${cnt}"></div>`:'';
        }).join('')}
      </div>`;
  },

  // ── DRILL DOWN: show jobs for one status ──────────────────
  drillDown(statusId) {
    this.drillStatus = statusId;
    const summaryView = document.getElementById('jobSummaryView');
    const drillView   = document.getElementById('jobDrillView');
    if (summaryView) summaryView.classList.add('hidden');
    if (drillView)   drillView.classList.remove('hidden');
    this.renderDrillDown(statusId);
  },

  exitDrillDown() {
    this.drillStatus = null;
    this.render();
  },

  renderDrillDown(statusId) {
    const s = JOB_STATUSES.find(st=>st.id===statusId);
    if (!s) return;

    const titleEl = document.getElementById('jobDrillTitle');
    if (titleEl) titleEl.innerHTML = `<span style="font-size:1.3rem">${s.icon}</span> ${s.label} <span class="kanban-col-count" style="background:${s.bg};color:${s.color}">${this.jobs.filter(j=>j.status===statusId).length}</span>`;

    const lq = this.filterText;
    let jobs = this.jobs.filter(j => j.status === statusId);
    if (lq) jobs = jobs.filter(j => j.company.toLowerCase().includes(lq) || j.role.toLowerCase().includes(lq) || (j.notes||'').toLowerCase().includes(lq));
    jobs.sort((a,b) => new Date(b.updatedAt||b.createdAt) - new Date(a.updatedAt||a.createdAt));

    const container = document.getElementById('jobDrillList');
    if (!container) return;

    if (!jobs.length) {
      container.innerHTML = `<p class="empty-hint">No ${s.label.toLowerCase()} jobs yet.<br><button class="btn-soft" style="margin-top:0.8rem" onclick="jobsModule.openModal(null,'${statusId}')">+ Add one</button></p>`;
      return;
    }

    container.innerHTML = `
      <table class="job-table">
        <thead><tr>
          <th>Role</th><th>Company</th><th>Date</th><th>Location</th><th>Salary</th><th>Notes</th><th></th>
        </tr></thead>
        <tbody>
          ${jobs.map(j => {
            const date = j.appliedDate ? new Date(j.appliedDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';
            return `<tr class="job-table-row">
              <td style="font-weight:600;color:var(--text)">${j.role}</td>
              <td style="color:var(--text-2)">${j.company}</td>
              <td style="color:var(--text-3);font-size:0.82rem;white-space:nowrap">${date}</td>
              <td style="color:var(--text-3);font-size:0.82rem">${j.location||'—'}</td>
              <td style="color:var(--text-3);font-size:0.82rem">${j.salary||'—'}</td>
              <td style="color:var(--text-3);font-size:0.8rem;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${j.notes||'—'}</td>
              <td style="white-space:nowrap">
                <button onclick="jobsModule.openModal('${j.id}')" class="job-row-btn" title="Edit">✎</button>
                <button onclick="jobsModule.changeStatus('${j.id}')" class="job-row-btn" title="Change status">⇄</button>
                <button onclick="jobsModule.deleteJob('${j.id}')" class="job-row-btn danger" title="Delete">✕</button>
                ${j.url?`<a href="${j.url}" target="_blank" class="job-row-btn" title="Open job link" style="text-decoration:none">↗</a>`:''}
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      <div style="margin-top:0.8rem">
        <button class="btn-soft" onclick="jobsModule.openModal(null,'${statusId}')">+ Add to ${s.label}</button>
      </div>`;
  },

  // ── CRUD ─────────────────────────────────────────────────
  changeStatus(jobId) {
    const job = this.jobs.find(j=>j.id===jobId);
    if (!job) return;
    // Quick status change modal — reuse the job modal with status focused
    this.openModal(jobId);
  },

  openModal(jobId=null, defaultStatus='wishlist') {
    this.editingId = jobId;
    const job = jobId ? this.jobs.find(j=>j.id===jobId) : null;
    document.getElementById('jobModalTitle').textContent = job ? 'Edit Job ✎' : 'Add Job ✦';
    document.getElementById('jobRoleInput').value = job ? job.role : '';
    document.getElementById('jobCompanyInput').value = job ? job.company : '';
    document.getElementById('jobStatusSelect').value = job ? job.status : (this.drillStatus||defaultStatus);
    document.getElementById('jobLocationInput').value = job ? (job.location||'') : '';
    document.getElementById('jobSalaryInput').value = job ? (job.salary||'') : '';
    document.getElementById('jobUrlInput').value = job ? (job.url||'') : '';
    document.getElementById('jobDateInput').value = job ? (job.appliedDate||'') : new Date().toISOString().split('T')[0];
    document.getElementById('jobNotesInput').value = job ? (job.notes||'') : '';
    document.getElementById('jobModal').classList.remove('hidden');
    setTimeout(()=>document.getElementById('jobRoleInput')?.focus(), 80);
  },

  closeModal() {
    document.getElementById('jobModal').classList.add('hidden');
    this.editingId = null;
  },

  saveJob() {
    const role    = document.getElementById('jobRoleInput').value.trim();
    const company = document.getElementById('jobCompanyInput').value.trim();
    if (!role || !company) { showToast('Enter role and company name'); return; }
    const status = document.getElementById('jobStatusSelect').value;
    const data = {
      id: this.editingId || Date.now().toString(),
      role, company, status,
      location:    document.getElementById('jobLocationInput').value.trim(),
      salary:      document.getElementById('jobSalaryInput').value.trim(),
      url:         document.getElementById('jobUrlInput').value.trim(),
      appliedDate: document.getElementById('jobDateInput').value,
      notes:       document.getElementById('jobNotesInput').value.trim(),
      updatedAt:   new Date().toISOString(),
      createdAt:   this.editingId ? (this.jobs.find(j=>j.id===this.editingId)?.createdAt||new Date().toISOString()) : new Date().toISOString()
    };
    if (this.editingId) {
      const idx = this.jobs.findIndex(j=>j.id===this.editingId);
      if (idx>=0) this.jobs[idx]=data;
    } else {
      this.jobs.push(data);
    }
    this.save(); this.closeModal();
    // Return to the status we just saved to
    this.drillDown(status);
    showToast(this.editingId?'Job updated ✦':'Job added ✦');
  },

  deleteJob(id) {
    if (!confirm('Delete this job application?')) return;
    this.jobs = this.jobs.filter(j=>j.id!==id);
    this.save();
    if (this.drillStatus) this.renderDrillDown(this.drillStatus);
    else this.render();
    showToast('Job removed');
  }
};
