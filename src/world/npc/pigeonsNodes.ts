// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";

export function createPigeonNodeMaterial(timeState) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    roughness: 0.8,
    side: 2,
  });
  material.name = "CityPigeons.TSL";
  // colorNode applies the geometry color explicitly below.
  material.vertexColors = false;

  const time = TSL.uniform(0).onRenderUpdate((_, self) => {
    self.value = timeState.value;
  });
  const position = TSL.attribute("position", "vec3");
  const tag = TSL.attribute("aTag", "float").add(0.5).floor();
  const instance = TSL.attribute("iF", "vec4");
  const wing = tag.greaterThanEqual(2);
  const leftWing = tag.equal(2);
  const side = TSL.select(leftWing, 1, -1);

  const flapAngle = side.mul(
    instance.x
      .mul(TSL.sin(time.mul(17).add(instance.y.mul(6.28))))
      .add(instance.x.mul(0.15)),
  );
  const wingPoint = TSL.vec2(position.x.sub(side.mul(0.03)), position.y.sub(0.15));
  const foldedPoint = wingPoint.mul(TSL.vec2(TSL.mix(1, 0.18, instance.w), 1));
  const foldedZ = TSL.mix(
    position.z,
    position.z.sub(foldedPoint.x.abs().mul(1.2)).sub(0.02),
    instance.w,
  );
  const wingPosition = TSL.vec3(
    side.mul(0.03).add(
      TSL.cos(flapAngle).mul(foldedPoint.x).sub(TSL.sin(flapAngle).mul(foldedPoint.y)),
    ),
    TSL.float(0.15).add(
      TSL.sin(flapAngle).mul(foldedPoint.x).add(TSL.cos(flapAngle).mul(foldedPoint.y)),
    ),
    foldedZ,
  );

  const peck = instance.z.mul(TSL.sin(time.mul(7).add(instance.y.mul(40))).max(0));
  const headQ = TSL.vec2(position.z.sub(0.08), position.y.sub(0.14));
  const headBob = TSL.sin(time.mul(9).add(instance.y.mul(20)))
    .mul(0.012)
    .mul(TSL.float(1).sub(instance.z))
    .mul(TSL.float(1).sub(TSL.step(0.01, instance.x)));
  const headPosition = TSL.vec3(
    position.x,
    TSL.float(0.14).add(TSL.cos(peck.mul(1.1)).mul(headQ.y).sub(TSL.sin(peck.mul(1.1)).mul(headQ.x))),
    TSL.float(0.08).add(TSL.cos(peck.mul(1.1)).mul(headQ.x).add(TSL.sin(peck.mul(1.1)).mul(headQ.y))).add(headBob),
  );

  material.positionNode = TSL.select(
    wing,
    wingPosition,
    TSL.select(tag.equal(1), headPosition, position),
  );
  const tint = TSL.varying(TSL.attribute("iT", "vec3"), "vPigeonTintNode");
  material.colorNode = TSL.vertexColor().rgb.mul(tint);
  material.userData.nodeUniforms = { time };
  return material;
}
