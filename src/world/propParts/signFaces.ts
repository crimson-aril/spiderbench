// @ts-nocheck
import * as THREE from "three";
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";
import { nightK, screenK } from "../../render/daynight.ts";
import { usesNodeMaterialBackend } from "../../render/backendState.ts";
import { getAdvertisingAtlasTexture, getSignAtlasTexture, getSignCellAverageLinearRgb } from "../advertisingTextures.ts";
import { screenLightSet } from "../screenlights.ts";
import { createTimesSquareBladeFaceNodeMaterial } from "../webGPUShaderNodes/timesSquareNodes.ts";
import { lazyShaderSections } from "../../shaderSections.ts";
import propsShaderSource from "../webgl2Shader/glsl/props.glsl?raw";

const propsShader = lazyShaderSections(() => propsShaderSource);
// (night r5) blade-sign faces: both sides of every projecting blade sign (props bladeSign(): box z 0.25..1.15, y 3.35..5.25,
// half thickness 0.07) as one instanced quad draw. A ts_signs.webp cell per sign (shop names on coloured boards), the text
// running up the face (NYC vertical blade signs), lit from inside: emissive with a darker rim, screenK-compensated so the
// night face tops out ~170 sRGB (critic r5 cap). Faces beyond the blade pool's far distance (300 m) collapse in the vertex
// shader (the frames are culled there). The blade point lights (cityLights provider above) take the board colour.
export const bladeSignCol = []; // per blade item: linear board colour (filled when the atlas image arrives)
export function bladeFaces(scene, items) {
  const T = 0.07,
    Y0 = 3.35,
    Y1 = 5.25,
    Z0 = 0.25,
    Z1 = 1.15,
    n = items.length * 2;
  const geo = new THREE.PlaneGeometry(1, 1);
  const cellA = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4);
  const mesh = new THREE.InstancedMesh(geo, null, n);
  const m = new THREE.Matrix4(),
    l = new THREE.Matrix4(),
    q = new THREE.Quaternion(),
    Y = new THREE.Vector3(0, 1, 0),
    v = new THREE.Vector3(),
    sc = new THREE.Vector3(Z1 - Z0 - 0.14, Y1 - Y0 - 0.16, 1);
  const cellOf = [];
  items.forEach((it, i) => {
    const h =
        Math.abs(
          (Math.floor(it.x * 3.7) * 73856093) ^
            (Math.floor(it.z * 5.3) * 19349663),
        ) >>> 0,
      c = h % 64;
    cellOf.push(c);
    const u0 = (c % 4) / 4 + 2 / 2048,
      du = 0.25 - 4 / 2048,
      v0 = 1 - (Math.floor(c / 4) + 1) / 16 + 2 / 2048,
      dv = 1 / 16 - 4 / 2048;
    for (const sx of [-1, 1]) {
      const k = i * 2 + (sx > 0 ? 1 : 0);
      cellA.setXYZW(k, u0 + du * 0.05, v0 + dv * 0.03, du * 0.9, dv * 0.94); // trim the board bevel / long-name ends
      m.makeRotationY(it.ry || 0).setPosition(it.x, it.y || 0, it.z);
      l.compose(
        v.set(sx * (T + 0.005), (Y0 + Y1) / 2, (Z0 + Z1) / 2),
        q.setFromAxisAngle(Y, (sx * Math.PI) / 2),
        sc,
      );
      mesh.setMatrixAt(k, m.multiply(l));
    }
  });
  geo.setAttribute("aCell", cellA);
  const signAtlas = getSignAtlasTexture();
  const nodeBackend = usesNodeMaterialBackend();
  const mat = nodeBackend
    ? createTimesSquareBladeFaceNodeMaterial(signAtlas)
    : new THREE.MeshStandardMaterial({
      map: signAtlas,
      roughness: 0.3,
      metalness: 0,
    });
  const uni = { uScreenK: screenK, uNightK: nightK };
  if (!nodeBackend) mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uni);
    sh.vertexShader = sh.vertexShader
      .replace(
        "#include <common>",propsShader.vertexCommonByFaceUv,
      )
      .replace(
        "#include <uv_vertex>",propsShader.vertexUvVertex,
      )
      .replace(
        "#include <project_vertex>",propsShader.vertexProjectVertexGrassFarCull,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",propsShader.fragmentCommonByFaceUv,
      )
      .replace(
        "#include <emissivemap_fragment>",propsShader.fragmentEmissiveByFaceUv,
      );
  };
  mat.customProgramCacheKey = () => "blade-faces-n6";
  mesh.material = mat;
  mesh.name = "bladeFaces";
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  mesh.computeBoundingSphere();
  scene.add(mesh);
  // Board-colour metadata is precomputed from the atlas so it remains available without a raster source image.
  void getSignCellAverageLinearRgb().then((averages) => {
    if (!averages.length) return;
    const normalized = averages.map(([red, green, blue]) => {
      const maximum = Math.max(red, green, blue, 1e-4);
      return [red / maximum, green / maximum, blue / maximum];
    });
    for (let i = 0; i < items.length; i++) {
      bladeSignCol[i] = normalized[cellOf[i]];
    }
  });
  return mesh;
}

// ad faces: one instanced quad (10 x 4.1 m) per billboard, atlas cell per instance, gently lit
export function billboardFaces(scene, items, ads) {
  // (billboards r2) unit quad; per item size / local offset (bus-shelter panels, shed posters), default = rooftop 10 x 4.1
  const geo = new THREE.PlaneGeometry(1, 1);
  // (billboards r1) real ad art: landscape cells of the Times Square atlas (ts_ads.webp top half, 8 x 8 cells 512x256),
  // centre-cropped to the 10 x 4.1 panel; cell by position hash (64 ads instead of the 8 canvas placeholders)
  const cell = new THREE.InstancedBufferAttribute(
    new Float32Array(items.length * 4),
    4,
  );
  const gainA = new THREE.InstancedBufferAttribute(
    new Float32Array(items.length),
    1,
  );
  items.forEach((it, i) => {
    const j =
      (Math.abs(
        (Math.floor(it.x * 7.1 + (it.lx ?? 0) * 3) * 73856093) ^
          (Math.floor(it.z * 3.3) * 19349663),
      ) >>>
        0) %
      64;
    const e = 2 / 4096,
      asp = (it.w ?? 10) / (it.h ?? 4.1);
    if (it.port) {
      // portrait cells (bottom half, 16 x 4 of 256 x 512)
      const du0 = 1 / 16 - 2 * e,
        dv0 = 1 / 8 - 2 * e,
        k = Math.min(1, asp / 0.5),
        kv = Math.min(1, 0.5 / asp);
      cell.setXYZW(
        i,
        (j % 16) / 16 + e + (du0 * (1 - k)) / 2,
        0.5 - (Math.floor(j / 16) + 1) / 8 + e + (dv0 * (1 - kv)) / 2,
        du0 * k,
        dv0 * kv,
      );
    } else {
      const du = 1 / 8 - 2 * e,
        dv0 = 1 / 16 - 2 * e,
        dv = dv0 * Math.min(1, 2 / asp);
      cell.setXYZW(
        i,
        (j % 8) / 8 + e,
        1 - (Math.floor(j / 8) + 1) / 16 + e + (dv0 - dv) / 2,
        du,
        dv,
      );
    }
    gainA.setX(i, it.gain ?? 0.06);
  });
  geo.setAttribute("aCell", cell);
  geo.setAttribute("aGain", gainA);
  const tex = getAdvertisingAtlasTexture(); // (billboards r3) shared GPU copy (src/world/advertisingTextures.ts)
  void ads;
  let mat;
  if (usesNodeMaterialBackend()) {
    mat = new WEBGPU.MeshStandardNodeMaterial({ roughness: 0.6 });
    mat.name = "CityAds.TSL";
    const cellV = TSL.varying(TSL.attribute("aCell", "vec4"), "vAdCell");
    const gainV = TSL.varying(TSL.attribute("aGain", "float"), "vAdGain");
    // Procedural atlas cells use bottom-origin UVs; the KTX2 ad atlas is top-origin (KTXorientation=rd).
    const atlasUv = cellV.xy.add(TSL.uv().mul(cellV.zw)).flipY();
    const atlasColor = TSL.texture(tex, atlasUv).rgb;
    const luma = TSL.dot(atlasColor, TSL.vec3(0.3, 0.55, 0.15));
    const color = TSL.mix(atlasColor, TSL.vec3(luma), 0.18)
      .mul(0.9)
      .add(0.012);
    const night = TSL.uniform(nightK.value);
    night.onRenderUpdate(() => {
      night.value = nightK.value;
    });
    mat.colorNode = color;
    mat.emissiveNode = color.mul(TSL.mix(gainV, gainV.max(0.25), night));
  } else {
    mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.6,
      emissive: 0xffffff,
      emissiveMap: tex,
      emissiveIntensity: 0.06,
    });
    mat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",propsShader.vertexCommonByGain,
        )
        .replace(
          "#include <fog_vertex>",propsShader.vertexFogVertex,
        )
        .replace(
          "#include <uv_vertex>",propsShader.vertexUvVertexByEmissiveMapUv,
        );
      sh.uniforms.uNightK = nightK; // (night r9)
      sh.fragmentShader = sh.fragmentShader
        .replace(
          "#include <common>",propsShader.fragmentCommonByGain,
        )
        .replace(
          "#include <emissivemap_fragment>",propsShader.fragmentEmissiveByGain,
        )
        .replace(
          "#include <map_fragment>",propsShader.fragmentMap,
        );
    };
    mat.customProgramCacheKey = () => "city-ads-v3n";
  }
  const mesh = new THREE.InstancedMesh(geo, mat, items.length);
  const m = new THREE.Matrix4(),
    l = new THREE.Matrix4(),
    q = new THREE.Quaternion(),
    Y = new THREE.Vector3(0, 1, 0);
  // (night r9) every lit face is a light: rooftop prints (floodlit: reflect their colours) and back-lit shelter / newsstand
  // lightboxes, split by image region (screenlights.ts); wheat-paste posters (gain < 0.05) are unlit
  const SLP = screenLightSet(),
    cx = new THREE.Vector3(),
    cy = new THREE.Vector3(),
    cz = new THREE.Vector3(),
    cp = new THREE.Vector3();
  items.forEach((it, i) => {
    m.makeRotationY(it.ry).setPosition(it.x, it.y, it.z);
    l.compose(
      new THREE.Vector3(it.lx ?? 0, it.ly ?? 6.1, it.lz ?? 0.13),
      q.setFromAxisAngle(Y, it.fr ?? 0),
      new THREE.Vector3(it.w ?? 10, it.h ?? 4.1, 1),
    );
    mesh.setMatrixAt(i, m.multiply(l));
    const g = it.gain ?? 0.06;
    if (g >= 0.05) {
      m.extractBasis(cx, cy, cz);
      cp.setFromMatrixPosition(m);
      const w = cx.length(),
        h = cy.length();
      cx.normalize();
      cz.normalize();
      cp.addScaledVector(cz, 0.03);
      const c = cell.array,
        k = i * 4,
        uv = [c[k], c[k + 1], c[k] + c[k + 2], c[k + 1] + c[k + 3]];
      if (g < 0.2)
        SLP.rect(cp.toArray(), cz.toArray(), cx.toArray(), w, h, null, 1, {
          uv,
          printed: true,
        });
      else
        SLP.rect(cp.toArray(), cz.toArray(), cx.toArray(), w, h, null, 1, {
          uv,
          gain: (0.8 * g) / 0.55,
          range: 9,
        });
    }
  });
  SLP.commit("propAds", { mergeA: 0 });
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  mesh.name = "billboard-ads";
  mesh.computeBoundingSphere();
  scene.add(mesh);
  return { mesh, update() {} };
}
