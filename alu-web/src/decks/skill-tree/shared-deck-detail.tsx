import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useObjectGet } from '../../lookup/lookup';
import { SharedDeck } from './types';
import { useMemo } from 'react';
import { DisplayProfileInline } from '../../profiles';

export default function SharedDeckDetail({ sharedDeckId }: { sharedDeckId: string }) {
  const [sharedDeck] = useObjectGet<SharedDeck>('sharing_system', 'shareddeck', sharedDeckId);
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
  console.log(sharedDeck);

  if (!sharedDeck) return <p className='text-center mt-3'>Loading…</p>;
  return (
    <Container>
      <Row className='mt-5'>
        <Col md={9}>
          <div>
            <h1>{sharedDeck.title}</h1>
            <p>{sharedDeck.description}</p>
            <ButtonGroup>
              <Button style={{ width: '150px', marginLeft: '2px' }}>Clone</Button>
              <Button style={{ width: '150px', marginLeft: '2px' }}>View Flashcards</Button>
              <Button style={{ width: '150px', marginLeft: '2px' }}>View History</Button>
            </ButtonGroup>
          </div>
          <hr />
          <div>
            <p>render latest snapshot</p>
            <p>skill tree</p>
            <p>example flashcards</p>
          </div>
        </Col>
        <Col md={3}>
          <div>
            <h1>Info</h1>
            <p>View Access: {viewAccess}</p>
            <p>Edit Access: {editAccess}</p>
            <p>Owners: {sharedDeck.owners.map((owner, i) => <>
              <DisplayProfileInline profile={owner} />
              {i !== sharedDeck.owners.length - 1 && ','}
            </>)}</p>
          </div>
          <hr />
          <div>
            <h1>History</h1>
            <p>list of snapshots</p>
            <p>view any specific snapshot</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}