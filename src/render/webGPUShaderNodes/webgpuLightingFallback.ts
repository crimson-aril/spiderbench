import {
  float,
  materialEmissive,
  materialColor,
  normalWorld,
  smoothstep,
  vec3,
} from "three/tsl";

// Keep this per-material so callers may safely re-run the pass after streamed
// scene content is attached without stacking emissive fill every time.
const patchedMaterials = new WeakSet<object>();

/**
 * Standard/physical materials do not receive the legacy surface shader's
 * diffuse ambient term. WebGPURenderer converts classic materials to nodes
 * internally, so attach a diffuse ambient term to both material forms before
 * conversion. Keep the source albedo material-local: the shared diffuseColor
 * property can be evaluated before its assignment in emissiveNode graphs and
 * produce a black scene on WebGPU.
 *
 * WebGL2 is intentionally untouched; its legacy surface shader keeps using the
 * shared sky, street bounce, and canyon lighting model.
 */
export function applyWebGPULightingFallback(
  scene: any,
  renderer: any,
  ambientFill: any = 0.65,
  verticalFill: any = 1.2,
): { nodePbr: number; classicPbr: number } {
  if (renderer?.backend?.isWebGPUBackend !== true) return { nodePbr: 0, classicPbr: 0 };

  const ambientFillNode = typeof ambientFill === "number" ? float(ambientFill) : ambientFill;
  const verticalFillNode = typeof verticalFill === "number" ? float(verticalFill) : verticalFill;
  const patched = { nodePbr: 0, classicPbr: 0 };

  scene?.traverse?.((object: any) => {
    const materials = Array.isArray(object.material)
      ? object.material
      : object.material
        ? [object.material]
        : [];

    for (const material of materials) {
      const isNodePbr = material?.isNodeMaterial && material.lights === true && (
        material.isMeshStandardNodeMaterial || material.isMeshPhysicalNodeMaterial
      );
      const isClassicPbr = material?.isMeshStandardMaterial || material?.isMeshPhysicalMaterial;
      if ((!isNodePbr && !isClassicPbr) || patchedMaterials.has(material)) continue;

      // Read the material's authored base color node, or the TSL materialColor
      // accessor for classic materials so their map is included. Avoid
      // diffuseColor: that mutable shader property is assigned as part of the
      // same fragment graph and can be unresolved when referenced by emissiveNode.
      const albedo = material.colorNode
        ? vec3(material.colorNode)
        : materialColor;
      const materialFillScale = Number.isFinite(material.userData?.webgpuAmbientFillScale)
        ? material.userData.webgpuAmbientFillScale
        : 1;
      const verticality = float(1).sub(normalWorld.y.abs()).max(0).min(1);
      const sideFacingFill = float(1).add(
        smoothstep(0.2, 0.85, verticality).mul(verticalFillNode),
      );
      // Raise minimum albedo floor and fill intensity to prevent near-black surfaces
      const fill = albedo.max(vec3(0.28, 0.32, 0.38)) // Raised from (0.16, 0.18, 0.2)
        .mul(ambientFillNode)
        .mul(materialFillScale)
        .mul(sideFacingFill);

      // `materialEmissive` reads the authored emissive color, intensity, and
      // map independently of emissiveNode, so the fallback preserves them.
      const authoredEmission = material.emissiveNode ?? materialEmissive;
      material.emissiveNode = vec3(authoredEmission).add(fill);
      material.needsUpdate = true;
      patchedMaterials.add(material);
      if (isNodePbr) patched.nodePbr++;
      else patched.classicPbr++;
    }
  });

  return patched;
}
