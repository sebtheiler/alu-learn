import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import LoadingButton from './buttons/LoadingButton';
import RenderActions from './render-actions';
import { SubmittedChanges } from './types';
import { backendFetch, useObjectGet } from '../lookup/lookup';

export default function RenderSubmittedChanges({ sharedDeckId, submittedChangesId }: { sharedDeckId: number, submittedChangesId: string }) {
  const [resp] = useObjectGet<{ changes: SubmittedChanges, is_owner: boolean }>(
    'sharing_system', 'submittedchanges', submittedChangesId,
  );

  const decideChanges = async (decision: 'ACCEPT' | 'DENY') => {
    await backendFetch('POST', `sharing_system/submittedchanges/${submittedChangesId}/decide/`, {
      decision: decision,
    });

    if (decision === 'ACCEPT')
      window.location.href = `/community/deck/${sharedDeckId}/`;
    else
      window.location.href = `/community/deck/${sharedDeckId}/submitted/`;
  }

  if (!resp) return <p className='text-center mt-3'>Loading…</p>;
  return (<>
    <h1 className='text-center mt-5'>{resp.changes.message}</h1>
    <Container>
      <RenderActions actions={{
        main_section_actions: resp.changes.pending_mainsectionactions,
        sub_section_actions: resp.changes.pending_subsectionactions,
        flashcard_actions: resp.changes.pending_flashcardactions,
      }} />
      <hr />
      {resp.is_owner && <ButtonGroup className='w-100 mb-3'>
        <LoadingButton clickFunc={() => decideChanges('ACCEPT')}>
          Accept Changes
        </LoadingButton>
        <LoadingButton clickFunc={() => decideChanges('DENY')} variant='danger'>
          Deny Changes
        </LoadingButton>
      </ButtonGroup>}
    </Container>
  </>);
}
