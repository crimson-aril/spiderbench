import * as THREE from "three";

/** Pack static geometry attributes into one GPU vertex buffer. */
export function interleaveVertexAttributes(geometry: any): any {
  const entries = (Object.entries(geometry.attributes) as [string, any][]).filter(
    ([, attribute]) =>
      !attribute.isInstancedBufferAttribute &&
      !attribute.isInterleavedBufferAttribute &&
      attribute.itemSize > 0 &&
      attribute.itemSize <= 4,
  );
  if (entries.length < 2) return geometry;

  const count = entries[0]![1].count;
  if (entries.some(([, attribute]) => attribute.count !== count)) return geometry;

  // Keep integer/normalized attributes in their original format so buffer
  // packing does not expand compact GLTF vertex data in VRAM.
  const groups = new Map<any, [string, any][]>();
  for (const [name, attribute] of entries) {
    const type = attribute.array.constructor;
    const group = groups.get(type) ?? [];
    group.push([name, attribute]);
    groups.set(type, group);
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const ArrayType = group[0]![1].array.constructor;
    const bytesPerComponent = group[0]![1].array.BYTES_PER_ELEMENT;
    const componentsPerFourBytes = Math.max(1, 4 / bytesPerComponent);
    const components = group.reduce((size, [, attribute]) => size + attribute.itemSize, 0);
    // WebGPU requires vertex-buffer strides to be four-byte aligned. Padding
    // keeps compact integer attributes interleavable without changing formats.
    const stride = Math.ceil(components / componentsPerFourBytes) * componentsPerFourBytes;
    const data = new ArrayType(count * stride);
    const offsets = new Map<string, number>();
    let offset = 0;

    for (const [name, attribute] of group) {
      offsets.set(name, offset);
      for (let vertex = 0; vertex < count; vertex++) {
        const dst = vertex * stride + offset;
        const src = vertex * attribute.itemSize;
        for (let component = 0; component < attribute.itemSize; component++)
          data[dst + component] = attribute.array[src + component];
      }
      offset += attribute.itemSize;
    }

    const buffer = new THREE.InterleavedBuffer(data, stride);
    for (const [name, attribute] of group) {
      geometry.setAttribute(
        name,
        new THREE.InterleavedBufferAttribute(
          buffer,
          attribute.itemSize,
          offsets.get(name)!,
          attribute.normalized,
        ),
      );
    }
  }

  return geometry;
}
