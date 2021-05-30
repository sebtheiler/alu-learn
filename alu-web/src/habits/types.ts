export type HabitValue = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export interface Habit {
  title: string;
  value: HabitValue;
  cue?: string;
  craving?: string;
  response?: string;
  reward?: string;
  id: number;
}

export interface Routine {
  title: string;
  habits: Habit[];
  ordered: boolean;
  id: number;
}
