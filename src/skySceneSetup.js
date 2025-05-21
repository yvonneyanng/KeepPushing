import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";

export function setupSky(scene, light) {
  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const sun = new THREE.Vector3();
  const sun2 = new THREE.Vector3();

  const uniforms = sky.material.uniforms;
  uniforms["turbidity"].value = 10;
  uniforms["rayleigh"].value = 0.5;
  uniforms["mieCoefficient"].value = 0.005;
  uniforms["mieDirectionalG"].value = 0.8;

  const elevation = 10;
  const azimuth = 180;
  const phi = THREE.MathUtils.degToRad(90 - elevation);
  const theta = THREE.MathUtils.degToRad(azimuth);

  const elevation2 = 170;
  const azimuth2 = 180;
  const phi2 = THREE.MathUtils.degToRad(90 - elevation2);
  const theta2 = THREE.MathUtils.degToRad(azimuth2);

  sun.setFromSphericalCoords(1, phi, theta);
  uniforms["sunPosition"].value.copy(sun);

  sun2.setFromSphericalCoords(1, phi2, theta2);
  uniforms["sunPosition"].value.copy(sun2);

  if (light) {
    
    light.position.copy(sun.clone().multiplyScalar(10000));
    const light2 = light.clone()
    scene.add(light2)
    light2.position.copy(sun2.clone().multiplyScalar(10000));
  }

  scene.background = new THREE.Color(0x162544); // Optional fallback

  return sun;
}
