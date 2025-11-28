import { css } from "@emotion/react";
import { useEffect } from "react";
import { Header } from "./Header";
import { GameOverDialog } from "./GameOverDialog";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { isTossApp } from "../utils/platform";
import { useGameStore } from "../stores/gameStore";

const gameViewStyle = css`
  width: 100%;
  aspect-ratio: 1 / 1;
  position: relative;
  // background: rgba(255, 0, 0, 0.3);
`;

const bottomSpacerStyle = css`
  flex: 1;
  width: 100%;
  // background: rgba(0, 125, 0, 0.3);
`;

const ballTextStyle = (viewScale: number, ballTextX: number) => css`
  color: #44c4cd;
  font-size: 18px;
  text-align: center;
  margin: 0;
  position: absolute;
  bottom: ${6 * viewScale}px;
  left: ${ballTextX * viewScale}px;
  transform: translate(-50%, -50%);
  font-weight: 600;
`;

export const GameUI = () => {
  const onPointerDown = useGameStore((state) => state.onPointerDown);
  const remainingBalls = useGameStore((state) => state.remainingBalls);
  const ballTextX = useGameStore((state) => state.ballTextX);
  const viewScale = useGameStore((state) => state.viewScale);

  useEffect(() => {
    console.log("React render complete");
  }, []);

  const content = (
    <>
      <Header />

      <div id="view" css={gameViewStyle} onPointerDown={onPointerDown}>
        <p css={ballTextStyle(viewScale, ballTextX)}>
          {remainingBalls > 0 && remainingBalls}
        </p>
        {/* 게임 영역 - 투명하게 유지 */}
      </div>

      <div css={bottomSpacerStyle}></div>

      <GameOverDialog />
    </>
  );

  if (isTossApp()) {
    return <TDSMobileAITProvider>{content}</TDSMobileAITProvider>;
  }

  return content;
};
