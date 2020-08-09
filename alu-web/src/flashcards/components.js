import React from 'react';
import {FlashCardCreate,} from './create';

export function FlashCardCreateComponent(props) {
  const {deckId} = props;

  return (<div className={props.className}>
            <FlashCardCreate deckId={deckId} />
          </div>)
};