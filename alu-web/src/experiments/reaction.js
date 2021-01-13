import React, { useEffect, useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { shuffle } from '../utils';
import './reaction.css';


export function ReactionExperiment(props) {
  const [slideNumber, setSlideNumber] = useState(0);
  const [answers, setAnswers] = useState({});

  const collectData = title => {
    return data => {
      let newAnswers = answers;
      newAnswers[title] = { correct: data.correct, incorrect: data.incorrect };
      setAnswers(newAnswers);
    }
  }

  const slides = [
    (<TextSlide title='Introduction'>
      This experiment will measure your reaction time in perception vs. sensation.<br />
      By pressing "Next" you agree to participate in the experiment (your data will not be collected, unless you willingly give it to us).
    </TextSlide>),
    (<TextSlide title='Part I'>
      In Part I, you will be shown two black words.{' '}
      Click the black word that has the meaning of the color in the middle of the screen.<br />
      Alternatively, you can use the keys 'F' and 'J' on your keyboard (if you choose to use the keyboard, please use the keyboard for the entire experiment, and vice-versa).
    </TextSlide>),
    (<ReactionSlide type='control' collectData={collectData('blackWords')} />),
    (<TextSlide title='Part II'>
      In Part II, you will be shown two colored words.{' '}
      Click the colored word that has the same meaning as the color in the middle of the screen (not the same color).
    </TextSlide>),
    (<ReactionSlide type='colored-words-meaning' collectData={collectData('coloredWordsMeaning')} />),
    (<TextSlide title='Part III'>
      In Part III, you will be shown two colored words.{' '}
      Click the colored word that has the same color as the color in the middle of the screen (not the same meaning).
    </TextSlide>),
    (<ReactionSlide type='colored-words-color' collectData={collectData('coloredWordsColor')} />),
    (<TextSlide title='Part IV'>
      In Part IV, you will be shown two colored boxes.{' '}
      Click the colored box that has the same color as the color in the middle of the screen.
    </TextSlide>),
    (<ReactionSlide type='colored-box' collectData={collectData('coloredBox')} />),
    (<TextSlide title='Debrief'>
      Thank you for furthering our psychological research!
      <br /><br />
      Your Responses:
      <ul>
        <li>Control Game: {answers?.blackWords?.correct}/{answers?.blackWords?.correct + answers?.blackWords?.incorrect}</li>
        <li>Colored Words Meaning: {answers?.coloredWordsMeaning?.correct}/{answers?.coloredWordsMeaning?.correct + answers?.coloredWordsMeaning?.incorrect}</li>
        <li>Colored Words Color: {answers?.coloredWordsColor?.correct}/{answers?.coloredWordsColor?.correct + answers?.coloredWordsColor?.incorrect}</li>
        <li>Colored Boxes: {answers?.coloredBox?.correct}/{answers?.coloredBox?.correct + answers?.coloredBox?.incorrect}</li>
      </ul>
    </TextSlide>),
  ];

  return (<>
    {slides[slideNumber]}
    {slideNumber < slides.length - 1 && <div className='text-center mx-auto'>
      <Button
        onClick={() => setSlideNumber(slideNumber + 1)}
        className='mx-auto text-center'
        style={{ width: '200px' }}
      >
        Next
      </Button>
    </div>}
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


const colors = ['red', 'green', 'blue', 'purple', 'orange', 'yellow', 'brown', 'pink'];
const timeLimit = 15000;
function ReactionSlide(props) {
  const {type, collectData} = props;
  const [colorChoices, setColorChoices] = useState({});
  const [colorChoicesDidSet, setColorChoicesDidSet] = useState(false);
  const [answers, setAnswers] = useState({correct: 0, incorrect: 0});
  const [gameRunning, setGameRunning] = useState(false);
  const [timerDidStart, setTimerDidStart] = useState(false)

  // Start the game for `timeLimit` milliseconds
  useEffect(() => {
    if (!timerDidStart) {
      setTimerDidStart(true);
      setGameRunning(true);
      setTimeout(() => {
        setGameRunning(false);
      }, timeLimit);

    }
  }, [timerDidStart, gameRunning]);
  
  // Setup listener for using the keyboard to answer
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });

  // Get new colors after the answer (and collect data when game is done)
  useEffect(() => {
    // Collect data when the game is over
    if (!gameRunning && answers.correct > 0) {
      collectData(answers);
      return;
    }

    if (!colorChoicesDidSet) {
      setColorChoicesDidSet(true);
      // This is O(n) when it should be O(1), but it doesn't really matter
      const shuffledColors = shuffle(colors);
      switch (type) {
        case 'control':
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
        case 'colored-box':
          setColorChoices({
            leftMeaning: shuffledColors[0],
            rightMeaning: shuffledColors[1],
            centerColor: shuffledColors[Math.floor(Math.random()*2)], // random 1 or 2
            leftColor: shuffledColors[0],
            rightColor: shuffledColors[1],
          });
          break;
        default:
          break;
      }
    }
  }, [type, colorChoices, colorChoicesDidSet, answers, collectData, gameRunning, timerDidStart]);

  // Called either via keyboard or click when the user answers
  const handleChoice = choice => {
    return event => {
      if (event) event.preventDefault();
      let leftRight;
      switch (type) {
        case 'control': case 'colored-words-meaning':
          // Answer on meaning of word
          leftRight = [colorChoices.leftMeaning, colorChoices.rightMeaning];
          break;
        case 'colored-words-color': case 'colored-box':
          // Answer on color of word
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
    if (!gameRunning) return;
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
            color: type.startsWith('colored') ? colorChoices.leftColor : 'black',
            backgroundColor: type === 'colored-box' ? colorChoices.leftColor : null,
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
            color: type.startsWith('colored') ? colorChoices.rightColor : 'black',
            background: type === 'colored-box' ? colorChoices.rightColor : null,
            fontSize: 'xx-large',
            fontWeight: 'bold',
          }}
        >
          {colorChoices.rightMeaning}
        </p>
      </Col>
    </Row>}
    {!gameRunning && <p className='text-center mt-5'>
      The game has finished.  You scored {answers.correct}/{answers.incorrect + answers.correct} in {Math.floor(timeLimit / 1000)} seconds. Please click "Next" to continue.
    </p>}
  </>);
}
