// config (can be overridden at runtime if needed)
window.API_BASE = window.API_BASE || "/api";

document.addEventListener("DOMContentLoaded", () => {

  let board = Array(9).fill(null);
  let current = "X";
  let gameOver = false;

  let playerX = "";
  let playerO = "";
  let mode = "pvp";

  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");

  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");

  startBtn.addEventListener("click", startGame);
  resetBtn.addEventListener("click", reset);

  function startGame() {
    playerX = document.getElementById("playerX").value || "Player X";
    playerO = document.getElementById("playerO").value || "AI";
    mode = document.getElementById("mode").value;

    board = Array(9).fill(null);
    current = "X";
    gameOver = false;

    statusEl.innerText = `Turn: ${playerX} (X)`;
    render();
  }

  function render() {
    boardEl.innerHTML = "";

    board.forEach((cell, i) => {
      const div = document.createElement("div");
      div.className = "cell";

      if (cell) div.classList.add(cell.toLowerCase());

      div.innerText = cell || "";
      div.addEventListener("click", () => move(i));

      boardEl.appendChild(div);
    });
  }

  function move(i) {
    if (board[i] || gameOver) return;

    board[i] = current;

    if (checkWin(current)) {
      const winner = current === "X" ? playerX : playerO;
      end(`${winner} wins`);
      return;
    }

    if (!board.includes(null)) {
      end("Draw");
      return;
    }

    current = current === "X" ? "O" : "X";
    render();

    if (mode !== "pvp" && current === "O") {
      setTimeout(aiMove, 300);
    }

    statusEl.innerText =
      current === "X"
        ? `Turn: ${playerX} (X)`
        : `Turn: ${playerO} (O)`;
  }

  function aiMove() {
    let idx;

    if (mode === "easy") {
      idx = randomMove();
    }

    if (mode === "hard") {
      idx = findWinningMove("O") || randomMove();
    }

    if (mode === "xhard") {
      idx = bestMove();
    }

    if (idx !== undefined) move(idx);
  }

  function randomMove() {
    const empty = board
      .map((v, i) => (v === null ? i : null))
      .filter((v) => v !== null);

    return empty[Math.floor(Math.random() * empty.length)];
  }

  function findWinningMove(p) {
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = p;
        if (checkWin(p)) {
          board[i] = null;
          return i;
        }
        board[i] = null;
      }
    }
  }

  function bestMove() {
    let bestScore = -Infinity;
    let moveIdx;

    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "O";
        let score = minimax(board, 0, false);
        board[i] = null;

        if (score > bestScore) {
          bestScore = score;
          moveIdx = i;
        }
      }
    }
    return moveIdx;
  }

  function minimax(b, depth, isMax) {
    if (checkWin("O")) return 10 - depth;
    if (checkWin("X")) return depth - 10;
    if (!b.includes(null)) return 0;

    let best = isMax ? -Infinity : Infinity;

    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = isMax ? "O" : "X";
        let score = minimax(b, depth + 1, !isMax);
        b[i] = null;
        best = isMax ? Math.max(score, best) : Math.min(score, best);
      }
    }
    return best;
  }

  function checkWin(p) {
    const w = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    return w.some(c => c.every(i => board[i] === p));
  }

  function end(msg) {
    statusEl.innerText = msg;
    gameOver = true;

    if (msg === "Draw") return;

    const winner = current === "X" ? playerX : playerO;

    fetch(`${window.API_BASE}/win/${winner}`, {
      method: "POST"
    }).catch((err) => {
      console.error("API error:", err);
    });
  }

  function reset() {
    board = Array(9).fill(null);
    current = "X";
    gameOver = false;
    statusEl.innerText = "";
    render();
  }

});