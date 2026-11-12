import { equirectUV, reflectVector, texture, vec3 } from "three/tsl";

let environmentTexture: any = null;

export function setWebGPUEnvironmentTexture(nextTexture: any): void {
  environmentTexture = nextTexture ?? null;
}

/** Sample the live equirectangular sky along the current world-space reflection ray. */
export function createWebGPUEnvironmentReflection() {
  if (!environmentTexture) return vec3(0);
  return texture(environmentTexture, equirectUV(reflectVector)).rgb;
}
