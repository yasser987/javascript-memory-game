const PAIR_COUNT = 10;
const board = document.querySelector(".board");
const movesElement = document.querySelector(".moves");
const matchesElement = document.querySelector(".matches");
const timerElement = document.querySelector(".timer");
const result = document.querySelector(".result");
const resultSummary = document.querySelector(".result-summary");
const restartButton = document.querySelector(".restart-button");
const playAgainButton = document.querySelector(".play-again");
const announcement = document.querySelector(".announcement");

let firstCard = null;
let secondCard = null;
let boardLocked = false;
let moves = 0;
let matches = 0;
let startedAt = null;
let timerId = null;

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateStatus() {
  movesElement.textContent = moves;
  matchesElement.textContent = `${matches} / ${PAIR_COUNT}`;
}

function startTimer() {
  if (startedAt) return;
  startedAt = Date.now();
  timerId = window.setInterval(() => {
    timerElement.textContent = formatTime(Date.now() - startedAt);
  }, 1000);
}

function playSound(selector) {
  const sound = document.querySelector(selector);
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function createCard(value, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "card";
  button.dataset.value = value;
  button.setAttribute("aria-label", `Hidden card ${index + 1}`);
  button.innerHTML = `
    <span class="card__inner">
      <span class="card__face card__back"><img src="images/question.png" alt=""></span>
      <span class="card__face card__front"><img src="images/image${value}.png" alt="Card symbol ${value}"></span>
    </span>`;
  return button;
}

function reveal(card) {
  card.classList.add("card--flipped");
  card.setAttribute("aria-label", `Card symbol ${card.dataset.value}`);
  card.disabled = true;
}

function conceal(card) {
  card.classList.remove("card--flipped");
  card.setAttribute("aria-label", "Hidden card");
  card.disabled = false;
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  boardLocked = false;
}

function finishGame() {
  clearInterval(timerId);
  const elapsed = Date.now() - startedAt;
  timerElement.textContent = formatTime(elapsed);
  resultSummary.textContent = `Completed in ${moves} moves and ${formatTime(elapsed)}.`;
  result.hidden = false;
  playAgainButton.focus();
}

function compareCards() {
  moves += 1;
  const matched = firstCard.dataset.value === secondCard.dataset.value;

  if (matched) {
    matches += 1;
    firstCard.classList.add("card--matched");
    secondCard.classList.add("card--matched");
    firstCard.setAttribute("aria-label", `Matched symbol ${firstCard.dataset.value}`);
    secondCard.setAttribute("aria-label", `Matched symbol ${secondCard.dataset.value}`);
    announcement.textContent = "Pair matched.";
    playSound("#success-sound");
    updateStatus();
    resetTurn();
    if (matches === PAIR_COUNT) finishGame();
    return;
  }

  boardLocked = true;
  announcement.textContent = "Cards do not match.";
  playSound("#fail-sound");
  updateStatus();

  window.setTimeout(() => {
    conceal(firstCard);
    conceal(secondCard);
    resetTurn();
  }, 850);
}

function handleCardClick(event) {
  const card = event.target.closest(".card");
  if (!card || boardLocked || card === firstCard || card.classList.contains("card--matched")) return;

  startTimer();
  reveal(card);

  if (!firstCard) {
    firstCard = card;
    announcement.textContent = `First card is symbol ${card.dataset.value}.`;
    return;
  }

  secondCard = card;
  compareCards();
}

function startGame() {
  clearInterval(timerId);
  firstCard = null;
  secondCard = null;
  boardLocked = false;
  moves = 0;
  matches = 0;
  startedAt = null;
  timerId = null;
  timerElement.textContent = "00:00";
  result.hidden = true;

  const values = shuffle(
    Array.from({ length: PAIR_COUNT }, (_, index) => index + 1).flatMap((value) => [value, value])
  );

  board.replaceChildren(...values.map(createCard));
  updateStatus();
  announcement.textContent = "New game ready.";
  board.querySelector(".card").focus();
}

board.addEventListener("click", handleCardClick);
restartButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", startGame);

startGame();