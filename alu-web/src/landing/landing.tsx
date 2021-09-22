import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { MainHook } from './components';
import { RegisterLoginModal } from './forms';
import { useState } from 'react';


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
        <MainHook onClick={() => setModalIsOpen(true)} />
      </Col>
    </Row>
    <Container className='my-5'>
      <hr />
      <Row>
        <Col md={6}>
          <h2>Spaced Repetition</h2>
          <p>Memorizing information is boring, but important.  Alu seeks to make it easier so you can spend more time critically engaging with content.</p>
          <p>Alu does this through <em>spaced repetition</em>.  Spaced repetition is the process of studying material over spread-out intervals, rather than all at once.  This is both more efficient and more effective than cramming.  Alu uses spaced repetition by showing you the flashcards you remember better less often, and the flashcards you struggle with more often.</p>
          <p>If you don't review content, you will forget it.  Alu stops that.</p>
        </Col>
        <Col md={6}>
          <img
            src='/static/images/spaced-repetition.webp'
            alt='Graph depicting how memory decays over time, and how spaced repetition can be used to combat that'
            className='w-100'
            />
          <div className='text-center'>
            <small className='text-secondary'>Spaced repetition stops you from forgetting information as fast</small>
          </div>
        </Col>
      </Row>
      <Row className='mt-5'>
        <Col md={6}>
          <img
            src='/static/images/global-sharing-system.png'
            alt="Illustration of Alu's sharing system, and how people from around the world can contribute to a deck"
            className='w-100'
            />
        </Col>
        <Col md={6}>
          <h2>Global Sharing System</h2>
          <p>With Alu, you can share flashcards with (or use flashcards from!) anyone around the world.  Alu's sharing system also allows you to collaborate with friends to build a deck, or even to let anyone submit an edit.</p>
          <p>One of my dreams for Alu is to build engaged and eager communities around different subjects, where anyone and everyone can help improve decks for subjects that interest them.  Alu's sharing system is a step in that direction.</p>
        </Col>
      </Row>
      <Row className='mt-5'>
        <Col md={6}>
          <h2>Skill Tree</h2>
          <p>In psychology, one of the major models for how memories are organized are hierarchies.  Hierarchies start at general subjects, and end in specific details.</p>
          <p>Alu builds off of this structure with <em>skill trees.</em>  Skill trees are organized into main sections and sub sections, giving you a greater level of control over how your flashcards are organized.  You can review each section individually, or study the deck as a whole, all powered by spaced repetition.</p>
        </Col>
        <Col md={6}>
          <img
            src='/static/images/skill-tree.png'
            alt='Illustration of an example skill tree'
            className='w-100'
            />
        </Col>
      </Row>
      <hr />
      <Row className='mt-3 text-center'>
        <Col md={6} className='mx-auto'>
          <h2>New Features Ahead!</h2>
          <p>Alu is still in its infancy and I'm constantly working on new features.  Some of the highlights include:</p>

          <div className='text-left'>
            <ul>
              <li><strong>Flashcard Links:</strong> Similar to how Wikipedia has previews of other articles when you hover over a link, you will be able to link Alu flashcards to give quick context on a different piece of information.</li>
              <li><strong>New Flashcard Types:</strong> Flashcards should be more than just text!  New flashcards will include being able to blur-out part of an image, and having you figure out what should go there; as well as being able to click the correct location.</li>
              <li><strong>More than Flashcards:</strong> In line with the dream of building communities around subjects, I'm working on a way for Alu to have more than just flashcards.  In the future, Alu will be able to have mini-lessons for content (these will also be controlled by the sharing system!), making it a one-stop shop for learning and memorizing.</li>
            </ul>
          </div>

          <br />
          <p><em>If you want to be a part of any of that, I invite you to sign up! :)</em></p>
        </Col>
      </Row>
    </Container>
    {/* <Container>
      <Row className='container mt-5'>
        <LandingArticle />
      </Row>
    </Container> */}
  </div>);
}
