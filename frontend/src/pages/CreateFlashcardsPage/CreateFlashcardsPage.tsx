import styles from "./CreateFlashcardsPage.module.scss";
import AsyncButton from "@/atoms/AsyncButton";
import Select from "@/atoms/Select";
import TextInput from "@/atoms/TextInput";
import CreateFlashcard from "@/graphql/CreateFlashcard";
import SEO from "@/helpers/SEO";
import blankLexicalElement from "@/helpers/blankLexicalElement";
import classNames from "@/helpers/classNames";
import LexicalEditor from "@/lexicalEditor/LexicalEditor";
import type {
  Course,
  FlashcardType,
  Mutation,
  MutationCreateFlashcardArgs,
} from "@/types";
import { useMutation } from "@apollo/client";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { EditorState } from "lexical";
import Link from "next/link";
import { useRef, useState } from "react";

interface FlashcardCreateHistory {
  previewText: string;
  flashcardId: string;
}

export interface CreateFlashcardsPageProps {
  course: Course;
  courseSectionSlug: string;
  subSectionSlug: string;
}

/**
 * Renders a page to create flashcards
 */
export default function CreateFlashcardsPage({
  course,
  courseSectionSlug,
  subSectionSlug,
}: CreateFlashcardsPageProps) {
  const [frontEditorState, setFrontEditorState] = useState<EditorState>();
  const clearFrontEditorRef = useRef<HTMLButtonElement | null>(null);

  const [backEditorState, setBackEditorState] = useState<EditorState>();
  const clearBackEditorRef = useRef<HTMLButtonElement | null>(null);

  const [createFlashcard] = useMutation<
    { createFlashcard: Mutation["createFlashcard"] },
    MutationCreateFlashcardArgs
  >(CreateFlashcard);

  const [flashcardType, setFlashcardType] = useState<FlashcardType>(
    "NORMAL" as FlashcardType
  );
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");

  const [history, setHistory] = useState<FlashcardCreateHistory[]>([]);

  const createFlashcardHandler = async () => {
    if (
      flashcardType !== "CLOZE" &&
      (JSON.stringify(frontEditorState) ===
        JSON.stringify(blankLexicalElement) ||
        JSON.stringify(backEditorState) === JSON.stringify(blankLexicalElement))
    ) {
      setError("BLANK_SIDE");
      return;
    }
    setError("");

    const { data } = await createFlashcard({
      variables: {
        fields: JSON.stringify([frontEditorState, backEditorState]),
        tags,
        flashcardType,
        courseId: course.id as string,
        courseSectionSlug,
        subSectionSlug,
      },
    });

    // Add to the history of flashcards created
    const flashcard = data?.createFlashcard;
    if (data && flashcard) {
      const { id } = flashcard;

      const previewText = await new Promise<string | undefined>((resolve) =>
        frontEditorState?.read(() => {
          resolve(frontEditorState?._nodeMap.get("root")?.getTextContent());
        })
      );
      setHistory([
        ...history,
        {
          previewText: previewText?.slice(0, 50) ?? "",
          flashcardId: id as string,
        },
      ]);
    }

    clearBackEditorRef.current?.click();
    clearFrontEditorRef.current?.click();
  };

  return (
    <>
      <SEO
        title="Create Flashcards"
        path={`course/${course?.id}/add-flashcards/${courseSectionSlug}/${subSectionSlug}`}
        description=""
      />
      <div className="mt-28">
        <h1 className="text-center font-bold text-4xl">Add Flashcards</h1>
        <p className="text-center text-gray-700">
          Use &quot;Tab&quot; to cycle through sides, and use enter to press
          create once it is selected
        </p>
        <div className="absolute left-4 top-24">
          <Link
            href={{
              pathname: `/course/[courseId]/flashcards/[courseSectionSlug]/[subSectionSlug]`,
              query: { courseId: course.id, courseSectionSlug, subSectionSlug },
            }}
          >
            <a>
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="2x"
                className="text-gray-600"
              />
            </a>
          </Link>
        </div>
        <div className="grid grid-cols-12">
          <div className="md:col-start-4 col-span-12 md:col-span-6 mx-10 md:mx-5">
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
                overrideTab
                autoFocus
              />
            </div>
            <div className="mt-5">
              <h3 className="font-bold text-xl">
                {flashcardType === "NORMAL" && "Back"}
                {flashcardType === "CLOZE" && "Extra Information (optional)"}
              </h3>
              <LexicalEditor
                namespace="backEditor"
                className={styles.editorMinHeight}
                verticalOffset={112}
                clearEditorRef={clearBackEditorRef}
                onChange={(state) => setBackEditorState(state)}
                overrideTab
              />
            </div>
            <div className="mt-3">
              {error === "BLANK_SIDE" && (
                <p className="text-red-700 text-center mb-3">
                  You cannot have a flashcard with blank sides
                </p>
              )}
              <AsyncButton onClick={createFlashcardHandler} block>
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
          <div className="md:col-start-10 col-span-12 md:col-span-3 mx-5 md:mx-3 mb-3">
            <h3 className="font-bold text-xl">Select Sub-section</h3>
            {course.courseSections?.map((courseSection, i) => (
              <div key={i}>
                <Link
                  href={`/course/${course.id}/add-flashcards/${courseSection?.slug}`}
                >
                  <a>
                    <div
                      className={classNames(
                        `bg-alu-light-gray hover:bg-alu-light-gray-darker border-2
                        px-3 py-2 max-w-xs rounded-full mt-2`,
                        courseSectionSlug === courseSection?.slug &&
                          "bg-alu-light-gray-darker"
                      )}
                    >
                      {courseSection?.title}
                    </div>
                  </a>
                </Link>
                {courseSection?.subSections?.map((subSection, j) => (
                  <Link
                    href={`/course/${course.id}/add-flashcards/${courseSection.slug}/${subSection?.slug}`}
                    key={j}
                  >
                    <a>
                      <div
                        className={classNames(
                          `bg-alu-light-gray hover:bg-alu-light-gray-darker border-2
                          px-3 py-2 max-w-xs rounded-full ml-5 my-1`,
                          courseSectionSlug === courseSection?.slug &&
                            subSectionSlug === subSection?.slug &&
                            "bg-alu-light-gray-darker"
                        )}
                        key={j}
                      >
                        {subSection?.title}
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            ))}
            {/* {history.length > 0 && (
              <div>
                <hr className="my-5 max-w-xs" />
                <Select
                  options={[
                    { value: "", label: "Recent Flashcards" },
                    ...history.map((hist) => ({
                      value: hist.flashcardId,
                      label: hist.previewText,
                    })),
                  ]}
                  onChange={(flashcardId) =>
                    flashcardId && console.log(flashcardId)
                  }
                  className="max-w-xs mb-5"
                  id="history"
                />
              </div>
            )} */}
          </div>
        </div>
      </div>
    </>
  );
}
