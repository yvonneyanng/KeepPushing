export class GameTimer {
    constructor() {
        this.isRunning = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerContainer = null;
        this.timerElement = null;
        this.loadFonts(); // 先載入字體
        this.createTimerUI();
    }

    loadFonts() {
        const fontStyle = document.createElement('style');
        fontStyle.textContent = `
            @font-face {
                font-family: 'PixelifySans';
                src: url('./assets/PixelifySans.ttf') format('truetype');
                font-display: swap;
            }
            @keyframes pulse {
                from { opacity: 0.3; }
                to { opacity: 0.9; }
            }
        `;
        document.head.appendChild(fontStyle);
    }

    
    // 在 timer.js 的 createTimerUI 方法中更新
    createTimerUI() {
        // 主容器（增加金屬邊框效果）
        this.timerContainer = document.createElement('div');
        this.timerContainer.style.position = 'fixed';
        this.timerContainer.style.top = '15px';
        this.timerContainer.style.left = '0';
        this.timerContainer.style.width = '100%';
        this.timerContainer.style.textAlign = 'center';
        this.timerContainer.style.zIndex = '100';
        this.timerContainer.style.display = 'none';
        this.timerContainer.style.pointerEvents = 'none'; // 防止阻擋點擊

        // 計時器外框（金屬質感）
        const timerFrame = document.createElement('div');
        timerFrame.style.display = 'inline-block';
        timerFrame.style.padding = '5px';
        timerFrame.style.background = 'linear-gradient(135deg, #6d6d6d 0%, #2b2b2b 50%, #6d6d6d 100%)';
        timerFrame.style.borderRadius = '18px';
        timerFrame.style.boxShadow = `
            0 0 8px rgba(0,0,0,0.6),
            inset 0 2px 2px rgba(255,255,255,0.1),
            inset 0 -2px 2px rgba(0,0,0,0.5)
        `;

        // 計時器本體（玻璃面板效果）
        this.timerElement = document.createElement('div');
        this.timerElement.style.display = 'inline-block';
        this.timerElement.style.padding = '20px 40px';
        this.timerElement.style.background = 'linear-gradient(145deg, rgba(30,30,30,0.9) 0%, rgba(60,60,60,0.9) 100%)';
        this.timerElement.style.color = '#f0f0f0';
        this.timerElement.style.fontFamily = '"PixelifySans", "Arial Narrow", sans-serif';
        this.timerElement.style.fontSize = '28px';
        this.timerElement.style.borderRadius = '14px';
        this.timerElement.style.textShadow = '0 0 8px #00fffc';
        this.timerElement.style.border = '1px solid rgba(100,255,255,0.2)';
        this.timerElement.style.boxShadow = `
            inset 0 0 15px rgba(0,255,255,0.3),
            0 0 10px rgba(0,255,255,0.2)
        `;
        this.timerElement.textContent = '00:00:00';

        // 添加LED光點效果
        const ledDots = document.createElement('div');
        ledDots.style.position = 'absolute';
        ledDots.style.bottom = '10px';
        ledDots.style.left = '50%';
        ledDots.style.transform = 'translateX(-50%)';
        ledDots.style.display = 'flex';
        ledDots.style.gap = '10px';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.style.width = '6px';
            dot.style.height = '6px';
            dot.style.borderRadius = '50%';
            dot.style.background = '#00fffc';
            dot.style.boxShadow = '0 0 5px #00fffc';
            dot.style.opacity = '0.8';
            dot.style.animation = `pulse ${1 + i*0.2}s infinite alternate`;
            ledDots.appendChild(dot);
        }

        // 組裝元素
        timerFrame.appendChild(this.timerElement);
        this.timerContainer.appendChild(timerFrame);
        this.timerContainer.appendChild(ledDots);
        document.body.appendChild(this.timerContainer);

        // 添加CSS動畫
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                from { opacity: 0.3; }
                to { opacity: 0.9; }
            }
            @font-face {
                font-family: 'PixelifySans';
                src: url('./assets/PixelifySans.ttf') format('truetype');
            }
        `;
        document.head.appendChild(style);
    }

    // 開始計時
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startTime = Date.now() - (this.elapsedTime || 0);
            this.timerContainer.style.display = 'block';
            this.updateTimer();
        }
    }

    // 停止計時
    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationFrameId);
    }

    // 重置計時器
    reset() {
        this.stop();
        this.elapsedTime = 0;
        this.timerElement.textContent = '00:00:00';
        this.timerContainer.style.display = 'none';
    }

    // 更新計時器顯示
    updateTimer() {
        if (!this.isRunning) return;

        this.elapsedTime = Date.now() - this.startTime;
        this.timerElement.textContent = this.formatTime(this.elapsedTime);

        this.animationFrameId = requestAnimationFrame(() => this.updateTimer());
    }

    // 格式化時間顯示 (HH:MM:SS)
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        
        return `${hours}:${minutes}:${seconds}`;
    }

    // 獲取當前時間（毫秒）
    getCurrentTime() {
        return this.elapsedTime;
    }
}