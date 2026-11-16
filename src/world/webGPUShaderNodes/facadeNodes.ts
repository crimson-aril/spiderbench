// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";
import { nightK } from "../../render/daynight.ts";

const facadeNodeData = new WeakMap();

const smoothMask = (value, lo, hi) =>
  TSL.float(1).sub(TSL.smoothstep(lo, hi, value));

const num = (v) => (typeof v === "number" ? TSL.float(v) : v);
const asFloat = (condition) => TSL.select(condition, TSL.float(1), TSL.float(0));

/**
 * Port of boxAA() from facade-frag_decl.frag: coverage of [a, b] over the pixel
 * footprint [x - w/2, x + w/2]. Window edges therefore stay one pixel wide at any
 * distance instead of using a fixed-width smoothstep in facade space.
 */
const boxAA = (x, a, b, w) => {
  const width = num(w).mul(1.2);
  const half = width.mul(0.5);
  return TSL.min(num(b), x.add(half))
    .sub(TSL.max(num(a), x.sub(half)))
    .div(width)
    .clamp(0, 1);
};

/** Port of fh1() from facade-frag_decl.frag (per-cell hash). */
const fh1 = (p) => {
  const q = TSL.fract(p.mul(TSL.vec2(123.34, 456.21)));
  const r = q.add(TSL.dot(q, q.add(45.32)));
  return TSL.fract(r.x.mul(r.y));
};

/**
 * TSL port of the city's GLSL facade shader (facade-frag_decl.frag).
 *
 * Ported from the GLSL: per-building layer re-skin (LwT), per-building tone
 * (bTone), world-space tone noise (nz / nz2), brick mortar + AO from the height
 * atlas (hao), the street-grime ramp, window geometry derived from the same
 * vertex attributes (aF / aS / aW / aX), the `valid` extent mask, parallax glass
 * plane + reveal, sash / transom / muntin frame, stone sills and heads, curtain
 * wall spandrels and mullion caps.
 *
 * Not ported (needs separate work, see summary): normal / detail maps, signage
 * atlas, storefront zoning, full street-zone wall treatments / paired sashes,
 * grime decals and A/C units.
 */
export function createFacadeNodeMaterial(T) {
  const facadeProbe = new URLSearchParams(window.location.search).get("lprobe");
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0xffffff,
    roughness: 0.82,
    metalness: 0,
  });
  material.name = "CityFacade.TSL";

  const night = TSL.uniform(nightK.value);
  night.onRenderUpdate(() => {
    night.value = nightK.value;
  });

  const facade = TSL.varying(TSL.uv(), "vFacadeUv");
  const face = TSL.varying(TSL.attribute("aF", "vec4"), "vFacadeF");
  const styleData = TSL.varying(TSL.attribute("aS", "vec4"), "vFacadeS");
  const dimensions = TSL.varying(TSL.attribute("aW", "vec4"), "vFacadeW");
  // aX = (resid, lintel, glass type, reveal depth); the WebGL2 shader reads it as vX.
  const extra = TSL.varying(TSL.attribute("aX", "vec4"), "vFacadeX");
  const tint = TSL.varying(TSL.attribute("aTint", "vec3"), "vFacadeTint");
  const worldPosition = TSL.positionWorld;
  const worldNormal = TSL.normalize(TSL.normalWorld);

  const packedLayer = styleData.x;
  const baseLayer = TSL.mod(packedLayer, 16);
  const seed = styleData.y;
  const style = styleData.w;
  const floorHeight = face.x.max(0.5);
  const bayWidth = face.y.max(0.5);
  const baseY = dimensions.z;
  const y = facade.y.sub(baseY);
  const faceWidth = dimensions.x.max(1);
  const floorToStreet = styleData.z.abs();
  const topY = dimensions.y.sub(baseY).max(1);

  const roofFace = worldNormal.y.greaterThan(0.5);
  const underside = worldNormal.y.lessThan(-0.5);
  const inBase = (lo, hi) => baseLayer.greaterThan(lo).and(baseLayer.lessThan(hi));

  // (GLSL LwT) a per-building hash re-skins some walls to a different texture layer.
  // Zoning logic keeps using the original layer (baseLayer); only the texture follows.
  const reskin = TSL.fract(seed.mul(9.271).add(0.137));
  const buildingHeight = dimensions.y.sub(dimensions.z);
  const toTerracotta = inBase(2.5, 3.5)
    .and(tint.x.sub(tint.z).greaterThan(0.18))
    .and(reskin.lessThan(0.8))
    .or(inBase(1.5, 2.5).and(reskin.lessThan(0.18)));
  const toStucco = inBase(3.5, 4.5)
    .or(inBase(6.5, 7.5))
    .and(buildingHeight.lessThan(30))
    .and(reskin.lessThan(0.4));
  let sideLayer = baseLayer;
  sideLayer = TSL.select(inBase(1.5, 2.5).and(reskin.greaterThanEqual(0.36)).and(reskin.lessThan(0.5)), TSL.float(15), sideLayer);
  sideLayer = TSL.select(inBase(1.5, 2.5).and(reskin.greaterThanEqual(0.18)).and(reskin.lessThan(0.36)), TSL.float(1), sideLayer);
  sideLayer = TSL.select(toStucco, TSL.float(14), sideLayer);
  sideLayer = TSL.select(toTerracotta, TSL.float(13), sideLayer);
  sideLayer = TSL.select(baseLayer.lessThan(0.5).and(reskin.lessThan(0.45)), TSL.float(15), sideLayer);

  const roofLayer = TSL.select(
    inBase(9.5, 10.5),
    TSL.float(8),
    TSL.select(inBase(4.5, 5.5), TSL.float(8), baseLayer),
  );
  const layer = TSL.select(roofFace, roofLayer, sideLayer);
  // The layer travels through an interpolated varying; round instead of truncating so a
  // value like 2.9999998 cannot fetch layer 2 instead of 3.
  const layerIndex = TSL.int(layer.add(0.5).floor());

  // Match the source facade atlas' material scale per layer (matches layerScale() in GLSL).
  let scale = TSL.float(4);
  scale = TSL.select(layer.greaterThan(12.5), TSL.float(3), scale);
  scale = TSL.select(layer.greaterThan(13.5), TSL.float(3), scale);
  scale = TSL.select(layer.greaterThan(14.5), TSL.float(1.8), scale);
  scale = TSL.select(layer.lessThan(2.5), TSL.float(1.8), scale);
  scale = TSL.select(layer.greaterThan(2.5).and(layer.lessThan(3.5)), TSL.float(3), scale);
  scale = TSL.select(layer.greaterThan(3.5).and(layer.lessThan(4.5)), TSL.float(4), scale);
  scale = TSL.select(layer.greaterThan(4.5).and(layer.lessThan(5.5)), TSL.float(3), scale);
  scale = TSL.select(layer.greaterThan(5.5).and(layer.lessThan(6.5)), TSL.float(2), scale);
  scale = TSL.select(layer.greaterThan(6.5).and(layer.lessThan(7.5)), TSL.float(2.4), scale);
  scale = TSL.select(layer.greaterThan(7.5).and(layer.lessThan(8.5)), TSL.float(8), scale);
  scale = TSL.select(layer.greaterThan(8.5).and(layer.lessThan(9.5)), TSL.float(4), scale);
  scale = TSL.select(layer.greaterThan(9.5).and(layer.lessThan(11.5)), TSL.float(8), scale);

  const buildingOffset = TSL.vec2(
    TSL.fract(seed.mul(0.618)).mul(8),
    TSL.fract(seed.mul(0.377)).mul(8),
  );
  const wallUv = facade.add(buildingOffset).div(scale);
  const wallTextureSample = TSL.texture(T.wallsCol, wallUv).depth(layerIndex).rgb;

  // Height / AO atlas (tWallH in GLSL): r = relief height, g = baked AO. The WebGL2 shader
  // darkens recessed brick mortar from r and multiplies albedo by g. Without it the TSL wall is
  // the bare color texture. Guarded so a missing atlas leaves both terms at 1.
  const hao = T.wallsHao
    ? TSL.texture(T.wallsHao, wallUv).depth(layerIndex).rgb
    : TSL.vec3(1, 1, 1);
  const texelFootprint = TSL.min(
    TSL.length(TSL.dFdx(wallUv)),
    TSL.length(TSL.dFdy(wallUv)),
  ).mul(1024);
  const footprintFade = TSL.smoothstep(3, 10, texelFootprint);
  const brickLayer = layer.lessThan(2.5)
    .or(layer.greaterThan(14.5))
    .or(layer.greaterThan(6.5).and(layer.lessThan(7.5)));
  const mortarShade = TSL.mix(
    TSL.mix(TSL.float(0.62), TSL.float(0.8), footprintFade),
    TSL.float(1),
    TSL.smoothstep(0.28, 0.55, hao.r),
  );
  const mortar = TSL.select(brickLayer, mortarShade, TSL.float(1));
  const atlasAo = TSL.mix(
    TSL.float(1),
    hao.g,
    TSL.float(0.7).mul(TSL.float(1).sub(footprintFade.mul(0.3))),
  );

  // Wall color before per-building tone: bare texture x mortar x vertex tint x atlas AO.
  const wallBaseColor = wallTextureSample.mul(mortar).mul(tint).mul(atlasAo);

  // (GLSL nz / nz2) world-space tone noise, sampled at lod 0 like the WebGL2 shader.
  const nz = TSL.texture(
    T.noise,
    worldPosition.xz.div(180).add(worldPosition.y.div(300)),
  ).level(0).rgb;
  const nz2 = TSL.texture(
    T.noise,
    worldPosition.xz.div(23).add(worldPosition.y.div(41)).add(0.5),
  ).level(0).rgb;

  // (GLSL bTone) per-building value / warm-cool identity, brick cast and value drop.
  const toneValue = TSL.fract(seed.mul(13.73).add(0.29));
  const toneHue = TSL.fract(seed.mul(5.91).add(0.61)).mul(2).sub(1);
  const buildingTone = TSL.vec3(
    TSL.float(1).add(toneHue.mul(0.045)),
    TSL.float(1).add(toneHue.mul(0.008)),
    TSL.float(1).sub(toneHue.mul(0.05)),
  ).mul(TSL.float(0.91).add(toneValue.mul(0.18)));
  const castHash = TSL.fract(seed.mul(17.31).add(0.53));
  const brickCast = TSL.select(
    castHash.lessThan(0.2),
    TSL.vec3(0.9, 0.9, 0.92),
    TSL.select(
      castHash.lessThan(0.4),
      TSL.vec3(1.04, 0.95, 0.84),
      TSL.select(
        castHash.lessThan(0.55),
        TSL.vec3(1.08, 0.9, 0.8),
        TSL.select(
          castHash.lessThan(0.7),
          TSL.vec3(0.96, 0.97, 0.98).mul(0.92),
          TSL.vec3(1, 1, 1),
        ),
      ),
    ),
  );
  const valueDrop = TSL.fract(seed.mul(29.7));
  const masonryLayer = layer.lessThan(4.5).or(layer.greaterThan(12.5));
  const identityTone = TSL.select(
    brickLayer,
    buildingTone.mul(brickCast).mul(TSL.float(0.95).sub(valueDrop.mul(0.13))),
    TSL.select(
      masonryLayer,
      buildingTone.mul(TSL.float(0.93).sub(valueDrop.mul(0.08))),
      buildingTone,
    ),
  );
  const wallNoiseTone = TSL.float(0.88).add(nz.g.mul(0.24))
    .mul(TSL.float(0.93).add(nz2.r.mul(0.14)))
    .mul(TSL.float(1).sub(TSL.smoothstep(0.5, 0.85, nz.b).mul(0.14)));
  const sideTone = identityTone.mul(wallNoiseTone);
  const roofTone = TSL.float(0.8).add(nz.r.mul(0.4)).mul(TSL.float(0.9).add(nz2.g.mul(0.2)));
  const surfaceTone = TSL.select(
    roofFace,
    TSL.vec3(roofTone, roofTone, roofTone),
    TSL.select(underside, TSL.vec3(0.6, 0.6, 0.6), sideTone),
  );
  const wallWeatherColor = wallBaseColor.mul(surfaceTone);

  // Street grime ramp: GLSL mix(0.72, 1.0, smoothstep(0, 2.5, y)).
  const lowFloorGrime = TSL.mix(
    TSL.float(0.72),
    TSL.float(1),
    TSL.smoothstep(0, 2.5, y),
  );
  const wallGrimeColor = wallWeatherColor.mul(lowFloorGrime);

  // ---------------------------------------------------------------- window layout
  // Same derivation as the GLSL upper-floor block: bays from the usable width, one window per
  // bay sized by (winW, winH), vertical position by the curtain / punched offset.
  const activeWindows = style.greaterThan(0.5).and(style.lessThan(4.5));
  const activeF = asFloat(activeWindows);
  const curtain = style.greaterThan(1.5).and(style.lessThan(2.5));
  const ribbon = style.greaterThan(2.5).and(style.lessThan(3.5));
  const deco = style.greaterThan(3.5).and(style.lessThan(4.5));
  const punched = style.greaterThan(0.5).and(style.lessThan(1.5));
  const masonryZone = punched.and(baseLayer.lessThan(3.5)); // GLSL zOK

  const aw = TSL.max(TSL.fwidth(facade.x), 1e-4);
  const ah = TSL.max(TSL.fwidth(facade.y), 1e-4);
  // Keep sash details readable when a facade is only a few pixels wide.
  const frameWidthX = TSL.float(0.075).max(aw.mul(0.8));
  const frameWidthY = TSL.float(0.075).max(ah.mul(0.8));

  const margin = dimensions.w;
  const usableWidth = faceWidth.sub(margin.mul(2)).max(1);
  const bays = TSL.floor(usableWidth.div(bayWidth).add(0.5)).max(1);
  const bayWidthActual = usableWidth.div(bays);
  const ux = facade.x.sub(margin);
  const bayCoord = ux.div(bayWidthActual);
  const bayIndex = TSL.floor(bayCoord);
  const fx = ux.sub(bayIndex.mul(bayWidthActual));
  const yy = y.sub(floorToStreet);
  const floorCoord = yy.div(floorHeight);
  const floorIndex = TSL.floor(floorCoord);
  const fy = yy.sub(floorIndex.mul(floorHeight));
  const windowWidth = bayWidthActual.mul(face.z);
  const windowHeight = floorHeight.mul(face.w);
  const wx0 = bayWidthActual.sub(windowWidth).mul(0.5);
  const wy0 = floorHeight.sub(windowHeight).mul(TSL.select(curtain, TSL.float(0.72), TSL.float(0.42)));

  // Match the masonry tripartite zoning in facade-frag_decl.frag. The cap's
  // selected upper windows have arched heads; the base and shaft remain sash
  // windows. These same per-building hashes also drive the corner quoins.
  const zH1 = TSL.fract(seed.mul(2.37).add(0.11));
  const zH2 = TSL.fract(seed.mul(4.73).add(0.59));
  const zNf = TSL.floor(topY.sub(floorToStreet).div(floorHeight).add(0.01));
  const zBase = TSL.select(
    masonryZone.and(zNf.greaterThanEqual(5)),
    TSL.float(1).add(TSL.step(TSL.float(0.55), zH1).mul(TSL.step(TSL.float(9), zNf))),
    TSL.float(0),
  );
  const zCap = TSL.select(
    masonryZone.and(zNf.greaterThanEqual(6)),
    TSL.float(1).add(TSL.step(TSL.float(0.6), zH2).mul(TSL.step(TSL.float(11), zNf))),
    TSL.float(0),
  );
  const zCapY = zNf.sub(zCap).mul(floorHeight);
  const zInBase = masonryZone.and(floorIndex.lessThan(zBase));
  const zInCap = masonryZone.and(zCap.greaterThan(0)).and(yy.greaterThanEqual(zCapY));
  const zArch = zInCap.and(zH2.greaterThan(0.3)).and(zH2.lessThan(0.8));
  const archRadius = windowWidth.mul(0.5);
  const archCenterY = wy0.add(windowHeight).sub(archRadius);
  const archMaskAt = (x, yPos) => {
    const dx = x.sub(wx0).sub(archRadius);
    const dy = yPos.sub(archCenterY).max(0);
    const radius = TSL.vec2(dx, dy).length();
    return TSL.float(1).sub(TSL.smoothstep(archRadius.sub(aw), archRadius.add(aw), radius));
  };
  const archOpening = TSL.mix(TSL.float(1), archMaskAt(fx, fy), asFloat(zArch));

  // Windows only inside the usable extent and below the parapet (GLSL `valid`).
  const valid = boxAA(ux, 0, usableWidth, aw).mul(
    boxAA(yy, 0, topY.sub(floorToStreet).sub(TSL.select(curtain, TSL.float(0.2), TSL.float(1.2))), ah),
  );

  // Parallax glass plane: the glass sits `depth` behind the wall plane, so the opening shifts
  // with the view direction and exposes a jamb on one side (GLSL gp / inG / reveal).
  const viewDirection = TSL.normalize(TSL.cameraPosition.sub(worldPosition));
  const tangentCross = TSL.cross(TSL.vec3(0, 1, 0), worldNormal);
  // Zero on roofs / undersides instead of NaN (the GLSL returns early for those faces).
  const tangentWorld = tangentCross.div(TSL.max(TSL.length(tangentCross), 1e-4));
  const tangentView = TSL.vec3(
    TSL.dot(viewDirection, tangentWorld),
    viewDirection.y,
    TSL.max(TSL.dot(viewDirection, worldNormal), 0.06),
  );
  const revealDepth = TSL.select(
    masonryZone,
    TSL.max(extra.w, 0.16).mul(1.3),
    extra.w,
  );
  const glassOffset = TSL.vec2(tangentView.x.negate(), tangentView.y.negate())
    .div(tangentView.z)
    .mul(revealDepth);
  const gpx = fx.add(glassOffset.x);
  const gpy = fy.add(glassOffset.y);
  const safeWidth = windowWidth.max(1e-3);
  const safeHeight = windowHeight.max(1e-3);
  const gqx = gpx.sub(wx0).div(safeWidth);
  const gqy = gpy.sub(wy0).div(safeHeight);

  const openX = boxAA(fx, wx0, wx0.add(windowWidth), aw);
  const open = openX
    .mul(boxAA(fy, wy0, wy0.add(windowHeight), ah))
    .mul(valid)
    .mul(activeF)
    .mul(archOpening);
  const glassPlane = boxAA(gpx, wx0, wx0.add(windowWidth), aw).mul(
    boxAA(gpy, wy0, wy0.add(windowHeight), ah),
  ).mul(TSL.mix(TSL.float(1), archMaskAt(gpx, gpy), asFloat(zArch)));

  // Sash border (5 cm inside the opening), transom bar at 0.52 of the height, and vertical
  // muntins on wide windows / ribbons: the GLSL `frame` term. Curtain walls have none.
  let frame = TSL.float(1).sub(
    boxAA(gpx, wx0.add(frameWidthX), wx0.add(windowWidth).sub(frameWidthX), aw).mul(
      boxAA(gpy, wy0.add(frameWidthY), wy0.add(windowHeight).sub(frameWidthY), ah),
    ),
  );
  const transom = TSL.float(1).sub(
    boxAA(gqy.sub(0.52).abs().mul(windowHeight), 0.03, 99, ah),
  );
  frame = TSL.select(ribbon, frame, frame.max(transom));
  const muntinCount = TSL.floor(windowWidth.div(1.2).add(0.5)).max(2);
  const muntin = TSL.float(1).sub(
    boxAA(
      TSL.fract(gqx.mul(muntinCount).add(0.5)).sub(0.5).abs().mul(windowWidth).div(muntinCount),
      0.035,
      99,
      aw,
    ),
  );
  frame = TSL.select(windowWidth.greaterThan(1.5).or(ribbon), frame.max(muntin), frame);
  frame = TSL.select(curtain, TSL.float(0), frame);

  const cellR = fh1(TSL.vec2(bayIndex.add(seed.mul(3.7)), floorIndex.add(seed.mul(1.3))));

  // Sash paint: per-lintel default, per-building palette on masonry, ~18 % aluminium swaps.
  const lintel = extra.y;
  const defaultFrame = TSL.select(
    lintel.greaterThan(1.5),
    TSL.vec3(0.9, 0.9, 0.87),
    TSL.select(lintel.greaterThan(0.5), TSL.vec3(0.1, 0.1, 0.1), TSL.vec3(0.28, 0.2, 0.14)),
  );
  const paintHash = TSL.fract(seed.mul(3.97).add(0.41));
  const masonryFrame = TSL.select(
    paintHash.lessThan(0.3),
    TSL.vec3(0.66, 0.65, 0.61),
    TSL.select(
      paintHash.lessThan(0.5),
      TSL.vec3(0.1, 0.15, 0.12),
      TSL.select(
        paintHash.lessThan(0.7),
        TSL.vec3(0.07, 0.07, 0.075),
        TSL.select(paintHash.lessThan(0.85), TSL.vec3(0.3, 0.21, 0.15), TSL.vec3(0.55, 0.52, 0.45)),
      ),
    ),
  );
  const replacedWindow = TSL.fract(cellR.mul(17.3)).lessThan(0.18);
  const frameColor = TSL.select(
    masonryZone,
    TSL.select(replacedWindow, TSL.vec3(0.42, 0.43, 0.44), masonryFrame),
    defaultFrame,
  );

  // Glass body: clear sash glass is a near-black pane (GLSL 0.015); curtain glass takes the
  // per-tower tint selected by aX.z.
  const glassType = extra.z;
  const lowIron = glassType.greaterThan(3.5).and(glassType.lessThan(4.5));
  const baseGlassTint = TSL.select(
    glassType.lessThan(0.5),
    TSL.vec3(0.5, 0.61, 0.72),
    TSL.select(
      glassType.lessThan(1.5),
      TSL.vec3(0.4, 0.57, 0.58),
      TSL.select(
        glassType.lessThan(2.5),
        TSL.vec3(0.5, 0.56, 0.6),
        TSL.select(glassType.lessThan(3.5), TSL.vec3(0.55, 0.5, 0.42), TSL.vec3(0.66, 0.74, 0.82)),
      ),
    ),
  );
  const glassTint = TSL.select(
    glassType.greaterThan(4.5),
    TSL.select(
      glassType.lessThan(5.5),
      TSL.vec3(0.36, 0.55, 0.46),
      TSL.select(glassType.lessThan(6.5), TSL.vec3(0.6, 0.72, 0.86), TSL.vec3(0.78, 0.64, 0.42)),
    ),
    baseGlassTint,
  );
  const curtainGlass = TSL.select(
    lowIron,
    glassTint.mul(TSL.float(0.13).add(cellR.mul(0.03))),
    glassTint.mul(TSL.float(0.035).add(cellR.mul(0.02))),
  );
  // Keep residential and masonry sash windows free of roller blinds.
  const residential = extra.x.greaterThan(0.5);
  const curtainHash = fh1(
    TSL.vec2(
      bayIndex.mul(5.3).add(seed.mul(1.9)),
      floorIndex.mul(3.1).add(seed.mul(0.37)),
    ),
  );
  const curtainWidth = TSL.float(0.18).add(TSL.fract(curtainHash.mul(41)).mul(0.2));
  const curtainLeft = boxAA(gqx, 0, curtainWidth, TSL.max(TSL.fwidth(gqx), 1e-4));
  const curtainRight = boxAA(gqx, TSL.float(1).sub(curtainWidth), 1, TSL.max(TSL.fwidth(gqx), 1e-4));
  const curtainBoth = curtainLeft.max(curtainRight);
  const curtainOneSide = TSL.select(
    TSL.fract(curtainHash.mul(13)).lessThan(0.5),
    curtainLeft,
    curtainRight,
  );
  const curtainSides = TSL.select(
    curtainHash.lessThan(0.08),
    curtainBoth,
    TSL.select(curtainHash.lessThan(0.2), curtainOneSide, TSL.float(0)),
  );
  const curtainMask = curtainSides.mul(asFloat(punched));
  const curtainColor = TSL.select(
    TSL.fract(curtainHash.mul(7.7)).lessThan(0.35),
    TSL.vec3(0.62, 0.52, 0.4),
    TSL.select(
      TSL.fract(curtainHash.mul(7.7)).lessThan(0.6),
      TSL.vec3(0.5, 0.22, 0.18),
      TSL.select(
        TSL.fract(curtainHash.mul(7.7)).lessThan(0.8),
        TSL.vec3(0.3, 0.36, 0.42),
        TSL.vec3(0.75, 0.72, 0.64),
      ),
    ),
  );
  const curtainFold = TSL.float(0.8).add(TSL.sin(gpx.mul(38)).mul(0.2));
  const curtainFabric = curtainColor.mul(0.5).mul(curtainFold);
  // Keep residential and masonry sash panes clear; retain roller blinds on other styles.
  const blindThreshold = TSL.select(
    deco,
    TSL.float(0.86),
    TSL.select(masonryZone, TSL.float(0.7), TSL.float(0.55)),
  );
  const blindAmount = TSL.select(
    cellR.greaterThan(blindThreshold),
    cellR.sub(blindThreshold).mul(TSL.select(punched, TSL.float(2.6), TSL.float(1.8))),
    TSL.float(0),
  ).mul(TSL.mix(TSL.float(1), TSL.float(0.45), night));
  const blindMask = TSL.step(TSL.float(1).sub(blindAmount), gqy.clamp(0.02, 0.98))
    .mul(asFloat(punched.or(deco)))
    .mul(TSL.select(residential.or(masonryZone), TSL.float(0), TSL.float(1)));
  const blindPaletteHash = TSL.fract(cellR.mul(23.7));
  const blindColor = TSL.select(
    blindPaletteHash.lessThan(0.3),
    TSL.vec3(0.8, 0.78, 0.72),
    TSL.select(
      blindPaletteHash.lessThan(0.55),
      TSL.vec3(0.78, 0.7, 0.55),
      TSL.select(
        blindPaletteHash.lessThan(0.72),
        TSL.vec3(0.55, 0.58, 0.54),
        TSL.select(
          blindPaletteHash.lessThan(0.86),
          TSL.vec3(0.2, 0.2, 0.21),
          TSL.vec3(0.7, 0.66, 0.6),
        ),
      ),
    ),
  ).mul(TSL.select(punched, TSL.float(0.275), TSL.float(0.55)));
  const blindSlats = TSL.float(0.85).add(TSL.step(0.5, TSL.fract(gpy.mul(25))).mul(0.15));
  const sashTreatment = TSL.mix(TSL.vec3(0.015, 0.015, 0.015), blindColor.mul(blindSlats).mul(0.8), blindMask);
  const furnishedSash = TSL.mix(sashTreatment, curtainFabric, curtainMask);
  const glassAlbedo = TSL.select(curtain, curtainGlass, TSL.select(punched, furnishedSash, TSL.vec3(0.015, 0.015, 0.015)));

  // Curtain wall: spandrel panels with aluminium mullion caps (GLSL spC / capC / cw).
  const capWidth = TSL.float(0.04).add(TSL.fract(seed.mul(7.77)).mul(0.09));
  const capHash = TSL.fract(seed.mul(4.39).add(0.5));
  const capColorBase = TSL.select(
    capHash.lessThan(0.4),
    TSL.vec3(0.42, 0.44, 0.46),
    TSL.select(
      capHash.lessThan(0.62),
      TSL.vec3(0.13, 0.11, 0.09),
      TSL.select(capHash.lessThan(0.82), TSL.vec3(0.05, 0.055, 0.06), TSL.vec3(0.68, 0.69, 0.68)),
    ),
  );
  const capColor = TSL.select(lowIron, TSL.vec3(0.56, 0.58, 0.61), capColorBase).mul(
    TSL.float(0.9).add(nz2.r.mul(0.2)),
  );
  const spandrelHash = TSL.fract(seed.mul(5.31).add(0.17));
  const spandrelTone = TSL.float(0.8).add(TSL.fract(seed.mul(2.71)).mul(0.4));
  const spandrelBase = TSL.select(
    spandrelHash.lessThan(0.25),
    glassTint.mul(0.08),
    TSL.select(
      spandrelHash.lessThan(0.72),
      TSL.vec3(0.27, 0.285, 0.3).mul(spandrelTone),
      TSL.vec3(0.42, 0.405, 0.37).mul(
        TSL.float(0.85).add(TSL.fract(seed.mul(1.93)).mul(0.3)),
      ),
    ),
  );
  const spandrelColor = TSL.select(
    spandrelHash.greaterThan(0.88),
    TSL.vec3(0.3, 0.24, 0.17).mul(spandrelTone),
    spandrelBase,
  );
  const capX = TSL.float(1).sub(boxAA(fx, capWidth, bayWidthActual.sub(capWidth), aw));
  const capY = TSL.float(1).sub(boxAA(fy, capWidth, floorHeight.sub(capWidth), ah));
  const capMask = capX.max(capY);
  const curtainWall = TSL.mix(spandrelColor, capColor, capMask);

  // Stone sills and heads on punched / ribbon walls (GLSL sill / head / `lint`). Stone is the
  // limestone layer (3) of the same wall atlas, tinted like the GLSL `stone * 1.25`.
  const stoneStyle = punched.or(ribbon);
  const insideX = boxAA(fx, wx0.sub(0.1), wx0.add(windowWidth).add(0.1), aw).mul(valid).mul(activeF);
  const sillMask = insideX.mul(boxAA(fy, wy0.sub(0.12), wy0, ah));
  const headMask = insideX.mul(
    boxAA(
      fy,
      wy0.add(windowHeight),
      wy0.add(windowHeight).add(TSL.select(lintel.greaterThan(1.5), TSL.float(0.35), TSL.float(0.22))),
      ah,
    ),
  );
  const stoneColor = TSL.texture(T.wallsCol, facade.add(buildingOffset).div(3))
    .depth(TSL.int(3))
    .rgb.mul(TSL.vec3(0.78, 0.75, 0.68))
    .mul(1.25);
  const hasLintel = lintel.greaterThan(0.5).or(zArch);
  const stoneAmount = TSL.select(hasLintel, sillMask.max(headMask), sillMask);
  const wallWithHeads = TSL.select(
    hasLintel,
    wallGrimeColor,
    wallGrimeColor.mul(TSL.float(1).sub(headMask.mul(0.18))),
  );
  const wallWithStone = TSL.select(
    stoneStyle,
    TSL.mix(wallWithHeads, stoneColor, stoneAmount),
    wallGrimeColor,
  );

  // Arched cap windows get a curved voussoir ring and a centered keystone in
  // place of the ordinary flat lintel, as in the WebGL2 facade shader.
  const archDx = fx.sub(wx0).sub(archRadius);
  const archDy = fy.sub(archCenterY);
  const archDistance = TSL.vec2(archDx, archDy).length();
  const archRing = TSL.step(TSL.float(0), archDy).mul(
    TSL.smoothstep(archRadius.sub(aw), archRadius.add(aw), archDistance)
      .sub(TSL.smoothstep(archRadius.add(0.26).sub(aw), archRadius.add(0.26).add(aw), archDistance)),
  );
  const archKeystone = boxAA(archDx.abs(), -1, 0.13, aw).mul(
    boxAA(fy, wy0.add(windowHeight).sub(0.05), wy0.add(windowHeight).add(0.36), ah),
  );
  const archHeadMask = archRing.max(archKeystone).mul(valid);
  const effectiveHeadMask = TSL.mix(headMask, archHeadMask, asFloat(zArch));
  const effectiveStoneAmount = TSL.select(
    hasLintel,
    sillMask.max(effectiveHeadMask),
    sillMask,
  );
  const archedWallWithStone = TSL.select(
    stoneStyle,
    TSL.mix(wallWithHeads, stoneColor, effectiveStoneAmount),
    wallGrimeColor,
  );

  // Alternating limestone corner blocks (quoins) break up broad masonry faces.
  // Apply before the opening mask so glass and reveals still cut cleanly through.
  const quoinRow = TSL.floor(y.div(0.62));
  const quoinWidth = TSL.select(TSL.mod(quoinRow, 2).lessThan(0.5), TSL.float(0.95), TSL.float(0.55));
  const quoinMask = TSL.float(1).sub(boxAA(facade.x, quoinWidth, faceWidth.sub(quoinWidth), aw))
    .mul(TSL.step(TSL.float(0), yy))
    .mul(asFloat(masonryZone.and(zH1.greaterThan(0.4)).and(zInBase.not()).and(faceWidth.greaterThan(6))));
  const quoinJoint = TSL.float(1).sub(boxAA(TSL.mod(y, 0.62), 0.03, 0.62, ah));
  const quoinColor = stoneColor
    .mul(TSL.vec3(0.84 / 0.78, 0.82 / 0.75, 0.77 / 0.68))
    .mul(TSL.float(0.9).add(nz2.b.mul(0.2)))
    .mul(TSL.float(1).sub(quoinJoint.mul(0.45)));
  const masonryWithQuoins = TSL.mix(archedWallWithStone, quoinColor, quoinMask);
  const sillMaskAll = TSL.select(stoneStyle, effectiveStoneAmount, TSL.float(0));

  // Darkening around openings (GLSL: 0.1 * inWx * boxAA(fy, ...) * (1 - open)).
  const openingShade = TSL.float(1).sub(
    openX
      .mul(activeF)
      .mul(boxAA(fy, wy0.sub(0.3), wy0.add(windowHeight).add(0.3), ah))
      .mul(TSL.float(1).sub(open))
      .mul(0.1),
  );
  const wallSurface = TSL.select(curtain, curtainWall, masonryWithQuoins).mul(openingShade);

  // Reveal: where the parallax glass point leaves the opening, the jamb / head / sill is lit wall.
  const revealColor = TSL.select(
    curtain,
    TSL.vec3(0.62, 0.64, 0.66),
    wallGrimeColor.mul(0.72),
  );
  let windowSurface = TSL.mix(glassAlbedo, frameColor, frame);
  windowSurface = TSL.mix(revealColor, windowSurface, glassPlane);
  windowSurface = TSL.select(curtain, TSL.mix(windowSurface, capColor, capMask), windowSurface);

  const frameMask = open.mul(frame);
  const capCoverage = TSL.select(curtain, capMask, TSL.float(0));
  const paneMask = open
    .mul(glassPlane)
    .mul(TSL.float(1).sub(frame))
    .mul(TSL.float(1).sub(capCoverage));

  // ---------------------------------------------------------------- storefront glazing
  // Ground-floor shop panes use the GLSL shop opening, depth offset and mullion spacing.
  const shopCount = TSL.floor(faceWidth.div(6.5).add(0.5)).max(1);
  const shopBay = faceWidth.div(shopCount);
  const shopBayIndex = TSL.floor(facade.x.div(shopBay));
  const shopArea = styleData.z.greaterThan(0.05)
    .and(y.lessThan(floorToStreet))
    .and(activeWindows);
  const shopBayX = TSL.mod(facade.x, shopBay);
  const shopGlassY0 = TSL.float(0.55);
  const shopSignY0 = floorToStreet.sub(1.55);
  const shopGlassWidth = shopBay.sub(0.7);
  const shopParallax = TSL.float(0.18);
  const shopGpx = shopBayX.sub(0.35).add(
    tangentView.x.negate().div(tangentView.z).mul(shopParallax),
  );
  const shopGpy = y.add(tangentView.y.negate().div(tangentView.z).mul(shopParallax));
  const shopWindow = boxAA(shopGpx, 0, shopGlassWidth, aw)
    .mul(boxAA(shopGpy, shopGlassY0, shopSignY0, ah))
    .mul(asFloat(shopArea));
  const shopPaneCount = TSL.floor(shopGlassWidth.div(1.8).add(0.5)).max(1);
  const shopPaneWidth = shopGlassWidth.div(shopPaneCount);
  const shopMullion = TSL.float(1).sub(
    boxAA(TSL.mod(shopGpx, shopPaneWidth), 0.05, shopPaneWidth.sub(0.05), aw),
  );
  const shopFrameMask = shopWindow.mul(
    shopMullion
      .max(TSL.float(1).sub(boxAA(shopGpy, shopGlassY0.add(0.06), shopSignY0.sub(0.06), ah)))
      .max(TSL.float(1).sub(boxAA(shopGpy.sub(shopSignY0.sub(0.9)).abs(), 0.04, 9, ah))),
  );
  const shopGlassMask = shopWindow.mul(TSL.float(1).sub(shopFrameMask));
  const glassMask = paneMask.max(shopGlassMask);
  const cellHash = TSL.fract(
    TSL.sin(
      bayCoord.floor().mul(127.1)
        .add(floorIndex.mul(311.7))
        .add(seed.mul(74.7)),
    ).mul(43758.5453),
  );
  const upperFloorWindow = asFloat(floorIndex.greaterThan(0));
  const litWindows = cellHash.lessThan(0.43)
    .mul(night)
    .mul(glassMask)
    .mul(upperFloorWindow);
  const nightEmission = TSL.mix(
    TSL.vec3(0.025, 0.034, 0.05),
    TSL.vec3(1.0, 0.57, 0.29),
    TSL.select(shopWindow.greaterThan(0), TSL.float(0.72), TSL.float(0.5)),
  ).mul(litWindows).mul(2.6);

  const shopGlassColor = TSL.mix(
    TSL.vec3(0.035, 0.045, 0.055),
    TSL.vec3(0.015, 0.02, 0.025),
    night,
  );
  // Match the storefront hash in facade-frag_decl.frag exactly so each bay
  // keeps the same single frame finish in WebGPU and WebGL2.
  const shopFrameHash = fh1(TSL.vec2(
    shopBayIndex.add(seed.mul(13.1)),
    seed.mul(7.7).add(faceWidth),
  ));
  const shopFrameColor = TSL.select(
    shopFrameHash.greaterThan(0.4),
    TSL.vec3(0.05, 0.05, 0.055),
    TSL.vec3(0.35, 0.28, 0.18),
  );

  let wallColor = TSL.mix(wallSurface, windowSurface, open);
  wallColor = TSL.mix(wallColor, shopGlassColor, shopWindow);
  wallColor = TSL.mix(wallColor, shopFrameColor, shopFrameMask);
  const wallWindowColor = wallColor;

  // The crown tier uses a bright metallic shell and a segmented, emissive
  // arched band instead of the GLSL shader's more detailed Chrysler sunburst.
  const isCrown = style.greaterThan(5.5);
  const crownU = facade.x.sub(faceWidth.mul(0.5)).div(faceWidth.mul(0.5));
  const crownY = y.sub(topY.mul(0.35)).div(topY.mul(0.75));
  const crownRadius = crownU.mul(crownU).add(crownY.mul(crownY)).sqrt();
  const crownBand = TSL.smoothstep(0.60, 0.68, crownRadius).mul(
    TSL.float(1).sub(TSL.smoothstep(0.92, 1.0, crownRadius)),
  );
  const crownSpokes = TSL.smoothstep(
    0.08,
    0.22,
    TSL.fract(TSL.atan(crownY, crownU).div(Math.PI).mul(9)).abs().sub(0.5).abs(),
  );
  const crownGlass = crownBand.mul(crownSpokes).mul(asFloat(isCrown));
  wallColor = TSL.mix(wallColor, TSL.vec3(0.56, 0.575, 0.6), asFloat(isCrown));
  wallColor = TSL.mix(wallColor, TSL.vec3(0.035, 0.04, 0.05), crownGlass);
  const wallCrownColor = wallColor;

  // Procedural reflected sky and neighboring facades. This mirrors the WebGL
  // facade's city reflection without relying on WebGPU's problematic PMREM path.
  const grazing = TSL.float(1).sub(TSL.abs(TSL.dot(worldNormal, viewDirection))).clamp();
  const reflectedDirection = TSL.normalize(TSL.reflectVector);
  const reflectionAzimuth = TSL.atan(reflectedDirection.z, reflectedDirection.x)
    .mul(7)
    .add(seed.mul(3.1));
  const reflectionSector = TSL.floor(reflectionAzimuth);
  const reflectionPhase = TSL.fract(reflectionAzimuth);
  const reflectionHash = fh1(TSL.vec2(reflectionSector, 3.7));
  const reflectionFace = fh1(TSL.vec2(reflectionSector, 9.1));
  const reflectionGap = fh1(TSL.vec2(reflectionSector.add(0.5), 1.3));
  let skylineHeight = TSL.mix(TSL.float(0.03), TSL.float(0.36), reflectionHash.mul(reflectionHash))
    .mul(TSL.float(1).add(TSL.float(0.8).mul(TSL.float(1).sub(TSL.smoothstep(20, 260, worldPosition.y)))));
  skylineHeight = skylineHeight
    .mul(TSL.step(TSL.float(0.12), reflectionGap))
    .mul(TSL.float(0.85).add(TSL.step(reflectionPhase.sub(0.5).abs(), reflectionFace.mul(0.3)).mul(0.3)));
  skylineHeight = TSL.select(lowIron, skylineHeight.mul(0.35), skylineHeight);
  const reflectionEdge = TSL.fwidth(reflectedDirection.y).add(0.004);
  const reflectedBuilding = TSL.float(1).sub(
    TSL.smoothstep(skylineHeight.sub(reflectionEdge), skylineHeight.add(reflectionEdge), reflectedDirection.y),
  );
  const reflectedAzimuth = TSL.atan(reflectedDirection.z, reflectedDirection.x).mul(0.15915494).add(0.5);
  const cloudNoise = TSL.texture(
    T.noise,
    TSL.vec2(reflectedAzimuth.mul(1.7).add(seed.mul(0.13)), reflectedDirection.y.mul(5).add(0.5)),
  ).r;
  const cloudNoiseFine = TSL.texture(
    T.noise,
    TSL.vec2(reflectedAzimuth.mul(4.3).sub(seed.mul(0.27)), reflectedDirection.y.mul(12).add(0.2)),
  ).g;
  const reflectedSkyGradient = TSL.mix(
    TSL.vec3(0.48, 0.56, 0.66),
    TSL.vec3(0.22, 0.38, 0.62),
    TSL.smoothstep(0.02, 0.72, reflectedDirection.y),
  );
  const reflectedClouds = TSL.smoothstep(0.56, 0.75, cloudNoise)
    .mul(TSL.float(0.7).add(TSL.smoothstep(0.52, 0.75, cloudNoiseFine).mul(0.3)))
    .mul(TSL.smoothstep(-0.04, 0.14, reflectedDirection.y))
    .mul(TSL.float(1).sub(TSL.smoothstep(0.42, 0.82, reflectedDirection.y)));
  const reflectedSky = reflectedSkyGradient.add(TSL.vec3(0.22, 0.23, 0.24).mul(reflectedClouds));
  const reflectedRows = TSL.float(0.8).add(
    TSL.step(0.5, TSL.fract(reflectedDirection.y.mul(180).div(TSL.float(1).add(reflectionEdge.mul(60)))))
      .mul(0.2),
  );
  const reflectedFacadeTint = TSL.mix(
    TSL.vec3(0.95, 0.9, 0.82),
    TSL.vec3(0.75, 0.82, 0.95),
    reflectionGap,
  );
  const reflectedCity = reflectedSky
    .mul(reflectedFacadeTint)
    .mul(TSL.mix(TSL.float(0.27), TSL.float(0.58), reflectionFace))
    .mul(reflectedRows);
  const reflectedStreet = reflectedSky.mul(TSL.vec3(0.16, 0.17, 0.19));
  const reflectedRoof = reflectedSky.mul(
    TSL.mix(TSL.vec3(0.34, 0.36, 0.39), TSL.vec3(0.6, 0.6, 0.59), reflectionHash)
      .mul(TSL.float(0.75).add(reflectionFace.mul(0.35))),
  );
  const downRay = TSL.float(1).sub(TSL.smoothstep(-0.85, -0.4, reflectedDirection.y));
  const shallowDownRay = TSL.smoothstep(-0.4, -0.12, reflectedDirection.y);
  const reflectedGround = TSL.mix(reflectedCity, reflectedStreet, downRay);
  const reflectedGroundAndRoof = TSL.mix(reflectedGround, reflectedRoof, TSL.smoothstep(35, 160, worldPosition.y));
  const reflectedCityWithHaze = TSL.mix(
    reflectedGroundAndRoof,
    reflectedSky.mul(TSL.mix(TSL.float(0.62), TSL.float(0.9), reflectionFace)),
    shallowDownRay,
  ).mul(TSL.float(1).sub(night.mul(0.85)));
  const reflectedScene = TSL.mix(reflectedSky, reflectedCityWithHaze, reflectedBuilding);
  const curtainSpandrelReflection = TSL.select(
    curtain,
    TSL.float(1).sub(open).mul(TSL.float(1).sub(capMask)).mul(
      TSL.select(spandrelHash.lessThan(0.25), TSL.float(0.8), TSL.float(0.16)),
    ),
    TSL.float(0),
  );
  const glassReflection = reflectedScene
    .mul(TSL.float(0.2).add(grazing.mul(0.5)))
    .mul(glassMask.add(curtainSpandrelReflection).clamp())
    .add(reflectedScene.mul(TSL.float(0.14).add(grazing.mul(0.48))).mul(crownGlass))
    .mul(TSL.float(1).sub(night.mul(0.55)));

  const facadeProbeColor = {
    walltex: wallTextureSample,
    walllayer: TSL.vec3(layer.div(15), TSL.float(1).sub(layer.div(15)), 0.2),
    walltint: tint,
    wallbase: wallBaseColor,
    wallweather: wallWeatherColor,
    wallgrime: wallGrimeColor,
    wallwindows: wallWindowColor,
    wallcrown: wallCrownColor,
  }[facadeProbe];
  const isFacadeProbe = facadeProbeColor !== undefined;
  const isGlassReflectionProbe = facadeProbe === "wallfillreflection";
  material.colorNode = facadeProbeColor ?? wallColor;
  material.roughnessNode = TSL.select(
    crownGlass.greaterThan(0.01),
    TSL.float(0.1),
    TSL.select(
      isCrown,
      TSL.float(0.24),
      TSL.select(
        frameMask.max(sillMaskAll).greaterThan(0.01),
        TSL.float(0.62),
        TSL.select(
          glassMask.greaterThan(0.01),
          TSL.float(0.05),
          TSL.select(layer.greaterThan(4.5).and(layer.lessThan(5.5)), TSL.float(0.32), TSL.float(0.84)),
        ),
      ),
    ),
  );
  material.metalnessNode = TSL.select(
    crownGlass.greaterThan(0.01),
    TSL.float(0),
    TSL.select(
      isCrown,
      TSL.float(0.72),
      TSL.select(
        glassMask.greaterThan(0.01),
        TSL.float(0),
        TSL.select(layer.greaterThan(4.5).and(layer.lessThan(5.5)), TSL.float(0.6), TSL.float(0)),
      ),
    ),
  );
  const emission = nightEmission.add(glassReflection).add(
    crownGlass.mul(night).mul(TSL.vec3(0.85, 0.92, 1)).mul(1.8),
  );
  material.emissiveNode = isFacadeProbe
    ? TSL.vec3(0)
    : isGlassReflectionProbe
      ? glassReflection
      : emission;
  if (isFacadeProbe || isGlassReflectionProbe) {
    if (isFacadeProbe) material.lights = false;
    material.userData.facadeProbe = facadeProbe;
    material.needsUpdate = true;
    if (facadeProbe === "walltex") {
      console.info("[tsl] facade wall texture probe", {
        textureType: T.wallsCol?.constructor?.name,
        compressedArray: T.wallsCol?.isCompressedArrayTexture === true,
        depth: T.wallsCol?.image?.depth,
        width: T.wallsCol?.image?.width,
        height: T.wallsCol?.image?.height,
        mipLevels: T.wallsCol?.mipmaps?.length,
        colorSpace: T.wallsCol?.colorSpace,
        haoAtlas: T.wallsHao
          ? {
              textureType: T.wallsHao.constructor?.name,
              depth: T.wallsHao.image?.depth,
              mipLevels: T.wallsHao.mipmaps?.length,
              colorSpace: T.wallsHao.colorSpace,
            }
          : "missing",
      });
    }
  }
  // Carry the facade-glass SSR mask through the opaque scene pass alpha.
  material.opacityNode = TSL.float(1).add(glassMask.max(curtainSpandrelReflection).max(crownGlass).clamp());
  facadeNodeData.set(material, {
    colorNode: wallColor,
    emissiveNode: emission,
    night,
  });
  material.userData.nodeFacade = true;
  material.userData.noSSR = true;
  // The facade authors its own albedo detail; keep the ambient fill proportional to it
  // (see webgpuLightingFallback.ts) instead of flooring it to a flat color.
  material.userData.webgpuAmbientFloor = false;
  return material;
}

export function deriveFacadeNodeMaterial(base, farNight = false) {
  const material = base.clone();
  const nodes = facadeNodeData.get(base);
  if (nodes && farNight && !base.userData.facadeProbe) {
    const farNightScale = TSL.float(1).sub(nodes.night.mul(0.8));
    material.colorNode = nodes.colorNode.mul(farNightScale);
    material.emissiveNode = nodes.emissiveNode.mul(farNightScale);
    facadeNodeData.set(material, {
      ...nodes,
      colorNode: material.colorNode,
      emissiveNode: material.emissiveNode,
    });
  }
  return material;
}
