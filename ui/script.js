
"use strict";


const MAX_DIM = 50;
const TICK_INTERVAL = 200;
const DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };
const RUNNING = "running", OVER = "over", WON = "won";

class Board {
  constructor(height, width) {
    if (!Number.isInteger(height) || !Number.isInteger(width) || height < 1 || width < 1)
      throw new Error("Height and width must be whole numbers, at least 1.");
    if (height > MAX_DIM || width > MAX_DIM)
      throw new Error("Height and width can be at most " + MAX_DIM + ".");
    if (height * width < 2) throw new Error("The board needs at least 2 cells.");
    this.height = height;
    this.width = width;
  }
  get cells() { return this.height * this.width; }
  id(row, col) { return row * this.width + col; }
  next(id, dir) {
    const row = Math.floor(id / this.width), col = id % this.width;
    const [dr, dc] = DIRS[dir];
    return this.id((row + dr + this.height) % this.height, (col + dc + this.width) % this.width);
  }
}

class Snake {
  constructor(start) { this.cells = new Set([start]); this.head = start; }
  get length() { return this.cells.size; }
  get tail() { return this.cells.values().next().value; }
  has(id) { return this.cells.has(id); }
  addHead(id) { this.cells.add(id); this.head = id; }
  removeTail() { this.cells.delete(this.tail); }
  headFirst() { return Array.from(this.cells).reverse(); }
}

class RandomSpawner {
  spawn(board, snake) {
    const free = board.cells - snake.length;
    if (free <= 0) return null;
    let k = Math.floor(Math.random() * free);
    for (let id = 0; id < board.cells; id++) {
      if (snake.has(id)) continue;
      if (k === 0) return id;
      k--;
    }
    return null;
  }
}

class Engine {
  constructor(height, width, spawner) {
    this.board = new Board(height, width);
    this.snake = new Snake(this.board.id(0, 0));
    this.spawner = spawner;
    this.applied = "right";
    this.pending = "right";
    this.status = RUNNING;
    this.food = spawner.spawn(this.board, this.snake);
  }
  get score() { return this.snake.length; }

  setDirection(dir) {
    if (this.status !== RUNNING || !(dir in DIRS)) return;
    if (this.snake.length > 1 && dir === OPPOSITE[this.applied]) return;
    this.pending = dir;
  }

  step() {
    if (this.status !== RUNNING) return;
    this.applied = this.pending;
    const next = this.board.next(this.snake.head, this.applied);
    const ate = next === this.food;

    if (this.snake.has(next) && (ate || next !== this.snake.tail)) {
      this.status = OVER;
      return;
    }
    if (!ate) this.snake.removeTail();
    this.snake.addHead(next);

    if (ate) {
      this.food = null;
      if (this.snake.length === this.board.cells) { this.status = WON; return; }
      this.food = this.spawner.spawn(this.board, this.snake);
      if (this.food === null) this.status = WON;
    }
  }
}

const LCD = "#b9c99a", DOT = "#a9bb8b", INK = "#25311b";
const $ = (id) => document.getElementById(id);
const cv = $("cv"), ctx = cv.getContext("2d");
let engine, cs = 10, timer = null, started = false, paused = false;

function layout() {
  const b = engine.board;
  const maxW = $("stage").clientWidth - 16;
  const maxH = Math.max(160, Math.min(window.innerHeight * 0.55, 560));
  cs = Math.max(4, Math.floor(Math.min(maxW / b.width, maxH / b.height)));
  const dpr = window.devicePixelRatio || 1;
  cv.width = b.width * cs * dpr;
  cv.height = b.height * cs * dpr;
  cv.style.width = b.width * cs + "px";
  cv.style.height = b.height * cs + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function render() {
  const b = engine.board;
  ctx.fillStyle = LCD;
  ctx.fillRect(0, 0, b.width * cs, b.height * cs);

  const d = Math.max(1, Math.round(cs / 10));
  ctx.fillStyle = DOT;
  for (let r = 0; r < b.height; r++)
    for (let c = 0; c < b.width; c++)
      ctx.fillRect(c * cs + (cs - d) / 2, r * cs + (cs - d) / 2, d, d);

  ctx.fillStyle = INK;
  const gap = Math.max(1, Math.round(cs * 0.1));
  engine.snake.headFirst().forEach((id, i) => {
    const x = (id % b.width) * cs, y = Math.floor(id / b.width) * cs;
    if (i === 0) ctx.fillRect(x, y, cs, cs);
    else ctx.fillRect(x + gap, y + gap, cs - 2 * gap, cs - 2 * gap);
  });

  if (engine.food !== null) {
    const x = (engine.food % b.width) * cs, y = Math.floor(engine.food / b.width) * cs;
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(2, cs * 0.2);
    const m = ctx.lineWidth / 2 + cs * 0.12;
    ctx.strokeRect(x + m, y + m, cs - 2 * m, cs - 2 * m);
  }
  hud();
}

function hud() {
  $("score").textContent = "Score " + engine.score;
  let state = "Running", msg = "";
  if (!started) { state = "Ready"; msg = "Press Start"; }
  else if (engine.status === OVER) { state = "Game over"; msg = "Game over. Final score " + engine.score + "."; }
  else if (engine.status === WON) { state = "You win"; msg = "Board full. You win with " + engine.score + "."; }
  else if (paused) { state = "Paused"; msg = "Paused. Press space to resume."; }
  $("state").textContent = state;
  $("msg").textContent = msg;
  $("msg").hidden = msg === "";
  $("start").textContent = started ? "New game" : "Start";
}

function stopTimer() { clearInterval(timer); timer = null; }
function startTimer() { stopTimer(); timer = setInterval(tick, TICK_INTERVAL); }

function tick() {
  engine.step();
  render();
  if (engine.status !== RUNNING) stopTimer();
}

function setup(height, width) {
  engine = new Engine(height, width, new RandomSpawner());
  stopTimer();
  started = false;
  paused = false;
  layout();
  render();
}

$("setup").addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    setup(Number($("h").value), Number($("w").value));
  } catch (err) {
    $("err").textContent = err.message;
    return;
  }
  $("err").textContent = "";
  started = true;
  startTimer();
  render();
  document.activeElement.blur();
});

function turn(dir) {
  if (started && !paused) engine.setDirection(dir);
}

function togglePause() {
  if (!started || engine.status !== RUNNING) return;
  paused = !paused;
  if (paused) stopTimer(); else startTimer();
  render();
}

const KEYS = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down",
  ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, select, textarea")) return;
  if (e.key in KEYS) { e.preventDefault(); turn(KEYS[e.key]); }
  else if (e.key === " ") { e.preventDefault(); togglePause(); }
});

document.querySelectorAll(".pad button").forEach((btn) =>
  btn.addEventListener("pointerdown", (e) => { e.preventDefault(); turn(btn.dataset.d); }));

window.addEventListener("resize", () => { layout(); render(); });

setup(Number($("h").value), Number($("w").value));