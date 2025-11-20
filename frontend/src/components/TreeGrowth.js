import React from 'react';

// Professional tree growth indicator for the Modern Forest theme
// level: 0-100 percentage of growth
const TreeGrowth = ({ level = 0, size = 80 }) => {
  const clamped = Math.max(0, Math.min(100, level));
  const trunkHeight = 30 + (clamped * 0.5); // 30-80
  const canopySize = 20 + (clamped * 0.5); // 20-70

  const width = size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Tree growth level ${Math.round(clamped)}%`}
      style={{ display: 'block' }}
    >
      {/* Ground */}
      <rect x="0" y="86" width="100" height="14" fill="var(--color-neutral-100)" />

      {/* Trunk */}
      <rect
        x="48"
        y={86 - trunkHeight}
        width="4"
        height={trunkHeight}
        rx="1.5"
        fill="var(--color-primary-700)"
      />

      {/* Canopy */}
      <g transform={`translate(50, ${86 - trunkHeight})`}>
        <circle r={canopySize * 0.36} cx="0" cy={-canopySize * 0.15} fill="var(--color-primary-400)" />
        <circle r={canopySize * 0.3} cx={-canopySize * 0.35} cy={-canopySize * 0.05} fill="var(--color-primary-300)" />
        <circle r={canopySize * 0.28} cx={canopySize * 0.35} cy={-canopySize * 0.05} fill="var(--color-primary-500)" />
      </g>

      {/* Progress label */}
      <text x="50" y="98" textAnchor="middle" fontSize="8" fill="var(--text-secondary)">
        {Math.round(clamped)}%
      </text>
    </svg>
  );
};

export default TreeGrowth;
