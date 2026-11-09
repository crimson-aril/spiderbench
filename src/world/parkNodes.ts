// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";

const hash = (p) => TSL.fract(TSL.sin(TSL.dot(p, TSL.vec2(127.1, 311.7))).mul(43758.5453));

export function createParkGlassRoofNodeMaterial() {
  const material = new WEBGPU.MeshStandardNodeMaterial({ color: 0x8fa2b0, roughness: 0.1, metalness: 0.2 });
  material.name = "ParkGlassRoof.TSL";
  const uv = TSL.uv();
  const family = TSL.attribute("aGV", "float");
  const pitch = TSL.select(family.lessThan(0.33), TSL.vec2(1.6, 1.1),
    TSL.select(family.lessThan(0.66), TSL.vec2(2.4, 1.5), TSL.vec2(1.2, 2.2)));
  const grid = uv.div(pitch);
  const fract = TSL.fract(grid);
  const id = TSL.floor(grid);
  const h = hash(id);
  const h2 = hash(id.add(17.3));
  const fw = TSL.fwidth(grid).mul(1.2);
  const barX = TSL.float(1).sub(TSL.smoothstep(0.03, TSL.float(0.03).add(fw.x), fract.x))
    .mul(TSL.float(1).sub(TSL.smoothstep(0.03, TSL.float(0.03).add(fw.x), TSL.float(1).sub(fract.x))));
  const barY = TSL.float(1).sub(TSL.smoothstep(0.045, TSL.float(0.045).add(fw.y), fract.y))
    .mul(TSL.float(1).sub(TSL.smoothstep(0.045, TSL.float(0.045).add(fw.y), TSL.float(1).sub(fract.y))));
  const frame = TSL.float(1).sub(barX.mul(barY));
  const familyId = TSL.fract(family.mul(7.13));
  const standard = TSL.mix(TSL.vec3(0.25, 0.29, 0.33), TSL.vec3(0.32, 0.35, 0.38), TSL.step(0.8, h)).mul(TSL.float(0.92).add(h2.mul(0.1)));
  const dark = TSL.mix(TSL.vec3(0.16, 0.2, 0.25), TSL.vec3(0.24, 0.28, 0.32), TSL.step(0.85, h)).mul(TSL.float(0.9).add(h2.mul(0.2)));
  const milky = TSL.mix(TSL.vec3(0.36, 0.38, 0.37), TSL.vec3(0.44, 0.45, 0.42), TSL.step(0.75, h)).mul(TSL.float(0.9).add(h2.mul(0.12)));
  let pane = TSL.select(familyId.lessThan(0.34), dark, TSL.select(familyId.lessThan(0.58), milky, standard));
  pane = pane.mul(TSL.float(0.82).add(TSL.smoothstep(0, 1, TSL.fract(uv.x.mul(0.021).add(family.mul(3)))).mul(0.3)));
  pane = pane.mul(TSL.float(1).sub(TSL.smoothstep(0.3, 1, TSL.fract(uv.y.mul(0.07).add(h.mul(0.3)))).mul(0.18)));
  const grime = hash(TSL.floor(uv.div(5)).add(family.mul(31)));
  const cluster = hash(id.mul(0.5).add(3.7));
  pane = pane.mul(TSL.float(1).sub(TSL.smoothstep(0.55, 0.95, grime.mul(0.6).add(cluster.mul(0.5))).mul(0.28)));
  pane = pane.mul(TSL.float(1).sub(TSL.float(1).sub(TSL.smoothstep(0, 0.22, fract.y)).mul(TSL.float(0.5).add(h2.mul(0.5))).mul(0.22)));
  pane = TSL.mix(pane, TSL.vec3(0.2, 0.18, 0.14), TSL.step(0.9, cluster).mul(0.18));
  material.colorNode = TSL.mix(pane, TSL.vec3(0.3, 0.31, 0.32), frame.mul(0.6));
  const glassRoughness = TSL.mix(TSL.mix(0.36, 0.5, TSL.step(0.8, h)), 0.6, frame);
  const darkRoughness = TSL.mix(0.5, 0.6, frame);
  const milkyRoughness = TSL.mix(0.72, 0.8, frame);
  material.roughnessNode = TSL.select(familyId.lessThan(0.34), darkRoughness, TSL.select(familyId.lessThan(0.58), milkyRoughness, glassRoughness));
  material.emissiveNode = TSL.vec3(0.018, 0.017, 0.015).mul(TSL.float(1).sub(frame)).mul(TSL.step(h2, 0.7));
  return material;
}

export function createParkCopingNodeMaterial(color = 0x69665f) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color,
    roughness: 0.9,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -2,
  });
  material.name = "ParkCoping.TSL";
  const uv = TSL.uv();
  const band = TSL.fract(uv.y.div(1.8));
  const joints = TSL.smoothstep(0, 0.04, band).mul(TSL.float(1).sub(TSL.smoothstep(0.96, 1, band)));
  const tone = hash(TSL.vec2(TSL.floor(uv.y.div(1.8)), 0));
  material.colorNode = TSL.color(color).mul(TSL.float(0.55).add(joints.mul(0.45)))
    .mul(TSL.float(0.85).add(tone.mul(0.25)))
    .mul(TSL.mix(0.8, 1, TSL.smoothstep(0, 0.25, uv.x)));
  return material;
}

export function createParkChainlinkNodeMaterial() {
  const material = new WEBGPU.MeshBasicNodeMaterial({
    color: 0x8a8d8e,
    transparent: true,
    depthWrite: false,
    side: 2,
  });
  material.name = "ParkChainlink.TSL";
  const uv = TSL.uv();
  const q = TSL.vec2(uv.x.add(uv.y), uv.x.sub(uv.y)).div(0.06);
  const f = TSL.abs(TSL.fract(q).sub(0.5));
  const wire = TSL.min(f.x, f.y);
  const fw = TSL.fwidth(q);
  const coverage = TSL.float(1).sub(TSL.smoothstep(0.06, TSL.float(0.06).add(TSL.max(fw.x, fw.y)), wire));
  const far = TSL.smoothstep(0.15, 0.6, TSL.max(fw.x, fw.y));
  const lattice = TSL.mix(coverage, TSL.float(0.42), far);
  const rail = TSL.step(TSL.abs(uv.y.sub(0.03)), 0.03)
    .max(TSL.step(TSL.abs(uv.y.sub(TSL.floor(uv.y.div(5).add(0.5)).mul(5))), 0.04));
  material.opacityNode = lattice.max(rail);
  material.maskNode = material.opacityNode.greaterThan(0.02);
  return material;
}

export function createParkHexPaverNodeMaterial(color = 0x575754) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color,
    roughness: 0.9,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -4,
  });
  material.name = "ParkHexPaver.TSL";
  const world = TSL.positionWorld;
  const p = TSL.vec2(world.x, world.z).div(0.23);
  const r = TSL.vec2(1, 1.7320508);
  const half = r.mul(0.5);
  const a = TSL.mod(p, r).sub(half);
  const b = TSL.mod(p.sub(half), r).sub(half);
  const g = TSL.select(TSL.dot(a, a).lessThan(TSL.dot(b, b)), a, b);
  const id = p.sub(g);
  const q = TSL.abs(g);
  const edge = TSL.float(0.5).sub(TSL.max(TSL.dot(q, TSL.normalize(r)), q.x));
  const fw = TSL.fwidth(p.x).mul(1.2);
  const mortar = TSL.float(1).sub(TSL.smoothstep(0.02, TSL.float(0.02).add(fw), edge));
  const far = TSL.smoothstep(0.08, 0.35, fw);
  const tone = TSL.float(0.86).add(hash(TSL.floor(id.mul(10).add(0.5))).mul(0.2));
  const grain = TSL.float(0.9).add(TSL.sin(world.x.mul(0.37).add(world.z.mul(0.21))).mul(TSL.sin(world.z.mul(0.13))).mul(0.1));
  material.colorNode = TSL.color(color).mul(TSL.mix(tone.mul(TSL.mix(1, 0.55, mortar)), 0.9, far)).mul(grain);
  return material;
}

export function createParkWalkwayNodeMaterial(color = 0x686765) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color,
    roughness: 0.9,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -4,
  });
  material.name = "ParkWalkway.TSL";
  const world = TSL.positionWorld;
  const p = TSL.vec2(world.x, world.z);
  const n1 = hash(TSL.floor(p.mul(0.35))).mul(0.6).add(hash(TSL.floor(p.mul(1.7))).mul(0.4));
  const n2 = hash(TSL.floor(p.mul(0.12).add(3)));
  const asphalt = TSL.color(color).mul(TSL.float(0.82).add(n1.mul(0.3)));
  material.colorNode = TSL.mix(asphalt, TSL.vec3(0.2, 0.2, 0.19), TSL.smoothstep(0.72, 0.8, n2).mul(0.5));
  return material;
}
