import React, { useEffect, useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { shuffle } from '../utils';
import './reaction.css';


const slides = [
  (<TextSlide title='Introduction'>
    This experiment will measure your reaction time in perception vs. sensation
  </TextSlide>),
  (<TextSlide title='Part I'>
    In Part I, you will be shown two black words.{' '}
    Click the black word that has the meaning of the color in the middle of the screen.<br />
    Alternatively, you can use the keys 'F' and 'J' on your keyboard.
  </TextSlide>),
  (<ReactionSlide type='black-words' />),
  (<TextSlide title='Part II'>
    In Part II, you will be shown two colored words.{' '}
    Click the colored word that has the same meaning as the color in the middle of the screen (not the same color).
  </TextSlide>),
  (<ReactionSlide type='colored-words-meaning' />),
  (<TextSlide title='Part III'>
    In Part III, you will be shown two colored words.{' '}
    Click the colored word that has the same color as the color in the middle of the screen (not the same meaning).
  </TextSlide>),
  (<ReactionSlide type='colored-words-color' />),
  (<TextSlide title='Debrief'>
    Thank you for furthering our psychological research!  Your responses have been anonymously recorded.{' '}
  </TextSlide>),
];


export function ReactionExperiment(props) {
  const [slideNumber, setSlideNumber] = useState(0);

  return (<>
    {slides[slideNumber]}
    {slideNumber < slides.length - 1 && 
      <Button onClick={() => setSlideNumber(slideNumber + 1)} block>Next</Button>
    }
  </>);
}


function TextSlide(props) {
  const {title, children} = props;
  return (
    <div className='container-fluid text-center p-5'>
      <h1>{title}</h1>
      {children}
    </div>
  );
}


const colors = ['red', 'green', 'blue', 'purple', 'orange'];
const timeLimit = 15000;
function ReactionSlide(props) {
  const {type} = props;
  const [colorChoices, setColorChoices] = useState({});
  const [colorChoicesDidSet, setColorChoicesDidSet] = useState(false);
  const [answers, setAnswers] = useState({correct: 0, incorrect: 0});
  const [gameRunning, setGameRunning] = useState(false);
  const [timerDidStart, setTimerDidStart] = useState(false)

  useEffect(() => {
    if (!timerDidStart) {
      setTimerDidStart(true);
      setGameRunning(true);
      setTimeout(() => {
        setGameRunning(false);
      }, timeLimit);

    }
  }, [timerDidStart, gameRunning]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });
  useEffect(() => {
    if (!colorChoicesDidSet) {
      setColorChoicesDidSet(true);
      // This is O(n) when it should be O(1), but it doesn't really matter
      const shuffledColors = shuffle(colors);
      switch (type) {
        case 'black-words':
          setColorChoices({
            leftMeaning: shuffledColors[0],
            centerColor: shuffledColors[Math.floor(Math.random()*2)], // random 0 or 1
            rightMeaning: shuffledColors[1],
          });
          break;
        case 'colored-words-meaning':
          setColorChoices({
            leftMeaning: shuffledColors[0],
            rightMeaning: shuffledColors[1],
            centerColor: shuffledColors[Math.floor(Math.random()*2)], // random 0 or 1
            leftColor: shuffledColors[2],
            rightColor: shuffledColors[3],
          });
          break;
        case 'colored-words-color':
          setColorChoices({
            leftMeaning: shuffledColors[0],
            rightMeaning: shuffledColors[1],
            centerColor: shuffledColors[Math.floor(Math.random()*2) + 2], // random 2 or 3
            leftColor: shuffledColors[2],
            rightColor: shuffledColors[3],
          });
          break;
        default:
          break;
      }
    }
  }, [type, colorChoices, colorChoicesDidSet]);

  const handleChoice = choice => {
    return event => {
      if (event) event.preventDefault();
      let leftRight;
      switch (type) {
        case 'black-words': case 'colored-words-meaning':
          leftRight = [colorChoices.leftMeaning, colorChoices.rightMeaning];
          break;
        case 'colored-words-color':
          leftRight = [colorChoices.leftColor, colorChoices.rightColor];
          break;
        default:
          break;
      }
      if (leftRight[choice] === colorChoices.centerColor) {
        setAnswers({...answers, correct: answers.correct + 1});
      } else {
        setAnswers({...answers, incorrect: answers.incorrect + 1});
      }
      setColorChoicesDidSet(false);
    }
  }

  const handleKeyDown = event => {
    if (event.key === 'f' || event.key === 'F') {
      handleChoice(0)();
    } else if (event.key === 'j' || event.key === 'J') {
      handleChoice(1)();
    }
  }

  return (<>
    {gameRunning && <Row className='my-5'>
      <Col onClick={handleChoice(0)} className='choice-row'>
        <p
          className='text-center mx-auto mt-3'
          style={{
            color: type.startsWith('colored-words') ? colorChoices.leftColor : 'black',
            fontSize: 'xx-large',
            fontWeight: 'bold',
          }}
        >
          {colorChoices.leftMeaning}
        </p>
      </Col>
      <Col>
        <div
          className='mx-auto text-center'
          style={{
            width: '100px',
            height: '100px',
            background: colorChoices.centerColor,
          }}
        />
      </Col>
      <Col onClick={handleChoice(1)} className='choice-row'>
        <p
          className='text-center mx-auto mt-3'
          style={{
            color: type.startsWith('colored-words') ? colorChoices.rightColor : 'black',
            fontSize: 'xx-large',
            fontWeight: 'bold',
          }}
        >
          {colorChoices.rightMeaning}
        </p>
      </Col>
    </Row>}
    {!gameRunning && <p className='text-center'>
      The game has finished.  You scored {answers.correct}/{answers.incorrect + answers.correct} in {Math.floor(timeLimit / 1000)} seconds. Please click "Next" to continue.
    </p>}
  </>);
}
