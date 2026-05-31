import React from 'react';

export default function NumberLine({ 
  min = 30, 
  max = 50, 
  marked = [], 
  jumps = [], // Array of { from, to, label, color }
  activeValue = null
}) {
  const width = 650;
  const height = 160;
  const padding = 45;
  const yLine = 100;

  // Convert number line value to SVG X coordinate
  const getX = (val) => {
    const range = max - min;
    const ratio = (val - min) / range;
    return padding + ratio * (width - 2 * padding);
  };

  // Generate tick marks
  const ticks = [];
  const range = max - min;
  
  // Decide tick spacing based on range size to avoid overlaps
  const step = range <= 15 ? 1 : range <= 40 ? 2 : 5;
  const labelStep = range <= 15 ? 2 : range <= 40 ? 5 : 10;

  for (let i = min; i <= max; i += step) {
    ticks.push({
      value: i,
      x: getX(i),
      hasLabel: i === min || i === max || i % labelStep === 0 || marked.includes(i)
    });
  }

  // Draw curved jump path (Quadratic Bezier Curve)
  const renderJump = (jump, idx) => {
    const xStart = getX(jump.from);
    const xEnd = getX(jump.to);
    const xMid = (xStart + xEnd) / 2;
    
    // Height of the hop increases slightly with jump distance
    const hopDist = Math.abs(xEnd - xStart);
    const arcHeight = Math.min(65, 30 + hopDist * 0.15);
    const yPeak = yLine - arcHeight;

    // Bezier control point: directly above center
    const pathData = `M ${xStart} ${yLine} Q ${xMid} ${yPeak} ${xEnd} ${yLine}`;
    const strokeColor = jump.color || "#4CAF50";

    return (
      <g key={`jump-${idx}`} className="number-line-jump">
        {/* Animated Bezier Arc */}
        <path 
          d={pathData} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="3.5" 
          strokeLinecap="round"
          className="jump-path-draw"
          style={{ strokeDasharray: 300, strokeDashoffset: 0 }}
        />
        
        {/* Glow behind the arc */}
        <path 
          d={pathData} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="8" 
          strokeLinecap="round"
          opacity="0.15"
        />

        {/* Small Arrowhead at end */}
        <path 
          d={`M ${xEnd - 8} ${yLine - 6} L ${xEnd} ${yLine} L ${xEnd - 8} ${yLine + 6}`} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="2.5" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Jump Value Label Bubble (+3, +10, etc.) */}
        <g transform={`translate(${xMid}, ${yPeak - 16})`}>
          <rect 
            x="-21" 
            y="-12" 
            width="42" 
            height="24" 
            rx="12" 
            fill={strokeColor} 
            stroke="#FFFFFF" 
            strokeWidth="1.5" 
            filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.15))"
          />
          <text 
            x="0" 
            y="5" 
            fill="#FFFFFF" 
            fontSize="13" 
            fontFamily="Fredoka"
            fontWeight="bold" 
            textAnchor="middle"
          >
            {jump.label}
          </text>
        </g>
      </g>
    );
  };

  return (
    <div className="number-line-wrapper">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        width="100%" 
        height="100%" 
        xmlns="http://www.w3.org/2000/svg"
        className="number-line-svg"
      >
        {/* Main horizontal line */}
        <line 
          x1={padding - 10} 
          y1={yLine} 
          x2={width - padding + 10} 
          y2={yLine} 
          stroke="#90A4AE" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />

        {/* Left Arrowhead */}
        <path 
          d={`M ${padding - 18} ${yLine - 6} L ${padding - 24} ${yLine} L ${padding - 18} ${yLine + 6}`} 
          fill="none" 
          stroke="#90A4AE" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Right Arrowhead */}
        <path 
          d={`M ${width - padding + 18} ${yLine - 6} L ${width - padding + 24} ${yLine} L ${width - padding + 18} ${yLine + 6}`} 
          fill="none" 
          stroke="#90A4AE" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Ticks and Labels */}
        {ticks.map((tick) => {
          const isMarked = marked.includes(tick.value);
          const isActive = activeValue === tick.value;
          
          return (
            <g key={`tick-${tick.value}`} className="number-line-tick">
              {/* Tick line */}
              <line 
                x1={tick.x} 
                y1={yLine - (isMarked || isActive ? 8 : 4)} 
                x2={tick.x} 
                y2={yLine + (isMarked || isActive ? 8 : 4)} 
                stroke={isActive ? "#FFB300" : isMarked ? "#4CAF50" : "#B0BEC5"} 
                strokeWidth={isMarked || isActive ? "2.5" : "1.5"} 
              />
              
              {/* Label */}
              {tick.hasLabel && (
                <text 
                  x={tick.x} 
                  y={yLine + 32} 
                  fill={isActive ? "#FFB300" : isMarked ? "#4CAF50" : "#B0BEC5"} 
                  fontSize={isMarked || isActive ? "16" : "13"} 
                  fontFamily="Fredoka"
                  fontWeight={isMarked || isActive ? "bold" : "medium"}
                  textAnchor="middle"
                >
                  {tick.value}
                </text>
              )}

              {/* Special Flags for marked checkpoints */}
              {isMarked && (
                <g transform={`translate(${tick.x}, ${yLine - 10})`}>
                  <circle cx="0" cy="0" r="4.5" fill="#4CAF50" stroke="#FFFFFF" strokeWidth="1.5" />
                </g>
              )}

              {/* Glowing ring for active focus point */}
              {isActive && (
                <g transform={`translate(${tick.x}, ${yLine})`}>
                  <circle cx="0" cy="0" r="9" fill="none" stroke="#FFB300" strokeWidth="2.5" opacity="0.8" className="pulse-glow-ring" />
                  <circle cx="0" cy="0" r="4" fill="#FFB300" />
                </g>
              )}
            </g>
          );
        })}

        {/* Dynamic bezier jumps rendered here */}
        {jumps.map((jump, idx) => renderJump(jump, idx))}
      </svg>
    </div>
  );
}
