import ButtonGroup from "@/atoms/ButtonGroup";
import LinkButton from "@/atoms/LinkButton";
import FlashcardList from "@/courses/FlashcardList";
import SEO from "@/helpers/SEO";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { Flashcard } from "@/types";

type FlashcardWithId = Flashcard & { id: string };

export interface FlashcardsPageProps {
  courseId: string;
  flashcards: FlashcardWithId[];
  courseSectionSlug?: string;
  subSectionSlug?: string;
}

/**
 * Renders a page with a list of all flashcards in a specific course, course section, or sub section
 */
export default function FlashcardsPage({
  courseId,
  flashcards,
  courseSectionSlug,
  subSectionSlug,
}: FlashcardsPageProps) {
  const slug = courseSectionSlug
    ? subSectionSlug
      ? `/${courseSectionSlug}/${subSectionSlug}`
      : `/${courseSectionSlug}`
    : "";

  const { width } = useWindowDimensions();

  return (
    <>
      <SEO
        title="Flashcards"
        path={`course/${courseId}/flashcards`}
        description=""
      />
      <div className="mt-28">
        <h1 className="text-center font-bold text-4xl mb-2">Flashcards</h1>
        <ButtonGroup
          className="text-center"
          fixedWidth="175px"
          vertical={width < 740}
          spaced
        >
          <LinkButton href={`/course/${courseId}/study${slug}`}>
            Study
          </LinkButton>
          {/* <LinkButton href={`/course/${courseId}/games${slug}`}>
            Games
          </LinkButton> */}
          <LinkButton href={`/course/${courseId}/add-flashcards${slug}`}>
            Add Flashcards
          </LinkButton>
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
