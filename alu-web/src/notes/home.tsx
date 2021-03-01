import React from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { HomePageCards } from '../decks';
import { apiNoteHome } from '../lookup';
import { useApiObjectHook } from '../utils';
import { NoteCreateButton } from './buttons';
import { Note } from './types';

export function NotesHomeList({ username }) {
  const [notes] = useApiObjectHook<Note[]>(apiNoteHome, 200, 6002);

  return (
    <>
      <div className='text-center my-3'>
        <ButtonGroup>
          <NoteCreateButton />
        </ButtonGroup>
      </div>
      {notes && notes.length > 0 ?
        <HomePageCards
          items={notes}
          currentUsername={username}
          type='note'
        />
      :
        <p className='text-center mt-3'>
          You don't have any notes yet
        </p>
      }
    </>
  );
}
