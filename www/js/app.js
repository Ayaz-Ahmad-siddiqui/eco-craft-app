// Firebase Analytics Initialization Function
async function initFirebaseAnalytics() {
  try {
    const FirebaseAnalytics = window.Capacitor?.Plugins?.FirebaseAnalytics;
    if (FirebaseAnalytics) {
      await FirebaseAnalytics.initializeFirebase();
      console.log("Firebase Analytics Ready!");
    }
  } catch (error) {
    console.log("Analytics Initialization Bypassed:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initFirebaseAnalytics();
});

/* SECURITY PROTOCOLS */
(function applySecurityProtocols() {
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    if (
      e.keyCode === 123 ||
      (e.ctrlKey &&
        e.shiftKey &&
        (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
      (e.ctrlKey && e.keyCode === 85)
    ) {
      e.preventDefault();
      return false;
    }
  });
})();

/* HYBRID ANALYTICS ENGINE */
let firebaseAnalytics = null;

function initFirebaseAnalytics() {
  try {
    if (window.firebase && window.firebase.analytics) {
      const firebaseConfig = {
        apiKey: "AIzaSyArCeVLtzWCguZRVziY-lI1FKILyX63bkU",
        authDomain: "matchykids-89ec6.firebaseapp.com",
        projectId: "matchykids-89ec6",
        storageBucket: "matchykids-89ec6.firebasestorage.app",
        messagingSenderId: "514072878587",
        appId: "1:514072878587:android:dc0eced0451e7b8e71bf5e",
      };

      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(firebaseConfig);
      }
      firebaseAnalytics = window.firebase.analytics();
      flushOfflineAnalyticsQueue();
    }
  } catch (e) {}
}

function trackGameEvent(eventName, eventParams = {}) {
  try {
    if (navigator.onLine && firebaseAnalytics) {
      firebaseAnalytics.logEvent(eventName, eventParams);
    } else {
      let queue = [];
      try {
        queue = JSON.parse(
          localStorage.getItem("kids_analytics_queue") || "[]",
        );
      } catch (e) {}
      queue.push({ eventName, eventParams, timestamp: Date.now() });
      localStorage.setItem("kids_analytics_queue", JSON.stringify(queue));
    }
  } catch (e) {}
}

function flushOfflineAnalyticsQueue() {
  if (!navigator.onLine || !firebaseAnalytics) return;
  try {
    const queue = JSON.parse(
      localStorage.getItem("kids_analytics_queue") || "[]",
    );
    if (queue.length > 0) {
      queue.forEach((evt) => {
        firebaseAnalytics.logEvent(evt.eventName, evt.eventParams);
      });
      localStorage.removeItem("kids_analytics_queue");
    }
  } catch (e) {}
}

window.addEventListener("online", () => {
  if (!firebaseAnalytics) initFirebaseAnalytics();
  else flushOfflineAnalyticsQueue();
});

/* MAIN APP SETUP WITH AUTO AUDIO CONTEXT UNLOCK FOR ANDROID 7+ */
window.onload = () => {
  try {
    initFirebaseAnalytics();
    evaluateStreakOnLaunch();
    renderCategoryGrid();
    renderHomeStreakWidget();
    updateHUD();
    initAdMob();

    // User interaction unlocker for Android WebAudio API
    const unlockAudio = () => {
      getAudioContext();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.resume();
      }
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("click", unlockAudio);
    };
    document.addEventListener("touchstart", unlockAudio, { once: true });
    document.addEventListener("click", unlockAudio, { once: true });

    setTimeout(() => {
      const splash = document.getElementById("splash-screen");
      if (splash) {
        splash.style.opacity = "0";
        setTimeout(() => {
          splash.style.display = "none";
          checkFirstTimeTutorial();
        }, 600);
      }
    }, 2000);
  } catch (e) {
    console.error("Initialization Error:", e);
  }
};

/* TUTORIAL ENGINE */
let currentTutorStep = 0;
const tutorialSteps = [
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Welcome Parents & Kids!",
    desc: "MatchyKids mein hushamdeed! Yeh 1-minute guide aapko game play aur rewards samajhne mein madad karegi.",
  },
  {
    icon: "🎁",
    title: "Daily Reward Streak",
    desc: "Rozana game open karne par Daily Reward milta hai. Continuous 7 days login karne par special Gifts aur Coins milte hain!",
  },
  {
    icon: "📖",
    title: "Stickers & 📜 Certificates",
    desc: "Levels complete karne par 11 Stickers aur har Category finish karne par Official Achievement Certificate milta hai.",
  },
  {
    icon: "🎯",
    title: "How to Play (Matching)",
    desc: "Bache screen par float ho rahe item par tap karenge aur phir sahi matching Basket par tap karke match complete karenge!",
  },
];

function checkFirstTimeTutorial() {
  try {
    const isCompleted = localStorage.getItem("kids_tutorial_completed");
    if (!isCompleted) {
      showTutorialStep(0);
    }
  } catch (e) {}
}

function showTutorialStep(stepIdx) {
  currentTutorStep = stepIdx;
  const data = tutorialSteps[stepIdx];
  const iconEl = document.getElementById("tutor-icon");
  const titleEl = document.getElementById("tutor-title");
  const descEl = document.getElementById("tutor-desc");

  if (iconEl) iconEl.innerText = data.icon;
  if (titleEl) titleEl.innerText = data.title;
  if (descEl) descEl.innerText = data.desc;

  const nextBtn = document.getElementById("tutor-next-btn");
  if (nextBtn) {
    nextBtn.innerText =
      stepIdx === tutorialSteps.length - 1 ? "START GAME 🚀" : "Next ➔";
  }
  const modal = document.getElementById("tutorial-modal");
  if (modal) modal.style.display = "flex";
}

function nextTutorialStep() {
  if (currentTutorStep < tutorialSteps.length - 1) {
    showTutorialStep(currentTutorStep + 1);
  } else {
    skipTutorial();
  }
}

function skipTutorial() {
  const modal = document.getElementById("tutorial-modal");
  if (modal) modal.style.display = "none";
  try {
    localStorage.setItem("kids_tutorial_completed", "true");
  } catch (e) {}
}

/* HIGH-COMPATIBILITY RELIABLE SPEECH FUNCTIONALITY */
function speakText(text) {
  if (!text) return;
  try {
    if (window.Capacitor?.Plugins?.TextToSpeech) {
      window.Capacitor.Plugins.TextToSpeech.speak({
        text: String(text),
        lang: "en-US",
        rate: 0.9,
        pitch: 1.0,
      }).catch(() => {
        fallbackWebSpeech(text);
      });
    } else {
      fallbackWebSpeech(text);
    }
  } catch (e) {
    fallbackWebSpeech(text);
  }
}

function fallbackWebSpeech(text) {
  if (!("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(String(text));
    utt.rate = 0.9;
    utt.lang = "en-US";
    window.speechSynthesis.speak(utt);
  } catch (e) {}
}

/* AUDIO CONTEXT ENGINE FOR ALL ANDROID VERSIONS */
let audioCtx = null;
function getAudioContext() {
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  } catch (e) {}
  return audioCtx;
}

function playTone(freq, type = "sine", duration = 0.15) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

const playSuccessSound = () => {
  playTone(523);
  setTimeout(() => playTone(659), 100);
};
const playErrorSound = () => {
  playTone(220, "sawtooth");
  setTimeout(() => playTone(180, "sawtooth"), 100);
};
const playWinSound = () =>
  [400, 500, 600, 800].forEach((n, i) =>
    setTimeout(() => playTone(n, "triangle"), i * 100),
  );

function playStreakCelebrationSound() {
  [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, idx) => {
    setTimeout(() => playTone(freq, "triangle", 0.25), idx * 80);
  });
}

function fireConfetti(opts) {
  try {
    if (typeof window.confetti === "function") {
      window.confetti(opts);
    }
  } catch (e) {}
}

function createEpicPopup(text, color) {
  try {
    const pop = document.createElement("div");
    pop.className = "epic-popup";
    pop.innerText = text;
    pop.style.borderColor = color;
    pop.style.color = color;
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 800);
  } catch (e) {}
}

const ALL_STICKERS = [
  { id: "s_streak_teddy", name: "Teddy Bear", icon: "🧸", categoryId: null },
  { id: "s_cat_fruits", name: "Fruit Champ", icon: "🍎", categoryId: "fruits" },
  { id: "s_cat_veggies", name: "Veggie Hero", icon: "🥦", categoryId: "veggies" },
  { id: "s_cat_colors", name: "Color Star", icon: "🎨", categoryId: "colors" },
  { id: "s_cat_abc", name: "ABC Master", icon: "🔤", categoryId: "abc" },
  { id: "s_cat_counting", name: "Math Wizard", icon: "🔢", categoryId: "counting" },
  { id: "s_cat_toys", name: "Toy King", icon: "🚗", categoryId: "toys" },
  { id: "s_cat_body", name: "Body Expert", icon: "🖐️", categoryId: "body" },
  { id: "s_cat_animals", name: "Safari Pro", icon: "🐶", categoryId: "animals" },
  { id: "s_cat_shapes", name: "Shape Genius", icon: "📐", categoryId: "shapes" },
  { id: "s_cat_iq_mix", name: "IQ Master", icon: "🧠", categoryId: "iq_mix" },
];

const DAILY_STREAK = [
  { day: 1, icon: "🪙", title: "+10 Coins", type: "coins", val: 10 },
  { day: 2, icon: "⭐", title: "+5 Stars", type: "stars", val: 5 },
  { day: 3, icon: "🧸", title: "Teddy", type: "sticker", stickerId: "s_streak_teddy" },
  { day: 4, icon: "🪙", title: "+25 Coins", type: "coins", val: 25 },
  { day: 5, icon: "⭐", title: "+10 Stars", type: "stars", val: 10 },
  { day: 6, icon: "⭐", title: "+15 Stars", type: "stars", val: 15 },
  { day: 7, icon: "🎁", title: "Chest!", type: "chest", coins: 100, stars: 20 },
];

const poolFruits = [
  { type: "apple", icon: "🍎", name: "Apple", speak: "Apple", color: "#ef4444" },
  { type: "banana", icon: "🍌", name: "Banana", speak: "Banana", color: "#facc15" },
  { type: "grapes", icon: "🍇", name: "Grapes", speak: "Grapes", color: "#a855f7" },
  { type: "carrot", icon: "🥕", name: "Carrot", speak: "Carrot", color: "#f97316" },
  { type: "broccoli", icon: "🥦", name: "Broccoli", speak: "Broccoli", color: "#10b981" },
  { type: "strawberry", icon: "🍓", name: "Strawberry", speak: "Strawberry", color: "#ef4444" },
  { type: "orange", icon: "🍊", name: "Orange", speak: "Orange", color: "#f97316" },
];

const categoriesData = [
  {
    id: "fruits",
    name: "Fruits",
    icon: "🍎",
    color: "#ef4444",
    levels: [
      { level: 1, name: "Fresh Fruits", target: 5, items: [{ type: "apple", icon: "🍎", name: "Apple", color: "#ef4444" }, { type: "orange", icon: "🍊", name: "Orange", color: "#f97316" }, { type: "banana", icon: "🍌", name: "Banana", color: "#eab308" }] },
      { level: 2, name: "Berry Delight", target: 6, items: [{ type: "strawberry", icon: "🍓", name: "Strawberry", color: "#f43f5e" }, { type: "grapes", icon: "🍇", name: "Grapes", color: "#a855f7" }, { type: "watermelon", icon: "🍉", name: "Watermelon", color: "#22c55e" }] },
      { level: 3, name: "Tropical Fruits", target: 6, items: [{ type: "mango", icon: "🥭", name: "Mango", color: "#fbbf24" }, { type: "pineapple", icon: "🍍", name: "Pineapple", color: "#eab308" }, { type: "avocado", icon: "🥑", name: "Avocado", color: "#84cc16" }] },
      { level: 4, name: "Citrus Orchard", target: 7, items: [{ type: "lemon", icon: "🍋", name: "Lemon", color: "#facc15" }, { type: "peach", icon: "🍑", name: "Peach", color: "#fb923c" }, { type: "cherry", icon: "🍒", name: "Cherry", color: "#dc2626" }] },
      { level: 5, name: "Super Green", target: 7, items: [{ type: "kiwi", icon: "🥝", name: "Kiwi", color: "#65a30d" }, { type: "pear", icon: "🍐", name: "Pear", color: "#84cc16" }, { type: "apple", icon: "🍎", name: "Apple", color: "#b91c1c" }] },
      { level: 6, name: "Melon Fun", target: 8, items: [{ type: "cantaloupe", icon: "🍈", name: "Melon", color: "#f59e0b" }, { type: "coconut", icon: "🥥", name: "Coconut", color: "#78350f" }, { type: "blueberry", icon: "🫐", name: "Blueberry", color: "#3b82f6" }] },
      { level: 7, name: "Tangy Flavors", target: 8, items: [{ type: "grapefruit", icon: "🍊", name: "Grapefruit", color: "#f43f5e" }, { type: "lemon", icon: "🍋", name: "Lemon", color: "#a3e635" }, { type: "plum", icon: "🍑", name: "Plum", color: "#86198f" }] },
      { level: 8, name: "Sweet Treats", target: 9, items: [{ type: "blueberry", icon: "🫐", name: "Blueberry", color: "#3b82f6" }, { type: "date", icon: "🌴", name: "Date", color: "#b45309" }, { type: "plum", icon: "🍑", name: "Plum", color: "#86198f" }] },
      { level: 9, name: "Jungle Blast", target: 9, items: [{ type: "guava", icon: "🍏", name: "Guava", color: "#4ade80" }, { type: "dragonfruit", icon: "🌵", name: "Dragon Fruit", color: "#ec4899" }, { type: "mango", icon: "🥭", name: "Mango", color: "#f97316" }] },
      { level: 10, name: "Fruit Master", target: 10, items: [{ type: "starfruit", icon: "⭐", name: "Starfruit", color: "#eab308" }, { type: "passion", icon: "🟣", name: "Passion Fruit", color: "#7c3aed" }, { type: "grapes", icon: "🍇", name: "Grapes", color: "#4c1d95" }] },
    ],
  },
  {
    id: "veggies",
    name: "Vegetables",
    icon: "🥦",
    color: "#22c55e",
    levels: [
      { level: 1, name: "Garden Fresh", target: 5, items: [{ type: "carrot", icon: "🥕", name: "Carrot", color: "#f97316" }, { type: "broccoli", icon: "🥦", name: "Broccoli", color: "#22c55e" }, { type: "tomato", icon: "🍅", name: "Tomato", color: "#ef4444" }] },
      { level: 2, name: "Veggie Crunch", target: 6, items: [{ type: "corn", icon: "🌽", name: "Corn", color: "#eab308" }, { type: "cucumber", icon: "🥒", name: "Cucumber", color: "#16a34a" }, { type: "eggplant", icon: "🍆", name: "Eggplant", color: "#a855f7" }] },
      { level: 3, name: "Root Veggies", target: 6, items: [{ type: "potato", icon: "🥔", name: "Potato", color: "#ca8a04" }, { type: "onion", icon: "🧅", name: "Onion", color: "#f97316" }, { type: "garlic", icon: "🧄", name: "Garlic", color: "#e2e8f0" }] },
      { level: 4, name: "Peppers & Leaf", target: 7, items: [{ type: "pepper", icon: "🫑", name: "Capsicum", color: "#16a34a" }, { type: "chili", icon: "🌶️", name: "Chili", color: "#dc2626" }, { type: "salad", icon: "🥗", name: "Lettuce", color: "#4ade80" }] },
      { level: 5, name: "Super Greens", target: 7, items: [{ type: "pea", icon: "🫛", name: "Pea", color: "#65a30d" }, { type: "avocado_v", icon: "🥑", name: "Avocado", color: "#84cc16" }, { type: "mushroom", icon: "🍄", name: "Mushroom", color: "#f43f5e" }] },
      { level: 6, name: "Healthy Roots", target: 8, items: [{ type: "beetroot", icon: "🍠", name: "Sweet Potato", color: "#b91c1c" }, { type: "carrot", icon: "🥕", name: "Carrot", color: "#f97316" }, { type: "cabbage", icon: "🥬", name: "Cabbage", color: "#22c55e" }] },
      { level: 7, name: "Harvest Time", target: 8, items: [{ type: "pumpkin", icon: "🎃", name: "Pumpkin", color: "#ea580c" }, { type: "cucumber", icon: "🥒", name: "Cucumber", color: "#15803d" }, { type: "spinach", icon: "🥬", name: "Spinach", color: "#166534" }] },
      { level: 8, name: "Veggie Feast", target: 9, items: [{ type: "cauliflower", icon: "🥦", name: "Cauliflower", color: "#f8fafc" }, { type: "onion", icon: "🧅", name: "Onion", color: "#a855f7" }, { type: "ginger_v", icon: "🫚", name: "Ginger", color: "#ca8a04" }] },
      { level: 9, name: "Green Energy", target: 9, items: [{ type: "cabbage", icon: "🥬", name: "Cabbage", color: "#4ade80" }, { type: "asparagus", icon: "🫛", name: "Asparagus", color: "#15803d" }, { type: "corn_c", icon: "🌽", name: "Sweetcorn", color: "#facc15" }] },
      { level: 10, name: "Master Chef", target: 10, items: [{ type: "olive", icon: "🫒", name: "Olive", color: "#65a30d" }, { type: "bean", icon: "🫘", name: "Beans", color: "#7f1d1d" }, { type: "bellpepper", icon: "🫑", name: "Bell Pepper", color: "#f97316" }] },
    ],
  },
  {
    id: "colors",
    name: "Colors",
    icon: "🎨",
    color: "#ec4899",
    levels: [
      { level: 1, name: "Primary Colors", target: 5, items: [{ type: "red", icon: "🔴", name: "Red", color: "#ef4444" }, { type: "blue", icon: "🔵", name: "Blue", color: "#3b82f6" }, { type: "yellow", icon: "🟡", name: "Yellow", color: "#eab308" }] },
      { level: 2, name: "Bright Colors", target: 6, items: [{ type: "green", icon: "🟢", name: "Green", color: "#22c55e" }, { type: "orange_c", icon: "🟠", name: "Orange", color: "#f97316" }, { type: "purple", icon: "🟣", name: "Purple", color: "#a855f7" }] },
      { level: 3, name: "Soft Colors", target: 6, items: [{ type: "pink", icon: "🩷", name: "Pink", color: "#ec4899" }, { type: "brown", icon: "🟤", name: "Brown", color: "#78350f" }, { type: "black", icon: "⚫", name: "Black", color: "#1e293b" }] },
      { level: 4, name: "Shine & Light", target: 7, items: [{ type: "white", icon: "⚪", name: "White", color: "#f8fafc" }, { type: "cyan", icon: "🩵", name: "Cyan", color: "#06b6d4" }, { type: "gold", icon: "⭐", name: "Gold", color: "#fbbf24" }] },
      { level: 5, name: "Rainbow Fun", target: 7, items: [{ type: "violet", icon: "🟣", name: "Violet", color: "#8b5cf6" }, { type: "lime_c", icon: "🟢", name: "Lime", color: "#84cc16" }, { type: "maroon", icon: "🔴", name: "Maroon", color: "#881337" }] },
      { level: 6, name: "Color Splash", target: 8, items: [{ type: "grey", icon: "🔘", name: "Grey", color: "#64748b" }, { type: "magenta", icon: "🩷", name: "Magenta", color: "#d946ef" }, { type: "teal", icon: "🔵", name: "Teal", color: "#0d9488" }] },
      { level: 7, name: "Deep Shades", target: 8, items: [{ type: "navy", icon: "🔵", name: "Navy", color: "#1e3a8a" }, { type: "olive_c", icon: "🟢", name: "Olive", color: "#4d7c0f" }, { type: "peach_c", icon: "🟠", name: "Peach", color: "#fdba74" }] },
      { level: 8, name: "Pastel Wonders", target: 9, items: [{ type: "lavender", icon: "🟣", name: "Lavender", color: "#c084fc" }, { type: "mint", icon: "🟢", name: "Mint", color: "#6ee7b7" }, { type: "coral", icon: "🔴", name: "Coral", color: "#fb7185" }] },
      { level: 9, name: "Neon Glow", target: 9, items: [{ type: "neon_green", icon: "🟢", name: "Neon Green", color: "#4ade80" }, { type: "neon_yellow", icon: "🟡", name: "Neon Yellow", color: "#fef08a" }, { type: "neon_pink", icon: "🩷", name: "Neon Pink", color: "#f472b6" }] },
      { level: 10, name: "Color Master", target: 10, items: [{ type: "silver", icon: "⚪", name: "Silver", color: "#cbd5e1" }, { type: "bronze", icon: "🟤", name: "Bronze", color: "#92400e" }, { type: "rainbow", icon: "🌈", name: "Rainbow", color: "#38bdf8" }] },
    ],
  },
  {
    id: "abc",
    name: "ABC Alphabet",
    icon: "🔤",
    color: "#38bdf8",
    levels: [
      { level: 1, name: "Letters A B C", target: 5, items: [{ type: "la", icon: "A", name: "A", color: "#ef4444", isText: true }, { type: "lb", icon: "B", name: "B", color: "#3b82f6", isText: true }, { type: "lc", icon: "C", name: "C", color: "#eab308", isText: true }] },
      { level: 2, name: "Letters D E F", target: 6, items: [{ type: "ld", icon: "D", name: "D", color: "#22c55e", isText: true }, { type: "le", icon: "E", name: "E", color: "#a855f7", isText: true }, { type: "lf", icon: "F", name: "F", color: "#f97316", isText: true }] },
      { level: 3, name: "Letters G H I", target: 6, items: [{ type: "lg", icon: "G", name: "G", color: "#ec4899", isText: true }, { type: "lh", icon: "H", name: "H", color: "#06b6d4", isText: true }, { type: "li", icon: "I", name: "I", color: "#84cc16", isText: true }] },
      { level: 4, name: "Letters J K L", target: 7, items: [{ type: "lj", icon: "J", name: "J", color: "#f59e0b", isText: true }, { type: "lk", icon: "K", name: "K", color: "#ef4444", isText: true }, { type: "ll", icon: "L", name: "L", color: "#3b82f6", isText: true }] },
      { level: 5, name: "Letters M N O", target: 7, items: [{ type: "lm", icon: "M", name: "M", color: "#10b981", isText: true }, { type: "ln", icon: "N", name: "N", color: "#8b5cf6", isText: true }, { type: "lo", icon: "O", name: "O", color: "#f97316", isText: true }] },
      { level: 6, name: "Letters P Q R", target: 8, items: [{ type: "lp", icon: "P", name: "P", color: "#ec4899", isText: true }, { type: "lq", icon: "Q", name: "Q", color: "#06b6d4", isText: true }, { type: "lr", icon: "R", name: "R", color: "#eab308", isText: true }] },
      { level: 7, name: "Letters S T U", target: 8, items: [{ type: "ls", icon: "S", name: "S", color: "#22c55e", isText: true }, { type: "lt", icon: "T", name: "T", color: "#ef4444", isText: true }, { type: "lu", icon: "U", name: "U", color: "#a855f7", isText: true }] },
      { level: 8, name: "Letters V W X", target: 9, items: [{ type: "lv", icon: "V", name: "V", color: "#f97316", isText: true }, { type: "lw", icon: "W", name: "W", color: "#3b82f6", isText: true }, { type: "lx", icon: "X", name: "X", color: "#10b981", isText: true }] },
      { level: 9, name: "Letters Y Z Star", target: 9, items: [{ type: "ly", icon: "Y", name: "Y", color: "#eab308", isText: true }, { type: "lz", icon: "Z", name: "Z", color: "#ec4899", isText: true }, { type: "la_star", icon: "⭐", name: "Star", color: "#fbbf24" }] },
      { level: 10, name: "ABC Master Level", target: 10, items: [{ type: "lx_m", icon: "X", name: "X", color: "#10b981", isText: true }, { type: "ly_m", icon: "Y", name: "Y", color: "#eab308", isText: true }, { type: "lz_m", icon: "Z", name: "Z", color: "#ec4899", isText: true }] },
    ],
  },
  {
    id: "counting",
    name: "Counting (1 to 30)",
    icon: "🔢",
    color: "#f59e0b",
    levels: [
      { level: 1, name: "Numbers 1, 2, 3", target: 5, items: [{ type: "n1", icon: "1", name: "One", color: "#ef4444", isText: true }, { type: "n2", icon: "2", name: "Two", color: "#3b82f6", isText: true }, { type: "n3", icon: "3", name: "Three", color: "#22c55e", isText: true }] },
      { level: 2, name: "Numbers 4, 5, 6", target: 6, items: [{ type: "n4", icon: "4", name: "Four", color: "#eab308", isText: true }, { type: "n5", icon: "5", name: "Five", color: "#a855f7", isText: true }, { type: "n6", icon: "6", name: "Six", color: "#f97316", isText: true }] },
      { level: 3, name: "Numbers 7, 8, 9", target: 6, items: [{ type: "n7", icon: "7", name: "Seven", color: "#ec4899", isText: true }, { type: "n8", icon: "8", name: "Eight", color: "#06b6d4", isText: true }, { type: "n9", icon: "9", name: "Nine", color: "#84cc16", isText: true }] },
      { level: 4, name: "Numbers 10, 11, 12", target: 7, items: [{ type: "n10", icon: "10", name: "Ten", color: "#f59e0b", isText: true }, { type: "n11", icon: "11", name: "Eleven", color: "#ef4444", isText: true }, { type: "n12", icon: "12", name: "Twelve", color: "#3b82f6", isText: true }] },
      { level: 5, name: "Numbers 13, 14, 15", target: 7, items: [{ type: "n13", icon: "13", name: "Thirteen", color: "#10b981", isText: true }, { type: "n14", icon: "14", name: "Fourteen", color: "#8b5cf6", isText: true }, { type: "n15", icon: "15", name: "Fifteen", color: "#f97316", isText: true }] },
      { level: 6, name: "Numbers 16, 17, 18", target: 8, items: [{ type: "n16", icon: "16", name: "Sixteen", color: "#ec4899", isText: true }, { type: "n17", icon: "17", name: "Seventeen", color: "#06b6d4", isText: true }, { type: "n18", icon: "18", name: "Eighteen", color: "#eab308", isText: true }] },
      { level: 7, name: "Numbers 19, 20, 21", target: 8, items: [{ type: "n19", icon: "19", name: "Nineteen", color: "#22c55e", isText: true }, { type: "n20", icon: "20", name: "Twenty", color: "#ef4444", isText: true }, { type: "n21", icon: "21", name: "Twenty One", color: "#a855f7", isText: true }] },
      { level: 8, name: "Numbers 22, 23, 24", target: 9, items: [{ type: "n22", icon: "22", name: "Twenty Two", color: "#f97316", isText: true }, { type: "n23", icon: "23", name: "Twenty Three", color: "#3b82f6", isText: true }, { type: "n24", icon: "24", name: "Twenty Four", color: "#10b981", isText: true }] },
      { level: 9, name: "Numbers 25, 26, 27", target: 9, items: [{ type: "n25", icon: "25", name: "Twenty Five", color: "#eab308", isText: true }, { type: "n26", icon: "26", name: "Twenty Six", color: "#ec4899", isText: true }, { type: "n27", icon: "27", name: "Twenty Seven", color: "#06b6d4", isText: true }] },
      { level: 10, name: "Numbers 28, 29, 30", target: 10, items: [{ type: "n28", icon: "28", name: "Twenty Eight", color: "#84cc16", isText: true }, { type: "n29", icon: "29", name: "Twenty Nine", color: "#f59e0b", isText: true }, { type: "n30", icon: "30", name: "Thirty", color: "#ef4444", isText: true }] },
    ],
  },
  {
    id: "toys",
    name: "Cars & Toys",
    icon: "🚗",
    color: "#a855f7",
    levels: [
      { level: 1, name: "City Vehicles", target: 5, items: [{ type: "car", icon: "🚗", name: "Car", color: "#ef4444" }, { type: "truck", icon: "🚚", name: "Truck", color: "#3b82f6" }, { type: "bus", icon: "🚌", name: "Bus", color: "#eab308" }] },
      { level: 2, name: "Emergency Fleet", target: 6, items: [{ type: "police", icon: "🚓", name: "Police Car", color: "#3b82f6" }, { type: "fire", icon: "🚒", name: "Fire Truck", color: "#ef4444" }, { type: "ambulance", icon: "🚑", name: "Ambulance", color: "#f8fafc" }] },
      { level: 3, name: "Action Toys", target: 6, items: [{ type: "robot", icon: "🤖", name: "Robot", color: "#06b6d4" }, { type: "rocket", icon: "🚀", name: "Rocket", color: "#a855f7" }, { type: "train", icon: "🚂", name: "Train", color: "#22c55e" }] },
      { level: 4, name: "Race & Speed", target: 7, items: [{ type: "racecar", icon: "🏎️", name: "Race Car", color: "#dc2626" }, { type: "bike", icon: "🏍️", name: "Motorbike", color: "#f97316" }, { type: "scooter", icon: "🛵", name: "Scooter", color: "#10b981" }] },
      { level: 5, name: "Heavy Machinery", target: 7, items: [{ type: "tractor", icon: "🚜", name: "Tractor", color: "#65a30d" }, { type: "construction", icon: "🏗️", name: "Crane", color: "#ca8a04" }, { type: "taxi", icon: "🚕", name: "Taxi", color: "#facc15" }] },
      { level: 6, name: "Fun Playtime", target: 8, items: [{ type: "teddy", icon: "🧸", name: "Teddy Bear", color: "#b45309" }, { type: "ball", icon: "⚽", name: "Ball", color: "#e2e8f0" }, { type: "blocks", icon: "🧱", name: "Blocks", color: "#ec4899" }] },
      { level: 7, name: "Sky & Sea", target: 8, items: [{ type: "plane", icon: "✈️", name: "Airplane", color: "#0284c7" }, { type: "helicopter", icon: "🚁", name: "Helicopter", color: "#ca8a04" }, { type: "boat", icon: "⛵", name: "Boat", color: "#38bdf8" }] },
      { level: 8, name: "Cool Vehicles", target: 9, items: [{ type: "monster_truck", icon: "🛻", name: "Pickup Truck", color: "#475569" }, { type: "cablecar", icon: "𚡡", name: "Cable Car", color: "#7c3aed" }, { type: "tram", icon: "🚋", name: "Tram", color: "#059669" }] },
      { level: 9, name: "Super Toys", target: 9, items: [{ type: "ufo", icon: "🛸", name: "UFO", color: "#c084fc" }, { type: "yo_yo", icon: "🪀", name: "Yo Yo", color: "#ef4444" }, { type: "kite", icon: "🪁", name: "Kite", color: "#f43f5e" }] },
      { level: 10, name: "Ultimate Toybox", target: 10, items: [{ type: "monster_rc", icon: "🚙", name: "Monster Car", color: "#16a34a" }, { type: "drone", icon: "🚁", name: "Drone", color: "#0284c7" }, { type: "crown_toy", icon: "👑", name: "Crown", color: "#fbbf24" }] },
    ],
  },
  {
    id: "body",
    name: "Parts of Body",
    icon: "🖐️",
    color: "#10b981",
    levels: [
      { level: 1, name: "Face & Head", target: 5, items: [{ type: "eye", icon: "👁️", name: "Eye", color: "#3b82f6" }, { type: "ear", icon: "👂", name: "Ear", color: "#f97316" }, { type: "nose", icon: "👃", name: "Nose", color: "#ef4444" }] },
      { level: 2, name: "Hands & Feet", target: 6, items: [{ type: "hand", icon: "🖐️", name: "Hand", color: "#eab308" }, { type: "foot", icon: "🦶", name: "Foot", color: "#22c55e" }, { type: "arm", icon: "🦾", name: "Arm", color: "#a855f7" }] },
      { level: 3, name: "Smile & Voice", target: 6, items: [{ type: "mouth", icon: "👄", name: "Mouth", color: "#f43f5e" }, { type: "tooth", icon: "🦷", name: "Tooth", color: "#f8fafc" }, { type: "tongue", icon: "👅", name: "Tongue", color: "#ec4899" }] },
      { level: 4, name: "Upper Body", target: 7, items: [{ type: "brain", icon: "🧠", name: "Brain", color: "#f472b6" }, { type: "heart", icon: "🫀", name: "Heart", color: "#dc2626" }, { type: "bone", icon: "🦴", name: "Bone", color: "#e2e8f0" }] },
      { level: 5, name: "Sensory Parts", target: 7, items: [{ type: "hair", icon: "💇", name: "Hair", color: "#475569" }, { type: "muscle", icon: "🏋️", name: "Muscle", color: "#ea580c" }, { type: "face", icon: "😀", name: "Face", color: "#fbbf24" }] },
      { level: 6, name: "Body Actions", target: 8, items: [{ type: "leg", icon: "🦵", name: "Leg", color: "#16a34a" }, { type: "thumb", icon: "👍", name: "Thumb", color: "#eab308" }, { type: "fist", icon: "✊", name: "Fist", color: "#b45309" }] },
      { level: 7, name: "Expressions", target: 8, items: [{ type: "wink", icon: "😜", name: "Wink Eye", color: "#f59e0b" }, { type: "clap", icon: "👏", name: "Clapping Hands", color: "#eab308" }, { type: "wave", icon: "👋", name: "Waving Hand", color: "#38bdf8" }] },
      { level: 8, name: "Movement Parts", target: 9, items: [{ type: "run_leg", icon: "🏃", name: "Running Legs", color: "#22c55e" }, { type: "punch", icon: "👊", name: "Punch Hand", color: "#ef4444" }, { type: "point", icon: "👉", name: "Finger Point", color: "#f97316" }] },
      { level: 9, name: "Senses Master", target: 9, items: [{ type: "look_eye", icon: "👀", name: "Looking Eyes", color: "#06b6d4" }, { type: "hear_ear", icon: "🎧", name: "Hearing Ear", color: "#a855f7" }, { type: "kiss_lip", icon: "💋", name: "Lips", color: "#f43f5e" }] },
      { level: 10, name: "Body Champion", target: 10, items: [{ type: "full_body", icon: "🧍", name: "Full Body", color: "#4ade80" }, { type: "mind", icon: "🧩", name: "Clever Mind", color: "#38bdf8" }, { type: "fist_bump", icon: "🤛", name: "Fist Bump", color: "#fbbf24" }] },
    ],
  },
  {
    id: "animals",
    name: "Animals & Birds",
    icon: "🐶",
    color: "#f43f5e",
    levels: [
      { level: 1, name: "Cute Pets", target: 5, items: [{ type: "dog", icon: "🐶", name: "Dog", color: "#f97316" }, { type: "cat", icon: "🐱", name: "Cat", color: "#eab308" }, { type: "rabbit", icon: "🐰", name: "Rabbit", color: "#f8fafc" }] },
      { level: 2, name: "Jungle Animals", target: 6, items: [{ type: "lion", icon: "🦁", name: "Lion", color: "#f59e0b" }, { type: "tiger", icon: "🐯", name: "Tiger", color: "#ea580c" }, { type: "monkey", icon: "🐒", name: "Monkey", color: "#78350f" }] },
      { level: 3, name: "Farm Friends", target: 6, items: [{ type: "cow", icon: "🐮", name: "Cow", color: "#1e293b" }, { type: "horse", icon: "🐴", name: "Horse", color: "#b45309" }, { type: "sheep", icon: "🐑", name: "Sheep", color: "#e2e8f0" }] },
      { level: 4, name: "Birds Kingdom", target: 7, items: [{ type: "parrot", icon: "🦜", name: "Parrot", color: "#22c55e" }, { type: "duck", icon: "🦆", name: "Duck", color: "#0284c7" }, { type: "owl", icon: "🦉", name: "Owl", color: "#7c3aed" }] },
      { level: 5, name: "Sea Life", target: 7, items: [{ type: "fish", icon: "🐟", name: "Fish", color: "#38bdf8" }, { type: "dolphin", icon: "🐬", name: "Dolphin", color: "#0284c7" }, { type: "octopus", icon: "🐙", name: "Octopus", color: "#ec4899" }] },
      { level: 6, name: "Forest Safari", target: 8, items: [{ type: "elephant", icon: "🐘", name: "Elephant", color: "#64748b" }, { type: "giraffe", icon: "🦒", name: "Giraffe", color: "#f59e0b" }, { type: "zebra", icon: "🦓", name: "Zebra", color: "#e2e8f0" }] },
      { level: 7, name: "Tiny Insects", target: 8, items: [{ type: "butterfly", icon: "🦋", name: "Butterfly", color: "#a855f7" }, { type: "bee", icon: "🐝", name: "Honey Bee", color: "#facc15" }, { type: "ladybug", icon: "🐞", name: "Ladybug", color: "#ef4444" }] },
      { level: 8, name: "Wild Safari", target: 9, items: [{ type: "bear", icon: "🐻", name: "Bear", color: "#78350f" }, { type: "panda", icon: "🐼", name: "Panda", color: "#1e293b" }, { type: "koala", icon: "🐨", name: "Koala", color: "#94a3b8" }] },
      { level: 9, name: "Ocean Friends", target: 9, items: [{ type: "whale", icon: "🐳", name: "Whale", color: "#0284c7" }, { type: "turtle", icon: "🐢", name: "Turtle", color: "#16a34a" }, { type: "crab", icon: "🦀", name: "Crab", color: "#dc2626" }] },
      { level: 10, name: "Animal Master", target: 10, items: [{ type: "unicorn", icon: "🦄", name: "Unicorn", color: "#f472b6" }, { type: "dragon", icon: "🐲", name: "Dragon", color: "#22c55e" }, { type: "peacock", icon: "🦚", name: "Peacock", color: "#0369a1" }] },
    ],
  },
  {
    id: "shapes",
    name: "Shapes & Symbols",
    icon: "📐",
    color: "#8b5cf6",
    levels: [
      { level: 1, name: "Basic Shapes", target: 5, items: [{ type: "circle", icon: "🔴", name: "Circle", color: "#ef4444" }, { type: "square", icon: "🟧", name: "Square", color: "#f97316" }, { type: "triangle", icon: "🔺", name: "Triangle", color: "#eab308" }] },
      { level: 2, name: "Star & Heart", target: 6, items: [{ type: "star", icon: "⭐", name: "Star", color: "#fbbf24" }, { type: "heart", icon: "❤️", name: "Heart", color: "#f43f5e" }, { type: "diamond", icon: "🔷", name: "Diamond", color: "#3b82f6" }] },
      { level: 3, name: "More Shapes", target: 6, items: [{ type: "oval", icon: "🌰", name: "Oval", color: "#a855f7" }, { type: "cross", icon: "✖️", name: "Cross", color: "#ef4444" }, { type: "check", icon: "✔️", name: "Check Mark", color: "#22c55e" }] },
      { level: 4, name: "Math Signs", target: 7, items: [{ type: "plus", icon: "➕", name: "Plus", color: "#22c55e" }, { type: "minus", icon: "➖", name: "Minus", color: "#ef4444" }, { type: "multiply", icon: "✖️", name: "Multiply", color: "#3b82f6" }] },
      { level: 5, name: "Smart Symbols", target: 7, items: [{ type: "divide", icon: "➗", name: "Divide", color: "#eab308" }, { type: "equal", icon: "🟰", name: "Equals", color: "#a855f7" }, { type: "question", icon: "❓", name: "Question", color: "#f43f5e" }] },
      { level: 6, name: "Geometry Fun", target: 8, items: [{ type: "hexagon", icon: "🛑", name: "Hexagon", color: "#dc2626" }, { type: "ring", icon: "⭕", name: "Ring", color: "#06b6d4" }, { type: "box", icon: "📦", name: "Box", color: "#b45309" }] },
      { level: 7, name: "Symbols Match", target: 8, items: [{ type: "exclamation", icon: "❗", name: "Exclamation", color: "#f97316" }, { type: "dollar", icon: "💲", name: "Dollar", color: "#16a34a" }, { type: "percent", icon: "%", name: "Percent", color: "#ec4899" }] },
      { level: 8, name: "Arrows & Direction", target: 9, items: [{ type: "arrow_up", icon: "⬆️", name: "Up Arrow", color: "#3b82f6" }, { type: "arrow_down", icon: "⬇️", name: "Down Arrow", color: "#ef4444" }, { type: "arrow_right", icon: "➡️", name: "Right Arrow", color: "#22c55e" }] },
      { level: 9, name: "Space Shapes", target: 9, items: [{ type: "moon", icon: "🌙", name: "Crescent Moon", color: "#facc15" }, { type: "sun", icon: "☀️", name: "Sun Shape", color: "#f59e0b" }, { type: "sparkle", icon: "💖", name: "Sparkle Heart", color: "#ec4899" }] },
      { level: 10, name: "Shapes Master", target: 10, items: [{ type: "cube", icon: "🧊", name: "Ice Cube", color: "#38bdf8" }, { type: "pyramid", icon: "🔺", name: "Pyramid", color: "#ea580c" }, { type: "badge", icon: "🔰", name: "Shield Shape", color: "#84cc16" }] },
    ],
  },
  {
    id: "iq_mix",
    name: "IQ Mix Challenge",
    icon: "🧠",
    color: "#06b6d4",
    levels: [],
  },
];

(function buildIQMixLevels() {
  try {
    const iqCategory = categoriesData.find((c) => c.id === "iq_mix");
    if (!iqCategory) return;

    let masterPool = [];
    categoriesData.forEach((cat) => {
      if (cat.id !== "iq_mix" && cat.levels) {
        cat.levels.forEach((lvl) => {
          if (lvl.items) masterPool.push(...lvl.items);
        });
      }
    });
    masterPool.push(...poolFruits);

    const uniquePool = Array.from(
      new Map(masterPool.map((item) => [item.type, item])).values(),
    );

    iqCategory.levels = Array.from({ length: 10 }, (_, l) => {
      const shuffled = [...uniquePool].sort(() => 0.5 - Math.sin(l + 1));
      const levelItems = [
        shuffled[(l * 3) % shuffled.length],
        shuffled[(l * 3 + 1) % shuffled.length],
        shuffled[(l * 3 + 2) % shuffled.length],
      ];

      const itemNames = levelItems.map((it) => it.name).join(", ");
      return {
        level: l + 1,
        name: `IQ Challenge - Level ${l + 1}`,
        headerText: `Level ${l + 1}: ${itemNames}`,
        target: Math.min(5 + Math.floor(l / 2), 10),
        items: levelItems,
      };
    });
  } catch (e) {}
})();

let currentCategory = categoriesData[0],
  currentLevelIndex = 0;
let coins = parseInt(localStorage.getItem("kids_coins") || "0", 10);
let stars = parseInt(localStorage.getItem("kids_stars") || "0", 10);
let unlockedStickers = [];
let unlockedCertificates = [];
try {
  unlockedStickers = JSON.parse(localStorage.getItem("kids_stickers") || "[]");
  unlockedCertificates = JSON.parse(
    localStorage.getItem("kids_certificates") || "[]",
  );
} catch (e) {}

let currentStreakDay = parseInt(
  localStorage.getItem("kids_streak_day") || "1",
  10,
);
let lastClaimDate = localStorage.getItem("kids_last_claim") || "";

let categoryProgress = {};
let activeCategoryLevel = {};
try {
  categoryProgress = JSON.parse(
    localStorage.getItem("kids_category_progress") || "{}",
  );
  activeCategoryLevel = JSON.parse(
    localStorage.getItem("kids_active_category_level") || "{}",
  );
} catch (e) {}

let matchedCount = 0,
  targetCount = 6,
  activeSelectedItem = null;

function saveProgress() {
  try {
    localStorage.setItem(
      "kids_category_progress",
      JSON.stringify(categoryProgress),
    );
    localStorage.setItem(
      "kids_active_category_level",
      JSON.stringify(activeCategoryLevel),
    );
    localStorage.setItem("kids_coins", coins);
    localStorage.setItem("kids_stars", stars);
    localStorage.setItem("kids_stickers", JSON.stringify(unlockedStickers));
    localStorage.setItem(
      "kids_certificates",
      JSON.stringify(unlockedCertificates),
    );
    localStorage.setItem("kids_streak_day", currentStreakDay);
    localStorage.setItem("kids_last_claim", lastClaimDate);
  } catch (e) {}
}

function updateHUD() {
  ["coin-count", "home-coin-count"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerText = coins;
  });
  ["star-count", "home-star-count"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerText = stars;
  });
}

function evaluateStreakOnLaunch() {
  try {
    const today = new Date().toISOString().split("T")[0];
    if (!lastClaimDate) {
      currentStreakDay = 1;
    } else if (lastClaimDate !== today) {
      const lastDateObj = new Date(lastClaimDate);
      const todayDateObj = new Date(today);
      const diffDays = Math.round(
        (todayDateObj - lastDateObj) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        if (currentStreakDay >= 7) {
          currentStreakDay = 1;
        } else {
          currentStreakDay += 1;
        }
      } else if (diffDays > 1) {
        currentStreakDay = 1;
      }
    }
    saveProgress();
  } catch (e) {}
}

function renderHomeStreakWidget() {
  const container = document.getElementById("home-streak-container");
  if (!container) return;
  container.innerHTML = "";
  const today = new Date().toISOString().split("T")[0];
  const hasClaimedToday = lastClaimDate === today;

  DAILY_STREAK.forEach((cfg) => {
    const isClaimed =
      cfg.day < currentStreakDay ||
      (cfg.day === currentStreakDay && hasClaimedToday);
    const isReady = cfg.day === currentStreakDay && !hasClaimedToday;

    const card = document.createElement("div");
    card.className = `home-streak-card ${isClaimed ? "claimed" : isReady ? "active-ready" : "locked"}`;
    card.innerHTML = `<div>Day ${cfg.day}</div><div style="font-size:1.1rem; margin:2px 0;">${cfg.icon}</div><div>${isClaimed ? "Claimed ✓" : cfg.title}</div>`;

    if (isReady) card.onclick = () => claimDailyReward(cfg.day);
    container.appendChild(card);
  });
}

function claimDailyReward(dayNum) {
  try {
    const today = new Date().toISOString().split("T")[0];
    if (lastClaimDate === today || dayNum !== currentStreakDay) return;

    const cfg = DAILY_STREAK.find((d) => d.day === dayNum);
    if (!cfg) return;

    if (cfg.type === "coins") coins += cfg.val;
    if (cfg.type === "stars") stars += cfg.val;
    if (cfg.stickerId && !unlockedStickers.includes(cfg.stickerId))
      unlockedStickers.push(cfg.stickerId);
    if (cfg.type === "chest") {
      coins += cfg.coins;
      stars += cfg.stars;
    }

    lastClaimDate = today;

    if (dayNum === 7) {
      currentStreakDay = 1;
    }

    saveProgress();
    updateHUD();
    renderHomeStreakWidget();

    try {
      playStreakCelebrationSound();
    } catch (e) {}
    try {
      fireConfetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}
    createEpicPopup("Daily Gift Claimed! 🎉", "#facc15");
  } catch (e) {}
}

function claimCertificateAction() {
  try {
    closeModal("certificate-modal");
    openCategoryMenu();
  } catch (e) {
    openCategoryMenu();
  }
}

function openStickerAlbum() {
  const grid = document.getElementById("sticker-grid");
  if (grid) {
    grid.innerHTML = ALL_STICKERS.map(
      (stk) => `
            <div class="sticker-item-card ${unlockedStickers.includes(stk.id) ? "unlocked" : ""}">
              <div class="sticker-item-icon" style="font-size:1.8rem">${stk.icon}</div>
              <div style="font-size: 0.72rem;">${unlockedStickers.includes(stk.id) ? stk.name : "Locked"}</div>
            </div>
          `,
    ).join("");
  }
  openModal("sticker-album-modal");
}

function openMyCertificatesModal() {
  const grid = document.getElementById("certificates-grid");
  if (grid) {
    if (unlockedCertificates.length === 0) {
      grid.innerHTML = `<div style="grid-column: span 2; color: #94a3b8; font-size: 0.8rem; padding: 15px;">No Certificates Yet! Complete 10 levels of any category to earn one. 🏆</div>`;
    } else {
      grid.innerHTML = unlockedCertificates
        .map((catId) => {
          const cat = categoriesData.find((c) => c.id === catId);
          return `
                <div class="sticker-item-card unlocked" style="border-color: var(--accent); background: rgba(250, 204, 21, 0.1);" onclick="viewCertificate('${catId}')">
                  <div style="font-size: 1.8rem;">🎓</div>
                  <div style="font-size: 0.75rem; font-weight: bold; color: var(--accent); margin-top: 2px;">${cat ? cat.name : "Master"}</div>
                  <div style="font-size: 0.65rem; color: #10b981;">View 📜</div>
                </div>
              `;
        })
        .join("");
    }
  }
  openModal("my-certificates-modal");
}

function viewCertificate(catId) {
  const cat = categoriesData.find((c) => c.id === catId);
  const nameEl = document.getElementById("cert-detail-name");
  if (nameEl) {
    nameEl.innerText = `${cat ? cat.name : "Category"} Champion`;
  }
  closeModal("my-certificates-modal");
  openModal("certificate-detail-modal");
}

function renderCategoryGrid() {
  const grid = document.getElementById("category-grid");
  if (!grid) return;
  grid.innerHTML = categoriesData
    .map((cat) => {
      const maxCompleted = categoryProgress[cat.id] || 0;
      const currentActive = activeCategoryLevel[cat.id] || 0;
      const maxLvl = cat.levels ? cat.levels.length : 10;

      let statusText = `⭐ 0/${maxLvl} Levels`;
      if (currentActive > 0 && currentActive < maxLvl) {
        statusText = `⭐ ${currentActive}/${maxLvl} Levels`;
      } else if (maxCompleted >= maxLvl) {
        statusText = "🏆 Completed";
      } else {
        statusText = `⭐ ${maxCompleted}/${maxLvl} Levels`;
      }

      return `
            <div class="cat-card" style="border-color:${cat.color}" onclick="handleCategoryClick('${cat.id}')">
              <div style="font-size:2.2rem">${cat.icon}</div>
              <div style="font-weight:800; font-size: 0.9rem; margin-top: 4px;">${cat.name}</div>
              <div style="font-size:0.72rem; color:var(--accent); margin-top: 2px;">${statusText}</div>
            </div>`;
    })
    .join("");
}

function handleCategoryClick(catId) {
  const cat = categoriesData.find((c) => c.id === catId);
  if (!cat) return;
  const maxCompleted = categoryProgress[cat.id] || 0;
  const currentActive = activeCategoryLevel[cat.id] || 0;
  const maxLvl = cat.levels ? cat.levels.length : 10;

  let activeTrack = currentActive > 0 ? currentActive : maxCompleted;

  if (activeTrack > 0 && activeTrack < maxLvl) {
    const nextLevelNum = activeTrack + 1;
    const choiceTitle = document.getElementById("choice-title");
    const choiceDesc = document.getElementById("choice-desc");

    if (choiceTitle) choiceTitle.innerText = cat.name;
    if (choiceDesc)
      choiceDesc.innerText = `You are currently at Level ${activeTrack}!`;

    const resumeBtn = document.getElementById("btn-resume");
    if (resumeBtn) {
      resumeBtn.innerText = `RESUME TO LEVEL ${nextLevelNum} ➔`;
      resumeBtn.onclick = () => {
        closeModal("start-choice-modal");
        startCategoryGame(cat, activeTrack);
      };
    }

    const restartBtn = document.getElementById("btn-restart");
    if (restartBtn) {
      restartBtn.innerText = `RESTART TO LEVEL 1 🔄`;
      restartBtn.onclick = () => {
        closeModal("start-choice-modal");
        activeCategoryLevel[cat.id] = 0;
        saveProgress();
        startCategoryGame(cat, 0);
      };
    }

    openModal("start-choice-modal");
  } else {
    startCategoryGame(cat, maxCompleted >= maxLvl ? 0 : maxCompleted);
  }
}

function startCategoryGame(cat, levelIdx) {
  currentCategory = cat;
  currentLevelIndex = levelIdx;

  trackGameEvent("category_played", {
    category_id: cat.id,
    category_name: cat.name,
    level: levelIdx + 1,
  });

  const catScreen = document.getElementById("category-screen");
  if (catScreen) catScreen.style.display = "none";

  const activeCatTitle = document.getElementById("active-cat-title");
  if (activeCatTitle) {
    activeCatTitle.innerText = `${cat.name} ${cat.icon}`;
  }

  loadCurrentLevel();
}

function openCategoryMenu() {
  renderCategoryGrid();
  renderHomeStreakWidget();
  updateHUD();
  const catScreen = document.getElementById("category-screen");
  if (catScreen) catScreen.style.display = "flex";
}

function loadCurrentLevel() {
  const playArea = document.getElementById("play-area");
  const basketContainer = document.getElementById("basket-container");

  if (!playArea || !basketContainer) return;
  const levelData = currentCategory.levels[currentLevelIndex];

  // Fragile DOM updates ko documentFragment se batch karke flicker roki ha
  const fragment = document.createDocumentFragment();
  const banner = document.createElement("div");
  banner.className = "level-banner";
  banner.id = "level-display";
  banner.innerText = levelData.headerText || `Level ${currentLevelIndex + 1}`;
  fragment.appendChild(banner);

  basketContainer.innerHTML = "";
  matchedCount = 0;
  targetCount = levelData.target;
  activeSelectedItem = null;
  document.body.classList.toggle("no-badge", !!levelData.hideBadge);
  updateProgressBar();

  levelData.items.forEach((item) => {
    const basket = document.createElement("div");
    basket.className = "fruit-basket";
    basket.style.borderColor = item.color;
    basket.innerHTML = `<div class="basket-icon" style="color:${item.color}">${item.icon}</div><div class="basket-label" style="color:${item.color}">${item.name}</div>`;
    basket.onclick = () => onBasketClick(item.type, basket);
    basketContainer.appendChild(basket);
  });

  const itemsToSpawn = Array.from(
    { length: targetCount },
    (_, i) => levelData.items[i % levelData.items.length],
  ).sort(() => Math.random() - 0.5);

  const placedBounds = [];
  const playAreaBounds = playArea.getBoundingClientRect();
  const playAreaWidth = playAreaBounds.width || window.innerWidth || 360;
  const playAreaHeight = playAreaBounds.height || 380;

  const itemWidth = 80;
  const itemHeight = 80;

  itemsToSpawn.forEach((item) => {
    let bestX = 0,
      bestY = 0,
      placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
      attempts++;
      const candidateX =
        10 + Math.random() * Math.max(10, playAreaWidth - itemWidth - 20);
      const candidateY =
        45 + Math.random() * Math.max(10, playAreaHeight - itemHeight - 50);

      let overlaps = false;
      for (let b of placedBounds) {
        const distanceX = Math.abs(candidateX - b.x);
        const distanceY = Math.abs(candidateY - b.y);
        if (distanceX < 75 && distanceY < 75) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps || attempts === 100) {
        bestX = candidateX;
        bestY = candidateY;
        placed = true;
      }
    }

    placedBounds.push({ x: bestX, y: bestY });

    const el = document.createElement("div");
    el.className = `fruit-item ${item.isText ? "text-item" : ""}`;
    el.style.left = `${bestX}px`;
    el.style.top = `${bestY}px`;

    if (item.isText) {
      el.innerHTML = `<div class="fruit-icon-large" style="color:${item.color}; text-shadow: 0 4px 0px ${item.color}88;">${item.icon}</div>`;
    } else {
      el.innerHTML = `<div class="fruit-text-hint" style="color:${item.color}">${item.name}</div><div class="fruit-icon-large">${item.icon}</div>`;
    }

    el.onclick = (e) => {
      e.stopPropagation();
      if (activeSelectedItem && activeSelectedItem.element) {
        activeSelectedItem.element.classList.remove("selected");
      }
      el.classList.add("selected");
      activeSelectedItem = { element: el, data: item };
    };
    fragment.appendChild(el);
  });

  playArea.innerHTML = "";
  playArea.appendChild(fragment);
}

function onBasketClick(basketType, basketEl) {
  if (!activeSelectedItem) return;

  if (activeSelectedItem.data.type === basketType) {
    const targetEl = activeSelectedItem.element;
    const textToSay =
      activeSelectedItem.data.speak || activeSelectedItem.data.name;

    // Direct remove issue fix
    targetEl.classList.add("matched-hide");
    const itemToSpeak = { ...activeSelectedItem.data };
    activeSelectedItem = null;

    // Audio context sync aur exact Voice Name output guarantees
    playSuccessSound();
    speakText(textToSay);

    coins += 10;
    matchedCount++;
    updateHUD();
    updateProgressBar();

    setTimeout(() => {
      if (targetEl && targetEl.parentNode) {
        targetEl.parentNode.removeChild(targetEl);
      }
    }, 150);

    if (matchedCount >= targetCount) setTimeout(onLevelComplete, 500);
  } else {
    playErrorSound();
    createEpicPopup("Try Again! ❌", "#ef4444");
  }
}

function updateProgressBar() {
  const bar = document.getElementById("progress-fill-bar");
  if (bar) bar.style.width = `${(matchedCount / targetCount) * 100}%`;
}

/* ADMOB INTERSTITIAL AD ENGINE (FIXED MANDATORY DISPLAY FOR LEVEL 3, 6, 9 & 10) */
let admobPlugin = null;
const BANNER_AD_ID = "ca-app-pub-8636253253293445/3544840369";
const INTERSTITIAL_AD_ID = "ca-app-pub-8636253253293445/9336077306";

async function initAdMob() {
  try {
    if (window.Capacitor?.Plugins?.AdMob) {
      admobPlugin = window.Capacitor.Plugins.AdMob;
      await admobPlugin.initialize({
        requestTrackingAuthorization: true,
        initializeForTesting: false,
      });

      await initBannerAd();
      await preloadInterstitialAd();
    }
  } catch (err) {
    console.error("AdMob Init Error:", err);
  }
}

async function initBannerAd() {
  try {
    if (admobPlugin) {
      const { BannerAdPosition, BannerAdSize } = window.Capacitor.Plugins.AdMob;
      await admobPlugin.showBanner({
        adId: BANNER_AD_ID,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      });
    }
  } catch (error) {}
}

async function preloadInterstitialAd() {
  if (!admobPlugin) return;
  try {
    await admobPlugin.prepareInterstitial({
      adId: INTERSTITIAL_AD_ID,
      isTesting: false,
    });
  } catch (err) {}
}

async function showMandatoryInterstitialAd() {
  if (!admobPlugin) return;
  try {
    await admobPlugin.showInterstitial();
  } catch (err) {
    console.log("Interstitial Show Error:", err);
  } finally {
    preloadInterstitialAd();
  }
}

async function onLevelComplete() {
  playWinSound();
  coins += 50;
  stars += 3;

  const maxCatLevels = currentCategory.levels
    ? currentCategory.levels.length
    : 10;
  const currentLvlNum = currentLevelIndex + 1;

  trackGameEvent("level_completed", {
    category_id: currentCategory.id,
    category_name: currentCategory.name,
    level: currentLvlNum,
  });

  activeCategoryLevel[currentCategory.id] = currentLvlNum;
  if (currentLvlNum > (categoryProgress[currentCategory.id] || 0)) {
    categoryProgress[currentCategory.id] = currentLvlNum;
  }

  // FIX: Force Ad on Level 3, 6, 9 Mandatory
  if (currentLvlNum === 3 || currentLvlNum === 6 || currentLvlNum === 9) {
    await showMandatoryInterstitialAd();
  }

  if (currentLvlNum >= maxCatLevels) {
    // Level 10 Complete Hone par Ad zaroor chaly
    await showMandatoryInterstitialAd();

    activeCategoryLevel[currentCategory.id] = 0;

    if (!unlockedCertificates.includes(currentCategory.id)) {
      unlockedCertificates.push(currentCategory.id);
    }
    const categorySticker = ALL_STICKERS.find(
      (s) => s.categoryId === currentCategory.id,
    );
    if (categorySticker && !unlockedStickers.includes(categorySticker.id)) {
      unlockedStickers.push(categorySticker.id);
    }

    saveProgress();
    updateHUD();
    const certTitle = document.getElementById("cert-category-name");
    if (certTitle) certTitle.innerText = `${currentCategory.name} Champion`;

    openModal("certificate-modal");
    try {
      fireConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 },
      });
    } catch (e) {}
    return;
  }

  saveProgress();
  updateHUD();

  const praiseEl = document.getElementById("reward-praise");
  const starMsgEl = document.getElementById("reward-star-msg");
  const listEl = document.getElementById("reward-rewards-list");

  if (praiseEl) praiseEl.innerText = "Excellent!";
  if (starMsgEl) starMsgEl.innerText = "⭐ You earned 3 Stars!";
  if (listEl)
    listEl.innerText = `🪙 +50 Coins | 🏆 Level ${currentLvlNum} Badge Earned!`;

  const actionBtn = document.getElementById("modal-action-btn");
  if (actionBtn) {
    if (currentLevelIndex < maxCatLevels - 1) {
      actionBtn.style.display = "block";
      actionBtn.innerText = `NEXT LEVEL ➔ ${currentLvlNum + 1}`;
    } else {
      actionBtn.style.display = "none";
    }
  }

  openModal("victory-modal");
}

function nextLevelAction() {
  closeModal("victory-modal");
  const maxCatLevels = currentCategory.levels
    ? currentCategory.levels.length
    : 10;
  if (currentLevelIndex < maxCatLevels - 1) {
    currentLevelIndex++;
    loadCurrentLevel();
  } else openCategoryMenu();
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "flex";
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

/* BACK NAVIGATION LOGIC */
let backPressCount = 0;

function handleBackNavigation() {
  const tutorModal = document.getElementById("tutorial-modal");
  if (tutorModal && tutorModal.style.display === "flex") {
    tutorModal.style.display = "none";
    try {
      localStorage.setItem("kids_tutorial_completed", "true");
    } catch (e) {}
    return true;
  }

  const certDetail = document.getElementById("certificate-detail-modal");
  if (certDetail && certDetail.style.display === "flex") {
    certDetail.style.display = "none";
    openMyCertificatesModal();
    return true;
  }

  const modals = [
    "certificate-modal",
    "my-certificates-modal",
    "sticker-album-modal",
    "victory-modal",
    "start-choice-modal",
  ];
  for (let mId of modals) {
    const el = document.getElementById(mId);
    if (el && el.style.display === "flex") {
      el.style.display = "none";
      return true;
    }
  }

  const catScreen = document.getElementById("category-screen");
  if (catScreen && catScreen.style.display === "none") {
    openCategoryMenu();
    return true;
  }

  backPressCount++;
  if (backPressCount === 1) {
    createEpicPopup("Press back again to Exit 🚪", "#facc15");
    setTimeout(() => (backPressCount = 0), 2000);
    return true;
  } else if (backPressCount >= 2) {
    return false;
  }

  return true;
}

document.addEventListener("deviceready", () => {
  if (window.Capacitor?.Plugins?.App) {
    window.Capacitor.Plugins.App.addListener("backButton", () => {
      const handled = handleBackNavigation();
      if (!handled) {
        window.Capacitor.Plugins.App.exitApp();
      }
    });
  }
});

window.addEventListener("popstate", () => {
  handleBackNavigation();
});