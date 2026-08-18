import React from 'react';
import Mascot from './shared/Mascot';
import { Award, Flame, Zap, Rocket, Sparkles, Search, BookOpen, FlaskConical, Gamepad2, Award as CertificateIcon, X } from 'lucide-react';

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
    <div className="ss-intro-page-wrapper">
      {/* Translucent floating background numbers like screenshot */}
      <div className="ss-bg-floating-numbers" aria-hidden="true">
        <span className="bg-num num-1">54</span>
        <span className="bg-num num-2">91</span>
        <span className="bg-num num-3">11</span>
        <span className="bg-num num-4">66</span>
        <span className="bg-num num-5">90</span>
        <span className="bg-num num-6">64</span>
        <span className="bg-num num-7">30</span>
        <span className="bg-num num-8">69</span>
        <span className="bg-num num-9">90</span>
      </div>

      {/* Top Right Cyan Exit Button like screenshot */}
      <button className="ss-top-right-exit-btn" onClick={onStartQuest} aria-label="Exit intro screen">
        <X size={20} />
      </button>

      {/* Main Screen Card */}
      <div className="ss-intro-center-card animate-fade-in">
        {/* Top Pill Badge */}
        <div className="ss-top-curriculum-badge font-fredoka">
          <Sparkles size={14} className="text-gold" />
          <span>INTELLIA Grade 2 Math</span>
        </div>

        {/* Main Title: White text with Gold highlighted word */}
        <h1 className="ss-main-title font-fredoka">
          MATH <span className="ss-highlight-yellow">STRATEGIES</span>
        </h1>

        {/* Mascot Avatar & Speech Bubble Row */}
        <div className="ss-mascot-speech-row">
          <div className="ss-mascot-gold-circle">
            <Mascot mood="happy" belt={currentWorld} />
          </div>
          <div className="ss-white-speech-bubble font-nunito">
            Welcome to the Mental Math Strategies! Wield place-value blocks, bezier number lines, and interactive grids to unlock your math skills! 🚀
            <div className="ss-bubble-tail" />
          </div>
        </div>

        {/* Narrative Subtitle */}
        <p className="ss-intro-description font-nunito">
          Master the 4 secret mental shortcuts for adding within 100.
          Earn colored belts, collect badges, and become a Mental Math Champion!
        </p>

        {/* YOUR LEARNING JOURNEY Card */}
        <div className="ss-learning-journey-box">
          <h2 className="ss-journey-title font-fredoka">YOUR LEARNING JOURNEY</h2>

          <div className="ss-journey-flow">
            {/* Top Row: Wonder -> Story -> Simulate */}
            <div className="ss-journey-row">
              <div className="ss-journey-node">
                <div className="ss-node-icon-circle icon-wonder">
                  <Search size={16} />
                </div>
                <div className="ss-node-text">
                  <span className="ss-node-name font-fredoka">Wonder</span>
                  <span className="ss-node-sub font-nunito">Spark your curiosity</span>
                </div>
              </div>

              <span className="ss-journey-arrow">→</span>

              <div className="ss-journey-node">
                <div className="ss-node-icon-circle icon-story">
                  <BookOpen size={16} />
                </div>
                <div className="ss-node-text">
                  <span className="ss-node-name font-fredoka">Story</span>
                  <span className="ss-node-sub font-nunito">Hear the tale</span>
                </div>
              </div>

              <span className="ss-journey-arrow">→</span>

              <div className="ss-journey-node">
                <div className="ss-node-icon-circle icon-simulate">
                  <FlaskConical size={16} />
                </div>
                <div className="ss-node-text">
                  <span className="ss-node-name font-fredoka">Simulate</span>
                  <span className="ss-node-sub font-nunito">Explore & discover</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Practice -> Reflect */}
            <div className="ss-journey-row ss-row-2">
              <div className="ss-journey-node">
                <div className="ss-node-icon-circle icon-practice">
                  <Gamepad2 size={16} />
                </div>
                <div className="ss-node-text">
                  <span className="ss-node-name font-fredoka">Practice</span>
                  <span className="ss-node-sub font-nunito">Test your skills</span>
                </div>
              </div>

              <span className="ss-journey-arrow">→</span>

              <div className="ss-journey-node">
                <div className="ss-node-icon-circle icon-reflect">
                  <CertificateIcon size={16} />
                </div>
                <div className="ss-node-text">
                  <span className="ss-node-name font-fredoka">Reflect</span>
                  <span className="ss-node-sub font-nunito">What did you learn?</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Begin Journey Button */}
        <div className="ss-actions-row">
          <button
            className="ss-begin-journey-btn font-fredoka"
            onClick={onStartQuest}
            aria-label="Enter the Dojo and start your math lesson quest"
          >
            <Rocket size={20} />
            <span>Begin Your Journey!</span>
          </button>
        </div>

        {/* Bottom 3 Cards */}
        <div className="ss-bottom-cards-row">
          <div className="ss-stat-card">
            <div className="ss-stat-icon-wrapper icon-box-blue">
              <Zap size={24} />
            </div>
            <span className="ss-stat-val font-fredoka">{xp} XP</span>
            <span className="ss-stat-lbl font-nunito">XP Points</span>
          </div>

          <div className="ss-stat-card">
            <div className="ss-stat-icon-wrapper icon-box-red">
              <Award size={24} />
            </div>
            <span className="ss-stat-val font-fredoka">{totalStars} Stars</span>
            <span className="ss-stat-lbl font-nunito">Stars Earned</span>
          </div>

          <div className="ss-stat-card">
            <div className="ss-stat-icon-wrapper icon-box-gold">
              <Flame size={24} />
            </div>
            <span className="ss-stat-val font-fredoka">{badges.length} Badges</span>
            <span className="ss-stat-lbl font-nunito">3 Game Worlds</span>
          </div>
        </div>
      </div>
    </div>
  );
}

