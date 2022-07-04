import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import IconTooltip from 'components/IconTooltip';
import RenderRichText from '../../RenderRichText';
import { ExtendedSlateElement } from 'editor/types';
import { useState } from 'react';

interface FlashCardLinkComponentProps {
  /**
   * Attributes passed to the `<span>` element
   */
  attributes: any;
  /**
   * Children of the `<span>` element
   */
  children: JSX.Element[] | JSX.Element;
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
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  // const [flashcard] = useAsyncState<FlashCard>(
  //   () => backendFetch('GET', `decks/flashcard/find-universal/${element.flashcardUID}/`),
  //   [], undefined,
  //   popoverIsOpen,
  // );
  const flashcard = {} as any;

  const editFlashcard = async (e: MouseEvent) => {
    e.preventDefault();
    window.open(`/deck/${flashcard?.parent_deck_id}/flashcards/${flashcard?.id}/edit/`, '_blank');
  }

  return (
    <OverlayTrigger
      overlay={
        <Popover id='flashcard-preview-popover' style={{ minWidth: '200px' }}>
          <div>
            <Popover.Header as='h3' className='text-center'>
              Flashcard Preview
              {flashcard?.id && <IconTooltip
                tooltip='Edit this flashcard'
                // @ts-ignore
                onClick={editFlashcard}
                faClass='fas fa-external-link-alt'
                className='float-right'
                id={`edit-flashcard-${flashcard.id}`}
              />}
            </Popover.Header>
            {flashcard?.data ? <Popover.Body>
              {flashcard && flashcard.data.fields.map((field, i) => <>
                <RenderRichText text={field} />
                {i !== flashcard.data.fields.length - 1 && <hr />}
              </>)}
              {!flashcard && <p>Loading…</p>}
            </Popover.Body> : <Popover.Body>Flashcard not found</Popover.Body>}
          </div>
        </Popover>
      }
      delay={{ show: 0, hide: 1000 }}
      onToggle={show => setPopoverIsOpen(show)}
      placement='bottom'
    >
      <span {...attributes} className='flashcard-link'>
        {children}
      </span>
    </OverlayTrigger>
  );
}
