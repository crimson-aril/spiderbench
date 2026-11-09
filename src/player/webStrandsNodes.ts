import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";

/** TSL version of the screen-space web ribbon material. */
export function createWebStrandNodeMaterial() {
  const uniforms = {
    uRes: TSL.uniform(new WEBGPU.Vector2(1920, 1080)),
    uWidth: TSL.uniform(0.022),
    uMinPx: TSL.uniform(2),
    uColor: TSL.uniform(new WEBGPU.Color(0xeef2f6)),
    uOpacity: TSL.uniform(0.92),
    uVenom: TSL.uniform(0),
  };
  const side = TSL.attribute("side", "float");
  const strandWidth = TSL.attribute("strandW", "float");
  const nextPosition = TSL.attribute("nextPos", "vec3");
  const alongDistance = TSL.attribute("dist", "float");
  const directionPosition = TSL.positionLocal;
  const viewPosition = TSL.modelViewMatrix.mul(TSL.vec4(directionPosition, 1));
  const clipPosition = TSL.cameraProjectionMatrix.mul(viewPosition);
  const nextClip = TSL.cameraProjectionMatrix.mul(
    TSL.modelViewMatrix.mul(TSL.vec4(nextPosition, 1)),
  );
  const screenStart = clipPosition.xy.div(clipPosition.w).mul(uniforms.uRes).mul(0.5);
  const screenNext = nextClip.xy.div(nextClip.w).mul(uniforms.uRes).mul(0.5);
  const screenDirection = screenNext.sub(screenStart);
  const screenLength = screenDirection.length();
  const direction = screenDirection.div(screenLength.max(1e-4));
  const perpendicular = TSL.vec2(direction.y.negate(), direction.x);
  const focalY = TSL.cameraProjectionMatrix.element(1).element(1);
  const pixelWidth = uniforms.uWidth
    .mul(strandWidth)
    .mul(focalY)
    .mul(uniforms.uRes.y)
    .mul(0.5)
    .div(viewPosition.z.negate().max(0.05));
  const width = pixelWidth.max(uniforms.uMinPx);
  const expandedSide = side.mul(width.mul(0.5).add(1)).div(width.mul(0.5));
  const clipOffset = perpendicular
    .mul(side)
    .mul(width.mul(0.5).add(1))
    .div(uniforms.uRes.mul(0.5))
    .mul(clipPosition.w);

  const vSide = TSL.varying(expandedSide, "vSide");
  const vAlpha = TSL.varying(
    pixelWidth.div(uniforms.uMinPx).clamp(0.35, 1),
    "vAlpha",
  );
  const vDist = TSL.varying(alongDistance, "vDist");
  const vPx = TSL.varying(width, "vPx");

  const material = new WEBGPU.MeshBasicNodeMaterial();
  material.name = "WebStrands.TSL";
  material.vertexNode = clipPosition.add(TSL.vec4(clipOffset, 0, 0));

  const hash = (x: any) => TSL.fract(TSL.sin(x.mul(127.1)).mul(43758.5453));
  const noise1 = (x: any) => {
    const cell = TSL.floor(x);
    const f = TSL.fract(x);
    const smoothF = f.mul(f).mul(TSL.float(3).sub(f.mul(2)));
    return TSL.mix(hash(cell), hash(cell.add(1)), smoothF);
  };

  const t = vDist;
  const bulge = noise1(t.mul(1.7).add(3.1));
  const knot = TSL.smoothstep(0.72, 1, noise1(t.mul(3.9).add(1.7)));
  let envelope = TSL.float(0.5)
    .add(bulge.mul(0.36))
    .add(knot.mul(0.2))
    .add(noise1(t.mul(11)).mul(0.06));
  const detail = TSL.smoothstep(3, 9, vPx);
  envelope = TSL.mix(TSL.float(0.95), envelope, detail);
  const pitchPixels = vPx.mul(0.9).div(
    TSL.fwidth(t).mul(3.4).mul(vPx).max(1e-4),
  );
  const braid = detail.mul(TSL.smoothstep(6, 14, pitchPixels));
  const y = vSide.div(envelope);
  const aa = TSL.float(1.6).div(vPx.mul(envelope).mul(0.5).max(1));
  const mottling = noise1(t.mul(4.3).add(11));
  let coverage = TSL.float(0);
  let weightSum = TSL.float(0);
  let colorSum = TSL.vec3(0);

  for (let strand = 0; strand < 3; strand++) {
    const k = TSL.float(strand);
    const phase = t
      .mul(13)
      .add(noise1(t.mul(0.9).add(2)).mul(9))
      .add(k.mul(2.0944))
      .add(noise1(t.mul(2.6).add(k.mul(5))).mul(2.2));
    const depth = TSL.cos(phase);
    const center = TSL.float(0.36)
      .add(noise1(t.mul(5).add(k)).mul(0.14))
      .mul(TSL.sin(phase))
      .mul(braid);
    const radius = TSL.mix(
      TSL.float(1),
      TSL.float(0.5).add(noise1(t.mul(6).add(k.mul(3.3))).mul(0.22)),
      braid,
    );
    const across = y.sub(center).div(radius);
    const strandCoverage = TSL.float(1).sub(
      TSL.smoothstep(
        TSL.float(1).sub(aa.div(radius)),
        TSL.float(1).add(aa.div(radius)),
        across.abs(),
      ),
    );
    coverage = coverage.max(strandCoverage);
    const nz = TSL.float(1).sub(across.mul(across)).max(0).sqrt();
    const fiber = noise1(t.mul(38).add(across.mul(1.5)).add(k.mul(7)));
    const occlusion = TSL.mix(
      TSL.float(1),
      TSL.float(0.5).add(depth.mul(0.5).add(0.5).mul(0.5)),
      braid,
    );
    let strandColor = uniforms.uColor
      .mul(TSL.float(0.5).add(nz.mul(0.5)))
      .mul(TSL.float(0.8).add(fiber.mul(0.3)))
      .mul(TSL.float(0.85).add(mottling.mul(0.3)))
      .mul(occlusion);
    const specular = TSL.float(1)
      .sub(across.add(0.4).abs().mul(1.7))
      .max(0)
      .pow(3)
      .mul(TSL.float(0.45).add(fiber.mul(0.55)))
      .mul(TSL.float(0.55).add(mottling.mul(0.45)))
      .mul(TSL.float(0.6).add(occlusion.mul(0.4)));
    strandColor = strandColor
      .add(TSL.vec3(0.26, 0.28, 0.32).mul(specular))
      .add(TSL.vec3(0.035, 0.04, 0.05).mul(TSL.float(1).sub(nz).pow(3)));
    const weight = strandCoverage
      .mul(TSL.exp(depth.mul(7).mul(braid)))
      .mul(nz)
      .add(1e-4);
    colorSum = colorSum.add(strandColor.mul(weight));
    weightSum = weightSum.add(weight);
  }

  const venomColor = colorSum.div(weightSum.max(1e-4));
  const venomAlpha = coverage
    .mul(uniforms.uOpacity)
    .mul(vAlpha.max(0.8));
  const edge = TSL.float(1).sub(
    TSL.smoothstep(0.55, 1.35, vSide.abs()),
  );
  const core = TSL.float(1).sub(TSL.smoothstep(0, 0.9, vSide.abs()));
  const whiteColor = TSL.mix(
    uniforms.uColor.mul(0.82),
    uniforms.uColor.mul(1.15),
    core,
  );
  const whiteAlpha = edge
    .mul(vAlpha)
    .mul(uniforms.uOpacity)
    .mul(TSL.float(0.75).add(core.mul(0.25)));
  const venomMode = uniforms.uVenom.greaterThan(0.5);
  const alpha = TSL.select(venomMode, venomAlpha, whiteAlpha);
  material.colorNode = TSL.select(venomMode, venomColor, whiteColor);
  material.opacityNode = alpha;
  material.alphaTest = 0.004;
  material.transparent = true;
  material.depthWrite = true;
  material.side = WEBGPU.DoubleSide;

  return { material, uniforms };
}
