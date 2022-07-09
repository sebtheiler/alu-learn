import type { Node as SlateNode } from 'slate';

export type UUID = string;  // Just a more clear representation

export type EditAccess = 'PERSONAL' | 'FRIENDS' | 'EVERYBODY' | 'STUDENTS';
export type FlashCardTypes = 'BASIC' | 'REVERSED' | 'CLOZE';
export type SchedulingAlgorithm = 'ANKI' | 'ANKING';
export type ViewAccess = 'PUBLIC' | 'FRIENDS' | 'STUDENT';

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
  images: UploadedImage[];
  id: UUID;
}

export interface UploadedImage {
  image: string;
  description: string;
  original_url: string;
  field_number: number;
  id: number;
}