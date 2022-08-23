import SubSectionSettings from "./SubSectionSettings";
import LinkButton from "atoms/LinkButton";
import { cleanTitle } from "helpers/cleanTitle";
import CoursePageContext from "pages/CoursePage/context";
import { useContext } from "react";
import type { MainSection, SubSection } from "types";

interface SubSectionPopoverProps {
  subSection: SubSection;
  mainSection: MainSection;
}

export default function SubSectionPopover({
  subSection,
  mainSection,
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
          mainSection.title as string
        )}/${cleanTitle(subSection.title as string)}`}
        block
      >
        Learn Content
      </LinkButton>
      <LinkButton
        href={`/course/${course?.id}/flashcards/${cleanTitle(
          mainSection.title as string
        )}/${cleanTitle(subSection.title as string)}`}
        className="mt-2"
        block
      >
        Flashcards
      </LinkButton>
      <LinkButton
        href={`/course/${course?.id}/practice/${cleanTitle(
          mainSection.title as string
        )}/${cleanTitle(subSection.title as string)}`}
        className="mt-2"
        block
      >
        Practice Problems
      </LinkButton>
      <LinkButton
        href={`/course/${course?.id}/games/${cleanTitle(
          mainSection.title as string
        )}/${cleanTitle(subSection.title as string)}`}
        className="mt-2"
        block
      >
        Games
      </LinkButton>
    </>
  );
}
