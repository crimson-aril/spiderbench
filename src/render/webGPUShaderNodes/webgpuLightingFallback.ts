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
  diagnosticFacadeFill: "isolated" | "replace-emission" | false = false,
): { nodePbr: number; classicPbr: number } {
  if (renderer?.backend?.isWebGPUBackend !== true) return { nodePbr: 0, classicPbr: 0 };

  const ambientFillNode = typeof ambientFill === "number" ? float(ambientFill) : ambientFill;
  const verticalFillNode = typeof verticalFill === "number" ? float(verticalFill) : verticalFill;
  const patched = { nodePbr: 0, classicPbr: 0 };
  const facadeMaterials = new Map<object, {
    name: string;
    uuid: string | null;
    references: number;
    isNodeMaterial: boolean;
    isNodeStandardPhysical: boolean;
    fallbackEligibleNodePbr: boolean;
    isClassicPbr: boolean;
    lights: boolean | null;
    hasEmissiveNodeBeforePatch: boolean;
    hasEmissiveNodeAfterPatch: boolean;
    alreadyPatched: boolean;
    patchedThisPass: boolean;
  }>();
  let facadeObjectCount = 0;
  let facadeMaterialReferenceCount = 0;

  scene?.traverse?.((object: any) => {
    const materials = Array.isArray(object.material)
      ? object.material
      : object.material
        ? [object.material]
        : [];
    const objectFacadeMaterials = materials.filter((material: any) => material?.userData?.nodeFacade);
    if (object.isMesh && objectFacadeMaterials.length > 0) facadeObjectCount++;

    for (const material of materials) {
      const isNodeStandardPhysical = material?.isNodeMaterial && (
        material.isMeshStandardNodeMaterial || material.isMeshPhysicalNodeMaterial
      );
      const isNodePbr = isNodeStandardPhysical && material.lights === true;
      const isClassicPbr = material?.isMeshStandardMaterial || material?.isMeshPhysicalMaterial;
      const isFacade = material?.userData?.nodeFacade === true;
      if (isFacade) {
        facadeMaterialReferenceCount++;
        const existing = facadeMaterials.get(material);
        if (existing) {
          existing.references++;
        } else {
          facadeMaterials.set(material, {
            name: material.name || material.type || "unnamed",
            uuid: material.uuid ?? null,
            references: 1,
            isNodeMaterial: !!material.isNodeMaterial,
            isNodeStandardPhysical: !!isNodeStandardPhysical,
            fallbackEligibleNodePbr: !!isNodePbr,
            isClassicPbr: !!isClassicPbr,
            lights: typeof material.lights === "boolean" ? material.lights : null,
            hasEmissiveNodeBeforePatch: material.emissiveNode != null,
            hasEmissiveNodeAfterPatch: material.emissiveNode != null,
            alreadyPatched: patchedMaterials.has(material),
            patchedThisPass: false,
          });
        }
      }
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
      // The constant albedo floor keeps non-facade props from going near-black, but it also
      // replaces every albedo channel below it with the same flat value. Facade wall textures
      // (brick, mortar, dark glass) sit mostly under that floor, so the unshadowed emissive fill
      // erased their variation and tinted them blue-grey. Materials that author their own albedo
      // detail opt out with userData.webgpuAmbientFloor = false so the fill stays proportional
      // to the albedo, as a diffuse ambient term should be.
      const useAlbedoFloor = material.userData?.webgpuAmbientFloor !== false;
      const fillAlbedo = useAlbedoFloor ? albedo.max(vec3(0.28, 0.32, 0.38)) : albedo;
      const fill = fillAlbedo
        .mul(ambientFillNode)
        .mul(materialFillScale)
        .mul(sideFacingFill);

      if (isFacade && diagnosticFacadeFill) {
        // Render the computed fill through emissive on actual facade meshes.
        // The isolated mode also removes authored color and standard lighting;
        // replace-emission mode preserves those and changes only the emission.
        if (diagnosticFacadeFill === "isolated") {
          material.colorNode = vec3(0);
          material.lights = false;
        }
        material.emissiveNode = fill;
      } else {
        // `materialEmissive` reads the authored emissive color, intensity, and
        // map independently of emissiveNode, so preserve them on normal runs.
        const authoredEmission = material.emissiveNode ?? materialEmissive;
        material.emissiveNode = vec3(authoredEmission).add(fill);
      }
      material.needsUpdate = true;
      patchedMaterials.add(material);
      if (isFacade) {
        const diagnostic = facadeMaterials.get(material);
        if (diagnostic) {
          diagnostic.patchedThisPass = true;
          diagnostic.hasEmissiveNodeAfterPatch = material.emissiveNode != null;
        }
      }
      if (isNodePbr) patched.nodePbr++;
      else patched.classicPbr++;
    }
  });

  if (facadeMaterialReferenceCount > 0) {
    const uniqueFacadeMaterials = [...facadeMaterials.values()];
    const facadePassSummary = {
      diagnosticFacadeFill,
      facadeMeshCount: facadeObjectCount,
      facadeMaterialReferenceCount,
      uniqueFacadeMaterialCount: uniqueFacadeMaterials.length,
      patchedFacadeMaterialCount: uniqueFacadeMaterials.filter((material) => material.patchedThisPass).length,
      alreadyPatchedFacadeMaterialCount: uniqueFacadeMaterials.filter((material) => material.alreadyPatched).length,
      facadeMaterials: uniqueFacadeMaterials,
    };
    // Emit serialized text so browser-console exports retain the per-material
    // details instead of collapsing the object to `{…}`.
    console.info(`[lighting-fallback] facade material pass ${JSON.stringify(facadePassSummary)}`);
  }

  return patched;
}