import SubSectionPopover from "./SubSectionPopover";
import Popover from "@/atoms/Popover";
import type { CourseSection, SubSection } from "@/types";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

const currentlyStudiedColor = "#5ed149";
const previouslyStudiedColor = "#FDCE29";

interface RenderSubSectionProps {
  /**
   * Sub section to display
   */
  subSection: SubSection;
  /**
   * The parent course section
   */
  courseSection: CourseSection;
  /**
   * Additional styling
   */
  style?: React.CSSProperties;
  /**
   * Is the sub section assigned to the user?
   */
  assigned?: boolean;
}

/**
 * Renders a sub section for use in displaying a course section
 */
export default function RenderSubSection({
  subSection,
  courseSection,
  style,
  assigned,
}: RenderSubSectionProps) {
  return (
    <div
      className="mx-auto my-4 z-10"
      title={
        assigned ? "Your teacher has assigned this sub section" : undefined
      }
    >
      <div style={style}>
        <p className="text-center rounded-lg max-w-xs mx-auto font-bold">
          {assigned && (
            <FontAwesomeIcon
              icon={faClipboard}
              className="text-yellow-500 mr-1"
            />
          )}
          {subSection?.title}
        </p>
        <div className="w-24 h-24 mx-auto sub-section-drag-handle">
          <Popover
            popover={
              <SubSectionPopover
                subSection={subSection}
                courseSection={courseSection}
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
                    src="/assets/flashcards-gray.png"
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
