// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";
import * as THREE from "three";

const ROUGHNESS = [0.92, 0.95, 0.95, 0.6, 0.85, 0.85, 0.8, 0.95, 0.55, 0.9, 0.8, 0.5, 0.75, 0.95, 0.6, 0.22, 0.85, 0.12, 0.6];
const PONDS = [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0];
const SEAMS = [0, 0, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const TAR_PATCHES = [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0];

const tableNode = (index, values, fallback = 0) => {
  let value = TSL.float(fallback);
  for (let i = values.length - 1; i >= 0; i--) value = TSL.select(index.equal(i), TSL.float(values[i]), value);
  return value;
};
const hash = (p) => TSL.fract(TSL.sin(TSL.dot(p, TSL.vec2(12.9898, 78.233))).mul(43758.5453));
const floatGate = (condition) => TSL.select(condition, TSL.float(1), TSL.float(0));

/** Node version of roof-edge streaks, party-wall weathering and street-canyon occlusion. */
export function createRoofStreakNodeMaterial(noiseTexture) {
  const material = new WEBGPU.MeshBasicNodeMaterial({
    color: 0xffffff,
    transparent: true,
    premultipliedAlpha: true,
    depthWrite: false,
    toneMapped: false,
    fog: false,
    side: THREE.DoubleSide,
    blending: THREE.MultiplyBlending,
  });
  material.name = "CityRoofStreaks.TSL";
  const s = TSL.attribute("aS", "vec4");
  const t = TSL.attribute("aT", "vec4");
  const u = s.x;
  const d = s.y;
  const height = s.z;
  const strength = s.w;
  const distance = TSL.positionView.length();
  const n1 = TSL.texture(noiseTexture, TSL.vec2(u.div(11), 0.37)).r.mul(0.6)
    .add(TSL.texture(noiseTexture, TSL.vec2(u.div(3.1), 0.71)).g.mul(0.4));
  const n2 = TSL.texture(noiseTexture, TSL.vec2(u.div(0.9), d.div(70).add(0.13))).b.mul(0.7)
    .add(TSL.texture(noiseTexture, TSL.vec2(u.div(0.37), d.div(30).add(0.61))).r.mul(0.3));
  const streakLength = height.mul(TSL.float(0.2).add(TSL.smoothstep(0.3, 0.75, n1).mul(1.1)));
  const streak = TSL.smoothstep(0.44, 0.62, n2).mul(TSL.float(1).sub(TSL.smoothstep(0, streakLength, d)));
  const band = TSL.float(1).sub(TSL.smoothstep(0, TSL.float(0.3).add(n1.mul(0.6)), d));
  const wash = TSL.float(1).sub(TSL.smoothstep(0, height.mul(0.8), d));
  const nearFade = TSL.mix(0.35, 1, TSL.smoothstep(45, 200, distance));
  const roofFade = TSL.smoothstep(820, 450, distance).mul(nearFade);
  const dark = strength.mul(streak.mul(0.75).add(band.mul(0.5)).add(wash.mul(0.2)).clamp(0, 0.8)).mul(roofFade);
  let color = TSL.vec3(1).sub(dark.mul(TSL.vec3(0.8, 0.85, 0.93)));

  const facade = TSL.texture(noiseTexture, TSL.vec2(u.div(19).add(0.21), d.div(23).add(0.47))).g.mul(0.7)
    .add(TSL.texture(noiseTexture, TSL.vec2(u.div(6).add(0.6), d.div(7.5).add(0.1))).r.mul(0.3));
  const blot = TSL.smoothstep(0.45, 0.8, facade);
  const patchCoord = TSL.vec2(u.div(4.3), d.div(3.1));
  const patchCell = TSL.floor(patchCoord);
  const patchLocal = TSL.fract(patchCoord);
  const patchHash = TSL.fract(TSL.sin(TSL.dot(patchCell, TSL.vec2(12.9898, 78.233)).add(t.w.mul(17))).mul(43758.5453));
  const patchMask = patchHash.lessThan(0.12)
    .and(patchLocal.x.greaterThan(0.1)).and(patchLocal.x.lessThan(0.9))
    .and(patchLocal.y.greaterThan(0.15)).and(patchLocal.y.lessThan(0.85));
  const patchValue = TSL.select(patchMask, TSL.float(0.8).add(patchHash.mul(1.2)), 1);
  const ghostLength = TSL.fract(TSL.sin(t.w.mul(91.7)).mul(4375.5)).mul(height).mul(0.7).add(2);
  const ghost = TSL.float(1).sub(TSL.smoothstep(0, 0.25, d.sub(ghostLength).abs()))
    .mul(TSL.step(0.5, TSL.fract(t.w.mul(7.3))));
  const facadeFade = TSL.smoothstep(900, 500, distance);
  const facadeTint = TSL.mix(TSL.vec3(1), t.rgb, facadeFade);
  const facadeDirt = t.w.mul(facadeFade).mul(blot.mul(0.28).add(ghost.mul(0.3)));
  const facadeColor = color.mul(facadeTint)
    .mul(TSL.float(1).sub(facadeDirt))
    .mul(TSL.mix(1, patchValue, facadeFade));
  color = TSL.select(t.w.greaterThan(0), facadeColor, color);

  const canyon = TSL.float(1).sub(TSL.smoothstep(1100, 500, distance));
  const canyonUv = TSL.vec2(u.div(9).add(0.3), d.div(5).add(0.8));
  const canyonNoise = TSL.texture(noiseTexture, canyonUv).g;
  const canyonHeight = d.div(height.max(1)).clamp(0, 1);
  const canyonColor = TSL.vec3(1).sub(strength.mul(canyonHeight.mul(canyonHeight))
    .mul(TSL.float(0.85).add(canyonNoise.mul(0.3)))
    .mul(TSL.vec3(0.52, 0.54, 0.58)).mul(canyon).mul(nearFade));
  color = TSL.select(t.w.lessThan(0), canyonColor, color);
  material.colorNode = color;
  return material;
}

/** NodeMaterial roof fabric. The merged roof mesh retains the same atlas-layer and per-roof boundary attributes. */
export function createRoofNodeMaterial(colorAtlas, normalAtlas, noiseTexture) {
  // The colorNode reads vertexColor() directly, so automatic vertex color
  // multiplication would apply the vertex tint twice.
  const material = new WEBGPU.MeshStandardNodeMaterial({ vertexColors: false, roughness: 0.9, metalness: 0 });
  material.name = "CityRoofFabric.TSL";
  const uv = TSL.uv();
  const meta = TSL.attribute("aM", "vec4");
  const edge = TSL.attribute("aE", "vec4");
  const world = TSL.positionWorld;
  const normal = TSL.normalize(TSL.normalWorld);
  const cell = TSL.floor(meta.x.add(0.5));
  const safeCell = cell.clamp(0, 18);
  const roofUv = uv.mul(meta.y);
  const colorLayer = TSL.texture(colorAtlas, roofUv).depth(safeCell).rgb;
  const normalLayer = TSL.texture(normalAtlas, roofUv).depth(safeCell);
  const worldXZ = TSL.vec2(world.x, world.z);
  const noiseA = TSL.texture(noiseTexture, worldXZ.div(70).add(world.y.div(130))).rgb;
  const noiseB = TSL.texture(noiseTexture, worldXZ.div(13).add(0.37)).rgb;
  const roof = cell.greaterThanEqual(0);
  const isPool = meta.w.greaterThan(0.5);
  let color = TSL.vertexColor().rgb;
  color = TSL.select(roof, color.mul(colorLayer), color);
  const poolNoise = TSL.texture(noiseTexture, worldXZ.div(3)).g;
  const poolColor = TSL.vec3(0.09, 0.3, 0.34).mul(TSL.float(0.85).add(poolNoise.mul(0.3)));
  color = TSL.select(isPool, poolColor, color);

  const cellIndex = cell;
  const isEpdm = cellIndex.equal(12);
  color = TSL.select(isEpdm, color.mul(1.5), color);
  const isRoofSkin = roof.and(meta.z.greaterThan(0));
  const minEdge = TSL.min(TSL.min(uv.x.sub(edge.x), edge.z.sub(uv.x)), TSL.min(uv.y.sub(edge.y), edge.w.sub(uv.y)));
  const edgeWeather = minEdge.add(noiseB.b.sub(0.5).mul(0.9));
  const weatherScale = TSL.mix(0.4, 1, TSL.smoothstep(0, meta.z.mul(2.2), edgeWeather));
  color = TSL.select(isRoofSkin, color.mul(weatherScale), color);
  const grimeTint = TSL.mix(TSL.vec3(0.93, 0.9, 0.84), TSL.vec3(1), TSL.smoothstep(0, meta.z.mul(4), edgeWeather));
  color = TSL.select(isRoofSkin, color.mul(grimeTint), color);

  const roofSize = TSL.max(edge.zw.sub(edge.xy), TSL.vec2(1));
  const roofLocal = uv.sub(edge.xy).div(roofSize);
  const roofAngle = hash(TSL.floor(edge.xy.mul(0.37))).mul(Math.PI * 2);
  const gradientDirection = TSL.vec2(TSL.cos(roofAngle), TSL.sin(roofAngle));
  const gradient = TSL.dot(roofLocal.sub(0.5), gradientDirection);
  const gradientAmount = TSL.float(0.08).add(hash(TSL.floor(edge.zw)).mul(0.12));
  const sumpPoint = edge.xy.add(roofSize.mul(TSL.vec2(
    TSL.float(0.25).add(hash(TSL.floor(edge.xy).add(1.7)).mul(0.5)),
    TSL.float(0.25).add(hash(TSL.floor(edge.zw).add(2.9)).mul(0.5)),
  )));
  const sumpDistance = uv.sub(sumpPoint).length().add(noiseB.r.sub(0.5).mul(1.6));
  const sumpRadius = TSL.float(2.6).add(hash(TSL.floor(edge.xy).add(4.1)).mul(1.5));
  const sump = TSL.float(1).sub(TSL.smoothstep(0.4, sumpRadius, sumpDistance));
  color = TSL.select(isRoofSkin, color.mul(TSL.float(1).sub(gradientAmount.mul(TSL.smoothstep(-0.55, 0.55, gradient)))), color);
  color = TSL.select(isRoofSkin, color.mul(TSL.float(1).sub(sump.mul(0.3))), color);

  const seamWidth = tableNode(cellIndex, SEAMS);
  const seamCoord = uv.x.div(seamWidth.max(0.001));
  const seamFraction = TSL.fract(seamCoord);
  const seamAA = TSL.fwidth(seamCoord).mul(1.2).add(0.02);
  const seamMask = TSL.float(1).sub(TSL.smoothstep(0, seamAA, TSL.min(seamFraction, TSL.float(1).sub(seamFraction))));
  const hasSeam = seamWidth.greaterThan(0).and(SEAMS.length > 0);
  color = TSL.select(isRoofSkin.and(hasSeam), color.mul(TSL.float(1).sub(seamMask.mul(0.3))), color);

  const tarPatchNoise = TSL.texture(noiseTexture, worldXZ.div(7).add(TSL.vec2(0.23, 0.71))).r.mul(0.65)
    .add(TSL.texture(noiseTexture, TSL.vec2(world.z, world.x).div(29).add(0.5)).g.mul(0.35));
  const tarPatch = TSL.smoothstep(0.64, 0.66, tarPatchNoise);
  const hasTar = tableNode(cellIndex, TAR_PATCHES).greaterThan(0.5);
  const tarColor = color.mul(0.28).add(0.012);
  color = TSL.select(isRoofSkin.and(hasTar), TSL.mix(color, tarColor, tarPatch.mul(0.85)), color);

  const stainsA = TSL.texture(noiseTexture, worldXZ.div(41).add(0.13)).rgb;
  const stainsB = TSL.texture(noiseTexture, TSL.vec2(world.z, world.x).div(17).add(0.71)).rgb;
  const stain = TSL.smoothstep(0.52, 0.8, stainsA.g.mul(0.55).add(stainsB.r.mul(0.45)));
  color = TSL.select(isRoofSkin, color.mul(TSL.float(1).sub(stain.mul(0.26))), color);
  color = TSL.select(isRoofSkin, color.mul(TSL.mix(TSL.vec3(1), TSL.vec3(1.03, 1, 0.95), TSL.smoothstep(0.55, 0.85, stainsB.b))), color);

  const pondEnabled = tableNode(cellIndex, PONDS).greaterThan(0.5);
  const pondMask = pondEnabled.and(isRoofSkin);
  const pondGate = TSL.select(pondMask, TSL.float(1), TSL.float(0));
  const pondNoise = TSL.texture(noiseTexture, worldXZ.div(9).add(TSL.vec2(0.61, 0.27))).b.mul(0.7).add(stainsA.r.mul(0.3));
  const pond = TSL.smoothstep(0.66, 0.72, pondNoise).mul(pondGate);
  color = TSL.mix(color, color.mul(TSL.float(1).sub(pond.mul(0.32))).mul(TSL.float(1).add(TSL.smoothstep(0.6, 0.66, pondNoise).sub(TSL.smoothstep(0.66, 0.72, pondNoise)).mul(0.1))), pondGate);
  material.colorNode = color;

  let roughness = tableNode(cellIndex, ROUGHNESS, 0.85);
  roughness = TSL.mix(roughness, TSL.float(0.08), isPool);
  const roofSkinGate = floatGate(isRoofSkin);
  const tarGate = floatGate(hasTar);
  roughness = TSL.mix(roughness, TSL.float(0.35), sump.mul(0.6).mul(roofSkinGate));
  roughness = TSL.mix(roughness, TSL.float(0.5), tarPatch.mul(0.5).mul(tarGate).mul(roofSkinGate));
  roughness = TSL.mix(roughness, TSL.float(0.18), pond);
  material.roughnessNode = roughness;

  // The packed roof atlas carries tangent-space normals. NodeNormalMap keeps this detail
  // inside the standard TSL material path for both WebGPU and its WebGL2 backend.
  const normalNode = TSL.normalMap(normalLayer, TSL.vec2(0.8, 0.8));
  material.normalNode = TSL.mix(
    normalNode,
    TSL.vec3(0, 0, 1),
    roof.not().or(isPool).or(pond.greaterThan(0.5)),
  );
  return material;
}
