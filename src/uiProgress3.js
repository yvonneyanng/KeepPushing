export class UICollisionCounter {
    constructor() {
        this.collisionCount = 0;
        this.createCollisionDisplay();
    }

/// 計數器 ///
    createCollisionDisplay() {
        // 主容器 (右上角固定定位)
        this.collisionContainer = document.createElement('div');
        this.collisionContainer.style.position = 'fixed';
        this.collisionContainer.style.top = '15px';
        this.collisionContainer.style.left = '15px';
        this.collisionContainer.style.zIndex = '100';
        this.collisionContainer.style.pointerEvents = 'none';

        // 金屬外框 (與計時器相同風格)
        const frame = document.createElement('div');
        frame.style.display = 'inline-block';
        frame.style.padding = '5px';
        frame.style.background = 'linear-gradient(135deg, #6d6d6d 0%, #2b2b2b 50%, #6d6d6d 100%)';
        frame.style.borderRadius = '18px';
        frame.style.boxShadow = `
            0 0 8px rgba(0,0,0,0.6),
            inset 0 2px 2px rgba(255,255,255,0.1),
            inset 0 -2px 2px rgba(0,0,0,0.5)
        `;

        // 碰撞顯示本體 (玻璃面板效果)
        this.collisionDisplay = document.createElement('div');
        this.collisionDisplay.style.display = 'inline-block';
        this.collisionDisplay.style.padding = '10px 10px';
        this.collisionDisplay.style.minWidth = '50px';
        this.collisionDisplay.style.background = 'linear-gradient(145deg, rgba(30,30,30,0.9) 0%, rgba(60,60,60,0.9) 100%)';
        this.collisionDisplay.style.color = '#ff5555'; // 紅色警示色
        this.collisionDisplay.style.fontFamily = '"PixelifySans", "Segment7Standard", monospace';
        this.collisionDisplay.style.fontSize = '20px';
        this.collisionDisplay.style.textAlign = 'center';
        this.collisionDisplay.style.borderRadius = '14px';
        this.collisionDisplay.style.textShadow = '0 0 8px #ff5555';
        this.collisionDisplay.style.border = '1px solid rgba(255,100,100,0.3)';
        this.collisionDisplay.style.boxShadow = `
            inset 0 0 15px rgba(255,50,50,0.3),
            0 0 10px rgba(255,0,0,0.2)
        `;
        this.collisionDisplay.textContent = '000';

        // 標題文字
        const titleLabel = document.createElement('div');
        titleLabel.textContent = 'CRASH';
        titleLabel.style.position = 'absolute';
        titleLabel.style.top = '7px';
        titleLabel.style.left = '50%';
        titleLabel.style.transform = 'translateX(-50%)';
        titleLabel.style.color = 'rgba(255,100,100,0.8)';
        titleLabel.style.fontSize = '10px';
        titleLabel.style.fontFamily = '"PixelifySans", "Segment7Standard", monospace';
        titleLabel.style.whiteSpace = 'nowrap';

        // LED光點 (紅色警示風格)
        const leds = document.createElement('div');
        leds.style.position = 'absolute';
        leds.style.bottom = '9px';
        leds.style.left = '50%';
        leds.style.transform = 'translateX(-50%)';
        leds.style.display = 'flex';
        leds.style.gap = '8px';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.style.width = '4px';
            dot.style.height = '4px';
            dot.style.borderRadius = '50%';
            dot.style.background = '#ff5555';
            dot.style.boxShadow = '0 0 5px #ff5555';
            dot.style.opacity = '0.6';
            dot.style.animation = `pulse ${0.7 + i*0.2}s infinite alternate`;
            leds.appendChild(dot);
        }

        // 組裝元素
        frame.appendChild(this.collisionDisplay);
        frame.appendChild(titleLabel);
        this.collisionContainer.appendChild(frame);
        this.collisionContainer.appendChild(leds);
        document.body.appendChild(this.collisionContainer);

        // 初始隱藏
        this.hide();
    }

    increment(count = 1) {
        this.collisionCount += count;
        this.updateDisplay();
    }

    updateDisplay() {
        this.collisionDisplay.textContent = String(this.collisionCount).padStart(3, '0');
    }

    playHitEffect() {
        // 碰撞時的閃爍效果
        this.collisionDisplay.style.animation = 'none';
        void this.collisionDisplay.offsetWidth; // 觸發重繪
        this.collisionDisplay.style.animation = 'hitBlink 0.3s';
    }

    reset() {
        this.collisionCount = 0;
        this.updateDisplay();
    }

    show() {
        this.collisionContainer.style.display = 'block';
    }

    hide() {
        this.collisionContainer.style.display = 'none';
    }
}