import React from 'react';
import { apiClassroomsHomepage } from '../lookup';
import { useApiObjectHook } from '../utils';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { HomePageCards } from '../decks';
import { ClassroomEditCreateButton } from './buttons';
import { Classroom } from './types';


// TODO: remove this component
export function ClassroomsHomepage({ username }) {
  const [classrooms] = useApiObjectHook<Classroom[]>(apiClassroomsHomepage, 200, 8000);

  return (<>
    <div className='text-center my-3'>
      <ButtonGroup>
        <ClassroomEditCreateButton />
      </ButtonGroup>
    </div>
    {classrooms && classrooms.length > 0 && <>
      <HomePageCards
        items={classrooms}
        currentUsername={username}
        type='classroom'
      />
    </>}
    {classrooms && classrooms.length === 0 && <p className='text-center mt-3'>
      You don't have any classes yet.<br />
      <iframe width="70%" height="600px"
        title='Creating Classes in Alu (for teachers)'
        src="https://www.youtube.com/embed/QNpOwlFpCbU"
        className='mx-auto'
        allowFullScreen
      />
    </p>}
  </>);
}
