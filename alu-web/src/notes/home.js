import React, { useState, useEffect } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { Deck } from '../decks/detail';
import { apiNoteHome } from '../lookup';
import { errorHandler } from '../utils';
import { NoteCreateButton } from './buttons';

export function NotesHomeList(props) {
  const {username} = props;

  const [notes, setNotes] = useState([]);
  const [notesDidSet, setNotesDidSet] = useState(false);
  
  useEffect(() => {
    if (notesDidSet === false) {
      setNotesDidSet(true);
      apiNoteHome((response, status) => {
        if (status === 200) {
          setNotes(response);
        } else {
          // Error getting notes home
          errorHandler(response, status, 6002);
        }
      });
    }
  }, [notes, notesDidSet]);

  return (
    <>
      <div className='text-center my-3'>
        <ButtonGroup>
          <NoteCreateButton />
        </ButtonGroup>
      </div>
    {notes && notes.length > 0 ? <>
        <div className='card-deck text-center mx-auto justify-content-center'>
          {notes.map((note, index) => {
            return <Deck 
                      deck={note}
                      currentUsername={username}
                      key={`${index}-${note.id}`}
                      type={'note'}
                      className='mb-3 mx-1 border bg-white text-dark'
                    />;
          })}
        </div>
      </> :
        <p className='text-center mt-3'>
          {notesDidSet ? 'You don\'t have any notes yet.' : 'Loading...'}
        </p>}
    </>
  );
}
