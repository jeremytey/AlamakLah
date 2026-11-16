import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Post01 } from "./Post01";
import { Post01Pov } from "./Post01Pov";
import { DURATION_IN_FRAMES as POV_DURATION, FPS as POV_FPS } from "./post01PovTiming";
import { DURATION_IN_FRAMES, FPS } from "./post01Timing";
import { Spike10s } from "./Spike10s";
import { Test3D } from "./Test3D";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="Test3D"
        component={Test3D}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Spike10s"
        component={Spike10s}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Post01"
        component={Post01}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="Post01Pov"
        component={Post01Pov}
        durationInFrames={POV_DURATION}
        fps={POV_FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
