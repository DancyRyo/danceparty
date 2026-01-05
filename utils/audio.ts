
class DiscoAudio {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private loop: number | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createKick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.5);
  }

  private createSnare(time: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + 0.2);
  }

  private createBass(time: number, freq: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);
    
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.3);
  }

  startParty() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;

    let beat = 0;
    const tempo = 124; // BPM
    const beatLength = 60 / tempo;

    const schedule = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Kick on every beat
      this.createKick(now);
      
      // Snare on 2 and 4
      if (beat % 2 === 1) {
        this.createSnare(now);
      }

      // Bassline
      const notes = [55, 65, 49, 58];
      this.createBass(now, notes[beat % 4]);
      this.createBass(now + beatLength/2, notes[beat % 4] * 1.5);

      beat++;
      this.loop = window.setTimeout(schedule, beatLength * 1000);
    };

    schedule();
  }

  stopParty() {
    this.isPlaying = false;
    if (this.loop) clearTimeout(this.loop);
  }
}

export const discoAudio = new DiscoAudio();
