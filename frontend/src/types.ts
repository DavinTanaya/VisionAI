export enum TimerMode {
  POMODORO = 'pomodoro',
  SHORT_BREAK = 'shortBreak'
}

export interface Session {
  id?: number;
  name: string;
  focus: number;
  break: number;
  repeat: number;
  runtime: number;
  yawning: number;
  closed: number;
  done: number;
}

export interface MusicTrack {
  id: number;
  title: string;
  type: 'youtube' | 'audio';
  url?: string;
  videoId?: string;
}