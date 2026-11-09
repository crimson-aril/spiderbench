// Material builders are called deep in world construction and do not all
// receive the renderer. Keep the selected material path available to them.
let nodeMaterialBackend = false;
let webGPUBackend = true;

export function setNodeMaterialBackend(enabled: boolean, isWebGPU = true): void {
  nodeMaterialBackend = enabled;
  webGPUBackend = isWebGPU;
}

export function usesNodeMaterialBackend(): boolean {
  return nodeMaterialBackend;
}

export function usesWebGPUBackend(): boolean {
  return nodeMaterialBackend && webGPUBackend;
}
