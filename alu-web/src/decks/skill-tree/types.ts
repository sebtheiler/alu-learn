interface AbstractSection {
  title?: string;
  tag: string;
  id: number;
  percent_complete: number;
}

export interface MainSection extends AbstractSection {
  deck: number;
  children: SubSection[];
}

export interface SubSection extends AbstractSection {
  parent: number;
}
