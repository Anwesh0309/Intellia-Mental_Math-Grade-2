import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';
import { Award, Send, Trophy, Star, Shield, ArrowRight } from 'lucide-react';
import { playSound, narrate, stopNarration } from '../../utils/audio';
import { reflectNarration } from '../../utils/narration';

const PRESETS = [
  "Add Tens, Then Ones is my favorite because breaking numbers is easy!",
  "Make the Next Ten helps me bridge to the next ten without getting confused.",
  "Hundreds Chart Jumps are super fun! I can visualize jumping up and down rows.",
  "Round and Adjust is the fastest when adding numbers that end in 9!"
];

const BELTS = [
  { name: "White Belt", color: "#FFFFFF" },
  { name: "Yellow Belt", color: "#FFEB3B" },
  { name: "Orange Belt", color: "#FF9800" },
  { name: "Green Belt", color: "#4CAF50" },
  { name: "Blue Belt", color: "#2196F3" },
  { name: "Purple Belt", color: "#9C27B0" },
  { name: "Red Belt", color: "#F44336" },
  { name: "Brown Belt", color: "#795548" },
  { name: "Deputy Black Belt", color: "#424242" },
  { name: "Black Belt", color: "#000000" }
];

export default function ReflectPhase({ 
  xp = 0, 
  totalStars = 0, 
  badges = [], 
  worldScores = [],
  audioEnabled = true, 
  onFinishLesson 
}) {
  const [reflectStep, setReflectStep] = useState('scoreboard'); // 'scoreboard' | 'journal' | 'certificate'
  const [journalText, setJournalText] = useState("");

  // Play narration upon mounting Reflect phase
  useEffect(() => {
    if (audioEnabled && reflectStep === 'journal') {
      narrate(reflectNarration(), true);
    }
  }, [audioEnabled, reflectStep]);

  const handleGoToJournal = () => {
    setReflectStep('journal');
  };

  const handleSealCertificate = (e) => {
    e.preventDefault();
    if (!journalText) return;
    setReflectStep('certificate');
    playSound('fanfare');
  };

  return (
    <div className="phase-card-wrapper reflect-phase-container">
      {/* Banner */}
      <div className="phase-banner-header reflect-banner">
        <h2 className="phase-banner-title font-fredoka">PHASE 5: REFLECT 📝</h2>
        <span className="phase-banner-subtitle">
          {reflectStep === 'scoreboard' ? "Dojo Performance Scoreboard" : 
           reflectStep === 'journal' ? "Write Your Reflection Journal" : 
           "Seal Your Ninja Certificate"}
        </span>
      </div>

      {/* STEP 1: OVERALL SCOREBOARD */}
      {reflectStep === 'scoreboard' && (
        <div className="reflect-scoreboard-view animate-fade-in p-6">
          <h3 className="scoreboard-title font-fredoka text-center mb-6">DOJO QUEST SCOREBOARD</h3>
          
          <div className="scoreboard-grid mb-6">
            <div className="score-item-box">
              <span className="text-3xl">⭐</span>
              <span className="score-item-val">{xp}</span>
              <span className="score-item-lbl font-fredoka">Total XP</span>
            </div>
            <div className="score-item-box">
              <span className="text-3xl">🏆</span>
              <span className="score-item-val">{totalStars}</span>
              <span className="score-item-lbl font-fredoka">Stars Collected</span>
            </div>
            <div className="score-item-box">
              <span className="text-3xl">🏅</span>
              <span className="score-item-val">{badges.length}</span>
              <span className="score-item-lbl font-fredoka">Badges Unlocked</span>
            </div>
            <div className="score-item-box">
              <span className="text-3xl">🥷</span>
              <span className="score-item-val">
                {worldScores.filter(s => s !== null).length} / 10
              </span>
              <span className="score-item-lbl font-fredoka">Belts Completed</span>
            </div>
          </div>

          <div className="belts-performance-card bg-black/20 p-5 rounded-2xl border border-white/10 mb-6">
            <h4 className="font-fredoka text-accent text-center mb-4">Belt Exam Performance Records</h4>
            <div className="belts-grid-container">
              {BELTS.map((belt, idx) => {
                const score = worldScores[idx];
                const attempted = score !== null;
                return (
                  <div key={belt.name} className="belt-performance-item">
                    <div className="belt-info-left">
                      <div 
                        className="belt-color-dot" 
                        style={{ backgroundColor: belt.color }} 
                      />
                      <span className="font-fredoka text-sm text-slate-200">{belt.name}</span>
                    </div>
                    <span className={`font-fredoka text-sm ${attempted ? (score >= 3 ? 'text-success' : 'text-danger') : 'text-slate-500'}`}>
                      {attempted ? `${score} / 5 (${score >= 3 ? 'Passed ✅' : 'Failed ❌'})` : 'Not Attempted'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleGoToJournal}
              className="finish-lesson-btn font-fredoka mt-2"
              aria-label="Proceed to reflection journal"
            >
              WRITE MY REFLECTION <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: JOURNAL ENTRY */}
      {reflectStep === 'journal' && (
        <div className="reflect-journal-editor animate-fade-in p-6">
          <div className="journal-instructions-row mb-6">
            <div className="avatar-med">
              <Mascot mood="teaching" />
            </div>
            <div className="mascot-bubble-glow font-nunito p-4 rounded-2xl bg-white/5 border border-white/10">
              <p>
                <strong>Lily and Leo say:</strong> "Which strategy did you like the most today?
                What mental math shortcut makes you feel like a real math ninja? Let's write down your thoughts!"
              </p>
            </div>
          </div>

          <form onSubmit={handleSealCertificate} className="journal-main-form">
            <div className="reflection-presets-strip mb-4">
              <span className="preset-label font-fredoka block mb-2">Quick Ideas:</span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p, idx) => (
                  <button
                    key={`preset-${idx}`}
                    type="button"
                    onClick={() => setJournalText(p)}
                    className="preset-pill-btn font-nunito px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-slate-300 transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <label className="journal-label font-fredoka block mb-2 text-slate-200" htmlFor="journal-textarea">
              Your Math Journal Entry:
            </label>
            <textarea
              id="journal-textarea"
              className="journal-textarea font-nunito w-full p-4 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:border-cyan-400"
              placeholder="I love the Round and Adjust strategy because..."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              rows="4"
              required
            />

            <div className="journal-submit-row mt-6 text-center">
              <button
                type="submit"
                disabled={!journalText}
                className="seal-certificate-btn font-fredoka px-6 py-3 bg-gradient-to-r from-success to-emerald-600 rounded-xl text-white font-bold"
                aria-label="Submit journal entry and seal your math certificate"
              >
                <Send size={18} className="inline mr-2" /> SEAL MY CERTIFICATE
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: NINA CERTIFICATE */}
      {reflectStep === 'certificate' && (
        <div className="ninja-certificate-view animate-bounce-in text-center p-6">
          <div className="certificate-border-box p-6 border-4 border-dashed border-amber-500 rounded-3xl bg-black/20 max-w-2xl mx-auto relative">
            <div className="certificate-seal-badge animate-bounce mb-4">
              <Shield size={64} className="color-star mx-auto text-amber-500" />
            </div>
            
            <h3 className="cert-title font-fredoka text-3xl text-amber-400 mb-1">GRADUATION CERTIFICATE</h3>
            <span className="cert-subtitle font-nunito tracking-widest text-slate-400 text-sm">MENTAL MATH NINJA ACADEMY</span>
            
            <div className="cert-divider my-4 border-t-2 border-amber-500/30" />
            
            <p className="cert-narrative font-nunito text-slate-200 leading-relaxed max-w-lg mx-auto">
              This certifies that our brave student has successfully completed all 5 phases of
              <strong> Singapore Primary Mathematics Lesson 2.3: Addition within 100</strong>.
              They have mastered all 4 shortcuts (Decompose, Bridge Ten, Hundreds Chart, Compensation).
            </p>

            <div className="cert-metrics-box font-fredoka my-6 flex justify-around bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="cert-metric-node flex flex-col items-center">
                <span className="metric-icon text-2xl">⭐</span>
                <span className="metric-val text-amber-400 text-xl font-bold">{xp} XP</span>
              </div>
              <div className="cert-metric-node flex flex-col items-center">
                <span className="metric-icon text-2xl">🏆</span>
                <span className="metric-val text-amber-400 text-xl font-bold">{totalStars} Stars</span>
              </div>
              <div className="cert-metric-node flex flex-col items-center">
                <span className="metric-icon text-2xl">🏅</span>
                <span className="metric-val text-amber-400 text-xl font-bold">{badges.length} Badges</span>
              </div>
            </div>

            <div className="cert-badges-showcase mb-6">
              <h4 className="badges-header font-fredoka text-amber-400 mb-2">Unlocked Medals</h4>
              <div className="badges-flex-strip flex justify-center gap-2 flex-wrap">
                {badges.length > 0 ? (
                  badges.map((bId) => {
                    const label = bId === 'curious_coder' ? '🏅 Curious Coder'
                                : bId === 'strategy_scholar' ? '🥈 Strategy Scholar'
                                : bId === 'perfect_ten' ? '💎 Perfect Ten'
                                : bId === 'streak_champion' ? '🔥 Streak Champion'
                                : bId === 'full_journey' ? '🌟 Full Journey'
                                : '🏅 Medal';
                    return (
                      <span key={bId} className="cert-badge-chip font-fredoka bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs">
                        {label}
                      </span>
                    );
                  })
                ) : (
                  <span className="cert-badge-chip font-fredoka bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs">🏅 Math Dojo Member</span>
                )}
              </div>
            </div>

            <div className="cert-signatures font-nunito flex justify-between max-w-md mx-auto mt-8">
              <div className="signature-col flex flex-col items-center">
                <div className="signature-line signature-script font-fredoka border-b border-slate-600 w-32 pb-1 text-slate-200">Coach Cooper</div>
                <span className="signature-title text-xs text-slate-400 mt-1">Academy Coach</span>
              </div>
              <div className="signature-col flex flex-col items-center">
                <div className="signature-line font-fredoka border-b border-slate-600 w-32 pb-1 text-slate-200">INTELLIA SG</div>
                <span className="signature-title text-xs text-slate-400 mt-1">MOE Mathematics</span>
              </div>
            </div>
          </div>

          <div className="cert-action-row mt-8">
            <button
              onClick={onFinishLesson}
              className="finish-lesson-btn font-fredoka animate-pulse"
              aria-label="Conclude the lesson and return to the main dashboard"
            >
              FINISH QUEST <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
