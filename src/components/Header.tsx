import { css } from "@emotion/react";
import { useState, useEffect } from "react";
import { IconButton } from "./IconButton";
import { ScoreDisplay } from "./ScoreDisplay";

import storeIcon from "/store_icon.svg";
import settingIcon from "/setting_icon.svg";
import rankIcon from "/rank_icon.svg";
import { isTossApp } from "../utils/platform";
import {
  isMinVersionSupported,
  openGameCenterLeaderboard,
} from "@apps-in-toss/web-framework";

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

const rightButtonGroupStyle = css`
  display: flex;
  flex-direction: row;
  justify-content: end;
  flex: 1;
  position: relative;
`;

const spacerStyle = css`
  flex: 1;
  width: 100%;
  // background: rgba(0, 125, 0, 0.3);
`;

export function Header() {
  const [ageRatingOpacity, setAgeRatingOpacity] = useState(0);

  useEffect(() => {
    setAgeRatingOpacity(1);
    setTimeout(() => setAgeRatingOpacity(0), 3300);
  }, []);

  function openLeaderBoard() {
    const isSupported = isMinVersionSupported({
      android: "5.221.0",
      ios: "5.221.0",
    });

    if (!isSupported) {
      return;
    }
    openGameCenterLeaderboard();
  }

  return (
    <div css={spacerStyle}>
      <div css={headerWrapperStyle}>
        <div css={headerContentStyle}>
          <div css={buttonGroupStyle}>
            {/* <IconButton
              iconSrc={storeIcon}
              iconAlt="Store"
              onClick={() => console.log("Store button clicked")}
            /> */}
          </div>

          <ScoreDisplay />

          <div css={rightButtonGroupStyle}>
            {isTossApp() && (
              <IconButton
                iconSrc={rankIcon}
                iconAlt="Ranking"
                onClick={() => {
                  openLeaderBoard();
                }}
              />
            )}
            <img
              src="/game_all.svg"
              alt="게임 연령등급"
              css={css`
                height: 64px;
                width: auto;
                opacity: ${ageRatingOpacity};
                transition: opacity 0.3s ease-out;
                position: absolute;
                top: 0;
                right: 0;
                pointer-events: none;
              `}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
