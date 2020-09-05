import React, {useState, useEffect} from 'react';
import {apiDeckHome} from '../lookup';
import {Deck} from './detail';
import {Button} from 'react-bootstrap';
import { errorHandler } from '../utils';


// Paginated function for decks that should appear
// in the user's home page
export function DecksHomeList(props) {
  const {newDecks, username} = props;
  const [decksInit, setDecksInit] = useState([newDecks ? newDecks : []]);
  const [decks, setDecks] = useState([]); // Current set of decks
  const [decksDidSet, setDecksDidSet] = useState(false);
  const [nextUrl, setNextUrl] = useState(null); // URLS used for pagination

  // If there are any new decks, add them
  useEffect(() => {
    const final = decksInit;//[...newDecks].concat(decksInit);
    if (final.length !== decks.length) {
      setDecks(final);
    };
  }, [newDecks, decksInit, decks.length]);

  // Send request to the API to get decks and URLs for pagination
  useEffect(() => {
    if (decksDidSet === false) {
      apiDeckHome((response, status) => {
        if (status === 200) {
          setNextUrl(response.next);
          setDecksInit(response.results);
          setDecks(response.results);
          setDecksDidSet(true);
        } else {
          // Error getting deck
          errorHandler(response, status, 1006);
        };
      });
    };
  }, [decksInit, decksDidSet, setDecksDidSet, username]);

  // Loads next set of decks (pagination)
  const handleLoadNext = (event) => {
    event.preventDefault();
    if (nextUrl !== null) {
      apiDeckHome((response, status) => {
        if (status === 200) {
          setNextUrl(response.next);
          const newDecks = [...decks].concat(response.results)
          setDecksInit(newDecks);
          setDecks(newDecks);
        } else {
          // Error handling next set of decks (pagination)
          errorHandler(response, status, 1007);
        };
      }, nextUrl);
    };
  };

  return (
    <>
      <div className='card-deck text-center mx-auto justify-content-center'>
        {decks.map((deck, index) => {
          return <Deck 
                    deck={deck}
                    currentUsername={username}
                    key={`${index}-${deck.id}`}
                    className='mb-3 mx-1 border bg-white text-dark'
                  />;
        })}
      </div>
      <div className='text-center'>
        {nextUrl !== null ?
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
};