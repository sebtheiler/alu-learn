import RenderFlashcard from "../RenderFlashcard";
import Ad from "@/components/Ad";
import MoveFlashcard from "@/graphql/MoveFlashcard";
import type { Flashcard, Mutation, MutationMoveFlashcardArgs } from "@/types";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useMemo, useState, Fragment } from "react";
import { ReactSortable } from "react-sortablejs";
import type { SortableEvent } from "react-sortablejs";

type FlashcardWithId = Flashcard & { id: string };

interface FlashcardListProps {
  flashcards: FlashcardWithId[];
}

/**
 * Displays a list of flashcards
 * @note Changing the `flashcards` prop will not update the list
 */
export default function FlashcardList({ flashcards }: FlashcardListProps) {
  // We can't directly modify the props, so we duplicate them in a state
  const [_flashcards, _setFlashcards] = useState(flashcards);
  const [hidden, setHidden] = useState<boolean[]>(() =>
    Array(flashcards.length).fill(false)
  );
  const [moveFlashcard] = useMutation<
    { moveFlashcard: Mutation["moveFlashcard"] },
    MutationMoveFlashcardArgs
  >(MoveFlashcard);

  const router = useRouter();
  const { rearrangeable, courseId, subSectionSlug } = useMemo(() => {
    const { subSectionSlug, courseId } = router.query;
    return { rearrangeable: !!subSectionSlug, courseId, subSectionSlug };
  }, [router]);

  const onDragEnd = (evt: SortableEvent) => {
    if (evt.oldIndex === undefined || evt.newIndex === undefined) return;

    moveFlashcard({
      variables: {
        courseId: courseId as string,
        subSectionSlug: subSectionSlug as string,
        from: evt.oldIndex,
        to: evt.newIndex,
      },
    });
  };

  const renderedFlashcards = useMemo(() => {
    const deleteHandler = (flashcard: FlashcardWithId) => {
      _setFlashcards(_flashcards.filter((f) => f.id !== flashcard.id));
    };

    return _flashcards.map((flashcard, i) => (
      <Fragment key={flashcard.id}>
        {i > 0 && i % 25 === 0 && <Ad adType="FLASHCARD_LIST_MIDDLE" />}
        <RenderFlashcard
          flashcard={flashcard}
          className="mb-3"
          handlers={{
            deleteHandler,
            setHideAllHandler: (val) =>
              setHidden(Array(_flashcards.length).fill(val)),
          }}
          hidden={hidden[i]}
          setHidden={(val) =>
            setHidden([...hidden.slice(0, i), val, ...hidden.slice(i + 1)])
          }
          rearrangeable={rearrangeable}
        />
      </Fragment>
    ));
  }, [_flashcards, hidden, rearrangeable]);

  return (
    <div>
      {rearrangeable ? (
        <ReactSortable
          list={_flashcards}
          setList={_setFlashcards}
          handle=".flashcard-drag-handle"
          onEnd={onDragEnd}
        >
          {renderedFlashcards}
        </ReactSortable>
      ) : (
        renderedFlashcards
      )}
      <footer>
        <Ad adType="FLASHCARD_LIST_BOTTOM" />
      </footer>
    </div>
  );
}
