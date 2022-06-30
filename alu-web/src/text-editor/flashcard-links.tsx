import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import IconTooltip from '../decks/buttons/IconTooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Tooltip from 'react-bootstrap/Tooltip';
import { Editor, Transforms, Range, Location } from 'slate';
import { FlashCard } from '../decks/types';
import { ReactEditor } from 'slate-react';
import { RenderRichText, useDebounce } from '../utils/utils';
import { backendFetch, PaginatedResponse, useAsyncState } from '../lookup/lookup';
import { flattenNodes } from '.';
import { useEffect, useState } from 'react';
import './editor.scss';

export const withFlashCardLinks = (editor: ReactEditor) => {
  const { isInline } = editor;

  editor.isInline = element => {
    // @ts-ignore
    return element.type === 'flashcard-link' ? true : isInline(element);
  }

  return editor;
}

export const FlashCardLinkElement = ({ attributes, children, element }) => {
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const [flashcard] = useAsyncState<FlashCard>(
    () => backendFetch('GET', `decks/flashcard/find-universal/${element.flashcardUID}/`),
    [], undefined,
    popoverIsOpen,
  );

  const editFlashcard = async e => {
    e.preventDefault();
    window.open(`/deck/${flashcard?.parent_deck_id}/flashcards/${flashcard?.id}/edit/`, '_blank');
  }

  return (
    <OverlayTrigger
      overlay={
        <Popover id='flashcard-preview-popover' style={{ minWidth: '200px' }}>
          <div>
            <Popover.Title as='h3' className='text-center'>
              Flashcard Preview
              {flashcard?.id && <IconTooltip
                tooltip='Edit this flashcard'
                onClick={editFlashcard}
                faClass='fas fa-external-link-alt'
                className='float-right'
                id={`edit-flashcard-${flashcard.id}`}
              />}
            </Popover.Title>
            {flashcard?.data ? <Popover.Content>
              {flashcard && flashcard.data.fields.map((field, i) => <>
                <RenderRichText text={field} />
                {i !== flashcard.data.fields.length - 1 && <hr />}
              </>)}
              {!flashcard && <p>Loading…</p>}
            </Popover.Content> : <Popover.Content>Flashcard not found</Popover.Content>}
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

const insertFlashCardLink = (editor: ReactEditor, flashcard: FlashCard) => {
  // @ts-ignore
  if (editor.blurSelection) {
    // @ts-ignore
    Transforms.select(editor, editor.blurSelection as Location);
  }
  if (editor.selection) {
    wrapFlashCardLink(editor, flashcard);
  }
  document.body.click();
  ReactEditor.focus(editor);
}

const isFlashCardLinkActive = (editor: ReactEditor) => {
  // @ts-ignore
  const [flashcardLink] = Editor.nodes(editor, { match: n => n.type === 'flashcard-link' });
  return !!flashcardLink;
}

const unwrapFlashCardLink = (editor: ReactEditor) => {
  // @ts-ignore
  Transforms.unwrapNodes(editor, { match: n => n.type === 'flashcard-link' });
}

const wrapFlashCardLink = (editor: ReactEditor, flashcard: FlashCard) => {
  if (isFlashCardLinkActive(editor)) {
    unwrapFlashCardLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const flashcardLink = {
    type: 'flashcard-link',
    flashcardUID: flashcard.universal_flashcard_id ?? flashcard.id,
    children: isCollapsed ? [{ text: flattenNodes(flashcard.data.fields[0]) }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, flashcardLink);
  } else {
    Transforms.wrapNodes(editor, flashcardLink, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
}

export function FlashCardLinkButton({ editor, untabbable, enabled }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedFlashcards, setSearchedFlashcards] = useState<FlashCard[]>([]);
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 750);

  useEffect(() => {
    if (debouncedSearchTerm === searchTerm && searchTerm.length > 0) {
      setIsSearching(true);
      backendFetch<PaginatedResponse<FlashCard>>('POST', 'decks/flashcard/search/', {
        contains_text: searchTerm,
      }).then(resp => {
        setSearchedFlashcards(resp.results);
        setIsSearching(false);
      });
    } else {
      setSearchedFlashcards([]);
    }
  }, [debouncedSearchTerm, searchTerm]);

  return (
    <div>
      <OverlayTrigger
        overlay={
          <Tooltip id='flashcard-link-tooltip'>
            Insert Flashcard Link
          </Tooltip>
        }
      >
        <div>
          <OverlayTrigger
            overlay={
              <Popover id='study-section-popover'>
                <Popover.Title as='h3' className='text-center'>
                  Insert Flashcard Link<br />
                  {!enabled && <small><strong><a href='/pro/'>(pro-only)</a></strong><br /></small>}
                  <small>This will allow you to see a preview on hover when studying</small>
                </Popover.Title>
                <Popover.Content>
                  <div>
                    <Form.Label>Search for Flashcard</Form.Label>
                    <Form.Control
                      onChange={e => setSearchTerm(e.target.value)}
                      disabled={!enabled}
                    />
                    {!enabled && <p><strong>Upgrade to <a href='/pro/'>pro</a> to use flashcard links</strong></p>}
                    {isSearching && <p className='mt-3'>Loading…</p>}
                  </div>
                  <hr />
                  <div>
                    {searchedFlashcards.map(flashcard =>
                      <p
                        className='searched-item'
                        onClick={() => insertFlashCardLink(editor, flashcard)}
                        key={flashcard.id}
                      >
                        {flattenNodes(flashcard.data.fields[0])}
                      </p>
                    )}
                  </div>
                </Popover.Content>
              </Popover>
            }
            placement='bottom'
            trigger='click'
            rootClose
          >
            <Button
              variant='editor'
              style={{
                background: 'rgba(0, 0, 0, 0)',
                border: 'none',
              }}
              tabIndex={untabbable ? -1 : undefined}
              className='text-dark'
            >
              <i className='fas fa-anchor' />
            </Button>
          </OverlayTrigger>
        </div>
      </OverlayTrigger>
    </div>
  );
}
