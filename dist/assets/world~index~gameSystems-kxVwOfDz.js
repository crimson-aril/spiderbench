import{$ as e,Ai as t,Bi as n,Bt as r,Ci as i,Cn as a,Dt as o,Et as s,Fn as c,Fr as l,Gr as u,Gt as d,Ht as f,Ii as p,Jr as m,Kr as h,Lt as g,Nr as _,Pi as v,U as y,Vt as b,Wt as x,Yr as S,Zi as C,_r as w,aa as T,an as E,ca as D,dt as O,ea as k,hn as A,ia as j,jr as M,ki as N,lt as ee,mr as P,nt as F,oi as te,qi as ne,ra as I,ta as L,vr as R,wr as re,wt as ie,xr as ae,yr as z,yt as B,zt as V}from"./three~index~combat~tslPipeline~screenshotPresets~gameSystems-DsPuCJ23.js";import{n as oe,r as H,t as se}from"./three~index~combat~tslPipeline~screenshotPresets~gameSystems-B-te4akP.js";import{i as ce}from"./vehicleLighting-Cqq_fzGi.js";var le=`// farshore shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
out vec3 vLWP;
// @section vertexFogVertex
#include <fog_vertex>
vLWP = (modelMatrix * vec4(transformed, 1.0)).xyz;
// @section fragmentCommon
#include <common>
in vec3 vLWP;
float lh(vec2 p) {
return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
// @section fragmentMap
#include <map_fragment>
{
vec2 p = vLWP.xz;
vec2 cell = vec2(96.0, 210.0);
vec2 q = p / cell, id = floor(q), f = fract(q);
float r = lh(id), nb = lh(floor(p / 1400.0));
vec3 blk = mix(vec3(0.29, 0.27, 0.25), vec3(0.4, 0.36, 0.32), r); // (r14: darker, warmer)
if(r > 0.93 || nb < 0.1) blk = vec3(0.26, 0.31, 0.22);             // parks / cemeteries
else if(nb > 0.8) blk *= vec3(1.05, 1.0, 0.95);                     // industrial / lighter
// (round 3) street-tree / back-yard canopy mottling: the hinterland reads as leafy boroughs, not a grey slab
float tc = lh(floor(p / 38.0)) * 0.6 + lh(floor(p / 330.0)) * 0.4;
blk = mix(blk, vec3(0.16, 0.19, 0.12), smoothstep(0.45, 0.8, tc) * 0.75);
vec2 e = min(f, 1.0 - f) * cell;
float st = 1.0 - smoothstep(5.0, 8.0, min(e.x, e.y));
vec3 c = mix(blk, vec3(0.2, 0.2, 0.21), st);
// (round 6) arterial boulevards (same grid as the baked map) keep the road hierarchy readable to the horizon
float art = min(abs(mod(p.x - 350.0 + 550.0, 1100.0) - 550.0), abs(mod(p.y - 180.0 + 475.0, 950.0) - 475.0));
c = mix(c, vec3(0.15, 0.15, 0.16), 1.0 - smoothstep(11.0, 14.0, art));
vec2 fw = fwidth(q);
c = mix(c, vec3(0.33, 0.33, 0.31), clamp(max(fw.x * 4.0, fw.y * 8.0), 0.0, 1.0));
vec2 uvm = vMapUv;
float inMap = step(0.0, uvm.x) * step(uvm.x, 1.0) * step(0.0, uvm.y) * step(uvm.y, 1.0);
float edge = inMap * smoothstep(0.0, 0.03, min(min(uvm.x, 1.0 - uvm.x), min(uvm.y, 1.0 - uvm.y)));
diffuseColor.rgb = mix(c, diffuseColor.rgb, edge);
}
// @section vertexCommonByCliffWorldPosition
#include <common>
out vec3 vCW;
// @section vertexFogVertexByCliffWorldPosition
#include <fog_vertex>
vCW = (modelMatrix * vec4(transformed, 1.0)).xyz;
// @section fragmentCommonByCliffWorldPosition
#include <common>
in vec3 vCW;
float ch(float x) {
return fract(sin(x * 91.7) * 43758.5453);
}
float vn(float x) {
float i = floor(x), f = fract(x);
f = f * f * (3.0 - 2.0 * f);
return mix(ch(i), ch(i + 1.0), f);
}
// @section fragmentMapByCliffWorldPosition
{
float u = vCW.z * 0.97 + vCW.x * 0.24, y = vCW.y;
float cu = u / (3.5 + 2.0 * vn(u * 0.05)), cid = floor(cu), cf = fract(cu);
float joint = 1.0 - smoothstep(0.0, 0.12, min(cf, 1.0 - cf));
vec3 c = mix(vec3(0.15, 0.14, 0.13), vec3(0.23, 0.2, 0.17), ch(cid)) * (0.85 + 0.3 * vn(y * 0.3 + cid));
c = mix(c, vec3(0.36, 0.25, 0.18), smoothstep(0.55, 0.9, vn(u * 0.013 + y * 0.02)) * 0.5);   // iron staining
c *= 1.0 - 0.55 * joint;
float ledge = smoothstep(0.82, 0.97, fract(y / (9.0 + 3.0 * vn(u * 0.02))));
vec3 moss = mix(vec3(0.12, 0.15, 0.07), vec3(0.2, 0.19, 0.09), vn(u * 0.2));
float veg = max(ledge * 0.7, smoothstep(__SHADER_INJECT_0__, __SHADER_INJECT_1__, y + 6.0 * vn(u * 0.07))) * step(0.35, vn(u * 0.11 + y * 0.05));
c = mix(c, moss, veg * 0.85);
// wooded talus slope over the lower third (scrub and trees climbing the scree), ragged upper edge
float talus = 1.0 - smoothstep(0.0, 4.0, y - (__SHADER_INJECT_2__ + 12.0 * vn(u * 0.031) + 5.0 * vn(u * 0.17)));
vec3 wood = mix(vec3(0.07, 0.085, 0.045), vec3(0.14, 0.12, 0.06), vn(u * 0.4 + y * 0.3)) * (0.7 + 0.5 * vn(u * 1.3 + y * 0.9));
c = mix(c, wood, talus);
diffuseColor.rgb = c;
}
// @section vertexCommonByGlassMask
#include <common>
out vec3 vWPm;
out float vWin;
out float vGl;
out vec3 vBx;
// @section vertexColorVertex
#include <color_vertex>
vWin = color.b > 5.0 ? 1.0 : 0.0;
vGl = color.b > 15.0 ? 1.0 : 0.0;
vColor.b = color.b > 15.0 ? color.b - 20.0 : color.b > 5.0 ? color.b - 10.0 : color.b;
// @section vertexFogVertexByMountainWorldPosition
#include <fog_vertex>
vWPm = (modelMatrix * vec4(transformed, 1.0)).xyz;
// @section fragmentCommonByGlassMask
#include <common>
in vec3 vWPm;
in float vWin;
in float vGl;
uniform float uNightK;
float mh(vec2 p) {
return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
// @section fragmentColor
#include <color_fragment>
vec3 dnE = vec3(0.0); // (daynight) lit windows at night
if(vWin > 0.5) {
// (round 3) readable facades at 1-5 km: dark glazing with a per-window sky / blind variation, spandrels,
// a pale parapet / cornice line, grimy darker base. Averages to the same tone once sub-pixel (no shimmer).
float along = vWPm.x + vWPm.z;
vec2 fw = fwidth(vec2(vWPm.y / 3.3, along / 2.4));
float sub = clamp(max(fw.x, fw.y) * 1.3, 0.0, 1.0);
vec3 base = diffuseColor.rgb;
if(vGl > 0.5) {
float mul = fract(along / 1.6), fl = fract(vWPm.y / 3.9);
float frame = max(1.0 - step(0.1, mul), 1.0 - step(0.12, fl));
vec3 gl = mix(vec3(0.1, 0.13, 0.16), vec3(0.34, 0.4, 0.46), smoothstep(0.0, 180.0, vWPm.y) * 0.6 + 0.25 * mh(floor(vec2(along / 1.6, vWPm.y / 3.9))));
vec3 c = mix(gl, base * 0.9, frame * 0.8);
diffuseColor.rgb = mix(c, mix(vec3(0.14, 0.17, 0.2), vec3(0.28, 0.33, 0.37), smoothstep(0.0, 200.0, vWPm.y)), sub);
dnE = mix(vec3(0.8, 0.88, 1.0) * (1.0 - frame) * step(0.8, mh(floor(vec2(along / 1.6, vWPm.y / 3.9)) + 5.3)) * 0.5, vec3(0.009, 0.01, 0.012), sub); // (night) sparser, dimmer // (daynight, lighting2 r3) sub-pixel mean was 0.3 (x1.4 x night exposure ~3.6): the far shores glowed as a pale band
} else {
float fl = fract((vWPm.y - 1.2) / 3.3), u = fract(along / 2.4);
float w = step(0.3, fl) * step(fl, 0.82) * step(0.28, u) * step(u, 0.74);
vec2 wid = floor(vec2(along / 2.4, (vWPm.y - 1.2) / 3.3));
vec3 wc = vec3(0.07, 0.08, 0.095) * (0.7 + 0.9 * mh(wid)) + vec3(0.1, 0.09, 0.07) * step(0.93, mh(wid + 3.1));
vec3 c = mix(base, wc, w);
c = mix(c, mix(base, wc, 0.33), sub);
diffuseColor.rgb = c;
dnE = mix(vec3(1.0, 0.72, 0.42) * w * step(0.85, mh(wid + 7.7)) * (0.2 + 0.5 * mh(wid + 2.9)), vec3(0.012, 0.0085, 0.005), sub); // (night) sparse warm sparkle; the sub-pixel mean (was 0.026: x1.4 x4.5 exposure = the tan band) matches it
}
diffuseColor.rgb *= 0.62 + 0.38 * smoothstep(0.0, 14.0, vWPm.y - __SHADER_INJECT_0__);   // contact darkening
}
diffuseColor.rgb *= 1.0 - 0.85 * uNightK; // (night) dark silhouettes at night (critic r1, r3)
// @section fragmentEmissive
#include <emissivemap_fragment>
totalEmissiveRadiance += dnE * uNightK * 1.4;
`,U=`// facade shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
__SHADER_INJECT_0__
// @section vertexFogVertex
#include <fog_vertex>
__SHADER_INJECT_0__
// @section fragmentCommon
#include <common>
__SHADER_INJECT_0____SHADER_INJECT_1__
// @section fragmentMap
Surf FS;
facade(FS);
#ifdef FAR_NIGHT
FS.alb *= 1.0 - 0.8 * uNightK; // (night) far shores: dark silhouettes at night (critic r1: beige-peach masses read like dusk)
#endif
diffuseColor.rgb = FS.alb;
// @section fragmentRoughness
float roughnessFactor = FS.rough;
// @section fragmentMetalness
float metalnessFactor = FS.metal;
// @section fragmentNormalMaps

{
vec3 Nw = normalize(vWN);
vec3 Tw = Nw.y > 0.5 ? vec3(1.0, 0.0, 0.0) : (Nw.y < - 0.5 ? vec3(1.0, 0.0, 0.0) : normalize(cross(vec3(0.0, 1.0, 0.0), Nw)));
vec3 Bw = Nw.y > 0.5 ? vec3(0.0, 0.0, - 1.0) : (Nw.y < - 0.5 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0));
vec3 nw = normalize(Tw * FS.n.x + Bw * FS.n.y + Nw * FS.n.z);
normal = normalize((viewMatrix * vec4(nw, 0.0)).xyz);
}
// @section fragmentEmissive
#include <emissivemap_fragment>
totalEmissiveRadiance += FS.emis;
if(uNightK > 0.0) totalEmissiveRadiance += FS.alb / max(1.0 - gAoT, 0.4) * (1.0 - 0.6 * FS.metal) * crownFlood(vWPos, normalize(vWN)) * uNightK; // (night) crown floods
// @section fragmentPhysicalLights
#include <lights_physical_fragment>
material.specularColor = mix(material.specularColor, vec3(gF0) * gSpecTint, clamp(gGlass, 0.0, 1.0));
material.specularF90 = mix(material.specularF90, 0.55, clamp(gGlass, 0.0, 1.0) * gSash); // (textures r4) 0.3 -> 0.55
// @section fragmentLightsMaps
#include <lights_fragment_maps>
#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV ) && defined( RE_IndirectSpecular )
{
float cg = clamp(gGlass, 0.0, 1.0);
// (render r-refl) the player / web / near peds mirrored about this glass plane (render/glassmirror.ts), laid over the
// glass's own (procedural city) reflection below, before the sash dimming and the Fresnel / specular BRDF
vec4 gmS = cg > 0.001 ? glassMirror(vWPos, normalize(vWN)) : vec4(0.0);
if(cg > 0.001 && vWPos.y <= 2.0) radiance = mix(radiance, gmS.rgb, gmS.a);
if(cg > 0.001 && vWPos.y > 2.0) {
vec3 Rw = inverseTransformDirection(reflect(- geometryViewDir, normal), viewMatrix);
float az = atan(Rw.z, Rw.x) * 7.0 + vS.y * 3.1;
float bk = floor(az), fa = fract(az);
float h1 = fh1(vec2(bk, 3.7)), h2 = fh1(vec2(bk, 9.1)), h3 = fh1(vec2(bk + 0.5, 1.3));
// skyline elevation seen from this window: lower windows see taller neighbours
float hsky = mix(0.03, 0.36, h1 * h1) * (1.0 + 0.8 * (1.0 - smoothstep(20.0, 260.0, vWPos.y))); // (skyline r4) more sky in mid-height glass
hsky *= step(0.12, h3) * (0.85 + 0.3 * step(abs(fa - 0.5), 0.3 * h2)); // gaps + narrower upper shafts
if(vX.z > 3.5 && vX.z < 4.5) hsky *= 0.35; // (skyline r3) the supertall low-iron glass stands above its neighbours: mostly sky
float fwR = fwidth(Rw.y) + 0.004;
float bldg = 1.0 - smoothstep(hsky - fwR, hsky + fwR, Rw.y);
vec3 hz = textureCubeUV(envMap, envMapRotation * normalize(vec3(Rw.x, 0.06, Rw.z)), 0.7).rgb * envMapIntensity;
float sunF = h2 > 0.55 ? 0.58 : 0.27;                          // sunlit vs shaded neighbour face
float rows = 0.8 + 0.2 * step(0.5, fract(Rw.y * 180.0 / max(0.4, 1.0 + 60.0 * fwR)));
vec3 cityC = hz * mix(vec3(0.95, 0.9, 0.82), vec3(0.75, 0.82, 0.95), h3) * sunF * rows;
vec3 streetC = hz * vec3(0.16, 0.17, 0.19);
// (skyline r7) critic: 'right-edge tower is a flat black checkerboard, no reflection'. A high window's steep
// downward ray does not reach the street: it sees the roofscape / lower facades (mid grey, broken up into
// sunlit roofs, shaded canyons and pale parapets) -> dark-but-structured glass instead of a black grid
{
vec2 rq = Rw.xz / max(- Rw.y, 0.2) * (0.6 + 0.5 * vS.y) * 9.0;
float rb = fh1(floor(rq)), rb2 = fh1(floor(rq * 0.37) + 4.1);
vec3 roofC = hz * mix(vec3(0.34, 0.36, 0.39), vec3(0.6, 0.6, 0.59), rb) * (0.75 + 0.35 * rb2); // (skyline r10) lighter: glass seen from above picks up the pale city
streetC = mix(streetC, roofC, smoothstep(35.0, 160.0, vWPos.y));
}
// (skyline r6) critic: 'glass is a matte dark grid, no reflections'. A shallow downward ray (tower seen from above
// or from far away) mirrors the hazy far city / horizon, not the street: bright, cool, with the neighbours'
// lit / shaded faces; only steep rays reach the dark street floor
vec3 farC = hz * mix(vec3(0.62, 0.66, 0.72), vec3(0.9, 0.92, 0.96), h2) * (0.9 + 0.1 * rows);
float dn = smoothstep(0.0, - 0.06, Rw.y);
cityC = mix(cityC, farC, dn * (1.0 - smoothstep(- 0.12, - 0.4, Rw.y)));
cityC = mix(cityC, streetC, smoothstep(- 0.4, - 0.85, Rw.y));
cityC *= 1.0 - 0.85 * uNightK; // (night) the reflected neighbours / streets are dark masses at night (the horizon-glow tint turned far glass towers pale)
cityC = mix(cityC, radiance, 0.24); // keep a hint of sky / haze in the reflected city (stylised, like the refs)
radiance = mix(radiance, cityC, bldg * cg * (1.0 - 0.5 * smoothstep(0.35, 0.8, material.roughness)));
radiance = mix(radiance, gmS.rgb, gmS.a); // (render r-refl)
radiance *= (1.0 - 0.4 * cg * gSash) /* (textures r4) 0.72 -> 0.4 */ * mix(1.0, gSashV, cg * gSash); // (street r11) per-window reflectance // (street r10) old sash glass in a canyon: dim, dusty reflections (dark holes, not pale panes)
}
}
#endif
`,ue=`in vec4 aF;
in vec4 aS;
in vec4 aW;
in vec4 aX;
in vec3 aTint;
out vec2 vFac;
flat out vec4 vF;
flat out vec4 vS;
flat out vec4 vW;
flat out vec4 vX;
flat out vec3 vTint;
out vec3 vWPos;
out vec3 vWN;
`,de=`vFac = uv;
vF = aF;
vS = aS;
vW = aW;
vX = aX;
vTint = aTint;
vec4 fwp = modelMatrix * vec4(transformed, 1.0);
vWPos = fwp.xyz;
vWN = normalize(mat3(modelMatrix) * objectNormal);
`,fe=`uniform highp sampler2DArray tWallC;
uniform highp sampler2DArray tWallN;
uniform highp sampler2DArray tWallH;
uniform sampler2D tDetail;
uniform sampler2D tInterior;
uniform sampler2D tSigns;
uniform sampler2D tNoise;
uniform float uInteriorGain;
uniform float uShopGain;
uniform float uNightK;
uniform float uDnTime; // (daynight)
// (night) landmark crown floodlights (addCrownFlood): per flood A = lit box x0,z0,x1,z1; B = y0 (terrace), y1, reach
// (m), pad; C = rgb x gain. uFlBB: union box (x0, z0, x1, z1), uFlY: lowest y0, count
uniform vec4 uFl[__SHADER_INJECT_0__];
uniform vec4 uFlBB;
uniform vec2 uFlY;
vec3 crownFlood(vec3 p, vec3 n) {
  vec3 E = vec3(0.0);
  if(uFlY.y < 0.5 || p.y < uFlY.x - 0.5 || p.x < uFlBB.x || p.z < uFlBB.y || p.x > uFlBB.z || p.z > uFlBB.w)
    return E;
  for(int i = 0; i < __SHADER_INJECT_1__; i++) {
    if(float(i) >= uFlY.y)
      break;
    vec4 A = uFl[i * 3], B = uFl[i * 3 + 1], C = uFl[i * 3 + 2];
    if(p.y < B.x - 0.3 || p.y > B.y || p.x < A.x - B.w || p.x > A.z + B.w || p.z < A.y - B.w || p.z > A.w + B.w)
      continue;
    float h = B.z > 0.0 ? p.y - B.x : B.y - p.y; // reach < 0: spill falling off DOWNWARD from y1 (under a lit lip)
    float rz = abs(B.z);
    // fixtures on the terrace aimed up the face: brightest just above the setback, a long soft falloff, a scallop per
    // fixture along the face (4 m pitch); soffits / ledge undersides catch it, terrace floors a little
    float along = abs(n.x) > 0.5 ? p.z : p.x;
    float sc = 0.8 + 0.2 * cos(along * 1.5708) * exp(-h / (0.6 * rz));
    float f = (0.01 + 0.99 * exp(-h / rz)) * smoothstep(-0.3, 0.4, h) * sc; // (critic r1/r3) a 3-4 m up-light band at each setback lip, ~20 % by the next setback
    if(C.w > 0.0) {
      float sp = max(cos(along * 6.2832 / C.w), 0.0);
      f *= 0.25 + 0.75 * sp * sp;
    } // (night) vertical flood streaks on the piers, dark mullions between (C.w = pitch m)
    E += C.rgb * f * (abs(n.y) < 0.5 ? 1.0 : (n.y < 0.0 ? 0.9 : 0.3));
  }
  return E;
}
in vec2 vFac;
flat in vec4 vF;
flat in vec4 vS;
flat in vec4 vW;
flat in vec4 vX;
flat in vec3 vTint;
in vec3 vWPos;
in vec3 vWN;

float fh1(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float fh1b(vec3 p) {
  return fh1(p.xy + p.z * 17.13);
}
// (night) integer hash (lowbias32), mirrored bit-exactly in JS (nh3js): lit-window decisions shared with the window-light provider
uint nhu(uint x) {
  x ^= x >> 16;
  x *= 0x7feb352du;
  x ^= x >> 15;
  x *= 0x846ca68bu;
  x ^= x >> 16;
  return x;
}
uint nh3(uint a, uint b, uint c) {
  return nhu(a * 73856093u ^ nhu(b * 19349663u ^ nhu(c * 83492791u)));
}
float nh01(uint h) {
  return float(h >> 8) / 16777216.0;
}
float layerScale(float L) {
  if(L > 12.5)
    return L < 13.5 ? 3.0 : (L < 14.5 ? 3.0 : 1.8); // (textures r2) terracotta 8 rows / 3 m, stucco, red brick 2 (24 courses)
  return L < 2.5 ? 1.8 /* (street r10) 2.4 -> 1.8: finer brick (director: 'brick texel scale reads too big') */ : (L < 3.5 ? 3.0 : (L < 4.5 ? 4.0 : (L < 5.5 ? 3.0 : (L < 6.5 ? 2.0 : (L < 7.5 ? 2.4 : (L < 8.5 ? 8.0 : (L < 9.5 ? 4.0 : (L < 10.5 ? 8.0 : (L < 11.5 ? 8.0 : 4.0)))))))));
}
// relief depth (m) of each layer's height map, for parallax
float layerDepth(float L) {
  if(L > 12.5)
    return L < 13.5 ? 0.008 : (L < 14.5 ? 0.004 : 0.014); /* (textures r2) */ 
  return L < 2.5 ? 0.014 : (L < 3.5 ? 0.01 : (L < 4.5 ? 0.008 : (L < 7.5 ? 0.004 : (L < 8.5 ? 0.006 : (L < 9.5 ? 0.02 : (L < 10.5 ? 0.004 : (L < 11.5 ? 0.008 : 0.02)))))));
}
vec3 gVt = vec3(0.0, 0.0, 1.0);
float gPar = 0.0;
float gDet = 0.0;
vec2 gOff = vec2(0.0);
struct Surf {
  vec3 alb;
  float rough;
  float metal;
  vec3 n;
  vec3 emis;
};
vec2 gDx, gDy;
float gLodI;
float gGlass = 0.0;
float gF0 = 0.04; // coated-glass reflectance weight/value // screen-space UV gradients (computed in uniform control flow)
float gWeather = 0.0;
Surf wallSurf(vec2 uvm, float L, vec3 tint) {
  float s = layerScale(L);
  vec2 uv = (uvm + gOff) / s;
  vec2 dx = gDx / s, dy = gDy / s;
  // (textures r3) limestone ashlar (L3): the 3 m tile's 6 courses repeat block-for-block on close walls. Each course
  // (bed joints measured in walls_col layer 3: v' = fract(v - 0.1455) at 0/.1694/.3398/.5097/.6797/.8301) gets its own
  // random slide along the wall (the seam hides in the bed joint) and each block (head joints: even courses 0.6367, odd
  // 0.3174 / 0.955) its own tone, so no two courses or blocks line up across tiles. Pure UV math, no texture tap.
  float lsTone = 1.0;
  vec3 lsHue = vec3(1.0);
  if(L > 2.5 && L < 3.5) {
    float vp = uv.y - 0.1455, fy = fract(vp);
    float ri = fy < 0.1694 ? 0.0 : (fy < 0.3398 ? 1.0 : (fy < 0.5097 ? 2.0 : (fy < 0.6797 ? 3.0 : (fy < 0.8301 ? 4.0 : 5.0))));
    float g = floor(vp) * 6.0 + ri;
    vec2 bs = gOff * 3.17 + vec2(g * 0.713, g * 1.37);
    uv.x += fh1(bs);
    float odd = mod(ri, 2.0);
    float tx = uv.x - (odd > 0.5 ? 0.3174 : 0.6367);
    float bk = odd > 0.5 ? floor(tx) * 2.0 + step(0.6376, fract(tx)) : floor(tx);
    float h1 = fh1(bs + vec2(bk * 0.917, 3.3)), h2 = fh1(bs + vec2(5.1, bk * 1.31));
    lsTone = 0.86 + 0.2 * h1;
    lsHue = mix(vec3(1.0), h2 > 0.5 ? vec3(1.04, 1.0, 0.93) : vec3(0.95, 0.97, 1.0), abs(h2 - 0.5) * 1.6);
  }
  // parallax offset from the baked height (close range only; 2 taps: coarse + refine)
  vec3 hao = textureGrad(tWallH, vec3(uv, L), dx, dy).rgb;
  if(gPar > 0.0) {
    vec2 pv = gVt.xy / max(gVt.z, 0.35) * layerDepth(L) / s * gPar;
    vec2 uv1 = uv + pv * (hao.r - 0.55);
    hao = textureGrad(tWallH, vec3(uv1, L), dx, dy).rgb;
    uv = uv + pv * (hao.r - 0.55);
  }
  // footprint (texels per pixel): when the mortar / gravel period nears 2-4 px, pre-filter a little harder, lower the
  // pattern contrast toward the layer average and convert lost normal variance into roughness (Toksvig-style)
  float tpp = min(length(dx), length(dy)) * 1024.0; // minor footprint axis: the major axis at grazing angles is anisotropic filtering's job
  float fl = smoothstep(3.0, 10.0, tpp);
  dx *= 1.0 + 0.3 * fl;
  dy *= 1.0 + 0.3 * fl;
  vec3 c = textureGrad(tWallC, vec3(uv, L), dx, dy).rgb;
  vec3 d = textureGrad(tWallN, vec3(uv, L), dx, dy).rgb;
  vec3 cAvg = textureLod(tWallC, vec3(0.5, 0.5, L), 10.0).rgb;
  c = mix(c, cAvg, 0.15 * fl); // light touch: the mips already average the mortar
  // one coherent, weathered-muted palette (user feedback): pull every layer toward its own average (-15 % contrast)
  // and desaturate 18 %, keeping the layer's brightness
  c = mix(cAvg, c, 0.85);
  c = mix(vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))), c, 0.82);
  c *= lsTone * lsHue; // (textures r3) per-block limestone tone
  // (textures) building-scale weathering the 1.8 m brick tile cannot carry without repeating (refs/city3 street_curvedcurb):
  // peeling whitewash / old paint left on the brick faces (mortar shows through), darker re-pointed / patched brick areas,
  // and blotchy stains on stone + concrete. World-space macro noise per building (gOff), no extra texture fetch but two
  // lod-0 noise taps.
  if(L < 4.5 || L > 12.5 || (L > 6.5 && L < 7.5)) { // (textures r2) + terracotta / stucco / red brick 2 / white brick (critic: 'white brick clean')
    vec2 wq = uvm + gOff * 13.0;
    vec3 n1 = textureLod(tNoise, wq / vec2(17.0, 11.0), 0.0).rgb;
    vec3 n2 = textureLod(tNoise, wq / vec2(2.3, 1.7) + 0.37, 0.0).rgb;
    float face = smoothstep(0.3, 0.62, hao.r);
    if(L < 2.5 || L > 14.5) {
      float bsel = fract(gOff.x * 7.13 + gOff.y * 3.1); // only ~1 in 3 brick buildings carries old paint
      float pAmt = (L < 0.5 || L > 14.5 ? 1.0 : (L < 1.5 ? 0.6 : 0.4)) * step(bsel, 0.25); // (textures r2) 0.35 -> 0.25 of brick buildings
      float paint = smoothstep(0.76, 0.86, n1.r + 0.05 * (n2.g - 0.5)) * pAmt; // (textures r5) softer, fewer: 'noisy white speckle' // (textures r2) 0.7 -> 0.74: read as leprous speckle
      vec3 pc = vec3(0.68, 0.66, 0.62) * (0.88 + 0.16 * n2.b);
      c = mix(c, mix(pc, c, 0.3), paint * mix(0.5, 1.0, face) * 0.42); // (textures r5) 0.6 -> 0.42
      float rep = smoothstep(0.7, 0.76, n1.g + 0.15 * (n2.r - 0.5));
      c *= mix(vec3(1.0), vec3(1.02, 0.9, 0.86) * 0.86, rep * face);
      c *= 1.0 - 0.1 * smoothstep(0.55, 0.8, n1.b) * (1.0 - face * 0.5); // dirty mortar patches
    } else {
      float st = smoothstep(0.55, 0.85, n1.g * 0.8 + n2.r * 0.35);
      c *= 1.0 - 0.16 * st;
      c = mix(c, c * vec3(1.03, 1.0, 0.94), smoothstep(0.6, 0.8, n1.r) * 0.6);
    }
  }
  // (textures r4) critic: 'brick washed out, too much sheen, weak mortar'. Brick: darker recessed mortar (height-driven,
  // fades once the joints are sub-pixel), matte faces with per-brick roughness breakup; all masonry gets a stronger relief
  // normal at close / mid range so walls stop reading as printed images
  bool brickL = L < 2.5 || L > 14.5 || (L > 6.5 && L < 7.5);
  bool masonL = L < 4.5 || L > 5.5 && L < 8.0 || L > 12.5;
  if(brickL)
    c *= mix(mix(0.62, 0.8, fl), 1.0, smoothstep(0.28, 0.55, hao.r));
  float rbk = textureLod(tNoise, uv * vec2(9.0, 22.0) + 0.3, 0.0).g; // per-brick-ish roughness breakup
  Surf o;
  o.alb = c * tint * mix(1.0, hao.g, 0.7 * (1.0 - 0.3 * fl));
  o.rough = min(1.0, d.b + 0.12 * fl);
  o.metal = (L > 4.5 && L < 5.5) ? 0.6 : 0.0;
  if(masonL)
    o.rough = clamp(max(o.rough, 0.74) + 0.18 * (rbk - 0.5), 0.6, 1.0);
  vec2 nxy = (d.rg * 2.0 - 1.0) * (1.0 - 0.5 * fl) * (masonL ? 1.0 + 0.7 * (1.0 - fl) : 1.0); // (textures r4) x1.7 relief
  if(gDet > 0.0) { // micro detail normal (0.5 m tile) close to the camera
    vec2 dn = textureGrad(tDetail, uvm * 2.0, gDx * 2.0, gDy * 2.0).rg * 2.0 - 1.0;
    nxy += dn * gDet * (L > 4.5 && L < 7.5 ? 0.25 : 0.6);
  }
  o.n = normalize(vec3(nxy, sqrt(max(0.0, 1.0 - dot(nxy, nxy)))));
  o.emis = vec3(0.0);
  gWeather = hao.b;
  return o;
}
// (textures r2) grime / leak decal sheet ($imagegen, walls_hao layer 16): R, G, B each hold 8 columns of vertical
// streak masks (1 = soot) whose source is at the top. q.x 0..1 across the decal, q.y 0 (source) .. 1 (fade end); g = dq
// per unit of vFac (screen gradients come from gDx / gDy, computed in uniform control flow)
float grimeDecal(vec2 q, vec2 g, float id) {
  if(q.x <= 0.0 || q.x >= 1.0 || q.y <= 0.0 || q.y >= 1.0)
    return 0.0;
  float col = mod(id, 8.0), ch = floor(id / 8.0);
  vec2 k = vec2(g.x / 8.0, -g.y);
  vec3 m = textureGrad(tWallH, vec3((col + clamp(q.x, 0.02, 0.98)) / 8.0, 1.0 - q.y, 16.0), gDx * k, gDy * k).rgb;
  return ch < 0.5 ? m.r : (ch < 1.5 ? m.g : m.b);
}
// AA box mask: 1 inside [a,b] with filter width w
// box-filtered coverage of [a,b] over the pixel footprint [x - w/2, x + w/2]: features thinner than a pixel fade to
// their true coverage instead of popping between 0 and >= 0.5 (mullion / frame crawl)
float boxAA(float x, float a, float b, float w) {
  w *= 1.2;
  return clamp((min(b, x + 0.5 * w) - max(a, x - 0.5 * w)) / w, 0.0, 1.0);
}
// skyline: box-filtered coverage of the PERIODIC interval [a,b] + k*p over [x - w/2, x + w/2] (exact integral of the
// periodic step). Resolves window rows / piers at any distance and converges to the true average (b-a)/p once the
// period is sub-pixel -> distant towers keep their floor bands and pier lines instead of turning into flat boxes.
float pInt(float x, float p, float a, float b) {
  float k = floor(x / p);
  return k * (b - a) + clamp(x - k * p - a, 0.0, b - a);
}
float pbox(float x, float p, float a, float b, float w) {
  w = max(w, 1e-4);
  return clamp((pInt(x + 0.5 * w, p, a, b) - pInt(x - 0.5 * w, p, a, b)) / w, 0.0, 1.0);
}
vec3 gSpecTint = vec3(1.0); // coated-glass reflection tint (curtain walls)
float gSash = 0.0; // (street r9) old masonry sash glass: lower grazing (F90) reflectance
float gSashV = 1.0; // (street r11) per-window reflection strength of old sash glass (wavy / dusty / cleaned panes)
float gAoT = 0.0; // (night) setback contact shade: the crown flood lights the un-shaded albedo (its band sits right there)
float gBlN = 0.0, gCurN = 0.0, gAcN = 0.0, gCovN = 0.0; // (night) blind / curtain / AC-unit masks, far-LOD glass coverage
vec2 gWob = vec2(0.0); // (skyline r5) low-frequency curtain-wall panel deflection (wavy, broken reflections at any range)

// Interior mapping into a room box [0,rw]x[0,rh]x[-rd,0], entering at p (z=0) along dir (dir.z<0)
vec3 interior(vec2 p, vec3 dir, float rw, float rh, float rd, float tile, float lit, float shop) {
  vec3 invd = 1.0 / dir;
  float tx = dir.x > 0.0 ? (rw - p.x) * invd.x : -p.x * invd.x;
  float ty = dir.y > 0.0 ? (rh - p.y) * invd.y : -p.y * invd.y;
  float tz = -rd * invd.z;
  float t = min(min(tx, ty), tz);
  vec3 h = vec3(p, 0.0) + dir * t;
  float depth = clamp(-h.z / rd, 0.0, 1.0);
  vec2 tileUV = vec2(mod(tile, 4.0), floor(tile / 4.0));
  vec3 col;
  if(t == tz) {
    vec2 q = vec2(h.x / rw, h.y / rh);
    if(shop > 0.5 && rw > 4.5) {
      float nT = floor(rw / 3.2 + 0.5);
      q.x = fract(h.x / rw * nT);
    } // (night) wide shop room: the shelving wall tiles every ~3 m
    q = clamp(q, 0.01, 0.99);
    col = textureLod(tInterior, vec2((tileUV.x + q.x) / 4.0, 1.0 - (tileUV.y + 1.0 - q.y) / 4.0), gLodI).rgb;
  } else if(t == ty) {
    if(dir.y > 0.0) { // ceiling
      vec2 c = vec2(h.x / rw, -h.z / rd);
      float panel = step(abs(c.x - 0.5), 0.22) * step(abs(fract(c.y * 2.0) - 0.5), 0.18);
      // ceiling tiles + recessed troffers (dim in daylight, soft-edged, fading with room depth so they sit on the ceiling)
      float pe = smoothstep(0.26, 0.2, abs(c.x - 0.5)) * smoothstep(0.22, 0.15, abs(fract(c.y * 2.0) - 0.5));
      col = vec3(0.72, 0.72, 0.7) * (0.75 + 0.25 * lit) + pe * lit * vec3(0.55, 0.53, 0.48) * (1.0 + shop) * (1.0 - 0.6 * c.y);
      if(shop > 0.5)
        col *= mix(1.0, 0.5, uNightK); // (night) critic r3: shop ceilings clipped to white panels
    } else { // floor
      col = shop > 0.5 ? vec3(0.55, 0.52, 0.48) : (tile < 5.5 ? vec3(0.23, 0.24, 0.26) : vec3(0.36, 0.25, 0.17));
    }
  } else {
    col = textureLod(tInterior, vec2((tileUV.x + 0.5) / 4.0, 1.0 - (tileUV.y + 0.6) / 4.0), 7.0).rgb * (dir.x > 0.0 ? 0.8 : 0.7);
    if(shop > 0.5)
      col *= mix(1.0, 0.5, uNightK); // (night) shop side walls: flat mip colour, keep them subordinate to the lit shelving
    if(uNightK > 0.5) { // (night) side walls seen through lit windows at a grazing angle: real content (the tile's furniture /
      // shelving mapped along the room depth, darker, mirrored) and a lamp-light falloff from the window wall, not a flat mip
      vec2 sq2 = clamp(vec2(fract(-h.z / max(rd, 0.1) * 1.3), h.y / rh), 0.02, 0.98);
      vec3 sc2 = textureLod(tInterior, vec2((tileUV.x + (dir.x > 0.0 ? sq2.x : 1.0 - sq2.x)) / 4.0, 1.0 - (tileUV.y + 1.0 - sq2.y) / 4.0), gLodI + 1.0).rgb;
      col = sc2 * (dir.x > 0.0 ? 0.62 : 0.55) * (shop > 0.5 ? 0.8 : 1.0) * (0.75 + 0.35 * smoothstep(0.0, 1.0, h.y / rh));
    }
    col *= mix(0.7, 1.0, clamp(h.y / rh, 0.0, 1.0));
  }
  col *= mix(1.0, 0.55, depth);
  return col * mix(0.55, 1.0, lit);
}

void facade(out Surf o) {
  vec3 N = normalize(vWN);
  gDx = dFdx(vFac);
  gDy = dFdy(vFac);
  o.alb = vec3(0.0);
  o.rough = 1.0;
  o.metal = 0.0;
  o.n = N;
  o.emis = vec3(0.0);
  float roofL = 8.0;
  float Lw = mod(vS.x, 16.0);
  float Lb = mod(floor(vS.x / 16.0 + 0.01), 16.0);
  float tierY = floor(vS.x / 256.0 + 0.001); // (skyline r12) base height of this set-back tier (0 = street mass)
  float style = vS.w + 0.01;
  float seed = vS.y;
  vec3 tint = vTint;
  // (textures r2) extra wall materials without touching the zoning code: a per-building hash re-skins some walls
  // (texture layer only; Lw keeps driving the zoning logic): ~45 % of red brick -> orange-red common-bond tenement brick,
  // the warm 'ochre' limestone + some buff brick -> terracotta ashlar, some low concrete / white-brick walls -> stucco
  float LwT = Lw;
  {
    float vq = fract(seed * 9.271 + 0.137);
    if(Lw < 0.5 && vq < 0.45)
      LwT = 15.0;
    else if((Lw > 2.5 && Lw < 3.5 && vTint.r - vTint.b > 0.18 && vq < 0.8) || (Lw > 1.5 && Lw < 2.5 && vq < 0.18))
      LwT = 13.0;
    else if(((Lw > 3.5 && Lw < 4.5) || (Lw > 6.5 && Lw < 7.5)) && vW.y - vW.z < 30.0 && vq < 0.4)
      LwT = 14.0;
    // (textures r4) critic: 'pale buff brick on every building; push brick reds / browns'. Some buff walls become
    // sooty brown or orange-red common brick (texture only; the zoning family / tint is kept)
    else if(Lw > 1.5 && Lw < 2.5 && vq >= 0.18 && vq < 0.36)
      LwT = 1.0;
    else if(Lw > 1.5 && Lw < 2.5 && vq >= 0.36 && vq < 0.5)
      LwT = 15.0;
  }
  // large-scale grime/tone variation
  vec3 nz = textureLod(tNoise, vWPos.xz / 180.0 + vWPos.y / 300.0, 0.0).rgb;
  vec3 nz2 = textureLod(tNoise, vWPos.xz / 23.0 + vWPos.y / 41.0 + 0.5, 0.0).rgb; // mid-scale macro variation (kills tiling)
  float camD = length(cameraPosition - vWPos);
  gPar = 1.0 - smoothstep(12.0, 35.0, camD);
  gDet = 1.0 - smoothstep(6.0, 22.0, camD);
  gOff = vec2(fract(seed * 0.618), fract(seed * 0.377)) * 8.0; // per-building texture offset: neighbours never tile in lockstep
  vec3 V = normalize(cameraPosition - vWPos);
  if(N.y > 0.5) {
    gVt = vec3(V.x, -V.z, V.y);
    vec3 rt = tint * (0.8 + 0.4 * nz.r) * (0.9 + 0.2 * nz2.g);
    // (textures r5) critic: 'flat pale-grey roof slabs' (uncovered roofs on the membrane layer 10: mean 0.71, almost no
    // detail) and 'untextured black box' (metal-panel bulkhead tops, layer 5). Per-building roof family: seamed dark
    // mod-bit, warm gravel ballast, buff pavers, or a dirtier grey membrane; metal bulkhead tops get rolled roofing.
    {
      float rq = fract(seed * 7.13 + 0.41);
      if(Lw > 9.5 && Lw < 10.5) {
        if(rq < 0.3) {
          Lw = 8.0;
          rt *= 1.3;
        } else if(rq < 0.52) {
          Lw = 9.0;
          rt *= vec3(1.08, 0.98, 0.86);
        } else if(rq < 0.64) {
          Lw = 11.0;
          rt *= vec3(1.02, 0.93, 0.84);
        } else
          rt *= 0.66 * vec3(1.0, 0.97, 0.93);
      } else if(Lw > 4.5 && Lw < 5.5) {
        Lw = 8.0;
        rt = vec3(1.25, 1.24, 1.2) * (0.9 + 0.2 * nz2.g);
      }
    }
    o = wallSurf(vFac, Lw, rt);
    // roofs: dirt collects near parapets/edges is handled by AO; add broad wet/dirty patches
    if(Lw > 7.5) {
      o.alb *= 1.0 - 0.25 * smoothstep(0.55, 0.85, nz2.b);
      o.rough = mix(o.rough, 0.55, smoothstep(0.6, 0.9, nz2.b) * gWeather);
    }
    if(Lw > 7.5 && gDet > 0.0) { // close range: 3.7x rotated re-sample of the same roof layer sharpens granules / gravel
      float sc = layerScale(Lw) / 3.7;
      mat2 R = mat2(0.8, -0.6, 0.6, 0.8);
      vec3 dcol = textureGrad(tWallC, vec3(R * vFac / sc + 0.31, Lw), R * gDx / sc, R * gDy / sc).rgb;
      float la = dot(textureLod(tWallC, vec3(0.5, 0.5, Lw), 10.0).rgb, vec3(0.333));
      o.alb *= mix(1.0, clamp(dot(dcol, vec3(0.333)) / max(la, 0.02), 0.6, 1.5), 0.45 * gDet);
    }
    // (textures r3) critic: 'flat roofs uniform dark grey with fine noise, no seams, tar patches, flashing, drains'.
    // World-space roof wear, all analytic (no texture tap), box-filtered by the pixel footprint so it resolves from the
    // rooftops to the aerial view: rolled-roofing lap seams (bitumen / membrane, 0.95 m strips, staggered end laps),
    // sharp-edged glossy tar repairs, roof drains with a dark silt ring, and ponding tide-lines in the low spots.
    if(Lw > 7.5 && Lw < 11.5) {
      vec2 rp = vFac + gOff * 7.0;
      float fw = max(length(gDx), length(gDy)) + 1e-4;
      bool rot = fract(seed * 3.71) > 0.5;
      vec2 sp = rot ? rp.yx : rp;
      if(Lw < 8.5 || (Lw > 9.5 && Lw < 10.5)) {
        float sw = 0.95, si = floor(sp.y / sw), sf = sp.y - si * sw;
        float lap = pbox(sp.y, sw, 0.0, 0.05, fw);
        float bleed = pbox(sp.y, sw, 0.05, 0.13, fw);
        float endL = 9.0 + 3.0 * fh1(vec2(si, seed)), ex = sp.x + fh1(vec2(seed, si)) * endL;
        float endLap = pbox(ex, endL, 0.0, 0.06, fw) * boxAA(sf, 0.05, sw, fw);
        float stripT = 0.94 + 0.12 * fh1(vec2(si, floor(ex / endL) + seed));
        float fade = 1.0 - smoothstep(0.06, 0.25, fw); // seams dissolve into the average once sub-pixel
        o.alb *= mix(1.0, stripT, fade);
        o.alb *= 1.0 - (Lw < 8.5 ? 0.3 : 0.2) * max(lap, endLap) * fade;
        o.alb *= 1.0 + (Lw < 8.5 ? 0.12 : -0.06) * bleed * fade;
        o.rough = mix(o.rough, 0.45, lap * fade * 0.6);
      }
      // tar repairs: ~1 per 3 cells of 6 x 7 m, 0.5-2.4 m, jagged-ish edges from the noise
      vec2 cg = vec2(6.0, 7.0), ci = floor(rp / cg), cf = rp - ci * cg;
      float h1 = fh1(ci + seed * 0.13), h2 = fract(h1 * 71.3 + 0.2), h3 = fract(h1 * 13.7 + 0.6);
      if(h1 < 0.36) {
        vec2 hs = vec2(0.25 + 1.0 * h2, 0.25 + 0.9 * h3), cc = vec2(1.3 + 3.4 * h3, 1.3 + 4.4 * h2);
        vec2 dq = abs(cf - cc) - hs;
        float dd = max(dq.x, dq.y) + 0.12 * (nz2.r - 0.5);
        float inT = 1.0 - smoothstep(-fw, fw, dd);
        o.alb = mix(o.alb, vec3(0.055, 0.052, 0.05) * (0.8 + 0.4 * nz2.g), inT * 0.85);
        o.rough = mix(o.rough, 0.32, inT);
      }
      // drains: one per 12 x 11 m cell (inset from the cell edge), dark grate + silt ring
      vec2 dg = vec2(12.0, 11.0), di = floor(rp / dg), df = rp - di * dg;
      vec2 dc = vec2(3.0, 3.0) + vec2(fh1(di + 7.1), fh1(di + 3.3)) * vec2(6.0, 5.0);
      float dr = length(df - dc);
      float silt = 1.0 - smoothstep(0.15, 1.1 + 0.4 * nz2.b, dr);
      o.alb *= 1.0 - 0.3 * silt;
      o.alb = mix(o.alb, vec3(0.03), 1.0 - smoothstep(0.13 - fw, 0.13 + fw, dr));
      o.rough = mix(o.rough, 0.4, silt * 0.7);
      // ponding: darker damp low spots with a pale dried tide-line at their edge
      float pn = textureLod(tNoise, rp / 9.0 + 0.71, 0.0).g * 0.7 + nz2.b * 0.3;
      float pond = smoothstep(0.62, 0.7, pn);
      float tide = (1.0 - smoothstep(0.0, 0.012 + fw * 0.05, abs(pn - 0.62))) * (1.0 - smoothstep(0.1, 0.4, fw));
      o.alb *= (1.0 - 0.18 * pond) * (1.0 + 0.25 * tide);
      o.rough = mix(o.rough, 0.5, pond * 0.5);
    }
    return;
  }
  if(N.y < -0.5) {
    o = wallSurf(vFac, LwT, tint * 0.6);
    return;
  } // (textures r2) LwT
  vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), N));
  vec3 Vt = vec3(dot(V, T), V.y, max(dot(V, N), 0.06));
  gVt = vec3(Vt.x, Vt.y, dot(V, N));
  vec3 dirIn = vec3(-Vt.x, -Vt.y, -Vt.z);
  float u = vFac.x;
  float y = vFac.y - vW.z;
  float faceW = vW.x;
  float topY = vW.y - vW.z;
  float aw = max(fwidth(u), 1e-4);
  float ah = max(fwidth(vFac.y), 1e-4);
  gLodI = clamp(log2(max(aw, ah) * 512.0 / max(vF.y, 2.0)) + 0.5, 0.0, 9.0);
  float gHs = vS.z;
  float gH = abs(gHs);
  // base wall
  // (skyline r5) per-building colour identity (value +-9 %, warm / cool shift) + broad soot blotches, so neighbouring
  // blocks of the same layer never read as one repeated atlas
  float bv = fract(seed * 13.73 + 0.29), bh = fract(seed * 5.91 + 0.61) * 2.0 - 1.0;
  vec3 bTone = (0.91 + 0.18 * bv) * vec3(1.0 + 0.045 * bh, 1.0 + 0.008 * bh, 1.0 - 0.05 * bh);
  // (textures r4) per-building masonry identity: brick walls get one of cream / buff / grey / tan / red-brown casts and a
  // -10..-25 % value drop (critic: 'brick bright, washed-out, the same on every building')
  bool brickW = LwT < 2.5 || LwT > 14.5 || (LwT > 6.5 && LwT < 7.5);
  if(brickW) {
    float pq = fract(seed * 17.31 + 0.53);
    vec3 bCast = pq < 0.2 ? vec3(0.9, 0.9, 0.92) : (pq < 0.4 ? vec3(1.04, 0.95, 0.84) : (pq < 0.55 ? vec3(1.08, 0.9, 0.8) : (pq < 0.7 ? vec3(0.96, 0.97, 0.98) * 0.92 : vec3(1.0))));
    bTone *= bCast * (0.95 - 0.13 * fract(seed * 29.7));
  } else if(LwT < 4.5 || LwT > 12.5)
    bTone *= 0.93 - 0.08 * fract(seed * 29.7);
  o = wallSurf(vec2(u, vFac.y), LwT /* (textures r2) */, tint * bTone * (0.88 + 0.24 * nz.g) * (0.93 + 0.14 * nz2.r) * (1.0 - 0.14 * smoothstep(0.5, 0.85, nz.b)));
  // ground grime & soot, dark drip band under the coping / cornice, wet-looking streak roughness
  o.alb *= mix(0.72, 1.0, smoothstep(0.0, 2.5, y));
  if(style < 1.5 || style > 2.5) {
    // (textures r4) heavy large-scale weathering (critic: 'repeating AO smudges, clean facades'):
    //  - street grime: sooty value + desaturation rising 4-12 m from the pavement, ragged top edge
    //  - water staining under the coping / cornice: long dark streak columns 3-14 m, some greenish
    //  - soot: per-building amount; big blotches weighted to the upper floors and the building corners
    vec3 wn = textureGrad(tNoise, vec2(u * 0.08 + seed * 0.71, y * 0.05), gDx * vec2(0.08, 0.0), gDy * vec2(0.0, 0.05)).rgb;
    float gTop = 4.0 + 8.0 * fract(seed * 3.77) + 3.0 * (wn.r - 0.5);
    float sg = (1.0 - smoothstep(0.0, gTop, y)) * (0.6 + 0.4 * wn.g);
    vec3 sootC = vec3(0.34, 0.32, 0.3);
    o.alb = mix(o.alb, o.alb * sootC * 1.5, 0.55 * sg);
    float colN = textureGrad(tNoise, vec2(u * 0.55 + seed * 1.3, 0.37), gDx * vec2(0.55, 0.0), gDy * vec2(0.55, 0.0)).b;
    float runL = 3.0 + 11.0 * colN;
    float dTop = topY - y;
    float stain = smoothstep(0.45, 0.75, colN) * (1.0 - smoothstep(0.0, runL, dTop)) * (0.65 + 0.35 * wn.b);
    vec3 stC = mix(vec3(0.5, 0.48, 0.46), vec3(0.46, 0.5, 0.45), step(0.7, fract(seed * 5.5)));
    o.alb = mix(o.alb, o.alb * stC, stain * 0.8);
    o.rough = mix(o.rough, 0.55, stain * 0.5);
    float sootAmt = fract(seed * 41.3);
    sootAmt = sootAmt * sootAmt;
    vec3 sn = textureGrad(tNoise, vec2(u, y) * 0.035 + seed * 0.19, gDx * 0.035, gDy * 0.035).rgb;
    float corner = 1.0 - smoothstep(0.0, 3.0, min(u, faceW - u));
    float soot = smoothstep(0.45, 0.8, sn.r + 0.25 * corner + 0.2 * smoothstep(0.3, 1.0, y / max(topY, 1.0))) * (0.3 + 0.7 * sootAmt);
    o.alb *= 1.0 - 0.24 * soot; // (textures r5) 0.38 -> 0.24: under lighting2 r3's contrast the blotches read as camouflage
  }
  if(style < 1.5 || style > 2.5) { // (textures r2) decal-sheet splash grime rising from the pavement + leaks from the coping
    float gs = 2.6, gi = floor(u / gs), gr = fh1(vec2(gi + seed * 1.7, seed * 5.3));
    float gSp = grimeDecal(vec2(u / gs - gi, y / (0.9 + 1.6 * gr)), vec2(1.0 / gs, 1.0 / (0.9 + 1.6 * gr)), floor(gr * 24.0));
    o.alb *= 1.0 - 0.3 * gSp;
    float gLen = 3.0 + 10.0 * fract(gr * 7.3);
    float gCo = grimeDecal(vec2(u / gs - gi, (topY - 0.2 - y) / gLen), vec2(1.0 / gs, 1.0 / gLen), floor(fract(gr * 3.7) * 24.0));
    o.alb *= 1.0 - 0.34 * gCo * step(0.3, fract(gr * 11.1));
  }
  float drip = (1.0 - smoothstep(0.0, 3.0, topY - y)) * (0.5 + 0.5 * textureGrad(tNoise, vec2(u * 0.35, 0.3 * seed), gDx * vec2(0.35, 0.0), gDy * vec2(0.35, 0.0)).g);
  o.alb *= 1.0 - 0.22 * drip;
  o.rough = clamp(o.rough - 0.08 * gWeather, 0.05, 1.0);
  // (skyline r2) long vertical rain / soot streaks (0.5-3 m wide, tens of metres long), strongest under the coping and
  // setback ledges, plus a soft value gradient (tall walls darken toward the street, the top floors wash out slightly)
  if(style < 1.5 || style > 2.5) {
    vec2 sq = vec2(u * 0.0045 + seed * 0.37, vFac.y * 0.0009);
    float stk = textureGrad(tNoise, sq, gDx * vec2(0.0045, 0.0009), gDy * vec2(0.0045, 0.0009)).g;
    float stk2 = textureGrad(tNoise, sq * vec2(3.1, 1.3) + 0.21, gDx * vec2(0.014, 0.0012), gDy * vec2(0.014, 0.0012)).b;
    float under = 0.45 + 0.55 * (1.0 - smoothstep(0.0, 26.0, topY - y));
    o.alb *= 1.0 - (0.2 * smoothstep(0.52, 0.8, stk) + 0.1 * smoothstep(0.55, 0.85, stk2)) * under;
    o.alb *= mix(0.86, 1.04, smoothstep(0.0, 70.0, y));
    // (skyline r9) critic: 'hero tower reads as a clean smooth extrusion, no weathering / grime streaks'. Pier-scale soot
    // runs (2-6 m wide, 60-200 m long) washing down from every coping / setback, and a sooty band just under each ledge
    if(topY > 40.0) {
      vec2 gq9 = vec2(u * 0.19 + seed * 0.53, vFac.y * 0.006);
      vec2 gd9 = vec2(0.19, 0.006);
      float g1 = textureGrad(tNoise, gq9, gDx * gd9, gDy * gd9).r;
      float g2 = textureGrad(tNoise, gq9 * vec2(2.3, 0.6) + 0.37, gDx * gd9 * vec2(2.3, 0.6), gDy * gd9 * vec2(2.3, 0.6)).g;
      float under2 = 0.35 + 0.65 * (1.0 - smoothstep(0.0, 45.0, topY - y));
      o.alb *= 1.0 - 0.2 * smoothstep(0.42, 0.78, 0.6 * g1 + 0.4 * g2) * under2;
      o.alb *= 1.0 - 0.14 * (1.0 - smoothstep(0.0, 5.0, topY - y));
    }
  }
  if(style > 5.5) { // ---- skyline: stainless crown tier with a sunburst arch of triangular windows (Chrysler-like)
    float h = max(topY, 1.0);
    float ex = (u - 0.5 * faceW) / (0.5 * faceW), ey = (y + 0.3 * h) / (1.25 * h);
    float e = length(vec2(ex, ey)), fw = fwidth(e) + 1e-4;
    float ray = fract(atan(max(ey, 0.0), ex) / 3.14159265 * 9.0);
    float band = smoothstep(0.6 - fw, 0.6 + fw, e) * (1.0 - smoothstep(0.98 - fw, 0.98 + fw, e));
    float tw = clamp((0.95 - e) / 0.32, 0.0, 1.0) * 0.75;
    float tri = band * (1.0 - smoothstep(tw - 0.06, tw + 0.06, abs(ray - 0.5) * 2.0)) * smoothstep(0.62, 0.66, e);
    float rim = 1.0 - smoothstep(0.0, 2.5 * fw, abs(e - 0.99));
    Surf s = o;
    // (skyline r2) true stainless (Nirosta) reflectance: bright F0 ~0.55, brushed, so the crown flashes sky / sun
    vec3 ss = vec3(0.56, 0.575, 0.6) * (0.9 + 0.2 * nz2.r);
    s.alb = ss * mix(0.82, 1.1, band) * (1.0 - 0.35 * rim);
    s.metal = 0.95;
    s.rough = 0.2 + 0.1 * nz2.g;
    s.alb = mix(s.alb, vec3(0.03, 0.034, 0.04), tri);
    s.rough = mix(s.rough, 0.08, tri);
    s.metal = mix(s.metal, 0.0, tri);
    s.emis = vec3(0.0);
    s.n = normalize(vec3(0.0, 0.3 * band - 0.4 * rim, 1.0));
    s.emis = tri * vec3(0.85, 0.92, 1.0) * 1.6 * uNightK;
    gGlass = tri;
    gF0 = 0.1; // (night) the sunburst's triangular windows glow white (Chrysler crown)
    o = s;
    return;
  }
  if(style > 4.5) { // ---- party wall: common brick (whatever the street face is), weathering, demolished-neighbour
    // parge coat + flashing line, faded ghost-sign paint
    float r1 = fract(seed * 3.713), r2 = fract(seed * 7.137), r3 = fract(seed * 11.31);
    float Lp = r3 < 0.3 ? 0.0 : (r3 < 0.6 ? 15.0 : 1.0); // (textures r2) + common-bond red brick 2
    o = wallSurf(vec2(u, vFac.y), Lp, vec3(0.9, 0.88, 0.86) * (0.86 + 0.28 * nz.g) * (0.92 + 0.16 * nz2.r));
    vec3 st = textureGrad(tNoise, vec2(u * 0.23 + seed, vFac.y * 0.021), gDx * vec2(0.23, 0.0), gDy * vec2(0.0, 0.021)).rgb;
    o.alb *= 1.0 - 0.28 * smoothstep(0.5, 0.85, st.g) * (0.4 + 0.6 * (1.0 - smoothstep(0.0, 30.0, topY - y)));   // rain streaks from the top
    { // (textures r2) leak decals from the coping, 3.5 m apart, 4-16 m runs
      float gs = 3.5, gi = floor(u / gs), gr = fh1(vec2(gi + seed * 2.9, seed * 1.9)), gL = 4.0 + 12.0 * gr;
      o.alb *= 1.0 - 0.4 * grimeDecal(vec2(u / gs - gi, (topY - 0.3 - y) / gL), vec2(1.0 / gs, 1.0 / gL), floor(fract(gr * 5.3) * 24.0)) * step(0.25, fract(gr * 9.7));
    }
    o.alb *= mix(0.72, 1.0, smoothstep(0.0, 3.0, y));                                                              // street grime
    if(r1 < 0.6 && topY > 14.0) { // former low neighbour: parged (cement-rendered) area below its roof line, stepped profile
      float hN = 5.0 + r2 * min(topY - 9.0, 18.0);
      float stepU = faceW * (0.35 + 0.3 * r3);
      float hL = u < stepU ? hN : hN - 2.5 - 2.0 * r1;
      float parge = boxAA(y, -1.0, hL, ah) * boxAA(u, 0.4, faceW - 0.4, aw);
      vec3 pc = vec3(0.56, 0.54, 0.5) * (0.8 + 0.35 * st.b) * (0.85 + 0.2 * nz2.g);
      float flash = boxAA(y, hL - 0.08, hL + 0.05, ah) * boxAA(u, 0.4, faceW - 0.4, aw);
      o.alb = mix(o.alb, pc, parge * (0.75 + 0.25 * st.r));
      o.rough = mix(o.rough, 0.92, parge);
      o.n = normalize(mix(o.n, vec3(0.0, 0.0, 1.0), parge * 0.8));
      o.alb = mix(o.alb, vec3(0.08, 0.08, 0.085), flash);
      o.metal = mix(o.metal, 0.4, flash);
    }
    if(r2 > 0.5 && faceW > 9.0 && topY > 16.0) { // ghost sign painted on the brick, high on the wall
      float y1 = topY - 2.0 - 2.0 * r1, u0 = faceW * 0.12, u1 = faceW * 0.88, y0 = y1 - min(min(8.0, (topY - 6.0) * 0.35), (u1 - u0) * 0.25); // (billboards r3) one 4:1 sign cell, unstretched
      float inS = boxAA(u, u0, u1, aw) * boxAA(y, y0, y1, ah);
      if(inS > 0.0) {
        vec2 suv = vec2((u - u0) / (u1 - u0), (y - y0) / (y1 - y0));
        float row = floor(r3 * 16.0), col = floor(r1 * 4.0); // (billboards r3) one cell (was: the whole 4-cell atlas row squeezed in)
        vec2 suv2 = vec2((col + clamp(suv.x, 0.01, 0.99)) / 4.0, 1.0 - (row + 1.0 - clamp(suv.y, 0.04, 0.96)) / 16.0);
        vec3 sc = textureGrad(tSigns, suv2, gDx / (u1 - u0) / 4.0, gDy / (y1 - y0) / 16.0).rgb;
        vec3 bd = textureGrad(tSigns, suv2, vec2(0.06, 0.0), vec2(0.0, 0.03)).rgb; // blurred cell ~ board colour
        float lum = dot(sc, vec3(0.3, 0.55, 0.15)), let = smoothstep(0.1, 0.24, abs(lum - dot(bd, vec3(0.3, 0.55, 0.15))));
        vec3 paint = mix(vec3(0.2, 0.19, 0.2), vec3(0.74, 0.68, 0.55), let); // (billboards r3) cream lettering, the dark board mostly weathered off
        float wear = smoothstep(0.25, 0.75, st.r + 0.3 * nz2.b) * (1.0 - 0.6 * (1.0 - smoothstep(0.0, 0.3, fract(vFac.y / 0.075)))); // paint gone at mortar / worn
        o.alb = mix(o.alb, paint * (0.9 + 0.2 * nz.g), inS * mix(0.12, 0.5, let) * wear);
      }
    }
    // (street r11) critic: 'a completely flat, windowless brown slab'. Tall exposed lot-line walls get a few columns of
    // small lot-line windows (dark glass, stone sill, some bricked-up) above the old neighbour's roof line
    if(r1 > 0.3 && topY > 22.0 && faceW > 8.0) {
      float pfh = 3.2, pfl = floor(y / pfh), pfy = y - pfl * pfh;
      float nC = faceW > 24.0 ? 4.0 : (faceW > 14.0 ? 3.0 : 2.0), cwid = faceW / nC;
      float ci = floor(u / cwid), cu = u - (ci + 0.5) * cwid;
      float hMin = 8.0 + 10.0 * r2;
      float colOn = step(0.28, fract(sin(ci * 12.9 + seed * 3.1) * 437.5)) * step(hMin, y) * step(y, topY - 2.5);
      float wm = boxAA(cu, -0.55, 0.55, aw) * boxAA(pfy, 0.9, 2.5, ah) * colOn;
      float brk = step(0.8, fract(sin(ci * 7.1 + pfl * 3.7 + seed) * 911.3));             // bricked-up
      float sillM = boxAA(cu, -0.7, 0.7, aw) * boxAA(pfy, 0.75, 0.9, ah) * colOn;
      vec3 wc = mix(vec3(0.035, 0.04, 0.045) * (0.8 + 0.5 * fract(pfl * 0.37 + ci)), o.alb * 0.8, brk);
      o.alb = mix(o.alb, wc, wm);
      o.rough = mix(o.rough, mix(0.2, o.rough, brk), wm);
      o.metal = mix(o.metal, 0.0, wm);
      o.alb = mix(o.alb, vec3(0.62, 0.6, 0.55) * (0.85 + 0.2 * nz2.r), sillM);
      o.n = normalize(mix(o.n, vec3(0.0, 0.6, 1.0), sillM));
    }
    return;
  }
  if(style < 0.5)
    return;

  bool curtain = abs(style - 2.0) < 0.5;
  bool ribbon = abs(style - 3.0) < 0.5;
  bool deco = abs(style - 4.0) < 0.5;

  // ----------------------------------------------------------- storefront zone
  if(y < gH && gHs > 0.0) {
    float nb2 = max(1.0, floor(faceW / 6.5 + 0.5));
    float bw2 = faceW / nb2;
    float bi2 = floor(u / bw2);
    float fx2 = u - bi2 * bw2;
    float rnd = fh1(vec2(bi2 + seed * 13.1, seed * 7.7 + faceW));
    Surf base = wallSurf(vec2(u, vFac.y), Lb, Lb > 5.5 && Lb < 6.5 ? vec3(1.0) : tint * 0.0 + vec3(1.0));
    float pier = 0.35;
    float signY0 = gH - 1.55, signY1 = gH - 0.55;
    float inner = boxAA(fx2, pier, bw2 - pier, aw);
    o = base;
    if(inner <= 0.0)
      return;
    Surf s;
    float glassY0 = 0.55;
    if(y > signY1) { // cornice band
      s = base;
      s.alb *= 1.12;
      s.n = vec3(0.0, 0.45, 0.9);
    } else if(y > signY0) { // sign band
      float row = floor(fh1(vec2(rnd * 91.0, seed)) * 16.0);
      vec2 suv = vec2((fx2 - pier) / (bw2 - 2.0 * pier), (y - signY0) / (signY1 - signY0));
      vec3 sc = textureLod(tSigns, vec2(suv.x, 1.0 - (row + 1.0 - suv.y) / 16.0), clamp(log2(max(aw * 1024.0 / (bw2 - 2.0 * pier), ah * 128.0 / 1.0)), 0.0, 9.0)).rgb;
      s.alb = sc;
      s.rough = 0.45;
      s.metal = 0.0;
      s.n = vec3(0.0, 0.0, 1.0);
      s.emis = sc * 0.25 * uShopGain;
#ifdef FAR_NIGHT
      s.emis *= 1.0 - 0.8 * uNightK; // (night)
#endif
      if(rnd > 0.8) {
        s = base;
        s.alb *= 0.8;
      } // no sign
    } else if(y < glassY0) { // bulkhead
      s = base;
      s.alb *= 0.55;
      s.rough = 0.4;
    } else {
      float shutter = step(0.78, rnd);
      float gx = fx2 - pier, gw = bw2 - 2.0 * pier;
      if(shutter > 0.5 && y > signY0 - 0.24) { // shutter box (coil housing) closes the shutter up to the sign band
        float lip = boxAA(y, signY0 - 0.24, signY0 - 0.2, ah);
        s.alb = vec3(0.3, 0.31, 0.32) * (0.85 + 0.15 * nz.b) * (1.0 - 0.35 * lip);
        s.rough = 0.45;
        s.metal = 0.6;
        s.n = normalize(vec3(0.0, 0.35 * (1.0 - lip) - 0.6 * lip, 1.0));
        s.emis = vec3(0.0);
      } else if(shutter > 0.5) {
        // roll-down shutter: 7.5 cm curved slats with dark interlock grooves; the relief fades out once a slat spans
        // < ~3 px (no stripe aliasing), bottom rail, grime rising from the pavement
        float P = 0.075, sy = y / P, fs = fract(sy);
        float amp = 1.0 - smoothstep(0.012, 0.03, ah);
        float slope = cos(fs * 6.2831) * amp;                               // convex slat profile
        float groove = (1.0 - boxAA(fs, 0.08, 0.92, ah / P)) * amp;           // interlock gap
        float rail = boxAA(y, glassY0 - 0.02, glassY0 + 0.1, ah);
        vec3 sc = vec3(0.58, 0.59, 0.6) * (0.85 + 0.15 * nz.b) * (1.0 - 0.45 * groove) * mix(0.6, 1.0, smoothstep(0.0, 1.2, y));
        sc = mix(sc, vec3(0.2, 0.21, 0.22), rail);
        s.alb = sc;
        s.rough = 0.5 + 0.2 * groove;
        s.metal = 0.5;
        s.n = normalize(vec3(0.0, slope * 0.45, 1.0));
        s.emis = vec3(0.0);
      } else {
        // recessed shop glass with mullions
        float d = 0.18;
        vec2 gp = vec2(gx, y) + vec2(-Vt.x, -Vt.y) / Vt.z * d;
        float inG = boxAA(gp.x, 0.0, gw, aw) * boxAA(gp.y, glassY0, signY0, ah);
        float nm = max(1.0, floor(gw / 1.8 + 0.5));
        float mw = gw / nm;
        float mx = mod(gp.x, mw);
        float mull = max(1.0 - boxAA(mx, 0.05, mw - 0.05, aw), 1.0 - boxAA(gp.y, glassY0 + 0.06, signY0 - 0.06, ah));
        mull = max(mull, 1.0 - boxAA(abs(gp.y - (signY0 - 0.9)), 0.04, 9.0, ah));
        float door = step(rnd, 0.5) * boxAA(gp.x, 0.4, 1.5, aw) * step(gp.y, 2.6);
        bool wideR = uNightK > 0.35; // (night) one room behind the whole shop window (the per-mullion 1.8 m rooms read as flat tan corridor walls)
        vec3 room = interior(wideR ? vec2(gp.x, gp.y - glassY0) : vec2(mod(gp.x, mw), gp.y - glassY0), dirIn, wideR ? gw : mw, signY0 - glassY0 + 0.6, 5.0, 12.0 + floor(rnd * 4.0), 1.0, 1.0);
        float F = 0.04 + 0.96 * pow(1.0 - Vt.z, 5.0);
        Surf gl;
        gl.alb = vec3(0.02);
        gl.rough = 0.04;
        gl.metal = 0.0;
        gl.n = vec3(0.0, 0.0, 1.0);
        gl.emis = vec3(0.0); // Ground-floor shop interiors stay unlit; signs use separate materials.
        Surf fr;
        fr.alb = rnd > 0.4 ? vec3(0.05, 0.05, 0.055) : vec3(0.35, 0.28, 0.18);
        fr.rough = 0.35;
        fr.metal = 0.8;
        fr.n = vec3(0, 0, 1);
        fr.emis = vec3(0.0);
        float fm = max(mull, door * 0.0);
        Surf rv = base;
        rv.alb *= 0.6;
        rv.n = vec3(gp.x < 0.0 ? 1.0 : (gp.x > gw ? -1.0 : 0.0), gp.y < glassY0 ? 1.0 : (gp.y > signY0 ? -1.0 : 0.0), 0.3);
        rv.n = normalize(rv.n);
        s.alb = mix(gl.alb, fr.alb, fm);
        s.rough = mix(gl.rough, fr.rough, fm);
        s.metal = mix(gl.metal, fr.metal, fm);
        s.n = vec3(0, 0, 1);
        s.emis = gl.emis * (1.0 - fm);
        // reveal where the glass point falls outside the opening
        s.alb = mix(rv.alb, s.alb, inG);
        s.rough = mix(rv.rough, s.rough, inG);
        s.metal = mix(0.0, s.metal, inG);
        s.n = normalize(mix(rv.n, s.n, inG));
        s.emis *= inG;
        gGlass = inG * (1.0 - fm);
        gF0 = 0.07;
      }
    }
    o.alb = mix(o.alb, s.alb, inner);
    o.rough = mix(o.rough, s.rough, inner);
    o.metal = mix(o.metal, s.metal, inner);
    o.n = normalize(mix(o.n, s.n, inner));
    o.emis = s.emis * inner;
    gGlass *= inner;
    return;
  }

  // ----------------------------------------------------------- upper floors
  float fh = vF.x;
  float yy = y - gH;
  float fl = floor(yy / fh);
  float fy = yy - fl * fh;
  float margin = vW.w;
  float usable = faceW - 2.0 * margin;
  float nb = max(1.0, floor(usable / vF.y + 0.5));
  float bw = usable / nb;
  float ux = u - margin;
  float bi = floor(ux / bw);
  float fx = ux - bi * bw;
  float ww = bw * vF.z;
  float wh = fh * vF.w;
  float wx0 = (bw - ww) * 0.5;
  float wy0 = (fh - wh) * (curtain ? 0.72 : 0.42);
  // ==================== (street r9) STREET-LEVEL ZONING of punched masonry facades (street agent, additive) ====================
  // critic: 'one tiled brick texture with identical window modules, no base / belt courses / cornice zone / bays / AC units'.
  // Classic NYC tripartite facade: a rusticated stone BASE (1-2 floors over the shops), a brick SHAFT broken into bays
  // (pilasters every K windows, paired sash windows on some buildings, continuous sill courses every N floors, stone
  // quoins), a CAP zone (1-2 floors, stone or brick with arched heads) under the cornice, belt courses between zones.
  // All per-building choices hash the building seed; buildings.ts emits real projecting belt ledges at the same heights.
  bool zOK = !curtain && !ribbon && !deco && style < 1.5 && Lw < 3.5; // masonry (brick / limestone) walls only
  bool pOK = !curtain && !ribbon && !deco && style < 1.5; // (street r10) every punched wall: dark window treatment
  float zH1 = fract(seed * 2.37 + 0.11), zH2 = fract(seed * 4.73 + 0.59), zH3 = fract(seed * 8.19 + 0.27), zH4 = fract(seed * 1.61 + 0.83);
  float zNf = floor((topY - gH) / fh + 0.01);
  float zBase = (zOK && zNf >= 5.0) ? 1.0 + step(0.55, zH1) * step(9.0, zNf) : 0.0;
  float zCap = (zOK && zNf >= 6.0) ? 1.0 + step(0.6, zH2) * step(11.0, zNf) : 0.0;
  float zCapY = (zNf - zCap) * fh;                       // yy where the cap zone starts
  bool zInBase = zOK && fl < zBase;
  bool zInCap = zOK && zCap > 0.0 && yy >= zCapY;
  bool zPaired = zOK && bw > 2.15 && zH4 < 0.42 && !zInBase && !zInCap;
  float zBayK = 3.0 + floor(zH4 * 3.0);                    // pilaster every K windows
  float zH5 = fract(seed * 3.31 + 0.47);                     // (street r11) mid-shaft belt courses every zMidK floors
  float zMidK = (pOK && zNf - zBase - zCap >= 11.0) ? 6.0 + floor(zH5 * 3.0) : 0.0; // zOK: + projecting ledges (buildings.ts); other punched walls: shader belt only
  bool zMidF = zMidK > 0.5 && !zInCap && fl > zBase + 0.5 && mod(fl - zBase, zMidK) < 0.5 && fl <= zNf - zCap - 3.0; // floor just above a mid belt
  if(zPaired) { // two sash windows share one masonry opening group, a narrow brick mullion between them
    float hb = bw * 0.5;
    float bi2 = floor(ux / hb);
    float par = mod(bi2, 2.0);
    bw = hb;
    bi = bi2;
    fx = ux - bi2 * hb;
    ww = min(hb * 0.8, ww * 0.62);
    wx0 = par < 0.5 ? hb - ww - 0.09 : 0.09;
  }
  if(zInBase) {
    wh = min(fh - 0.5, wh * 1.14);
    wy0 = (fh - wh) * 0.5;
  }
  if(zInCap && zH2 > 0.3) {
    wh = min(fh - 0.45, wh * 1.08);
    wy0 = (fh - wh) * 0.4;
  }
  // ==================== end street r9 zoning (window geometry); wall treatment below ====================
  float valid = boxAA(ux, 0.0, usable, aw) * boxAA(yy, 0.0, topY - gH - (curtain ? 0.2 : 1.2), ah);
  float cellR = fh1(vec2(bi + seed * 3.7, fl + seed * 1.3));
  float cellR2 = fh1(vec2(fl * 1.7 + seed, bi * 2.3 - seed));
  float lod = clamp(max(aw / bw, ah / fh) * 3.0 - 0.6, 0.0, 1.0);
  // (skyline r8) per-window variation survives into the far LOD while a window cell still spans >= ~1.5 px
  // (critic: 'one tiled window pattern per tower, no per-window light / blind variation, reads as wallpaper')
  float wv = 1.0 - smoothstep(0.5, 0.9, max(aw / bw, ah / fh));
  // (night) window occupancy (refs/night esb_perch_night): a sparse, irregular mix. Office / deco towers light whole
  // floors or one tenant's bay group (fluorescent / neutral LED / some warm), most floors dark with a few stray lights;
  // homes / masonry a sparse per-window scatter of warm tungsten at very varied brightness (curtains, lamps deep in the
  // room), a few blue TV glows. nOn / nCol: this window; nFlM / nBdM: the floor's / building's expected emission factor
  // (used once windows / floors go sub-pixel: the far city averages out instead of shimmering)
  float nOn = 0.0;
  vec3 nCol = vec3(1.0), nFlM = vec3(0.0), nBdM = vec3(0.0);
  if(uNightK > 0.0) {
    float busy = 0.5 + fract(seed * 3.77 + 0.21);                        // per-building activity 0.5 .. 1.5
    // integer hashes (exactly reproducible in JS: the window-light provider emits light for the same lit windows); the
    // bay index ignores the paired-sash split (a pair shares one bay: both lit or both dark)
    uint sdI = uint(floor(seed * 1000.0 + 0.5)), flI = uint(int(fl)), biI = uint(int(floor(ux / (usable / nb))));
    float flR = nh01(nh3(flI, sdI, 11u));
    float wR = nh01(nh3(biI, flI, sdI + 23u)), wR2 = nh01(nh3(biI, flI, sdI + 57u));
    if(curtain || ribbon || deco) {
      float pF = (deco ? 0.42 : 0.36) * busy, pP = 0.18 * busy; // (critic r1) office towers ~45-60 % lit          // floor fully lit / one tenant's bays lit
      uint gBI = biI / uint(3.0 + floor(fract(seed * 5.3) * 6.0));
      float gR = nh01(nh3(gBI, flI, sdI + 91u));
      float full = step(flR, pF), part = (1.0 - full) * step(flR, pF + pP);
      float fOn = full > 0.5 ? 0.66 : (part > 0.5 ? 0.4 : 0.03);
      nOn = step(wR, full > 0.5 ? (gR < 0.18 ? 0.1 : 0.8) : (part > 0.5 ? step(gR, 0.45) * 0.85 : 0.03)); // full floors: an odd dark bay group
      float fq = fract(flR * 53.7);
      vec3 fc = (fq < 0.5 ? vec3(0.8, 0.92, 1.0) : (fq < 0.84 ? vec3(1.0, 0.93, 0.8) : vec3(1.0, 0.74, 0.48))) * (deco ? 1.0 : 0.7); // half cool-white LED, the rest neutral / warm // (night) office floors: bright but not blown
      if(deco)
        fc = mix(fc, vec3(1.0, 0.9, 0.74), 0.35);                // deco towers: warmer (ESB ref)
      float flB = 0.55 + 0.45 * fract(flR * 29.3); // per-floor brightness
      nCol = fc * flB * (0.6 + 0.4 * wR2);
      nFlM = fc * flB * fOn * 0.8;
      nBdM = vec3(0.93, 0.9, 0.84) * (pF * 0.66 + pP * 0.4 + 0.03) * 0.62;
    } else {
      float pw = 0.25 * busy * (0.6 + 0.8 * fract(flR * 3.3));
      nOn = step(wR, pw);
      float tv = step(0.9, wR2);
      nCol = tv > 0.5 ? vec3(0.42, 0.56, 1.0) * 0.4 : mix(vec3(1.0, 0.58, 0.28), vec3(1.0, 0.8, 0.56), fract(wR2 * 7.9)) * mix(0.12, 1.0, pow(fract(wR2 * 3.7), 1.4));
      nFlM = vec3(1.0, 0.68, 0.4) * pw * 0.5;
      nBdM = vec3(1.0, 0.68, 0.4) * 0.25 * busy * 0.5;
    }
    float nsw = fract(sin(floor(uDnTime / (45.0 + 60.0 * cellR2) + cellR * 17.0) * 91.7 + cellR * 311.0) * 4375.5); // rooms switch on / off every ~1-2 min
    if(nsw < 0.03)
      nOn = 1.0 - nOn;
    if(fl <= 0.0) {
      nOn = 0.0;
      nFlM = vec3(0.0);
      nBdM = vec3(0.0);
    }
  }
  float cBl = step(0.72, cellR2) * min(1.0, (cellR2 - 0.72) * 4.0); // curtain wall: blinds drawn (fraction of the pane)
  // (skyline r12) critic: 'glass slab = one even grid top to bottom'. Tenant zones of 8-15 floors: each zone gets its own
  // glass body tone / reflectance and its own share of drawn blinds (different tenants, re-glazed floors)
  float zR = 0.5;
  if(curtain) {
    float zF = 8.0 + floor(fract(seed * 3.91 + 0.13) * 8.0);
    zR = fh1(vec2(floor(fl / zF) + seed * 0.37, seed * 5.1 + 0.7));
    float bt = 0.58 + 0.3 * zR;
    cBl = step(bt, cellR2) * min(1.0, (cellR2 - bt) * 4.0);
  }
  float depth = vX.w;
  if(zOK)
    depth = max(depth, 0.16) * 1.3; // (street r9) deeper masonry reveals (critic: 'windows read as flat decals')
  if(pOK && !zOK)
    o.alb *= 0.955 + 0.09 * fh1(vec2(fl * 0.37 + seed, floor(bi / 3.0) + seed * 2.1)); // (street r11) per-floor / per-bay-group panel tone (critic: 'uniform grids, identical spacing top to bottom')
  if(pOK) { // (street r10) large-scale brick tonal patches (street r11: all punched walls) (re-pointing, replaced brick, soot washes) so the fine
    // pattern never reads as one tile: 3-10 m mottling +-14 %, a slight hue drift
    vec2 mq = vec2(u * 0.085 + seed * 0.71, vFac.y * 0.11);
    float m1 = textureGrad(tNoise, mq, gDx * 0.085, gDy * 0.11).r, m2 = textureGrad(tNoise, mq * 2.7 + 0.43, gDx * 0.23, gDy * 0.3).g;
    float mt = 0.62 * m1 + 0.38 * m2;
    o.alb *= (0.86 + 0.28 * smoothstep(0.2, 0.8, mt)) * mix(vec3(1.0), vec3(1.04, 0.99, 0.95), smoothstep(0.55, 0.8, m2));
  }
  if(zOK) { // (street r9) zone walls: rusticated stone base, stone (or lighter brick) cap
    if(zInBase) {
      float Lz = Lb < 5.5 && Lb > 2.5 ? Lb : 3.0;
      Surf bs = wallSurf(vec2(u, vFac.y), Lz, vec3(0.9, 0.88, 0.84) * (0.9 + 0.2 * nz2.r) * mix(0.72, 1.0, smoothstep(0.0, 2.5, y)));
      float rH = 0.56, ry = mod(y, rH), row = floor(y / rH);
      float jy = 1.0 - boxAA(ry, 0.035, rH, ah);                                   // deep horizontal rustication joint
      float jx = 1.0 - boxAA(mod(u + mod(row, 2.0) * 0.6, 1.2), 0.02, 1.2, aw);     // staggered head joints
      bs.alb *= (1.0 - 0.55 * jy) * (1.0 - 0.3 * jx) * (0.94 + 0.12 * fh1(vec2(floor((u + mod(row, 2.0) * 0.6) / 1.2), row + seed)));
      bs.n = normalize(vec3(0.0, jy * (ry < 0.02 ? -0.8 : 0.8), 1.0));
      o = bs;
    } else if(zInCap) {
      if(zH2 > 0.5) {
        Surf cs = wallSurf(vec2(u, vFac.y), 3.0, vec3(0.86, 0.84, 0.79) * (0.9 + 0.2 * nz2.g));
        cs.alb *= 1.0 - 0.18 * smoothstep(0.5, 0.85, nz.b);
        o = cs;
      } else
        o.alb *= vec3(1.06, 1.04, 1.02);
    }
    // stone quoins at the face corners (alternating long / short blocks)
    if(zH1 > 0.4 && !zInBase && faceW > 6.0) {
      float qr = floor(y / 0.62), qw = mod(qr, 2.0) < 0.5 ? 0.95 : 0.55;
      float qm = max(1.0 - boxAA(u, qw, faceW - qw, aw), 0.0) * step(0.0, yy);
      if(qm > 0.0) {
        Surf qs = wallSurf(vec2(u, vFac.y), 3.0, vec3(0.84, 0.82, 0.77) * (0.9 + 0.2 * nz2.b));
        float qj = 1.0 - boxAA(mod(y, 0.62), 0.03, 0.62, ah);
        qs.alb *= 1.0 - 0.45 * qj;
        qs.n = normalize(vec3(0.0, 0.5 * qj, 1.0));
        o.alb = mix(o.alb, qs.alb, qm);
        o.n = normalize(mix(o.n, qs.n, qm));
        o.rough = mix(o.rough, qs.rough, qm);
      }
    }
    // bay pilasters in the shaft: the pier between window groups is a slightly proud strip with a lit / shaded edge
    if(!zPaired && !zInBase && !zInCap && zH3 > 0.25) {
      bool pR = mod(bi + 1.0, zBayK) < 0.5 && fx > wx0 + ww, pL = mod(bi, zBayK) < 0.5 && bi > 0.5 && fx < wx0;
      if(pR || pL) {
        float e0 = pR ? fx - (wx0 + ww) : fx + (bw - wx0 - ww), pw2 = bw - ww;       // position across the pier
        float edgeL = 1.0 - boxAA(e0, 0.07, 99.0, aw), edgeR = 1.0 - boxAA(e0, -99.0, pw2 - 0.07, aw);
        if(zH3 > 0.62) { // stone pilaster (light, jointed every 0.62 m)
          Surf ps = wallSurf(vec2(u, vFac.y), 3.0, vec3(0.84, 0.82, 0.77) * (0.9 + 0.2 * nz2.b));
          ps.alb *= 1.0 - 0.4 * (1.0 - boxAA(mod(y, 0.62), 0.03, 0.62, ah));
          o.alb = ps.alb;
          o.rough = ps.rough;
        } else
          o.alb *= 0.8 + 0.07 * fract(seed * 3.3); // brick pier in a darker header bond
        o.alb *= 1.0 + 0.3 * edgeL - 0.4 * edgeR;
        o.n = normalize(o.n + vec3(0.8 * edgeL - 0.8 * edgeR, 0.0, 0.0));
      }
    }
  }

  // window opening mask (at facade plane)
  float inWx = boxAA(fx, wx0, wx0 + ww, aw);
  float inWy = boxAA(fy, wy0, wy0 + wh, ah);
  // (street r9) arched heads on cap-zone windows of some buildings
  float zArch = zInCap && zH2 > 0.3 && zH2 < 0.8 ? 1.0 : 0.0;
  float archO = 1.0;
  if(zArch > 0.5) {
    float ar = ww * 0.5, acy = wy0 + wh - ar;
    vec2 dq = vec2(fx - wx0 - ar, max(fy - acy, 0.0));
    archO = 1.0 - smoothstep(ar - aw, ar + aw, length(dq));
  }
  float open = inWx * inWy * valid * archO;
  // glass plane point (parallax into recess)
  vec2 off = vec2(-Vt.x, -Vt.y) / Vt.z * depth;
  vec2 gp = vec2(fx, fy) + off;
  float inG = boxAA(gp.x, wx0, wx0 + ww, aw) * boxAA(gp.y, wy0, wy0 + wh, ah);
  if(zArch > 0.5) {
    float ar = ww * 0.5, acy = wy0 + wh - ar;
    vec2 dq = vec2(gp.x - wx0 - ar, max(gp.y - acy, 0.0));
    inG *= 1.0 - smoothstep(ar - aw, ar + aw, length(dq));
  }
  vec2 gq = vec2((gp.x - wx0) / ww, (gp.y - wy0) / wh);

  // glass & interior
  bool resid = vX.x > 0.5;
  float tile = resid ? 6.0 + floor(cellR2 * 6.0) : floor(cellR2 * 6.0);
  float lit = step(0.55, fract(cellR * 7.13));
  if(uNightK > 0.5)
    lit = nOn; // (night) lit rooms show their ceiling lights, the rest stay dark
  vec3 room = interior(vec2(gp.x, gp.y), dirIn, bw, fh, curtain ? 6.0 : 4.0, tile, lit, 0.0);
  float F = 0.04 + 0.96 * pow(1.0 - Vt.z, 5.0);
  Surf gl;
  float gsel = vX.z;
  vec3 gt = gsel < 0.5 ? vec3(0.5, 0.61, 0.72) : (gsel < 1.5 ? vec3(0.4, 0.57, 0.58) : (gsel < 2.5 ? vec3(0.5, 0.56, 0.6) : (gsel < 3.5 ? vec3(0.55, 0.5, 0.42) : vec3(0.66, 0.74, 0.82))));
  // (skyline r12) critic: 'no reflective glass / green / dark-glass towers'. 5 = deep green-grey (Lever / Seagram-era
  // tinted glass), 6 = high-reflectance silver-blue mirror coating, 7 = gold-bronze reflective coating
  bool lowIron = gsel > 3.5 && gsel < 4.5;
  if(gsel > 4.5)
    gt = gsel < 5.5 ? vec3(0.36, 0.55, 0.46) : (gsel < 6.5 ? vec3(0.6, 0.72, 0.86) : vec3(0.78, 0.64, 0.42));
  // skyline: per-tower spandrel treatment (dark shadow-box glass / light metal panel / stone band) -> floor banding
  float sv = fract(seed * 5.31 + 0.17);
  vec3 spC = sv < 0.25 ? gt * 0.08 : (sv < 0.72 ? vec3(0.27, 0.285, 0.3) * (0.8 + 0.4 * fract(seed * 2.71)) : vec3(0.42, 0.405, 0.37) * (0.85 + 0.3 * fract(seed * 1.93)));
  float spGl = sv < 0.25 ? 1.0 : 0.2; // (skyline r10) dark shadow-box spandrels 40 -> 25 % (director: city reads too dark)
  if(sv > 0.88)
    spC = vec3(0.3, 0.24, 0.17) * (0.8 + 0.4 * fract(seed * 2.71)); // (skyline r3) bronze-anodised panels
  if(curtain)
    spC *= 0.88 + 0.24 * zR; // (skyline r12) per-zone spandrel tone
  // (skyline r3) per-tower mullion cap width (4-13 cm) and finish: silver / dark bronze / black / white-painted
  float cw = 0.04 + 0.09 * fract(seed * 7.77);
  float cq = fract(seed * 4.39 + 0.5);
  vec3 capC = cq < 0.4 ? vec3(0.42, 0.44, 0.46) : (cq < 0.62 ? vec3(0.13, 0.11, 0.09) : (cq < 0.82 ? vec3(0.05, 0.055, 0.06) : vec3(0.68, 0.69, 0.68)));
  if(lowIron)
    capC = vec3(0.56, 0.58, 0.61); // (skyline r7) low-iron supertalls: bright stainless caps (One WTC / CPT, not a black grid)
  if(curtain) {
    float glum = dot(gt, vec3(0.2126, 0.7152, 0.0722));
    gSpecTint = pow(gt / glum, vec3(1.7));
    gSpecTint *= mix(0.86 + 0.28 * cellR2, 1.0, 1.0 - wv); /* (skyline r9) +-26 % -> +-14 %: read as a pixel mosaic */ 
  } // (r8) per-IGU reflectance held to the far LOD (wv) // per-IGU reflectance variation (fades before it can shimmer)
  if(curtain) {
    vec3 sm = textureGrad(tNoise, vWPos.xz * 0.05 + vec2(u, y) * 0.11, gDx * 0.11, gDy * 0.11).rgb;
    gl.alb = gt * (0.035 + 0.02 * cellR); // (user r-glass) deeper tint: darker glass body
    if(lowIron)
      gl.alb = gt * (0.13 + 0.03 * cellR); // (skyline r7) low-iron glass: pale ceilings / blinds lift the body tone
    if(vX.y > 2.5)
      gl.alb = vec3(0.05, 0.052, 0.055) * (0.75 + 0.5 * step(0.5, fract(gq.y * 6.0))); // (street r11) louvre band: dark blades
    gl.alb = mix(gl.alb, vec3(0.3, 0.3, 0.28), 0.75 * cBl * step(1.0 - cBl, gq.y)); // (skyline r8) roller blinds behind some panes
    gl.metal = 0.0;
    // (user r-glass) "remove the frosted effect, keep it deep tinted but reflective": the smudge speckle (noise texture
    // sampled at ~5 cm texel scale in roughness + albedo) read as frosted / crumpled foil -> clean polished glass, only a
    // faint per-IGU roughness difference
    gl.rough = 0.02 + 0.025 * cellR2 * (1.0 - lod);

    // slight per-panel tilt -> broken reflections like real IGUs
    gl.n = normalize(vec3(vec2(cellR - 0.5, cellR2 - 0.5) * 0.016 * (1.0 - smoothstep(0.02, 0.12, max(aw / bw, ah / fh))), 1.0)); // per-IGU tilt fades before panels get sub-10px (reflection moire)
    gl.emis = room * uInteriorGain * 0.3 * (1.0 - F);
    // (skyline r5) panel deflection / heat-strengthened glass roller wave: ~10 m-scale normal wobble + reflectance
    // mottling. Low frequency, box-filtered by the mips -> it survives to the far LOD, where the per-IGU jitter is gone
    vec2 ws = vec2(0.07, 0.16);
    vec3 wob = textureGrad(tNoise, vec2(u, y) * ws + fract(seed * 0.73) * 7.0, gDx * ws, gDy * ws).rgb;
    // (user r-glass) the wobble texture is noise at texel scale (~5 cm at this frequency), which crinkled every
    // reflection like frosted glass. Panels stay flat mirrors; only the per-IGU tilt above breaks the reflection
    gWob = vec2(0.0);
    gSpecTint *= 0.94 + 0.12 * zR;
    gl.alb *= 0.75 + 0.5 * zR;
    gSpecTint *= 0.86 + 0.28 * zR; // (skyline r12) per-zone glass tone / reflectance
  } else {
    gl.alb = vec3(0.015);
    gl.metal = 0.0;
    gl.rough = 0.05 + 0.05 * cellR;
    gl.n = normalize(vec3(vec2(cellR - 0.5, cellR2 - 0.5) * 0.02 * (1.0 - smoothstep(0.02, 0.12, max(aw / bw, ah / fh))), 1.0));
    // daylit rooms seen through clear sash glass: furniture / back walls readable (not a flat dark pane), the
    // Fresnel sky reflection takes over at grazing angles
    gl.emis = room * uInteriorGain * 2.0 * (1.0 - F);
    if(deco)
      gl.emis *= 0.5; // (skyline r11) deco towers: darker window stripes -> the light stone piers read (ESB, ref 01)
    // (street r10) director: 'masonry windows read as pale panes in a crisp grid; the ref's are DARK holes'. Old sash
    // windows: deep dim rooms (most unlit), only the occasional lit room; blinds on ~20 % of windows, drawn partway
    float bThr = deco ? 0.86 : (pOK ? 0.7 : 0.55); // (street r11) pOK 0.8 -> 0.7: ~30 % of sash windows have a blind down
    if(pOK)
      gl.emis *= (0.42 + 0.6 * lit * step(0.55, cellR2)) * (0.7 + 0.6 * cellR2); // (textures r4) 0.26 -> 0.42: rooms read through the glass (critic: 'flat black holes')
    {
      float hs = smoothstep(0.55, 1.0, gq.y);
      gl.emis *= 1.0 - 0.5 * hs;
    } // (textures r4) lintel / soffit shadow over the upper glass: the opening reads recessed
    // blinds / curtains
    float blind = cellR > bThr ? (cellR - bThr) * (pOK ? 2.6 : 1.8) : 0.0;
    blind *= mix(1.0, 0.45, uNightK); // (night) blinds mostly up: lit rooms show their interior, not a flat card
    float bl = step(1.0 - blind, gq.y);
    gBlN = bl; // (night)
    vec3 bc = resid ? mix(vec3(0.85, 0.8, 0.7), vec3(0.6, 0.35, 0.3), step(0.8, cellR2)) : vec3(0.82, 0.82, 0.8);
    float slats = 0.85 + 0.15 * step(0.5, fract(gp.y * 25.0));
    if(pOK)
      bc *= 0.5; // (street r10) dusty blinds in shade, not glowing white
    // (street r11) critic: 'window + AC module stamped identically; vary blinds, curtains and interior lighting per
    // window'. Masonry sash windows: blind colour per window (paper white / cream / tan / grey-green / dark roller),
    // side curtains on ~20 % (one or both sides, muted fabric colours), per-window glass reflectance (gSashV)
    float cR4 = fh1(vec2(bi * 5.3 + seed * 1.9, fl * 3.1 + seed * 0.37));
    if(pOK) {
      float bq = fract(cellR * 23.7);
      bc = (bq < 0.3 ? vec3(0.8, 0.78, 0.72) : (bq < 0.55 ? vec3(0.78, 0.7, 0.55) : (bq < 0.72 ? vec3(0.55, 0.58, 0.54) : (bq < 0.86 ? vec3(0.2, 0.2, 0.21) : vec3(0.7, 0.66, 0.6))))) * 0.55;
      float cSide = cR4 < 0.2 ? (cR4 < 0.08 ? 2.0 : 1.0) : 0.0;           // 1: one side (left / right by hash), 2: both
      float cw2 = 0.18 + 0.2 * fract(cR4 * 41.0);
      float onL = gq.x < cw2 ? 1.0 : 0.0, onR = gq.x > 1.0 - cw2 ? 1.0 : 0.0;
      float cur = cSide > 1.5 ? max(onL, onR) : (cSide > 0.5 ? (fract(cR4 * 13.0) < 0.5 ? onL : onR) : 0.0);
      gCurN = cur; // (night)
      vec3 cc = fract(cR4 * 7.7) < 0.35 ? vec3(0.62, 0.52, 0.4) : (fract(cR4 * 7.7) < 0.6 ? vec3(0.5, 0.22, 0.18) : (fract(cR4 * 7.7) < 0.8 ? vec3(0.3, 0.36, 0.42) : vec3(0.75, 0.72, 0.64)));
      float fold = 0.8 + 0.2 * sin(gp.x * 38.0);
      gl.alb = mix(gl.alb, cc * 0.5 * fold, cur);
      gl.rough = mix(gl.rough, 0.9, cur);
      gl.emis *= 1.0 - cur;
      gl.emis += cur * cc * 0.1 * lit * uInteriorGain;
      gSashV = 0.45 + 1.15 * fract(cR4 * 3.3 + cellR2);
    }
    gl.alb = mix(gl.alb, bc * slats * 0.8, bl);
    gl.rough = mix(gl.rough, 0.8, bl);
    gl.emis *= (1.0 - bl);
    gl.emis += bl * bc * 0.12 * lit * uInteriorGain;
    // reflection floor: real sash glass always mirrors some sky / opposite facade (brighter toward the head, where it
    // sees more sky); keeps unlit windows from reading as black holes at mid range
    gl.emis += (1.0 - bl) * vec3(0.035, 0.042, 0.052) * (0.55 + 0.45 * gq.y) * (0.8 + 0.4 * cellR2) * (pOK ? 0.8 : 1.0); // (textures r4) pOK 0.45 -> 0.8
  }
  // mullions / sash
  float mullW = curtain ? 0.0 : 0.05;
  float frame = 0.0;
  if(!curtain) {
    float fwm = mullW;
    frame = 1.0 - boxAA(gp.x, wx0 + fwm, wx0 + ww - fwm, aw) * boxAA(gp.y, wy0 + fwm, wy0 + wh - fwm, ah);
    if(!ribbon)
      frame = max(frame, 1.0 - boxAA(abs(gq.y - 0.52) * wh, 0.03, 99.0, ah));
    if(ww > 1.5 || ribbon) {
      float nmx = max(2.0, floor(ww / 1.2 + 0.5));
      frame = max(frame, 1.0 - boxAA(abs(fract(gq.x * nmx + 0.5) - 0.5) * ww / nmx, 0.025, 99.0, aw));
    }
  }
  vec3 frameC = vX.y > 1.5 ? vec3(0.9, 0.9, 0.87) : (vX.y > 0.5 ? vec3(0.1, 0.1, 0.1) : vec3(0.28, 0.2, 0.14));
  if(zOK) { // (street r9) per-building sash paint (muted: no glowing white grid) + ~18 % replacement aluminium windows
    float fq = fract(seed * 3.97 + 0.41);
    frameC = fq < 0.3 ? vec3(0.66, 0.65, 0.61) : (fq < 0.5 ? vec3(0.1, 0.15, 0.12) : (fq < 0.7 ? vec3(0.07, 0.07, 0.075) : (fq < 0.85 ? vec3(0.3, 0.21, 0.15) : vec3(0.55, 0.52, 0.45))));
    if(fract(cellR * 17.3) < 0.18)
      frameC = vec3(0.42, 0.43, 0.44);
  }
  Surf win;
  win.alb = mix(gl.alb, frameC, frame);
  win.rough = mix(gl.rough, 0.45, frame);
  win.metal = mix(gl.metal, 0.3, frame);
  win.n = normalize(mix(gl.n, vec3(0, 0, 1), frame));
  win.emis = gl.emis * (1.0 - frame);
  // reveal (jambs, head, sill) when the glass point leaves the opening
  Surf rv = o;
  vec3 rn = vec3(0.0);
  if(gp.x < wx0)
    rn.x = 1.0;
  else if(gp.x > wx0 + ww)
    rn.x = -1.0;
  if(gp.y < wy0)
    rn.y = 1.0;
  else if(gp.y > wy0 + wh)
    rn.y = -1.0;
  rv.n = normalize(rn + vec3(0.0, 0.0, 0.15));
  rv.alb *= curtain ? 0.9 : 0.72;
  if(curtain) {
    rv.alb = vec3(0.62, 0.64, 0.66);
    rv.metal = 0.9;
    rv.rough = 0.3;
  }
  win.alb = mix(rv.alb, win.alb, inG);
  win.rough = mix(rv.rough, win.rough, inG);
  win.metal = mix(rv.metal, win.metal, inG);
  win.n = normalize(mix(rv.n, win.n, inG));
  win.emis *= inG;

  // wall decoration between openings
  Surf wall = o;
  if(curtain) {
    // spandrel panels + aluminium mullions (protruding caps)
    float capX = 1.0 - boxAA(fx, cw, bw - cw, aw);
    float capY = 1.0 - boxAA(fy, cw, fh - cw, ah);
    float cap = max(capX, capY);
    Surf sp = o;
    sp.alb = spC;
    sp.metal = spGl > 0.5 ? 0.3 : 0.5;
    sp.rough = spGl > 0.5 ? 0.12 : 0.38;
    sp.n = vec3(0.0, 0.0, 1.0); // (user r-glass) flat panel: the inherited masonry bump read as frosted speckle on reflective spandrels
    Surf al;
    al.alb = capC * (0.9 + 0.2 * nz2.r);
    al.metal = 0.85;
    al.rough = 0.42; // anodised aluminium: mid grey, satin
    // rounded cap profile: normal follows the position across the 6 cm cap (shading gradient, not a flat bright strip)
    float cxp = fx < bw * 0.5 ? fx / cw : (bw - fx) / cw, cyp = fy < fh * 0.5 ? fy / cw : (fh - fy) / cw;
    al.n = normalize(vec3(capX > 0.5 ? (fx < bw * 0.5 ? -1.0 : 1.0) * (1.0 - clamp(cxp, 0.0, 1.0)) * 0.7 : 0.0, capY > 0.5 ? (fy < fh * 0.5 ? -1.0 : 1.0) * (1.0 - clamp(cyp, 0.0, 1.0)) * 0.35 : 0.0, 1.0));
    al.rough = capY > 0.5 && capX < 0.5 ? 0.5 : al.rough; // transoms face the sky/sun: brushed, no blown highlight band
    al.emis = vec3(0.0);
    wall.alb = mix(sp.alb, al.alb, cap);
    wall.metal = mix(sp.metal, al.metal, cap);
    wall.rough = mix(sp.rough, al.rough, cap);
    wall.n = normalize(mix(sp.n, al.n, cap));
    // also cap over glass
    win.alb = mix(win.alb, al.alb, cap);
    win.metal = mix(win.metal, al.metal, cap);
    win.rough = mix(win.rough, al.rough, cap);
    win.n = normalize(mix(win.n, al.n, cap));
    win.emis *= 1.0 - cap;
  } else if(deco) {
    // dark recessed spandrels between stacked windows -> vertical pier emphasis
    // (skyline r2) cast-aluminium / dark-painted spandrel panels (ESB-like): with the dark glass they read as continuous
    // recessed vertical stripes between the light stone piers; a raised chevron rib every panel catches the light
    float sp = inWx * (1.0 - inWy) * valid;
    float spRib = boxAA(abs(fy - (fy < wy0 ? wy0 * 0.5 : (wy0 + wh + fh) * 0.5)), 0.0, 0.07, ah);
    Surf sps = o;
    sps.alb = mix(vec3(0.075, 0.078, 0.082), vec3(0.2, 0.2, 0.19), 0.35 * fract(seed * 3.3)) * (0.85 + 0.3 * nz2.r) * (1.0 + 0.9 * spRib);
    sps.metal = 0.22;
    sps.rough = 0.62;
    sps.n = normalize(vec3(0.0, -0.18, 1.0)); // (skyline r9) was metal 0.55 + up-tilt: mirrored the sky as blue louvre bands from the street
    wall.alb = mix(o.alb, sps.alb, sp);
    wall.n = normalize(mix(o.n, sps.n, sp));
    wall.metal = mix(o.metal, sps.metal, sp);
    wall.rough = mix(o.rough, sps.rough, sp);
    // pier edge shading: piers read as proud of the recessed window/spandrel stripe (light edge / dark edge)
    float pe = boxAA(fx, wx0 - 0.12, wx0, aw) - boxAA(fx, wx0 + ww, wx0 + ww + 0.12, aw);
    wall.alb *= 1.0 + 0.12 * pe * valid;
  } else {
    // sills & lintels (stone), belt courses, rain streaks
    vec3 stone = vec3(0.78, 0.75, 0.68);
    float lint = vX.y;
    float ext = 0.1;
    float inX = boxAA(fx, wx0 - ext, wx0 + ww + ext, aw) * valid;
    float sill = inX * boxAA(fy, wy0 - 0.12, wy0, ah);
    float head = inX * boxAA(fy, wy0 + wh, wy0 + wh + (lint > 1.5 ? 0.35 : 0.22), ah);
    if(zArch > 0.5) { // (street r9) arched head: stone voussoir ring + keystone instead of a flat lintel
      float ar = ww * 0.5, acy = wy0 + wh - ar;
      vec2 dq = vec2(fx - wx0 - ar, fy - acy);
      float rr = length(dq);
      head = step(0.0, dq.y) * (smoothstep(ar - aw, ar + aw, rr) - smoothstep(ar + 0.26 - aw, ar + 0.26 + aw, rr));
      head = max(head, boxAA(abs(dq.x), -1.0, 0.13, aw) * boxAA(fy, wy0 + wh - 0.05, wy0 + wh + 0.36, ah));
      head *= valid;
      lint = max(lint, 1.0);
    }
    if(zMidF) {
      head = inX * boxAA(fy, wy0 + wh, wy0 + wh + 0.42, ah);
      sill = inX * boxAA(fy, wy0 - 0.2, wy0, ah);
      lint = max(lint, 2.0);
    } // (street r11) dressed floor over a mid belt
    if(zInBase)
      head = 0.0; // rusticated base: the stone joints frame the openings
    // (textures r2) under-sill soot / rain runs from the $imagegen grime decal sheet (was a 1.4 m gradient box): each window
    // picks one of 24 streak shapes and a 0.8-3 m run; above the window head the run of the floor above continues
    float gdy = wy0 - 0.12 - fy, gcr = cellR;
    if(gdy < 0.0) {
      gdy += fh;
      gcr = fh1(vec2(bi + seed * 3.7, fl + 1.0 + seed * 1.3));
    }
    float gLn = 0.8 + 2.2 * fract(gcr * 3.3), gWd = ww + 0.35;
    float streak = grimeDecal(vec2((fx - wx0 + 0.175) / gWd, gdy / gLn), vec2(1.0 / gWd, 1.0 / gLn), floor(fract(gcr * 5.1) * 24.0)) * valid * 0.42;
    if(pOK)
      streak *= 0.45 + 1.1 * fract(gcr * 5.1); // (street r11) grime under sills varies per window (some heavy runs)
    wall.alb *= 1.0 - streak;
    float belt = 0.0;
    if(fl < 0.5)
      belt = boxAA(fy, -0.01, 0.35, ah); // belt course above storefront
    belt = max(belt, boxAA(yy - (topY - gH - 1.2), 0.0, 0.4, ah)) * boxAA(ux, -margin - 1.0, usable + margin + 1.0, aw);
    if(zOK) { // (street r9) zone belt courses (base top / cap bottom) with a shadow line under each, sill courses every N floors
      float zb = 0.0, zs = 0.0;
      if(zBase > 0.0) {
        zb = max(zb, boxAA(yy, zBase * fh - 0.02, zBase * fh + 0.46, ah));
        zs = max(zs, boxAA(yy, zBase * fh - 0.2, zBase * fh - 0.02, ah));
      }
      if(zCap > 0.0) {
        zb = max(zb, boxAA(yy, zCapY - 0.38, zCapY + 0.02, ah));
        zs = max(zs, boxAA(yy, zCapY - 0.52, zCapY - 0.38, ah));
      }
      float strN = zH3 < 0.3 ? 0.0 : 2.0 + floor(zH3 * 4.0);
      if(strN > 0.5 && !zInBase && !zInCap && mod(fl, strN) < 0.5)
        zb = max(zb, boxAA(fy, wy0 - 0.15, wy0, ah));
      // (street r11) critic: 'a single window module tiled over 15+ floors, no mid-cornice'. Tall shafts get a heavy
      // stone belt course every zMidK (6-8) floors (buildings.ts zoneBelts emits the matching projecting ledge), with a
      // cast shadow under it and the floor above it in stone-dressed windows (lintel + sill, see zMidF)
      if(zMidK > 0.5 && !zInBase && !zInCap) {
        float bj = floor((yy / fh - zBase) / zMidK + 0.5), bF = zBase + bj * zMidK;
        if(bj >= 1.0 && bF <= zNf - zCap - 3.0) {
          zb = max(zb, boxAA(yy, bF * fh - 0.02, bF * fh + 0.5, ah));
          zs = max(zs, boxAA(yy, bF * fh - 0.34, bF * fh - 0.02, ah));
        }
      }
      wall.alb *= 1.0 - 0.45 * zs * (1.0 - zb);
      belt = max(belt, zb);
    } else if(zMidK > 0.5) { // (street r11) mid-shaft belt courses on the other punched walls (concrete / granite / white)
      float bj = floor(yy / fh / zMidK + 0.5), bF = bj * zMidK, zb = 0.0, zs = 0.0;
      if(bj >= 1.0 && bF <= zNf - 3.0) {
        zb = boxAA(yy, bF * fh - 0.02, bF * fh + 0.5, ah);
        zs = boxAA(yy, bF * fh - 0.34, bF * fh - 0.02, ah);
      }
      wall.alb *= 1.0 - 0.45 * zs * (1.0 - zb);
      belt = max(belt, zb);
    }
    float st = max(max(sill, head), belt);
    Surf ss = wallSurf(vec2(u, vFac.y), 3.0, vec3(1.0));
    ss.alb *= stone * 1.25;
    ss.n = normalize(vec3(0.0, sill > 0.5 ? 0.7 : (head > 0.5 ? -0.25 : 0.2), 1.0));
    if(lint > 0.5 || belt > 0.5) {
      wall.alb = mix(wall.alb, ss.alb, st);
      wall.n = normalize(mix(wall.n, ss.n, st));
      wall.rough = mix(wall.rough, 0.8, st);
    } else { // soldier course (darker brick header)
      wall.alb *= 1.0 - 0.18 * head;
      wall.alb = mix(wall.alb, ss.alb, sill);
    }
  }
  // AO-ish darkening around openings
  wall.alb *= 1.0 - 0.1 * (inWx * boxAA(fy, wy0 - 0.3, wy0 + wh + 0.3, ah)) * (1.0 - open);

  Surf r;
  r.alb = mix(wall.alb, win.alb, open);
  r.rough = mix(wall.rough, win.rough, open);
  r.metal = mix(wall.metal, win.metal, open);
  r.n = normalize(mix(wall.n, win.n, open));
  r.emis = win.emis * open;
  float capW = 0.0;
  if(curtain)
    capW = max(1.0 - boxAA(fx, cw, bw - cw, aw), 1.0 - boxAA(fy, cw, fh - cw, ah));
  gGlass = open * inG * (1.0 - frame) * (1.0 - capW);
  if(curtain)
    gGlass = max(gGlass, (1.0 - open) * (1.0 - capW) * spGl * 0.8); // shadow-box spandrel glass reflects too
  gF0 = curtain ? (lowIron ? 0.46 : (gsel > 5.5 ? 0.62 : (gsel > 4.5 ? 0.2 : 0.25))) * (0.85 + 0.3 * fract(seed * 6.83 + 0.37)) : 0.12; // (skyline r12) per-tower coating: mirror 0.62, tinted 0.2, +-15 % per tower // (skyline r7) low-iron supertall glass 0.34 -> 0.46 (One WTC reads bright) // (skyline r6) 0.2 -> 0.25: glass reads as glass
  if(pOK && !zOK) {
    gF0 = 0.085;
    gSash = 1.0;
  } // (textures r4) 0.05 -> 0.085: sash glass mirrors the sky / street opposite // (street r10) all punched walls: dusty, dim sash glass
  if(curtain && vX.y > 2.5) {
    gF0 = 0.03;
    gSash = 1.0;
    gSashV = 0.5;
  } // (street r11) lintel 3 on a curtain wall = dark mechanical louvre band (MetLife plant floors)
  if(zOK) {
    // (street r9) old sash glass: dusty, lower grazing reflectance (critic: 'windows read as flat bright white-grey planes')
    gF0 = 0.085;
    gSash = 1.0; // (street r10) 0.07 -> 0.05 // (textures r4) -> 0.085 (critic r3: 'windows flat black holes, no glass')
    // (street r9) through-window AC units: a 0.28 m deep box sitting on the sill (front face / top / side by ray-marching
    // the view segment through the box at 3 depths), a shadow + condensate drip stain on the wall below
    float acRate = (resid ? 0.2 : 0.09) * (zInBase ? 0.3 : 1.0) * step(0.15, fract(seed * 6.61));
    float cR3 = fh1(vec2(bi * 3.1 + seed * 0.71, fl * 5.7 - seed * 0.3));
    if(cR3 < acRate && valid > 0.5 && lod < 0.99) {
      float acW = min(0.72, ww - 0.1), acH = 0.42, acD = 0.3, cx = wx0 + 0.5 * ww + (fract(cR3 * 37.0) - 0.5) * max(ww - acW - 0.1, 0.0);
      vec2 sh = vec2(Vt.x, Vt.y) / Vt.z * acD;
      vec2 p0 = vec2(fx, fy), p1 = p0 + sh, pm = p0 + 0.5 * sh;
      float m0 = boxAA(p0.x, cx - 0.5 * acW, cx + 0.5 * acW, aw) * boxAA(p0.y, wy0, wy0 + acH, ah);
      float mm = boxAA(pm.x, cx - 0.5 * acW, cx + 0.5 * acW, aw) * boxAA(pm.y, wy0, wy0 + acH, ah);
      float m1 = boxAA(p1.x, cx - 0.5 * acW, cx + 0.5 * acW, aw) * boxAA(p1.y, wy0, wy0 + acH, ah);
      float hit = max(max(m0, mm), m1);
      if(hit > 0.0) {
        float gy = (p1.y - wy0) / acH;
        vec3 acC = mix(vec3(0.62, 0.61, 0.57), vec3(0.5, 0.52, 0.52), step(0.5, fract(cR3 * 91.0))) * (0.85 + 0.2 * nz2.r);
        float gr = step(0.5, fract(gy * 7.0)) * step(0.35, gy) * step(gy, 0.92);   // front grille slots
        Surf ac;
        ac.metal = 0.3;
        ac.rough = 0.55;
        ac.emis = vec3(0.0);
        if(m1 > 0.5) {
          ac.alb = acC * (1.0 - 0.3 * gr);
          ac.n = vec3(0.0, 0.0, 1.0);
        } else if(p1.y > wy0 + acH) {
          ac.alb = acC * 1.1;
          ac.n = vec3(0.0, 1.0, 0.15);
        }           // top face
        else if(p1.y < wy0) {
          ac.alb = acC * 0.4;
          ac.n = vec3(0.0, -1.0, 0.15);
        }                // underside
        else {
          ac.alb = acC * 0.8;
          ac.n = vec3(p1.x < cx ? -1.0 : 1.0, 0.0, 0.2);
        }               // side
        ac.n = normalize(ac.n);
        float k = hit * (1.0 - lod);
        r.alb = mix(r.alb, ac.alb, k);
        r.rough = mix(r.rough, ac.rough, k);
        r.metal = mix(r.metal, ac.metal, k);
        r.n = normalize(mix(r.n, ac.n, k));
        r.emis *= 1.0 - k;
        gGlass *= 1.0 - k;
        gAcN = k; // (night)
      }
      // cast shadow on the sill / wall below and a thin condensate stain
      float shd = boxAA(fx, cx - 0.5 * acW, cx + 0.5 * acW + 0.1, aw) * boxAA(fy, wy0 - 0.45, wy0, ah) * (1.0 - hit);
      float drip = boxAA(fx, cx + 0.12, cx + 0.2, aw) * step(fy, wy0) * (1.0 - smoothstep(0.0, 2.2, wy0 - fy));
      r.alb *= (1.0 - 0.45 * shd * (1.0 - smoothstep(0.0, 0.45, wy0 - fy))) * (1.0 - 0.3 * drip);
    }
  }
  // far LOD (skyline): exactly box-filtered window pattern (pbox) instead of a flat average: floor bands, deco pier
  // lines, spandrel stripes and mullion grids stay readable on distant towers and fade to the true mean (no moire)
  if(lod > 0.0) {
    float wf = 1.8; // (skyline r4) wider box filter: kills the micro-grid moire seen from altitude
    float cxw = pbox(ux, bw, wx0, wx0 + ww, aw * wf);
    float cyw = pbox(yy, fh, wy0, wy0 + wh, ah * wf);
    float cov = cxw * cyw * valid;
    vec3 roomAvg = textureLod(tInterior, vec2((mod(tile, 4.0) + 0.5) / 4.0, 1.0 - (floor(tile / 4.0) + 0.5) / 4.0), 9.0).rgb;
    Surf a;
    a.n = vec3(0, 0, 1);
    a.metal = 0.0;
    if(curtain) {
      float capx = 1.0 - pbox(fx, bw, cw, bw - cw, aw * wf);
      float capy = 1.0 - pbox(yy, fh, cw, fh - cw, ah * wf);
      float cap = clamp(capx + capy - capx * capy, 0.0, 1.0);
      vec3 glc = gt * ((lowIron ? 0.13 : 0.05) + 0.03 * cellR); // (skyline r7) low-iron glass body tone (as near LOD)
      glc *= 0.75 + 0.5 * zR; // (skyline r12) per-zone tone (as near LOD)
      if(vX.y > 2.5)
        glc = vec3(0.05, 0.052, 0.055); // (street r11) louvre band
      glc = mix(glc, vec3(0.3, 0.3, 0.28), 0.75 * cBl * cBl * mix(0.5, 1.0, wv)); // (skyline r8) blinds (pane-average of the near LOD)
      vec3 capc = capC * (0.9 + 0.2 * nz2.r);
      float vis = cyw * valid;
      a.alb = mix(mix(spC, glc, vis), capc, cap);
      a.rough = mix(mix(spGl > 0.5 ? 0.1 : 0.38, 0.06, vis), 0.42, cap);
      a.metal = cap * 0.85 + (1.0 - cap) * (1.0 - vis) * (spGl > 0.5 ? 0.3 : 0.5);
      gGlass = mix(gGlass, (1.0 - cap) * mix(spGl * 0.8, 1.0, vis), lod);
      a.emis = roomAvg * uInteriorGain * 0.25 * vis * (1.0 - cap) * (0.6 + 0.8 * lit);
      gCovN = vis * (1.0 - cap) * (1.0 - 0.6 * cBl); // (night)
    } else {
      vec3 avgGlass = vec3(0.035, 0.038, 0.042);
      { // (skyline r8) per-window variation in the far LOD: blinds / curtains (same cellR rule as the near LOD), lit vs
        // dark rooms, pane tone; fades to the mean once a window cell is sub-1.5 px
        float thr = deco ? 0.86 : (pOK ? 0.8 : 0.55), bf = cellR > thr ? min(1.0, (cellR - thr) * 1.8) : 0.0; // (street r10) zOK: fewer blinds
        vec3 bcF = resid ? mix(vec3(0.85, 0.8, 0.7), vec3(0.6, 0.35, 0.3), step(0.8, cellR2)) : vec3(0.82, 0.82, 0.8);
        vec3 wvC = avgGlass * (0.55 + 0.9 * cellR2) + roomAvg * 0.08 * lit;
        wvC = mix(wvC, bcF * 0.55, bf);
        float meanB = deco ? 0.02 : (pOK ? 0.06 : 0.2); // (street r10) masonry: fewer blinds -> darker window mean
        avgGlass = mix(mix(avgGlass, bcF * 0.55, meanB), wvC, wv);
      }
      vec3 wallC = o.alb;
      if(deco) { // recessed dark spandrels stacked between the windows: vertical pier lines
        vec3 spd = mix(vec3(0.075, 0.078, 0.082), vec3(0.2, 0.2, 0.19), 0.35 * fract(seed * 3.3)) * (0.85 + 0.3 * nz2.r);
        wallC = mix(o.alb, mix(spd, avgGlass, cyw), cxw * valid);
        a.alb = wallC;
        a.metal = 0.2 * cxw * valid * (1.0 - cyw);
      } else {
        a.alb = mix(wallC, avgGlass, cov);
      }
      a.alb *= 1.0 - 0.1 * cxw * valid * (1.0 - cyw); // reveals / sills shading
      a.rough = mix(o.rough, 0.12, cov);
      gGlass = mix(gGlass, cov, lod);
      a.emis = (roomAvg * 0.25 * (0.4 + 1.2 * lit) + vec3(0.03, 0.036, 0.045)) * uInteriorGain * cov * (pOK ? 0.7 : (deco ? 0.5 : 1.0)); // (textures r4) pOK 0.45 -> 0.7 // (street r10) darker masonry windows; (skyline r11) deco too
      gCovN = cov * (pOK ? 0.85 : 1.0); // (night)
    }
    r.alb = mix(r.alb, a.alb, lod);
    r.rough = mix(r.rough, a.rough, lod);
    r.metal = mix(r.metal, a.metal, lod);
    r.n = normalize(mix(r.n, a.n, lod));
    r.emis = mix(r.emis, a.emis, lod);
  }
  // (night) lit windows replace the day emission (whose fake sky-reflection floor + x4.5 night exposure turned every
  // window into a lit pane). Near: the room seen through the glass (interior mapping with lit = nOn: ceiling lights,
  // back wall), backlit blinds / curtains glow dimmer; dark rooms are nearly black glass. Far: exact glass coverage x
  // this window's state, then the floor / building mean once windows / floors get sub-pixel (no shimmer).
  if(uNightK > 0.0) {
    const float nG = 0.5; // lit-room radiance scale (the night exposure is x4.5)
    float glassM = open * inG * (1.0 - frame) * (1.0 - gAcN) * (1.0 - capW);
    float bc2 = clamp(gBlN + gCurN, 0.0, 1.0);
    // backlit blinds / curtains: slats + a glow gradient toward the lamp side, not a flat card
    float slatN = 0.3 + 0.12 * step(0.5, fract(gp.y * 25.0)) + 0.18 * clamp(gq.y, 0.0, 1.0);
    vec3 nearE = nOn > 0.5 ? (room * (1.0 - bc2) + vec3(slatN) * gBlN + vec3(0.2 * (0.8 + 0.2 * sin(gp.x * 38.0))) * gCurN) * nCol : room * 0.012;
    vec3 perW = nOn > 0.5 ? nCol : vec3(0.012);
    vec3 kM = mix(perW, mix(nFlM, nBdM, smoothstep(0.35, 0.8, ah / fh)), 1.0 - wv);
    vec3 nE = mix(nearE * glassM, gCovN * 0.42 * kM, lod) * nG;
    r.emis = mix(r.emis, nE, uNightK);
    // (night) the lit room lights its own opening: jambs / head (the faked reveal inside the opening outline), the sill
    // and the frame get ~20-30 % of the window radiance, a short falloff onto the sill course / wall under the opening
    // (the rect lights of the provider sit on the wall plane: they light what stands in front, not this faked relief)
    if(nOn > 0.5 && lod < 1.0) {
      float sillM = inWx * boxAA(fy, wy0 - 0.45, wy0 + 0.02, ah) * (0.35 + 0.65 * smoothstep(wy0 - 0.45, wy0, fy)) * valid;
      float halo = inWx * boxAA(fy, wy0 - 1.2, wy0 + wh + 0.3, ah) * valid * 0.04;
      float revM = open * (1.0 - inG) + 0.6 * frame * open;
      r.emis += r.alb * nCol * nG * 0.25 * (revM + 0.8 * sillM + halo) * (1.0 - lod) * uNightK; // ~20 % of the window radiance
    }
  }
  if(uNightK > 0.0 && abs(vWN.y) > 0.6)
    r.emis *= 1.0 - uNightK; // (lighting2 r3) no 'windows' on roofs / flat tops (far-shore roofs glowed as a pale band at night)
  // (skyline r4) large-scale facade breakup on towers (not deco: those carry piers + tier cornices): a louvred
  // mechanical floor every M floors, a louvred plant band under the top of every mass (reads as a mechanical crown /
  // penthouse at each setback) and, on curtain walls, a heavier vertical pier / fin every K bays. All terms are
  // box-filtered (pbox) so they survive at any distance and never shimmer.
  if(!deco && topY - gH > 36.0) {
    float hM = fract(seed * 2.93 + 0.41), hK = fract(seed * 6.17 + 0.23);
    float M = 9.0 + floor(hM * 5.0) * 4.0; // 9..25 floors
    float mech = pbox(yy + 0.5 * fh, M * fh, (M - 1.0) * fh, M * fh, ah * 1.3) * step(0.5, hK) * step(3.0 * fh, topY - gH - yy) * (curtain && lowIron ? 0.0 : 1.0); // (skyline r5) 50 % of towers (was 72 %)
    float crownH = (curtain ? 1.0 : 1.4) * fh + (hM > 0.55 ? fh : 0.0);
    float crownB = boxAA(yy, topY - gH - crownH, topY - gH + 2.0, ah) * step(0.2, fract(seed * 3.17)) * ((curtain || ribbon || topY - gH > 70.0) ? 1.0 : 0.0) /* (skyline r9) not on masonry mid-rises (bands under cornices) */ * (curtain && lowIron ? 0.0 : 1.0); // (skyline r6) no plant band per tier on the low-iron supertalls (One WTC read as striped)
    float band = max(mech, crownB) * boxAA(ux, -0.05, usable + 0.05, aw) * step(0.0, yy);
    if(zOK)
      band = 0.0; // (street r9) masonry walls: no louvred plant floors mid-shaft (read as translucent stripes on brick); the cap zone crowns them
    float pierM = 0.0, finN = 0.0;
    bool roundT = gHs < -0.015 && gHs > -0.03; // (skyline r9) round tower tiers (FacadeBuilder.cyl wrap)
    if((curtain && hK > 0.45) || roundT) { // vertical pier fin every K bays (0.3-0.5 m), lit / shaded edge
      float K = roundT ? 1.0 + floor(fract(seed * 9.31) * 2.0) : 2.0 + floor(fract(seed * 9.31) * 4.0), pw = (roundT ? 0.34 : 0.3) + 0.2 * fract(seed * 1.77);
      pierM = pbox(ux + 0.5 * pw, K * bw, 0.0, pw, aw * 1.3) * valid;
      float ft = mod(ux + 0.5 * pw, K * bw) / pw; // across the fin: rounded profile -> lit / shaded edges (near range)
      finN = step(ft, 1.0) * (ft * 2.0 - 1.0) * 0.85 * (1.0 - lod);
    }
    if(band > 0.001 || pierM > 0.001) {
      float sl = pbox(yy, 0.32, 0.0, 0.13, ah * 1.2); // louvre blades: converge to their mean when sub-pixel
      vec3 louv = (curtain ? mix(capC, vec3(0.2, 0.21, 0.22), 0.78) : mix(o.alb * 0.55, vec3(0.2, 0.21, 0.22), 0.6)) * (1.0 - 0.45 * sl) * (0.9 + 0.2 * nz2.g);
      // louvre floors keep the pier / mullion rhythm (thin stiles every bay)
      float stile = 1.0 - pbox(fx, bw, cw + 0.03, bw - cw - 0.03, aw * 1.3);
      louv = mix(louv, curtain ? capC : o.alb * 1.05, stile * 0.8);
      r.alb = mix(r.alb, louv, band);
      r.rough = mix(r.rough, 0.55, band);
      r.metal = mix(r.metal, curtain ? 0.6 : 0.2, band);
      r.n = normalize(mix(r.n, vec3(0.0, -0.3 * (1.0 - lod), 1.0), band)); // (skyline r9) blades slope down-out: no sky-blue glint from the street r.emis *= 1.0 - band; gGlass *= 1.0 - band;
      r.emis *= 1.0 - band * uNightK; // (night) the line above only comments this out: no lit rooms behind louvre floors
      vec3 pc = mix(capC, vec3(0.62, 0.63, 0.63), step(0.62, fract(seed * 4.39 + 0.5)) * 0.4) * (0.85 + 0.3 * nz2.r);
      if(roundT && !curtain)
        pc = o.alb * vec3(1.1, 1.09, 1.07); // (skyline r9) cast-stone / concrete fins on masonry drums
      float pm = pierM * (1.0 - band);
      r.n = normalize(mix(r.n, vec3(finN, 0.0, 1.0), pm * (1.0 - lod)));
      r.alb = mix(r.alb, pc, pm);
      r.rough = mix(r.rough, 0.38, pm);
      r.metal = mix(r.metal, 0.8, pm);
      r.emis *= 1.0 - pm;
      gGlass *= 1.0 - pm;
    }
  }
  if(curtain)
    r.n = normalize(r.n + vec3(gWob, 0.0) * clamp(gGlass, 0.0, 1.0));
  // (skyline r12) critic: 'no ambient occlusion at setback ledges'. Contact shade at the foot of every set-back tier
  // (the terrace roof + parapet occlude the lower wall), plus a long soft falloff; box-filtered by construction (no tex)
  if(tierY > 1.0) {
    float dyT = vFac.y - tierY;
    float aoT = 0.36 * (1.0 - smoothstep(0.0, 4.5, dyT)) + 0.14 * (1.0 - smoothstep(0.0, 20.0, dyT));
    r.alb *= 1.0 - aoT;
    r.emis *= 1.0 - 0.6 * aoT;
    gGlass *= 1.0 - 0.5 * aoT;
    gAoT = aoT; // (night)
  }
  o = r;
}
`,pe=new WeakMap,W=e=>typeof e==`number`?b(e):e,me=e=>i(e,b(1),b(0)),G=(e,t,n,r)=>{let i=W(r).mul(1.2),a=i.mul(.5);return w(W(n),e.add(a)).sub(P(W(t),e.sub(a))).div(i).clamp(0,1)},K=e=>{let t=x(e.mul(I(123.34,456.21))),n=t.add(g(t,t.add(45.32)));return x(n.x.mul(n.y))};function he(r){let a=new URLSearchParams(window.location.search).get(`lprobe`),c=new H({color:16777215,roughness:.82,metalness:0});c.name=`CityFacade.TSL`;let u=C(ce.value);u.onRenderUpdate(()=>{u.value=ce.value});let h=L(k(),`vFacadeUv`),v=L(F(`aF`,`vec4`),`vFacadeF`),S=L(F(`aS`,`vec4`),`vFacadeS`),T=L(F(`aW`,`vec4`),`vFacadeW`),D=L(F(`aX`,`vec4`),`vFacadeX`),O=L(F(`aTint`,`vec3`),`vFacadeTint`),M=m,ne=l(_),re=S.x,ae=z(re,16),B=S.y,V=S.w,oe=v.x.max(.5),se=v.y.max(.5),le=T.z,U=h.y.sub(le),ue=T.x.max(1),de=S.z.abs(),fe=T.y.sub(le).max(1),W=ne.y.greaterThan(.5),he=ne.y.lessThan(-.5),ge=(e,t)=>ae.greaterThan(e).and(ae.lessThan(t)),_e=x(B.mul(9.271).add(.137)),ve=T.y.sub(T.z),ye=ge(2.5,3.5).and(O.x.sub(O.z).greaterThan(.18)).and(_e.lessThan(.8)).or(ge(1.5,2.5).and(_e.lessThan(.18))),be=ge(3.5,4.5).or(ge(6.5,7.5)).and(ve.lessThan(30)).and(_e.lessThan(.4)),xe=ae;xe=i(ge(1.5,2.5).and(_e.greaterThanEqual(.36)).and(_e.lessThan(.5)),b(15),xe),xe=i(ge(1.5,2.5).and(_e.greaterThanEqual(.18)).and(_e.lessThan(.36)),b(1),xe),xe=i(be,b(14),xe),xe=i(ye,b(13),xe),xe=i(ae.lessThan(.5).and(_e.lessThan(.45)),b(15),xe);let Se=i(ge(9.5,10.5),b(8),i(ge(4.5,5.5),b(8),ae)),q=i(W,Se,xe),Ce=E(q.add(.5).floor()),J=b(4);J=i(q.greaterThan(12.5),b(3),J),J=i(q.greaterThan(13.5),b(3),J),J=i(q.greaterThan(14.5),b(1.8),J),J=i(q.lessThan(2.5),b(1.8),J),J=i(q.greaterThan(2.5).and(q.lessThan(3.5)),b(3),J),J=i(q.greaterThan(3.5).and(q.lessThan(4.5)),b(4),J),J=i(q.greaterThan(4.5).and(q.lessThan(5.5)),b(3),J),J=i(q.greaterThan(5.5).and(q.lessThan(6.5)),b(2),J),J=i(q.greaterThan(6.5).and(q.lessThan(7.5)),b(2.4),J),J=i(q.greaterThan(7.5).and(q.lessThan(8.5)),b(8),J),J=i(q.greaterThan(8.5).and(q.lessThan(9.5)),b(4),J),J=i(q.greaterThan(9.5).and(q.lessThan(11.5)),b(8),J);let we=I(x(B.mul(.618)).mul(8),x(B.mul(.377)).mul(8)),Te=h.add(we).div(J),Ee=n(r.wallsCol,Te).depth(Ce).rgb,De=r.wallsHao?n(r.wallsHao,Te).depth(Ce).rgb:j(1,1,1),Oe=w(A(s(Te)),A(o(Te))).mul(1024),ke=t(3,10,Oe),Ae=q.lessThan(2.5).or(q.greaterThan(14.5)).or(q.greaterThan(6.5).and(q.lessThan(7.5))),je=R(R(b(.62),b(.8),ke),b(1),t(.28,.55,De.r)),Me=i(Ae,je,b(1)),Ne=R(b(1),De.g,b(.7).mul(b(1).sub(ke.mul(.3)))),Pe=Ee.mul(Me).mul(O).mul(Ne),Fe=n(r.noise,M.xz.div(180).add(M.y.div(300))).level(0).rgb,Ie=n(r.noise,M.xz.div(23).add(M.y.div(41)).add(.5)).level(0).rgb,Le=x(B.mul(13.73).add(.29)),Re=x(B.mul(5.91).add(.61)).mul(2).sub(1),ze=j(b(1).add(Re.mul(.045)),b(1).add(Re.mul(.008)),b(1).sub(Re.mul(.05))).mul(b(.91).add(Le.mul(.18))),Be=x(B.mul(17.31).add(.53)),Ve=i(Be.lessThan(.2),j(.9,.9,.92),i(Be.lessThan(.4),j(1.04,.95,.84),i(Be.lessThan(.55),j(1.08,.9,.8),i(Be.lessThan(.7),j(.96,.97,.98).mul(.92),j(1,1,1))))),He=x(B.mul(29.7)),Ue=q.lessThan(4.5).or(q.greaterThan(12.5)),We=i(Ae,ze.mul(Ve).mul(b(.95).sub(He.mul(.13))),i(Ue,ze.mul(b(.93).sub(He.mul(.08))),ze)),Ge=b(.88).add(Fe.g.mul(.24)).mul(b(.93).add(Ie.r.mul(.14))).mul(b(1).sub(t(.5,.85,Fe.b).mul(.14))),Ke=We.mul(Ge),qe=b(.8).add(Fe.r.mul(.4)).mul(b(.9).add(Ie.g.mul(.2))),Je=i(W,j(qe,qe,qe),i(he,j(.6,.6,.6),Ke)),Ye=Pe.mul(Je),Xe=R(b(.72),b(1),t(0,2.5,U)),Ze=Ye.mul(Xe),Qe=V.greaterThan(.5).and(V.lessThan(4.5)),$e=me(Qe),et=V.greaterThan(1.5).and(V.lessThan(2.5)),Y=V.greaterThan(2.5).and(V.lessThan(3.5)),tt=V.greaterThan(3.5).and(V.lessThan(4.5)),nt=V.greaterThan(.5).and(V.lessThan(1.5)),rt=nt.and(ae.lessThan(3.5)),X=P(d(h.x),1e-4),Z=P(d(h.y),1e-4),it=b(.075).max(X.mul(.8)),at=b(.075).max(Z.mul(.8)),ot=T.w,st=ue.sub(ot.mul(2)).max(1),ct=f(st.div(se).add(.5)).max(1),lt=st.div(ct),ut=h.x.sub(ot),dt=ut.div(lt),ft=f(dt),pt=ut.sub(ft.mul(lt)),mt=U.sub(de),ht=mt.div(oe),gt=f(ht),_t=mt.sub(gt.mul(oe)),vt=lt.mul(v.z),yt=oe.mul(v.w),bt=lt.sub(vt).mul(.5),Q=oe.sub(yt).mul(i(et,b(.72),b(.42))),xt=x(B.mul(2.37).add(.11)),St=x(B.mul(4.73).add(.59)),Ct=f(fe.sub(de).div(oe).add(.01)),wt=i(rt.and(Ct.greaterThanEqual(5)),b(1).add(p(b(.55),xt).mul(p(b(9),Ct))),b(0)),Tt=i(rt.and(Ct.greaterThanEqual(6)),b(1).add(p(b(.6),St).mul(p(b(11),Ct))),b(0)),Et=Ct.sub(Tt).mul(oe),Dt=rt.and(gt.lessThan(wt)),Ot=rt.and(Tt.greaterThan(0)).and(mt.greaterThanEqual(Et)).and(St.greaterThan(.3)).and(St.lessThan(.8)),kt=vt.mul(.5),At=Q.add(yt).sub(kt),jt=(e,n)=>{let r=e.sub(bt).sub(kt),i=n.sub(At).max(0),a=I(r,i).length();return b(1).sub(t(kt.sub(X),kt.add(X),a))},Mt=R(b(1),jt(pt,_t),me(Ot)),Nt=G(ut,0,st,X).mul(G(mt,0,fe.sub(de).sub(i(et,b(.2),b(1.2))),Z)),Pt=l(ee.sub(M)),Ft=ie(j(0,1,0),ne),It=Ft.div(P(A(Ft),1e-4)),Lt=j(g(Pt,It),Pt.y,P(g(Pt,ne),.06)),Rt=i(rt,P(D.w,.16).mul(1.3),D.w),zt=I(Lt.x.negate(),Lt.y.negate()).div(Lt.z).mul(Rt),Bt=pt.add(zt.x),Vt=_t.add(zt.y),Ht=vt.max(.001),Ut=yt.max(.001),Wt=Bt.sub(bt).div(Ht),Gt=Vt.sub(Q).div(Ut),Kt=G(pt,bt,bt.add(vt),X),qt=Kt.mul(G(_t,Q,Q.add(yt),Z)).mul(Nt).mul($e).mul(Mt),Jt=G(Bt,bt,bt.add(vt),X).mul(G(Vt,Q,Q.add(yt),Z)).mul(R(b(1),jt(Bt,Vt),me(Ot))),Yt=b(1).sub(G(Bt,bt.add(it),bt.add(vt).sub(it),X).mul(G(Vt,Q.add(at),Q.add(yt).sub(at),Z))),Xt=b(1).sub(G(Gt.sub(.52).abs().mul(yt),.03,99,Z));Yt=i(Y,Yt,Yt.max(Xt));let Zt=f(vt.div(1.2).add(.5)).max(2),Qt=b(1).sub(G(x(Wt.mul(Zt).add(.5)).sub(.5).abs().mul(vt).div(Zt),.035,99,X));Yt=i(vt.greaterThan(1.5).or(Y),Yt.max(Qt),Yt),Yt=i(et,b(0),Yt);let $t=K(I(ft.add(B.mul(3.7)),gt.add(B.mul(1.3)))),en=D.y,tn=i(en.greaterThan(1.5),j(.9,.9,.87),i(en.greaterThan(.5),j(.1,.1,.1),j(.28,.2,.14))),nn=x(B.mul(3.97).add(.41)),rn=i(nn.lessThan(.3),j(.66,.65,.61),i(nn.lessThan(.5),j(.1,.15,.12),i(nn.lessThan(.7),j(.07,.07,.075),i(nn.lessThan(.85),j(.3,.21,.15),j(.55,.52,.45))))),an=x($t.mul(17.3)).lessThan(.18),on=i(rt,i(an,j(.42,.43,.44),rn),tn),sn=D.z,cn=sn.greaterThan(3.5).and(sn.lessThan(4.5)),ln=i(sn.lessThan(.5),j(.5,.61,.72),i(sn.lessThan(1.5),j(.4,.57,.58),i(sn.lessThan(2.5),j(.5,.56,.6),i(sn.lessThan(3.5),j(.55,.5,.42),j(.66,.74,.82))))),un=i(sn.greaterThan(4.5),i(sn.lessThan(5.5),j(.36,.55,.46),i(sn.lessThan(6.5),j(.6,.72,.86),j(.78,.64,.42))),ln),dn=i(cn,un.mul(b(.13).add($t.mul(.03))),un.mul(b(.035).add($t.mul(.02)))),fn=D.x.greaterThan(.5),pn=K(I(ft.mul(5.3).add(B.mul(1.9)),gt.mul(3.1).add(B.mul(.37)))),mn=b(.18).add(x(pn.mul(41)).mul(.2)),hn=G(Wt,0,mn,P(d(Wt),1e-4)),gn=G(Wt,b(1).sub(mn),1,P(d(Wt),1e-4)),_n=hn.max(gn),vn=i(x(pn.mul(13)).lessThan(.5),hn,gn),yn=i(pn.lessThan(.08),_n,i(pn.lessThan(.2),vn,b(0))).mul(me(nt)),bn=i(x(pn.mul(7.7)).lessThan(.35),j(.62,.52,.4),i(x(pn.mul(7.7)).lessThan(.6),j(.5,.22,.18),i(x(pn.mul(7.7)).lessThan(.8),j(.3,.36,.42),j(.75,.72,.64)))),xn=b(.8).add(N(Bt.mul(38)).mul(.2)),Sn=bn.mul(.5).mul(xn),Cn=i(tt,b(.86),i(rt,b(.7),b(.55))),wn=i($t.greaterThan(Cn),$t.sub(Cn).mul(i(nt,b(2.6),b(1.8))),b(0)).mul(R(b(1),b(.45),u)),Tn=p(b(1).sub(wn),Gt.clamp(.02,.98)).mul(me(nt.or(tt))).mul(i(fn.or(rt),b(0),b(1))),En=x($t.mul(23.7)),Dn=i(En.lessThan(.3),j(.8,.78,.72),i(En.lessThan(.55),j(.78,.7,.55),i(En.lessThan(.72),j(.55,.58,.54),i(En.lessThan(.86),j(.2,.2,.21),j(.7,.66,.6))))).mul(i(nt,b(.275),b(.55))),On=b(.85).add(p(.5,x(Vt.mul(25))).mul(.15)),kn=R(j(.015,.015,.015),Dn.mul(On).mul(.8),Tn),An=R(kn,Sn,yn),jn=i(et,dn,i(nt,An,j(.015,.015,.015))),Mn=b(.04).add(x(B.mul(7.77)).mul(.09)),Nn=x(B.mul(4.39).add(.5)),Pn=i(Nn.lessThan(.4),j(.42,.44,.46),i(Nn.lessThan(.62),j(.13,.11,.09),i(Nn.lessThan(.82),j(.05,.055,.06),j(.68,.69,.68)))),Fn=i(cn,j(.56,.58,.61),Pn).mul(b(.9).add(Ie.r.mul(.2))),In=x(B.mul(5.31).add(.17)),Ln=b(.8).add(x(B.mul(2.71)).mul(.4)),Rn=i(In.lessThan(.25),un.mul(.08),i(In.lessThan(.72),j(.27,.285,.3).mul(Ln),j(.42,.405,.37).mul(b(.85).add(x(B.mul(1.93)).mul(.3))))),zn=i(In.greaterThan(.88),j(.3,.24,.17).mul(Ln),Rn),Bn=b(1).sub(G(pt,Mn,lt.sub(Mn),X)),Vn=b(1).sub(G(_t,Mn,oe.sub(Mn),Z)),Hn=Bn.max(Vn),Un=R(zn,Fn,Hn),Wn=nt.or(Y),Gn=G(pt,bt.sub(.1),bt.add(vt).add(.1),X).mul(Nt).mul($e),Kn=Gn.mul(G(_t,Q.sub(.12),Q,Z)),qn=Gn.mul(G(_t,Q.add(yt),Q.add(yt).add(i(en.greaterThan(1.5),b(.35),b(.22))),Z)),Jn=n(r.wallsCol,h.add(we).div(3)).depth(E(3)).rgb.mul(j(.78,.75,.68)).mul(1.25),Yn=en.greaterThan(.5).or(Ot),Xn=i(Yn,Kn.max(qn),Kn),Zn=i(Yn,Ze,Ze.mul(b(1).sub(qn.mul(.18))));i(Wn,R(Zn,Jn,Xn),Ze);let Qn=pt.sub(bt).sub(kt),$n=_t.sub(At),er=I(Qn,$n).length(),tr=p(b(0),$n).mul(t(kt.sub(X),kt.add(X),er).sub(t(kt.add(.26).sub(X),kt.add(.26).add(X),er))),nr=G(Qn.abs(),-1,.13,X).mul(G(_t,Q.add(yt).sub(.05),Q.add(yt).add(.36),Z)),rr=tr.max(nr).mul(Nt),ir=R(qn,rr,me(Ot)),ar=i(Yn,Kn.max(ir),Kn),or=i(Wn,R(Zn,Jn,ar),Ze),sr=f(U.div(.62)),cr=i(z(sr,2).lessThan(.5),b(.95),b(.55)),lr=b(1).sub(G(h.x,cr,ue.sub(cr),X)).mul(p(b(0),mt)).mul(me(rt.and(xt.greaterThan(.4)).and(Dt.not()).and(ue.greaterThan(6)))),ur=b(1).sub(G(z(U,.62),.03,.62,Z)),dr=Jn.mul(j(.84/.78,.82/.75,.77/.68)).mul(b(.9).add(Ie.b.mul(.2))).mul(b(1).sub(ur.mul(.45))),fr=R(or,dr,lr),pr=i(Wn,ar,b(0)),mr=b(1).sub(Kt.mul($e).mul(G(_t,Q.sub(.3),Q.add(yt).add(.3),Z)).mul(b(1).sub(qt)).mul(.1)),hr=i(et,Un,fr).mul(mr),gr=i(et,j(.62,.64,.66),Ze.mul(.72)),_r=R(jn,on,Yt);_r=R(gr,_r,Jt),_r=i(et,R(_r,Fn,Hn),_r);let vr=qt.mul(Yt),yr=i(et,Hn,b(0)),br=qt.mul(Jt).mul(b(1).sub(Yt)).mul(b(1).sub(yr)),xr=f(ue.div(6.5).add(.5)).max(1),Sr=ue.div(xr),Cr=f(h.x.div(Sr)),wr=S.z.greaterThan(.05).and(U.lessThan(de)).and(Qe),Tr=z(h.x,Sr),Er=b(.55),Dr=de.sub(1.55),Or=Sr.sub(.7),kr=b(.18),Ar=Tr.sub(.35).add(Lt.x.negate().div(Lt.z).mul(kr)),jr=U.add(Lt.y.negate().div(Lt.z).mul(kr)),Mr=G(Ar,0,Or,X).mul(G(jr,Er,Dr,Z)).mul(me(wr)),Nr=f(Or.div(1.8).add(.5)).max(1),Pr=Or.div(Nr),Fr=b(1).sub(G(z(Ar,Pr),.05,Pr.sub(.05),X)),Ir=Mr.mul(Fr.max(b(1).sub(G(jr,Er.add(.06),Dr.sub(.06),Z))).max(b(1).sub(G(jr.sub(Dr.sub(.9)).abs(),.04,9,Z)))),Lr=Mr.mul(b(1).sub(Ir)),Rr=br.max(Lr),zr=x(N(dt.floor().mul(127.1).add(gt.mul(311.7)).add(B.mul(74.7))).mul(43758.5453)),Br=me(gt.greaterThan(0)),Vr=zr.lessThan(.43).mul(u).mul(Rr).mul(Br),Hr=R(j(.025,.034,.05),j(1,.57,.29),i(Mr.greaterThan(0),b(.72),b(.5))).mul(Vr).mul(2.6),Ur=R(j(.035,.045,.055),j(.015,.02,.025),u),Wr=K(I(Cr.add(B.mul(13.1)),B.mul(7.7).add(ue))),Gr=i(Wr.greaterThan(.4),j(.05,.05,.055),j(.35,.28,.18)),Kr=R(hr,_r,qt);Kr=R(Kr,Ur,Mr),Kr=R(Kr,Gr,Ir);let qr=Kr,Jr=V.greaterThan(5.5),Yr=h.x.sub(ue.mul(.5)).div(ue.mul(.5)),Xr=U.sub(fe.mul(.35)).div(fe.mul(.75)),Zr=Yr.mul(Yr).add(Xr.mul(Xr)).sqrt(),Qr=t(.6,.68,Zr).mul(b(1).sub(t(.92,1,Zr))),$r=t(.08,.22,x(e(Xr,Yr).div(Math.PI).mul(9)).abs().sub(.5).abs()),ei=Qr.mul($r).mul(me(Jr));Kr=R(Kr,j(.56,.575,.6),me(Jr)),Kr=R(Kr,j(.035,.04,.05),ei);let ti=Kr,ni=b(1).sub(y(g(ne,Pt))).clamp(),$=l(te),ri=e($.z,$.x).mul(7).add(B.mul(3.1)),ii=f(ri),ai=x(ri),oi=K(I(ii,3.7)),si=K(I(ii,9.1)),ci=K(I(ii.add(.5),1.3)),li=R(b(.03),b(.36),oi.mul(oi)).mul(b(1).add(b(.8).mul(b(1).sub(t(20,260,M.y)))));li=li.mul(p(b(.12),ci)).mul(b(.85).add(p(ai.sub(.5).abs(),si.mul(.3)).mul(.3))),li=i(cn,li.mul(.35),li);let ui=d($.y).add(.004),di=b(1).sub(t(li.sub(ui),li.add(ui),$.y)),fi=e($.z,$.x).mul(.15915494).add(.5),pi=n(r.noise,I(fi.mul(1.7).add(B.mul(.13)),$.y.mul(5).add(.5))).r,mi=n(r.noise,I(fi.mul(4.3).sub(B.mul(.27)),$.y.mul(12).add(.2))).g,hi=R(j(.48,.56,.66),j(.22,.38,.62),t(.02,.72,$.y)),gi=t(.56,.75,pi).mul(b(.7).add(t(.52,.75,mi).mul(.3))).mul(t(-.04,.14,$.y)).mul(b(1).sub(t(.42,.82,$.y))),_i=hi.add(j(.22,.23,.24).mul(gi)),vi=b(.8).add(p(.5,x($.y.mul(180).div(b(1).add(ui.mul(60))))).mul(.2)),yi=R(j(.95,.9,.82),j(.75,.82,.95),ci),bi=_i.mul(yi).mul(R(b(.27),b(.58),si)).mul(vi),xi=_i.mul(j(.16,.17,.19)),Si=_i.mul(R(j(.34,.36,.39),j(.6,.6,.59),oi).mul(b(.75).add(si.mul(.35)))),Ci=b(1).sub(t(-.85,-.4,$.y)),wi=t(-.4,-.12,$.y),Ti=R(bi,xi,Ci),Ei=R(Ti,Si,t(35,160,M.y)),Di=R(Ei,_i.mul(R(b(.62),b(.9),si)),wi).mul(b(1).sub(u.mul(.85))),Oi=R(_i,Di,di),ki=i(et,b(1).sub(qt).mul(b(1).sub(Hn)).mul(i(In.lessThan(.25),b(.8),b(.16))),b(0)),Ai=Oi.mul(b(.2).add(ni.mul(.5))).mul(Rr.add(ki).clamp()).add(Oi.mul(b(.14).add(ni.mul(.48))).mul(ei)).mul(b(1).sub(u.mul(.55))),ji={walltex:Ee,walllayer:j(q.div(15),b(1).sub(q.div(15)),.2),walltint:O,wallbase:Pe,wallweather:Ye,wallgrime:Ze,wallwindows:qr,wallcrown:ti}[a],Mi=ji!==void 0,Ni=a===`wallfillreflection`;c.colorNode=ji??Kr,c.roughnessNode=i(ei.greaterThan(.01),b(.1),i(Jr,b(.24),i(vr.max(pr).greaterThan(.01),b(.62),i(Rr.greaterThan(.01),b(.05),i(q.greaterThan(4.5).and(q.lessThan(5.5)),b(.32),b(.84)))))),c.metalnessNode=i(ei.greaterThan(.01),b(0),i(Jr,b(.72),i(Rr.greaterThan(.01),b(0),i(q.greaterThan(4.5).and(q.lessThan(5.5)),b(.6),b(0)))));let Pi=Hr.add(Ai).add(ei.mul(u).mul(j(.85,.92,1)).mul(1.8));return c.emissiveNode=Mi?j(0):Ni?Ai:Pi,(Mi||Ni)&&(Mi&&(c.lights=!1),c.userData.facadeProbe=a,c.needsUpdate=!0,a===`walltex`&&console.info(`[tsl] facade wall texture probe`,{textureType:r.wallsCol?.constructor?.name,compressedArray:r.wallsCol?.isCompressedArrayTexture===!0,depth:r.wallsCol?.image?.depth,width:r.wallsCol?.image?.width,height:r.wallsCol?.image?.height,mipLevels:r.wallsCol?.mipmaps?.length,colorSpace:r.wallsCol?.colorSpace,haoAtlas:r.wallsHao?{textureType:r.wallsHao.constructor?.name,depth:r.wallsHao.image?.depth,mipLevels:r.wallsHao.mipmaps?.length,colorSpace:r.wallsHao.colorSpace}:`missing`})),c.opacityNode=b(1).add(Rr.max(ki).max(ei).clamp()),pe.set(c,{colorNode:Kr,emissiveNode:Pi,night:u}),c.userData.nodeFacade=!0,c.userData.noSSR=!0,c.userData.webgpuAmbientFloor=!1,c}function ge(e,t=!1){let n=e.clone(),r=pe.get(e);if(r&&t&&!e.userData.facadeProbe){let e=b(1).sub(r.night.mul(.8));n.colorNode=r.colorNode.mul(e),n.emissiveNode=r.emissiveNode.mul(e),pe.set(n,{...r,colorNode:n.colorNode,emissiveNode:n.emissiveNode})}return n}var _e=()=>C(ce.value).onRenderUpdate((e,t)=>{t.value=ce.value});function ve(e){return x(N(g(e,I(12.9898,78.233))).mul(43758.5453))}function ye(e){let r=new H({color:10721930,roughness:.88});r.name=`BridgeStone.TSL`;let a=m,o=l(_),s=y(o),c=i(s.x.greaterThan(s.z),a.zy,a.xy),u=i(s.y.greaterThan(.7),a.xz,c),d=n(e.noise,u.div(17)).rgb,p=n(e.noise,u.div(3.1)).rgb,h=u.y.div(.9),g=f(h),v=u.x.div(1.8).add(z(g,2).mul(.5)),S=I(x(v),x(h)),C=I(v.fwidth(),h.fwidth()).mul(1.5).add(1e-4),T=b(1).sub(t(0,b(.03).add(C.x),w(S.x,b(1).sub(S.x)))),E=b(1).sub(t(0,b(.04).add(C.y),w(S.y,b(1).sub(S.y)))),D=P(T,E).mul(b(1).sub(t(.2,.6,P(C.x,C.y)))),O=ve(f(I(v,h)));return r.colorNode=B(10721930).mul(b(.86).add(O.mul(.16))).mul(b(.8).add(d.r.mul(.3))).mul(b(.93).add(p.g.mul(.1))).mul(b(1).sub(D.mul(.35))).mul(R(.72,1,t(-1,6,a.y))).mul(b(1).sub(t(.55,.85,d.b).mul(b(.18).mul(b(.5).add(s.x.mul(.5)).add(s.z.mul(.5)))))),r}function be(){let e=new H({color:16777215,roughness:.6,metalness:.35});e.name=`BridgeSteel.TSL`,e.vertexColors=!0;let t=L(F(`aEx`,`vec3`).x,`vBridgeGlowNode`),n=_e();return e.emissiveNode=j(1,.82,.55).mul(t).mul(b(.15).add(n.mul(7))),e}function xe(){let e=new H({color:3883075,roughness:.6,metalness:.35});e.name=`BridgeCable.TSL`;let n=F(`position`,`vec3`),o=F(`normal`,`vec3`),s=ae.mul(T(n,1)).xyz,c=ee.sub(s).length().mul(.0011).sub(.15).max(0);e.positionNode=n.add(o.mul(c));let l=L(s,`vBridgeCableWorldNode`),u=L(F(`aEx`,`vec3`).x,`vBridgeNeckNode`),d=L(c,`vBridgeFatNode`),p=_e();e.metalnessNode=b(.35).mul(b(1).sub(p.mul(.85))),e.colorNode=B(3883075).mul(b(1).sub(p.mul(.7)));let m=l.x.add(l.z).mul(.18),h=m.fwidth().add(1e-4),g=r(a(P(b(1),h.mul(6))).ceil()),_=P(.05,h.mul(.75)),v=x(m).sub(.5).abs(),y=b(1).sub(t(_.sub(h.mul(.5)),_.add(h.mul(.5)),v)).mul(i(z(f(m),g).lessThanEqual(.5),1,0));return e.emissiveNode=j(1,.9,.72).mul(y).mul(i(u.greaterThan(.5),1,0)).mul(3.5).mul(p).div(b(1).add(d.mul(6))),e}function Se(){let e=new H({color:16777215,roughness:.6,metalness:.35,side:2});e.name=`BridgeLattice.TSL`,e.vertexColors=!0;let t=k(),n=t.x,r=t.y,a=d(t).add(1e-4),o=r.lessThan(1.5),s=r,c=x(n),l=p(s,b(.08).add(a.y)).add(p(b(.92).sub(a.y),s)),u=p(w(c,b(1).sub(c)),b(.05).add(a.x)),f=n.fract().sub(s).abs(),m=n.fract().sub(b(1).sub(s)).abs(),h=p(w(f,m),b(.06).add(a.x).add(a.y)),g=l.add(u).add(h).greaterThanEqual(.5).or(P(a.x,a.y).greaterThanEqual(.09)),_=r.sub(2),v=n.mul(16),y=d(I(v,_)).add(1e-4),S=p(b(.9).sub(y.y),_).add(p(_,b(.07).add(y.y))).add(p(_.sub(.5).abs(),b(.035).add(y.y))),C=p(w(n.fract(),b(1).sub(n.fract())),b(.04).add(y.x.div(16))),T=p(n.mul(16).fract().sub(.5).abs(),b(.12).add(y.x)),E=S.add(C).add(T).greaterThanEqual(.5).or(y.x.lessThan(.6));return e.maskNode=i(o,g,E),e}function q(e,n,r,i){return b(1).sub(t(r.mul(.5).sub(i),r.mul(.5).add(i),e.sub(n).abs()))}function Ce(e,r){let a=new H({color:7697004,roughness:.9});a.name=`BridgeDeck.TSL`;let o=m,s=l(_),c=k(),u=L(F(`aEx`,`vec3`),`vBridgeDeckExtraNode`),d=n(e.noise,o.xz.div(23)).rgb,p=n(e.asphaltCol,o.xz.div(6)).rgb.mul(1.1),h=f(u.z.add(.5)),g=j(.42,.42,.41).mul(b(.85).add(d.r.mul(.25))),v=c.y.abs(),y=c.x,S=u.x,C=u.y,T=c.y.fwidth().add(.001),E=b(1).sub(t(.08,.3,T)),D=q(v,C.sub(.45),b(.15),T);D=P(D,i(S.greaterThan(.3),q(v,S.add(.45),b(.15),T),0));let O=f(C.sub(S).sub(1).div(r).add(.5)),A=f(v.sub(S).sub(.5).div(r).add(.5)),M=q(v,S.add(.5).add(A.mul(r)),b(.13),T).mul(i(x(y.div(12)).lessThanEqual(.27),1,0));D=P(D,M.mul(i(A.greaterThanEqual(1).and(A.lessThanEqual(O.sub(1))),1,0)));let ee=i(S.lessThan(.3),q(v,b(.2),b(.12),T),0),te=x(v.sub(S).sub(.5).div(r)),ne=b(1).sub(t(.08,.16,te.sub(.27).abs())).add(b(1).sub(t(.08,.16,te.sub(.73).abs()))),re=p.mul(b(1).sub(ne.mul(.13).mul(i(v.lessThanEqual(C.sub(.5)),1,0)).mul(i(v.greaterThanEqual(S.add(.5)),1,0)))),ie=x(y.div(30)).sub(.5).abs().mul(30),ae=b(1).sub(t(.05,b(.12).add(y.div(30).fwidth()),ie)).mul(E);re=R(re,j(.32,.31,.3),ae),re=R(re,j(.84,.83,.78).mul(b(.8).add(d.g.mul(.25))),D.mul(.85).mul(E)),re=R(re,j(.78,.6,.17),ee.mul(.85).mul(E));let z=y.div(.32),V=x(z),oe=f(z),se=x(N(oe.mul(12.9898)).mul(43758.5453)),ce=R(j(.43,.33,.24).mul(b(.72).add(se.mul(.34))),j(.4,.38,.35).mul(b(.8).add(se.mul(.2))),b(.35).add(d.g.mul(.4))),le=n(e.noise,I(o.x.mul(.9),c.y.mul(11).add(oe.mul(3.1)))).r,U=ce.mul(b(.82).add(le.mul(.3)));U=U.mul(b(1).sub(t(.52,.8,n(e.noise,o.xz.div(7)).b).mul(.32))),U=U.mul(b(1).sub(t(1.2,3.2,v).mul(.18))),U=U.mul(b(1).sub(b(1).sub(t(0,b(.07).add(z.fwidth()),w(V,b(1).sub(V)))).mul(b(1).sub(t(.2,.5,z.fwidth()))).mul(.55)));let ue=j(.36,.34,.31).mul(b(.7).add(n(e.noise,o.xz.div(1.3)).r.mul(.5))),de=x(y.div(.62)).sub(.5).abs().lessThan(.2).and(v.sub(2.3).abs().lessThan(1.35)).and(y.div(.62).fwidth().lessThan(.5)),fe=i(de,j(.22,.18,.15),ue),pe=j(.56,.55,.52).mul(b(.8).add(d.r.mul(.3))),W=p;return W=i(h.equal(1),re,W),W=i(h.equal(2),U,W),W=i(h.equal(3),fe,W),W=i(h.equal(4),pe,W),W=i(s.y.lessThan(.5),g,W),a.colorNode=B(7697004).mul(W),a}var J=`// bridges shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
out vec3 vWPs;
out vec3 vWNs;
// @section vertexFogVertex
#include <fog_vertex>
vWPs = (modelMatrix * vec4(transformed, 1.0)).xyz;
vWNs = normalize(mat3(modelMatrix) * objectNormal);
// @section fragmentCommon
#include <common>
uniform sampler2D tSN;
in vec3 vWPs;
in vec3 vWNs;
// @section fragmentMap
{
vec3 an = abs(vWNs);
vec2 q = an.x > an.z ? vWPs.zy : vWPs.xy;
if(an.y > 0.7) q = vWPs.xz;
vec3 nz = texture(tSN, q / 17.0).rgb, nz2 = texture(tSN, q / 3.1).rgb;
// ashlar coursing: 0.9 m courses, 1.8 m blocks (offset every other course), thin dark joints
float cy = q.y / 0.9, row = floor(cy), cx = q.x / 1.8 + 0.5 * mod(row, 2.0);
vec2 f = vec2(fract(cx), fract(cy));
vec2 fw = fwidth(vec2(cx, cy)) * 1.5 + 1e-4;
float joint = max(1.0 - smoothstep(0.0, 0.03 + fw.x, min(f.x, 1.0 - f.x)), 1.0 - smoothstep(0.0, 0.04 + fw.y, min(f.y, 1.0 - f.y)));
joint *= 1.0 - smoothstep(0.2, 0.6, max(fw.x, fw.y));
float blk = fract(sin(dot(floor(vec2(cx, cy)), vec2(12.9898, 78.233))) * 43758.5453);
vec3 c = diffuseColor.rgb * (0.86 + 0.16 * blk) * (0.8 + 0.3 * nz.r) * (0.93 + 0.1 * nz2.g);
c *= 1.0 - 0.35 * joint;
c *= mix(0.72, 1.0, smoothstep(- 1.0, 6.0, vWPs.y)); // wet / algae band at the water line
c *= 1.0 - 0.18 * smoothstep(0.55, 0.85, nz.b) * (0.5 + 0.5 * an.x + 0.5 * an.z); // grime streaks
diffuseColor.rgb = c;
}
// @section vertexCommonByCableGlow
#include <common>
in vec3 aEx;
out float vGlow;
// @section vertexBeginVertex
#include <begin_vertex>
vGlow = aEx.x;
// @section fragmentCommonByCableGlow
#include <common>
in float vGlow;
uniform float uNightK;
// @section fragmentEmissive
#include <emissivemap_fragment>
totalEmissiveRadiance += vec3(1.0, 0.82, 0.55) * vGlow * (0.15 + 7.0 * uNightK);
// @section vertexCommonByCableNeck
#include <common>
in vec3 aEx;
out vec3 vWPc;
out float vNeck, vFat;
// @section vertexBeginVertexCableBend
#include <begin_vertex>
vNeck = aEx.x;
{
vec3 wp = (modelMatrix * vec4(transformed, 1.0)).xyz;
vFat = max(0.0, length(wp - cameraPosition) * 0.0011 - 0.15);
transformed += objectNormal * vFat;
vWPc = wp;
}
// @section fragmentCommonCableLighting
#include <common>
in vec3 vWPc;
in float vNeck, vFat;
uniform float uNightK;
// @section fragmentMetalness
#include <metalnessmap_fragment>
metalnessFactor *= 1.0 - 0.85 * uNightK;
diffuseColor.rgb *= 1.0 - 0.7 * uNightK;
// @section fragmentEmissiveCableLighting
#include <emissivemap_fragment>
if(uNightK > 0.0 && vNeck > 0.5) {
float q = (vWPc.x + vWPc.z) * 0.18;
float fq = fwidth(q) + 1e-4;
// (night) small bright bulbs, not a glowing bar: each bulb stays >= ~1.5 px long at any distance (never averaged
// into a continuous line); once bulbs crowd to < ~3.5 px apart only every 2nd / 4th / ... bulb is drawn (stable
// world-space subset), so far bridges keep a dotted necklace of points. Bloom does the glow
float st = exp2(ceil(log2(max(1.0, fq * 6.0)))); // (night r11) 3.5: far necklaces read as dashed white bars
float hw = max(0.05, fq * 0.75), dd = abs(fract(q) - 0.5);
float dot1 = (1.0 - smoothstep(hw - 0.5 * fq, hw + 0.5 * fq, dd)) * step(mod(floor(q), st), 0.5);
// (night r11) the cable is fattened with distance (~1.5 m at 1.5 km): the bulb's emission is scaled back by the
// fattening, so far necklaces read as fine warm points instead of thick white dashes (esb view)
totalEmissiveRadiance += vec3(1.0, 0.9, 0.72) * dot1 * 3.5 * uNightK / (1.0 + vFat * 6.0);
}
// @section vertexCommonByTubeUv
#include <common>
out vec2 vTU;
// @section vertexBeginVertexByTubeUv
#include <begin_vertex>
vTU = uv;
// @section fragmentCommonByTubeUv
#include <common>
in vec2 vTU;
// @section fragmentClipping
#include <clipping_planes_fragment>
if(vTU.y < 1.5) {
float u = fract(vTU.x), v = vTU.y;
vec2 fw = fwidth(vTU) + 1e-4;
float chord = step(v, 0.08 + fw.y) + step(0.92 - fw.y, v);
float post = step(min(u, 1.0 - u), 0.05 + fw.x);
float d1 = abs(u - v), d2 = abs(u - (1.0 - v));
float diag = step(min(d1, d2), 0.06 + fw.x + fw.y);
          // far away the web is sub-pixel: keep it solid (dithered holes would read as polka dots)
if(chord + post + diag < 0.5 && max(fw.x, fw.y) < 0.09) discard;
} else {
float v = vTU.y - 2.0, u = vTU.x;
vec2 fw = fwidth(vec2(u * 16.0, v)) + 1e-4;
float rail = step(0.9 - fw.y, v) + step(v, 0.07 + fw.y) + step(abs(v - 0.5), 0.035 + fw.y);
float post = step(min(fract(u), 1.0 - fract(u)), 0.04 + fw.x / 16.0);
float pick = step(abs(fract(u * 16.0) - 0.5), 0.12 + fw.x);
if(rail + post + pick < 0.5 && fw.x < 0.6) discard;
}
// @section vertexCommonByDeckExtras
#include <common>
in vec3 aEx;
out vec3 vWPd;
out vec3 vWNd;
out vec2 vUD;
out vec3 vEx;
// @section vertexFogVertexByDeckUv
#include <fog_vertex>
vWPd = (modelMatrix * vec4(transformed, 1.0)).xyz;
vWNd = normalize(mat3(modelMatrix) * objectNormal);
vUD = uv;
vEx = aEx;
// @section fragmentCommonDeckMaterial
#include <common>
uniform sampler2D tDC;
uniform sampler2D tSN;
in vec3 vWPd;
in vec3 vWNd;
in vec2 vUD;
in vec3 vEx;
float bandL(float l, float c, float w, float fw) {
return 1.0 - smoothstep(w * 0.5 - fw, w * 0.5 + fw, abs(l - c));
}
// @section fragmentMapByDeckUv
{
vec3 c = texture(tDC, vWPd.xz / 6.0).rgb * 1.1;
float md = floor(vEx.z + 0.5);
vec3 nz = texture(tSN, vWPd.xz / 23.0).rgb;
if(vWNd.y < 0.5) c = vec3(0.42, 0.42, 0.41) * (0.85 + 0.25 * nz.r); // slab edges / fascia / kerbs: concrete
else if(md == 1.0) {
float l = abs(vUD.y), a = vUD.x, inner = vEx.x, outer = vEx.y;
float fw = fwidth(vUD.y) + 1e-3;
float fade = 1.0 - smoothstep(0.08, 0.3, fw); // lines fade to the asphalt tone before they alias
float w = bandL(l, outer - 0.45, 0.15, fw);
if(inner > 0.3) w = max(w, bandL(l, inner + 0.45, 0.15, fw));
float n = floor((outer - inner - 1.0) / __SHADER_INJECT_0__ + 0.5);
float k = floor((l - inner - 0.5) / __SHADER_INJECT_1__ + 0.5);
if(k >= 1.0 && k <= n - 1.0) w = max(w, bandL(l, inner + 0.5 + k * __SHADER_INJECT_2__, 0.13, fw) * step(fract(a / 12.0), 0.27));
float y = inner < 0.3 ? max(bandL(l, 0.2, 0.12, fw), 0.0) : 0.0;
          // tyre-polished wheel paths (darker, smoother) in every lane
float ln = fract((l - inner - 0.5) / __SHADER_INJECT_3__);
float wear = (1.0 - smoothstep(0.08, 0.16, abs(ln - 0.27))) + (1.0 - smoothstep(0.08, 0.16, abs(ln - 0.73)));
c *= 1.0 - 0.13 * wear * step(l, outer - 0.5) * step(inner + 0.5, l);
          // expansion joints every 30 m (steel strip)
c = mix(c, vec3(0.32, 0.31, 0.3), (1.0 - smoothstep(0.05, 0.12 + fwidth(a), abs(fract(a / 30.0) - 0.5) * 30.0)) * fade);
c = mix(c, vec3(0.84, 0.83, 0.78) * (0.8 + 0.25 * nz.g), w * 0.85 * fade);
c = mix(c, vec3(0.78, 0.6, 0.17), y * 0.85 * fade);
} else if(md == 2.0) { // timber planks across the promenade, grey-brown, worn
float a = vUD.x / 0.32, pl = fract(a), id = floor(a);
float h = fract(sin(id * 12.9898) * 43758.5453);
          // (bridges r2) weathered timber: warm brown boards greyed by the sun, darker grime patches and a
          // foot-polished centre band, dark gaps between the boards
vec3 wood = vec3(0.43, 0.33, 0.24) * (0.72 + 0.34 * h);
vec3 grey = vec3(0.4, 0.38, 0.35) * (0.8 + 0.2 * h);
c = mix(wood, grey, 0.35 + 0.4 * nz.g);
float grain = texture(tSN, vec2(vWPd.x * 0.9, vUD.y * 11.0 + id * 3.1)).r;
c *= 0.82 + 0.3 * grain;
c *= 1.0 - 0.32 * smoothstep(0.52, 0.8, texture(tSN, vWPd.xz / 7.0).b);       // grime / wet-rot patches
c *= 1.0 - 0.18 * smoothstep(1.2, 3.2, abs(vUD.y));                            // edges darker (less foot traffic)
c *= 1.0 - 0.55 * (1.0 - smoothstep(0.0, 0.07 + fwidth(a), min(pl, 1.0 - pl))) * (1.0 - smoothstep(0.2, 0.5, fwidth(a)));
} else if(md == 3.0) { // ballast + timber ties every 0.62 m
vec3 bal = vec3(0.36, 0.34, 0.31) * (0.7 + 0.5 * texture(tSN, vWPd.xz / 1.3).r);
float t = fract(vUD.x / 0.62), tie = step(abs(t - 0.5), 0.2) * step(abs(abs(vUD.y) - 2.3), 1.35);
c = mix(bal, vec3(0.22, 0.18, 0.15), tie * (1.0 - smoothstep(0.2, 0.5, fwidth(vUD.x / 0.62))));
} else if(md == 4.0) {
c = vec3(0.56, 0.55, 0.52) * (0.8 + 0.3 * nz.r);
}
diffuseColor.rgb *= c;
}
`,we=`// canopy shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
out float vCy;
out vec3 vCn;
out vec3 vCi;
// @section vertexBeginVertex
#include <begin_vertex>
vCy = position.y;
vCn = normal;
vCi = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
__SHADER_INJECT_0__
// @section fragmentCommon
#include <common>
in float vCy;
in vec3 vCn;
in vec3 vCi;
float cClump;
float cH3(vec3 p) {
return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}
float cVn(vec3 p) {
vec3 i = floor(p), f = fract(p);
f = f * f * (3.0 - 2.0 * f);
return mix(mix(mix(cH3(i), cH3(i + vec3(1, 0, 0)), f.x), mix(cH3(i + vec3(0, 1, 0)), cH3(i + vec3(1, 1, 0)), f.x), f.y), mix(mix(cH3(i + vec3(0, 0, 1)), cH3(i + vec3(1, 0, 1)), f.x), mix(cH3(i + vec3(0, 1, 1)), cH3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
// @section fragmentColor
#include <color_fragment>
diffuseColor.rgb *= mix(0.45, 1.05, smoothstep(- 0.9, 0.7, vCy));   // dark underside / inner crown
diffuseColor.rgb *= 0.92 + 0.16 * fract(sin(dot(floor(vCn * 2.0 + 0.5), vec3(12.9, 78.2, 37.7))) * 4375.5); // clump tone breakup
// (round 7) cauliflower foliage clusters: leaf-mass lumps with dark gaps between them (per-crown phase), so the
// crowns read as trees, not smooth cotton balls / lollipops
cClump = cVn(vCn * 3.3 + vCi * 0.137) * 0.62 + cVn(vCn * 7.9 + vCi * 0.291) * 0.38;
diffuseColor.rgb *= mix(0.58, 1.1, smoothstep(0.28, 0.72, cClump));
// @section fragmentNormalMaps
#include <normal_fragment_maps>
{
vec3 sx = normalize(dFdx(- vViewPosition)), sy = normalize(dFdy(- vViewPosition));
vec2 dh = vec2(dFdx(cClump), dFdy(cClump)) * 2.2;
vec3 r1 = cross(sy, normal), r2 = cross(normal, sx);
float det = dot(sx, r1);
vec3 bn = normalize(abs(det) * normal - sign(det) * (dh.x * r1 + dh.y * r2));
if(det != 0.0) normal = bn;
}

// @section distanceFade
{
vec3 ic = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
float fs = smoothstep(__SHADER_INJECT_0__, __SHADER_INJECT_1__, length(ic - cameraPosition));
transformed *= max(fs, 1e-3);
}
`;function Te(e=null,n=`high`){let r=new H({color:16777215,roughness:.95,metalness:0,flatShading:!1});r.name=`FarCanopy.TSL`;let i=F(`position`,`vec3`),a=L(i,`vCanopyPositionNode`),o=L(F(`normal`,`vec3`),`vCanopyNormalNode`),s=L(F(`aCanopyCenter`,`vec3`),`vCanopyCenterNode`);if(e){let n=ee.sub(F(`aCanopyCenter`,`vec3`)).length(),a=t(e[0],e[1],n).max(.001);r.positionNode=i.mul(a)}let c=x(N(g(f(o.mul(2).add(.5)),j(12.9,78.2,37.7))).mul(4375.5)),l=R(.45,1.05,t(-.9,.7,a.y)),u=b(1);if(n!==`low`){let e=re(o.mul(3.3).add(s.mul(.137))).mul(.5).add(.5).mul(.62).add(re(o.mul(7.9).add(s.mul(.291))).mul(.5).add(.5).mul(.38));u=R(.58,1.1,t(.28,.72,e));let n=h.dFdx(),i=h.dFdy(),a=M,c=i.cross(a),l=a.cross(n),d=n.dot(c),f=d.sign().mul(e.dFdx().mul(c).add(e.dFdy().mul(l)).mul(2.2));r.normalNode=d.abs().mul(a).sub(f).normalize()}r.colorNode=l.mul(b(.92).add(c.mul(.16))).mul(u);let d=L(F(`aCanopyColor`,`vec3`),`vCanopyColorNode`);return r.userData.webgpuFillAlbedo=j(r.colorNode).mul(d),r}var Ee=`// waterfront shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
in float aTile;
out float vTile;
out vec2 vCuv;
out vec3 vCwp;
out float vCny;
// @section vertexFogVertex
#include <fog_vertex>
vTile = aTile;
vCuv = uv;
vCwp = (modelMatrix * vec4(transformed, 1.0)).xyz;
vCny = normal.y;
// @section fragmentCommon
#include <common>
uniform sampler2D tAtlas;
uniform sampler2D tNoise;
uniform sampler2D tPave;
in float vTile;
in vec2 vCuv;
in vec3 vCwp;
in float vCny;
float cR;
vec3 atlasTile(float t, vec2 q) {
vec2 off = vec2(mod(t, 2.0) * 0.5, 0.5 - floor(t / 2.0) * 0.5);
return textureGrad(tAtlas, off + 0.002 + fract(q) * 0.496, dFdx(q) * 0.496, dFdy(q) * 0.496).rgb;
}
vec3 coast() {
float t = floor(vTile + 0.5);
vec3 p = vCwp;
cR = 0.9;
vec3 nz = texture(tNoise, p.xz / 47.0 + p.y * 0.01).rgb;
vec3 c;
if(t < 3.5) {
c = atlasTile(t, vCuv);
c = pow(c, vec3(0.92)) * 1.05;
// soot / rust streaks running down from the coping, broken by noise along the wall
float sk = texture(tNoise, vec2(vCuv.x * 0.37 + p.x * 0.003, 0.2 + p.y * 0.006)).r;
c *= 1.0 - 0.28 * smoothstep(0.55, 0.85, sk) * (1.0 - abs(vCny));
c *= 0.86 + 0.28 * nz.g;
} else if(t < 4.5) {
c = vec3(1.0);
cR = 0.55;
} else if(t < 5.5) { // lawn: mown turf, darker clover patches, worn edges
float n2 = texture(tNoise, p.xz / 9.0).g;
c = mix(vec3(0.085, 0.115, 0.045), vec3(0.14, 0.15, 0.065), n2) * (0.85 + 0.3 * nz.r);
c *= 0.94 + 0.06 * step(0.5, fract(p.x / 3.0 + p.z / 7.0));
cR = 0.95;
} else if(t < 6.5) { // promenade pavers (hex / running bond like the esplanade fill in ground.ts)
c = texture(tPave, p.xz / 6.0).rgb;
vec2 hp = p.xz / vec2(0.9, 0.78);
float row = floor(hp.y), cu = fract(hp.x + 0.5 * mod(row, 2.0)), cv = fract(hp.y);
float jn = 1.0 - smoothstep(0.0, 0.07, min(min(cu, 1.0 - cu), min(cv, 1.0 - cv)));
float fwp = clamp(fwidth(hp.x) * 2.0, 0.0, 1.0);
c *= vec3(0.8, 0.77, 0.73) * (1.0 - 0.2 * jn * (1.0 - fwp)) * (0.9 + 0.2 * nz.r);
cR = 0.86;
} else if(t > 7.5) { // (r2) ribbed / slatted sheet metal: ribs along u (roofs, every 0.3 m) or v (roll-up doors, 0.12 m)
float q = t < 8.5 ? vCuv.x / 0.3 : vCuv.y / 0.12, f = fract(q), aa = clamp(fwidth(q), 0.0, 1.0);
float rib = mix(0.82 + 0.3 * smoothstep(0.35, 0.5, f) * (1.0 - smoothstep(0.5, 0.65, f)), 1.0, aa);
c = vec3(rib) * (0.85 + 0.25 * nz.r) * (1.0 - 0.25 * smoothstep(0.6, 0.9, texture(tNoise, p.xz / 9.0 + p.y * 0.05).g));
cR = 0.6;
} else { // picket card: vertical steel bars every 11.5 cm
float f = fract(vCuv.x / 0.115), aa = fwidth(vCuv.x / 0.115);
if(aa < 0.35 && abs(f - 0.5) > 0.09 + aa) discard;
c = vec3(1.0);
cR = 0.55;
}
// water line: wet dark band + green-black algae up to ~1 m above the water, darker still below it
float yw = p.y - __SHADER_INJECT_0__;
float wetTop = 0.75 + 0.45 * nz.b;
float wet = 1.0 - smoothstep(wetTop - 0.35, wetTop, yw);
c = mix(c, c * vec3(0.42, 0.47, 0.36), wet * 0.85);
c *= mix(1.0, 0.45, 1.0 - smoothstep(- 0.6, 0.05, yw));
cR = mix(cR, 0.35, wet * 0.8);
c *= mix(1.0, 0.82, smoothstep(250.0, 1100.0, length(p - cameraPosition)));
return c;
}
// @section fragmentMap
diffuseColor.rgb = coast();
// @section fragmentRoughness
float roughnessFactor = cR;
`;function De(e,r,a){let o=new H({vertexColors:!1,roughness:.88});o.name=`WaterfrontCoast.TSL`;let s=F(`aTile`,`float`).floor(),c=k(),u=m,h=l(_),g=j(u.x,u.y,u.z),v=I(u.x,u.z),C=n(e.noise,v.div(47).add(I(u.y.mul(.01)))).rgb,T=I(z(s,2).mul(.5),b(.5).sub(f(s.div(2)).mul(.5))).add(I(.002)).add(x(c).mul(.496)),E=n(r,T),O=S(E.rgb,.92).mul(1.05),A=n(e.noise,I(c.x.mul(.37).add(u.x.mul(.003)),b(.2).add(u.y.mul(.006)))).r,M=O.mul(b(1).sub(t(.55,.85,A).mul(b(1).sub(h.y.abs())).mul(.28))).mul(b(.86).add(C.g.mul(.28))),N=n(e.noise,v.div(9)).g,P=R(j(.085,.115,.045),j(.14,.15,.065),N).mul(b(.85).add(C.r.mul(.3))).mul(b(.94).add(p(.5,x(u.x.div(3).add(u.z.div(7)))).mul(.06))),te=v.div(6),ne=n(e.sidewalkCol,te).rgb,L=v.div(I(.9,.78)),re=f(L.y),ie=x(L.x.add(z(re,2).mul(.5))),ae=x(L.y),B=w(w(ie,b(1).sub(ie)),w(ae,b(1).sub(ae))),V=b(1).sub(t(0,.07,B)),oe=d(L.x).mul(2).clamp(0,1),se=ne.mul(j(.8,.77,.73)).mul(b(1).sub(V.mul(b(1).sub(oe)).mul(.2))).mul(b(.9).add(C.r.mul(.2))),ce=c.x.div(.3),le=c.y.div(.12),U=i(s.lessThan(8.5),ce,le),ue=x(U),de=d(U).clamp(0,1),fe=b(.82).add(t(.35,.5,ue).mul(b(1).sub(t(.5,.65,ue))).mul(.3)),pe=R(fe,b(1),de).mul(b(.85).add(C.r.mul(.25))).mul(b(1).sub(t(.6,.9,n(e.noise,v.div(9).add(u.y.mul(.05))).g).mul(.25))),W=x(c.x.div(.115)),me=d(c.x.div(.115)),G=me.greaterThanEqual(.35).or(y(W.sub(.5)).lessThanEqual(b(.09).add(me))),K=D().rgb;K=i(s.lessThan(3.5),M,K),K=i(s.greaterThan(4.5).and(s.lessThan(5.5)),P,K),K=i(s.greaterThan(5.5).and(s.lessThan(6.5)),se,K),K=i(s.greaterThan(7.5),pe,K);let he=u.y.sub(a),ge=b(.75).add(C.b.mul(.45)),_e=b(1).sub(t(ge.sub(.35),ge,he));K=R(K,K.mul(j(.42,.47,.36)),_e.mul(.85)),K=K.mul(R(1,.45,b(1).sub(t(-.6,.05,he))));let ve=ee.sub(g).length();K=K.mul(R(1,.82,t(250,1100,ve))),o.colorNode=K,o.roughnessNode=i(s.lessThan(3.5),b(.9).sub(_e.mul(.55)),i(s.greaterThan(3.5).and(s.lessThan(4.5)),b(.55),i(s.greaterThan(4.5).and(s.lessThan(5.5)),b(.95),i(s.greaterThan(5.5).and(s.lessThan(6.5)),b(.86).sub(_e.mul(.4)),b(.6)))));let ye=s.greaterThan(6.5).and(s.lessThan(7.5));return o.maskNode=s.lessThan(6.5).or(s.greaterThan(7.5)).or(ye.and(G)),o.userData.setAtlasTexture=e=>{E.value=e},o}var Oe=`// ground shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
in vec3 aRoad;
out vec3 vWP;
out vec3 vRoad;
// @section vertexFogVertex
#include <fog_vertex>
vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;
vRoad = aRoad;
// @section fragmentCommon
#include <common>
uniform sampler2D tCol;
uniform sampler2D tNrm;
uniform sampler2D tMacro;
uniform sampler2D tNoise;
uniform float uRoadDetailDist;
in vec3 vWP;
in vec3 vRoad;
uniform sampler2D tDec;
vec3 aN;
float aR;
float gDecR = 0.0; // (textures r3)
vec3 asphalt() {
vec2 p = vWP.xz;
float adist = length(vWP - cameraPosition);
vec3 c = texture(tCol, p / 6.0).rgb * 0.88; // (textures r4) critic: 'street asphalt light grey and clean' -> darker binder
#if ROAD_DETAIL_LEVEL >= 1
if(adist < uRoadDetailDist) {
vec3 c2 = texture(tCol, vec2(p.y, - p.x) / 7.3 + 0.37).rgb * 0.88;
c = mix(c, c2, 0.35);
}
#endif
vec3 nd = texture(tNrm, p / 6.0).rgb;
vec3 m = texture(tMacro, p / 64.0).rgb;
vec3 nz = texture(tNoise, p / 97.0).rgb;
#if ROAD_DETAIL_LEVEL >= 1
vec3 m2 = texture(tMacro, vec2(- p.y, p.x) / 151.0 + 0.5).rgb;
#else
// Low quality reuses the noise sample instead of spending another texture
// fetch. Keep broad asphalt mottling visible at the reduced render resolution.
vec3 m2 = nz;
#endif
float bright = (0.8 + 0.4 * m.r) * (0.88 + 0.24 * m2.r) * (0.94 + 0.12 * nz.r); // gentle macro variation (was blotchy)
c *= bright;
// (no crack lines: user feedback - roads read as uniform, softly worn asphalt; refs/road)
// lanes / tyre grime
// road rect kind (vRoad.x: 0 avenue, 1 street, 2 intersection) + centre line (vRoad.y) from the geometry
int rk = int(vRoad.x + 0.5);
float ax = p.x - vRoad.y, sz = p.y - vRoad.z;
bool onAv = rk != 1, onSt = rk != 0;
float track = 0.0, oil = 0.0, gutter = 0.0;
if(onAv && ! onSt) {
float l = mod(ax + 10.8, 3.6) - 1.8;
track = exp(- pow((abs(l) - 0.85) / 0.3, 2.0));
oil = exp(- pow(l / 0.45, 2.0));
gutter = 1.0 - smoothstep(0.0, 0.8, 11.0 - abs(ax));
} else if(onSt && ! onAv) {
float l = sz;
track = exp(- pow((abs(l) - 0.9) / 0.35, 2.0)) * 0.8;
oil = exp(- pow(l / 0.5, 2.0));
float sh = 5.0 + (vRoad.x - 1.0) * 100.0; // (layout2 r9) per-street half width
if(sh > 6.0) {
float l2 = mod(abs(sz), 3.3) - 1.65;
track = exp(- pow((abs(l2) - 0.85) / 0.3, 2.0)) * 0.8;
oil = exp(- pow(l2 / 0.45, 2.0));
} // two lanes each way
gutter = 1.0 - smoothstep(0.0, 0.7, sh - abs(sz));
} else if(onSt && onAv) {
track = 0.25;
oil = 0.3;
}
float tv = 0.6 + 0.4 * nz.g;
c *= 1.0 - 0.2 * track * tv; // soft tyre-wear lanes (street r6: 0.14 -> 0.2)
float stain = m.b * oil;
c *= 1.0 - 0.2 * stain - 0.05 * oil * nz.b; // faint, broad (no dark lane-centre streaks)
c *= 1.0 - 0.36 * gutter * (0.6 + 0.4 * nz.b); // (street r6) darker wet kerb gutter
c = mix(c, c * vec3(0.95, 0.93, 0.9), gutter);
// patches: soft, broad darker areas only (low-frequency noise, no hard edges or seams)
#if ROAD_DETAIL_LEVEL >= 1
if(adist < uRoadDetailDist) {
float patchN = smoothstep(0.62, 0.78, texture(tNoise, p / 41.0 + 0.23).b) * 0.6;
c *= 1.0 - 0.14 * patchN;
}
#endif
// (street r6) critic: 'road too clean'. Mid-scale blotches: parked-car oil drips + dried spill stains (irregular,
// 0.5-2 m, from two noise octaves), strongest in the parking / curb lanes (gutter side), faint mid-road.
#if ROAD_DETAIL_LEVEL >= 1
if(adist < uRoadDetailDist) {
{
float s1 = texture(tNoise, p / 3.7 + 0.61).g, s2 = texture(tNoise, p / 1.3 + 0.17).r;
float blot = smoothstep(0.66, 0.8, s1 * 0.75 + s2 * 0.35);
float curbLane = rk == 0 ? smoothstep(6.5, 8.5, abs(ax)) : (rk == 1 ? smoothstep(2.0, 3.2, abs(sz)) : 0.3);
c *= 1.0 - blot * (0.1 + 0.2 * curbLane);
}
// (street r3) lane-by-lane repaving: whole-lane sections milled + resurfaced at different times (crisp straight
// edges on the lane lines, lighter older / darker fresher asphalt) like the refs' patchwork avenues. No cracks.
{
float li, lane0, along, cw;
if(rk == 0) {
li = floor((ax + 10.8) / 3.6);
along = p.y;
cw = 3.6;
lane0 = ax + 10.8 - li * 3.6;
} else if(rk == 1) {
li = sz < 0.0 ? 30.0 : 31.0;
along = p.x;
cw = 5.0;
lane0 = abs(sz);
} else {
li = 40.0 + floor(p.x / 9.0);
along = p.y;
cw = 9.0;
lane0 = mod(p.x, 9.0);
}
float seg = floor(along / 23.0 + li * 0.37);
float hh = fract(sin(dot(vec3(li, seg, vRoad.y * 0.013 + vRoad.z * 0.007), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
float fu = fract(along / 23.0 + li * 0.37);
float edge = smoothstep(0.0, 0.004, fu) * smoothstep(1.0, 0.996, fu) * smoothstep(0.0, 0.04, lane0) * smoothstep(cw, cw - 0.04, lane0);
float rp = hh < 0.16 ? 1.13 : hh < 0.3 ? 0.84 : hh < 0.36 ? 1.22 : 1.0;
c *= mix(1.0, rp, edge * (0.75 + 0.25 * nz.r));
}
// (street r11) critic: 'road clean, no patches / stains'. Utility-cut restorations: sharp-edged rectangles of
// fresher (darker) or older (paler) tar, 1-4 m, ~1 per 3 cells of 11 m; a thin sealant rim; plus broad dark
// oil pools in the stop lanes approaching the intersections (no crack lines: user rule)
{
vec2 cg = vec2(11.0, 13.0), cid2 = floor(p / cg), cf = p - cid2 * cg;
float h1 = fract(sin(dot(cid2, vec2(41.31, 17.77))) * 23758.54), h2 = fract(h1 * 73.1 + 0.3), h3 = fract(h1 * 11.7 + 0.61);
float fwp = fwidth(p.x) * 1.2 + 1e-3;
if(h1 < 0.34 && rk != 2) {
vec2 hs = vec2(0.6 + 1.6 * h2, 0.5 + 1.1 * h3), cc2 = vec2(2.0 + h3 * 7.0, 2.0 + h2 * 9.0);
vec2 dq = abs(cf - cc2) - hs;
float inP = 1.0 - smoothstep(- fwp, fwp, max(dq.x, dq.y));
float rim = (1.0 - smoothstep(0.0, 0.07 + fwp, abs(max(dq.x, dq.y))));
c *= mix(1.0, h2 < 0.6 ? 0.72 : 1.18, inP * (0.85 + 0.3 * nz.g)); // (street r12) 0.8 / 1.12 -> 0.72 / 1.18: readable from rooftop height
c *= 1.0 - 0.22 * rim;
}
// (street r12) critic (ref 16): 'road is uniform dark asphalt; add patching'. Long utility trench restorations:
// 0.9-1.4 m wide strips running 4-11 m across or along the lanes, a few per block, crisp sealed edges
if(rk != 2) {
vec2 tg = vec2(29.0, 37.0), tid = floor(p / tg), tf2 = p - tid * tg;
float t1 = fract(sin(dot(tid, vec2(12.71, 91.37))) * 43758.55), t2 = fract(t1 * 57.3 + 0.21), t3 = fract(t1 * 19.9 + 0.77);
if(t1 < 0.42) {
bool acr = t2 < 0.5;
vec2 hs2 = acr ? vec2(2.0 + 3.5 * t3, 0.45 + 0.25 * t2) : vec2(0.45 + 0.25 * t3, 2.0 + 3.5 * t2);
vec2 c3 = vec2(6.0 + t3 * 17.0, 6.0 + t2 * 25.0);
vec2 dq2 = abs(tf2 - c3) - hs2;
float dd = max(dq2.x, dq2.y);
float inT = 1.0 - smoothstep(- fwp, fwp, dd);
c *= mix(1.0, t3 < 0.55 ? 0.66 : 1.2, inT * (0.8 + 0.4 * nz.b));
c *= 1.0 - 0.25 * (1.0 - smoothstep(0.0, 0.06 + fwp, abs(dd)));
}
}
vec2 op = p / 2.3 + 0.17;
float pool = smoothstep(0.62, 0.82, texture(tNoise, op).r * 0.7 + texture(tNoise, op * 2.9).g * 0.4) * (rk == 2 ? 0.3 : oil);
c *= 1.0 - 0.25 * pool;
}
}
#endif
// (textures r3) critic: 'asphalt uniform noise, no patches, cracks, tyre marks'. Photographic repair decals
// ($imagegen sheet, asphalt_decals.webp: 8 cells of colour ratio vs plain asphalt): fresh / old sealed utility cuts,
// trench strips, pothole fills, oil stains, skid marks, manholes in a new-asphalt collar, patch clusters. One
// candidate per 8 m cell (~55 % used), random size / quarter-turn / mirror, jittered inside the cell. One texture
// tap with explicit gradients (no mip seams at the cell borders).
#if ROAD_DETAIL_LEVEL >= 2
if(adist < uRoadDetailDist) {
{
vec2 dcg = p / 8.0, dci = floor(dcg), dcf = dcg - dci;
vec2 dqx = dFdx(p), dqy = dFdy(p); // uniform control flow
float e1 = fract(sin(dot(dci, vec2(27.17, 61.93))) * 43758.5453), e2 = fract(e1 * 43.7 + 0.13), e3 = fract(e1 * 7.31 + 0.71);
if(e1 < 0.55) {
float k = e1 < 0.03 ? 6.0 : floor(e2 * 7.999);
if(k > 5.5) k = e1 < 0.03 ? 6.0 : 7.0; // manholes rarer (street decals have them)
float sz = (k > 5.5 && k < 6.5) ? 1.5 : (1.3 + 1.4 * e3); // decal cell = sz x 2 sz (m)
vec2 ctr = 0.5 + (vec2(e2, e3) - 0.5) * (1.0 - vec2(2.0 * sz, 2.0 * sz) / 8.0);
vec2 q = (dcf - ctr) * 8.0; // metres from the decal centre
if(e3 < 0.5) {
q = q.yx;
dqx = dqx.yx;
dqy = dqy.yx;
}
if(fract(e1 * 91.1) < 0.5) {
q.x = - q.x;
dqx.x = - dqx.x;
dqy.x = - dqy.x;
}
vec2 du = q / vec2(sz, 2.0 * sz) + 0.5;
if(all(greaterThan(du, vec2(0.0))) && all(lessThan(du, vec2(1.0)))) {
vec2 cc = vec2(mod(k, 4.0), floor(k / 4.0));
vec2 duv = vec2((cc.x + du.x) / 4.0, 1.0 - (cc.y + 1.0 - du.y) / 2.0);
vec2 gs = vec2(1.0 / (4.0 * sz), 1.0 / (4.0 * sz));
vec3 dr = textureGrad(tDec, duv, dqx * gs, dqy * gs).rgb * 2.0;
c *= mix(vec3(1.0), dr, 0.9);
gDecR = clamp(1.0 - dot(dr, vec3(0.333)), 0.0, 0.6);
}
}
}
}
#endif
c *= vec3(0.97, 0.99, 1.03); // slightly blue-grey, faded
// aerial LOD tone: seen from afar, grime, oil, parked cars and kerb shadows aggregate -> the road reads darker than
// the sidewalks (the street grid stays legible from the rooftops instead of washing into pale strips)
c *= mix(1.0, 0.74, smoothstep(80.0, 600.0, adist)); // (round 7: 0.66 -> 0.52; round 10: 0.74 -- critic: streets read as dark trenches, not grey asphalt)
// (street agent r1) street-level tone: up close the refs' asphalt is a dark blue-grey, about half the sidewalk's
// value; fades out by 260 m so the rooftop / aerial read (above) is unchanged
c *= mix(0.8, 1.0, smoothstep(110.0, 260.0, adist)); // (street r3: 0.64 -> 0.7; r4: 0.8, refs 16 / 04 sunlit asphalt reads mid-grey so the wear decals show)
// (round 10) aerial traffic impostor: beyond the simulated-traffic radius the lanes carry static car-sized
// shapes (muted liveries, yellow cabs, a dark cast-shadow sliver), so the grid reads busy from altitude like the
// refs instead of empty trenches. Fades in past 260 m (the real vehicles cover the near field).
float tf = smoothstep(240.0, 420.0, adist);
if(tf > 0.0 && rk != 2) {
float lane, along, lw, gap;
vec2 cid;
if(rk == 0) {
float li = floor((ax + 10.8) / 3.6);
lane = ax - (li * 3.6 - 9.0);
along = p.y;
gap = 8.5;
cid = vec2(li, vRoad.y);
lw = 1.0;
} else {
float li = sz < 0.0 ? 0.0 : 1.0;
lane = sz - (li < 0.5 ? - 2.3 : 2.3);
along = p.x;
gap = 7.6;
cid = vec2(li + 20.0, vRoad.z);
lw = 0.8;
}
float cell = floor(along / gap), u = along - cell * gap - gap * 0.5;
float h1 = fract(sin(dot(vec3(cid, cell), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
float h2 = fract(h1 * 91.3171 + 0.123);
// denser bunching (platoons at lights): block-scale density wave along the road
float dens = (rk == 0 ? 0.5 : 0.32) * lw * (0.55 + 0.9 * texture(tNoise, vec2(along / 260.0, cid.x * 0.13 + cid.y * 0.001)).r);
if(h1 < dens) {
float L = h2 < 0.12 ? 3.4 : (h2 > 0.92 ? 3.9 : 2.25), Wd = h2 > 0.92 ? 1.25 : 0.92; // half extents (bus / van / car)
float du = abs(u + (h2 - 0.5) * 1.6) - L, dv = abs(lane) - Wd;
float inside = 1.0 - smoothstep(- 0.25, 0.25, max(du, dv));
float shadowS = 1.0 - smoothstep(- 0.3, 0.4, max(du, abs(lane - 0.9) - Wd));
float hc = fract(h2 * 37.77);
vec3 cc = hc < 0.22 ? vec3(0.62, 0.48, 0.12) : hc < 0.42 ? vec3(0.55, 0.55, 0.54) : hc < 0.6 ? vec3(0.05, 0.05, 0.055) : hc < 0.72 ? vec3(0.34, 0.35, 0.36) : hc < 0.8 ? vec3(0.36, 0.1, 0.08) : hc < 0.88 ? vec3(0.12, 0.17, 0.26) : vec3(0.46, 0.45, 0.42);
if(h2 > 0.92) cc = vec3(0.5, 0.52, 0.55); // buses / box vans: pale roofs
c = mix(c, c * 0.55, shadowS * tf * 0.8);
c = mix(c, cc, inside * tf);
}
}
aR = clamp(nd.b + 0.05 - 0.25 * stain - 0.08 * track, 0.35, 1.0);
aR = clamp(aR - 0.45 * gDecR, 0.35, 1.0); // (textures r3) fresh tar / oil decals are glossier
// (foundation r13) critic: 'avenue to the horizon is a thin bright white line'. Far away the grazing view of the
// worn, oily surface glared as a mirror-bright strip against the sun: from ~0.3 km the aggregate (cars, grime,
// kerb shadows, repairs) goes fully matte and a step darker, so avenues read as dark cuts to the horizon
aR = mix(aR, 1.0, smoothstep(300.0, 1100.0, adist));
c *= mix(1.0, 0.8, smoothstep(700.0, 2200.0, adist));
vec2 nxy = nd.rg * 2.0 - 1.0;
aN = normalize(vec3(nxy, sqrt(max(0.0, 1.0 - dot(nxy, nxy)))));
return c;
}
// @section fragmentMap
diffuseColor.rgb = asphalt();
// @section fragmentRoughness
float roughnessFactor = aR;
// @section fragmentNormalMaps
{
vec3 nw = normalize(vec3(aN.x, aN.z, aN.y));
normal = normalize((viewMatrix * vec4(nw, 0.0)).xyz);
}
// @section vertexCommonByWorldPosition
#include <common>
in vec4 aRect;
out vec4 vRect;
out vec3 vWP;
out vec3 vWN;
// @section vertexFogVertexByWorldPosition
#include <fog_vertex>
vRect = aRect;
vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;
vWN = normal;
// @section fragmentCommonByWorldPosition
#include <common>
uniform sampler2D tCol;
uniform sampler2D tNrm;
uniform sampler2D tNoise;
uniform sampler2D tCurb;
in vec4 vRect;
in vec3 vWP;
in vec3 vWN;
vec3 sN = vec3(0.0, 0.0, 1.0);
float sR = 0.85;
float curbJ(float a, float fw) {
float x = abs(fract(a / 2.4) - 0.5) * 2.4, w = max(0.012, fw * 1.5);
return 0.45 * smoothstep(1.2 - w, 1.2, x) * (0.012 / w);
} // (textures r2) curbstone joints, AA
void walk(out vec3 walkColor) {
vec2 p = vWP.xz;
vec2 fwP = fwidth(p); // (textures r2) uniform control flow
vec3 nz = texture(tNoise, p / 53.0).rgb;
float d = min(min(p.x - vRect.x, vRect.z - p.x), min(p.y - vRect.y, vRect.w - p.y));
if(vWN.y < 0.5) {
          // curb face: weathered concrete/granite, dirtier near the gutter
vec2 q = vec2(p.x + p.y, vWP.y) / 1.3;
vec3 c = texture(tCurb, q).rgb * 0.92; // (textures r2) $imagegen granite curbstone (was the sidewalk sheet)
c *= 1.0 - curbJ(p.x + p.y, fwP.x + fwP.y); // 2.4 m stone joints
c *= mix(0.55, 1.0, smoothstep(- 0.02, 0.14, vWP.y));
sR = 0.85;
sN = vec3(0.0, 0.0, 1.0);
walkColor = c;
return;
}
vec2 uv = p / 6.0; // (textures) imagegen sidewalk sheet holds 4 x 4 slabs -> 1.5 m (5 ft) NYC slabs
vec3 c = texture(tCol, uv).rgb;
vec3 n = texture(tNrm, uv).rgb;
float curb = 1.0 - smoothstep(0.26, 0.3, d);
if(curb > 0.0) {
vec3 cc = texture(tCurb, p / 1.1 + 0.3).rgb * 0.97; // (textures r2) granite curb top + 2.4 m joints
float cAl = (min(p.x - vRect.x, vRect.z - p.x) < min(p.y - vRect.y, vRect.w - p.y)) ? p.y : p.x;
cc *= 1.0 - curbJ(cAl, max(fwP.x, fwP.y));
c = mix(c, cc, curb);
n = mix(n, vec3(0.5, 0.5, 0.7), curb);
}
c *= 0.93 + 0.14 * nz.r; // subtle slab-to-slab variation (refs/road/road_2_sidewalk)
c *= 1.0 - 0.12 * (1.0 - smoothstep(0.0, 1.2, abs(d - 0.3))) * nz.b;
// (foundation r13) critic: 'streets from altitude read as blank white stripes', 'riverfront edges are ruler-
// straight white strips'. Aerial LOD tone: grime, tree pits, street furniture and kerb shadows aggregate, so from
// the rooftops / the air the sidewalks sit a step darker (no change within 150 m). Promenade / plaza fill pieces
// (vRect unset) are laid in warmer, darker hex / brick pavers like the East River + Hudson esplanades.
{
float adist = length(vWP - cameraPosition);
c *= mix(1.0, 0.78, smoothstep(150.0, 900.0, adist));
if(vRect.x < - 5e4) {
vec2 hp = p / vec2(0.9, 0.78);
float row = floor(hp.y), cu = fract(hp.x + 0.5 * mod(row, 2.0)), cv = fract(hp.y);
float jn = 1.0 - smoothstep(0.0, 0.07, min(min(cu, 1.0 - cu), min(cv, 1.0 - cv)));
float fwp = clamp(fwidth(hp.x) * 2.0, 0.0, 1.0);
c *= vec3(0.86, 0.82, 0.77) * (1.0 - 0.18 * jn * (1.0 - fwp));
c *= mix(1.0, 0.9, smoothstep(120.0, 600.0, adist));
}
}
sR = mix(n.b, 1.0, smoothstep(300.0, 1100.0, length(vWP - cameraPosition))); // (r13) matte from afar (no grazing glare strips)
vec2 nxy = n.rg * 2.0 - 1.0;
sN = normalize(vec3(nxy, sqrt(max(0.0, 1.0 - dot(nxy, nxy)))));
walkColor = c;
}
// @section fragmentMapWalkingSurface
vec3 walkColor;
walk(walkColor);
diffuseColor.rgb = walkColor;
// @section fragmentRoughnessWalkingSurface
float roughnessFactor = sR;
// @section fragmentNormalMapsByWorldNormal
if(vWN.y > 0.5) {
vec3 nw = normalize(vec3(sN.x, sN.z, sN.y));
normal = normalize((viewMatrix * vec4(nw, 0.0)).xyz);
}
// @section vertexCommonDistantGrass
#include <common>
out vec3 vWP;
// @section vertexFogVertexDistantGrass
#include <fog_vertex>
vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;
// @section fragmentCommonGrassSurface
#include <common>
uniform sampler2D tCol;
uniform sampler2D tNoise;
uniform float uGrassDetailDist;
in vec3 vWP;
uniform vec4 uMd[__SHADER_INJECT_0__];
uniform float uMa[__SHADER_INJECT_1__];
uniform vec4 uPw[__SHADER_INJECT_2__];
uniform float uPa[__SHADER_INJECT_3__];
uniform vec4 uPh[__SHADER_INJECT_4__];
uniform float uPq[__SHADER_INJECT_5__];
float pondD(vec2 p, vec4 e, float a, vec4 h, float wq) { // same outline function as layout.ts PARK_WATER
vec2 d = p - e.xy;
float c = cos(a), s = sin(a);
vec2 q = vec2((d.x * c - d.y * s) / e.z, (d.x * s + d.y * c) / e.w);
float t = atan(q.y, q.x);
float k = 1.0 + 0.08 * sin(t * 3.0 + e.x) + 0.05 * sin(t * 5.0 + e.y * 0.1) + h.x * sin(t * 2.0 + 0.7) + h.y * sin(t * 3.0 + 2.1) + h.z * cos(t * 4.0) + h.w * sin(t * 5.0 + 4.2) + wq * (sin(t * 7.0 + e.x * 0.05) + 0.7 * sin(t * 11.0 + e.y * 0.03) + 0.45 * sin(t * 17.0 + 1.9)); // (round 7)
return length(q) / k;
}
float pkFld(vec2 p, float f, float ph) { // (park r3) = trees.ts fld(): open-woodland field
return 0.5 + 0.5 * (0.55 * sin(p.x * f + ph) * cos(p.y * f * 0.83 - ph * 1.7) + 0.3 * sin((p.x * 0.6 - p.y * 0.8) * f * 2.1 + ph * 2.3) + 0.15 * sin((p.x * 0.9 + p.y * 0.4) * f * 4.3 + ph * 0.7));
}
float ellD(vec2 p, vec4 e, float a, float w1, float w2, float ph2) {
vec2 d = p - e.xy;
float c = cos(a), s = sin(a);
vec2 q = vec2((d.x * c - d.y * s) / e.z, (d.x * s + d.y * c) / e.w);
float ang = atan(q.y, q.x);
return length(q) / (1.0 + w1 * sin(ang * 3.0 + e.x) + w2 * sin(ang * 5.0 + e.y * ph2));
}
// @section fragmentMapGrassSurface
{
vec2 p = vWP.xz;
#if GRASS_DETAIL_LEVEL == 0
vec3 c = texture(tCol, p / 12.0).rgb;
vec3 nz = texture(tNoise, p / 80.0).rgb;
c *= (0.92 + 0.16 * nz.r) * vec3(0.88, 0.9, 0.82);
diffuseColor.rgb = c;
#else
if(length(vWP - cameraPosition) < uGrassDetailDist) {
vec3 c = texture(tCol, p / 6.0).rgb;
vec3 c2 = texture(tCol, p.yx / 23.0).rgb;
vec3 nz = texture(tNoise, p / 140.0).rgb, nz2 = texture(tNoise, p / 37.0).rgb;
c = mix(c, c2, 0.4) * (0.78 + 0.4 * nz.r);
c = mix(c, vec3(dot(c, vec3(0.3, 0.55, 0.15))), 0.32) * vec3(0.84, 0.84, 0.74); // muted, late-season
// meadows: mowed, lighter, a faint mowing stripe; outside: shaded woodland floor (leaf litter, moss) under groves
float m = 9.0;
for(int i = 0;
i < __SHADER_INJECT_0__;
i ++) m = min(m, ellD(p, uMd[i], uMa[i], 0.09, 0.06, 1.0));
float grove = sin(p.x * 0.021 + 1.3) * cos(p.y * 0.017 - 0.7) + 0.6 * sin(p.x * 0.047 - p.y * 0.031 + 2.1) + 0.35 * sin(p.y * 0.083 + p.x * 0.012);
grove = clamp(0.75 + grove * 0.45, 0.0, 1.0) * smoothstep(1.0, 1.3, m); // (round 6: +0.3, matches the denser fill canopy)
grove *= 1.0 - 0.8 * smoothstep(0.56, 0.7, pkFld(p, 1.0 / 55.0, 4.1)); // (park r3) open woodland: lawn between scattered trees
vec3 floorC = mix(vec3(0.19, 0.18, 0.09), vec3(0.26, 0.2, 0.11), nz2.g) * (0.8 + 0.25 * nz.b); // (park r9) was near-black (0.1,0.1,0.05): read as holes on the Great Lawn where no crowns cover it
c = mix(c, floorC, smoothstep(0.25, 0.65, grove) * __SHADER_INJECT_1__);
float meadow = __SHADER_INJECT_2__;
{ // (park r3) mowing stripes (alternating direction per ~60 m patch) + brown wear patches on the lawns
float dirSel = step(0.5, texture(tNoise, p / 900.0).g);
float sf = fract(mix(p.x, p.y, dirSel) / 6.5 + 0.1 * nz.r);
float strp = smoothstep(0.42, 0.5, sf) * (1.0 - smoothstep(0.92, 1.0, sf)); // (park r10) critic r9: 'no mowing stripes' -> stronger, soft-edged
c = mix(c, c * vec3(1.1, 1.14, 1.0) * (0.88 + 0.22 * strp), meadow);
float wear = smoothstep(0.6, 0.78, texture(tNoise, p / 29.0 + vec2(0.33, 0.77)).r) * smoothstep(0.35, 0.65, nz2.b);
c = mix(c, vec3(0.3, 0.26, 0.17) * (0.85 + 0.3 * nz2.g), wear * 0.55 * meadow);
}
// (round 10) lawn texture at mid range (critic: 'large flat blurry green'): trodden desire lines, clover / weed
// patches, dry spots and soft mower-turn arcs, all low-contrast
{
vec3 q1 = texture(tNoise, p / 11.0 + vec2(0.19, 0.53)).rgb, q2 = texture(tNoise, p / 3.3 + vec2(0.61, 0.07)).rgb;
float clover = smoothstep(0.55, 0.75, q1.r) * 0.5 + smoothstep(0.6, 0.8, q2.g) * 0.25;
c = mix(c, c * vec3(0.8, 0.9, 0.78), clover * meadow);
float dry = smoothstep(0.62, 0.8, q1.b) * smoothstep(0.4, 0.7, nz2.r);
c = mix(c, vec3(0.34, 0.31, 0.2) * (0.8 + 0.3 * q2.r), dry * 0.45 * meadow);
float trod = 1.0 - smoothstep(0.0, 1.2, abs(sin(p.x * 0.011 + p.y * 0.019 + 3.0 * nz.g) * 60.0));
c = mix(c, vec3(0.3, 0.28, 0.2), trod * 0.35 * meadow * smoothstep(0.45, 0.6, nz.b));
c *= 0.93 + 0.14 * q2.b;
}
// worn / leaf-covered patches (fewer on the lawns)
c = mix(c, vec3(0.4, 0.28, 0.13), smoothstep(0.58, 0.82, nz.g) * 0.5 * (1.0 - meadow));
// (round 5) broad tonal variation: dry straw-olive swathes vs lush darker grass (never one flat green plane)
vec3 nzL = texture(tNoise, p / 420.0 + vec2(0.37, 0.11)).rgb;
c *= mix(vec3(0.86, 0.9, 0.84), vec3(1.12, 1.04, 0.86), smoothstep(0.3, 0.75, nzL.r));
c *= 0.85 + 0.3 * smoothstep(0.2, 0.8, nzL.b);
// (round 5) Manhattan-schist outcrops: grey-brown rock shelves with dark joints, at meadow edges and in the woods
float ro = texture(tNoise, p / 55.0 + vec2(0.71, 0.29)).g * 0.7 + texture(tNoise, p / 17.0).b * 0.3;
float rock = smoothstep(0.66, 0.7, ro) * smoothstep(0.95, 1.25, m) * __SHADER_INJECT_3__;
vec3 rc = mix(vec3(0.3, 0.29, 0.27), vec3(0.44, 0.42, 0.39), nz2.r) * (0.8 + 0.3 * texture(tNoise, p / 3.0).r);
rc *= 1.0 - 0.45 * smoothstep(0.55, 0.62, fract((p.x * 0.8 + p.y * 0.6) / 2.3 + nz2.g)); // foliation joints
c = mix(c, rc, rock * 0.9);
// ball-field infields (skinned fan-shaped infields with a grass diamond) on the Great-Lawn / North-Meadow-like meadows
for(int i = 1;
i < __SHADER_INJECT_4__;
i ++) {
for(int k = 0;
k < 4;
k ++) {
if(i == 2 && (k == 1 || k == 2)) continue;                 // (round 4) fewer, varied fields: 4 + 2
float fk = float(i * 4 + k);
vec2 hp = uMd[i].xy + vec2(float(k & 1) * 2.0 - 1.0, float(k >> 1) * 2.0 - 1.0) * uMd[i].zw * vec2(0.55 + 0.08 * sin(fk * 2.3), 0.5 + 0.08 * cos(fk * 1.7));
vec2 dir = normalize(uMd[i].xy - hp);                      // outfield points toward the meadow centre
float ra = 0.35 * sin(fk * 3.1 + 0.4);
dir = vec2(dir.x * cos(ra) - dir.y * sin(ra), dir.x * sin(ra) + dir.y * cos(ra));
float R = 22.0 + 5.0 * fract(fk * 0.618);
vec2 d = p - hp;
float r = length(d), ca = dot(d, dir) / max(r, 1e-3);
float fan = (1.0 - smoothstep(R, R + 1.5, r)) * smoothstep(0.66, 0.72, ca);
vec2 q = vec2(dot(d, dir), dot(d, vec2(- dir.y, dir.x)));  // along / across the foul-line bisector
vec2 qd = vec2(q.x + q.y, q.x - q.y) * 0.7071;             // diamond axes (foul lines)
float gs = R * 0.64;
float grassSq = step(1.5, qd.x) * step(1.5, qd.y) * step(qd.x, gs) * step(qd.y, gs);
float sand = max(fan * (1.0 - grassSq), 1.0 - smoothstep(2.5, 3.2, length(q - vec2(R * 0.48, 0.0)))); // + pitcher's mound
// (park r3) worn infield: darker scuffed base paths / home circle, raked lighter centre, patchy edge into the turf
float bp = max(1.0 - smoothstep(0.8, 1.6, abs(qd.x - 1.0)), 1.0 - smoothstep(0.8, 1.6, abs(qd.y - 1.0))) * step(qd.x, gs + 2.0) * step(qd.y, gs + 2.0) * step(- 1.0, min(qd.x, qd.y));
vec3 dirt = mix(vec3(0.38, 0.27, 0.18), vec3(0.46, 0.34, 0.23), texture(tNoise, p / 4.0).r) * (0.8 + 0.25 * nz2.r); // (park r7) darker compacted clay (critic r6: 'pale decals')
dirt = mix(dirt, vec3(0.27, 0.2, 0.14), max(bp * fan, 1.0 - smoothstep(3.0, 4.5, r)) * 0.65);
sand *= smoothstep(0.25, 0.6, texture(tNoise, p / 2.2).g + smoothstep(R - 3.0, R - 0.5, r) * - 0.5 + 0.45);
// (park r10) critic r9: 'ballfields are flat decals': a dark lip where the turf edge stands over the skinned
// infield + a worn, lighter outfield ring in front of it (depth / wear instead of a pasted shape)
float lip = (1.0 - smoothstep(0.0, 0.9, abs(r - R - 0.4))) * smoothstep(0.64, 0.72, ca);
float worn = (1.0 - smoothstep(R, R + 9.0, r)) * smoothstep(R - 0.5, R + 1.5, r) * smoothstep(0.55, 0.75, ca);
c = mix(c, c * vec3(1.08, 1.03, 0.86), worn * 0.6);
c *= 1.0 - 0.3 * lip;
c = mix(c, dirt, clamp(sand, 0.0, 1.0) * (0.78 + 0.16 * fract(fk * 0.37))); // (round 6: worn, not stamped; park r2: sand infields read from the air, refs 08 / 09)
}
}
// pond banks: mud / wet stone ring, then damp dark grass
float pd = 9.0;
for(int i = 0;
i < __SHADER_INJECT_5__;
i ++) pd = min(pd, (pondD(p, uPw[i], uPa[i], uPh[i], uPq[i]) - 1.0) * max(uPw[i].z, uPw[i].w));
float bank = __SHADER_INJECT_6__;
vec3 mud = mix(vec3(0.2, 0.17, 0.13), vec3(0.34, 0.32, 0.29), step(0.62, nz2.r)); // mud with stones
c = mix(c * (1.0 - 0.35 * (1.0 - smoothstep(3.0, 9.0, pd))), mud, bank);
// (round 5) reeds / shrubby shore vegetation: a patchy dark band a few metres back from the waterline
float reed = (1.0 - smoothstep(4.0, 11.0 + 5.0 * nz.g, pd)) * smoothstep(1.5, 3.5, pd) * smoothstep(0.35, 0.6, nz2.b);
c = mix(c, vec3(0.09, 0.1, 0.045) * (0.8 + 0.4 * nz2.g), reed * __SHADER_INJECT_7__);
// (round 6) the Reservoir's running track: a cinder / gravel loop ~5-9 m outside the bank, with its iron fence line
{
float rd = (pondD(p, uPw[3], uPa[3], uPh[3], uPq[3]) - 1.0) * max(uPw[3].z, uPw[3].w);
float eg = 0.9 * (texture(tNoise, p / 7.0).r - 0.5);  // (park r9) ragged grass edges, not a clean ruled band
float trk = smoothstep(4.2 + eg, 5.2 + eg, rd) * (1.0 - smoothstep(8.2 - eg, 9.2 - eg, rd));
vec3 cin = mix(vec3(0.31, 0.26, 0.21), vec3(0.37, 0.31, 0.25), texture(tNoise, p / 1.7).g) * (0.82 + 0.26 * nz2.r); // darker cinder (critic r8: 'clean white band')
cin *= 1.0 - 0.14 * (1.0 - smoothstep(0.3, 1.1, abs(rd - 6.7 + 0.4 * nz.g)));      // worn, compacted running line
cin = mix(cin, vec3(0.2, 0.18, 0.15), smoothstep(0.68, 0.8, texture(tNoise, p / 13.0 + vec2(0.4, 0.1)).b) * 0.6); // damp patches
c = mix(c, cin, trk * __SHADER_INJECT_8__);
c = mix(c, vec3(0.1, 0.1, 0.09), (1.0 - smoothstep(0.2, 0.7, abs(rd - 3.6))) * __SHADER_INJECT_9__);
}
diffuseColor.rgb = c;
} else {
vec3 c = texture(tCol, p / 12.0).rgb;
vec3 nz = texture(tNoise, p / 80.0).rgb;
c *= (0.92 + 0.16 * nz.r) * vec3(0.88, 0.9, 0.82);
diffuseColor.rgb = c;
}
#endif
}
// @section fragmentNormalMapsGrassSurface
#include <normal_fragment_maps>
#if GRASS_DETAIL_LEVEL >= 1
if(length(vWP - cameraPosition) < uGrassDetailDist) {
{
vec2 p = vWP.xz;
float e = 3.0;
#define GH(q) (texture(tNoise, (q) / 160.0 + vec2(0.27, 0.61)).g * 1.5 + texture(tNoise, (q) / 45.0 + vec2(0.83, 0.13)).r * 0.6)
float dx = (GH(p + vec2(e, 0.0)) - GH(p - vec2(e, 0.0))) / (2.0 * e), dz = (GH(p + vec2(0.0, e)) - GH(p - vec2(0.0, e))) / (2.0 * e);
#undef GH
vec3 nW = normalize(vec3(- dx * 6.0, 1.0, - dz * 6.0));
normal = normalize(mix(normal, (viewMatrix * vec4(nW, 0.0)).xyz, 0.85));
}
}
#endif
// @section vertexCommonByMountainWorldPosition
#include <common>
out vec3 vWPm;
// @section vertexFogVertexByMountainWorldPosition
#include <fog_vertex>
vWPm = (modelMatrix * vec4(transformed, 1.0)).xyz;
// @section fragmentCommonByMountainWorldPosition
#include <common>
uniform sampler2D tNoiseW;
in vec3 vWPm;
// @section fragmentMapByMountainWorldPosition
#include <map_fragment>
{
vec3 w1 = texture(tNoiseW, vWPm.xz / 2.3).rgb, w2 = texture(tNoiseW, vWPm.xz / 0.37).rgb;
float wear = smoothstep(0.35, 0.8, w1.g * 0.7 + w2.r * 0.5);
diffuseColor.a *= 1.0 - 0.45 * wear; // (street r6: 0.25 -> 0.45) critic: 'lane markings perfect and crisp'
float chip = smoothstep(0.58, 0.72, texture(tNoiseW, vWPm.xz / 0.11 + 0.37).g);   // chipped thermoplastic
diffuseColor.a *= 1.0 - 0.6 * chip * (0.4 + 0.6 * wear);
diffuseColor.rgb *= (0.86 + 0.1 * w2.b) * vec3(1.0, 0.985, 0.95); // grimy, slightly yellowed paint
// (street r9) critic: 'crosswalks crisp painted stripes with no wear': tyre-grime streaks along both travel
// axes (thin in the cross direction, long along it), broad scuffed blotches where the paint is nearly gone
float skZ = texture(tNoiseW, vec2(vWPm.x / 0.5, vWPm.z / 14.0) + 0.21).g, skX = texture(tNoiseW, vec2(vWPm.x / 14.0, vWPm.z / 0.5) + 0.63).b;
diffuseColor.rgb *= 1.0 - 0.3 * smoothstep(0.45, 0.8, max(skZ, skX));
diffuseColor.a *= 1.0 - 0.5 * smoothstep(0.55, 0.75, texture(tNoiseW, vWPm.xz / 5.3 + 0.11).r);
}
// @section vertexCommonByPavementWorldPosition
#include <common>
out vec2 vPU;
out vec3 vPW;
// @section vertexUvVertex
#include <uv_vertex>
vPU = uv;
// @section vertexFogVertexByPavementWorldPosition
#include <fog_vertex>
vPW = (modelMatrix * vec4(transformed, 1.0)).xyz;
// @section fragmentCommonByPavementWorldPosition
#include <common>
uniform sampler2D tPN;
in vec2 vPU;
in vec3 vPW;
// @section fragmentMapByPavementUv
#include <map_fragment>
{
vec3 n = texture(tPN, vPW.xz / 9.0).rgb, n2 = texture(tPN, vPW.xz / 2.3).rgb;
float e = min(vPU.x, 1.0 - vPU.x);
float edge = smoothstep(0.02, 0.2 + 0.12 * n.r, e + 0.08 * (n2.g - 0.5));
diffuseColor.a *= edge;
diffuseColor.rgb *= mix(vec3(1.0), vec3(1.08, 1.0, 0.86), n.b) * (0.9 + 0.2 * n2.r);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.4, 0.38, 0.34) * (0.9 + 0.2 * n.r), 0.45);
} // park r2: paler walks read from the air (refs 08 / 09)
`,ke=`// water shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
out vec3 vWPw;
uniform mat4 uTexMat;
out vec4 vRefl;
// @section vertexFogVertex
#include <fog_vertex>
vWPw = (modelMatrix * vec4(transformed, 1.0)).xyz;
vRefl = uTexMat * vec4(vWPw, 1.0);
// @section fragmentCommon
#include <common>
uniform sampler2D tWN;
uniform sampler2D tWNoise;
uniform float uWTime;
in vec3 vWPw;
uniform sampler2D tRefl;
uniform float uReflOn;
in vec4 vRefl;
uniform sampler2D tShore;
uniform vec4 uShoreBox;
vec3 wN;
float wR;
float wDist;
float wSh = 1.0;
vec2 wDisp;
float wSlick;
float wShore;
float wNearS;
float wStreak;
vec2 wn(vec2 uv) {
return texture(tWN, uv).rg * 2.0 - 1.0;
}
vec3 river() {
vec2 p = vWPw.xz;
float dist = length(vWPw - cameraPosition);
wDist = dist;
float t = uWTime;
// broad structure: wind slicks (smooth bands) and current streaks along the rivers (z axis)
vec3 m1 = texture(tWNoise, p / 900.0 + vec2(0.0, t * 0.0015)).rgb;
vec3 m2 = texture(tWNoise, vec2(p.x / 260.0, p.y / 1400.0) + vec2(0.31, t * 0.004)).rgb;
float slick = smoothstep(0.52, 0.72, m1.g) * 0.8 + smoothstep(0.62, 0.8, m2.r) * 0.35;
// distance to the nearest shore (m, baked 8 m/px map): sheltered, silty water along the bulkheads
wShore = 400.0;
#ifdef HAS_SHORE
wShore = texture(tShore, (p - uShoreBox.xy) / uShoreBox.zw).r * 400.0;
#endif
float nearS = 1.0 - smoothstep(6.0, 70.0, wShore);
// cat's paws: gusts roughen large patches (they read as brighter / hazier sheen from the air)
vec3 m3 = texture(tWNoise, p / 520.0 + vec2(t * 0.003, - t * 0.002)).rgb;
float gust = smoothstep(0.45, 0.75, m3.b) * (1.0 - slick);
slick = clamp(slick + nearS * 0.35, 0.0, 1.0);
wSlick = slick;
wNearS = nearS;
// (round 5) wind rows / current streaks: long thin bands along the rivers (z) that break the sheet into
// brighter, rougher lines (the refs' rivers are never one uniform glassy surface)
float s1 = texture(tWNoise, vec2(p.x / 34.0, p.y / 520.0) + vec2(t * 0.0008, t * 0.003)).g;
float s2 = texture(tWNoise, vec2(p.x / 11.0 + p.y / 900.0, p.y / 260.0) + vec2(0.57, t * 0.005)).r;
float streak = smoothstep(0.58, 0.8, s1) * 0.7 + smoothstep(0.66, 0.86, s2) * 0.45;
streak *= (1.0 - 0.7 * nearS);
wStreak = streak;
// wave normals: chop (two directions) + swell, faded with distance and in slicks
// (atmosphere r2) the two broad layers are rotated off-axis and amplitude-modulated by the wind field, so their
// repeat does not read as a tiling ripple across the whole East River from the air
vec2 pr1 = mat2(0.829, - 0.559, 0.559, 0.829) * p, pr2 = mat2(0.438, 0.899, - 0.899, 0.438) * p;
float amp = 0.55 + 0.9 * m3.g;
vec2 n = wn(p / 9.0 + vec2(t * 0.021, t * 0.013)) * 0.55 + wn(vec2(- p.y, p.x) / 14.0 + vec2(t * - 0.012, t * 0.017)) * 0.45 + wn(pr1 / 53.0 + vec2(t * 0.004, - t * 0.006)) * 0.7 * amp + wn(pr2 / 173.0 + vec2(- t * 0.002, t * 0.003)) * 0.5 * (1.5 - amp * 0.7);
float fade = mix(1.0, 0.45, smoothstep(60.0, 2500.0, dist));
n *= 0.34 * fade * (1.0 - 0.55 * slick) * (1.0 + 0.8 * gust + 0.6 * streak);
// (round 8) far-field wave groups: long swell / wind-row undulation that fades IN with distance, where the chop is
// sub-pixel -- the far river breaks into broad mottled sheen bands instead of one flat glossy plate
n += (wn(vec2(p.x / 380.0, p.y / 170.0) + vec2(t * 0.0012, - t * 0.002)) * 0.7 + wn(p / 95.0 + vec2(- t * 0.003, t * 0.002)) * 0.45) * 0.15 * smoothstep(300.0, 1800.0, dist) * (1.0 - 0.5 * slick);
wN = normalize(vec3(n.x, 1.0, n.y));
// mirror distortion: waves smear the reflection vertically (screen space), less in the slicks; (round 5) plus a
// mid-scale ripple field that does NOT fade with distance, so far reflections break into wobbly bands
vec2 rip = wn(vec2(p.x / 26.0, p.y / 7.0) + vec2(t * 0.011, - t * 0.019)) + 0.6 * wn(p / 61.0 + vec2(- t * 0.006, t * 0.009));
wDisp = n * (0.9 - 0.5 * slick) + rip * 0.09 * (1.0 - 0.5 * slick);
// roughness (round 5: ~0.1-0.3 like real wind-blown river water): calm slicks, rougher chop / gusts / streaks,
// far water rougher to integrate sub-pixel waves
wR = clamp(0.09 + 0.08 * (1.0 - slick) + 0.1 * gust + 0.07 * streak + 0.07 * smoothstep(300.0, 5000.0, dist), 0.07, 0.32);
// (round 8) far wind fields: broad rough / glassy patches that stay visible at 1-4 km (hazier vs mirror sheen)
wR = clamp(wR + (texture(tWNoise, p / 1500.0 + vec2(0.13, t * 0.0006)).g - 0.5) * 0.22 * smoothstep(400.0, 1500.0, dist), 0.06, 0.34);
#ifndef NO_SSR
wR = max(wR + 0.05, 0.13); // (atmosphere r2) ponds / reservoir: wind-ruffled, the cloud reflection is never a crisp cubemap
#endif
// body colour: deep muted green-grey, turbid variation; silty olive-brown along the shores, a little deeper /
// bluer mid-channel (depth), current streaks along the rivers
vec3 c = vec3(__SHADER_INJECT_0__);
c *= 0.85 + 0.3 * m1.r;
c = mix(c, vec3(0.07, 0.085, 0.075), smoothstep(0.4, 0.8, m2.b) * 0.5);
c = mix(c, vec3(0.06, 0.066, 0.055), nearS * 0.55);
c = mix(c, c * vec3(0.8, 0.9, 1.05), smoothstep(150.0, 400.0, wShore));
c *= 1.0 + 0.25 * streak;
// (round 7) wash line: a broken pale band of churned water / flotsam hugging bulkheads and pier edges, and a
// brown-olive silt plume a little further out (the rivers change colour toward every shore)
#ifdef HAS_SHORE
{
float fn = texture(tWNoise, p / 23.0 + vec2(t * 0.002, - t * 0.003)).g, fn2 = texture(tWNoise, p / 6.0 + vec2(- t * 0.004, t * 0.002)).b;
float wash = (1.0 - smoothstep(1.0, 9.0 + 6.0 * fn, wShore)) * smoothstep(0.35, 0.65, fn * 0.6 + fn2 * 0.6);
c = mix(c, vec3(0.2, 0.205, 0.19), wash * 0.55);
float silt = (1.0 - smoothstep(10.0, 120.0, wShore)) * (0.55 + 0.45 * fn);
c = mix(c, vec3(0.085, 0.08, 0.058), silt * 0.4);
}
#endif
return c;
}
// @section fragmentMap
diffuseColor.rgb = river();
// @section fragmentRoughness
float roughnessFactor = wR;
// @section fragmentNormalMaps
normal = normalize((viewMatrix * vec4(wN, 0.0)).xyz);
// @section fragmentLightsBegin
__SHADER_INJECT_0__
// (round 7) sun glitter: sparse sub-pixel facets on a finer, faster chop catch the sun (a sparkling glint path
// toward the sun instead of one smooth lobe); fades with distance into the broad specular sheen
#if ( NUM_DIR_LIGHTS > 0 )
{
vec2 gp = vWPw.xz;
vec2 gn = wn(gp / 2.3 + vec2(uWTime * 0.05, uWTime * 0.034)) + 0.8 * wn(vec2(- gp.y, gp.x) / 3.7 + vec2(- uWTime * 0.041, uWTime * 0.02));
vec3 nG = normalize(wN + vec3(gn.x, 0.0, gn.y) * 0.22 * (1.0 - 0.6 * wSlick));
vec3 nGv = normalize((viewMatrix * vec4(nG, 0.0)).xyz);
vec3 Hh = normalize(directLight.direction + geometryViewDir);
float gl = pow(clamp(dot(nGv, Hh), 0.0, 1.0), 700.0);
float spark = smoothstep(0.62, 0.9, texture(tWNoise, gp / 5.0 + vec2(uWTime * 0.02, 0.0)).r);
float gfade = 1.0 - smoothstep(900.0, 4000.0, wDist);
reflectedLight.directSpecular += directLight.color * gl * spark * gfade * 14.0 * wSh;
}
#endif
// @section fragmentLightsMaps
#include <lights_fragment_maps>
// (atmosphere r2) sky reflection: the env map's lowest ~6 deg hold a generic city band (for the towers' IBL);
// open water at grazing angles must mirror the horizon SKY instead (critic: 'flat grey sheet, no fresnel sky
// gradient'). Re-fetch the env with the reflection lifted above that band; the planar mirror adds the real
// skyline on top. Grazing view -> brighter, paler horizon sky; looking down -> deep body colour + zenith blue.
#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
{
vec3 rvW = transformDirectionByInverseViewMatrix(reflect(- geometryViewDir, normal), viewMatrix);
rvW.y = abs(rvW.y) * 0.8 + 0.1;
radiance = textureCubeUV(envMap, envMapRotation * normalize(rvW), material.roughness).rgb * envMapIntensity;
radiance *= mix(0.3, 1.0, ambData.bounce.w); // (night) the night sky mirror stays dim: dark water with the city's light streaks (critic r2: rivers brighter than the city)
}
#endif
if(uReflOn > 0.5 && vRefl.w > 0.0) {
vec2 ruv = vRefl.xy / vRefl.w;
// (round 4) ripple distortion that survives distance (sheared horizontally by the chop) + a vertical smear:
// real river reflections are stretched / broken toward the viewer, never a crisp mirror
vec2 d = vec2(wDisp.x * 0.7, wDisp.y * 1.6) * 0.22 / (1.0 + wDist * 0.00025);
float spread = (0.004 + 0.034 * wR) * (1.0 - 0.5 * wSlick);
float jit = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
vec4 pr = vec4(0.0);
for(int k = 0;
k < 8;
k ++) {
float o = (float(k) + jit) / 8.0 - 0.35;
// The reflection target has no mip chain; explicit LOD avoids undefined implicit derivatives inside this loop.
pr += textureLod(tRefl, ruv + d * (1.0 + 0.12 * float(k)) + vec2(o * spread * 0.25, o * spread), 0.0);
}
pr /= 8.0;
vec2 e = smoothstep(0.0, 0.03, ruv) * smoothstep(1.0, 0.97, ruv);
// the mirror render has no aerial perspective: haze it toward the sky radiance with distance (round 5: faster,
// so far reflections are soft ghosts, never a crisp second skyline)
vec3 mir = mix(pr.rgb, radiance, 0.28 + 0.52 * smoothstep(200.0, 3500.0, wDist));
// rough water (gusts / streaks) scatters the image: the mirror gives way to the blurred sky IBL
float mw = mix(0.7, 0.9, wSlick) * mix(1.0, 0.5, smoothstep(0.12, 0.3, wR)) * (1.0 - 0.3 * wNearS);
radiance = mix(radiance, mir, clamp(pr.a, 0.0, 1.0) * e.x * e.y * mw);
}
// a weaker sky mirror: the refs' rivers read as a deep grey-blue body, not a white sheet; wind rows catch a
// little more sheen
radiance *= (0.8 + 0.12 * wStreak); // (atmosphere r2) no far dimming: fresnel brightening toward the horizon
// (atmosphere r1) critic: 'river reads flat'. Wind fields modulate the sky sheen at every distance: glassy slicks
// mirror more of the (bright) sky, gust / ruffled patches scatter it into a duller, bluer grey -> visible large-
// scale mottling and streaks like the refs' Hudson / East River, instead of one even grey-blue sheet
radiance *= mix(0.82, 1.22, wSlick) * (1.0 + 0.18 * wStreak) * mix(1.0, 0.86, smoothstep(0.14, 0.3, wR));
// @section vertexCommonByWetSurfaceUv
#include <common>
out vec2 vWetUv;
// @section vertexUvVertex
#include <uv_vertex>
vWetUv = uv;
// @section fragmentCommonByWetSurfaceUv
#include <common>
uniform sampler2D tWetN;
in vec2 vWetUv;
// @section fragmentMapByWetSurfaceUv
{
float u = vWetUv.x, y = vWetUv.y;
vec3 nz = texture(tWetN, vec2(u / 9.0, 0.37)).rgb, nz2 = texture(tWetN, vec2(u / 2.1, y * 0.4 + 0.1)).rgb;
float top = 0.45 + 0.35 * nz.r + 0.15 * nz2.g;            // ragged high-water line
float a = 1.0 - smoothstep(top - 0.12, top + 0.04, y);
float algae = 1.0 - smoothstep(0.1, 0.35, y);              // green-black slime right at the water line
vec3 c = mix(vec3(0.07, 0.065, 0.055), vec3(0.04, 0.06, 0.035), algae);
c *= 0.8 + 0.4 * nz2.b;
// streaks running down from the high-water line
a = max(a, (1.0 - smoothstep(0.0, 0.9, y)) * smoothstep(0.62, 0.8, texture(tWetN, vec2(u / 0.9, 0.71)).r) * 0.6);
diffuseColor = vec4(c, a * 0.88);
}
`;function Ae(e,r,{body:i=[.06,.082,.09],shore:a=null,ssr:o=!1}={}){let s=new oe({color:16777215,roughness:.08,metalness:0,clearcoat:.45,clearcoatRoughness:.12});s.name=`CityRiver.TSL`;let c=C(0),u=m,d=I(u.x,u.z),f=l(ee.sub(u)),p=l(_),h=n(e.waterNrm,d.div(2.3).add(I(c.mul(.05),c.mul(.034)))).rg.mul(2).sub(I(1)),v=n(e.waterNrm,I(d.y.negate(),d.x).div(3.7).add(I(c.mul(-.041),c.mul(.02)))).rg.mul(2).sub(I(1)),y=h.add(v.mul(.8)),x=n(e.noise,d.div(31).add(I(c.mul(.01),0))).rgb,w=n(e.noise,d.div(390).add(I(c.mul(.003),c.mul(-.002)))).g,T=S(b(1).sub(g(f,p).abs().clamp(0,1)),4),E=j(i[0],i[1],i[2]).mul(b(.83).add(x.r.mul(.28))).mul(b(1).add(y.x.mul(.025)).add(y.y.mul(.018)));if(a?.texture&&a.box){let e=d.sub(I(a.box.x,a.box.y)).div(I(a.box.z,a.box.w)),r=n(a.texture,e).r.mul(400),i=b(1).sub(t(10,120,r)).mul(b(.55).add(x.g.mul(.45))),o=b(1).sub(t(1,70,r)).mul(t(.35,.65,x.g.mul(.6).add(x.b.mul(.6))));E=R(E,j(.085,.08,.058),i.mul(.4)),E=R(E,j(.2,.205,.19),o.mul(.55))}let D=R(j(.19,.24,.28),j(.43,.53,.61),t(0,.9,f.y.abs())),O=b(.24).add(w.mul(.22));return s.colorNode=R(E,D,T.mul(O)),s.roughnessNode=b(o?.13:.055).add(x.b.mul(.055)).add(b(1).sub(w).mul(.06)).clamp(.035,.24),s.clearcoatRoughnessNode=b(.05).add(b(1).sub(w).mul(.12)),s.emissiveNode=j(.025,.035,.04).mul(t(.7,.94,y.x.mul(.5).add(.5))).mul(.2),s.userData.uniforms={uWTime:c},s.userData.noSSR=!0,s}var je=`// trees shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
in vec2 aLeaf;
in vec3 aTintA;
in vec3 aTintB;
in float aSway;
out vec2 vLeaf;
out vec3 vTA;
out vec3 vTB;
uniform float uTime;
// @section vertexBeginVertex
#include <begin_vertex>
vLeaf = aLeaf;
vTA = aTintA;
vTB = aTintB;
#ifdef USE_INSTANCING
vec3 ip = instanceMatrix[3].xyz;
float ph = dot(ip, vec3(0.13, 0.0, 0.17));
// crown sway (slow) + leaf-spray flutter (fast, outer cards only)
transformed.xz += vec2(sin(uTime * 1.3 + ph + position.y * 0.4), cos(uTime * 1.1 + ph)) * 0.05 * position.y * 0.12;
if(aLeaf.x < 1.5) transformed += vec3(sin(uTime * 4.1 + dot(position, vec3(3.1, 1.7, 2.3))), sin(uTime * 3.3 + dot(position, vec3(1.9, 2.9, 1.3))), 0.0).xzy * 0.035 * aLeaf.x;
#endif
// @section fragmentCommon
#include <common>
in vec2 vLeaf;
in vec3 vTA;
in vec3 vTB;
uniform sampler2D uLeafN;
uniform vec4 uLeafFrame;
uniform float uLeafMipScale;
float leafIGN(vec2 p) {
return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}
// @section fragmentMap

bool core = vLeaf.x >= 1.5;
vec2 gx = dFdx(vMapUv), gy = dFdy(vMapUv);
vec2 texGx = gx * uLeafMipScale, texGy = gy * uLeafMipScale;
vec4 tx;
float cov = 1.0;
if(core) {
float tone = clamp(vLeaf.y, 0.0, 1.0);
tx = vec4(mix(0.66, 0.92, tone), 0.5, 0.25, 1.0);
} else {
tx = textureGrad(map, vMapUv, texGx, texGy);
}
float expo = core ? (vLeaf.x - 2.0) : vLeaf.x;
if(core) { // solid inner mass: a soft tint fill beneath the leaf cards
tx.r *= 0.85;
// The core is a softly shaded fill; atlas projection on its low-poly surface makes dark seams.
float facing = abs(dot(normalize(vNormal), normalize(vViewPosition)));
tx.a = facing > 0.45 ? 1.0 : cov;
}
if(! core) { // cards seen edge-on smear the texture: dissolve them (the neighbouring cards fill in)
vec3 fn = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));
tx.a *= smoothstep(0.12, 0.4, abs(dot(fn, normalize(vViewPosition))));
}
diffuseColor.a *= tx.a;
float twig = core ? 0.0 : step(0.97, tx.g);
float hsel = tx.g * 0.8 + vLeaf.y * 0.55 - 0.18;
vec3 leaf = mix(vTA, vTB, smoothstep(0.15, 0.85, hsel));
// Keep the packed atlas hue channel continuous. Wrapping it through fract()
// made contour-like brown bands across the leaf cards.
leaf *= 0.42 + 0.72 * tx.r;
// self-occlusion: deep / underside leaves and the back of each spray fall into shade
float occ = mix(0.4, 1.0, pow(clamp(expo, 0.0, 1.0), 1.4)) * mix(0.62, 1.0, tx.b);
if(core) occ = mix(0.24, 0.42, clamp(expo, 0.0, 1.0));
vec3 c = twig > 0.5 ? vec3(0.085, 0.06, 0.042) : leaf;
diffuseColor.rgb *= c * occ;
float leafExpo = core ? 0.0 : clamp(expo, 0.0, 1.0);

// @section fragmentAlphaTest

// alpha-to-coverage for the TAA pipeline: stochastic threshold per pixel/frame -> TAA resolves soft, density-
// preserving edges (distant sprays keep their filtered coverage instead of thinning out)
{
float n = fract(leafIGN(gl_FragCoord.xy + 17.0) + uLeafFrame.x * 2.618034);
if(diffuseColor.a < mix(0.2, 0.7, n)) discard;
diffuseColor.a = 1.0;
}
// @section fragmentNormalBegin
#include <normal_fragment_begin>
normal = normalize(vNormal);
{ // per-leaf atlas normals on cards; use the smooth geometry normal on the core
vec3 mapN = core ? vec3(0.0, 0.0, 1.0) : textureGrad(uLeafN, vMapUv, texGx, texGy).xyz * 2.0 - 1.0;
vec3 q0 = dFdx(- vViewPosition), q1 = dFdy(- vViewPosition);
vec3 q1p = cross(q1, normal), q0p = cross(normal, q0);
vec3 Tt = q1p * gx.x + q0p * gy.x, Bt = q1p * gx.y + q0p * gy.y;
float det = max(dot(Tt, Tt), dot(Bt, Bt));
float sc = det == 0.0 ? 0.0 : inversesqrt(det);
normal = normalize(normal * max(mapN.z, 0.3) + (Tt * mapN.x + Bt * mapN.y) * sc * 0.9);
}
// @section fragmentLightsBegin
vec3 leafSun = vec3(0.0);
vec3 leafSunDir = vec3(0.0, 1.0, 0.0);
__SHADER_INJECT_0__
// @section fragmentLightsEnd
#include <lights_fragment_end>
{ // thin-leaf translucency: sun shining through the outer leaves toward the camera, plus wrapped back-light
vec3 V = normalize(vViewPosition);
float thr = pow(clamp(dot(- V, leafSunDir), 0.0, 1.0), 4.0);
float back = clamp(dot(- normal, leafSunDir), 0.0, 1.0);
float k = leafExpo * leafExpo * (1.0 - twig);
reflectedLight.directDiffuse += diffuseColor.rgb * leafSun * RECIPROCAL_PI * k * (thr * 2.2 + back * 0.6);
}
// @section fragmentEmissive
#include <emissivemap_fragment>
totalEmissiveRadiance += diffuseColor.rgb * vec3(0.13, 0.1, 0.06) * ambData.vert.x * ambData.bounce.w; // skylight transmitted through the leaves (warm) (lighting2 r6: x vertical-fill gain, off at night: canopies in shade read dark)
// @section vertexCommonLeafCanopyData
#include <common>
in vec2 aLeaf;
in vec3 aTintA;
in vec3 aTintB;
out vec2 vLeaf;
out vec3 vTA;
out vec3 vTB;
out vec3 vCW;
out vec3 vCN;
out vec3 vCI;
// @section vertexBeginVertexLeafCanopyData
#include <begin_vertex>
vLeaf = aLeaf;
vTA = aTintA;
vTB = aTintB;
      #ifdef USE_INSTANCING
vCW = (modelMatrix * instanceMatrix * vec4(position, 1.0)).xyz;
vCN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
vCI = instanceMatrix[3].xyz;
      #else
vCW = (modelMatrix * vec4(position, 1.0)).xyz;
vCN = normal;
vCI = vec3(0.0);
      #endif
// @section fragmentCommonLeafCanopyData
#include <common>
in vec2 vLeaf;
in vec3 vTA;
in vec3 vTB;
in vec3 vCW;
in vec3 vCN;
in vec3 vCI;
uniform vec4 uLeafFrame;
float crClump;
float crIGN(vec2 p) {
return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}
float crH3(vec3 p) {
return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}
float crVn(vec3 p) {
vec3 i = floor(p), f = fract(p);
f = f * f * (3.0 - 2.0 * f);
return mix(mix(mix(crH3(i), crH3(i + vec3(1, 0, 0)), f.x), mix(crH3(i + vec3(0, 1, 0)), crH3(i + vec3(1, 1, 0)), f.x), f.y), mix(mix(crH3(i + vec3(0, 0, 1)), crH3(i + vec3(1, 0, 1)), f.x), mix(crH3(i + vec3(0, 1, 1)), crH3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
// @section fragmentMapByLeafTintB

// procedural foliage (no texture: a tiled leaf atlas reads as a checker from afar): clumps (~2.4 m) of
// sub-clumps (~0.7 m) of leaf speckle (~0.25 m), per-crown phase; dark gaps between the clumps
vec3 cp = vCW + vCI * 0.37;
float n1 = crVn(cp * 0.62), n2 = crVn(cp * 2.1 + 3.1), n3 = crVn(cp * 5.3 + 7.7); // (park r2) finer clumps
crClump = n1 * 0.65 + n2 * 0.35;
float cov = smoothstep(0.18, 0.55, crClump * 0.8 + n3 * 0.35);
float expo = clamp(vLeaf.x, 0.0, 1.0);
float hsel = 0.5 + (n2 - 0.5) * 0.7 + (vLeaf.y - 0.5) * 0.35 + (n1 - 0.5) * 0.4;
vec3 leaf = mix(vTA, vTB, smoothstep(0.1, 0.9, hsel));
leaf *= 0.74 + 0.34 * n3;
// Keep procedural color variation continuous; fract() here produced visible
// contour bands across close-up crowns.
vec3 c = mix(vTB * 0.42, leaf, smoothstep(0.3, 0.62, crClump + n3 * 0.22)); // (park r2) deeper gaps between clumps
c *= mix(vec3(1.0), vec3(1.12, 1.1, 0.8), smoothstep(0.62, 0.9, n2) * 0.6); // sunlit yellowing leaf tips
float occ = mix(0.3, 1.14, pow(expo, 1.25)) * mix(0.66, 1.1, smoothstep(0.3, 0.75, crClump)); // (park r4) crowns separate: dark skirts, sunlit domes
diffuseColor.rgb *= c * occ;
// silhouette: grazing faces keep only the leaf coverage -> ragged, see-through crown edges
float facing = abs(dot(normalize(vNormal), normalize(vViewPosition)));
float alpha = mix(cov * 1.25, 1.0, smoothstep(0.3, 0.72, facing));
{
float n = fract(crIGN(gl_FragCoord.xy + 5.0) + uLeafFrame.x * 2.618034);
if(alpha < mix(0.25, 0.75, n)) discard;
}

// @section fragmentNormalMaps
#include <normal_fragment_maps>
// Keep the authored crown mesh normals. Bumping them from derivatives of the
// clump noise drew contour-map lines across close-up foliage.
// @section fragmentEmissiveLeafLightTransmission
#include <emissivemap_fragment>
totalEmissiveRadiance += diffuseColor.rgb * vec3(0.11, 0.095, 0.06) * expo * expo * ambData.vert.x * ambData.bounce.w; // (lighting2 r6)
`,Me=`in float aKind;
in vec4 aTree;

uniform vec3 uSun;
uniform float uY;

out float vShadowRadius;
out float vTreeKind;
out float vShadowStrength;

void main() {
  vTreeKind = aKind;
  vShadowRadius = length(position.xz);

  vec3 worldPosition;
  float cameraDistance = length(aTree.xy - cameraPosition.xz);

  if(aKind < 0.5) {
    worldPosition = vec3(aTree.x + position.x * aTree.z * 1.15, uY, aTree.y + position.z * aTree.z * 1.15);
    vShadowStrength = 1.0;
  } else {
    float sunElevation = max(asin(clamp(uSun.y, 0.0, 1.0)), 0.2);
    vec2 shadowDirection = -normalize(uSun.xz + vec2(1e-4));
    vec2 shadowCenter = aTree.xy + shadowDirection * aTree.w / tan(sunElevation) * 0.92;
    float shadowStretch = min(1.0 / sin(sunElevation), 2.4);
    vec2 shadowOffset = position.x * shadowDirection * shadowStretch +
      position.z * vec2(-shadowDirection.y, shadowDirection.x);

    worldPosition = vec3(shadowCenter.x + shadowOffset.x * aTree.z * 0.95, uY + 0.004, shadowCenter.y + shadowOffset.y * aTree.z * 0.95);
    // Nearby trees already cast real cascaded shadow-map shadows.
    vShadowStrength = smoothstep(145.0, 180.0, cameraDistance) *
      smoothstep(0.02, 0.12, uSun.y);
  }

  gl_Position = projectionMatrix * viewMatrix * vec4(worldPosition, 1.0);
}
`,Ne=`in float vShadowRadius;
in float vTreeKind;
in float vShadowStrength;

out vec4 fragColor;

void main() {
  float shadowOpacity;
  if(vTreeKind < 0.5) {
    shadowOpacity = (1.0 - smoothstep(0.15, 1.0, vShadowRadius)) * 0.32;
  } else {
    shadowOpacity = (1.0 - smoothstep(0.45, 1.0, vShadowRadius)) *
      0.5 *
      vShadowStrength;
  }

  fragColor = vec4(vec3(1.0 - shadowOpacity), 1.0);
}
`,Pe=`// pool shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
__SHADER_INJECT_0__
// @section vertexProjectVertex
#include <project_vertex>
__SHADER_INJECT_0__
// @section fragmentCommon
#include <common>
__SHADER_INJECT_0__
// @section fragmentClipping
#include <clipping_planes_fragment>
__SHADER_INJECT_0__
// @section vertexCommonByDistanceFade
#include <common>
out float vDistFade;
// @section vertexProjectVertexByDistanceFade
#include <project_vertex>
        { vec3 wp = (modelMatrix * vec4(transformed, 1.0)).xyz; vDistFade = clamp((__SHADER_INJECT_0__ - length(wp.xz - cameraPosition.xz)) / __SHADER_INJECT_1__, 0.0, 1.0); }
// @section fragmentCommonByDistanceFade
#include <common>
      in float vDistFade; uniform vec4 uLodFrame;
      float dfIGN(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
// @section fragmentClippingByDistanceFade
#include <clipping_planes_fragment>
        if (vDistFade < 0.999 && fract(dfIGN(gl_FragCoord.xy + 7.0) + uLodFrame.x * 1.618034) >= vDistFade) discard;

// @section lodVertexDeclarations
in vec4 aLod; out float vLodIn; out float vLodOut;

// @section lodVertexFade

  #ifdef USE_INSTANCING
  {
    vec3 lodP = (modelMatrix * vec4(instanceMatrix[3].xyz, 1.0)).xyz;
    float lodD = length(lodP.xz - cameraPosition.xz);
    vLodIn = aLod.y > aLod.x ? smoothstep(aLod.x, aLod.y, lodD) : 1.0;
    vLodOut = aLod.w > aLod.z ? 1.0 - smoothstep(aLod.z, aLod.w, lodD) : 1.0;
  }
  #else
  vLodIn = 1.0; vLodOut = 1.0;
  #endif

// @section lodFragmentDeclarations
in float vLodIn; in float vLodOut; uniform vec4 uLodFrame;
  float lodIGN(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }

// @section lodFragmentFade
{
    float lodN = fract(lodIGN(gl_FragCoord.xy) + uLodFrame.x * 1.618034);
    if (lodN >= vLodOut || lodN < 1.0 - vLodIn) discard;
  }
`,Fe=`// treetrunk shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
in vec4 aBark;
out vec4 vBark;
out vec2 vBUv;
// @section vertexBeginVertex
#include <begin_vertex>
vBark = aBark;
vBUv = uv;
// @section fragmentCommon
#include <common>
uniform highp sampler2DArray tBarkC;
uniform highp sampler2DArray tBarkN;
in vec4 vBark;
in vec2 vBUv;
// @section fragmentMap

vec3 bkUv = vec3(vBUv, floor(vBark.x + 0.5));
vec4 bkC = texture(tBarkC, bkUv);
diffuseColor.rgb *= bkC.rgb * vBark.yzw;
// @section fragmentNormalMaps
#include <normal_fragment_maps>
{ // bark normal map in the derivative tangent frame (no tangent attribute)
vec3 mapN = texture(tBarkN, bkUv).xyz * 2.0 - 1.0;
mapN.xy *= 1.35;
vec3 q0 = dFdx(- vViewPosition), q1 = dFdy(- vViewPosition);
vec2 st0 = dFdx(vBUv), st1 = dFdy(vBUv);
vec3 q1p = cross(q1, normal), q0p = cross(normal, q0);
vec3 Tt = q1p * st0.x + q0p * st1.x, Bt = q1p * st0.y + q0p * st1.y;
float det = max(dot(Tt, Tt), dot(Bt, Bt));
float sc = det == 0.0 ? 0.0 : inversesqrt(det);
normal = normalize(Tt * (mapN.x * sc) + Bt * (mapN.y * sc) + normal * mapN.z);
}
`,Ie=`// park shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
out vec2 vGU; in float aGV; out float vGV;
// @section vertexUvVertex
#include <uv_vertex>
vGU = uv; vGV = aGV;
// @section fragmentCommon
#include <common>
      in vec2 vGU; in float vGV; float gH(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
// @section fragmentMap

        // (park r6) critic r5: 'solar-panel grid textures'. Pale frosted panes (ref 10) in a finer, thinner mullion grid
        // (park r8) per-skylight family + pitch (vGV): no two neighbouring skylights share a look
        vec2 pitch = vGV < 0.33 ? vec2(1.6, 1.1) : (vGV < 0.66 ? vec2(2.4, 1.5) : vec2(1.2, 2.2));
        vec2 gc = vGU / pitch, gf = fract(gc), gi = floor(gc);
        vec2 fw = fwidth(gc) * 1.2;
        vec2 bar = vec2(0.03, 0.045);
        float fr = 1.0 - (smoothstep(bar.x, bar.x + fw.x, gf.x) * smoothstep(bar.x, bar.x + fw.x, 1.0 - gf.x)
                        * smoothstep(bar.y, bar.y + fw.y, gf.y) * smoothstep(bar.y, bar.y + fw.y, 1.0 - gf.y));
        float h = gH(gi), h2 = gH(gi + 17.3);
        vec3 pane = mix(vec3(0.25, 0.29, 0.33), vec3(0.32, 0.35, 0.38), step(0.8, h)) /* (park r9) critic r8: 'bright blue-white skylights look pasted on' */ * (0.92 + 0.1 * h2); // (park r8) less pane-to-pane checker
        float fam = fract(vGV * 7.13);
        if (fam < 0.34) pane = mix(vec3(0.16, 0.2, 0.25), vec3(0.24, 0.28, 0.32), step(0.85, h)) * (0.9 + 0.2 * h2);   // dark reflective
        else if (fam < 0.58) pane = mix(vec3(0.36, 0.38, 0.37), vec3(0.44, 0.45, 0.42), step(0.75, h)) * (0.9 + 0.12 * h2); // milky, weathered
        pane *= 0.82 + 0.3 * smoothstep(0.0, 1.0, fract(vGU.x * 0.021 + vGV * 3.0)) ; // broad grime / reflection gradient across the skylight
        pane *= 1.0 - 0.18 * smoothstep(0.3, 1.0, fract(vGU.y * 0.07 + h * 0.3));   // dirt washes down the panes
        { // (park r10) critic r9: 'add dirt'. Blotchy soot / bird-lime / leaf-litter grime per pane cluster, darker in the
          // bottom corners where rain water pools against the bars
          float gd = gH(floor(vGU / 5.0) + vGV * 31.0), gd2 = gH(gi * 0.5 + 3.7);
          pane *= 1.0 - 0.28 * smoothstep(0.55, 0.95, gd * 0.6 + gd2 * 0.5);
          pane *= 1.0 - 0.22 * (1.0 - smoothstep(0.0, 0.22, gf.y)) * (0.5 + 0.5 * h2);
          pane = mix(pane, vec3(0.2, 0.18, 0.14), 0.18 * step(0.9, gd2));
        }
        diffuseColor.rgb = mix(pane, vec3(0.3, 0.31, 0.32), fr * 0.6);
        float gRough = mix(mix(0.36, 0.5, step(0.8, h)), 0.6, fr);
        if (fam < 0.34) gRough = mix(0.5, 0.6, fr); else if (fam < 0.58) gRough = mix(0.72, 0.8, fr);   // (park r8) dark = matte wired glass, milky = frosted
      
// @section fragmentRoughness
#include <roughnessmap_fragment>
roughnessFactor = gRough;
// @section fragmentEmissive
#include <emissivemap_fragment>
totalEmissiveRadiance += vec3(0.018, 0.017, 0.015) * (1.0 - fr) * step(h2, 0.7);
// @section fragmentMapByCopingUv
#include <map_fragment>
        { float blk = fract(vCopUV.y / 1.8); float j = smoothstep(0.0, 0.04, blk) * smoothstep(1.0, 0.96, blk);
          float h = fract(sin(floor(vCopUV.y / 1.8) * 91.7) * 4375.5);
          diffuseColor.rgb *= (0.55 + 0.45 * j) * (0.85 + 0.25 * h) * mix(0.8, 1.0, smoothstep(0.0, 0.25, vCopUV.x)); }
// @section fragmentCommonByCopingUv
#include <common>
in vec2 vCopUV;
// @section vertexCommonByCopingUv
#include <common>
out vec2 vCopUV;
// @section vertexUvVertexByCopingUv
#include <uv_vertex>
vCopUV = uv;
// @section vertexCommonByFountainUv
#include <common>
out vec2 vFU;
// @section vertexUvVertexByFountainUv
#include <uv_vertex>
vFU = uv;
// @section fragmentCommonByFountainUv
#include <common>
in vec2 vFU;
// @section fragmentAlphaTest

        { vec2 q = vec2(vFU.x + vFU.y, vFU.x - vFU.y) / 0.06; vec2 f = abs(fract(q) - 0.5); float w = min(f.x, f.y);
          vec2 fw = fwidth(q); float cov = 1.0 - smoothstep(0.06, 0.06 + max(fw.x, fw.y), w);
          float far = smoothstep(0.15, 0.6, max(fw.x, fw.y));
          diffuseColor.a = mix(cov, 0.42, far);
          float rail = step(abs(vFU.y - 0.03), 0.03) + step(abs(vFU.y - floor(vFU.y / 5.0 + 0.5) * 5.0), 0.04);
          diffuseColor.a = max(diffuseColor.a, min(rail, 1.0)); if (diffuseColor.a < 0.02) discard; }
        #include <alphatest_fragment>
// @section vertexCommonByHexWorldPosition
#include <common>
out vec2 vHexW;
// @section vertexBeginVertex
#include <begin_vertex>
vHexW = (modelMatrix * vec4(position, 1.0)).xz;
// @section fragmentCommonByHexWorldPosition
#include <common>
      in vec2 vHexW;
      float hxH(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
// @section fragmentMapByHexWorldPosition
#include <map_fragment>
      { vec2 p = vHexW / 0.23; // hexagon cells (~0.4 m across)
        vec2 r = vec2(1.0, 1.7320508), h = r * 0.5;
        vec2 a = mod(p, r) - h, b = mod(p - h, r) - h;
        vec2 g = dot(a, a) < dot(b, b) ? a : b;
        vec2 id = p - g;
        vec2 q = abs(g); float edge = 0.5 - max(dot(q, normalize(r)), q.x);
        float fw = fwidth(p.x) * 1.2;
        float mortar = 1.0 - smoothstep(0.02, 0.02 + fw, edge);
        float far = smoothstep(0.08, 0.35, fw);
        float tone = 0.86 + 0.2 * hxH(floor(id * 10.0 + 0.5));
        float gr = 0.9 + 0.1 * sin(vHexW.x * 0.37 + vHexW.y * 0.21) * sin(vHexW.y * 0.13);
        diffuseColor.rgb *= mix(tone * mix(1.0, 0.55, mortar), 0.9, far) * gr; }
// @section vertexCommonByWalkwayWorldPosition
#include <common>
out vec2 vDW;
// @section vertexBeginVertexByWalkwayWorldPosition
#include <begin_vertex>
vDW = (modelMatrix * vec4(position, 1.0)).xz;
// @section fragmentCommonByWalkwayWorldPosition
#include <common>
        in vec2 vDW;
        float dH(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float dN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(dH(i), dH(i + vec2(1, 0)), f.x), mix(dH(i + vec2(0, 1)), dH(i + vec2(1, 1)), f.x), f.y); }
// @section fragmentMapByWalkwayWorldPosition
#include <map_fragment>
        { float n = dN(vDW * 0.35) * 0.6 + dN(vDW * 1.7) * 0.4;
          diffuseColor.rgb *= 0.82 + 0.3 * n;                                  // patched / sealed asphalt
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.2, 0.2, 0.19), smoothstep(0.72, 0.8, dN(vDW * 0.12 + 3.0)) * 0.5); }
`,Le=`in float aT;

out float vT;
out vec3 vW;

#include <fog_pars_vertex>

void main() {
  vT = aT;

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vW = worldPosition.xyz;

  vec4 viewPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * viewPosition;

  #include <fog_vertex>
}
`,Re=`in float vT;
in vec3 vW;

uniform float uTime;
out vec4 fragColor;

#include <fog_pars_fragment>

float hash2D(vec2 position) {
  return fract(sin(dot(position, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise(vec2 position) {
  vec2 gridCell = floor(position);
  vec2 cellBlend = fract(position);
  cellBlend = cellBlend * cellBlend * (3.0 - 2.0 * cellBlend);

  return mix(mix(hash2D(gridCell), hash2D(gridCell + vec2(1.0, 0.0)), cellBlend.x), mix(hash2D(gridCell + vec2(0.0, 1.0)), hash2D(gridCell + vec2(1.0, 1.0)), cellBlend.x), cellBlend.y);
}

void main() {
  vec3 viewDirection = normalize(cameraPosition - vW);
  float grazingAngle = 1.0 - clamp(viewDirection.y, 0.0, 1.0);
  float shorelineNoise = valueNoise(vW.xz * 0.18) * 0.6 + valueNoise(vW.xz * 0.7) * 0.4;

  // The reflected tree line has a bumpy inner edge and extends farther at grazing angles.
  float treeCrowns = valueNoise(vec2(vW.x + vW.z, vW.z - vW.x) * 0.14) * 0.6 +
    valueNoise(vW.xz * 0.45) * 0.4;
  float reflectionReach = mix(0.6, 0.95, grazingAngle) * (0.65 + 0.55 * treeCrowns);
  float shorelinePosition = clamp(vT + (shorelineNoise - 0.5) * 0.18, 0.0, 1.0);
  float treeReflectionBand = 1.0 - smoothstep(reflectionReach - 0.12, reflectionReach + 0.05, shorelinePosition);

  // Wind adds sky-reflecting patches and fine streaks to the water surface.
  vec2 windDirection = vec2(0.8, 0.6);
  vec2 windPosition = vec2(dot(vW.xz, windDirection), dot(vW.xz, vec2(-windDirection.y, windDirection.x)));
  float windPatches = smoothstep(0.45, 0.8, valueNoise(windPosition * vec2(0.02, 0.035) + uTime * 0.01) * 0.7 +
    valueNoise(windPosition * 0.09) * 0.3);
  float windStreaks = valueNoise(vec2(windPosition.x * 0.03, windPosition.y * 0.6));
  float rippleNoise = valueNoise(windPosition * vec2(0.9, 2.2) + vec2(uTime * 0.4, 0.0));

  vec3 skyColor = mix(vec3(0.44, 0.52, 0.6), vec3(0.72, 0.76, 0.8), grazingAngle);
  vec3 deepWaterColor = vec3(0.035, 0.05, 0.045);

  // From above, show mostly dark water; reflections strengthen toward the horizon.
  float fresnelWeight = 0.12 + 0.88 * pow(grazingAngle, 3.0);
  float fineRipples = valueNoise(windPosition * vec2(0.35, 1.3) - vec2(uTime * 0.25, 0.0)) *
    valueNoise(windPosition * vec2(1.7, 4.1) + vec2(uTime * 0.6, 0.0));
  vec3 color = mix(deepWaterColor, skyColor, clamp((0.18 + 0.45 * windPatches + 0.2 * windStreaks + 0.25 * fineRipples) *
    mix(0.55, 1.0, fresnelWeight), 0.0, 1.0));
  float opacity = clamp((0.34 + 0.24 * windPatches + 0.14 * abs(windStreaks - 0.5) +
    0.12 * fineRipples) * mix(1.0, 0.7, fresnelWeight), 0.0, 0.8);

  // Layer a reflected sky gradient and broad ripples over the teal water body.
  {
    vec3 zenithSkyColor = vec3(0.26, 0.36, 0.48);
    vec3 horizonSkyColor = vec3(0.6, 0.66, 0.7);
    vec3 reflectedSky = mix(zenithSkyColor, horizonSkyColor, pow(grazingAngle, 1.6));
    float cloudiness = smoothstep(0.35, 0.85, valueNoise(vW.xz * 0.006 + vec2(uTime * 0.002, 0.0)) * 0.7 +
      valueNoise(vW.xz * 0.02) * 0.3);
    reflectedSky = mix(reflectedSky, vec3(0.7, 0.72, 0.74), cloudiness * 0.45);

    float broadRipples = valueNoise(windPosition * vec2(0.05, 0.18) + vec2(uTime * 0.05, 0.0)) *
      0.5 +
      valueNoise(windPosition * vec2(0.16, 0.55) - vec2(uTime * 0.12, 0.0)) *
      0.3 +
      fineRipples * 0.4;
    vec3 waterBodyColor = vec3(0.045, 0.068, 0.07) *
      (0.9 + 0.25 * valueNoise(vW.xz * 0.03));
    float reflectedSkyWeight = clamp(0.1 + 0.8 * pow(grazingAngle, 2.4) + 0.22 * (broadRipples - 0.45) +
      0.2 * windPatches, 0.04, 0.95);
    vec3 layeredWaterColor = mix(waterBodyColor, reflectedSky, reflectedSkyWeight);

    color = mix(color, layeredWaterColor, 0.75);
    opacity = max(opacity, mix(0.62, 0.85, grazingAngle));
  }

  // Dark olive and umber tones form the reflection of the tree line.
  vec3 treeColor = mix(vec3(0.028, 0.036, 0.018), vec3(0.07, 0.058, 0.03), treeCrowns) * (0.85 + 0.3 * rippleNoise);
  color = mix(color, treeColor, treeReflectionBand);
  opacity = mix(opacity, 0.9, treeReflectionBand);

  // A silty shelf fades into the water, followed by a thin wet-stone lip and foam.
  float shallowShelf = 1.0 - smoothstep(0.0, 0.16 + 0.08 * shorelineNoise, vT);
  color = mix(color, vec3(0.11, 0.1, 0.066) * (0.85 + 0.3 * shorelineNoise), shallowShelf * mix(0.7, 0.25, grazingAngle));
  float shorelineFoam = (1.0 - smoothstep(0.0, 0.03, vT)) *
    smoothstep(0.45, 0.7, valueNoise(vW.xz * 0.9 + uTime * 0.05));
  color = mix(vec3(0.07, 0.065, 0.052), color, smoothstep(0.0, 0.035, vT));
  color = mix(color, vec3(0.34, 0.35, 0.33), shorelineFoam * 0.55);
  opacity = max(opacity, (1.0 - smoothstep(0.0, 0.035, vT)) * 0.8);

  fragColor = vec4(color, opacity);

  #ifdef USE_FOG
    #ifdef FOG_EXP2
  float fogFactor = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
    #else
  float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
    #endif
  fragColor.rgb = mix(fragColor.rgb, fogColor, fogFactor);
  #endif
}
`,ze=e=>x(N(g(e,I(127.1,311.7))).mul(43758.5453));function Be(){let e=new H({color:9413296,roughness:.1,metalness:.2});e.name=`ParkGlassRoof.TSL`;let n=k(),r=F(`aGV`,`float`),a=i(r.lessThan(.33),I(1.6,1.1),i(r.lessThan(.66),I(2.4,1.5),I(1.2,2.2))),o=n.div(a),s=x(o),c=f(o),l=ze(c),u=ze(c.add(17.3)),m=d(o).mul(1.2),h=b(1).sub(t(.03,b(.03).add(m.x),s.x)).mul(b(1).sub(t(.03,b(.03).add(m.x),b(1).sub(s.x)))),g=b(1).sub(t(.045,b(.045).add(m.y),s.y)).mul(b(1).sub(t(.045,b(.045).add(m.y),b(1).sub(s.y)))),_=b(1).sub(h.mul(g)),v=x(r.mul(7.13)),y=R(j(.25,.29,.33),j(.32,.35,.38),p(.8,l)).mul(b(.92).add(u.mul(.1))),S=R(j(.16,.2,.25),j(.24,.28,.32),p(.85,l)).mul(b(.9).add(u.mul(.2))),C=R(j(.36,.38,.37),j(.44,.45,.42),p(.75,l)).mul(b(.9).add(u.mul(.12))),w=i(v.lessThan(.34),S,i(v.lessThan(.58),C,y));w=w.mul(b(.82).add(t(0,1,x(n.x.mul(.021).add(r.mul(3)))).mul(.3))),w=w.mul(b(1).sub(t(.3,1,x(n.y.mul(.07).add(l.mul(.3)))).mul(.18)));let T=ze(f(n.div(5)).add(r.mul(31))),E=ze(c.mul(.5).add(3.7));w=w.mul(b(1).sub(t(.55,.95,T.mul(.6).add(E.mul(.5))).mul(.28))),w=w.mul(b(1).sub(b(1).sub(t(0,.22,s.y)).mul(b(.5).add(u.mul(.5))).mul(.22))),w=R(w,j(.2,.18,.14),p(.9,E).mul(.18)),e.colorNode=R(w,j(.3,.31,.32),_.mul(.6));let D=R(R(.36,.5,p(.8,l)),.6,_),O=R(.5,.6,_),A=R(.72,.8,_);return e.roughnessNode=i(v.lessThan(.34),O,i(v.lessThan(.58),A,D)),e.emissiveNode=j(.018,.017,.015).mul(b(1).sub(_)).mul(p(u,.7)),e}function Ve(e=6907487){let n=new H({color:e,roughness:.9,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-2});n.name=`ParkCoping.TSL`;let r=k(),i=x(r.y.div(1.8)),a=t(0,.04,i).mul(b(1).sub(t(.96,1,i))),o=ze(I(f(r.y.div(1.8)),0));return n.colorNode=B(e).mul(b(.55).add(a.mul(.45))).mul(b(.85).add(o.mul(.25))).mul(R(.8,1,t(0,.25,r.x))),n}function He(){let e=new se({color:9080206,transparent:!0,depthWrite:!1,side:2});e.name=`ParkChainlink.TSL`;let n=k(),r=I(n.x.add(n.y),n.x.sub(n.y)).div(.06),i=y(x(r).sub(.5)),a=w(i.x,i.y),o=d(r),s=b(1).sub(t(.06,b(.06).add(P(o.x,o.y)),a)),c=t(.15,.6,P(o.x,o.y)),l=R(s,b(.42),c),u=p(y(n.y.sub(.03)),.03).max(p(y(n.y.sub(f(n.y.div(5).add(.5)).mul(5))),.04));return e.opacityNode=l.max(u),e.maskNode=e.opacityNode.greaterThan(.02),e}function Ue(e=5723988){let n=new H({color:e,roughness:.9,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-4});n.name=`ParkHexPaver.TSL`;let r=m,a=I(r.x,r.z).div(.23),o=I(1,1.7320508),s=o.mul(.5),c=z(a,o).sub(s),u=z(a.sub(s),o).sub(s),p=i(g(c,c).lessThan(g(u,u)),c,u),h=a.sub(p),_=y(p),v=b(.5).sub(P(g(_,l(o)),_.x)),x=d(a.x).mul(1.2),S=b(1).sub(t(.02,b(.02).add(x),v)),C=t(.08,.35,x),w=b(.86).add(ze(f(h.mul(10).add(.5))).mul(.2)),T=b(.9).add(N(r.x.mul(.37).add(r.z.mul(.21))).mul(N(r.z.mul(.13))).mul(.1));return n.colorNode=B(e).mul(R(w.mul(R(1,.55,S)),.9,C)).mul(T),n}function We(e=6842213){let n=new H({color:e,roughness:.9,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-4});n.name=`ParkWalkway.TSL`;let r=m,i=I(r.x,r.z),a=ze(f(i.mul(.35))).mul(.6).add(ze(f(i.mul(1.7))).mul(.4)),o=ze(f(i.mul(.12).add(3))),s=B(e).mul(b(.82).add(a.mul(.3)));return n.colorNode=R(s,j(.2,.2,.19),t(.72,.8,o).mul(.5)),n}var Ge=e=>I(e.x,e.z);function Ke(e,r){let a=new H({color:16777215,roughness:.94,metalness:0});a.name=`CityAsphalt.TSL`,a.userData.webgpuAmbientFillScale=2,a.userData.webgpuAmbientFloor=!1;let o=m,s=Ge(o),c=L(F(`aRoad`,`vec3`),`vRoadNode`),u=n(e.asphaltCol,s.div(6)).rgb.mul(.88),d=n(e.noise,s.div(97)).rgb,f=u.mul(b(.8).add(n(e.asphaltMacro,s.div(64)).r.mul(.4)));if(f=f.mul(b(.88).add(d.r.mul(.24))),f=f.mul(b(.94).add(d.r.mul(.12))),r.name!==`low`){let t=n(e.asphaltMacro,I(s.y.negate(),s.x).div(151).add(I(.5))).r,r=n(e.asphaltCol,I(s.y,s.x.negate()).div(7.3).add(I(.37))).rgb;f=R(f,r.mul(.88),.35),f=f.mul(b(.88).add(t.mul(.24)))}let p=o.x.sub(c.y),_=z(p.add(10.8),3.6).sub(1.8).abs(),y=o.z.sub(c.z).abs(),x=V(S(_.sub(.85).div(.3),2).negate()),C=V(S(y.sub(.9).div(.35),2).negate()),w=i(c.x.lessThan(.5),x,i(c.x.lessThan(2),C,b(.25)));f=f.mul(b(1).sub(w.mul(.12)));let T=t(10.2,11,p.abs()),E=b(5).add(c.x.sub(1).mul(100)),D=t(E.sub(.7),E,y),k=i(c.x.lessThan(.5),T,i(c.x.lessThan(2),D,b(0)));f=f.mul(b(1).sub(k.mul(.16))),a.colorNode=f;let A=n(e.asphaltNrm,s.div(6)).rgb,M=A.rg.mul(2).sub(1),N=v(b(1).sub(g(M,M)).max(0)),ee=l(j(M.x,N,M.y));a.normalNode=ne(ee,O);let P=h.length();return a.roughnessNode=R(A.b.add(.05).sub(w.mul(.08)).clamp(.35,1),b(1),t(300,1100,P)),a}function qe(e){let r=new H({color:16777215,roughness:.88,metalness:0});r.name=`CitySidewalk.TSL`,r.userData.webgpuAmbientFillScale=2,r.userData.webgpuAmbientFloor=!1;let a=m,o=Ge(a),s=L(F(`aRect`,`vec4`),`vWalkRectNode`),c=l(_),u=n(e.noise,o.div(53)).rgb,d=o.div(6),f=n(e.sidewalkCol,d).rgb;f=f.mul(b(.93).add(u.r.mul(.14))),f=f.mul(b(1).sub(u.b.mul(.04)));let p=w(w(a.x.sub(s.x),s.z.sub(a.x)),w(a.z.sub(s.y),s.w.sub(a.z))),y=s.x.greaterThan(-5e4),x=i(y,b(1).sub(t(.26,.3,p)),b(0)),S=o.div(1.1).add(I(.3)),C=n(e.curbCol??e.sidewalkCol,S).rgb.mul(.97),T=R(f,C,x).mul(i(y,j(1),j(.86,.82,.77))),E=I(a.x.add(a.z),a.y).div(1.3),D=n(e.curbCol??e.sidewalkCol,E).rgb.mul(.92);f=i(c.y.lessThan(.5),D,T),r.colorNode=f;let k=n(e.sidewalkNrm,d).rgb,A=R(k.rg.mul(2).sub(1),I(0),x),M=v(b(1).sub(g(A,A)).max(0)),N=l(j(A.x,M,A.y)),ee=i(c.y.greaterThan(.5),N,c);r.normalNode=ne(ee,O);let P=R(k.b,b(.7),x);return r.roughnessNode=R(i(c.y.greaterThan(.5),P,b(.85)),b(1),t(300,1100,h.length())),r}function Je(e,r,i={}){let a=new H({color:16777215,roughness:.98,metalness:0});a.name=i.lawn?`CityLawn.TSL`:`CentralParkGrass.TSL`;let o=m,s=Ge(o),c=n(e.grassCol,s.div(r.name===`low`?12:6)).rgb,l=n(e.noise,s.div(r.name===`low`?80:140)).rgb,u=c;if(r.name!==`low`){let t=n(e.grassCol,s.yx.div(23)).rgb;u=R(c,t,.4)}u=u.mul(b(.78).add(l.r.mul(.4))),u=R(u,j(g(u,j(.3,.55,.15))),.32).mul(j(.84,.84,.74));let d=n(e.noise,s.div(31).add(I(.17))).g,f=t(.58,.82,d),p=R(j(.19,.18,.09),j(.26,.2,.11),l.g);u=R(u,p,f.mul(i.lawn?.08:.42));let h=N(o.x.mul(.17)).mul(.012);return a.colorNode=u.add(j(h)),a}var Ye=`// highway shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
in vec2 aHw;
out vec2 vHw;
out vec3 vHwP;
// @section vertexFogVertex
#include <fog_vertex>
vHw = aHw;
vHwP = (modelMatrix * vec4(transformed, 1.0)).xyz;
// @section fragmentCommon
#include <common>
uniform sampler2D tCol;
uniform sampler2D tNoise;
uniform sampler2D tMacro;
in vec2 vHw;
in vec3 vHwP;
float hwR = 0.85;
float band(float u, float c, float hw, float aa) {
return 1.0 - smoothstep(hw - aa, hw + aa, abs(u - c));
}
void highway(out vec3 highwayColor) {
float u = vHw.x, v = vHw.y;
float lineAA = max(fwidth(u), 1e-3);
vec2 p = vHwP.xz;
vec3 c = texture(tCol, p / 6.0).rgb * 0.92;
vec3 m = texture(tMacro, p / 70.0).rgb;
vec3 nz = texture(tNoise, p / 53.0).rgb;
c *= (0.84 + 0.3 * m.r) * (0.93 + 0.14 * nz.r);
float dist = length(vHwP - cameraPosition);
// tyre tracks per lane (darker), slightly lighter lane centres
float l = mod(u - __SHADER_INJECT_0__, __SHADER_INJECT_1__) - __SHADER_INJECT_2__;
c *= 1.0 - 0.12 * exp(- pow((abs(l) - 0.85) / 0.3, 2.0));
c *= mix(1.0, 0.7, smoothstep(90.0, 700.0, dist)); // aerial LOD tone like the street asphalt
hwR = 0.85;
float W = __SHADER_INJECT_3__, SH = __SHADER_INJECT_4__, LN = __SHADER_INJECT_5__, MD = __SHADER_INJECT_6__;
float m0 = SH + 3.0 * LN, m1 = m0 + MD;
// planted median: kerbed strip with grass / soil
if(u > m0 + 0.25 && u < m1 - 0.25) {
vec3 g = mix(vec3(0.16, 0.18, 0.1), vec3(0.2, 0.18, 0.13), texture(tNoise, p / 7.0).g);
hwR = 0.95;
highwayColor = g * (0.85 + 0.3 * nz.b);
return;
}
if(u > m0 && u < m1) {
hwR = 0.8;
highwayColor = vec3(0.46, 0.45, 0.42) * (0.9 + 0.2 * nz.g);
return;
} // kerb
float wear = 0.75 + 0.25 * smoothstep(0.3, 0.7, texture(tNoise, p / 3.1).r);
float paint = 0.0;
vec3 pc = vec3(0.86, 0.86, 0.83);
// solid white edge lines
paint += band(u, SH - 0.1, 0.075, lineAA) + band(u, W - SH + 0.1, 0.075, lineAA);
// dashed lane lines (3 m dash, 9 m gap)
float dash = step(mod(v, 12.0), 3.0);
for(int j = 1;
j < 3;
j ++) {
paint += dash * (band(u, SH + float(j) * LN, 0.06, lineAA) + band(u, m1 + float(j) * LN, 0.06, lineAA));
}
paint = clamp(paint, 0.0, 1.0);
// double yellow along the median kerbs
float yl = band(u, m0 - 0.2, 0.055, lineAA) + band(u, m1 + 0.2, 0.055, lineAA);
c = mix(c, pc * 0.85, paint * wear * 0.85);
c = mix(c, vec3(0.72, 0.55, 0.16) * 0.85, clamp(yl, 0.0, 1.0) * wear * 0.85);
hwR = mix(0.9, 0.6, paint);
// gutters
c *= 1.0 - 0.2 * (1.0 - smoothstep(0.0, 0.6, u)) - 0.2 * (1.0 - smoothstep(0.0, 0.6, W - u));
highwayColor = c;
}
// @section fragmentMap
vec3 highwayColor;
highway(highwayColor);
diffuseColor.rgb = highwayColor;
// @section fragmentRoughness
float roughnessFactor = hwR;
`,Xe=(e,n,r,i)=>b(1).sub(t(r.sub(i),r.add(i),e.sub(n).abs()));function Ze(e,r){let a=new H({color:16777215,roughness:.9,metalness:0});a.name=`CityHighway.TSL`;let o=F(`aHw`,`vec2`),s=m,c=I(s.x,s.z),l=n(e.noise,c.div(53)).rgb,u=n(e.asphaltMacro,c.div(70)).rgb,f=n(e.asphaltCol,c.div(6)).rgb.mul(.92).mul(b(.84).add(u.r.mul(.3))).mul(b(.93).add(l.r.mul(.14))),h=z(o.x.sub(r.SH),r.LANE).sub(r.LANE/2),g=V(S(h.abs().sub(.85).div(.3),2).negate()),_=ee.sub(s).length();f=f.mul(b(1).sub(g.mul(.12))).mul(R(1,.7,t(90,700,_)));let v=r.SH+3*r.LANE,y=v+r.MED,x=o.x.greaterThan(v+.25).and(o.x.lessThan(y-.25)),C=o.x.greaterThan(v).and(o.x.lessThan(y)),w=n(e.noise,c.div(7)).g,T=R(j(.16,.18,.1),j(.2,.18,.13),w).mul(b(.85).add(l.b.mul(.3))),E=j(.46,.45,.42).mul(b(.9).add(l.g.mul(.2))),D=P(d(o.x),b(.001)),O=p(z(o.y,12),3),k=Xe(o.x,r.SH-.1,b(.075),D).add(Xe(o.x,r.W-r.SH+.1,b(.075),D));for(let e=1;e<3;e++)k=k.add(O.mul(Xe(o.x,r.SH+e*r.LANE,b(.06),D))).add(O.mul(Xe(o.x,y+e*r.LANE,b(.06),D)));k=k.clamp(0,1);let A=Xe(o.x,v-.2,b(.055),D).add(Xe(o.x,y+.2,b(.055),D)).clamp(0,1),M=b(.75).add(t(.3,.7,n(e.noise,c.div(3.1)).r).mul(.25));return f=R(f,j(.86,.86,.83).mul(.85),k.mul(M).mul(.85)),f=R(f,j(.72,.55,.16).mul(.85),A.mul(M).mul(.85)),f=f.mul(b(1).sub(b(1).sub(t(0,.6,o.x)).mul(.2))).mul(b(1).sub(b(1).sub(t(0,.6,b(r.W).sub(o.x))).mul(.2))),a.colorNode=i(x,T,i(C,E,f)),a.roughnessNode=i(x,.95,i(C,.8,R(.9,.6,k))),a}var Qe=`// vehicles shader sections. Use parseShaderSections() to select an injection chunk.
// @section fragmentCommon
#include <common>
in float vVehY;
in float vVehAO;
// @section fragmentPaintBaseColor
diffuseColor.rgb = min(diffuseColor.rgb * vec3(0.27, 0.285, 0.3), vec3(0.12));
pR = 0.07;
// @section fragmentPhysicalLightDeclarations
#include <lights_physical_pars_fragment>
#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
vec3 vehHorizon(vec3 viewDir, vec3 n, float rough) {
vec3 r = transformDirectionByInverseViewMatrix(reflect(- viewDir, n), viewMatrix);
float h = r.y;
vec3 sky = textureCubeUV(envMap, envMapRotation * normalize(vec3(r.x, max(h, 0.1), r.z)), max(rough, 0.03)).rgb * envMapIntensity;
vec3 hor = textureCubeUV(envMap, envMapRotation * normalize(vec3(r.x, 0.35, r.z)), 0.5).rgb * envMapIntensity;
float id = floor(atan(r.z, r.x) * 11.0);
float bt = 0.03 + 0.24 * fract(sin(id * 12.9898) * 43758.5453);   // building tops (elevation, ~2-15 deg)
float e = 0.006 + rough * 0.4;
float bld = 1.0 - smoothstep(bt - e, bt + e, h);
float gnd = 1.0 - smoothstep(- 0.04 - e, 0.0 + e, h);
vec3 c = sky * 1.25;
c = mix(c, hor * (0.24 + 0.1 * fract(id * 0.618)), bld);
c = mix(c, hor * 0.04, gnd);
return c;
}
#endif
// @section fragmentLightsMaps
#include <lights_fragment_maps>
#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV ) && defined( RE_IndirectSpecular )
if(P == 3) radiance = min(mix(radiance, vehHorizon(geometryViewDir, geometryNormal, material.roughness) * 0.7, 0.85), vec3(1.1)); // (vehicles r4) no blown white sky blocks on glass from above
#ifdef USE_CLEARCOAT
else if(P == 1 || P == 0 || P == 15 || P == 7 || P == 8) clearcoatRadiance = mix(clearcoatRadiance, vehHorizon(geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness) * (P == 1 ? 2.1 : P == 0 ? 1.5 : 1.0), 0.9); // (vehicles r3) paint: stronger reflection read ((vehicles r4) x2.1 paint, x1.5 white bodies: director 'weak on yellow/white')
#else
else if(P == 1) radiance = mix(radiance, vehHorizon(geometryViewDir, geometryNormal, material.roughness), 0.5);
#endif
#endif
// @section fragmentRoughnessFromVehicleMaterial

float gk = 1.0 - smoothstep(0.16, 0.5, vVehY);              // (vehicles) grime band on the lower panels ((vehicles r3) lower + lighter: sills / arches only)
float vehCC = 0.0;
if(P == 1 || P == 0) {
diffuseColor.rgb *= mix(vec3(1.0), vec3(0.72, 0.68, 0.62), gk * 0.7);
pR = mix(P == 1 ? 0.26 : 0.45, 0.65, gk * 0.7);
vehCC = (P == 1 ? 1.0 : 0.7) * (1.0 - gk * 0.6);
} else if(P == 15) vehCC = 0.8;
else if(P == 3) vehCC = 0.0;                                  // (vehicles r3) one glossy layer on glass (two layers = blown double sun glint)
else if(P == 7 || P == 8) vehCC = 0.9;
float vAOe = (P == 2 || P == 5) ? mix(vVehAO, 1.0, 0.65) : vVehAO; // (vehicles r2) baked AO (wheels sit deep in the wells: softened)
diffuseColor.rgb *= mix(1.0, vAOe, 0.55);                    // cavities / wheel wells / under-body
roughnessFactor = pR;
// @section fragmentAmbientOcclusion
#include <aomap_fragment>
{                                                             // (vehicles r2) baked AO occludes sky light + reflections
float vAOk = clamp(vAOe * 1.08, 0.0, 1.0);
reflectedLight.indirectDiffuse *= vAOk;
reflectedLight.indirectSpecular *= vAOk * vAOk;
if(P == 3) reflectedLight.directSpecular = min(reflectedLight.directSpecular, vec3(0.7)); // (vehicles r4) no blown sun glint on (rear) glass
#if defined( USE_CLEARCOAT )
clearcoatSpecularIndirect *= vAOk * vAOk;
#endif
}
// @section fragmentPhysicalLights
#include <lights_physical_fragment>
#ifdef USE_CLEARCOAT
material.clearcoat = vehCC;
#endif

// @section vertexAttributeDeclarations
out float vVehY;
in float aAO;
out float vVehAO;
in float aSeed;

// @section vertexMain
vVehY = position.y;
vVehAO = aAO;
#ifdef USE_MAP
if(aPart > 14.5 && aPart < 15.5 && uv.x > 0.499) {
const float AH = 170.0 / 2048.0;
float k = floor(fract(aSeed * 7.31 + 0.13) * 8.0);
vMapUv = vec2(0.5 + mod(k, 2.0) * 0.25, floor(k / 2.0) * AH) + (uv - vec2(0.5, 0.0));
}
#endif
`,$e=`// partmat shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
in float aPart;
flat out float vPart;
out vec3 vTintP;
out float vStateP;
__SHADER_INJECT_0__ __SHADER_INJECT_1__ __SHADER_INJECT_2__
// @section vertexBeginVertex
#include <begin_vertex>
vPart = aPart;
vTintP = __SHADER_INJECT_0__;
vStateP = __SHADER_INJECT_1__;
__SHADER_INJECT_2__
// @section fragmentCommon
#include <common>
flat in float vPart;
in vec3 vTintP;
in float vStateP;
uniform float uNightK;
// @section fragmentColor
#include <color_fragment>
int P = int(vPart + 0.5);
float pR = 0.7, pM = 0.0;
vec3 pE = vec3(0.0);
if(P == 1) {
diffuseColor.rgb *= vTintP;
pR = 0.32;
} else if(P == 2) {
pR = 0.28;
pM = 1.0;
} else if(P == 3) {
diffuseColor.rgb = vec3(0.012, 0.014, 0.016);
pR = 0.04;
} else if(P == 4) {
pR = 0.2;
pE = diffuseColor.rgb * 0.4;
} else if(P == 5) {
pR = 0.92;
} else if(P == 6) {
pR = 0.55;
} else if(P == 7) {
pR = 0.08;
pM = 0.6;
pE = vec3(0.12);
} else if(P == 8) {
pR = 0.2;
pE = diffuseColor.rgb * (0.3 + max(vStateP, 0.0) * 7.0);
} // (night) state -1 = parked car, lamps off
else if(P == 9) {
pR = 0.85;
} else if(P >= 10 && P <= 12) {
float on = abs(float(P - 10) - vStateP) < 0.5 ? 1.0 : 0.0;
vec3 lc = P == 10 ? vec3(1.0, 0.06, 0.03) : (P == 11 ? vec3(1.0, 0.5, 0.02) : vec3(0.05, 1.0, 0.45));
diffuseColor.rgb = lc * 0.05;
pR = 0.15;
pE = lc * on * 30.0;
} else if(P == 13) {
vec3 lc = vStateP > 1.5 ? vec3(0.9, 0.95, 1.0) : vec3(1.0, 0.45, 0.05);
diffuseColor.rgb = lc * 0.05;
pE = lc * 10.0;
} else if(P == 14) {
pR = 0.1;
pE = diffuseColor.rgb * 3.0;
} else if(P == 15) {
pR = 0.3;
pE = diffuseColor.rgb * 0.25;
} else if(P == 16) {
diffuseColor.rgb *= vTintP.r > - 1.0 ? vec3(1.0) : vec3(1.0);
pR = 0.6;
} else if(P == 17 || P == 18 || P == 19) {
pR = 0.8;
} else if(P == 20) {
pR = 0.85;
} else if(P == 21) {
pR = 0.78;
} else if(P == 22) {
pR = 0.92;
}
// (daynight) lamps, headlights, tail lights, screens and taxi signs light up at night
if(uNightK > 0.0) {
float lampOn = vStateP < - 0.5 ? 0.0 : 1.0; // (night) parked cars (traffic.ts state -1): head / tail lamps dark
if(P == 4) pE += (vStateP > 0.5 ? vec3(1.0, 0.56, 0.2) : vec3(1.0, 0.85, 0.66)) * 3.2 * uNightK; // (night r3) warm-white LED / sodium amber ((night r4) 9 -> 3.2: the core just clips, a small halo, not a 60 px disc) (street lamps: props.ts aState)
// (night r12) user: 'car lights from distance are very bright big circles, with reflections below'. The bloom halo
// is a fixed size on screen while the lamp shrinks: head / tail lamps dim with distance (~1/d past 16 m), so far
// cars read as small bright points (was a flat 7.0: every car a clipped disc + halo at any range)
float hk = clamp(12.0 / max(length(vViewPosition), 1.0), 0.1, 1.0);
if(P == 7) pE += vec3(1.0, 0.95, 0.88) * 3.5 * hk * uNightK * lampOn;
else if(P == 8) pE += diffuseColor.rgb * 2.2 * max(hk, 0.35) * uNightK * lampOn;
else if(P == 14 || P == 15) pE *= 1.0 + 1.5 * uNightK;
}

// @section fragmentRoughness
#include <roughnessmap_fragment>
roughnessFactor = pR;
// @section fragmentMetalness
#include <metalnessmap_fragment>
metalnessFactor = pM;
// @section fragmentEmissive
#include <emissivemap_fragment>
totalEmissiveRadiance += pE;
`;function et({name:e,instanceTint:r,instanceState:a,physical:o,vehicle:s,map:l}){let d={name:e,vertexColors:!l,map:l,roughness:.7,metalness:0},p=o?new oe(d):new H(d),m=L(F(`aPart`,`float`),`vPartId`).round(),g=a?L(F(`aState`,`float`),`vPartState`):b(0),_=r?L(F(`aTint`,`vec3`),`vPartTint`):j(1),v=e=>m.equal(e),y=(e,t)=>e.or(t),S=s&&l!=null,w=C(ce.value);w.onRenderUpdate(()=>{w.value=ce.value});let T=l?c:c.mul(D().rgb),E=null,O=null;if(S){let e=L(F(`aSeed`,`float`),`vVehicleSeed`),t=k(),r=f(x(e.mul(7.31).add(.13)).mul(8)),a=I(b(.5).add(z(r,2).mul(.25)),f(r.div(2)).mul(170/2048)).add(t.sub(I(.5,0))),o=i(v(15).and(t.x.greaterThan(.499)),a,t);p.map=null,T=c.mul(n(l,o).rgb),E=L(u.y,`vVehicleY`),O=L(F(`aAO`,`float`),`vVehicleAO`)}let A=m.greaterThanEqual(10).and(m.lessThanEqual(12)),M=i(v(10),j(1,.06,.03),i(v(11),j(1,.5,.02),j(.05,1,.45))),N=i(g.greaterThan(1.5),j(.9,.95,1),j(1,.45,.05)),ee=g.sub(m.sub(10)).abs().lessThan(.5);p.vertexColors=!1;let P=S?T.mul(R(j(1),j(.72,.68,.62),b(1).sub(t(.16,.5,E)).mul(.7))):T;p.colorNode=i(A,M.mul(.05),i(v(13),N.mul(.05),i(v(3),j(.012,.014,.016),i(v(1),P.mul(_),i(v(0),P,T)))));let te=b(.7);for(let[e,t]of[[1,.32],[2,.28],[3,.04],[4,.2],[5,.92],[6,.55],[7,.08],[8,.2],[9,.85],[10,.15],[11,.15],[12,.15],[14,.1],[15,.3],[16,.6],[17,.8],[18,.8],[19,.8],[20,.85],[21,.78],[22,.92]])te=i(v(e),b(t),te);if(p.roughnessNode=te,S){let e=b(1).sub(t(.16,.5,E));p.roughnessNode=i(v(1),R(b(.26),b(.65),e.mul(.7)),i(v(0),R(b(.45),b(.65),e.mul(.7)),te)),p.aoNode=i(y(v(2),v(5)),R(O,b(1),.65),O),o&&(p.clearcoatNode=i(v(1),b(1).sub(e.mul(.6)),i(v(0),b(.7).mul(b(1).sub(e.mul(.6))),i(v(15),b(.8),i(y(v(7),v(8)),b(.9),b(0))))),p.clearcoatRoughnessNode=b(.06))}p.metalnessNode=i(v(2),b(1),i(v(7),b(.6),b(0)));let ne=g.greaterThanEqual(-.5),re=h.length().max(1),ie=b(12).div(re).clamp(.1,1),ae=i(g.greaterThan(.5),j(1,.56,.2),j(1,.85,.66)),B=i(v(4),ae.mul(3.2).mul(w),i(v(7),j(1,.95,.88).mul(3.5).mul(ie).mul(w).mul(ne),i(v(8),T.mul(2.2).mul(ie.max(.35)).mul(w).mul(ne),j(0)))),V=j(0);V=i(v(4),T.mul(.4),V),V=i(v(8),T.mul(b(.3).add(g.max(0).mul(7))),V),V=i(A,M.mul(ee).mul(30),V),V=i(v(13),N.mul(10),V),V=i(v(14),T.mul(3),V),V=i(v(15),T.mul(.25),V);let se=y(v(14),v(15));return V=V.mul(i(se,b(1).add(w.mul(1.5)),b(1))),p.emissiveNode=V.add(B),p.userData.partMaterialNodes=!0,p}var Y=e=>x(N(g(e,I(127.1,311.7))).mul(43758.5453)),tt=()=>{let e=C(ce.value);return e.onRenderUpdate(()=>{e.value=ce.value}),e};function nt(){let e=new H({vertexColors:!0,roughness:.85});e.name=`FarCityMass.TSL`;let n=F(`color`,`vec3`),r=m,a=i(n.b.greaterThan(15),b(20),i(n.b.greaterThan(5),b(10),b(0))),o=j(n.r,n.g,n.b.sub(a)),s=n.b.greaterThan(15),c=n.b.greaterThan(5),l=r.x.add(r.z),u=tt(),d=f(I(l.div(2.4),r.y.sub(1.2).div(3.3))),h=Y(d),g=Y(f(I(l.div(1.6),r.y.div(3.9)))),_=p(.3,x(r.y.sub(1.2).div(3.3))).mul(p(x(r.y.sub(1.2).div(3.3)),.82)).mul(p(.28,x(l.div(2.4)))).mul(p(x(l.div(2.4)),.74)),v=P(b(1).sub(p(.1,x(l.div(1.6)))),b(1).sub(p(.12,x(r.y.div(3.9))))),y=R(j(.1,.13,.16),j(.34,.4,.46),t(0,180,r.y).mul(.6).add(g.mul(.25))),S=R(o,j(.07,.08,.095).mul(b(.7).add(h.mul(.9))),_),C=R(y,o.mul(.9),v.mul(.8)),w=i(s,C,i(c,S,o)),T=b(.62).add(t(0,14,r.y.sub(1.2)).mul(.38));w=w.mul(T).mul(b(1).sub(u.mul(.85))),e.colorNode=w;let E=Y(d.add(I(7.7,2.9))),D=j(1,.72,.42).mul(_).mul(p(.85,E)).mul(.5),O=j(.8,.88,1).mul(b(1).sub(v)).mul(p(.8,g.add(5.3))).mul(.5);return e.emissiveNode=i(s,O,D).mul(u).mul(1.4),e}function rt(e){let r=new H({roughness:.95,side:2});r.name=`FarLand.TSL`;let a=k(),o=m,s=I(o.x,o.z),c=I(96,210),l=s.div(c),u=f(l),d=x(l),p=Y(u),h=Y(f(s.div(1400))),g=p.greaterThan(.93).or(h.lessThan(.1)),_=R(j(.29,.27,.25),j(.4,.36,.32),p);_=i(g,j(.26,.31,.22),_);let v=Y(f(s.div(38))).mul(.6).add(Y(f(s.div(330))).mul(.4));_=R(_,j(.16,.19,.12),t(.45,.8,v).mul(.75));let S=w(w(d.x,b(1).sub(d.x)).mul(96),w(d.y,b(1).sub(d.y)).mul(210)),C=b(1).sub(t(5,8,S)),T=R(_,j(.2,.2,.21),C),E=w(y(z(s.x.sub(350).add(550),1100).sub(550)),y(z(s.y.sub(180).add(475),950).sub(475)));T=R(T,j(.15,.15,.16),b(1).sub(t(11,14,E)));let D=a.x.greaterThanEqual(0).and(a.x.lessThanEqual(1)).and(a.y.greaterThanEqual(0)).and(a.y.lessThanEqual(1)),O=t(0,.03,w(w(a.x,b(1).sub(a.x)),w(a.y,b(1).sub(a.y)))),A=n(e,a).rgb;return r.colorNode=R(T,A,i(D,O,b(0))),r}function X(e,n){let r=new H({color:16777215,roughness:.93,side:2});r.name=`PalisadesCliff.TSL`;let i=m,a=i.z.mul(.97).add(i.x.mul(.24)),o=a.div(3.5),s=f(o),c=b(1).sub(t(.015,.12,w(x(o),b(1).sub(x(o))))),l=Y(I(s,f(i.y.mul(.3)))),u=R(j(.15,.14,.13),j(.23,.2,.17),Y(I(s,0))).mul(b(.85).add(l.mul(.3))).mul(b(1).sub(c.mul(.55))),d=t(.55,.9,Y(I(a.mul(.013),i.y.mul(.02))));u=R(u,j(.36,.25,.18),d.mul(.5));let p=b(e+12).add(Y(I(a.mul(.031),1)).mul(12)),h=b(1).sub(t(0,4,i.y.sub(p))),g=Y(I(a.mul(.11),i.y.mul(.05))).greaterThan(.35),_=R(j(.07,.085,.045),j(.14,.12,.06),Y(I(a.mul(.4),i.y.mul(.3))));u=R(u,_,h.mul(g).mul(.85));let v=t(n+16,n+40,i.y).mul(Y(I(a.mul(.07),i.y.mul(.05))).greaterThan(.35));return u=R(u,j(.14,.17,.08),v.mul(.65)),r.colorNode=u,r}export{Te as A,fe as B,Me as C,Oe as D,ke as E,Se as F,ue as H,be as I,ye as L,J as M,xe as N,De as O,Ce as P,he as R,Ne as S,Ae as T,U,de as V,le as W,Re as _,$e as a,Fe as b,Ye as c,qe as d,He as f,We as g,Ue as h,et as i,we as j,Ee as k,Ke as l,Be as m,nt as n,Qe as o,Ve as p,X as r,Ze as s,rt as t,Je as u,Le as v,je as w,Pe as x,Ie as y,ge as z};
//# sourceMappingURL=world~index~gameSystems-kxVwOfDz.js.map