// @ts-nocheck
// City prop assembly and placement orchestration.
// Local prop frame: +x along the curb, +z toward the roadway, y=0 at the sidewalk surface.
import * as THREE from "three";
import {
  G,
  avenues,
  streets,
  inPark,
  mulberry32,
  streetsAt,
  avActive,
  district,
  SHORE_Z,
  SHORE_W,
  SHORE_E,
  VMAP,
  MAPS,
  islands,
  inCurbCut,
  stHalf,
} from "./layout.ts"; // (layout2 r9) stHalf // (layout2 r5) inCurbCut // (layout2 r3) VMAP: Village street furniture
import { buildRoads, streetDir, mapPhase } from "./npc/roads.ts"; // (citylife junctions r2) mapPhase
import { registry } from "./npc/registry.ts";
import { linearColorFromHex } from "./meshBuilder.ts";
import { createPartMaterial } from "./partMaterials.ts";
import { Pool } from "./pool.ts";
import { nightK, nightOnly } from "../render/daynight.ts"; // (daynight)
import { cityLights } from "../render/citylights.ts"; // (night) real street-lamp lighting
import { getQuality } from "../render/quality.ts";
import { COAST } from "./waterfront.ts"; // (coast r1) waterfront lamps / benches / trees
import {
  GC_KEEP_OUT,
  PARK_VIADUCT,
  GC_TREE_SPOTS,
  GC_FORECOURTS,
} from "./grandcentral.ts";
import {
  buildRoadPatches,
  buildStreetGrime,
  plazaStrips,
  buildPlazaPaving,
  MANHOLES,
} from "./streetdressing.ts";
import { tsNoProp } from "./timesSquare.ts";

import {
  BAG_BOXES,
  bench,
  busStopSign,
  hotdogCart,
  hydrant,
  linkKiosk,
  mailbox,
  newsstand,
  planter,
  trashBags,
  trashCan,
} from "./propParts/streetFurniture.ts";
import { lamppost, trafficMast, trafficPost } from "./propParts/streetLighting.ts";
import { pickSpecies, treePit, treePitPlanted } from "./propParts/treePlantings.ts";
import {
  rolloffModel,
  shedJunk,
  shedSign,
  shedTop,
} from "./propParts/constructionProps.ts";
import {
  bikeRack,
  bladeSign,
  busShelter,
  doormanCanopy,
  meter,
  newsboxes,
} from "./propParts/streetFixtures.ts";
import { createSteam, steamStack } from "./propParts/steamEffects.ts";
import { adAtlas, autoLod, loadPropModels } from "./propParts/propAssets.ts";
import { placeRooftops } from "./propParts/rooftopPlacement.ts";
import { billboardFaces, bladeFaces, bladeSignCol } from "./propParts/signFaces.ts";
import { subwayPitMaterial } from "./propParts/subwayPitMaterial.ts";
export { bladeSignCol } from "./propParts/signFaces.ts";
// timessq r5: no sidewalk sheds / dumpsters inside Times Square

// ------------------------------------------------------------------ placement
export const PLAZA_CROWD_SPOTS = []; // (street r7) forecourt-plaza people -> npc/crowd.ts statics
export async function buildProps({
  scene,
  blocks,
  parkPaths,
  T,
  solids = null,
  buildings = null,
}) {
  const rnd = mulberry32(4242);
  const rndT = mulberry32(5150); // (street r2) street-tree species / size stream (keeps the placement stream stable)
  const glb = await loadPropModels();
  // (street r4) critic: 'saturated red lane line down the left looks garish' = the orange plastic jersey-barrier runs.
  // Repaint them as weathered precast concrete (NYC's usual lane-closure barrier): orange -> grey, stripes stay pale.
  if (glb.barrier?.attributes.color) {
    const c = glb.barrier.attributes.color;
    for (let i = 0; i < c.count; i++) {
      const l = 0.2126 * c.getX(i) + 0.7152 * c.getY(i) + 0.0722 * c.getZ(i),
        k = l > 0.5 ? 0.62 : 0.34 + l * 0.2;
      c.setXYZ(i, k * 1.02, k, k * 0.93);
    }
    c.needsUpdate = true;
  }
  // (street r6) critic: 'traffic drums / cones garishly saturated'. Fade the safety orange to sun-bleached, grimy
  // orange and the white bands to dirty off-white (still readable as traffic control, no longer a neon accent).
  for (const g of [glb.drum, glb.cone]) {
    const c = g?.attributes.color;
    if (!c) continue;
    for (let i = 0; i < c.count; i++) {
      const r = c.getX(i),
        gg = c.getY(i),
        bb = c.getZ(i);
      if (r > 0.5 && gg < 0.35)
        c.setXYZ(i, r * 0.52, gg * 0.62 + 0.012, bb * 0.9 + 0.01); // orange (linear)
      else if (r > 0.6 && gg > 0.6) c.setXYZ(i, r * 0.62, gg * 0.6, bb * 0.55); // white band
    }
    c.needsUpdate = true;
  }
  // (street r6) critic: 'blue dumpster has floating debris sticks on top, placeholder geometry'. Rebuild the roll-off
  // container in JS: weathered rust-red / faded-green steel with side ribs, a top rail, and a mounded rubble heap
  // (drywall slabs, lumber, bagged debris, a pallet) that rises out of the box instead of loose sticks hovering on a lid.
  if (glb.rolloff) glb.rolloff = rolloffModel();
  // (street r6) critic: 'identical tree pits' -> planted pit variant (ground cover + a different guard)
  glb.pitPlanted = treePitPlanted();
  const mat = createPartMaterial({
    name: "props",
    instanceTint: true,
    instanceState: true,
  });
  const P = {};
  const mk = (name, geo, opts) => {
    if (!geo) return null;
    P[name] = new Pool(geo, mat, {
      name,
      extra: { aTint: 3, aState: 1 },
      ...opts,
    });
    scene.add(P[name].mesh);
    return P[name];
  };
  mk("lamp", lamppost(), { max: 1200, far: 460 });
  {
    // (daynight) warm light pool on the sidewalk / road under every street lamp at night: one additive decal pool that
    // shares the lamp items (drawn only while nightK > 0: no draw call by day)
    const cv = document.createElement("canvas");
    cv.width = cv.height = 64;
    const g2 = cv.getContext("2d"),
      gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.25, "rgba(255,255,255,0.62)");
    gr.addColorStop(0.6, "rgba(255,255,255,0.16)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g2.fillStyle = gr;
    g2.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.MeshBasicMaterial({
      map: tex,
      color: new THREE.Color(1.0, 0.62, 0.3).multiplyScalar(
        0.09,
      ) /* (lighting2 r4) 0.2: critic 'pools blown out' */,
      transparent: true,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor, // additive rgb, scene alpha (SSR weight) untouched
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
      fog: false,
    });
    const pg = new THREE.CircleGeometry(
      3.8,
      20,
    ) /* (lighting2 r4) 5.2: smaller pools */
      .rotateX(-Math.PI / 2)
      .translate(0, 0.06, 2.4);
    P.lampPool = new Pool(pg, pm, {
      name: "lampPool",
      max: 1200,
      far: 320,
      castShadow: false,
      receiveShadow: false,
    });
    P.lampPool.items = P.lamp.items;
    P.lampPool.mesh.renderOrder = 2;
    P.lampPool.mesh.onBeforeRender = () => {
      pm.opacity = cityLights.enabled ? 0 : nightK.value;
    }; // (night) replaced by real lamp light (cityLights.ts)
    scene.add(nightOnly(P.lampPool.mesh));
    // (night) every street lamp is a real light (cityLights.ts): a warm down-facing spot from the cobra head (local
    // 0, 8.8, 2.9) lighting the sidewalk / road / cars / people, with a lit-haze cone. Registered once the items exist
    // (re-registered if the item list changes).
    let lampN = -1,
      lampIds = [];
    cityLights.addProvider(() => {
      const items = P.lamp.items;
      if (items.length === lampN) return;
      for (const id of lampIds) cityLights.remove(id);
      lampIds = [];
      lampN = items.length;
      for (const it of items) {
        const s = it.s ?? 1,
          sn = Math.sin(it.ry || 0),
          cs = Math.cos(it.ry || 0);
        // NYC mix: most heads are 4000 K LED retrofits (near-white), some old high-pressure sodium (amber)
        // (night r2) lead / user 'realistic': whiter LEDs, modest pools (~130 at 8.75 m: the asphalt under a head reads
        // clearly lit, not white), fewer sodium heads; radius 0.9 = the head's lens size: leaves / awnings right next to
        // the head take a soft near field instead of a blown 1/d^2 hot spot. Sodium heads glow amber (aState 1: partmat).
        // (night r3) critic: 'pools clip to white, ref lamps are warm-white': -40 % peak (~1.0 under the head), a soft
        // penumbra (the pool fades out smoothly), ~3700 K warm white + 30 % high-pressure sodium (~2100 K)
        const h =
            Math.abs(Math.sin(it.x * 12.9898 + it.z * 78.233) * 43758.5453) % 1,
          sodium = h < 0.3;
        // (night r5) critic: 'Times Square roads stage-lit' -> the screens light that district; its lamps at half power
        const tsK =
          it.x > -112 && it.x < 112 && it.z > -352 && it.z < 22 ? 0.5 : 1;
        if (it.extra) it.extra.aState = sodium ? 1 : 0;
        lampIds.push(
          cityLights.add({
            type: "spot",
            pos: [
              it.x + 2.9 * s * sn,
              (it.y || 0) + 8.75 * s,
              it.z + 2.9 * s * cs,
            ],
            dir: [0, -1, 0],
            angle: 1.3,
            penumbra: 0.8,
            color: sodium ? 0xffa452 : 0xffdab4,
            intensity: (sodium ? 65 : 70) * tsK, // (night r6) r5 cut to 54 / 58 darkened every street / plaza 20-30 % (critic); -15 % from r4's 76 / 82
            range: 17,
            radius: 0.9,
            /* (night r10) 26: with consistent cell lists (no per-cell cull) the 15-26 m tails of every lamp added up (street level 2x, critic r9) */ volume: 0.4,
          }),
        ); // (night r4) wider batwing-like spread (full to ~15 deg, fading to 75 deg): lights the road between heads
      }
    });
  }
  mk("mast", trafficMast(), { max: 500, far: 560 });
  mk("post", trafficPost(), { max: 300, far: 320 });
  mk("hydrant", hydrant(), { max: 1100, far: 300, castShadow: false });
  mk("trash", trashCan(), { max: 1400, far: 320 });
  mk("bench", bench(), { max: 1500, far: 260 }); // (street r8) 500 -> 1500: CPW wall bench runs
  mk("news", newsstand(), { max: 200, far: 380 });
  mk("cart", hotdogCart(), { max: 160, far: 360 });
  mk("planter", planter(), { max: 700, far: 260 });
  mk("mailbox", mailbox(), { max: 250, far: 240, castShadow: false });
  mk("kiosk", linkKiosk(), { max: 250, far: 300 });
  mk("busstop", busStopSign(), { max: 150, far: 180, castShadow: false });
  mk("pit", treePit(), { max: 2200, far: 330, castShadow: false });
  mk("pit2", glb.pitPlanted, { max: 1600, far: 260, castShadow: false }); // (street r6)
  mk("shedtop", shedTop(), { max: 1100, far: 420, castShadow: false }); // (street r6) shed deck overlay
  mk("shedjunk", shedJunk(), { max: 400, far: 200 });
  mk("shedsign", shedSign(), { max: 700, far: 260, castShadow: false }); // (street r12)
  mk("meter", meter(), { max: 900, far: 200, castShadow: false });
  mk("newsbox", newsboxes(), { max: 500, far: 280, castShadow: false });
  mk("shelter", busShelter(), { max: 120, far: 260 });
  mk("bikerack", bikeRack(), { max: 300, far: 200, castShadow: false });
  mk("stack", steamStack(), { max: 80, far: 420 });
  mk("doorman", doormanCanopy(), { max: 400, far: 300 }); // (street r5)
  mk("blade", bladeSign(), { max: 1400, far: 300, castShadow: false }); // (street r7)
  mk("bags", trashBags(), { max: 900, far: 240 }); // (street r9) curbside trash-bag piles
  // Blender models
  mk("subway", glb.subway, { max: 60, far: 240 });
  if (glb.subwaypit) {
    P.subwaypit = new Pool(glb.subwaypit, subwayPitMaterial(), {
      name: "subwaypit",
      max: 60,
      far: 160,
      castShadow: false,
      extra: { aTint: 3, aState: 1 },
    });
    scene.add(P.subwaypit.mesh);
  }
  mk("dock", glb.dock, { max: 500, far: 140, castShadow: false });
  mk("bike", glb.bike, { max: 500, far: 150 });
  mk("bikekiosk", glb.bikekiosk, { max: 80, far: 180 });
  mk("shed", glb.shed, { max: 1100, far: 420 });
  mk("barrier", glb.barrier, { max: 500, far: 220 });
  mk("cone", glb.cone, {
    max: 1800 /* (street r10) steam work zones */,
    far: 220,
    castShadow: false,
  });
  mk("drum", glb.drum, { max: 700, far: 180 });
  mk("dumpster", glb.dumpster, { max: 300, far: 300 });
  mk("rolloff", glb.rolloff, { max: 80, far: 300 });
  mk("payphone", glb.payphone, { max: 200, far: 220, castShadow: false });
  mk("signpole", glb.signpole, { max: 1100, far: 220, castShadow: false });
  // rooftop clutter: full models near (dithered fade into the far LOD, caps sized so the ring never saturates), then a
  // static whole-map instanced box LOD (every item, no cap, no distance ring; drawn to the fog)
  mk("hvac", glb.hvac, { max: 3000, far: 110, smallCasters: true });
  mk("dish", glb.dish, { max: 1500, far: 110, smallCasters: true });
  mk("antenna", glb.antenna, { max: 900, far: 220, smallCasters: true });
  mk("vents", glb.vents, { max: 3000, far: 90, smallCasters: true });
  mk("garden", glb.garden, { max: 400, far: 180, smallCasters: true });
  mk("fence", glb.fence, { max: 900, far: 300 });
  mk("billboard", glb.billboard, { max: 120, far: 1200 });

  const SIG = 0xd9a514;
  const tintOf = (c) => ({ aTint: linearColorFromHex(c), aState: 0 });
  const WHITE = 0xffffff;
  const signals = [];
  const treeSpots = [];
  const anchors = [];
  // street-level keep-outs (Grand Central + its terrace, MetLife legs): nothing stands there (signals are exempt)
  const keepOut = (x, z) =>
    GC_KEEP_OUT.some((r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1);
  const place = (pool, x, z, ry, tint = 0x3b3e40, extra = {}, y = G.CURB_H) => {
    if (!pool) return null;
    if (y < 1 && pool !== P.mast && pool !== P.post && keepOut(x, z))
      return null;
    if (y < 1) {
      const q = streetsAt(x, z);
      if (q.diag || q.round || q.cut) return null;
      if (pool !== P.mast && pool !== P.post && inCurbCut(x, z)) return null;
    } // (layout2 r5) curb cuts // (layout2 r3) + kerb-return asphalt // (layout2) nothing stands on Broadway / angled-street asphalt (+ r3: Columbus Circle)
    return pool.add(x, y, z, ry, 1, null, { ...tintOf(tint), ...extra });
  };
  // ---- collision (C4: solids mirror the rendered props; axis-aligned for ry multiples of 90 deg)
  const S = solids;
  const toW = (it, lx, lz) => {
    const c = Math.cos(it.ry),
      s = Math.sin(it.ry);
    return [it.x + lx * c + lz * s, it.z - lx * s + lz * c];
  };
  const sBox = (
    it,
    lx0,
    ly0,
    lz0,
    lx1,
    ly1,
    lz1,
    kind = "equipment",
    flags = 0,
  ) => {
    if (!S || !it) return;
    const a = toW(it, lx0, lz0),
      b = toW(it, lx1, lz1);
    S.box(
      Math.min(a[0], b[0]),
      it.y + ly0,
      Math.min(a[1], b[1]),
      Math.max(a[0], b[0]),
      it.y + ly1,
      Math.max(a[1], b[1]),
      kind,
      flags,
    );
  };
  const streetAds = []; // (billboards r2) bus-shelter + sidewalk-shed ad faces -> billboardFaces (same instanced draw)
  // (billboards r4) newsstand ads: back-lit portrait posters on both ends + a landscape poster across the back (same draw)
  const newsAds = (it) => {
    if (!it) return;
    for (const [lx, fr] of [
      [1.312, Math.PI / 2],
      [-1.312, -Math.PI / 2],
    ])
      streetAds.push({
        x: it.x,
        y: it.y,
        z: it.z,
        ry: it.ry,
        lx,
        ly: 1.2,
        lz: 0,
        fr,
        w: 1.3,
        h: 1.75,
        port: true,
        gain: 0.35,
      });
    streetAds.push({
      x: it.x,
      y: it.y,
      z: it.z,
      ry: it.ry,
      lx: 0,
      ly: 1.45,
      lz: -0.812,
      fr: Math.PI,
      w: 2.4,
      h: 1.25,
      gain: 0.25,
    });
  };
  const sCyl = (it, lx, lz, y0, y1, r, kind = "pole") => {
    if (!S || !it) return;
    const [x, z] = toW(it, lx, lz);
    S.cyl(x, z, it.y + y0, it.y + y1, r, r, kind);
  };
  // zip/perch anchors: pos = exact top of the RENDERED part (world), normal = its surface normal (tops: +Y)
  const anchor = (it, lx, ly, lz, kind, nrm = null) => {
    if (!it) return;
    const [x, z] = toW(it, lx, lz);
    const n = nrm
      ? new THREE.Vector3(
          nrm[0] * Math.cos(it.ry) + nrm[2] * Math.sin(it.ry),
          nrm[1],
          -nrm[0] * Math.sin(it.ry) + nrm[2] * Math.cos(it.ry),
        ).normalize()
      : new THREE.Vector3(0, 1, 0);
    anchors.push({ pos: new THREE.Vector3(x, it.y + ly, z), normal: n, kind });
  };

  // fire-escape / awning footprints (collision solids from buildings.ts) -> tree canopies keep clear of them
  const FE = new Map(),
    FEC = 16;
  if (S) {
    const kFE = 10; // collision.KIND 'fireescape'
    for (let i = 0; i < S.t.length; i++) {
      if (S.k[i] !== kFE) continue;
      const j = i * 6;
      if (S.b[j + 4] < 2.5) continue;
      for (
        let gx = Math.floor(S.b[j] / FEC);
        gx <= Math.floor(S.b[j + 3] / FEC);
        gx++
      )
        for (
          let gz = Math.floor(S.b[j + 2] / FEC);
          gz <= Math.floor(S.b[j + 5] / FEC);
          gz++
        ) {
          const key = gx * 100003 + gz;
          let a = FE.get(key);
          if (!a) FE.set(key, (a = []));
          a.push(j);
        }
    }
  }
  // horizontal clearance (m) from (x, z) to the nearest fire escape between 2.5 and 13 m up (canopy height band)
  const feClear = (x, z, R = 7) => {
    let best = R;
    for (
      let gx = Math.floor((x - R) / FEC);
      gx <= Math.floor((x + R) / FEC);
      gx++
    )
      for (
        let gz = Math.floor((z - R) / FEC);
        gz <= Math.floor((z + R) / FEC);
        gz++
      ) {
        for (const j of FE.get(gx * 100003 + gz) || []) {
          if (S.b[j + 1] > 13) continue;
          const dx = Math.max(S.b[j] - x, 0, x - S.b[j + 3]),
            dz = Math.max(S.b[j + 2] - z, 0, z - S.b[j + 5]);
          best = Math.min(best, Math.hypot(dx, dz));
        }
      }
    return best;
  };
  // (street r7) ground-mass footprint grid (a blade sign needs a building face right at the lot line) and the awning /
  // fire-escape solids in the 2.5-6.5 m band (signs keep clear of them)
  const GMC = 24,
    GM = new Map(),
    AW = new Map();
  const gAdd = (M, x0, z0, x1, z1, v) => {
    for (let gx = Math.floor(x0 / GMC); gx <= Math.floor(x1 / GMC); gx++)
      for (let gz = Math.floor(z0 / GMC); gz <= Math.floor(z1 / GMC); gz++) {
        const k = gx * 100003 + gz;
        let l = M.get(k);
        if (!l) M.set(k, (l = []));
        l.push(v);
      }
  };
  if (buildings)
    for (const bd of buildings)
      for (const m of bd.masses || [])
        if (m.y0 < 0.2 && bd.type !== "glass")
          gAdd(GM, m.x0, m.z0, m.x1, m.z1, m);
  if (S)
    for (let i = 0; i < S.t.length; i++) {
      if (S.k[i] !== 9 && S.k[i] !== 10) continue;
      const j = i * 6;
      if (S.b[j + 1] > 6.5 || S.b[j + 4] < 2.5) continue;
      gAdd(AW, S.b[j], S.b[j + 2], S.b[j + 3], S.b[j + 5], j);
    }
  const inGM = (x, z) =>
    (GM.get(Math.floor(x / GMC) * 100003 + Math.floor(z / GMC)) || []).some(
      (m) => x > m.x0 && x < m.x1 && z > m.z0 && z < m.z1,
    );
  const awHit = (x0, z0, x1, z1) =>
    (
      AW.get(
        Math.floor((x0 + x1) / 2 / GMC) * 100003 +
          Math.floor((z0 + z1) / 2 / GMC),
      ) || []
    ).some(
      (j) =>
        x1 > S.b[j] - 0.3 &&
        x0 < S.b[j + 3] + 0.3 &&
        z1 > S.b[j + 2] - 0.3 &&
        z0 < S.b[j + 5] + 0.3,
    );
  const rndB = mulberry32(7707); // own stream: the placement stream above stays unchanged
  const BLADE = [
    0x6e1f1c, 0x1d2b45, 0x243a2a, 0x161718, 0x8a6a2c, 0x2b4a4a, 0x5a3a2a,
    0x3b2b45, 0x9a8f78,
  ];
  for (const b of blocks) {
    const dens = b.core ? 1 : 0.6;
    const edges = [
      { a: [b.x0, b.z0], b: [b.x0, b.z1], n: [-1, 0], kind: "av" },
      {
        a: [b.x1, b.z1],
        b: [b.x1, b.z0],
        n: [1, 0],
        kind: b.x1 >= G.DRIVE_X0 - 1 ? "drive" : "av",
      },
      { a: [b.x1, b.z0], b: [b.x0, b.z0], n: [0, -1], kind: "st" },
      { a: [b.x0, b.z1], b: [b.x1, b.z1], n: [0, 1], kind: "st" },
    ];
    for (const e of edges) {
      const dx = e.b[0] - e.a[0],
        dz = e.b[1] - e.a[1];
      const L = Math.hypot(dx, dz);
      const tx = dx / L,
        tz = dz / L;
      const ry = Math.atan2(e.n[0], e.n[1]);
      const walkW = e.kind === "st" ? G.ST_WALK : G.AV_WALK;
      const at = (s, off) => [
        e.a[0] + tx * s - e.n[0] * off,
        e.a[1] + tz * s - e.n[1] * off,
      ];
      const av = e.kind !== "st";
      const used = []; // occupied [s0, s1] stretches of this frontage (building zone)
      const free = (s0, s1) => !used.some(([a, c]) => s1 > a && s0 < c);
      // lamps (+ zip anchor on the lamp head, collision pole)
      // sidewalk shed plan first (lamps/trees keep out of its span)
      let shedPlan = null;
      if (P.shed && rnd() < (b.core ? 0.3 : 0.14) && L > 40) {
        const n = 5 + Math.floor(rnd() * 8),
          s0 = 12 + rnd() * (L - 24 - n * 2.4);
        if (
          s0 > 8 &&
          !keepOut(...at(s0, 1)) &&
          !keepOut(...at(s0 + n * 2.4, 1)) &&
          !tsNoProp(...at(s0, 1))
        )
          shedPlan = { n, s0, a: s0 - 3, b: s0 + n * 2.4 + 3 };
      }
      const inShed = (s) => shedPlan && s > shedPlan.a && s < shedPlan.b;
      const lampS = []; // (street r5) lamp stations (doorman canopies keep clear)
      const lsp = e.kind === "st" ? 30 : 24; // (street r4) denser lamp rhythm (critic: 'no lampposts at rhythm')
      for (let s = 7 + rnd() * 4; s < L - 5; s += lsp) {
        if (inShed(s)) continue;
        const [x, z] = at(s, 0.55);
        const it = place(P.lamp, x, z, ry, 0x4a4e50);
        sCyl(it, 0, 0, 0, 8.3, 0.15);
        anchor(it, 0, 9.15, 2.9, "lampTop");
        if (it) lampS.push(s);
      }
      // street trees
      // (street agent r1) avenues lined with trees like the refs (04 / 11 / 16): most avenue frontages get a row
      const treeP =
        (e.kind === "st" ? 0.8 : e.kind === "drive" ? 0.92 : 0.99) *
        (b.core ? 1 : 0.88); // (street r10) director: 'lots of street trees' // (street r4) 'add regular tree pits along both sidewalks'
      const treeS = [];
      const spc = pickSpecies(rndT); // (street r2) one species per frontage (planted together), size varies per tree
      if (rnd() < treeP) {
        const sp = (e.kind === "st" ? 6.5 : 5.6) + rnd() * 2.5; // (street r10) avenues: a tree every ~6.5-8 m
        // (street r8) critic: 'identical lollipops in a perfect row' -> irregular spacing, more gaps, and ~25% replacement
        // trees of another species / age among the frontage's planting (rndT stream: the rnd placement stream is unchanged)
        for (
          let s = 8 + rnd() * 3;
          s < L - 7;
          s += sp * (0.72 + rndT() * 0.6)
        ) {
          if (rnd() < 0.07 || rndT() < (av ? 0.02 : 0.07) || inShed(s))
            continue; // (street r10) fewer gaps on avenues
          const [x, z] = at(s, 1.3);
          const clear = feClear(x, z);
          if (clear < 2.6) continue; // a canopy this close would grow through the fire escape
          if (
            !place(rndT() < 0.45 && P.pit2 ? P.pit2 : P.pit, x, z, ry, 0x333333)
          )
            continue; // (street r6) mixed pits
          treeS.push(s);
          // (street r4) critic: 'stacked copies of the same crown shape' -> per-tree crown proportions (narrow/tall .. wide/flat)
          const wq = clear < 5 ? 0.82 + rndT() * 0.18 : 0.85 + rndT() * 0.3,
            hq = 0.85 + rndT() * 0.35;
          const sp2 = rndT() < 0.25 ? pickSpecies(rndT) : spc,
            young = rndT() < (sp2 === spc ? 0.12 : 0.4);
          treeSpots.push({
            x,
            z,
            kind: "street",
            clear,
            pal: sp2.pal,
            sc:
              sp2.sc *
              (av
                ? 1.15
                : 1) /* (street r10) fuller avenue canopies overhanging the walk */ *
              (young ? 0.55 + rndT() * 0.12 : 0.8 + rndT() * 0.45),
            s3: [wq, hq, wq * (0.9 + rndT() * 0.2)],
          });
        }
      }
      {
        const [x, z] = at(4 + rnd() * 5, 0.45);
        place(
          P.hydrant,
          x,
          z,
          ry + rnd(),
          rnd() < 0.6 ? 0xb8b6ae : rnd() < 0.5 ? 0x9a1b16 : 0xd8a41a,
        );
      }
      for (const s of [2.4, L - 2.4])
        if (rnd() < 0.7) {
          const [x, z] = at(s, 1.0);
          place(P.trash, x, z, rnd() * 6);
        }
      // (street r2) denser corners: second hydrant on long frontages, trash cans at the far corner, newspaper boxes
      if (L > 60 && rndT() < 0.8) {
        const s = L - 5 - rndT() * 6;
        if (!inShed(s)) {
          const [x, z] = at(s, 0.45);
          place(
            P.hydrant,
            x,
            z,
            ry + rndT(),
            rndT() < 0.6 ? 0xb8b6ae : 0x9a1b16,
          );
        }
      }
      if (rndT() < 0.6) {
        const s = L - 3.6;
        const [x, z] = at(s, 1.05);
        if (!tsNoProp(x, z)) place(P.newsbox, x, z, ry + Math.PI);
      }
      {
        // (street r9, own stream) curbside trash-bag piles between the tree pits (critic: 'streets too clean, no trash bags')
        const rB = mulberry32(
          ((Math.floor(e.a[0] * 13.1) * 73856093) ^
            (Math.floor(e.a[1] * 7.7) * 19349663) ^
            0xba95) >>>
            0,
        );
        const nB = Math.floor((L / 34) * (b.core ? 1 : 0.5) + rB());
        for (let k = 0; k < nB; k++) {
          const s = 6 + rB() * (L - 12);
          if (
            inShed(s) ||
            treeS.some((t) => Math.abs(t - s) < 1.9) ||
            lampS.some((t) => Math.abs(t - s) < 1.3)
          )
            continue;
          const [x, z] = at(s, 0.75);
          if (tsNoProp(x, z)) continue;
          const it = place(P.bags, x, z, ry + Math.PI / 2, 0x3b3e40);
          if (it)
            for (const q of BAG_BOXES)
              sBox(it, q[0], q[1], q[2], q[3], q[4], q[5], "equipment");
        }
      }
      if (e.kind === "st" && rnd() < 0.5 * dens + 0.2)
        for (let s = 12; s < L - 12; s += 18 + rnd() * 10) {
          if (treeS.some((t) => Math.abs(t - s) < 1.2)) continue;
          const [x, z] = at(s, 0.4);
          place(P.meter, x, z, ry);
        }
      // corner sign poles (parking regulations) near both ends
      for (const s of [6.5, L - 6.5])
        if (rnd() < 0.6) {
          const [x, z] = at(s, 0.35);
          place(P.signpole, x, z, ry, WHITE);
        }

      // ---- sidewalk shed (scaffolding) over a stretch of the frontage
      if (shedPlan) {
        const { n, s0 } = shedPlan;
        {
          for (let i = 0; i <= n; i++) {
            const s = s0 + i * 2.4;
            const [x, z] = at(s, 0.6); // curb posts 0.6 m from the curb, bay scaled to reach the building face
            if (streetsAt(x, z).diag || streetsAt(...at(s, walkW - 0.3)).diag)
              continue; // (layout2) Broadway mouth
            P.shed.add(x, G.CURB_H, z, ry, 1, null, tintOf(WHITE), [
              1,
              1,
              walkW - 0.6,
            ]);
            {
              // (street r6) weathered plywood deck + occasional stored material on it
              const [tx, tz] = [x, z];
              P.shedtop?.add(
                tx,
                G.CURB_H,
                tz,
                ry,
                1,
                null,
                tintOf(
                  [0xffffff, 0xe4e0d8, 0xcac4b8, 0xf0e8dc][
                    Math.floor(rndT() * 4)
                  ],
                ),
                [1, 1, walkW - 0.6],
              );
              if (i % 3 === 0 && !(i === 0 && n < 3) && rndT() < 0.8)
                streetAds.push({
                  x,
                  y: G.CURB_H,
                  z,
                  ry,
                  lx: 0,
                  ly: 3.42,
                  lz: 0.1 * (walkW - 0.6) + 0.012,
                  fr: 0,
                  w: 2.25,
                  h: 0.6,
                  gain: 0.04,
                }); // (billboards r2) wheat-paste posters on the shed parapet
              if (P.shedsign && i < n && (i % 3 === 1 || (i === 0 && n < 3))) {
                // (street r12) permit boards on the parapet
                const [sx, sz] = at(s + 1.2, 0.6);
                P.shedsign.add(
                  sx,
                  G.CURB_H,
                  sz,
                  ry,
                  1,
                  null,
                  tintOf(
                    [0xffffff, 0xffffff, 0xe8d27a, 0xb9cde0, 0xd9d4c8][
                      Math.floor(rndT() * 5)
                    ],
                  ),
                );
              }
              if (P.shedjunk && rndT() < 0.3) {
                const [jx, jz] = at(s, 0.6 + (walkW - 0.6) * 0.5);
                const it = P.shedjunk.add(
                  jx,
                  G.CURB_H,
                  jz,
                  ry + (rndT() < 0.5 ? Math.PI : 0),
                  1,
                  null,
                  tintOf(WHITE),
                );
                if (it)
                  sBox(it, -1.05, 3.0, -0.45, 1.05, 3.16, 0.25, "equipment");
              }
            }
            // deck (standable, overhang), posts
            if (S) {
              const a = at(s - 1.2, walkW),
                c = at(s + 1.2, 0.55);
              S.box(
                Math.min(a[0], c[0]),
                G.CURB_H + 2.72,
                Math.min(a[1], c[1]),
                Math.max(a[0], c[0]),
                G.CURB_H + 3.0,
                Math.max(a[1], c[1]),
                "awning",
                1,
              );
              const p = at(s - 1.2, 0.6);
              S.cyl(p[0], p[1], G.CURB_H, G.CURB_H + 2.72, 0.06, 0.06, "pole");
            }
          }
          used.push([s0 - 1.5, s0 + n * 2.4 + 1.5]);
          // construction: roll-off container in the parking lane beside the shed
          if (P.rolloff && e.kind !== "drive" && rnd() < 0.55) {
            const s = s0 + n * 1.2,
              lane = e.kind === "st" ? 1.15 : 1.9;
            const [x, z] = at(s, -lane);
            const it = P.rolloff.add(x, 0, z, ry, 1, null, tintOf(WHITE));
            sBox(it, -3.05, 0, -1.2, 3.05, 1.55, 1.2, "equipment");
            const c0 = at(s - 4, -lane - 1.4),
              c1 = at(s + 4, 0);
            registry.curbBlocks.push({
              x0: Math.min(c0[0], c1[0]),
              z0: Math.min(c0[1], c1[1]),
              x1: Math.max(c0[0], c1[0]),
              z1: Math.max(c0[1], c1[1]),
            });
            for (const ds of [-4.2, 4.2]) {
              const [cx, cz] = at(s + ds, -lane + 0.3);
              place(P.cone, cx, cz, rnd() * 6, WHITE, {}, 0);
            }
          }
        }
      }
      // ---- lane closure: jersey barriers + drums + cones in the parking lane (avenues)
      if (
        av &&
        e.kind !== "drive" &&
        P.barrier &&
        rnd() < (b.core ? 0.06 : 0.03)
      ) {
        // (street r6: rarer; critic 'median is a plain grey slab')
        const len = 14 + rnd() * 18,
          s0 = 15 + rnd() * Math.max(1, L - 30 - len);
        const lane = 1.9;
        for (let s = s0; s < s0 + len; s += 1.85) {
          const [x, z] = at(s, -lane - 0.3);
          const it = place(P.barrier, x, z, ry, WHITE, {}, 0);
          sBox(it, -0.9, 0, -0.3, 0.9, 0.8, 0.3, "equipment");
        }
        for (let k = 0; k < 4; k++) {
          const [x, z] = at(s0 - 2 - k * 2.4, -lane + 0.9 - k * 0.3);
          place(P.cone, x, z, rnd() * 6, WHITE, {}, 0);
        }
        for (let k = 0; k < 3; k++) {
          const [x, z] = at(s0 + len + 1.5 + k * 3, -lane + 0.2);
          const it = place(P.drum, x, z, rnd() * 6, WHITE, {}, 0);
          sCyl(it, 0, 0, 0, 1.0, 0.3, "equipment");
        }
        const c0 = at(s0 - 12, -lane - 1.6),
          c1 = at(s0 + len + 10, 0);
        registry.curbBlocks.push({
          x0: Math.min(c0[0], c1[0]),
          z0: Math.min(c0[1], c1[1]),
          x1: Math.max(c0[0], c1[0]),
          z1: Math.max(c0[1], c1[1]),
        });
      }
      // ---- subway entrance near a corner of an avenue frontage
      if (
        av &&
        e.kind !== "drive" &&
        P.subway &&
        rnd() < (b.core ? 0.35 : 0.15)
      ) {
        const s = rnd() < 0.5 ? 14 + rnd() * 6 : L - 20 + rnd() * 6;
        if (!treeS.some((t) => Math.abs(t - s) < 4.5)) {
          const [x, z] = at(s, 1.3);
          const it = place(
            P.subway,
            x,
            z,
            ry + (rnd() < 0.5 ? 0 : Math.PI),
            WHITE,
          );
          if (!it) continue;
          if (P.subwaypit)
            P.subwaypit.add(it.x, it.y, it.z, it.ry, 1, null, tintOf(WHITE));
          // railings (thin boxes) + globe posts
          sBox(it, -2.3, 0, -0.9, 2.3, 1.08, -0.82, "pole");
          sBox(it, -2.3, 0, 0.82, 2.3, 1.08, 0.9, "pole");
          sBox(it, 2.26, 0, -0.9, 2.34, 1.08, 0.9, "pole");
          sCyl(it, -2.3, -0.85, 0, 2.2, 0.08);
          sCyl(it, -2.3, 0.85, 0, 2.2, 0.08);
          anchor(it, -2.3, 2.2, -0.85, "pole");
          anchor(it, -2.3, 2.2, 0.85, "pole");
          used.push([s - 3, s + 3]);
          treeS.push(s - 2.5, s, s + 2.5);
        }
      }
      // ---- bike-share station in the curb zone
      if (P.dock && rnd() < (b.core ? 0.22 : 0.1) && L > 50) {
        const n = 6 + Math.floor(rnd() * 8),
          s0 = 18 + rnd() * (L - 36 - n * 0.85);
        if (
          s0 > 10 &&
          !treeS.some((t) => t > s0 - 3 && t < s0 + n * 0.85 + 3)
        ) {
          const [kx, kz] = at(s0 - 1.2, 1.0);
          place(P.bikekiosk, kx, kz, ry, WHITE);
          for (let i = 0; i < n; i++) {
            const s = s0 + i * 0.85;
            const [x, z] = at(s, 1.0);
            place(P.dock, x, z, ry, WHITE);
            if (rnd() < 0.7) place(P.bike, x, z, ry, WHITE);
          }
          treeS.push(
            ...Array.from({ length: n + 2 }, (_, i) => s0 - 1.2 + i * 0.85),
          );
        }
      }
      // ---- (street r5) doorman canopies over residential / hotel lobby doors (avenues mostly, some side streets)
      if (P.doorman && e.kind !== "drive" && L > 40) {
        const nC = av
          ? b.core
            ? rnd() < 0.55
              ? 1
              : 0
            : rnd() < 0.8
              ? 1 + (rnd() < 0.45 ? 1 : 0)
              : 0
          : rnd() < 0.18
            ? 1
            : 0;
        const CAN = [
          0x1f3a2c, 0x1b2640, 0x4a1a1e, 0x151617, 0x2c3a3a, 0x3a2a1e,
        ];
        for (let k = 0, tries = 0; k < nC && tries < 12; tries++) {
          const s = 15 + rnd() * (L - 30); // search for a gap between the tree pits / lamps
          if (
            inShed(s) ||
            !free(s - 2, s + 2) ||
            treeS.some((t) => Math.abs(t - s) < 2.4) ||
            lampS.some((t) => Math.abs(t - s) < 1.8)
          )
            continue;
          k++;
          const [x, z] = at(s, 0.75);
          if (keepOut(x, z) || keepOut(...at(s, walkW - 0.2))) continue;
          if (streetsAt(x, z).diag || streetsAt(...at(s, walkW - 0.2)).diag)
            continue; // (layout2)
          const len = walkW - 0.75,
            it = P.doorman.add(
              x,
              G.CURB_H,
              z,
              ry,
              1,
              null,
              tintOf(CAN[Math.floor(rnd() * CAN.length)]),
              [1, 1, len / 4.25],
            );
          sBox(it, -1.25, 2.84, -len, 1.25, 3.46, 0.12, "awning", 1);
          sCyl(it, -1.15, 0, 0, 3.2, 0.05);
          sCyl(it, 1.15, 0, 0, 3.2, 0.05);
          used.push([s - 1.6, s + 1.6]);
          treeS.push(s - 1.3, s + 1.3);
        }
      }
      // ---- (street r7) projecting blade signs over the shopfronts (retail frontage), both avenues and side streets
      if (P.blade && e.kind !== "drive") {
        const nB = Math.round(
          (av ? (b.core ? 3.5 : 1.6) : b.core ? 1.6 : 0.6) *
            (L / 80) *
            (0.6 + rndB() * 0.8),
        );
        for (let k = 0, tries = 0; k < nB && tries < nB * 4 + 4; tries++) {
          const sB = 6 + rndB() * (L - 12);
          const [fx, fz] = at(sB, walkW),
            [ix, iz] = at(sB, walkW + 0.5),
            [ox, oz] = at(sB, walkW - 0.35);
          if (
            inShed(sB) ||
            !inGM(ix, iz) ||
            inGM(ox, oz) ||
            keepOut(fx, fz) ||
            tsNoProp(fx, fz)
          )
            continue;
          const [px, pz] = at(sB, walkW - 1.25);
          if (
            awHit(
              Math.min(fx, px) - 0.1,
              Math.min(fz, pz) - 0.1,
              Math.max(fx, px) + 0.1,
              Math.max(fz, pz) + 0.1,
            )
          )
            continue;
          if (treeS.some((t) => Math.abs(t - sB) < 1.6 && walkW < 4)) continue;
          k++;
          const it = P.blade.add(
            fx,
            G.CURB_H,
            fz,
            ry,
            1,
            null,
            tintOf(BLADE[Math.floor(rndB() * BLADE.length)]),
          );
          sBox(it, -0.07, 3.35, 0.25, 0.07, 5.25, 1.15, "equipment");
          sBox(it, -0.12, 5.05, 0, 0.12, 5.53, 0.06, "equipment");
          sBox(it, -0.025, 5.25, 0.02, 0.025, 5.42, 1.2, "pole");
        }
      }
      // ---- street furniture slots
      let shelter = av && rnd() < 0.55 * dens ? L * (0.25 + rnd() * 0.5) : -1;
      for (let s = 8 + rnd() * 4; s < L - 8; s += (6 + rnd() * 5) / dens) {
        // (street r4) denser furniture
        if (shelter > 0 && s > shelter) {
          if (
            !treeS.some((t) => Math.abs(t - (s + 2.5)) < 3) &&
            !inShed(s + 2.5)
          ) {
            const [x, z] = at(s + 2.5, 1.35);
            const it = place(P.shelter, x, z, ry);
            sBox(it, -2.2, 2.45, -0.9, 2.2, 2.6, 1.0, "awning", 1);
            s += 6;
            if (it)
              for (const [lx, fr] of [
                [2.168, Math.PI / 2],
                [2.032, -Math.PI / 2],
              ]) // (billboards r2) backlit ad panel, both faces
                streetAds.push({
                  x: it.x,
                  y: it.y,
                  z: it.z,
                  ry: it.ry,
                  lx,
                  ly: 1.225,
                  lz: -0.1,
                  fr,
                  w: 1.1,
                  h: 1.85,
                  port: true,
                  gain: 0.55,
                });
          }
          shelter = -1;
          continue;
        }
        const r = rnd();
        const pitNear = treeS.some((t) => Math.abs(t - s) < 2.4);
        const bldFree = free(s - 1.5, s + 1.5);
        if (inShed(s) && r >= 0.5) continue;
        if (pitNear && (r < 0.28 || (r >= 0.5 && r < 0.84))) continue; // curb-zone pick would sit in a tree pit
        if (r < 0.14) {
          const [x, z] = at(s, 0.95);
          place(P.trash, x, z, rnd() * 6);
        } else if (r < 0.28) {
          const [x, z] = at(s, 1.05);
          const a = ry + Math.PI + (rnd() - 0.5) * 0.1;
          if (!tsNoProp(x, z)) place(P.newsbox, x, z, a);
        } else if (r < 0.42 && bldFree) {
          const n = 2 + Math.floor(rnd() * 2);
          for (let i = 0; i < n && s + i * 2.2 < L - 6; i++) {
            const [x, z] = at(s + i * 2.2, walkW - 0.55);
            const it = tsNoProp(x, z) ? null : place(P.planter, x, z, ry);
            sBox(it, -0.6, 0, -0.45, 0.6, 0.62, 0.45, "equipment");
          }
        } else if (r < 0.5 && bldFree) {
          const [x, z] = at(s, walkW - 0.45);
          place(P.bench, x, z, ry);
        } else if (r < 0.56 && av) {
          const [x, z] = at(s, 1.0);
          place(P.cart, x, z, ry + Math.PI / 2 + (rnd() - 0.5) * 0.3);
        } else if (r < 0.6 && av && bldFree) {
          const [x, z] = at(s, walkW - 1.0);
          const it = place(P.news, x, z, ry);
          sBox(it, -1.3, 0, -0.8, 1.3, 2.3, 0.8, "equipment");
          newsAds(it);
          s += 3;
        } else if (r < 0.66) {
          const [x, z] = at(s, 0.75);
          place(P.bikerack, x, z, ry);
          if (P.bike && rnd() < 0.5) {
            const [bx, bz] = at(s + (rnd() - 0.5) * 1.6, 1.05);
            place(
              P.bike,
              bx,
              bz,
              ry + Math.PI / 2,
              0x3a3a3a + Math.floor(rnd() * 3) * 0x202020,
            );
          }
        } else if (r < 0.7 && av) {
          const [x, z] = at(s, 0.8);
          place(P.kiosk, x, z, ry + Math.PI / 2);
        } else if (r < 0.73) {
          const [x, z] = at(s, 0.7);
          place(P.mailbox, x, z, ry);
        } else if (r < 0.77) {
          const [x, z] = at(s, 0.7);
          place(P.payphone, x, z, ry, WHITE);
        } else if (r < 0.82 && bldFree && P.dumpster) {
          const [x, z] = at(s, walkW - 0.65);
          if (!tsNoProp(x, z)) {
            const it = place(P.dumpster, x, z, ry + Math.PI, WHITE);
            sBox(it, -0.97, 0, -0.6, 0.97, 1.3, 0.6, "equipment");
          }
        } else if (r < 0.84) {
          const [x, z] = at(s, 0.35);
          place(P.signpole, x, z, ry, WHITE);
        }
      }
      if (av && rnd() < 0.3) {
        const [x, z] = at(L - 14, 0.5);
        place(P.busstop, x, z, ry);
      }
    }
  }
  // ---- (layout2 r3) Greenwich / West Village street map (VMAP): the frontage loop above only knows rectangular grid
  // blocks. Every Village cell's curb-polygon edge is a frontage here: lamps, tree pits + street trees, hydrants, trash
  // cans, newsboxes, sign poles and furniture slots (planters, benches, bike racks, mailboxes, a few newsstands / bus
  // shelters / carts), oriented along the edge, kept ~6 m off the corners (crosswalks) and out of the lots (every spot is
  // checked against streetsAt = the Village map). Own RNG streams: the grid placement streams above stay unchanged.
  // oBox: collision for a box prop at an arbitrary heading = axis-aligned slices, <= 1.8 cm outside the rendered box.
  const oBox = (
    it,
    lx0,
    ly0,
    lz0,
    lx1,
    ly1,
    lz1,
    kind = "equipment",
    flags = 0,
  ) => {
    if (!S || !it) return;
    const q = ((it.ry % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
    if (q < 1e-4 || Math.PI / 2 - q < 1e-4)
      return sBox(it, lx0, ly0, lz0, lx1, ly1, lz1, kind, flags);
    const Pw = [
      [lx0, lz0],
      [lx1, lz0],
      [lx1, lz1],
      [lx0, lz1],
    ].map(([a, c]) => toW(it, a, c));
    const plan = (ax) => {
      // slices across coordinate ax, piecewise between the vertices; step so the overshoot <= 1.8 cm
      const us = [...new Set(Pw.map((p) => p[ax]))].sort((a, b) => a - b),
        out = [];
      const sect = (c) => {
        let lo = Infinity,
          hi = -Infinity;
        for (let i = 0; i < 4; i++) {
          const p = Pw[i],
            r = Pw[(i + 1) % 4],
            pu = p[ax],
            ru = r[ax];
          if ((pu - c) * (ru - c) > 0) continue;
          if (Math.abs(ru - pu) < 1e-9) {
            lo = Math.min(lo, p[1 - ax], r[1 - ax]);
            hi = Math.max(hi, p[1 - ax], r[1 - ax]);
            continue;
          }
          const v =
            p[1 - ax] + ((r[1 - ax] - p[1 - ax]) * (c - pu)) / (ru - pu);
          lo = Math.min(lo, v);
          hi = Math.max(hi, v);
        }
        return [lo, hi];
      };
      for (let k = 0; k + 1 < us.length; k++) {
        const u0 = us[k],
          u1 = us[k + 1];
        if (u1 - u0 < 1e-6) continue;
        let m = 0;
        for (let i = 0; i < 4; i++) {
          const p = Pw[i],
            r = Pw[(i + 1) % 4],
            L = Math.hypot(r[0] - p[0], r[1] - p[1]);
          if (
            Math.min(p[ax], r[ax]) <= u0 + 1e-6 &&
            Math.max(p[ax], r[ax]) >= u1 - 1e-6
          )
            m = Math.max(m, Math.abs(r[1 - ax] - p[1 - ax]) / L);
        }
        const n = Math.max(1, Math.ceil(((u1 - u0) * m) / 0.018));
        for (let j = 0; j < n; j++) {
          const a = u0 + ((u1 - u0) * j) / n,
            b = u0 + ((u1 - u0) * (j + 1)) / n,
            sa = sect(a),
            sb = sect(b);
          out.push([a, b, Math.min(sa[0], sb[0]), Math.max(sa[1], sb[1])]);
        }
      }
      return out;
    };
    const A = plan(0),
      B = plan(1);
    if (A.length <= B.length)
      for (const [a, b, lo, hi] of A)
        S.box(a, it.y + ly0, lo, b, it.y + ly1, hi, kind, flags);
    else
      for (const [a, b, lo, hi] of B)
        S.box(lo, it.y + ly0, a, hi, it.y + ly1, b, kind, flags);
  };
  {
    const rv = mulberry32(8811),
      rvt = mulberry32(8822);
    const sideOk = (x, z, r = 0.35) => {
      if (keepOut(x, z)) return false;
      for (const [dx, dz] of [
        [0, 0],
        [r, 0],
        [-r, 0],
        [0, r],
        [0, -r],
      ])
        if (streetsAt(x + dx, z + dz).type !== "sidewalk") return false;
      return true;
    };
    const vPlace = (pool, x, z, ry, tint = 0x3b3e40, r = 0.35) =>
      sideOk(x, z, r) ? place(pool, x, z, ry, tint) : null;
    for (const c of MAPS.flatMap((M) => M.cells)) {
      // (layout2 r4) every street map
      const Q = c.curb,
        nq = Q.length;
      let cx = 0,
        cz = 0;
      for (const [x, z] of Q) {
        cx += x;
        cz += z;
      }
      cx /= nq;
      cz /= nq;
      for (let i = 0; i < nq; i++) {
        const [ax, az] = Q[i],
          [bx, bz] = Q[(i + 1) % nq],
          L = Math.hypot(bx - ax, bz - az);
        if (L < 16) continue;
        const tx = (bx - ax) / L,
          tz = (bz - az) / L;
        let nx = -tz,
          nz = tx;
        if ((ax - cx) * nx + (az - cz) * nz < 0) {
          nx = -nx;
          nz = -nz;
        } // outward (toward the street)
        let walkW = 99;
        if (c.prop)
          for (const [px, pz] of c.prop)
            walkW = Math.min(walkW, (ax - px) * nx + (az - pz) * nz); // sidewalk width
        if (walkW > 12) walkW = 3; // paved island (no lot): curb-zone furniture only
        if (walkW < 2.4) continue;
        const ry = Math.atan2(nx, nz),
          at = (s, off) => [ax + tx * s - nx * off, az + tz * s - nz * off];
        const lampS = [],
          treeS = [],
          END = 6;
        for (let s = END + rv() * 4; s < L - END; s += 26 + rv() * 4) {
          const [x, z] = at(s, 0.55),
            it = vPlace(P.lamp, x, z, ry, 0x4a4e50, 0.3);
          if (!it) continue;
          sCyl(it, 0, 0, 0, 8.3, 0.15);
          anchor(it, 0, 9.15, 2.9, "lampTop");
          lampS.push(s);
        }
        if (c.prop && walkW >= 3.2 && rvt() < 0.9) {
          // street trees in pits (city.ts skips its Village spots: treeSpots.vmapDone)
          const spc = pickSpecies(rvt),
            sp = 6.5 + rvt() * 2;
          for (
            let s = END + 2 + rvt() * 3;
            s < L - END - 1;
            s += sp * (0.75 + rvt() * 0.5)
          ) {
            if (rvt() < 0.08 || lampS.some((t) => Math.abs(t - s) < 1.8))
              continue;
            const [x, z] = at(s, 1.3),
              clear = feClear(x, z);
            if (clear < 2.6 || !sideOk(x, z, 0.8)) continue;
            if (
              !place(
                rvt() < 0.45 && P.pit2 ? P.pit2 : P.pit,
                x,
                z,
                ry,
                0x333333,
              )
            )
              continue;
            treeS.push(s);
            const wq = clear < 5 ? 0.82 + rvt() * 0.18 : 0.85 + rvt() * 0.3,
              hq = 0.85 + rvt() * 0.35;
            const sp2 = rvt() < 0.25 ? pickSpecies(rvt) : spc,
              young = rvt() < 0.15;
            treeSpots.push({
              x,
              z,
              kind: "street",
              clear,
              pal: sp2.pal,
              sc: sp2.sc * (young ? 0.55 + rvt() * 0.12 : 0.8 + rvt() * 0.4),
              s3: [wq, hq, wq * (0.9 + rvt() * 0.2)],
            });
          }
        }
        const busy = (s, d) =>
          lampS.some((t) => Math.abs(t - s) < d) ||
          treeS.some((t) => Math.abs(t - s) < d + 0.8);
        {
          const s = END - 1 + rv() * 4;
          if (!busy(s, 1)) {
            const [x, z] = at(s, 0.45);
            vPlace(
              P.hydrant,
              x,
              z,
              ry + rv(),
              rv() < 0.6 ? 0xb8b6ae : rv() < 0.5 ? 0x9a1b16 : 0xd8a41a,
              0.25,
            );
          }
        }
        for (const s of [3.4, L - 3.4])
          if (rv() < 0.6) {
            const [x, z] = at(s, 1.0);
            vPlace(P.trash, x, z, rv() * 6);
          }
        if (rv() < 0.45) {
          const [x, z] = at(L - 4.6, 1.05);
          vPlace(P.newsbox, x, z, ry + Math.PI, 0x3b3e40, 0.6);
        }
        for (const s of [END + 0.5, L - END - 0.5])
          if (rv() < 0.5 && !busy(s, 0.8)) {
            const [x, z] = at(s, 0.35);
            vPlace(P.signpole, x, z, ry, WHITE, 0.2);
          }
        if (!c.prop) continue;
        // furniture slots
        let shelter =
            walkW >= 4.4 && L > 40 && rv() < 0.35 ? L * (0.3 + rv() * 0.4) : -1,
          stand = walkW >= 4.2 && L > 36 && rv() < 0.3;
        for (let s = END + 3 + rv() * 4; s < L - END - 2; s += 7 + rv() * 6) {
          if (shelter > 0 && s > shelter) {
            shelter = -1;
            const sc = s + 2.5;
            if (
              !busy(sc, 2.8) &&
              sideOk(...at(sc - 2.3, 0.3), 0.1) &&
              sideOk(...at(sc + 2.3, 0.3), 0.1) &&
              sideOk(...at(sc - 2.3, 2.45), 0.1) &&
              sideOk(...at(sc + 2.3, 2.45), 0.1)
            ) {
              const [x, z] = at(sc, 1.35),
                it = place(P.shelter, x, z, ry);
              oBox(it, -2.2, 2.45, -0.9, 2.2, 2.6, 1.0, "awning", 1);
              if (it)
                for (const [lx, fr] of [
                  [2.168, Math.PI / 2],
                  [2.032, -Math.PI / 2],
                ])
                  streetAds.push({
                    x: it.x,
                    y: it.y,
                    z: it.z,
                    ry: it.ry,
                    lx,
                    ly: 1.225,
                    lz: -0.1,
                    fr,
                    w: 1.1,
                    h: 1.85,
                    port: true,
                    gain: 0.55,
                  });
              s += 6;
              continue;
            }
          }
          const r = rv(),
            pitNear = busy(s, 1.6);
          if (r < 0.16) {
            if (!pitNear) {
              const [x, z] = at(s, 0.95);
              vPlace(P.trash, x, z, rv() * 6);
            }
          } else if (r < 0.3) {
            if (!pitNear) {
              const [x, z] = at(s, 1.05);
              vPlace(
                P.newsbox,
                x,
                z,
                ry + Math.PI + (rv() - 0.5) * 0.1,
                0x3b3e40,
                0.6,
              );
            }
          } else if (r < 0.44) {
            for (let k = 0; k < 2 && s + k * 2.2 < L - END; k++) {
              const [x, z] = at(s + k * 2.2, walkW - 0.55);
              if (
                !sideOk(...at(s + k * 2.2 - 0.65, walkW - 0.55), 0.1) ||
                !sideOk(...at(s + k * 2.2 + 0.65, walkW - 0.55), 0.1)
              )
                continue;
              const it = vPlace(P.planter, x, z, ry, 0x3b3e40, 0.4);
              oBox(it, -0.6, 0, -0.45, 0.6, 0.62, 0.45, "equipment");
            }
          } else if (r < 0.54) {
            const [x, z] = at(s, walkW - 0.45);
            if (
              sideOk(...at(s - 1, walkW - 0.45), 0.1) &&
              sideOk(...at(s + 1, walkW - 0.45), 0.1)
            )
              vPlace(P.bench, x, z, ry, 0x3b3e40, 0.3);
          } else if (r < 0.64) {
            if (!pitNear) {
              const [x, z] = at(s, 0.75);
              if (
                vPlace(P.bikerack, x, z, ry, 0x3b3e40, 0.3) &&
                P.bike &&
                rv() < 0.5
              ) {
                const [bx2, bz2] = at(s + (rv() - 0.5) * 1.6, 1.05);
                place(
                  P.bike,
                  bx2,
                  bz2,
                  ry + Math.PI / 2,
                  0x3a3a3a + Math.floor(rv() * 3) * 0x202020,
                );
              }
            }
          } else if (r < 0.7) {
            const [x, z] = at(s, 0.7);
            vPlace(P.mailbox, x, z, ry, 0x3b3e40, 0.3);
          } else if (r < 0.74 && walkW >= 4.2) {
            if (!pitNear) {
              const [x, z] = at(s, 1.0);
              vPlace(
                P.cart,
                x,
                z,
                ry + Math.PI / 2 + (rv() - 0.5) * 0.3,
                0x3b3e40,
                0.9,
              );
            }
          } else if (r < 0.84 && stand) {
            const [x, z] = at(s + 1.3, walkW - 1.0);
            if (
              !busy(s + 1.3, 2) &&
              sideOk(...at(s, walkW - 0.2), 0.1) &&
              sideOk(...at(s + 2.6, walkW - 0.2), 0.1)
            ) {
              const it = vPlace(P.news, x, z, ry, 0x3b3e40, 0.8);
              oBox(it, -1.3, 0, -0.8, 1.3, 2.3, 0.8, "equipment");
              if (it) {
                newsAds(it);
                stand = false;
                s += 3;
              }
            }
          } else if (r < 0.88) {
            const [x, z] = at(s, 0.35);
            vPlace(P.signpole, x, z, ry, WHITE, 0.2);
          }
        }
      }
    }
    treeSpots.vmapDone = true; // city.ts diagTreeSpots: the Village street trees are placed here (with pits)
  }
  // ---- (street r2) park-side sidewalks (CPW / 5th Av / 59th / 110th): lamps, trash cans, hydrants, carts at the curb
  // (the park agent's wall + benches line the inner edge; street trees come from trees.ts)
  {
    const PK = G.PARK;
    const runs = [
      { x: PK.x0 - G.AV_WALK, n: [-1, 0], a: PK.z0, b: PK.z1, alongX: false },
      { x: PK.x1 + G.AV_WALK, n: [1, 0], a: PK.z0, b: PK.z1, alongX: false },
      { z: PK.z0 - G.ST_WALK, n: [0, -1], a: PK.x0, b: PK.x1, alongX: true },
      { z: PK.z1 + G.ST_WALK, n: [0, 1], a: PK.x0, b: PK.x1, alongX: true },
    ];
    const onWalk = (x, z) => streetsAt(x, z).type === "sidewalk";
    for (const R of runs) {
      const ry = Math.atan2(R.n[0], R.n[1]);
      const pt = (s, off) =>
        R.alongX ? [s, R.z - R.n[1] * off] : [R.x - R.n[0] * off, s];
      for (let s = R.a + 12 + rndT() * 8; s < R.b - 8; s += 30 + rndT() * 4) {
        const [x, z] = pt(s, 0.55);
        if (!onWalk(x, z)) continue;
        const it = place(P.lamp, x, z, ry, 0x4a4e50);
        sCyl(it, 0, 0, 0, 8.3, 0.15);
        anchor(it, 0, 9.15, 2.9, "lampTop");
        if (rndT() < 0.55) {
          const [tx, tz] = pt(s + 2.2, 1.0);
          if (onWalk(tx, tz)) place(P.trash, tx, tz, rndT() * 6);
        }
        if (rndT() < 0.22) {
          const [hx, hz] = pt(s + 6, 0.45);
          if (onWalk(hx, hz)) place(P.hydrant, hx, hz, ry + rndT(), 0xb8b6ae);
        }
        if (rndT() < 0.12 && P.cart) {
          const [cx, cz] = pt(s + 11, 1.1);
          if (onWalk(cx, cz)) place(P.cart, cx, cz, ry + Math.PI / 2);
        }
        if (rndT() < 0.2) {
          const [px, pz] = pt(s + 14, 0.35);
          if (onWalk(px, pz)) place(P.signpole, px, pz, ry, WHITE);
        }
        // (street r8) critic (ref 11): 'park-side sidewalk lacks the Central Park wall benches'. Runs of slatted benches
        // against the wall, backs to the park, facing the avenue (between the lamp stations)
        const wOff = (R.alongX ? G.ST_WALK : G.AV_WALK) - 0.7;
        for (const ds of [4.2, 6.4, 8.6, 17.5, 19.7, 21.9]) {
          if (rndT() < 0.18) continue;
          const [bx, bz] = pt(s + ds, wOff);
          if (onWalk(bx, bz) && s + ds < R.b - 6) place(P.bench, bx, bz, ry);
        }
      }
    }
  }
  // ---- traffic signals at every signalised intersection of the road network
  const roads = buildRoads();
  for (const n of roads.nodes) {
    if (!n || !n.av || !n.st) continue;
    const cx = n.hw + 0.9,
      cz = n.hz + 0.9; // (layout2 r9) per-street half width
    const onWalk = (x, z) => streetsAt(x, z).type === "sidewalk";
    const mast = (x, z, ry, axis) => {
      if (!onWalk(x, z)) return;
      // Park Av viaduct: no mast whose arm would run into the ramp deck (arm 6.1-6.8 m up, 10.5 m long)
      {
        const V = PARK_VIADUCT,
          ex = x + Math.sin(ry) * 10.5,
          ez = z + Math.cos(ry) * 10.5;
        const yb = V.yTop * Math.max(0, (V.z1 - z) / (V.z1 - V.z0)) - 1.3;
        if (
          Math.min(x, ex) < V.x1 &&
          Math.max(x, ex) > V.x0 &&
          z > V.z0 - 0.5 &&
          z < V.z1 &&
          yb < 7.3
        )
          return;
      }
      const it = place(P.mast, x, z, ry, SIG);
      signals.push({ it, axis, mast: true }); // (night) mast: the signal light sits under the arm heads
      sCyl(it, 0, 0, 0, 7.3, 0.17);
      // mast arm: 0.5 m stepped boxes following the arm's rising top (<= 2 cm error); bottoms below the refit cut (6.2 m)
      // so city's instanced-solid refit keeps them (its heightfield alone loses the thin far end of the arm)
      for (let z0 = 0.2; z0 < 10.5; z0 += 0.5) {
        const z1 = Math.min(10.55, z0 + 0.5);
        sBox(
          it,
          -0.1,
          6.1,
          z0,
          0.1,
          6.3 + (0.4 * z1) / 10.5 + 0.1,
          z1,
          "pole",
          1,
        );
      }
      anchor(it, 0, 7.9, 0, "signalMast");
      anchor(it, 0, 6.8, 10.4, "signalMast");
    };
    mast(n.x + cx, n.z - cz, -Math.PI / 2, "av");
    mast(n.x - cx, n.z + cz, Math.PI / 2, "av");
    if (!n.drive) {
      const dir = streetDir(n.j);
      const px = dir > 0 ? n.x + cx : n.x - cx,
        pz = dir > 0 ? n.z + cz : n.z - cz;
      if (onWalk(px, pz)) {
        const it = place(P.post, px, pz, dir > 0 ? Math.PI : 0, SIG);
        signals.push({ it, axis: "st" });
        sCyl(it, 0, 0, 0, 4.4, 0.1);
      }
      if (n.hz > G.ST_HALF + 0.01) {
        const qx = dir > 0 ? n.x - cx : n.x + cx,
          qz = dir > 0 ? n.z - cz : n.z + cz; // (layout2 r9) wide two-way street: the other approach
        if (onWalk(qx, qz)) {
          const it = place(P.post, qx, qz, dir > 0 ? 0 : Math.PI, SIG);
          signals.push({ it, axis: "st" });
          sCyl(it, 0, 0, 0, 4.4, 0.1);
        }
      }
    }
  }
  // ---- (layout2 r4) corner bulb-outs (layout islands 'bulb'): the curb extension beyond the crosswalk (4.3-5.5 m from the
  // box edge; the crosswalk + ramp use 0.8-3.8 m) carries a planter (exact box collision) or a bike rack. Own RNG stream.
  {
    const rb = mulberry32(9311);
    for (const I of islands()) {
      if (I.kind !== "bulb" || I.poly.length !== 4) continue;
      const w = I.x1 - I.x0,
        h = I.z1 - I.z0,
        alongZ = h > w,
        [cx, cz] = I.poly[0];
      if ((alongZ ? h : w) < 7.5) continue;
      const sgn = alongZ
        ? Math.sign((I.z0 + I.z1) / 2 - cz)
        : Math.sign((I.x0 + I.x1) / 2 - cx);
      const x = alongZ ? (I.x0 + I.x1) / 2 : cx + sgn * 4.9,
        z = alongZ ? cz + sgn * 4.9 : (I.z0 + I.z1) / 2,
        ry = alongZ ? Math.PI / 2 : 0;
      const r = rb();
      if (r < 0.55) {
        const it = place(P.planter, x, z, ry);
        sBox(it, -0.6, 0, -0.45, 0.6, 0.62, 0.45, "equipment");
      } else if (r < 0.8) place(P.bikerack, x, z, ry);
    }
  }
  // ---- (layout2 r3) Village signalised intersections (interior VMAP nodes; roads.ts signals their links by the dominant
  // axis of travel): a pole-mounted signal on the near-side right corner of every leg, heads facing the approaching cars
  for (const n of roads.nodes) {
    if (!n || !n.vmap || n.tee) continue;
    const legs = [];
    for (const s of MAPS.flatMap((M) => M.segs)) {
      // (layout2 r4)
      if (Math.hypot(s.ax - n.x, s.az - n.z) < 0.5)
        legs.push({ ux: s.ux, uz: s.uz, hw: s.hw });
      else if (Math.hypot(s.bx - n.x, s.bz - n.z) < 0.5)
        legs.push({ ux: -s.ux, uz: -s.uz, hw: s.hw });
    }
    if (legs.length < 3) continue;
    for (const g of legs) {
      const rx = g.uz,
        rz = -g.ux; // right-hand side of a car driving toward the node (d = -u)
      for (let s = 4; s < 26; s += 0.5) {
        const x = n.x + g.ux * s + rx * (g.hw + 0.55),
          z = n.z + g.uz * s + rz * (g.hw + 0.55);
        const ok = [
          [0, 0],
          [0.3, 0],
          [-0.3, 0],
          [0, 0.3],
          [0, -0.3],
        ].every(([dx, dz]) => streetsAt(x + dx, z + dz).type === "sidewalk");
        if (!ok) continue;
        const it = place(P.post, x, z, Math.atan2(-g.uz, g.ux), SIG);
        if (it) {
          signals.push({
            it,
            axis: Math.abs(g.uz) >= Math.abs(g.ux) ? "av" : "st",
            map: true,
          });
          sCyl(it, 0, 0, 0, 0.4, 0.2);
          sCyl(it, 0, 0, 0.4, 4.4, 0.1);
        }
        break;
      }
    }
  }
  // ---- steam stacks over manholes in the avenue lanes (+ plume); cars route around them (registry.laneObstacles)
  const vents = [];
  for (let ai = 0; ai < avenues.length; ai++) {
    const a = avenues[ai];
    for (let k = 0; k + 1 < streets.length; k++) {
      const zA = streets[k] + stHalf(k) + 20,
        zB = streets[k + 1] - stHalf(k + 1) - 20;
      if (!avActive(ai, k)) continue;
      const dd = district(a, (zA + zB) / 2),
        core = dd.midtown > 0.35 || dd.fidi > 0.35;
      const forced = a === 250 && streets[k + 1] === 160;
      if (!forced && rnd() > (core ? 0.22 : 0.06)) continue;
      const lane = forced ? -1 : (rnd() < 0.5 ? -1 : 1) * (rnd() < 0.5 ? 1 : 2);
      const x = a + lane * 3.6 - Math.sign(lane) * 1.8,
        z = forced ? streets[k + 1] - 38 : zA + rnd() * (zB - zA);
      if (
        x > PARK_VIADUCT.x0 - 1 &&
        x < PARK_VIADUCT.x1 + 1 &&
        z > PARK_VIADUCT.z0 - 1 &&
        z < PARK_VIADUCT.z1 + 1
      )
        continue;
      const it = P.stack.add(x, 0, z, 0, 1, null, tintOf(0xffffff));
      sCyl(it, 0, 0, 0, 2.7, 0.37, "equipment");
      vents.push({ x, y: 0, z, seed: rnd() });
      registry.laneObstacles.push({ x, z, r: 0.5 });
      {
        // (street r10) critic: 'steam stack sits alone in the lane, looks placed'. Con-Ed style work zone round it: a cone
        // taper both ways along the lane, drums at the ends, a steel road plate beside the stack (own RNG stream)
        const rc = mulberry32(
          ((Math.floor(x * 7.3) * 73856093) ^
            (Math.floor(z * 3.1) * 19349663) ^
            0x57ea) >>>
            0,
        );
        for (const sd of [-1, 1]) {
          for (let k = 0; k < 4; k++) {
            const dz = sd * (1.6 + k * 1.5),
              dx =
                (k === 0 ? 0.9 : 1.35 - k * 0.2) *
                (rc() < 0.5 ? 1 : -1) *
                (k === 0 ? 1 : 1);
            if (rc() < 0.15) continue;
            place(
              P.cone,
              x + dx * (k % 2 ? 1 : -1),
              z + dz,
              rc() * 6,
              WHITE,
              {},
              0,
            );
          }
          const it = place(
            P.drum,
            x + (rc() - 0.5) * 1.2,
            z + sd * (7.4 + rc()),
            rc() * 6,
            WHITE,
            {},
            0,
          );
          sCyl(it, 0, 0, 0, 1.0, 0.3, "equipment");
        }
      }
    }
  }
  // (street r3) tower forecourt plazas: granite paving + a furnished plaza (tree rows in granite pits, benches between,
  // planters along the curb edge, a food cart / newsbox) instead of an empty checkerboard
  {
    const strips = plazaStrips(buildings);
    strips.push(...GC_FORECOURTS); // (street r11) Park Av forecourts by Grand Central (appended: the other strips' rng draws are unchanged)
    buildPlazaPaving({ scene, strips });
    const rp = mulberry32(6061);
    const rpc = mulberry32(6262);
    PLAZA_CROWD_SPOTS.length = 0; // (street r7)
    for (const s of strips) {
      const alongX = s.nz !== 0,
        ry = Math.atan2(s.nx, s.nz); // props face the street
      const inTS = tsNoProp((s.x0 + s.x1) / 2, (s.z0 + s.z1) / 2); // timessq r5: Times Square has its own planters
      const u0 = alongX ? s.x0 : s.z0;
      const wall = alongX ? (s.nz > 0 ? s.z0 : s.z1) : s.nx > 0 ? s.x0 : s.x1; // building side of the strip
      const pt = (u, d) =>
        alongX ? [u0 + u, wall + s.nz * d] : [wall + s.nx * d, u0 + u];
      const treeD = s.W * 0.55,
        trees = s.W >= 6.5;
      for (let u = 4 + rp() * 2; u < s.L - 3.5; u += 8 + rp() * 2) {
        if (trees) {
          const [x, z] = pt(u, treeD);
          place(P.pit, x, z, ry);
          const spc = pickSpecies(rndT);
          treeSpots.push({
            x,
            z,
            kind: "street",
            clear: 99,
            pal: spc.pal,
            sc: spc.sc * (0.85 + rp() * 0.35),
          });
        }
        const [bx, bz] = pt(u + 4, trees ? treeD : s.W * 0.5);
        if (u + 5.5 < s.L && rp() < 0.8)
          place(P.bench, bx, bz, ry + (rp() < 0.5 ? 0 : Math.PI));
        if (rp() < 0.45 && !inTS) {
          const [x, z] = pt(u + 2, Math.min(1.6, s.W * 0.25));
          const it = place(P.planter, x, z, ry + Math.PI / 2);
          sBox(it, -0.6, 0, -0.45, 0.6, 0.62, 0.45, "equipment");
        }
      }
      // planter row along the curb edge (bollard-like security line), gaps for the walk
      for (let u = 1.5; u < s.L - 1; u += 3.2) {
        if (rp() < 0.35) continue;
        const [x, z] = pt(u, s.W - 0.7);
        const it = inTS ? null : place(P.planter, x, z, ry + Math.PI / 2);
        sBox(it, -0.6, 0, -0.45, 0.6, 0.62, 0.45, "equipment");
      }
      if (s.L > 20 && rp() < 0.6) {
        const [x, z] = pt(s.L * (0.3 + rp() * 0.4), s.W - 2.2);
        place(P.cart, x, z, ry + Math.PI / 2);
      }
      if (rp() < 0.5) {
        const [x, z] = pt(s.L - 2, s.W - 1.6);
        place(P.newsbox, x, z, ry);
      }
      // (street r7) people in the plaza (critic: 'plazas / sidewalks nearly empty'): standing groups between the tree pits
      // and benches -> npc/crowd.ts statics (own rng: the prop streams above are unchanged)
      if (!inTS)
        for (let u = 6.5 + rpc() * 3; u < s.L - 2.5; u += 5 + rpc() * 7) {
          const [cx, cz] = pt(
              u + (rpc() - 0.5) * 1.2,
              s.W * (0.22 + rpc() * 0.3),
            ),
            n = rpc() < 0.35 ? 1 : 2 + Math.floor(rpc() * 2),
            a0 = rpc() * 6.28;
          for (let k = 0; k < n; k++) {
            const ang = a0 + (k / n) * 6.28,
              px = n === 1 ? cx : cx + Math.cos(ang) * 0.5,
              pz = n === 1 ? cz : cz + Math.sin(ang) * 0.5;
            PLAZA_CROWD_SPOTS.push({
              x: px,
              z: pz,
              ry: n === 1 ? rpc() * 6.28 : Math.atan2(cx - px, cz - pz),
              mode: "stand",
              clip:
                n === 1
                  ? rpc() < 0.6
                    ? "phone"
                    : "idle"
                  : rpc() < 0.7
                    ? "talk"
                    : "idle",
            });
          }
        }
    }
  }
  const lowQuality = getQuality().name === "low";
  const roadPatches = buildRoadPatches({ scene }); // street agent: asphalt repair patches / trench cuts under the markings
  if (lowQuality && roadPatches) roadPatches.visible = false;
  const streetGrime = buildStreetGrime({ scene, buildings }); // street agent r2: manholes, plates, oil / drip bands, tar snakes, gutters, base AO
  if (lowQuality && streetGrime) streetGrime.visible = false;
  {
    // (street r7) critic: 'add manholes with steam' -> low steam wisps rising straight off ~9% of the core manholes
    const rs = mulberry32(3131);
    for (const [x, z] of MANHOLES) {
      const dd = district(x, z);
      if (rs() < (dd.midtown > 0.35 || dd.fidi > 0.35 ? 0.09 : 0.025))
        vents.push({ x, y: -2.5, z, seed: rs() });
    }
  }
  const steamTime = { value: 0 };
  if (T && vents.length) {
    const st = createSteam(T, vents, steamTime);
    st.renderOrder = 2;
    st.frustumCulled = false;
    st.name = "steam";
    scene.add(st);
  }
  // ---- park furniture
  if (parkPaths) {
    for (const p of parkPaths) {
      if (p.drive) continue;
      let acc = 0;
      for (let i = 1; i < p.pts.length; i++) {
        const [x0, z0] = p.pts[i - 1],
          [x1, z1] = p.pts[i];
        const L = Math.hypot(x1 - x0, z1 - z0);
        acc += L;
        if (acc > 28) {
          acc = 0;
          const nx = -(z1 - z0) / L,
            nz = (x1 - x0) / L;
          const side = rnd() < 0.5 ? 1 : -1;
          const off = p.w / 2 + 0.6;
          const it = P.lamp.add(
            x1 + nx * off * side,
            G.CURB_H,
            z1 + nz * off * side,
            Math.atan2(-nx * side, -nz * side),
            0.75,
            null,
            tintOf(0x1c1c1c),
          );
          sCyl(it, 0, 0, 0, 8.3 * 0.75, 0.15 * 0.75);
          anchor(it, 0, 9.15 * 0.75, 2.9 * 0.75, "lampTop");
          if (rnd() < 0.6)
            P.bench.add(
              x0 + nx * off * -side,
              G.CURB_H,
              z0 + nz * off * -side,
              Math.atan2(nx * side, nz * side),
              1,
              null,
              tintOf(0),
            );
          if (rnd() < 0.3)
            P.trash.add(
              x0 + nx * (off + 0.3) * side + ((x1 - x0) / L) * 2,
              G.CURB_H,
              z0 + nz * (off + 0.3) * side + ((z1 - z0) / L) * 2,
              rnd() * 6,
              1,
              null,
              tintOf(0x3b3e40),
            );
        }
      }
    }
  }
  // ---- promenade (both rivers, all around the island): lamps, benches, trees
  // (coast r1) the seawall rail + the spots now follow the real waterfront edge built by waterfront.ts (COAST): the rail
  // is part of the coast meshes (NYC esplanade rail), lamps / benches stand along the new coping line, the bump-out
  // lawns carry their own trees. Falls back to the old straight row-sampled line if the coast was not built.
  if (COAST.built) {
    for (const L of COAST.lamps) {
      const it = P.lamp.add(
        L.x,
        L.y ?? G.CURB_H,
        L.z,
        Math.atan2(-L.nx, -L.nz),
        0.8,
        null,
        tintOf(0x1c1c1c),
      );
      if (!it) continue;
      sCyl(it, 0, 0, 0, 8.3 * 0.8, 0.15 * 0.8);
      anchor(it, 0, 9.15 * 0.8, 2.9 * 0.8, "lampTop");
    }
    for (const B of COAST.benches)
      P.bench.add(
        B.x,
        B.y ?? G.CURB_H,
        B.z,
        Math.atan2(-B.nx, -B.nz),
        1,
        null,
        tintOf(0),
      );
    for (const T of COAST.trees) treeSpots.push(T);
  }
  for (const [side, SX] of COAST.built
    ? []
    : [
        [0, SHORE_W],
        [1, SHORE_E],
      ]) {
    const inv = side ? -1 : 1; // inward direction along x
    let accL = 0,
      accB = 0,
      accT = 0;
    for (let i = 0; i + 1 < SHORE_Z.length; i++) {
      const ax = SX[i],
        az = SHORE_Z[i],
        bx = SX[i + 1],
        bz = SHORE_Z[i + 1];
      if (SHORE_W[i] >= SHORE_E[i] - 1 || SHORE_W[i + 1] >= SHORE_E[i + 1] - 1)
        continue;
      const L = Math.hypot(bx - ax, bz - az);
      if (L < 0.05) continue;
      const tx = (bx - ax) / L,
        tz = (bz - az) / L;
      let nx = -tz,
        nz = tx;
      if (nx * inv < 0) {
        nx = -nx;
        nz = -nz;
      }
      for (let u = (30 - (accL % 30)) % 30; u < L; u += 30) {
        const x = ax + tx * u + nx * 1.0,
          z = az + tz * u + nz * 1.0;
        const it = P.lamp.add(
          x,
          G.CURB_H,
          z,
          Math.atan2(-nx, -nz),
          0.8,
          null,
          tintOf(0x1c1c1c),
        );
        sCyl(it, 0, 0, 0, 8.3 * 0.8, 0.15 * 0.8);
        anchor(it, 0, 9.15 * 0.8, 2.9 * 0.8, "lampTop");
      }
      accL += L;
      for (let u = (60 - (accB % 60)) % 60; u < L; u += 60) {
        const x = ax + tx * u + nx * 3,
          z = az + tz * u + nz * 3;
        if (streetsAt(x + nx * 1.5, z + nz * 1.5).fill)
          P.bench.add(x, G.CURB_H, z, Math.atan2(-nx, -nz), 1, null, tintOf(0));
      }
      accB += L;
      for (let u = (13 - (accT % 13)) % 13; u < L; u += 13) {
        const x = ax + tx * u + nx * 8.5,
          z = az + tz * u + nz * 8.5;
        const q = streetsAt(x, z),
          q2 = streetsAt(x + nx * 4, z + nz * 4);
        if (q.fill && q2.fill && rnd() < 0.8)
          treeSpots.push({ x, z, kind: "street" });
      }
      accT += L;
    }
  }
  // the inland esplanade trees (8.5 m in from the original seawall line) stay in both cases
  if (COAST.built)
    for (const [side, SX] of [
      [0, SHORE_W],
      [1, SHORE_E],
    ]) {
      const inv = side ? -1 : 1;
      let accT = 0;
      for (let i = 0; i + 1 < SHORE_Z.length; i++) {
        const ax = SX[i],
          az = SHORE_Z[i],
          bx = SX[i + 1],
          bz = SHORE_Z[i + 1];
        if (
          SHORE_W[i] >= SHORE_E[i] - 1 ||
          SHORE_W[i + 1] >= SHORE_E[i + 1] - 1
        )
          continue;
        const L = Math.hypot(bx - ax, bz - az);
        if (L < 0.05) continue;
        const tx = (bx - ax) / L,
          tz = (bz - az) / L;
        let nx = -tz,
          nz = tx;
        if (nx * inv < 0) {
          nx = -nx;
          nz = -nz;
        }
        for (let u = (13 - (accT % 13)) % 13; u < L; u += 13) {
          const x = ax + tx * u + nx * 8.5,
            z = az + tz * u + nz * 8.5;
          const q = streetsAt(x, z),
            q2 = streetsAt(x + nx * 4, z + nz * 4);
          if (q.fill && q2.fill && rnd() < 0.8)
            treeSpots.push({ x, z, kind: "street" });
        }
        accT += L;
      }
    }

  // ---- rooftop clutter: HVAC units, vent stacks, dishes, antennas, terrace gardens, fences, billboards
  const ads = P.billboard ? adAtlas() : null;
  const adItems = [];
  if (buildings && P.hvac)
    placeRooftops({
      buildings,
      P,
      S,
      rnd,
      place,
      sBox,
      sCyl,
      anchor,
      tintOf,
      adItems,
      ads,
    });
  // LOD chain: full model -> mid (auto box LOD, n x n columns, still casting nearby shadows) -> far (1-4 boxes, no
  // shadow), all with complementary dithered fades; the far ring ends where the prop is sub-pixel.
  const LODS = {
    hvac: [
      [3, 400],
      [1, 1500],
    ],
    vents: [
      [2, 260],
      [1, 650],
    ],
    dish: [[1, 700]],
    antenna: [[1, 1500]],
    garden: [
      [3, 500],
      [2, 1500],
    ],
  };
  for (const [name, chain] of Object.entries(LODS)) {
    const src = P[name];
    if (!src || !src.items.length) continue;
    let near = src.far;
    chain.forEach(([n, far], i) => {
      const lod = new Pool(autoLod(src.geo, n), mat, {
        name: name + (i === chain.length - 1 ? "-far" : "-mid"),
        near,
        far,
        max: src.items.length,
        castShadow: i === 0 && n > 1,
        shadowFar: 150,
        smallCasters: true,
        extra: { aTint: 3, aState: 1 },
      });
      lod.items = src.items;
      scene.add(lod.mesh);
      P[name + "L" + (i + 1)] = lod;
      near = far;
    });
  }
  let adMesh = null;
  if (ads && adItems.length + streetAds.length)
    adMesh = billboardFaces(scene, [...adItems, ...streetAds], ads);
  if (P.blade?.items.length) bladeFaces(scene, P.blade.items); // (night r5)

  // traffic light phase (shared with the traffic sim and the crowd's walk signals)
  const CYCLE = 40;
  const phase = (t, axis) => {
    const c = ((t % CYCLE) + CYCLE) % CYCLE;
    if (axis === "av") return c < 22 ? 2 : c < 25 ? 1 : 0;
    return c < 26 ? 0 : c < 37 ? 2 : c < 39 ? 1 : 0;
  };
  let lastPhase = "",
    rr = 0;
  // throwable props: [pool name, mass kg, bounding size m]
  const GRAB = [
    ["trash", 25, [0.62, 0.95, 0.62]],
    ["newsbox", 30, [2.0, 1.4, 0.5]],
    ["cone", 3, [0.4, 0.75, 0.4]],
    ["drum", 40, [0.6, 1.0, 0.6]],
    ["planter", 120, [1.2, 0.6, 0.9]],
    ["mailbox", 60, [0.52, 1.25, 0.52]],
    ["bench", 70, [2.0, 0.9, 0.7]],
  ];
  const grabRef = (id) => {
    const [k, i] = String(id).split(":");
    const pool = P[k];
    const it = pool?.items[+i];
    return it ? { pool, it } : null;
  };
  {
    // (contactAO, lighting2 r3) user: 'things in shadow should still make diffuse darker shadows, like under the cars'.
    // One batched soft dark footprint decal pool under every ground-standing street prop (the car decals' look, see
    // vehicleLighting.ts): 1 draw call, no shadow pass, distance-culled like the props, scene alpha (SSR weight) untouched.
    const cv = document.createElement("canvas");
    cv.width = cv.height = 64;
    const g2 = cv.getContext("2d"),
      gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(0,0,0,0.7)");
    gr.addColorStop(0.45, "rgba(0,0,0,0.5)");
    gr.addColorStop(0.8, "rgba(0,0,0,0.14)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g2.fillStyle = gr;
    g2.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const am = new THREE.MeshBasicMaterial({
      map: tex,
      color: 0x000000,
      transparent: true,
      depthWrite: false,
      fog: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -3,
    });
    const ag = new THREE.PlaneGeometry(1, 1)
      .rotateX(-Math.PI / 2)
      .translate(0, 0.04, 0);
    // footprint (x, z) in metres per prop type (a soft ellipse a bit larger than the base)
    const FP = {
      bench: [2.3, 1.3],
      planter: [1.7, 1.4],
      trash: [1.0, 1.0],
      hydrant: [0.85, 0.85],
      mailbox: [0.95, 0.95],
      news: [2.6, 1.8],
      kiosk: [1.2, 0.8],
      cart: [2.4, 1.5],
      shelter: [4.4, 2.2],
      newsbox: [2.3, 1.0],
      lamp: [0.9, 0.9],
      mast: [1.0, 1.0],
      post: [0.65, 0.65],
      bikerack: [2.0, 0.9],
      bike: [2.0, 0.9],
      barrier: [2.3, 1.0],
      bags: [1.6, 1.2],
      meter: [0.5, 0.5],
      bikekiosk: [1.6, 1.0],
      dock: [2.0, 1.0],
      cone: [0.6, 0.6],
    };
    let n = 0;
    for (const k in FP) n += P[k]?.items.length ?? 0;
    if (n) {
      const aoP = new Pool(ag, am, {
        name: "propContactAO",
        max: Math.min(n, 6000),
        far: 200,
        castShadow: false,
        receiveShadow: false,
      });
      for (const k in FP)
        for (const it of P[k]?.items ?? [])
          if (it.y < 1.5)
            aoP.add(it.x, it.y, it.z, it.ry, 1, null, null, [
              FP[k][0],
              1,
              FP[k][1],
            ]);
      aoP.mesh.renderOrder = -1;
      P.propContactAO = aoP;
      scene.add(aoP.mesh);
    }
  }
  {
    // (night r4) blade-sign lightboxes glow onto the wall / sidewalk around them: a small warm point light inside the box
    // (local 0, 4.3, 0.7) for the nearest BL_N signs within BL_R of the camera; no allocation per frame
    const BL_R = 70,
      BL_N = 16;
    const rec = {
      type: "point",
      pos: [0, 0, 0],
      color: [1, 0.9, 0.77],
      intensity: 2.2,
      range: 6,
      radius: 0.5,
      volume: 0.1,
    };
    const near = new Array(BL_N).fill(null),
      nearD = new Float32Array(BL_N),
      nearI = new Int32Array(BL_N),
      WARM = [1, 0.9, 0.77];
    const _bc = new THREE.Color();
    cityLights.addProvider((emit, camera) => {
      const items = P.blade?.items;
      if (!items?.length || nightK.value < 0.01) return;
      const cx = camera.position.x,
        cz = camera.position.z;
      let n = 0,
        worst = 0;
      for (let ii = 0; ii < items.length; ii++) {
        const it = items[ii],
          dx = it.x - cx,
          dz = it.z - cz,
          d2 = dx * dx + dz * dz;
        if (d2 > BL_R * BL_R || it.hidden) continue;
        if (n < BL_N) {
          near[n] = it;
          nearI[n] = ii;
          nearD[n++] = d2;
          if (d2 > nearD[worst]) worst = n - 1;
          else if (n === 1) worst = 0;
          continue;
        }
        if (d2 >= nearD[worst]) continue;
        near[worst] = it;
        nearI[worst] = ii;
        nearD[worst] = d2;
        for (let k = 0; k < BL_N; k++) if (nearD[k] > nearD[worst]) worst = k;
      }
      for (let k = 0; k < n; k++) {
        const it = near[k],
          sn = Math.sin(it.ry || 0),
          cs = Math.cos(it.ry || 0);
        rec.pos[0] = it.x + 0.7 * sn;
        rec.pos[1] = (it.y || 0) + 4.3;
        rec.pos[2] = it.z + 0.7 * cs;
        const bc = bladeSignCol[nearI[k]] ?? WARM; // (night r5) the board's colour (linear), lifted toward white a little
        rec.color = _bc.setRGB(
          0.35 + 0.65 * bc[0],
          0.35 + 0.65 * bc[1],
          0.35 + 0.65 * bc[2],
          THREE.LinearSRGBColorSpace,
        );
        emit(rec);
      }
    });
  }
  {
    // (night) traffic signals cast their lens colour (cityLights.ts): one small spot per signal near the camera, from
    // the lit lenses (mast: between the two arm heads over the road; post: the pole head) aimed along the lens axis and
    // down, so the wet road under / ahead of it picks up a red / amber / green sheen (GGX highlight streaks on the wet
    // asphalt) and nearby cars / people a faint tint. Only the nearest SIG_N within RED_SIGNAL; no allocation per frame.
    const RED_SIGNAL = 80,
      SIG_N = 16,
      SIG_COL = [0xff2412, 0xffa01e, 0x2cffa8];
    const rec = {
      type: "spot",
      pos: [0, 0, 0],
      dir: [1, -0.5, 0],
      color: 0xffffff,
      intensity: 4,
      range: 12,
      angle: 0.9,
      penumbra: 0.8,
      radius: 0.7,
      volume: 0.1,
      shadow: false,
    }; // radius: soft wet-road highlight, not a pin-point
    const near = new Array(SIG_N).fill(null),
      nearD = new Float32Array(SIG_N);
    cityLights.addProvider((emit, camera) => {
      if (!signals.length || nightK.value < 0.01) return;
      const cx = camera.position.x,
        cz = camera.position.z;
      let n = 0,
        worst = 0;
      for (const sg of signals) {
        // keep the SIG_N nearest (insertion into a small fixed list)
        const it = sg.it,
          dx = it.x - cx,
          dz = it.z - cz,
          d2 = dx * dx + dz * dz;
        if (d2 > RED_SIGNAL * RED_SIGNAL || it.hidden) continue;
        if (n < SIG_N) {
          near[n] = sg;
          nearD[n++] = d2;
          if (d2 > nearD[worst]) worst = n - 1;
          else if (n === 1) worst = 0;
          continue;
        }
        if (d2 >= nearD[worst]) continue;
        near[worst] = sg;
        nearD[worst] = d2;
        for (let k = 0; k < SIG_N; k++) if (nearD[k] > nearD[worst]) worst = k;
      }
      for (let k = 0; k < n; k++) {
        const sg = near[k],
          it = sg.it,
          cs = Math.cos(it.ry || 0),
          sn = Math.sin(it.ry || 0);
        const lx = 0.45,
          lz = sg.mast ? 5.9 : 0,
          ly = sg.mast ? 5.1 : 3.4;
        rec.pos[0] = it.x + lx * cs + lz * sn;
        rec.pos[1] = (it.y || 0) + ly;
        rec.pos[2] = it.z - lx * sn + lz * cs;
        rec.dir[0] = cs;
        rec.dir[1] = -0.55;
        rec.dir[2] = -sn;
        rec.color =
          SIG_COL[Math.max(0, Math.min(2, Math.round(it.extra?.aState ?? 0)))];
        rec.intensity = sg.mast ? 4.5 : 2.5;
        rec.range = sg.mast ? 13 : 9;
        emit(rec);
      }
    });
  }
  const pools = Object.values(P);
  const itemsOf = (pool) =>
    pool
      ? pool.items.map((it) => ({ x: it.x, y: it.y, z: it.z, ry: it.ry }))
      : [];
  for (const t of GC_TREE_SPOTS) treeSpots.push(t); // (street r3) Park Av podium roof garden (leaf-card shrubs/trees)
  return {
    pools,
    treeSpots,
    phase,
    signals,
    vents,
    roads,
    benches: () => itemsOf(P.bench),
    carts: () => itemsOf(P.cart),
    busStops: () => [
      ...itemsOf(P.busstop).map((o) => ({ ...o, kind: "sign" })),
      ...itemsOf(P.shelter).map((o) => ({ ...o, kind: "shelter" })),
    ], // (peds r4) bus-stop queues (npc/crowd.ts)
    // combat throwables from the real street props: grabbables(center, radius) -> [{id, pos, ry, kind, mass, size}];
    // grab(id) hides the rendered instance (combat animates its own thrown copy), release(id) restores it.
    grabbables(center, radius = 12) {
      const out = [],
        r2 = radius * radius;
      for (const [kind, mass, size] of GRAB) {
        const pool = P[kind];
        if (!pool) continue;
        const items = pool.items;
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          if (it.hidden || it.y > 1) continue;
          const dx = it.x - center.x,
            dz = it.z - center.z;
          if (dx * dx + dz * dz > r2) continue;
          out.push({
            id: kind + ":" + i,
            kind,
            mass,
            size,
            pos: new THREE.Vector3(it.x, it.y, it.z),
            ry: it.ry,
            pool: pool.mesh.name,
            index: i,
          });
        }
      }
      return out;
    },
    grab(id) {
      const g = grabRef(id);
      if (g) g.pool.hide(g.it);
      return !!g;
    },
    release(id) {
      const g = grabRef(id);
      if (g) g.pool.show(g.it);
      return !!g;
    },
    // zip / perch anchors (consumed by zippoints.addPropAnchors -> world.getZipPoints) — C2
    anchors: () => anchors,
    propAnchors: () => anchors,
    update(dt, camPos, time) {
      steamTime.value = time;
      const ph =
        phase(time, "av") +
        ":" +
        phase(time, "st") +
        ":" +
        mapPhase(time, "av") +
        mapPhase(time, "st"); // (citylife junctions r2)
      const force = ph !== lastPhase;
      if (force) {
        lastPhase = ph;
        for (const s of signals)
          s.it.extra.aState = (s.map ? mapPhase : phase)(time, s.axis);
      }
      // repack budget: signal pools on a phase change, then the most overdue pools until ~0.6 ms is spent
      if (force) {
        P.mast?.update(camPos, true);
        P.post?.update(camPos, true);
      }
      const t0 = performance.now();
      for (let i = 0; i < pools.length; i++) {
        const p = pools[(rr + i) % pools.length];
        if (!p.due(camPos)) continue;
        p.update(camPos);
        if (performance.now() - t0 > 0.6) {
          rr = (rr + i + 1) % pools.length;
          break;
        }
      }
      if (adMesh) adMesh.update(camPos);
    },
  };
}
