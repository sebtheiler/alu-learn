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
import { classroomReducer, HomeActionDispatch, deckReducer } from './context';
import { useObjectList } from '../../lookup/lookup';  // TODO: clean up imports
import { useState } from 'react';
import './home.scss';

interface Selected {
  selectedType: 'HOME' | 'DECK' | 'CLASS';
  selected: number;
}

// TODO: make default selected for classroom
export default function SkillTreeHome({ defaultSelected, isTeacherProp }: { defaultSelected?: string, isTeacherProp?: string}) {
  const isTeacher = isTeacherProp?.toLowerCase() === 'true';
  const [decks, decksDispatch] = useObjectList('decks', 'deck', deckReducer);
  const [classrooms, classroomsDispatch] = useObjectList('teachers', 'classroom', classroomReducer);
  console.log(classrooms)
  const [selected, setSelected] = useState<Selected>({
    selectedType: defaultSelected ? 'DECK' : 'HOME',
    selected: parseInt(defaultSelected ?? '0'),
  });

  return (
    <HomeActionDispatch.Provider value={{ decksDispatch, classroomsDispatch }}>
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
              <p className='text-left'><strong>Decks</strong></p>
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
            <div>
              <p className='text-left'><strong>Classes</strong></p>
              {classrooms ? classrooms.map(classroom =>
                <ClassroomSelection
                  classroom={classroom}
                  onClick={() => {
                    setSelected({ selectedType: 'CLASS', selected: classroom.id });
                    window.history.pushState(`alu/classroom/${classroom.id}/`, classroom.title, `/classroom/${classroom.id}/`);
                  }}
                  selected={selected.selected === classroom.id && selected.selectedType === 'CLASS'}
                  key={`class-${classroom.id}`}
                />
              ) : <p>Loading classrooms…</p>}
              {isTeacher ? <CreateClassroomButton /> : <JoinClassroomButton />}
            </div>
          </Col>
          <Col md={6} sm={12} className='px-4'>
            {selected.selectedType === 'HOME' && <HomeComponent />}
            {selected.selectedType === 'DECK' && <SkillTree deck={decks?.filter(deck => deck.id === selected.selected)[0]} />}
          </Col>
          <Col md={3} sm={12}>
            <h1 className='invisible'>.</h1>
            <Meta isTeacher={isTeacher} />
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
