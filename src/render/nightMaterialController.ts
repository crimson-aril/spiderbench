// @ts-nocheck
import * as THREE from "three";

export function createNightMaterialController({
  scene,
  state,
  tod,
  screenK,
  lightingShader,
  lerp,
}) {
  const nightBase = new WeakMap();

  function scanNightMaterials() {
    const mats = new Set();
    scene.traverse((o) => {
      const m = o.material;
      if (!m) return;
      for (const mm of Array.isArray(m) ? m : [m]) mats.add(mm);
    });
    const list = [];
    for (const m of mats) {
      let b = nightBase.get(m);
      if (!b) {
        const u = m.userData?.uniforms;
        if (m.userData?.nightGain != null && m.emissive)
          b = {
            kind: "emis",
            ei: m.emissiveIntensity ?? 1,
            gain: m.userData.nightGain,
          };
        // (lighting2 r4) per-material override
        else if (m.userData?.nightLit)
          b = { kind: "emis", ei: m.userData.nightLit, base0: true }; // (lighting2 r3) printed billboards: 0 by day, lamp-lit at night
        else if (u?.uInteriorGain || u?.uShopGain)
          b = {
            kind: "facade",
            gi: u.uInteriorGain?.value ?? 0,
            gs: u.uShopGain?.value ?? 0,
          };
        else if (
          m.emissive &&
          m.emissive.r + m.emissive.g + m.emissive.b > 0.05 &&
          !m.map
        )
          b = { kind: "emis", ei: m.emissiveIntensity ?? 1 };
        // (daynight) LED screens / billboards / lit shop cards (emissive maps): vivid at night, not blown out to white
        else if (
          m.emissive &&
          m.emissiveMap &&
          (m.emissiveIntensity ?? 0) > 0.3
        )
          b = {
            kind: "emis",
            ei: m.emissiveIntensity,
            gain: 0.1,
            screen: true,
          };
        // the night exposure (x4.5) already makes them pop (lighting2 r3: 0.35 -> 0.13, director: TS ads blown to white, must stay readable + saturated)
        else b = { kind: "none" };
        nightBase.set(m, b);
      }
      if (b.kind !== "none") list.push({ m, ...b });
      wrapTranslucency(m);
    }
    state.nightMats = list;
  }
  // Some city materials fake leaf translucency as `totalEmissiveRadiance += diffuseColor.rgb * k` (constant, i.e.
  // it glows at night). Scale that term by the daylight factor (ambData.bounce.w) without touching their code:
  // wrap their onBeforeCompile and give the program a distinct cache key.
  const wrapped = new WeakSet();
  function wrapTranslucency(m) {
    if (wrapped.has(m)) return;
    wrapped.add(m);
    const obc = m.onBeforeCompile;
    if (!obc || obc === THREE.Material.prototype.onBeforeCompile) return;
    let src = "";
    try {
      src = obc.toString();
    } catch (e) {
      return;
    }
    if (!/totalEmissiveRadiance \+= diffuseColor\.rgb \*/.test(src)) return;
    m.onBeforeCompile = function (sh, r) {
      obc.call(this, sh, r);
      sh.fragmentShader = sh.fragmentShader.replace(
        /totalEmissiveRadiance \+= diffuseColor\.rgb \* ([0-9.]+);/g,
        lightingShader.emissiveNightGain,
      );
    };
    const key = m.customProgramCacheKey;
    m.customProgramCacheKey = function () {
      return (key ? key.call(this) : "") + "|dayTrans";
    };
    m.needsUpdate = true;
  }
  function applyNightMaterials() {
    const k = tod.windows;
    if (!state.nightMats) {
      if (k <= 0) return;
      scanNightMaterials();
    }
    for (const e of state.nightMats) {
      if (e.kind === "facade") {
        const u = e.m.userData.uniforms;
        if (u.uInteriorGain) u.uInteriorGain.value = e.gi * lerp(1, 5.0, k);
        if (u.uShopGain) u.uShopGain.value = e.gs * lerp(1, 1.5, k); // (night) 3.0: shop interiors are modelled / lit by real rect lights now (buildings r2)
      } else {
        // (lighting2 r5) screens: per-emissive exposure compensation (director: 'at Dusk LED screens wash to near-white').
        // Their displayed radiance follows the preset exposure: ~day level x (1 .. 0.5 at full night) at EVERY preset
        if (e.screen) e.m.emissiveIntensity = e.ei * screenK.value;
        else
          e.m.emissiveIntensity = e.base0
            ? e.ei * k
            : e.ei * lerp(1, e.gain ?? 3.0, k);
      }
    }
  }

  return { scanNightMaterials, applyNightMaterials };
}