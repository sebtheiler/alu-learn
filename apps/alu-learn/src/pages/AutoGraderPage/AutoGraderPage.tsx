import TextArea from "alu-ui/src/TextArea";
import useGlobalModalStore from "@/stores/globalModalStore";
import { useMutation } from "@apollo/client";
import SEO from "@/helpers/SEO";
import Rubric, { RubricI } from "./Rubric";
import { useState } from "react";
import AsyncButton from "alu-ui/src/AsyncButton";
import type {
  Mutation,
  MutationAutoEssayFeedbackArgs,
  MutationAutoGradeEssayArgs,
} from "@/types";
import AutoGradeEssay from "graphql-operations/operations/AutoGradeEssay";
import AutoEssayFeedback from "graphql-operations/operations/AutoEssayFeedback";
import capitalize from "helpers-lib/src/capitalize";
import md from "markdown-it";
import { AUTO_FLASHCARD_LIMITS } from "@/globals";
import LinkButton from "alu-ui/src/LinkButton";

export interface AutoGraderPageProps {
  signedIn: boolean;
  numAutoFlashcardsGenerated: number | null;
  isPro: boolean | null;
}

/**
 * Page for automatically generating flashcards from notes
 */
export default function AutoGraderPage({
  numAutoFlashcardsGenerated,
  isPro,
  signedIn,
}: AutoGraderPageProps) {
  const setSignInModalOpen = useGlobalModalStore((s) => s.setSignInModalOpen);

  const [rubric, setRubric] = useState<RubricI>({
    rows: [
      {
        title: "",
        cols: Array(4).fill([
          {
            description: "",
          },
        ]),
      },
    ],
  });

  const [grades, setGrades] = useState<
    { category: string; justification: string; score: number }[] | null
  >(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [autoGrade, { loading: gradeLoading }] = useMutation<
    { autoGradeEssay: Mutation["autoGradeEssay"] },
    MutationAutoGradeEssayArgs
  >(AutoGradeEssay);
  const [autoFeedback, { loading: feedbackLoading }] = useMutation<
    { autoEssayFeedback: Mutation["autoEssayFeedback"] },
    MutationAutoEssayFeedbackArgs
  >(AutoEssayFeedback);

  const autoGradeEssay = async () => {
    const { data } = await autoGrade({
      variables: {
        prompt,
        rubric: JSON.stringify(rubric),
        essay,
      },
    });

    if (!data || !data.autoGradeEssay) return;

    const autoGrades = JSON.parse(data.autoGradeEssay);
    setGrades(autoGrades);

    setTimeout(() => {
      document
        .getElementById("grades-header")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const autoImproveSuggestions = async () => {
    const { data } = await autoFeedback({
      variables: {
        prompt,
        rubric: JSON.stringify(rubric),
        essay,
        grades: JSON.stringify(grades),
      },
    });

    if (!data || !data.autoEssayFeedback) return;

    setFeedback(data.autoEssayFeedback as string);

    setTimeout(() => {
      document
        .getElementById("feedback-header")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const [prompt, setPrompt] = useState("");
  const [essay, setEssay] = useState("");

  const getMaxScore = (category: string) =>
    rubric.rows.find(
      (r) => r.title.toLowerCase() === category.toLowerCase().trim()
    )?.cols.length;

  const wordCount = essay.split(" ").length;
  const maxWordCount = 2500;

  const MAX_NUM_FLASHCARDS = isPro
    ? AUTO_FLASHCARD_LIMITS.pro
    : AUTO_FLASHCARD_LIMITS.regular;
  const exceededQuota = (numAutoFlashcardsGenerated ?? 0) >= MAX_NUM_FLASHCARDS;
  const disabled = exceededQuota || wordCount > maxWordCount;

  return (
    <>
      <SEO
        title="Auto-Grader"
        path="auto-grader"
        description="Get instant feedback on your essays with our automated essay grading tool. Our intelligent system grades your work on your rubric and provides detailed suggestions for improvement. Easily improve your writing skills and boost your grades."
      />
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="mt-28 font-bold text-center text-4xl">Auto-Grader</h1>
        <p className="text-center text-gray-700 max-w-lg mx-auto text-lg mb-1">
          Want feedback on your essay? Auto-grader can preview how well it will
          do on a rubric and suggest points to improve on
        </p>
        <p className="text-center text-xs text-gray-500 max-w-md mx-auto mb-3">
          Auto-grader&apos;s responses to your essay are not guaranteed to align
          with your teacher&apos;s perspective, but they still offer valuable
          feedback
        </p>

        <h2 className="font-bold text-2xl">Prompt</h2>
        <p className="text-gray-700">The prompt you wrote the essay for</p>
        <TextArea
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          maxLength={1024}
        />

        <h2 className="font-bold text-2xl mt-3">Rubric</h2>
        <p className="text-gray-700 mb-3">
          The rubric your essay will be graded on
        </p>
        <Rubric rubric={rubric} setRubric={setRubric} />

        <h2 className="font-bold text-2xl mt-3">Your Essay</h2>
        <TextArea rows={20} onChange={(e) => setEssay(e.target.value)} />

        {wordCount > maxWordCount && (
          <p className="text-center text-red-600 font-bold">
            Your essay is too long! Please shorten it to {maxWordCount} words or
            less (currently {wordCount})
          </p>
        )}
        {exceededQuota && (
          <div>
            <p className="text-red-600 my-2 text-center font-bold">
              You have exceeded your monthly quota of automatic essay grading
              generations.{" "}
              {isPro ? (
                <>
                  Contact{" "}
                  <a
                    href="mailto:support@alulearn.com"
                    className="text-blue-500"
                  >
                    support@alulearn.com
                  </a>{" "}
                  if you would like to request a personal increase.
                </>
              ) : (
                <>
                  Upgrade to pro to generate up to continue using this feature
                </>
              )}
            </p>
            {!isPro && (
              <LinkButton href="/pro" block>
                Upgrade to Pro
              </LinkButton>
            )}
          </div>
        )}

        <AsyncButton
          onClick={
            signedIn ? autoGradeEssay : async () => setSignInModalOpen(true)
          }
          className="my-5"
          disabled={disabled}
          block
        >
          Grade
        </AsyncButton>
        {gradeLoading && (
          <p className="text-red-600 my-2 text-center">
            Warning: This may take up to several minutes depending on the length
            of your essay. Do <strong>not</strong> refresh the page while you
            wait.
          </p>
        )}
        {grades && (
          <div>
            <h2 className="text-3xl font-bold text-center" id="grades-header">
              Grades
            </h2>
            {grades.map((grade, i) => (
              <div className="mb-3" key={i}>
                <h3 className="text-xl font-bold">
                  {capitalize(grade.category.trim())} - {grade.score}/
                  {getMaxScore(grade.category) ?? "?"}
                </h3>
                <p>{grade.justification}</p>
              </div>
            ))}
            <AsyncButton
              onClick={autoImproveSuggestions}
              className="my-4"
              disabled={disabled || !isPro}
              block
            >
              What can I do to improve?
            </AsyncButton>
            {!isPro && (
              <p className="text-red-600 font-bold my-2 text-center">
                Upgrade to pro to get suggestions to improve your essay
              </p>
            )}
            {feedbackLoading && (
              <p className="text-red-600 my-2 text-center">
                Warning: This may take up to several minutes depending on the
                length of your essay. Do <strong>not</strong> refresh the page
                while you wait.
              </p>
            )}
          </div>
        )}
        {feedback && (
          <div>
            <h2 className="text-3xl font-bold text-center" id="feedback-header">
              Feedback
            </h2>
            <div className="prose mx-auto">
              <div
                dangerouslySetInnerHTML={{ __html: md().render(feedback) }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
