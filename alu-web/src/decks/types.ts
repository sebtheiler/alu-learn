import { MainSection } from './skill-tree/types';
import { MinifiedProfile } from '../profiles/types';
import { Node as SlateNode } from 'slate';

export type UUID = string;  // Just a more clear representation

export type DeckDifficulty = 'HARD' | 'NORM' | 'EASY';
export type EditAccess = 'PERSONAL' | 'FRIENDS' | 'EVERYBODY' | 'STUDENTS';
export type FlashCardTypes = 'BASIC' | 'REVERSED' | 'CLOZE';
export type LearningStatus = 'UNSEEN' | 'LEARNING' | 'LEARNED' | 'RELEARNING';
export type SchedulingAlgorithm = 'ANKI' | 'ANKING' | 'MANUAL-SR' | 'CRAM';
export type ViewAccess = 'PUBLIC' | 'FRIENDS' | 'STUDENT';

export interface Deck {
  user: MinifiedProfile;
  title: string;
  main_sections: MainSection[];
  equivalent_to_snapshot: UUID;
  is_updated: boolean;
  id: number;
}

export interface FlashCard {
  flashcard_type: FlashCardTypes;
  order_num: number;
  parent_deck_id: number;
  data: FlashCardData;
  universal_flashcard_id?: UUID;
  id: UUID;
}

export interface FlashCardData {
  fields: SlateNode[][];
  tags: string;
  front_image?: string;
  back_image?: string;
  id: UUID;
}

export interface ReviewInstance {
  next_review: string; // ISO date string
  last_review: string; // ISO date string
  steps_index: number;
  learning_status: LearningStatus;
  ease: number;
  name: string;
  data?: FlashCardData;
  flashcard_type: FlashCardTypes;
  id: UUID;
}
