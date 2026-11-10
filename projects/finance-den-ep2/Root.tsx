import React from "react";
import { Composition } from "remotion";
import { Scene, calculateMetadata, SceneProps } from "./Composition";
import { LiamSheet } from "./LiamSheet";
import { Thumbnail } from "./Thumbnail";

export const Root: React.FC = () => (
  <>
    <Composition
      id="FinanceDenEp2"
      component={Scene}
      durationInFrames={30 * 30}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{} as SceneProps}
      calculateMetadata={calculateMetadata}
    />
    <Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="LiamSheet" component={LiamSheet} durationInFrames={30} fps={30} width={1920} height={1080} />
  </>
);
