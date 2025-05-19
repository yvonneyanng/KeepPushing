import * as THREE from "three";
import * as CANNON from 'cannon-es';
import { roadMesh, planeGeometry } from "./trackGeneration.js";
import { setupSky } from './skySceneSetup.js';
import { createMovingGround } from "./groundSetup.js";

export function setupScene() {

    // 建立物理世界
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0); // 重力往下
  

  const groundCANNONMaterial = new CANNON.Material();
  const groundShape = new CANNON.Box(new CANNON.Vec3(1000000, 0.1, 1000000));
  const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: groundShape,
    position: new CANNON.Vec3(0, 0, 0),
    material: groundCANNONMaterial,
  });
  world.addBody(groundBody);

  function createTrimesh(geometry) {
    const position = geometry.attributes.position;
    const indices = geometry.index ? geometry.index.array : null;

    const vertices = [];
    for (let i = 0; i < position.count; i++) {
      vertices.push(position.getX(i), position.getY(i), position.getZ(i));
    }

    const indicesArray = indices ? Array.from(indices) : [...Array(position.count).keys()];
    return new CANNON.Trimesh(vertices, indicesArray);
  }

  const roadMaterial = new CANNON.Material('road');
  const roadShape = createTrimesh(planeGeometry);
  const roadBody = new CANNON.Body({
    mass: 0,
    material: roadMaterial,
  });
  roadBody.addShape(roadShape);
  world.addBody(roadBody);

  // Add collision listener for car and ground box
  world.addEventListener('postStep', () => {
    if (window.car?.carBody) {
      world.contacts.forEach(contact => {
        if (
          (contact.bi === window.car.carBody && contact.bj === groundBody) ||
          (contact.bj === window.car.carBody && contact.bi === groundBody)
        ) {
          console.log("YES");
        }
      });
    }
  });

  world.addEventListener('postStep', () => {
    const carBody = window.car?.carBody;
    if (!carBody) return;

    let touchingRoad = false;
    world.contacts.forEach(contact => {
      if (
        (contact.bi === carBody && contact.bj === roadBody) ||
        (contact.bj === carBody && contact.bi === roadBody)
      ) {
        touchingRoad = true;
      }
    });

    if (touchingRoad) {
      console.log("CAR TOUCHING ROAD");
    }
  });

  // Create scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000); // Black background

  // Create camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // Initial camera position (will be overridden by car camera)
  camera.position.set(0, 3, 8);
  camera.lookAt(0, 0, 0);

  // Create renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // Add ambient light (slightly brighter)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  // Add directional light (headlights)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 10, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  scene.add(directionalLight);

  setupSky(scene, directionalLight);

  // Add spotlight to follow car
  const spotlight = new THREE.SpotLight(0xffffff, 1);
  spotlight.position.set(0, 10, 0);
  spotlight.angle = Math.PI / 4;
  spotlight.penumbra = 0.1;
  spotlight.decay = 2;
  spotlight.distance = 200;
  spotlight.castShadow = true;
  scene.add(spotlight);

  // Add the road to the scene
  scene.add(roadMesh);

  // // 建立紅色球體的視覺模型
  // const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  // const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  // const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
  // ballMesh.castShadow = true;
  // ballMesh.receiveShadow = true;
  // ballMesh.position.set(0, 2, 2);
  // scene.add(ballMesh);

  // // 建立紅色球體的物理剛體
  // const ballShape = new CANNON.Sphere(0.5);
  // const ballBody = new CANNON.Body({
  //   mass: 1,
  //   shape: ballShape,
  //   position: new CANNON.Vec3(0, 2, -2),
  // });
  // world.addBody(ballBody);

  // Create a dark ground plane
  const ground = createMovingGround(scene);

  // Handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 每幀同步球體位置與汽車位置
  renderer.setAnimationLoop(() => {
    world.step(1 / 60);

    // ballMesh.position.copy(ballBody.position);
    // ballMesh.quaternion.copy(ballBody.quaternion);

    // Sync car visual with physics body (if car loaded)
    if (window.car) {
      window.car.carWrapper.position.copy(window.car.carBody.position);
      window.car.carWrapper.quaternion.copy(window.car.carBody.quaternion);
    }

    renderer.render(scene, camera);
  });

  return { scene, camera, renderer, world, ground };
}
