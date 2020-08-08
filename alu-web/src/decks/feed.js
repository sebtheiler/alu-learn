import React, {useState, useEffect} from 'react';
import {apiDeckFeed} from '../lookup';
import {Deck} from './detail';


// Paginated function for decks that should appear
// in the user's home page
export function DecksFeedList(props) {
  const [decksInit, setDecksInit] = useState([props.newDecks ? props.newDecks : []]); // Initial set of decks
  const [decks, setDecks] = useState([]); // Current set of decks
  const [decksDidSet, setDecksDidSet] = useState(false);
  const [nextUrl, setNextUrl] = useState(null); // URLS used for pagination

  // If there are any new decks, add them
  useEffect(() => {
    const final = [...props.newDecks].concat(decksInit);
    if (final.length !== decks.length) {
      setDecks(final);
    };
  }, [props.newDecks, decksInit, decks.length]);

  // Send request to the API to get decks and URLs for pagination
  useEffect(() => {
    if (decksDidSet === false) {
      const handleDeckListLookup = (response, status) => {
        if (status === 200) {
          setNextUrl(response.next);
          setDecksInit(response.results);
          setDecksDidSet(true);
        } else {
          alert('There was an error');
        };
      };
      apiDeckFeed(handleDeckListLookup);
    };
  }, [decksInit, decksDidSet, setDecksDidSet, props.username]);

  // Loads next set of decks (pagination)
  const handleLoadNext = (event) => {
    event.preventDefault();
    if (nextUrl !== null) {
      apiDeckFeed((response, status) => {
        if (status === 200) {
          setNextUrl(response.next);
          const newDecks = [...decks].concat(response.results)
          setDecksInit(newDecks);
          setDecks(newDecks);
        } else {
          alert('There was an error');
        };
      }, nextUrl);
    };
  };

  return (<React.Fragment>{decks.map((deck, index) => {
    return <Deck deck={deck} key={`${index}-${deck.id}`} className='my-5 py-5 border bg-white text-dark'/>;
  })}
  { nextUrl !== null && <button onClick={handleLoadNext} className='btn btn-outline-primary'>Load more decks</button>}
  </React.Fragment>);
};