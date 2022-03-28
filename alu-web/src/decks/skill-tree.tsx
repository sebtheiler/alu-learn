import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import RenderMainSection from './main-section';
import TutorialPopup from '../pages/tutorial';
import UpdateDeck from './update-deck';
import useMountEffect from '../utils/useMountEffect';
import { CreateMainSectionButton } from './buttons/section-buttons';
import { Deck } from './types';
import { HomeActionDispatch } from './context';
import { useAsyncDispatch, getDeckSectionsPercentComplete, MainSectionPercentComplete } from '../lookup/lookup';
import { useContext, useState } from 'react';

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
  const [studyBtn, setStudyBtn] = useState<Element | null>(null);

  useMountEffect(
    () => setPercentCompleteDidSet(false),
    [deck?.id, setPercentCompleteDidSet],
  );

  if (!deck) return <p>Loading…</p>;
  return (<>
    <div className='mb-3'>
      <h1 className='mb-0'>
        {deck.title}
      </h1>
      <div className='my-2'>
        <ButtonGroup>
          {!readOnly && <>
            <Button
              href='study/'
              style={{ width: '100px' }}
              ref={setStudyBtn}
            >
              Study
            </Button>
            <TutorialPopup
              referenceElement={studyBtn}
              tutorialAttr='clicked_study'
            >
              Study your flashcards
            </TutorialPopup>
          </>}
          <Button
            href={`flashcards/`}
            style={{ width: '100px', marginLeft: '5px' }}
            variant='secondary'
          >
            View
          </Button>
        </ButtonGroup>
      </div>
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
