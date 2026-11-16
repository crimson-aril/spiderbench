// @ts-nocheck
import { lookAt } from "./lightingSolar.ts";
// (lighting2 r3) INSOMNIAC-STYLE FIXED PRESETS (user: "don't make a realistic cycle, follow what Insomniac does"): no clock,
// the player picks one hand-tuned look (Settings > Time of Day). Each preset = a FIXED sun (or moon) direction + look
// overrides on top of the elevation keyframes above. Azimuth: degrees from +X (east) toward +Z (south); game -Z = grid
// north. Extra look keys: windows (nightK for the night city), wet / rain (surface.ts / pipeline rain), flare (sun glare /
// shafts), moonEl / moonAz (night key light + moon disc), skyDusk (sunset band strength).
// History: (street r8 / atmosphere r1-r2 / lighting2 r1-r2) the old single default look evolved into 'day' below.
export const PRESETS = {
  // (lighting2 r3, user) daylight presets: strong key : fill (less sky + bounce fill than r1/r2: shade clearly darker, cool,
  // with texture), crisp shadows. Day: high sun (~65 deg) slightly south-west, most streets / roofs in direct sun.
  day: {
    elevation: 65,
    azimuth: 118,
    look: {
      vertFill: 0.55,
      vertBounce: 0.25,
      warm: 0.22,
      env: 1.0,
      envSpec: 0.9,
      envSat: 0.9,
      sun: 1.75,
      exposure: 0.9,
      clouds: 0.55,
      fog: 0.9,
      mie: 0.35,
      bounce: 0.4,
      groundBounce: 1.25,
      /* measured vs topdown_street_shadows: first pass lit 0.23 / shade 0.004 (ref 0.55 / 0.023) */ glow: 0.15,
      fogTint: [0.74, 0.84, 1.0],
    },
  },
  morning: {
    elevation: 16,
    azimuth: 342,
    look: {
      vertFill: 0.6,
      vertBounce: 0.3,
      warm: 0.22,
      env: 0.58,
      envSat: 0.8,
      sun: 1.65,
      exposure: 1.0,
      clouds: 0.5,
      fog: 1.2,
      mie: 0.9,
      bounce: 0.24,
      groundBounce: 0.8,
      glow: 0.45,
      fogTint: [0.78, 0.86, 1.0],
    },
  },
  sunrise: {
    elevation: 4,
    azimuth: 330,
    look: {
      vertFill: 0.65,
      vertBounce: 0.35,
      warm: 0.8,
      env: 0.5,
      bounce: 0.26,
      groundBounce: 0.9,
      glow: 1.4,
      clouds: 0.5,
      skyDusk: 1.0,
    },
  },
  sunset: {
    elevation: 7,
    azimuth: 160,
    look: {
      vertFill: 0.65,
      vertBounce: 0.35,
      warm: 0.85,
      env: 0.52,
      bounce: 0.3,
      groundBounce: 1.0,
      glow: 1.5,
      clouds: 0.55,
      skyDusk: 1.25,
    },
  },
  dusk: {
    elevation: -4.5,
    azimuth: 172,
    look: {
      vertFill: 0.8,
      vertBounce: 0.5,
      windows: 0.7,
      env: 1.5 /* (lighting2 r5) 0.8: critic 'dusk shade pure black, needs ~5-10 % sky fill' */,
      bounce: 0.2,
      groundBounce: 0.6,
      skyDusk: 1.1,
      fogTint: [0.78, 0.7, 0.72],
    },
  },
  // night: its own config (dark sky, moon key low, the city lit by windows / street + TS light (surface.ts city term))
  night: {
    elevation: -14,
    azimuth: 190,
    look: {
      windows: 1,
      env: 3.0 /* (night) critic r1: street-level facades 12-15 vs ref 24-46, ESB body 15 vs 28 (was 2.0) */ /* (night) 1.0: facade bodies read as dark grey-blue massing (esb ref ~ sRGB 45), not black */ /* (lighting2 r5) 0.7: rooftops read */,
      moonEl: 36,
      moonAz: 15,
      fogTint: [
        0.38, 0.33, 0.32,
      ] /* (lighting2 r5) slightly warm light-pollution haze (was 0.3 grey; 0.52 relit the far-shore band) */ /* the additive skyline glow in the haze in-scatter lit the far shores as a pale band */,
    },
  },
  overcast: {
    elevation: 38,
    azimuth: 125,
    look: {
      vertFill: 0.75,
      vertBounce: 0.5,
      sun: 0.18,
      env: 1.6,
      envSpec: 1.0,
      envSat: 0.4,
      warm: 0.0,
      clouds: 1.0,
      fog: 2.6,
      mie: 1.7,
      fogTint: [0.82, 0.85, 0.88],
      exposure: 0.82,
      bounce: 0.1,
      groundBounce: 0.4,
      glow: 0.0,
      wet: 1,
      rain: 1,
      windows: 0.3,
      flare: 0,
      overcast: 1 /* (lighting2 r4) grey storm deck, darker */,
    },
  },
};
// (user r-daysun) "add 2 different sun orientations for light / shadows during the day preset": same Day look, the sun
// from two more directions (Settings > Day Sun). dayB: late-morning sun from the south-east (shadows fall north-west
// across the streets); dayC: mid-afternoon sun from the west-south-west, lower (longer shadows across the avenues).
PRESETS.dayB = { elevation: 55, azimuth: 58, look: { ...PRESETS.day.look } };
PRESETS.dayC = { elevation: 44, azimuth: 160, look: { ...PRESETS.day.look } };
export const DAY_SUNS = { a: "day", b: "dayB", c: "dayC" };
// old names (settings saves, ?tod=, tools) -> closest preset
const PRESET_ALIAS = {
  default: "day",
  noon: "day",
  afternoon: "day",
  golden: "sunset",
  dawn: "sunrise",
  rain: "overcast",
  cycle: "day",
};
export const TOD_PRESETS = PRESETS;
export const SUN_PRESETS = TOD_PRESETS; // backwards compat

const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function resolvePreset(name) {
  const n = PRESETS[name] ? name : (PRESET_ALIAS[name] ?? "day");
  const d = PRESETS[n],
    base = lookAt(d.elevation);
  const look = {
    windows: smooth(3, -7, d.elevation),
    wet: 0,
    rain: 0,
    overcast: 0,
    vertFill: 1,
    vertBounce: 1,
    flare: 1,
    skyDusk: 1,
    moonEl: 36,
    moonAz: d.azimuth + 180,
    ...base,
    ...d.look,
  };
  look.fogTint = [...(d.look.fogTint ?? base.fogTint)];
  return { elevation: d.elevation, azimuth: d.azimuth, name: n, look };
}
