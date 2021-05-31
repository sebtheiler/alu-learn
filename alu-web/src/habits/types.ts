export type HabitValue = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export interface Habit {
  title: string;
  value: HabitValue;
  cue?: string;
  craving?: string;
  response?: string;
  reward?: string;
  habit_num: number;
  id: number;
}

export interface Routine {
  title: string;
  habits: Habit[];
  ordered: boolean;
  routine_num: number;
  id: number;
}
