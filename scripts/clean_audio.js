import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = path.resolve('public/assets/audio');
const AUDIO_MAP_PATH = path.resolve('src/utils/audioMap.js');

async function loadAudioMap() {
  const module = await import(pathToFileURL(AUDIO_MAP_PATH).href);
  return module.audioMap || {};
}

function pathToFileURL(filePath) {
  return new URL(`file://${path.resolve(filePath)}`);
}

async function main() {
  const audioMap = await loadAudioMap();
  const validFiles = new Set(Object.values(audioMap).map((value) => path.basename(value)));

  let deletedCount = 0;
  const items = await fs.readdir(AUDIO_DIR, { withFileTypes: true }).catch(() => []);

  for (const item of items) {
    if (!item.isFile() || !item.name.endsWith('.mp3')) continue;
    if (!validFiles.has(item.name)) {
      const targetPath = path.join(AUDIO_DIR, item.name);
      await fs.unlink(targetPath);
      console.log('Removed orphaned audio file:', item.name);
      deletedCount += 1;
    }
  }

  console.log(`Cleanup complete. Removed ${deletedCount} orphaned files.`);
}

main().catch((error) => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
