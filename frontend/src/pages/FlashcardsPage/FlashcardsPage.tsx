import ButtonGroup from "@/atoms/ButtonGroup";
import LinkButton from "@/atoms/LinkButton";
import FlashcardList from "@/courses/FlashcardList";
import SEO from "@/helpers/SEO";
import { Flashcard } from "@/types";

export interface FlashcardsPageProps {
  courseId: string;
  flashcards: Flashcard[];
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

  return (
    <>
      <SEO
        title="Flashcards"
        path={`course/${courseId}/flashcards`}
        description=""
      />
      <div className="mt-28">
        <h1 className="text-center font-bold text-4xl mb-2">Flashcards</h1>
        <ButtonGroup className="text-center" fixedWidth="175px" spaced>
          <LinkButton href={`/course/${courseId}/study${slug}`}>
            Study
          </LinkButton>
          <LinkButton href={`/course/${courseId}/games${slug}`}>
            Games
          </LinkButton>
          <LinkButton href={`/course/${courseId}/add-flashcards${slug}`}>
            Add Flashcards
          </LinkButton>
        </ButtonGroup>
        <div className="container mx-auto px-48 mt-4">
          <FlashcardList flashcards={flashcards} />
        </div>
      </div>
    </>
  );
}
