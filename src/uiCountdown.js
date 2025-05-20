export class UICountdown {
  constructor(onFinish) {
    this.onFinish = onFinish;
    this.createCountdownOverlay();
    this.beepAudioPath = "/sounds/CountdownSound.mp3";
  }

  createCountdownOverlay() {
    this.countdownDiv = document.createElement("div");
    this.countdownDiv.id = "countdown";
    this.countdownDiv.style.position = "absolute";
    this.countdownDiv.style.top = "30%";
    this.countdownDiv.style.left = "50%";
    this.countdownDiv.style.transform = "translate(-50%, -50%)";
    this.countdownDiv.style.fontSize = "80px";
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
    this.countdownDiv.textContent = this.count;
    this.playBeep();
    this.interval = setInterval(() => {
      this.count--;
      if (this.count > 0) {
        this.countdownDiv.textContent = this.count;
      } else if (this.count === 0) {
        this.countdownDiv.textContent = "GO!";
      } else {
        this.hide();
        clearInterval(this.interval);
        if (this.onFinish) this.onFinish();
      }
    }, 1000);
  }

  playBeep() {
    const beep = new Audio(this.beepAudioPath);
    beep.currentTime = 2.5; // Skip the first 0.5 seconds
    beep.play();
  }

  hide() {
    this.countdownDiv.style.display = "none";
  }
}
