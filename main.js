import { UIStart } from "./src/uiStart.js";
import { setupScene } from "./src/sceneSetup.js";
import { initGame } from "./src/gameLoop.js";
import { GameTimer } from './src/timer.js';
import { UIProgress } from './src/uiProgress.js';

class Game {
    constructor() {
        this.isPlaying = false;

        // 初始化核心系統
        this.timer = new GameTimer();
        this.uiProgress = new UIProgress(this.carControl);
        this.initUI();
    }

    initUI() {
        this.uiStart = new UIStart(() => {
            this.startGame();
        });
    }

    startGame() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        console.log('GAME START');

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
