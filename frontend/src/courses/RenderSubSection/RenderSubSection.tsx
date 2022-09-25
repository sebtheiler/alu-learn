import SubSectionPopover from "./SubSectionPopover";
import Popover from "@/atoms/Popover";
import type { Assignment, CourseSection, SubSection } from "@/types";
import Image from "next/image";

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
  /**
   * Additional styling
   */
  style?: React.CSSProperties;
}

/**
 * Renders a sub section for use in displaying a course section
 */
export default function RenderSubSection({
  subSection,
  courseSection,
  assignment,
  style,
}: RenderSubSectionProps) {
  return (
    <div className="mx-auto my-4 z-10">
      <div style={style}>
        <p className="text-center rounded-lg max-w-xs mx-auto font-bold">
          {subSection?.title}
        </p>
        <div className="w-24 h-24 mx-auto sub-section-drag-handle">
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
                <div className="flex items-center justify-center rounded-full h-full w-full bg-gray-100 border-4 border-gray-200">
                  {/* <FlashcardsSVG width="40px" height="40px" viewBox="0 0 512 512" /> */}
                  <Image
                    src="/assets/flashcards.png"
                    width={40}
                    height={40}
                    alt=""
                  />
                </div>
              </div>
            </div>
          </Popover>
        </div>
      </div>
    </div>
  );
}
