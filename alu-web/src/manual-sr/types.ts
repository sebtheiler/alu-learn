import { Node } from 'slate';

export interface ManualSRTask {
  title: string;
  description: Node[];
  learning_status: 'UNSEEN' | 'LEARNING' | 'LEARNED' | 'RELEARNING';
  steps_index: number;
  ease: number;
  next_review: string | Date;
  interval: number;
  id: number;
}