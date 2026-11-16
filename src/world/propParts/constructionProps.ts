// @ts-nocheck
import * as THREE from "three";
import { mulberry32 } from "../layout.ts";
import { MeshBuilder } from "../meshBuilder.ts";
import { MATERIAL_PART } from "../partMaterials.ts";

// (street r6) critic (ref 16): 'a brown flat roof slab that looks like an untextured plane' = the sidewalk-shed deck seen
// from above. Deck overlay per bay (same local frame as the shed GLB: x -1.2..1.2, z -1..0 scaled to the walk width):
// two weathered plywood sheets (PAINT, instance-tinted per bay), dark seams, water stains, a strip of grime at the
// parapet. Plus an optional debris set (unscaled): sandbags, a plank stack, a bucket, a rolled tarp.
export function shedTop() {
  const b = new MeshBuilder(),
    r = mulberry32(9191),
    Y = 3.0;
  b.setPart(MATERIAL_PART.PAINT);
  for (const [x0, x1] of [
    [-1.19, -0.01],
    [0.01, 1.19],
  ])
    for (const [z0, z1] of [
      [-0.99, -0.5],
      [-0.49, 0.0],
    ]) {
      b.setColor(
        [0x8e8474, 0x7c705e, 0x958a78, 0x6e6454][Math.floor(r() * 4)],
      ).box(x0, Y, z0, x1, Y + 0.004, z1, 0b000100);
    }
  b.setPart(MATERIAL_PART.BASE);
  for (let k = 0; k < 5; k++) {
    // water / tar stains
    const x = -1 + r() * 2,
      z = -0.85 + r() * 0.7,
      w = 0.15 + r() * 0.35,
      d = 0.06 + r() * 0.2;
    b.setColor(r() < 0.6 ? 0x3e372e : 0x5a5347).box(
      x - w / 2,
      Y + 0.005,
      z - d / 2,
      x + w / 2,
      Y + 0.007,
      z + d / 2,
      0b000100,
    );
  }
  b.setColor(0x2f2a24).box(
    -1.2,
    Y + 0.004,
    -0.02,
    1.2,
    Y + 0.009,
    0.02,
    0b000100,
  ); // grime line against the parapet
  return b.build({ part: true });
}
// (street r12) critic (ref 11): 'street-side green scaffold is a single flat strip; add structure and signage'.
// Hung on the shed's curb-side parapet (shed GLB frame, z = 0 at the curb posts): a permit / contractor board
// (PAINT, instance-tinted white / safety yellow / pale blue), black lettering rows, a logo block, cable ties, plus a
// caged work light under the deck and a diagonal kicker brace down the post.
export function shedSign() {
  const b = new MeshBuilder();
  const Z = 0.115,
    Y0 = 3.08,
    Y1 = 3.78;
  b.setPart(MATERIAL_PART.PAINT)
    .setColor(0xf2efe6)
    .box(-0.62, Y0, Z, 0.62, Y1, Z + 0.025); // board
  b.setPart(MATERIAL_PART.BASE).setColor(0x1c1d1f);
  const rows = [
    [0.5, 0.09],
    [0.38, 0.06],
    [0.44, 0.05],
    [0.3, 0.05],
  ];
  let y = Y1 - 0.07;
  for (const [w, h] of rows) {
    y -= h + 0.055;
    b.box(-0.55, y, Z + 0.025, -0.55 + w * 2 * 0.85, y + h, Z + 0.031);
  }
  b.setColor(0x7a3a1c).box(
    0.28,
    Y0 + 0.07,
    Z + 0.025,
    0.55,
    Y0 + 0.3,
    Z + 0.032,
  ); // logo block
  b.setColor(0x151515);
  for (const x of [-0.58, 0.58])
    for (const yy of [Y0 + 0.05, Y1 - 0.05])
      b.box(x - 0.015, yy - 0.015, Z - 0.01, x + 0.015, yy + 0.015, Z + 0.035); // ties
  b.setPart(MATERIAL_PART.METAL).setColor(0x3a3d3c);
  b.box(-0.03, 2.6, -0.43, 0.03, 2.72, -0.37); // work-light cage
  b.setPart(MATERIAL_PART.LAMP)
    .setColor(0xfff1cc)
    .box(-0.022, 2.55, -0.422, 0.022, 2.62, -0.378);
  b.setPart(MATERIAL_PART.METAL).setColor(0x2f3432);
  b.tube([1.2, 1.1, 0.02], [1.2 - 0.95, 2.66, 0.02], 0.035, 5, false); // kicker brace
  return b.build({ part: true });
}
export function shedJunk() {
  const b = new MeshBuilder(),
    Y = 3.0;
  b.setPart(MATERIAL_PART.BASE);
  for (const [x, z, a] of [
    [-0.6, -0.25, 0.1],
    [-0.25, -0.2, -0.2],
    [-0.45, 0.05, 0.3],
  ]) // sandbags
    b.with(new THREE.Matrix4().makeRotationY(a).setPosition(x, Y, z), (m) =>
      m.setColor(0x9a8c6c).box(-0.28, 0, -0.16, 0.28, 0.14, 0.16),
    );
  b.setColor(0x7a6446);
  for (let i = 0; i < 4; i++)
    b.box(
      0.15,
      Y + i * 0.045,
      -0.35 + i * 0.01,
      1.05,
      Y + 0.04 + i * 0.045,
      -0.2 + i * 0.01,
    ); // plank stack
  b.setColor(0x2b2d2e).cyl(0.75, Y, 0.15, 0.14, 0.13, 0.36, 8, true); // bucket
  b.setColor(0x3d4a52).tube(
    [-1.0, Y + 0.08, -0.4],
    [-1.0, Y + 0.08, 0.2],
    0.08,
    7,
    true,
  ); // rolled tarp
  return b.build({ part: true });
}

// (street r6) roll-off construction container, 6 x 2.4 x 1.55 m: weathered painted steel (rust-red, PAINT so the
// instance tint does not recolour it -> BASE), vertical side ribs, top rail, hook end, and a rubble fill that sits
// flush under the rim: drywall slabs, lumber, black contractor bags, a pallet, pipe offcuts. Nothing floats.
export function rolloffModel() {
  const b = new MeshBuilder(),
    r = mulberry32(4242);
  const BODY = 0x6e3a2a,
    RIB = 0x5a2f22,
    RUST = 0x4a2a1c;
  b.setPart(MATERIAL_PART.BASE)
    .setColor(BODY)
    .box(-3.0, 0.15, -1.2, 3.0, 1.55, 1.2, 0b111011); // outer shell, open top
  b.setColor(0x3a2a20).box(-2.92, 0.2, -1.12, 2.92, 1.5, 1.12, 0b111011); // inner walls (dark)
  b.setColor(RIB);
  for (let k = -5; k <= 5; k++)
    for (const z of [-1.23, 1.2])
      b.box(k * 0.55 - 0.05, 0.15, z, k * 0.55 + 0.05, 1.55, z + 0.03);
  b.setColor(RUST).box(-3.03, 1.47, -1.24, 3.03, 1.55, 1.24, 0b110111); // top rail
  b.setColor(0x222222).box(-3.05, 0.0, -1.0, 3.05, 0.15, 1.0); // skids
  b.setColor(0x333333).box(3.0, 0.3, -0.25, 3.25, 1.1, 0.25); // hook bracket
  b.setPart(MATERIAL_PART.PAINT)
    .setColor(0xc9c3b0)
    .box(-1.2, 0.7, 1.231, 1.2, 1.1, 1.24, 0b010000); // company panel
  b.setPart(MATERIAL_PART.BASE)
    .setColor(0x4d4233)
    .box(-2.9, 1.2, -1.1, 2.9, 1.42, 1.1, 0b000100); // fill surface
  const rot = (x, y, z, ry, rx, fn) =>
    b.with(
      new THREE.Matrix4().compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, 0)),
        new THREE.Vector3(1, 1, 1),
      ),
      fn,
    );
  const TOP = 1.56;
  for (let k = 0; k < 34; k++) {
    const x = -2.6 + r() * 5.2,
      z = -0.85 + r() * 1.7,
      kind = r();
    if (kind < 0.3) {
      // drywall / plywood slab, tilted
      const w = 0.5 + r() * 0.7,
        d = 0.35 + r() * 0.5,
        tilt = (r() - 0.5) * 0.35;
      const y = Math.min(
        TOP - (Math.abs(Math.sin(tilt)) * d) / 2 - 0.02,
        1.43 + r() * 0.1,
      );
      rot(x, y, z, r() * 3, tilt, () =>
        b
          .setColor(r() < 0.6 ? 0xb7b1a2 : 0x9a8264)
          .box(-w / 2, -0.012, -d / 2, w / 2, 0.012, d / 2),
      );
    } else if (kind < 0.55) {
      // lumber
      const L = 0.8 + r() * 1.2,
        y = 1.44 + r() * 0.07;
      rot(x, y, z, r() * 3, (r() - 0.5) * 0.08, () =>
        b
          .setColor(r() < 0.5 ? 0x8a7050 : 0x6c5a44)
          .box(-L / 2, -0.04, -0.05, L / 2, 0.04, 0.05),
      );
    } else if (kind < 0.8) {
      // contractor bag
      const s = 0.22 + r() * 0.14;
      b.setColor(0x1c1d1e).cyl(
        x,
        1.36,
        z,
        s,
        s * 0.7,
        Math.min(TOP - 1.37, 0.12 + s * 0.4),
        7,
        true,
        true,
      );
    } else if (kind < 0.9) {
      // broken concrete / masonry chunk
      const s = 0.12 + r() * 0.14;
      rot(x, 1.43 + s * 0.3, z, r() * 3, 0, () =>
        b
          .setColor(0x8b8780)
          .box(
            -s,
            -s * 0.4,
            -s * 0.7,
            s,
            Math.min(s * 0.4, TOP - 1.45 - s * 0.3),
            s * 0.7,
          ),
      );
    } else {
      // pipe offcut
      const L = 0.6 + r(),
        y = 1.47;
      rot(x, y, z, r() * 3, 0, () =>
        b
          .setColor(0x6a6e70)
          .tube([-L / 2, 0, 0], [L / 2, 0, 0], 0.035, 6, true),
      );
    }
  }
  rot(-1.2, 1.46, 0.3, 0.4, 0, () => {
    b.setColor(0x7d6a4c);
    for (let s = -0.5; s <= 0.5; s += 0.25)
      b.box(-0.6, 0, s - 0.05, 0.6, 0.025, s + 0.05);
  }); // pallet
  return b.build({ part: true });
}
