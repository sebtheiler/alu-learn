import Button from "alu-ui/src/Button";
import ButtonGroup from "alu-ui/src/ButtonGroup";
import LinkButton from "alu-ui/src/LinkButton";
import Ad from "@/components/Ad";
import FlashcardList from "@/courses/FlashcardList";
import SEO from "@/helpers/SEO";
import updateURLParameter from "helpers-lib/src/updateURLParameter";
import useWindowDimensions from "helpers-lib/src/hooks/useWindowDimensions";
import type { Course, Flashcard } from "@/types";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";

type FlashcardWithId = Flashcard & { id: string };

export interface FlashcardsPageProps {
  course: Course;
  title: string;
  /**
   * Is this page displaying only starred flashcards?
   */
  isStarred?: boolean;
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
  isStarred = false,
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
  const router = useRouter();
  const { page: rawPage } = router.query;
  const page = parseInt((rawPage as string | undefined) ?? "0");

  return (
    <>
      <SEO
        title={`${title} Flashcards`}
        path={`course/${course.id}/flashcards${slug}`}
        description={
          course.seoDescription ??
          `${title} study guide flashcards. Learn ${course.title} for free with spaced repetition flashcards and games`
        }
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
      <div className="mt-28">
        <h1 className="text-center font-bold text-4xl mb-2">
          {title} Flashcards
        </h1>
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
            <FontAwesomeIcon
              icon={faArrowLeft}
              size="2x"
              className="text-gray-600"
            />
          </Link>
        </div>
        {isStarred && (
          <p className="text-center mb-3">
            Add flashcards to this list by pressing the &quot;star&quot; button
            when studying
          </p>
        )}
        <ButtonGroup
          className="text-center"
          fixedWidth="175px"
          vertical={width === 0 ? false : width < 740}
          spaced
        >
          <LinkButton
            href={
              isStarred
                ? `/course/${course.id}/starred/study`
                : `/course/${course.id}/study${slug}`
            }
          >
            Study
          </LinkButton>
          {editAccess && !isStarred && (
            <LinkButton href={`/course/${course.id}/add-flashcards${slug}`}>
              Add Flashcards
            </LinkButton>
          )}
        </ButtonGroup>
        <div className="container mx-auto px-4 mt-4">
          {flashcards.length > 0 ? (
            <FlashcardList flashcards={flashcards} canEdit={editAccess} />
          ) : (
            <p className="text-center">
              This section doesn&apos;t have any flashcards yet
            </p>
          )}
          <ButtonGroup className="my-3 text-center" fixedWidth="200px" spaced>
            {page > 0 && (
              <Button
                onClick={() =>
                  router.push(
                    updateURLParameter(
                      router.asPath,
                      "page",
                      (page - 1).toString()
                    )
                  )
                }
              >
                Previous Page
              </Button>
            )}
            {flashcards.length === 200 && (
              <Button
                onClick={() =>
                  router.push(
                    updateURLParameter(
                      router.asPath,
                      "page",
                      (page + 1).toString()
                    )
                  )
                }
              >
                Next Page
              </Button>
            )}
          </ButtonGroup>
          <footer>
            <Ad adType="FLASHCARD_LIST_BOTTOM" />
          </footer>
        </div>
      </div>
    </>
  );
}
