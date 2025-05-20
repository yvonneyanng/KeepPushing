export class UICountdown {
  constructor(onFinish) {
    this.onFinish = onFinish;
    this.createCountdownOverlay();
    this.beep = new Audio("/sounds/CountdownSound.mp3");
    this.finalBeep = new Audio("/sounds/final_beep.mp3");
    this.isBeepLoaded = false

    this.beep.addEventListener('loadedmetadata', () => {
      this.isBeepLoaded = true
      console.log('✅ 音訊 metadata 載入完成');
    });
  }

  createCountdownOverlay() {
    this.countdownDiv = document.createElement("div");
    this.countdownDiv.id = "countdown";
    this.countdownDiv.style.position = "absolute";
    this.countdownDiv.style.top = "35%";
    this.countdownDiv.style.left = "50%";
    this.countdownDiv.style.transform = "translate(-50%, -50%)";
    this.countdownDiv.style.fontSize = "100px";
    this.countdownDiv.style.color = "#00fffc";
    this.countdownDiv.style.fontFamily =
      '"PixelifySans", "Segment7Standard", monospace';
    this.countdownDiv.style.textAlign = "center";
    this.countdownDiv.style.borderRadius = "14px";
    this.countdownDiv.style.textShadow = "0 0 8px #00fffc";
    this.countdownDiv.style.zIndex = "2000";
    this.countdownDiv.style.display = "none";
    document.body.appendChild(this.countdownDiv);
  }

  start(count = 3) {
    this.count = count;
    this.countdownDiv.style.display = "block";
    // this.countdownDiv.textContent = this.count;

    this.interval = setInterval(() => {
      if (this.isBeepLoaded) {
        if (this.count >= 0) {
          if (this.count == 0) {
            this.playFinalBeep();
          } else {
            this.playBeep();
          }
          
          this.countdownDiv.textContent = this.count;
          
        } else if (this.count == -1) {
          this.countdownDiv.textContent = "GO!";
          if (this.onFinish) this.onFinish();
        } else {
          this.hide();
          clearInterval(this.interval);
        }
      }
      this.count--;
    }, 1000);
  }

  playBeep() {
    this.beep.currentTime = 0.7; // Skip the first 0.5 seconds
    this.beep.play();
    setTimeout(() => {
      this.beep.pause()
    }, 600)
  }

  playFinalBeep() {
    // this.finalBeep.currentTime = 0.05; // Skip the first 0.5 seconds
    this.finalBeep.play();
    setTimeout(() => {
      this.finalBeep.pause()
    }, 600)
  }

  hide() {
    this.countdownDiv.style.display = "none";
  }
}
