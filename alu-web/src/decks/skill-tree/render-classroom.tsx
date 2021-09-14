import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Classroom } from '../../teachers/types';
import './render-classroom.scss';

export default function RenderClassroom({ classroom }: { classroom?: Classroom }) {
  if (!classroom) return <p>Loading…</p>;
  return (
    <div className='mb-3'>
      <h1 className='text-center'>{classroom.title}</h1>
      <p className='text-center mb-0'>Classroom code: {classroom.code}</p>
      <small className='text-center text-secondary'>Give this code to your students so they can join your class</small>
      <br />
      <br />
      <div>
        {!classroom.deck ? <ChooseClassroomDeck classroom={classroom} /> : <p>{classroom.deck.title}</p>}
      </div>
    </div>
  );
}

function ChooseClassroomDeck({ classroom }: { classroom: Classroom }) {
  return (<>
    Your classroom needs to have a deck that your students can use.  Would you like to...
    <Row className='mt-3'>
      <Col md={6} xs={12} className='text-center'>
        <div className='choose-deck-option'>
          <div className='choose-deck-icon'>
            <i className='fas fa-plus fa-10x' />
          </div>
          <div className='choose-deck-text'>
            <p className='choose-deck-title'>Create New Deck</p>
          </div>
        </div>
      </Col>
      <Col md={6} xs={12} className='text-center'>
        <div className='choose-deck-option'>
          <div className='choose-deck-icon'>
            <i className='fas fa-link fa-10x' />
          </div>
          <div className='choose-deck-text'>
            <p className='choose-deck-title'>Attach Existing Deck</p>
          </div>
        </div>
      </Col>
    </Row>
  </>);
}
