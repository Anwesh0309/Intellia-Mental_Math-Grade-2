import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target folders
const projectRoot = path.resolve(__dirname, '..');
const audioDir = path.join(projectRoot, 'public', 'assets', 'audio');
const mapFile = path.join(projectRoot, 'src', 'utils', 'audioMap.js');

// Create directories if they do not exist
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Load env variables manually from .env if present
let apiKey = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
const envPath = path.join(projectRoot, '.env');
if (!apiKey && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/VITE_ELEVENLABS_API_KEY\s*=\s*(.*)/);
  if (match && match[1]) {
    apiKey = match[1].trim().replace(/['"]/g, '');
  }
}

const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice Voice
const MODEL_ID = 'eleven_multilingual_v2';

// Step 1: Collect all text lines to pre-generate
const textLines = new Set([
  // Phase 1 - Wonder
  "Noah has 47 stickers. He earns 36 more at school. Can you add that in your head, without writing anything?",
  "There are secret shortcuts for fast adding!",
  
  // Phase 2 - Story Panels
  "Lily and Leo love maths. Today, Coach Cooper has a challenge for them. Can they add big numbers without using a pencil?",
  "Coach Cooper says: The best mathematicians use mental shortcuts. Today, you will learn four powerful strategies to add numbers up to 100 in your head!",
  "Strategy One: Add Tens, Then Ones.",
  "Break the second number into tens and ones. Add the tens to your first number first. Then add the ones. Let's try: 34 plus 25. First, 34 plus 20 equals 54. Then, 54 plus 5 equals 59. You did it!",
  "Strategy Two: Make the Next Ten.",
  "When adding ones would cross a ten, split the second number to fill up to the next ten first. Let's try: 37 plus 6. How much does 37 need to reach 40? It needs 3 more. So split 6 into 3 and 3. First, 37 plus 3 equals 40. Then, 40 plus 3 equals 43!",
  "Strategy Three: Hundreds Chart Jumps.",
  "Imagine a hundreds chart in your mind. Jump down one row to add ten. Jump right one square to add one. Let's try: 45 plus 23. Jump down 2 rows: 45, 55, 65. Then jump right 3 squares: 66, 67, 68. The answer is 68!",
  "Strategy Four: Round and Adjust.",
  "Round one number up to the nearest ten. Add it. Then subtract the extra you added. Let's try: 46 plus 39. Round 39 up to 40. So 46 plus 40 equals 86. But we added 1 too many. So 86 minus 1 equals 85. The answer is 85!",
  "Leo and Lily have learned all four strategies! Now it's your turn to practise and become a Mental Math Champion!",

  // Phase 3 - Simulation
  "Drag the tens rods to join them with the first number. Watch how the total changes!",
  "Now drag the ones cubes to complete the addition.",
  "Look at the number line. How far does the number need to jump to reach the next ten?",
  "Tap the arrow to make the first jump. Then tap again for the second jump!",
  "Click on the hundreds chart to jump down for tens, and right for ones.",
  "Round the number up to the nearest ten. Then add. Remember to adjust at the end!",

  // Phase 4 - Feedback / hints
  "Brilliant! You're a Mental Math Ninja! 🥷",
  "Great work! You figured it out! 💪",
  "Hmm, let's try again! Remember the strategy 🤔",
  "Let me give you a hint. Look at the strategy diagram.",
  "Amazing streak! You are on fire! 🔥",
  "You have completed all four mental math strategies! Which strategy is your favourite? Tell me why!",
  "Well done! You are a Mental Math Champion! Your lesson is complete! 🌟",
  "Not quite! Try one more time. Focus on the visual shortcut!",
  "Oh no! We ran out of energy. Let's head back and try again!",
  "Ah, the correct answer is "
]);

// Helper to load question bank texts dynamically
async function loadQuestionBankTexts() {
  const bankPath = path.join(projectRoot, 'src', 'data', 'questionBank.js');
  if (fs.existsSync(bankPath)) {
    try {
      // Since it is ES module, we import it dynamically
      const moduleUrl = 'file:///' + bankPath.replace(/\\/g, '/');
      const { questionBank } = await import(moduleUrl);
      if (Array.isArray(questionBank)) {
        for (const q of questionBank) {
          if (q.questionText) textLines.add(q.questionText);
          if (q.hint1) textLines.add(q.hint1);
          if (q.hint2) textLines.add(q.hint2);
        }
      }
    } catch (e) {
      console.warn("Could not import questionBank.js dynamically. Parsing as fallback...", e);
    }
  }
}

// Generate MD5 hash for a string
function getHash(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

// Main execution block
async function run() {
  console.log("Loading Question Bank texts...");
  await loadQuestionBankTexts();
  console.log(`Collected ${textLines.size} unique narration prompts.`);

  const audioMap = {};
  let downloadCount = 0;
  let skipCount = 0;

  for (const text of textLines) {
    const hash = getHash(text);
    const filename = `${hash}.mp3`;
    const destPath = path.join(audioDir, filename);
    const localUrl = `/assets/audio/${filename}`;

    if (fs.existsSync(destPath)) {
      audioMap[text] = localUrl;
      skipCount++;
      continue;
    }

    if (!apiKey) {
      continue;
    }

    console.log(`Downloading audio for: "${text.substring(0, 40)}..."`);
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(destPath, buffer);
      audioMap[text] = localUrl;
      downloadCount++;
      
      // Rate limiting safeguard
      await new Promise(r => setTimeout(r, 600));
    } catch (err) {
      console.error(`Failed to download audio for text: "${text}"`, err);
    }
  }

  // Write the audioMap.js file
  const mapContent = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.
// Generated by: node scripts/generate_audio.js
export const audioMap = ${JSON.stringify(audioMap, null, 2)};
`;

  fs.writeFileSync(mapFile, mapContent, 'utf8');
  console.log(`Audio map updated with ${Object.keys(audioMap).length} entries.`);
  console.log(`Success: Cached ${skipCount} audios. Downloaded ${downloadCount} new audios from ElevenLabs.`);
  if (!apiKey && downloadCount === 0) {
    console.log("Note: ELEVENLABS_API_KEY environment variable is not configured. Web Audio API / browser TTS will play dynamically during runtime.");
  }
}

run().catch(console.error);
