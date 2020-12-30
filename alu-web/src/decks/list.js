import React, { useState, useEffect } from 'react';
import { apiDeckSharedList } from '../lookup';
import { Deck } from './detail';
import { errorHandler } from '../utils';


// Paginated list of function for loading list
// of decks shared with the current user
// (Either public or friends-only and the current user is a friend)
export function DeckPublicList(props) {
  const {username, currentUsername} = props;
  const [decks, setDecks] = useState([]);
  const [decksDidSet, setDecksDidSet] = useState(false);

  // Send request to the API to get decks and URLs for pagination
  useEffect(() => {
    if (decksDidSet === false) {
      apiDeckSharedList(username, (response, status) => {
        if (status === 200) {
          setDecks(response);
          setDecksDidSet(true);
        } else {
          // Error getting shared decks
          errorHandler(response, status, 1008);
        }
      });
    }
  }, [decksDidSet, setDecksDidSet, username, setDecks]);

  return (
    <>
      {decks.length > 0 ? decks.map((deck, index) =>
        <Deck
          deck={deck}
          key={`${index}-${deck.id}`}
          currentUsername={currentUsername}
          className='my-5 py-5 border bg-white text-dark'
          noButtons
        />
      ) : <p>This user has no public decks</p>}
    </>
  );
}
