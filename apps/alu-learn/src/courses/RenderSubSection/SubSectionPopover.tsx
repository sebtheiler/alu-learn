import SubSectionSettings from "./SubSectionSettings";
import LinkButton from "alu-ui/src/LinkButton";
import CoursePageContext from "@/courses/RenderCourse/context";
import type { AssignedState, CourseSection, SubSection } from "@/types";
import { useContext, useState } from "react";
import Popover from "alu-ui/src/Popover";

interface SubSectionPopoverProps {
  subSection: SubSection;
  courseSection: CourseSection;
  children: React.ReactNode;
  /**
   * Was the parent sub section assigned for the student to study?
   */
  assigned?: AssignedState;
}

export default function SubSectionPopover({
  subSection,
  courseSection,
  assigned,
  children,
}: SubSectionPopoverProps) {
  const { course, editAccess } = useContext(CoursePageContext);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <Popover
      popover={
        <>
          <div>
            <h4 className="text-center font-bold text-lg mb-3">
              {subSection.title}
            </h4>
            <SubSectionSettings
              subSection={subSection}
              open={settingsOpen}
              setOpen={setSettingsOpen}
            />
          </div>
          <LinkButton
            href={
              `/course/${course?.id}/study/${courseSection.slug}/${subSection.slug}` +
              (assigned === "ASSIGNED_ESSENTIAL_ONLY"
                ? "?essentialOnly=true"
                : "")
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
        </>
      }
      trigger="click"
      placement="bottom"
      closeOnOutsideClick={!settingsOpen}
      arrow
    >
      {children}
    </Popover>
  );
}
