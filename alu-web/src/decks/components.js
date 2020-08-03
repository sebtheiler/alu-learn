import React, {useState, useEffect} from 'react';
import {DeckCreate,} from './create';
import {DecksList} from './list';
import {Deck} from './detail';
import {apiDeckDetail} from '../lookup/lookup';

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

export function DeckDetailComponent(props) {
  const {deckId} = props;
  const [didLookup, setDidLookup] = useState(false);
  const [deck, setDeck] = useState(null);

  const handleBackendLookup = (response, status) => {
    if (status === 200) {
      console.log('resp', response)
      setDeck(response);
    } else {
      alert('Deck not found!');
    };
  };

  useEffect(() => {
    if (didLookup === false) {
      apiDeckDetail(deckId, handleBackendLookup);
      setDidLookup(true);
    };
  }, [deckId, didLookup, setDidLookup]);
  console.log('42 comp', deck)
  return deck === null ? null : <Deck deck={deck} individual={true} className={props.className}/>;
};