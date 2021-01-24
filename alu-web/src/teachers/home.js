import React from 'react';
import { apiClassroomsHomepage } from '../lookup';
import { useApiObjectHook } from '../utils';
import { ButtonGroup } from 'react-bootstrap';
import { Deck } from '../decks/detail';
import { ClassroomEditCreateButton } from './buttons';


export function ClassroomsHomepage({ username }) {
  const [classrooms] = useApiObjectHook(apiClassroomsHomepage, 200, 8000);

  return (<>
    <div className='text-center my-3'>
      <ButtonGroup>
        <ClassroomEditCreateButton />
      </ButtonGroup>
    </div>
    {classrooms && classrooms.length > 0 ? <>
      <div className='card-deck text-center mx-auto justify-content-center'>
        {classrooms.map((note, index) => {
          return ( // TODO: this definitely needs to be changed
            <Deck
              deck={note}
              currentUsername={username}
              key={`${index}-${note.id}`}
              type='classroom'
              className='mb-3 mx-1 border bg-white text-dark'
            />
          )
        })}
      </div>
    </> :
      <p className='text-center mt-3'>
        You don't have any classes yet.<br />
        TODO: LINK TUTORIAL VIDEO
      </p>}
  </>);
}
