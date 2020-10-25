import React, { useState, useEffect } from 'react';
import { errorHandler } from '../utils';
import { apiDeckDetail } from '../lookup';

export function UpdateDeck(props) {
  const deckId = parseInt(props.deckId);
  const [deckDidSet, setDeckDidSet] = useState(false);
  const [deck, setDeck] = useState(null);

  useEffect(() => {
    if (deckDidSet === false) {
      setDeckDidSet(true);
      apiDeckDetail(deckId, {}, (response, status) => {
        if (status === 200) {
          setDeck(response);
        } else {
          // Error getting deck detail for sharing deck
          errorHandler(response, status, 1023);
        };
      });
    };
  }, [deckDidSet, deckId]);

  return (<>
    <h1>Updating "{deck ? deck.title : 'Loading...'}"</h1>
  </>);
};