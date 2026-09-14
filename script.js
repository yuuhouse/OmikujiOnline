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

const drawButton = document.querySelector("#draw-button");
const numberElement = document.querySelector("#fortune-number");
const typeElement = document.querySelector("#fortune-type");
const poemElement = document.querySelector("#fortune-poem");
const fortuneCard = document.querySelector(".fortune-card");
const omikujiBox = document.querySelector(".omikuji-box");
const musicToggle = document.querySelector("#music-toggle");

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
  numberElement.textContent = `第 ${number} 番`;
  typeElement.textContent = fortunes[number];
  poemElement.textContent = "雲開月明，前路漸清；守心而行，自有所得。";
    fortuneCard.classList.remove("is-drawing");
    omikujiBox.classList.remove("is-shaking");
    drawButton.disabled = false;
  }, 900);
});
