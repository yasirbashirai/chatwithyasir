// Soft, Apple-style UI sounds, synthesized live with the Web Audio API.
// No audio files: every sound is a few sine/triangle notes with gentle
// attack/decay envelopes so nothing feels harsh. Respects a mute toggle.

let ctx: AudioContext | null = null;
let enabled: boolean = (() => {
  try {
    return localStorage.getItem("cwy_sound") !== "off";
  } catch {
    return true;
  }
})();

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function soundEnabled() {
  return enabled;
}

export function setSoundEnabled(v: boolean) {
  enabled = v;
  try {
    localStorage.setItem("cwy_sound", v ? "on" : "off");
  } catch {
    /* ignore */
  }
  if (v) ac(); // warm up the audio context on enable
}

interface NoteOpts {
  type?: OscillatorType;
  gain?: number;
  glideTo?: number;
}

// One soft note: quick fade-in, smooth exponential fade-out.
function note(freq: number, start: number, dur: number, opts: NoteOpts = {}) {
  const c = ac();
  if (!c) return;
  const { type = "sine", gain = 0.14, glideTo } = opts;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.03);
}

// Warm ascending arpeggio — the "we're live" moment when the chat opens.
export function playStart() {
  if (!enabled) return;
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  note(523.25, t, 0.5, { gain: 0.11 }); // C5
  note(659.25, t + 0.09, 0.5, { gain: 0.11 }); // E5
  note(783.99, t + 0.18, 0.6, { gain: 0.12 }); // G5
  note(1046.5, t + 0.27, 0.75, { gain: 0.09 }); // C6
}

// Soft upward swoosh when the visitor sends a message.
export function playSend() {
  if (!enabled) return;
  const c = ac();
  if (!c) return;
  note(440, c.currentTime, 0.18, { type: "triangle", gain: 0.13, glideTo: 880 });
}

// Gentle two-note chime when a reply (or notification) arrives.
export function playReceive() {
  if (!enabled) return;
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  note(880, t, 0.22, { gain: 0.11 }); // A5
  note(1174.66, t + 0.1, 0.32, { gain: 0.1 }); // D6
}

// Subtle blip for tapping an option / quick action.
export function playTap() {
  if (!enabled) return;
  const c = ac();
  if (!c) return;
  note(660, c.currentTime, 0.08, { gain: 0.09, glideTo: 990 });
}

// Very soft low tick emitted while Yasir is "typing".
export function playTyping() {
  if (!enabled) return;
  const c = ac();
  if (!c) return;
  note(320, c.currentTime, 0.05, { gain: 0.045 });
}
