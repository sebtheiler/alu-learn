import RenderFlashcard from "../RenderFlashcard";
import { Flashcard } from "@/types";
import { useState } from "react";

interface FlashcardListProps {
  flashcards: Flashcard[];
}

/**
 * Displays a list of flashcards
 * @note Changing the `flashcards` prop will not update the list
 */
export default function FlashcardList({ flashcards }: FlashcardListProps) {
  // We can't directly modify the props, so we duplicate them in a state
  const [_flashcards, _setFlashcards] = useState(flashcards);
  console.log({ flashcards });

  const deleteHandler = (flashcard: Flashcard) => {
    _setFlashcards(_flashcards.filter((f) => f.id !== flashcard.id));
  };

  return (
    <div>
      {_flashcards.map((flashcard) => (
        <RenderFlashcard
          flashcard={flashcard}
          className="mb-3"
          key={flashcard.id}
          handlers={{
            deleteHandler,
          }}
        />
      ))}
    </div>
  );
}
