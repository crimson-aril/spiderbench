// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";
import { nightK } from "../../render/daynight.ts";
import { createWebGPUEnvironmentReflection } from "../../render/webGPUShaderNodes/environmentReflection.ts";

const facadeNodeData = new WeakMap();

const smoothMask = (value, lo, hi) =>
  TSL.float(1).sub(TSL.smoothstep(lo, hi, value));

/** TSL approximation of the city's heavily customized GLSL facade shader. */
export function createFacadeNodeMaterial(T) {
  const facadeProbe = new URLSearchParams(window.location.search).get("lprobe");
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0xffffff,
    roughness: 0.82,
    metalness: 0,
  });
  material.name = "CityFacade.TSL";

  const night = TSL.uniform(nightK.value);
  night.onRenderUpdate(() => {
    night.value = nightK.value;
  });

  const facade = TSL.varying(TSL.uv(), "vFacadeUv");
  const face = TSL.varying(TSL.attribute("aF", "vec4"), "vFacadeF");
  const styleData = TSL.varying(TSL.attribute("aS", "vec4"), "vFacadeS");
  const dimensions = TSL.varying(TSL.attribute("aW", "vec4"), "vFacadeW");
  const tint = TSL.varying(TSL.attribute("aTint", "vec3"), "vFacadeTint");
  const worldPosition = TSL.positionWorld;
  const worldNormal = TSL.normalize(TSL.normalWorld);

  const packedLayer = styleData.x;
  const baseLayer = TSL.mod(packedLayer, 16);
  const layer = TSL.select(
    worldNormal.y.greaterThan(0.5).and(baseLayer.greaterThan(9.5).and(baseLayer.lessThan(10.5))),
    TSL.float(8),
    TSL.select(
      worldNormal.y.greaterThan(0.5).and(baseLayer.greaterThan(4.5).and(baseLayer.lessThan(5.5))),
      TSL.float(8),
      baseLayer,
    ),
  );
  const seed = styleData.y;
  const style = styleData.w;
  const floorHeight = face.x.max(0.5);
  const bayWidth = face.y.max(0.5);
  const baseY = dimensions.z;
  const y = facade.y.sub(baseY);
  const faceWidth = dimensions.x.max(1);
  const floorToStreet = styleData.z.abs();

  // Match the source facade atlas' material scale per layer. Sampling the array
  // texture keeps material variation without adding a draw call per building.
  let scale = TSL.float(4);
  scale = TSL.select(layer.greaterThan(12.5), TSL.float(3), scale);
  scale = TSL.select(layer.greaterThan(13.5), TSL.float(3), scale);
  scale = TSL.select(layer.greaterThan(14.5), TSL.float(1.8), scale);
  scale = TSL.select(layer.lessThan(2.5), TSL.float(1.8), scale);
  scale = TSL.select(layer.greaterThan(2.5).and(layer.lessThan(3.5)), TSL.float(3), scale);
  scale = TSL.select(layer.greaterThan(3.5).and(layer.lessThan(4.5)), TSL.float(4), scale);
  scale = TSL.select(layer.greaterThan(4.5).and(layer.lessThan(5.5)), TSL.float(3), scale);
  scale = TSL.select(layer.greaterThan(5.5).and(layer.lessThan(6.5)), TSL.float(2), scale);
  scale = TSL.select(layer.greaterThan(6.5).and(layer.lessThan(7.5)), TSL.float(2.4), scale);
  scale = TSL.select(layer.greaterThan(7.5).and(layer.lessThan(8.5)), TSL.float(8), scale);
  scale = TSL.select(layer.greaterThan(8.5).and(layer.lessThan(9.5)), TSL.float(4), scale);
  scale = TSL.select(layer.greaterThan(9.5).and(layer.lessThan(11.5)), TSL.float(8), scale);

  const buildingOffset = TSL.vec2(
    TSL.fract(seed.mul(0.618)).mul(8),
    TSL.fract(seed.mul(0.377)).mul(8),
  );
  const wallUv = facade.add(buildingOffset).div(scale);
  const wallTextureSample = TSL.texture(T.wallsCol, wallUv).depth(TSL.int(layer)).rgb;
  const wallBaseColor = wallTextureSample.mul(tint);
  let wallColor = wallBaseColor;
  const worldNoiseUv = TSL.vec2(
    worldPosition.x.add(worldPosition.z.mul(0.37)).div(47),
    worldPosition.y.div(83).add(seed.mul(0.071)),
  );
  const broadWeather = TSL.texture(T.noise, worldNoiseUv).rgb;
  wallColor = wallColor
    .mul(TSL.float(0.88).add(broadWeather.r.mul(0.22)))
    .mul(TSL.float(0.92).add(broadWeather.g.mul(0.14)));
  const wallWeatherColor = wallColor;

  const lowFloorGrime = TSL.mix(
    TSL.float(0.7),
    TSL.float(1),
    TSL.smoothstep(0, 2.5, y),
  );
  wallColor = wallColor.mul(lowFloorGrime);
  const wallGrimeColor = wallColor;

  const activeWindows = style.greaterThan(0.5).and(style.lessThan(4.5));
  const usableWidth = faceWidth.sub(dimensions.w.mul(2)).max(1);
  const bays = TSL.floor(usableWidth.div(bayWidth).add(0.5)).max(1);
  const actualBay = usableWidth.div(bays);
  const facadeU = facade.x.sub(dimensions.w);
  const bayCoord = facadeU.div(actualBay);
  const bayFraction = TSL.fract(bayCoord);
  const floorCoord = y.sub(floorToStreet).div(floorHeight);
  const floorIndex = TSL.floor(floorCoord);
  const floorFraction = TSL.fract(floorCoord);
  const curtain = style.greaterThan(1.5).and(style.lessThan(2.5));
  const ribbon = style.greaterThan(2.5).and(style.lessThan(3.5));
  const windowHalfWidth = TSL.select(curtain, TSL.float(0.38), face.z.mul(0.5));
  const windowWidthMask = smoothMask(
    bayFraction.sub(0.5).abs(),
    windowHalfWidth.sub(0.025).max(0.01),
    windowHalfWidth.add(0.025),
  );
  const windowCenter = TSL.select(curtain, TSL.float(0.62), TSL.float(0.42));
  const windowHalfHeight = TSL.select(curtain, TSL.float(0.39), face.w.mul(0.5));
  const windowHeightMask = smoothMask(
    floorFraction.sub(windowCenter).abs(),
    windowHalfHeight.sub(0.025).max(0.01),
    windowHalfHeight.add(0.025),
  );
  const curtainBand = smoothMask(floorFraction, 0.14, 0.86);
  const ribbonGlass = smoothMask(floorFraction.sub(0.5).abs(), 0.29, 0.47);
  const upperWindow = windowWidthMask.mul(
    TSL.select(curtain, curtainBand, windowHeightMask),
  );
  const windowPattern = TSL.select(ribbon, ribbonGlass, upperWindow)
    .mul(activeWindows)
    .mul(y.greaterThan(floorToStreet));

  // Ground-floor shop glazing follows the same per-building bay dimensions,
  // with a restrained warm interior glow tied to the shared day/night clock.
  const shopCount = TSL.floor(faceWidth.div(6.5).add(0.5)).max(1);
  const shopBay = faceWidth.div(shopCount);
  const shopFraction = TSL.fract(facade.x.div(shopBay));
  const shopWindowX = smoothMask(shopFraction.sub(0.5).abs(), 0.30, 0.46);
  const shopWindowY = TSL.smoothstep(0.55, 0.8, y).mul(
    TSL.float(1).sub(TSL.smoothstep(floorToStreet.sub(1.9), floorToStreet.sub(1.2), y)),
  );
  const shopArea = styleData.z.greaterThan(0.05)
    .and(y.lessThan(floorToStreet))
    .and(activeWindows);
  const shopWindow = shopWindowX.mul(shopWindowY).mul(shopArea);
  const glassMask = windowPattern.max(shopWindow);
  const cellHash = TSL.fract(
    TSL.sin(
      bayCoord.floor().mul(127.1)
        .add(floorIndex.mul(311.7))
        .add(seed.mul(74.7)),
    ).mul(43758.5453),
  );
  const litWindows = cellHash.lessThan(0.43).mul(night).mul(glassMask);
  const nightEmission = TSL.mix(
    TSL.vec3(0.025, 0.034, 0.05),
    TSL.vec3(1.0, 0.57, 0.29),
    TSL.select(shopWindow.greaterThan(0), TSL.float(0.72), TSL.float(0.5)),
  ).mul(litWindows).mul(2.6);

  const mullions = windowPattern.mul(
    TSL.float(1).sub(
      smoothMask(TSL.fract(bayFraction.mul(5)).sub(0.5).abs(), 0.45, 0.49),
    ),
  );
  const openingColor = TSL.mix(
    TSL.vec3(0.035, 0.045, 0.055),
    TSL.vec3(0.24, 0.28, 0.3),
    TSL.float(1).sub(night.mul(0.45)),
  );
  wallColor = TSL.mix(wallColor, openingColor, glassMask);
  wallColor = TSL.mix(wallColor, tint.mul(0.62), mullions.mul(0.72));
  const wallWindowColor = wallColor;

  // The crown tier uses a bright metallic shell and a segmented, emissive
  // arched band instead of the GLSL shader's more detailed Chrysler sunburst.
  const isCrown = style.greaterThan(5.5);
  const topY = dimensions.y.sub(baseY).max(1);
  const crownU = facade.x.sub(faceWidth.mul(0.5)).div(faceWidth.mul(0.5));
  const crownY = y.sub(topY.mul(0.35)).div(topY.mul(0.75));
  const crownRadius = crownU.mul(crownU).add(crownY.mul(crownY)).sqrt();
  const crownBand = TSL.smoothstep(0.60, 0.68, crownRadius).mul(
    TSL.float(1).sub(TSL.smoothstep(0.92, 1.0, crownRadius)),
  );
  const crownSpokes = TSL.smoothstep(
    0.08,
    0.22,
    TSL.fract(TSL.atan(crownY, crownU).div(Math.PI).mul(9)).abs().sub(0.5).abs(),
  );
  const crownGlass = crownBand.mul(crownSpokes).mul(isCrown);
  wallColor = TSL.mix(wallColor, TSL.vec3(0.56, 0.575, 0.6), isCrown);
  wallColor = TSL.mix(wallColor, TSL.vec3(0.035, 0.04, 0.05), crownGlass);
  const wallCrownColor = wallColor;

  // Sample the WebGPU sky texture directly along the reflected world-space
  // ray so facade glass keeps a live reflection even before SSR is composited.
  const viewDirection = TSL.normalize(TSL.cameraPosition.sub(worldPosition));
  const grazing = TSL.float(1).sub(TSL.abs(TSL.dot(worldNormal, viewDirection))).clamp();
  const environmentReflection = createWebGPUEnvironmentReflection();
  const glassReflection = environmentReflection
    .mul(TSL.float(0.1).add(grazing.mul(0.42)))
    .mul(glassMask)
    .add(
      environmentReflection
        .mul(TSL.float(0.14).add(grazing.mul(0.48)))
        .mul(crownGlass),
    )
    .mul(TSL.float(1).sub(night.mul(0.55)));

  const facadeProbeColor = {
    walltex: wallTextureSample,
    walllayer: TSL.vec3(layer.div(15), TSL.float(1).sub(layer.div(15)), 0.2),
    walltint: tint,
    wallbase: wallBaseColor,
    wallweather: wallWeatherColor,
    wallgrime: wallGrimeColor,
    wallwindows: wallWindowColor,
    wallcrown: wallCrownColor,
  }[facadeProbe];
  const isFacadeProbe = facadeProbeColor !== undefined;
  material.colorNode = facadeProbeColor ?? wallColor;
  material.roughnessNode = TSL.select(
    crownGlass.greaterThan(0.01),
    TSL.float(0.1),
    TSL.select(
      isCrown,
      TSL.float(0.24),
      TSL.select(
        glassMask.greaterThan(0.01),
        TSL.float(0.2),
        TSL.select(layer.greaterThan(4.5).and(layer.lessThan(5.5)), TSL.float(0.32), TSL.float(0.84)),
      ),
    ),
  );
  material.metalnessNode = TSL.select(
    crownGlass.greaterThan(0.01),
    TSL.float(0),
    TSL.select(
      isCrown,
      TSL.float(0.72),
      TSL.select(
        glassMask.greaterThan(0.01),
        TSL.float(0.22),
        TSL.select(layer.greaterThan(4.5).and(layer.lessThan(5.5)), TSL.float(0.6), TSL.float(0)),
      ),
    ),
  );
  const emission = nightEmission.add(glassReflection).add(
    crownGlass.mul(night).mul(TSL.vec3(0.85, 0.92, 1)).mul(1.8),
  );
  material.emissiveNode = isFacadeProbe ? TSL.vec3(0) : emission;
  if (isFacadeProbe) {
    material.lights = false;
    material.userData.facadeProbe = facadeProbe;
    material.needsUpdate = true;
    if (facadeProbe === "walltex") {
      console.info("[tsl] facade wall texture probe", {
        textureType: T.wallsCol?.constructor?.name,
        compressedArray: T.wallsCol?.isCompressedArrayTexture === true,
        depth: T.wallsCol?.image?.depth,
        width: T.wallsCol?.image?.width,
        height: T.wallsCol?.image?.height,
        mipLevels: T.wallsCol?.mipmaps?.length,
        colorSpace: T.wallsCol?.colorSpace,
      });
    }
  }
  // Carry the facade-glass SSR mask through the opaque scene pass alpha.
  material.opacityNode = TSL.float(1).add(glassMask.max(crownGlass).clamp());
  facadeNodeData.set(material, {
    colorNode: wallColor,
    emissiveNode: emission,
    night,
  });
  material.userData.nodeFacade = true;
  material.userData.noSSR = true;
  return material;
}

export function deriveFacadeNodeMaterial(base, farNight = false) {
  const material = base.clone();
  const nodes = facadeNodeData.get(base);
  if (nodes && farNight && !base.userData.facadeProbe) {
    const farNightScale = TSL.float(1).sub(nodes.night.mul(0.8));
    material.colorNode = nodes.colorNode.mul(farNightScale);
    material.emissiveNode = nodes.emissiveNode.mul(farNightScale);
    facadeNodeData.set(material, {
      ...nodes,
      colorNode: material.colorNode,
      emissiveNode: material.emissiveNode,
    });
  }
  return material;
}
