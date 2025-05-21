import * as THREE from "three";
import { curve } from "./trackGeneration.js";

export class SmallMap {
  constructor(width = 200, height = 200) {
    this.sizeWidth = width;
    this.sizeHeight = height;
    this.carPosition = new THREE.Vector3();
    this.isVisible = false;

    // Set up canvas
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.sizeWidth;
    this.canvas.height = this.sizeHeight;
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "15px";
    this.canvas.style.right = "15px";
    this.canvas.style.zIndex = "100"; // 確保在最上層
    this.canvas.style.display = "none";
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    // Precompute track points
    this.trackPoints = curve.getPoints(200);
    this.scale = 0.02;

    const p0 = curve.getPointAt(0.0);
    const p1 = curve.getPointAt(0.5);
    this.trackCenter = p0.clone().lerp(p1, 0.5);
  }

  drawMap(position, quaternion) {
    this.carPosition.copy(position);
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.sizeWidth, this.sizeHeight);

    // Draw road track centered on trackCenter position
    ctx.beginPath();
    this.trackPoints.forEach((p, i) => {
      const dx = p.x - this.trackCenter.x;
      const dz = p.z - this.trackCenter.z;
      const x = this.sizeWidth / 2 + dx * this.scale;
      const y = this.sizeHeight / 2 + dz * this.scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.lineWidth = 8;
    ctx.strokeStyle = "#222222";
    ctx.shadowColor = '#00fffc';
    ctx.shadowBlur = 4
    ctx.stroke();

    // Draw car position
    const carX = this.sizeWidth / 2 + (this.carPosition.x - this.trackCenter.x) * this.scale;
    const carY = this.sizeHeight / 2 + (this.carPosition.z - this.trackCenter.z) * this.scale;
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.arc(carX, carY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw car heading arrow
    // Arrow parameters
    const arrowLength = 12;
    const arrowWidth = 6;

    // Compute forward vector from quaternion
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion).normalize();

    // Calculate arrow tip position
    const tipX = carX + forward.x * arrowLength;
    const tipY = carY + forward.z * arrowLength;

    // Calculate left and right base points of the arrowhead
    const leftDir = new THREE.Vector3(forward.z, 0, -forward.x).normalize(); // perpendicular in 2D XZ plane
    const leftX = carX + leftDir.x * (arrowWidth / 2);
    const leftY = carY + leftDir.z * (arrowWidth / 2);

    const rightX = carX - leftDir.x * (arrowWidth / 2);
    const rightY = carY - leftDir.z * (arrowWidth / 2);

    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  show() {
    this.isVisible = true;
    this.canvas.style.display = 'block';
  }

  hide() {
    this.isVisible = false;
    this.canvas.style.display = 'none';
  }
}