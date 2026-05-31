/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * Returns a new randomized array to avoid mutating the original.
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

/**
 * Generates 100 randomized questions for the Practice Arena.
 * Splits exactly 10 questions per type to maintain balanced coverage.
 */
export function generateSessionQuestions(bank) {
  const byType = {};
  bank.forEach(q => {
    if (!byType[q.type]) byType[q.type] = [];
    byType[q.type].push(q);
  });

  // Pick exactly 10 random questions from each of the 10 types, then shuffle them
  const selected = Object.keys(byType).flatMap(type => {
    const questionsOfType = byType[type];
    return shuffleArray(questionsOfType).slice(0, 10);
  });

  return shuffleArray(selected);
}
