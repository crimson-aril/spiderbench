import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";
import { nightK } from "../../render/daynight.ts";

type PartMaterialNodeOptions = {
  name: string;
  instanceTint: boolean;
  instanceState: boolean;
  physical: boolean;
  vehicle: boolean;
  map: object | null;
};

/** Node material equivalent of the shared props/vehicle part-material GLSL. */
export function createPartNodeMaterial({
  name,
  instanceTint,
  instanceState,
  physical,
  vehicle,
  map,
}: PartMaterialNodeOptions) {
  const options = {
    name,
    vertexColors: !map,
    map,
    roughness: 0.7,
    metalness: 0,
  };
  const material = physical
    ? new WEBGPU.MeshPhysicalNodeMaterial(options)
    : new WEBGPU.MeshStandardNodeMaterial(options);

  const part = TSL.varying(
    TSL.attribute("aPart", "float"),
    "vPartId",
  ).round();
  const state = instanceState
    ? TSL.varying(TSL.attribute("aState", "float"), "vPartState")
    : TSL.float(0);
  const tint = instanceTint
    ? TSL.varying(TSL.attribute("aTint", "vec3"), "vPartTint")
    : TSL.vec3(1);
  const partIs = (id: number) => part.equal(id);
  const either = (a: any, b: any) => a.or(b);
  const useVehicleEffects = vehicle && map != null;
  const night = TSL.uniform(nightK.value);
  night.onRenderUpdate(() => {
    night.value = nightK.value;
  });
  let baseColor = map
    ? TSL.materialColor
    : TSL.materialColor.mul(TSL.vertexColor().rgb);
  let vehicleY: any = null;
  let vehicleAO: any = null;
  if (useVehicleEffects) {
    const seed = TSL.varying(
      TSL.attribute("aSeed", "float"),
      "vVehicleSeed",
    );
    const uvCoord = TSL.uv();
    const adIndex = TSL.floor(
      TSL.fract(seed.mul(7.31).add(0.13)).mul(8),
    );
    const adUv = TSL.vec2(
      TSL.float(0.5).add(TSL.mod(adIndex, 2).mul(0.25)),
      TSL.floor(adIndex.div(2)).mul(170 / 2048),
    ).add(uvCoord.sub(TSL.vec2(0.5, 0)));
    const mappedUv = TSL.select(
      partIs(15).and(uvCoord.x.greaterThan(0.499)),
      adUv,
      uvCoord,
    );
    material.map = null;
    baseColor = TSL.materialColor.mul(TSL.texture(map, mappedUv).rgb);
    vehicleY = TSL.varying(TSL.positionLocal.y, "vVehicleY");
    vehicleAO = TSL.varying(
      TSL.attribute("aAO", "float"),
      "vVehicleAO",
    );
  }
  const signalPart = part.greaterThanEqual(10).and(part.lessThanEqual(12));
  const signalColor = TSL.select(
    partIs(10),
    TSL.vec3(1, 0.06, 0.03),
    TSL.select(
      partIs(11),
      TSL.vec3(1, 0.5, 0.02),
      TSL.vec3(0.05, 1, 0.45),
    ),
  );
  const pedColor = TSL.select(
    state.greaterThan(1.5),
    TSL.vec3(0.9, 0.95, 1),
    TSL.vec3(1, 0.45, 0.05),
  );
  const signalOn = state.sub(part.sub(10)).abs().lessThan(0.5);

  material.vertexColors = false;
  const vehicleBody = useVehicleEffects
    ? baseColor.mul(
        TSL.mix(
          TSL.vec3(1),
          TSL.vec3(0.72, 0.68, 0.62),
          TSL.float(1).sub(TSL.smoothstep(0.16, 0.5, vehicleY)).mul(0.7),
        ),
      )
    : baseColor;
  material.colorNode = TSL.select(
    signalPart,
    signalColor.mul(0.05),
    TSL.select(
      partIs(13),
      pedColor.mul(0.05),
      TSL.select(
        partIs(3),
        TSL.vec3(0.012, 0.014, 0.016),
        TSL.select(
          partIs(1),
          vehicleBody.mul(tint),
          TSL.select(partIs(0), vehicleBody, baseColor),
        ),
      ),
    ),
  );

  let roughness = TSL.float(0.7);
  for (const [id, value] of [
    [1, 0.32], [2, 0.28], [3, 0.04], [4, 0.2], [5, 0.92], [6, 0.55],
    [7, 0.08], [8, 0.2], [9, 0.85], [10, 0.15], [11, 0.15], [12, 0.15],
    [14, 0.1], [15, 0.3], [16, 0.6], [17, 0.8], [18, 0.8], [19, 0.8],
    [20, 0.85], [21, 0.78], [22, 0.92],
  ] as const) {
    roughness = TSL.select(partIs(id), TSL.float(value), roughness);
  }
  material.roughnessNode = roughness;
  if (useVehicleEffects) {
    const grime = TSL.float(1).sub(TSL.smoothstep(0.16, 0.5, vehicleY));
    material.roughnessNode = TSL.select(
      partIs(1),
      TSL.mix(TSL.float(0.26), TSL.float(0.65), grime.mul(0.7)),
      TSL.select(
        partIs(0),
        TSL.mix(TSL.float(0.45), TSL.float(0.65), grime.mul(0.7)),
        roughness,
      ),
    );
    material.aoNode = TSL.select(
      either(partIs(2), partIs(5)),
      TSL.mix(vehicleAO, TSL.float(1), 0.65),
      vehicleAO,
    );
    if (physical) {
      const bodyCoat = TSL.select(
        partIs(1),
        TSL.float(1).sub(grime.mul(0.6)),
        TSL.select(
          partIs(0),
          TSL.float(0.7).mul(TSL.float(1).sub(grime.mul(0.6))),
          TSL.select(
            partIs(15),
            TSL.float(0.8),
            TSL.select(
              either(partIs(7), partIs(8)),
              TSL.float(0.9),
              TSL.float(0),
            ),
          ),
        ),
      );
      material.clearcoatNode = bodyCoat;
      material.clearcoatRoughnessNode = TSL.float(0.06);
    }
  }
  material.metalnessNode = TSL.select(
    partIs(2),
    TSL.float(1),
    TSL.select(partIs(7), TSL.float(0.6), TSL.float(0)),
  );

  const stateLampOn = state.greaterThanEqual(-0.5);
  const viewDistance = TSL.positionView.length().max(1);
  const headlightDistance = TSL.float(12).div(viewDistance).clamp(0.1, 1);
  const nightLamp = TSL.select(
    state.greaterThan(0.5),
    TSL.vec3(1, 0.56, 0.2),
    TSL.vec3(1, 0.85, 0.66),
  );
  const nightEmission = TSL.select(
    partIs(4),
    nightLamp.mul(3.2).mul(night),
    TSL.select(
      partIs(7),
      TSL.vec3(1, 0.95, 0.88)
        .mul(3.5)
        .mul(headlightDistance)
        .mul(night)
        .mul(stateLampOn),
      TSL.select(
        partIs(8),
        baseColor
          .mul(2.2)
          .mul(headlightDistance.max(0.35))
          .mul(night)
          .mul(stateLampOn),
        TSL.vec3(0),
      ),
    ),
  );
  let emissive = TSL.vec3(0);
  emissive = TSL.select(partIs(4), baseColor.mul(0.4), emissive);
  emissive = TSL.select(
    partIs(8),
    baseColor.mul(TSL.float(0.3).add(state.max(0).mul(7))),
    emissive,
  );
  emissive = TSL.select(
    signalPart,
    signalColor.mul(signalOn).mul(30),
    emissive,
  );
  emissive = TSL.select(partIs(13), pedColor.mul(10), emissive);
  emissive = TSL.select(partIs(14), baseColor.mul(3), emissive);
  emissive = TSL.select(partIs(15), baseColor.mul(0.25), emissive);
  const emissiveScreenPart = either(partIs(14), partIs(15));
  emissive = emissive.mul(
    TSL.select(emissiveScreenPart, TSL.float(1).add(night.mul(1.5)), TSL.float(1)),
  );
  material.emissiveNode = emissive.add(nightEmission);
  material.userData.partMaterialNodes = true;

  return material;
}
