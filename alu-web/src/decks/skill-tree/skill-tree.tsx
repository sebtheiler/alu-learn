import RenderMainSection from './main-section';
import { CreateMainSectionButton } from './buttons/section-buttons';
import { Deck } from '../types';
import { DeckDispatch } from './context';
import { useAsyncDispatch, getDeckSectionsPercentComplete, PercentComplete } from '../../lookup/lookup';
import { useContext } from 'react';
import UpdateDeck from './update-deck';

const updateDeckWithPercentComplete = (deck: Deck, sectionsPercentComplete: PercentComplete[]) => {
  let deckCopy = deck;
  for (const sectionPercentComplete of sectionsPercentComplete) {
    const mainSectionIdx = deckCopy.main_sections.indexOf(
      deckCopy.main_sections.filter(
        mainSection => mainSection.id === sectionPercentComplete.id,
      )[0],
    );
    deckCopy.main_sections[mainSectionIdx].percent_complete =
      sectionPercentComplete.percent_complete;

    for (const childSectionPercentComplete of sectionPercentComplete.sub_sections) {
      const childSectionIdx = deckCopy.main_sections[mainSectionIdx].sub_sections.indexOf(
        deckCopy.main_sections[mainSectionIdx].sub_sections.filter(
          subSection => subSection.id === childSectionPercentComplete.id,
        )[0],
      );
      deckCopy.main_sections[mainSectionIdx].sub_sections[childSectionIdx].percent_complete =
        childSectionPercentComplete.percent_complete;
    }
  }

  return deckCopy;
}

export default function SkillTree({ deck }: { deck: Deck }) {
  const deckDispatch = useContext(DeckDispatch);
  useAsyncDispatch<PercentComplete[]>(
    getDeckSectionsPercentComplete,
    [deck.id],
    undefined,
    sectionsPercentComplete => deckDispatch && deckDispatch({
      action: 'EDIT',
      payload: updateDeckWithPercentComplete(deck, sectionsPercentComplete)
    }),
  );

  return (<>
    <div className='mb-3'>
      <h1 className='mb-0'>
        <a href={`/deck/${deck.id}/study/`}>
          {deck.title}
        </a>
      </h1>
      <small className='text-secondary'>
        Click the title above to study all flashcards, or choose a section below to study
      </small>
      {!deck.is_updated && <UpdateDeck deck={deck} />}
    </div>
    <div>
      {deck.main_sections.map(mainSection =>
        <RenderMainSection
          mainSection={mainSection}
          numMainSections={deck.main_sections.length}
          key={mainSection.id}
        />
      )}
    </div>
    <CreateMainSectionButton deckId={deck.id} />
  </>);
}
