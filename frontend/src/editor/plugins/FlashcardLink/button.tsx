import Button from '@components/Button';
import Form from '@components/Form';
import OverlayTrigger from '@components/OverlayTrigger';
import Popover from '@components/Popover';
import Tooltip from '@components/Tooltip';
import flattenNodes from '@helpers/flattenNodes';
import { FlashCard } from '@types';
import { insertFlashCardLink } from './helpers';
import { useDebounce } from 'hooks/useDebounce';
import { useState } from 'react';

export default function FlashCardLinkButton({ editor, untabbable, enabled }) {
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
