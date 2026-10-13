/**
 * BgmManager - Quản lý nhạc nền (Background Music) cho Beast Link Battle.
 * Hỗ trợ Web Audio / HTML5 Audio với xử lý Autoplay policy, fading, volume và toggle bật/tắt.
 */

export interface BgmTrackConfig {
  key: string;
  url: string;
  loop?: boolean;
  volume?: number;
}

export const BGM_TRACKS = {
  LOBBY: {
    key: 'bgm-lobby',
    url: '/assets/audio/bgm/lobby-theme.mp3',
    loop: true,
    volume: 0.5,
  },
  BATTLE: {
    key: 'bgm-battle',
    url: '/assets/audio/bgm/battle-theme.mp3',
    loop: true,
    volume: 0.45,
  },
} as const;

export class BgmManager {
  private static instance?: BgmManager;
  private audio?: HTMLAudioElement;
  private currentKey?: string;
  private _enabled = true;
  private _volume = 0.5;
  private unlocked = false;

  private constructor() {
    // Đọc trạng thái từ localStorage nếu có
    const saved = localStorage.getItem('beast-link-bgm-enabled');
    if (saved !== null) {
      this._enabled = saved === 'true';
    }
    this.setupGestureUnlock();
  }

  static getInstance(): BgmManager {
    if (!this.instance) {
      this.instance = new BgmManager();
    }
    return this.instance;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  get volume(): number {
    return this._volume;
  }

  setEnabled(value: boolean): void {
    this._enabled = value;
    localStorage.setItem('beast-link-bgm-enabled', String(value));
    if (!value) {
      this.pause();
    } else if (this.currentKey) {
      void this.resume();
    }
  }

  setVolume(volume: number): void {
    this._volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this._volume;
    }
  }

  /**
   * Phát nhạc nền Sảnh chờ / Menu chính
   */
  playLobby(): void {
    this.play(BGM_TRACKS.LOBBY);
  }

  /**
   * Phát nhạc nền Trận chiến
   */
  playBattle(): void {
    this.play(BGM_TRACKS.BATTLE);
  }

  /**
   * Phát track bất kỳ theo cấu hình
   */
  play(track: BgmTrackConfig): void {
    if (this.currentKey === track.key && this.audio && !this.audio.paused) {
      return;
    }

    this.currentKey = track.key;

    if (!this._enabled) {
      return;
    }

    if (!this.audio) {
      this.audio = new Audio();
    }

    this.audio.src = track.url;
    this.audio.loop = track.loop ?? true;
    this.audio.volume = (track.volume ?? 0.5) * this._volume;

    if (this.unlocked) {
      this.audio.play().catch(() => {
        // Tự động bỏ qua lỗi nếu trình duyệt chặn autoplay
      });
    }
  }

  pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  async resume(): Promise<void> {
    if (this.audio && this._enabled) {
      try {
        await this.audio.play();
      } catch {
        // Bỏ qua lỗi trình duyệt
      }
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.currentKey = undefined;
  }

  /**
   * Lắng nghe tương tác đầu tiên của người dùng (Click / Touch) để unlock Autoplay
   */
  private setupGestureUnlock(): void {
    const unlockHandler = () => {
      this.unlocked = true;
      if (this._enabled && this.audio && this.audio.paused && this.currentKey) {
        this.audio.play().catch(() => {});
      }
      window.removeEventListener('pointerdown', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
    };

    window.addEventListener('pointerdown', unlockHandler, { once: true });
    window.addEventListener('keydown', unlockHandler, { once: true });
  }
}

export const bgmManager = BgmManager.getInstance();
