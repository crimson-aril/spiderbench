# Spiderbench — a browser web-swinging game written by Claude

**warning: this is a experimental branch that support both webgl2 and webgpu but problem is webgpu colour management, it is different than webgl, so webgpu output colour is weird*

A non-commercial fan project and benchmark. It shows the kind of code and assets that **Claude** (Anthropic's AI model, working through Claude Code) can produce for a real-time 3D game running in the browser.

The code, shaders, procedural city, Blender-built models and generated textures were produced by Claude under the direction of a human, who steered the work through feedback and reference images.

## Quick link (local build)

### For a low resolution webgl2 build

```bash
127.0.0.1:4173/spiderbench/spiderbench?q=low&backend=webgl2
```

### For a medium resolution webgl2 build

```bash
127.0.0.1:4173/spiderbench/spiderbench?q=medium&backend=webgl2
```

### For a High resolution webgl2 build

**caution* Ensure you have decent GPU

```bash
127.0.0.1:4173/spiderbench/spiderbench?q=medium&backend=webgl2
```

---

### For debug-ing webgpu build

**for general debug*

```bash
http://127.0.0.1:4173/spiderbench/spiderbench?q=low&tsldebug=1
```

**for lighting debug*

```bash
http://127.0.0.1:4173/spiderbench/spiderbench?q=low&tsldebug=1&q=low&tsltest=lit
```

## What's in it

- **Traversal:** third-person web-swinging, wall-running, perching, zipping and diving, driven by a custom physics and animation state machine.
- **City:** a procedural Manhattan-style island with an authored street network, including Broadway, Greenwich Village and the Financial District. It has thousands of buildings, rooftops, parks, Times Square, bridges, traffic and pedestrians.
- **Rendering:** WebGPU with a TSL node-based pipeline when supported, with the established `WebGLRenderer` GLSL pipeline as the WebGL2 fallback. Quality presets scale resolution, shadows, population, and screen-space effects for different GPUs.
- **Assets:** character, vehicle and pedestrian models and animation clips built by Blender Python scripts, plus AI-generated textures and ad art. Advertised brands are invented, apart from in-universe Marvel names such as the Daily Bugle and Oscorp.

## Navigating the source

- `src/main.ts` starts the renderer, city, player, and game systems.
- `src/player/` contains character loading, animation, camera control, and traversal.
- `src/world/` builds the city, traffic, pedestrians, landmarks, and world materials.
- `src/game/combat/` contains combat behavior and visual effects; `src/game/systems/` contains missions, progression, events, and saving.
- `src/render/` contains lighting, shadows, post-processing, quality settings, and shader warm-up.
- `src/ui/` contains the HUD and menus. Shader files are grouped by stage under the feature that uses them.

## Run it

Requires Node.js 20.19+ or 22.12+ and a browser with WebGPU or WebGL2 support. Low, medium, and high graphics presets are available; use `?q=low`, `?q=med`, or `?q=high` to start with a specific preset. WebGPU is selected automatically when it initializes successfully; otherwise the game starts with the legacy WebGL2 pipeline. Use `?backend=webgl2` to force that WebGL2 path.

WebGPU exposes adapter capabilities and limited identifying information, but not a standard VRAM budget through [GPU adapter info](https://developer.mozilla.org/en-US/docs/Web/API/GPUAdapterInfo), so choose **Low** manually on 2 GB or integrated GPUs. Low uses a 55% preset render-scale multiplier, drops the largest mip from eligible compressed KTX2 textures before GPU upload, caps city texture anisotropy at 2x, uses one 512 px shadow map, smaller crowd instance buffers, no pedestrian shadows, reduced population, and disables AO, SSR, SSGI, shafts, and wet effects. The WebGPU TSL path caps nearby local lighting at four lights on Low, eight on Medium, and sixteen on High; these local lights do not cast shadows. Medium and High retain larger scene budgets and detailed effects for stronger GPUs.

```bash
npm install
npm run dev      # then open http://127.0.0.1:5173
npm run build    # production build in dist/
```

Controls are listed in-game (press **H**). On the dev server, **~** opens a developer menu (on a build, add `?dev` to the URL).

## Disclaimer

This is an unofficial fan project, made only as a technical demonstration. It is not affiliated with, endorsed by or sponsored by Marvel, Disney, Sony or Insomniac Games. Spider-Man and related names, characters and likenesses are trademarks and copyrighted material of their respective owners, and no rights to them are claimed. **This project is not for sale and may not be redistributed or used commercially.** See [LICENSE](LICENSE).

Bundled fonts are under the SIL Open Font License; see `public/ui/fonts/`.
