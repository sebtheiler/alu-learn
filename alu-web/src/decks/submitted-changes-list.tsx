import Container from 'react-bootstrap/Container';
import RenderActions from './render-actions';
import { DisplayProfileInline } from '../profiles';
import { SharedDeck, SubmittedChanges } from './types';
import { backendFetch, useAsyncDispatch, useObjectGet } from '../lookup/lookup';
import './submitted-changes-list.scss';


export default function SubmittedList({ sharedDeckId }: { sharedDeckId: string }) {
  const [sharedDeck] = useObjectGet<SharedDeck>('sharing_system', 'shareddeck', sharedDeckId);
  const [submittedChanges] = useAsyncDispatch<SubmittedChanges[]>(
    () => backendFetch('GET', `sharing_system/shareddeck/${sharedDeckId}/submitted/`)
  );

  if (!sharedDeck || !submittedChanges) return <p className='text-center mt-3'>Loading…</p>;
  return (<Container>
    <h1 className='text-center mt-5'>
      Submitted Changes for "<a href={`/community/deck/${sharedDeckId}/`}>{sharedDeck.title}</a>"
    </h1>
    {submittedChanges.map(changes =>
      <div
        key={changes.id}
        className='submitted-changes-item mb-3'
      >
        <h4>
          <a href={`/community/deck/${sharedDeckId}/submitted/${changes.id}/`}>{changes.message}</a>
          {' '}by <DisplayProfileInline profile={changes.author} />
        </h4>
        <hr />
        <div>
          <RenderActions actions={{
            main_section_actions: changes.pending_mainsectionactions,
            sub_section_actions: changes.pending_subsectionactions,
            flashcard_actions: changes.pending_flashcardactions,
          }} />
        </div>
      </div>
    )}
    {submittedChanges.length === 0 && <div className='text-center'>
      <p>No submitted changes yet.</p>
      <p>Editors of this shared deck can submit changes, which are reviewed by owners before being accepted or denied.</p>
    </div>}
  </Container>);
}
