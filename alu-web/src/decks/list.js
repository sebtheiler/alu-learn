import React, {useState, useEffect} from 'react';
import {apiDeckSharedList} from '../lookup';
import {Deck} from './detail';


// Paginated list of function for loading raw-list of decks
// This is NOT used on the user's home page
// TODO: clean up this function
export function DecksList(props) {
  const [decksInit, setDecksInit] = useState([props.newDecks ? props.newDecks : []]);
  const [decks, setDecks] = useState([]);
  const [decksDidSet, setDecksDidSet] = useState(false);

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
      apiDeckSharedList(props.username, (response, status) => {
        if (status === 200) {
          setDecksInit(response);
          setDecks(response);
          setDecksDidSet(true);
        } else {
          console.log(response, status);
          alert('Error getting decks');
        };
      });
    };
  }, [decksInit, decksDidSet, setDecksDidSet, props.username]);

  return (
    <React.Fragment>
      {decks.map((deck, index) => {
        return <Deck deck={deck} key={`${index}-${deck.id}`} className='my-5 py-5 border bg-white text-dark'/>;
      })}
    </React.Fragment>);
};