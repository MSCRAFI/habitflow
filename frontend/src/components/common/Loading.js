import React from 'react';

const Loading = ({ label = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="loading" role="status" aria-live="polite" aria-busy="true">
      <div className="spinner" aria-hidden="true"></div>
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {content}
      </div>
    );
  }

  return content;
};

export default React.memo(Loading);
