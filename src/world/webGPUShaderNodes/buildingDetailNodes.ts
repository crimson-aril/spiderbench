// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";

const hash = (p) => TSL.fract(TSL.sin(TSL.dot(p, TSL.vec2(91.7, 127.1))).mul(43758.5453));

/** NodeMaterial version of the shared roof / street-detail part material. */
export function createBuildingDetailNodeMaterial(T) {
  // The custom colorNode samples vertexColor() itself.
  const material = new WEBGPU.MeshStandardNodeMaterial({ vertexColors: false, roughness: 0.75, metalness: 0.1 });
  material.name = "CityBuildingDetail.TSL";
  const part = TSL.attribute("aPart", "float").round();
  const world = TSL.positionWorld;
  const normal = TSL.normalize(TSL.normalWorld);
  const absN = TSL.abs(normal);
  const q = TSL.select(absN.y.greaterThan(0.6), TSL.vec2(world.x, world.z),
    TSL.select(absN.x.greaterThan(absN.z), TSL.vec2(world.z, world.y), TSL.vec2(world.x, world.y)));
  const noise = TSL.texture(T.noise, q.div(7)).rgb;
  const fine = TSL.texture(T.noise, q.div(1.3)).rgb;
  const base = TSL.vertexColor().rgb;
  const grime = TSL.smoothstep(0.35, 0.8, noise.r).mul(0.35);
  let color = base.mul(TSL.float(1).sub(grime.mul(0.5)));
  let roughness = TSL.float(0.7);
  let metalness = TSL.float(0);

  const st = TSL.fract(TSL.uv().x.mul(48));
  const seam = TSL.smoothstep(0, 0.06, st).mul(TSL.float(1).sub(TSL.smoothstep(0.94, 1, st)));
  const board = hash(TSL.vec2(TSL.floor(TSL.uv().x.mul(48)), 0));
  const timber = base.mul(TSL.float(0.75).add(board.mul(0.35)))
    .mul(TSL.mix(0.55, 1, seam))
    .mul(TSL.float(0.8).add(fine.b.mul(0.4)))
    .mul(TSL.mix(TSL.vec3(1), TSL.vec3(0.88, 0.9, 0.88), TSL.smoothstep(0.4, 0.9, noise.g)));
  color = TSL.select(part.equal(1), timber, color);
  roughness = TSL.select(part.equal(1), TSL.float(0.85), roughness);

  const warmMetal = base.mul(TSL.mix(TSL.vec3(1), TSL.vec3(1.25, 0.92, 0.75), TSL.smoothstep(0.55, 0.85, fine.g).mul(0.5)));
  color = TSL.select(part.equal(2), warmMetal, color);
  roughness = TSL.select(part.equal(2), TSL.float(0.5).add(fine.r.mul(0.3)), roughness);
  metalness = TSL.select(part.equal(2), TSL.float(0.7), metalness);

  const glass = TSL.mix(TSL.vec3(0.02, 0.025, 0.03), TSL.vec3(0.2), TSL.smoothstep(0.6, 0.95, fine.g).mul(0.5));
  color = TSL.select(part.equal(3), glass, color);
  roughness = TSL.select(part.equal(3), TSL.float(0.06).add(TSL.smoothstep(0.5, 0.9, fine.g).mul(0.25)), roughness);

  color = TSL.select(part.equal(4), base.mul(TSL.float(0.9).add(fine.b.mul(0.2))), color);
  roughness = TSL.select(part.equal(4), TSL.float(0.9), roughness);
  color = TSL.select(part.equal(5), base.mul(TSL.float(0.9).add(fine.r.mul(0.15))), color);
  roughness = TSL.select(part.equal(5), TSL.float(0.85), roughness);
  roughness = TSL.select(part.equal(6), TSL.float(0.35).add(fine.g.mul(0.25)), roughness);
  metalness = TSL.select(part.equal(6), TSL.float(0.85), metalness);
  color = TSL.select(part.equal(7), base.mul(TSL.float(0.9).add(fine.b.mul(0.2))).mul(TSL.float(1).sub(TSL.smoothstep(0.5, 0.9, noise.g).mul(0.3))), color);
  roughness = TSL.select(part.equal(7).or(part.equal(8)), TSL.float(0.85), roughness);

  const grateX = TSL.abs(TSL.fract(world.x.div(0.03)).sub(0.5)).mul(0.03);
  const grateZ = TSL.abs(TSL.fract(world.z.div(0.1)).sub(0.5)).mul(0.1);
  const grateBar = grateX.greaterThan(0.011).or(grateZ.greaterThan(0.03));
  material.maskNode = part.notEqual(9).or(absN.y.lessThanEqual(0.6)).or(grateBar);
  color = TSL.select(part.equal(9), base.mul(TSL.mix(TSL.vec3(1), TSL.vec3(1.2, 0.92, 0.75), TSL.smoothstep(0.55, 0.85, fine.g).mul(0.4))), color);
  roughness = TSL.select(part.equal(9), TSL.float(0.55).add(fine.r.mul(0.25)), roughness);
  metalness = TSL.select(part.equal(9), TSL.float(0.6), metalness);
  roughness = TSL.select(part.equal(10), TSL.float(0.5).add(fine.r.mul(0.3)), roughness);
  metalness = TSL.select(part.equal(10), TSL.float(0.7), metalness);

  material.colorNode = color.mul(0.85).add(TSL.vec3(TSL.dot(color, TSL.vec3(0.2126, 0.7152, 0.0722)).mul(0.15)));
  material.roughnessNode = roughness;
  material.metalnessNode = metalness;
  return material;
}
