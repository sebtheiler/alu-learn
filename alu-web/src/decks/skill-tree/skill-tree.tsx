import { useContext } from 'react';
import { useAsyncDispatch, getDeckSectionsPercentComplete, PercentComplete } from '../../lookup/lookup';
import { Deck } from '../types';
import { DeckDispatch } from './context';
import { CreateMainSectionButton } from './buttons/section-buttons';
import RenderMainSection from './main-section';

const updateDeckWithPercentComplete = (deck: Deck, sectionsPercentComplete: PercentComplete[]) => {
  let deckCopy = deck;
  for (const sectionPercentComplete of sectionsPercentComplete) {
    const mainSectionIdx = deckCopy.skill_tree_sections.indexOf(
      deckCopy.skill_tree_sections.filter(
        mainSection => mainSection.id === sectionPercentComplete.id,
      )[0],
    );
    deckCopy.skill_tree_sections[mainSectionIdx].percent_complete =
      sectionPercentComplete.percent_complete;

    for (const childSectionPercentComplete of sectionPercentComplete.children) {
      const childSectionIdx = deckCopy.skill_tree_sections[mainSectionIdx].children.indexOf(
        deckCopy.skill_tree_sections[mainSectionIdx].children.filter(
          subSection => subSection.id === childSectionPercentComplete.id,
        )[0],
      );
      deckCopy.skill_tree_sections[mainSectionIdx].children[childSectionIdx].percent_complete =
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
      <small className='text-secondary'>Click the title above to study all flashcards, or choose a section below to study</small>
    </div>
    <div>
      {deck.skill_tree_sections.map(mainSection =>
        <RenderMainSection mainSection={mainSection} key={mainSection.id} />
      )}
    </div>
    <CreateMainSectionButton deckId={deck.id} />
  </>);
}
