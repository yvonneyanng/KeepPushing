export class UIStart {
  constructor(gameStartCallback, logoUrl = "./assets/logo.png") {
    this.gameStartCallback = gameStartCallback;
    this.logoUrl = logoUrl; // 圖片路徑參數化
    this.createStartScreen();
    this.isGameStarted = false; // 新增遊戲狀態標記
    this.startCallback = null; // 回調函數引用
    this.startingAudioPath = "./sounds/StartingSound.mp3";
    this.startingAudio = null; // Reference to the audio object
  }

  createStartScreen() {
    // 創建主容器
    this.startContainer = document.createElement("div");
    this.startContainer.style.position = "absolute";
    this.startContainer.style.top = "0";
    this.startContainer.style.left = "0";
    this.startContainer.style.width = "100%";
    this.startContainer.style.height = "100%";
    this.startContainer.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
    this.startContainer.style.backdropFilter = "blur(8px)";
    this.startContainer.style.webkitBackdropFilter = "blur(8px)"; // Safari 支援
    this.startContainer.style.display = "flex";
    this.startContainer.style.flexDirection = "column";
    this.startContainer.style.justifyContent = "center";
    this.startContainer.style.alignItems = "center";
    this.startContainer.style.color = "white";
    this.startContainer.style.fontFamily = "Arial, sans-serif";
    this.startContainer.style.zIndex = "1000";
    const startButtonContainer = document.createElement("div");
    startButtonContainer.style.position = "relative"; // 讓LED能絕對定位
    startButtonContainer.style.display = "inline-block";
    startButtonContainer.style.marginTop = "-100px"; // 與其他元素間距

    // 替換文字標題為圖片標題
    const logoImg = document.createElement("img");
    logoImg.src = this.logoUrl;
    logoImg.style.maxWidth = "100%";
    logoImg.style.maxHeight = "250px"; // 根據需要調整
    logoImg.style.marginBottom = "100px";
    logoImg.alt = "Keep Pushing"; // 無障礙設計替代文字

    // 操作說明
    const controlsInfo = document.createElement("div");
    controlsInfo.style.marginBottom = "20px";
    controlsInfo.style.fontSize = "0.9em";
    controlsInfo.style.textAlign = "center";
    controlsInfo.innerHTML = `
      <p>GET READY TO RACING</p>
      <p>
        Use
        <span class="key-group">
          <span class="key-arrow">&#8592;</span>
          <span class="key-arrow">&#8593;</span>
          <span class="key-arrow">&#8595;</span>
          <span class="key-arrow">&#8594;</span>
        </span>
        or
        <span class="key-group">
          <span class="key-wasd">W</span>
          <span class="key-wasd">A</span>
          <span class="key-wasd">S</span>
          <span class="key-wasd">D</span>
        </span>
        to Control Your Car<br><br>
      </p>
      <p>Avoid Obstacles  —  Every crash adds a time penalty!!</p>
    `;
    // Add styles for key arrows and WASD
    const style = document.createElement("style");
    style.textContent = `
      .key-group {
        display: inline-flex;
        gap: 6px;
        vertical-align: middle;
      }
      .key-arrow, .key-wasd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        min-height: 28px;
        padding: 2px 8px;
        margin: 0 2px;
        background: linear-gradient(145deg, rgba(30,30,30,0.9) 0%, rgba(60,60,60,0.9) 100%);
        border-radius: 8px;
        border: 1px solid rgba(100,255,255,0.2);
        box-shadow: inset 0 0 15px rgba(0,255,255,0.3),
    0 0 10px rgba(0,255,255,0.2);
        color: #00fffc;
        font-family: 'PixelifySans', 'Arial Narrow', Arial, sans-serif;
        font-size: 1.1em;
        text-align: center;
        text-shadow: 0 0 8px #00fffc;
        user-select: none;
      }
      .key-arrow {
        font-size: 1.2em;
        font-weight: bold;
      }
      .key-wasd {
        font-size: 1.1em;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);

    // 金屬外框 (與計時器相同)
    const buttonFrame = document.createElement("div");
    buttonFrame.style.display = "inline-block";
    buttonFrame.style.padding = "0px";
    buttonFrame.style.background =
      "linear-gradient(135deg, #6d6d6d 0%, #2b2b2b 50%, #6d6d6d 100%)";
    buttonFrame.style.borderRadius = "18px";
    buttonFrame.style.boxShadow = `
    0 0 8px rgba(0,0,0,0.6),
    inset 0 2px 2px rgba(255,255,255,0.1),
    inset 0 -2px 2px rgba(0,0,0,0.5)
`;

    // 玻璃面板按鈕 (與計時器相同材質)
    const startButton = document.createElement("button");
    startButton.textContent = "GAME START";
    startButton.style.display = "inline-block";
    startButton.style.padding = "10px 20px";
    startButton.style.minWidth = "200px";
    startButton.style.background =
      "linear-gradient(145deg, rgba(30,30,30,0.9) 0%, rgba(60,60,60,0.9) 100%)";
    startButton.style.color = "#f0f0f0"; // 青色文字
    startButton.style.fontFamily = '"PixelifySans", "Arial Narrow", sans-serif';
    startButton.style.fontSize = "22px";
    startButton.style.borderRadius = "14px";
    startButton.style.textShadow = "0 0 8px #00fffc";
    startButton.style.border = "1px solid rgba(100,255,255,0.2)";
    startButton.style.boxShadow = `
    inset 0 0 15px rgba(0,255,255,0.3),
    0 0 10px rgba(0,255,255,0.2)
`;
    startButton.style.cursor = "pointer";
    startButton.style.transition = "all 0.3s";

    // 滑鼠互動效果 (增強質感)
    startButton.addEventListener("mouseover", () => {
      startButton.style.boxShadow = `
        inset 0 0 20px rgba(0,255,255,0.5),
        0 0 15px rgba(0,255,255,0.4)
    `;
      startButton.style.transform = "scale(1.02)";
      startButton.style.color = "#ffffff";
    });

    startButton.addEventListener("mouseout", () => {
      startButton.style.boxShadow = `
        inset 0 0 15px rgba(0,255,255,0.3),
        0 0 10px rgba(0,255,255,0.2)
    `;
      startButton.style.transform = "scale(1)";
      startButton.style.color = "#00fffc";
    });

    // LED光點 (與計時器相同樣式)
    const buttonLeds = document.createElement("div");
    buttonLeds.style.position = "absolute";
    buttonLeds.style.bottom = "-280px";
    buttonLeds.style.left = "50%";
    buttonLeds.style.transform = "translateX(-50%)";
    buttonLeds.style.display = "flex";
    buttonLeds.style.gap = "12px";

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.style.width = "8px";
      dot.style.height = "8px";
      dot.style.borderRadius = "50%";
      dot.style.background = "#00fffc";
      dot.style.boxShadow = "0 0 6px #00fffc";
      dot.style.opacity = "0.8";
      dot.style.animation = `pulse ${0.8 + i * 0.2}s infinite alternate`;
      buttonLeds.appendChild(dot);
    }

    // 點擊事件保持不變
    startButton.addEventListener("click", () => {
      this.hide();
      if (this.gameStartCallback) {
        this.gameStartCallback();
      }
    });

    // 組裝按鈕
    buttonFrame.appendChild(startButton);
    startButtonContainer.appendChild(buttonFrame);
    startButtonContainer.appendChild(buttonLeds);
    this.startContainer.appendChild(startButtonContainer);

    // 將元素添加到容器
    this.startContainer.appendChild(logoImg);
    this.startContainer.appendChild(controlsInfo);
    this.startContainer.appendChild(startButton);

    // 添加到body
    document.body.appendChild(this.startContainer);
  }

  hide() {
    if (this.startContainer) {
      this.startContainer.style.display = "none";
    }
    // Stop and reset the audio if it's playing
    if (this.startingAudio) {
      this.startingAudio.pause();
      this.startingAudio.currentTime = 0;
    }
  }

  show() {
    if (this.startContainer) {
      this.startContainer.style.display = "flex";
      this.playStartingAudio();
    }
  }

  remove() {
    if (this.startContainer && this.startContainer.parentNode) {
      this.startContainer.parentNode.removeChild(this.startContainer);
    }
  }

  playStartingAudio() {
    if (!this.startingAudio) {
      this.startingAudio = new Audio(this.startingAudioPath);
    }
    this.startingAudio.currentTime = 0;
    this.startingAudio.play();
  }
}
