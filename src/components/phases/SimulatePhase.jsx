import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';
import PlaceValueBlocks from '../shared/PlaceValueBlocks';
import NumberLine from '../shared/NumberLine';
import HundredsChart from '../shared/HundredsChart';
import BalanceScale from '../shared/BalanceScale';
import { CheckCircle } from 'lucide-react';
import { playSound } from '../../utils/audio';
import { narrate, stopNarration } from '../../utils/audio';
import { shuffleArray } from '../../utils/shuffle';
import * as narrations from '../../utils/narration';

const BASE_STATIONS = [
  { id: 0, key: "decompose", name: "Concrete Grouping", icon: "🍎", desc: "Add Tens, Then Ones" },
  { id: 1, key: "bridgeTen", name: "Bridge Ten", icon: "⭕", desc: "Make the Next Ten" },
  { id: 2, key: "hundredsChart", name: "Hundreds Chart", icon: "✏️", desc: "Jump Rows & Columns" },
  { id: 3, key: "compensate", name: "Compensation", icon: "📊", desc: "Round and Adjust" }
];

const STATION_VARIANTS = {
  decompose: [
    { addend1: 34, addend2: 25, problem: "34 + 25", correct: 59 },
    { addend1: 28, addend2: 14, problem: "28 + 14", correct: 42 },
    { addend1: 43, addend2: 16, problem: "43 + 16", correct: 59 },
    { addend1: 51, addend2: 18, problem: "51 + 18", correct: 69 }
  ],
  bridgeTen: [
    { start: 37, addend2: 6, problem: "37 + 6", correct: 43 },
    { start: 28, addend2: 7, problem: "28 + 7", correct: 35 },
    { start: 46, addend2: 9, problem: "46 + 9", correct: 55 },
    { start: 19, addend2: 8, problem: "19 + 8", correct: 27 }
  ],
  hundredsChart: [
    { startCell: 45, addend2: 23, problem: "45 + 23", correct: 68 },
    { startCell: 27, addend2: 14, problem: "27 + 14", correct: 41 },
    { startCell: 38, addend2: 16, problem: "38 + 16", correct: 54 },
    { startCell: 52, addend2: 19, problem: "52 + 19", correct: 71 }
  ],
  compensate: [
    { addend1: 46, addend2: 39, problem: "46 + 39", correct: 85 },
    { addend1: 58, addend2: 29, problem: "58 + 29", correct: 87 },
    { addend1: 33, addend2: 19, problem: "33 + 19", correct: 52 },
    { addend1: 24, addend2: 19, problem: "24 + 19", correct: 43 }
  ]
};

const getRandomSimStations = () => BASE_STATIONS.map((station) => {
  const variants = STATION_VARIANTS[station.key] || [];
  const chosen = shuffleArray(variants)[0];
  return { ...station, ...chosen };
});

export default function SimulatePhase({ 
  simStationsComplete = [false, false, false, false],
  onUpdateStationProgress,
  audioEnabled = true,
  onComplete 
}) {
  const [simStations, setSimStations] = useState(getRandomSimStations());
  const [activeStation, setActiveStation] = useState(0);
  
  // ==========================================
  // STATION STATE VALUES
  // ==========================================
  const [s1AddedTens, setS1AddedTens] = useState(0);
  const [s1AddedOnes, setS1AddedOnes] = useState(0);
  const [s1Step, setS1Step] = useState(1);

  const [s2SplitDone, setS2SplitDone] = useState(false);
  const [s2JumpsAdded, setS2JumpsAdded] = useState(0);

  const [s3CurrentCell, setS3CurrentCell] = useState(45);
  const [s3Path, setS3Path] = useState(new Set([45]));
  const [s3TensAdded, setS3TensAdded] = useState(0);
  const [s3OnesAdded, setS3OnesAdded] = useState(0);

  const [s4Rounded, setS4Rounded] = useState(false);
  const [s4Adjusted, setS4Adjusted] = useState(false);

  const activeStationData = simStations[activeStation] || simStations[0] || BASE_STATIONS[0];
  const s1TensTarget = Math.floor((activeStationData.addend2 || 0) / 10);
  const s1OnesTarget = (activeStationData.addend2 || 0) % 10;
  const s2Start = activeStationData.start || 0;
  const s2Addend = activeStationData.addend2 || 0;
  const s2NeedToNextTen = 10 - (s2Start % 10);
  const s2NextTen = s2Start + s2NeedToNextTen;
  const s2Remainder = s2Addend - s2NeedToNextTen;
  const s3TensTarget = Math.floor((activeStationData.addend2 || 0) / 10);
  const s3OnesTarget = (activeStationData.addend2 || 0) % 10;
  const s4RoundedValue = Math.ceil((activeStationData.addend2 || 0) / 10) * 10;
  const s4AdjustBy = s4RoundedValue - (activeStationData.addend2 || 0);
  const s4RoundedSum = activeStationData.addend1 + s4RoundedValue;

  // Check answers states
  const [stationAnswers, setStationAnswers] = useState({ 0: '', 1: '', 2: '', 3: '' });
  const [popup, setPopup] = useState({ show: false, correct: true, text: '' });

  // Sync narration on station changes
  useEffect(() => {
    if (!audioEnabled) return;
    
    let segment = [];
    switch (activeStation) {
      case 0:
        segment = narrations.simulateDecomposeNarration();
        break;
      case 1:
        segment = narrations.simulateBridgeNarration();
        break;
      case 2:
        segment = narrations.simulateHundredsNarration();
        break;
      case 3:
        segment = narrations.simulateCompensateNarration();
        break;
      default:
        break;
    }
    
    if (segment.length > 0) {
      narrate(segment, true);
    }
    
    return () => stopNarration();
  }, [audioEnabled, activeStation]);

  // Ensure Station 3 (Hundreds Chart) syncs startCell correctly
  useEffect(() => {
    if (activeStation === 2) {
      const startCell = activeStationData.startCell || activeStationData.addend1 || 46;
      setS3CurrentCell(startCell);
      setS3Path(new Set([startCell]));
      setS3TensAdded(0);
      setS3OnesAdded(0);
    } else if (activeStation === 3) {
      setS4Rounded(false);
      setS4Adjusted(false);
    }
  }, [activeStation, activeStationData.startCell, activeStationData.addend1]);

  // Reset station states for replayability
  const resetStation = (index) => {
    const stationConfig = simStations[index] || {};

    if (index === 0) {
      setS1AddedTens(0);
      setS1AddedOnes(0);
      setS1Step(1);
    } else if (index === 1) {
      setS2SplitDone(false);
      setS2JumpsAdded(0);
    } else if (index === 2) {
      const startCell = stationConfig.startCell || stationConfig.addend1 || 46;
      setS3CurrentCell(startCell);
      setS3Path(new Set([startCell]));
      setS3TensAdded(0);
      setS3OnesAdded(0);
    } else if (index === 3) {
      setS4Rounded(false);
      setS4Adjusted(false);
    }
    setStationAnswers(prev => ({ ...prev, [index]: '' }));
    onUpdateStationProgress(index, false);
  };

  // ==========================================
  // STATION 1: INTERACTION (Section A: Decompose)
  // ==========================================
  const handleS1BlockTap = () => {
    if (s1Step === 1) {
      if (s1AddedTens < s1TensTarget) {
        const nextTens = s1AddedTens + 1;
        setS1AddedTens(nextTens);
        playSound('chime');
        if (nextTens >= s1TensTarget) {
          if (s1OnesTarget > 0) {
            setS1Step(2);
          } else {
            setS1Step(3);
          }
        }
      }
    } else if (s1Step === 2) {
      if (s1AddedOnes < s1OnesTarget) {
        const nextOnes = s1AddedOnes + 1;
        setS1AddedOnes(nextOnes);
        playSound('chime');
        if (nextOnes >= s1OnesTarget) {
          setS1Step(3);
        }
      }
    }
  };

  // ==========================================
  // STATION 2: INTERACTION
  // ==========================================
  const handleS2Split = () => {
    setS2SplitDone(true);
    playSound('chime');
  };

  const handleS2AddJump = (jumpIndex) => {
    if (s2SplitDone && s2JumpsAdded === jumpIndex) {
      setS2JumpsAdded(jumpIndex + 1);
      playSound('chime');
    }
  };

  // ==========================================
  // STATION 3: INTERACTION (Section C: Hundreds Chart)
  // ==========================================
  const handleS3JumpDown = () => {
    if (s3TensAdded < s3TensTarget) {
      const nextCell = s3CurrentCell + 10;
      setS3CurrentCell(nextCell);
      setS3Path(prev => {
        const next = new Set(prev);
        next.add(nextCell);
        return next;
      });
      setS3TensAdded(prev => prev + 1);
      playSound('chime');
    }
  };

  const handleS3JumpRight = () => {
    if (s3TensAdded === s3TensTarget && s3OnesAdded < s3OnesTarget) {
      const nextCell = s3CurrentCell + 1;
      setS3CurrentCell(nextCell);
      setS3Path(prev => {
        const next = new Set(prev);
        next.add(nextCell);
        return next;
      });
      const nextOnes = s3OnesAdded + 1;
      setS3OnesAdded(nextOnes);
      playSound('chime');
    }
  };

  // ==========================================
  // STATION 4: INTERACTION (Section D: Compensation)
  // ==========================================
  const handleS4Round = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!s4Rounded) {
      setS4Rounded(true);
      playSound('chime');
      if (audioEnabled) {
        narrate(`Rounding ${activeStationData.addend2} up to ${s4RoundedValue} makes the scale ${s4AdjustBy} too heavy!`, true);
      }
    }
  };

  const handleS4Adjust = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (s4Rounded && !s4Adjusted) {
      setS4Adjusted(true);
      // Auto-prefill the final answer input for seamless Grade 2 UX
      setStationAnswers(prev => ({ ...prev, [3]: String(activeStationData.correct) }));
      playSound('chime');
      if (audioEnabled) {
        narrate(`Subtracting ${s4AdjustBy} balances the scale perfectly at ${activeStationData.correct}!`, true);
      }
    }
  };

  // Final answer checker
  const handleCheckAnswer = () => {
    const inputVal = stationAnswers[activeStation].trim();
    if (!inputVal) return;

    const ansNum = parseInt(inputVal, 10);
    const correctVal = activeStationData.correct;

    if (ansNum === correctVal) {
      playSound('correct');
      setPopup({
        show: true,
        correct: true,
        text: `Correct! 🎉 ${activeStationData.problem} = ${correctVal}. Excellent strategy work!`
      });
      onUpdateStationProgress(activeStation, true);
    } else {
      playSound('incorrect');
      setPopup({
        show: true,
        correct: false,
        text: `Not quite! ${ansNum} is not the correct sum. Check your steps and try again.`
      });
    }
  };

  const handlePopupContinue = () => {
    setPopup(prev => ({ ...prev, show: false }));
    if (popup.correct) {
      if (activeStation < 3) {
        setActiveStation(prev => prev + 1);
      } else {
        onComplete();
      }
    }
  };

  useEffect(() => {
    if (popup.show && popup.correct) {
      const timer = setTimeout(() => {
        handlePopupContinue();
      }, 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [popup.show, popup.correct]);

  const stepsFinished = (
    (activeStation === 0 && s1Step === 3) ||
    (activeStation === 1 && s2JumpsAdded === 2) ||
    (activeStation === 2 && s3OnesAdded === s3OnesTarget) ||
    (activeStation === 3 && s4Adjusted)
  );

  return (
    <>
      <div className="ss-simulate-page-container animate-fade-in">
        {/* Header Title and Subtitle */}
        <div className="ss-sim-header-group">
          <h2 className="ss-sim-title font-fredoka">🧪 Strategy Sandbox</h2>
          <p className="ss-sim-subtitle font-nunito">Master Mental Math Shortest Paths!</p>

          {/* 4 Station Strategy Tab Buttons */}
          <div className="ss-sim-tabs-row">
            {simStations.map((st) => {
              const isActive = activeStation === st.id;
              const isDone = simStationsComplete[st.id];

              return (
                <button
                  key={st.id}
                  onClick={() => setActiveStation(st.id)}
                  className={`ss-sim-tab-btn ${isActive ? 'tab-active' : ''} ${isDone ? 'tab-complete' : ''}`}
                  title={st.name}
                  aria-label={`Switch to ${st.name}`}
                >
                  <span className="tab-icon">{st.icon}</span>
                  <span className="tab-label font-fredoka">{st.name}</span>
                  {isDone && <CheckCircle size={14} style={{ color: '#22c55e', marginLeft: '2px' }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Simulation Sandbox Glass Box matching screenshot */}
        <div className="ss-sim-sandbox-card animate-fade-in">
          <h3 className="ss-sim-card-title font-fredoka">
            {activeStationData.icon} {activeStationData.name}
          </h3>
          <p className="ss-sim-card-desc font-nunito">
            Solve <strong>{activeStationData.problem}</strong> by following the mental shortcut steps below!
          </p>

          {/* Station 1: Decompose */}
          {activeStation === 0 && (
            <div className="sim-station-box">
              <div className="sim-station-header">
                <button onClick={() => resetStation(0)} className="sim-reset-btn font-fredoka" style={{ padding: '0.3rem 0.85rem', fontSize: '0.88rem' }}>Reset</button>
              </div>

              <div className="sim-workspace-blocks">
                <div className="sim-placevalue-row" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'nowrap', width: '100%' }}>
                  <div className="block-group-box" style={{ flex: '1 1 0', maxWidth: '360px', background: 'rgba(18, 10, 51, 0.4)', padding: '0.75rem 1.1rem', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
                    <span className="group-title font-fredoka" style={{ color: '#E2D8FF', display: 'block', marginBottom: '0.4rem', fontSize: '1.15rem', fontWeight: 800 }}>Start with {activeStationData.addend1}</span>
                    <PlaceValueBlocks tens={Math.floor(activeStationData.addend1 / 10)} ones={activeStationData.addend1 % 10} size="md" />
                  </div>

                  <div className="sim-plus-sign font-fredoka" style={{ fontSize: '2.2rem', color: '#FFC72C', fontWeight: 900, flexShrink: 0 }}>+</div>

                  <div 
                    className="block-group-box interactive-block-area"
                    onClick={() => {
                      if (s1Step < 3) handleS1BlockTap();
                    }}
                    style={{ 
                      flex: '1 1 0',
                      maxWidth: '360px',
                      background: s1Step < 3 ? 'rgba(124, 77, 255, 0.2)' : 'rgba(18, 10, 51, 0.4)', 
                      padding: '0.75rem 1.1rem', 
                      borderRadius: '18px', 
                      border: s1Step < 3 ? '2px dashed #7C4DFF' : '1px solid rgba(255, 255, 255, 0.1)', 
                      textAlign: 'center',
                      cursor: s1Step < 3 ? 'pointer' : 'default',
                      transition: 'all 0.2s ease'
                    }}
                    title={s1Step === 1 ? "Tap to add Ten Rod" : s1Step === 2 ? "Tap to add Unit Cube" : ""}
                  >
                    <span className="group-title font-fredoka" style={{ color: '#E2D8FF', display: 'block', marginBottom: '0.4rem', fontSize: '1.2rem', fontWeight: 800 }}>
                      Add {activeStationData.addend2} ({s1TensTarget} Tens, {s1OnesTarget} Ones)
                    </span>
                    <PlaceValueBlocks 
                      tens={s1AddedTens} 
                      ones={s1AddedOnes} 
                      size="md" 
                      type="to-add-tens" 
                      interactive={s1Step < 3}
                      onAction={() => handleS1BlockTap()}
                    />
                    {s1Step < 3 && (
                      <span className="tap-hint-label font-fredoka" style={{ display: 'block', marginTop: '0.45rem', color: '#FFC72C', fontSize: '1.05rem', fontWeight: 900 }}>
                        👈 {s1Step === 1 ? 'Tap block box or button below to add Tens' : 'Tap block box or button below to add Ones'}
                      </span>
                    )}
                  </div>
                </div>

                {!stepsFinished && (
                  <div className="sim-interactive-controls mt-3" style={{ display: 'flex', justifyContent: 'center' }}>
                    {s1Step === 1 && (
                      <button 
                        onClick={() => handleS1BlockTap()} 
                        className="sim-action-trigger-btn font-fredoka animate-pulse"
                        style={{ padding: '0.85rem 2.2rem', fontSize: '1.2rem', cursor: 'pointer', background: '#FFC72C', color: '#1A1A1A', border: 'none', borderRadius: '22px', fontWeight: 900, boxShadow: '0 6px 20px rgba(255, 199, 44, 0.4)' }}
                      >
                        ➕ Tap to Add 10 Rod ({s1AddedTens}/{s1TensTarget} Tens Added)
                      </button>
                    )}
                    {s1Step === 2 && (
                      <button 
                        onClick={() => handleS1BlockTap()} 
                        className="sim-action-trigger-btn font-fredoka animate-pulse"
                        style={{ padding: '0.85rem 2.2rem', fontSize: '1.2rem', cursor: 'pointer', background: '#FFC72C', color: '#1A1A1A', border: 'none', borderRadius: '22px', fontWeight: 900, boxShadow: '0 6px 20px rgba(255, 199, 44, 0.4)' }}
                      >
                        ➕ Tap to Add 1 Unit Cube ({s1AddedOnes}/{s1OnesTarget} Ones Added)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Station 2: Bridge to 10 (Section B) */}
          {activeStation === 1 && (
            <div className="sim-station-box">
              <div className="sim-station-header">
                <button onClick={() => resetStation(1)} className="sim-reset-btn font-fredoka" style={{ padding: '0.3rem 0.85rem', fontSize: '0.88rem' }}>Reset</button>
              </div>

              <div 
                className="sim-workspace-numberline interactive-block-area"
                onClick={() => {
                  if (!stepsFinished) {
                    if (!s2SplitDone) handleS2Split();
                    else if (s2JumpsAdded === 0) handleS2AddJump(0);
                    else if (s2JumpsAdded === 1) handleS2AddJump(1);
                  }
                }}
                style={{ 
                  background: !stepsFinished ? 'rgba(124, 77, 255, 0.15)' : 'rgba(18, 10, 51, 0.4)',
                  padding: '0.85rem 1.2rem',
                  borderRadius: '18px',
                  border: !stepsFinished ? '2px dashed #7C4DFF' : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: !stepsFinished ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <NumberLine 
                  min={s2Start - 2} 
                  max={s2Start + s2Addend + 4} 
                  marked={[s2Start, s2SplitDone ? s2NextTen : null, s2JumpsAdded === 2 ? activeStationData.correct : null].filter(Boolean)} 
                  jumps={[
                    s2JumpsAdded >= 1 ? { from: s2Start, to: s2NextTen, label: `+${s2NeedToNextTen}`, color: "#4CAF50" } : null,
                    s2JumpsAdded >= 2 ? { from: s2NextTen, to: activeStationData.correct, label: `+${s2Remainder}`, color: "#FF9800" } : null
                  ].filter(Boolean)}
                  activeValue={s2JumpsAdded === 2 ? activeStationData.correct : s2JumpsAdded === 1 ? s2NextTen : s2Start}
                />
                {!stepsFinished && (
                  <span className="tap-hint-label font-fredoka" style={{ display: 'block', marginTop: '0.45rem', color: '#FFC72C', fontSize: '1.05rem', fontWeight: 900 }}>
                    👈 Tap number line or button below to advance
                  </span>
                )}
              </div>

              {!stepsFinished && (
                <div className="sim-interactive-controls mt-3 font-fredoka flex justify-center">
                  {!s2SplitDone ? (
                    <button 
                      onClick={handleS2Split} 
                      className="sim-action-trigger-btn font-fredoka animate-pulse"
                      style={{ padding: '0.85rem 2.2rem', fontSize: '1.2rem', cursor: 'pointer', background: '#FFC72C', color: '#1A1A1A', border: 'none', borderRadius: '22px', fontWeight: 900, boxShadow: '0 6px 20px rgba(255, 199, 44, 0.4)' }}
                    >
                      1. Split +{s2Addend} into (+{s2NeedToNextTen} to reach {s2NextTen}) and (+{s2Remainder} remaining)
                    </button>
                  ) : s2JumpsAdded === 0 ? (
                    <button 
                      onClick={() => handleS2AddJump(0)} 
                      className="sim-action-trigger-btn font-fredoka animate-pulse"
                      style={{ padding: '0.85rem 2.2rem', fontSize: '1.2rem', cursor: 'pointer', background: '#FFC72C', color: '#1A1A1A', border: 'none', borderRadius: '22px', fontWeight: 900, boxShadow: '0 6px 20px rgba(255, 199, 44, 0.4)' }}
                    >
                      2. Jump +{s2NeedToNextTen} from {s2Start} ➔ {s2NextTen} (Make 10!)
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleS2AddJump(1)} 
                      className="sim-action-trigger-btn font-fredoka animate-pulse"
                      style={{ padding: '0.85rem 2.2rem', fontSize: '1.2rem', cursor: 'pointer', background: '#FFC72C', color: '#1A1A1A', border: 'none', borderRadius: '22px', fontWeight: 900, boxShadow: '0 6px 20px rgba(255, 199, 44, 0.4)' }}
                    >
                      3. Jump remaining +{s2Remainder} from {s2NextTen} ➔ {activeStationData.correct}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Station 3: Hundreds Chart (Section C) */}
          {activeStation === 2 && (
            <div className="sim-station-box">
              <div className="sim-station-header">
                <button onClick={() => resetStation(2)} className="sim-reset-btn font-fredoka" style={{ padding: '0.3rem 0.85rem', fontSize: '0.88rem' }}>Reset</button>
              </div>

              <div 
                className="sim-workspace-grid flex flex-col items-center interactive-block-area"
                onClick={() => {
                  if (!stepsFinished) {
                    if (s3TensAdded < s3TensTarget) handleS3JumpDown();
                    else if (s3OnesAdded < s3OnesTarget) handleS3JumpRight();
                  }
                }}
                style={{ 
                  background: !stepsFinished ? 'rgba(124, 77, 255, 0.15)' : 'rgba(18, 10, 51, 0.4)',
                  padding: '0.75rem 1rem',
                  borderRadius: '18px',
                  border: !stepsFinished ? '2px dashed #7C4DFF' : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: !stepsFinished ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <HundredsChart 
                  startCell={activeStationData.startCell} 
                  highlighted={s3Path} 
                  current={s3CurrentCell} 
                  onCellClick={(val) => {
                    if (!stepsFinished) {
                      if (s3TensAdded < s3TensTarget && val === s3CurrentCell + 10) handleS3JumpDown();
                      else if (s3TensAdded === s3TensTarget && s3OnesAdded < s3OnesTarget && val === s3CurrentCell + 1) handleS3JumpRight();
                      else if (s3TensAdded < s3TensTarget) handleS3JumpDown();
                      else if (s3OnesAdded < s3OnesTarget) handleS3JumpRight();
                    }
                  }}
                />

                {!stepsFinished && (
                  <span className="tap-hint-label font-fredoka" style={{ display: 'block', marginTop: '0.45rem', color: '#FFC72C', fontSize: '1.05rem', fontWeight: 900 }}>
                    👈 Tap grid or button below to jump on hundreds chart
                  </span>
                )}
              </div>

              {!stepsFinished && (
                <div className="sim-interactive-controls mt-3 font-fredoka flex justify-center">
                  {s3TensAdded < s3TensTarget && (
                    <button 
                      onClick={handleS3JumpDown} 
                      className="sim-action-trigger-btn font-fredoka animate-pulse"
                      style={{ padding: '0.85rem 2.2rem', fontSize: '1.2rem', cursor: 'pointer', background: '#FFC72C', color: '#1A1A1A', border: 'none', borderRadius: '22px', fontWeight: 900, boxShadow: '0 6px 20px rgba(255, 199, 44, 0.4)' }}
                    >
                      ⬇️ Jump Down 1 Row (+10) [{s3TensAdded}/{s3TensTarget}]
                    </button>
                  )}
                  {s3TensAdded === s3TensTarget && s3OnesAdded < s3OnesTarget && (
                    <button 
                      onClick={handleS3JumpRight} 
                      className="sim-action-trigger-btn font-fredoka animate-pulse"
                      style={{ padding: '0.85rem 2.2rem', fontSize: '1.2rem', cursor: 'pointer', background: '#FFC72C', color: '#1A1A1A', border: 'none', borderRadius: '22px', fontWeight: 900, boxShadow: '0 6px 20px rgba(255, 199, 44, 0.4)' }}
                    >
                      ➡️ Jump Right 1 Cell (+1) [{s3OnesAdded}/{s3OnesTarget}]
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Station 4: Compensation (Section D) */}
          {activeStation === 3 && (
            <div className="sim-station-box">
              <div className="sim-station-header">
                <button onClick={() => resetStation(3)} className="sim-reset-btn font-fredoka" style={{ padding: '0.3rem 0.85rem', fontSize: '0.88rem' }}>Reset</button>
              </div>

              <div 
                className="sim-scale-arena interactive-block-area"
                onClick={(e) => {
                  if (!stepsFinished) {
                    if (!s4Rounded) handleS4Round(e);
                    else if (!s4Adjusted) handleS4Adjust(e);
                  }
                }}
                style={{ 
                  background: !stepsFinished ? 'rgba(124, 77, 255, 0.15)' : 'rgba(18, 10, 51, 0.4)',
                  padding: '0.75rem 1rem',
                  minHeight: '230px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '18px',
                  border: !stepsFinished ? '2px dashed #7C4DFF' : '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: !stepsFinished ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <BalanceScale 
                  leftValue={activeStationData.correct} 
                  rightValue={s4Adjusted ? activeStationData.correct : s4Rounded ? s4RoundedSum : (activeStationData.addend1 + activeStationData.addend2)} 
                  leftLabel={`Target Sum (${activeStationData.correct})`} 
                  rightLabel={s4Adjusted ? "Balanced ✓" : s4Rounded ? `+${s4AdjustBy} Too Heavy! ⚠️` : `${activeStationData.addend1} + ${activeStationData.addend2}`}
                />
                {!stepsFinished && (
                  <span className="tap-hint-label font-fredoka" style={{ display: 'block', marginTop: '0.45rem', color: '#FFC72C', fontSize: '1.1rem', fontWeight: 900 }}>
                    👈 Tap scale box OR press big button below to balance!
                  </span>
                )}
              </div>

              {!stepsFinished && (
                <div className="scale-control-panel font-fredoka mt-3 flex justify-center" style={{ width: '100%' }}>
                  {!s4Rounded ? (
                    <button 
                      onClick={(e) => handleS4Round(e)} 
                      className="sim-action-trigger-btn font-fredoka animate-pulse"
                      style={{ 
                        padding: '0.9rem 2.2rem', 
                        fontSize: '1.25rem', 
                        cursor: 'pointer', 
                        background: '#FFC72C', 
                        color: '#1A1A1A', 
                        border: '3px solid #FFA000', 
                        borderRadius: '24px', 
                        fontWeight: 900, 
                        boxShadow: '0 8px 24px rgba(255, 199, 44, 0.55)',
                        minWidth: '280px'
                      }}
                    >
                      1. Round {activeStationData.addend2} up to {s4RoundedValue} (+{s4AdjustBy} extra) ⚖️
                    </button>
                  ) : (
                    <div className="scale-adjust-block animate-bounce-in flex flex-col items-center" style={{ width: '100%' }}>
                      <span className="scale-tilt-warning font-nunito text-danger block mb-2" style={{ color: '#FF5252', fontWeight: 900, fontSize: '1.15rem' }}>
                        ⚠️ The scale tilted! You added {s4AdjustBy} too many (+{s4AdjustBy}).
                      </span>
                      <button 
                        onClick={(e) => handleS4Adjust(e)} 
                        className="sim-action-trigger-btn font-fredoka animate-pulse"
                        style={{ 
                          padding: '0.9rem 2.2rem', 
                          fontSize: '1.25rem', 
                          cursor: 'pointer', 
                          background: '#FF5252', 
                          color: '#FFFFFF', 
                          border: '3px solid #D32F2F', 
                          borderRadius: '24px', 
                          fontWeight: 900, 
                          boxShadow: '0 8px 24px rgba(255, 82, 82, 0.6)',
                          minWidth: '280px'
                        }}
                      >
                        2. Subtract {s4AdjustBy} to balance scale (-{s4AdjustBy}) ⚖️
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Final Answer Checker */}
          {stepsFinished && (
            <div className="sandbox-check-answer-box animate-fade-in font-fredoka">
              <div className="sim-mastered-strip text-success font-fredoka">
                {activeStation === 0 && `Decomposition Complete! ${activeStationData.addend1} + ${s1TensTarget * 10} + ${s1OnesTarget} = ${activeStationData.correct} ✓`}
                {activeStation === 1 && `Bridging Complete! Landed on ${activeStationData.correct} ✓`}
                {activeStation === 2 && `Grid Path Complete! Landed on ${activeStationData.correct} ✓`}
                {activeStation === 3 && `Scale balanced perfectly at ${activeStationData.correct}! ✓`}
              </div>

              {simStationsComplete[activeStation] ? (
                <div className="sandbox-completed-badge font-fredoka text-success flex items-center justify-center gap-2 mt-2" style={{ fontSize: '1.25rem' }}>
                  <CheckCircle size={26} /> Sandbox Completed! Strategy Mastered!
                </div>
              ) : (
                <div className="sim-final-input-row" style={{ marginTop: '0.4rem' }}>
                  <span className="sim-final-label font-nunito" style={{ color: '#FFFFFF', fontSize: '1.15rem' }}>
                    What is the final answer to <strong>{activeStationData.problem}</strong>?
                  </span>
                  <div className="flex gap-3 justify-center items-center">
                    <input 
                      type="number" 
                      value={stationAnswers[activeStation]} 
                      onChange={(e) => setStationAnswers(prev => ({ ...prev, [activeStation]: e.target.value }))}
                      placeholder="?" 
                      className="sim-final-input wonder-guess-input text-center font-bold"
                      style={{ width: '85px', height: '46px', fontSize: '1.4rem' }}
                    />
                    <button 
                      onClick={handleCheckAnswer}
                      disabled={!stationAnswers[activeStation]}
                      className="sim-check-submit-btn wonder-submit-btn font-fredoka"
                      style={{ padding: '0.65rem 1.6rem', fontSize: '1.15rem' }}
                    >
                      Check Answer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Card Status Line matching screenshot */}
          <div className="ss-sim-card-footer font-fredoka">
            Round {activeStation + 1} / {simStations.length}
          </div>
        </div>
      </div>

      {/* POPUP OVERLAY MODAL */}
      {popup.show && (
        <div className="popup-overlay" onClick={handlePopupContinue}>
          <div 
            className={`popup-card ${popup.correct ? 'popup-correct' : 'popup-incorrect'}`} 
            onClick={e => e.stopPropagation()}
          >
            <span className="popup-emoji">{popup.correct ? '🎉' : '😢'}</span>
            <h3 className="popup-title">{popup.correct ? 'Correct! 🎉' : 'Not quite!'}</h3>
            <p className="popup-subtext">{popup.text}</p>
            <button 
              onClick={handlePopupContinue}
              className="popup-continue-btn font-fredoka"
            >
              {popup.correct ? 'CONTINUE' : 'TRY AGAIN'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
