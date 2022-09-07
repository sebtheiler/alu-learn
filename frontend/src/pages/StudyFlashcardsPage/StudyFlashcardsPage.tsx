import SEO from "@/helpers/SEO";
import { ReviewInstance } from "@/types";
import type { Interval } from "helpers/calculateInterval";

export interface StudyFlashcardsPageProps {
  courseId: string;
  reviewInstances: ReviewInstance[];
  intervals: { [reviewInstanceId: string]: Interval };
}

/**
 *
 */
export default function StudyFlashcardsPage({
  courseId,
  reviewInstances,
  intervals,
}: StudyFlashcardsPageProps) {
  console.log({ courseId, reviewInstances, intervals });
  return (
    <>
      <SEO
        title="Study Flashcards"
        path={`course/${courseId}/study`}
        description=""
      />
      <div className="mt-28">
        <h1 className="font-bold text-4xl text-center">Study Flashcards</h1>
      </div>
    </>
  );
}
