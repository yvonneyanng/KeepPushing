import { UIStart } from "./src/uiStart.js";
import { setupScene } from "./src/sceneSetup.js";
import { initGame } from "./src/gameLoop.js";
import { GameTimer } from "./src/timer.js";
import { UIProgress } from "./src/uiProgress.js";
import { UIRPMIndicator } from "./src/uiProgress2.js";
import { UICollisionCounter } from "./src/uiProgress3.js";
import { UICountdown } from "./src/uiCountdown.js";

window.isGamePlaying = false;

class Game {
  constructor() {
    this.isPlaying = false;
    // 初始化核心系統
    this.timer = new GameTimer();
    window.gameTimer = this.timer;
    this.uiProgress = new UIProgress(this.carControl);
    this.uiProgress2 = new UIRPMIndicator(this.carControl);
    this.uiProgress3 = new UICollisionCounter();
    this.initUI();
    window.uiProgress = this.uiProgress;
    window.uiProgress2 = this.uiProgress2;
    window.uiProgress3 = this.uiProgress3;
  }

  initUI() {
    this.uiStart = new UIStart(() => {
      this.startCountdown();
    });
  }

  showStartScreen() {
    this.uiStart.show();
  }

  startCountdown() {
    window.isGamePlaying = false;
    this.uiCountdown = new UICountdown(() => {
      window.isGamePlaying = true;
      this.startGame();
    });
    this.uiCountdown.start(3);
  }

  startGame() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    // 啟動計時器
    this.timer.start();
    // 顯示時數錶
    this.uiProgress.show();
    // 顯示轉數錶
    this.uiProgress2.show();
    // 顯示計數器
    this.uiProgress3.show();
  }
}

// 啟動遊戲實例
const game = new Game();

// Initialize scene, camera, and renderer
const { scene, camera, renderer, world, ground } = setupScene();

// Start the game
initGame(scene, camera, renderer, world, ground);

game.showStartScreen();
