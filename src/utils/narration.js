import { say, ask, cheer, emphasize, think, celebrate, instruct } from './audio';

// Phase 1 — Wonder
export function wonderNarration() {
  return [
    ask("Noah has 47 stickers. He earns 36 more at school. Can you add that in your head, without writing anything?"),
    emphasize("There are secret shortcuts for fast adding!")
  ];
}

// Phase 2 — Story Panels
export function storyPanel1Narration() {
  return [
    say("Lily and Leo love maths. Today, Coach Cooper has a challenge for them. Can they add big numbers without using a pencil?")
  ];
}

export function storyPanel2Narration() {
  return [
    say("Coach Cooper says: The best mathematicians use mental shortcuts. Today, you will learn four powerful strategies to add numbers up to 100 in your head!")
  ];
}

export function storyStrategy1Narration() {
  return [
    emphasize("Strategy One: Add Tens, Then Ones."),
    say("Break the second number into tens and ones. Add the tens to your first number first. Then add the ones. Let's try: 34 plus 25. First, 34 plus 20 equals 54. Then, 54 plus 5 equals 59. You did it!")
  ];
}

export function storyStrategy2Narration() {
  return [
    emphasize("Strategy Two: Make the Next Ten."),
    say("When adding ones would cross a ten, split the second number to fill up to the next ten first. Let's try: 37 plus 6. How much does 37 need to reach 40? It needs 3 more. So split 6 into 3 and 3. First, 37 plus 3 equals 40. Then, 40 plus 3 equals 43!")
  ];
}

export function storyStrategy3Narration() {
  return [
    emphasize("Strategy Three: Hundreds Chart Jumps."),
    say("Imagine a hundreds chart in your mind. Jump down one row to add ten. Jump right one square to add one. Let's try: 45 plus 23. Jump down 2 rows: 45, 55, 65. Then jump right 3 squares: 66, 67, 68. The answer is 68!")
  ];
}

export function storyStrategy4Narration() {
  return [
    emphasize("Strategy Four: Round and Adjust."),
    say("Round one number up to the nearest ten. Add it. Then subtract the extra you added. Let's try: 46 plus 39. Round 39 up to 40. So 46 plus 40 equals 86. But we added 1 too many. So 86 minus 1 equals 85. The answer is 85!")
  ];
}

export function storyCloseNarration() {
  return [
    celebrate("Leo and Lily have learned all four strategies! Now it's your turn to practise and become a Mental Math Champion!")
  ];
}

// Phase 3 — Simulation Station Instructions
export function simulateDecomposeNarration() {
  return [
    instruct("Drag the tens rods to join them with the first number. Watch how the total changes!"),
    instruct("Now drag the ones cubes to complete the addition.")
  ];
}

export function simulateBridgeNarration() {
  return [
    think("Look at the number line. How far does the number need to jump to reach the next ten?"),
    instruct("Tap the arrow to make the first jump. Then tap again for the second jump!")
  ];
}

export function simulateHundredsNarration() {
  return [
    instruct("Click on the hundreds chart to jump down for tens, and right for ones.")
  ];
}

export function simulateCompensateNarration() {
  return [
    instruct("Round the number up to the nearest ten. Then add. Remember to adjust at the end!")
  ];
}

// Phase 4 — Gamification Feedback
export function correctFirstTryNarration() {
  return [ celebrate("Brilliant! You're a Mental Math Ninja! 🥷") ];
}

export function correctSecondTryNarration() {
  return [ cheer("Great work! You figured it out! 💪") ];
}

export function incorrectNarration() {
  return [ cheer("Hmm, let's try again! Remember the strategy 🤔") ];
}

export function hint1Narration() {
  return [ think("Let me give you a hint. Look at the strategy diagram.") ];
}

export function streakMilestoneNarration() {
  return [ celebrate("Amazing streak! You are on fire! 🔥") ];
}

// Phase 5 — Reflect
export function reflectNarration() {
  return [
    ask("You have completed all four mental math strategies! Which strategy is your favourite? Tell me why!")
  ];
}

export function completionNarration() {
  return [
    celebrate("Well done! You are a Mental Math Champion! Your lesson is complete! 🌟")
  ];
}
