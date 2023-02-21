import LinkButton from "@/atoms/LinkButton";
import SEO from "@/helpers/SEO";
import daysBetween from "@/helpers/daysBetween";
// import simulator from "schedulers/simulator";
import { useRouter } from "next/router";

export interface AlgorithmResearchPageProps {
  dayChosenForAlgorithmResearch: string;
}

/**
 * "Landing" page for algorithm research study
 */
export default function AlgorithmResearchPage({
  dayChosenForAlgorithmResearch,
}: AlgorithmResearchPageProps) {
  const router = useRouter();
  const daysIntoStudy =
    Math.round(
      daysBetween(
        new Date(dayChosenForAlgorithmResearch.replaceAll('"', "")),
        new Date()
      )
    ) + 1;

  // simulator();

  return (
    <>
      <SEO title="Algorithm Research" path="algorithm-research" noindex />
      <div className="mt-28">
        <h1 className="text-center font-bold text-4xl">
          Algorithm Research Study - Day {daysIntoStudy}/7
        </h1>
        <p className="text-center">
          Welcome to Alu&apos;s algorithm research study!
        </p>
        <div className="max-w-sm mx-auto mt-5">
          <p className="font-bold my-1">Instructions</p>
          {daysIntoStudy <= 7 ? (
            <>
              <ul className="list-disc">
                <li>
                  Read each flashcard and mentally picture the answer before
                  flipping it with the spacebar
                </li>
                <li>If your response was incorrect press &quot;Again&quot;</li>
                <li>
                  If your response was correct, indicate how easily you remember
                  the flashcard with the remaining options
                </li>
                <li>
                  Spend ~10 minutes per day studying these flashcards for the
                  one-week duration of the study
                </li>
              </ul>
              <LinkButton
                href={`/algorithm-research/${router.query.spanishGradeLevel}/study`}
                className="mt-3"
                block
              >
                Begin Study
              </LinkButton>
            </>
          ) : (
            <p className="text-center">
              Thank you for participating in the research study! If you have any
              questions about the study or how your anonymous data will be used,
              please reach out to{" "}
              <a href="mailto:stheiler05@westendsecondary.com">
                stheiler05@westendsecondary.com
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </>
  );
}
