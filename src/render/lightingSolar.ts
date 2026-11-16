// @ts-nocheck
import * as THREE from "three";
const GRID_ROT = 29; // deg, Manhattan grid north vs true north
const LAT = (40.75 * Math.PI) / 180,
  DECL = (6.0 * Math.PI) / 180,
  SOLAR_NOON = 12.95;
export function solarPosition(hour) {
  let dh = ((((hour - SOLAR_NOON) % 24) + 36) % 24) - 12; // (daynight) wrap to [-12, 12) h: continuous azimuth through midnight
  const H = (dh * 15 * Math.PI) / 180;
  const sinEl =
    Math.sin(LAT) * Math.sin(DECL) +
    Math.cos(LAT) * Math.cos(DECL) * Math.cos(H);
  const el = Math.asin(sinEl);
  let cosA =
    (Math.sin(DECL) - sinEl * Math.sin(LAT)) / (Math.cos(el) * Math.cos(LAT));
  let A = Math.acos(THREE.MathUtils.clamp(cosA, -1, 1)); // from north, clockwise
  if (H > 0) A = 2 * Math.PI - A;
  // (lighting2 r3) the game's -Z 'north' is Manhattan grid north, which is ~29 deg east of true north: rotate the true
  // azimuth into grid space (sunrise / sunset slant across the grid; 'Manhattanhenge' alignment in late May / July)
  return {
    elevation: (el * 180) / Math.PI,
    azimuth: (A * 180) / Math.PI - 90 - GRID_ROT,
  };
}

// Look parameters (everything the time of day changes besides the sun position).
//  env: diffuse sky fill, envSpec: specular (reflection) env level, envSat: ambient saturation, sun: key-light gain,
//  warm: key-light warmth (0..1), fog: fog density scale, mie: haze aerosols, clouds: coverage, exposure: grade exposure,
//  bounce / groundBounce: street + facade bounce GI (surface.ts), glow: golden aureole around a low sun (sky.ts),
//  fogTint: aerial-perspective in-scatter tint.
// (daynight) keyframes by SUN ELEVATION, blended smoothly (no popping anywhere in the day-night cycle). 'afternoon'
// (el 24) is the tuned gameplay look (lighting2 r2: warm late afternoon), 'noon' is the lighting2 r1 midday look.
const LOOK_KEYS = [
  {
    el: -14,
    env: 1.0,
    envSpec: 1.0,
    envSat: 0.7,
    sun: 1.0,
    warm: 0.0,
    fog: 0.55 /* (lighting2 r3) 0.9: aerial night views drowned in a brown glow haze */,
    mie: 1.2,
    clouds: 0.14 /* (night r4) 0.28: cotton puffs; the refs have a featureless hazy veil */ /* (night) 0.5: dark cloud blobs on the sky; the refs show a smooth hazy night sky */ /* (lighting2 r3) 0.35: night ref has a dark cloud deck lit from below */,
    exposure: 1.0,
    bounce: 0.1,
    groundBounce: 0.0,
    glow: 0.0,
    fogTint: [0.84, 0.9, 1.0],
  },
  {
    el: -4.5,
    env: 1.0,
    envSpec: 1.0,
    envSat: 0.75,
    sun: 1.0,
    warm: 0.3,
    fog: 1.2,
    mie: 1.3,
    clouds: 0.45,
    exposure: 1.45,
    bounce: 0.3,
    groundBounce: 1.2,
    glow: 0.7,
    fogTint: [0.88, 0.85, 0.95],
  },
  {
    el: 3,
    env: 0.72,
    envSpec: 1.0,
    envSat: 0.75,
    sun: 1.15,
    warm: 0.85,
    fog: 1.35,
    mie: 1.4,
    clouds: 0.55,
    exposure: 1.5,
    bounce: 0.5,
    /* (lighting2 r3) env 0.95 -> 0.72, bounce 0.6 -> 0.5: contre-jour, faces away from a low sun fall into cool silhouettes */ groundBounce: 2.2,
    glow: 1.5,
    fogTint: [1.0, 0.86, 0.74],
  },
  {
    el: 10,
    env: 0.8,
    envSpec: 0.95,
    envSat: 0.8,
    sun: 1.3,
    warm: 0.75,
    fog: 1.3,
    mie: 1.05,
    clouds: 0.55,
    exposure: 1.2,
    bounce: 0.62,
    /* (lighting2 r3) env 1.1 -> 0.8, bounce 0.8 -> 0.62 (critic: backlit facades evenly lit beige) */ groundBounce: 2.6,
    glow: 1.45,
    fogTint: [1.0, 0.9, 0.8],
  },
  {
    el: 24,
    env: 1.5,
    envSpec: 0.85,
    envSat: 0.85,
    sun: 1.55,
    warm: 0.48,
    fog: 1.45,
    mie: 0.75,
    clouds: 0.62,
    exposure: 0.74,
    /* (lighting2 r3) day refs: warm 0.62 -> 0.48 (sepia cast), exposure 0.84 -> 0.74 (2-11 % of pixels clipped vs refs < 1 %) */ bounce: 0.95,
    groundBounce: 2.6,
    glow: 1.25,
    fogTint: [0.9, 0.9, 0.96],
  },
  {
    el: 45,
    env: 1.0,
    envSpec: 0.8,
    envSat: 0.6,
    sun: 1.45,
    warm: 0.32,
    fog: 1.0,
    mie: 0.35,
    clouds: 0.8,
    exposure: 0.72,
    bounce: 0.55,
    groundBounce: 2.4,
    glow: 0.3,
    fogTint: [0.72, 0.83, 1.0],
  },
];
export function lookAt(el) {
  const K = LOOK_KEYS;
  if (el <= K[0].el) return { ...K[0], fogTint: [...K[0].fogTint] };
  for (let i = 1; i < K.length; i++)
    if (el < K[i].el) {
      const a = K[i - 1],
        b = K[i],
        x = (el - a.el) / (b.el - a.el),
        t = x * x * (3 - 2 * x),
        o = {};
      for (const k in a)
        o[k] = Array.isArray(a[k])
          ? a[k].map((v, j) => v + (b[k][j] - v) * t)
          : a[k] + (b[k] - a[k]) * t;
      return o;
    }
  const L = K[K.length - 1];
  return { ...L, fogTint: [...L.fogTint] };
}

