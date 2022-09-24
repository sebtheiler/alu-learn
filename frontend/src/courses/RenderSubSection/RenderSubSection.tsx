import SubSectionPopover from "./SubSectionPopover";
import Popover from "@/atoms/Popover";
import type { Assignment, CourseSection, SubSection } from "@/types";

const currentlyStudiedColor = "#5ed149";
const previouslyStudiedColor = "#FDCE29";

interface RenderSubSectionProps {
  /**
   * Sub section to display
   */
  subSection: SubSection;
  /**
   * The parent course section. If not specified, `assignment` must be specified
   */
  courseSection?: CourseSection;
  /**
   * The assignment the sub section is part of. If not specified, `courseSection` must be specified
   */
  assignment?: Assignment;
}

/**
 * Renders a sub section for use in displaying a course section
 */
export default function RenderSubSection({
  subSection,
  courseSection,
  assignment,
}: RenderSubSectionProps) {
  return (
    <div className="md:w-1/3 lg:w-1/4 mx-auto my-1">
      <div className="w-40 h-40 mx-auto">
        <Popover
          popover={
            <SubSectionPopover
              subSection={subSection}
              courseSection={courseSection}
              assignment={assignment}
            />
          }
          trigger="click"
          placement="bottom"
          arrow
        >
          <div
            className="w-full h-full rounded-full flex items-center text-center border-4 border-gray-200 hover:scale-110 hover:shadow-lg transition hover:cursor-pointer"
            role="button"
            style={{
              background: `conic-gradient(${previouslyStudiedColor} ${
                /*subSection?.totalPercentComplete ?? 0*/ 0 * 100
              }%, transparent 0%)`,
            }}
          >
            <div
              className="w-full h-full flex items-center rounded-full p-2"
              style={{
                background: `conic-gradient(${currentlyStudiedColor} ${
                  /*subSection?.percentComplete ?? 0*/ 0 * 100
                }%, transparent 0%)`,
              }}
            >
              <div className="flex items-center rounded-full h-full w-full bg-gray-100 border-4 border-gray-200">
                <p className="mx-auto">{subSection?.title}</p>
              </div>
            </div>
          </div>
        </Popover>
      </div>
    </div>
  );
}
