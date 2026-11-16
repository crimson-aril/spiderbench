// @ts-nocheck
import * as THREE from "three";
import { assetUrl } from "../../assets.ts";
import { interleaveVertexAttributes } from "../../render/vertexPacking.ts";
import { MeshBuilder } from "../meshBuilder.ts";
import { MATERIAL_PART } from "../partMaterials.ts";

// ------------------------------------------------------------------ far LODs
// Automatic far LOD for a (Blender) prop: the footprint is split into n x n columns; each occupied column becomes one
// box spanning the column's actual xz/y extent, coloured with the area-weighted mean vertex colour. Columns with a
// similar y-span are merged, so a boxy HVAC unit collapses to 1-2 boxes (10-20 tris) and a mast stays a thin pole.
export function autoLod(geo, n = 2) {
  const P = geo.attributes.position,
    C = geo.attributes.color,
    I = geo.index;
  if (!geo.boundingBox) geo.computeBoundingBox();
  const bb = geo.boundingBox,
    sx = (bb.max.x - bb.min.x) / n || 1,
    sz = (bb.max.z - bb.min.z) / n || 1;
  const cols = Array.from({ length: n * n }, () => ({
    x0: 1e9,
    x1: -1e9,
    y0: 1e9,
    y1: -1e9,
    z0: 1e9,
    z1: -1e9,
    a: 0,
    c: [0, 0, 0],
  }));
  const nt = I ? I.count / 3 : P.count / 3;
  const va = new THREE.Vector3(),
    vb = new THREE.Vector3(),
    vc = new THREE.Vector3(),
    e1 = new THREE.Vector3(),
    e2 = new THREE.Vector3();
  for (let t = 0; t < nt; t++) {
    const ia = I ? I.getX(t * 3) : t * 3,
      ib = I ? I.getX(t * 3 + 1) : t * 3 + 1,
      ic = I ? I.getX(t * 3 + 2) : t * 3 + 2;
    va.fromBufferAttribute(P, ia);
    vb.fromBufferAttribute(P, ib);
    vc.fromBufferAttribute(P, ic);
    const area =
      e1.subVectors(vb, va).cross(e2.subVectors(vc, va)).length() / 2;
    const cx = (va.x + vb.x + vc.x) / 3,
      cz = (va.z + vb.z + vc.z) / 3;
    const gx = Math.min(n - 1, Math.max(0, Math.floor((cx - bb.min.x) / sx))),
      gz = Math.min(n - 1, Math.max(0, Math.floor((cz - bb.min.z) / sz)));
    const q = cols[gx * n + gz];
    for (const v of [va, vb, vc]) {
      q.x0 = Math.min(q.x0, v.x);
      q.x1 = Math.max(q.x1, v.x);
      q.y0 = Math.min(q.y0, v.y);
      q.y1 = Math.max(q.y1, v.y);
      q.z0 = Math.min(q.z0, v.z);
      q.z1 = Math.max(q.z1, v.z);
    }
    q.a += area;
    if (C)
      for (let k = 0; k < 3; k++)
        q.c[k] +=
          (area *
            (C.getComponent(ia, k) +
              C.getComponent(ib, k) +
              C.getComponent(ic, k))) /
          3;
  }
  let boxes = cols
    .filter((q) => q.a > 0)
    .map((q) => ({ ...q, c: q.c.map((v) => v / q.a) }));
  // merge columns whose y-spans agree (boxy objects -> one box)
  const H = bb.max.y - bb.min.y;
  if (
    boxes.length > 1 &&
    boxes.every(
      (q) =>
        Math.abs(q.y1 - boxes[0].y1) < H * 0.15 &&
        Math.abs(q.y0 - boxes[0].y0) < H * 0.15,
    )
  ) {
    const A = boxes.reduce((s, q) => s + q.a, 0);
    boxes = [
      {
        x0: Math.min(...boxes.map((q) => q.x0)),
        x1: Math.max(...boxes.map((q) => q.x1)),
        y0: Math.min(...boxes.map((q) => q.y0)),
        y1: Math.max(...boxes.map((q) => q.y1)),
        z0: Math.min(...boxes.map((q) => q.z0)),
        z1: Math.max(...boxes.map((q) => q.z1)),
        c: [0, 1, 2].map(
          (k) => boxes.reduce((s, q) => s + q.c[k] * q.a, 0) / A,
        ),
      },
    ];
  }
  const b = new MeshBuilder();
  for (const q of boxes) {
    const w = Math.max(0.06, q.x1 - q.x0),
      d = Math.max(0.06, q.z1 - q.z0);
    const cx = (q.x0 + q.x1) / 2,
      cz = (q.z0 + q.z1) / 2;
    // a little darker than the mean (the mean includes lit tops; the box sides read brighter than the real clutter)
    b.setPart(MATERIAL_PART.BASE)
      .setColor(q.c.map((v) => v * 0.85))
      .box(
        cx - w / 2,
        q.y0,
        cz - d / 2,
        cx + w / 2,
        q.y1,
        cz + d / 2,
        0b110111,
      );
  }
  return b.build({ part: true });
}

// Blender-built props (tools/blender/city_props.py): {name: BufferGeometry with color + aPart}
export async function loadPropModels() {
  try {
    const { GLTFLoader } =
      await import("three/examples/jsm/loaders/GLTFLoader.js");
    const gltf = await new GLTFLoader().loadAsync(assetUrl("city/props/props.gltf"));
    const geos = {};
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return;
      const g = o.geometry;
      const uv1 = g.attributes.uv1;
      const part = new Float32Array(g.attributes.position.count);
      for (let i = 0; i < part.length; i++) part[i] = Math.round(uv1.getX(i));
      g.setAttribute("aPart", new THREE.BufferAttribute(part, 1));
      g.deleteAttribute("uv1");
      if (g.attributes.color && g.attributes.color.itemSize === 4) {
        // rgb only (alpha is always 1)
        const c = g.attributes.color,
          a = new Float32Array(c.count * 3);
        for (let i = 0; i < c.count; i++) {
          a[i * 3] = c.getX(i);
          a[i * 3 + 1] = c.getY(i);
          a[i * 3 + 2] = c.getZ(i);
        }
        g.setAttribute("color", new THREE.BufferAttribute(a, 3));
      }
      g.applyMatrix4(o.matrixWorld);
      g.computeBoundingSphere();
      geos[o.name] = interleaveVertexAttributes(g);
    });
    return geos;
  } catch (e) {
    console.warn(
      "[city] city/props/props.gltf not available (run tools/blender/city_props.py)",
      e,
    );
    return {};
  }
}

// Billboard ads (fictional in-universe brands), drawn once into a 2x4 atlas
export function adAtlas() {
  const W = 1024,
    H = 410,
    cv = document.createElement("canvas");
  cv.width = W * 2;
  cv.height = H * 4;
  const g = cv.getContext("2d");
  const ads = [
    {
      bg: ["#101014", "#2a2a30"],
      fg: "#f4f1e8",
      acc: "#d11f1f",
      t1: "THE DAILY BUGLE",
      t2: "SPIDER-MAN: HERO OR MENACE?",
      t3: "Read J. Jonah Jameson every morning",
    },
    {
      bg: ["#0d3b2e", "#1f7a58"],
      fg: "#e9fff4",
      acc: "#9df0c8",
      t1: "OSCORP",
      t2: "TOMORROW, TODAY.",
      t3: "Innovation for a better New York",
    },
    {
      bg: ["#f0b21a", "#e2721b"],
      fg: "#1b1b1b",
      acc: "#ffffff",
      t1: "ROXXON",
      t2: "ENERGY THAT MOVES THE CITY",
      t3: "Fueling 5 boroughs since 1932",
    },
    {
      bg: ["#1b2f6b", "#3d62c9"],
      fg: "#ffffff",
      acc: "#ffcf33",
      t1: "ALCHEMAX",
      t2: "THE FUTURE IS PERSONAL",
      t3: "Now hiring at Alchemax Labs",
    },
    {
      bg: ["#b3121a", "#e8343c"],
      fg: "#ffffff",
      acc: "#ffe066",
      t1: "JOE'S PIZZA",
      t2: "A SLICE OF NEW YORK",
      t3: "Open late - 1435 Broadway",
    },
    {
      bg: ["#f3efe4", "#d9d2c0"],
      fg: "#16233f",
      acc: "#c0392b",
      t1: "AUNT MAY'S F.E.A.S.T.",
      t2: "VOLUNTEER THIS WEEKEND",
      t3: "Food. Shelter. Hope. Lower East Side",
    },
    {
      bg: ["#12121a", "#3b1d5a"],
      fg: "#f0e6ff",
      acc: "#ff5ec4",
      t1: "BROADWAY NIGHTS",
      t2: "THE MUSICAL EVERYONE'S TALKING ABOUT",
      t3: "Tickets at the box office",
    },
    {
      bg: ["#0e5ea8", "#39a0e6"],
      fg: "#ffffff",
      acc: "#ffffff",
      t1: "VISIT CONEY ISLAND",
      t2: "SUMMER NEVER ENDS",
      t3: "Take the D, F, N or Q",
    },
  ];
  ads.forEach((a, i) => {
    const x = (i % 2) * W,
      y = Math.floor(i / 2) * H;
    const gr = g.createLinearGradient(x, y, x + W, y + H);
    gr.addColorStop(0, a.bg[0]);
    gr.addColorStop(1, a.bg[1]);
    g.fillStyle = gr;
    g.fillRect(x, y, W, H);
    g.fillStyle = a.acc;
    g.fillRect(x + 40, y + 250, W * 0.35, 10);
    g.fillStyle = a.fg;
    g.textBaseline = "alphabetic";
    g.font = 'bold 120px Impact, "Arial Black", sans-serif';
    g.fillText(a.t1, x + 40, y + 150, W - 80);
    g.font = 'bold 44px "Arial Black", Arial, sans-serif';
    g.fillText(a.t2, x + 40, y + 228, W - 80);
    g.font = "32px Arial, sans-serif";
    g.globalAlpha = 0.85;
    g.fillText(a.t3, x + 40, y + 330, W - 80);
    g.globalAlpha = 1;
    // grime + panel seams
    g.fillStyle = "rgba(0,0,0,0.12)";
    for (let k = 1; k < 6; k++) g.fillRect(x + (W / 6) * k, y, 2, H);
    const vg = g.createLinearGradient(x, y + H * 0.6, x, y + H);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(40,30,20,0.25)");
    g.fillStyle = vg;
    g.fillRect(x, y, W, H);
  });
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, n: ads.length };
}
