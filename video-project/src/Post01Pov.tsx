import { useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
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
import { ArmPose, Character, Mouth } from "./components/Character";
import { Caption, CounterCard, TimeLabel } from "./components/Overlays";
import { NotificationBanner, PhoneScreen, StoryCardKind } from "./components/PhoneScreen";
import { Scene } from "./components/Scene";
import {
  AUDIO_FILE,
  BANNERS,
  BEAT_PAY_AT,
  BEAT_THUMB_AT,
  BILL_TRAY_AT,
  CAPTION_LEAD,
  CAPTIONS,
  COUNTER,
  DINNER_PAY_AT,
  DINNER_THUMB_AT,
  DINNERS,
  PayItem,
  PHONE,
  SCENES,
  SPONSOR_BEAT_LEN,
  SPONSOR_BEATS,
  STARE_HOLD_AT,
  STORY_KEYS,
  TRANSITIONS,
} from "./post01PovTiming";

// Post 01 POV "POV: your friend that never pays you back". All content is FICTION.
// Every scene, caption, counter, phone and banner frame comes from ./post01PovTiming.ts.
// Same characters, palette and caption style as Post01; only actions, sets and props change.

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
// New props, same flat pastel palette.
const PROP = {
  board: "#4f7f6c",
  boardLine: "#fffaf3",
  boardHi: "#ffd96a",
  plate: "#ffffff",
  tray: "#8a5a3c",
  slip: "#fffdf7",
  wallet: "#8a5a3c",
  card: "#dfe9f7",
  cardStripe: "#7fa8e6",
  bedWood: "#c9a27a",
  mattress: "#fffaf3",
  pillow: "#ffffff",
  blanket: "#b9a3e3",
  bedWall: "#b9c3e6",
  bedFloor: "#e6d6bc",
  shade: "#ffe9a8",
  lampGlow: "#ffd27a",
  dark: "#0d0d14",
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

const Cam: React.FC<{ pos: V3; look: V3 }> = ({ pos, look }) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(...pos);
  camera.lookAt(...look);
  return null;
};

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

const Disc: React.FC<{ r: number; h: number; position: V3; color: string }> = ({ r: rad, h, position, color }) => (
  <mesh position={position} castShadow receiveShadow>
    <cylinderGeometry args={[rad, rad, h, 24]} />
    <meshStandardMaterial color={color} roughness={0.8} />
  </mesh>
);

/* ------------------------------------------------------------------ restaurant (S1-S3) */

const SET_ROT = (15 * Math.PI) / 180;
const SEAT_X = 0.6;
const TABLE_TOP = 0.8;
const CHEAT = (40 * Math.PI) / 180;
const ARM_YAW = 0.7;
const THUMB_POSE = { pitch: -1.35, yaw: -0.1 }; // friend's left arm, forward at chest height (below the face)

// One fixed camera angle for S2 and S3; the S1 push-in ends exactly here (no cut).
const REST_CAM = { pos: [0.15, 2.3, 5.2] as V3, look: [0.05, 1.15, 0] as V3 };
const S1_CAM = { pos: [0.2, 2.6, 6.4] as V3, look: [0.05, 1.1, 0] as V3 };

const Room: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color={COL.floor} roughness={1} />
    </mesh>
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
    {/* Menu board: blocks only, no text */}
    <group position={[-1.0, 1.95, -3.06]}>
      <Block args={[1.5, 1.0, 0.06]} position={[0, 0, 0]} color={PROP.board} />
      {[0.3, 0.12, -0.06, -0.24].map((y, i) => (
        <group key={i}>
          <Block args={[0.8, 0.06, 0.02]} position={[-0.22, y, 0.04]} color={PROP.boardLine} />
          <Block args={[0.22, 0.06, 0.02]} position={[0.5, y, 0.04]} color={PROP.boardHi} />
        </group>
      ))}
    </group>
  </group>
);

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

const Stool: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    <Block args={[0.46, 0.08, 0.46]} position={[0, 0.46, 0]} color={COL.stool} />
    <Block args={[0.12, 0.42, 0.12]} position={[0, 0.21, 0]} color={COL.tableLeg} />
  </group>
);

const Plate: React.FC<{ x: number; food: string; side: string }> = ({ x, food, side }) => (
  <group position={[x, TABLE_TOP, -0.12]}>
    <Disc r={0.16} h={0.02} position={[0, 0.01, 0]} color={PROP.plate} />
    <Disc r={0.09} h={0.05} position={[-0.02, 0.045, 0]} color={food} />
    <Block args={[0.06, 0.04, 0.06]} position={[0.08, 0.04, 0.04]} color={side} />
  </group>
);

// Bill tray with a slip; `notes` paid notes stacked on top.
const BillTray: React.FC<{ z: number; notes: number }> = ({ z, notes }) => (
  <group position={[0, TABLE_TOP, z]}>
    <Block args={[0.3, 0.03, 0.2]} position={[0, 0.015, 0]} color={PROP.tray} />
    <Block args={[0.14, 0.01, 0.17]} position={[-0.05, 0.035, 0]} color={PROP.slip} />
    {Array.from({ length: Math.min(notes, 6) }).map((_, i) => (
      <Block
        key={i}
        args={[0.16, 0.008, 0.09]}
        position={[0.06, 0.04 + i * 0.01, (i % 2) * 0.02 - 0.01]}
        rotation={[0, (i % 3) * 0.15 - 0.15, 0]}
        color={COL.note}
      />
    ))}
  </group>
);

// Items held in a raised hand. `armPitch` counter-rotates them so they stay upright in world space.
const Upright: React.FC<{ armPitch: number; children: React.ReactNode }> = ({ armPitch, children }) => (
  <group rotation={[-armPitch, 0, 0]}>{children}</group>
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

const HeldItem: React.FC<{ kind: PayItem | "wallet"; armPitch: number }> = ({ kind, armPitch }) => {
  if (kind === "note") return <Note />;
  return (
    <Upright armPitch={armPitch}>
      {kind === "wallet" ? (
        <Block args={[0.2, 0.15, 0.05]} position={[0, 0.06, 0.07]} color={PROP.wallet} />
      ) : kind === "card" ? (
        <group position={[0, 0.06, 0.07]}>
          <Block args={[0.22, 0.14, 0.012]} position={[0, 0, 0]} color={PROP.card} />
          <Block args={[0.22, 0.03, 0.004]} position={[0, 0.03, 0.008]} color={PROP.cardStripe} />
        </group>
      ) : (
        <group position={[0, 0.08, 0.07]}>
          <Block args={[0.12, 0.22, 0.02]} position={[0, 0, 0]} color={COL.phone} />
          <Block args={[0.1, 0.18, 0.004]} position={[0, 0, 0.012]} color={COL.screen} />
        </group>
      )}
    </Upright>
  );
};

// Thumbs-up from boxes: a thumb standing up on the friend's hand.
const ThumbsUp: React.FC<{ armPitch: number }> = ({ armPitch }) => (
  <Upright armPitch={armPitch}>
    <Block args={[0.07, 0.17, 0.07]} position={[0, 0.14, 0.02]} color={COL.skinFriend} />
  </Upright>
);

type RestState = {
  youArmR: ArmPose;
  youItem: PayItem | "wallet" | null;
  youNod: number;
  youLean: number;
  friendArmL: ArmPose;
  friendThumb: boolean;
  friendMouth: Mouth;
  friendLean: number;
  friendNod: number;
  trayZ: number;
  notes: number;
  food: { food: string; side: string };
};

const restState = (frame: number): RestState => {
  const s = SCENES;
  const st: RestState = {
    youArmR: { pitch: 0.05, yaw: ARM_YAW },
    youItem: null,
    youNod: 0,
    youLean: 0,
    friendArmL: { pitch: 0.05, yaw: -ARM_YAW },
    friendThumb: false,
    friendMouth: "smile",
    friendLean: -0.15,
    friendNod: 0,
    trayZ: 0.2,
    notes: 0,
    food: DINNERS[0],
  };
  if (frame < s.s1.end) {
    // S1: bill tray slides in, you reach for your wallet, friend leans back with a smile.
    const f = frame;
    st.trayZ = r(f, BILL_TRAY_AT, BILL_TRAY_AT + 20, 0.75, 0.2);
    const pitch = 0.05 + r(f, 40, 52, 0, 0.45) + r(f, 56, 74, 0, -1.95);
    st.youArmR = { pitch, yaw: ARM_YAW };
    st.youItem = f >= 54 ? "wallet" : null;
    st.friendLean = r(f, 30, 55, 0, -0.45) + r(f, 96, 118, 0, 0.23); // big lean back, settles to the S2 lean
    st.friendMouth = f > 40 ? "bigSmile" : "smile";
    return st;
  }
  if (frame < s.s2.end) {
    // S2: three dinners, same beats each time: excuse -> you pay -> thumbs-up -> pause.
    const i = DINNERS.findIndex((dn) => frame < dn.end);
    const d = frame - DINNERS[i].start;
    st.food = DINNERS[i];
    st.friendLean = -0.22;
    const talking = d >= 4 && d < 30;
    st.friendMouth = talking ? (Math.floor(d / 4) % 2 ? "bigSmile" : "smile") : "bigSmile";
    st.friendNod = talking ? Math.sin(d / 2.5) * 0.04 : 0;
    st.youNod = r(d, 8, 16, 0, 0.35);
    st.youLean = r(d, 8, 16, 0, 0.08);
    const up = i === 0 ? -1.45 + r(d, 10, 16, 0, 0.1) : r(d, 12, 22, 0.05, -1.35);
    st.youArmR = { pitch: up + r(d, 30, 40, 0, 1.4), yaw: ARM_YAW };
    st.youItem = i === 0 && d < 12 ? "wallet" : d >= 12 && d < DINNER_PAY_AT ? "note" : null;
    st.notes = i + (d >= DINNER_PAY_AT ? 1 : 0);
    // Thumbs-up in front of his chest, so the arm never crosses his face.
    const k = r(d, DINNER_THUMB_AT - 3, DINNER_THUMB_AT + 5, 0, 1);
    st.friendArmL = { pitch: 0.05 + k * (THUMB_POSE.pitch - 0.05), yaw: -ARM_YAW + k * (THUMB_POSE.yaw + ARM_YAW) };
    st.friendThumb = d >= DINNER_THUMB_AT;
    return st;
  }
  // S3: four 1-second payment beats, same rhythm.
  const bi = Math.min(SPONSOR_BEATS.length - 1, Math.floor((frame - s.s3.start) / SPONSOR_BEAT_LEN));
  const beat = SPONSOR_BEATS[bi];
  const b = frame - beat.start;
  st.food = DINNERS[bi % DINNERS.length];
  st.friendLean = -0.22;
  st.friendMouth = "bigSmile";
  st.youNod = 0.38 + bi * 0.04;
  st.youLean = 0.1;
  st.youArmR = { pitch: r(b, 0, 6, 0.05, -1.35) + r(b, 14, 22, 0, 1.4), yaw: ARM_YAW };
  const paidNotes = SPONSOR_BEATS.slice(0, bi).filter((x) => x.item === "note").length;
  if (beat.item === "note") {
    st.youItem = b < BEAT_PAY_AT ? "note" : null;
    st.notes = 3 + paidNotes + (b >= BEAT_PAY_AT ? 1 : 0);
  } else {
    st.youItem = b < 22 ? beat.item : null;
    st.notes = 3 + paidNotes;
  }
  const k = r(b, BEAT_THUMB_AT - 2, BEAT_THUMB_AT + 3, 0, 1) * r(b, 24, 30, 1, 0);
  st.friendArmL = { pitch: 0.05 + k * (THUMB_POSE.pitch - 0.05), yaw: -ARM_YAW + k * (THUMB_POSE.yaw + ARM_YAW) };
  st.friendThumb = b >= BEAT_THUMB_AT && b < 27;
  return st;
};

const Restaurant: React.FC<{ frame: number }> = ({ frame }) => {
  const st = restState(frame);
  const bob = (phase: number) => Math.sin((frame + phase) / 9) * 0.015;
  const t = r(frame, 0, SCENES.s1.end - 1, 0, 1);
  const cam =
    frame < SCENES.s1.end
      ? { pos: lerp3(t, S1_CAM.pos, REST_CAM.pos), look: lerp3(t, S1_CAM.look, REST_CAM.look) }
      : REST_CAM;
  return (
    <group>
      <Cam pos={cam.pos} look={cam.look} />
      <Room />
      <group rotation={[0, SET_ROT, 0]}>
        <Table />
        <Stool position={[-SEAT_X, 0, 0]} />
        <Stool position={[SEAT_X, 0, 0]} />
        <Plate x={-0.24} food={st.food.food} side={st.food.side} />
        <Plate x={0.24} food={st.food.food} side={st.food.side} />
        <BillTray z={st.trayZ} notes={st.notes} />
        <Character
          position={[-SEAT_X, 0, 0]}
          rotationY={Math.PI / 2 - CHEAT}
          legsYaw={CHEAT}
          {...YOU}
          mouth="neutral"
          bob={bob(13)}
          headNod={st.youNod}
          lean={st.youLean}
          armR={st.youArmR}
          rightHandItem={st.youItem ? <HeldItem kind={st.youItem} armPitch={st.youArmR.pitch} /> : null}
        />
        <Character
          position={[SEAT_X, 0, 0]}
          rotationY={-Math.PI / 2 + CHEAT}
          legsYaw={-CHEAT}
          {...FRIEND}
          mouth={st.friendMouth}
          bob={bob(0)}
          lean={st.friendLean}
          headNod={st.friendNod}
          armL={st.friendArmL}
          leftHandItem={st.friendThumb ? <ThumbsUp armPitch={st.friendArmL.pitch} /> : null}
        />
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ bedroom (S4-S6) */

const BED_YOU: V3 = [0, 0.1, -0.6]; // hips on the mattress, legs under the blanket (half-sit)
const BED_LEAN = -0.25;
const PHONE_ARM_PITCH = -1.3; // forearms up: phone held in front of you, below the face
const LAP_ARM_PITCH = -0.8; // S6: hands lowered to rest on the blanket
const PHONE_ARM_YAW = 0.35; // hands meet in the middle
const BED_CAM_A = { pos: [2.0, 2.3, 4.0] as V3, look: [0.35, 1.05, -0.6] as V3 }; // S4/S5: you left, lamp far left, phone right
const BED_CAM_B = { pos: [1.0, 2.5, 3.6] as V3, look: [0.1, 1.25, -0.6] as V3 }; // S6: face upper-middle, hands and phone visible

const Bedroom: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color={PROP.bedFloor} roughness={1} />
    </mesh>
    <Block args={[8, 5, 0.2]} position={[0, 2.5, -1.45]} color={PROP.bedWall} rough={1} />
    {/* Bed */}
    <Block args={[1.5, 0.3, 2.2]} position={[0, 0.15, -0.1]} color={PROP.bedWood} />
    <Block args={[1.4, 0.25, 2.1]} position={[0, 0.425, -0.1]} color={PROP.mattress} />
    <Block args={[1.5, 1.1, 0.12]} position={[0, 0.55, -1.24]} color={PROP.bedWood} />
    <Block args={[0.9, 0.18, 0.4]} position={[0, 0.66, -1.0]} rotation={[-0.6, 0, 0]} color={PROP.pillow} />
    <Block args={[1.42, 0.28, 0.7]} position={[0, 0.66, -0.05]} color={PROP.blanket} />
    {/* Bedside table + lamp */}
    <Block args={[0.5, 0.56, 0.5]} position={[-1.0, 0.28, -1.0]} color={PROP.bedWood} />
    <Disc r={0.1} h={0.05} position={[-1.0, 0.585, -1.0]} color={COL.hair} />
    <Block args={[0.04, 0.35, 0.04]} position={[-1.0, 0.78, -1.0]} color={COL.hair} />
    <mesh position={[-1.0, 1.0, -1.0]}>
      <cylinderGeometry args={[0.13, 0.2, 0.24, 24]} />
      <meshStandardMaterial color={PROP.shade} emissive={PROP.lampGlow} emissiveIntensity={0.7} roughness={0.9} />
    </mesh>
    <pointLight position={[-1.0, 1.0, -0.85]} color={PROP.lampGlow} intensity={1.2} distance={3.5} />
  </group>
);

// Phone held up between both hands in front of you; `armPitch` includes the torso lean so it stays upright.
// `flat` 0 = held up facing you, 1 = lying in your lap.
const PhoneInHand: React.FC<{ armPitch: number; flat: number }> = ({ armPitch, flat }) => (
  <Upright armPitch={armPitch}>
    <group position={[0.15, 0.1 - flat * 0.08, -0.05]} rotation={[-0.3 - flat * 1.1, 0, 0]}>
      <Block args={[0.16, 0.29, 0.025]} position={[0, 0, 0]} color={COL.phone} />
    </group>
  </Upright>
);

const storyPos = (frame: number) =>
  interpolate(
    frame,
    STORY_KEYS.map((k) => k.at),
    STORY_KEYS.map((k) => k.pos),
    { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

const BedroomWorld: React.FC<{ frame: number }> = ({ frame }) => {
  const s = SCENES;
  const bob = Math.sin(frame / 10) * 0.012;
  // Face: curiosity -> disbelief across the three cards, then blank in S6.
  const c = frame < s.s5.start ? Math.min(1, storyPos(frame) / 2) : 1;
  const blank = r(frame, s.s6.start, s.s6.start + 20, 0, 1);
  const eyes = (1.05 + 0.3 * c) * (1 - blank) + 1 * blank;
  const brows = (0.015 + 0.04 * c) * (1 - blank);
  // S6: lower the phone, turn to the camera, freeze.
  const lower = r(frame, s.s6.start, s.s6.start + 25, 0, 1);
  const armPitch = PHONE_ARM_PITCH + lower * (LAP_ARM_PITCH - PHONE_ARM_PITCH);
  const turn = r(frame, s.s6.start + 18, s.s6.start + 36, 0, 1);
  const camHeadYaw = Math.atan2(BED_CAM_B.pos[0] - BED_YOU[0], BED_CAM_B.pos[2] - BED_YOU[2]);
  const still = frame >= Math.min(s.s6.start + 40, STARE_HOLD_AT);
  // Camera: S4/S5 3/4 view; from the S5 cut-back it eases into the S6 stare framing.
  const t = r(frame, PHONE.backStart, s.s6.start + 50, 0, 1);
  const pos = lerp3(t, BED_CAM_A.pos, BED_CAM_B.pos);
  const look = lerp3(t, BED_CAM_A.look, BED_CAM_B.look);
  return (
    <group>
      <Cam pos={pos} look={look} />
      <Bedroom />
      <Character
        position={BED_YOU}
        {...YOU}
        mouth="neutral"
        lean={BED_LEAN}
        bob={still ? 0 : bob * (1 - turn)}
        headNod={0.28 * (1 - turn)}
        headTurn={turn * camHeadYaw}
        headTilt={frame < s.s6.start ? c * 0.08 : 0.08 * (1 - turn)}
        eyeSquashL={eyes}
        eyeSquashR={eyes}
        browL={brows}
        browR={brows}
        armR={{ pitch: armPitch, yaw: PHONE_ARM_YAW }}
        armL={{ pitch: armPitch, yaw: -PHONE_ARM_YAW }}
        rightHandItem={<PhoneInHand armPitch={armPitch + BED_LEAN} flat={lower} />}
      />
    </group>
  );
};

/* ------------------------------------------------------------------ overlays */

const CARDS: StoryCardKind[] = ["watch", "airport", "holiday"];
const PHONE_SMALL = { x: 650, y: 520, w: 390, h: 694 };
const PHONE_FULL = { x: 40, y: 60, w: 1000, h: 1780 };

const PhoneLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < PHONE.inAt || frame >= PHONE.backEnd) return null;
  const slide = r(frame, PHONE.inAt, PHONE.inAt + 12, 1, 0);
  const zoom = r(frame, PHONE.zoomStart, PHONE.zoomEnd, 0, 1) * r(frame, PHONE.backStart, PHONE.backEnd, 1, 0);
  const lerp = (a: number, b: number) => a + (b - a) * zoom;
  const opacity = r(frame, PHONE.backStart, PHONE.backEnd, 1, 0);
  const b = BANNERS.find((x) => x.inPhone);
  const banner =
    b && frame >= b.at
      ? { sender: b.sender, text: b.text, progress: spring({ frame: frame - b.at, fps, config: { damping: 15, stiffness: 160 } }) }
      : null;
  return (
    <PhoneScreen
      x={lerp(PHONE_SMALL.x, PHONE_FULL.x) + slide * 500}
      y={lerp(PHONE_SMALL.y, PHONE_FULL.y)}
      width={lerp(PHONE_SMALL.w, PHONE_FULL.w)}
      height={lerp(PHONE_SMALL.h, PHONE_FULL.h)}
      cards={CARDS}
      cardPos={storyPos(frame)}
      banner={banner}
      opacity={opacity}
    />
  );
};

const ScreenBanner: React.FC<{ sender: string; text: string }> = ({ sender, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 15, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 50 }}>
      <NotificationBanner width={960} banner={{ sender, text, progress }} />
    </AbsoluteFill>
  );
};

const Transitions: React.FC = () => {
  const frame = useCurrentFrame();
  const tr = TRANSITIONS.find((x) => Math.abs(frame - x.at) <= x.half);
  if (!tr) return null;
  const peak = tr.kind === "dipDark" ? 1 : 0.9;
  const o = interpolate(frame, [tr.at - tr.half, tr.at, tr.at + tr.half], [0, peak, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ background: tr.kind === "dipDark" ? PROP.dark : COL.bg, opacity: o }} />;
};

const VoiceOver: React.FC = () => {
  // getStaticFiles() lists video-project/public/ in Studio and during rendering.
  const hasAudio = useMemo(() => getStaticFiles().some((s) => s.name === AUDIO_FILE), []);
  return hasAudio ? <Html5Audio src={staticFile(AUDIO_FILE)} /> : null;
};

const World: React.FC = () => {
  const frame = useCurrentFrame();
  return frame < SCENES.s4.start ? <Restaurant frame={frame} /> : <BedroomWorld frame={frame} />;
};

export const Post01Pov: React.FC = () => {
  const screenBanner = BANNERS.find((b) => !b.inPhone);
  return (
    <AbsoluteFill>
      <Scene background={COL.bg}>
        <World />
      </Scene>
      <PhoneLayer />
      {DINNERS.map((dn) => (
        <Sequence key={dn.label} from={dn.start} durationInFrames={dn.end - dn.start} name={`TimeLabel ${dn.label}`}>
          <TimeLabel text={dn.label} />
        </Sequence>
      ))}
      {COUNTER.map((c, i) => (
        <Sequence key={i} from={c.from} durationInFrames={c.to - c.from} name={`Counter ${c.value}`}>
          <CounterCard label="DEBT" value={c.value} />
        </Sequence>
      ))}
      {screenBanner ? (
        <Sequence from={screenBanner.at} durationInFrames={SCENES.s6.end - screenBanner.at} name="Banner S6">
          <ScreenBanner sender={screenBanner.sender} text={screenBanner.text} />
        </Sequence>
      ) : null}
      <Transitions />
      {CAPTIONS.map((p, i) => (
        <Sequence key={i} from={p.start} durationInFrames={p.end - p.start} name={`Caption ${i + 1}`}>
          <Caption words={p.words.map((w) => ({ text: w.text, emphasis: w.emphasis, at: w.at - p.start - CAPTION_LEAD }))} />
        </Sequence>
      ))}
      <VoiceOver />
    </AbsoluteFill>
  );
};
