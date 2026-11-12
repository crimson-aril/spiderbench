// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";
import * as THREE from "three";
import { nightK, screenK } from "../../render/daynight.ts";
import { uScrBoost, uScrDesat, uScrKnee, uScrTop } from "../screenlights.ts";

const liveUniform = (source) =>
  TSL.uniform(source.value).onRenderUpdate((_, self) => {
    self.value = source.value;
  });

export function createTimesSquareAONodeMaterial(map) {
  const material = new WEBGPU.MeshBasicNodeMaterial({
    map,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -6,
    polygonOffsetUnits: -6,
  });
  material.name = "TimesSquareAO.TSL";
  material.vertexColors = true;
  const texel = TSL.texture(map, TSL.uv());
  const vertex = TSL.vertexColor();
  material.colorNode = TSL.vec3(0);
  material.opacityNode = texel.a.mul(vertex.r);
  material.blending = THREE.CustomBlending;
  material.blendEquation = THREE.AddEquation;
  material.blendSrc = THREE.SrcAlphaFactor;
  material.blendDst = THREE.OneMinusSrcAlphaFactor;
  material.blendSrcAlpha = THREE.ZeroFactor;
  material.blendDstAlpha = THREE.OneFactor;
  return material;
}

export function createTimesSquareHaloNodeMaterial(map) {
  const material = new WEBGPU.MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
  material.name = "TimesSquareHalo.TSL";
  // colorNode includes the vertex tint explicitly below.
  material.vertexColors = false;
  const texel = TSL.texture(map, TSL.uv());
  const ray = TSL.normalize(TSL.positionWorld.sub(TSL.cameraPosition));
  const horizonFade = TSL.float(1).sub(TSL.smoothstep(0.3, 0.65, ray.y.negate()));
  material.colorNode = texel.rgb.mul(TSL.vertexColor().rgb).mul(TSL.materialColor);
  material.opacityNode = texel.a.mul(horizonFade);
  material.blending = THREE.CustomBlending;
  material.blendEquation = THREE.AddEquation;
  material.blendSrc = THREE.OneFactor;
  material.blendDst = THREE.OneFactor;
  material.blendSrcAlpha = THREE.ZeroFactor;
  material.blendDstAlpha = THREE.OneFactor;
  return material;
}

export function createTimesSquareBladeFaceNodeMaterial(map) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    roughness: 0.3,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  material.name = "TimesSquareBladeFaces.TSL";
  const uv = TSL.uv();
  const cell = TSL.varying(TSL.attribute("aCell", "vec4"), "vBladeCell");
  const faceUv = TSL.varying(uv, "vBladeUv");
  const atlasUv = cell.xy.add(TSL.vec2(uv.y, TSL.float(1).sub(uv.x)).mul(cell.zw));
  const faceColor = TSL.texture(map, atlasUv).rgb;
  const night = liveUniform(nightK);
  const screen = liveUniform(screenK);
  const edgeX = TSL.min(faceUv.x, TSL.float(1).sub(faceUv.x)).mul(2);
  const edgeY = TSL.min(faceUv.y, TSL.float(1).sub(faceUv.y)).mul(4.6);
  const edgeLight = TSL.float(0.55).add(TSL.smoothstep(0, 0.8, TSL.min(edgeX, edgeY)).mul(0.45));
  const peak = TSL.max(faceColor.r, TSL.max(faceColor.g, faceColor.b)).add(1e-4);
  const nightColor = faceColor.div(peak).mul(TSL.pow(peak, 0.45)).mul(2);
  const emission = TSL.mix(faceColor.mul(0.5), nightColor, night).mul(edgeLight).mul(screen);
  const far = TSL.positionWorld.sub(TSL.cameraPosition).length().greaterThan(300);
  material.colorNode = faceColor;
  material.emissiveNode = emission;
  material.maskNode = far.not();
  return material;
}

export function createTimesSquareShopNodeMaterial(map) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0x303030,
    roughness: 0.05,
    metalness: 0,
    vertexColors: true,
  });
  material.name = "TimesSquareStorefront.TSL";
  const uv = TSL.uv();
  const room = TSL.varying(TSL.attribute("aRoom", "vec4"), "vShopRoom");
  const tangent = TSL.normalize(TSL.varying(TSL.attribute("aTan", "vec3"), "vShopTangent"));
  const worldNormal = TSL.normalize(TSL.normalWorld);
  const view = TSL.normalize(TSL.positionWorld.sub(TSL.cameraPosition));
  const dx = TSL.dot(view, tangent);
  const dy = view.y;
  const dz = TSL.dot(view.negate(), worldNormal).max(1e-3);
  const size = room.zw.max(1e-3);
  const p = room.xy.mul(size);
  const xDenom = TSL.select(dx.greaterThan(1e-4), dx.max(1e-4), TSL.select(dx.lessThan(-1e-4), dx.min(-1e-4), 1e5));
  const yDenom = TSL.select(dy.greaterThan(1e-4), dy.max(1e-4), TSL.select(dy.lessThan(-1e-4), dy.min(-1e-4), 1e5));
  const tx = TSL.select(dx.greaterThan(1e-4), size.x.sub(p.x).div(xDenom), TSL.select(dx.lessThan(-1e-4), p.x.negate().div(xDenom), 1e5));
  const ty = TSL.select(dy.greaterThan(1e-4), size.y.add(0.6).sub(p.y).div(yDenom), TSL.select(dy.lessThan(-1e-4), p.y.add(0.5).negate().div(yDenom), 1e5));
  const tz = TSL.float(5.5).div(dz);
  const t = TSL.min(TSL.min(tx, ty), tz);
  const hit = TSL.vec3(p.x.add(dx.mul(t)), p.y.add(dy.mul(t)), dz.mul(t));
  const atlasSize = TSL.vec2(0.242, 0.49);
  const atlasOrigin = uv.sub(room.xy.mul(atlasSize));
  const backUv = atlasOrigin.add(hit.xy.div(size).clamp(0.02, 0.98).mul(atlasSize));
  const sideU = TSL.select(dx.greaterThan(0), TSL.float(0.98).sub(hit.z.mul(0.3 / 5.5)), TSL.float(0.02).add(hit.z.mul(0.3 / 5.5)));
  const sideUv = atlasOrigin.add(TSL.vec2(sideU, hit.y.div(size.y).clamp(0.02, 0.98)).mul(atlasSize));
  const falloff = TSL.float(1).sub(hit.z.mul(0.4 / 5.5));
  const back = TSL.texture(map, backUv).rgb;
  const side = TSL.texture(map, sideUv).rgb.mul(0.6).mul(falloff);
  const ceilingLights = TSL.step(0.62, TSL.fract(hit.z.div(1.5).add(0.2)))
    .mul(TSL.step(0.3, TSL.fract(hit.x.div(1.8).add(0.15))));
  const ceiling = TSL.vec3(0.3, 0.29, 0.27).mul(falloff).add(TSL.vec3(1.7, 1.6, 1.4).mul(ceilingLights));
  const floorGrid = TSL.step(0.05, TSL.fract(hit.x.div(0.6))).mul(TSL.step(0.05, TSL.fract(hit.z.div(0.6))));
  const floor = TSL.vec3(0.36, 0.33, 0.3).mul(TSL.float(0.7).add(floorGrid.mul(0.3))).mul(falloff);
  const emissive = TSL.select(t.greaterThanEqual(tz.sub(1e-3)), back,
    TSL.select(t.greaterThanEqual(tx.sub(1e-3)), side, TSL.select(dy.greaterThan(0), ceiling, floor)));
  material.colorNode = TSL.vec3(0.03);
  material.emissiveNode = emissive.mul(TSL.vertexColor().r);
  return material;
}

export function createTimesSquarePaverNodeMaterial({ map, normalMap, roughnessMap, noise, circles, edgeX }) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    roughness: 1,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  material.name = "TimesSquarePavers.TSL";
  const uv = TSL.uv();
  const wp = TSL.vec2(uv.x, uv.y.negate()).mul(9.6);
  const base = TSL.texture(map, uv).rgb;
  const h1 = TSL.texture(noise, wp.mul(0.0071).add(0.53)).b;
  const h2 = TSL.texture(noise, wp.mul(0.021).add(0.21)).r;
  let color = base.mul(TSL.mix(TSL.vec3(1.07, 0.97, 0.9), TSL.vec3(0.9, 0.96, 1.05), TSL.smoothstep(0.3, 0.72, h1)));
  const walk = TSL.smoothstep(0.55, 0.8, h2).mul(TSL.float(0.6).add(TSL.texture(noise, wp.mul(0.13)).g.mul(0.4)));
  color = TSL.mix(color, color.mul(1.22).add(TSL.vec3(0.012, 0.011, 0.01)), walk.mul(0.7));
  color = color.mul(TSL.float(1).sub(TSL.smoothstep(edgeX - 4, edgeX - 0.5, wp.x.abs()).mul(TSL.float(0.3).mul(TSL.float(0.6).add(h2.mul(0.4))))));
  for (const circle of circles) {
    if (circle.z < 0) continue;
    const distance = wp.sub(TSL.vec2(circle.x, circle.y)).length().sub(circle.z);
    const paint = TSL.float(1).sub(TSL.smoothstep(-0.04, 0.03, distance));
    const rim = TSL.float(1).sub(TSL.smoothstep(-0.34, -0.3, distance)).mul(TSL.smoothstep(-0.46, -0.42, distance));
    const paintColor = circle.w < 0.5 ? TSL.vec3(0.07, 0.2, 0.3)
      : circle.w < 1.5 ? TSL.vec3(0.09, 0.22, 0.24)
        : circle.w < 2.5 ? TSL.vec3(0.16, 0.17, 0.2) : TSL.vec3(0.06, 0.12, 0.26);
    const wear = TSL.texture(noise, wp.mul(0.31).add(TSL.vec2(circle.x, circle.y).mul(0.01))).g.mul(0.6)
      .add(TSL.texture(noise, wp.mul(1.9)).r.mul(0.5));
    const keep = TSL.smoothstep(0.34, 0.62, wear);
    const lum = TSL.dot(color, TSL.vec3(0.3, 0.59, 0.11));
    const paintRgb = TSL.mix(paintColor.mul(lum.div(0.16).clamp(0.45, 1.5)), TSL.vec3(0.5, 0.52, 0.52).mul(lum.div(0.16).clamp(0.45, 1.5)), rim.mul(0.8));
    color = TSL.mix(color, paintRgb, paint.mul(keep).mul(0.5));
  }
  const a = TSL.texture(noise, uv.mul(0.061)).r;
  const b = TSL.texture(noise, uv.mul(0.23).add(0.37)).g;
  const c = TSL.texture(noise, uv.mul(0.9).add(0.11)).b;
  color = color.mul(TSL.float(0.74).add(a.mul(TSL.float(0.42).mul(TSL.float(0.7).add(b.mul(0.6))))));
  color = TSL.mix(color, TSL.vec3(TSL.dot(color, TSL.vec3(0.33))), TSL.float(0.12).add(TSL.smoothstep(0.55, 0.8, c).mul(0.25)));
  color = color.mul(TSL.texture(roughnessMap, uv).r.mul(0.8).add(0.2)).mul(1.2).add(TSL.vec3(0.014, 0.012, 0.011));
  const luminance = TSL.dot(color, TSL.vec3(0.3, 0.59, 0.11));
  color = TSL.mix(color, TSL.vec3(luminance), 0.2);
  color = color.mul(TSL.float(1).sub(TSL.float(0.18).mul(TSL.smoothstep(0.5, 0.2, a)).mul(TSL.float(0.5).add(b.mul(0.5)))));
  material.colorNode = color;
  material.normalNode = TSL.normalMap(TSL.texture(normalMap, uv), TSL.vec2(0.9, 0.9));
  material.roughnessNode = TSL.texture(roughnessMap, uv).g;
  return material;
}

export function createTimesSquareRoadWearNodeMaterial({ noise, crosswalkOnly, streetSpacing, streetHalf, avenueHalf, towerX }) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0x5d5b57,
    roughness: 0.93,
    metalness: 0,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
  material.name = crosswalkOnly ? "TimesSquareCrosswalkWear.TSL" : "TimesSquareRoadDust.TSL";
  const uv = TSL.uv();
  const n1 = TSL.texture(noise, uv).rgba;
  const n2 = TSL.texture(noise, uv.mul(4.3).add(0.37)).rgba;
  const n3 = TSL.texture(noise, uv.mul(17).add(0.71)).rgba;
  const pale = TSL.smoothstep(0.72, 0.9, n1.g).mul(TSL.smoothstep(0.45, 0.75, n2.b));
  const rgb = TSL.mix(
    TSL.texture(noise, uv).rgb.mul(TSL.float(0.75).add(n3.b.mul(0.4))),
    TSL.vec3(0.62, 0.61, 0.58),
    pale,
  );
  const chip = TSL.smoothstep(0.55, 0.72, n3.r).mul(TSL.float(0.6).add(n2.b.mul(0.4)));
  const alpha = TSL.float(0.26).add(TSL.smoothstep(0.2, 0.8, n1.r).mul(0.34))
    .mul(TSL.float(0.65).add(n2.g.mul(0.7))).add(pale.mul(0.25)).clamp(0, 0.68);
  const wq = uv.mul(37);
  const zz = TSL.mod(wq.y, streetSpacing);
  const ax = wq.x.abs();
  let crosswalk = TSL.float(1).sub(TSL.smoothstep(2.2, 3, zz.sub(streetHalf + 2.4).abs()))
    .add(TSL.float(1).sub(TSL.smoothstep(2.2, 3, zz.sub(streetSpacing - streetHalf - 2.4).abs())));
  crosswalk = crosswalk.mul(TSL.float(1).sub(TSL.smoothstep(avenueHalf - 0.5, avenueHalf + 0.5, ax)));
  const sideCrossing = TSL.float(1).sub(TSL.smoothstep(1.8, 2.6, TSL.min(zz, TSL.float(streetSpacing).sub(zz))))
    .mul(TSL.float(1).sub(TSL.smoothstep(1.8, 2.6, ax.sub(avenueHalf + 2.4).abs())));
  crosswalk = crosswalk.add(sideCrossing);
  let outAlpha = crosswalkOnly ? crosswalk.clamp(0, 1).mul(TSL.float(0.32).add(chip.mul(0.5))) : alpha;
  outAlpha = outAlpha
    .mul(TSL.smoothstep(towerX - 24, towerX, ax))
    .mul(TSL.smoothstep(-326, -306, wq.y))
    .mul(TSL.smoothstep(6, -8, wq.y));
  material.colorNode = rgb;
  material.opacityNode = outAlpha;
  material.blending = THREE.CustomBlending;
  material.blendEquation = THREE.AddEquation;
  material.blendSrc = THREE.SrcAlphaFactor;
  material.blendDst = THREE.OneMinusSrcAlphaFactor;
  material.blendSrcAlpha = THREE.ZeroFactor;
  material.blendDstAlpha = THREE.OneFactor;
  return material;
}

export function createTimesSquareScreenNodeMaterial(map) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0x2a2a2a,
    emissive: 0xffffff,
    emissiveIntensity: 2.5,
    roughness: 0.28,
    metalness: 0,
  });
  material.name = "TimesSquareLED.TSL";
  material.vertexColors = true;
  const uv = TSL.uv();
  const texel = TSL.texture(map, uv);
  material.colorNode = texel.rgb.mul(TSL.color(0x2a2a2a)).mul(0.92).add(0.012);

  const night = liveUniform(nightK);
  const screen = liveUniform(screenK);
  const boost = liveUniform(uScrBoost);
  const desat = liveUniform(uScrDesat);
  const knee = liveUniform(uScrKnee);
  const top = liveUniform(uScrTop);
  const gain = screen.mul(TSL.float(1).add(boost.sub(1).mul(night)));

  const pixel = uv.mul(2048);
  const pixelFootprint = TSL.fwidth(pixel);
  const pixelScale = TSL.float(1).sub(TSL.max(pixelFootprint.x, pixelFootprint.y).mul(1.6)).clamp(0, 1);
  const pixelDistance = TSL.abs(TSL.fract(pixel).sub(0.5));
  const pixelMask = TSL.smoothstep(0.5, 0.36, TSL.max(pixelDistance.x, pixelDistance.y));
  const triadPosition = TSL.fract(pixel.x.mul(3));
  const triad = TSL.vec3(
    TSL.smoothstep(0, 0.12, triadPosition).mul(TSL.smoothstep(0.36, 0.24, triadPosition)),
    TSL.smoothstep(0.3, 0.42, triadPosition).mul(TSL.smoothstep(0.7, 0.58, triadPosition)),
    TSL.smoothstep(0.64, 0.76, triadPosition).mul(TSL.smoothstep(1, 0.88, triadPosition)),
  );
  const triadScale = TSL.float(1).sub(TSL.max(pixelFootprint.x, pixelFootprint.y).mul(4)).clamp(0, 1);
  let emission = texel.rgb.mul(2.5).mul(gain);
  const ledPattern = TSL.float(0.4).add(pixelMask.mul(0.75)).mul(
    TSL.mix(TSL.vec3(1), TSL.float(0.35).add(triad.mul(1.9)), triadScale),
  );
  emission = emission.mul(TSL.mix(TSL.vec3(1), ledPattern, pixelScale));

  const cabinet = uv.mul(128);
  const cabinetFootprint = TSL.fwidth(cabinet);
  const cabinetScale = TSL.float(1).sub(TSL.max(cabinetFootprint.x, cabinetFootprint.y).mul(14)).clamp(0, 1);
  const cabinetDistance = TSL.float(0.5).sub(TSL.abs(TSL.fract(cabinet).sub(0.5)));
  const seam = TSL.max(
    TSL.float(1).sub(TSL.smoothstep(0.006, TSL.float(0.006).add(cabinetFootprint.x), cabinetDistance.x)),
    TSL.float(1).sub(TSL.smoothstep(0.006, TSL.float(0.006).add(cabinetFootprint.y), cabinetDistance.y)),
  );
  emission = emission.mul(TSL.float(1).sub(seam.mul(cabinetScale).mul(0.09)));
  const scan = TSL.float(0.8).add(TSL.cos(pixel.y.mul(Math.PI * 2)).mul(0.2));
  emission = emission.mul(TSL.mix(1, scan, TSL.float(1).sub(pixelFootprint.y.mul(1.4).clamp(0, 1)).mul(0.8)));

  const viewCone = TSL.abs(TSL.dot(TSL.normalize(TSL.normalView), TSL.normalize(TSL.positionView)));
  emission = emission.mul(TSL.mix(TSL.vec3(0.5, 0.54, 0.6), TSL.vec3(1), TSL.smoothstep(0.08, 0.7, viewCone)));
  const luminance = TSL.dot(emission, TSL.vec3(0.3, 0.55, 0.15));
  emission = TSL.mix(emission, TSL.vec3(luminance), TSL.mix(0.26, desat, night));

  const peak = TSL.max(emission.r, TSL.max(emission.g, emission.b));
  const normalizedPeak = peak.div(TSL.float(2.5).mul(gain).add(1e-4));
  const shoulderWidth = top.sub(knee).max(1e-4);
  const shoulder = knee.add(
    shoulderWidth.mul(TSL.float(1).sub(TSL.exp(normalizedPeak.sub(knee).div(shoulderWidth).negate()))),
  );
  const shoulderScale = TSL.mix(
    1,
    shoulder.div(normalizedPeak.max(1e-4)),
    TSL.select(normalizedPeak.greaterThan(knee), night, 0),
  );
  emission = emission.mul(shoulderScale);
  material.emissiveNode = emission;
  return material;
}

export function createTimesSquareNeonNodeMaterial(map) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0x000000,
    emissive: 0xffffff,
    emissiveIntensity: 2.2,
    roughness: 0.4,
    metalness: 0,
    side: 2,
  });
  material.name = "TimesSquareNeon.TSL";
  material.vertexColors = true;
  const uv = TSL.uv();
  const sharp = TSL.texture(map, uv).rgb;
  const soft = TSL.texture(map, uv, TSL.float(5)).rgb;
  const letterMask = TSL.smoothstep(0.1, 0.3, sharp.sub(soft).length());
  material.maskNode = letterMask.greaterThan(0.4);
  const night = liveUniform(nightK);
  const screen = liveUniform(screenK);
  const boost = liveUniform(uScrBoost);
  const gain = screen.mul(TSL.float(1).add(boost.sub(1).mul(night)));
  material.colorNode = TSL.vec3(0);
  material.emissiveNode = TSL.vertexColor().rgb
    .mul(TSL.mix(TSL.vec3(1), TSL.vec3(1, 0.96, 0.92), letterMask.mul(0.45)))
    .mul(letterMask)
    .mul(2.2)
    .mul(gain);
  return material;
}
