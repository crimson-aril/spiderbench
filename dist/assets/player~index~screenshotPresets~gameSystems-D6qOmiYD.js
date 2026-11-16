import{A as e,Dt as t,Fr as n,Gt as r,Hn as i,Ir as a,L as o,Qi as s,U as c,Wi as l,ar as u,fa as d,io as f,j as p,jr as m,no as h,or as g,ro as _,ta as v,tr as y}from"./three~index~combat~tslPipeline~screenshotPresets~gameSystems~GLTFLoader-B3xvqeNo.js";import{Ai as b,Ar as x,Bi as S,Ci as ee,Ct as te,Fr as C,Gr as w,Gt as ne,Ht as T,Ii as E,Lt as D,Nr as O,Vt as k,Wt as A,Zi as j,_r as M,aa as N,br as re,ca as P,ea as F,hn as ie,ia as I,ki as ae,mr as oe,nt as se,ra as L,ta as ce,ut as le,vr as R,yt as ue,zt as de}from"./three~index~combat~tslPipeline~screenshotPresets~gameSystems-DsPuCJ23.js";import{r as fe,t as pe}from"./three~index~combat~tslPipeline~screenshotPresets~gameSystems-B-te4akP.js";import{o as me,t as z}from"./world~index~tslPipeline~screenshotPresets~gameSystems-ZgHieP-C.js";import{f as he,i as ge,o as B}from"./world~index~combat~screenshotPresets~gameSystems-BOTEtzPM.js";import{i as _e}from"./vehicleLighting-Cqq_fzGi.js";import{t as ve}from"./world~index~screenshotPresets~gameSystems-DkElXVD0.js";import{t as V}from"./render~index~screenshotPresets~gameSystems-BxKjAEH8.js";var ye=`in vec3 nextPos;
in float side;
in float along;
in float strandW;
in float dist;
uniform vec2 uRes;
uniform float uWidth;
uniform float uMinPx;
out float vSide;
out float vAlpha;
out float vAlong;
out float vDist;
out float vPx;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec4 c0 = projectionMatrix * mv;
  vec4 c1 = projectionMatrix * modelViewMatrix * vec4(nextPos, 1.0);
  vec2 s0 = c0.xy / c0.w * uRes * 0.5, s1 = c1.xy / c1.w * uRes * 0.5;
  vec2 d = s1 - s0;
  float L = length(d);
  d = L > 1e-4 ? d / L : vec2(1.0, 0.0);
  vec2 n = vec2(-d.y, d.x);
    // world width -> pixels
  float px = uWidth * strandW * projectionMatrix[1][1] * uRes.y * 0.5 / max(0.05, -mv.z);
  float w = max(px, uMinPx);
  vAlpha = clamp(px / uMinPx, 0.35, 1.0);
  vec2 off = n * side * (w * 0.5 + 1.0);
  c0.xy += off / (uRes * 0.5) * c0.w;
  gl_Position = c0;
  vSide = side * (w * 0.5 + 1.0) / (w * 0.5);
  vAlong = along;
  vDist = dist;
  vPx = w;
}
`,be=`uniform vec3 uColor;
uniform float uOpacity;
uniform float uVenom;
in float vSide;
in float vAlpha;
in float vAlong;
in float vDist;
in float vPx;
out vec4 fragColor;
float h1(float x) {
  return fract(sin(x * 127.1) * 43758.5453);
}
float vn(float x) {
  float i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(h1(i), h1(i + 1.0), f);
}
void main() {
  if(uVenom > 0.5) {
    float t = vDist;
      // envelope radius (fraction of the ribbon half-width): slow bulges + knots; thin strands (few px) stay solid
    float bulge = vn(t * 1.7 + 3.1), knot = smoothstep(0.72, 1.0, vn(t * 3.9 + 1.7));
    float R = 0.5 + 0.36 * bulge + 0.2 * knot + 0.06 * vn(t * 11.0);
    float detail = smoothstep(3.0, 9.0, vPx);
    R = mix(0.95, R, detail);
      // three twisted sub-cords (braided / ropy symbiote mass), faded to one solid cord when the twist is sub-pixel
    float pitchPx = vPx * 0.9 / max(fwidth(t) * 3.4 * vPx, 1e-4); // ~ one twist period in pixels
    float braid = detail * smoothstep(6.0, 14.0, pitchPx);
    float y = vSide / R;            // -1..1 across the envelope
    float aa = 1.6 / max(vPx * R * 0.5, 1.0);
      // each covering cord contributes its shading, weighted toward the one nearest the viewer (soft, no seams)
    float cov = 0.0, wsum = 0.0, depB = 0.0;
    vec3 col = vec3(0.0);
    float mott = vn(t * 4.3 + 11.0);
    for(int k = 0; k < 3; k++) {
      float fk = float(k);
      float ph = t * 13.0 + 9.0 * vn(t * 0.9 + 2.0) + fk * 2.0944 + 2.2 * vn(t * 2.6 + fk * 5.0); // uneven, organic twist
      float c = (0.36 + 0.14 * vn(t * 5.0 + fk)) * sin(ph) * braid, dep = cos(ph);   // lateral centre, depth (toward viewer +)
      float rs = mix(1.0, 0.5 + 0.22 * vn(t * 6.0 + fk * 3.3), braid);
      float xl = (y - c) / rs;
      float ck = 1.0 - smoothstep(1.0 - aa / rs, 1.0 + aa / rs, abs(xl));
      if(ck < 0.001)
        continue;
      cov = max(cov, ck);
      float nz = sqrt(max(0.0, 1.0 - xl * xl)), fib = vn(t * 38.0 + xl * 1.5 + fk * 7.0);
      float occl = mix(1.0, 0.5 + 0.5 * (dep * 0.5 + 0.5), braid);                // cords behind read darker
      vec3 cc = uColor * (0.5 + 0.5 * nz) * (0.8 + 0.3 * fib) * (0.85 + 0.3 * mott) * occl;
        // wet specular streak (light from above-left in screen space) + faint cool rim
      float spec = pow(max(0.0, 1.0 - abs(xl + 0.4) * 1.7), 3.0) * (0.45 + 0.55 * fib) * (0.55 + 0.45 * mott) * (0.6 + 0.4 * occl);
      cc += vec3(0.26, 0.28, 0.32) * spec + vec3(0.035, 0.04, 0.05) * pow(1.0 - nz, 3.0);
      float w = ck * exp(dep * 7.0 * braid) * nz + 1e-4;
      col += cc * w;
      wsum += w;
    }
    if(cov * uOpacity < 0.004)
      discard;
    col /= max(wsum, 1e-4);
    fragColor = vec4(col, cov * uOpacity * max(vAlpha, 0.8));
    fragColor = linearToOutputTexel(fragColor);
    return;
  }
  float edge = 1.0 - smoothstep(0.55, 1.0 + 0.35, abs(vSide));
  float core = 1.0 - smoothstep(0.0, 0.9, abs(vSide));
  vec3 col = mix(uColor * 0.82, uColor * 1.15, core);   // slight cylindrical shading / glow core
  float a = edge * vAlpha * uOpacity * (0.75 + 0.25 * core);
  if(a < 0.004)
    discard;
  fragColor = vec4(col, a);
  fragColor = linearToOutputTexel(fragColor);
}
`;function xe(){let e={uRes:j(new h(1920,1080)),uWidth:j(.022),uMinPx:j(2),uColor:j(new c(15659766)),uOpacity:j(.92),uVenom:j(0)},t=se(`side`,`float`),n=se(`strandW`,`float`),r=se(`nextPos`,`vec3`),i=se(`dist`,`float`),a=w,o=re.mul(N(a,1)),s=le.mul(o),l=le.mul(re.mul(N(r,1))),u=s.xy.div(s.w).mul(e.uRes).mul(.5),d=l.xy.div(l.w).mul(e.uRes).mul(.5).sub(u),f=d.length(),p=d.div(f.max(1e-4)),m=L(p.y.negate(),p.x),g=le.element(1).element(1),_=e.uWidth.mul(n).mul(g).mul(e.uRes.y).mul(.5).div(o.z.negate().max(.05)),v=_.max(e.uMinPx),y=t.mul(v.mul(.5).add(1)).div(v.mul(.5)),x=m.mul(t).mul(v.mul(.5).add(1)).div(e.uRes.mul(.5)).mul(s.w),S=ce(y,`vSide`),C=ce(_.div(e.uMinPx).clamp(.35,1),`vAlpha`),E=ce(i,`vDist`),D=ce(v,`vPx`),O=new pe;O.name=`WebStrands.TSL`,O.vertexNode=s.add(N(x,0,0));let M=e=>A(ae(e.mul(127.1)).mul(43758.5453)),P=e=>{let t=T(e),n=A(e),r=n.mul(n).mul(k(3).sub(n.mul(2)));return R(M(t),M(t.add(1)),r)},F=E,ie=P(F.mul(1.7).add(3.1)),oe=b(.72,1,P(F.mul(3.9).add(1.7))),ue=k(.5).add(ie.mul(.36)).add(oe.mul(.2)).add(P(F.mul(11)).mul(.06)),fe=b(3,9,D);ue=R(k(.95),ue,fe);let me=D.mul(.9).div(ne(F).mul(3.4).mul(D).max(1e-4)),z=fe.mul(b(6,14,me)),he=S.div(ue),ge=k(1.6).div(D.mul(ue).mul(.5).max(1)),B=P(F.mul(4.3).add(11)),_e=k(0),ve=k(0),V=I(0);for(let t=0;t<3;t++){let n=k(t),r=F.mul(13).add(P(F.mul(.9).add(2)).mul(9)).add(n.mul(2.0944)).add(P(F.mul(2.6).add(n.mul(5))).mul(2.2)),i=te(r),a=k(.36).add(P(F.mul(5).add(n)).mul(.14)).mul(ae(r)).mul(z),o=R(k(1),k(.5).add(P(F.mul(6).add(n.mul(3.3))).mul(.22)),z),s=he.sub(a).div(o),c=k(1).sub(b(k(1).sub(ge.div(o)),k(1).add(ge.div(o)),s.abs()));_e=_e.max(c);let l=k(1).sub(s.mul(s)).max(0).sqrt(),u=P(F.mul(38).add(s.mul(1.5)).add(n.mul(7))),d=R(k(1),k(.5).add(i.mul(.5).add(.5).mul(.5)),z),f=e.uColor.mul(k(.5).add(l.mul(.5))).mul(k(.8).add(u.mul(.3))).mul(k(.85).add(B.mul(.3))).mul(d),p=k(1).sub(s.add(.4).abs().mul(1.7)).max(0).pow(3).mul(k(.45).add(u.mul(.55))).mul(k(.55).add(B.mul(.45))).mul(k(.6).add(d.mul(.4)));f=f.add(I(.26,.28,.32).mul(p)).add(I(.035,.04,.05).mul(k(1).sub(l).pow(3)));let m=c.mul(de(i.mul(7).mul(z))).mul(l).add(1e-4);V=V.add(f.mul(m)),ve=ve.add(m)}let ye=V.div(ve.max(1e-4)),be=_e.mul(e.uOpacity).mul(C.max(.8)),xe=k(1).sub(b(.55,1.35,S.abs())),H=k(1).sub(b(0,.9,S.abs())),U=R(e.uColor.mul(.82),e.uColor.mul(1.15),H),W=xe.mul(C).mul(e.uOpacity).mul(k(.75).add(H.mul(.25))),G=e.uVenom.greaterThan(.5),Se=ee(G,be,W);return O.colorNode=ee(G,ye,U),O.opacityNode=Se,O.alphaTest=.004,O.transparent=!0,O.depthWrite=!0,O.side=2,{material:O,uniforms:e}}var H={off:new _,w:0},U=64,W=4,G=6,Se=ye,Ce=be,we=new Set,Te=new Set,Ee=!1,De={white:{color:15659766,width:.022,minPx:2},venom:{color:723983,width:.06,minPx:2.6}};function K(e){let t=Ee?De.venom:De.white;if(e.nodeUniforms){let n=e.nodeUniforms;n.uColor.value.set(t.color),n.uWidth.value=t.width*e.widthK,n.uMinPx.value=t.minPx,n.uVenom.value=+!!Ee}else{let n=e.mat.uniforms;n.uColor.value.set(t.color),n.uWidth.value=t.width*e.widthK,n.uMinPx.value=t.minPx,n.uVenom.value=+!!Ee}}function Oe(e){Ee=!!e;for(let e of we)K(e);for(let e of Te)e(Ee)}var ke=class{constructor(n,{widthK:i=1}={}){this.counts=n,this.widthK=i;let a=n.reduce((e,t)=>e+t+1,0),o=new Float32Array(a*2*3),s=new Float32Array(a*2*3),l=new Float32Array(a*2),f=new Float32Array(a*2),m=new Float32Array(a*2),g=new Float32Array(a*2),y=[],b=0;this.offsets=[];for(let e of n){this.offsets.push(b);for(let t=0;t<=e;t++)l[(b+t)*2]=-1,l[(b+t)*2+1]=1,f[(b+t)*2]=f[(b+t)*2+1]=t/e,m[(b+t)*2]=m[(b+t)*2+1]=1;for(let t=0;t<e;t++){let e=(b+t)*2;y.push(e,e+1,e+2,e+1,e+3,e+2)}b+=e+1}let x=new p;if(x.setAttribute(`position`,new e(o,3).setUsage(t)),x.setAttribute(`nextPos`,new e(s,3).setUsage(t)),x.setAttribute(`side`,new e(l,1)),x.setAttribute(`along`,new e(f,1)),x.setAttribute(`strandW`,new e(m,1).setUsage(t)),x.setAttribute(`dist`,new e(g,1).setUsage(t)),x.setIndex(y),x.boundingSphere=new d(new _,1e5),this.geo=x,he()){let e=xe();this.mat=e.material,this.nodeUniforms=e.uniforms}else this.mat=new v({glslVersion:r,vertexShader:Se,fragmentShader:Ce,transparent:!0,depthWrite:!0,side:2,uniforms:{uRes:{value:new h(1920,1080)},uWidth:{value:.022},uMinPx:{value:2},uColor:{value:new c(15659766)},uOpacity:{value:.92},uVenom:{value:0}}}),this.nodeUniforms=null;we.add(this),K(this),this.mesh=new u(x,this.mat),this.mesh.frustumCulled=!1,this.mesh.renderOrder=5,this.mesh.name=`WebStrands`}setResolution(e,t){(this.nodeUniforms?.uRes.value??this.mat.uniforms.uRes.value).set(e,t)}setOpacity(e){this.nodeUniforms?this.nodeUniforms.uOpacity.value=e:this.mat.uniforms.uOpacity.value=e}setStrand(e,t,n=1){let r=this.counts[e],i=this.offsets[e],a=this.geo.attributes.position.array,o=this.geo.attributes.nextPos.array,s=this.geo.attributes.strandW.array,c=this.geo.attributes.dist.array,l=0,u=Math.min(r,t.length-1);for(let n=r;n>=0;n--)n<u&&(l+=t[Math.min(n,t.length-1)].distanceTo(t[Math.min(n+1,t.length-1)])),c[(i+n)*2]=c[(i+n)*2+1]=l+e*1.37;for(let e=0;e<=r;e++){let c=t[Math.min(e,t.length-1)],l=e<r?t[Math.min(e+1,t.length-1)]:null,u,d,f;if(l&&l.distanceToSquared(c)>1e-10)u=l.x,d=l.y,f=l.z;else{let n=t[Math.max(0,Math.min(e,t.length-1)-1)];u=2*c.x-n.x,d=2*c.y-n.y,f=2*c.z-n.z}for(let t=0;t<2;t++){let r=((i+e)*2+t)*3;a[r]=c.x,a[r+1]=c.y,a[r+2]=c.z,o[r]=u,o[r+1]=d,o[r+2]=f,s[(i+e)*2+t]=n}}}hideStrand(e){let t=new _(0,-1e4,0);this.setStrand(e,[t,t])}commit(){for(let e of[`position`,`nextPos`,`strandW`,`dist`])this.geo.attributes[e].needsUpdate=!0}};function Ae(){let e=document.createElement(`canvas`);e.width=e.height=256;let t=e.getContext(`2d`);t.translate(128,128),t.strokeStyle=`rgba(255,255,255,0.95)`,t.lineCap=`round`;let n=je(7),r=[...Array(11)].map((e,t)=>t/11*Math.PI*2+(n()-.5)*.4),i=r.map(()=>70+n()*55);t.lineWidth=3.2,r.forEach((e,n)=>{t.beginPath(),t.moveTo(0,0),t.lineTo(Math.cos(e)*i[n],Math.sin(e)*i[n]),t.stroke()}),t.lineWidth=1.8;for(let e of[16,30,46,64])t.beginPath(),r.forEach((a,o)=>{let s=Math.min(e*(.9+n()*.2),i[o]),c=Math.cos(a)*s,l=Math.sin(a)*s;if(o===0)t.moveTo(c,l);else{let e=r[o-1]+(a-r[o-1])/2;t.quadraticCurveTo(Math.cos(e)*s*.8,Math.sin(e)*s*.8,c,l)}}),t.stroke();let a=t.createRadialGradient(0,0,0,0,0,22);a.addColorStop(0,`rgba(255,255,255,1)`),a.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=a,t.beginPath(),t.arc(0,0,22,0,Math.PI*2),t.fill();let c=new o(e);return c.colorSpace=s,c.anisotropy=4,c}function je(e){return()=>{e|=0,e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function Me(t){let r=[U,...Array(W).fill(G),U,...Array(W).fill(G)];for(let e=0;e<3;e++)r.push(U,...Array(W).fill(G));let i=new ke(r);t.add(i.mesh);let o=Ae(),s=new g({map:o,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-4,color:16054008}),c=[...Array(8)].map(()=>{let e=new u(new m(1,1),s.clone());return e.visible=!1,e.renderOrder=4,t.add(e),{m:e,t:0,life:0}}),l=0,f=e=>{for(let t of c)t.m.material.color.set(e?1184534:16054008);S.material.color.set(e?1579292:16777215)},h=new p,v=new Float32Array(144),b=[...Array(48)].map(()=>new _),x=new Float32Array(48);h.setAttribute(`position`,new e(v,3)),h.boundingSphere=new d(new _,1e5);let S=new n(h,new a({color:16777215,size:.07,transparent:!0,opacity:.8,depthWrite:!1}));S.frustumCulled=!1,t.add(S);let ee=0;Te.add(f),f(Ee);let te=()=>({on:!1,t:0,hand:new _,anchor:new _,normal:new _(0,0,1),shootDur:.12,tension:0,seed:0,slack:0,slackIn:0,snapT:9,taut:0,pts:[...Array(65)].map(()=>new _)}),C=te(),w=te(),ne=[...[,,,]].map(()=>({on:!1,t:0,pts:[],vel:[],anchor:new _,normal:new _,seed:0})),T=0,E=0,D=[...Array(7)].map(()=>new _),O=new _,k=new _,A=new _,j=new _,M=new _,N=new _;function re(e,t,n,r,a,o,s=1){O.set(0,1,0),Math.abs(r.y)>.9&&O.set(1,0,0);let c=k.crossVectors(r,O).normalize(),l=A.crossVectors(r,c).normalize();for(let u=0;u<W;u++){let d=a*6.28+Math.PI*2/W*u+Math.sin(a*13+u)*.5,f=o*(.55+.45*Math.abs(Math.sin(a*7+u*2.3))),p=j.copy(n).addScaledVector(c,Math.cos(d)*f).addScaledVector(l,Math.sin(d)*f).addScaledVector(r,.02);for(let e=0;e<=G;e++){let n=e/G;D[e].copy(t).lerp(p,n),D[e].addScaledVector(r,Math.sin(n*Math.PI)*.05*o)}i.setStrand(e+u,D,.55*s)}}function P(e,t,n=!1){let r=n?null:c[l++%c.length];r&&(r.m.visible=!0,r.t=0,r.life=2.2,r.m.position.copy(e).addScaledVector(t,.03),r.m.lookAt(O.copy(e).add(t)),r.m.rotateZ(Math.random()*6.28),r.m.scale.setScalar(.01));for(let n=0;n<16;n++){let n=ee++%48;v[n*3]=e.x,v[n*3+1]=e.y,v[n*3+2]=e.z,x[n]=.45,b[n].set(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(5).addScaledVector(t,3)}}function F(e,t,n,r,i,a,o=!1,s=!1){e.noSplat=o,e.noDecal=s,e.on=!0,e.t=+!!i,e.hand.copy(t),e.anchor.copy(n),e.normal.copy(r||O.set(0,0,1)).normalize(),e.seed=Math.random(),e.impacted=i,e.slack=e.slackIn=0,e.snapT=9,e.taut=0,e.shootDur=a??y.clamp(t.distanceTo(n)/380,.05,.16);for(let n of e.pts)n.copy(t);i&&!o&&P(n,e.normal,s)}function ie(e){if(!e.on)return;e.on=!1;let t=ne[T++%3];t.on=!0,t.t=0,t.anchor.copy(e.anchor),t.normal.copy(e.normal),t.seed=e.seed,t.noSplat=!!e.noSplat,t.pts=e.pts.map(e=>e.clone()),t.vel=t.pts.map(()=>new _(0,0,0))}function I(e,t,n,r){if(!e.on){i.hideStrand(t);for(let e=0;e<W;e++)i.hideStrand(t+1+e);return}e.t+=r,e.hand.copy(n),t===0&&H.w>.001&&(n=N.copy(n).addScaledVector(H.off,Math.min(1,H.w)));let a=Math.min(1,e.t/e.shootDur),o=1-(1-a)**3;a>=1&&!e.impacted&&(e.impacted=!0,e.noSplat||P(e.anchor,e.normal,e.noDecal));let s=Math.max(0,e.t-e.shootDur);e.slack+=(e.slackIn-e.slack)*(1-Math.exp(-(e.slackIn>e.slack?7:22)*r)),e.snapT+=r;let c=e.snapT<.6?Math.exp(-e.snapT*7)*.45:0,l=((1-o)*.35+Math.exp(-s*9)*.25+.012+e.slack*.18+c)*(1-.9*e.taut),u=n.distanceTo(e.anchor),d=k.copy(e.anchor).sub(n).normalize(),f=A.set(0,1,0).cross(d);f.lengthSq()<1e-4&&f.set(1,0,0),f.normalize();let p=j.crossVectors(d,f).normalize(),m=M.set(0,-1,0).addScaledVector(d,d.y);m.lengthSq()<.04&&m.copy(p),m.normalize();let h=e.slack*Math.min(u*.16,3.2)*+!!e.impacted,g=e.pts;for(let t=0;t<=U;t++){let r=t/U*o,i=g[t].copy(n).addScaledVector(d,u*r),a=Math.sin(Math.min(1,r/Math.max(o,.001))*Math.PI),s=r*u*.9-e.t*22+e.seed*40,_=r*u*.55-e.snapT*38;i.addScaledVector(f,Math.sin(s)*l*a+Math.sin(_)*c*a).addScaledVector(p,Math.cos(s*.7+1.3)*l*.6*a),h>0&&i.addScaledVector(m,h*a*(1+.08*Math.sin(e.t*3.1+r*5)))}if(i.setStrand(t,g,1-.3*e.taut),e.impacted&&!e.noSplat){let n=Math.min(1,s/.08);re(t+1,g[Math.floor(U*.975)],e.anchor,e.normal,e.seed,.9*n+.05)}else for(let e=0;e<W;e++)i.hideStrand(t+1+e)}return{get active(){return C.on},get active2(){return w.on},anchor2:w.anchor,attach(e,t,n,{instant:r=!1,shootDur:i=null,noSplat:a=!1,noDecal:o=!1}={}){(C.on||w.on)&&this.release(),F(C,e,t,n,r,i,a,o)},attachSecond(e,t,n,{instant:r=!1,shootDur:i=null,noDecal:a=!1}={}){w.on&&ie(w),F(w,e,t,n,r,i,!1,a)},setTaut(e=0){C.taut=w.taut=y.clamp(e,0,1)},release(){ie(C),ie(w)},retarget(e,t){C.on&&(C.anchor.copy(e),t&&C.normal.copy(t).normalize())},setSlack(e=0,t=0){C.slack>.35&&e<.1&&t>.3&&(C.snapT=0),C.slackIn=y.clamp(e,0,1)},isImpacted(){return C.on&&C.impacted},splat(e,t){P(e,t)},setSeed(e){C.seed=e},releaseSnap(e=.35){let t=T;this.release();for(let n=t;n<T;n++){let t=ne[n%3];t.life=e,t.pts.forEach((e,n)=>{let r=1-n/U;t.vel[n].copy(t.anchor).sub(e).multiplyScalar(2.2*r)})}},update(e,t,n,r,a=null){E+=e;let o=r.getDrawingBufferSize(O);i.setResolution(o.x,o.y),I(C,0,t,e),I(w,5,a||t,e),ne.forEach((t,n)=>{let r=10+n*5;if(!t.on){i.hideStrand(r);for(let e=0;e<W;e++)i.hideStrand(r+1+e);return}t.t+=e;let a=Math.max(0,1-t.t/(t.life||.7));if(a<=0)t.on=!1;else{for(let n=0;n<=U;n++){let r=1-n/U;t.vel[n].y-=18*e*r,t.pts[n].addScaledVector(t.vel[n],e)}if(i.setStrand(r,t.pts,a),t.noSplat)for(let e=0;e<W;e++)i.hideStrand(r+1+e);else re(r+1,t.pts[Math.floor(U*.975)],t.anchor,t.normal,t.seed,.95,a)}}),i.setOpacity(.92),i.commit();for(let t of c){if(!t.m.visible)continue;t.t+=e;let n=Math.min(1,t.t/.09);t.m.scale.setScalar(.2+1.1*(1-(1-n)**3)),t.m.material.opacity=Math.min(1,(t.life-t.t)/.6),t.t>t.life&&(t.m.visible=!1)}for(let t=0;t<48;t++)x[t]<=0?v[t*3+1]=-1e4:(x[t]-=e,b[t].y-=6*e,b[t].multiplyScalar(1-3*e),v[t*3]+=b[t].x*e,v[t*3+1]+=b[t].y*e,v[t*3+2]+=b[t].z*e);h.attributes.position.needsUpdate=!0},get shootK(){return C.on?Math.min(1,C.t/C.shootDur):0},anchor:C.anchor}}var Ne=`// suitfabric shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
out vec3 vFabP;
// @section vertexBeginVertex
#include <begin_vertex>
vFabP = position;
// @section fragmentCommon
#include <common>
uniform float uFabOn, uFabNightK;
uniform sampler2D uFabHex, uFabKnit;
uniform vec4 uFabP;
uniform vec3 uCityAmbLo, uCityAmbHi;
in vec3 vFabP;
float fabHash(vec3 p) {
p = fract(p * 0.3183099 + 0.1);
p *= 17.0;
return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float fabNoise(vec3 x) { // value noise, -1..1
vec3 i = floor(x), f = fract(x);
f = f * f * (3.0 - 2.0 * f);
return 2.0 * mix(mix(mix(fabHash(i), fabHash(i + vec3(1, 0, 0)), f.x), mix(fabHash(i + vec3(0, 1, 0)), fabHash(i + vec3(1, 1, 0)), f.x), f.y), mix(mix(fabHash(i + vec3(0, 0, 1)), fabHash(i + vec3(1, 0, 1)), f.x), mix(fabHash(i + vec3(0, 1, 1)), fabHash(i + vec3(1, 1, 1)), f.x), f.y), f.z) - 1.0;
}
// @section fragmentMap
#include <map_fragment>
vec4 fabW = vec4(0.0);
vec3 fabHx = vec3(0.5, 0.5, 0.5), fabKn = vec3(0.5, 0.5, 0.5);
float fabFade = 0.0, fabN1 = 0.0;
#ifdef USE_MAP
if(uFabOn > 0.5) {
vec3 c = diffuseColor.rgb;
float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
float sat = (mx - mn) / max(mx, 1e-4);
float wR = smoothstep(0.03, 0.12, c.r - max(c.g, c.b));
float wB = smoothstep(0.015, 0.05, c.b - max(c.r, c.g)) * (1.0 - wR);
float wW = smoothstep(0.22, 0.42, lum) * (1.0 - smoothstep(0.18, 0.4, sat)) * (1.0 - wR) * (1.0 - wB);
float wK = (1.0 - wR) * (1.0 - wB) * (1.0 - wW);                                   // web lines, piping, emblem outline
fabW = vec4(wR, wB, wW, wK);
  // hex tile registered onto the honeycomb already baked into suit_normal (character_tex.py: 3 cosines, 5 px period on
  // the 4096 map -> cells 5.77 px apart, neighbours along v): same pitch, orientation and phase, so the two reinforce
  // instead of beating into moire. Tile = 4 x 4*sqrt3 cells = 23.094 x 40 texels (texture x runs along Blender v).
vec2 fabPx = vec2(vMapUv.x, 1.0 - vMapUv.y) * uFabP.x - 0.5;
vec2 uvH = vec2(fabPx.y / 23.094, fabPx.x / 40.0), uvK = vMapUv * uFabP.y;
fabHx = texture(uFabHex, uvH).rgb;
fabKn = texture(uFabKnit, uvK).rgb;
  // detail fades out once a hex cell (1/4 tile) covers < ~2 px (mips already average it; this stops the residual shimmer)
float cellPx = 5.7735 / max(length(fwidth(fabPx)), 1e-6);   // hex cell = 5.77 baked texels
fabFade = smoothstep(1.6, 4.0, cellPx);
  // tonal variation in bind-pose space (sticks to the body): slow patches + a finer mottling
fabN1 = fabNoise(vFabP * 5.0 + 1.7);
float n2 = fabNoise(vFabP * 16.0 - 4.2);
vec3 red = c * vec3(0.78, 0.84, 0.98) * (1.0 + 0.16 * fabN1 + 0.06 * n2);             // deeper crimson, gentle shifts
red.b += 0.0035 * (0.5 + 0.5 * fabN1) * lum / 0.07;                                    // a hint of magenta in the lighter patches
float cob = 0.5 + 0.5 * fabN1;                                                        // navy <-> cobalt
vec3 blue = c * mix(vec3(0.78, 0.76, 0.8), vec3(1.05, 1.3, 1.2), cob) * (1.0 + 0.06 * n2);
vec3 o = c * (1.0 + 0.04 * n2) * mix(1.0, 0.86, wW);                                  // emblem: off-white, never blown out
o = mix(o, red, wR);
o = mix(o, blue, wB);
  // woven cavities: grooves darker, crests a touch lighter (mips average to a constant tone at distance)
float cav = dot(vec2(wR + 0.5 * wW, wB), vec2(fabHx.b - 0.62, fabKn.b - 0.55));
o *= 1.0 + uFabP.w * cav;
  #ifdef USE_AOMAP
float fabAO = texture(aoMap, vAoMapUv).r;
o *= mix(1.0, fabAO * fabAO, 0.5);   // light crease AO on the albedo too
  #endif
diffuseColor.rgb = o;
}
#endif
// @section fragmentRoughness
#include <roughnessmap_fragment>
if(uFabOn > 0.5) {
float fabMetal = 0.0;
  #ifdef USE_METALNESSMAP
fabMetal = texture(metalnessMap, vMetalnessMapUv).b;
  #endif
  // red rubberised fabric / navy knit: matte-satin, grooves rougher; emblem + web lines slightly glossier rubber
vec4 rr = vec4(0.58 + 0.12 * (1.0 - fabHx.b) + 0.03 * fabN1, 0.64 + 0.10 * (1.0 - fabKn.b) + 0.03 * fabN1, 0.42 + 0.06 * (1.0 - fabHx.b), 0.40);
float ws = dot(fabW, vec4(1.0)) * (1.0 - smoothstep(0.2, 0.5, fabMetal));   // leave the metal web-shooter parts alone
roughnessFactor = mix(roughnessFactor, dot(rr, fabW) / max(dot(fabW, vec4(1.0)), 1e-3), clamp(ws, 0.0, 1.0));
}
// @section fragmentLightsMaps
#include <lights_fragment_maps>
#ifdef USE_CITYL
iblIrradiance *= mix(1.0, 0.35, uFabNightK);
radiance *= mix(1.0, 0.6, uFabNightK);
#endif
{
vec3 fabWN = transformDirectionByInverseViewMatrix(normal, viewMatrix);
irradiance += mix(uCityAmbLo, uCityAmbHi, 0.5 + 0.5 * fabWN.y) * (0.75 + 0.25 * (1.0 - abs(fabWN.y)));
}
// @section fragmentNormalMaps
#include <normal_fragment_maps>
#ifdef USE_NORMALMAP_TANGENTSPACE
if(uFabOn > 0.5) {
  // tbn = (dP/du, dP/dv) of the glTF UVs. Hex texture x runs along -v, y along +u -> rotate into (u, v).
vec2 hx = fabHx.xy * 2.0 - 1.0;
vec2 dn = vec2(hx.y, - hx.x) * (fabW.x + 0.45 * fabW.z) + (fabKn.xy * 2.0 - 1.0) * fabW.y;
dn *= uFabP.z * fabFade;
normal = normalize(tbn * vec3(mapN.xy + dn, mapN.z));
}
#endif
`,q={enabled:j(0),red:j(new _(1,0,0)),blue:j(new _(0,0,1)),white:j(new _(1)),black:j(new _),rough:j(new f(-1,-1,-1,-1)),metal:j(new f(-1,-1,-1,-1)),emissiveRed:j(new _),emissiveBlue:j(new _),emissiveWhite:j(new _),emissiveBlack:j(new _),emblemMode:j(0),emblemFront:j(new _),emblemBack:j(new _),emblemBackOn:j(0),emblemScale:j(new h(.075,.15)),symbiote:j(0),symBump:j(1),symWhite:j(new _(.72,.72,.75)),symMask:null,normalScale:j(new h(1,1)),fabricOn:j(0),fabricHex:null,fabricKnit:null,fabricParams:j(new f(4096,147,.85,.18))},Pe=new Set,Fe=(e,t)=>{e.value?.copy&&t?.copy?e.value.copy(t):e.value=t};function Ie(e){for(let[t,n]of[[`enabled`,`uSuitOn`],[`red`,`uSuitR`],[`blue`,`uSuitB`],[`white`,`uSuitW`],[`black`,`uSuitK`],[`rough`,`uSuitRough`],[`metal`,`uSuitMetal`],[`emissiveRed`,`uSuitER`],[`emissiveBlue`,`uSuitEB`],[`emissiveWhite`,`uSuitEW`],[`emissiveBlack`,`uSuitEK`],[`emblemMode`,`uEmbMode`],[`emblemFront`,`uEmbFront`],[`emblemBack`,`uEmbBack`],[`emblemBackOn`,`uEmbBackOn`],[`emblemScale`,`uEmbScale`],[`symbiote`,`uSym`],[`symBump`,`uSymBump`],[`symWhite`,`uSymW`]])Fe(q[t],e[n].value)}function Le(e){q.symMask=e;for(let t of Pe)t.symMask.value=e||t.emptyTexture,t.symMaskSoft.value=e||t.emptyTexture}function Re(e){e&&q.normalScale.value.copy(e)}function ze(e,t=q.fabricHex,n=q.fabricKnit){q.fabricOn.value=+!!e,q.fabricHex=t||null,q.fabricKnit=n||null;for(let e of Pe)e.fabricHex.value=t||e.emptyTexture,e.fabricKnit.value=n||e.emptyTexture}function Be(e,t){let n=e?.userData?.suitNodeBinding;n&&(n.baseMap.value=t||n.emptyTexture)}var J=e=>A(ae(D(e,I(127.1,311.7,74.7))).mul(43758.5453)),Y=e=>{let t=T(e),n=A(e),r=n.mul(n).mul(I(3).sub(n.mul(2))),i=R(J(t),J(t.add(I(1,0,0))),r.x),a=R(J(t.add(I(0,1,0))),J(t.add(I(1,1,0))),r.x),o=R(J(t.add(I(0,0,1))),J(t.add(I(1,0,1))),r.x),s=R(J(t.add(I(0,1,1))),J(t.add(I(1,1,1))),r.x);return R(R(i,a,r.y),R(o,s,r.y),r.z).mul(2).sub(1)},Ve=(e,t,n)=>{let r=e.sub(t),i=n.sub(t),a=D(r,i).div(D(i,i).max(1e-6)).clamp(0,1);return r.sub(i.mul(a)).length()},He=(e,t,n)=>e.sub(t).div(n).length().sub(1).mul(M(n.x,n.y)),Ue=(e,t,n,r)=>{let i=e.sub(t).div(n),a=i.x.abs(),o=i.y,s=M(He(L(a,o),L(0,.36),L(.16,.2)),He(L(a,o),L(0,-.12),L(.23,.36))),c=r.div(n);for(let[e,t,n]of[[[.08,.4],[.42,.78],1],[[.42,.78],[.36,1.3],.8],[[.12,.3],[.62,.46],1],[[.62,.46],[.92,.9],.8],[[.12,.14],[.64,.02],1],[[.64,.02],[.96,-.52],.8],[[.1,.04],[.46,-.4],1],[[.46,-.4],[.44,-1.05],.8]])s=M(s,Ve(L(a,o),L(...e),L(...t)).sub(c.mul(n)));return s.mul(n)};function We(e){if(e?.isNodeMaterial)return e;let t=new fe;t.copy(e),t.vertexColors=!1,t.name=e.name,t.userData={...e.userData,suitNodeMaterial:!0},t.userData.webgpuAmbientFloor=!1;let n=F(),r=ve([0,0,148,255],`suit-node-neutral`),i=S(e.map||r,n),a=S(q.fabricHex||r,n),o=S(q.fabricKnit||r,n),s={emptyTexture:r,baseMap:i,symMask:null,symMaskSoft:null,fabricHex:a,fabricKnit:o};Pe.add(s),t.userData.suitNodeBinding=s;let c=ue(e.color||16777215),l=e.map?i.rgb.mul(c):c,u=e.vertexColors?l.mul(P().rgb):l,d=D(u,I(.2126,.7152,.0722)),f=oe(u.r,oe(u.g,u.b)),p=M(u.r,M(u.g,u.b)),m=f.sub(p).div(f.max(1e-4)),g=b(.03,.12,u.r.sub(oe(u.g,u.b))),_=b(.015,.05,u.b.sub(oe(u.r,u.g))).mul(k(1).sub(g)),v=b(.22,.42,d).mul(k(1).sub(b(.18,.4,m))).mul(k(1).sub(g)).mul(k(1).sub(_)),y=k(1).sub(b(.035,.12,d)).mul(k(1).sub(g)).mul(k(1).sub(_)).mul(k(1).sub(v)),ee=N(g,_,v,y),w=R(u,q.red.mul(d.div(.066).clamp(0,2.5)),g);w=R(w,q.blue.mul(d.div(.025).clamp(0,2.5)),_),w=R(w,q.white.mul(d.div(.67).clamp(0,1.5)),v),w=R(w,q.black.mul(d.div(.035).clamp(.3,2)),y);let T=ce(se(`position`,`vec3`),`vSuitRestPosition`),A=C(ce(se(`normal`,`vec3`),`vSuitRestNormal`)),re=E(.02,T.z).mul(b(.15,.45,A.z)).mul(E(T.x.abs(),.2)),le=L(0,k(1.345).sub(q.emblemScale.x.sub(.075).mul(.4))),de=Ue(T.xy,le,q.emblemScale.x,q.emblemScale.x.mul(.0048/.075)),pe=re.mul(k(1).sub(b(-.0015,.0015,de))).mul(q.emblemMode),me=E(T.z,0).mul(b(.15,.45,A.z.negate())).mul(q.emblemBackOn),he=Ue(T.xy,L(0,1.24),q.emblemScale.y,q.emblemScale.y.mul(.009/.15)),ge=me.mul(k(1).sub(b(-.0015,.0015,he))).mul(q.emblemMode);w=R(w,q.emblemFront,pe),w=R(w,q.emblemBack,ge);let B=R(ee,N(0,0,0,1),pe);B=R(B,N(1,0,0,0),ge);let V=L(T.x.add(.32).div(.64),T.y.sub(.92).div(.64)),ye=S(q.symMask||r,V),be=S(q.symMask||r,V,k(1.5));s.symMask=ye,s.symMaskSoft=be;let xe=E(0,V.x).mul(E(V.x,1)).mul(E(0,V.y)).mul(E(V.y,1)),H=E(T.x.abs(),R(.16,.27,b(1.24,1.46,T.y))),U=ye.rg,W=be.rg,G=b(-.012,.012,T.z),Se=R(U.y,U.x,G).mul(xe).mul(H),Ce=R(W.y,W.x,G).mul(xe).mul(H),we=T.mul(13),Te=Y(we.add(3.1)),Ee=Y(we.mul(2.3).add(7.7)),De=Y(we.mul(.5).add(1.7)),K=oe(b(.72,.94,Te.abs()),oe(b(.74,.95,Ee.abs()).mul(.6),b(.78,.97,De.abs()).mul(.85))).mul(k(1).sub(b(.2,.5,Ce))),Oe=Y(T.mul(5).add(2)),ke=q.black.mul(k(.75).add(Oe.mul(.3))).mul(I(.95,.97,1.08)).add(I(.035,.038,.048).mul(K));ke=R(ke,q.symWhite.mul(k(.82).add(b(.6,1,Ce).mul(.18))),Se);let Ae=b(-.05,.45,Y(T.mul(5.5).add(9)).add(Y(T.mul(12).sub(2)).mul(.5))).mul(k(1).sub(Se)),je=N(Ae.mul(k(1).sub(K)),K,Se,k(1).sub(Ae).mul(k(1).sub(K)).mul(k(1).sub(Se)));B=R(B,je,q.symbiote),w=R(w,ke,q.symbiote);let Me=R(u,w,q.enabled),Ne=q.fabricParams,Fe=L(n.x,k(1).sub(n.y)).mul(Ne.x).sub(.5),Ie=L(Fe.y.div(23.094),Fe.x.div(40)),Le=n.mul(Ne.y),Re=a.sample(Ie).rgb,ze=o.sample(Le).rgb,Be=b(1.6,4,k(5.7735).div(ie(ne(Fe)).max(1e-6))),J=Y(T.mul(5).add(1.7)),Ve=Y(T.mul(16).sub(4.2)),He=u.mul(I(.78,.84,.98)).mul(k(1).add(J.mul(.16)).add(Ve.mul(.06))),We=k(.5).add(J.mul(.5)),X=u.mul(R(I(.78,.76,.8),I(1.05,1.3,1.2),We)).mul(k(1).add(Ve.mul(.06))),Z=u.mul(k(1).add(Ve.mul(.04))).mul(R(1,.86,v));Z=R(Z,He,g),Z=R(Z,X,_);let Ge=D(L(g.add(v.mul(.5)),_),L(Re.b.sub(.62),ze.b.sub(.55)));Z=Z.mul(k(1).add(Ne.w.mul(Ge)));let Q=e.aoMap?S(e.aoMap,n).r:k(1);Z=Z.mul(R(1,Q.mul(Q),.5)),t.colorNode=R(Me,Z,q.fabricOn);let Ke=k(e.roughness??1).mul(e.roughnessMap?S(e.roughnessMap,n).g:1),qe=k(e.metalness??0).mul(e.metalnessMap?S(e.metalnessMap,n).b:1),Je=R(N(Ke),q.rough,E(N(0),q.rough)),Ye=R(N(qe),q.metal,E(N(0),q.metal)),$=B,Xe=D($,N(1)).max(.001),Ze=D(Je,$).div(Xe),Qe=D(N(k(.58).add(k(1).sub(Re.b).mul(.12)).add(J.mul(.03)),k(.64).add(k(1).sub(ze.b).mul(.1)).add(J.mul(.03)),k(.42).add(k(1).sub(Re.b).mul(.06)),k(.4)),$).div(Xe);t.roughnessNode=R(R(Ke,Ze,q.enabled),Qe,q.fabricOn);let $e=D(Ye,$).div(Xe);t.metalnessNode=R(qe,$e,q.enabled);let et=e.emissiveMap?S(e.emissiveMap,n).rgb.mul(ue(e.emissive||16777215)).mul(e.emissiveIntensity??1):ue(e.emissive||0).mul(e.emissiveIntensity??1),tt=q.emissiveRed.mul(g).add(q.emissiveBlue.mul(_)).add(q.emissiveWhite.mul(v)).add(q.emissiveBlack.mul(y)),nt=R(et,et.add(tt),q.enabled);t.emissiveNode=nt;let rt=e.normalMap?S(e.normalMap,n).rgb:I(.5,.5,1),it=Re.xy.mul(2).sub(1),at=ze.xy.mul(2).sub(1),ot=L(it.y.negate(),it.x).mul(g.add(v.mul(.45))).add(at.mul(_)),st=L(ae(T.y.mul(23).add(T.z.mul(17))).mul(K),te(T.x.mul(19).sub(T.y.mul(13))).mul(K)).mul(q.symBump.mul(.035)),ct=rt.xy.mul(2).sub(1).add(ot.mul(Ne.z).mul(Be).mul(q.fabricOn)).add(st.mul(q.symbiote)),lt=I(ct.mul(.5).add(.5),rt.z),ut=e.normalScale||new h(1,1);q.normalScale.value.copy(ut),t.normalNode=x(lt,q.normalScale);let dt=j(_e.value).onRenderUpdate((e,t)=>{t.value=_e.value}),ft=j(z.lo.value).onRenderUpdate((e,t)=>{t.value.copy(z.lo.value)}),pt=j(z.hi.value).onRenderUpdate((e,t)=>{t.value.copy(z.hi.value)}),mt=C(O),ht=R(ft,pt,mt.y.mul(.5).add(.5)).mul(k(.75).add(k(1).sub(mt.y.abs()).mul(.25)));return t.aoNode=(e.aoMap?R(1,S(e.aoMap,n).r,e.aoMapIntensity??1):k(1)).mul(R(k(1),k(.35),dt)),t.emissiveNode=nt.add(ht.mul(dt).mul(.1)),t.userData.suitNodeNight=dt,t}var X=me(()=>Ne),Z={uFabOn:{value:0},uFabHex:{value:null},uFabKnit:{value:null},uFabP:{value:new f(4096,147,.85,.18)},uFabNightK:_e,uCityAmbLo:z.lo,uCityAmbHi:z.hi},Ge=!0,Q=0,Ke,qe=typeof location<`u`&&new URLSearchParams(location.search).get(`fabric`)===`0`;new Promise(e=>{Ke=e});var Je=()=>{Z.uFabOn.value=Ge&&!qe&&Q===2?1:0,ze(!!Z.uFabOn.value,Z.uFabHex.value,Z.uFabKnit.value),Q===2&&Ke()};function Ye(e){Ge=!!e,Je()}function $(e,t){ge(e).then(e=>{e.colorSpace=``,e.wrapS=e.wrapT=l,e.anisotropy=8,e.generateMipmaps=!1,e.minFilter=i,Z[t].value=e,Q++,Je()}).catch(t=>console.warn(`[suitfabric] detail texture failed`,e,t))}function Xe(e){if(he()){!Z.uFabHex.value&&Q===0&&($(B(`player/suit_weave_hex.ktx2`),`uFabHex`),$(B(`player/suit_weave_knit.ktx2`),`uFabKnit`));let t=null;return e.traverse(e=>{if(!e.isMesh)return;let n=Array.isArray(e.material)?e.material:[e.material],r=!1,i=n.map(e=>{if(e?.name!==`SpiderSuit`)return e;let n=We(e);return t||=n,r||=n!==e,n});r&&(e.material=Array.isArray(e.material)?i:i[0])}),ze(Ge&&!qe&&Q===2,Z.uFabHex.value,Z.uFabKnit.value),t}let t=null;return e.traverse(e=>{if(e.isMesh)for(let n of[].concat(e.material))n?.name===`SpiderSuit`&&(t=n)}),!t||t.userData.__patches?.has(`suitFabric`)||(!Z.uFabHex.value&&Q===0&&($(B(`player/suit_weave_hex.ktx2`),`uFabHex`),$(B(`player/suit_weave_knit.ktx2`),`uFabKnit`)),V(t,`suitFabric`,e=>{Object.assign(e.uniforms,Z),e.vertexShader=e.vertexShader.replace(`#include <common>`,X.vertexCommon).replace(`#include <begin_vertex>`,X.vertexBeginVertex),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,X.fragmentCommon).replace(`#include <map_fragment>`,X.fragmentMap).replace(`#include <roughnessmap_fragment>`,X.fragmentRoughness).replace(`#include <lights_fragment_maps>`,X.fragmentLightsMaps).replace(`#include <normal_fragment_maps>`,X.fragmentNormalMaps)}),Je()),t}export{Le as a,ke as c,Oe as d,Be as i,Me as l,Ye as n,Re as o,We as r,Ie as s,Xe as t,H as u};
//# sourceMappingURL=player~index~screenshotPresets~gameSystems-D6qOmiYD.js.map