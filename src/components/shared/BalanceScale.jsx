import React from 'react';

export default function BalanceScale({ 
  leftValue = 50, 
  rightValue = 50, 
  leftLabel = "Original", 
  rightLabel = "Rounded" 
}) {
  // Calculate tilt angle based on values
  // Negative values tilt to the left, positive to the right
  const diff = rightValue - leftValue;
  const maxTilt = 15; // Maximum degrees rotation
  
  // Calculate angle proportionally, clamped between -maxTilt and maxTilt
  let angle = 0;
  if (diff !== 0) {
    angle = Math.max(-maxTilt, Math.min(maxTilt, diff * 3));
  }

  // Width/height definitions
  const width = 300;
  const height = 180;
  const cx = width / 2;
  const cy = height - 120; // Pivot point: (150, 60)

  // Coordinates of the beam ends based on tilt rotation
  const beamLength = 180;
  const halfBeam = beamLength / 2;
  
  const rad = (angle * Math.PI) / 180;
  const dx = halfBeam * Math.cos(rad);
  const dy = halfBeam * Math.sin(rad);

  const leftEnd = { x: cx - dx, y: cy - dy };
  const rightEnd = { x: cx + dx, y: cy + dy };

  // Pan coordinates (suspended vertically below the beam ends)
  const panSuspension = 40;
  const panLeft = { x: leftEnd.x, y: leftEnd.y + panSuspension };
  const panRight = { x: rightEnd.x, y: rightEnd.y + panSuspension };

  return (
    <div className="balance-scale-wrapper" aria-label={`Balance scale comparing original equation value ${leftValue} with rounded value ${rightValue}`}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        width="100%" 
        height="100%" 
        xmlns="http://www.w3.org/2000/svg"
        className="balance-scale-svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="metalSilver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B0BEC5" />
            <stop offset="50%" stopColor="#ECEFF1" />
            <stop offset="100%" stopColor="#78909C" />
          </linearGradient>
          <linearGradient id="scaleBase" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#37474F" />
            <stop offset="100%" stopColor="#263238" />
          </linearGradient>
        </defs>

        {/* Central Stand Column */}
        <rect x={cx - 6} y={cy} width="12" height="100" fill="url(#metalSilver)" stroke="#455A64" strokeWidth="1" />
        
        {/* Support Pillar Pivot point */}
        <circle cx={cx} cy={cy} r="10" fill="#37474F" stroke="#263238" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="4" fill="#FFB300" />

        {/* Scaled Base Pedestal */}
        <path d={`M ${cx - 40} ${height - 20} L ${cx + 40} ${height - 20} L ${cx + 30} ${height - 5} L ${cx - 30} ${height - 5} Z`} fill="url(#scaleBase)" stroke="#212121" strokeWidth="1.5" />

        {/* Pivoting Horizontal Beam Arm */}
        <line 
          x1={leftEnd.x} 
          y1={leftEnd.y} 
          x2={rightEnd.x} 
          y2={rightEnd.y} 
          stroke="url(#metalSilver)" 
          strokeWidth="6" 
          strokeLinecap="round"
          style={{ transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)' }}
        />

        {/* Left Pan Suspension Cables */}
        <path 
          d={`M ${leftEnd.x} ${leftEnd.y} L ${panLeft.x - 20} ${panLeft.y} M ${leftEnd.x} ${leftEnd.y} L ${panLeft.x + 20} ${panLeft.y}`} 
          stroke="#78909C" 
          strokeWidth="1.5" 
          style={{ transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)' }}
        />
        
        {/* Left Pan Plate */}
        <path 
          d={`M ${panLeft.x - 25} ${panLeft.y} Q ${panLeft.x} ${panLeft.y + 10} ${panLeft.x + 25} ${panLeft.y} Z`} 
          fill="#4A90D9" 
          stroke="#2E6DB4" 
          strokeWidth="2" 
          style={{ transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)' }}
        />

        {/* Right Pan Suspension Cables */}
        <path 
          d={`M ${rightEnd.x} ${rightEnd.y} L ${panRight.x - 20} ${panRight.y} M ${rightEnd.x} ${rightEnd.y} L ${panRight.x + 20} ${panRight.y}`} 
          stroke="#78909C" 
          strokeWidth="1.5" 
          style={{ transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)' }}
        />
        
        {/* Right Pan Plate */}
        <path 
          d={`M ${panRight.x - 25} ${panRight.y} Q ${panRight.x} ${panRight.y + 10} ${panRight.x + 25} ${panRight.y} Z`} 
          fill={diff === 0 ? "#4CAF50" : "#FF6B6B"} 
          stroke={diff === 0 ? "#2E7D32" : "#E53935"} 
          strokeWidth="2" 
          style={{ transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)' }}
        />

        {/* Values Labels inside/above the pans */}
        <g transform={`translate(${panLeft.x}, ${panLeft.y - 12})`} style={{ transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)' }}>
          <rect x="-24" y="-12" width="48" height="18" rx="4" fill="#FFFFFF" stroke="#4A90D9" strokeWidth="1" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.1))" />
          <text x="0" y="1" fill="#2E6DB4" fontSize="10" fontFamily="Fredoka" fontWeight="bold" textAnchor="middle">
            {leftValue}
          </text>
          <text x="0" y="32" fill="#81D4FA" fontSize="9" fontFamily="Fredoka" fontWeight="bold" textAnchor="middle">
            {leftLabel}
          </text>
        </g>

        <g transform={`translate(${panRight.x}, ${panRight.y - 12})`} style={{ transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)' }}>
          <rect x="-24" y="-12" width="48" height="18" rx="4" fill="#FFFFFF" stroke={diff === 0 ? "#4CAF50" : "#FF6B6B"} strokeWidth="1" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.1))" />
          <text x="0" y="1" fill={diff === 0 ? "#2E7D32" : "#D32F2F"} fontSize="10" fontFamily="Fredoka" fontWeight="bold" textAnchor="middle">
            {rightValue}
          </text>
          <text x="0" y="32" fill={diff === 0 ? "#A5D6A7" : "#FFAB91"} fontSize="9" fontFamily="Fredoka" fontWeight="bold" textAnchor="middle">
            {rightLabel}
          </text>
        </g>

        {/* Equilibrium Indicator (center top pivot pointer arrow) */}
        <path 
          d={`M ${cx} ${cy - 12} L ${cx + (angle * 0.8)} ${cy - 35}`} 
          stroke="#E53935" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          style={{ transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)' }}
        />
        <circle cx={cx} cy={cy - 38} r="2.5" fill="#E53935" />
      </svg>
    </div>
  );
}
