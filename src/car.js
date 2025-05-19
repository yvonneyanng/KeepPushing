import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { updateControls } from '../controls';
import { wallCannonMaterial } from './trackGeneration.js';

export function loadCarModel(scene, world) {
  return new Promise((resolve) => {
    const loader = new GLTFLoader();
    loader.load('models/car.glb', (gltf) => {
      const carMaterial = new CANNON.Material('car');
      const carModel = gltf.scene;
      // carModel.scale.set(0.2, 0.2, 0.2)
      const box = new THREE.Box3().setFromObject(carModel);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);
      carModel.position.y -= (center.y - box.min.y);
      carModel.rotation.y = Math.PI;

      const carWrapper = new THREE.Object3D();
      carWrapper.add(carModel);
      scene.add(carWrapper);

      const fudge = 1;
      const chassisShape = new CANNON.Box(new CANNON.Vec3(
        (size.x / 2) * fudge,
        (size.y / 2) * fudge,
        (size.z / 2) * fudge
      ));
      const chassisBody = new CANNON.Body({
        mass: 600,
        shape: chassisShape,
        position: new CANNON.Vec3(0, (size.y / 2) * fudge + 0.2, 0),
        material: carMaterial,
      });
      chassisBody.linearDamping = 0.02;
      chassisBody.angularDamping = 0.5;
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
        useCustomSlidingRotationalSpeed: true
      };

      const wheelPositions = [
        new CANNON.Vec3(-halfW, yWheel,  halfL),
        new CANNON.Vec3( halfW, yWheel,  halfL),
        new CANNON.Vec3(-halfW, yWheel, -halfL),
        new CANNON.Vec3( halfW, yWheel, -halfL),
      ];

      wheelPositions.forEach(pos => {
        wheelOptions.chassisConnectionPointLocal.copy(pos);
        vehicle.addWheel(wheelOptions);
      });

      vehicle.addToWorld(world);

      const wallContact = new CANNON.ContactMaterial(
        carMaterial,
        wallCannonMaterial,
        {
          friction: 0,
          restitution: 1
        }
      );
      world.addContactMaterial(wallContact);

      chassisBody.addEventListener('collide', (event) => {
        console.log("COLLIDE!!!");
        const otherBody = event.body;
        if (otherBody.material && otherBody.material.name === 'wall') {
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

export function updateCar(carBody, carWrapper, vehicle, camera, wallBodies, world, gridSize, cellSize, spawnedCells, scene, balls, groundMat, guiSettings) {
  carWrapper.position.copy(carBody.position);
  carWrapper.quaternion.copy(carBody.quaternion);

  wallBodies.forEach(wallBody => {
    const x = (wallBody.position.x - carWrapper.position.x)
    const z = (wallBody.position.z - carWrapper.position.z)
    const distance = Math.sqrt(x**2 + z**2)
    if (distance < 20) {
      world.addBody(wallBody)
    }
  })
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
  const offset = new THREE.Vector3(0, 3, 10);
  offset.applyQuaternion(carWrapper.quaternion);
  const carPos = new THREE.Vector3(carBody.position.x, carBody.position.y, carBody.position.z);
  camera.lookAt(carPos);

  // camera.position.lerp(carPos, 0.08);
  camera.position.copy(carPos.add(offset));

  // if (groundMat && groundMat.uniforms.uTriggered.value) {
  //   groundMat.uniforms.uTime.value += 1 / 60;
  //   if (groundMat.uniforms.uTime.value >= 5.0) {
  //     groundMat.uniforms.uTriggered.value = false;
  //   }
  // }
}
