// @ts-nocheck
// Subway entrance material with matching WebGL and WebGPU clipping/depth paths.
import * as TSL from "three/tsl";
import { createPartMaterial } from "../partMaterials.ts";
import { usesNodeMaterialBackend, usesWebGPUBackend } from "../../render/backendState.ts";
import { lazyShaderSections } from "../../shaderSections.ts";
import propsShaderSource from "../webgl2Shader/glsl/props.glsl?raw";

const propsShader = lazyShaderSections(() => propsShaderSource);
// Subway stair pits live below the sidewalk surface. Their fragments are kept only where the view ray passes through
// the stair opening, and their depth is rewritten to (just above) the opening plane — so the pit shows through the
// sidewalk exactly inside the railing, yet people/props in front of the opening still occlude it normally.
export function subwayPitMaterial() {
  const m = createPartMaterial({
    name: "subwaypit",
    instanceTint: true,
    instanceState: true,
  });
  if (usesNodeMaterialBackend()) {
    const instanceTransform = TSL.modelWorldMatrix.mul(TSL.referenceAttribute("instanceMatrix", "mat4"));
    const cameraLocal = TSL.varying(
      instanceTransform.inverse().mul(TSL.vec4(TSL.cameraPosition, 1)).xyz,
      "vSubwayPitCameraLocal",
    );
    const localPosition = TSL.varying(TSL.positionGeometry, "vSubwayPitGeometryPosition");
    const height = cameraLocal.y;
    const denominator = height.sub(localPosition.y).max(1e-3);
    const tA = height.sub(0.035).div(denominator);
    const tB = height.sub(0.006).div(denominator);
    const openingPoint = cameraLocal.add(localPosition.sub(cameraLocal).mul(tB));
    m.maskNode = height.greaterThan(0.04)
      .and(openingPoint.x.abs().lessThan(2.27))
      .and(openingPoint.z.abs().lessThan(0.83));
    const depthMix = localPosition.y.negate().div(4).clamp(0, 1);
    const depthPosition = TSL.positionView.mul(TSL.mix(tA, tB, depthMix));
    const clipPosition = TSL.cameraProjectionMatrix.mul(TSL.vec4(depthPosition, 1));
    const projectedDepth = clipPosition.z.div(clipPosition.w);
    m.depthNode = usesWebGPUBackend()
      ? projectedDepth
      : projectedDepth.mul(0.5).add(0.5);
    return m;
  }
  const base = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    base(sh, r);
    sh.vertexShader = sh.vertexShader
      .replace(
        "#include <common>",propsShader.vertexCommonByPitCameraPosition,
      )
      .replace(
        "#include <project_vertex>",propsShader.vertexProjectVertexByPitCameraPosition,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",propsShader.fragmentCommonByPitCameraPosition,
      )
      .replace(
        "#include <clipping_planes_fragment>",propsShader.fragmentClipping,
      );
  };
  return m;
}
