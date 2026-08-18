import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';
import { HelpCircle, Star, Sparkles } from 'lucide-react';
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
    <div className="ss-wonder-page-container animate-fade-in">
      {/* Translucent background floating mini icons matching screenshot */}
      <div className="ss-bg-floating-decor" aria-hidden="true">
        <span className="decor-item decor-1">🖐️</span>
        <span className="decor-item decor-2">🎪</span>
        <span className="decor-item decor-3">🖐️</span>
        <span className="decor-item decor-4">🎪</span>
        <span className="decor-item decor-5">🖐️</span>
        <span className="decor-item decor-6">🎪</span>
        <span className="decor-item decor-7">🖐️</span>
      </div>

      {/* Center Top Mascot Question Circle Group like screenshot */}
      <div className="ss-wonder-mascot-group">
        <div className="ss-question-mark-circle font-fredoka">
          <span>?</span>
        </div>
        <div className="ss-mascot-yellow-circle">
          <Mascot mood={revealed ? "happy" : "curious"} />
        </div>
        <div className="ss-wonder-speech-bubble font-nunito">
          <span>Hmm... I wonder... 🤔</span>
          <div className="ss-bubble-tail-top" />
        </div>
      </div>

      {/* Main Quest Question Card */}
      <div className="ss-wonder-quest-card animate-fade-in">
        <div className="ss-quest-top-icon">
          <span>🖐️</span>
        </div>

        <h2 className="ss-wonder-question-text font-fredoka">
          Noah has <span className="ss-highlight-yellow">47 stickers</span>. He earns <span className="ss-highlight-yellow">36 more</span> at school.
          <br />
          Can you add that in your head — <span className="text-cyan">without writing anything down?</span>
        </h2>

        {/* Draggable/illustrated sticker bundles for CPA concrete feel */}
        <div className="illustrated-sticker-group" aria-label="Visual piles representing 47 stickers and 36 stickers">
          <div className="sticker-pile pile-left">
            <span className="pile-label font-fredoka">47 Stickers</span>
            <div className="sticker-icons">
              <Star size={22} className="star-icon star-glow-yellow" />
              <Star size={22} className="star-icon star-glow-yellow" />
              <Star size={22} className="star-icon star-glow-yellow" />
              <span className="pile-etc font-fredoka">+ 44 more</span>
            </div>
          </div>
          
          <div className="wonder-operator font-fredoka">+</div>
          
          <div className="sticker-pile pile-right">
            <span className="pile-label font-fredoka">36 Stickers</span>
            <div className="sticker-icons">
              <Star size={22} className="star-icon star-glow-orange" />
              <Star size={22} className="star-icon star-glow-orange" />
              <span className="pile-etc font-fredoka">+ 34 more</span>
            </div>
          </div>
        </div>

        <p className="ss-wonder-subtitle-hint font-nunito">
          Your fingers and mental math shortcuts are the best counting tools ever!
        </p>

        {/* Input guess form or revealed shortcut card */}
        {!revealed ? (
          <form onSubmit={handleSubmitGuess} className="ss-wonder-input-form">
            <div className="ss-wonder-input-row">
              <input
                id="wonder-guess"
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                className="ss-wonder-guess-input font-fredoka"
                placeholder="Type your guess..."
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                autoFocus
              />
              <button 
                type="submit" 
                className="ss-wonder-submit-btn font-fredoka"
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
              <HelpCircle size={18} /> I need a mental shortcut!
            </button>
          </form>
        ) : (
          <div className="ss-wonder-reveal-box animate-fade-in">
            <p className="reveal-text font-nunito">
              Adding <strong>47 + 36</strong> in your head is tricky because of carrying!
              But Coach Cooper knows <strong>4 SECRET SHORTCUTS</strong> to make this fast and easy!
            </p>
          </div>
        )}
      </div>

      {/* Purple Gradient Discover CTA Button like screenshot */}
      <div className="ss-wonder-cta-row">
        <button 
          className="ss-wonder-discover-btn font-fredoka"
          onClick={onComplete}
          aria-label="Advance to Phase 2, the Story panel"
        >
          <Sparkles size={22} />
          <span>Let's Discover!</span>
          <Sparkles size={22} />
        </button>
      </div>
    </div>
  );
}
