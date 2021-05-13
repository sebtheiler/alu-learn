import React, { useState } from 'react';
import { FlashCard, LearningStatus, SSMInterface } from '../types';
import { StudyLogicComponent } from '../study/components';

interface CramGameProps {
  initialFlashcards: FlashCard[];
}
export function CramGame(props: CramGameProps) {
  // We need the useState so that it is compatable with `StudyLogicComponent`
  const { initialFlashcards } = props;
  const [flashcards, setFlashcards] = useState(
    initialFlashcards.map(flashcard => ({
      ...flashcard,
      learning_status: 'UNSEEN' as LearningStatus,
      steps_index: 0,
    } as FlashCard))
  );
  const SSM = {
    scheduling_algorithm: 'CRAM',
    shuffle_unseen_cards: true,
    daily_new_card_limit: 9999,
    daily_seen_card_limit: 9999,
    review_ahead_minutes: 9999,
    difficulty: 'HARD',
    id: -1,
  } as SSMInterface;

  return (
    <StudyLogicComponent
      SSM={SSM}
      flashcards={flashcards}
      setFlashcards={setFlashcards}
      updateReviewInfo={false}
    />
  );
}
