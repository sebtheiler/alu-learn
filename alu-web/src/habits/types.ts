export interface Habit {
  title: string;
  value: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  cue?: string;
  craving?: string;
  response?: string;
  reward?: string;
}

export interface Routine {
  title: string;
  habits: Habit[];
  ordered: boolean;
}
