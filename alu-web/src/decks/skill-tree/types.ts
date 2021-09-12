import { MinifiedProfile } from "../../profiles/types";
import { FlashCard, UUID } from "../types";

export interface SectionData {
  title: string;
  description: string;
  id: string;
}

interface AbstractSection {
  data: SectionData;
  id: string;
  order_num: number;

  // This property isn't serialized directly, but rather from `getDeckSectionsPercentComplete`,
  // and is then combined with the Section
  percent_complete?: number;
}

export interface MainSection extends AbstractSection {
  deck: number;
  sub_sections: SubSection[];
}

export interface SubSection extends AbstractSection {
  main_section: number;
}

export interface SharedDeck {
  title: string;
  description: string;
  view_access: 'PUBLIC' | 'FRIENDS' | 'STUDENT';
  edit_access: 'PERSONAL' | 'FRIENDS' | 'PUBLIC' | 'STUDENT';
  owners: MinifiedProfile[];
  snapshots: SnapShot[];

  has_view_access?: boolean;
  has_edit_access?: boolean;
  is_owner?: boolean;

  id: number;
}

export interface SnapShot {
  author: MinifiedProfile;
  main_sections: MainSection[];
  message: string;
  timestamp: string;
  parent: UUID;
  id: UUID;
}

export interface SubmittedChanges {
  author: MinifiedProfile;
  message: string;
  pending_mainsectionactions: MainSectionAction[];
  pending_subsectionactions: SubSectionAction[];
  pending_flashcardactions: FlashCardAction[];
  id: UUID;
}

interface AbstractAction {
  deck_id: number;
  snapshot_id: number;
  action: 'CREATE' | 'EDIT' | 'DELETE' | 'REARRANGE';
}

export interface MainSectionAction extends AbstractAction {
  main_section: MainSection;
  universal_main_section_id: string;
  live_counterpart?: MainSectionAction;
}

export interface SubSectionAction extends AbstractAction {
  sub_section: SubSection;
  universal_sub_section_id: string;
  live_counterpart?: SubSectionAction;
}

export interface FlashCardAction extends AbstractAction {
  flashcard: FlashCard;
  universal_flashcard_id: string;
  live_counterpart?: FlashCardAction;
}
