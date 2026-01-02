document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    startNewDayLogic(); // Check dates/resets first
    try {
        const el = document.getElementById('streak-count');
        if (el) el.innerText = localStorage.getItem('mind_streak') || 0;
    } catch (e) { }
    try {
        if (localStorage.getItem('mind_theme') === 'light') document.body.classList.add('light-mode');
    } catch (e) { }

    renderGoals(); // To-Do
    renderWater(); // Water
    renderHabits(); // Habits
    loadDailyQuote(); // Quote
}

// --- NEW DAY & STREAK LOGIC ---
function startNewDayLogic() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('mind_last_visit');

    if (lastVisit !== today) {
        // It's a new day!
        // 1. Reset Water
        localStorage.setItem('mind_water', 0);

        // 2. Reset Habits (keep names, reset done)
        let habits = JSON.parse(localStorage.getItem('mind_habits')) || defaultHabits();
        habits.forEach(h => h.done = false);
        localStorage.setItem('mind_habits', JSON.stringify(habits));

        // 3. Reset Streak if not consecutive? (Optional, kept simple for now)
        // Check if last visit was yesterday for streak maintenance could be complex. 
        // For now, simple logic: Streak increments when you do tasks.

        localStorage.setItem('mind_last_visit', today);
        localStorage.setItem('mind_streak_today', 'false'); // Allowed to inc streak today
    }
}

// --- WATER TRACKER ---
function renderWater() {
    const grid = document.getElementById('water-grid');
    const countDisplay = document.getElementById('water-count');
    if (!grid) return;

    const count = parseInt(localStorage.getItem('mind_water') || 0);
    if (countDisplay) countDisplay.innerText = count;

    grid.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const cup = document.createElement('i');
        cup.className = `fa-solid fa-glass-water water-cup ${i < count ? 'filled' : ''}`;
        cup.onclick = () => toggleWater(i);
        grid.appendChild(cup);
    }
}

window.toggleWater = function (idx) {
    let count = parseInt(localStorage.getItem('mind_water') || 0);
    // Logic: Clicking a cup sets count to that cup index + 1
    // If clicking the current max cup, toggle it off?
    // Simple logic: If click empty, fill up to it. If click full, reduce.
    if (idx < count) count = idx; // Unfill
    else count = idx + 1; // Fill

    localStorage.setItem('mind_water', count);
    renderWater();
    checkStreak();
};

// --- HABIT TRACKER ---
function defaultHabits() {
    return [
        { text: "🕋 الصلاة في وقتها", done: false },
        { text: "📖 قراءة صفحة قرآن", done: false },
        { text: "🏃‍♂️ مشي / رياضة", done: false },
        { text: "🤐 الصيام عن الكلام السلبي", done: false }
    ];
}

function renderHabits() {
    const list = document.getElementById('habits-list');
    if (!list) return;

    const habits = JSON.parse(localStorage.getItem('mind_habits')) || defaultHabits();
    // Save defaults if first run
    if (!localStorage.getItem('mind_habits')) localStorage.setItem('mind_habits', JSON.stringify(habits));

    list.innerHTML = '';
    habits.forEach((h, i) => {
        const li = document.createElement('li');
        li.className = `habit-item ${h.done ? 'done' : ''}`;
        li.innerHTML = `<i class="fa-regular ${h.done ? 'fa-square-check' : 'fa-square'}"></i><span>${h.text}</span>`;
        li.onclick = () => toggleHabit(i);
        list.appendChild(li);
    });
}

window.toggleHabit = function (i) {
    const habits = JSON.parse(localStorage.getItem('mind_habits'));
    habits[i].done = !habits[i].done;
    localStorage.setItem('mind_habits', JSON.stringify(habits));
    renderHabits();
    checkStreak();
};

function checkStreak() {
    // Increment streak if Significant Progress made today
    // Eg: 50% of water + 50% habits? 
    // Simplified: If all habits done OR 8 cups water -> Inc streak

    const doneToday = localStorage.getItem('mind_streak_today');
    if (doneToday === 'true') return; // Already incremented

    const habits = JSON.parse(localStorage.getItem('mind_habits')) || [];
    const water = parseInt(localStorage.getItem('mind_water') || 0);
    const allHabitsDone = habits.every(h => h.done);

    if (allHabitsDone || water >= 8) {
        let s = parseInt(localStorage.getItem('mind_streak') || 0);
        s++;
        localStorage.setItem('mind_streak', s);
        localStorage.setItem('mind_streak_today', 'true');

        document.getElementById('streak-count').innerText = s;
        // Celebration?
        alert("🔥 مذهل! زاد الستريك اليومي!");
    }
}

// --- GRATITUDE JOURNAL ---
window.saveGratitude = function () {
    const i1 = getVal('grat-1'), i2 = getVal('grat-2'), i3 = getVal('grat-3');
    if (!i1 && !i2 && !i3) return;

    const entry = {
        date: new Date().toLocaleDateString('ar-EG'),
        items: [i1, i2, i3].filter(x => x)
    };

    const history = JSON.parse(localStorage.getItem('mind_gratitude') || '[]');
    history.unshift(entry); // Add to top
    localStorage.setItem('mind_gratitude', JSON.stringify(history));

    // Clear inputs
    document.getElementById('grat-1').value = '';
    document.getElementById('grat-2').value = '';
    document.getElementById('grat-3').value = '';

    renderGratitudeHistory();
    alert("تم الحفظ في ذكرياتك 💖");
};

function renderGratitudeHistory() {
    const container = document.getElementById('gratitude-history');
    if (!container) return;

    const history = JSON.parse(localStorage.getItem('mind_gratitude') || '[]');
    container.innerHTML = '';

    history.forEach(h => {
        const div = document.createElement('div');
        div.className = 'journal-entry';
        div.innerHTML = `<span class="date">${h.date}</span><ul>${h.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
        container.appendChild(div);
    });
}

// Ensure Gratitude loads when opening tool
const originalOpenTool = window.openTool;
window.openTool = function (toolName) {
    originalOpenTool(toolName);
    if (toolName === 'gratitude') renderGratitudeHistory();
};

// --- Daily Quote ---
const quotes = ["النجاح هو أن تنتقل من فشل إلى فشل دون أن تفقد حماسك.", "لا تنتظر الفرصة، بل اصنعها.", "ابدأ حيث أنت، استخدم ما لديك.", "المستقبل لمن يؤمن بجمال أحلامه.", "أنت أقوى مما تتخيل.", "كل يوم فرصة جديدة.", "السعادة هي طريقة حياة.", "لا تتوقف عندما تتعب، توقف عندما تنتهي.", "ثق بنفسك.", "كن التغيير الذي تريد أن تراه."];
function loadDailyQuote() {
    const box = document.getElementById('daily-quote-text');
    if (!box) return;
    const t = new Date().toDateString();
    if (localStorage.getItem('mind_quote_date') !== t) { localStorage.setItem('mind_quote_date', t); localStorage.setItem('mind_quote_text', quotes[Math.floor(Math.random() * quotes.length)]); }
    box.innerText = localStorage.getItem('mind_quote_text');
}

// --- Breathing ---
let bAct = false, bT = [];
window.toggleBreathing = function () { const c = getModalElement('#breath-circle'), t = getModalElement('#breath-text'), b = getModalElement('#breath-btn'); if (!c) return; if (bAct) { bAct = false; bT.forEach(clearTimeout); bT = []; c.className = 'breath-circle'; t.innerText = "جاهز؟"; b.innerText = "ابدأ التمرين"; b.style.background = "var(--primary)"; } else { bAct = true; b.innerText = "إنهاء"; b.style.background = "var(--danger)"; bC(c, t); } };
function bC(c, t) { if (!bAct) return; t.innerText = "شــهــيــق 🫁"; c.className = 'breath-circle inhale'; if (navigator.vibrate) navigator.vibrate(200); bT.push(setTimeout(() => { if (!bAct) return; t.innerText = "احبس نفسك 😶"; c.className = 'breath-circle inhale'; bT.push(setTimeout(() => { if (!bAct) return; t.innerText = "زفــيــر 💨"; c.className = 'breath-circle'; if (navigator.vibrate) navigator.vibrate([100, 50]); bT.push(setTimeout(() => { if (!bAct) return; bC(c, t); }, 4000)); }, 2000)); }, 4000)); }

// --- Audio (API) ---
let actOs = {};
window.toggleNoise = function (y) {
    if (!window.aCtx) { window.aCtx = new (window.AudioContext || window.webkitAudioContext)(); } if (window.aCtx.state === 'suspended') window.aCtx.resume();
    const b = document.getElementById('modal-body').querySelector('#btn-' + y); if (actOs[y]) { actOs[y].stop(); actOs[y] = null; if (b) b.classList.remove('playing'); return; }
    stopAllNoise(); const z = window.aCtx.createBufferSource(), bf = window.aCtx.createBuffer(1, window.aCtx.sampleRate * 2, window.aCtx.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < d.length; i++)d[i] = Math.random() * 2 - 1; z.buffer = bf; z.loop = true;
    const f = window.aCtx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = y === 'rain' ? 400 : 800; const g = window.aCtx.createGain(); g.gain.value = 0.5; z.connect(f); f.connect(g); g.connect(window.aCtx.destination); z.start(); actOs[y] = z; if (b) b.classList.add('playing');
};
window.stopAllNoise = function () { Object.keys(actOs).forEach(k => { if (actOs[k]) { try { actOs[k].stop(); } catch (e) { } actOs[k] = null; } }); const bs = document.querySelectorAll('.noise-btn'); bs.forEach(b => b.classList.remove('playing')); };

// --- Standard Logic & Helpers ---
// (Minified helpers for existing logic, focusing on new features)
function getModalElement(s) { const m = document.getElementById('modal-body'); return m ? m.querySelector(s) : document.querySelector(s); }
function getVal(id) { const e = getModalElement('#' + id); return e ? e.value : ''; }
function setModalHtml(id, h) { const e = getModalElement('#' + id); if (e) { e.innerHTML = h; e.classList.remove('hidden'); } }
function showLoading(c) { const l = document.getElementById('global-loading'); if (l) l.classList.remove('hidden'); setTimeout(() => { if (l) l.classList.add('hidden'); c(); }, 800); }
let tInt = null, tS = 0, fInt = null, fS = 0, cStr = "0", goals = JSON.parse(localStorage.getItem('mind_goals_v1')) || [];

window.switchPage = function (id) { document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page')); const t = document.getElementById('page-' + id); if (t) t.classList.add('active-page'); document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); const map = { 'home': 0, 'mind': 1, 'goals': 2, 'gym': 3, 'tools': 4 }; const n = document.querySelectorAll('.nav-item')[map[id]]; if (n) n.classList.add('active'); };
window.toggleTheme = function () { document.body.classList.toggle('light-mode'); localStorage.setItem('mind_theme', document.body.classList.contains('light-mode') ? 'light' : 'dark'); };
window.closeTool = function () { const m = document.getElementById('tool-modal'); if (m) m.classList.add('hidden'); window.stopFocus(); window.stopTimer(); window.stopAllNoise(); if (typeof toggleBreathing === 'function' && breathingActive) toggleBreathing(); };
window.startTimer = function () { if (tInt) return; tInt = setInterval(() => { tS++; const e = getModalElement('#timer-display'); if (e) e.innerText = new Date(tS * 1000).toISOString().substr(11, 8); }, 1000); };
window.stopTimer = function () { clearInterval(tInt); tInt = null; };
window.resetTimer = function () { stopTimer(); tS = 0; const e = getModalElement('#timer-display'); if (e) e.innerText = "00:00:00"; };
window.setFocusTime = function (m) { stopFocus(); const i = getModalElement('#focus-input'); if (i) i.value = m; fS = m * 60; udF(); };
window.startFocus = function () { if (fInt) return; const i = getModalElement('#focus-input'); if (i && i.value) { const v = parseInt(i.value); if (!isNaN(v) && (fS === 0 || Math.abs(fS - v * 60) > 60)) fS = v * 60; } if (fS <= 0) { alert("وقت؟"); return; } udF(); fInt = setInterval(() => { fS--; if (fS <= 0) { stopFocus(); alert("⏰"); } udF(); }, 1000); };
window.stopFocus = function () { if (fInt) clearInterval(fInt); fInt = null; };
function udF() { const e = getModalElement('#focus-display'); if (e) { let m = Math.floor(fS / 60), s = fS % 60; e.innerText = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s); } }
window.appendCalc = function (v) { if (cStr === "0" || cStr === "Error") cStr = v; else cStr += v; udC(); };
window.chooseOp = function (o) { if (cStr.slice(-1).match(/[+\-*/]/)) return; cStr += o; udC(); };
window.clearCalc = function () { cStr = "0"; udC(); };
window.toggleSign = function () { if (!isNaN(parseFloat(cStr))) { cStr = (parseFloat(cStr) * -1).toString(); udC(); } };
window.percent = function () { if (!isNaN(parseFloat(cStr))) { cStr = (parseFloat(cStr) / 100).toString(); udC(); } };
window.calculate = function () { try { cStr = eval(cStr.replace('×', '*').replace('÷', '/')).toString(); if (cStr.includes('.')) { const a = cStr.split('.'); if (a[1].length > 5) cStr = parseFloat(cStr).toFixed(5); } } catch { cStr = "Error"; } udC(); };
function udC() { const e = getModalElement('#calc-display'); if (e) e.value = cStr; }
window.addGoal = function () { const i = document.getElementById('new-goal-text'); if (!i || !i.value.trim()) return; goals.push({ text: i.value.trim(), done: false }); localStorage.setItem('mind_goals_v1', JSON.stringify(goals)); renderGoals(); i.value = ''; };
window.toggleGoal = function (i) { if (goals[i]) { goals[i].done = !goals[i].done; localStorage.setItem('mind_goals_v1', JSON.stringify(goals)); renderGoals(); } };
window.deleteGoal = function (i) { goals.splice(i, 1); localStorage.setItem('mind_goals_v1', JSON.stringify(goals)); renderGoals(); };
function renderGoals() { const l = document.getElementById('goals-list'), e = document.getElementById('empty-state'); if (!l) return; l.innerHTML = ''; if (goals.length === 0) { if (e) e.style.display = 'block'; } else { if (e) e.style.display = 'none'; goals.forEach((g, i) => { const x = document.createElement('li'); x.className = `goal-item ${g.done ? 'done' : ''}`; x.innerHTML = `<i class="fa-regular ${g.done ? 'fa-square-check' : 'fa-square'}"></i><span style="flex:1;margin-right:10px">${g.text}</span><i class="fa-solid fa-trash" onclick="deleteGoal(${i});event.stopPropagation()" style="color:#e74c3c"></i>`; x.onclick = () => toggleGoal(i); l.appendChild(x); }); } }
window.calculateLove = function () { if (!getVal('name1')) return; showLoading(() => { setModalHtml('love-result', `<h1 style="color:#ff7675">${Math.floor(Math.random() * 50) + 50}%</h1><p>حب حقيقي!</p>`); }); };
window.predictMoney = function () { if (!getVal('money-name')) return; showLoading(() => { const f = ["ثروة طائلة", "نجاح مبهر", "استقرار مالي"]; setModalHtml('money-result', `<h3>${f[Math.floor(Math.random() * f.length)]}</h3>`); }); };
window.getLuck = function () { showLoading(() => { setModalHtml('luck-result', `<h3>أيام سعيدة قادمة ✨</h3>`); }); };
window.interpretDream = function () { if (!getVal('dreamInput')) return; showLoading(() => { setModalHtml('dream-result', `<p>رسالة خير تدل على الرزق.</p>`); }); };
window.analyzePersonality = function () { if (!getVal('p-name')) return; showLoading(() => { setModalHtml('personality-result', `<h3>شخصية استثنائية 🦁</h3>`); }); };
window.makeDecision = function () { if (!getVal('decision-input')) return; showLoading(() => { setModalHtml('decision-result', `<h3>القرار الصحيح هو: نعم ✅</h3>`); }); };
window.suggestBabyName = function () { showLoading(() => { setModalHtml('baby-result', `<h1>${getVal('baby-gender') === 'boy' ? 'آدم' : 'مكة'}</h1>`); }); };
window.findSpiritAnimal = function () { if (!getVal('animal-name')) return; showLoading(() => { setModalHtml('animal-result', `<h3>🦅 العقاب</h3>`); }); };
window.calcBMI = function () { const w = parseFloat(document.getElementById('weight').value), h = parseFloat(document.getElementById('height').value); if (!w || !h) return; const b = w / ((h / 100) * (h / 100)); document.getElementById('bmi-result').innerHTML = `<h2 style="color:${b < 25 ? '#2ecc71' : '#e74c3c'}">${b.toFixed(1)}</h2>`; document.getElementById('bmi-result').classList.remove('hidden'); };
window.getWorkout = function () { document.getElementById('workout-result').innerHTML = `<p>تمارين مخصصة لـ ${document.getElementById('muscle-group').value}</p>`; document.getElementById('workout-result').classList.remove('hidden'); };
