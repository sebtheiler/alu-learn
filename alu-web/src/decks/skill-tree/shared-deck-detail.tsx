import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import RenderMainSection from './main-section';
import RenderFlashcard  from './render-flashcard';
import CopySharedDeckButton from './buttons/copy-shared-deck-button';
import { FlashCard } from '../types';
import { useObjectGet, useObjectPaginatedList } from '../../lookup/lookup';
import { SharedDeck } from './types';
import { useMemo, useState } from 'react';
import { DisplayProfileInline } from '../../profiles';
import './shared-deck-detail.scss';
import React from 'react';

interface Permission {
  hasViewAccess?: boolean;
  hasEditAccess?: boolean;
  isOwner?: boolean;
}

export default function SharedDeckDetail({ sharedDeckId, snapshotId }: { sharedDeckId: string, snapshotId?: string}) {
  const [permissions, setPermissions] = useState<Permission | undefined>();
  const [sharedDeck] = useObjectGet<SharedDeck>(
    'sharing_system',
    'shareddeck',
    sharedDeckId,
    undefined,
    res => setPermissions({
      hasViewAccess: res.has_view_access,
      hasEditAccess: res.has_edit_access,
      isOwner: res.is_owner,
    }),
  );
  const snapshot = useMemo(() => {
    if (!sharedDeck || !sharedDeck.has_view_access) return;
    if (snapshotId)
      return sharedDeck.snapshots.filter(snapshot => snapshot.id === snapshotId)[0];
    else
      return sharedDeck.snapshots[sharedDeck.snapshots.length - 1];
  }, [snapshotId, sharedDeck]);
  const [viewAccess, editAccess] = useMemo(() => {
    let viewAccess: string = '';
    let editAccess: string = '';
    switch (sharedDeck?.view_access) {
      case 'FRIENDS':
        viewAccess = 'Only friends of the owners can view this deck';
        break;
      case 'PUBLIC':
        viewAccess = 'Anyone can view this deck';
        break;
      case 'STUDENT':
        viewAccess = 'Only students of the owners can view this deck';
        break;
    }
    switch (sharedDeck?.edit_access) {
      case 'PERSONAL':
        editAccess = 'Only the owners of this deck can submit edits';
        break;
      case 'FRIENDS':
        editAccess = 'Only friends of the owners can submit edits';
        break;
      case 'STUDENT':
        editAccess = 'Only students of the owners can submit edits';
        break;
      case 'PUBLIC':
        editAccess = 'Everyone can submit edits';
        break;
    }

    return [viewAccess, editAccess];
  }, [sharedDeck])
  const [flashcards] = useObjectPaginatedList<FlashCard>('sharing_system', 'flashcard', undefined, {
    snapshot_id: sharedDeck && snapshot?.id,
    page_size: 10,
  }, !!(sharedDeck && snapshot));

  if (!permissions) return <p className='text-center mt-3'>Loading…</p>;
  if (!permissions.hasViewAccess || !sharedDeck || !snapshot) return (<>
    <p className='text-center mt-3'>You don't have permission to view this shared deck.</p>
    <p className='text-center'>If you believe this was a mistake, please contact the deck's owners.</p>
  </>);
  return (
    <Container>
      <Row className='mt-5'>
        <Col md={9}>
          <div>
            <h1>{sharedDeck.title}</h1>
            {snapshotId && <Alert variant='warning'>
              <strong>WARNING:</strong> You are viewing a historical version of this deck: "{snapshot.message}"
              <br /><br />
              <Button href={`/community/deck/${sharedDeck.id}/`}>
                View Latest Version
              </Button>
            </Alert>}
            <p>{sharedDeck.description}</p>
            <ButtonGroup>
              <CopySharedDeckButton sharedDeck={sharedDeck} />
              <Button
                href={`/community/deck/${sharedDeck.id}/flashcards/${snapshot.id}/`}
                style={{ width: '150px', marginLeft: '2px' }}
              >
                View Flashcards
              </Button>
              {/* <Button style={{ width: '150px', marginLeft: '2px' }}>View History</Button> */}
              {permissions.isOwner && <Button
                href={`/community/deck/${sharedDeck.id}/submitted/`}
                style={{ width: '150px', marginLeft: '2px' }}
              >
                Submitted Edits
              </Button>}
            </ButtonGroup>
            {permissions.isOwner && <p className='mt-3'>
              You are an owner of this deck.  To make edits, go to your local copy and
              click "Share" in its dropdown.  To approve or deny others' edits, click
              "Submitted Edits."
            </p>}
            {permissions.hasEditAccess && !permissions.isOwner && <p className='mt-3'>
              You are an editor of this deck.  To submit an edit,
              go to your local copy and click "Share" in its dropdown
              (this will have to be approved by an owner).
            </p>}
          </div>
          <hr />
          <div>
            <h3>Skill Tree</h3>
            {snapshot.main_sections.map(mainSection =>
              <RenderMainSection
                mainSection={mainSection}
                numMainSections={snapshot.main_sections.length}
                key={mainSection.id}
                readOnly
              />
            )}
            <hr />
            <h3>Example Flashcards</h3>
            {flashcards?.map(flashcard =>
              <RenderFlashcard flashcard={flashcard} key={flashcard.id} />
            )}
          </div>
        </Col>
        <Col md={3} className='shared-deck-side-info'>
          <div>
            <h1>Info</h1>
            <p>View Access: {viewAccess}</p>
            <p>Edit Access: {editAccess}</p>
            <p>Owners: {sharedDeck.owners.map((owner, i) => <React.Fragment key={i}>
              <DisplayProfileInline profile={owner} />
              {i !== sharedDeck.owners.length - 1 && ','}
            </React.Fragment>)}</p>
          </div>
          <hr />
          <div>
            <h1>History</h1>
            <ol reversed>
              {sharedDeck.snapshots.map((snapshot, i) => <li key={snapshot.id}>
                <a href={`/community/deck/${sharedDeck.id}/snapshots/${snapshot.id}/`}>
                  {snapshot.message}
                </a> by <DisplayProfileInline profile={snapshot.author} />
              </li>)}
            </ol>
          </div>
        </Col>
      </Row>
    </Container>
  );
}