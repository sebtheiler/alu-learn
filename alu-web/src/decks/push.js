import React, { useState, useEffect } from 'react';
import { apiDeckDetail } from '../lookup';
import { errorHandler } from '../utils';

export function PushSharedDeck(props) {
  const deckId = parseInt(props.deckId);
  const [deckDidSet, setDeckDidSet] = useState(false);
  const [deck, setDeck] = useState(null);
  // const [pushingChanges, setPushingChanges] = useState(false);

  useEffect(() => {
    if (deckDidSet === false) {
      setDeckDidSet(true);
      apiDeckDetail(deckId, {}, (response, status) => {
        if (status === 200) {
          try {
            // If this is the page of a shared deck, go to the sharing page of its creator
            window.location.href = `/decks/${response.creators[0]}/share/`;
          } catch (e) {};
          setDeck(response);
        } else {
          // Error getting deck detail for sharing deck
          errorHandler(response, status, 1017);
        };
      });
    };
  }, [deckDidSet, deckId]);

  return (
    <h1>Pushing Changes to Deck "{deck ? deck.title : 'Loading...'}"</h1>
  );
};