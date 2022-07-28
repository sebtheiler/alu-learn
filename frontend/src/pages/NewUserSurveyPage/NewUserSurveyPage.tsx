import useSlides from "./slides";
import type { Answers, Question } from "./types";
import ProgressBar from "components/ProgressBar";
import { useCallback, useState } from "react";

export default function NewUserSurveyPage() {
  const [slideNum, setSlideNum] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    timezoneOffset: new Date().getTimezoneOffset(),
  });

  /**
   * Generates a function to save the answer from the user's choice in `answers`
   * @param question Unique ID of the question. Saves as a key in `answers`
   * @returns A function to save the user's choice and move to the next question
   * @note `numSlides` is passed from the slides object. This is required to avoid a circular dependency where `slides` is dependent on `handleNext` and `handleNext` is dependent on `slides.length`
   */
  const handleNext = useCallback(
    (question: Question | null, numSlides: number) => {
      return async (response: string | number | boolean) => {
        if (question) {
          const newAnswers = answers;
          (newAnswers[question] as string | number | boolean) = response;
          setAnswers(newAnswers);
        }

        if (slideNum === numSlides - 1) {
          console.log(answers);
          setSlideNum(0);
        } else {
          setSlideNum(slideNum + 1);
        }
      };
    },
    [answers, slideNum]
  );

  const slides = useSlides(handleNext, answers.userType);

  return (
    <div className="container mx-auto mt-28 md:px-14 lg:px-28">
      <h1 className="mb-3 text-center text-3xl font-bold">Welcome to Alu!</h1>
      <ProgressBar stepNum={slideNum} totalNumSteps={slides.length - 1} />
      <div className="mt-5 text-lg">{slides[slideNum]}</div>
    </div>
  );
}
