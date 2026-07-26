// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
const LEADERBOARD_STORAGE_KEY = 'sudoku-leaderboard';
const THEME_STORAGE_KEY = 'sudoku-theme';
let puzzle = [];
let timerInterval = null;
let elapsedSeconds = 0;
let currentGameCompleted = false;


function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateTimer() {
  elapsedSeconds += 1;
  document.getElementById('timer').textContent = formatTime(elapsedSeconds);
}

function startTimer() {
  stopTimer();
  elapsedSeconds = 0;
  document.getElementById('timer').textContent = formatTime(elapsedSeconds);
  timerInterval = window.setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (timerInterval !== null) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
}

function renderLeaderboard(entries) {
  const leaderboardList = document.getElementById('leaderboard-list');
  if (!leaderboardList) {
    return;
  }

  leaderboardList.innerHTML = '';
  if (!entries.length) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'No completed games yet.';
    leaderboardList.appendChild(emptyItem);
    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement('li');
    const difficulty = entry.difficulty ? entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1) : 'Unknown';
    item.textContent = `${index + 1}. ${formatTime(entry.seconds)} - ${difficulty}`;
    leaderboardList.appendChild(item);
  });
}

function loadLeaderboard() {
  try {
    const storedEntries = JSON.parse(localStorage.getItem(LEADERBOARD_STORAGE_KEY) || '[]');
    const sortedEntries = storedEntries
      .filter((entry) => Number.isFinite(entry.seconds))
      .sort((a, b) => a.seconds - b.seconds)
      .slice(0, 10);
    renderLeaderboard(sortedEntries);
  } catch (error) {
    renderLeaderboard([]);
  }
}

function applyTheme(theme) {
  document.body.classList.toggle('dark-mode', theme === 'dark');
  const themeButton = document.getElementById('theme-toggle');
  if (themeButton) {
    themeButton.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
}

function loadTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
  } catch (error) {
    applyTheme('light');
  }
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
  applyTheme(nextTheme);
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

function saveLeaderboardEntry(seconds, difficulty) {
  try {
    const storedEntries = JSON.parse(localStorage.getItem(LEADERBOARD_STORAGE_KEY) || '[]');
    const updatedEntries = [...storedEntries, {seconds, difficulty}]
      .sort((a, b) => a.seconds - b.seconds)
      .slice(0, 10);
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updatedEntries));
    renderLeaderboard(updatedEntries);
  } catch (error) {
    renderLeaderboard([]);
  }
}

function getBoardInputs() {
  const boardDiv = document.getElementById('sudoku-board');
  return Array.from(boardDiv.getElementsByTagName('input'));
}

function isCellEditable(input) {
  return !input.disabled && input.dataset.hint !== 'true';
}

function validateCell(input, allInputs) {
  if (!isCellEditable(input)) {
    input.classList.remove('invalid');
    return;
  }

  const row = Number(input.dataset.row);
  const col = Number(input.dataset.col);
  const value = input.value;

  if (value === '') {
    input.classList.remove('invalid');
    return;
  }

  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 9) {
    input.classList.add('invalid');
    return;
  }

  const hasConflict = allInputs.some((otherInput) => {
    if (otherInput === input || otherInput.value === '') {
      return false;
    }

    const otherRow = Number(otherInput.dataset.row);
    const otherCol = Number(otherInput.dataset.col);
    const sameRow = otherRow === row;
    const sameCol = otherCol === col;
    const sameBox = Math.floor(otherRow / 3) === Math.floor(row / 3)
      && Math.floor(otherCol / 3) === Math.floor(col / 3);

    return otherInput.value === value && (sameRow || sameCol || sameBox);
  });

  input.classList.toggle('invalid', hasConflict);
}

function updateCellValidation(input) {
  const allInputs = getBoardInputs();
  const row = Number(input.dataset.row);
  const col = Number(input.dataset.col);
  const affectedCells = new Set();

  for (let i = 0; i < SIZE; i += 1) {
    affectedCells.add(allInputs[row * SIZE + i]);
    affectedCells.add(allInputs[i * SIZE + col]);
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      affectedCells.add(allInputs[r * SIZE + c]);
    }
  }

  Array.from(affectedCells).forEach((cell) => {
    if (cell) {
      validateCell(cell, allInputs);
    }
  });
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        updateCellValidation(e.target);
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.className = 'sudoku-cell prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
        inp.className = 'sudoku-cell';
      }
      inp.dataset.hint = 'false';
      inp.classList.remove('invalid');
    }
  }
}

async function newGame() {
  currentGameCompleted = false;
  const difficulty = document.getElementById('difficulty').value;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  document.getElementById('message').innerText = '';
  startTimer();
}

async function revealHint() {
  const res = await fetch('/hint');
  const data = await res.json();
  if (data.error) {
    return;
  }

  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const idx = data.row * SIZE + data.col;
  const inp = inputs[idx];
  inp.value = data.value;
  inp.disabled = true;
  inp.dataset.hint = 'true';
  inp.className = 'sudoku-cell hint';
  inp.classList.remove('invalid');
}

async function checkSolution() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }
  const incorrect = new Set(data.incorrect.map(x => x[0]*SIZE + x[1]));
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) {
      if (inp.dataset.hint === 'true') {
        inp.className = 'sudoku-cell hint';
      } else {
        inp.className = 'sudoku-cell prefilled';
      }
      continue;
    }
    inp.className = 'sudoku-cell';
    if (incorrect.has(idx)) {
      inp.className = 'sudoku-cell incorrect';
    }
  }
  if (incorrect.size === 0) {
    if (!currentGameCompleted) {
      currentGameCompleted = true;
      saveLeaderboardEntry(elapsedSeconds, document.getElementById('difficulty').value);
    }
    stopTimer();
    msg.style.color = '#388e3c';
    msg.innerText = 'Congratulations! You solved it!';
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

// Wire buttons
window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint').addEventListener('click', revealHint);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  loadTheme();
  loadLeaderboard();
  // initialize
  newGame();
});