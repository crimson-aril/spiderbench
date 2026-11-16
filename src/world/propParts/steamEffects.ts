// @ts-nocheck
import * as THREE from "three";
import { MeshBuilder } from "../meshBuilder.ts";
import { MATERIAL_PART } from "../partMaterials.ts";
import { usesNodeMaterialBackend } from "../../render/backendState.ts";
import { createSteamNodeMaterial } from "../webGPUShaderNodes/steamNodes.ts";
import { lazyShaderSections } from "../../shaderSections.ts";
import propsShaderSource from "../webgl2Shader/glsl/props.glsl?raw";

const propsShader = lazyShaderSections(() => propsShaderSource);
// Con-Ed style steam stack (orange/white striped tube) standing on the roadway over a manhole
export function steamStack() {
  const b = new MeshBuilder();
  const r = 0.36,
    H = 2.6,
    n = 6;
  for (let i = 0; i < n; i++) {
    b.setPart(MATERIAL_PART.PAINT).setColor(i % 2 ? 0xd4cfc4 : 0xb45a2c); // (street r6) grimy, sun-faded (was neon orange / white)
    b.cyl(0, 0.02 + (i * H) / n, 0, r, r * 0.98, H / n, 14, false);
  }
  b.setPart(MATERIAL_PART.RUBBER)
    .setColor(0x151515)
    .cyl(0, H, 0, r * 0.98, r * 0.9, 0.08, 14, false);
  b.setColor(0x222222).cyl(0, 0, 0, 0.5, 0.48, 0.05, 14, true);
  return b.build({ part: true });
}

// Rising steam puffs: instanced camera-facing quads animated in the vertex shader (per instance: vent xyz + seed).
// Subtle, like the manhole steam in ref 1: thin, soft-edged wisps that billow out of the stack, drift downwind and
// dissolve within a few metres. Lit by the scene (sun + sky) with a forward-scatter lift when backlit; the alpha is
// kept low (<= ~0.2 per puff, fading by age, height and camera distance) so the draw order of the overlapping,
// depth-sorted-by-vent puffs is invisible; fragments below ~1% alpha are discarded.
export function createSteam(T, vents, time) {
  const PUFFS = 18;
  const quad = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = quad.index;
  geo.setAttribute("position", quad.attributes.position);
  geo.setAttribute("uv", quad.attributes.uv);
  geo.setAttribute("normal", quad.attributes.normal);
  const data = new Float32Array(vents.length * PUFFS * 4);
  const attr = new THREE.InstancedBufferAttribute(data, 4);
  attr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("aPuff", attr);
  geo.instanceCount = 0;
  const mat = usesNodeMaterialBackend()
    ? createSteamNodeMaterial(T.noise, time)
    : new THREE.MeshStandardMaterial({
    color: 0xcfd2d4,
    roughness: 1,
    transparent: true,
    depthWrite: false,
    alphaMap: T.noise,
  });
  if (!usesNodeMaterialBackend()) mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = time;
    sh.vertexShader = sh.vertexShader
      .replace(
        "#include <common>",propsShader.vertexCommon,
      )
      .replace(
        "#include <beginnormal_vertex>",propsShader.vertexBeginNormalVertex,
      )
      .replace(
        "#include <begin_vertex>",propsShader.vertexBeginVertex,
      )
      .replace(
        "#include <project_vertex>",propsShader.vertexProjectVertex,
      )
      .replace(
        "#include <worldpos_vertex>",propsShader.vertexWorldPositionVertex,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",propsShader.fragmentCommon,
      )
      .replace(
        "#include <alphamap_fragment>",propsShader.fragmentAlphaMap,
      )
      .replace(
        "#include <emissivemap_fragment>",propsShader.fragmentEmissive,
      );
  };
  mat.customProgramCacheKey = () => "city-steam-v3";
  const mesh = new THREE.Mesh(geo, mat);
  // back-to-front by vent (puffs of one vent overlap each other softly; vents overlapping each other must sort)
  const order = vents.map((v, i) => i),
    dist = new Float32Array(vents.length);
  let lastSort = -1;
  mesh.onBeforeRender = (r, sc, cam) => {
    const t = time.value;
    if (Math.abs(t - lastSort) < 0.25) return;
    lastSort = t;
    const cp = cam.position;
    let n = 0;
    for (let i = 0; i < vents.length; i++) {
      const v = vents[i];
      dist[i] = (v.x - cp.x) ** 2 + (v.z - cp.z) ** 2;
    }
    order.sort((a, b) => dist[b] - dist[a]);
    for (const i of order) {
      if (dist[i] > 330 * 330) continue;
      const v = vents[i];
      // oldest (highest, largest) puffs first within a vent
      const base = fract(t * 0.11 + v.seed);
      // puff k has age fract(base + k/PUFFS): oldest first = descending age -> start just below the wrap point
      const k0 = (PUFFS - Math.floor(base * PUFFS) - 1 + PUFFS) % PUFFS;
      for (let j = 0; j < PUFFS; j++) {
        const k = (k0 - j + PUFFS) % PUFFS,
          o = n++ * 4;
        data[o] = v.x;
        data[o + 1] = v.y;
        data[o + 2] = v.z;
        data[o + 3] = k / PUFFS + v.seed;
      }
    }
    geo.instanceCount = n;
    if (n) {
      attr.clearUpdateRanges();
      attr.addUpdateRange(0, n * 4);
      attr.needsUpdate = true;
    }
  };
  return mesh;
}
const fract = (x) => x - Math.floor(x);
