// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";
import { nightK } from "../../render/daynight.ts";

const hash = (p) => TSL.fract(TSL.sin(TSL.dot(p, TSL.vec2(127.1, 311.7))).mul(43758.5453));
const nightNode = () => {
  const n = TSL.uniform(nightK.value);
  n.onRenderUpdate(() => { n.value = nightK.value; });
  return n;
};

/** Distant borough blocks use encoded vertex colour markers for lit and glass facades. */
export function createFarMassNodeMaterial() {
  const material = new WEBGPU.MeshStandardNodeMaterial({ vertexColors: true, roughness: 0.85 });
  material.name = "FarCityMass.TSL";
  const raw = TSL.attribute("color", "vec3");
  const world = TSL.positionWorld;
  const marker = TSL.select(raw.b.greaterThan(15), TSL.float(20), TSL.select(raw.b.greaterThan(5), TSL.float(10), TSL.float(0)));
  const base = TSL.vec3(raw.r, raw.g, raw.b.sub(marker));
  const glass = raw.b.greaterThan(15);
  const wall = raw.b.greaterThan(5);
  const along = world.x.add(world.z);
  const night = nightNode();
  const hCoord = TSL.floor(TSL.vec2(along.div(2.4), world.y.sub(1.2).div(3.3)));
  const h = hash(hCoord);
  const hGlass = hash(TSL.floor(TSL.vec2(along.div(1.6), world.y.div(3.9))));
  const standardWindow = TSL.step(0.3, TSL.fract(world.y.sub(1.2).div(3.3)))
    .mul(TSL.step(TSL.fract(world.y.sub(1.2).div(3.3)), 0.82))
    .mul(TSL.step(0.28, TSL.fract(along.div(2.4))))
    .mul(TSL.step(TSL.fract(along.div(2.4)), 0.74));
  const glassFrame = TSL.max(
    TSL.float(1).sub(TSL.step(0.1, TSL.fract(along.div(1.6)))),
    TSL.float(1).sub(TSL.step(0.12, TSL.fract(world.y.div(3.9)))),
  );
  const glassColor = TSL.mix(
    TSL.vec3(0.1, 0.13, 0.16),
    TSL.vec3(0.34, 0.4, 0.46),
    TSL.smoothstep(0, 180, world.y).mul(0.6).add(hGlass.mul(0.25)),
  );
  const blockWindow = TSL.mix(
    base,
    TSL.vec3(0.07, 0.08, 0.095).mul(TSL.float(0.7).add(h.mul(0.9))),
    standardWindow,
  );
  const glassWindow = TSL.mix(glassColor, base.mul(0.9), glassFrame.mul(0.8));
  let color = TSL.select(glass, glassWindow, TSL.select(wall, blockWindow, base));
  const contact = TSL.float(0.62).add(TSL.smoothstep(0, 14, world.y.sub(1.2)).mul(0.38));
  color = color.mul(contact).mul(TSL.float(1).sub(night.mul(0.85)));
  material.colorNode = color;
  const lightHash = hash(hCoord.add(TSL.vec2(7.7, 2.9)));
  const regularGlow = TSL.vec3(1, 0.72, 0.42).mul(standardWindow).mul(TSL.step(0.85, lightHash)).mul(0.5);
  const glassGlow = TSL.vec3(0.8, 0.88, 1).mul(TSL.float(1).sub(glassFrame)).mul(TSL.step(0.8, hGlass.add(5.3))).mul(0.5);
  const glow = TSL.select(glass, glassGlow, regularGlow).mul(night).mul(1.4);
  material.emissiveNode = glow;
  return material;
}

export function createFarLandNodeMaterial(map) {
  const material = new WEBGPU.MeshStandardNodeMaterial({ roughness: 0.95, side: 2 });
  material.name = "FarLand.TSL";
  const uv = TSL.uv();
  const world = TSL.positionWorld;
  const p = TSL.vec2(world.x, world.z);
  const cell = TSL.vec2(96, 210);
  const q = p.div(cell);
  const id = TSL.floor(q);
  const f = TSL.fract(q);
  const r = hash(id);
  const neighborhood = hash(TSL.floor(p.div(1400)));
  const park = r.greaterThan(0.93).or(neighborhood.lessThan(0.1));
  let block = TSL.mix(TSL.vec3(0.29, 0.27, 0.25), TSL.vec3(0.4, 0.36, 0.32), r);
  block = TSL.select(park, TSL.vec3(0.26, 0.31, 0.22), block);
  const treeCover = hash(TSL.floor(p.div(38))).mul(0.6).add(hash(TSL.floor(p.div(330))).mul(0.4));
  block = TSL.mix(block, TSL.vec3(0.16, 0.19, 0.12), TSL.smoothstep(0.45, 0.8, treeCover).mul(0.75));
  const edge = TSL.min(TSL.min(f.x, TSL.float(1).sub(f.x)).mul(96), TSL.min(f.y, TSL.float(1).sub(f.y)).mul(210));
  const street = TSL.float(1).sub(TSL.smoothstep(5, 8, edge));
  let procedural = TSL.mix(block, TSL.vec3(0.2, 0.2, 0.21), street);
  const arterialDistance = TSL.min(
    TSL.abs(TSL.mod(p.x.sub(350).add(550), 1100).sub(550)),
    TSL.abs(TSL.mod(p.y.sub(180).add(475), 950).sub(475)),
  );
  procedural = TSL.mix(procedural, TSL.vec3(0.15, 0.15, 0.16), TSL.float(1).sub(TSL.smoothstep(11, 14, arterialDistance)));
  const inBounds = uv.x.greaterThanEqual(0).and(uv.x.lessThanEqual(1)).and(uv.y.greaterThanEqual(0)).and(uv.y.lessThanEqual(1));
  const edgeFade = TSL.smoothstep(0, 0.03, TSL.min(TSL.min(uv.x, TSL.float(1).sub(uv.x)), TSL.min(uv.y, TSL.float(1).sub(uv.y))));
  const baked = TSL.texture(map, uv).rgb;
  material.colorNode = TSL.mix(procedural, baked, TSL.select(inBounds, edgeFade, TSL.float(0)));
  return material;
}

/** World-position cliff stratification and talus, reduced to a low-cost node graph. */
export function createPalisadesCliffNodeMaterial(palY, farY) {
  const material = new WEBGPU.MeshStandardNodeMaterial({ color: 0xffffff, roughness: 0.93, side: 2 });
  material.name = "PalisadesCliff.TSL";
  const p = TSL.positionWorld;
  const u = p.z.mul(0.97).add(p.x.mul(0.24));
  const columnCoord = u.div(3.5);
  const column = TSL.floor(columnCoord);
  const seam = TSL.float(1).sub(TSL.smoothstep(0.015, 0.12, TSL.min(TSL.fract(columnCoord), TSL.float(1).sub(TSL.fract(columnCoord)))));
  const stoneNoise = hash(TSL.vec2(column, TSL.floor(p.y.mul(0.3))));
  let color = TSL.mix(TSL.vec3(0.15, 0.14, 0.13), TSL.vec3(0.23, 0.2, 0.17), hash(TSL.vec2(column, 0)))
    .mul(TSL.float(0.85).add(stoneNoise.mul(0.3)))
    .mul(TSL.float(1).sub(seam.mul(0.55)));
  const rust = TSL.smoothstep(0.55, 0.9, hash(TSL.vec2(u.mul(0.013), p.y.mul(0.02))));
  color = TSL.mix(color, TSL.vec3(0.36, 0.25, 0.18), rust.mul(0.5));
  const talusEdge = TSL.float(palY + 12).add(hash(TSL.vec2(u.mul(0.031), 1)).mul(12));
  const talus = TSL.float(1).sub(TSL.smoothstep(0, 4, p.y.sub(talusEdge)));
  const scrub = hash(TSL.vec2(u.mul(0.11), p.y.mul(0.05))).greaterThan(0.35);
  const wood = TSL.mix(TSL.vec3(0.07, 0.085, 0.045), TSL.vec3(0.14, 0.12, 0.06), hash(TSL.vec2(u.mul(0.4), p.y.mul(0.3))));
  color = TSL.mix(color, wood, talus.mul(scrub).mul(0.85));
  const greenLedging = TSL.smoothstep(farY + 16, farY + 40, p.y).mul(hash(TSL.vec2(u.mul(0.07), p.y.mul(0.05))).greaterThan(0.35));
  color = TSL.mix(color, TSL.vec3(0.14, 0.17, 0.08), greenLedging.mul(0.65));
  material.colorNode = color;
  return material;
}
