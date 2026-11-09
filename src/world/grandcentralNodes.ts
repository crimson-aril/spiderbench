// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";
import { nightK } from "../render/daynight.ts";

const hash2 = (p) => TSL.fract(TSL.sin(TSL.dot(p, TSL.vec2(127.1, 311.7))).mul(43758.5453));
const nightUniform = () => {
  const node = TSL.uniform(nightK.value);
  node.onRenderUpdate(() => { node.value = nightK.value; });
  return node;
};

/** Node approximation of Grand Central's stone shader, keyed by MeshBuilder's aPart attribute. */
export function createGrandCentralStoneNodeMaterial(T) {
  // The custom colorNode samples vertexColor() itself.
  const material = new WEBGPU.MeshStandardNodeMaterial({ vertexColors: false, roughness: 0.86 });
  material.name = "GrandCentralStone.TSL";
  const p = TSL.positionWorld;
  const n = TSL.abs(TSL.normalize(TSL.normalWorld));
  const part = TSL.attribute("aPart", "float");
  const q = TSL.select(n.y.greaterThan(n.x).and(n.y.greaterThan(n.z)), TSL.vec2(p.x, p.z),
    TSL.select(n.x.greaterThan(n.z), TSL.vec2(p.z, p.y), TSL.vec2(p.x, p.y)));
  const noise = TSL.texture(T.noise, q.div(13)).rgb;
  const fineNoise = TSL.texture(T.noise, q.div(2.7).add(0.31)).rgb;
  const base = TSL.vertexColor().rgb;
  const row = TSL.floor(q.y.div(0.62));
  const col = q.x.div(1.25).add(TSL.mod(row, 2).mul(0.5));
  const cell = TSL.vec2(TSL.floor(col), row);
  const f = TSL.fract(TSL.vec2(col, q.y.div(0.62)));
  const edgeX = TSL.min(f.x, TSL.float(1).sub(f.x));
  const edgeY = TSL.min(f.y, TSL.float(1).sub(f.y));
  const joint = TSL.max(TSL.float(1).sub(TSL.smoothstep(0, 0.025, edgeX)), TSL.float(1).sub(TSL.smoothstep(0, 0.035, edgeY)));
  const stone = base.mul(TSL.float(0.94).add(hash2(cell).mul(0.07)))
    .mul(TSL.float(0.86).add(noise.r.mul(0.22)))
    .mul(TSL.float(0.94).add(fineNoise.g.mul(0.08)))
    .mul(TSL.float(1).sub(joint.mul(0.17)));
  const copperNoise = TSL.texture(T.noise, TSL.vec2(p.x.div(1.6), p.y.div(22)).add(0.61)).g;
  const copperPatina = TSL.smoothstep(0.35, 0.8, copperNoise);
  const copperBare = TSL.vec3(0.24, 0.2, 0.15).mul(TSL.float(0.8).add(fineNoise.b.mul(0.4)));
  const copperVerdigris = TSL.vec3(0.43, 0.52, 0.46).mul(TSL.float(0.82).add(noise.g.mul(0.3)));
  const copper = TSL.mix(copperBare, copperVerdigris, copperPatina).mul(TSL.float(0.9).add(fineNoise.r.mul(0.12)));
  const bronzeNoise = TSL.texture(T.noise, TSL.vec2(p.x.div(0.9), p.y.div(3)).add(p.z.mul(0.31))).g;
  const up = TSL.normalize(TSL.normalWorld).y.mul(0.5).add(0.5);
  const verdigris = TSL.smoothstep(0.45, 0.95, up).mul(0.75).add(TSL.smoothstep(0.5, 0.78, bronzeNoise).mul(0.35)).clamp(0, 1);
  const bronze = TSL.mix(base.mul(TSL.float(0.75).add(bronzeNoise.mul(0.45))), TSL.vec3(0.33, 0.45, 0.38), verdigris.mul(0.8));
  let color = stone;
  color = TSL.select(part.greaterThan(1.5).and(part.lessThan(2.5)), copper, color);
  color = TSL.select(part.greaterThan(7.5).and(part.lessThan(8.5)), bronze, color);
  color = TSL.select(part.greaterThan(0.5).and(part.lessThan(1.5)), base.mul(TSL.float(0.88).add(noise.r.mul(0.2))), color);
  color = TSL.select(part.greaterThan(2.5).and(part.lessThan(4.5)), base.mul(TSL.float(0.88).add(noise.r.mul(0.2))), color);
  color = TSL.select(part.greaterThan(3.5).and(part.lessThan(4.5)), base.mul(TSL.float(0.85).add(noise.r.mul(0.25))), color);
  color = TSL.select(part.greaterThan(5.5).and(part.lessThan(6.5)), base.mul(TSL.float(0.7).add(fineNoise.g.mul(0.5))), color);
  color = TSL.select(part.greaterThan(6.5).and(part.lessThan(7.5)), base.mul(TSL.float(0.78).add(noise.r.mul(0.3))), color);
  const grime = TSL.float(1).sub(TSL.smoothstep(0, 4, p.y).mul(0.18));
  material.colorNode = color.mul(grime);
  material.roughnessNode = TSL.select(part.greaterThan(1.5).and(part.lessThan(2.5)), TSL.float(0.66).add(copperPatina.mul(0.25)),
    TSL.select(part.greaterThan(7.5).and(part.lessThan(8.5)), TSL.float(0.55).add(verdigris.mul(0.3)),
      TSL.select(part.greaterThan(4.5).and(part.lessThan(5.5)), TSL.float(0.45), TSL.float(0.86))));
  material.metalnessNode = TSL.select(part.greaterThan(1.5).and(part.lessThan(2.5)), TSL.float(0.35).mul(TSL.float(1).sub(copperPatina)),
    TSL.select(part.greaterThan(7.5).and(part.lessThan(8.5)), TSL.float(0.55).mul(TSL.float(1).sub(verdigris)),
      TSL.select(part.greaterThan(4.5).and(part.lessThan(5.5)), TSL.float(0.45), TSL.float(0))));
  return material;
}

/** Keeps the terminal's glazing mullions and warm concourse visible on the node backend. */
export function createGrandCentralGlassNodeMaterial() {
  const material = new WEBGPU.MeshStandardNodeMaterial({ color: 0x4d5857, roughness: 0.1, metalness: 0.6 });
  material.name = "GrandCentralGlass.TSL";
  const uv = TSL.uv();
  const world = TSL.positionWorld;
  const normal = TSL.normalize(TSL.normalWorld);
  const gridUv = TSL.vec2(uv.x.mul(8), uv.y.mul(12));
  const f = TSL.abs(TSL.fract(gridUv).sub(0.5));
  const bars = TSL.max(TSL.float(1).sub(TSL.smoothstep(0.43, 0.49, f.x)), TSL.float(1).sub(TSL.smoothstep(0.43, 0.49, f.y)));
  const panes = TSL.floor(gridUv);
  const lit = hash2(panes.add(5.3)).greaterThan(0.8);
  const night = nightUniform();
  const interior = TSL.mix(TSL.vec3(0.035, 0.045, 0.05), TSL.vec3(0.68, 0.39, 0.2), night.mul(lit).mul(0.8));
  const view = TSL.abs(TSL.dot(TSL.normalize(TSL.cameraPosition.sub(world)), normal));
  const fresnel = TSL.float(0.08).add(TSL.pow(TSL.float(1).sub(view), 5).mul(0.45));
  material.colorNode = TSL.mix(interior, TSL.vec3(0.3, 0.36, 0.37), bars.mul(0.65));
  material.emissiveNode = TSL.vec3(1, 0.58, 0.3).mul(night).mul(lit).mul(TSL.float(1).sub(bars)).mul(0.65).mul(TSL.float(1).sub(fresnel));
  material.roughnessNode = TSL.mix(0.08, 0.6, bars);
  material.metalnessNode = TSL.mix(0.72, 0.2, bars);
  return material;
}

/** Node equivalent of the MetLife slab's per-bay tinted glass and shallow office interiors. */
export function createGrandCentralPodiumGlassNodeMaterial(Y0, floorHeight, bayWidth) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0x1c1d1c,
    roughness: 0.1,
    metalness: 0.85,
  });
  material.name = "GrandCentralPodiumGlass.TSL";
  const world = TSL.positionWorld;
  const normal = TSL.normalize(TSL.normalWorld);
  const tangent = TSL.normalize(TSL.cross(TSL.vec3(0, 1, 0), normal).add(TSL.vec3(1e-4)));
  const u = TSL.dot(world, tangent);
  const floor = world.y.sub(Y0).div(floorHeight);
  const fy = TSL.fract(floor);
  const fu = TSL.fract(u.div(bayWidth));
  const id = TSL.vec2(TSL.floor(u.div(bayWidth)).add(normal.x.mul(17)).add(normal.z.mul(31)), TSL.floor(floor));
  const h = hash2(id);
  const h2 = hash2(id.add(7.3));
  const h3 = hash2(TSL.vec2(TSL.floor(u.div(bayWidth * 3)), id.y).add(3.1));
  const fwU = TSL.fwidth(u.div(bayWidth)).add(1e-4);
  const fwY = TSL.fwidth(floor).add(1e-4);
  const mullX = TSL.float(1).sub(TSL.smoothstep(0.025, TSL.float(0.025).add(fwU.mul(1.5)), TSL.min(fu, TSL.float(1).sub(fu))));
  const mullY = TSL.float(1).sub(TSL.smoothstep(0.012, TSL.float(0.012).add(fwY.mul(1.5)), TSL.abs(fy.sub(0.235))));
  const mull = TSL.max(mullX, mullY);
  const span = TSL.float(1).sub(TSL.smoothstep(0.215, TSL.float(0.215).add(fwY), fy));
  let opaque = TSL.max(span, mull);
  const view = TSL.normalize(world.sub(TSL.cameraPosition));
  const cv = TSL.max(TSL.dot(view, normal.negate()), 0.06);
  const floorY = TSL.float(Y0).add(TSL.floor(floor).mul(floorHeight)).add(0.95);
  const ceilingY = floorY.add(2.85);
  const backDistance = TSL.float(6).div(cv);
  const ceilingDistance = TSL.select(view.y.greaterThan(0.001), ceilingY.sub(world.y).div(view.y), 1e5);
  const floorDistance = TSL.select(view.y.lessThan(-0.001), floorY.sub(world.y).div(view.y), 1e5);
  const lit = TSL.step(0.35, h3);
  const ceilingPoint = world.add(view.mul(ceilingDistance));
  const ceilingX = TSL.abs(TSL.fract(TSL.dot(ceilingPoint, tangent).div(1.5)).sub(0.5));
  const ceilingZ = TSL.abs(TSL.fract(TSL.dot(ceilingPoint, normal).div(2.4)).sub(0.5));
  const lightPanel = TSL.float(1).sub(TSL.smoothstep(0.12, 0.16, ceilingX))
    .mul(TSL.float(1).sub(TSL.smoothstep(0.3, 0.34, ceilingZ)));
  const ceiling = TSL.vec3(0.1).add(TSL.vec3(0.95, 0.97, 1).mul(lit).mul(0.55).mul(lightPanel));
  const floorPoint = world.add(view.mul(floorDistance));
  const floorInterior = TSL.vec3(0.06, 0.06, 0.065).mul(TSL.float(0.7).add(TSL.exp(floorDistance.mul(-0.2)).mul(0.6)));
  const backPoint = world.add(view.mul(backDistance));
  const bx = TSL.dot(backPoint, tangent);
  const backHash = hash2(TSL.vec2(TSL.floor(bx.div(4)), id.y));
  const desk = TSL.step(0, backPoint.y.sub(floorY)).mul(TSL.step(backPoint.y.sub(floorY), 0.78)).mul(TSL.step(0.25, TSL.fract(bx.div(2.6))));
  const back = TSL.mix(TSL.vec3(0.16, 0.16, 0.15), TSL.vec3(0.24, 0.22, 0.19), backHash)
    .mul(TSL.float(0.5).add(lit.mul(0.5)));
  const roomColor = TSL.select(ceilingDistance.lessThan(backDistance).and(ceilingDistance.lessThan(floorDistance)), ceiling,
    TSL.select(floorDistance.lessThan(backDistance), floorInterior, TSL.mix(back, TSL.vec3(0.05), desk.mul(0.8))));
  const blindAmount = TSL.select(h3.greaterThan(0.62), TSL.float(0.2).add(hash2(TSL.vec2(TSL.floor(u.div(bayWidth * 3)), id.y).add(1.9)).mul(3).floor().mul(0.25)), 0);
  const blind = TSL.step(TSL.float(1).sub(blindAmount), fy.sub(0.235).div(0.765));
  const slat = TSL.mix(0.92, TSL.float(0.85).add(TSL.step(0.5, TSL.fract(world.y.mul(18))).mul(0.15)), TSL.float(1).sub(TSL.smoothstep(0.15, 0.4, TSL.fwidth(world.y.mul(18)))));
  const blindColor = TSL.vec3(0.17, 0.155, 0.13).mul(slat).mul(TSL.float(0.9).add(h2.mul(0.15)));
  opaque = TSL.max(opaque, blind.mul(0.7));
  const glassColor = TSL.mix(TSL.vec3(0.1, 0.09, 0.075), TSL.vec3(0.17, 0.155, 0.13).mul(slat), blind.mul(0.85));
  const tint = TSL.mix(TSL.vec3(0.16), TSL.vec3(0.24, 0.22, 0.19), h);
  let color = TSL.mix(tint.mul(TSL.float(0.75).add(h.mul(0.5))), roomColor, TSL.float(1).sub(opaque));
  color = TSL.mix(color, glassColor, opaque);
  const fresnelView = TSL.max(TSL.dot(TSL.normalize(TSL.cameraPosition.sub(world)), normal), 0);
  const fresnel = TSL.float(0.06).add(TSL.pow(TSL.float(1).sub(fresnelView), 5).mul(0.94));
  material.colorNode = color;
  material.emissiveNode = roomColor.mul(TSL.float(1).sub(fresnel)).mul(TSL.float(1).sub(opaque)).mul(0.55);
  material.roughnessNode = TSL.mix(TSL.float(0.05).add(h.mul(h).mul(0.18)), 0.55, opaque);
  material.metalnessNode = TSL.mix(0.85, 0.25, opaque);
  return material;
}
