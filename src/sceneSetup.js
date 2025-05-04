import * as THREE from "three";

export function setupScene() {
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
  camera.position.z = 5;

  // Create renderer
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create the cube geometry
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  // Create McLaren orange material for the cube
  const material = new THREE.MeshBasicMaterial({
    color: 0xff5800, // McLaren orange color
    side: THREE.DoubleSide,
  });

  // Create the cube mesh
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Create edges geometry for the black border
  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 2,
  });
  const edgesMesh = new THREE.LineSegments(edges, lineMaterial);
  cube.add(edgesMesh);

  // Handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, cube };
}
