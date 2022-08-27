import IconTooltip from "@/components/IconTooltip";
import RenderRichText from "@/editor/RenderRichText";
import classNames from "@/helpers/classNames";
import { Flashcard } from "@/types";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import type { Node } from "slate";

interface RenderFlashcardProps {
  /**
   * Flashcard to display
   */
  flashcard: Flashcard;
  /**
   * ID of the course the flashcard is located in
   */
  courseId: string;
  /**
   * Additional classes to apply to the flashcard
   */
  className: string;
}

/**
 * Displays a flashcard
 */
export default function RenderFlashcard({
  flashcard,
  courseId,
  className,
}: RenderFlashcardProps) {
  return (
    <div
      className={classNames(
        "bg-alu-light-gray border-2 border-alu-mid-gray rounded-xl min-h-[10rem]",
        className
      )}
    >
      {courseId && (
        <IconTooltip
          faIcon={faPencil}
          tooltip="Edit"
          className="absolute mt-2 ml-2"
          onClick={() =>
            window.open(
              `/course/${courseId}/edit-flashcard/${flashcard.id}`,
              "_blank"
            )
          }
        />
      )}
      <div className="w-full h-full flex min-h-[10rem]">
        {flashcard.fields.value.map((field: Node[], i: number) => (
          <div
            key={i}
            className="flex py-4 px-5 w-1/2 justify-center items-center border-r-4 border-r-alu-mid-gray last:border-none"
          >
            <RenderRichText text={field} />
          </div>
        ))}
      </div>
    </div>
  );
}
