// @ts-nocheck
import * as TSL from "three/tsl";
import * as WEBGPU from "three/webgpu";
import { DoubleSide } from "three";
import { nightK } from "../render/daynight.ts";

const nightUniform = () =>
  TSL.uniform(nightK.value).onRenderUpdate((_, self) => {
    self.value = nightK.value;
  });

function pseudoNoise(position) {
  return TSL.fract(
    TSL.sin(TSL.dot(position, TSL.vec2(12.9898, 78.233))).mul(43758.5453),
  );
}

export function createBridgeStoneNodeMaterial(textures) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0xa39a8a,
    roughness: 0.88,
  });
  material.name = "BridgeStone.TSL";
  const position = TSL.positionWorld;
  const normal = TSL.normalize(TSL.normalWorld);
  const absNormal = TSL.abs(normal);
  const q = TSL.select(
    absNormal.x.greaterThan(absNormal.z),
    position.zy,
    position.xy,
  );
  const projected = TSL.select(absNormal.y.greaterThan(0.7), position.xz, q);
  const noiseA = TSL.texture(textures.noise, projected.div(17)).rgb;
  const noiseB = TSL.texture(textures.noise, projected.div(3.1)).rgb;
  const course = projected.y.div(0.9);
  const row = TSL.floor(course);
  const column = projected.x.div(1.8).add(TSL.mod(row, 2).mul(0.5));
  const cell = TSL.vec2(TSL.fract(column), TSL.fract(course));
  const footprint = TSL.vec2(column.fwidth(), course.fwidth()).mul(1.5).add(1e-4);
  const verticalJoint = TSL.float(1).sub(
    TSL.smoothstep(0, TSL.float(0.03).add(footprint.x), TSL.min(cell.x, TSL.float(1).sub(cell.x))),
  );
  const horizontalJoint = TSL.float(1).sub(
    TSL.smoothstep(0, TSL.float(0.04).add(footprint.y), TSL.min(cell.y, TSL.float(1).sub(cell.y))),
  );
  const joint = TSL.max(verticalJoint, horizontalJoint).mul(
    TSL.float(1).sub(TSL.smoothstep(0.2, 0.6, TSL.max(footprint.x, footprint.y))),
  );
  const block = pseudoNoise(TSL.floor(TSL.vec2(column, course)));
  let color = TSL.color(0xa39a8a)
    .mul(TSL.float(0.86).add(block.mul(0.16)))
    .mul(TSL.float(0.8).add(noiseA.r.mul(0.3)))
    .mul(TSL.float(0.93).add(noiseB.g.mul(0.1)))
    .mul(TSL.float(1).sub(joint.mul(0.35)))
    .mul(TSL.mix(0.72, 1, TSL.smoothstep(-1, 6, position.y)))
    .mul(
      TSL.float(1).sub(
        TSL.smoothstep(0.55, 0.85, noiseA.b).mul(
          TSL.float(0.18).mul(TSL.float(0.5).add(absNormal.x.mul(0.5)).add(absNormal.z.mul(0.5))),
        ),
      ),
    );
  material.colorNode = color;
  return material;
}

export function createBridgeSteelNodeMaterial() {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0.35,
  });
  material.name = "BridgeSteel.TSL";
  material.vertexColors = true;
  const glow = TSL.varying(TSL.attribute("aEx", "vec3").x, "vBridgeGlowNode");
  const night = nightUniform();
  material.emissiveNode = TSL.vec3(1, 0.82, 0.55).mul(glow).mul(
    TSL.float(0.15).add(night.mul(7)),
  );
  return material;
}

export function createBridgeCableNodeMaterial() {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0x3b4043,
    roughness: 0.6,
    metalness: 0.35,
  });
  material.name = "BridgeCable.TSL";
  const position = TSL.attribute("position", "vec3");
  const normal = TSL.attribute("normal", "vec3");
  const worldPosition = TSL.modelWorldMatrix.mul(TSL.vec4(position, 1)).xyz;
  const fat = TSL.cameraPosition
    .sub(worldPosition)
    .length()
    .mul(0.0011)
    .sub(0.15)
    .max(0);
  material.positionNode = position.add(normal.mul(fat));
  const cableWorld = TSL.varying(worldPosition, "vBridgeCableWorldNode");
  const neck = TSL.varying(TSL.attribute("aEx", "vec3").x, "vBridgeNeckNode");
  const cableFat = TSL.varying(fat, "vBridgeFatNode");
  const night = nightUniform();
  material.metalnessNode = TSL.float(0.35).mul(TSL.float(1).sub(night.mul(0.85)));
  material.colorNode = TSL.color(0x3b4043).mul(TSL.float(1).sub(night.mul(0.7)));
  const q = cableWorld.x.add(cableWorld.z).mul(0.18);
  const footprint = q.fwidth().add(1e-4);
  const stepSize = TSL.exp2(TSL.log2(TSL.max(TSL.float(1), footprint.mul(6))).ceil());
  const halfWidth = TSL.max(0.05, footprint.mul(0.75));
  const distance = TSL.fract(q).sub(0.5).abs();
  const bulbs = TSL.float(1).sub(
    TSL.smoothstep(halfWidth.sub(footprint.mul(0.5)), halfWidth.add(footprint.mul(0.5)), distance),
  ).mul(TSL.select(TSL.mod(TSL.floor(q), stepSize).lessThanEqual(0.5), 1, 0));
  material.emissiveNode = TSL.vec3(1, 0.9, 0.72)
    .mul(bulbs)
    .mul(TSL.select(neck.greaterThan(0.5), 1, 0))
    .mul(3.5)
    .mul(night)
    .div(TSL.float(1).add(cableFat.mul(6)));
  return material;
}

export function createBridgeLatticeNodeMaterial() {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0.35,
    side: DoubleSide,
  });
  material.name = "BridgeLattice.TSL";
  material.vertexColors = true;
  const coord = TSL.uv();
  const u = coord.x;
  const v = coord.y;
  const fw = TSL.fwidth(coord).add(1e-4);
  const web = v.lessThan(1.5);
  const webV = v;
  const webU = TSL.fract(u);
  const chord = TSL.step(webV, TSL.float(0.08).add(fw.y)).add(
    TSL.step(TSL.float(0.92).sub(fw.y), webV),
  );
  const post = TSL.step(TSL.min(webU, TSL.float(1).sub(webU)), TSL.float(0.05).add(fw.x));
  const diagonalA = u.fract().sub(webV).abs();
  const diagonalB = u.fract().sub(TSL.float(1).sub(webV)).abs();
  const diagonal = TSL.step(
    TSL.min(diagonalA, diagonalB),
    TSL.float(0.06).add(fw.x).add(fw.y),
  );
  const webVisible = chord.add(post).add(diagonal).greaterThanEqual(0.5)
    .or(TSL.max(fw.x, fw.y).greaterThanEqual(0.09));

  const railV = v.sub(2);
  const railU = u.mul(16);
  const railFw = TSL.fwidth(TSL.vec2(railU, railV)).add(1e-4);
  const rail = TSL.step(TSL.float(0.9).sub(railFw.y), railV)
    .add(TSL.step(railV, TSL.float(0.07).add(railFw.y)))
    .add(TSL.step(railV.sub(0.5).abs(), TSL.float(0.035).add(railFw.y)));
  const railPost = TSL.step(
    TSL.min(u.fract(), TSL.float(1).sub(u.fract())),
    TSL.float(0.04).add(railFw.x.div(16)),
  );
  const picket = TSL.step(u.mul(16).fract().sub(0.5).abs(), TSL.float(0.12).add(railFw.x));
  const railVisible = rail.add(railPost).add(picket).greaterThanEqual(0.5)
    .or(railFw.x.lessThan(0.6));
  material.maskNode = TSL.select(web, webVisible, railVisible);
  return material;
}

function band(line, center, width, footprint) {
  return TSL.float(1).sub(
    TSL.smoothstep(width.mul(0.5).sub(footprint), width.mul(0.5).add(footprint), line.sub(center).abs()),
  );
}

export function createBridgeDeckNodeMaterial(textures, laneWidth) {
  const material = new WEBGPU.MeshStandardNodeMaterial({
    color: 0x75726c,
    roughness: 0.9,
  });
  material.name = "BridgeDeck.TSL";
  const position = TSL.positionWorld;
  const normal = TSL.normalize(TSL.normalWorld);
  const uv = TSL.uv();
  const extra = TSL.varying(TSL.attribute("aEx", "vec3"), "vBridgeDeckExtraNode");
  const noise = TSL.texture(textures.noise, position.xz.div(23)).rgb;
  let color = TSL.texture(textures.asphaltCol, position.xz.div(6)).rgb.mul(1.1);
  const mode = TSL.floor(extra.z.add(0.5));
  const side = TSL.vec3(0.42, 0.42, 0.41).mul(TSL.float(0.85).add(noise.r.mul(0.25)));

  const lane = uv.y.abs();
  const along = uv.x;
  const inner = extra.x;
  const outer = extra.y;
  const footprint = uv.y.fwidth().add(1e-3);
  const fade = TSL.float(1).sub(TSL.smoothstep(0.08, 0.3, footprint));
  let markings = band(lane, outer.sub(0.45), TSL.float(0.15), footprint);
  markings = TSL.max(markings, TSL.select(inner.greaterThan(0.3), band(lane, inner.add(0.45), TSL.float(0.15), footprint), 0));
  const laneCount = TSL.floor(outer.sub(inner).sub(1).div(laneWidth).add(0.5));
  const dashIndex = TSL.floor(lane.sub(inner).sub(0.5).div(laneWidth).add(0.5));
  const dash = band(lane, inner.add(0.5).add(dashIndex.mul(laneWidth)), TSL.float(0.13), footprint)
    .mul(TSL.select(TSL.fract(along.div(12)).lessThanEqual(0.27), 1, 0));
  markings = TSL.max(
    markings,
    dash.mul(TSL.select(dashIndex.greaterThanEqual(1).and(dashIndex.lessThanEqual(laneCount.sub(1))), 1, 0)),
  );
  const centerLine = TSL.select(inner.lessThan(0.3), band(lane, TSL.float(0.2), TSL.float(0.12), footprint), 0);
  const tirePath = TSL.fract(lane.sub(inner).sub(0.5).div(laneWidth));
  const wear = TSL.float(1).sub(TSL.smoothstep(0.08, 0.16, tirePath.sub(0.27).abs()))
    .add(TSL.float(1).sub(TSL.smoothstep(0.08, 0.16, tirePath.sub(0.73).abs())));
  let road = color.mul(
    TSL.float(1).sub(
      wear
        .mul(0.13)
        .mul(TSL.select(lane.lessThanEqual(outer.sub(0.5)), 1, 0))
        .mul(TSL.select(lane.greaterThanEqual(inner.add(0.5)), 1, 0)),
    ),
  );
  const jointDistance = TSL.fract(along.div(30)).sub(0.5).abs().mul(30);
  const joint = TSL.float(1).sub(TSL.smoothstep(0.05, TSL.float(0.12).add(along.div(30).fwidth()), jointDistance)).mul(fade);
  road = TSL.mix(road, TSL.vec3(0.32, 0.31, 0.3), joint);
  road = TSL.mix(road, TSL.vec3(0.84, 0.83, 0.78).mul(TSL.float(0.8).add(noise.g.mul(0.25))), markings.mul(0.85).mul(fade));
  road = TSL.mix(road, TSL.vec3(0.78, 0.6, 0.17), centerLine.mul(0.85).mul(fade));

  const board = along.div(0.32);
  const boardFraction = TSL.fract(board);
  const boardId = TSL.floor(board);
  const boardNoise = TSL.fract(TSL.sin(boardId.mul(12.9898)).mul(43758.5453));
  const wood = TSL.mix(
    TSL.vec3(0.43, 0.33, 0.24).mul(TSL.float(0.72).add(boardNoise.mul(0.34))),
    TSL.vec3(0.4, 0.38, 0.35).mul(TSL.float(0.8).add(boardNoise.mul(0.2))),
    TSL.float(0.35).add(noise.g.mul(0.4)),
  );
  const grain = TSL.texture(
    textures.noise,
    TSL.vec2(position.x.mul(0.9), uv.y.mul(11).add(boardId.mul(3.1))),
  ).r;
  let timber = wood.mul(TSL.float(0.82).add(grain.mul(0.3)));
  timber = timber.mul(TSL.float(1).sub(TSL.smoothstep(0.52, 0.8, TSL.texture(textures.noise, position.xz.div(7)).b).mul(0.32)));
  timber = timber.mul(TSL.float(1).sub(TSL.smoothstep(1.2, 3.2, lane).mul(0.18)));
  timber = timber.mul(TSL.float(1).sub(
    TSL.float(1).sub(TSL.smoothstep(0, TSL.float(0.07).add(board.fwidth()), TSL.min(boardFraction, TSL.float(1).sub(boardFraction))))
      .mul(TSL.float(1).sub(TSL.smoothstep(0.2, 0.5, board.fwidth())))
      .mul(0.55),
  ));

  const ballast = TSL.vec3(0.36, 0.34, 0.31).mul(TSL.float(0.7).add(TSL.texture(textures.noise, position.xz.div(1.3)).r.mul(0.5)));
  const tiePosition = TSL.fract(along.div(0.62));
  const tie = tiePosition.sub(0.5).abs().lessThan(0.2)
    .and(lane.sub(2.3).abs().lessThan(1.35))
    .and(along.div(0.62).fwidth().lessThan(0.5));
  const track = TSL.select(tie, TSL.vec3(0.22, 0.18, 0.15), ballast);
  const concrete = TSL.vec3(0.56, 0.55, 0.52).mul(TSL.float(0.8).add(noise.r.mul(0.3)));

  let deck = color;
  deck = TSL.select(mode.equal(1), road, deck);
  deck = TSL.select(mode.equal(2), timber, deck);
  deck = TSL.select(mode.equal(3), track, deck);
  deck = TSL.select(mode.equal(4), concrete, deck);
  deck = TSL.select(normal.y.lessThan(0.5), side, deck);
  material.colorNode = TSL.color(0x75726c).mul(deck);
  return material;
}
