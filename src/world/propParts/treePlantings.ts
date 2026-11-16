// @ts-nocheck
import { mulberry32 } from "../layout.ts";
import { MeshBuilder } from "../meshBuilder.ts";
import { MATERIAL_PART } from "../partMaterials.ts";

// (street r2) NYC street-tree species in early autumn (muted): [tintA, tintB] variants + base scale; weighted
// (street r4) refs 04 / 16: avenue trees are mostly turned (honey-locust / ginkgo gold, maple orange, oak russet);
// weights shifted toward autumn, the golds lifted a little; still desaturated 15% (no candy orange)
const SPECIES = [
  {
    w: 0.12,
    sc: 1.1,
    pal: [
      [
        [0.26, 0.23, 0.08],
        [0.15, 0.13, 0.05],
      ],
      [
        [0.31, 0.23, 0.09],
        [0.18, 0.13, 0.05],
      ],
      [
        [0.2, 0.2, 0.07],
        [0.12, 0.12, 0.045],
      ],
    ],
  }, // London plane: dusty olive / browning (street r8: browner)
  {
    w: 0.22,
    sc: 1.0,
    pal: [
      [
        [0.36, 0.33, 0.08],
        [0.21, 0.2, 0.05],
      ],
      [
        [0.42, 0.35, 0.08],
        [0.25, 0.21, 0.05],
      ],
      [
        [0.3, 0.29, 0.07],
        [0.17, 0.18, 0.05],
      ],
    ],
  }, // honey locust: yellow-green -> gold
  {
    w: 0.05,
    sc: 0.95,
    pal: [
      [
        [0.17, 0.2, 0.06],
        [0.1, 0.12, 0.04],
      ],
      [
        [0.22, 0.23, 0.07],
        [0.13, 0.14, 0.045],
      ],
    ],
  }, // linden: still green (street r8: rarer)
  {
    w: 0.14,
    sc: 1.05,
    pal: [
      [
        [0.32, 0.16, 0.06],
        [0.19, 0.09, 0.04],
      ],
      [
        [0.28, 0.18, 0.07],
        [0.17, 0.1, 0.04],
      ],
    ],
  }, // pin oak: russet / brown
  {
    w: 0.22,
    sc: 0.9,
    pal: [
      [
        [0.5, 0.38, 0.08],
        [0.31, 0.23, 0.05],
      ],
      [
        [0.44, 0.36, 0.09],
        [0.27, 0.22, 0.06],
      ],
    ],
  }, // ginkgo: gold
  {
    w: 0.25,
    sc: 0.95,
    pal: [
      [
        [0.52, 0.22, 0.05],
        [0.33, 0.13, 0.03],
      ],
      [
        [0.48, 0.28, 0.06],
        [0.3, 0.16, 0.04],
      ],
      [
        [0.5, 0.17, 0.05],
        [0.31, 0.1, 0.03],
      ],
    ],
  }, // maple: orange / red-orange (street r8: ref 16's orange crowns)
].map((s) => ({
  ...s,
  pal: s.pal.map((p) =>
    p.map((c) => {
      const m = (c[0] + c[1] + c[2]) / 3;
      return c.map((v) => v + (m - v) * 0.15);
    }),
  ),
}));
export function pickSpecies(r) {
  let u = r();
  for (const s of SPECIES) {
    u -= s.w;
    if (u <= 0) return s;
  }
  return SPECIES[0];
}

export function treePit() {
  const b = new MeshBuilder();
  b.setPart(MATERIAL_PART.BASE)
    .setColor(0x2a2018)
    .box(-0.7, 0.0, -0.7, 0.7, 0.02, 0.7, 0b000100);
  // (street r2) granite edging + cast-iron grate (radial-ish slats round a trunk opening) so pits read from above
  b.setColor(0x77736b);
  for (const [x0, z0, x1, z1] of [
    [-0.8, -0.8, 0.8, -0.7],
    [-0.8, 0.7, 0.8, 0.8],
    [-0.8, -0.7, -0.7, 0.7],
    [0.7, -0.7, 0.8, 0.7],
  ])
    b.box(x0, -0.01, z0, x1, 0.035, z1, 0b110111);
  b.setColor(0x26282a);
  for (let k = -6; k <= 6; k++) {
    const x = k * 0.1;
    if (Math.abs(x) < 0.25) {
      b.box(x - 0.022, 0.012, -0.69, x + 0.022, 0.03, -0.26, 0b000100).box(
        x - 0.022,
        0.012,
        0.26,
        x + 0.022,
        0.03,
        0.69,
        0b000100,
      );
    } else b.box(x - 0.022, 0.012, -0.69, x + 0.022, 0.03, 0.69, 0b000100);
  }
  for (const z of [-0.45, 0.45])
    b.box(-0.69, 0.013, z - 0.02, 0.69, 0.031, z + 0.02, 0b000100);
  b.setColor(0x1f3a26);
  for (const [x0, z0, x1, z1] of [
    [-0.72, -0.72, 0.72, -0.68],
    [-0.72, 0.68, 0.72, 0.72],
    [-0.72, -0.72, -0.68, 0.72],
    [0.68, -0.72, 0.72, 0.72],
  ]) {
    b.box(x0, 0.35, z0, x1, 0.38, z1, 0b111111);
  }
  for (const x of [-0.7, 0.7])
    for (const z of [-0.7, 0.7])
      b.box(x - 0.02, 0, z - 0.02, x + 0.02, 0.38, z + 0.02, 0b110011);
  return b.build({ part: true });
}

// (street r6) planted tree pit: soil bed with low ground cover / seasonal plantings (ivy, liriope, a few mums) and a
// taller black hairpin-picket guard on three sides (the curb side open), as NYC's adopted tree beds. Same 1.6 m pit.
export function treePitPlanted() {
  const b = new MeshBuilder(),
    r = mulberry32(777);
  b.setPart(MATERIAL_PART.BASE)
    .setColor(0x2e241b)
    .box(-0.72, 0.0, -0.72, 0.72, 0.06, 0.72, 0b000100);
  b.setColor(0x7a766e);
  for (const [x0, z0, x1, z1] of [
    [-0.8, -0.8, 0.8, -0.7],
    [-0.8, 0.7, 0.8, 0.8],
    [-0.8, -0.7, -0.7, 0.7],
    [0.7, -0.7, 0.8, 0.7],
  ])
    b.box(x0, -0.01, z0, x1, 0.05, z1, 0b110111);
  // ground-cover clumps (squashed 5-sided mounds), muted autumn greens / ochres, a few rust mums
  const pal = [
    0x3b4526, 0x46502c, 0x55532e, 0x6b5a2c, 0x4a3f24, 0x7a4a26, 0x8a6a2a,
  ];
  for (let k = 0; k < 22; k++) {
    const x = (r() - 0.5) * 1.22,
      z = (r() - 0.5) * 1.22;
    if (Math.hypot(x, z) < 0.2) continue;
    const s = 0.1 + r() * 0.13;
    b.setColor(pal[Math.floor(r() * (k < 16 ? 4 : pal.length))]).cyl(
      x,
      0.05,
      z,
      s,
      s * 0.35,
      0.06 + r() * 0.12,
      5,
      true,
      true,
    );
  }
  // hairpin guard: rail at 0.45 m on three sides + pickets every 0.16 m
  b.setColor(0x1b1d1c);
  const H = 0.46;
  for (const [x0, z0, x1, z1] of [
    [-0.76, -0.76, 0.76, -0.73],
    [-0.76, -0.76, -0.73, 0.76],
    [0.73, -0.76, 0.76, 0.76],
  ]) {
    b.box(x0, H - 0.025, z0, x1, H, z1, 0b111111);
    const alongX = x1 - x0 > z1 - z0,
      L = alongX ? x1 - x0 : z1 - z0;
    for (let u = 0.02; u <= L; u += 0.16) {
      const x = alongX ? x0 + u : (x0 + x1) / 2,
        z = alongX ? (z0 + z1) / 2 : z0 + u;
      b.box(x - 0.008, 0.04, z - 0.008, x + 0.008, H, z + 0.008, 0b110011);
    }
  }
  return b.build({ part: true });
}
