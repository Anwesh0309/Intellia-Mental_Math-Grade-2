import React from 'react';
import Mascot from './shared/Mascot';
import { Award, Flame, Zap, Play } from 'lucide-react';

const BELTS = [
  { id: 0, color: "#FFFFFF", name: "White Belt", level: "Addition within 30" },
  { id: 1, color: "#FFEB3B", name: "Yellow Belt", level: "Addition within 50" },
  { id: 2, color: "#FF9800", name: "Orange Belt", level: "Addition within 60" },
  { id: 3, color: "#4CAF50", name: "Green Belt", level: "Addition within 70" },
  { id: 4, color: "#2196F3", name: "Blue Belt", level: "Decompose Regroup" },
  { id: 5, color: "#9C27B0", name: "Purple Belt", level: "Bridging Regroup" },
  { id: 6, color: "#E91E63", name: "Red Belt", level: "Compensation Hard" },
  { id: 7, color: "#795548", name: "Brown Belt", level: "Mixed Strategies" },
  { id: 8, color: "#212121", name: "Black Belt", level: "Singapore Word Problems" },
  { id: 9, color: "#FFD700", name: "Gold Belt", level: "Mastery Challenges" }
];

export default function IntroScreen({ 
  xp = 0, 
  totalStars = 0, 
  badges = [], 
  currentWorld = 0, 
  onStartQuest 
}) {
  return (
    <div className="intro-screen-container">
      <div className="intro-card-glass">
        {/* Welcome branding title */}
        <div className="intro-header-block">
          <div className="academy-tag font-fredoka">INTELLIA NINJA ACADEMY</div>
          <h2 className="intro-title font-fredoka">MATH DOJO</h2>
          <p className="intro-subtitle font-nunito">
            Master the 4 secret mental shortcuts for adding within 100.
            Earn colored belts, collect badges, and become a Mental Math Champion!
          </p>
        </div>

        {/* Mascot & Stats Showcase Grid */}
        <div className="intro-grid-layout">
          {/* Mascot column */}
          <div className="intro-mascot-col">
            <Mascot mood="happy" belt={currentWorld} />
            <div className="mascot-coach-bubble font-nunito">
              "Welcome to the Dojo! Wield place-value blocks, bezier number lines, and interactive grids to unlock your math skills!"
            </div>
          </div>

          {/* Stats & Belt Map Column */}
          <div className="intro-stats-col">
            <h3 className="section-header font-fredoka">Your Stats</h3>
            <div className="stats-cards-strip">
              <div className="stat-pill">
                <Zap size={20} className="color-xp" />
                <div className="pill-text font-fredoka">
                  {xp} <span className="pill-sub">XP</span>
                </div>
              </div>
              <div className="stat-pill">
                <Award size={20} className="color-star" />
                <div className="pill-text font-fredoka">
                  {totalStars} <span className="pill-sub">Stars</span>
                </div>
              </div>
              <div className="stat-pill">
                <Flame size={20} className="color-streak" />
                <div className="pill-text font-fredoka">
                  {badges.length} <span className="pill-sub">Badges</span>
                </div>
              </div>
            </div>

            <h3 className="section-header font-fredoka">Dojo Belts Progress</h3>
            <div className="belts-linear-strip">
              {BELTS.map((b) => {
                const isUnlocked = b.id <= currentWorld;
                return (
                  <div 
                    key={b.id} 
                    className={`belt-linear-node ${isUnlocked ? 'linear-node-unlocked' : 'linear-node-locked'}`}
                    style={{ borderColor: b.color }}
                  >
                    <div className="belt-color-circle" style={{ backgroundColor: b.color }} />
                    <div className="belt-node-info">
                      <span className="belt-node-name font-fredoka">{b.name}</span>
                      <span className="belt-node-level font-nunito">{b.level}</span>
                    </div>
                    {isUnlocked ? (
                      <span className="belt-node-status font-fredoka color-success">✓</span>
                    ) : (
                      <span className="belt-node-status font-fredoka color-locked">🔒</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Large green Enter the Dojo Start button */}
        <div className="intro-actions-row">
          <button 
            className="intro-start-btn font-fredoka"
            onClick={onStartQuest}
            aria-label="Enter the Dojo and start your math lesson quest"
          >
            <Play size={20} className="start-icon-pulse" />
            ENTER THE DOJO
          </button>
        </div>
      </div>
    </div>
  );
}
