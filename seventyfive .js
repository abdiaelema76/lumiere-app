// ============================================================
// LUMIÈRE — seventyfive.js  (complete, clean version)
// 75 Hard tracker + Content Creator (TikTok & LinkedIn)
// Schedule: sleep 5am–11am · day starts 11am · work 9pm–5am
// ============================================================

// ─────────────────────────────────────────
// STORAGE HELPERS
// ─────────────────────────────────────────
const SF_KEY      = 'lumiere_75hard';
const CONTENT_KEY = 'lumiere_content';

function sf_load()  { return JSON.parse(localStorage.getItem(SF_KEY)      || '{"startDate":null,"currentDay":1,"completedDays":[],"checklists":{}}'); }
function sf_save(d) { localStorage.setItem(SF_KEY, JSON.stringify(d)); }
function ct_load()  { return JSON.parse(localStorage.getItem(CONTENT_KEY) || '{"posted":{}}'); }
function ct_save(d) { localStorage.setItem(CONTENT_KEY, JSON.stringify(d)); }

// ─────────────────────────────────────────
// DAILY SCHEDULE  (sleep 5am–11am, day starts 11am, work 9pm–5am)
// ─────────────────────────────────────────
const DAILY_SCHEDULE = [
  { time:'5:00 AM',            icon:'😴', act:'Straight to bed — shift just ended',        det:'Go directly to bed after your shift ends. No phone, no food. Your body needs this rest.' },
  { time:'5:00 AM – 11:00 AM', icon:'💤', act:'Sleep (6 hours — protected)',               det:'Phone on Do Not Disturb. Curtains closed. Do not cut this short. This is non-negotiable recovery.' },
  { time:'11:00 AM',           icon:'☀️', act:'Wake up · Water · Supplements',             det:'Drink 500ml water immediately. Take Vitamin D3 + K2 + Omega-3. Gentle 5-min stretch in bed.' },
  { time:'11:00 – 11:30 AM',   icon:'🚿', act:'Bath + Get ready',                          det:'Take your time. No rush. Keep drinking water.' },
  { time:'11:30 AM',           icon:'🍽️', act:'Break fast — Meal 1 (eating window opens)', det:'Follow your meal planner. Protein + slow carb + greens. Take Inositol with food. Eating window: 11:30am–7:30pm.' },
  { time:'12:00 – 2:00 PM',    icon:'💻', act:'JS + Node Study Block (2 hours)',           det:'Follow today\'s exact plan. Pomodoro: 50 min study, 10 min break. Phone face down. Most important block of your day.' },
  { time:'2:00 – 2:30 PM',     icon:'📖', act:'Read 10 pages',                             det:'Current book from your reading list. No social media. This replaces every scroll urge.' },
  { time:'2:30 – 3:00 PM',     icon:'✨', act:'Business / Job Applications (30 min)',      det:'Odd days: apply to 3 jobs on Andela, Turing, LinkedIn, Remote OK. Even days: fashion brand work — Instagram, research, suppliers.' },
  { time:'3:00 – 3:30 PM',     icon:'🚶', act:'30 min outdoor walk',                      det:'Fresh air and sunlight. PCOS medicine. Walk at a comfortable pace. First workout of the day.' },
  { time:'3:30 – 4:00 PM',     icon:'🍎', act:'Snack + Water check',                      det:'Apple + peanut butter, yogurt + nuts, or boiled egg + carrot. Check water — should be at 2L by now.' },
  { time:'4:00 – 4:30 PM',     icon:'🧘', act:'Yoga / Stretching (20 min)',               det:'PCOS-friendly yoga on YouTube. Second movement of the day. Done for movement.' },
  { time:'4:30 – 5:00 PM',     icon:'✅', act:'Daily checklist + Journal',                det:'Tick every item. Write 3 sentences in your journal. Plan tomorrow\'s coding topic.' },
  { time:'5:00 – 5:30 PM',     icon:'📣', act:'Post on TikTok + LinkedIn',                det:'Open the Content section. Copy today\'s post. Add your own voice. Post on both platforms. Building audience daily.' },
  { time:'6:30 – 7:30 PM',     icon:'🍽️', act:'Last meal (eating window closes at 7:30pm)',det:'Follow your meal planner. Balanced, not heavy. After 7:30pm: water and herbal tea only until 11:30am tomorrow.' },
  { time:'7:30 – 9:00 PM',     icon:'😴', act:'Rest / Nap before shift',                  det:'Take Magnesium before this rest. Recharge before your 9pm shift. Phone away.' },
  { time:'8:30 PM',            icon:'🌙', act:'Get ready for work',                        det:'Wake from rest. Get ready. Pack 3L water for the shift. Quick glance at today\'s coding notes.' },
  { time:'9:00 PM – 5:00 AM',  icon:'💼', act:'Work shift',                               det:'During breaks: review JS flashcards, read 5 pages, practise interview questions mentally. Keep a notebook for concepts.' },
];

// ─────────────────────────────────────────
// CHECKLIST ITEMS
// ─────────────────────────────────────────
const CHECKLIST = [
  { id:'meal',    label:'🌸 Followed PCOS meal plan — no sugar, no processed food',       cat:'PCOS'   },
  { id:'water',   label:'💧 Drank 3 litres of water throughout the day',                  cat:'PCOS'   },
  { id:'walk',    label:'🚶 30 min outdoor walk done (3:00pm)',                            cat:'Walk'   },
  { id:'yoga',    label:'🧘 20 min yoga or stretching done (4:00pm)',                     cat:'Move'   },
  { id:'code',    label:'💻 2 hours JS + Node studied — followed today\'s exact plan',    cat:'JS'     },
  { id:'book',    label:'📖 Read 10 pages of current book — no social media',             cat:'Book'   },
  { id:'biz',     label:'✨ 30 min business or job application work done (2:30pm)',       cat:'Biz'    },
  { id:'supps',   label:'💊 All supplements taken (Vit D3, K2, Magnesium, Inositol)',     cat:'PCOS'   },
  { id:'social',  label:'📵 No mindless social media scrolling today',                    cat:'Focus'  },
  { id:'journal', label:'📝 Journaled 3 sentences + planned tomorrow\'s topic (4:30pm)', cat:'Journal'},
  { id:'github',  label:'💻 Committed code to GitHub today',                              cat:'GitHub' },
  { id:'content', label:'📣 Posted on TikTok + LinkedIn today (5:00pm)',                 cat:'Content'},
];

// ─────────────────────────────────────────
// 75-DAY PLAN
// ─────────────────────────────────────────
const DAYS_75 = [
  {day:1, week:1, topic:'JS Setup + Variables', study:'Install VS Code and Node.js. Create your first .js file. Learn var, let, const — when to use each and why. Write 10 examples. Push to GitHub.', build:'Hello World app + 10 variables examples file', interview:'What is the difference between var, let, and const?', job:'Set up LinkedIn headline: JavaScript Developer | Node.js | Open to Remote. Connect with 5 Kenyan developers.', book:'Eloquent JavaScript Ch.1 (free at eloquentjavascript.net)', biz:'Research 5 fashion brands on Instagram selling in Kenya. Note their price, audience, and content style.'},
  {day:2, week:1, topic:'Data Types + Operators', study:'Strings, numbers, booleans, null, undefined, typeof. String methods: .length .toUpperCase() .includes() .slice() .split(). Template literals.', build:'String formatter function — takes a name and returns a personalised greeting sentence', interview:'What is type coercion? What is == vs ===?', job:'Apply to 3 jobs on Fuzu.com — search "JavaScript developer"', book:'Eloquent JavaScript Ch.2', biz:'Write your fashion brand name ideas — at least 10. Pick top 3.'},
  {day:3, week:1, topic:'Functions', study:'Function declarations vs expressions vs arrow functions. Parameters, return values, default parameters. What the call stack is.', build:'5 pure functions from memory: add, multiply, greet, isEven, reverseString', interview:'What is the difference between a function declaration and a function expression?', job:'Apply to 3 jobs on Remote OK — search "Node.js junior"', book:'Eloquent JavaScript Ch.3', biz:'Research suppliers — visit Gikomba or Eastleigh market pages online. Note prices.'},
  {day:4, week:1, topic:'Arrays', study:'Create, access, modify arrays. Methods: push, pop, shift, unshift, splice, slice, indexOf, includes, join, forEach. The splice vs slice difference is a common interview trap.', build:'Array of 10 items — run every single method and write what each one returns', interview:'Explain the difference between slice and splice in JavaScript.', job:'Post on LinkedIn: "Day 4 of my JavaScript learning journey"', book:'Eloquent JavaScript Ch.4', biz:'Create a Canva account. Draft 3 different logo concepts.'},
  {day:5, week:1, topic:'Objects', study:'Object literals, dot notation, bracket notation, methods inside objects. Object.keys() Object.values() Object.entries(). Destructuring assignment.', build:'Student object with name, age, grades array, and a working getAverage() method', interview:'What is destructuring in JavaScript? Write an example.', job:'Apply to 3 jobs on LinkedIn — filter Remote and JavaScript', book:'Eloquent JavaScript Ch.5', biz:'Find 3 direct competitors. Write their product, price, audience, and one weakness.'},
  {day:6, week:1, topic:'Loops + Conditionals', study:'for, while, do-while loops. if/else, ternary operator, switch. break and continue. When to use each.', build:'FizzBuzz from scratch without looking it up. Then a grade calculator (A/B/C/D/F).', interview:'Explain the ternary operator with a real example.', job:'Connect with 5 developers on LinkedIn based in Kenya or Africa', book:'Eloquent JavaScript Ch.6', biz:'Set up an Instagram Business account. Write your bio. Post one introduction story.'},
  {day:7, week:1, topic:'Week 1 Review + Mini Project', study:'Review all of days 1–6. Redo the concept that feels least clear. JS fundamentals are your foundation — they must be solid.', build:'Number guessing game that runs in the Node.js terminal — computer picks, user guesses', interview:'Practise out loud: explain var vs let vs const. Record yourself for 2 minutes.', job:'Apply to 3 jobs on Andela.com — start the registration and vetting process today', book:'Eloquent JavaScript — re-read the chapter you found hardest', biz:'Write a 1-page summary of your niche: what you sell, who buys it, why they need it.'},
  {day:8, week:2, topic:'Scope + Hoisting', study:'Global scope, function scope, block scope. How hoisting works differently for var vs let. The temporal dead zone. Real bugs this causes.', build:'5 code examples demonstrating scope — predict the output before running each one', interview:'What is hoisting in JavaScript? Give a concrete example.', job:'Update your GitHub profile — add a bio, profile photo, and pin your best project', book:"You Don't Know JS — Scope & Closures Ch.1 (free on GitHub)", biz:"Commit to your fashion brand niche today. Write: what you sell, who buys it, your price range."},
  {day:9, week:2, topic:'Closures', study:'What a closure is and why it exists. Counter function example. makeMultiplier example. Module pattern. This is asked in almost every JS interview.', build:'Counter using closures. makeMultiplier(x) function that returns a multiplier function.', interview:'Explain closures to me as if I am not a developer.', job:'Apply to 3 jobs on Turing.com — register and start the technical vetting process', book:"You Don't Know JS — Scope & Closures Ch.2", biz:'Create a mood board for your brand aesthetic on Pinterest or Canva.'},
  {day:10, week:2, topic:'Higher Order Functions', study:'map() filter() reduce() — understand each deeply, not just the syntax. When to use which. How to chain them. These appear in every real JS codebase.', build:'Array of products: map to add 16% VAT, filter under KSh 5000, reduce to get total', interview:'Explain the difference between map and forEach. When would you choose one over the other?', job:'Write your 90-second "tell me about yourself" pitch. Write it down then say it 5 times aloud.', book:"You Don't Know JS — Scope & Closures Ch.3", biz:'Research Instagram pricing — what do similar Kenyan fashion brands actually charge?'},
  {day:11, week:2, topic:'Callbacks', study:'What a callback is. Synchronous vs asynchronous callbacks. Error-first callbacks in Node.js. Why callbacks existed before Promises.', build:'doLater(fn, delay) function. Simple event system with on() and emit() using callbacks.', interview:'What is a callback function? What problem does it solve?', job:'Apply to 3 jobs on We Work Remotely — Programming section', book:"You Don't Know JS — Scope & Closures Ch.4", biz:"Write your brand's Instagram bio. Short, clear: who you serve, what you sell, how to buy."},
  {day:12, week:2, topic:'Promises', study:'What a Promise is. The 3 states: pending, fulfilled, rejected. .then() .catch() .finally(). Promise.all(). Why Promises replaced callbacks.', build:'Fetch 3 users from JSONPlaceholder API using Promises. Display names and emails.', interview:'Explain the 3 states of a Promise and what triggers each.', job:'Register on Braintrust.co and complete your profile', book:"You Don't Know JS — Closures & Scope Ch.5", biz:'Post your first Instagram content — brand introduction. No products needed yet.'},
  {day:13, week:2, topic:'Async / Await', study:'async keyword. await keyword. try/catch/finally with async/await. Converting a Promise chain to async/await. Proper error handling patterns.', build:'Rewrite your Day 12 API fetch using async/await with full error handling', interview:'What is async/await? How does it relate to Promises?', job:'Apply to 3 jobs on LinkedIn — filter Remote, JavaScript, Junior', book:'The $100 Startup — Ch.1–2', biz:'Research the full cost to start your fashion brand with 10 products. Write every number.'},
  {day:14, week:2, topic:'Week 2 Review + Weather App', study:'Review closures, higher order functions, Promises, async/await. These 4 topics = about 60% of JS interviews.', build:'Weather app using async/await + free OpenWeather API. Show city, temperature, description.', interview:'Do 2 LeetCode Easy problems — arrays or strings category', job:'Connect with 10 Kenyan or African tech professionals on LinkedIn today', book:'The $100 Startup — Ch.3–4', biz:'Write a simple 1-page business plan: product, target customer, price, how you will sell.'},
  {day:15, week:3, topic:'The Event Loop', study:'Call stack, heap, Web APIs, callback queue, event loop. How JavaScript handles async code. Why JS is single-threaded but non-blocking. Top 5 interview question.', build:'Write 5 tricky async examples and predict the console.log order before running each.', interview:'Explain the JavaScript event loop in your own words. Draw it if you can.', job:'Apply to 3 jobs on Andela — complete their technical assessment if you started it', book:'The $100 Startup — Ch.5–6', biz:'Write a detailed product catalogue — imaginary products are fine. Name, description, price.'},
  {day:16, week:3, topic:'DOM Manipulation', study:'getElementById, querySelector, querySelectorAll. innerHTML, textContent. createElement, appendChild, removeChild. addEventListener.', build:'To-do list that runs in the browser — add items, mark complete, delete. Pure HTML/CSS/JS.', interview:'What is the DOM? How does JavaScript interact with it?', job:'Post on LinkedIn sharing one specific thing you learned this week', book:'The $100 Startup — Ch.7–8', biz:'Post 2nd Instagram content — brand aesthetic with a quote or mood image.'},
  {day:17, week:3, topic:'Error Handling', study:'try/catch/finally blocks. throw new Error(). Custom error classes. Error types: SyntaxError, TypeError, ReferenceError. Defensive coding habits.', build:'Add proper error handling to your to-do app — handle empty input and edge cases', interview:'What is the difference between a SyntaxError and a TypeError?', job:'Apply to 3 jobs on Shortlist.co — good Kenyan tech startup roles', book:'The $100 Startup — Ch.9–10', biz:'Find 3 suppliers on WhatsApp groups or Instagram. Message at least one for prices.'},
  {day:18, week:3, topic:'ES6+ Modern Syntax', study:'Spread operator (...), rest parameters, optional chaining (?.), nullish coalescing (??), object shorthand, computed properties, destructuring in function params.', build:'Refactor your entire to-do app from Day 16 using modern ES6+ syntax throughout', interview:'What is optional chaining (?.) and why is it useful? Show an example.', job:'Research Andela pay rates for junior JavaScript developers', book:'The $100 Startup — Ch.11–12', biz:"Design a simple clean logo on Canva. Done beats perfect."},
  {day:19, week:3, topic:'Modules (import/export)', study:'CommonJS: require() and module.exports. ES Modules: import and export. Default vs named exports. When to use which. Why modules matter.', build:'Refactor your to-do app into 3 separate modules: ui.js, data.js, app.js', interview:'Explain CommonJS modules vs ES Modules. What is the difference?', job:'Apply to 3 jobs on Remote OK', book:'The $100 Startup — Ch.13–14', biz:"Write your brand's About section — your story and why you started."},
  {day:20, week:3, topic:'Local Storage + JSON', study:'localStorage.setItem() getItem() removeItem(). JSON.stringify() and JSON.parse(). Persisting state in the browser.', build:'Update to-do app so all items survive a page refresh — data persists in localStorage', interview:'What is JSON? Why do we use JSON.stringify and JSON.parse?', job:'Apply to 3 jobs on BrighterMonday Kenya', book:'The $100 Startup — Ch.15–16', biz:'Post 3rd Instagram content. Commit to posting minimum every 3 days.'},
  {day:21, week:3, topic:'Week 3 Review + Portfolio Plan', study:'Review event loop, DOM, modules, localStorage. Start planning your portfolio website structure.', build:'Begin portfolio: name, hero section, about, skills, projects placeholder, contact. Pure HTML/CSS/JS.', interview:'Do 2 LeetCode Easy problems — string manipulation', job:'Apply to 3 jobs on LinkedIn', book:'The $100 Startup — Ch.17–18', biz:'Review your brand research. List the 3 most important next steps.'},
  {day:22, week:4, topic:'Node.js Introduction', study:'What Node.js is. How it differs from browser JS. The Node REPL. Built-in modules: fs (read/write files), path, os.', build:'Node.js script that reads a text file, counts the words, and prints the result', interview:'What is Node.js and why is it good for building backend services?', job:'Connect with 10 more developers on LinkedIn — leave a genuine comment on one of their posts', book:'Rework — Ch.1–3', biz:'Research: does your brand need a website from day 1? What pages should it have?'},
  {day:23, week:4, topic:'NPM + Package Management', study:'npm init and what package.json is. Installing packages. devDependencies vs dependencies. node_modules. .gitignore. Semantic versioning (^, ~).', build:'Proper Node.js project with npm. Install nodemon. Configure start script. Run with auto-reload.', interview:'What is npm? What does ^ mean in a version number like ^1.2.3?', job:'Apply to 3 jobs on Turing.com', book:'Rework — Ch.4–6', biz:'Reserve your brand name: register the Instagram handle and check domain on Namecheap.'},
  {day:24, week:4, topic:'Express.js Setup', study:'Install Express. Create a basic server. Routes with app.get() app.post() app.put() app.delete(). The req and res objects. Sending JSON responses.', build:'Express server with 5 routes: GET /, GET /about, GET /users, POST /users, GET /users/:id', interview:'What is middleware in Express.js? What does it do?', job:'Review your LinkedIn — add all projects and skills so far', book:'Rework — Ch.7–9', biz:'Post 4th Instagram content. Engage with at least 20 accounts in your target audience.'},
  {day:25, week:4, topic:'Middleware', study:'What middleware is. express.json() for parsing request bodies. Writing custom middleware. The next() function. Error handling middleware. Why order matters.', build:'Add 3 middleware functions to your Day 24 server: a logger, an auth checker, an error handler', interview:'Explain what next() does in Express middleware.', job:'Apply to 3 jobs on Andela', book:'Rework — Ch.10–12', biz:'Write a price list: cost price, markup percentage, and final sale price for 5 products.'},
  {day:26, week:4, topic:'REST API Design', study:'REST principles. HTTP methods and when to use each. Status codes: 200 201 400 401 403 404 500. URL naming conventions. What makes an API RESTful.', build:'Full REST API for a product catalogue — list all, get one, create, update, delete', interview:'What is a RESTful API? What status code do you return when creating a resource?', job:'Record yourself answering "Tell me about yourself" — watch it back', book:'Rework — Ch.13–15', biz:"Post 5th Instagram. Try a 'behind the scenes' post."},
  {day:27, week:4, topic:'Postman + API Testing', study:'Download and set up Postman. Test all routes. Understand request headers, body types, query parameters, path parameters. Save as a collection.', build:'Test all 5 CRUD routes from Day 26 in Postman. Save the collection. Screenshot every working route.', interview:'How do you test an API when there is no frontend yet?', job:'Apply to 3 jobs on We Work Remotely', book:'Rework — Ch.16–18', biz:'Research: Jumia seller account vs Instagram DMs vs your own website. Compare costs.'},
  {day:28, week:4, topic:'Week 4 Review + Books API', study:'Review Node.js, npm, Express, REST. Fix any gaps. You should be able to build an Express server from memory.', build:'Complete books API from scratch without looking at previous code — all CRUD routes working', interview:'Do 2 LeetCode Easy problems — arrays', job:'Apply to 3 jobs on Remote OK', book:'Rework — Ch.19–21', biz:'Post 6th Instagram. Review which content got most engagement.'},
  {day:29, week:5, topic:'MongoDB Introduction', study:'What MongoDB is. Documents vs collections vs SQL tables. MongoDB Atlas free cloud setup. mongosh shell. Basic CRUD in Atlas.', build:'MongoDB Atlas account. Create a database. Add 5 documents manually using the Atlas UI.', interview:'What is the difference between a SQL database and a NoSQL database?', job:'Apply to 3 jobs on LinkedIn — filter Node.js backend developer', book:"You Don't Know JS — this/Object Prototypes Ch.1", biz:'Write your first product description that sounds desirable, not just factual.'},
  {day:30, week:5, topic:'Mongoose ODM', study:'Install mongoose. Connect to MongoDB. Define Schema and Model. CRUD: find() findById() save() findByIdAndUpdate() findByIdAndDelete().', build:'Connect your Day 26 products API to MongoDB using Mongoose — replace the in-memory array', interview:'What is an ODM? What does Mongoose add on top of the raw MongoDB driver?', job:'Apply to 3 jobs on Fuzu.com', book:"You Don't Know JS — this/Object Prototypes Ch.2", biz:'Post 7th Instagram. Show an inspiration image with your brand colours.'},
  {day:31, week:5, topic:'Environment Variables', study:'.env files and the dotenv package. process.env to access variables. Never commit .env to GitHub. Separate .env for dev vs production.', build:'Move your MongoDB URI, PORT, and JWT secret to .env. Confirm .env is in .gitignore. Push.', interview:'Why should you never commit a .env file to GitHub?', job:'Apply to 3 jobs on Turing.com', book:"You Don't Know JS — this/Object Prototypes Ch.3", biz:'Research Instagram ads — minimum budget, targeting Nairobi women aged 20–35.'},
  {day:32, week:5, topic:'JWT Authentication', study:'Authentication vs authorisation. JWT tokens: header, payload, signature. jsonwebtoken package. Generating tokens on login. Verifying tokens on protected routes.', build:'POST /login route that validates credentials and returns a signed JWT token on success', interview:'What is a JWT? What are its 3 parts?', job:'Message 3 developers or recruiters on LinkedIn for a virtual coffee chat', book:"You Don't Know JS — this/Object Prototypes Ch.4", biz:'Post 8th Instagram. Ask a question in the caption — it drives comments.'},
  {day:33, week:5, topic:'Password Hashing — bcrypt', study:'Never store plain text passwords. Salting and hashing with bcrypt. bcrypt.hash() and bcrypt.compare(). Salt rounds. Full user registration flow.', build:'POST /register: hash password with bcrypt, save user to MongoDB, return JWT', interview:'What is bcrypt? What is salting and why is it important?', job:'Apply to 3 jobs on Andela', book:'Node.js Design Patterns — Ch.1', biz:'Create a WhatsApp Business account for your brand. Add a product catalogue.'},
  {day:34, week:5, topic:'Protected Routes', study:'Auth middleware that extracts and verifies JWT from the Authorization header. 401 Unauthorized vs 403 Forbidden. Protecting specific routes.', build:'Auth middleware added — only logged-in users can create, update, or delete products', interview:'How do you protect a route in Express using JWT middleware?', job:'Update the README on your main GitHub project — add screenshots', book:'Node.js Design Patterns — Ch.2', biz:'Post 9th Instagram. Ask your followers to share.'},
  {day:35, week:5, topic:'Week 5 Review + Full Auth API', study:'Review MongoDB, Mongoose, JWT, bcrypt, protected routes. This stack is in 80% of all Node.js job descriptions. Build from memory.', build:'Complete authenticated API from scratch: register, login, protected CRUD — portfolio ready', interview:'Walk me through how you would build a login system from scratch.', job:'Apply to 3 jobs on Remote OK', book:'Node.js Design Patterns — Ch.3', biz:'Calculate: if you sold 20 products at your price — what is your monthly profit?'},
  {day:36, week:6, topic:'Error Handling in APIs', study:'Global error handling middleware. Custom error classes. Consistent error format: { success: false, message: "..." }. The express-async-errors package.', build:'Professional error handling added — every route returns a consistent error format', interview:'How do you handle async errors in Express without try/catch everywhere?', job:'Apply to 3 jobs — send Andela your portfolio link if assessment complete', book:'Node.js Design Patterns — Ch.4', biz:'Post 10th Instagram. Double down on whatever type of content got most engagement.'},
  {day:37, week:6, topic:'Input Validation', study:'Why you must validate input on the server. express-validator or joi. Validating body, params, query. Returning helpful specific error messages.', build:'Full validation added — emails must be valid, passwords min 8 chars, names required', interview:'Why is server-side input validation important even when you have frontend validation?', job:'Apply to 3 jobs on LinkedIn', book:'Node.js Design Patterns — Ch.5', biz:'Research the Mpesa Daraja API — you will need this for payments on your future website.'},
  {day:38, week:6, topic:'Pagination + Filtering', study:'Why you never return all records at once. skip() and limit(). Query params: ?page=1&limit=10. Filtering by field. Returning total count.', build:'Pagination and filtering added: GET /products?page=1&limit=5&category=shoes&sort=price', interview:'How would you implement pagination in a Node.js REST API?', job:'Post on LinkedIn about your API project — show a Postman screenshot', book:'Node.js Design Patterns — Ch.6', biz:'Write a one-page business document: product, target market, pricing, sales channels, 3-month goal.'},
  {day:39, week:6, topic:'File Uploads', study:'The multer package. Handling multipart/form-data. Saving files locally or to Cloudinary (free). File size limits and type validation.', build:'Image upload added to products API — each product can have a photo on Cloudinary', interview:'How do you handle file uploads in Node.js?', job:'Apply to 3 jobs on Braintrust.co', book:'Node.js Design Patterns — Ch.7', biz:"Start 3 Instagram Highlights: 'Products', 'About Us', 'Reviews' — even if empty now."},
  {day:40, week:6, topic:'Deployment — Railway / Render', study:'Deploying your Node.js API to the internet for free. Railway.app or Render.com. Setting production environment variables. Getting a live URL.', build:'Complete auth + products API deployed to Railway or Render. Live URL shared on LinkedIn.', interview:'How would you deploy a Node.js application to production?', job:'Apply to 3 jobs — add your deployed API link to your CV', book:'Building a StoryBrand — Ch.1–2', biz:'Post 11th Instagram. Your brand should be showing a clear identity by now.'},
  {day:41, week:6, topic:'Portfolio Website — Build It', study:'Portfolio is the most important thing for getting hired. Must show: who you are, tech skills, 2–3 projects with live links. Clean, mobile-friendly.', build:'Complete portfolio: About, Skills, 2–3 Projects with live + GitHub links, Contact form', interview:'Be ready to walk an interviewer through every project in 3 minutes', job:'Apply to 3 jobs on Andela — include your portfolio link', book:'Building a StoryBrand — Ch.3–4', biz:'Post 12th Instagram. 12 posts means a real credible brand presence.'},
  {day:42, week:6, topic:'Week 6 Review + GitHub Polish', study:'Review all advanced Node.js topics. Every repo needs a good README: what it does, tech stack, how to run it, screenshots.', build:'Write a proper README for every project. Add screenshots. Make them look professional.', interview:'Do 3 LeetCode Easy problems', job:'Apply to 3 jobs on We Work Remotely', book:'Building a StoryBrand — Ch.5–6', biz:'Post 13th Instagram. Try a Reel — they get significantly more reach.'},
  {day:43, week:7, topic:'JS Deep Dive — Closures + Scope', study:'Spend the full 2 hours mastering closures and scope. 10 examples. Explain each one out loud without notes. Most common JS interview topic.', build:'5 closure examples from memory. Explain each one as if teaching a complete beginner.', interview:'Record yourself: "What is a closure and when would you use one?"', job:'Apply to 3 jobs on LinkedIn', book:'Building a StoryBrand — Ch.7–8', biz:'Research which Nairobi market has the best wholesale prices for your product type.'},
  {day:44, week:7, topic:'JS Deep Dive — Async Mastery', study:'Master the event loop, Promises, and async/await together. Draw the event loop from memory. Predict async output order confidently.', build:'5 async code snippets — predict the exact output order of each before running', interview:'Record yourself explaining the event loop. Aim for 3–4 coherent minutes.', job:'Apply to 3 jobs + follow up on any you have not heard from', book:'Building a StoryBrand — Ch.9–10', biz:'Post 14th Instagram. Try another Reel.'},
  {day:45, week:7, topic:'Node Deep Dive — Express + REST', study:'Master Express routing and middleware. Master REST principles and status codes. Build a basic authenticated Express server from memory.', build:'Complete Express REST API from scratch with no notes. Time yourself.', interview:'Record: "Walk me through how you would build a Node.js REST API from scratch."', job:'Apply to 3 jobs on Turing.com', book:'Building a StoryBrand — Ch.11–12', biz:'Reach out to 3 potential customers directly. Ask what they want — not what you want to sell.'},
  {day:46, week:7, topic:'Node Deep Dive — Auth', study:'Master the full JWT auth flow: register → hash → store → login → token → verify → protect. Build it completely from memory.', build:'Full auth system from scratch with no notes. Compare to your Day 35 version.', interview:'Record: "How does JWT authentication work end to end?"', job:'Apply to 3 jobs on Remote OK + update your portfolio', book:'Building a StoryBrand — Ch.13', biz:'Post 15th Instagram. Hint at your first product drop.'},
  {day:47, week:7, topic:'System Design Basics', study:'What happens when you type a URL. DNS, TCP, HTTP request/response. MVC architecture. How a request flows from browser to Node API to database and back.', build:'Draw the full request lifecycle on paper. Redraw from memory until accurate.', interview:'Explain what happens when a user submits the login form on your API.', job:'Apply to 3 jobs on Andela', book:'Cracking the Coding Interview — Ch.1', biz:'Write a 3-month sales target: Month 1: 10 orders. Month 2: 25. Month 3: 50.'},
  {day:48, week:7, topic:'Git + GitHub Mastery', study:'Branching: main, develop, feature branches. Pull requests and code review. git merge vs git rebase. Resolving merge conflicts. Meaningful commit messages.', build:'Create a feature branch, make several commits, open a pull request, merge it cleanly.', interview:'What is the difference between git merge and git rebase?', job:'Apply to 3 jobs + check your Andela application status', book:'Cracking the Coding Interview — Ch.2', biz:'Post 16th Instagram. Share a "coming soon" hint about your first product launch.'},
  {day:49, week:7, topic:'Week 7 Review + Mock Interview', study:'Full 2-hour mock interview. No notes. Cover JS concepts, Node API questions, behavioural questions. Treat it exactly like a real interview.', build:'Answer these out loud: closures, event loop, Promises, REST, JWT, middleware, bcrypt, MongoDB, git, tell me about yourself', interview:'Time yourself: 2 minutes per answer. Record the full session.', job:'Apply to 3 jobs on LinkedIn', book:'Cracking the Coding Interview — Ch.3', biz:"Have you made a sale yet? If not — post a clear 'DM to order' post with price today."},
  {day:50, week:8, topic:'Plan Capstone Project', study:'Plan a real full-stack project: HTML/CSS/JS frontend + Node/Express backend + MongoDB + JWT auth. This is the centrepiece of your portfolio.', build:'Write the full plan: feature list, database schema, API routes, frontend pages — all on paper first', interview:'Be ready to explain your project architecture in an interview', job:'Share your portfolio link on LinkedIn as a post', book:'Cracking the Coding Interview — Ch.4', biz:'Post 17th Instagram. You should be posting consistently every 2–3 days now.'},
  {day:51, week:8, topic:'Capstone — Backend Setup', study:'Initialize project. Set up Express. Connect MongoDB. Set up auth system. Best practices: folder structure, .env, error middleware, input validation.', build:'Backend running with auth, .env, error handling middleware. Folders: routes/ controllers/ models/', interview:'Why do developers separate routes and controllers in Node.js?', job:'Apply to 3 jobs on Braintrust.co', book:'Cracking the Coding Interview — Ch.5', biz:'Order your first small sample stock — even 3–5 pieces to photograph and sell.'},
  {day:52, week:8, topic:'Capstone — Core Features', study:'Build the main features. Each feature = separate route + controller + model. Think through user flow before writing code. Commit to GitHub every hour.', build:'Core CRUD features working and tested in Postman. GitHub has at least 8 commits today.', interview:'Record yourself explaining your project architecture and data flow', job:'Apply to 3 jobs + connect with 5 new developers on LinkedIn', book:'Cracking the Coding Interview — Ch.6', biz:'Post 18th Instagram. Behind-the-scenes of sourcing or preparing your first products.'},
  {day:53, week:8, topic:'Capstone — Frontend', study:'Build HTML/CSS/JS frontend connected to your API. Fetch data and display it. Handle registration, login, and main features. Working beats beautiful.', build:'Frontend live in the browser and connected to your Node API. User can register, login, use the app.', interview:'How does a frontend application communicate with a backend API?', job:'Apply to 3 jobs on LinkedIn', book:'Cracking the Coding Interview — Ch.7', biz:'Take product photos — good natural lighting, clean background, multiple angles.'},
  {day:54, week:8, topic:'Capstone — Deploy + Polish', study:'Deploy backend to Railway or Render. Deploy frontend to Netlify. Connect them. Fix every bug. Write a README.', build:'Capstone fully live with a real URL. Works on mobile. README has screenshots.', interview:'Practise saying "Walk me through this project" smoothly in under 3 minutes.', job:'Apply to 3 jobs + add deployed capstone to portfolio, CV, and LinkedIn', book:'Cracking the Coding Interview — Ch.8', biz:'Post 19th Instagram. Show your actual products with professional photos.'},
  {day:55, week:8, topic:'Second Portfolio Project — Plan', study:'Plan a second, different project. Options: real-time chat, blog, e-commerce demo, or your fashion brand website.', build:'Database schema defined and API routes planned. Backend project initialized.', interview:'Two distinct deployed projects shows range to any employer', job:'Apply to 3 jobs on Andela', book:'Cracking the Coding Interview — Ch.9', biz:"List your first products on Instagram with price and 'DM to order'. Go live."},
  {day:56, week:8, topic:'Week 8 Review', study:'Review your capstone. What would you change? Write down 3 things you would do differently — you will say this in interviews.', build:'Add one meaningful improvement to your capstone: new feature, better errors, or performance fix', interview:'Do 3 LeetCode Easy problems — objects and arrays', job:'Apply to 3 jobs on Remote OK', book:'Cracking the Coding Interview — Ch.10', biz:'Post 20th Instagram. Follow up with everyone who has engaged with your brand.'},
  {day:57, week:9, topic:'CORS + Security Basics', study:'What CORS is and why browsers enforce it. The cors npm package. Helmet.js for secure headers. express-rate-limit for brute force protection.', build:'Add cors, helmet, and express-rate-limit to your capstone with sensible config', interview:'What is CORS? Why do you get a CORS error and how do you fix it?', job:'Apply to 3 jobs on LinkedIn', book:'Node.js Design Patterns — Ch.8', biz:"Follow up with every person who has commented or DM'd about your products. Convert them."},
  {day:58, week:9, topic:'Promise.all + Advanced Async', study:'Promise.all() for parallel requests. Promise.allSettled() when you need all results. Promise.race() for timeouts. When to use parallel vs sequential async.', build:'Endpoint that fetches data from 3 different sources simultaneously using Promise.all', interview:'When would you use Promise.all instead of sequential await calls?', job:'Apply to 3 jobs + post on LinkedIn sharing something you built this week', book:'Node.js Design Patterns — Ch.9', biz:'Post 21st Instagram. Try a tutorial-style post.'},
  {day:59, week:9, topic:'WebSockets Intro', study:'What WebSockets are vs HTTP. socket.io library. Real-time events: emit and on. When to choose WebSockets over REST.', build:'Simple real-time chat app with socket.io — this immediately stands out on a CV', interview:'What is the fundamental difference between HTTP and WebSockets?', job:'Apply to 3 jobs on Turing.com', book:"Building a StoryBrand — reread a key chapter", biz:"Research your competitors' Instagram stories and reels. What is working for them?"},
  {day:60, week:9, topic:'Testing Basics — Jest', study:'Why testing makes you a more professional developer. Jest setup. Unit tests with describe() it() expect(). toBe() toEqual() toThrow(). Testing pure functions.', build:'Jest unit tests for 5 functions in your project. All tests must pass.', interview:'What is unit testing? Why do professional developers write tests?', job:'Apply to 3 jobs + review every pending application and follow up', book:"Building a StoryBrand — reread different chapter", biz:'Post 22nd Instagram. Track which content gets the most saves and shares.'},
  {day:61, week:9, topic:'TypeScript Introduction', study:'What TypeScript is. Why companies adopt it. Basic types: string number boolean array. Interfaces. How TypeScript prevents a whole class of bugs.', build:'Convert one of your Node.js files to TypeScript. Fix all type errors until it compiles.', interview:'What is TypeScript? Why would a team choose it over plain JavaScript?', job:'Apply to 3 jobs on LinkedIn', book:'Eloquent JavaScript — reread the async chapter', biz:'Research how to set up Mpesa Daraja API payments for your future website.'},
  {day:62, week:9, topic:'Performance + Database Indexing', study:'Why slow APIs get rejected. MongoDB createIndex(). The N+1 query problem. Simple caching with node-cache. Measuring response times.', build:'Add an index to your most-queried MongoDB field. Add caching to one endpoint. Measure the difference.', interview:'How would you diagnose and fix a slow API endpoint?', job:'Apply to 3 jobs on Andela', book:"Rework — reread your favourite chapter", biz:'Post 23rd Instagram. Ask your audience a direct question about what they want.'},
  {day:63, week:9, topic:'Week 9 Review + Second Project', study:'Review all advanced topics. Second portfolio project should be 70% complete by tonight.', build:'Second portfolio project pushed to 70% complete. Everything on GitHub.', interview:'Do 4 LeetCode Easy problems — strings', job:'Apply to 3 jobs on Remote OK', book:'Cracking the Coding Interview — reread behavioural section', biz:"Make your first sale this week if you haven't yet. Message people directly. Follow up."},
  {day:64, week:10, topic:'Second Project Complete', study:'Complete and deploy your second portfolio project. Live URL required by end of today.', build:'Second project deployed with live URL. README with screenshots. Added to portfolio and LinkedIn.', interview:'Practise walking through both projects fluently — one after the other', job:'Apply to 3 jobs + update CV with both deployed project links', book:'Cracking the Coding Interview', biz:'Post 24th Instagram. Celebrate having 2 deployed projects.'},
  {day:65, week:10, topic:'CV Overhaul', study:'Great developer CV: clean single page, skills section (JavaScript Node.js Express MongoDB REST APIs JWT Git), projects with live URLs, brief work history.', build:'Rewrite your entire CV from scratch. One page. Post on LinkedIn for community feedback.', interview:'Prepare your 90-second elevator pitch — practise until it flows naturally', job:'Apply to 3 jobs using your newly written CV', book:'Cracking the Coding Interview', biz:'Research how to register a business officially in Kenya.'},
  {day:66, week:10, topic:'LinkedIn Profile Overhaul', study:'Headline: JavaScript Developer | Node.js | REST APIs | Open to Remote. Summary: 3 paragraphs — who you are, what you build, what you are looking for. Recruiters search LinkedIn daily.', build:'Optimise every section: headline, about, experience, skills, featured projects', interview:'Your LinkedIn is your portfolio for recruiters. Treat it like a product launch.', job:'Apply to 3 jobs + message 5 recruiters directly', book:'Cracking the Coding Interview', biz:'Post 25th Instagram. 25 posts is a significant milestone.'},
  {day:67, week:10, topic:'Mock Interview Day', study:'Full 2-hour mock interview — no notes, no looking things up. Real interview energy.', build:'Answer from memory: event loop, closures, Promises, REST, JWT, MongoDB, two projects, weakness, why engineering', interview:'Record the full session. Score yourself 1–5 on each answer honestly.', job:'Apply to 3 jobs on Andela and Turing today', book:'Cracking the Coding Interview', biz:'Attempt to close 3 sales today — follow up every enquiry.'},
  {day:68, week:10, topic:'Salary Research + Negotiation', study:'Kenya junior JS: KSh 60k–120k/month. Remote junior: $800–2000/month. Glassdoor, LinkedIn Salary, Levels.fyi. Know your number before every interview.', build:'Write your salary ranges: Kenya minimum, Kenya target, Remote minimum, Remote target in USD', interview:'Practise: "What is your salary expectation?" Answer confidently with a range.', job:'Apply to 3 jobs + follow up on applications older than 2 weeks', book:'The $100 Startup — reread key chapter', biz:'Post 26th Instagram. Share a milestone.'},
  {day:69, week:10, topic:'Open Source Contribution', study:'Find a GitHub repo with a "good first issue" label. Read the codebase. Understand contribution guidelines. Documentation fixes count.', build:'Submit at least one pull request to an open source project — code, docs, or tests', interview:'Have you contributed to open source? (You will have a real answer now.)', job:'Apply to 3 jobs on LinkedIn', book:"Rework — reread your favourite 3 chapters", biz:'Research a Nairobi pop-up market or fair where you could sell in person.'},
  {day:70, week:10, topic:'Week 10 Review', study:'Honest review: what is fully mastered? What has gaps? 45 min on weakest topic. 45 min on strongest to make it bulletproof.', build:'Write a 1-page technical summary of everything you know: JS, Node.js, Express, MongoDB, auth, deployment', interview:'Do 5 LeetCode Easy problems — mixed topics', job:'Apply to 3 jobs + check every pending application', book:'Cracking the Coding Interview', biz:'Post 27th Instagram.'},
  {day:71, week:11, topic:'Final Portfolio Polish', study:'Every project needs: live URL, GitHub link, README with what it does + tech stack + how to run it + screenshots. First impressions count.', build:'Polish every project. Fix broken links. Test on mobile. Update portfolio.', interview:'Demo any project from scratch in 3 minutes flat', job:'Apply to 3 jobs on Andela, Turing, and Remote OK', book:'Cracking the Coding Interview', biz:'Post 28th Instagram. Celebrate 71 days of showing up.'},
  {day:72, week:11, topic:'Interview Questions Marathon', study:'90 minutes — answer every JavaScript and Node.js question you know. Write bullet answers first, then say them aloud. Fluency comes from repetition.', build:'Personal interview cheat sheet: 30 questions with concise bullet-point answers', interview:'Record yourself answering questions nonstop for 45 minutes.', job:'Apply to 3 jobs + message 5 new connections', book:'Cracking the Coding Interview', biz:'Post 29th Instagram.'},
  {day:73, week:11, topic:'Reflect + Plan Beyond 75', study:'What did you learn? What surprised you? What would you do differently? Honest reflection. Then write your 3-month plan for after Day 75.', build:'3-month post-75 plan: next skills, companies to target, business milestones', interview:'Review all your recorded mock interviews. Notice the real improvement.', job:'Apply to 3 jobs on LinkedIn', book:'Finish your current book today', biz:"Calculate your 75-day business results: followers, enquiries, sales, revenue."},
  {day:74, week:11, topic:'Final Mock Interview', study:'Your best mock interview yet. You have done this many times. Show yourself how far you have come. Final dress rehearsal.', build:'Full 2-hour interview simulation. All topics. Recorded.', interview:'Share your recording with a developer friend or mentor for honest feedback', job:'Apply to 3 final jobs — your last official application day', book:'Read any remaining pages', biz:'Post 30th Instagram. 30 posts. Preview your Day 75 post.'},
  {day:75, week:11, topic:'Day 75 — You Did It 🌸', study:'Spend 1 hour reviewing your full journey. Day 1 vs Day 75. Write exactly how your skills and confidence have changed.', build:'Final GitHub commit. Update portfolio. Write your Day 75 LinkedIn post — make it count.', interview:'You are interview-ready. Apply today and every day going forward.', job:'Apply to 5 jobs today — bonus application day to celebrate', book:'Write in your journal: what changed in 75 days', biz:'Post your Day 75 journey post. Tell the world everything you built. 🌸'},
];

// ─────────────────────────────────────────
// CONTENT POSTS  (TikTok + LinkedIn)
// ─────────────────────────────────────────
const CONTENT_POSTS = [
  { day:1,  hook:"POV: I work night shifts and I'm still learning to code",
    tiktok:`POV: I just started learning JavaScript today 🌸\n\nDay 1 of 75 Hard. I work nights 9pm–5am and I'm still going to become a software engineer.\n\nToday: var vs let vs const. Sounds simple. It is NOT.\n\nFollow along — this is going to be real 💻\n\n#75Hard #LearnToCode #JavaScript #WomenInTech #CodeWithMe #NairobiCreators`,
    linkedin:`Day 1 of 75 Hard — My JS + Node.js journey begins 💻\n\nStarting from the basics today: var, let, and const.\n\nThe difference matters more than you think in real codebases.\n\nI work overnight shifts (9pm–5am). I have PCOS. I'm building a fashion brand on the side.\n\nAnd I'm still showing up every single day to become a software engineer.\n\nNo excuses. No perfect conditions. Just showing up.\n\nFollow along — 74 days to go. 🌸\n\nWhat was the first programming concept that clicked for you?\n\n#JavaScript #75Hard #WomenInTech #LearnToCode #LearningInPublic #Nairobi` },
  { day:7,  hook:"Week 1 of coding done — here's what I built",
    tiktok:`Day 7 — Week 1 DONE! 🌸✅\n\nBuilt a number guessing game that runs in the Node.js terminal 🎮\n\nOne week ago I barely knew what a variable was.\n\nToday I built something that actually runs.\n\nWeek 2 starts tomorrow: closures and Promises 💻\n\n#75Hard #JavaScript #NodeJS #WeekOne #LearnToCode #WomenInTech`,
    linkedin:`Day 7 — Week 1 complete 🎉\n\nWhat I covered this week:\n✅ Variables (var, let, const) and data types\n✅ Functions — declaration, expression, arrow functions\n✅ Arrays — every method practised\n✅ Objects including methods and destructuring\n✅ Loops and conditionals\n✅ Built a working number guessing game in Node.js\n\nOne week ago I was unsure about the basics.\nToday I shipped something that runs.\n\nWeek 2 starts tomorrow: closures, higher order functions, Promises.\n\nThis is what consistent daily practice looks like. 🌸\n\n#JavaScript #NodeJS #75Hard #WomenInTech #LearningInPublic #BuildInPublic` },
  { day:9,  hook:"JavaScript closures explained simply 🔥",
    tiktok:`Day 9 — CLOSURES 🔥\n\nThe concept every JS interview asks about.\n\nFinally understood it using the counter example:\n\nA closure = a function that REMEMBERS variables from where it was created, even after the outer function is done.\n\nBuild a counter. It will click immediately 💡\n\n#JavaScript #75Hard #Closures #LearnToCode #TechTok #WomenInTech`,
    linkedin:`Day 9 — JavaScript Closures 💡\n\nClosures are asked in almost every JavaScript interview.\n\nSimple definition:\nA closure is a function that has access to variables from its outer scope, even after that outer function has finished executing.\n\nPractical example:\nconst counter = () => {\n  let count = 0;\n  return () => ++count;\n}\nconst c = counter();\nc(); // 1\nc(); // 2\n\nThe inner function "remembers" count across calls. That is a closure.\n\nBuild one yourself. It clicks immediately.\n\nWhat JavaScript concept took you the longest to understand?\n\n#JavaScript #Closures #75Hard #LearningInPublic #WebDevelopment` },
  { day:14, hook:"I built my first real JavaScript project 🎉",
    tiktok:`Day 14 🌸 TWO WEEKS DONE!\n\nBuilt a real weather app using async/await and a live weather API 🌤\n\nIt fetches real data. Shows real temperatures.\n\n2 weeks ago: didn't know what async meant.\nToday: fetching live API data.\n\nThis is what daily practice does 💪\n\n#JavaScript #75Hard #AsyncAwait #BuildInPublic #LearnToCode`,
    linkedin:`Day 14 — Two weeks. First real project shipped. 🌤\n\nBuilt a weather app using async/await and the OpenWeather API.\n\nIt fetches live data, displays the city, temperature, and weather description.\n\nSimple? Yes. But it's mine. Built from scratch. Real API. Real data.\n\nTwo weeks of 75 Hard:\n✅ JavaScript fundamentals complete\n✅ async/await with real API calls\n✅ First working project deployed\n✅ GitHub streak: 14 days green\n✅ Zero social media relapses — replaced with reading\n\nWeek 3 starts tomorrow: Node.js. This is where it gets serious. 🚀\n\n#JavaScript #75Hard #BuildInPublic #WomenInTech #LearningInPublic` },
  { day:21, hook:"3 weeks of coding — honest progress update",
    tiktok:`Day 21 🌸 THREE WEEKS!\n\nStarted building my portfolio website today 💻\n\nAnd Node.js begins this week — backend here I come!\n\n3 weeks: JavaScript fundamentals, DOM, event loop, modules, localStorage.\n\nPortfolio under construction 🏗\n\n#75Hard #NodeJS #Portfolio #WomenInTech #LearnToCode #BuildInPublic`,
    linkedin:`Day 21 — Three weeks of 75 Hard. Portfolio building begins. 🌸\n\nThis week I covered:\n• The JavaScript event loop (now I understand why async works)\n• DOM manipulation — making real interactive pages\n• ES6+ modern syntax throughout\n• Modules with import/export\n• localStorage for data persistence\n\nAnd I started my portfolio website.\n\nThree weeks ago I couldn't explain what a function expression was.\n\nNow I'm building for the web and starting Node.js this week.\n\nThe compounding is starting to feel very real. 💪\n\nAny devs who remember their first portfolio site? Drop a link 👇\n\n#JavaScript #NodeJS #75Hard #WomenInTech #BuildInPublic #LearningInPublic` },
  { day:28, hook:"I built a REST API from scratch — here's what I learned",
    tiktok:`Day 28 🌸 FOUR WEEKS!\n\nBuilt a full REST API with Node.js and Express today 🔧\n\nGET, POST, PUT, DELETE — all working.\nTested everything in Postman.\n\nThis feels like ACTUAL software engineering 😭💻\n\n#NodeJS #ExpressJS #REST #75Hard #BuildInPublic #WomenInTech`,
    linkedin:`Day 28 — Four weeks + first Node.js REST API 🔧\n\nBuilt a complete REST API from scratch today:\n\nGET    /products       → get all products\nGET    /products/:id   → get one product\nPOST   /products       → create a product\nPUT    /products/:id   → update a product\nDELETE /products/:id   → delete a product\n\nTested every route in Postman. All working.\n\nFour weeks ago: had never touched Node.js.\nToday: building backend APIs.\n\nNext week: MongoDB + JWT authentication. 🌸\n\n#NodeJS #ExpressJS #REST #75Hard #BuildInPublic #WomenInTech #LearningInPublic` },
  { day:35, hook:"I built JWT authentication from scratch 🔐",
    tiktok:`Day 35 🌸 HALFWAY DONE!!\n\nBuilt a full authentication system today:\n✅ Register with bcrypt password hashing\n✅ Login returns a JWT token\n✅ Protected routes with auth middleware\n\nThis is what companies ACTUALLY use 🔐\n\n35 more days. Watch what happens.\n\n#NodeJS #JWT #75Hard #BuildInPublic #Authentication #WomenInTech`,
    linkedin:`Day 35 — Halfway. Full authentication system built. 🔐\n\n35 days. No missed days. No restarts.\n\nToday I built a complete authentication system:\n• User registration with bcrypt password hashing\n• JWT token generation on successful login\n• Protected route middleware that verifies tokens\n• Proper error handling throughout\n\nThis exact pattern appears in every Node.js job description I've seen.\n\nIt used to feel like magic. Now I built it from scratch.\n\n35 more days. The second half is where the real work begins. 🌸\n\n#NodeJS #JWT #Authentication #75Hard #BuildInPublic #WomenInTech #LearningInPublic` },
  { day:42, hook:"6 weeks of building — here's everything I made",
    tiktok:`Day 42 🌸 SIX WEEKS!\n\nPortfolio website is LIVE 🚀\nTwo deployed projects with real URLs ✅\n20+ job applications sent 📤\nGitHub all green for 42 days 💚\n\nThe momentum is real and I can feel it 💪\n\n#75Hard #Portfolio #NodeJS #WomenInTech #BuildInPublic`,
    linkedin:`Day 42 — Six weeks. Portfolio live. 🚀\n\nWhat exists today that didn't exist 42 days ago:\n\n💻 Portfolio website — live URL, mobile friendly\n🔧 Products REST API — deployed on Railway\n🔐 Full auth system — JWT + bcrypt + MongoDB\n📁 GitHub — 42 consecutive days of commits\n📤 20+ job applications sent\n📸 Fashion brand Instagram — 13 posts, growing\n\nI work 9pm–5am overnight. I have PCOS. I started with the basics.\n\nWeek 7 starts tomorrow: interview intensive preparation. 💪\n\n#75Hard #NodeJS #WomenInTech #BuildInPublic #LearningInPublic #Andela` },
  { day:50, hook:"50 days of coding — the honest progress report",
    tiktok:`Day 50 🌸 FIFTY DAYS!!\n\nStarting my capstone project today — full stack 💻\n\nNode.js backend + MongoDB + JWT auth + real frontend.\n\n50 days ago: learning variables.\nToday: architecting a full-stack application.\n\n25 days left. Best is ahead. 🚀\n\n#75Hard #FullStack #NodeJS #BuildInPublic #WomenInTech`,
    linkedin:`Day 50 — Capstone project begins. 50 days strong. 💪\n\n50 days later:\n✅ JavaScript — fully confident\n✅ Node.js + Express — built multiple APIs\n✅ MongoDB + Mongoose — database connected\n✅ JWT authentication — built from scratch\n✅ Two projects deployed with live URLs\n✅ 30+ job applications sent\n\nToday I start my capstone — a real full-stack application.\n\n25 days to go. The second half is where most people quit.\n\nI won't. 🌸\n\n#75Hard #FullStack #NodeJS #BuildInPublic #WomenInTech #LearningInPublic` },
  { day:60, hook:"My full-stack project is LIVE — 60 days of work",
    tiktok:`Day 60 🌸 SIXTY DAYS!\n\nCapstone project is LIVE 🚀\n\nFull stack — Node/Express/MongoDB backend + HTML/CSS/JS frontend.\n\nReal URL. Real data. Real users can use it.\n\n15 days left. I can see the finish line 💪\n\n#75Hard #FullStack #BuildInPublic #WomenInTech #LearnToCode`,
    linkedin:`Day 60 — Capstone is live. 15 days to go. 🌸\n\n60 days of showing up. Here's the receipt:\n\n🚀 Capstone project — live URL, works on mobile\n📱 Portfolio — 2 deployed full-stack projects\n🔗 GitHub — 60 green commits in a row\n📤 35+ job applications sent\n✨ Fashion brand — 22 Instagram posts\n🌸 PCOS protocol — consistent for 60 days\n📖 5 books read\n\nYou don't need perfect conditions to start.\nYou just need to start.\n\n15 days to go. 🌸\n\n#75Hard #FullStack #WomenInTech #BuildInPublic #LearningInPublic #Nairobi` },
  { day:70, hook:"70 days changed everything — the honest before/after",
    tiktok:`Day 70 🌸 SEVENTY DAYS!!\n\nCV overhauled. LinkedIn rebuilt.\n2 portfolio projects live.\nInterview prep almost complete.\n\n5 days left and I can feel everything shifting 💫\n\n#75Hard #TechCareer #WomenInTech #BuildInPublic #Almost`,
    linkedin:`Day 70 — Five days to go. Everything has changed. 🌸\n\n70 days ago:\n❌ Knew only JS basics\n❌ No portfolio\n❌ No deployed projects\n❌ Inconsistent health habits\n\nToday:\n✅ JavaScript + Node.js confident and interview-ready\n✅ 2 live deployed full-stack projects\n✅ CV overhauled and sharp\n✅ LinkedIn profile optimised\n✅ 40+ job applications sent\n✅ Fashion brand growing with real enquiries\n✅ PCOS protocol consistent for 70 days\n✅ 6 books read\n\nFive days to the finish line.\n\nThis is what discipline compounded over 70 days looks like. 💪\n\n#75Hard #NodeJS #WomenInTech #LearningInPublic #BuildInPublic #Nairobi` },
  { day:75, hook:"75 Hard complete — the full honest story 🌸",
    tiktok:`DAY 75 🌸🎉 I DID IT!!\n\n75 Hard COMPLETE.\n\nFrom barely knowing variables to building full-stack apps with Node.js, MongoDB, and JWT auth.\n\nWorking overnights 9pm–5am.\nHealing my PCOS.\nBuilding a fashion brand.\n\nNO EXCUSES.\n\nYour turn. 💪\n\n#75Hard #WomenInTech #BuildInPublic #JavaScript #NodeJS #NairobiCreators`,
    linkedin:`Day 75 — 75 Hard Complete. 🌸\n\n75 days ago I made a decision.\n\nHere is what those 75 days built:\n\n💻 JavaScript + Node.js — fully capable and interview-ready\n🔧 2 deployed full-stack projects — live URLs\n🔐 Auth systems, REST APIs, MongoDB — built from scratch\n📁 GitHub — 75 consecutive green commits\n📤 50+ job applications sent\n✨ Fashion brand — 30 posts, first sales made\n🌸 PCOS protocol — consistent for 75 days\n📖 7 books read\n📵 Social media replaced with reading and building\n\nI work overnight shifts. I have PCOS. I started with the basics.\n\nIf the conditions had to be perfect, I would never have started.\n\nTo anyone thinking about starting: start today.\n\nYour 75 days are waiting. 🌸\n\n#75Hard #JavaScript #NodeJS #WomenInTech #BuildInPublic #LearningInPublic #Andela #RemoteWork #Nairobi` },
];

const HASHTAG_BANK = {
  tiktok_coding: '#LearnToCode #CodeWithMe #JavaScript #NodeJS #TechTok #75Hard #WomenInTech #CodeNewbie #BuildInPublic #LearningInPublic #NairobiCreators',
  tiktok_life:   '#PCOSWarrior #NightShiftLife #SelfImprovement #75Hard #GlowUp #DisciplineIsLove #AfricanWomenInTech #NairobiCreators',
  linkedin:      '#JavaScript #NodeJS #75Hard #WomenInTech #BuildInPublic #LearningInPublic #WebDevelopment #Andela #RemoteWork #NairobiTech #AfricaInTech',
};

const DAILY_IDEAS = [
  { type:'🎵 TikTok: "POV" format',         desc:'Film yourself reading the error then solving it. Real reactions = real engagement.' },
  { type:'🎵 TikTok: Concept in 60 seconds', desc:'Explain one concept from today\'s study in under 60 seconds. No editing needed.' },
  { type:'🎵 TikTok: Day in my life',         desc:'Show your real schedule: wake at 11am, study, walk, work overnight. People love the real.' },
  { type:'🎵 TikTok: Before vs after code',   desc:'Show messy code vs clean refactored code. The contrast gets great engagement.' },
  { type:'💼 LinkedIn: What I learned',       desc:'One concept explained simply with a code snippet. Always end with a question.' },
  { type:'💼 LinkedIn: The hard days',        desc:'Honest post about a day you struggled. Vulnerability gets the most comments.' },
  { type:'💼 LinkedIn: Mini tutorial',        desc:'Take one thing you built and teach it in 5 bullet points with code examples.' },
  { type:'📸 Both: Progress screenshot',      desc:'Screenshot your GitHub commits, code running, or deployed URL. Show the receipts.' },
  { type:'📸 Both: Week recap (Sundays)',      desc:'What you built, what you learned, what\'s next. Consistency builds a loyal audience.' },
  { type:'📸 Both: Error + solution',         desc:'"I spent 2 hours on this error — here\'s what it was." The most relatable content you can post.' },
];

// ─────────────────────────────────────────
// 75 HARD MODULE
// ─────────────────────────────────────────
const seventyFiveModule = {
  data: null,

  init() {
    this.data = sf_load();
  },

  render() {
    this.data = sf_load();
    const container = document.getElementById('sf-main');
    if (!container) return;
    if (!this.data.startDate) {
      container.innerHTML = this._welcomeHTML();
      document.getElementById('sf-start-btn')?.addEventListener('click', () => this._startProgram());
    } else {
      container.innerHTML = this._dashboardHTML();
      this._bindDashboard();
    }
  },

  _startProgram() {
    this.data = { startDate: new Date().toISOString().split('T')[0], currentDay: 1, completedDays: [], checklists: {} };
    sf_save(this.data);
    this.render();
  },

  _welcomeHTML() {
    return `
    <div class="sf-welcome">
      <div class="sf-welcome-inner">
        <div class="sf-welcome-icon">🌸</div>
        <h2 class="sf-welcome-title">Ready to Begin Your 75 Days?</h2>
        <p class="sf-welcome-desc">Built around your 3 priorities:<br>
          <strong>JS + Node.js career</strong> &nbsp;·&nbsp; <strong>Fashion/beauty business</strong> &nbsp;·&nbsp; <strong>PCOS healing</strong>
        </p>
        <div class="sf-welcome-rules">
          <div class="sf-rule"><span class="sf-rule-icon">🌸</span><div><strong>PCOS Meal Plan</strong> — 16:8 fasting, eating window 11:30am–7:30pm, no sugar, 3L water</div></div>
          <div class="sf-rule"><span class="sf-rule-icon">🚶</span><div><strong>Two workouts</strong> — 30 min walk at 3pm + 20 min yoga at 4pm</div></div>
          <div class="sf-rule"><span class="sf-rule-icon">💻</span><div><strong>2 hours JS + Node study</strong> — 12pm–2pm, follow the exact day-by-day plan</div></div>
          <div class="sf-rule"><span class="sf-rule-icon">📖</span><div><strong>Read 10 pages</strong> — at 2pm, replaces every social media urge</div></div>
          <div class="sf-rule"><span class="sf-rule-icon">✨</span><div><strong>30 min business or job work</strong> — at 2:30pm, every single day</div></div>
          <div class="sf-rule"><span class="sf-rule-icon">📣</span><div><strong>Post on TikTok + LinkedIn</strong> — at 5pm, building your audience daily</div></div>
        </div>
        <p class="sf-welcome-note">Miss one rule = restart from Day 1. That's the deal.</p>
        <button class="btn-primary" id="sf-start-btn" style="font-size:1rem;padding:0.8rem 2.5rem;margin-top:1.5rem">Begin Day 1 ✦</button>
      </div>
    </div>`;
  },

  _dashboardHTML() {
    const { currentDay, completedDays = [] } = this.data;
    const d            = DAYS_75[currentDay - 1];
    const pct          = Math.round((completedDays.length / 75) * 100);
    const checks       = this.data.checklists[currentDay] || {};
    const checkedCount = Object.values(checks).filter(Boolean).length;
    const allDone      = checkedCount === CHECKLIST.length;

    return `
    <div class="sf-dashboard">

      <div class="sf-progress-header card">
        <div class="sf-prog-left">
          <div class="sf-day-badge">Day ${currentDay} <span>/ 75</span></div>
          <div class="sf-prog-label">Week ${d.week} &nbsp;·&nbsp; ${d.topic}</div>
          <div class="sf-prog-bar-wrap"><div class="sf-prog-bar" style="width:${pct}%"></div></div>
          <div class="sf-prog-stats"><span>${completedDays.length} days completed</span><span>${pct}% done</span></div>
        </div>
        <div class="sf-prog-right">
          <div class="sf-streak">${completedDays.length} 🔥</div>
          <div class="sf-streak-label">Day Streak</div>
        </div>
      </div>

      <div class="sf-today-grid">
        <div class="card sf-today-card">
          <div class="sf-today-header">
            <h3 class="card-title" style="margin-bottom:0">Day ${currentDay} — Today's Full Plan</h3>
            <span class="sf-today-day-tag">${currentDay % 2 !== 0 ? '🎯 Job Applications Day' : '📸 Business Day'}</span>
          </div>
          ${[['💻','Study (12pm–2pm)',d.study],['🔨','Build',d.build],['💼','Interview Prep',d.interview],['🌍','Job / Career',d.job],['📖','Reading (2pm)',d.book],['✨','Business / Brand (2:30pm)',d.biz]].map(([icon,label,text])=>`
          <div class="sf-plan-section">
            <div class="sf-plan-label"><span class="sf-plan-icon">${icon}</span>${label}</div>
            <div class="sf-plan-text">${text}</div>
          </div>`).join('')}
        </div>

        <div class="card sf-checklist-card">
          <h3 class="card-title">Today's Checklist</h3>
          <div class="sf-check-progress">
            <span style="font-size:0.82rem;color:var(--text-2)">${checkedCount} / ${CHECKLIST.length} done</span>
            <div class="sf-mini-bar"><div class="sf-mini-fill" style="width:${Math.round((checkedCount/CHECKLIST.length)*100)}%"></div></div>
          </div>
          <div class="sf-checks">
            ${CHECKLIST.map(item=>`
            <div class="sf-check-item ${checks[item.id]?'sf-checked':''}" data-id="${item.id}">
              <div class="sf-check-box">${checks[item.id]?'✓':''}</div>
              <span class="sf-check-label">${item.label}</span>
              <span class="sf-check-cat sf-cat-${item.cat.toLowerCase()}">${item.cat}</span>
            </div>`).join('')}
          </div>
          ${allDone
            ? `<button class="btn-primary" id="sf-complete-day" style="width:100%;margin-top:1rem">Complete Day ${currentDay} ✦</button>`
            : `<p style="font-size:0.78rem;color:var(--text-3);text-align:center;margin-top:1rem">Tick all ${CHECKLIST.length} items to complete the day 🌸</p>`}
        </div>
      </div>

      <div class="card" style="margin-top:1.2rem">
        <h3 class="card-title">⏰ Your Daily Schedule</h3>
        <div class="sf-schedule">
          ${DAILY_SCHEDULE.map(r=>`
          <div class="sf-sched-row">
            <div class="sf-sched-time">${r.icon} ${r.time}</div>
            <div class="sf-sched-body">
              <div class="sf-sched-act">${r.act}</div>
              <div class="sf-sched-det">${r.det}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <div style="margin-top:1.4rem">
        <h3 class="card-title" style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:var(--text);margin-bottom:1rem">📅 All 75 Days — tap to expand</h3>
        <div class="sf-days-list">
          ${DAYS_75.map(d2=>{
            const done    = completedDays.includes(d2.day);
            const current = d2.day === currentDay;
            const wStart  = (d2.day-1)%7===0;
            return `${wStart?`<div class="sf-week-sep">Week ${d2.week} — Days ${d2.day}–${Math.min(d2.day+6,75)}</div>`:''}
            <div class="sf-day-row ${done?'sf-done':''} ${current?'sf-current':''}" data-day="${d2.day}">
              <div class="sf-day-num">${done?'✓':d2.day}</div>
              <div class="sf-day-info">
                <div class="sf-day-name">Day ${d2.day} — ${d2.topic}</div>
                <div class="sf-day-expand hidden" id="sf-expand-${d2.day}">
                  <div class="sf-expand-row"><strong>💻 Study:</strong> ${d2.study}</div>
                  <div class="sf-expand-row"><strong>🔨 Build:</strong> ${d2.build}</div>
                  <div class="sf-expand-row"><strong>💼 Interview:</strong> ${d2.interview}</div>
                  <div class="sf-expand-row"><strong>🌍 Job:</strong> ${d2.job}</div>
                  <div class="sf-expand-row"><strong>📖 Book:</strong> ${d2.book}</div>
                  <div class="sf-expand-row"><strong>✨ Biz:</strong> ${d2.biz}</div>
                </div>
              </div>
              <div class="sf-day-status">
                ${done   ?'<span class="sf-done-badge">Done ✓</span>'   :''}
                ${current?'<span class="sf-today-badge">Today 🌸</span>':''}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

    </div>`;
  },

  _bindDashboard() {
    document.querySelectorAll('.sf-check-item').forEach(el=>{
      el.addEventListener('click',()=>{
        const id  = el.dataset.id;
        const day = this.data.currentDay;
        if (!this.data.checklists[day]) this.data.checklists[day]={};
        this.data.checklists[day][id] = !this.data.checklists[day][id];
        sf_save(this.data);
        this.render();
      });
    });

    document.getElementById('sf-complete-day')?.addEventListener('click',()=>{
      const day = this.data.currentDay;
      if (!this.data.completedDays.includes(day)) this.data.completedDays.push(day);
      if (day < 75) this.data.currentDay = day+1;
      sf_save(this.data);
      app.showToast(day<75 ? `Day ${day} complete! On to Day ${day+1}! 🌸` : '75 Hard COMPLETE! You did it! 🎉🌸');
      this.render();
    });

    document.querySelectorAll('.sf-day-row').forEach(row=>{
      row.addEventListener('click',()=>{
        document.getElementById('sf-expand-'+row.dataset.day)?.classList.toggle('hidden');
      });
    });
  }
};

// ─────────────────────────────────────────
// CONTENT MODULE
// ─────────────────────────────────────────
const contentModule = {

  render() {
    const container = document.getElementById('content-main');
    if (!container) return;

    const sfData      = sf_load();
    const currentDay  = sfData.currentDay || 1;
    const cData       = ct_load();
    const todayPost   = CONTENT_POSTS.find(p => p.day === currentDay);
    const upcoming    = CONTENT_POSTS.filter(p => p.day > currentDay).slice(0, 3);
    const totalPosted = Object.keys(cData.posted).length;

    container.innerHTML = `
    <div class="ct-dashboard">

      <div class="ct-stats-row">
        <div class="card ct-stat-card"><div class="ct-stat-num">${totalPosted}</div><div class="ct-stat-label">Posts Published</div></div>
        <div class="card ct-stat-card"><div class="ct-stat-num">${CONTENT_POSTS.length}</div><div class="ct-stat-label">Templates Ready</div></div>
        <div class="card ct-stat-card"><div class="ct-stat-num">${upcoming.length}</div><div class="ct-stat-label">Coming Up</div></div>
        <div class="card ct-stat-card"><div class="ct-stat-num">2</div><div class="ct-stat-label">Platforms</div></div>
      </div>

      <div class="card ct-strategy-card">
        <h3 class="card-title">📣 Your Content Strategy</h3>
        <div class="ct-strategy-grid">
          <div class="ct-platform-card ct-tiktok">
            <div class="ct-platform-icon">🎵</div>
            <div class="ct-platform-name">TikTok</div>
            <div class="ct-platform-desc">Short, punchy, personal. Show your face. Film yourself explaining the concept. Authenticity beats production quality. Your unique angle: overnight worker + PCOS + coding + fashion brand in Nairobi. Nobody has your exact story. Post at 5pm every day using the templates below.</div>
          </div>
          <div class="ct-platform-card ct-linkedin">
            <div class="ct-platform-icon">💼</div>
            <div class="ct-platform-name">LinkedIn</div>
            <div class="ct-platform-desc">Longer, professional, story-driven. Recruiters actively search for people learning in public. This is your job application running 24 hours a day. Always end every post with a genuine question — it triples comments and reach.</div>
          </div>
        </div>
        <div class="ct-tips">
          <div class="ct-tip"><span>🔥</span>Post within 30 minutes of finishing your study block — the energy is real and visible</div>
          <div class="ct-tip"><span>🌸</span>Never hide the overnight shift, PCOS, or fashion brand angle — that story is your brand</div>
          <div class="ct-tip"><span>💡</span>Always end LinkedIn posts with a genuine question — single best way to drive comments</div>
          <div class="ct-tip"><span>📱</span>TikTok: film yourself talking, add captions, use a trending sound. Simple and real wins.</div>
          <div class="ct-tip"><span>🎯</span>Use a separate account for your coding journey vs your fashion brand — don't mix audiences</div>
          <div class="ct-tip"><span>📊</span>Check analytics every Sunday. Double down on content that gets the most saves and shares.</div>
        </div>
      </div>

      ${todayPost ? `
      <div class="card ct-today-post">
        <div class="ct-today-header">
          <h3 class="card-title" style="margin-bottom:0">Day ${currentDay} — Today's Posts</h3>
          <span class="ct-hook-badge">Hook: "${todayPost.hook}"</span>
        </div>
        <div class="ct-post-tabs">
          <button class="ct-tab-btn active" onclick="contentModule.switchTab(this,'ct-tt-${currentDay}','ct-li-${currentDay}')">🎵 TikTok</button>
          <button class="ct-tab-btn" onclick="contentModule.switchTab(this,'ct-li-${currentDay}','ct-tt-${currentDay}')">💼 LinkedIn</button>
        </div>
        <div id="ct-tt-${currentDay}">
          <div class="ct-platform-label">🎵 TikTok Caption — copy and add your own voice</div>
          <div class="ct-post-text" id="ct-tt-text-${currentDay}">${todayPost.tiktok}</div>
          <div class="ct-post-actions">
            <button class="btn-ghost ct-copy-btn" onclick="contentModule.copy('ct-tt-text-${currentDay}')">📋 Copy Caption</button>
            <button class="btn-primary ct-post-btn ${cData.posted['tiktok-'+currentDay]?'ct-posted':''}" onclick="contentModule.markPosted('tiktok',${currentDay})">
              ${cData.posted['tiktok-'+currentDay]?'✓ Posted on TikTok!':'✦ Mark as Posted'}
            </button>
          </div>
        </div>
        <div id="ct-li-${currentDay}" class="hidden">
          <div class="ct-platform-label">💼 LinkedIn Post — copy and personalise before posting</div>
          <div class="ct-post-text" id="ct-li-text-${currentDay}" style="white-space:pre-wrap">${todayPost.linkedin}</div>
          <div class="ct-post-actions">
            <button class="btn-ghost ct-copy-btn" onclick="contentModule.copy('ct-li-text-${currentDay}')">📋 Copy Post</button>
            <button class="btn-primary ct-post-btn ${cData.posted['linkedin-'+currentDay]?'ct-posted':''}" onclick="contentModule.markPosted('linkedin',${currentDay})">
              ${cData.posted['linkedin-'+currentDay]?'✓ Posted on LinkedIn!':'✦ Mark as Posted'}
            </button>
          </div>
        </div>
      </div>` : `
      <div class="card" style="background:var(--lavender-soft);padding:1.4rem;border-radius:var(--radius)">
        <h3 class="card-title">Day ${currentDay} — Write Your Own Post Today</h3>
        <p style="font-size:0.88rem;color:var(--text-2);line-height:1.7">No template for Day ${currentDay} — write about what you studied and built today. Be specific. Be honest. Your real experience is better than any template. Use the Daily Ideas below for format inspiration.</p>
      </div>`}

      ${upcoming.length > 0 ? `
      <div class="card" style="margin-top:1.2rem">
        <h3 class="card-title">📅 Upcoming Post Templates</h3>
        <div class="ct-upcoming-list">
          ${upcoming.map(p=>`
          <div class="ct-upcoming-item">
            <div class="ct-upcoming-day">Day ${p.day}</div>
            <div class="ct-upcoming-info">
              <div class="ct-upcoming-hook">"${p.hook}"</div>
              <div class="ct-upcoming-preview">${p.tiktok.substring(0,90)}...</div>
            </div>
          </div>`).join('')}
        </div>
      </div>` : ''}

      <div class="card" style="margin-top:1.2rem">
        <h3 class="card-title">🏷️ Hashtag Bank</h3>
        <div class="ct-hashtag-section">
          ${[['TikTok — Coding content','tiktok_coding'],['TikTok — Lifestyle / PCOS / Journey','tiktok_life'],['LinkedIn','linkedin']].map(([label,key])=>`
          <div class="ct-hashtag-group" style="margin-bottom:0.8rem">
            <div class="ct-hashtag-label">${label}</div>
            <div class="ct-hashtags" id="ct-hash-${key}">${HASHTAG_BANK[key]}</div>
            <button class="btn-ghost" style="font-size:0.75rem;margin-top:6px;padding:0.25rem 0.8rem" onclick="contentModule.copy('ct-hash-${key}')">Copy</button>
          </div>`).join('')}
        </div>
      </div>

      <div class="card" style="margin-top:1.2rem">
        <h3 class="card-title">💡 Daily Post Ideas — use on any day</h3>
        <div class="ct-ideas-grid">
          ${DAILY_IDEAS.map(idea=>`
          <div class="ct-idea-card">
            <div class="ct-idea-type">${idea.type}</div>
            <div class="ct-idea-desc">${idea.desc}</div>
          </div>`).join('')}
        </div>
      </div>

    </div>`;
  },

  switchTab(activeBtn, showId, hideId) {
    const parent = activeBtn.closest('.ct-today-post');
    parent.querySelectorAll('.ct-tab-btn').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
    document.getElementById(showId)?.classList.remove('hidden');
    document.getElementById(hideId)?.classList.add('hidden');
  },

  copy(elId) {
    const text = document.getElementById(elId)?.textContent || '';
    navigator.clipboard.writeText(text)
      .then(() => app.showToast('Copied to clipboard! 📋'))
      .catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        app.showToast('Copied! 📋');
      });
  },

  markPosted(platform, day) {
    const cData = ct_load();
    const key   = `${platform}-${day}`;
    cData.posted[key] = !cData.posted[key];
    ct_save(cData);
    this.render();
    if (cData.posted[key]) app.showToast(`Marked as posted on ${platform === 'tiktok' ? 'TikTok 🎵' : 'LinkedIn 💼'}!`);
  }
};