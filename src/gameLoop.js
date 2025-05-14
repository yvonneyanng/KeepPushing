import { Car, setupCamera } from "./carControl.js";

export function initGame(scene, camera, renderer) {
  // Create car
  const car = new Car(scene);

  // Setup camera to follow car
  const updateCamera = setupCamera(camera, car);

  // Create finish message element
  const finishMessage = document.createElement("div");
  finishMessage.style.position = "absolute";
  finishMessage.style.top = "20px";
  finishMessage.style.right = "20px";
  finishMessage.style.color = "white";
  finishMessage.style.fontSize = "32px";
  finishMessage.style.fontFamily = "Arial";
  finishMessage.style.textShadow = "2px 2px 4px rgba(0,0,0,0.5)";
  finishMessage.style.display = "none";
  document.body.appendChild(finishMessage);

  // Handle keyboard input
  const keys = {
    ArrowLeft: false,
    ArrowRight: false,
  };

  window.addEventListener("keydown", (e) => {
    if (e.key in keys) {
      keys[e.key] = true;
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key in keys) {
      keys[e.key] = false;
      car.resetSteering();
    }
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Handle steering
    if (keys.ArrowLeft) car.steer(-1);
    if (keys.ArrowRight) car.steer(1);

    // Update car position
    car.update();

    // Check if car has stopped (reached finish)
    if (!car.isMoving && finishMessage.style.display === "none") {
      finishMessage.textContent = "FINISH!";
      finishMessage.style.display = "block";
    }

    // Update camera
    updateCamera();

    // Render scene
    renderer.render(scene, camera);
  }

  // Start animation loop
  animate();
}
