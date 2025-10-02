import React, { useState, useEffect } from "react";
import { Header } from "./Header";

export const GameUI: React.FC = () => {
  // 게임 상태 업데이트를 위한 간격 체크 (임시)

  return (
    <>
      <Header />

      <div id="view">{/* 게임 영역 - 투명하게 유지 */}</div>

      <div className="spacer"></div>
    </>
  );
};
