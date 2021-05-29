import React from 'react';
import { HomePageCards } from '../decks';
import { apiNoteHome } from '../lookup';
import { useApiObjectHook } from '../utils';
import { Note } from './types';

export function NotesHomeList({ username }) {
  const [notes] = useApiObjectHook<Note[]>(apiNoteHome, 200, 6002);

  return (
    <>
      <div className='text-center my-3'>
        <p>Notes are officially deprecated and will be removed sometime over the summer</p>
        <p>Please backup all current notes into Google Docs before they will be permanently deleted</p>
        <hr />
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
