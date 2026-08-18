import React from 'react';

export default function PlaceValueBlocks({ 
  tens = 0, 
  ones = 0, 
  size = 'md', 
  interactive = false, 
  onAction = null, // Callback for click/tap trigger
  type = 'static', // 'static' | 'to-add-tens' | 'to-add-ones' | 'added-tens' | 'added-ones'
  disabled = false
}) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  // Sizing definitions
  const rodWidth = isSm ? 10 : isLg ? 16 : 14;
  const rodHeight = isSm ? 50 : isLg ? 80 : 70;
  const cubeSize = isSm ? 10 : isLg ? 16 : 14;
  const gap = isSm ? 4 : isLg ? 8 : 6;

  // Render a Single Tens Rod
  const renderTensRod = (index) => {
    const x = index * (rodWidth + gap);
    const segmentHeight = rodHeight / 10;
    const segments = Array.from({ length: 10 });

    return (
      <g 
        key={`tens-${index}`} 
        className={`tens-rod-group ${interactive && !disabled ? 'interactive-block' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (interactive && !disabled && onAction) {
            onAction('ten', index);
          }
        }}
        style={{ cursor: interactive && !disabled ? 'pointer' : 'default' }}
      >
        {/* Shadow backdrop */}
        <rect 
          x={x + 1} 
          y={1} 
          width={rodWidth} 
          height={rodHeight} 
          fill="rgba(0, 0, 0, 0.06)" 
          rx="3" 
        />
        {/* Base rod */}
        <rect 
          x={x} 
          y={0} 
          width={rodWidth} 
          height={rodHeight} 
          fill="#7C4DFF" 
          stroke="#693BE3" 
          strokeWidth="1.5" 
          rx="3" 
        />
        {/* Draw 9 line segments to make the 10 units visual */}
        {segments.map((_, i) => (
          i > 0 && (
            <line 
              key={`seg-${i}`} 
              x1={x} 
              y1={i * segmentHeight} 
              x2={x + rodWidth} 
              y2={i * segmentHeight} 
              stroke="#693BE3" 
              strokeWidth="1" 
            />
          )
        ))}
        {/* Highlights for 3D look */}
        <rect 
          x={x + 1} 
          y={1} 
          width={rodWidth / 4} 
          height={rodHeight - 2} 
          fill="rgba(255, 255, 255, 0.25)" 
          rx="1" 
        />
      </g>
    );
  };

  // Render a Single Ones Cube
  const renderOnesCube = (index) => {
    const row = index % 5;
    const col = Math.floor(index / 5);
    const x = col * (cubeSize + gap);
    const y = row * (cubeSize + gap);

    return (
      <g 
        key={`ones-${index}`} 
        className={`ones-cube-group ${interactive && !disabled ? 'interactive-block' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (interactive && !disabled && onAction) {
            onAction('one', index);
          }
        }}
        style={{ cursor: interactive && !disabled ? 'pointer' : 'default' }}
      >
        {/* Shadow */}
        <rect 
          x={x + 1} 
          y={y + 1} 
          width={cubeSize} 
          height={cubeSize} 
          fill="rgba(0, 0, 0, 0.08)" 
          rx="2.5" 
        />
        {/* Cube body */}
        <rect 
          x={x} 
          y={y} 
          width={cubeSize} 
          height={cubeSize} 
          fill="#FFC72C" 
          stroke="#FFB700" 
          strokeWidth="1.5" 
          rx="2.5" 
        />
        {/* 3D highlight */}
        <rect 
          x={x + 1} 
          y={y + 1} 
          width={cubeSize / 3} 
          height={cubeSize - 2} 
          fill="rgba(255, 255, 255, 0.35)" 
          rx="1" 
        />
      </g>
    );
  };

  // Compute overall viewport bounding box based on rod & cube count
  const displayTens = Math.max(1, tens);
  const displayOnes = Math.max(1, ones);
  const maxTensWidth = displayTens * (rodWidth + gap);
  const maxOnesColCount = Math.max(1, Math.ceil(displayOnes / 5));
  const maxOnesWidth = maxOnesColCount * (cubeSize + gap);
  
  const width = Math.max(140, maxTensWidth + maxOnesWidth + 30);
  const height = Math.max(rodHeight + 5, 5 * (cubeSize + gap) + 5);

  return (
    <div 
      className={`place-value-container blocks-${type}`}
      onClick={() => {
        if (interactive && !disabled && onAction) {
          onAction('ten');
        }
      }}
      style={{ 
        cursor: interactive && !disabled ? 'pointer' : 'default',
        minWidth: '120px',
        minHeight: '60px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        width="100%" 
        height="100%" 
        className="blocks-svg"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Ghost placeholder when 0 tens */}
        {tens === 0 && (
          <g transform="translate(5, 2)" opacity="0.35">
            <rect x={0} y={0} width={rodWidth} height={rodHeight} fill="none" stroke="#7C4DFF" strokeWidth="1.5" strokeDasharray="3 3" rx="3" />
          </g>
        )}
        {/* Tens rods section */}
        {tens > 0 && (
          <g transform="translate(5, 2)">
            {Array.from({ length: tens }).map((_, idx) => renderTensRod(idx))}
          </g>
        )}

        {/* Ghost placeholder when 0 ones */}
        {ones === 0 && (
          <g transform={`translate(${displayTens * (rodWidth + gap) + 20}, 2)`} opacity="0.35">
            <rect x={0} y={0} width={cubeSize} height={cubeSize} fill="none" stroke="#FFC72C" strokeWidth="1.5" strokeDasharray="2 2" rx="2" />
          </g>
        )}
        {/* Ones cubes section */}
        {ones > 0 && (
          <g transform={`translate(${displayTens * (rodWidth + gap) + 20}, 2)`}>
            {Array.from({ length: ones }).map((_, idx) => renderOnesCube(idx))}
          </g>
        )}
      </svg>
    </div>
  );
}
