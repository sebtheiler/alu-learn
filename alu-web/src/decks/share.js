import React, { useState, useEffect } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import { apiCreateSharedDeck, apiDeckDetail } from '../lookup';
import { errorHandler } from '../utils';


export function ShareDeck(props) {
  const deckId = parseInt(props.deckId);
  const [deckDidSet, setDeckDidSet] = useState(false);
  const [deck, setDeck] = useState(null);
  const [makingPublic, setMakingPublic] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (deckDidSet === false) {
      setDeckDidSet(true);
      apiDeckDetail(deckId, {}, (response, status) => {
        if (status === 200) {
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
      apiCreateSharedDeck(deckId, form.elements.title.value, form.elements.description.value, form.elements.sharingSetting.value, (response, status) => {
        if (status === 201) {
          setShowAlert(true);
        } else {
          // Error creating shared deck
          errorHandler(response, status, 1019);
        };
      });
    };
  };

  return (<>
    <h1>Sharing Deck "{deck ? deck.title : 'Loading...'}"</h1>
    {showAlert && <Alert id='createdShared' variant='info'>Created Shared Deck</Alert>}
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
      <Button type='submit'>{makingPublic ? 'Loading...' : 'Make Public'}</Button>
    </Form> : <>Loading...</>}
  </>);
};
