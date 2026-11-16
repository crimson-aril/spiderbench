// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";
import * as THREE from "three";

function liveUniform(source) {
  const node = TSL.uniform(source.value);
  node.onRenderUpdate(() => {
    node.value = source.value;
  });
  return node;
}

function makeAdditiveMaterial() {
  return new WEBGPU.MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
    toneMapped: false,
  });
}

/** TSL equivalent of the instanced neon-frame shader, including tube extrusion. */
export function createNeonTubeNodeMaterial(uni) {
  const mat = makeAdditiveMaterial();
  mat.name = "NeonTubes.TSL";
  mat.side = THREE.DoubleSide;

  const uNight = liveUniform(uni.uNeonK);
  const uScreen = liveUniform(uni.uNeonS);
  const uSettings = TSL.uniform(uni.uNeon.value);
  const shape = TSL.attribute("aS", "vec4");
  const origin = TSL.attribute("iO", "vec3");
  const tangent = TSL.attribute("iT", "vec3");
  const vertical = TSL.attribute("iV", "vec3");
  const dims = TSL.attribute("iD", "vec4");
  const tint = TSL.attribute("iC", "vec4");
  const side = TSL.floor(shape.x.add(0.5));
  const width = dims.x;
  const height = dims.y;
  const radius = dims.z;
  const side0 = side.lessThan(0.5);
  const side1 = side.greaterThan(0.5).and(side.lessThan(1.5));
  const side2 = side.greaterThan(1.5).and(side.lessThan(2.5));
  const dx = TSL.select(side0, TSL.float(1), TSL.select(side2, TSL.float(-1), TSL.float(0)));
  const dy = TSL.select(side1, TSL.float(1), TSL.select(side.greaterThan(2.5), TSL.float(-1), TSL.float(0)));
  const start = TSL.vec2(TSL.select(side1.or(side2), width, TSL.float(0)), TSL.select(side2, height, TSL.float(0)));
  const length = TSL.select(side0.or(side2), width, height);
  const center = origin
    .add(tangent.mul(start.x))
    .add(vertical.mul(start.y));
  const distance = TSL.cameraPosition.sub(center).length();
  const effectiveRadius = radius.max(distance.mul(0.00062));
  const along = TSL.mix(effectiveRadius.negate(), length.add(effectiveRadius), shape.y);
  const axis = tangent.mul(dx).add(vertical.mul(dy));
  const perpendicular = tangent.mul(dy.abs()).add(vertical.mul(dx.abs()));
  const flat = TSL.select(tint.w.greaterThanEqual(1), TSL.float(0.35), TSL.float(1));
  const tubePosition = origin
    .add(tangent.mul(start.x))
    .add(vertical.mul(start.y))
    .add(axis.mul(along))
    .add(perpendicular.mul(shape.z).mul(effectiveRadius).mul(flat))
    .add(TSL.normalize(TSL.cross(tangent, vertical)).mul(shape.w).mul(effectiveRadius));
  const sideBit = TSL.pow(TSL.float(2), side);
  const sideEnabled = TSL.mod(TSL.floor(dims.w.div(sideBit)), 2).greaterThan(0.5);
  mat.positionNode = TSL.select(
    sideEnabled.and(distance.lessThan(700)),
    tubePosition,
    origin,
  );

  const isLed = tint.w.greaterThanEqual(1);
  const base = TSL.mix(TSL.vec3(0.55), tint.rgb, 0.35).mul(uSettings.z);
  const intensity = TSL.mix(uSettings.x, uSettings.y, isLed);
  const emission = tint.rgb
    .mul(intensity)
    .mul(uScreen)
    .mul(uNight)
    .mul(TSL.float(1).sub(TSL.smoothstep(650, 700, distance)));
  mat.colorNode = base.add(emission);
  mat.userData.uni = uni;
  return mat;
}

/** TSL atlas sampling and billboard transform for neon words and storefront icons. */
export function createNeonWordNodeMaterial(uni) {
  const mat = makeAdditiveMaterial();
  mat.name = "NeonWords.TSL";
  const uNight = liveUniform(uni.uNeonK);
  const uScreen = liveUniform(uni.uNeonS);
  const uTime = liveUniform(uni.uNeonT);
  const uWords = TSL.uniform(uni.uNeonW.value);
  const center = TSL.attribute("iO", "vec3");
  const tangent = TSL.attribute("iT", "vec3");
  const dims = TSL.attribute("iD", "vec4");
  const tint = TSL.attribute("iC", "vec4");
  const local = TSL.positionLocal;
  const distance = TSL.cameraPosition.sub(center).length();
  const aspect = dims.x.div(dims.y);
  const wide = aspect.greaterThan(2.3077);
  let size = TSL.select(
    wide,
    TSL.vec2(0.9, TSL.float(0.9).div(aspect).mul(2)),
    TSL.vec2(aspect.mul(0.39), 0.78),
  );
  size = TSL.select(dims.z.greaterThan(23.5), TSL.vec2(0.5, 1).div(1.12), size);
  const quadUv = TSL.vec2(0.5).add(local.xy.mul(size.mul(1.12).min(TSL.vec2(0.995))));
  const atlasUv = TSL.vec2(
    TSL.mod(dims.z, 4).add(quadUv.x).div(4),
    TSL.float(1).sub(TSL.floor(dims.z.div(4)).add(1).sub(quadUv.y).div(8)),
  );
  const position = center
    .add(tangent.mul(local.x.mul(dims.x)))
    .add(TSL.vec3(0, local.y.mul(dims.y), 0));
  mat.positionNode = TSL.select(distance.lessThan(600), position, center);

  const atlas = TSL.texture(uni.uNeonTex.value, atlasUv);
  atlas.onRenderUpdate(() => {
    atlas.value = uni.uNeonTex.value;
  });
  const core = atlas.r.sub(0.02).max(0).div(0.98);
  const edge = TSL.min(local.x.add(0.5), TSL.float(0.5).sub(local.x))
    .min(TSL.min(local.y.add(0.5), TSL.float(0.5).sub(local.y)));
  const halo = atlas.g.sub(0.02).max(0).div(0.98)
    .mul(TSL.smoothstep(0, 0.12, edge));
  const peak = TSL.max(TSL.max(tint.r, tint.g), tint.b);
  const glow = tint.rgb.mul(core)
    .add(TSL.mix(tint.rgb, TSL.vec3(peak), 0.25).mul(core.mul(core)).mul(0.2))
    .add(tint.rgb.mul(halo).mul(uWords.y));
  const seed = TSL.fract(tint.w);
  const flickerFrame = TSL.floor(uTime.mul(11).add(seed.mul(613)));
  const flickerHash = TSL.fract(TSL.sin(flickerFrame.mul(12.9898)).mul(43758.5453));
  const flicker = TSL.select(
    seed.lessThan(0.034).and(flickerHash.greaterThan(0.8)),
    TSL.float(0.2).add(flickerHash.mul(0.4)),
    TSL.float(1),
  );
  const distanceFade = TSL.float(1).sub(TSL.smoothstep(420, 600, distance));
  mat.colorNode = glow
    .mul(uWords.x)
    .mul(uScreen)
    .mul(uNight)
    .mul(flicker)
    .mul(distanceFade);
  mat.userData.uni = uni;
  return mat;
}
