import { TWO_SIDED_FLASHCARDS } from "@/globals";
import CreateFlashcard from "graphql-operations/operations/CreateFlashcard";
import SEO from "@/helpers/SEO";
import classNames from "helpers-lib/src/classNames";
import flattenLexical from "lexical-editor/src/helpers/flattenLexical";
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
import { useState } from "react";
import useProStore from "@/stores/proStore";
import FlashcardCreator from "./FlashcardCreator";

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
  const [createFlashcard] = useMutation<
    { createFlashcard: Mutation["createFlashcard"] },
    MutationCreateFlashcardArgs
  >(CreateFlashcard);
  const [error, setError] = useState("");

  const [history, setHistory] = useState<FlashcardCreateHistory[]>([]);

  const isPro = useProStore((store) => store.isPro);

  const createFlashcardHandler = async ({
    frontEditorState,
    backEditorState,
    flashcardType,
    tags,
  }: {
    frontEditorState: EditorState;
    backEditorState: EditorState | undefined;
    flashcardType: FlashcardType;
    tags: string;
  }) => {
    if (
      flattenLexical(JSON.stringify(frontEditorState))?.length === 0 ||
      (TWO_SIDED_FLASHCARDS.includes(flashcardType) &&
        flattenLexical(JSON.stringify(backEditorState))?.length === 0)
    ) {
      setError("BLANK_SIDE");
      return;
    }
    setError("");

    let fields: string;
    if (TWO_SIDED_FLASHCARDS.includes(flashcardType)) {
      fields = JSON.stringify([frontEditorState, backEditorState]);
    } else {
      fields = JSON.stringify([frontEditorState]);
    }

    const { data } = await createFlashcard({
      variables: {
        fields,
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
  };

  return (
    <>
      <SEO
        title="Create Flashcards"
        path={`course/${course?.id}/add-flashcards/${courseSectionSlug}/${subSectionSlug}`}
        description={`Create free spaced repetition flashcards for ${course.title} at Alu Learn`}
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
            <FontAwesomeIcon
              icon={faArrowLeft}
              size="2x"
              className="text-gray-600"
            />
          </Link>
        </div>
        <div className="grid grid-cols-12">
          <div className="lg:col-start-4 col-span-12 lg:col-span-6 mx-10 lg:mx-5">
            <FlashcardCreator
              createFlashcardCallback={createFlashcardHandler}
              verticalOffset={112}
              isPro={isPro}
              error={error}
            />
          </div>
          <div className="lg:col-start-10 col-span-12 lg:col-span-3 mx-5 lg:mx-3 mb-3">
            <h3 className="font-bold text-xl">Select Sub-section</h3>
            {course.courseSections?.map((courseSection, i) => (
              <div key={i}>
                <Link
                  href={`/course/${course.id}/add-flashcards/${courseSection?.slug}`}
                >
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
                </Link>
                {courseSection?.subSections?.map((subSection, j) => (
                  <Link
                    href={`/course/${course.id}/add-flashcards/${courseSection.slug}/${subSection?.slug}`}
                    key={j}
                  >
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
