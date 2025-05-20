import * as THREE from "three";
import * as CANNON from "cannon-es";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { curve, roadWidth } from "./trackGeneration.js";

export class Block1 {
  constructor(scene, world) {
    this.curve = curve;
    this.scene = scene;
    this.world = world;
    this.allBlocks = {}
    this.model = null;
    this.size = new THREE.Vector3();
    this.loaded = false;

    const loader = new FBXLoader();
    loader.load("models/block1/block_low.fbx", (fbx) => {
      const textureLoader = new THREE.TextureLoader();
      const material = new THREE.MeshStandardMaterial({
        map: textureLoader.load("models/block1/block_BaseColor.png"),
        normalMap: textureLoader.load("models/block1/block_Normal_OPENGL.png"),
        roughnessMap: textureLoader.load("models/block1/block_Roughness.png"),
        metalnessMap: textureLoader.load("models/block1/block_Metallic.png"),
        aoMap: textureLoader.load("models/block1/block_AO.png"),
        metalness: 1,
        roughness: 1,
      });

      fbx.traverse((child) => {
        if (child.isMesh) {
          child.material = material;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      fbx.scale.set(0.08, 0.08, 0.08); // Adjust scale as needed

      // Center the model geometry to fix offset between mesh and physics
      const box = new THREE.Box3().setFromObject(fbx);
      const center = new THREE.Vector3();
      box.getCenter(center);
      fbx.position.sub(center); // Offset mesh geometry so it's centered

      box.getSize(this.size);
      this.model = fbx;
      this.loaded = true;
    });
  }

  createBlock(t) {
    if (!this.loaded || !this.model) return;
    if (this.allBlocks[t]) return;

    const pointPosition = this.curve.getPointAt(t);
    const position = new THREE.Vector3(pointPosition.x - 10 + Math.random() * 20, 0, pointPosition.z - 10 + Math.random() * 20)

    const blockMesh = this.model.clone(true);
    
    this.scene.add(blockMesh);

    const halfExtents = new CANNON.Vec3(
      this.size.x / 2,
      (this.size.y * 1.5) / 2,
      this.size.z / 2
    );
    const shape = new CANNON.Box(halfExtents);
    const material = new CANNON.Material('block');
    const body = new CANNON.Body({
      mass: 0,
      shape,
      material,
      position: new CANNON.Vec3(position.x, position.y, position.z),
    });
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 1.5 + Math.PI * Math.random() * 0.8);

    this.world.addBody(body);
    // // Visualize Cannon Box shape
    // const wireframe = new THREE.Mesh(
    //   new THREE.BoxGeometry(
    //     halfExtents.x * 2,
    //     halfExtents.y * 2,
    //     halfExtents.z * 2
    //   ),
    //   new THREE.MeshBasicMaterial({
    //     wireframe: true,
    //     color: 0xffff00
    //   })
    // );
    // wireframe.position.copy(body.position);
    // wireframe.quaternion.copy(body.quaternion);
    // this.scene.add(wireframe);

    // // Update wireframe every frame
    // this.world.addEventListener('postStep', () => {
    //   wireframe.position.copy(body.position);
    //   wireframe.quaternion.copy(body.quaternion);
    // });

    this.allBlocks[t] = { mesh: blockMesh, body }

    this.world.addEventListener('postStep', () => {
      blockMesh.position.copy(body.position);
      blockMesh.quaternion.copy(body.quaternion);
    });
  }

  removeBlockAtT(t) {
    if (this.allBlocks[t]) {
      const { mesh, body } = this.allBlocks[t];
      this.scene.remove(mesh);
      this.world.removeBody(body);
      this.allBlocks[t] = null;
    }
  }
}