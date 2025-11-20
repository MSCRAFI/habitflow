// Import: React first, no third-party chart libs to keep bundle lean
import React from 'react';

const AnalyticsChart = ({ data, type = 'weekly', title = 'Habit Completions' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>{title}</h3>
        </div>
        <div className="card-body text-center">
          <p className="text-secondary">No data available</p>
        </div>
      </div>
    );
  }

  // Pre-calculate aggregates used by the simple bar chart
  const maxCompletions = Math.max(...data.map(d => d.completions));
  const totalCompletions = data.reduce((sum, d) => sum + d.completions, 0);

  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
        <div className="text-sm text-secondary">
          Total: {totalCompletions} completions
        </div>
      </div>
      <div className="card-body">
        <div className="chart-container" style={{ height: '200px', padding: 'var(--space-md)' }}>
          <div className="chart-bars" style={{ 
            display: 'flex', 
            alignItems: 'end', 
            height: '100%',
            gap: 'var(--space-xs)',
            justifyContent: 'space-between'
          }}>
            {data.map((item, index) => {
              const height = maxCompletions > 0 ? (item.completions / maxCompletions) * 100 : 0;
              // Highlight the last bar as "today" for weekly views
const isToday = type === 'weekly' && index === data.length - 1;
              
              return (
                <div 
                  key={item.date}
                  className="chart-bar-container"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    flex: 1,
                    height: '100%'
                  }}
                >
                  <div 
                    className={`chart-bar ${isToday ? 'chart-bar-today' : ''}`}
                    style={{
                      height: `${height}%`,
                      minHeight: item.completions > 0 ? '4px' : '0px',
                      width: '100%',
                      maxWidth: type === 'weekly' ? '32px' : '12px',
                      backgroundColor: item.completions > 0 ? 
                        (isToday ? 'var(--color-primary-500)' : 'var(--color-primary-400)') : 
                        'var(--color-neutral-200)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    title={`${item.completions} completions`}
                  >
                    {item.completions > 0 && (
                      <div 
                        className="chart-value"
                        style={{
                          position: 'absolute',
                          top: '-20px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.completions}
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className="chart-label"
                    style={{
                      marginTop: 'var(--space-sm)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      textAlign: 'center',
                      transform: type === 'monthly' ? 'rotate(-45deg)' : 'none',
                      transformOrigin: 'center'
                    }}
                  >
                    {type === 'weekly' ? 
                      item.day_name : 
                      new Date(item.date).getDate()
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;