import React from 'react';

interface IconButtonProps {
  iconSrc: string;
  iconAlt: string;
  onClick: () => void;
}

export const IconButton: React.FC<IconButtonProps> = ({ iconSrc, iconAlt, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '8px',
        transition: 'background-color 0.2s',
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <img
        src={iconSrc}
        alt={iconAlt}
        style={{
          width: '28px',
          height: '28px',
          pointerEvents: 'none',
        }}
      />
    </button>
  );
};