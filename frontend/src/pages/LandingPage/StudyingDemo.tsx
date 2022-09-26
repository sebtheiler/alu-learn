import FlashcardSide from "../StudyFlashcardsPage/FlashcardSide";
import Button from "@/atoms/Button";
import ButtonGroup from "@/atoms/ButtonGroup";
import classNames from "@/helpers/classNames";
import useGlobalModalStore from "@/stores/globalModalStore";
import { useState } from "react";

const areYouReady = {
  id: "areYouReady",
  isStarred: false,
  flashcard: {
    fields:
      '[{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Are you ready to start using Alu?","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}},{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Yes","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}]',
    tags: "",
  },
};

const textPairs = [
  [
    "What is Alu?",
    "A free flashcard and learning system that uses spaced repetition to help you ace your AP® Exams",
  ],
  [
    "What is spaced repetition?",
    "A technique that puts intervals between when you study content. Harder flashcards are shown more frequently; easier flashcards are shown less frequently",
  ],
  [
    "Does Alu have pre-made flashcards?",
    "Yes! Alu has existing flashcards for 5+ AP Exams",
  ],
];

const exampleReviewInstances = textPairs.map(([front, back], i) => ({
  id: i.toString(),
  isStarred: false,
  flashcard: {
    fields: `[{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"${front}","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}},{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"${back}","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}]`,
    tags: "",
  },
}));

export default function StudyingDemo() {
  const { setRegisterModalOpen } = useGlobalModalStore();
  const [hasClicked, setHasClicked] = useState(false);
  const [isTransitioningCorrect, setIsTransitioningCorrect] = useState(false);
  const [isTransitioningIncorrect, setIsTransitioningIncorrect] =
    useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);

  const [reviewInstances, setReviewInstances] = useState(
    exampleReviewInstances
  );
  const [activeReviewInstance, setActiveReviewInstance] = useState(
    exampleReviewInstances[0]
  );

  const updateCard = (correct: boolean) => {
    return (e: React.MouseEvent) => {
      console.log(correct);
      e.preventDefault();

      setRevealAnswer(false);
      if (correct) {
        setIsTransitioningCorrect(true);
        setReviewInstances(reviewInstances.slice(1));

        // https://freesound.org/people/ertfelda/sounds/243701/
        const sound = new Audio("/assets/audio/correct.wav");
        sound.play();
      } else {
        setIsTransitioningIncorrect(true);
        setReviewInstances([...reviewInstances.slice(1), reviewInstances[0]]);
      }

      setTimeout(() => {
        setIsTransitioningCorrect(false);
        setIsTransitioningIncorrect(false);
        if (reviewInstances.length === 1) {
          setActiveReviewInstance(areYouReady);
        } else {
          setActiveReviewInstance(reviewInstances[1]);
        }
      }, 400);
    };
  };

  return (
    <div className="overflow-hidden">
      {!hasClicked && (
        <div className="w-[20rem] mx-auto">
          <div className="absolute -translate-y-6 -translate-x-20 w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
            <p className="text-white italic">Click me!</p>
          </div>
        </div>
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
        onClick={() => {
          setRevealAnswer(!revealAnswer);
          setHasClicked(true);
        }}
      >
        <FlashcardSide
          side="front"
          field={JSON.stringify(
            JSON.parse(activeReviewInstance.flashcard.fields as string)[0]
          )}
          isShown={!revealAnswer}
          starred={activeReviewInstance.isStarred}
        />
        <FlashcardSide
          side="back"
          field={JSON.stringify(
            JSON.parse(activeReviewInstance.flashcard.fields as string)[1]
          )}
          isShown={revealAnswer}
          starred={activeReviewInstance.isStarred}
          overrideContent={
            activeReviewInstance.id === areYouReady.id ? (
              <Button
                className="w-48"
                onClick={(e) => {
                  e.stopPropagation();
                  setRegisterModalOpen(true);
                }}
              >
                Yes
              </Button>
            ) : undefined
          }
        />
      </div>
      <div
        className={classNames(
          "transition-opacity duration-600",
          revealAnswer && activeReviewInstance.id !== areYouReady.id
            ? "opacity-100"
            : "opacity-0"
        )}
      >
        <ButtonGroup className="text-center" fixedWidth="165px" spaced>
          <Button onClick={updateCard(false)} variant="red">
            Again (30m)
          </Button>
          <Button onClick={updateCard(true)} variant="green">
            Good (1d)
          </Button>
          <Button onClick={updateCard(true)} variant="blue">
            Easy (4d)
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
