import React, {useState} from 'react';
import {Button, Form} from 'react-bootstrap';
import {apiDeckSearch} from '../lookup';
import {DeckDetail} from '../decks';
import { errorHandler } from '../utils';

export function DeckSearchComponent(_props) {
  const searchQueryRef = React.createRef();
  const [searchBtnLabel, setSearchBtnLabel] = useState('Search!');
  const [retrievedDecks, setRetrievedDecks] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchBtnLabel('Loading...')
    apiDeckSearch(searchQueryRef.current.value, (response, status) => {
      if (status === 200) {
        setRetrievedDecks(response);
      } else {
        // Error performing deck search
        errorHandler(response, status, 1011);
      }
    });
    setSearchBtnLabel('Search!');
  };

  return (
    <>
      <div className='text-center'>
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
        {
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
        }
      </div>
    </>
  );
};