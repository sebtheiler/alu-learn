import ButtonGroup from "@/atoms/ButtonGroup";
import LinkButton from "@/atoms/LinkButton";
import FlashcardList from "@/courses/FlashcardList";
import SEO from "@/helpers/SEO";
import flattenLexical from "@/helpers/flattenLexical";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { Flashcard } from "@/types";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

async function allSynchronously<T>(
  resolvables: (() => Promise<T>)[]
): Promise<T[]> {
  const results: T[] = [];
  for (const resolvable of resolvables) {
    results.push(await resolvable());
  }
  return results;
}

type FlashcardWithId = Flashcard & { id: string };

export interface FlashcardsPageProps {
  courseId: string;
  title: string;
  flashcards: FlashcardWithId[];
  courseSectionSlug?: string;
  subSectionSlug?: string;
  editAccess: boolean;
}

/**
 * Renders a page with a list of all flashcards in a specific course, course section, or sub section
 */
export default function FlashcardsPage({
  courseId,
  title,
  flashcards,
  courseSectionSlug,
  subSectionSlug,
  editAccess,
}: FlashcardsPageProps) {
  const slug = courseSectionSlug
    ? subSectionSlug
      ? `/${courseSectionSlug}/${subSectionSlug}`
      : `/${courseSectionSlug}`
    : "";

  const { width } = useWindowDimensions();

  const fronts = allSynchronously<string | undefined>(
    flashcards.map(
      (flashcard) => () =>
        flattenLexical(
          JSON.stringify(JSON.parse(flashcard.fields as string)[0])
        )
    )
  );
  const backs = allSynchronously<string | undefined>(
    flashcards.map(
      (flashcard) => () =>
        flattenLexical(
          JSON.stringify(JSON.parse(flashcard.fields as string)[1])
        )
    )
  );
  const flashcardsSEO = flashcards
    .map(
      (flashcard) => () =>
        flattenLexical(
          JSON.stringify(JSON.parse(flashcard.fields as string)[0])
        )
    )
    .map((flashcard, i) => ({
      "@context": "https://schema.org/",
      "@type": "Question",
      eduQuestionType: "Flashcard",
      text: fronts[i],
      acceptedAnswer: {
        "@type": "Answer",
        text: backs[i],
      },
    }));

  return (
    <>
      <SEO
        title={`${title} Flashcards`}
        path={`course/${courseId}/flashcards`}
        description="" // TODO: SUPER IMPORTANT
        seoJson={{
          "@context": "https://schema.org/",
          "@type": "Quiz",
          about: {
            "@type": "Thing",
            name: "Cell Transport",
          },
          educationalAlignment: [
            {
              "@type": "AlignmentObject",
              alignmentType: "educationalSubject",
              targetName: "Biology",
            },
          ],
          hasPart: flashcardsSEO,
        }}
      />
      <script type="application/ld+json"></script>
      <div className="mt-28">
        <h1 className="text-center font-bold text-4xl mb-2">Flashcards</h1>
        <div className="absolute left-6 top-28">
          <Link
            href={
              subSectionSlug
                ? `/course/${courseId}/flashcards/${courseSectionSlug}`
                : courseSectionSlug
                ? `/course/${courseId}/flashcards`
                : `/course/${courseId}`
            }
          >
            <a>
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="2x"
                className="text-gray-600"
              />
            </a>
          </Link>
        </div>
        <ButtonGroup
          className="text-center"
          fixedWidth="175px"
          vertical={width === 0 ? false : width < 740}
          spaced
        >
          <LinkButton href={`/course/${courseId}/study${slug}`}>
            Study
          </LinkButton>
          {/* <LinkButton href={`/course/${courseId}/games${slug}`}>
            Games
          </LinkButton> */}
          {editAccess && (
            <LinkButton href={`/course/${courseId}/add-flashcards${slug}`}>
              Add Flashcards
            </LinkButton>
          )}
        </ButtonGroup>
        <div className="container mx-auto px-4 mt-4">
          {flashcards.length > 0 ? (
            <FlashcardList flashcards={flashcards} />
          ) : (
            <p className="text-center">
              This section doesn&apos;t have any flashcards yet
            </p>
          )}
        </div>
      </div>
    </>
  );
}
