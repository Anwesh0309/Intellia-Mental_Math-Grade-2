import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const FILES_TO_UPDATE = [
  'src/App.jsx',
  'src/utils/narration.js',
  'src/data/storyContent.js',
  'src/data/questionBank.js',
  'src/components/ProgressMap.jsx',
  'src/components/IntroScreen.jsx',
  'src/components/phases/WonderPhase.jsx',
  'src/components/phases/StoryPhase.jsx',
  'src/components/phases/SimulatePhase.jsx',
  'src/components/phases/PlayPhase.jsx',
  'src/components/phases/ReflectPhase.jsx',
  'scripts/generate_audio.js'
];

const REPLACEMENTS = [
  { search: /Priya/g, replace: 'Lily' },
  { search: /Wei Ming/g, replace: 'Leo' },
  { search: /Amir/g, replace: 'Noah' },
  { search: /Coach LearnFlow/g, replace: 'Coach Cooper' }
];

for (const relPath of FILES_TO_UPDATE) {
  const fullPath = path.join(projectRoot, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;
    
    for (const item of REPLACEMENTS) {
      content = content.replace(item.search, item.replace);
    }
    
    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated names in: ${relPath}`);
    }
  } else {
    console.warn(`File not found: ${relPath}`);
  }
}
