export const storyPanels = [
  {
    id: 0,
    title: "The Math Challenge",
    text: "Lily and Leo love maths. Today, Coach Cooper has a challenge for them. Can they add big numbers — without using a pencil?",
    mascotMood: "curious",
    strategy: null,
    image: "/images/story_challenge.png",
    equations: []
  },
  {
    id: 1,
    title: "Ninja Math Shortcuts",
    text: "Coach Cooper says: The best mathematicians use mental shortcuts. Today, you will learn four powerful strategies to add numbers up to 100 in your head!",
    mascotMood: "teaching",
    strategy: null,
    image: "/images/story_coach.png",
    equations: []
  },
  {
    id: 2,
    title: "Strategy 1: Add Tens, Then Ones",
    text: "Break the second number into tens and ones. Add the tens to your first number first. Then add the ones. Let's try: 34 plus 25. First, 34 plus 20 equals 54. Then, 54 plus 5 equals 59. You did it!",
    mascotMood: "happy",
    strategy: "decompose",
    example: {
      num1: 34,
      num2: 25,
      step1: "34 + 20 = 54",
      step2: "54 + 5 = 59",
      decomposition: "25 ➔ 20 and 5"
    }
  },
  {
    id: 3,
    title: "Strategy 2: Make the Next Ten",
    text: "When adding ones would cross a ten, split the second number to fill up to the next ten first. Let's try: 37 plus 6. How much does 37 need to reach 40? It needs 3 more. So split 6 into 3 and 3. First, 37 plus 3 equals 40. Then, 40 plus 3 equals 43!",
    mascotMood: "teaching",
    strategy: "bridgeTen",
    example: {
      num1: 37,
      num2: 6,
      step1: "37 + 3 = 40",
      step2: "40 + 3 = 43",
      decomposition: "6 ➔ 3 and 3"
    }
  },
  {
    id: 4,
    title: "Strategy 3: Hundreds Chart Jumps",
    text: "Imagine a hundreds chart in your mind. Jump down one row to add ten. Jump right one square to add one. Let's try: 45 plus 23. Jump down 2 rows: 45, 55, 65. Then jump right 3 squares: 66, 67, 68. The answer is 68!",
    mascotMood: "thinking",
    strategy: "hundredsChart",
    example: {
      num1: 45,
      num2: 23,
      step1: "Jump Down 2 rows (+20): 45 ➔ 55 ➔ 65",
      step2: "Jump Right 3 cells (+3): 65 ➔ 66 ➔ 67 ➔ 68",
      decomposition: "23 ➔ 2 rows down + 3 cells right"
    }
  },
  {
    id: 5,
    title: "Strategy 4: Round and Adjust",
    text: "Round one number up to the nearest ten. Add it. Then subtract the extra you added. Let's try: 46 plus 39. Round 39 up to 40. So 46 plus 40 equals 86. But we added 1 too many. So 86 minus 1 equals 85. The answer is 85!",
    mascotMood: "teaching",
    strategy: "compensate",
    example: {
      num1: 46,
      num2: 39,
      step1: "Round 39 up to 40 (added +1 extra)",
      step2: "Add: 46 + 40 = 86",
      step3: "Adjust: 86 - 1 = 85",
      decomposition: "39 ➔ 40 minus 1"
    }
  },
  {
    id: 6,
    title: "Become a Math Champion!",
    text: "Leo and Lily have learned all four strategies! Now it's your turn to practise and become a Mental Math Champion!",
    mascotMood: "celebrating",
    strategy: null,
    image: "/images/story_celebrate.png",
    equations: []
  }
];

export const strategiesList = [
  {
    id: "decompose",
    name: "Add Tens, Then Ones",
    tagline: "Break second number into tens and ones. Add tens first, then ones.",
    color: "#4A90D9",
    icon: "grid",
    example: "34 + 25 = 34 + 20 + 5 = 59"
  },
  {
    id: "bridgeTen",
    name: "Make the Next Ten",
    tagline: "Split numbers to bridge to the next ten first, then add the rest.",
    color: "#4CAF50",
    icon: "trending-up",
    example: "37 + 6 = 37 + 3 + 3 = 43"
  },
  {
    id: "hundredsChart",
    name: "Hundreds Chart Jumps",
    tagline: "Jump down rows for adding tens, jump right squares for adding ones.",
    color: "#FFB300",
    icon: "layout",
    example: "45 + 23 = jump down 2 rows + 3 right = 68"
  },
  {
    id: "compensate",
    name: "Round and Adjust",
    tagline: "Round to nearest ten, add it, and subtract the extra at the end.",
    color: "#9C27B0",
    icon: "scale",
    example: "46 + 39 = 46 + 40 - 1 = 85"
  }
];
