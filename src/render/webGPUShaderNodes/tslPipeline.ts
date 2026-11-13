import {
  ACESFilmicToneMapping,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  NoToneMapping,
  RenderPipeline,
  Vector2,
  Vector3,
} from "three/webgpu";
import {
  dot,
  float,
  fract,
  log2,
  exp2,
  mix,
  mrt,
  normalView,
  normalWorld,
  output,
  pass,
  packNormalToRGB,
  sin,
  smoothstep,
  sqrt,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
  velocity,
  toneMapping,
  convertToTexture,
  fog as fogComposite,
  positionView,
  positionWorld,
  sRGBTransferEOTF,
  sRGBTransferOETF,
} from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { ssr } from "three/addons/tsl/display/SSRNode.js";
import { traa } from "three/addons/tsl/display/TRAANode.js";
import { dof } from "three/addons/tsl/display/DepthOfFieldNode.js";
import { motionBlur } from "three/addons/tsl/display/MotionBlur.js";
import { godrays } from "three/addons/tsl/display/GodraysNode.js";
import { cityLights } from "../citylights.ts";
import { applyWebGPULightingFallback } from "./webgpuLightingFallback.ts";
import {
  isRenderDebugEnabled,
  logRenderDebugSetup,
  renderDebugBands,
  summarizeRenderDebugBands,
} from "../renderDiagnostics.ts";
import { N8AONode } from "./n8ao/N8AONode.ts";
import { DepthType } from "n8ao-webgpu";

function halfToFloat(value: number): number {
  const sign = value & 0x8000 ? -1 : 1;
  const exponent = (value >>> 10) & 0x1f;
  const fraction = value & 0x03ff;
  if (exponent === 0) return sign * 2 ** -14 * (fraction / 1024);
  if (exponent === 0x1f) return fraction === 0 ? sign * Infinity : Number.NaN;
  return sign * 2 ** (exponent - 15) * (1 + fraction / 1024);
}

/**
 * Node-based scene and post pipeline shared by WebGPU and WebGPURenderer's
 * WebGL2 backend. `pass()` renders the scene into node textures, then
 * RenderPipeline presents the composed result with display conversion.
 */
export function createTslPipeline({ renderer, scene, camera, lighting, quality }: any) {
  const query = typeof location !== "undefined"
    ? new URLSearchParams(location.search)
    : new URLSearchParams();
  const tslDebug = renderer.backend?.isWebGPUBackend === true && query.has("tsldebug");
  const renderDebug = isRenderDebugEnabled(query);
  const tslMaterialTest = renderer.backend?.isWebGPUBackend === true
    ? query.get("tsltest")
    : null;
  const requestedLightProbe = renderer.backend?.isWebGPUBackend === true
    ? query.get("lprobe")
    : null;
  const tslLightProbe = (["nolights", "ambient", "hemi", "sun", "albedo"] as const)
    .find((mode) => mode === requestedLightProbe) ?? null;
  const usesLightProbe = tslLightProbe !== null;
  const usesAuthoredAlbedoProbe = tslLightProbe === "albedo";
  const requestedTslPostMode = renderer.backend?.isWebGPUBackend === true
    ? query.get("tslpost")
    : null;
  const tslPostMode = requestedTslPostMode === "raw" || requestedTslPostMode === "aces"
    ? requestedTslPostMode
    : null;
  const usesMaterialProbe = (usesLightProbe && !usesAuthoredAlbedoProbe)
    || tslMaterialTest === "solid"
    || tslMaterialTest === "lit"
    || tslMaterialTest === "normal"
    || tslMaterialTest === "emis";
  const disablesProbeShadows = usesLightProbe
    || tslMaterialTest === "lit"
    || tslMaterialTest === "emis";
  const tslDisableSun = renderer.backend?.isWebGPUBackend === true && query.has("nosun");
  const tslDisableSkySunVisuals = (tslDisableSun || (usesLightProbe && tslLightProbe !== "sun"))
    && !!lighting?.sky?.sunVisualNode;
  const tslDisableShadows = renderer.backend?.isWebGPUBackend === true
    && (query.has("noshadow") || usesLightProbe);
  const lightProbeTarget = tslLightProbe === "ambient"
    ? "AmbientLight"
    : tslLightProbe === "hemi"
      ? "HemisphereLight"
      : tslLightProbe === "sun"
        ? "NodeSun"
        : null;
  const applySunDisable = () => {
    if (!tslDisableSun) return;
    scene.traverse((object: any) => {
      if (object.name === "NodeSun") object.visible = false;
    });
  };
  const applyLightProbeSelection = () => {
    if (!usesLightProbe) {
      applySunDisable();
      return;
    }
    scene.traverse((object: any) => {
      if (!object.isLight) return;
      // Reapply before rendering because streamed city lights can be rebuilt by lighting.update().
      object.visible = lightProbeTarget !== null && (object.name || object.type) === lightProbeTarget;
      object.castShadow = false;
    });
  };
  if (tslDisableShadows) {
    if (renderer.shadowMap) renderer.shadowMap.enabled = false;
    scene.traverse((object: any) => {
      if (object.isLight) object.castShadow = false;
    });
  }
  if (tslDisableSkySunVisuals) lighting.sky.sunVisualNode.value = 0;
  applyLightProbeSelection();
  const tslDisableEnvironment = renderer.backend?.isWebGPUBackend === true && query.has("tslnoenv");
  const requestedAmbientFill = query.has("tslfill") ? Number(query.get("tslfill")) : NaN;
  const probeAmbientFill = quality?.name === "low" ? 1.2 : 1.0;
  const probeVerticalFill = quality?.name === "low" ? 1.0 : 0.8;
  // Some authored WebGPU material graphs remain underlit in shadowed regions
  // even though a plain Standard probe responds to the renderer's scene lights.
  // Supply a restrained diffuse albedo fill in normal rendering, keeping it
  // lower on high quality to avoid over-brightening that preset.
// Increase WebGPU fallback fill to match WebGL2's missing diffuse bounce
  const productionAmbientFill = renderer.backend?.isWebGPUBackend !== true
    ? 0
    : quality?.name === "low"
      ? 1.15  // Increased from 0.55
      : quality?.name === "high"
        ? 0.75  // Increased from 0.2
        : 0.95; // Increased from 0.35
  const productionVerticalFill = renderer.backend?.isWebGPUBackend !== true
    ? 0
    : quality?.name === "low"
      ? 0.85  // Increased from 0.45
      : quality?.name === "high"
        ? 0.5   // Increased from 0.2
        : 0.7;  // Increased from 0.3
  const nodeAmbientFillBase = usesAuthoredAlbedoProbe
    ? 0
    : Number.isFinite(requestedAmbientFill)
      ? Math.max(0, Math.min(4, requestedAmbientFill))
      : tslDisableEnvironment
        ? probeAmbientFill
        : productionAmbientFill;
  const nodeVerticalFillBase = usesAuthoredAlbedoProbe
    ? 0
    : tslDisableEnvironment
      ? probeVerticalFill
      : Number.isFinite(requestedAmbientFill)
        ? 0
        : productionVerticalFill;
  const previousFogNode = scene.fogNode;
  const fogColorNode = uniform(lighting?.fog?.tint?.clone?.() ?? new Vector3(0.84, 0.9, 1));
  const fogStartNode = uniform(lighting?.fog?.startDistance ?? 35);
  const fogDensityNode = uniform(lighting?.fog?.density ?? 0.00013);
  const fogHeightFalloffNode = uniform(lighting?.fog?.heightFalloff ?? 1 / 300);
  const fogDepth = positionView.z.negate();
  const fogDistance = smoothstep(
    fogStartNode,
    fogStartNode.add(float(1).div(fogDensityNode.max(1e-6))),
    fogDepth,
  );
  const fogHeight = fogHeightFalloffNode.mul(positionWorld.y.max(0)).negate().exp();
  const nodeFog = fogComposite(fogColorNode, fogDistance.mul(fogHeight));
  scene.fogNode = nodeFog;

  const grade = {
    autoExposure: true,
    aeKey: -2.05,
    // Keep camera-driven exposure changes subtle in the WebGPU path.
    aeStrength: 0.24,
    aeRange: 0.45,
    aeDeadband: 0.08,
    aeSpeedUp: 0.45,
    aeSpeedDown: 0.35,
    exposure: 0.8,
    toe: 0.34,
    saturation: 1.14,
    saturationKnee: 0.72,
    contrast: 1.18,
    pivot: 0.18,
    vignette: 0.28,
    grain: 0.012,
    bloom: 0.11,
    lift: new Vector3(-0.004, -0.004, -0.003),
    gamma: new Vector3(1, 1, 1),
    gain: new Vector3(1.015, 1, 0.975),
    whiteBalance: new Vector3(1, 1, 1),
    splitShadow: new Vector3(0.95, 1, 1.07),
    splitHigh: new Vector3(1.035, 1, 0.95),
    splitBalance: 0.3,
    nightSplitShadow: new Vector3(0.93, 1, 1.1),
    nightSplitStreet: new Vector3(0.8, 0.96, 1.3),
  };
  const exposureNode = uniform(grade.exposure);
  const saturationNode = uniform(grade.saturation);
  const saturationKneeNode = uniform(grade.saturationKnee);
  const contrastNode = uniform(grade.contrast);
  const pivotNode = uniform(grade.pivot);
  const vignetteNode = uniform(grade.vignette);
  const grainNode = uniform(grade.grain);
  const liftNode = uniform(grade.lift.clone());
  const gammaNode = uniform(grade.gamma.clone());
  const gainNode = uniform(grade.gain.clone());
  const whiteBalanceNode = uniform(grade.whiteBalance.clone());
  const splitShadowNode = uniform(grade.splitShadow.clone());
  const splitHighNode = uniform(grade.splitHigh.clone());
  const splitBalanceNode = uniform(grade.splitBalance);
  const warmGuardNode = uniform(0);
  const aspectNode = uniform(1);
  const frameNode = uniform(0);
  // WebGPU's CPU-baked sky remains available for explicit TSL reflections,
  // but is not bound as scene.environment because its automatic PMREM path
  // blacks out PBR output. Use the material albedo fill for diffuse bounce.
  const nodeAmbientFill = uniform(nodeAmbientFillBase);
  const nodeVerticalFill = uniform(nodeVerticalFillBase);
  // Leave lightsNode unset on materials so WebGPURenderer's scene pass can
  // bind its own per-scene LightsNode. Manually assigning a second LightsNode
  // bypasses that render-list binding and can leave standard materials black.
  const filledMaterials = new WeakSet<object>();
  const solidProbeMaterials = new WeakSet<object>();
  const solidProbeOptOutNames: string[] = [];
  let probeShadowReceiversDisabled = 0;
  let filledMaterialCount = 0;
  let filledNodePbrCount = 0;
  let filledClassicPbrCount = 0;
  let lightingFallbackSync = () => {};
  let lightingFallbackMode = "not installed";
  let aoNode: any = null;
  const prepareMaterialProbeOverrides = () => {
    if (!usesMaterialProbe) return;
    scene.traverse((object: any) => {
      // Lighting probes disable shadow reception so a shadow map cannot mask
      // the individual light contribution being inspected.
      if (disablesProbeShadows && object.isMesh && object.receiveShadow) {
        object.receiveShadow = false;
        probeShadowReceiversDisabled++;
      }
      const materials = Array.isArray(object.material)
        ? object.material
        : object.material
          ? [object.material]
          : [];
      for (const material of materials) {
        if (!material || solidProbeMaterials.has(material)) continue;
        if (material.allowOverride !== true) {
          solidProbeOptOutNames.push(`${object.name || object.type}: ${material.name || material.type}`);
        }
        // Preserve the authored sky as a blue reference while forcing every
        // world material through the diagnostic scene override.
        material.allowOverride = object.name !== "NodeSkyDome";
        solidProbeMaterials.add(material);
      }
    });
  };
  const installNodeAlbedoFill = () => {
    if (usesAuthoredAlbedoProbe) {
      lightingFallbackMode = "authored material albedo probe";
      return;
    }
    let testMaterialCount = 0;
    scene.traverse((object: any) => {
      const materials = Array.isArray(object.material)
        ? object.material
        : object.material
          ? [object.material]
          : [];
      for (const material of materials) {
        const standardNodeMaterial = material?.isNodeMaterial && (
          material.isMeshStandardNodeMaterial || material.isMeshPhysicalNodeMaterial
        );
        if (!standardNodeMaterial) continue;

        if (tslMaterialTest && !filledMaterials.has(material)) {
          material.lights = false;
          if (tslMaterialTest === "solid") {
            material.colorNode = vec3(0.35, 0.45, 0.6);
            material.emissiveNode = vec3(0);
          }
          material.needsUpdate = true;
          filledMaterials.add(material);
          testMaterialCount++;
          continue;
        }
      }
    });
    if (tslMaterialTest) {
      filledMaterialCount += testMaterialCount;
      return;
    }
    if (nodeAmbientFill.value === 0 && nodeVerticalFill.value === 0) {
      // Keep authored materials intact when the TSL diffuse fallback is off.
      lightingFallbackMode = "renderer lights only";
      return;
    }
    const fillStats = applyWebGPULightingFallback(
      scene,
      renderer,
      nodeAmbientFill,
      nodeVerticalFill,
    );
    lightingFallbackMode = "TSL albedo ambient + side-facing fill";
    filledNodePbrCount += fillStats.nodePbr;
    filledClassicPbrCount += fillStats.classicPbr;
    filledMaterialCount += fillStats.nodePbr + fillStats.classicPbr;
  };
  installNodeAlbedoFill();
  let authoredAlbedoProbeMaterialCount = 0;
  const disableAuthoredAlbedoProbeLighting = () => {
    if (!usesAuthoredAlbedoProbe) return;
    scene.traverse((object: any) => {
      const materials = Array.isArray(object.material)
        ? object.material
        : object.material
          ? [object.material]
          : [];
      for (const material of materials) {
        const standardNodeMaterial = material?.isNodeMaterial && (
          material.isMeshStandardNodeMaterial || material.isMeshPhysicalNodeMaterial
        );
        if (!standardNodeMaterial || material.lights === false) continue;
        material.lights = false;
        material.needsUpdate = true;
        authoredAlbedoProbeMaterialCount++;
      }
    });
  };
  if (usesAuthoredAlbedoProbe) {
    disableAuthoredAlbedoProbeLighting();
    // Repeat after streamed scene content has had a chance to attach materials.
    setTimeout(() => {
      disableAuthoredAlbedoProbeLighting();
      console.info(`[tsl] authored albedo probe rescan disabled lighting on ${authoredAlbedoProbeMaterialCount} node PBR materials`);
    }, 4000);
  }
  console.info(`[tsl] lighting mode: ${lightingFallbackMode}; ${filledNodePbrCount} node PBR + ${filledClassicPbrCount} classic PBR materials patched (${filledMaterialCount} total)`);
  if (usesAuthoredAlbedoProbe) {
    console.info(`[tsl] authored albedo probe: lighting disabled on ${authoredAlbedoProbeMaterialCount} node PBR materials; waiting for a 4s streamed-material rescan`);
  }
  const logTslDebugSetup = () => {
    const nodeMaterials = new Set<any>();
    const standardMaterials = new Set<any>();
    const standardMaterialsUsingRendererLights = new Set<any>();
    const standardMaterialsWithCustomLights = new Set<any>();
    const standardMaterialsWithLightingDisabled = new Set<any>();
    const sceneLights: any[] = [];
    let meshCount = 0;
    let visibleMeshCount = 0;
    scene.traverse((object: any) => {
      if (object.isLight) sceneLights.push(object);
      if (object.isMesh) {
        meshCount++;
        if (object.visible) visibleMeshCount++;
      }
      const materials = Array.isArray(object.material)
        ? object.material
        : object.material
          ? [object.material]
          : [];
      for (const material of materials) {
        if (!material?.isNodeMaterial) continue;
        nodeMaterials.add(material);
        if (!material.isMeshStandardNodeMaterial && !material.isMeshPhysicalNodeMaterial) continue;
        standardMaterials.add(material);
        if (material.lightsNode == null) standardMaterialsUsingRendererLights.add(material);
        else standardMaterialsWithCustomLights.add(material);
        if (material.lights !== true) standardMaterialsWithLightingDisabled.add(material);
      }
    });
    const lights = sceneLights.map((light: any) => ({
      name: light.name || light.type || light.constructor?.name || "unknown",
      type: light.type || light.constructor?.name || "unknown",
      visible: light.visible,
      intensity: Number.isFinite(light.intensity) ? Number(light.intensity.toFixed(3)) : null,
      castShadow: light.castShadow,
      color: light.color?.getHexString?.() ?? null,
      shadowMap: !!light.shadow?.map,
      shadowIntensity: Number.isFinite(light.shadow?.intensity)
        ? Number(light.shadow.intensity.toFixed(3))
        : null,
      shadowRadius: Number.isFinite(light.shadow?.radius)
        ? Number(light.shadow.radius.toFixed(3))
        : null,
    }));
    const diagnostics = {
      backend: "WebGPU",
      quality: quality?.name ?? "unknown",
      output: {
        colorSpace: renderer.outputColorSpace,
        toneMapping: renderer.toneMapping,
        exposure: renderer.toneMappingExposure,
        drawingBuffer: renderer.getDrawingBufferSize?.(new Vector2()).toArray?.() ?? null,
      },
      scene: {
        nodeMaterialCount: nodeMaterials.size,
        standardPhysicalMaterialCount: standardMaterials.size,
        standardPhysicalUsingRendererLights: standardMaterialsUsingRendererLights.size,
        standardPhysicalWithCustomLightsNode: standardMaterialsWithCustomLights.size,
        standardPhysicalWithLightingDisabled: standardMaterialsWithLightingDisabled.size,
        standardPhysicalWithColorNode: [...standardMaterials].filter((material) => !!material.colorNode).length,
        standardPhysicalWithEmissiveNode: [...standardMaterials].filter((material) => !!material.emissiveNode).length,
        meshCount,
        visibleMeshCount,
        albedoFillMaterialCount: filledMaterialCount,
        materialTestMode: tslMaterialTest ?? "off",
        lightProbeMode: tslLightProbe ?? "off",
        authoredAlbedoProbeMaterialCount,
        sceneOverrideMaterial: usesMaterialProbe,
        sunDisabledByQuery: tslDisableSun,
        skySunVisualsDisabledByQuery: tslDisableSkySunVisuals,
        shadowsDisabledByQuery: tslDisableShadows,
        sceneOverrideOptOutMaterialCount: solidProbeOptOutNames.length,
        sceneOverrideOptOutMaterialSamples: solidProbeOptOutNames.slice(0, 12),
        probeShadowReceiversDisabled,
        sceneLightCount: sceneLights.length,
        environment: scene.environment?.isTexture
          ? {
              mapping: scene.environment.mapping,
              width: scene.environment.image?.width ?? scene.environment.source?.data?.width ?? null,
              height: scene.environment.image?.height ?? scene.environment.source?.data?.height ?? null,
              isRenderTargetTexture: scene.environment.isRenderTargetTexture,
              disabledByProbe: tslDisableEnvironment,
            }
          : { present: !!scene.environment, disabledByProbe: tslDisableEnvironment },
        cityLightNodeCount: cityLights.nodeLights?.length ?? 0,
        cityLightsEnabled: cityLights.enabled,
        cityLightStats: { ...cityLights.stats },
        lights,
      },
      post: {
        diagnosticMode: tslPostMode ?? "full",
        autoExposure: grade.autoExposure,
        exposure: grade.exposure,
        exposureEv: exposureAdaptation.ev,
        exposureTargetEv: exposureAdaptation.targetEv,
        ambientFill: nodeAmbientFill.value,
        verticalAmbientFill: nodeVerticalFill.value,
        ambientFillMaterialCounts: {
          nodePbr: filledNodePbrCount,
          classicPbrConvertedByWebGPU: filledClassicPbrCount,
        },
        diffuseAmbientFallback: {
          mode: lightingFallbackMode,
          patchedMaterials: {
            nodePbr: filledNodePbrCount,
            classicPbrConvertedByWebGPU: filledClassicPbrCount,
          },
          ambientFill: nodeAmbientFill.value,
          sideFacingFill: nodeVerticalFill.value,
        },
        ambientOcclusion: {
          enabled: !!quality?.ao,
              implementation: aoNode ? "n8ao-webgpu N8AONode" : "disabled",
          quality: quality?.aoQuality ?? null,
              resolutionScale: aoNode?.configuration?.halfRes ? 0.5 : 1,
              samples: aoNode?.configuration?.aoSamples ?? null,
        },
        fogDensity: lighting?.fog?.density ?? null,
      },
    };
    console.warn(`[tsl-debug] WebGPU lighting and color-pipeline snapshot\n${JSON.stringify(diagnostics, null, 2)}`);
    if (!sceneLights.some((light) => light.visible !== false)) {
      console.warn("[tsl-debug] the scene has no visible lights for the renderer to bind");
    }
    if (standardMaterials.size > 0 && standardMaterialsWithCustomLights.size > 0) {
      console.warn("[tsl-debug] some standard/physical materials have custom LightsNodes and bypass the renderer's scene lights");
    }
  };
  const resolution = new Vector2(1, 1);
  const exposureAdaptation = {
    ev: 0,
    targetEv: 0,
    sampleElapsed: 0.25,
    pending: false,
    failed: false,
  };
  let tslDebugSampleLogged = false;
  let tslDebugSetupLogged = false;
  let renderDebugSampleLogged = false;
  let renderDebugSetupLogged = false;
  let renderDebugPostLogged = false;
  let renderDebugExposureMeterLogged = false;
  let renderDebugFrame = 0;
  let tslDebugBoundLightsLogged = false;
  let tslDebugBuilderHook: ((builder: any, renderObject: any) => void) | null = null;
  let previousNodeBuilderHook: ((builder: any, renderObject: any) => void) | null = null;

  const scenePass = pass(scene, camera);
  if (usesMaterialProbe) {
    // `solid` bypasses materials and lights to validate geometry/pass output.
    // `lit` uses one plain TSL Standard material to test renderer lights
    // independently of the authored per-material graphs.
    // `normal` visualizes world-space normals without scene lighting.
    // `emis` uses a black Standard material with constant emissive output.
    // `lprobe` selects one renderer light or disables Standard-material lights.
    prepareMaterialProbeOverrides();
    let probeMaterial: any;
    if (usesLightProbe) {
      probeMaterial = new MeshStandardNodeMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0 });
      if (tslLightProbe === "nolights") probeMaterial.lights = false;
    } else if (tslMaterialTest === "solid") {
      probeMaterial = new MeshBasicNodeMaterial({ color: 0xff00ff });
    } else if (tslMaterialTest === "normal") {
      probeMaterial = new MeshBasicNodeMaterial({ color: 0xffffff });
      probeMaterial.colorNode = normalWorld.mul(0.5).add(0.5);
    } else if (tslMaterialTest === "emis") {
      probeMaterial = new MeshStandardNodeMaterial({ color: 0x000000, roughness: 0.85 });
      probeMaterial.emissiveNode = vec3(0.3, 0.3, 0.3);
    } else {
      probeMaterial = new MeshStandardNodeMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0 });
    }
    probeMaterial.name = `WebGPU diagnostic ${usesLightProbe ? `lprobe=${tslLightProbe}` : tslMaterialTest} material`;
    probeMaterial.fog = false;
    scenePass.overrideMaterial = probeMaterial;
  }
  // Retain the scene manager for classic materials rendered by the node backend.
  const rendererLighting = renderer.lighting ?? null;
  if (rendererLighting) rendererLighting.enabled = true;
  if (rendererLighting) scenePass.lighting = rendererLighting;
  if ((tslDebug || renderDebug) && renderer.debug) {
    previousNodeBuilderHook = renderer.debug.onNodeBuilderCreated ?? null;
    tslDebugBuilderHook = (builder: any, renderObject: any) => {
      previousNodeBuilderHook?.(builder, renderObject);
      if (tslDebugBoundLightsLogged || renderObject?.scene !== scene) return;

      // Renderer restores its scene LightsNode after each render. Capture the
      // render-list node here, while it still contains the lights for this draw.
      const material = renderObject?.material;
      const isStandardMaterial = material?.isMeshStandardNodeMaterial ||
        material?.isMeshPhysicalNodeMaterial ||
        material?.isMeshStandardMaterial ||
        material?.isMeshPhysicalMaterial;
      if (!isStandardMaterial) return;
      const boundLights = renderObject?.lightsNode?.getLights?.() ?? [];
      const object = renderObject?.object;
      tslDebugBoundLightsLogged = true;
      console.info(`[render-debug] WebGPU render-list scene lights\n${JSON.stringify({
        enabled: rendererLighting?.enabled ?? null,
        count: boundLights.length,
        material: material?.name || material?.type || material?.constructor?.name || "unknown",
        materialLighting: material?.lights ?? null,
        hasCustomLightsNode: material?.lightsNode != null,
        lightsNodeReportsLights: renderObject?.lightsNode?.getScope?.()?.hasLights ?? null,
        object: object?.name || object?.type || object?.constructor?.name || "unknown",
        lights: boundLights.map((light: any) => ({
          name: light.name || light.type || light.constructor?.name || "unknown",
          type: light.type || light.constructor?.name || "unknown",
          visible: light.visible,
          intensity: Number.isFinite(light.intensity) ? Number(light.intensity.toFixed(3)) : null,
        })),
      }, null, 2)}`);
      renderer.debug.onNodeBuilderCreated = previousNodeBuilderHook;
    };
    renderer.debug.onNodeBuilderCreated = tslDebugBuilderHook;
  }
  const needsNormal = !!(quality?.ao || quality?.ssr);
  const needsVelocity = !!quality?.taa || (quality?.motionBlurSamples ?? 0) > 1;
  const attachments: any = { output };
  if (needsNormal) attachments.normal = normalView;
  if (quality?.ao) attachments.aoNormal = packNormalToRGB(normalView);
  if (needsVelocity) attachments.velocity = velocity;
  scenePass.setMRT(mrt(attachments));
  const sceneColor = scenePass.getTextureNode("output");
  const sceneDepth = scenePass.getTextureNode("depth");
  const sceneNormal = needsNormal ? scenePass.getTextureNode("normal") : null;
  const aoNormal = quality?.ao ? scenePass.getTextureNode("aoNormal") : null;
  const sceneVelocity = needsVelocity
    ? scenePass.getTextureNode("velocity")
    : null;

  let outputNode = sceneColor;
  let reflectionNode: any = null;
  let temporalNode: any = null;
  let bloomNode: any = null;
  let godraysNode: any = null;
  let shaftSunColor: any = null;
  let shaftSunGain: any = null;
  // GodraysNode returns a bounded density mask, not HDR in-scatter radiance.
  // Map the scene's ~16.65 daylight sun intensity to unit gain before adding it.
  const shaftSunGainScale = 1 / 16.65;

  // The WebGL2 path currently keeps its experimental SSGI pass disabled. Match
  // that behavior here instead of adding raw, noisy GI on top of the lit pass.
  if (quality?.ao) {
    aoNode = new N8AONode({
      beautyNode: sceneColor,
      depthNode: sceneDepth,
      normalNode: aoNormal,
      beautyTexture: scenePass.getTexture("output"),
      depthTexture: scenePass.getTexture("depth"),
      normalTexture: scenePass.getTexture("aoNormal"),
      scenePassNode: scenePass,
      scene,
      camera,
      depthBufferType: DepthType.Reverse,
    });
    aoNode.setQualityMode(quality.aoQuality ?? "Medium");
    aoNode.configuration.gammaCorrection = false;
    aoNode.configuration.colorMultiply = true;
    aoNode.configuration.halfRes = !!quality.aoHalfRes;
    aoNode.configuration.depthAwareUpsampling = true;
    aoNode.configuration.transparencyAware = false;
    aoNode.configuration.aoRadius = 3.0;
    aoNode.configuration.distanceFalloff = 0.9;
    aoNode.configuration.intensity = 3.4;
    aoNode.configuration.color.setHex(0x0e0b09);
    if (!quality.aoHalfRes) {
      aoNode.configuration.aoSamples = 4;
      aoNode.configuration.denoiseSamples = 4;
      aoNode.configuration.denoiseRadius = 5;
    }
    outputNode = aoNode.getTextureNode();
  }

  if (quality?.ssr) {
    reflectionNode = ssr(sceneColor, sceneDepth, sceneNormal, {
      camera,
      reflectNonMetals: true,
      // The facade node material writes a reflection mask into scene alpha;
      // SSR is composited only where glass requested it below.
      metalnessNode: float(0.04),
      roughnessNode: float(0.2),
    });
    reflectionNode.resolutionScale = 0.5;
    reflectionNode.quality.value = Math.min(1, (quality.ssrSteps ?? 24) / 64);
    reflectionNode.maxDistance.value = 220;
    reflectionNode.thickness.value = 0.2;
    reflectionNode.intensity.value = 0.8;
    const reflectionMask = sceneColor.a.sub(1).clamp(0, 1);
    outputNode = vec4(
      outputNode.rgb.add(reflectionNode.rgb.mul(reflectionMask)),
      outputNode.a,
    );
  }

  if (quality?.shafts && lighting?.sun?.shadow) {
    godraysNode = godrays(sceneDepth, camera, lighting.sun);
    godraysNode.raymarchSteps.value = Math.max(8, quality.shaftSteps ?? 12);
    godraysNode.density.value = 0.45;
    godraysNode.maxDensity.value = 0.22;
    godraysNode.distanceAttenuation.value = 1.5;
    godraysNode.resolutionScale = 0.5;
    shaftSunColor = uniform(lighting.sun.color.clone());
    shaftSunGain = uniform(Math.max(0, Math.min(1, lighting.sun.intensity * shaftSunGainScale)));
    outputNode = vec4(
      outputNode.rgb.add(godraysNode.rgb.mul(shaftSunColor).mul(shaftSunGain)),
      outputNode.a,
    );
  }

  if (quality?.taa) {
    temporalNode = traa(outputNode, sceneDepth, sceneVelocity, camera);
    outputNode = temporalNode;
  }

  if (quality?.bloomLevels > 0) {
    bloomNode = bloom(outputNode, uniform(grade.bloom), 0.35, 0.9);
    bloomNode._nMips = Math.max(1, Math.min(5, quality.bloomLevels));
    outputNode = vec4(
      outputNode.rgb.add(bloomNode.rgb),
      outputNode.a,
    );
  }

  const screenUv = uv();
  const vignette = float(1).sub(
    smoothstep(
      0.25,
      1.05,
      screenUv.sub(0.5).mul(vec2(aspectNode, 1)).length(),
    ).mul(vignetteNode),
  );
  // Match the legacy fragment shader's ACES exposure exactly. Three's built-in
  // ACES divides its exposure by 0.6, while the legacy shader does not, so
  // compensate here before applying the same fitted curve and soft toe.
  const whiteBalancedColor = outputNode.rgb.mul(whiteBalanceNode).mul(vignette);
  const acesColor = toneMapping(
    ACESFilmicToneMapping,
    exposureNode.mul(0.6),
    whiteBalancedColor,
  );
  // The legacy grade applies a soft maximum between fitted ACES and a small
  // linear response before split toning and lift/gamma/gain.
  const toeColor = whiteBalancedColor.mul(exposureNode.mul(grade.toe));
  const displayColor = acesColor
    .add(toeColor)
    .add(
      acesColor.sub(toeColor).pow(2)
        .add(acesColor.add(toeColor).pow(2).mul(0.01))
        .sqrt(),
    )
    .mul(0.5);
  const displayLuma = dot(displayColor, vec3(0.2126, 0.7152, 0.0722));
  let splitTone = mix(
    splitShadowNode,
    splitHighNode,
    smoothstep(
      splitBalanceNode.mul(0.25),
      splitBalanceNode.mul(2.2),
      displayLuma,
    ),
  );
  splitTone = mix(
    splitTone,
    splitHighNode,
    warmGuardNode.mul(smoothstep(
      0.02,
      0.2,
      displayColor.r.sub(displayColor.b).div(displayLuma.max(1e-3)),
    )),
  );
  const splitLuma = dot(splitTone, vec3(0.2126, 0.7152, 0.0722));
  const splitColor = displayColor.mul(splitTone.div(splitLuma.max(1e-3)));
  const liftedSplitColor = splitColor.add(
    liftNode.mul(float(1).sub(splitColor)),
  ).max(0);
  const gainedColor = liftedSplitColor.mul(gainNode).max(0)
    .pow(vec3(1).div(gammaNode));
  const luma = dot(gainedColor, vec3(0.2126, 0.7152, 0.0722));
  let gradedColor = mix(vec3(luma), gainedColor, saturationNode).max(0).min(1);
  const maxChannel = gradedColor.r.max(gradedColor.g).max(gradedColor.b);
  const minChannel = gradedColor.r.min(gradedColor.g).min(gradedColor.b);
  const chroma = maxChannel.sub(minChannel).div(maxChannel.max(1e-4));
  const kneeRange = float(1).sub(saturationKneeNode);
  const compressedChroma = saturationKneeNode.add(
    kneeRange.mul(
      float(1).sub(
        exp2(chroma.sub(saturationKneeNode).div(kneeRange).mul(-1.6 * Math.LOG2E)),
      ),
    ).div(1.6).mul(1.25),
  );
  const chromaScale = compressedChroma.div(chroma.max(1e-4)).max(0).min(1);
  const clippedChromaColor = vec3(maxChannel).sub(
    vec3(maxChannel).sub(gradedColor).mul(chromaScale),
  );
  gradedColor = mix(
    gradedColor,
    clippedChromaColor,
    smoothstep(saturationKneeNode, saturationKneeNode.add(1e-4), chroma),
  );
  const logPivot = log2(pivotNode.max(float(1e-4)));
  gradedColor = exp2(
    log2(gradedColor.max(0).add(float(1e-4)))
      .sub(logPivot)
      .mul(contrastNode)
      .add(logPivot),
  ).sub(float(1e-4)).max(0);
  const highlightShoulder = float(0.62).add(
    float(0.37).mul(
      float(1).sub(
        exp2(gradedColor.sub(0.62).max(0).div(0.37).mul(-Math.LOG2E)),
      ),
    ),
  );
  gradedColor = mix(
    gradedColor,
    highlightShoulder,
    smoothstep(0.62, 0.6201, gradedColor),
  );
  const noise = fract(
    float(52.9829189).mul(
      fract(
        dot(
          screenUv.mul(uniform(resolution)).add(
            fract(frameNode.mul(0.618)).mul(113),
          ),
          vec2(0.06711056, 0.00583715),
        ),
      ),
    ),
  ).sub(0.5);
  // The legacy final pass adds grain and dither in sRGB output space. Apply
  // the same operation here, then convert back to linear so RenderPipeline's
  // output transform performs the one final sRGB conversion. Adding this
  // amount directly to linear light makes the noise several times stronger
  // in dark pixels, which is especially visible on the WebGPU path.
  const grainSrgb = sRGBTransferOETF(gradedColor.max(0).min(1));
  const grainAmplitude = float(1 / 255).add(
    float(1).sub(grainSrgb).mul(grainNode.mul(0.5)),
  );
  const grainLinear = sRGBTransferEOTF(
    grainSrgb.add(noise.mul(grainAmplitude)).max(0).min(1),
  );
  outputNode = vec4(
    grainLinear.xyz,
    outputNode.a,
  );

  const gradedOutputNode = outputNode;
  // Diagnostic outputs bypass the regular post chain so scene-pass values can
  // be compared directly with the presented image. Match the production ACES
  // exposure scaling used above; RenderPipeline still performs sRGB output.
  const diagnosticOutputNode = tslPostMode === "raw"
    ? vec4(sceneColor.rgb, float(1))
    : tslPostMode === "aces"
      ? vec4(
          toneMapping(
            ACESFilmicToneMapping,
            exposureNode.mul(0.6),
            sceneColor.rgb,
          ),
          float(1),
        )
      : gradedOutputNode;
  const bypassOptionalPostEffects = tslPostMode !== null;
  const dofState = { focus: 8, aperture: 0, maxBlur: 16, auto: null as any };
  const motionState = {
    strength: 0,
    samples: Math.floor(quality?.motionBlurSamples ?? 0),
  };
  const focusNode = uniform(dofState.focus);
  const focalLengthNode = uniform(2);
  const apertureNode = uniform(0);
  const motionStrengthNode = uniform(0);
  const focusPosition = new Vector3();
  const cameraWorldPosition = new Vector3();
  let dofNode: any = null;
  let dofEffect: any = null;
  let motionInputTexture: any = null;
  let motionEnabled = false;
  let pipeline: any;

  const rebuildEffects = () => {
    let nextNode = diagnosticOutputNode;
    const previousDof = dofEffect;
    const previousMotionInput = motionInputTexture;
    motionInputTexture = null;
    dofEffect = !bypassOptionalPostEffects && dofNode ? makeDofNode(nextNode) : null;
    if (dofEffect) nextNode = dofEffect;
    if (!bypassOptionalPostEffects && motionEnabled) nextNode = makeMotionNode(nextNode);
    pipeline.outputNode = nextNode;
    pipeline.needsUpdate = true;
    if (previousDof && previousDof !== dofEffect) previousDof.dispose?.();
    if (previousMotionInput && previousMotionInput !== motionInputTexture)
      previousMotionInput.dispose?.();
  };

  const makeDofNode = (inputNode: any) =>
    dof(
      inputNode,
      scenePass.getViewZNode(),
      focusNode,
      focalLengthNode,
      apertureNode,
    );
  const makeMotionNode = (inputNode: any) => {
    motionInputTexture = convertToTexture(inputNode);
    return motionBlur(
      motionInputTexture,
      sceneVelocity.xy.mul(motionStrengthNode),
      motionState.samples,
    );
  };
  const requestExposureSample = () => {
    const renderTarget = scenePass.renderTarget;
    const readPixels = renderer.readRenderTargetPixelsAsync;
    if (
      exposureAdaptation.pending ||
      exposureAdaptation.failed ||
      !renderTarget ||
      typeof readPixels !== "function"
    ) {
      if (renderDebug && !renderDebugSampleLogged && !exposureAdaptation.pending) {
        renderDebugSampleLogged = true;
        console.warn("[render-debug] WebGPU scene-pass sample unavailable", {
          hasRenderTarget: !!renderTarget,
          readbackAvailable: typeof readPixels === "function",
          backend: renderer.backend?.constructor?.name ?? "unknown",
        });
      }
      if (tslDebug && !tslDebugSampleLogged && !exposureAdaptation.pending) {
        tslDebugSampleLogged = true;
        console.warn("[tsl-debug] cannot sample the pre-post scene color target", {
          hasRenderTarget: !!renderTarget,
          readbackAvailable: typeof readPixels === "function",
          backend: renderer.backend?.constructor?.name ?? "unknown",
        });
      }
      return;
    }

    // Meter narrow, full-width bands at several heights. A tiny center crop
    // often contains only sky between buildings, causing auto exposure to
    // darken the whole street scene based on an unrepresentative patch.
    const sampleWidth = renderTarget.width;
    const bandReads = renderDebugBands(renderTarget.width, renderTarget.height);
    const sampleHeight = bandReads[0]?.height ?? 1;
    const sampleContext = {
      frame: renderDebugFrame,
      cameraPosition: camera.getWorldPosition(new Vector3()).toArray(),
      exposureEv: exposureAdaptation.ev,
      exposureTargetEv: exposureAdaptation.targetEv,
      renderCalls: renderer.info?.render?.calls ?? null,
      renderedTriangles: renderer.info?.render?.triangles ?? null,
      effectiveExposure: exposureNode.value,
    };
    exposureAdaptation.pending = true;
    void Promise.all(bandReads.map(({ x, y, width, height }) => readPixels.call(
      renderer,
      renderTarget,
      x,
      y,
      width,
      height,
    ))).then((pixelBands: Array<Uint8Array | Uint16Array | Float32Array>) => {
      const logSamples: Array<{ value: number; weight: number }> = [];
      let redSum = 0;
      let greenSum = 0;
      let blueSum = 0;
      let alphaSum = 0;
      let alphaCoveredPixels = 0;
      for (let bandIndex = 0; bandIndex < pixelBands.length; bandIndex++) {
        const pixels = pixelBands[bandIndex];
        if (!pixels) continue;
        const band = bandReads[bandIndex];
        const channel = (index: number) => {
          const value = pixels[index] ?? 0;
          if (pixels instanceof Uint16Array) return halfToFloat(value);
          if (pixels instanceof Uint8Array) return value / 255;
          return value;
        };
        // Sparse horizontal sampling keeps readback processing inexpensive
        // while covering the full width of each band.
        for (let i = 0; i + 3 < pixels.length; i += 32) {
          const red = channel(i);
          const green = channel(i + 1);
          const blue = channel(i + 2);
          const alpha = channel(i + 3);
          const luminanceValue = red * 0.2126 + green * 0.7152 + blue * 0.0722;
          if (Number.isFinite(luminanceValue)) {
            const pixelIndex = i / 4;
            const x = (band?.x ?? 0) + (pixelIndex % (band?.width ?? sampleWidth));
            const y = (band?.y ?? 0) + Math.floor(pixelIndex / (band?.width ?? sampleWidth));
            const dx = ((x + 0.5) / sampleWidth - 0.5) * 1.6;
            const dy = ((y + 0.5) / renderTarget.height - 0.5) * 1.8;
            const weight = Math.exp(-(dx * dx + dy * dy) * 2.2) + 0.15;
            logSamples.push({
              value: Math.log2(Math.max(luminanceValue, 1e-5)),
              weight,
            });
            redSum += red;
            greenSum += green;
            blueSum += blue;
            alphaSum += alpha;
            if (alpha > 0.5) alphaCoveredPixels++;
          }
        }
      }
      if (logSamples.length === 0) {
        if (tslDebug && !tslDebugSampleLogged) {
          tslDebugSampleLogged = true;
          console.warn(`[tsl-debug] scene color readback contained no finite luminance samples\n${JSON.stringify({
            pixelFormat: pixelBands[0]?.constructor.name ?? "unknown",
            valueCount: pixelBands.reduce((count, pixels) => count + pixels.length, 0),
            target: `${renderTarget.width}x${renderTarget.height}`,
          }, null, 2)}`);
        }
        return;
      }
      const sortedSamples = logSamples.sort((a, b) => a.value - b.value);
      const logLuminance = sortedSamples.map(({ value }) => value);
      const totalWeight = sortedSamples.reduce((sum, sample) => sum + sample.weight, 0);
      let accumulatedWeight = 0;
      let middleLogLuminance = 0;
      let middleWeight = 0;
      for (const sample of sortedSamples) {
        const lower = accumulatedWeight / totalWeight;
        accumulatedWeight += sample.weight;
        const upper = accumulatedWeight / totalWeight;
        const overlap = Math.max(0, Math.min(upper, 0.6) - Math.max(lower, 0.4));
        middleLogLuminance += sample.value * overlap;
        middleWeight += overlap;
      }
      middleLogLuminance /= Math.max(middleWeight, 1e-5);
      const nextTargetEv = Math.max(
        -grade.aeRange,
        Math.min(
          grade.aeRange,
          (grade.aeKey - middleLogLuminance) * grade.aeStrength,
        ),
      );
      if (renderDebug && !renderDebugSampleLogged) {
        renderDebugSampleLogged = true;
        const summary = summarizeRenderDebugBands(pixelBands, bandReads, renderTarget);
        if ((summary.medianSceneLinearLuma ?? 1) < 0.01) {
          console.warn(
            "[render-debug] scene pass is near black before post-processing; exposure and grading cannot restore missing material output. Run ?q=low&renderdebug=1&tsltest=lit: a plain lit TSL Standard material separates renderer lights from authored material graphs; if still black, use tsltest=solid to check scene-pass geometry/output.",
          );
        }
      }
      if (tslDebug && !tslDebugSampleLogged) {
        tslDebugSampleLogged = true;
        const percentile = (fraction: number) =>
          2 ** (logLuminance[Math.min(logLuminance.length - 1, Math.floor(logLuminance.length * fraction))] ?? -16.6);
        const medianSceneLinear = percentile(0.5);
        const upperSceneLinear = percentile(0.9);
        const belowOnePercent = logLuminance.filter((value) => value < Math.log2(0.01)).length;
        const regionalSummary = summarizeRenderDebugBands(pixelBands, bandReads, renderTarget);
        const bandMedians = regionalSummary.bands
          .map((band: any) => band.medianLinearLuma)
          .filter((value: any) => Number.isFinite(value));
        const darkestBandMedian = bandMedians.length > 0 ? Math.min(...bandMedians) : null;
        const brightestBandMedian = bandMedians.length > 0 ? Math.max(...bandMedians) : null;
        const sample = {
          area: `${sampleWidth}x${sampleHeight}`,
          bands: bandReads.length,
          target: `${renderTarget.width}x${renderTarget.height}`,
          pixelFormat: pixelBands[0]?.constructor.name ?? "unknown",
          medianSceneLinear: Number(medianSceneLinear.toFixed(5)),
          p90SceneLinear: Number(upperSceneLinear.toFixed(5)),
          regionalBands: regionalSummary?.bands ?? null,
          darkestBandMedianLinearLuma: darkestBandMedian,
          brightestBandMedianLinearLuma: brightestBandMedian,
          bandMedianContrastRatio: darkestBandMedian !== null && darkestBandMedian > 0 && brightestBandMedian !== null
            ? Number((brightestBandMedian / darkestBandMedian).toFixed(2))
            : null,
          pixelsBelow1PercentLinear: `${Math.round((belowOnePercent / logLuminance.length) * 100)}%`,
          meanRgbLinear: [redSum, greenSum, blueSum].map((sum) => Number((sum / logLuminance.length).toFixed(5))),
          meanAlpha: Number((alphaSum / logLuminance.length).toFixed(5)),
          alphaCoverage: `${Math.round((alphaCoveredPixels / logLuminance.length) * 100)}%`,
          renderCalls: renderer.info?.render?.calls ?? null,
          renderedTriangles: renderer.info?.render?.triangles ?? null,
          exposureEv: Number(sampleContext.exposureEv.toFixed(3)),
          exposureTargetEvFromThisSample: Number(nextTargetEv.toFixed(3)),
          sampleStage: "scene pass, before grading/tone mapping/display conversion",
          indicatesDarknessBeforePost: medianSceneLinear < 0.025,
          indicatesUnderlitSampledBand: darkestBandMedian !== null && darkestBandMedian < 0.12,
        };
        if (medianSceneLinear < 0.025) {
          console.warn(`[tsl-debug] scene color is already very dark before post-processing; inspect scene lighting/material output\n${JSON.stringify(sample, null, 2)}`);
        } else if (darkestBandMedian !== null && darkestBandMedian < 0.12) {
          console.warn(`[tsl-debug] one sampled scene region is underlit before post-processing; the whole-frame median hides it\n${JSON.stringify(sample, null, 2)}`);
        } else {
          console.warn(`[tsl-debug] scene pass has visible luminance before post-processing; inspect grading/display output if the final image looks dark\n${JSON.stringify(sample, null, 2)}`);
        }
      }
      if (Math.abs(nextTargetEv - exposureAdaptation.targetEv) >= grade.aeDeadband) {
        exposureAdaptation.targetEv = nextTargetEv;
      }
      if (renderDebug && !renderDebugExposureMeterLogged) {
        renderDebugExposureMeterLogged = true;
        console.info("[render-debug] WebGPU auto-exposure meter", {
          middleLog2Luminance: Number(middleLogLuminance.toFixed(4)),
          measuredTargetEv: Number(nextTargetEv.toFixed(4)),
          targetEv: Number(exposureAdaptation.targetEv.toFixed(4)),
          currentEv: Number(exposureAdaptation.ev.toFixed(4)),
          effectiveExposure: Number(exposureNode.value.toFixed(5)),
          sampledBands: bandReads.length,
          sampledPixels: logLuminance.length,
        });
      }
    }).catch((error: unknown) => {
      exposureAdaptation.failed = true;
      console.warn("[tsl] automatic exposure readback failed", error);
    }).finally(() => {
      exposureAdaptation.pending = false;
    });
  };
  // Tone mapping is explicit in the graph so grading happens after ACES, as in
  // the legacy path. RenderPipeline still performs the final linear-to-sRGB conversion.
  renderer.toneMapping = NoToneMapping;
  pipeline = new RenderPipeline(renderer, diagnosticOutputNode);

  return {
    render(dt = 1 / 60) {
      if (renderDebug) renderDebugFrame++;
      if (rendererLighting) rendererLighting.enabled = true;
      if (renderDebug && !renderDebugSetupLogged) {
        renderDebugSetupLogged = true;
        logRenderDebugSetup({
          renderer,
          scene,
          camera,
          lighting,
          quality,
          grade: {
            ...grade,
            exposureAdaptationEv: exposureAdaptation.ev,
            exposureTargetEv: exposureAdaptation.targetEv,
            effectiveExposure: exposureNode.value,
            ambientFill: nodeAmbientFill.value,
            verticalAmbientFill: nodeVerticalFill.value,
            ambientOcclusion: {
              enabled: !!quality?.ao,
              implementation: aoNode ? "n8ao-webgpu N8AONode" : "disabled",
              quality: quality?.aoQuality ?? null,
              resolutionScale: aoNode?.configuration?.halfRes ? 0.5 : 1,
              samples: aoNode?.configuration?.aoSamples ?? null,
            },
          },
          backend: "WebGPU TSL pipeline",
          webgpuDiffuseFallback: {
            mode: lightingFallbackMode,
            patchedMaterials: {
              nodePbr: filledNodePbrCount,
              classicPbrConvertedByWebGPU: filledClassicPbrCount,
            },
            ambientFill: nodeAmbientFill.value,
            sideFacingFill: nodeVerticalFill.value,
            materialTestMode: tslMaterialTest ?? "off",
          },
        });
      }
      if (tslDebug && !tslDebugSetupLogged) {
        tslDebugSetupLogged = true;
        logTslDebugSetup();
      }
      if (grade.autoExposure) {
        const adaptationSpeed = exposureAdaptation.targetEv > exposureAdaptation.ev
          ? grade.aeSpeedUp
          : grade.aeSpeedDown;
        const adaptation = 1 - Math.exp(-Math.max(dt, 1 / 240) * adaptationSpeed);
        exposureAdaptation.ev +=
          (exposureAdaptation.targetEv - exposureAdaptation.ev) * adaptation;
      } else {
        exposureAdaptation.ev = 0;
        exposureAdaptation.targetEv = 0;
      }
      exposureNode.value =
        grade.exposure *
        (lighting?.tod?.exposure ?? 1) *
        (grade.autoExposure ? 2 ** exposureAdaptation.ev : 1);
      const night = Math.max(0, Math.min(1, lighting?.tod?.night ?? 0));
      // Keep the TSL diffuse-fill tuning live as the time-of-day changes.
      nodeAmbientFill.value = nodeAmbientFillBase * (1 - night * 0.3);
      nodeVerticalFill.value = nodeVerticalFillBase * (1 - night);
      lightingFallbackSync();
      saturationNode.value = grade.saturation;
      saturationKneeNode.value = grade.saturationKnee;
      contrastNode.value = grade.contrast;
      pivotNode.value = grade.pivot;
      vignetteNode.value = grade.vignette;
      grainNode.value = grade.grain;
      liftNode.value.copy(grade.lift);
      gammaNode.value.copy(grade.gamma);
      gainNode.value.copy(grade.gain);
      whiteBalanceNode.value.copy(grade.whiteBalance);
      const nightHaze = Math.max(0, Math.min(1, lighting?.nightHaze?.k ?? 0));
      camera.getWorldPosition(cameraWorldPosition);
      const cameraHeightT = Math.max(0, Math.min(1, (cameraWorldPosition.y - 25) / 95));
      const cameraHeightSmooth = cameraHeightT * cameraHeightT * (3 - 2 * cameraHeightT);
      splitShadowNode.value
        .copy(grade.nightSplitStreet)
        .lerp(grade.nightSplitShadow, cameraHeightSmooth)
        .lerp(grade.splitShadow, 1 - nightHaze);
      splitHighNode.value.copy(grade.splitHigh);
      splitBalanceNode.value = grade.splitBalance + (0.14 - grade.splitBalance) * nightHaze;
      warmGuardNode.value = nightHaze;
      if (renderDebug && !renderDebugPostLogged) {
        renderDebugPostLogged = true;
      }
      if (lighting?.fog) {
        fogColorNode.value.copy(lighting.fog.tint);
        fogStartNode.value = lighting.fog.startDistance;
        fogDensityNode.value = lighting.fog.density;
        fogHeightFalloffNode.value = lighting.fog.heightFalloff;
      }
      if (bloomNode)
        bloomNode.strength.value = grade.bloom * (lighting?.tod?.bloom ?? 1);
      if (shaftSunColor && lighting?.sun) {
        shaftSunColor.value.copy(lighting.sun.color);
        shaftSunGain.value = Math.max(0, Math.min(1, lighting.sun.intensity * shaftSunGainScale));
      }
      if (dofState.auto) {
        dofState.auto.getWorldPosition(focusPosition);
        focusNode.value = camera.position.distanceTo(focusPosition);
      }
      renderer.getDrawingBufferSize(resolution);
      aspectNode.value = resolution.y > 0 ? resolution.x / resolution.y : 1;
      frameNode.value = (frameNode.value + 1) % 64;
      if (tslDisableEnvironment && scene.environment !== null) {
        // A/B probe: remove the custom equirectangular environment from the
        // WebGPU PBR graph while keeping the sun, ambient, and hemisphere lights.
        scene.environment = null;
      }
      applyLightProbeSelection();
      pipeline.render();
      if (grade.autoExposure) {
        exposureAdaptation.sampleElapsed += dt;
        if (exposureAdaptation.sampleElapsed >= 0.5) {
          exposureAdaptation.sampleElapsed = 0;
          requestExposureSample();
        }
      }
    },
    setSize() {
      // RenderPipeline's pass targets follow the renderer's drawing-buffer size.
    },
    prepareMaterials() {
      prepareMaterialProbeOverrides();
      installNodeAlbedoFill();
    },
    grade,
    resetHistory() {
      temporalNode?.setSize(1, 1);
    },
    setMotionBlur(strength: number) {
      const wasEnabled = motionEnabled;
      motionState.strength = Math.max(0, Math.min(1, strength || 0));
      motionStrengthNode.value = motionState.strength;
      const enabled =
        motionState.strength > 0 && motionState.samples > 1 && !!sceneVelocity;
      if (enabled !== wasEnabled) {
        motionEnabled = enabled;
        rebuildEffects();
      }
    },
    setFocus(distance: number) {
      dofState.focus = Math.max(0.1, distance);
      focusNode.value = dofState.focus;
    },
    setAperture(pixels: number) {
      dofState.aperture = Math.max(0, pixels);
      apertureNode.value = dofState.aperture;
      const enabled = dofState.aperture > 0 && quality?.name !== "low";
      if (!!dofNode !== enabled) {
        dofNode = enabled;
        rebuildEffects();
      }
    },
    setDof(options: any = {}) {
      if (options.focus !== undefined) this.setFocus(options.focus);
      if (options.aperture !== undefined) this.setAperture(options.aperture);
      if (options.maxBlur !== undefined)
        focalLengthNode.value = Math.max(0.1, options.maxBlur);
    },
    setAutoFocus(object: any) {
      dofState.auto = object || null;
    },
    dispose() {
      if (tslDebugBuilderHook && renderer.debug?.onNodeBuilderCreated === tslDebugBuilderHook) {
        renderer.debug.onNodeBuilderCreated = previousNodeBuilderHook;
      }
      if (scene.fogNode === nodeFog) {
        if (previousFogNode === undefined) delete scene.fogNode;
        else scene.fogNode = previousFogNode;
      }
      pipeline.dispose();
      bloomNode?.dispose?.();
      dofEffect?.dispose?.();
      motionInputTexture?.dispose?.();
      temporalNode?.dispose?.();
      reflectionNode?.dispose?.();
      godraysNode?.dispose?.();
      aoNode?.dispose?.();
    },
  };
}
