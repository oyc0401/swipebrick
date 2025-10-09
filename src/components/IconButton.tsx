import React, { useState } from "react";
import { css } from "@emotion/react";

interface IconButtonProps {
  iconSrc: string;
  iconAlt: string;
  onClick: () => void;
}

const buttonStyle = (isPressed: boolean) => css`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: ${isPressed ? "hsla(214, 95%, 14%, 0.05)" : "transparent"};
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: background-color 0.2s;
`;

const iconStyle = css`
  width: 28px;
  height: 28px;
  pointer-events: none;
`;

export const IconButton: React.FC<IconButtonProps> = ({
  iconSrc,
  iconAlt,
  onClick,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);
  const handleTouchStart = () => setIsPressed(true);
  const handleTouchEnd = () => setIsPressed(false);

  return (
    <button
      css={buttonStyle(isPressed)}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img css={iconStyle} src={iconSrc} alt={iconAlt} />
    </button>
  );
};
