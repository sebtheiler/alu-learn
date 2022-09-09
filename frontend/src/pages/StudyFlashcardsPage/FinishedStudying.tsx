import styles from "./FinishedStudying.module.scss";
import Button from "@/atoms/Button";
import ButtonGroup from "@/atoms/ButtonGroup";
import CardsDoneSVG from "@/components/CardsDoneSVG";
import classNames from "@/helpers/classNames";
import { faFire } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import ReactConfetti from "react-confetti";

interface FinishedStudyingProps {
  /**
   * ID of the course in which the user is studying (used for exiting after studying)
   */
  courseId: string;
  /**
   * Function to be called when the user selects to study again
   */
  studyAgain(): void;
}

/**
 * Renders a series of slides that play after the user finishes studying
 */
export default function FinishedStudying({
  courseId,
  studyAgain,
}: FinishedStudyingProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [playedSound, setPlayedSound] = useState(false);

  const router = useRouter();

  const oldStreak = 0;
  const newStreak = 1;
  const totalReviewsDone = 60;
  const reviewsJustDone = 10;
  const targetReviews = 50;
  const streakWasActive = true;

  useEffect(() => {
    if (playedSound) return;

    // https://freesound.org/people/xkeril/sounds/632663/
    const sound = new Audio("/assets/audio/task-successful.wav");
    setTimeout(() => sound.play(), 500);

    setPlayedSound(true);
  }, [playedSound]);

  const slides = useMemo(() => {
    const slides: JSX.Element[] = [];
    if (newStreak > oldStreak) {
      slides.push(
        <div className="flex items-center justify-center">
          <div
            className={classNames(
              "absolute flex items-center justify-center opacity-100 transition-opacity duration-700",
              styles.streakFadeOutAnimation
            )}
          >
            <FontAwesomeIcon
              icon={faFire}
              size="10x"
              className={classNames(
                "scale-150 absolute",
                streakWasActive
                  ? "text-alu-streak-lit"
                  : "text-alu-streak-unlit"
              )}
            />
            <div
              className={classNames(
                "w-32 h-[9.5rem] flex items-center justify-center",
                streakWasActive ? "bg-alu-streak-lit" : "bg-alu-streak-unlit"
              )}
            >
              <p
                className={classNames(
                  "text-8xl z-10 text-center translate-y-5",
                  streakWasActive ? "text-white" : "text-gray-700"
                )}
              >
                {newStreak - 1}
              </p>
            </div>
          </div>
          <div
            className={classNames(
              "absolute flex items-center justify-center opacity-0",
              styles.streakFadeInAnimation
            )}
          >
            <FontAwesomeIcon
              icon={faFire}
              size="10x"
              className="text-alu-streak-lit scale-150 absolute"
            />
            <div className="w-32 h-[9.5rem] bg-alu-streak rounded-full bg-alu-streak-lit flex items-center justify-center">
              <p className="text-8xl z-10 text-white text-center translate-y-5">
                {newStreak}
              </p>
            </div>
          </div>
          <div className="translate-y-40 text-center">
            <p className="text-xl">Streak increase!</p>
            <p>Don&apos;t forget to come back tomorrow to study again</p>
          </div>
        </div>
      );
    }

    let reviewsDoneText: string;
    if (totalReviewsDone <= targetReviews / 2) reviewsDoneText = "Great start!";
    else if (
      totalReviewsDone > targetReviews / 2 &&
      totalReviewsDone < targetReviews
    )
      reviewsDoneText = "Almost there! Keep working toward your daily goal!";
    else if (
      totalReviewsDone >= targetReviews &&
      totalReviewsDone - reviewsJustDone < targetReviews
    )
      reviewsDoneText = "Congratulations on reaching your daily goal!";
    else reviewsDoneText = "Nice work on exceeding your daily goal!";

    slides.push(
      <div>
        <p className="text-center font-bold text-xl mb-2">Reviews Done</p>
        <CardsDoneSVG
          targetCardsDone={targetReviews}
          cardsDone={totalReviewsDone}
          cardsJustDone={reviewsJustDone}
        />
        <p className="text-center">{reviewsDoneText}</p>
      </div>
    );
    slides.push(
      <div>
        <h1 className="font-bold text-2xl text-center">What next?</h1>
        <ButtonGroup className="mt-2" fixedWidth="175px" spaced>
          <Button onClick={studyAgain} autoFocus>
            Study Again
          </Button>
          <Button
            onClick={() => router.replace(`/course/${courseId}`)}
            variant="secondary"
          >
            Exit
          </Button>
        </ButtonGroup>
      </div>
    );
    return slides;
  }, [router, courseId, studyAgain, streakWasActive]);

  return (
    <div>
      <h1 className="text-center font-bold text-4xl">Congratulations!</h1>
      <ReactConfetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={300}
        tweenDuration={20000}
      />
      <div className="flex container px-12 mx-auto mt-4 h-[36rem]">
        <div className="w-1/2 border-r-[3px] border-r-gray-400 h-full flex items-center justify-center">
          {slides[slideIndex]}
        </div>
      </div>
      {slideIndex !== slides.length - 1 && (
        <div className="text-center">
          <Button
            onClick={() => setSlideIndex(slideIndex + 1)}
            className="mt-6 w-64 mx-auto"
            autoFocus
          >
            Next
          </Button>
          <p className="text-sm text-gray-700 mt-2">Press &quot;space&quot;</p>
        </div>
      )}
    </div>
  );
}
