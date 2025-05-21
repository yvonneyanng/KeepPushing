export class UIRPMIndicator {
    constructor(carControl) {
        this.carControl = carControl;
        this.speed = 0;
        this.maxRPM = 9250; // 假設紅線區在 8000 RPM
        this.createRPMGauge();
    }

/// 轉數錶 ///
    createRPMGauge() {
        // 主容器 (左下角固定定位)
        this.rpmContainer = document.createElement('div');
        this.rpmContainer.style.position = 'fixed';
        this.rpmContainer.style.bottom = '50px';
        this.rpmContainer.style.left = '50px';
        this.rpmContainer.style.zIndex = '100';
        this.rpmContainer.style.pointerEvents = 'none';

        // 金屬外框 (圓形設計)
        const frame = document.createElement('div');
        frame.style.width = '150px';
        frame.style.height = '150px';
        frame.style.borderRadius = '50%';
        frame.style.background = 'linear-gradient(135deg, #6d6d6d 0%, #2b2b2b 50%, #6d6d6d 100%)';
        frame.style.boxShadow = `
            0 0 8px rgba(0,0,0,0.6),
            inset 0 2px 2px rgba(255,255,255,0.1),
            inset 0 -2px 2px rgba(0,0,0,0.5)
        `;
        frame.style.position = 'relative';
        frame.style.padding = '10px';

        // 玻璃錶盤
        const gauge = document.createElement('div');
        gauge.style.width = '100%';
        gauge.style.height = '100%';
        gauge.style.borderRadius = '50%';
        gauge.style.background = 'radial-gradient(circle, rgba(30,30,30,0.9) 0%, rgba(60,60,60,0.9) 100%)';
        gauge.style.border = '1px solid rgba(100,255,255,0.2)';
        gauge.style.boxShadow = `
            inset 0 0 15px rgba(0,255,255,0.3),
            0 0 10px rgba(0,255,255,0.2)
        `;
        gauge.style.position = 'relative';
        gauge.style.overflow = 'hidden';

        // 刻度環
        const scale = document.createElement('div');
        scale.style.position = 'absolute';
        scale.style.width = '90%';
        scale.style.height = '90%';
        scale.style.top = '5%';
        scale.style.left = '5%';
        scale.style.borderRadius = '50%';
        
        // 添加刻度線
        for (let i = 0; i < 12; i++) {
            const tick = document.createElement('div');
            const angle = i * 30;
            tick.style.position = 'absolute';
            tick.style.width = '2px';
            tick.style.height = angle % 90 === 0 ? '12px' : '6px';
            tick.style.background = angle % 90 === 0 ? '#00fffc' : 'rgb(80, 255, 0)';
            tick.style.left = '50%';
            tick.style.top = '0';
            tick.style.transformOrigin = '50% 100%';
            tick.style.transform = `translate(-50%, 0) rotate(${angle}deg)`;
            scale.appendChild(tick);
        }

        // 指針
        this.needle = document.createElement('div');
        this.needle.style.position = 'absolute';
        this.needle.style.width = '1.5px';
        this.needle.style.height = '42%';
        this.needle.style.background = '#ff3300';
        this.needle.style.left = '50%';
        this.needle.style.top = '70%';
        this.needle.style.transformOrigin = '50% 0';
        this.needle.style.transform = 'translate(-50%, -50%) rotate(-135deg)';
        this.needle.style.boxShadow = '0 0 5px #ff3300';

        // 中心軸
        const centerPin = document.createElement('div');
        centerPin.style.position = 'absolute';
        centerPin.style.width = '10px';
        centerPin.style.height = '10px';
        centerPin.style.background = '#333';
        centerPin.style.borderRadius = '50%';
        centerPin.style.left = '50%';
        centerPin.style.top = '50%';
        centerPin.style.transform = 'translate(-50%, -50%)';
        centerPin.style.border = '1px solid rgba(0,255,255,0.5)';

        // 數值顯示 (可選)
        this.rpmValue = document.createElement('div');
        this.rpmValue.style.position = 'absolute';
        this.rpmValue.style.bottom = '20%';
        this.rpmValue.style.width = '100%';
        this.rpmValue.style.textAlign = 'center';
        this.rpmValue.style.color = '#ffffff';
        this.rpmValue.style.textShadow = '0 0 8px #00fffc';
        this.rpmValue.style.fontFamily = '"PixelifySans", "Segment7Standard", monospace';
        this.rpmValue.style.fontSize = '18px';
        this.rpmValue.style.textShadow = '0 0 5pxrgb(255, 255, 255)';
        this.rpmValue.textContent = '0000';

        // 單位標示
        const unitLabel = document.createElement('div');
        unitLabel.textContent = 'RPM';
        unitLabel.style.position = 'absolute';
        unitLabel.style.bottom = '10%';
        unitLabel.style.width = '100%';
        unitLabel.style.textAlign = 'center';
        unitLabel.style.color = 'rgba(0,255,255,0.7)';
        unitLabel.style.fontSize = '9px';
        unitLabel.style.fontFamily = '"PixelifySans", "Segment7Standard", monospace';

        // LED光點 (裝飾用)
        const leds = document.createElement('div');
        leds.style.position = 'absolute';
        leds.style.bottom = '-20px';
        leds.style.left = '50%';
        leds.style.transform = 'translateX(-50%)';
        leds.style.display = 'flex';
        leds.style.gap = '8px';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.style.width = '4px';
            dot.style.height = '4px';
            dot.style.borderRadius = '50%';
            dot.style.background = '#00fffc';
            dot.style.boxShadow = '0 0 3px #00fffc';
            dot.style.opacity = '0.6';
            dot.style.animation = `pulse ${0.6 + i*0.2}s infinite alternate`;
            leds.appendChild(dot);
        }

        // 紅線區標記 (可選)
        const redline = document.createElement('div');
        redline.style.position = 'absolute';
        redline.style.width = '100%';
        redline.style.height = '100%';
        redline.style.borderRadius = '50%';
        redline.style.background = 'conic-gradient(transparent 50%, rgba(255, 0, 0, 0.3) 100% 100%)';
        redline.style.pointerEvents = 'none';

        // 組裝元素
        gauge.appendChild(scale);
        gauge.appendChild(redline);
        gauge.appendChild(this.needle);
        gauge.appendChild(centerPin);
        gauge.appendChild(this.rpmValue);
        gauge.appendChild(unitLabel);
        frame.appendChild(gauge);
        this.rpmContainer.appendChild(frame);
        this.rpmContainer.appendChild(leds);
        document.body.appendChild(this.rpmContainer);

        // 初始隱藏
        this.hide();
    }

    update(currentSpeed) {
        // 模擬轉速 (根據速度計算，實際遊戲應從車輛系統獲取真實RPM)
        const rpm = Math.min(
            Math.floor((currentSpeed / 200) * this.maxRPM * 1.2), 
            this.maxRPM
        );
        
        // 更新指針角度 (-135deg 到 135deg 範圍)
        const angle = -135 + (rpm / this.maxRPM) * 270;
        this.needle.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        
        // 更新數值顯示
        this.rpmValue.textContent = String(rpm).padStart(4, '0');
        
        // 紅線區閃爍效果
        if (rpm > this.maxRPM * 0.9) {
            this.needle.style.animation = 'redlinePulse 0.3s infinite alternate';
        } else {
            this.needle.style.animation = 'none';
        }
    }

    show() {
        this.rpmContainer.style.display = 'block';
    }

    hide() {
        this.rpmContainer.style.display = 'none';
    }
}