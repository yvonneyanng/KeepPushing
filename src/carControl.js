import * as THREE from "three";
import { roadWidth, roadLength, curve } from "./trackGeneration.js";

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class Car {
  constructor(scene) {
    // Create car body
    const bodyGeometry = new THREE.BoxGeometry(1, 0.5, 2);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000, // Red color
      emissive: 0x330000, // Slight red glow
    });
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.castShadow = true;

    // Create car cabin
    const cabinGeometry = new THREE.BoxGeometry(0.8, 0.4, 1);
    const cabinMaterial = new THREE.MeshPhongMaterial({
      color: 0x0000ff, // Blue color
      emissive: 0x000033, // Slight blue glow
    });
    this.cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    this.cabin.position.y = 0.45;
    this.cabin.position.z = -0.2;
    this.cabin.castShadow = true;

    // Create wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 16);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 }); // Dark gray
    this.wheels = [];

    // Wheel positions relative to car body
    const wheelPositions = [
      { x: -0.5, y: -0.25, z: 0.6 }, // Front left
      { x: 0.5, y: -0.25, z: 0.6 }, // Front right
      { x: -0.5, y: -0.25, z: -0.6 }, // Rear left
      { x: 0.5, y: -0.25, z: -0.6 }, // Rear right
    ];

    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.castShadow = true;
      this.wheels.push(wheel);
      this.body.add(wheel);
    });

    // Add cabin to body
    this.body.add(this.cabin);

    // Create car group
    this.car = new THREE.Group();
    this.car.add(this.body);
    scene.add(this.car);

    // Car movement properties
    this.t = 0; // Position along curve (0 to 1)
    this.speed = 0.00000; // Reduced speed for better control
    this.offset = new THREE.Vector3(); // Lateral offset from curve
    this.steeringSpeed = 0.1; // How fast the car can move left/right
    this.maxSteering = roadWidth / 2 - 1; // Keep car within road bounds
    this.isMoving = true; // Flag to control car movement

    // Create speed display
    this.createSpeedDisplay();

    // Set initial position
    this.updatePosition();
  }

  createSpeedDisplay() {
    // Create a div for the speed display
    this.speedDisplay = document.createElement("div");
    this.speedDisplay.style.position = "absolute";
    this.speedDisplay.style.top = "20px";
    this.speedDisplay.style.left = "20px";
    this.speedDisplay.style.color = "white";
    this.speedDisplay.style.fontSize = "24px";
    this.speedDisplay.style.fontFamily = "Arial";
    this.speedDisplay.style.textShadow = "2px 2px 4px rgba(0,0,0,0.5)";
    document.body.appendChild(this.speedDisplay);
  }

  updateSpeedDisplay() {
    // Calculate speed in km/h (assuming 60 FPS)
    const speedKmh = Math.round(this.speed * 60 * 3.6 * 1000);
    this.speedDisplay.textContent = `Speed: ${speedKmh} km/h`;
  }

  updatePosition() {
    if (!this.isMoving) return;

    // Get position and direction from curve
    const position = curve.getPointAt(this.t);
    const tangent = curve.getTangentAt(this.t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    // Apply lateral offset
    position.add(normal.multiplyScalar(this.offset.x));

    // Update car position and rotation
    this.car.position.copy(position);
    this.car.lookAt(position.clone().add(tangent));
  }

  update() {
    if (!this.isMoving) return;

    // Move along curve
    this.t += this.speed;

    // Check if reached finish
    if (this.t >= 1) {
      this.stop();
      return;
    }

    // Keep offset within road bounds
    this.offset.x = Math.max(
      -this.maxSteering,
      Math.min(this.maxSteering, this.offset.x)
    );

    // Update car position and rotation
    this.updatePosition();

    // Update speed display
    this.updateSpeedDisplay();

    // // Animate wheels
    // this.wheels.forEach((wheel) => {
    //   wheel.rotation.x += this.speed * 2000;
    // });
  }

  steer(direction) {
    if (!this.isMoving) return;
    // direction should be -1 (left) or 1 (right)
    this.offset.x += direction * this.steeringSpeed;
  }

  stop() {
    this.isMoving = false;
    this.speed = 0;
    this.updateSpeedDisplay();
  }
}

export function setupCamera(camera, car) {
  // Create a camera target that follows the car
  const cameraTarget = new THREE.Object3D();
  car.car.add(cameraTarget);

  // Position camera closer and higher for better visibility
  // Keep it more centered in the tube
  cameraTarget.position.set(0, 1.5, 6);

  // Update camera position to follow the car
  function updateCamera() {
    // Get the target position in world space
    const targetPosition = cameraTarget.getWorldPosition(new THREE.Vector3());

    // Get the current curve position and tangent
    const carPosition = car.car.position.clone();
    const t = car.t;
    const tangent = curve.getTangentAt(t);

    // Calculate the up vector based on the curve
    const up = new THREE.Vector3(0, 1, 0);

    // Create a matrix to orient the camera along the tube
    const matrix = new THREE.Matrix4();
    const lookAt = carPosition.clone().add(tangent);
    matrix.lookAt(carPosition, lookAt, up);

    // Apply smooth camera movement
    camera.position.lerp(targetPosition, 0.08);

    // Make camera look at car's position slightly ahead
    const lookAtPoint = car.car.position.clone();
    lookAtPoint.add(tangent.multiplyScalar(2)); // Look slightly ahead of the car
    camera.lookAt(lookAtPoint);

    // Apply the tube's orientation to the camera
    camera.up.copy(up);

    // Keep camera within tube bounds
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const cameraOffset = camera.position.clone().sub(carPosition);
    const lateralOffset = normal.dot(cameraOffset);

    // Limit lateral movement to stay within tube
    const maxLateralOffset = roadWidth * 0.4; // Keep camera within 40% of road width
    if (Math.abs(lateralOffset) > maxLateralOffset) {
      const correction = normal.multiplyScalar(
        lateralOffset - Math.sign(lateralOffset) * maxLateralOffset
      );
      camera.position.sub(correction);
    }
  }

  return updateCamera;
}
