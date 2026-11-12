// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";
import { nightK } from "../../render/daynight.ts";

export function createBoatWakeNodeMaterial(texture) {
  const material = new WEBGPU.MeshBasicNodeMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    opacity: 0.8,
    color: 0xc2c9ca,
    side: 2,
  });
  material.name = "BoatWake.TSL";
  const night = TSL.uniform(nightK.value);
  night.onRenderUpdate(() => { night.value = nightK.value; });
  const texel = TSL.texture(texture, TSL.uv());
  material.colorNode = texel.rgb
    .mul(TSL.color(0xc2c9ca))
    .mul(TSL.mix(1, 0.025, night));
  material.opacityNode = texel.a.mul(0.8);
  return material;
}
