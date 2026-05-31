import { shuffleArray } from './shuffle';

/**
 * Calculates XP awarded based on student speed and correctness.
 * - Correct on 1st try: 10 XP
 * - Correct on 2nd try: 7 XP
 * - Correct after using a hint: 5 XP
 * - Streak ≥ 5: +5 XP bonus
 */
export function calcXP(attemptNumber, hintsUsed, streak) {
  let base = 10;
  if (hintsUsed > 0) {
    base = 5;
  } else if (attemptNumber === 2) {
    base = 7;
  } else if (attemptNumber > 2) {
    base = 5;
  }
  
  const streakBonus = streak >= 5 ? 5 : 0;
  return base + streakBonus;
}

export function calcStars(correct, total = 5) {
  if (total === 5) {
    if (correct >= 5) return 3;
    if (correct >= 4) return 2;
    if (correct >= 3) return 1;
    return 0;
  }
  if (correct >= 9) return 3;
  if (correct >= 7) return 2;
  if (correct >= 5) return 1;
  return 0;
}

/**
 * Generates pedagogically relevant distractors for Grade 2 mathematics.
 * Focuses on common conceptual mistakes:
 * 1. Forgetting to carry/regroup tens (e.g., 47+36 = 73 instead of 83)
 * 2. Overcounting tens by +10 or undercounting by -10
 * 3. Adding only ones digits, ignoring tens column
 * 4. Off-by-one or off-by-two calculation slips
 */
export function generateMathDistractors(correct, addend1, addend2) {
  const commonErrors = [
    correct - 10,                 // Under-counted tens
    correct + 10,                 // Over-counted tens
    (addend1 + addend2) - 1,      // Off-by-one slip
    (addend1 + addend2) + 1,      // Off-by-one slip
    (addend1 + addend2) - 2,      // Off-by-two slip
    (addend1 + addend2) + 2,      // Off-by-two slip
  ];

  // Specific regrouping slips (common carrying mistakes)
  const tens1 = Math.floor(addend1 / 10);
  const tens2 = Math.floor(addend2 / 10);
  const ones1 = addend1 % 10;
  const ones2 = addend2 % 10;
  
  if (ones1 + ones2 >= 10) {
    // Forgot to carry the 1 ten
    commonErrors.push(correct - 10);
  }

  // Filter list to keep realistic, positive answers within 100
  const distractors = new Set(
    commonErrors.filter(d => d > 0 && d <= 100 && d !== correct)
  );

  // Fill up to exactly 3 unique distractors if set is too small
  while (distractors.size < 3) {
    const offset = (Math.random() > 0.5 ? 1 : -1) * Math.ceil(Math.random() * 5);
    const d = correct + offset;
    if (d > 0 && d <= 100 && d !== correct) {
      distractors.add(d);
    }
  }

  // Pick 3 distractors, combine with correct answer, and randomize layout order
  const selectedDistractors = Array.from(distractors).slice(0, 3);
  return shuffleArray([correct, ...selectedDistractors]);
}
