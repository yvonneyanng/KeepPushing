import { Car, setupCamera } from "./carControl.js";

import { loadCarModel, updateCar } from "./car.js";
import { UIFinish } from "./uiFinish.js";
import { curve } from "./trackGeneration.js";

export function initGame(scene, camera, renderer, world, ground) {
  // Create car
  // const car = new Car(scene);
  let carModel, carBody, carWrapper, carShaderMaterial;

  loadCarModel(scene, world).then(
    ({
      carModel: loadedCarModel,
      carWrapper: loadedCarWrapper,
      carBody: loadedCarBody,
      vehicle,
    }) => {
      carModel = loadedCarModel;
      carWrapper = loadedCarWrapper;
      carBody = loadedCarBody;
      // For controls.js to access the vehicle
      window.vehicle = vehicle;
      // Optionally, set up wheelMeshes or other car-specific logic here
    }
  );

  // // Setup camera to follow car
  // const updateCamera = setupCamera(camera, car);

  // // Create finish message element
  // const finishMessage = document.createElement("div");
  // finishMessage.style.position = "absolute";
  // finishMessage.style.top = "20px";
  // finishMessage.style.right = "20px";
  // finishMessage.style.color = "white";
  // finishMessage.style.fontSize = "32px";
  // finishMessage.style.fontFamily = "Arial";
  // finishMessage.style.textShadow = "2px 2px 4px rgba(0,0,0,0.5)";
  // finishMessage.style.display = "none";
  // document.body.appendChild(finishMessage);

  // // Handle keyboard input
  // const keys = {
  //   ArrowLeft: false,
  //   ArrowRight: false,
  // };

  // window.addEventListener("keydown", (e) => {
  //   if (e.key in keys) {
  //     keys[e.key] = true;
  //   }
  // });

  // window.addEventListener("keyup", (e) => {
  //   if (e.key in keys) {
  //     keys[e.key] = false;
  //     car.resetSteering();
  //   }
  // });

  window.uiFinish = new UIFinish();
  let finished = false;
  window.isGameFinished = false; // Reset finish flag at game start
  function animate() {
    requestAnimationFrame(animate);

    if (carBody && carWrapper) {
      updateCar(carBody, carWrapper, window.vehicle, camera, world, renderer);

      const carX = carBody.position.x;
      const carZ = carBody.position.z;
      const groundX = ground.position.x;
      const groundZ = ground.position.z;

      const Limit = ground.size / 2 - ground.relocateOffSet;
      if (
        Math.abs(carX - groundX) >= Limit ||
        Math.abs(carZ - groundZ) >= Limit
      ) {
        ground.position.set(carX, -0.1, carZ);
      }

      if (window.uiProgress && carBody) {
        const speed = carBody.velocity.length();
        const speedKmh = speed * 3.6;
        window.uiProgress.update(speedKmh);
      }
      if (
        !finished &&
        window.vehicle &&
        window.vehicle.chassisBody &&
        carWrapper.position
      ) {
        const finishPoint = curve.getPointAt(1);
        const carPos = carWrapper.position;
        const finishDist = carPos.distanceTo(finishPoint);
        if (finishDist < 10) {
          finished = true;
          window.isGameFinished = true; // Set finish flag
          if (window.gameTimer) window.gameTimer.stop();
          if (window.vehicle) {
            for (let i = 0; i < window.vehicle.wheelInfos.length; i++) {
              window.vehicle.setBrake(1e6, i);
            }
            window.vehicle.applyEngineForce(0, 0);
            window.vehicle.applyEngineForce(0, 1);
            window.vehicle.applyEngineForce(0, 2);
            window.vehicle.applyEngineForce(0, 3);
          }
          if (carBody) {
            carBody.velocity.set(0, 0, 0);
            carBody.angularVelocity.set(0, 0, 0);
          }
          const timeString = window.gameTimer
            ? window.gameTimer.formatTime(window.gameTimer.getCurrentTime())
            : "--:--:--";
          if (window.uiFinish) window.uiFinish.show(timeString);
        }
      }
    }
    // // Handle steering
    // if (keys.ArrowLeft) car.steer(-1);
    // if (keys.ArrowRight) car.steer(1);

    // // Update car position
    // car.update();

    // // Check if car has stopped (reached finish)
    // if (!car.isMoving && finishMessage.style.display === "none") {
    //   finishMessage.textContent = "FINISH!";
    //   finishMessage.style.display = "block";
    // }

    // // Update camera
    // updateCamera();

    // Render scene
    renderer.render(scene, camera);
  }

  // Start animation loop
  animate();
}
