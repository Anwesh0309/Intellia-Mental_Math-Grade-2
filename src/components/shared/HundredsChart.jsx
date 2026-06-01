import React from 'react';

export default function HundredsChart({ 
  highlighted = new Set(), // Set of number values in path
  current = null,          // Active cell value (green pulse)
  startCell = null,        // Original cell value (blue focus)
  onCellClick = null       // Interactive cell click callback
}) {
  // Generate numbers 1 to 100 arranged in a grid
  // Row 0: 1 to 10
  // Row 1: 11 to 20
  // ...
  // Row 9: 91 to 100
  const rows = Array.from({ length: 10 }, (_, r) => 
    Array.from({ length: 10 }, (_, c) => r * 10 + c + 1)
  );

  const getCellClassName = (val) => {
    let classes = ["hundreds-cell"];
    
    if (val === current) {
      classes.push("cell-active-glow");
    } else if (val === startCell) {
      classes.push("cell-start-focus");
    } else if (highlighted.has(val)) {
      classes.push("cell-path-highlighted");
    }
    
    if (onCellClick) {
      classes.push("cell-clickable");
    }
    
    return classes.join(" ");
  };

  return (
    <div className="hundreds-chart-container" aria-label="10 by 10 hundreds chart from 1 to 100">
      <div className="hundreds-grid">
        {rows.map((row, rIdx) => (
          <div key={`row-${rIdx}`} className="hundreds-row">
            {row.map((val) => {
              const isStart = val === startCell;
              const isCurrent = val === current;
              const isHigh = highlighted.has(val);
              
              // Direct cell styling based on status
              let style = {};
              if (isCurrent) {
                style = { backgroundColor: '#4DD0E1', color: '#1A1A1A', fontWeight: 'bold' };
              } else if (isStart) {
                style = { backgroundColor: '#7C4DFF', color: '#FFFFFF', fontWeight: 'bold' };
              } else if (isHigh) {
                style = { backgroundColor: 'rgba(255, 199, 44, 0.25)', border: '1.5px solid #FFC72C', color: '#FFB700', fontWeight: 'bold' };
              }

              return (
                <button
                  key={`cell-${val}`}
                  className={getCellClassName(val)}
                  style={style}
                  onClick={() => onCellClick && onCellClick(val)}
                  disabled={!onCellClick}
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
