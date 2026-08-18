import React from 'react';

export default function HundredsChart({ 
  highlighted = new Set(), // Set or Array of number values in path
  current = null,          // Active cell value
  startCell = null,        // Original cell value
  onCellClick = null       // Interactive cell click callback
}) {
  // Generate numbers 1 to 100 arranged in a 10x10 grid
  const rows = Array.from({ length: 10 }, (_, r) => 
    Array.from({ length: 10 }, (_, c) => r * 10 + c + 1)
  );

  const isHighlighted = (val) => {
    if (!highlighted) return false;
    if (typeof highlighted.has === 'function') return highlighted.has(val);
    if (Array.isArray(highlighted)) return highlighted.includes(val);
    return false;
  };

  return (
    <div className="hundreds-chart-container" aria-label="10 by 10 hundreds chart from 1 to 100">
      <div className="hundreds-grid">
        {rows.map((row, rIdx) => (
          <div key={`row-${rIdx}`} className="hundreds-row">
            {row.map((val) => {
              const isStart = val === startCell;
              const isCurrent = val === current;
              const isHigh = isHighlighted(val);
              
              // High-contrast cell styling for Grade 2 visual clarity
              let style = {};
              if (isCurrent) {
                style = { 
                  backgroundColor: '#FFC72C', 
                  color: '#1A1A1A', 
                  fontWeight: 900, 
                  fontSize: '1.15rem',
                  border: '2.5px solid #FFFFFF',
                  boxShadow: '0 0 16px rgba(255, 199, 44, 0.95)',
                  transform: 'scale(1.18)',
                  zIndex: 10
                };
              } else if (isHigh && !isStart) {
                style = { 
                  backgroundColor: '#4DD0E1', 
                  color: '#1A1A1A', 
                  fontWeight: 900,
                  border: '2px solid #00E5FF',
                  boxShadow: '0 0 8px rgba(77, 208, 225, 0.6)'
                };
              } else if (isStart) {
                style = { 
                  backgroundColor: '#7C4DFF', 
                  color: '#FFFFFF', 
                  fontWeight: 900,
                  border: '2px solid #A78BFA',
                  boxShadow: '0 0 10px rgba(124, 77, 255, 0.6)'
                };
              }

              return (
                <button
                  key={`cell-${val}`}
                  type="button"
                  className={`hundreds-cell ${isCurrent ? 'cell-active-glow' : ''} ${isStart ? 'cell-start-focus' : ''} ${isHigh ? 'cell-path-highlighted' : ''}`}
                  style={style}
                  onClick={() => onCellClick && onCellClick(val)}
                  aria-label={`Number ${val}${isStart ? ', Starting position' : ''}${isCurrent ? ', Current position' : ''}`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
