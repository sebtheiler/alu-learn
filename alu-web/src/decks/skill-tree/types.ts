import { MinifiedProfile } from "../../profiles/types";

interface AbstractSection {
  title: string;
  description: string;
  id: number;

  // This property isn't serialized directly, but rather from `getDeckSectionsPercentComplete`,
  // and is then combined with the Section
  percent_complete?: number;
}

export interface MainSection extends AbstractSection {
  deck: number;
  children: SubSection[];
}

export interface SubSection extends AbstractSection {
  parent: number;
}

export interface SharedDeck {
  title: string;
  description: string;
  view_access: 'PUBLIC' | 'FRIENDS' | 'STUDENT';
  edit_access: 'PERSONAL' | 'FRIENDS' | 'PUBLIC' | 'STUDENT';
  owners: MinifiedProfile[];
  id: number;
}
