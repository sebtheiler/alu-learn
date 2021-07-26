import React, { useContext } from 'react';
import { Deck } from '../../types';
import { DeckDispatch } from '../context';
import { DeckForm, DeckEditableAttrs } from './edit';
import { apiObjectCreate } from '../../../lookup/lookup';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import LoadingButton from '../buttons/LoadingButton';

const editableAttrs = ['title'];

interface CreateModalProps {
  show: boolean;
  close(): void;
}
export default function CreateModal(props: CreateModalProps) {
  const { show, close } = props;
  const deckDispatch = useContext(DeckDispatch);

  const createDeck = async (options: DeckEditableAttrs) => {
    await apiObjectCreate<Deck>('decks', 'deck', options).then(
      res => deckDispatch && deckDispatch({
        action: 'CREATE',
        payload: res,
      }),
    );
    close();
  }

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header>
        <Modal.Title>Creating deck</Modal.Title>
      </Modal.Header>
      <Form name='createDeckForm'>
        <Modal.Body>
          <DeckForm />
        </Modal.Body>
        <Modal.Footer>
          <LoadingButton
            clickFunc={async () => {
              const form = document.getElementsByName('createDeckForm')[0] as HTMLFormElement;
              if (!form) return;

              let createDeckOptions = {};
              for (const el of form.elements) {
                let elName = (el as any).name;
                if (editableAttrs.includes(elName))
                  createDeckOptions[elName] = (el as any).value;
              }

              await createDeck(createDeckOptions);
            }}
            type='submit'
            block
          >
            Create
          </LoadingButton>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}