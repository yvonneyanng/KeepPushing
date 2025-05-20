import * as CANNON from "cannon-es";
import * as THREE from "three";

const getVehicle = () => window.vehicle;

let groundMaterial, ballMaterial;
let carMaterial;

export let forceArrowHelper = null;

let moveForward = false;
let moveBackward = false;
let turnLeft = false;
let turnRight = false;
let brake = false;

document.addEventListener("keydown", (e) => {
  if (!window.isGamePlaying || window.isGameFinished) return;
  if (e.code === "KeyW") moveForward = true;
  if (e.code === "KeyS") moveBackward = true;
  if (e.code === "KeyA") turnLeft = true;
  if (e.code === "KeyD") turnRight = true;
  if (e.code === "ArrowUp") moveForward = true;
  if (e.code === "ArrowDown") moveBackward = true;
  if (e.code === "ArrowLeft") turnLeft = true;
  if (e.code === "ArrowRight") turnRight = true;
  if (e.code === "Space") brake = true;
});
document.addEventListener("keyup", (e) => {
  if (!window.isGamePlaying || window.isGameFinished) return;
  if (e.code === "KeyW") moveForward = false;
  if (e.code === "KeyS") moveBackward = false;
  if (e.code === "KeyA") turnLeft = false;
  if (e.code === "KeyD") turnRight = false;
  if (e.code === "ArrowUp") moveForward = false;
  if (e.code === "ArrowDown") moveBackward = false;
  if (e.code === "ArrowLeft") turnLeft = false;
  if (e.code === "ArrowRight") turnRight = false;
  if (e.code === "Space") brake = false;
});

export function updateControls() {
  const vehicle = getVehicle();
  if (!vehicle) return;

  // 控制參數
  const engineForce = 1000;
  const brakeForce = 100; // 降低煞車力道
  const maxSteer = 0.15; // radians
  const maxSpeed = 100; // 自訂，例如 20 公尺/秒

  const velocity = vehicle.chassisBody.velocity;
  const speed = velocity.length();

  const maxV = maxSpeed * vehicle.maxSpeedRate;

  if (speed > maxV) {
    // 限速：將速度方向保留，但長度縮成 maxSpeed
    velocity.scale(maxV / speed, velocity);
  } else {
    // W/S 前進/後退
    if (moveForward) {
      // vehicle.applyEngineForce(engineForce, 0);
      // vehicle.applyEngineForce(engineForce, 1);
      vehicle.applyEngineForce(engineForce, 2);
      vehicle.applyEngineForce(engineForce, 3);
    } else if (moveBackward) {
      // vehicle.setBrake(brakeForce, 2);
      // vehicle.setBrake(brakeForce, 3);
      vehicle.applyEngineForce(-engineForce, 0);
      vehicle.applyEngineForce(-engineForce, 1);
    } else {
      vehicle.applyEngineForce(0, 0);
      vehicle.applyEngineForce(0, 1);
      vehicle.applyEngineForce(0, 2);
      vehicle.applyEngineForce(0, 3);
    }
  }

  // Space 煞車
  if (brake) {
    vehicle.setBrake(brakeForce, 0);
    vehicle.setBrake(brakeForce, 1);
    vehicle.setBrake(brakeForce, 2);
    vehicle.setBrake(brakeForce, 3);
  } else {
    vehicle.setBrake(0, 0);
    vehicle.setBrake(0, 1);
    vehicle.setBrake(0, 2);
    vehicle.setBrake(0, 3);
  }

  // 如果速度極小，自動解除煞車，避免鎖死
  if (vehicle.chassisBody.velocity.length() < 0.02) {
    vehicle.setBrake(0, 2);
    vehicle.setBrake(0, 3);
  }

  // A/D 轉向（前輪）
  if (turnLeft) {
    vehicle.setSteeringValue(-maxSteer, 0);
    vehicle.setSteeringValue(-maxSteer, 1);
  } else if (turnRight) {
    vehicle.setSteeringValue(maxSteer, 0);
    vehicle.setSteeringValue(maxSteer, 1);
  } else {
    vehicle.setSteeringValue(0, 0);
    vehicle.setSteeringValue(0, 1);
  }

  // 施力箭頭視覺(可選)
  if (forceArrowHelper) {
    forceArrowHelper.visible = moveForward || moveBackward;
  }
}
