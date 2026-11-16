// Three.js does not currently publish its own declarations. Keep its JS API
// usable during the migration; replace this shim with @types/three when the
// declarations catch up with the Three.js version used by the project.
declare module "three";
declare module "three/webgpu";
declare module "three/tsl";
declare module "three/addons/tsl/display/BloomNode.js" {
  export const bloom: any;
}
declare module "three/addons/tsl/display/SSAONode.js" {
  export const ssao: any;
}
declare module "three/addons/tsl/display/SSRNode.js" {
  export const ssr: any;
}
declare module "three/addons/tsl/display/SSGINode.js" {
  export const ssgi: any;
}
declare module "three/addons/tsl/display/TRAANode.js" {
  export const traa: any;
}
declare module "three/addons/tsl/display/DepthOfFieldNode.js" {
  export const dof: any;
}
declare module "three/addons/tsl/display/MotionBlur.js" {
  export const motionBlur: any;
}
declare module "three/addons/tsl/display/GodraysNode.js" {
  export const godrays: any;
}
