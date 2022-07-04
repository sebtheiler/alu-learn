import flattenNodes from '@helpers/flattenNodes';
import { FlashCard } from '@types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactEditor } from 'slate-react';
import { faAnchor } from '@fortawesome/free-solid-svg-icons';
import { insertFlashCardLink } from './helpers';
import { useDebounce } from 'hooks/useDebounce';
import { useState } from 'react';

interface FlashCardLinkButtonProps {
  /**
   * Editor into which to insert the flashcard link
   */
  editor: ReactEditor;
  /**
   * Is the button selectable with tab?
   */
  tabbable: boolean;
  /**
   * Is the user a pro user? If not, they cannot insert flashcard links
   */
  isPro: boolean;
}

/**
 * Displays a button to insert a flashcard link into an editor
 */
export default function FlashCardLinkButton({ editor, tabbable, isPro }: FlashCardLinkButtonProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedFlashcards, setSearchedFlashcards] = useState<FlashCard[]>([]);
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 750);

  // useEffect(() => {
  //   if (debouncedSearchTerm === searchTerm && searchTerm.length > 0) {
  //     setIsSearching(true);
  //     backendFetch<PaginatedResponse<FlashCard>>('POST', 'decks/flashcard/search/', {
  //       contains_text: searchTerm,
  //     }).then(resp => {
  //       setSearchedFlashcards(resp.results);
  //       setIsSearching(false);
  //     });
  //   } else {
  //     setSearchedFlashcards([]);
  //   }
  // }, [debouncedSearchTerm, searchTerm]);

  return (
    <OverlayTrigger
      overlay={
        <Tooltip id='flashcard-link-tooltip'>
          Insert Flashcard Link
        </Tooltip>
      }
    >
      <div className='inline'>
        <OverlayTrigger
          overlay={
            <Popover id='study-section-popover'>
              <Popover.Title as='h3' className='text-center'>
                Insert Flashcard Link<br />
                {!isPro && <small><strong><a href='/pro/'>(pro-only)</a></strong><br /></small>}
                <small>This will allow you to see a preview on hover when studying</small>
              </Popover.Title>
              <Popover.Content>
                <div>
                  <Form.Label>Search for Flashcard</Form.Label>
                  <Form.Control
                    onChange={e => setSearchTerm(e.target.value)}
                    disabled={!isPro}
                  />
                  {!isPro && <p><strong>Upgrade to <a href='/pro/'>pro</a> to use flashcard links</strong></p>}
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
          <button
            style={{
              background: 'rgba(0, 0, 0, 0)',
              border: 'none',
            }}
            tabIndex={tabbable ? undefined : -1}
            className='text-dark'
          >
            <FontAwesomeIcon icon={faAnchor} />
          </button>
        </OverlayTrigger>
      </div>
    </OverlayTrigger>
  );
}
