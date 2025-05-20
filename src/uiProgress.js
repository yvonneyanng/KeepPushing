export class UIProgress {
    constructor(carControl) {
        this.carControl = carControl; // 接收車輛控制實例
        this.speed = 0;
        this.maxSpeed = 350; // 假設最大速度 (km/h)
        this.createSpeedometer(); // 新增時數錶
    }

/// 時數錶 ///
    createSpeedometer() {
        // 主容器 (右下角固定定位)
        this.speedometerContainer = document.createElement('div');
        this.speedometerContainer.style.position = 'fixed';
        this.speedometerContainer.style.bottom = '45px';
        this.speedometerContainer.style.right = '45px';
        this.speedometerContainer.style.zIndex = '100';
        this.speedometerContainer.style.pointerEvents = 'none';

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

        // 時數錶本體 (玻璃面板效果)
        this.speedDisplay = document.createElement('div');
        this.speedDisplay.style.display = 'inline-block';
        this.speedDisplay.style.padding = '30px 60px';
        this.speedDisplay.style.minWidth = '120px';
        this.speedDisplay.style.background = 'linear-gradient(145deg, rgba(30,30,30,0.9) 0%, rgba(60,60,60,0.9) 100%)';
        this.speedDisplay.style.color = '#ffffff';
        this.speedDisplay.style.fontFamily = '"PixelifySans", "Segment7Standard", monospace';
        this.speedDisplay.style.fontSize = '56px';
        this.speedDisplay.style.textAlign = 'center';
        this.speedDisplay.style.borderRadius = '14px';
        this.speedDisplay.style.textShadow = '0 0 8px #00fffc';
        this.speedDisplay.style.border = '1px solid rgba(100,255,255,0.2)';
        this.speedDisplay.style.boxShadow = `
            inset 0 0 15px rgba(0,255,255,0.3),
            0 0 10px rgba(0,255,255,0.2)
        `;
        this.speedDisplay.textContent = '000';

        // 單位標示
        const unitLabel = document.createElement('div');
        unitLabel.textContent = 'km/h';
        unitLabel.style.position = 'absolute';
        unitLabel.style.bottom = '40px';
        unitLabel.style.right = '20px';
        unitLabel.style.color = 'rgba(0,255,255,0.7)';
        unitLabel.style.fontSize = '14px';
        unitLabel.style.fontFamily = '"PixelifySans", "Segment7Standard", monospace';

        // LED光點 (與計時器相同風格)
        const leds = document.createElement('div');
        leds.style.position = 'absolute';
        leds.style.bottom = '35px';
        leds.style.left = '50%';
        leds.style.transform = 'translateX(-50%)';
        leds.style.display = 'flex';
        leds.style.gap = '10px';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.style.width = '6px';
            dot.style.height = '6px';
            dot.style.borderRadius = '50%';
            dot.style.background = '#00fffc';
            dot.style.boxShadow = '0 0 5px #00fffc';
            dot.style.opacity = '0.8';
            dot.style.animation = `pulse ${0.8 + i*0.2}s infinite alternate`;
            leds.appendChild(dot);
        }

        // 轉速條 (可選)
        const rpmBar = document.createElement('div');
        rpmBar.style.height = '8px';
        rpmBar.style.background = 'linear-gradient(90deg, #00ff00 0%, #ff0000 100%)';
        rpmBar.style.borderRadius = '8px';
        rpmBar.style.marginTop = '15px';
        rpmBar.style.overflow = 'hidden';
        
        this.rpmIndicator = document.createElement('div');
        this.rpmIndicator.style.height = '100%';
        this.rpmIndicator.style.width = '0%';
        this.rpmIndicator.style.background = '#00fffc';
        this.rpmIndicator.style.boxShadow = '0 0 5px #00fffc';
        rpmBar.appendChild(this.rpmIndicator);

        // 組裝元素
        frame.appendChild(this.speedDisplay);
        frame.appendChild(unitLabel);
        this.speedometerContainer.appendChild(frame);
        this.speedometerContainer.appendChild(leds);
        this.speedometerContainer.appendChild(rpmBar);
        document.body.appendChild(this.speedometerContainer);

        // 初始隱藏
        this.hide();
    }

    update(currentSpeed) {
        this.speed = Math.min(currentSpeed, this.maxSpeed);
        this.speedDisplay.textContent = String(Math.floor(this.speed)).padStart(3, '0');
        
        // 更新轉速條 (假設是線性關係)
        const rpmPercent = (this.speed / this.maxSpeed) * 100;
        this.rpmIndicator.style.width = `${rpmPercent}%`;
        
        // 速度越高顏色越紅
        if (rpmPercent > 80) {
            this.rpmIndicator.style.background = '#ff3300';
            this.rpmIndicator.style.boxShadow = '0 0 5px #ff3300';
        } else {
            this.rpmIndicator.style.background = '#00fffc';
            this.rpmIndicator.style.boxShadow = '0 0 5px #00fffc';
        }
    }

    show() {
        this.speedometerContainer.style.display = 'block';
    }

    hide() {
        this.speedometerContainer.style.display = 'none';
    }
}