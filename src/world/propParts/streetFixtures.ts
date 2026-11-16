// @ts-nocheck
import { mulberry32 } from "../layout.ts";
import { MeshBuilder, linearColorFromHex } from "../meshBuilder.ts";
import { MATERIAL_PART } from "../partMaterials.ts";

// (street r5) doorman canopy (critic, ref 11: 'add canopies and doorman awnings typical of Central Park West'): a fabric
// marquee from the lobby door to the curb on brass posts, valance on three sides, brass trim. Local frame: posts at z=0
// (0.75 m from the curb), building face at z=-4.25 (scaled in z by the sidewalk width). Fabric = PAINT (instance tint).
export function doormanCanopy() {
  const b = new MeshBuilder();
  const Y = 3.2;
  b.setPart(MATERIAL_PART.PAINT).setColor(0xffffff);
  b.box(-1.25, Y, -4.25, 1.25, Y + 0.1, 0.12); // roof
  b.box(-1.25, Y - 0.34, 0.06, 1.25, Y + 0.02, 0.12, 0b111111); // front valance
  for (const x of [-1.25, 1.19])
    b.box(x, Y - 0.34, -4.25, x + 0.06, Y + 0.02, 0.12, 0b111111);
  // shallow barrel crown (three stepped slats)
  b.box(-1.05, Y + 0.1, -4.25, 1.05, Y + 0.2, 0.08).box(
    -0.7,
    Y + 0.2,
    -4.25,
    0.7,
    Y + 0.26,
    0.04,
  );
  b.setPart(MATERIAL_PART.BASE)
    .setColor(0xd8d2bf)
    .box(-0.55, Y - 0.24, 0.121, 0.55, Y - 0.1, 0.125, 0b010000); // address stripe
  b.setPart(MATERIAL_PART.METAL).setColor(0xa7864a);
  for (const x of [-1.15, 1.15]) {
    b.cyl(x, 0, 0, 0.05, 0.035, Y, 8);
    b.cyl(x, 0, 0, 0.09, 0.08, 0.12, 8);
  }
  b.box(-1.26, Y - 0.36, 0.05, 1.26, Y - 0.32, 0.13); // brass edge rail
  return b.build({ part: true });
}

// (street r7) projecting blade sign (critic: 'no readable storefront level, no signage'): wall plate + steel arm at the
// top, a framed double-sided sign box (frame = instance tint) with lit cream faces and dark lettering blocks.
// Local frame: -z = building face (z 0), +z toward the curb; the box spans z 0.25..1.15, y 3.35..5.25.
export function bladeSign() {
  const b = new MeshBuilder();
  const Y0 = 3.35,
    Y1 = 5.25,
    Z0 = 0.25,
    Z1 = 1.15,
    T = 0.07;
  b.setPart(MATERIAL_PART.METAL).setColor(0x2b2d2e);
  b.box(-0.12, Y1 - 0.2, 0, 0.12, Y1 + 0.28, 0.06); // wall plate
  b.box(-0.025, Y1 + 0.12, 0.02, 0.025, Y1 + 0.17, Z1 + 0.05); // arm
  b.box(-0.02, Y1 + 0.0, 0.02, 0.02, Y1 + 0.04, 0.3); // brace
  for (const z of [Z0 + 0.12, Z1 - 0.12])
    b.box(-0.015, Y1, z - 0.015, 0.015, Y1 + 0.13, z + 0.015); // hangers
  b.setPart(MATERIAL_PART.PAINT).setColor(0xffffff);
  b.box(-T, Y0, Z0, T, Y1, Z1); // tinted sign box (frame)
  // (night r5) the lit faces are real signs now: bladeFaces() (ts_signs atlas, one instanced draw) replaces the r4
  // cream boxes with stacked black bars (critic r5: 'placeholder menu-icon art')
  return b.build({ part: true });
}

export function meter() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.BASE).setColor(0x333333).cyl(0, 0, 0, 0.04, 0.04, 1.2, 6);
  b.setColor(0x2c4f7c).box(-0.14, 1.2, -0.1, 0.14, 1.65, 0.1);
  b.setPart(MATERIAL_PART.SCREEN)
    .setColor(0x6a8a50)
    .box(-0.08, 1.45, 0.1, 0.08, 1.55, 0.105, 0b010000);
  return b.build({ part: true });
}

export function newsboxes() {
  // row of coin-op newspaper boxes (NYC: red, blue, yellow, green, white) on a shared rail
  const b = new MeshBuilder();
  const cols = [0xb3221c, 0x1f4d9c, 0xe0b21e, 0x1e6b3a, 0xdedcd4];
  const rnd = mulberry32(21);
  let x = -1.05;
  for (let i = 0; i < 4; i++) {
    const w = 0.44 + rnd() * 0.08,
      h = 0.95 + rnd() * 0.25,
      c = cols[(i * 3 + 1) % cols.length];
    b.setPart(MATERIAL_PART.PAINT).setColor(0xffffff);
    b.setPart(MATERIAL_PART.BASE).setColor(0x2a2a2a);
    for (const xx of [x + 0.05, x + w - 0.05])
      b.box(xx - 0.02, 0, -0.18, xx + 0.02, 0.35, 0.18, 0b110011);
    b.setColor(c).box(x, 0.35, -0.22, x + w, 0.35 + h, 0.22);
    b.setColor(linearColorFromHex(c).map((v) => v * 0.6)).box(
      x - 0.01,
      0.35 + h,
      -0.24,
      x + w + 0.01,
      0.4 + h,
      0.24,
    );
    // window + coin slot on the front (+z)
    b.setPart(MATERIAL_PART.GLASS)
      .setColor(0)
      .box(
        x + 0.06,
        0.35 + h * 0.45,
        0.22,
        x + w - 0.06,
        0.35 + h * 0.85,
        0.225,
        0b010000,
      );
    b.setPart(MATERIAL_PART.BASE)
      .setColor(0xe8e4d8)
      .box(
        x + 0.1,
        0.35 + h * 0.5,
        0.226,
        x + w - 0.1,
        0.35 + h * 0.78,
        0.228,
        0b010000,
      );
    b.setPart(MATERIAL_PART.METAL)
      .setColor(0x999999)
      .box(
        x + w * 0.3,
        0.35 + h * 0.3,
        0.22,
        x + w * 0.7,
        0.35 + h * 0.36,
        0.25,
      );
    x += w + 0.06;
  }
  return b.build({ part: true });
}

export function busShelter() {
  // steel frame, glass side + back panels (dark glass part), lit ad panel at the end, bench; local +z toward the road
  const b = new MeshBuilder();
  const L = 4.2,
    D = 1.5,
    H = 2.45;
  b.setPart(MATERIAL_PART.METAL).setColor(0x6d7275);
  for (const x of [-L / 2, 0, L / 2])
    for (const z of [-D / 2, D / 2])
      b.box(x - 0.04, 0, z - 0.04, x + 0.04, H, z + 0.04);
  b.box(-L / 2 - 0.1, H, -D / 2 - 0.15, L / 2 + 0.1, H + 0.12, D / 2 + 0.25);
  b.setPart(MATERIAL_PART.PAINT)
    .setColor(0xffffff)
    .box(
      -L / 2 - 0.1,
      H + 0.12,
      -D / 2 - 0.15,
      L / 2 + 0.1,
      H + 0.14,
      D / 2 + 0.25,
      0b000100,
    );
  // glass back wall (thin, dark reflective) with a clear gap at the bottom
  b.setPart(MATERIAL_PART.GLASS)
    .setColor(0)
    .box(-L / 2, 0.25, -D / 2 - 0.01, L / 2, H - 0.1, -D / 2 + 0.01, 0b110000);
  b.box(
    -L / 2 - 0.01,
    0.25,
    -D / 2,
    -L / 2 + 0.01,
    H - 0.1,
    D / 2 - 0.3,
    0b000011,
  );
  // advertising panel on the other end (backlit)
  b.setPart(MATERIAL_PART.METAL)
    .setColor(0x505558)
    .box(L / 2 - 0.06, 0.1, -D / 2, L / 2 + 0.06, H - 0.1, D / 2 - 0.2);
  b.setPart(MATERIAL_PART.SCREEN)
    .setColor(0x4a7aa8)
    .box(
      L / 2 + 0.061,
      0.3,
      -D / 2 + 0.1,
      L / 2 + 0.065,
      H - 0.3,
      D / 2 - 0.3,
      0b000001,
    );
  b.setPart(MATERIAL_PART.SCREEN)
    .setColor(0xa8603a)
    .box(
      L / 2 - 0.065,
      0.3,
      -D / 2 + 0.1,
      L / 2 - 0.061,
      H - 0.3,
      D / 2 - 0.3,
      0b000010,
    );
  // bench
  b.setPart(MATERIAL_PART.METAL)
    .setColor(0x8a8f92)
    .box(-1.4, 0.44, -D / 2 + 0.05, 1.0, 0.48, -D / 2 + 0.45);
  for (const x of [-1.3, 0.9])
    b.box(x - 0.03, 0, -D / 2 + 0.2, x + 0.03, 0.44, -D / 2 + 0.3);
  return b.build({ part: true });
}

export function bikeRack() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.METAL).setColor(0x8f9396);
  for (let i = 0; i < 4; i++) {
    const x = -1.2 + i * 0.8,
      pts = [];
    for (let k = 0; k <= 6; k++) {
      const a = (k / 6) * Math.PI;
      pts.push([x + Math.cos(a) * 0.3, 0.55 + Math.sin(a) * 0.3, 0]);
    }
    b.tube([x + 0.3, 0, 0], pts[0], 0.03, 5);
    b.tube(pts[6], [x - 0.3, 0, 0], 0.03, 5);
    for (let k = 0; k < 6; k++) b.tube(pts[k], pts[k + 1], 0.03, 5);
  }
  return b.build({ part: true });
}
