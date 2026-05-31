import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';
import PlaceValueBlocks from '../shared/PlaceValueBlocks';
import NumberLine from '../shared/NumberLine';
import HundredsChart from '../shared/HundredsChart';
import BalanceScale from '../shared/BalanceScale';
import { CheckCircle, Trophy, ArrowRight } from 'lucide-react';
import { playSound } from '../../utils/audio';
import { narrate, stopNarration } from '../../utils/audio';
import { shuffleArray } from '../../utils/shuffle';
import * as narrations from '../../utils/narration';

const BASE_STATIONS = [
  { id: 0, key: "decompose", name: "1. Decompose Sandbox", desc: "Add Tens, Then Ones" },
  { id: 1, key: "bridgeTen", name: "2. Bridge Ten Sandbox", desc: "Make the Next Ten" },
  { id: 2, key: "hundredsChart", name: "3. Hundreds Chart Sandbox", desc: "Jump Rows & Columns" },
  { id: 3, key: "compensate", name: "4. Compensation Sandbox", desc: "Round and Adjust" }
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
      const startCell = stationConfig.startCell || 45;
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
  // STATION 1: INTERACTION
  // ==========================================
  const handleS1BlockTap = (type) => {
    if (s1Step === 1 && type === 'ten' && s1AddedTens < s1TensTarget) {
      const nextTens = s1AddedTens + 1;
      setS1AddedTens(nextTens);
      playSound('chime');
      if (nextTens === s1TensTarget) {
        setS1Step(2);
      }
    } else if (s1Step === 2 && type === 'one' && s1AddedOnes < s1OnesTarget) {
      const nextOnes = s1AddedOnes + 1;
      setS1AddedOnes(nextOnes);
      playSound('chime');
      if (nextOnes === s1OnesTarget) {
        setS1Step(3);
      }
    }
  };

  // ==========================================
  // STATION 2: INTERACTION
  // ==========================================
  const handleS2SplitTap = () => {
    setS2SplitDone(true);
    playSound('chime');
  };

  const handleS2JumpTap = () => {
    if (s2JumpsAdded === 0) {
      setS2JumpsAdded(1);
      playSound('chime');
    } else if (s2JumpsAdded === 1) {
      setS2JumpsAdded(2);
      playSound('chime');
    }
  };

  // ==========================================
  // STATION 3: INTERACTION
  // ==========================================
  const handleS3JumpDown = () => {
    if (s3TensAdded < 2) {
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
  // STATION 4: INTERACTION
  // ==========================================
  const handleS4Round = () => {
    setS4Rounded(true);
    playSound('chime');
  };

  const handleS4Adjust = () => {
    if (s4Rounded) {
      setS4Adjusted(true);
      playSound('chime');
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

  const allCompleted = simStationsComplete.every(Boolean);

  return (
    <>
      <div className="phase-card-wrapper simulate-phase-container">
      {/* Banner */}
      <div className="phase-banner-header simulate-banner">
        <h2 className="phase-banner-title font-fredoka">PHASE 3: SIMULATE ⚙️</h2>
        <span className="phase-banner-subtitle">Sandbox Stations: Build Strategy Muscle Memory</span>
      </div>

      <div className="sandbox-layout-grid">
        {/* Left Column: Stations Navigator & Checklist */}
        <div className="sandbox-sidebar">
          <h3 className="sidebar-title font-fredoka">Sandbox Stations</h3>
          <div className="stations-checklist">
            {simStations.map((st) => {
              const isDone = simStationsComplete[st.id];
              const isActive = activeStation === st.id;

              return (
                <button
                  key={st.id}
                  className={`station-nav-card ${isActive ? 'station-card-active' : ''}`}
                  onClick={() => setActiveStation(st.id)}
                  aria-label={`Open ${st.name}`}
                >
                  <div className="station-card-meta">
                    <span className="station-card-name font-fredoka">{st.name}</span>
                    <span className="station-card-strategy font-nunito">{st.desc}</span>
                    <span className="station-card-problem font-fredoka text-primary">{st.problem}</span>
                  </div>
                  {isDone ? (
                    <CheckCircle size={22} className="color-success" />
                  ) : (
                    <div className="circle-incomplete-ring" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Coach Advice */}
          <div className="sandbox-coach-card mascot-bubble-glow font-nunito">
            <div className="avatar-small">
              <Mascot mood={allCompleted ? "celebrating" : "teaching"} />
            </div>
            <p className="coach-advice-text">
              {allCompleted 
                ? "Perfect! You have completed all four sandbox sandboxes. You are ready to enter the Dojo play arena!"
                : "Tap the highlighted rods, scales, or jump arrows to practice each shortcut step-by-step!"}
            </p>
          </div>
          
          {allCompleted && (
            <button 
              onClick={onComplete}
              className="sandbox-unlock-btn font-fredoka animate-pulse"
              aria-label="Unlock the Play Dojo quiz"
            >
              UNLOCK PLAY DOJO <ArrowRight size={18} />
            </button>
          )}
        </div>

        {/* Right Column: Active Simulation Area */}
        <div className="sandbox-main-area">
          {/* Station 1: Decompose */}
          {activeStation === 0 && (
            <div className="sim-station-box">
              <div className="sim-station-header">
                <h3 className="sim-station-title font-fredoka">Sandbox 1: Add Tens, Then Ones</h3>
                <button onClick={() => resetStation(0)} className="sim-reset-btn font-fredoka">Reset</button>
              </div>
              <p className="sim-instructions font-nunito">
                Solve <strong>{activeStationData.problem}</strong> mentally. First, add the tens rods from {activeStationData.addend2} to {activeStationData.addend1}.
                Then, add the ones cubes.
              </p>

              <div className="sim-visual-arena-decompose">
                {/* Left Pile (Base) */}
                <div className="sim-decompose-column">
                  <h4 className="column-subhead font-fredoka">Starting Pile ({activeStationData.addend1})</h4>
                  <PlaceValueBlocks tens={Math.floor(activeStationData.addend1 / 10)} ones={activeStationData.addend1 % 10} size="md" />
                </div>

                {/* Center Addition Target */}
                <div className="sim-decompose-target font-fredoka">
                  <div className="target-math-op">+</div>
                  <div className="target-math-box">
                    <span className="target-box-label font-fredoka">Added Pile</span>
                    <PlaceValueBlocks tens={s1AddedTens} ones={s1AddedOnes} size="sm" type="added-tens" />
                  </div>
                </div>

                {/* Right Source Pile */}
                <div className="sim-decompose-column">
                  <h4 className="column-subhead font-fredoka">Add from here ({activeStationData.addend2})</h4>
                  <PlaceValueBlocks 
                    tens={s1TensTarget - s1AddedTens} 
                    ones={s1OnesTarget - s1AddedOnes} 
                    size="md" 
                    interactive={true} 
                    onAction={handleS1BlockTap}
                    type={s1Step === 1 ? "to-add-tens" : "to-add-ones"}
                    disabled={s1Step === 3}
                  />
                  <span className="tap-hint-label font-fredoka">
                    {s1Step === 1 ? `👆 Tap a tens rod to add (+${s1TensTarget * 10})` : s1Step === 2 ? `👆 Tap ones cubes to add (+${s1OnesTarget})` : "Completed!"}
                  </span>
                </div>
              </div>

              {/* Equations workflow */}
              <div className="sim-equations-row font-fredoka">
                <div className={`sim-eq-card ${s1Step > 1 ? 'eq-card-passed' : s1Step === 1 ? 'eq-card-active' : ''}`}>
                  <span className="eq-step-num">Step 1 (Add Tens)</span>
                  <div className="eq-math-display">{activeStationData.addend1} + {s1AddedTens * 10} = {activeStationData.addend1 + s1AddedTens * 10}</div>
                  <span className="eq-status-sub">{s1AddedTens === s1TensTarget ? "Completed ✓" : `Tap rods to add ${s1TensTarget * 10}`}</span>
                </div>
                <div className={`sim-eq-card ${s1Step === 3 ? 'eq-card-passed' : s1Step === 2 ? 'eq-card-active' : 'eq-card-locked'}`}>
                  <span className="eq-step-num">Step 2 (Add Ones)</span>
                  <div className="eq-math-display">{activeStationData.addend1 + (s1TensTarget * 10)} + {s1AddedOnes} = {activeStationData.addend1 + (s1TensTarget * 10) + s1AddedOnes}</div>
                  <span className="eq-status-sub">{s1AddedOnes === s1OnesTarget ? "Completed ✓" : s1Step === 2 ? `Tap cubes to add ${s1OnesTarget}` : "Locked"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Station 2: Bridge Ten */}
          {activeStation === 1 && (
            <div className="sim-station-box">
              <div className="sim-station-header">
                <h3 className="sim-station-title font-fredoka">Sandbox 2: Make the Next Ten</h3>
                <button onClick={() => resetStation(1)} className="sim-reset-btn font-fredoka">Reset</button>
              </div>
              <p className="sim-instructions font-nunito">
                Solve <strong>{activeStationData.problem}</strong> mentally. {s2Start} is close to {s2NextTen}.
                How much does it need? Split {activeStationData.addend2} to bridge the next ten first!
              </p>

              {/* Interactive splitter block */}
              <div className="sim-split-interactive-row">
                <div className="split-num-block font-fredoka bg-primary">{s2Start}</div>
                <div className="split-num-operator font-fredoka">+</div>
                
                {/* addend split panel */}
                {!s2SplitDone ? (
                  <button 
                    onClick={handleS2SplitTap} 
                    className="split-num-bubble-btn font-fredoka animate-pulse"
                    aria-label={`Split ${activeStationData.addend2} to bridge the ten`}
                  >
                    {activeStationData.addend2}
                    <span className="bubble-tap-sub font-nunito">Tap to Split</span>
                  </button>
                ) : (
                  <div className="split-visual-arms animate-bounce-in">
                    <div className="split-source-six font-fredoka">{activeStationData.addend2}</div>
                    <div className="split-connector-lines" />
                    <div className="split-branches-row">
                      <div className="split-leaf-node font-fredoka bg-success">
                        {s2NeedToNextTen}
                        <span className="leaf-label font-nunito">(needs {s2NeedToNextTen})</span>
                      </div>
                      <div className="split-leaf-node font-fredoka bg-warning">
                        {s2Remainder}
                        <span className="leaf-label font-nunito">(leftover)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Number Line Visualizations */}
              {s2SplitDone && (
                <div className="sim-number-line-section animate-fade-in">
                  <h4 className="section-title-sub font-fredoka">Draw hops on the number line</h4>
                  <NumberLine 
                    min={Math.max(0, s2Start - 3)} 
                    max={s2Start + s2Addend + 4} 
                    marked={[s2Start, s2NextTen, s2Start + s2Addend]} 
                    jumps={[
                      ...(s2JumpsAdded >= 1 ? [{ from: s2Start, to: s2NextTen, label: `+${s2NeedToNextTen}`, color: "#4CAF50" }] : []),
                      ...(s2JumpsAdded >= 2 ? [{ from: s2NextTen, to: s2Start + s2Addend, label: `+${s2Remainder}`, color: "#FF9800" }] : [])
                    ]}
                    activeValue={s2JumpsAdded === 0 ? s2Start : s2JumpsAdded === 1 ? s2NextTen : s2Start + s2Addend}
                  />

                  <div className="sim-eq-flow font-fredoka">
                    {s2JumpsAdded === 0 && (
                      <button onClick={handleS2JumpTap} className="sim-action-trigger-btn font-fredoka animate-pulse">
                        Jump to {s2NextTen} (+{s2NeedToNextTen})
                      </button>
                    )}
                    {s2JumpsAdded === 1 && (
                      <button onClick={handleS2JumpTap} className="sim-action-trigger-btn font-fredoka animate-pulse bg-warning">
                        Jump the rest (+{s2Remainder})
                      </button>
                    )}
                    {s2JumpsAdded === 2 && (
                      <div className="sim-mastered-strip text-success font-fredoka">
                        Double Hop Complete: {s2Start} + {s2NeedToNextTen} = {s2NextTen} ➔ {s2NextTen} + {s2Remainder} = {s2Start + s2Addend} ✓
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Station 3: Hundreds Chart */}
          {activeStation === 2 && (
            <div className="sim-station-box">
              <div className="sim-station-header">
                <h3 className="sim-station-title font-fredoka">Sandbox 3: Hundreds Chart Jumps</h3>
                <button onClick={() => resetStation(2)} className="sim-reset-btn font-fredoka">Reset</button>
              </div>
              <p className="sim-instructions font-nunito">
                Solve <strong>{activeStationData.problem}</strong> using grid jumps.
                Jump down {s3TensTarget} rows to add {s3TensTarget * 10}, then jump right {s3OnesTarget} squares to add {s3OnesTarget}.
              </p>

              <div className="sim-grid-arena-layout">
                {/* Hundreds Grid panel */}
                <div className="sim-grid-display">
                  <HundredsChart 
                    startCell={activeStationData.startCell} 
                    highlighted={s3Path} 
                    current={s3CurrentCell} 
                  />
                </div>

                {/* Right controls */}
                <div className="sim-grid-controls">
                  <div className="grid-jumps-feedback font-fredoka">
                    <div className="feedback-line">Current: <span className="text-primary">{s3CurrentCell}</span></div>
                    <div className="feedback-line">Row Jumps (+10): <span className="text-success">{s3TensAdded} / {s3TensTarget}</span></div>
                    <div className="feedback-line">Col Jumps (+1): <span className="text-warning">{s3OnesAdded} / {s3OnesTarget}</span></div>
                  </div>

                  <div className="grid-action-buttons-strip">
                    <button
                      onClick={handleS3JumpDown}
                      disabled={s3TensAdded >= s3TensTarget}
                      className="sim-action-trigger-btn font-fredoka"
                    >
                      Jump Down (+10)
                    </button>
                    <button
                      onClick={handleS3JumpRight}
                      disabled={s3TensAdded < s3TensTarget || s3OnesAdded >= s3OnesTarget}
                      className="sim-action-trigger-btn font-fredoka bg-warning"
                    >
                      Jump Right (+1)
                    </button>
                  </div>

                  {s3OnesAdded === s3OnesTarget && (
                    <div className="sim-mastered-strip text-success font-fredoka animate-bounce-in">
                      Grid Path Complete! Landed on {activeStationData.correct} ✓
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Station 4: Compensation */}
          {activeStation === 3 && (
            <div className="sim-station-box">
              <div className="sim-station-header">
                <h3 className="sim-station-title font-fredoka">Sandbox 4: Round and Adjust</h3>
                <button onClick={() => resetStation(3)} className="sim-reset-btn font-fredoka">Reset</button>
              </div>
              <p className="sim-instructions font-nunito">
                Solve <strong>{activeStationData.problem}</strong> mentally. {activeStationData.addend2} is very close to {s4RoundedValue}!
                Round {activeStationData.addend2} to {s4RoundedValue}, add it, then adjust for the extra.
              </p>

              {/* Interactive Vector Scale */}
              <div className="sim-scale-arena">
                <BalanceScale 
                  leftValue={activeStationData.correct} 
                  rightValue={s4Adjusted ? activeStationData.correct : s4Rounded ? s4RoundedSum : activeStationData.addend1 + activeStationData.addend2} 
                  leftLabel={`${activeStationData.addend1} + ${activeStationData.addend2} (Target)`} 
                  rightLabel={s4Adjusted ? "Balanced ✓" : s4Rounded ? `${activeStationData.addend1} + ${s4RoundedValue} (Heavier!)` : "Tilted"}
                />
              </div>

              {/* Interactive buttons */}
              <div className="scale-control-panel font-fredoka">
                {!s4Rounded ? (
                  <button 
                    onClick={handleS4Round} 
                    className="sim-action-trigger-btn font-fredoka animate-pulse"
                  >
                    1. Round {activeStationData.addend2} up to {s4RoundedValue} (+{s4AdjustBy} extra)
                  </button>
                ) : !s4Adjusted ? (
                  <div className="scale-adjust-block animate-bounce-in">
                    <span className="scale-tilt-warning font-nunito text-danger">
                      ⚠️ The scale tilted! You added {s4AdjustBy} too many.
                    </span>
                    <button 
                      onClick={handleS4Adjust} 
                      className="sim-action-trigger-btn font-fredoka bg-danger"
                    >
                      2. Subtract {s4AdjustBy} to adjust scale (-{s4AdjustBy})
                    </button>
                  </div>
                ) : (
                  <div className="sim-mastered-strip text-success font-fredoka animate-bounce-in">
                    Scale balanced perfectly at {activeStationData.correct}! ({activeStationData.addend1} + {s4RoundedValue} - {s4AdjustBy} = {activeStationData.correct}) ✓
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CHECK FINAL ANSWER AREA - Unlocks after completing interactive steps */}
          {stepsFinished && (
            <div className="sandbox-check-answer-box mt-6 p-5 rounded-2xl border-2 border-dashed border-cyan-400 bg-cyan-950/20 text-center animate-fade-in">
              <h4 className="font-fredoka text-xl text-cyan-400 mb-2">Final Step: Solve the Sum!</h4>
              {simStationsComplete[activeStation] ? (
                <div className="sandbox-completed-badge font-fredoka text-success text-lg flex items-center justify-center gap-2">
                  <CheckCircle size={22} /> Sandbox Completed! You've mastered this strategy!
                </div>
              ) : (
                <div>
                  <p className="font-nunito text-md mb-4 text-slate-300">
                    What is the final answer to the addition challenge: <strong>{activeStationData.problem}</strong>?
                  </p>
                  <div className="flex gap-3 justify-center items-center">
                    <input 
                      type="number" 
                      value={stationAnswers[activeStation]} 
                      onChange={(e) => setStationAnswers(prev => ({ ...prev, [activeStation]: e.target.value }))}
                      placeholder="?" 
                      className="wonder-guess-input w-24 text-center text-xl font-bold"
                    />
                    <button 
                      onClick={handleCheckAnswer}
                      disabled={!stationAnswers[activeStation]}
                      className="wonder-submit-btn font-fredoka px-6 py-2 rounded-xl text-md"
                    >
                      Check Answer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
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
