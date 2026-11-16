import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";

/** Build the node-based cyclorama used by the WebGPU suit preview. */
export function createSuitCycloramaNodeMaterial() {
  const material = new WEBGPU.MeshBasicNodeMaterial({
    side: WEBGPU.BackSide,
    depthWrite: true,
  });
  material.colorNode = TSL.mix(
    TSL.vec3(0.012, 0.018, 0.04),
    TSL.vec3(0.09, 0.13, 0.24),
    TSL.smoothstep(0.1, 0.8, TSL.uv().y),
  );
  return material;
}
