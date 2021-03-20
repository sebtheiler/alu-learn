import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { apiDeckSearch } from '../lookup';
import { DeckDetail } from '../decks';
import { errorHandler } from '../utils';
import { SharedDeck } from '../decks/types';

export function DeckSearchComponent(_props) {
  const searchQueryRef = React.createRef<HTMLInputElement>();
  const [searchBtnLabel, setSearchBtnLabel] = useState<string>('Search!');
  const [currentQuery, setCurrentQuery] = useState('');

  const [retrievedDecks, setRetrievedDecks] = useState<SharedDeck[]>([]);
  const [didSearch, setDidSearch] = useState(false);
  const [nextUrl, setNextUrl] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!searchQueryRef) return;
    setSearchBtnLabel('Loading...')
    setCurrentQuery(searchQueryRef!.current!.value);
    setDidSearch(true);
    apiDeckSearch(searchQueryRef!.current!.value, (response, status) => {
      if (status === 200) {
        setNextUrl(response.next ?? '');
        setRetrievedDecks(response.results);
      } else {
        // Error performing deck search
        errorHandler(response, status, 1011);
      }
    });
    setSearchBtnLabel('Search!');
  }

  const handleLoadNext = (event) => {
    event.preventDefault();
    if (nextUrl !== null) {
      apiDeckSearch(currentQuery, (response, status) => {
        if (status === 200) {
          setNextUrl(response.next ?? '');
          const totalResults = [...retrievedDecks].concat(response.results);
          setRetrievedDecks(totalResults);
        } else {
          // Error handling next set of decks (pagination)
          errorHandler(response, status, 1012);
        }
      }, nextUrl);
    }
  }

  return (
    <>
      <div className='text-center mt-4'>
        <h2>Search for Decks</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Control
            type='text'
            ref={searchQueryRef}
            className='w-50 mx-auto mb-2'
            required
          />
          <Button type='submit' className='mb-5'>
            {searchBtnLabel}
          </Button>
        </Form>
      </div>
      <div className='w-50 mx-auto'>
        {retrievedDecks.length > 0 || !didSearch ?
          retrievedDecks.map((deck, index) => {
            return (
              <React.Fragment key={`deck-${index}`}>
                <DeckDetail
                  deck={deck}
                  hideExtras={true}
                  titleLink={true}
                  textAlign='left'
                />
                <hr />
              </React.Fragment>
            );
          })
        :
          <p className='text-center'>No decks found</p>
        }
      </div>
      <div className='text-center'>
        {nextUrl.length > 0 ?
          <Button
            onClick={handleLoadNext}
            variant='outline-primary'
            size='lg'
          >
            Load more decks
          </Button>
        : null}
      </div>
    </>
  );
}
