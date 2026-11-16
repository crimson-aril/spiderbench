// @ts-nocheck
import { MeshBuilder, createTransformMatrix } from "../meshBuilder.ts";
import { MATERIAL_PART } from "../partMaterials.ts";
export function lamppost() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.PAINT).setColor(0xffffff);
  b.cyl(0, 0, 0, 0.22, 0.2, 0.9, 8); // base
  b.cyl(0, 0.9, 0, 0.13, 0.08, 7.6, 8, false); // shaft
  // arm: quarter curve then straight toward the road
  const pts = [];
  for (let i = 0; i <= 6; i++) {
    const a = ((i / 6) * Math.PI) / 2;
    pts.push([0, 8.1 + Math.sin(a) * 0.9, (1 - Math.cos(a)) * 0.9]);
  }
  pts.push([0, 9.05, 2.6]);
  for (let i = 0; i + 1 < pts.length; i++) b.tube(pts[i], pts[i + 1], 0.07, 6);
  // cobra head
  b.box(-0.22, 8.85, 2.4, 0.22, 9.15, 3.4);
  b.setPart(MATERIAL_PART.LAMP)
    .setColor(0xfff1d0)
    .box(-0.17, 8.82, 2.5, 0.17, 8.86, 3.3, 0b001000);
  return b.build({ part: true });
}

// cylinder for a lamp facing +x: build as disc via box (cheap)
function signalHeadX(b, x, y, z, ry = 0) {
  b.with(createTransformMatrix(x, y, z, ry), (d) => {
    d.setPart(MATERIAL_PART.PAINT)
      .setColor(0xffffff)
      .box(-0.16, -0.55, -0.2, 0.16, 0.55, 0.2);
    [
      [MATERIAL_PART.RED_SIGNAL, 0.33],
      [MATERIAL_PART.YELLOW_SIGNAL, 0],
      [MATERIAL_PART.GREEN_SIGNAL, -0.33],
    ].forEach(([p, yy]) => {
      d.setPart(MATERIAL_PART.PLASTIC)
        .setColor(0x0c0c0c)
        .box(0.16, yy + 0.1, -0.14, 0.34, yy + 0.14, 0.14, 0b111111);
      d.setPart(MATERIAL_PART.PLASTIC)
        .setColor(0x0c0c0c)
        .box(0.16, yy - 0.12, -0.15, 0.3, yy + 0.12, -0.12, 0b111111);
      d.setPart(MATERIAL_PART.PLASTIC)
        .setColor(0x0c0c0c)
        .box(0.16, yy - 0.12, 0.12, 0.3, yy + 0.12, 0.15, 0b111111);
      d.setPart(p)
        .setColor(0xffffff)
        .box(0.16, yy - 0.1, -0.1, 0.175, yy + 0.1, 0.1, 0b000001);
    });
  });
}

export function trafficMast() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.BASE).setColor(0x3b3e40);
  b.cyl(0, 0, 0, 0.26, 0.24, 0.5, 8);
  b.cyl(0, 0.5, 0, 0.17, 0.13, 6.8, 8, true);
  b.tube([0, 6.3, 0], [0, 6.7, 10.5], 0.1, 6, true);
  b.tube([0, 7.1, 0], [0, 6.75, 4.5], 0.05, 5);
  // heads hanging from the arm, lenses facing +x
  for (const z of [4.2, 7.6]) {
    b.setPart(MATERIAL_PART.BASE)
      .setColor(0x3b3e40)
      .box(-0.03, 5.9, z - 0.03, 0.03, 6.55, z + 0.03);
    signalHeadX(b, 0, 5.3, z, 0);
  }
  // pole-mounted head + ped signal
  signalHeadX(b, 0.25, 3.3, 0, 0);
  b.with(createTransformMatrix(0, 2.6, 0.25, 0), (d) => {
    d.setPart(MATERIAL_PART.PLASTIC)
      .setColor(0x222222)
      .box(-0.18, -0.2, -0.05, 0.18, 0.2, 0.25);
    d.setPart(MATERIAL_PART.PEDESTRIAN)
      .setColor(0xffffff)
      .box(-0.14, -0.16, 0.25, 0.14, 0.16, 0.26, 0b010000);
  });
  // street name blade signs on top (green)
  b.setPart(MATERIAL_PART.BASE)
    .setColor(0x0c5a2c)
    .box(-0.6, 7.35, -0.02, 0.6, 7.6, 0.02);
  b.setColor(0x0c5a2c).box(-0.02, 7.65, -0.6, 0.02, 7.9, 0.6);
  b.setColor(0xe8e8e8).box(-0.5, 7.44, -0.025, 0.5, 7.5, 0.025, 0b110000);
  b.setColor(0xe8e8e8).box(-0.025, 7.74, -0.5, 0.025, 7.8, 0.5, 0b000011);
  return b.build({ part: true });
}

export function trafficPost() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.BASE).setColor(0x3b3e40);
  b.cyl(0, 0, 0, 0.2, 0.18, 0.4, 8);
  b.cyl(0, 0.4, 0, 0.1, 0.08, 4.0, 8, true);
  signalHeadX(b, 0.22, 3.5, 0, 0);
  b.with(createTransformMatrix(0, 2.5, 0, 0), (d) => {
    d.setPart(MATERIAL_PART.PLASTIC)
      .setColor(0x222222)
      .box(0.08, -0.2, -0.18, 0.3, 0.2, 0.18);
    d.setPart(MATERIAL_PART.PEDESTRIAN)
      .setColor(0xffffff)
      .box(0.3, -0.16, -0.14, 0.31, 0.16, 0.14, 0b000001);
  });
  // one-way sign
  b.setPart(MATERIAL_PART.BASE)
    .setColor(0x111111)
    .box(-0.45, 3.0, -0.02, 0.45, 3.28, 0.02);
  b.setColor(0xf0f0f0).box(-0.38, 3.1, -0.025, 0.25, 3.18, 0.025, 0b110000);
  return b.build({ part: true });
}
