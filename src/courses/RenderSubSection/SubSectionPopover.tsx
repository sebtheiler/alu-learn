import SubSectionSettings from "./SubSectionSettings";
import LinkButton from "@/atoms/LinkButton";
import CoursePageContext from "@/courses/RenderCourse/context";
import type { CourseSection, SubSection } from "@/types";
import { useContext } from "react";

interface SubSectionPopoverProps {
  subSection: SubSection;
  courseSection: CourseSection;
  /**
   * Was the parent sub section assigned to study?
   */
  assigned?: boolean;
}

export default function SubSectionPopover({
  subSection,
  courseSection,
  assigned,
}: SubSectionPopoverProps) {
  const { course, editAccess } = useContext(CoursePageContext);

  return (
    <>
      <div>
        <h4 className="text-center font-bold text-lg mb-3">
          {subSection.title}
        </h4>
        <SubSectionSettings subSection={subSection} />
      </div>
      {/* <LinkButton
        href={`/course/${course?.id}/learn/${courseSection.slug}/${subSection.slug}`}
        block
      >
        Learn Content
      </LinkButton> */}
      <LinkButton
        // TODO: this will erroneously only show essential flashcards even if the assignment is essential only
        href={
          `/course/${course?.id}/study/${courseSection.slug}/${subSection.slug}` +
          (assigned ? "?essentialOnly=true" : "")
        }
        className="mt-2"
        block
      >
        Study
      </LinkButton>
      <LinkButton
        href={`/course/${course?.id}/flashcards/${courseSection.slug}/${subSection.slug}`}
        className="mt-2"
        block
      >
        Flashcards
      </LinkButton>
      {courseSection && editAccess && (
        <LinkButton
          href={`/course/${course?.id}/add-flashcards/${courseSection.slug}/${subSection.slug}`}
          className="mt-2"
          block
        >
          Add Flashcards
        </LinkButton>
      )}
      {/* <LinkButton
        href={`/course/${course?.id}/practice/${courseSection.slug}/${subSection.slug}`}
        className="mt-2"
        block
      >
        Practice Problems
      </LinkButton>
      <LinkButton
        href={`/course/${course?.id}/games/${courseSection.slug}/${subSection.slug}`}
        className="mt-2"
        block
      >
        Games
      </LinkButton> */}
    </>
  );
}
