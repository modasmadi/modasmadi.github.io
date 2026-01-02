// --- Navigation Logic ---
function openSection(sectionId) {
    document.getElementById('dashboard').classList.add('hidden');
    document.querySelectorAll('.tool-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(sectionId + '-section').classList.remove('hidden');
}

function goHome() {
    document.querySelectorAll('.tool-section').forEach(el => el.classList.add('hidden'));
    document.getElementById('dashboard').classList.remove('hidden');
    clearResults();
}

function clearResults() {
    document.querySelectorAll('.result-box').forEach(el => {
        el.classList.add('hidden');
        el.innerHTML = '';
    });
    document.querySelectorAll('input, textarea').forEach(el => el.value = '');
}

function showLoading(callback) {
    const loader = document.getElementById('global-loading');
    loader.classList.remove('hidden');
    setTimeout(() => {
        loader.classList.add('hidden');
        callback();
    }, 1500); // Faster loading for better UX
}

// --- Helper Share ---
function shareText(text) {
    const url = "whatsapp://send?text=" + encodeURIComponent(text + "\n\n✨ جرب بنفسك في موقع البلورة السحرية 🔮");
    window.location.href = url;
}


// --- 1. Love Calculator ❤️ ---
function calculateLove() {
    const n1 = document.getElementById('name1').value.trim();
    const n2 = document.getElementById('name2').value.trim();

    if (!n1 || !n2) { alert("أدخل الاسمين أولاً!"); return; }

    showLoading(() => {
        const combined = n1 + n2;
        let hash = 0;
        for (let i = 0; i < combined.length; i++) hash = combined.charCodeAt(i) + ((hash << 5) - hash);
        let percentage = Math.abs(hash % 101);

        let msg = percentage > 85 ? "حب أسطوري! 🔥" : (percentage > 50 ? "علاقة ناجحة." : "تحتاجان للعمل بجد.");

        const resDiv = document.getElementById('love-result');
        resDiv.innerHTML = `<div style="font-size: 3rem; text-align: center; color: var(--love);">${percentage}%</div><p style="text-align: center;">${msg}</p><button onclick="shareText('نسبة توافقنا ${percentage}%! ❤️')" class="action-btn" style="background:#25D366; margin-top:10px;">شارك النتيجة</button>`;
        resDiv.classList.remove('hidden');
    });
}

// --- 2. Personality Analysis 🧠 ---
function analyzePersonality() {
    const name = document.getElementById('p-name').value.trim();
    if (name.length < 2) { alert("اكتب اسمك!"); return; }

    const traits = ["قائد بالفطرة", "قلب طيب جداً", "غامض وساحر", "ذكي ومحلل", "مبدع وخيالي", "عنيد لكن طموح"];

    showLoading(() => {
        const index = name.length % traits.length;
        const resDiv = document.getElementById('personality-result');
        resDiv.innerHTML = `<h3>تحليل ${name}:</h3><p>${traits[index]}</p><button onclick="shareText('تحليل شخصيتي: ${traits[index]} 🧠')" class="action-btn" style="background:#25D366; margin-top:10px;">شارك</button>`;
        resDiv.classList.remove('hidden');
    });
}

// --- 3. Dream Interpreter 🌙 ---
function interpretDream() {
    const input = document.getElementById('dreamInput').value;
    if (input.length < 3) { alert("اكتب الحلم!"); return; }

    showLoading(() => {
        const keywords = { 'موت': 'تغيير كبير', 'بحر': 'رزق واسع', 'سقوط': 'قلق داخلي', 'ثعبان': 'عدو خفي', 'زواج': 'بداية جديدة', 'طيران': 'نجاح', 'نقود': 'فرج' };
        let explanation = "رغبة في التغيير الإيجابي.";
        for (const [key, val] of Object.entries(keywords)) if (input.includes(key)) explanation = `رمز (${key}) يعني: ${val}`;

        const resDiv = document.getElementById('dream-result');
        resDiv.innerHTML = `<p><strong>التفسير:</strong> ${explanation}</p><button onclick="shareText('تفسير حلمي: ${explanation} 🌙')" class="action-btn" style="background:#25D366; margin-top:10px;">شارك</button>`;
        resDiv.classList.remove('hidden');
    });
}

// --- 4. Luck 🍀 ---
function getLuck() {
    const msgs = ["حظ مالي قادم!", "احذر التسرع.", "شخص يشتاق لك.", "فرصة عمل قريبة.", "يومك سعيد جداً."];
    showLoading(() => {
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        document.getElementById('luck-result').innerHTML = `<p style="color:var(--accent);">${msg}</p><button onclick="shareText('حظي اليوم: ${msg} 🍀')" class="action-btn" style="background:#25D366; margin-top:10px;">شارك</button>`;
        document.getElementById('luck-result').classList.remove('hidden');
    });
}

// --- 5. Money Predictor 💰 ---
function predictMoney() {
    const name = document.getElementById('money-name').value;
    if (!name) return;

    const fortunes = [
        "ستصبح مليونيراً في عمر 35! 💵",
        "ثروتك ستأتي من مشروع خاص.",
        "ستكون مرتاحاً مادياً، لكن ليس فاحش الثراء.",
        "الحظ المالي سيحالفك العام القادم.",
        "استثمر في العقار، هناك كنز ينتظرك."
    ];

    showLoading(() => {
        const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        document.getElementById('money-result').innerHTML = `<p style="font-size:1.2rem; text-align:center;">${fortune}</p><button onclick="shareText('توقع ثروتي: ${fortune} 💰')" class="action-btn" style="background:#25D366; margin-top:10px;">شارك</button>`;
        document.getElementById('money-result').classList.remove('hidden');
    });
}

// --- 6. Decision Maker ⚖️ ---
function makeDecision() {
    const input = document.getElementById('decision-input').value;
    if (input.length < 3) return;

    const answers = ["توكل على الله، افعلها!", "لا، هذا قرار خاطئ.", "انتظر قليلاً، الوقت غير مناسب.", "اسأل شخصاً حكيماً أولاً.", "النتائج ستكون مذهلة، انطلق!"];

    showLoading(() => {
        const ans = answers[Math.floor(Math.random() * answers.length)];
        document.getElementById('decision-result').innerHTML = `<h3 style="text-align:center; color:var(--accent)">القاضي يقول:</h3><p style="text-align:center; font-size:1.5rem;">${ans}</p><button onclick="shareText('سألت المحكمة وقالت: ${ans} ⚖️')" class="action-btn" style="background:#25D366; margin-top:10px;">شارك</button>`;
        document.getElementById('decision-result').classList.remove('hidden');
    });
}

// --- 7. Baby Name 👶 ---
function suggestBabyName() {
    const gender = document.getElementById('baby-gender').value;
    const boys = ["ريان", "آدم", "نوح", "فهد", "يزيد", "سلمان", "زين", "يوسف"];
    const girls = ["ميرا", "ليان", "جوري", "سلمى", "نور", "ملك", "تالا", "لين"];

    showLoading(() => {
        const list = gender === 'boy' ? boys : girls;
        const name = list[Math.floor(Math.random() * list.length)];
        document.getElementById('baby-result').innerHTML = `<p style="text-align:center;">الاسم المقترح هو:</p><h2 style="text-align:center; color:var(--love); font-size:2.5rem;">${name}</h2><button onclick="shareText('اقترح علي اسم طفلي: ${name} 👶')" class="action-btn" style="background:#25D366; margin-top:10px;">شارك</button>`;
        document.getElementById('baby-result').classList.remove('hidden');
    });
}

// --- 8. Spirit Animal 🦁 ---
function findSpiritAnimal() {
    const name = document.getElementById('animal-name').value;
    if (!name) return;

    const animals = [
        { names: "الأسد", desc: "القوة والقيادة" },
        { names: "الذئب", desc: "الذكاء والوفاء" },
        { names: "الصقر", desc: "الرؤية العالية والحرية" },
        { names: "الغزال", desc: "الجمال والسرعة" },
        { names: "البومة", desc: "الحكمة والهدوء" },
        { names: "النمر", desc: "الشجاعة والسرعة" }
    ];

    showLoading(() => {
        const index = name.length % animals.length; // Simple hash
        const animal = animals[index];
        document.getElementById('animal-result').innerHTML = `<div style="text-align:center;"><h3>${animal.names}</h3><p>${animal.desc}</p></div><button onclick="shareText('حيواني الروحي هو ${animal.names} 🦁')" class="action-btn" style="background:#25D366; margin-top:10px;">شارك</button>`;
        document.getElementById('animal-result').classList.remove('hidden');
    });
}

// --- Calculator Logic ---
let calcValue = '';
function appendCalc(val) { calcValue += val; updateDisp(); }
function clearCalc() { calcValue = ''; updateDisp(); }
function updateDisp() { document.getElementById('calc-display').value = calcValue; }
function chooseOp(op) { if (calcValue) { calcValue += op; updateDisp(); } }
function calculate() {
    try {
        calcValue = eval(calcValue).toString();
        updateDisp();
    } catch (e) {
        calcValue = 'Error';
        updateDisp();
        setTimeout(clearCalc, 1000);
    }
}
function setCalcMode(mode) {
    document.querySelectorAll('.calc-mode-switch button').forEach(b => b.classList.remove('active-mode'));
    event.target.classList.add('active-mode');
    if (mode === 'scientific') {
        document.getElementById('simple-keys').classList.add('hidden');
        document.getElementById('scientific-keys').classList.remove('hidden');
    } else {
        document.getElementById('simple-keys').classList.remove('hidden');
        document.getElementById('scientific-keys').classList.add('hidden');
    }
}
function calcFunc(fn) {
    if (!calcValue) return;
    let val = parseFloat(calcValue);
    let res = 0;
    if (fn == 'sin') res = Math.sin(val);
    if (fn == 'cos') res = Math.cos(val);
    if (fn == 'tan') res = Math.tan(val);
    if (fn == 'sqrt') res = Math.sqrt(val);
    if (fn == 'log') res = Math.log10(val);
    if (fn == 'pow') { calcValue += '**'; updateDisp(); return; } // Handle power op next
    calcValue = res.toString();
    updateDisp();
}

// --- Stopwatch Logic ---
let timerInterval;
let seconds = 0;
let isTimerRunning = false;

function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            seconds++;
            updateTimerDisplay();
        }, 1000);
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
}

function resetTimer() {
    stopTimer();
    seconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = seconds % 60;
    document.getElementById('timer-display').innerText = `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function pad(n) { return n < 10 ? '0' + n : n; }
