import React from 'react';

const Skeleton = ({ width = '100%', height = '1rem', circle = false, style = {} }) => {
  return (
    <div
      className={`skeleton ${circle ? 'skeleton--circle' : ''}`}
      aria-hidden="true"
      style={{ width, height, borderRadius: circle ? '50%' : '8px', ...style }}
    />
  );
};

export default React.memo(Skeleton);
