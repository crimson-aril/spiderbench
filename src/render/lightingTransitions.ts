// @ts-nocheck
export function createLightingTransitions({
  tod,
  state,
  applyTod,
  sky,
  scene,
  webGPUBackend,
  resolvePreset,
  lerp,
}) {
  const LOOK_NUM = [
    "vertFill",
    "vertBounce",
    "overcast",
    "env",
    "envSpec",
    "envSat",
    "sun",
    "warm",
    "fog",
    "mie",
    "clouds",
    "exposure",
    "bounce",
    "groundBounce",
    "glow",
    "windows",
    "wet",
    "rain",
    "flare",
    "skyDusk",
    "moonEl",
    "moonAz",
  ];

  // (lighting2 r3) preset switches blend over ~2.5 s (sun direction on the shortest arc + every look value), the env map
  // re-bakes one cube face per frame meanwhile (no hitch); ?tod= / ?shot= / ?playtest= pin a preset (screenshots, pairs)
  const blend = {
    on: false,
    t: 0,
    dur: 2.5,
    from: null,
    to: null,
    envStep: -1,
    envTail: 0,
  };
  let forced = false;
  function snapshot() {
    return {
      elevation: tod.elevation,
      azimuth: tod.azimuth,
      name: tod.name,
      look: { ...tod.look, fogTint: [...tod.look.fogTint] },
    };
  }
  function setPreset(name, { instant = false } = {}) {
  const to = resolvePreset(name);
    if (instant || !tod.look) {
      blend.on = false;
      applyTod(to);
      tod.look = to.look;
      return to.name;
    }
    if (blend.on ? blend.to.name === to.name : tod.name === to.name)
      return to.name;
    blend.from = snapshot();
    blend.to = to;
    blend.t = 0;
    blend.on = true;
    return to.name;
  }
  function setTimeMode(mode = "day") {
    if (forced) return tod.name;
    return setPreset(mode, { instant: (state.upT || 0) < 3 });
  } // saved preset at load: instant
  function stepBlend(dt) {
    blend.t = Math.min(1, blend.t + dt / blend.dur);
    const x = blend.t * blend.t * (3 - 2 * blend.t),
      A = blend.from,
      B = blend.to,
      L = { ...B.look };
    for (const k of LOOK_NUM)
      if (A.look[k] != null && B.look[k] != null)
        L[k] = lerp(A.look[k], B.look[k], x);
    L.fogTint = A.look.fogTint.map((v, j) => lerp(v, B.look.fogTint[j], x));
    const da = ((((B.azimuth - A.azimuth) % 360) + 540) % 360) - 180;
    const el = lerp(A.elevation, B.elevation, x),
      az = A.azimuth + da * x;
    applyTod(
      {
        elevation: el,
        azimuth: az,
        name: x < 1 ? A.name + ">" + B.name : B.name,
        look: L,
      },
      true,
    );
    tod.look = L;
    if (blend.t >= 1) {
      blend.on = false;
      blend.envTail = 1;
    }
    // Legacy renderers refresh the environment a cube face at a time; WebGPU
    // uses the CPU-baked equirectangular texture refreshed below.
    if (!webGPUBackend && blend.envStep < 0) blend.envStep = 0;
  }
  function stepEnv() {
    if (webGPUBackend) {
      blend.envStep = -1;
      return;
    }
    if (blend.envStep < 0) return;
    if (blend.envStep < 6) sky.renderEnvFace(blend.envStep++);
    else {
      state.envTexture = sky.finishEnv();
      scene.environment = state.envTexture;
      blend.envStep = blend.on || blend.envTail-- > 0 ? 0 : -1;
    }
  }

  let initial = "day";
  try {
    const q = new URLSearchParams(location.search);
    const n = q.get("tod");
    if (n != null) initial = n;
    forced = n != null || q.has("shot") || q.has("playtest");
  } catch (e) {
    /* non-browser */
  }
  setPreset(initial, { instant: true });
  return { blend, setPreset, setTimeMode, stepBlend, stepEnv };
}