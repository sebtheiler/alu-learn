import IconTooltip from "@/components/IconTooltip";
import DeleteFlashcard from "@/graphql/DeleteFlashcard";
import UpdateFlashcard from "@/graphql/UpdateFlashcard";
import classNames from "@/helpers/classNames";
import LexicalEditor from "@/lexicalEditor/LexicalEditor";
import type {
  Flashcard,
  Mutation,
  MutationDeleteFlashcardArgs,
  MutationUpdateFlashcardArgs,
} from "@/types";
import { useMutation } from "@apollo/client";
import { faEye, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useId, useState } from "react";

interface RenderFlashcardProps {
  /**
   * Flashcard to display
   */
  flashcard: Flashcard;
  /**
   * Additional classes to apply to the flashcard
   */
  className: string;
  /**
   *
   */
  handlers?: {
    deleteHandler?(flashcard: Flashcard): void;
  };
}

/**
 * Displays a flashcard
 */
export default function RenderFlashcard({
  flashcard,
  className,
  handlers,
}: RenderFlashcardProps) {
  const [editMode, setEditMode] = useState(false);
  const [fields, setFields] = useState(JSON.parse(flashcard.fields as string));

  const [frontState, setFrontState] = useState(fields[0]);
  const [backState, setBackState] = useState(fields[1]);
  const states = [frontState, backState];
  const setStates = [setFrontState, setBackState];

  const componentId = useId();
  const [updateFlashcard] = useMutation<
    { updateFlashcard: Mutation["updateFlashcard"] },
    MutationUpdateFlashcardArgs
  >(UpdateFlashcard);
  const [deleteFlashcard] = useMutation<
    { deleteFlashcarc: Mutation["deleteFlashcard"] },
    MutationDeleteFlashcardArgs
  >(DeleteFlashcard);

  const editModeHandler = async () => {
    // If there has been some change, save it in the DB
    if (JSON.stringify(fields) !== JSON.stringify(states)) {
      setFields(states);
      await updateFlashcard({
        variables: {
          flashcardId: flashcard.id as string,
          fields: JSON.stringify(states),
        },
      });
    }

    setEditMode(!editMode);
  };

  const deleteFlashcardHandler = async () => {
    await deleteFlashcard({
      variables: { flashcardId: flashcard.id as string },
    });
    handlers?.deleteHandler && handlers.deleteHandler(flashcard);
  };

  return (
    <div
      className={classNames(
        "bg-alu-light-gray border-2 border-alu-mid-gray rounded-xl min-h-[10rem]",
        className
      )}
    >
      <div className="absolute mt-2">
        <IconTooltip
          faIcon={editMode ? faEye : faPencil}
          tooltip={editMode ? "Save and View" : "Edit"}
          className="ml-2"
          tooltipProps={{ className: classNames(editMode && "w-28") }}
          onClick={editModeHandler}
        />
        <IconTooltip
          faIcon={faTrash}
          tooltip="Delete"
          className="ml-5"
          onClick={deleteFlashcardHandler}
        />
      </div>
      <div className="w-full h-full flex min-h-[10rem]">
        {fields.map((field: any, i: number) => (
          <div
            key={i}
            className="flex w-1/2 justify-center items-center border-r-4
                     border-r-alu-mid-gray last:border-none py-4 px-5"
          >
            <LexicalEditor
              namespace={`${componentId}-field-${i}`}
              editorState={JSON.stringify(field)}
              onChange={(state) => setStates[i](state)}
              readOnly={!editMode}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
