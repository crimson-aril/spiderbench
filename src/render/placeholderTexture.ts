import * as THREE from "three";

/** A tiny initialized texture for materials whose real image loads asynchronously. */
export function createPlaceholderTexture(
  rgba: readonly [number, number, number, number],
  name: string,
) {
  const texture = new THREE.DataTexture(
    new Uint8Array(rgba),
    1,
    1,
    THREE.RGBAFormat,
  );
  texture.name = name;
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
