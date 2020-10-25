import React, { useState, useEffect, useLayoutEffect } from 'react';
import { errorHandler } from '../utils';
import { apiDeckDetail, apiDeckGetUpdates } from '../lookup';
import { Button } from 'react-bootstrap';

export function UpdateDeck(props) {
  const deckId = parseInt(props.deckId);
  const [deckDidSet, setDeckDidSet] = useState(false);
  const [deck, setDeck] = useState(null);
  const [updates, setUpdates] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (deckDidSet === false) {
      setDeckDidSet(true);
      apiDeckDetail(deckId, {}, (response, status) => {
        if (status === 200) {
          setDeck(response);
          apiDeckGetUpdates(deckId, (response, status) => {
            if (status === 200) {
              setUpdates(response.needs_updating);
            } else if (!notFound) {
              // Error getting deck updates
              errorHandler(response, status, 1024);
            };
          });
        } else if (status === 404) {
          setNotFound(true);
        } else {
          // Error getting deck detail for sharing deck
          errorHandler(response, status, 1023);
        };
      });
    };
  }, [deckDidSet, deckId]);

  const pullHandleWrapper = (sharedDeckId) => {
    return (event) => {
      event.preventDefault();
      console.log(sharedDeckId)
    };
  };

  if (notFound) {
    return <>We couldn't find the deck you're looking for</>
  };

  return (<>
    <h1>Updating "{deck ? deck.title : 'Loading...'}"</h1>
    {updates !== null ? 
      (updates.length > 0 ? <>{updates.map((update, index) => (<div key={index} className='ml-5 w-75'>
        <a href={`/decks/${update.id}/`} className='text-dark'>
          <h2>{update.title}</h2>
        </a>
        <Button onClick={pullHandleWrapper(update.id)}>
          Pull Changes
        </Button>
        <hr />
      </div>)
      )}
      <Button onClick={pullHandleWrapper(updates.map(update => update.id))}>
        Pull All Changes
      </Button>
      </> : <p>This deck is fully updated</p>
    ) : <p>Loading...</p>}
  </>);
};