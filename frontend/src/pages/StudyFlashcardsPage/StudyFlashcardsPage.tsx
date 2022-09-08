import FinishedStudying from "./FinishedStudying";
import FlashcardSide from "./FlashcardSide";
import { EASE_FOR_HARD_EXERCISE, formatDate, GRADES } from "./helpers";
import type { ExtendedReviewInstance, Grade } from "./helpers";
import Button from "@/atoms/Button";
import ButtonGroup from "@/atoms/ButtonGroup";
import ProgressBar from "@/components/ProgressBar";
import StudyReviewInstance from "@/graphql/StudyReviewInstance";
import SEO from "@/helpers/SEO";
import classNames from "@/helpers/classNames";
import type {
  Mutation,
  MutationStudyReviewInstanceArgs,
  ReviewInstance,
  Grade as GQLGrade,
} from "@/types";
import { useMutation } from "@apollo/client";
import type { Interval } from "helpers/calculateInterval";
import { useEffect, useState } from "react";

export interface StudyFlashcardsPageProps {
  courseId: string;
  reviewInstances: ReviewInstance[];
  intervals: {
    [reviewInstanceId: string]: {
      AGAIN: Interval | null;
      HARD: Interval | null;
      GOOD: Interval | null;
      EASY: Interval | null;
    };
  };
}

/**
 * Renders a page where the user can study flashcards (in the form of review instances)
 */
export default function StudyFlashcardsPage({
  courseId,
  reviewInstances,
  intervals,
}: StudyFlashcardsPageProps) {
  const initialNumReviewInstances = reviewInstances.length;
  const [_reviewInstances, _setReviewInstances] = useState(() =>
    reviewInstances.sort(() => Math.random() - 0.5)
  );
  const [activeReviewInstance, setActiveReviewInstance] = useState<
    ExtendedReviewInstance | undefined
  >(() => _reviewInstances[0] as ExtendedReviewInstance);
  const validGrades: Grade[] = GRADES.filter(
    (grade) =>
      activeReviewInstance && !!intervals[activeReviewInstance.id][grade]
  );

  const [revealAnswer, setRevealAnswer] = useState(false);
  const [starred, setStarred] = useState(false);
  const [isTransitioningCorrect, setIsTransitioningCorrect] = useState(false);
  const [isTransitioningIncorrect, setIsTransitioningIncorrect] =
    useState(false);

  const [studyReviewInstance] = useMutation<
    { studyReviewInstance: Mutation["studyReviewInstance"] },
    MutationStudyReviewInstanceArgs
  >(StudyReviewInstance);

  const onStarred = (e: React.MouseEvent<SVGElement>) => {
    // TODO: implement starring
    setStarred(!starred);
    e.stopPropagation();
  };

  const selectGrade = (grade: Grade) => {
    if (!activeReviewInstance) return;
    const interval = intervals[activeReviewInstance.id][grade];
    if (!interval || !revealAnswer) return;

    let newReviewInstances = _reviewInstances;
    if (interval.minutes >= 1440) {
      // Remove from the queue if the interval is over a day
      newReviewInstances = newReviewInstances.filter(
        (ri) => ri.id !== activeReviewInstance.id
      );
    } else if (newReviewInstances.length > 1) {
      // Make sure the user is never shown the same card twice (unless it's the only card left)
      while (newReviewInstances[0].id === activeReviewInstance.id) {
        newReviewInstances = newReviewInstances.sort(() => Math.random() - 0.5);
      }
    }
    _setReviewInstances(newReviewInstances);

    // Play "throwing away" animation
    setRevealAnswer(false);
    if (grade === "AGAIN") {
      setIsTransitioningIncorrect(true);
    } else {
      setIsTransitioningCorrect(true);

      // https://freesound.org/people/ertfelda/sounds/243701/
      const sound = new Audio("/assets/audio/correct.wav");
      sound.play();
    }

    // End "throwing away" animation
    setTimeout(() => {
      setIsTransitioningCorrect(false),
        setIsTransitioningIncorrect(false),
        setActiveReviewInstance(
          newReviewInstances[0] as ExtendedReviewInstance
        );
    }, 400);

    // Send API request
    studyReviewInstance({
      variables: {
        timezoneOffset: 0,
        timeTaken: 0,
        reviewInstanceId: activeReviewInstance.id,
        grade: grade as GQLGrade,
      },
    });
  };

  useEffect(() => {
    const keyUp = (event: KeyboardEvent) => {
      switch (event.key) {
        case " ":
          setRevealAnswer(!revealAnswer);
          break;
        case "1":
          selectGrade(validGrades[0]);
          break;
        case "2":
          selectGrade(validGrades[1]);
          break;
        case "3":
          selectGrade(validGrades[2]);
          break;
        case "4":
          selectGrade(validGrades[3]);
          break;
      }
    };

    document.addEventListener("keyup", keyUp);
    return () => document.removeEventListener("keyup", keyUp);
  });

  return (
    <>
      <SEO
        title="Study Flashcards"
        path={`course/${courseId}/study`}
        description=""
      />
      <div className="mt-28">
        {initialNumReviewInstances > 0 && activeReviewInstance && (
          <div>
            <h1 className="font-bold text-4xl text-center">Study Flashcards</h1>
            <ProgressBar
              stepNum={initialNumReviewInstances - _reviewInstances.length}
              totalNumSteps={initialNumReviewInstances}
              className="my-3 max-w-4xl mx-auto"
            />
            {activeReviewInstance.ease <= EASE_FOR_HARD_EXERCISE && (
              <p className={"text-red-700 text-center font-bold my-2"}>
                This flashcard is tough! Good luck!
              </p>
            )}
            <div
              className={classNames(
                "w-96 h-[28rem] mx-auto mt-8 mb-4 flex flex-col relative hover:cursor-pointer",
                (isTransitioningCorrect || isTransitioningIncorrect) &&
                  "transition-all duration-500 scale-75 -translate-y-36 opacity-0",
                isTransitioningCorrect && "origin-bottom-right rotate-90",
                isTransitioningIncorrect && "origin-bottom-left -rotate-90"
              )}
              role="button"
              onClick={() => setRevealAnswer(!revealAnswer)}
            >
              <FlashcardSide
                side="front"
                field={JSON.stringify(
                  JSON.parse(activeReviewInstance.flashcard.fields as string)[0]
                )}
                isShown={!revealAnswer}
                starred={starred}
                onStarred={onStarred}
              />
              <FlashcardSide
                side="back"
                field={JSON.stringify(
                  JSON.parse(activeReviewInstance.flashcard.fields as string)[1]
                )}
                isShown={revealAnswer}
                starred={starred}
                onStarred={onStarred}
              />
            </div>
            <p className="text-center text-gray-500">
              Press &quot;space&quot; to flip the flashcard
            </p>
            <div
              className={classNames(
                "fixed bottom-0 w-full z-30 h-24 transition-opacity duration-600",
                revealAnswer ? "opacity-100" : "opacity-0"
              )}
            >
              <ButtonGroup className="text-center" fixedWidth="165px" spaced>
                {validGrades.includes("AGAIN") && (
                  <Button onClick={() => selectGrade("AGAIN")} variant="red">
                    Again (
                    {formatDate(
                      intervals[activeReviewInstance.id]["AGAIN"]?.minutes
                    )}
                    )
                  </Button>
                )}
                {validGrades.includes("HARD") && (
                  <Button onClick={() => selectGrade("HARD")} variant="yellow">
                    Hard (
                    {formatDate(
                      intervals[activeReviewInstance.id]["HARD"]?.minutes
                    )}
                    )
                  </Button>
                )}
                {validGrades.includes("GOOD") && (
                  <Button onClick={() => selectGrade("GOOD")} variant="green">
                    Good (
                    {formatDate(
                      intervals[activeReviewInstance.id]["GOOD"]?.minutes
                    )}
                    )
                  </Button>
                )}
                {validGrades.includes("EASY") && (
                  <Button onClick={() => selectGrade("EASY")} variant="blue">
                    Easy (
                    {formatDate(
                      intervals[activeReviewInstance.id]["EASY"]?.minutes
                    )}
                    )
                  </Button>
                )}
              </ButtonGroup>
              <p className="text-center mt-2 text-gray-500">
                Click a response or use keys 1-{validGrades.length}
              </p>
            </div>
          </div>
        )}
        {!activeReviewInstance && initialNumReviewInstances > 0 && (
          <FinishedStudying />
        )}
      </div>
    </>
  );
}
