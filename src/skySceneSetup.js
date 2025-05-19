import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

export function setupSky(scene, light) {
  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const sun = new THREE.Vector3();

  const uniforms = sky.material.uniforms;
  uniforms['turbidity'].value = 10;
  uniforms['rayleigh'].value = 2;
  uniforms['mieCoefficient'].value = 0.005;
  uniforms['mieDirectionalG'].value = 0.8;

  const elevation = 10;
  const azimuth = 180;
  const phi = THREE.MathUtils.degToRad(90 - elevation);
  const theta = THREE.MathUtils.degToRad(azimuth);

  sun.setFromSphericalCoords(1, phi, theta);
  uniforms['sunPosition'].value.copy(sun);

  if (light) {
    light.position.copy(sun.clone().multiplyScalar(10000));
  }

  scene.background = new THREE.Color(0xbfd1e5); // Optional fallback

  return sun;
}
