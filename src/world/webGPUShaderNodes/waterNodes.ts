// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";

/** Lightweight node water for the WebGPU-first renderer path. */
export function createRiverNodeMaterial(
  T,
  refl,
  { body = [0.06, 0.082, 0.09], shore = null, ssr = false } = {},
) {
  const material = new WEBGPU.MeshPhysicalNodeMaterial({
    color: 0xffffff,
    roughness: 0.08,
    metalness: 0,
    clearcoat: 0.45,
    clearcoatRoughness: 0.12,
  });
  material.name = "CityRiver.TSL";
  const time = TSL.uniform(0);
  const position = TSL.positionWorld;
  const p = TSL.vec2(position.x, position.z);
  const viewDirection = TSL.normalize(TSL.cameraPosition.sub(position));
  const normal = TSL.normalize(TSL.normalWorld);
  const waveA = TSL.texture(
    T.waterNrm,
    p.div(2.3).add(TSL.vec2(time.mul(0.05), time.mul(0.034))),
  ).rg.mul(2).sub(TSL.vec2(1));
  const waveB = TSL.texture(
    T.waterNrm,
    TSL.vec2(p.y.negate(), p.x)
      .div(3.7)
      .add(TSL.vec2(time.mul(-0.041), time.mul(0.02))),
  ).rg.mul(2).sub(TSL.vec2(1));
  const wave = waveA.add(waveB.mul(0.8));
  const noise = TSL.texture(
    T.noise,
    p.div(31).add(TSL.vec2(time.mul(0.01), 0)),
  ).rgb;
  const slick = TSL.texture(
    T.noise,
    p.div(390).add(TSL.vec2(time.mul(0.003), time.mul(-0.002))),
  ).g;
  const fresnel = TSL.pow(
    TSL.float(1).sub(TSL.dot(viewDirection, normal).abs().clamp(0, 1)),
    4,
  );
  let bodyColor = TSL.vec3(body[0], body[1], body[2])
    .mul(TSL.float(0.83).add(noise.r.mul(0.28)))
    .mul(TSL.float(1).add(wave.x.mul(0.025)).add(wave.y.mul(0.018)));
  if (shore?.texture && shore.box) {
    const shoreUv = p
      .sub(TSL.vec2(shore.box.x, shore.box.y))
      .div(TSL.vec2(shore.box.z, shore.box.w));
    const shoreDistance = TSL.texture(shore.texture, shoreUv).r.mul(400);
    const silt = TSL.float(1).sub(TSL.smoothstep(10, 120, shoreDistance))
      .mul(TSL.float(0.55).add(noise.g.mul(0.45)));
    const wash = TSL.float(1).sub(TSL.smoothstep(1, 70, shoreDistance))
      .mul(TSL.smoothstep(0.35, 0.65, noise.g.mul(0.6).add(noise.b.mul(0.6))));
    bodyColor = TSL.mix(
      bodyColor,
      TSL.vec3(0.085, 0.08, 0.058),
      silt.mul(0.4),
    );
    bodyColor = TSL.mix(
      bodyColor,
      TSL.vec3(0.2, 0.205, 0.19),
      wash.mul(0.55),
    );
  }
  const skyReflection = TSL.mix(
    TSL.vec3(0.19, 0.24, 0.28),
    TSL.vec3(0.43, 0.53, 0.61),
    TSL.smoothstep(0.0, 0.9, viewDirection.y.abs()),
  );
  const reflectionStrength = TSL.float(0.24).add(slick.mul(0.22));
  material.colorNode = TSL.mix(
    bodyColor,
    skyReflection,
    fresnel.mul(reflectionStrength),
  );
  material.roughnessNode = TSL.float(ssr ? 0.13 : 0.055)
    .add(noise.b.mul(0.055))
    .add(TSL.float(1).sub(slick).mul(0.06))
    .clamp(0.035, 0.24);
  material.clearcoatRoughnessNode = TSL.float(0.05).add(
    TSL.float(1).sub(slick).mul(0.12),
  );
  material.emissiveNode = TSL.vec3(0.025, 0.035, 0.04)
    .mul(TSL.smoothstep(0.7, 0.94, wave.x.mul(0.5).add(0.5)))
    .mul(0.2);
  material.userData.uniforms = {
    uWTime: time,
  };
  material.userData.noSSR = true;
  // The node path intentionally skips the legacy WebGLRenderTarget mirror.
  void refl;
  return material;
}
