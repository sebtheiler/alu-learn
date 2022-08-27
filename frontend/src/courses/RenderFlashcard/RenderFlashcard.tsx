import IconTooltip from "@/components/IconTooltip";
import { createFullEditor } from "@/editor/FullEditable";
import RenderEditor from "@/editor/RenderEditor";
import RenderRichText from "@/editor/RenderRichText";
import type { ExtendedSlateElement } from "@/editor/types";
import UpdateFlashcard from "@/graphql/UpdateFlashcard";
import classNames from "@/helpers/classNames";
import { Flashcard } from "@/types";
import { useMutation } from "@apollo/client";
import { faEye, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useMemo, useState } from "react";
import type { ReactEditor } from "slate-react";

interface RenderFlashcardProps {
  /**
   * Flashcard to display
   */
  flashcard: Flashcard;
  /**
   * Additional classes to apply to the flashcard
   */
  className: string;
}

/**
 * Displays a flashcard
 */
export default function RenderFlashcard({
  flashcard,
  className,
}: RenderFlashcardProps) {
  const [editMode, setEditMode] = useState(false);
  const [fields, setFields] = useState<ExtendedSlateElement[][]>(
    flashcard.fields.value
  );
  const [updateFlashcard] = useMutation(UpdateFlashcard);

  const frontEditor = useMemo<ReactEditor>(createFullEditor, []);
  const backEditor = useMemo<ReactEditor>(createFullEditor, []);
  const editors = [frontEditor, backEditor];

  const [frontValue, setFrontValue] = useState(fields[0]);
  const [backValue, setBackValue] = useState(fields[1]);
  const values = [frontValue, backValue];
  const setValues = [setFrontValue, setBackValue];

  const editModeHandler = async () => {
    // If there has been some change, save it in the DB
    if (JSON.stringify(fields) !== JSON.stringify(values)) {
      setFields(values);
      await updateFlashcard({
        variables: { flashcardId: flashcard.id, fields: { value: values } },
      });
    }

    setEditMode(!editMode);
  };

  const deleteFlashcardHandler = () => {
    console.log("deleting...");
  };

  return (
    <div
      className={classNames(
        "bg-alu-light-gray border-2 border-alu-mid-gray rounded-xl min-h-[10rem]",
        className
      )}
    >
      <IconTooltip
        faIcon={editMode ? faEye : faPencil}
        tooltip={editMode ? "Save and View" : "Edit"}
        className="absolute mt-2 ml-2"
        tooltipProps={{ className: classNames("ml-4", editMode && "w-28") }}
        onClick={editModeHandler}
      />
      <IconTooltip
        faIcon={faTrash}
        tooltip="Delete"
        className="absolute mt-2 ml-8"
        tooltipProps={{ className: "ml-10" }}
        onClick={deleteFlashcardHandler}
      />
      <div className="w-full h-full flex min-h-[10rem]">
        {fields.map((field: ExtendedSlateElement[], i: number) => (
          <div
            key={i}
            className="flex w-1/2 justify-center items-center border-r-4
                     border-r-alu-mid-gray last:border-none py-4 px-5"
          >
            {editMode ? (
              <RenderEditor
                editor={editors[i]}
                value={values[i]}
                setValue={setValues[i]}
                className="w-full"
              />
            ) : (
              <RenderRichText text={field} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
