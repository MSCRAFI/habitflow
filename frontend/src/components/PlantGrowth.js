import React from 'react';

// Simple decorative plant growth component for gamified visuals
const PlantGrowth = ({ level = 0, size = 80 }) => {
  const clamped = Math.max(0, Math.min(100, level));
  const stage = clamped < 25 ? 'seed' : clamped < 50 ? 'sprout' : clamped < 75 ? 'leafy' : 'bloom';

  return (
    <div className={`plant-growth plant-${stage}`} style={{ width: size, height: size }} aria-label={`Plant growth level ${clamped}%`}>
      <div className="plant-pot" />
      <div className="plant-stem" />
      <div className="plant-leaf left" />
      <div className="plant-leaf right" />
      <div className="plant-flower" />
    </div>
  );
};

export default PlantGrowth;
