// @ts-nocheck
// ------------------------------------------------------------------ rooftops
export function placeRooftops({
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
}) {
  // occupancy of things already standing on roofs (bulkheads, water towers, equipment from buildings.ts)
  const C = 16,
    occ = new Map();
  const key = (x, z) => Math.floor(x / C) * 100003 + Math.floor(z / C);
  if (S) {
    for (let i = 0; i < S.t.length; i++) {
      const j = i * 6,
        y0 = S.b[j + 1];
      if (y0 < 3) continue;
      const x0 = S.b[j],
        z0 = S.b[j + 2],
        x1 = S.b[j + 3],
        z1 = S.b[j + 5];
      for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++)
        for (let gz = Math.floor(z0 / C); gz <= Math.floor(z1 / C); gz++) {
          const k = gx * 100003 + gz;
          let a = occ.get(k);
          if (!a) occ.set(k, (a = []));
          a.push(x0, y0, z0, x1, S.b[j + 4], z1);
        }
    }
  }
  const mine = [];
  const hit = (x0, z0, x1, z1, y) => {
    for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++)
      for (let gz = Math.floor(z0 / C); gz <= Math.floor(z1 / C); gz++) {
        const a = occ.get(gx * 100003 + gz);
        if (!a) continue;
        for (let i = 0; i < a.length; i += 6)
          if (
            a[i + 1] > y - 0.1 &&
            a[i + 1] < y + 6 &&
            x1 > a[i] &&
            x0 < a[i + 3] &&
            z1 > a[i + 2] &&
            z0 < a[i + 5]
          )
            return true;
      }
    for (const m of mine)
      if (
        x1 > m[0] &&
        x0 < m[2] &&
        z1 > m[1] &&
        z0 < m[3] &&
        Math.abs(m[4] - y) < 1
      )
        return true;
    return false;
  };
  const WHITE = 0xffffff;
  // try to put a footprint (hx, hz half sizes in local frame, ry multiple of 90deg) somewhere on the roof rect
  const tryPlace = (m, hx, hz, ry, margin, fn) => {
    const sw = Math.abs(Math.sin(ry)) > 0.5;
    const ex = sw ? hz : hx,
      ez = sw ? hx : hz;
    const x0 = m.x0 + margin + ex,
      x1 = m.x1 - margin - ex,
      z0 = m.z0 + margin + ez,
      z1 = m.z1 - margin - ez;
    if (x1 <= x0 || z1 <= z0) return false;
    for (let k = 0; k < 6; k++) {
      const x = x0 + rnd() * (x1 - x0),
        z = z0 + rnd() * (z1 - z0);
      if (hit(x - ex - 0.3, z - ez - 0.3, x + ex + 0.3, z + ez + 0.3, m.y1))
        continue;
      mine.push([x - ex, z - ez, x + ex, z + ez, m.y1]);
      fn(x, z);
      return true;
    }
    return false;
  };
  const R4 = () => (Math.floor(rnd() * 4) * Math.PI) / 2;
  for (const bld of buildings) {
    const tm = bld.masses[bld.masses.length - 1];
    if (!tm) continue;
    const w = tm.x1 - tm.x0,
      d = tm.z1 - tm.z0,
      area = w * d;
    if (w < 5 || d < 5) continue;
    const y = tm.y1,
      marg = 0.9 + (tm.parapet ? 0.3 : 0);
    const glass = bld.A.type === "glass";
    const put = (pool, x, z, ry) => place(pool, x, z, ry, WHITE, {}, y);
    // HVAC
    // rooftops agent: roofs dressed by rooftops.ts (bld.roofKit: varied, clustered kit) get at most one of these units,
    // tinted in muted greys (the white twin-fan unit stamped on every roof read as obvious repetition from above)
    const kit = !!bld.roofKit;
    const nH = kit
      ? rnd() < 0.35
        ? 1
        : 0
      : Math.min(4, Math.floor(area / 260 + rnd() * 1.5));
    const hTint = kit
      ? [0x9c9b95, 0x8f9493, 0xa39c8e, 0x878b88, 0xb0ada4][
          Math.floor(rnd() * 5)
        ]
      : WHITE;
    for (let i = 0; i < nH; i++) {
      const ry = R4();
      tryPlace(tm, 1.7, 0.75, ry, marg, (x, z) => {
        const it = place(P.hvac, x, z, ry, hTint, {}, y);
        sBox(it, -1.2, 0, -0.7, 1.2, 1.4, 0.7, "equipment");
      });
    }
    // vent clusters
    const nV = 1 + Math.floor(rnd() * (area > 400 ? 3 : 2));
    for (let i = 0; i < nV; i++) {
      const ry = R4();
      tryPlace(tm, 1.1, 0.7, ry, marg, (x, z) => {
        const it = put(P.vents, x, z, ry);
        sBox(it, 0.1, 0, -0.55, 0.9, 0.35, 0.15, "equipment");
      });
    }
    // satellite dishes (point roughly south, slightly varied)
    if (!glass && rnd() < 0.5) {
      const n = 1 + Math.floor(rnd() * 2);
      for (let i = 0; i < n; i++)
        tryPlace(tm, 0.6, 0.6, 0, marg, (x, z) => {
          const it = place(P.dish, x, z, (rnd() - 0.5) * 0.8, WHITE, {}, y);
          sCyl(it, 0, 0, 0, 0.9, 0.06, "antenna");
        });
    }
    // radio antenna masts
    if (bld.H > 35 && rnd() < 0.22) {
      tryPlace(tm, 0.4, 0.4, 0, marg + 1, (x, z) => {
        const it = put(P.antenna, x, z, rnd() * 6);
        sCyl(it, 0, 0, 0, 7.2, 0.12, "antenna");
        anchor(it, 0, 7.2, 0, "antenna");
      });
    }
    // terrace gardens on low/mid-rise residential roofs
    if (!glass && !kit && bld.H < 90 && w > 9 && d > 7 && rnd() < 0.14) {
      // rooftops agent: !kit (rooftops.ts builds modelled gardens)
      const ry = R4();
      tryPlace(tm, 3.1, 2.1, ry, marg, (x, z) => {
        const it = put(P.garden, x, z, ry);
        sBox(it, -3, 0, -2, 3, 0.08, 2, "roof");
        sBox(it, -3, 0, -2, 3, 0.62, -1.55, "equipment");
        sBox(it, -3, 0, 1.55, 3, 0.62, 2, "equipment");
        sBox(it, 2.55, 0, -1.55, 3, 0.62, 1.55, "equipment");
        // chain-link fence along the far side of the terrace
        const c = Math.cos(ry),
          s = Math.sin(ry);
        for (const lx of [-1.5, 1.5]) {
          const fx = x + lx * c + -2.3 * s,
            fz = z - lx * s + -2.3 * c;
          place(P.fence, fx, fz, ry, WHITE, {}, y);
        }
      });
    }
    // billboard facing an avenue (low/mid-rise, ~8% of buildings)
    if (
      ads &&
      !glass &&
      bld.H > 12 &&
      bld.H < 45 &&
      rnd() < 0.08 &&
      Math.max(w, d) > 12
    ) {
      // choose the face nearest an avenue (x faces) or a street
      const ax = Math.round(((tm.x0 + tm.x1) / 2 + 1500) / 250) * 250 - 1500;
      const faceE = ax > (tm.x0 + tm.x1) / 2;
      const ry = faceE ? Math.PI / 2 : -Math.PI / 2; // local +z (ad face) toward the avenue
      const x = faceE ? tm.x1 - 2.2 : tm.x0 + 2.2,
        z = (tm.z0 + tm.z1) / 2;
      if (d > 11 && !hit(x - 1.5, z - 5.2, x + 1.5, z + 5.2, y)) {
        const it = put(P.billboard, x, z, ry);
        mine.push([x - 1.5, z - 5.2, x + 1.5, z + 5.2, y]);
        sBox(it, -5.1, 3.8, -0.12, 5.1, 8.4, 0.12, "equipment");
        sBox(it, -5, 3.65, 0, 5, 3.7, 0.9, "equipment", 1);
        adItems.push({ x, y, z, ry, ad: Math.floor(rnd() * ads.n) });
        anchor(it, -5, 8.4, 0, "roofCorner");
        anchor(it, 5, 8.4, 0, "roofCorner");
      }
    }
  }
}
