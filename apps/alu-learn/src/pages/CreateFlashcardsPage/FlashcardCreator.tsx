import Select from "alu-ui/src/Select";
import AsyncButton from "alu-ui/src/AsyncButton";
import TextInput from "alu-ui/src/TextInput";
import LexicalEditor from "lexical-editor/src/LexicalEditor";
import { useRef, useState } from "react";
import type { EditorState } from "lexical";
import styles from "./FlashcardCreator.module.scss";
import type { FlashcardType } from "@/types";
import { TWO_SIDED_FLASHCARDS } from "@/globals";

interface FlashcardCreatorProps {
  /**
   * Called when the user presses "Create Flashcard".
   * Implementation should run the API call to create the flashcard
   */
  createFlashcardCallback({
    frontEditorState,
    backEditorState,
    flashcardType,
    tags,
  }: {
    /**
     * Value of the front of the flashcard
     */
    frontEditorState: EditorState;
    /**
     * Value of the back of the flashcard
     */
    backEditorState: EditorState | undefined;
    /**
     * Type of flashcard to be created
     */
    flashcardType: FlashcardType;
    /**
     * The flashcard's tags
     */
    tags: string;
  }): Promise<void>;
  isPro: boolean | null;
  error: string | null;
  /**
   * Passed to Lexical editor
   * @default 0
   */
  verticalOffset?: number;
}

/**
 * Interface for creating flashcards
 */
export default function FlashcardCreator({
  createFlashcardCallback,
  isPro,
  error,
  verticalOffset = 0,
}: FlashcardCreatorProps) {
  const [frontEditorState, setFrontEditorState] = useState<EditorState>();
  const [backEditorState, setBackEditorState] = useState<EditorState>();
  const [flashcardType, setFlashcardType] = useState<FlashcardType>(
    "NORMAL" as FlashcardType
  );
  const [tags, setTags] = useState("");

  // Clear the front/back after the flashcard is created
  const clearFrontEditorRef = useRef<HTMLButtonElement | null>(null);
  const clearBackEditorRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div>
      <div className="mt-2">
        <Select
          label="Flashcard Type"
          options={[
            { value: "NORMAL", label: "Normal" },
            { value: "CLOZE", label: "Cloze (fill in the blanks)" },
          ]}
          onChange={(type) => setFlashcardType(type as FlashcardType)}
          id="flashcardType"
        />
      </div>
      <div className="mt-3">
        <h3 className="font-bold text-xl">
          {flashcardType === "NORMAL" && "Front"}
          {flashcardType === "CLOZE" &&
            "Text (use the cloze deletion option to hide text)"}
        </h3>
        <LexicalEditor
          namespace="frontEditor"
          className={styles.editorMinHeight}
          verticalOffset={112} // mt-28
          clearEditorRef={clearFrontEditorRef}
          onChange={(state) => setFrontEditorState(state)}
          includeCloze={flashcardType === "CLOZE"}
          isPro={isPro ?? false}
          overrideTab
          autoFocus
        />
      </div>
      {TWO_SIDED_FLASHCARDS.includes(flashcardType) && (
        <div className="mt-5">
          <h3 className="font-bold text-xl">Back</h3>
          <LexicalEditor
            namespace="backEditor"
            className={styles.editorMinHeight}
            verticalOffset={verticalOffset}
            clearEditorRef={clearBackEditorRef}
            onChange={(state) => setBackEditorState(state)}
            isPro={isPro ?? false}
            overrideTab
          />
        </div>
      )}
      <div className="mt-3">
        {error === "BLANK_SIDE" && (
          <p className="text-red-700 text-center mb-3">
            You cannot have a flashcard with blank sides
          </p>
        )}
        <AsyncButton
          onClick={async () => {
            if (
              frontEditorState &&
              (TWO_SIDED_FLASHCARDS.includes(flashcardType)
                ? backEditorState
                : true)
            ) {
              // Create flashcard
              await createFlashcardCallback({
                frontEditorState,
                backEditorState,
                flashcardType,
                tags,
              });

              // Clear the front and back
              clearBackEditorRef.current?.click();
              clearFrontEditorRef.current?.click();
            } else {
              throw new Error("Cannot create flashcard from empty states");
            }
          }}
          block
        >
          Create
        </AsyncButton>
      </div>
      <div className="my-3">
        <TextInput
          label="Tags (optional, separate with commas)"
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
    </div>
  );
}
