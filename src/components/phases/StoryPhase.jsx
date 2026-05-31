import React, { useEffect } from 'react';
import Mascot from '../shared/Mascot';
import PlaceValueBlocks from '../shared/PlaceValueBlocks';
import NumberLine from '../shared/NumberLine';
import HundredsChart from '../shared/HundredsChart';
import BalanceScale from '../shared/BalanceScale';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { storyPanels } from '../../data/storyContent';
import { narrate, stopNarration } from '../../utils/audio';
import * as narrations from '../../utils/narration';

export default function StoryPhase({ 
  storyPanel = 0, 
  audioEnabled = true, 
  onNextPanel, 
  onPrevPanel, 
  onComplete 
}) {
  const activePanel = storyPanels[storyPanel] || storyPanels[0];

  // Narration synchronization hook on panel changes
  useEffect(() => {
    if (!audioEnabled) return;
    
    let segment = [];
    switch (storyPanel) {
      case 0:
        segment = narrations.storyPanel1Narration();
        break;
      case 1:
        segment = narrations.storyPanel2Narration();
        break;
      case 2:
        segment = narrations.storyStrategy1Narration();
        break;
      case 3:
        segment = narrations.storyStrategy2Narration();
        break;
      case 4:
        segment = narrations.storyStrategy3Narration();
        break;
      case 5:
        segment = narrations.storyStrategy4Narration();
        break;
      case 6:
        segment = narrations.storyCloseNarration();
        break;
      default:
        break;
    }
    
    if (segment.length > 0) {
      narrate(segment, true);
    }
    
    return () => stopNarration();
  }, [audioEnabled, storyPanel]);

  // Renders the visual on top of the card
  const renderPanelVisual = () => {
    switch (activePanel.strategy) {
      case 'decompose':
        return (
          <div className="story-single-visual-container animate-bounce-in">
            <h4 className="visual-example-title font-fredoka text-cyan-300">Example: 34 + 25</h4>
            <div className="story-block-comparison justify-center mt-2">
              <div>
                <span className="visual-badge-label font-fredoka">Start with 34</span>
                <PlaceValueBlocks tens={3} ones={4} size="sm" />
              </div>
              <div className="decompose-arrow-flow font-fredoka">➔</div>
              <div>
                <span className="visual-badge-label font-fredoka">Add 20, then add 5</span>
                <PlaceValueBlocks tens={2} ones={5} size="sm" type="to-add-tens" />
              </div>
            </div>
          </div>
        );
      case 'bridgeTen':
        return (
          <div className="story-single-visual-container animate-bounce-in">
            <h4 className="visual-example-title font-fredoka text-cyan-300">Example: 37 + 6</h4>
            <NumberLine 
              min={35} 
              max={45} 
              marked={[37, 40, 43]} 
              jumps={[
                { from: 37, to: 40, label: "+3", color: "#4CAF50" },
                { from: 40, to: 43, label: "+3", color: "#FF9800" }
              ]}
              activeValue={43}
            />
          </div>
        );
      case 'hundredsChart':
        return (
          <div className="story-single-visual-container animate-bounce-in flex flex-col items-center justify-center">
            <h4 className="visual-example-title font-fredoka text-cyan-300">Example: 45 + 23</h4>
            <div className="story-hundreds-wrapper-scale mt-1">
              <HundredsChart 
                startCell={45}
                highlighted={new Set([55, 65, 66, 67, 68])}
                current={68}
              />
            </div>
          </div>
        );
      case 'compensate':
        return (
          <div className="story-single-visual-container animate-bounce-in">
            <h4 className="visual-example-title font-fredoka text-cyan-300">Example: 46 + 39</h4>
            <BalanceScale 
              leftValue={85} 
              rightValue={86} 
              leftLabel="46 + 39" 
              rightLabel="46 + 40" 
            />
          </div>
        );
      default:
        // Welcome and closing panel illustrations
        if (activePanel.image) {
          return (
            <div className="story-single-visual-image-box animate-fade-in">
              <img 
                src={activePanel.image} 
                alt={activePanel.title} 
                className="story-panel-full-img" 
              />
            </div>
          );
        }
        return (
          <div className="story-single-visual-container animate-fade-in flex flex-col items-center justify-center py-8">
            <BookOpen size={48} className="logo-icon-gold mb-2" />
            <span className="visual-badge-label font-fredoka text-yellow-400">MATH SHORTCUTS</span>
          </div>
        );
    }
  };

  return (
    <div className="phase-card-wrapper story-phase-container">
      {/* Banner */}
      <div className="phase-banner-header story-banner">
        <h2 className="phase-banner-title font-fredoka">PHASE 2: THE STORY 📖</h2>
        <span className="phase-banner-subtitle">Academy Storyboards: Secret Math Shortcuts</span>
      </div>

      {/* Main Single Card Story Layout */}
      <div className="story-single-card mascot-bubble-glow">
        {/* Top visual section (image or graph) */}
        <div className="story-card-top-visual">
          {renderPanelVisual()}
        </div>

        {/* Text narrative and title */}
        <div className="story-card-body-text">
          <h3 className="story-panel-title font-fredoka text-amber-400 mb-2">{activePanel.title}</h3>
          <p className="story-para-text font-nunito">{activePanel.text}</p>
          
          {/* Sparkly equation helper banner */}
          {activePanel.example && (
            <div className="story-sparkle-badge font-fredoka">
              ✨ "{activePanel.example.step1} ➔ {activePanel.example.step2}" ✨
            </div>
          )}

          {/* Coach Cooper / Leo / Lily Speech Avatar bubble */}
          <div className="story-avatar-speech-bubble mt-4">
            <div className="avatar-circle-box">
              <Mascot mood={activePanel.mascotMood || "idle"} />
            </div>
            <div className="speech-text-bubble font-nunito">
              {activePanel.strategy ? "Try decomposing the steps mentally first!" : "Let's learn together!"}
            </div>
          </div>
        </div>
      </div>

      {/* Navigator controls beneath the card */}
      <div className="story-card-navigation-bar">
        <button 
          className="story-round-nav-btn btn-grey font-fredoka"
          onClick={onPrevPanel}
          disabled={storyPanel === 0}
          aria-label="Back to previous panel"
        >
          ← Back
        </button>

        {/* 7 Progress bullet dots */}
        <div className="story-progress-dots">
          {storyPanels.map((_, idx) => (
            <div 
              key={idx} 
              className={`story-dot ${idx === storyPanel ? 'dot-active' : ''}`} 
            />
          ))}
        </div>

        {storyPanel < 6 ? (
          <button 
            className="story-round-nav-btn btn-yellow font-fredoka"
            onClick={onNextPanel}
            aria-label="Advance to next panel"
          >
            Next →
          </button>
        ) : (
          <button 
            className="story-round-nav-btn btn-green font-fredoka"
            onClick={onComplete}
            aria-label="Proceed to Phase 3, the Simulation sandbox"
          >
            ENTER SANDBOX ➔
          </button>
        )}
      </div>
    </div>
  );
}
