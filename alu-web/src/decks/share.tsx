import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import { apiCreateSharedDeck } from '../lookup';
import { apiObjectEdit, useObjectGet } from '../lookup/lookup';
import { errorHandler } from '../utils';
import { SharedDeck } from './types';


export function ShareDeck(props) {
  const deckId = parseInt(props.deckId);
  const [makingPublic, setMakingPublic] = useState(false);
  const [deck] = useObjectGet<SharedDeck>('decks', 'deck', deckId);

  const submitHandler = (event) => {
    event.preventDefault();
    const form = event.target;

    if (makingPublic === false && deck) {
      setMakingPublic(true);
      // if (deck.shared_deck) { 
      //   apiObjectEdit<SharedDeck>('decks', 'deck', deck.shared_deck, {
      //     title: form.elements.title.value,
      //     description: form.elements.description.value,
      //     sharingSetting: form.elements.sharingSetting.value,
      //   }).then(deck => window.location.href = `/decks/${deck.id}/`);
      // } else {
        // apiCreateSharedDeck(deckId, form.elements.title.value, form.elements.description.value, form.elements.sharingSetting.value, (response, status) => {
        //   if (status === 201) {
        //     window.location.href = `/decks/${response.id}/`;
        //   } else {
        //     // Error creating shared deck
        //     errorHandler(response, status, 1019);
        //   }
        // });
      // }
    }
  }

  return (<>
    <h1>Sharing Deck "{deck ? deck.title : 'Loading...'}"</h1>
    {deck ? <Form onSubmit={submitHandler}>
      <Form.Group>
        <Form.Label htmlFor='title'>Title</Form.Label>
        <Form.Control
          type='text'
          placeholder="My Shared Deck"
          name='title'
          defaultValue={deck.title}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label htmlFor='description'>Description</Form.Label>
        <Form.Control
          as='textarea'
          rows={10}
          placeholder="My shared deck's description"
          name='description'
          defaultValue={deck.description}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label htmlFor='sharingSetting'>Sharing Setting</Form.Label>
        <Form.Control
          as='select'
          name='sharingSetting'
          defaultValue={deck.sharing_setting}
          custom
        >
          {/* <option value='PRIVATE'>Private</option> */}
          <option value='PUBLIC'>Public</option>
          <option value='FRIENDS'>Friends only</option>
        </Form.Control>
      </Form.Group>
      <ButtonGroup>
        <Button type='submit' id='make-public'>
          {/* {makingPublic ? 'Loading...' : (
            deck.shared_deck ? 'Update Sharing Settings' : 'Make Public'
          )} */}
        </Button>
        {/* {deck.shared_deck && <>
          <Button href={`/decks/${deck.shared_deck}/`} className='ml-1' id='shared-page'>
            Deck Shared Page
          </Button>
          <Button href={`/decks/${deck.id}/share/push/`} className='ml-1' id='push-changes'>
            Push New Changes
          </Button>
        </>} */}
      </ButtonGroup>
    </Form> : <>Loading...</>}
  </>);
}
