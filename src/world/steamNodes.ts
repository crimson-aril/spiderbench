// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";

export function createSteamNodeMaterial(noise, time) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0xcfd2d4,
    roughness: 1,
    transparent: true,
    depthWrite: false,
  });
  material.name = "CitySteam.TSL";
  const t = TSL.uniform(time.value);
  t.onRenderUpdate(() => { t.value = time.value; });
  const puff = TSL.attribute("aPuff", "vec4");
  const phase = TSL.fract(t.mul(0.11).add(puff.w));
  const low = puff.y.lessThan(-1);
  const lowScale = TSL.select(low, TSL.float(0.65), TSL.float(1));
  const height = TSL.float(5.5).mul(TSL.float(1).sub(TSL.float(1).sub(phase).pow(2))).mul(TSL.select(low, 0.65, 1));
  const radius = TSL.mix(0.5, 3, TSL.sqrt(phase)).mul(TSL.select(low, 0.55, 1));
  const wind = phase.mul(phase).mul(3.2);
  const center = puff.xyz.add(TSL.vec3(
    wind.mul(0.8).add(TSL.sin(puff.w.mul(40).add(t.mul(0.6))).mul(phase).mul(0.35)),
    TSL.float(2.55).add(height),
    wind.mul(0.35).add(TSL.sin(puff.w.mul(23).add(t.mul(0.4))).mul(phase).mul(0.5)),
  ));
  const camera = TSL.cameraWorldMatrix;
  const right = camera.element(0).xyz;
  const up = camera.element(1).xyz;
  const angle = puff.w.mul(17).add(t.mul(0.12));
  const plane = TSL.positionLocal.xy;
  const rotated = TSL.vec2(
    plane.x.mul(TSL.cos(angle)).sub(plane.y.mul(TSL.sin(angle))),
    plane.x.mul(TSL.sin(angle)).add(plane.y.mul(TSL.cos(angle))),
  );
  material.positionNode = center.add(right.mul(rotated.x).mul(radius).mul(1.25)).add(up.mul(rotated.y).mul(radius));

  const distance = TSL.cameraPosition.sub(center).length();
  const fade = TSL.smoothstep(0, 0.12, phase)
    .mul(TSL.float(1).sub(TSL.smoothstep(0.25, 1, phase)))
    .mul(TSL.float(1).sub(TSL.smoothstep(160, 320, distance)))
    .mul(TSL.smoothstep(0.6, 2.5, distance));
  const vFade = TSL.varying(fade, "vSteamFade");
  const vAge = TSL.varying(phase, "vSteamAge");
  const uv = TSL.uv();
  const puffUv = uv.mul(0.45).add(TSL.fract(TSL.vec2(puff.w.mul(3.1), puff.w.mul(7.7)).add(TSL.vec2(t.mul(0.01), t.mul(-0.03)))));
  const noiseA = TSL.texture(noise, puffUv).g.mul(0.55);
  const noiseB = TSL.texture(noise, puffUv.mul(2.7).add(0.37)).r.mul(0.45);
  const turbulence = noiseA.add(noiseB);
  const radial = uv.sub(0.5).length().mul(2);
  const disc = TSL.float(1).sub(TSL.smoothstep(0.1, 1, radial));
  const dissolve = TSL.smoothstep(0.25, 0.75, turbulence.add(disc.mul(0.2)).sub(vAge.mul(0.15)));
  material.opacityNode = vFade.mul(0.3).mul(disc).mul(disc).mul(dissolve).mul(lowScale);
  material.emissiveNode = TSL.vec3(0.018, 0.018, 0.018);
  return material;
}
