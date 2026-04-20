// ============================================================
// LUMIÈRE — learn.js  v4  (CRUD + working IDE)
// ============================================================

// ── BUILT-IN CURRICULUM ──────────────────────────────────────
const BUILTIN_CURRICULUM = [
  {
    id:'js-basics', title:'JavaScript Basics', icon:'⚡', color:'#f5c842', builtin:true,
    lessons:[
      { id:'variables', title:'Variables & Data Types',
        theory:`<h2>Variables & Data Types</h2><p>In JavaScript, you store information in <strong>variables</strong>. Think of a variable as a labelled box holding a value.</p><ul><li><code>let</code> — can change later</li><li><code>const</code> — stays fixed</li><li><code>var</code> — old style, avoid</li></ul><h3>Data Types</h3><ul><li><code>string</code> — text: <code>"Hello"</code></li><li><code>number</code> — <code>42</code> or <code>3.14</code></li><li><code>boolean</code> — <code>true</code> or <code>false</code></li><li><code>array</code> — list: <code>[1,2,3]</code></li><li><code>object</code> — <code>{ name:"Ada" }</code></li></ul><div class="theory-tip">✦ Try changing the values below and hitting Run!</div>`,
        starterCode:`let name = "Ada Lovelace";\nconst age = 36;\nlet isLearning = true;\n\nconsole.log("Name:", name);\nconsole.log("Age:", age);\nconsole.log("Is learning:", isLearning);\nconsole.log("Type of name:", typeof name);`,
        challenge:'Create a variable <code>dream</code> with your dream as a string, then <code>console.log</code> it.',
        hint:'let dream = "Build amazing things!"; console.log(dream);',
        solution:`let dream = "Build amazing things!";\nconsole.log(dream);` },
      { id:'functions', title:'Functions',
        theory:`<h2>Functions</h2><p>A <strong>function</strong> is a reusable block of code. Define once, call anywhere.</p><pre><code>function greet(name) {\n  return "Hello, " + name + "!";\n}</code></pre><p>Arrow function shorthand:</p><pre><code>const greet = (name) => "Hello, " + name;</code></pre><div class="theory-tip">✦ Functions are the backbone of every program!</div>`,
        starterCode:`function greet(name) {\n  return "Hello, " + name + "! 🌸";\n}\n\nconst square = (n) => n * n;\n\nconsole.log(greet("Ada"));\nconsole.log("5 squared:", square(5));`,
        challenge:'Write a function <code>double(n)</code> that returns n×2. Test with 7.',
        hint:'function double(n) { return n * 2; } console.log(double(7));',
        solution:`function double(n) { return n * 2; }\nconsole.log(double(7));` },
      { id:'arrays', title:'Arrays & Loops',
        theory:`<h2>Arrays & Loops</h2><p>An <strong>array</strong> is an ordered list: <code>let fruits = ["apple","mango"]</code></p><p>Access by index (starts at 0): <code>fruits[0]</code></p><h3>Loops</h3><pre><code>fruits.forEach(f => console.log(f));</code></pre><div class="theory-tip">✦ Arrays + loops = foundation of almost every program.</div>`,
        starterCode:`let goals = ["learn JS","build apps","ship projects"];\n\nconsole.log("First:", goals[0]);\nconsole.log("Count:", goals.length);\n\ngoals.forEach((g, i) => console.log((i+1)+". "+g));\n\nlet nums = [3,7,2,9];\nlet doubled = nums.map(n => n * 2);\nconsole.log("Doubled:", JSON.stringify(doubled));`,
        challenge:'Make an array of 3 things you love. Use forEach to print "I love: X" for each.',
        hint:'let loves = ["coding","coffee","cats"]; loves.forEach(l => console.log("I love: "+l));',
        solution:`let loves = ["coding","coffee","cats"];\nloves.forEach(l => console.log("I love: " + l));` },
    ]
  },
  {
    id:'html-css', title:'HTML & CSS', icon:'🎨', color:'#f2a4ce', builtin:true,
    lessons:[
      { id:'html-basics', title:'HTML Structure', lang:'html',
        theory:`<h2>HTML Structure</h2><p><strong>HTML</strong> uses tags to define elements on a page.</p><pre><code>&lt;h1&gt;Heading&lt;/h1&gt;\n&lt;p&gt;Paragraph&lt;/p&gt;</code></pre><h3>Common Tags</h3><ul><li><code>&lt;h1&gt;–&lt;h6&gt;</code> headings</li><li><code>&lt;p&gt;</code> paragraph</li><li><code>&lt;a&gt;</code> link</li><li><code>&lt;div&gt;</code> container</li><li><code>&lt;ul&gt;&lt;li&gt;</code> list</li></ul><div class="theory-tip">✦ The preview panel renders your HTML live!</div>`,
        starterCode:`<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body{font-family:Georgia,serif;padding:2rem;background:#fdf8f5;color:#3d2e28;}\n    h1{color:#e8a4a4;}\n    .card{background:white;padding:1.5rem;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);}\n  </style>\n</head>\n<body>\n  <h1>My First Page ✦</h1>\n  <div class="card">\n    <h2>About Me</h2>\n    <p>I am learning <strong>HTML</strong> and loving it.</p>\n    <ul><li>I love learning</li><li>I love building</li></ul>\n  </div>\n</body>\n</html>`,
        challenge:'Add an <code>&lt;h2&gt;</code> "My Goals" and a <code>&lt;ul&gt;</code> list with 3 goals.',
        hint:'<h2>My Goals</h2><ul><li>Goal 1</li><li>Goal 2</li></ul>',
        solution:`<h2>My Goals</h2>\n<ul>\n  <li>Learn HTML</li>\n  <li>Build a site</li>\n  <li>Ship a project</li>\n</ul>` },
    ]
  },
  {
    id:'algorithms', title:'Algorithms', icon:'🧠', color:'#a4c8e8', builtin:true,
    lessons:[
      { id:'conditionals', title:'Conditionals & Logic',
        theory:`<h2>Conditionals</h2><p>Programs make decisions with <code>if</code>:</p><pre><code>if (score >= 90) return "A";\nelse if (score >= 80) return "B";\nelse return "Try again";</code></pre><h3>Operators</h3><ul><li><code>===</code> equal</li><li><code>!==</code> not equal</li><li><code>&gt; &lt;</code> comparison</li><li><code>&amp;&amp;</code> AND, <code>||</code> OR</li></ul><div class="theory-tip">✦ Conditionals are the brain of your program!</div>`,
        starterCode:`function getGrade(score) {\n  if (score >= 90) return "A ✨";\n  else if (score >= 80) return "B 🌸";\n  else if (score >= 70) return "C 🌿";\n  else return "Keep going! 💪";\n}\n\nconsole.log("95 →", getGrade(95));\nconsole.log("82 →", getGrade(82));\nconsole.log("55 →", getGrade(55));`,
        challenge:'Write <code>isEven(n)</code> returning "Even" or "Odd". Test with 4 and 7.',
        hint:'if (n % 2 === 0) return "Even"; else return "Odd";',
        solution:`function isEven(n) { return n % 2 === 0 ? "Even" : "Odd"; }\nconsole.log(isEven(4));\nconsole.log(isEven(7));` },
    ]
  },
  {
    id:'python-basics', title:'Python Basics', icon:'🐍', color:'#b8e0b8', builtin:true,
    lessons:[
      { id:'py-intro', title:'Python Introduction', lang:'python-sim',
        theory:`<h2>Python — Clean & Elegant</h2><p>Python reads almost like English. No semicolons, no braces — just clean indented code.</p><pre><code>name = "Ada"\nprint(f"Hello, {name}!")</code></pre><h3>Key Differences from JS</h3><ul><li><code>print()</code> instead of <code>console.log()</code></li><li>Indentation defines blocks</li><li><code>def</code> for functions</li><li><code>True/False</code> capitalised</li><li>f-strings: <code>f"Hello {name}"</code></li></ul><div class="theory-tip">✦ Python is simulated here so you can learn syntax!</div>`,
        starterCode:`name = "Ada Lovelace"\nage = 36\nis_learning = True\n\nprint(f"Name: {name}")\nprint(f"Age: {age}")\n\ngoals = ["learn Python", "build AI", "change the world"]\nfor i, goal in enumerate(goals):\n    print(f"{i+1}. {goal}")\n\ndef greet(person):\n    return f"Hello, {person}! 🐍"\n\nprint(greet("you"))`,
        challenge:'Write a Python function <code>square(n)</code> returning n*n. Call it with 8.',
        hint:'def square(n): return n * n  then print(square(8))',
        solution:`def square(n):\n    return n * n\n\nprint(square(8))` },
    ]
  }
];

// ── PYTHON SIMULATOR ─────────────────────────────────────────
function simulatePython(code) {
  const lines = code.split('\n');
  const output = [];
  const vars = {};
  const functions = {};
  let i = 0;

  function evalExpr(expr) {
    expr = expr.trim();
    if (expr.startsWith('f"') || expr.startsWith("f'")) {
      const inner = expr.slice(2,-1);
      return inner.replace(/\{([^}]+)\}/g,(_,k)=>{ try{return String(evalExpr(k.trim()));}catch(e){return k;} });
    }
    if ((expr.startsWith('"')&&expr.endsWith('"'))||(expr.startsWith("'")&&expr.endsWith("'"))) return expr.slice(1,-1);
    if (!isNaN(expr)) return Number(expr);
    if (expr==='True') return true; if (expr==='False') return false; if (expr==='None') return null;
    if (expr.startsWith('[')&&expr.endsWith(']')) {
      const inner=expr.slice(1,-1); if(!inner.trim()) return [];
      return inner.split(',').map(s=>evalExpr(s.trim()));
    }
    const callMatch = expr.match(/^(\w+)\((.*)?\)$/s);
    if (callMatch) {
      const fname=callMatch[1], argStr=callMatch[2]||'';
      const args=argStr?argStr.split(',').map(a=>evalExpr(a.trim())):[];
      if (functions[fname]) return callFunction(fname,args);
      if (fname==='len') return args[0]?args[0].length:0;
      if (fname==='str') return String(args[0]);
      if (fname==='int') return parseInt(args[0]);
      if (fname==='range') {
        const [start,end,step]=args.length===1?[0,args[0],1]:args.length===2?[args[0],args[1],1]:args;
        const r=[]; for(let x=start;x<end;x+=step) r.push(x); return r;
      }
    }
    if (vars[expr]!==undefined) return vars[expr];
    try {
      const safe=expr.replace(/\b([a-zA-Z_]\w*)\b/g,n=>vars[n]!==undefined?JSON.stringify(vars[n]):n);
      // eslint-disable-next-line no-new-func
      return Function('"use strict";return ('+safe+')')();
    } catch(e) {}
    return expr;
  }

  function callFunction(fname,args) {
    const fn=functions[fname]; if(!fn) return undefined;
    const saved={...vars}; fn.params.forEach((p,i)=>{vars[p]=args[i];});
    let result=undefined;
    for(const line of fn.body) {
      const t=line.trim();
      if(t.startsWith('return ')) { result=evalExpr(t.slice(7).trim()); break; }
      processLine(t);
    }
    Object.assign(vars,saved); fn.params.forEach(p=>{if(!(p in saved)) delete vars[p];});
    return result;
  }

  function processLine(line) {
    if(!line||line.startsWith('#')) return;
    const pm=line.match(/^print\((.*)\)$/s);
    if(pm) {
      let arg=pm[1].trim();
      if(arg.includes(',')&&!arg.startsWith('f')) {
        output.push(arg.split(',').map(p=>evalExpr(p.trim())).join(' '));
      } else { const v=evalExpr(arg); output.push(v===null?'None':String(v)); }
      return;
    }
    const am=line.match(/^(\w+)\s*=\s*(.+)$/);
    if(am&&!line.includes('==')) { vars[am[1]]=evalExpr(am[2].trim()); return; }
  }

  while(i<lines.length) {
    const line=lines[i], trimmed=line.trim();
    if(!trimmed||trimmed.startsWith('#')) { i++; continue; }
    if(trimmed.startsWith('def ')) {
      const dm=trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/);
      if(dm) {
        const fname=dm[1], params=dm[2].split(',').map(p=>p.trim()).filter(Boolean), body=[];
        i++;
        while(i<lines.length&&(lines[i].startsWith('    ')||lines[i].startsWith('\t')||!lines[i].trim())) {
          if(lines[i].trim()) body.push(lines[i].trim()); i++;
        }
        functions[fname]={params,body}; continue;
      }
    }
    const em=trimmed.match(/^for\s+(\w+)\s*,\s*(\w+)\s+in\s+enumerate\((\w+)\)\s*:/);
    if(em) {
      const ivar=em[1],xvar=em[2],listName=em[3],body=[];
      i++;
      while(i<lines.length&&(lines[i].startsWith('    ')||lines[i].startsWith('\t'))) { body.push(lines[i].trim()); i++; }
      (vars[listName]||[]).forEach((item,idx)=>{ vars[ivar]=idx; vars[xvar]=item; body.forEach(bl=>processLine(bl)); });
      continue;
    }
    const fm=trimmed.match(/^for\s+(\w+)\s+in\s+(.+)\s*:/);
    if(fm) {
      const xvar=fm[1],body=[];
      i++;
      while(i<lines.length&&(lines[i].startsWith('    ')||lines[i].startsWith('\t'))) { body.push(lines[i].trim()); i++; }
      const it=evalExpr(fm[2].trim());
      (Array.isArray(it)?it:(typeof it==='string'?it.split(''):[])).forEach(item=>{ vars[xvar]=item; body.forEach(bl=>processLine(bl)); });
      continue;
    }
    processLine(trimmed); i++;
  }
  return output.join('\n')||'(no output)';
}

// ── LEARN MODULE ─────────────────────────────────────────────
const learnModule = {
  currentTopic: null,
  currentLesson: null,
  completed: {},
  customTopics: [],   // user-created topics
  editingTopicId: null,
  editingLessonId: null,

  get allTopics() {
    return [...BUILTIN_CURRICULUM, ...this.customTopics];
  },

  init() {
    this.completed = JSON.parse(localStorage.getItem('lumiere_learn_completed')||'{}');
    this.customTopics = JSON.parse(localStorage.getItem('lumiere_custom_topics')||'[]');
    this.renderTopics();
    this.setupEvents();
  },

  saveCustom() {
    localStorage.setItem('lumiere_custom_topics', JSON.stringify(this.customTopics));
  },

  setupEvents() {
    document.getElementById('learnRunBtn')?.addEventListener('click', ()=>this.runCode());
    document.getElementById('learnResetBtn')?.addEventListener('click', ()=>this.resetCode());
    document.getElementById('learnHintBtn')?.addEventListener('click', ()=>this.showHint());
    document.getElementById('learnSolveBtn')?.addEventListener('click', ()=>this.showSolution());
    document.getElementById('learnNextBtn')?.addEventListener('click', ()=>this.nextLesson());
    document.getElementById('learnBackBtn')?.addEventListener('click', ()=>this.showTopics());
    document.getElementById('learnClearBtn')?.addEventListener('click', ()=>this.clearOutput());
    document.getElementById('addTopicBtn')?.addEventListener('click', ()=>this.openTopicModal());
    document.getElementById('saveTopicBtn')?.addEventListener('click', ()=>this.saveTopic());
    document.getElementById('cancelTopicBtn')?.addEventListener('click', ()=>this.closeTopicModal());
    document.getElementById('topicModal')?.addEventListener('click', e=>{ if(e.target.id==='topicModal') this.closeTopicModal(); });
    document.getElementById('saveLessonBtn')?.addEventListener('click', ()=>this.saveLesson());
    document.getElementById('cancelLessonBtn')?.addEventListener('click', ()=>this.closeLessonModal());
    document.getElementById('lessonModal')?.addEventListener('click', e=>{ if(e.target.id==='lessonModal') this.closeLessonModal(); });

    document.getElementById('learnCodeEditor')?.addEventListener('keydown', e=>{
      if(e.key==='Tab'){ e.preventDefault(); const ta=e.target,s=ta.selectionStart; ta.value=ta.value.slice(0,s)+'  '+ta.value.slice(ta.selectionEnd); ta.selectionStart=ta.selectionEnd=s+2; }
      if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){ e.preventDefault(); this.runCode(); }
    });
  },

  // ── TOPICS VIEW ──────────────────────────────────────────
  renderTopics() {
    const container = document.getElementById('learnTopicsGrid');
    if(!container) return;
    document.getElementById('learnTopicsView').classList.remove('hidden');
    document.getElementById('learnLessonView').classList.add('hidden');
    container.innerHTML = this.allTopics.map(topic=>{
      const total=topic.lessons.length;
      const done=topic.lessons.filter(l=>this.completed[topic.id+':'+l.id]).length;
      const pct=total>0?Math.round(done/total*100):0;
      return `<div class="learn-topic-card" style="--topic-color:${topic.color}">
        <div class="ltc-icon" onclick="learnModule.openTopic('${topic.id}')" style="cursor:pointer">${topic.icon}</div>
        <div class="ltc-info" onclick="learnModule.openTopic('${topic.id}')" style="cursor:pointer">
          <div class="ltc-title">${topic.title}${!topic.builtin?'<span style="font-size:0.65rem;background:var(--lavender-soft);color:var(--lavender);padding:0.1rem 0.4rem;border-radius:4px;margin-left:0.4rem">Custom</span>':''}</div>
          <div class="ltc-meta">${total} lesson${total!==1?'s':''} · ${done} done</div>
          <div class="ltc-progress-wrap"><div class="ltc-progress-bar" style="width:${pct}%"></div></div>
        </div>
        <div style="display:flex;align-items:center;gap:0.3rem">
          <div class="ltc-pct" style="color:var(--topic-color)">${pct}%</div>
          ${!topic.builtin?`
          <button onclick="learnModule.openTopicModal('${topic.id}')" title="Edit topic" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.85rem;padding:0.2rem 0.3rem" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-3)'">✎</button>
          <button onclick="learnModule.deleteTopic('${topic.id}')" title="Delete topic" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.9rem;padding:0.2rem 0.3rem" onmouseover="this.style.color='#e06c75'" onmouseout="this.style.color='var(--text-3)'">✕</button>`:''}</div>
      </div>`;
    }).join('') + `<div class="learn-add-topic-card" onclick="learnModule.openTopicModal()">
      <span style="font-size:1.5rem">+</span>
      <span style="font-family:'Cormorant Garamond',serif;font-size:1rem;color:var(--text-2)">Create Your Own Topic</span>
    </div>`;
  },

  openTopic(topicId) {
    const topic = this.allTopics.find(t=>t.id===topicId);
    if(!topic) return;
    this.currentTopic = topic;
    this.renderLessonList(topic);
  },

  renderLessonList(topic) {
    const container = document.getElementById('learnTopicsGrid');
    const isCustom = !topic.builtin;
    container.innerHTML = `
      <div style="margin-bottom:1.2rem;display:flex;align-items:center;justify-content:space-between">
        <button class="btn-ghost" style="font-size:0.8rem;padding:0.3rem 0.8rem" onclick="learnModule.renderTopics()">← All Topics</button>
        ${isCustom?`<button class="btn-primary" style="font-size:0.75rem;padding:0.3rem 0.8rem" onclick="learnModule.openLessonModal('${topic.id}')">+ Add Lesson</button>`:''}
      </div>
      <div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:1.2rem">
        <span style="font-size:2rem">${topic.icon}</span>
        <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.8rem;color:var(--text)">${topic.title}</h2>
      </div>
      <div class="learn-lesson-list">
        ${topic.lessons.length ? topic.lessons.map((lesson,idx)=>{
          const key=topic.id+':'+lesson.id;
          const done=this.completed[key];
          return `<div class="learn-lesson-item${done?' done':''}">
            <div class="lli-num" style="background:${done?topic.color:'var(--surface-2)'};color:${done?'#fff':'var(--text-3)'}">${done?'✓':idx+1}</div>
            <div class="lli-info" onclick="learnModule.openLesson('${topic.id}','${lesson.id}')" style="cursor:pointer;flex:1">
              <div class="lli-title">${lesson.title}</div>
              <div class="lli-meta">${lesson.lang==='html'?'HTML/CSS':lesson.lang==='python-sim'?'Python':'JavaScript'}</div>
            </div>
            <div style="display:flex;align-items:center;gap:0.3rem">
              <span onclick="learnModule.openLesson('${topic.id}','${lesson.id}')" style="color:${topic.color};font-size:0.8rem;cursor:pointer">${done?'Completed ✦':'Start →'}</span>
              ${isCustom?`
              <button onclick="learnModule.openLessonModal('${topic.id}','${lesson.id}')" title="Edit" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.8rem;padding:0.15rem 0.3rem" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-3)'">✎</button>
              <button onclick="learnModule.deleteLesson('${topic.id}','${lesson.id}')" title="Delete" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.85rem;padding:0.15rem 0.3rem" onmouseover="this.style.color='#e06c75'" onmouseout="this.style.color='var(--text-3)'">✕</button>`:''}
            </div>
          </div>`;
        }).join('') : '<p class="empty-hint">No lessons yet. Add your first one!</p>'}
      </div>`;
  },

  // ── TOPIC CRUD ───────────────────────────────────────────
  openTopicModal(topicId = null) {
    this.editingTopicId = topicId;
    const topic = topicId ? this.customTopics.find(t=>t.id===topicId) : null;
    document.getElementById('topicModalTitle').textContent = topic ? 'Edit Topic' : 'New Topic ✦';
    document.getElementById('topicTitleInput').value = topic ? topic.title : '';
    document.getElementById('topicIconInput').value = topic ? topic.icon : '📚';
    document.getElementById('topicColorInput').value = topic ? topic.color : '#c8b4e8';
    document.getElementById('topicModal').classList.remove('hidden');
    setTimeout(()=>document.getElementById('topicTitleInput')?.focus(), 80);
  },

  closeTopicModal() {
    document.getElementById('topicModal').classList.add('hidden');
    this.editingTopicId = null;
  },

  saveTopic() {
    const title = document.getElementById('topicTitleInput').value.trim();
    if(!title) { showToast('Enter a topic title'); return; }
    const icon = document.getElementById('topicIconInput').value.trim() || '📚';
    const color = document.getElementById('topicColorInput').value || '#c8b4e8';
    if(this.editingTopicId) {
      const t = this.customTopics.find(t=>t.id===this.editingTopicId);
      if(t) { t.title=title; t.icon=icon; t.color=color; }
    } else {
      this.customTopics.push({ id:'custom-'+Date.now(), title, icon, color, builtin:false, lessons:[] });
    }
    this.saveCustom(); this.closeTopicModal(); this.renderTopics();
    showToast(this.editingTopicId ? 'Topic updated ✦' : 'Topic created ✦');
  },

  deleteTopic(topicId) {
    if(!confirm('Delete this topic and all its lessons?')) return;
    this.customTopics = this.customTopics.filter(t=>t.id!==topicId);
    this.saveCustom(); this.renderTopics();
    showToast('Topic deleted');
  },

  // ── LESSON CRUD ──────────────────────────────────────────
  openLessonModal(topicId, lessonId = null) {
    this.editingTopicId = topicId;
    this.editingLessonId = lessonId || null;
    const topic = this.customTopics.find(t=>t.id===topicId);
    const lesson = lessonId ? topic?.lessons.find(l=>l.id===lessonId) : null;
    document.getElementById('lessonModalTitle').textContent = lesson ? 'Edit Lesson' : 'New Lesson ✦';
    document.getElementById('lessonTitleInput').value = lesson ? lesson.title : '';
    document.getElementById('lessonLangInput').value = lesson ? (lesson.lang||'javascript') : 'javascript';
    document.getElementById('lessonTheoryInput').value = lesson ? (lesson.theory||'') : '';
    document.getElementById('lessonStarterInput').value = lesson ? (lesson.starterCode||'') : '// Write your code here\nconsole.log("Hello, World!");';
    document.getElementById('lessonChallengeInput').value = lesson ? (lesson.challenge||'') : '';
    document.getElementById('lessonHintInput').value = lesson ? (lesson.hint||'') : '';
    document.getElementById('lessonSolutionInput').value = lesson ? (lesson.solution||'') : '';
    document.getElementById('lessonModal').classList.remove('hidden');
    setTimeout(()=>document.getElementById('lessonTitleInput')?.focus(), 80);
  },

  closeLessonModal() {
    document.getElementById('lessonModal').classList.add('hidden');
    this.editingTopicId = null;
    this.editingLessonId = null;
  },

  saveLesson() {
    const title = document.getElementById('lessonTitleInput').value.trim();
    if(!title) { showToast('Enter a lesson title'); return; }
    const topic = this.customTopics.find(t=>t.id===this.editingTopicId);
    if(!topic) return;
    const lessonData = {
      id: this.editingLessonId || 'lesson-'+Date.now(),
      title,
      lang: document.getElementById('lessonLangInput').value,
      theory: document.getElementById('lessonTheoryInput').value || `<h2>${title}</h2><p>Your lesson content here.</p>`,
      starterCode: document.getElementById('lessonStarterInput').value || '// Start coding here\nconsole.log("Hello!");',
      challenge: document.getElementById('lessonChallengeInput').value || 'Complete the code above.',
      hint: document.getElementById('lessonHintInput').value || 'Check the theory above for clues!',
      solution: document.getElementById('lessonSolutionInput').value || ''
    };
    if(this.editingLessonId) {
      const idx = topic.lessons.findIndex(l=>l.id===this.editingLessonId);
      if(idx>=0) topic.lessons[idx]=lessonData;
    } else {
      topic.lessons.push(lessonData);
    }
    this.saveCustom(); this.closeLessonModal();
    const t = this.allTopics.find(t=>t.id===this.editingTopicId||topic.id);
    if(t) this.renderLessonList(t);
    showToast(this.editingLessonId ? 'Lesson updated ✦' : 'Lesson added ✦');
  },

  deleteLesson(topicId, lessonId) {
    if(!confirm('Delete this lesson?')) return;
    const topic = this.customTopics.find(t=>t.id===topicId);
    if(!topic) return;
    topic.lessons = topic.lessons.filter(l=>l.id!==lessonId);
    // Clear completion
    delete this.completed[topicId+':'+lessonId];
    localStorage.setItem('lumiere_learn_completed', JSON.stringify(this.completed));
    this.saveCustom(); this.renderLessonList(topic);
    showToast('Lesson deleted');
  },

  // ── LESSON VIEW ──────────────────────────────────────────
  openLesson(topicId, lessonId) {
    const topic = this.allTopics.find(t=>t.id===topicId);
    const lesson = topic?.lessons.find(l=>l.id===lessonId);
    if(!topic||!lesson) return;
    this.currentTopic = topic; this.currentLesson = lesson;
    document.getElementById('learnTopicsView').classList.add('hidden');
    document.getElementById('learnLessonView').classList.remove('hidden');
    document.getElementById('learnLessonTitle').textContent = lesson.title;
    document.getElementById('learnTopicBadge').textContent = topic.icon+' '+topic.title;
    document.getElementById('learnTopicBadge').style.color = topic.color;
    document.getElementById('learnTheory').innerHTML = lesson.theory || `<h2>${lesson.title}</h2>`;
    const editor = document.getElementById('learnCodeEditor');
    editor.value = lesson.starterCode || '';
    editor.setAttribute('data-lang', lesson.lang||'javascript');
    const langLabel = {html:'HTML','python-sim':'Python',javascript:'JavaScript'};
    document.getElementById('learnLangBadge').textContent = langLabel[lesson.lang]||'JavaScript';
    document.getElementById('learnChallenge').innerHTML = `<strong>🎯 Challenge:</strong> ${lesson.challenge||'Complete the code above.'}`;
    document.getElementById('learnOutput').innerHTML = '<span style="color:#666;font-size:0.85rem">Click ▶ Run (or Ctrl+Enter) to execute</span>';
    document.getElementById('learnHintBox').classList.add('hidden');
    document.getElementById('learnNextBtn').classList.add('hidden');
    document.getElementById('learnPreviewPanel').style.display = 'none';
    document.getElementById('learnOutputPanel').style.display = 'flex';
    const idx = topic.lessons.findIndex(l=>l.id===lessonId);
    document.getElementById('learnNextBtn').textContent = idx<topic.lessons.length-1 ? 'Next Lesson →' : 'Back to Topics';
  },

  runCode() {
    const editor = document.getElementById('learnCodeEditor');
    const code = editor.value;
    const lang = editor.getAttribute('data-lang')||'javascript';
    const output = document.getElementById('learnOutput');
    output.innerHTML = '';

    if(lang==='html') {
      this.updateHTMLPreview(code);
      output.innerHTML = '<span style="color:#6abf7b;font-size:0.85rem">✓ Preview updated →</span>';
      this.markComplete(); return;
    }

    if(lang==='python-sim') {
      try {
        const result = simulatePython(code);
        output.innerHTML = result.split('\n').map(l=>`<div class="out-line">${this.esc(l)}</div>`).join('');
      } catch(e) { output.innerHTML=`<div class="out-error">Error: ${e.message}</div>`; }
      this.markComplete(); return;
    }

    // JavaScript
    const logs=[];
    const _l=console.log,_e=console.error,_w=console.warn,_i=console.info;
    const cap=type=>(...args)=>{
      const text=args.map(a=>{try{return typeof a==='object'&&a!==null?JSON.stringify(a,null,2):String(a);}catch(e){return String(a);}}).join(' ');
      logs.push({type,text});
    };
    console.log=cap('log'); console.error=cap('error'); console.warn=cap('warn'); console.info=cap('info');
    try {
      // eslint-disable-next-line no-new-func
      const result=new Function(code)();
      if(result!==undefined) logs.push({type:'return',text:'← '+String(result)});
    } catch(e) { logs.push({type:'error',text:e.message}); }
    finally { console.log=_l; console.error=_e; console.warn=_w; console.info=_i; }

    if(!logs.length) { output.innerHTML='<div class="out-ok">✓ Ran with no output.</div>'; }
    else {
      const cls={log:'out-line',error:'out-error',warn:'out-warn',return:'out-return',info:'out-info'};
      output.innerHTML=logs.map(l=>`<div class="${cls[l.type]||'out-line'}">${this.esc(l.text)}</div>`).join('');
    }
    this.markComplete();
  },

  updateHTMLPreview(code) {
    const p=document.getElementById('learnHTMLPreview');
    if(p) p.srcdoc=code;
    document.getElementById('learnOutputPanel').style.display='none';
    document.getElementById('learnPreviewPanel').style.display='flex';
  },

  resetCode() {
    if(!this.currentLesson) return;
    document.getElementById('learnCodeEditor').value=this.currentLesson.starterCode||'';
    document.getElementById('learnOutput').innerHTML='<span style="color:#666;font-size:0.85rem">Code reset.</span>';
    document.getElementById('learnPreviewPanel').style.display='none';
    document.getElementById('learnOutputPanel').style.display='flex';
  },

  showHint() {
    const box=document.getElementById('learnHintBox');
    box.classList.toggle('hidden');
    if(!box.classList.contains('hidden')&&this.currentLesson)
      box.innerHTML=`<span style="font-size:0.85rem;color:var(--text-2)">💡 <strong>Hint:</strong> ${this.currentLesson.hint||'Try reviewing the theory above!'}</span>`;
  },

  showSolution() {
    if(!this.currentLesson) return;
    if(!this.currentLesson.solution) { showToast('No solution provided for this lesson.'); return; }
    if(!confirm('Show the solution? Try the challenge yourself first! 🌸')) return;
    document.getElementById('learnCodeEditor').value=this.currentLesson.solution;
    this.runCode();
  },

  clearOutput() {
    document.getElementById('learnOutput').innerHTML='';
    document.getElementById('learnPreviewPanel').style.display='none';
    document.getElementById('learnOutputPanel').style.display='flex';
  },

  markComplete() {
    if(!this.currentTopic||!this.currentLesson) return;
    const key=this.currentTopic.id+':'+this.currentLesson.id;
    this.completed[key]=true;
    localStorage.setItem('lumiere_learn_completed',JSON.stringify(this.completed));
    document.getElementById('learnNextBtn').classList.remove('hidden');
  },

  nextLesson() {
    if(!this.currentTopic||!this.currentLesson) { this.showTopics(); return; }
    const idx=this.currentTopic.lessons.findIndex(l=>l.id===this.currentLesson.id);
    if(idx<this.currentTopic.lessons.length-1) this.openLesson(this.currentTopic.id,this.currentTopic.lessons[idx+1].id);
    else this.showTopics();
  },

  showTopics() {
    document.getElementById('learnTopicsView').classList.remove('hidden');
    document.getElementById('learnLessonView').classList.add('hidden');
    this.renderTopics();
  },

  esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
};
