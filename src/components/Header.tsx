import { css } from "@emotion/react";
import { IconButton } from "./IconButton";
import { useGameStore } from "../stores/gameStore";

import storeIcon from "/store_icon.svg";
import settingIcon from "/setting_icon.svg";
import rankIcon from "/rank_icon.svg";

const headerWrapperStyle = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  justify-content: end;
`;

const headerContentStyle = css`
  padding: 12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: start;
  padding-bottom: 48px;
`;

const buttonGroupStyle = css`
  display: flex;
  flex-direction: row;
  gap: 4px;
  flex: 1;
`;

const scoreStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
`;

const scoreTextStyle = css`
  font-size: 18px;
  font-weight: 500;
`;

const rightButtonGroupStyle = css`
  display: flex;
  flex-direction: row;
  justify-content: end;
  flex: 1;
`;

const spacerStyle = css`
  flex: 1;
  width: 100%;
  background: rgba(0, 125, 0, 0.3);
`;

export function Header() {
  const score = useGameStore((state) => state.score);

  return (
    <div css={spacerStyle}>
      <div css={headerWrapperStyle}>
        <div css={headerContentStyle}>
          <div css={buttonGroupStyle}>
            <IconButton
              iconSrc={rankIcon}
              iconAlt="Ranking"
              onClick={() => console.log("Ranking button clicked")}
            />
            <IconButton
              iconSrc={storeIcon}
              iconAlt="Store"
              onClick={() => console.log("Store button clicked")}
            />
          </div>

          <div css={scoreStyle}>
            <p css={scoreTextStyle}>최고기록: 120</p>
            <p css={scoreTextStyle}>현재점수: {score}</p>
          </div>

          <div css={rightButtonGroupStyle}>
            <IconButton
              iconSrc={settingIcon}
              iconAlt="Settings"
              onClick={() => console.log("Settings button clicked")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
