import React, { useState, useEffect } from 'react';
import { errorHandler } from '../utils';
import { apiDeckDetail, apiDeckGetUpdates, apiDeckPullUpdates } from '../lookup';
import Button from 'react-bootstrap/Button';
import { Deck } from './types';

interface UpdateDeckProps {
  deckId: string;
}
interface Update {
  title: string;
  id: number;
}
export function UpdateDeck(props: UpdateDeckProps) {
  const deckId = parseInt(props.deckId);
  const [deckDidSet, setDeckDidSet] = useState(false);
  const [deck, setDeck] = useState<Deck>();
  const [updates, setUpdates] = useState<Update[]>();
  const [notFound, setNotFound] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (deckDidSet === false) {
      setDeckDidSet(true);
      apiDeckDetail(deckId, {}, (response, status) => {
        if (status === 200) {
          setDeck(response);
          apiDeckGetUpdates(deckId, (response, status) => {
            if (status === 200) {
              setUpdates(response.needs_updating as Update[]);
            } else if (!notFound) {
              // Error getting deck updates
              errorHandler(response, status, 1024);
            }
          });
        } else if (status === 404) {
          setNotFound(true);
        } else {
          // Error getting deck detail for sharing deck
          errorHandler(response, status, 1023);
        }
      });
    }
  }, [deckDidSet, deckId, notFound]);

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

  if (notFound) return 'We couldn\'t find the deck you\'re looking for'
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