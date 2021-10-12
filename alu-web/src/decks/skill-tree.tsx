import RenderMainSection from './main-section';
import UpdateDeck from './update-deck';
import useMountEffect from '../utils/useMountEffect';
import { CreateMainSectionButton } from './buttons/section-buttons';
import { Deck } from './types';
import { HomeActionDispatch } from './context';
import { useAsyncDispatch, getDeckSectionsPercentComplete, MainSectionPercentComplete } from '../lookup/lookup';
import { useContext } from 'react';

const updateDeckWithPercentComplete = (deck: Deck, sectionsPercentComplete: MainSectionPercentComplete[]) => {
  let deckCopy = deck;
  for (const sectionPercentComplete of sectionsPercentComplete) {
    const mainSectionIdx = deckCopy.main_sections.indexOf(
      deckCopy.main_sections.filter(
        mainSection => mainSection.id === sectionPercentComplete.id,
      )[0],
    );
    deckCopy.main_sections[mainSectionIdx].percent_complete =
      sectionPercentComplete.percent_complete;
    deckCopy.main_sections[mainSectionIdx].total_percent_complete =
      sectionPercentComplete.total_percent_complete;

    for (const childSectionPercentComplete of sectionPercentComplete.sub_sections) {
      const childSectionIdx = deckCopy.main_sections[mainSectionIdx].sub_sections.indexOf(
        deckCopy.main_sections[mainSectionIdx].sub_sections.filter(
          subSection => subSection.id === childSectionPercentComplete.id,
        )[0],
      );
      deckCopy.main_sections[mainSectionIdx].sub_sections[childSectionIdx].percent_complete =
        childSectionPercentComplete.percent_complete;
      deckCopy.main_sections[mainSectionIdx].sub_sections[childSectionIdx].total_percent_complete =
        childSectionPercentComplete.total_percent_complete;
    }
  }

  return deckCopy;
}

export default function SkillTree({ deck, readOnly }: { deck: Deck, readOnly?: boolean }) {
  const { decksDispatch } = useContext(HomeActionDispatch);
  const [, , , setPercentCompleteDidSet] = useAsyncDispatch<MainSectionPercentComplete[]>(
    getDeckSectionsPercentComplete,
    [deck?.id],
    undefined,
    sectionsPercentComplete => decksDispatch && decksDispatch({
      action: 'EDIT',
      payload: deck && updateDeckWithPercentComplete(deck, sectionsPercentComplete)
    }),
    !!deck,
  );

  useMountEffect(
    () => setPercentCompleteDidSet(false),
    [deck?.id, setPercentCompleteDidSet],
  );

  if (!deck) return <p>Loading…</p>;
  return (<>
    <div className='mb-3'>
      <h1 className='mb-0'>
        {readOnly ? deck.title : <a href={`/deck/${deck.id}/study/`}>
          {deck.title}
        </a>}
      </h1>
      {!readOnly && <small className='text-secondary'>
        Click the title above to study all flashcards, or choose a section below to study
      </small>}
      {!deck.is_updated && !readOnly && <UpdateDeck deck={deck} />}
    </div>
    <div>
      {deck.main_sections.map(mainSection =>
        <RenderMainSection
          mainSection={mainSection}
          numMainSections={deck.main_sections.length}
          key={mainSection.id}
          readOnly={readOnly}
        />
      )}
    </div>
    {!readOnly && <CreateMainSectionButton deckId={deck.id} />}
    <br />
  </>);
}
