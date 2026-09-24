// Sound effects using Web Audio API (Zero external network dependencies, 100% reliable)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Play a sparkling ascending arpeggio for earning stars
 */
export function playStarChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const startTime = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime + idx * 0.09);

    gain.gain.setValueAtTime(0, startTime + idx * 0.09);
    gain.gain.linearRampToValueAtTime(0.18, startTime + idx * 0.09 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.09 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime + idx * 0.09);
    osc.stop(startTime + idx * 0.09 + 0.4);
  });
}

/**
 * Play a triumphant fanfare for unlocking badges
 */
export function playBadgeFanfare(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Triumphant chord progression: C4, G4, C5, E5, G5
  const chords = [
    { notes: [261.63, 329.63, 392.0], start: 0, duration: 0.18 }, // C major
    { notes: [329.63, 392.0, 523.25], start: 0.18, duration: 0.18 }, // E/G/C
    { notes: [392.0, 523.25, 659.25], start: 0.36, duration: 0.22 }, // G/C/E
    { notes: [523.25, 659.25, 783.99, 1046.5], start: 0.6, duration: 0.6 }, // Final flourish
  ];

  const baseTime = ctx.currentTime;

  chords.forEach((chord) => {
    chord.notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, baseTime + chord.start);

      gain.gain.setValueAtTime(0, baseTime + chord.start);
      gain.gain.linearRampToValueAtTime(0.15, baseTime + chord.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, baseTime + chord.start + chord.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(baseTime + chord.start);
      osc.stop(baseTime + chord.start + chord.duration + 0.05);
    });
  });
}

/**
 * Play a light celebratory pop for quick micro-achievements (e.g. word tap)
 */
export function playPopChirp(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}

/**
  Play a satisfying snap/pop click when a draggable tile drops into a slot
 */
export function playDropSnap(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(780, now + 0.05);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.09);
}

/**
 * Play a gentle, encouraging "try again" sound
 */
export function playTryAgain(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(330, now);
  osc.frequency.linearRampToValueAtTime(260, now + 0.18);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.25);
}

/**
 * Speak positive praise using the browser's SpeechSynthesis API
 */
export function speakPraiseEncouragement(message: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    utterance.pitch = 1.25; // cheerful, friendly voice
    utterance.rate = 1.0;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Graceful fallback
  }
}
