import React from 'react';

const BELT_COLORS = [
  "#FFFFFF", // 0: White Belt
  "#FFEB3B", // 1: Yellow Belt
  "#FF9800", // 2: Orange Belt
  "#4CAF50", // 3: Green Belt
  "#2196F3", // 4: Blue Belt
  "#9C27B0", // 5: Purple Belt
  "#E91E63", // 6: Red Belt
  "#795548", // 7: Brown Belt
  "#212121", // 8: Black Belt
  "#FFD700"  // 9: Gold Belt
];

const BELT_LABELS = [
  "White Belt", "Yellow Belt", "Orange Belt", "Green Belt", "Blue Belt", 
  "Purple Belt", "Red Belt", "Brown Belt", "Black Belt", "Gold Belt"
];

export default function Mascot({ mood = 'idle', belt = 0 }) {
  const beltColor = BELT_COLORS[belt] || BELT_COLORS[0];
  const beltLabel = BELT_LABELS[belt] || BELT_LABELS[0];

  // Helper to get facial expressions based on mood
  const getFaceExpression = () => {
    switch (mood) {
      case 'happy':
      case 'celebrating':
        return (
          <>
            {/* Happy curved eyes */}
            <path d="M 22 28 Q 28 20 34 28" stroke="#00E5FF" strokeWidth="4" fill="none" strokeLinecap="round" className="mascot-blink" />
            <path d="M 46 28 Q 52 20 58 28" stroke="#00E5FF" strokeWidth="4" fill="none" strokeLinecap="round" className="mascot-blink" />
            {/* W-shaped smile */}
            <path d="M 32 38 Q 36 44 40 38 Q 44 44 48 38" stroke="#00E5FF" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'thinking':
        return (
          <>
            {/* Skeptical or concentrated eyebrows/eyes */}
            <line x1="20" y1="20" x2="32" y2="23" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round" />
            <line x1="48" y1="23" x2="60" y2="20" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round" />
            <circle cx="26" cy="28" r="3.5" fill="#00E5FF" />
            <circle cx="54" cy="28" r="3.5" fill="#00E5FF" />
            {/* Straight thinking mouth */}
            <line x1="33" y1="39" x2="47" y2="39" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round" />
          </>
        );
      case 'teaching':
        return (
          <>
            {/* Attentive open eyes */}
            <ellipse cx="26" cy="27" rx="5" ry="4" fill="#00E5FF" />
            <ellipse cx="54" cy="27" rx="5" ry="4" fill="#00E5FF" />
            <path d="M 22 20 Q 26 18 30 20" stroke="#00E5FF" strokeWidth="2.5" fill="none" />
            <path d="M 50 20 Q 54 18 58 20" stroke="#00E5FF" strokeWidth="2.5" fill="none" />
            {/* O-shaped talking mouth */}
            <circle cx="40" cy="38" r="4.5" stroke="#00E5FF" strokeWidth="3" fill="none" />
          </>
        );
      case 'curious':
        return (
          <>
            {/* Left eye wider, right eye squinting */}
            <circle cx="26" cy="26" r="6" fill="#00E5FF" />
            <ellipse cx="54" cy="29" rx="4" ry="2" fill="#00E5FF" />
            {/* Raised left eyebrow */}
            <path d="M 18 16 Q 26 13 32 18" stroke="#00E5FF" strokeWidth="2.5" fill="none" />
            {/* Asymmetrical curious smile */}
            <path d="M 33 39 Q 42 43 47 37" stroke="#00E5FF" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'idle':
      default:
        return (
          <>
            {/* Standard circular glowing eyes */}
            <circle cx="26" cy="27" r="4.5" fill="#00E5FF" className="mascot-eyes-pulse" />
            <circle cx="54" cy="27" r="4.5" fill="#00E5FF" className="mascot-eyes-pulse" />
            {/* Small simple happy mouth */}
            <path d="M 34 38 Q 40 43 46 38" stroke="#00E5FF" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        );
    }
  };

  return (
    <div className={`mascot-container mascot-${mood}`} aria-label={`Coach LearnFlow in ${mood} state wearing a ${beltLabel}`}>
      <svg viewBox="0 0 100 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Head & Body Gradients */}
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C4DFF" />
            <stop offset="100%" stopColor="#693BE3" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E1147" />
            <stop offset="100%" stopColor="#2C1B69" />
          </linearGradient>
          {/* Metal Highlights */}
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#CFD8DC" />
            <stop offset="50%" stopColor="#ECEFF1" />
            <stop offset="100%" stopColor="#B0BEC5" />
          </linearGradient>
          {/* Glowing Shadow filter */}
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Antennas */}
        <path d="M 40 20 L 35 5 Q 33 2 35 1" stroke="url(#metalGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx="35" cy="2" r="4.5" fill="#FFC72C" className={mood === 'celebrating' ? 'mascot-antenna-glow' : ''} />
        
        <path d="M 60 20 L 65 5 Q 67 2 65 1" stroke="url(#metalGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx="65" cy="2" r="4.5" fill="#FFC72C" className={mood === 'celebrating' ? 'mascot-antenna-glow' : ''}/>

        {/* Ears / Side Bolt Connectors */}
        <rect x="5" y="28" width="8" height="16" rx="4" fill="url(#metalGrad)" />
        <rect x="87" y="28" width="8" height="16" rx="4" fill="url(#metalGrad)" />

        {/* Head Shell */}
        <rect x="10" y="15" width="80" height="42" rx="20" fill="url(#bodyGrad)" stroke="#5936B3" strokeWidth="2.5" />

        {/* Digital Screen Face */}
        <rect x="18" y="21" width="64" height="30" rx="12" fill="url(#screenGrad)" stroke="#7C4DFF" strokeWidth="2" />
        
        {/* Glow behind screen text/features */}
        <g filter="url(#cyanGlow)">
          {getFaceExpression()}
        </g>

        {/* Neck */}
        <rect x="42" y="56" width="16" height="10" rx="3" fill="url(#metalGrad)" stroke="#90A4AE" strokeWidth="1.5" />

        {/* Arms */}
        {/* Left Arm */}
        <g className={mood === 'celebrating' ? 'mascot-left-arm-wave' : 'mascot-arm-idle'}>
          <path d="M 22 75 Q 5 75 10 90" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" fill="none" />
          <circle cx="10" cy="90" r="6.5" fill="url(#metalGrad)" />
        </g>
        
        {/* Right Arm */}
        <g className={mood === 'teaching' ? 'mascot-right-arm-point' : mood === 'celebrating' ? 'mascot-right-arm-wave' : 'mascot-arm-idle'}>
          <path d="M 78 75 Q 95 75 90 90" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" fill="none" />
          <circle cx="90" cy="90" r="6.5" fill="url(#metalGrad)" />
        </g>

        {/* Body Chest */}
        <path d="M 22 66 L 78 66 L 70 106 L 30 106 Z" fill="url(#bodyGrad)" stroke="#5936B3" strokeWidth="2.5" />

        {/* Core Heart Light */}
        <circle cx="50" cy="83" r="8" fill="#1E1147" stroke="#7C4DFF" strokeWidth="1.5" />
        <circle cx="50" cy="83" r="5.5" fill="#00E5FF" className="mascot-core-pulse" />

        {/* Belt rank system - martial arts style wrapping body */}
        <g>
          {/* Belt loop around waist */}
          <rect x="31" y="93" width="38" height="9" fill={beltColor} stroke="#424242" strokeWidth="1.5" rx="1.5" />
          
          {/* Belt knot front tie */}
          <rect x="46" y="91" width="8" height="13" fill={beltColor} stroke="#424242" strokeWidth="1.5" rx="2" />
          
          {/* Hanging belt ribbons */}
          <path d="M 47 101 L 43 115 L 48 115 Z" fill={beltColor} stroke="#424242" strokeWidth="1.5" />
          <path d="M 52 101 L 56 116 L 51 116 Z" fill={beltColor} stroke="#424242" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}
