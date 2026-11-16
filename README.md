# Spiderbench

Spiderbench is a browser-based Spider-Man-inspired traversal game and rendering benchmark. Swing, run across walls, perch, zip through a procedural Manhattan-style city, and compare its WebGPU and WebGL2 renderers.

## Credits

The main game was built by **Shikhar**: [GitHub](https://github.com/xikhar) · [X](https://x.com/xikhar).

## About this fork

This fork adds a WebGPU renderer using Three.js TSL and continues development of the WebGL2 renderer. Most changes are written and checked manually against Three.js, TSL, and WebGL documentation. Codex and GitHub Copilot have also been used for code maintenance and inline suggestions.

The project is tuned around a modest laptop. I have also modified textures and models, and used Blender's Decimate modifier to reduce mesh complexity.

## Try the published game

The game selects WebGPU when the browser supports it and falls back to WebGL2 if WebGPU cannot initialize. Add `backend=webgl2` to force the WebGL2 renderer. The quality setting can be `low`, `med` (also accepted as `medium`), or `high`. Without a `q` setting, the game chooses a starting preset from the available device information: [open the default automatic-quality build](https://crimson-aril.github.io/spiderbench/).

| Preset | Automatic backend | Force WebGL2 |
| --- | --- | --- |
| High | [Play](https://crimson-aril.github.io/spiderbench/?q=high) | [Play](https://crimson-aril.github.io/spiderbench/?q=high&backend=webgl2) |
| Medium | [Play](https://crimson-aril.github.io/spiderbench/?q=med) | [Play](https://crimson-aril.github.io/spiderbench/?q=med&backend=webgl2) |
| Low | [Play](https://crimson-aril.github.io/spiderbench/?q=low) | [Play](https://crimson-aril.github.io/spiderbench/?q=low&backend=webgl2) |

Low reduces render scale, city population, shadow-map size, and post-processing to help integrated and lower-memory GPUs. WebGPU does not expose a standard VRAM budget, so choose Low manually on a 2 GB or integrated GPU. Medium and High retain more effects and detail.

## Run locally

Requires Node.js 20.19+ or 22.12+ and a browser with WebGPU or WebGL2 support.

```bash
npm install       # Install project dependencies.
npm run dev       # Start Vite at http://127.0.0.1:5173/spiderbench/.
npm run typecheck # Check TypeScript types without creating a build.
npm run build     # Type-check and create the production build in dist/.
npm run preview   # Serve the built site at http://127.0.0.1:4173/spiderbench/.
```

Controls are listed in-game; press **H** to view them. On the local development or preview server, press **~** to open the lil-gui developer panel. Its **Renderer diagnostics** folder lets you choose light, material, facade, and post-processing probes, switch the renderer, then apply the selection with one reload. The panel starts hidden and is unavailable on the published site.

## Local renderer and lighting diagnostics

These links use the Vite development server. Start it with `npm run dev` first. The three renderer links compare the low, medium, and high presets on WebGL2; `renderdebug=1` adds diagnostic logging.

| Local URL | What it shows |
| --- | --- |
| [Low, WebGL2 + render diagnostics](http://127.0.0.1:5173/spiderbench/?q=low&backend=webgl2&renderdebug=1) | Low preset on the legacy WebGL2 renderer, with scene and render-pipeline diagnostics. |
| [Medium, WebGL2 + render diagnostics](http://127.0.0.1:5173/spiderbench/?q=med&backend=webgl2&renderdebug=1) | Medium preset on WebGL2, with the same diagnostics. |
| [High, WebGL2 + render diagnostics](http://127.0.0.1:5173/spiderbench/?q=high&backend=webgl2&renderdebug=1) | High preset on WebGL2, with the same diagnostics. Use a capable GPU. |
| [Low, WebGPU + TSL diagnostics](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1) | Low preset on the automatic backend, with TSL and render diagnostics. If WebGPU initializes, this uses WebGPU. |

The TSL-specific options below apply only when the WebGPU renderer is active. `tsldebug=1` enables TSL/render diagnostic logging. You can combine options by appending them with `&`.

### Material probes

`tsltest` replaces scene materials with a simple diagnostic material so the renderer's material, geometry, and light paths can be isolated.

| Local URL | What it shows |
| --- | --- |
| [Lit](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&tsltest=lit) | A plain lit TSL Standard material; checks whether renderer lights reach scene materials. |
| [Solid](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&tsltest=solid) | A simple solid material; checks scene geometry and output independently of lighting. |
| [Normals](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&tsltest=normal) | World-space normals rendered as color. |
| [Emissive](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&tsltest=emis) | Constant emissive output; checks whether an unlit signal reaches the screen. |

### Light probes and lighting switches

`lprobe` isolates a light source or removes scene lighting. These probes disable shadows so the selected light is easier to inspect.

| Local URL | What it shows |
| --- | --- |
| [No lights](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=nolights) | The probe material with renderer lights disabled. |
| [Ambient](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=ambient) | Ambient light only. |
| [Hemisphere](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=hemi) | Hemisphere light only. |
| [Sun](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=sun) | The directional sun light only. |
| [Albedo](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=albedo) | Authored material colors without renderer lighting. |
| [Disable sun](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&nosun=1) | Hides the WebGPU sun light and its visible sky disc. |
| [Disable shadows](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&noshadow=1) | Disables renderer shadow maps and light shadow casting. |
| [Disable environment](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&tslnoenv=1) | Disables the scene environment contribution and uses the diagnostic diffuse fill. |
| [Ambient fill 4](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&tslfill=4) | Sets the WebGPU diffuse fallback fill to its upper diagnostic value. |
| [Ambient fill 0](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&tslfill=0) | Turns the WebGPU diffuse fallback fill off. |

### Facade and window probes

`lprobe` can display individual parts of the WebGPU building-facade material. The raw links bypass the usual grading and optional post effects, making the probe output easier to compare. `wallfillreflection` is the supported spelling for the glass reflection probe.

| Probe | Probe view | Raw scene output | What it shows |
| --- | --- | --- | --- |
| Wall texture | [Open](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=walltex) | [Raw](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=walltex&tslpost=raw) | Facade texture atlas sampling. |
| Wall layer | [Open](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=walllayer) | [Raw](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=walllayer&tslpost=raw) | Per-building facade layer selection. |
| Wall tint | [Open](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=walltint) | [Raw](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=walltint&tslpost=raw) | Vertex tint applied to the facade. |
| Wall base | [Open](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallbase) | [Raw](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallbase&tslpost=raw) | Texture, mortar, tint, and atlas AO before weathering. |
| Wall weather | [Open](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallweather) | [Raw](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallweather&tslpost=raw) | Weathering applied to the facade base. |
| Wall grime | [Open](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallgrime) | [Raw](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallgrime&tslpost=raw) | The facade grime contribution. |
| Wall windows | [Open](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallwindows) | [Raw](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallwindows&tslpost=raw) | Window glass, frame, and curtain colors. |
| Wall crown | [Open](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallcrown) | [Raw](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallcrown&tslpost=raw) | Crown and upper-facade color contribution. |
| Wall fill | [Open](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallfill) | [Raw](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallfill&tslpost=raw) | Isolated WebGPU diffuse fallback fill on facades. |
| Wall fill PBR | [Open](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallfillpbr) | [Raw](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallfillpbr&tslpost=raw) | Diffuse fill with the PBR facade response retained. |
| Wall reflection | [Open](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallfillreflection) | [Raw](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&lprobe=wallfillreflection&tslpost=raw) | Facade glass reflection contribution. |

### Post-processing views

| Local URL | What it shows |
| --- | --- |
| [Raw scene pass](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&tslpost=raw) | Presents scene-pass color before the normal grading and optional post effects. |
| [ACES only](http://127.0.0.1:5173/spiderbench/?q=low&tsldebug=1&tslpost=aces) | Uses ACES tone mapping while bypassing the usual grading and optional post effects. |

You can combine a facade or light probe with a post view. For example, add `&tslpost=raw` to any probe URL to inspect its raw scene-pass result.

## What's in the game

- **Traversal:** third-person web-swinging, wall-running, perching, zipping, and diving, driven by a custom physics and animation state machine.
- **City:** a procedural Manhattan-style island with an authored street network, including Broadway, Greenwich Village, and the Financial District; rooftops, parks, Times Square, bridges, traffic, and pedestrians.
- **Rendering:** WebGPU with a TSL node-based pipeline when supported, and the established WebGL2 GLSL pipeline as the fallback. Quality presets adjust render scale, shadows, population, and screen-space effects.
- **Assets:** character, vehicle, and pedestrian models and animation clips built with Blender Python scripts, plus generated textures and ad art. Advertised brands are invented apart from in-universe Marvel names such as the Daily Bugle and Oscorp.

## Source map

- `src/main.ts` starts the renderer, city, player, and game systems.
- `src/player/` contains character loading, animation, camera control, and traversal.
- `src/world/` builds the city, traffic, pedestrians, landmarks, and world materials.
- `src/game/combat/` contains combat behavior and visual effects; `src/game/systems/` contains missions, progression, events, and saving.
- `src/render/` contains lighting, shadows, post-processing, quality settings, and shader warm-up.
- `src/ui/` contains the HUD and menus. Shader files are grouped by stage under the feature that uses them.

## Disclaimer

This is an unofficial fan project made only as a technical demonstration. It is not affiliated with, endorsed by, or sponsored by Marvel, Disney, Sony, or Insomniac Games. Spider-Man and related names, characters, and likenesses are trademarks and copyrighted material of their respective owners, and no rights to them are claimed. **This project is not for sale and may not be redistributed or used commercially.** See [LICENSE](LICENSE).

Bundled fonts are under the SIL Open Font License; see `public/ui/fonts/`.
