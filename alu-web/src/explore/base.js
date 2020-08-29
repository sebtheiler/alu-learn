import React, {useState, useEffect} from 'react';
import {apiExploreLists} from '../lookup';
import {DeckSlider} from './components';
import {ExploreButtonGroup} from './buttons';
import { errorHandler } from '../utils';


export function ExploreComponent(props) {
  const [decks, setDecks] = useState([]);
  const [decksDidSet, setDecksDidSet] = useState(false);

  useEffect(() => {
    if (decksDidSet === false) {
      // TODO: replace with actual explore function
      apiExploreLists((response, status) => {
        if (status === 200) {
          setDecks(response);
          setDecksDidSet(true);
        } else {
          // Error getting explore deck lists
          errorHandler(response, status, 1010);
        };
      });
    };
  }, [setDecks, decksDidSet, setDecksDidSet]);

  return (
    <>
      <div>
        <h1>Explore</h1>
        <p>Find decks of flashcards created by others to help you study.</p>
      </div>
      <ExploreButtonGroup />
      <hr />
      <div className={'mb-5' + (decks.EDITOR && decks.EDITOR.length === 0 ? ' d-none' : '')}>
        <h3>Editor's picks</h3>
        <p className='text-secondary'>Here are some decks our editors thought deserved the spotlight</p>
        <DeckSlider decks={decks.EDITOR} loading={!decksDidSet} />
      </div>
      <div className={'mb-5' + (decks.HOT && decks.HOT.length === 0 ? ' d-none' : '')}>
        <h3>Hottest weekly decks</h3>
        <p className='text-secondary'>Decks that have recieved the most thanks in the past week</p>
        <DeckSlider decks={decks.HOT} loading={!decksDidSet} />
      </div>
      <div className={'mb-5' + (decks.TOP && decks.TOP.length === 0 ? ' d-none' : '')}>
        <h3>Top decks of all time</h3>
        <p className='text-secondary'>Everyone should take a look at these immortal decks!</p>
        <DeckSlider decks={decks.TOP} loading={!decksDidSet} />
      </div>
    </>
  );
};