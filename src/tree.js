import * as THREE from "three";
import * as CANNON from "cannon-es";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { curve, roadWidth } from "./trackGeneration.js";

export class Tree {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.size = 20;
    this.allTrees = {};
    this.treeModel = [];
    this.loaded = [];
    this.makingTreeDistance = 200;
    this.makingCANNONDistance = 20;
    this.removingCANNONDistance = 25;
    this.removingTreeDistance = 200;

    window.allTrees = this.allTrees
    this.loadTree(1);
    this.loadTree(2);
  }

  loadTree (number) {
    const directoryName = `tree${number}`
    const loader = new FBXLoader();
    loader.load(`models/${directoryName}/tree.fbx`, (fbx) => {
      const textureLoader = new THREE.TextureLoader();
      const trunkMaterial = new THREE.MeshStandardMaterial({
        map: textureLoader.load(`models/${directoryName}/treeLimbDiffuse.png`),
      });
      const leafMap = textureLoader.load(`models/${directoryName}/treeLeaf.png`);
      const leafMaterial = new THREE.MeshStandardMaterial({
        map: leafMap,
        transparent: true,
        alphaTest: 0.5,
      });
      
      // //for getting names
      // window.treeFBX = fbx


      fbx.traverse((child) => {
        if (child.isMesh) {
          const name = child.name.toLowerCase();
          const matName = child.material?.name?.toLowerCase() || "";
          if (
            name.includes("leaf") ||
            name.includes("leaves") ||
            name.includes("Leaf") ||
            matName.includes("leaf") ||
            name.includes("leaves001") ||
            child.parent?.name.toLowerCase().includes("twigs")
          ) {
            child.material = leafMaterial;
          } else {
            child.material = trunkMaterial;
          }
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      fbx.scale.set(0.02, 0.02, 0.02);
      this.treeModel[number - 1] = fbx;
      this.loaded[number - 1] = true;
    });
  }

  _gridKey(x, z) {
    const gridX = Math.floor(x / this.size) * this.size + (this.size / 2);
    const gridZ = Math.floor(z / this.size) * this.size + (this.size / 2);
    return `${gridX}${gridZ}`;
  }

  createTree(x, z) {
    const treeNumber = Math.floor(Math.random() * 2)
    if (!this.loaded[treeNumber-1] || !this.treeModel[treeNumber-1]) return;
    const key = this._gridKey(x, z);
    if (this.allTrees[key]) return;

    const gridX = Math.floor(x / this.size) * this.size;
    const gridZ = Math.floor(z / this.size) * this.size;
    const offsetX = Math.random() * this.size;
    const offsetZ = Math.random() * this.size;
    const rx = gridX + offsetX;
    const rz = gridZ + offsetZ;

    // Avoid placing trees too close to the road
    const treePos = new THREE.Vector3(rx, 0, rz);
    let tooClose = false;
    for (let t = 0; t <= 1; t += 0.001) {
      const p = curve.getPointAt(t);
      if (p.distanceTo(treePos) < roadWidth + 5) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) return;

    const tree = this.treeModel[treeNumber - 1].clone(true);
    tree.scale.y = tree.scale.y * (0.5 + Math.random())
    tree.rotation.y = Math.PI * 2 * Math.random()
    tree.position.set(rx, 0, rz);
    this.scene.add(tree);

    this.allTrees[key] = { mesh: tree };
  }

  addTreeCANNON (x, z) {
    const key = this._gridKey(x, z);
    if (this.allTrees[key]?.body || !this.allTrees[key]?.mesh) return;

    const tree = this.allTrees[key].mesh
    // Build bounding box and Cannon body
    const radius = 0.5;
    const height = 30;
    const rx = tree.position.x;
    const rz = tree.position.z;
    const shape = new CANNON.Cylinder(radius, radius, height, 8);
    const body = new CANNON.Body({
      mass: 0,
      shape,
      material: new CANNON.Material('tree'),
      position: new CANNON.Vec3(rx, -1, rz),
    });
    this.world.addBody(body);

    // Debug wireframe for tree's physics body
    // const wireframe = new THREE.Mesh(
    //   new THREE.CylinderGeometry(radius, radius, height, 8),
    //   new THREE.MeshBasicMaterial({
    //     wireframe: true,
    //     color: 0x00ff00
    //   })
    // );
    // this.scene.add(wireframe);

    // Sync mesh and wireframe to body each step
    this.world.addEventListener('postStep', () => {
      tree.position.copy(body.position);
      tree.quaternion.copy(body.quaternion);
      // wireframe.position.copy(body.position);
      // wireframe.quaternion.copy(body.quaternion);
    });

    this.allTrees[key].body = body;
  }



  removeTree(x, z) {
    const key = this._gridKey(x, z);
    const record = this.allTrees[key];
    if (record) {
      console.log("RemoveTREE!")
      this.scene.remove(record.mesh);
      if (record.body) this.world.removeBody(record.body);
      delete this.allTrees[key];
    }
  }

  removeTreeCANNON(x, z) {
    const key = this._gridKey(x, z);
    const record = this.allTrees[key];
    if (record && record.body) {
      console.log("Remove CANNON~~~~")
      this.world.removeBody(record.body);
    }
  }

  checkAndCreate(position) {
    if (!this.loaded[0] || !this.loaded[1]) return;
    const px = position.x;
    const pz = position.z;
    const gridRadius = Math.ceil(this.makingTreeDistance / this.size);

    for (let dx = -gridRadius; dx <= gridRadius; dx++) {
      for (let dz = -gridRadius; dz <= gridRadius; dz++) {
        const gx = Math.floor(px / this.size) + dx;
        const gz = Math.floor(pz / this.size) + dz;
        const cx = gx * this.size + (this.size / 2);
        const cz = gz * this.size + (this.size / 2);
        const dist = Math.hypot(px - cx, pz - cz);
        if (dist <= this.makingTreeDistance) {
          this.createTree(cx, cz);
          if (dist <= this.makingCANNONDistance) {
            this.addTreeCANNON(cx, cz);
          }
        }
      }
    }
  }

  checkAndRemove(position) {
    const px = position.x;
    const pz = position.z;
    for (const key in this.allTrees) {
      const record = this.allTrees[key];
      const dx = record.mesh.position.x - px;
      const dz = record.mesh.position.z - pz;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > this.removingTreeDistance) {
        this.removeTree(record.mesh.position.x, record.mesh.position.z);
      }
      if (dist > this.removingCANNONDistance) {
        this.addTreeCANNON(record.mesh.position.x, record.mesh.position.z);
      }
    }
  }
}