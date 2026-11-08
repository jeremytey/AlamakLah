import React from "react";

// Blocky character built only from box primitives. Faces +z in its own space.
// Character's own left is +x, right is -x. Seated on a stool of height SEAT_Y.

export const SEAT_Y = 0.5;
const SHOULDER_Y = 0.68; // above hips
const ARM_LEN = 0.6;

export type Mouth = "neutral" | "smile" | "bigSmile";

export type ArmPose = {
  pitch: number; // 0 = hanging down, -PI/2 = straight forward
  yaw?: number; // + turns the arm toward the character's left (+x)
};

export type CharacterProps = {
  position?: [number, number, number];
  rotationY?: number;
  shirt: string;
  skin: string;
  hair: string;
  pants: string;
  armL?: ArmPose;
  armR?: ArmPose;
  headTilt?: number; // roll (z)
  headTurn?: number; // yaw (y)
  headNod?: number; // pitch (x)
  bob?: number; // upper-body y offset
  lean?: number; // torso pitch forward (+ leans forward)
  legsYaw?: number; // lets the body turn to camera while the legs stay under the table
  mouth?: Mouth;
  eyeSquashL?: number; // 1 = open, 0 = closed
  eyeSquashR?: number;
  browL?: number; // y offset
  browR?: number;
  leftHandItem?: React.ReactNode;
  rightHandItem?: React.ReactNode;
};

const Box: React.FC<{
  args: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  shadows?: boolean;
  basic?: boolean; // unlit, for face features so they stay crisp
}> = ({ args, position, rotation, color, shadows = true, basic = false }) => (
  <mesh
    position={position}
    rotation={rotation}
    castShadow={shadows && !basic}
    receiveShadow={shadows && !basic}
  >
    <boxGeometry args={args} />
    {basic ? (
      <meshBasicMaterial color={color} />
    ) : (
      <meshStandardMaterial color={color} roughness={0.9} />
    )}
  </mesh>
);

const Arm: React.FC<{
  side: 1 | -1;
  pose: ArmPose;
  sleeve: string;
  skin: string;
  item?: React.ReactNode;
}> = ({ side, pose, sleeve, skin, item }) => (
  <group position={[side * 0.39, SHOULDER_Y, 0]} rotation={[0, pose.yaw ?? 0, 0]}>
    <group rotation={[pose.pitch, 0, 0]}>
      <Box args={[0.17, ARM_LEN, 0.17]} position={[0, -ARM_LEN / 2, 0]} color={sleeve} />
      <Box args={[0.15, 0.15, 0.15]} position={[0, -ARM_LEN - 0.07, 0]} color={skin} />
      {item ? <group position={[0, -ARM_LEN - 0.1, 0]}>{item}</group> : null}
    </group>
  </group>
);

const MouthShape: React.FC<{ mouth: Mouth }> = ({ mouth }) => {
  const dark = "#5b2a2a";
  if (mouth === "neutral") {
    return <Box args={[0.16, 0.035, 0.02]} position={[0, -0.13, 0.265]} color={dark} basic />;
  }
  if (mouth === "smile") {
    return (
      <group position={[0, -0.13, 0.265]}>
        <Box args={[0.14, 0.035, 0.02]} position={[0, 0, 0]} color={dark} basic />
        <Box args={[0.04, 0.035, 0.02]} position={[-0.085, 0.025, 0]} color={dark} basic />
        <Box args={[0.04, 0.035, 0.02]} position={[0.085, 0.025, 0]} color={dark} basic />
      </group>
    );
  }
  // bigSmile: wide open grin with a teeth strip
  return (
    <group position={[0, -0.12, 0.265]}>
      <Box args={[0.3, 0.11, 0.02]} color={dark} basic />
      <Box args={[0.27, 0.045, 0.025]} position={[0, 0.025, 0.003]} color="#ffffff" basic />
    </group>
  );
};

const Eye: React.FC<{ x: number; squash: number; browY: number; hair: string }> = ({
  x,
  squash,
  browY,
  hair,
}) => (
  <group position={[x, 0.04, 0.262]}>
    <group scale={[1, Math.max(0.08, squash), 1]}>
      <Box args={[0.13, 0.13, 0.01]} color="#ffffff" basic />
      <Box args={[0.07, 0.09, 0.012]} position={[0, -0.005, 0.006]} color="#1d1d24" basic />
    </group>
    <Box args={[0.14, 0.03, 0.02]} position={[0, 0.11 + browY, 0.005]} color={hair} basic />
  </group>
);

export const Character: React.FC<CharacterProps> = ({
  position = [0, 0, 0],
  rotationY = 0,
  shirt,
  skin,
  hair,
  pants,
  armL = { pitch: 0.05 },
  armR = { pitch: 0.05 },
  headTilt = 0,
  headTurn = 0,
  headNod = 0,
  bob = 0,
  lean = 0,
  legsYaw = 0,
  mouth = "smile",
  eyeSquashL = 1,
  eyeSquashR = 1,
  browL = 0,
  browR = 0,
  leftHandItem,
  rightHandItem,
}) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Legs (seated): thighs forward, shins down, shoes */}
      {[-1, 1].map((s) => (
        <group key={s} rotation={[0, legsYaw, 0]}>
          <Box args={[0.22, 0.18, 0.5]} position={[s * 0.14, SEAT_Y + 0.09, 0.2]} color={pants} />
          <Box args={[0.2, SEAT_Y, 0.2]} position={[s * 0.14, SEAT_Y / 2, 0.38]} color={pants} />
          <Box args={[0.22, 0.08, 0.3]} position={[s * 0.14, 0.04, 0.45]} color="#3a3a46" />
        </group>
      ))}
      {/* Upper body pivots at the hips */}
      <group position={[0, SEAT_Y + bob, 0]} rotation={[lean, 0, 0]}>
        <Box args={[0.64, 0.74, 0.4]} position={[0, 0.37, 0]} color={shirt} />
        <Arm side={1} pose={armL} sleeve={shirt} skin={skin} item={leftHandItem} />
        <Arm side={-1} pose={armR} sleeve={shirt} skin={skin} item={rightHandItem} />
        {/* Head pivots at the neck */}
        <group position={[0, 0.77, 0]} rotation={[headNod, headTurn, headTilt]}>
          <group position={[0, 0.27, 0]}>
            <Box args={[0.54, 0.54, 0.52]} color={skin} />
            {/* Hair: top slab, back slab, fringe */}
            <Box args={[0.58, 0.14, 0.56]} position={[0, 0.3, -0.01]} color={hair} />
            <Box args={[0.58, 0.42, 0.1]} position={[0, 0.1, -0.26]} color={hair} />
            <Box args={[0.58, 0.08, 0.08]} position={[0, 0.22, 0.25]} color={hair} />
            <Eye x={0.12} squash={eyeSquashL} browY={browL} hair={hair} />
            <Eye x={-0.12} squash={eyeSquashR} browY={browR} hair={hair} />
            <MouthShape mouth={mouth} />
          </group>
        </group>
      </group>
    </group>
  );
};
