import React, { useEffect } from 'react';
import { playSound, narrate } from '../../utils/audio';

export default function ReflectPhase({ 
  xp = 0, 
  totalStars = 0, 
  badges = [], 
  worldScores = [null, null, null, null, null, null, null, null, null, null],
  maxStreak = 0,
  audioEnabled = true, 
  onFinishLesson,
  onPlayAgain
}) {
  // Calculate dynamic performance results from student practice phase data
  const attemptedScores = Array.isArray(worldScores) ? worldScores.filter(s => s !== null && s !== undefined) : [];
  const totalCorrect = Array.isArray(worldScores) ? worldScores.reduce((sum, score) => sum + (score !== null && score !== undefined ? score : 0), 0) : 0;
  
  // Benchmark base: attempted questions (10 per world) or default to 10
  const totalQuestions = attemptedScores.length > 0 ? (attemptedScores.length * 10) : 10;
  const percent = totalQuestions > 0 ? Math.min(100, Math.round((totalCorrect / totalQuestions) * 100)) : 0;
  const displayFraction = `${totalCorrect}/${totalQuestions}`;

  // Star rating (0 to 3) based on percent
  const filledStarsCount = percent >= 80 ? 3 : percent >= 50 ? 2 : percent >= 20 ? 1 : 0;

  // Individual strategy scores for Worlds 0, 1, and 2
  const decompScore = (worldScores && worldScores[0] !== null && worldScores[0] !== undefined) ? worldScores[0] : 0;
  const bridgeScore = (worldScores && worldScores[1] !== null && worldScores[1] !== undefined) ? worldScores[1] : 0;
  const compScore = (worldScores && worldScores[2] !== null && worldScores[2] !== undefined) ? worldScores[2] : 0;

  // Helper for 3 star representation per strategy strip
  const getCategoryStars = (scoreVal) => {
    const ratio = scoreVal / 10;
    if (ratio >= 0.8) return { text: '★★★', filled: 3 };
    if (ratio >= 0.5) return { text: '★★☆', filled: 2 };
    if (ratio >= 0.2) return { text: '★☆☆', filled: 1 };
    return { text: '☆☆☆', filled: 0 };
  };

  // Dynamic mascot voice & text feedback
  const getMascotMessage = () => {
    if (percent >= 80) return "Outstanding! You're a true Addition Ninja Master! 🏆";
    if (percent >= 50) return "Great work! You've mastered several mental math strategies! 🚀";
    if (totalCorrect > 0) return "Good start! Try again to earn 3 stars! 📚";
    return "Welcome! Practice mental math strategies to earn stars and level up! 🌟";
  };

  const mascotText = getMascotMessage();

  // Play narration upon mounting Reflect phase
  useEffect(() => {
    if (audioEnabled) {
      narrate([`Awesome job completing your math journey! ${mascotText}`], true);
    }
  }, [audioEnabled, mascotText]);

  const handlePlayAgainClick = () => {
    playSound('chime');
    if (onPlayAgain) onPlayAgain();
    else if (onFinishLesson) onFinishLesson();
  };

  const handleHomeClick = () => {
    playSound('chime');
    if (onFinishLesson) onFinishLesson();
  };

  // SVG Circle Gauge calculations (r = 54, circumference ~ 339.29)
  const radius = 54;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="reflect-screen-wrapper animate-fade-in" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      padding: '1rem',
      boxSizing: 'border-box'
    }}>
      {/* Background Confetti Particles */}
      <div className="confetti-particles-layer" aria-hidden="true" style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none',
        zIndex: 1
      }}>
        <div className="confetti-piece p1" style={{ position: 'absolute', top: '12%', left: '15%', background: '#4DD0E1', width: 10, height: 10, borderRadius: 2 }} />
        <div className="confetti-piece p2" style={{ position: 'absolute', top: '18%', left: '28%', background: '#FF5252', width: 12, height: 8, borderRadius: 2 }} />
        <div className="confetti-piece p3" style={{ position: 'absolute', top: '25%', left: '34%', background: '#FFC72C', width: 14, height: 8, borderRadius: 2 }} />
        <div className="confetti-piece p4" style={{ position: 'absolute', top: '10%', left: '46%', background: '#22C55E', width: 10, height: 10, borderRadius: 2 }} />
        <div className="confetti-piece p5" style={{ position: 'absolute', top: '15%', left: '54%', background: '#7C4DFF', width: 12, height: 12, borderRadius: 2 }} />
        <div className="confetti-piece p6" style={{ position: 'absolute', top: '22%', left: '60%', background: '#FFC72C', width: 10, height: 14, borderRadius: 2 }} />
        <div className="confetti-piece p7" style={{ position: 'absolute', top: '30%', left: '73%', background: '#E91E63', width: 10, height: 10, borderRadius: 2 }} />
        <div className="confetti-piece p8" style={{ position: 'absolute', top: '14%', left: '84%', background: '#4DD0E1', width: 12, height: 8, borderRadius: 2 }} />
        <div className="confetti-piece p9" style={{ position: 'absolute', top: '28%', left: '92%', background: '#22C55E', width: 10, height: 10, borderRadius: 2 }} />
        <div className="confetti-piece p10" style={{ position: 'absolute', top: '44%', left: '8%', background: '#FF5252', width: 10, height: 12, borderRadius: 2 }} />
        <div className="confetti-piece p11" style={{ position: 'absolute', top: '48%', left: '27%', background: '#FFC72C', width: 12, height: 12, borderRadius: 2 }} />
        <div className="confetti-piece p12" style={{ position: 'absolute', top: '42%', left: '39%', background: '#7C4DFF', width: 10, height: 10, borderRadius: 2 }} />
        <div className="confetti-piece p13" style={{ position: 'absolute', top: '46%', left: '61%', background: '#E91E63', width: 10, height: 14, borderRadius: 2 }} />
        <div className="confetti-piece p14" style={{ position: 'absolute', top: '52%', left: '85%', background: '#FFC72C', width: 12, height: 8, borderRadius: 2 }} />
        <div className="confetti-piece p15" style={{ position: 'absolute', top: '76%', left: '22%', background: '#FF5252', width: 12, height: 10, borderRadius: 2 }} />
        <div className="confetti-piece p16" style={{ position: 'absolute', top: '82%', left: '66%', background: '#4DD0E1', width: 10, height: 10, borderRadius: 2 }} />
        <div className="confetti-piece p17" style={{ position: 'absolute', top: '78%', left: '90%', background: '#22C55E', width: 12, height: 12, borderRadius: 2 }} />
      </div>

      {/* Main Glass Card matching reference design */}
      <div className="reflect-card-box font-fredoka" style={{
        position: 'relative',
        zIndex: 10,
        width: 'clamp(320px, 88vw, 450px)',
        maxHeight: 'calc(100vh - 100px)',
        background: 'rgba(22, 16, 56, 0.95)',
        border: '1.5px solid rgba(255, 199, 44, 0.4)',
        borderRadius: '26px',
        padding: 'clamp(1rem, 2vh, 1.4rem) clamp(1.2rem, 3vw, 1.6rem)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 30px rgba(124, 77, 255, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(0.4rem, 1.2vh, 0.65rem)',
        backdropFilter: 'blur(16px)',
        boxSizing: 'border-box'
      }}>
        {/* Top Trophy Icon */}
        <div style={{ fontSize: 'clamp(2.0rem, 4vh, 2.5rem)', lineHeight: 1 }}>
          🏆
        </div>

        {/* Header Text */}
        <div style={{ textAlign: 'center', marginTop: '-0.2rem' }}>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(1.4rem, 3vh, 1.85rem)',
            color: '#FFFFFF',
            fontWeight: 900,
            fontFamily: 'Fredoka, sans-serif',
            letterSpacing: '0.2px'
          }}>
            Journey Complete!
          </h2>
          <p style={{
            margin: '2px 0 0 0',
            fontSize: 'clamp(0.85rem, 1.8vh, 0.95rem)',
            color: '#B3A8E0',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700
          }}>
            You finished all 5 phases!
          </p>
        </div>

        {/* Circular Progress Ring Gauge (Dynamic percentage & fraction) */}
        <div className="reflect-ring-gauge-container" style={{
          position: 'relative',
          width: 'clamp(110px, 20vh, 130px)',
          height: 'clamp(110px, 20vh, 130px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0.2rem 0'
        }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 120 120"
            style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
          >
            {/* Background Track Circle */}
            <circle
              cx="60"
              cy="60"
              r={normalizedRadius}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Gold Progress Arc */}
            <circle
              cx="60"
              cy="60"
              r={normalizedRadius}
              stroke="#FFC72C"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          {/* Inner Dynamic Stats */}
          <div style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <span style={{
              fontSize: 'clamp(1.6rem, 3.2vh, 2.1rem)',
              color: '#FFC72C',
              fontWeight: 900,
              fontFamily: 'Fredoka, sans-serif',
              lineHeight: 1
            }}>
              {percent}%
            </span>
            <span style={{
              fontSize: 'clamp(0.85rem, 1.7vh, 0.98rem)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontFamily: 'Fredoka, sans-serif',
              marginTop: '2px'
            }}>
              {displayFraction}
            </span>
          </div>
        </div>

        {/* Dynamic 3 Stars Row */}
        <div style={{ display: 'flex', gap: '0.4rem', fontSize: '1.35rem', margin: '-0.1rem 0 0.1rem 0' }}>
          <span style={{ color: filledStarsCount >= 1 ? '#FFC72C' : '#52497A' }}>★</span>
          <span style={{ color: filledStarsCount >= 2 ? '#FFC72C' : '#52497A' }}>★</span>
          <span style={{ color: filledStarsCount >= 3 ? '#FFC72C' : '#52497A' }}>★</span>
        </div>

        {/* 3 Stat Metric Cards Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.5rem',
          width: '100%',
        }}>
          {/* Box 1: XP Earned */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '0.55rem 0.3rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ fontSize: 'clamp(1.1rem, 2.4vh, 1.3rem)', color: '#FFFFFF', fontWeight: 900 }}>{xp}</div>
            <div style={{ fontSize: 'clamp(0.68rem, 1.4vh, 0.76rem)', color: '#B3A8E0', fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>XP Earned</div>
          </div>

          {/* Box 2: Max Streak */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '0.55rem 0.3rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ fontSize: 'clamp(1.1rem, 2.4vh, 1.3rem)', color: '#FF9800', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
              <span>🔥</span><span>{maxStreak}</span>
            </div>
            <div style={{ fontSize: 'clamp(0.68rem, 1.4vh, 0.76rem)', color: '#B3A8E0', fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>Max Streak</div>
          </div>

          {/* Box 3: Teaching / Modules Completed */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '0.55rem 0.3rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ fontSize: 'clamp(1.1rem, 2.4vh, 1.3rem)', color: '#FFFFFF', fontWeight: 900 }}>{attemptedScores.length}/3</div>
            <div style={{ fontSize: 'clamp(0.68rem, 1.4vh, 0.76rem)', color: '#B3A8E0', fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>Teaching</div>
          </div>
        </div>

        {/* 3 Dynamic Strategy Category Progress Strips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
          {/* Strip 1: Decompose Strategy */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '0.45rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem', color: '#FFFFFF', fontWeight: 800 }}>
              <span>🌈</span>
              <span>{decompScore}/10</span>
            </div>
            <div style={{ color: '#FFC72C', fontSize: '0.95rem', letterSpacing: '2px' }}>
              {getCategoryStars(decompScore).text}
            </div>
          </div>

          {/* Strip 2: Bridge Ten Strategy */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '0.45rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem', color: '#FFFFFF', fontWeight: 800 }}>
              <span>🦄</span>
              <span>{bridgeScore}/10</span>
            </div>
            <div style={{ color: '#FFC72C', fontSize: '0.95rem', letterSpacing: '2px' }}>
              {getCategoryStars(bridgeScore).text}
            </div>
          </div>

          {/* Strip 3: Compensation Strategy */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '0.45rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem', color: '#FFFFFF', fontWeight: 800 }}>
              <span>🚀</span>
              <span>{compScore}/10</span>
            </div>
            <div style={{ color: '#FFC72C', fontSize: '0.95rem', letterSpacing: '2px' }}>
              {getCategoryStars(compScore).text}
            </div>
          </div>
        </div>

        {/* Mascot Speech Bubble Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          width: '100%',
          margin: '0.1rem 0'
        }}>
          {/* Mascot Circle Avatar */}
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#FFC72C',
            border: '2px solid #FFA000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(255, 199, 44, 0.35)'
          }}>
            🐻
          </div>

          {/* Speech Bubble */}
          <div style={{
            flex: 1,
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '0.55rem 0.85rem',
            color: '#1A1A1A',
            fontSize: 'clamp(0.8rem, 1.6vh, 0.88rem)',
            fontWeight: 800,
            fontFamily: 'Fredoka, sans-serif',
            lineHeight: 1.25,
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            {mascotText}
          </div>
        </div>

        {/* Bottom Action Buttons Row */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          width: '100%',
          marginTop: '0.2rem'
        }}>
          {/* Play Again Button */}
          <button
            onClick={handlePlayAgainClick}
            className="reflect-action-btn-play font-fredoka"
            aria-label="Play Again"
            style={{
              flex: 1,
              background: '#FFC72C',
              color: '#1A1A1A',
              border: 'none',
              borderRadius: '16px',
              padding: '0.7rem 0.85rem',
              fontSize: 'clamp(0.95rem, 2vh, 1.08rem)',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: '0 6px 18px rgba(255, 199, 44, 0.4)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span>🔄</span>
            <span>Play Again</span>
          </button>

          {/* Home Button */}
          <button
            onClick={handleHomeClick}
            className="reflect-action-btn-home font-fredoka"
            aria-label="Go Home"
            style={{
              flex: 1,
              background: '#FFFFFF',
              color: '#1A1A1A',
              border: 'none',
              borderRadius: '16px',
              padding: '0.7rem 0.85rem',
              fontSize: 'clamp(0.95rem, 2vh, 1.08rem)',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: '0 6px 18px rgba(255, 255, 255, 0.25)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span>🏠</span>
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
