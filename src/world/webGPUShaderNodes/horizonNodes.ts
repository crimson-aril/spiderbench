// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";
import { InterpolationSamplingMode, InterpolationSamplingType } from "three";
import { nightK } from "../../render/daynight.ts";

export function createHinterlandNodeMaterial() {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0,
  });
  material.name = "DistantHinterland.TSL";
  const night = TSL.uniform(nightK.value).onRenderUpdate((_, self) => {
    self.value = nightK.value;
  });
  const top = TSL.varying(TSL.attribute("normal", "vec3").y).setInterpolation(
    InterpolationSamplingType.FLAT,
    InterpolationSamplingMode.EITHER,
  );
  const wall = TSL.varying(TSL.attribute("aWall", "vec3"), "vHorizonWallNode");
  const roof = TSL.varying(TSL.attribute("aRoof", "vec3"), "vHorizonRoofNode");
  const lit = TSL.varying(TSL.attribute("aLit", "float"), "vHorizonLitNode");
  const position = TSL.positionWorld;
  let color = TSL.select(top.greaterThan(0.5), roof, wall);
  const floorBand = TSL.fract(position.y.div(3.4));
  const bay = TSL.fract(position.x.add(position.z).div(2.6));
  let windows = TSL.select(
    floorBand.greaterThan(0.35)
      .and(floorBand.lessThan(0.85))
      .and(bay.greaterThan(0.3))
      .and(bay.lessThan(0.75)),
    1,
    0,
  );
  const pixelWidth = TSL.max(floorBand.fwidth(), bay.fwidth());
  windows = TSL.mix(windows, 0.3, pixelWidth.mul(1.5).clamp(0, 1));
  color = TSL.select(
    top.greaterThan(0.5),
    color,
    color.mul(TSL.float(1).sub(windows.mul(0.85))).mul(
      TSL.float(0.65).add(TSL.smoothstep(0, 12, position.y).mul(0.35)),
    ),
  );
  material.colorNode = color.mul(TSL.float(1).sub(night.mul(0.85)));
  material.emissiveNode = TSL.select(
    top.greaterThan(0.5),
    TSL.vec3(0),
    TSL.vec3(1, 0.7, 0.42)
      .mul(lit)
      .mul(0.06)
      .mul(TSL.smoothstep(3, 9, position.y))
      .mul(night),
  );
  return material;
}
