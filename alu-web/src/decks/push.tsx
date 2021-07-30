import React, { useState } from 'react';
import { apiSharedPushChanges } from '../lookup';
import { errorHandler, useApiObjectHook } from '../utils';
import Button from 'react-bootstrap/Button';
import { Deck } from './types';
import { useObjectGet } from '../lookup/lookup';

interface Diff {
  created: number;
  modified: number;
  deleted: number;
}
export function PushSharedDeck(props: { deckId: string }) {
  const deckId = parseInt(props.deckId);
  const [pushingChanges, setPushingChanges] = useState(false);
  const [deck] = useObjectGet<Deck>('decks', 'deck', deckId);
  const [diff] = useApiObjectHook<Diff>(
    apiSharedPushChanges,
    [200], 1020,
    [deckId, (deck as Deck).shared_deck, true],
    null, null,
    !!deck,
  );

  const handleUpdate = (event) => {
    event.preventDefault();
    if (pushingChanges === false && deck) {
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
      <Button onClick={handleUpdate} id='push-changes'>
        {pushingChanges ? 'Pushing...' : 'Push Changes'}
      </Button>
    )}
  </>);
}
