import React from 'react';
import { apiExploreLists } from '../lookup';
import { DeckSlider } from './components';
import { ExploreButtonGroup } from './buttons';
import { useApiObjectHook } from '../utils';
import { SharedDeck } from '../decks/types';


interface ExploreDecks {
  EDITOR: SharedDeck[];
  HOT: SharedDeck[];
  TOP: SharedDeck[];
}
export function ExploreComponent(props: null) {
  const [decks] = useApiObjectHook<ExploreDecks>(apiExploreLists, 200, 1010);

  return (
    <>
      <div>
        <h1>Explore</h1>
        <p>Find decks of flashcards created by others to help you study.</p>
      </div>
      <ExploreButtonGroup />
      <hr />
      {decks ? <div className={'mb-5' + ((decks as ExploreDecks).EDITOR && (decks as ExploreDecks).EDITOR?.length === 0 ? ' d-none' : '')}>
        <h3>Most Copied Decks</h3>
        <p className='text-secondary'>Decks with the total highest number of copies</p>
        <DeckSlider decks={(decks as ExploreDecks).EDITOR} />
      </div> : <p>Loading...</p>}
    </>
  );
}
