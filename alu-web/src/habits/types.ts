import { HistoryAction } from '../lookup/lookup';

export type HabitValue = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export interface HabitHistory {
  date: string;
  done: boolean;
}

export interface Habit {
  title: string;
  value: HabitValue;
  cue?: string;
  craving?: string;
  response?: string;
  reward?: string;
  notes?: string;
  habit_num: number;
  history: HabitHistory[];
  id: number;
}

export interface Routine {
  title: string;
  habits: Habit[];
  ordered: boolean;
  routine_num: number;
  id: number;
}

// Less important types
export interface EditHabitOptions {
  title?: string | null;
  cue?: string;
  craving?: string;
  response?: string;
  reward?: string;
  notes?: string;
  historyAction?: HistoryAction;
  value?: HabitValue;
}
export type ShowOptions = 'VALUES' | 'BUTTONS' | 'COMPONENTS' | 'NOTES' | 'OTHER';
