import { Node } from 'slate';
import { MinifiedProfile, Profile } from '../profiles/types';

export type UUID = string;  // Just a more clear representation

export type SchedulingAlgorithm = 'ANKI' | 'ANKING' | 'MANUAL-SR' | 'CRAM';
export type DeckDifficulty = 'HARD' | 'NORM' | 'EASY';
export type SharingSetting = 'PUBLIC' | 'FRIENDS' | 'STUDENT' | 'PRIVATE';
export type FlashCardTypes = 'basic' | 'reversed' | 'cloze';
export type LearningStatus = 'UNSEEN' | 'LEARNING' | 'LEARNED' | 'RELEARNING';

export interface Deck {
  author: Profile | MinifiedProfile;
  title: string;
  serializer_name: 'deck' | 'shared_deck' | 'cssm';
  scheduling_algorithm: SchedulingAlgorithm;
  shuffle_unseen_cards: boolean;
  new_cards_done_today: number;
  daily_new_card_limit: number;
  daily_seen_card_limit: number;
  review_ahead_minutes: number;
  shared_deck: number;
  deck_type: 'standard' | 'shared';
  difficulty: DeckDifficulty;
  id: number;
}


export interface SharedDeck extends Deck {
  description: string;
  sharing_setting: SharingSetting;
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
  id: UUID;
}


export interface ReviewInstance extends FlashCard {
  tags: string;
  next_review: string; // ISO date string
  steps_index: number;
  learning_status: LearningStatus;
  ease: number;
  interval: number;
  is_suspended: boolean;
  is_leech: boolean;
  leech_index: number;
  parent_deck_id: number;
  parent_deck_title: string;
  flashcard_id: UUID;
  flashcard_type: FlashCardTypes;
  name: string;
  id: UUID;
}

export type AnyFlashCard = FlashCard | ReviewInstance;
