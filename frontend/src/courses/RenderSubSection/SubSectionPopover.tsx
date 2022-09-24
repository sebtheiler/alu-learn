import SubSectionSettings from "./SubSectionSettings";
import LinkButton from "@/atoms/LinkButton";
import CoursePageContext from "@/pages/CoursePage/context";
import ClassroomPageContext from "@/pages/StudentClassroomPage/context";
import type { Assignment, CourseSection, SubSection } from "@/types";
import { useContext } from "react";

interface SubSectionPopoverProps {
  subSection: SubSection;
  courseSection?: CourseSection;
  assignment?: Assignment;
}

export default function SubSectionPopover({
  subSection,
  courseSection,
  assignment,
}: SubSectionPopoverProps) {
  const { course, editAccess } = useContext(CoursePageContext);
  const { classroom } = useContext(ClassroomPageContext);

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
        href={
          courseSection
            ? `/course/${course?.id}/study/${courseSection.slug}/${subSection.slug}`
            : `/classroom/${classroom?.id}/study/${assignment?.id}/${subSection.slug}`
        }
        className="mt-2"
        block
      >
        Study
      </LinkButton>
      <LinkButton
        href={
          courseSection
            ? `/course/${course?.id}/flashcards/${courseSection.slug}/${subSection.slug}`
            : `/classroom/${classroom?.id}/flashcards/${assignment?.id}/${subSection.slug}`
        }
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
