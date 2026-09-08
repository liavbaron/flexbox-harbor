// ==============================================================
//  Flexbox Harbor – לוגיקת המשחק
// ==============================================================

// Application State
let currentLevelIndex = 0;
let attemptsCount = 0;
let score = 0;
let soundEnabled = true;

// ערכי ברירת מחדל של מאפייני Flexbox (למאפיינים שאינם נשלטים בשלב)
const FLEX_DEFAULTS = {
    "flex-direction": "row",
    "justify-content": "flex-start",
    "align-items": "flex-start",
    "flex-wrap": "nowrap"
};

// DOM Elements
const boatsLayer = document.getElementById("boats-layer");
const islandsLayer = document.getElementById("islands-layer");
const levelIndicator = document.getElementById("level-indicator");
const attemptsDisplay = document.getElementById("attempts-count");
const scoreDisplay = document.getElementById("score-display");
const levelTitle = document.getElementById("level-title");
const levelInstruction = document.getElementById("level-instruction");
const levelSelect = document.getElementById("level-select");
const feedbackMessage = document.getElementById("feedback-message");
const successModal = document.getElementById("success-modal");
const soundToggleBtn = document.getElementById("sound-toggle-btn");

const controls = {
    "flex-direction": document.getElementById("flex-direction"),
    "justify-content": document.getElementById("justify-content"),
    "align-items": document.getElementById("align-items"),
    "flex-wrap": document.getElementById("flex-wrap")
};

const controlGroups = {
    "flex-direction": document.getElementById("group-direction"),
    "justify-content": document.getElementById("group-justify"),
    "align-items": document.getElementById("group-align"),
    "flex-wrap": document.getElementById("group-wrap")
};

// ---------- אודיו (Web Audio API – ללא קבצים חיצוניים) ----------
function playSound(type) {
    if (!soundEnabled) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === "success") {
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === "error") {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(220, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        }
    } catch (e) {
        console.log("Audio not supported or restricted.");
    }
}

// ---------- שמירת/טעינת התקדמות (localStorage) ----------
function saveProgress() {
    const data = { currentLevelIndex, score };
    try { localStorage.setItem("flexbox_harbor_progress", JSON.stringify(data)); }
    catch (e) { /* localStorage לא זמין – ממשיכים ללא שמירה */ }
}

function loadProgress() {
    try {
        const saved = localStorage.getItem("flexbox_harbor_progress");
        if (saved) {
            const data = JSON.parse(saved);
            currentLevelIndex = data.currentLevelIndex || 0;
            score = data.score || 0;
            scoreDisplay.textContent = `ניקוד: ${score}`;
        }
    } catch (e) { /* מתעלמים מנתונים פגומים */ }
}

// ---------- אתחול ----------
function initApp() {
    loadProgress();
    populateLevelSelect();
    attachEventListeners();
    loadLevel(currentLevelIndex);
    fitBoard();
    window.addEventListener("resize", fitBoard);
}

function populateLevelSelect() {
    levelSelect.innerHTML = "";
    GAME_LEVELS.forEach((level, idx) => {
        const opt = document.createElement("option");
        opt.value = idx;
        opt.textContent = `שלב ${level.id}`;
        levelSelect.appendChild(opt);
    });
}

// ---------- טעינת שלב ----------
function loadLevel(index) {
    currentLevelIndex = index;
    attemptsCount = 0;
    const level = GAME_LEVELS[index];

    levelIndicator.textContent = `שלב ${level.id} מתוך ${GAME_LEVELS.length}`;
    attemptsDisplay.textContent = `ניסיונות בשלב זה: ${attemptsCount}`;
    levelTitle.textContent = level.title;
    levelInstruction.textContent = level.instruction;
    levelSelect.value = index;

    feedbackMessage.className = "feedback hidden";
    successModal.classList.add("hidden");

    // הצגת/הסתרת רכיבי הבקרה הרלוונטיים לשלב
    Object.keys(controlGroups).forEach(key => {
        if (level.availableControls.includes(key)) {
            controlGroups[key].classList.remove("hidden");
        } else {
            controlGroups[key].classList.add("hidden");
        }
    });

    // איפוס הבקרות לערכי הפתיחה של השלב
    Object.keys(controls).forEach(key => {
        controls[key].value = level.initialCSS[key] || FLEX_DEFAULTS[key];
    });

    renderBoard(level);
    applyUserStyles();
    saveProgress();
    fitBoard();
}

// ---------- רינדור הלוח (איים = יעד, סירות = נשלטות) ----------
function renderBoard(level) {
    boatsLayer.innerHTML = "";
    islandsLayer.innerHTML = "";

    // שכבת האיים תמיד מציגה את פתרון היעד (רמז ויזואלי)
    Object.assign(islandsLayer.style, {
        display: "flex",
        "flex-direction": level.targetCSS["flex-direction"] || FLEX_DEFAULTS["flex-direction"],
        "justify-content": level.targetCSS["justify-content"] || FLEX_DEFAULTS["justify-content"],
        "align-items": level.targetCSS["align-items"] || FLEX_DEFAULTS["align-items"],
        "flex-wrap": level.targetCSS["flex-wrap"] || FLEX_DEFAULTS["flex-wrap"]
    });

    level.islands.forEach(emoji => {
        const item = document.createElement("div");
        item.className = "game-item island";
        item.textContent = emoji;
        islandsLayer.appendChild(item);
    });

    level.boats.forEach(emoji => {
        const item = document.createElement("div");
        item.className = "game-item boat";
        item.textContent = emoji;
        boatsLayer.appendChild(item);
    });
}

// ---------- החלת הבחירות של המשתמש על שכבת הסירות ----------
function applyUserStyles() {
    const level = GAME_LEVELS[currentLevelIndex];

    Object.keys(controls).forEach(key => {
        if (level.availableControls.includes(key)) {
            // מאפיין שהמשתמש שולט בו – לפי הבחירה שלו
            boatsLayer.style[key] = controls[key].value;
        } else {
            // מאפיין שאינו חלק מהחידה – מיושר מראש לערך היעד כדי שלא ישפיע על הפתרון
            boatsLayer.style[key] = level.targetCSS[key] || FLEX_DEFAULTS[key];
        }
    });
}

// ---------- בדיקת פתרון ----------
function checkSolution() {
    attemptsCount++;
    attemptsDisplay.textContent = `ניסיונות בשלב זה: ${attemptsCount}`;

    const level = GAME_LEVELS[currentLevelIndex];
    let isCorrect = true;

    for (let key of level.availableControls) {
        if (controls[key].value !== level.targetCSS[key]) {
            isCorrect = false;
            break;
        }
    }

    if (isCorrect) {
        playSound("success");
        score += Math.max(100 - (attemptsCount - 1) * 10, 20);
        scoreDisplay.textContent = `ניקוד: ${score}`;

        feedbackMessage.textContent = "מצוין! כל הסירות הגיעו ליעד!";
        feedbackMessage.className = "feedback success";

        saveProgress();
        setTimeout(() => {
            const modalText = document.getElementById("modal-text");
            const nextBtn = document.getElementById("next-level-btn");
            const modalTitle = document.querySelector("#success-modal h2");

            if (currentLevelIndex + 1 === GAME_LEVELS.length) {
                modalTitle.textContent = "🏆 כל הכבוד! סיימת את המשחק!";
                modalText.textContent = `השלמת בהצלחה את כל ${GAME_LEVELS.length} השלבים עם ניקוד כולל של ${score} נקודות!`;
                nextBtn.textContent = "סגור וחזור לתחילה ✖️";
            } else {
                modalTitle.textContent = "🎉 כל הכבוד! הפתרון נכון!";
                modalText.textContent = `השלמת את ${level.title} תוך ${attemptsCount} ניסיונות!`;
                nextBtn.textContent = "לשלב הבא ➔";
            }

            successModal.classList.remove("hidden");
        }, 400);
    } else {
        playSound("error");
        feedbackMessage.textContent = "לא מדויק, הסירות עדיין לא במקום הנכון. נסו שוב!";
        feedbackMessage.className = "feedback error";
    }
}

// ---------- התאמת גודל הלוח למסך (scale ששומר על גיאומטריה) ----------
function fitBoard() {
    const scaler = document.querySelector(".board-scaler");
    const wrapper = document.querySelector(".board-wrapper");
    if (!scaler || !wrapper) return;

    // ביטול scale זמנית כדי למדוד את הגודל הטבעי
    wrapper.style.transform = "none";
    const naturalW = wrapper.offsetWidth;
    const naturalH = wrapper.offsetHeight;

    const stage = scaler.parentElement;                 // .game-stage
    const available = stage.clientWidth - 4;            // מרווח קטן לביטחון
    const scale = Math.min(1, available / naturalW);

    wrapper.style.transform = `scale(${scale})`;
    // ה-scaler שומר על השטח שהלוח המוקטן תופס בפריסה
    scaler.style.width = (naturalW * scale) + "px";
    scaler.style.height = (naturalH * scale) + "px";
}

// ---------- מאזיני אירועים ----------
function attachEventListeners() {
    Object.values(controls).forEach(select => {
        select.addEventListener("change", applyUserStyles);
    });

    document.getElementById("check-btn").addEventListener("click", checkSolution);

    document.getElementById("reset-level-btn").addEventListener("click", () => {
        loadLevel(currentLevelIndex);
    });

    document.getElementById("reset-all-btn").addEventListener("click", () => {
        if (confirm("האם אתה בטוח שברצונך לאפס את כל ההתקדמות במשחק?")) {
            try { localStorage.removeItem("flexbox_harbor_progress"); } catch (e) {}
            score = 0;
            scoreDisplay.textContent = `ניקוד: 0`;
            loadLevel(0);
        }
    });

    levelSelect.addEventListener("change", (e) => {
        loadLevel(parseInt(e.target.value, 10));
    });

    document.getElementById("next-level-btn").addEventListener("click", () => {
        if (currentLevelIndex + 1 < GAME_LEVELS.length) {
            loadLevel(currentLevelIndex + 1);
        } else {
            successModal.classList.add("hidden");
            loadLevel(0);
        }
    });

    soundToggleBtn.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        soundToggleBtn.textContent = soundEnabled ? "🔊 צליל: פעיל" : "🔈 צליל: כבוי";
    });
}

// ---------- הרצה ----------
document.addEventListener("DOMContentLoaded", initApp);
