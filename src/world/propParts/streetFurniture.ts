// @ts-nocheck
import * as THREE from "three";
import { mulberry32 } from "../layout.ts";
import { MeshBuilder, createTransformMatrix } from "../meshBuilder.ts";
import { MATERIAL_PART } from "../partMaterials.ts";

export function hydrant() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.PAINT).setColor(0xffffff);
  b.cyl(0, 0, 0, 0.16, 0.16, 0.08, 10);
  b.cyl(0, 0.08, 0, 0.12, 0.11, 0.5, 10);
  b.cyl(0, 0.58, 0, 0.14, 0.14, 0.06, 10);
  b.cyl(0, 0.64, 0, 0.11, 0.03, 0.14, 10);
  b.cyl(0, 0.76, 0, 0.03, 0.02, 0.06, 6);
  b.tube([-0.2, 0.42, 0], [0.2, 0.42, 0], 0.05, 8, true);
  b.tube([0, 0.4, 0], [0, 0.4, 0.2], 0.07, 8, true);
  return b.build({ part: true });
}

export function trashCan() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.BASE).setColor(0x1e4a2c);
  // wire-basket look: vertical bars + rings
  const r = 0.3,
    h = 0.9,
    n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    b.tube(
      [Math.cos(a) * r * 0.9, 0.05, Math.sin(a) * r * 0.9],
      [Math.cos(a) * r, h, Math.sin(a) * r],
      0.018,
      3,
    );
  }
  for (const y of [0.05, 0.35, 0.65])
    b.cyl(
      0,
      y,
      0,
      r * (0.9 + y * 0.1) + 0.01,
      r * (0.9 + y * 0.1) + 0.01,
      0.04,
      14,
      false,
    );
  b.cyl(0, h - 0.06, 0, r + 0.02, r + 0.02, 0.07, 14, true);
  b.setColor(0x151515).cyl(0, 0.02, 0, r * 0.88, r * 0.88, 0.03, 12, true);
  // garbage bag inside
  b.setPart(MATERIAL_PART.PLASTIC)
    .setColor(0x1a1a1a)
    .cyl(0, 0.1, 0, r * 0.85, r * 0.8, h - 0.15, 10, true);
  return b.build({ part: true });
}

// (street r9) NYC curbside trash-bag pile: 5-8 tied bags (black / dark green / grey-white / clear-blue recycling), a
// cardboard bundle; ~1.5 x 0.8 m, 0.75 m high (collision: one low box)
export const BAG_BOXES = []; // per-bag bounding boxes (local), mirrored as collision solids
export function trashBags() {
  const b = new MeshBuilder(),
    rr = mulberry32(4242);
  BAG_BOXES.length = 0;
  const cols = [
    0x121212, 0x161616, 0x0f130f, 0x1b211c, 0x7d7d76, 0x4f6278, 0x121212,
  ];
  for (let i = 0; i < 8; i++) {
    const x = -0.6 + (i % 4) * 0.4 + (rr() - 0.5) * 0.12,
      z = (i < 4 ? -0.18 : 0.2) + (rr() - 0.5) * 0.1,
      r = 0.2 + rr() * 0.08;
    const y0 = i >= 6 ? 0.36 : 0,
      h = 0.42 + rr() * 0.16;
    b.setPart(MATERIAL_PART.PLASTIC).setColor(cols[Math.floor(rr() * cols.length)]);
    b.cyl(x, y0, z, r * 0.92, r, h * 0.55, 7, false); // body (bulging)
    b.cyl(x, y0 + h * 0.55, z, r, r * 0.35, h * 0.35, 7, false); // shoulders
    b.cyl(x, y0 + h * 0.9, z, r * 0.12, r * 0.18, 0.08, 5, true); // tied neck
    BAG_BOXES.push([x - r, y0, z - r, x + r, y0 + h * 0.9, z + r]);
  }
  BAG_BOXES.push([0.55, 0, -0.35, 0.95, 0.36, 0.3]);
  b.setPart(MATERIAL_PART.BASE).setColor(0x7a6446).box(0.55, 0, -0.35, 0.95, 0.32, 0.3); // flattened cardboard bundle
  b.setColor(0x6b563a).box(0.58, 0.32, -0.3, 0.92, 0.36, 0.25);
  return b.build({ part: true });
}

export function bench() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.BASE).setColor(0x243a2a);
  for (const x of [-0.8, 0.8]) {
    b.box(x - 0.04, 0, -0.25, x + 0.04, 0.45, -0.19);
    b.box(x - 0.04, 0, 0.19, x + 0.04, 0.45, 0.25);
    b.box(x - 0.04, 0.4, -0.3, x + 0.04, 0.46, 0.3);
    b.tube([x, 0.45, -0.3], [x, 0.9, -0.38], 0.03, 4);
  }
  b.setColor(0x6e4a2e);
  for (let i = 0; i < 4; i++)
    b.box(-1.0, 0.46, -0.28 + i * 0.14, 1.0, 0.5, -0.17 + i * 0.14);
  for (let i = 0; i < 3; i++)
    b.box(
      -1.0,
      0.56 + i * 0.12,
      -0.36 - i * 0.02,
      1.0,
      0.65 + i * 0.12,
      -0.32 - i * 0.02,
    );
  return b.build({ part: true });
}

export function newsstand() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.BASE).setColor(0x2b4d3a).box(-1.3, 0, -0.8, 1.3, 2.3, 0.8);
  b.setColor(0x1d3528).box(-1.45, 2.3, -0.95, 1.45, 2.45, 1.1);
  // magazine front (+z)
  const rnd = mulberry32(5);
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 9; c++) {
      b.setColor([rnd() * 0.8, rnd() * 0.8, rnd() * 0.8]).box(
        -1.15 + c * 0.26,
        0.5 + r * 0.38,
        0.8,
        -0.93 + c * 0.26,
        0.82 + r * 0.38,
        0.84,
        0b010000,
      );
    }
  b.setPart(MATERIAL_PART.GLASS)
    .setColor(0x000000)
    .box(-1.2, 1.2, 0.84, 1.2, 2.1, 0.85, 0b010000);
  b.setPart(MATERIAL_PART.BASE)
    .setColor(0xd9c34a)
    .box(-1.2, 2.32, 1.1, 1.2, 2.44, 1.11, 0b010000);
  return b.build({ part: true });
}

export function hotdogCart() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.METAL)
    .setColor(0xc8cacc)
    .box(-0.8, 0.45, -0.45, 0.8, 1.05, 0.45);
  b.setPart(MATERIAL_PART.BASE)
    .setColor(0x2458a6)
    .box(-0.82, 0.55, 0.45, 0.82, 0.8, 0.47, 0b010000);
  b.setColor(0xf2c230).box(-0.82, 0.8, 0.45, 0.82, 0.95, 0.47, 0b010000);
  b.setPart(MATERIAL_PART.METAL)
    .setColor(0xb0b2b4)
    .box(-0.85, 1.05, -0.5, 0.85, 1.1, 0.5);
  b.box(-0.6, 1.1, -0.35, 0.2, 1.4, 0.35);
  b.setPart(MATERIAL_PART.RUBBER).setColor(0x111111);
  b.with(createTransformMatrix(0.55, 0.3, -0.47), (d) =>
    d.tube([0, 0, 0], [0, 0, -0.08], 0.3, 12, true),
  );
  b.with(createTransformMatrix(0.55, 0.3, 0.55), (d) =>
    d.tube([0, 0, 0], [0, 0, -0.08], 0.3, 12, true),
  );
  b.setPart(MATERIAL_PART.METAL)
    .setColor(0x999999)
    .box(-1.1, 0.85, -0.03, -0.8, 0.9, 0.03);
  b.tube([0, 1.1, 0], [0, 2.35, 0], 0.025, 5);
  // umbrella blue/yellow segments
  const n = 12,
    R = 1.25;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2,
      a1 = ((i + 1) / n) * Math.PI * 2;
    b.setPart(MATERIAL_PART.FABRIC).setColor(i % 2 ? 0x1f5fc2 : 0xf5c518);
    const top = b.vert(0, 2.55, 0, 0, 1, 0);
    const p0 = b.vert(
      Math.cos(a0) * R,
      2.2,
      Math.sin(a0) * R,
      Math.cos(a0) * 0.4,
      0.9,
      Math.sin(a0) * 0.4,
    );
    const p1 = b.vert(
      Math.cos(a1) * R,
      2.2,
      Math.sin(a1) * R,
      Math.cos(a1) * 0.4,
      0.9,
      Math.sin(a1) * 0.4,
    );
    b.tri(top, p1, p0);
    const q0 = b.vert(Math.cos(a0) * R, 2.2, Math.sin(a0) * R, 0, -1, 0);
    const q1 = b.vert(Math.cos(a1) * R, 2.2, Math.sin(a1) * R, 0, -1, 0);
    const t2 = b.vert(0, 2.5, 0, 0, -1, 0);
    b.tri(t2, q0, q1);
  }
  return b.build({ part: true });
}

export function planter() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.BASE).setColor(0x8a8479).box(-0.6, 0, -0.45, 0.6, 0.6, 0.45);
  b.setColor(0x3b2b1f).box(-0.55, 0.6, -0.4, 0.55, 0.62, 0.4, 0b000100);
  const rnd = mulberry32(9);
  for (let i = 0; i < 9; i++) {
    b.setColor([0.12 + rnd() * 0.25, 0.18 + rnd() * 0.12, 0.04]);
    const x = (rnd() - 0.5) * 0.8,
      z = (rnd() - 0.5) * 0.5,
      r = 0.18 + rnd() * 0.15;
    b.cyl(x, 0.6, z, r, 0.02, 0.25 + rnd() * 0.35, 6, false);
  }
  return b.build({ part: true });
}

export function mailbox() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.BASE).setColor(0x1e3f8a);
  for (const x of [-0.2, 0.2])
    for (const z of [-0.2, 0.2])
      b.box(x - 0.025, 0, z - 0.025, x + 0.025, 0.25, z + 0.025);
  b.box(-0.26, 0.25, -0.24, 0.26, 1.0, 0.24);
  b.cyl(0, 1.0, 0, 0.26, 0.26, 0.001, 10, false);
  b.with(
    new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(-0.26, 1.0, 0),
    (d) => d.cyl(0, 0, 0, 0.24, 0.24, 0.52, 10, true),
  );
  b.setColor(0xe8e8e8).box(-0.1, 0.55, 0.24, 0.1, 0.62, 0.245, 0b010000);
  return b.build({ part: true });
}

export function linkKiosk() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.METAL)
    .setColor(0x8c9296)
    .box(-0.28, 0, -0.12, 0.28, 2.9, 0.12);
  b.setPart(MATERIAL_PART.SCREEN)
    .setColor(0x2f6fa8)
    .box(-0.24, 1.1, 0.12, 0.24, 2.7, 0.125, 0b010000);
  b.setPart(MATERIAL_PART.SCREEN)
    .setColor(0xa84f2f)
    .box(-0.24, 1.1, -0.125, 0.24, 2.7, -0.12, 0b100000);
  return b.build({ part: true });
}

export function busStopSign() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.METAL).setColor(0x9a9a9a).cyl(0, 0, 0, 0.04, 0.04, 3.0, 6);
  b.setPart(MATERIAL_PART.BASE)
    .setColor(0x2255aa)
    .box(-0.25, 2.2, -0.02, 0.25, 2.95, 0.02);
  b.setColor(0xeeeeee).box(-0.2, 2.6, -0.025, 0.2, 2.85, 0.025, 0b110000);
  return b.build({ part: true });
}
