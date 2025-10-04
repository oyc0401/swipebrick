export class SoundManager {
  private static instance: SoundManager | null = null;
  private ballSounds: HTMLAudioElement[] = [];
  private currentSoundIndex = 0;
  private readonly SOUND_POOL_SIZE = 10;

  private constructor() {
    this.initializeSounds();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initializeSounds(): void {
    try {
      // Audio Pool 생성 - 여러 개의 Audio 인스턴스를 미리 생성
      for (let i = 0; i < this.SOUND_POOL_SIZE; i++) {
        const audio = new Audio("/ball_sound.mp3");
        audio.preload = "auto";
        audio.volume = 0.3;
        this.ballSounds.push(audio);
      }
      console.log(
        `Sound pool initialized with ${this.SOUND_POOL_SIZE} instances`
      );
    } catch (error) {
      console.warn("Failed to initialize ball sounds:", error);
    }
  }

  public playBallSound(): void {
    if (this.ballSounds.length > 0) {
      try {
        // Pool에서 현재 인덱스의 Audio 사용
        const sound = this.ballSounds[this.currentSoundIndex];
        sound.currentTime = 0; // 처음부터 재생

        sound.play().catch((error) => {
          console.warn("Failed to play ball sound:", error);
        });

        // 다음 인덱스로 순환 (Pool을 돌려가며 사용)
        this.currentSoundIndex =
          (this.currentSoundIndex + 1) % this.ballSounds.length;
      } catch (error) {
        console.warn("Failed to play ball sound:", error);
      }
    }
  }

  public setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.ballSounds.forEach((audio) => {
      audio.volume = clampedVolume;
    });
  }

  public destroy(): void {
    this.ballSounds.forEach((audio) => {
      audio.pause();
    });
    this.ballSounds = [];
    this.currentSoundIndex = 0;
  }
}
