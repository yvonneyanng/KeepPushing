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
    this.finishContainer.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
    this.finishContainer.style.backdropFilter = "blur(8px)";
    this.finishContainer.style.webkitBackdropFilter = "blur(8px)"; // Safari 支援
    this.finishContainer.style.display = "flex";
    this.finishContainer.style.flexDirection = "column";
    this.finishContainer.style.justifyContent = "center";
    this.finishContainer.style.alignItems = "center";
    this.finishContainer.style.zIndex = "9999";
    this.finishContainer.style.visibility = "hidden";

    // Title
    const title = document.createElement("div");
    title.textContent = "FINISH!!";
    title.style.fontSize = "80px";
    title.style.color = "#00fffc";
    title.style.fontFamily = "PixelifySans, Arial, sans-serif";
    title.style.textShadow = "0 0 16px #00fffc, 0 0 32px #000";
    title.style.marginBottom = "180px";
    this.finishContainer.appendChild(title);

    // Time display
    this.timeDisplay = document.createElement("div");
    this.timeDisplay.style.fontSize = "60px";
    this.timeDisplay.style.color = "#ffffff";
    this.timeDisplay.style.fontFamily = "PixelifySans, Arial, sans-serif";
    this.timeDisplay.style.marginBottom = "200px";
    this.finishContainer.appendChild(this.timeDisplay);

    // Restart button
    const restartButton = document.createElement("button");
    restartButton.textContent = "RESTART";
    restartButton.style.fontSize = "22px";
    restartButton.style.padding = "10px 20px";
    restartButton.style.minWidth = "200px";
    restartButton.style.borderRadius = "14px";
    restartButton.style.border = "1px solid rgba(100,255,255,0.2)";
    restartButton.style.background =
      "linear-gradient(145deg, rgba(30,30,30,0.9) 0%, rgba(60,60,60,0.9) 100%)";
    restartButton.style.color = "#ffffff";
    restartButton.style.fontFamily = "PixelifySans, Arial, sans-serif";
    restartButton.style.cursor = "pointer";
    restartButton.style.textShadow = "0 0 8px #00fffc";
    restartButton.style.boxShadow = `
    inset 0 0 15px rgba(0,255,255,0.3),
    0 0 10px rgba(0,255,255,0.2)
`;
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
