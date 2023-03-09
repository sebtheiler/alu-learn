import AsyncButton from "alu-ui/src/AsyncButton";
import ButtonGroup from "alu-ui/src/ButtonGroup";
import RenderFlashcard from "@/courses/RenderFlashcard";
import FindHardestReviewInstances from "graphql-operations/operations/FindHardestReviewInstances";
import FindHardestSubSection from "graphql-operations/operations/FindHardestSubSections";
import SEO from "@/helpers/SEO";
import useProStore from "@/stores/proStore";
import type { Query } from "@/types";
import { useLazyQuery } from "@apollo/client";
import Link from "next/link";
import { useRouter } from "next/router";

/**
 * Displays a page with tools for interacting with the course
 */
export default function ToolsPage() {
  const router = useRouter();
  const { courseId } = router.query;
  const [findDifficultReviewInstances, { data: difficultReviewInstances }] =
    useLazyQuery<{
      findHardestReviewInstances: Query["findHardestReviewInstances"];
    }>(FindHardestReviewInstances);
  const [findDifficultSubSections, { data: difficultSubSections }] =
    useLazyQuery<{
      findHardestSubSections: Query["findHardestSubSections"];
    }>(FindHardestSubSection);

  const isPro = useProStore((state) => state.isPro);

  return (
    <>
      <SEO
        title="Tools"
        path={`course/${courseId}/tools`}
        description="Find the personalized hardest flashcards and topics for you with Alu's course tools"
      />
      <div className="mt-28 max-w-3xl mx-auto px-10">
        <h1 className="text-4xl font-bold text-center">Tools</h1>
        {!isPro && (
          <p className="text-center mt-2">
            You must{" "}
            <Link href="/pro" className="text-blue-500">
              upgrade to pro
            </Link>{" "}
            to access these tools
          </p>
        )}
        <ButtonGroup
          className="text-center mt-3"
          fixedWidth="350px"
          spaced
          vertical
        >
          <AsyncButton
            onClick={async () =>
              await findDifficultReviewInstances({ variables: { courseId } })
            }
            disabled={!isPro}
          >
            Find Difficult Flashcards
          </AsyncButton>
          <AsyncButton
            onClick={async () =>
              await findDifficultSubSections({ variables: { courseId } })
            }
            disabled={!isPro}
          >
            Find Difficult Topics
          </AsyncButton>
        </ButtonGroup>
        <hr className="my-3" />
        {difficultReviewInstances?.findHardestReviewInstances && (
          <>
            <h3 className="text-center text-2xl font-bold">
              Hardest Flashcards
            </h3>
            {difficultReviewInstances.findHardestReviewInstances.map(
              (ri, i) => (
                <div key={i} className="my-2">
                  Ease: {ri?.ease}
                  {ri?.flashcard && (
                    <RenderFlashcard flashcard={ri.flashcard} canEdit />
                  )}
                </div>
              )
            )}
          </>
        )}
        {difficultSubSections?.findHardestSubSections && (
          <>
            <h3 className="text-center text-2xl font-bold">Hardest Topics</h3>
            {difficultSubSections.findHardestSubSections.map(
              (subSection, i) => (
                <div
                  key={i}
                  className="text-center bg-gray-100 border-gray-200 border-2 rounded-xl my-2 py-3 px-5 max-w-xs mx-auto hover:scale-105 hover:cursor-pointer transition"
                  role="button"
                  title="View flashcards in new tab"
                  onClick={() =>
                    // @ts-ignore
                    window.open(
                      `/course/${courseId}/flashcards/${subSection?.courseSectionSlug}/${subSection?.slug}`,
                      "_blank"
                    )
                  }
                >
                  {subSection?.title} {/* @ts-ignore */}
                  (Ease: {subSection?.avgEase})
                </div>
              )
            )}
          </>
        )}
      </div>
    </>
  );
}
