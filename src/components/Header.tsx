import React from "react";
import { IconButton } from "./IconButton";

import storeIcon from "/store_icon.svg";
import settingIcon from "/setting_icon.svg";
import rankIcon from "/rank_icon.svg";

export function Header() {
  return (
    <div className="spacer">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          justifyContent: "end",
        }}
      >
        <div
          style={{
            padding: "12px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "start",
            paddingBottom: "48px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "4px",
              flex: 1,
            }}
          >
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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              paddingTop: "8px",
            }}
          >
            <p style={{ fontSize: 18, fontWeight: 500 }}>최고기록: 120</p>
            <p style={{ fontSize: 18, fontWeight: 500 }}>현재기록: 13</p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "end",
              flex: 1,
            }}
          >
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
