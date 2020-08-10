import React from 'react';
import {FlashCardCreate,} from './create';

// TODO: Remove this class
export function FlashCardCreateComponent(props) {
  const {deckId, flashcardId, redirectUrl} = props;

  return (<div className={props.className}>
            <FlashCardCreate deckId={deckId} flashcardId={flashcardId} redirectUrl={redirectUrl} />
          </div>)
};