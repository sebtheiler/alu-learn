import React, { useContext } from 'react';
import Button from 'react-bootstrap/Button';
import { apiDeckGenerateSkillTree } from '../../lookup';
import LoadingButton from './buttons/LoadingButton';
import { Deck } from '../types';
import { DeckDispatch } from './context';
import MainSection from './main-section';

interface SkillTreeProps {
  deck: Deck;
}
export default function SkillTree(props: SkillTreeProps) {
  const { deck } = props;
  const deckDispatch = useContext(DeckDispatch);

  const generateSkillTree = async event => {
    event.preventDefault();
    return apiDeckGenerateSkillTree(deck.id, false, true).then(
      skillTree => deckDispatch && deckDispatch({
        action: 'EDIT',
        payload: { id: deck.id, skill_tree: skillTree }
      }),
    );
  }

  return (<>
    <h1>{deck.title}</h1>
    {deck.skill_tree ? Object.keys(deck.skill_tree).map((mainSectionTitle, i) =>
      <MainSection
        title={mainSectionTitle}
        // @ts-ignore
        section={deck.skill_tree[mainSectionTitle]}
        key={i}
      />
    )
    : <>
      <Button href={`/decks/${deck.id}/study/`}>Study</Button>
      <hr />
      <p>This deck doesn't have a "skill tree yet"</p>
      <p>Generate one to have access to specific parts of your deck</p>
    </>}
    <LoadingButton clickFunc={generateSkillTree} className='mb-3'>
      {deck.skill_tree ? 'Regenerate' : 'Generate'} Skill Tree
    </LoadingButton>
  </>)
}
