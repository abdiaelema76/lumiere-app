// ============================================================
// LUMIÈRE — budget.js  v5
// Per-month data model, custom categories, fixed month nav
// ============================================================

const CURRENCIES = [
  { code:'KSH', symbol:'KSh', name:'Kenyan Shilling' },
  { code:'USD', symbol:'$',   name:'US Dollar' },
  { code:'EUR', symbol:'€',   name:'Euro' },
  { code:'GBP', symbol:'£',   name:'British Pound' },
  { code:'NGN', symbol:'₦',   name:'Nigerian Naira' },
  { code:'ZAR', symbol:'R',   name:'South African Rand' },
  { code:'GHS', symbol:'₵',   name:'Ghanaian Cedi' },
  { code:'TZS', symbol:'TSh', name:'Tanzanian Shilling' },
  { code:'UGX', symbol:'USh', name:'Ugandan Shilling' },
  { code:'INR', symbol:'₹',   name:'Indian Rupee' },
  { code:'CAD', symbol:'CA$', name:'Canadian Dollar' },
  { code:'AUD', symbol:'A$',  name:'Australian Dollar' },
  { code:'JPY', symbol:'¥',   name:'Japanese Yen' },
  { code:'AED', symbol:'د.إ', name:'UAE Dirham' },
];

const DEFAULT_CATS = ['food','transport','housing','health','shopping','entertainment','education','other'];
const CAT_COLORS   = ['#f2b8c0','#c8b4e8','#b8d4f0','#b8e8c8','#f8dca0','#f0c0a8','#c8e0e0','#d8d0e8','#e0c8d8','#c8d8e8','#d8e8c8','#e8d8c8'];
const CAT_EMOJI    = { food:'🍽',transport:'🚌',housing:'🏠',health:'💊',shopping:'🛍',entertainment:'🎬',education:'📚',other:'✦' };

const budgetModule = {
  // Data shape:
  // transactions: stored globally, filtered by month
  // budgets: { 'YYYY-MM': { category: limit } }
  // customCats: ['mycatname', ...]
  transactions: [],
  budgetsByMonth: {},    // per-month budget limits
  customCats: [],
  currentMonth: new Date().toISOString().slice(0,7),
  editingTxId: null,
  currency: null,

  // ── INIT ──────────────────────────────────────────────────
  init() {
    this.load();
    this.setupCurrencySelector();
    this.setupEvents();
    this.populateCategoryDropdowns();
    this.render();
  },

  load() {
    this.transactions = JSON.parse(localStorage.getItem('lumiere_transactions') || '[]');
    // Migrate old flat budgets array → per-month map
    const oldBudgets = JSON.parse(localStorage.getItem('lumiere_budgets') || '[]');
    const newBudgets = JSON.parse(localStorage.getItem('lumiere_budgets_v2') || '{}');
    if (oldBudgets.length && !Object.keys(newBudgets).length) {
      // Migrate: assign old limits to current month
      const map = {};
      oldBudgets.forEach(b => { map[b.category] = b.limit; });
      newBudgets[this.currentMonth] = map;
    }
    this.budgetsByMonth = newBudgets;
    this.customCats = JSON.parse(localStorage.getItem('lumiere_custom_cats') || '[]');
    const saved = localStorage.getItem('lumiere_currency') || 'KSH';
    this.currency = CURRENCIES.find(c => c.code === saved) || CURRENCIES[0];
  },

  save() {
    localStorage.setItem('lumiere_transactions', JSON.stringify(this.transactions));
    localStorage.setItem('lumiere_budgets_v2', JSON.stringify(this.budgetsByMonth));
    localStorage.setItem('lumiere_custom_cats', JSON.stringify(this.customCats));
  },

  allCats() {
    return [...DEFAULT_CATS, ...this.customCats];
  },

  catColor(cat) {
    const all = this.allCats();
    return CAT_COLORS[all.indexOf(cat) % CAT_COLORS.length] || '#d8d0e8';
  },

  catEmoji(cat) {
    return CAT_EMOJI[cat] || '✦';
  },

  fmt(n) {
    const abs = Math.abs(n);
    const formatted = abs.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
    return this.currency.symbol + formatted;
  },

  // ── CURRENCY ──────────────────────────────────────────────
  setupCurrencySelector() {
    const sel = document.getElementById('budgetCurrencySelect');
    if (!sel) return;
    sel.innerHTML = CURRENCIES.map(c =>
      `<option value="${c.code}" ${c.code===this.currency.code?'selected':''}>${c.code} — ${c.name}</option>`
    ).join('');
    sel.addEventListener('change', e => {
      this.currency = CURRENCIES.find(c=>c.code===e.target.value)||CURRENCIES[0];
      localStorage.setItem('lumiere_currency', this.currency.code);
      const lbl = document.getElementById('budgetCurrencyLabel');
      if (lbl) lbl.textContent = this.currency.symbol;
      this.render();
      showToast(`Currency: ${this.currency.code} (${this.currency.symbol}) ✦`);
    });
    const lbl = document.getElementById('budgetCurrencyLabel');
    if (lbl) lbl.textContent = this.currency.symbol;
  },

  // ── CATEGORY MANAGEMENT ───────────────────────────────────
  populateCategoryDropdowns() {
    const cats = this.allCats();
    const opts = cats.map(c => `<option value="${c}">${this.catEmoji(c)} ${c.charAt(0).toUpperCase()+c.slice(1)}</option>`).join('');
    // Update all category selects
    ['txCategory','budgetCategorySelect'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const current = el.value;
      el.innerHTML = opts;
      if (cats.includes(current)) el.value = current;
    });
    this.renderCustomCatList();
  },

  addCustomCategory() {
    const input = document.getElementById('newCatInput');
    if (!input) return;
    const name = input.value.trim().toLowerCase().replace(/\s+/g,'-');
    if (!name) { showToast('Enter a category name'); return; }
    if (this.allCats().includes(name)) { showToast('Category already exists'); return; }
    this.customCats.push(name);
    this.save();
    input.value = '';
    this.populateCategoryDropdowns();
    showToast(`Category "${name}" added ✦`);
  },

  deleteCustomCategory(name) {
    this.customCats = this.customCats.filter(c => c !== name);
    this.save();
    this.populateCategoryDropdowns();
    showToast('Category removed');
  },

  renderCustomCatList() {
    const container = document.getElementById('customCatList');
    if (!container) return;
    if (!this.customCats.length) {
      container.innerHTML = '<p style="font-size:0.78rem;color:var(--text-3)">No custom categories yet.</p>';
      return;
    }
    container.innerHTML = this.customCats.map(c => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:0.3rem 0;border-bottom:1px solid var(--border)">
        <span style="font-size:0.85rem;color:var(--text);text-transform:capitalize">${c}</span>
        <button onclick="budgetModule.deleteCustomCategory('${c}')" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.85rem" title="Delete">✕</button>
      </div>`).join('');
  },

  // ── EVENTS ────────────────────────────────────────────────
  setupEvents() {
    document.getElementById('addTransactionBtn')?.addEventListener('click', () => this.openTxModal());
    document.getElementById('saveTxBtn')?.addEventListener('click', () => this.saveTransaction());
    document.getElementById('cancelTxBtn')?.addEventListener('click', () => this.closeTxModal());
    document.getElementById('txModal')?.addEventListener('click', e => { if(e.target.id==='txModal') this.closeTxModal(); });
    document.getElementById('saveBudgetBtn')?.addEventListener('click', () => this.saveBudgetLimit());
    document.getElementById('budgetPrevMonth')?.addEventListener('click', () => this.changeMonth(-1));
    document.getElementById('budgetNextMonth')?.addEventListener('click', () => this.changeMonth(1));
    document.getElementById('addCustomCatBtn')?.addEventListener('click', () => this.addCustomCategory());
    document.getElementById('newCatInput')?.addEventListener('keydown', e => { if(e.key==='Enter') this.addCustomCategory(); });
    document.querySelectorAll('#section-budget .budget-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
    document.getElementById('txType')?.addEventListener('change', e => {
      e.target.style.color = e.target.value==='income'?'#6abf7b':'#e06c75';
    });
    // Month picker input
    document.getElementById('budgetMonthPicker')?.addEventListener('change', e => {
      if (e.target.value) { this.currentMonth = e.target.value; this.render(); }
    });
  },

  switchTab(tab) {
    document.querySelectorAll('#section-budget .budget-tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelector(`#section-budget .budget-tab-btn[data-tab="${tab}"]`)?.classList.add('active');
    ['overview','transactions','plan','categories'].forEach(t => {
      document.getElementById('budget'+t.charAt(0).toUpperCase()+t.slice(1)+'Tab')?.classList.toggle('hidden', t!==tab);
    });
    if (tab==='categories') this.renderCustomCatList();
  },

  changeMonth(dir) {
    const [y,m] = this.currentMonth.split('-').map(Number);
    const d = new Date(y, m-1+dir, 1);
    this.currentMonth = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    // Sync month picker
    const picker = document.getElementById('budgetMonthPicker');
    if (picker) picker.value = this.currentMonth;
    this.render();
  },

  // ── TRANSACTIONS ──────────────────────────────────────────
  openTxModal(tx=null) {
    this.editingTxId = tx ? tx.id : null;
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('txTitleInput').value = tx ? tx.title : '';
    document.getElementById('txAmount').value = tx ? tx.amount : '';
    const typeEl = document.getElementById('txType');
    typeEl.value = tx ? tx.type : 'expense';
    typeEl.style.color = (tx?.type==='income')?'#6abf7b':'#e06c75';
    // Ensure category select is populated
    this.populateCategoryDropdowns();
    document.getElementById('txCategory').value = (tx && this.allCats().includes(tx.category)) ? tx.category : 'food';
    document.getElementById('txDate').value = tx ? tx.date : today;
    document.getElementById('txNote').value = tx ? (tx.note||'') : '';
    document.querySelectorAll('.tx-currency-symbol').forEach(el => el.textContent = this.currency.symbol);
    document.getElementById('txModal').classList.remove('hidden');
    setTimeout(()=>document.getElementById('txTitleInput')?.focus(),80);
  },

  closeTxModal() {
    document.getElementById('txModal').classList.add('hidden');
    this.editingTxId = null;
  },

  saveTransaction() {
    const title = document.getElementById('txTitleInput').value.trim();
    const amount = parseFloat(document.getElementById('txAmount').value);
    if (!title) { showToast('Enter a description'); return; }
    if (isNaN(amount)||amount<=0) { showToast('Enter a valid amount'); return; }
    const tx = {
      id: this.editingTxId || Date.now().toString(),
      title, amount,
      type: document.getElementById('txType').value,
      category: document.getElementById('txCategory').value,
      date: document.getElementById('txDate').value,
      note: document.getElementById('txNote').value.trim()
    };
    if (this.editingTxId) {
      const idx = this.transactions.findIndex(t=>t.id===this.editingTxId);
      if (idx>=0) this.transactions[idx]=tx;
    } else {
      this.transactions.unshift(tx);
    }
    this.save(); this.closeTxModal(); this.render();
    showToast(this.editingTxId?'Transaction updated ✦':'Transaction added ✦');
  },

  deleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return;
    this.transactions = this.transactions.filter(t=>t.id!==id);
    this.save(); this.render();
    showToast('Transaction removed');
  },

  // ── BUDGET LIMITS (per month) ─────────────────────────────
  getMonthBudgets() {
    return this.budgetsByMonth[this.currentMonth] || {};
  },

  saveBudgetLimit() {
    const category = document.getElementById('budgetCategorySelect').value;
    const limit = parseFloat(document.getElementById('budgetLimitInput').value);
    if (isNaN(limit)||limit<=0) { showToast('Enter a valid budget amount'); return; }
    if (!this.budgetsByMonth[this.currentMonth]) this.budgetsByMonth[this.currentMonth] = {};
    this.budgetsByMonth[this.currentMonth][category] = limit;
    this.save(); this.renderPlan();
    showToast(`Budget set for ${category} in ${this.currentMonth} ✦`);
  },

  getMonthTx() {
    return this.transactions.filter(t=>t.date.startsWith(this.currentMonth));
  },

  // ── RENDER ────────────────────────────────────────────────
  render() {
    this.updateMonthLabel();
    this.renderOverview();
    this.renderTransactionList();
    this.renderPlan();
  },

  updateMonthLabel() {
    const [y,m] = this.currentMonth.split('-').map(Number);
    const label = new Date(y,m-1,1).toLocaleDateString('en-US',{month:'long',year:'numeric'});
    const el = document.getElementById('budgetMonthLabel');
    if (el) el.textContent = label;
    const picker = document.getElementById('budgetMonthPicker');
    if (picker && !picker.value) picker.value = this.currentMonth;
  },

  renderOverview() {
    const txs = this.getMonthTx();
    const income  = txs.filter(t=>t.type==='income').reduce((a,b)=>a+b.amount,0);
    const expenses= txs.filter(t=>t.type==='expense').reduce((a,b)=>a+b.amount,0);
    const balance = income - expenses;

    const set = (id,val) => { const el=document.getElementById(id); if(el) el.textContent=val; };
    set('budgetIncome',   this.fmt(income));
    set('budgetExpenses', this.fmt(expenses));
    set('budgetBalance',  (balance<0?'-':'')+this.fmt(Math.abs(balance)));
    const balEl = document.getElementById('budgetBalance');
    if (balEl) balEl.style.color = balance>=0?'var(--sage)':'#e06c75';

    const savingsRate = income>0?Math.round((balance/income)*100):0;
    const srEl = document.getElementById('savingsRate');
    if (srEl) { srEl.textContent=Math.max(0,savingsRate)+'%'; srEl.style.color=savingsRate>=20?'var(--sage)':savingsRate>=0?'var(--gold)':'#e06c75'; }

    const catTotals = {};
    txs.filter(t=>t.type==='expense').forEach(t=>{ catTotals[t.category]=(catTotals[t.category]||0)+t.amount; });
    const container = document.getElementById('budgetCategoryBreakdown');
    if (!container) return;
    const totalExp = Object.values(catTotals).reduce((a,b)=>a+b,0);
    if (!totalExp) { container.innerHTML='<p class="empty-hint">No expenses this month.</p>'; return; }
    const budgets = this.getMonthBudgets();
    container.innerHTML = this.allCats().filter(c=>catTotals[c]).map(cat=>{
      const pct = totalExp>0?Math.round(catTotals[cat]/totalExp*100):0;
      const limit = budgets[cat];
      const over = limit && catTotals[cat]>limit;
      const color = this.catColor(cat);
      return `<div class="budget-cat-row">
        <div class="budget-cat-dot" style="background:${color}"></div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem">
            <span style="font-size:0.85rem;text-transform:capitalize;color:var(--text)">${cat}</span>
            <span style="font-size:0.85rem;font-weight:500;color:${over?'#e06c75':'var(--text)'}">
              ${this.fmt(catTotals[cat])}${limit?` / ${this.fmt(limit)}`:''}
              ${over?'<span style="font-size:0.7rem;color:#e06c75"> ⚠ Over</span>':''}
            </span>
          </div>
          <div class="budget-cat-bar-wrap"><div class="budget-cat-bar" style="width:${pct}%;background:${over?'#e06c75':color}"></div></div>
        </div>
        <span style="font-size:0.72rem;color:var(--text-3);margin-left:0.5rem;width:32px;text-align:right">${pct}%</span>
      </div>`;
    }).join('');
  },

  renderTransactionList() {
    const container = document.getElementById('transactionsList');
    if (!container) return;
    const txs = this.getMonthTx();
    if (!txs.length) { container.innerHTML='<p class="empty-hint">No transactions this month. Add your first one! 💸</p>'; return; }
    container.innerHTML = txs.map(t=>{
      const d = new Date(t.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
      const sign = t.type==='income'?'+':'-';
      const color= t.type==='income'?'#6abf7b':'#e06c75';
      return `<div class="tx-item">
        <div class="tx-emoji">${this.catEmoji(t.category)}</div>
        <div class="tx-info">
          <div class="tx-title">${t.title}</div>
          <div class="tx-meta">
            <span class="tx-cat" style="text-transform:capitalize">${t.category}</span>
            <span class="tx-date">${d}</span>
            ${t.note?`<span class="tx-note">${t.note}</span>`:''}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:0.4rem">
          <span style="font-weight:500;color:${color};font-size:0.95rem;white-space:nowrap">${sign}${this.fmt(t.amount)}</span>
          <button onclick="budgetModule.openTxModal(budgetModule.transactions.find(x=>x.id==='${t.id}'))" class="tx-action-btn" title="Edit">✎</button>
          <button onclick="budgetModule.deleteTransaction('${t.id}')" class="tx-action-btn" title="Delete">✕</button>
        </div>
      </div>`;
    }).join('');
  },

  renderPlan() {
    const container = document.getElementById('budgetPlanList');
    if (!container) return;
    const txs = this.getMonthTx();
    const catTotals = {};
    txs.filter(t=>t.type==='expense').forEach(t=>{ catTotals[t.category]=(catTotals[t.category]||0)+t.amount; });
    const budgets = this.getMonthBudgets();
    container.innerHTML = this.allCats().map(cat=>{
      const limit = budgets[cat] || 0;
      const spent = catTotals[cat] || 0;
      const pct   = limit>0?Math.min(100,Math.round(spent/limit*100)):0;
      const over  = limit>0 && spent>limit;
      return `<div class="plan-row">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem">
          <span style="font-size:0.88rem;text-transform:capitalize;color:var(--text);font-weight:500">${cat}</span>
          <span style="font-size:0.82rem;color:${over?'#e06c75':'var(--text-2)'}">
            ${this.fmt(spent)} ${limit>0?`/ ${this.fmt(limit)}`:'<span style="color:var(--text-3);font-size:0.75rem">no limit</span>'}
          </span>
        </div>
        ${limit>0?`<div class="budget-cat-bar-wrap">
          <div class="budget-cat-bar" style="width:${pct}%;background:${over?'#e06c75':pct>80?'var(--gold)':'var(--sage)'}"></div></div>
          <div style="font-size:0.72rem;color:var(--text-3);margin-top:0.25rem">${over?'⚠ Over by '+this.fmt(spent-limit):pct+'% used'}</div>`:''}
      </div>`;
    }).join('');
  }
};
