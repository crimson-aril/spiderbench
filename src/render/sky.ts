// @ts-nocheck
import { lazyShaderSections } from "../shaderSections.ts";
import skyShaderSource from "./webgl2Shader/glsl/sky.glsl?raw";
import skyLutGenerationFragmentShader from "./webgl2Shader/fragment/sky-lut.frag?raw";
import skyNoiseGenerationFragmentShader from "./webgl2Shader/fragment/sky-noise.frag?raw";
import skyPassFragmentShader from "./webgl2Shader/fragment/sky-pass.frag?raw";
import environmentSkyVertexShader from "./webgl2Shader/vertex/sky-environment.vert?raw";
import environmentSkyFragmentShader from "./webgl2Shader/fragment/sky-environment.frag?raw";
import { injectShader } from "./shaderInjection.ts";
// // Physically based sky: single-scattering atmosphere (Rayleigh + Mie + ozone, approx multiple scattering)
// baked into a small sky-view LUT, raymarched cumulus cloud layer (Perlin-Worley 3D noise), procedural distant
// skyline, PMREM environment generation for IBL.
import * as THREE from "three";
import {
  FullscreenPass,
  createRenderTarget,
  getDepthReconstructionGLSL,
} from "./fullscreenPass.ts";
import { GLSL_ATMOS, sunTransmittance } from "./atmosphere.ts";
import * as WEBGPU from "three/webgpu";
import * as TSL from "three/tsl";
import { usesNodeMaterialBackend } from "./backendState.ts";
import {
  CLOUD_LAYER,
  CLOUD_NOISE_SIZE,
  CLOUD_DETAIL_Y,
  CLOUD_DETAIL2_Y,
  cloudBaseNoiseY,
  cloudLayerHeightKm,
  createCloudLayerScratch,
  createCloudNoiseData,
  evaluateCloudLayer,
} from "./cloudLayer.ts";

const skyShader = lazyShaderSections(() => skyShaderSource);


const LUT_W = 256,
  LUT_H = 128;

// ---------------------------------------------------------------------------------------------------------
// GLSL: sky LUT generation (radiance for unit sun illuminance), parameterised relative to the sun azimuth.
const LUT_FRAG = injectShader(skyLutGenerationFragmentShader, GLSL_ATMOS);

// ---------------------------------------------------------------------------------------------------------
// GLSL: tileable Perlin-Worley 3D noise generation (R = perlin-worley, GBA = worley fbm at increasing freqs)
const NOISE_FRAG = skyNoiseGenerationFragmentShader;

// Resolve these snippets on demand so WebGPU module initialization never reads
// a raw GLSL binding while Rolldown's cyclic chunks are still being evaluated.
export function getSkyShaderSections() {
  return {
    commonAtmosphere: injectShader(
      skyShader.commonAtmosphere,
      GLSL_ATMOS,
      LUT_W,
      LUT_W,
    ),
    clouds: skyShader.clouds,
  };
}

export function createSky(renderer, quality) {
  if (usesNodeMaterialBackend()) return createNodeSky(quality);

  const { commonAtmosphere: GLSL_SKY_COMMON, clouds: GLSL_CLOUDS } =
    getSkyShaderSections();
  const depthReconstructionGLSL = getDepthReconstructionGLSL();

  // LUT target
  const lut = createRenderTarget(LUT_W, LUT_H, { type: THREE.HalfFloatType });
  const lutPass = new FullscreenPass({
    name: "skyLUT",
    fragmentShader: LUT_FRAG,
    uniforms: {
      uSunEl: { value: 0.6 },
      uMie: { value: 2.2 },
      uViewH: { value: 0.05 },
      uMS: { value: 2.2 },
      uGroundAlbedo: { value: new THREE.Vector3(0.12, 0.12, 0.11) },
    },
  });

  // 3D noise (generated on GPU once)
  const NS = 128;
  const noiseRT = new THREE.WebGL3DRenderTarget(NS, NS, NS, {
    type: THREE.UnsignedByteType,
    format: THREE.RGBAFormat,
    depthBuffer: false,
  });
  const nt = noiseRT.texture;
  nt.wrapS = nt.wrapT = nt.wrapR = THREE.RepeatWrapping;
  nt.minFilter = THREE.LinearFilter;
  nt.magFilter = THREE.LinearFilter;
  nt.generateMipmaps = false;
  const noisePass = new FullscreenPass({
    name: "cloudNoise",
    fragmentShader: NOISE_FRAG,
    uniforms: {
      uZ: { value: 0 },
      uPW: { value: new THREE.Vector2(0.4, 0.22) },
    },
  });
  const oc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  function genNoise(pwx, pwy) {
    // (atmosphere r1) re-callable (tuning): perlin-worley remap offset / range
    noisePass.uniforms.uPW.value.set(pwx, pwy);
    for (let z = 0; z < NS; z++) {
      noisePass.uniforms.uZ.value = (z + 0.5) / NS;
      renderer.setRenderTarget(noiseRT, z);
      renderer.render(noisePass.mesh, oc);
    }
    renderer.setRenderTarget(null);
  }
  genNoise(0.4, 0.22);

  const params = {
    elevation: 44,
    azimuth: 70, // degrees; azimuth measured from +X toward +Z
    mie: 1.4,
    ms: 2.2,
    skyScale: 16.0,
    envSaturation: 0.62,
    cloudCoverage: 0.52,
    cloudDensity: 0.7,
    cloudBottom: 1.25,
    cloudTop: 2.8,
    cloudFade: 28.0,
    cloudSun: 4.3,
    cloudAmb: 0.8,
    cloudScale: 0.13,
    cirrus: 0.6,
    // Keep the WebGL2 reference cloud profile unchanged.
    cloudErode: 0.58,
    cloudDetailScale: 1.65,
    // (atmosphere r1) brighter, larger cumulus + cirrus veil
    cloudBaseDark: 0.9,
    skylineVisible: 1.0,
    // time-of-day controls (set by lighting.ts presets)
    lightScale: 1.0,
    lightTint: [1, 1, 1], // scale/tint of the key light (sun, or moon at night)
    skyTint: [1, 1, 1],
    skyGlow: [0, 0, 0], // sky radiance multiplier / additive horizon glow
    night: 0,
    stars: 0,
    groundAlbedo: [0.2, 0.18, 0.155], // env-map ground (sunlit street/sidewalk bounce)
    envFacadeAlbedo: [0.34, 0.29, 0.23], // env-map city band (sunlit limestone/brick bounce)
  };

  const sunDir = new THREE.Vector3();
  const sunColor = new THREE.Color();
  const skyUniforms = {
    uSkyLUT: { value: lut.texture },
    uSunDir: { value: sunDir },
    uSunColor: { value: new THREE.Vector3() },
    uSkyScale: { value: params.skyScale },
    uNoise: { value: nt },
    uCloudCoverage: { value: params.cloudCoverage },
    uCloudDensity: { value: params.cloudDensity },
    uCloudBottom: { value: params.cloudBottom },
    uCloudTop: { value: params.cloudTop },
    uCloudFade: { value: params.cloudFade },
    uCloudOffset: { value: new THREE.Vector3(3.1, 0, 7.7) },
    uSkyline: { value: 1.0 },
    uSkyTint: { value: new THREE.Vector3(1, 1, 1) },
    uSkyGlow: { value: new THREE.Vector3(0, 0, 0) },
    uFacadeAlb: { value: new THREE.Vector3(0.2, 0.185, 0.165) },
    uNight: { value: 0 },
    uCloudSun: { value: params.cloudSun },
    uCloudAmb: { value: params.cloudAmb },
    uCloudScale: { value: params.cloudScale },
    uHzK: { value: new THREE.Vector3(0.56, 0.63, 0.78) },
    uCirrus: { value: params.cirrus },
    uCloudErode: { value: params.cloudErode },
    uCloudDetailScale: { value: params.cloudDetailScale },
    uCloudBaseDark: { value: params.cloudBaseDark },
    uSunGlow: { value: new THREE.Vector4(0, 0, 0, 0) }, // (lighting2 r2)
    uOvercast: { value: 0 }, // (lighting2 r4)
  };

  function updateSun() {
    const el = THREE.MathUtils.degToRad(params.elevation),
      az = THREE.MathUtils.degToRad(params.azimuth);
    sunDir
      .set(
        Math.cos(el) * Math.cos(az),
        Math.sin(el),
        Math.cos(el) * Math.sin(az),
      )
      .normalize();
    const T = sunTransmittance(Math.max(el, 0.009), params.mie); // (daynight) the LUT follows the sun below the horizon; the key light colour is faded by lightScale
    // "white" sun above the atmosphere, times transmittance, times global scale (lux-ish arbitrary units)
    const E = params.skyScale * 0.62 * params.lightScale;
    const lt = params.lightTint;
    sunColor.setRGB(T[0] * E * lt[0], T[1] * E * lt[1], T[2] * E * lt[2]);
    skyUniforms.uSkyTint.value.fromArray(params.skyTint);
    skyUniforms.uSkyGlow.value.fromArray(params.skyGlow);
    skyUniforms.uSunGlow.value.fromArray(params.sunGlow ?? [0, 0, 0, 0]); // (lighting2 r2)
    skyUniforms.uOvercast.value = params.overcast ?? 0; // (lighting2 r4)
    skyUniforms.uNight.value = params.night;
    skyUniforms.uSunColor.value.set(sunColor.r, sunColor.g, sunColor.b);
    skyUniforms.uSkyScale.value = params.skyScale;
    lutPass.uniforms.uSunEl.value = el;
    lutPass.uniforms.uMie.value = params.mie;
    lutPass.uniforms.uMS.value = params.ms;
    lutPass.render(renderer, lut);
    renderer.setRenderTarget(null);
  }
  function syncCloudUniforms() {
    skyUniforms.uCloudCoverage.value = params.cloudCoverage;
    skyUniforms.uCloudDensity.value = params.cloudDensity;
    skyUniforms.uCloudBottom.value = params.cloudBottom;
    skyUniforms.uCloudTop.value = params.cloudTop;
    skyUniforms.uCloudFade.value = params.cloudFade;
    skyUniforms.uCloudSun.value = params.cloudSun;
    skyUniforms.uCloudAmb.value = params.cloudAmb;
    skyUniforms.uCloudScale.value = params.cloudScale;
    skyUniforms.uCirrus.value = params.cirrus;
    skyUniforms.uCloudErode.value = params.cloudErode;
    skyUniforms.uCloudDetailScale.value = params.cloudDetailScale;
    skyUniforms.uCloudBaseDark.value = params.cloudBaseDark;
  }

  // ---------------- half-res sky pass (screen) ----------------
  const skyPass = new FullscreenPass({
    name: "skyPass",
    defines: {
      CLOUD_STEPS: quality.cloudSteps,
      CLOUD_LIGHT_STEPS: quality.cloudLightSteps,
    },
    uniforms: {
      ...skyUniforms,
      uDepth: { value: null },
      uProjInv: { value: new THREE.Matrix4() },
      uReversed: { value: 0 },
      uCamWorld: { value: new THREE.Matrix4() },
      uCamPos: { value: new THREE.Vector3() },
      uFullRes: { value: new THREE.Vector2(1, 1) },
      uStars: { value: 0 },
    },
    fragmentShader: injectShader(
      skyPassFragmentShader,
      depthReconstructionGLSL,
      GLSL_SKY_COMMON,
      GLSL_CLOUDS,
    ),
  });

  // ---------------- env cubemap ----------------
  const envScene = new THREE.Scene();
  const envMat = new THREE.ShaderMaterial({
    name: "envSky",
    glslVersion: THREE.GLSL3,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    defines: { CLOUD_STEPS: 48, CLOUD_LIGHT_STEPS: 4 },
    uniforms: {
      ...skyUniforms,
      uCamPos: { value: new THREE.Vector3(0, 60, 0) },
      uGround: { value: new THREE.Vector3(0.2, 0.18, 0.155) },
      uEnvSat: { value: 0.62 },
      uEnvFacade: { value: new THREE.Vector3(0.34, 0.29, 0.23) },
    },
    vertexShader: environmentSkyVertexShader,
    fragmentShader: injectShader(
      environmentSkyFragmentShader,
      GLSL_SKY_COMMON,
      GLSL_CLOUDS,
    ),
  });
  const envMesh = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), envMat);
  envMesh.frustumCulled = false;
  envScene.add(envMesh);
  const cubeRT = new THREE.WebGLCubeRenderTarget(256, {
    type: THREE.HalfFloatType,
    generateMipmaps: false,
  });
  const cubeCam = new THREE.CubeCamera(0.1, 100, cubeRT);
  envScene.add(cubeCam);
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envRT = null;

  function renderEnv() {
    const oldTarget = renderer.getRenderTarget();
    const oldTM = renderer.toneMapping;
    renderer.toneMapping = THREE.NoToneMapping;
    cubeCam.update(renderer, envScene);
    const next = pmrem.fromCubemap(cubeRT.texture, envRT ?? undefined);
    envRT = next;
    renderer.toneMapping = oldTM;
    renderer.setRenderTarget(oldTarget);
    return envRT.texture;
  }

  // (daynight) env re-bake spread over frames (day-night cycle): one cube face per call, then the PMREM pre-filter
  function renderEnvFace(i) {
    const ot = renderer.getRenderTarget(),
      of = renderer.getActiveCubeFace(),
      om = renderer.getActiveMipmapLevel();
    const oldTM = renderer.toneMapping;
    renderer.toneMapping = THREE.NoToneMapping;
    if (cubeCam.coordinateSystem !== renderer.coordinateSystem) {
      cubeCam.coordinateSystem = renderer.coordinateSystem;
      cubeCam.updateCoordinateSystem();
    }
    renderer.setRenderTarget(cubeRT, i);
    renderer.render(envScene, cubeCam.children[i]);
    renderer.toneMapping = oldTM;
    renderer.setRenderTarget(ot, of, om);
  }
  function finishEnv() {
    const ot = renderer.getRenderTarget();
    envRT = pmrem.fromCubemap(cubeRT.texture, envRT ?? undefined);
    renderer.setRenderTarget(ot);
    return envRT.texture;
  }

  updateSun();
  syncCloudUniforms();

  return {
    params,
    sunDir,
    sunColor,
    lut,
    noise: nt,
    noiseRT,
    skyUniforms,
    skyPass,
    genNoise,
    /** call after changing params.elevation/azimuth/mie/... ; re-bakes LUT (cheap). returns true */
    update() {
      syncCloudUniforms();
      updateSun();
      skyUniforms.uSkyline.value = params.skylineVisible;
      envMat.uniforms.uEnvSat.value = params.envSaturation;
      envMat.uniforms.uGround.value.fromArray(params.groundAlbedo);
      envMat.uniforms.uEnvFacade.value.fromArray(params.envFacadeAlbedo);
      skyPass.uniforms.uStars.value = params.stars;
    },
    renderEnv,
    renderEnvFace,
    finishEnv,
    /** Evaluate horizon/zenith colors on the CPU is not supported; use GLSL_SKY_COMMON in shaders. */
    renderSkyPass(target, camera, depthTex, fullW, fullH, reversed) {
      const u = skyPass.uniforms;
      u.uDepth.value = depthTex;
      u.uProjInv.value.copy(camera.projectionMatrixInverse);
      u.uCamWorld.value.copy(camera.matrixWorld);
      u.uCamPos.value.setFromMatrixPosition(camera.matrixWorld);
      u.uFullRes.value.set(fullW, fullH);
      u.uReversed.value = reversed ? 1 : 0;
      u.uSkyline.value = params.skylineVisible;
      skyPass.render(renderer, target);
    },
  };
}

/** Tileable Worley distance fields shared with the CPU cloud-layer projection. */
function createCloudNoiseTexture() {
  const size = CLOUD_NOISE_SIZE;
  const data = createCloudNoiseData(size);
  const texture = new THREE.Data3DTexture(data, size, size, size);
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  texture.wrapS = texture.wrapT = texture.wrapR = THREE.RepeatWrapping;
  texture.magFilter = texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.unpackAlignment = 1;
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** TSL sky dome and compact environment map for WebGPU and the WebGL2 node backend. */
function createNodeSky(quality = {}) {
  const params = {
    elevation: 44,
    azimuth: 70,
    mie: 1.4,
    ms: 2.2,
    skyScale: 16,
    envSaturation: 0.62,
    cloudCoverage: 0.52,
    cloudDensity: 0.7,
    cloudBottom: 1.25,
    cloudTop: 2.8,
    cloudFade: 28,
    cloudSun: 4.3,
    cloudAmb: 0.8,
    // Double the horizontal base-noise frequency to halve the oversized NodeSky cloud lobes.
    cloudScale: 0.26,
    cirrus: 0.6,
    // Softer erosion rounds the TSL cloud lobes instead of cutting sharp tips.
    cloudErode: 0.42,
    cloudDetailScale: 1.35,
    cloudBaseDark: 0.9,
    skylineVisible: 1,
    lightScale: 1,
    lightTint: [1, 1, 1],
    skyTint: [1, 1, 1],
    skyGlow: [0, 0, 0],
    night: 0,
    stars: 0,
    groundAlbedo: [0.2, 0.18, 0.155],
    envFacadeAlbedo: [0.34, 0.29, 0.23],
    overcast: 0,
    sunGlow: [0, 0, 0, 0],
  };
  // The node sky palette is authored in display-like 0..1 values, while the
  // rest of the WebGPU scene uses HDR radiance. Scale sky fill into that range;
  // direct sun terms below already use the HDR sunColor and stay unscaled.
  const skyRadianceFactor = 0.3;
  const skyRadianceNode = TSL.uniform(params.skyScale * skyRadianceFactor);
  const sunDir = new THREE.Vector3();
  const sunColor = new THREE.Color();
  const skyTint = new THREE.Vector3(1, 1, 1);
  const horizonTint = new THREE.Vector3(0.62, 0.72, 0.9);
  const glowTint = new THREE.Vector3();
  const sunDirectionNode = TSL.uniform(sunDir);
  const zenithNode = TSL.uniform(skyTint);
  const horizonNode = TSL.uniform(horizonTint);
  const glowNode = TSL.uniform(glowTint);
  const sunColorNode = TSL.uniform(sunColor);
  const sunVisualNode = TSL.uniform(1);
  const cloudCoverageNode = TSL.uniform(params.cloudCoverage);
  const cloudDensityNode = TSL.uniform(params.cloudDensity);
  const cloudScaleNode = TSL.uniform(params.cloudScale);
  const cloudSunNode = TSL.uniform(params.cloudSun);
  const nightNode = TSL.uniform(params.night);
  const overcastNode = TSL.uniform(params.overcast);
  const starsNode = TSL.uniform(params.stars);
  const cloudNoiseTexture = createCloudNoiseTexture();
  const cloudNoiseData = cloudNoiseTexture.image.data;

  const envSize = quality?.name === "high" ? [256, 128] : quality?.name === "low" ? [64, 32] : [128, 64];
  const envData = new Uint16Array(envSize[0] * envSize[1] * 4);
  const envTexture = new THREE.DataTexture(
    envData,
    envSize[0],
    envSize[1],
    THREE.RGBAFormat,
    THREE.HalfFloatType,
  );
  envTexture.mapping = THREE.EquirectangularReflectionMapping;
  envTexture.colorSpace = THREE.LinearSRGBColorSpace;
  envTexture.wrapS = THREE.RepeatWrapping;
  envTexture.wrapT = THREE.ClampToEdgeWrapping;
  envTexture.magFilter = THREE.LinearFilter;
  envTexture.minFilter = THREE.LinearFilter;
  envTexture.generateMipmaps = false;
  let envDirty = true;
  const float32 = new Float32Array(1);
  const uint32 = new Uint32Array(float32.buffer);
  const toHalf = (value) => {
    float32[0] = value;
    const bits = uint32[0];
    const sign = (bits >>> 16) & 0x8000;
    let exponent = ((bits >>> 23) & 0xff) - 127 + 15;
    let mantissa = bits & 0x7fffff;
    if (exponent <= 0) {
      if (exponent < -10) return sign;
      mantissa = (mantissa | 0x800000) >>> (1 - exponent);
      return sign | ((mantissa + 0x1000) >>> 13);
    }
    if (exponent >= 31) return sign | 0x7c00;
    return sign | (exponent << 10) | ((mantissa + 0x1000) >>> 13);
  };

  const material = new WEBGPU.MeshBasicNodeMaterial();
  material.name = "NodeSky.TSL";
  material.side = WEBGPU.BackSide;
  material.depthWrite = false;
  material.depthTest = false;
  material.toneMapped = false;
  material.fog = false;
  material.allowOverride = false;   // keep the real sky in tsltest=lit/solid
  const direction = TSL.normalize(TSL.positionWorld.sub(TSL.cameraPosition));
  const height = direction.y;
  const skyGradient = TSL.smoothstep(-0.22, 0.52, height);
  const dayFactor = TSL.smoothstep(-0.08, 0.16, sunDirectionNode.y);
  const dayHorizon = TSL.vec3(0.48, 0.61, 0.78);
  const dayZenith = TSL.vec3(0.13, 0.31, 0.68);
  const nightHorizon = TSL.vec3(0.035, 0.043, 0.065);
  const nightZenith = TSL.vec3(0.006, 0.009, 0.018);
  const baseHorizon = TSL.mix(nightHorizon, dayHorizon, dayFactor).mul(horizonNode);
  const baseZenith = TSL.mix(nightZenith, dayZenith, dayFactor).mul(zenithNode);
  const baseSky = TSL.mix(baseHorizon, baseZenith, skyGradient);
  const sunCos = TSL.dot(direction, sunDirectionNode).max(0);
  const solarDisc = TSL.smoothstep(0.99988, 0.99996, sunCos);
  const solarGlow = TSL.pow(sunCos, 36).mul(0.32).add(TSL.pow(sunCos, 90).mul(0.55));
  const horizonGlow = TSL.pow(
    TSL.float(1).sub(height.abs()).max(0),
    3,
  ).mul(glowNode);
  // Project the view ray onto a horizontal approximation of the cloud slab.
  // WebGL2 raymarches a curved shell; sampling the sky direction as a 3D point
  // made the TSL clouds look like upright blobs instead of clouds sitting on a layer.
  const cloudLayerKm = cloudLayerHeightKm(params.cloudBottom, params.cloudTop);
  const cloudDistanceKm = TSL.float(cloudLayerKm).div(height.max(CLOUD_LAYER.minRayY));
  const cloudPlaneX = direction.x.mul(cloudDistanceKm).add(CLOUD_LAYER.offsetKm[0]);
  const cloudPlaneZ = direction.z.mul(cloudDistanceKm).add(CLOUD_LAYER.offsetKm[1]);
  const cloudU = cloudPlaneX.mul(cloudScaleNode);
  const cloudV = TSL.float(cloudBaseNoiseY(cloudLayerKm));
  const cloudW = cloudPlaneZ.mul(cloudScaleNode);
  const cloudWorley = (distance) => TSL.float(1).sub(distance.mul(Math.sqrt(3))).max(0).min(1);
  const cloudWarpNode = TSL.texture3D(
    cloudNoiseTexture,
    TSL.vec3(
      cloudU.mul(CLOUD_LAYER.warpScale).add(0.17),
      cloudV.mul(CLOUD_LAYER.warpScale).add(0.37),
      cloudW.mul(CLOUD_LAYER.warpScale).add(0.71),
    ),
  );
  const cloudX = cloudU.add(cloudWarpNode.g.sub(cloudWarpNode.r).mul(CLOUD_LAYER.warpAmount));
  const cloudY = cloudV.add(cloudWarpNode.b.sub(cloudWarpNode.g).mul(CLOUD_LAYER.warpAmount));
  const cloudZ = cloudW.add(cloudWarpNode.a.sub(cloudWarpNode.b).mul(CLOUD_LAYER.warpAmount));
  const cloudNoiseNode = TSL.texture3D(cloudNoiseTexture, TSL.vec3(cloudX, cloudY, cloudZ));
  const cloudLowFrequency = cloudWorley(cloudNoiseNode.g).mul(0.625)
    .add(cloudWorley(cloudNoiseNode.b).mul(0.25))
    .add(cloudWorley(cloudNoiseNode.a).mul(0.125));
  const cloudBaseWorley = cloudWorley(cloudNoiseNode.r);
  const cloudShape = TSL.clamp(
    cloudBaseWorley.add(TSL.float(1).sub(cloudLowFrequency).mul(0.6))
      .div(TSL.float(1).add(TSL.float(1).sub(cloudLowFrequency).mul(0.6))),
    0,
    1,
  );
  const cloudWeatherLow = TSL.texture3D(
    cloudNoiseTexture,
    TSL.vec3(
      cloudPlaneX.mul(CLOUD_LAYER.weatherLowScale),
      0.31,
      cloudPlaneZ.mul(CLOUD_LAYER.weatherLowScale),
    ),
  );
  const cloudWeatherMid = TSL.texture3D(
    cloudNoiseTexture,
    TSL.vec3(
      cloudPlaneX.mul(CLOUD_LAYER.weatherMidScale).add(0.5),
      0.71,
      cloudPlaneZ.mul(CLOUD_LAYER.weatherMidScale).add(0.5),
    ),
  );
  const cloudCoverage = TSL.clamp(
    TSL.max(cloudCoverageNode.mul(CLOUD_LAYER.coverageScale), overcastNode.mul(0.95))
      .mul(TSL.float(0.55).add(
        TSL.smoothstep(0.1, 0.8, cloudWorley(cloudWeatherLow.r)).mul(0.8),
      ))
      .mul(TSL.float(0.8).add(cloudWorley(cloudWeatherMid.r).mul(0.4))),
    0,
    1,
  );
  const cloudTop = TSL.float(0.35).add(cloudCoverage.mul(0.65));
  const cloudProfile = TSL.float(1).sub(TSL.smoothstep(
    cloudTop.mul(0.4),
    cloudTop,
    CLOUD_LAYER.sampleHeightFraction,
  ));
  const unfilteredCloudDensity = cloudShape.mul(cloudProfile)
    .sub(TSL.float(1).sub(cloudCoverage))
    .div(cloudCoverage.max(0.02))
    .max(0)
    .min(1);
  let cloudDensity = TSL.select(cloudCoverage.greaterThan(0.02), unfilteredCloudDensity, TSL.float(0));
  const cloudDetailNode = TSL.texture3D(
    cloudNoiseTexture,
    TSL.vec3(
      cloudPlaneX.mul(params.cloudDetailScale),
      CLOUD_DETAIL_Y,
      cloudPlaneZ.mul(params.cloudDetailScale),
    ),
  );
  const cloudDetailFbm = cloudWorley(cloudDetailNode.g).mul(0.625)
    .add(cloudWorley(cloudDetailNode.b).mul(0.25))
    .add(cloudWorley(cloudDetailNode.a).mul(0.125));
  const cloudDetailFade = TSL.float(1).sub(
    TSL.float(1 - CLOUD_LAYER.detail1FarKeep).mul(TSL.smoothstep(
      CLOUD_LAYER.detail1FadeKm[0],
      CLOUD_LAYER.detail1FadeKm[1],
      cloudDistanceKm,
    )),
  );
  const cloudErosion = TSL.float(1).sub(cloudDetailFbm)
    .mul(params.cloudErode)
    .mul(cloudDetailFade);
  cloudDensity = cloudDensity.sub(cloudErosion).div(TSL.float(1).sub(cloudErosion)).max(0).min(1);
  const cloudDetail2Node = TSL.texture3D(
    cloudNoiseTexture,
    TSL.vec3(
      cloudPlaneX.mul(params.cloudDetailScale * CLOUD_LAYER.detail2Scale).add(0.37),
      CLOUD_DETAIL2_Y,
      cloudPlaneZ.mul(params.cloudDetailScale * CLOUD_LAYER.detail2Scale).add(0.11),
    ),
  );
  const cloudDetail2 = TSL.float(1).sub(
    cloudWorley(cloudDetail2Node.g).mul(0.6).add(cloudWorley(cloudDetail2Node.b).mul(0.4)),
  );
  const cloudDetail2Fade = TSL.float(1).sub(TSL.smoothstep(
    CLOUD_LAYER.detail2FadeKm[0],
    CLOUD_LAYER.detail2FadeKm[1],
    cloudDistanceKm,
  ));
  const cloudErosion2 = cloudDetail2.mul(CLOUD_LAYER.detail2Erode)
    .mul(TSL.float(1).sub(cloudDensity.div(0.45)).max(0))
    .mul(cloudDetail2Fade);
  cloudDensity = cloudDensity.sub(cloudErosion2)
    .div(TSL.float(1).sub(cloudErosion2)).max(0).min(1);
  const cloudPathKm = TSL.float(CLOUD_LAYER.thicknessKm)
    .div(height.max(CLOUD_LAYER.minPathRayY));
  const cloudOpticalDepth = cloudDensity
    .mul(cloudDensityNode)
    .mul(cloudPathKm)
    .mul(CLOUD_LAYER.sigmaPerKm);
  const cloudAlpha = TSL.float(1).sub(TSL.exp(cloudOpticalDepth.negate()))
    .mul(TSL.exp(cloudDistanceKm.div(params.cloudFade * 3.5).negate()))
    .mul(TSL.smoothstep(CLOUD_LAYER.horizonFadeY[0], CLOUD_LAYER.horizonFadeY[1], height));
  const cloudMask = cloudAlpha;
  const cloudInterior = TSL.smoothstep(0.08, 0.75, cloudDensity);
  const cloudShade = TSL.float(0.68).add(cloudInterior.mul(0.22));
  const cloudBase = TSL.mix(
    TSL.vec3(0.17, 0.19, 0.23),
    TSL.vec3(0.76, 0.79, 0.82),
    TSL.smoothstep(-0.04, 0.28, sunDirectionNode.y),
  ).mul(TSL.float(1).sub(nightNode.mul(0.58)));
  const cloudLit = cloudBase.mul(cloudShade).mul(skyRadianceNode).add(
    sunColorNode.mul(TSL.pow(sunCos, 3).mul(cloudSunNode).mul(0.025)).mul(sunVisualNode),
  );
  const overcastSky = TSL.vec3(0.42, 0.45, 0.48).mul(TSL.float(0.35).add(skyGradient.mul(0.25)));
  const atmosphere = TSL.mix(baseSky.add(horizonGlow), overcastSky, overcastNode.mul(0.8))
    .mul(skyRadianceNode);
  const starCell = TSL.floor(direction.mul(380));
  const starHash = TSL.fract(TSL.sin(TSL.dot(starCell, TSL.vec3(12.9898, 78.233, 37.719))).mul(43758.5453));
  const stars = TSL.step(0.9985, starHash).mul(TSL.smoothstep(0.02, 0.35, height)).mul(starsNode);
  material.colorNode = TSL.mix(atmosphere, cloudLit, cloudMask)
    .add(sunColorNode.mul(solarDisc.add(solarGlow.mul(cloudSunNode).mul(0.01))).mul(sunVisualNode))
    .add(TSL.vec3(stars));

  const mesh = new THREE.Mesh(
    new WEBGPU.SphereGeometry(149000, 32, 20),
    material,
  );
  mesh.name = "NodeSkyDome";
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;

  const skyUniforms = {
    uHzK: { value: new THREE.Vector3(0.56, 0.63, 0.78) },
  };
  function update() {
    const el = THREE.MathUtils.degToRad(params.elevation);
    const az = THREE.MathUtils.degToRad(params.azimuth);
    sunDir.set(
      Math.cos(el) * Math.cos(az),
      Math.sin(el),
      Math.cos(el) * Math.sin(az),
    ).normalize();
    const transmittance = sunTransmittance(Math.max(el, 0.009), params.mie);
    const energy = params.skyScale * 0.62 * params.lightScale;
    sunColor.setRGB(
      transmittance[0] * energy * params.lightTint[0],
      transmittance[1] * energy * params.lightTint[1],
      transmittance[2] * energy * params.lightTint[2],
    );
    // lighting.ts already folds day/night and twilight into skyTint.
    skyTint.set(params.skyTint[0], params.skyTint[1], params.skyTint[2]);
    horizonTint.set(
      0.62 * skyTint.x + params.skyGlow[0],
      0.72 * skyTint.y + params.skyGlow[1],
      0.9 * skyTint.z + params.skyGlow[2],
    );
    glowTint.set(...params.skyGlow);
    skyUniforms.uHzK.value.set(
      THREE.MathUtils.lerp(0.56, 0.38, params.night),
      THREE.MathUtils.lerp(0.63, 0.38, params.night),
      THREE.MathUtils.lerp(0.78, 0.5, params.night),
    );
    cloudCoverageNode.value = params.cloudCoverage;
    cloudDensityNode.value = params.cloudDensity;
    cloudScaleNode.value = params.cloudScale;
    cloudSunNode.value = params.cloudSun;
    nightNode.value = params.night;
    overcastNode.value = params.overcast;
    starsNode.value = params.stars;
    skyRadianceNode.value = params.skyScale * skyRadianceFactor;
    envDirty = true;
  }

  const smoothstep = (a, b, value) => {
    const t = THREE.MathUtils.clamp((value - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  function bakeEnvironment() {
    if (!envDirty) return envTexture;
    const [width, height] = envSize;
    const tint = params.skyTint;
    const glow = params.skyGlow;
    const skyRadianceScale = params.skyScale * skyRadianceFactor;
    const day = smoothstep(-0.08, 0.16, sunDir.y);
    const c = new THREE.Vector3();
    const cloudColor = new THREE.Vector3();
    const cloudScratch = createCloudLayerScratch();
    const cloudSample = { density: 0, alpha: 0, fade: 0, distanceKm: 0 };
    const cloudConfig = {
      coverage: Math.max(params.cloudCoverage * CLOUD_LAYER.coverageScale, params.overcast * 0.95),
      cloudScale: params.cloudScale,
      detailScale: params.cloudDetailScale,
      erode: params.cloudErode,
      cloudDensity: params.cloudDensity,
      cloudFade: params.cloudFade,
      layerKm: cloudLayerHeightKm(params.cloudBottom, params.cloudTop),
    };
    const baseH = new THREE.Vector3(0.035, 0.043, 0.065).lerp(new THREE.Vector3(0.48, 0.61, 0.78), day);
    const baseZ = new THREE.Vector3(0.006, 0.009, 0.018).lerp(new THREE.Vector3(0.13, 0.31, 0.68), day);
    for (let y = 0; y < height; y++) {
      const elev = Math.PI * (0.5 - (y + 0.5) / height);
      const ce = Math.cos(elev), se = Math.sin(elev);
      const skyMix = smoothstep(-0.22, 0.52, se);
      for (let x = 0; x < width; x++) {
        const az = ((x + 0.5) / width - 0.5) * Math.PI * 2;
        const dx = Math.cos(az) * ce, dz = Math.sin(az) * ce;
        const dotSun = Math.max(0, dx * sunDir.x + se * sunDir.y + dz * sunDir.z);
        const glowScale = Math.pow(Math.max(0, 1 - Math.abs(se)), 3);
        c.copy(baseH).lerp(baseZ, skyMix);
        c.set(c.x * tint[0] + glow[0] * Math.exp(-Math.max(se, 0) * 7), c.y * tint[1] + glow[1] * Math.exp(-Math.max(se, 0) * 7), c.z * tint[2] + glow[2] * Math.exp(-Math.max(se, 0) * 7));
        c.multiplyScalar(skyRadianceScale);
        evaluateCloudLayer(cloudNoiseData, dx, se, dz, cloudConfig, cloudScratch, cloudSample);
        const cloudShade = 0.68 + smoothstep(0.08, 0.75, cloudSample.density) * 0.22;
        const cloud = cloudSample.alpha;
        const cloudLight = THREE.MathUtils.lerp(0.17, 0.76, smoothstep(-0.04, 0.28, sunDir.y))
          * (1 - params.night * 0.58);
        const cloudR = cloudLight * cloudShade * 0.99 * skyRadianceScale + sunColor.r * Math.pow(dotSun, 3) * params.cloudSun * 0.025;
        const cloudG = cloudLight * cloudShade * 1.02 * skyRadianceScale + sunColor.g * Math.pow(dotSun, 3) * params.cloudSun * 0.025;
        const cloudB = cloudLight * cloudShade * 1.06 * skyRadianceScale + sunColor.b * Math.pow(dotSun, 3) * params.cloudSun * 0.025;
        const overcastK = params.overcast * 0.8;
        const grey = 0.42 * (0.35 + skyMix * 0.25) * skyRadianceScale;
        c.lerp(cloudColor.set(grey, grey * 1.07, grey * 1.14), overcastK);
        c.lerp(cloudColor.set(cloudR, cloudG, cloudB), cloud);
        const sun = Math.pow(dotSun, 90) + Math.pow(dotSun, 36) * 0.32;
        c.addScaledVector(sunColor, Math.min(1, sun * 0.025));
        c.x += glow[0] * glowScale;
        c.y += glow[1] * glowScale;
        c.z += glow[2] * glowScale;
        const i = (y * width + x) * 4;
        envData[i] = toHalf(Math.max(0, c.x));
        envData[i + 1] = toHalf(Math.max(0, c.y));
        envData[i + 2] = toHalf(Math.max(0, c.z));
        envData[i + 3] = toHalf(1);
      }
    }
    envTexture.needsUpdate = true;
    envDirty = false;
    return envTexture;
  }

  update();
  return {
    params,
    sunDir,
    sunColor,
    sunVisualNode,
    environmentTexture: envTexture,
    skyUniforms,
    mesh,
    update,
    renderEnv() { return bakeEnvironment(); },
    renderEnvFace() {},
    finishEnv() { return bakeEnvironment(); },
  };
}
