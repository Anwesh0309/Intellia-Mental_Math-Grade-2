import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';
import PlaceValueBlocks from '../shared/PlaceValueBlocks';
import NumberLine from '../shared/NumberLine';
import HundredsChart from '../shared/HundredsChart';
import BalanceScale from '../shared/BalanceScale';
import NumberPad from '../shared/NumberPad';
import { Trophy, Star, Sparkles, Flame } from 'lucide-react';
import { questionBank } from '../../data/questionBank';
import { calcXP } from '../../utils/scoring';
import { playSound, narrate, stopNarration } from '../../utils/audio';

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
  // Game states: 'playing' | 'worldcomplete'
  const [gameState, setGameState] = useState('playing');
  const [selectedWorld, setSelectedWorld] = useState(0);
  const [worldQuestions, setWorldQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  
  // Attempt states
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  
  // Answer inputs
  const [selectedOption, setSelectedOption] = useState(null);
  const [numpadValue, setNumpadValue] = useState("");

  // Feedback modal state for 1 second auto-switching popup
  const [feedbackModal, setFeedbackModal] = useState({
    show: false,
    isCorrect: true,
    title: '',
    subtitle: '',
    nextQIdx: null,
    isFinal: false,
    finalScore: 0
  });

  // Load initial question bank on mount
  useEffect(() => {
    handleSelectWorld(0);
  }, []);

  // Active question details
  const activeQuestion = worldQuestions[currentQIdx];

  // Narration of question text on load
  useEffect(() => {
    if (gameState === 'playing' && activeQuestion && audioEnabled && !feedbackModal.show) {
      narrate([{ text: activeQuestion.questionText, style: 'teaching' }], true);
    }
    return () => stopNarration();
  }, [gameState, currentQIdx, activeQuestion, audioEnabled, feedbackModal.show]);

  // Auto-dismiss popup after 1 second (1000ms) and advance question
  useEffect(() => {
    if (feedbackModal.show) {
      const timer = setTimeout(() => {
        setFeedbackModal(prev => ({ ...prev, show: false }));
        if (feedbackModal.isFinal) {
          handleWorldFinished(feedbackModal.finalScore);
        } else if (feedbackModal.nextQIdx !== null) {
          setCurrentQIdx(feedbackModal.nextQIdx);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [feedbackModal]);

  // Load questions for the selected world
  const handleSelectWorld = (worldIdx) => {
    const questions = questionBank.filter(q => q.world === worldIdx).slice(0, 10);
    
    // Shuffle options so the correct answer is randomly distributed
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

    setWorldQuestions(shuffledQuestions.length > 0 ? shuffledQuestions : questionBank.slice(0, 10));
    setSelectedWorld(worldIdx);
    setCurrentQIdx(0);
    setScore(0);
    setStreak(0);
    setGameState('playing');
    setSelectedOption(null);
    setNumpadValue("");
    setFeedbackModal({ show: false, isCorrect: true, title: '', subtitle: '', nextQIdx: null, isFinal: false, finalScore: 0 });
  };

  // Grade student answer and trigger 1 second popup
  const handleCheckAnswer = (answerVal) => {
    if (!activeQuestion || feedbackModal.show) return;

    const isCorrect = String(answerVal).trim().toLowerCase() === String(activeQuestion.correctAnswer).trim().toLowerCase();

    let earnedXP = 0;
    let newScore = score;
    if (isCorrect) {
      playSound('correct');
      earnedXP = calcXP(1, 0, streak);
      onAddXP(earnedXP);
      newScore = score + 1;
      setScore(newScore);
      setStreak(prev => prev + 1);
    } else {
      playSound('incorrect');
      setStreak(0);
    }

    setSelectedOption(null);
    setNumpadValue("");

    const nextIdx = currentQIdx + 1;
    const isFinalQ = nextIdx >= (worldQuestions.length || 10);

    setFeedbackModal({
      show: true,
      isCorrect,
      title: isCorrect ? "Correct! 🎉" : "Not quite!",
      subtitle: isCorrect 
        ? (activeQuestion.explanation || `Correct answer: ${activeQuestion.correctAnswer}`)
        : `Correct answer: ${activeQuestion.correctAnswer}.`,
      nextQIdx: nextIdx,
      isFinal: isFinalQ,
      finalScore: newScore
    });
  };

  const handleWorldFinished = (finalScore) => {
    onCompleteWorld(selectedWorld, finalScore);
    setGameState('worldcomplete');
  };

  // Calculate percentage
  const totalQ = worldQuestions.length || 10;
  const progressPct = Math.round((currentQIdx / totalQ) * 100);

  return (
    <div className="ss-play-page-container animate-fade-in" style={{ position: 'relative' }}>
      {/* Top Pink/Purple Category Pill Badge */}
      <div className="ss-play-top-badge-row">
        <div className="ss-play-badge font-fredoka">
          <Sparkles size={16} />
          <span>Sticker Street</span>
          <Sparkles size={16} />
        </div>
      </div>

      {/* Top HUD Metadata Row (Star score and Streak) */}
      <div className="ss-play-hud-row font-fredoka" style={{ justifyContent: 'space-between', padding: '0 1rem' }}>
        <div className="hud-item hud-stars">
          <Star size={20} fill="#FFC72C" stroke="#FFC72C" />
          <span>{score}</span>
        </div>

        <div className="hud-item hud-streak">
          <Flame size={20} color="#FF7043" fill="#FF7043" />
          <span>{streak}x</span>
        </div>
      </div>

      {/* Thin Progress Bar */}
      <div className="ss-play-progress-wrapper">
        <div className="ss-play-progress-header font-fredoka">
          <span>Question {currentQIdx + 1}/{totalQ}</span>
          <span>{progressPct}%</span>
        </div>
        <div className="ss-play-progress-track">
          <div className="ss-play-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Main Practice Question Glass Card */}
      {gameState === 'playing' && activeQuestion && (
        <div className="ss-play-question-card animate-fade-in">
          {/* Yellow Strategy Pill + Large Cyan Equation Box */}
          <div className="ss-play-equation-header">
            <span className="ss-play-strategy-pill font-fredoka">
              + {activeQuestion.strategy || "REPEATED ADDITION"}
            </span>
            <div className="ss-play-cyan-box font-fredoka">
              {activeQuestion.questionText || `${activeQuestion.addend1 || 47} + ${activeQuestion.addend2 || 36}`}
            </div>
          </div>

          {/* 2x2 Grid Multiple Choice Options */}
          {activeQuestion.options && activeQuestion.options.length > 0 ? (
            <div className="ss-play-options-2x2-grid">
              {activeQuestion.options.map((opt, oIdx) => (
                <button
                  key={`opt-${oIdx}`}
                  className="ss-play-option-btn font-fredoka"
                  onClick={() => handleCheckAnswer(opt)}
                  disabled={feedbackModal.show}
                  aria-label={`Select option ${opt}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            /* Touch Numpad Fallback */
            <div className="numpad-align-wrapper mt-4">
              <NumberPad 
                value={numpadValue} 
                onChange={setNumpadValue}
                onSubmit={() => handleCheckAnswer(numpadValue)}
                maxLength={3}
              />
            </div>
          )}
        </div>
      )}

      {/* Feedback Modal Overlay (Displays for 1 second, then auto-switches to next question) */}
      {feedbackModal.show && (
        <div 
          className="ss-play-feedback-overlay animate-fade-in"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(10, 6, 30, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          <div 
            className="ss-play-feedback-card animate-bounce-in font-fredoka"
            style={{
              width: 'clamp(280px, 80vw, 360px)',
              background: feedbackModal.isCorrect 
                ? 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)' 
                : 'linear-gradient(135deg, #D32F2F 0%, #E53935 100%)',
              borderRadius: '26px',
              padding: '1.8rem 1.4rem',
              boxShadow: feedbackModal.isCorrect
                ? '0 16px 40px rgba(46, 125, 50, 0.6), 0 0 25px rgba(76, 175, 80, 0.4)'
                : '0 16px 40px rgba(211, 47, 47, 0.6), 0 0 25px rgba(244, 67, 54, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.25)',
              textAlign: 'center',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            {/* Top Emoji */}
            <div style={{ fontSize: '3.2rem', lineHeight: 1 }}>
              {feedbackModal.isCorrect ? '🎉' : '🥺'}
            </div>

            {/* Main Title */}
            <h3 style={{
              margin: 0,
              fontSize: '1.85rem',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '0.2px'
            }}>
              {feedbackModal.title}
            </h3>

            {/* Subtitle / Explanation */}
            <p style={{
              margin: 0,
              fontSize: '1.05rem',
              fontWeight: 700,
              fontFamily: 'Nunito, sans-serif',
              color: feedbackModal.isCorrect ? '#E8F5E9' : '#FFEBEE',
              lineHeight: 1.35
            }}>
              {feedbackModal.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* WORLD COMPLETE STATE */}
      {gameState === 'worldcomplete' && (
        <div className="ss-play-end-card animate-bounce-in text-center">
          <Trophy size={60} className="logo-icon-gold mb-3" />
          <h3 className="end-title font-fredoka text-amber-400">DOJO BELT PASSED! 🎉</h3>
          <p className="end-desc font-nunito">
            You scored {score}/{totalQ} correct! You've proven your mental math mastery!
          </p>
          <button 
            onClick={onComplete} 
            className="ss-wonder-discover-btn font-fredoka mt-4"
          >
            <span>PROCEED TO REFLECT ➔</span>
          </button>
        </div>
      )}
    </div>
  );
}
