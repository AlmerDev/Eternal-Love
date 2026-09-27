// Romantic Web Audio & Offline Audio Data Generator for Ciyan & Daffa

// Generates a valid PCM WAV data URL with a gentle acoustic romance melody
export function generateRomanticWav(type: 'bgm' | 'abadi' | 'ciyan' | 'daffa'): string {
  const sampleRate = 8000;
  const duration = 12; // 12 seconds loop
  const totalSamples = sampleRate * duration;

  // Chord frequencies (Hz) for romantic progressions
  let chords: number[][];
  if (type === 'bgm') {
    // Soft ambient Banda Neira style: Cmaj7 - Fmaj7 - Am - G
    chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [196.00, 246.94, 293.66, 392.00], // G
    ];
  } else if (type === 'abadi') {
    // Sempurna romantic ballad: D - F#m - Bm - G
    chords = [
      [293.66, 369.99, 440.00], // D
      [185.00, 220.00, 277.18], // F#m
      [246.94, 293.66, 369.99], // Bm
      [196.00, 246.94, 293.66], // G
    ];
  } else if (type === 'ciyan') {
    // Sweet acoustic ballad: F - C - Dm - Bb
    chords = [
      [349.23, 440.00, 523.25], // F
      [261.63, 329.63, 392.00], // C
      [293.66, 349.23, 440.00], // Dm
      [233.08, 293.66, 349.23], // Bb
    ];
  } else {
    // Daffa soulful acoustic: G - D/F# - Em - C
    chords = [
      [196.00, 246.94, 293.66, 392.00], // G
      [185.00, 220.00, 293.66],         // D/F#
      [164.81, 196.00, 246.94, 329.63], // Em
      [261.63, 329.63, 392.00],         // C
    ];
  }

  const pcmData = new Uint8Array(totalSamples);
  const chordDuration = totalSamples / chords.length;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor(i / chordDuration) % chords.length;
    const currentChord = chords[chordIndex];
    const localTime = (i % chordDuration) / sampleRate;

    // Soft envelope with gentle attack and decay
    const env = Math.exp(-localTime * 0.95);

    let sampleVal = 0;
    // Arpeggiate notes in the chord
    const noteIndex = Math.floor(localTime * 3) % currentChord.length;
    const baseFreq = currentChord[noteIndex];

    // Fundamental + gentle warm octave + sub
    sampleVal += Math.sin(2 * Math.PI * baseFreq * t) * 0.45;
    sampleVal += Math.sin(2 * Math.PI * (baseFreq * 2) * t) * 0.2;
    sampleVal += Math.sin(2 * Math.PI * (baseFreq * 0.5) * t) * 0.25;

    // Apply envelope & scale to 8-bit unsigned PCM (128 is center)
    const normalized = sampleVal * env * 0.4;
    pcmData[i] = Math.floor(128 + Math.max(-127, Math.min(127, normalized * 120)));
  }

  // Build RIFF WAVE Header (44 bytes for 8-bit mono)
  const header = new Uint8Array(44);
  const writeString = (offset: number, str: string) => {
    for (let j = 0; j < str.length; j++) {
      header[offset + j] = str.charCodeAt(j);
    }
  };
  const writeUint32 = (offset: number, val: number) => {
    header[offset] = val & 0xff;
    header[offset + 1] = (val >> 8) & 0xff;
    header[offset + 2] = (val >> 16) & 0xff;
    header[offset + 3] = (val >> 24) & 0xff;
  };
  const writeUint16 = (offset: number, val: number) => {
    header[offset] = val & 0xff;
    header[offset + 1] = (val >> 8) & 0xff;
  };

  writeString(0, 'RIFF');
  writeUint32(4, 36 + totalSamples);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  writeUint32(16, 16); // SubChunk1Size (PCM = 16)
  writeUint16(20, 1);  // AudioFormat (1 = PCM)
  writeUint16(22, 1);  // NumChannels (1 = Mono)
  writeUint32(24, sampleRate); // SampleRate
  writeUint32(28, sampleRate); // ByteRate (SampleRate * 1 * 1)
  writeUint16(32, 1);  // BlockAlign
  writeUint16(34, 8);  // BitsPerSample (8 bits)
  writeString(36, 'data');
  writeUint32(40, totalSamples);

  // Combine header + PCM data into Base64
  const fullBytes = new Uint8Array(header.length + pcmData.length);
  fullBytes.set(header, 0);
  fullBytes.set(pcmData, header.length);

  let binary = '';
  const len = fullBytes.byteLength;
  for (let b = 0; b < len; b++) {
    binary += String.fromCharCode(fullBytes[b]);
  }

  return 'data:audio/wav;base64,' + btoa(binary);
}

// Pre-generated static fallback audio for 100% reliable offline playback
export const FALLBACK_AUDIO = {
  bgm: generateRomanticWav('bgm'),
  abadi: generateRomanticWav('abadi'),
  ciyan: generateRomanticWav('ciyan'),
  daffa: generateRomanticWav('daffa'),
};

// Safe Web Audio API synthesizer for live playback when streaming audio is unavailable
class RomanticAcousticSynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;
  private gainNode: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  play(type: 'bgm' | 'abadi' | 'ciyan' | 'daffa', volume: number = 0.8) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.stop();
      this.isPlaying = true;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume * 0.4));
      this.gainNode.connect(this.ctx.destination);

      const notes =
        type === 'bgm'
          ? [261.63, 329.63, 392.0, 493.88, 392.0, 329.63]
          : type === 'abadi'
          ? [293.66, 369.99, 440.0, 587.33, 440.0, 369.99]
          : type === 'ciyan'
          ? [349.23, 440.0, 523.25, 659.25, 523.25, 440.0]
          : [196.0, 246.94, 293.66, 392.0, 293.66, 246.94];

      let noteIdx = 0;
      this.intervalId = setInterval(() => {
        if (!this.isPlaying || !this.ctx || !this.gainNode) return;

        const freq = notes[noteIdx % notes.length];
        noteIdx++;

        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        noteGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

        osc.connect(noteGain);
        noteGain.connect(this.gainNode);

        osc.start();
        osc.stop(this.ctx.currentTime + 1.3);
      }, 550);
    } catch (err) {
      console.warn('Web Audio playback error:', err);
    }
  }

  setVolume(vol: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(
        Math.max(0, Math.min(1, vol * 0.4)),
        this.ctx.currentTime
      );
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const romanticSynth = new RomanticAcousticSynth();
