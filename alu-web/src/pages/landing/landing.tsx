import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { RegisterLoginModal } from './forms';
import { useState } from 'react';
import './landing.scss';

const exampleDecks = [
  { title: 'AP World History', link: '/l/world/', icon: 'fa-monument' },
  { title: 'AP Psychology', link: '/l/psych/', icon: 'fa-brain' },
  { title: 'AP US Government and Politics', link: '/l/usgov/', icon: 'fa-landmark-dome' },
  { title: 'AP Biology', link: '/l/bio/', icon: 'fa-dna' },
  { title: 'Create Your Own!', link: '/?showLoginRequired=true', icon: 'fa-plus' },
];


interface LandingComponentProps {
  showLoginRequired: 'true' | 'false';
  returnUrl: string;
}
export default function LandingComponent({ showLoginRequired, returnUrl }: LandingComponentProps) {
  const [modalIsOpen, setModalIsOpen] = useState(showLoginRequired === 'true');

  return (<div className='my-5'>
    <Row className='text-center'>
      <RegisterLoginModal
        modalIsOpen={modalIsOpen}
        closeModal={() => setModalIsOpen(false)}
        returnUrl={returnUrl}
      />
      <Col>
        <h1>Learn Anything.  Remember Everything.</h1>
        <p className='lead'>
          Flashcards that automatically optimize when you should review them<br />
          Spend less time studying, and get more out of it
        </p>
        <Button
          type='submit'
          className='mt-1'
          style={{ width: '250px' }}
          onClick={() => setModalIsOpen(true)}
          id='main-signup-btn'
        >
          Sign Up
        </Button>
        <div className='mt-5'>
          <p className='text-secondary mb-1'>Already have an account? Log-in instead</p>
          <Button
            variant='outline-primary'
            href='/login/'
            className='px-4'
          >
            Login
          </Button>
        </div>
      </Col>
    </Row>
    <Container className='my-5'>
      <hr />
      <Row className='snazzy-statistics'>
        <Col>
          <h2 className='users-stat'>250+</h2>
          <p><strong>Users</strong></p>
        </Col>
        <Col>
          <h2 className='flashcards-stat'>150k+</h2>
          <p><strong>Flashcards Studied</strong></p>
        </Col>
        <Col>
          <h2 className='hours-stat'>380+</h2>
          <p><strong>Hours Spent Studying</strong></p>
        </Col>
      </Row>
      <hr />
      <h1 className='text-center mb-3'>Community Flashcard Decks</h1>
      <Row className='text-center'>
        {exampleDecks.map((deckInfo, i) =>
          <a
            href={deckInfo.link}
            className='col-md-3 mx-auto'
            key={i}
          >
            <div className='example-deck'>
              <div className='example-deck-icon'>
                <i className={`fas ${deckInfo.icon} fa-5x`} />
              </div>
              <div className='example-deck-text'>
                <p className='example-deck-title'>{deckInfo.title}</p>
              </div>
            </div>
          </a>
        )}
        <span className='stretch' />
      </Row>
      <hr />
      <Row className='how-alu-helps'>
        <h1 className='mx-auto'>How Alu Can Help You</h1>
        <Row>
          <Col md={6} className='text-description'>
            <h2>Spaced Repetition</h2>
            <p>Spaced repetition enables you to memorize more effectively by automatically putting intervals between when you review material</p>
          </Col>
          <Col md={6} className='image-description'>
            <img
              src='/static/images/spaced-repetition.png'
              alt='Graph depicting how memory decays over time, and how spaced repetition can be used to combat that'
              className='w-100'
            />
            <div className='text-center'>
              <small className='text-secondary'>Spaced repetition stops you from forgetting information as fast</small>
            </div>
          </Col>
        </Row>
        <Row className='mt-5'>
          <Col md={6} className='image-description'>
            <img
              src='/static/images/global-sharing-system.png'
              alt="Illustration of Alu's sharing system, and how people from around the world can contribute to a deck"
              className='w-100'
            />
          </Col>
          <Col md={6} className='text-description'>
            <h2>Global Sharing System</h2>
            <p>Easily share and collaborate on flashcard decks</p>
          </Col>
        </Row>
        <Row className='mt-5'>
          <Col md={6} className='text-description'>
            <h2>Skill Tree</h2>
            <p>Organize decks into units and subunits that make it easy to review specific content, or an entire course</p>
          </Col>
          <Col md={6} className='image-description'>
            <img
              src='/static/images/skill-tree.png'
              alt='Illustration of an example skill tree'
              className='w-100'
            />
          </Col>
        </Row>
      </Row>
    </Container>
    <div className='text-center'>
      <Button
        className='mt-1 mx-auto text-center'
        style={{ width: '350px' }}
        onClick={() => setModalIsOpen(true)}
        id='main-signup-btn'
      >
        Sign Up
      </Button>
    </div>
  </div>);
}
