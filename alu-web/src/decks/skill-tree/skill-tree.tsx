import React, { useContext } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import LoadingButton from './buttons/LoadingButton';
import { apiDeckGenerateSkillTree, useAsyncDispatch, getDeckSectionsPercentComplete, PercentComplete } from '../../lookup/lookup';
import { Deck } from '../types';
import { DeckDispatch } from './context';
import RenderMainSection from './main-section';

export default function SkillTree({ deck }: { deck: Deck }) {
  const deckDispatch = useContext(DeckDispatch);
  useAsyncDispatch<PercentComplete[]>(
    getDeckSectionsPercentComplete,
    [deck.id],
    undefined,
    sectionsPercentComplete => {
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

      if (deckDispatch) deckDispatch({ action: 'EDIT', payload: deckCopy });
    },
  );

  const generateSkillTree = async event => {
    event.preventDefault();
    return apiDeckGenerateSkillTree(deck.id).then(
      newDeck => deckDispatch && deckDispatch({
        action: 'EDIT',
        payload: newDeck,
      }),
    );
  }

  return (<>
    <h1>
      <a href={`/deck/${deck.id}/study/`}>
        {deck.title}
      </a>
    </h1>
    {deck.skill_tree_sections.length > 0 ? deck.skill_tree_sections.map(mainSection =>
      <RenderMainSection mainSection={mainSection} key={mainSection.id} />
    )
    : <>
      <Button href={`/deck/${deck.id}/study/`}>Study</Button>
      <hr />
      <p>This deck doesn't have a "skill tree yet"</p>
      <p>Generate one to have access to specific parts of your deck</p>
    </>}
    <ButtonGroup className='mb-3'>
      <LoadingButton clickFunc={generateSkillTree} style={{ width: '180px' }}>
        {deck.skill_tree_sections.length > 0 ? 'Regenerate' : 'Generate'} Skill Tree
      </LoadingButton>
      <Button className='ml-1' style={{ width: '180px' }} href={`/deck/${deck.id}/share/`}>
        Share Deck
      </Button>
    </ButtonGroup>
  </>);
}
