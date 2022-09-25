import FinishedStudying from "./FinishedStudying";
import FlashcardSide from "./FlashcardSide";
import { EASE_FOR_HARD_EXERCISE, formatDate, GRADES } from "./helpers";
import type { Grade } from "./helpers";
import Button from "@/atoms/Button";
import ButtonGroup from "@/atoms/ButtonGroup";
import ProgressBar from "@/components/ProgressBar";
import StudyReviewInstance from "@/graphql/StudyReviewInstance";
import UpdateReviewInstance from "@/graphql/UpdateReviewInstance";
import SEO from "@/helpers/SEO";
import classNames from "@/helpers/classNames";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import type {
  Mutation,
  MutationStudyReviewInstanceArgs,
  ReviewInstance,
  ReviewInstanceWithFlashcard,
  Grade as GQLGrade,
  Intervals,
  MutationUpdateReviewInstanceArgs,
} from "@/types";
import { useMutation } from "@apollo/client";
import type { ReviewInstance as PrismaReviewInstance } from "@prisma/client";
import BrowserInteractionTime from "browser-interaction-time";
import calculateInterval from "helpers/calculateInterval";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export interface StudyFlashcardsPageProps {
  courseId: string;
  courseSectionSlug?: string;
  subSectionSlug?: string;
  reviewInstances: ReviewInstance[];
  /**
   * Intervals for each review instance.
   * In the form of a dictionary (reviewInstanceId: interval)
   */
  intervals: Intervals;
  /**
   * Are there no flashcards at all in the section/course?
   */
  noFlashcards: boolean;
  /**
   * What is the user's streak at the beginning of the study session?
   */
  currentStreak: number;
  /**
   * Was the user's streak active at the beginning of the study session?
   */
  streakActive: boolean;
}

const BUTTONS_BREAKPOINT = 675;
/**
 * Renders a page where the user can study flashcards (in the form of review instances)
 */
export default function StudyFlashcardsPage({
  reviewInstances,
  noFlashcards,
  intervals,
  currentStreak,
  streakActive,
}: StudyFlashcardsPageProps) {
  const router = useRouter();
  const { courseId, classroomId, courseSectionSlug, subSectionSlug } =
    router.query;

  const initialNumReviewInstances = reviewInstances.length;
  const initialNumUnseen = reviewInstances.filter(
    (ri) => ri.learningStatus === "UNSEEN"
  ).length;
  const [_reviewInstances, _setReviewInstances] = useState(() =>
    reviewInstances.sort(() => Math.random() - 0.5)
  );
  const [activeReviewInstance, setActiveReviewInstance] = useState<
    ReviewInstanceWithFlashcard | undefined
  >(() => _reviewInstances[0] as ReviewInstanceWithFlashcard);
  const validGrades: Grade[] = useMemo(
    () =>
      GRADES.filter(
        (grade) =>
          activeReviewInstance &&
          Object.keys(intervals).length > 0 &&
          !!intervals[activeReviewInstance.id][grade]
      ),
    [intervals, activeReviewInstance]
  );
  const [finishedStudying, setFinishedStudying] = useState(false);
  const [numReviewsStudiedInSession, setNumReviewsStudiedInSession] =
    useState(0);

  const [revealAnswer, setRevealAnswer] = useState(false);
  const [isTransitioningCorrect, setIsTransitioningCorrect] = useState(false);
  const [isTransitioningIncorrect, setIsTransitioningIncorrect] =
    useState(false);

  const [studyReviewInstance] = useMutation<
    { studyReviewInstance: Mutation["studyReviewInstance"] },
    MutationStudyReviewInstanceArgs
  >(StudyReviewInstance);
  const [updateReviewInstance] = useMutation<
    { updateFlashcard: Mutation["updateFlashcard"] },
    MutationUpdateReviewInstanceArgs
  >(UpdateReviewInstance);

  const browserInteractionTime = useMemo(() => {
    const browserInteractionTimer = new BrowserInteractionTime({
      idleTimeoutMs: 60_000,
    });
    browserInteractionTimer.startTimer();
    return browserInteractionTimer;
  }, []);

  const { width } = useWindowDimensions();

  const onStarred = async (e: React.MouseEvent<SVGElement>) => {
    e.stopPropagation();
    if (!activeReviewInstance) return;

    await updateReviewInstance({
      variables: {
        isStarred: !activeReviewInstance.isStarred,
        reviewInstanceId: activeReviewInstance.id as string,
      },
    });
    setActiveReviewInstance({
      ...activeReviewInstance,
      isStarred: !activeReviewInstance.isStarred,
    });
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
    } else {
      // Recalculate the intervals
      const updatedReviewInstance = {
        ...activeReviewInstance,
        ...interval.updatedReviewInstance,
      };
      for (const grade of GRADES) {
        intervals[activeReviewInstance.id][grade] = calculateInterval(
          updatedReviewInstance as PrismaReviewInstance,
          grade
        );
      }
      newReviewInstances[
        newReviewInstances.map((ri) => ri.id).indexOf(activeReviewInstance.id)
      ] = updatedReviewInstance as ReviewInstance;

      // Make sure the user is never shown the same card twice (unless it's the only card left)
      if (newReviewInstances.length > 1) {
        while (newReviewInstances[0].id === activeReviewInstance.id) {
          newReviewInstances = newReviewInstances.sort(
            () => Math.random() - 0.5
          );
        }
      }
    }
    _setReviewInstances(newReviewInstances);
    setNumReviewsStudiedInSession(numReviewsStudiedInSession + 1);

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
          newReviewInstances[0] as ReviewInstanceWithFlashcard
        );
      if (newReviewInstances.length === 0) setFinishedStudying(true);
    }, 400);

    // Get time spent
    browserInteractionTime.stopTimer();
    const timeTaken = browserInteractionTime.getTimeInMilliseconds();
    browserInteractionTime.reset();
    browserInteractionTime.startTimer();

    // Send API request
    studyReviewInstance({
      variables: {
        timeTaken,
        reviewInstanceId: activeReviewInstance.id,
        grade: grade as GQLGrade,
      },
    });
  };

  const studyAgain = () => {
    router.replace(router.asPath);
    setRevealAnswer(false);
    setFinishedStudying(false);
    setNumReviewsStudiedInSession(0);
  };

  const studyAhead = () => {
    router.replace({
      pathname: router.asPath,
      query: {
        studyAhead: "true",
      },
    });
    setRevealAnswer(false);
    setFinishedStudying(false);
    setNumReviewsStudiedInSession(0);
  };

  // When studying ahead or studying again, automatically update the internal
  // review instances state and the active review instance when the review
  // instances prop is changed (due to `router.replace`)
  useEffect(() => {
    if (_reviewInstances.length === 0 && finishedStudying) {
      _setReviewInstances(reviewInstances);
    }
    setActiveReviewInstance(reviewInstances[0] as ReviewInstanceWithFlashcard);
  }, [_reviewInstances.length, reviewInstances, finishedStudying]);

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

  const addFlashcardsRoute = subSectionSlug
    ? `/course/${courseId}/add-flashcards/${courseSectionSlug}/${subSectionSlug}`
    : courseSectionSlug
    ? `/course/${courseId}/add-flashcards/${courseSectionSlug}`
    : `/course/${courseId}/add-flashcards`;

  return (
    <>
      <SEO
        title="Study Flashcards"
        path={`course/${courseId}/study`}
        description=""
      />
      <div className="mt-28">
        {!finishedStudying && activeReviewInstance && (
          <div className="px-5">
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
                "w-[20rem] md:w-96 h-[28rem] mx-auto mt-8 mb-4 flex flex-col relative hover:cursor-pointer",
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
                starred={activeReviewInstance.isStarred}
                onStarred={onStarred}
              />
              <FlashcardSide
                side="back"
                field={JSON.stringify(
                  JSON.parse(activeReviewInstance.flashcard.fields as string)[1]
                )}
                isShown={revealAnswer}
                starred={activeReviewInstance.isStarred}
                onStarred={onStarred}
              />
            </div>
            <p className="text-center text-gray-500">
              Press &quot;space&quot; to flip the flashcard
            </p>
            <div
              className={classNames(
                "w-full z-30 transition-opacity duration-600",
                revealAnswer ? "opacity-100" : "opacity-0",
                width > BUTTONS_BREAKPOINT ? "fixed bottom-0 h-24" : "mt-10"
              )}
            >
              <ButtonGroup
                className="text-center"
                fixedWidth="165px"
                vertical={width <= BUTTONS_BREAKPOINT}
                spaced
              >
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
              {width > BUTTONS_BREAKPOINT && (
                <p className="text-center mt-2 text-gray-500">
                  Click a response or use keys 1-{validGrades.length}
                </p>
              )}
            </div>
          </div>
        )}
        {finishedStudying && (
          <FinishedStudying
            courseId={courseId as string | undefined}
            classroomId={classroomId as string | undefined}
            studyAgain={studyAgain}
            oldStreak={currentStreak}
            reviewsJustDone={numReviewsStudiedInSession}
            numReviewsLearned={initialNumUnseen}
            numReviewsRefreshed={
              Object.keys(intervals).length - initialNumUnseen
            }
            streakWasActive={streakActive}
          />
        )}
        {initialNumReviewInstances === 0 && (
          <div className="text-center translate-y-24">
            <p>
              You&apos;ve studied everything in this section! Come back tomorrow
              to study more!
            </p>
            <ButtonGroup fixedWidth="175px" spaced>
              <Button onClick={studyAhead} className="mt-3" autoFocus>
                Study Ahead
              </Button>
              <Button
                onClick={() => router.push(`/course/${courseId}`)}
                variant="secondary"
              >
                Exit
              </Button>
            </ButtonGroup>
          </div>
        )}
        {noFlashcards && (
          <div className="text-center translate-y-24">
            <p>This section has no flashcards yet. Why not add some?</p>
            <Button
              onClick={() => router.push(addFlashcardsRoute)}
              className="mt-3"
              autoFocus
            >
              Add Flashcards
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
