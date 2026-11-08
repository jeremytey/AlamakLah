import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// 3-second technical test: depth, lighting, shadows, camera push-in, pop-in prop.
// Not a character. All animation is driven by useCurrentFrame() (no useFrame).

const PASTEL = {
  sky: "#cfe8f3",
  ground: "#bfe3b4",
  orange: "#f6b38a",
  pink: "#f2a7c3",
  lilac: "#c7b8ea",
  yellow: "#f7e08f",
};

const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const camera = useThree((s) => s.camera);

  // Push-in: computed in render so it is applied before ThreeCanvas advances the frame.
  const t = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  camera.position.set(
    interpolate(t, [0, 1], [3, 1.5]),
    interpolate(t, [0, 1], [6, 4]),
    interpolate(t, [0, 1], [14, 9]),
  );
  camera.lookAt(0, 1.2, 0);

  return null;
};

const Box: React.FC<{
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  delay: number;
}> = ({ position, size, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12 } });
  return (
    <mesh
      position={[position[0], size[1] / 2 * s, position[2]]}
      scale={[s, s, s]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
};

const CAPTION_TEXT = "What if you had to pay your friend back instantly?";

// Remotion-rendered text overlay (DOM, not baked into any asset), bottom third.
const CaptionLine: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 380,
      }}
    >
      <div
        style={{
          opacity,
          width: 920,
          textAlign: "center",
          color: "#ffffff",
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          fontWeight: 800,
          fontSize: 78,
          lineHeight: 1.15,
          WebkitTextStroke: "10px #111111",
          paintOrder: "stroke fill",
          textShadow: "0 6px 18px rgba(0, 0, 0, 0.55)",
        }}
      >
        {CAPTION_TEXT}
      </div>
    </AbsoluteFill>
  );
};

export const Test3D: React.FC = () => {
  return (
    <AbsoluteFill>
      <Scene3D />
      <CaptionLine />
    </AbsoluteFill>
  );
};

const Scene3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows
      camera={{ fov: 40, near: 0.1, far: 100 }}
    >
      <color attach="background" args={[PASTEL.sky]} />
      <CameraRig />
      <hemisphereLight args={["#ffffff", PASTEL.ground, 0.6]} />
      <directionalLight
        position={[5, 9, 4]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={PASTEL.ground} roughness={1} />
      </mesh>
      {/* Main prop pops in first; background props at increasing depth show perspective. */}
      <Box position={[0, 0, 0]} size={[2, 2, 2]} color={PASTEL.orange} delay={0} />
      <Box position={[-3, 0, -4]} size={[1.4, 3, 1.4]} color={PASTEL.pink} delay={12} />
      <Box position={[3.2, 0, -7]} size={[1.6, 4, 1.6]} color={PASTEL.lilac} delay={24} />
      <Box position={[2.2, 0, 2]} size={[0.8, 0.8, 0.8]} color={PASTEL.yellow} delay={36} />
    </ThreeCanvas>
  );
};
