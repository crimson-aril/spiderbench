// @ts-nocheck
import * as THREE from "three";

export function createLightingTimeController({
  scene,
  sky,
  tod,
  fog,
  fogBase,
  state,
  nightHaze,
  NH,
  sun,
  cascadedShadows,
  cityLights,
  city,
  nodeAmbient,
  nodeAmbientBase,
  nodeHemisphere,
  nodeHemisphereBase,
  sunTransmittance,
  ambShared,
  nightK,
  screenK,
  syncNightMeshes,
  solarPosition,
  lookAt,
  smooth,
  lerp,
  applyNightMaterials,
}) {
  //  apply a time of day
  // (daynight) everything is a continuous function of the sun elevation (keyframes in LOOK_KEYS), so the cycle never pops:
  //  - the sky LUT always follows the real sun (also below the horizon: twilight, then the multiple-scattering floor),
  //    faded to a dim moonlit night sky by skyTint
  //  - the key light (CSM DirectionalLight) is the sun while it is up (faded out by el -3) and the moon afterwards (faded
  //    in from el -3); the switch happens while both are ~0, so shadows fade out and back in instead of jumping
  const _moonDir = new THREE.Vector3(),
    _keyDir = new THREE.Vector3(),
    _moonCol = new THREE.Color();
  const key = {
    moon: false,
    dir: _keyDir,
    color: new THREE.Color(),
    lastDir: new THREE.Vector3(0, 1, 0),
  };
  const moon = { dir: _moonDir, k: 0 };
  function applyTod(
    { elevation, azimuth, hour = null, name = "custom", look = null },
    cycling = false,
  ) {
    tod.name = name;
    tod.hour = hour ?? tod.hour;
    tod.elevation = elevation;
    tod.azimuth = azimuth;
    const el = elevation;
    const night = smooth(-1, -8, el); // 0 day .. 1 full night (exposure, lights)
    tod.night = night;
    const L = look ?? lookAt(el); // (lighting2 r3) preset look (fully merged), or the elevation keyframes
    const p = sky.params;
    const sunK = smooth(-3, 2, el); // sun key light
    const moonK = smooth(-3, -10, el); // moon key light
    const dayF = smooth(-10, 1, el) ** 2; // day sky radiance weight (deep blue twilight once the sun is ~5 deg down)
    p.elevation = Math.max(el, -14);
    p.azimuth = azimuth;
    p.lightScale = sunK * (L.sun ?? 1);
    const w = L.warm;
    p.lightTint = [1 + 0.1 * w, 1 - 0.04 * w, 1 - 0.3 * w];
    // moonlit night sky: the (sun-below-horizon) LUT is only its multiple-scattering floor, scaled to a dim blue
    // (lighting2 r3) director: 'night reads as a dim day, sky too bright purple'. night_aerial / ts_night refs: deep
    // blue-black sky (x0.45, less saturated), the city is lit by its windows / street lights, not by the moon
    const nt = [
      0.066 * moonK + 0.01,
      0.042 * moonK + 0.007,
      0.027 * moonK + 0.005,
    ]; // (night r4) zenith less saturated blue (esb sky 38/43/68 vs ref 37/40/51) // (night) r2 bluer (street ref sky 33/49/64, esb 37/40/51) // (night) esb ref zenith ~ sRGB 29/34/49: grey-blue, not saturated navy (was 0.0075/0.0105/0.022)
    p.skyTint = nt.map(
      (v, i) => lerp(v, 1, dayF) * (L.rain ? [0.95, 0.9, 0.7][i] : 1),
    ); // (lighting2 r3) overcast: greyer (less blue) sky
    const dusk = smooth(10, 1, el) * smooth(-9, -1.5, el) * (L.skyDusk ?? 1); // warm dusk band near the horizon around sunset
    p.skyGlow = [
      0.35 * dusk + NH.glow[0] * night,
      0.16 * dusk + NH.glow[1] * night,
      0.06 * dusk + NH.glow[2] * night,
    ]; // (night) purple-grey light pollution (was sodium orange 0.05/0.028/0.016) // + sodium light pollution (skyline glow near the horizon) (lighting2 r3: warmer, stronger vs the darker zenith)
    sky.skyUniforms.uHzK.value.set(
      lerp(0.56, 0.38, night),
      lerp(0.63, 0.38, night),
      lerp(0.78, 0.5, night),
    ); // (night) no pink horizon band (esb ref horizon ~ sRGB 45/46/63)
    p.night = night;
    p.stars = night * (1 - dayF) * 0.04; // (night) 0.4: the refs show almost no stars over Manhattan // (lighting2 r3) Manhattan light pollution: only the brightest stars
    // (lighting2 r2) golden aureole around a low sun (sky.ts): warm haze toward the sun
    p.sunGlow = [1.05, 0.5, 0.08, (L.glow ?? 1) * smooth(-4, 1, el)];
    // moon: follows the solar arc 12 h later (rises around sunset), clamped high enough for usable shadows
    // (lighting2 r3) presets give the moon a fixed direction (moonEl / moonAz); the moon disc (pipeline) uses the same dir
    const mh =
      L.moonEl != null
        ? { elevation: L.moonEl, azimuth: L.moonAz }
        : solarPosition(((tod.hour ?? 22) + 12) % 24);
    const mel = THREE.MathUtils.degToRad(Math.max(mh.elevation, 14)),
      maz = THREE.MathUtils.degToRad(mh.azimuth);
    _moonDir
      .set(
        Math.cos(mel) * Math.cos(maz),
        Math.sin(mel),
        Math.cos(mel) * Math.sin(maz),
      )
      .normalize();
    moon.k = moonK;
    key.moon = sunK < 1e-3;
    if (key.moon) {
      const T = sunTransmittance(mel, 1.2),
        E =
          p.skyScale *
          0.62 *
          (0.047 * moonK +
            0.0005); /* (night r6) moonlit facades 58 vs target 35-45 */ /* (night) r2: 0.058, street ref asphalt / facades read in cool moonlight */ /* (night) 0.036: the refs' moonlight reads on facades and streets (cool blue fill) */ /* (lighting2 r4) 0.026: critic 'building bodies pure black, massing should read' */ // (lighting2 r3) 0.055 -> 0.026: buildings read as dark silhouettes defined by their windows
      key.color.setRGB(T[0] * E * 0.45, T[1] * E * 0.7, T[2] * E * 1.4); // (night r4) moonlit stone read as overcast day (critic: facades 58-63 vs ref 24-46 bluish): dimmer + bluer // (night) r2 cooler moonlight: blue-lit roofs (rooftop_haze ref 56/66/86)
    }
    p.mie = L.mie;
    p.envSaturation = 0.92;
    p.cloudCoverage = L.clouds;
    p.overcast = L.overcast ?? 0;
    p.cloudDensity = 0.7 * (1 + 1.5 * p.overcast); // (lighting2 r4) heavy low deck
    // (atmosphere r2) L.env is the DIFFUSE sky fill; specular sky reflections (glass, water, wet paint) keep a stronger
    // level (L.envSpec) -- lowering the fill for sun/shade contrast must not turn the rivers and glass towers grey
    const envSpec = L.envSpec ?? L.env; // (lighting2 r1) no max(): the diffuse fill may exceed the specular level (shape.z > 1)
    state.envIntensity = envSpec;
    ambShared.shape.z = L.env / envSpec;
    fog.density = fogBase.density * lerp(L.fog, NH.fog, night); // (night) denser, light-polluted haze: distant towers fade (esb ref)
    nightHaze.k = night; // (night) composite: haze in-scatter colour at night
    fog.startDistance = lerp(35, NH.start, night);
    fog.tint.setRGB(...L.fogTint);
    fog.sunScatter = lerp(0.25, 0.6 + 0.6 * smooth(20, 3, el), sunK);
    fog.shafts = lerp(0.35, 1.0, sunK) * (L.flare ?? 1);
    tod.exposure = L.exposure * lerp(1, 4.5, night);
    tod.bloom = 1 + 1.6 * night; // (daynight) night refs: lamps / screens / headlights bloom and spill
    tod.windows = L.windows ?? smooth(3, -7, el); // city lights come on around sunset (presets: nightK per preset)
    tod.sunK = sunK * (L.flare ?? 1);
    tod.moonK = moonK; // sunK also gates the sun flare / glare (overcast: none)
    tod.rain = L.rain ?? 0;
    ambShared.wx.x = L.wet ?? 0;
    ambShared.wx.z = tod.rain; // (lighting2 r3) overcast rain: wet city (surface.ts), streaks (pipeline)
    nightK.value = tod.windows;
    syncNightMeshes();
    screenK.value = Math.min(
      1.2,
      (0.9 * lerp(1, 0.5, tod.windows)) / Math.max(tod.exposure, 0.3),
    ); // (lighting2 r5)
    applySun({ env: !cycling });
    // ambient grade (diffuse IBL): saturation + slight warm tint; bounce GI from the sunlit street/facades
    const sc = sky.sunColor,
      sy = Math.max(sky.sunDir.y, 0);
    ambShared.grade.set(
      lerp(0.98, 0.72, night),
      lerp(1.0, 0.93, night),
      lerp(1.03, 1.36, night),
      L.envSat,
    ); // (night r7) ~8500 K moon/sky fill: unlit facades read blue (street ref 24/33/46), lamp pools stay warm // (night) moonlit blue-grey fill (street ref), not warm-grey // (atmosphere r2) slightly cool sky fill: shade reads cool against the warm key (was 1.04/1/0.93); the warm street bounce below keeps it from going blue
    const bk = (L.bounce ?? 0.4) * Math.max(sy, 0.3 * Math.min(1, sy * 8)); // (lighting2 r1) 0.17 -> 0.4; low suns keep a floor (golden hour bounce) // sunlit street/facade bounce onto shaded walls (atmosphere r2: 0.12 -> 0.17, shade keeps a readable warm-lifted floor)
    ambShared.bounce.set(
      sc.r * bk * 1.08,
      sc.g * bk,
      sc.b * bk * 0.8,
      lerp(1, 0.04, night),
    );
    // (atmosphere r3) street-level bounce boost (surface.ts): people / cars / shop fronts standing in building shade in
    // the canyons (Times Square) went near-black -- they get the warm light bounced off the sunlit street and facades
    ambShared.shape.w = (L.groundBounce ?? 2.4) * (1 - night);
    ambShared.shape.y = lerp(1, 0.62, night); // (night r5) less sky fill on up-facing roofs / ground: pale roofs read frosted from above (critic r4)
    ambShared.vert.set(
      L.vertFill ?? 1,
      L.vertBounce ?? 1,
      (1 - (L.vertFill ?? 1)) * 0.8,
      cityLights.enabled ? 1 : 0,
    ); // w: (night) local city lights on -> the analytic street glow only lights the far field // z: canyon skylight occlusion (daylight only) // (lighting2 r6) vertical-surface fill (daylight presets < 1)
    // (lighting2 r3) night city light (surface.ts): sodium street-level fill + Times Square screen-colour spill
    const cl = tod.windows;
    ambShared.city.set(
      city.street * cl,
      city.street * 0.72 * cl,
      city.street * 0.45 * cl,
      city.ts * cl,
    ); // (night) LED-mix warm white (was sodium 0.5 / 0.17)
    scene.environmentIntensity = state.envIntensity;
    if (nodeAmbient) nodeAmbient.intensity = lerp(nodeAmbientBase, 0.08, night);
    if (nodeHemisphere) nodeHemisphere.intensity = lerp(nodeHemisphereBase, 0.12, night);
    applyNightMaterials();
  }

  const _sunKeyDir = new THREE.Vector3();
  function applySun({ env = true } = {}) {
    sky.update();
    if (key.moon) {
      _keyDir.copy(_moonDir);
      sun.color.copy(key.color);
    } else {
      // sun key light: direction clamped just above the horizon (shadows stay valid while it fades out)
      const e = THREE.MathUtils.degToRad(Math.max(sky.params.elevation, 2)),
        a = THREE.MathUtils.degToRad(sky.params.azimuth);
      _keyDir
        .set(Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a))
        .normalize();
      sun.color.copy(sky.sunColor);
    }
    // re-fit the shadow cascades only when the key light turned noticeably (setSunDirection re-renders every cascade)
    if (key.lastDir.angleTo(_keyDir) > 0.0012 || env) {
      cascadedShadows.setSunDirection(_keyDir);
      key.lastDir.copy(_keyDir);
    }
    sun.intensity = 1.0;
    // keep the color normalised-ish so other agents that read sun.intensity see something sane
    const m = Math.max(sun.color.r, sun.color.g, sun.color.b, 1e-6);
    sun.color.multiplyScalar(1 / m);
    sun.intensity = m;
    if (env) state.envDirty = true;
  }
  return { applyTod, applySun, moon };
}