import React, {useState, useEffect} from 'react';
import {Deck} from '../decks/detail';
import {apiNoteHome} from '../lookup';
import { errorHandler } from '../utils';

export function NotesHomeList(props) {
  const {username} = props;

  const [notes, setNotes] = useState([]);
  const [notesDidSet, setNotesDidSet] = useState(false);
  
  useEffect(() => {
    if (notesDidSet === false) {
      setNotesDidSet(true);
      apiNoteHome((response, status) => {
        if (status === 200) {
          console.log(response)
          setNotes(response);
        } else {
          // Error getting notes home
          errorHandler(response, status, 6002);
        };
      });
    };
  }, [notes, notesDidSet]);

  return (
    <>{notes.length > 0 ? <>
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
};