// @ts-nocheck
import * as THREE from "three";
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";
import { cityAmbient } from "../render/citylights.ts";
import { nightK } from "../render/daynight.ts";
import { createPlaceholderTexture } from "../render/placeholderTexture.ts";

// Shared values stay mutable so suit changes and async weave texture loads do not rebuild node graphs.
export const suitNodeUniforms = {
  enabled: TSL.uniform(0),
  red: TSL.uniform(new THREE.Vector3(1, 0, 0)),
  blue: TSL.uniform(new THREE.Vector3(0, 0, 1)),
  white: TSL.uniform(new THREE.Vector3(1)),
  black: TSL.uniform(new THREE.Vector3()),
  rough: TSL.uniform(new THREE.Vector4(-1, -1, -1, -1)),
  metal: TSL.uniform(new THREE.Vector4(-1, -1, -1, -1)),
  emissiveRed: TSL.uniform(new THREE.Vector3()),
  emissiveBlue: TSL.uniform(new THREE.Vector3()),
  emissiveWhite: TSL.uniform(new THREE.Vector3()),
  emissiveBlack: TSL.uniform(new THREE.Vector3()),
  emblemMode: TSL.uniform(0),
  emblemFront: TSL.uniform(new THREE.Vector3()),
  emblemBack: TSL.uniform(new THREE.Vector3()),
  emblemBackOn: TSL.uniform(0),
  emblemScale: TSL.uniform(new THREE.Vector2(0.075, 0.15)),
  symbiote: TSL.uniform(0),
  symBump: TSL.uniform(1),
  symWhite: TSL.uniform(new THREE.Vector3(0.72, 0.72, 0.75)),
  symMask: null,
  normalScale: TSL.uniform(new THREE.Vector2(1, 1)),
  fabricOn: TSL.uniform(0),
  fabricHex: null,
  fabricKnit: null,
  fabricParams: TSL.uniform(new THREE.Vector4(4096, 147, 0.85, 0.18)),
};

const bindings = new Set();
const assignUniform = (node, value) => {
  if (node.value?.copy && value?.copy) node.value.copy(value);
  else node.value = value;
};

export function syncSuitNodeUniforms(source) {
  const pairs = [
    ["enabled", "uSuitOn"], ["red", "uSuitR"], ["blue", "uSuitB"], ["white", "uSuitW"], ["black", "uSuitK"],
    ["rough", "uSuitRough"], ["metal", "uSuitMetal"], ["emissiveRed", "uSuitER"], ["emissiveBlue", "uSuitEB"],
    ["emissiveWhite", "uSuitEW"], ["emissiveBlack", "uSuitEK"], ["emblemMode", "uEmbMode"],
    ["emblemFront", "uEmbFront"], ["emblemBack", "uEmbBack"], ["emblemBackOn", "uEmbBackOn"],
    ["emblemScale", "uEmbScale"], ["symbiote", "uSym"], ["symBump", "uSymBump"], ["symWhite", "uSymW"],
  ];
  for (const [target, key] of pairs) assignUniform(suitNodeUniforms[target], source[key].value);
}

export function setSuitNodeMask(texture) {
  suitNodeUniforms.symMask = texture;
  for (const binding of bindings) {
    binding.symMask.value = texture || binding.emptyTexture;
    binding.symMaskSoft.value = texture || binding.emptyTexture;
  }
}

export function setSuitNodeNormalScale(scale) {
  if (scale) suitNodeUniforms.normalScale.value.copy(scale);
}

export function setSuitNodeFabric(active, hex = suitNodeUniforms.fabricHex, knit = suitNodeUniforms.fabricKnit) {
  suitNodeUniforms.fabricOn.value = active ? 1 : 0;
  suitNodeUniforms.fabricHex = hex || null;
  suitNodeUniforms.fabricKnit = knit || null;
  for (const binding of bindings) {
    binding.fabricHex.value = hex || binding.emptyTexture;
    binding.fabricKnit.value = knit || binding.emptyTexture;
  }
}

export function setSuitNodeMap(material, texture) {
  const binding = material?.userData?.suitNodeBinding;
  if (binding) binding.baseMap.value = texture || binding.emptyTexture;
}

const hash2 = (p) => TSL.fract(TSL.sin(TSL.dot(p, TSL.vec2(127.1, 311.7))).mul(43758.5453));
const hash3 = (p) => TSL.fract(TSL.sin(TSL.dot(p, TSL.vec3(127.1, 311.7, 74.7))).mul(43758.5453));
const valueNoise3 = (p) => {
  const cell = TSL.floor(p);
  const f = TSL.fract(p);
  const u = f.mul(f).mul(TSL.vec3(3).sub(f.mul(2)));
  const a = TSL.mix(hash3(cell), hash3(cell.add(TSL.vec3(1, 0, 0))), u.x);
  const b = TSL.mix(hash3(cell.add(TSL.vec3(0, 1, 0))), hash3(cell.add(TSL.vec3(1, 1, 0))), u.x);
  const c = TSL.mix(hash3(cell.add(TSL.vec3(0, 0, 1))), hash3(cell.add(TSL.vec3(1, 0, 1))), u.x);
  const d = TSL.mix(hash3(cell.add(TSL.vec3(0, 1, 1))), hash3(cell.add(TSL.vec3(1, 1, 1))), u.x);
  return TSL.mix(TSL.mix(a, b, u.y), TSL.mix(c, d, u.y), u.z).mul(2).sub(1);
};

const segmentDistance = (p, a, b) => {
  const pa = p.sub(a);
  const ba = b.sub(a);
  const h = TSL.dot(pa, ba).div(TSL.dot(ba, ba).max(1e-6)).clamp(0, 1);
  return pa.sub(ba.mul(h)).length();
};
const ellipseDistance = (p, center, radius) => p.sub(center).div(radius).length().sub(1).mul(TSL.min(radius.x, radius.y));
const spiderDistance = (p, center, scale, lineWidth) => {
  const q = p.sub(center).div(scale);
  const x = q.x.abs();
  const y = q.y;
  let d = TSL.min(
    ellipseDistance(TSL.vec2(x, y), TSL.vec2(0, 0.36), TSL.vec2(0.16, 0.2)),
    ellipseDistance(TSL.vec2(x, y), TSL.vec2(0, -0.12), TSL.vec2(0.23, 0.36)),
  );
  const w = lineWidth.div(scale);
  const lines = [
    [[0.08, 0.4], [0.42, 0.78], 1], [[0.42, 0.78], [0.36, 1.3], 0.8],
    [[0.12, 0.3], [0.62, 0.46], 1], [[0.62, 0.46], [0.92, 0.9], 0.8],
    [[0.12, 0.14], [0.64, 0.02], 1], [[0.64, 0.02], [0.96, -0.52], 0.8],
    [[0.1, 0.04], [0.46, -0.4], 1], [[0.46, -0.4], [0.44, -1.05], 0.8],
  ];
  for (const [a, b, width] of lines) {
    d = TSL.min(d, segmentDistance(TSL.vec2(x, y), TSL.vec2(...a), TSL.vec2(...b)).sub(w.mul(width)));
  }
  return d.mul(scale);
};

/** Converts the GLTF suit material once and supplies TSL equivalents of suit recolouring, emblems, and fabric detail. */
export function createSuitNodeMaterial(source) {
  if (source?.isNodeMaterial) return source;
  const material = new WEBGPU.MeshStandardNodeMaterial();
  material.copy(source);
  // This graph folds the source vertex tint into baseColor below. Keep
  // NodeMaterial from multiplying the same vertex colors again in diffuse setup.
  material.vertexColors = false;
  material.name = source.name;
  material.userData = { ...source.userData, suitNodeMaterial: true };
  const uv = TSL.uv();
  // Neutral one-pixel source keeps optional node samples valid before suit maps load.
  const emptyTexture = createPlaceholderTexture([0, 0, 148, 255], "suit-node-neutral");
  const baseMap = TSL.texture(source.map || emptyTexture, uv);
  const fabricHex = TSL.texture(suitNodeUniforms.fabricHex || emptyTexture, uv);
  const fabricKnit = TSL.texture(suitNodeUniforms.fabricKnit || emptyTexture, uv);
  const binding = { emptyTexture, baseMap, symMask: null, symMaskSoft: null, fabricHex, fabricKnit };
  bindings.add(binding);
  material.userData.suitNodeBinding = binding;

  const sourceColor = TSL.color(source.color || 0xffffff);
  const mapColor = source.map ? baseMap.rgb.mul(sourceColor) : sourceColor;
  const baseColor = source.vertexColors ? mapColor.mul(TSL.vertexColor().rgb) : mapColor;
  const lum = TSL.dot(baseColor, TSL.vec3(0.2126, 0.7152, 0.0722));
  const mx = TSL.max(baseColor.r, TSL.max(baseColor.g, baseColor.b));
  const mn = TSL.min(baseColor.r, TSL.min(baseColor.g, baseColor.b));
  const saturation = mx.sub(mn).div(mx.max(1e-4));
  const wR = TSL.smoothstep(0.03, 0.12, baseColor.r.sub(TSL.max(baseColor.g, baseColor.b)));
  const wB = TSL.smoothstep(0.015, 0.05, baseColor.b.sub(TSL.max(baseColor.r, baseColor.g))).mul(TSL.float(1).sub(wR));
  const wW = TSL.smoothstep(0.22, 0.42, lum)
    .mul(TSL.float(1).sub(TSL.smoothstep(0.18, 0.4, saturation)))
    .mul(TSL.float(1).sub(wR)).mul(TSL.float(1).sub(wB));
  const wK = TSL.float(1).sub(TSL.smoothstep(0.035, 0.12, lum))
    .mul(TSL.float(1).sub(wR)).mul(TSL.float(1).sub(wB)).mul(TSL.float(1).sub(wW));
  const classWeights = TSL.vec4(wR, wB, wW, wK);
  let remapped = TSL.mix(baseColor, suitNodeUniforms.red.mul(lum.div(0.066).clamp(0, 2.5)), wR);
  remapped = TSL.mix(remapped, suitNodeUniforms.blue.mul(lum.div(0.025).clamp(0, 2.5)), wB);
  remapped = TSL.mix(remapped, suitNodeUniforms.white.mul(lum.div(0.67).clamp(0, 1.5)), wW);
  remapped = TSL.mix(remapped, suitNodeUniforms.black.mul(lum.div(0.035).clamp(0.3, 2)), wK);

  // Bind-pose position/normal preserve the chest emblem as the animated mesh is skinned.
  const restPosition = TSL.varying(TSL.attribute("position", "vec3"), "vSuitRestPosition");
  const restNormal = TSL.normalize(TSL.varying(TSL.attribute("normal", "vec3"), "vSuitRestNormal"));
  const front = TSL.step(0.02, restPosition.z).mul(TSL.smoothstep(0.15, 0.45, restNormal.z)).mul(TSL.step(restPosition.x.abs(), 0.2));
  const frontCenter = TSL.vec2(0, TSL.float(1.345).sub(suitNodeUniforms.emblemScale.x.sub(0.075).mul(0.4)));
  const frontD = spiderDistance(restPosition.xy, frontCenter, suitNodeUniforms.emblemScale.x, suitNodeUniforms.emblemScale.x.mul(0.0048 / 0.075));
  const frontMask = front.mul(TSL.float(1).sub(TSL.smoothstep(-0.0015, 0.0015, frontD))).mul(suitNodeUniforms.emblemMode);
  const back = TSL.step(restPosition.z, 0).mul(TSL.smoothstep(0.15, 0.45, restNormal.z.negate())).mul(suitNodeUniforms.emblemBackOn);
  const backD = spiderDistance(restPosition.xy, TSL.vec2(0, 1.24), suitNodeUniforms.emblemScale.y, suitNodeUniforms.emblemScale.y.mul(0.009 / 0.15));
  const backMask = back.mul(TSL.float(1).sub(TSL.smoothstep(-0.0015, 0.0015, backD))).mul(suitNodeUniforms.emblemMode);
  remapped = TSL.mix(remapped, suitNodeUniforms.emblemFront, frontMask);
  remapped = TSL.mix(remapped, suitNodeUniforms.emblemBack, backMask);
  let suitWeights = TSL.mix(classWeights, TSL.vec4(0, 0, 0, 1), frontMask);
  suitWeights = TSL.mix(suitWeights, TSL.vec4(1, 0, 0, 0), backMask);

  const symUv = TSL.vec2(restPosition.x.add(0.32).div(0.64), restPosition.y.sub(0.92).div(0.64));
  const symMask = TSL.texture(suitNodeUniforms.symMask || emptyTexture, symUv);
  const symMaskSoft = TSL.texture(suitNodeUniforms.symMask || emptyTexture, symUv, TSL.float(1.5));
  binding.symMask = symMask;
  binding.symMaskSoft = symMaskSoft;
  const inRange = TSL.step(0, symUv.x).mul(TSL.step(symUv.x, 1)).mul(TSL.step(0, symUv.y)).mul(TSL.step(symUv.y, 1));
  const torso = TSL.step(restPosition.x.abs(), TSL.mix(0.16, 0.27, TSL.smoothstep(1.24, 1.46, restPosition.y)));
  const symSample = symMask.rg;
  const symSampleSoft = symMaskSoft.rg;
  const symFront = TSL.smoothstep(-0.012, 0.012, restPosition.z);
  const emblem = TSL.mix(symSample.y, symSample.x, symFront).mul(inRange).mul(torso);
  const emblemSoft = TSL.mix(symSampleSoft.y, symSampleSoft.x, symFront).mul(inRange).mul(torso);
  const q = restPosition.mul(13);
  const n1 = valueNoise3(q.add(3.1));
  const n2 = valueNoise3(q.mul(2.3).add(7.7));
  const n3 = valueNoise3(q.mul(0.5).add(1.7));
  const veins = TSL.max(TSL.smoothstep(0.72, 0.94, n1.abs()), TSL.max(TSL.smoothstep(0.74, 0.95, n2.abs()).mul(0.6), TSL.smoothstep(0.78, 0.97, n3.abs()).mul(0.85)))
    .mul(TSL.float(1).sub(TSL.smoothstep(0.2, 0.5, emblemSoft)));
  const sheenNoise = valueNoise3(restPosition.mul(5).add(2));
  let symColor = suitNodeUniforms.black.mul(TSL.float(0.75).add(sheenNoise.mul(0.3))).mul(TSL.vec3(0.95, 0.97, 1.08))
    .add(TSL.vec3(0.035, 0.038, 0.048).mul(veins));
  symColor = TSL.mix(symColor, suitNodeUniforms.symWhite.mul(TSL.float(0.82).add(TSL.smoothstep(0.6, 1, emblemSoft).mul(0.18))), emblem);
  const symGloss = TSL.smoothstep(-0.05, 0.45, valueNoise3(restPosition.mul(5.5).add(9)).add(valueNoise3(restPosition.mul(12).sub(2)).mul(0.5)))
    .mul(TSL.float(1).sub(emblem));
  const symWeights = TSL.vec4(symGloss.mul(TSL.float(1).sub(veins)), veins, emblem, TSL.float(1).sub(symGloss).mul(TSL.float(1).sub(veins)).mul(TSL.float(1).sub(emblem)));
  suitWeights = TSL.mix(suitWeights, symWeights, suitNodeUniforms.symbiote);
  remapped = TSL.mix(remapped, symColor, suitNodeUniforms.symbiote);
  const suitColor = TSL.mix(baseColor, remapped, suitNodeUniforms.enabled);

  // Advanced suit weave: baked-map registration keeps the hex and knit details aligned to the original fabric.
  const fabricParams = suitNodeUniforms.fabricParams;
  const fabPx = TSL.vec2(uv.x, TSL.float(1).sub(uv.y)).mul(fabricParams.x).sub(0.5);
  const hexUv = TSL.vec2(fabPx.y.div(23.094), fabPx.x.div(40));
  const knitUv = uv.mul(fabricParams.y);
  const hx = fabricHex.sample(hexUv).rgb;
  const kn = fabricKnit.sample(knitUv).rgb;
  const fabricFade = TSL.smoothstep(1.6, 4, TSL.float(5.7735).div(TSL.length(TSL.fwidth(fabPx)).max(1e-6)));
  const detailNoiseA = valueNoise3(restPosition.mul(5).add(1.7));
  const detailNoiseB = valueNoise3(restPosition.mul(16).sub(4.2));
  const redFabric = baseColor.mul(TSL.vec3(0.78, 0.84, 0.98)).mul(TSL.float(1).add(detailNoiseA.mul(0.16)).add(detailNoiseB.mul(0.06)));
  const cobalt = TSL.float(0.5).add(detailNoiseA.mul(0.5));
  const blueFabric = baseColor.mul(TSL.mix(TSL.vec3(0.78, 0.76, 0.8), TSL.vec3(1.05, 1.3, 1.2), cobalt)).mul(TSL.float(1).add(detailNoiseB.mul(0.06)));
  let fabricColor = baseColor.mul(TSL.float(1).add(detailNoiseB.mul(0.04))).mul(TSL.mix(1, 0.86, wW));
  fabricColor = TSL.mix(fabricColor, redFabric, wR);
  fabricColor = TSL.mix(fabricColor, blueFabric, wB);
  const cavity = TSL.dot(TSL.vec2(wR.add(wW.mul(0.5)), wB), TSL.vec2(hx.b.sub(0.62), kn.b.sub(0.55)));
  fabricColor = fabricColor.mul(TSL.float(1).add(fabricParams.w.mul(cavity)));
  const ao = source.aoMap ? TSL.texture(source.aoMap, uv).r : TSL.float(1);
  fabricColor = fabricColor.mul(TSL.mix(1, ao.mul(ao), 0.5));
  const colorWithFabric = TSL.mix(suitColor, fabricColor, suitNodeUniforms.fabricOn);
  material.colorNode = colorWithFabric;

  const baseRoughness = TSL.float(source.roughness ?? 1).mul(source.roughnessMap ? TSL.texture(source.roughnessMap, uv).g : 1);
  const sourceMetal = TSL.float(source.metalness ?? 0).mul(source.metalnessMap ? TSL.texture(source.metalnessMap, uv).b : 1);
  const suitRough = TSL.mix(TSL.vec4(baseRoughness), suitNodeUniforms.rough, TSL.step(TSL.vec4(0), suitNodeUniforms.rough));
  const suitMetal = TSL.mix(TSL.vec4(sourceMetal), suitNodeUniforms.metal, TSL.step(TSL.vec4(0), suitNodeUniforms.metal));
  const classWeight = suitWeights;
  const classTotal = TSL.dot(classWeight, TSL.vec4(1)).max(1e-3);
  const variantRoughness = TSL.dot(suitRough, classWeight).div(classTotal);
  const fabricRoughness = TSL.dot(TSL.vec4(
    TSL.float(0.58).add(TSL.float(1).sub(hx.b).mul(0.12)).add(detailNoiseA.mul(0.03)),
    TSL.float(0.64).add(TSL.float(1).sub(kn.b).mul(0.1)).add(detailNoiseA.mul(0.03)),
    TSL.float(0.42).add(TSL.float(1).sub(hx.b).mul(0.06)),
    TSL.float(0.4),
  ), classWeight).div(classTotal);
  material.roughnessNode = TSL.mix(TSL.mix(baseRoughness, variantRoughness, suitNodeUniforms.enabled), fabricRoughness, suitNodeUniforms.fabricOn);
  const variantMetal = TSL.dot(suitMetal, classWeight).div(classTotal);
  material.metalnessNode = TSL.mix(sourceMetal, variantMetal, suitNodeUniforms.enabled);

  const baseEmissive = source.emissiveMap
    ? TSL.texture(source.emissiveMap, uv).rgb.mul(TSL.color(source.emissive || 0xffffff)).mul(source.emissiveIntensity ?? 1)
    : TSL.color(source.emissive || 0x000000).mul(source.emissiveIntensity ?? 1);
  const suitEmissive = suitNodeUniforms.emissiveRed.mul(wR).add(suitNodeUniforms.emissiveBlue.mul(wB))
    .add(suitNodeUniforms.emissiveWhite.mul(wW)).add(suitNodeUniforms.emissiveBlack.mul(wK));
  const emissive = TSL.mix(baseEmissive, baseEmissive.add(suitEmissive), suitNodeUniforms.enabled);
  material.emissiveNode = emissive;

  const baseNormal = source.normalMap ? TSL.texture(source.normalMap, uv).rgb : TSL.vec3(0.5, 0.5, 1);
  const hexXY = hx.xy.mul(2).sub(1);
  const knitXY = kn.xy.mul(2).sub(1);
  const fabricNormalXY = TSL.vec2(hexXY.y.negate(), hexXY.x).mul(wR.add(wW.mul(0.45))).add(knitXY.mul(wB));
  const symNormalXY = TSL.vec2(
    TSL.sin(restPosition.y.mul(23).add(restPosition.z.mul(17))).mul(veins),
    TSL.cos(restPosition.x.mul(19).sub(restPosition.y.mul(13))).mul(veins),
  ).mul(suitNodeUniforms.symBump.mul(0.035));
  const normalXY = baseNormal.xy.mul(2).sub(1)
    .add(fabricNormalXY.mul(fabricParams.z).mul(fabricFade).mul(suitNodeUniforms.fabricOn))
    .add(symNormalXY.mul(suitNodeUniforms.symbiote));
  const normalSample = TSL.vec3(normalXY.mul(0.5).add(0.5), baseNormal.z);
  const normalScale = source.normalScale || new THREE.Vector2(1, 1);
  suitNodeUniforms.normalScale.value.copy(normalScale);
  material.normalNode = TSL.normalMap(normalSample, suitNodeUniforms.normalScale);

  // The fabric shader keeps the suit from being flooded by the night environment and adds local area bounce.
  const night = TSL.uniform(nightK.value).onRenderUpdate((_, self) => { self.value = nightK.value; });
  const lo = TSL.uniform(cityAmbient.lo.value).onRenderUpdate((_, self) => { self.value.copy(cityAmbient.lo.value); });
  const hi = TSL.uniform(cityAmbient.hi.value).onRenderUpdate((_, self) => { self.value.copy(cityAmbient.hi.value); });
  const worldNormal = TSL.normalize(TSL.normalWorld);
  const ambient = TSL.mix(lo, hi, worldNormal.y.mul(0.5).add(0.5))
    .mul(TSL.float(0.75).add(TSL.float(1).sub(worldNormal.y.abs()).mul(0.25)));
  const sourceAO = source.aoMap
    ? TSL.mix(1, TSL.texture(source.aoMap, uv).r, source.aoMapIntensity ?? 1)
    : TSL.float(1);
  material.aoNode = sourceAO.mul(TSL.mix(TSL.float(1), TSL.float(0.35), night));
  material.emissiveNode = emissive.add(ambient.mul(night).mul(0.1));
  material.userData.suitNodeNight = night;
  return material;
}
