import { SharedDeck } from '../decks/types';
import { ProfileHistory } from '../profiles/types';

export interface Classroom {
  title: string;
  code: string;
  shared_deck?: SharedDeck;
  id: number;
}

export interface Student {
  first_name: string;
  last_name: string;
  current_streak: number;
  today_stats: ProfileHistory[];
  id: number;
}

export interface ParsedStats {
  flashcardTypes?: any[];
  avgEase?: number;
  studentHistory?: ProfileHistory[];
}

export interface Assignment {
  title: string;
  classroom: number;
  tag_query: string;
  due_date: string;
  percent_complete?: number;
  study_session_manager?: number;
  id: number;
}

export interface ClassroomAssignments extends Classroom {
  assignments: Assignment[];
}
