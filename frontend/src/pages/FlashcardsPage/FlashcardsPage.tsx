import ButtonGroup from "@/atoms/ButtonGroup";
import LinkButton from "@/atoms/LinkButton";
import SEO from "@/helpers/SEO";

export interface FlashcardsPageProps {
  courseId: string;
}

/**
 * Renders a page with a list of all flashcards in a specific course, course section, or sub section
 */
export default function FlashcardsPage({ courseId }: FlashcardsPageProps) {
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
          <LinkButton href={`/course/${courseId}/study`}>Study</LinkButton>
          <LinkButton href={`/course/${courseId}/games`}>Games</LinkButton>
          <LinkButton href={`/course/${courseId}/add-flashcards`}>
            Add Flashcards
          </LinkButton>
        </ButtonGroup>
      </div>
    </>
  );
}
