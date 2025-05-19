import * as THREE from "three";

const size = 1000
const relocateOffSet = size * 0.1
// export function createMovingGround(scene) {
//   const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
//   const groundMaterial = new THREE.MeshPhongMaterial({
//     color: 0x111111,
//     side: THREE.DoubleSide,
//   });
//   const ground = new THREE.Mesh(groundGeometry, groundMaterial);
//   ground.rotation.x = Math.PI / 2;
//   ground.position.y = -1;
//   scene.add(ground);
//   return ground;
// }
 
export function createMovingGround(scene) {
  const textureLoader = new THREE.TextureLoader();
  const grassTexture = textureLoader.load('/textures/grass01.png');
  grassTexture.wrapS = THREE.RepeatWrapping;
  grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(size / 10, size / 10);

  const groundGeometry = new THREE.PlaneGeometry(size, size);
  const groundMaterial = new THREE.MeshPhongMaterial({
    map: grassTexture,
    side: THREE.DoubleSide,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = Math.PI / 2;
  ground.position.y = -1;
  ground.size = size;
  ground.relocateOffSet = relocateOffSet
  scene.add(ground);
  return ground;
}