import React, { useState, useEffect } from 'react';
import { apiDeckDetail, apiSharedPushChanges } from '../lookup';
import { errorHandler } from '../utils';
import { Button } from 'react-bootstrap';

export function PushSharedDeck(props) {
  const deckId = parseInt(props.deckId);
  const [deckDidSet, setDeckDidSet] = useState(false);
  const [diff, setDiff] = useState(null);
  const [deck, setDeck] = useState(null);
  const [pushingChanges, setPushingChanges] = useState(false);

  useEffect(() => {
    if (deckDidSet === false) {
      setDeckDidSet(true);
      apiDeckDetail(deckId, {}, (response, status) => {
        if (status === 200) {
          try {
            // If this is the page of a shared deck, go to the sharing page of its creator
            window.location.href = `/decks/${response.creators[0]}/share/`;
          } catch (e) {}
          setDeck(response);
          apiSharedPushChanges(deckId, response.shared_deck, true, (response, status) => {
            if (status === 200) {
              setDiff(response);
            } else {
              // Error checking diff between shared and origin deck
              errorHandler(response, status, 1020);
            }
          });
        } else {
          // Error getting deck detail for sharing deck
          errorHandler(response, status, 1021);
        }
      });
    }
  }, [deckDidSet, deckId]);

  const handleUpdate = (event) => {
    event.preventDefault();
    if (pushingChanges === false) {
      setPushingChanges(true);
      apiSharedPushChanges(deckId, deck.shared_deck, false, (response, status) => {
        if (status === 200) {
          window.location.href = `/decks/${deck.shared_deck}`;
        } else {
          // Error pushing changes to new deck
          errorHandler(response, status, 1020);
        }
        setPushingChanges(false);
      });
    }
  }

  return (<>
    <h1>Pushing Changes to Deck "{deck ? deck.title : 'Loading...'}"</h1>
    {diff ? <ul>
      <li className='text-success'>Created <strong>{diff.created}</strong> flashcard{diff.created !== 1 ? 's' : ''}</li>
      <li className='text-primary'>Modified <strong>{diff.modified}</strong> flashcard{diff.modified !== 1 ? 's' : ''}</li>
      <li className='text-danger'>Deleted <strong>{diff.deleted}</strong> flashcard{diff.deleted !== 1 ? 's' : ''}</li>
    </ul> : 'Loading diff...'}
    {diff && (diff.created === 0 && diff.modified === 0 && diff.deleted === 0 ?
      <p>You have made no changes to the deck, and thus cannot update it's shared counterpart</p>
    :
      <Button onClick={handleUpdate}>
        {pushingChanges ? 'Pushing...' : 'Push Changes'}
      </Button>
    )}
  </>);
}
