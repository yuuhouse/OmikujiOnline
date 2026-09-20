const fortuneGroups = {
  "大吉": [1, 8, 9, 10, 11, 12, 13, 62, 78, 80, 85, 86, 87, 89, 90, 96, 99],
  "吉": [4, 16, 18, 20, 21, 22, 23, 25, 26, 27, 29, 32, 33, 34, 35, 42, 43, 44, 45, 47, 49, 50, 51, 53, 55, 57, 68, 72, 73, 76, 79, 91, 92, 93, 95],
  "半吉": [30, 37, 38, 61, 94],
  "小吉": [2, 48, 60, 81],
  "末小吉": [19, 40, 56],
  "末吉": [6, 14, 31, 36, 41, 65],
  "凶": [3, 5, 7, 15, 17, 24, 28, 39, 46, 52, 54, 58, 59, 63, 64, 66, 67, 69, 70, 71, 74, 75, 77, 82, 83, 84, 88, 97, 98, 100]
};

const fortunes = Object.entries(fortuneGroups).reduce((result, [type, numbers]) => {
  numbers.forEach((number) => { result[number] = type; });
  return result;
}, {});

// 每支籤的完整資料欄位。正式籤詩與解說確認來源後，再逐筆替換示範內容。
const fortuneData = Object.fromEntries(
  Array.from({ length: 100 }, (_, index) => {
    const number = index + 1;
    return [number, {
      number,
      fortune: fortunes[number],
      poemOriginal: "示範詩：雲開月明，靜守自成。",
      poemReading: "示範讀音：くもひらき、つきあきらかに、しずかにまもればなる。",
      poemTranslation: "示範翻譯：雲散之後月色明朗，安定守成便能有所收穫。",
      explanation: "示範解說：眼前的道路逐漸清楚，先整理心情，再穩定地完成眼前的事。",
      wish: "示範：慢慢推進即可實現，不宜急躁。",
      waitingPerson: "示範：會收到消息，但需要一些時間。",
      lostItem: "示範：仔細尋找原先使用過的地方。",
      travel: "示範：適合短途出行，行程宜預留彈性。",
      business: "示範：守住品質，與熟悉的夥伴合作較順利。",
      study: "示範：按部就班複習，累積會帶來成果。",
      love: "示範：坦率表達心意，關係會逐漸升溫。",
      health: "示範：注意休息與作息，避免過度勉強。",
      lawsuit: "示範：先溝通再行動，保留紀錄對自己有利。",
      moving: "示範：可以規劃，但應先確認細節與時間。",
      marriage: "示範：彼此尊重、慢慢了解，關係可穩定發展。",
      advice: "示範：保持耐心，今天適合整理與準備。"
    }];
  })
);

const drawButton = document.querySelector("#draw-button");
const numberElement = document.querySelector("#fortune-number");
const typeElement = document.querySelector("#fortune-type");
const poemElement = document.querySelector("#fortune-poem");
const fortuneCard = document.querySelector(".fortune-card");
const omikujiBox = document.querySelector(".omikuji-box");
const musicToggle = document.querySelector("#music-toggle");
const themeToggle = document.querySelector("#theme-toggle");
const fortuneDetails = document.querySelector("#fortune-details");

function updateThemeButton() {
  const isDay = document.body.classList.contains("day-mode");
  themeToggle.textContent = isDay ? "☾ 夜間模式" : "☀ 日間模式";
  themeToggle.setAttribute("aria-pressed", String(isDay));
}

if (window.localStorage.getItem("omikuji-theme") === "day") {
  document.body.classList.add("day-mode");
}
updateThemeButton();

themeToggle.addEventListener("click", () => {
  const isDay = document.body.classList.toggle("day-mode");
  window.localStorage.setItem("omikuji-theme", isDay ? "day" : "night");
  updateThemeButton();
});

let audioContext;
let musicTimer;
let musicOn = false;
let musicStep = 0;

function getAudioContext() {
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playClickSound() {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(620, now);
  oscillator.frequency.exponentialRampToValueAtTime(210, now + 0.08);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.1);
}

function playMusicNote() {
  if (!musicOn) return;

  const context = getAudioContext();
  const now = context.currentTime;
  const melody = [
    523.25, 440, 392, 349.23, 392, 440, 523.25, 587.33,
    659.25, 587.33, 523.25, 440, 392, 349.23, 293.66, 349.23
  ];
  const bass = [130.81, 130.81, 174.61, 174.61, 146.83, 146.83, 196, 196];
  const frequency = melody[musicStep % melody.length];

  const pluck = context.createOscillator();
  const pluckGain = context.createGain();
  pluck.type = "triangle";
  pluck.frequency.setValueAtTime(frequency, now);
  pluckGain.gain.setValueAtTime(0.0001, now);
  pluckGain.gain.exponentialRampToValueAtTime(0.055, now + 0.018);
  pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
  pluck.connect(pluckGain).connect(context.destination);
  pluck.start(now);
  pluck.stop(now + 0.4);

  const shimmer = context.createOscillator();
  const shimmerGain = context.createGain();
  shimmer.type = "sine";
  shimmer.frequency.setValueAtTime(frequency * 2, now);
  shimmerGain.gain.setValueAtTime(0.0001, now);
  shimmerGain.gain.exponentialRampToValueAtTime(0.018, now + 0.02);
  shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  shimmer.connect(shimmerGain).connect(context.destination);
  shimmer.start(now);
  shimmer.stop(now + 0.32);

  if (musicStep % 2 === 0) {
    const bassTone = context.createOscillator();
    const bassGain = context.createGain();
    bassTone.type = "sine";
    bassTone.frequency.setValueAtTime(bass[musicStep / 2 % bass.length], now);
    bassGain.gain.setValueAtTime(0.0001, now);
    bassGain.gain.exponentialRampToValueAtTime(0.025, now + 0.05);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    bassTone.connect(bassGain).connect(context.destination);
    bassTone.start(now);
    bassTone.stop(now + 0.75);
  }

  musicStep += 1;
  musicTimer = window.setTimeout(playMusicNote, 420);
}

function startMusic() {
  getAudioContext();
  if (musicOn) return;
  musicOn = true;
  musicToggle.textContent = "♫ 背景音樂：開";
  musicToggle.setAttribute("aria-pressed", "true");
  playMusicNote();
}

function stopMusic() {
  musicOn = false;
  window.clearTimeout(musicTimer);
  musicToggle.textContent = "♫ 開啟背景音樂";
  musicToggle.setAttribute("aria-pressed", "false");
}

musicToggle.addEventListener("click", () => {
  playClickSound();
  if (musicOn) stopMusic();
  else startMusic();
});

drawButton.addEventListener("click", () => {
  if (drawButton.disabled) return;

  playClickSound();
  startMusic();
  drawButton.disabled = true;
  fortuneCard.classList.add("is-drawing");
  omikujiBox.classList.add("is-shaking");
  numberElement.textContent = "抽取中…";
  typeElement.textContent = "請靜候片刻";
  poemElement.textContent = "籤筒輕響，等待今日的指引。";

  window.setTimeout(() => {
    const number = Math.floor(Math.random() * 100) + 1;
    const fortune = fortuneData[number];
    numberElement.textContent = `第 ${number} 番`;
    typeElement.textContent = fortune.fortune;
    poemElement.textContent = fortune.poemOriginal;
    fortuneDetails.querySelectorAll("[data-field]").forEach((element) => {
      element.textContent = fortune[element.dataset.field];
    });
    fortuneDetails.hidden = false;
    fortuneCard.classList.remove("is-drawing");
    omikujiBox.classList.remove("is-shaking");
    drawButton.disabled = false;
  }, 900);
});
