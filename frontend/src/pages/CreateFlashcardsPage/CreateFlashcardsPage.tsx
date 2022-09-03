import styles from "./CreateFlashcardsPage.module.scss";
import AsyncButton from "@/atoms/AsyncButton";
import Select from "@/atoms/Select";
import TextInput from "@/atoms/TextInput";
import { createFullEditor } from "@/editor/FullEditable";
import CreateFlashcard from "@/graphql/CreateFlashcard";
import SEO from "@/helpers/SEO";
import blankSlateElement from "@/helpers/blankSlateElement";
import classNames from "@/helpers/classNames";
import clearEditor from "@/helpers/clearEditor";
import LexicalEditor from "@/lexicalEditor/LexicalEditor";
import type { Course, FlashcardType } from "@/types";
import { useMutation } from "@apollo/client";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { ReactEditor } from "slate-react";

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
  const frontEditor = useMemo<ReactEditor>(createFullEditor, []);
  const [frontValue, setFrontValue] = useState(blankSlateElement);

  const backEditor = useMemo<ReactEditor>(createFullEditor, []);
  const [backValue, setBackValue] = useState(blankSlateElement);

  const [createFlashcard] = useMutation(CreateFlashcard);

  const [flashcardType, setFlashcardType] = useState<FlashcardType>(
    "NORMAL" as FlashcardType
  );
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");

  const frontEditorWrappingRef = useRef<HTMLDivElement | null>(null);

  const createFlashcardHandler = async () => {
    if (
      flashcardType !== "CLOZE" &&
      [frontValue, backValue].includes(blankSlateElement)
    ) {
      setError("BLANK_SIDE");
      return;
    }
    setError("");

    await createFlashcard({
      variables: {
        fields: { value: [frontValue, backValue] },
        tags,
        flashcardType,
        courseId: course.id,
        courseSectionSlug,
        subSectionSlug,
      },
    });

    clearEditor(frontEditor);
    clearEditor(backEditor);
    document.getElementById("frontEditor")?.focus();
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
            <div className="mt-3" ref={frontEditorWrappingRef}>
              <h3 className="font-bold text-xl">
                {flashcardType === "NORMAL" && "Front"}
                {flashcardType === "CLOZE" &&
                  "Text (use the cloze deletion option to hide text)"}
              </h3>
              <LexicalEditor
                namespace="frontEditor"
                className={styles.editorMinHeight}
                verticalOffset={112} // mt-28
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
          </div>
        </div>
      </div>
    </>
  );
}
