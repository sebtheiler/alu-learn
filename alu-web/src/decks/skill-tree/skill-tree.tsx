import React, { useContext } from 'react';
import Button from 'react-bootstrap/Button';
import { apiDeckGenerateSkillTree } from '../../lookup';
import LoadingButton from './buttons/LoadingButton';
import { Deck } from '../types';
import { DeckDispatch } from './context';
import MainSection from './main-section';

export default function SkillTree({ deck }: { deck: Deck }) {
  const deckDispatch = useContext(DeckDispatch);

  const generateSkillTree = async event => {
    event.preventDefault();
    return apiDeckGenerateSkillTree(deck.id).then(
      skillTree => deckDispatch && deckDispatch({
        action: 'EDIT',
        payload: { id: deck.id, skill_tree: skillTree }
      }),
    );
  }

  return (<>
    <h1>
      <a href={`/deck/${deck.id}/study/`}>
        {deck.title}
      </a>
    </h1>
    {deck.skill_tree ? Object.keys(deck.skill_tree).map((mainSectionTitle, i) =>
      <MainSection
        title={mainSectionTitle}
        deckId={deck.id}
        // @ts-ignore
        section={deck.skill_tree[mainSectionTitle]}
        key={i}
      />
    )
    : <>
      <Button href={`/deck/${deck.id}/study/`}>Study</Button>
      <hr />
      <p>This deck doesn't have a "skill tree yet"</p>
      <p>Generate one to have access to specific parts of your deck</p>
    </>}
    <LoadingButton clickFunc={generateSkillTree} className='mb-3'>
      {deck.skill_tree ? 'Regenerate' : 'Generate'} Skill Tree
    </LoadingButton>
  </>);
}
