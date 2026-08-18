import React from 'react';

export default function NumberLine({ 
  min = 30, 
  max = 50, 
  marked = [], 
  jumps = [], // Array of { from, to, label, color }
  activeValue = null
}) {
  const width = 680;
  const height = 190;
  const padding = 50;
  const yLine = 120;

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
    const arcHeight = Math.min(75, 35 + hopDist * 0.16);
    const yPeak = yLine - arcHeight;

    // Bezier control point: directly above center
    const pathData = `M ${xStart} ${yLine} Q ${xMid} ${yPeak} ${xEnd} ${yLine}`;
    const strokeColor = jump.color || "#4DD0E1";

    return (
      <g key={`jump-${idx}`} className="number-line-jump">
        {/* Animated Bezier Arc */}
        <path 
          d={pathData} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="6" 
          strokeLinecap="round"
          className="jump-path-draw"
          style={{ strokeDasharray: 400, strokeDashoffset: 0 }}
        />
        
        {/* Glow behind the arc */}
        <path 
          d={pathData} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="12" 
          strokeLinecap="round"
          opacity="0.22"
        />

        {/* Arrowhead at end */}
        <path 
          d={`M ${xEnd - 10} ${yLine - 8} L ${xEnd} ${yLine} L ${xEnd - 10} ${yLine + 8}`} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="4" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Jump Value Label Bubble (+3, +10, etc.) */}
        <g transform={`translate(${xMid}, ${yPeak - 20})`}>
          <rect 
            x="-26" 
            y="-15" 
            width="52" 
            height="30" 
            rx="15" 
            fill={strokeColor} 
            stroke="#FFFFFF" 
            strokeWidth="2.5" 
            filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.25))"
          />
          <text 
            x="0" 
            y="6" 
            fill="#FFFFFF" 
            fontSize="17" 
            fontFamily="Fredoka"
            fontWeight="900" 
            textAnchor="middle"
          >
            {jump.label}
          </text>
        </g>
      </g>
    );
  };

  return (
    <div className="number-line-wrapper" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        width="100%" 
        height="100%" 
        xmlns="http://www.w3.org/2000/svg"
        className="number-line-svg"
      >
        {/* Main horizontal line / bar */}
        <line 
          x1={padding - 10} 
          y1={yLine} 
          x2={width - padding + 10} 
          y2={yLine} 
          stroke="#B0BEC5" 
          strokeWidth="7" 
          strokeLinecap="round" 
        />

        {/* Left Arrowhead */}
        <path 
          d={`M ${padding - 20} ${yLine - 8} L ${padding - 28} ${yLine} L ${padding - 20} ${yLine + 8}`} 
          fill="none" 
          stroke="#B0BEC5" 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Right Arrowhead */}
        <path 
          d={`M ${width - padding + 20} ${yLine - 8} L ${width - padding + 28} ${yLine} L ${width - padding + 20} ${yLine + 8}`} 
          fill="none" 
          stroke="#B0BEC5" 
          strokeWidth="5" 
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
                y1={yLine - (isMarked || isActive ? 12 : 7)} 
                x2={tick.x} 
                y2={yLine + (isMarked || isActive ? 12 : 7)} 
                stroke={isActive ? "#FFC72C" : isMarked ? "#4DD0E1" : "#CFD8DC"} 
                strokeWidth={isMarked || isActive ? "4" : "2.5"} 
              />
              
              {/* Label */}
              {tick.hasLabel && (
                <text 
                  x={tick.x} 
                  y={yLine + 36} 
                  fill={isActive ? "#FFC72C" : isMarked ? "#4DD0E1" : "#E2D8FF"} 
                  fontSize={isMarked || isActive ? "20" : "16"} 
                  fontFamily="Fredoka"
                  fontWeight={isMarked || isActive ? "900" : "700"}
                  textAnchor="middle"
                >
                  {tick.value}
                </text>
              )}

              {/* Special Flags for marked checkpoints */}
              {isMarked && (
                <g transform={`translate(${tick.x}, ${yLine - 14})`}>
                  <circle cx="0" cy="0" r="6" fill="#4DD0E1" stroke="#FFFFFF" strokeWidth="2" />
                </g>
              )}

              {/* Glowing ring for active focus point */}
              {isActive && (
                <g transform={`translate(${tick.x}, ${yLine})`}>
                  <circle cx="0" cy="0" r="14" fill="none" stroke="#FFC72C" strokeWidth="3.5" opacity="0.9" className="pulse-glow-ring" />
                  <circle cx="0" cy="0" r="6.5" fill="#FFC72C" />
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
