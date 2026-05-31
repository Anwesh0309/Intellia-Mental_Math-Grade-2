import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';
import { ArrowRight, HelpCircle, Star } from 'lucide-react';
import { narrate, stopNarration } from '../../utils/audio';
import { wonderNarration } from '../../utils/narration';

export default function WonderPhase({ audioEnabled = true, onComplete }) {
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);

  // Play narration when entering the phase
  useEffect(() => {
    if (audioEnabled) {
      narrate(wonderNarration(), true);
    }
    return () => stopNarration();
  }, [audioEnabled]);

  const handleSubmitGuess = (e) => {
    e.preventDefault();
    setRevealed(true);
  };

  return (
    <div className="phase-card-wrapper wonder-phase-container">
      {/* Dynamic Header Banner */}
      <div className="phase-banner-header wonder-banner">
        <h2 className="phase-banner-title font-fredoka">PHASE 1: WONDER 🔮</h2>
        <span className="phase-banner-subtitle">Can you solve this puzzle in your head?</span>
      </div>

      <div className="wonder-content-box">
        {/* The Quest Question Card */}
        <div className="wonder-quest-card">
          <p className="wonder-text font-nunito">
            "Noah has <strong>47 stickers</strong>. He earns <strong>36 more</strong> at school.
            Can you add that in your head — <strong>without writing anything down?</strong>"
          </p>
          
          {/* Draggable/illustrated sticker bundles for CPA concrete feel */}
          <div className="illustrated-sticker-group" aria-label="Visual piles representing 47 stickers and 36 stickers">
            <div className="sticker-pile pile-left">
              <span className="pile-label font-fredoka">47 Stickers</span>
              <div className="sticker-icons">
                <Star size={24} className="star-icon star-glow-yellow" />
                <Star size={24} className="star-icon star-glow-yellow" />
                <Star size={24} className="star-icon star-glow-yellow" />
                <span className="pile-etc">+ 44 more</span>
              </div>
            </div>
            
            <div className="wonder-operator font-fredoka">+</div>
            
            <div className="sticker-pile pile-right">
              <span className="pile-label font-fredoka">36 Stickers</span>
              <div className="sticker-icons">
                <Star size={24} className="star-icon star-glow-orange" />
                <Star size={24} className="star-icon star-glow-orange" />
                <span className="pile-etc">+ 34 more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mascot + Interactions Grid */}
        <div className="wonder-mascot-row">
          <div className="wonder-mascot-wrapper">
            <Mascot mood={revealed ? "happy" : "curious"} />
          </div>

          <div className="wonder-interactive-column">
            {!revealed ? (
              <form onSubmit={handleSubmitGuess} className="wonder-guess-form">
                <label className="input-label font-fredoka" htmlFor="wonder-guess">
                  Type your guess here:
                </label>
                <div className="input-row-align">
                  <input
                    id="wonder-guess"
                    type="number"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    className="wonder-guess-input font-fredoka"
                    placeholder="?"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    className="wonder-submit-btn font-fredoka"
                    aria-label="Submit your guess"
                  >
                    Solve
                  </button>
                </div>
                <button 
                  type="button" 
                  onClick={() => setRevealed(true)}
                  className="wonder-reveal-shortcut font-fredoka"
                >
                  <HelpCircle size={16} /> I need a mental shortcut!
                </button>
              </form>
            ) : (
              <div className="wonder-reveal-card mascot-bubble-glow animate-fade-in">
                <h3 className="reveal-title font-fredoka text-success">
                  You're Ready for the Quest! 🥷
                </h3>
                <p className="reveal-text font-nunito">
                  Adding <strong>47 + 36</strong> in your head is tricky because of carrying!
                  But wait... Coach Cooper knows <strong>4 SECRET SHORTCUTS</strong> to make this fast and easy!
                </p>
                <button 
                  className="wonder-continue-btn font-fredoka"
                  onClick={onComplete}
                  aria-label="Advance to Phase 2, the Story panel"
                >
                  LEARN THE SHORTCUTS <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
