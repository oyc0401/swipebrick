import React from "react";
import { css } from "@emotion/react";

interface IconButtonProps {
  iconSrc: string;
  iconAlt: string;
  onClick: () => void;
}

const buttonStyle = css`
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:active {
    background-color: rgba(255, 255, 255, 0.3);
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
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
  return (
    <button css={buttonStyle} onClick={onClick}>
      <img css={iconStyle} src={iconSrc} alt={iconAlt} />
    </button>
  );
};
