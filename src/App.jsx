import React, { useReducer, useEffect } from 'react';
import ProgressMap from './components/ProgressMap';
import IntroScreen from './components/IntroScreen';
import WonderPhase from './components/phases/WonderPhase';
import StoryPhase from './components/phases/StoryPhase';
import SimulatePhase from './components/phases/SimulatePhase';
import PlayPhase from './components/phases/PlayPhase';
import ReflectPhase from './components/phases/ReflectPhase';
import { playSound } from './utils/audio';

const STORAGE_KEY = 'intellia_math_dojo_state_v1';

const INITIAL_STATE = {
  phase: 'intro', // 'intro' | 'wonder' | 'story' | 'simulate' | 'play' | 'reflect'
  storyPanel: 0,
  simStationsComplete: [false, false, false, false],
  currentWorld: 0, // unlocked belt rank (0 to 9)
  worldScores: [null, null, null, null, null, null, null, null, null, null],
  xp: 0,
  streak: 0,
  maxStreak: 0,
  badges: [],
  audioEnabled: true,
  phaseComplete: {
    wonder: false,
    story: false,
    simulate: false,
    play: false,
    reflect: false
  }
};

// Reducer function to handle robust global mutations
function gameReducer(state, action) {
  let nextState = state;
  switch (action.type) {
    case 'LOAD_SAVED_STATE':
      return { 
        ...state, 
        ...action.payload,
        phase: 'intro',
        phaseComplete: {
          wonder: false,
          story: false,
          simulate: false,
          play: false,
          reflect: false
        },
        simStationsComplete: [false, false, false, false],
        storyPanel: 0,
        currentWorld: 0,
        worldScores: [null, null, null, null, null, null, null, null, null, null]
      };
      
    case 'START_QUEST':
      nextState = {
        ...state,
        phase: 'wonder',
        phaseComplete: {
          wonder: false,
          story: false,
          simulate: false,
          play: false,
          reflect: false
        },
        simStationsComplete: [false, false, false, false],
        storyPanel: 0,
        currentWorld: 0,
        worldScores: [null, null, null, null, null, null, null, null, null, null]
      };
      break;

    case 'CHANGE_PHASE':
      nextState = {
        ...state,
        phase: action.payload
      };
      break;

    case 'NEXT_STORY_PANEL':
      nextState = {
        ...state,
        storyPanel: Math.min(6, state.storyPanel + 1)
      };
      break;

    case 'PREV_STORY_PANEL':
      nextState = {
        ...state,
        storyPanel: Math.max(0, state.storyPanel - 1)
      };
      break;

    case 'COMPLETE_PHASE':
      nextState = {
        ...state,
        phaseComplete: {
          ...state.phaseComplete,
          [action.payload]: true
        }
      };
      break;

    case 'COMPLETE_STATION': {
      const nextComplete = [...state.simStationsComplete];
      nextComplete[action.payload.index] = action.payload.completed;
      nextState = {
        ...state,
        simStationsComplete: nextComplete
      };
      break;
    }

    case 'ADD_XP': {
      const nextXP = state.xp + action.payload;
      nextState = {
        ...state,
        xp: nextXP
      };
      break;
    }

    case 'COMPLETE_WORLD': {
      const nextScores = [...state.worldScores];
      nextScores[action.payload.worldId] = action.payload.score;
      
      // If student scored enough to promote, increment unlocked belt world
      let nextWorld = state.currentWorld;
      if (action.payload.score >= 3 && action.payload.worldId === state.currentWorld && state.currentWorld < 9) {
        nextWorld = state.currentWorld + 1;
      }

      const nextPhaseComplete = { ...state.phaseComplete };
      if (action.payload.worldId === 9 && action.payload.score >= 3) {
        nextPhaseComplete.play = true;
      }

      nextState = {
        ...state,
        worldScores: nextScores,
        currentWorld: nextWorld,
        phaseComplete: nextPhaseComplete
      };
      break;
    }

    case 'UNLOCK_BADGES': {
      const uniqueBadges = Array.from(new Set([...state.badges, ...action.payload]));
      nextState = {
        ...state,
        badges: uniqueBadges
      };
      break;
    }

    case 'TOGGLE_AUDIO':
      nextState = {
        ...state,
        audioEnabled: !state.audioEnabled
      };
      break;

    case 'RESET_GAME':
      nextState = {
        ...INITIAL_STATE,
        audioEnabled: state.audioEnabled // preserve audio toggle
      };
      break;

    default:
      return state;
  }

  // Persist current state changes to local storage with timestamp
  try {
    const dataToSave = {
      value: nextState,
      timestamp: Date.now()
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.error("Local storage save error:", err);
  }

  return nextState;
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  // Initialize: load state from local storage on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Expiration check: 24 hours TTL (86,400,000 ms)
        if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < 86400000) {
          dispatch({ type: 'LOAD_SAVED_STATE', payload: parsed.value });
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error("Local storage load error:", err);
    }
  }, []);

  // Compute aggregated scores and stars
  const totalStars = state.worldScores.reduce((sum, s) => {
    if (s === null) return sum;
    if (s >= 5) return sum + 3;
    if (s >= 4) return sum + 2;
    if (s >= 3) return sum + 1;
    return sum;
  }, 0);

  // Phase completion wrapper transitions
  const handleStartQuest = () => {
    dispatch({ type: 'START_QUEST' });
  };

  const handleWonderComplete = () => {
    dispatch({ type: 'COMPLETE_PHASE', payload: 'wonder' });
    dispatch({ type: 'CHANGE_PHASE', payload: 'story' });
  };

  const handleStoryComplete = () => {
    dispatch({ type: 'COMPLETE_PHASE', payload: 'story' });
    dispatch({ type: 'CHANGE_PHASE', payload: 'simulate' });
  };

  const handleSimulateComplete = () => {
    dispatch({ type: 'COMPLETE_PHASE', payload: 'simulate' });
    dispatch({ type: 'CHANGE_PHASE', payload: 'play' });
  };

  const handlePlayComplete = (nextWorldUnlocked) => {
    dispatch({ type: 'COMPLETE_PHASE', payload: 'play' });
    dispatch({ type: 'CHANGE_PHASE', payload: 'reflect' });
  };

  const handleReflectComplete = () => {
    dispatch({ type: 'COMPLETE_PHASE', payload: 'reflect' });
    // Triggers graduation, returning back to the welcome hub with status preserved
    dispatch({ type: 'CHANGE_PHASE', payload: 'intro' });
  };

  return (
    <div className="intellia-app-container">
      {/* Renders global header navigation progress map for all pages EXCEPT welcome screen */}
      {state.phase !== 'intro' && (
        <ProgressMap
          currentPhase={state.phase}
          phaseComplete={state.phaseComplete}
          xp={state.xp}
          streak={state.streak}
          audioEnabled={state.audioEnabled}
          onToggleAudio={() => dispatch({ type: 'TOGGLE_AUDIO' })}
          onJumpToPhase={(phaseId) => dispatch({ type: 'CHANGE_PHASE', payload: phaseId })}
        />
      )}

      <main className="lessons-container-body" role="main">
        {state.phase === 'intro' && (
          <IntroScreen
            xp={state.xp}
            totalStars={totalStars}
            badges={state.badges}
            currentWorld={state.currentWorld}
            onStartQuest={handleStartQuest}
          />
        )}

        {state.phase === 'wonder' && (
          <WonderPhase
            audioEnabled={state.audioEnabled}
            onComplete={handleWonderComplete}
          />
        )}

        {state.phase === 'story' && (
          <StoryPhase
            storyPanel={state.storyPanel}
            audioEnabled={state.audioEnabled}
            onNextPanel={() => dispatch({ type: 'NEXT_STORY_PANEL' })}
            onPrevPanel={() => dispatch({ type: 'PREV_STORY_PANEL' })}
            onComplete={handleStoryComplete}
          />
        )}

        {state.phase === 'simulate' && (
          <SimulatePhase
            simStationsComplete={state.simStationsComplete}
            onUpdateStationProgress={(index, completed) => 
              dispatch({ type: 'COMPLETE_STATION', payload: { index, completed } })
            }
            audioEnabled={state.audioEnabled}
            onComplete={handleSimulateComplete}
          />
        )}

        {state.phase === 'play' && (
          <PlayPhase
            xp={state.xp}
            currentWorld={state.currentWorld}
            worldScores={state.worldScores}
            audioEnabled={state.audioEnabled}
            onAddXP={(earned) => dispatch({ type: 'ADD_XP', payload: earned })}
            onCompleteWorld={(worldId, score) => 
              dispatch({ type: 'COMPLETE_WORLD', payload: { worldId, score } })
            }
            onUnlockNewBadges={(badgeIds) => 
              dispatch({ type: 'UNLOCK_BADGES', payload: badgeIds })
            }
            onComplete={handlePlayComplete}
          />
        )}

        {state.phase === 'reflect' && (
          <ReflectPhase
            xp={state.xp}
            totalStars={totalStars}
            badges={state.badges}
            worldScores={state.worldScores}
            audioEnabled={state.audioEnabled}
            onFinishLesson={handleReflectComplete}
          />
        )}
      </main>

      {/* Floating reset button for dev testing */}
      <footer className="dev-footer-align">
        <button 
          onClick={() => {
            if (confirm("Reset math ninja progress?")) {
              dispatch({ type: 'RESET_GAME' });
            }
          }} 
          className="dev-reset-btn"
          aria-label="Reset lesson quest data"
        >
          Reset Progress
        </button>
      </footer>
    </div>
  );
}
