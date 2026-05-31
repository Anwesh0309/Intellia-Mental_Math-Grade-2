export const BADGES = [
  {
    id: 'curious_coder',
    label: '🏅 Curious Coder',
    description: 'Complete Wonder and Story phases!',
    icon: 'compass',
    condition: (state) => state.phaseComplete.wonder && state.phaseComplete.story,
  },
  {
    id: 'strategy_scholar',
    label: '🥈 Strategy Scholar',
    description: 'Complete all 4 mental simulation stations!',
    icon: 'book-open',
    condition: (state) => state.simStationsComplete.every(Boolean),
  },
  {
    id: 'mental_math_master',
    label: '🥇 Mental Math Master',
    description: 'Score 80%+ correct answers overall in the Dojo!',
    icon: 'award',
    condition: (state) => {
      const attemptedWorlds = state.worldScores.filter(s => s !== null);
      if (attemptedWorlds.length < 10) return false;
      const totalCorrect = state.worldScores.reduce((sum, s) => sum + (s || 0), 0);
      return totalCorrect >= 80;
    },
  },
  {
    id: 'perfect_ten',
    label: '💎 Perfect Ten',
    description: 'Score a perfect 10/10 in any single belt rank!',
    icon: 'gem',
    condition: (state) => state.worldScores.some(score => score === 10),
  },
  {
    id: 'streak_champion',
    label: '🔥 Streak Champion',
    description: 'Achieve a lightning streak of 10 correct answers in a row!',
    icon: 'flame',
    condition: (state) => state.maxStreak >= 10,
  },
  {
    id: 'black_belt',
    label: '🎓 Black Belt',
    description: 'Unlock and attempt all 10 math belts!',
    icon: 'graduation-cap',
    condition: (state) => state.worldScores.filter(s => s !== null).length === 10,
  },
  {
    id: 'full_journey',
    label: '🌟 Full Journey',
    description: 'Complete all 5 phases of the learning map!',
    icon: 'star',
    condition: (state) => Object.values(state.phaseComplete).every(Boolean),
  }
];

/**
 * Sweeps current state and returns an array of badge IDs that
 * are newly unlocked (i.e. are not already recorded in state.badges).
 */
export function checkNewBadges(state) {
  const currentBadges = state.badges || [];
  return BADGES
    .filter(b => !currentBadges.includes(b.id) && b.condition(state))
    .map(b => b.id);
}
