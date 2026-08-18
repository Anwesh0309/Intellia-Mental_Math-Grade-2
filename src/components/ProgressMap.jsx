import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const STEPS = [
  { id: 'wonder', label: 'Wonder', num: '01', icon: '🔍' },
  { id: 'story', label: 'Story', num: '02', icon: '📖' },
  { id: 'simulate', label: 'Simulate', num: '03', icon: '🧪' },
  { id: 'play', label: 'Practice', num: '04', icon: '🎮' },
  { id: 'reflect', label: 'Reflect', num: '05', icon: '📝' },
];

const ORDER = ['intro', 'wonder', 'story', 'simulate', 'play', 'practice', 'reflect', 'results'];

export default function ProgressMap({
  currentPhase,
  phaseComplete = {},
  onSelectPhase,
  onJumpToPhase,
  audioEnabled = true,
  onToggleAudio
}) {
  const phaseIdx = ORDER.indexOf(currentPhase);

  const handlePhaseChange = (phaseId) => {
    if (onSelectPhase) onSelectPhase(phaseId);
    else if (onJumpToPhase) onJumpToPhase(phaseId);
  };

  return (
    <header
      className="progress-map-header animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0.65rem 1.25rem',
        position: 'relative',
        zIndex: 1000,
        background: 'transparent',
      }}
    >
      {/* Left Group: Home Button + Learning Journey Nav Steps right beside it */}
      <div
        className="nav-bar-left-group"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(0.6rem, 1.5vw, 1.1rem)',
          flexWrap: 'nowrap'
        }}
      >
        {/* Top Left: Home (Intro) Pill Button */}
        <button
          onClick={() => handlePhaseChange('intro')}
          className="header-home-btn font-fredoka"
          aria-label="Return to Intro screen"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(30, 20, 60, 0.9)',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '20px',
            padding: '0.45rem 1.1rem',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: '1.0rem' }}>🏠</span>
          <span>Home</span>
        </button>

        {/* Learning Journey Steps: Wonder - Story - Simulate - Practice - Reflect */}
        <nav
          aria-label="Learning journey progress"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(4px, 2vw, 8px)',
            justifyContent: 'flex-start',
            background: 'transparent',
            borderRadius: 100,
            padding: '4px 8px',
            flexShrink: 0,
          }}
        >
          {STEPS.map((step, i) => {
            const stepIdx = ORDER.indexOf(step.id);
            const isActive = currentPhase === step.id;
            const isComplete = phaseComplete?.[step.id] || stepIdx < phaseIdx;

            /* Circle styles */
            const circleBg = isActive
              ? '#facc15'
              : isComplete
                ? '#22c55e'
                : 'rgba(255, 255, 255, 0.15)';
            const circleColor = isActive
              ? '#0f0a2e'
              : isComplete
                ? '#fff'
                : '#fff';
            const circleBorder = (isActive || isComplete)
              ? 'none'
              : '1px solid rgba(255, 255, 255, 0.3)';

            /* Label styles */
            const labelColor = isActive
              ? '#facc15'
              : isComplete
                ? '#fff'
                : 'rgba(255, 255, 255, 0.8)';
            const labelWeight = isActive ? 900 : 800;

            return (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(3px, 0.8vw, 6px)' }}>
                {/* Step node button */}
                <button
                  onClick={() => handlePhaseChange(step.id)}
                  aria-label={`Go to ${step.label} phase`}
                  title={`Switch to ${step.label}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    background: 'transparent',
                    border: 'none',
                    padding: '3px 5px',
                    borderRadius: 20,
                    cursor: 'pointer',
                    transition: 'transform 0.2s, opacity 0.2s',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {/* Numbered circle */}
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: circleBg,
                    border: circleBorder,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Fredoka, sans-serif', fontWeight: 900,
                    fontSize: 11, color: circleColor,
                    flexShrink: 0,
                    transition: 'all 0.3s',
                    boxShadow: isActive ? '0 0 10px rgba(250, 204, 21, 0.5)' : 'none',
                  }}>
                    {isComplete ? '✓' : step.num}
                  </div>

                  {/* Icon & Label */}
                  <span style={{
                    fontFamily: 'Fredoka, sans-serif',
                    fontWeight: labelWeight,
                    fontSize: 'clamp(12px, 1.4vw, 15px)',
                    color: labelColor,
                    whiteSpace: 'nowrap',
                    transition: 'color 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}>
                    {step.icon && <span>{step.icon}</span>}
                    <span>{step.label}</span>
                  </span>
                </button>

                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    width: 'clamp(8px, 1.5vw, 18px)',
                    height: 1.5,
                    background: isComplete || (isActive && ORDER.indexOf(STEPS[i + 1].id) <= phaseIdx)
                      ? 'rgba(34, 197, 94, 0.7)'
                      : 'rgba(255, 255, 255, 0.25)',
                    flexShrink: 0,
                    transition: 'background 0.3s',
                  }} />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Right Group: Audio Toggle Button */}
      {onToggleAudio && (
        <button
          onClick={onToggleAudio}
          className={`audio-toggle-btn ${audioEnabled ? 'audio-active' : 'audio-muted'}`}
          aria-label={audioEnabled ? "Mute audio narration" : "Unmute audio narration"}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: audioEnabled ? 'rgba(124, 77, 255, 0.5)' : 'rgba(124, 77, 255, 0.25)',
            border: '1.5px solid #7C4DFF',
            borderRadius: '18px',
            padding: '0.4rem 1rem',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(124, 77, 255, 0.25)',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span className="audio-btn-txt font-fredoka">{audioEnabled ? "Voice ON" : "Voice OFF"}</span>
        </button>
      )}
    </header>
  );
}