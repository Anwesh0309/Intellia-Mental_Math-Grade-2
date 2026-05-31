import { audioMap } from './audioMap';

// Segment helper constructors
export const say       = (text) => ({ text, style: 'statement' });
export const ask       = (text) => ({ text, style: 'question' });
export const cheer     = (text) => ({ text, style: 'encouragement' });
export const emphasize = (text) => ({ text, style: 'emphasis' });
export const think     = (text) => ({ text, style: 'thinking' });
export const celebrate = (text) => ({ text, style: 'celebration' });
export const instruct  = (text) => ({ text, style: 'instruction' });

// Global playback queue controller
let currentQueueSymbol = null;
let activeAudioElement = null;

// Sound Effects Synthesizer using Web Audio API
export function playSfx(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'correct') {
      // High-pitched retro chime (coin sound)
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc1.frequency.setValueAtTime(1046.50, now + 0.24); // C6
      
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);
    } 
    else if (type === 'incorrect') {
      // A gentle, non-punishing warning tone sliding downwards
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.3);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } 
    else if (type === 'streak') {
      // Arpeggio rising rapidly
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.1, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.25);
      });
    } 
    else if (type === 'badge') {
      // Triumphant double major chord fanfare
      const now = ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.setValueAtTime(freq * 1.25, now + 0.15); // Shift to E major
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.75);
      });
    }
  } catch (err) {
    console.error("SFX synthesis failed:", err);
  }
}

/**
 * High-level playSound wrapper maps semantic sound types
 * to synthesizer sound effects.
 */
export function playSound(type) {
  if (type === 'chime' || type === 'correct') {
    playSfx('correct');
  } else if (type === 'warning' || type === 'incorrect') {
    playSfx('incorrect');
  } else if (type === 'fanfare' || type === 'badge') {
    playSfx('badge');
  } else {
    playSfx(type);
  }
}

// Check audioMap registry, fallback dynamically
async function getAudioUrl(text, style) {
  if (audioMap && audioMap[text]) {
    return audioMap[text];
  }
  // If we had a proxy, we could call it:
  // try {
  //   const res = await fetch('/api/elevenlabs', { ... })
  // }
  return null;
}

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2';

// Dynamic ElevenLabs API request in browser
async function speakElevenLabs(text, myQueueSymbol) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not defined");
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      'accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    if (myQueueSymbol && currentQueueSymbol !== myQueueSymbol) {
      return resolve();
    }

    const audio = new Audio(audioUrl);
    activeAudioElement = audio;

    audio.onended = () => {
      activeAudioElement = null;
      resolve();
    };

    audio.onerror = (e) => {
      activeAudioElement = null;
      reject(e);
    };

    audio.play().catch((e) => {
      activeAudioElement = null;
      reject(e);
    });
  });
}

// Sequence speaker queue using Web Speech Synthesis or MP3 Audio
export async function narrate(segments, resetQueue = false) {
  if (resetQueue) {
    stopNarration();
  }
  
  const myQueueSymbol = Symbol();
  currentQueueSymbol = myQueueSymbol;

  for (let i = 0; i < segments.length; i++) {
    if (currentQueueSymbol !== myQueueSymbol) return; // Cancelled by newer queue

    const segment = segments[i];
    const mp3Url = await getAudioUrl(segment.text, segment.style);
    
    if (currentQueueSymbol !== myQueueSymbol) return;

    if (mp3Url) {
      // Play Static Cached MP3
      await new Promise((resolve) => {
        if (currentQueueSymbol !== myQueueSymbol) return resolve();
        
        const audio = new Audio(mp3Url);
        activeAudioElement = audio;
        
        audio.onended = () => {
          activeAudioElement = null;
          resolve();
        };
        
        audio.onerror = () => {
          activeAudioElement = null;
          // Fall back to dynamic ElevenLabs or SpeechSynthesis
          speakElevenLabs(segment.text, myQueueSymbol)
            .catch(() => speakTTS(segment.text, myQueueSymbol))
            .then(resolve);
        };
        
        audio.play().catch(() => {
          // Playback blocked or failed
          speakElevenLabs(segment.text, myQueueSymbol)
            .catch(() => speakTTS(segment.text, myQueueSymbol))
            .then(resolve);
        });
      });
    } else {
      // No static cached asset: Try ElevenLabs dynamic, then browser native Speech Synthesis
      await new Promise((resolve) => {
        speakElevenLabs(segment.text, myQueueSymbol)
          .catch(() => speakTTS(segment.text, myQueueSymbol))
          .then(resolve);
      });
    }
  }
}

// Stop all active queue narrations
export function stopNarration() {
  currentQueueSymbol = null;
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement = null;
    } catch (e) {}
  }
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

// Speak standard browser-native TTS
function speakTTS(text, myQueueSymbol) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) return resolve();
    if (myQueueSymbol && currentQueueSymbol !== myQueueSymbol) return resolve();

    // Cancel current SpeechSynthesis speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose Singapore English or fallback
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.lang === 'en-SG' || v.name.includes('Singapore'));
    if (!selectedVoice) {
      // Fallback English
      selectedVoice = voices.find(v => v.lang.startsWith('en-GB')) || 
                      voices.find(v => v.lang.startsWith('en-US')) || 
                      voices.find(v => v.lang.startsWith('en'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Child-friendly clear speed and pitch
    utterance.rate = 0.95; 
    utterance.pitch = 1.05;

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = () => {
      resolve();
    };

    window.speechSynthesis.speak(utterance);
    
    // Safety timeout in case end event doesn't fire (browser bug)
    setTimeout(() => {
      resolve();
    }, text.length * 100 + 1000); 
  });
}

// Make sure speechSynthesis updates voices when loaded
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {};
}
