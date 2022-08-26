import RenderRichText from "../../RenderRichText";
import Popover from "@/atoms/Popover";
import IconTooltip from "@/components/IconTooltip";
import type { Flashcard } from "@/types";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

interface FlashcardLinkComponentProps {
  /**
   * Attributes passed to the `<span>` element
   */
  attributes: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >;
  /**
   * Children of the `<span>` element
   */
  children: React.ReactNode;
}

/**
 * Render a link component in the SlateJS editor
 */
export default function FlashcardLinkComponent({
  attributes,
  children,
}: FlashcardLinkComponentProps) {
  // const [flashcard] = useAsyncState<Flashcard>(
  //   () => backendFetch('GET', `decks/flashcard/find-universal/${element.flashcardUID}/`),
  //   [], undefined,
  //   popoverIsOpen,
  // );
  const flashcard = {} as Partial<Flashcard>;

  const editFlashcard = async (
    e: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    e.preventDefault();
    window
      .open
      // `/deck/${flashcard?.parent_deck_id}/flashcards/${flashcard?.id}/edit/`,
      // "_blank"
      ();
  };

  return (
    <Popover
      popover={
        <div>
          <h3 className="text-md text-center font-bold">Flashcard Preview</h3>
          <hr className="my-3" />
          {flashcard?.id && (
            <IconTooltip
              tooltip="Edit this flashcard"
              onClick={editFlashcard}
              faIcon={faExternalLinkAlt}
              className="float-right"
            />
          )}
          {flashcard.fields.map((field, i: number) => (
            <>
              <RenderRichText text={field} />
              {i !== (flashcard.fields.length ?? 0) - 1 && <hr />}
            </>
          ))}
        </div>
      }
    >
      <span {...attributes} className="text-alu-light-purple font-bold">
        {children}
      </span>
    </Popover>
  );
}
