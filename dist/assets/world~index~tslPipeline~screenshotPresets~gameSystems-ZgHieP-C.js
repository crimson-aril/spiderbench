import{$r as e,Ht as t,Nr as n,Qi as r,Rt as i,U as a,Wn as o,Yt as s,_a as c,_r as l,cr as u,do as d,ei as ee,fa as te,ft as f,io as p,ir as m,kr as ne,ro as h,to as g,tr as _,wr as v,zi as y}from"./three~index~combat~tslPipeline~screenshotPresets~gameSystems~GLTFLoader-B3xvqeNo.js";import{n as b,r as x}from"./three~index~tslPipeline~screenshotPresets~gameSystems-XhDerpBe.js";import{i as re}from"./vehicleLighting-Cqq_fzGi.js";function ie(e,...t){let n=e;for(let e=0;e<t.length;e++)n=n.replaceAll(`__SHADER_INJECT_${e}__`,String(t[e]));return n}function ae(e){if(typeof e!=`string`)throw TypeError(`Shader source is missing; check that the GLSL ?raw import resolves to a string.`);let t=[...e.matchAll(/^\/\/ @section ([A-Za-z][A-Za-z0-9_]*)\r?$/gm)],n=Object.create(null);for(let r=0;r<t.length;r+=1){let i=t[r];if(!i||i.index===void 0)throw Error(`Invalid GLSL section marker.`);let a=i[0],o=i[1];if(!a||!o||Object.hasOwn(n,o))throw Error(`Duplicate or invalid GLSL section name: ${o??`<empty>`}`);let s=i.index+a.length,c=t[r+1]?.index??e.length;n[o]=e.slice(s,c).replace(/^\r?\n/,``)}if(t.length===0)throw Error("Combined GLSL file has no `// @section name` markers.");return n}function oe(e){if(typeof e==`string`)return e;if(e&&typeof e==`object`){let t=e.default;if(typeof t==`string`)return t}throw TypeError(`Shader source is missing; check that the GLSL ?raw import resolves to a string (received ${e===null?`null`:typeof e}).`)}function se(e){let t;return new Proxy(Object.create(null),{get(n,r,i){return typeof r==`string`?(t??=ae(oe(e())),t[r]):Reflect.get(n,r,i)}})}var ce=`// citylights shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexBeginVertex
#include <begin_vertex>
#ifdef USE_INSTANCING
transformed -= normalize(normal) * 0.2;
#endif

// @section lightDeclarations

// (r11) fallbacks set per material by fixPrograms() on GPUs with 16 fragment texture units (Apple / ANGLE D3D11):
// CITYL_NOSH drops the shadow-map sampler, CITYL_OFF the city lights entirely (the program would not link)
#ifdef CITYL_OFF
#undef USE_CITYL
#endif
// (r13) CITYL_UNIF: no city-light textures at all: the CL_UN lights that light the player most arrive as a uniform array
// (cityLU, same 4-texel records; count in cityLU[ CL_UN * 4 ].x). For materials that are over the unit limit even without
// the shadow sampler (the suit on the Mac: 16 of its own), so Spider-Man is still lit by the lamps / cars / screens
#ifdef CITYL_UNIF
#define CITYL_NOSH
#endif
#ifdef USE_CITYL
#ifndef CITYL_PARS
#define CITYL_PARS
#ifdef CITYL_UNIF
struct CityL {
vec4 origin;
vec4 misc;
mat4 shM[__SHADER_INJECT_0__];
vec4 shW;
};
uniform vec4 cityLU[__SHADER_INJECT_1__];
#elif defined( CITYL_NOSH )
struct CityL {
sampler2D data;
highp usampler2D grid;
vec4 origin;
vec4 misc;
mat4 shM[__SHADER_INJECT_2__];
vec4 shW;
};
#else
struct CityL {
sampler2D data;
highp usampler2D grid;
vec4 origin;
vec4 misc;
mat4 shM[__SHADER_INJECT_3__];
sampler2D shMap;
vec4 shW;
};
#endif
uniform CityL cityL;
#ifdef CITYL_UNIF
vec4 cityLTex(int li, int k) {
return cityLU[li * 4 + k];
}
#else
vec4 cityLTex(int li, int k) {
return texelFetch(cityL.data, ivec2((li & 255) * 4 + k, li >> 8), 0);
}
#endif
// shadow of slot s at wp (dist: distance to the light, range: its range): 3x3 PCF of the distance map, faded by shW
float cityLShadow(int s, vec3 wp, float dist, float range) {
#ifdef CITYL_NOSH
return 1.0;
#else
vec4 cp = cityL.shM[s] * vec4(wp, 1.0);
if(cp.w <= 0.0) return 1.0;
vec2 uv = cp.xy / cp.w * 0.5 + 0.5;
if(any(lessThan(uv, vec2(0.004))) || any(greaterThan(uv, vec2(0.996)))) return 1.0;
vec2 tile = vec2(float(s & 1), float(s >> 1)) * 0.5;
vec2 tuv = tile + uv * 0.5;
const float tx = 1.0 / float(__SHADER_INJECT_4__);
float fd = dist / range - (0.05 + dist * 0.02) / range; // receiver bias grows with the texel footprint
float vis = 0.0;
// 3x3 taps on a rotated grid (breaks up texel stair-steps), footprint ~2.5 texels
const mat2 R = mat2(0.866, 0.5, - 0.5, 0.866);
for(int j = - 1;
j <= 1;
j ++) for(int i = - 1;
i <= 1;
i ++) {
vec2 q = clamp(tuv + R * vec2(float(i), float(j)) * tx * 1.25, tile + tx, tile + 0.5 - tx);
vis += step(fd, textureLod(cityL.shMap, q, 0.0).r);
}
float w = s == 0 ? cityL.shW.x : s == 1 ? cityL.shW.y : s == 2 ? cityL.shW.z : cityL.shW.w;
return mix(1.0, vis / 9.0, w);
#endif
}
// incident light of city light li at world point wp: returns the colour (0 if none), world direction to the light and
// the source-size roughness widening
// (night r10) specular representative point (Karis 2013): cityLSpecDir = direction to the point of the emitter closest to
// the reflection ray cityLRefl (set by the caller, world space; zero = unused), cityLAng = the emitter's angular size
// (for the energy normalisation (a / a')^2 in the caller)
vec3 cityLRefl = vec3(0.0), cityLSpecDir = vec3(0.0, 1.0, 0.0);
float cityLAng = 0.0;
vec3 cityLIncident2(int li, vec3 wp, out vec3 Ldir, out float widen, out float specK) {
vec4 a = cityLTex(li, 0);
Ldir = vec3(0.0, 1.0, 0.0);
widen = 0.0;
specK = 1.0;
cityLAng = 0.0;
vec3 lp = a.xyz, L0 = lp - wp;
float dc2 = dot(L0, L0);
if(dc2 > a.w * a.w) return vec3(0.0); // out of range (rects: a.w = range + half diagonal, from the centre): skip the other 3 fetches
vec4 b = cityLTex(li, 1), c = cityLTex(li, 2), d = cityLTex(li, 3);
float type = floor(b.w);
if(type > 1.5) { // rect emitter (screen / lit window): representative point = closest point of the rectangle
vec3 rel = wp - lp;
float side = dot(rel, c.xyz);
if(side <= 0.02) return vec3(0.0);
vec3 v = cross(c.xyz, d.xyz);
float du = clamp(dot(rel, d.xyz), - c.w, c.w), dv = clamp(dot(rel, v), - d.w, d.w);
vec3 L = lp + d.xyz * du + v * dv - wp;
float d2 = dot(L, L);
float dist = sqrt(d2);
Ldir = L / max(dist, 1e-4);
float area = 4.0 * c.w * d.w;
float cosE = mix(side / max(length(rel), 1e-3), max(dot(c.xyz, - Ldir), 0.0), 0.6); // emitter cosine: centre (smooth) blended with the closest point (floors / ledges at the foot of a big screen get their light)
float win = 1.0 - dc2 / (a.w * a.w);
win *= win;
widen = min(0.15, min(c.w, d.w) / (2.0 * dist + 0.5)); // (night r10) wrap capped at 0.15: near big screens it lit faces turned away evenly (flat, self-lit look)
cityLSpecDir = Ldir;
cityLAng = min(1.0, sqrt(area) / (dist + 0.5));
float rn = dot(cityLRefl, c.xyz);
if(rn < - 1e-3) { // the reflection ray heads toward the emitter's lit face: its hit point on the plane, clamped into the rect
float t = dot(lp - wp, c.xyz) / rn;
if(t > 0.0) {
vec3 h = wp + cityLRefl * t - lp;
vec3 hp = lp + d.xyz * clamp(dot(h, d.xyz), - c.w, c.w) + v * clamp(dot(h, v), - d.w, d.w) - wp;
cityLSpecDir = normalize(hp);
}
}
return b.rgb * (area * cosE / (d2 + area * 0.3183)) * win;
}
vec3 L = L0;
float d2 = dc2;
float dist = sqrt(d2);
Ldir = L / max(dist, 1e-4);
float x = d2 / (a.w * a.w);
float win = 1.0 - x * x;
win *= win;
float att = win / (d2 + d.x * d.x + 0.25);
if(type > 0.5) att *= smoothstep(c.w, d.w, dot(- Ldir, c.xyz)); // spot cone
if(d.y > 0.5 && att > 0.0) att *= cityLShadow(int(d.y) - 1, wp, dist, a.w); // (night) real-time shadow slot
widen = d.x / (2.0 * dist + 0.5);
specK = d.z;
{ // sphere light: the point of the sphere closest to the reflection ray (Karis 2013). d.x is a softness radius for the
// diffuse near field (headlights 3.5 m, neon ~1 m); the real emitters (lamp heads, bulbs, tubes) are small: <= 0.25 m
float rs = min(d.x, 0.25);
cityLAng = min(1.0, rs / (dist + 0.25));
vec3 ctr = dot(L, cityLRefl) * cityLRefl - L;
cityLSpecDir = normalize(L + ctr * clamp(rs / max(length(ctr), 1e-4), 0.0, 1.0));
}
return b.rgb * att;
}
vec3 cityLIncident(int li, vec3 wp, out vec3 Ldir, out float widen) {
float specK;
return cityLIncident2(li, wp, Ldir, widen, specK);
}
// light list of the grid cell holding wp: returns the count (0: outside the grid / above every light in the cell)
int cityLCell(vec3 wp, out int bx, out int by, out uvec4 h0) {
#ifdef CITYL_UNIF
bx = 0;
by = 0;
h0 = uvec4(0u);
return cityL.origin.w > 0.0 ? int(cityLU[__SHADER_INJECT_5__].x) : 0;
#else
vec2 cg = (wp.xz - cityL.origin.xy) / cityL.origin.z;
#ifndef CITYL_NODITHER
{ // (night r9) dithered cell lookup (+-0.3 cell, rotating per frame): where neighbouring cells' lists differ (slot overflow, far LOD) the
// boundary is a TAA-resolved blend instead of a straight edge
vec2 q = gl_FragCoord.xy + cityL.misc.y * 7.13;
cg += (vec2(fract(52.9829189 * fract(dot(q, vec2(0.06711056, 0.00583715)))), fract(52.9829189 * fract(dot(q.yx, vec2(0.06711056, 0.00583715))))) - 0.5) * 0.6;
}
#endif
bx = 0;
by = 0;
h0 = uvec4(0u);
if(cityL.origin.w <= 0.0 || any(lessThan(cg, vec2(0.0))) || any(greaterThanEqual(cg, vec2(float(__SHADER_INJECT_6__))))) return 0;
ivec2 cc = ivec2(cg);
bx = cc.x * __SHADER_INJECT_7__;
by = cc.y + (wp.y >= float(__SHADER_INJECT_8__) ? __SHADER_INJECT_9__ : 0); // height layer
h0 = texelFetch(cityL.grid, ivec2(bx, by), 0);
if(wp.y > float(h0.y) - 1000.0) return 0;
return int(h0.x);
#endif
}
int cityLIndex(int i, int bx, int by, uvec4 h0) {
#ifdef CITYL_UNIF
return i;
#else
if(i < 2) return int(i == 0 ? h0.z : h0.w);
uvec4 hh = texelFetch(cityL.grid, ivec2(bx + 1 + (i - 2) / 4, by), 0);
return int(hh[(i - 2) & 3]);
#endif
}
// fade toward the grid border (lights hand over to the far-field city glow in surface.ts)
float cityLEdge(vec3 wp) {
vec2 q = abs((wp.xz - cityL.origin.xy) / (cityL.origin.z * float(__SHADER_INJECT_10__)) * 2.0 - 1.0);
return 1.0 - smoothstep(0.8, 0.98, max(q.x, q.y));
}
// diffuse irradiance (Lambert, N.L) for custom shaders (trees, crowd): multiply by albedo / PI
vec3 cityLightIrradiance(vec3 wp, vec3 wn) {
int bx, by;
uvec4 h0;
int n = cityLCell(wp, bx, by, h0);
vec3 E = vec3(0.0);
for(int i = 0;
i < __SHADER_INJECT_11__;
i ++) {
if(i >= n) break;
vec3 Ld;
float wd;
vec3 c = cityLIncident(cityLIndex(i, bx, by, h0), wp, Ld, wd);
E += c * max(dot(wn, Ld), 0.0);
}
return E * cityL.misc.x * cityLEdge(wp);
}
#endif
#endif

// @section applyLights

#if defined( USE_CITYL ) && defined( RE_Direct )
if(cityL.origin.w > 0.0) {
vec3 clWP = cameraPosition + geometryPosition * mat3(viewMatrix);
int clBx, clBy;
uvec4 clH0;
int clN = cityLCell(clWP, clBx, clBy, clH0);
if(clN > 0) {
#if defined( STANDARD ) && !( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
material.multiScatteringCompensation = vec3(1.0);
#endif
#if defined( STANDARD ) && !defined( USE_CLEARCOAT ) && !defined( USE_SHEEN ) && !defined( USE_IRIDESCENCE ) && !defined( USE_ANISOTROPY )
#define CL_FAST
#endif
float clK = cityL.misc.x * cityLEdge(clWP);
mat3 clVM = mat3(viewMatrix);
vec3 clE = vec3(0.0);
cityLRefl = normalize(reflect(- geometryViewDir, geometryNormal) * clVM); // world-space reflection ray (spec representative point)
#ifdef CL_FAST
bool clSpec = material.roughness < 0.75;
#ifdef CITYL_NOSPEC
clSpec = false; // (night r11) material opt-out (LED screens: matte louvred panels; a neighbour's light smeared a long glossy streak across the TS perch screen)
#endif
float clR = material.roughness, clRorig = material.roughness;
{ // (night r10) specular anti-aliasing for the local lights: normal-map detail (asphalt aggregate) under a lamp or
// headlight broke into glitter; widen the lobe by the screen-space normal variation (flat puddles keep their mirror)
vec3 clDn = fwidth(geometryNormal);
float clV = dot(clDn, clDn);
clR = min(1.0, sqrt(clR * clR + 0.6 * clV));
}
#endif
// (perf) lights are sorted strongest first: far surfaces and alpha-tested foliage only take the dominant ones
int clMax = clN;
#if defined( USE_ALPHATEST ) || defined( USE_ALPHAHASH )
clMax = min(clMax, 6);
#endif
clMax = min(clMax, int(mix(float(__SHADER_INJECT_0__), 8.0, smoothstep(30.0, 160.0, length(geometryPosition))))); // (perf r5) screens + signs raised TS to ~870 lights
for(int i = 0;
i < __SHADER_INJECT_1__;
i ++) {
if(i >= clMax) break;
vec3 clL;
float clWd;
float clSk;
vec3 clC = cityLIncident2(cityLIndex(i, clBx, clBy, clH0), clWP, clL, clWd, clSk);
if(clC.r + clC.g + clC.b <= 1e-5) continue;
vec3 clLv = normalize(clVM * clL);
#ifdef CL_FAST
float clNL = saturate((dot(geometryNormal, clLv) + clWd) / (1.0 + clWd)); // (night r9) wrap by the source's angular size: big screens light faces at grazing angles softly (no crisp reveal edges)
#if defined( USE_ALPHATEST ) && defined( DOUBLE_SIDED )
{ // (night r9) foliage (alpha-tested, double-sided leaf cards): leaves transmit and scatter light, so a lamp lights a
// canopy as a soft glowing volume, not leaf-by-leaf cut-outs (the blotchy 'grid-like' texture around lamp heads)
float clNd = dot(geometryNormal, clLv);
clNL = 0.22 + 0.55 * saturate(clNd) + 0.28 * saturate(- clNd); // front lit + light transmitted from behind
// leaves a metre from a lamp head would be 30x the pool below and clip in patches: smooth compression
clC *= 1.1 / (1.1 + max(clC.r, max(clC.g, clC.b)));
}
#endif
if(clNL <= 0.0) continue;
vec3 clIrr = clC * (clK * clNL);
clE += clIrr;
if(clSpec) { // (night r10) representative point along the reflection ray + energy normalisation (a / a')^2 (Karis 2013):
// a mirror-like surface shows the emitter's shape at its real brightness instead of a clipped disc
vec3 clLs = normalize(clVM * cityLSpecDir);
float clNLs = saturate(dot(geometryNormal, clLs));
float clA = clR * clR, clA2 = min(1.0, clA + 0.5 * cityLAng), clNorm = (clA * clA) / max(clA2 * clA2, 1e-8);
material.roughness = clR;
reflectedLight.directSpecular += clC * (clK * clNLs * clSk * clNorm) * BRDF_GGX(clLs, geometryViewDir, geometryNormal, material) * material.multiScatteringCompensation;
}
#else
IncidentLight clI;
clI.direction = clLv;
clI.color = clC * clK;
clI.visible = true;
#ifdef STANDARD
float clR0 = material.roughness;
material.roughness = min(1.0, clR0 + clWd);
RE_Direct(clI, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight);
material.roughness = clR0;
#else
RE_Direct(clI, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight);
#endif
#endif
}
#ifdef CL_FAST
material.roughness = clRorig;
reflectedLight.directDiffuse += clE * BRDF_Lambert(material.diffuseContribution) * (1.0 - material.specularColorBlended * 0.5);
#undef CL_FAST
#endif
}
}
#endif

// @section enableDirective
#define USE_CITYL
`,le=se(()=>ce),ue=2048,S=512,de=new Float32Array(260),fe=!1,pe=new Float32Array(ue*16),C=new f(pe,1024,ue/256,e,i);C.minFilter=C.magFilter=l,C.generateMipmaps=!1,C.needsUpdate=!0;var me=new Uint16Array(229376),w=new f(me,448,128,ee,g);w.internalFormat=`RGBA16UI`,w.minFilter=w.magFilter=l,w.generateMipmaps=!1,w.needsUpdate=!0;var T=1024,E=new d(T*2,T*2,{type:s,format:y,minFilter:l,magFilter:l,depthBuffer:!0,generateMipmaps:!1});E.texture.name=`cityLightShadows`;var D={data:C,grid:w,origin:new p(0,0,8,0),misc:new p(1,0,0,0),shM:Array.from({length:4},()=>new m),shMap:E.texture,shW:new p};function he(){return{declarations:ie(le.lightDeclarations,4,65,4,4,T*2,64,64,7,14,64,64,26),apply:ie(le.applyLights,26,26)}}var ge=()=>he().declarations,_e=null,ve=null,ye=-1,be=0,xe=new WeakSet;function Se(){let e=_e?.info.programs;if(!e||e.length===ye&&++be%10)return;ye=e.length;let t=new Set(e.filter(e=>e.diagnostics&&!e.diagnostics.runnable&&!xe.has(e)));if(!t.size)return;t.forEach(e=>xe.add(e));let n=new Set;ve.traverse(e=>{for(let r of Array.isArray(e.material)?e.material:e.material?[e.material]:[]){if(n.has(r)||r.isShaderMaterial)continue;let e=_e.properties.get(r);if(!t.has(e.currentProgram)&&!(e.programs&&[...e.programs.values()].some(e=>t.has(e))))continue;n.add(r);let i=r.defines||={};if(!(`CITYL_NOSH`in i))i.CITYL_NOSH=``;else if(!(`CITYL_UNIF`in i))i.CITYL_UNIF=``,fe=!0;else if(!(`CITYL_OFF`in i))i.CITYL_OFF=``;else continue;r.needsUpdate=!0,console.warn(`[citylights] ${r.name||r.type}: program failed to link, retry with ${`CITYL_OFF`in i?`no city lights`:`CITYL_UNIF`in i?`the 16 lights nearest the player (no textures)`:`no city-light shadows`}`)}})}var Ce=!1;function we(e=null,t=null){if(_e=e,ve=t,Ce)return;Ce=!0;let n=_e?.capabilities?.maxTextures<=16;n&&(fe=!0,P.shadows=!1);try{let e=new URLSearchParams(location.search);e.has(`nocl`)&&(P.enabled=!1),e.has(`noclsh`)&&(P.shadows=!1),e.has(`noclvol`)&&(P.volume=0)}catch{}let r=b,{declarations:i,apply:a}=he();r.lights_pars_begin.includes(`CITYL_PARS`)||(r.lights_pars_begin=r.lights_pars_begin+(n?`
#define CITYL_UNIF
`:``)+i);let o=r.lights_fragment_begin,s=o.indexOf(`#if defined( RE_IndirectDiffuse )`);if(s<0)console.error(`[citylights] could not patch lights_fragment_begin`);else{o.includes(`clWP`)||(r.lights_fragment_begin=o.slice(0,s)+a+o.slice(s));for(let e of[`standard`,`physical`,`lambert`,`phong`,`toon`]){let t=x[e];t&&(t.uniforms.cityL={value:D},t.uniforms.cityLU={value:de},t.fragmentShader.startsWith(le.enableDirective)||(t.fragmentShader=le.enableDirective+t.fragmentShader))}}}var Te={point:0,spot:1,rect:2},O=new a,k=64,A=[],j=new Map,M=[],N=(e,t)=>(e+4096)*8192+(t+4096);function Ee(e,t){return e&&(Array.isArray(e)?(t[0]=e[0],t[1]=e[1],t[2]=e[2]):(t[0]=e.x,t[1]=e.y,t[2]=e.z)),t}function De(e,t={}){t.type=Te[e.type??`point`]??0,t.p=Ee(e.pos,t.p||[0,0,0]),e.color==null?O.setRGB(1,1,1):Array.isArray(e.color)?O.setRGB(e.color[0],e.color[1],e.color[2],r):e.color.isColor?O.copy(e.color):O.set(e.color);let n=e.intensity??1;t.c=[O.r*n,O.g*n,O.b*n],t.lum=(O.r*.2126+O.g*.7152+O.b*.0722)*n,t.range=e.range??20,t.d=Ee(e.dir,t.d||[0,-1,0]);{let e=Math.hypot(t.d[0],t.d[1],t.d[2])||1;t.d[0]/=e,t.d[1]/=e,t.d[2]/=e}t.u=Ee(e.u,t.u||[1,0,0]);{let e=Math.hypot(t.u[0],t.u[1],t.u[2])||1;t.u[0]/=e,t.u[1]/=e,t.u[2]/=e}let i=e.angle??.9,a=e.penumbra??.4;return t.cosO=Math.cos(i),t.cosI=Math.cos(i*(1-a)),t.hw=(e.width??1)/2,t.hh=(e.height??1)/2,t.radius=e.radius??.2,t.spec=Math.max(0,Math.min(1,e.spec??1)),t.hcos=t.type===1&&Math.abs(t.d[1])<.7?Math.cos(Math.min(Math.PI,Math.acos(Math.max(-1,Math.min(1,t.cosO)))+.35)):-2,t.rEff=t.type===2?t.range+Math.hypot(t.hw,t.hh):t.range,t.vol=Math.min(.99,Math.max(0,e.volume??.5)),t.day=!!e.day,t.key=e.key??null,t.shSlot=0,t.noShadow=e.shadow===!1,t.type===2&&(t.lum*=4*t.hw*t.hh),t.top=t.type===1&&t.d[1]<-.5?t.p[1]+.6:t.type===2?t.p[1]+t.hh+t.range:t.type===1?t.p[1]+t.range*Math.max(.05,Math.sin(Math.asin(Math.max(-1,Math.min(1,t.d[1])))+Math.acos(Math.max(-1,Math.min(1,t.cosO))))):t.p[1]+t.range,t.bot=t.type===2?t.p[1]-t.hh-t.range:t.p[1]-t.range,t}var P={enabled:!0,gain:1,volume:1,incremental:!0,get nodeLights(){return Y},stats:{lights:0,cand:0,cells:0,maxCell:0,ms:0},add(e){let t=De(e);t.id=A.length,A.push(t),L++;let n=N(Math.floor(t.p[0]/k),Math.floor(t.p[2]/k)),r=j.get(n);return r||j.set(n,r=[]),r.push(t),t.bk=n,t.id},update(e,t){let n=A[e];if(!n)return;let r={...n.src,...t};n.src=r,L++;let i=n.bk;De(r,n);let a=N(Math.floor(n.p[0]/k),Math.floor(n.p[2]/k));if(a!==i){let e=j.get(i);e?.splice(e.indexOf(n),1);let t=j.get(a);t||j.set(a,t=[]),t.push(n),n.bk=a}},remove(e){let t=A[e];if(!t)return;let n=j.get(t.bk);if(n){let e=n.indexOf(t);e>=0&&n.splice(e,1)}A[e]=null,L++},addProvider(e,t={}){let n={fn:e,moving:!!t.moving};return M.push(n),L++,()=>{let e=M.indexOf(n);e>=0&&M.splice(e,1),L++}},invalidate(){L++},get count(){return A.reduce((e,t)=>e+ +!!t,0)},frame:null,get ambient(){return G}};{let e=P.add;P.add=function(t){let n=e.call(this,t);return A[n].src={...t},n}}var F=[],I=0,L=0,Oe=-1,ke=-1,Ae=99,je=new h(1e9,0,0),Me=new h,R=new h,Ne=new Set,Pe=new Map,z={};function Fe(e){De(e,F[I]||(F[I]={})),I++}var B=[],V=8192,Ie=new Uint8Array(V),Le=new Uint16Array(V*26),H=new Float32Array(V*26),Re=new Float32Array(V),ze=new Float32Array(V),Be=new Uint8Array(V);function Ve(e){let t=e*26,n=0,r=H[t];for(let e=1;e<26;e++){let i=H[t+e];i<r&&(r=i,n=e)}ze[e]=r,Be[e]=n}var He=new Uint8Array(26),Ue=new h,We=new t,Ge=new m,U=new te;function Ke(e,t,n){let r=pe,i=e*16,a=t.day?1:n;r[i]=t.p[0],r[i+1]=t.p[1],r[i+2]=t.p[2],r[i+3]=t.rEff,r[i+4]=t.c[0]*a,r[i+5]=t.c[1]*a,r[i+6]=t.c[2]*a,r[i+7]=t.type+t.vol,r[i+8]=t.d[0],r[i+9]=t.d[1],r[i+10]=t.d[2],t.type===2?(r[i+11]=t.hw,r[i+12]=t.u[0],r[i+13]=t.u[1],r[i+14]=t.u[2],r[i+15]=t.hh):(r[i+11]=t.cosO,r[i+12]=t.radius,r[i+13]=t.shSlot,r[i+14]=t.spec,r[i+15]=t.cosI)}var qe=!0,Je=e=>{if(!qe)return;let t=e.key;if(t==null||!Ne.has(t)){qe=!1;return}let n=Pe.get(t);if(n===void 0)return;De(e,z);let r=B[n];r.p[0]=z.p[0],r.p[1]=z.p[1],r.p[2]=z.p[2],r.d[0]=z.d[0],r.d[1]=z.d[1],r.d[2]=z.d[2],r.c[0]=z.c[0],r.c[1]=z.c[1],r.c[2]=z.c[2],Ke(n,r,ke)};function Ye(e,t){qe=!0;for(let t of M)if(t.moving){try{t.fn(Je,e)}catch{qe=!1}if(!qe)return!1}mt(e,t);for(let e=0;e<B.length;e++){let t=B[e];t.type===1&&(pe[e*16+13]=t.shSlot)}return C.needsUpdate=!0,!0}var W=new h,Xe=new Int32Array(16),Ze=new Float32Array(16);function Qe(e){let t=typeof window<`u`?window.__ctx?.player?.object:null;t?t.getWorldPosition(W):W.copy(e.position),W.y+=1;let n=0,r=D.misc.z,i=pe;for(let e=0;e<r;e++){let t=e*16,r=i[t]-W.x,a=i[t+1]-W.y,o=i[t+2]-W.z,s=r*r+a*a+o*o,c=i[t+3]+1.5;if(s>c*c)continue;let l=i[t+4]*.3+i[t+5]*.55+i[t+6]*.15,u=(i[t+7]>=2?l*4*i[t+11]*i[t+15]:l)/(s+1);if(n<16){Xe[n]=e,Ze[n++]=u;continue}let d=0;for(let e=1;e<16;e++)Ze[e]<Ze[d]&&(d=e);u>Ze[d]&&(Xe[d]=e,Ze[d]=u)}for(let e=0;e<n;e++)de.set(i.subarray(Xe[e]*16,Xe[e]*16+16),e*16);de[256]=n}var $e=.16,G={lo:{value:new h},hi:{value:new h},gain:1},K=new h,q=new h,J=new h,et=0;function tt(e,t){let n=e.p[0]-K.x,r=e.p[1]-K.y,i=e.p[2]-K.z,a=n*n+r*r+i*i,o=Math.min(70,Math.max(25,e.rEff*2.5));if(a>o*o)return;let s=Math.sqrt(a),c=1-_.smoothstep(s,.55*o,o),l=(e.day?1:t)*$e*c*(e.type===2?4*e.hw*e.hh:1)/(a+36),u=_.clamp(r/(s+1),-1,1),d=.62+.18*Math.max(0,u);q.x+=e.c[0]*l*d,q.y+=e.c[1]*l*d,q.z+=e.c[2]*l*d,J.x+=e.c[0]*l*(1-d),J.y+=e.c[1]*l*(1-d),J.z+=e.c[2]*l*(1-d)}function nt(e){let t=performance.now(),n=t,r=et?Math.min((t-et)/1e3,.25):1;et=t,q.set(0,0,0),J.set(0,0,0);let i=typeof window<`u`?window.__ctx?.player?.object:null;if(i&&P.enabled&&e>=.01){i.getWorldPosition(K),K.y+=1;let t=Math.floor((K.x-70)/k),n=Math.floor((K.x+70)/k),r=Math.floor((K.z-70)/k),a=Math.floor((K.z+70)/k);for(let i=t;i<=n;i++)for(let t=r;t<=a;t++){let n=j.get(N(i,t));if(n)for(let t of n)tt(t,e)}for(let t=0;t<I;t++)tt(F[t],e);let o=G.gain*P.gain;q.multiplyScalar(o),J.multiplyScalar(o)}let a=1-Math.exp(-r/.5);G.lo.value.lerp(q,a),G.hi.value.lerp(J,a),P.stats.ambMs=+(performance.now()-n).toFixed(3),P.stats.amb=[+G.lo.value.x.toFixed(4),+G.lo.value.y.toFixed(4),+G.lo.value.z.toFixed(4),+G.hi.value.y.toFixed(4)]}function rt(e){let t=performance.now();_e&&Se();let n=D,r=re.value;if(nt(r),!P.enabled||r<.01){n.origin.w=0,P.stats.lights=0;return}if(e.getWorldDirection(R),Ae++,P.incremental&&L===Oe&&Math.abs(r-ke)<.005&&Ae<6&&e.position.distanceToSquared(je)<2.25&&R.dot(Me)>.9995&&Ye(e,r)){fe&&Qe(e),P.stats.ms=performance.now()-t,P.stats.partial=!0;return}Ae=0,Oe=L,ke=r,je.copy(e.position),Me.copy(R),P.stats.partial=!1,e.getWorldDirection(Ue);let i=Math.hypot(Ue.x,Ue.z)||1,a=Math.min(210,70+.6*Math.max(0,e.position.y))*Math.min(1,i*1.5),o=e.position.x+Ue.x/i*a,s=e.position.z+Ue.z/i*a,c=Math.floor(o/8)*8-S/2,l=Math.floor(s/8)*8-S/2;n.origin.set(c,l,8,1),n.misc.x=P.gain,n.misc.w=r,n.misc.y=(n.misc.y+1)%64,e.updateMatrixWorld(),Ge.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),We.setFromProjectionMatrix(Ge),B.length=0;let u=Math.floor(c/k),d=Math.floor((c+S)/k),ee=Math.floor(l/k),te=Math.floor((l+S)/k),f=t=>{let n=t.rEff;if(t.p[0]+n<c||t.p[0]-n>c+S||t.p[2]+n<l||t.p[2]-n>l+S||(U.center.set(t.p[0],t.p[1],t.p[2]),U.radius=n,!We.intersectsSphere(U)))return;let i=t.p[0]-e.position.x,a=t.p[2]-e.position.z,o=t.p[1]-e.position.y;t.pri=t.lum*(t.day?1:r)/(i*i+o*o+a*a+400),B.push(t)};for(let e=u;e<=d;e++)for(let t=ee;t<=te;t++){let n=j.get(N(e,t));if(n)for(let e of n)f(e)}let p=performance.now();I=0,Ne.clear(),Pe.clear();for(let t of M){let n=I;try{t.fn(Fe,e)}catch(e){console.warn(`[citylights] provider`,e)}if(t.moving)for(let e=n;e<I;e++)F[e].mov=!0,F[e].key!=null&&Ne.add(F[e].key);else for(let e=n;e<I;e++)F[e].mov=!1}for(let e=0;e<I;e++)f(F[e]);let m=performance.now();P.stats.cand=B.length,B.length>2048&&(B.sort((e,t)=>t.pri-e.pri),B.length=ue),mt(e,r);for(let e=0;e<B.length;e++){let t=B[e];t.mov&&t.key!=null&&Pe.set(t.key,e)}for(let e=0;e<B.length;e++)Ke(e,B[e],r);let ne=performance.now();Ie.fill(0),Re.fill(-1e3);let h=0,g=0;for(let e=0;e<B.length;e++){let t=B[e],n=t.rEff,r=t.p[0],i=t.p[2],a=n*n,o=Math.max(0,Math.floor((r-n-c)/8)),s=Math.min(63,Math.floor((r+n-c)/8)),u=Math.max(0,Math.floor((i-n-l)/8)),d=Math.min(63,Math.floor((i+n-l)/8)),ee=t.bot<14,te=t.top>=14,f=t.type===2,p=t.hcos>-2,m=t.top,ne=t.lum,g=t.d[0],_=t.d[2],v=p?1/(Math.sqrt(g*g+_*_)||1):0,y=t.hcos;for(let t=u;t<=d;t++){let n=l+t*8,u=n>i?n-i:i>n+8?i-n-8:0,d=u*u;if(!(d>a))for(let l=o;l<=s;l++){let o=c+l*8,s=o>r?o-r:r>o+8?r-o-8:0,u=s*s+d;if(u>a)continue;if(p&&u>16){let e=o+4-r,t=n+4-i,a=Math.sqrt(e*e+t*t),s=(e*g+t*_)*v/a,c=6/a;if(s<y-(c<1?c:1))continue}if(f&&(o+4-r)*g+(n+4-i)*_<-6)continue;let b=ne/(u+4),x=t*64+l;for(let t=0;t<2;t++){if(t===0?!ee:!te)continue;let n=t*64*64+x,r=Ie[n];if(r<26)Le[n*26+r]=e,H[n*26+r]=b,Ie[n]=r+1,r+1>h&&(h=r+1),r+1===26&&Ve(n);else{if(b<=ze[n])continue;let t=Be[n];Le[n*26+t]=e,H[n*26+t]=b,Ve(n)}m>Re[n]&&(Re[n]=m)}}}}let _=performance.now(),v=me;for(let e=0;e<V;e++){let t=Ie[e],n=e/64|0,r=e-n*64,i=(n*64*7+r*7)*4;if(v[i]=t,!t)continue;g++,v[i+1]=Math.min(65535,Math.max(0,Math.ceil(Re[e]+1e3)));let a=e*26;if(t>5){for(let e=0;e<t;e++){let t=H[a+e],n=e;for(;n>0&&H[a+He[n-1]]<t;)He[n]=He[n-1],n--;He[n]=e}for(let e=0;e<t;e++)v[i+2+e]=Le[a+He[e]]}else for(let e=0;e<t;e++)v[i+2+e]=Le[a+e]}C.needsUpdate=!0,w.needsUpdate=!0,n.misc.z=B.length,fe&&Qe(e);let y=P.stats;y.lights=B.length,y.cells=g,y.maxCell=h,y.ms=performance.now()-t;let b=performance.now();y.split={static:+(p-t).toFixed(2),providers:+(m-p).toFixed(2),records:+(ne-m).toFixed(2),bin:+(_-ne).toFixed(2),texture:+(b-_).toFixed(2)}}var Y=[],X=[],it=Array(16).fill(null),at=``;function ot(e,t,r=8){let i=Math.min(r<=4?1:r<=8?2:4,r),a=r-i,s=`${i}:${a}`;if(s!==at){for(let e=0;e<Y.length;e++)t.remove(Y[e]),X[e]&&t.remove(X[e]);Y.length=X.length=0,at=s;for(let e=0;e<r;e++){let r;if(e<i){r=new c(16777215,0,0,Math.PI/4,.35,2);let n=new v;n.name=`CityLight.TSL.Target.${e}`,t.add(n),r.target=n,X[e]=n}else r=new n(16777215,0,0,2),X[e]=null;r.castShadow=!1,r.name=`CityLight.TSL.${e}`,r.visible=!1,t.add(r),Y[e]=r}}let l=re.value;if(!P.enabled||l<.01||r<1){for(let e of Y)e.intensity=0,e.visible=!1;P.stats.nodeLights=0,P.stats.lights=0;return}e.getWorldDirection(R);let u=Math.hypot(R.x,R.z)||1,d=Math.min(210,70+.6*Math.max(0,e.position.y))*Math.min(1,u*1.5),ee=e.position.x+R.x/u*d,te=e.position.z+R.z/u*d,f=ee-S/2,p=te-S/2,m=Math.floor(f/k),ne=Math.floor((f+S)/k),h=Math.floor(p/k),g=Math.floor((p+S)/k);e.updateMatrixWorld(),Ge.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),We.setFromProjectionMatrix(Ge),B.length=0;let y=t=>{let n=t.rEff;if(t.p[0]+n<f||t.p[0]-n>f+S||t.p[2]+n<p||t.p[2]-n>p+S||(U.center.set(t.p[0],t.p[1],t.p[2]),U.radius=n,!We.intersectsSphere(U)))return;let r=t.p[0]-e.position.x,i=t.p[1]-e.position.y,a=t.p[2]-e.position.z;t.pri=t.lum*(t.day?1:l)/(r*r+i*i+a*a+400),B.push(t)};for(let e=m;e<=ne;e++)for(let t=h;t<=g;t++){let n=j.get(N(e,t));if(n)for(let e of n)y(e)}I=0;for(let t of M)try{t.fn(Fe,e)}catch(e){console.warn(`[citylights] provider`,e)}for(let e=0;e<I;e++)y(F[e]);B.sort((e,t)=>t.pri-e.pri),P.stats.cand=B.length;for(let e=0;e<r;e++)it[e]=null;let b=0,x=0;for(let e of B)if(e.type===1&&b<i?it[b++]=e:e.type!==1&&x<a&&(it[i+x++]=e),b===i&&x===a)break;for(let e=0;e<r;e++){let t=Y[e],n=it[e];if(t.visible=!0,!n){t.intensity=0;continue}let r=n.type===2?Math.min(20,Math.max(1,4*n.hw*n.hh)):1,i=Math.max(n.c[0],n.c[1],n.c[2])*r*(n.day?1:l)*P.gain,a=Math.max(n.c[0],n.c[1],n.c[2],1e-5);if(t.color.setRGB(n.c[0]/a,n.c[1]/a,n.c[2]/a,o),t.intensity=i,t.distance=n.range,t.decay=2,t.position.set(n.p[0],n.p[1],n.p[2]),t.isSpotLight){t.angle=Math.min(Math.PI/2,Math.acos(_.clamp(n.cosO,-1,1)));let r=Math.acos(_.clamp(n.cosO,-1,1)),i=Math.acos(_.clamp(n.cosI,-1,1));t.penumbra=r>1e-4?_.clamp(1-i/r,0,1):0;let a=X[e];a.position.set(n.p[0]+n.d[0],n.p[1]+n.d[1],n.p[2]+n.d[2]),a.updateMatrixWorld()}}let ie=b+x;P.stats.nodeLights=ie,P.stats.lights=ie}var st=Array.from({length:4},()=>new ne(90,1,.1,30)),ct=Array.from({length:4},()=>{let e=new u;return e.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,le.vertexBeginVertex)},e.customProgramCacheKey=()=>`clShrink`,e}),lt=Array.from({length:4},()=>({matrixWorld:new m,shadow:{camera:{near:.1,far:30}}})),Z=Array.from({length:4},()=>({id:null,rec:null,w:0})),Q=[],ut=0,$=new h,dt=new h,ft=new h,pt=e=>e.key==null?e.id==null?null:`s`+e.id:`k`+e.key;function mt(e,t){let n=performance.now(),r=ut?Math.min((n-ut)/1e3,.1):0;ut=n;let i=typeof window<`u`?window.__ctx?.player?.object:null;i?i.getWorldPosition($):$.copy(e.position),(!i||$.distanceToSquared(e.position)>22500)&&(e.getWorldDirection(ft),$.copy(e.position).addScaledVector(ft,12)),$.y+=.9,Q.length=0;for(let e of B)e.shSlot=0;if(P.shadows)for(let e of B){if(e.type!==1||e.noShadow)continue;let t=pt(e);if(!t)continue;let n=$.x-e.p[0],r=$.y-e.p[1],i=$.z-e.p[2],a=n*n+r*r+i*i;if(a>e.range*e.range)continue;let o=Math.sqrt(a)||1,s=(n*e.d[0]+r*e.d[1]+i*e.d[2])/o,c=Math.min(1,Math.max(0,(s-e.cosO)/Math.max(e.cosI-e.cosO,.001))),l=c*c*(3-2*c);if(l<=0)continue;let u=e.lum*l/(a+1);Z.some(e=>e.id===t)&&(u*=1.6),e._imp=u,e._id=t,Q.push(e)}Q.sort((e,t)=>t._imp-e._imp),Q.length>4&&(Q.length=4);for(let e of Z){let t=Q.find(t=>t._id===e.id);t?(e.rec=t,e.w=Math.min(1,e.w+r*3)):(e.id=null,e.rec=null,e.w=0)}for(let e of Q)if(!Z.some(t=>t.id===e._id)){let t=Z.find(e=>!e.id);t&&(t.id=e._id,t.rec=e,t.w=+!r,t.fresh=!0)}let a=D.shW;Z.forEach((e,t)=>{if(a.setComponent(t,e.rec?e.w:0),!e.rec)return;let n=e.rec;n.shSlot=t+1;let r=st[t];r.position.set(n.p[0],n.p[1],n.p[2]),dt.set(0,1,0),Math.abs(n.d[1])>.95&&dt.set(0,0,1),r.up.copy(dt),r.lookAt(ft.set(n.p[0]+n.d[0],n.p[1]+n.d[1],n.p[2]+n.d[2])),r.fov=Math.min(150,_.radToDeg(Math.acos(Math.max(-.99,n.cosO)))*2+4),r.near=.1,r.far=n.range,r.updateProjectionMatrix(),r.updateMatrixWorld(),lt[t].matrixWorld.copy(r.matrixWorld),lt[t].shadow.camera.far=n.range})}var ht=new a,gt=0;function _t(e,t){if(D.origin.w<=0||!Z.some(e=>e.rec))return;let n=e.shadowMap.autoUpdate,r=t.overrideMaterial,i=e.getRenderTarget();e.getClearColor(ht);let a=e.getClearAlpha();e.shadowMap.autoUpdate=!1;let o=e.autoClear;e.autoClear=!1,e.setClearColor(16777215,1),gt++,E.scissorTest=!0;let s=typeof window<`u`?window.__ctx?.player?.object:null,c=window.__ctx?.camera,l=!!(s&&c&&s.position.distanceToSquared(c.position)<6.25);Z.forEach((n,r)=>{if(!n.rec||!n.fresh&&gt+r&1)return;n.fresh=!1;let i=(r&1)*T,a=(r>>1)*T;E.viewport.set(i,a,T,T),E.scissor.set(i,a,T,T),e.setRenderTarget(E),e.clear(!0,!0,!1),D.shM[r].multiplyMatrices(st[r].projectionMatrix,st[r].matrixWorldInverse);let o=st[r];if(o.layers.set(l?29:30),o.layers.enable(29),e.properties.get(ct[r]).light=lt[r],t.overrideMaterial=ct[r],e.render(t,o),vt.length){t.overrideMaterial=null,o.layers.enableAll();for(let t of vt){let n=t.mesh;if(!n.visible||n.count===0)continue;let i=n.material;n.material=t.material,e.properties.get(t.material).light=lt[r],e.render(n,o),n.material=i}}}),E.scissorTest=!1,E.viewport.set(0,0,T*2,T*2),t.overrideMaterial=r,e.autoClear=o,e.setClearColor(ht,a),e.shadowMap.autoUpdate=n,e.setRenderTarget(i)}P.renderShadows=_t;var vt=[];P.addCaster=(e,t)=>{let n={mesh:e,material:t};return vt.push(n),()=>{let e=vt.indexOf(n);e>=0&&vt.splice(e,1)}},P.shadows=!0,P.shadowSlots=Z,P.shadowRT=E,P.build=rt,P.buildNode=ot,P.shared=D;export{we as a,ge as i,P as n,se as o,D as r,ie as s,G as t};
//# sourceMappingURL=world~index~tslPipeline~screenshotPresets~gameSystems-ZgHieP-C.js.map