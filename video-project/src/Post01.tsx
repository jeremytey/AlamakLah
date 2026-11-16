import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import {
  AbsoluteFill,
  Easing,
  getStaticFiles,
  Html5Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Group, Material, Mesh, MeshStandardMaterial } from "three";
import { ArmPose, Character, SEAT_Y } from "./components/Character";
import { Caption, CounterCard, TimeLabel } from "./components/Overlays";
import { Scene } from "./components/Scene";
import {
  ANVIL_IMPACT,
  AUDIO_FILE,
  CAPTION_LEAD,
  CAPTIONS,
  COUNTER,
  POPUPS,
  SCENE_ORDER,
  SCENES,
  SceneId,
} from "./post01Timing";

// Post 01 "What if you never paid your friend back?" (WHAT IF). All content is FICTION.
// Every scene boundary and caption frame comes from ./post01Timing.ts.
// Scenes 1-3 reuse the Spike10s set, characters and motion (copied, Spike10s.tsx unchanged).

type V3 = [number, number, number];

const COL = {
  bg: "#fbe9d0",
  floor: "#f3e3c8",
  wall: "#bfe3d0",
  window: "#d8eefc",
  frame: "#ffffff",
  table: "#e9c79a",
  tableLeg: "#c9a27a",
  stool: "#d98f6a",
  skinYou: "#d9a679",
  skinFriend: "#eab98e",
  hair: "#2b2b38",
  pantsYou: "#4f5d78",
  pantsFriend: "#5a5168",
  shirtYou: "#7fa8e6", // blue = you
  shirtFriend: "#f5a35f", // orange = friend
  phone: "#2c2f3a",
  screen: "#9fd3ff",
  note: "#f4b183",
};

// New props/sets for scenes 4-7, same flat pastel palette.
const COL2 = {
  hallWall: "#f7dbe3",
  stage: "#fff4ea",
  stageTrim: "#f2a7c3",
  gold: "#f2cf7e",
  panel: "#fff3f6",
  flower: "#f29bb5",
  cloth: "#fffaf3",
  mic: "#2c2f3a",
  micHead: "#a9afbd",
  paper: "#fffdf7",
  ink: "#c3c5cf",
  red: "#e0393e",
  anvil: "#5d6272",
  halo: "#ffe066",
  ghostGlow: "#d6ecff", // light blue-white
  guests: [
    { shirt: "#8fd1a6", skin: "#c98f62", pants: "#5d6b5a" },
    { shirt: "#b9a3e3", skin: "#e2b088", pants: "#4f4a63" },
    { shirt: "#f2a7c3", skin: "#d7a17a", pants: "#5a5168" },
  ],
  bride: { shirt: "#fbf8f5", skin: "#e8b48c", pants: "#fbf8f5" }, // white dress
  groom: { shirt: "#2f3446", skin: "#d09a70", pants: "#2f3446" }, // dark suit
};

const YOU = { shirt: COL.shirtYou, skin: COL.skinYou, hair: COL.hair, pants: COL.pantsYou };
const FRIEND = { shirt: COL.shirtFriend, skin: COL.skinFriend, hair: COL.hair, pants: COL.pantsFriend };

const ease = Easing.inOut(Easing.cubic);
const r = (f: number, a: number, b: number, v0: number, v1: number) =>
  interpolate(f, [a, b], [v0, v1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const lerp3 = (t: number, a: V3, b: V3): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const along = (base: V3, dir: V3, d: number, dy = 0): V3 => [base[0] + dir[0] * d, base[1] + dy, base[2] + dir[2] * d];
// Decaying side-to-side shake: 0 outside [start, start + dur).
const shake = (f: number, start: number, dur: number, amp: number) => {
  const d = f - start;
  if (d < 0 || d >= dur) return 0;
  return Math.sin(d * 2.4) * amp * (1 - d / dur);
};
// Head yaw (relative to body) that makes a character at `pos`/`rotY` look at `target`.
const lookYaw = (pos: V3, rotY: number, target: V3, limit = 1.2) => {
  let a = Math.atan2(target[0] - pos[0], target[2] - pos[2]) - rotY;
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return Math.max(-limit, Math.min(limit, a));
};

// Sets the camera during render, so it is applied before ThreeCanvas advances this frame.
const Cam: React.FC<{ pos: V3; look: V3 }> = ({ pos, look }) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(...pos);
  camera.lookAt(...look);
  return null;
};

/* ------------------------------------------------------------------ shared props */

const Room: React.FC<{ wallShadow?: boolean }> = ({ wallShadow = true }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color={COL.floor} roughness={1} />
    </mesh>
    <mesh position={[0, 3, -3.2]} receiveShadow={wallShadow}>
      <boxGeometry args={[14, 6, 0.2]} />
      <meshStandardMaterial color={COL.wall} roughness={1} />
    </mesh>
    <mesh position={[1.6, 2.6, -3.08]}>
      <boxGeometry args={[1.9, 1.3, 0.06]} />
      <meshStandardMaterial color={COL.frame} roughness={1} />
    </mesh>
    <mesh position={[1.6, 2.6, -3.04]}>
      <boxGeometry args={[1.7, 1.1, 0.06]} />
      <meshStandardMaterial color={COL.window} roughness={1} />
    </mesh>
  </group>
);

const Block: React.FC<{ args: V3; position: V3; color: string; rotation?: V3; rough?: number }> = ({
  args,
  position,
  color,
  rotation,
  rough = 0.9,
}) => (
  <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={rough} />
  </mesh>
);

const Stool: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    <Block args={[0.46, 0.08, 0.46]} position={[0, 0.46, 0]} color={COL.stool} />
    <Block args={[0.12, 0.42, 0.12]} position={[0, 0.21, 0]} color={COL.tableLeg} />
  </group>
);

/* ------------------------------------------------------------------ scenes 1-3 (from Spike10s) */

const S2 = SCENES.s2.start;
const S3 = SCENES.s3.start;
const S3_END = SCENES.s3.end;

const SET_ROT = (15 * Math.PI) / 180;
const SEAT_X = 0.6;
const TABLE_TOP = 0.8;
const toWorld = (x: number, y: number, z: number): V3 => [
  x * Math.cos(SET_ROT) + z * Math.sin(SET_ROT),
  y,
  -x * Math.sin(SET_ROT) + z * Math.cos(SET_ROT),
];
const FRIEND_HEAD = toWorld(SEAT_X, 1.55, 0);
const CHEAT = (40 * Math.PI) / 180;
const ARM_YAW = 0.7;
const FRIEND_YAW = SET_ROT - Math.PI / 2 + CHEAT;
const FRIEND_FACING: V3 = [Math.sin(FRIEND_YAW), 0, Math.cos(FRIEND_YAW)];

const TableCam: React.FC<{ f: number }> = ({ f }) => {
  let pos: V3;
  let look: V3;
  if (f < S2) {
    const t = r(f, 0, S2 - 1, 0, 1);
    pos = lerp3(t, [0.05, 2.35, 5.3], [0.0, 2.15, 4.4]);
    look = lerp3(t, [-0.12, 1.0, 0], [-0.1, 1.05, 0]);
  } else if (f < S3) {
    const t = r(f, S2, S3 - 1, 0, 1);
    pos = lerp3(t, [-1.75, 2.0, 2.6], [-1.3, 1.9, 1.95]);
    look = lerp3(t, toWorld(SEAT_X, 1.2, 0), toWorld(SEAT_X, 1.4, 0));
  } else {
    const t = r(f, S3, S3_END - 1, 0, 1);
    pos = lerp3(t, along(FRIEND_HEAD, FRIEND_FACING, 2.3, 0.2), along(FRIEND_HEAD, FRIEND_FACING, 1.7, 0.16));
    look = [FRIEND_HEAD[0], FRIEND_HEAD[1] + 0.14, FRIEND_HEAD[2]];
  }
  return <Cam pos={pos} look={look} />;
};

const Table: React.FC = () => (
  <group>
    <Block args={[0.95, 0.08, 0.95]} position={[0, TABLE_TOP - 0.04, 0]} color={COL.table} />
    {[
      [-0.38, -0.38],
      [0.38, -0.38],
      [-0.38, 0.38],
      [0.38, 0.38],
    ].map(([x, z], i) => (
      <Block key={i} args={[0.07, TABLE_TOP - 0.08, 0.07]} position={[x, (TABLE_TOP - 0.08) / 2, z]} color={COL.tableLeg} />
    ))}
  </group>
);

const Phone: React.FC<{ position: V3; rotationY: number }> = ({ position, rotationY }) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    <mesh castShadow receiveShadow position={[0, 0.012, 0]}>
      <boxGeometry args={[0.16, 0.024, 0.3]} />
      <meshStandardMaterial color={COL.phone} roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.026, 0]}>
      <boxGeometry args={[0.13, 0.004, 0.25]} />
      <meshStandardMaterial color={COL.screen} roughness={0.4} />
    </mesh>
  </group>
);

const Note: React.FC = () => (
  <group position={[0, -0.12, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
    <mesh castShadow>
      <boxGeometry args={[0.36, 0.2, 0.008]} />
      <meshStandardMaterial color={COL.note} roughness={0.9} />
    </mesh>
    <mesh position={[0.07, 0, 0.006]}>
      <boxGeometry args={[0.1, 0.13, 0.004]} />
      <meshStandardMaterial color="#e08a5a" roughness={0.9} />
    </mesh>
  </group>
);

const TableWorld: React.FC<{ f: number }> = ({ f }) => {
  const bob = (phase: number) => Math.sin((f + phase) / 9) * 0.015;

  // Scene 1: friend slides the phone over
  const phoneX = f < S2 ? r(f, 28, 62, 0.22, -0.3) : -0.3;
  const phoneZ = f < S2 ? r(f, 28, 62, 0.3, 0.25) : 0.25;
  let friendArmL: ArmPose = { pitch: 0.05, yaw: -ARM_YAW };
  if (f < S2) {
    const reach = r(f, 10, 30, 0.05, -0.85);
    const push = r(f, 30, 50, 0, -0.3);
    const back = r(f, 62, 84, 0, 0.9);
    friendArmL = { pitch: reach + push + back, yaw: -ARM_YAW };
  }
  let youTilt = f < S2 ? r(f, 58, 76, 0, 0.18) : 0;
  let youArmR: ArmPose = { pitch: 0.05, yaw: ARM_YAW };

  // Scene 2: friend hands over a note, you pocket it, friend nods "no rush"
  let friendHasNote = false;
  let youHasNote = false;
  let friendTilt = 0;
  let friendNod = 0;
  if (f >= S2 && f < S3) {
    const up = r(f, S2 + 10, S2 + 35, 0.05, -1.45);
    const down = r(f, S2 + 70, S2 + 92, 0, 1.5);
    friendArmL = { pitch: up + down, yaw: -ARM_YAW };
    const yUp = r(f, S2 + 30, S2 + 50, 0.05, -1.45);
    const yDown = r(f, S2 + 62, S2 + 86, 0, 1.5);
    youArmR = { pitch: yUp + yDown, yaw: ARM_YAW };
    friendHasNote = f >= S2 + 14 && f < S2 + 55;
    youHasNote = f >= S2 + 55 && f < S2 + 84;
    friendTilt = r(f, S2 + 80, S2 + 98, 0, -0.2);
    friendNod = Math.sin(Math.max(0, f - (S2 + 92)) / 4) * 0.06 * (f > S2 + 92 ? 1 : 0);
    youTilt = 0;
  }

  // Scene 3: frozen smile, one eye twitches
  let friendMouth: "smile" | "bigSmile" = "smile";
  let eyeL = 1;
  let browL = 0;
  let headJitter = 0;
  let friendBob = bob(0);
  if (f >= S3) {
    friendMouth = "bigSmile";
    friendBob = 0;
    friendArmL = { pitch: 0.05, yaw: -ARM_YAW };
    const local = f - S3;
    const twitchStarts = [24, 30, 52, 58, 64, 80];
    for (const s of twitchStarts) {
      const d = local - s;
      if (d >= 0 && d < 4) {
        const amt = [0.25, 0.1, 0.45, 0.9][d];
        eyeL = Math.min(eyeL, amt);
        browL = -0.035;
        headJitter = d % 2 === 0 ? 0.03 : -0.03;
      }
    }
  }

  return (
    <group rotation={[0, SET_ROT, 0]}>
      <Table />
      <Stool position={[-SEAT_X, 0, 0]} />
      <Stool position={[SEAT_X, 0, 0]} />
      <Phone position={[phoneX, TABLE_TOP, phoneZ]} rotationY={0.3} />
      <Character
        position={[-SEAT_X, 0, 0]}
        rotationY={Math.PI / 2 - CHEAT}
        legsYaw={CHEAT}
        {...YOU}
        mouth="neutral"
        bob={bob(13)}
        headTilt={youTilt}
        armR={youArmR}
        rightHandItem={youHasNote ? <Note /> : null}
      />
      <Character
        position={[SEAT_X, 0, 0]}
        rotationY={-Math.PI / 2 + CHEAT}
        legsYaw={-CHEAT}
        {...FRIEND}
        mouth={friendMouth}
        bob={friendBob}
        headTilt={friendTilt + headJitter}
        headNod={friendNod}
        eyeSquashL={eyeL}
        browL={browL}
        armL={friendArmL}
        leftHandItem={friendHasNote ? <Note /> : null}
      />
    </group>
  );
};

/* ------------------------------------------------------------------ scene 4: wedding (MONTH 3) */

const STAGE_H = 0.4;
const W_YOU: V3 = [-1.25, 0, 0.75];
const W_YOU_ROT = 1.0;
const W_FRIEND: V3 = [0.3, STAGE_H, -2.95];
const W_FRIEND_ROT = -0.45;
const W_GUESTS: { pos: V3; rot: number }[] = [
  { pos: [-0.4, 0, -0.35], rot: 0 },
  { pos: [0.45, 0, 0.75], rot: -1.0 },
  { pos: [-1.15, 0, -0.15], rot: 0.6 },
];
const YOU_HEAD_W: V3 = [W_YOU[0], 1.5, W_YOU[2]];
// Friend's right shoulder in world space; the mic arm aims from here at your head.
const W_SHOULDER_R: V3 = [
  W_FRIEND[0] - 0.39 * Math.cos(W_FRIEND_ROT),
  W_FRIEND[1] + SEAT_Y + 0.68,
  W_FRIEND[2] + 0.39 * Math.sin(W_FRIEND_ROT),
];
const MIC_YAW = lookYaw(W_SHOULDER_R, W_FRIEND_ROT, YOU_HEAD_W);
const MIC_PITCH =
  -Math.PI / 2 +
  Math.atan2(W_SHOULDER_R[1] - YOU_HEAD_W[1], Math.hypot(YOU_HEAD_W[0] - W_SHOULDER_R[0], YOU_HEAD_W[2] - W_SHOULDER_R[2]));

const Mic: React.FC = () => (
  <group>
    <mesh position={[0, -0.06, 0]} castShadow>
      <cylinderGeometry args={[0.035, 0.03, 0.2, 12]} />
      <meshStandardMaterial color={COL2.mic} roughness={0.6} />
    </mesh>
    <mesh position={[0, -0.2, 0]} castShadow>
      <sphereGeometry args={[0.065, 16, 12]} />
      <meshStandardMaterial color={COL2.micHead} roughness={0.5} />
    </mesh>
  </group>
);

const Hall: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color={COL.floor} roughness={1} />
    </mesh>
    <Block args={[16, 7, 0.2]} position={[0, 3.5, -4.6]} color={COL2.hallWall} rough={1} />
    {/* Small stage */}
    <Block args={[3.4, STAGE_H, 2.0]} position={[1.3, STAGE_H / 2, -3.3]} color={COL2.stage} />
    <Block args={[3.42, 0.12, 0.04]} position={[1.3, STAGE_H - 0.08, -2.29]} color={COL2.stageTrim} />
    {/* Pelamin (dais backdrop) */}
    <Block args={[2.6, 2.6, 0.12]} position={[1.3, 1.7, -4.25]} color={COL2.panel} />
    <Block args={[0.25, 3.2, 0.25]} position={[-0.05, 1.6, -4.15]} color={COL2.gold} />
    <Block args={[0.25, 3.2, 0.25]} position={[2.65, 1.6, -4.15]} color={COL2.gold} />
    <Block args={[3.0, 0.3, 0.3]} position={[1.3, 3.15, -4.15]} color={COL2.gold} />
    {[
      [-0.05, 3.3],
      [1.3, 3.35],
      [2.65, 3.3],
      [-0.05, 0.55],
      [2.65, 0.55],
    ].map(([x, y], i) => (
      <Block key={i} args={[0.36, 0.3, 0.36]} position={[x, y, -3.95]} color={COL2.flower} />
    ))}
    {/* Couple's bench */}
    <Block args={[1.7, 0.5, 0.5]} position={[1.3, STAGE_H + 0.25, -3.75]} color={COL2.gold} />
    <Block args={[1.7, 0.75, 0.12]} position={[1.3, STAGE_H + 0.85, -4.02]} color={COL2.gold} />
    {/* Guest table with tablecloth */}
    <mesh position={[-0.4, 0.39, 0.25]} castShadow receiveShadow>
      <cylinderGeometry args={[0.6, 0.66, 0.78, 28]} />
      <meshStandardMaterial color={COL2.cloth} roughness={0.95} />
    </mesh>
    <Block args={[0.22, 0.18, 0.22]} position={[-0.4, 0.87, 0.25]} color={COL2.flower} />
  </group>
);

const WeddingWorld: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const bob = (phase: number) => Math.sin((f + phase) / 9) * 0.015;
  // You: shock shake when he starts talking, then stare at the stage.
  const youShake = shake(f, 30, 30, 0.12);
  const youTurn = r(f, 10, 28, 0, lookYaw(W_YOU, W_YOU_ROT, W_FRIEND));
  // Guests turn their heads to stare at you.
  const stare = r(f, 40, 58, 0, 1);
  // Friend: mic at mouth, then points it at you.
  const point = r(f, 85, 105, 0, 1);
  const friendArmR: ArmPose = { pitch: -2.05 + point * (MIC_PITCH + 2.05), yaw: 0.35 + point * (MIC_YAW - 0.35) };
  const t = r(f, 55, Math.min(len - 25, 120), 0, 1);
  const pos = lerp3(t, [-0.3, 2.8, 8.0], [1.6, 4.2, 2.2]);
  const look = lerp3(t, [-0.3, 1.1, 0.2], [0.88, 1.5, -3.2]);
  return (
    <group>
      <Cam pos={pos} look={look} />
      <Hall />
      {/* Guests */}
      {W_GUESTS.map((g, i) => (
        <group key={i}>
          <Stool position={g.pos} />
          <Character
            position={g.pos}
            rotationY={g.rot}
            {...COL2.guests[i]}
            hair={COL.hair}
            mouth="neutral"
            bob={bob(i * 7)}
            headTurn={stare * lookYaw(g.pos, g.rot, YOU_HEAD_W)}
          />
        </group>
      ))}
      {/* You */}
      <Stool position={W_YOU} />
      <Character
        position={W_YOU}
        rotationY={W_YOU_ROT}
        {...YOU}
        mouth="neutral"
        bob={bob(13) + Math.abs(youShake) * 0.2}
        headTurn={youTurn + youShake}
        eyeSquashL={f > 30 ? 1.2 : 1}
        eyeSquashR={f > 30 ? 1.2 : 1}
        browL={f > 30 ? 0.03 : 0}
        browR={f > 30 ? 0.03 : 0}
      />
      {/* Couple on the dais */}
      <Character position={[0.88, STAGE_H, -3.7]} {...COL2.bride} hair={COL.hair} mouth="smile" bob={bob(3)} />
      <Character position={[1.72, STAGE_H, -3.7]} {...COL2.groom} hair={COL.hair} mouth="smile" bob={bob(21)} />
      {/* Friend on stage with the mic */}
      <Stool position={W_FRIEND} />
      <Character
        position={W_FRIEND}
        rotationY={W_FRIEND_ROT}
        {...FRIEND}
        mouth="bigSmile"
        bob={bob(0)}
        headTilt={point * -0.12}
        armR={friendArmR}
        rightHandItem={<Mic />}
      />
    </group>
  );
};

/* ------------------------------------------------------------------ scene 5: invoice (YEAR 1) */

const ARM_TO_ITEM = 0.7; // ARM_LEN + 0.1 in Character.tsx
const SHOULDER_Y = 0.68; // Character.tsx

// World position of the hand item for a character with zero bob/lean.
const handWorld = (charPos: V3, rotY: number, side: 1 | -1, pose: ArmPose): V3 => {
  const th = pose.pitch;
  const ph = pose.yaw ?? 0;
  const y = -ARM_TO_ITEM * Math.cos(th);
  const z0 = -ARM_TO_ITEM * Math.sin(th);
  const lx = side * 0.39 + z0 * Math.sin(ph);
  const ly = SEAT_Y + SHOULDER_Y + y;
  const lz = z0 * Math.cos(ph);
  return [
    charPos[0] + lx * Math.cos(rotY) + lz * Math.sin(rotY),
    charPos[1] + ly,
    charPos[2] - lx * Math.sin(rotY) + lz * Math.cos(rotY),
  ];
};

const I_FRIEND: V3 = [-0.35, 0, -0.9];
const I_FRIEND_ROT = 0.35;
const I_YOU: V3 = [-1.75, 0, 1.2];
const I_YOU_ROT = 0.8;
const PAPER_W = 0.5;
const FLOOR_MAX = 6.5;

const InvoiceWorld: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const bob = (phase: number) => Math.sin((f + phase) / 9) * 0.015;
  const raise = r(f, 4, 20, 0, 1);
  const armR: ArmPose = { pitch: 0.05 - raise * 2.8, yaw: -raise * 1.2 };
  const hand = handWorld(I_FRIEND, I_FRIEND_ROT, -1, armR);
  const top = hand[1] - 0.05;
  const px = hand[0];
  const pz = hand[2] + 0.08;
  const drop = r(f, 22, 36, 0, top);
  const floorLen = interpolate(f, [36, 140], [0, FLOOR_MAX], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const unrolled = drop >= top - 0.001;
  const rollPos: V3 = unrolled ? [px, 0.1, pz + floorLen + 0.06] : [px, top - drop, pz];
  const rollSpin = unrolled ? floorLen / 0.1 : drop / 0.1;
  // Paper rows (fake line items), every 6th one red
  const vRows: number[] = [];
  for (let y = top - 0.14; y > top - drop + 0.04; y -= 0.13) vRows.push(y);
  const fRows: number[] = [];
  for (let z = 0.16; z < floorLen - 0.05; z += 0.17) fRows.push(z);

  const youShake = shake(f, 105, 40, 0.14);
  const t = r(f, 24, len - 12, 0, 1);
  const pos = lerp3(t, [0.4, 1.85, 3.2], [2.7, 4.0, 8.8]);
  const look = lerp3(t, [-0.5, 1.45, -0.6], [-0.1, 1.2, 2.4]);
  return (
    <group>
      <Cam pos={pos} look={look} />
      <Room />
      <Stool position={I_FRIEND} />
      <Character
        position={I_FRIEND}
        rotationY={I_FRIEND_ROT}
        {...FRIEND}
        mouth="bigSmile"
        armR={armR}
        armL={{ pitch: r(f, 30, 50, 0.05, -0.5), yaw: 0.3 }}
        headTilt={r(f, 40, 60, 0, 0.12)}
      />
      {/* Scroll bar held in the hand */}
      <mesh position={[px, top, pz]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, PAPER_W + 0.12, 10]} />
        <meshStandardMaterial color={COL2.gold} roughness={0.7} />
      </mesh>
      {/* Hanging part */}
      {drop > 0.01 ? (
        <group>
          <Block args={[PAPER_W, drop, 0.012]} position={[px, top - drop / 2, pz]} color={COL2.paper} />
          {vRows.map((y, i) => (
            <Block
              key={i}
              args={[i % 3 === 0 ? 0.36 : 0.26, 0.03, 0.006]}
              position={[px - (i % 3 === 0 ? 0 : 0.05), y, pz + 0.009]}
              color={i % 6 === 5 ? COL2.red : COL2.ink}
            />
          ))}
        </group>
      ) : null}
      {/* Floor part, rolling toward the camera */}
      {floorLen > 0.01 ? (
        <group>
          <Block args={[PAPER_W, 0.012, floorLen]} position={[px, 0.006, pz + floorLen / 2]} color={COL2.paper} />
          {fRows.map((z, i) => (
            <Block
              key={i}
              args={[i % 3 === 0 ? 0.36 : 0.26, 0.006, 0.035]}
              position={[px - (i % 3 === 0 ? 0 : 0.05), 0.015, pz + z]}
              color={i % 6 === 5 ? COL2.red : COL2.ink}
            />
          ))}
        </group>
      ) : null}
      {f >= 22 ? (
        <mesh position={rollPos} rotation={[rollSpin, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, PAPER_W, 16]} />
          <meshStandardMaterial color={COL2.paper} roughness={0.9} />
        </mesh>
      ) : null}
      {/* You, watching it roll past */}
      <Stool position={I_YOU} />
      <Character
        position={I_YOU}
        rotationY={I_YOU_ROT}
        {...YOU}
        mouth="neutral"
        bob={bob(13)}
        headTurn={youShake}
        headNod={r(f, 60, 90, 0, 0.25)}
        eyeSquashL={f > 100 ? 1.25 : 1}
        eyeSquashR={f > 100 ? 1.25 : 1}
        browL={f > 100 ? 0.035 : 0}
        browR={f > 100 ? 0.035 : 0}
      />
    </group>
  );
};

/* ------------------------------------------------------------------ scenes 6-7: anvil + ghost */

const A_YOU: V3 = [0, 0, 0];
const A_YOU_ROT = 0.15;
const A_FRIEND: V3 = [1.5, 0, -1.2];
const A_FRIEND_ROT = -0.5;
const FLAT_Y = 0.22; // flattened height scale
const HEAD_TOP_Y = 1.95; // top of your seated head: the anvil hits here at impact
const ANVIL_FALL = 60; // frames from drop start to impact (constant speed, enters frame at once)
const ANVIL_START_Y = 4.3; // just above the top edge of the scene 6 camera

const Anvil: React.FC<{ y: number }> = ({ y }) => (
  <group position={[0, y, 0.05]} rotation={[0, 0.25, 0]}>
    <Block args={[0.9, 0.16, 0.6]} position={[0, 0.08, 0]} color={COL2.anvil} rough={0.6} />
    <Block args={[0.42, 0.22, 0.36]} position={[0, 0.27, 0]} color={COL2.anvil} rough={0.6} />
    <Block args={[1.0, 0.24, 0.55]} position={[0, 0.5, 0]} color={COL2.anvil} rough={0.6} />
    <mesh position={[0.68, 0.52, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
      <coneGeometry args={[0.13, 0.42, 4]} />
      <meshStandardMaterial color={COL2.anvil} roughness={0.6} />
    </mesh>
  </group>
);

// `impact` = local frame of the impact (may be negative if already past).
const AnvilSet: React.FC<{ f: number; impact: number; friendArmUp: number }> = ({ f, impact, friendArmUp }) => {
  const bob = (phase: number) => Math.sin((f + phase) / 9) * 0.015;
  const d = f - impact;
  const flat = d >= 0;
  const sy = flat ? Math.max(0.15, FLAT_Y + 0.12 * Math.exp(-d / 4) * Math.cos(d * 1.3)) : 1;
  const sxz = flat ? 1.25 : 1;
  const fallT = interpolate(f, [impact - ANVIL_FALL, impact], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Falls to your head top by the impact frame, then rides the squash down.
  const anvilY =
    f < impact - ANVIL_FALL ? 12 : flat ? HEAD_TOP_Y * sy : ANVIL_START_Y - (ANVIL_START_Y - HEAD_TOP_Y) * fallT;
  // Shadow grows from the start of the scene (impact - 72 = scene 6 frame 0).
  const blob = interpolate(f, [impact - 72, impact], [0.25, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const notice = r(f, impact - 45, impact - 35, 0, 1);
  const youShake = shake(f, impact - 30, 28, 0.1);
  return (
    <group>
      <Room wallShadow={false} />
      {/* Anvil's shadow, grows as it falls */}
      {!flat ? (
        <mesh position={[0, 0.012, 0.15]} rotation={[-Math.PI / 2, 0, 0]} scale={[blob * 0.9, blob * 0.75, 1]}>
          <circleGeometry args={[1, 40]} />
          <meshBasicMaterial color="#1d1d24" transparent opacity={0.15 + blob * 0.4} depthWrite={false} />
        </mesh>
      ) : null}
      <group position={A_YOU} scale={[sxz, sy, sxz]}>
        <Stool position={[0, 0, 0]} />
        <Character
          rotationY={A_YOU_ROT}
          {...YOU}
          mouth="neutral"
          bob={flat ? 0 : bob(13)}
          headNod={-0.4 * notice}
          headTurn={youShake}
          eyeSquashL={notice > 0.5 ? 1.3 : 1}
          eyeSquashR={notice > 0.5 ? 1.3 : 1}
          browL={notice * 0.04}
          browR={notice * 0.04}
          armL={{ pitch: 0.05 - notice * 0.6, yaw: 0.3 }}
          armR={{ pitch: 0.05 - notice * 0.6, yaw: -0.3 }}
        />
      </group>
      <Anvil y={anvilY} />
      <Stool position={A_FRIEND} />
      <Character
        position={A_FRIEND}
        rotationY={A_FRIEND_ROT}
        {...FRIEND}
        mouth="bigSmile"
        bob={bob(0)}
        armL={{ pitch: 0.05 - friendArmUp * 2.9, yaw: 0 }}
        headTilt={friendArmUp * 0.12}
      />
    </group>
  );
};

const AnvilScene: React.FC<{ f: number; len: number; impact: number }> = ({ f, len, impact }) => {
  const d = f - impact;
  const k = d >= 0 && d < 18 ? 1 - d / 18 : 0;
  const sx = Math.sin(d * 2.7) * 0.12 * k;
  const sy = Math.cos(d * 3.3) * 0.1 * k;
  const t = r(f, 0, len - 1, 0, 1);
  // Low and wide: room for the fall between the counter card and the caption, floor stays above the caption.
  const base = lerp3(t, [0.75, 0.33, 7.8], [0.7, 0.33, 7.4]);
  return (
    <group>
      <Cam pos={[base[0] + sx, base[1] + sy, base[2]]} look={[0.5 + sx * 0.5, 1.12 + sy * 0.5, 0]} />
      <AnvilSet f={f} impact={impact} friendArmUp={r(f, impact - 40, impact - 25, 0, 1)} />
    </group>
  );
};

const GhostBody: React.FC<{ f: number }> = ({ f }) => {
  const ref = useRef<Group>(null);
  // Turn the reused Character into a glowing ghost. Runs before ManualFrameRenderer's
  // useEffect advances R3F, so the frame is drawn with the ghost material.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    // Character.tsx renders its two seated legs as the first two children of its root group.
    root.children[0]?.children.slice(0, 2).forEach((legs) => {
      legs.visible = false;
    });
    root.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.castShadow = false;
      m.receiveShadow = false;
      const mat = m.material as Material;
      mat.transparent = true;
      mat.opacity = 0.8;
      const std = mat as MeshStandardMaterial;
      if (std.isMeshStandardMaterial) {
        std.emissive.set(COL2.ghostGlow);
        std.emissiveIntensity = 0.8;
      }
    });
  });
  return (
    <group ref={ref}>
      <Character
        rotationY={A_YOU_ROT}
        {...YOU}
        mouth="smile"
        headTilt={Math.sin(f / 14) * 0.08}
        armL={{ pitch: -1.2, yaw: 0.2 }}
        armR={{ pitch: -1.2, yaw: -0.2 }}
      />
    </group>
  );
};

const GHOST_LOOK_OFFSET = 1.2;

const GhostScene: React.FC<{ f: number; len: number; impact: number }> = ({ f, len, impact }) => {
  const rise = interpolate(f, [0, len - 1], [0.15, 1.25], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sway = Math.sin(f / 16) * 0.06;
  // Camera rises with the ghost so its halo stays below the counter card.
  const t = r(f, 0, len - 1, 0, 1);
  const lookY = rise + GHOST_LOOK_OFFSET;
  const pos: V3 = [0.7, lookY - 0.1, 6.0 + 0.4 * t];
  const look: V3 = [0.35, lookY, 0];
  return (
    <group>
      <Cam pos={pos} look={look} />
      <AnvilSet f={f} impact={impact} friendArmUp={0} />
      <group position={[sway, rise, 0.15]}>
        <GhostBody f={f} />
        <mesh position={[0, SEAT_Y + 0.77 + 0.27 + 0.52 + Math.sin(f / 10) * 0.02, 0]} rotation={[Math.PI / 2 - 0.15, 0, 0]}>
          <torusGeometry args={[0.24, 0.045, 12, 36]} />
          <meshBasicMaterial color={COL2.halo} />
        </mesh>
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ overlays */

const PopUp: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 9, stiffness: 260 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 500 }}>
      <div
        style={{
          transform: `scale(${s}) rotate(-7deg)`,
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 150,
          color: "#ffd400",
          WebkitTextStroke: "16px #111111",
          paintOrder: "stroke fill",
          textShadow: "0 8px 22px rgba(0, 0, 0, 0.55)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const VoiceOver: React.FC = () => {
  // getStaticFiles() lists video-project/public/ in Studio and during rendering.
  const hasAudio = useMemo(() => getStaticFiles().some((s) => s.name === AUDIO_FILE), []);
  return hasAudio ? <Html5Audio src={staticFile(AUDIO_FILE)} /> : null;
};

/* ------------------------------------------------------------------ composition */

const sceneAt = (frame: number): SceneId => {
  for (const id of SCENE_ORDER) {
    if (frame < SCENES[id].end) return id;
  }
  return "s7";
};

const World: React.FC = () => {
  const frame = useCurrentFrame();
  const id = sceneAt(frame);
  const sc = SCENES[id];
  const f = frame - sc.start;
  const len = sc.end - sc.start;
  switch (id) {
    case "s1":
    case "s2":
    case "s3":
      return (
        <>
          <TableCam f={frame} />
          <Room />
          <TableWorld f={frame} />
        </>
      );
    case "s4":
      return <WeddingWorld f={f} len={len} />;
    case "s5":
      return <InvoiceWorld f={f} len={len} />;
    case "s6":
      return <AnvilScene f={f} len={len} impact={ANVIL_IMPACT - sc.start} />;
    case "s7":
      return <GhostScene f={f} len={len} impact={ANVIL_IMPACT - sc.start} />;
  }
};

export const Post01: React.FC = () => {
  return (
    <AbsoluteFill>
      <Scene background={COL.bg}>
        <World />
      </Scene>
      {SCENE_ORDER.map((id) => {
        const sc = SCENES[id];
        return sc.timeLabel ? (
          <Sequence key={id} from={sc.start} durationInFrames={sc.end - sc.start} name={`TimeLabel ${id}`}>
            <TimeLabel text={sc.timeLabel} />
          </Sequence>
        ) : null;
      })}
      {COUNTER.map((c, i) => (
        <Sequence key={i} from={c.from} durationInFrames={c.to - c.from} name={`Counter ${c.value}`}>
          <CounterCard label="DEBT" value={c.value} />
        </Sequence>
      ))}
      {CAPTIONS.map((p, i) => (
        <Sequence key={i} from={p.start} durationInFrames={p.end - p.start} name={`Caption ${i + 1}`}>
          <Caption words={p.words.map((w) => ({ text: w.text, emphasis: w.emphasis, at: w.at - p.start - CAPTION_LEAD }))} />
        </Sequence>
      ))}
      {POPUPS.map((p, i) => (
        <Sequence key={i} from={p.from} durationInFrames={p.to - p.from} name={`PopUp ${p.text}`}>
          <PopUp text={p.text} />
        </Sequence>
      ))}
      <VoiceOver />
    </AbsoluteFill>
  );
};
