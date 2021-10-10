import ClassroomSelection from './classroom-selection';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import CreateClassroomButton from './buttons/create-classroom';
import CreateDeckButton from './buttons/create-deck';
import DeckSelection from './deck-selection';
import HomeComponent from './home-component';
import JoinClassroomButton from './buttons/join-classroom';
import Meta from './meta';
import Row from 'react-bootstrap/Row';
import SkillTree from './skill-tree';
import { Settings } from '../profiles/types';
import { StudentClassroom, TeacherClassroom} from '../teachers';
import { backendFetch, useAsyncDispatch, useObjectList } from '../lookup/lookup';
import { classroomReducer, HomeActionDispatch, deckReducer } from './context';
import { useState } from 'react';
import './home.scss';
import 'react-calendar-heatmap/dist/styles.css';

interface Selected {
  selectedType: 'HOME' | 'DECK' | 'CLASS_TAUGHT' | 'CLASS_IN';
  selected: number;
}

interface SkillTreeHomeProps {
  defaultDeckSelected?: string;
  defaultClassroomSelected?: string;
  userType: Settings['user_type'];
};
export default function SkillTreeHome({ defaultDeckSelected, defaultClassroomSelected, userType }: SkillTreeHomeProps) {
  const [decks, decksDispatch] = useObjectList('decks', 'deck', deckReducer);
  const [classroomsTaught, classroomsTaughtDispatch] = useAsyncDispatch(
    () => backendFetch('GET', 'teachers/classroom/taught-list/'), [],
    classroomReducer,
    undefined,
    ['TEACHER', 'MIXED'].includes(userType),
  );
  const [classroomsIn, classroomsInDispatch] = useAsyncDispatch(
    () => backendFetch('GET', 'teachers/classroom/in-list/'), [],
    classroomReducer,
    undefined,
    ['STUDENT', 'MIXED'].includes(userType),
  );
  const [selected, setSelected] = useState<Selected>(() => {
    let selectedType: Selected['selectedType'];
    if (defaultDeckSelected) {
      selectedType = 'DECK';
    } else if (defaultClassroomSelected) {
      selectedType = userType === 'TEACHER' ? 'CLASS_TAUGHT' : 'CLASS_IN';
    } else {
      selectedType = 'HOME';
    }

    let selected = parseInt((defaultDeckSelected || defaultClassroomSelected) ?? '0');

    return { selectedType, selected };
  });

  return (
    <HomeActionDispatch.Provider value={{
      decks, decksDispatch,
      classroomsTaught, classroomsTaughtDispatch,
      classroomsIn, classroomsInDispatch,
    }}>
      <Container className='text-center mt-3' fluid>
        <Row>
          <Col md={3} sm={12}>
            <h1 className='invisible'>.</h1>
            <div>
              <HomeButton
                isSelected={selected.selectedType === 'HOME'}
                setSelected={() => setSelected({
                  ...selected,
                  selectedType: 'HOME',
                })}
              />
            </div>
            <div>
              <p className='text-left mb-1'><strong>Decks</strong></p>
              {decks ? decks.map(deck =>
                <DeckSelection
                  deck={deck}
                  onClick={() => {
                    setSelected({ selectedType: 'DECK', selected: deck.id });
                    window.history.pushState(`alu/deck/${deck.id}/`, deck.title, `/deck/${deck.id}/`);
                  }}
                  selected={selected.selected === deck.id && selected.selectedType === 'DECK'}
                  key={`deck-${deck.id}`}
                />
              ) : <p>Loading decks…</p>}
              <CreateDeckButton />
            </div>
            {['TEACHER', 'MIXED'].includes(userType) && <div>
              <p className='text-left mb-1'><strong>Classes{userType === 'MIXED' && ' Taught'}</strong></p>
              {classroomsTaught ? classroomsTaught.map(classroom =>
                <ClassroomSelection
                  classroom={classroom}
                  onClick={() => {
                    setSelected({ selectedType: 'CLASS_TAUGHT', selected: classroom.id });
                    window.history.pushState(`alu/classroom/${classroom.id}/`, classroom.title, `/classroom/${classroom.id}/`);
                  }}
                  selected={selected.selected === classroom.id && selected.selectedType === 'CLASS_TAUGHT'}
                  key={`class-${classroom.id}`}
                />
              ) : <p>Loading classrooms…</p>}
              <CreateClassroomButton />
            </div>}
            {['STUDENT', 'MIXED'].includes(userType) && <div>
              <p className='text-left mb-1'><strong>Classes{userType === 'MIXED' && ' In'}</strong></p>
              {classroomsIn ? classroomsIn.map(classroom =>
                <ClassroomSelection
                  classroom={classroom}
                  onClick={() => {
                    setSelected({ selectedType: 'CLASS_IN', selected: classroom.id });
                    window.history.pushState(`alu/classroom/${classroom.id}/`, classroom.title, `/classroom/${classroom.id}/`);
                  }}
                  selected={selected.selected === classroom.id && selected.selectedType === 'CLASS_IN'}
                  key={`class-${classroom.id}`}
                />
              ) : <p>Loading classrooms…</p>}
              <JoinClassroomButton />
            </div>}
          </Col>
          <Col md={6} sm={12} className='px-4'>
            {selected.selectedType === 'HOME' && <HomeComponent isTeacher={userType === 'TEACHER'} />}
            {selected.selectedType === 'DECK' && <SkillTree deck={decks?.filter(deck => deck.id === selected.selected)[0]} />}
            {selected.selectedType === 'CLASS_TAUGHT' && <TeacherClassroom classroom={classroomsTaught?.filter(classroom => classroom.id === selected.selected)[0]} />}
            {selected.selectedType === 'CLASS_IN' && <StudentClassroom classroom={classroomsIn?.filter(classroom => classroom.id === selected.selected)[0]} />}
          </Col>
          <Col md={3} sm={12}>
            <h1 className='invisible'>.</h1>
            <Meta isTeacher={userType === 'TEACHER'} />
          </Col>
        </Row>
      </Container>
    </HomeActionDispatch.Provider>
  );
}

interface HomeButtonProps {
  isSelected: boolean;
  setSelected(): void;
}
function HomeButton({ isSelected, setSelected }: HomeButtonProps) {
  return (
    <div className='deck-selection-item mb-4'>
      <div
        className={'deck-selection-main mb-0' + (isSelected ? ' selected' : '')}
        role='button'
        onClick={() => {
          setSelected();
          window.history.pushState(`alu/home/`, 'Home', `/home/`);
        }}
      >
        <p>
          <span className='title-text'>Home</span>
          <span><i className='fas fa-home fa-2x float-left mt-2 ml-2' /></span>
        </p>
      </div>
    </div>
  );
}
