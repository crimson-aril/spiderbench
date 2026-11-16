// Shared cloud-layer constants and CPU helpers for the node (WebGPU / TSL) sky.
//
// The TSL dome shader in sky.ts and the CPU equirect environment bake MUST use the same projection and density
// chain. Everything numeric lives here so the two cannot drift. Each constant names the line of the WebGL2
// reference (webgl2Shader/glsl/sky.glsl: marchClouds / cloudDensity) it comes from.
//
// This file has no imports on purpose: it can be unit-tested under plain Node.

export const CLOUD_NOISE_SIZE = 48;

export const CLOUD_LAYER = {
  /**
   * Fraction of the cloud slab (0 = base, 1 = top) where the planar projection and the height profile are
   * evaluated. From the ground you mostly see the flat base and the lower flanks, so a low-mid fraction is used.
   */
  sampleHeightFraction: 0.3,
  /** Rays flatter than this are clamped before projecting onto the layer (the horizon fade hides them anyway). */
  minRayY: 0.035,
  /** Fade clouds out at the skyline in both the TSL sky and CPU environment bake. */
  horizonFadeY: [0.08, 0.25] as const,
  /** Reduce base cloud amount by 25%; overcast remains controlled by its separate override. */
  coverageScale: 0.75,
  /** sky.glsl: uCloudOffset.xz (km). Added to the hit point before every noise lookup. */
  offsetKm: [3.1, 7.7] as const,
  /** sky.glsl cloudDensity: `q * vec3(uCloudScale, 0.2, uCloudScale)` -> noise-space units per km of altitude. */
  yUvPerKm: 0.2,
  /** sky.glsl cloudDensity: weather masks `q.xz * 0.018` and `q.xz * 0.05 + 0.5`. */
  weatherLowScale: 0.018,
  weatherMidScale: 0.05,
  /** Domain warp (node-sky addition; breaks up the regular Worley lattice). */
  warpScale: 0.55,
  warpAmount: 0.11,
  /** sky.glsl marchClouds: SIGMA = 45 / km at density 1. */
  sigmaPerKm: 45,
  /** Mean in-cloud path length through the slab at zenith (km). Path grows as 1 / rayY, capped by minPathRayY. */
  thicknessKm: 0.5,
  minPathRayY: 0.25,
  /** sky.glsl: second billow octave frequency multiplier / strength. */
  detail2Scale: 3.1,
  detail2Erode: 0.35,
  /**
   * Anti-aliasing (node-sky addition, NOT in the GLSL reference): the 8-bit noise has no mipmaps, so the finest
   * octaves alias once their cells shrink below ~1.5 px. Fade them out with layer distance (km).
   */
  detail1FadeKm: [12, 32] as const,
  detail1FarKeep: 0.3,
  detail2FadeKm: [4, 12] as const,
} as const;

/** Height (km above the camera) at which the planar projection is done. */
export function cloudLayerHeightKm(bottomKm: number, topKm: number): number {
  return bottomKm + (topKm - bottomKm) * CLOUD_LAYER.sampleHeightFraction;
}

/** Noise-space y of the base lookup; shared with the TSL graph. */
export function cloudBaseNoiseY(layerKm: number): number {
  return layerKm * CLOUD_LAYER.yUvPerKm;
}

/** y offsets of the two erosion lookups at the sample height (sky.glsl: `hf * 0.3` and `hf * 0.6`). */
export const CLOUD_DETAIL_Y = 0.37 + 0.3 * CLOUD_LAYER.sampleHeightFraction;
export const CLOUD_DETAIL2_Y = 0.2 + 0.6 * CLOUD_LAYER.sampleHeightFraction;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const channelAt = (values: Float32Array, channel: 0 | 1 | 2 | 3): number => values[channel]!;
export function smoothstep(a: number, b: number, v: number): number {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function cloudCellRandom(x: number, y: number, z: number, channel: number): number {
  let hash = Math.imul(x | 0, 374761393)
    + Math.imul(y | 0, 668265263)
    + Math.imul(z | 0, 2147483647)
    + Math.imul(channel | 0, 1274126177);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  hash = Math.imul(hash ^ (hash >>> 16), 2246822519);
  hash ^= hash >>> 13;
  return (hash >>> 0) / 4294967295;
}

/** Tileable Worley distance fields, RGBA = cell frequencies 4 / 8 / 16 / 24 (unchanged algorithm, size now a parameter). */
export function createCloudNoiseData(size: number = CLOUD_NOISE_SIZE): Uint8Array {
  const data = new Uint8Array(size * size * size * 4);
  const frequencies = [4, 8, 16, 24];
  const featureJitter = frequencies.map((frequency, channel) => {
    const count = frequency * frequency * frequency;
    const x = new Float32Array(count);
    const y = new Float32Array(count);
    const z = new Float32Array(count);
    for (let cellZ = 0; cellZ < frequency; cellZ++) {
      for (let cellY = 0; cellY < frequency; cellY++) {
        for (let cellX = 0; cellX < frequency; cellX++) {
          const index = (cellZ * frequency + cellY) * frequency + cellX;
          x[index] = 0.16 + cloudCellRandom(cellX, cellY, cellZ, channel * 3) * 0.68;
          y[index] = 0.16 + cloudCellRandom(cellX, cellY, cellZ, channel * 3 + 1) * 0.68;
          z[index] = 0.16 + cloudCellRandom(cellX, cellY, cellZ, channel * 3 + 2) * 0.68;
        }
      }
    }
    return { frequency, x, y, z };
  });

  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const uvx = (x + 0.5) / size;
        const uvy = (y + 0.5) / size;
        const uvz = (z + 0.5) / size;
        const offset = ((z * size + y) * size + x) * 4;
        for (let channel = 0; channel < frequencies.length; channel++) {
          const { frequency, x: jitterX, y: jitterY, z: jitterZ } = featureJitter[channel]!;
          const px = uvx * frequency;
          const py = uvy * frequency;
          const pz = uvz * frequency;
          const ix = Math.floor(px);
          const iy = Math.floor(py);
          const iz = Math.floor(pz);
          let nearestSquared = Infinity;
          for (let dz = -1; dz <= 1; dz++) {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const cellX = ix + dx;
                const cellY = iy + dy;
                const cellZ = iz + dz;
                const featureIndex = (positiveModulo(cellZ, frequency) * frequency + positiveModulo(cellY, frequency)) * frequency
                  + positiveModulo(cellX, frequency);
                const deltaX = px - (cellX + jitterX[featureIndex]!);
                const deltaY = py - (cellY + jitterY[featureIndex]!);
                const deltaZ = pz - (cellZ + jitterZ[featureIndex]!);
                const d2 = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
                if (d2 < nearestSquared) nearestSquared = d2;
              }
            }
          }
          data[offset + channel] = Math.round(clamp(Math.sqrt(nearestSquared) / Math.sqrt(3), 0, 1) * 255);
        }
      }
    }
  }
  return data;
}

/** Trilinear, wrapped lookup that matches a LinearFilter + RepeatWrapping 3D texture. */
export function sampleCloudNoise(
  data: Uint8Array,
  u: number,
  v: number,
  w: number,
  out: Float32Array | number[],
  size: number = CLOUD_NOISE_SIZE,
): Float32Array | number[] {
  const axis = (value: number) => {
    const wrapped = value - Math.floor(value);
    const texel = wrapped * size - 0.5;
    const base = Math.floor(texel);
    return [positiveModulo(base, size), positiveModulo(base + 1, size), texel - base] as const;
  };
  const [x0, x1, tx] = axis(u);
  const [y0, y1, ty] = axis(v);
  const [z0, z1, tz] = axis(w);
  for (let channel = 0; channel < 4; channel++) {
    const read = (x: number, y: number, z: number) => data[((z * size + y) * size + x) * 4 + channel]! / 255;
    const x00 = lerp(read(x0, y0, z0), read(x1, y0, z0), tx);
    const x10 = lerp(read(x0, y1, z0), read(x1, y1, z0), tx);
    const x01 = lerp(read(x0, y0, z1), read(x1, y0, z1), tx);
    const x11 = lerp(read(x0, y1, z1), read(x1, y1, z1), tx);
    out[channel] = lerp(lerp(x00, x10, ty), lerp(x01, x11, ty), tz);
  }
  return out;
}

/** Stored value is nearest-feature distance / sqrt(3); the density chain wants "1 at a feature, 0 one cell away". */
export function cloudWorleyValue(distance: number): number {
  return clamp(1 - distance * Math.sqrt(3), 0, 1);
}

export interface CloudLayerConfig {
  /** max(params.cloudCoverage, params.overcast * 0.95) */
  coverage: number;
  /** params.cloudScale (1 / km) */
  cloudScale: number;
  /** params.cloudDetailScale (1 / km) */
  detailScale: number;
  /** params.cloudErode */
  erode: number;
  /** params.cloudDensity */
  cloudDensity: number;
  /** params.cloudFade (km) */
  cloudFade: number;
  /** cloudLayerHeightKm(params.cloudBottom, params.cloudTop) */
  layerKm: number;
}

export interface CloudLayerScratch {
  warp: Float32Array;
  base: Float32Array;
  weatherLow: Float32Array;
  weatherMid: Float32Array;
  detail: Float32Array;
  detail2: Float32Array;
}

export interface CloudLayerSample {
  /** eroded density, 0..1 (before params.cloudDensity) */
  density: number;
  /** final cloud opacity incl. aerial-perspective "keep" and the horizon fade */
  alpha: number;
  /** exp(-distance / cloudFade): 1 = full cloud colour, 0 = fully melted into horizon haze */
  fade: number;
  distanceKm: number;
}

export function createCloudLayerScratch(): CloudLayerScratch {
  return {
    warp: new Float32Array(4),
    base: new Float32Array(4),
    weatherLow: new Float32Array(4),
    weatherMid: new Float32Array(4),
    detail: new Float32Array(4),
    detail2: new Float32Array(4),
  };
}

/**
 * CPU mirror of the TSL cloud graph in sky.ts (createNodeSky). Keep the two in lock-step:
 *   projection -> warp -> base shape -> weather coverage -> height profile -> linear remap
 *   -> erosion octave 1 (inverted fbm) -> erosion octave 2 -> optical depth -> aerial perspective.
 */
export function evaluateCloudLayer(
  data: Uint8Array,
  dirX: number,
  dirY: number,
  dirZ: number,
  cfg: CloudLayerConfig,
  scratch: CloudLayerScratch,
  out: CloudLayerSample,
  size: number = CLOUD_NOISE_SIZE,
): CloudLayerSample {
  const L = CLOUD_LAYER;
  const hf = L.sampleHeightFraction;

  // 1. Project the view ray onto the cloud layer; the noise lives in world km, like the GLSL raymarch.
  const distanceKm = cfg.layerKm / Math.max(dirY, L.minRayY);
  const planeX = dirX * distanceKm + L.offsetKm[0];
  const planeZ = dirZ * distanceKm + L.offsetKm[1];
  const baseY = cloudBaseNoiseY(cfg.layerKm);
  const uvX = planeX * cfg.cloudScale;
  const uvZ = planeZ * cfg.cloudScale;

  // 2. Domain warp + base Worley shape (same Nubis-style remap as the GLSL).
  sampleCloudNoise(data, uvX * L.warpScale + 0.17, baseY * L.warpScale + 0.37, uvZ * L.warpScale + 0.71, scratch.warp, size);
  const warp = scratch.warp;
  const wx = uvX + (channelAt(warp, 1) - channelAt(warp, 0)) * L.warpAmount;
  const wy = baseY + (channelAt(warp, 2) - channelAt(warp, 1)) * L.warpAmount;
  const wz = uvZ + (channelAt(warp, 3) - channelAt(warp, 2)) * L.warpAmount;
  sampleCloudNoise(data, wx, wy, wz, scratch.base, size);
  const b = scratch.base;
  const lowFrequency = cloudWorleyValue(channelAt(b, 1)) * 0.625
    + cloudWorleyValue(channelAt(b, 2)) * 0.25
    + cloudWorleyValue(channelAt(b, 3)) * 0.125;
  const shape = clamp(
    (cloudWorleyValue(channelAt(b, 0)) + (1 - lowFrequency) * 0.6) / (1 + (1 - lowFrequency) * 0.6),
    0,
    1,
  );

  // 3. Weather coverage (sky.glsl: wx / wy masks).
  sampleCloudNoise(data, planeX * L.weatherLowScale, 0.31, planeZ * L.weatherLowScale, scratch.weatherLow, size);
  sampleCloudNoise(data, planeX * L.weatherMidScale + 0.5, 0.71, planeZ * L.weatherMidScale + 0.5, scratch.weatherMid, size);
  const coverage = clamp(
    cfg.coverage
      * (0.55 + 0.8 * smoothstep(0.1, 0.8, cloudWorleyValue(channelAt(scratch.weatherLow, 0))))
      * (0.8 + 0.4 * cloudWorleyValue(channelAt(scratch.weatherMid, 0))),
    0,
    1,
  );

  // 4. Height profile + linear remap (sky.glsl: grad, remap(base * grad, 1 - cov, 1, 0, 1)).
  const top = 0.35 + 0.65 * coverage;
  const profile = 1 - smoothstep(top * 0.4, top, hf);
  let density = coverage > 0.02
    ? clamp((shape * profile - (1 - coverage)) / Math.max(coverage, 0.02), 0, 1)
    : 0;

  // 5. Erosion octave 1. sky.glsl flips the fbm with height: df = mix(df, 1 - df, clamp(hf * 4, 0, 1)); hf = 0.3 -> fully flipped.
  const fade1 = 1 - (1 - L.detail1FarKeep) * smoothstep(L.detail1FadeKm[0], L.detail1FadeKm[1], distanceKm);
  sampleCloudNoise(data, planeX * cfg.detailScale, CLOUD_DETAIL_Y, planeZ * cfg.detailScale, scratch.detail, size);
  const d1 = scratch.detail;
  const detailFbm = cloudWorleyValue(channelAt(d1, 1)) * 0.625
    + cloudWorleyValue(channelAt(d1, 2)) * 0.25
    + cloudWorleyValue(channelAt(d1, 3)) * 0.125;
  const erosion = (1 - detailFbm) * cfg.erode * fade1;
  density = clamp((density - erosion) / (1 - erosion), 0, 1);

  // 6. Erosion octave 2 (cauliflower lumps on the thin outer shell).
  const fade2 = 1 - smoothstep(L.detail2FadeKm[0], L.detail2FadeKm[1], distanceKm);
  sampleCloudNoise(
    data,
    planeX * cfg.detailScale * L.detail2Scale + 0.37,
    CLOUD_DETAIL2_Y,
    planeZ * cfg.detailScale * L.detail2Scale + 0.11,
    scratch.detail2,
    size,
  );
  const d2 = scratch.detail2;
  const detail2 = 1 - (cloudWorleyValue(channelAt(d2, 1)) * 0.6 + cloudWorleyValue(channelAt(d2, 2)) * 0.4);
  const erosion2 = detail2 * L.detail2Erode * Math.max(0, 1 - density / 0.45) * fade2;
  density = clamp((density - erosion2) / (1 - erosion2), 0, 1);

  // 7. Optical depth -> opacity (the GLSL integrates 45 / km * density along the ray; thin edges stay crisp).
  const pathKm = L.thicknessKm / Math.max(dirY, L.minPathRayY);
  const opticalDepth = density * cfg.cloudDensity * pathKm * L.sigmaPerKm;
  const keep = Math.exp(-distanceKm / (cfg.cloudFade * 3.5));
  const horizon = smoothstep(L.horizonFadeY[0], L.horizonFadeY[1], dirY);
  out.density = density;
  out.alpha = (1 - Math.exp(-opticalDepth)) * keep * horizon;
  out.fade = Math.exp(-distanceKm / cfg.cloudFade);
  out.distanceKm = distanceKm;
  return out;
}
