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
          justifyContent: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <div
          style={{
            padding: "12px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <IconButton
            iconSrc={storeIcon}
            iconAlt="Store"
            onClick={() => console.log("Store button clicked")}
          />

          <IconButton
            iconSrc={settingIcon}
            iconAlt="Settings"
            onClick={() => console.log("Settings button clicked")}
          />

          <IconButton
            iconSrc={rankIcon}
            iconAlt="Ranking"
            onClick={() => console.log("Ranking button clicked")}
          />
        </div>
      </div>
    </div>
  );
}
