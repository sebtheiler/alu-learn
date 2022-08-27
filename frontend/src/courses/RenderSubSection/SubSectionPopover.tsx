import SubSectionSettings from "./SubSectionSettings";
import LinkButton from "@/atoms/LinkButton";
import CoursePageContext from "@/pages/CoursePage/context";
import type { CourseSection, SubSection } from "@/types";
import { useContext } from "react";

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
        href={`/course/${course?.id}/learn/${courseSection.slug}/${subSection.slug}`}
        block
      >
        Learn Content
      </LinkButton>
      <LinkButton
        href={`/course/${course?.id}/flashcards/${courseSection.slug}/${subSection.slug}`}
        className="mt-2"
        block
      >
        Flashcards
      </LinkButton>
      <LinkButton
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
      </LinkButton>
    </>
  );
}
