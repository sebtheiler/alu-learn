import React, {useState, useEffect} from 'react';
import {apiDeckSharedList} from '../lookup';
import {Deck} from './detail';
import { errorHandler } from '../utils';


// Paginated list of function for loading raw-list of decks
// This is NOT used on the user's home page
// TODO: clean up this function
export function DecksList(props) {
  const {newDecks, username, currentUsername} = props;
  const [decksInit, setDecksInit] = useState([newDecks ? newDecks : []]);
  const [decks, setDecks] = useState([]);
  const [decksDidSet, setDecksDidSet] = useState(false);

  // If there are any new decks, add them
  useEffect(() => {
    const final = [...newDecks].concat(decksInit);
    if (final.length !== decks.length) {
      setDecks(final);
    };
  }, [newDecks, decksInit, decks.length]);

  // Send request to the API to get decks and URLs for pagination
  useEffect(() => {
    if (decksDidSet === false) {
      apiDeckSharedList(username, (response, status) => {
        if (status === 200) {
          setDecksInit(response);
          setDecks(response);
          setDecksDidSet(true);
        } else {
          // Error getting shared decks
          errorHandler(response, status, 1008);
        };
      });
    };
  }, [decksInit, decksDidSet, setDecksDidSet, username]);

  return (
    <React.Fragment>
      {decks.map((deck, index) => {
        return <Deck
                  deck={deck}
                  key={`${index}-${deck.id}`}
                  currentUsername={currentUsername}
                  className='my-5 py-5 border bg-white text-dark'
                />;
      })}
    </React.Fragment>);
};