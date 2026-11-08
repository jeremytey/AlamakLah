import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { useVideoConfig } from "remotion";

// Shared 3D stage: canvas, background, lights and shadows.
// `flat` = THREE.NoToneMapping so pastel colours render as specified
// (R3F 9.8.2 configuration.d.ts: default is ACESFilmicToneMapping).
// shadows="variance" because three 0.187 removed PCFSoftShadowMap.

export const Scene: React.FC<{
  background: string;
  children: React.ReactNode;
}> = ({ background, children }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      flat
      shadows="variance"
      camera={{ fov: 42, near: 0.05, far: 100 }}
    >
      <color attach="background" args={[background]} />
      <hemisphereLight args={["#ffffff", "#d8cbb8", 1.5]} />
      <directionalLight
        position={[3, 7, 5]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-radius={6}
        shadow-blurSamples={16}
        shadow-bias={-0.0005}
      />
      {children}
    </ThreeCanvas>
  );
};
