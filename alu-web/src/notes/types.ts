import { Node } from 'slate';
import { MinifiedProfile } from '../profiles/types';

export interface Note {
  author: MinifiedProfile;
  title: string;
  // serializer_name: 
  pages: BaseNotePage[];
  id: number;
}

export interface BaseNotePage {
  title: string;
  page_number: number;
  note_page_type: 'STND' | 'CORN';
  id: number;
}

export interface StandardNotePage extends BaseNotePage {
  content: Node[];
}

export interface CornellNotePage extends BaseNotePage {
  sections: CornellSectionInterface[];
  summary: Node[];
}

export interface CornellSectionInterface {
  cue: Node[];
  content: Node[];
}

export interface NotePage extends StandardNotePage, CornellNotePage {}
