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
  // background: rgba(255, 0, 0, 0.3);
`;

const bottomSpacerStyle = css`
  flex: 1;
  width: 100%;
  // background: rgba(0, 125, 0, 0.3);
`;

export const GameUI = () => {
  const onPointerDown = useGameStore((state) => state.onPointerDown);
   const ballCount = useGameStore(state => state.ballCount);

  useEffect(() => {
    console.log("React render complete");
  }, []);

  const content = (
    <>
      <Header />

      <div
        id="view"
        css={gameViewStyle}
        onPointerDown={onPointerDown}
      >
                <p
    css={css`
      color: #3182f6;
      font-size: 12px;
      text-align: center;
      margin: 0;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `}
  >
    {ballCount}
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