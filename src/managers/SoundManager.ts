export class SoundManager {
  private static instance: SoundManager | null = null;
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private isInitialized = false;
  private isEnabled = true;

  private constructor() {
    // 사용자 상호작용 후 초기화하도록 대기
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private async initializeAudioContext(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Web Audio API 사용 (최신 브라우저 표준)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // 오디오 파일 로드
      const response = await fetch("/ball_sound.mp3");
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.isInitialized = true;
      console.log("SoundManager initialized with Web Audio API");
    } catch (error) {
      console.warn("Failed to initialize Web Audio API:", error);
      this.isEnabled = false;
    }
  }

  public async playBallSound(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // 첫 번째 호출시 초기화
      if (!this.isInitialized) {
        await this.initializeAudioContext();
      }

      if (!this.audioContext || !this.audioBuffer) return;

      // AudioContext가 suspended 상태면 resume (브라우저 autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // 새로운 source 노드 생성 (재사용 불가)
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = this.audioBuffer;
      gainNode.gain.value = this.volume; // 볼륨 설정

      // 연결: source → gain → destination
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // 재생
      source.start(0);
    } catch (error) {
      console.warn("Failed to play ball sound:", error);
    }
  }

  private volume = 0.3;

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioBuffer = null;
    this.isInitialized = false;
  }
}
