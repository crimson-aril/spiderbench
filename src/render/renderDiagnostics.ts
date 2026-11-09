// @ts-nocheck
import * as THREE from "three";

const MATERIAL_LIMIT = 24;
const OBJECT_LIMIT = 16;
const TEXTURE_SLOTS = [
  "map",
  "emissiveMap",
  "normalMap",
  "roughnessMap",
  "metalnessMap",
  "aoMap",
  "alphaMap",
  "lightMap",
  "envMap",
  "clearcoatMap",
  "clearcoatNormalMap",
];

export function isRenderDebugEnabled(query: URLSearchParams): boolean {
  return query.has("renderdebug") || query.has("tsldebug");
}

function round(value: number | null | undefined, places = 4) {
  if (!Number.isFinite(value)) return null;
  return Number(Number(value).toFixed(places));
}

function vector(value: any) {
  if (!value) return null;
  if (typeof value.toArray === "function") return value.toArray().map((n) => round(n));
  return null;
}

function plainValue(value: any): any {
  if (value == null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return round(value);
  if (Array.isArray(value)) return value.map(plainValue);
  if (value.isColor) return `#${value.getHexString()}`;
  if (typeof value.toArray === "function") return vector(value);
  return undefined;
}

function textureInfo(texture: any) {
  if (!texture?.isTexture) return null;
  const image = texture.image ?? texture.source?.data;
  const imageData = Array.isArray(image) ? image[0] : image;
  return {
    name: texture.name || null,
    colorSpace: texture.colorSpace ?? null,
    mapping: texture.mapping ?? null,
    format: texture.format ?? null,
    type: texture.type ?? null,
    channel: texture.channel ?? null,
    version: texture.version ?? null,
    width: imageData?.width ?? null,
    height: imageData?.height ?? null,
    ready: (imageData?.width ?? 0) > 0 && (imageData?.height ?? 0) > 0,
  };
}

function materialInfo(material: any) {
  const maps: Record<string, unknown> = {};
  for (const slot of TEXTURE_SLOTS) {
    const texture = material?.[slot];
    if (texture?.isTexture) maps[slot] = textureInfo(texture);
  }
  const color = material?.color?.getHexString?.();
  const emissive = material?.emissive?.getHexString?.();
  let customProgramCacheKey = null;
  try {
    customProgramCacheKey = material?.customProgramCacheKey?.() ?? null;
  } catch (error) {
    customProgramCacheKey = `threw: ${String(error)}`;
  }
  return {
    id: material?.id ?? null,
    name: material?.name || null,
    type: material?.type || material?.constructor?.name || "unknown",
    nodeMaterial: !!material?.isNodeMaterial,
    lights: material?.lights ?? null,
    hasLightsNode: material?.lightsNode != null,
    allowOverride: material?.allowOverride ?? null,
    shaderMaterial: !!material?.isShaderMaterial,
    rawShaderMaterial: !!material?.isRawShaderMaterial,
    customOnBeforeCompile: !!material?.onBeforeCompile &&
      material.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile,
    customProgramCacheKey,
    color: color ? `#${color}` : null,
    colorNode: material?.colorNode?.constructor?.name ?? null,
    emissive: emissive ? `#${emissive}` : null,
    emissiveIntensity: round(material?.emissiveIntensity),
    emissiveNode: material?.emissiveNode?.constructor?.name ?? null,
    roughness: round(material?.roughness),
    metalness: round(material?.metalness),
    side: material?.side ?? null,
    transparent: material?.transparent ?? null,
    opacity: round(material?.opacity),
    alphaTest: round(material?.alphaTest),
    vertexColors: material?.vertexColors ?? null,
    toneMapped: material?.toneMapped ?? null,
    maps,
  };
}

function objectPriority(object: any, material: any) {
  const text = `${object?.name ?? ""} ${material?.name ?? ""} ${object?.type ?? ""} ${material?.type ?? ""}`.toLowerCase();
  let score = 0;
  for (const [word, weight] of [
    ["player", 100], ["spider", 95], ["ground", 80], ["road", 78],
    ["asphalt", 76], ["sidewalk", 74], ["building", 62], ["facade", 60],
    ["farland", 50], ["city", 35], ["tree", 20], ["sky", 5],
  ] as const) {
    if (text.includes(word)) score += weight;
  }
  return score;
}

function collectScene(scene: any) {
  const lights: any[] = [];
  const materials = new Map<any, { objects: any[]; score: number }>();
  const emptyDrawObjects: any[] = [];
  let meshCount = 0;
  let visibleMeshCount = 0;
  let materialSlots = 0;

  const visit = (object: any, parentVisible: boolean) => {
    const visible = parentVisible && object.visible !== false;
    if (object.isLight) lights.push({ light: object, visible });
    if (object.isMesh || object.isSkinnedMesh || object.isInstancedMesh) {
      meshCount++;
      if (visible) visibleMeshCount++;
      const geometry = object.geometry;
      const positionCount = geometry?.attributes?.position?.count ?? 0;
      const indexCount = geometry?.index?.count ?? null;
      const drawCount = geometry?.drawRange?.count ?? Infinity;
      const effectiveCount = Math.min(drawCount, indexCount ?? positionCount);
      const zeroGroups = (geometry?.groups ?? [])
        .map((group, index) => ({ index, start: group.start, count: group.count, materialIndex: group.materialIndex }))
        .filter((group) => group.count === 0);
      if (visible && (!positionCount || effectiveCount === 0 || zeroGroups.length > 0)) {
        emptyDrawObjects.push({
          object: object.name || object.type,
          type: object.type,
          material: Array.isArray(object.material)
            ? object.material.map((m) => m?.name || m?.type)
            : object.material?.name || object.material?.type || null,
          positionCount,
          indexCount,
          zeroLengthGroups: zeroGroups,
          groupCount: geometry?.groups?.length ?? 0,
          drawRange: geometry?.drawRange
            ? { start: geometry.drawRange.start, count: geometry.drawRange.count }
            : null,
        });
      }
      if (visible) {
        const objectName = object.name || object.type || "unnamed mesh";
        const slots = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of slots) {
          if (!material) continue;
          materialSlots++;
          const current = materials.get(material) ?? { objects: [], score: 0 };
          if (current.objects.length < 4) {
            current.objects.push({
              name: objectName,
              type: object.type,
              castShadow: !!object.castShadow,
              receiveShadow: !!object.receiveShadow,
              frustumCulled: object.frustumCulled,
            });
          }
          current.score = Math.max(current.score, objectPriority(object, material));
          materials.set(material, current);
        }
      }
    }
    for (const child of object.children ?? []) visit(child, visible);
  };
  visit(scene, true);

  const materialRows = [...materials]
    .sort((a, b) => b[1].score - a[1].score || (a[0].id ?? 0) - (b[0].id ?? 0))
    .slice(0, MATERIAL_LIMIT)
    .map(([material, ref]) => ({ objects: ref.objects, ...materialInfo(material) }));
  const visibleMaterials = [...materials.keys()];
  const standardMaterials = visibleMaterials.filter((material) =>
    material.isMeshStandardMaterial || material.isMeshPhysicalMaterial ||
    material.isMeshStandardNodeMaterial || material.isMeshPhysicalNodeMaterial,
  );
  const materialTypeCounts = visibleMaterials.reduce((counts, material) => {
    const type = material.type || material.constructor?.name || "unknown";
    counts[type] = (counts[type] ?? 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  const lightRows = lights.map(({ light, visible }) => {
    const position = light.getWorldPosition?.(new THREE.Vector3());
    const direction = light.isDirectionalLight || light.isSpotLight
      ? light.getWorldDirection?.(new THREE.Vector3())
      : null;
    const targetPosition = light.target?.getWorldPosition?.(new THREE.Vector3());
    return {
      name: light.name || light.type || "unknown",
      type: light.type || light.constructor?.name || "unknown",
      visible,
      intensity: round(light.intensity, 3),
      color: light.color?.getHexString?.() ? `#${light.color.getHexString()}` : null,
      position: vector(position),
      direction: vector(direction),
      target: vector(targetPosition),
      castShadow: !!light.castShadow,
      shadow: light.shadow
        ? {
            mapReady: !!light.shadow.map,
            mapSize: vector(light.shadow.mapSize),
            bias: round(light.shadow.bias, 6),
            normalBias: round(light.shadow.normalBias, 5),
            radius: round(light.shadow.radius, 2),
          }
        : null,
    };
  });

  return {
    meshCount,
    visibleMeshCount,
    uniqueVisibleMaterialCount: materials.size,
    visibleMaterialSlots: materialSlots,
    materialTypeCounts,
    standardPhysicalMaterialCount: standardMaterials.length,
    standardPhysicalUsingRendererLights: standardMaterials.filter((material) =>
      material.lights === true && material.lightsNode == null,
    ).length,
    standardPhysicalWithCustomLightsNode: standardMaterials.filter((material) => material.lightsNode != null).length,
    standardPhysicalWithLightingDisabled: standardMaterials.filter((material) => material.lights === false).length,
    standardPhysicalWithColorNode: standardMaterials.filter((material) => !!material.colorNode).length,
    standardPhysicalWithEmissiveNode: standardMaterials.filter((material) => !!material.emissiveNode).length,
    sceneLightCount: lights.length,
    visibleSceneLightCount: lights.filter((row) => row.visible).length,
    zeroDrawDataObjectCount: emptyDrawObjects.length,
    zeroDrawDataSamples: emptyDrawObjects.slice(0, OBJECT_LIMIT),
    environment: {
      present: !!scene.environment,
      texture: textureInfo(scene.environment),
      environmentIntensity: round(scene.environmentIntensity),
      environmentNode: scene.environmentNode?.constructor?.name ?? null,
      background: scene.background?.isColor
        ? `#${scene.background.getHexString()}`
        : scene.background?.constructor?.name ?? null,
      fog: scene.fog
        ? {
            type: scene.fog.type,
            color: scene.fog.color?.getHexString?.()
              ? `#${scene.fog.color.getHexString()}`
              : null,
            near: round(scene.fog.near),
            far: round(scene.fog.far),
            density: round(scene.fog.density, 7),
          }
        : null,
      fogNode: scene.fogNode?.constructor?.name ?? null,
    },
    lights: lightRows,
    materialSamples: materialRows,
  };
}

function rendererInfo(renderer: any) {
  const drawingBuffer = renderer.getDrawingBufferSize?.(new THREE.Vector2());
  const size = renderer.getSize?.(new THREE.Vector2());
  const caps = renderer.capabilities;
  const toneMappingNames = {
    [THREE.NoToneMapping]: "NoToneMapping",
    [THREE.LinearToneMapping]: "LinearToneMapping",
    [THREE.ReinhardToneMapping]: "ReinhardToneMapping",
    [THREE.CineonToneMapping]: "CineonToneMapping",
    [THREE.ACESFilmicToneMapping]: "ACESFilmicToneMapping",
    [THREE.CustomToneMapping]: "CustomToneMapping",
  };
  return {
    renderer: renderer.isWebGPURenderer ? "WebGPURenderer" : "WebGLRenderer",
    backend: renderer.backend?.constructor?.name ?? null,
    isWebGPUBackend: renderer.backend?.isWebGPUBackend ?? null,
    isWebGLBackend: renderer.backend?.isWebGLBackend ?? null,
    threeRevision: THREE.REVISION,
    outputColorSpace: renderer.outputColorSpace ?? null,
    toneMapping: renderer.toneMapping ?? null,
    toneMappingName: toneMappingNames[renderer.toneMapping] ?? "unknown",
    toneMappingExposure: round(renderer.toneMappingExposure),
    pixelRatio: round(renderer.getPixelRatio?.()),
    canvasSizeCss: vector(size),
    drawingBuffer: vector(drawingBuffer),
    canvas: renderer.domElement
      ? {
          width: renderer.domElement.width,
          height: renderer.domElement.height,
          cssWidth: renderer.domElement.clientWidth,
          cssHeight: renderer.domElement.clientHeight,
        }
      : null,
    shadowMap: renderer.shadowMap
      ? {
          enabled: renderer.shadowMap.enabled,
          type: renderer.shadowMap.type,
          autoUpdate: renderer.shadowMap.autoUpdate,
        }
      : null,
    capabilities: caps
      ? {
          maxTextures: caps.maxTextures ?? null,
          maxTextureSize: caps.maxTextureSize ?? null,
          maxSamples: caps.maxSamples ?? null,
          logarithmicDepthBuffer: caps.logarithmicDepthBuffer ?? null,
          reversedDepthBuffer: caps.reversedDepthBuffer ?? null,
        }
      : null,
  };
}

export function logRenderDebugSetup({ renderer, scene, camera, lighting, quality, grade, backend, webgpuDiffuseFallback }: any) {
  const cameraPosition = camera.getWorldPosition?.(new THREE.Vector3());
  const cameraDirection = camera.getWorldDirection?.(new THREE.Vector3());
  const tod = lighting?.tod ?? {};
  const plainGrade: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(grade ?? {})) {
    const plain = plainValue(value);
    if (plain !== undefined) plainGrade[key] = plain;
  }
  const q: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(quality ?? {})) {
    const plain = plainValue(value);
    if (plain !== undefined) q[key] = plain;
  }
  const snapshot = {
    backend,
    renderer: rendererInfo(renderer),
    camera: {
      type: camera.type,
      position: vector(cameraPosition),
      direction: vector(cameraDirection),
      fov: round(camera.fov),
      near: round(camera.near),
      far: round(camera.far),
      aspect: round(camera.aspect),
      reversedDepth: camera.reversedDepth ?? null,
    },
    quality: q,
    timeOfDay: Object.fromEntries(
      ["name", "hour", "elevation", "azimuth", "night", "exposure", "bloom", "windows", "sunK", "moonK", "rain"]
        .filter((key) => tod[key] !== undefined)
        .map((key) => [key, plainValue(tod[key])]),
    ),
    lighting: {
      environmentIntensity: round(lighting?.envIntensity),
      fog: lighting?.fog
        ? {
            density: round(lighting.fog.density, 7),
            startDistance: round(lighting.fog.startDistance, 3),
            heightFalloff: round(lighting.fog.heightFalloff, 7),
            tint: vector(lighting.fog.tint),
            shafts: round(lighting.fog.shafts),
          }
        : null,
      nightHaze: lighting?.nightHaze
        ? { k: round(lighting.nightHaze.k), low: lighting.nightHaze.low, high: lighting.nightHaze.high }
        : null,
      cityLights: lighting?.cityLights
        ? {
            enabled: lighting.cityLights.enabled ?? null,
            activeNodeLightCount: lighting.cityLights.nodeLights?.length ?? null,
            stats: lighting.cityLights.stats ? { ...lighting.cityLights.stats } : null,
          }
        : null,
      diffuseAmbient: lighting?.amb
        ? {
            grade: vector(lighting.amb.grade),
            bounce: vector(lighting.amb.bounce),
            shape: vector(lighting.amb.shape),
            vertical: vector(lighting.amb.vert),
            city: vector(lighting.amb.city),
          }
        : null,
      webgpuDiffuseFallback: renderer.backend?.isWebGPUBackend === true
        ? {
            ...(webgpuDiffuseFallback ?? {
              mode: "TSL albedo ambient + side-facing fill",
              ambientFill: grade?.ambientFill ?? null,
              sideFacingFill: grade?.verticalAmbientFill ?? null,
            }),
            skyTexture: textureInfo(lighting?.sky?.renderEnv?.()),
            skyTextureUsedByFallback: false,
          }
        : null,
    },
    post: plainGrade,
    scene: collectScene(scene),
  };
  console.info(`[render-debug] ${backend} scene/renderer snapshot\n${JSON.stringify(snapshot, null, 2)}`);
  if (typeof window !== "undefined") (window as any).__renderDebugSnapshot = snapshot;
  return snapshot;
}

export function renderDebugBands(width: number, height: number) {
  const sampleHeight = Math.min(24, Math.max(1, Math.floor(height / 3)));
  return [0.18, 0.5, 0.82].map((position) => ({
    x: 0,
    y: Math.max(0, Math.min(height - sampleHeight, Math.round((height - sampleHeight) * position))),
    width,
    height: sampleHeight,
  }));
}

function halfToFloat(value: number): number {
  const sign = value & 0x8000 ? -1 : 1;
  const exponent = (value >>> 10) & 0x1f;
  const fraction = value & 0x03ff;
  if (exponent === 0) return sign * 2 ** -14 * (fraction / 1024);
  if (exponent === 0x1f) return fraction === 0 ? sign * Infinity : Number.NaN;
  return sign * 2 ** (exponent - 15) * (1 + fraction / 1024);
}

function readChannel(pixels: Uint8Array | Uint16Array | Float32Array, index: number) {
  const value = pixels[index] ?? 0;
  if (pixels instanceof Uint16Array) return halfToFloat(value);
  if (pixels instanceof Uint8Array) return value / 255;
  return value;
}

function percentile(sorted: number[], fraction: number) {
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))] ?? 0;
}

export function summarizeRenderDebugBands(pixelBands: Array<Uint8Array | Uint16Array | Float32Array>, bands: any[], target: any) {
  const samples: number[] = [];
  const rgb = [0, 0, 0];
  let alphaSum = 0;
  let alphaCovered = 0;
  let finiteCount = 0;
  const bandStats = pixelBands.map((pixels, bandIndex) => {
    const lumas: number[] = [];
    let count = 0;
    for (let i = 0; i + 3 < pixels.length; i += 32) {
      const r = readChannel(pixels, i);
      const g = readChannel(pixels, i + 1);
      const b = readChannel(pixels, i + 2);
      const a = readChannel(pixels, i + 3);
      const luma = r * 0.2126 + g * 0.7152 + b * 0.0722;
      if (!Number.isFinite(luma)) continue;
      lumas.push(luma);
      samples.push(luma);
      rgb[0] += r;
      rgb[1] += g;
      rgb[2] += b;
      alphaSum += a;
      if (a > 0.5) alphaCovered++;
      count++;
      finiteCount++;
    }
    lumas.sort((a, b) => a - b);
    return {
      y: bands[bandIndex]?.y ?? null,
      height: bands[bandIndex]?.height ?? null,
      sampledPixels: count,
      medianLinearLuma: round(percentile(lumas, 0.5), 5),
      p90LinearLuma: round(percentile(lumas, 0.9), 5),
      meanLinearLuma: round(lumas.reduce((sum, value) => sum + value, 0) / Math.max(1, lumas.length), 5),
    };
  });
  samples.sort((a, b) => a - b);
  const median = percentile(samples, 0.5);
  return {
    backendReadback: typeof target === "object" ? "RGBA render-target readback" : "unknown",
    target: `${target?.width ?? "?"}x${target?.height ?? "?"}`,
    targetFormat: target?.texture
      ? { format: target.texture.format, type: target.texture.type, colorSpace: target.texture.colorSpace }
      : null,
    pixelFormat: pixelBands[0]?.constructor?.name ?? "unknown",
    samplePattern: "3 full-width 24px bands; one pixel sampled per 8 source pixels",
    bands: bandStats,
    sampledPixels: finiteCount,
    medianSceneLinearLuma: round(median, 5),
    p90SceneLinearLuma: round(percentile(samples, 0.9), 5),
    meanSceneLinearRgb: rgb.map((value) => round(value / Math.max(1, finiteCount), 5)),
    meanAlpha: round(alphaSum / Math.max(1, finiteCount), 5),
    alphaCoverage: `${Math.round((alphaCovered / Math.max(1, finiteCount)) * 100)}%`,
    pixelsBelow1PercentLinear: `${Math.round((samples.filter((value) => value < 0.01).length / Math.max(1, finiteCount)) * 100)}%`,
    sampleStage: "scene pass, before post-processing, tone mapping, and display conversion",
    indicatesDarkScenePass: median < 0.025,
  };
}

export async function readRenderDebugBands(renderer: any, target: any, { forceSync = false } = {}) {
  const bands = renderDebugBands(target.width, target.height);
  const asyncRead = renderer.readRenderTargetPixelsAsync;
  const targetType = target?.texture?.type;
  const makeBuffer = (band: any) => {
    const length = band.width * band.height * 4;
    if (targetType === THREE.FloatType) return new Float32Array(length);
    if (targetType === THREE.UnsignedByteType) return new Uint8Array(length);
    return new Uint16Array(length);
  };
  const pixels = !forceSync && typeof asyncRead === "function"
    ? await Promise.all(bands.map((band) => asyncRead.call(renderer, target, band.x, band.y, band.width, band.height)))
    : bands.map((band) => {
        const buffer = makeBuffer(band);
        renderer.readRenderTargetPixels(target, band.x, band.y, band.width, band.height, buffer);
        return buffer;
      });
  return {
    bands,
    pixels,
    summary: {
      ...summarizeRenderDebugBands(pixels, bands, target),
      readbackMode: forceSync ? "synchronous renderer readback" : "asynchronous renderer readback",
    },
  };
}
