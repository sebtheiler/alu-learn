import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { RenderRichText, sample, shuffle } from '../../utils';
import './quiz.css';

export function QuizGame(props) {
  const {flashcards, numQuestions} = props;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [answersDidSet, setAnswersDidSet] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [guessedAnswers, setGuessedAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [numCorrect, setNumCorrect] = useState(0);

  useEffect(() => {
    if (!answersDidSet) {
      setAnswersDidSet(true);

      const otherFlashcards = [...flashcards.slice(0, currentQuestion), ...flashcards.slice(currentQuestion + 1)];
      const incorrectAnswers = sample(otherFlashcards, 3);
      const correctAnswer = flashcards[currentQuestion];
      const newAnswers = shuffle([
        ...incorrectAnswers,
        correctAnswer,
      ]);

      setAnswers(newAnswers);
    }
  }, [flashcards, answers, answersDidSet, currentQuestion]);

  const handleAnswerClick = i => {
    return event => {
      event.preventDefault();
      if (!showAnswer) {
        if (answers[i].id === flashcards[currentQuestion].id) {
          setShowAnswer(true);
          if (guessedAnswers.length === 0) {
            setNumCorrect(numCorrect + 1);
          }
        } else {
          setGuessedAnswers([...guessedAnswers, answers[i].id]);
        }
      }
    }
  }

  const handleNextQuestion = event => {
    event.preventDefault();

    if (currentQuestion < numQuestions - 1) {
      setShowAnswer(false);
      setCurrentQuestion(currentQuestion + 1);
      setAnswersDidSet(false);
      setGuessedAnswers([]);
    } else {
      setFinished(true);
    }
  }

  if (finished) {
    return (<>
      <div className='text-center'>
        <p>Congratulations!  You've finished {numQuestions} questions with {Math.ceil(numCorrect/numQuestions*100)}% accuracy!</p>
        <Button
          onClick={() => window.location.reload()}
          className='text-center mx-auto'
        >
          Play Again
        </Button>
      </div>
    </>);
  }

  return (<>
    <p>Question {currentQuestion + 1}/{numQuestions}</p>
    <div className='text-center'>
      <RenderRichText text={flashcards[currentQuestion].deck_fields[0].text} fixSlateLazy />
      <hr />
      <ol style={{ paddingInlineStart: '0' }}>
        {answers.map((answer, i) => (
          <li
            className={'answer' + (
              guessedAnswers.includes(answer.id) ? ' incorrect' : (
              (showAnswer && answer.id === flashcards[currentQuestion].id) ? ' correct' : ''
              ))}
          key={i}>
            <button className='not-a-button' onClick={handleAnswerClick(i)}>
              <RenderRichText text={answer.deck_fields[1].text} fixSlateLazy />
            </button>
          </li>
        ))}
        {showAnswer && (
          <Button onClick={handleNextQuestion} block>
            {currentQuestion === flashcards.length - 1 ? 'Finish' : 'Next Question'}
          </Button>
        )}
      </ol>
    </div>
  </>);
}
