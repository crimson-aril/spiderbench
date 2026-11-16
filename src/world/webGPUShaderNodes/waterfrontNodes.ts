// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";

export function createCoastNodeMaterial(T, atlas, waterY) {
  // The custom colorNode samples vertexColor() itself.
  const material = new WEBGPU.MeshStandardNodeMaterial({ vertexColors: false, roughness: 0.88 });
  material.name = "WaterfrontCoast.TSL";
  const tile = TSL.attribute("aTile", "float").floor();
  const uv = TSL.uv();
  const world = TSL.positionWorld;
  const normal = TSL.normalize(TSL.normalWorld);
  const p = TSL.vec3(world.x, world.y, world.z);
  const pXZ = TSL.vec2(world.x, world.z);
  const noise = TSL.texture(T.noise, pXZ.div(47).add(TSL.vec2(world.y.mul(0.01)))).rgb;
  const atlasUv = TSL.vec2(TSL.mod(tile, 2).mul(0.5), TSL.float(0.5).sub(TSL.floor(tile.div(2)).mul(0.5)))
    .add(TSL.vec2(0.002)).add(TSL.fract(uv).mul(0.496));
  const atlasNode = TSL.texture(atlas, atlasUv);
  const atlasColor = TSL.pow(atlasNode.rgb, 0.92).mul(1.05);
  const streak = TSL.texture(T.noise, TSL.vec2(uv.x.mul(0.37).add(world.x.mul(0.003)), TSL.float(0.2).add(world.y.mul(0.006)))).r;
  const stoneColor = atlasColor.mul(TSL.float(1).sub(TSL.smoothstep(0.55, 0.85, streak).mul(TSL.float(1).sub(normal.y.abs())).mul(0.28)))
    .mul(TSL.float(0.86).add(noise.g.mul(0.28)));
  const lawnNoise = TSL.texture(T.noise, pXZ.div(9)).g;
  const lawn = TSL.mix(TSL.vec3(0.085, 0.115, 0.045), TSL.vec3(0.14, 0.15, 0.065), lawnNoise)
    .mul(TSL.float(0.85).add(noise.r.mul(0.3)))
    .mul(TSL.float(0.94).add(TSL.step(0.5, TSL.fract(world.x.div(3).add(world.z.div(7)))).mul(0.06)));
  const paveUv = pXZ.div(6);
  const paving = TSL.texture(T.sidewalkCol, paveUv).rgb;
  const hp = pXZ.div(TSL.vec2(0.9, 0.78));
  const row = TSL.floor(hp.y);
  const cu = TSL.fract(hp.x.add(TSL.mod(row, 2).mul(0.5)));
  const cv = TSL.fract(hp.y);
  const jointDistance = TSL.min(TSL.min(cu, TSL.float(1).sub(cu)), TSL.min(cv, TSL.float(1).sub(cv)));
  const joint = TSL.float(1).sub(TSL.smoothstep(0, 0.07, jointDistance));
  const fwp = TSL.fwidth(hp.x).mul(2).clamp(0, 1);
  const pavers = paving.mul(TSL.vec3(0.8, 0.77, 0.73))
    .mul(TSL.float(1).sub(joint.mul(TSL.float(1).sub(fwp)).mul(0.2)))
    .mul(TSL.float(0.9).add(noise.r.mul(0.2)));
  const ribU = uv.x.div(0.3);
  const ribV = uv.y.div(0.12);
  const ribQ = TSL.select(tile.lessThan(8.5), ribU, ribV);
  const ribF = TSL.fract(ribQ);
  const ribAA = TSL.fwidth(ribQ).clamp(0, 1);
  const ribProfile = TSL.float(0.82).add(TSL.smoothstep(0.35, 0.5, ribF).mul(TSL.float(1).sub(TSL.smoothstep(0.5, 0.65, ribF))).mul(0.3));
  const rib = TSL.mix(ribProfile, TSL.float(1), ribAA)
    .mul(TSL.float(0.85).add(noise.r.mul(0.25)))
    .mul(TSL.float(1).sub(TSL.smoothstep(0.6, 0.9, TSL.texture(T.noise, pXZ.div(9).add(world.y.mul(0.05))).g).mul(0.25)));
  const picketF = TSL.fract(uv.x.div(0.115));
  const picketAA = TSL.fwidth(uv.x.div(0.115));
  const picketMask = picketAA.greaterThanEqual(0.35).or(TSL.abs(picketF.sub(0.5)).lessThanEqual(TSL.float(0.09).add(picketAA)));
  let color = TSL.vertexColor().rgb;
  color = TSL.select(tile.lessThan(3.5), stoneColor, color);
  color = TSL.select(tile.greaterThan(4.5).and(tile.lessThan(5.5)), lawn, color);
  color = TSL.select(tile.greaterThan(5.5).and(tile.lessThan(6.5)), pavers, color);
  color = TSL.select(tile.greaterThan(7.5), rib, color);
  const wetY = world.y.sub(waterY);
  const wetTop = TSL.float(0.75).add(noise.b.mul(0.45));
  const wet = TSL.float(1).sub(TSL.smoothstep(wetTop.sub(0.35), wetTop, wetY));
  color = TSL.mix(color, color.mul(TSL.vec3(0.42, 0.47, 0.36)), wet.mul(0.85));
  color = color.mul(TSL.mix(1, 0.45, TSL.float(1).sub(TSL.smoothstep(-0.6, 0.05, wetY))));
  const distance = TSL.cameraPosition.sub(p).length();
  color = color.mul(TSL.mix(1, 0.82, TSL.smoothstep(250, 1100, distance)));
  material.colorNode = color;
  material.roughnessNode = TSL.select(tile.lessThan(3.5), TSL.float(0.9).sub(wet.mul(0.55)),
    TSL.select(tile.greaterThan(3.5).and(tile.lessThan(4.5)), TSL.float(0.55),
      TSL.select(tile.greaterThan(4.5).and(tile.lessThan(5.5)), TSL.float(0.95),
        TSL.select(tile.greaterThan(5.5).and(tile.lessThan(6.5)), TSL.float(0.86).sub(wet.mul(0.4)), TSL.float(0.6)))));
  const isPicket = tile.greaterThan(6.5).and(tile.lessThan(7.5));
  material.maskNode = tile.lessThan(6.5).or(tile.greaterThan(7.5)).or(isPicket.and(picketMask));
  material.userData.setAtlasTexture = (texture) => {
    atlasNode.value = texture;
  };
  return material;
}
