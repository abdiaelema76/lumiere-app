// ============================================================
// LUMIÈRE — learn.js  v6
// Rich theory rendering (markdown-like), embedded IDE tabs, CRUD
// ============================================================

// ── MARKDOWN-LIKE RENDERER ───────────────────────────────────
function renderTheory(md) {
  if (!md) return '';
  // If already HTML (starts with <), return as-is
  if (md.trim().startsWith('<')) return md;

  let html = md
    // Fenced code blocks ```lang ... ```
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const l = lang || 'javascript';
      return `<div class="theory-code-block"><div class="theory-code-lang">${l}</div><pre><code>${escHtml(code.trim())}</code></pre></div>`;
    })
    // Inline code
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // H3
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // H2
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // H1
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Numbered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="ol-item">$1</li>')
    // Bullet list items
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // Tip boxes [!tip] ... 
    .replace(/\[!tip\]\s*(.+)/g, '<div class="theory-tip">✦ $1</div>')
    // Note boxes [!note] ...
    .replace(/\[!note\]\s*(.+)/g, '<div class="theory-note">📝 $1</div>')
    // Blank lines → paragraph breaks
    .replace(/\n\n/g, '</p><p class="theory-p">')
    // Wrap consecutive li items
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => {
      if (m.includes('ol-item')) return '<ol>' + m + '</ol>';
      return '<ul>' + m + '</ul>';
    });

  // Wrap in paragraph if not starting with a block element
  if (!html.match(/^<(h[1-6]|ul|ol|div|pre|blockquote)/)) {
    html = '<p class="theory-p">' + html + '</p>';
  }
  return html;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── BUILT-IN CURRICULUM (rich markdown theory) ───────────────
const BUILTIN_CURRICULUM = [
  {
    id:'js-basics', title:'JavaScript Basics', icon:'⚡', color:'#f5c842', builtin:true,
    lessons:[
      {
        id:'variables', title:'Variables',
        theory:`# Variables

Most of the time, a JavaScript application needs to work with information. Here are two examples:

1. An online shop – the information might include goods being sold and a shopping cart.
2. A chat application – the information might include users, messages, and much more.

Variables are used to store this information.

## A variable

A variable is a "named storage" for data. We can use variables to store goodies, visitors, and other data.

To create a variable in JavaScript, use the \`let\` keyword.

The statement below creates (in other words: **declares**) a variable with the name "message":

\`\`\`javascript
let message;
\`\`\`

Now, we can put some data into it by using the assignment operator \`=\`:

\`\`\`javascript
let message;
message = 'Hello'; // store the string 'Hello' in the variable named message
\`\`\`

The string is now saved into memory. We can access it using the variable name:

\`\`\`javascript
let message = 'Hello!';
alert(message); // Hello!
\`\`\`

We can also declare multiple variables:

\`\`\`javascript
let user = 'John';
let age = 25;
let message = 'Hello';
\`\`\`

## var instead of let

In older scripts, you may find another keyword: \`var\` instead of \`let\`:

\`\`\`javascript
var message = 'Hello';
\`\`\`

The \`var\` keyword is almost the same as \`let\`. It also declares a variable but in a slightly different, "old-school" way.

[!tip] Think of a variable as a "box" for data, with a uniquely-named sticker on it. You can put any value in the box, and change it as many times as you want.`,
        starterCode:`// Declare variables with let
let name = "Ada Lovelace";
let age = 36;
let isLearning = true;

console.log("Name:", name);
console.log("Age:", age);
console.log("Is learning:", isLearning);

// Change a variable
name = "Grace Hopper";
console.log("Updated name:", name);

// Use typeof to check the type
console.log("Type of age:", typeof age);
console.log("Type of name:", typeof name);`,
        challenge:'Create a variable called `dream` and assign it a string describing your dream. Then `console.log` it.',
        hint:'`let dream = "To build amazing apps!"; console.log(dream);`',
        solution:`let dream = "To build amazing apps!";\nconsole.log(dream);`
      },
      {
        id:'functions', title:'Functions',
        theory:`# Functions

Functions are the main "building blocks" of a program. They allow the code to be called many times without repetition.

## Declaring a Function

To create a function we can use a **function declaration**:

\`\`\`javascript
function showMessage() {
  alert( 'Hello everyone!' );
}
\`\`\`

The \`function\` keyword goes first, then the *name* of the function, then a list of *parameters* between parentheses, and finally the code of the function — the "function body" — between curly braces.

## Parameters

We can pass arbitrary data to functions using parameters:

\`\`\`javascript
function showMessage(from, text) {
  alert(from + ': ' + text);
}

showMessage('Ann', 'Hello!'); // Ann: Hello!
showMessage('Ann', "What's up?"); // Ann: What's up?
\`\`\`

## Returning a value

A function can return a value back into the calling code as the result:

\`\`\`javascript
function sum(a, b) {
  return a + b;
}

let result = sum(1, 2);
alert(result); // 3
\`\`\`

## Arrow Functions

There's another very simple and concise syntax for creating functions — **arrow functions**:

\`\`\`javascript
let sum = (a, b) => a + b;

// Same as:
// let sum = function(a, b) { return a + b; };

alert( sum(1, 2) ); // 3
\`\`\`

[!tip] Functions allow you to write code once and reuse it many times. They are one of the most important concepts in programming.`,
        starterCode:`// Regular function
function greet(name) {
  return "Hello, " + name + "! 🌸";
}

// Arrow function
const square = (n) => n * n;

// Function with multiple parameters
function introduce(name, role) {
  return name + " is a " + role;
}

console.log(greet("Ada"));
console.log("5 squared:", square(5));
console.log(introduce("Grace", "programmer"));`,
        challenge:'Write a function `multiply(a, b)` that returns a × b. Test it with multiply(6, 7).',
        hint:'`function multiply(a, b) { return a * b; } console.log(multiply(6, 7));`',
        solution:`function multiply(a, b) { return a * b; }\nconsole.log(multiply(6, 7)); // 42`
      },
      {
        id:'arrays', title:'Arrays & Loops',
        theory:`# Arrays & Loops

## Arrays

An **array** is a special variable that can hold more than one value at a time:

\`\`\`javascript
let fruits = ["Apple", "Mango", "Grape"];
\`\`\`

Array items are accessed by their **index**, starting at 0:

\`\`\`javascript
fruits[0]; // "Apple"
fruits[1]; // "Mango"
fruits[2]; // "Grape"
\`\`\`

## Array Methods

Arrays have built-in methods for common operations:

\`\`\`javascript
fruits.push("Berry");      // add to end
fruits.pop();              // remove from end
fruits.length;             // number of items
fruits.indexOf("Mango");   // find position → 1
\`\`\`

## Loops

The **for...of** loop is the cleanest way to iterate over an array:

\`\`\`javascript
for (let fruit of fruits) {
  console.log(fruit);
}
\`\`\`

The **forEach** method is another elegant option:

\`\`\`javascript
fruits.forEach((fruit, index) => {
  console.log(index + ": " + fruit);
});
\`\`\`

## Transforming Arrays

\`map()\` creates a new array by transforming each element:

\`\`\`javascript
let numbers = [1, 2, 3, 4];
let doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8]
\`\`\`

\`filter()\` creates a new array with only matching elements:

\`\`\`javascript
let evens = numbers.filter(n => n % 2 === 0);
// [2, 4]
\`\`\`

[!tip] Arrays + loops are the backbone of almost every real program. Master them early!`,
        starterCode:`let goals = ["learn JS", "build apps", "ship projects", "inspire others"];

// Access by index
console.log("First goal:", goals[0]);
console.log("Total goals:", goals.length);

// forEach loop
console.log("\\n--- All Goals ---");
goals.forEach((goal, i) => {
  console.log((i + 1) + ". " + goal);
});

// map() — transform each item
let numbers = [1, 2, 3, 4, 5];
let doubled = numbers.map(n => n * 2);
console.log("\\nDoubled:", JSON.stringify(doubled));

// filter() — keep only matching items
let big = numbers.filter(n => n > 3);
console.log("Greater than 3:", JSON.stringify(big));`,
        challenge:'Create an array of 3 things you love. Use `forEach` to print "I love: X" for each.',
        hint:'`let loves = ["coding","coffee","cats"]; loves.forEach(l => console.log("I love: " + l));`',
        solution:`let loves = ["coding", "coffee", "cats"];\nloves.forEach(l => console.log("I love: " + l));`
      },
      {
        id:'objects', title:'Objects',
        theory:`# Objects

Objects are used to store **keyed collections of data**. An object can be created with curly braces \`{}\`, with an optional list of *properties*.

## Creating Objects

\`\`\`javascript
let user = {
  name: "Ada",
  age: 36,
  isAdmin: true
};
\`\`\`

## Accessing Properties

Property values are accessible using the **dot notation**:

\`\`\`javascript
user.name;  // "Ada"
user.age;   // 36
\`\`\`

Or using **bracket notation** (useful when key is dynamic):

\`\`\`javascript
user["name"];  // "Ada"
\`\`\`

## Adding & Deleting Properties

\`\`\`javascript
user.email = "ada@example.com"; // add
delete user.isAdmin;            // remove
\`\`\`

## Methods

Objects can also contain functions — these are called **methods**:

\`\`\`javascript
let user = {
  name: "Ada",
  greet() {
    return "Hi! I'm " + this.name;
  }
};

user.greet(); // "Hi! I'm Ada"
\`\`\`

## Looping Over Properties

\`\`\`javascript
for (let key in user) {
  console.log(key + ": " + user[key]);
}
\`\`\`

[!tip] Objects model real-world things. They're everywhere in JavaScript — the DOM, APIs, React components, all use objects.`,
        starterCode:`// Create an object
let profile = {
  name: "You",
  level: "Beginner",
  skills: ["HTML", "CSS", "JavaScript"],
  streak: 7,
  greet() {
    return "Hi! I'm " + this.name + " — level: " + this.level;
  }
};

console.log(profile.greet());
console.log("Skills:", profile.skills.join(", "));
console.log("Streak:", profile.streak, "days");

// Update a property
profile.level = "Intermediate";
console.log("Updated level:", profile.level);

// Loop over properties
console.log("\\n--- Profile ---");
for (let key in profile) {
  if (typeof profile[key] !== 'function') {
    console.log(key + ":", JSON.stringify(profile[key]));
  }
}`,
        challenge:'Create an object called `book` with `title`, `author`, and `pages`. Add a method `describe()` that returns a sentence about the book. Log it.',
        hint:'`let book = {title:"Atomic Habits", author:"James Clear", pages:320, describe() { return this.title + " by " + this.author; }};`',
        solution:`let book = {
  title: "Atomic Habits",
  author: "James Clear",
  pages: 320,
  describe() { return this.title + " by " + this.author + " (" + this.pages + " pages)"; }
};
console.log(book.describe());`
      }
    ]
  },
  {
    id:'html-css', title:'HTML & CSS', icon:'🎨', color:'#f2a4ce', builtin:true,
    lessons:[
      {
        id:'html-basics', title:'HTML Structure', lang:'html',
        theory:`# HTML Structure

**HTML** (HyperText Markup Language) is the skeleton of every webpage. It uses **tags** to define elements.

## Basic Tags

\`\`\`html
<h1>This is a heading</h1>
<p>This is a paragraph.</p>
\`\`\`

Tags come in pairs — an **opening** tag and a **closing** tag (with a slash).

## Common Tags

- \`<h1>\` to \`<h6>\` — headings (h1 is biggest)
- \`<p>\` — paragraph
- \`<a href="url">\` — link
- \`<img src="url">\` — image
- \`<div>\` — generic container
- \`<ul>\` + \`<li>\` — unordered list
- \`<ol>\` + \`<li>\` — ordered list
- \`<strong>\` — bold text
- \`<em>\` — italic text

## Page Structure

\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>Page Title</title>
  </head>
  <body>
    <h1>Hello!</h1>
    <p>Content goes here.</p>
  </body>
</html>
\`\`\`

[!tip] The preview panel on the right renders your HTML live! Every time you click Run, the preview updates instantly.`,
        starterCode:`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; padding: 2rem; background: #fdf8f5; color: #3d2e28; }
    h1 { color: #e8a4a4; margin-bottom: 0.5rem; }
    .card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-top: 1rem; }
    a { color: #c8a0cc; }
  </style>
</head>
<body>
  <h1>My First Page ✦</h1>
  <div class="card">
    <h2>About Me</h2>
    <p>I am learning <strong>HTML</strong> and it's going beautifully.</p>
    <ul>
      <li>I love learning</li>
      <li>I love building things</li>
      <li>I love design</li>
    </ul>
    <a href="#">Click here to learn more</a>
  </div>
</body>
</html>`,
        challenge:'Add an `<h2>` tag that says "My Goals" and a `<ul>` list with 3 of your goals below it.',
        hint:'Add inside the card div: `<h2>My Goals</h2><ul><li>Goal 1</li><li>Goal 2</li></ul>`',
        solution:`<h2>My Goals</h2>\n<ul>\n  <li>Learn HTML</li>\n  <li>Build a website</li>\n  <li>Ship a project</li>\n</ul>`
      },
      {
        id:'css-basics', title:'CSS Styling', lang:'html',
        theory:`# CSS Styling

**CSS** (Cascading Style Sheets) makes your HTML beautiful. You write **selectors** and **properties**:

\`\`\`css
h1 {
  color: hotpink;
  font-size: 2rem;
}
\`\`\`

## How It Works

A CSS rule has two parts:
1. A **selector** — which HTML element to style
2. A **declaration block** — the styles to apply

## Key Properties

- \`color\` — text color
- \`background\` / \`background-color\` — background
- \`font-size\` — size of text (\`rem\`, \`px\`, \`em\`)
- \`padding\` — space **inside** an element
- \`margin\` — space **outside** an element
- \`border-radius\` — rounded corners
- \`box-shadow\` — shadow effect
- \`display: flex\` — flexible layout

## Selectors

\`\`\`css
p { }           /* all paragraphs */
.card { }       /* elements with class="card" */
#hero { }       /* element with id="hero" */
h1, h2 { }     /* h1 AND h2 */
\`\`\`

## Colors

\`\`\`css
color: red;
color: #e8a4a4;          /* hex */
color: rgb(232, 164, 164); /* rgb */
color: hsl(0, 60%, 78%); /* hsl */
\`\`\`

[!tip] Play with the colors and values — CSS rewards experimentation! Every small change teaches you something.`,
        starterCode:`<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Georgia, serif;
    background: linear-gradient(135deg, #fdf8f5, #f0e8f8);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  .card {
    background: white;
    border-radius: 20px;
    padding: 2.5rem;
    box-shadow: 0 8px 32px rgba(200, 130, 140, 0.15);
    max-width: 400px;
    text-align: center;
  }
  h1 {
    color: #e8a4a4;
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  p { color: #7a6259; line-height: 1.7; margin-bottom: 1rem; }
  .badge {
    display: inline-block;
    background: #fdeef1;
    color: #e8a4a4;
    padding: 0.4rem 1rem;
    border-radius: 99px;
    font-size: 0.85rem;
    border: 1px solid #f2c4ce;
  }
</style>
</head>
<body>
  <div class="card">
    <h1>Hello, World! ✦</h1>
    <p>This is a beautifully styled card. CSS makes everything prettier.</p>
    <span class="badge">CSS is magic 🌸</span>
  </div>
</body>
</html>`,
        challenge:'Change the `h1` color to `#c8a0cc` (lavender) and add `letter-spacing: 0.05em` to the `h1` rule.',
        hint:'In the h1 CSS rule, change `color: #e8a4a4;` to `color: #c8a0cc;` and add `letter-spacing: 0.05em;`',
        solution:`h1 {\n  color: #c8a0cc;\n  font-size: 2rem;\n  margin-bottom: 1rem;\n  letter-spacing: 0.05em;\n}`
      }
    ]
  },
  {
    id:'algorithms', title:'Algorithms', icon:'🧠', color:'#a4c8e8', builtin:true,
    lessons:[
      {
        id:'conditionals', title:'Conditionals & Logic',
        theory:`# Conditionals & Logic

Programs need to make **decisions**. The \`if\` statement lets your code choose different paths.

## The if Statement

\`\`\`javascript
if (condition) {
  // runs if condition is true
} else if (anotherCondition) {
  // runs if second condition is true
} else {
  // runs if nothing matched
}
\`\`\`

## Comparison Operators

| Operator | Meaning |
| --- | --- |
| \`===\` | Strictly equal |
| \`!==\` | Not equal |
| \`>\` \`<\` | Greater / less than |
| \`>=\` \`<=\` | Greater / less or equal |

## Logical Operators

- \`&&\` — AND (both must be true)
- \`||\` — OR (either can be true)
- \`!\` — NOT (inverts the value)

\`\`\`javascript
if (age >= 18 && hasID) {
  console.log("Access granted");
}
\`\`\`

## The Ternary Operator

A shorter way to write if/else when returning a value:

\`\`\`javascript
let greeting = hour < 12 ? "Good morning" : "Good afternoon";
\`\`\`

## Switch Statement

\`\`\`javascript
switch (day) {
  case "Monday": console.log("Start of week"); break;
  case "Friday": console.log("Almost weekend!"); break;
  default: console.log("Midweek hustle");
}
\`\`\`

[!tip] Conditionals are the **brain** of your program — they let it think and make decisions!`,
        starterCode:`// Grade calculator using if/else
function getGrade(score) {
  if (score >= 90) return "A ✨";
  else if (score >= 80) return "B 🌸";
  else if (score >= 70) return "C 🌿";
  else if (score >= 60) return "D";
  else return "F — keep going! 💪";
}

console.log("Score 95 →", getGrade(95));
console.log("Score 82 →", getGrade(82));
console.log("Score 55 →", getGrade(55));

// Ternary operator
let hour = new Date().getHours();
let timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
console.log("\\nGood " + timeOfDay + "! ✦");

// Logical operators
let age = 20, hasID = true;
if (age >= 18 && hasID) {
  console.log("Access granted ✓");
}`,
        challenge:'Write a function `isEven(n)` that returns `"Even"` if n is even, `"Odd"` if not. Test with 4 and 7.',
        hint:'Use the modulo operator: `n % 2 === 0` means even.',
        solution:`function isEven(n) {\n  return n % 2 === 0 ? "Even" : "Odd";\n}\nconsole.log(isEven(4)); // Even\nconsole.log(isEven(7)); // Odd`
      }
    ]
  },
  {
    id:'python-basics', title:'Python Basics', icon:'🐍', color:'#b8e0b8', builtin:true,
    lessons:[
      {
        id:'py-intro', title:'Python Introduction', lang:'python-sim',
        theory:`# Python — The Elegant Language

Python is famous for its **clean, readable syntax**. It reads almost like English — no semicolons, no curly braces.

## Hello World

\`\`\`python
print("Hello, World!")
\`\`\`

## Variables

Unlike JavaScript, Python needs no keyword — just assign:

\`\`\`python
name = "Ada"
age = 36
is_learning = True
\`\`\`

## F-strings

The cleanest way to embed variables in strings:

\`\`\`python
name = "Ada"
print(f"Hello, {name}!")  # Hello, Ada!
\`\`\`

## Lists

Python lists are like JavaScript arrays:

\`\`\`python
fruits = ["apple", "mango", "grape"]
fruits[0]      # "apple"
fruits.append("berry")
len(fruits)    # 4
\`\`\`

## For Loops

\`\`\`python
for fruit in fruits:
    print(fruit)

# With index:
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")
\`\`\`

## Functions

Use \`def\` to declare functions. **Indentation** defines the function body:

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("Ada"))
\`\`\`

[!tip] Python is simulated here so you can learn syntax! In real projects it runs on a server.`,
        starterCode:`# Variables — no keyword needed!
name = "Ada Lovelace"
age = 36
is_learning = True

print(f"Name: {name}")
print(f"Age: {age}")
print(f"Is learning: {is_learning}")

# Lists
goals = ["learn Python", "build AI", "change the world"]
for i, goal in enumerate(goals):
    print(f"{i+1}. {goal}")

# Functions
def greet(person):
    return f"Hello, {person}! Welcome to Python 🐍"

print(greet("you"))`,
        challenge:'Write a Python function `square(n)` that returns n×n. Call it with 8.',
        hint:'`def square(n): return n * n` then `print(square(8))`',
        solution:`def square(n):\n    return n * n\n\nprint(square(8))  # 64`
      }
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

  function ev(expr) {
    expr = expr.trim();
    if (expr.startsWith('f"') || expr.startsWith("f'")) {
      return expr.slice(2,-1).replace(/\{([^}]+)\}/g,(_,k)=>{try{return String(ev(k.trim()));}catch(e){return k;}});
    }
    if ((expr.startsWith('"')&&expr.endsWith('"'))||(expr.startsWith("'")&&expr.endsWith("'"))) return expr.slice(1,-1);
    if (!isNaN(expr) && expr!=='') return Number(expr);
    if (expr==='True') return true; if (expr==='False') return false; if (expr==='None') return null;
    if (expr.startsWith('[')&&expr.endsWith(']')) {
      const inner=expr.slice(1,-1); if(!inner.trim()) return [];
      return inner.split(',').map(s=>ev(s.trim()));
    }
    const call = expr.match(/^(\w+)\((.*?)?\)$/s);
    if (call) {
      const [,fn,argStr]=call;
      const args = argStr ? argStr.split(',').map(a=>ev(a.trim())) : [];
      if (functions[fn]) return callFn(fn,args);
      if (fn==='len') return args[0]?.length||0;
      if (fn==='str') return String(args[0]);
      if (fn==='int') return parseInt(args[0]);
      if (fn==='range') { const [s,e,st]=args.length===1?[0,args[0],1]:args.length===2?[args[0],args[1],1]:args; const r=[];for(let x=s;x<e;x+=st)r.push(x);return r; }
    }
    if (vars[expr]!==undefined) return vars[expr];
    try { const safe=expr.replace(/\b([a-zA-Z_]\w*)\b/g,n=>vars[n]!==undefined?JSON.stringify(vars[n]):n); return Function('"use strict";return('+safe+')')(); } catch(e){}
    return expr;
  }

  function callFn(name, args) {
    const fn=functions[name]; if(!fn) return;
    const saved={...vars}; fn.params.forEach((p,i)=>{vars[p]=args[i];}); let result;
    for(const l of fn.body){const t=l.trim();if(t.startsWith('return ')){result=ev(t.slice(7).trim());break;}processLine(t);}
    Object.assign(vars,saved); fn.params.forEach(p=>{if(!(p in saved))delete vars[p];}); return result;
  }

  function processLine(line) {
    if(!line||line.startsWith('#')) return;
    const pm=line.match(/^print\((.*)\)$/s);
    if(pm){const a=pm[1].trim();if(a.includes(',')&&!a.startsWith('f'))output.push(a.split(',').map(p=>ev(p.trim())).join(' '));else{const v=ev(a);output.push(v===null?'None':String(v));}return;}
    const am=line.match(/^(\w+)\s*=\s*(.+)$/);
    if(am&&!line.includes('==')&&!line.includes('!=')&&!line.includes('<=')){vars[am[1]]=ev(am[2].trim());return;}
  }

  while(i<lines.length){
    const line=lines[i],t=line.trim();
    if(!t||t.startsWith('#')){i++;continue;}
    if(t.startsWith('def ')){
      const m=t.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/);
      if(m){const name=m[1],params=m[2].split(',').map(p=>p.trim()).filter(Boolean),body=[];i++;
        while(i<lines.length&&(lines[i].startsWith('    ')||lines[i].startsWith('\t')||!lines[i].trim())){if(lines[i].trim())body.push(lines[i].trim());i++;}
        functions[name]={params,body};continue;}
    }
    const em=t.match(/^for\s+(\w+)\s*,\s*(\w+)\s+in\s+enumerate\((\w+)\)\s*:/);
    if(em){const [,iv,xv,ln]=em,body=[];i++;
      while(i<lines.length&&(lines[i].startsWith('    ')||lines[i].startsWith('\t'))){body.push(lines[i].trim());i++;}
      (vars[ln]||[]).forEach((item,idx)=>{vars[iv]=idx;vars[xv]=item;body.forEach(bl=>processLine(bl));});continue;}
    const fm=t.match(/^for\s+(\w+)\s+in\s+(.+)\s*:/);
    if(fm){const [,xv,itExpr]=fm,body=[];i++;
      while(i<lines.length&&(lines[i].startsWith('    ')||lines[i].startsWith('\t'))){body.push(lines[i].trim());i++;}
      const it=ev(itExpr.trim());(Array.isArray(it)?it:(typeof it==='string'?it.split(''):[])).forEach(item=>{vars[xv]=item;body.forEach(bl=>processLine(bl));});continue;}
    processLine(t);i++;
  }
  return output.join('\n')||'(no output)';
}

// ── LEARN MODULE ─────────────────────────────────────────────
const learnModule = {
  currentTopic: null,
  currentLesson: null,
  completed: {},
  customTopics: [],
  editingTopicId: null,
  editingLessonId: null,

  get allTopics() { return [...BUILTIN_CURRICULUM, ...this.customTopics]; },

  init() {
    this.completed = JSON.parse(localStorage.getItem('lumiere_learn_completed')||'{}');
    this.customTopics = JSON.parse(localStorage.getItem('lumiere_custom_topics')||'[]');
    this.renderTopics();
    this.setupEvents();
  },

  saveCustom() { localStorage.setItem('lumiere_custom_topics', JSON.stringify(this.customTopics)); },

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
    document.getElementById('topicModal')?.addEventListener('click', e=>{if(e.target.id==='topicModal')this.closeTopicModal();});
    document.getElementById('saveLessonBtn')?.addEventListener('click', ()=>this.saveLesson());
    document.getElementById('cancelLessonBtn')?.addEventListener('click', ()=>this.closeLessonModal());
    document.getElementById('lessonModal')?.addEventListener('click', e=>{if(e.target.id==='lessonModal')this.closeLessonModal();});
    document.getElementById('learnCodeEditor')?.addEventListener('keydown', e=>{
      if(e.key==='Tab'){e.preventDefault();const ta=e.target,s=ta.selectionStart;ta.value=ta.value.slice(0,s)+'  '+ta.value.slice(ta.selectionEnd);ta.selectionStart=ta.selectionEnd=s+2;}
      if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();this.runCode();}
    });
  },

  renderTopics() {
    const c=document.getElementById('learnTopicsGrid');if(!c)return;
    document.getElementById('learnTopicsView').classList.remove('hidden');
    document.getElementById('learnLessonView').classList.add('hidden');
    c.innerHTML = this.allTopics.map(topic=>{
      const total=topic.lessons.length, done=topic.lessons.filter(l=>this.completed[topic.id+':'+l.id]).length;
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
          ${!topic.builtin?`<button onclick="learnModule.openTopicModal('${topic.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.85rem;padding:0.2rem 0.3rem" title="Edit">✎</button>
          <button onclick="learnModule.deleteTopic('${topic.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.9rem;padding:0.2rem 0.3rem" title="Delete">✕</button>`:''}
        </div>
      </div>`;
    }).join('') + `<div class="learn-add-topic-card" onclick="learnModule.openTopicModal()"><span style="font-size:1.5rem">+</span><span style="font-family:'Cormorant Garamond',serif;font-size:1rem;color:var(--text-2)">Create Your Own Topic</span></div>`;
  },

  openTopic(id) { const t=this.allTopics.find(t=>t.id===id); if(t){this.currentTopic=t;this.renderLessonList(t);} },

  renderLessonList(topic) {
    const c=document.getElementById('learnTopicsGrid'), isCustom=!topic.builtin;
    c.innerHTML=`
      <div style="margin-bottom:1.2rem;display:flex;align-items:center;justify-content:space-between">
        <button class="btn-ghost" style="font-size:0.8rem;padding:0.3rem 0.8rem" onclick="learnModule.renderTopics()">← All Topics</button>
        ${isCustom?`<button class="btn-primary" style="font-size:0.75rem;padding:0.3rem 0.8rem" onclick="learnModule.openLessonModal('${topic.id}')">+ Add Lesson</button>`:''}
      </div>
      <div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:1.2rem">
        <span style="font-size:2rem">${topic.icon}</span>
        <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.8rem;color:var(--text)">${topic.title}</h2>
      </div>
      <div class="learn-lesson-list">
        ${topic.lessons.length?topic.lessons.map((lesson,idx)=>{
          const key=topic.id+':'+lesson.id, done=this.completed[key];
          return `<div class="learn-lesson-item${done?' done':''}">
            <div class="lli-num" style="background:${done?topic.color:'var(--surface-2)'};color:${done?'#fff':'var(--text-3)'}">${done?'✓':idx+1}</div>
            <div class="lli-info" onclick="learnModule.openLesson('${topic.id}','${lesson.id}')" style="cursor:pointer;flex:1">
              <div class="lli-title">${lesson.title}</div>
              <div class="lli-meta">${lesson.lang==='html'?'HTML/CSS':lesson.lang==='python-sim'?'Python':'JavaScript'}</div>
            </div>
            <div style="display:flex;align-items:center;gap:0.3rem">
              <span onclick="learnModule.openLesson('${topic.id}','${lesson.id}')" style="color:${topic.color};font-size:0.8rem;cursor:pointer">${done?'Completed ✦':'Start →'}</span>
              ${isCustom?`<button onclick="learnModule.openLessonModal('${topic.id}','${lesson.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.8rem;padding:0.15rem 0.3rem" title="Edit">✎</button>
              <button onclick="learnModule.deleteLesson('${topic.id}','${lesson.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.85rem;padding:0.15rem 0.3rem" title="Delete">✕</button>`:''}
            </div>
          </div>`;
        }).join(''):'<p class="empty-hint">No lessons yet. Add your first one!</p>'}
      </div>`;
  },

  openTopicModal(id=null) {
    this.editingTopicId=id;
    const t=id?this.customTopics.find(t=>t.id===id):null;
    document.getElementById('topicModalTitle').textContent=t?'Edit Topic':'New Topic ✦';
    document.getElementById('topicTitleInput').value=t?t.title:'';
    document.getElementById('topicIconInput').value=t?t.icon:'📚';
    document.getElementById('topicColorInput').value=t?t.color:'#c8b4e8';
    document.getElementById('topicModal').classList.remove('hidden');
    setTimeout(()=>document.getElementById('topicTitleInput')?.focus(),80);
  },
  closeTopicModal(){document.getElementById('topicModal').classList.add('hidden');this.editingTopicId=null;},
  saveTopic(){
    const title=document.getElementById('topicTitleInput').value.trim();
    if(!title){showToast('Enter a topic title');return;}
    const icon=document.getElementById('topicIconInput').value.trim()||'📚';
    const color=document.getElementById('topicColorInput').value||'#c8b4e8';
    if(this.editingTopicId){const t=this.customTopics.find(t=>t.id===this.editingTopicId);if(t){t.title=title;t.icon=icon;t.color=color;}}
    else{this.customTopics.push({id:'custom-'+Date.now(),title,icon,color,builtin:false,lessons:[]});}
    this.saveCustom();this.closeTopicModal();this.renderTopics();
    showToast(this.editingTopicId?'Topic updated ✦':'Topic created ✦');
  },
  deleteTopic(id){
    if(!confirm('Delete this topic and all its lessons?'))return;
    this.customTopics=this.customTopics.filter(t=>t.id!==id);
    this.saveCustom();this.renderTopics();showToast('Topic deleted');
  },

  openLessonModal(topicId,lessonId=null){
    this.editingTopicId=topicId;this.editingLessonId=lessonId||null;
    const topic=this.customTopics.find(t=>t.id===topicId);
    const lesson=lessonId?topic?.lessons.find(l=>l.id===lessonId):null;
    document.getElementById('lessonModalTitle').textContent=lesson?'Edit Lesson':'New Lesson ✦';
    document.getElementById('lessonTitleInput').value=lesson?lesson.title:'';
    document.getElementById('lessonLangInput').value=lesson?(lesson.lang||'javascript'):'javascript';
    document.getElementById('lessonTheoryInput').value=lesson?(lesson.theory||''):'';
    document.getElementById('lessonStarterInput').value=lesson?(lesson.starterCode||''):'// Write your code here\nconsole.log("Hello, World!");';
    document.getElementById('lessonChallengeInput').value=lesson?(lesson.challenge||''):'';
    document.getElementById('lessonHintInput').value=lesson?(lesson.hint||''):'';
    document.getElementById('lessonSolutionInput').value=lesson?(lesson.solution||''):'';
    document.getElementById('lessonModal').classList.remove('hidden');
    setTimeout(()=>document.getElementById('lessonTitleInput')?.focus(),80);
  },
  closeLessonModal(){document.getElementById('lessonModal').classList.add('hidden');this.editingTopicId=null;this.editingLessonId=null;},
  saveLesson(){
    const title=document.getElementById('lessonTitleInput').value.trim();
    if(!title){showToast('Enter a lesson title');return;}
    const topic=this.customTopics.find(t=>t.id===this.editingTopicId);if(!topic)return;
    const ld={id:this.editingLessonId||'lesson-'+Date.now(),title,lang:document.getElementById('lessonLangInput').value,
      theory:document.getElementById('lessonTheoryInput').value||`# ${title}\n\nYour lesson content here.`,
      starterCode:document.getElementById('lessonStarterInput').value||'// Start coding here\nconsole.log("Hello!");',
      challenge:document.getElementById('lessonChallengeInput').value||'Complete the code above.',
      hint:document.getElementById('lessonHintInput').value||'Check the theory above for clues!',
      solution:document.getElementById('lessonSolutionInput').value||''};
    if(this.editingLessonId){const idx=topic.lessons.findIndex(l=>l.id===this.editingLessonId);if(idx>=0)topic.lessons[idx]=ld;}
    else{topic.lessons.push(ld);}
    this.saveCustom();this.closeLessonModal();
    const t=this.allTopics.find(t=>t.id===this.editingTopicId);if(t)this.renderLessonList(t);
    showToast(this.editingLessonId?'Lesson updated ✦':'Lesson added ✦');
  },
  deleteLesson(topicId,lessonId){
    if(!confirm('Delete this lesson?'))return;
    const topic=this.customTopics.find(t=>t.id===topicId);if(!topic)return;
    topic.lessons=topic.lessons.filter(l=>l.id!==lessonId);
    delete this.completed[topicId+':'+lessonId];
    localStorage.setItem('lumiere_learn_completed',JSON.stringify(this.completed));
    this.saveCustom();this.renderLessonList(topic);showToast('Lesson deleted');
  },

  openLesson(topicId,lessonId){
    const topic=this.allTopics.find(t=>t.id===topicId);
    const lesson=topic?.lessons.find(l=>l.id===lessonId);
    if(!topic||!lesson)return;
    this.currentTopic=topic;this.currentLesson=lesson;
    document.getElementById('learnTopicsView').classList.add('hidden');
    document.getElementById('learnLessonView').classList.remove('hidden');
    document.getElementById('learnLessonTitle').textContent=lesson.title;
    document.getElementById('learnTopicBadge').textContent=topic.icon+' '+topic.title;
    document.getElementById('learnTopicBadge').style.color=topic.color;
    // Render rich theory
    document.getElementById('learnTheory').innerHTML=renderTheory(lesson.theory||'');
    const editor=document.getElementById('learnCodeEditor');
    editor.value=lesson.starterCode||'';
    editor.setAttribute('data-lang',lesson.lang||'javascript');
    const langLabel={html:'HTML','python-sim':'Python',javascript:'JavaScript'};
    document.getElementById('learnLangBadge').textContent=langLabel[lesson.lang]||'JavaScript';
    document.getElementById('learnChallenge').innerHTML=`<strong>🎯 Challenge:</strong> ${lesson.challenge||'Complete the code above.'}`;
    document.getElementById('learnOutput').innerHTML='<span style="color:#666;font-size:0.85rem">Click ▶ Run (or Ctrl+Enter)</span>';
    document.getElementById('learnHintBox').classList.add('hidden');
    document.getElementById('learnNextBtn').classList.add('hidden');
    document.getElementById('learnPreviewPanel').style.display='none';
    document.getElementById('learnOutputPanel').style.display='flex';
    const idx=topic.lessons.findIndex(l=>l.id===lessonId);
    document.getElementById('learnNextBtn').textContent=idx<topic.lessons.length-1?'Next Lesson →':'Back to Topics';
  },

  runCode(){
    const editor=document.getElementById('learnCodeEditor'),code=editor.value,lang=editor.getAttribute('data-lang')||'javascript';
    const output=document.getElementById('learnOutput');output.innerHTML='';
    if(lang==='html'){this.updateHTMLPreview(code);output.innerHTML='<span style="color:#6abf7b;font-size:0.85rem">✓ Preview updated →</span>';this.markComplete();return;}
    if(lang==='python-sim'){
      try{const r=simulatePython(code);output.innerHTML=r.split('\n').map(l=>`<div class="out-line">${escHtml(l)}</div>`).join('');}
      catch(e){output.innerHTML=`<div class="out-error">Error: ${e.message}</div>`;}
      this.markComplete();return;
    }
    const logs=[],_l=console.log,_e=console.error,_w=console.warn,_i=console.info;
    const cap=t=>(...a)=>{const text=a.map(x=>{try{return typeof x==='object'&&x!==null?JSON.stringify(x,null,2):String(x);}catch(e){return String(x);}}).join(' ');logs.push({t,text});};
    console.log=cap('log');console.error=cap('error');console.warn=cap('warn');console.info=cap('info');
    try{const r=new Function(code)();if(r!==undefined)logs.push({t:'return',text:'← '+String(r)});}
    catch(e){logs.push({t:'error',text:e.message});}
    finally{console.log=_l;console.error=_e;console.warn=_w;console.info=_i;}
    if(!logs.length){output.innerHTML='<div class="out-ok">✓ Ran with no output.</div>';}
    else{const cls={log:'out-line',error:'out-error',warn:'out-warn',return:'out-return',info:'out-info'};
      output.innerHTML=logs.map(l=>`<div class="${cls[l.t]||'out-line'}">${escHtml(l.text)}</div>`).join('');}
    this.markComplete();
  },
  updateHTMLPreview(code){
    const p=document.getElementById('learnHTMLPreview');if(p)p.srcdoc=code;
    document.getElementById('learnOutputPanel').style.display='none';
    document.getElementById('learnPreviewPanel').style.display='flex';
  },
  resetCode(){
    if(!this.currentLesson)return;
    document.getElementById('learnCodeEditor').value=this.currentLesson.starterCode||'';
    document.getElementById('learnOutput').innerHTML='<span style="color:#666;font-size:0.85rem">Code reset.</span>';
    document.getElementById('learnPreviewPanel').style.display='none';
    document.getElementById('learnOutputPanel').style.display='flex';
  },
  showHint(){
    const box=document.getElementById('learnHintBox');box.classList.toggle('hidden');
    if(!box.classList.contains('hidden')&&this.currentLesson)
      box.innerHTML=`<span style="font-size:0.85rem;color:var(--text-2)">💡 <strong>Hint:</strong> ${this.currentLesson.hint||'Review the theory above!'}</span>`;
  },
  showSolution(){
    if(!this.currentLesson)return;
    if(!this.currentLesson.solution){showToast('No solution for this lesson.');return;}
    if(!confirm('Show the solution? Try first! 🌸'))return;
    document.getElementById('learnCodeEditor').value=this.currentLesson.solution;
    this.runCode();
  },
  clearOutput(){
    document.getElementById('learnOutput').innerHTML='';
    document.getElementById('learnPreviewPanel').style.display='none';
    document.getElementById('learnOutputPanel').style.display='flex';
  },
  markComplete(){
    if(!this.currentTopic||!this.currentLesson)return;
    const key=this.currentTopic.id+':'+this.currentLesson.id;
    this.completed[key]=true;
    localStorage.setItem('lumiere_learn_completed',JSON.stringify(this.completed));
    document.getElementById('learnNextBtn').classList.remove('hidden');
  },
  nextLesson(){
    if(!this.currentTopic||!this.currentLesson){this.showTopics();return;}
    const idx=this.currentTopic.lessons.findIndex(l=>l.id===this.currentLesson.id);
    if(idx<this.currentTopic.lessons.length-1)this.openLesson(this.currentTopic.id,this.currentTopic.lessons[idx+1].id);
    else this.showTopics();
  },
  showTopics(){
    document.getElementById('learnTopicsView').classList.remove('hidden');
    document.getElementById('learnLessonView').classList.add('hidden');
    this.renderTopics();
  }
};
