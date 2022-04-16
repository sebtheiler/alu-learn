import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { DisplayProfileInline } from '../profiles';
import { MinifiedProfile } from '../profiles/types';
import './about.scss';

const sebProfile: MinifiedProfile = {
  first_name: 'Sebastian',
  last_name: 'Theiler',
  username: 'sebtheiler',
  id: 1,
}

export default function AboutPage() {
  return (
    <Container className='mt-5'>
      <h1 className='text-center mx-auto'>Make Memory a Choice.</h1>
      <Row className='text-center'>
        <h3 className='mx-auto'>Alu allows you to learn anything and remember everything</h3>
        <p className='mx-auto'>
          By using spaced repetition, Alu enables you to turn your memory into a steel trap and to choose what you want to remember
        </p>
      </Row>
      <hr />

      <Row>
        <h2>Why memory?  Why Alu?</h2>
        <p>
          Memory isn't just about cramming.  It's about storing information in your mind so that you can make insightful
          connections and have novel ideas.  Although it can get a bad rap, memory is vital to the creative process.  On top of this,
          by using Alu to reduce the amount of time you spend memorizing, you are able to spend more time critically engaging with
          content and working creatively.
        </p>
        <p>
          To help you memorize efficiently, Alu uses spaced repetition, a technique that optimizes your memory retention
          by putting intervals between when you study material.  Alu's sharing system also allows you to collaborate with
          others on a deck, so that you don't need to make flashcards all by yourself.  Some
          {' '}<a href='/explore/' target='_blank'>community decks</a> even allow for contributions from everyone
          (with approval), so that learning is a team effort.
        </p>
        <p>
          In the future, Alu will be more than just flashcards, providing lessons that help you learn content.
          But rather than following the traditional way of having a central company dictate what and how everyone learns,
          Alu will enable learners like you to contribute to lessons.  Think of it like a Wikipedia designed to teach
          you in the way you learn best, that also includes studying features like spaced repetition flashcards.
          This is what I call an <em>open-source education</em>: the learners decide how they learn.
        </p>
      </Row>
      <hr />

      <h1 className='text-center mx-auto'>Alu's Key Features</h1>
      <Row className='mt-2'>
        <Col md={6}>
          <h2>Spaced Repetition</h2>
          <p>
            Memorizing information is boring, but important.  Alu seeks to make it easier so you can spend more time critically
            engaging with content.
          </p>
          <p>
            Alu does this through <em>spaced repetition</em>.  Spaced repetition is the process of studying material over
            spread-out intervals, rather than all at once.  This is both more efficient and more effective than cramming.
            Alu uses spaced repetition by showing you the flashcards you remember better less often, and the flashcards
            you struggle with more often.
          </p>
          <p>
            If you don't review content, you will forget it.  Alu stops that.
          </p>
        </Col>
        <Col md={6}>
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
        <Col md={6}>
          <img
            src='/static/images/global-sharing-system.png'
            alt="Illustration of Alu's sharing system, and how people from around the world can contribute to a deck"
            className='w-100'
          />
        </Col>
        <Col md={6}>
          <h2>Global Sharing System</h2>
          <p>
            With Alu, you can share flashcards with (or use flashcards from!) anyone around the world.
            Alu's sharing system also allows you to collaborate with friends to build a deck, or even to
            let anyone submit an edit.
          </p>
          <p>
            One of my dreams for Alu is to build engaged and eager communities around different subjects, where anyone and
            everyone can help improve decks for subjects that interest them.
            Alu's sharing system is a step in that direction.
          </p>
        </Col>
      </Row>
      <Row className='mt-5'>
        <Col md={6}>
          <h2>Skill Tree</h2>
          <p>
            In psychology, one of the major models for how memories are organized are hierarchies.  Hierarchies
            start at general subjects, and end in specific details.
          </p>
          <p>
            Alu builds off of this structure with <em>skill trees.</em>  Skill trees are organized into main sections
            and sub sections, giving you a greater level of control over how your flashcards are organized.
            You can review each section individually, or study the deck as a whole, all powered by spaced repetition.
          </p>
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
      
      <h1 className='text-center mx-auto'>The Story of Alu</h1>
      <Row className='mt-2 mb-5'>
        <Col md={8}>
          <p>
            Hi!  I'm<span className='ml-1' /><DisplayProfileInline profile={sebProfile} />, a New York high school junior, and I created Alu.
            I've been a life-long learner and, in the summer of 2020, I sought out to create a tool to help me learn more effectively.
            Inspired by <a href='https://supermemo.guru/wiki/SuperMemo_Guru' target='_blank' rel='noreferrer'>Dr. Piotr Wozniak</a>'s philosophy
            of free schooling and self-guided learning, I designed Alu with the core principles of enabling people to learn whatever they want and to remember all of it.
          </p>
          <p>
            In the fall of 2020, when I returned to school, I realized how much potential Alu had in helping my classmates and I
            do well in our classes&#8212;especially on AP&reg; exams.  I worked to make flashcard decks for the AP&reg; classes I was taking
            as quickly as possible and share them with my classmates.  It caught on!  By May 2021, students at my school and I had
            studied nearly 80,000 total flashcards, and many who used Alu consistently (including myself) were able to achieve high scores.
          </p>
          <p>
            In 2022, I hope to work with others to expand Alu to other schools and enable more students to take advantage of its
            spaced repetition and free flashcards to do well on their exams and to memorize more of what they learn.
            To help Alu live up to its vision of an open-source education, I will also build an even simpler and more powerful
            sharing system that makes collaborating on decks and sharing knowledge easier, and allows for creating lessons alongside flashcards.
          </p>
          <p>
            Want to be a part of that?
          </p>
          <div>
            <Button
              className='mt-1'
              style={{ width: '350px' }}
              href='/?showLoginRequired=true'
            >
              Sign Up for Alu
            </Button>
          </div>
        </Col>
        <Col md={4} style={{ transform: 'translateY("-35px")' }}>
          <img
            src='/static/images/sebastian.jpg'
            alt='Sebastian, the creator of Alu'
            id='sebastian-img'
            className='w-100'
          />
          <div className='social-media'>
            <p className='mt-1 text-center'><strong>Follow Sebastian</strong></p>
            <Row className='mx-2'>
              <Col>
                <a href='https://twitter.com/seb_theiler' target='_blank' rel='noreferrer'>
                  <i className='fa-brands fa-twitter fa-2x' />
                </a>
              </Col>
              <Col>
                <a href='https://github.com/sebtheiler' target='_blank' rel='noreferrer'>
                  <i className='fa-brands fa-github fa-2x' />
                </a>
              </Col>
              <Col>
                <a href='https://medium.com/@sebastiankt9' target='_blank' rel='noreferrer'>
                  <i className='fa-brands fa-medium fa-2x' />
                </a>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
