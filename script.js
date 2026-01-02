document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    try {
        const streak = localStorage.getItem('mind_streak') || 0;
        const el = document.getElementById('streak-count');
        if (el) el.innerText = streak;
    } catch (e) { }
    try {
        if (localStorage.getItem('mind_theme') === 'light') document.body.classList.add('light-mode');
    } catch (e) { }
    renderGoals();
}

// --- WEB AUDIO API (The Fix) ---
let audioCtx;
let activeOscillators = {};

function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Generate Noise Buffer (Pure JS Sound)
function createNoiseBuffer() {
    if (!audioCtx) return;
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds buffer
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        // White noise
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
}

window.toggleNoise = function (type) {
    // 1. Init Audio Context on First Click (Required for Mobile)
    initAudio();

    const btn = document.getElementById('modal-body').querySelector('#btn-' + type);

    // If playing, stop it
    if (activeOscillators[type]) {
        activeOscillators[type].stop();
        activeOscillators[type] = null;
        if (btn) btn.classList.remove('playing');
        return;
    }

    // Stop other noise first (optional, but cleaner)
    stopAllNoise();

    // 2. Create Source
    const buffer = createNoiseBuffer();
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // 3. Create Filter to shape the sound (Rain vs Fire)
    const filter = audioCtx.createBiquadFilter();

    if (type === 'rain') {
        // Brown-ish noise for Rain (Low Pass)
        filter.type = 'lowpass';
        filter.frequency.value = 400;
    } else {
        // Crackle-ish noise for Fire (High Pass + Low Pass combo approximation)
        filter.type = 'lowpass';
        filter.frequency.value = 800; // Slightly brighter/warmer
    }

    // 4. Volume Control
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.5; // 50% Volume

    // Connect graph: Source -> Filter -> Gain -> Destination
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseSource.start();
    activeOscillators[type] = noiseSource;
    if (btn) btn.classList.add('playing');
};

window.stopAllNoise = function () {
    Object.keys(activeOscillators).forEach(key => {
        if (activeOscillators[key]) {
            try { activeOscillators[key].stop(); } catch (e) { }
            activeOscillators[key] = null;
        }
    });
    // Remove playing classes
    const btns = document.querySelectorAll('.noise-btn');
    btns.forEach(b => b.classList.remove('playing'));
};

window.playAlarm = function () {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
};


// --- Standard Logic (Same as before) ---
window.switchPage = function (pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active-page');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    // Manual mapping
    const navs = document.querySelectorAll('.nav-item');
    if (pageId === 'home' && navs[0]) navs[0].classList.add('active');
    if (pageId === 'mind' && navs[1]) navs[1].classList.add('active');
    if (pageId === 'goals' && navs[2]) navs[2].classList.add('active');
    if (pageId === 'gym' && navs[3]) navs[3].classList.add('active');
    if (pageId === 'tools' && navs[4]) navs[4].classList.add('active');
};

window.toggleTheme = function () {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('mind_theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
};

window.openTool = function (toolName) {
    const modal = document.getElementById('tool-modal');
    const body = document.getElementById('modal-body');
    const tpl = document.getElementById('tpl-' + toolName);
    if (!modal || !body || !tpl) return;
    body.innerHTML = tpl.innerHTML;
    modal.classList.remove('hidden');
    if (toolName === 'calculator') clearCalc();
};

window.closeTool = function () {
    const modal = document.getElementById('tool-modal');
    if (modal) modal.classList.add('hidden');
    stopFocus();
    stopTimer();
    stopAllNoise();
};

// --- Focus Timer ---
let focusInterval = null;
let focusSeconds = 0;

window.setFocusTime = function (mins) {
    stopFocus();
    const input = getModalElement('#focus-input');
    if (input) input.value = mins;
    focusSeconds = mins * 60;
    updateFocusDisplay();
};

window.startFocus = function () {
    if (focusInterval) return;
    const input = getModalElement('#focus-input');
    if (input && input.value) {
        const val = parseInt(input.value);
        if (!isNaN(val) && (focusSeconds === 0 || Math.abs(focusSeconds - val * 60) > 60)) {
            focusSeconds = val * 60;
        }
    }
    if (focusSeconds <= 0) { alert("حدد الوقت"); return; }

    updateFocusDisplay();
    focusInterval = setInterval(() => {
        focusSeconds--;
        if (focusSeconds <= 0) {
            stopFocus();
            playAlarm(); // Use JS Alarm
            alert("⏰ انتهى الوقت!");
        }
        updateFocusDisplay();
    }, 1000);
};

window.stopFocus = function () {
    if (focusInterval) clearInterval(focusInterval);
    focusInterval = null;
};

function updateFocusDisplay() {
    const el = getModalElement('#focus-display');
    if (!el) return;
    let m = Math.floor(focusSeconds / 60);
    let s = focusSeconds % 60;
    el.innerText = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}

// --- iOS Calculator Logic ---
let calcStr = "0";

window.appendCalc = function (v) {
    if (calcStr === "0" || calcStr === "Error") calcStr = v;
    else calcStr += v;
    updateCalc();
};

window.chooseOp = function (op) {
    if (calcStr.slice(-1).match(/[+\-*/]/)) return;
    calcStr += op;
    updateCalc();
};

window.clearCalc = function () {
    calcStr = "0";
    updateCalc();
};

window.toggleSign = function () {
    if (calcStr === "0") return;
    if (!isNaN(parseFloat(calcStr))) {
        calcStr = (parseFloat(calcStr) * -1).toString();
    }
    updateCalc();
};

window.percent = function () {
    if (!isNaN(parseFloat(calcStr))) {
        calcStr = (parseFloat(calcStr) / 100).toString();
        updateCalc();
    }
};

window.calculate = function () {
    try {
        calcStr = eval(calcStr.replace('×', '*').replace('÷', '/')).toString();
        if (calcStr.includes('.')) {
            const arr = calcStr.split('.');
            if (arr[1].length > 5) calcStr = parseFloat(calcStr).toFixed(5);
        }
    } catch {
        calcStr = "Error";
    }
    updateCalc();
};

function updateCalc() {
    const el = getModalElement('#calc-display');
    if (el) el.value = calcStr;
}

// --- Goals & Magic Tools ---
const goalsKey = 'mind_goals_v1';
let goals = JSON.parse(localStorage.getItem(goalsKey)) || [];

window.addGoal = function () {
    const input = document.getElementById('new-goal-text');
    if (!input || !input.value.trim()) return;
    goals.push({ text: input.value.trim(), done: false });
    saveGoals(); renderGoals(); input.value = '';
};
window.toggleGoal = function (i) { if (goals[i]) { goals[i].done = !goals[i].done; saveGoals(); renderGoals(); } };
window.deleteGoal = function (i) { goals.splice(i, 1); saveGoals(); renderGoals(); };
function saveGoals() { localStorage.setItem(goalsKey, JSON.stringify(goals)); }
function renderGoals() {
    const list = document.getElementById('goals-list');
    const empty = document.getElementById('empty-state');
    if (!list) return;
    list.innerHTML = '';
    if (goals.length === 0) { if (empty) empty.style.display = 'block'; }
    else {
        if (empty) empty.style.display = 'none';
        goals.forEach((g, i) => {
            const li = document.createElement('li');
            li.className = `goal-item ${g.done ? 'done' : ''}`;
            li.innerHTML = `<i class="fa-regular ${g.done ? 'fa-square-check' : 'fa-square'}"></i><span style="flex:1;margin-right:10px">${g.text}</span><i class="fa-solid fa-trash" onclick="deleteGoal(${i});event.stopPropagation()" style="color:#e74c3c"></i>`;
            li.onclick = () => toggleGoal(i);
            list.appendChild(li);
        });
    }
}

// Helpers
function getModalElement(sel) { const m = document.getElementById('modal-body'); return m ? m.querySelector(sel) : null; }
function setModalHtml(id, h) { const el = getModalElement('#' + id); if (el) { el.innerHTML = h; el.classList.remove('hidden'); } }
function showLoading(cb) { const l = document.getElementById('global-loading'); if (l) l.classList.remove('hidden'); setTimeout(() => { if (l) l.classList.add('hidden'); cb(); }, 800); }
function getVal(id) { const el = getModalElement('#' + id); return el ? el.value : ''; }

window.calculateLove = function () { if (!getVal('name1')) return; showLoading(() => { setModalHtml('love-result', `<h1 style="color:#ff7675">${Math.floor(Math.random() * 50) + 50}%</h1><p>حب حقيقي!</p>`); }); };
window.predictMoney = function () { if (!getVal('money-name')) return; showLoading(() => { const f = ["ثروة طائلة", "نجاح مبهر", "استقرار مالي"]; setModalHtml('money-result', `<h3>${f[Math.floor(Math.random() * f.length)]}</h3>`); }); };
window.getLuck = function () { showLoading(() => { setModalHtml('luck-result', `<h3>أيام سعيدة قادمة ✨</h3>`); }); };
window.interpretDream = function () { if (!getVal('dreamInput')) return; showLoading(() => { setModalHtml('dream-result', `<p>رسالة خير تدل على الرزق.</p>`); }); };
window.analyzePersonality = function () { if (!getVal('p-name')) return; showLoading(() => { setModalHtml('personality-result', `<h3>شخصية استثنائية 🦁</h3>`); }); };
window.makeDecision = function () { if (!getVal('decision-input')) return; showLoading(() => { setModalHtml('decision-result', `<h3>القرار الصحيح هو: نعم ✅</h3>`); }); };
window.suggestBabyName = function () { showLoading(() => { setModalHtml('baby-result', `<h1>${getVal('baby-gender') === 'boy' ? 'آدم' : 'مكة'}</h1>`); }); };
window.findSpiritAnimal = function () { if (!getVal('animal-name')) return; showLoading(() => { setModalHtml('animal-result', `<h3>🦅 العقاب</h3>`); }); };
window.calcBMI = function () {
    const w = parseFloat(document.getElementById('weight').value), h = parseFloat(document.getElementById('height').value);
    if (!w || !h) return;
    const b = w / ((h / 100) * (h / 100));
    document.getElementById('bmi-result').innerHTML = `<h2 style="color:${b < 25 ? '#2ecc71' : '#e74c3c'}">${b.toFixed(1)}</h2>`;
    document.getElementById('bmi-result').classList.remove('hidden');
};
window.getWorkout = function () { document.getElementById('workout-result').innerHTML = `<p>تمارين مخصصة لـ ${document.getElementById('muscle-group').value}</p>`; document.getElementById('workout-result').classList.remove('hidden'); };

let tInt = null, tS = 0;
window.startTimer = function () { if (tInt) return; tInt = setInterval(() => { tS++; const el = getModalElement('#timer-display'); if (el) el.innerText = new Date(tS * 1000).toISOString().substr(11, 8); }, 1000); };
window.stopTimer = function () { clearInterval(tInt); tInt = null; };
window.resetTimer = function () { stopTimer(); tS = 0; const el = getModalElement('#timer-display'); if (el) el.innerText = "00:00:00"; };
