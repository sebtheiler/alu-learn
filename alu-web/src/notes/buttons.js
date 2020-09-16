import React from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';

export function NoteDefaultButtonGroup(props) {
  const {note} = props;

  return (
    <ButtonGroup>
      <Button href={`/notes/${note.id}/edit/`} className='mr-1'>
        Edit
      </Button>
      <Button href={`/notes/${note.id}/study/`} className='mr-1'>
        Study
      </Button>
    </ButtonGroup>
  );
};