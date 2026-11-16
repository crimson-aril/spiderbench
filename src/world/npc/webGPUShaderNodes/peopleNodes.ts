// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";
import {
  InterpolationSamplingMode,
  InterpolationSamplingType,
  Vector3,
} from "three";

const THREE_FLAT = InterpolationSamplingType.FLAT;
const THREE_EITHER = InterpolationSamplingMode.EITHER;

const vec3From = (value) => TSL.vec3(value[0], value[1], value[2]);

function unpackColor(value) {
  const red = TSL.floor(value.div(65536));
  const green = TSL.floor(value.sub(red.mul(65536)).div(256));
  const blue = value.sub(red.mul(65536)).sub(green.mul(256));
  const srgb = TSL.vec3(red, green, blue).div(255);
  return srgb.mul(srgb);
}

function hairTone(value) {
  const dark = TSL.mix(
    TSL.vec3(0.015, 0.011, 0.008),
    TSL.vec3(0.12, 0.065, 0.03),
    value.div(0.7).clamp(0, 1),
  );
  const light = TSL.mix(
    TSL.vec3(0.12, 0.065, 0.03),
    TSL.vec3(0.45, 0.32, 0.16),
    value.sub(0.7).div(0.23).clamp(0, 1),
  );
  return TSL.select(
    value.lessThan(0.7),
    dark,
    TSL.select(value.lessThan(0.93), light, TSL.vec3(0.45, 0.44, 0.42)),
  );
}

function bodyShape(position, ids, weights, bodyCode) {
  const d = TSL.floor(bodyCode).mul(0.01).sub(0.2);
  let torsoWeight = TSL.float(0);
  let neckWeight = TSL.float(0);
  let armWeight = TSL.float(0);
  let legWeight = TSL.float(0);
  let footWeight = TSL.float(0);
  for (const [boneId, weight] of [
    [ids.x, weights.x],
    [ids.y, weights.y],
    [ids.z, weights.z],
    [ids.w, weights.w],
  ]) {
    const bone = TSL.floor(boneId.add(0.5));
    torsoWeight = torsoWeight.add(TSL.select(bone.lessThanEqual(2), weight, 0));
    neckWeight = neckWeight.add(TSL.select(bone.equal(3), weight, 0));
    armWeight = armWeight.add(
      TSL.select(bone.greaterThanEqual(5).and(bone.lessThanEqual(10)), weight, 0),
    );
    legWeight = legWeight.add(
      TSL.select(
        bone.equal(11).or(bone.equal(12)).or(bone.equal(14)).or(bone.equal(15)),
        weight,
        0,
      ),
    );
    footWeight = footWeight.add(
      TSL.select(bone.equal(13).or(bone.equal(16)), weight, 0),
    );
  }

  const side = TSL.select(position.x.lessThan(0), -1, 1);
  const belly = TSL.exp(TSL.pow(position.y.sub(1.04).div(0.13), 2).negate()).mul(
    TSL.step(0, d),
  );
  const torsoDepth = TSL.select(
    position.z.add(0.005).greaterThan(0),
    TSL.float(1).add(belly.mul(1.4)),
    TSL.float(0.6),
  );
  const torso = TSL.vec3(
    position.x.mul(TSL.float(1).add(d)),
    position.y,
    position.z.add(0.005).mul(TSL.float(1).add(d.mul(torsoDepth))).sub(0.005),
  );
  const neck = TSL.vec3(
    position.x.mul(TSL.float(1).add(d.mul(0.6))),
    position.y,
    position.z.mul(TSL.float(1).add(d.mul(0.6))),
  );
  const arms = TSL.vec3(
    side.mul(TSL.float(0.2).add(d.mul(0.16))).add(
      position.x.sub(side.mul(0.2)).mul(TSL.float(1).add(d.mul(0.45))),
    ),
    position.y,
    position.z.mul(TSL.float(1).add(d.mul(0.45))),
  );
  const legShape = TSL.smoothstep(0.12, 0.65, position.y);
  const legs = TSL.vec3(
    side.mul(TSL.float(0.097).add(d.mul(0.075))).add(
      position.x
        .sub(side.mul(0.097))
        .mul(TSL.float(1).add(d.mul(0.85).mul(legShape))),
    ),
    position.y,
    position.z.mul(TSL.float(1).add(d.mul(0.85).mul(legShape))),
  );
  const feet = TSL.vec3(position.x.add(side.mul(d).mul(0.075)), position.y, position.z);
  const shaped = torso
    .mul(torsoWeight)
    .add(neck.mul(neckWeight))
    .add(arms.mul(armWeight))
    .add(legs.mul(legWeight))
    .add(feet.mul(footWeight))
    .add(
      position.mul(
        TSL.float(1)
          .sub(torsoWeight)
          .sub(neckWeight)
          .sub(armWeight)
          .sub(legWeight)
          .sub(footWeight)
          .max(0),
      ),
    );
  return TSL.select(d.abs().lessThan(0.004), position, shaped);
}

function lookRotation(pivot, yaw, pitch) {
  const cy = TSL.cos(yaw);
  const sy = TSL.sin(yaw);
  const cp = TSL.cos(pitch);
  const sp = TSL.sin(pitch);
  const one = TSL.float(1);
  const zero = TSL.float(0);
  const rotateY = TSL.mat4(
    TSL.vec4(cy, 0, sy, 0),
    TSL.vec4(0, 1, 0, 0),
    TSL.vec4(sy.negate(), 0, cy, 0),
    TSL.vec4(0, 0, 0, 1),
  );
  const rotateX = TSL.mat4(
    TSL.vec4(1, 0, 0, 0),
    TSL.vec4(0, cp, sp.negate(), 0),
    TSL.vec4(0, sp, cp, 0),
    TSL.vec4(0, 0, 0, 1),
  );
  const translate = TSL.mat4(
    TSL.vec4(one, zero, zero, zero),
    TSL.vec4(zero, one, zero, zero),
    TSL.vec4(zero, zero, one, zero),
    TSL.vec4(pivot, one),
  );
  const translateBack = TSL.mat4(
    TSL.vec4(one, zero, zero, zero),
    TSL.vec4(zero, one, zero, zero),
    TSL.vec4(zero, zero, one, zero),
    TSL.vec4(pivot.negate(), one),
  );
  return translate.mul(rotateY).mul(rotateX).mul(translateBack);
}

function createPeopleSkinning(animTexture, meta, uniforms) {
  const time = TSL.uniform(0).onRenderUpdate((_, self) => {
    self.value = uniforms.uTime.value;
  });
  const headPivot = vec3From(meta.bones[4].head);
  const neckPivot = vec3From(meta.bones[3].head);
  const packedBones = TSL.attribute("aBone", "vec4");
  const ids = TSL.floor(packedBones.div(256));
  const weights = TSL.mod(packedBones, 256).div(255);
  const instanceA = TSL.attribute("iA", "vec4");
  const instanceB = TSL.attribute("iB", "vec4");
  const instanceState = TSL.attribute("iX", "vec4");
  const instanceMeta = TSL.attribute("iM", "vec4");
  const anim = TSL.textureLoad(animTexture);

  const sampleBone = (bone, row) => {
    const x = TSL.int(bone).mul(3);
    const texel0 = TSL.textureLoad(anim, TSL.ivec2(x, TSL.int(row)));
    const texel1 = TSL.textureLoad(anim, TSL.ivec2(x.add(1), TSL.int(row)));
    const texel2 = TSL.textureLoad(anim, TSL.ivec2(x.add(2), TSL.int(row)));
    // Match crowd.glsl's column-major mat4 constructor. Each texture texel
    // stores one row of the affine transform, so transpose those components
    // into matrix columns before applying the skinned vertex position.
    return TSL.mat4(
      TSL.vec4(texel0.x, texel1.x, texel2.x, 0),
      TSL.vec4(texel0.y, texel1.y, texel2.y, 0),
      TSL.vec4(texel0.z, texel1.z, texel2.z, 0),
      TSL.vec4(texel0.w, texel1.w, texel2.w, 1),
    );
  };
  const clipBone = (clip, bone) => {
    const length = clip.y.max(1);
    let frame = TSL.mod(time.sub(clip.w).mul(clip.z).mul(30), length);
    frame = TSL.select(frame.lessThan(0), frame.add(length), frame);
    const frame0 = TSL.int(TSL.floor(frame));
    const frame1 = TSL.select(
      frame0.add(1).greaterThanEqual(length),
      TSL.int(0),
      frame0.add(1),
    );
    const row = TSL.int(TSL.floor(clip.x.add(0.5)));
    const alpha = TSL.fract(frame);
    const first = sampleBone(bone, row.add(frame0));
    const second = sampleBone(bone, row.add(frame1));
    return first.mul(TSL.float(1).sub(alpha)).add(second.mul(alpha));
  };
  const boneMatrix = (bone) => {
    let matrix = clipBone(instanceA, bone);
    const blend = time.sub(instanceState.x).div(0.3).clamp(0, 1);
    const clipB = clipBone(instanceB, bone);
    matrix = matrix.mul(blend).add(clipB.mul(TSL.float(1).sub(blend)));
    const isHead = bone.equal(4);
    const isNeck = bone.equal(3);
    const pivot = TSL.select(isHead, headPivot, TSL.select(isNeck, neckPivot, TSL.vec3(0)));
    const yaw = TSL.select(
      isHead,
      instanceState.y.mul(0.6),
      TSL.select(isNeck, instanceState.y.mul(0.4), 0),
    );
    const pitch = TSL.select(
      isHead,
      instanceState.z.mul(0.7),
      TSL.select(isNeck, instanceState.z.mul(0.3), 0),
    );
    return matrix.mul(lookRotation(pivot, yaw, pitch));
  };

  const restPosition = TSL.attribute("position", "vec3");
  const shapedPosition = bodyShape(restPosition, ids, weights, instanceMeta.z);
  const skinMatrix = boneMatrix(TSL.floor(ids.x.add(0.5)))
    .mul(weights.x)
    .add(boneMatrix(TSL.floor(ids.y.add(0.5))).mul(weights.y))
    .add(boneMatrix(TSL.floor(ids.z.add(0.5))).mul(weights.z))
    .add(boneMatrix(TSL.floor(ids.w.add(0.5))).mul(weights.w));
  const optionBit = TSL.floor(instanceState.w.div(512));
  const isOptional = TSL.attribute("aRA", "vec3").z.greaterThan(0.5);
  const hidden = isOptional.and(
    TSL.mod(TSL.floor(optionBit.div(TSL.attribute("aRA", "vec3").z)), 2).lessThan(0.5),
  );
  const position = TSL.select(
    hidden,
    TSL.vec3(0),
    skinMatrix.mul(TSL.vec4(shapedPosition, 1)).xyz,
  );
  const normal = TSL.normalize(TSL.mat3(skinMatrix).mul(TSL.normalGeometry));
  return { position, normal, restPosition, instanceState, instanceMeta, time };
}

/** TSL equivalent of the legacy crowd skinning/material hooks. */
export function createPeopleNodeMaterial(animTexture, meta, uniforms, faceSkin, pedTexture = null) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    roughness: 0.8,
    metalness: 0,
  });
  material.name = "CityPeople.TSL";
  const skinning = createPeopleSkinning(animTexture, meta, uniforms);
  const instanceTransform = TSL.attribute("iTransform", "vec4");
  const instanceYaw = TSL.attribute("iYaw", "float");
  const yawCos = TSL.cos(instanceYaw);
  const yawSin = TSL.sin(instanceYaw);
  const scaledPosition = skinning.position.mul(instanceTransform.w);
  material.positionNode = TSL.vec3(
    yawCos.mul(scaledPosition.x).add(yawSin.mul(scaledPosition.z)).add(instanceTransform.x),
    scaledPosition.y.add(instanceTransform.y),
    yawSin.negate().mul(scaledPosition.x).add(yawCos.mul(scaledPosition.z)).add(instanceTransform.z),
  );
  material.normalNode = TSL.normalize(TSL.vec3(
    yawCos.mul(skinning.normal.x).add(yawSin.mul(skinning.normal.z)),
    skinning.normal.y,
    yawSin.negate().mul(skinning.normal.x).add(yawCos.mul(skinning.normal.z)),
  ));

  const flat = (name, type) =>
    TSL.varying(TSL.attribute(name, type)).setInterpolation(
      THREE_FLAT,
      THREE_EITHER,
    );
  const ra = TSL.varying(TSL.attribute("aRA", "vec3"));
  const instanceColors = flat("iC", "vec4");
  const instanceMeta = flat("iM", "vec4");
  const region = ra.x;
  const restPosition = TSL.varying(TSL.attribute("position", "vec3"));
  const faceIndex = TSL.floor(instanceMeta.x.clamp(0, 31.99));
  const faceBrightness = TSL.mix(0.7, 1.08, TSL.fract(instanceMeta.x));
  const faces = TSL.uniformArray(faceSkin.map((c) => new Vector3(...c)), "vec3");
  const skinColor = faces.element(faceIndex).mul(faceBrightness);
  const hairColor = hairTone(TSL.fract(instanceMeta.y));

  let color = TSL.vec3(0.5);
  color = TSL.select(region.lessThan(0.5), skinColor, color);
  color = TSL.select(region.greaterThan(0.5).and(region.lessThan(1.5)), unpackColor(instanceColors.x), color);
  color = TSL.select(region.greaterThan(1.5).and(region.lessThan(2.5)), unpackColor(instanceColors.y), color);
  const shoeTone = TSL.fract(instanceMeta.z);
  let shoeColor = TSL.mix(TSL.vec3(0.012), TSL.vec3(0.2, 0.12, 0.07), shoeTone);
  shoeColor = TSL.select(shoeTone.greaterThan(0.85), TSL.vec3(0.7), shoeColor);
  color = TSL.select(region.greaterThan(2.5).and(region.lessThan(3.5)), shoeColor, color);
  color = TSL.select(region.greaterThan(3.5).and(region.lessThan(4.5)), hairColor, color);
  color = TSL.select(region.greaterThan(4.5).and(region.lessThan(5.5)), unpackColor(instanceColors.z), color);
  color = TSL.select(region.greaterThan(5.5).and(region.lessThan(6.5)), unpackColor(instanceColors.w), color);
  color = TSL.select(region.greaterThan(6.5).and(region.lessThan(7.5)), TSL.vec3(0.012), color);
  color = TSL.select(region.greaterThan(7.5).and(region.lessThan(8.5)), TSL.vec3(0.72), color);
  color = TSL.select(region.greaterThan(8.5).and(region.lessThan(9.5)), TSL.vec3(0.05, 0.08, 0.12), color);
  color = TSL.select(region.greaterThan(10.5).and(region.lessThan(11.5)), skinColor.mul(TSL.vec3(0.8, 0.56, 0.54)), color);
  color = TSL.select(region.greaterThan(11.5).and(region.lessThan(12.5)), TSL.vec3(0.62, 0.6, 0.57), color);
  color = TSL.select(region.greaterThan(12.5), hairColor, color);

  if (pedTexture) {
    const faceUv = TSL.vec2(
      TSL.float(0.5).add(restPosition.x.div(0.144)),
      TSL.float(1.684).sub(restPosition.y).div(0.125),
    );
    const faceCell = TSL.vec2(TSL.mod(faceIndex, 4), TSL.floor(faceIndex.div(4)));
    const faceSample = TSL.texture(
      pedTexture,
      faceCell.add(faceUv.clamp(TSL.vec2(0.03, 0.04), TSL.vec2(0.97, 0.985))).mul(0.125),
    ).rgb.mul(faceBrightness);
    const faceMask = TSL.smoothstep(0.012, 0.05, restPosition.z).mul(
      TSL.float(1).sub(
        TSL.smoothstep(
          0.042,
          0.064,
          restPosition.x.abs().add(restPosition.y.sub(1.684).abs().mul(0.05)),
        ),
      ),
    ).mul(
      TSL.float(1).sub(TSL.smoothstep(0.8, 0.98, faceUv.y)),
    );
    color = TSL.select(
      region.lessThan(0.5),
      TSL.mix(skinColor, faceSample, faceMask),
      color,
    );

    const absNormal = TSL.abs(TSL.normalGeometry);
    const projected = TSL.select(
      absNormal.x.greaterThan(absNormal.y).and(absNormal.x.greaterThan(absNormal.z)),
      restPosition.zy,
      TSL.select(absNormal.y.greaterThan(absNormal.z), restPosition.xz, restPosition.xy),
    );
    const pants = region.greaterThan(1.5).and(region.lessThan(2.5));
    const outer = region.greaterThan(4.5).and(region.lessThan(5.5));
    const accessory = region.greaterThan(5.5).and(region.lessThan(6.5));
    const tile = TSL.select(
      pants,
      TSL.select(unpackColor(instanceColors.y).b.greaterThan(unpackColor(instanceColors.y).r.mul(1.25)), 0, 2),
      TSL.select(outer, 2, TSL.select(accessory, 5, 3)),
    );
    const tileOrigin = TSL.vec2(
      TSL.float(0.5).add(TSL.mod(tile, 4).mul(0.125)),
      TSL.float(0.5).add(TSL.floor(tile.div(4)).mul(0.125)),
    );
    const fabric = TSL.texture(
      pedTexture,
      tileOrigin.add(TSL.fract(projected.div(0.09)).mul(0.125)),
    ).rgb.div(0.2158);
    const cloth =
      region.greaterThan(0.5).and(region.lessThan(1.5))
        .or(pants)
        .or(outer)
        .or(accessory);
    color = TSL.select(cloth, color.mul(TSL.mix(TSL.vec3(1), fabric, 0.14)), color);
  }

  const ao = TSL.float(0.35).add(ra.y.div(255).mul(0.65));
  material.colorNode = color.mul(ao);
  let roughness = TSL.float(0.8);
  roughness = TSL.select(region.lessThan(0.5), 0.64, roughness);
  roughness = TSL.select(region.greaterThan(2.5).and(region.lessThan(3.5)), 0.5, roughness);
  roughness = TSL.select(region.greaterThan(3.5).and(region.lessThan(4.5)), 0.46, roughness);
  roughness = TSL.select(region.greaterThan(5.5).and(region.lessThan(6.5)), 0.5, roughness);
  roughness = TSL.select(region.greaterThan(8.5).and(region.lessThan(9.5)), 0.15, roughness);
  roughness = TSL.select(region.greaterThan(10.5).and(region.lessThan(11.5)), 0.45, roughness);
  roughness = TSL.select(region.greaterThan(11.5).and(region.lessThan(12.5)), 0.2, roughness);
  material.roughnessNode = roughness;

  const flash = TSL.select(
    instanceMeta.w.greaterThan(0),
    TSL.fract(skinning.time.mul(0.37).add(instanceMeta.w)).lessThan(0.035),
    false,
  );
  const phoneEmission = TSL.select(flash, 60.6, 0.6);
  material.emissiveNode = TSL.select(
    region.greaterThan(8.5).and(region.lessThan(9.5)),
    TSL.vec3(0.55, 0.75, 1).mul(phoneEmission).mul(0.25),
    TSL.vec3(0),
  );
  material.userData.nodeUniforms = { time: skinning.time };
  return material;
}

export function createDogNodeMaterial(definition) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    roughness: 0.85,
    metalness: 0,
  });
  material.name = "CityDogs.TSL";
  const parts = definition.parts;
  const pivots = definition.pivots;
  const partId = TSL.attribute("aSI", "vec4").x.add(0.5).floor();
  const instance = TSL.attribute("iD", "vec4");
  const original = TSL.attribute("position", "vec3");
  const phase = instance.x;
  const amplitude = instance.y;
  const partIs = (part) => partId.equal(part);
  const legParts = [parts.legFL, parts.legFR, parts.legBL, parts.legBR];
  const legPivots = [pivots.legFL, pivots.legFR, pivots.legBL, pivots.legBR];
  let leg = TSL.vec3(0);
  let legNormal = TSL.vec3(0);
  for (let i = 0; i < legParts.length; i++) {
    const isPart = partIs(legParts[i]);
    const pivot = vec3From(legPivots[i]);
    const phaseOffset = i === 0 || i === 3 ? 0 : Math.PI;
    const angle = TSL.sin(phase.add(phaseOffset)).mul(0.5).mul(amplitude);
    const cosine = TSL.cos(angle);
    const sine = TSL.sin(angle);
    const q = original.sub(pivot);
    const posed = pivot.add(
      TSL.vec3(
        q.x,
        cosine.mul(q.y).sub(sine.mul(q.z)).add(
          TSL.cos(phase.add(phaseOffset)).max(0).mul(0.03).mul(amplitude),
        ),
        sine.mul(q.y).add(cosine.mul(q.z)),
      ),
    );
    const n = TSL.normalGeometry;
    const posedNormal = TSL.vec3(
      n.x,
      cosine.mul(n.y).sub(sine.mul(n.z)),
      sine.mul(n.y).add(cosine.mul(n.z)),
    );
    leg = TSL.select(isPart, posed, leg);
    legNormal = TSL.select(isPart, posedNormal, legNormal);
  }

  const bobbed = original.add(TSL.vec3(0, TSL.sin(phase.mul(2)).mul(0.012).mul(amplitude), 0));
  const tailPivot = vec3From(pivots.tail);
  const tailAngle = TSL.sin(instance.w.mul(9)).mul(0.45);
  const tailQ = original.sub(tailPivot);
  const tail = tailPivot.add(TSL.vec3(
    TSL.cos(tailAngle).mul(tailQ.x).add(TSL.sin(tailAngle).mul(tailQ.z)),
    tailQ.y,
    TSL.sin(tailAngle).negate().mul(tailQ.x).add(TSL.cos(tailAngle).mul(tailQ.z)),
  ));
  const headPivot = vec3From(pivots.head);
  const headAngle = TSL.sin(instance.w.mul(0.7)).mul(0.25).mul(TSL.float(1).sub(amplitude));
  const headQ = bobbed.sub(headPivot);
  const head = headPivot.add(TSL.vec3(
    TSL.cos(headAngle).mul(headQ.x).add(TSL.sin(headAngle).mul(headQ.z)),
    headQ.y,
    TSL.sin(headAngle).negate().mul(headQ.x).add(TSL.cos(headAngle).mul(headQ.z)),
  ));
  const isTail = partIs(parts.tail);
  const isHead = partIs(parts.head);
  const isLeg = legParts.map((part) => partIs(part)).reduce((a, b) => a.or(b));
  material.positionNode = TSL.select(isLeg, leg, TSL.select(isTail, tail, TSL.select(isHead, head, bobbed)));

  const normal = TSL.normalGeometry;
  const tailNormal = TSL.vec3(
    TSL.cos(tailAngle).mul(normal.x).add(TSL.sin(tailAngle).mul(normal.z)),
    normal.y,
    TSL.sin(tailAngle).negate().mul(normal.x).add(TSL.cos(tailAngle).mul(normal.z)),
  );
  const headNormal = TSL.vec3(
    TSL.cos(headAngle).mul(normal.x).add(TSL.sin(headAngle).mul(normal.z)),
    normal.y,
    TSL.sin(headAngle).negate().mul(normal.x).add(TSL.cos(headAngle).mul(normal.z)),
  );
  material.normalNode = TSL.normalize(TSL.select(
    isLeg,
    legNormal,
    TSL.select(isTail.or(isHead), TSL.select(isTail, tailNormal, headNormal), normal),
  ));

  const region = TSL.varying(TSL.attribute("aRA", "vec2").x).setInterpolation(
    THREE_FLAT,
    THREE_EITHER,
  );
  const ao = TSL.varying(TSL.attribute("aRA", "vec2").y);
  const restPosition = TSL.varying(original);
  const fur = unpackColor(instance.z);
  let color = fur;
  color = TSL.select(region.greaterThan(6.5).and(region.lessThan(7.5)), TSL.vec3(0.012), color);
  color = TSL.select(region.greaterThan(5.5).and(region.lessThan(6.5)), TSL.vec3(0.3, 0.03, 0.03), color);
  color = TSL.select(region.greaterThan(7.5).and(region.lessThan(8.5)), TSL.mix(fur, TSL.vec3(0.6, 0.55, 0.48), 0.5), color);
  const p = TSL.fract(TSL.floor(restPosition.mul(140)).mul(0.3183099).add(0.1)).mul(17);
  const noise = TSL.fract(p.x.mul(p.y).mul(p.z).mul(p.x.add(p.y).add(p.z)));
  material.colorNode = color
    .mul(TSL.float(0.35).add(ao.div(255).mul(0.65)))
    .mul(TSL.float(0.9).add(noise.sub(0.5).mul(0.2)));
  return material;
}

