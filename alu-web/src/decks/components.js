import React, {useState, useEffect} from 'react';
import {DeckCreate,} from './create';
import {DecksList} from './list';
import {DeckDetail} from './detail';
import {apiDeckDetail} from '../lookup';
import {DecksFeedList} from './feed';
import {Button} from 'react-bootstrap';


// Component for the decks shown on the user's homepage
export function DecksFeedComponent(props) {
  const [newDecks, setNewDecks] = useState([]);
  const canCreateDeck = props.canCreateDeck === 'false' ? false : true;

  // Appends new deck to front of decks list (should be changed to alphabetically)
  // Client-side only
  const handleNewDeck = (newDeck) => {
    let tempNewDecks = [...newDecks];
    tempNewDecks.unshift(newDeck);
    setNewDecks(tempNewDecks);
  };

  return (
    <div className={props.className}>
      <div classname='text-center'>
        {/* TODO: center better or choose new location */}
        <Button href='/flashcards/search/' className='text-center mt-1'>Search for Flashcards / Custom Study</Button>
      </div>
      {canCreateDeck === true && <DeckCreate didCreateDeck={handleNewDeck} className='col-12 mt-3' />}
      <DecksFeedList newDecks={newDecks} {...props}/>
    </div>
  );
};


// Component for list of a user's decks
export function DecksComponent(props) {
  const [newDecks, setNewDecks] = useState([]);
  const canCreateDeck = props.canCreateDeck === 'false' ? false : true;

  // Appends new deck to front of decks list (should be changed to alphabetically)
  // Client-side only
  const handleNewDeck = (newDeck) => {
    let tempNewDecks = [...newDecks];
    tempNewDecks.unshift(newDeck);
    setNewDecks(tempNewDecks);
  };
  
  return (
    <div className={props.className}>
      {canCreateDeck === true ? <DeckCreate didCreateDeck={handleNewDeck} className='col-12 mb-3' /> : null}
      <DecksList newDecks={newDecks} {...props}/>
    </div>
  );
};


// Component for displaying an individual deck
export function DeckDetailComponent(props) {
  const {deckId, currentUsername} = props;
  const [didLookup, setDidLookup] = useState(false);
  const [deck, setDeck] = useState(null);

  // Function for updating the deck's display with the server response
  // This is called after the server sends back a response
  const handleBackendLookup = (response, status) => {
    if (status === 200) {
      setDeck(response);
    } else {
      alert('An error occured displaying a deck!');
    };
  };

  // Send a request to the API to get information about the given deck
  // `didLookup` is required so that this doesn't infinitely run
  useEffect(() => {
    if (didLookup === false) {
      apiDeckDetail(deckId, handleBackendLookup);
      setDidLookup(true);
    };
  }, [deckId, didLookup, setDidLookup]);

  return deck === null ? null : (
    <DeckDetail
      deck={deck}
      currentUsername={currentUsername}
      textAlign='left'
    />
  );
};