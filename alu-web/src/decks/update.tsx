import React, { useState } from 'react';
import { errorHandler, useApiObjectHook } from '../utils';
import { apiDeckGetUpdates, apiDeckPullUpdates } from '../lookup';
import Button from 'react-bootstrap/Button';
import { Deck } from './types';
import { useObjectGet } from '../lookup/lookup';

interface UpdateDeckProps {
  deckId: string;
}
interface Update {
  title: string;
  id: number;
}
export function UpdateDeck(props: UpdateDeckProps) {
  const deckId = parseInt(props.deckId);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deck] = useObjectGet<Deck>('decks', 'deck', deckId);
  const [updates] = useApiObjectHook<Update[]>(apiDeckGetUpdates, [200], 1024, [deckId]);

  const pullHandleWrapper = (sharedDeckId: number) => {
    return (event) => {
      event.preventDefault();
      if (!isUpdating) {
        setIsUpdating(true);
        apiDeckPullUpdates(deckId, sharedDeckId, (response, status) => {
          if (status === 200) {
            window.location.href = `/decks/${deckId}/flashcards/`;
          } else {
            // Error pulling deck updates
            errorHandler(response, status, 1025);
          }
        }); 
      }
    }
  }

  return (<>
    <h1>Updating "{deck ? deck.title : 'Loading...'}"</h1>
    {updates !== undefined ? 
      (updates!.length > 0 ? <>{updates.map((update, index) => 
        <div key={index} className='ml-5 w-75'>
          <a href={`/decks/${update.id}/`} className='text-dark'>
            <h2>{update.title}</h2>
          </a>
          <Button onClick={pullHandleWrapper(update.id)} className='update-btn'>
            {isUpdating ? 'Updating...' : 'Update'}
          </Button>
          <hr />
        </div>
      )}
      </> : <p>This deck is fully updated</p>
    ) : <p>Loading...</p>}
  </>);
}