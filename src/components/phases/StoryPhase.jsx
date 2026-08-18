import React, { useEffect } from 'react';
import Mascot from '../shared/Mascot';
import PlaceValueBlocks from '../shared/PlaceValueBlocks';
import NumberLine from '../shared/NumberLine';
import HundredsChart from '../shared/HundredsChart';
import BalanceScale from '../shared/BalanceScale';
import { BookOpen } from 'lucide-react';
import { storyPanels } from '../../data/storyContent';
import { narrate, stopNarration } from '../../utils/audio';
import * as narrations from '../../utils/narration';

export default function StoryPhase({ 
  storyPanel = 0, 
  audioEnabled = true, 
  onNextPanel, 
  onPrevPanel, 
  onSelectPanel,
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

  // Renders the visual on the left side of the card matching screenshot
  const renderPanelVisual = () => {
    switch (activePanel.strategy) {
      case 'decompose':
        return (
          <div className="story-visual-left-box animate-bounce-in">
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
            <div className="story-visual-bottom-banner font-fredoka">
              ⭐ Strategy 1: Decompose ⭐
            </div>
          </div>
        );
      case 'bridgeTen':
        return (
          <div className="story-visual-left-box animate-bounce-in">
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
            <div className="story-visual-bottom-banner font-fredoka">
              ⭐ Strategy 2: Bridge to 10 ⭐
            </div>
          </div>
        );
      case 'hundredsChart':
        return (
          <div className="story-visual-left-box animate-bounce-in flex flex-col items-center justify-center">
            <h4 className="visual-example-title font-fredoka text-cyan-300">Example: 45 + 23</h4>
            <div className="story-hundreds-wrapper-scale mt-1">
              <HundredsChart 
                startCell={45}
                highlighted={new Set([55, 65, 66, 67, 68])}
                current={68}
              />
            </div>
            <div className="story-visual-bottom-banner font-fredoka">
              ⭐ Strategy 3: Hundreds Grid Jump ⭐
            </div>
          </div>
        );
      case 'compensate':
        return (
          <div className="story-visual-left-box animate-bounce-in">
            <h4 className="visual-example-title font-fredoka text-cyan-300">Example: 46 + 39</h4>
            <BalanceScale 
              leftValue={85} 
              rightValue={86} 
              leftLabel="46 + 39" 
              rightLabel="46 + 40" 
            />
            <div className="story-visual-bottom-banner font-fredoka">
              ⭐ Strategy 4: Compensation ⭐
            </div>
          </div>
        );
      default:
        // Welcome and closing panel illustrations
        if (activePanel.image) {
          return (
            <div className="story-visual-image-wrapper animate-fade-in">
              <img 
                src={activePanel.image} 
                alt={activePanel.title} 
                className="story-panel-full-img" 
              />
              <div className="story-visual-bottom-banner font-fredoka">
                ⭐ {activePanel.title} ⭐
              </div>
            </div>
          );
        }
        return (
          <div className="story-visual-left-box animate-fade-in flex flex-col items-center justify-center py-8">
            <BookOpen size={54} className="logo-icon-gold mb-3" />
            <span className="visual-badge-label font-fredoka text-yellow-400">MATH SHORTCUTS</span>
            <div className="story-visual-bottom-banner font-fredoka">
              ⭐ Story Mode ⭐
            </div>
          </div>
        );
    }
  };

  return (
    <div className="ss-story-page-container animate-fade-in">
      {/* Top thin progress bar matching screenshot */}
      <div className="ss-story-top-progress-bar-row">
        <div className="ss-story-progress-track">
          <div 
            className="ss-story-progress-fill" 
            style={{ width: `${((storyPanel + 1) / storyPanels.length) * 100}%` }}
          />
        </div>
        <span className="ss-story-step-count font-fredoka">
          {storyPanel + 1} / {storyPanels.length}
        </span>
      </div>

      {/* Main 2-Column Split Card matching screenshot */}
      <div className="ss-story-split-card animate-fade-in">
        {/* Left Visual Column */}
        <div className="ss-story-visual-column">
          {renderPanelVisual()}
        </div>

        {/* Right Content Column */}
        <div className="ss-story-content-column">
          <h3 className="ss-story-title font-fredoka">{activePanel.title}</h3>
          <p className="ss-story-text font-nunito">{activePanel.text}</p>
          
          {/* Highlight Callout Box matching screenshot */}
          {activePanel.example ? (
            <div className="ss-story-callout-box font-fredoka">
              ✨ "{activePanel.example.step1} ➔ {activePanel.example.step2}" ✨
            </div>
          ) : (
            <div className="ss-story-callout-box font-fredoka">
              ✨ "Master mental math shortcuts step by step!" ✨
            </div>
          )}

          {/* Mascot Yellow Circle Avatar + White Speech Bubble matching screenshot */}
          <div className="ss-story-mascot-row font-nunito">
            <div className="ss-story-mascot-circle">
              <Mascot mood={activePanel.mascotMood || "idle"} />
            </div>
            <div className="ss-story-speech-bubble font-nunito">
              <span>{activePanel.strategy ? "Try decomposing the steps mentally first!" : "Let's learn together! 🍎"}</span>
              <div className="ss-bubble-tail-left" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Controls Bar matching screenshot */}
      <div className="ss-story-bottom-nav">
        <button 
          className="ss-story-nav-btn ss-btn-back font-fredoka"
          onClick={onPrevPanel}
          disabled={storyPanel === 0}
          aria-label="Back to previous panel"
        >
          ← Back
        </button>

        {/* Clickable Progress Dots */}
        <div className="ss-story-dots-row">
          {storyPanels.map((_, idx) => (
            <button 
              key={idx} 
              type="button"
              onClick={() => onSelectPanel && onSelectPanel(idx)}
              className={`ss-story-dot ${idx === storyPanel ? 'dot-active' : ''}`}
              title={`Jump to panel ${idx + 1}`}
              aria-label={`Jump to story panel ${idx + 1}`}
            />
          ))}
        </div>

        {storyPanel < storyPanels.length - 1 ? (
          <button 
            className="ss-story-nav-btn ss-btn-next font-fredoka"
            onClick={onNextPanel}
            aria-label="Advance to next panel"
          >
            Next →
          </button>
        ) : (
          <button 
            className="ss-story-nav-btn ss-btn-next font-fredoka"
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
