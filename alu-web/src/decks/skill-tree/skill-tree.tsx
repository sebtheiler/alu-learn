import React from 'react';
import Button from 'react-bootstrap/Button';
import { apiDeckGenerateSkillTree } from '../../lookup';
import { errorHandler, LoadingButton } from '../../utils';
import { Deck } from '../types';
import MainSection from './main-section';

interface SkillTreeProps {
  deck: Deck;
}
export default function SkillTree(props: SkillTreeProps) {
  const { deck } = props;

  const generateSkillTree = event => {
    event.preventDefault();
    apiDeckGenerateSkillTree(deck.id, false, true, (response, status) => {
      if (status === 200) {
        window.location.reload();
      } else {
        errorHandler(response, status, 1031);
      }
    });
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
    <LoadingButton
      callback={generateSkillTree}
      loadingMessage='Generating...'
      className='mb-3'
    >
      {deck.skill_tree ? 'Regenerate' : 'Generate'} Skill Tree
    </LoadingButton>
  </>)
}
