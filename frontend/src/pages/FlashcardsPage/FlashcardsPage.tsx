import ButtonGroup from "@/atoms/ButtonGroup";
import LinkButton from "@/atoms/LinkButton";
import FlashcardList from "@/courses/FlashcardList";
import SEO from "@/helpers/SEO";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import type { Course, Flashcard } from "@/types";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

type FlashcardWithId = Flashcard & { id: string };

export interface FlashcardsPageProps {
  course: Course;
  title: string;
  flashcardsHasPart: any;
  flashcards: FlashcardWithId[];
  courseSectionSlug?: string;
  subSectionSlug?: string;
  editAccess: boolean;
}

/**
 * Renders a page with a list of all flashcards in a specific course, course section, or sub section
 */
export default function FlashcardsPage({
  course,
  title,
  flashcardsHasPart,
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

  return (
    <>
      <SEO
        title={`${title} Flashcards`}
        path={`course/${course.id}/flashcards${slug}`}
        description={
          course.seoDescription ??
          `${title} study guide flashcards. Learn ${course.title} for free with spaced repetition flashcards and games`
        } // TODO: SUPER IMPORTANT
        seoJson={{
          "@context": "https://schema.org/",
          "@type": "Quiz",
          about: {
            "@type": "Thing",
            name: title,
          },
          educationalAlignment: [
            {
              "@type": "AlignmentObject",
              alignmentType: "educationalSubject",
              targetName: course.seoSubject ?? title,
            },
          ],
          hasPart: flashcardsHasPart,
        }}
      />
      <script type="application/ld+json"></script>
      <div className="mt-28">
        <h1 className="text-center font-bold text-4xl mb-2">Flashcards</h1>
        <div className="absolute left-6 top-28">
          <Link
            href={
              subSectionSlug
                ? `/course/${course.id}/flashcards/${courseSectionSlug}`
                : courseSectionSlug
                ? `/course/${course.id}/flashcards`
                : `/course/${course.id}`
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
          <LinkButton href={`/course/${course.id}/study${slug}`}>
            Study
          </LinkButton>
          {/* <LinkButton href={`/course/${course.id}/games${slug}`}>
            Games
          </LinkButton> */}
          {editAccess && (
            <LinkButton href={`/course/${course.id}/add-flashcards${slug}`}>
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
