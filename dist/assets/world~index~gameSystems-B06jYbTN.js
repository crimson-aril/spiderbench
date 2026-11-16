import{Ar as e,E as t,Qa as n,Rn as r,St as i,U as a,Wr as o,Yt as s,bt as c,do as l,fn as u,io as d,ir as f,kr as p,no as m,pn as h,ro as g,tr as _,vt as v}from"./three~index~combat~tslPipeline~screenshotPresets~gameSystems~GLTFLoader-B3xvqeNo.js";import{n as y,r as b}from"./three~index~tslPipeline~screenshotPresets~gameSystems-XhDerpBe.js";import{o as x,s as S}from"./world~index~tslPipeline~screenshotPresets~gameSystems-ZgHieP-C.js";var C=`uniform sampler2D tGM;
uniform mat4 uGMMat;
uniform vec4 uGMPlane;
uniform float uGMOn;
// mirror image (rgb) + coverage (a) at this facade point, or 0 when it is not on the mirrored plane
vec4 glassMirror(vec3 wp, vec3 wn) {
  if(uGMOn < 0.5)
    return vec4(0.0);
  float pd = dot(wp, uGMPlane.xyz) - uGMPlane.w;
  float pm = smoothstep(0.96, 0.99, dot(wn, uGMPlane.xyz)) * (1.0 - smoothstep(0.2, 0.45, abs(pd)));
  if(pm <= 0.0)
    return vec4(0.0);
  vec4 rp = uGMMat * vec4(wp, 1.0);
  if(rp.w <= 0.0)
    return vec4(0.0);
  vec2 ruv = rp.xy / rp.w;
  vec2 e = smoothstep(0.0, 0.03, ruv) * smoothstep(1.0, 0.97, ruv);
  vec4 m = texture(tGM, ruv);
  return vec4(m.rgb, clamp(m.a, 0.0, 1.0) * pm * e.x * e.y);
}
`,w={tGM:{value:null},uGMMat:{value:new f},uGMPlane:{value:new d(0,1,0,-1e6)},uGMOn:{value:0}},T=C;function E(t,n){let i=t.getDrawingBufferSize(new m),c=new l(Math.max(64,i.x>>1),Math.max(64,i.y>>1),{type:s,depthBuffer:!0});c.texture.minFilter=c.texture.magFilter=r,c.texture.generateMipmaps=!1;let u=w;u.tGM.value=c.texture;let h=!1;try{h=new URLSearchParams(location.search).has(`nogmirror`)}catch{}let _=new p;_.layers.set(26),_.matrixAutoUpdate=!0;let v=new f().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),y=new g,b=new g,x=new g,S=new g,C=new g,T=new g,E=new g,D=new d,O=new a,k=new e,A=new o,j=[];for(let e=0;e<8;e++)j.push(new g(Math.cos(e*Math.PI/4),0,Math.sin(e*Math.PI/4)));let M={on:!1,n:new g,d:0},N={on:0,plane:null},P=(e,t,n)=>e.addScaledVector(t,-2*(e.dot(t)-n)),F=(e,t)=>e.addScaledVector(t,-2*e.dot(t));function I(){n.traverse(e=>{(e.isLight||(e.isMesh||e.isSkinnedMesh)&&!e.layers.isEnabled(26)&&/^people-.*-L0$/.test(e.name))&&e.layers.enable(26)}),window.__ctx?.player?.object?.traverse(e=>{(e.isMesh||e.isSkinnedMesh)&&e.layers.enable(26)});for(let e of n.children)/^(WebStrands|WebRopes|SlingWebs)$/.test(e.name)&&e.traverse(e=>e.layers.enable(26))}function L(e,t,n){y.copy(t.position),b.setFromMatrixPosition(e.matrixWorld);let r=null,i=1/0;for(let t of j){let a=n.raycast(y,t,32);if(!a||a.ground||Math.abs(a.normal.y)>.3||a.kind!==`wall`&&a.kind!==`glass`)continue;E.copy(a.normal).setY(0).normalize();let o=E.dot(a.point);if(E.dot(b)-o<.4||(T.copy(y),P(T,E,o),D.set(T.x,T.y,T.z,1).applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix),D.w<=.1||Math.abs(D.x/D.w)>1.35||Math.abs(D.y/D.w)>1.35))continue;let s=a.distance;M.on&&M.n.dot(E)>.999&&Math.abs(M.d-o)<.1&&(s-=2.5),s<i&&(i=s,r={n:E.clone(),d:o})}return r}let R=0;return{rt:c,stats:N,setSize(e,t){c.setSize(Math.max(64,e>>1),Math.max(64,t>>1))},render(e){u.uGMOn.value=0,N.on=0;let r=window.__ctx,i=r?.player,a=r?.world;if(h||!i?.object?.visible||!a?.raycast){M.on=!1;return}R++%60==0&&I();let o=L(e,i,a);if(!o){M.on=!1;return}M.on=!0,M.n.copy(o.n),M.d=o.d,b.setFromMatrixPosition(e.matrixWorld),e.getWorldDirection(x),S.copy(b).add(x),P(S,o.n,o.d),_.position.copy(b),P(_.position,o.n,o.d),C.set(0,1,0).applyQuaternion(e.getWorldQuaternion(A)),F(C,o.n),_.up.copy(C),_.lookAt(S),_.updateMatrixWorld(),_.projectionMatrix.copy(e.projectionMatrix),_.projectionMatrixInverse.copy(e.projectionMatrixInverse),_.near=e.near,_.far=e.far,_.fov=e.fov,_.aspect=e.aspect,e.reversedDepth&&(_._reversedDepth=!0),k.set(o.n,-(o.d-.05)).applyMatrix4(_.matrixWorldInverse);let s=_.projectionMatrix.elements,l=k.normal,d=k.constant;if(e.reversedDepth){let e=.5;s[2]=-l.x*e,s[6]=-l.y*e,s[10]=-1-l.z*e,s[14]=-d*e}else{D.set((Math.sign(l.x)+s[8])/s[0],(Math.sign(l.y)+s[9])/s[5],-1,(1+s[10])/s[14]);let e=2/(l.x*D.x+l.y*D.y+l.z*D.z+d*D.w);s[2]=l.x*e,s[6]=l.y*e,s[10]=l.z*e+1,s[14]=d*e}_.projectionMatrixInverse.copy(_.projectionMatrix).invert(),u.uGMMat.value.copy(v).multiply(_.projectionMatrix).multiply(_.matrixWorldInverse),u.uGMPlane.value.set(o.n.x,o.n.y,o.n.z,o.d),i.object.updateMatrixWorld(!0);let f=t.getRenderTarget(),p=t.getClearAlpha();t.getClearColor(O);let m=t.shadowMap,g=m.autoUpdate,y=m.needsUpdate,w=n.matrixWorldAutoUpdate;m.autoUpdate=!1,m.needsUpdate=!1,n.matrixWorldAutoUpdate=!1;try{t.setRenderTarget(c),t.setClearColor(0,0),t.clear(!0,!0,!1),t.render(n,_)}finally{m.autoUpdate=g,m.needsUpdate=y,n.matrixWorldAutoUpdate=w,t.setRenderTarget(f),t.setClearColor(O,p)}u.uGMOn.value=1,N.on=1,N.plane=[o.n.x,o.n.z,+o.d.toFixed(2)]}}}var D=`// csm shader sections.

// @section cascadeDeclarations

#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
struct CSMData {
  vec4 params;
};
uniform CSMData csmData;
  #define CSM_TAPS __SHADER_INJECT_0__
  #if defined( SHADOWMAP_TYPE_PCF )
float csmPCF(sampler2DShadow map, vec2 size, float bias, float radius, vec4 sc, float phi) {
  vec3 c = sc.xyz / sc.w;
  c.z += bias;
  float r = radius / size.x;
  float s = 0.0;
  for(int k = 0; k < CSM_TAPS; k++) s += textureLod(map, vec3(c.xy + vogelDiskSample(k, CSM_TAPS, phi) * r, c.z), 0.0);
  return s / float(CSM_TAPS);
}
  #endif
float csmShadow() {
  float n0 = interleavedGradientNoise(gl_FragCoord.xy);
  float phi = fract(n0 + csmData.params.x) * PI2;
  float s = 1.0;
  bool done = false;
  __SHADER_INJECT_1__ return s;
}
#endif

// @section cascadeBlock

#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )

DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
DirectionalLightShadow directionalLightShadow;
	#endif

	// CSM sun: light 0 carries radiance; cascades 0..__SHADER_INJECT_0__ provide shadow maps
directionalLight = directionalLights[0];
getDirectionalLightInfo(directionalLight, directLight);
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
directLight.color *= (directLight.visible && receiveShadow) ? csmShadow() : 1.0;
	#endif
	#if defined( STANDARD ) || defined( LAMBERT )
{ // (night r6) moon on up-facing roofs / ground x shape.y^2 (1 by day): pale roofs read frosted from above (critic)
float csmUp = saturate(dot(geometryNormal, normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz)));
directLight.color *= mix(1.0, ambData.shape.y * ambData.shape.y, csmUp);
}
	#endif
{ // the sun is a disc, not a point: widen the specular lobe of very smooth surfaces for the key light only
	#ifdef STANDARD
float csmR = material.roughness;
material.roughness = max(csmR, 0.09);
RE_Direct(directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight);
material.roughness = csmR;
	#else
RE_Direct(directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight);
	#endif
}

	#if NUM_DIR_LIGHTS > __SHADER_INJECT_1__
	#pragma unroll_loop_start
for(int i = 0;
i < NUM_DIR_LIGHTS;
i ++) {
		#if ( UNROLLED_LOOP_INDEX >= __SHADER_INJECT_2__ )
directionalLight = directionalLights[i];
getDirectionalLightInfo(directionalLight, directLight);
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
directionalLightShadow = directionalLightShadows[i];
directLight.color *= (directLight.visible && receiveShadow) ? getShadow(directionalShadowMap[i], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[i]) : 1.0;
		#endif
RE_Direct(directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight);
		#endif
}
	#pragma unroll_loop_end
	#endif

#endif

// @section cascadeTest

  #if NUM_DIR_LIGHT_SHADOWS > __SHADER_INJECT_0__
if(! done) {
vec4 sc = vDirectionalShadowCoord[__SHADER_INJECT_0__];
vec3 c = sc.xyz / sc.w;
vec2 e = min(c.xy, 1.0 - c.xy);
float edge = min(e.x, e.y);
    // world-anchored dither (hash of the light-space texel): the cascade choice in the blend band does not crawl
    // when the camera moves, and does not change from frame to frame
float rnd = fract(sin(dot(floor(c.xy * 1024.0), vec2(12.9898, 78.233))) * 43758.5453);
if(edge > csmData.params.y * rnd && c.z <= 1.0 && c.z >= 0.0) {
DirectionalLightShadow dls = directionalLightShadows[__SHADER_INJECT_0__];
      #if defined( SHADOWMAP_TYPE_PCF )
s = csmPCF(directionalShadowMap[__SHADER_INJECT_0__], dls.shadowMapSize, dls.shadowBias, dls.shadowRadius, sc, phi);
      #else
s = getShadow(directionalShadowMap[__SHADER_INJECT_0__], dls.shadowMapSize, dls.shadowIntensity, dls.shadowBias, dls.shadowRadius, sc);
      #endif
done = true;
}
}
  #endif

// @section characterCascadeTest

  #if NUM_DIR_LIGHT_SHADOWS > __SHADER_INJECT_0__
{
vec4 sc = vDirectionalShadowCoord[__SHADER_INJECT_0__];
vec3 c = sc.xyz / sc.w;
vec2 e = min(c.xy, 1.0 - c.xy);
if(min(e.x, e.y) > 0.02 && c.z <= 1.0 && c.z >= 0.0) {
DirectionalLightShadow dls = directionalLightShadows[__SHADER_INJECT_0__];
      #if defined( SHADOWMAP_TYPE_PCF )
s = min(s, csmPCF(directionalShadowMap[__SHADER_INJECT_0__], dls.shadowMapSize, dls.shadowBias, dls.shadowRadius, sc, phi));
      #endif
}
}
  #endif
`,O=x(()=>D),k=!1,A={params:new d(0,.1,1,0)};function j(e,t,n){if(k)return;k=!0;let r=y,i=``;for(let t=0;t<e;t++)i+=S(O.cascadeTest,t);n&&(i+=S(O.characterCascadeTest,e));let a=S(O.cascadeDeclarations,t,i);r.shadowmap_pars_fragment.includes(`csmShadow`)||(r.shadowmap_pars_fragment+=a);let o=r.lights_fragment_begin,s=o.indexOf(`#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )`),c=o.indexOf(`#if ( NUM_RECT_AREA_LIGHTS > 0 )`);if(s<0||c<0){console.error(`[render/csm] could not patch lights_fragment_begin`);return}let l=e+ +!!n,u=S(O.cascadeBlock,e-1,l,l);r.lights_fragment_begin=o.slice(0,s)+u+o.slice(c);for(let e of[`standard`,`physical`,`lambert`,`phong`,`toon`]){let t=b[e];t&&(t.uniforms.csmData={value:A})}}function M(e){let t=e.getContext();if(!t||t.__uCache)return;t.__uCache=!0;let n=new WeakMap;for(let e of[`uniformMatrix4fv`,`uniformMatrix3fv`]){let r=t[e].bind(t);t[e]=function(e,t,i,a,o){if(e&&i&&a===void 0&&i.length>16){let t=n.get(e);if(t&&t.length===i.length){let e=!0;for(let n=0;n<i.length;n++)if(t[n]!==i[n]){e=!1;break}if(e)return;t.set(i)}else n.set(e,Float32Array.from(i))}return a===void 0?r(e,t,i):r(e,t,i,a,o)}}}var N=class{constructor({scene:e,quality:t,reversed:a,renderer:o}){this.N=t.cascades,this.splits=t.splits.slice(),this.size=t.shadowMapSize,this.reversed=a,this.stableDither=t.name===`low`,this.charSize=t.charShadow||0,j(this.N,t.shadowTaps,this.charSize>0),this.sunDir=new g(.5,.7,.3).normalize(),this.lights=[],this.frame=0,this.periods=[1,2,4,8,8].slice(0,this.N);let s=[1.6,1.25,1.1,1,1];for(let t=0;t<this.N;t++){let n=new i(16777215,+(t===0));n.name=`CSM_`+t,n.castShadow=!0;let r=t===this.N-1&&this.N>2?this.size>>1:this.size;n.shadow.mapSize.set(r,r),n.shadow.radius=s[t]*(r<this.size?.6:1),n.shadow.autoUpdate=!1,n.shadow.needsUpdate=!0,e.add(n),e.add(n.target),this.lights.push(n)}this.sun=this.lights[0];for(let e=3;e<this.N;e++)this.lights[e].shadow.camera.layers.set(28);if(t.perf!==!1)for(let e=2;e<this.N;e++)this.lights[e].shadow.camera.layers.enable(e>=3?28:29);if(A.proxyShadows=t.perf!==!1&&!!o,this._tagged=new WeakSet,this._tagFrame=0,this.charLight=null,this.focus=null,this.charRadius=1.6,this.charSize>0){let t=new i(16777215,0);t.name=`CSM_char`,t.castShadow=!0,t.shadow.mapSize.set(this.charSize,this.charSize),t.shadow.radius=2,t.shadow.autoUpdate=!1,t.shadow.needsUpdate=!0,t.shadow.camera.layers.set(30),e.add(t),e.add(t.target),this.charLight=t}for(let e of[...this.lights,this.charLight]){if(!e||e.shadow.map)continue;let t=e.shadow.mapSize,i=new l(t.x,t.y),s=new c(t.x,t.y,n);s.name=e.name+`.shadowMap`,s.format=v,s.compareFunction=a?518:515,s.minFilter=s.magFilter=r,i.depthTexture=s,i.texture.name=e.name+`.shadowMap`,e.shadow.map=i,o?.initRenderTarget?.(i)}t.perf!==!1&&o&&(this._installLayerFix(o),this._layerFix=!0),t.perf!==!1&&o&&!/[?&](perf2off|noucache)\b/.test(globalThis.location?.search??``)&&M(o),this._fwd=new g,this._c=new g,this._r=new g,this._u=new g,this._tmp=new g,this.forceAll=!0}_collectBig(e){let n=this._big=[],r=this._capped=[],i=this._bigMemo??=new WeakMap;e.traverse(e=>{if((e.userData?.maxCascade!==void 0||e.userData?.minCascade!==void 0)&&e.castShadow&&r.push(e),!e.isMesh||e.isSkinnedMesh||!e.frustumCulled||!e.geometry||!e.castShadow||e.userData.dynamic)return;let a=e.geometry;if(e.isInstancedMesh&&!e.count)return;e.updateWorldMatrix(!0,!1);let o=e.matrixWorld.elements,s=e.isInstancedMesh?e.instanceMatrix.version:-1,c=a.attributes.position?.count??0,l=i.get(e);if(l&&l.g===a&&l.n===(e.isInstancedMesh?e.count:-1)&&l.iv===s&&l.pc===c&&l.bb===a.boundingBox&&(!l.bb||l.bb.min.equals(l.b0)&&l.bb.max.equals(l.b1))&&o.every((e,t)=>e===l.m[t])){l.boxes&&n.push(e,l.boxes);return}e.isInstancedMesh?e.computeBoundingBox():a.boundingBox||a.computeBoundingBox(),l={g:a,n:e.isInstancedMesh?e.count:-1,iv:s,pc:c,bb:a.boundingBox,b0:a.boundingBox?.min.clone(),b1:a.boundingBox?.max.clone(),m:o.slice(),boxes:null},i.set(e,l);let u=e.isInstancedMesh?e.boundingBox:a.boundingBox;if(!u||u.isEmpty())return;let d=u.clone().applyMatrix4(e.matrixWorld);if(d.max.x-d.min.x<60&&d.max.z-d.min.z<60&&d.max.y-d.min.y<60)return;let f=[d];if(!e.isInstancedMesh&&(d.max.x-d.min.x>512||d.max.z-d.min.z>512)){let n=this._cellBoxes??=new WeakMap,r=n.get(e);if(!r||r.g!==a||r.n!==a.attributes.position.count){let i=a.attributes.position,o=new g,s=new Map;for(let n=0;n<i.count;n++){o.fromBufferAttribute(i,n).applyMatrix4(e.matrixWorld);let r=Math.floor(o.x/256)*65536+Math.floor(o.z/256),a=s.get(r);a||s.set(r,a=new t),a.expandByPoint(o)}n.set(e,r={g:a,n:i.count,boxes:[...s.values()]})}f=r.boxes}l.boxes=f,n.push(e,f)})}_installLayerFix(e){let t=e.shadowMap,n=t.render,r=[null],i=this,a=[];t.render=function(e,o,s){if(t.enabled===!1||t.autoUpdate===!1&&t.needsUpdate===!1||!e.length)return n.call(this,e,o,s);let c=s.layers.mask,l=t.needsUpdate;try{for(let c of e){let e=c.shadow;if(!e||e.autoUpdate===!1&&e.needsUpdate===!1)continue;s.layers.mask=e.camera.layers.mask;let u=i._big,d=i.lights.indexOf(c);if(i._capped&&d>=0)for(let e of i._capped){let t=e.userData;e.visible&&(d>(t.maxCascade??99)||d<(t.minCascade??0))&&(e.visible=!1,a.push(e))}if(u&&c.isDirectionalLight&&e.getFrustum){e.updateMatrices(c);let t=e.getFrustum();for(let e=0;e<u.length;e+=2){let n=u[e];if(!n.visible||!n.castShadow)continue;let r=u[e+1],i=!1;for(let e=0;e<r.length&&!i;e++)i=t.intersectsBox(r[e]);i||(n.visible=!1,a.push(n))}}r[0]=c,t.needsUpdate=l;try{n.call(this,r,o,s)}finally{for(let e of a)e.visible=!0;a.length=0}}}finally{s.layers.mask=c,r[0]=null}}}_viewWedge(e){let t=A.view??={x:0,z:1,cos:-2};if(!e.isPerspectiveCamera){t.cos=-2;return}let n=this._fwd,r=Math.hypot(n.x,n.z);if(r<.3){t.cos=-2;return}t.x=n.x/r,t.z=n.z/r;let i=Math.tan(_.degToRad(e.fov)*.5),a=i*e.aspect,o=this._tmp,s=e.matrixWorld.elements,c=1;for(let e=0;e<4;e++){let n=e&1?a:-a,r=e&2?i:-i;o.set(s[0]*n+s[4]*r-s[8],s[1]*n+s[5]*r-s[9],s[2]*n+s[6]*r-s[10]);let l=Math.hypot(o.x,o.z);if(l<1e-4){t.cos=-2;return}c=Math.min(c,(o.x*t.x+o.z*t.z)/l)}let l=Math.acos(Math.max(-1,Math.min(1,c)))+Math.PI/3;t.cos=l>=Math.PI?-2:Math.cos(l)}setSunDirection(e){this.sunDir.copy(e).normalize(),this.forceAll=!0}tagCasters(e){let t=new g;e.traverse(e=>{if(!e.castShadow||!e.isMesh||this._tagged.has(e))return;this._tagged.add(e);let n=e.geometry;if(!n)return;n.boundingSphere||n.computeBoundingSphere(),e.updateWorldMatrix(!0,!1),t.setFromMatrixScale(e.matrixWorld);let r=(n.boundingSphere?.radius??0)*Math.max(t.x,t.y,t.z);if(e.isInstancedMesh&&e.instanceMatrix&&e.count>0){let i=new f().fromArray(e.instanceMatrix.array,0),a=new g().setFromMatrixScale(i);r=(n.boundingSphere?.radius??0)*Math.max(a.x,a.y,a.z)*Math.max(t.x,t.y,t.z)}/^detail\b/.test(e.name||``)||e.userData?.smallCasters||r>=3&&e.layers.enable(28)})}setCharacter(e){!e||e===this._charObj&&this._charCount===this._countMeshes(e)||(this._charObj=e,this._charCount=this._countMeshes(e),e.traverse(e=>{(e.isMesh||e.isSkinnedMesh)&&e.layers.enable(30)}))}_countMeshes(e){let t=0;return e.traverse(e=>{(e.isMesh||e.isSkinnedMesh)&&t++}),t}setFocus(e){e?(this.focus??=new g).copy(e):this.focus=null}_fit(e,t,n,r,i,a,o){let s=2*n/o,c=Math.round(t.dot(r)/s)*s,l=Math.round(t.dot(i)/s)*s,u=t.dot(a);t.copy(r).multiplyScalar(c).addScaledVector(i,l).addScaledVector(a,u);let d=n+900;e.position.copy(t).addScaledVector(a,d),e.target.position.copy(t),e.updateMatrixWorld(),e.target.updateMatrixWorld();let f=e.shadow.camera;f.left=-n,f.right=n,f.top=n,f.bottom=-n,f.near=1,f.far=d+n+50,f.updateProjectionMatrix();let p=f.far-f.near;e.shadow.normalBias=s*1.4,e.shadow.bias=(this.reversed?1:-1)*(s*.6)/p,e.shadow.needsUpdate=!0}update(e,t){this.frame++,t&&this._tagFrame++%120==0&&(this.tagCasters(t),this._layerFix&&this._collectBig(t)),A.params.x=this.stableDither?.5:this.frame%64*.618034%1,A.params.y=.06;let n=this.sunDir,r=Math.abs(n.y)>.99?this._tmp.set(0,0,1):this._tmp.set(0,1,0),i=this._r.crossVectors(r,n).normalize(),a=this._u.crossVectors(n,i).normalize();e.getWorldDirection(this._fwd),this._viewWedge(e);let o=new g().setFromMatrixPosition(e.matrixWorld),s=Math.tan(_.degToRad(Math.max(e.fov,80))*.5),c=s*Math.max(e.aspect,16/9),l=s*s+c*c;for(let t=0;t<this.N;t++){let r=this.lights[t],s=this.periods[t];if(!(this.forceAll||(this.frame+t)%s===0)){r.shadow.needsUpdate=!1;continue}let c=Math.max(this.splits[t],e.near),u=Math.min(this.splits[t+1],e.far),d=(u+c)*.5*(1+l),f;d>=u?(d=u,f=u*Math.sqrt(l)):f=Math.sqrt((d-c)**2+c*c*l),t>=1&&(f*=[1,1.06,1.12,1.15][t]),f=Math.ceil(f);let p=this._c.copy(this._fwd).multiplyScalar(d).add(o),m=2*f/r.shadow.mapSize.x,h=Math.round(p.dot(i)/m)*m,g=Math.round(p.dot(a)/m)*m,_=Math.round(p.dot(n)/4)*4;p.copy(i).multiplyScalar(h).addScaledVector(a,g).addScaledVector(n,_);let v=f+900;r.position.copy(p).addScaledVector(n,v),r.target.position.copy(p),r.updateMatrixWorld(),r.target.updateMatrixWorld();let y=r.shadow.camera;y.left=-f,y.right=f,y.top=f,y.bottom=-f,y.near=1,y.far=v+f+50,y.updateProjectionMatrix();let b=y.far-y.near;r.shadow.normalBias=m*1.4,r.shadow.bias=(this.reversed?1:-1)*(m*.6)/b,r.shadow.needsUpdate=!0}if(this.forceAll=!1,this.charLight){let e=this._c;this.focus&&this.focus.distanceTo(o)<25?e.copy(this.focus).add(this._tmp.set(0,.9,0)):e.set(0,-5e3,0);let t=this.charRadius;this._fit(this.charLight,e,t,i,a,n,this.charSize),this.charLight.shadow.normalBias=2*t/this.charSize*2}}};function P(e){let t=Object.entries(e.attributes).filter(([,e])=>!e.isInstancedBufferAttribute&&!e.isInterleavedBufferAttribute&&e.itemSize>0&&e.itemSize<=4);if(t.length<2)return e;let n=t[0][1].count;if(t.some(([,e])=>e.count!==n))return e;let r=new Map;for(let[e,n]of t){let t=n.array.constructor,i=r.get(t)??[];i.push([e,n]),r.set(t,i)}for(let t of r.values()){if(t.length<2)continue;let r=t[0][1].array.constructor,i=t[0][1].array.BYTES_PER_ELEMENT,a=Math.max(1,4/i),o=t.reduce((e,[,t])=>e+t.itemSize,0),s=Math.ceil(o/a)*a,c=new r(n*s),l=new Map,d=0;for(let[e,r]of t){l.set(e,d);for(let e=0;e<n;e++){let t=e*s+d,n=e*r.itemSize;for(let e=0;e<r.itemSize;e++)c[t+e]=r.array[n+e]}d+=r.itemSize}let f=new u(c,s);for(let[n,r]of t)e.setAttribute(n,new h(f,r.itemSize,l.get(n),r.normalized))}return e}export{E as a,T as i,N as n,w as o,A as r,P as t};
//# sourceMappingURL=world~index~gameSystems-B06jYbTN.js.map