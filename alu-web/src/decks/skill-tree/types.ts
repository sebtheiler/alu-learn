interface AbstractSection {
  title?: string;
  tag: string;
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
