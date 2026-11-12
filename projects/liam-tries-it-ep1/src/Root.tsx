import React from "react";
import { Composition } from "remotion";
import { Episode } from "./Episode";
import { L16x9, L9x16 } from "./lib";
import timeline from "./timeline.json";

const frames = Math.round(timeline.duration * timeline.fps);
const E16: React.FC = () => <Episode L={L16x9} />;
const E9: React.FC = () => <Episode L={L9x16} />;

export const Root: React.FC = () => (
  <>
    <Composition id="LiamTriesItEp1-16x9" component={E16} durationInFrames={frames} fps={timeline.fps} width={1920} height={1080} />
    <Composition id="LiamTriesItEp1-9x16" component={E9} durationInFrames={frames} fps={timeline.fps} width={1080} height={1920} />
  </>
);
