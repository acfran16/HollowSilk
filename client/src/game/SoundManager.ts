export class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.5;

  initialize() {
    // Load sound effects
    this.loadSound('hit', '/sounds/hit.mp3');
    this.loadSound('success', '/sounds/success.mp3');
    this.loadSound('jump', '/sounds/hit.mp3'); // Reuse hit sound for jump
    this.loadSound('dash', '/sounds/hit.mp3'); // Reuse hit sound for dash
    this.loadSound('player_hurt', '/sounds/hit.mp3'); // Reuse hit sound
    this.loadSound('kill', '/sounds/success.mp3'); // Reuse success sound
    this.loadSound('death', '/sounds/hit.mp3'); // Reuse hit sound
  }

  private loadSound(name: string, path: string) {
    const audio = new Audio(path);
    audio.volume = this.volume;
    audio.preload = 'auto';
    
    // Handle loading errors gracefully
    audio.addEventListener('error', () => {
      console.warn(`Failed to load sound: ${path}`);
    });
    
    this.sounds.set(name, audio);
  }

  playSound(name: string, volume: number = 1.0) {
    if (this.isMuted) return;

    const sound = this.sounds.get(name);
    if (!sound) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

    try {
      // Clone the audio to allow overlapping playback
      const soundClone = sound.cloneNode() as HTMLAudioElement;
      soundClone.volume = this.volume * volume;
      soundClone.currentTime = 0;
      
      soundClone.play().catch(error => {
        console.log(`Sound play prevented: ${name}`, error);
      });
    } catch (error) {
      console.warn(`Error playing sound: ${name}`, error);
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    this.sounds.forEach(sound => {
      sound.volume = this.volume;
    });
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
  }

  destroy() {
    this.sounds.forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
    this.sounds.clear();
  }
}
