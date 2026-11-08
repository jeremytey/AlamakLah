import { Composition } from "remotion";
import { MyComposition } from "./Composition";
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
    </>
  );
};
