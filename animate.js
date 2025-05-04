export function animateLoop(renderer, scene, camera) {
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate(); //????
}
