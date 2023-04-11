import Select from "alu-ui/src/Select";
import AsyncButton from "alu-ui/src/AsyncButton";
import TextInput from "alu-ui/src/TextInput";
import LexicalEditor from "lexical-editor/src/LexicalEditor";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isParagraphNode,
} from "lexical";
import type {
  LexicalEditor as LexicalEditorClass,
  ParagraphNode,
} from "lexical";
import { useCallback, useRef, useState } from "react";
import type { EditorState } from "lexical";
import styles from "./FlashcardCreator.module.scss";
import type {
  FlashcardType,
  Mutation,
  MutationAutocompleteFlashcardArgs,
} from "@/types";
import { TWO_SIDED_FLASHCARDS, AUTO_FLASHCARD_LIMITS } from "@/globals";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoltLightning } from "@fortawesome/free-solid-svg-icons";
import { useMutation } from "@apollo/client";
import AutocompleteFlashcard from "graphql-operations/operations/AutocompleteFlashcard";
import flattenLexical from "lexical-editor/src/helpers/flattenLexical";
import useMeStore from "@/stores/meStore";
import classNames from "helpers-lib/src/classNames";
import Link from "next/link";
import Tooltip from "alu-ui/src/Tooltip";

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
  const backEditorRef = useRef<LexicalEditorClass | null>(null);

  const me = useMeStore((store) => store.me);
  const exceededAutoFlashcardsLimit =
    (me?.numAutoFlashcardsGenerated ?? 0) >=
    AUTO_FLASHCARD_LIMITS[me?.isPro ? "pro" : "regular"];

  const [autocompleteApi, { loading: autocompleteLoading }] = useMutation<
    { autocompleteFlashcard: Mutation["autocompleteFlashcard"] },
    MutationAutocompleteFlashcardArgs
  >(AutocompleteFlashcard);
  const autocomplete = useCallback(async () => {
    const front = flattenLexical(JSON.stringify(frontEditorState)).trim();
    if (
      !frontEditorState ||
      front.length === 0 ||
      !TWO_SIDED_FLASHCARDS.includes(flashcardType) ||
      autocompleteLoading
    )
      return;
    const { data } = await autocompleteApi({
      variables: {
        front,
      },
    });

    const completion = data?.autocompleteFlashcard;
    if (!completion) return;

    backEditorRef.current?.update(() => {
      const root = $getRoot();
      const textNode = $createTextNode(completion);
      const lastChild = root.getLastChild();
      let paragraphNode: ParagraphNode | undefined;
      if ($isParagraphNode(lastChild) && lastChild.getTextContentSize() === 0) {
        paragraphNode = lastChild;
      } else {
        paragraphNode = $createParagraphNode();
      }
      paragraphNode.append(textNode);
      root.append(paragraphNode);
    });
  }, [autocompleteApi, frontEditorState, flashcardType, autocompleteLoading]);

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
          <h3 className="font-bold text-xl inline">Back</h3>
          <div className="ml-5 mb-2 inline">
            <Tooltip
              tooltip={
                exceededAutoFlashcardsLimit && (
                  <span>
                    You have exceeded the limit of{" "}
                    {AUTO_FLASHCARD_LIMITS.regular} automatic flashcards
                    created.
                    {me?.isPro === false && (
                      <>
                        {" "}
                        Upgrade to{" "}
                        <Link href="/pro" className="text-blue-500">
                          pro
                        </Link>{" "}
                        to increase your limit to {AUTO_FLASHCARD_LIMITS.pro}.
                      </>
                    )}
                  </span>
                )
              }
              className="w-48"
            >
              <button
                className={classNames(
                  "inline rounded-full px-2 py-1 -translate-y-[2px]",
                  exceededAutoFlashcardsLimit
                    ? "hover:cursor-not-allowed bg-gray-200/80"
                    : "bg-alu-primary-purple/10 hover:bg-alu-primary-purple/20"
                )}
                onClick={autocomplete}
                tabIndex={-1}
                disabled={exceededAutoFlashcardsLimit}
              >
                <FontAwesomeIcon
                  icon={faBoltLightning}
                  className="text-yellow-400 mr-1"
                  spin={autocompleteLoading}
                />
                Autocomplete
              </button>
            </Tooltip>
          </div>

          <LexicalEditor
            namespace="backEditor"
            className={styles.editorMinHeight}
            verticalOffset={verticalOffset}
            clearEditorRef={clearBackEditorRef}
            editorRef={backEditorRef}
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
