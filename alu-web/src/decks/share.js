import React, { useState, useEffect } from 'react';
import { Button, ButtonGroup, Form } from 'react-bootstrap';
import { apiCreateSharedDeck, apiDeckDetail, apiSharedDeckEdit } from '../lookup';
import { errorHandler } from '../utils';


export function ShareDeck(props) {
  const deckId = parseInt(props.deckId);
  const [deckDidSet, setDeckDidSet] = useState(false);
  const [deck, setDeck] = useState(null);
  const [makingPublic, setMakingPublic] = useState(false);

  useEffect(() => {
    if (deckDidSet === false) {
      setDeckDidSet(true);
      apiDeckDetail(deckId, {}, (response, status) => {
        if (status === 200) {
          try {
            // If this is the page of a shared deck, go to the sharing page of its creator
            window.location.href = `/decks/${response.creators[0]}/share/`;
          } catch (e) {};
          setDeck(response);
        } else {
          // Error getting deck detail for sharing deck
          errorHandler(response, status, 1017);
        };
      });
    };
  }, [deckDidSet, deckId]);

  const submitHandler = (event) => {
    event.preventDefault();
    const form = event.target;

    if (makingPublic === false) {
      setMakingPublic(true);
      if (deck.shared_deck) { 
        apiSharedDeckEdit(deck.shared_deck, form.elements.title.value, form.elements.description.value, form.elements.sharingSetting.value, (response, status) => {
          if (status === 200) {
            window.location.href = `/decks/${response.id}/`;
          } else {
            // Error editing shared deck metadata
            errorHandler(response, status, 1020);
          };
        });
      } else {
        apiCreateSharedDeck(deckId, form.elements.title.value, form.elements.description.value, form.elements.sharingSetting.value, (response, status) => {
          if (status === 201) {
            window.location.href = `/decks/${response.id}/`;
          } else {
            // Error creating shared deck
            errorHandler(response, status, 1019);
          };
        });
      };
    };
  };

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
          rows='3'
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
        <Button type='submit'>
          {makingPublic ? 'Loading...' : (
            deck.shared_deck ? 'Update Sharing Settings' : 'Make Public'
          )}
        </Button>
        {deck.shared_deck && <>
          <Button href={`/decks/${deck.shared_deck}/`} className='ml-1'>
            Deck Shared Page
          </Button>
          <Button href={`/decks/${deck.id}/share/push/`} className='ml-1'>
            Push New Changes
          </Button>
        </>}
      </ButtonGroup>
    </Form> : <>Loading...</>}
  </>);
};
