// @ts-nocheck
// Dev-server-only playtest controls. Open with ~ (Backquote); the GUI starts hidden.
import GUI from "lil-gui";
import { createReel } from "../../game/systems/reel.ts";
import { lightingDebugSettings } from "../../render/lightingDebugSettings.ts";

function isDevMenuShortcut(event) {
  return (
    event.code === "Backquote" || event.key === "`" || event.key === "~"
  );
}

export function createDevMenu(sys) {
  const { ctx, flow } = sys;
  const player = ctx.player;
  const lighting = ctx.lighting;
  const cityLights = lighting?.cityLights;
  const reel = (sys.reel = createReel(sys));
  const gui = new GUI({ title: "Spiderbench Dev", width: 310 });
  let isOpen = false;
  let refreshTimer = 0;
  gui.hide();
  gui.domElement.style.zIndex = "60";
  gui.domElement.setAttribute("role", "dialog");
  gui.domElement.setAttribute("aria-label", "Developer controls");

  // GUI input must not trigger traversal, attacks, or the game's keyboard controls.
  for (const eventName of [
    "mousedown", "mouseup", "pointerdown", "click", "auxclick", "wheel", "contextmenu",
  ]) {
    gui.domElement.addEventListener(eventName, (event) => event.stopPropagation());
  }
  gui.domElement.addEventListener("keydown", (event) => {
    if (isDevMenuShortcut(event) && !event.repeat) {
      event.preventDefault();
      if (isOpen) close();
      else open();
    } else if (event.code === "Escape" && isOpen) {
      event.preventDefault();
      close(false);
    }
    event.stopPropagation();
  });
  gui.domElement.addEventListener("keyup", (event) => event.stopPropagation());

  const lightingFolder = gui.addFolder("Lighting");
  const renderFolder = gui.addFolder("Rendering");
  const diagnosticsFolder = gui.addFolder("Renderer diagnostics · apply + reload");
  const playtestFolder = gui.addFolder("Playtest");
  renderFolder.close();
  diagnosticsFolder.close();
  playtestFolder.close();

  const presetState = { preset: lighting?.preset ?? "day" };
  let presetController = null;
  if (lighting?.setTimeOfDay) {
    const presets = lighting.presets ?? [
      "day", "morning", "sunrise", "sunset", "dusk", "night", "overcast",
    ];
    presetController = lightingFolder
      .add(presetState, "preset", presets)
      .name("Lighting preset")
      .onChange((value) => lighting.setTimeOfDay(value));
  }

  lightingFolder
    .add(lightingDebugSettings, "nightDistrictFill")
    .name("Night district fill");
  lightingFolder
    .add(lightingDebugSettings, "nightTransitionSoftness", 0.12, 0.9, 0.01)
    .name("Transition softness (WebGPU)");
  lightingFolder
    .add(lightingDebugSettings, "nightShadowFill", 0.08, 0.45, 0.01)
    .name("Dark-area ambient (WebGPU)");

  const lightState = {
    cityLights: !!cityLights?.enabled,
    localShadows: !!cityLights?.shadows,
  };
  const cityLightsController = lightingFolder
    .add(lightState, "cityLights")
    .name("Local city lights")
    .onChange((enabled) => {
      if (cityLights) cityLights.enabled = enabled;
    });
  const localShadowsController = lightingFolder
    .add(lightState, "localShadows")
    .name("Local light shadows")
    .onChange((enabled) => {
      if (cityLights) cityLights.shadows = enabled;
    });

  const renderState = { sceneShadows: !!ctx.renderer.shadowMap?.enabled };
  const sceneShadowsController = renderFolder
    .add(renderState, "sceneShadows")
    .name("Scene shadow maps")
    .onChange((enabled) => {
      if (ctx.renderer.shadowMap) ctx.renderer.shadowMap.enabled = enabled;
    });

  // These renderer and facade probes are read while materials and pipelines are
  // created. Stage their query values here, then reload once when Apply is pressed.
  const initialQuery = new URLSearchParams(location.search);
  const activeBackend = ctx.renderer.backend?.isWebGPUBackend ? "WebGPU" : "WebGL2";
  const requestedAmbientFill = initialQuery.has("tslfill")
    ? Number(initialQuery.get("tslfill"))
    : NaN;
  const diagnosticState = {
    backend: initialQuery.get("backend") === "webgl2" ? "webgl2" : "auto",
    tslDebug: initialQuery.has("tsldebug"),
    renderDebug: initialQuery.has("renderdebug"),
    materialTest: initialQuery.get("tsltest") ?? "",
    lightProbe: initialQuery.get("lprobe") ?? "",
    postMode: initialQuery.get("tslpost") ?? "",
    noSun: initialQuery.has("nosun"),
    noShadows: initialQuery.has("noshadow"),
    noEnvironment: initialQuery.has("tslnoenv"),
    ambientFillEnabled: initialQuery.has("tslfill"),
    ambientFill: Number.isFinite(requestedAmbientFill)
      ? Math.max(0, Math.min(4, requestedAmbientFill))
      : 1,
  };
  diagnosticsFolder.add({ backend: activeBackend }, "backend").name("Current backend").disable();
  diagnosticsFolder
    .add(diagnosticState, "backend", {
      "Automatic (WebGPU, fallback if unavailable)": "auto",
      "Force WebGL2": "webgl2",
    })
    .name("Renderer on next load");
  diagnosticsFolder
    .add(diagnosticState, "tslDebug")
    .name("TSL diagnostic logging");
  diagnosticsFolder
    .add(diagnosticState, "renderDebug")
    .name("Render diagnostic logging");
  diagnosticsFolder
    .add(diagnosticState, "materialTest", {
      "Off": "",
      "Lit material": "lit",
      "Solid material": "solid",
      "World normals": "normal",
      Emissive: "emis",
    })
    .name("Material probe");
  diagnosticsFolder
    .add(diagnosticState, "lightProbe", {
      "Off": "",
      "No renderer lights": "nolights",
      "Ambient light": "ambient",
      "Hemisphere light": "hemi",
      Sun: "sun",
      Albedo: "albedo",
      "Wall texture": "walltex",
      "Wall layer": "walllayer",
      "Wall tint": "walltint",
      "Wall base": "wallbase",
      "Wall weather": "wallweather",
      "Wall grime": "wallgrime",
      "Wall windows": "wallwindows",
      "Wall crown": "wallcrown",
      "Wall fill": "wallfill",
      "Wall fill PBR": "wallfillpbr",
      "Wall reflection": "wallfillreflection",
    })
    .name("Light / facade probe");
  diagnosticsFolder
    .add(diagnosticState, "postMode", {
      "Full post-processing": "",
      "Raw scene pass": "raw",
      "ACES only": "aces",
    })
    .name("Post output");
  diagnosticsFolder.add(diagnosticState, "noSun").name("Disable sun");
  diagnosticsFolder.add(diagnosticState, "noShadows").name("Disable shadows");
  diagnosticsFolder
    .add(diagnosticState, "noEnvironment")
    .name("Disable environment");
  diagnosticsFolder
    .add(diagnosticState, "ambientFillEnabled")
    .name("Override ambient fill");
  diagnosticsFolder
    .add(diagnosticState, "ambientFill", 0, 4, 0.05)
    .name("Ambient fill value");

  const setQueryFlag = (query, key, enabled) => {
    if (enabled) query.set(key, "1");
    else query.delete(key);
  };
  const setQueryOption = (query, key, value) => {
    if (value) query.set(key, value);
    else query.delete(key);
  };
  const diagnosticActions = {
    apply: () => {
      const url = new URL(location.href);
      const query = url.searchParams;
      if (diagnosticState.backend === "webgl2") query.set("backend", "webgl2");
      else query.delete("backend");
      setQueryFlag(query, "tsldebug", diagnosticState.tslDebug);
      setQueryFlag(query, "renderdebug", diagnosticState.renderDebug);
      setQueryOption(query, "tsltest", diagnosticState.materialTest);
      setQueryOption(query, "lprobe", diagnosticState.lightProbe);
      setQueryOption(query, "tslpost", diagnosticState.postMode);
      setQueryFlag(query, "nosun", diagnosticState.noSun);
      setQueryFlag(query, "noshadow", diagnosticState.noShadows);
      setQueryFlag(query, "tslnoenv", diagnosticState.noEnvironment);
      setQueryFlag(query, "tslfill", diagnosticState.ambientFillEnabled);
      if (diagnosticState.ambientFillEnabled) {
        query.set("tslfill", String(diagnosticState.ambientFill));
      }
      location.assign(url.href);
    },
    clear: () => {
      const url = new URL(location.href);
      for (const key of [
        "tsldebug", "renderdebug", "tsltest", "lprobe", "tslpost", "nosun",
        "noshadow", "tslnoenv", "tslfill",
      ]) {
        url.searchParams.delete(key);
      }
      location.assign(url.href);
    },
  };
  diagnosticsFolder
    .add(diagnosticActions, "apply")
    .name("Apply diagnostics (reload)");
  diagnosticsFolder
    .add(diagnosticActions, "clear")
    .name("Clear diagnostic flags");

  let note = "";
  const robbery = () => {
    const crime = sys.crimes.active;
    return crime && crime.dev && crime.type === "bankAlarm" ? crime : null;
  };
  const horizontalDistance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const robberyStatus = () => {
    const crime = robbery();
    if (!crime) return note || "Off: spawns a bank robbery 30-60 m away";
    const distance = Math.round(horizontalDistance(player.position, crime.pos));
    if (crime.claimed) {
      return crime.cmbTotal
        ? "Fighting - " + crime.cmbLeft + " of " + crime.cmbTotal + " left"
        : "Fighting";
    }
    if (crime.state === "engaged") return "Starting the fight...";
    return "Bank robbery - " + distance + " m away";
  };
  const playState = { robbery: !!robbery() };
  const robberyController = playtestFolder
    .add(playState, "robbery")
    .name("Robbery fight nearby")
    .onChange((enabled) => {
      try {
        if (enabled) {
          if (sys.crimes.active) sys.crimes.cancel();
          const forward = player.cam?.forwardFlat?.();
          const crime = sys.crimes.spawn("bankAlarm", {
            near: true,
            fwd: forward,
            dev: true,
          });
          note = crime ? "" : "No street nearby: move closer to an avenue";
        } else if (robbery()) {
          sys.crimes.cancel();
          note = "Removed";
        }
      } catch (error) {
        console.error("[dev] robbery control", error);
        note = "Error: see console";
      }
    });

  const smoothLookKey = "spiderbench.dev.smoothLook";
  const look = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(smoothLookKey) || "{}");
      return { on: saved.on ?? false, amount: saved.amount ?? saved.v ?? 50 };
    } catch {
      return { on: false, amount: 50 };
    }
  })();
  const applyLook = () => {
    if (player.cam) {
      player.cam.lookSmooth = look.on ? 0.03 + 0.42 * (look.amount / 100) ** 1.6 : 0;
    }
    try {
      localStorage.setItem(smoothLookKey, JSON.stringify(look));
    } catch {}
  };
  applyLook();
  const lookState = { enabled: look.on, amount: look.amount };
  playtestFolder
    .add(lookState, "enabled")
    .name("Smooth mouse camera")
    .onChange((enabled) => {
      look.on = enabled;
      applyLook();
    });
  playtestFolder
    .add(lookState, "amount", 0, 100, 1)
    .name("Camera smoothing")
    .onChange((amount) => {
      look.amount = amount;
      applyLook();
    });

  const reelState = { active: !!reel.active };
  const reelController = playtestFolder
    .add(reelState, "active")
    .name("Cinematic demo reel")
    .onChange((active) => {
      if (active) {
        close(false);
        reel.start();
      } else {
        reel.stop();
      }
    });

  const endNote = (message) => (crime) => {
    if (crime?.dev) note = message;
  };
  sys.events.on("crime:resolved", endNote("Cleared"));
  sys.events.on("crime:failed", endNote("Failed"));
  sys.events.on("crime:expired", endNote("Expired"));

  function refresh() {
    if (lighting && presetController) {
      const preset = lighting.preset ?? "day";
      if (presetState.preset !== preset) {
        presetState.preset = preset;
        presetController.updateDisplay();
      }
    }
    if (cityLights) {
      lightState.cityLights = !!cityLights.enabled;
      lightState.localShadows = !!cityLights.shadows;
      cityLightsController.updateDisplay();
      localShadowsController.updateDisplay();
    }
    if (ctx.renderer.shadowMap) {
      renderState.sceneShadows = !!ctx.renderer.shadowMap.enabled;
      sceneShadowsController.updateDisplay();
    }
    playState.robbery = !!robbery();
    robberyController.updateDisplay();
    robberyController.name("Robbery fight nearby - " + robberyStatus());
    reelState.active = !!reel.active;
    reelController.updateDisplay();
    reelController.name(
      "Cinematic demo reel - " + (reel.active ? reel.status() : "Off"),
    );
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    flow.overlay = true;
    try {
      document.exitPointerLock?.();
    } catch {}
    if (robbery()) note = "";
    refresh();
    gui.show();
    refreshTimer = window.setInterval(refresh, 250);
  }

  function close(relock = true) {
    if (!isOpen) return;
    isOpen = false;
    window.clearInterval(refreshTimer);
    gui.hide();
    flow.overlay = false;
    if (relock && !document.pointerLockElement) {
      try {
        ctx.renderer.domElement.requestPointerLock?.()?.catch?.(() => {});
      } catch {}
    }
  }

  flow.onKey((event, mode) => {
    if (isDevMenuShortcut(event) && !event.repeat && mode === "play") {
      if (isOpen) close();
      else open();
      return true;
    }
    if (isOpen && event.code === "Escape") {
      close(false);
      return true;
    }
    return false;
  });
  document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement && isOpen) close(false);
  });
  sys.events.on("flow:mode", ({ mode }) => {
    if (mode !== "play") close(false);
  });

  const api = {
    open,
    close,
    toggle: () => (isOpen ? close() : open()),
    gui,
    get isOpen() {
      return isOpen;
    },
  };
  window.__dev = api;
  return api;
}
