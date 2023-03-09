import MoveSubSectionModal from "./MoveSubSectionModal";
import IconTooltip from "alu-ui/src/IconTooltip";
import LexicalEditor from "lexical-editor/src/LexicalEditor";
import DeleteFlashcard from "graphql-operations/operations/DeleteFlashcard";
import UpdateFlashcard from "graphql-operations/operations/UpdateFlashcard";
import classNames from "helpers-lib/src/classNames";
import { useDebounce } from "helpers-lib/src/hooks/useDebounce";
import type {
  Flashcard,
  Mutation,
  MutationDeleteFlashcardArgs,
  MutationUpdateFlashcardArgs,
} from "@/types";
import { useMutation } from "@apollo/client";
import {
  faCheck,
  faCog,
  faEye,
  faEyeSlash,
  faGripVertical,
  faPencil,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useId, useMemo, useState } from "react";
import useProStore from "@/stores/proStore";

interface RenderFlashcardProps {
  /**
   * Flashcard to display
   */
  flashcard: Flashcard;
  /**
   * Additional classes to apply to the flashcard
   */
  className?: string;
  /**
   * Functions to be called at various events
   */
  handlers?: {
    /**
     * Called when the trash icon is pressed and the flashcard is deleted
     * @param flashcard Flashcard to be deleted
     */
    deleteHandler?(flashcard: Flashcard): void;
    /**
     * Called when the double clicking "hide" to hide all flashcards
     */
    setHideAllHandler?(hidden: boolean): void;
  };
  /**
   * Should the flashcard's back be hidden?
   */
  hidden?: boolean;
  setHidden?: React.Dispatch<boolean>;
  /**
   * Display the "gripper" to rearrange a flashcard?
   */
  rearrangeable?: boolean;
  /**
   * Can the current user edit the flashcard?
   */
  canEdit?: boolean;
}

/**
 * Displays a flashcard
 */
export default function RenderFlashcard({
  flashcard,
  className,
  handlers,
  hidden,
  setHidden,
  rearrangeable,
  canEdit,
}: RenderFlashcardProps) {
  const [editMode, setEditMode] = useState(false);
  const [fields, setFields] = useState(JSON.parse(flashcard.fields as string));
  const [moveSubSectionModalOpen, setMoveSubSectionModalOpen] = useState(false);

  const isPro = useProStore((store) => store.isPro);

  const [frontState, setFrontState] = useState(fields[0]);
  const [backState, setBackState] = useState(fields[1]);
  const states = useMemo(
    () => [frontState, backState],
    [frontState, backState]
  );
  const setStates = [setFrontState, setBackState];

  const componentId = useId();
  const [updateFlashcard] = useMutation<
    { updateFlashcard: Mutation["updateFlashcard"] },
    MutationUpdateFlashcardArgs
  >(UpdateFlashcard);
  const [deleteFlashcard] = useMutation<
    { deleteFlashcard: Mutation["deleteFlashcard"] },
    MutationDeleteFlashcardArgs
  >(DeleteFlashcard);

  // Autosave the flashcard when editing
  const debouncedStates = useDebounce(states, 500);
  useEffect(() => {
    if (
      editMode &&
      JSON.stringify(fields) !== JSON.stringify(states) &&
      JSON.stringify(debouncedStates) === JSON.stringify(states)
    ) {
      updateFlashcard({
        variables: {
          flashcardId: flashcard.id as string,
          fields: JSON.stringify(states),
        },
      });
    }
  }, [
    fields,
    debouncedStates,
    states,
    editMode,
    updateFlashcard,
    flashcard.id,
  ]);

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
        "bg-alu-light-gray border-2 border-alu-mid-gray rounded-xl min-h-[10rem] max-w-4xl mx-auto relative",
        className
      )}
    >
      {canEdit && (
        <div className="absolute mt-2 w-1/2">
          {rearrangeable && (
            <span title="Drag to rearrange">
              <FontAwesomeIcon
                icon={faGripVertical}
                // `.flashcard-drag-handle` is the handle class defined in `FlashcardList.tsx`
                className="text-gray-400 mx-3 hover:cursor-grab flashcard-drag-handle"
              />
            </span>
          )}
          <IconTooltip
            faIcon={editMode ? faCheck : faPencil}
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
      )}
      {setHidden && (
        <div className="absolute mt-2 w-1/2 translate-x-full text-right">
          {canEdit && (
            <>
              <IconTooltip
                faIcon={faCog}
                tooltip="Move Sub-section"
                tooltipProps={{ className: "w-36" }}
                className="mr-2"
                onClick={() => setMoveSubSectionModalOpen(true)}
              />
              <MoveSubSectionModal
                open={moveSubSectionModalOpen}
                close={() => setMoveSubSectionModalOpen(false)}
                courseId={flashcard.courseId as string}
                flashcardId={flashcard.id as string}
              />
            </>
          )}
          <IconTooltip
            faIcon={hidden ? faEye : faEyeSlash}
            tooltipProps={{ className: "w-40" }}
            tooltip={
              hidden
                ? "Show (double click to show all)"
                : "Hide (double click to hide all)"
            }
            className="text-right mr-2"
            onClick={() => setHidden(!hidden)}
            onDoubleClick={() =>
              handlers?.setHideAllHandler && handlers.setHideAllHandler(!hidden)
            }
          />
        </div>
      )}
      <div className="w-full h-full flex min-h-[10rem]">
        {fields
          .filter((field) => !!field)
          .map((field: any, i: number) => (
            <div
              key={i}
              className="flex w-full justify-center items-center border-r-4
                     border-r-alu-mid-gray last:border-none py-4 px-5"
            >
              {hidden && i > 0 ? (
                <span className="font-bold text-4xl">?</span>
              ) : (
                <LexicalEditor
                  namespace={`${componentId}-field-${i}`}
                  editorState={JSON.stringify(field)}
                  onChange={(state) => setStates[i](state)}
                  editable={editMode}
                  isPro={isPro ?? false}
                />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
