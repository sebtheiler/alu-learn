import { Node } from 'slate';
import { MinifiedProfile } from '../profiles/types';
import { MainSection } from './skill-tree/types';

export type UUID = string;  // Just a more clear representation

export type SchedulingAlgorithm = 'ANKI' | 'ANKING' | 'MANUAL-SR' | 'CRAM';
export type DeckDifficulty = 'HARD' | 'NORM' | 'EASY';
export type ViewAccess = 'PUBLIC' | 'FRIENDS' | 'STUDENT';
export type EditAccess = 'PERSONAL' | 'FRIENDS' | 'EVERYBODY' | 'STUDENTS';
export type FlashCardTypes = 'basic' | 'reversed' | 'cloze';
export type LearningStatus = 'UNSEEN' | 'LEARNING' | 'LEARNED' | 'RELEARNING';

export interface Deck {
  user: MinifiedProfile;
  title: string;
  main_sections: MainSection[];
  equivalent_to_snapshot: UUID;
  id: number;
}


export interface SharedDeck extends Deck {
  description: string;
  sharing_setting: ViewAccess;
  num_clones: number;
  creators: Deck[];
}


export interface SSMInterface {
  scheduling_algorithm: SchedulingAlgorithm;
  shuffle_unseen_cards: boolean;
  daily_new_card_limit: number;
  daily_seen_card_limit: number;
  new_cards_done_today: number;
  review_ahead_minutes: number;
  difficulty: DeckDifficulty;
  deck_id?: number;
  id: number;
}


export interface CSSM extends SSMInterface {
  author: MinifiedProfile;
  title: string;
  serializer_name: 'cssm';
  deck_ids?: string;
  tags?: string;
  contains?: string;
  leech?: boolean;
  learning_status?: LearningStatus;
  min_ease?: number;
  max_ease?: number;
}


export interface FlashCard {
  fields: Node[][];
  tags: string;
  flashcard_type: FlashCardTypes;
  flashcard_num: number;
  parent_deck_id: number;
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
  is_leech: boolean;
  leech_index: number;
  name: string;
  flashcard_fields?: Node[][];
  flashcard_front_image?: string;
  flashcard_back_image?: string;
  id: UUID;
}

export type AnyFlashCard = FlashCard | ReviewInstance;
