import React, {useState} from 'react';
import {Button, Form} from 'react-bootstrap';
import {apiDeckSearch} from '../lookup';
import {DeckDetail} from '../decks';

export function DeckSearchComponent(props) {
  // const {} = props;
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
        console.log(response, status);
        alert('Error searching for decks!');
      }
    });
    setSearchBtnLabel('Search!');
  };

  return (
    <div>
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
              <div>
                <DeckDetail
                  deck={deck}
                  key={`deck-${index}`}
                  hideExtras={true}
                  titleLink={true}
                  textAlign='left'
                />
                <hr />
              </div>
            );
          })
        }
      </div>
    </div>
  );
}