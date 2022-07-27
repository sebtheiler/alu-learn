import RenderRichText from "../../RenderRichText";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import IconTooltip from "components/IconTooltip";
import Popover from "atoms/Popover";
import type { ExtendedSlateElement } from "editor/types";

interface FlashCardLinkComponentProps {
  /**
   * Attributes passed to the `<span>` element
   */
  attributes: any;
  /**
   * Children of the `<span>` element
   */
  children: React.ReactNode;
  /**
   * SlateJS Element to render
   */
  element: ExtendedSlateElement;
}

/**
 * Render a link component in the SlateJS editor
 */
export default function FlashCardLinkComponent({
  attributes,
  children,
  element,
}: FlashCardLinkComponentProps) {
  // const [flashcard] = useAsyncState<FlashCard>(
  //   () => backendFetch('GET', `decks/flashcard/find-universal/${element.flashcardUID}/`),
  //   [], undefined,
  //   popoverIsOpen,
  // );
  const flashcard = {} as any;

  const editFlashcard = async (
    e: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    e.preventDefault();
    window.open(
      `/deck/${flashcard?.parent_deck_id}/flashcards/${flashcard?.id}/edit/`,
      "_blank"
    );
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
          {flashcard?.data ? (
            flashcard.data.fields.map((field, i) => (
              <>
                <RenderRichText text={field} />
                {i !== flashcard.data.fields.length - 1 && <hr />}
              </>
            ))
          ) : (
            <p>Flashcard not found</p>
          )}
        </div>
      }
    >
      <span {...attributes} className="flashcard-link">
        {children}
      </span>
    </Popover>
  );
}
