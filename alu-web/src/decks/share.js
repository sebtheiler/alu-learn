import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { apiDeckDetail } from '../lookup';
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
          setDeck(response);
        } else {
          // Error getting deck detail for sharing deck
          errorHandler(response, status, 1017);
        };
      });
    };
  });

  const submitHandler = (event) => {
    event.preventDefault();
    if (makingPublic === false) {
      setMakingPublic(true);
    };
  };

  return (<>
    <h1>Share Deck</h1>
    {deck ? <Form onSubmit={submitHandler}>
      <Form.Group>
        <Form.Label htmlFor='sharingSetting'>Sharing Setting</Form.Label>
        <Form.Control
          as='select'
          name='sharingSetting'
          defaultValue={deck.sharing_setting}
          custom
        >
          {/* <option value='PRIVATE'>Private</option> */}
          <option value='FRIENDS'>Friends only</option>
          <option value='PUBLIC'>Public</option>
        </Form.Control>
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
      <Button type='submit'>{makingPublic ? 'Loading...' : 'Make Public'}</Button>
    </Form> : <>Loading...</>}
  </>);
};
