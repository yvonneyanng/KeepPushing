import * as CANNON from 'cannon-es';
import * as THREE from "three";

// Create a curved road
const roadWidth = 20;
const roadLength = 10000; // 10 kilometers (10000 meters)

// Create a curved path for the road
const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(100, 0, -200),
  new THREE.Vector3(300, 0, -400),
  new THREE.Vector3(0, 0, -800),
  new THREE.Vector3(-200, 0, -1200),
  new THREE.Vector3(-400, 0, -1600),
  new THREE.Vector3(-200, 0, -2000),
  new THREE.Vector3(0, 0, -2400),
  new THREE.Vector3(200, 0, -2800),
  new THREE.Vector3(400, 0, -3200),
  new THREE.Vector3(200, 0, -3600),
  new THREE.Vector3(0, 0, -4000),
  new THREE.Vector3(-200, 0, -4400),
  new THREE.Vector3(-400, 0, -4800),
  new THREE.Vector3(-200, 0, -5200),
  new THREE.Vector3(0, 0, -5600),
  new THREE.Vector3(200, 0, -6000),
  new THREE.Vector3(400, 0, -6400),
  new THREE.Vector3(200, 0, -6800),
  new THREE.Vector3(0, 0, -7200),
  new THREE.Vector3(-200, 0, -7600),
  new THREE.Vector3(-400, 0, -8000),
  new THREE.Vector3(-200, 0, -8400),
  new THREE.Vector3(0, 0, -8800),
  new THREE.Vector3(200, 0, -9200),
  new THREE.Vector3(0, 0, -9600),
  new THREE.Vector3(0, 0, -10000),
]);

// Create the road geometry using TubeGeometry
const roadGeometry = new THREE.TubeGeometry(
  curve,
  1000,
  roadWidth / 2,
  8,
  false
);
const roadMaterial = new THREE.MeshPhongMaterial({
  color: 0x222222, // Darker gray for road
  side: THREE.DoubleSide,
  emissive: 0x111111, // Slight glow
});

// Create the road mesh
const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
roadMesh.receiveShadow = true;

// Create horizontal plane that follows the curve
const planePoints = [];
const planeWidth = 20; // Width of the horizontal plane

// Generate points for the horizontal plane
for (let i = 0; i <= 500; i++) {
  const t = i / 500;
  const point = curve.getPointAt(t);
  const tangent = curve.getTangentAt(t);

  // Calculate the normal vector (perpendicular to the curve in the horizontal plane)
  const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

  // Create two points, one on each side of the curve point
  planePoints.push(
    point.clone().add(normal.clone().multiplyScalar(planeWidth / 2)),
    point.clone().add(normal.clone().multiplyScalar(-planeWidth / 2))
  );
}

// Create plane geometry using triangle strips
const planeGeometry = new THREE.BufferGeometry();
const vertices = [];
const indices = [];

// Create vertices
planePoints.forEach((point) => {
  vertices.push(point.x, point.y, point.z);
});

// Create triangle indices
for (let i = 0; i < planePoints.length - 2; i += 2) {
  indices.push(i, i + 1, i + 2, i + 1, i + 3, i + 2);
}

planeGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3)
);
planeGeometry.setIndex(indices);
planeGeometry.computeVertexNormals();

// Create plane material
const planeMaterial = new THREE.MeshPhongMaterial({
  color: 0x00ff00, // Green color
  transparent: true,
  opacity: 1,
  side: THREE.DoubleSide,
  emissive: 0x003300,
});

// Create plane mesh
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
roadMesh.add(planeMesh);

// Add distance markers every 1 kilometer
for (let i = 1; i <= 10; i++) {
  const t = i / 10; // Parameter along the curve (0 to 1)
  const position = curve.getPointAt(t);
  const tangent = curve.getTangentAt(t);

  const markerGeometry = new THREE.PlaneGeometry(2, 1);
  const markerMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0x444444,
    side: THREE.DoubleSide,
  });

  const marker = new THREE.Mesh(markerGeometry, markerMaterial);

  // Position marker perpendicular to the road
  marker.position.copy(position);
  marker.position.y += 0.01;

  // Orient marker perpendicular to road direction
  marker.lookAt(position.clone().add(tangent));
  marker.rotateX(Math.PI / 2);

  roadMesh.add(marker);
}

// Convert geometry to Cannon-es Trimesh shape
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

// --- Tunnel wall geometry creation ---
const wallCannonMaterial = new CANNON.Material('wall');
const wallMaterial = new THREE.MeshPhongMaterial({
  color: 0x888888,
  emissive: 0x222222,
});
const wallBoxes = [];
const wallBodies = [];
const spacing = 5;
const wallWidth = 1;
const wallHeight = 5;
const wallDepth = 2;

for (let i = 0; i <= roadLength; i += spacing) {
  const t = i / roadLength;
  const point = curve.getPointAt(t);
  const tangent = curve.getTangentAt(t);
  const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

  [-1, 1].forEach((side) => {
    const offset = normal.clone().multiplyScalar((roadWidth / 2 + wallWidth / 2) * side);
    const wallPos = point.clone().add(offset);
    const angle = Math.atan2(tangent.x, tangent.z);

    // Create THREE mesh
    const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    wallMesh.position.copy(wallPos);
    wallMesh.rotation.y = angle;
    wallMesh.castShadow = true;
    wallBoxes.push(wallMesh);
    roadMesh.add(wallMesh);

    // Create CANNON body
    const halfExtents = new CANNON.Vec3(wallWidth / 2, wallHeight / 2, wallDepth / 2);
    const boxShape = new CANNON.Box(halfExtents);
    const wallBody = new CANNON.Body({
      mass: 0,
      shape: boxShape,
      material: wallCannonMaterial,
      position: new CANNON.Vec3(wallPos.x, wallPos.y, wallPos.z),
    });
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);
    wallBodies.push(wallBody);
  });
}

// Export wallBodies as array
export { roadMesh, roadWidth, roadLength, curve, wallBodies, wallCannonMaterial };
