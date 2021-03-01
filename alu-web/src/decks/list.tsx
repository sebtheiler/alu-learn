import React from 'react';
import { apiDeckSharedList } from '../lookup';
import { VariousCard } from './detail';
import { useApiObjectHook } from '../utils';
import { SharedDeck } from './types';


// Paginated list of function for loading list
// of decks shared with the current user
// (Either public or friends-only and the current user is a friend)
export function DeckPublicList({ username, currentUsername }) {
  const [decks] = useApiObjectHook<SharedDeck[]>(apiDeckSharedList, 200, 1008, [username]);

  return (
    <>
      {decks && decks.length > 0 ? decks.map((deck, index) =>
        <VariousCard
          card={deck}
          type='deck'
          key={`${index}-${deck.id}`}
          currentUsername={currentUsername}
          className='my-5 py-5 border bg-white text-dark'
          noButtons
        />
      ) : <p>This user has no public decks</p>}
    </>
  );
}
