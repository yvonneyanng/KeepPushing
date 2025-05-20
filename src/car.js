import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
const textureLoader = new THREE.TextureLoader();
import { updateControls } from "./controls.js";
import { curve, roadWidth } from "./trackGeneration.js";

export function loadCarModel(scene, world) {
  return new Promise((resolve) => {
    const baseColorMap = textureLoader.load(
      "models/car/Detomasop72_Base_Color.png"
    );
    const normalMap = textureLoader.load(
      "models/car/Detomasop72_Normal_OpenGL.png"
    );
    const roughnessMap = textureLoader.load(
      "models/car/Detomasop72_Roughness.png"
    );
    const metalnessMap = textureLoader.load(
      "models/car/Detomasop72_Metallic.png"
    );

    const visualMaterial = new THREE.MeshStandardMaterial({
      map: baseColorMap,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      metalnessMap: metalnessMap,
      metalness: 1,
      roughness: 1,
    });

    const loader = new OBJLoader();
    loader.load("models/car/FullBody.obj", (object) => {
      const carMaterial = new CANNON.Material("car");

      object.traverse((child) => {
        if (child.isMesh) {
          child.material = visualMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      const carModel = object;
      carModel.scale.set(0.0015, 0.0015, 0.0015);
      const box = new THREE.Box3().setFromObject(carModel);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);
      carModel.position.y -= center.y - box.min.y;
      carModel.rotation.y = Math.PI;

      const carWrapper = new THREE.Object3D();
      carWrapper.add(carModel);
      scene.add(carWrapper);

      // Align carWrapper and chassisBody with the road's tangent and position at the start
      const startTangent = curve.getTangentAt(0);
      const angle = Math.atan2(startTangent.x, startTangent.z);
      const startPoint = curve.getPointAt(0.001);
      carWrapper.position.copy(startPoint);
      carWrapper.rotation.y = angle;

      const fudge = 1;
      const chassisShape = new CANNON.Box(
        new CANNON.Vec3(
          (size.x / 2) * fudge,
          (size.y / 2) * fudge,
          (size.z / 2) * fudge
        )
      );
      const chassisBody = new CANNON.Body({
        mass: 300,
        shape: chassisShape,
        position: new CANNON.Vec3(
          startPoint.x,
          (size.y / 2) * fudge + 0.2,
          startPoint.z
        ),
        material: carMaterial,
      });
      chassisBody.quaternion.setFromEuler(0, angle + Math.PI, 0);
      chassisBody.linearDamping = 0.02;
      chassisBody.angularDamping = 1;
      // vehicle.chassisBody.ccdSpeedThreshold = 1;
      // vehicle.chassisBody.ccdIterations = 10;

      const vehicle = new CANNON.RaycastVehicle({
        chassisBody: chassisBody,
        indexRightAxis: 0,
        indexUpAxis: 1,
        indexForwardAxis: 2,
      });

      const halfW = (size.x / 2) * fudge * 0.8;
      const halfL = (size.z / 2) * fudge * 0.8;
      const yWheel = -(size.y / 2) * fudge + 0.4;
      const wheelOptions = {
        radius: 1,
        directionLocal: new CANNON.Vec3(0, -1, 0),
        suspensionStiffness: 30,
        suspensionRestLength: 0.3,
        frictionSlip: 8,
        dampingRelaxation: 2.3,
        dampingCompression: 4.4,
        maxSuspensionForce: 100000,
        rollInfluence: 0.01,
        axleLocal: new CANNON.Vec3(-1, 0, 0),
        chassisConnectionPointLocal: new CANNON.Vec3(),
        maxSuspensionTravel: 0.3,
        customSlidingRotationalSpeed: -30,
        useCustomSlidingRotationalSpeed: true,
      };

      const wheelPositions = [
        new CANNON.Vec3(-halfW, yWheel, halfL),
        new CANNON.Vec3(halfW, yWheel, halfL),
        new CANNON.Vec3(-halfW, yWheel, -halfL),
        new CANNON.Vec3(halfW, yWheel, -halfL),
      ];

      wheelPositions.forEach((pos) => {
        wheelOptions.chassisConnectionPointLocal.copy(pos);
        vehicle.addWheel(wheelOptions);
      });

      vehicle.addToWorld(world);

      chassisBody.addEventListener("collide", (event) => {
        const otherBody = event.body;
        if (otherBody.material && otherBody.material.name === "wall") {
          const relativeX = otherBody.position.x - chassisBody.position.x;
          const forceDirection = relativeX > 0 ? -1 : 1;
          // const forceMagnitude = 1000;
          // const force = new CANNON.Vec3(forceDirection * forceMagnitude, 0, 1000);
          // chassisBody.applyForce(force, chassisBody.position);

          // Also move the car slightly to separate it from the wall
          const bounceOffset = new CANNON.Vec3(forceDirection * 0.03, 0, 0);
          chassisBody.position.vadd(bounceOffset, chassisBody.position);
        }
      });

      resolve({ carModel, carWrapper, carBody: chassisBody, vehicle });
    });
  });
}

export function updateCar(
  carBody,
  carWrapper,
  vehicle,
  camera,
  world,
  gridSize,
  cellSize,
  spawnedCells,
  scene,
  balls,
  groundMat,
  guiSettings
) {
  // if (!window.controls && camera && renderer) {
  //   window.controls = new OrbitControls(camera, renderer.domElement);
  //   window.controls.target.copy(carBody.position);
  //   window.controls.update();
  // }

  carWrapper.position.copy(carBody.position);
  carWrapper.quaternion.copy(carBody.quaternion);

  // if (window.debugBox) {
  //   debugBox.position.copy(carBody.position);
  //   debugBox.quaternion.copy(carBody.quaternion);
  // }

  // if (vehicle && window.wheelMeshes) {
  //   for (let i = 0; i < 4; i++) {
  //     const wheelTransform = vehicle.getWheelTransformWorld(i);
  //     window.wheelMeshes[i].position.set(
  //       wheelTransform.position.x,
  //       wheelTransform.position.y,
  //       wheelTransform.position.z
  //     );
  //     window.wheelMeshes[i].material.color.set(wheelTransform.position.z > 0 ? 0xff0000 : 0x00ff00);
  //   }
  // }

  // const carX = carBody.position.x;
  // const carZ = carBody.position.z;
  // const half = gridSize / 2;
  // const cells = gridSize / cellSize;

  // for (let i = 0; i < cells; i++) {
  //   for (let j = 0; j < cells; j++) {
  //     const centerX = i * cellSize - half + cellSize / 2;
  //     const centerZ = j * cellSize - half + cellSize / 2;
  //     const dist = Math.sqrt((centerX - carX) ** 2 + (centerZ - carZ) ** 2);
  //     const key = `${i}_${j}`;
  //     if (dist < 50 && !spawnedCells.has(key)) {
  //       spawnedCells.add(key);
  //       spawnBallAt(i, j);
  //     }
  //   }
  // }

  updateControls(carBody);
  const offset = new THREE.Vector3(0, 3, 8);
  offset.applyQuaternion(carWrapper.quaternion);
  const carPos = new THREE.Vector3(
    carBody.position.x,
    carBody.position.y,
    carBody.position.z
  );
  camera.lookAt(carPos);

  // camera.position.lerp(carPos, 0.08);
  camera.position.copy(carPos.add(offset));

  // if (groundMat && groundMat.uniforms.uTriggered.value) {
  //   groundMat.uniforms.uTime.value += 1 / 60;
  //   if (groundMat.uniforms.uTime.value >= 5.0) {
  //     groundMat.uniforms.uTriggered.value = false;
  //   }
  // }

  if (window.controls) {
    window.controls.target.copy(carBody.position);
    window.controls.update();
  }

  // 判斷車子是否偏離跑道
  const carPos2D = new THREE.Vector2(carBody.position.x, carBody.position.z);
  let closestDist = Infinity;

  for (let t = 0; t <= 1; t += 0.001) {
    const point = curve.getPointAt(t);
    const point2D = new THREE.Vector2(point.x, point.z);
    const dist = carPos2D.distanceTo(point2D);
    if (dist < closestDist) {
      closestDist = dist;
    }
  }

  const maxDistance = roadWidth / 2;
  if (closestDist > maxDistance) {
    if (vehicle.maxSpeedRate > 0.05) {
      vehicle.maxSpeedRate *= 0.98;
    }
  } else {
    vehicle.maxSpeedRate = 1;
  }
}
