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
let musicOn = false;
// Music: "Yokaze no Sasayaki" by KIMONO DE MUSIC, used under the creator's free-use terms.
const backgroundMusic = new Audio("assets/yokaze-no-sasayaki.mp3");
backgroundMusic.preload = "auto";
backgroundMusic.loop = true;
backgroundMusic.volume = 0.18;

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

function startMusic() {
  if (musicOn) return;
  musicOn = true;
  backgroundMusic.play().catch((error) => console.warn("Unable to play background music:", error));
  musicToggle.textContent = "♫ 背景音樂：開";
  musicToggle.setAttribute("aria-pressed", "true");
}

function stopMusic() {
  musicOn = false;
  backgroundMusic.pause();
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
  fortuneDetails.hidden = true;
  numberElement.textContent = "抽取中…";
  typeElement.textContent = "請靜候片刻";
  poemElement.textContent = "籤筒輕響，等待今日的指引。";

  window.setTimeout(() => {
    try {
      const number = Math.floor(Math.random() * 100) + 1;
      const fortune = fortuneData[number];
      if (!fortune) throw new Error(`Missing fortune data for number ${number}`);

      numberElement.textContent = `第 ${number} 番`;
      typeElement.textContent = fortune.fortune;
      poemElement.textContent = fortune.poemOriginal;
      fortuneDetails.querySelectorAll("[data-field]").forEach((element) => {
        element.textContent = fortune[element.dataset.field] ?? "暫無資料";
      });
      fortuneDetails.hidden = false;
    } catch (error) {
      console.error("Unable to draw fortune:", error);
      numberElement.textContent = "暫時無法抽籤";
      typeElement.textContent = "請稍後再試";
      poemElement.textContent = "籤詩資料暫時無法載入，請重新整理頁面後再試。";
      fortuneDetails.hidden = true;
    } finally {
      fortuneCard.classList.remove("is-drawing");
      omikujiBox.classList.remove("is-shaking");
      drawButton.disabled = false;
    }
  }, 900);
});
