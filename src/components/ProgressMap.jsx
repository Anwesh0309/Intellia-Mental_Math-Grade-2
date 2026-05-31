import React from 'react';
import { Volume2, VolumeX, Home, X } from 'lucide-react';

const PHASES = [
  { id: 'wonder', label: 'Wonder' },
  { id: 'story', label: 'Story' },
  { id: 'simulate', label: 'Simulate' },
  { id: 'play', label: 'Play' },
  { id: 'reflect', label: 'Reflect' }
];

export default function ProgressMap({ 
  currentPhase, 
  phaseComplete = {}, 
  xp = 0, 
  streak = 0,
  audioEnabled = true, 
  onToggleAudio, 
  onJumpToPhase 
}) {
  const getPhaseIndex = (phaseId) => PHASES.findIndex(p => p.id === phaseId);
  const activeIdx = getPhaseIndex(currentPhase);

  return (
    <header className="progress-map-header">
      {/* Top Left: Home Button */}
      <button 
        onClick={() => onJumpToPhase && onJumpToPhase('intro')}
        className="header-home-btn"
        aria-label="Return to Intro Academy screen"
      >
        <Home size={18} />
        <span>Home</span>
      </button>

      {/* Center: Interactive progress node dots */}
      <div className="progress-tracker-bar" aria-label="Lesson phase progression map">
        {PHASES.map((ph, idx) => {
          const isCurrent = currentPhase === ph.id;
          const isPassed = activeIdx > idx;
          const isDone = phaseComplete[ph.id];

          // Determine lock/unlock status sequentially:
          let isUnlocked = false;
          if (idx === 0) {
            isUnlocked = true;
          } else {
            const prevPhaseId = PHASES[idx - 1].id;
            isUnlocked = phaseComplete[prevPhaseId] === true;
          }

          // Classes
          let circleClass = "progress-circle-node";
          if (isCurrent) circleClass += " circle-active";
          else if (isPassed || isDone) circleClass += " circle-completed";
          else circleClass += " circle-locked";

          let textClass = "progress-text-node";
          if (isCurrent || isPassed || isDone) textClass += " text-active font-fredoka";
          else textClass += " text-locked font-fredoka";

          return (
            <React.Fragment key={ph.id}>
              <button 
                className="progress-step-button"
                disabled={!isUnlocked}
                onClick={() => isUnlocked && onJumpToPhase && onJumpToPhase(ph.id)}
                aria-label={`Jump to phase ${ph.label}`}
              >
                <div className={circleClass}>
                  {isDone || isPassed ? "✓" : `0${idx + 1}`}
                </div>
                <span className={textClass}>{ph.label}</span>
              </button>
              
              {/* Connector line between dots */}
              {idx < PHASES.length - 1 && (
                <div 
                  className={`progress-line-separator ${activeIdx > idx || phaseComplete[ph.id] ? 'line-filled' : ''}`} 
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Top Right: Actions & Exit */}
      <div className="header-right-actions">
        {/* Audio Narration Toggle */}
        <button 
          onClick={onToggleAudio}
          className={`audio-toggle-btn ${audioEnabled ? 'audio-active' : 'audio-muted'}`}
          aria-label={audioEnabled ? "Mute audio narration" : "Unmute audio narration"}
        >
          {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span className="audio-btn-txt">{audioEnabled ? "Voice ON" : "Voice OFF"}</span>
        </button>

        {/* Close Button */}
        <button 
          onClick={() => onJumpToPhase && onJumpToPhase('intro')}
          className="header-close-btn"
          aria-label="Exit current phase to Academy screen"
        >
          <X size={20} />
        </button>
      </div>
    </header>
  );
}
