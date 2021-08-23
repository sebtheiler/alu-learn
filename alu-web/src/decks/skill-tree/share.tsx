import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import LoadingButton from './buttons/LoadingButton';
import { apiCreateSharedDeck, useObjectGet } from '../../lookup/lookup';
import { Deck } from '../types';

export default function ShareDeck({ deckId, username }: { deckId: string, username: string }) {
  const [deck] = useObjectGet<Deck>('decks', 'deck', deckId);

  const shareDeck = async () => {
    const form = document.getElementById('share-form') as any;
    if (!form) return;

    await apiCreateSharedDeck(
      parseInt(deckId),
      form.elements.title.value,
      form.elements.description.value,
      form.elements.viewAccess.value,
      form.elements.editAccess.value,
      form.elements.owners.value,
    ).then(sharedDeck => window.location.href = `/community/deck/${sharedDeck.id}/`);
  }

  if (!deck) return <p className='text-center'>Loading</p>
  return (
    <Container>
      <Form className='mt-4' id='share-form'>
        <h1 className='text-center'>Sharing "{deck.title}"</h1>
        <Form.Group>
          <Form.Label>Title</Form.Label>
          <Form.Control
            type='text'
            name='title'
            defaultValue={deck.title}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control
            as='textarea'
            name='description'
            rows={5}
            required
            // defaultValue={sharedDeck.description}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className='mb-0'>View Access</Form.Label><br />
          <small className='text-secondary'>
            Who can see and study the deck?
          </small>
          <Form.Control
            as='select'
            name='viewAccess'
            custom
            // defaultValue={sharedDeck.sharing_setting}
          >
            <option value='PUBLIC'>Everybody can view this deck</option>
            <option value='FRIENDS'>Only friends can view this deck</option>
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label className='mb-0'>Edit Access</Form.Label><br />
          <small className='text-secondary'>
            Who can submit edits to the deck?  Only "Owners" can approve edits
          </small>
          <Form.Control
            as='select'
            name='editAccess'
            custom
            // defaultValue={sharedDeck.edit_access}
          >
            <option value='PERSONAL'>Only you can submit edits</option>
            <option value='FRIENDS'>Only friends can submit edits</option>
            <option value='PUBLIC'>Everybody can submit edits</option>
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label className='mb-0'>Owners</Form.Label><br />
          <small className='text-secondary'>
            Who can approve edits to this deck? (separate with commas: "{`${username}, janedoe, johndoe`}")
          </small>
          <Form.Control
            type='text'
            name='owners'
            required
            defaultValue={username}
            // defaultValue={sharedDeck.owners}
          />
        </Form.Group>
        <LoadingButton clickFunc={shareDeck} block>
          Share
        </LoadingButton>
      </Form>
    </Container>
  );
}
