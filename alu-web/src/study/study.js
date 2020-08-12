import React, {useEffect} from 'react';


export function StudyElement(props) {
  const {currentCard, showAnswer, showAnswerHandler, backendGradeUpdate, handleKeyDown} = props;
  
  // Used for handling keypresses
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAnswer, handleKeyDown]);

  // Allows the buttons to use the same function
  // as is used when handling keypressess for 1,2,3,4
  const buttonIntervalWrapper = (grade) => {
    return () => {
      backendGradeUpdate(grade);
    };
  };

  return (<div>
            <div className='col-md-12 text-center'style={{minWidth: '200px'}}>
              <p>{currentCard ? currentCard.front_text : null}</p>
            </div>
            <div className='col-md-12 text-center' style={{minWidth: '200px'}}>
              <p>{currentCard && showAnswer ? currentCard.back_text : ''}</p>
            </div>
            <footer className='fixed-bottom mb-5'>
              <div className='mb-5'>
                <div className={'col-md-12 text-center btn-group mb-5' + (showAnswer ? ' d-none' : '')}>
                    <button onClick={showAnswerHandler} className='btn btn-primary'>Show Answer</button>
                </div>
                <div className={'col-md-12 text-center btn-group mb-5' + (!showAnswer ? ' d-none' : '')}>
                  <button onClick={buttonIntervalWrapper(1)} className='btn btn-primary mx-1'>Again</button>
                  <button onClick={buttonIntervalWrapper(2)} className='btn btn-primary mx-1'>Hard</button>
                  <button onClick={buttonIntervalWrapper(3)} className='btn btn-primary mx-1'>Good</button>
                  <button onClick={buttonIntervalWrapper(4)} className='btn btn-primary mx-1'>Easy</button>
                </div>
              </div>
            </footer>
          </div>)
};