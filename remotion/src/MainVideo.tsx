import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { PersistentBackground } from "./components/PersistentBackground";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Spark } from "./scenes/Scene2Spark";
import { Scene3Wave } from "./scenes/Scene3Wave";
import { Scene4Rsd } from "./scenes/Scene4Rsd";
import { Scene5Squad } from "./scenes/Scene5Squad";
import { Scene6Closer } from "./scenes/Scene6Closer";

export const nunitoFamily = loadNunito("normal", {
  weights: ["400", "700", "800"],
  subsets: ["latin"],
}).fontFamily;

export const dmSansFamily = loadDMSans("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
}).fontFamily;

const TRANSITION_DURATION = 20;

export const MainVideo = () => {
  return (
    <AbsoluteFill>
      <PersistentBackground />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene1Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene2Spark />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene3Wave />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene4Rsd />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene5Squad />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene6Closer />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
