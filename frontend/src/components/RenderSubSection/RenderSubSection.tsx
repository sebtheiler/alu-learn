import LinkButton from "atoms/LinkButton";
import Popover from "atoms/Popover";
import { cleanTitle } from "helpers/cleanTitle";
import CoursePageContext from "pages/CoursePage/context";
import { useContext } from "react";
import type { MainSection, SubSection } from "types";

const currentlyStudiedColor = "#5ed149";
const previouslyStudiedColor = "#FDCE29";

interface RenderSubSectionProps {
  /**
   * Sub section to display
   */
  subSection: SubSection;
  /**
   * The parent main section
   */
  mainSection: MainSection;
}

/**
 * Renders a sub section for use in displaying a main section
 */
export default function RenderSubSection({
  subSection,
  mainSection,
}: RenderSubSectionProps) {
  const { course } = useContext(CoursePageContext);

  return (
    <div className="w-1/4 mx-auto my-1">
      <Popover
        popover={
          <>
            <LinkButton
              href={`/course/${course?.id}/s/${cleanTitle(
                mainSection.title as string
              )}/${cleanTitle(subSection?.title as string)}/learn`}
              block
            >
              Learn Content
            </LinkButton>
            <LinkButton
              href={`/course/${course?.id}/s/${cleanTitle(
                mainSection.title as string
              )}/${cleanTitle(subSection?.title as string)}/flashcards`}
              className="mt-2"
              block
            >
              Flashcards
            </LinkButton>
            <LinkButton
              href={`/course/${course?.id}/s/${cleanTitle(
                mainSection.title as string
              )}/${cleanTitle(subSection?.title as string)}/practice`}
              className="mt-2"
              block
            >
              Practice Problems
            </LinkButton>
          </>
        }
        trigger="click"
        placement="bottom"
        arrow
      >
        <div
          className="mx-auto w-40 h-40 rounded-full flex items-center text-center border-4 border-gray-200 hover:scale-110 hover:shadow-lg transition hover:cursor-pointer"
          role="button"
          style={{
            background: `conic-gradient(${previouslyStudiedColor} ${
              (subSection?.totalPercentComplete ?? 0) * 100
            }%, transparent 0%)`,
          }}
        >
          <div
            className="w-full h-full flex items-center rounded-full p-2"
            style={{
              background: `conic-gradient(${currentlyStudiedColor} ${
                (subSection?.percentComplete ?? 0) * 100
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
  );
}
