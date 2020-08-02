import React, {useState} from 'react';
import {DeckCreate,} from './create';
import {DecksList} from './list';

export function DecksComponent(props) {
  const [newDecks, setNewDecks] = useState([]);
  const canCreateDeck = props.canCreateDeck === 'false' ? false : true;

  const handleNewDeck = (newDeck) => {
    let tempNewDecks = [...newDecks];
    tempNewDecks.unshift(newDeck);
    setNewDecks(tempNewDecks);
  };
  
  return (<div className={props.className}>
      {canCreateDeck === true && <DeckCreate didCreateDeck={handleNewDeck} className='col-12 mb-3' />}
    <DecksList newDecks={newDecks} {...props}/>
  </div>);
};