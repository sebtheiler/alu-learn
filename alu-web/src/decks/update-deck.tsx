import Alert from 'react-bootstrap/Alert';
import LoadingButton from './buttons/LoadingButton';
import { Deck } from './types';
import { backendFetch } from '../lookup/lookup';
import { useState } from 'react';
import RenderConflicts, { Conflicts } from './conflicts';
import './shared.scss';

export default function UpdateDeck({ deck }: { deck: Deck }) {
  const [conflicts, setConflicts] = useState<Conflicts | undefined>();

  const updateDeck = async () => {
    const { conflicts: deckConflicts } = await backendFetch<{ deck: Deck, conflicts: Conflicts }>(
      'POST',
      `sharing_system/deck/${deck.id}/pull/`,
    );

    // Reload if there are no conflicts
    // (we could set the new deck manually as well, but this makes it feel like a big change)
    if (
      deckConflicts.main_sections.length === 0 &&
      deckConflicts.sub_sections.length === 0 &&
      deckConflicts.flashcards.length === 0
    ) window.location.reload();

    // User will manually deal with conflicts (`conflicts.tsx/RenderConflicts`)
    setConflicts(deckConflicts);
  }

  return (
    <Alert className='text-left' variant='primary'>
      {!conflicts ? <>
        <p>There is an update available for this deck</p>
        {/* TODO: give option to ignore update with localstorage */}
        {/* TODO: show actions and ask for confirmation */}
        <LoadingButton clickFunc={updateDeck}>
          Update
        </LoadingButton>
      </> : <RenderConflicts conflicts={conflicts} setConflicts={setConflicts} />}
    </Alert>
  );
}