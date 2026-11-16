import{A as e,Fr as t,Ha as n,Hn as r,Ir as i,L as a,Ln as o,Lt as s,Mn as c,O as l,Qi as u,Rn as d,U as f,Va as p,Wi as m,Z as h,ar as g,bn as _,ft as v,io as y,ir as b,j as x,ja as S,mr as C,no as w,or as T,pa as E,qt as D,ro as O,sn as k,yn as A}from"./three~index~combat~tslPipeline~screenshotPresets~gameSystems~GLTFLoader-B3xvqeNo.js";import{Ai as j,Ar as ee,Bi as M,Ci as N,Ct as te,Fn as ne,Fr as re,Gr as ie,Gt as ae,Ht as P,Ii as oe,Jr as F,Kr as se,Lt as I,Nr as ce,Pi as L,U as R,Vt as z,Wt as B,Yr as le,Zi as ue,_r as de,ca as fe,ea as pe,hi as me,ia as V,jr as he,ki as H,lt as ge,mr as _e,nt as ve,pt as ye,ra as U,ta as be,vr as W,wt as xe,yr as Se,yt as Ce,zt as we}from"./three~index~combat~tslPipeline~screenshotPresets~gameSystems-DsPuCJ23.js";import{r as Te,t as Ee}from"./three~index~combat~tslPipeline~screenshotPresets~gameSystems-B-te4akP.js";import{n as De,o as Oe,s as ke}from"./world~index~tslPipeline~screenshotPresets~gameSystems-ZgHieP-C.js";import{f as Ae,i as je,o as Me,r as Ne,s as Pe}from"./world~index~combat~screenshotPresets~gameSystems-BOTEtzPM.js";import{i as Fe,o as Ie}from"./vehicleLighting-Cqq_fzGi.js";import{B as Le,Ct as Re,Et as ze,L as Be,Tt as Ve,bt as He,ct as Ue,m as We,o as Ge,st as Ke,ut as qe,v as G,z as Je}from"./world~index~gameSystems-B0Rxo-lT.js";import{A as Ye,D as K,k as q}from"./world~index~gameSystems-DcHiywcw.js";import{t as Xe}from"./performanceFlags-Cybz3NnI.js";import{a as Ze,b as Qe,c as $e,d as et,h as tt,i as nt,l as rt,m as J,n as it,o as at,p as ot,r as st,s as ct}from"./world~index-VxIJrCoE.js";import{a as lt,c as ut,d as dt,i as ft,l as pt,o as mt,s as ht,u as gt}from"./world~index-DXXEphGX.js";var _t=`// horizon shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
      in vec3 aWall; in vec3 aRoof; out vec3 vHC; out vec3 vHP; out float vTop; out float vLit;
// @section vertexFogVertex
#include <fog_vertex>
      vTop = normal.y > 0.5 ? 1.0 : 0.0; vHC = vTop > 0.5 ? aRoof : aWall;
      vHP = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
      { vec3 io = instanceMatrix[3].xyz; float lh = fract(sin(dot(io.xz, vec2(12.9898, 78.233))) * 43758.5453); // (night) per-building lit share
        vLit = lh < 0.35 ? 0.0 : (lh < 0.93 ? (lh - 0.35) * 0.35 : 0.6 + (lh - 0.93) * 4.0); }
// @section fragmentCommon
#include <common>
      in vec3 vHC; in vec3 vHP; in float vTop; in float vLit; uniform float uNightK;
// @section fragmentEmissive
#include <emissivemap_fragment>
      if (uNightK > 0.0 && vTop < 0.5) totalEmissiveRadiance += vec3(1.0, 0.7, 0.42) * vLit * 0.06 * smoothstep(3.0, 9.0, vHP.y) * uNightK;
// @section fragmentMap
{
        vec3 c = vHC;
        if (vTop < 0.5) {
          // floor bands + bays, averaged out once they get sub-pixel
          float fl = fract(vHP.y / 3.4), u = fract((vHP.x + vHP.z) / 2.6);
          float w = step(0.35, fl) * step(fl, 0.85) * step(0.3, u) * step(u, 0.75);
          vec2 fw = fwidth(vec2(vHP.y / 3.4, (vHP.x + vHP.z) / 2.6));
          w = mix(w, 0.3, clamp(max(fw.x, fw.y) * 1.5, 0.0, 1.0));
          c = mix(c, vec3(0.08, 0.09, 0.1), w * 0.85);
          c *= 0.65 + 0.35 * smoothstep(0.0, 12.0, vHP.y); // grimy base / contact darkening
        }
        diffuseColor.rgb = c * (1.0 - 0.85 * uNightK); // (night) dark masses
      }
`;function vt(){let e=new Te({color:16777215,roughness:.9,metalness:0});e.name=`DistantHinterland.TSL`;let t=ue(Fe.value).onRenderUpdate((e,t)=>{t.value=Fe.value}),n=be(ve(`normal`,`vec3`).y).setInterpolation(_.FLAT,A.EITHER),r=be(ve(`aWall`,`vec3`),`vHorizonWallNode`),i=be(ve(`aRoof`,`vec3`),`vHorizonRoofNode`),a=be(ve(`aLit`,`float`),`vHorizonLitNode`),o=F,s=N(n.greaterThan(.5),i,r),c=B(o.y.div(3.4)),l=B(o.x.add(o.z).div(2.6)),u=N(c.greaterThan(.35).and(c.lessThan(.85)).and(l.greaterThan(.3)).and(l.lessThan(.75)),1,0),d=_e(c.fwidth(),l.fwidth());return u=W(u,.3,d.mul(1.5).clamp(0,1)),s=N(n.greaterThan(.5),s,s.mul(z(1).sub(u.mul(.85))).mul(z(.65).add(j(0,12,o.y).mul(.35)))),e.colorNode=s.mul(z(1).sub(t.mul(.85))),e.emissiveNode=N(n.greaterThan(.5),V(0),V(1,.7,.42).mul(a).mul(.06).mul(j(3,9,o.y)).mul(t)),e}var yt=`// boats shader sections. Use parseShaderSections() to select an injection chunk.
// @section fragmentCommon
#include <common>
uniform float uNightK;
// @section fragmentColor
#include <color_fragment>
diffuseColor.rgb *= mix(1.0, 0.025, uNightK);
`;function bt(e){let t=new Ee({map:e,transparent:!0,depthWrite:!1,opacity:.8,color:12765642,side:2});t.name=`BoatWake.TSL`;let n=ue(Fe.value);n.onRenderUpdate(()=>{n.value=Fe.value});let r=M(e,pe());return t.colorNode=r.rgb.mul(Ce(12765642)).mul(W(1,.025,n)),t.opacityNode=r.a.mul(.8),t}var xt=(e,t)=>e.gH+Math.max(1,Math.round((t-e.gH)/e.floorH))*e.floorH,St=(e,t,n=t,r=t,i=t)=>({x0:e.x0+t,x1:e.x1-n,z0:e.z0+r,z1:e.z1-i}),Ct={nx:`setback`,px:`setback`,nz:`setback`,pz:`setback`},wt=(e,t,n,r=n)=>({x0:e-n,x1:e+n,z0:t-r,z1:t+r}),Tt=(e=[2.4,2.45,2.5],t=5)=>({floorH:3,bayW:1.2,winW:.5,winH:.5,layer:K.METAL,base:K.METAL,seed:t,margin:0,depth:.05,tint:e});function Et(e,t,n,r,i,a={}){return t<=.4?[{...e,y0:n,y1:r,p:i,parapet:0,sides:{...Ct},...a}]:[{x0:e.x0+t,x1:e.x1-t,z0:e.z0,z1:e.z1,y0:n,y1:r,p:i,parapet:0,sides:{...Ct},...a},{x0:e.x0,x1:e.x0+t,z0:e.z0+t,z1:e.z1-t,y0:n,y1:r,p:i,parapet:0,sides:{...Ct,px:`party`},...a},{x0:e.x1-t,x1:e.x1,z0:e.z0+t,z1:e.z1-t,y0:n,y1:r,p:i,parapet:0,sides:{...Ct,nx:`party`},...a}]}function Dt(e,t,n,r,i,a,o){if(r>=2*n-.3)return[{...wt(e,t,n),y0:i,y1:a,p:o,parapet:0,sides:{...Ct}}];let s=Math.max(1,Math.min(4,Math.round((2*n-r)/4))),c=[],l=[];for(let e=0;e<=s;e++){let t=n-e*(2*n-r)/s;c.push(t),l.push(r-t)}let u=[{x0:e-c[s],x1:e+c[s],z0:t-l[s],z1:t+l[s],y0:i,y1:a,p:o,parapet:0,sides:{...Ct}}];for(let n=0;n<s;n++)u.push({x0:e+c[n+1],x1:e+c[n],z0:t-l[n],z1:t+l[n],y0:i,y1:a,p:o,parapet:0,sides:{...Ct,nx:`party`}}),u.push({x0:e-c[n],x1:e-c[n+1],z0:t-l[n],z1:t+l[n],y0:i,y1:a,p:o,parapet:0,sides:{...Ct,px:`party`}});return u}function Ot(e,t,n,r,i,a){let o=e=>t.gH+e*t.floorH,s=[1,.7,.36],c=St(e,24.5,24.5,20,20),l=St(e,27.5,27.5,23,23);Ye(c,o(72),o(80),s,2.4,1.1),Ye(l,o(80),o(85)+1,s,2.4,1.1),Ye(wt(n,r,12,9),i,i+14.6,s,2,1.1),Ye(wt(n,r,12,9),i+1.5,i+14.6,s,.9,6,1.2,1.75),Ye(St(e,21,21,17,17),o(72)-14,o(72)+.2,s,.3,-3.5),Ye(wt(n,r,8.2),a,a+38,[1,.8,.52],.4,7,1.2,1.4),kt(c,o(72)+.4,16761466,4),kt(l,o(80)+.4,16761466,4)}function kt(e,t,n,r){let i=(e.x0+e.x1)/2,a=(e.z0+e.z1)/2;for(let[o,s,c,l]of[[i,e.z0-2.8,0,1],[i,e.z1+2.8,0,-1],[e.x0-2.8,a,1,0],[e.x1+2.8,a,-1,0]])De.add({type:`spot`,pos:[o,t,s],dir:[c*.12,1,l*.12],angle:.7,penumbra:.7,color:n,intensity:r,range:34,radius:1.2,volume:0})}function At(){let e=[];return e.push({name:`empire`,x0:146,x1:234,z0:240,z1:320,seed:3401,arch:()=>({type:`deco`,style:q.DECO,layer:K.LIME,base:K.GRANITE,floorH:3.9,bayW:1.75,winW:.72,winH:.8,gH:7,height:340,depth:.34,margin:1,tint:[.86,.85,.82],cornice:!1,waterTower:!1,lintel:0,seed:34.1,shape:(e,t,n)=>{let r=e=>t.gH+e*t.floorH,i={...n,tint:[.78,.775,.76]},a=[{...e,y0:0,y1:r(5),p:n,parapet:1.3,roof:!0},{...St(e,9,9,7,7),y0:r(5),y1:r(20),p:i,parapet:1.2,roof:!0,sides:{...Ct}},{...St(e,15,15,12,12),y0:r(20),y1:r(29),p:n,parapet:1.2,roof:!0,sides:{...Ct}},...Et(St(e,21,21,17,17),5.5,r(29),r(72),n,{roof:!0}).map((e,t)=>t?{...e,p:i}:e),...Et(St(e,24.5,24.5,20,20),4,r(72),r(80),n,{roof:!0}),...Et(St(e,27.5,27.5,23,23),3,r(80),r(85),n)],o=St(e,21,21,17,17),s=(e.x0+e.x1)/2,c=(e.z0+e.z1)/2,l=7.5,u=1.4;return a.push({x0:s-l,x1:s+l,z0:o.z0-u,z1:o.z0,y0:r(29),y1:r(72)-2*t.floorH,p:n,parapet:0,roof:!1,sides:{...Ct,pz:`party`}}),a.push({x0:s-l,x1:s+l,z0:o.z1,z1:o.z1+u,y0:r(29),y1:r(72)-2*t.floorH,p:n,parapet:0,roof:!1,sides:{...Ct,nz:`party`}}),a.push({x0:o.x0-u,x1:o.x0,z0:c-l,z1:c+l,y0:r(29),y1:r(72)-2*t.floorH,p:n,parapet:0,roof:!1,sides:{...Ct,px:`party`}}),a.push({x0:o.x1,x1:o.x1+u,z0:c-l,z1:c+l,y0:r(29),y1:r(72)-2*t.floorH,p:n,parapet:0,roof:!1,sides:{...Ct,nx:`party`}}),a}}),extra(e,t,{S:n,Z:r,tile:i}){let a=t.masses.reduce((e,t)=>t.y1>e.y1?t:e,t.masses[0]),o=(e.x0+e.x1)/2,s=(e.z0+e.z1)/2,c=a.y1;for(let e of t.masses){if(e.y0<.1)continue;let a=e.sides||{},o=e.p,s=e.y1+(e.parapet||0)-.12,c={...o,style:q.BLANK,tint:o.tint.map(e=>e*1.06)};for(let l of[`nz`,`pz`,`nx`,`px`]){if(a[l]===`party`)continue;let u=l===`nz`||l===`pz`,d=u?e.x1-e.x0:e.z1-e.z0,f=u?e.x0:e.z0,p=d-2*o.margin,m=Math.max(1,Math.floor(p/o.bayW+.5)),h=p/m;for(let a=0;a<=m;a++){let u=a%4==0,d=f+o.margin+a*h,p=a===0||a===m||u?.4:.24,g=u?.55:.3,_;_=l===`nz`?[d-p,e.z0-g,d+p,e.z0]:l===`pz`?[d-p,e.z1,d+p,e.z1+g]:l===`nx`?[e.x0-g,d-p,e.x0,d+p]:[e.x1,d-p,e.x1+g,d+p];let v=(_[0]+_[2])/2,y=(_[1]+_[3])/2;t.masses.some(t=>t!==e&&t.y1>e.y0+1&&t.y0<s-1&&v>t.x0-.05&&v<t.x1+.05&&y>t.z0-.05&&y<t.z1+.05)||J(i,n,r,_[0],e.y0+.2,_[1],_[2],s,_[3],c,{zip:!1,lod:!1})}}}{let e={nz:null,pz:null,nx:null,px:null},r=t.A;for(let a of t.masses){if(a.y0<.1||a.x1-a.x0<2.5||a.z1-a.z0<2.5)continue;let t=a.sides||{},o=a.parapet||0,s=a.y1+o,c=.7,l=.5,u=o<.1,d=e=>t[e]===`party`?0:c,f={...a.p,style:q.BLANK,tint:[.97,.95,.9],topY:a.y1,baseY:a.y1-l},p=u?a.y1-l:s-1.4;for(let o of[`nz`,`pz`,`nx`,`px`]){if(t[o]===`party`)continue;if(u){let e;e=o===`nz`?[a.x0-d(`nx`),a.z0-c,a.x1+d(`px`),a.z0]:o===`pz`?[a.x0-d(`nx`),a.z1,a.x1+d(`px`),a.z1+c]:o===`nx`?[a.x0-c,a.z0,a.x0,a.z1]:[a.x1,a.z0,a.x1+c,a.z1];let t=o===`nx`||o===`px`?{nz:null,pz:null}:{};i.fac.box(e[0],a.y1-l,e[1],e[2],a.y1,e[3],f,t,!0,!0),i.lod.box(e[0],a.y1-l,e[1],e[2],a.y1,e[3],f,t,!0,!1),n.box(e[0],a.y1-l,e[1],e[2],a.y1,e[3],`ledge`)}let m=.012,h=(e,t,n)=>({...a.p,topY:s,tint:a.p.tint.map(t=>t*e)}),g=(t,n,s)=>{if(n-t<.3)return;let c;c=o===`nz`?[a.x0,a.z0-m,a.x1,a.z0]:o===`pz`?[a.x0,a.z1,a.x1,a.z1+m]:o===`nx`?[a.x0-m,a.z0,a.x0,a.z1]:[a.x1,a.z0,a.x1+m,a.z1],i.fac.box(c[0],t,c[1],c[2],n,c[3],h(s),{...e,[o]:{style:a.p.style??r.style,gH:-r.gH}},!1,!1)};g(p-2.2,p,.8),g(a.y0,Math.min(a.y0+3,p-2.2),.7)}}}let l={floorH:3.9,bayW:1.75,winW:.44,winH:.66,layer:K.LIME,base:K.LIME,seed:12,margin:.8,depth:.3,tint:[.9,.88,.83]},u=Tt([2.5,2.52,2.55],7);for(let e of t.masses)if(!(Math.abs(e.y0-287.8)>.1||e.x1-e.x0<20)){for(let[t,a]of[[e.x0-2.2,e.z0-2.2],[e.x1,e.z0-2.2],[e.x0-2.2,e.z1],[e.x1,e.z1]])J(i,n,r,t,e.y0,a,t+2.2,e.y0+7.8,a+2.2,l,{style:q.BLANK,zip:!1});break}J(i,n,r,o-12,c,s-9,o+12,c+7.8,s+9,l,{style:q.DECO}),J(i,n,r,o-12,c+7.8,s-9,o+12,c+9,s-8.6,l,{zip:!1}),J(i,n,r,o-12,c+7.8,s+8.6,o+12,c+9,s+9,l,{zip:!1}),J(i,n,r,o-12,c+7.8,s-8.6,o-11.6,c+9,s+8.6,l,{zip:!1}),J(i,n,r,o+11.6,c+7.8,s-8.6,o+12,c+9,s+8.6,l,{zip:!1}),J(i,n,r,o-8,c+7.8,s-8,o+8,c+14.5,s+8,l,{style:q.DECO});let d=c+14.5;tt(i,n,r,o,s,6.2,d,d+4,l,{n:12,zipTop:!1}),tt(i,n,r,o,s,5.2,d+4,d+34,u,{n:12,style:q.DECO,zipTop:!1});let f={...l,tint:[.95,.93,.88]};for(let[e,t,a,c,l]of[[5,7.8,-.7,.7,26],[-7.8,-5,-.7,.7,26],[4.4,7,-2.4,-1.4,20],[4.4,7,1.4,2.4,20],[-7,-4.4,-2.4,-1.4,20],[-7,-4.4,1.4,2.4,20]])J(i,n,r,o+e,d+4,s+a,o+t,d+4+l,s+c,f,{zip:!1}),J(i,n,r,o+a,d+4,s+e,o+c,d+4+l,s+t,f,{zip:!1});tt(i,n,r,o,s,4.2,d+34,d+38,l,{n:12,zipTop:!1}),tt(i,n,r,o,s,3.6,d+38,d+44,u,{n:12,style:q.CURTAIN,zipTop:!1}),tt(i,n,r,o,s,3.6,d+44,d+49,Tt([2,2.02,2.05]),{n:12,r1:1.3,zipTop:!1}),tt(i,n,r,o,s,1.1,d+49,d+60,Tt([1.8,1.8,1.85]),{n:8,r1:.8,zipTop:!1}),tt(i,n,r,o,s,.7,d+60,d+106,Tt([1.6,1.6,1.65]),{n:6,r1:.18}),Ot(e,t.A,o,s,c,d)}}),e.push({name:`chrysler`,x0:484,x1:540,z0:-160,z1:-80,seed:4202,arch:()=>({type:`deco`,style:q.DECO,layer:K.WHITE,base:K.GRANITE,floorH:3.8,bayW:1.6,winW:.5,winH:.62,gH:6.5,height:240,depth:.3,margin:.8,tint:[.9,.89,.87],cornice:!1,waterTower:!1,seed:42.2,shape:(e,t,n)=>{let r=e=>t.gH+e*t.floorH,i=(e.x0+e.x1)/2,a=(e.z0+e.z1)/2;return[{...e,y0:0,y1:r(4),p:n,parapet:1.1,roof:!0},{...St(e,4,4,6,6),y0:r(4),y1:r(16),p:n,parapet:1.1,roof:!0,sides:{...Ct}},{...St(e,8,8,10,10),y0:r(16),y1:r(24),p:n,parapet:1.1,roof:!0,sides:{...Ct}},...Et(wt(i,a,15),2.5,r(24),r(58),n,{roof:!0}),...Et(wt(i,a,13),2,r(58),r(61),n)]}}),extra(e,t,{S:n,Z:r,tile:i}){let a=(e.x0+e.x1)/2,o=(e.z0+e.z1)/2,s=t.H,c=12.5,l={...Tt([3.3,3.32,3.35],9)};for(let e=0;e<7;e++)J(i,n,r,a-c,s,o-c,a+c,s+6.2,o+c,l,{style:q.ARCH,zip:e===0}),s+=6.2,c-=1.5;tt(i,n,r,a,o,2.2,s,s+42,l,{n:8,r1:.1}),Ye(wt(a,o,12.5),t.H,s+42,[.86,.92,1],.55,16),kt(wt(a,o,12.5),t.H+.4,14477567,10)}}),e.push({name:`park432`,x0:372,x1:404,z0:-620,z1:-586,seed:5701,arch:()=>({type:`postwar`,style:q.PUNCHED,layer:K.WHITE,base:K.CONCRETE,floorH:4.7,bayW:3.6,winW:.7,winH:.66,gH:9,height:425,margin:0,depth:.45,tint:[1.05,1.05,1.03],cornice:!1,waterTower:!1,lintel:0,resid:1,glass:2,seed:57.01,shape:(e,t,n)=>[{...wt((e.x0+e.x1)/2,(e.z0+e.z1)/2,14.5),y0:0,y1:xt(t,425),p:n,parapet:1.6,sides:{...Ct}}]}),extra(e,t,{S:n,Z:r,tile:i}){let a=t.masses[0],o=t.A,s={floorH:o.floorH,bayW:3.6,winW:.66,winH:.97,layer:K.WHITE,base:K.WHITE,seed:3,margin:0,depth:.9,tint:[1,1,.98],resid:0,glass:2};for(let e=12;e*o.floorH+o.gH<a.y1-10;e+=12){let t=o.gH+e*o.floorH;J(i,n,r,a.x0-.06,t,a.z0-.06,a.x1+.06,t+o.floorH,a.z1+.06,s,{style:q.RIBBON,zip:!1})}let c=a.y1-2*o.floorH;J(i,n,r,a.x0-.06,c,a.z0-.06,a.x1+.06,a.y1-.6,a.z1+.06,{...s,floorH:2*o.floorH-.6,winH:.92},{style:q.RIBBON,zip:!1})}}),e.push({name:`cptower`,x0:136,x1:174,z0:-552,z1:-514,seed:5702,arch:()=>({type:`glass`,style:q.CURTAIN,layer:K.METAL,base:K.GRANITE,floorH:4.3,bayW:1.5,winW:.97,winH:.8,gH:9,height:440,margin:0,depth:.04,tint:[1,1,1],glass:4,seed:1,shape:(e,t,n)=>{let r={...n,style:q.PUNCHED,layer:K.LIME,winW:.62,winH:.66,depth:.3,margin:1,tint:[1,.98,.95]},i=xt(t,30),a=xt(t,300),o=xt(t,370),s=xt(t,425);return[{...e,y0:0,y1:i,p:r,parapet:1,roof:!0},...Et(St(e,3),4,i,a,n,{roof:!0}),...Et(St(e,3,10,3,3),3,a,o,n,{roof:!0}),...Et(St(e,3,10,10,3),3,o,s,n)]}}),extra(e,t,{S:n,Z:r,tile:i}){let a=t.H,o=t.masses.filter(e=>Math.abs(e.y1-a)<.1),s={x0:Math.min(...o.map(e=>e.x0)),x1:Math.max(...o.map(e=>e.x1)),z0:Math.min(...o.map(e=>e.z0)),z1:Math.max(...o.map(e=>e.z1))},c=t.A,l={floorH:c.floorH,bayW:c.bayW,winW:c.winW,winH:c.winH,layer:K.METAL,base:K.METAL,seed:1,margin:0,depth:.04,tint:[1,1,1],glass:4},u=s,d=a;for(let e=0;e<2;e++)u=St(u,2.2),J(i,n,r,u.x0,d,u.z0,u.x1,d+2*c.floorH,u.z1,l,{style:q.CURTAIN,zip:e===1}),d+=2*c.floorH;u=St(u,2.2),J(i,n,r,u.x0,d,u.z0,u.x1,d+2*c.floorH,u.z1,l,{style:q.CURTAIN,zip:!1}),d+=2*c.floorH;let f={floorH:.4,bayW:1.2,winW:1,winH:.2,layer:K.CONCRETE,base:K.CONCRETE,seed:13,margin:0,depth:.05,tint:[1.08,1.08,1.1],glass:2};J(i,n,r,u.x0-.3,d,u.z0-.3,u.x1+.3,d+9,u.z1+.3,f,{style:q.RIBBON,zip:!1}),J(i,n,r,u.x0-.8,d+9,u.z0-.8,u.x1+.8,d+10.2,u.z1+.8,Tt([2.6,2.62,2.66],9));let p=St(u,2.5),m=(u.x0+u.x1)/2,h=(u.z0+u.z1)/2,g=d+10.2;p.x1-p.x0>4&&p.z1-p.z0>4&&(J(i,n,r,p.x0,g,p.z0,p.x1,g+4.5,p.z1,{...f,tint:[.92,.93,.95]},{style:q.RIBBON}),g+=4.5),tt(i,n,r,m,h,1.6,g,g+3.5,Tt([2.3,2.3,2.35]),{n:8,zipTop:!1}),tt(i,n,r,m,h,.9,g+3.5,g+11.5,Tt([2.5,2.5,2.55]),{n:8,r1:.7,zipTop:!1}),tt(i,n,r,m,h,1.3,g+7.5,g+7.9,Tt([2.6,2.6,2.65]),{n:8,zipTop:!1}),tt(i,n,r,m,h,.45,g+11.5,g+19.5,Tt([2.6,2.6,2.65]),{n:6,r1:.12})}}),e.push({name:`one57`,x0:40,x1:80,z0:-552,z1:-512,seed:5703,arch:()=>({type:`glass`,style:q.CURTAIN,layer:K.METAL,base:K.GRANITE,floorH:4,bayW:1.5,winW:.97,winH:.72,gH:8,height:306,margin:0,depth:.04,tint:[.95,.98,1.02],glass:1,seed:2,shape:(e,t,n)=>{let r=St(e,2),i=[{...e,y0:0,y1:xt(t,24),p:{...n,style:q.PUNCHED,layer:K.GRANITE,winW:.62,winH:.66,depth:.3,margin:1},parapet:1,roof:!0}],a=xt(t,24);return[200,226,250,270,290,306].forEach((e,o)=>{let s=xt(t,e);i.push({...r,x0:r.x0+o*5.5,y0:a,y1:s,p:n,parapet:0,roof:!0,sides:{...Ct}}),a=s}),i}})}),e.push({name:`wtc1`,x0:-168,x1:-110,z0:2731,z1:2789,seed:1776,arch:()=>({type:`glass`,style:q.CURTAIN,layer:K.METAL,base:K.GRANITE,floorH:4.2,bayW:1.5,winW:.97,winH:.84,gH:12,height:430,margin:0,depth:.04,tint:[.97,1,1.05],glass:4,seed:3,shape:(e,t,n)=>{let r=(e.x0+e.x1)/2,i=(e.z0+e.z1)/2,a=Math.min(e.x1-e.x0,e.z1-e.z0)/2,o=xt(t,57),s={...n,style:q.RIBBON,layer:K.METAL,winW:.22,winH:.94,tint:[1.55,1.57,1.6]},c=[{...wt(r,i,a),y0:0,y1:o,p:s,parapet:0,roof:!1,sides:{...Ct}}],l=a*1.03,u=o;for(let e=0;e<14;e++){let s=xt(t,o+(430-o)*(e+1)/14);if(s<=u)continue;let d=(e+.5)/14;c.push(...Dt(r,i,a,2*a+(l-2*a)*d,u,s,n)),u=s}return c}}),extra(e,t,{S:n,Z:r,tile:i}){let a=(e.x0+e.x1)/2,o=(e.z0+e.z1)/2,s=t.H;tt(i,n,r,a,o,9,s,s+4.5,Tt([1.8,1.85,1.9]),{n:16,style:q.RIBBON,zipTop:!1}),tt(i,n,r,a,o,3.2,s+4.5,s+9,Tt([2,2,2.05]),{n:12,zipTop:!1}),tt(i,n,r,a,o,2.1,s+9,s+140,Tt([2.7,2.72,2.75]),{n:8,r1:.35}),Ye(wt(a,o,9.5),s,s+140,[.88,.93,1],.7,45)}}),e.push({name:`bluehq`,x0:-234,x1:-176,z0:-71,z1:-9,seed:811,arch:()=>({type:`glass`,style:q.CURTAIN,layer:K.METAL,base:K.GRANITE,floorH:4,bayW:1.5,winW:.97,winH:.7,gH:8,height:300,margin:0,depth:.04,tint:[.9,.95,1.05],glass:0,seed:1.94,cornice:!1,waterTower:!1,shape:(e,t,n)=>{let r={...n,style:q.PUNCHED,layer:K.GRANITE,winW:.6,winH:.62,depth:.32,margin:1,tint:[.62,.63,.66]},i=xt(t,30),a=xt(t,252),o=xt(t,284),s=xt(t,300);return[{...e,y0:0,y1:i,p:r,parapet:1.2,roof:!0},...Et(St(e,5,5,6,6),5,i,a,n,{roof:!0}),...Et(St(e,5,15,6,6),4,a,o,n,{roof:!0}),{...St(e,9,19,10,10),y0:o,y1:s,p:n,parapet:0,sides:{...Ct},spireR:6}]}}),extra(e,t,{S:n,Z:r,tile:i}){t.A;let a=Tt([2.9,2.2,.85],21),o=St(e,5,5,6,6),s=t.masses[0].y1,c=t.masses.find(e=>e.y0===s&&e.x0===o.x0+5),l=t.masses.find(e=>Math.abs(e.y0-c.y1)<.01),u=(l?l.y1:c.y1)+2,d=.45,f=1.3;for(let e of[1/3,2/3]){let t=c.x0+(c.x1-c.x0)*e;J(i,n,r,t-f,s,c.z0-d,t+f,u,c.z0,a,{zip:!1}),J(i,n,r,t-f,s,c.z1,t+f,u,c.z1+d,a,{zip:!1})}let p=(o.z0+o.z1)/2;J(i,n,r,o.x0-d,s,p-f,o.x0,u,p+f,a,{zip:!1});let m=t.masses.find(e=>e.y0===s&&e.x0===o.x1-5);J(i,n,r,o.x1,s,p-f,o.x1+d,m.y1+3,p+f,a,{zip:!1});let h=t.masses[t.masses.length-1],g=h.y1,_={floorH:.42,bayW:1.2,winW:1,winH:.3,layer:K.METAL,base:K.METAL,seed:7,margin:0,depth:.05,tint:[2.3,2.34,2.4],glass:2};J(i,n,r,h.x0-.4,g,h.z0-.4,h.x1+.4,g+7,h.z1+.4,_,{style:q.RIBBON,zip:!1}),J(i,n,r,h.x0-.7,g+7,h.z0-.7,h.x1+.7,g+8,h.z1+.7,Tt([2.6,2.62,2.65],9));let v=(h.x0+h.x1)/2,y=(h.z0+h.z1)/2,b=g+8;tt(i,n,r,v,y,3.2,b,b+5,Tt([2.2,2.22,2.25]),{n:12,zipTop:!1}),tt(i,n,r,v,y,1.5,b+5,b+30,Tt([2.4,2.4,2.45]),{n:8,r1:.9,zipTop:!1});for(let e of[.3,.65])tt(i,n,r,v,y,2.2-e,b+5+25*e,b+5.6+25*e,Tt([2.6,2.6,2.65]),{n:8,zipTop:!1});tt(i,n,r,v,y,.9,b+30,b+46,Tt([2.7,2.7,2.75]),{n:6,r1:.15}),Ye({x0:h.x0-1,z0:h.z0-1,x1:h.x1+1,z1:h.z1+1},g-3,b+46,[.85,.92,1],.6,14);for(let[e,t]of[[-1,-1],[1,-1],[-1,1],[1,1]])J(i,n,r,v+e*4.2-.3,b,y+t*4.2-.3,v+e*4.2+.3,b+9,y+t*4.2+.3,Tt([2.2,2.2,2.25]),{zip:!1})}}),e.push({name:`vanderbilt`,x0:336,x1:384,z0:-151,z1:-89,seed:4203,arch:()=>({type:`glass`,style:q.CURTAIN,layer:K.METAL,base:K.LIME,floorH:4.1,bayW:1.6,winW:.97,winH:.74,gH:10,height:330,margin:0,depth:.04,tint:[1,1,1.02],glass:4,seed:1.05,cornice:!1,waterTower:!1,shape:(e,t,n)=>{let r={...n,style:q.PUNCHED,layer:K.LIME,winW:.66,winH:.7,depth:.32,margin:1,tint:[.97,.95,.9]},i=(e.x0+e.x1)/2,a=(e.z0+e.z1)/2,o=[{...e,y0:0,y1:xt(t,26),p:r,parapet:1.1,roof:!0}],s=[[112,20,26,3],[178,18.5,24,5],[238,17,22,7],[288,15,19,8.5],[330,12.5,15.5,9]],c=xt(t,26);for(let[e,r,l,u]of s){let s=xt(t,e),d=Dt(i,a,r,2*r-u,c,s,n),f=l/r;for(let t of d)o.push({...t,z0:a+(t.z0-a)*f,z1:a+(t.z1-a)*f,roof:!0,...e===330?{spireR:12}:{}});c=s}return o}}),extra(e,t,{S:n,Z:r,tile:i}){let a=(e.x0+e.x1)/2,o=(e.z0+e.z1)/2,s=t.H,c=t.A,l={floorH:c.floorH,bayW:1.6,winW:.97,winH:.74,layer:K.METAL,base:K.METAL,seed:1.05,margin:0,depth:.04,tint:[1,1,1.02],glass:4};J(i,n,r,a-8,s,o-10,a+8,s+3*c.floorH,o+10,l,{style:q.CURTAIN});let u=s+3*c.floorH;J(i,n,r,a-8.4,u,o-10.4,a+8.4,u+1.2,o+10.4,Tt([2.6,2.62,2.65],9),{zip:!1}),J(i,n,r,a-5,u+1.2,o-6,a+5,u+7,o+6,l,{style:q.CURTAIN}),tt(i,n,r,a,o,1.8,u+7,u+12,Tt([2.4,2.42,2.45]),{n:8,zipTop:!1}),tt(i,n,r,a,o,1.1,u+12,u+40,Tt([2.7,2.72,2.75]),{n:8,r1:.2}),Ye({x0:a-9,z0:o-11,x1:a+9,z1:o+11},s,u+40,[.9,.94,1],.5,18)}}),e}var jt=`// grandcentral shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
in float aPart;
out float vGP;
out vec3 vGW;
out vec3 vGN;
// @section vertexFogVertex
#include <fog_vertex>
vGP = aPart;
vGW = (modelMatrix * vec4(transformed, 1.0)).xyz;
vGN = normalize(mat3(modelMatrix) * objectNormal);
// @section fragmentCommon
#include <common>
uniform sampler2D tGN;
in float vGP;
in vec3 vGW;
in vec3 vGN;
uniform highp sampler2DArray tGWC;
uniform highp sampler2DArray tGWH; // (textures r5)
float gh(vec2 p) {
return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
float gV = 0.0;   // (street r8) verdigris amount (bronze part 8)
float gH = 0.0;   // (street r2) carved height (m, <= 0 in joints) -> bump-mapped normal
vec3 gcPerturb(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDir) {
vec3 vSigmaX = normalize(dFdx(surf_pos)), vSigmaY = normalize(dFdy(surf_pos)), vN = surf_norm;
vec3 R1 = cross(vSigmaY, vN), R2 = cross(vN, vSigmaX);
float fDet = dot(vSigmaX, R1) * faceDir;
vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);
return normalize(abs(fDet) * surf_norm - vGrad);
}
// @section fragmentMap
#include <map_fragment>
{
vec3 an = abs(vGN);
vec2 q = an.x > an.z ? vGW.zy : vGW.xy;
if(an.y > 0.7) q = vGW.xz;
vec3 nz = texture(tGN, q / 13.0).rgb, nz2 = texture(tGN, q / 2.7 + 0.31).rgb;
int part = int(vGP + 0.5);
vec3 c = diffuseColor.rgb;
if(part == 0) {
// limestone ashlar: 0.75 m courses, 1.5 m blocks, thin joints; per-block tone; grime washing down
float cy = q.y / 0.62, row = floor(cy), cx = q.x / 1.25 + 0.5 * mod(row, 2.0);
vec2 f = vec2(fract(cx), fract(cy));
vec2 fw = fwidth(vec2(cx, cy)) * 1.5 + 1e-4;
float joint = max(1.0 - smoothstep(0.0, 0.025 + fw.x, min(f.x, 1.0 - f.x)), 1.0 - smoothstep(0.0, 0.035 + fw.y, min(f.y, 1.0 - f.y)));
joint *= (1.0 - smoothstep(0.15, 0.5, max(fw.x, fw.y))) * (1.0 - an.y);
float blk = gh(floor(vec2(cx, cy)));
c *= (0.94 + 0.07 * blk) * (0.86 + 0.22 * nz.r) * (0.94 + 0.08 * nz2.g);
c *= 1.0 - 0.17 * joint;
// channelled rustication on the ground storey (below the terrace string course): deep horizontal joints
float rus = (1.0 - smoothstep(8.4, 8.8, vGW.y)) * (1.0 - an.y);
float jr = 1.0 - smoothstep(0.0, 0.07 + fw.y, min(f.y, 1.0 - f.y));
c *= 1.0 - 0.22 * jr * rus;
gH = - 0.018 * joint - 0.05 * jr * rus;
// rain streaks washing down from sills / cornices
float stk = texture(tGN, vec2(q.x / 1.9, vGW.y / 34.0) + 0.17).r;
c *= 1.0 - 0.22 * smoothstep(0.45, 0.8, stk) * (1.0 - an.y); // (street r8) 0.13 -> 0.22
} else if(part == 1 || part == 3 || part == 7) {
c *= (0.88 + 0.2 * nz.r) * (0.94 + 0.08 * nz2.g);
if(part == 7) { // (street r6) fluted column shafts: 24 flutes from the normal's azimuth (bump + cavity shade)
float az = atan(vGN.z, vGN.x) * 12.0 / 3.14159265;
float fl = abs(fract(az) - 0.5) * 2.0;           // 0 at the arris, 1 mid-flute
float cav = smoothstep(0.15, 0.95, fl);
gH = - 0.06 * cav;
c *= 1.0 - 0.2 * cav * (1.0 - an.y);
}
} else if(part == 8) {
// (street r8) patinated bronze statuary: dark oily bronze, verdigris washing over up-facing surfaces, runs below
float up = clamp(vGN.y * 0.5 + 0.5, 0.0, 1.0);
float n1 = texture(tGN, vGW.xy / 0.9 + vGW.z * 0.31).g, n2 = texture(tGN, vec2(vGW.x / 0.35 + vGW.z * 0.2, vGW.y / 3.0) + 0.21).r;
gV = clamp(smoothstep(0.45, 0.95, up) * 0.75 + smoothstep(0.5, 0.78, n2) * 0.55 + (n1 - 0.5) * 0.5, 0.0, 1.0);
c = mix(c * (0.75 + 0.45 * n1), vec3(0.33, 0.45, 0.38) * (0.85 + 0.3 * n2), gV * 0.8);
} else if(part == 2) {
// weathered copper: verdigris streaks running down the slope, darker seams
float st = texture(tGN, vec2(q.x / 3.0, vGW.y / 40.0)).g;
float st2 = texture(tGN, vec2(q.x / 0.9, q.y / 14.0) + 0.5).b;
c *= (0.72 + 0.34 * st) * (0.85 + 0.25 * st2) * (0.9 + 0.15 * nz2.r);
c = mix(c, vec3(dot(c, vec3(0.33))), 0.25);   // chalky, desaturated verdigris
float sw = fwidth(q.x / 1.2) * 1.5 + 1e-4;
float seam = smoothstep(0.9 - sw, 0.9, abs(fract(q.x / 1.2) - 0.5) * 2.0) * (1.0 - smoothstep(0.1, 0.4, sw));
c *= 1.0 - 0.12 * seam;
// (street r11) critic: 'copper roof is a flat saturated mint plane'. Old weathered copper: dark brown-bronze
// base showing through in broad blotches and long rain runs down the slope, the verdigris only as a
// streaky chalky crust (paler where the water washes), soot-dark near the eaves. gV carries the crust amount
// into the roughness (crust matte, bare metal satiny).
float cb = texture(tGN, q / 9.0 + 0.37).r, cr = texture(tGN, vec2(q.x / 1.6, vGW.y / 22.0) + 0.61).g;
float crust = clamp(smoothstep(0.3, 0.72, cb) * 0.7 + smoothstep(0.35, 0.8, cr) * 0.55 - 0.1, 0.0, 1.0);
vec3 bare = vec3(0.24, 0.2, 0.15) * (0.8 + 0.4 * st2);
vec3 verd = vec3(0.43, 0.52, 0.46) * (0.82 + 0.3 * st) * (0.9 + 0.2 * cr);
c = mix(bare, verd, crust) * (0.9 + 0.12 * nz2.r);
c *= 1.0 - 0.3 * (1.0 - smoothstep(0.0, 3.5, vGW.y - __SHADER_INJECT_0__));   // soot at the eaves
c *= 1.0 - 0.12 * seam;
gV = crust;
} else if(part == 6) {
c *= (0.7 + 0.5 * texture(tGN, vGW.xz / 1.3 + vGW.y * 0.3).g) * (0.8 + 0.3 * nz2.r);
} else if(part == 4) {
c *= (0.85 + 0.25 * nz.r) * (0.92 + 0.12 * nz2.b);
// (street r5) deck wear: rectangular utility patches (darker fresh tar / paler old), oil blotches, sealed joints
vec2 pc = floor(vGW.xz / vec2(3.1, 4.3));
float ph = gh(pc), ph2 = gh(pc + 7.0);
vec2 pf = fract(vGW.xz / vec2(3.1, 4.3));
float pm = step(0.84, ph) * step(0.12, pf.x) * step(pf.x, 0.88) * step(0.1, pf.y) * step(pf.y, 0.82);
c *= mix(1.0, ph2 > 0.5 ? 0.78 : 1.12, pm);
c *= 1.0 - 0.22 * smoothstep(0.62, 0.8, texture(tGN, vGW.xz / 5.3 + 0.21).b);
float jn = abs(fract(vGW.z / 9.0) - 0.5) * 2.0;
c *= 1.0 - 0.3 * smoothstep(0.975, 0.995, jn);
// (street r6) critic: 'smooth grey slab, no tyre wear / oil'. On the Park Av ramp (two lanes along z): polished
// darker wheel paths, an oil-drip stripe down each lane centre, and a dark wet gutter line at both parapets.
float lx = vGW.x - __SHADER_INJECT_1__;
if(abs(lx) < 3.7) {
float lc = abs(abs(lx) - 1.8);                       // distance from the lane centre
float wn = texture(tGN, vec2(lx * 0.5, vGW.z / 23.0) + 0.43).r;
float wheel = 1.0 - smoothstep(0.18, 0.5, abs(lc - 0.85));
c *= 1.0 - 0.14 * wheel * (0.6 + 0.6 * wn);
float drip = (1.0 - smoothstep(0.1, 0.35, lc)) * smoothstep(0.45, 0.75, texture(tGN, vec2(lx * 0.9, vGW.z / 3.1) + 0.11).g);
c *= 1.0 - 0.28 * drip;
float gut = 1.0 - smoothstep(0.0, 0.45, 3.6 - abs(lx));
c *= 1.0 - 0.35 * gut * (0.7 + 0.3 * wn);
}
}
// grime: soot collecting under projections + dark wash near the ground (stone only)
if(part == 0 || part == 1 || part == 3 || part == 7) {
c *= 1.0 - 0.2 * smoothstep(0.55, 0.85, nz.b) * (1.0 - an.y);
c *= mix(0.78, 1.0, smoothstep(0.0, 4.0, vGW.y));
// (street r5) critic: 'no weathering / staining under ledges, no AO where the cornice meets the wall'.
// Contact shadow bands under the big projections + soot streaks washing down from them (walls only).
float wall = 1.0 - an.y;
float dC = __SHADER_INJECT_2__ - vGW.y, dA = __SHADER_INJECT_3__ - vGW.y, dT = __SHADER_INJECT_4__ - vGW.y;
float ao = 0.34 * step(0.0, dC) * exp(- max(dC, 0.0) * 1.1) + 0.26 * step(0.0, dA) * step(vGW.y, __SHADER_INJECT_5__) * exp(- max(dA, 0.0) * 1.4) + 0.3 * step(0.0, dT) * exp(- max(dT, 0.0) * 0.9); // (skyline r6) max(): exp overflowed to inf at y ~250 (MetLife cap) -> 0*inf = NaN = black
float colS = texture(tGN, vec2(q.x / 0.55, 0.37)).g, colS2 = texture(tGN, vec2(q.x / 2.3, 0.71)).b;
float streak = smoothstep(0.52, 0.8, colS) * (0.6 + 0.6 * colS2);
float run = step(0.0, dC) * exp(- max(dC, 0.0) / 7.0) + step(0.0, dA) * step(vGW.y, __SHADER_INJECT_6__) * exp(- max(dA, 0.0) / 3.0);
c *= (1.0 - ao * wall) * (1.0 - 0.3 * streak * run * wall);
c = mix(c, c * vec3(0.93, 0.95, 0.98), 0.5 * smoothstep(12.0, 30.0, vGW.y) * wall);   // cooler, cleaner stone higher up
// (textures r5) critic: 'Grand Central reads as pale clean plaster'. Real stone grain from the $imagegen stucco /
// limestone layer (luminance ratio, so the part colours stay), soot streak masks (walls_hao layer 16) washing
// down 3-14 m from the cornice / attic between the piers, and an overall aged value drop.
vec3 gs = texture(tGWC, vec3(q / 2.4 + 0.13, 14.0)).rgb, gm = textureLod(tGWC, vec3(0.5, 0.5, 14.0), 10.0).rgb;
c *= mix(1.0, clamp(dot(gs, vec3(0.333)) / max(dot(gm, vec3(0.333)), 0.05), 0.7, 1.3), 0.65);
float sc = floor(q.x / 1.7), sr = gh(vec2(sc, 3.1)), sLen = 3.0 + 11.0 * sr;
float sy = (vGW.y > __SHADER_INJECT_7__ ? __SHADER_INJECT_8__ : __SHADER_INJECT_9__) - vGW.y;
vec2 sq = vec2(fract(q.x / 1.7), sy / sLen);
float sm = (sq.y > 0.0 && sq.y < 1.0) ? texture(tGWH, vec3((mod(sc, 8.0) + clamp(sq.x, 0.02, 0.98)) / 8.0, 1.0 - sq.y, 16.0)).r : 0.0;
c *= 1.0 - 0.38 * sm * wall * step(0.35, sr);
c *= 0.86 * mix(vec3(1.0), vec3(1.0, 0.97, 0.92), 0.5 * (1.0 - smoothstep(2.0, 12.0, vGW.y)));
}
diffuseColor.rgb = c;
}
// @section fragmentRoughness
#include <roughnessmap_fragment>
if(int(vGP + 0.5) == 2) roughnessFactor = 0.42 + 0.45 * gV; /* (street r11) bare copper satin, crust matte */ 
else if(int(vGP + 0.5) == 5) roughnessFactor = 0.45;
else if(int(vGP + 0.5) == 8) roughnessFactor = 0.42 + 0.4 * gV;
// @section fragmentMetalness
#include <metalnessmap_fragment>
if(int(vGP + 0.5) == 8) metalnessFactor = 0.55 * (1.0 - gV);
else if(int(vGP + 0.5) == 2) metalnessFactor = 0.35 * (1.0 - gV);
// @section fragmentNormalMaps
#include <normal_fragment_maps>
{
vec2 dH = vec2(dFdx(gH) / max(length(dFdx(vViewPosition)), 1e-4), dFdy(gH) / max(length(dFdy(vViewPosition)), 1e-4));
dH = clamp(dH, vec2(- 0.8), vec2(0.8));
if(abs(dH.x) + abs(dH.y) > 1e-4) normal = gcPerturb(- vViewPosition, normal, dH, faceDirection);
}
// @section vertexCommonByGrandCentralWorldNormal
#include <common>
out vec2 vGU;
out vec3 vGWp;
out vec3 vGNp;
// @section vertexUvVertex
#include <uv_vertex>
vGU = uv;
// @section vertexFogVertexByGrandCentralWorldNormal
#include <fog_vertex>
vGWp = (modelMatrix * vec4(transformed, 1.0)).xyz;
vGNp = normalize(mat3(modelMatrix) * objectNormal);
// @section fragmentCommonByGrandCentralWorldNormal
#include <common>
in vec2 vGU;
in vec3 vGWp;
in vec3 vGNp;
float vGMull = 0.0;
vec3 gInt = vec3(0.0);
float gGrid(vec2 q, vec2 per, vec2 w) {
vec2 g = q / per;
vec2 fw = fwidth(g) + 1e-4;
vec2 d = abs(fract(g) - 0.5) * 2.0;
return max(smoothstep(1.0 - w.x - fw.x * 2.0, 1.0 - w.x, d.x), smoothstep(1.0 - w.y - fw.y * 2.0, 1.0 - w.y, d.y)) * (1.0 - smoothstep(0.3, 0.7, max(fw.x, fw.y)));
}
// @section fragmentMapByGrandCentralWorldPosition
#include <map_fragment>
{
// fine muntins on the outer skin (the heavy bars are real geometry)
float mull = gGrid(vGU, vec2(0.5, 0.65), vec2(0.1, 0.08));
vec3 V = normalize(vGWp - cameraPosition), n = normalize(vGNp);
float cv = max(dot(V, - n), 0.08);
vec3 tW = normalize(cross(vec3(0.0, 1.0, 0.0), n) + vec3(1e-4));
// inner skin 1.2 m in
vec3 h1 = vGWp + V * (1.2 / cv);
float m1 = gGrid(vec2(dot(h1, tW), h1.y), vec2(1.0, 1.3), vec2(0.12, 0.1));
// concourse: far wall 30 m in, floor at y = 1
float tb = 30.0 / cv, tf = V.y < - 0.01 ? (vGWp.y - 1.0) / - V.y : 1e5;
vec3 col;
if(tf < tb) {
vec3 hf = vGWp + V * tf;
vec2 fq = vec2(dot(hf, tW), dot(hf, n));
float tile = gGrid(fq, vec2(1.6, 1.6), vec2(0.04, 0.04));
col = vec3(0.34, 0.28, 0.2) * (0.85 + 0.15 * sin(fq.x * 0.37) * sin(fq.y * 0.29)) * (1.0 - 0.3 * tile);
col *= 0.55 + 0.45 * exp(- tf * 0.02);
} else {
vec3 hb = vGWp + V * tb;
vec2 bq = vec2(dot(hb, tW), hb.y);
col = vec3(0.2, 0.15, 0.1) * (0.7 + 0.3 * smoothstep(20.0, 4.0, bq.y));            // warm stone hall, lit low
float ax = mod(bq.x + 7.5, 15.0) - 7.5;                                            // the far wall's arched windows
float arch = step(abs(ax), 4.0) * step(9.0, bq.y) * step(bq.y, 21.0 + sqrt(max(0.0, 16.0 - ax * ax)));
col = mix(col, vec3(0.34, 0.36, 0.38), arch * (1.0 - 0.6 * gGrid(bq, vec2(1.0, 1.3), vec2(0.14, 0.12))));
vec2 ch = vec2(mod(bq.x, 7.5) - 3.75, bq.y - 12.5);                                  // chandelier glows
col += vec3(1.0, 0.72, 0.4) * 0.9 * exp(- dot(ch, ch) * 0.9);
col += vec3(0.45, 0.4, 0.3) * smoothstep(24.0, 30.0, bq.y) * 0.4;                    // barrel ceiling (painted sky)
}
col *= 1.0 - 0.55 * m1;
gInt = col;
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.47, 0.44), mull * 0.45); // (street r5) pale painted muntins, faint (read as glazing, not a dark grid decal)
vGMull = mull;
}
// @section fragmentRoughnessStreetFixtures
#include <roughnessmap_fragment>
roughnessFactor = mix(roughnessFactor, 0.6, vGMull);
// @section fragmentMetalnessStreetFixtures
#include <metalnessmap_fragment>
metalnessFactor = mix(metalnessFactor, 0.2, vGMull);
// @section fragmentEmissive
#include <emissivemap_fragment>
{
float cv2 = max(dot(normalize(cameraPosition - vGWp), normalize(vGNp)), 0.0);
float fres = 0.08 + 0.92 * pow(1.0 - cv2, 5.0);
totalEmissiveRadiance += gInt * (1.0 - fres) * (1.0 - vGMull * 0.5) * 1.15; /* (street r10) 0.85 -> 1.15: warm concourse glow behind the deep reveals */ // (street r6) dimmer: deep, dark hall // (street r5) warmer interior glow
}
// @section vertexCommonByPavementWorldNormal
#include <common>
out vec3 vPW;
out vec3 vPN;
// @section vertexFogVertexByPavementWorldNormal
#include <fog_vertex>
vPW = (modelMatrix * vec4(transformed, 1.0)).xyz;
vPN = normalize(mat3(modelMatrix) * objectNormal);
// @section fragmentCommonByPavementWorldNormal
#include <common>
in vec3 vPW;
in vec3 vPN;
float pOpq = 0.0;
float pH = 0.0, pH2 = 0.0, pH3 = 0.0;
vec3 pInt = vec3(0.0);
float ph(vec2 p) {
return fract(sin(dot(p, vec2(41.37, 289.11))) * 23758.5453);
}
// @section fragmentMapByPavementWorldPosition
#include <map_fragment>
{
vec3 n = normalize(vPN), tW = normalize(cross(vec3(0.0, 1.0, 0.0), n) + vec3(1e-4));
float u = dot(vPW, tW), fl = (vPW.y - __SHADER_INJECT_0__) / __SHADER_INJECT_1__;
float fy = fract(fl), fu = fract(u / __SHADER_INJECT_2__);
vec2 id = vec2(floor(u / __SHADER_INJECT_3__) + n.x * 17.0 + n.z * 31.0, floor(fl));
pH = ph(id);
pH2 = ph(id + 7.3);
pH3 = ph(vec2(floor(u / (__SHADER_INJECT_4__ * 3.0)), id.y) + 3.1);   // pane / room hashes
float fwU = fwidth(u / __SHADER_INJECT_5__) + 1e-4, fwY = fwidth(fl) + 1e-4;
float mull = max(1.0 - smoothstep(0.025, 0.025 + fwU * 1.5, min(fu, 1.0 - fu)), 1.0 - smoothstep(0.012, 0.012 + fwY * 1.5, abs(fy - 0.235)));
float span = 1.0 - smoothstep(0.215, 0.215 + fwY, fy);                    // opaque spandrel band at the slab
pOpq = max(span, mull);
// interior: room box behind the pane (back wall 6 m in, floor at the sill, ceiling 2.9 m up)
vec3 V = normalize(vPW - cameraPosition);
float cv = max(dot(V, - n), 0.06);
float yF = __SHADER_INJECT_6__ + floor(fl) * __SHADER_INJECT_7__ + 0.95, yC = yF + 2.85;
float tB = 6.0 / cv, tC = V.y > 0.001 ? (yC - vPW.y) / V.y : 1e5, tF = V.y < - 0.001 ? (yF - vPW.y) / V.y : 1e5;
float lit = step(0.35, pH3);
vec3 col;
if(tC < tB && tC < tF) {
vec3 h = vPW + V * tC;
float lx = abs(fract(dot(h, tW) / 1.5) - 0.5), lz = abs(fract(dot(h, n) / 2.4) - 0.5);
col = vec3(0.1) + lit * vec3(0.95, 0.97, 1.0) * 0.55 * (1.0 - smoothstep(0.12, 0.16, lx)) * (1.0 - smoothstep(0.3, 0.34, lz));
} else if(tF < tB) {
vec3 h = vPW + V * tF;
col = vec3(0.06, 0.06, 0.065) * (0.7 + 0.6 * exp(- tF * 0.2));
} else {
vec3 h = vPW + V * tB;
float hy = h.y - yF;
float bx = dot(h, tW);
col = mix(vec3(0.16, 0.16, 0.15), vec3(0.24, 0.22, 0.19), ph(vec2(floor(bx / 4.0), id.y)));
float desk = step(0.0, hy) * step(hy, 0.78) * step(0.25, fract(bx / 2.6));
col = mix(col, vec3(0.05), desk * 0.8);
col *= 0.5 + 0.5 * lit;
}
col *= 0.35 + 0.65 * lit;
// blinds: some bays drawn part-way down from the head
// (street r12) critic: 'randomly scattered bright white window cells (missing-texture flicker)'. Blinds are now
// set per 3-bay office (one tenant, one drop height, quantised to thirds) and are a dusty dark bronze, not cream
float bl = pH3 > 0.62 ? 0.2 + 0.25 * floor(ph(vec2(floor(u / (__SHADER_INJECT_8__ * 3.0)), id.y) + 1.9) * 3.0) : 0.0;
float wy = (fy - 0.235) / 0.765;
float blind = step(1.0 - bl, wy);
float slat = mix(0.92, 0.85 + 0.15 * step(0.5, fract(vPW.y * 18.0)), 1.0 - smoothstep(0.15, 0.4, fwidth(vPW.y * 18.0)));
pInt = mix(col, vec3(0.0), blind);
diffuseColor.rgb = mix(diffuseColor.rgb * (0.75 + 0.5 * pH), vec3(0.17, 0.155, 0.13) * slat * (0.9 + 0.15 * pH2), blind * 0.85); // (street r12) darker blinds
pOpq = max(pOpq, blind * 0.7);
diffuseColor.rgb = mix(diffuseColor.rgb, span > 0.5 ? vec3(0.075, 0.068, 0.058) : vec3(0.1, 0.09, 0.075), max(span, mull));
}
// @section fragmentRoughnessWindowGlass
#include <roughnessmap_fragment>
roughnessFactor = mix(0.05 + 0.18 * pH * pH, 0.55, pOpq);
// @section fragmentMetalnessWindowGlass
#include <metalnessmap_fragment>
metalnessFactor = mix(0.85, 0.25, pOpq);
// @section fragmentNormalMapsWindowPane
#include <normal_fragment_maps>
normal = normalize(normal + vec3(pH - 0.5, pH2 - 0.5, 0.0) * 0.045 * (1.0 - pOpq));   // per-pane tilt (oil-canning)
// @section fragmentEmissiveByPavementWorldNormal
#include <emissivemap_fragment>
{
float cv2 = max(dot(normalize(cameraPosition - vPW), normalize(vPN)), 0.0);
float fres = 0.06 + 0.94 * pow(1.0 - cv2, 5.0);
totalEmissiveRadiance += pInt * (1.0 - fres) * (1.0 - pOpq) * 0.55;
}
`,Mt=e=>B(H(I(e,U(127.1,311.7))).mul(43758.5453)),Nt=()=>{let e=ue(Fe.value);return e.onRenderUpdate(()=>{e.value=Fe.value}),e};function Pt(e){let t=new Te({vertexColors:!1,roughness:.86});t.name=`GrandCentralStone.TSL`;let n=F,r=R(re(ce)),i=ve(`aPart`,`float`),a=N(r.y.greaterThan(r.x).and(r.y.greaterThan(r.z)),U(n.x,n.z),N(r.x.greaterThan(r.z),U(n.z,n.y),U(n.x,n.y))),o=M(e.noise,a.div(13)).rgb,s=M(e.noise,a.div(2.7).add(.31)).rgb,c=fe().rgb,l=P(a.y.div(.62)),u=a.x.div(1.25).add(Se(l,2).mul(.5)),d=U(P(u),l),f=B(U(u,a.y.div(.62))),p=de(f.x,z(1).sub(f.x)),m=de(f.y,z(1).sub(f.y)),h=_e(z(1).sub(j(0,.025,p)),z(1).sub(j(0,.035,m))),g=c.mul(z(.94).add(Mt(d).mul(.07))).mul(z(.86).add(o.r.mul(.22))).mul(z(.94).add(s.g.mul(.08))).mul(z(1).sub(h.mul(.17))),_=M(e.noise,U(n.x.div(1.6),n.y.div(22)).add(.61)).g,v=j(.35,.8,_),y=V(.24,.2,.15).mul(z(.8).add(s.b.mul(.4))),b=V(.43,.52,.46).mul(z(.82).add(o.g.mul(.3))),x=W(y,b,v).mul(z(.9).add(s.r.mul(.12))),S=M(e.noise,U(n.x.div(.9),n.y.div(3)).add(n.z.mul(.31))).g,C=re(ce).y.mul(.5).add(.5),w=j(.45,.95,C).mul(.75).add(j(.5,.78,S).mul(.35)).clamp(0,1),T=W(c.mul(z(.75).add(S.mul(.45))),V(.33,.45,.38),w.mul(.8)),E=g;E=N(i.greaterThan(1.5).and(i.lessThan(2.5)),x,E),E=N(i.greaterThan(7.5).and(i.lessThan(8.5)),T,E),E=N(i.greaterThan(.5).and(i.lessThan(1.5)),c.mul(z(.88).add(o.r.mul(.2))),E),E=N(i.greaterThan(2.5).and(i.lessThan(4.5)),c.mul(z(.88).add(o.r.mul(.2))),E),E=N(i.greaterThan(3.5).and(i.lessThan(4.5)),c.mul(z(.85).add(o.r.mul(.25))),E),E=N(i.greaterThan(5.5).and(i.lessThan(6.5)),c.mul(z(.7).add(s.g.mul(.5))),E),E=N(i.greaterThan(6.5).and(i.lessThan(7.5)),c.mul(z(.78).add(o.r.mul(.3))),E);let D=z(1).sub(j(0,4,n.y).mul(.18));return t.colorNode=E.mul(D),t.roughnessNode=N(i.greaterThan(1.5).and(i.lessThan(2.5)),z(.66).add(v.mul(.25)),N(i.greaterThan(7.5).and(i.lessThan(8.5)),z(.55).add(w.mul(.3)),N(i.greaterThan(4.5).and(i.lessThan(5.5)),z(.45),z(.86)))),t.metalnessNode=N(i.greaterThan(1.5).and(i.lessThan(2.5)),z(.35).mul(z(1).sub(v)),N(i.greaterThan(7.5).and(i.lessThan(8.5)),z(.55).mul(z(1).sub(w)),N(i.greaterThan(4.5).and(i.lessThan(5.5)),z(.45),z(0)))),t}function Ft(){let e=new Te({color:5068887,roughness:.1,metalness:.6});e.name=`GrandCentralGlass.TSL`;let t=pe(),n=F,r=re(ce),i=U(t.x.mul(8),t.y.mul(12)),a=R(B(i).sub(.5)),o=_e(z(1).sub(j(.43,.49,a.x)),z(1).sub(j(.43,.49,a.y))),s=Mt(P(i).add(5.3)).greaterThan(.8),c=Nt(),l=W(V(.035,.045,.05),V(.68,.39,.2),c.mul(s).mul(.8)),u=R(I(re(ge.sub(n)),r)),d=z(.08).add(le(z(1).sub(u),5).mul(.45));return e.colorNode=W(l,V(.3,.36,.37),o.mul(.65)),e.emissiveNode=V(1,.58,.3).mul(c).mul(s).mul(z(1).sub(o)).mul(.65).mul(z(1).sub(d)),e.roughnessNode=W(.08,.6,o),e.metalnessNode=W(.72,.2,o),e}function It(e,t,n){let r=new Te({color:1842460,roughness:.1,metalness:.85});r.name=`GrandCentralPodiumGlass.TSL`;let i=F,a=re(ce),o=re(xe(V(0,1,0),a).add(V(1e-4))),s=I(i,o),c=i.y.sub(e).div(t),l=B(c),u=B(s.div(n)),d=U(P(s.div(n)).add(a.x.mul(17)).add(a.z.mul(31)),P(c)),f=Mt(d),p=Mt(d.add(7.3)),m=Mt(U(P(s.div(n*3)),d.y).add(3.1)),h=ae(s.div(n)).add(1e-4),g=ae(c).add(1e-4),_=z(1).sub(j(.025,z(.025).add(h.mul(1.5)),de(u,z(1).sub(u)))),v=z(1).sub(j(.012,z(.012).add(g.mul(1.5)),R(l.sub(.235)))),y=_e(_,v),b=z(1).sub(j(.215,z(.215).add(g),l)),x=_e(b,y),S=re(i.sub(ge)),C=_e(I(S,a.negate()),.06),w=z(e).add(P(c).mul(t)).add(.95),T=w.add(2.85),E=z(6).div(C),D=N(S.y.greaterThan(.001),T.sub(i.y).div(S.y),1e5),O=N(S.y.lessThan(-.001),w.sub(i.y).div(S.y),1e5),k=oe(.35,m),A=i.add(S.mul(D)),ee=R(B(I(A,o).div(1.5)).sub(.5)),M=R(B(I(A,a).div(2.4)).sub(.5)),te=z(1).sub(j(.12,.16,ee)).mul(z(1).sub(j(.3,.34,M))),ne=V(.1).add(V(.95,.97,1).mul(k).mul(.55).mul(te));i.add(S.mul(O));let ie=V(.06,.06,.065).mul(z(.7).add(we(O.mul(-.2)).mul(.6))),se=i.add(S.mul(E)),L=I(se,o),ue=Mt(U(P(L.div(4)),d.y)),fe=oe(0,se.y.sub(w)).mul(oe(se.y.sub(w),.78)).mul(oe(.25,B(L.div(2.6)))),pe=W(V(.16,.16,.15),V(.24,.22,.19),ue).mul(z(.5).add(k.mul(.5))),me=N(D.lessThan(E).and(D.lessThan(O)),ne,N(O.lessThan(E),ie,W(pe,V(.05),fe.mul(.8)))),he=N(m.greaterThan(.62),z(.2).add(Mt(U(P(s.div(n*3)),d.y).add(1.9)).mul(3).floor().mul(.25)),0),H=oe(z(1).sub(he),l.sub(.235).div(.765)),ve=W(.92,z(.85).add(oe(.5,B(i.y.mul(18))).mul(.15)),z(1).sub(j(.15,.4,ae(i.y.mul(18)))));V(.17,.155,.13).mul(ve).mul(z(.9).add(p.mul(.15))),x=_e(x,H.mul(.7));let ye=W(V(.1,.09,.075),V(.17,.155,.13).mul(ve),H.mul(.85)),be=W(V(.16),V(.24,.22,.19),f),Se=W(be.mul(z(.75).add(f.mul(.5))),me,z(1).sub(x));Se=W(Se,ye,x);let Ce=_e(I(re(ge.sub(i)),a),0),Ee=z(.06).add(le(z(1).sub(Ce),5).mul(.94));return r.colorNode=Se,r.emissiveNode=me.mul(z(1).sub(Ee)).mul(z(1).sub(x)).mul(.55),r.roughnessNode=W(z(.05).add(f.mul(f).mul(.18)),.55,x),r.metalnessNode=W(.85,.25,x),r}var Lt=`// timessq shader sections. Use parseShaderSections() to select an injection chunk.
// @section fragmentCommon
#include <common>
__SHADER_INJECT_0__
// @section fragmentEmissive
#include <emissivemap_fragment>
totalEmissiveRadiance *= __SHADER_INJECT_0__; // (night)
{
vec2 px = vEmissiveMapUv * vec2(4096.0) * 0.5;
vec2 fw = fwidth(px);
float k = clamp(1.0 - max(fw.x, fw.y) * 1.6, 0.0, 1.0);
vec2 g = abs(fract(px) - 0.5);
float m = smoothstep(0.5, 0.36, max(g.x, g.y));
// RGB sub-pixel triads (visible up close only) + the dark pixel grid between the LEDs
float sp = fract(px.x * 3.0);
vec3 tri = vec3(smoothstep(0.0, 0.12, sp) * smoothstep(0.36, 0.24, sp), smoothstep(0.3, 0.42, sp) * smoothstep(0.7, 0.58, sp), smoothstep(0.64, 0.76, sp) * smoothstep(1.0, 0.88, sp));
float k2 = clamp(1.0 - max(fw.x, fw.y) * 4.0, 0.0, 1.0);
totalEmissiveRadiance *= mix(vec3(1.0), (0.4 + 0.75 * m) * mix(vec3(1.0), 0.35 + 1.9 * tri, k2), k);
// (r6) a touch less chroma (critic: 'over-saturated, too clean')
totalEmissiveRadiance = mix(totalEmissiveRadiance, vec3(dot(totalEmissiveRadiance, vec3(0.3, 0.55, 0.15))), mix(0.26, uScrDesat, uNightK)); // (night) vivid LED colour at night (ts_perch_night) // (billboards r6) 0.14 -> 0.26 (critic r5: 'uniformly saturated poster imagery')
// (r7) LED cabinet modules (16 x 16 LEDs): thin dark seams that survive much farther than the LED grid, plus faint
// horizontal scan rows (critic r6: 'flat glowing cards with no LED pixel grid or scanline')
vec2 cb = vEmissiveMapUv * vec2(4096.0) / 32.0;
vec2 fc = fwidth(cb);
float kc = clamp(1.0 - max(fc.x, fc.y) * 14.0, 0.0, 1.0);
vec2 gc = 0.5 - abs(fract(cb) - 0.5);
float seam = max(1.0 - smoothstep(0.006, 0.006 + fc.x, gc.x), 1.0 - smoothstep(0.006, 0.006 + fc.y, gc.y));
totalEmissiveRadiance *= 1.0 - 0.09 * seam * kc; // (r9) 0.2 -> 0.09 (critic r8: 'visible grid tiling pattern' up close)
float kr = clamp(1.0 - fw.y * 1.4, 0.0, 1.0);
totalEmissiveRadiance *= mix(1.0, 0.8 + 0.2 * cos(px.y * 6.2831853), kr * 0.8);
// (r7) LED viewing cone: panels seen off-axis dim + shift slightly cool, so screens at different angles differ
float ca = abs(dot(normalize(normal), normalize(vViewPosition)));
totalEmissiveRadiance *= mix(vec3(0.5, 0.54, 0.6), vec3(1.0), smoothstep(0.08, 0.7, ca));
// (r7) soft highlight shoulder: whites roll off instead of clipping to a flat near-white card
float mx = max(totalEmissiveRadiance.r, max(totalEmissiveRadiance.g, totalEmissiveRadiance.b));
if(mx > 1.0) totalEmissiveRadiance *= (1.0 + (mx - 1.0) / (1.0 + (mx - 1.0) * 1.1)) / mx;
__SHADER_INJECT_1__ }
// @section fragmentMap
#include <map_fragment>
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.3, 0.55, 0.15))), 0.2) * 0.92 + 0.012;
// @section fragmentColor
diffuseColor.a *= vColor.r;
diffuseColor.rgb = vec3(0.0);
// @section fragmentEmissiveSignLetterCutout
{
vec3 c = texture(emissiveMap, vEmissiveMapUv).rgb, b = textureLod(emissiveMap, vEmissiveMapUv, 5.0).rgb;
float m = smoothstep(0.1, 0.3, length(c - b));
if(m < 0.4) discard;
totalEmissiveRadiance = emissive * mix(vColor.rgb, vec3(1.0, 0.96, 0.92), 0.45 * smoothstep(0.65, 1.0, m)) * m;
}
// @section vertexCommon
#include <common>
out float vHaloF;
// @section vertexProjectVertex
#include <project_vertex>
{
vec3 hwp = (modelMatrix * vec4(transformed, 1.0)).xyz;
vHaloF = 1.0 - smoothstep(0.3, 0.65, - normalize(hwp - cameraPosition).y);
}
// @section fragmentCommonByHaloFade
#include <common>
in float vHaloF;
// @section fragmentOpaque
outgoingLight *= vHaloF;
#include <opaque_fragment>
// @section vertexProjectVertexStorefront
#include <project_vertex>
vTanW = aTan;
vRoom = aRoom;
vNW = normal;
vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;
// @section fragmentMapStorefrontGlass
#include <map_fragment>
diffuseColor.rgb = vec3(0.03);
// @section fragmentEmissiveStorefrontInterior
{
vec3 V = normalize(vWP - cameraPosition), Nn = normalize(vNW), Tt = normalize(vTanW);
float dx = dot(V, Tt), dy = V.y, dz = max(- dot(V, Nn), 1e-3);
vec2 sz = vRoom.zw, p = vRoom.xy * sz;
const float D = 5.5;
float tx = dx > 1e-4 ? (sz.x - p.x) / dx : (dx < - 1e-4 ? - p.x / dx : 1e5);
float ty = dy > 1e-4 ? (sz.y + 0.6 - p.y) / dy : (dy < - 1e-4 ? - (p.y + 0.5) / dy : 1e5);
float tz = D / dz, t = min(min(tx, ty), tz);
vec3 h = vec3(p.x + dx * t, p.y + dy * t, dz * t);
vec2 cs = vec2(0.242, 0.49), c0 = vEmissiveMapUv - vRoom.xy * cs;
float fall = 1.0 - 0.4 * h.z / D;
vec3 col;
if(t >= tz - 1e-3) col = texture(emissiveMap, c0 + clamp(h.xy / sz, 0.02, 0.98) * cs).rgb;
else if(t >= tx - 1e-3) {
float s = 0.3 * h.z / D; // side walls: the outer strips of the shop picture run down the wall
col = texture(emissiveMap, c0 + vec2(dx > 0.0 ? 0.98 - s : 0.02 + s, clamp(h.y / sz.y, 0.02, 0.98)) * cs).rgb * 0.6 * fall;
} else if(dy > 0.0) {
float lp = step(0.62, fract(h.z / 1.5 + 0.2)) * step(0.3, fract(h.x / 1.8 + 0.15));
col = vec3(0.3, 0.29, 0.27) * fall + vec3(1.7, 1.6, 1.4) * lp;
} else {
vec2 q = vec2(h.x, h.z) / 0.6;
float tl = step(0.05, fract(q.x)) * step(0.05, fract(q.y));
col = vec3(0.36, 0.33, 0.3) * (0.7 + 0.3 * tl) * fall;
}
totalEmissiveRadiance = vec3(0.0); // Ground-floor Times Square storefront interiors stay unlit.
}
// @section fragmentMapPaverGrime
#include <map_fragment>
{
vec2 wp = vec2(vMapUv.x, - vMapUv.y) * 9.6;
// (r7) large-scale colour variance (warm red-brown <-> cooler grey-pink fields), lighter polished walking lines,
// darker grime along the building frontage
float h1 = texture(tMacro, wp * 0.0071 + 0.53).b, h2 = texture(tMacro, wp * 0.021 + 0.21).r;
diffuseColor.rgb *= mix(vec3(1.07, 0.97, 0.9), vec3(0.9, 0.96, 1.05), smoothstep(0.3, 0.72, h1));
float path = smoothstep(0.55, 0.8, h2) * (0.6 + 0.4 * texture(tMacro, wp * 0.13).g);
diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.22 + vec3(0.012, 0.011, 0.01), path * 0.7);
float ex = abs(wp.x);
diffuseColor.rgb *= 1.0 - 0.3 * smoothstep(uEdgeX - 4.0, uEdgeX - 0.5, ex) * (0.6 + 0.4 * h2);
// painted discs: worn, blotchy, paver texture multiplied through
float lum = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11));
// The loop skips discs per pixel. Compute the scaled mip levels before that divergent control flow;
// textureLod avoids executing a gradient instruction in the loop on ANGLE/D3D backends.
vec2 wpDx = dFdx(wp), wpDy = dFdy(wp);
vec2 macroTexelSize = vec2(textureSize(tMacro, 0));
float paintMacroLod = paverMipLevel(wpDx * 0.31, wpDy * 0.31, macroTexelSize);
float grainMacroLod = paverMipLevel(wpDx * 1.9, wpDy * 1.9, macroTexelSize);
for(int i = 0;
i < 24;
i ++) {
vec4 C = uCirc[i];
if(C.z < 0.0) continue;
float d = length(wp - C.xy) - C.z;
if(d > 0.05) continue;
float m = 1.0 - smoothstep(- 0.04, 0.03, d);
float rim = (1.0 - smoothstep(- 0.34, - 0.3, d)) * smoothstep(- 0.46, - 0.42, d); // pale inner ring line
vec3 pc = C.w < 0.5 ? vec3(0.07, 0.2, 0.3) : C.w < 1.5 ? vec3(0.09, 0.22, 0.24) : C.w < 2.5 ? vec3(0.16, 0.17, 0.2) : vec3(0.06, 0.12, 0.26);
float wr = textureLod(tMacro, wp * 0.31 + C.xy * 0.01, paintMacroLod).g * 0.6 + textureLod(tMacro, wp * 1.9, grainMacroLod).r * 0.5;
float keep = smoothstep(0.34, 0.62, wr);
vec3 painted = pc * clamp(lum / 0.16, 0.45, 1.5);
painted = mix(painted, vec3(0.5, 0.52, 0.52) * clamp(lum / 0.16, 0.45, 1.5), rim * 0.8);
diffuseColor.rgb = mix(diffuseColor.rgb, painted, m * keep * 0.5); // (r8) fainter, worn (critic: 'cheap flat circles')
}
}
{
float a = texture(tMacro, vMapUv * 0.061).r, b = texture(tMacro, vMapUv * 0.23 + 0.37).g, c = texture(tMacro, vMapUv * 0.9 + 0.11).b;
diffuseColor.rgb *= 0.74 + 0.42 * a * (0.7 + 0.6 * b);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.33))), 0.12 + 0.25 * smoothstep(0.55, 0.8, c));
diffuseColor.rgb *= mix(1.0, texture(roughnessMap, vRoughnessMapUv).r, 0.8);
diffuseColor.rgb = diffuseColor.rgb * 1.2 + vec3(0.014, 0.012, 0.011); // (r8) paler, sunlit pavers (director r7)
// (r11) critic r9: 'pavers flat and too saturated, no grime' -> less chroma + a sooty film in the macro noise lows
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11))), 0.2);
diffuseColor.rgb *= 1.0 - 0.18 * smoothstep(0.5, 0.2, a) * (0.5 + 0.5 * b);
}
// @section fragmentMapCrosswalkWear
{
vec4 n1 = texture(map, vMapUv), n2 = texture(map, vMapUv * 4.3 + 0.37), n3 = texture(map, vMapUv * 17.0 + 0.71);
float pale = smoothstep(0.72, 0.9, n1.g) * smoothstep(0.45, 0.75, n2.b);
diffuseColor = vec4(mix(diffuse * (0.75 + 0.4 * n3.b), vec3(0.62, 0.61, 0.58), pale), clamp((0.26 + 0.34 * smoothstep(0.2, 0.8, n1.r)) * (0.65 + 0.7 * n2.g) + 0.25 * pale, 0.0, 0.68));
vec2 wq = vMapUv * float(__SHADER_INJECT_0__);
// (r11) worn crosswalk paint (critic r9: 'stripes too clean and uniformly white'): denser grime film + chipped
// spots over the avenue crossings (z = street +- 7.4) and the side-street crossings (|x| = 13.4)
{
float zz = mod(wq.y, float(__SHADER_INJECT_1__)), ax = abs(wq.x);
float cw = (1.0 - smoothstep(2.2, 3.0, abs(zz - __SHADER_INJECT_2__))) + (1.0 - smoothstep(2.2, 3.0, abs(zz - __SHADER_INJECT_3__)));
cw *= 1.0 - smoothstep(__SHADER_INJECT_4__, __SHADER_INJECT_5__, ax);
cw += (1.0 - smoothstep(__SHADER_INJECT_6__, __SHADER_INJECT_7__, min(zz, float(__SHADER_INJECT_8__) - zz))) * (1.0 - smoothstep(1.8, 2.6, abs(ax - __SHADER_INJECT_9__)));
float chip = smoothstep(0.55, 0.72, n3.r) * (0.6 + 0.4 * n2.b);
diffuseColor.a = __SHADER_INJECT_10__;
}
diffuseColor.a *= smoothstep(float(__SHADER_INJECT_11__), float(__SHADER_INJECT_12__), abs(wq.x)) * smoothstep(- 326.0, - 306.0, wq.y) * smoothstep(6.0, - 8.0, wq.y);
}

// @section storefrontVertexPrefix
in vec3 aTan;
in vec4 aRoom;
out vec3 vTanW;
out vec4 vRoom;
out vec3 vWP;
out vec3 vNW;

// @section storefrontFragmentPrefix
in vec3 vTanW;
in vec4 vRoom;
in vec3 vWP;
in vec3 vNW;

// @section paversFragmentPrefix
uniform sampler2D tMacro;
uniform vec4 uCirc[24];
uniform float uEdgeX;
float paverMipLevel(vec2 uvDx, vec2 uvDy, vec2 textureSizeInTexels) {
float footprint = max(length(uvDx * textureSizeInTexels), length(uvDy * textureSizeInTexels));
return log2(max(footprint, 1.0));
}
`,Rt=`// screenlights shader sections. Use parseShaderSections() to select an injection chunk.
// @section fragmentCommon
#include <common>
__SHADER_INJECT_0__
// @section fragmentLightsBegin
totalEmissiveRadiance *= __SHADER_INJECT_0__; // (night)
__SHADER_INJECT_1__
#include <lights_fragment_begin>

// @section uniformDeclarations
uniform float uScreenK;
uniform float uNightK;
uniform float uScrBoost;
uniform float uScrDesat;
uniform float uScrKnee;
uniform float uScrTop;

// @section gainExpression
(uScreenK * (1.0 + (uScrBoost - 1.0) * uNightK))

// @section highlightShoulder
if(uNightK > 0.0) {
float scrN = max(max(emissive.r, emissive.g), emissive.b) * __SHADER_INJECT_0__ + 1e-4;
float scrM = max(max(totalEmissiveRadiance.r, totalEmissiveRadiance.g), totalEmissiveRadiance.b) / scrN;
if(scrM > uScrKnee) {
float scrW = uScrTop - uScrKnee;
float scrY = uScrKnee + scrW * (1.0 - exp(- (scrM - uScrKnee) / scrW));
totalEmissiveRadiance *= mix(1.0, scrY / scrM, uNightK);
}
}
`,zt=e=>ue(e.value).onRenderUpdate((t,n)=>{n.value=e.value});function Bt(e){let t=new Ee({map:e,transparent:!0,depthWrite:!1,side:2,polygonOffset:!0,polygonOffsetFactor:-6,polygonOffsetUnits:-6});t.name=`TimesSquareAO.TSL`,t.vertexColors=!0;let n=M(e,pe()),r=fe();return t.colorNode=V(0),t.opacityNode=n.a.mul(r.r),t.blending=5,t.blendEquation=100,t.blendSrc=204,t.blendDst=205,t.blendSrcAlpha=200,t.blendDstAlpha=201,t}function Vt(e){let t=new Ee({transparent:!0,depthWrite:!1,side:2,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4});t.name=`TimesSquareHalo.TSL`,t.vertexColors=!1;let n=M(e,pe()),r=re(F.sub(ge)),i=z(1).sub(j(.3,.65,r.y.negate()));return t.colorNode=n.rgb.mul(fe().rgb).mul(ne),t.opacityNode=n.a.mul(i),t.blending=5,t.blendEquation=100,t.blendSrc=201,t.blendDst=201,t.blendSrcAlpha=200,t.blendDstAlpha=201,t}function Ht(e){let t=new Te({roughness:.3,metalness:0,side:2});t.name=`TimesSquareBladeFaces.TSL`;let n=pe(),r=be(ve(`aCell`,`vec4`),`vBladeCell`),i=be(n,`vBladeUv`),a=r.xy.add(U(n.y,z(1).sub(n.x)).mul(r.zw)).flipY(),o=M(e,a).rgb,s=zt(Fe),c=zt(Ie),l=de(i.x,z(1).sub(i.x)).mul(2),u=de(i.y,z(1).sub(i.y)).mul(4.6),d=z(.55).add(j(0,.8,de(l,u)).mul(.45)),f=_e(o.r,_e(o.g,o.b)).add(1e-4),p=o.div(f).mul(le(f,.45)).mul(2),m=W(o.mul(.5),p,s).mul(d).mul(c),h=F.sub(ge).length().greaterThan(300);return t.colorNode=o,t.emissiveNode=m,t.maskNode=h.not(),t}function Ut(e){let t=new Te({color:3158064,roughness:.05,metalness:0,vertexColors:!0});t.name=`TimesSquareStorefront.TSL`;let n=pe(),r=be(ve(`aRoom`,`vec4`),`vShopRoom`),i=re(be(ve(`aTan`,`vec3`),`vShopTangent`)),a=re(ce),o=re(F.sub(ge)),s=I(o,i),c=o.y,l=I(o.negate(),a).max(.001),u=r.zw.max(.001),d=r.xy.mul(u),f=N(s.greaterThan(1e-4),s.max(1e-4),N(s.lessThan(-1e-4),s.min(-1e-4),1e5)),p=N(c.greaterThan(1e-4),c.max(1e-4),N(c.lessThan(-1e-4),c.min(-1e-4),1e5)),m=N(s.greaterThan(1e-4),u.x.sub(d.x).div(f),N(s.lessThan(-1e-4),d.x.negate().div(f),1e5)),h=N(c.greaterThan(1e-4),u.y.add(.6).sub(d.y).div(p),N(c.lessThan(-1e-4),d.y.add(.5).negate().div(p),1e5)),g=z(5.5).div(l),_=de(de(m,h),g),v=V(d.x.add(s.mul(_)),d.y.add(c.mul(_)),l.mul(_)),y=U(.242,.49),b=n.sub(r.xy.mul(y)),x=b.add(v.xy.div(u).clamp(.02,.98).mul(y)),S=N(s.greaterThan(0),z(.98).sub(v.z.mul(.3/5.5)),z(.02).add(v.z.mul(.3/5.5))),C=b.add(U(S,v.y.div(u.y).clamp(.02,.98)).mul(y)),w=z(1).sub(v.z.mul(.4/5.5)),T=M(e,x).rgb,E=M(e,C).rgb.mul(.6).mul(w),D=oe(.62,B(v.z.div(1.5).add(.2))).mul(oe(.3,B(v.x.div(1.8).add(.15)))),O=V(.3,.29,.27).mul(w).add(V(1.7,1.6,1.4).mul(D)),k=oe(.05,B(v.x.div(.6))).mul(oe(.05,B(v.z.div(.6)))),A=V(.36,.33,.3).mul(z(.7).add(k.mul(.3))).mul(w),j=N(_.greaterThanEqual(g.sub(.001)),T,N(_.greaterThanEqual(m.sub(.001)),E,N(c.greaterThan(0),O,A)));return t.colorNode=V(.03),t.emissiveNode=j.mul(fe().r).mul(0),t}function Wt({map:e,normalMap:t,roughnessMap:n,noise:r,circles:i,edgeX:a}){let o=new Te({roughness:1,metalness:0,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2});o.name=`TimesSquarePavers.TSL`;let s=pe(),c=U(s.x,s.y.negate()).mul(9.6),l=M(e,s).rgb,u=M(r,c.mul(.0071).add(.53)).b,d=M(r,c.mul(.021).add(.21)).r,f=l.mul(W(V(1.07,.97,.9),V(.9,.96,1.05),j(.3,.72,u))),p=j(.55,.8,d).mul(z(.6).add(M(r,c.mul(.13)).g.mul(.4)));f=W(f,f.mul(1.22).add(V(.012,.011,.01)),p.mul(.7)),f=f.mul(z(1).sub(j(a-4,a-.5,c.x.abs()).mul(z(.3).mul(z(.6).add(d.mul(.4))))));for(let e of i){if(e.z<0)continue;let t=c.sub(U(e.x,e.y)).length().sub(e.z),n=z(1).sub(j(-.04,.03,t)),i=z(1).sub(j(-.34,-.3,t)).mul(j(-.46,-.42,t)),a=e.w<.5?V(.07,.2,.3):e.w<1.5?V(.09,.22,.24):e.w<2.5?V(.16,.17,.2):V(.06,.12,.26),o=M(r,c.mul(.31).add(U(e.x,e.y).mul(.01))).g.mul(.6).add(M(r,c.mul(1.9)).r.mul(.5)),s=j(.34,.62,o),l=I(f,V(.3,.59,.11)),u=W(a.mul(l.div(.16).clamp(.45,1.5)),V(.5,.52,.52).mul(l.div(.16).clamp(.45,1.5)),i.mul(.8));f=W(f,u,n.mul(s).mul(.5))}let m=M(r,s.mul(.061)).r,h=M(r,s.mul(.23).add(.37)).g,g=M(r,s.mul(.9).add(.11)).b;f=f.mul(z(.74).add(m.mul(z(.42).mul(z(.7).add(h.mul(.6)))))),f=W(f,V(I(f,V(.33))),z(.12).add(j(.55,.8,g).mul(.25))),f=f.mul(M(n,s).r.mul(.8).add(.2)).mul(1.2).add(V(.014,.012,.011));let _=I(f,V(.3,.59,.11));return f=W(f,V(_),.2),f=f.mul(z(1).sub(z(.18).mul(j(.5,.2,m)).mul(z(.5).add(h.mul(.5))))),o.colorNode=f,o.normalNode=ee(M(t,s),U(.9,.9)),o.roughnessNode=M(n,s).g,o}function Gt({noise:e,crosswalkOnly:t,streetSpacing:n,streetHalf:r,avenueHalf:i,towerX:a}){let o=new Te({color:6118231,roughness:.93,metalness:0,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4});o.name=t?`TimesSquareCrosswalkWear.TSL`:`TimesSquareRoadDust.TSL`;let s=pe(),c=M(e,s).rgba,l=M(e,s.mul(4.3).add(.37)).rgba,u=M(e,s.mul(17).add(.71)).rgba,d=j(.72,.9,c.g).mul(j(.45,.75,l.b)),f=W(M(e,s).rgb.mul(z(.75).add(u.b.mul(.4))),V(.62,.61,.58),d),p=j(.55,.72,u.r).mul(z(.6).add(l.b.mul(.4))),m=z(.26).add(j(.2,.8,c.r).mul(.34)).mul(z(.65).add(l.g.mul(.7))).add(d.mul(.25)).clamp(0,.68),h=s.mul(37),g=Se(h.y,n),_=h.x.abs(),v=z(1).sub(j(2.2,3,g.sub(r+2.4).abs())).add(z(1).sub(j(2.2,3,g.sub(n-r-2.4).abs())));v=v.mul(z(1).sub(j(i-.5,i+.5,_)));let y=z(1).sub(j(1.8,2.6,de(g,z(n).sub(g)))).mul(z(1).sub(j(1.8,2.6,_.sub(i+2.4).abs())));v=v.add(y);let b=t?v.clamp(0,1).mul(z(.32).add(p.mul(.5))):m;return b=b.mul(j(a-24,a,_)).mul(j(-326,-306,h.y)).mul(j(6,-8,h.y)),o.colorNode=f,o.opacityNode=b,o.blending=5,o.blendEquation=100,o.blendSrc=204,o.blendDst=205,o.blendSrcAlpha=200,o.blendDstAlpha=201,o}function Kt(e){let t=new Te({color:2763306,emissive:16777215,emissiveIntensity:2.5,roughness:.28,metalness:0});t.name=`TimesSquareLED.TSL`,t.vertexColors=!0;let n=pe(),r=M(e,n.flipY());t.colorNode=r.rgb.mul(Ce(2763306)).mul(.92).add(.012);let i=zt(Fe),a=zt(Ie),o=zt(ut),s=zt(pt),c=zt(gt),l=zt(dt),u=a.mul(z(1).add(o.sub(1).mul(i))),d=n.mul(2048),f=ae(d),p=z(1).sub(_e(f.x,f.y).mul(1.6)).clamp(0,1),m=R(B(d).sub(.5)),h=j(.5,.36,_e(m.x,m.y)),g=B(d.x.mul(3)),_=V(j(0,.12,g).mul(j(.36,.24,g)),j(.3,.42,g).mul(j(.7,.58,g)),j(.64,.76,g).mul(j(1,.88,g))),v=z(1).sub(_e(f.x,f.y).mul(4)).clamp(0,1),y=r.rgb.mul(2.5).mul(u),b=z(.4).add(h.mul(.75)).mul(W(V(1),z(.35).add(_.mul(1.9)),v));y=y.mul(W(V(1),b,p));let x=n.mul(128),S=ae(x),C=z(1).sub(_e(S.x,S.y).mul(14)).clamp(0,1),w=z(.5).sub(R(B(x).sub(.5))),T=_e(z(1).sub(j(.006,z(.006).add(S.x),w.x)),z(1).sub(j(.006,z(.006).add(S.y),w.y)));y=y.mul(z(1).sub(T.mul(C).mul(.09)));let E=z(.8).add(te(d.y.mul(Math.PI*2)).mul(.2));y=y.mul(W(1,E,z(1).sub(f.y.mul(1.4).clamp(0,1)).mul(.8)));let D=R(I(re(he),re(se)));y=y.mul(W(V(.5,.54,.6),V(1),j(.08,.7,D)));let O=I(y,V(.3,.55,.15));y=W(y,V(O),W(.26,s,i));let k=_e(y.r,_e(y.g,y.b)).div(z(2.5).mul(u).add(1e-4)),A=l.sub(c).max(1e-4),ee=c.add(A.mul(z(1).sub(we(k.sub(c).div(A).negate())))),ne=W(1,ee.div(k.max(1e-4)),N(k.greaterThan(c),i,0));return y=y.mul(ne),t.emissiveNode=y,t}function qt(e){let t=new Te({color:0,emissive:16777215,emissiveIntensity:2.2,roughness:.4,metalness:0,side:2});t.name=`TimesSquareNeon.TSL`,t.vertexColors=!0;let n=pe().flipY(),r=M(e,n).rgb,i=M(e,n,z(5)).rgb,a=j(.1,.3,r.sub(i).length());t.maskNode=a.greaterThan(.4);let o=zt(Fe),s=zt(Ie),c=zt(ut),l=s.mul(z(1).add(c.sub(1).mul(o)));return t.colorNode=V(0),t.emissiveNode=fe().rgb.mul(W(V(1),V(1,.96,.92),a.mul(.45))).mul(a).mul(2.2).mul(l),t}var Jt=Oe(()=>Lt),Y=G.CURB_H,Yt=1.3,Xt=Me(`city/environmentTextures/`),X={plazaRows:[-240,-160],endRows:[-320,-80],plazaX:44,towerX:100,endX:96,oneTS:{x0:-9,x1:9,z0:-64,z1:-24,h:98},tkts:{x0:-40,x1:-21,zFront:-207,zBack:-229,n:16}},Zt=[],Qt=[],$t=e=>({z0:e+G.ST_HALF+G.ST_WALK,z1:e+G.ST_SP-G.ST_HALF-G.ST_WALK,c0:e+G.ST_HALF,c1:e+G.ST_SP-G.ST_HALF}),en=(e,t)=>e.gH+Math.max(1,Math.round((t-e.gH)/e.floorH))*e.floorH;function tn(){let e=[],t=(t,n,r,i,a,o,s,c,l=!1)=>e.push({name:t,x0:n,x1:r,z0:i,z1:a,seed:s,ts:!0,face:o,sides:{[o]:`street`},arch:e=>({type:`glass`,style:e()<.5?q.RIBBON:q.CURTAIN,layer:e()<.45?K.CONCRETE:K.METAL,base:K.GRANITE,floorH:3.8,bayW:1.6,winW:.9,winH:.5,gH:7,height:l?72+e()*40:140+e()*110,depth:.12,margin:.4,tint:[.62,.64,.68],cornice:!1,waterTower:!1,shape:(e,t,n,r,i)=>{let a=en(t,c[0]+r()*c[1]),s={...n,style:q.PUNCHED,layer:[K.CONCRETE,K.LIME,K.BUFF,K.RED][Math.floor(r()*4)],winW:.6,winH:.55,tint:[.62,.6,.58]},u=t=>t===o?(l?9:4)+r()*3:e.sides[t]===`street`?2.5:1.2,d=[{...n,style:q.DECO,layer:r()<.5?K.LIME:K.BUFF,bayW:1.9,winW:.52,winH:.62,depth:.25,tint:[1,.98,.94]},{...n,style:q.PUNCHED,layer:r()<.6?K.RED:K.BROWN,bayW:2.3,winW:.55,winH:.6,depth:.22,tint:[1,1,1]},{...n,style:q.RIBBON,layer:K.WHITE,bayW:1.6,winW:.9,winH:.5,depth:.12,tint:[.9,.9,.9]},{...n,style:q.CURTAIN,layer:K.METAL,bayW:1.5,winW:.97,winH:.74,depth:.05,tint:[.62,.66,.74]},n],f=d[Math.floor(r()*d.length)],p=[{x0:e.x0,x1:e.x1,z0:e.z0,z1:e.z1,y0:0,y1:a,p:s,parapet:1.1,roof:!0}],m={x0:e.x0+u(`nx`),x1:e.x1-u(`px`),z0:e.z0+u(`nz`),z1:e.z1-u(`pz`)},h=a,g=1+Math.floor(r()*3);for(let e=0;e<g;e++){let n=e===g-1||Math.min(m.x1-m.x0,m.z1-m.z0)<22,a=n?i:en(t,h+(i-h)*(.45+r()*.25));if(p.push({...m,y0:h,y1:a,p:f,parapet:f.style===q.CURTAIN?.6:1.3,roof:!0}),n)break;h=a;let o=2.5+r()*3;m={x0:m.x0+o,x1:m.x1-o,z0:m.z0+o,z1:m.z1-o}}return p}})});for(let n of X.plazaRows){let{z0:r,z1:i}=$t(n);e.push({name:`tsqPlazaW`,x0:-X.plazaX,x1:-10,z0:r,z1:i,custom:!0,tsPlaza:!0}),e.push({name:`tsqPlazaE`,x0:10,x1:X.plazaX,z0:r,z1:i,custom:!0,tsPlaza:!0}),t(`tsqTowerW`,-X.towerX,-X.plazaX,r,i,`px`,900+n,[36,22],!0),t(`tsqTowerE`,X.plazaX,X.towerX,r,i,`nx`,950+n,[36,22])}for(let e of X.endRows){let{z0:n,z1:r}=$t(e);t(`tsqEndW`,-X.endX,-10,n,r,`px`,1300+e,[30,26],e===-80),t(`tsqEndE`,10,X.endX,n,r,`nx`,1350+e,[30,26])}return e}var nn=64,rn=4096,an=4096;function on(e){let t={L:Array.from({length:nn},()=>[]),P:Array.from({length:nn},()=>[])};return(n,r,i)=>{let a=t[n?`L`:`P`],o=0,s=-1,c=n?nt:ct;for(let n=0;n<nn;n+=1){let l=1e5;if(c){let e=c[n];for(let n of[`L`,`P`]){let a=n===`L`?nt:ct,o=t[n];for(let t=0;t<nn;t+=1)if(a[t]===e)for(let e of o[t])l=Math.min(l,Math.hypot(e[0]-r,e[1]-i))}}else for(let e of a[n])l=Math.min(l,Math.hypot(e[0]-r,e[1]-i));let u=l+e()*8;u>s&&(s=u,o=n)}return a[o].push([r,i]),o}}function sn(e,t,n,r=0,i=0){let a=t>=1||t>.75&&e()<.5;return ln(a,n(a,r,i),t)}function cn(e,t,n){let r=e[0]!==`P`,i=r?Ze:$e,a=i?i.indexOf(e):-1;if(a<0)return null;let o=ln(r,a,n?r?2:.5:t);if(n){let e=o[3]-o[1];o[1]+=e*n[0],o[3]=o[1]+e*(n[1]-n[0])}return o}function ln(e,t,n){let r,i,a,o,s;e?(r=t%8/8,a=1/8,o=1/16,i=1-(Math.floor(t/8)+1)/16,s=2):(r=t%16/16,a=1/16,o=1/8,i=.5-(Math.floor(t/16)+1)/8,s=.5);let c=2/rn,l=2/an;if(r+=c,a-=2*c,i+=l,o-=2*l,n>s){let e=s/n;i+=o*(1-e)/2,o*=e}else{let e=n/s;r+=a*(1-e)/2,a*=e}let u=[r,i,r+a,i+o];return u.avg=(e?st:at)[t],u}var un=64,dn=[];function fn(e,t){if(!dn.length){dn=Array.from({length:un},(e,t)=>t);for(let t=63;t>0;t--){let n=Math.floor(e()*(t+1));[dn[t],dn[n]]=[dn[n],dn[t]]}}let n=dn.pop(),r=n%4/4+2/2048,i=.25-4/2048,a=1-(Math.floor(n/4)+1)/16+2/2048,o=1/16-4/2048;if(t>4){let e=4/t;a+=o*(1-e)/2,o*=e}else{let e=t/4;r+=i*(1-e)/2,i*=e}return[r,a,r+i,a+o]}function pn(e,t){let n=e%4/4+2/2048,r=.25-4/2048,i=1-(Math.floor(e/4)+1)/16+2/2048,a=1/16-4/2048;if(t>4){let e=4/t;i+=a*(1-e)/2,a*=e}else{let e=t/4;n+=r*(1-e)/2,r*=e}return[n,i,n+r,i+a]}var mn=[3,19,22,38,54,57,37,53,20,18,12,36],hn=class{constructor(){this.p=[],this.n=[],this.uv=[],this.c=[],this.i=[],this.v=0}quad(e,t,n,r,i,a,o=[1,1,1]){for(let a of[e,t,n,r])this.p.push(a[0],a[1],a[2]),this.n.push(i[0],i[1],i[2]),this.c.push(o[0],o[1],o[2]);this.uv.push(a[0],a[1],a[2],a[1],a[2],a[3],a[0],a[3]),this.i.push(this.v,this.v+1,this.v+2,this.v,this.v+2,this.v+3),this.v+=4}room(e,t,n,r,i,a,o,s,c,l){this.tan||(this.tan=[],this.rm=[]),this.quad(e,t,n,r,i,a,o);for(let[e,t]of[[0,0],[1,0],[1,1],[0,1]])this.tan.push(s[0],s[1],s[2]),this.rm.push(e,t,c,l)}build(){if(!this.v)return null;let e=new x;return e.setAttribute(`position`,new s(this.p,3)),e.setAttribute(`normal`,new s(this.n,3)),e.setAttribute(`uv`,new s(this.uv,2)),e.setAttribute(`color`,new s(this.c,3)),this.tan&&(e.setAttribute(`aTan`,new s(this.tan,3)),e.setAttribute(`aRoom`,new s(this.rm,4))),e.setIndex(this.v>65535?new n(this.i,1):new p(this.i,1)),e.computeBoundingSphere(),e}};function gn(e,{srgb:t=!0,repeat:n=!1,aniso:r=8}={}){let i=Ne(e);return t&&(i.colorSpace=u),i.anisotropy=r,n&&(i.wrapS=i.wrapT=m),i}function _n(){let e=new Uint8Array(4096);for(let t=0;t<32;t++)for(let n=0;n<32;n++){let r=Math.hypot(n-16+.5,t-16+.5)/11.52,i=Math.max(0,Math.min(1,1.25-r))**1.5,a=(t*32+n)*4;e[a]=e[a+1]=e[a+2]=Math.round(20+235*i),e[a+3]=255}let t=new v(e,32,32);return t.wrapS=t.wrapT=m,t.magFilter=d,t.minFilter=r,t.generateMipmaps=!0,t.needsUpdate=!0,t}function vn(){let e=new Uint8Array(65536),t=Ue(99),n=Array.from({length:64},()=>t()),i=Array.from({length:64},()=>.3+t()*.7),a=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)};for(let t=0;t<64;t++)for(let r=0;r<256;r++){let o=Math.floor(r/64),s=(r%64+.5)/64,c=(t+.5)/64,l;if(o===0)l=(1-c)**1.9;else if(o===1){let e=Math.hypot(s-.5,c-.5)*2;l=Math.max(0,1-e)**1.6}else if(o===2)l=a(0,.16,Math.min(s,1-s,c,1-c));else{let e=r%64,t=.5*n[e]+.25*(n[(e+1)%64]+n[(e+63)%64]);l=Math.max(0,t-.25)*1.4*Math.max(0,1-c/i[e])**1.3+.15*(1-c)**2}let u=(t*256+r)*4;e[u]=e[u+1]=e[u+2]=0,e[u+3]=Math.round(255*l)}let o=new v(e,256,64);return o.magFilter=d,o.minFilter=r,o.generateMipmaps=!0,o.needsUpdate=!0,o}function yn(e){e.length&&ot().then(t=>{if(!t)return;let n=mt();for(let r of e){let e=(r.uv[0]+r.uv[2])/2,i=(r.uv[1]+r.uv[3])/2,a=Math.abs(r.uv[2]-r.uv[0])/2,o=Math.abs(r.uv[3]-r.uv[1])/2,s=Math.floor((e-a)*t.width),c=Math.ceil((e+a)*t.width),l=Math.floor((1-i-o)*t.height),u=Math.ceil((1-i+o)*t.height),d=0,f=0,p=0,m=0;for(let e=Math.max(0,l);e<Math.min(t.height,u);e++)for(let n=Math.max(0,s);n<Math.min(t.width,c);n++){let r=(e*t.width+n)*3;d+=t.linearRgb[r]??0,f+=t.linearRgb[r+1]??0,p+=t.linearRgb[r+2]??0,m++}m&&n.rect(r.c,r.n,r.u,r.w,r.h,[d/m,f/m,p/m],3)}n.commit(`tsSigns`,{mergeA:1e9,mergeGap:9,mergeMax:44})})}function bn({scene:e,gen:t}){let n=t.solids,r=t.zips,i=Ue(4242),a=Ue(1111),o=Ue(4404),s=Ue(5505),c=0,u=0;dn=[],Zt.length=0,Qt.length=0;let p=new hn,_=new hn,x=new hn,S=new Ge,D=new hn,A=new Ge,j=new hn,ee=new hn,N=new hn,te=new hn,ne=[.008,0,.242,1],re=[.256,0,.494,1],ie=[.506,0,.744,1],ae=[.752,0,.998,1],P=Y+.016,oe=(e,t,n,r,i)=>te.quad(e,t,[t[0]+n[0]*r,t[1]+n[1]*r,t[2]+n[2]*r],[e[0]+n[0]*r,e[1]+n[1]*r,e[2]+n[2]*r],[0,1,0],ne,[i,i,i]),F=(e,t,n,r,i,a=P)=>te.quad([e-n,a,t+r],[e+n,a,t+r],[e+n,a,t-r],[e-n,a,t-r],[0,1,0],re,[i,i,i]),se=(e,t,n,r,i,a=P)=>te.quad([e,a,r],[n,a,r],[n,a,t],[e,a,t],[0,1,0],ie,[i,i,i]),I=on(i),ce=on(a),L=(e,t,r,i,a,o,s,c)=>{c!==void 0&&S.setColor(c),S.box(e,t,r,i,a,o),n.box(e,t,r,i,a,o,s)},R=(e,t,n,r)=>[e.n[0]*(e.d+r)+e.r[0]*t,n,e.n[1]*(e.d+r)+e.r[1]*t],z=(e,t,n,r,i,a,o,s,c)=>{let l=R(e,t,r,a),u=R(e,n,i,o);L(Math.min(l[0],u[0]),r,Math.min(l[2],u[2]),Math.max(l[0],u[0]),i,Math.max(l[2],u[2]),s,c)},B=[[.35,1,.9],[1,.3,.65],[1,.75,.35],[.45,.6,1],[1,1,1]],le=[],de=[],fe=mt(),me=[],V=!1,he=[],H=(e,t,n,r,a,o,s={})=>{he.push({n:e.n,d:e.d,ta:t,tb:n,ya:r,yb:a+2.2});let c=s.frame??[1776671,2237222,2895153,1381655,3816255,1776671,7106162,9343124,12171442][Math.floor(i()*9)],l=s.sign||s.flush?0:s.gap??.3+i()*.6;l&&(o=Math.max(o,.4));let u=l?{...e,d:e.d+l}:e;if(l){S.setColor(2829616);let i=Math.max(2,Math.round((n-t)/3.2)+1);for(let o=0;o<i;o++){let s=t+.3+(n-t-.75)*o/(i-1);z(e,s,s+.15,r+.25,a-.25,0,l,`wall`)}for(let i of[r+.45,a-.65])z(e,t+.2,n-.2,i,i+.18,.03,l-.03,`wall`);let o=.7+Math.min(1.2,l*1.2);te.quad(R(e,t-o,r-o,.02),R(e,n+o,r-o,.02),R(e,n+o,a+o*.5,.02),R(e,t-o,a+o*.5,.02),[e.n[0],0,e.n[1]],ie,[.62,.62,.62])}z(u,t,n,r,a,0,o,`wall`,c);let d=!s.sign&&!s.flush&&n-t>5;d&&(o=Math.max(o,.6+i()*.5));let f=s.bezel??(d?.26+i()*.3:.16+i()*.22),m=o+.012,h=[u.n[0],0,u.n[1]],g=n-t-2*f,v=a-r-2*f,y=R(u,(t+n)/2,0,0),b=s.uv??(s.sign?fn(i,g/v):sn(i,g/v,I,y[0]+(r+a)*.15,y[2])),C=!!s.vinyl&&!s.sign;!s.sign&&!C&&!s.noSpill&&r<32&&le.push({f:e,ta:t,tb:n,ya:r,yb:a,off:l+o,avg:b.avg}),!s.sign&&!C&&!s.noHalo&&b.avg&&n-t>2.5&&de.push({f:e,ta:t,tb:n,ya:r,yb:a,avg:b.avg});let w=s.sign?_:C?N:p,T=s.bright??(C?.85+i()*.2:.62+i()*.5);if(!s.sign&&!C&&b.avg){let e=b.avg,t=.2126*e[0]+.7152*e[1]+.0722*e[2];T*=Math.min(1.45,Math.max(.55,(.15/(t+.02))**.5))}if(w.quad(R(u,t+f,r+f,m),R(u,n-f,r+f,m),R(u,n-f,a-f,m),R(u,t+f,a-f,m),h,b,[T,T,T]),!C&&!s.sign?(fe.rect(R(u,(t+n)/2,(r+a)/2,m-.05),h,[u.r[0],0,u.r[1]],g,v,b.avg,1,{uv:b}),g*v>30&&l&&fe.halo(R(u,(t+n)/2,(r+a)/2,-l+Math.min(1.5,l+m-.15)),h,[u.r[0],0,u.r[1]],g,v,b.avg)):C?fe.rect(R(u,(t+n)/2,(r+a)/2,m+.02),h,[u.r[0],0,u.r[1]],g,v,b.avg,1,{uv:b,printed:!0}):s.sign&&me.push({c:R(u,(t+n)/2,(r+a)/2,m+.06),n:h,u:[u.r[0],0,u.r[1]],w:g,h:v,uv:b}),s.sign)return;if(C){let e=.1;S.setColor(c),z(u,t,n,a-f,a,o,o+e,`wall`),z(u,t,n,r,r+f,o,o+e,`wall`),z(u,t,t+f,r+f,a-f,o,o+e,`wall`),z(u,n-f,n,r+f,a-f,o,o+e,`wall`);let i=Math.max(2,Math.round((n-t)/3.4)),s=.9+Math.min(.8,(a-r)*.05);for(let e=0;e<i;e++){let r=t+(n-t)*(e+.5)/i;S.setColor(2500651),z(u,r-.035,r+.035,a+.05,a+.12,o,o+s,`pole`),z(u,r-.035,r+.035,a-.25,a+.12,o+.02,o+.1,`pole`),z(u,r-.2,r+.2,a-.02,a+.16,o+s-.05,o+s+.22,`pole`);let c=R(u,r-.18,a-.025,o+s-.03),l=R(u,r+.18,a-.025,o+s+.2);x.quad([c[0],a-.025,c[2]],[l[0],a-.025,c[2]],[l[0],a-.025,l[2]],[c[0],a-.025,l[2]],[0,-1,0],[.5,.5,.5,.5],[1,.93,.8])}return}let E=s.lip??(d?.14+i()*.16:.06+i()*.06);S.setColor(c),z(u,t,n,a-f,a,o,o+E,`wall`),z(u,t,n,r,r+f,o,o+E,`wall`),z(u,t,t+f,r+f,a-f,o,o+E,`wall`),z(u,n-f,n,r+f,a-f,o,o+E,`wall`);let D=s.trim===`bulbs`?0:s.trim===`cols`?.3:s.trim===`bar`?.5:s.trim===`none`?1:i(),O=o+E+.01,k=(e,t,n,r,i,a,o,s=O)=>{let c=i?n-e:r-t;x.quad(R(u,e,t,s),R(u,n,t,s),R(u,n,r,s),R(u,e,r,s),h,o?i?[0,0,c/o,1]:[0,0,1,c/o]:[.5,.5,.5,.5],a)};if(D<.2&&!s.noTrim){let e=[1,.82,.55],i=.34;k(t,a-i,n,a,!0,e,i),k(t,r,n,r+i,!0,e,i),k(t,r+i,t+i,a-i,!1,e,i),k(n-i,r+i,n,a-i,!1,e,i)}else if(D<.36&&s.trim===`cols`&&a-r>6&&!s.noTrim){let s=B[Math.floor(i()*2)],c=o+.3;for(let i of[t-.9,n+.35])z(u,i,i+.55,r,a,0,o+.28,`wall`,1447706),l&&z(e,i+.2,i+.35,r+.4,a-.4,0,l,`wall`,2829616),x.quad(R(u,i+.08,r+.3,c),R(u,i+.47,r+.3,c),R(u,i+.47,a-.3,c),R(u,i+.08,a-.3,c),h,[0,0,1,(a-r)/.8],s)}else if(D<.56){let e=B[Math.floor(i()*B.length)],o=.12+i()*.18;k(t,a-o,n,a,!0,e,0),i()<.6&&k(t,r,n,r+o,!0,e,0)}if(s.edgeLed){let e=s.edgeLed;k(t,r,t+.09,a,!1,e,0),k(n-.09,r,n,a,!1,e,0)}if(d&&l&&s.rig&&a-r>4){let e=a+.02,r=Math.min(s.rigH??1.3,.8+i()*.5),c=o*.2,l=Math.min(o,c+.5);S.setColor(3882562),z(u,t+.1,n-.1,e,e+.1,c,l,`pole`),z(u,t+.1,n-.1,e+r-.1,e+r,c,l,`pole`);let d=Math.max(2,Math.round((n-t)/1.4)+1);for(let i=0;i<d;i++){let a=t+.1+(n-t-.3)*i/(d-1);z(u,a,a+.09,e+.1,e+r-.1,c+.08,l-.08,`pole`)}let f=Math.max(2,Math.round((n-t)/4.5));for(let i=0;i<f;i++){let a=t+(n-t)*(i+.5)/f;S.setColor(2303272),z(u,a-.04,a+.04,e+r-.09,e+r-.01,l,o+E+.85,`pole`),z(u,a-.17,a+.17,e+r-.32,e+r-.02,o+E+.72,o+E+1.02,`pole`);let s=R(u,a-.15,e+r-.325,o+E+.74),c=R(u,a+.15,e+r-.325,o+E+1);x.quad([s[0],s[1],s[2]],[c[0],s[1],s[2]],[c[0],s[1],c[2]],[s[0],s[1],c[2]],[0,-1,0],[.5,.5,.5,.5],[1,.95,.85])}}if(l&&!V&&!s.noWalk&&n-t>7&&(r<9.5||s.walk)&&i()<.2){let i=l+o+1,a=r-.14;S.setColor(2303015),z(e,t-.3,n+.3,a,a+.08,0,i,`roof`);for(let r=t-.25;r<n+.3;r+=1.55)z(e,r,r+.05,a+.08,a+1.1,i-.06,i-.01,`pole`);z(e,t-.3,n+.3,a+1.05,a+1.1,i-.07,i,`pole`),z(e,t-.3,n+.3,a+.56,a+.6,i-.06,i-.01,`pole`);for(let r=t+.4;r<n-.3;r+=3.2)z(e,r,r+.12,a-.55,a,0,i-.4,`wall`)}},ge={px:[1,0],nx:[-1,0],pz:[0,1],nz:[0,-1]},_e=(e,t,r,a,o,s,c,l=3.4,u=1.25,d={})=>{let f=ge[t],m=ge[r];for(let n of[t,r]){let t=ze(e,n);he.push({n:t.f.n,d:t.f.d,ta:-1e9,tb:1e9,ya:a-.5,yb:o+.6})}let h=[(f[0]||m[0])>0?e.x1:e.x0,(f[1]||m[1])>0?e.z1:e.z0],g=(e,t)=>[h[0]+f[0]*e+m[0]*t,h[1]+f[1]*e+m[1]*t],_=g(u-l,u-l);S.setColor(1908257);let v=(e,t)=>L(Math.min(e[0],t[0]),a,Math.min(e[1],t[1]),Math.max(e[0],t[0]),o,Math.max(e[1],t[1]),`wall`);v(g(0,u-l-s),g(u,u-l)),v(g(u-l-c,0),g(u-l,u)),S.cyl(_[0],a,_[1],l-.015,l-.015,o-a,20,!0),n.cyl(_[0],_[1],a,o,l,l,`wall`),S.setColor(2763824);for(let[e,t]of[[o,o+.34],[a-.3,a]]){let r=l+.32,i=u+.32;S.cyl(_[0],e,_[1],r,r,t-e,40,!0),n.cyl(_[0],_[1],e,t,r,r,`wall`);for(let[n,r]of[[g(0,u-l-s-.3),g(i,u-l)],[g(u-l-c-.3,0),g(u-l,i)]])L(Math.min(n[0],r[0]),e,Math.min(n[1],r[1]),Math.max(n[0],r[0]),t,Math.max(n[1],r[1]),`wall`)}let y=[];y.push([...g(u+.01,u-l-s),f]);for(let e=0;e<=12;e++){let t=e/12*Math.PI/2,n=Math.cos(t),r=Math.sin(t),i=[f[0]*n+m[0]*r,f[1]*n+m[1]*r];y.push([_[0]+i[0]*(l+.01),_[1]+i[1]*(l+.01),i])}y.push([...g(u-l-c,u+.01),m]);let b=[f[1],-f[0]];(b[0]!==m[0]||b[1]!==m[1])&&y.reverse();let C=[0];for(let e=1;e<y.length;e++)C.push(C[e-1]+Math.hypot(y[e][0]-y[e-1][0],y[e][1]-y[e-1][1]));let w=C[C.length-1],T=.18,E=g(u,u),D=d.uv??sn(i,w/(o-a-2*T),I,E[0]+(a+o)*.15,E[1]),O=d.k??.95+i()*.2,k=d.tile?w/Math.max(1,Math.round(w/d.tile)):w;if(d.tile){let e=[y[0]],t=[0];for(let n=1;n<y.length;n++){let r=y[n-1],i=y[n],a=C[n-1],o=C[n];for(let n=(Math.floor(a/k+1e-6)+1)*k;n<o-1e-4;n+=k){let s=(n-a)/(o-a),c=[r[2][0]+(i[2][0]-r[2][0])*s,r[2][1]+(i[2][1]-r[2][1])*s],l=Math.hypot(c[0],c[1])||1;e.push([r[0]+(i[0]-r[0])*s,r[1]+(i[1]-r[1])*s,[c[0]/l,c[1]/l]]),t.push(n)}e.push(i),t.push(o)}y.length=0,y.push(...e),C.length=0,C.push(...t)}{let e=0;for(let t=1;t<y.length;t++){let n=y[e],r=y[t],i=t===y.length-1,s=y[t][2],c=n[2][0]*s[0]+n[2][1]*s[1];if(!i&&c>.82)continue;let l=r[0]-n[0],f=r[1]-n[1],p=Math.hypot(l,f);if(p>.5){let i=[l/p,0,f/p],s=[i[2],0,-i[0]],c=y[Math.round((e+t)/2)][2];s[0]*c[0]+s[2]*c[1]<0&&(s[0]*=-1,s[2]*=-1);let m=d.tile?null:[D[0]+(D[2]-D[0])*C[e]/w,D[1],D[0]+(D[2]-D[0])*C[t]/w,D[3]];fe.rect([(n[0]+r[0])/2-s[0]*.05,(a+o)/2,(n[1]+r[1])/2-s[2]*.05],s,i,p,o-a-2*T,D.avg,1,m?{uv:m}:{}),fe.halo([(n[0]+r[0])/2-s[0]*u*.5,(a+o)/2,(n[1]+r[1])/2-s[2]*u*.5],s,i,p,o-a-2*T,D.avg)}e=t}}for(let e=1;e<y.length;e++){let t=y[e-1],n=y[e],r=Math.floor((C[e-1]+C[e])/2/k),i=D[0]+(D[2]-D[0])*(C[e-1]/k-r),s=D[0]+(D[2]-D[0])*(C[e]/k-r),c=[(t[2][0]+n[2][0])/2,0,(t[2][1]+n[2][1])/2];p.quad([t[0],a+T,t[1]],[n[0],a+T,n[1]],[n[0],o-T,n[1]],[t[0],o-T,t[1]],c,[i,D[1],s,D[3]],[O,O,O]);let l=B[(e+Math.floor(a))%2?0:1];for(let[e,r]of[[o-T,o],[a,a+T]]){let i=[t[0]+t[2][0]*.02,t[1]+t[2][1]*.02],a=[n[0]+n[2][0]*.02,n[1]+n[2][1]*.02];x.quad([i[0],e,i[1]],[a[0],e,a[1]],[a[0],r,a[1]],[i[0],r,i[1]],c,[.5,.5,.5,.5],l)}}},ve=[1776671,2237222,1381655,2895153],ye=[11120050,9343124,12895944],U=[10123840,8414255,11570506],be=()=>{let e=i(),t=e<.5?ve:e<.72?ye:e<.86?U:[14276302,15263456];return t[Math.floor(i()*t.length)]},W=[[1,.22,.55],[.25,.85,1],[1,.5,.15],[1,.14,.1],[.75,.4,1],[.95,.95,1]],xe=new hn,Se=(e,t,n,r,a,o={})=>{he.push({n:e.n,d:e.d,ta:t-.5,tb:n+.5,ya:r-.5,yb:a+.5});let s=[e.n[0],0,e.n[1]],c=o.col??W[Math.floor(i()*W.length)],l=o.dep??.3+i()*.2,u=pn(mn[Math.floor(i()*mn.length)],(n-t)/(a-r));i()<.65&&z(e,t-.25,n+.25,r-.18,a+.18,l-.07,l,`wall`,1118483),S.setColor(2763566);for(let i of[t+.35,(t+n)/2,n-.35])z(e,i-.04,i+.04,r+.15,a-.15,0,l-.07,`pole`);xe.quad(R(e,t,r,l+.025),R(e,n,r,l+.025),R(e,n,a,l+.025),R(e,t,a,l+.025),s,u,c),fe.point(R(e,(t+n)/2,(r+a)/2,l+.6),new f(c[0],c[1],c[2]),6+2*(n-t),7+(n-t),.35)},we=(e,t,n,r,a)=>H(e,t,n,r,a,.45,{bezel:.05,lip:.02,frame:ye[Math.floor(i()*3)],trim:`none`,noWalk:!0,edgeLed:i()<.6?[.85,.92,1]:null}),Ee=(e,t,n,r,a)=>H(e,t,n,r,a,.9+i()*.5,{gap:.25,bezel:.3+i()*.2,lip:.18,frame:be(),trim:i()<.4?`bar`:`none`,noWalk:!0,noHalo:!0}),Oe=(e,t,r,a,o,s=3.8)=>{he.push({n:e.n,d:e.d,ta:t,tb:r,ya:a,yb:o+1});let c=[e.n[0],0,e.n[1]],l=.09,u=R(e,(t+r)/2,0,0),d=.88+i()*.16;N.quad(R(e,t,a,l),R(e,r,a,l),R(e,r,o,l),R(e,t,o,l),c,sn(i,(r-t)/(o-a),I,u[0]+a*.15,u[2]),[d,d,d]),S.setColor(3816512),z(e,t-.08,r+.08,o,o+.1,0,.13,`wall`),z(e,t-.08,r+.08,a-.1,a,0,.13,`wall`),z(e,t-.1,t,a,o,0,.13,`wall`),z(e,r,r+.1,a,o,0,.13,`wall`);let f=Math.max(2,Math.round((r-t)/2.5)),p=(r-t)/f;for(let n=1;n<f;n++){let r=t+n*p;te.quad(R(e,r-.04,a,.096),R(e,r+.04,a,.096),R(e,r+.04,o,.096),R(e,r-.04,o,.096),c,ie,[.5,.5,.5])}for(let n=a+s*(.3+i()*.4);n<o-.3;n+=s)te.quad(R(e,t,n,.096),R(e,r,n,.096),R(e,r,n+.35,.096),R(e,t,n+.35,.096),c,ie,[.16,.16,.16]);let m=R(e,t,a,0),h=R(e,r,o,.11);n.box(Math.min(m[0],h[0]),a,Math.min(m[2],h[2]),Math.max(m[0],h[0]),o,Math.max(m[2],h[2]),`wall`)},je=(e,t,n,r,a,o)=>{let s=n-t,c=a-r,l=i();if(l<.34&&c>9){let l=Math.min(s,3.2+i()*2.8),u=Math.min(c,Math.max(l*3.2,c*(.7+i()*.3))),d=o?t:n-l;if(we(e,d,d+l,a-u,a),s-l>8&&i()<.5){let t=Math.min(s-l-2,4+i()*4),n=o?d+l+1.8:d-1.8-t,a=r+i()*Math.max(0,c-t/4-1);Se(e,n,n+t,a,a+t/4.2)}}else if(l<.58){let n=Math.min(s-.5,4+i()*5),a=n/4.2,o=t+(s-n)*i(),l=r+1+i()*Math.max(0,c-a-2);n>2.5&&Se(e,o,o+n,l,l+a)}else if(l<.8){let c=Math.min(s,4+i()*4),l=o?t:n-c,u=c*(.55+i()*.5),d=a-u;for(let t=0;t<2&&d>r&&(Ee(e,l,l+c,d,d+u),d-=u+2+i()*3,!(i()<.5));t++);}},Me=(e,t,n,r,a)=>{let o=a-r,s=i();if(s<.4)He(e,t,n,a-Math.min(o,1.25),Math.min(o,1.25)),o>3.4&&i()<.5&&He(e,t,n,a-2.9,1.1);else if(s<.62){let r=Math.min(o-.2,1.6+i()*1.2),s=Math.min(n-t-1,r*4.2),c=t+(n-t-s)*i();s>3&&Se(e,c,c+s,a-r-.1,a-.1)}else if(s<.82&&o>3){let r=2+Math.floor(i()*2),s=1.8+i(),c=Math.min(7,(n-t-(r-1)*s)/r),l=Math.min(o-.4,c*.6);if(c>2.5)for(let i=0;i<r;i++){let o=t+(n-t-r*c-(r-1)*s)/2+i*(c+s);Ee(e,o,o+c,a-l,a)}}},Ne=(e,t,n,r,a,o={})=>{let s=o.pad??1.8;t+=s,n-=s;let c=n-t,l=a-r;if(c<5||l<4)return;if(c>50){let s=t+c*(.42+i()*.16),l={...o,pad:0};Ne(e,t,s-1.2,r,a,l),Ne(e,s+1.2,n,r,a,l);return}let u=1.4+i()*1.2,d=l*(.6+i()*.32);l-d<u+2&&(d=l);let f=Math.min(c*(.55+i()*.25),d*3.2);c-f<u+3&&(f=c);let p=o.heroHi??i()<.5,m=i()<.62,h=p?n-f:t,g=h+f,_=m?a-d:r,v=_+d,y=v>=a-.01,b=i();b<.4?H(e,h,g,_,v,.5+i()*.7,{frame:be(),bezel:i()<.3?.05:.35+i()*.45,lip:i()<.3?.02:void 0,trim:i()<.45?`bar`:`none`,rig:y&&i()<.7}):b<.64&&!o.noWrap?Oe(e,h,g,_,v,o.fh):b<.8?H(e,h,g,_,v,.55+i()*.5,{frame:i()<.6?U[Math.floor(i()*3)]:1710620,bezel:.45+i()*.25,trim:`bulbs`,rig:y&&i()<.4}):H(e,h,g,_,v,.4,{vinyl:!0,frame:be(),walk:_<14});let x=p?t:g+u,S=p?h-u:n;S-x>=2.6&&je(e,x,S,r,a,p);let C=m?r:v+u,w=m?_-u:a;w-C>=1.4&&Me(e,h,g,C,w)},Pe=[9209472,7301732,3815478,10787468,5982782,2895409],Ie=[2763566,9314854,2380342,2307178,6965796,1381653,11041314,8003140],Le=(e,t,r)=>{let a=Y,o=4.65,s=[e.n[0],0,e.n[1]],c=Math.max(1,Math.round(r/3.6)),l=r/c,u=Math.floor(i()*8);for(let n=0;n<c;n++){let r=t+n*l,c=r+l,d=(u+n%2)%8,f=d%4/4+.004,p=1-Math.floor(d/4)/2-.004,m=.8+i()*.35;ee.room(R(e,r,a+.5,.035),R(e,c,a+.5,.035),R(e,c,o,.035),R(e,r,o,.035),s,[f,p-.49,f+.242,p],[m,m,m],[e.r[0],0,e.r[1]],c-r,o-a-.5)}oe(R(e,t-.6,P,.42),R(e,t+r+.6,P,.42),[e.n[0],0,e.n[1]],1.5,.5),S.setColor(1974050),z(e,t,t+r,a,a+.5,0,.06,`wall`),z(e,t,t+r,3.6,3.7,.035,.06,`wall`),z(e,t,t+r,o,4.73,0,.06,`wall`);for(let n=0;n<=c;n++){let i=t+n*l;z(e,Math.max(t,i-.05),Math.min(t+r,i+.05),a+.5,o,.035,.06,`wall`)}let d=t+(Math.floor(c/2)+.5)*l;z(e,d-.95,d-.87,a,3.6,.035,.06,`wall`),z(e,d+.87,d+.95,a,3.6,.035,.06,`wall`),S.setColor(12106943),z(e,d-.8,d+.8,1.1,1.16,.035,.06,`wall`),n.box(...(()=>{let n=R(e,t,a,0),i=R(e,t+r,o,.06);return[Math.min(n[0],i[0]),a,Math.min(n[2],i[2]),Math.max(n[0],i[0]),o,Math.max(n[2],i[2])]})(),`wall`);let f=Pe[Math.floor(i()*Pe.length)];for(let[n,i]of[[t-.55,t],[t+r,t+r+.55]])z(e,n,i,0,4.7,0,.42,`wall`,f),z(e,n-.02,i+.02,0,.45,0,.44,`wall`,2763308);z(e,t,t+r,4.73,4.7,0,.42,`wall`,f)},Re=(e,t,r)=>{let a=t+.6;for(;a<r-3;){let t=Math.min(r-.6-a,6+i()*9);if(t<3)break;H(e,a,a+t,5,7.25,.3,{sign:!0,bezel:.1,frame:1184276,bright:1.15}),Le(e,a,t);let o=t>6&&i()<.28,s=o?2.6+i()*.8:1.6,c=o?5.8:5,l=R(e,a,4.7,0),u=R(e,a+t,c,s);if(S.setColor(o?1710620:Ie[Math.floor(i()*Ie.length)]).box(Math.min(l[0],u[0]),4.7,Math.min(l[2],u[2]),Math.max(l[0],u[0]),c,Math.max(l[2],u[2])),n.box(Math.min(l[0],u[0]),4.7,Math.min(l[2],u[2]),Math.max(l[0],u[0]),c,Math.max(l[2],u[2]),`awning`),o){let n=[e.n[0],0,e.n[1]],r=s+.012,o=[1,.8,.5];_.quad(R(e,a+.35,4.95,r),R(e,a+t-.35,4.95,r),R(e,a+t-.35,5.55,r),R(e,a+.35,5.55,r),n,fn(i,(t-.7)/.6),[1,1,1]);let c=.2;for(let[i,s]of[[4.72,4.92],[5.58,5.78]])x.quad(R(e,a,i,r+.005),R(e,a+t,i,r+.005),R(e,a+t,s,r+.005),R(e,a,s,r+.005),n,[0,0,t/c,1],o);for(let[n,r]of[[a-.012,-1],[a+t+.012,1]]){let t=[e.r[0]*r,0,e.r[1]*r],i=R(e,n,4.72,.1),a=R(e,n,4.72,s),l=R(e,n,4.92,s),u=R(e,n,4.92,.1);x.quad(i,a,l,u,t,[0,0,(s-.1)/c,1],o);let d=R(e,n,5.58,.1),f=R(e,n,5.58,s),p=R(e,n,5.78,s),m=R(e,n,5.78,.1);x.quad(d,f,p,m,t,[0,0,(s-.1)/c,1],o)}let l=R(e,a+.2,4.695,.3),u=R(e,a+t-.2,4.695,s-.2);fe.point(R(e,a+t/2,4.3,s*.6),new f(1,.72,.42),10+2.5*t,12,.4),x.quad([l[0],4.695,l[2]],[u[0],4.695,l[2]],[u[0],4.695,u[2]],[l[0],4.695,u[2]],[0,-1,0],[0,0,Math.abs(u[0]-l[0])/.45,Math.abs(u[2]-l[2])/.45],[1,.9,.7]),a+=t+.8+i()*2;continue}let d=R(e,a+.3,4.695,1.1),p=R(e,a+t-.3,4.695,1.3);x.quad([d[0],4.695,d[2]],[p[0],4.695,d[2]],[p[0],4.695,p[2]],[d[0],4.695,p[2]],[0,-1,0],[.5,.5,.5,.5],[1,.92,.78]),a+=t+.8+i()*2}},ze=(e,t)=>t===`px`?{f:{n:[1,0],r:[0,-1],d:e.x1},t0:-e.z1,t1:-e.z0}:t===`nx`?{f:{n:[-1,0],r:[0,1],d:-e.x0},t0:e.z0,t1:e.z1}:t===`pz`?{f:{n:[0,1],r:[1,0],d:e.z1},t0:e.x0,t1:e.x1}:{f:{n:[0,-1],r:[-1,0],d:-e.z0},t0:-e.x1,t1:-e.x0},Ve=new hn,He=(e,t,n,r,a,o=i())=>{z(e,t,n,r,r+a,0,.4,`wall`,1315862);let s=[e.n[0],0,e.n[1]],c=.08,l=(n-t-2*c)/((a-2*c)*32);return Ve.quad(R(e,t+c,r+c,.412),R(e,n-c,r+c,.412),R(e,n-c,r+a-c,.412),R(e,t+c,r+a-c,.412),s,[o,0,o+l,1]),o+l},We=(e,t,n,r,a)=>{he.push({n:e.n,d:e.d,ta:t-.8,tb:t+.8,ya:n-.5,yb:r+.5}),z(e,t-.22,t+.22,n,r,0,a,`wall`,1710878);let o=R(e,t,0,a),s=sn(i,(a-.35)/(r-n-.5),I,o[0]+n*.15,o[2]);for(let i of[1,-1]){let o=t+i*.225,c=[e.r[0]*i,0,e.r[1]*i],l=i>0?a-.1:.25,u=i>0?.25:a-.1;p.quad(R(e,o,n+.25,l),R(e,o,n+.25,u),R(e,o,r-.25,u),R(e,o,r-.25,l),c,s,[1,1,1]),fe.rect(R(e,o+i*.06,(n+r)/2,(a+.15)/2),c,[e.n[0]*-i,0,e.n[1]*-i],a-.35,r-n-.5,s.avg)}x.quad(R(e,t-.2,n,a+.01),R(e,t+.2,n,a+.01),R(e,t+.2,r,a+.01),R(e,t-.2,r,a+.01),[e.n[0],0,e.n[1]],[0,0,1,(r-n)/.3],[1,.82,.55])},Ke=e=>{let t=ge[e];return[t[1],-t[0]]},qe=(e,t)=>{let n=Ke(e),r=ge[t];return n[0]===r[0]&&n[1]===r[1]};for(let e of t.reserves){if(!e.ts||!e.build)continue;let[t,n]=e.build.masses,r=null,l=e.face,d={[l]:[0,0],nz:[0,0],pz:[0,0]},f=3.4,p=1.25;for(let n of[`nz`,`pz`]){if(e.lot.sides[n]!==`street`||i()<.3)continue;let r=7+i()*8,a=5+i()*6,o=8.5+i()*3,u=0;for(;o<t.y1-8;){let e=Math.min(t.y1-.8-o,8+i()*12);if(e<6||(_e(t,l,n,o,o+e,r,a,f,p),u=o+e,o+=e+.75+i()*2.5,i()<.55))break}if(u&&u+4.6<t.y1+4.2&&s()<(c?.45:.9)){let e=3.3+s()*.8,i=cn(`L41`,0,[.27,.71]);i&&(_e(t,l,n,u+.55,u+.55+e,r,a,f,p,{uv:i,tile:(e-.36)*4.4,k:.62}),c++)}d[l][+!!qe(l,n)]=2.15+r+.6,d[n][+!!qe(n,l)]=2.15+a+.6}{let{f:e,t0:n,t1:r}=ze(t,l);i()<.55&&(He(e,n+.5+d[l][0],r-.5-d[l][1],7.4,.95),V=!0);let a=n+.5+d[l][0],o=r-.5-d[l][1];if(o-a>14&&i()<.7){let n=a+4+i()*(o-a-8),r=8.7+i()*3,s=Math.min(t.y1-1,r+14+i()*16);Ne(e,a,n-2,8.6,t.y1-.6),Ne(e,n+2,o,8.6,t.y1-.6),We(e,n,r,s,3.6+i()*1.4)}else if(o-a>24&&t.y1>22&&s()<(u?.4:.85)&&cn(`L42`,1.8)){let n=4.4+s()*.8,r=n/1.75,i=.55+s()*.3,c=3*n+2*i,l=3*r+2*i,d=a+3+s()*(o-a-c-6),f=d+c,p=Math.min(t.y1-1-l,9.2+s()*4),m=cn(`L42`,n/r);for(let t=0;t<3;t++)for(let a=0;a<3;a++){let o=d+t*(n+i),s=p+a*(r+i);H(e,o,o+n,s,s+r,.35,{uv:m,noTrim:!0,noWalk:!0,gap:.3,bright:.72,noHalo:t!==1||a!==1})}d-a>6&&Ne(e,a,d-2,8.6,t.y1-.6),o-f>6&&Ne(e,f+2,o,8.6,t.y1-.6),t.y1-.6-(p+l+2)>3&&Me(e,d,f,p+l+2,t.y1-.6),u++}else Ne(e,a,o,8.6,t.y1-.6);Re(e,n,r),V=!1}for(let n of[`nz`,`pz`]){if(e.lot.sides[n]!==`street`)continue;let{f:r,t0:a,t1:o}=ze(t,n),c=qe(n,l),u=Math.min(o-a,26+i()*12),f=c?o-u:a,p=c?o:a+u;c?p-=d[n][1]:f+=d[n][0];let m=3.4+s()*.9,h=m*1.8,g=Math.min(6,Math.floor((p-f-.8)/(m+.35)));if(g>=3&&t.y1-9-h>7&&s()<.45){let e=R(r,(f+p)/2,0,0),n=ln(!1,I(!1,e[0],e[2]),m/h),i=s()<.5,a=(f+p)/2-(g*m+(g-1)*.35)/2;for(let e=0;e<g;e++){let t=a+e*(m+.35);H(r,t,t+m,8.8,8.8+h,.3,{uv:n,vinyl:i,noTrim:!0,noWalk:!0,gap:.25,bright:i?.95:.8,noHalo:!0})}Me(r,f+.4,p-.4,8.8+h+2,t.y1-.6)}else Ne(r,f+.4,p-.4,8.4,t.y1-.6,{heroHi:c});Re(r,a,o);for(let e=0,n=c?o-u-3:a+u+3;e<2;e++){if(i()<.35)continue;let s=n+(c?-1:1)*e*(9+i()*6);if(s<a+2||s>o-2)continue;let l=8+i()*2,u=Math.min(t.y1-1,l+9+i()*9);u-l>6&&We(r,s,l,u,2.6+i()*.8)}}if(n){let{f:t,t0:r,t1:a}=ze(n,l),s=[`nz`,`pz`].filter(t=>e.lot.sides[t]===`street`);if(a-r>14&&n.y1-n.y0>60&&o()<.42){let e=a-r-1.6,i=Math.min(n.y1-n.y0-12,e*(1.45+o()*.35)),s=n.y0+2+o()*6,c=o()<.45,l=R(t,(r+a)/2,0,0);H(t,r+.8,r+.8+e,s,s+i,.5,{walk:!0,vinyl:c,rig:!c,bright:c?.95:void 0,noTrim:!0,uv:sn(o,Math.min(.74,e/i),I,l[0]+s*.15,l[2])})}else if(s.length&&i()<.55){let e=s[Math.floor(i()*s.length)],t=n.y0+3+i()*8,o=Math.min(n.y1-t-6,18+i()*26);o>10&&_e(n,l,e,t,t+o,Math.min(a-r-8,8+i()*8),6+i()*6,3,1.1)}else{let e=1+ +(i()<.35),o=n.y0+2+i()*6;for(let s=0;s<e&&o<n.y1-20;s++){let e=Math.min(n.y1-4-o,22+i()*34),c=Math.min(a-r-3,12+i()*14),l=r+1.5+i()*(a-r-3-c);s===0&&i()<.3?Oe(t,l,l+c,o,o+e):H(t,l,l+c,o,o+e,.5+i()*.8,{walk:!0,vinyl:i()<.15,rig:i()<.6,frame:be(),bezel:i()<.35?.05:void 0}),o+=e+2+i()*8}for(let e of s){if(i()<.45)continue;let t=ze(n,e),r=qe(e,l),a=Math.min(t.t1-t.t0-2,10+i()*10),o=Math.min(n.y1-n.y0-6,14+i()*26),s=r?t.t1-a-.8:t.t0+.8,c=n.y0+3+i()*10;H(t.f,s,s+a,c,c+o,.6,{rig:i()<.5})}}}if(n&&o()<.7){let{f:e,t0:t,t1:r}=ze(n,l),i=[e.n[0],0,e.n[1]],a=.9+o()*.5,s=.22+o()*.1,c=o()<.75?[.78,.9,.96]:B[Math.floor(o()*4)].map(e=>e*.85),u=.25+o()*.6;for(let o of[t+u,r-u-a])for(let t=n.y0+1.4;t<n.y1-1.5;t+=3.8)x.quad(R(e,o,t,.07),R(e,o+a,t,.07),R(e,o+a,t+s,.07),R(e,o,t+s,.07),i,[.5,.5,.5,.5],c)}if(n&&e.name===`tsqTowerW`&&e.lot.z1>-100&&e.lot.z0<-100&&n.y1>t.y1+22){let e=i;i=Ue(9109);let{f:r,t0:a,t1:o}=ze(n,l),s=a+2.2,c=Math.min(o-2,s+20),u=t.y1+(t.parapet??1.1)+.9,d=u+15;H(r,s,c,u,d,.6,{uv:cn(`L42`,(c-s-.6)/(d-u-.6))??ln(!0,49,(c-s-.6)/(d-u-.6)),gap:.5,bezel:.3,lip:.16,frame:1776671,trim:`bar`,noWalk:!0,noSpill:!0,noHalo:!0,bright:.38}),i=e}for(let n of[l,`nz`,`pz`])if(n===l||e.lot.sides[n]===`street`){let e=ze(t,n);oe(R(e.f,e.t0,P,0),R(e.f,e.t1,P,0),[e.f.n[0],0,e.f.n[1]],1.2,.42)}for(let n of e.build.masses){let r=n.p||{},a=r.style===q.CURTAIN,o=r.layer===K.RED||r.layer===K.BROWN?10130310:r.layer===K.LIME||r.layer===K.BUFF?11576719:a?3159356:r.layer===K.WHITE?12763579:8749434,s=r.floorH||3.8,c=r.gH||7,l=3+Math.floor(i()*3);if(n!==t)for(let e=n.y0+l*s;e<n.y1-s*1.5;e+=l*s){let t=Math.round((e-c)/s)*s+c-.22;L(n.x0-.1,t,n.z0-.1,n.x1+.1,t+(a?.3:.42),n.z1+.1,`ledge`,o)}if(n!==t)for(let e of[`px`,`nx`,`pz`,`nz`]){let t=ze(n,e),r=[t.f.n[0],0,t.f.n[1]],o=a?.35:.6,u=(e,n,i)=>te.quad(R(t.f,t.t0,e,.03),R(t.f,t.t1,e,.03),R(t.f,t.t1,e-n,.03),R(t.f,t.t0,e-n,.03),r,ae,[i,i,i]);u(n.y1-.95,Math.min(n.y1-n.y0-1,6+i()*8),o);for(let e=n.y0+l*s;e<n.y1-s*1.5;e+=l*s)u(Math.round((e-c)/s)*s+c-.24,2.5+i()*3,o*.6)}let u=a?.18:.45,d=a?.5:.85;if(L(n.x0-u,n.y1-d-.05,n.z0-u,n.x1+u,n.y1-.05,n.z1+u,`cornice`,o),a||L(n.x0-u*.55,n.y1-d-.35,n.z0-u*.55,n.x1+u*.55,n.y1-d-.05,n.z1+u*.55,`cornice`,o),r.style===q.PUNCHED||r.style===q.DECO){let a=r.floorH||3.8,o=r.margin??.4,s=n.y1+(n.parapet||0),c=r.style===q.PUNCHED?.1:.06;for(let l of[`px`,`nx`,`pz`,`nz`]){if(n===t&&e.lot.sides[l]!==`street`)continue;let u=(l===`px`||l===`nx`?n.z1-n.z0:n.x1-n.x0)-2*o,d=Math.max(1,Math.round(u/(r.bayW||2.4))),f=u/d,p=f*(r.winW||.5),m=a*(r.winH||.55),h=ze(n,l),g=h.f.n,_=Math.ceil((n.y0+.5-7)/a),v=Math.floor((s-7-1.2-a)/a);for(let e=_;e<=v;e++)for(let t=0;t<d;t++){if(i()>c)continue;let r=o+(t+.5)*f,s=7+e*a+(a-m)*.42,u=l===`pz`?n.x0+r:l===`nz`?n.x1-r:l===`px`?n.x1:n.x0,d=l===`pz`?n.z1:l===`nz`?n.z0:l===`px`?n.z1-r:n.z0+r,_=h.f.r[0]*u+h.f.r[1]*d;if(he.some(e=>e.n[0]===g[0]&&e.n[1]===g[1]&&Math.abs(e.d-h.f.d)<2.5&&_>e.ta-1.2&&_<e.tb+1.2&&s>e.ya-1.5&&s<e.yb))continue;let v=Math.min(p-.08,.62+i()*.12),y=.38+i()*.08,b=.3+i()*.12,x=[13222838,11775910,10328464,14078664,9276036][Math.floor(i()*5)];z(h.f,_-v/2,_+v/2,s+.02,s+.02+y,-.22,b,`equipment`,x),z(h.f,_-v/2+.05,_+v/2-.05,s+.07,s+y-.04,b,b+.012,`equipment`,5592143),z(h.f,_-v/2+.04,_-v/2+.08,s-.22,s+.02,0,b-.04,`pole`,3815994),z(h.f,_+v/2-.08,_+v/2-.04,s-.22,s+.02,0,b-.04,`pole`,3815994),te.quad(R(h.f,_-v/2-.1,s,.02),R(h.f,_+v/2+.1,s,.02),R(h.f,_+v/2+.1,s-1.2-i()*1.5,.02),R(h.f,_-v/2-.1,s-1.2-i()*1.5,.02),[g[0],0,g[1]],ae,[.45,.45,.45])}}}}if(n&&i()<.8){let{f:e,t0:a,t1:o}=ze(t,l),s=l===`px`?t.x1-n.x1:n.x0-t.x0;if(s>3.4){let n=Math.min(o-a-6,12+i()*10),c=a+3+i()*(o-a-6-n),l=c+n,u=t.y1,d=2.2+i()*2.4,f=u+d,p=f+Math.min(10,n*(.38+i()*.2)),m=Math.min(s-1.6,1.9),h={...e,d:e.d+-1.15-.55};S.setColor(3422011);let g=Math.max(3,Math.round(n/3)+1);for(let t=0;t<g;t++){let r=c+.2+(n-.6)*t/(g-1);z(e,r,r+.2,u,f+.2,-1.9,-1.7,`pole`),z(e,r,r+.2,u,p-.6,-1.7-m,-1.5-m,`pole`),z(e,r+.04,r+.16,u+d*.5,u+d*.5+.14,-1.5-m,-1.9,`pole`),z(e,r+.04,r+.16,f+(p-f)*.5,f+(p-f)*.5+.14,-1.5-m,-1.7,`pole`)}for(let t of[u+.9,u+d-.3,f+(p-f)*.72])z(e,c,l,t,t+.16,-1.7-m,-1.54-m,`pole`);z(e,c,l,u+d*.5,u+d*.5+.14,-1.9,-1.7599999999999998,`pole`),S.setColor(2500651),z(e,c-.3,l+.3,f-.12,f-.04,-1.7,-.6499999999999999,`roof`),z(e,c-.3,l+.3,f+.9,f+.95,-.71,-.6499999999999999,`pole`);for(let t=c-.3;t<l+.3;t+=1.8)z(e,t,t+.05,f-.04,f+.9,-.71,-.6599999999999999,`pole`);H(h,c,l,f+.05,p,.55,{flush:!0,vinyl:i()<.5,noWalk:!0,noSpill:!0,noHalo:!0}),he.push({n:e.n,d:e.d-s,ta:c-1,tb:l+1,ya:u,yb:p+1.5}),r=[c,l]}}{let n=i;i=a;let{f:o,t0:s,t1:c}=ze(t,l);for(let n of[`nz`,`pz`]){if(e.lot.sides[n]!==`street`||a()<.3)continue;let i=qe(l,n),u=7+a()*8,d=.6+a()*3.2,f=Math.min(9,u*(.42+a()*.4)),p=i?c-u-.5-a()*2.5:s+.5+a()*2.5,m=p+u;if(r&&p<r[1]+1.5&&m>r[0]-1.5)continue;let h=(e,n,r,i)=>{let o=t.y1,s=o+1.1+d,c=s+f,l={...e,d:e.d-i-.55},u=1.4;S.setColor(3356218);let p=Math.max(2,Math.round((r-n)/3.2)+1);for(let t=0;t<p;t++){let a=n+.25+(r-n-.7)*t/(p-1);z(e,a,a+.2,o,c-.4,-i-.8,-i-.58,`pole`),z(e,a,a+.2,o,s+(c-s)*.6,-i-.6-u,-i-.4-u,`pole`),z(e,a+.04,a+.16,o+(s-o)*.5,o+(s-o)*.5+.14,-i-.45-u,-i-.75,`pole`),z(e,a+.04,a+.16,s+(c-s)*.55,s+(c-s)*.55+.14,-i-.45-u,-i-.75,`pole`)}for(let t of[s-.3,s+(c-s)*.55])z(e,n,r,t,t+.16,-i-.6-u,-i-.44-u,`pole`);z(e,n,r,s-.45,s-.3,-i-.8,-i-.6,`pole`);let m=R(e,(n+r)/2,0,0);H(l,n,r,s,c,.55,{flush:!0,noWalk:!0,noSpill:!0,noHalo:!0,vinyl:a()<.3,uv:sn(a,(r-n)/f,ce,m[0]+s*.15,m[2])})};if(h(o,p,m,.35),a()<.5){let e=ze(t,n),r=qe(n,l),i=Math.min(e.t1-e.t0-4,5+a()*5),o=r?e.t1-i-3.2:e.t0+3.2;i>3&&h(e.f,o,o+i,.35)}}i=n}}{let e=X.oneTS,a=t.tile((e.x0+e.x1)/2,(e.z0+e.z1)/2),o={floorH:3.9,bayW:1.5,winW:.9,winH:.6,layer:K.METAL,base:K.GRANITE,seed:88,margin:0,depth:.05,tint:[.42,.44,.48]},s={style:q.CURTAIN,gH:6};for(let t of[a.fac,a.lod])t.box(e.x0,Y,e.z0,e.x1,e.h,e.z1,{...o,topY:e.h,baseY:Y},{px:s,nx:s,pz:s,nz:s},!0,!1);n.box(e.x0,Y,e.z0,e.x1,e.h,e.z1,`wall`);for(let t of[`px`,`nx`,`pz`,`nz`]){let n=ze(e,t);oe(R(n.f,n.t0,P,0),R(n.f,n.t1,P,0),[n.f.n[0],0,n.f.n[1]],1.4,.5)}t.footprints.push({x0:e.x0,z0:e.z0,x1:e.x1,z1:e.z1,h:e.h+18,kind:`tower`}),t.boxes.push({min:[e.x0,0,e.z0],max:[e.x1,e.h+18,e.z1]}),r.edge(e.x0+.12,e.z0,e.x0+.12,e.z1,e.h,-1,0),r.edge(e.x1-.12,e.z0,e.x1-.12,e.z1,e.h,1,0),r.edge(e.x0,e.z0+.12,e.x1,e.z0+.12,e.h,0,-1),r.edge(e.x0,e.z1-.12,e.x1,e.z1-.12,e.h,0,1);let c={n:[0,-1],r:[-1,0],d:-e.z0};{let t=0,n=-1;st.forEach((e,r)=>{let i=Math.max(...e),a=Math.min(...e),o=i>.08?(i-a)/i*Math.sqrt(i):0;o>n&&(n=o,t=r)});let r=sn(i,1.25,()=>t,0,e.z0),a=(e.x1-e.x0+1.2)/4;for(let t=0;t<3;t++)for(let n=0;n<4;n++){let i=-e.x1-.6+n*a,o=8.5+t*3;H(c,i+.12,i+a-.12,o,o+2.8,.7+t%2*.12,{uv:r,bezel:.12,noTrim:!0,noWalk:!0,gap:.3,bright:1.05,frame:1710877})}}H(c,-e.x1-2.6,-e.x0+1.4,17.6,26.4,1.6,{bright:1.08,noWalk:!0});{let t=(i()-.5)*3;H(c,-e.x1-.6,t-.3,27.2,38.6,.9,{bright:.95}),H(c,t+.3,-e.x0+.9,27.8,37.4,1.5,{bright:1.1})}H(c,-e.x1-.4,-e.x0+.4,39.6,44.4,1.1,{noTrim:!0});{let t=45.4,n=92.5,r=-e.x1-1,i=-e.x0+1;H(c,r,i,t,n,1.4,{bright:1.12,noTrim:!0,walk:!1,noWalk:!0});for(let e of[r-.75,i+.1]){z(c,e,e+.65,45,92.9,0,1.75,`wall`,1316119);let r=1.76,i=[c.n[0],0,c.n[1]];x.quad(R(c,e+.12,t,r),R(c,e+.53,t,r),R(c,e+.53,n,r),R(c,e+.12,n,r),i,[0,0,1,47.1/.9],[.35,1,.9])}}Re(c,-e.x1,-e.x0),He({n:[-1,0],r:[0,1],d:-e.x0},e.z0+.4-.4,e.z0+16,7.35,.95),He(c,-e.x1-.4,-e.x0+.4,7.35,.95),He({n:[1,0],r:[0,-1],d:e.x1},-(e.z0+16),-e.z0+.4,7.35,.95);for(let t of[`px`,`nx`]){let n=t===`px`?{n:[1,0],r:[0,-1],d:e.x1}:{n:[-1,0],r:[0,1],d:-e.x0},r=t===`px`?[-(e.z0+16),-e.z0-.3]:[e.z0+.3,e.z0+16];for(let[e,t]of[[8.5,20],[21,38],[39,62]])H(n,r[0],r[1],e,t,.6);let i=t===`px`?[-e.z1+1,-(e.z0+17)]:[e.z0+17,e.z1-1];Re(n,i[0],i[1])}Ne({n:[0,1],r:[1,0],d:e.z1},e.x0+.5,e.x1-.5,8.6,40),S.setColor(3816512);let l=e.h,u=e.h+14,d=e.z0+4,f=e.z0+16;for(let[t,r]of[[e.x0+1,d],[e.x1-1.6,d],[e.x0+1,f-.6],[e.x1-1.6,f-.6]])S.box(t,l,r,t+.6,u,r+.6),n.box(t,l,r,t+.6,u,r+.6,`pole`);for(let t of[l+7,u-.6])S.box(e.x0+1,t,d,e.x1-1,t+.6,d+.6),S.box(e.x0+1,t,f-.6,e.x1-1,t+.6,f),n.box(e.x0+1,t,d,e.x1-1,t+.6,d+.6,`pole`),n.box(e.x0+1,t,f-.6,e.x1-1,t+.6,f,`pole`);S.cyl(0,u,(d+f)/2,.35,.2,18,8),n.cyl(0,(d+f)/2,u,u+18,.33,.19,`pole`),r.add(0,u+18,(d+f)/2,0,1,0,`antenna`),H(c,-e.x1+.5,-e.x0-.5,l+1.5,l+6.5,.7)}let Je=Y+.006,Ye=(e,t,n,r)=>D.quad([e,Je,r],[n,Je,r],[n,Je,t],[e,Je,t],[0,1,0],[e/9.6,-r/9.6,n/9.6,-t/9.6]);for(let e of X.plazaRows){let{c0:t,c1:n}=$t(e);Ye(-X.plazaX,t,-G.AV_HALF,n),Ye(G.AV_HALF,t,X.plazaX,n)}{let{c0:e,c1:t}=$t(-80);Ye(-G.AV_HALF-G.AV_WALK,e,G.AV_HALF+G.AV_WALK,t)}let Xe=Je+.003,Ze=new hn,Qe=(e,t,n,r,i)=>Ze.quad([e,Xe,r],[n,Xe,r],[n,Xe,t],[e,Xe,t],[0,1,0],[0,0,1,1],i),$e=[.3,.29,.28];for(let e of X.plazaRows){let{c0:t,c1:n}=$t(e);for(let e of[-1,1]){let r=e*G.AV_HALF,a=e*X.plazaX,o=(e,t,n,r,a=1.2)=>{let o=r-t>n-e,s=Math.max(1,Math.round((o?r-t:n-e)/a));for(let a=0;a<s;a++){let c=.86+i()*.28,l=$e.map(e=>e*c);o?Qe(e,t+(r-t)*a/s+.01,n,t+(r-t)*(a+1)/s-.01,l):Qe(e+(n-e)*a/s+.01,t,e+(n-e)*(a+1)/s-.01,r,l)}};o(Math.min(r,r+e*.9),t,Math.max(r,r+e*.9),n);for(let e=t+19.2;e<n-2;e+=19.2)o(Math.min(r,a),e,Math.max(r,a),e+.45,.9);for(let r of[11.6,22.4]){let i=e*(G.AV_HALF+r);o(Math.min(i,i+e*.45),t,Math.max(i,i+e*.45),n,.9)}o(Math.min(a,a-e*1.2),t,Math.max(a,a-e*1.2),n,1.5)}}{let e=X.tkts,t=(e.zFront-e.zBack)/e.n,a=.42;for(let r=0;r<e.n;r++){let i=e.zFront-r*t,o=Y+(r+1)*a;A.setColor(r%2?[.78,.74,.74]:[1,1,1]),A.box(e.x0,Be?Y+r*a:Y,e.zBack,e.x1,o,i,55),n.box(e.x0,Y,e.zBack,e.x1,o,i,`wall`)}let o=Y+e.n*a;oe([e.x0,P,e.zBack],[e.x0,P,e.zFront],[-1,0,0],1.4,.55),oe([e.x1,P,e.zFront],[e.x1,P,e.zBack],[1,0,0],1.4,.55),oe([e.x1,P,e.zBack],[e.x0,P,e.zBack],[0,0,-1],1.4,.55);for(let r=0;r<e.n;r++){let o=e.zFront-r*t+.012,s=Y+(r+1)*a;x.quad([e.x0,s-a+.02,o],[e.x1,s-a+.02,o],[e.x1,s-.06,o],[e.x0,s-.06,o],[0,0,1],[.5,.5,.5,.5],[.4,.05,.045]),x.quad([e.x0,s-.05,o],[e.x1,s-.05,o],[e.x1,s-.01,o],[e.x0,s-.01,o],[0,0,1],[.5,.5,.5,.5],[.5,.28,.25]),x.quad([e.x0,s+.004,o-.012],[e.x1,s+.004,o-.012],[e.x1,s+.004,o-.16],[e.x0,s+.004,o-.16],[0,1,0],[.5,.5,.5,.5],[.3,.16,.15]),S.setColor(3356219);for(let n of[e.x0-.04,e.x1+.005])S.box(n,Y,o-t,n+.035,s-.08,o+.012);S.setColor(8159366);for(let n of[e.x0-.05,e.x1+.005])S.box(n,s-.08,o-t,n+.045,s+.012,o+.012);S.setColor(11054514);for(let n of[e.x0+.08,(e.x0+e.x1)/2-.03,e.x1-.14])L(n,s,o-.08,n+.06,s+1,o-.02,`pole`),L(n-.01,s+.94,o-t,n+.07,s+1,o,`pole`);for(let r of[e.x0+.03,e.x1-.03])j.quad([r,s-.02,o],[r,s-.02,o-t],[r,s+1.08,o-t],[r,s+1.08,o],[r<(e.x0+e.x1)/2?-1:1,0,0],[0,0,1,1]),n.box(r-.02,s,o-t,r+.02,s+1.08,o,`glass`);if(r!==e.n-1)for(let n=e.x0+.6;n<e.x1-.5;n+=.62+i()*.5)if(i()<(r%3==1?.95:.74)){let i=Math.abs(Math.sin(n*12.9898+r*78.233)*43758.5453)%1;if(i<(r%3==1?.8:.55))continue;Zt.push({x:n+(i-.5)*.3,z:e.zFront-r*t-.12,y:s-.43,ry:(i*7.1%1-.5)*.6,mode:`sit`})}else Zt.push({x:n+(i()-.5)*.15,z:e.zFront-r*t-.12,y:s-.43,ry:(i()-.5)*.5,mode:`sit`})}H({n:[0,-1],r:[-1,0],d:-e.zBack},-e.x1+.15,-e.x0-.15,Y+.35,o-.1,.12,{noTrim:!0,bezel:.12,flush:!0,noSpill:!0}),S.setColor(10134440);for(let t of[e.x0+.05,e.x1-.1])S.box(t,o,e.zBack,t+.05,o+1.05,e.zBack+1.4);S.box(e.x0,o,e.zBack,e.x1,o+1.05,e.zBack+.06),n.box(e.x0,o,e.zBack,e.x1,o+1.05,e.zBack+.06,`glass`),e.zFront,r.edge(e.x0,e.zBack+.2,e.x1,e.zBack+.2,o,0,-1)}let tt=[],nt=(e,t,r,i,a)=>{tt.push([e-2,t-2,r+2,i+2]),S.setColor(2105636).box(e,Y,t,r,Y+a,i),n.box(e,Y,t,r,Y+a,i,`wall`),se(e-1,t-1,r+1,i+1,.7),S.setColor(5921888).box(e-.4,Y+a,t-.4,r+.4,Y+a+.5,i+.4),n.box(e-.4,Y+a,t-.4,r+.4,Y+a+.5,i+.4,`roof`);let o={x0:e,x1:r,z0:t,z1:i};for(let e of[`px`,`nx`,`pz`,`nz`]){let t=ze(o,e);H(t.f,t.t0+.3,t.t1-.3,Y+1.2,Y+a-.3,.12,{bezel:.12,bright:1.1,flush:!0})}};for(let e of X.plazaRows){let{z0:t,z1:n}=$t(e);e===-160?(nt(-34,t+8,-26,t+13,4.6),nt(24,n-16,31,n-10,4.2)):nt(26,t+10,33,t+15,4.4)}let J=[],it=[];for(let e of X.plazaRows){let{z0:t,z1:n}=$t(e);for(let e of[-1,1]){let r=X.tkts,a=(e,t,n,i,a,o=2.2)=>{let s=n/2,c=i/2;return e+s>r.x0-3&&e-s<r.x1+3&&t+c>r.zBack-3&&t-c<r.zFront+4||tt.some(([n,r,i,a])=>e+s>n-1&&e-s<i+1&&t+c>r-1&&t-c<a+1)||J.some(([r,a,s,c])=>Math.abs(r-e)<(s+n)/2+o&&Math.abs(a-t)<(c+i)/2+o)?!1:(J.push([e,t,n,i,a]),!0)};for(let r=t+3+i()*3;r<n-2.5;r+=8+i()*5){if(i()<.15)continue;let t=1.7+i()*.5;a(e*(G.AV_HALF+4.3+i()*.4),r,t,t,i()<.8?0:2)}for(let[r,o]of[[t+2.4,1],[n-2.4,-1]])for(let t=G.AV_HALF+10+i()*3;t<X.plazaX-4;t+=6.5+i()*4){if(i()<.3)continue;let n=1.6+i()*.6,s=i()<.25;a(e*t,r+o*(s?.4:0),s?n*2.4:n,n,s?3:i()<.85?0:2)}for(let r=0,o=0;r<4&&o<80;o++){let o=r<2,s=o?2.6+i()*.4:1.8+i()*.4;a(e*(G.AV_HALF+9+i()*(X.plazaX-G.AV_HALF-14)),t+10+i()*(n-t-20),s,s,o?4:1,5)&&r++}for(let r=t+1.5;r<n-1;r+=2.6)it.push([e*(G.AV_HALF+1.05),r])}}for(let e of X.endRows){let{z0:t,z1:n}=$t(e);if(e===-80)for(let e of[-1,1])for(let r=t+1.5;r<n-1;r+=2.6)it.push([e*(G.AV_HALF-.6),r])}for(let e of X.plazaRows){let{c0:t,c1:n}=$t(e),r=X.tkts;for(let e of[-1,1])for(let i=G.AV_HALF+2.4;i<X.plazaX-1;i+=2.2)for(let a of[t+.7,n-.7]){let t=e*i;t>r.x0-1&&t<r.x1+1&&a>r.zBack-1&&a<r.zFront+1||it.push([t,a])}}let at=[];for(let e of X.plazaRows){let{z0:t,z1:n}=$t(e);for(let e of[-1,1])for(let r=0;r<14;r++){let r=e*(17+i()*24),a=t+3+i()*(n-t-6),o=X.tkts;r>o.x0-2&&r<o.x1+2&&a>o.zBack-2&&a<o.zFront+2||J.some(([e,t,n,i])=>Math.abs(e-r)<n/2+2&&Math.abs(t-a)<i/2+2)||tt.some(([e,t,n,i])=>r>e&&r<n&&a>t&&a<i)||at.some(([e,t])=>Math.abs(e-r)<3&&Math.abs(t-a)<3)||at.push([r,a])}}let ot=e=>{let t=e===`ball`;t&&(e=!1);let n=Ue(t?29:e?19:9),r=t?new E(.47,16,12):e?new h(.5,1,14,6):new l(1,1,1,6,5,6);r.translate(0,.5,0);let i=r.attributes.position;for(let r=0;r<i.count;r++){let a=i.getX(r),o=i.getY(r),s=i.getZ(r);if(t){let e=1+.06*Math.sin(a*13+s*7)*Math.cos(o*11);i.setXYZ(r,a*e,.5+(o-.5)*e*.92,s*e);continue}if(!e){let e=1-.18*Math.max(0,Math.abs(a)+Math.abs(s)-.7)-.1*Math.max(0,o-.8)*(Math.abs(a)+Math.abs(s));a*=e,s*=e}let c=1+(n()-.5)*.1;i.setXYZ(r,a*c,o*(o>.02?1+(n()-.5)*.06:1),s*c)}r.computeVertexNormals();let a=new Ge,o=e?300:t?420:560;for(let r=0;r<o;r++){let r,i,o,s,c,l;if(t){let e=n()*2-1,t=n()*Math.PI*2,a=Math.sqrt(1-e*e);s=a*Math.cos(t),c=e,l=a*Math.sin(t),r=s*.47,i=.5+c*.47,o=l*.47}else if(e){i=n()*.95;let e=.5*(1-i)+.02,t=n()*Math.PI*2;r=Math.cos(t)*e,o=Math.sin(t)*e,s=Math.cos(t),c=.45,l=Math.sin(t)}else{let e=Math.floor(n()*5),t=n()-.5,a=n();if(e===4)r=t*.9,o=(n()-.5)*.9,i=1,s=0,c=1,l=0;else{let n=[1,-1,0,0][e],u=[0,0,1,-1][e];r=n*.5+(n?0:t),o=u*.5+(u?0:t),i=.05+a*.95,s=n,c=.15,l=u}}let u=.1+n()*.09,d=n()*Math.PI,f=new b().lookAt(new O(0,0,0),new O(s+(n()-.5)*.8,c+(n()-.5)*.8,l+(n()-.5)*.8),new O(0,1,0));f.multiply(new b().makeRotationZ(d)).setPosition(r+s*.03,i,o+l*.03);let p=.8+n()*.4;a.setColor([p,p,p]).setXf(f);let m=[a.vert(-u/2,-u/2,0,0,0,1,0,0),a.vert(u/2,-u/2,0,0,0,1,1,0),a.vert(u/2,u/2,0,0,0,1,1,1),a.vert(-u/2,u/2,0,0,0,1,0,1)];a.quad(m[0],m[1],m[2],m[3])}return a.setXf(null),{core:r,cards:a.build()}},ct=ot(!1),ut=ot(!0),dt=ot(`ball`),pt=new Ge;pt.setColor(9078400).box(-.5,.06,-.5,.5,.86,.5).setColor(10131087).box(-.54,.86,-.54,.54,1,.54).setColor(5591630).box(-.47,0,-.47,.47,.06,.47).setColor(4867908).box(-.506,.45,-.506,.506,.475,.506).box(-.506,.2,-.506,.506,.215,.506).setColor(3095333).box(-.46,.96,-.46,.46,1.005,.46);let gt=pt.build(),_t=new C({vertexColors:!0,roughness:.6,metalness:.35}),vt=gn(Xt+`ts_foliage.ktx2`,{aniso:4}),yt=new C({color:3096870,roughness:.95}),bt=new C({map:vt,color:12897464,alphaTest:.45,side:2,vertexColors:!0,roughness:.78}),xt=new k(gt,_t,Math.max(1,J.length)),St=[0,0,0];J.forEach(([,,,,e])=>{St[e===3?0:e]++});let Ct=e=>[new k(e.core,yt,Math.max(1,J.length*4)),new k(e.cards,bt,Math.max(1,J.length*4))],wt=[Ct(ct),Ct(ut),Ct(dt)],Tt=[0,0,0],Et=[[.78,.8,.84],[.82,.76,.7],[.42,.42,.44],[.62,.58,.55]],Dt=new b,Ot=new f;J.forEach(([e,t,r,a,o],s)=>{let c=o===4?.55+i()*.1:o===3?1:1.08+i()*.14;Dt.makeScale(r,c,a).setPosition(e,Y,t),xt.setMatrixAt(s,Dt);let l=Et[Math.floor(i()*Et.length)];xt.setColorAt(s,Ot.setRGB(l[0],l[1],l[2])),se(e-r*.5-.55,t-a*.5-.55,e+r*.5+.55,t+a*.5+.55,.6),n.box(e-r*.5,Y,t-a*.5,e+r*.5,Y+.86*c,t+a*.5,`equipment`),n.box(e-r*.54,Y+.86*c,t-a*.54,e+r*.54,Y+c,t+a*.54,`equipment`);let u=(e,t,n,r,i)=>{for(let i of[-.3,.3]){let a=i*r*2,o=Math.min(.13,r*.12),s=(r,i)=>e[0]?[t[0]+e[0]*(n+.006),i,t[1]+(a+r)*e[0]]:[t[0]-(a+r)*e[1],i,t[1]+e[1]*(n+.006)];x.quad(s(-o,Y+.12),s(o,Y+.12),s(o,Y+.26),s(-o,Y+.26),[e[0],0,e[1]],[.5,.5,.5,.5],[1,.93,.8])}};if(o!==4&&(u([0,1],[e,t],a/2,r/2),u([0,-1],[e,t],a/2,r/2),u([1,0],[e,t],r/2,a/2),u([-1,0],[e,t],r/2,a/2)),o===4){Qt.push({x:e,z:t,y:Y+c*.96,kind:`street`,sc:.7+i()*.25,clear:99}),n.cyl(e,t,Y+c,Y+c+3.2,.24,.2,`pole`);return}let d=o===3?0:o,[f,p]=wt[d],m=Tt[d]++,h=.8+i()*.4;if(o===1){let a=r*(.72+i()*.15),o=1.9+i()*1.3;Dt.makeScale(a,o,a).setPosition(e,Y+c,t),n.cyl(e,t,Y+c,Y+c+o,a*.5,.02,`equipment`)}else if(o===2){let a=r*(.8+i()*.18);Dt.makeScale(a,a,a).setPosition(e,Y+c-.05,t),n.cyl(e,t,Y+c,Y+c+a*.95,a*.45,a*.3,`equipment`)}else{let s=r>a,l=(s?r:a)*.97,u=(s?a:r)*.96,m=o===3?.8+i()*.45:1+i()*.55,g=Math.max(1,Math.min(4,Math.round(l/u))),_=l/g,v=(r,i,a)=>{let o=-l/2+_*(r+.5),d=s?e+o:e,f=s?t:t+o;Dt.makeScale(s?_*1.04:u*a,i,s?u*a:_*1.04).setPosition(d,Y+c,f);let p=(s?_*1.04:u)/2,m=(s?u:_*1.04)/2;n.box(d-p,Y+c,f-m,d+p,Y+c+i,f+m,`equipment`)};for(let e=1;e<g;e++){let t=Tt[d]++;v(e,m*(.9+i()*.2),.95+i()*.08),f.setMatrixAt(t,Dt),p.setMatrixAt(t,Dt),p.setColorAt(t,Ot.setRGB(h*(.9+i()*.2),h,h*(.85+i()*.2)))}v(0,m,1)}f.setMatrixAt(m,Dt),p.setMatrixAt(m,Dt),p.setColorAt(m,Ot.setRGB(h*(.9+i()*.2),h,h*(.85+i()*.2)))}),xt.count=J.length,wt.forEach(([e,t],n)=>{e.count=t.count=Tt[n]});let[[kt,At],[jt,Mt],[Nt,Pt]]=wt,Ft=new Ge;Ft.setColor(3816511).cyl(0,0,0,.16,.16,.08,14,!1).setColor(10133154).cyl(0,.08,0,.15,.15,.8,14,!1).setColor(2763822).cyl(0,.72,0,.152,.152,.05,14,!1).setColor(10791084).cyl(0,.88,0,.15,.1,.07,14,!1).cyl(0,.95,0,.1,.02,.05,14,!0);let It=Ft.build();for(let e=it.length-1;e>=0;e--)i()<.12&&it.splice(e,1);let Lt=new k(It,new C({vertexColors:!0,roughness:.38,metalness:.75}),Math.max(1,it.length)),Rt=[[1,1,1],[.85,.84,.8],[.28,.28,.3],[.62,.63,.64],[.95,.93,.88]];it.forEach(([e,t],r)=>{let a=.84+i()*.1,o=.82;Dt.makeScale(o,a,o).setPosition(e,Y,t),Lt.setMatrixAt(r,Dt),F(e,t,.34,.34,.55);let s=Rt[Math.floor(i()*Rt.length)];Lt.setColorAt(r,Ot.setRGB(s[0],s[1],s[2])),n.cyl(e,t,Y,Y+.88*a,.155*o,.155*o,`pole`),n.cyl(e,t,Y+.88*a,Y+a,.15*o,.02*o,`pole`)}),Lt.count=it.length;let zt=[{ch:[[.75,0],[-.75,0],[0,.75],[0,-.75]],col:10692138},{ch:[[.75,0],[-.75,0]],col:3825482},{ch:[[.75,0],[0,.75],[0,-.75]],col:9212052}],Ht=e=>{let t=new Ge;t.setColor(2895408).cyl(0,0,0,.05,.05,.72,6,!1).cyl(0,.72,0,.4,.4,.04,12,!0);for(let[n,r]of e.ch){t.setColor(e.col).box(n-.22,.44,r-.22,n+.22,.48,r+.22);let i=Math.sign(n)*.2,a=Math.sign(r)*.2;t.box(n+i-(i?.02:.22),.48,r+a-(a?.02:.22),n+i+(i?.02:.22),.9,r+a+(a?.02:.22));for(let[e,i]of[[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]])t.setColor(2895408).box(n+e-.015,0,r+i-.015,n+e+.015,.44,r+i+.015)}return t.build()},en=[12071980,2775690,14196778,3107386,15262422,2042426,13157040],tn=new C({vertexColors:!0,roughness:.5,metalness:.6}),nn=zt.map(e=>new k(Ht(e),tn,Math.max(1,at.length))),rn=[0,0,0];at.forEach(([e,t],r)=>{let a=Math.floor(i()*3),o=zt[a];if(Dt.makeTranslation(e,Y,t),nn[a].setMatrixAt(rn[a]++,Dt),F(e,t,1.15,1.15,.4),n.box(e-.4,Y,t-.4,e+.4,Y+.76,t+.4,`equipment`),i()<.45){let r=en[Math.floor(i()*en.length)],a=1.2+i()*.3;S.setColor(9080208).cyl(e,Y+.76,t,.025,.025,1.7,6,!1),n.cyl(e,t,Y+.76,Y+2.4,.03,.03,`pole`),S.setColor(r).cyl(e,Y+2.2,t,a,.03,.42,10,!0),n.cyl(e,t,Y+2.2,Y+2.62,a,.03,`awning`),S.setColor(r).cyl(e,Y+2.08,t,a,a,.12,10,!1),F(e,t,a+.5,a+.5,.3)}for(let[r,i]of o.ch)n.box(e+r-.22,Y,t+i-.22,e+r+.22,Y+.48,t+i+.22,`equipment`);for(let[n,r]of o.ch)i()<.55&&Zt.push({x:e+n*.81,z:t+r*.81,y:Y,ry:Math.atan2(-n,-r),mode:`sit`})}),nn.forEach((e,t)=>{e.count=rn[t]});let an=nn[0];an.name=`tsCafe`;let un=[...J.map(([e,t,n,r])=>[e,t,Math.max(n,r)*.6+.8]),...at.map(([e,t])=>[e,t,1.8]),...tt.map(([e,t,n,r])=>[(e+n)/2,(t+r)/2,Math.max(n-e,r-t)/2])],bn=(e,t,n)=>{let r=X.tkts;return e>r.x0-n-1&&e<r.x1+n+1&&t>r.zBack-n-1&&t<r.zFront+n+1?!1:!un.some(([r,i,a])=>Math.hypot(r-e,i-t)<a+n)},xn=(e,t,r)=>{let a=1.9,o=.95,s=r===`x`?a/2:o/2,c=r===`x`?o/2:a/2;L(e-s,Y+.25,t-c,e+s,Y+1.15,t+c,`equipment`,11120048),se(e-s-.5,t-c-.5,e+s+.5,t+c+.5,.6),F(e,t,1.3,1.3,.25),L(e-s-.04,Y+1.15,t-c-.04,e+s+.04,Y+1.22,t+c+.04,`equipment`,6974832),S.setColor(1710618);for(let[n,r]of[[-1,-1],[1,-1],[-1,1],[1,1]])S.cyl(e+n*(s-.2),Y,t+r*(c-.12),.2,.2,.25,8,!0);n.box(e-s,Y,t-c,e+s,Y+.25,t+c,`equipment`),S.setColor(9080208).cyl(e,Y+1.22,t,.03,.03,1.2,6,!1),n.cyl(e,t,Y+1.22,Y+2.42,.03,.03,`pole`),S.setColor(en[Math.floor(i()*en.length)]).cyl(e,Y+2.2,t,1.25,.02,.45,12,!0),n.cyl(e,t,Y+2.2,Y+2.65,1.25,.02,`awning`);let l=r===`x`?{n:[0,-1],r:[-1,0],d:-(t-c)}:{n:[-1,0],r:[0,1],d:-(e-s)},u=r===`x`?-(e+s)+.15:t-c+.15;H(l,u,u+a-.3,Y+.55,Y+1,.02,{sign:!0,bezel:.03,frame:2763306,bright:1})},Sn=(e,t,n)=>{let r=3.2,i=1.8,a=2.7;L(e-r/2,Y,t-i/2,e+r/2,Y+a,t+i/2,`wall`,2379834),se(e-r/2-.8,t-i/2-.8,e+r/2+.8,t+i/2+.8,.65),L(e-r/2-.25,Y+a,t-i/2-.25,e+r/2+.25,Y+a+.18,t+i/2+.25,`roof`,1784362),S.setColor(13616814).box(e-r/2-.015,Y+a-.28,t-i/2-.015,e+r/2+.015,Y+a-.02,t+i/2+.015),S.setColor(1711131).box(e-r/2-.015,Y,t-i/2-.015,e+r/2+.015,Y+.22,t+i/2+.015);for(let[n,o]of[[-1,-1],[1,-1],[-1,1],[1,1]])L(e+n*r/2-.09,Y+.22,t+o*i/2-.09,e+n*r/2+.09,Y+a-.28,t+o*i/2+.09,`wall`,3104325);x.quad([e-r/2-.1,Y+a-.005,t-i/2-.2],[e+r/2+.1,Y+a-.005,t-i/2-.2],[e+r/2+.1,Y+a-.005,t-i/2-.05],[e-r/2-.1,Y+a-.005,t-i/2-.05],[0,-1,0],[0,0,3.4000000000000004/.25,1],[1,.85,.6]);let o=ze({x0:e-r/2,x1:e+r/2,z0:t-i/2,z1:t+i/2},n);H(o.f,o.t0+.2,o.t1-.2,Y+a-.55,Y+a-.1,.03,{sign:!0,bezel:.03,frame:1454116,bright:1});for(let e=0;e<3;e++)H(o.f,o.t0+.25+e*.95,o.t0+1.1+e*.95,Y+.9,Y+1.9,.12,{bezel:.04,frame:3158064,noTrim:!0,bright:.8,flush:!0,noSpill:!0})},Cn=(e,t)=>{L(e-1.2,Y,t-1.2,e+1.2,Y+2.8,t+1.2,`wall`,15001320),se(e-2,t-2,e+2,t+2,.6),L(e-1.22,Y+2.2,t-1.22,e+1.22,Y+2.55,t+1.22,`wall`,2047882),L(e-1.35,Y+2.8,t-1.35,e+1.35,Y+2.95,t+1.35,`roof`,2763824),L(e-.5,Y+2.95,t-.15,e+.5,Y+3.15,t+.15,`equipment`,3158584),x.quad([e-.48,Y+2.97,t-.155],[e,Y+2.97,t-.155],[e,Y+3.13,t-.155],[e-.48,Y+3.13,t-.155],[0,0,-1],[.5,.5,.5,.5],[1,.2,.2]),x.quad([e,Y+2.97,t-.155],[e+.48,Y+2.97,t-.155],[e+.48,Y+3.13,t-.155],[e,Y+3.13,t-.155],[0,0,-1],[.5,.5,.5,.5],[.3,.45,1]);for(let n of[`px`,`nx`,`pz`,`nz`]){let r=ze({x0:e-1.2,x1:e+1.2,z0:t-1.2,z1:t+1.2},n);z(r.f,r.t0+.3,r.t1-.3,Y+1.1,Y+2.05,0,.015,`wall`,1713456)}},wn=(e,t)=>{L(e-.16,Y,t-.45,e+.16,Y+2.9,t+.45,`equipment`,2763823),L(e-.21,Y,t-.5,e+.21,Y+.12,t+.5,`equipment`,4606027),L(e-.17,Y+2.9,t-.46,e+.17,Y+2.98,t+.46,`equipment`,9080208);for(let n of[`px`,`nx`]){let r=ze({x0:e-.16,x1:e+.16,z0:t-.45,z1:t+.45},n);H(r.f,r.t0+.07,r.t1-.07,Y+.95,Y+2.75,.015,{bezel:.04,frame:1710620,noTrim:!0,flush:!0,noSpill:!0,bright:.85})}F(e,t,.75,1,.5)},Tn=(e,t,n,r)=>{let i=1.9,a=.5,o=(r,i,a,o,s,c,l)=>n?L(e+a,i,t+r,e+c,s,t+o,`equipment`,l):L(e+r,i,t+a,e+o,s,t+c,`equipment`,l);for(let e of[-.85,i/2-.18])o(e,Y,-.5/2,e+.08,Y+.42,a/2,2829615),o(e,Y+.42,r>0?a/2-.08:-.5/2,e+.08,Y+.86,r>0?a/2:-.5/2+.08,2829615);for(let e=0;e<4;e++){let t=-.5/2+a/4*e+.01;o(-1.9/2,Y+.42,t,i/2,Y+.46,t+a/4-.02,7035464)}for(let e of[.56,.7]){let t=r>0?a/2-.1:-.19;o(-1.9/2,Y+e,t,i/2,Y+e+.1,t+.04,7035464)}n?se(e-.6,t-1.3,e+.6,t+1.3,.45):se(e-1.3,t-.6,e+1.3,t+.6,.45)};for(let e of X.plazaRows){let{z0:t,z1:n}=$t(e);for(let e of[-1,1]){for(let r=t+9+i()*6;r<n-6;r+=20+i()*8){let t=e*(G.AV_HALF+3.1);bn(t,r,.9)&&(wn(t,r),un.push([t,r,1]))}for(let r=0,a=0;r<5&&a<40;a++){let a=i()<.6,o=e*(G.AV_HALF+5+i()*(X.plazaX-G.AV_HALF-10)),s=t+5+i()*(n-t-10);if(!bn(o,s,1.4))continue;let c=i()<.5?1:-1;Tn(o,s,a,c),un.push([o,s,1.4]),r++,i()<.6&&Zt.push({x:o+(a?-c*.05:(i()-.5)*1),z:s+(a?(i()-.5)*1:-c*.05),y:Y,ry:a?Math.atan2(-c,0):Math.atan2(0,-c),mode:`sit`})}}}let En=[];for(let e of X.plazaRows){let{z0:t,z1:n}=$t(e);for(let e of[-1,1]){for(let r=0,a=0;r<3&&a<30;a++){let a=e*(G.AV_HALF+3.6+i()*6),o=t+4+i()*(n-t-8);bn(a,o,1.6)&&(xn(a,o,`z`),un.push([a,o,1.8]),r++)}for(let r=t+6;r<n-4;r+=9+i()*5){let t=e*(G.AV_HALF+2.1);bn(t,r,.5)&&(En.push([t,r]),un.push([t,r,.5]))}for(let r=0;r<20;r++){let r=e*(X.plazaX-3.5),a=t+6+i()*(n-t-12);if(bn(r,a,2.2)){Sn(r,a,e<0?`px`:`nx`),un.push([r,a,2.4]);break}}}if(e===-160)for(let e=0;e<30;e++){let e=22+i()*14,r=t+10+i()*(n-t-20);if(bn(e,r,2)){Cn(e,r),un.push([e,r,2.2]);break}}}{let e=[11022378,2772874,13214252,3107386,13618372,1842206,3832480,8006482],t=(t,n,r,a,o)=>{let s=(e,i)=>t===`x`?[e,n+r*i]:[n+r*i,e],c=(e,t,n,r,i,a,o,c)=>{let l=s(e,n),u=s(t,r);L(Math.min(l[0],u[0]),i,Math.min(l[1],u[1]),Math.max(l[0],u[0]),a,Math.max(l[1],u[1]),o,c)},l=(t,n)=>{let r=e[Math.floor(i()*e.length)];c(t-.05,t+.05,n+.18,n+.28,Y,Y+.42,`pole`,2763565),c(t-.2,t+.2,n+.1,n+.36,Y,Y+.03,`equipment`,2763565),c(t-.24,t+.24,n,n+.46,Y+.42,Y+1.02,`equipment`,r),c(t-.26,t+.26,n-.02,n+.48,Y+1.02,Y+1.07,`equipment`,2829358),c(t-.19,t+.19,n+.46,n+.47,Y+.6,Y+.94,`equipment`,1844524),c(t-.2,t+.2,n+.46,n+.475,Y+.5,Y+.56,`equipment`,10132638),c(t+.06,t+.18,n+.3,n+.42,Y+1.07,Y+1.2,`equipment`,9079951),F(...s(t,n+.23),.45,.45,.45)},u=(e,t)=>{for(let[n,r]of[[-.2,.05],[.16,.05],[-.2,.47],[.16,.47]])c(e+n,e+n+.04,t+r,t+r+.04,Y,Y+.14,`pole`,1780821);c(e-.26,e+.26,t,t+.56,Y+.14,Y+1.02,`equipment`,2046586),c(e-.24,e+.24,t+.03,t+.53,Y+1.02,Y+1.16,`equipment`,2046586),c(e-.2,e+.2,t+.08,t+.48,Y+1.16,Y+1.22,`equipment`,2046586),c(e-.16,e+.16,t+.56,t+.575,Y+.86,Y+.95,`equipment`,12172478),F(...s(e,t+.28),.5,.5,.5)},d=a+1+i()*4;for(;d<o-2;){let e=i(),t=.5+i()*.2;if(e<.5){let e=2+Math.floor(i()*4),n=e*.56;if(d+n>o-1)break;let r=s(d+n/2,t+.25);if(!bn(r[0],r[1],n/2+.3)){d+=3;continue}for(let n=0;n<e;n++)l(d+.28+n*.56,t);if(un.push([r[0],r[1],n/2+.3]),i()<.6){let e=s(d+n+.55,t+.3);bn(e[0],e[1],.5)&&(En.push(e),un.push([e[0],e[1],.5]))}d+=n+6+i()*9}else if(e<.72){let e=s(d,t+.28);if(bn(e[0],e[1],.6)&&(u(d,t),un.push([e[0],e[1],.6])),i()<.7){let e=s(d+.9,t+.3);bn(e[0],e[1],.5)&&(En.push(e),un.push([e[0],e[1],.5]))}d+=7+i()*9}else{let e=s(d,t+.3);bn(e[0],e[1],.5)&&(En.push(e),un.push([e[0],e[1],.5])),d+=5+i()*8}}};for(let e of[...X.plazaRows,...X.endRows]){let{c0:n,c1:r}=$t(e),i=X.plazaRows.includes(e),a=i?X.plazaX+1:G.AV_HALF+G.AV_WALK+2,o=i?X.towerX-3:X.endX-3;for(let e of[-1,1]){for(let[i,s]of[[n,1],[r,-1]])e>0?t(`x`,i,s,a,o):t(`x`,i,s,-o,-a);if(i){let i=e*(G.AV_HALF+1.5),a=e;t(`z`,i,a,n+2,n+16),t(`z`,i,a,r-16,r-2)}}if(e===-320)for(let e of[-1,1])t(`z`,e*G.AV_HALF,e,n+3,r-3)}}let Dn=new Ge;Dn.setColor(2968116).cyl(0,0,0,.3,.33,.9,12,!1).setColor(2374186).cyl(0,.9,0,.35,.3,.12,12,!0);let On=new k(Dn.build(),new C({vertexColors:!0,roughness:.6,metalness:.5}),Math.max(1,En.length));On.count=En.length,On.name=`tsTrash`,En.forEach(([e,t],r)=>{Dt.makeTranslation(e,Y,t),On.setMatrixAt(r,Dt),F(e,t,.6,.6,.55),n.cyl(e,t,Y,Y+.9,.3,.33,`equipment`),n.cyl(e,t,Y+.9,Y+1.02,.35,.3,`equipment`)}),On.castShadow=On.receiveShadow=!0,On.computeBoundingSphere(),e.add(On);for(let t of[xt,kt,At,jt,Mt,Nt,Pt,Lt,...nn])t.castShadow=!0,t.receiveShadow=!0,t.computeBoundingSphere(),e.add(t);xt.name=`tsPlanters`,kt.name=`tsHedges`,Lt.name=`tsBollards`;{let e=X.tkts,t=(e,t,n,r)=>bn(e,t,.35)?(Zt.push({x:e,z:t,ry:n,mode:`stand`,clip:r}),un.push([e,t,.35]),!0):!1,n=[];for(let e of X.plazaRows){let{z0:t,z1:r}=$t(e);for(let e of[-1,1])n.push([e,t+1.5,r-1.5,G.AV_HALF+1.6,X.plazaX-1.2])}{let{z0:e,z1:t}=$t(-80);for(let r of[-1,1])n.push([r,e+1.5,t-1.5,X.oneTS.x1+.9,G.AV_HALF+G.AV_WALK-.8])}for(let[e,r,a,o,s]of n){let n=(a-r)*(s-o),c=Math.round(n/36),l=Math.round(n/19);for(let n=0;n<c;n++){let c=e*(o+i()*(s-o)),l=r+i()*(a-r),u=2+Math.floor(i()*i()*5),d=.45+u*.08,f=i()*6.28,p=i()<.35;for(let r=0;r<u;r++){let a=f+r/u*6.28+(i()-.5)*.5,o=c+Math.cos(a)*d,s=l+Math.sin(a)*d*.85;t(o,s,p?Math.atan2(n%2?e:-e,0)+(i()-.5)*1.2:Math.atan2(c-o,l-s),p?i()<.45?`lookUp`:i()<.5?`photo`:`phone`:i()<.7?`talk`:`idle`)}}for(let n=0;n<l;n++)t(e*(o+i()**1.05*(s-o)),i()<.3?i()<.5?r+i()**2*16:a-i()**2*16:r+i()*(a-r),i()*6.28,i()<.55?`phone`:`idle`)}for(let n=0;n<26;n++)t(e.x0-1+i()*(e.x1-e.x0+2),e.zFront+.8+i()*5,Math.PI+(i()-.5)*2,i()<.5?`phone`:`talk`);for(let e of[...X.plazaRows,...X.endRows]){let{c0:n,c1:r}=$t(e),a=X.plazaRows.includes(e),o=a?X.plazaX+.8:G.AV_HALF+G.AV_WALK+.8,s=a?X.towerX-1:X.endX-1;for(let e of[-1,1])for(let[a,c]of[[n,1],[r,-1]]){let n=Math.round((s-o)/2.6);for(let r=0;r<n;r++){let n=e*(o+i()**1.5*(s-o)),r=i();if(r<.35)t(n,a+c*(G.ST_WALK-.7-i()*.4),Math.atan2(0,c),i()<.5?`idle`:`phone`);else if(r<.55)t(n,a+c*(.8+i()*.4),Math.atan2(0,-c)+(i()-.5)*.8,i()<.5?`idle`:`phone`);else if(r<.8){let e=a+c*(1.4+i()*1.4),r=i()*6.28;t(n,e,r,`talk`)&&t(n+Math.sin(r)*.75,e+Math.cos(r)*.75,r+Math.PI,`talk`)}else t(n,a+c*(1.2+i()*2),i()*6.28,i()<.4?`lookUp`:`phone`)}}if(e===-320)for(let e of[-1,1])for(let a=0;a<26;a++){let a=n+2+i()*(r-n-4);i()<.4?t(e*(G.AV_HALF+G.AV_WALK-.8),a,Math.atan2(e,0),`idle`):t(e*(G.AV_HALF+.9+i()*3),a,i()*6.28,i()<.5?`phone`:`talk`)}}for(let e of Zt)e.mode===`stand`&&F(e.x,e.z,.42,.42,.5)}let kn=new hn,An=(e,t)=>{let n=(t%G.ST_SP+G.ST_SP)%G.ST_SP;if(n<G.ST_HALF||n>G.ST_SP-G.ST_HALF)return 0;if(Math.abs(e)<G.AV_HALF){let{c0:e,c1:n}=$t(-80);return t>e&&t<n?Y:0}return Y};for(let e of le){let{f:t,ta:n,tb:r,ya:i,yb:a,avg:o}=e;if(!o)continue;let s=r-n,c=a-i,l=(i+a)/2,u=Math.max(o[0],o[1],o[2],.02),d=Yt*Math.min(.7,s*c/(l*l*.6+30));if(d<.012)continue;let f=o.map(e=>e/u*(.35+Math.sqrt(u))*d),p=Math.min(30,6+l*1),m=n-s*.25,h=r+s*.25,g=Math.ceil(p/1.5);for(let e=0;e<g;e++){let i=e/g*p,a=(e+1)/g*p,o=R(t,(n+r)/2,0,(i+a)/2),s=An(o[0],o[2])+.03;kn.quad(R(t,m,s,i),R(t,h,s,i),R(t,h,s,a),R(t,m,s,a),[0,1,0],[0,1-i/p,1,1-a/p],f)}if(i<16){let e=.47,a=f.map(e=>e*.45);kn.quad(R(t,n-.5,Y,e),R(t,r+.5,Y,e),R(t,r+.5,i,e),R(t,n-.5,i,e),[t.n[0],0,t.n[1]],[0,.35,1,1],a)}}let jn=new hn;for(let e of de){let{f:t,ta:n,tb:r,ya:i,yb:a,avg:o}=e,s=r-n,c=a-i,l=Math.max(o[0],o[1],o[2],.02),u=Math.min(3.2,.9+.12*Math.min(s,c)),d=.035,f=[t.n[0],0,t.n[1]],p=.3*Math.min(1,Math.sqrt(s*c)/8),m=o.map(e=>e/l*(.3+Math.sqrt(l))*p),h=[n-u,n,r,r+u],g=[Math.max(Y+.05,i-u),i,a,a+u];for(let e=0;e<3;e++)for(let n=0;n<3;n++){if(e===1&&n===1)continue;let r=+(e===0),i=+(e===2),a=+(n===0),o=+(n===2);jn.quad(R(t,h[e],g[n],d),R(t,h[e+1],g[n],d),R(t,h[e+1],g[n+1],d),R(t,h[e],g[n+1],d),f,[r,a,i,o],m)}}let Mn=new hn,Nn=new hn,Pn=new hn,Fn=new hn,In=(e,t,n,r,i,a,o=0,s=[1,1,1])=>{let c=i%4/4,l=1-Math.floor(i/4)/4,u=Math.cos(o),d=Math.sin(o),f=(n,r)=>[e+n*u-r*d,a,t+n*d+r*u],p=l-.25,m=l;i===2&&(p=l-.15625,m=l-.09375),Mn.quad(f(-n/2,r/2),f(n/2,r/2),f(n/2,-r/2),f(-n/2,-r/2),[0,1,0],[c+.002,p+.002,c+.248,m-.002],s)};{let e=Je+.005,t=(e,t)=>J.some(([n,r,i,a])=>Math.abs(n-e)<i/2+.6&&Math.abs(r-t)<a/2+.6)||tt.some(([n,r,i,a])=>e>n&&e<i&&t>r&&t<a)||e>X.tkts.x0-1&&e<X.tkts.x1+1&&t>X.tkts.zBack-1&&t<X.tkts.zFront+1;for(let n of X.plazaRows){let{c0:r,c1:a}=$t(n);for(let n of[-1,1]){let o=G.AV_HALF+1,s=X.plazaX-1;for(let c=0;c<70;c++){let c=n*(o+i()*(s-o)),l=r+1+i()*(a-r-2);if(t(c,l))continue;let u=i();if(u<.06)In(c,l,.9,.9,i()<.5?0:1,e,i()*6.28);else if(u<.12)In(c,l,.7,.7,3,e);else if(u<.48){let t=1.5+i()*3.5;In(c,l,t,t*(.6+i()*.6),4+Math.floor(i()*4),e,i()*6.28)}else if(u<.68){let t=1.2+i()*1.6;In(c,l,t,t,8+Math.floor(i()*2),e,i()*6.28)}else if(u<.8){let t=1.5+i()*2;In(c,l,t,t*.5,10+Math.floor(i()*2),e,i()*6.28)}else if(u<.9)In(c,l,1.2,.8,12+Math.floor(i()*2),e,i()<.5?0:Math.PI/2);else{let t=2.5+i()*3;In(c,l,t,t*.7,14,e,i()*6.28)}}for(let t=r+8+i()*6;t<a-4;t+=14+i()*10)In(n*(G.AV_HALF+1.6),t,.5,3,2,e,Math.PI/2)}}let n=.014;for(let e=-318;e<-2;e+=3+i()*5){let t=[-8.25,-2.75,2.75,8.25][Math.floor(i()*4)]+(i()-.5)*1.2,r=(e%G.ST_SP+G.ST_SP)%G.ST_SP;if(r<G.ST_HALF+3||r>G.ST_SP-G.ST_HALF-3)continue;let a=i();a<.1?In(t,e,.9,.9,0,n,i()*6.28):a<.55?In(t,e,1.2+i()*1.5,2.5+i()*4,4+Math.floor(i()*4),n,(i()-.5)*.3,[.8,.8,.8]):a<.8?In(t,e,3+i()*4,.6,15,n,(i()-.5)*2.5):In(t,e,2+i()*2,1.2+i(),14,n,i()*6.28)}let r=(e,t,n,r,i,a,o=0,s=1)=>{let c=i%2/2,l=1-Math.floor(i/2)/2,u=Math.cos(o),d=Math.sin(o),f=(n,r)=>[e+n*u-r*d,a,t+n*d+r*u],p=[c+.004,l-.496,c+.496,l-.004];if(i===3){let i=Math.sin(e*12.9898+t*78.233)*43758.5453%1,a=Math.abs(i*7.31%1);i<0&&(p=[p[2],p[1],p[0],p[3]]),a>.5&&(p=[p[0],p[3],p[2],p[1]]),n*=.65+.7*a,r*=1.35-.7*a,s*=.7}Nn.quad(f(-n/2,r/2),f(n/2,r/2),f(n/2,-r/2),f(-n/2,-r/2),[0,1,0],p,[s,s,s])},a=.017;for(let e of[-320,-240,-160,-80]){let t=e+G.ST_HALF,n=e+G.ST_SP-G.ST_HALF;if(e!==-80){for(let e of[-8.25,-2.75,2.75,8.25])for(let o of[-.85,.85])for(let s=t+1;s<n-1;){let t=6+i()*10,c=Math.min(n-1,s+t);if(r(e+o+(i()-.5)*.15,(s+c)/2,.75+i()*.3,c-s+1.5,0,a,(i()-.5)*.01,.6+i()*.4),c>=n-1)break;s=c-.8}for(let e=0;e<7;e++){let e=1.5+i()*3.5,a=1.5+i()*5;r(-9+i()*18,t+4+i()*(n-t-8),e,a,1,.018000000000000002,(i()<.8?0:Math.PI/2)+(i()-.5)*.04)}for(let e=0;e<4;e++){let e=2.5+i()*3;r(-9+i()*18,t+3+i()*(n-t-6),e,e,3,.019000000000000003,i()*6.28)}for(let e of[-G.AV_HALF+.3,G.AV_HALF-.3])for(let i=t+4;i<n-4;i+=8)r(e,i,.55,8.4,0,.018000000000000002,0,1)}for(let t=0;t<2;t++)for(let n of[e-G.ST_HALF-2.4,e+G.ST_HALF+2.4])for(let e=-10+t*2;e<10;e+=4.2+i())r(e+2,n+(i()-.5),4.6+i()*1.5,3.6+i(),2,.02,i()<.5?0:Math.PI,.7+i()*.3);for(let t=0;t<2;t++)for(let n of[-G.AV_HALF-2.4,G.AV_HALF+2.4])for(let a=e-4.5+t*1.7;a<e+4.5;a+=3.6)r(n+(i()-.5),a+1.8,3.6+i(),4.4,2,.02,Math.PI/2,.7+i()*.3);for(let t of[-1,1]){for(let n of[e-2.5,e+2.5])for(let e of[-.8,.8])for(let o=G.AV_HALF+6;o<X.towerX;o+=9+i()*5)r(t*(o+5),n+e,.7+i()*.3,10+i()*3,0,a,Math.PI/2+(i()-.5)*.01,.8);for(let n=0;n<7;n++)r(t*(G.AV_HALF+4+i()*(X.towerX-16)),e-3+i()*6,1.5+i()*3,1.2+i()*2.5,1,.018000000000000002,(i()<.8?0:Math.PI/2)+(i()-.5)*.04,n%2?1:1.7+i()*.6);for(let n=0;n<3;n++)In(t*(G.AV_HALF+6+i()*(X.towerX-20)),e+(i()-.5)*5,.9,.9,i()<.5?0:1,.021,i()*6.28);for(let n=0;n<10;n++){let n=2+i()*3;r(t*(G.AV_HALF+4+i()*(X.towerX-16)),e-3.5+i()*7,n,n*.8,i()<.4?3:2,.019000000000000003,i()*6.28,.7)}for(let n=0;n<3;n++)r(t*(G.AV_HALF+6+i()*26),e+(i()-.5)*.6,.7+i()*.5,9.6,1,.018500000000000003,(i()-.5)*.05,1.5+i()*.5);for(let n=0;n<5;n++){let n=1.2+i()*1.6;r(t*(G.AV_HALF+5+i()*30),e+(i()-.5)*7,n,n*(.7+i()*.6),1,.0182,(i()-.5)*.08,i()<.5?1:1.6+i()*.5)}for(let n=0;n<2;n++)In(t*(G.AV_HALF+7+i()*22),e+(i()-.5)*5,.8,.8,1,.021,i()*6.28);for(let n=0;n<3;n++){let n=2+i()*3.5;r(t*(G.AV_HALF+4+i()*30),e+(i()-.5)*8,n,n*.8,3,.019200000000000002,i()*6.28,.8)}for(let n of[e-G.ST_HALF+.3,e+G.ST_HALF-.3])for(let e=G.AV_HALF+1;e<X.towerX;e+=8)r(t*(e+4),n,.55,8.4,0,.018000000000000002,Math.PI/2,1)}for(let t=0;t<5;t++)r(-8+i()*16,e-3+i()*6,4+i()*4,3+i()*3,i()<.7?2:1,.018000000000000002,i()*6.28,.6)}let o=(e,t,n,r,i,a,o=0,s=1)=>{let c=i%2/2,l=1-Math.floor(i/2)/2,u=Math.cos(o),d=Math.sin(o),f=(n,r)=>[e+n*u-r*d,a,t+n*d+r*u];Pn.quad(f(-n/2,r/2),f(n/2,r/2),f(n/2,-r/2),f(-n/2,-r/2),[0,1,0],[c+.004,l-.496,c+.496,l-.004],[s,s,s])},s=.0196;for(let e of[-320,-240,-160,-80]){let t=e+G.ST_HALF,n=e+G.ST_SP-G.ST_HALF;if(e!==-80){for(let e of[-8.25,-2.75,2.75,8.25]){let r=e<0?t+3:n-3,a=e<0?1:-1;i()<.55&&o(e+(i()-.5)*.4,r+a*(6+i()*8),1.9,5+i()*5,0,s,(i()-.5)*.08,.7+i()*.3);for(let t=0;t<2;t++)o(e+(i()-.5)*.6,r+a*(1.5+t*5.5+i()*1.5),1.3+i()*.8,1.6+i(),1,.019799999999999998,i()*6.28,.8+i()*.2)}for(let e of[-1,1])for(let r=t+2;r<n-3;r+=5.5)o(e*(G.AV_HALF-.55),r+2.75,1.1,5.8,2,.02,e>0?Math.PI:0,.9);for(let e=0;e<6;e++){let e=2.5+i()*4;o(-10+i()*20,t+3+i()*(n-t-6),e,e*(.6+i()*.5),3,.019299999999999998,i()*6.28,.8)}}for(let t of[-1,1]){for(let[n,r]of[[e-G.ST_HALF,Math.PI/2],[e+G.ST_HALF,-Math.PI/2]]){let e=n+(r>0?.55:-.55);for(let n=G.AV_HALF+1;n<X.towerX-1;n+=5.5)o(t*(n+2.75),e,1.1,5.8,2,.02,r,.9)}for(let n of[e-2.5,e+2.5]){let e=t*(G.AV_HALF+5+i()*10);i()<.6&&o(e,n+(i()-.5)*.3,1.8,5+i()*4,0,s,Math.PI/2+(i()-.5)*.1,.8),o(t*(G.AV_HALF+4+i()*3),n+(i()-.5)*.5,1.4,1.8,1,.019799999999999998,i()*6.28,.9)}for(let n=0;n<9;n++){let n=2+i()*4;o(t*(G.AV_HALF+2+i()*36),e+(i()-.5)*7.5,n,n*.7,3,.019299999999999998,i()*6.28,1)}for(let n=0;n<3;n++)o(t*(G.AV_HALF+3+i()*30),e+(i()-.5)*6,1.8,4+i()*4,0,s,Math.PI/2+(i()-.5)*.5,.7)}}let c=(e,t,n,r,i,a,o=0,s=1)=>{let c=i%2/2,l=1-Math.floor(i/2)/2,u=Math.cos(o),d=Math.sin(o),f=(n,r)=>[e+n*u-r*d,a,t+n*d+r*u];Fn.quad(f(-n/2,r/2),f(n/2,r/2),f(n/2,-r/2),f(-n/2,-r/2),[0,1,0],[c+.004,l-.496,c+.496,l-.004],[s,s,s])},l=(e,t)=>{let n=(t%G.ST_SP+G.ST_SP)%G.ST_SP;return n<G.ST_HALF-.3||n>G.ST_SP-G.ST_HALF+.3?Math.abs(e)<X.towerX:Math.abs(e)<G.AV_HALF-.3&&!(t>-80&&t<0)};for(let e=0;e<300;e++){let e=i()<.5,t=[-320,-240,-160,-80,0][Math.floor(i()*5)],n=e?(i()-.5)*2*(G.AV_HALF-1.5):(i()-.5)*2*(X.towerX-4),r=e?-318+i()*236:t+(i()-.5)*(G.ST_ROAD-1.5);if(!l(n,r))continue;let a=i();if(a<.4){let e=3.5+i()*3;c(n,r,e,e,0,.020399999999999998,i()*6.28,.6+i()*.4)}else if(a<.55){let e=2.2+i()*2.5;c(n,r,e,e,1,.020599999999999997,i()*6.28,.8)}else if(a<.93){let a=e?[-8.25,-2.75,2.75,8.25][Math.floor(i()*4)]:0,o=e?a+(i()-.5)*.3:n,s=e?r:t+(i()<.5?-2.5:2.5)+(i()-.5)*.3;l(o,s)&&c(o,s,1+i()*.6,2.4+i()*2.5,2,.0208,e?(i()-.5)*.1:Math.PI/2+(i()-.5)*.1,.8+i()*.2)}else a>.975&&c(n,r,2.44,3.05,3,.020999999999999998,e?0:Math.PI/2,.9+i()*.2)}}let Ln=rt(),Rn=et(),Z=gn(Xt+`ts_pavers.ktx2`,{repeat:!0,aniso:16}),zn=Ae(),Bn=_n(),Vn=(t,n,r,i=!1)=>{if(!t)return null;let a=new g(t,n);return a.name=r,a.castShadow=i,a.receiveShadow=!0,e.add(a),a},Hn=e=>zn?Kt(e):new C({map:e,color:2763306,emissive:16777215,emissiveMap:e,emissiveIntensity:2.5,roughness:.28,metalness:0,vertexColors:!0}),Un=Hn(Ln);Un.userData.nightGain=1,Un.defines={...Un.defines,CITYL_NOSPEC:``},zn||(Un.onBeforeCompile=e=>{let t=ft();Object.assign(e.uniforms,lt()),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,ke(Jt.fragmentCommon,t.uniformDeclarations)).replace(`#include <emissivemap_fragment>`,ke(Jt.fragmentEmissive,t.gainExpression,t.highlightShoulder.replace(`+ 1e-4;`,`* clamp(vColor.r / 0.7, 0.3, 1.0) + 1e-4;`)))});let Wn=Vn(p.build(),Un,`tsScreens`);{let e=new C({map:Ln,vertexColors:!0,roughness:.62,metalness:0,color:14869218,emissive:16777215,emissiveMap:Ln,emissiveIntensity:0});if(e.userData.nightLit=.3,e.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace(`#include <map_fragment>`,Jt.fragmentMap)},zn){let e=new Te({map:Ln,vertexColors:!0,roughness:.62,metalness:0,color:14869218});e.name=`TimesSquareVinyl.TSL`;let t=pe().flipY();e.colorNode=M(Ln,t).rgb.mul(Ce(14869218));let n=ue(Fe.value).onRenderUpdate((e,t)=>{t.value=Fe.value});e.emissiveNode=M(Ln,t).rgb.mul(.3).mul(n),Vn(N.build(),e,`tsVinyl`)}else Vn(N.build(),e,`tsVinyl`)}{let e=zn?Bt(vn()):new T({map:vn(),vertexColors:!0,transparent:!0,depthWrite:!1,side:2,polygonOffset:!0,polygonOffsetFactor:-6,polygonOffsetUnits:-6});zn||Object.assign(e,{blending:5,blendEquation:100,blendSrc:204,blendDst:205,blendSrcAlpha:200,blendDstAlpha:201}),zn||(e.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace(`#include <color_fragment>`,Jt.fragmentColor)});let t=Vn(te.build(),e,`tsAO`);t&&(t.receiveShadow=!1,t.renderOrder=3)}let Gn=Hn(Rn);Vn(_.build(),zn?Gn:ht(Gn,`tsSigns`),`tsSigns`);{let e=zn?qt(Rn):new C({color:0,emissive:16777215,emissiveMap:Rn,emissiveIntensity:2.2,roughness:.4,metalness:0,vertexColors:!0,side:2});zn||(e.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace(`#include <emissivemap_fragment>`,Jt.fragmentEmissiveSignLetterCutout)}),e.customProgramCacheKey=()=>`tsNeon`,zn||ht(e,`neon`),Vn(xe.build(),e,`tsNeon`)}Vn(x.build(),new T({map:Bn,vertexColors:!0,color:16777215,side:2}),`tsLights`);{let e=gn(Xt+`ts_ticker.ktx2`,{aniso:8});e.wrapS=m;let t=Vn(Ve.build(),zn?Hn(e):ht(new C({map:e,color:2105376,emissive:16777215,emissiveMap:e,emissiveIntensity:2.4,roughness:.35}),`ticker`),`tsTicker`);t&&(t.onBeforeRender=()=>{e.offset.x=performance.now()*4e-5%1})}{let e=gn(Xt+`ts_spill.ktx2`,{aniso:1}),t=new T({map:e,vertexColors:!0,transparent:!0,depthWrite:!1,side:2,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4});Object.assign(t,{blending:5,blendEquation:100,blendSrc:201,blendDst:201,blendSrcAlpha:200,blendDstAlpha:201});let n=Vn(kn.build(),t,`tsSpill`);n&&(n.receiveShadow=!1,n.renderOrder=2),n&&(n.onBeforeRender=()=>{t.color.setScalar(1-(De.enabled?1:.78)*Fe.value)});let r=new Uint8Array(16384);for(let e=0;e<64;e++)for(let t=0;t<64;t++){let n=Math.min(1,Math.hypot(t/63,e/63)),i=Math.round(255*(1-n)**2.2),a=(e*64+t)*4;r[a]=r[a+1]=r[a+2]=i,r[a+3]=255}let i=new v(r,64,64);i.magFilter=d,i.minFilter=d,i.needsUpdate=!0;let a=zn?Vt(i):t.clone();zn||(a.map=i),zn||(a.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <common>`,Jt.vertexCommon).replace(`#include <project_vertex>`,Jt.vertexProjectVertex),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,Jt.fragmentCommonByHaloFade).replace(`#include <opaque_fragment>`,Jt.fragmentOpaque)}),zn||(a.customProgramCacheKey=()=>`tsHaloFade`);let o=Vn(jn.build(),a,`tsHalo`);o&&(o.receiveShadow=!1,o.renderOrder=2,o.onBeforeRender=()=>{a.color.setScalar(1-(De.enabled?1:.72)*Fe.value)}),Wn&&(n||o)&&(Wn.onBeforeRender=()=>{let e=!(De.enabled&&Fe.value>.99);n&&(n.visible=e),o&&(o.visible=e)})}{let e=gn(Xt+`ts_decals.ktx2`,{aniso:8}),t=new C({map:e,vertexColors:!0,transparent:!0,depthWrite:!1,roughness:.75,polygonOffset:!0,polygonOffsetFactor:-5,polygonOffsetUnits:-5});Object.assign(t,{blending:5,blendEquation:100,blendSrc:204,blendDst:205,blendSrcAlpha:200,blendDstAlpha:201});let n=Vn(Mn.build(),t,`tsDecals`);n&&(n.renderOrder=1);let r=gn(Xt+`ts_road.ktx2`,{aniso:8}),i=t.clone();i.map=r;let a=Vn(Nn.build(),i,`tsRoadWear`);a&&(a.renderOrder=1);let o=t.clone();o.map=gn(Xt+`ts_road2.ktx2`,{aniso:8});let s=Vn(Pn.build(),o,`tsRoadWear2`);s&&(s.renderOrder=1);let c=t.clone();c.map=gn(Xt+`ts_road3.ktx2`,{aniso:8});let l=Vn(Fn.build(),c,`tsRoadWear3`);l&&(l.renderOrder=1)}let Kn=gn(Xt+`ts_shops.ktx2`,{aniso:4});{let e=zn?Ut(Kn):new C({map:Kn,color:3158064,emissive:16777215,emissiveMap:Kn,emissiveIntensity:1,roughness:.05,metalness:0,vertexColors:!0});zn||(e.onBeforeCompile=e=>{e.vertexShader=Jt.storefrontVertexPrefix+e.vertexShader.replace(`#include <project_vertex>`,Jt.vertexProjectVertexStorefront),e.fragmentShader=Jt.storefrontFragmentPrefix+e.fragmentShader.replace(`#include <map_fragment>`,Jt.fragmentMapStorefrontGlass).replace(`#include <emissivemap_fragment>`,Jt.fragmentEmissiveStorefrontInterior)}),Vn(ee.build(),e,`tsShops`)}S.v&&Vn(S.build(),new C({vertexColors:!0,roughness:.55,metalness:.5}),`tsFrames`,!0);let qn=gn(Xt+`ts_pavers_n.ktx2`,{srgb:!1,repeat:!0,aniso:16}),Jn=gn(Xt+`ts_pavers_r.ktx2`,{srgb:!1,repeat:!0,aniso:8}),Yn=zn?null:new C({map:Z,normalMap:qn,normalScale:new w(.9,.9),roughnessMap:Jn,roughness:1,metalness:0,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),Xn=gn(Xt+`noise.ktx2`,{srgb:!1,repeat:!0,aniso:1}),Zn=[];{let e=X.tkts;for(let t of X.plazaRows){let{c0:n,c1:r}=$t(t);for(let t of[-1,1])for(let a=0,o=0;a<4&&o<60;o++){let o=2.2+i()*2.2,s=t*(G.AV_HALF+4+o+i()*(X.plazaX-G.AV_HALF-8-2*o)),c=n+3+o+i()*(r-n-6-2*o);s+o>e.x0-1&&s-o<e.x1+1&&c+o>e.zBack-1&&c-o<e.zFront+1||Zn.some(e=>Math.hypot(e.x-s,e.y-c)<e.z+o+2.5)||(Zn.push(new y(s,c,o,Math.floor(i()*4))),a++)}}for(;Zn.length<24;)Zn.push(new y(0,0,-1,0))}zn?Vn(D.build(),Wt({map:Z,normalMap:qn,roughnessMap:Jn,noise:Xn,circles:Zn,edgeX:X.plazaX}),`tsPavers`):(Yn.onBeforeCompile=e=>{e.uniforms.tMacro={value:Xn},e.uniforms.uCirc={value:Zn},e.uniforms.uEdgeX={value:X.plazaX},e.fragmentShader=Jt.paversFragmentPrefix+e.fragmentShader.replace(`#include <map_fragment>`,Jt.fragmentMapPaverGrime)},Vn(D.build(),Yn,`tsPavers`));{let e=new hn,t=.0125,n=(n,r,i,a)=>e.quad([n,t,a],[i,t,a],[i,t,r],[n,t,r],[0,1,0],[n/37,a/37,i/37,r/37]);for(let e of[-320,-240,-160])n(-G.AV_HALF,e+G.ST_HALF,G.AV_HALF,e+G.ST_SP-G.ST_HALF);for(let e of[-320,-240,-160,-80,0])n(-X.towerX,e-G.ST_HALF,X.towerX,e+G.ST_HALF);let r=e=>{if(zn)return Gt({noise:Xn,crosswalkOnly:e,streetSpacing:G.ST_SP,streetHalf:G.ST_HALF,avenueHalf:G.AV_HALF,towerX:X.towerX});let t=new C({map:Xn,color:6118231,roughness:.93,metalness:0,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4});return Object.assign(t,{blending:5,blendEquation:100,blendSrc:204,blendDst:205,blendSrcAlpha:200,blendDstAlpha:201}),t.onBeforeCompile=t=>{t.fragmentShader=t.fragmentShader.replace(`#include <map_fragment>`,ke(Jt.fragmentMapCrosswalkWear,37,G.ST_SP,G.ST_HALF+2.4,G.ST_SP-G.ST_HALF-2.4,G.AV_HALF-.5,G.AV_HALF+.5,G.ST_HALF-.5,G.ST_HALF+.2,G.ST_SP,G.AV_HALF+2.4,e?`clamp(cw, 0.0, 1.0) * (0.32 + 0.5 * chip)`:`diffuseColor.a`,X.towerX,X.towerX-24))},t.customProgramCacheKey=()=>`tsDust`+(e?`CW`:``),t},i=Vn(e.build(),r(!1),`tsRoadDust`);i&&(i.renderOrder=.5);let a=new hn,o=.02,s=(e,t,n,r)=>a.quad([e,o,r],[n,o,r],[n,o,t],[e,o,t],[0,1,0],[e/37,r/37,n/37,t/37]);for(let e of[-320,-240,-160,-80,0]){for(let t of[e-G.ST_HALF-5.2,e+G.ST_HALF+.2])t>-330&&t<0&&s(-G.AV_HALF,t,G.AV_HALF,t+5);for(let t of[-1,1])s(t>0?G.AV_HALF+.2:-G.AV_HALF-4.6,e-G.ST_HALF,t>0?G.AV_HALF+4.6:-G.AV_HALF-.2,e+G.ST_HALF)}let c=Vn(a.build(),r(!0),`tsCrossWear`);c&&(c.renderOrder=1.5,c.receiveShadow=!0)}{let e=new C({color:13623524,transparent:!0,opacity:.2,roughness:.04,metalness:.2,side:2,depthWrite:!1,vertexColors:!0});Object.assign(e,{blending:5,blendEquation:100,blendSrc:204,blendDst:205,blendSrcAlpha:200,blendDstAlpha:201});let t=Vn(j.build(),e,`tsGlass`);t&&(t.renderOrder=4)}if(Vn(Ze.build(),new C({vertexColors:!0,roughness:.8,polygonOffset:!0,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),`tsBands`),A.v){let e=Vn(A.build(),Object.assign(new C({color:11017250,emissive:12588060,emissiveIntensity:.12,roughness:.5,metalness:.1,vertexColors:!0}),{userData:{nightGain:.4}}),`tsTKTS`,!0);e&&(e.material.userData.nightGain=.4)}let Qn=fe.commit(`ts`);return yn(me),{planters:J.length,bollards:it.length,screens:p.v/4,crowd:Zt.length,lights:Qn}}var xn=(e,t)=>Math.abs(e)<X.towerX+6&&t>-332&&t<8;function Sn(e){let t=Ue(77);for(let n=e.length-1;n>=0;n--){let r=e[n];Math.abs(r.x)<X.towerX+8&&r.z>-330&&r.z<8&&t()>-1&&e.splice(n,1)}for(let t of Qt)e.push(t)}var Cn=Me(`city/environmentTextures/`);function wn(e,{srgb:t=!1,repeat:n=!0,aniso:i=8}={}){let a=e.isCompressedTexture?e:new S(e);return a.colorSpace=t?u:``,n&&(a.wrapS=a.wrapT=m),a.anisotropy=i,a.generateMipmaps=!e.isCompressedTexture,a.minFilter=r,a.magFilter=d,a.needsUpdate=!0,a}async function Tn(e){let t=Pe(e).name===`low`?2:Pe(e).name===`med`?6:16,n=Math.min(t,e.getMaxAnisotropy?.()??1),r=await Promise.all(Object.entries({walls_col:`walls_col.ktx2`,walls_nrm:`walls_nrm.ktx2`,walls_hao:`walls_hao.ktx2`,asphalt_col:`asphalt_col.ktx2`,asphalt_nrm:`asphalt_nrm.ktx2`,asphalt_macro:`asphalt_macro.ktx2`,sidewalk_col:`sidewalk_col.ktx2`,sidewalk_nrm:`sidewalk_nrm.ktx2`,curb_col:`curb_col.ktx2`,asphalt_decals:`asphalt_decals.ktx2`,interiors:`interiors.ktx2`,signs:`signs.ktx2`,markings:`markings.ktx2`,leaves:`leaves.ktx2`,grass_col:`grass_col.ktx2`,grass_nrm:`grass_nrm.ktx2`,water_nrm:`water_nrm.ktx2`,noise:`noise.ktx2`,detail_nrm:`detail_nrm.ktx2`}).map(async([e,t])=>[e,await je(Cn+t)])),i=Object.fromEntries(r),a=await(await fetch(Cn+`markings.json`)).json(),o={asphaltCol:wn(i.asphalt_col,{srgb:!0,aniso:n}),asphaltNrm:wn(i.asphalt_nrm,{aniso:n}),asphaltMacro:wn(i.asphalt_macro,{aniso:n}),sidewalkCol:wn(i.sidewalk_col,{srgb:!0,aniso:n}),sidewalkNrm:wn(i.sidewalk_nrm,{aniso:n}),interiors:wn(i.interiors,{srgb:!0,repeat:!1,aniso:4}),signs:wn(i.signs,{srgb:!0,repeat:!1,aniso:n}),markings:wn(i.markings,{srgb:!0,repeat:!1,aniso:n}),leaves:wn(i.leaves,{repeat:!1,aniso:4}),grassCol:wn(i.grass_col,{srgb:!0,aniso:n}),grassNrm:wn(i.grass_nrm,{aniso:n}),detailNrm:wn(i.detail_nrm,{aniso:n}),waterNrm:wn(i.water_nrm,{aniso:n}),noise:wn(i.noise,{aniso:4}),markRects:a};return o.wallsCol=wn(i.walls_col,{srgb:!0,aniso:n}),o.wallsNrm=wn(i.walls_nrm,{aniso:n}),o.wallsHao=wn(i.walls_hao,{aniso:n}),o.asphaltDecals=wn(i.asphalt_decals,{repeat:!1,aniso:n}),o.curbCol=wn(i.curb_col,{srgb:!0,aniso:n}),o}var En=`// hero shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
uniform mat4 uTexMat;
out vec4 vRefl;
// @section vertexFogVertex
#include <fog_vertex>
vRefl = uTexMat * (modelMatrix * vec4(transformed, 1.0));
// @section fragmentCommon
#include <common>
uniform sampler2D tRefl;
uniform float uReflOn;
uniform vec2 uTexel;
in vec4 vRefl;
// @section fragmentPhysicalLights
#include <lights_physical_fragment>
material.specularColor = vec3(0.6);
// @section fragmentLightsMaps
#include <lights_fragment_maps>
if(uReflOn > 0.5) {
vec2 ruv = vRefl.xy / vRefl.w;
vec2 o1 = uTexel * vec2(0.75, 0.35), o2 = uTexel * vec2(- 0.35, 0.75);
vec4 pr = 0.25 * (texture(tRefl, ruv + o1, 0.6) + texture(tRefl, ruv - o1, 0.6) + texture(tRefl, ruv + o2, 0.6) + texture(tRefl, ruv - o2, 0.6));
vec2 e = smoothstep(0.0, 0.04, ruv) * smoothstep(1.0, 0.96, ruv);
// the mirror render carries no aerial perspective: pull it toward the sky/env radiance (haze), and keep a
// share of the sky reflection even over the reflected geometry (coated glass reads sky-bright, as in ref 2)
vec3 mirrored = mix(pr.rgb, radiance, 0.25);
radiance = mix(radiance, mirrored, 0.75 * clamp(pr.a, 0.0, 1.0) * e.x * e.y * step(0.0, vRefl.w));
}
`,Dn=`// buildings shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
in float aPart;
flat out float vPart;
out vec3 vWP;
out vec3 vWN;
out vec2 vUv2;
// @section vertexFogVertex
#include <fog_vertex>
vPart = aPart;
vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;
vWN = normalize(mat3(modelMatrix) * objectNormal);
vUv2 = uv;
// @section fragmentCommon
#include <common>
uniform sampler2D tNoise;
__SHADER_INJECT_0__ flat in float vPart;
in vec3 vWP;
in vec3 vWN;
in vec2 vUv2;
float dR;
float dM;
vec3 dN;
// @section fragmentColor
#include <color_fragment>
{
int P = int(vPart + 0.5);
vec3 N = normalize(vWN);
vec2 tp = abs(N.y) > 0.6 ? vWP.xz : (abs(N.x) > abs(N.z) ? vWP.zy : vWP.xy);
vec3 nz = texture(tNoise, tp / 7.0).rgb, nz2 = texture(tNoise, tp / 1.3).rgb;
dR = 0.7;
dM = 0.0;
dN = vec3(0.0, 0.0, 1.0);
float grime = smoothstep(0.35, 0.8, nz.r) * 0.35 + (1.0 - smoothstep(0.0, 0.6, fract(vWP.y) + nz2.g * 0.2)) * 0.0;
if(P == 0) {
dR = 0.45 + 0.3 * nz2.g;
dM = 0.2;
diffuseColor.rgb *= 1.0 - grime * 0.5;
          // rain streaks on painted sheet metal
if(abs(N.y) < 0.5) diffuseColor.rgb *= 1.0 - 0.25 * smoothstep(0.55, 0.9, texture(tNoise, vec2(tp.x * 0.9, tp.y * 0.05)).g);
} else if(P == 1) { // timber staves (vertical boards) weathered
float st = fract(vUv2.x * 48.0);
float seam = smoothstep(0.0, 0.06, st) * smoothstep(1.0, 0.94, st);
float board = fract(sin(floor(vUv2.x * 48.0) * 91.7) * 4375.5);
diffuseColor.rgb *= (0.75 + 0.35 * board) * mix(0.55, 1.0, seam) * (0.8 + 0.4 * nz2.b);
diffuseColor.rgb *= mix(vec3(1.0), vec3(0.88, 0.9, 0.88), smoothstep(0.4, 0.9, nz.g));
dR = 0.85;
dN = normalize(vec3((1.0 - seam) * sign(st - 0.5) * 0.6, 0.0, 1.0));
} else if(P == 2) {
dR = 0.5 + 0.3 * nz2.r;
dM = 0.7;
diffuseColor.rgb *= mix(vec3(1.0), vec3(1.25, 0.92, 0.75), smoothstep(0.55, 0.85, nz2.g) * 0.5);
} else if(P == 3) {
dR = 0.06 + 0.25 * smoothstep(0.5, 0.9, nz2.g);
dM = 0.0;
diffuseColor.rgb = mix(vec3(0.02, 0.025, 0.03), vec3(0.2), smoothstep(0.6, 0.95, nz2.g) * 0.5);
} else if(P == 4) {
dR = 0.9;
diffuseColor.rgb *= 0.9 + 0.2 * nz2.b;
} else if(P == 5) {
dR = 0.85;
diffuseColor.rgb *= 0.9 + 0.15 * nz2.r;
} else if(P == 6) {
dR = 0.35 + 0.25 * nz2.g;
dM = 0.85;
} else if(P == 7) {
dR = 0.8;
diffuseColor.rgb *= 0.9 + 0.2 * nz2.b;
diffuseColor.rgb *= 1.0 - 0.3 * smoothstep(0.5, 0.9, nz.g);
} else if(P == 8) {
dR = 0.85;
} else if(P == 10) { // thin steel (rails, masts, bracing): dithered fade 90-170 m (TAA resolves it; no sub-pixel crawl)
dR = 0.5 + 0.3 * nz2.r;
dM = 0.7;
float fd = smoothstep(90.0, 170.0, length(cameraPosition - vWP));
if(fd > 0.0 && fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) < fd) discard;
} else if(P == 9) { // steel bar grating (fire-escape decks): 3 mm bearing bars every 3 cm, cross rods every 10 cm
dM = 0.6;
dR = 0.55 + 0.25 * nz2.r;
diffuseColor.rgb *= mix(vec3(1.0), vec3(1.2, 0.92, 0.75), smoothstep(0.55, 0.85, nz2.g) * 0.4);
if(abs(N.y) > 0.6) {
vec2 q = vWP.xz;
vec2 fw = fwidth(q);
vec2 pitch = vec2(0.03, 0.10);
// bars along the longer deck axis: pick the axis with more variation of the part... use world x
float bx = abs(fract(q.x / pitch.x) - 0.5) * pitch.x, bz = abs(fract(q.y / pitch.y) - 0.5) * pitch.y;
float onBar = max(step(pitch.x * 0.5 - 0.004, bx), step(pitch.y * 0.5 - 0.004, bz));
float fine = max(fw.x / pitch.x, fw.y / pitch.y);
if(fine < 0.25) {
if(onBar < 0.5) discard;
} else { // (textures r4) critic: 'fire escapes are solid black slabs'. Past the bar resolution the deck stays
// see-through: dithered coverage at the grating's true open fraction (~65 %), resolved by TAA
float dth = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
if(dth < 0.62 * (1.0 - smoothstep(1.5, 4.0, fine) * 0.4)) discard;
}
}
}
diffuseColor.rgb = mix(vec3(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722))), diffuseColor.rgb, 0.85); // muted palette
}
// @section fragmentRoughness
float roughnessFactor = dR;
// @section fragmentMetalness
float metalnessFactor = dM;
// @section fragmentNormalMaps
#include <normal_fragment_maps>
{
vec3 Nw = normalize(vWN);
vec3 Tw = abs(Nw.y) > 0.9 ? vec3(1.0, 0.0, 0.0) : normalize(cross(vec3(0.0, 1.0, 0.0), Nw));
vec3 Bw = cross(Nw, Tw);
vec3 nw = normalize(Tw * dN.x + Bw * dN.y + Nw * dN.z);
if(dN.z < 0.999) normal = normalize((viewMatrix * vec4(nw, 0.0)).xyz);
}
`,On=e=>B(H(I(e,U(91.7,127.1))).mul(43758.5453));function kn(e){let t=new Te({vertexColors:!1,roughness:.75,metalness:.1});t.name=`CityBuildingDetail.TSL`;let n=ve(`aPart`,`float`).round(),r=F,i=re(ce),a=R(i),o=N(a.y.greaterThan(.6),U(r.x,r.z),N(a.x.greaterThan(a.z),U(r.z,r.y),U(r.x,r.y))),s=M(e.noise,o.div(7)).rgb,c=M(e.noise,o.div(1.3)).rgb,l=fe().rgb,u=j(.35,.8,s.r).mul(.35),d=l.mul(z(1).sub(u.mul(.5))),f=z(.7),p=z(0),m=B(pe().x.mul(48)),h=j(0,.06,m).mul(z(1).sub(j(.94,1,m))),g=On(U(P(pe().x.mul(48)),0)),_=l.mul(z(.75).add(g.mul(.35))).mul(W(.55,1,h)).mul(z(.8).add(c.b.mul(.4))).mul(W(V(1),V(.88,.9,.88),j(.4,.9,s.g)));d=N(n.equal(1),_,d),f=N(n.equal(1),z(.85),f);let v=l.mul(W(V(1),V(1.25,.92,.75),j(.55,.85,c.g).mul(.5)));d=N(n.equal(2),v,d),f=N(n.equal(2),z(.5).add(c.r.mul(.3)),f),p=N(n.equal(2),z(.7),p);let y=W(V(.02,.025,.03),V(.2),j(.6,.95,c.g).mul(.5));d=N(n.equal(3),y,d),f=N(n.equal(3),z(.06).add(j(.5,.9,c.g).mul(.25)),f),d=N(n.equal(4),l.mul(z(.9).add(c.b.mul(.2))),d),f=N(n.equal(4),z(.9),f),d=N(n.equal(5),l.mul(z(.9).add(c.r.mul(.15))),d),f=N(n.equal(5),z(.85),f),f=N(n.equal(6),z(.35).add(c.g.mul(.25)),f),p=N(n.equal(6),z(.85),p),d=N(n.equal(7),l.mul(z(.9).add(c.b.mul(.2))).mul(z(1).sub(j(.5,.9,s.g).mul(.3))),d),f=N(n.equal(7).or(n.equal(8)),z(.85),f);let b=R(B(r.x.div(.03)).sub(.5)).mul(.03),x=R(B(r.z.div(.1)).sub(.5)).mul(.1),S=b.greaterThan(.011).or(x.greaterThan(.03));return t.maskNode=n.notEqual(9).or(a.y.lessThanEqual(.6)).or(S),d=N(n.equal(9),l.mul(W(V(1),V(1.2,.92,.75),j(.55,.85,c.g).mul(.4))),d),f=N(n.equal(9),z(.55).add(c.r.mul(.25)),f),p=N(n.equal(9),z(.6),p),f=N(n.equal(10),z(.5).add(c.r.mul(.3)),f),p=N(n.equal(10),z(.7),p),t.colorNode=d.mul(.85).add(V(I(d,V(.2126,.7152,.0722)).mul(.15))),t.roughnessNode=f,t.metalnessNode=p,t}var An=[`roofEdge`,`roofCorner`,`ledge`,`waterTower`,`antenna`,`pole`,`lampTop`,`signalMast`],jn=Object.fromEntries(An.map((e,t)=>[e,t])),Mn=class{constructor(){this.raw=[],this.cell=32}add(e,t,n,r,i,a,o){this.raw.push(e,t,n,r,i,a,jn[o]??0)}edge(e,t,n,r,i,a,o,s=`roofEdge`,c=7){let l=Math.hypot(n-e,r-t),u=Math.max(1,Math.round(l/c));for(let c=1;c<u;c++){let l=c/u;this.add(e+(n-e)*l,i,t+(r-t)*l,a,0,o,s)}u===1&&l>2&&this.add((e+n)/2,i,(t+r)/2,a,0,o,s)}addBlockers(e){(this.blockers??=[]).push(...e)}addTreeBlockers(e){let t=[];for(let n of e?.pools??[]){if(!/^trees-.*-near$/.test(n.mesh?.name??``))continue;let e=n.geo??n.mesh.geometry;e.boundingBox||e.computeBoundingBox();let r=e.boundingBox,i=Math.max(-r.min.x,r.max.x,-r.min.z,r.max.z)*.9;for(let e of n.items){let n=e.s??1;t.push({x:e.x,z:e.z,r:i*n+.45,y0:e.y+r.min.y*n-1.9,y1:e.y+r.max.y*n})}}return this.addBlockers(t),t.length}_blocked(e,t,n){let r=this.blockers;if(!r)return!1;this._bh||(this._bh=new Map,r.forEach((e,t)=>{for(let n=Math.floor((e.x-e.r)/16);n<=Math.floor((e.x+e.r)/16);n++)for(let r=Math.floor((e.z-e.r)/16);r<=Math.floor((e.z+e.r)/16);r++){let e=n*7919+r,i=this._bh.get(e);i||this._bh.set(e,i=[]),i.push(t)}}));let i=this._bh.get(Math.floor(e/16)*7919+Math.floor(n/16));if(!i)return!1;for(let a of i){let i=r[a];if(t>i.y0&&t<i.y1&&(e-i.x)**2+(n-i.z)**2<i.r*i.r)return!0}return!1}finalize(e){let t=this.raw,n=t.length/7,r=[];for(let i=0;i<n;i++){let n=i*7,a=t[n],o=t[n+1],s=t[n+2],c=t[n+3],l=t[n+5],u=t[n+6];if(!this._blocked(a,o,s)&&!(u===jn.ledge&&o<8)&&!(u>=3&&o<3)){if(e){let r=u<3?a-c*.12:a,i=u<3?s-l*.12:s,d=e.topAt(r,i,o+.3);if(d.id<0||Math.abs(d.y-o)>(u<3?.06:.3))continue;if(u>=3){let r=e.topAt(a,s,o+.3);if(r.id<0)continue;t[n+1]=r.y}else t[n+1]=d.y;let f=t[n+1],p=u>=3?.35:.3;if(e.inside(a,f+p,s)||e.inside(a,f+1.2,s)||e.cast(a,f+.02,s,0,1,0,2)||e.cast(r,f+.02,i,0,1,0,2))continue;if(u===jn.ledge){let t=a-c*.6,n=s-l*.6,r=e.topAt(t,n,f+.05);if(r.id<0||Math.abs(r.y-f)>.05||e.inside(t,f+.3,n))continue}if(u<3){let t=a+c*.35,n=s+l*.35;if(e.inside(t,f+(u===jn.ledge?1.3:.3),n))continue}}r.push(i)}}let i=new Float32Array(r.length*6),a=new Uint8Array(r.length);r.forEach((e,n)=>{for(let r=0;r<6;r++)i[n*6+r]=t[e*7+r];a[n]=t[e*7+6]}),this.P=i,this.K=a,this.raw=null,this.blockers=null,this._bh=null;let o=this.cell,s=new Map;for(let e=0;e<a.length;e++){let t=Math.floor(i[e*6]/o)*73856093^Math.floor(i[e*6+2]/o)*19349663,n=s.get(t);n||s.set(t,n=[]),n.push(e)}return this.hash=s,this}get count(){return this.K?this.K.length:this.raw.length/7}query(e,t,n=null){let r=[];if(!this.hash)return r;let i=this.cell,a=this.P,o=t*t,s=Math.floor((e.x-t)/i),c=Math.floor((e.x+t)/i),l=Math.floor((e.z-t)/i),u=Math.floor((e.z+t)/i),d=[];for(let t=s;t<=c;t++)for(let r=l;r<=u;r++){let s=this.hash.get(t*73856093^r*19349663);if(s)for(let c of s){let s=c*6,l=a[s]-e.x,u=a[s+1]-e.y,f=a[s+2]-e.z,p=l*l+u*u+f*f;p>o||Math.floor(a[s]/i)===t&&Math.floor(a[s+2]/i)===r&&(!n||n.includes(An[this.K[c]]))&&d.push(c,p)}}let f=[];for(let e=0;e<d.length;e+=2)f.push(e);f.sort((e,t)=>d[e+1]-d[t+1]);for(let e of f){let t=d[e],n=t*6;r.push({pos:new O(a[n],a[n+1],a[n+2]),normal:new O(a[n+3],a[n+4],a[n+5]),kind:An[this.K[t]]})}return r}};function Nn(e,t){let n=t?.anchors?.()??t?.propAnchors?.();if(Array.isArray(n)){let r=new Map;for(let e of t?.pools??[]){if(e.mesh?.name!==`antenna`)continue;let t=e.geo??e.mesh.geometry;t.boundingBox||t.computeBoundingBox(),r.set(`antenna`,{items:e.items,maxY:t.boundingBox.max.y})}for(let e of n){let t=r.get(e.kind);if(t){let n=null,r=.25;for(let i of t.items){let t=Math.hypot(i.x-e.pos.x,i.z-e.pos.z);t<r&&(r=t,n=i)}n&&(e.pos.y=n.y+t.maxY*(n.scale3?n.scale3[1]*(n.s??1):n.s??1))}}let i=new Set;for(let e of t?.pools??[])if(e.mesh?.name===`mast`)for(let t of e.items)i.add(Math.round(t.x*10)+`,`+Math.round(t.z*10));for(let t of n)t.kind===`signalMast`&&i.has(Math.round(t.pos.x*10)+`,`+Math.round(t.pos.z*10))||e.add(t.pos.x,t.pos.y,t.pos.z,t.normal?.x??0,t.normal?.y??1,t.normal?.z??0,t.kind);return n.length}let r=t?.pools??[],i=0,a=(t,n,r,a,o)=>{let s=t.s??1,c=Math.cos(t.ry),l=Math.sin(t.ry);e.add(t.x+(n*c+a*l)*s,t.y+r*s,t.z+(-n*l+a*c)*s,0,1,0,o),i++};for(let e of r){let t=e.mesh?.name;if(t===`lamp`)for(let t of e.items)a(t,0,9.15,2.9,`lampTop`);else if(t===`mast`)for(let t of e.items)a(t,0,7.9,0,`signalMast`),a(t,0,6.8,10.4,`signalMast`)}return i}var Pn=[[1,1,1],[1,.9,.1],[1,.5,.1],[.2,.5,1],[1,.15,.1],[.3,1,.3],[.3,1,.3],[.1,.8,.4]];function Fn(e,n,r=150){let a=e.query(n,r),l=[],u=[],d=[],f=[];for(let e of a){let t=Pn[An.indexOf(e.kind)]??[1,1,1];l.push(e.pos.x,e.pos.y+.05,e.pos.z),u.push(...t),d.push(e.pos.x,e.pos.y+.05,e.pos.z,e.pos.x+e.normal.x*.8,e.pos.y+.05+e.normal.y*.8,e.pos.z+e.normal.z*.8),f.push(...t,...t)}let p=new D;p.name=`zipDebug`;let m=new x;m.setAttribute(`position`,new s(l,3)),m.setAttribute(`color`,new s(u,3)),p.add(new t(m,new i({size:11,sizeAttenuation:!1,vertexColors:!0,depthTest:!1})));let h=new x;return h.setAttribute(`position`,new s(d,3)),h.setAttribute(`color`,new s(f,3)),p.add(new o(h,new c({vertexColors:!0,depthTest:!1}))),p.children.forEach(e=>{e.frustumCulled=!1,e.renderOrder=11}),p}function In(e,t,n,r){let i=new URLSearchParams(typeof location<`u`?location.search:``),a={zips:i.has(`zipdbg`),collision:i.has(`coldbg`),radius:+(i.get(`dbgr`)||60)},o=null,s=null,c=new O(1e9,0,0),l=t=>(t&&(e.remove(t),t.traverse(e=>{e.geometry?.dispose(),e.material?.dispose()})),null);return{set(e){Object.assign(a,e),c.set(1e9,0,0),a.zips||(o=l(o)),a.collision||(s=l(s))},update(i){(a.zips||a.collision)&&(i.position.distanceTo(c)<a.radius*.3||(c.copy(i.position),a.zips&&(o=l(o),o=Fn(n,i.position,a.radius*2),e.add(o)),a.collision&&(s=l(s),s=r(t,i.position,a.radius),e.add(s))))}}}function Ln(){let e=document.createElement(`canvas`);e.width=e.height=512;let t=e.getContext(`2d`),n=Ue(777);for(let e=0;e<4;e++){let r=e%2*256,i=Math.floor(e/2)*256,a=[],o=e===3?7:3;for(let e=0;e<=12;e++)a.push([r+10+236*e/12,i+10+(n()-.5)*o]);for(let e=1;e<=12;e++)a.push([r+256-10+(n()-.5)*o,i+10+236*e/12]);for(let e=11;e>=0;e--)a.push([r+10+236*e/12,i+256-10+(n()-.5)*o]);for(let e=11;e>=1;e--)a.push([r+10+(n()-.5)*o,i+10+236*e/12]);t.beginPath(),a.forEach(([e,n],r)=>r?t.lineTo(e,n):t.moveTo(e,n)),t.closePath();let s=[.36,.62,.34,.6][e];t.fillStyle=e===1?`rgba(132,132,130,0.36)`:e===3?`rgba(116,116,114,0.3)`:`rgba(22,24,27,${s})`,t.fill(),t.save(),t.clip();for(let e=0;e<900;e++){let e=r+n()*256,a=i+n()*256,o=.6+n()*1.6;t.fillStyle=n()<.5?`rgba(120,120,118,${.08+n()*.1})`:`rgba(10,10,12,${.1+n()*.15})`,t.fillRect(e,a,o,o)}for(let e=0;e<6;e++){let e=t.createRadialGradient(r+n()*256,i+n()*256,2,r+n()*256,i+n()*256,40+n()*60);e.addColorStop(0,`rgba(140,140,138,0.10)`),e.addColorStop(1,`rgba(140,140,138,0)`),t.fillStyle=e,t.fillRect(r,i,256,256)}t.restore(),t.lineWidth=5,t.strokeStyle=`rgba(8,8,9,0.55)`,t.stroke(),t.lineWidth=2,t.strokeStyle=`rgba(150,150,146,0.22)`,t.stroke()}let r=new a(e);return r.colorSpace=u,r.anisotropy=8,r}function Rn({scene:e}){let t=Ue(9011),r=[],i=[],a=[],o=0,c=(e,t,n,s,c,l)=>{let u=c%2/2,d=Math.floor(c/2)/2,f=.5,p=[[u,d],[u+f,d],[u+f,d+f],[u,d+f]];l&&(p=[p[1],p[2],p[3],p[0]]);let m=[[e,s],[n,s],[n,t],[e,t]];for(let e=0;e<4;e++)r.push(m[e][0],.008,m[e][1]),i.push(...p[e]);a.push(o,o+1,o+2,o,o+2,o+3),o+=4},l=Qe;for(let e=0;e<Le.length;e++){let n=Le[e];for(let r=0;r+1<Ve.length;r++){if(!Je(e,r))continue;let i=Ve[r]+He(r)+9,a=Ve[r+1]-He(r+1)-9,o=7+Math.floor(t()*6);for(let e=0;e<o;e++){let e=t(),r,o,s,u;if(e>.62&&e<.78){let e=n+(t()-.5)*16,r=1.2+t()*2.2,o=3+t()*6,s=i+t()*Math.max(1,a-i-o-3),u=Math.floor(t()*4),d=(t()<.5?-1:1)*(1.4+t()*2.2),f=1+t()*1.4,p=s+t()*o*.6,m=1.2+t()*2;for(let[t,i,a,h]of[[e-r/2,s,e+r/2,s+o],[Math.min(e,e+d)-f/2,p,Math.max(e,e+d)+f/2,p+m]]){let e=Math.max(t,n-G.AV_HALF+.2),r=Math.min(a,n+G.AV_HALF-.2);r-e<.5||r>l.x0&&e<l.x1&&h>l.z0&&i<l.z1||c(e,i,r,h,u,h-i>r-e)}continue}if(e<.5){let e=Math.floor(t()*6),c=n-9+e*3.6+(t()-.5)*.8,l=.9+t()*1.6,d=4+t()*9,f=i+t()*Math.max(1,a-i-d);r=c-l/2,o=c+l/2,s=f,u=f+d}else if(e<.8){let e=n+(t()-.5)*18,c=1+t()*1.8,l=1.8+t()*4.2,d=i+t()*(a-i-l);r=e-c/2,o=e+c/2,s=d,u=d+l}else if(e<.88){let e=2+Math.floor(t()*2),c=Math.floor(t()*(7-e)),l=7+t()*9,d=i+t()*Math.max(1,a-i-l);r=n-G.AV_HALF+.5+c*3.5,o=r+e*3.5,s=d,u=d+l}else{let e=t()<.5?-1:1,c=5+t()*5,l=.9+t()*.8,d=i+t()*(a-i-l);r=e<0?n-G.AV_HALF+.3:n+G.AV_HALF-.3-c,o=r+c,s=d,u=d+l}if(r=Math.max(r,n-G.AV_HALF+.2),o=Math.min(o,n+G.AV_HALF-.2),o-r<.5||u<=s||o>l.x0&&r<l.x1&&u>l.z0&&s<l.z1)continue;let d=Math.floor(t()*4);(e<.5||e>=.8&&e<.88)&&!(d&1)&&Math.abs(Math.sin(r*12.9898+s*78.233)*43758.5453)%1<.65&&d++,c(r,s,o,u,d,u-s>o-r)}}}for(let e=0;e<Ve.length;e++){let n=Ve[e];for(let r=0;r<2*Le.length+1;r+=2){let i=Re(e,r);if(!i)continue;let[a,o]=i;if(!(o-a<30||t()<.15))for(let r=0,i=2+Math.floor(t()*3);r<i;r++){let r=1.5+t()*6,i=1+t()*2.8,s=a+8+t()*(o-a-16-r),l=n-He(e)+.3+t()*(2*He(e)-.6-i);c(s,l,s+r,l+i,Math.floor(t()*4),!1)}}}let u=new x;u.setAttribute(`position`,new s(r,3)),u.setAttribute(`normal`,new s(Array(o).fill(0).flatMap(()=>[0,1,0]),3)),u.setAttribute(`uv`,new s(i,2)),u.setIndex(new n(a,1)),u.computeBoundingSphere();let d=new C({map:Ln(),transparent:!0,depthWrite:!1,roughness:.8,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),f=new g(u,d);return f.name=`roadPatches`,f.receiveShadow=!0,f.renderOrder=0,e.add(f),f}var Z={MH_A:0,MH_B:1,PLATE:2,GRATE:3,OIL_A:4,OIL_B:5,TAR_A:6,TAR_B:7,DRIP:8,GUTTER:9,AO:10,STAIN:11,BLOT:12};function zn(){let e=document.createElement(`canvas`);e.width=e.height=1024;let t=e.getContext(`2d`),n=Ue(4711),r=(e,n)=>{t.save(),t.translate(e%4*256,Math.floor(e/4)*256),t.beginPath(),t.rect(0,0,256,256),t.clip(),n(),t.restore()},i=(e,r,i,a=.5,o=0,s=0,c=256,l=256)=>{for(let u=0;u<e;u++){let e=o+n()*c,u=s+n()*l,d=.6+n()*1.8;t.fillStyle=n()<a?`rgba(150,145,138,${r+n()*(i-r)})`:`rgba(8,8,9,${r+n()*(i-r)})`,t.fillRect(e,u,d,d)}},o=(e,n,r,i,a=`10,10,12`)=>{let o=t.createRadialGradient(e,n,0,e,n,r);o.addColorStop(0,`rgba(${a},${i})`),o.addColorStop(.6,`rgba(${a},${i*.5})`),o.addColorStop(1,`rgba(${a},0)`),t.fillStyle=o,t.fillRect(e-r,n-r,2*r,2*r)};for(let[e,a]of[[Z.MH_A,!1],[Z.MH_B,!0]])r(e,()=>{if(t.fillStyle=`rgba(12,12,13,0.55)`,t.beginPath(),t.arc(128,128,124,0,7),t.fill(),t.fillStyle=`rgba(52,48,44,0.97)`,t.beginPath(),t.arc(128,128,112,0,7),t.fill(),t.strokeStyle=`rgba(96,74,52,0.9)`,t.lineWidth=7,t.beginPath(),t.arc(128,128,109,0,7),t.stroke(),t.save(),t.beginPath(),t.arc(128,128,100,0,7),t.clip(),t.strokeStyle=`rgba(120,116,108,0.75)`,t.lineWidth=3,a){for(let e=22;e<100;e+=17)t.beginPath(),t.arc(128,128,e,0,7),t.stroke();for(let e=0;e<16;e++){let n=e/16*Math.PI*2;t.beginPath(),t.moveTo(128+Math.cos(n)*22,128+Math.sin(n)*22),t.lineTo(128+Math.cos(n)*100,128+Math.sin(n)*100),t.stroke()}t.fillStyle=`rgba(40,38,35,0.95)`,t.fillRect(68,116,120,24),t.fillStyle=`rgba(130,125,115,0.7)`;for(let e=0;e<9;e++)t.fillRect(74+e*12.5,121,8,14)}else for(let e=-100;e<100;e+=13)for(let r=-100;r<100;r+=13)(e/13+r/13)%2==0&&(t.fillStyle=`rgba(118,114,106,${.45+n()*.3})`,t.fillRect(128+e,128+r,9,9));o(128+(n()-.5)*80,128+(n()-.5)*80,70,.35,`70,48,30`),i(500,.1,.3,.4),t.restore()});r(Z.PLATE,()=>{t.fillStyle=`rgba(58,56,53,0.96)`,t.fillRect(6,6,244,244),t.strokeStyle=`rgba(105,100,92,0.55)`,t.lineWidth=2;for(let e=10;e<246;e+=10)for(let n=10+(e%20?5:0);n<246;n+=10)t.beginPath(),t.moveTo(n-3,e-3),t.lineTo(n+3,e+3),t.stroke();for(let e=0;e<5;e++)o(20+n()*216,20+n()*216,30+n()*50,.35,`92,58,32`);t.strokeStyle=`rgba(15,15,16,0.85)`,t.lineWidth=6,t.strokeRect(6,6,244,244),i(600,.1,.3)}),r(Z.GRATE,()=>{t.fillStyle=`rgba(30,29,28,0.97)`,t.fillRect(10,60,236,136),t.fillStyle=`rgba(5,5,6,0.95)`;for(let e=26;e<230;e+=16)t.fillRect(e,74,8,108);t.strokeStyle=`rgba(88,80,70,0.8)`,t.lineWidth=6,t.strokeRect(12,62,232,132),o(128,128,120,.3)}),r(Z.OIL_A,()=>{for(let e=0;e<14;e++)o(128+(n()-.5)*120,128+(n()-.5)*170,18+n()*45,.16+n()*.14);i(300,.05,.15,.2,40,30,176,196)}),r(Z.OIL_B,()=>{for(let e=0;e<26;e++)o(30+n()*196,30+n()*196,6+n()*22,.18+n()*.2)});for(let e of[Z.TAR_A,Z.TAR_B])r(e,()=>{t.strokeStyle=`rgba(6,6,7,0.62)`,t.lineCap=`round`,t.lineJoin=`round`;let r=e===Z.TAR_A?2:5;for(let i=0;i<r;i++){let r=n()*256,i=0,a=Math.PI/2+(n()-.5)*.6;t.lineWidth=4+n()*4,t.beginPath(),t.moveTo(r,i),e===Z.TAR_B&&(r=n()*256,i=n()*256,t.moveTo(r,i),a=n()*7);for(let e=0;e<40;e++)a+=(n()-.5)*.7,r+=Math.cos(a)*8,i+=Math.sin(a)*8,t.lineTo(r,i);t.stroke()}});r(Z.DRIP,()=>{let e=t.createLinearGradient(0,0,256,0);e.addColorStop(0,`rgba(10,10,12,0)`),e.addColorStop(.3,`rgba(10,10,12,0.1)`),e.addColorStop(.5,`rgba(10,10,12,0.22)`),e.addColorStop(.7,`rgba(10,10,12,0.1)`),e.addColorStop(1,`rgba(10,10,12,0)`),t.fillStyle=e,t.fillRect(0,0,256,256);for(let e=0;e<90;e++)o(128+(n()-.5)*70,n()*256,3+n()*9,.15+n()*.2);for(let e of[30.72,225.28]){let n=t.createLinearGradient(e-20,0,e+20,0);n.addColorStop(0,`rgba(120,120,122,0)`),n.addColorStop(.5,`rgba(120,120,122,0.07)`),n.addColorStop(1,`rgba(120,120,122,0)`),t.fillStyle=n,t.fillRect(e-20,0,40,256)}let r=t.createLinearGradient(0,0,0,256);r.addColorStop(0,`rgba(0,0,0,1)`),r.addColorStop(.15,`rgba(0,0,0,0)`),r.addColorStop(.85,`rgba(0,0,0,0)`),r.addColorStop(1,`rgba(0,0,0,1)`),t.globalCompositeOperation=`destination-out`,t.fillStyle=r,t.fillRect(0,0,256,256),t.globalCompositeOperation=`source-over`}),r(Z.GUTTER,()=>{let e=t.createLinearGradient(0,0,256,0);e.addColorStop(0,`rgba(14,13,12,0.5)`),e.addColorStop(.25,`rgba(14,13,12,0.32)`),e.addColorStop(.7,`rgba(14,13,12,0.08)`),e.addColorStop(1,`rgba(14,13,12,0)`),t.fillStyle=e,t.fillRect(0,0,256,256);for(let e=0;e<40;e++)o(n()*256*.5,n()*256,8+n()*24,.12+n()*.12);for(let e=0;e<260;e++){let e=n()*256*.35,r=n()*256;t.fillStyle=n()<.5?`rgba(${110+n()*40},${80+n()*30},${40+n()*20},0.5)`:`rgba(170,165,155,${.2+n()*.3})`,t.fillRect(e,r,1+n()*3,1+n()*3)}}),r(Z.AO,()=>{let e=t.createLinearGradient(0,0,256,0);e.addColorStop(0,`rgba(10,9,8,0.62)`),e.addColorStop(.12,`rgba(10,9,8,0.4)`),e.addColorStop(.45,`rgba(10,9,8,0.12)`),e.addColorStop(1,`rgba(10,9,8,0)`),t.fillStyle=e,t.fillRect(0,0,256,256);for(let e=0;e<30;e++)o(n()*256*.25,n()*256,6+n()*18,.1)}),r(Z.STAIN,()=>{for(let e=0;e<10;e++)o(30+n()*196,30+n()*196,15+n()*40,.08+n()*.08);for(let e=0;e<160;e++)t.fillStyle=`rgba(20,20,20,${.25+n()*.3})`,t.beginPath(),t.arc(n()*256,n()*256,1+n()*2,0,7),t.fill()}),r(Z.BLOT,()=>{for(let e=0;e<8;e++)o(64+n()*128,64+n()*128,30+n()*60,.1+n()*.08,`22,20,18`)});let s=new a(e);return s.colorSpace=u,s.anisotropy=8,s}var Bn=[];function Vn({scene:e,buildings:t=null}){Bn.length=0;let r=Ue(31337),i=[],a=[],o=[],c=0,l=1/256,u=(e,t,n,r,s,u=[0,-1],d=.01)=>{let f=e%4/4+l,p=1-(Math.floor(e/4)+1)/4+l,m=.25-2*l,[h,g]=u,_=-g,v=h,y=[[-r,-s],[r,-s],[r,s],[-r,s]],b=[[f,p],[f+m,p],[f+m,p+m],[f,p+m]];for(let e=0;e<4;e++)i.push(t+_*y[e][0]+h*y[e][1],d,n+v*y[e][0]+g*y[e][1]),a.push(...b[e]);o.push(c,c+1,c+2,c,c+2,c+3),c+=4},d=Qe,f=(e,t)=>e>d.x0-.5&&e<d.x1+.5&&t>d.z0-.5&&t<d.z1+.5,p=(e,t)=>{let n=ze(e,t).type;return(n===`avenue`||n===`street`||n===`intersection`)&&!f(e,t)},m=(e,t,n,i,a,o,s=[0,-1],c=.3,l=.01)=>{for(let d=n;d<i-2;){let n=Math.min(o*(.7+r()*.6),i-d);r()>c&&p(t,d+n/2)&&u(e,t,d+n/2,a,n/2,s,l),d+=n+r()*3}};for(let e=0;e<Le.length;e++){let t=Le[e];for(let n=0;n+1<Ve.length;n++){if(!Je(e,n))continue;let i=Ve[n]+He(n)+1.5,a=Ve[n+1]-He(n+1)-1.5;if(a-i<10)continue;for(let e of[-1,1])for(let n=0;n<3;n++){let o=t+e*(.2+G.AV_LANE*n+G.AV_LANE/2)+(r()-.5)*.3;if(m(Z.DRIP,o,i+2,a-2,n===2?.7:.8,11,[0,-1],n===2?.55:.3),n<2){for(let[e,t]of[[i+3,1],[a-3,-1]])if(r()<.75){let n=e+t*(1.5+r()*4);u(r()<.5?Z.OIL_A:Z.OIL_B,o+(r()-.5)*.4,n,.9+r()*.4,1.6+r()*.8)}}}for(let e of[-1,1]){let n=t+e*(G.AV_HALF-.4);m(Z.GUTTER,n,i-1,a+1,.4,16,[0,e],.05,.0095);for(let n of[i+1.5,a-1.5])r()<.7&&u(Z.GRATE,t+e*(G.AV_HALF-.35),n,.5,.35,[e,0],.011)}let o=2+Math.floor(r()*3);for(let e=0;e<o;e++){let n=t+(r()-.5)*16,o=i+4+r()*(a-i-8);p(n,o)&&(u(r()<.6?Z.MH_A:Z.MH_B,n,o,.48,.48,[Math.cos(e),Math.sin(e)],.0105),Bn.push([n,o]))}if(r()<.3){let e=t+(r()-.5)*12,n=i+6+r()*(a-i-12);p(e,n)&&u(Z.PLATE,e,n,1.2,.8+r()*.6,[0,-1],.0105)}for(let e of[Ve[n]+He(n)+2.3,Ve[n+1]-He(n+1)-2.3])for(let n of[-1,1])for(let i=0;i<3;i++){if(r()<.3)continue;let a=t+n*(.2+G.AV_LANE*i+G.AV_LANE/2)+(r()-.5)*.4;p(a,e)&&u(Z.DRIP,a,e,1.1+r()*.3,2.4,[0,-1],.013)}for(let e=0,n=1+Math.floor(r()*3);e<n;e++){let e=t+(r()-.5)*18,n=i+5+r()*(a-i-10);p(e,n)&&u(r()<.5?Z.TAR_A:Z.TAR_B,e,n,2+r()*2,3+r()*4,r()<.5?[0,-1]:[1,0])}}}for(let e=0;e<Ve.length;e++){let t=Ve[e];for(let n=0;n<2*Le.length+1;n+=2){let i=Re(e,n);if(!i)continue;let[a,o]=i,s=a+1.5,c=o-1.5;if(!(c-s<12)){for(let n=s+2;n<c-2;){let i=Math.min(18*(.7+r()*.6),c-n);r()>.15&&p(n+i/2,t)&&u(Z.DRIP,n+i/2,t+(r()-.5)*.4,1.1,i/2,[1,0]);for(let a of[-1,1])r()>.05&&p(n+i/2,t+a*(He(e)-.4))&&u(Z.GUTTER,n+i/2,t+a*(He(e)-.4),.4,i/2,[-a,0],.0095);n+=i+r()*2}for(let[e,n]of[[s+2,1],[c-2,-1]])r()<.6&&u(r()<.5?Z.OIL_A:Z.OIL_B,e+n*(2+r()*4),t+(r()-.5),1.6+r()*.8,.9+r()*.3,[1,0]);if(r()<.8){let e=s+6+r()*(c-s-12),n=t+(r()-.5)*4;p(e,n)&&(u(r()<.5?Z.MH_A:Z.MH_B,e,n,.48,.48,[0,-1],.0105),Bn.push([e,n]))}if(r()<.35){let e=s+6+r()*(c-s-12);p(e,t)&&u(Z.TAR_B,e,t+(r()-.5)*3,2.5,4,[1,0])}}}}for(let e=0;e<Le.length;e++)for(let t=0;t<Ve.length;t++){let n=Le[e],i=Ve[t];if(ze(n,i).type===`intersection`)for(let e=0,a=3+Math.floor(r()*4);e<a;e++){let e=n+(r()-.5)*(G.AV_HALF*1.6),a=i+(r()-.5)*(He(t)*1.4);if(!p(e,a))continue;let o=1.6+r()*2.2,s=r()*6.28;u(r()<.6?Z.BLOT:Z.OIL_A,e,a,o,o*(.7+r()*.5),[Math.cos(s),Math.sin(s)],.0102)}}let h=G.CURB_H+.006,_=(e,t)=>ze(e,t).type===`sidewalk`;if(t)for(let e of t)for(let t of e.masses||[]){if(t.y0>.2)continue;let e=[[t.x0,t.z0,t.x0,t.z1,-1,0],[t.x1,t.z0,t.x1,t.z1,1,0],[t.x0,t.z0,t.x1,t.z0,0,-1],[t.x0,t.z1,t.x1,t.z1,0,1]];for(let[t,n,i,a,o,s]of e){let e=Math.hypot(i-t,a-n);if(e<2)continue;let c=Math.max(1,Math.round(e/12)),l=e/c,d=(i-t)/e,f=(a-n)/e;for(let e=0;e<c;e++){let i=t+d*l*(e+.5),a=n+f*l*(e+.5);_(i+o*.6,a+s*.6)&&(u(Z.AO,i+o*.55,a+s*.55,.55,l/2+.02,[s,-o],h),r()<.18?u(Z.STAIN,i+o*(1.2+r()*1.6),a+s*(1.2+r()*1.6),1.2,1.2,[d,f],h+.001):r()<.12&&u(Z.BLOT,i+o*(1.5+r()*1.5),a+s*(1.5+r()*1.5),1.5,1.5,[d,f],h+.001))}}}let v=new x;v.setAttribute(`position`,new s(i,3)),v.setAttribute(`normal`,new s(new Float32Array(c*3).map((e,t)=>+(t%3==1)),3)),v.setAttribute(`uv`,new s(a,2)),v.setIndex(new n(o,1)),v.computeBoundingSphere();let y=new C({map:zn(),transparent:!0,depthWrite:!1,roughness:.78,metalness:0,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-2}),b=new g(v,y);return b.name=`streetGrime`,b.receiveShadow=!0,b.renderOrder=0,e.add(b),b}function Hn(e){let t=[];if(!e)return t;for(let n of e){let e=n.lot;if(!e||!e.sides)continue;let r=(n.masses||[]).filter(e=>e.y0<.2);if(!r.length)continue;let i={x0:Math.min(...r.map(e=>e.x0)),x1:Math.max(...r.map(e=>e.x1)),z0:Math.min(...r.map(e=>e.z0)),z1:Math.max(...r.map(e=>e.z1))},a=[[`nx`,e.x0,e.z0,i.x0,e.z1,-1,0],[`px`,i.x1,e.z0,e.x1,e.z1,1,0],[`nz`,e.x0,e.z0,e.x1,i.z0,0,-1],[`pz`,e.x0,i.z1,e.x1,e.z1,0,1]];for(let[n,r,i,o,s,c,l]of a){if(e.sides[n]!==`street`)continue;let a=c?o-r:s-i,u=c?s-i:o-r;a<4.5||u<10||Math.abs((r+o)/2)<110&&(i+s)/2>-335&&(i+s)/2<10||t.push({x0:r,z0:i,x1:o,z1:s,nx:c,nz:l,W:a,L:u})}}return t}function Un(){let e=1024,t=document.createElement(`canvas`);t.width=t.height=e;let n=t.getContext(`2d`),r=Ue(3131);n.fillStyle=`#6d6a64`,n.fillRect(0,0,e,e);let i=204.8;for(let t=0;t<10;t++)for(let a=-1;a<6;a++){let o=a*i+t%2*i/2,s=t*102.4,c=136+(r()-.5)*30,l=(r()-.5)*10,u=r()<.08?.78:1,d=(c+l)*u,f=(c+l*.4)*u,p=(c-l*.6-4)*u,m=e=>{n.fillStyle=`rgb(${d|0},${f|0},${p|0})`,n.fillRect(o+e+2,s+2,200.8,98.4)};m(0),m(e),m(-1024)}for(let t=0;t<26e3;t++){let t=r()<.5?40:220;n.fillStyle=`rgba(${t},${t},${t},${.05+r()*.08})`,n.fillRect(r()*e,r()*e,1+r()*1.5,1+r()*1.5)}for(let t=0;t<260;t++){n.fillStyle=`rgba(35,33,30,${.25+r()*.3})`;let t=1.5+r()*3;n.beginPath(),n.arc(r()*e,r()*e,t,0,7),n.fill()}for(let t=0;t<22;t++){let t=r()*e,i=r()*e,a=40+r()*140,o=n.createRadialGradient(t,i,2,t,i,a);o.addColorStop(0,`rgba(40,36,30,${.1+r()*.12})`),o.addColorStop(1,`rgba(40,36,30,0)`),n.fillStyle=o,n.fillRect(0,0,e,e)}let o=new a(t);return o.wrapS=o.wrapT=m,o.colorSpace=u,o.anisotropy=8,o}function Wn({scene:e,strips:t}){if(!t.length)return null;let r=[],i=[],a=[],o=0,c=G.CURB_H+.004,l=[],u=(e,t)=>{if(t.x0>=e.x1||t.x1<=e.x0||t.z0>=e.z1||t.z1<=e.z0)return[e];let n=[];t.z0>e.z0&&n.push({x0:e.x0,x1:e.x1,z0:e.z0,z1:t.z0}),t.z1<e.z1&&n.push({x0:e.x0,x1:e.x1,z0:t.z1,z1:e.z1});let r=Math.max(e.z0,t.z0),i=Math.min(e.z1,t.z1);return t.x0>e.x0&&n.push({x0:e.x0,x1:t.x0,z0:r,z1:i}),t.x1<e.x1&&n.push({x0:t.x1,x1:e.x1,z0:r,z1:i}),n};for(let e of t){let t=[{x0:e.x0,x1:e.x1,z0:e.z0,z1:e.z1}];if(Be)for(let e of l)t=t.flatMap(t=>u(t,e));l.push(e);let n=e.nx!==0;for(let e of t){if(e.x1-e.x0<.01||e.z1-e.z0<.01)continue;let t=[[e.x0,e.z1],[e.x1,e.z1],[e.x1,e.z0],[e.x0,e.z0]];for(let[e,a]of t)r.push(e,c,a),i.push(n?a/8:e/8,n?-e/8:-a/8);a.push(o,o+1,o+2,o,o+2,o+3),o+=4}}let d=new x;d.setAttribute(`position`,new s(r,3)),d.setAttribute(`normal`,new s(new Float32Array(o*3).map((e,t)=>+(t%3==1)),3)),d.setAttribute(`uv`,new s(i,2)),d.setIndex(new n(a,1)),d.computeBoundingSphere();let f=new C({map:Un(),roughness:.86,metalness:0,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),p=new g(d,f);return p.name=`plazaPaving`,p.receiveShadow=!0,e.add(p),p}function Gn(e,t){let n=new Te({color:13619924,roughness:1,transparent:!0,depthWrite:!1});n.name=`CitySteam.TSL`;let r=ue(t.value);r.onRenderUpdate(()=>{r.value=t.value});let i=ve(`aPuff`,`vec4`),a=B(r.mul(.11).add(i.w)),o=i.y.lessThan(-1),s=N(o,z(.65),z(1)),c=z(5.5).mul(z(1).sub(z(1).sub(a).pow(2))).mul(N(o,.65,1)),l=W(.5,3,L(a)).mul(N(o,.55,1)),u=a.mul(a).mul(3.2),d=i.xyz.add(V(u.mul(.8).add(H(i.w.mul(40).add(r.mul(.6))).mul(a).mul(.35)),z(2.55).add(c),u.mul(.35).add(H(i.w.mul(23).add(r.mul(.4))).mul(a).mul(.5)))),f=ye,p=f.element(0).xyz,m=f.element(1).xyz,h=i.w.mul(17).add(r.mul(.12)),g=ie.xy,_=U(g.x.mul(te(h)).sub(g.y.mul(H(h))),g.x.mul(H(h)).add(g.y.mul(te(h))));n.positionNode=d.add(p.mul(_.x).mul(l).mul(1.25)).add(m.mul(_.y).mul(l));let v=ge.sub(d).length(),y=j(0,.12,a).mul(z(1).sub(j(.25,1,a))).mul(z(1).sub(j(160,320,v))).mul(j(.6,2.5,v)),b=be(y,`vSteamFade`),x=be(a,`vSteamAge`),S=pe(),C=S.mul(.45).add(B(U(i.w.mul(3.1),i.w.mul(7.7)).add(U(r.mul(.01),r.mul(-.03))))),w=M(e,C).g.mul(.55),T=M(e,C.mul(2.7).add(.37)).r.mul(.45),E=w.add(T),D=S.sub(.5).length().mul(2),O=z(1).sub(j(.1,1,D)),k=j(.25,.75,E.add(O.mul(.2)).sub(x.mul(.15)));return n.opacityNode=b.mul(.3).mul(O).mul(O).mul(k).mul(s),n.emissiveNode=V(.018,.018,.018),n}var Kn=`// props shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
in vec4 aPuff;
uniform float uTime;
out float vFade;
out vec2 vPuv;
out float vAge;
// @section vertexBeginNormalVertex
vec3 objectNormal = normalize(vec3(0.0, 0.8, 0.0) + normalize(cameraPosition - aPuff.xyz));
#ifdef USE_TANGENT
vec3 objectTangent = vec3(1.0, 0.0, 0.0);
#endif
// @section vertexBeginVertex

float ph = fract(uTime * 0.11 + aPuff.w);
float lowV = aPuff.y < -1.0 ? 1.0 : 0.0;                  // (street r7) manhole wisp (vent y = -2.5): thinner, lower
float h = 5.5 * (1.0 - (1.0 - ph) * (1.0 - ph)) * (1.0 - 0.35 * lowV); // decelerating rise (~5.5 m)
float rad = mix(0.5, 3.0, sqrt(ph)) * (1.0 - 0.45 * lowV);
vec2 wind = vec2(0.8, 0.35) * (ph * ph * 3.2);
vec3 c = aPuff.xyz + vec3(wind.x + sin(aPuff.w * 40.0 + uTime * 0.6) * 0.35 * ph, 2.55 + h, wind.y + sin(aPuff.w * 23.0 + uTime * 0.4) * 0.5 * ph);
vec3 camR = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
vec3 camU = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
float rot = aPuff.w * 17.0 + uTime * 0.12;
vec2 q = mat2(cos(rot), -sin(rot), sin(rot), cos(rot)) * position.xy;
vec3 transformed = c + (camR * q.x * 1.25 + camU * q.y) * rad;
float dCam = length(cameraPosition - c);
vFade = smoothstep(0.0, 0.12, ph) * (1.0 - smoothstep(0.25, 1.0, ph)) * (1.0 - smoothstep(160.0, 320.0, dCam)) * smoothstep(0.6, 2.5, dCam);                              // fade out when the lens is inside a puff
vAge = ph;
vPuv = uv * 0.45 + fract(vec2(aPuff.w * 3.1, aPuff.w * 7.7) + vec2(uTime * 0.01, - uTime * 0.03));
// @section vertexProjectVertex
vec4 mvPosition = viewMatrix * vec4(transformed, 1.0);
gl_Position = projectionMatrix * mvPosition;
// @section vertexWorldPositionVertex
vec4 worldPosition = vec4(transformed, 1.0);
// @section fragmentCommon
#include <common>
in float vFade;
in vec2 vPuv;
in float vAge;
// @section fragmentAlphaMap
{
float n = texture(alphaMap, vPuv).g * 0.55 + texture(alphaMap, vPuv * 2.7 + 0.37).r * 0.45;
float r = length(vAlphaMapUv - 0.5) * 2.0;
float disc = 1.0 - smoothstep(0.1, 1.0, r);
disc *= disc;
diffuseColor.a *= vFade * 0.3 * disc * smoothstep(0.25, 0.75, n + disc * 0.2 - vAge * 0.15);
if(diffuseColor.a < 0.008) discard;
}
// @section fragmentEmissive
#include <emissivemap_fragment>
totalEmissiveRadiance += diffuseColor.rgb * 0.06;
// @section vertexCommonByFaceUv
#include <common>
in vec4 aCell;
out vec2 vFaceUv;
// @section vertexUvVertex
#include <uv_vertex>
vFaceUv = uv;
vMapUv = aCell.xy + vec2(uv.y, 1.0 - uv.x) * aCell.zw; // text runs up the face
// @section vertexProjectVertexGrassFarCull
#include <project_vertex>
{
vec3 ip = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
vec2 dd = ip.xz - cameraPosition.xz;
if(dot(dd, dd) > 90000.0) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
} // beyond the blade frames' far cull (300 m)
// @section fragmentCommonByFaceUv
#include <common>
in vec2 vFaceUv;
uniform float uScreenK;
uniform float uNightK;
// @section fragmentEmissiveByFaceUv
#include <emissivemap_fragment>
{ // lit from inside: centre brightest, rim ~55 % (tubes behind the face); ~day level by day, x2.2 at night (screenK
          // cancels the preset exposure): a white board tops out ~0.13 pre-exposure = ~170 sRGB at night
float ex = min(vFaceUv.x, 1.0 - vFaceUv.x) * 2.0, ey = min(vFaceUv.y, 1.0 - vFaceUv.y) * 2.0 * 2.3;
float lit = 0.55 + 0.45 * smoothstep(0.0, 0.8, min(ex, ey));
          // (night r6) at night the board colour is lifted by a power curve on its peak channel (m^0.45): dark navy / green
          // boards glow ~110-150 sRGB while white glyphs stay ~0.75 of clip (critic r6: 'unlit painted boards' at x2.2 linear)
vec3 bt = diffuseColor.rgb;
float bm = max(max(bt.r, bt.g), bt.b) + 1e-4;
vec3 bNight = bt / bm * pow(bm, 0.45) * 2.0;
totalEmissiveRadiance += mix(bt * 0.5, bNight, uNightK) * lit * uScreenK;
}
// @section vertexCommonByGain
#include <common>
in vec4 aCell;
in float aGain;
out float vGain;
// @section vertexFogVertex
#include <fog_vertex>
vGain = aGain;
// @section vertexUvVertexByEmissiveMapUv
#include <uv_vertex>
#ifdef USE_MAP
vMapUv = aCell.xy + uv * aCell.zw;
#endif
#ifdef USE_EMISSIVEMAP
vEmissiveMapUv = vMapUv;
#endif
// @section fragmentCommonByGain
#include <common>
in float vGain;
uniform float uNightK;
// @section fragmentEmissiveByGain
#include <emissivemap_fragment>
totalEmissiveRadiance *= mix(vGain, max(vGain, 0.25), uNightK) / 0.06; // (night r9) rooftop prints floodlit at night
// @section fragmentMap
#include <map_fragment>
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.3, 0.55, 0.15))), 0.18) * 0.9 + 0.012;
// @section vertexCommonByPitCameraPosition
#include <common>
out vec3 vPitL;
out vec3 vPitCam;
// @section vertexProjectVertexByPitCameraPosition
#include <project_vertex>
vPitL = position;
        #ifdef USE_INSTANCING
vPitCam = (inverse(modelMatrix * instanceMatrix) * vec4(cameraPosition, 1.0)).xyz;
        #else
vPitCam = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
        #endif
// @section fragmentCommonByPitCameraPosition
#include <common>
uniform mat4 projectionMatrix;
in vec3 vPitL;
in vec3 vPitCam;
// @section fragmentClipping
#include <clipping_planes_fragment>
{
float h = vPitCam.y;
if(h < 0.04) discard;
float den = max(h - vPitL.y, 1e-3);
float tA = (h - 0.035) / den, tB = (h - 0.006) / den;
vec3 Q = vPitCam + (vPitL - vPitCam) * tB;
if(abs(Q.x) > 2.27 || abs(Q.z) > 0.83) discard;
float k = clamp(- vPitL.y / 4.0, 0.0, 1.0);
vec3 Pv = - vViewPosition;
vec4 cq = projectionMatrix * vec4(Pv * mix(tA, tB, k), 1.0);
vec4 cp = projectionMatrix * vec4(Pv, 1.0);
float nz = cq.z / cq.w, pz = cp.z / cp.w;
bool zeroOne = abs(gl_FragCoord.z - pz) < abs(gl_FragCoord.z - (0.5 * pz + 0.5));
gl_FragDepth = zeroOne ? nz : 0.5 * nz + 0.5;
}
`,qn=`// flags shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
in vec3 aTint;
uniform float uTime;
// @section vertexColorVertex
#include <color_vertex>
vColor.rgb *= aTint;
// @section vertexBeginVertex
#include <begin_vertex>
float w = (transformed.x - 0.35) / 2.1;
float ph = uTime * 5.0 - transformed.x * 2.6 + instanceMatrix[3].x * 0.37;
transformed.z += sin(ph) * 0.16 * w + sin(ph * 1.7 + 1.0) * 0.05 * w;
objectNormal = normalize(vec3(- cos(ph) * 0.3 * w, 0.0, 1.0));
`,Jn=`// rooftops shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
in vec4 aM;
in vec4 aE;
out vec2 vRUv;
flat out vec4 vM;
flat out vec4 vE;
out vec3 vRWP;
out vec3 vRWN;
// @section vertexFogVertex
#include <fog_vertex>
vRUv = uv;
vM = aM;
vE = aE;
vRWP = (modelMatrix * vec4(transformed, 1.0)).xyz;
vRWN = normalize(mat3(modelMatrix) * objectNormal);
// @section fragmentCommon
#include <common>
uniform highp sampler2DArray tRoofC;
uniform highp sampler2DArray tRoofN;
uniform sampler2D tNoiseR;
in vec2 vRUv;
flat in vec4 vM;
flat in vec4 vE;
in vec3 vRWP;
in vec3 vRWN;
float rR;
float rM;
vec3 rN;
const float ROUGH[__SHADER_INJECT_0__] = float[__SHADER_INJECT_1__](__SHADER_INJECT_2__);
const float PONDS[__SHADER_INJECT_3__] = float[__SHADER_INJECT_4__](__SHADER_INJECT_5__);
const float SEAM[__SHADER_INJECT_6__] = float[__SHADER_INJECT_7__](__SHADER_INJECT_8__);
const float TARP[__SHADER_INJECT_9__] = float[__SHADER_INJECT_10__](__SHADER_INJECT_11__);
float rHash(vec2 p) {
return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
// @section fragmentColor
#include <color_fragment>
{
vec3 N = normalize(vRWN);
rR = 0.85;
rM = 0.0;
rN = vec3(0.0, 0.0, 1.0);
float cell = vM.x;
vec2 tuv = vRUv * vM.y;
vec3 nz = texture(tNoiseR, vRWP.xz / 70.0 + vRWP.y / 130.0).rgb;
vec3 nz2 = texture(tNoiseR, vRWP.xz / 13.0 + 0.37).rgb;
int ci = int(cell + 0.5);
if(cell > - 0.5) {
vec3 tc = texture(tRoofC, vec3(tuv, cell)).rgb;
diffuseColor.rgb *= tc;
rR = ROUGH[ci];
rN = texture(tRoofN, vec3(tuv, cell)).xyz * 2.0 - 1.0;
rN.xy *= 0.8;
}
if(vM.w > 0.5) { // rooftop pool water: dark teal, glossy, gentle ripples
float rip = texture(tNoiseR, vRWP.xz / 3.0).g;
diffuseColor.rgb = vec3(0.09, 0.3, 0.34) * (0.85 + 0.3 * rip);
rR = 0.08; // r4: lighter pool blue (ref 02 / 03) rN = normalize(vec3((rip - 0.5) * 0.15, 0.0, 1.0));
}
if(ci == __SHADER_INJECT_0__) diffuseColor.rgb *= 1.5; // r4: dusty, weathered rubber (pure black read as holes)
// macro tone variation (kills repetition across a roof)
diffuseColor.rgb *= (0.86 + 0.26 * nz.r) * (0.94 + 0.12 * nz2.g);
if(vM.z > 0.0) { // roof skin
// parapet grime: dark wet band at the base of the parapet, streaky, fading into the field
float d = min(min(vRUv.x - vE.x, vE.z - vRUv.x), min(vRUv.y - vE.y, vE.w - vRUv.y));
float ed = d + (nz2.b - 0.5) * 0.9;
diffuseColor.rgb *= mix(0.4, 1.0, smoothstep(0.0, vM.z * 2.2, ed)); // r4: deeper soot band
diffuseColor.rgb *= mix(vec3(0.93, 0.9, 0.84), vec3(1.0), smoothstep(0.0, vM.z * 4.0, ed)); // dust / rust-brown drift toward the walls
// r6: per-roof dirt gradient (roofs drain / collect soot toward one side) + drain sumps: dark wet blotches
{
vec2 rsz = max(vE.zw - vE.xy, vec2(1.0)), rc = (vRUv - vE.xy) / rsz;
float ang = rHash(floor(vE.xy * 0.37)) * 6.2832;
float gdt = dot(rc - 0.5, vec2(cos(ang), sin(ang)));
diffuseColor.rgb *= 1.0 - (0.08 + 0.12 * rHash(floor(vE.zw))) * smoothstep(- 0.55, 0.55, gdt);
vec2 dp = vE.xy + rsz * vec2(0.25 + 0.5 * rHash(floor(vE.xy) + 1.7), 0.25 + 0.5 * rHash(floor(vE.zw) + 2.9));
float dd = length(vRUv - dp) + (nz2.r - 0.5) * 1.6;
float sump = 1.0 - smoothstep(0.4, 2.6 + 1.5 * rHash(floor(vE.xy) + 4.1), dd);
diffuseColor.rgb *= 1.0 - 0.3 * sump;
rR = mix(rR, 0.35, sump * 0.6);
}
          // r4: sheets / rolls: per-sheet tone + dark lap seams (antialiased), end laps every ~12 m
if(ci >= 0 && ci < __SHADER_INJECT_1__ && SEAM[ci] > 0.0) {
float su = vRUv.x / SEAM[ci], sid = floor(su);
diffuseColor.rgb *= 0.92 + 0.16 * rHash(vec2(sid, floor(vE.x * 0.7)));
float fu = fract(su), fwu = max(fwidth(su), 1e-4);
float seam = 1.0 - smoothstep(0.0, fwu * 1.2 + 0.02, min(fu, 1.0 - fu));
float sv = (vRUv.y + rHash(vec2(sid, 3.7)) * 12.0) / 12.0, fv = fract(sv), fwv = max(fwidth(sv), 1e-4);
seam = max(seam, 0.7 * (1.0 - smoothstep(0.0, fwv * 1.2 + 0.004, min(fv, 1.0 - fv))));
diffuseColor.rgb *= 1.0 - 0.3 * seam * smoothstep(0.6, 0.15, fwu);
}
          // r4: hot-mopped tar patches (dark, semi-glossy blotches with crisp edges)
if(ci >= 0 && ci < __SHADER_INJECT_2__ && TARP[ci] > 0.5) {
float tpn = texture(tNoiseR, vRWP.xz / 7.0 + vec2(0.23, 0.71)).r * 0.65 + texture(tNoiseR, vRWP.zx / 29.0 + 0.5).g * 0.35;
float tp = smoothstep(0.64, 0.66, tpn);
diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.28 + vec3(0.012), tp * 0.85);
rR = mix(rR, 0.5, tp);
}
          // world-space stains at three scales (non-repeating) : soot / algae / dust drifts
vec3 w1 = texture(tNoiseR, vRWP.xz / 41.0 + 0.13).rgb;
vec3 w2 = texture(tNoiseR, vRWP.zx / 17.0 + 0.71).rgb;
float stain = smoothstep(0.52, 0.8, w1.g * 0.55 + w2.r * 0.45);
diffuseColor.rgb *= 1.0 - 0.26 * stain;
diffuseColor.rgb *= mix(vec3(1.0), vec3(1.03, 1.0, 0.95), smoothstep(0.55, 0.85, w2.b)); // rust / tannin tinge (r4: weaker, read green on grey)
          // repair patches: rectangles on a per-roof grid (uv already carries a per-roof random offset)
          // r4: only on membranes / coatings (not ballast or pavers), rarer and bigger (the small ones read as camo squares)
vec2 pg = vec2(6.0 + 3.0 * rHash(floor(vE.xy)), 4.5 + 3.0 * rHash(floor(vE.zw)));
vec2 pc = floor(vRUv / pg), pf = fract(vRUv / pg);
float ph = fract(sin(dot(pc, vec2(12.9898, 78.233)) + dot(floor(vE.xy), vec2(0.0137, 0.0291))) * 43758.5453);
vec2 pa = vec2(0.05 + 0.3 * rHash(pc + 3.1), 0.05 + 0.3 * rHash(pc + 7.7)), pb = vec2(0.6 + 0.35 * rHash(pc + 1.3), 0.55 + 0.4 * rHash(pc + 5.9));
if(ci >= 0 && ci < __SHADER_INJECT_3__ && TARP[ci] > 0.5 && ph < 0.07 && pf.x > pa.x && pf.y > pa.y && pf.x < pb.x && pf.y < pb.y) {
diffuseColor.rgb *= 0.7 + ph * 5.0;
rR = min(1.0, rR + 0.05);
}
          // ponding on flat membranes: dark, glossy puddle stains with a dried rim
if(ci >= 0 && ci < __SHADER_INJECT_4__ && PONDS[ci] > 0.5) {
float pw = texture(tNoiseR, vRWP.xz / 9.0 + vec2(0.61, 0.27)).b * 0.7 + w1.r * 0.3;
float pond = smoothstep(0.66, 0.72, pw), rim = smoothstep(0.6, 0.66, pw) - pond;
diffuseColor.rgb *= (1.0 - 0.32 * pond) * (1.0 + 0.1 * rim);
rR = mix(rR, 0.18, pond);
rN = normalize(mix(rN, vec3(0.0, 0.0, 1.0), pond));
}
} else { // clutter: grime + contact darkening near the base, rain streaks on the sides
float hb = vRWP.y - vE.x;
diffuseColor.rgb *= mix(0.55, 1.0, smoothstep(0.0, 0.45, hb));
if(abs(N.y) < 0.5) {
diffuseColor.rgb *= 1.0 - 0.22 * smoothstep(0.55, 0.9, texture(tNoiseR, vec2((vRWP.x + vRWP.z) * 0.7, vRWP.y * 0.06)).g);
// r8: rust runs + weathering on sheet-metal housings (critic: "boxes look like primitive cubes, add rust")
if(ci == __SHADER_INJECT_5__ || ci == __SHADER_INJECT_6__) {
float rn = texture(tNoiseR, vec2((vRWP.x - vRWP.z) * 1.7 + 0.13, vRWP.y * 0.09 + 0.41)).r * 0.7 + nz2.b * 0.3;
diffuseColor.rgb *= mix(vec3(1.0), vec3(0.86, 0.7, 0.55), smoothstep(0.58, 0.82, rn) * 0.75);
}
} else if(vM.w < 0.5) { // tops: dusty, blotchy, a rust bloom here and there (sun-lit clean tops read as white dice)
float tb = texture(tNoiseR, vRWP.xz / 2.3 + 0.57).g;
diffuseColor.rgb *= (0.9 + 0.16 * tb) * mix(vec3(1.0), vec3(0.9, 0.8, 0.68), smoothstep(0.66, 0.86, nz2.r) * 0.6);
}
if(ci == __SHADER_INJECT_7__ || ci == __SHADER_INJECT_8__) rM = 0.2;
}
diffuseColor.rgb = mix(vec3(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722))), diffuseColor.rgb, 0.64); // muted (r3: 0.82 -> 0.64, critic: saturated colour cards)
}
// @section fragmentRoughness
float roughnessFactor = rR;
// @section fragmentMetalness
float metalnessFactor = rM;
// @section fragmentNormalMaps
#include <normal_fragment_maps>
{
vec3 Nw = normalize(vRWN);
vec3 Tw, Bw;
if(abs(Nw.y) > 0.5) {
Tw = vec3(1.0, 0.0, 0.0);
Bw = vec3(0.0, 0.0, - 1.0);
} else {
Tw = normalize(cross(vec3(0.0, 1.0, 0.0), Nw));
Bw = vec3(0.0, 1.0, 0.0);
}
vec3 nw = normalize(Tw * rN.x + Bw * rN.y + Nw * rN.z);
if(rN.z < 0.9999) normal = normalize((viewMatrix * vec4(nw, 0.0)).xyz);
}
// @section vertexCommonByRoofDistance
#include <common>
in vec4 aS;
in vec4 aT;
out vec4 vS;
out vec4 vT;
out float vSD;
// @section vertexFogVertexByRoofTrim
#include <fog_vertex>
vS = aS;
vT = aT;
vSD = length((modelViewMatrix * vec4(transformed, 1.0)).xyz);
// @section fragmentCommonByRoofTrim
#include <common>
uniform sampler2D tNoiseS;
in vec4 vS;
in vec4 vT;
in float vSD;
// @section fragmentColorByRoofDistance
#include <color_fragment>
{
float u = vS.x, d = vS.y, H = vS.z, k = vS.w;
float n1 = texture(tNoiseS, vec2(u / 11.0, 0.37)).r * 0.6 + texture(tNoiseS, vec2(u / 3.1, 0.71)).g * 0.4; // per-column run length
float n2 = texture(tNoiseS, vec2(u / 0.9, d / 70.0 + 0.13)).b * 0.7 + texture(tNoiseS, vec2(u / 0.37, d / 30.0 + 0.61)).r * 0.3; // fine streak columns
float len = H * (0.2 + 1.1 * smoothstep(0.3, 0.75, n1));
float fall = 1.0 - smoothstep(0.0, len, d);
float streak = smoothstep(0.44, 0.62, n2) * fall;
float band = (1.0 - smoothstep(0.0, 0.3 + 0.6 * n1, d));                                                  // drip line under the cap
float wash = (1.0 - smoothstep(0.0, H * 0.8, d));                                                          // general soiling under the cap
float dark = k * clamp(streak * 0.75 + band * 0.5 + wash * 0.2, 0.0, 0.8) * smoothstep(820.0, 450.0, vSD) * mix(0.35, 1.0, smoothstep(45.0, 200.0, vSD)); // (park r10) near walls: soot was crushing shaded facades to black at swing range
diffuseColor.rgb = vec3(1.0) - dark * vec3(0.8, 0.85, 0.93);                                               // brownish soot (multiplied)
        // r7: blank party walls (the big salmon brick slabs seen from above): per-wall hue, big weathering blotches,
        // patched / repointed brick rectangles and old tar roof-lines of demolished neighbours
if(vT.w > 0.0) {
float fd = smoothstep(900.0, 500.0, vSD);
vec3 tint = mix(vec3(1.0), vT.rgb, fd);
float b1 = texture(tNoiseS, vec2(u / 19.0 + 0.21, d / 23.0 + 0.47)).g, b2 = texture(tNoiseS, vec2(u / 6.0 + 0.6, d / 7.5 + 0.1)).r;
float blot = smoothstep(0.45, 0.8, b1 * 0.7 + b2 * 0.3);
vec2 pc = floor(vec2(u / 4.3, d / 3.1)), pf = fract(vec2(u / 4.3, d / 3.1));
float ph = fract(sin(dot(pc, vec2(12.9898, 78.233)) + vT.w * 17.0) * 43758.5453);
float patchv = (ph < 0.12 && pf.x > 0.1 && pf.y > 0.15 && pf.x < 0.9 && pf.y < 0.85) ? (0.8 + ph * 1.2) : 1.0;
float gl = fract(sin(vT.w * 91.7) * 4375.5) * H * 0.7 + 2.0;
float ghost = (1.0 - smoothstep(0.0, 0.25, abs(d - gl))) * step(0.5, fract(vT.w * 7.3));
diffuseColor.rgb *= tint * (1.0 - vT.w * fd * (0.28 * blot + 0.3 * ghost)) * mix(1.0, patchv, fd);
}
        // r8: canyon occlusion at the foot of street walls (vT.w < 0: quad from the ground up H metres): sky and bounce
        // light fall off toward the street, so the street gaps read as deep canyons from swinging altitude
if(vT.w < 0.0) {
float g = clamp(d / max(H, 1.0), 0.0, 1.0);
float wn = texture(tNoiseS, vec2(u / 9.0 + 0.3, d / 5.0 + 0.8)).g;
diffuseColor.rgb = vec3(1.0) - k * g * g * (0.85 + 0.3 * wn) * vec3(0.52, 0.54, 0.58) * smoothstep(1100.0, 500.0, vSD) * mix(0.45, 1.0, smoothstep(45.0, 200.0, vSD)); // (park r10) softer up close
}
}
`,Yn=`// roofplants shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
in vec4 aPlant; out vec3 vPTint; out float vPY;
// @section vertexUvVertex
#include <uv_vertex>
#ifdef USE_INSTANCING
{ float t = floor(aPlant.x + 0.5), d = floor(aPlant.x / 4.0 + 0.001); // aPlant.x = tile + 4 * geometry default tile
t = t - d * 4.0;
vec2 off = vec2(mod(t, 2.0), floor(t / 2.0)) * 0.5 - vec2(mod(d, 2.0), floor(d / 2.0)) * 0.5;
vMapUv += off; }
#endif
vPTint = aPlant.yzw; vPY = position.y;
// @section fragmentCommon
#include <common>
      in vec3 vPTint; in float vPY;
// @section fragmentMap
#include <map_fragment>
      diffuseColor.rgb *= vPTint * mix(0.55, 1.0, smoothstep(0.0, 0.6, vPY)); // tint + darker at the soil (self-shade)
`,Xn=Xe(`nobatch`),Zn=Xe(`nowarm`),Qn=512,$n=new T({colorWrite:!1,depthWrite:!1,depthTest:!1}),er=e=>Object.keys(e.attributes).sort().map(t=>t+e.attributes[t].itemSize+(e.attributes[t].normalized?`n`:``)+e.attributes[t].array.constructor.name).join(`,`)+(e.index?`|i`:``);function tr(e,t,n,r){let i=new g(e,t);return i.name=n,i.castShadow=!!r.castShadow,i.receiveShadow=!!r.receiveShadow,r.smallCasters&&(i.userData.smallCasters=!0),r.renderOrder&&(i.renderOrder=r.renderOrder),i}function nr(t,n,r,i={},a=[]){let o=t.length,s=Array(o).fill(null),c=[],l=[],u=new Map;for(let e=0;e<o;e++){let n=t[e];if(!n)continue;let r=a[e]||[0,0],o=(Xn||i.merge===!1?`i`+e:Math.floor(r[0]/Qn)+`,`+Math.floor(r[1]/Qn))+`|`+(n.index?er(n):`noindex`+e);u.has(o)||u.set(o,[]),u.get(o).push(e)}for(let a of u.values()){let o={tiles:a,sup:null,nVis:0};if(a.length===1){let e=a[0],u=tr(t[e],n,r+` `+e,i);s[e]={m:u,grp:o,vis:!0,sh:!0,inFrustum:!0},l.push(u),t[e]=null,o.nVis=1,c.push(o);continue}let u=0,d=0;for(let e of a)u+=t[e].attributes.position.count,d+=t[e].index.count;let f=new x,p=t[a[0]];for(let[n,r]of Object.entries(p.attributes)){let i=new r.array.constructor(u*r.itemSize),o=0;for(let e of a){let r=t[e].attributes[n].array;i.set(r,o),o+=r.length}f.setAttribute(n,new e(i,r.itemSize,r.normalized))}let m=new(u>65535?Uint32Array:Uint16Array)(d),h=[],g=0,_=0;for(let e of a){let n=t[e],r=n.index.array;for(let e=0;e<r.length;e++)m[_+e]=r[e]+g;n.boundingSphere||n.computeBoundingSphere(),n.boundingBox||n.computeBoundingBox(),h.push([_,r.length,n.boundingSphere,n.boundingBox]),g+=n.attributes.position.count,_+=r.length,n.dispose(),t[e]=null}let v=new e(m,1);f.setIndex(v),f.computeBoundingSphere(),f.computeBoundingBox();let y=tr(f,n,r+` super`,i);y.visible=!1,l.push(y),o.sup=y,a.forEach((e,t)=>{let[a,c,u,d]=h[t],p=new x;for(let[e,t]of Object.entries(f.attributes))p.setAttribute(e,t);p.setIndex(v),p.setDrawRange(a,c),p.boundingSphere=u,p.boundingBox=d,p.userData.sharedRange=!0;let m=tr(p,n,r+` `+e,i);s[e]={m,grp:o,vis:!0,sh:!0,inFrustum:!0},l.push(m)}),o.nVis=a.length,c.push(o)}let d=e=>{if(!e.sup){let t=s[e.tiles[0]];t.m.visible=t.vis,t.m.castShadow=t.sh&&!!i.castShadow;return}let t=!0,n=null,r=!0,a=0;for(let i of e.tiles){let e=s[i];if(!e.vis){t=!1;break}e.inFrustum&&a++,n===null?n=e.sh:e.sh!==n&&(r=!1)}let o=t&&r&&a>=e.tiles.length*.75;e.sup.visible=o,e.sup.castShadow=o&&n&&!!i.castShadow;for(let t of e.tiles){let e=s[t];e.m.visible=!o&&e.vis,e.m.castShadow=e.sh&&!!i.castShadow}};for(let e of c)d(e);let f=new x;f.setDrawRange(0,1);let p=new g(f,$n);return p.name=r+` upload`,p.frustumCulled=!1,p.visible=!1,l.push(p),{mesh:l[0]??null,meshes:l,warm(e){let t=s[e];if(!t||Zn)return!1;let n=t.m.geometry;if(t.wq||=[...Object.keys(n.attributes),n.index?`#index`:null].filter(Boolean),!t.wq.length)return!1;let r=t.wq.shift();for(let e of Object.keys(f.attributes))f.deleteAttribute(e);return f.setIndex(null),r===`#index`?(f.setAttribute(`position`,n.attributes.position),f.setIndex(n.index)):f.setAttribute(r===`position`?r:`position`,n.attributes[r]),p.visible=!0,!0},endWarm:()=>{p.visible=!1},has:e=>!!s[e],setVisible(e,t){let n=s[e];n&&n.vis!==t&&(n.vis=t,d(n.grp))},setShadow(e,t){let n=s[e];n&&n.sh!==t&&(n.sh=t,d(n.grp))},setFrustumVisible(e,t){let n=s[e];n&&n.inFrustum!==t&&(n.inFrustum=t,d(n.grp))}}}var rr=[.92,.95,.95,.6,.85,.85,.8,.95,.55,.9,.8,.5,.75,.95,.6,.22,.85,.12,.6],ir=[1,0,0,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,0],ar=[0,0,0,3,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],or=[1,0,0,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,0],sr=(e,t,n=0)=>{let r=z(n);for(let n=t.length-1;n>=0;n--)r=N(e.equal(n),z(t[n]),r);return r},cr=e=>B(H(I(e,U(12.9898,78.233))).mul(43758.5453)),lr=e=>N(e,z(1),z(0));function ur(e){let t=new Ee({color:16777215,transparent:!0,premultipliedAlpha:!0,depthWrite:!1,toneMapped:!1,fog:!1,side:2,blending:4});t.name=`CityRoofStreaks.TSL`;let n=ve(`aS`,`vec4`),r=ve(`aT`,`vec4`),i=n.x,a=n.y,o=n.z,s=n.w,c=se.length(),l=M(e,U(i.div(11),.37)).r.mul(.6).add(M(e,U(i.div(3.1),.71)).g.mul(.4)),u=M(e,U(i.div(.9),a.div(70).add(.13))).b.mul(.7).add(M(e,U(i.div(.37),a.div(30).add(.61))).r.mul(.3)),d=o.mul(z(.2).add(j(.3,.75,l).mul(1.1))),f=j(.44,.62,u).mul(z(1).sub(j(0,d,a))),p=z(1).sub(j(0,z(.3).add(l.mul(.6)),a)),m=z(1).sub(j(0,o.mul(.8),a)),h=W(.35,1,j(45,200,c)),g=j(820,450,c).mul(h),_=s.mul(f.mul(.75).add(p.mul(.5)).add(m.mul(.2)).clamp(0,.8)).mul(g),v=V(1).sub(_.mul(V(.8,.85,.93))),y=M(e,U(i.div(19).add(.21),a.div(23).add(.47))).g.mul(.7).add(M(e,U(i.div(6).add(.6),a.div(7.5).add(.1))).r.mul(.3)),b=j(.45,.8,y),x=U(i.div(4.3),a.div(3.1)),S=P(x),C=B(x),w=B(H(I(S,U(12.9898,78.233)).add(r.w.mul(17))).mul(43758.5453)),T=w.lessThan(.12).and(C.x.greaterThan(.1)).and(C.x.lessThan(.9)).and(C.y.greaterThan(.15)).and(C.y.lessThan(.85)),E=N(T,z(.8).add(w.mul(1.2)),1),D=B(H(r.w.mul(91.7)).mul(4375.5)).mul(o).mul(.7).add(2),O=z(1).sub(j(0,.25,a.sub(D).abs())).mul(oe(.5,B(r.w.mul(7.3)))),k=j(900,500,c),A=W(V(1),r.rgb,k),ee=r.w.mul(k).mul(b.mul(.28).add(O.mul(.3))),te=v.mul(A).mul(z(1).sub(ee)).mul(W(1,E,k));v=N(r.w.greaterThan(0),te,v);let ne=z(1).sub(j(1100,500,c)),re=U(i.div(9).add(.3),a.div(5).add(.8)),ie=M(e,re).g,ae=a.div(o.max(1)).clamp(0,1),F=V(1).sub(s.mul(ae.mul(ae)).mul(z(.85).add(ie.mul(.3))).mul(V(.52,.54,.58)).mul(ne).mul(h));return v=N(r.w.lessThan(0),F,v),t.colorNode=v,t}function dr(e,t,n){let r=new Te({vertexColors:!1,roughness:.9,metalness:0});r.name=`CityRoofFabric.TSL`;let i=pe(),a=ve(`aM`,`vec4`),o=ve(`aE`,`vec4`),s=F;re(ce);let c=P(a.x.add(.5)),l=c.clamp(0,18),u=i.mul(a.y),d=M(e,u).depth(l).rgb,f=M(t,u).depth(l),p=U(s.x,s.z);M(n,p.div(70).add(s.y.div(130))).rgb;let m=M(n,p.div(13).add(.37)).rgb,h=c.greaterThanEqual(0),g=a.w.greaterThan(.5),_=fe().rgb;_=N(h,_.mul(d),_);let v=M(n,p.div(3)).g,y=V(.09,.3,.34).mul(z(.85).add(v.mul(.3)));_=N(g,y,_);let b=c,x=b.equal(12);_=N(x,_.mul(1.5),_);let S=h.and(a.z.greaterThan(0)),C=de(de(i.x.sub(o.x),o.z.sub(i.x)),de(i.y.sub(o.y),o.w.sub(i.y))).add(m.b.sub(.5).mul(.9)),w=W(.4,1,j(0,a.z.mul(2.2),C));_=N(S,_.mul(w),_);let T=W(V(.93,.9,.84),V(1),j(0,a.z.mul(4),C));_=N(S,_.mul(T),_);let E=_e(o.zw.sub(o.xy),U(1)),D=i.sub(o.xy).div(E),O=cr(P(o.xy.mul(.37))).mul(Math.PI*2),k=U(te(O),H(O)),A=I(D.sub(.5),k),ne=z(.08).add(cr(P(o.zw)).mul(.12)),ie=o.xy.add(E.mul(U(z(.25).add(cr(P(o.xy).add(1.7)).mul(.5)),z(.25).add(cr(P(o.zw).add(2.9)).mul(.5))))),oe=i.sub(ie).length().add(m.r.sub(.5).mul(1.6)),se=z(2.6).add(cr(P(o.xy).add(4.1)).mul(1.5)),L=z(1).sub(j(.4,se,oe));_=N(S,_.mul(z(1).sub(ne.mul(j(-.55,.55,A)))),_),_=N(S,_.mul(z(1).sub(L.mul(.3))),_);let R=sr(b,ar),le=i.x.div(R.max(.001)),ue=B(le),me=ae(le).mul(1.2).add(.02),he=z(1).sub(j(0,me,de(ue,z(1).sub(ue)))),ge=R.greaterThan(0).and(ar.length>0);_=N(S.and(ge),_.mul(z(1).sub(he.mul(.3))),_);let ye=M(n,p.div(7).add(U(.23,.71))).r.mul(.65).add(M(n,U(s.z,s.x).div(29).add(.5)).g.mul(.35)),be=j(.64,.66,ye),xe=sr(b,or).greaterThan(.5),Se=_.mul(.28).add(.012);_=N(S.and(xe),W(_,Se,be.mul(.85)),_);let Ce=M(n,p.div(41).add(.13)).rgb,we=M(n,U(s.z,s.x).div(17).add(.71)).rgb,Ee=j(.52,.8,Ce.g.mul(.55).add(we.r.mul(.45)));_=N(S,_.mul(z(1).sub(Ee.mul(.26))),_),_=N(S,_.mul(W(V(1),V(1.03,1,.95),j(.55,.85,we.b))),_);let De=sr(b,ir).greaterThan(.5).and(S),Oe=N(De,z(1),z(0)),ke=M(n,p.div(9).add(U(.61,.27))).b.mul(.7).add(Ce.r.mul(.3)),Ae=j(.66,.72,ke).mul(Oe);_=W(_,_.mul(z(1).sub(Ae.mul(.32))).mul(z(1).add(j(.6,.66,ke).sub(j(.66,.72,ke)).mul(.1))),Oe),r.colorNode=_;let je=sr(b,rr,.85);je=W(je,z(.08),g);let Me=lr(S),Ne=lr(xe);je=W(je,z(.35),L.mul(.6).mul(Me)),je=W(je,z(.5),be.mul(.5).mul(Ne).mul(Me)),je=W(je,z(.18),Ae),r.roughnessNode=je;let Pe=ee(f,U(.8,.8));return r.normalNode=W(Pe,V(0,0,1),h.not().or(g).or(Ae.greaterThan(.5))),r}var fr=`// signage shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
in vec2 aSig;
in vec2 aLoc;
out vec2 vSig;
out vec2 vLoc;
out vec3 vWPs;
// @section vertexFogVertex
#include <fog_vertex>
vSig = aSig;
vLoc = aLoc;
vWPs = (modelMatrix * vec4(transformed, 1.0)).xyz;
// @section fragmentCommon
#include <common>
uniform sampler2D tSigns;
uniform sampler2D tArt;
uniform sampler2D tNoiseS;
in vec2 vSig;
in vec2 vLoc;
in vec3 vWPs;
float sgR;
float sgM;
vec3 sgE;
uniform float uNightK;
uniform float uScreenK;
uniform float uScrBoost;
uniform float uScrKnee;
uniform float uScrTop;
// @section fragmentMap

// @section fragmentColor
#include <color_fragment>
int K = int(vSig.x + 0.5);
vec4 tx = vec4(1.0);
sgR = 0.55;
sgM = 0.0;
sgE = vec3(0.0);
vec2 ledF = vec2(0.0);
float ledAA = 0.0;
if(K == 3) { // (r2) LED pixel grid: 1 diode per 4 atlas texels (~10 cm on a 12 m screen), image sampled per diode
vec2 lp = vMapUv * 1024.0;
ledF = fract(lp) - 0.5;
ledAA = clamp(1.6 - 2.2 * max(fwidth(lp.x), fwidth(lp.y)), 0.0, 1.0);
tx = texture(map, mix(vMapUv, (floor(lp) + 0.5) / 1024.0, ledAA));
} else if(K > 0 && K != 6 && K != 7) tx = vMapUv.x > 3.5 ? texture(tArt, vMapUv - vec2(4.0, 0.0)) : vMapUv.x > 1.5 ? texture(tSigns, vMapUv - vec2(2.0, 0.0)) : texture(map, vMapUv);
vec3 nzA = texture(tNoiseS, (vWPs.xz + vWPs.yy * vec2(0.7, - 0.4)) / 9.0).rgb;
vec3 nzB = texture(tNoiseS, (vWPs.xz * 0.6 + vWPs.yy * vec2(- 0.5, 0.8)) / 1.7).rgb;
float lum = dot(tx.rgb, vec3(0.2126, 0.7152, 0.0722));
if(K == 0) {
sgR = 0.5 + 0.3 * nzB.r;
sgM = 0.35;
diffuseColor.rgb *= 0.85 + 0.3 * nzA.g;
} else if(K == 1) { // printed vinyl: keep the artwork saturated and readable, with only subtle sun fade and weathering
tx.rgb = mix(tx.rgb, vec3(lum), 0.1) * 0.95 + 0.005;
tx.rgb = mix(tx.rgb, vec3(lum * 0.9 + 0.06), smoothstep(0.35, 0.8, nzA.b) * 0.06 + 0.02 * vLoc.y);
float stk = smoothstep(0.55, 0.9, texture(tNoiseS, vec2(vWPs.x + vWPs.z, vWPs.y * 0.08) * 0.35).g) * (0.35 + 0.65 * vLoc.y);
tx.rgb *= 1.0 - 0.12 * stk;
vec2 ed = min(vLoc, 1.0 - vLoc);
float edg = 1.0 - smoothstep(0.004, 0.035, min(ed.x, ed.y * 0.5) + 0.018 * (nzB.r - 0.5));
tx.rgb = mix(tx.rgb, tx.rgb * 0.5 + vec3(0.035, 0.032, 0.028), edg * 0.75);
diffuseColor.rgb *= tx.rgb;
sgR = 0.48 + 0.34 * nzB.g;
} else if(K == 2) { // painted on brick (vertex colour = the wall): chalky, faded, mortar courses, flaking paint
// (textures r5) critic: 'painted wall ads crisp / fresh'. Sun-bleached, chalky, soaked into the brick: stronger
// desaturation + value cap, brick colour bleeding through, a paler top (sun fade), more and wider flaking.
tx.rgb = mix(tx.rgb, vec3(lum), 0.45) * 0.66 + 0.05;
tx.rgb = min(tx.rgb, vec3(0.6)) * mix(vec3(1.0), diffuseColor.rgb / max(dot(diffuseColor.rgb, vec3(0.333)), 0.05), 0.18);
tx.rgb = mix(tx.rgb, vec3(dot(tx.rgb, vec3(0.333))) * 1.08 + 0.02, 0.35 * smoothstep(0.3, 1.0, vLoc.y));
float course = abs(fract(vWPs.y / 0.0762) - 0.5), fw = fwidth(vWPs.y / 0.0762);
tx.rgb *= 1.0 - 0.2 * smoothstep(0.4, 0.5, course) * clamp(1.0 - fw * 3.0, 0.0, 1.0);
float peel = smoothstep(0.6, 0.76, nzA.r * 0.7 + nzB.g * 0.45 + 0.08 * (vLoc.y - 0.5));
diffuseColor.rgb = mix(tx.rgb, diffuseColor.rgb, min(1.0, peel * 0.9 + 0.1));
sgR = 0.88;
} else if(K == 3) { // LED screen: dark glass, image emitted through a diode grid (dark louvre lines between)
float dio = 1.0 - smoothstep(0.26, 0.42, max(abs(ledF.x), abs(ledF.y)));
float grid = mix(1.0, dio * 1.55, ledAA);
sgE = tx.rgb * vSig.y * grid;
diffuseColor.rgb *= tx.rgb * 0.12;
sgR = 0.25;
} else if(K == 6) { // (r2) marquee bulbs: uv = bulb index (x, y), warm incandescent dots on the dark trim
vec2 bf = fract(vMapUv) - 0.5;
float bw = max(fwidth(vMapUv.x), fwidth(vMapUv.y));
float bulb = 1.0 - smoothstep(0.2, 0.34, length(bf));
bulb = mix(bulb, 0.3, clamp(bw * 1.5 - 0.3, 0.0, 1.0));
float flick = 0.85 + 0.15 * fract(sin(dot(floor(vMapUv) + vWPs.xz, vec2(12.9898, 78.233))) * 43758.5453);
sgE = vec3(1.0, 0.78, 0.46) * vSig.y * bulb * flick;
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9, 0.8, 0.6), bulb);
sgR = mix(0.5, 0.15, bulb);
} else if(K == 4) { // back-lit sign box face
sgE = tx.rgb * vSig.y;
diffuseColor.rgb *= tx.rgb * 0.85;
sgR = 0.35;
} else if(K == 7) { // (r3) awning / canopy fabric: vertex colour, optional stripes (vSig.y = stripe count), soiling
float st = vSig.y > 0.5 ? step(0.5, fract(vLoc.x * vSig.y)) : 0.0;
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.58, 0.5), st * 0.85) * (0.82 + 0.3 * nzB.g) * (1.0 - 0.18 * smoothstep(0.5, 0.85, nzA.r));
sgR = 0.88;
} else if(K == 8) { // (r3) cut brass building-name letters (light lettering of a sign cell; board discarded)
if(smoothstep(0.3, 0.5, lum) < 0.5) discard;
diffuseColor.rgb *= 0.8 + 0.3 * nzB.r;
sgM = 0.85;
sgR = 0.32 + 0.2 * nzA.g;
} else if(K == 9) { // (r4) second-floor window lettering: gold-leaf / white vinyl letters on the glass (board discarded)
if(smoothstep(0.28, 0.42, lum) < 0.5) discard;
diffuseColor.rgb = tx.rgb * (0.78 + 0.25 * nzB.r);
sgM = tx.r > tx.b * 1.4 ? 0.6 : 0.0;
sgR = 0.38 + 0.2 * nzA.g;
sgE = tx.rgb * 0.35 * uNightK; // back-lit by the room at night
} else { // (r3) ghost sign: world-space flaking paint (per brick + patches, mortar joints break it), uneven fade; no screen dither
vec3 brd = vMapUv.x > 3.5 ? texture(tArt, vMapUv - vec2(4.0, 0.0), 5.0).rgb : texture(tSigns, vMapUv - vec2(2.0, 0.0), 5.0).rgb; // heavily blurred cell ~ the board colour
float lumL = smoothstep(0.1, 0.24, abs(lum - dot(brd, vec3(0.2126, 0.7152, 0.0722)))); // lettering = contrast vs board (light or dark boards)
tx.rgb = mix(tx.rgb, vec3(lum), 0.5);
float bc = vWPs.y / 0.0762, row = floor(bc);
float hx = (vWPs.x + vWPs.z) / 0.2032 + 0.5 * mod(row, 2.0);
float bh = fract(sin(dot(vec2(floor(hx), row), vec2(12.9898, 78.233))) * 43758.5453);
float nearB = clamp(1.4 - 3.0 * max(fwidth(bc), fwidth(hx) * 0.4), 0.0, 1.0);
float wear = smoothstep(0.3, 0.85, nzA.r * 0.6 + nzB.b * 0.5 + 0.2 * (0.5 - vLoc.y));
float cov = mix(0.04, 0.97, lumL) /* (textures r5) 0.16 -> 0.04: board-paint speckle read as white grunge */ * (1.0 - 0.7 * wear) * clamp(vSig.y * 1.7, 0.0, 1.2);
float val = mix(nzB.g, 0.5 * nzB.g + 0.5 * bh, nearB);
float fb = fract(bc), fh = fract(hx);
float mj = max(1.0 - smoothstep(0.035, 0.07, min(fb, 1.0 - fb)), 1.0 - smoothstep(0.012, 0.025, min(fh, 1.0 - fh)));
if(val > cov || mj * nearB > 0.6) discard;
// (textures r3) ghost paint read as white blobs at grazing angles / mid range: soaked-in, darker paint (letters cap
// ~0.5 albedo, tinted by the brick), fading further toward the wall once the bricks go sub-pixel
// (textures r4) critic: 'ghost sign too crisp / high-contrast; fade it, brick bleed-through': more of the brick
// colour in the paint and a higher floor of wall show-through
vec3 gp = min(tx.rgb * 0.58 + 0.04, vec3(0.46)) * mix(vec3(1.0), diffuseColor.rgb / max(dot(diffuseColor.rgb, vec3(0.333)), 0.05), 0.45);
diffuseColor.rgb = mix(gp, diffuseColor.rgb, min(0.94, 0.5 + 0.35 * wear + 0.15 * bh * nearB + 0.2 * (1.0 - nearB)));
sgR = 0.92;
}
// @section fragmentRoughness
float roughnessFactor = sgR;
// @section fragmentMetalness
float metalnessFactor = sgM;
// @section fragmentEmissive
#include <emissivemap_fragment>
__SHADER_INJECT_0____SHADER_INJECT_1__if((K == 3 || K == 4) && uNightK > 0.0) {
float scrM = max(max(tx.r, tx.g), tx.b);
if(scrM > uScrKnee) {
float scrW = uScrTop - uScrKnee;
float scrY = uScrKnee + scrW * (1.0 - exp(- (scrM - uScrKnee) / scrW));
sgE *= mix(1.0, scrY / scrM, uNightK);
}
}
if(uNightK > 0.0) {
if(K == 1) sgE += diffuseColor.rgb * uNightK * 0.28 * (0.5 + 0.5 * smoothstep(0.2, 1.0, vLoc.y));
}
totalEmissiveRadiance += sgE;
`,pr=e=>{let t=ue(e.value);return t.onRenderUpdate(()=>{t.value=e.value}),t},mr=e=>B(H(I(e,U(12.9898,78.233))).mul(43758.5453));function hr(e,t,n,r){let i=new Te({vertexColors:!1,roughness:.6});i.name=`CitySignage.TSL`;let a=pe(),o=ve(`aLoc`,`vec2`),s=ve(`aSig`,`vec2`),c=me(s.x),l=F,u=fe().rgb,d=N(a.x.greaterThan(3.5),a.sub(U(4,0)),N(a.x.greaterThan(1.5),a.sub(U(2,0)),a)).flipY(),f=M(e,d),p=M(t,d),m=M(r,d),h=N(a.x.greaterThan(3.5),m.rgb,N(a.x.greaterThan(1.5),p.rgb,f.rgb)),g=M(n,U(l.x,l.z).add(U(l.y.mul(.7),l.y.mul(-.4))).div(9)).rgb,_=M(n,U(l.x.mul(.6),l.z.mul(.6)).add(U(l.y.mul(-.5),l.y.mul(.8))).div(1.7)).rgb,v=I(h,V(.2126,.7152,.0722)),y=pr(Fe),b=pr(Ie),x=pr(ut),S=pr(gt),C=pr(dt),w=W(h,V(v),.1).mul(.95).add(.005),T=W(w,V(v.mul(.9).add(.06)),j(.35,.8,g.b).mul(.06).add(o.y.mul(.02))),E=W(h.mul(.66).add(.05),u,j(.6,.76,g.r.mul(.7).add(_.g.mul(.45))).mul(.85).add(.1)),D=h.mul(.12),O=h.mul(.85),k=N(B(o.x.mul(s.y)).greaterThan(.5),V(.62,.58,.5),u),A=u;A=N(c.equal(1),T,A),A=N(c.equal(2),E,A),A=N(c.equal(3),D,A),A=N(c.equal(4),O,A),A=N(c.equal(6),W(A,V(.9,.8,.6),.6),A),A=N(c.equal(7),k.mul(z(.82).add(_.g.mul(.3))),A),A=N(c.equal(8).or(c.equal(9)),h.mul(z(.8).add(_.r.mul(.3))),A),i.colorNode=A;let ee=B(a).sub(.5),te=z(1).sub(j(.2,.34,ee.length())),ne=z(.85).add(mr(P(a).add(U(l.x,l.z))).mul(.15)),re=b.mul(z(1).add(x.sub(1).mul(y))),ie=_e(h.r,_e(h.g,h.b)),ae=S.add(C.sub(S).mul(z(1).sub(we(ie.sub(S).div(C.sub(S).max(1e-4)).negate())))),oe=N(ie.greaterThan(S),ae.div(ie.max(1e-4)),z(1)),se=h.mul(s.y).mul(re).mul(W(1,oe,y)),ce=V(1,.78,.46).mul(s.y).mul(te).mul(ne).mul(W(1,.3,y)),L=h.mul(s.y).mul(W(1,1.7,y)),R=h.mul(.35).mul(y);return i.emissiveNode=N(c.equal(3),se,N(c.equal(4),L,N(c.equal(6),ce,N(c.equal(9),R,V(0))))),i.roughnessNode=N(c.equal(1),z(.48).add(_.g.mul(.34)),N(c.equal(2).or(c.equal(7)),z(.88),N(c.equal(3),z(.25),N(c.equal(4),z(.35),z(.55))))),i.metalnessNode=N(c.equal(8),z(.85),N(c.equal(9),N(h.r.greaterThan(h.b.mul(1.4)),.6,0),0)),i.maskNode=N(c.equal(8).or(c.equal(9)),j(.3,.5,v).greaterThan(.5),!0),i}var{district:gr,mulberry32:_r,streetsAt:vr,SITES:yr}=Ke,br=Oe(()=>fr),xr=Me(`city/environmentTextures/`),Sr=512,Cr=typeof location<`u`?new URLSearchParams(location.search):new URLSearchParams,wr=Cr.has(`nosignage`);function Tr(e,t,n=[]){let r=Array.from({length:e},()=>[]);return(i,a,o=null)=>{let s=0,c=-1;for(let l=0;l<e;l++){if(o&&o(l)||n.includes(l))continue;let e=1e5;for(let t of r[l])e=Math.min(e,Math.hypot(t[0]-i,t[1]-a));e+=t()*40,e>c&&(c=e,s=l)}return r[s].push([i,a]),s}}function Er(e,t,n,r,i,a,o,s=o){let c=2/o,l=2/s;if(e+=c,n-=2*c,t+=l,r-=2*l,a>i){let e=i/a;t+=r*(1-e)/2,r*=e}else{let t=a/i;e+=n*(1-t)/2,n*=t}return[e,t,e+n,t+r]}var Dr=(e,t)=>Er(e%8/8,1-(Math.floor(e/8)+1)/16,1/8,1/16,2,t,4096),Or=(e,t)=>Er(e%16/16,.5-(Math.floor(e/16)+1)/8,1/16,1/8,.5,t,4096),kr=(e,t)=>{let n=Er(e%4/4,1-(Math.floor(e/4)+1)/16,1/4,1/16,4,t,2048);return n[0]+=2,n[2]+=2,n},Ar=(e,t,n,r,i)=>{let a=Er(e/2048,1-(t+r)/1792,n/2048,r/1792,4,i,2048,1792);return a[0]+=4,a[2]+=4,a},jr=(e,t)=>Ar(e%2*1024,Math.floor(e/2)*256,1024,256,t),Mr=(e,t)=>Ar(e%4*512,1024+Math.floor(e/4)*128,512,128,t),Nr=(e,t)=>Ar(e%4*512,1280+Math.floor(e/4)*128,512,128,t),Pr=[1,4,8,11,12,13,19,21,24,28,33,35,36,37,40,48,52,56,60,61,62,63],Fr=[2,11,12,13,15,19,24,32,36,41,44,45,46,51,52,56,59,61],Ir=class{constructor(){this.p=[],this.n=[],this.uv=[],this.c=[],this.s=[],this.l=[],this.i=[],this.v=0}quad(e,t,n,r,i,a){for(let n of e)this.p.push(n[0],n[1],n[2]),this.n.push(t[0],t[1],t[2]),this.c.push(r[0],r[1],r[2]),this.s.push(i,a);n?this.uv.push(n[0],n[1],n[2],n[1],n[2],n[3],n[0],n[3]):this.uv.push(0,0,0,0,0,0,0,0),this.l.push(0,0,1,0,1,1,0,1),this.i.push(this.v,this.v+1,this.v+2,this.v,this.v+2,this.v+3),this.v+=4}build(){if(!this.v)return null;let e=new x;return e.setAttribute(`position`,new s(this.p,3)),e.setAttribute(`normal`,new s(this.n,3)),e.setAttribute(`uv`,new s(this.uv,2)),e.setAttribute(`color`,new s(this.c,3)),e.setAttribute(`aSig`,new s(this.s,2)),e.setAttribute(`aLoc`,new s(this.l,2)),e.setIndex(this.v>65535?new n(this.i,1):new p(this.i,1)),e.computeBoundingSphere(),e.computeBoundingBox(),e}},Lr=e=>[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255].map(e=>e**2.2);function Rr(e,t){switch(t){case`pz`:return{O:[e.x0,e.z1],T:[1,0],N:[0,1],W:e.x1-e.x0,s:t};case`nz`:return{O:[e.x1,e.z0],T:[-1,0],N:[0,-1],W:e.x1-e.x0,s:t};case`px`:return{O:[e.x1,e.z1],T:[0,-1],N:[1,0],W:e.z1-e.z0,s:t};default:return{O:[e.x0,e.z0],T:[0,1],N:[-1,0],W:e.z1-e.z0,s:t}}}var Q=(e,t,n,r)=>[e.O[0]+e.T[0]*t+e.N[0]*r,n,e.O[1]+e.T[1]*t+e.N[1]*r],$=(e,t,n,r,i,a,o)=>{let s=Q(e,t,n,r),c=Q(e,i,a,o);return[Math.min(s[0],c[0]),n,Math.min(s[2],c[2]),Math.max(s[0],c[0]),a,Math.max(s[2],c[2])]};function zr(e,t,n,r,i,a,o,s,c,l=null,u=0,d=0,f=63,p=0){let m=(e,n,r)=>Q(t,e,n,r),h=[t.T[0],0,t.T[1]],g=[t.N[0],0,t.N[1]],_=e=>e.map(e=>-e);f&1&&e.quad([m(n,i,s),m(r,i,s),m(r,a,s),m(n,a,s)],g,l,l?[1,1,1]:c,l?u:p,d),f&2&&e.quad([m(r,i,o),m(n,i,o),m(n,a,o),m(r,a,o)],_(g),null,c,p,0),f&4&&e.quad([m(r,i,s),m(r,i,o),m(r,a,o),m(r,a,s)],h,null,c,p,0),f&8&&e.quad([m(n,i,o),m(n,i,s),m(n,a,s),m(n,a,o)],_(h),null,c,p,0),f&16&&e.quad([m(n,a,s),m(r,a,s),m(r,a,o),m(n,a,o)],[0,1,0],null,c.map(e=>e*1.1),p,0),f&32&&e.quad([m(n,i,o),m(r,i,o),m(r,i,s),m(n,i,s)],[0,-1,0],null,c.map(e=>e*.6),p,0)}function Br(e,t,n,r,i,a,o,s){let c=$(t,n,i,o,r,a,s);e.box(c[0],c[1],c[2],c[3],c[4],c[5])}function Vr(e){let t=Ne(e);return t.colorSpace=u,t.anisotropy=8,t}function Hr(e,t,n,r,i){if(Ae())return hr(e,t,n,i);let a=new C({map:e,vertexColors:!0,roughness:.6,metalness:0,transparent:r,depthWrite:!r,polygonOffset:r,polygonOffsetFactor:r?-3:0,polygonOffsetUnits:r?-3:0});r&&Object.assign(a,{blending:5,blendEquation:100,blendSrc:204,blendDst:205,blendSrcAlpha:200,blendDstAlpha:201});let o={tSigns:{value:t},tNoiseS:{value:n},tArt:{value:i},uNightK:Fe,uScreenK:Ie,uScrBoost:ut,uScrKnee:gt,uScrTop:dt};return a.onBeforeCompile=e=>{Object.assign(e.uniforms,o),e.vertexShader=e.vertexShader.replace(`#include <common>`,br.vertexCommon).replace(`#include <fog_vertex>`,br.vertexFogVertex),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,br.fragmentCommon).replace(`#include <map_fragment>`,br.fragmentMap).replace(`#include <color_fragment>`,br.fragmentColor).replace(`#include <roughnessmap_fragment>`,br.fragmentRoughness).replace(`#include <metalnessmap_fragment>`,br.fragmentMetalness).replace(`#include <emissivemap_fragment>`,ke(br.fragmentEmissive,`if (K == 3 || K == 4) sgE *= uScreenK * (K == 4 ? mix(1.0, 1.7, uNightK) : 1.0 + (uScrBoost - 1.0) * uNightK); /* (lighting2 r5) exposure-compensated at every preset (night) LED x uScrBoost at night */
`,`if (K == 6) sgE *= mix(1.0, 0.3, uNightK);
`))},a.customProgramCacheKey=()=>`city-signage-r5n2-`+(r?`g`:`o`),a}function Ur({scene:e,gen:t}){let n={roof:0,wall:0,ghost:0,blade:0,led:0,tris:0,meshes:0,at:{roof:[],wall:[],ghost:[],blade:[],led:[],marquee:[],canopy:[],letters:[],flag:[],awning:[],win:[]}};typeof window<`u`&&(window.__signStats=n);let i=(e,t,r,i)=>{let a=n.at[e];if(a.length<5e3){let e=Q(t,r,i,0);a.push([Math.round(e[0]),Math.round(i),Math.round(e[2]),t.N[0],t.N[1]])}};if(wr)return{update(){},stats:n};let a=t.solids,o=t.zips,s=_r(90210),c=mt(),l=mt(),u=Tr(64,s),p=Tr(64,s),h=Tr(64,s),_=Tr(8,s),y=new Map,b=(e,t)=>{let n=Math.floor(e/Sr)+`,`+Math.floor(t/Sr),r=y.get(n);return r||(r={op:new Ir,gh:new Ir,x0:Math.floor(e/Sr)*Sr,z0:Math.floor(t/Sr)*Sr},y.set(n,r)),r},x=new Map,S=(e,t,n,r,i,a)=>{for(let o=Math.floor(e/16);o<=Math.floor(r/16);o++)for(let s=Math.floor(n/16);s<=Math.floor(a/16);s++){let c=o*100003+s,l=x.get(c);l||x.set(c,l=[]),l.push(e,t,n,r,i,a)}};for(let e=0;e<a.t.length;e++){let t=e*6;(a.b[t+1]>=3||a.b[t+1]>=1.8&&a.b[t+4]>2.4)&&S(a.b[t],a.b[t+1],a.b[t+2],a.b[t+3],a.b[t+4],a.b[t+5])}let C=e=>{for(let t=Math.floor(e[0]/16);t<=Math.floor(e[3]/16);t++)for(let n=Math.floor(e[2]/16);n<=Math.floor(e[5]/16);n++){let r=x.get(t*100003+n);if(r){for(let t=0;t<r.length;t+=6)if(r[t+4]>e[1]+.05&&r[t+1]<e[4]&&e[3]>r[t]&&e[0]<r[t+3]&&e[5]>r[t+2]&&e[2]<r[t+5])return!0}}return!1},w=new Map;t.footprints.forEach((e,t)=>{for(let n=Math.floor(e.x0/32);n<=Math.floor(e.x1/32);n++)for(let r=Math.floor(e.z0/32);r<=Math.floor(e.z1/32);r++){let e=n*100003+r,i=w.get(e);i||w.set(e,i=[]),i.push(t)}});let T=(e,n,r,i,a)=>{let o=0,s=new Set;for(let c=Math.floor(e/32);c<=Math.floor(r/32);c++)for(let l=Math.floor(n/32);l<=Math.floor(i/32);l++)for(let u of w.get(c*100003+l)??[]){if(s.has(u))continue;s.add(u);let c=t.footprints[u];c!==a&&c.x1>e&&c.x0<r&&c.z1>n&&c.z0<i&&(o=Math.max(o,c.h))}return o},E=(e,t)=>{let n=`block`;for(let r of[3,6,10,15]){let i=Q(e,t,0,r),a=vr(i[0],i[2]);if(a.type===`avenue`)return`avenue`;a.type===`street`||a.type===`intersection`?n=`street`:a.type===`water`||a.type===`sidewalk`&&a.fill?n===`block`&&(n=`water`):a.type===`park`&&n===`block`&&(n=`park`)}return n},D=[yr.heraldSquare,yr.unionSquare].filter(Boolean).map(e=>[(e.x0+e.x1)/2,(e.z0+e.z1)/2]);for(let e of We??[])if(e?.kind===`broadway`&&Array.isArray(e.pts))for(let[t,n]of e.pts)(Le??[]).some(e=>Math.abs(e-t)<1)&&(qe?.(t,n)??!0)&&D.push([t,n]);D.length||D.push([0,320],[430,1040]);let O=yr.timesSquare??{x0:1e6,x1:1e6,z0:1e6,z1:1e6},k=e=>e.x1>O.x0-30&&e.x0<O.x1+30&&e.z1>O.z0-90&&e.z0<O.z1+10,A=e=>e.layer===K.RED||e.layer===K.BROWN||e.layer===K.BUFF,j={[K.RED]:Lr(8014396),[K.BROWN]:Lr(6046264),[K.BUFF]:Lr(10257512)},ee=[3948352,4869452,3027251,5591626,4015680].map(Lr),M=e=>e.poly??e.lot?.poly??e.masses?.find(e=>e.y0<.1&&e.poly)?.poly??null,N=(e,t)=>{let n=gr(e,t),r=Math.exp(-Math.hypot(e,t+160)/420),i=Math.max(0,...D.map(([n,r])=>Math.exp(-Math.hypot(e-n,t-r)/220)));return{d:n,dens:Math.min(1.6,.3+.55*(n.midtown??0)+.35*(n.village??0)+.9*r+.8*i-.2*(n.parkEdge??0)-.15*(n.harlem??0)-.35*(n.fidi??0))}},te=(e,t,r,i=null)=>{if(!Array.isArray(e)||e.length<3||!t||t.type===`glass`||!((t.gH??0)>3.6)||!(r>(t.gH??0)+3))return;let a=0,o=0;for(let t of e)a+=t[0],o+=t[1];a/=e.length,o/=e.length;let{d:s,dens:c}=N(a,o);if(s.id===`park`)return;let l=_r(Math.floor(a*3.7)*73856093^Math.floor(o*2.9)*19349663^40465),u=b(a,o),d=t.gH,f=d-1.52,p=d-.6,m=Math.min(.92,.3+.45*c);for(let t=0;t<e.length;t++){let r=e[t],s=e[(t+1)%e.length],d=Math.hypot(s[0]-r[0],s[1]-r[1]);if(d<5||i&&i[t]!==`street`)continue;let h=[(s[0]-r[0])/d,(s[1]-r[1])/d],g=[h[1],-h[0]];g[0]*((r[0]+s[0])/2-a)+g[1]*((r[1]+s[1])/2-o)<0&&(g=[-g[0],-g[1]]);let _=Math.abs(-h[1]-g[0])<1e-6&&Math.abs(h[0]-g[1])<1e-6?{O:r,T:h,N:g,W:d}:{O:s,T:[-h[0],-h[1]],N:g,W:d},v=E(_,d/2);if(v!==`avenue`&&v!==`street`)continue;let y=Math.max(1,Math.floor(d/6.5+.5)),b=d/y;for(let e=0;e<y;e++){if(l()>m)continue;let t=e*b+.4,r=(e+1)*b-.4,i=[g[0],0,g[1]],a=Lr([1842463,2764600,3810336,2044710,6969914,2894896][Math.floor(l()*6)]);u.op.quad([Q(_,t,f,.012),Q(_,r,f,.012),Q(_,r,p,.012),Q(_,t,p,.012)],i,null,a,0,0);let o=Math.min(r-t-.16,(p-f-.12)*4.6),s=(t+r-o)/2;u.op.quad([Q(_,s,f+.06,.018),Q(_,s+o,f+.06,.018),Q(_,s+o,p-.06,.018),Q(_,s,p-.06,.018)],i,kr(Math.floor(l()*64),o/(p-f-.12)),[1,1,1],4,.3+.35*Math.min(1,c)*l()),n.front=(n.front??0)+1}}};for(let e of t.polyBuildings??[])te(e.poly,e.A,e.H,Array.isArray(e.faces)?e.faces:null);let ne=[3103290,8006186,2768234,10126424,3500650,9062954,5909066,3158064,6973994].map(Lr),re=(e,t,r,o,s,c,l=-1)=>{let u=1.15+c()*.35,d=.55,f=l>=0?.4:.3,p=ne[Math.floor(c()*ne.length)],m=c()<.3?Math.round((o-r)/.32):0,h=s-d,g=Math.hypot(u,d),_=[t.N[0]*d/g,u/g,t.N[1]*d/g],v=(e,n,r)=>Q(t,e,n,r);e.quad([v(r,h,u),v(o,h,u),v(o,s,.02),v(r,s,.02)],_,null,p,7,m),e.quad([v(r,s-.03,.02),v(o,s-.03,.02),v(o,h-.03,u-.02),v(r,h-.03,u-.02)],_.map(e=>-e),null,p.map(e=>e*.3),7,0),zr(e,t,r,o,h-f,h,u-.02,u+.01,p,null,7,m,61,7);for(let[n,i]of[[r,-1],[o,1]]){let r=v(n,s,.02),a=v(n,h,u-.02),o=v(n,h-f*.2,.25),c=[t.T[0]*i,0,t.T[1]*i];e.quad([r,o,a,a],c,null,p.map(e=>e*.8),7,0),e.quad([r,a,o,o],c.map(e=>-e),null,p.map(e=>e*.8),7,0)}if(l>=0){let n=Math.min(o-r-.4,(f-.09)*4.6),i=(r+o-n)/2;e.quad([v(i,h-f+.05,u+.014),v(i+n,h-f+.05,u+.014),v(i+n,h-.04,u+.014),v(i,h-.04,u+.014)],[t.N[0],0,t.N[1]],kr(l,n/(f-.09)),[1,1,1],1,0)}let y=$(t,r,0,0,o,0,u),b=t.N[0]===0?2:0,x=t.N[0]+t.N[1];a.ramp(y[0],h-.03,y[2],y[3],y[5],b,x>0?s:h,x>0?h:s,`awning`,1,.03),a.box(...$(t,r,h-f,u-.02,o,h,u+.01),`awning`,1),S(...$(t,r,h-f,0,o,s,u+.02)),n.awning=(n.awning??0)+1,i(`awning`,t,(r+o)/2,s)},ie=[...t.buildings].sort((e,t)=>(e.lot?.cx??0)-(t.lot?.cx??0)||(e.lot?.cz??0)-(t.lot?.cz??0));for(let e of ie){let{lot:r,A:s,masses:d}=e;if(r&&!r.reserved&&(M(e)||r.angle||r.rot)){M(e)&&te(M(e),s,e.H);continue}if(!r||!s||!d?.length||r.reserved||k(r))continue;let m=r.cx??(r.x0+r.x1)/2,g=r.cz??(r.z0+r.z1)/2,v=gr(m,g);if(v.id===`park`)continue;let y=_r(Math.floor(m*3.7)*73856093^Math.floor(g*2.9)*19349663^20903),x=Math.exp(-Math.hypot(m-0,g+160)/420),w=Math.max(...D.map(([e,t])=>Math.exp(-Math.hypot(m-e,g-t)/220))),O=Math.min(1.6,.3+.55*v.midtown+.35*v.village+.9*x+.8*w-.2*v.parkEdge-.15*v.harlem-.35*v.fidi),N=d.find(e=>e.y0<.1&&!e.round&&!e.crown);if(!N)continue;let ne=s.type,ie=ne===`glass`,ae=!!(N.p?.resid??s.resid)||ne===`apt`||ne===`walkup`,P=(e,t)=>(t===`nx`?Math.abs(e.x0-r.x0)<.15:t===`px`?Math.abs(e.x1-r.x1)<.15:t===`nz`?Math.abs(e.z0-r.z0)<.15:Math.abs(e.z1-r.z1)<.15)?e.sides?.[t]??r.sides?.[t]??`street`:`inner`,oe=(e,t)=>d.some(n=>n!==e&&n.y1>t[1]+.2&&n.y0<t[4]&&n.x0<t[3]&&n.x1>t[0]&&n.z0<t[5]&&n.z1>t[2]),F=[`nx`,`px`,`nz`,`pz`].map(e=>({s:e,t:P(N,e),fr:Rr(N,e)}));for(let e of F)e.t===`street`&&(e.view=E(e.fr,e.fr.W/2));let se=N.y1,I=N.parapet??1,ce=!d.some(e=>e!==N&&e.y0>N.y1-.5&&e.y0<N.y1+.5&&e.x0<=N.x0+.1&&e.x1>=N.x1-.1&&e.z0<=N.z0+.1&&e.z1>=N.z1-.1);if(!ie&&se>8&&se<75&&ce&&v.fidi<.55){let e=F.filter(e=>e.t===`street`&&e.fr.W>9).map(e=>({...e,w:e.view===`avenue`?.42:e.view===`water`?.4:e.view===`street`?.1:0})).filter(e=>e.w>0).sort((e,t)=>t.w-e.w)[0];if(e&&y()<e.w*O){let r=e.fr,s=e.view===`water`?4.6+y()*1.4:3.6+y()*1.6,l=Math.min(r.W-1.2,s*(2.05+y()*.45)),d=Math.max(.6,(r.W-l)*(.15+y()*.7)),f=d+l,p=-.7,h=-1.02,_=se+(I+1.6+y()*3.2),v=_+s,x=$(r,d-.2,se,-3.3,f+.2,v+.8,.6),w=$(r,d-.2,se+I+.35,-3.3,f+.2,v+.8,-.05);if(l>6.5&&!C(w)&&!oe(N,x)){let e=b(m,g),C=ee[Math.floor(y()*ee.length)],w=Dr(u(m,g),l/s);zr(e.op,r,d,f,_,v,h,p,C,w,1,0),c.rect(Q(r,(d+f)/2,(_+v)/2,-.6699999999999999),[r.N[0],0,r.N[1]],[r.T[0],0,r.T[1]],l,s,null,1,{uv:w,printed:!0}),zr(e.op,r,d-.12,f+.12,v,v+.14,-1.06,-.6399999999999999,C.map(e=>e*.7),null,0,0,62),zr(e.op,r,d-.12,f+.12,_-.16,_,-1.06,-.6399999999999999,C.map(e=>e*.7),null,0,0,62);for(let t of[d-.12,f])zr(e.op,r,t,t+.12,_-.16,v+.14,-1.06,-.6399999999999999,C.map(e=>e*.75),null,0,0,61);a.box(...$(r,d-.12,_-.16,-1.06,f+.12,v+.14,-.6399999999999999),`equipment`);let T=Math.max(2,Math.ceil(l/3.6)+1),E=t.tile(m,g).det;for(let t=0;t<T;t++){let n=d+.3+(l-.6-.26)*(t/(T-1));zr(e.op,r,n,n+.26,se,v,-1.32,h,C,null,0,0,62),a.box(...$(r,n,se,-1.32,n+.26,v,h),`pole`),E.setPart(it.STEEL).setColor(C),Br(E,r,n+.05,n+.21,se,_+s*.5,-3.22,-3.02),Br(E,r,n+.07,n+.19,_+s*.5-.14,_+s*.5,-3.22,-1.32),Br(E,r,n+.07,n+.19,se+.9,se+1.02,-3.22,-1.32),a.box(...$(r,n+.05,se,-3.22,n+.21,_+s*.5,-3.02),`pole`)}E.setPart(it.GRATE).setColor(5921882),Br(E,r,d-.1,f+.1,_-.26,_-.2,p,.25),E.setPart(it.STEEL).setColor(C),Br(E,r,d-.1,f+.1,_-.34,_-.26,.15000000000000002,.25);for(let e=d;e<=f+.01;e+=l/Math.max(1,Math.round(l/2.4)))Br(E,r,e-.03,e+.03,_-.34,_+.72,.18000000000000005,.24);Br(E,r,d-.1,f+.1,_+.68,_+.74,.18000000000000005,.24),a.box(...$(r,d-.1,_-.34,p,f+.1,_-.2,.25),`awning`,1),E.setPart(it.PAINT).setColor(2763820);for(let e=d+1;e<f-.5;e+=3.2)Br(E,r,e-.035,e+.035,v+.14,v+.62,-.92,-.85),Br(E,r,e-.035,e+.035,v+.55,v+.62,-.92,.25),Br(E,r,e-.16,e+.16,v+.44,v+.6,.050000000000000044,.3800000000000001);o.edge?.(...(()=>{let e=Q(r,d,0,-1.72/2),t=Q(r,f,0,-1.72/2);return[e[0],e[2],t[0],t[2]]})(),v+.14,r.N[0],r.N[1],`roofEdge`,5),S(...x),n.roof++,i(`roof`,r,(d+f)/2,_)}}}if(!ie&&ne!==`deco`&&e.H<110)for(let e of F){if(e.t!==`party`||e.fr.W<8)continue;let r=e.fr,o=$(r,.3,0,.2,r.W-.3,1,1.2),l=T(o[0],o[2],o[3],o[5],null),d=Math.max(l+1.2,(s.gH??4)+1.5),f=N.y1-1.2;if(f-d<6.5)continue;let v=A(s)&&(ne===`walkup`||ne===`loft`||ne===`apt`||ne===`postwar`),x=.5*O+(v?.12:0);if(y()>x)continue;let S=v&&y()<.5,C=r.W-1.6,w=f-d,E=b(m,g);if(S){let e=Math.min(C,16+y()*6),t=e/4,a=Math.max(1,Math.min(3,Math.floor(w/(t*1.1)))),o=(r.W-e)/2,c=f-.6-y()*Math.max(0,w-a*t*1.1)*.5;for(let n=0;n<a&&c-t>d;n++){let i=y()<.6?jr(_(m+n*50,g),e/t):kr(h(m+n*50,g,e=>!Pr.includes(e)),e/t);E.op.quad([Q(r,o,c-t,.045),Q(r,o+e,c-t,.045),Q(r,o+e,c,.045),Q(r,o,c,.045)],[r.N[0],0,r.N[1]],i,j[s.layer]??[.3,.25,.2],5,.42+y()*.2),c-=t*1.12}n.ghost++,i(`ghost`,r,r.W/2,f)}else{let e=w>C*.8,o,l;if(e?(l=Math.min(w,34),o=Math.min(C,l*.62),l=Math.min(l,o/.5)):(o=Math.min(C,26),l=Math.min(w,o/1.7),o=Math.min(o,l*2.3)),o<6||l<5)continue;let d=(r.W-o)*(.3+y()*.4),h=f-y()*(w-l)*.4,_=h-l,v=e?Or(p(m,g),o/l):Dr(u(m,g),o/l);if(A(s)&&y()<.55)E.op.quad([Q(r,d,_,.05),Q(r,d+o,_,.05),Q(r,d+o,h,.05),Q(r,d,h,.05)],[r.N[0],0,r.N[1]],v,j[s.layer]??[.3,.25,.2],2,0);else{let e=ee[Math.floor(y()*ee.length)],n=e.map(e=>e*.72),i=.32,s=.2;zr(E.op,r,d,d+o,_,h,.02,.25,e,v,1,0,1),c.rect(Q(r,d+o/2,(_+h)/2,.28),[r.N[0],0,r.N[1]],[r.T[0],0,r.T[1]],o,l,null,1,{uv:v,printed:!0}),zr(E.op,r,d-s,d+o+s,h,h+s,0,i,n,null,0,0,61),zr(E.op,r,d-s,d+o+s,_-s,_,0,i,n,null,0,0,61),zr(E.op,r,d-s,d,_,h,0,i,n,null,0,0,61),zr(E.op,r,d+o,d+o+s,_,h,0,i,n,null,0,0,61),a.box(...$(r,d-s,_-s,0,d+o+s,h+s,i),`wall`,8);let u=t.tile(m,g).det,f=_-s-.28,p=d-s,b=d+o+s;u.setPart(it.GRATE).setColor(5592922),Br(u,r,p,b,f,f+.06,.05,1),u.setPart(it.STEEL).setColor(e),Br(u,r,p,b,f-.1,f,.9,1),Br(u,r,p,b,f+1,f+1.06,.93,.99);let x=Math.max(2,Math.round(o/2.6)+1);for(let e=0;e<x;e++){let t=p+.1+(b-p-.2)*e/(x-1);Br(u,r,t-.03,t+.03,f,f+1,.93,.99),u.tube(Q(r,t,f-1.1,.02),Q(r,t,f-.04,.95),.04,4)}u.setPart(it.PAINT).setColor(2763820);for(let e=d+1;e<d+o-.4;e+=3)u.tube(Q(r,e,f+1.03,.96),Q(r,e,f+1.55,1.45),.03,4),Br(u,r,e-.17,e+.17,f+1.5,f+1.68,1.28,1.6);a.box(...$(r,p,f-.1,0,b,f+.06,1),`awning`,1)}n.wall++,i(`wall`,r,d+o/2,_)}}if(!ie&&(ne===`loft`||ne===`walkup`||ne===`apt`)&&(s.gH??0)>3.5)for(let e of F){if(e.t!==`street`||e.fr.W<9||e.view!==`avenue`&&e.view!==`street`||y()>(e.view===`avenue`?.2:.11)*O)continue;let r=e.fr,o=.95+y()*.75*Math.min(1,O),c=o*4,u=s.gH+.9,d=u+c;if(d>N.y1-1.5)continue;let f=y()<.5?1.6+y()*1.2:r.W-1.6-y()*1.2,p=.3,h=p+o,_=b(m,g),v=Fr[Math.floor(y()*Fr.length)],x=[Lr(1842463),Lr(5905690),Lr(1911370),Lr(8022586)][Math.floor(y()*4)];zr(_.op,r,f-.18,f+.18,u,d,p,h,x,null,0,0,61);let S=kr(v,c/o),C=.45+.4*Math.min(1,O),w=(e,t,n)=>Q(r,e,t,n),T=(e,t)=>{let n=t>0?h-.06:.36,i=t>0?.36:h-.06,a=u+.08,o=d-.08,s=[r.T[0]*t,0,r.T[1]*t],c=_.op,l=c.v;for(let t of[w(e,a,n),w(e,a,i),w(e,o,i),w(e,o,n)])c.p.push(t[0],t[1],t[2]),c.n.push(...s),c.c.push(1,1,1),c.s.push(4,C);c.uv.push(S[0],S[3],S[0],S[1],S[2],S[1],S[2],S[3]),c.l.push(0,0,1,0,1,1,0,1),c.i.push(l,l+1,l+2,l,l+2,l+3),c.v+=4};T(f+.185,1),T(f-.185,-1);{let e=[S[0]-2,S[1],S[2]-2,S[3]];for(let t of[1,-1])l.rect(Q(r,f+t*.2,(u+d)/2,(p+h)/2),[r.T[0]*t,0,r.T[1]*t],[r.N[0]*t,0,r.N[1]*t],o,c,null,1,{uv:e,whole:!0,gain:.7,range:10})}let E=Math.max(4,Math.round((c-.2)/.17));_.op.quad([w(f-.13,u+.1,h+.006),w(f+.13,u+.1,h+.006),w(f+.13,d-.1,h+.006),w(f-.13,d-.1,h+.006)],[r.N[0],0,r.N[1]],[0,0,2,E],x,6,.9+.5*Math.min(1,O)),zr(_.op,r,f-.24,f+.24,d,d+.12,.25,h+.08,x.map(e=>e*.8),null,0,0,61);let D=t.tile(m,g).det;D.setPart(it.STEEL).setColor(2763564);for(let e of[u+.35,d-.35])Br(D,r,f-.04,f+.04,e-.06,e+.06,0,.38),Br(D,r,f-.1,f+.1,e-.18,e+.18,0,.05),D.tube(Q(r,f,e-.9,.03),Q(r,f,e-.04,.35),.025,4);a.box(...$(r,f-.19,u,0,f+.19,d,h),`equipment`,9),n.blade++,i(`blade`,r,f,u);break}let L=s.gH??0;if(!ie&&L>4.2&&N.y1>14){let e=.5*Math.min(1,x*1.6)+.04*v.midtown+.03*w,r=F.find(e=>e.t===`street`&&(e.view===`street`||e.view===`avenue`)&&e.fr.W>12);if(r&&y()<e){let e=r.fr,o=Math.min(e.W-4,7+y()*5),s=2.6+y()*.8,l=1.3+y()*.5,u=1.5+y()*(e.W-o-3),d=u+o,p=Math.max(3.3,L-1.9),h=p+l;if(!C($(e,u-.1,p-.1,.6,d+.1,h+.2,s+.1))){let r=b(m,g).op,l=[12,42,53,21,31,15,48,12,42],_=x>.3?l[Math.floor(y()*l.length)]:[15,48,12,42][Math.floor(y()*4)],v=Lr([2761760,6967328,3807256,1711136][Math.floor(y()*4)]);zr(r,e,u,d,p,h,.05,s,v,null,0,0,29);let C=(t,n,r)=>Q(e,t,n,r),w=[e.N[0],0,e.N[1]],T=[e.T[0],0,e.T[1]],E=T.map(e=>-e),D=p+.22,O=h-.22,k=O-D;r.quad([C(u+.25,D,s+.006),C(d-.25,D,s+.006),C(d-.25,O,s+.006),C(u+.25,O,s+.006)],w,kr(_,(o-.5)/k),[1,1,1],4,.9);let A=kr(_,4);r.quad([C(d+.006,D,s-.25),C(d+.006,D,.3),C(d+.006,O,.3),C(d+.006,O,s-.25)],T,A,[1,1,1],4,.9),r.quad([C(u-.006,D,.3),C(u-.006,D,s-.25),C(u-.006,O,s-.25),C(u-.006,O,.3)],E,A,[1,1,1],4,.9);let j=.16;for(let[e,t]of[[p+.04,D-.04],[O+.04,h-.04]]){let n=Math.round((o-.1)/j),i=Math.round((s-.1)/j);r.quad([C(u+.05,e,s+.008),C(d-.05,e,s+.008),C(d-.05,t,s+.008),C(u+.05,t,s+.008)],w,[0,0,n,1],v,6,1.4),r.quad([C(d+.008,e,s-.05),C(d+.008,e,.1),C(d+.008,t,.1),C(d+.008,t,s-.05)],T,[0,0,i,1],v,6,1.4),r.quad([C(u-.008,e,.1),C(u-.008,e,s-.05),C(u-.008,t,s-.05),C(u-.008,t,.1)],E,[0,0,i,1],v,6,1.4)}let ee=Math.round(o/.45),M=Math.round(s/.45);r.quad([C(u,p-.002,.05),C(d,p-.002,.05),C(d,p-.002,s),C(u,p-.002,s)],[0,-1,0],[0,0,ee,M],v,6,1.1);let N=t.tile(m,g).det;N.setPart(it.STEEL).setColor(2303013);for(let t of[u+.4,d-.4])Br(N,e,t-.03,t+.03,h+.02,h+.08+s*.6,0,.06),Br(N,e,t-.02,t+.02,h,h+.05,.05,s-.3);a.box(...$(e,u,p,0,d,h,s),`awning`,1),S(...$(e,u-.1,p-.1,0,d+.1,h+.2,s+.1)),c.point(Q(e,(u+d)/2,p-.5,s*.6),new f(1,.72,.42),10+2.5*o,12,.4),n.marquee=(n.marquee??0)+1,i(`marquee`,e,(u+d)/2,p)}}}if(L>3.4&&N.y1>14){let e=F.filter(e=>e.t===`street`&&(e.view===`avenue`||e.view===`street`||e.view===`park`)&&e.fr.W>14).sort((e,t)=>(t.view!==`street`)-(e.view!==`street`))[0];if(e){let r=e.fr,o=r.W*(.4+y()*.2),s=b(m,g),c=t.tile(m,g).det,l=ie||ne===`deco`||ne===`postwar`,u=ne===`apt`||ne===`postwar`,d=!1;if(u&&y()<.6&&[`sidewalk`].includes(vr(...(e=>[e[0],e[2]])(Q(r,o,0,3.9))).type)){let e=2.3,t=3.5,l=2.95,u=3.3;if(!C($(r,o-e/2-.1,2.5,.1,o+e/2+.1,3.5999999999999996,3.6))){let f=Lr([2047275,5904927,1713472,2763306,3878434][Math.floor(y()*5)]);zr(s.op,r,o-e/2,o+e/2,l,u,.02,t,f,null,7,0,61,7);let p=1.196;s.op.quad([Q(r,o-p/2,2.99,3.512),Q(r,o+p/2,2.99,3.512),Q(r,o+p/2,3.25,3.512),Q(r,o-p/2,3.25,3.512)],[r.N[0],0,r.N[1]],kr([15,48,10,36,35,60,63][Math.floor(y()*7)],p/.26),Lr(13215840),8,0),c.setPart(it.GALV).setColor(12098138);for(let t of[-1,1])c.tube(Q(r,o+t*(e/2-.12),0,3.35),Q(r,o+t*(e/2-.12),l,3.35),.035,6),a.box(...$(r,o+t*(e/2-.12)-.04,0,3.31,o+t*(e/2-.12)+.04,l,3.39),`pole`);a.box(...$(r,o-e/2,l,0,o+e/2,u,t),`awning`,1),S(...$(r,o-e/2,0,0,o+e/2,u,t)),d=!0,n.canopy=(n.canopy??0)+1,i(`canopy`,r,o,l)}}if(!d&&(l||u)&&y()<.55+.3*v.fidi){let e=.36+y()*.16,t=Math.min(r.W-2,e*4.3),a=L-.45,c=a-e;c>2.4&&!C($(r,o-t/2,c,0,o+t/2,a,.3))&&(s.op.quad([Q(r,o-t/2,c,.035),Q(r,o+t/2,c,.035),Q(r,o+t/2,a,.035),Q(r,o-t/2,a,.035)],[r.N[0],0,r.N[1]],kr([10,36,35,15,48,60,63,41][Math.floor(y()*8)],t/e),Lr(y()<.6?13215840:13158596),8,0),S(...$(r,o-t/2,c,0,o+t/2,a,.1)),n.letters=(n.letters??0)+1,i(`letters`,r,o,c))}}}if(!ie&&L>3.6&&ne!==`deco`&&N.y1>L+3){let e=Math.min(.92,.3+.45*O);for(let t of F){if(t.t!==`street`||t.view!==`avenue`&&t.view!==`street`||t.fr.W<5)continue;let r=t.fr,i=Math.max(1,Math.floor(r.W/6.5+.5)),o=r.W/i,s=L-.6,c=s-(.72+y()*.36),l=b(m,g),u=y()<.35,d=Math.floor(y()*64),f=Lr([1842463,2764600,3810336,2044710,6969914,2894896][Math.floor(y()*6)]);for(let t=0;t<i;t++){let i=t*o+.38,p=(t+1)*o-.38;if(!u&&y()>e){let e=Math.min(L-.6,Math.max(L-1.5,3.6));e-.95>=2.63&&y()<.5*Math.min(1,O)+.12&&!C($(r,i,2.4,.1,p,e+.1,1.8))&&re(l.op,r,i,p,e,y,Math.floor(y()*64));continue}let m=.16+y()*.1;if(C($(r,i,c,0,p,s,m+.05))||C($(r,i,3,.2,p,s,1.6))){u=!1;continue}let h=u?f:Lr([1842463,2764600,3810336,2044710,6969914,2894896,4857374,2109514][Math.floor(y()*8)]);zr(l.op,r,i,p,c,s,.02,m,h,null,0,0,61);let g=Math.min(p-i-.16,(s-c-.12)*4.6),_=(i+p-g)/2,v=u?d:Math.floor(y()*64),b=!u&&y()<.22?Mr(Math.floor(y()*8),g/(s-c-.12)):kr(v,g/(s-c-.12)),x=.3+.35*Math.min(1,O)*y();l.op.quad([Q(r,_,c+.06,m+.004),Q(r,_+g,c+.06,m+.004),Q(r,_+g,s-.06,m+.004),Q(r,_,s-.06,m+.004)],[r.N[0],0,r.N[1]],b,[1,1,1],4,x),a.box(...$(r,i,c,0,p,s,m),`equipment`,9),S(...$(r,i,c,0,p,s,m)),n.front=(n.front??0)+1,c-.06-.85>=2.63&&y()<.35*Math.min(1,O)+.08&&!C($(r,i,2.4,.1,p,c-.1,1.8))&&re(l.op,r,i,p,c-.06,y)}}}if(!ie&&ne!==`deco`&&!ae&&L>3.4){let e=N.p??s,t=e.floorH??3.3,r=e.margin??.6,a=Math.floor((N.y1+(N.parapet??0)-L)/t+.01);if((e.style??0)<1.5&&N.y1>L+t+1){let o=Math.min(.75,.2+.45*Math.min(1,O));for(let s of F){if(s.t!==`street`||s.view!==`avenue`&&s.view!==`street`||y()>o)continue;let c=s.fr,l=c.W-2*r;if(l<2.5)continue;let u=Math.max(1,Math.floor(l/(e.bayW??2.4)+.5)),d=l/u;if(a<5&&d>2.15)continue;let f=d*(e.winW??.5),p=t*(e.winH??.55),h=(t-p)*.42;a>=5&&(p=Math.min(t-.5,p*1.14),h=(t-p)*.5);let _=Math.min(f*.96,1.7),v=_/4,x=L+h+p*(.42+y()*.2);if(_<.5||v>p*.5)continue;let S=Math.floor(y()*16),w=Math.min(u,1+Math.floor(y()*3)),T=Math.floor(y()*(u-w+1)),E=b(m,g);for(let e=0;e<w;e++){let t=r+(T+e+.5)*d;C($(c,t-_/2,x-v/2,0,t+_/2,x+v/2,.06))||(E.op.quad([Q(c,t-_/2,x-v/2,.014),Q(c,t+_/2,x-v/2,.014),Q(c,t+_/2,x+v/2,.014),Q(c,t-_/2,x+v/2,.014)],[c.N[0],0,c.N[1]],Nr(S,_/v),[1,1,1],9,0),n.winLetters=(n.winLetters??0)+1,i(`win`,c,t,x))}}}}let R=F.filter(e=>e.t===`street`&&(e.view===`avenue`||e.view===`street`)).length>=2,z=.55*w*w+.02*v.midtown+.04*x+.025*v.fidi;if(R&&se>18&&y()<z){let e=F.filter(e=>e.t===`street`&&(e.view===`avenue`||e.view===`street`)&&e.fr.W>12).sort((e,t)=>(t.view===`avenue`)-(e.view===`avenue`)).slice(0,w>.45?2:1);for(let t of e){let e=t.fr,r=Math.min(e.W*.45,9+y()*7),o=Math.min(se-(s.gH??5)-3,r*(.45+y()*.35));if(o<4)continue;let l=[`nx`,`px`,`nz`,`pz`].indexOf(t.s),d=F.filter(e=>e.t===`street`&&e!==t&&[`nx`,`px`,`nz`,`pz`].indexOf(e.s)>>1!=l>>1)[0],f=y()<.5;if(d){let t=Q(e,e.W,0,0),n=d.fr;f=Math.abs(n.N[0]?t[0]-n.O[0]:t[2]-n.O[1])<.5}let h=f?e.W-r-.4:.4,_=(s.gH??5)+1.2,v=_+o,x=b(m,g),S=r/o>1.1,C=S?u(m,g):p(m,g),w=S?Dr(C,r/o):Or(C,r/o),T=(S?st:at)[C]??[.15,.15,.15],E=.2126*T[0]+.7152*T[1]+.0722*T[2],D=1.35*Math.min(1.4,Math.max(.5,(.15/(E+.02))**.5));zr(x.op,e,h-.18,h+r+.18,_-.18,v+.18,.02,.42,Lr(1710877),null,0,0,62),zr(x.op,e,h,h+r,_,v,.42,.45,Lr(1710877),w,3,D,1),a.box(...$(e,h-.18,_-.18,0,h+r+.18,v+.18,.45),`equipment`,9),c.rect(Q(e,h+r/2,(_+v)/2,.4),[e.N[0],0,e.N[1]],[e.T[0],0,e.T[1]],r,o,T,1,{uv:w,gain:1.8}),n.led++,i(`led`,e,h+r/2,_)}}}for(let e of t.roofSignPanels??[]){let t=Rr(e.alx?{x0:e.a0,x1:e.a1,z0:e.plane,z1:e.plane}:{x0:e.plane,x1:e.plane,z0:e.a0,z1:e.a1},e.k),r=e.a1-e.a0,i=e.y1-e.y0,a=Q(t,r/2,0,0),o=b(a[0],a[2]),s=Dr(u(a[0],a[2]),r/i);o.op.quad([Q(t,0,e.y0,0),Q(t,r,e.y0,0),Q(t,r,e.y1,0),Q(t,0,e.y1,0)],[t.N[0],0,t.N[1]],s,[1,1,1],1,0),c.rect(Q(t,r/2,(e.y0+e.y1)/2,.03),[t.N[0],0,t.N[1]],[t.T[0],0,t.T[1]],r,i,null,1,{uv:s,printed:!0}),n.roofPanel=(n.roofPanel??0)+1}t.textures;let ae=Hr(rt(),et(),(()=>{let e=new Uint8Array(65536),t=_r(7),n=Array.from({length:768},()=>t()),i=e=>e*e*(3-2*e);for(let t=0;t<128;t++)for(let r=0;r<128;r++)for(let a=0;a<3;a++){let o=0,s=.5,c=1;for(let e=0;e<3;e++){let e=4*c,l=r/128*e,u=t/128*e,d=Math.floor(l),f=Math.floor(u),p=i(l-d),m=i(u-f),h=(t,r)=>n[((t%e+e)%e*16+(r%e+e)%e)%256*3+a];o+=s*((h(d,f)*(1-p)+h(d+1,f)*p)*(1-m)+(h(d,f+1)*(1-p)+h(d+1,f+1)*p)*m),s*=.5,c*=2}e[(t*128+r)*4+a]=Math.round(255*Math.min(1,o/.875)),e[(t*128+r)*4+3]=255}let a=new v(e,128,128);return a.wrapS=a.wrapT=m,a.magFilter=d,a.minFilter=r,a.generateMipmaps=!0,a.needsUpdate=!0,a})(),!1,Vr(xr+`city_signart.ktx2`)),P=[];for(let t of y.values()){let r=t.op.build(),i=t.gh.build(),a={x0:t.x0,z0:t.z0,op:null,gh:null};if(r){let t=new g(r,ae);t.name=`signage`,t.castShadow=!0,t.receiveShadow=!0,t.userData.smallCasters=!0,t.userData.maxCascade=2,e.add(t),a.op=t,n.tris+=r.index.count/3}if(i){let t=new g(i,null);t.name=`signageGhost`,t.castShadow=!1,t.receiveShadow=!0,t.renderOrder=1,e.add(t),a.gh=t,n.tris+=i.index.count/3}(a.op||a.gh)&&P.push(a)}if(n.meshes=P.reduce((e,t)=>e+!!t.op+!!t.gh,0),n.lights=c.commit(`signage`),n.bladeLights=l.commit(`signBlades`,{grid:ot(),mergeA:0}),console.log(`[signage] ${n.roof} rooftop billboards (+${n.roofPanel??0} roof-kit ad faces), ${n.front??0} shop fascias, ${n.marquee??0} marquees, ${n.wall} wall ads, ${n.ghost} ghost signs, ${n.blade} blade signs, ${n.led} LED screens, ${n.awning??0} awnings, ${n.canopy??0} canopies, ${n.letters??0} lobby letters, ${n.winLetters??0} window letterings | ${P.length} cells, ${n.meshes} meshes, ${(n.tris/1e3).toFixed(1)}k tris`),Cr.has(`signdbg`)){let[e,t,r]=(Cr.get(`signdbg`)||`0,0,900`).split(`,`).map(Number);for(let i in n.at)console.log(`[signage-at] `+i+` `+JSON.stringify(n.at[i].filter(n=>Math.hypot(n[0]-e,n[2]-t)<r).slice(0,40)))}return typeof window<`u`&&(window.__signage=n),{stats:n,update(e){for(let t of P){let n=Math.max(0,t.x0-e.x,e.x-(t.x0+Sr)),r=Math.max(0,t.z0-e.z,e.z-(t.z0+Sr)),i=Math.hypot(n,r);t.op&&(t.op.visible=i<850,t.op.castShadow=i<120),t.gh&&(t.gh.visible=i<520)}}}}var Wr=`// neon shader sections. Use parseShaderSections() to select an injection chunk.
// @section vertexCommon
#include <common>
      in vec4 aS; in vec3 iO; in vec3 iT; in vec3 iV; in vec4 iD; in vec4 iC;
      out vec4 vNeonC; out float vNeonDim; vec3 neonPos;
// @section vertexBeginNormalVertex

      int nSide = int(aS.x + 0.5);
      float nW = iD.x, nH = iD.y, nR = iD.z; int nMask = int(iD.w + 0.5);
      vec3 nT = iT, nV = iV, nN = normalize(cross(iT, iV));
      float nDist = length(iO + nT * nW * 0.5 + nV * nH * 0.5 - cameraPosition);
      float nRe = max(nR, nDist * 0.00062); // ~0.6 px at 1080p / 55 deg: no sub-pixel shimmer, energy kept below
      vNeonDim = nR / nRe;
      vNeonC = iC;
      vec2 p0 = nSide == 0 ? vec2(0.0) : nSide == 1 ? vec2(nW, 0.0) : nSide == 2 ? vec2(nW, nH) : vec2(0.0, nH);
      vec2 dr = nSide == 0 ? vec2(1.0, 0.0) : nSide == 1 ? vec2(0.0, 1.0) : nSide == 2 ? vec2(-1.0, 0.0) : vec2(0.0, -1.0);
      float nLen = (nSide == 0 || nSide == 2) ? nW : nH;
      float nS = mix(-nRe, nLen + nRe, aS.y);                            // run past the corners: closed joints / end caps
      vec3 nAx = nT * dr.x + nV * dr.y, nPerp = nT * abs(dr.y) + nV * abs(dr.x);
      float nFlat = iC.w >= 1.0 ? 0.35 : 1.0;                               // LED strips: a flat ribbon
      vec3 objectNormal = normalize(nPerp * aS.z + nN * aS.w);
      neonPos = iO + nT * p0.x + nV * p0.y + nAx * nS + (nPerp * aS.z * nFlat + nN * aS.w) * nRe;
      if (((nMask >> nSide) & 1) == 0 || nDist > 700.0) neonPos = iO;       // masked side / far: degenerate
      #ifdef USE_TANGENT
      vec3 objectTangent = vec3(tangent.xyz);
      #endif
// @section vertexBeginVertex
vec3 transformed = neonPos;
// @section fragmentCommon
#include <common>
      in vec4 vNeonC; in float vNeonDim; uniform float uNeonK, uNeonT, uNeonS; uniform vec4 uNeon;
// @section fragmentColor
#include <color_fragment>
      diffuseColor.rgb = mix(vec3(0.55), vNeonC.rgb, 0.35) * uNeon.z; // unlit glass tube (pale tint) by day
// @section fragmentEmissive
#include <emissivemap_fragment>
      if (uNeonK > 0.0) {
        float led = step(1.0, vNeonC.w), seed = fract(vNeonC.w);
        float face = abs(dot(normalize(normal), normalize(vViewPosition)));
        vec3 col = vNeonC.rgb;
        // bright saturated core, dimmer + deeper colour toward the tube's silhouette; LED ribbons flat and even
        vec3 e = col * mix(mix(0.4, 1.0, pow(face, 1.5)), 0.85, led);
        e = mix(e, vec3(max(max(col.r, col.g), col.b)), 0.18 * pow(face, 6.0) * (1.0 - led));
        float fl = 1.0;
        if (seed < 0.034 && led < 0.5) { // ~1 in 30 tubes buzz: brief dips, cheap hash of time
          float h = fract(sin(floor(uNeonT * 13.0 + seed * 977.0) * 12.9898) * 43758.5453);
          fl = h > 0.82 ? 0.25 + 0.5 * h * h : 1.0;
        }
        totalEmissiveRadiance += e * uNeon.x * mix(1.0, uNeon.y, led) * uNeonS * uNeonK * vNeonDim * fl;
      }
// @section vertexCommonByNeonUvScale
#include <common>
      in vec3 iO; in vec3 iT; in vec4 iD; in vec4 iC; out vec2 vNeonUv, vNeonQ; out vec4 vNeonC; out float vNeonDim;
// @section vertexBeginVertexByNeonDimmer

      vec3 nN = vec3(-iT.z, 0.0, iT.x);
      vec3 transformed = iO + iT * position.x * iD.x + vec3(0.0, 1.0, 0.0) * position.y * iD.y;
      float cell = iD.z, asp = iD.x / iD.y;
      // the cell holds the item centred at its own aspect (90 % x 78 % of 512 x 256): map the quad onto that box
      float ca = __SHADER_INJECT_0__;
      vec2 sz = asp > ca ? vec2(0.9, 0.9 / asp * 2.0) : vec2(0.78 * asp * 0.5, 0.78);
      if (cell > 23.5) sz = vec2(0.5, 1.0) / 1.12; // icons: drawn in the cell's centre square
      vec2 cuv = 0.5 + position.xy * min(sz * 1.12, vec2(0.995));
      vNeonUv = vec2((mod(cell, 4.0) + cuv.x) / 4.0, 1.0 - (floor(cell / 4.0) + 1.0 - cuv.y) / 8.0);
      vNeonC = iC; vNeonQ = position.xy + 0.5;
      float d = length(iO - cameraPosition);
      vNeonDim = 1.0 - smoothstep(420.0, 600.0, d);
      if (d > 600.0) transformed = iO;
// @section fragmentCommonByNeonColor
#include <common>
      in vec2 vNeonUv, vNeonQ; in vec4 vNeonC; in float vNeonDim; uniform float uNeonK, uNeonT, uNeonS; uniform sampler2D uNeonTex; uniform vec4 uNeonW;
// @section fragmentMap

      vec2 nt = max(texture(uNeonTex, vNeonUv).rg - 0.02, 0.0) / 0.98; // webp noise floor
      vec2 eq = min(vNeonQ, 1.0 - vNeonQ); nt.g *= smoothstep(0.0, 0.12, min(eq.x, eq.y * 2.0)); // halo fades out before the quad edge
      float seed = fract(vNeonC.w), fl = 1.0;
      if (seed < 0.034) { float h = fract(sin(floor(uNeonT * 11.0 + seed * 613.0) * 12.9898) * 43758.5453); fl = h > 0.8 ? 0.2 + 0.4 * h : 1.0; }
      vec3 col = vNeonC.rgb;
      vec3 e = col * nt.r + mix(col, vec3(max(max(col.r, col.g), col.b)), 0.25) * nt.r * nt.r * 0.2 + col * nt.g * uNeonW.y;
      diffuseColor.rgb = e * uNeonW.x * uNeonS * uNeonK * fl * vNeonDim;
`;function Gr(e){let t=ue(e.value);return t.onRenderUpdate(()=>{t.value=e.value}),t}function Kr(){return new Ee({transparent:!0,depthWrite:!1,blending:5,blendEquation:100,blendSrc:201,blendDst:201,blendSrcAlpha:200,blendDstAlpha:201,toneMapped:!1})}function qr(e){let t=Kr();t.name=`NeonTubes.TSL`,t.side=2;let n=Gr(e.uNeonK),r=Gr(e.uNeonS),i=ue(e.uNeon.value),a=ve(`aS`,`vec4`),o=ve(`iO`,`vec3`),s=ve(`iT`,`vec3`),c=ve(`iV`,`vec3`),l=ve(`iD`,`vec4`),u=ve(`iC`,`vec4`),d=P(a.x.add(.5)),f=l.x,p=l.y,m=l.z,h=d.lessThan(.5),g=d.greaterThan(.5).and(d.lessThan(1.5)),_=d.greaterThan(1.5).and(d.lessThan(2.5)),v=N(h,z(1),N(_,z(-1),z(0))),y=N(g,z(1),N(d.greaterThan(2.5),z(-1),z(0))),b=U(N(g.or(_),f,z(0)),N(_,p,z(0))),x=N(h.or(_),f,p),S=o.add(s.mul(b.x)).add(c.mul(b.y)),C=ge.sub(S).length(),w=m.max(C.mul(62e-5)),T=W(w.negate(),x.add(w),a.y),E=s.mul(v).add(c.mul(y)),D=s.mul(y.abs()).add(c.mul(v.abs())),O=N(u.w.greaterThanEqual(1),z(.35),z(1)),k=o.add(s.mul(b.x)).add(c.mul(b.y)).add(E.mul(T)).add(D.mul(a.z).mul(w).mul(O)).add(re(xe(s,c)).mul(a.w).mul(w)),A=le(z(2),d),ee=Se(P(l.w.div(A)),2).greaterThan(.5);t.positionNode=N(ee.and(C.lessThan(700)),k,o);let M=u.w.greaterThanEqual(1),te=W(V(.55),u.rgb,.35).mul(i.z),ne=W(i.x,i.y,M),ie=u.rgb.mul(ne).mul(r).mul(n).mul(z(1).sub(j(650,700,C)));return t.colorNode=te.add(ie),t.userData.uni=e,t}function Jr(e){let t=Kr();t.name=`NeonWords.TSL`;let n=Gr(e.uNeonK),r=Gr(e.uNeonS),i=Gr(e.uNeonT),a=ue(e.uNeonW.value),o=ve(`iO`,`vec3`),s=ve(`iT`,`vec3`),c=ve(`iD`,`vec4`),l=ve(`iC`,`vec4`),u=ie,d=ge.sub(o).length(),f=c.x.div(c.y),p=f.greaterThan(2.3077),m=N(p,U(.9,z(.9).div(f).mul(2)),U(f.mul(.39),.78));m=N(c.z.greaterThan(23.5),U(.5,1).div(1.12),m);let h=U(.5).add(u.xy.mul(m.mul(1.12).min(U(.995)))),g=U(Se(c.z,4).add(h.x).div(4),z(1).sub(P(c.z.div(4)).add(1).sub(h.y).div(8))),_=o.add(s.mul(u.x.mul(c.x))).add(V(0,u.y.mul(c.y),0));t.positionNode=N(d.lessThan(600),_,o);let v=M(e.uNeonTex.value,g);v.onRenderUpdate(()=>{v.value=e.uNeonTex.value});let y=v.r.sub(.02).max(0).div(.98),b=de(u.x.add(.5),z(.5).sub(u.x)).min(de(u.y.add(.5),z(.5).sub(u.y))),x=v.g.sub(.02).max(0).div(.98).mul(j(0,.12,b)),S=_e(_e(l.r,l.g),l.b),C=l.rgb.mul(y).add(W(l.rgb,V(S),.25).mul(y.mul(y)).mul(.2)).add(l.rgb.mul(x).mul(a.y)),w=B(l.w),T=P(i.mul(11).add(w.mul(613))),E=B(H(T.mul(12.9898)).mul(43758.5453)),D=N(w.lessThan(.034).and(E.greaterThan(.8)),z(.2).add(E.mul(.4)),z(1)),O=z(1).sub(j(420,600,d));return t.colorNode=C.mul(a.x).mul(r).mul(n).mul(D).mul(O),t.userData.uni=e,t}export{Ht as A,_t as B,En as C,Zt as D,tn as E,jt as F,At as I,bt as L,Ft as M,It as N,xn as O,Pt as P,yt as R,Dn as S,bn as T,Hn as _,dr as a,In as b,Yn as c,Kn as d,Gn as f,Vn as g,Rn as h,Ur as i,Rt as j,Sn as k,Jn as l,Wn as m,Jr as n,ur as o,Bn as p,Wr as r,nr as s,qr as t,qn as u,Mn as v,Tn as w,kn as x,Nn as y,vt as z};
//# sourceMappingURL=world~index-CHf49u6j.js.map