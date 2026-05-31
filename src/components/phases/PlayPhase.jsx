import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';
import PlaceValueBlocks from '../shared/PlaceValueBlocks';
import NumberLine from '../shared/NumberLine';
import HundredsChart from '../shared/HundredsChart';
import BalanceScale from '../shared/BalanceScale';
import NumberPad from '../shared/NumberPad';
import { Heart, HelpCircle, Award, Trophy, Star, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import { questionBank } from '../../data/questionBank';
import { generateMathDistractors, calcXP, calcStars } from '../../utils/scoring';
import { shuffleArray } from '../../utils/shuffle';
import { playSound, narrate, stopNarration } from '../../utils/audio';
import { checkNewBadges } from '../../utils/badgeEngine';

const BELTS = [
  { id: 0, name: "White Belt Dojo", level: "Addition within 30", color: "#FFFFFF", textColor: "#212121" },
  { id: 1, name: "Yellow Belt Dojo", level: "Addition within 50", color: "#FFEB3B", textColor: "#212121" },
  { id: 2, name: "Orange Belt Dojo", level: "Addition within 60", color: "#FF9800", textColor: "#FFFFFF" },
  { id: 3, name: "Green Belt Dojo", level: "Addition within 70", color: "#4CAF50", textColor: "#FFFFFF" },
  { id: 4, name: "Blue Belt Dojo", level: "Decompose Regroup", color: "#2196F3", textColor: "#FFFFFF" },
  { id: 5, name: "Purple Belt Dojo", level: "Bridging Regroup", color: "#9C27B0", textColor: "#FFFFFF" },
  { id: 6, name: "Red Belt Dojo", level: "Compensation Hard", color: "#E91E63", textColor: "#FFFFFF" },
  { id: 7, name: "Brown Belt Dojo", level: "Mixed Strategies", color: "#795548", textColor: "#FFFFFF" },
  { id: 8, name: "Black Belt Dojo", level: "Singapore Word Problems", color: "#212121", textColor: "#FFFFFF" },
  { id: 9, name: "Gold Belt Dojo", level: "Mastery Challenges", color: "#FFD700", textColor: "#212121" }
];

export default function PlayPhase({ 
  xp = 0, 
  currentWorld = 0, 
  worldScores = [null, null, null, null, null, null, null, null, null, null],
  audioEnabled = true, 
  onAddXP,
  onCompleteWorld,
  onUnlockNewBadges,
  onComplete 
}) {
  // Game states: 'hub' | 'playing' | 'feedback' | 'gameover' | 'worldcomplete'
  const [gameState, setGameState] = useState('hub');
  const [selectedWorld, setSelectedWorld] = useState(0);
  const [worldQuestions, setWorldQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  
  // Attempt states
  const [lives, setLives] = useState(3);
  const [attempt, setAttempt] = useState(1); // 1 or 2
  const [hintsUsed, setHintsUsed] = useState(0); // 0, 1, 2
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  
  // Answer inputs
  const [selectedOption, setSelectedOption] = useState(null);
  const [numpadValue, setNumpadValue] = useState("");
  const [isCorrectFeedback, setIsCorrectFeedback] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [xpAwardedThisQuestion, setXpAwardedThisQuestion] = useState(0);
  const [feedbackMode, setFeedbackMode] = useState('');

  // Active question details
  const activeQuestion = worldQuestions[currentQIdx];

  // Narration of question text on load
  useEffect(() => {
    if (gameState === 'playing' && activeQuestion && audioEnabled) {
      narrate([{ text: activeQuestion.questionText, style: 'teaching' }], true);
    }
    return () => stopNarration();
  }, [gameState, currentQIdx, activeQuestion, audioEnabled]);

  // Load questions for the selected world
  const handleSelectWorld = (worldIdx) => {
    const questions = questionBank.filter(q => q.world === worldIdx).slice(0, 5);
    
    // Shuffle the options so the correct answer is randomly distributed (not always in B or C / index 1 or 2)
    const shuffledQuestions = questions.map(q => {
      if (q.options && q.options.length > 0) {
        const optsCopy = [...q.options];
        for (let i = optsCopy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [optsCopy[i], optsCopy[j]] = [optsCopy[j], optsCopy[i]];
        }
        return {
          ...q,
          options: optsCopy
        };
      }
      return q;
    });

    setWorldQuestions(shuffledQuestions);
    setSelectedWorld(worldIdx);
    setCurrentQIdx(0);
    setLives(3);
    setAttempt(1);
    setHintsUsed(0);
    setScore(0);
    setFeedbackMode('');
    setGameState('playing');
    setSelectedOption(null);
    setNumpadValue("");
  };

  // Trigger narrating hints
  const handleAskCoach = () => {
    if (!activeQuestion) return;
    
    if (hintsUsed === 0) {
      setHintsUsed(1);
      if (audioEnabled) narrate([{ text: activeQuestion.hint1, style: 'teaching' }], true);
    } else if (hintsUsed === 1) {
      setHintsUsed(2);
      if (audioEnabled) narrate([{ text: activeQuestion.hint2, style: 'teaching' }], true);
    }
  };

  // Grade student answer
  // Grade student answer (Act as a Test!)
  const handleCheckAnswer = (answerVal) => {
    if (!activeQuestion) return;

    const isCorrect = String(answerVal).trim().toLowerCase() === String(activeQuestion.correctAnswer).trim().toLowerCase();

    // Grade and calculate scores/XP silently
    let earnedXP = 0;
    if (isCorrect) {
      earnedXP = calcXP(1, 0, streak);
      onAddXP(earnedXP);
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    // Instantly proceed to next question
    setSelectedOption(null);
    setNumpadValue("");
    setAttempt(1);
    setHintsUsed(0);
    setFeedbackMode('');

    const nextIdx = currentQIdx + 1;
    if (nextIdx < worldQuestions.length) {
      setCurrentQIdx(nextIdx);
      setGameState('playing');
    } else {
      const finalScore = isCorrect ? score + 1 : score;
      handleWorldFinished(finalScore);
    }
  };

  // Proceed to next question or end world
  const handleNextQuestion = () => {
    if (!isCorrectFeedback && feedbackMode === 'tryAgain') {
      setSelectedOption(null);
      setNumpadValue("");
      setFeedbackMode('');
      setGameState('playing');
      return;
    }

    setSelectedOption(null);
    setNumpadValue("");
    setAttempt(1);
    setHintsUsed(0);
    setFeedbackMode('');

    if (lives <= 0) {
      setGameState('gameover');
      return;
    }

    const nextIdx = currentQIdx + 1;
    if (nextIdx < worldQuestions.length) {
      setCurrentQIdx(nextIdx);
      setGameState('playing');
    } else {
      handleWorldFinished();
    }
  };

  // Process completed world milestones
  const handleWorldFinished = (finalScore = score) => {
    // Save score in parent global state
    onCompleteWorld(selectedWorld, finalScore);

    // Calculate stars and check badges
    const stars = calcStars(finalScore);
    
    // Check if new badges unlocked (simulate badge state injection)
    // We pass a dummy state representing the completed milestones
    const dummyState = {
      worldScores: worldScores.map((s, idx) => idx === selectedWorld ? finalScore : s),
      maxStreak: Math.max(streak, 10), // approximate
      phaseComplete: { wonder: true, story: true, simulate: true, play: true, reflect: false },
      simStationsComplete: [true, true, true, true],
      badges: [] // check new ones
    };
    const earnedBadges = checkNewBadges(dummyState);
    if (earnedBadges.length > 0) {
      onUnlockNewBadges(earnedBadges);
    }

    setScore(finalScore);
    setGameState('worldcomplete');
    playSound('fanfare');

    if (audioEnabled) {
      const beltName = BELTS[selectedWorld].name;
      narrate([
        { text: `Amazing job! You finished the ${beltName}! You scored ${finalScore} out of 5.`, style: 'happy' }
      ], true);
    }
  };

  // Render question-specific CPA vectors
  const renderQuestionVisual = () => {
    if (!activeQuestion) return null;

    switch (activeQuestion.visual) {
      case 'blocks':
        return (
          <div className="play-visual-card">
            <h4 className="visual-card-title font-fredoka">Place Value Clues</h4>
            <div className="play-blocks-row">
              <div>
                <span className="blocks-row-label font-fredoka">{activeQuestion.addend1}</span>
                <PlaceValueBlocks tens={Math.floor(activeQuestion.addend1 / 10)} ones={activeQuestion.addend1 % 10} size="sm" />
              </div>
              <div className="blocks-op-centered font-fredoka">+</div>
              <div>
                <span className="blocks-row-label font-fredoka">{activeQuestion.addend2}</span>
                <PlaceValueBlocks tens={Math.floor(activeQuestion.addend2 / 10)} ones={activeQuestion.addend2 % 10} size="sm" type="to-add-tens" />
              </div>
            </div>
          </div>
        );
      case 'numberLine':
        return (
          <div className="play-visual-card">
            <h4 className="visual-card-title font-fredoka">Number Line Track</h4>
            {/* Display relevant range on number line */}
            <NumberLine 
              min={activeQuestion.addend1 - 2} 
              max={activeQuestion.addend1 + activeQuestion.addend2 + 3} 
              marked={[activeQuestion.addend1]}
              activeValue={activeQuestion.addend1}
            />
          </div>
        );
      case 'hundredsChart':
        return (
          <div className="play-visual-card compact-chart-visual">
            <h4 className="visual-card-title font-fredoka">Hundreds Chart Coordinates</h4>
            <HundredsChart 
              startCell={activeQuestion.addend1} 
              current={activeQuestion.addend1} 
            />
          </div>
        );
      case 'scale':
        return (
          <div className="play-visual-card">
            <h4 className="visual-card-title font-fredoka">Compensation Scale</h4>
            <BalanceScale 
              leftValue={activeQuestion.sum} 
              rightValue={activeQuestion.sum} 
              leftLabel={`Start (${activeQuestion.addend1})`} 
              rightLabel={`Rounded (+${activeQuestion.addend2})`} 
            />
          </div>
        );
      case 'picture':
        // Renders visual rows of counter emojis so children can visually count aggregates
        const maxOnes = Math.min(20, activeQuestion.addend1);
        const maxTens = Math.min(20, activeQuestion.addend2);
        return (
          <div className="play-visual-card">
            <h4 className="visual-card-title font-fredoka">Counter Clues</h4>
            <div className="play-counters-box">
              <div className="counters-line">
                <span className="counters-label font-fredoka">{activeQuestion.addend1}:</span>
                {Array.from({ length: maxOnes }).map((_, i) => (
                  <span key={`c1-${i}`} className="counter-emoji-item">{activeQuestion.counterEmoji || "🎈"}</span>
                ))}
                {activeQuestion.addend1 > 20 && <span className="counter-etc">...</span>}
              </div>
              <div className="counters-line">
                <span className="counters-label font-fredoka">{activeQuestion.addend2}:</span>
                {Array.from({ length: maxTens }).map((_, i) => (
                  <span key={`c2-${i}`} className="counter-emoji-item">{activeQuestion.counterEmoji || "🎈"}</span>
                ))}
                {activeQuestion.addend2 > 20 && <span className="counter-etc">...</span>}
              </div>
            </div>
          </div>
        );
      case 'sentence':
      default:
        return (
          <div className="play-visual-card worked-story-comic-mini">
            <h4 className="visual-card-title font-fredoka">Word Problem Scenario</h4>
            <p className="story-para-text font-nunito text-center italic">
              "Read carefully! Use your ninja shortcuts to solve without paper!"
            </p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="phase-card-wrapper play-phase-container">
      {/* Dynamic play header */}
      <div className="phase-banner-header play-banner">
        <h2 className="phase-banner-title font-fredoka">PHASE 4: PLAY ARENA 🥷</h2>
        <span className="phase-banner-subtitle">Singapore Math Dojo Belt Quest</span>
      </div>

      {/* ==========================================================
          GAME STATE 1: WORLD HUB SELECTOR
          ========================================================== */}
      {gameState === 'hub' && (
        <div className="hub-world-selector-view">
          <div className="hub-welcome-banner animate-fade-in">
            <h3 className="hub-subtitle font-fredoka">Enter a Belt Dojo to Quest</h3>
            <p className="hub-desc font-nunito">
              You must pass each Dojo (scoring 3/10 stars or higher) to unlock the next belt level!
            </p>
          </div>

          <div className="hub-dojos-grid">
            {BELTS.map((b) => {
              const isUnlocked = b.id <= currentWorld;
              const historyScore = worldScores[b.id];
              const starsCount = historyScore !== null ? calcStars(historyScore) : 0;

              return (
                <button
                  key={b.id}
                  disabled={!isUnlocked}
                  className={`dojo-belt-card ${isUnlocked ? 'dojo-unlocked' : 'dojo-locked'}`}
                  onClick={() => handleSelectWorld(b.id)}
                  aria-label={`${b.name}, ${b.level}. ${isUnlocked ? 'Unlocked' : 'Locked'}`}
                >
                  <div className="belt-color-strap" style={{ backgroundColor: b.color }} />
                  <div className="dojo-card-contents">
                    <span className="dojo-belt-name font-fredoka" style={{ color: isUnlocked ? '#212121' : '#757575' }}>
                      {b.name}
                    </span>
                    <span className="dojo-belt-level font-nunito">{b.level}</span>
                    
                    {isUnlocked ? (
                      <div className="dojo-card-history-strip font-fredoka text-primary">
                        {historyScore !== null ? (
                          <>
                            <div className="stars-strip">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <Star 
                                  key={`star-${i}`} 
                                  size={16} 
                                  fill={i < starsCount ? "#FFD700" : "none"} 
                                  stroke={i < starsCount ? "#FFD700" : "#B0BEC5"} 
                                />
                              ))}
                            </div>
                            <span className="history-score-val">{historyScore}/5 Correct</span>
                          </>
                        ) : (
                          <span className="not-attempted font-nunito">Not attempted yet</span>
                        )}
                      </div>
                    ) : (
                      <div className="dojo-card-lock font-fredoka">
                        🔒 Locked
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {worldScores[9] !== null && worldScores[9] >= 3 && (
            <div className="text-center mt-8">
              <button
                onClick={() => onComplete()}
                className="finish-lesson-btn font-fredoka animate-pulse"
                aria-label="Proceed to Reflect phase"
                style={{
                  background: 'linear-gradient(135deg, var(--color-success) 0%, #2E7D32 100%)',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                  padding: '1rem 2.5rem',
                  fontSize: '1.2rem',
                  borderRadius: '16px',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                PROCEED TO REFLECT <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==========================================================
          GAME STATE 2: PLAYING QUESTION LOOP
          ========================================================== */}
      {(gameState === 'playing' || gameState === 'feedback') && activeQuestion && (
        <div className="quiz-playing-view-grid animate-fade-in">
          {/* Main Question Panel (Left) */}
          <div className="quiz-question-pane">
            {/* Status bar (Lives, Quest count, Streak) */}
            <div className="quiz-metadata-header">
              <span className="quest-num-label font-fredoka">
                Question {currentQIdx + 1} of {worldQuestions.length || 0}
              </span>
              
              {/* Dojo Test Mode Badge */}
              <div className="dojo-test-badge font-fredoka">
                📝 Belt Exam Mode
              </div>
            </div>

            {/* Question Text */}
            <div className="quiz-question-box font-fredoka">
              <p className="question-prompt">{activeQuestion.questionText}</p>
            </div>

            {/* Live CPA Visual assistance */}
            <div className="quiz-question-visuals">
              {renderQuestionVisual()}
            </div>

            {/* Answer inputs interface */}
            <div className="quiz-input-interface">
              {activeQuestion.type === 'missing_addend' ? (
                // Numerical missing addend gets touch number pad
                <div className="numpad-align-wrapper">
                  <span className="numpad-instruction-label font-fredoka">Enter missing number below:</span>
                  <NumberPad 
                    value={numpadValue} 
                    onChange={setNumpadValue}
                    onSubmit={() => handleCheckAnswer(numpadValue)}
                    maxLength={3}
                  />
                </div>
              ) : (
                // Multiple Choice layout (MCQ)
                <div className="mcq-options-grid">
                  {activeQuestion.options.map((opt, oIdx) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <button
                        key={`opt-${oIdx}`}
                        className={`mcq-option-btn font-fredoka ${isSelected ? 'mcq-opt-selected' : ''}`}
                        onClick={() => setSelectedOption(opt)}
                        aria-label={`Option: ${opt}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                  
                  {/* Submit MCQ */}
                  <div className="mcq-submit-align">
                    <button
                      className="mcq-submit-btn font-fredoka"
                      disabled={selectedOption === null}
                      onClick={() => handleCheckAnswer(selectedOption)}
                    >
                      Submit Guess
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coach Help Sidebar (Right) */}
          <div className="quiz-sidebar-pane">
            <div className="quiz-mascot-wrapper">
              <Mascot mood="idle" belt={selectedWorld} />
            </div>

            <div className="coach-hints-drawer">
              <h4 className="drawer-title font-fredoka">Coach Encouragement</h4>
              <div className="hints-content-bubble font-nunito text-center">
                <p className="italic text-slate-300" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                  "Focus on your ninja mental math strategies! Take your time, calculate carefully, and do your best!"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ==========================================================
          GAME STATE 4: GAME OVER (RETRIES)
          ========================================================== */}
      {gameState === 'gameover' && (
        <div className="quiz-gameover-view animate-bounce-in text-center">
          <Trophy size={64} className="color-locked mx-auto mb-4" />
          <h3 className="gameover-title font-fredoka text-danger">DOJO RUN INCOMPLETE</h3>
          <p className="gameover-text font-nunito max-w-md mx-auto">
            Oh no! You lost all your heart lives during this challenge. Don't worry, even math ninjas must fail to succeed!
            Let's retry this belt dojo or head back to the sandbox for some quick practice.
          </p>
          <div className="gameover-actions mt-6">
            <button 
              onClick={() => handleSelectWorld(selectedWorld)} 
              className="gameover-retry-btn font-fredoka"
            >
              <RefreshCw size={18} /> RETRY DOJO
            </button>
            <button 
              onClick={() => setGameState('hub')} 
              className="gameover-back-btn font-fredoka bg-primary"
            >
              BACK TO BELT MAP
            </button>
          </div>
        </div>
      )}

      {/* ==========================================================
          GAME STATE 5: WORLD COMPLETED SUMMARY
          ========================================================== */}
      {gameState === 'worldcomplete' && (
        <div className="quiz-completion-view animate-bounce-in text-center">
          <Trophy size={80} className="color-star mx-auto mb-4 logo-icon-gold animate-bounce" />
          <h3 className="complete-title font-fredoka text-success">
            {score >= 3 ? "PROMOTED!" : "DOJO TRIAL COMPLETE"}
          </h3>
          <h4 className="complete-belt-name font-fredoka">
            {BELTS[selectedWorld].name} Finished
          </h4>

          {/* Stars visual */}
          <div className="completion-stars-row">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star 
                key={`comp-star-${i}`} 
                size={40} 
                fill={i < calcStars(score) ? "#FFD700" : "none"} 
                stroke={i < calcStars(score) ? "#FFD700" : "#B0BEC5"} 
                className={i < calcStars(score) ? "star-large star-glow-yellow animate-pulse" : "star-large"}
              />
            ))}
          </div>

          <div className="completion-stats-summary font-fredoka">
            <div className="comp-stat-pill">Score: {score} / 5</div>
            <div className="comp-stat-pill">Dojo Status: {score >= 3 ? "PASSED ✅" : "TRY AGAIN ❌"}</div>
          </div>

          <p className="completion-narrative font-nunito max-w-lg mx-auto">
            {score === 5 
              ? "Flawless math ninja execution! You exhibited complete mastery of these mental shortcuts."
              : score >= 3 
              ? "Good job! You demonstrated solid understanding and earned promotion to the next belt rank."
              : "Not quite passing! You need a score of 3/5 correct answers to earn your colored belt promotion. Let's try again!"}
          </p>

          <div className="completion-actions mt-6">
            {score >= 3 ? (
              <button 
                onClick={() => {
                  setGameState('hub');
                  // Unlock next world level if successfully passed
                  if (selectedWorld === currentWorld) {
                    if (currentWorld < 9) {
                      onComplete(selectedWorld + 1); // trigger promotion in parent state
                    } else {
                      onComplete(9); // complete Play phase and go to Reflect!
                    }
                  }
                }} 
                className="complete-continue-btn font-fredoka"
              >
                RETURN TO HUB <ArrowRight size={18} />
              </button>
            ) : (
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => handleSelectWorld(selectedWorld)} 
                  className="complete-continue-btn font-fredoka"
                >
                  RETRY DOJO
                </button>
                <button 
                  onClick={() => setGameState('hub')} 
                  className="complete-continue-btn font-fredoka bg-primary"
                >
                  RETURN TO HUB
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* ==========================================================
          GAME STATE 3: INTERMEDIATE FEEDBACK OVERLAY
          ========================================================== */}
      {gameState === 'feedback' && activeQuestion && (
        <div className="popup-overlay">
          <div className={`popup-card ${isCorrectFeedback ? 'popup-correct' : 'popup-incorrect'}`}>
            <span className="popup-emoji">{isCorrectFeedback ? '🎉' : '😢'}</span>
            <h3 className="popup-title">{isCorrectFeedback ? 'Correct! 🎉' : 'Not quite!'}</h3>
            <div className="popup-subtext">
              {isCorrectFeedback && (
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  +{xpAwardedThisQuestion} XP earned!
                </div>
              )}
              <div style={{ fontSize: '1.05rem', opacity: 0.9 }}>
                {explanationText}
              </div>
            </div>
            <button
              onClick={handleNextQuestion}
              className="popup-continue-btn font-fredoka"
              aria-label={feedbackMode === 'tryAgain' ? 'Try again' : 'Continue to next question'}
            >
              {feedbackMode === 'tryAgain' ? 'TRY AGAIN' : 'CONTINUE'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
