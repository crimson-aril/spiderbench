const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/tslPipeline-Aavej_L9.js","assets/render~tslPipeline-DlPtqx3x.js","assets/three~index~combat~tslPipeline~screenshotPresets~gameSystems-B-te4akP.js","assets/three~index~combat~tslPipeline~screenshotPresets~gameSystems~GLTFLoader-B3xvqeNo.js","assets/three~index~combat~tslPipeline~screenshotPresets~gameSystems-DsPuCJ23.js","assets/three~tslPipeline-CfUi3s5N.js","assets/render~tslPipeline~gameSystems-C0RYIjo-.js","assets/world~index~tslPipeline~screenshotPresets~gameSystems-ZgHieP-C.js","assets/three~index~tslPipeline~screenshotPresets~gameSystems-XhDerpBe.js","assets/rolldown-runtime-DK3Fl9T5.js","assets/vehicleLighting-Cqq_fzGi.js","assets/render~index~tslPipeline-CjEH12yV.js"])))=>i.map(i=>d[i]);
import{$ as e,$n as t,$r as n,Dr as r,Gt as i,Ja as a,Lt as o,O as s,Qa as c,Qi as l,Rn as u,Rt as d,St as f,U as p,V as m,Wi as h,Wn as g,Wr as _,Xt as v,Yt as ee,_r as y,ar as te,bt as b,co as x,do as S,ea as C,ft as w,io as T,ir as E,j as D,no as O,or as k,pa as A,r as j,ro as M,ta as N,tr as P,ut as F,vt as I}from"./three~index~combat~tslPipeline~screenshotPresets~gameSystems~GLTFLoader-B3xvqeNo.js";import{a as L,n as R,r as ne,t as re}from"./three~index~tslPipeline~screenshotPresets~gameSystems-XhDerpBe.js";import{Ai as z,Ci as ie,Fr as ae,Ht as oe,Ii as se,Jr as ce,Lt as le,Vi as ue,Vt as B,Wt as de,Yr as fe,Zi as V,ht as pe,ia as H,ki as me,lt as he,mr as ge,vr as U,zt as _e}from"./three~index~combat~tslPipeline~screenshotPresets~gameSystems-DsPuCJ23.js";import{t as ve}from"./three~index~combat~tslPipeline~screenshotPresets~gameSystems-B-te4akP.js";import{a as W,i as ye,n as be,o as G,r as xe,s as K}from"./world~index~tslPipeline~screenshotPresets~gameSystems-ZgHieP-C.js";import{t as Se}from"./n8ao~index-Da3IIyey.js";import{f as Ce,p as we,s as Te}from"./world~index~combat~screenshotPresets~gameSystems-BOTEtzPM.js";import{c as Ee,i as De,o as Oe,r as ke,s as Ae}from"./vehicleLighting-Cqq_fzGi.js";import{a as je,n as Me}from"./world~index~gameSystems-B06jYbTN.js";import{n as Ne,r as Pe,t as Fe}from"./render~index~tslPipeline-CjEH12yV.js";import{t as Ie}from"./world~index~gameSystems-Bcob6zcg.js";import{B as Le,C as Re,N as ze,P as Be,S as q,_ as Ve,v as He}from"./world~index~gameSystems-B0Rxo-lT.js";var Ue=`
precision highp float; in vec2 vUv; out vec4 fragColor;
uniform sampler2D uDepth, uScene, uPrev; uniform mat4 uProj, uCamWorld, uPrevViewProj; uniform vec2 uRes;
uniform float uFrame, uEnvI, uHavePrev, uMaxDist, uFloor;
__SHADER_INJECT_0__
#define saturate(a) clamp(a, 0.0, 1.0)
uniform sampler2D envMap;
__SHADER_INJECT_1__
float linZ(vec2 uv) { float d = textureLod(uDepth, uv, 0.0).r; return isSky(d) ? 1e7 : -viewPosFromDepth(uv, d).z; }
vec3 vpos(vec2 uv) { return viewPosFromDepth(uv, texture(uDepth, uv).r); }
void main() {
  // pick one full-res pixel of the 2x2 block (rotating per frame; TAA integrates the rest)
  vec2 px = 1.0 / uRes;
  int k = int(uFrame) & 3;
  vec2 fp = floor(vUv * uRes * 0.5) * 2.0 + vec2(float(k & 1), float(k >> 1)) + 0.5;
  vec2 uv = fp * px;
  float w = texture(uScene, uv).a - 1.0;
  float d0 = texture(uDepth, uv).r;
  if (w < 0.01 || isSky(d0)) { fragColor = vec4(0.0); return; }
  vec3 P = viewPosFromDepth(uv, d0);
  // normal from depth: pick the smaller-difference neighbours on each axis (robust at silhouettes)
  vec3 pr = vpos(uv + vec2(px.x, 0.0)), pl = vpos(uv - vec2(px.x, 0.0));
  vec3 pu = vpos(uv + vec2(0.0, px.y)), pd = vpos(uv - vec2(0.0, px.y));
  vec3 dx = abs(pr.z - P.z) < abs(P.z - pl.z) ? pr - P : P - pl;
  vec3 dy = abs(pu.z - P.z) < abs(P.z - pd.z) ? pu - P : P - pd;
  vec3 N = normalize(cross(dx, dy));
  vec3 V = normalize(P);
  if (dot(N, V) > 0.0) N = -N;
  vec3 R = reflect(V, N);
  vec3 Rw = normalize((uCamWorld * vec4(R, 0.0)).xyz);
  vec3 env = textureCubeUV(envMap, Rw, 0.04).rgb * uEnvI;
  // --- screen-space march (perspective-correct via 1/z interpolation)
  float len = uMaxDist;
  if (R.z > 0.0) len = min(len, (-P.z - 0.12) / R.z * 0.98); // don't cross the near plane
  vec3 E = P + R * len;
  vec4 h0 = uProj * vec4(P, 1.0), h1 = uProj * vec4(E, 1.0);
  float k0 = 1.0 / h0.w, k1 = 1.0 / h1.w;
  vec2 s0 = h0.xy * k0 * 0.5 + 0.5, s1 = h1.xy * k1 * 0.5 + 0.5;
  // clip the screen segment to the viewport
  vec2 dS = s1 - s0; float tMax = 1.0;
  if (s1.x > 1.0) tMax = min(tMax, (1.0 - s0.x) / dS.x); if (s1.x < 0.0) tMax = min(tMax, -s0.x / dS.x);
  if (s1.y > 1.0) tMax = min(tMax, (1.0 - s0.y) / dS.y); if (s1.y < 0.0) tMax = min(tMax, -s0.y / dS.y);
  float jit = ign(gl_FragCoord.xy + uFrame * 5.588);
  float hitT = -1.0; float tPrev = 0.0;
  // nonlinear step distribution (denser near the start)
  for (int i = 1; i <= STEPS; i++) {
    float f = (float(i) - 0.5 + jit) / float(STEPS);
    float t = tMax * f * f;
    vec2 s = s0 + dS * t;
    float rz = 1.0 / mix(k0, k1, t);        // ray view depth (positive)
    float sz = linZ(s);
    float dz = rz - sz;
    float thick = max(0.35, rz * 0.035) + abs(rz - 1.0 / mix(k0, k1, tPrev));
    if (dz > 0.02 && dz < thick) { hitT = t; break; }
    tPrev = t;
  }
  if (hitT < 0.0 || uHavePrev < 0.5) { fragColor = vec4(0.0); return; }
  // binary refinement
  float a = tPrev, b = hitT;
  for (int i = 0; i < 5; i++) {
    float m = 0.5 * (a + b); vec2 s = s0 + dS * m;
    float rz = 1.0 / mix(k0, k1, m);
    if (rz > linZ(s)) b = m; else a = m;
  }
  vec2 hs = s0 + dS * b;
  vec3 hv = vpos(hs);
  // --- hit validation
  float rzH = 1.0 / mix(k0, k1, b);
  if (abs(rzH - (-hv.z)) > max(0.35, rzH * 0.03)) { fragColor = vec4(0.0); return; }         // thickness at refined hit
  if (abs(dot(hv - P, N)) < 0.25 + 0.01 * length(hv - P)) { fragColor = vec4(0.0); return; } // self-plane (grazing streaks)
  vec2 hp = 1.0 / uRes;
  vec3 hx = vpos(hs + vec2(hp.x, 0.0)) - hv, hy = vpos(hs + vec2(0.0, hp.y)) - hv;
  vec3 NH = normalize(cross(hx, hy)); if (dot(NH, hv) > 0.0) NH = -NH;
  float facing = clamp(-dot(NH, R) * 4.0, 0.0, 1.0);                                         // back-facing hits invalid
  vec3 hw = (uCamWorld * vec4(hv, 1.0)).xyz;
  vec4 pc = uPrevViewProj * vec4(hw, 1.0);
  vec2 puv = pc.xy / pc.w * 0.5 + 0.5;
  if (pc.w <= 0.0 || any(lessThan(puv, vec2(0.002))) || any(greaterThan(puv, vec2(0.998)))) { fragColor = vec4(0.0); return; }
  if (length((puv - hs) * uRes) > 0.08 * uRes.x) { fragColor = vec4(0.0); return; }           // implausible reprojection
  vec3 hit = texture(uPrev, puv).rgb;
  // firefly / blow-out guard: never more than a few times brighter than the env reflection it replaces
  float le = dot(env, vec3(0.2126, 0.7152, 0.0722)), lh = dot(hit, vec3(0.2126, 0.7152, 0.0722));
  hit *= min(1.0, (le * 3.0 + uFloor) / max(lh, 1e-4)); // (night r12) uFloor 0.5 by day, ~0.06 at night: half-res mirrored headlights / lamps were bright blocky patches on the wet road (the city-light specular already draws their real reflection)
  // confidence: screen edges, rays toward the camera, grazing incidence (depth normals unreliable), distance
  vec2 e = smoothstep(0.0, 0.1, hs) * smoothstep(1.0, 0.9, hs);
  float graze = smoothstep(0.02, 0.12, -dot(V, N));
  float conf = e.x * e.y * smoothstep(0.7, 0.2, R.z) * facing * graze * (1.0 - smoothstep(0.6, 1.0, b / max(tMax, 1e-4)) * step(0.999, tMax));
  fragColor = vec4((hit - env) * conf, conf);
}`,We=`precision highp float;
precision highp sampler2DShadow;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uDepth;
uniform mat4 uCamWorld;
uniform vec3 uCamPos, uCamFwd;
uniform vec2 uRes;
uniform float uFrame;
uniform sampler2DShadow uSM0, uSM1, uSM2, uSM3;
uniform mat4 uSMat[4];
uniform vec4 uSplits;
uniform float uDensity, uHeightFall, uMaxT, uStrength;
__SHADER_INJECT_0__ __SHADER_INJECT_1__ float vis(vec3 p, float vz) {
vec4 sc;
if(vz < uSplits.x) {
sc = uSMat[0] * vec4(p, 1.0);
return textureLod(uSM0, sc.xyz, 0.0);
}
#if NC > 1
if(vz < uSplits.y) {
sc = uSMat[1] * vec4(p, 1.0);
return textureLod(uSM1, sc.xyz, 0.0);
}
#endif
#if NC > 2
if(vz < uSplits.z) {
sc = uSMat[2] * vec4(p, 1.0);
return textureLod(uSM2, sc.xyz, 0.0);
}
#endif
#if NC > 3
sc = uSMat[3] * vec4(p, 1.0);
if(all(greaterThan(sc.xyz, vec3(0.0))) && all(lessThan(sc.xyz, vec3(1.0)))) return textureLod(uSM3, sc.xyz, 0.0);
#endif
return 1.0;
}
void main() {
  // nearest-depth of the 2x2 footprint keeps foreground silhouettes clean for the bilateral upsample
vec2 px = 1.0 / uRes;
float d = texture(uDepth, vUv).r;
vec3 vd = viewDirFromUv(vUv);
vec3 dir = normalize((uCamWorld * vec4(vd, 0.0)).xyz);
float dist = isSky(d) ? 1e5 : length(viewPosFromDepth(vUv, d));
float tEnd = min(dist, uMaxT);
float cosF = max(dot(dir, uCamFwd), 1e-3);
float jit = ign(gl_FragCoord.xy + uFrame * 7.137);
float mu = dot(dir, uSunDir);
float ph = phaseHG(mu, 0.62) * 0.8 + phaseHG(mu, - 0.2) * 0.2;
float acc = 0.0;
float od = 0.0;
float dt = tEnd / float(STEPS);
for(int i = 0;
i < STEPS;
i ++) {
float t = (float(i) + jit) * dt;
vec3 p = uCamPos + dir * t;
float sig = uDensity * exp(- max(p.y, 0.0) * uHeightFall);
float v = vis(p, t * cosF);
acc += v * sig * exp(- od) * dt;
od += sig * dt;
}
vec3 L = uSunColor * ph * acc * uStrength;
fragColor = vec4(L, isSky(d) ? 1e5 : dist);
}
`,Ge=`precision highp float;
precision highp int;
precision highp usampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uDepth;
uniform mat4 uCamWorld;
uniform vec3 uCamPos;
uniform float uFrame;
uniform float uDensity, uHeightFall, uMaxT, uStrength, uG;
__SHADER_INJECT_0__ __SHADER_INJECT_1__ float phaseHG2(float mu, float g) {
float g2 = g * g;
return (1.0 - g2) / (12.566 * pow(max(1.0 + g2 - 2.0 * g * mu, 1e-4), 1.5));
}
// light li's factors (cone x window x emitter cosine) at point p, and the phase toward it
float lightShape(vec4 a, vec4 b, vec4 c, vec4 d, float type, vec3 p, vec3 dir, out float ph) {
vec3 L = a.xyz - p;
float d2 = dot(L, L);
float x = d2 / (a.w * a.w);
if(x >= 1.0) {
ph = 0.0;
return 0.0;
}
float win = 1.0 - x * x;
win *= win;
vec3 Ld = L * inversesqrt(max(d2, 1e-6));
ph = phaseHG2(dot(Ld, dir), uG) * 0.7 + 0.3 * 0.0796;
if(type > 1.5) return win * max(dot(- Ld, c.xyz), 0.0);          // rect: emitter cosine (area folded into the colour)
if(type > 0.5) return win * smoothstep(c.w, d.w, dot(- Ld, c.xyz)); // spot cone
return win;
}
void main() {
float dd = texture(uDepth, vUv).r;
vec3 vd = viewDirFromUv(vUv);
vec3 dir = normalize((uCamWorld * vec4(vd, 0.0)).xyz);
float dist = isSky(dd) ? 1e5 : length(viewPosFromDepth(vUv, dd));
float tEnd = min(dist, uMaxT);
vec3 acc = vec3(0.0);
for(int sI = 0;
sI < NSEG;
sI ++) {
float s0 = float(sI) / float(NSEG), s1 = float(sI + 1) / float(NSEG);
float t0 = tEnd * s0 * s0, t1 = tEnd * s1 * s1;
vec3 pm = uCamPos + dir * (0.5 * (t0 + t1));
float sig = uDensity * exp(- max(pm.y, 0.0) * uHeightFall);
int bx, by;
uvec4 h0;
int n = cityLCell(pm, bx, by, h0);
for(int j = 0;
j < VSLOTS;
j ++) {
if(j >= n) break;
int li = cityLIndex(j, bx, by, h0);
vec4 a = cityLTex(li, 0);
vec3 lo = a.xyz - uCamPos;
float tc = dot(lo, dir);
      // skip lights whose range sphere misses this segment
float tcl = clamp(tc, t0, t1);
vec3 pc = uCamPos + dir * tcl;
if(dot(a.xyz - pc, a.xyz - pc) > a.w * a.w) continue;
vec4 b = cityLTex(li, 1);
float vol = fract(b.w);
if(vol <= 0.02) continue;
vec4 c = cityLTex(li, 2), d = cityLTex(li, 3);
float type = floor(b.w);
      // (night r11) point / spot haze core capped at a lamp head (0.9 m): headlights carry a 3.5 m diffuse softness
      // radius, which as the haze core made a 3-4 m glare ball in front of every car facing the camera (street view);
      // pk keeps the peak brightness, the glow is just compact
float rc = min(d.x, 0.9), core = type > 1.5 ? c.w * d.w : rc * rc + 0.25; // rect: its half-size as the soft core
float pk = type > 1.5 ? 1.0 : sqrt(core / (d.x * d.x + 0.25));
float h2 = max(dot(lo, lo) - tc * tc, 0.0) + core, h = sqrt(h2);
float I = pk * (atan((t1 - tc) / h) - atan((t0 - tc) / h)) / h;
if(I <= 0.0) continue;
      // shape at the closest point of the segment and at the segment middle (the cone of a spot is crossed smoothly)
float ph0, ph1;
float sh = 0.6 * lightShape(a, b, c, d, type, pc, dir, ph0) + 0.4 * lightShape(a, b, c, d, type, pm, dir, ph1);
float ph = 0.6 * ph0 + 0.4 * ph1;
vec3 col = b.rgb * (type > 1.5 ? 4.0 * c.w * d.w : 1.0);
acc += col * (vol * I * sh * ph * sig);
}
}
fragColor = vec4(acc * uStrength * cityL.misc.x * cityLEdge(uCamPos), isSky(dd) ? 1e5 : dist);
}`,Ke=`precision highp float;
precision highp sampler2DShadow;
in vec2 vUv;
out vec4 fragColor;
uniform float uAbs, uAbsK;
uniform sampler2D uDepth, uPrevRad;
uniform mat4 uProj, uCamWorld, uPrevViewProj;
uniform vec2 uRes;
uniform float uFrame, uEnvI, uHavePrev, uStrength;
uniform vec3 uAmbBounce;
uniform sampler2DShadow uSM0, uSM1, uSM2, uSM3;
uniform mat4 uSMat[4];
uniform vec4 uSplits;
__SHADER_INJECT_0__ __SHADER_INJECT_1__
#define saturate(a) clamp(a, 0.0, 1.0)
uniform sampler2D envMap;
__SHADER_INJECT_2__ float linZ(vec2 uv) {
float d = textureLod(uDepth, uv, 0.0).r;
return isSky(d) ? 1e7 : - viewPosFromDepth(uv, d).z;
}
vec3 vpos(vec2 uv) {
return viewPosFromDepth(uv, textureLod(uDepth, uv, 0.0).r);
}
float sunVis(vec3 p, float vz) {
vec4 sc;
if(vz < uSplits.x) {
sc = uSMat[0] * vec4(p, 1.0);
return textureLod(uSM0, sc.xyz, 0.0);
}
#if NC > 1
if(vz < uSplits.y) {
sc = uSMat[1] * vec4(p, 1.0);
return textureLod(uSM1, sc.xyz, 0.0);
}
#endif
#if NC > 2
if(vz < uSplits.z) {
sc = uSMat[2] * vec4(p, 1.0);
return textureLod(uSM2, sc.xyz, 0.0);
}
#endif
#if NC > 3
sc = uSMat[3] * vec4(p, 1.0);
if(all(greaterThan(sc.xyz, vec3(0.0))) && all(lessThan(sc.xyz, vec3(1.0)))) return textureLod(uSM3, sc.xyz, 0.0);
#endif
return 1.0;
}
void main() {
vec2 px = 1.0 / uRes;
int k = int(uFrame) & 3;
vec2 fp = floor(vUv * uRes * 0.5) * 2.0 + vec2(float(k & 1), float(k >> 1)) + 0.5;
vec2 uv = fp * px;
float d0 = texture(uDepth, uv).r;
if(isSky(d0) || uHavePrev < 0.5) {
fragColor = vec4(0.0, 0.0, 0.0, 1e5);
return;
}
vec3 P = viewPosFromDepth(uv, d0);
float dist = length(P);
if(dist > 1500.0) {
fragColor = vec4(0.0, 0.0, 0.0, dist);
return;
}
vec3 pr = vpos(uv + vec2(px.x, 0.0)), pl = vpos(uv - vec2(px.x, 0.0));
vec3 pu = vpos(uv + vec2(0.0, px.y)), pd = vpos(uv - vec2(0.0, px.y));
vec3 dx = abs(pr.z - P.z) < abs(P.z - pl.z) ? pr - P : P - pl;
vec3 dy = abs(pu.z - P.z) < abs(P.z - pd.z) ? pu - P : P - pd;
vec3 N = normalize(cross(dx, dy));
if(dot(N, P) > 0.0) N = - N;
  // tangent frame
vec3 T = normalize(abs(N.y) < 0.9 ? cross(N, vec3(0.0, 1.0, 0.0)) : cross(N, vec3(1.0, 0.0, 0.0)));
vec3 B = cross(N, T);
float jit = ign(gl_FragCoord.xy + uFrame * 5.588);
float jit2 = ign(gl_FragCoord.yx * 1.37 + uFrame * 3.17);
float R = clamp(dist * 0.06, 4.0, 40.0); // gather radius (m): local bounce near, block-scale bounce far
vec3 acc = vec3(0.0);
for(int i = 0;
i < DIRS;
i ++) {
    // cosine-weighted hemisphere (stratified spiral, rotated per pixel / frame)
float u1 = (float(i) + jit) / float(DIRS);
float phi = 6.2831853 * (float(i) * 0.618034 + jit2);
float r = sqrt(u1);
vec3 dir = T * (r * cos(phi)) + B * (r * sin(phi)) + N * sqrt(max(1.0 - u1, 0.0));
for(int s = 1;
s <= STEPS;
s ++) {
float f = (float(s) - 0.5 * jit) / float(STEPS);
float t = max(R * f * f, 0.25);
vec3 S = P + N * 0.08 + dir * t;
if(S.z > - 0.1) break;
vec4 h = uProj * vec4(S, 1.0);
vec2 su = h.xy / h.w * 0.5 + 0.5;
if(any(lessThan(su, vec2(0.0))) || any(greaterThan(su, vec2(1.0)))) break;
float sz = linZ(su);
float dz = - S.z - sz;
if(dz > 0.05 && dz < max(1.5, t * 0.8)) {
vec3 hv = vpos(su);
vec3 hw = (uCamWorld * vec4(hv, 1.0)).xyz;
vec4 pc = uPrevViewProj * vec4(hw, 1.0);
vec2 puv = pc.xy / pc.w * 0.5 + 0.5;
if(pc.w > 0.0 && all(greaterThan(puv, vec2(0.0))) && all(lessThan(puv, vec2(1.0)))) {
vec3 L = textureLod(uPrevRad, puv, 0.0).rgb;
L *= min(1.0, 8.0 / max(dot(L, vec3(0.2126, 0.7152, 0.0722)), 1e-4));
acc += L;
}
break;
}
}
}
vec3 Egi = 3.14159265 * acc / float(DIRS);
  // irradiance this pixel already receives: sun (real shadow maps) + sky fill + the analytic bounce approximation
vec3 Pw = (uCamWorld * vec4(P, 1.0)).xyz;
vec3 Nw = normalize((uCamWorld * vec4(N, 0.0)).xyz);
float ndl = max(dot(Nw, uSunDir), 0.0);
float vis = ndl > 0.0 ? sunVis(Pw + Nw * 0.25 + uSunDir * 0.1, - P.z) : 0.0;
vec3 Eamb = 3.14159265 * textureCubeUV(envMap, Nw, 1.0).rgb * uEnvI + uAmbBounce;
float Ed = dot(uSunColor * ndl * vis + Eamb, vec3(0.2126, 0.7152, 0.0722));
vec3 ratio = Egi * uStrength / max(Ed, 1e-3);
ratio = min(ratio, vec3(1.6));
  // (night) emissive bounce: lit windows, screens, signs, neon, headlights light the surfaces around them. At night the
  // pixel's own irradiance is ~0, so the ratio form cannot add light; output the absolute irradiance instead (composite
  // adds it with an albedo proxy)
vec3 gAbs = Egi * uAbsK;
gAbs *= 0.9 / (0.9 + max(gAbs.r, max(gAbs.g, gAbs.b))); // (r10) soft cap: colour bleed kept, no amber wash
fragColor = vec4(mix(ratio, gAbs, uAbs), dist);
}
`,qe=`precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uDepth, uSky;
uniform vec2 uSunUv;
uniform float uAspect;
__SHADER_INJECT_0__ void main() {
float v = 0.0;
float n = 0.0;
for(int y = - 4;
y <= 4;
y ++) for(int x = - 4;
x <= 4;
x ++) {
vec2 uv = uSunUv + vec2(float(x) / uAspect, float(y)) * 0.0022;
float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
float s = isSky(textureLod(uDepth, uv, 0.0).r) ? textureLod(uSky, uv, 0.0).a : 0.0;
v += s * inside;
n += 1.0;
}
fragColor = vec4(v / n, 0.0, 0.0, 1.0);
}
`,Je=`precision highp float;
precision highp sampler3D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uColor, uDepth, uSky, uSceneA, uSSR, uShafts;
uniform sampler2D uCVol;
uniform float uCVolOn;
uniform vec2 uQuarterPx; // (night)
uniform sampler2D uGI;
uniform float uGIOn, uGIAbs, uGIAlb; // (lighting2 r1) SSGI
uniform vec3 uMoonDir;
uniform float uMoonK; // (daynight)
uniform vec3 uNightHaze, uNightHazeHi;
uniform float uNightFog; // (night)
uniform vec3 uGlowCol;
uniform float uGlowH, uGlowK;
uniform vec3 uNightMid, uTsGlow, uNightMidLevel;
// (night r14) path length through an exponential height layer: int_a^b exp(-(y0 + t dy) / H) dt (density 1 at y = 0)
float hazeInt(float y0, float dy, float a, float b, float H) {
  float e0 = exp(-(y0 + a * dy) / H);
  if(abs(dy) < 1e-3)
    return (b - a) * e0;
  return H / dy * (e0 - exp(-(y0 + b * dy) / H));
}
// (foundation agent) projected cloud shadows: the sky's cumulus coverage field sampled where the sun ray from a surface
// point crosses the cloud layer (same noise / coverage as sky.ts cloudDensity, lower cloud band)
uniform sampler3D uNoise;
uniform float uCloudCoverage, uCloudBottom, uCloudTop, uCloudShadow, uCloudScale;
uniform vec3 uCloudOffset;
uniform mat4 uCamWorld;
uniform vec3 uCamPos;
uniform vec2 uPx, uHalfPx;
uniform float uFogDensity, uFogFalloff, uFogSun, uFogStart, uSSROn, uShaftOn;
uniform vec3 uFogTint;
__SHADER_INJECT_0__ __SHADER_INJECT_1__ vec3 fogColor(vec3 dir, float sunVis) {
  // (atmosphere r2) looking down from altitude the haze in-scatter picks up more of the blue sky above (not the pale
  // horizon), and it warms toward the sun (forward Mie)
vec3 c = skyLUT(normalize(vec3(dir.x, max(dir.y * 0.3, 0.012) + 0.05 * clamp(- dir.y * 2.0, 0.0, 1.0), dir.z))) * uFogTint;
float mu = dot(dir, uSunDir);
c *= mix(vec3(1.0), vec3(1.1, 1.0, 0.86), smoothstep(0.2, 0.95, mu) * 0.6);
c += uSunColor * phaseHG(mu, 0.7) * uFogSun * 0.05 * sunVis;
  // (night) the night haze is lit by the city below (light pollution), not by the black sky: a purple-grey veil,
  // brighter / warmer toward the horizon and the street glow, cooler and dimmer looking up (refs/night esb + haze)
if(uNightFog > 0.0) c = mix(c, mix(uNightHaze, uNightHazeHi, smoothstep(- 0.05, 0.35, dir.y)), uNightFog);
return c;
}
float cloudShadowAt(vec3 wp) {
if(uSunDir.y < 0.06 || uCloudShadow <= 0.0) return 0.0;
vec3 p = wp * 0.001;
float sh = 0.0;
for(int k = 0;
k < 2;
k ++) {
float hf = k == 0 ? 0.08 : 0.22;
float h = mix(uCloudBottom, uCloudTop, hf);
float t = (h - p.y) / uSunDir.y;
vec3 q = vec3(p.x + uSunDir.x * t, RG + h, p.z + uSunDir.z * t) + uCloudOffset;
    // This loop can continue based on per-pixel coverage, so use explicit LOD for the non-mipmapped noise volume.
float wx = textureLod(uNoise, vec3(q.xz * 0.018, 0.31), 0.0).r;
float wy = textureLod(uNoise, vec3(q.xz * 0.05 + 0.5, 0.71), 0.0).r;
float cov = clamp(uCloudCoverage * (0.55 + 0.8 * smoothstep(0.1, 0.8, wx)) * (0.8 + 0.4 * wy), 0.0, 1.0);
if(cov < 0.02) continue;
vec4 nb = textureLod(uNoise, q * vec3(uCloudScale, 0.2, uCloudScale), 0.0); // (atmosphere r1) same shape as sky.ts cloudDensity
float base = clamp((nb.r + (1.0 - (nb.g * 0.625 + nb.b * 0.25 + nb.a * 0.125)) * 0.6) / (1.0 + (1.0 - (nb.g * 0.625 + nb.b * 0.25 + nb.a * 0.125)) * 0.6), 0.0, 1.0);
float top = mix(0.35, 1.0, cov);
float grad = smoothstep(0.0, 0.07, hf) * (1.0 - smoothstep(top * 0.4, top, hf));
float d = (base * grad - (1.0 - cov)) / max(cov, 1e-3);
sh = max(sh, smoothstep(0.0, 0.3, d));
}
return sh * uCloudShadow * smoothstep(0.06, 0.2, uSunDir.y);
}
// depth-aware upsample of a half-res buffer whose alpha holds linear distance
vec3 upsampleHalf(sampler2D tex, vec2 uv, float dist, vec2 hp) {
vec2 base = (floor(uv / hp - 0.5) + 0.5) * hp;
vec2 f = (uv - base) / hp;
vec3 acc = vec3(0.0);
float ws = 0.0;
for(int j = 0;
j < 2;
j ++) for(int i = 0;
i < 2;
i ++) {
vec2 o = vec2(float(i), float(j));
vec4 s = textureLod(tex, base + o * hp, 0.0);
float bw = (i == 0 ? 1.0 - f.x : f.x) * (j == 0 ? 1.0 - f.y : f.y);
float dw = 1.0 / (1e-3 + abs(s.a - dist) / max(dist, 1.0) * 20.0);
float w = bw * dw + 1e-5;
acc += s.rgb * w;
ws += w;
}
return acc / ws;
}
vec3 upsampleShafts(vec2 uv, float dist) {
return upsampleHalf(uShafts, uv, dist, uHalfPx);
}
// (lighting2 r1) depth-aware 3x3 blur-upsample of the half-res SSGI ratio (a = distance)
vec3 upsampleGI(vec2 uv, float dist) {
vec3 acc = vec3(0.0);
float ws = 0.0;
for(int j = - 1;
j <= 1;
j ++) for(int i = - 1;
i <= 1;
i ++) {
vec4 s = textureLod(uGI, uv + vec2(float(i), float(j)) * uHalfPx * 1.5, 0.0);
float w = exp(- abs(s.a - dist) / max(dist, 1.0) * 30.0) * (i == 0 && j == 0 ? 2.0 : 1.0) + 1e-5;
acc += s.rgb * w;
ws += w;
}
return acc / ws;
}
void main() {
float d = texture(uDepth, vUv).r;
vec3 vd = viewDirFromUv(vUv);
vec3 dir = normalize((uCamWorld * vec4(vd, 0.0)).xyz);
if(isSky(d)) {
vec4 s = texture(uSky, vUv);
vec3 c = s.rgb;
    // sun disk with limb darkening, occluded by clouds (s.a = cloud transmittance)
float ct = dot(dir, uSunDir);
float ang = acos(clamp(ct, - 1.0, 1.0));
float R = 0.0052;
if(ang < R * 1.5) {
float x = clamp(ang / R, 0.0, 1.0);
float limb = 1.0 - 0.6 * (1.0 - sqrt(max(1.0 - x * x, 0.0)));
float disk = 1.0 - smoothstep(0.85, 1.0, ang / R);
c += uSunColor * 90.0 * limb * disk * s.a;
}
if(uMoonK > 0.0) { // (daynight) moon disc: mottled maria, soft halo (bloom picks it up at night exposure)
float ma = acos(clamp(dot(dir, uMoonDir), - 1.0, 1.0));
float Rm = 0.0078;
if(ma < Rm * 12.0) {
vec3 mt = normalize(cross(uMoonDir, vec3(0.0, 1.0, 0.0)) + 1e-5);
vec3 mb = cross(mt, uMoonDir);
vec2 mq = vec2(dot(dir - uMoonDir, mt), dot(dir - uMoonDir, mb)) / Rm;
float maria = 0.72 + 0.28 * smoothstep(0.1, 0.5, length(mq - vec2(0.3, 0.25))) * smoothstep(0.05, 0.35, length(mq + vec2(0.35, - 0.1)));
float mdisk = 1.0 - smoothstep(0.88, 1.0, ma / Rm);
c += (vec3(0.9, 0.92, 1.0) * 1.8 * maria * mdisk + vec3(0.45, 0.55, 0.8) * 0.05 * exp(- ma / Rm * 0.9)) * uMoonK * s.a;
}
}
if(uShaftOn > 0.5) c += upsampleShafts(vUv, 1e5);
if(uCVolOn > 0.5) c += upsampleHalf(uCVol, vUv, 1e5, uQuarterPx);
fragColor = vec4(c, 1.0);
return;
}
vec3 col = texture(uColor, vUv).rgb;
if(uGIOn > 0.5) {
float gd = length(viewPosFromDepth(vUv, d));
vec3 gi = upsampleGI(vUv, gd);
col = mix(col * (1.0 + gi), col + gi * uGIAlb, uGIAbs); // (night) additive emissive bounce (albedo proxy)
}
if(uSSROn > 0.5) {
float w = texture(uSceneA, vUv).a - 1.0;
if(w > 0.01) {
vec3 r = vec3(0.0);
r += texture(uSSR, vUv + uHalfPx * vec2(- 0.5, - 0.5)).rgb;
r += texture(uSSR, vUv + uHalfPx * vec2(0.5, - 0.5)).rgb;
r += texture(uSSR, vUv + uHalfPx * vec2(- 0.5, 0.5)).rgb;
r += texture(uSSR, vUv + uHalfPx * vec2(0.5, 0.5)).rgb;
col = max(col + w * r * 0.25, vec3(0.0));
      // reflection floor: glossy glass never collapses to black when it reflects a shadowed street / SSR miss.
      // Stylised like the refs: at least ~60% of the (horizon-ish) sky radiance times the Fresnel weight.
vec3 skyH = skyLUT(normalize(vec3(dir.x, 0.12, dir.z)));
col = max(col, w * mix(skyH * 0.35, (uNightHaze * 1.1 + uGlowCol * 0.7) * smoothstep(0.25, 0.6, w), uNightFog)); // only true mirrors (puddles, glass), not glossy paint stripes // (night) SSR misses on wet ground mirror the light-polluted street haze, not a black sky (critic r1: puddles = dark holes)
}
}
vec3 pv = viewPosFromDepth(vUv, d);
float dist = length(pv);
  // (foundation agent) cloud shadows darken the lit scene before the aerial perspective (so haze stays bright)
if(dist < 20000.0) col *= 1.0 - cloudShadowAt(uCamPos + dir * dist) * (1.0 - smoothstep(9000.0, 20000.0, dist));
float dd = max(dist - uFogStart, 0.0);
float h0 = uCamPos.y;
float k = uFogFalloff;
float ry = dir.y;
float od;
float a = uFogDensity * exp(- k * max(h0, 0.0));
if(abs(ry * k * dd) < 1e-3) od = a * dd;
else od = a * (1.0 - exp(- k * ry * dd)) / (k * ry);
  // (atmosphere r2) tighter distance curve: the near / mid range (< ~400 m) keeps its saturation and contrast, the
  // 1-4 km band hazes faster (mid-distance tower clusters get aerial perspective), and the optical depth saturates
  // softly so far silhouettes never vanish into a uniform white wall (critic: 'milky at 500 m', 'flat white band')
od *= mix(0.45, 1.3, smoothstep(150.0, 2600.0, dist)); // (lighting2 r2) 0.3 -> 0.45: street-level haze down the avenues
od = od / (1.0 + od * 0.22);
vec3 T = exp(- od * vec3(0.86, 1.0, 1.16));
  // (foundation agent) the horizon skirt (water.ts, ~140 km) is fully in-scattered even for level rays from altitude,
  // where the height-falloff optical depth stays small -> no dark line on the geometric horizon
T *= 1.0 - smoothstep(25000.0, 60000.0, dist);
vec3 fogC = fogColor(dir, uShaftOn > 0.5 ? 0.35 : 1.0);
  // (foundation agent) far-field in-scatter converges to the untinted horizon sky: the fogged hinterland meets the sky
  // without a darker seam at the horizon (the tint only deepens the near/mid-distance haze)
  // (round 4) converge later: the near / mid distance keeps the blue-grey tinted in-scatter (graded aerial perspective
  // instead of a milky-white wall), only the far hinterland / horizon skirt melts into the horizon sky
fogC = mix(fogC, skyLUT(normalize(vec3(dir.x, 0.012, dir.z))), smoothstep(9000.0, 45000.0, dist));
if(uNightFog > 0.0) fogC = mix(fogC, uNightMid, uNightFog * smoothstep(120.0, 350.0, dist) * (1.0 - smoothstep(900.0, 2200.0, dist))); // (night r6) moonlit blue atmosphere in the 150-900 m band (rooftop_haze ref), purple light-pollution haze beyond
col = col * T + fogC * (1.0 - T);
if(uShaftOn > 0.5) col += upsampleShafts(vUv, dist);
if(uCVolOn > 0.5) col += upsampleHalf(uCVol, vUv, dist, uQuarterPx);
  // (night) street-level glow: the low haze layer (y < uGlowH) in the street canyons scatters the lamp / shop / car
  // light, so from above the avenues read as warm glowing lines and at street level distant blocks sit in a warm veil
if(uNightFog > 0.0) {
    // (night r7) moonlit blue atmosphere: additive in-scatter in the 150 m - 2 km band (lifts the dark city between the
    // avenues to a deep blue like the rooftop_haze ref; a tint of the thin fog alone could not lift the blacks)
float bandA = (1.0 - exp(- dist * 0.0011)) * smoothstep(120.0, 350.0, dist) * (1.0 - smoothstep(1800.0, 3500.0, dist));
col += mix(uNightMidLevel, uNightMid, smoothstep(0.25, 0.6, - dir.y)) * bandA * 0.45 * uNightFog; // (night r8) blue when looking down (rooftop_haze ref), grey-violet near level (esb ref)
    // (night r7) Times Square: the air between the towers glows with the screens (ray segment inside the square's box)
{
      // (night r14) no 90 m ceiling (a flat lid over the square seen while swinging): the glow thins out with height (H 70 m)
vec3 bmin = vec3(- 80.0, 0.0, - 245.0), bmax = vec3(82.0, 400.0, - 78.0);
vec3 inv = 1.0 / (dir + vec3(1e-6));
vec3 t0 = (bmin - uCamPos) * inv, t1 = (bmax - uCamPos) * inv;
vec3 tn = min(t0, t1), tf = max(t0, t1);
float ta = max(max(tn.x, tn.y), max(tn.z, 0.0)), tb = min(min(tf.x, tf.y), min(tf.z, min(dist, 3000.0)));
if(tb > ta) col += uTsGlow * (1.0 - exp(- hazeInt(uCamPos.y, dir.y, ta, tb, 70.0) * 0.0084)) * uNightFog;
}
    // (night r14) user: 'a clear separation of the street level lights and the darkness above, like a plane'. The warm
    // street glow was a slab (full density below uGlowH = 22 m, none above): its top read as a flat lid across the
    // facades. Now an exponential layer (density 1 at the street, 1/e at uGlowH * 1.5 = 33 m): same glow in the canyons,
    // fading out gradually up the walls
float y0 = uCamPos.y, dl = min(dist, 700.0); // (night r4) only the street canyons near the view glow: grazing rays to far water / shores crossed km of the layer (critic: water glows brighter than the city)
float lin = hazeInt(max(y0, 0.0), dir.y, 0.0, dl, uGlowH * 1.5);
col += uGlowCol * (1.0 - exp(- lin * uGlowK)) * uNightFog * mix(0.6, 1.0, smoothstep(20.0, 120.0, y0)); // (night r7) street-level cameras: less amber canyon tint (critic: warm dusk, ref is blue night)
}
fragColor = vec4(col, 1.0);
}
`,Ye=`precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uCurrent, uHistory, uDepth;
uniform mat4 uCamWorld, uPrevViewProj;
uniform vec2 uRes, uJitter;
uniform float uBlend, uCharBlend, uSkyBlend, uSkyBlendCap, uReset;
uniform sampler2D uMask;
uniform float uMaskOn;
uniform mat4 uObjDelta;
uniform mat4 uProjInvU;
__SHADER_INJECT_0__ __SHADER_INJECT_1__
// view position with the UN-jittered projection (history lives in the unjittered frame)
vec3 viewPosU(vec2 uv, float d) {
float z = uReversed > 0.5 ? d : d * 2.0 - 1.0;
vec4 p = uProjInvU * vec4(uv * 2.0 - 1.0, z, 1.0);
return p.xyz / p.w;
}
vec3 toYC(vec3 c) {
return vec3(0.25 * c.r + 0.5 * c.g + 0.25 * c.b, 0.5 * c.r - 0.5 * c.b, - 0.25 * c.r + 0.5 * c.g - 0.25 * c.b);
}
vec3 fromYC(vec3 y) {
return vec3(y.x + y.y - y.z, y.x + y.z, y.x - y.y - y.z);
}
vec3 tm(vec3 c) {
return c / (1.0 + luma(c));
}
vec3 itm(vec3 c) {
return c / max(1.0 - luma(c), 1e-4);
}
vec3 sampleCR(sampler2D t, vec2 uv) {
vec2 sp = uv * uRes;
vec2 tc = floor(sp - 0.5) + 0.5;
vec2 f = sp - tc;
vec2 w0 = f * (- 0.5 + f * (1.0 - 0.5 * f));
vec2 w1 = 1.0 + f * f * (- 2.5 + 1.5 * f);
vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
vec2 w3 = f * f * (- 0.5 + 0.5 * f);
vec2 w12 = w1 + w2;
vec2 tc0 = (tc - 1.0) / uRes;
vec2 tc3 = (tc + 2.0) / uRes;
vec2 tc12 = (tc + w2 / w12) / uRes;
vec3 r = texture(t, vec2(tc12.x, tc0.y)).rgb * (w12.x * w0.y) + texture(t, vec2(tc0.x, tc12.y)).rgb * (w0.x * w12.y) + texture(t, vec2(tc12.x, tc12.y)).rgb * (w12.x * w12.y) + texture(t, vec2(tc3.x, tc12.y)).rgb * (w3.x * w12.y) + texture(t, vec2(tc12.x, tc3.y)).rgb * (w12.x * w3.y);
float ws = w12.x * w0.y + w0.x * w12.y + w12.x * w12.y + w3.x * w12.y + w12.x * w3.y;
return max(r / ws, 0.0);
}
void main() {
vec2 px = 1.0 / uRes;
  // un-jitter the current frame: content that belongs at vUv was rendered at vUv + uJitter (uv units)
vec3 cur = sampleCR(uCurrent, vUv + uJitter);
vec3 m1 = vec3(0.0), m2 = vec3(0.0);
float closest = uReversed > 0.5 ? 0.0 : 1.0;
vec2 cuv = vUv;
vec3 cmin = vec3(1e9), cmax = vec3(- 1e9);
for(int y = - 1;
y <= 1;
y ++) for(int x = - 1;
x <= 1;
x ++) {
vec2 o = vec2(x, y) * px;
vec3 c = toYC(tm(textureLod(uCurrent, vUv + o, 0.0).rgb));
m1 += c;
m2 += c * c;
cmin = min(cmin, c);
cmax = max(cmax, c);
float d = textureLod(uDepth, vUv + o, 0.0).r;
bool nearer = uReversed > 0.5 ? d > closest : d < closest;
if(nearer) {
closest = d;
cuv = vUv + o;
}
}
vec3 world;
if(isSky(closest)) world = (uCamWorld * vec4(viewDirFromUv(vUv) * 1e5, 1.0)).xyz;
else world = (uCamWorld * vec4(viewPosU(vUv, closest), 1.0)).xyz;
  // character pixel? (mask depth == scene depth) -> reproject with the character's rigid motion
bool isChar = false;
if(uMaskOn > 0.5) {
float md = texture(uMask, cuv).r;
if(! isSky(md)) {
float zs = - viewPosFromDepth(cuv, closest).z, zm = - viewPosFromDepth(cuv, md).z;
isChar = abs(zs - zm) < 0.03 + 0.004 * zs;
}
}
if(isChar) world = (uObjDelta * vec4(world, 1.0)).xyz;
vec4 pc = uPrevViewProj * vec4(world, 1.0);
vec2 puv = pc.xy / pc.w * 0.5 + 0.5;
if(uReset > 0.5 || any(lessThan(puv, vec2(0.0))) || any(greaterThan(puv, vec2(1.0))) || pc.w <= 0.0) {
fragColor = vec4(cur, 1.0);
return;
}
vec3 hist = toYC(tm(sampleCR(uHistory, puv)));
vec3 mu = m1 / 9.0;
vec3 sig = sqrt(max(m2 / 9.0 - mu * mu, 0.0));
float vel = length((puv - vUv) * uRes);
  // static / slow: wide box (no edge flicker from the neighbourhood itself moving with the jitter); fast: tight
float g = vel < 0.5 ? 1.9 : mix(1.4, 0.9, clamp((vel - 0.5) / 8.0, 0.0, 1.0));
if(isChar) g = min(g, 1.0);
vec3 bmin = max(cmin, mu - g * sig), bmax = min(cmax, mu + g * sig);
  // clip toward the mean
vec3 pc0 = 0.5 * (bmax + bmin), e = 0.5 * (bmax - bmin) + 1e-5;
vec3 v = hist - pc0;
vec3 a = abs(v / e);
float ma = max(a.x, max(a.y, a.z));
if(ma > 1.0) hist = pc0 + v / ma;
vec3 curT = toYC(tm(cur));
float blend = mix(uBlend, 0.25, clamp(vel / 20.0, 0.0, 1.0));
  // where the history had to be clipped hard (edge flips between frames) trust the stable history a bit more
if(vel < 0.5) blend *= mix(1.0, 0.6, clamp(ma - 1.0, 0.0, 1.0));
if(isChar) blend = max(blend, uCharBlend);
if(isSky(closest)) blend = uSkyBlendCap > 0.5 ? min(blend, uSkyBlend) : max(blend, uSkyBlend);
vec3 res = mix(hist, curT, blend);
fragColor = vec4(itm(fromYC(res)), 1.0);
}
`,Xe=`uniform float uFocus, uBokeh, uMaxCoc, uFar;
float cocAt(float d, vec2 uv) { // signed CoC in half-res pixels (background side scaled by uFar)
  if(isSky(d))
    return min(uMaxCoc, uBokeh * 0.5 * uFar);
  float z = -viewPosFromDepth(uv, d).z;
  float c = uBokeh * 0.5 * (z - uFocus) / max(z, 1e-3);
  if(c > 0.0)
    c *= uFar;
  return clamp(c, -uMaxCoc, uMaxCoc);
}`,Ze=`precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uColor, uDepth;
uniform vec2 uPx;
__SHADER_INJECT_0__ __SHADER_INJECT_1__ __SHADER_INJECT_2__ void main() {
vec2 o[4] = vec2[](vec2(- 0.5, - 0.5), vec2(0.5, - 0.5), vec2(- 0.5, 0.5), vec2(0.5, 0.5));
vec3 c = vec3(0.0);
float ws = 0.0;
float cmin = 1e9, cmax = - 1e9;
for(int i = 0;
i < 4;
i ++) {
vec2 uv = vUv + o[i] * uPx;
vec3 s = texture(uColor, uv).rgb;
float w = 1.0 / (1.0 + luma(s));
c += s * w;
ws += w;
float k = cocAt(texture(uDepth, uv).r, uv);
cmin = min(cmin, k);
cmax = max(cmax, k);
}
float coc = cmin < 0.0 ? cmin : cmax;
fragColor = vec4(c / ws, coc);
}`,Qe=`precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSrc;
uniform vec2 uKernel[TAPS];
uniform float uMaxCoc;
uniform vec2 uPx;
float weigh(float coc, float r) {
  return clamp((coc - r + 2.0) / 2.0, 0.0, 1.0);
}
void main() {
  vec4 ctr = texture(uSrc, vUv);
  vec3 bg = vec3(0.0), fg = vec3(0.0);
  float bw = 0.0, fw = 0.0;
  for(int i = 0; i < TAPS; i++) {
    vec2 o = uKernel[i] * uMaxCoc;
    float r = length(o);
    vec4 s = textureLod(uSrc, vUv + o * uPx, 0.0);
    float w = weigh(max(0.0, min(s.a, ctr.a)), r);
    bg += s.rgb * w;
    bw += w;
    float f = weigh(-s.a, r);
    fg += s.rgb * f;
    fw += f;
  }
  bg /= bw + (bw == 0.0 ? 1.0 : 0.0);
  fg /= fw + (fw == 0.0 ? 1.0 : 0.0);
  float a = min(1.0, fw * 3.14159 / float(TAPS));
  fragColor = vec4(mix(bg, fg, a), a);
}
`,$e=`precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSrc;
uniform vec2 uPx;
void main() {
  vec4 o = vec4(uPx.xy, -uPx.xy) * 0.5;
  fragColor = 0.25 * (texture(uSrc, vUv + o.xy) + texture(uSrc, vUv + o.zy) + texture(uSrc, vUv + o.xw) + texture(uSrc, vUv + o.zw));
}`,et=`precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uColor, uDof, uDepth;
__SHADER_INJECT_0__ __SHADER_INJECT_1__ void main() {
vec3 src = texture(uColor, vUv).rgb;
vec4 dof = texture(uDof, vUv);
float coc = cocAt(texture(uDepth, vUv).r, vUv);
float s = smoothstep(0.25, 1.2, abs(coc));
vec3 c = mix(src, dof.rgb, s + dof.a - s * dof.a);
fragColor = vec4(c, 1.0);
}`,tt=`precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uColor, uDepth;
uniform mat4 uCamWorld, uPrevViewProj;
uniform float uScale, uMask, uFrame;
uniform vec2 uRes;
__SHADER_INJECT_0__ float linZ(vec2 uv) {
float d = textureLod(uDepth, uv, 0.0).r;
return isSky(d) ? 1e6 : - viewPosFromDepth(uv, d).z;
}
void main() {
float d = texture(uDepth, vUv).r;
vec3 world = isSky(d) ? (uCamWorld * vec4(viewDirFromUv(vUv) * 1e5, 1.0)).xyz : (uCamWorld * vec4(viewPosFromDepth(vUv, d), 1.0)).xyz;
vec4 pc = uPrevViewProj * vec4(world, 1.0);
vec2 puv = pc.xy / pc.w * 0.5 + 0.5;
vec2 v = (vUv - puv) * uScale;
float z = isSky(d) ? 1e6 : - viewPosFromDepth(vUv, d).z;
v *= smoothstep(uMask, uMask + 5.0, z); // near-field (foliage beside the lens, the character) stays crisp
float lp = length(v * uRes);
float maxL = 0.1 * uRes.x; // (user r10e: room for the High / Very High settings)
if(lp > maxL) v *= maxL / lp;
vec3 c = texture(uColor, vUv).rgb;
if(lp < 0.5) {
fragColor = vec4(c, 1.0);
return;
}
float j = ign(gl_FragCoord.xy + uFrame * 5.588238) - 0.5;
vec3 acc = c;
float ws = 1.0;
int n = lp > 20.0 ? SAMPLES * 2 : SAMPLES; // long streaks: more taps (no discrete ghost copies)
for(int i = 0;
i < SAMPLES * 2;
i ++) {
if(i >= n) break;
float t = (float(i) + 0.5 + j) / float(n) - 0.5;
vec2 uv = vUv + v * t;
float sz = linZ(uv);
float w = smoothstep(uMask, uMask + 5.0, sz); // don't smear the sharp foreground (character) over bg
acc += textureLod(uColor, uv, 0.0).rgb * w;
ws += w;
}
fragColor = vec4(acc / ws, 1.0);
}`,nt=`precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSrc;
uniform vec2 uPx;
uniform float uFirst;
__SHADER_INJECT_0__ vec3 s(vec2 o) {
return texture(uSrc, vUv + o * uPx).rgb;
}
vec3 kw(vec3 a, vec3 b, vec3 c, vec3 d) {
if(uFirst < 0.5) return (a + b + c + d) * 0.25;
float wa = 1.0 / (1.0 + luma(a)), wb = 1.0 / (1.0 + luma(b)), wc = 1.0 / (1.0 + luma(c)), wd = 1.0 / (1.0 + luma(d));
return (a * wa + b * wb + c * wc + d * wd) / (wa + wb + wc + wd);
}
void main() {
vec3 A = s(vec2(- 2, - 2)), B = s(vec2(0, - 2)), C = s(vec2(2, - 2)), D = s(vec2(- 1, - 1)), E = s(vec2(1, - 1));
vec3 F = s(vec2(- 2, 0)), G = s(vec2(0, 0)), H_ = s(vec2(2, 0)), I = s(vec2(- 1, 1)), J = s(vec2(1, 1));
vec3 K = s(vec2(- 2, 2)), L = s(vec2(0, 2)), M = s(vec2(2, 2));
vec3 c = kw(D, E, I, J) * 0.5 + kw(A, B, F, G) * 0.125 + kw(B, C, G, H_) * 0.125 + kw(F, G, K, L) * 0.125 + kw(G, H_, L, M) * 0.125;
float lc = luma(c);
c *= min(1.0, 48.0 / max(lc, 1e-4)); // clamp bloom input (tiny sun glints must not bloom into blobs) (lighting2 r1: 16 -> 48, the sun disk glows)
fragColor = vec4(c, 1.0);
}`,rt=`precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSrc, uCur;
uniform vec2 uPx;
uniform float uRadius;
uniform float uT, uK, uThrSrc;
vec3 thr(vec3 c) {
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float s = clamp(l - uT + uK, 0.0, 2.0 * uK);
  s = s * s / (4.0 * uK + 1e-4);
  return c * max(s, l - uT) / max(l, 1e-4);
}
vec3 src(vec2 uv) {
  vec3 c = texture(uSrc, uv).rgb;
  return uThrSrc > 0.5 ? thr(c) : c;
}
void main() {
  vec4 d = vec4(uPx, -uPx.x, 0.0) * uRadius;
  vec3 s = src(vUv - d.xy) + 2.0 * src(vUv - d.wy) + src(vUv - d.zy) + 2.0 * src(vUv + d.zw) + 4.0 * src(vUv) + 2.0 * src(vUv + d.xw) + src(vUv + d.zy) + 2.0 * src(vUv + d.wy) + src(vUv + d.xy);
  fragColor = vec4(thr(texture(uCur, vUv).rgb) + s / 16.0, 1.0);
}`,it=`precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSrc, uPrev;
uniform float uRate, uReset;
// weighted MEDIAN of log2 luminance (32-bin histogram over [-12, 4] EV): robust to a bright sky or a dark glass wall
void main() {
  float h[32];
  for(int i = 0; i < 32; i++) h[i] = 0.0;
  float ws = 0.0;
  for(int y = 0; y < 24; y++) for(int x = 0; x < 40; x++) {
      vec2 uv = (vec2(float(x), float(y)) + 0.5) / vec2(40.0, 24.0);
      vec3 c = textureLod(uSrc, uv, 0.0).rgb;
      float l = clamp(log2(max(dot(c, vec3(0.2126, 0.7152, 0.0722)), 1e-5)), -12.0, 3.99);
      vec2 d = (uv - 0.5) * vec2(1.6, 1.8);
      float w = exp(-dot(d, d) * 2.2) + 0.15;                 // centre weighted (subject), some frame-wide influence
      h[int((l + 12.0) * 2.0)] += w;
      ws += w;
    }
  // average of the 40..60th percentile band (smooth, stable)
  float cum = 0.0, acc = 0.0, aw = 0.0;
  for(int i = 0; i < 32; i++) {
    float lo = cum / ws;
    cum += h[i];
    float hi = cum / ws;
    float ov = max(0.0, min(hi, 0.6) - max(lo, 0.4));
    acc += ov * (float(i) + 0.5) * 0.5;
    aw += ov;
  }
  float cur = acc / max(aw, 1e-5) - 12.0;
  float prev = texture(uPrev, vec2(0.5)).r;
  float a = uReset > 0.5 ? 1.0 : uRate;
  fragColor = vec4(mix(prev, cur, a), cur, 0.0, 1.0);
}
`,at=`precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uColor, uBloom;
uniform vec2 uPx;
uniform sampler2D uStreakSrc, uStreakLo;
uniform float uStreak, uStreakT; // (night)
uniform float uExposure, uBloomStr, uSat, uContrast, uVignette, uCA, uSharpen, uGrain, uFrame, uAspect;
uniform vec3 uLift, uGamma, uGain, uWB;
uniform float uPivot, uSatKnee;
uniform sampler2D uSunVis;
uniform vec2 uSunUv;
uniform float uFlare;
uniform vec3 uSunCol;
uniform sampler2D uAE;
uniform float uAEOn, uAEKey, uAEStr, uAERange;
uniform vec3 uSplitSh, uSplitHi;
uniform float uSplitBal;
uniform float uWarmGuard;
uniform sampler2D uDepthS;
uniform mat4 uProjInvS;
uniform float uRevS;
bool isSkyD(float d) {
  return uRevS > 0.5 ? d <= 0.0 : d >= 1.0;
}
vec3 viewPosFromDepthS(vec2 uv, float d) {
  float z = uRevS > 0.5 ? d : d * 2.0 - 1.0;
  vec4 p = uProjInvS * vec4(uv * 2.0 - 1.0, z, 1.0);
  return p.xyz / p.w;
}
float viewDepthAt(vec2 uv) {
  float d = texture(uDepthS, uv).r;
  return isSkyD(d) ? 1e4 : -viewPosFromDepthS(uv, d).z;
}
// subtle camera-lens response to the sun: soft glare, a few chromatic ghosts mirrored through the centre, halo ring
vec3 lensFlare(vec2 uv) {
  float vis = texture(uSunVis, vec2(0.5)).r * uFlare;
  if(vis < 1e-3)
    return vec3(0.0);
  vec2 asp = vec2(uAspect, 1.0);
  vec2 sp = uSunUv;
  vec2 toC = vec2(0.5) - sp;
  vec3 acc = vec3(0.0);
  // glare around the sun (wide, soft)
  float ds = length((uv - sp) * asp);
  acc += vec3(1.0, 0.86, 0.66) * (0.022 / (ds * ds * 40.0 + 0.02)) * 0.02;
  // (lighting2 r1) physically-motivated veiling glare: a tight hot core + a wide warm halo (sun glow of the golden-hour ref)
  acc += vec3(1.0, 0.86, 0.66) * (0.22 * exp(-ds * 13.0) + 0.05 * exp(-ds * 3.5)); // (lighting2 r2) brighter core + wider warm halo (golden-hour ref sun bloom)
  // ghosts
  const float gpos[5] = float[](0.55, 0.9, 1.25, 1.6, 2.1);
  const float gsize[5] = float[](0.035, 0.018, 0.06, 0.025, 0.09);
  const vec3 gcol[5] = vec3[](vec3(0.45, 0.6, 1.0), vec3(1.0, 0.7, 0.35), vec3(0.4, 1.0, 0.6), vec3(1.0, 0.45, 0.3), vec3(0.5, 0.55, 1.0));
  for(int i = 0; i < 5; i++) {
    vec2 gp = sp + toC * gpos[i];
    float r = length((uv - gp) * asp) / gsize[i];
    float disk = smoothstep(1.0, 0.75, r) * (0.55 + 0.45 * smoothstep(0.2, 1.0, r));
    acc += gcol[i] * disk * 0.012;
  }
  // halo ring centred on the screen, brightest on the sun side
  vec2 hv = (uv - vec2(0.5)) * asp;
  float hr = length(hv);
  float ring = exp(-pow((hr - 0.42) / 0.018, 2.0)) * max(dot(normalize(hv + 1e-5), normalize(-toC * asp + 1e-5)), 0.0);
  acc += vec3(0.55, 0.7, 1.0) * ring * 0.01;
  // fade as the sun leaves the frame
  vec2 e = smoothstep(-0.25, 0.1, sp) * smoothstep(1.25, 0.9, sp);
  return acc * vis * e.x * e.y * uSunCol;
}
__SHADER_INJECT_0__ float ignf(vec2 p) {
return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}
// ACES fitted (Stephen Hill)
const mat3 ACESIn = mat3(0.59719, 0.07600, 0.02840, 0.35458, 0.90834, 0.13383, 0.04823, 0.01566, 0.83777);
const mat3 ACESOut = mat3(1.60475, - 0.10208, - 0.00327, - 0.53108, 1.10813, - 0.07276, - 0.07367, - 0.00605, 1.07602);
vec3 RRTAndODTFit(vec3 v) {
vec3 a = v * (v + 0.0245786) - 0.000090537;
vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
return a / b;
}
// (lighting2 r1) softer toe: the fitted RRT crushes the darks ~6x at 0.02 (shade went black while sunlit faces were fine);
// a smooth max with a linear segment (slope uToe) keeps shaded walls / streets readable, mid-tones and highlights unchanged
uniform float uToe;
uniform float uRain;
vec3 aces(vec3 c) {
c = ACESIn * c;
vec3 r = RRTAndODTFit(c);
vec3 l = c * uToe;
r = 0.5 * (r + l + sqrt((r - l) * (r - l) + 0.01 * (r + l) * (r + l)));
return clamp(ACESOut * r, 0.0, 1.0);
}
vec3 tmS(vec3 c) {
return c / (1.0 + luma(c));
}
vec3 itmS(vec3 c) {
return c / max(1.0 - luma(c), 1e-4);
}
void main() {
vec2 d = vUv - 0.5;
  // sharpen (in a compressed domain to avoid halos on HDR edges)
vec3 c0 = tmS(texture(uColor, vUv).rgb);
vec3 n = tmS(texture(uColor, vUv + vec2(0.0, uPx.y)).rgb), s = tmS(texture(uColor, vUv - vec2(0.0, uPx.y)).rgb);
vec3 e = tmS(texture(uColor, vUv + vec2(uPx.x, 0.0)).rgb), w = tmS(texture(uColor, vUv - vec2(uPx.x, 0.0)).rgb);
  // luma-only adaptive sharpen (no chroma fringes / colour noise), weaker with distance (TAA already resolves far detail)
float l0 = luma(c0), ln = luma(n), ls = luma(s), le_ = luma(e), lw = luma(w);
float mnl = min(l0, min(min(ln, ls), min(le_, lw))), mxl = max(l0, max(max(ln, ls), max(le_, lw)));
float amp = sqrt(clamp(min(mnl, 1.0 - mxl) / max(mxl, 1e-4), 0.0, 1.0));
float dz = texture(uDepthS, vUv).r;
float zv = isSkyD(dz) ? 1e4 : - viewPosFromDepthS(vUv, dz).z;
float distK = mix(1.0, 0.35, smoothstep(15.0, 120.0, zv));
  // Do not sharpen across foreground silhouettes: the luma kernel otherwise makes a bright fringe on the character.
float zn = viewDepthAt(vUv + vec2(0.0, uPx.y)), zs = viewDepthAt(vUv - vec2(0.0, uPx.y));
float ze = viewDepthAt(vUv + vec2(uPx.x, 0.0)), zw = viewDepthAt(vUv - vec2(uPx.x, 0.0));
float depthEdge = max(max(abs(zv - zn), abs(zv - zs)), max(abs(zv - ze), abs(zv - zw)));
float edgeLo = max(0.035, zv * 0.02);
float edgeHi = max(edgeLo + 0.04, zv * 0.06);
float edgeSharpen = 1.0 - smoothstep(edgeLo, edgeHi, depthEdge);
float dl = (4.0 * l0 - ln - ls - le_ - lw) * uSharpen * amp * 0.25 * distK * edgeSharpen;
vec3 c = itmS(clamp(c0 * (1.0 + dl / max(l0, 1e-4)), 0.0, 0.999));
  // chromatic aberration (radial, very subtle)
vec2 cao = d * dot(d, d) * uCA * 4.0 * smoothstep(0.3, 0.7, length(d * vec2(uAspect, 1.0))); // edges only
c.r = mix(c.r, texture(uColor, vUv - cao).r, 0.85);
c.b = mix(c.b, texture(uColor, vUv + cao).b, 0.85);
  // bloom (energy-conserving mix)
vec3 b = texture(uBloom, vUv).rgb;
c += b * uBloomStr; // (lighting2 r1) additive thresholded bloom
  // (night) anamorphic streak (street ref: thin cool horizontal streaks through lamp heads / headlights): the half-res
  // radiance above a high threshold, smeared horizontally with an exponential falloff
if(uStreak > 0.0) {
vec3 st = vec3(0.0);
for(int k = 1;
k <= 12;
k ++) {
float o = float(k * k) * 0.0012, w = exp(- float(k) * 0.28);
      // (night r11) point sources only: minus 1.5x the 1/16-res local mean, so big bright screens (whose mean ~ their
      // radiance) don't smear a long pink bar across the frame; lamp heads / headlights (a few px) keep their streak
vec2 ua = vUv + vec2(o, 0.0), ub = vUv - vec2(o, 0.0);
vec3 a = textureLod(uStreakSrc, ua, 0.0).rgb - 1.5 * textureLod(uStreakLo, ua, 0.0).rgb, bb = textureLod(uStreakSrc, ub, 0.0).rgb - 1.5 * textureLod(uStreakLo, ub, 0.0).rgb;
st += (max(a - uStreakT, 0.0) + max(bb - uStreakT, 0.0)) * w;
}
c += dot(st, vec3(0.3, 0.5, 0.2)) * vec3(0.45, 0.62, 1.0) * uStreak;
}
c += lensFlare(vUv);
float ev = 0.0;
if(uAEOn > 0.5) ev = clamp(- (texture(uAE, vec2(0.5)).r - uAEKey) * uAEStr, - uAERange, uAERange);
c *= uExposure * exp2(ev) * uWB;
  // vignette
vec2 dv = d * vec2(uAspect, 1.0);
c *= mix(1.0, 1.0 - smoothstep(0.25, 1.05, length(dv)), uVignette);
c = aces(c);
{ // (atmosphere r2) split toning: cool shade, warm sunlit highlights (keeps luma)
float sl = luma(c);
vec3 tt = mix(uSplitSh, uSplitHi, smoothstep(uSplitBal * 0.25, uSplitBal * 2.2, sl));
tt = mix(tt, uSplitHi, uWarmGuard * smoothstep(0.02, 0.2, (c.r - c.b) / max(sl, 1e-3))); // (night r9) warm lamp / sodium / shop light keeps its warmth: no cool shift on warm pixels (critic: lavender lamp pools)
tt /= dot(tt, vec3(0.2126, 0.7152, 0.0722));
c *= tt;
}
if(uRain > 0.0) { // (lighting2 r3) overcast preset: cheap screen-space rain streaks (2 layers, slanted, falling)
float rr = 0.0, tt = uFrame / 60.0;
for(int i = 0;
i < 2;
i ++) {
float sc = i == 0 ? 1.0 : 1.9;
vec2 p = vec2(vUv.x * uAspect * 70.0 * sc + vUv.y * 5.0 * sc, vUv.y * 2.2 * sc + tt * (3.2 + 1.4 * float(i)));
float col = floor(p.x), h = fract(sin(col * 91.3 + float(i) * 17.0) * 43758.5);
float y = fract(p.y + h * 10.0 + tt * h);
float st = smoothstep(0.0, 0.04, y) * smoothstep(0.3 + 0.2 * h, 0.04, y) * step(0.5, h);
st *= smoothstep(0.35, 0.0, abs(fract(p.x) - 0.5));
rr += st * (i == 0 ? 0.7 : 0.4);
}
c = mix(c, vec3(0.72, 0.75, 0.8), clamp(rr * 0.11 * uRain, 0.0, 1.0));
}
  // grade (display-linear): lift/gamma/gain, contrast, saturation
c = max(uGain * (c + uLift * (1.0 - c)), 0.0);
c = pow(max(c, 0.0), 1.0 / uGamma);
float l = luma(c);
c = mix(vec3(l), c, uSat);
c = clamp(c, 0.0, 1.0);
{ // chroma soft-clip
float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
float st = (mx - mn) / max(mx, 1e-4);
if(st > uSatKnee) {
float t = uSatKnee + (1.0 - uSatKnee) * (1.0 - exp(- (st - uSatKnee) / (1.0 - uSatKnee) * 1.6)) / 1.6 * 1.25;
float k = clamp(t / st, 0.0, 1.0);
c = mx - (mx - c) * k;
}
}
vec3 lc = log2(c + 1e-4);
c = exp2((lc - log2(uPivot)) * uContrast + log2(uPivot)) - 1e-4;
  // highlight shoulder: roll off above 0.72 instead of clipping (sky, white paint, speculars keep detail)
  // shoulder from 0.8 that still reaches 1.0 (~1% of pixels: speculars, white paint, sun-lit clouds may clip like the refs)
  // (lighting2 r3) day refs (measured): p95 0.44-0.77, p99 <= 0.83 display-linear, < 1 % clipped; ours had p95 0.85-0.9
  // and 2-11 % clipped (sunlit cream walls, sky). Softer shoulder from 0.62 (asymptote ~0.99): sunlit faces stay bright
  // + warm with texture instead of white
vec3 hs = 0.62 + 0.37 * (1.0 - exp(- max(c - 0.62, 0.0) / 0.37));
c = mix(c, hs, step(0.62, c));
vec3 o = linearToSRGB(clamp(c, 0.0, 1.0));
  // grain + dither
float g = ignf(gl_FragCoord.xy + fract(uFrame * 0.618) * 113.0) - 0.5;
o += g * (1.0 / 255.0 + uGrain * (1.0 - o) * 0.5);
fragColor = vec4(o, 1.0);
}
`,ot=`precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSrc;
uniform float uScale, uMode;
void main() {
  vec4 t = texture(uSrc, vUv);
  vec3 c = uMode > 0.5 ? vec3(t.a - 1.0) : t.rgb;
  c = abs(c) * uScale;
  fragColor = vec4(pow(c / (1.0 + c), vec3(1.0 / 2.2)), 1.0);
}`,st=`// common shader sections.

// @section depthReconstruction

uniform mat4 uProjInv;
uniform float uReversed; // 1.0 when renderer uses reversed depth (EXT_clip_control, [0,1] NDC z)
bool isSky(float d) {
  return uReversed > 0.5 ? d <= 0.0 : d >= 1.0;
}
vec3 viewPosFromDepth(vec2 uv, float d) {
  float z = uReversed > 0.5 ? d : d * 2.0 - 1.0;
  vec4 p = uProjInv * vec4(uv * 2.0 - 1.0, z, 1.0);
  return p.xyz / p.w;
}
vec3 viewDirFromUv(vec2 uv) {
  vec4 p = uProjInv * vec4(uv * 2.0 - 1.0, 0.5, 1.0);
  return normalize(p.xyz / p.w);
}
float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

// @section colorSpaceConversion

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}
vec3 linearToSRGB(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}
`,ct=`out vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}`,lt=G(()=>st),ut=new D;ut.setAttribute(`position`,new o([-1,-1,0,3,-1,0,-1,3,0],3)),ut.setAttribute(`uv`,new o([0,0,2,0,0,2],2));var dt=new r(-1,1,1,-1,0,1),J=ct,Y=class e{static registeredPasses=[];static camera=dt;material;mesh;uniforms;constructor({uniforms:t={},fragmentShader:n,defines:r={},blending:a=0,name:o=`pass`}){e.registeredPasses.push(this),this.material=new N({name:o,uniforms:t,defines:r,glslVersion:i,vertexShader:J,fragmentShader:n,depthTest:!1,depthWrite:!1,blending:a,toneMapped:!1}),this.mesh=new te(ut,this.material),this.mesh.frustumCulled=!1,this.uniforms=this.material.uniforms}render(e,t=null){e.setRenderTarget(t??null),e.render(this.mesh,dt)}};function X(e,t,n={}){let r=new S(Math.max(1,e|0),Math.max(1,t|0),{type:n.type??1016,format:n.format??1023,minFilter:n.filter??1006,magFilter:n.filter??1006,depthBuffer:n.depthBuffer??!1,stencilBuffer:!1,generateMipmaps:!1,wrapS:m,wrapT:m,colorSpace:``,count:n.count??1});return n.depthTexture&&(r.depthTexture=n.depthTexture),r}var ft=()=>lt.depthReconstruction,pt=()=>lt.colorSpaceConversion;function mt(e,t){let n=1,r=0;for(;e>0;)n/=t,r+=e%t*n,e=Math.floor(e/t);return r}var ht=`// sky shader sections.

// @section commonAtmosphere

uniform sampler2D uSkyLUT;
uniform vec3 uSunDir;
uniform vec3 uSunColor;   // sun illuminance (scaled) at ground
uniform float uSkyScale;
uniform vec3 uSkyTint;    // day: 1; night: dim blue (moonlit sky)
uniform vec3 uSkyGlow;    // additive horizon glow (city light pollution at night / warm dusk band)
uniform vec3 uHzK;        // (atmosphere r1) horizon-band radiance multiplier
uniform vec4 uSunGlow;    // (lighting2 r2) golden aureole: rgb warm tint, w strength (0 = off)
uniform float uOvercast;  // (lighting2 r4) overcast deck: 0 = clear .. 1 = fully grey, low, heavy sky
__SHADER_INJECT_0__ vec3 skyLUT(vec3 dir) {
float el = asin(clamp(dir.y, - 1.0, 1.0));
vec2 dh = dir.xz;
vec2 sh = uSunDir.xz;
float ca = dot(normalize(dh + vec2(1e-6, 0.0)), normalize(sh + vec2(1e-6, 0.0)));
float u = acos(clamp(ca, - 1.0, 1.0)) / PI_;
float v = 0.5 + 0.5 * sign(el) * sqrt(abs(el) / (PI_ * 0.5));
u = clamp(u, 0.5 / float(__SHADER_INJECT_1__), 1.0 - 0.5 / float(__SHADER_INJECT_2__));
// (foundation agent, round 10) horizon deepening: the LUT's last few degrees saturate to a near-white band that
// everything far (fog in-scatter, sky, horizon skirt) converges to -> critic: 'over-bright white haze band'. A soft
// blue-grey multiplier on the low sky (applied here, so fog / sky / reflections all converge to the same value)
// (atmosphere r1) stronger: the refs' horizon haze is a light grey-blue a little DARKER than the upper sky, never
// the brightest thing in frame (measured: refs 07 / 09 horizon ~0.55-0.68 sRGB vs our old ~0.95 cream-white band)
vec3 hzK = mix(vec3(uHzK), vec3(1.0), smoothstep(0.0, 0.3, abs(dir.y)));
vec3 sc = texture(uSkyLUT, vec2(u, v)).rgb * uSkyScale * uSkyTint * hzK + uSkyGlow * exp(- max(dir.y, 0.0) * 7.0);
// (lighting2 r2) golden-hour aureole: warm forward-scattering haze around a low sun (the single-scattering LUT stays
// blue-white there). De-saturates the blue toward the sun and adds a warm glow, strongest near the horizon. Fog,
// env reflections and cloud ambient all read skyLUT, so the golden haze carries through the whole frame.
if(uSunGlow.w > 0.0) {
float mu = max(dot(dir, uSunDir), 0.0);
float hzw = exp(- max(dir.y, 0.0) * 2.2);
float lobe = (0.7 * pow(mu, 5.0) + 0.45 * pow(mu, 1.5) * hzw + 0.18 * hzw + 1.6 * pow(mu, 48.0)) * uSunGlow.w;
float sl = dot(sc, vec3(0.2126, 0.7152, 0.0722));
sc = mix(sc, vec3(sl), clamp(lobe * 0.9, 0.0, 0.9)) + uSunGlow.rgb * sl * lobe;
}
if(uOvercast > 0.0) { // (lighting2 r4) director: 'overcast still shows a clear BLUE sky'. A grey storm deck: the sky
// (and so fog in-scatter, env reflections and cloud ambient) becomes a flat grey, brightest at the zenith
float ol = dot(sc, vec3(0.2126, 0.7152, 0.0722));
vec3 deck = vec3(0.86, 0.88, 0.91) * ol * mix(0.55, 1.0, smoothstep(- 0.05, 0.6, dir.y));
sc = mix(sc, deck, uOvercast);
}
return sc;
}

// @section clouds

uniform sampler3D uNoise;
uniform float uCloudCoverage, uCloudDensity, uCloudBottom, uCloudTop, uCloudFade;
uniform vec3 uCloudOffset;
uniform float uSkyline;
// (atmosphere r1) cloud look controls: sun-scatter gain, ambient gain, base-noise scale (1/km), cirrus amount
uniform float uCloudSun, uCloudAmb, uCloudScale, uCirrus, uCloudErode, uCloudDetailScale;
uniform float uCloudBaseDark; // (atmosphere r2) 0..1 how much darker the flat cloud bases are than the tops
uniform vec3 uFacadeAlb;
uniform float uNight;
float hash11(float p) {
p = fract(p * .1031);
p *= p + 33.33;
p *= p + p;
return fract(p);
}
float remap(float v, float a, float b, float c, float d) {
return c + (v - a) / (b - a) * (d - c);
}
float cloudDensity(vec3 p, float hf, bool detail) {
vec3 q = p + uCloudOffset;
  // Cloud density is evaluated inside a raymarch that exits at a pixel-dependent point. Explicit level-zero
  // sampling avoids undefined implicit derivatives there; uNoise has no mipmaps, so this matches texture().
float wx = textureLod(uNoise, vec3(q.xz * 0.018, 0.31), 0.0).r;
float wy = textureLod(uNoise, vec3(q.xz * 0.05 + 0.5, 0.71), 0.0).r;
float cov = clamp(uCloudCoverage * (0.55 + 0.8 * smoothstep(0.1, 0.8, wx)) * (0.8 + 0.4 * wy), 0.0, 1.0); // (atmosphere r1: flatter weather mask, clouds everywhere like the refs)
if(cov < 0.02) return 0.0;
vec4 n = textureLod(uNoise, q * vec3(uCloudScale, 0.2, uCloudScale), 0.0);
  // (atmosphere r1) Nubis-style base shape: the perlin-worley eroded by the low-frequency worley fbm -> lumpy cumulus
  // towers instead of smooth blobs
float lf = n.g * 0.625 + n.b * 0.25 + n.a * 0.125;
float base = clamp(remap(n.r, - (1.0 - lf) * 0.6, 1.0, 0.0, 1.0), 0.0, 1.0);
  // cumulus height profile: flat-ish base, rounded tops, taller where coverage is high
float top = mix(0.35, 1.0, cov);
float grad = smoothstep(0.0, 0.07, hf) * (1.0 - smoothstep(top * 0.4, top, hf));
float d = remap(base * grad, 1.0 - cov, 1.0, 0.0, 1.0);
if(d <= 0.0) return 0.0;
if(detail) {
vec4 dn = textureLod(uNoise, q * uCloudDetailScale + vec3(0.0, hf * 0.3, 0.0), 0.0);
float df = dn.g * 0.625 + dn.b * 0.25 + dn.a * 0.125;
df = mix(df, 1.0 - df, clamp(hf * 4.0, 0.0, 1.0));
d = remap(d, df * uCloudErode, 1.0, 0.0, 1.0);
    // (atmosphere r2) second, finer billow octave on the thin outer shell only: cauliflower lumps on the sunlit
    // tops / edges instead of airbrushed blobs (cheap: skipped in the dense core)
if(d > 0.0 && d < 0.45) {
vec4 dn2 = textureLod(uNoise, q * uCloudDetailScale * 3.1 + vec3(0.37, hf * 0.6, 0.11), 0.0);
float df2 = 1.0 - (dn2.g * 0.6 + dn2.b * 0.4);
d = remap(d, df2 * 0.35 * (1.0 - d / 0.45), 1.0, 0.0, 1.0);
}
}
return clamp(d, 0.0, 1.0) * uCloudDensity;
}
float cloudPhase(float mu, float k) {
return mix(phaseHG(mu, 0.78 * k), phaseHG(mu, - 0.25 * k), 0.3) * 4.0 * PI_ * 0.25 + 0.75;
}
// returns premultiplied cloud radiance (rgb) and transmittance (a)
vec4 marchClouds(vec3 camM, vec3 rd, float jitter) {
vec3 ro = vec3(camM.x * 0.001, RG + max(camM.y, 1.0) * 0.001, camM.z * 0.001);
if(rd.y < - 0.03) return vec4(0.0, 0.0, 0.0, 1.0);
if(raySphere(ro, rd, RG).x > 0.0) return vec4(0.0, 0.0, 0.0, 1.0);
float t0 = raySphere(ro, rd, RG + uCloudBottom).y;
float t1 = raySphere(ro, rd, RG + uCloudTop).y;
if(t0 > 160.0) return vec4(0.0, 0.0, 0.0, 1.0);
t1 = min(t1, t0 + 14.0);
float len = t1 - t0;
float dt = len / float(CLOUD_STEPS);
float mu = dot(rd, uSunDir);
vec3 ambTop = skyLUT(normalize(vec3(0.3, 1.0, 0.2))) * 1.1 * uCloudAmb;
vec3 ambBot = skyLUT(normalize(vec3(- 0.9, 0.08, 0.3))) * 0.55 * uCloudAmb;
vec3 L = vec3(0.0);
float T = 1.0;
float tw = 0.0, ws = 0.0;
float t = t0 + dt * jitter;
const float SIGMA = 45.0; // extinction per km at density 1
for(int i = 0;
i < CLOUD_STEPS;
i ++) {
vec3 p = ro + rd * t;
float hf = (length(p) - RG - uCloudBottom) / (uCloudTop - uCloudBottom);
float d = cloudDensity(p, hf, true);
if(d > 0.002) {
float od = 0.0;
float lt = 0.0;
for(int j = 0;
j < CLOUD_LIGHT_STEPS;
j ++) {
float sl = 0.06 * pow(3.0, float(j));
vec3 lp = p + uSunDir * (lt + sl * 0.5);
float lhf = (length(lp) - RG - uCloudBottom) / (uCloudTop - uCloudBottom);
// (atmosphere r3) the first (short) light step sees the detail erosion: the billows self-shadow each other, so
// the cloud has internal lit / shaded lumps instead of one smooth airbrushed gradient
od += cloudDensity(lp, lhf, j == 0) * sl;
lt += sl;
}
// multiple-scattering octaves (Wrenninge)
float ms = 0.0, a = 1.0, b = 1.0, c = 1.0;
for(int k = 0;
k < 3;
k ++) {
ms += a * cloudPhase(mu, c) * exp(- SIGMA * od * b);
a *= 0.5;
b *= 0.4;
c *= 0.5;
} // (atmosphere r2: 0.55/0.35 -> 0.5/0.4, deeper self-shadow)
float powder = 1.0 - 0.55 * exp(- d * 6.0);
vec3 sunL = uSunColor * ms * powder * (0.25 / PI_) * uCloudSun;
// (atmosphere r2) dark flat bases (little skylight reaches the underside, city below is dark), bright tops
vec3 amb = mix(ambBot, ambTop, clamp(hf, 0.0, 1.0)) * mix(1.0, 0.25 + 0.75 * smoothstep(0.0, 0.6, hf), uCloudBaseDark) + uSkyGlow * uNight * 1.1 * (1.0 - clamp(hf, 0.0, 1.0)); // (night) r3: undersides lit by the city, brighter than the sky (critic: dark cloud blobs) // (lighting2 r5) city glow lights the cloud undersides at night (orange underlit deck)
float sig = d * SIGMA;
vec3 S = sunL + amb;
float Ts = exp(- sig * dt);
L += T * S * (1.0 - Ts);
tw += t * T * (1.0 - Ts);
ws += T * (1.0 - Ts);
T *= Ts;
if(T < 0.02) break;
}
t += dt;
}
float tAvg = ws > 0.0 ? tw / ws : t0;
// (atmosphere r1) aerial perspective on the clouds: distant clouds do not vanish (that left a cloudless milky band
// above the horizon), they take on the hazy horizon radiance -- a soft, slightly brighter-than-haze cloud bank
// like the refs; only the very farthest ones dissolve completely
float fade = exp(- tAvg / uCloudFade);
float keep = exp(- tAvg / (uCloudFade * 3.5));
vec3 hzC = skyLUT(normalize(vec3(rd.x, 0.03, rd.z)));
float a = (1.0 - T) * keep;
return vec4(L * fade * keep + hzC * a * (1.0 - fade) * 1.12, 1.0 - a);
}
// (atmosphere r1) high cirrus / cirrostratus veil at ~8 km: one wind-stretched noise layer, thin and bright, sheared
// into streaks (cheap: 2 lookups). Returns premultiplied radiance (rgb) and transmittance (a).
vec4 cirrusLayer(vec3 camM, vec3 rd) {
if(uCirrus <= 0.0 || rd.y < 0.0) return vec4(0.0, 0.0, 0.0, 1.0);
vec3 ro = vec3(camM.x * 0.001, RG + max(camM.y, 1.0) * 0.001, camM.z * 0.001);
float t = raySphere(ro, rd, RG + 8.0).y;
vec3 p = ro + rd * t;
vec2 q = p.xz + uCloudOffset.xz * 0.4;
vec2 w = vec2(q.x * 0.9 + q.y * 0.35, q.y * 0.25 - q.x * 0.1); // wind-stretched (long streaks)
float big = texture(uNoise, vec3(q * 0.006, 0.43)).r;
float n1 = texture(uNoise, vec3(w * 0.035, 0.17)).g;
float n2 = texture(uNoise, vec3(w * 0.11 + n1 * 0.2, 0.61)).b;
float d = smoothstep(0.35, 0.9, big) * smoothstep(0.45, 0.85, n1 * 0.75 + n2 * 0.45) * uCirrus;
d *= smoothstep(0.0, 0.06, rd.y) * exp(- t / 160.0);
float mu = dot(rd, uSunDir);
vec3 c = uSunColor * (0.05 + 0.25 * phaseHG(mu, 0.6)) * 0.55 + skyLUT(vec3(0.0, 1.0, 0.0)) * 1.1;
float a = clamp(d * 0.55, 0.0, 0.6);
return vec4(c * a, 1.0 - a);
}
// Procedural distant skyline (infinitely far city silhouettes), returns elevation of skyline top (radians).
float skylineTop(vec3 dir) {
float az = atan(dir.z, dir.x) + PI_;
float h = 0.0;
for(int o = 0;
o < 3;
o ++) {
float f = 45.0 * pow(2.3, float(o));
float c = floor(az * f);
float r = hash11(c + float(o) * 91.7);
float amp = 0.030 / (1.0 + float(o) * 0.9);
h = max(h, r > 0.25 ? amp * (0.35 + r) : 0.0);
}
float c = floor(az * 22.0);
float r = hash11(c * 3.1 + 7.0);
if(r > 0.82) h = max(h, 0.045 + 0.04 * hash11(c + 1.3));
return h * uSkyline;
}
vec3 skylineColor(vec3 dir, float top, float haze, vec3 facade) {
vec3 horizon = skyLUT(normalize(vec3(dir.x, 0.02, dir.z)));
float el = asin(clamp(dir.y, - 1.0, 1.0));
vec2 hd = normalize(dir.xz + 1e-5);
vec2 sd = normalize(uSunDir.xz + 1e-5);
float lit = clamp(dot(- hd, sd) * 0.8 + 0.3, 0.05, 1.0);
vec3 E = uSunColor * lit * sqrt(max(1.0 - uSunDir.y * uSunDir.y, 0.0)) * 0.5 + horizon * PI_ * 0.5;
vec3 c = facade * E / PI_;
// window rows
float row = fract(el * 900.0);
c *= 0.6 + 0.4 * step(0.45, row);
if(uNight > 0.0) { // lit windows on the distant skyline
float az = atan(dir.z, dir.x);
vec2 cell = floor(vec2(az * 1400.0, el * 900.0));
float r = hash11(cell.x * 1.37 + cell.y * 57.1);
c += vec3(1.0, 0.72, 0.42) * step(0.72, r) * step(0.45, row) * uNight * 0.35 * (0.5 + r);
}
float k = haze * (0.7 + 0.3 * smoothstep(0.0, top + 1e-3, el));
return mix(c, horizon, k);
}
`,gt=`precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform float uSunEl;
uniform float uMie;
uniform float uViewH;
uniform float uMS;
uniform vec3 uGroundAlbedo;
__SHADER_INJECT_0__ vec3 extinctionAt(float h, out vec3 scatR, out float scatM) {
float dr = exp(- h / 8.0), dm = exp(- h / 1.2) * uMie, dO = max(0.0, 1.0 - abs(h - 25.0) / 15.0);
scatR = BETA_R * dr;
scatM = BETA_MS * dm;
return BETA_R * dr + BETA_ME * dm + BETA_O * dO;
}
vec3 sunT(vec3 p, vec3 s) {
if(raySphere(p, s, RG).x > 0.0) return vec3(0.0);
float t = raySphere(p, s, RT).y;
float dt = t / 12.0;
vec3 od = vec3(0.0);
vec3 a;
float b;
for(int i = 0;
i < 12;
i ++) {
vec3 q = p + s * (float(i) + 0.5) * dt;
od += extinctionAt(length(q) - RG, a, b) * dt;
}
return exp(- od);
}
void main() {
float az = vUv.x * PI_;
float v = vUv.y * 2.0 - 1.0;
float el = sign(v) * v * v * PI_ * 0.5;
vec3 rd = vec3(cos(el) * cos(az), sin(el), cos(el) * sin(az));
vec3 sd = vec3(cos(uSunEl), sin(uSunEl), 0.0);
vec3 ro = vec3(0.0, RG + uViewH, 0.0);
float tTop = raySphere(ro, rd, RT).y;
vec2 tg = raySphere(ro, rd, RG);
bool ground = tg.x > 0.0;
float tMax = ground ? tg.x : tTop;
float mu = dot(rd, sd);
float pR = phaseR(mu), pM = phaseCS(mu, 0.8);
const int N = 40;
vec3 L = vec3(0.0), T = vec3(1.0);
float tPrev = 0.0;
for(int i = 0;
i < N;
i ++) {
float f = (float(i) + 1.0) / float(N);
float t = tMax * f * f;
float dt = t - tPrev;
float tm = (t + tPrev) * 0.5;
tPrev = t;
vec3 p = ro + rd * tm;
float h = length(p) - RG;
vec3 sR;
float sM;
vec3 ext = extinctionAt(h, sR, sM);
vec3 st = sunT(p, sd);
vec3 S = st * (sR * pR + sM * pM) + (sR + vec3(sM)) * uMS * (0.25 / PI_) * (0.2 + 0.8 * st);
vec3 Te = exp(- ext * dt);
L += T * S * (1.0 - Te) / max(ext, 1e-7);
T *= Te;
}
if(ground) {
vec3 p = ro + rd * tMax;
vec3 n = normalize(p);
vec3 st = sunT(p, sd);
L += T * uGroundAlbedo / PI_ * (st * max(dot(n, sd), 0.0) + 0.25);
}
fragColor = vec4(L, 1.0);
}`,_t=`precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform float uZ;
uniform vec2 uPW;
vec3 hash33(vec3 p) {
  p = fract(p * vec3(.1031, .1030, .0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}
float worley(vec3 p, float per) {
  vec3 id = floor(p), f = fract(p);
  float md = 1.0;
  for(int x = -1; x <= 1; x++) for(int y = -1; y <= 1; y++) for(int z = -1; z <= 1; z++) {
        vec3 o = vec3(x, y, z);
        vec3 h = hash33(mod(id + o, per) + 0.5);
        vec3 r = o + h - f;
        md = min(md, dot(r, r));
      }
  return 1.0 - sqrt(md);
}
float gnoise(vec3 p, float per) {
  vec3 i = floor(p), f = fract(p);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float n[8];
  for(int k = 0; k < 8; k++) {
    vec3 o = vec3(k & 1, (k >> 1) & 1, (k >> 2) & 1);
    vec3 g = normalize(hash33(mod(i + o, per) + 0.5) * 2.0 - 1.0);
    n[k] = dot(g, f - o);
  }
  return mix(mix(mix(n[0], n[1], u.x), mix(n[2], n[3], u.x), u.y), mix(mix(n[4], n[5], u.x), mix(n[6], n[7], u.x), u.y), u.z);
}
float perlinFbm(vec3 p, float per) {
  float s = 0.0, a = 1.0, w = 0.0;
  for(int i = 0; i < 6; i++) {
    s += gnoise(p, per) * a;
    w += a;
    a *= 0.5;
    p *= 2.0;
    per *= 2.0;
  }
  return s / w * 0.5 + 0.5;
}
float worleyFbm(vec3 p, float per) {
  return worley(p, per) * 0.625 + worley(p * 2.0, per * 2.0) * 0.25 + worley(p * 4.0, per * 4.0) * 0.125;
}
float remap(float v, float a, float b, float c, float d) {
  return c + (v - a) / (b - a) * (d - c);
}
void main() {
  vec3 p = vec3(vUv, uZ);
  float pf = perlinFbm(p * 4.0, 4.0);
  float wf = worleyFbm(p * 4.0, 4.0);
  float pw = (0.6 * pf + 0.4 * wf - uPW.x) / uPW.y;
  fragColor = vec4(clamp(pw, 0.0, 1.0), wf, worleyFbm(p * 8.0, 8.0), worleyFbm(p * 16.0, 16.0));
}`,vt=`precision highp float;
precision highp sampler3D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uDepth;
uniform mat4 uCamWorld;
uniform vec3 uCamPos;
uniform vec2 uFullRes;
uniform float uStars;
__SHADER_INJECT_0__ __SHADER_INJECT_1__ __SHADER_INJECT_2__ vec3 starField(vec3 d) {
  // cube-ish cell hashing on the direction; each cell holds at most one star (smooth gaussian so TAA is stable)
vec3 p = d * 260.0;
vec3 id = floor(p);
vec3 f = fract(p) - 0.5;
float h = hash11(dot(id, vec3(1.0, 57.0, 113.0)));
if(h < 0.93) return vec3(0.0);
vec3 o = vec3(hash11(h * 91.3), hash11(h * 17.9), hash11(h * 43.1)) - 0.5;
float r = length(f - o * 0.6);
float b = exp(- r * r * 90.0) * pow((h - 0.93) / 0.07, 3.0);
return mix(vec3(0.8, 0.85, 1.0), vec3(1.0, 0.85, 0.7), hash11(h * 7.7)) * b * 0.9;
}
void main() {
  // skip texels whose 2x2 (+1 ring) full-res footprint contains no sky
vec2 px = 1.0 / uFullRes;
bool any = false;
for(int y = 0;
y < 4;
y ++) for(int x = 0;
x < 4;
x ++) {
float d = textureLod(uDepth, vUv + (vec2(x, y) - 1.5) * px, 0.0).r;
any = any || isSky(d);
}
if(! any) {
fragColor = vec4(0.0, 0.0, 0.0, 1.0);
return;
}
vec3 vd = viewDirFromUv(vUv);
vec3 dir = normalize((uCamWorld * vec4(vd, 0.0)).xyz);
vec3 sky = skyLUT(dir);
float top = skylineTop(dir);
float el = asin(clamp(dir.y, - 1.0, 1.0));
if(top > 0.0 && el < top) {
fragColor = vec4(skylineColor(dir, top, 0.75, uFacadeAlb), 0.0);
return;
}
  // (foundation agent) skyline off (city world has real geometry to the horizon): the thin sliver between the
  // geometric horizon and the far edge of the world takes the same horizon radiance the fog converges to
if(el < 0.0) {
fragColor = vec4(skyLUT(normalize(vec3(dir.x, 0.012, dir.z))), 1.0);
return;
}
// Use the midpoint of each ray step. Per-pixel noise at half resolution showed up as speckled, crawling cloud edges.
float j = 0.5;
if(uStars > 0.0) sky += starField(dir) * uStars * smoothstep(0.0, 0.15, dir.y);
vec4 ci = cirrusLayer(uCamPos, dir);
sky = sky * ci.a + ci.rgb;
vec4 cl = marchClouds(uCamPos, dir, j);
  // (foundation agent) clouds dissolve into the horizon haze: at grazing angles they are tens of km away, so their
  // aerial perspective converges on the clear-sky horizon radiance the fogged far land also converges to -> no seam
  // (atmosphere r1: marchClouds now does the aerial perspective itself; only the last half degree fades)
float hz = smoothstep(0.0, 0.012, dir.y);
fragColor = vec4(mix(sky, sky * cl.a + cl.rgb, hz), mix(1.0, cl.a * ci.a, hz));
}
`,Z=`out vec3 vDir;
void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,yt=`precision highp float;
precision highp sampler3D;
in vec3 vDir;
out vec4 fragColor;
uniform vec3 uCamPos;
uniform vec3 uGround;
uniform float uEnvSat;
uniform vec3 uEnvFacade;
__SHADER_INJECT_0__ __SHADER_INJECT_1__ void main() {
vec3 dir = normalize(vDir);
vec3 horizon = skyLUT(normalize(vec3(dir.x, 0.02, dir.z)));
float el = asin(clamp(dir.y, - 1.0, 1.0));
vec3 c;
float top = skylineTop(dir) * 1.8 + 0.02;
if(el < top) {
    // city: facades near horizon, ground below
vec3 fac = skylineColor(dir, top, 0.35, uEnvFacade);
float gl = 1.0 - smoothstep(- 0.5, - 0.05, el);
vec3 zen = skyLUT(vec3(0.0, 1.0, 0.0));
vec3 E = uSunColor * max(uSunDir.y, 0.0) * 0.55 + zen * PI_ * 0.5;
vec3 ground = uGround * E / PI_;
c = mix(fac, ground, gl) * 0.68; // (lighting2 r4, vehicles agent) darker city / ground under a bright sky: glossy paint, glass and wet streets show a readable reflected horizon line
} else {
vec3 sky = skyLUT(dir);
vec4 ci = cirrusLayer(uCamPos, dir);
vec4 cl = marchClouds(uCamPos, dir, 0.5);
c = (sky * ci.a + ci.rgb) * cl.a + cl.rgb;
}
float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
fragColor = vec4(mix(vec3(l), c, uEnvSat), 1.0);
}`,bt=`
#define RG 6360.0
#define RT 6460.0
const vec3 BETA_R = vec3(5.802e-3, 13.558e-3, 33.1e-3);
const float BETA_MS = 3.996e-3;
const float BETA_ME = 4.40e-3;
const vec3 BETA_O = vec3(0.650e-3, 1.881e-3, 0.085e-3);
const float PI_ = 3.14159265359;

vec2 raySphere(vec3 ro, vec3 rd, float r) {
  float b = dot(ro, rd);
  float c = dot(ro, ro) - r * r;
  float d = b * b - c;
  if(d < 0.0)
    return vec2(-1.0);
  d = sqrt(d);
  return vec2(-b - d, -b + d);
}
float phaseR(float mu) {
  return 3.0 / (16.0 * PI_) * (1.0 + mu * mu);
}
float phaseHG(float mu, float g) {
  float g2 = g * g;
  return (1.0 - g2) / (4.0 * PI_ * pow(max(1.0 + g2 - 2.0 * g * mu, 1e-4), 1.5));
}
// Cornette-Shanks (better Mie shape)
float phaseCS(float mu, float g) {
  float g2 = g * g;
  return 3.0 / (8.0 * PI_) * (1.0 - g2) * (1.0 + mu * mu) / ((2.0 + g2) * pow(max(1.0 + g2 - 2.0 * g * mu, 1e-4), 1.5));
}
`,xt={RG:6360,RT:6460,betaR:[.005802,.013558,.0331],betaMs:.003996,betaMe:.0044,betaO:[65e-5,.001881,85e-6],HR:8,HM:1.2},St=bt;function Ct(e,t=1,n=.05){let{RG:r,RT:i,betaR:a,betaMe:o,betaO:s,HR:c,HM:l}=xt,u=new M(0,r+n,0),d=new M(Math.cos(e),Math.sin(e),0),f=u.dot(d),p=u.dot(u)-i*i,m=(-f+Math.sqrt(f*f-p))/64,h=[0,0,0],g=new M;for(let e=0;e<64;e++){g.copy(d).multiplyScalar((e+.5)*m).add(u);let n=g.length()-r;if(n<0)return[0,0,0];let i=Math.exp(-n/c),f=Math.exp(-n/l),p=Math.max(0,1-Math.abs(n-25)/15);for(let e=0;e<3;e++)h[e]+=(a[e]*i+o*t*f+s[e]*p)*m}return h.map(e=>Math.exp(-e))}var Q={sampleHeightFraction:.3,minRayY:.035,horizonFadeY:[.08,.25],coverageScale:.75,offsetKm:[3.1,7.7],yUvPerKm:.2,weatherLowScale:.018,weatherMidScale:.05,warpScale:.55,warpAmount:.11,sigmaPerKm:45,thicknessKm:.5,minPathRayY:.25,detail2Scale:3.1,detail2Erode:.35,detail1FadeKm:[12,32],detail1FarKeep:.3,detail2FadeKm:[4,12]};function wt(e,t){return e+(t-e)*Q.sampleHeightFraction}function Tt(e){return e*Q.yUvPerKm}var Et=.37+.3*Q.sampleHeightFraction,Dt=.2+.6*Q.sampleHeightFraction,Ot=(e,t,n)=>Math.min(n,Math.max(t,e)),kt=(e,t,n)=>e+(t-e)*n,$=(e,t)=>e[t];function At(e,t,n){let r=Ot((n-e)/(t-e),0,1);return r*r*(3-2*r)}function jt(e,t){return(e%t+t)%t}function Mt(e,t,n,r){let i=Math.imul(e|0,374761393)+Math.imul(t|0,668265263)+Math.imul(n|0,2147483647)+Math.imul(r|0,1274126177);return i=Math.imul(i^i>>>13,1274126177),i=Math.imul(i^i>>>16,2246822519),i^=i>>>13,(i>>>0)/4294967295}function Nt(e=48){let t=new Uint8Array(e*e*e*4),n=[4,8,16,24],r=n.map((e,t)=>{let n=e*e*e,r=new Float32Array(n),i=new Float32Array(n),a=new Float32Array(n);for(let n=0;n<e;n++)for(let o=0;o<e;o++)for(let s=0;s<e;s++){let c=(n*e+o)*e+s;r[c]=.16+Mt(s,o,n,t*3)*.68,i[c]=.16+Mt(s,o,n,t*3+1)*.68,a[c]=.16+Mt(s,o,n,t*3+2)*.68}return{frequency:e,x:r,y:i,z:a}});for(let i=0;i<e;i++)for(let a=0;a<e;a++)for(let o=0;o<e;o++){let s=(o+.5)/e,c=(a+.5)/e,l=(i+.5)/e,u=((i*e+a)*e+o)*4;for(let e=0;e<n.length;e++){let{frequency:n,x:i,y:a,z:o}=r[e],d=s*n,f=c*n,p=l*n,m=Math.floor(d),h=Math.floor(f),g=Math.floor(p),_=1/0;for(let e=-1;e<=1;e++)for(let t=-1;t<=1;t++)for(let r=-1;r<=1;r++){let s=m+r,c=h+t,l=g+e,u=(jt(l,n)*n+jt(c,n))*n+jt(s,n),v=d-(s+i[u]),ee=f-(c+a[u]),y=p-(l+o[u]),te=v*v+ee*ee+y*y;te<_&&(_=te)}t[u+e]=Math.round(Ot(Math.sqrt(_)/Math.sqrt(3),0,1)*255)}}return t}function Pt(e,t,n,r,i,a=48){let o=e=>{let t=(e-Math.floor(e))*a-.5,n=Math.floor(t);return[jt(n,a),jt(n+1,a),t-n]},[s,c,l]=o(t),[u,d,f]=o(n),[p,m,h]=o(r);for(let t=0;t<4;t++){let n=(n,r,i)=>e[((i*a+r)*a+n)*4+t]/255,r=kt(n(s,u,p),n(c,u,p),l),o=kt(n(s,d,p),n(c,d,p),l),g=kt(n(s,u,m),n(c,u,m),l),_=kt(n(s,d,m),n(c,d,m),l);i[t]=kt(kt(r,o,f),kt(g,_,f),h)}return i}function Ft(e){return Ot(1-e*Math.sqrt(3),0,1)}function It(){return{warp:new Float32Array(4),base:new Float32Array(4),weatherLow:new Float32Array(4),weatherMid:new Float32Array(4),detail:new Float32Array(4),detail2:new Float32Array(4)}}function Lt(e,t,n,r,i,a,o,s=48){let c=Q,l=c.sampleHeightFraction,u=i.layerKm/Math.max(n,c.minRayY),d=t*u+c.offsetKm[0],f=r*u+c.offsetKm[1],p=Tt(i.layerKm),m=d*i.cloudScale,h=f*i.cloudScale;Pt(e,m*c.warpScale+.17,p*c.warpScale+.37,h*c.warpScale+.71,a.warp,s);let g=a.warp;Pt(e,m+($(g,1)-$(g,0))*c.warpAmount,p+($(g,2)-$(g,1))*c.warpAmount,h+($(g,3)-$(g,2))*c.warpAmount,a.base,s);let _=a.base,v=Ft($(_,1))*.625+Ft($(_,2))*.25+Ft($(_,3))*.125,ee=Ot((Ft($(_,0))+(1-v)*.6)/(1+(1-v)*.6),0,1);Pt(e,d*c.weatherLowScale,.31,f*c.weatherLowScale,a.weatherLow,s),Pt(e,d*c.weatherMidScale+.5,.71,f*c.weatherMidScale+.5,a.weatherMid,s);let y=Ot(i.coverage*(.55+.8*At(.1,.8,Ft($(a.weatherLow,0))))*(.8+.4*Ft($(a.weatherMid,0))),0,1),te=.35+.65*y,b=1-At(te*.4,te,l),x=y>.02?Ot((ee*b-(1-y))/Math.max(y,.02),0,1):0,S=1-(1-c.detail1FarKeep)*At(c.detail1FadeKm[0],c.detail1FadeKm[1],u);Pt(e,d*i.detailScale,Et,f*i.detailScale,a.detail,s);let C=a.detail,w=(1-(Ft($(C,1))*.625+Ft($(C,2))*.25+Ft($(C,3))*.125))*i.erode*S;x=Ot((x-w)/(1-w),0,1);let T=1-At(c.detail2FadeKm[0],c.detail2FadeKm[1],u);Pt(e,d*i.detailScale*c.detail2Scale+.37,Dt,f*i.detailScale*c.detail2Scale+.11,a.detail2,s);let E=a.detail2,D=(1-(Ft($(E,1))*.6+Ft($(E,2))*.4))*c.detail2Erode*Math.max(0,1-x/.45)*T;x=Ot((x-D)/(1-D),0,1);let O=c.thicknessKm/Math.max(n,c.minPathRayY),k=x*i.cloudDensity*O*c.sigmaPerKm,A=Math.exp(-u/(i.cloudFade*3.5)),j=At(c.horizonFadeY[0],c.horizonFadeY[1],n);return o.density=x,o.alpha=(1-Math.exp(-k))*A*j,o.fade=Math.exp(-u/i.cloudFade),o.distanceKm=u,o}var Rt=G(()=>ht),zt=256,Bt=128,Vt=K(gt,St),Ht=_t;function Ut(){return{commonAtmosphere:K(Rt.commonAtmosphere,St,zt,zt),clouds:Rt.clouds}}function Wt(t,o){if(Ce())return Kt(o);let{commonAtmosphere:c,clouds:l}=Ut(),d=ft(),f=X(zt,Bt,{type:ee}),m=new Y({name:`skyLUT`,fragmentShader:Vt,uniforms:{uSunEl:{value:.6},uMie:{value:2.2},uViewH:{value:.05},uMS:{value:2.2},uGroundAlbedo:{value:new M(.12,.12,.11)}}}),g=new x(128,128,128,{type:a,format:n,depthBuffer:!1}),_=g.texture;_.wrapS=_.wrapT=_.wrapR=h,_.minFilter=u,_.magFilter=u,_.generateMipmaps=!1;let v=new Y({name:`cloudNoise`,fragmentShader:Ht,uniforms:{uZ:{value:0},uPW:{value:new O(.4,.22)}}}),y=new r(-1,1,1,-1,0,1);function b(e,n){v.uniforms.uPW.value.set(e,n);for(let e=0;e<128;e++)v.uniforms.uZ.value=(e+.5)/128,t.setRenderTarget(g,e),t.render(v.mesh,y);t.setRenderTarget(null)}b(.4,.22);let S={elevation:44,azimuth:70,mie:1.4,ms:2.2,skyScale:16,envSaturation:.62,cloudCoverage:.52,cloudDensity:.7,cloudBottom:1.25,cloudTop:2.8,cloudFade:28,cloudSun:4.3,cloudAmb:.8,cloudScale:.13,cirrus:.6,cloudErode:.58,cloudDetailScale:1.65,cloudBaseDark:.9,skylineVisible:1,lightScale:1,lightTint:[1,1,1],skyTint:[1,1,1],skyGlow:[0,0,0],night:0,stars:0,groundAlbedo:[.2,.18,.155],envFacadeAlbedo:[.34,.29,.23]},w=new M,D=new p,k={uSkyLUT:{value:f.texture},uSunDir:{value:w},uSunColor:{value:new M},uSkyScale:{value:S.skyScale},uNoise:{value:_},uCloudCoverage:{value:S.cloudCoverage},uCloudDensity:{value:S.cloudDensity},uCloudBottom:{value:S.cloudBottom},uCloudTop:{value:S.cloudTop},uCloudFade:{value:S.cloudFade},uCloudOffset:{value:new M(3.1,0,7.7)},uSkyline:{value:1},uSkyTint:{value:new M(1,1,1)},uSkyGlow:{value:new M(0,0,0)},uFacadeAlb:{value:new M(.2,.185,.165)},uNight:{value:0},uCloudSun:{value:S.cloudSun},uCloudAmb:{value:S.cloudAmb},uCloudScale:{value:S.cloudScale},uHzK:{value:new M(.56,.63,.78)},uCirrus:{value:S.cirrus},uCloudErode:{value:S.cloudErode},uCloudDetailScale:{value:S.cloudDetailScale},uCloudBaseDark:{value:S.cloudBaseDark},uSunGlow:{value:new T(0,0,0,0)},uOvercast:{value:0}};function A(){let e=P.degToRad(S.elevation),n=P.degToRad(S.azimuth);w.set(Math.cos(e)*Math.cos(n),Math.sin(e),Math.cos(e)*Math.sin(n)).normalize();let r=Ct(Math.max(e,.009),S.mie),i=S.skyScale*.62*S.lightScale,a=S.lightTint;D.setRGB(r[0]*i*a[0],r[1]*i*a[1],r[2]*i*a[2]),k.uSkyTint.value.fromArray(S.skyTint),k.uSkyGlow.value.fromArray(S.skyGlow),k.uSunGlow.value.fromArray(S.sunGlow??[0,0,0,0]),k.uOvercast.value=S.overcast??0,k.uNight.value=S.night,k.uSunColor.value.set(D.r,D.g,D.b),k.uSkyScale.value=S.skyScale,m.uniforms.uSunEl.value=e,m.uniforms.uMie.value=S.mie,m.uniforms.uMS.value=S.ms,m.render(t,f),t.setRenderTarget(null)}function j(){k.uCloudCoverage.value=S.cloudCoverage,k.uCloudDensity.value=S.cloudDensity,k.uCloudBottom.value=S.cloudBottom,k.uCloudTop.value=S.cloudTop,k.uCloudFade.value=S.cloudFade,k.uCloudSun.value=S.cloudSun,k.uCloudAmb.value=S.cloudAmb,k.uCloudScale.value=S.cloudScale,k.uCirrus.value=S.cirrus,k.uCloudErode.value=S.cloudErode,k.uCloudDetailScale.value=S.cloudDetailScale,k.uCloudBaseDark.value=S.cloudBaseDark}let F=new Y({name:`skyPass`,defines:{CLOUD_STEPS:o.cloudSteps,CLOUD_LIGHT_STEPS:o.cloudLightSteps},uniforms:{...k,uDepth:{value:null},uProjInv:{value:new E},uReversed:{value:0},uCamWorld:{value:new E},uCamPos:{value:new M},uFullRes:{value:new O(1,1)},uStars:{value:0}},fragmentShader:K(vt,d,c,l)}),I=new C,R=new N({name:`envSky`,glslVersion:i,side:1,depthWrite:!1,depthTest:!1,defines:{CLOUD_STEPS:48,CLOUD_LIGHT_STEPS:4},uniforms:{...k,uCamPos:{value:new M(0,60,0)},uGround:{value:new M(.2,.18,.155)},uEnvSat:{value:.62},uEnvFacade:{value:new M(.34,.29,.23)}},vertexShader:Z,fragmentShader:K(yt,c,l)}),ne=new te(new s(10,10,10),R);ne.frustumCulled=!1,I.add(ne);let z=new L(256,{type:ee,generateMipmaps:!1}),ie=new e(.1,100,z);I.add(ie);let ae=new re(t),oe=null;function se(){let e=t.getRenderTarget(),n=t.toneMapping;return t.toneMapping=0,ie.update(t,I),oe=ae.fromCubemap(z.texture,oe??void 0),t.toneMapping=n,t.setRenderTarget(e),oe.texture}function ce(e){let n=t.getRenderTarget(),r=t.getActiveCubeFace(),i=t.getActiveMipmapLevel(),a=t.toneMapping;t.toneMapping=0,ie.coordinateSystem!==t.coordinateSystem&&(ie.coordinateSystem=t.coordinateSystem,ie.updateCoordinateSystem()),t.setRenderTarget(z,e),t.render(I,ie.children[e]),t.toneMapping=a,t.setRenderTarget(n,r,i)}function le(){let e=t.getRenderTarget();return oe=ae.fromCubemap(z.texture,oe??void 0),t.setRenderTarget(e),oe.texture}return A(),j(),{params:S,sunDir:w,sunColor:D,lut:f,noise:_,noiseRT:g,skyUniforms:k,skyPass:F,genNoise:b,update(){j(),A(),k.uSkyline.value=S.skylineVisible,R.uniforms.uEnvSat.value=S.envSaturation,R.uniforms.uGround.value.fromArray(S.groundAlbedo),R.uniforms.uEnvFacade.value.fromArray(S.envFacadeAlbedo),F.uniforms.uStars.value=S.stars},renderEnv:se,renderEnvFace:ce,finishEnv:le,renderSkyPass(e,n,r,i,a,o){let s=F.uniforms;s.uDepth.value=r,s.uProjInv.value.copy(n.projectionMatrixInverse),s.uCamWorld.value.copy(n.matrixWorld),s.uCamPos.value.setFromMatrixPosition(n.matrixWorld),s.uFullRes.value.set(i,a),s.uReversed.value=+!!o,s.uSkyline.value=S.skylineVisible,F.render(t,e)}}}function Gt(){let e=Nt(48),t=new F(e,48,48,48);return t.format=n,t.type=a,t.wrapS=t.wrapT=t.wrapR=h,t.magFilter=t.minFilter=u,t.generateMipmaps=!1,t.unpackAlignment=1,t.colorSpace=``,t.needsUpdate=!0,t}function Kt(e={}){let t={elevation:44,azimuth:70,mie:1.4,ms:2.2,skyScale:16,envSaturation:.62,cloudCoverage:.52,cloudDensity:.7,cloudBottom:1.25,cloudTop:2.8,cloudFade:28,cloudSun:4.3,cloudAmb:.8,cloudScale:.26,cirrus:.6,cloudErode:.42,cloudDetailScale:1.35,cloudBaseDark:.9,skylineVisible:1,lightScale:1,lightTint:[1,1,1],skyTint:[1,1,1],skyGlow:[0,0,0],night:0,stars:0,groundAlbedo:[.2,.18,.155],envFacadeAlbedo:[.34,.29,.23],overcast:0,sunGlow:[0,0,0,0]},r=.3,i=e?.name===`high`?.24:r,a=V(t.skyScale*i),o=new M,s=new p,c=new M(1,1,1),l=new M(.62,.72,.9),d=new M,f=V(o),_=V(c),v=V(l),y=V(d),b=V(s),x=V(1),S=V(t.cloudCoverage),C=V(t.cloudDensity),T=V(t.cloudScale),E=V(t.cloudSun),D=V(t.night),O=V(t.overcast),k=V(t.stars),j=Gt(),N=j.image.data,F=e?.name===`high`?[256,128]:e?.name===`low`?[64,32]:[128,64],I=new Uint16Array(F[0]*F[1]*4),L=new w(I,F[0],F[1],n,ee);L.mapping=303,L.colorSpace=g,L.wrapS=h,L.wrapT=m,L.magFilter=u,L.minFilter=u,L.generateMipmaps=!1;let R=!0,ne=new Float32Array(1),re=new Uint32Array(ne.buffer),W=e=>{ne[0]=e;let t=re[0],n=t>>>16&32768,r=(t>>>23&255)-127+15,i=t&8388607;return r<=0?r<-10?n:(i=(i|8388608)>>>1-r,n|i+4096>>>13):r>=31?n|31744:n|r<<10|i+4096>>>13},ye=new ve;ye.name=`NodeSky.TSL`,ye.side=1,ye.depthWrite=!1,ye.depthTest=!1,ye.toneMapped=!1,ye.fog=!1,ye.allowOverride=!1;let be=ae(ce.sub(he)),G=be.y,xe=z(-.22,.52,G),K=z(-.08,.16,f.y),Se=H(.48,.61,.78),Ce=H(.13,.31,.68),we=H(.035,.043,.065),Te=H(.006,.009,.018),Ee=U(we,Se,K).mul(v),De=U(Te,Ce,K).mul(_),Oe=U(Ee,De,xe),ke=le(be,f).max(0),Ae=z(.99988,.99996,ke),je=fe(ke,36).mul(.32).add(fe(ke,90).mul(.55)),Me=fe(B(1).sub(G.abs()).max(0),3).mul(y),Ne=wt(t.cloudBottom,t.cloudTop),Pe=B(Ne).div(G.max(Q.minRayY)),Fe=be.x.mul(Pe).add(Q.offsetKm[0]),Ie=be.z.mul(Pe).add(Q.offsetKm[1]),Le=Fe.mul(T),Re=B(Tt(Ne)),ze=Ie.mul(T),Be=e=>B(1).sub(e.mul(Math.sqrt(3))).max(0).min(1),q=ue(j,H(Le.mul(Q.warpScale).add(.17),Re.mul(Q.warpScale).add(.37),ze.mul(Q.warpScale).add(.71))),Ve=Le.add(q.g.sub(q.r).mul(Q.warpAmount)),He=Re.add(q.b.sub(q.g).mul(Q.warpAmount)),Ue=ze.add(q.a.sub(q.b).mul(Q.warpAmount)),We=ue(j,H(Ve,He,Ue)),Ge=Be(We.g).mul(.625).add(Be(We.b).mul(.25)).add(Be(We.a).mul(.125)),Ke=Be(We.r),qe=pe(Ke.add(B(1).sub(Ge).mul(.6)).div(B(1).add(B(1).sub(Ge).mul(.6))),0,1),Je=ue(j,H(Fe.mul(Q.weatherLowScale),.31,Ie.mul(Q.weatherLowScale))),Ye=ue(j,H(Fe.mul(Q.weatherMidScale).add(.5),.71,Ie.mul(Q.weatherMidScale).add(.5))),Xe=pe(ge(S.mul(Q.coverageScale),O.mul(.95)).mul(B(.55).add(z(.1,.8,Be(Je.r)).mul(.8))).mul(B(.8).add(Be(Ye.r).mul(.4))),0,1),Ze=B(.35).add(Xe.mul(.65)),Qe=B(1).sub(z(Ze.mul(.4),Ze,Q.sampleHeightFraction)),$e=qe.mul(Qe).sub(B(1).sub(Xe)).div(Xe.max(.02)).max(0).min(1),et=ie(Xe.greaterThan(.02),$e,B(0)),tt=ue(j,H(Fe.mul(t.cloudDetailScale),Et,Ie.mul(t.cloudDetailScale))),nt=Be(tt.g).mul(.625).add(Be(tt.b).mul(.25)).add(Be(tt.a).mul(.125)),rt=B(1).sub(B(1-Q.detail1FarKeep).mul(z(Q.detail1FadeKm[0],Q.detail1FadeKm[1],Pe))),it=B(1).sub(nt).mul(t.cloudErode).mul(rt);et=et.sub(it).div(B(1).sub(it)).max(0).min(1);let at=ue(j,H(Fe.mul(t.cloudDetailScale*Q.detail2Scale).add(.37),Dt,Ie.mul(t.cloudDetailScale*Q.detail2Scale).add(.11))),ot=B(1).sub(Be(at.g).mul(.6).add(Be(at.b).mul(.4))),st=B(1).sub(z(Q.detail2FadeKm[0],Q.detail2FadeKm[1],Pe)),ct=ot.mul(Q.detail2Erode).mul(B(1).sub(et.div(.45)).max(0)).mul(st);et=et.sub(ct).div(B(1).sub(ct)).max(0).min(1);let lt=B(Q.thicknessKm).div(G.max(Q.minPathRayY)),ut=et.mul(C).mul(lt).mul(Q.sigmaPerKm),dt=B(1).sub(_e(ut.negate())).mul(_e(Pe.div(t.cloudFade*3.5).negate())).mul(z(Q.horizonFadeY[0],Q.horizonFadeY[1],G)),J=z(.08,.75,et),Y=B(.68).add(J.mul(.22)),X=U(H(.17,.19,.23),H(.76,.79,.82),z(-.04,.28,f.y)).mul(B(1).sub(D.mul(.58))).mul(Y).mul(a).add(b.mul(fe(ke,3).mul(E).mul(.025)).mul(x)),ft=H(.42,.45,.48).mul(B(.35).add(xe.mul(.25))),pt=U(Oe.add(Me),ft,O.mul(.8)).mul(a),mt=oe(be.mul(380)),ht=de(me(le(mt,H(12.9898,78.233,37.719))).mul(43758.5453)),gt=se(.9985,ht).mul(z(.02,.35,G)).mul(k);ye.colorNode=U(pt,X,dt).add(b.mul(Ae.add(je.mul(E).mul(.01))).mul(x)).add(H(gt));let _t=new te(new A(149e3,32,20),ye);_t.name=`NodeSkyDome`,_t.frustumCulled=!1,_t.renderOrder=-1e3;let vt={uHzK:{value:new M(.56,.63,.78)}};function Z(){let e=P.degToRad(t.elevation),n=P.degToRad(t.azimuth);o.set(Math.cos(e)*Math.cos(n),Math.sin(e),Math.cos(e)*Math.sin(n)).normalize();let r=Ct(Math.max(e,.009),t.mie),u=t.skyScale*.62*t.lightScale;s.setRGB(r[0]*u*t.lightTint[0],r[1]*u*t.lightTint[1],r[2]*u*t.lightTint[2]),c.set(t.skyTint[0],t.skyTint[1],t.skyTint[2]),l.set(.62*c.x+t.skyGlow[0],.72*c.y+t.skyGlow[1],.9*c.z+t.skyGlow[2]),d.set(...t.skyGlow),vt.uHzK.value.set(P.lerp(.56,.38,t.night),P.lerp(.63,.38,t.night),P.lerp(.78,.5,t.night)),S.value=t.cloudCoverage,C.value=t.cloudDensity,T.value=t.cloudScale,E.value=t.cloudSun,D.value=t.night,O.value=t.overcast,k.value=t.stars,a.value=t.skyScale*i,R=!0}let yt=(e,t,n)=>{let r=P.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function bt(){if(!R)return L;let[e,n]=F,i=t.skyTint,a=t.skyGlow,c=t.skyScale*r,l=yt(-.08,.16,o.y),u=new M,d=new M,f=It(),p={density:0,alpha:0,fade:0,distanceKm:0},m={coverage:Math.max(t.cloudCoverage*Q.coverageScale,t.overcast*.95),cloudScale:t.cloudScale,detailScale:t.cloudDetailScale,erode:t.cloudErode,cloudDensity:t.cloudDensity,cloudFade:t.cloudFade,layerKm:wt(t.cloudBottom,t.cloudTop)},h=new M(.035,.043,.065).lerp(new M(.48,.61,.78),l),g=new M(.006,.009,.018).lerp(new M(.13,.31,.68),l);for(let r=0;r<n;r++){let l=Math.PI*(.5-(r+.5)/n),_=Math.cos(l),v=Math.sin(l),ee=yt(-.22,.52,v);for(let n=0;n<e;n++){let l=((n+.5)/e-.5)*Math.PI*2,y=Math.cos(l)*_,te=Math.sin(l)*_,b=Math.max(0,y*o.x+v*o.y+te*o.z),x=Math.max(0,1-Math.abs(v))**3;u.copy(h).lerp(g,ee),u.set(u.x*i[0]+a[0]*Math.exp(-Math.max(v,0)*7),u.y*i[1]+a[1]*Math.exp(-Math.max(v,0)*7),u.z*i[2]+a[2]*Math.exp(-Math.max(v,0)*7)),u.multiplyScalar(c),Lt(N,y,v,te,m,f,p);let S=.68+yt(.08,.75,p.density)*.22,C=p.alpha,w=P.lerp(.17,.76,yt(-.04,.28,o.y))*(1-t.night*.58),T=w*S*.99*c+s.r*b**3*t.cloudSun*.025,E=w*S*1.02*c+s.g*b**3*t.cloudSun*.025,D=w*S*1.06*c+s.b*b**3*t.cloudSun*.025,O=t.overcast*.8,k=.42*(.35+ee*.25)*c;u.lerp(d.set(k,k*1.07,k*1.14),O),u.lerp(d.set(T,E,D),C);let A=b**90+b**36*.32;u.addScaledVector(s,Math.min(1,A*.025)),u.x+=a[0]*x,u.y+=a[1]*x,u.z+=a[2]*x;let j=(r*e+n)*4;I[j]=W(Math.max(0,u.x)),I[j+1]=W(Math.max(0,u.y)),I[j+2]=W(Math.max(0,u.z)),I[j+3]=W(1)}}return L.needsUpdate=!0,R=!1,L}return Z(),{params:t,sunDir:o,sunColor:s,sunVisualNode:x,environmentTexture:L,skyUniforms:vt,mesh:_t,update:Z,renderEnv(){return bt()},renderEnvFace(){},finishEnv(){return bt()}}}var qt=class{gl;ext;enabled;pending=[];free=[];current=null;acc={};constructor(e,t){this.gl=e.getContext(),this.ext=t?this.gl.getExtension(`EXT_disjoint_timer_query_webgl2`):null,this.enabled=this.ext!==null}begin(e){if(!this.ext)return;this.end();let t=this.gl,n=this.free.pop()??t.createQuery();n&&(t.beginQuery(this.ext.TIME_ELAPSED_EXT,n),this.current={name:e,query:n})}end(){this.ext&&this.current&&(this.gl.endQuery(this.ext.TIME_ELAPSED_EXT),this.pending.push(this.current),this.current=null)}poll(){if(!this.ext)return;let e=this.gl,t=e.getParameter(this.ext.GPU_DISJOINT_EXT);for(;this.pending.length;){let n=this.pending[0];if(!n||!e.getQueryParameter(n.query,e.QUERY_RESULT_AVAILABLE))break;this.pending.shift();let r=e.getQueryParameter(n.query,e.QUERY_RESULT);if(this.free.push(n.query),t)continue;let i=this.acc[n.name]||(this.acc[n.name]={sum:0,n:0});i.sum+=r/1e6,i.n++}}report(e=!1){let t={},n=0;for(let e in this.acc){let r=this.acc[e];r&&(t[e]=+(r.sum/Math.max(1,r.n)).toFixed(3),n+=r.sum/Math.max(1,r.n))}return t.total=+n.toFixed(3),e&&(this.acc={}),t}};async function Jt({renderer:e,scene:t,camera:n,lighting:r}){if(e.isWebGPURenderer===!0){let{createTslPipeline:i}=await Ie(async()=>{let{createTslPipeline:e}=await import(`./tslPipeline-Aavej_L9.js`);return{createTslPipeline:e}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]));return i({renderer:e,scene:t,camera:n,lighting:r,quality:r.quality})}let i=ft(),o=pt(),s=Ut().commonAtmosphere,f=ye(),m=r.quality,h=!!e.capabilities.reversedDepthBuffer,g=new URLSearchParams(location.search),v=Fe(g),ee=!1,te=!1,x=!1,S=new qt(e,g.has(`prof`)),C={calls:0,triangles:0,cCalls:0,cTris:0};if(S.enabled){let t=e.shadowMap,n=t.render;t.render=function(...t){let r=e.info.render.calls,i=e.info.render.triangles,a=performance.now();S.begin(`shadows`),n.apply(this,t),S.begin(`scene`),C.cCalls+=e.info.render.calls-r,C.cTris+=e.info.render.triangles-i,C.cCpu=(C.cCpu||0)+performance.now()-a}}e.toneMapping=0,e.outputColorSpace=l,e.autoClear=!0;let w=new O;e.getDrawingBufferSize(w);let D=w.x,A=w.y,j=new b(D,A,h?d:c);j.format=I,j.minFilter=j.magFilter=y;let N=X(D,A,{depthBuffer:!0,depthTexture:j});N.texture.minFilter=N.texture.magFilter=u;let F=X(D,A),L=X(D/2,A/2),ne=X(D,A),re=[X(D,A),X(D,A)],z=X(D,A),ie=X(D,A),ae=X(D/2,A/2),oe=X(D/2,A/2),se=X(D/2,A/2),ce=X(D/2,A/2),le=X(D/4,A/4),ue=X(1,1,{filter:y}),B=[X(1,1,{filter:y,type:d}),X(1,1,{filter:y,type:d})],de=0,fe=new b(D,A,h?d:c);fe.format=I,fe.minFilter=fe.magFilter=y;let V=X(D,A,{depthBuffer:!0,depthTexture:fe,type:a,filter:y}),pe=new k({colorWrite:!1}),H=new E,me=new E,he=new E,ge=!1,U=[],_e=[];function ve(){let e=D,t=A;for(let n=0;n<m.bloomLevels;n++)e=Math.max(1,e>>1),t=Math.max(1,t>>1),U[n]?U[n].setSize(e,t):U.push(X(e,t)),_e[n]?_e[n].setSize(e,t):_e.push(X(e,t));for(;U.length>m.bloomLevels;)U.pop().dispose(),_e.pop().dispose()}ve();let W=null;if(m.ao){W=new Se(t,n,D,A),W.autoDetectTransparency=!1,W.configuration.transparencyAware=!1,W.configuration.gammaCorrection=!1,W.configuration.halfRes=m.aoHalfRes;let e=W.depthDownsampleTarget;e&&Array.isArray(e.texture)&&Object.defineProperty(e,"texture",{configurable:!0,get(){return this.textures[0]},set(e){this.textures[0]=e}}),W.setQualityMode(m.aoQuality),m.aoHalfRes||(W.configuration.aoSamples=4,W.configuration.denoiseSamples=4,W.configuration.denoiseRadius=5),W.configuration.aoRadius=3,W.configuration.distanceFalloff=.9,W.configuration.intensity=3.4,W.configuration.color=new p(920329),W.setDepthTexture(j),W.renderToScreen=!1}let G=r.sky,Ce=r.cascadedShadows,we=!!m.ssr&&!g.has(`nossr`),Te=m.ssr?je(e,t):null,Ee=new Y({name:`ssr`,defines:{STEPS:m.ssrSteps||24,ENVMAP_TYPE_CUBE_UV:``,CUBEUV_TEXEL_WIDTH:.0013,CUBEUV_TEXEL_HEIGHT:.001953125,CUBEUV_MAX_MIP:`7.0`},uniforms:{uDepth:{value:j},uScene:{value:N.texture},uPrev:{value:null},envMap:{value:null},uProj:{value:new E},uProjInv:{value:new E},uReversed:{value:+!!h},uCamWorld:{value:new E},uPrevViewProj:{value:new E},uRes:{value:new O(D,A)},uFrame:{value:0},uEnvI:{value:1},uHavePrev:{value:0},uMaxDist:{value:220},uFloor:{value:.5}},fragmentShader:K(Ue,i,R.cube_uv_reflection_fragment)}),De=Ce.N,Oe=!!m.shafts&&!g.has(`noshafts`),ke=new Y({name:`shafts`,defines:{STEPS:m.shaftSteps||12,NC:De},uniforms:{...G.skyUniforms,uDepth:{value:j},uProjInv:{value:new E},uReversed:{value:+!!h},uCamWorld:{value:new E},uCamPos:{value:new M},uCamFwd:{value:new M},uSM0:{value:null},uSM1:{value:null},uSM2:{value:null},uSM3:{value:null},uSMat:{value:[new E,new E,new E,new E]},uSplits:{value:new T(1e9,1e9,1e9,1e9)},uRes:{value:new O(D,A)},uFrame:{value:0},uDensity:{value:8e-4},uHeightFall:{value:1/70},uMaxT:{value:180},uStrength:{value:1}},fragmentShader:K(We,i,s)}),Ae=new Y({name:`cityVolume`,defines:{NSEG:m.cityVolSteps||16,VSLOTS:10,USE_CITYL:``,CITYL_NODITHER:``},uniforms:{cityL:{value:xe},uDepth:{value:j},uProjInv:{value:new E},uReversed:{value:+!!h},uCamWorld:{value:new E},uCamPos:{value:new M},uFrame:{value:0},uDensity:{value:.012},uHeightFall:{value:1/40},uMaxT:{value:120},uStrength:{value:1},uG:{value:.55}},fragmentShader:K(Ge,i,f)});m.ssgi!==!1&&g.has(`nossgi`);let Me=X(D/2,A/2),Le=new Y({name:`ssgi`,defines:{DIRS:m.ssgiDirs||6,STEPS:m.ssgiSteps||4,NC:De,ENVMAP_TYPE_CUBE_UV:``,CUBEUV_TEXEL_WIDTH:.0013,CUBEUV_TEXEL_HEIGHT:.001953125,CUBEUV_MAX_MIP:`7.0`},uniforms:{...G.skyUniforms,uDepth:{value:j},uPrevRad:{value:null},envMap:{value:null},uEnvI:{value:1},uAmbBounce:{value:new M},uProj:{value:new E},uProjInv:{value:new E},uReversed:{value:+!!h},uCamWorld:{value:new E},uPrevViewProj:{value:new E},uSM0:{value:null},uSM1:{value:null},uSM2:{value:null},uSM3:{value:null},uSMat:{value:[new E,new E,new E,new E]},uSplits:{value:new T(1e9,1e9,1e9,1e9)},uRes:{value:new O(D,A)},uFrame:{value:0},uHavePrev:{value:0},uStrength:{value:1},uAbs:{value:0},uAbsK:{value:1}},fragmentShader:K(Ke,i,s,R.cube_uv_reflection_fragment)}),Re=new Y({name:`sunVis`,uniforms:{uDepth:{value:j},uSky:{value:L.texture},uSunUv:{value:new O},uReversed:{value:+!!h},uProjInv:{value:new E},uAspect:{value:1}},fragmentShader:K(qe,i)}),ze=new Y({name:`composite`,uniforms:{...G.skyUniforms,uColor:{value:null},uDepth:{value:j},uSky:{value:L.texture},uProjInv:{value:new E},uReversed:{value:+!!h},uCamWorld:{value:new E},uCamPos:{value:new M},uFogDensity:{value:0},uFogFalloff:{value:0},uFogSun:{value:0},uFogTint:{value:new p},uFogStart:{value:0},uPx:{value:new O},uSceneA:{value:N.texture},uSSR:{value:se.texture},uSSROn:{value:0},uShafts:{value:ce.texture},uShaftOn:{value:0},uHalfPx:{value:new O},uCVol:{value:le.texture},uCVolOn:{value:0},uQuarterPx:{value:new O},uCloudShadow:{value:.4},uGI:{value:Me.texture},uGIOn:{value:0},uGIAbs:{value:0},uGIAlb:{value:.09},uMoonDir:{value:new M(0,1,0)},uMoonK:{value:0},uNightHaze:{value:new M},uNightHazeHi:{value:new M},uNightFog:{value:0},uGlowCol:{value:new M},uGlowH:{value:22},uGlowK:{value:.004},uNightMid:{value:new M(.0035,.0088,.0215)},uTsGlow:{value:new M(.0056,.0045,.004)},uNightMidLevel:{value:new M(.0062,.0068,.0105)}},fragmentShader:K(Je,i,s)}),Be=new Y({name:`taa`,uniforms:{uCurrent:{value:ne.texture},uHistory:{value:null},uDepth:{value:j},uProjInv:{value:new E},uReversed:{value:+!!h},uCamWorld:{value:new E},uPrevViewProj:{value:new E},uRes:{value:new O(D,A)},uBlend:{value:.1},uCharBlend:{value:.14},uSkyBlend:{value:.08},uSkyBlendCap:{value:0},uReset:{value:1},uJitter:{value:new O},uProjInvU:{value:new E},uMask:{value:fe},uMaskOn:{value:0},uObjDelta:{value:new E}},fragmentShader:K(Ye,i,o)}),q={focus:10,aperture:0,maxBlur:14,auto:null,far:1},Ve=()=>({uFocus:{value:10},uBokeh:{value:0},uMaxCoc:{value:12},uFar:{value:1}}),He=Xe,st=new Y({name:`dofPrefilter`,uniforms:{...Ve(),uColor:{value:null},uDepth:{value:j},uProjInv:{value:new E},uReversed:{value:+!!h},uPx:{value:new O}},fragmentShader:K(Ze,i,o,He)});function ct(e){let t=[];for(let n=0;n<e;n++){let r=Math.sqrt((n+.5)/e),i=n*2.39996323;t.push(new O(Math.cos(i)*r,Math.sin(i)*r))}return t}let lt=new Y({name:`dofBokeh`,defines:{TAPS:m.dofTaps},uniforms:{uSrc:{value:ae.texture},uKernel:{value:ct(m.dofTaps)},uMaxCoc:{value:12},uPx:{value:new O}},fragmentShader:Qe}),ut=new Y({name:`dofTent`,uniforms:{uSrc:{value:oe.texture},uPx:{value:new O}},fragmentShader:$e}),dt=new Y({name:`dofCombine`,uniforms:{...Ve(),uColor:{value:null},uDof:{value:ae.texture},uDepth:{value:j},uProjInv:{value:new E},uReversed:{value:+!!h}},fragmentShader:K(et,i,He)}),J={strength:0,velocity:null,angular:null,maskDistance:null,prevViewProj:new E,have:!1},ht=new Y({name:`motionBlur`,defines:{SAMPLES:m.motionBlurSamples},uniforms:{uColor:{value:null},uDepth:{value:j},uProjInv:{value:new E},uReversed:{value:+!!h},uCamWorld:{value:new E},uPrevViewProj:{value:new E},uScale:{value:.5},uMask:{value:3},uRes:{value:new O(D,A)},uFrame:{value:0}},fragmentShader:K(tt,i)}),gt=new Y({name:`bloomDown`,uniforms:{uSrc:{value:null},uPx:{value:new O},uFirst:{value:0}},fragmentShader:K(nt,o)}),_t=new Y({name:`bloomUp`,uniforms:{uSrc:{value:null},uCur:{value:null},uPx:{value:new O},uRadius:{value:1},uT:{value:1.2},uK:{value:.8},uThrSrc:{value:0}},fragmentShader:rt}),vt=new Y({name:`autoExposure`,uniforms:{uSrc:{value:null},uPrev:{value:null},uRate:{value:.1},uReset:{value:1}},fragmentShader:it}),Z={autoExposure:!0,aeKey:-2.05,aeStrength:.42,aeRange:1.25,aeSpeedUp:2.5,aeSpeedDown:1.4,exposure:.8,bloom:.11,bloomThreshold:.9,bloomKnee:.7,saturation:1.14,contrast:1.18,pivot:.18,satKnee:.72,lift:new M(-.004,-.004,-.003),gamma:new M(1,1,1),gain:new M(1.015,1,.975),whiteBalance:new M(1,1,1),splitShadow:new M(.95,1,1.07),splitHigh:new M(1.035,1,.95),splitBalance:.3,vignette:.28,ca:9e-4,sharpen:m.sharpen,grain:.012,shafts:1,nightSplitShadow:new M(.93,1,1.1),nightSplitStreet:new M(.8,.96,1.3),nightLift:new M(.0074,.0068,.0078),cityVol:1,giNight:.35,giNightAlbedo:.3,streak:.012,flare:1,gi:.5,toe:.34},yt=new Y({name:`final`,uniforms:{uColor:{value:null},uBloom:{value:null},uPx:{value:new O},uStreakSrc:{value:null},uStreakLo:{value:null},uStreak:{value:0},uStreakT:{value:2.5},uExposure:{value:1},uBloomStr:{value:.04},uSat:{value:1},uContrast:{value:1},uLift:{value:Z.lift},uGamma:{value:Z.gamma},uGain:{value:Z.gain},uWB:{value:Z.whiteBalance},uVignette:{value:.3},uCA:{value:.001},uSharpen:{value:.3},uGrain:{value:0},uFrame:{value:0},uAspect:{value:1},uSunVis:{value:ue.texture},uSunUv:{value:new O},uFlare:{value:0},uSunCol:{value:new M},uPivot:{value:.18},uSatKnee:{value:.72},uDepthS:{value:j},uProjInvS:{value:new E},uRevS:{value:+!!h},uAE:{value:null},uAEOn:{value:0},uAEKey:{value:0},uAEStr:{value:.6},uAERange:{value:1.25},uSplitSh:{value:Z.splitShadow},uSplitHi:{value:Z.splitHigh},uSplitBal:{value:.3},uWarmGuard:{value:0},uToe:{value:.45},uRain:{value:0}},fragmentShader:K(at,o)}),bt=new Y({name:`debugBlit`,uniforms:{uSrc:{value:null},uScale:{value:1},uMode:{value:0}},fragmentShader:ot}),xt=0,St=0,Ct=!0,Q=!0,wt=new E,Tt=new E,Et=new E,Dt=new M,Ot=new M,kt=new M,$=new M,At=new _,jt=new _,Mt=new E,Nt=new M,Pt=new M,Ft={sunUv:new O,onScreen:!1},It=new E;function Lt(t,n){let r=e.getPixelRatio(),i=Math.max(1,Math.floor(t*r)),a=Math.max(1,Math.floor(n*r));i===D&&a===A||(D=i,A=a,N.setSize(D,A),j.image.width=D,j.image.height=A,F.setSize(D,A),ne.setSize(D,A),re[0].setSize(D,A),re[1].setSize(D,A),z.setSize(D,A),ie.setSize(D,A),L.setSize(D>>1,A>>1),ae.setSize(D>>1,A>>1),oe.setSize(D>>1,A>>1),se.setSize(D>>1,A>>1),ce.setSize(D>>1,A>>1),le.setSize(D>>2,A>>2),Me.setSize(D>>1,A>>1),Te?.setSize(D,A),V.setSize(D,A),fe.image.width=D,fe.image.height=A,ve(),W&&W.setSize(D,A)),Ct=!0}function Rt(e,t){e.uFocus.value=q.focus,e.uBokeh.value=q.aperture,e.uMaxCoc.value=q.maxBlur,e.uFar.value=q.far,e.uProjInv&&e.uProjInv.value.copy(t.projectionMatrixInverse)}let zt=new WeakSet;function Bt(){t.traverse(e=>{let t=e.material;if(!t||Array.isArray(t)||zt.has(t))return;zt.add(t);let n=``;try{n=t.customProgramCacheKey?.()??``}catch{}(t.userData?.noSSR||n.includes(`hero-glass`))&&(t.defines={...t.defines||{},NO_SSR:``},t.needsUpdate=!0)})}e.info.autoReset=!1;let Vt={calls:0,triangles:0};function Ht(i=1/60){xt++,Vt.calls=e.info.render.calls,Vt.triangles=e.info.render.triangles,Vt.shadowCalls=C.cCalls,Vt.shadowTris=C.cTris,Vt.shadowCpu=C.cCpu||0,C.cCalls=C.cTris=C.cCpu=0,e.info.reset(),we&&xt%120==1&&Bt(),S.poll();let a=n;a.updateMatrixWorld(),v&&!ee&&(ee=!0,Ne({renderer:e,scene:t,camera:a,lighting:r,quality:m,grade:Z,backend:`WebGL2 legacy pipeline`})),q.auto&&(q.auto.getWorldPosition(Nt),q.focus=Nt.distanceTo(Nt.clone().setFromMatrixPosition(a.matrixWorld))),$.setFromMatrixPosition(a.matrixWorld),jt.setFromRotationMatrix(a.matrixWorld),($.distanceTo(Dt)>60||jt.angleTo(At)>.6)&&(Ct=!0),J.fade=Ct?0:Math.min(1,(J.fade??1)+i/.3),h&&a.reversedDepth!==!0&&(a._reversedDepth=!0,a.updateProjectionMatrix()),wt.copy(a.projectionMatrix),Tt.multiplyMatrices(wt,a.matrixWorldInverse);let o=xt%16+1,s=m.taa?mt(o,2)-.5:0,c=m.taa?mt(o,3)-.5:0;if(m.taa&&(a.projectionMatrix.elements[8]+=2*s/D,a.projectionMatrix.elements[9]+=2*c/A,a.projectionMatrixInverse.copy(a.projectionMatrix).invert()),Te&&(S.begin(`glassMirror`),Te.render(a)),xe.origin.w>0&&(S.begin(`cityShadows`),be.renderShadows(e,t)),S.begin(`scene+shadows`),e.setRenderTarget(N),e.setClearColor(0,1),e.clear(!0,!0,!1),e.render(t,a),v&&!te){te=!0;let t={frame:xt,cameraPosition:a.getWorldPosition(new M).toArray(),renderCalls:e.info?.render?.calls??null,renderedTriangles:e.info?.render?.triangles??null};Pe(e,N,{forceSync:!0}).then(({summary:e})=>{console.info(`[render-debug] WebGL2 scene-pass sample\n${JSON.stringify({...e,...t},null,2)}`)}).catch(e=>console.warn(`[render-debug] WebGL2 scene-pass readback failed`,e))}let l=window.__ctx?.player?.object,u=!1;if(m.taa&&l&&l.visible){S.begin(`charMask`),l.updateMatrixWorld(),me.copy(l.matrixWorld);let t=[];l.traverse(e=>{e.material&&(e.isMesh||e.isSkinnedMesh)&&e.visible?(t.push([e,e.material]),e.material=pe):e.visible&&(e.isLine||e.isPoints||e.isSprite)&&(t.push([e,null]),e.visible=!1)});let n=e.shadowMap.autoUpdate;e.shadowMap.autoUpdate=!1,e.setRenderTarget(V),e.clear(!1,!0,!1),e.render(l,a),e.shadowMap.autoUpdate=n;for(let[e,n]of t)n?e.material=n:e.visible=!0;he.copy(H).multiply(Mt.copy(me).invert()),u=ge,H.copy(me),ge=!0}S.begin(`sky`),G.renderSkyPass(L,a,j,D,A,h);let d=Nt.copy(G.sunDir).multiplyScalar(1e4).add($).project(a).clone(),f=Math.abs(d.x)<1.3&&Math.abs(d.y)<1.3&&Nt.copy(G.sunDir).dot(Pt.set(0,0,-1).applyQuaternion(jt))>0;Ft.sunUv.set(d.x*.5+.5,d.y*.5+.5),Ft.onScreen=f,f&&Z.flare>0&&(Re.uniforms.uSunUv.value.copy(Ft.sunUv),Re.uniforms.uAspect.value=D/A,Re.render(e,ue));let p=Oe&&r.fog.shafts>0&&G.sunDir.y>0;if(p){S.begin(`shafts`);let t=ke.uniforms;for(let e=0;e<Math.min(De,4);e++){let n=Ce.lights[e];t[`uSM`+e].value=n.shadow.map?.depthTexture??null,t.uSMat.value[e].copy(n.shadow.matrix)}for(let e=De;e<4;e++)t[`uSM`+e].value=t.uSM0.value;let n=Ce.splits;t.uSplits.value.set(n[1]??1e9,n[2]??1e9,n[3]??1e9,n[4]??1e9),t.uProjInv.value.copy(a.projectionMatrixInverse),t.uCamWorld.value.copy(a.matrixWorld),t.uCamPos.value.copy($),a.getWorldDirection(t.uCamFwd.value),t.uRes.value.set(D,A),t.uFrame.value=xt%64,t.uStrength.value=Z.shafts*r.fog.shafts,t.uSM0.value&&ke.render(e,ce)}let g=xe.origin.w>0&&Z.cityVol>0&&be.volume>0&&m.shafts!==!1;if(g){S.begin(`cityVolume`);let t=Ae.uniforms;t.uProjInv.value.copy(a.projectionMatrixInverse),t.uCamWorld.value.copy(a.matrixWorld),t.uCamPos.value.copy($),t.uFrame.value=xt%64,t.uStrength.value=Z.cityVol*(r.cityVol?.strength??1),t.uDensity.value=r.cityVol?.density??.012,t.uHeightFall.value=1/(r.cityVol?.height??40),Ae.render(e,le)}let y=N.texture;W&&(S.begin(`ao`),W.render(e,N,F),y=F.texture),S.begin(`composite`);{let t=ze.uniforms;t.uColor.value=y,t.uProjInv.value.copy(a.projectionMatrixInverse),t.uCamWorld.value.copy(a.matrixWorld),t.uCamPos.value.copy($);let n=r.fog;t.uMoonDir.value.copy(r.moon?.dir??t.uMoonDir.value),t.uMoonK.value=r.moon?.k??0;{let e=r.nightHaze;t.uNightFog.value=e?e.k:0,e&&(t.uNightHaze.value.fromArray(e.low),t.uNightHazeHi.value.fromArray(e.high),t.uGlowCol.value.fromArray(e.cfg.glowCol),t.uGlowH.value=e.cfg.glowH,t.uGlowK.value=e.cfg.glowK)}t.uFogDensity.value=n.density,t.uFogFalloff.value=n.heightFalloff,t.uFogSun.value=n.sunScatter,t.uFogTint.value.copy(n.tint),t.uFogStart.value=n.startDistance,t.uSSROn.value=0,t.uGIOn.value=0,t.uGIAbs.value=r.nightHaze?.k??0,t.uGIAlb.value=Z.giNightAlbedo/Math.PI,t.uShaftOn.value=p&&ke.uniforms.uSM0.value?1:0,t.uCVolOn.value=+!!g,t.uQuarterPx.value.set(1/le.width,1/le.height),t.uHalfPx.value.set(1/ce.width,1/ce.height),ze.render(e,ne)}let b=ne;if(m.taa){S.begin(`taa`);let t=Be.uniforms,n=re[St],r=re[1-St];t.uCurrent.value=ne.texture,t.uHistory.value=r.texture,t.uProjInv.value.copy(a.projectionMatrixInverse),t.uCamWorld.value.copy(a.matrixWorld),t.uPrevViewProj.value.copy(Et),t.uRes.value.set(D,A),t.uReset.value=+!!Ct,t.uBlend.value=.08,t.uCharBlend.value=m.name===`low`?.55:.14,t.uSkyBlend.value=m.name===`low`?.04:.08,t.uSkyBlendCap.value=+(m.name===`low`),t.uJitter.value.set(-s/D,-c/A),t.uProjInvU.value.copy(wt).invert(),t.uMaskOn.value=+!!u,t.uObjDelta.value.copy(he),Be.render(e,n),St=1-St,b=n}Ct=!1,a.projectionMatrix.copy(wt),a.projectionMatrixInverse.copy(wt).invert();let w=[z,ie],T=0;if(q.aperture>.01&&(S.begin(`dof`),Rt(st.uniforms,a),st.uniforms.uColor.value=b.texture,st.uniforms.uPx.value.set(1/D,1/A),st.render(e,ae),lt.uniforms.uSrc.value=ae.texture,lt.uniforms.uMaxCoc.value=q.maxBlur,lt.uniforms.uPx.value.set(2/D,2/A),lt.render(e,oe),ut.uniforms.uSrc.value=oe.texture,ut.uniforms.uPx.value.set(2/D,2/A),ut.render(e,ae),Rt(dt.uniforms,a),dt.uniforms.uColor.value=b.texture,dt.uniforms.uDof.value=ae.texture,dt.render(e,w[T]),b=w[T],T=1-T),J.strength>.001&&(J.fade>.001||J.velocity||J.angular)){let t=Et;if(J.velocity||J.angular){let e=$.clone();J.velocity&&e.addScaledVector(J.velocity,-.016666666666666666);let n=jt.clone();if(J.angular){let e=J.angular.length()*.016666666666666666;e>0&&n.premultiply(new _().setFromAxisAngle(J.angular.clone().normalize(),-e))}It.compose(e,n,new M(1,1,1)).invert(),t=Mt.multiplyMatrices(wt,It)}if(J.have||J.velocity||J.angular){S.begin(`motionBlur`);let n=ht.uniforms;n.uColor.value=b.texture,n.uProjInv.value.copy(a.projectionMatrixInverse),n.uCamWorld.value.copy(a.matrixWorld),n.uPrevViewProj.value.copy(t);let r=J.velocity||J.angular?1:Math.min(2,1/60/Math.max(i,.001));n.uScale.value=J.strength*r*(J.velocity||J.angular?1:J.fade??1),n.uMask.value=J.maskDistance??(q.auto||q.focus<30?q.focus+1.5:3),n.uRes.value.set(D,A),n.uFrame.value=xt%64,ht.render(e,w[T]),b=w[T],T=1-T}}S.begin(`bloom`);let E=b.texture,O=D,k=A;for(let t=0;t<U.length;t++)gt.uniforms.uSrc.value=E,gt.uniforms.uPx.value.set(1/O,1/k),gt.uniforms.uFirst.value=+(t===0),gt.render(e,U[t]),E=U[t].texture,O=U[t].width,k=U[t].height;let I=U[U.length-1];for(let t=U.length-2;t>=0;t--)_t.uniforms.uSrc.value=I.texture,_t.uniforms.uCur.value=U[t].texture,_t.uniforms.uPx.value.set(1/I.width,1/I.height),_t.uniforms.uThrSrc.value=+(t===U.length-2),_t.uniforms.uT.value=Z.bloomThreshold,_t.uniforms.uK.value=Z.bloomKnee,_t.render(e,_e[t]),I=_e[t];if(Z.autoExposure){S.begin(`autoExposure`);let t=vt.uniforms,n=B[de],r=B[1-de];t.uSrc.value=U[Math.min(3,U.length-1)].texture,t.uPrev.value=n.texture,t.uReset.value=+!!Q,Q=!1;let a=.5*(Z.aeSpeedUp+Z.aeSpeedDown);t.uRate.value=1-Math.exp(-Math.max(i,1/240)*a),vt.render(e,r),de=1-de}S.begin(`final`);{let t=yt.uniforms;t.uColor.value=b.texture,t.uBloom.value=I.texture,t.uStreakSrc.value=U[0].texture,t.uStreakLo.value=U[Math.min(3,U.length-1)].texture,t.uStreak.value=Z.streak*(r.nightHaze?.k??0),t.uPx.value.set(1/D,1/A);let n=r.tod||{};if(t.uRain.value=n.rain??0,t.uExposure.value=Z.exposure*(n.exposure??1),t.uBloomStr.value=Z.bloom*(n.bloom??1),t.uSat.value=Z.saturation,t.uFlare.value=Ft.onScreen?Z.flare*(r.tod.sunK??1):0,t.uSunCol.value.copy(G.skyUniforms.uSunColor.value),t.uContrast.value=Z.contrast,t.uPivot.value=Z.pivot,t.uSatKnee.value=Z.satKnee,t.uVignette.value=Z.vignette,t.uCA.value=Z.ca,t.uSharpen.value=Z.sharpen,t.uGrain.value=Z.grain,t.uFrame.value=xt%36e3,t.uAspect.value=D/A,t.uProjInvS.value.copy(a.projectionMatrixInverse),t.uAE.value=B[de].texture,t.uAEOn.value=+!!Z.autoExposure,t.uAEKey.value=Z.aeKey,t.uAEStr.value=Z.aeStrength,t.uAERange.value=Z.aeRange,t.uLift.value=Ot.copy(Z.lift).addScaledVector(Z.nightLift,r.nightHaze?.k??0),t.uToe.value=Z.toe,t.uSplitSh.value=kt.copy(Z.nightSplitStreet).lerp(Z.nightSplitShadow,P.smoothstep($.y,25,120)).lerp(Z.splitShadow,1-(r.nightHaze?.k??0)),t.uSplitHi.value=Z.splitHigh,t.uWarmGuard.value=r.nightHaze?.k??0,t.uSplitBal.value=P.lerp(Z.splitBalance,.14,r.nightHaze?.k??0),v&&!x){x=!0;let n=null;if(Z.autoExposure)try{let t=new Float32Array(4);e.readRenderTargetPixels(B[de],0,0,1,1,t);let r=Math.max(-Z.aeRange,Math.min(Z.aeRange,-(t[0]-Z.aeKey)*Z.aeStrength));n={adaptedLog2Luminance:Number(t[0].toFixed(4)),currentLog2Luminance:Number(t[1].toFixed(4)),appliedEv:Number(r.toFixed(4))}}catch(e){n={readbackFailed:String(e)}}console.info(`[render-debug] WebGL2 effective final-pass inputs\n${JSON.stringify({baseExposure:t.uExposure.value,autoExposureEnabled:Z.autoExposure,autoExposure:n,effectiveExposure:t.uExposure.value*(n?.appliedEv==null?1:2**n.appliedEv),bloom:t.uBloomStr.value,saturation:t.uSat.value,contrast:t.uContrast.value,pivot:t.uPivot.value,lift:t.uLift.value?.toArray?.()??t.uLift.value,gamma:t.uGamma.value?.toArray?.()??t.uGamma.value,gain:t.uGain.value?.toArray?.()??t.uGain.value,vignette:t.uVignette.value,grain:t.uGrain.value,toneMapping:e.toneMapping,outputColorSpace:e.outputColorSpace,stage:`values bound immediately before the final post pass`},null,2)}`)}yt.render(e,null)}if(Wt.debug){let t=Wt.debug,n={ssr:se,ssgi:Me,shafts:ce,cvol:le,ao:F,scene:N,lit:ne,ssrw:N}[t.tex];n&&(bt.uniforms.uSrc.value=n.texture,bt.uniforms.uScale.value=t.scale??1,bt.uniforms.uMode.value=+(t.tex===`ssrw`),bt.render(e,null))}S.begin(`external`),Et.copy(Tt),Dt.copy($),At.copy(jt),J.have=!0}let Wt={debug:null,render:Ht,setSize:Lt,grade:Z,get ao(){return W},passes:{ssr:Ee,ssgi:Le,shafts:ke,composite:ze,taa:Be,final:yt},gmirror:Te,setFocus(e){q.focus=Math.max(.1,e)},setAperture(e){q.aperture=Math.max(0,e)},setDofFar(e){q.far=Math.max(0,e)},setDof({focus:e,aperture:t,maxBlur:n,far:r}={}){r!==void 0&&(q.far=r),e!==void 0&&(q.focus=e),t!==void 0&&(q.aperture=t),n!==void 0&&(q.maxBlur=n)},setAutoFocus(e){q.auto=e||null},setMotionBlur(e,t={}){J.strength=e,J.velocity=t.cameraVelocity?t.cameraVelocity.clone():null,J.angular=t.angularVelocity?t.angularVelocity.clone():null,J.maskDistance=t.maskDistance??null},resetHistory(){Ct=!0},resetExposure(){Q=!0},readExposure(){let t=new Float32Array(4);return e.readRenderTargetPixels(B[de],0,0,1,1,t),{adapted:t[0],current:t[1]}},timings(e){return S.report(e)},prepareMaterials(){we&&Bt()},get size(){return{W:D,H:A}},get stats(){return{...Vt}}};return Wt}var Yt=`// lighting shader sections. Use parseShaderSections() to select an injection chunk.
// @section emissiveNightGain
totalEmissiveRadiance += diffuseColor.rgb * 1 * ambData.bounce.w;
`,Xt=29,Zt=40.75*Math.PI/180,Qt=6*Math.PI/180,$t=12.95;function en(e){let t=(((e-$t)%24+36)%24-12)*15*Math.PI/180,n=Math.sin(Zt)*Math.sin(Qt)+Math.cos(Zt)*Math.cos(Qt)*Math.cos(t),r=Math.asin(n),i=(Math.sin(Qt)-n*Math.sin(Zt))/(Math.cos(r)*Math.cos(Zt)),a=Math.acos(P.clamp(i,-1,1));return t>0&&(a=2*Math.PI-a),{elevation:r*180/Math.PI,azimuth:a*180/Math.PI-90-Xt}}var tn=[{el:-14,env:1,envSpec:1,envSat:.7,sun:1,warm:0,fog:.55,mie:1.2,clouds:.14,exposure:1,bounce:.1,groundBounce:0,glow:0,fogTint:[.84,.9,1]},{el:-4.5,env:1,envSpec:1,envSat:.75,sun:1,warm:.3,fog:1.2,mie:1.3,clouds:.45,exposure:1.45,bounce:.3,groundBounce:1.2,glow:.7,fogTint:[.88,.85,.95]},{el:3,env:.72,envSpec:1,envSat:.75,sun:1.15,warm:.85,fog:1.35,mie:1.4,clouds:.55,exposure:1.5,bounce:.5,groundBounce:2.2,glow:1.5,fogTint:[1,.86,.74]},{el:10,env:.8,envSpec:.95,envSat:.8,sun:1.3,warm:.75,fog:1.3,mie:1.05,clouds:.55,exposure:1.2,bounce:.62,groundBounce:2.6,glow:1.45,fogTint:[1,.9,.8]},{el:24,env:1.5,envSpec:.85,envSat:.85,sun:1.55,warm:.48,fog:1.45,mie:.75,clouds:.62,exposure:.74,bounce:.95,groundBounce:2.6,glow:1.25,fogTint:[.9,.9,.96]},{el:45,env:1,envSpec:.8,envSat:.6,sun:1.45,warm:.32,fog:1,mie:.35,clouds:.8,exposure:.72,bounce:.55,groundBounce:2.4,glow:.3,fogTint:[.72,.83,1]}];function nn(e){let t=tn;if(e<=t[0].el)return{...t[0],fogTint:[...t[0].fogTint]};for(let n=1;n<t.length;n++)if(e<t[n].el){let r=t[n-1],i=t[n],a=(e-r.el)/(i.el-r.el),o=a*a*(3-2*a),s={};for(let e in r)s[e]=Array.isArray(r[e])?r[e].map((t,n)=>t+(i[e][n]-t)*o):r[e]+(i[e]-r[e])*o;return s}let n=t[t.length-1];return{...n,fogTint:[...n.fogTint]}}function rn({scene:e,state:n,tod:r,screenK:i,lightingShader:a,lerp:o}){let s=new WeakMap;function c(){let t=new Set;e.traverse(e=>{let n=e.material;if(n)for(let e of Array.isArray(n)?n:[n])t.add(e)});let r=[];for(let e of t){let t=s.get(e);if(!t){let n=e.userData?.uniforms;t=e.userData?.nightGain!=null&&e.emissive?{kind:`emis`,ei:e.emissiveIntensity??1,gain:e.userData.nightGain}:e.userData?.nightLit?{kind:`emis`,ei:e.userData.nightLit,base0:!0}:n?.uInteriorGain||n?.uShopGain?{kind:`facade`,gi:n.uInteriorGain?.value??0,gs:n.uShopGain?.value??0}:e.emissive&&e.emissive.r+e.emissive.g+e.emissive.b>.05&&!e.map?{kind:`emis`,ei:e.emissiveIntensity??1}:e.emissive&&e.emissiveMap&&(e.emissiveIntensity??0)>.3?{kind:`emis`,ei:e.emissiveIntensity,gain:.1,screen:!0}:{kind:`none`},s.set(e,t)}t.kind!==`none`&&r.push({m:e,...t}),u(e)}n.nightMats=r}let l=new WeakSet;function u(e){if(l.has(e))return;l.add(e);let n=e.onBeforeCompile;if(!n||n===t.prototype.onBeforeCompile)return;let r=``;try{r=n.toString()}catch{return}if(!/totalEmissiveRadiance \+= diffuseColor\.rgb \*/.test(r))return;e.onBeforeCompile=function(e,t){n.call(this,e,t),e.fragmentShader=e.fragmentShader.replace(/totalEmissiveRadiance \+= diffuseColor\.rgb \* ([0-9.]+);/g,a.emissiveNightGain)};let i=e.customProgramCacheKey;e.customProgramCacheKey=function(){return(i?i.call(this):``)+`|dayTrans`},e.needsUpdate=!0}function d(){let e=r.windows;if(!n.nightMats){if(e<=0)return;c()}for(let t of n.nightMats)if(t.kind===`facade`){let n=t.m.userData.uniforms;n.uInteriorGain&&(n.uInteriorGain.value=t.gi*o(1,5,e)),n.uShopGain&&(n.uShopGain.value=t.gs*o(1,1.5,e))}else t.screen?t.m.emissiveIntensity=t.ei*i.value:t.m.emissiveIntensity=t.base0?t.ei*e:t.ei*o(1,t.gain??3,e)}return{scanNightMaterials:c,applyNightMaterials:d}}function an({scene:e,sky:t,tod:n,fog:r,fogBase:i,state:a,nightHaze:o,NH:s,sun:c,cascadedShadows:l,cityLights:u,city:d,nodeAmbient:f,nodeAmbientBase:m,nodeHemisphere:h,nodeHemisphereBase:g,sunTransmittance:_,ambShared:v,nightK:ee,screenK:y,syncNightMeshes:te,solarPosition:b,lookAt:x,smooth:S,lerp:C,applyNightMaterials:w}){let T=new M,E=new M;new p;let D={moon:!1,dir:E,color:new p,lastDir:new M(0,1,0)},O={dir:T,k:0};function k({elevation:c,azimuth:l,hour:p=null,name:E=`custom`,look:k=null},j=!1){n.name=E,n.hour=p??n.hour,n.elevation=c,n.azimuth=l;let M=c,N=S(-1,-8,M);n.night=N;let F=k??x(M),I=t.params,L=S(-3,2,M),R=S(-3,-10,M),ne=S(-10,1,M)**2;I.elevation=Math.max(M,-14),I.azimuth=l,I.lightScale=L*(F.sun??1);let re=F.warm;I.lightTint=[1+.1*re,1-.04*re,1-.3*re],I.skyTint=[.066*R+.01,.042*R+.007,.027*R+.005].map((e,t)=>C(e,1,ne)*(F.rain?[.95,.9,.7][t]:1));let z=S(10,1,M)*S(-9,-1.5,M)*(F.skyDusk??1);I.skyGlow=[.35*z+s.glow[0]*N,.16*z+s.glow[1]*N,.06*z+s.glow[2]*N],t.skyUniforms.uHzK.value.set(C(.56,.38,N),C(.63,.38,N),C(.78,.5,N)),I.night=N,I.stars=N*(1-ne)*.04,I.sunGlow=[1.05,.5,.08,(F.glow??1)*S(-4,1,M)];let ie=F.moonEl==null?b(((n.hour??22)+12)%24):{elevation:F.moonEl,azimuth:F.moonAz},ae=P.degToRad(Math.max(ie.elevation,14)),oe=P.degToRad(ie.azimuth);if(T.set(Math.cos(ae)*Math.cos(oe),Math.sin(ae),Math.cos(ae)*Math.sin(oe)).normalize(),O.k=R,D.moon=L<.001,D.moon){let e=_(ae,1.2),t=I.skyScale*.62*(.047*R+5e-4);D.color.setRGB(e[0]*t*.45,e[1]*t*.7,e[2]*t*1.4)}I.mie=F.mie,I.envSaturation=.92,I.cloudCoverage=F.clouds,I.overcast=F.overcast??0,I.cloudDensity=.7*(1+1.5*I.overcast);let se=F.envSpec??F.env;a.envIntensity=se,v.shape.z=F.env/se,r.density=i.density*C(F.fog,s.fog,N),o.k=N,r.startDistance=C(35,s.start,N),r.tint.setRGB(...F.fogTint),r.sunScatter=C(.25,.6+.6*S(20,3,M),L),r.shafts=C(.35,1,L)*(F.flare??1),n.exposure=F.exposure*C(1,4.5,N),n.bloom=1+1.6*N,n.windows=F.windows??S(3,-7,M),n.sunK=L*(F.flare??1),n.moonK=R,n.rain=F.rain??0,v.wx.x=F.wet??0,v.wx.z=n.rain,ee.value=n.windows,te(),y.value=Math.min(1.2,.9*C(1,.5,n.windows)/Math.max(n.exposure,.3)),A({env:!j});let ce=t.sunColor,le=Math.max(t.sunDir.y,0);v.grade.set(C(.98,.72,N),C(1,.93,N),C(1.03,1.36,N),F.envSat);let ue=(F.bounce??.4)*Math.max(le,.3*Math.min(1,le*8));v.bounce.set(ce.r*ue*1.08,ce.g*ue,ce.b*ue*.8,C(1,.04,N)),v.shape.w=(F.groundBounce??2.4)*(1-N),v.shape.y=C(1,.62,N),v.vert.set(F.vertFill??1,F.vertBounce??1,(1-(F.vertFill??1))*.8,+!!u.enabled);let B=n.windows;v.city.set(d.street*B,d.street*.72*B,d.street*.45*B,d.ts*B),e.environmentIntensity=a.envIntensity,f&&(f.intensity=C(m,.08,N)),h&&(h.intensity=C(g,.12,N)),w()}new M;function A({env:e=!0}={}){if(t.update(),D.moon)E.copy(T),c.color.copy(D.color);else{let e=P.degToRad(Math.max(t.params.elevation,2)),n=P.degToRad(t.params.azimuth);E.set(Math.cos(e)*Math.cos(n),Math.sin(e),Math.cos(e)*Math.sin(n)).normalize(),c.color.copy(t.sunColor)}(D.lastDir.angleTo(E)>.0012||e)&&(l.setSunDirection(E),D.lastDir.copy(E)),c.intensity=1;let n=Math.max(c.color.r,c.color.g,c.color.b,1e-6);c.color.multiplyScalar(1/n),c.intensity=n,e&&(a.envDirty=!0)}return{applyTod:k,applySun:A,moon:O}}function on({tod:e,state:t,applyTod:n,sky:r,scene:i,webGPUBackend:a,resolvePreset:o,lerp:s}){let c=[`vertFill`,`vertBounce`,`overcast`,`env`,`envSpec`,`envSat`,`sun`,`warm`,`fog`,`mie`,`clouds`,`exposure`,`bounce`,`groundBounce`,`glow`,`windows`,`wet`,`rain`,`flare`,`skyDusk`,`moonEl`,`moonAz`],l={on:!1,t:0,dur:2.5,from:null,to:null,envStep:-1,envTail:0},u=!1;function d(){return{elevation:e.elevation,azimuth:e.azimuth,name:e.name,look:{...e.look,fogTint:[...e.look.fogTint]}}}function f(t,{instant:r=!1}={}){let i=o(t);return r||!e.look?(l.on=!1,n(i),e.look=i.look,i.name):((l.on?l.to.name===i.name:e.name===i.name)||(l.from=d(),l.to=i,l.t=0,l.on=!0),i.name)}function p(n=`day`){return u?e.name:f(n,{instant:(t.upT||0)<3})}function m(t){l.t=Math.min(1,l.t+t/l.dur);let r=l.t*l.t*(3-2*l.t),i=l.from,o=l.to,u={...o.look};for(let e of c)i.look[e]!=null&&o.look[e]!=null&&(u[e]=s(i.look[e],o.look[e],r));u.fogTint=i.look.fogTint.map((e,t)=>s(e,o.look.fogTint[t],r));let d=((o.azimuth-i.azimuth)%360+540)%360-180;n({elevation:s(i.elevation,o.elevation,r),azimuth:i.azimuth+d*r,name:r<1?i.name+`>`+o.name:o.name,look:u},!0),e.look=u,l.t>=1&&(l.on=!1,l.envTail=1),!a&&l.envStep<0&&(l.envStep=0)}function h(){a?l.envStep=-1:l.envStep<0||(l.envStep<6?r.renderEnvFace(l.envStep++):(t.envTexture=r.finishEnv(),i.environment=t.envTexture,l.envStep=l.on||l.envTail-->0?0:-1))}let g=`day`;try{let e=new URLSearchParams(location.search),t=e.get(`tod`);t!=null&&(g=t),u=t!=null||e.has(`shot`)||e.has(`playtest`)}catch{}return f(g,{instant:!0}),{blend:l,setPreset:f,setTimeMode:p,stepBlend:m,stepEnv:h}}function sn(e,t){let n=new f(16777215,1);n.name=`NodeSun`,n.castShadow=!0,n.shadow.mapSize.set(t.shadowMapSize,t.shadowMapSize);let r=t.name===`high`?72:t.name===`med`?96:Math.min(180,t.shadowMapSize/10);n.shadow.camera.left=-r,n.shadow.camera.right=r,n.shadow.camera.top=r,n.shadow.camera.bottom=-r,n.shadow.camera.near=.1,n.shadow.camera.far=t.shadowFar*2,n.shadow.camera.updateProjectionMatrix(),n.shadow.bias=-8e-5,n.shadow.normalBias=.025;let i=typeof location<`u`?new URLSearchParams(location.search).get(`tslshadow`):null;n.shadow.intensity=i!==null&&i.trim()!==``&&Number.isFinite(Number(i))?Math.max(0,Math.min(1,Number(i))):1,n.shadow.radius=t.name===`low`?1:t.name===`high`?.65:.85,n.shadow.autoUpdate=!0,e.add(n,n.target);let a=new M(.5,.7,.3).normalize(),o=new M,s=!1;return{N:1,splits:t.splits,lights:[n],sun:n,setSunDirection(e){a.copy(e).normalize(),n.shadow.needsUpdate=!0},setFocus(e){s=!!e,e&&o.copy(e)},setCharacter(){},update(e){s||e.getWorldPosition(o),n.target.position.copy(o),n.position.copy(o).addScaledVector(a,t.shadowFar*.75),n.target.updateMatrixWorld(),n.updateMatrixWorld()}}}var cn={day:{elevation:65,azimuth:118,look:{vertFill:.55,vertBounce:.25,warm:.22,env:1,envSpec:.9,envSat:.9,sun:1.75,exposure:.9,clouds:.55,fog:.9,mie:.35,bounce:.4,groundBounce:1.25,glow:.15,fogTint:[.74,.84,1]}},morning:{elevation:16,azimuth:342,look:{vertFill:.6,vertBounce:.3,warm:.22,env:.58,envSat:.8,sun:1.65,exposure:1,clouds:.5,fog:1.2,mie:.9,bounce:.24,groundBounce:.8,glow:.45,fogTint:[.78,.86,1]}},sunrise:{elevation:4,azimuth:330,look:{vertFill:.65,vertBounce:.35,warm:.8,env:.5,bounce:.26,groundBounce:.9,glow:1.4,clouds:.5,skyDusk:1}},sunset:{elevation:7,azimuth:160,look:{vertFill:.65,vertBounce:.35,warm:.85,env:.52,bounce:.3,groundBounce:1,glow:1.5,clouds:.55,skyDusk:1.25}},dusk:{elevation:-4.5,azimuth:172,look:{vertFill:.8,vertBounce:.5,windows:.7,env:1.5,bounce:.2,groundBounce:.6,skyDusk:1.1,fogTint:[.78,.7,.72]}},night:{elevation:-14,azimuth:190,look:{windows:1,env:3,moonEl:36,moonAz:15,fogTint:[.38,.33,.32]}},overcast:{elevation:38,azimuth:125,look:{vertFill:.75,vertBounce:.5,sun:.18,env:1.6,envSpec:1,envSat:.4,warm:0,clouds:1,fog:2.6,mie:1.7,fogTint:[.82,.85,.88],exposure:.82,bounce:.1,groundBounce:.4,glow:0,wet:1,rain:1,windows:.3,flare:0,overcast:1}}};cn.dayB={elevation:55,azimuth:58,look:{...cn.day.look}},cn.dayC={elevation:44,azimuth:160,look:{...cn.day.look}};var ln={default:`day`,noon:`day`,afternoon:`day`,golden:`sunset`,dawn:`sunrise`,rain:`overcast`,cycle:`day`},un=(e,t,n)=>{let r=Math.max(0,Math.min(1,(n-e)/(t-e)));return r*r*(3-2*r)};function dn(e){let t=cn[e]?e:ln[e]??`day`,n=cn[t],r=nn(n.elevation),i={windows:un(3,-7,n.elevation),wet:0,rain:0,overcast:0,vertFill:1,vertBounce:1,flare:1,skyDusk:1,moonEl:36,moonAz:n.azimuth+180,...r,...n.look};return i.fogTint=[...n.look.fogTint??r.fogTint],{elevation:n.elevation,azimuth:n.azimuth,name:t,look:i}}var fn=`// surface shader sections.

// @section wetSurface

#if defined( STANDARD ) && !defined( USE_SKINNING ) && !defined( NO_WET ) && !defined( USE_TRANSMISSION )
{
  vec3 wetUp = ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz;
  float wetFlat = smoothstep( 0.93, 0.985, dot( normalize( normal ), wetUp ) );
  vec3 wetDc = material.diffuseColor;
  float wetMx = max( wetDc.r, max( wetDc.g, wetDc.b ) ), wetMn = min( wetDc.r, min( wetDc.g, wetDc.b ) );
  float wetGrey = 1.0 - smoothstep( 0.18, 0.4, ( wetMx - wetMn ) / max( wetMx, 1e-3 ) );
  float wetRain = ambData.wx.x; // (lighting2 r3) overcast rain: the whole city is wet
  if ( ambData.city.w > 0.0 ) { // (lighting2 r5) Times Square at night: glossy, damp asphalt / pavers mirror the screens (ts_night ref)
    vec3 twp = cameraPosition + ( - vViewPosition ) * mat3( viewMatrix );
    float tsM = smoothstep( 112.0, 80.0, abs( twp.x ) ) * smoothstep( -352.0, -325.0, twp.z ) * smoothstep( 22.0, 0.0, twp.z ) * step( twp.y, 1.0 );
    wetRain = max( wetRain, 0.75 * tsM * clamp( ambData.city.w * 8.0, 0.0, 1.0 ) );
  }
  if ( wetRain > 0.0 ) {
    // rain-soaked everything: darker, glossier (walls, cars, paint); flat ground: a continuous water film
    material.diffuseColor *= 1.0 - 0.22 * wetRain;
    material.roughness = mix( material.roughness, material.roughness * 0.45, wetRain );
    wetGrey = mix( wetGrey, 1.0, wetRain * 0.85 );
  }
  // (lighting2 r3) no puddles past ~1 km: far flat grey plates (hinterland, far shores) at grazing angles turned into
  // mirrors of the horizon glow (a pale band along the night horizon)
  wetFlat *= 1.0 - smoothstep( 700.0, 1300.0, length( vViewPosition ) );
  wetFlat *= max( ambData.wx.w, clamp( wetRain * 4.0, 0.0, 1.0 ) ); // (user r-nopuddles) Settings > Puddles off: no water on the ground in dry weather (rain still wets it)
  if ( wetFlat * wetGrey > 0.01 ) {
    vec3 wetP = cameraPosition + ( - vViewPosition ) * mat3( viewMatrix );
    vec2 q = wetP.xz;
    // cheap value noise, 2 octaves (big puddle fields + ragged edges)
    vec2 i0 = floor( q / 7.0 ), f0 = fract( q / 7.0 ); f0 = f0 * f0 * ( 3.0 - 2.0 * f0 );
    #define WH(v) fract( sin( dot( v, vec2( 127.1, 311.7 ) ) ) * 43758.5453 )
    float n0 = mix( mix( WH( i0 ), WH( i0 + vec2( 1, 0 ) ), f0.x ), mix( WH( i0 + vec2( 0, 1 ) ), WH( i0 + vec2( 1, 1 ) ), f0.x ), f0.y );
    vec2 i1 = floor( q / 1.9 ), f1 = fract( q / 1.9 ); f1 = f1 * f1 * ( 3.0 - 2.0 * f1 );
    float n1 = mix( mix( WH( i1 ), WH( i1 + vec2( 1, 0 ) ), f1.x ), mix( WH( i1 + vec2( 0, 1 ) ), WH( i1 + vec2( 1, 1 ) ), f1.x ), f1.y );
    #undef WH
    float wetN = n0 * 0.72 + n1 * 0.28;
    float wetH = mix( 0.4, 1.0, smoothstep( 4.0, 10.0, wetP.y ) ); // streets: fewer / smaller puddles than roofs
    float wetT = 0.3 * wetRain; // rain: puddles grow, the rest of the ground is a damp film
    // (zfix) dry presets (no rain): ~35-40 % fewer / smaller puddles, pooled mostly in the kerb gutters of the grid
    // roads, in low spots (a 23 m noise field) and around the roof drains; the rain look (wetRain > 0) is unchanged
    float wetSh = 0.0, wetDry = max( __SHADER_INJECT_0__ - clamp( wetRain * 4.0, 0.0, 1.0 ), 0.0 ); // ?oldpuddles: the previous dry look (A/B)
    if ( wetDry > 0.0 ) {
      vec2 lq = q / 23.0 + vec2( 5.3, 9.01 ), li = floor( lq ), lf = fract( lq ); lf = lf * lf * ( 3.0 - 2.0 * lf );
      #define WL(v) fract( sin( dot( v, vec2( 269.5, 183.3 ) ) ) * 43758.5453 )
      float wetL = mix( mix( WL( li ), WL( li + vec2( 1, 0 ) ), lf.x ), mix( WL( li + vec2( 0, 1 ) ), WL( li + vec2( 1, 1 ) ), lf.x ), lf.y );
      #undef WL
      float wetLow = smoothstep( 0.45, 0.8, wetL ) * ( wetP.y > 4.0 ? 1.0 : 0.45 ), wetGut = 0.0;
      if ( wetP.y < 0.1 && wetP.z < __SHADER_INJECT_1__ && !( wetP.x > __SHADER_INJECT_2__ && wetP.x < __SHADER_INJECT_3__ && wetP.z > __SHADER_INJECT_4__ && wetP.z < __SHADER_INJECT_5__ ) ) {
        float dk = 9.0; // distance inside the roadway to the nearest kerb line (grid avenues + streets)
        __SHADER_INJECT_6__
        float zc = floor( wetP.z / __SHADER_INJECT_7__ + 0.5 ) * __SHADER_INJECT_8__, hw = __SHADER_INJECT_9__;
        __SHADER_INJECT_10__
        __SHADER_INJECT_11__
        float dz = abs( wetP.z - zc ); if ( dz < hw ) dk = min( dk, hw - dz );
        wetGut = 1.0 - smoothstep( 0.4, 1.6, dk );
      }
      wetSh = wetDry * ( 0.095 - 0.13 * max( wetGut, wetLow ) );
    }
    float wetM = smoothstep( 0.63 + 0.05 * ( 1.0 - wetH ) - wetT + wetSh, 0.7 + 0.05 * ( 1.0 - wetH ) - wetT + wetSh - 0.01 * wetDry, wetN ) * wetFlat * wetGrey;
    float damp = max( smoothstep( 0.48 + wetSh + 0.02 * wetDry, 0.62 + wetSh + 0.02 * wetDry, wetN ), wetRain ) * wetFlat * wetGrey; // damp rim: darker, semi-glossy
    if ( wetRain * wetM > 0.01 ) { // rain ripples on the puddles: expanding rings in two jittered cell layers
      vec2 rg = vec2( 0.0 );
      for ( int k = 0; k < 2; k++ ) {
        vec2 rq = q / ( 0.55 + 0.3 * float( k ) ) + float( k ) * 7.31;
        vec2 rc = floor( rq ), rf = fract( rq ) - 0.5;
        float rh = fract( sin( dot( rc, vec2( 12.99, 78.23 ) ) ) * 43758.55 );
        vec2 ro = rf - ( vec2( fract( rh * 7.1 ), fract( rh * 13.7 ) ) - 0.5 ) * 0.5;
        float rt = fract( ambData.wx.y * 1.1 + rh ), rd = length( ro );
        float ring = sin( ( rd - rt * 0.5 ) * 45.0 ) * exp( - pow( ( rd - rt * 0.5 ) * 14.0, 2.0 ) ) * ( 1.0 - rt );
        rg += ro / max( rd, 1e-3 ) * ring;
      }
      normal = normalize( normal + ( viewMatrix * vec4( rg.x, 0.0, rg.y, 0.0 ) ).xyz * 0.35 * wetM * wetRain );
    }
    material.roughness = mix( material.roughness, 0.3, damp * 0.6 );
    material.roughness = mix( material.roughness, 0.045, wetM );
    material.diffuseColor *= 1.0 - 0.28 * damp - 0.22 * wetM;
    material.specularColor = mix( material.specularColor, vec3( 0.02 ), wetM ); // a water film: dielectric F0 whatever lies below
    material.specularF90 = mix( material.specularF90, 1.0, wetM );
  }
}
#endif

// @section additiveOutput

#if defined( STANDARD ) && defined( OPAQUE ) && !defined( NO_SSR ) && !defined( USE_TRANSMISSION )
{
  float ssrRough = material.roughness;
  vec3 ssrF = EnvironmentBRDF( normal, geometryViewDir, material.specularColor, material.specularF90, ssrRough );
  float ssrW = dot( ssrF, vec3( 0.2126, 0.7152, 0.0722 ) ) * ( 1.0 - smoothstep( 0.16, 0.36, ssrRough ) );
  #ifdef USE_CLEARCOAT
    vec3 ssrC = EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
    ssrW = max( ssrW, material.clearcoat * dot( ssrC, vec3( 0.2126, 0.7152, 0.0722 ) ) * ( 1.0 - smoothstep( 0.16, 0.36, material.clearcoatRoughness ) ) );
  #endif
  pc_fragColor.a = 1.0 + clamp( ssrW, 0.0, 0.98 );
}
#endif

// @section environmentDeclarations

struct AmbData { vec4 grade; vec4 bounce; vec4 shape; vec4 city; vec4 wx; vec4 vert; vec4 cgrid; };
uniform AmbData ambData;

// @section environmentLighting
vec3 irr = PI * envMapColor.rgb * envMapIntensity;
			float irrL = dot( irr, vec3( 0.2126, 0.7152, 0.0722 ) );
			irr = mix( vec3( irrL ), irr, ambData.grade.w ) * ambData.grade.rgb;
			float down = clamp( 0.5 - 0.5 * worldNormal.y, 0.0, 1.0 );
			irr *= mix( 1.0, ambData.shape.y, clamp( worldNormal.y, 0.0, 1.0 ) );
			// (atmosphere r3) street-level inter-reflection: in the canyons the sunlit asphalt, sidewalks and facades
			// bounce a lot of warm light onto everything standing in shade (people, cars, shop fronts, lower walls).
			// Stronger near the ground, fading with height (so tower shade sides seen from the air keep their contrast)
			float bGround = 1.0;
			#ifndef FLAT_SHADED
			{
				float wy = cameraPosition.y + dot( viewMatrix[ 1 ].xyz, - vViewPosition );
				// (lighting2 r2) + a long-range tail: tall shaded facades still see sunlit roofs / facades across the street
				// (off-screen for SSGI), so walls keep some warm fill tens of metres up
				irr *= 1.0 - ambData.vert.z * ( 1.0 - smoothstep( 2.0, 30.0, wy ) ); // (lighting2 r6) street-canyon skylight occlusion: cars / props / people in the canyon see a slot of sky
				bGround += ambData.shape.w * ( exp( - max( wy, 0.0 ) / 26.0 ) + 0.3 * exp( - max( wy, 0.0 ) / 150.0 ) ) * ( 1.0 - 0.7 * clamp( worldNormal.y, 0.0, 1.0 ) )
					* mix( 1.0, ambData.vert.y, 1.0 - abs( worldNormal.y ) ); // (lighting2 r6) user: walls / objects in shade too bright
			}
			#endif
			irr += ambData.bounce.rgb * mix( ambData.shape.x, 1.0, down * sqrt( down ) ) * bGround * envMapIntensity;
			irr *= ( ambData.shape.z > 0.0 ? ambData.shape.z : 1.0 ); // (atmosphere r2) diffuse-only IBL gain
			irr *= mix( 1.0, ambData.vert.x, smoothstep( 0.2, 0.85, 1.0 - abs( worldNormal.y ) ) ); // (lighting2 r6) vertical-surface fill: shaded facades / objects read dark (refs: 5-8:1 sun : shade on walls)
			// (lighting2 r3) NIGHT CITY LIGHT (night_aerial / ts_night refs): sodium street lighting fills the street level
			// (orange lines seen from above, lit sidewalks / lower facades / cars / people), and Times Square is bathed in
			// the coloured light of its screens (projected colour field: magenta / blue / cyan / warm, fading with height)
			#if !defined( FLAT_SHADED ) && !defined( NO_CITYLIGHT ) // NO_CITYLIGHT: far shores / other boroughs (farshore.ts)
			if ( ambData.city.r + ambData.city.w > 0.0 ) {
				vec3 cwp = cameraPosition + ( - vViewPosition ) * mat3( viewMatrix );
				float cy = max( cwp.y, 0.0 ), cup = clamp( worldNormal.y, 0.0, 1.0 );
				// lamp rhythm along the streets (~30 m) so the light is not a flat wash
				float lr = 0.7 + 0.3 * sin( cwp.x * 0.21 + 1.3 ) * sin( cwp.z * 0.19 );
				// only the modelled city (the far shores / hinterland ground plates would light up as one glowing band)
				float cfar = smoothstep( 2600.0, 1300.0, length( cwp.xz - cameraPosition.xz ) );
				if ( ambData.cgrid.w > 0.0 ) { vec2 gq = abs( ( cwp.xz - ambData.cgrid.xy ) / ambData.cgrid.z * 2.0 - 1.0 ); cfar *= max( smoothstep( 0.8, 0.98, max( gq.x, gq.y ) ), 0.6 * smoothstep( 220.0, 420.0, length( cwp - cameraPosition ) ) ); } // far inside the grid only ~5 lights per pixel (LOD): keep part of the analytic glow (critic r2: only one avenue glows from above) // (night) inside the local-light grid the real lamps light the street (cityLights.ts); the analytic glow takes over at its edge
				irr += ambData.city.rgb * ( exp( - cy / 4.5 ) * ( 0.45 + 0.55 * cup ) * lr + 0.12 * exp( - cy / 18.0 ) ) * cfar;
				if ( ambData.city.w > 0.0 ) {
					vec2 tq = cwp.xz;
					float inTS = smoothstep( 112.0, 70.0, abs( tq.x ) ) * smoothstep( -352.0, -318.0, tq.y ) * smoothstep( 22.0, -6.0, tq.y );
					if ( inTS > 0.0 ) {
						float ph = tq.y * 0.021 + tq.x * 0.013 + 0.35 * sin( tq.y * 0.047 + tq.x * 0.03 );
						vec3 c1 = mix( vec3( 1.0, 0.25, 0.7 ), vec3( 0.25, 0.45, 1.0 ), 0.5 + 0.5 * sin( ph * 6.2831 ) );
						vec3 c2 = mix( vec3( 0.2, 0.9, 1.0 ), vec3( 1.0, 0.7, 0.35 ), 0.5 + 0.5 * sin( ph * 4.1 + 1.7 ) );
						vec3 tc = mix( c1, c2, 0.5 + 0.5 * sin( tq.x * 0.05 - tq.y * 0.031 ) );
						tc = max( tc - 0.55 * min( tc.r, min( tc.g, tc.b ) ), 0.0 ) * 1.4; // (lighting2 r4) saturated magenta / cyan / amber spill, not white
						float th = exp( - cy / 22.0 ) * ( 0.55 + 0.45 * cup ) + 0.35 * exp( - cy / 70.0 ) * ( 1.0 - cup );
						th += ambData.vert.w * 0.9 * smoothstep( 12.0, 35.0, cy ) * exp( - max( cy - 35.0, 0.0 ) / 60.0 ); /* (night r9) 1.6: upper facades read lavender, ref walls between screens are near-black */ // (night r5) roofs / ledges around the square bathed in the screens' colour (ts_perch ref: pink ledge)
						irr += tc * ( ambData.city.w * inTS * th ) * ( 1.0 - ambData.vert.w * ( 1.0 - mix( 0.4, 0.35, smoothstep( 18.0, 40.0, cy ) ) ) ); /* (night r6) 40 % at street level too: warm-magenta plaza fill (critic: plazas ~45 % under the ref) */ // (night r5) above the street the analytic screen-colour field stays at 60%: roofs / upper facades around the square pick up the magenta glow (critic r4: TS perch roof black) // (night) real screen lights (screenlights.ts) replace this analytic spill; city.w still drives the damp TS asphalt
					}
				}
			}
			#endif
			return irr;
`,pn=G(()=>fn),mn={grade:new T(1,1,1,.6),bounce:new T(0,0,0,1),vert:new T(1,1,0,0),wx:new T(0,0,0,1),cgrid:new T(0,0,512,0),city:new T(0,0,0,0),shape:new T(.25,1,0,0)},hn=!1;function gn(e={}){if(hn)return;hn=!0;let t=R,n=e.wet!==!1;try{new URLSearchParams(location.search).has(`nowet`)&&(n=!1)}catch{}let r=!1;try{r=new URLSearchParams(location.search).has(`oldpuddles`)}catch{}let i=K(pn.wetSurface,r?`0.0`:`1.0`,Ve.z0.toFixed(1),ze.x0.toFixed(1),ze.x1.toFixed(1),ze.z0.toFixed(1),ze.z1.toFixed(1),Le.map(e=>`dk = min( dk, ${He.AV_HALF.toFixed(2)} - abs( wetP.x - ${e.toFixed(1)} ) + step( ${He.AV_HALF.toFixed(2)}, abs( wetP.x - ${e.toFixed(1)} ) ) * 99.0 );`).join(` `),He.ST_SP.toFixed(1),He.ST_SP.toFixed(1),He.ST_HALF.toFixed(2),Be.map(e=>`hw = abs( zc - ${e.toFixed(1)} ) < 1.0 ? ${9 .toFixed(2)} : hw;`).join(` `),q.map(e=>`hw = abs( zc - ${e.toFixed(1)} ) < 1.0 ? ${Re.toFixed(2)} : hw;`).join(` `));n&&!t.lights_physical_fragment.includes(`wetFlat`)&&(t.lights_physical_fragment+=i);let a=pn.additiveOutput;t.opaque_fragment.includes(`ssrW`)||(t.opaque_fragment+=a);let o=t.envmap_physical_pars_fragment,s=`return PI * envMapColor.rgb * envMapIntensity;`;if(o.includes(s)&&!o.includes(`ambData`)){t.envmap_physical_pars_fragment=pn.environmentDeclarations+o.replace(s,pn.environmentLighting);for(let e of[`standard`,`physical`,`lambert`,`phong`,`toon`]){let t=ne[e];t&&(t.uniforms.ambData={value:mn})}}else o.includes(`ambData`)||console.warn(`[render/surface] could not patch envmap_physical_pars_fragment`)}var _n=G(()=>Yt),vn=P.lerp,yn=(e,t,n)=>{let r=P.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function bn({renderer:e,scene:t}){let n=Ce(),r=we(),i=Te(e);n||gn(i);let a=!!e.capabilities?.reversedDepthBuffer;e.shadowMap.enabled=!0,e.shadowMap.type=1,e.shadowMap.autoUpdate=!0;let o=Wt(e,i);r&&(o.environmentTexture,t.environment=null),n&&t.add(o.mesh);let s=n?sn(t,i):new Me({scene:t,quality:i,reversed:a,renderer:e});n?typeof location<`u`&&new URLSearchParams(location.search).has(`nocl`)&&(be.enabled=!1):W(e,t);let c=s.sun;t.background=null;let l=i.name===`low`?.65:i.name===`high`?.4:.5,u=i.name===`low`?.95:i.name===`high`?.65:.8,d=n?new j(12109016,l):null,f=n?new v(13623551,8023904,u):null;d&&t.add(d),f&&t.add(f);let m={density:13e-5,heightFalloff:1/300},h={density:m.density,heightFalloff:m.heightFalloff,sunScatter:.6,tint:new p(.84,.9,1),startDistance:35,shafts:1},g={name:`default`,hour:14.5,elevation:47,azimuth:118,night:0,exposure:1,bloom:1,windows:0},_={envDirty:!0,envTexture:null,envIntensity:.95,envTimer:0,nightMats:null,nightScan:0},ee={street:.5,ts:.13},y={low:[.0125,.0115,.0165],high:[.008,.008,.012],glow:[.012,.009,.011],fog:4,start:120,glowCol:[.022,.013,.0075],glowH:22,glowK:.004},te={k:0,low:y.low,high:y.high,cfg:y},{scanNightMaterials:b,applyNightMaterials:x}=rn({scene:t,state:_,tod:g,screenK:Oe,lightingShader:_n,lerp:vn}),{applyTod:S,applySun:C,moon:w}=an({scene:t,sky:o,tod:g,fog:h,fogBase:m,state:_,nightHaze:te,NH:y,sun:c,cascadedShadows:s,cityLights:be,city:ee,nodeAmbient:d,nodeAmbientBase:l,nodeHemisphere:f,nodeHemisphereBase:u,sunTransmittance:Ct,ambShared:mn,nightK:De,screenK:Oe,syncNightMeshes:Ae,solarPosition:en,lookAt:nn,smooth:yn,lerp:vn,applyNightMaterials:x}),{blend:T,setPreset:E,setTimeMode:D,stepBlend:O,stepEnv:k}=on({tod:g,state:_,applyTod:S,sky:o,scene:t,webGPUBackend:r,resolvePreset:dn,lerp:vn}),A=new M,N={sun:c,cascadedShadows:s,sky:o,fog:h,quality:i,reversed:a,tod:g,amb:mn,city:ee,cityLights:be,cityVol:{strength:1,density:.0045,height:30},nightHaze:te,get timeOfDay(){return g.name},get envIntensity(){return _.envIntensity},set envIntensity(e){_.envIntensity=e,t.environmentIntensity=e},setSun({elevation:e,azimuth:t}={}){T.on=!1,S({elevation:e??g.elevation,azimuth:t??g.azimuth,name:`custom`,look:g.look})},refresh(){C()},setupMaterial(){},get preset(){return g.name},setTimeOfDay(e){return E(e,{instant:!0})},setPreset(e){return E(e)},setTimeMode:D,nightK:De,moon:w,setDryPuddles(e=!0){mn.wx.w=+!!e},get cycle(){return{on:!1,hour:g.hour??12,minutes:0}},presets:Object.keys(cn),update(e,a=1/60){let c=performance.now()/1e3,l=_.lastT?Math.min(c-_.lastT,.1):a;_.lastT=c,T.on&&O(l),k(),t.environmentIntensity=_.envIntensity,mn.wx.y=performance.now()/1e3,Ee(),ke.value=performance.now()/1e3,_.upT=(_.upT||0)+a,g.windows>0&&(_.nightScan+=a)>(_.upT<20?1:6)&&(_.nightScan=0,b(),x()),_.envDirty&&=(_.envTexture=o.renderEnv(),r||(t.environment=_.envTexture),!r&&_.envTexture&&console.log(`PMREM texture diagnostics:`,{mapping:_.envTexture.mapping,width:_.envTexture.image?.width,height:_.envTexture.image?.height,isTexture:_.envTexture.isTexture,isRenderTargetTexture:_.envTexture.isRenderTargetTexture,image:_.envTexture.image}),t.environmentIntensity=_.envIntensity,!1),e.updateMatrixWorld();let u=typeof window<`u`?window.__ctx?.player?.object:null;if(u?(u.getWorldPosition(A),s.setFocus(A),(_.charScan=(_.charScan||0)+1)%30==1&&s.setCharacter(u)):s.setFocus(null),s.update(e,t),n){let n=i.name===`low`?4:i.name===`high`?16:8;be.buildNode(e,t,n)}else be.build(e);if(!n){let e=be.shared.origin;mn.cgrid.set(e.x,e.y,e.z*64,e.w)}}};return typeof window<`u`&&(window.setTOD=e=>E(e),window.__nightK=De,window.__cityLights=be),N}var xn=e=>({traverse(t){for(let n of e)t(n)},traverseVisible:()=>{}}),Sn=e=>(e.isMesh||e.isPoints||e.isLine||e.isSprite)&&e.material;function Cn(e,t,n,{mirrorLayers:r=null,maxProgramsPerStep:i=4,compileBudgetMs:a=2}={}){let o=new S(1,1,{type:ee}),s=new WeakSet,c=new WeakSet,l=[],u=[],d=0,f=0,p=n.clone();if(p.layers.disableAll(),r)for(let e of r)p.layers.enable(e);let m=Y.camera,h={rescan(){d||=performance.now(),t.traverse(e=>{Sn(e)&&(s.has(e)||(s.add(e),l.push(0,e)),r&&!c.has(e)&&(e.layers.test(p.layers)||e.isMesh&&(e.castShadow||/^(facade|roofs|facadeLod)\b/.test(e.name||``))&&!/^detail\b/.test(e.name||``)&&!e.userData?.smallCasters)&&(c.add(e),l.push(1,e)))});for(let e of Y.registeredPasses)s.has(e.mesh)||(s.add(e.mesh),l.push(2,e.mesh))},get pending(){return l.length/2},settle(e=null,t=25e3){let n=u.slice(),r=n.length,i=performance.now();return new Promise(a=>{let o=n.slice(),s=0,c=()=>{let n=performance.now(),l=0;for(;s<o.length&&l<32&&performance.now()-n<3;)o[s].isReady?.()??!0?(o[s]=o[o.length-1],o.pop()):s++,l++;e?.(r?(r-o.length)/r:1);let u=s>=o.length,d=performance.now()-i>t;o.length===0||d&&u?(console.log(`[warmup] ${r-o.length}/${r} programs linked before the first frame (${((performance.now()-i)/1e3).toFixed(1)} s)`),a()):u?(s=0,setTimeout(c,d?0:60)):setTimeout(c,0)};c()})},flush(){let e=i,t=a;i=1/0,a=1/0,u.length=0;try{h.step(!0)}finally{i=e,a=t}},step(r=!1){if(!l.length)return!1;if(u=u.filter(e=>!(e.isReady?.()??!0)),u.length&&!r)return!0;let s=e.info.programs,c=s.length,h=e.getRenderTarget(),g=e.shadowMap.enabled;e.setRenderTarget(o);try{let r=0,o=performance.now();for(;r<l.length&&s.length-c<i&&performance.now()-o<a;){let i=l[r],a=l[r+1];r+=2,i===1?(e.shadowMap.enabled=!1,e.compile(xn([a]),p,t),e.shadowMap.enabled=g):i===2?e.compile(xn([a]),m,xn([])):e.compile(xn([a]),n,t)}l=l.slice(r)}catch(e){console.warn(`[warmup]`,e),l=[]}finally{e.shadowMap.enabled=g,e.setRenderTarget(h)}for(let e=c;e<s.length;e+=1)u.push(s[e]);return f+=s.length-c,l.length||console.log(`[warmup] ${f} programs queued so far (${s.length} total), ${((performance.now()-d)/1e3).toFixed(1)} s`),l.length>0}};return h}var wn=e=>typeof e==`object`&&!!e&&Object.getPrototypeOf(e)===Object.prototype;function Tn(e,t,n,r=new Set,i=0){if(!(!e||i>5)){if(e.isTexture)n(e,t);else if(!(typeof e!=`object`||r.has(e))){if(r.add(e),Array.isArray(e))e.forEach((e,a)=>Tn(e,`${t}[${a}]`,n,r,i+1));else if(wn(e))for(let[a,o]of Object.entries(e))Tn(o,`${t}.${a}`,n,r,i+1)}}}function En(e){return`${e.type||e.constructor?.name||`Object`}#${e.name||e.id}`}function Dn(e){let t=e.image??e.source?.data,n=Array.isArray(t)?t.find(Boolean):t,r=e.mipmaps?.[0],i=e.renderTarget;return{width:n?.width||n?.videoWidth||n?.naturalWidth||r?.width||i?.width||0,height:n?.height||n?.videoHeight||n?.naturalHeight||r?.height||i?.height||0}}function On(e,t){let n=new Map,r=(e,t)=>{let r=n.get(e);r||(r={texture:e,references:new Set},n.set(e,r)),r.references.add(t)};t.background?.isTexture&&r(t.background,`scene.background`),t.environment?.isTexture&&r(t.environment,`scene.environment`),t.traverse(e=>{let t=Array.isArray(e.material)?e.material:e.material?[e.material]:[];for(let n of t){let t=`${En(e)} / ${n.name||n.type}`;for(let[e,i]of Object.entries(n))e!==`uniforms`&&Tn(i,`${t}.${e}`,r);for(let[e,i]of Object.entries(n.uniforms??{}))Tn(i?.value,`${t}.uniforms.${e}`,r)}});let i=[],a=[],o=[],s=0,c=0,l=0,u=e.backend,d=typeof u?.get==`function`;for(let{texture:t,references:r}of n.values()){let{width:n,height:f}=Dn(t),p=!!t.isRenderTargetTexture,m=p||n>0&&f>0,h=d?u.get(t):null,g=u?.isWebGLBackend?h?.textureGPU:h?.texture,_=!!(g&&h?.version===t.version&&h?.isDefaultTexture!==!0),v=e.properties?.get?.(t),ee=v?.__webglTexture,y=!!(ee&&v.__version===t.version),te=d?_:y,b=p&&!!(d?g:ee),x=!p&&te,S=t.name||`${t.constructor?.name||`Texture`} ${t.uuid?.slice(0,8)||``}`,C=m?x?`GPU UPLOADED`:p?b?`RENDER TARGET READY`:`RENDER TARGET NOT INITIALIZED`:`NOT GPU UPLOADED (not sampled yet)`:`INVALID SOURCE`;m||a.push({name:S,references:[...r]}),m&&!x&&!p&&o.push({name:S,references:[...r]}),x&&s++,p&&c++,b&&l++,i.push({texture:S,source:n>0&&f>0?`${n}x${f}`:`missing dimensions`,status:C,references:[...r].slice(0,3).join(`; `),moreReferences:Math.max(0,r.size-3)})}let f={textures:n.size,uploaded:s,notUploaded:o.length,invalidSources:a.length,renderTargets:c,readyRenderTargets:l,rendererTextureCount:e.info?.memory?.textures},p=a.length?`[texture-audit] ISSUES FOUND: ${a.length} texture source(s) invalid`:`[texture-audit] ${n.size} scene texture(s) checked`;if(console.groupCollapsed(p),console.info(`Summary:`,f),a.length)for(let e of a)console.error(`Texture has no valid image dimensions:`,e);return o.length&&console.warn(`${o.length} referenced texture(s) have not been uploaded to the GPU yet. They may belong to objects outside the current view; run window.auditSceneTextures() again after viewing them.`,o),i.length?console.table(i):console.warn(`No textures are currently referenced by scene materials.`),console.groupEnd(),f}export{Jt as i,Cn as n,bn as r,On as t};
//# sourceMappingURL=render~index-BMZ_kAex.js.map