import { css } from "@emotion/react";
import { Header } from "./Header";
import { GameOverDialog } from "./GameOverDialog";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { isTossApp } from "../utils/platform";

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
  // 게임 상태 업데이트를 위한 간격 체크 (임시)

  const content = (
    <>
      <Header />

      <div id="view" css={gameViewStyle}>
        {/* 게임 영역 - 투명하게 유지 */}
      </div>

      <div css={bottomSpacerStyle}></div>

      <GameOverDialog />
    </>
  );

  return <TDSMobileAITProvider>{content}</TDSMobileAITProvider>;

  return content;
};
