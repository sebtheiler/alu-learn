import Button from "@/atoms/Button";
import SEO from "@/helpers/SEO";
import classNames from "@/helpers/classNames";
import stringifyReviewInstanceField from "@/helpers/stringifyReviewInstanceField";
import LexicalEditor from "@/editor/LexicalEditor";
import { ReviewInstanceWithFlashcard } from "@/types";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

const NUM_ANSWERS = 4;

interface Answer {
  text: string;
  correct: boolean;
  id: string;
}

interface Question {
  question: string;
  answers: Answer[];
}

export interface QuizGamePageProps {
  reviewInstances: ReviewInstanceWithFlashcard[];
}

/**
 * Quiz game where one review instance front is mapped to a number of review instances backs
 */
export default function QuizGamePage({ reviewInstances }: QuizGamePageProps) {
  const router = useRouter();
  const { courseId } = router.query;

  const questions = useMemo(() => {
    const questions: Question[] = [];

    const getRandomReviewInstance = () =>
      reviewInstances[Math.floor(Math.random() * reviewInstances.length)];

    for (const reviewInstance of reviewInstances) {
      // Generate answers
      const answers: Answer[] = [
        {
          text: stringifyReviewInstanceField(reviewInstance, 1),
          correct: true,
          id: reviewInstance.id,
        },
      ];

      for (let i = 0; i < NUM_ANSWERS - 1; i++) {
        let randomReviewInstance = getRandomReviewInstance();
        while (answers.map((a) => a.id).includes(randomReviewInstance.id)) {
          randomReviewInstance = getRandomReviewInstance();
        }

        answers.push({
          text: stringifyReviewInstanceField(randomReviewInstance, 1),
          correct: false,
          id: randomReviewInstance.id,
        });
      }

      // Push question
      questions.push({
        question: stringifyReviewInstanceField(reviewInstance, 0),
        answers: answers.sort(() => Math.random() - 0.5),
      });
    }

    return questions.sort(() => Math.random() - 0.5);
  }, [reviewInstances]);
  const [questionNum, setQuestionNum] = useState(0);

  const [incorrectAnswers, setIncorrectAnswers] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const [numMistakes, setNumMistakes] = useState(0);

  const selectAnswer = (answer: Answer) => {
    if (showAnswer) return;
    if (answer.correct) {
      setShowAnswer(true);

      // https://freesound.org/people/ertfelda/sounds/243701/
      const sound = new Audio("/assets/audio/correct.wav");
      sound.play();
    } else {
      setIncorrectAnswers([...incorrectAnswers, answer.id]);
      setNumMistakes(numMistakes + 1);
    }
  };

  const nextQuestion = () => {
    if (questionNum === questions.length - 1) {
      setFinished(true);
      return;
    }
    setQuestionNum(questionNum + 1);
    setShowAnswer(false);
    setIncorrectAnswers([]);
  };

  const playAgain = () => {
    setFinished(false);
    setQuestionNum(0);
    setIncorrectAnswers([]);
    setShowAnswer(false);
    router.replace(router.asPath);
  };

  return (
    <>
      <SEO
        title="Quiz Game"
        path={`course/${courseId}/games/quiz`}
        description="Study the fun way with a quiz game to test your knowledge of your flashcards"
      />
      <div className="mt-28 max-w-xl mx-auto relative">
        <h1 className="text-center font-bold text-2xl">Quiz Game</h1>
        {!finished && (
          <div>
            <p className="absolute right-0">
              #{questionNum + 1}/{questions.length}
            </p>
            <div className="flex justify-center max-w-lg mx-auto my-5">
              <LexicalEditor
                namespace="question"
                editorState={questions[questionNum].question}
                readOnly
              />
            </div>
            <hr className="max-w-lg mx-auto my-2" />
            <h2 className="text-center font-bold text-lg">
              Choose the correct answer
            </h2>
            <div>
              {questions[questionNum].answers.map((answer, i) => (
                <div
                  key={i}
                  className={classNames(
                    "border-4 border-blue-700 rounded-xl min-h-[5rem] flex items-center justify-left my-4 p-4 hover:scale-105 hover:bg-slate-50 hover:cursor-pointer transition",
                    incorrectAnswers.includes(answer.id) &&
                      "bg-red-400 hover:bg-red-400 hover:scale-100 hover:cursor-not-allowed",
                    showAnswer &&
                      answer.correct &&
                      "bg-green-300 hover:bg-green-400 hover:scale-100 pop"
                  )}
                  onClick={() => selectAnswer(answer)}
                >
                  <LexicalEditor
                    namespace={`answer-${i}`}
                    editorState={answer.text}
                    readOnly
                  />
                </div>
              ))}
              {showAnswer && (
                <Button onClick={nextQuestion} block>
                  Next Question
                </Button>
              )}
            </div>
          </div>
        )}
        {finished && (
          <div className="text-center mt-4">
            <p>Awesome work!</p>
            {numMistakes > 0 ? (
              <p>You made {numMistakes} mistakes</p>
            ) : (
              <p>You didn&apos;t make any mistakes!</p>
            )}
            <Button onClick={playAgain} className="mt-3">
              Play Again
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
