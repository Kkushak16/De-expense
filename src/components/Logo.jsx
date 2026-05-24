import React from 'react';

const Logo = ({ size = 32, className = '', style = {} }) => {
  // Compute width/height based on aspect ratio (120 width to 110 height)
  const height = size;
  const width = (size * 120) / 110;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 120 110" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      {/* Outer D shape */}
      <path 
        d="M 15 10 H 55 C 80 10, 95 28, 95 50 C 95 72, 80 90, 55 90 H 15 Z" 
        fill="var(--text-main)" 
      />
      
      {/* Inner D shape (counter) filled with the current theme background */}
      <path 
        d="M 33 24 H 53 C 68 24, 77 34, 77 50 C 77 66, 68 76, 53 76 H 33 Z" 
        fill="var(--bg)" 
      />

      {/* "exp" text inside the D loop */}
      <text 
        x="53" 
        y="56" 
        textAnchor="middle" 
        fill="var(--text-main)" 
        fontSize="16" 
        fontWeight="900" 
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif"
        letterSpacing="-0.03em"
      >
        exp
      </text>

      {/* Lowercase "e" outline/cutout to erase the D beneath it */}
      <text 
        x="82" 
        y="92" 
        fill="var(--bg)" 
        stroke="var(--bg)" 
        strokeWidth="10" 
        strokeLinejoin="round"
        fontSize="44" 
        fontWeight="900" 
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif"
        letterSpacing="-0.02em"
      >
        e
      </text>

      {/* Lowercase "e" main letter on top */}
      <text 
        x="82" 
        y="92" 
        fill="var(--text-main)" 
        fontSize="44" 
        fontWeight="900" 
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif"
        letterSpacing="-0.02em"
      >
        e
      </text>
    </svg>
  );
};

export default Logo;
