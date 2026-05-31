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

  // Render a Single Tens Rod (a blue rectangle divided into 10 smaller parts)
  const renderTensRod = (index, isInteractivePart = false) => {
    const x = index * (rodWidth + gap);
    const segmentHeight = rodHeight / 10;
    const segments = Array.from({ length: 10 });

    return (
      <g 
        key={`tens-${index}`} 
        className={`tens-rod-group ${interactive && !disabled ? 'interactive-block' : ''}`}
        onClick={() => {
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
          fill="#4A90D9" 
          stroke="#2E6DB4" 
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
              stroke="#2E6DB4" 
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

  // Render a Single Ones Cube (a small yellow square)
  const renderOnesCube = (index, isInteractivePart = false) => {
    // Layout ones cubes in a nice compact vertical grid of up to 5 in a row
    const row = index % 5;
    const col = Math.floor(index / 5);
    const x = col * (cubeSize + gap);
    const y = row * (cubeSize + gap);

    return (
      <g 
        key={`ones-${index}`} 
        className={`ones-cube-group ${interactive && !disabled ? 'interactive-block' : ''}`}
        onClick={() => {
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
          fill="#FFB300" 
          stroke="#F57C00" 
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
  const maxTensWidth = Math.max(1, tens) * (rodWidth + gap);
  const maxOnesColCount = Math.max(1, Math.ceil(ones / 5));
  const maxOnesWidth = maxOnesColCount * (cubeSize + gap);
  
  const width = Math.max(80, maxTensWidth + maxOnesWidth + 30);
  const height = Math.max(rodHeight + 5, 5 * (cubeSize + gap) + 5);

  return (
    <div className={`place-value-container blocks-${type}`}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        width="100%" 
        height="100%" 
        className="blocks-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tens rods section */}
        <g transform="translate(5, 2)">
          {Array.from({ length: tens }).map((_, idx) => renderTensRod(idx, type.startsWith('to-add')))}
        </g>

        {/* Ones cubes section - right shifted relative to rods */}
        <g transform={`translate(${Math.max(1, tens) * (rodWidth + gap) + 20}, 2)`}>
          {Array.from({ length: ones }).map((_, idx) => renderOnesCube(idx, type.startsWith('to-add')))}
        </g>
      </svg>
    </div>
  );
}
