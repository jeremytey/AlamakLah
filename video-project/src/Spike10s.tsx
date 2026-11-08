import { useThree } from "@react-three/fiber";
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Character } from "./components/Character";
import { Caption, CounterCard, TimeLabel } from "./components/Overlays";
import { Scene } from "./components/Scene";

// 10-second character spike = Post 01 scenes 1-3 (fiction, see content/scripts/post-01-never-paid-back.md).
// Scene 1: 0-89 | Scene 2: 90-209 | Scene 3: 210-299 (30 fps). All motion from useCurrentFrame().

const S2 = 90;
const S3 = 210;

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

// The table set is rotated so the two characters sit on a diagonal (better for 9:16).
const SET_ROT = (15 * Math.PI) / 180;
const SEAT_X = 0.6;
const TABLE_TOP = 0.8;

const ease = Easing.inOut(Easing.cubic);
const r = (f: number, a: number, b: number, v0: number, v1: number) =>
  interpolate(f, [a, b], [v0, v1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// World positions (set-local -> world) for camera targets.
const toWorld = (x: number, y: number, z: number): [number, number, number] => [
  x * Math.cos(SET_ROT) + z * Math.sin(SET_ROT),
  y,
  -x * Math.sin(SET_ROT) + z * Math.cos(SET_ROT),
];
const FRIEND_HEAD = toWorld(SEAT_X, 1.55, 0);
const CHEAT = (40 * Math.PI) / 180; // both turned toward camera
const ARM_YAW = 0.7; // arms aim back toward the other person
const FRIEND_YAW = SET_ROT - Math.PI / 2 + CHEAT; // world facing yaw of friend
const FRIEND_FACING: [number, number, number] = [Math.sin(FRIEND_YAW), 0, Math.cos(FRIEND_YAW)];

type V3 = [number, number, number];
const lerp3 = (t: number, a: V3, b: V3): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const along = (base: V3, dir: V3, d: number, dy = 0): V3 => [
  base[0] + dir[0] * d,
  base[1] + dy,
  base[2] + dir[2] * d,
];

const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera);
  let pos: V3;
  let look: V3;
  if (frame < S2) {
    // Scene 1: wide, slow push-in
    const t = r(frame, 0, S2 - 1, 0, 1);
    pos = lerp3(t, [0.05, 2.35, 5.3], [0.0, 2.15, 4.4]);
    look = lerp3(t, [-0.12, 1.0, 0], [-0.1, 1.05, 0]);
  } else if (frame < S3) {
    // Scene 2: over your shoulder, push-in on friend
    const t = r(frame, S2, S3 - 1, 0, 1);
    pos = lerp3(t, [-1.75, 2.0, 2.6], [-1.3, 1.9, 1.95]);
    look = lerp3(t, toWorld(SEAT_X, 1.2, 0), toWorld(SEAT_X, 1.4, 0));
  } else {
    // Scene 3: push-in to friend's face
    const t = r(frame, S3, 299, 0, 1);
    pos = lerp3(t, along(FRIEND_HEAD, FRIEND_FACING, 2.3, 0.2), along(FRIEND_HEAD, FRIEND_FACING, 1.7, 0.16));
    look = [FRIEND_HEAD[0], FRIEND_HEAD[1] + 0.14, FRIEND_HEAD[2]];
  }
  // Applied during render so it is set before ThreeCanvas advances this frame.
  camera.position.set(...pos);
  camera.lookAt(...look);
  return null;
};

const Room: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color={COL.floor} roughness={1} />
    </mesh>
    {/* Back wall with a window, gives depth behind the table */}
    <mesh position={[0, 3, -3.2]} receiveShadow>
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

const Table: React.FC = () => (
  <group>
    <mesh position={[0, TABLE_TOP - 0.04, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.95, 0.08, 0.95]} />
      <meshStandardMaterial color={COL.table} roughness={0.9} />
    </mesh>
    {[
      [-0.38, -0.38],
      [0.38, -0.38],
      [-0.38, 0.38],
      [0.38, 0.38],
    ].map(([x, z], i) => (
      <mesh key={i} position={[x, (TABLE_TOP - 0.08) / 2, z]} castShadow receiveShadow>
        <boxGeometry args={[0.07, TABLE_TOP - 0.08, 0.07]} />
        <meshStandardMaterial color={COL.tableLeg} roughness={0.9} />
      </mesh>
    ))}
  </group>
);

const Stool: React.FC<{ x: number }> = ({ x }) => (
  <group position={[x, 0, 0]}>
    <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.46, 0.08, 0.46]} />
      <meshStandardMaterial color={COL.stool} roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.21, 0]} castShadow>
      <boxGeometry args={[0.12, 0.42, 0.12]} />
      <meshStandardMaterial color={COL.tableLeg} roughness={0.9} />
    </mesh>
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

// Held beyond the fingertips and standing up, so it reads as a banknote in hand.
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

const World: React.FC = () => {
  const f = useCurrentFrame();
  const bob = (phase: number) => Math.sin((f + phase) / 9) * 0.015;

  // ---- Scene 1: friend slides the phone over (frames 0-89)
  const phoneX = f < S2 ? r(f, 28, 62, 0.22, -0.3) : -0.3;
  const phoneZ = f < S2 ? r(f, 28, 62, 0.3, 0.25) : 0.25;
  let friendArmL = { pitch: 0.05, yaw: -ARM_YAW };
  if (f < S2) {
    const reach = r(f, 10, 30, 0.05, -0.85);
    const push = r(f, 30, 50, 0, -0.3);
    const back = r(f, 62, 84, 0, 0.9);
    friendArmL = { pitch: reach + push + back, yaw: -ARM_YAW };
  }
  let youTilt = f < S2 ? r(f, 58, 76, 0, 0.18) : 0;
  let youArmR = { pitch: 0.05, yaw: ARM_YAW };

  // ---- Scene 2: friend hands over a note (frames 90-209)
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

  // ---- Scene 3: frozen smile, one eye twitches (frames 210-299)
  let friendMouth: "smile" | "bigSmile" = "smile";
  let eyeL = 1;
  let browL = 0;
  let headJitter = 0;
  let friendBob = bob(0);
  if (f >= S3) {
    friendMouth = "bigSmile";
    friendBob = 0; // frozen
    friendArmL = { pitch: 0.05, yaw: -ARM_YAW };
    const local = f - S3;
    // twitch bursts: closes fast for 2-3 frames
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
      <Stool x={-SEAT_X} />
      <Stool x={SEAT_X} />
      <Phone position={[phoneX, TABLE_TOP, phoneZ]} rotationY={0.3} />
      {/* You (blue): left seat, faces the friend, cheated 40 deg toward camera */}
      <Character
        position={[-SEAT_X, 0, 0]}
        rotationY={Math.PI / 2 - CHEAT}
        legsYaw={CHEAT}
        shirt={COL.shirtYou}
        skin={COL.skinYou}
        hair={COL.hair}
        pants={COL.pantsYou}
        mouth="neutral"
        bob={bob(13)}
        headTilt={youTilt}
        armR={youArmR}
        rightHandItem={youHasNote ? <Note /> : null}
      />
      {/* Friend (orange): right seat */}
      <Character
        position={[SEAT_X, 0, 0]}
        rotationY={-Math.PI / 2 + CHEAT}
        legsYaw={-CHEAT}
        shirt={COL.shirtFriend}
        skin={COL.skinFriend}
        hair={COL.hair}
        pants={COL.pantsFriend}
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

const hook = "What if you never paid your friend back?".split(" ");

export const Spike10s: React.FC = () => {
  return (
    <AbsoluteFill>
      <Scene background={COL.bg}>
        <CameraRig />
        <Room />
        <World />
      </Scene>
      <Sequence from={0} durationInFrames={S2}>
        <Caption
          words={hook.map((t, i) => ({
            text: t,
            at: 4 + i * 7,
            emphasis: t === "never" || t === "back?",
          }))}
        />
      </Sequence>
      <Sequence from={S2} durationInFrames={S3 - S2}>
        <TimeLabel text="DAY 1" />
        <CounterCard label="DEBT" value="RM 20" />
      </Sequence>
      <Sequence from={S3}>
        <TimeLabel text="WEEK 1" />
      </Sequence>
    </AbsoluteFill>
  );
};
