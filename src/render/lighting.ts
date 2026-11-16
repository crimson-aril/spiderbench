// @ts-nocheck
//   createLighting({renderer, scene}) -> lighting
//   lighting.sun            DirectionalLight carrying the key-light radiance (sun, or moon at night; cascade 0 of the CSM)
//   lighting.update(camera) call once per frame before rendering (fits shadow cascades, re-bakes env if dirty,
//                           follows the player with the high-res character shadow cascade)
//   lighting.setSun({elevation, azimuth})   degrees; azimuth measured from +X toward +Z. Re-bakes LUT + env.
//   lighting.setupMaterial(mat)  no-op kept for API compatibility: CSM works through global chunk overrides, so
//                                every built-in lit material is handled automatically.
//   lighting.sky            sky object (params, LUT, uniforms) used by the pipeline
//   lighting.fog            aerial-perspective params used by the pipeline composite pass
//   lighting.tod            current time-of-day state {name, hour, night, exposure, ...} (read by the pipeline)
//   lighting.timeOfDay      current hour (informational)
//
// TIME OF DAY (lighting2 r3, Insomniac-style): NO clock / cycle. Fixed hand-tuned presets (PRESETS below): day (default),
//   morning, sunrise, sunset, dusk, night, overcast (rain: wet city + puddle ripples in surface.ts, streaks in pipeline).
//   Settings > Time of Day -> lighting.setTimeMode(name) (blends ~2.5 s, env re-baked one cube face per frame).
//   ?tod=<preset> pins a preset (screenshots / blind pairs); ?shot= / ?playtest= pin 'day'. Old names map (golden ->
//   sunset, dawn -> sunrise, default / noon / afternoon -> day, rain -> overcast).
//   console: setTOD('night') (blended) | __ctx.lighting.setTimeOfDay('dusk') (instant)
//   Night-city hooks read nightK (src/render/dayNight.ts), set per preset (night 1, dusk 0.7, overcast 0.3).
import { lazyShaderSections } from "../shaderSections.ts";
import lightingShaderSource from "./webgl2Shader/glsl/lighting.glsl?raw";
import * as THREE from "three";
import { solarPosition, lookAt } from "./lightingSolar.ts";
import { createNightMaterialController } from "./nightMaterialController.ts";
import { createLightingTimeController } from "./lightingTimeController.ts";
import { createLightingTransitions } from "./lightingTransitions.ts";
import { createNodeShadowRig } from "./nodeShadowRig.ts";
import { PRESETS, DAY_SUNS, TOD_PRESETS, SUN_PRESETS, resolvePreset } from "./lightingPresets.ts";
import { getQuality } from "./quality.ts";
import { createSky } from "./sky.ts";
import { CascadedShadowMaps } from "./cascadedShadows.ts";
import { usesNodeMaterialBackend, usesWebGPUBackend } from "./backendState.ts";
import { installSurfaceChunks, ambShared } from "./surface.ts";
import { cityLights, installCityLightChunks } from "./citylights.ts"; // (night) real local lights
import { sunTransmittance } from "./atmosphere.ts";
import { setWebGPUEnvironmentTexture } from "./webGPUShaderNodes/environmentReflection.ts";

// (daynight) ONE shared global for the night city (src/render/dayNight.ts): 0 = day .. 1 = full night. Also exposed as
// window.__nightK and lighting.nightK.
import {
  nightK,
  dnTime,
  screenK,
  syncNightMeshes,
  tickNightMeshes,
} from "./daynight.ts";

export { solarPosition, PRESETS, DAY_SUNS, TOD_PRESETS, SUN_PRESETS };

const lightingShader = lazyShaderSections(() => lightingShaderSource);

export { nightK };

// Manhattan, early September. Our world: -Z is north, +X is east; azimuth measured from +X toward +Z.

const lerp = THREE.MathUtils.lerp;
const smooth = (a, b, x) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export function createLighting({ renderer, scene }) {
  const nodeBackend = usesNodeMaterialBackend();
  // The WebGPU sky texture is sampled directly by TSL materials that need it
  // (for example facade glass). Do not bind it as scene.environment: the
  // captured WebGPU Standard-material probe goes black through Three's
  // automatic equirectangular-to-PMREM path for this CPU-baked DataTexture.
  // WebGL2 keeps its existing scene.environment/PMREM path below.
  const webGPUBackend = usesWebGPUBackend();
  const quality = getQuality(renderer);
  if (!nodeBackend) installSurfaceChunks(quality);
  // WebGLRenderer exposes the actual result of the reversed-depth extension
  // through capabilities; WebGPURenderer is handled by the node shadow path.
  const reversed = !!renderer.capabilities?.reversedDepthBuffer;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // hardware PCF (PCFSoft was removed in r18x)
  renderer.shadowMap.autoUpdate = true;

  const sky = createSky(renderer, quality);
  if (webGPUBackend) {
    setWebGPUEnvironmentTexture(sky.environmentTexture);
    scene.environment = null;
  }
  if (nodeBackend) scene.add(sky.mesh);
  const cascadedShadows = nodeBackend
    ? createNodeShadowRig(scene, quality)
    : new CascadedShadowMaps({ scene, quality, reversed, renderer });
  if (!nodeBackend) installCityLightChunks(renderer, scene); // (night) after the CSM patch of lights_fragment_begin
  else if (typeof location !== "undefined" && new URLSearchParams(location.search).has("nocl"))
    cityLights.enabled = false;
  const sun = cascadedShadows.sun;

  scene.background = null;
  const nodeAmbientBase = quality.name === "low" ? 0.65 : quality.name === "high" ? 0.4 : 0.5;
  const nodeHemisphereBase = quality.name === "low" ? 0.95 : quality.name === "high" ? 0.65 : 0.8;
  const nodeAmbient = nodeBackend
    // Moderate WebGPU fill softens sun-facing contrast while the automatic
    // scene-environment PMREM path is disabled for this CPU-baked sky.
    ? new THREE.AmbientLight(0xb8c4d8, nodeAmbientBase)
    : null;
  const nodeHemisphere = nodeBackend
    ? new THREE.HemisphereLight(0xcfe0ff, 0x7a6f60, nodeHemisphereBase)
    : null;
  if (nodeAmbient) scene.add(nodeAmbient);
  if (nodeHemisphere) scene.add(nodeHemisphere);
  const fogBase = { density: 0.00013, heightFalloff: 1 / 300 }; // (timessq r6) falloff 1/420 -> 1/300: the extra day haze sits low in the street canyons, aerial views barely change // (foundation: was 0.0002 -> far shores / horizon bleached to a milky wall)
  const fog = {
    density: fogBase.density, // extinction per metre at ground level
    heightFalloff: fogBase.heightFalloff, // 1/m (exponential height falloff)
    sunScatter: 0.6, // strength of the forward (Mie) sun glow in the fog
    tint: new THREE.Color(0.84, 0.9, 1.0), // slightly bluer/deeper than the raw horizon radiance
    startDistance: 35,
    shafts: 1.0, // volumetric light shaft strength (pipeline)
  };

  const tod = {
    name: "default",
    hour: 14.5,
    elevation: 47,
    azimuth: 118,
    night: 0,
    exposure: 1.0,
    bloom: 1.0,
    windows: 0, // 0..1 how much the city's interior lights are boosted
  };
  const state = {
    envDirty: true,
    envTexture: null,
    envIntensity: 0.95,
    envTimer: 0,
    nightMats: null,
    nightScan: 0,
  };
  const city = { street: 0.5, ts: 0.13 }; // (night) 0.1 -> 0.5: matches the average irradiance of the real lamp pools inside the local-light grid, so far avenues glow like the near ones (rooftop_haze ref) // (night) street 0.05 -> 0.1: far-field street glow seen from above (rooftop_haze ref: glowing avenues) // (lighting2 r4) 0.08 / 0.22: critic 'TS road blown out to near-white' // (lighting2 r3) night street-light / Times Square spill irradiance (live-tunable: lighting.city)
  // (night) light-polluted haze (refs/night): in-scatter colours (pre-exposure radiance, low = toward the horizon /
  // looking down, high = looking up), horizon sky glow, fog density scale. Live-tunable: lighting.nightHaze
  const NH = {
    low: [0.0125, 0.0115, 0.0165],
    high: [0.008, 0.008, 0.012],
    glow: [0.012, 0.009, 0.011],
    fog: 4.0,
    start: 120,
    /* (night) r3: critic 'no light-pollution dome, clean blue hour': warm-magenta horizon glow, purple-grey haze (#3a2e3a) from ~120 m */ glowCol:
      [0.022, 0.013, 0.0075],
    glowH: 22,
    glowK: 0.004,
  }; // glowCol / H / K: warm street-level glow layer (pipeline composite)
  const nightHaze = { k: 0, low: NH.low, high: NH.high, cfg: NH };

  //  night: boost city emissives
  // The city exposes facade uniforms (uInteriorGain / uShopGain) and uses emissive colours for lamps, signals and
  // car lights. We scale them at night (base values remembered on first sight).
  const { scanNightMaterials, applyNightMaterials } = createNightMaterialController({
    scene,
    state,
    tod,
    screenK,
    lightingShader,
    lerp,
  });

  const { applyTod, applySun, moon } = createLightingTimeController({
    scene, sky, tod, fog, fogBase, state, nightHaze, NH, sun, cascadedShadows,
    cityLights, city, nodeAmbient, nodeAmbientBase, nodeHemisphere, nodeHemisphereBase,
    sunTransmittance, ambShared, nightK, screenK, syncNightMeshes, solarPosition,
    lookAt, smooth, lerp, applyNightMaterials,
  });

  const { blend, setPreset, setTimeMode, stepBlend, stepEnv } = createLightingTransitions({
    tod, state, applyTod, sky, scene, webGPUBackend, resolvePreset, lerp,
  });

  //  character shadow cascade target
  const _pp = new THREE.Vector3();

  const lighting = {
    sun,
    cascadedShadows,
    sky,
    fog,
    quality,
    reversed,
    tod,
    amb: ambShared,
    city,
    cityLights,
    cityVol: { strength: 1, density: 0.0045, height: 30 },
    nightHaze, // (night) lit haze around the city lights (pipeline cityVolume)
    get timeOfDay() {
      return tod.name;
    },
    get envIntensity() {
      return state.envIntensity;
    },
    set envIntensity(v) {
      state.envIntensity = v;
      scene.environmentIntensity = v;
    },
    setSun({ elevation, azimuth } = {}) {
      blend.on = false;
      applyTod({
        elevation: elevation ?? tod.elevation,
        azimuth: azimuth ?? tod.azimuth,
        name: "custom",
        look: tod.look,
      });
    },
    /** re-bake LUT/env after editing sky.params (clouds, mie ...) */
    refresh() {
      applySun();
    },
    setupMaterial(/* material */) {
      /* not needed: global chunk override */
    },
    get preset() {
      return tod.name;
    },
    /** (lighting2 r3) instant switch: 'day' | 'morning' | 'sunrise' | 'sunset' | 'dusk' | 'night' | 'overcast' (old names map) */
    setTimeOfDay(v) {
      return setPreset(v, { instant: true });
    },
    /** blended (~2.5 s) switch to a preset */
    setPreset(v) {
      return setPreset(v);
    },
    /** settings menu: blended switch, ignored when a preset is pinned by ?tod= / ?shot= */
    setTimeMode,
    nightK,
    moon,
    setDryPuddles(on = true) {
      ambShared.wx.w = on ? 1 : 0;
    }, // (user r-nopuddles) Settings > Puddles
    get cycle() {
      return { on: false, hour: tod.hour ?? 12, minutes: 0 };
    }, // (lighting2 r3) compat: no clock any more (old readers of .cycle.hour)
    presets: Object.keys(PRESETS),
    update(camera, dt = 1 / 60) {
      const nowS = performance.now() / 1000,
        rdt = state.lastT ? Math.min(nowS - state.lastT, 0.1) : dt;
      state.lastT = nowS; // (main.ts passes no dt)
      if (blend.on) stepBlend(rdt);
      stepEnv();
      scene.environmentIntensity = state.envIntensity;
      ambShared.wx.y = performance.now() / 1000; // (lighting2 r3) rain ripples clock
      tickNightMeshes();
      dnTime.value = performance.now() / 1000; // (daynight)
      // (daynight) re-scan for newly streamed-in city materials every 6 s while the lights are on
      // (lighting2 r3) every 1 s for the first ~20 s (the first scan ran on an empty scene: TS screens stayed at their day
      // intensity and blew out to white until the 6 s re-scan / forever in short screenshot runs)
      state.upT = (state.upT || 0) + dt;
      if (
        tod.windows > 0 &&
        (state.nightScan += dt) > (state.upT < 20 ? 1 : 6)
      ) {
        state.nightScan = 0;
        scanNightMaterials();
        applyNightMaterials();
      }
      if (state.envDirty) {
        // WebGL2 receives the baked sky as its scene environment. WebGPU
        // keeps the same texture available for direct TSL reflection sampling,
        // while diffuse fill comes from its lights and TSL albedo fallback.
        state.envTexture = sky.renderEnv();
        if (!webGPUBackend) scene.environment = state.envTexture;
        if (!webGPUBackend && state.envTexture)
          console.log("PMREM texture diagnostics:", {
            mapping: state.envTexture.mapping,
            width: state.envTexture.image?.width,
            height: state.envTexture.image?.height,
            isTexture: state.envTexture.isTexture,
            isRenderTargetTexture: state.envTexture.isRenderTargetTexture,
            image: state.envTexture.image,
          });

        scene.environmentIntensity = state.envIntensity;
        state.envDirty = false;
      }
      camera.updateMatrixWorld();
      // high-res character shadow cascade follows the player (feature-detected)
      const po =
        typeof window !== "undefined" ? window.__ctx?.player?.object : null;
      if (po) {
        po.getWorldPosition(_pp);
        cascadedShadows.setFocus(_pp);
        if ((state.charScan = (state.charScan || 0) + 1) % 30 === 1)
          cascadedShadows.setCharacter(po);
      } else cascadedShadows.setFocus(null);
      cascadedShadows.update(camera, scene);
      if (nodeBackend) {
        const nodeLightBudget = quality.name === "low" ? 4 : quality.name === "high" ? 16 : 8;
        cityLights.buildNode(camera, scene, nodeLightBudget);
      } else cityLights.build(camera); // (night) local light grid around the camera
      if (!nodeBackend) {
        const o = cityLights.shared.origin;
        ambShared.cgrid.set(o.x, o.y, o.z * 64, o.w);
      }
    },
  };
  if (typeof window !== "undefined") {
    window.setTOD = (v) => setPreset(v); // (lighting2 r3) blended
    window.__nightK = nightK; // (daynight)
    window.__cityLights = cityLights; // (night)
  }
  return lighting;
}
