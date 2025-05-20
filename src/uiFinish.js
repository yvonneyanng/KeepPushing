export class UIFinish {
  constructor() {
    this.createFinishUI();
  }

  createFinishUI() {
    // Main overlay container
    this.finishContainer = document.createElement("div");
    this.finishContainer.style.position = "fixed";
    this.finishContainer.style.top = "0";
    this.finishContainer.style.left = "0";
    this.finishContainer.style.width = "100vw";
    this.finishContainer.style.height = "100vh";
    this.finishContainer.style.background = "rgba(0,0,0,0.7)";
    this.finishContainer.style.display = "flex";
    this.finishContainer.style.flexDirection = "column";
    this.finishContainer.style.justifyContent = "center";
    this.finishContainer.style.alignItems = "center";
    this.finishContainer.style.zIndex = "9999";
    this.finishContainer.style.visibility = "hidden";

    // Title
    const title = document.createElement("div");
    title.textContent = "FINISH!";
    title.style.fontSize = "48px";
    title.style.color = "#00fffc";
    title.style.fontFamily = "PixelifySans, Arial, sans-serif";
    title.style.textShadow = "0 0 16px #00fffc, 0 0 32px #000";
    title.style.marginBottom = "32px";
    this.finishContainer.appendChild(title);

    // Time display
    this.timeDisplay = document.createElement("div");
    this.timeDisplay.style.fontSize = "32px";
    this.timeDisplay.style.color = "#fff";
    this.timeDisplay.style.fontFamily = "PixelifySans, Arial, sans-serif";
    this.timeDisplay.style.marginBottom = "32px";
    this.finishContainer.appendChild(this.timeDisplay);

    // Restart button
    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart";
    restartButton.style.fontSize = "24px";
    restartButton.style.padding = "12px 36px";
    restartButton.style.borderRadius = "12px";
    restartButton.style.border = "none";
    restartButton.style.background =
      "linear-gradient(135deg, #00fffc 0%, #0066ff 100%)";
    restartButton.style.color = "#222";
    restartButton.style.fontFamily = "PixelifySans, Arial, sans-serif";
    restartButton.style.cursor = "pointer";
    restartButton.style.boxShadow = "0 0 12px #00fffc, 0 2px 8px #000";
    restartButton.addEventListener("click", () => {
      window.location.reload();
    });
    this.finishContainer.appendChild(restartButton);

    document.body.appendChild(this.finishContainer);
  }

  show(timeString) {
    this.timeDisplay.textContent = `Time: ${timeString}`;
    this.finishContainer.style.visibility = "visible";
  }

  hide() {
    this.finishContainer.style.visibility = "hidden";
  }
}
