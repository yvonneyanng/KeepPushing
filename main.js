import { UIStart } from "./src/uiStart.js";
import { setupScene } from "./src/sceneSetup.js";
import { initGame } from "./src/gameLoop.js";
import { GameTimer } from "./src/timer.js";
import { UIProgress } from "./src/uiProgress.js";
import { UICountdown } from "./src/uiCountdown.js";

window.isGamePlaying = false;
class Game {
  constructor() {
    this.isPlaying = false;

    // 初始化核心系統
    this.timer = new GameTimer();
    window.gameTimer = this.timer;
    this.uiProgress = new UIProgress(this.carControl);
    this.initUI();

    window.uiProgress = this.uiProgress;
  }

  initUI() {
    this.uiStart = new UIStart(() => {
      this.startCountdown();
    });
  }

  startCountdown() {
    window.isGamePlaying = false;
    this.uiCountdown = new UICountdown(() => {
      window.isGamePlaying = true;
      this.startGame();
    });
    this.uiCountdown.start(5); // 3-second countdown
  }

  startGame() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    console.log("GAME START");

    // 啟動計時器
    this.timer.start();

    // 顯示賽車儀表
    this.uiProgress.show();

    // 初始化遊戲核心邏輯
    this.gameLoop = new GameLoop();
    this.gameLoop.start();
  }
}

// 啟動遊戲實例
const game = new Game();

// Initialize scene, camera, and renderer
const { scene, camera, renderer, world, ground } = setupScene();

// Start the game
initGame(scene, camera, renderer, world, ground);
