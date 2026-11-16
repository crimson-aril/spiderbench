// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";

const worldXZ = (position) => TSL.vec2(position.x, position.z);

export function createAsphaltNodeMaterial(T, quality) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0xffffff,
    roughness: 0.94,
    metalness: 0,
  });
  material.name = "CityAsphalt.TSL";
  // Dark asphalt albedo makes canyon shadows nearly black without the legacy
  // shader's sky irradiance. Give horizontal ground a little extra fallback
  // energy while keeping the shared fill low for walls and facades.
  material.userData.webgpuAmbientFillScale = 2;
  // Asphalt albedo sits below the fallback's flat albedo floor
  // (webgpuLightingFallback.ts), so its additive emissive fill washed over the
  // authored texture, macro variation and lane wear with a constant sky-blue
  // grey. Keep that fill proportional to the authored albedo instead.
  material.userData.webgpuAmbientFloor = false;
  const position = TSL.positionWorld;
  const p = worldXZ(position);
  const road = TSL.varying(TSL.attribute("aRoad", "vec3"), "vRoadNode");
  const base = TSL.texture(T.asphaltCol, p.div(6)).rgb.mul(0.88);
  const noise = TSL.texture(T.noise, p.div(97)).rgb;
  let color = base.mul(
    TSL.float(0.8).add(TSL.texture(T.asphaltMacro, p.div(64)).r.mul(0.4)),
  );
  color = color.mul(TSL.float(0.88).add(noise.r.mul(0.24)));
  // The WebGL2 low-quality path reuses noise for both macro scales and still
  // applies this final broad value variation. Keep that color breakup in TSL.
  color = color.mul(TSL.float(0.94).add(noise.r.mul(0.12)));

  if (quality.name !== "low") {
    const macro2 = TSL.texture(
      T.asphaltMacro,
      TSL.vec2(p.y.negate(), p.x).div(151).add(TSL.vec2(0.5)),
    ).r;
    const rotated = TSL.texture(
      T.asphaltCol,
      TSL.vec2(p.y, p.x.negate()).div(7.3).add(TSL.vec2(0.37)),
    ).rgb;
    color = TSL.mix(color, rotated.mul(0.88), 0.35);
    color = color.mul(TSL.float(0.88).add(macro2.mul(0.24)));
  }

  const laneOffset = position.x.sub(road.y);
  const avenueLane = TSL.mod(laneOffset.add(10.8), 3.6).sub(1.8).abs();
  const streetLane = position.z.sub(road.z).abs();
  const avenueWear = TSL.exp(
    TSL.pow(avenueLane.sub(0.85).div(0.3), 2).negate(),
  );
  const streetWear = TSL.exp(
    TSL.pow(streetLane.sub(0.9).div(0.35), 2).negate(),
  );
  const laneWear = TSL.select(
    road.x.lessThan(0.5),
    avenueWear,
    TSL.select(road.x.lessThan(2), streetWear, TSL.float(0.25)),
  );
  color = color.mul(TSL.float(1).sub(laneWear.mul(0.12)));
  const avenueGutter = TSL.smoothstep(10.2, 11, laneOffset.abs());
  const streetHalfWidth = TSL.float(5).add(road.x.sub(1).mul(100));
  const streetGutter = TSL.smoothstep(
    streetHalfWidth.sub(0.7),
    streetHalfWidth,
    streetLane,
  );
  const gutter = TSL.select(
    road.x.lessThan(0.5),
    avenueGutter,
    TSL.select(road.x.lessThan(2), streetGutter, TSL.float(0)),
  );
  color = color.mul(TSL.float(1).sub(gutter.mul(0.16)));
  material.colorNode = color;

  // Asphalt has no geometry UV attribute; sample the already-bound world-space
  // normal atlas just like ground.glsl and orient its tangent normal onto XZ.
  const normalSample = TSL.texture(T.asphaltNrm, p.div(6)).rgb;
  const normalXY = normalSample.rg.mul(2).sub(1);
  const normalZ = TSL.sqrt(TSL.float(1).sub(TSL.dot(normalXY, normalXY)).max(0));
  const normalWorld = TSL.normalize(TSL.vec3(normalXY.x, normalZ, normalXY.y));
  material.normalNode = TSL.transformNormalByViewMatrix(normalWorld, TSL.cameraViewMatrix);
  const viewDistance = TSL.positionView.length();
  material.roughnessNode = TSL.mix(
    normalSample.b.add(0.05).sub(laneWear.mul(0.08)).clamp(0.35, 1),
    TSL.float(1),
    TSL.smoothstep(300, 1100, viewDistance),
  );
  return material;
}

export function createSidewalkNodeMaterial(T) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0xffffff,
    roughness: 0.88,
    metalness: 0,
  });
  material.name = "CitySidewalk.TSL";
  material.userData.webgpuAmbientFillScale = 2;
  // Same as asphalt: no flat albedo floor under the ambient fill, so slab, joint
  // and curb detail from colorNode survives in shade.
  material.userData.webgpuAmbientFloor = false;
  const position = TSL.positionWorld;
  const p = worldXZ(position);
  const rect = TSL.varying(TSL.attribute("aRect", "vec4"), "vWalkRectNode");
  const worldNormal = TSL.normalize(TSL.normalWorld);
  const noise = TSL.texture(T.noise, p.div(53)).rgb;
  const sidewalkUv = p.div(6);
  let color = TSL.texture(T.sidewalkCol, sidewalkUv).rgb;
  color = color.mul(TSL.float(0.93).add(noise.r.mul(0.14)));
  color = color.mul(TSL.float(1).sub(noise.b.mul(0.04)));

  const edgeDistance = TSL.min(
    TSL.min(position.x.sub(rect.x), rect.z.sub(position.x)),
    TSL.min(position.z.sub(rect.y), rect.w.sub(position.z)),
  );
  const hasRect = rect.x.greaterThan(-5e4);
  const curbTop = TSL.select(
    hasRect,
    TSL.float(1).sub(TSL.smoothstep(0.26, 0.3, edgeDistance)),
    TSL.float(0),
  );
  const curbUv = p.div(1.1).add(TSL.vec2(0.3));
  const curbColor = TSL.texture(T.curbCol ?? T.sidewalkCol, curbUv).rgb.mul(0.97);
  const topColor = TSL.mix(color, curbColor, curbTop).mul(
    TSL.select(hasRect, TSL.vec3(1), TSL.vec3(0.86, 0.82, 0.77)),
  );
  const verticalCurbUv = TSL.vec2(position.x.add(position.z), position.y).div(1.3);
  const sideColor = TSL.texture(T.curbCol ?? T.sidewalkCol, verticalCurbUv).rgb.mul(0.92);
  color = TSL.select(worldNormal.y.lessThan(0.5), sideColor, topColor);
  material.colorNode = color;

  // Walkway tops use the same world-XZ normal convention as the WebGL2 path.
  // Curb faces keep the mesh normal, and the curb-top replacement is flat.
  const normalSample = TSL.texture(T.sidewalkNrm, sidewalkUv).rgb;
  const normalXY = TSL.mix(
    normalSample.rg.mul(2).sub(1),
    TSL.vec2(0),
    curbTop,
  );
  const normalZ = TSL.sqrt(TSL.float(1).sub(TSL.dot(normalXY, normalXY)).max(0));
  const topWorldNormal = TSL.normalize(TSL.vec3(normalXY.x, normalZ, normalXY.y));
  const surfaceWorldNormal = TSL.select(worldNormal.y.greaterThan(0.5), topWorldNormal, worldNormal);
  material.normalNode = TSL.transformNormalByViewMatrix(surfaceWorldNormal, TSL.cameraViewMatrix);
  const topRoughness = TSL.mix(normalSample.b, TSL.float(0.7), curbTop);
  material.roughnessNode = TSL.mix(
    TSL.select(worldNormal.y.greaterThan(0.5), topRoughness, TSL.float(0.85)),
    TSL.float(1),
    TSL.smoothstep(300, 1100, TSL.positionView.length()),
  );
  return material;
}

export function createGrassNodeMaterial(T, quality, opts = {}) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0xffffff,
    roughness: 0.98,
    metalness: 0,
  });
  material.name = opts.lawn ? "CityLawn.TSL" : "CentralParkGrass.TSL";
  const position = TSL.positionWorld;
  const p = worldXZ(position);
  const near = TSL.texture(T.grassCol, p.div(quality.name === "low" ? 12 : 6)).rgb;
  const noise = TSL.texture(T.noise, p.div(quality.name === "low" ? 80 : 140)).rgb;
  let color = near;
  if (quality.name !== "low") {
    const far = TSL.texture(T.grassCol, p.yx.div(23)).rgb;
    color = TSL.mix(near, far, 0.4);
  }
  color = color.mul(TSL.float(0.78).add(noise.r.mul(0.4)));
  color = TSL.mix(color, TSL.vec3(TSL.dot(color, TSL.vec3(0.3, 0.55, 0.15))), 0.32)
    .mul(TSL.vec3(0.84, 0.84, 0.74));

  // A lightweight woodland tint and broad mowing variation preserve visual
  // structure without the legacy shader's arrays of per-meadow uniforms.
  const groveNoise = TSL.texture(T.noise, p.div(31).add(TSL.vec2(0.17))).g;
  const grove = TSL.smoothstep(0.58, 0.82, groveNoise);
  const woodland = TSL.mix(
    TSL.vec3(0.19, 0.18, 0.09),
    TSL.vec3(0.26, 0.2, 0.11),
    noise.g,
  );
  color = TSL.mix(color, woodland, grove.mul(opts.lawn ? 0.08 : 0.42));
  const mowing = TSL.sin(position.x.mul(0.17)).mul(0.012);
  material.colorNode = color.add(TSL.vec3(mowing));
  return material;
}
