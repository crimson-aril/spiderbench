// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";

export function createCanopyNodeMaterial(fadeRange = null, qualityName = "high") {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0xffffff,
    roughness: 0.95,
    metalness: 0,
    flatShading: false,
  });
  material.name = "FarCanopy.TSL";
  const position = TSL.attribute("position", "vec3");
  const localPosition = TSL.varying(position, "vCanopyPositionNode");
  const localNormal = TSL.varying(TSL.attribute("normal", "vec3"), "vCanopyNormalNode");
  const center = TSL.varying(TSL.attribute("aCanopyCenter", "vec3"), "vCanopyCenterNode");

  if (fadeRange) {
    const distance = TSL.cameraPosition.sub(TSL.attribute("aCanopyCenter", "vec3")).length();
    const fade = TSL.smoothstep(fadeRange[0], fadeRange[1], distance).max(1e-3);
    material.positionNode = position.mul(fade);
  }

  const breakup = TSL.fract(
    TSL.sin(
      TSL.dot(
        TSL.floor(localNormal.mul(2).add(0.5)),
        TSL.vec3(12.9, 78.2, 37.7),
      ),
    ).mul(4375.5),
  );
  const underside = TSL.mix(0.45, 1.05, TSL.smoothstep(-0.9, 0.7, localPosition.y));
  let foliage = TSL.float(1);
  if (qualityName !== "low") {
    const clump = TSL.mx_noise_float(localNormal.mul(3.3).add(center.mul(0.137)))
      .mul(0.5)
      .add(0.5)
      .mul(0.62)
      .add(
        TSL.mx_noise_float(localNormal.mul(7.9).add(center.mul(0.291)))
          .mul(0.5)
          .add(0.5)
          .mul(0.38),
      );
    foliage = TSL.mix(0.58, 1.1, TSL.smoothstep(0.28, 0.72, clump));

    const dx = TSL.positionView.dFdx();
    const dy = TSL.positionView.dFdy();
    const normal = TSL.normalView;
    const r1 = dy.cross(normal);
    const r2 = normal.cross(dx);
    const determinant = dx.dot(r1);
    const gradient = determinant.sign().mul(
      clump.dFdx().mul(r1).add(clump.dFdy().mul(r2)).mul(2.2),
    );
    material.normalNode = determinant.abs().mul(normal).sub(gradient).normalize();
  }
  material.colorNode = underside.mul(TSL.float(0.92).add(breakup.mul(0.16))).mul(foliage);
  return material;
}
