// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";

const band = (u, center, halfWidth, aa) => TSL.float(1).sub(TSL.smoothstep(halfWidth.sub(aa), halfWidth.add(aa), u.sub(center).abs()));

export function createHighwayNodeMaterial(T, HW) {
  const material = new WEBGPU.MeshStandardNodeMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0 });
  material.name = "CityHighway.TSL";
  const uv = TSL.attribute("aHw", "vec2");
  const world = TSL.positionWorld;
  const p = TSL.vec2(world.x, world.z);
  const noise = TSL.texture(T.noise, p.div(53)).rgb;
  const macro = TSL.texture(T.asphaltMacro, p.div(70)).rgb;
  let color = TSL.texture(T.asphaltCol, p.div(6)).rgb.mul(0.92)
    .mul(TSL.float(0.84).add(macro.r.mul(0.3)))
    .mul(TSL.float(0.93).add(noise.r.mul(0.14)));
  const laneOffset = TSL.mod(uv.x.sub(HW.SH), HW.LANE).sub(HW.LANE / 2);
  const tracks = TSL.exp(TSL.pow(laneOffset.abs().sub(0.85).div(0.3), 2).negate());
  const distance = TSL.cameraPosition.sub(world).length();
  color = color.mul(TSL.float(1).sub(tracks.mul(0.12)))
    .mul(TSL.mix(1, 0.7, TSL.smoothstep(90, 700, distance)));
  const medianStart = HW.SH + 3 * HW.LANE;
  const medianEnd = medianStart + HW.MED;
  const medianInside = uv.x.greaterThan(medianStart + 0.25).and(uv.x.lessThan(medianEnd - 0.25));
  const kerbInside = uv.x.greaterThan(medianStart).and(uv.x.lessThan(medianEnd));
  const grassNoise = TSL.texture(T.noise, p.div(7)).g;
  const grass = TSL.mix(TSL.vec3(0.16, 0.18, 0.1), TSL.vec3(0.2, 0.18, 0.13), grassNoise)
    .mul(TSL.float(0.85).add(noise.b.mul(0.3)));
  const kerb = TSL.vec3(0.46, 0.45, 0.42).mul(TSL.float(0.9).add(noise.g.mul(0.2)));
  const aa = TSL.max(TSL.fwidth(uv.x), TSL.float(1e-3));
  const dash = TSL.step(TSL.mod(uv.y, 12), 3);
  let paint = band(uv.x, HW.SH - 0.1, TSL.float(0.075), aa)
    .add(band(uv.x, HW.W - HW.SH + 0.1, TSL.float(0.075), aa));
  for (let j = 1; j < 3; j++) {
    paint = paint.add(dash.mul(band(uv.x, HW.SH + j * HW.LANE, TSL.float(0.06), aa)))
      .add(dash.mul(band(uv.x, medianEnd + j * HW.LANE, TSL.float(0.06), aa)));
  }
  paint = paint.clamp(0, 1);
  const yellow = band(uv.x, medianStart - 0.2, TSL.float(0.055), aa)
    .add(band(uv.x, medianEnd + 0.2, TSL.float(0.055), aa)).clamp(0, 1);
  const wear = TSL.float(0.75).add(TSL.smoothstep(0.3, 0.7, TSL.texture(T.noise, p.div(3.1)).r).mul(0.25));
  color = TSL.mix(color, TSL.vec3(0.86, 0.86, 0.83).mul(0.85), paint.mul(wear).mul(0.85));
  color = TSL.mix(color, TSL.vec3(0.72, 0.55, 0.16).mul(0.85), yellow.mul(wear).mul(0.85));
  color = color.mul(TSL.float(1).sub(TSL.float(1).sub(TSL.smoothstep(0, 0.6, uv.x)).mul(0.2)))
    .mul(TSL.float(1).sub(TSL.float(1).sub(TSL.smoothstep(0, 0.6, TSL.float(HW.W).sub(uv.x))).mul(0.2)));
  material.colorNode = TSL.select(medianInside, grass, TSL.select(kerbInside, kerb, color));
  material.roughnessNode = TSL.select(medianInside, 0.95, TSL.select(kerbInside, 0.8, TSL.mix(0.9, 0.6, paint)));
  return material;
}
