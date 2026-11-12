import { lazyShaderSections } from "../shaderSections.ts";
import sharedRenderingShaderSource from "./webgl2Shader/glsl/shared-rendering.glsl?raw";
import fullscreenPassVertexShader from "./webgl2Shader/vertex/fullscreen.vert?raw";
// Shared fullscreen rendering helpers, render targets, and common shader snippets.
import * as THREE from "three";

const sharedRenderingShaderSections = lazyShaderSections<
  "depthReconstruction" | "colorSpaceConversion"
>(() => sharedRenderingShaderSource);

type PassUniform = { value: unknown };

type FullscreenPassOptions = {
  uniforms?: Record<string, PassUniform>;
  fragmentShader: string;
  defines?: Record<string, string | number | boolean>;
  blending?: number;
  name?: string;
};

type RenderTargetOptions = {
  type?: number;
  format?: number;
  filter?: number;
  depthBuffer?: boolean;
  count?: number;
  depthTexture?: object | null;
};

type FullscreenRenderer = {
  setRenderTarget(target: unknown): void;
  render(object: unknown, camera: unknown): void;
};

const _tri = new THREE.BufferGeometry();
_tri.setAttribute(
  "position",
  new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3),
);
_tri.setAttribute(
  "uv",
  new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2),
);
const _cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

export const FULLSCREEN_VERTEX_SHADER = fullscreenPassVertexShader;

/** Fullscreen pass wrapping a RawShaderMaterial-ish ShaderMaterial (GLSL3). */
export class FullscreenPass {
  static registeredPasses: FullscreenPass[] = []; // warmup.ts compiles passes before they are first needed
  static camera: unknown = _cam;
  readonly material: any;
  readonly mesh: any;
  readonly uniforms: Record<string, PassUniform>;

  constructor({
    uniforms = {},
    fragmentShader,
    defines = {},
    blending = THREE.NoBlending,
    name = "pass",
  }: FullscreenPassOptions) {
    FullscreenPass.registeredPasses.push(this);
    this.material = new THREE.ShaderMaterial({
      name,
      uniforms,
      defines,
      glslVersion: THREE.GLSL3,
      vertexShader: FULLSCREEN_VERTEX_SHADER,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
      blending,
      toneMapped: false,
    });
    this.mesh = new THREE.Mesh(_tri, this.material);
    this.mesh.frustumCulled = false;
    this.uniforms = this.material.uniforms;
  }
  render(renderer: FullscreenRenderer, target: unknown = null): void {
    renderer.setRenderTarget(target ?? null);
    renderer.render(this.mesh, _cam);
  }
}

export function createRenderTarget(
  width: number,
  height: number,
  opts: RenderTargetOptions = {},
): any {
  const renderTarget = new THREE.WebGLRenderTarget(
    Math.max(1, width | 0),
    Math.max(1, height | 0),
    {
      type: opts.type ?? THREE.HalfFloatType,
      format: opts.format ?? THREE.RGBAFormat,
      minFilter: opts.filter ?? THREE.LinearFilter,
      magFilter: opts.filter ?? THREE.LinearFilter,
      depthBuffer: opts.depthBuffer ?? false,
      stencilBuffer: false,
      generateMipmaps: false,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      colorSpace: THREE.NoColorSpace,
      count: opts.count ?? 1,
    },
  );
  if (opts.depthTexture) renderTarget.depthTexture = opts.depthTexture;
  return renderTarget;
}

// Resolve these only when the GLSL pipeline requests them. Eager reads here can
// observe an uninitialized ?raw binding in Rolldown's cyclic chunk graph.
export const getDepthReconstructionGLSL = () =>
  sharedRenderingShaderSections.depthReconstruction;

export const getColorSpaceConversionGLSL = () =>
  sharedRenderingShaderSections.colorSpaceConversion;

export function haltonSequence(index: number, base: number): number {
  let placeValue = 1;
  let sequenceValue = 0;

  while (index > 0) {
    placeValue /= base;
    sequenceValue += placeValue * (index % base);
    index = Math.floor(index / base);
  }

  return sequenceValue;
}
