export type SleepTimerDuration = 5 | 10 | 15 | 30 | 60;

export interface SleepTimerState {
  isActive: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  duration: SleepTimerDuration | null;
}

export class SleepTimerService {
  private static instance: SleepTimerService;
  private interval: ReturnType<typeof setInterval> | null = null;
  private remainingSeconds: number = 0;
  private totalSeconds: number = 0;
  private listeners: Set<(state: SleepTimerState) => void> = new Set();
  private onExpire: (() => void) | null = null;
  private currentDuration: SleepTimerDuration | null = null;

  private constructor() {}

  static getInstance(): SleepTimerService {
    if (!SleepTimerService.instance) {
      SleepTimerService.instance = new SleepTimerService();
    }
    return SleepTimerService.instance;
  }

  /**
   * Start sleep timer
   */
  start(minutes: SleepTimerDuration, onExpire?: () => void): void {
    // Stop existing timer
    this.stop();

    this.totalSeconds = minutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.currentDuration = minutes;
    this.onExpire = onExpire || null;

    this.interval = setInterval(() => {
      this.remainingSeconds--;

      if (this.remainingSeconds <= 0) {
        this.stop();
        if (this.onExpire) {
          try {
            this.onExpire();
          } catch (error) {
            console.error('[SleepTimerService] Expire callback error:', error);
          }
        }
        console.log('[SleepTimerService] Sleep timer expired');
      }

      this.notifyListeners();
    }, 1000);

    this.notifyListeners();
    console.log(`[SleepTimerService] Sleep timer started: ${minutes} minutes`);
  }

  /**
   * Stop sleep timer
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.remainingSeconds = 0;
    this.totalSeconds = 0;
    this.currentDuration = null;
    this.notifyListeners();
    console.log('[SleepTimerService] Sleep timer stopped');
  }

  /**
   * Pause timer (keep time but stop countdown)
   */
  pause(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.notifyListeners();
      console.log('[SleepTimerService] Sleep timer paused');
    }
  }

  /**
   * Resume timer
   */
  resume(): void {
    if (!this.interval && this.remainingSeconds > 0) {
      this.interval = setInterval(() => {
        this.remainingSeconds--;

        if (this.remainingSeconds <= 0) {
          this.stop();
          if (this.onExpire) {
            try {
              this.onExpire();
            } catch (error) {
              console.error('[SleepTimerService] Expire callback error:', error);
            }
          }
        }

        this.notifyListeners();
      }, 1000);

      this.notifyListeners();
      console.log('[SleepTimerService] Sleep timer resumed');
    }
  }

  /**
   * Add time to timer
   */
  addTime(minutes: number): void {
    if (this.isActive()) {
      this.remainingSeconds += minutes * 60;
      this.totalSeconds += minutes * 60;
      this.notifyListeners();
      console.log(`[SleepTimerService] Added ${minutes} minutes to timer`);
    }
  }

  /**
   * Get current state
   */
  getState(): SleepTimerState {
    return {
      isActive: this.isActive(),
      remainingSeconds: this.remainingSeconds,
      totalSeconds: this.totalSeconds,
      duration: this.currentDuration,
    };
  }

  /**
   * Check if timer is running
   */
  isActive(): boolean {
    return this.interval !== null && this.remainingSeconds > 0;
  }

  /**
   * Get remaining time in minutes
   */
  getRemainingMinutes(): number {
    return Math.ceil(this.remainingSeconds / 60);
  }

  /**
   * Get remaining time formatted (MM:SS)
   */
  getFormattedTime(): string {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  /**
   * Get progress percentage
   */
  getProgress(): number {
    if (this.totalSeconds === 0) return 0;
    return (this.remainingSeconds / this.totalSeconds) * 100;
  }

  /**
   * Subscribe to timer changes
   */
  subscribe(listener: (state: SleepTimerState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  /**
   * Private: Notify listeners
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('[SleepTimerService] Listener error:', error);
      }
    });
  }
}

export const sleepTimerService = SleepTimerService.getInstance();
