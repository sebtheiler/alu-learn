import SubSectionSettings from "./SubSectionSettings";
import LinkButton from "atoms/LinkButton";
import { cleanTitle } from "helpers/cleanTitle";
import CoursePageContext from "pages/CoursePage/context";
import { useContext } from "react";
import type { CourseSection, SubSection } from "types";

interface SubSectionPopoverProps {
  subSection: SubSection;
  courseSection: CourseSection;
}

export default function SubSectionPopover({
  subSection,
  courseSection,
}: SubSectionPopoverProps) {
  const { course } = useContext(CoursePageContext);
  return (
    <>
      <div>
        <h4 className="text-center font-bold text-lg mb-3">
          {subSection.title}
        </h4>
        <SubSectionSettings subSection={subSection} />
      </div>
      <LinkButton
        href={`/course/${course?.id}/learn/${cleanTitle(
          courseSection.title as string
        )}/${cleanTitle(subSection.title as string)}`}
        block
      >
        Learn Content
      </LinkButton>
      <LinkButton
        href={`/course/${course?.id}/flashcards/${cleanTitle(
          courseSection.title as string
        )}/${cleanTitle(subSection.title as string)}`}
        className="mt-2"
        block
      >
        Flashcards
      </LinkButton>
      <LinkButton
        href={`/course/${course?.id}/practice/${cleanTitle(
          courseSection.title as string
        )}/${cleanTitle(subSection.title as string)}`}
        className="mt-2"
        block
      >
        Practice Problems
      </LinkButton>
      <LinkButton
        href={`/course/${course?.id}/games/${cleanTitle(
          courseSection.title as string
        )}/${cleanTitle(subSection.title as string)}`}
        className="mt-2"
        block
      >
        Games
      </LinkButton>
    </>
  );
}
