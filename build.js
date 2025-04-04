import * as THREE from "https://unpkg.com/three@0.150.1/build/three.module.js";

export function buildWorld(scene) {
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  );
  cube.position.set(0, 0.5, 0);
  scene.add(cube);
}
