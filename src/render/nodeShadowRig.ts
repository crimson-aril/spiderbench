// @ts-nocheck
import * as THREE from "three";

export function createNodeShadowRig(scene, quality) {
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.name = "NodeSun";
  sun.castShadow = true;
  sun.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
  // WebGL has a separate close-character cascade; WebGPU uses one map for
  // both the player and city shadows. The old 360 m high-quality footprint
  // left a standing player's ground shadow only a few texels long.
  const shadowHalfExtent = quality.name === "high"
    ? 72
    : quality.name === "med"
      ? 96
      : Math.min(180, quality.shadowMapSize / 10);
  sun.shadow.camera.left = -shadowHalfExtent;
  sun.shadow.camera.right = shadowHalfExtent;
  sun.shadow.camera.top = shadowHalfExtent;
  sun.shadow.camera.bottom = -shadowHalfExtent;
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far = quality.shadowFar * 2;
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -0.00008;
  sun.shadow.normalBias = 0.025;
  // Keep WebGPU shadows readable in narrow streets and soften the hard edge
  // from the single directional key light.
  // Keep WebGPU's direct-light shadows clearly visible; ?tslshadow=<0..1>
  // overrides this for A/B comparison against WebGL2's cascaded shadows.
  const shadowOverride =
    typeof location !== "undefined"
      ? new URLSearchParams(location.search).get("tslshadow")
      : null;
  sun.shadow.intensity =
    shadowOverride !== null && shadowOverride.trim() !== "" && Number.isFinite(Number(shadowOverride))
      ? Math.max(0, Math.min(1, Number(shadowOverride)))
      : 1.0;
  // Keep the player's projected body shape legible in the single WebGPU map.
  sun.shadow.radius = quality.name === "low" ? 1.0 : quality.name === "high" ? 0.65 : 0.85;
  sun.shadow.autoUpdate = true;
  scene.add(sun, sun.target);

  const direction = new THREE.Vector3(0.5, 0.7, 0.3).normalize();
  const focus = new THREE.Vector3();
  let hasFocusOverride = false;
  return {
    N: 1,
    splits: quality.splits,
    lights: [sun],
    sun,
    setSunDirection(next) {
      direction.copy(next).normalize();
      sun.shadow.needsUpdate = true;
    },
    setFocus(point) {
      hasFocusOverride = !!point;
      if (point) focus.copy(point);
    },
    setCharacter() {},
    update(camera) {
      if (!hasFocusOverride) camera.getWorldPosition(focus);
      sun.target.position.copy(focus);
      sun.position
        .copy(focus)
        .addScaledVector(direction, quality.shadowFar * 0.75);
      sun.target.updateMatrixWorld();
      sun.updateMatrixWorld();
    },
  };
}
