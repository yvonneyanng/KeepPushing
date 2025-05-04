import { setupScene } from "./src/sceneSetup.js";

const { scene, camera, renderer, cube } = setupScene();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the cube
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();
