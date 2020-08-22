import React, {useState, useEffect} from 'react';
import {apiExploreLists} from '../lookup';
import {DeckSlider} from './components';
import {ExploreButtonGroup} from './buttons';


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
          console.log(response, status);
          alert('Error');
        };
      });
    };
  }, [setDecks, decksDidSet, setDecksDidSet]);

  return (
    <div>
      <div>
        <h1>Explore</h1>
        <p>Find decks of flashcards created by others to help you study.</p>
      </div>
      <ExploreButtonGroup />
      <hr />
      <div className='mb-5'>
        <h3>Editor's picks</h3>
        <DeckSlider decks={decks.EDITOR} loading={!decksDidSet} />
      </div>
      <div className='mb-5'>
        <h3>Hottest weekly decks</h3>
        <DeckSlider decks={decks.HOT} loading={!decksDidSet} />
      </div>
      <div className='mb-5'>
        <h3>Top decks of all time</h3>
        <DeckSlider decks={decks.TOP} loading={!decksDidSet} />
      </div>
    </div>
  );
};