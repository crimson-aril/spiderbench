import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import * as THREE from "three";
import { getQuality } from "./quality.ts";

let loader: KTX2Loader | null = null;
const texturePromises = new Map<string, ReturnType<KTX2Loader["loadAsync"]>>();
const loadedTextures = new Map<string, Awaited<ReturnType<KTX2Loader["loadAsync"]>>>();

/** Configure KTX2 transcoding for the renderer before requesting any textures. */
export function configureKTX2Loader(renderer: unknown): KTX2Loader {
  if (loader) return loader;
  loader = new KTX2Loader();
  loader.detectSupport(renderer);
  return loader;
}

export function getKTX2Loader(): KTX2Loader {
  if (!loader) {
    throw new Error("KTX2Loader must be configured with a renderer before use.");
  }
  return loader;
}

/** Resolve a KTX2 URL directly, while preserving query/hash suffixes and supporting raster URL migration. */
export function ktx2Url(sourceUrl: string): string {
  const suffixOffset = sourceUrl.search(/[?#]/);
  const resource = suffixOffset < 0 ? sourceUrl : sourceUrl.slice(0, suffixOffset);
  const suffix = suffixOffset < 0 ? "" : sourceUrl.slice(suffixOffset);

  return `${resource.replace(/\.(?:png|jpe?g|webp)$/i, ".ktx2")}${suffix}`;
}

export function loadKTX2TextureAsync(sourceUrl: string) {
  const url = ktx2Url(sourceUrl);
  let pending = texturePromises.get(url);
  if (!pending) {
    pending = getKTX2Loader()
      .loadAsync(url)
      .then((texture) => {
        // KTX2 mip data is supplied explicitly to the GPU. On the Low preset,
        // drop the largest mip before upload so compressed textures occupy a
        // smaller resident allocation instead of merely lowering screen size.
        const quality = getQuality();
        const skipMips = quality.name === "low" ? 1 : 0;
        if (texture.isCompressedTexture && skipMips > 0 && texture.mipmaps.length > skipMips) {
          texture.mipmaps = texture.mipmaps.slice(skipMips);
          texture.image.width = texture.mipmaps[0].width;
          texture.image.height = texture.mipmaps[0].height;
          texture.minFilter = texture.mipmaps.length > 1
            ? THREE.LinearMipmapLinearFilter
            : THREE.LinearFilter;
          texture.needsUpdate = true;
          texture.userData.lowMipTrimmed = skipMips;
        }
        loadedTextures.set(url, texture);
        return texture;
      })
      .catch((error) => {
        console.error(`[texture-load] Failed to load or transcode ${url}`, error);
        throw error;
      });
    texturePromises.set(url, pending);
  }
  return pending;
}

/** Preload KTX2 files for synchronous builders that take an already loaded Texture. */
export async function preloadKTX2TexturesAsync(sourceUrls: string[]) {
  await Promise.all(sourceUrls.map(loadKTX2TextureAsync));
}

/** Get a texture previously loaded by loadKTX2TextureAsync or preloadKTX2TexturesAsync. */
export function getLoadedKTX2Texture(sourceUrl: string) {
  const url = ktx2Url(sourceUrl);
  const texture = loadedTextures.get(url);
  if (!texture) {
    throw new Error(`KTX2 texture was not preloaded: ${url}`);
  }
  return texture;
}
