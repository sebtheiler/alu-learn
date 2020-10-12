import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { getAnkiInterval } from '../decks/study/algorithm';
import {timeUntil} from '../utils';

export function ManualSRTask(props) {
  const {nextReviewDate, task} = props;
  const [dueDateString, timePosition] = timeUntil(nextReviewDate);

  const interval1 = getAnkiInterval(task, 1);
  const interval2 = getAnkiInterval(task, 2);
  const interval3 = getAnkiInterval(task, 3);
  const interval4 = getAnkiInterval(task, 4);

  const buttonIntervalWrapper = (grade) => {
    const reviewInfo = eval(`interval${grade};`);

    return (event) => {
      console.log(reviewInfo)
      event.preventDefault();
    };
  };

  return (<>
    <div
      className='p-3'
      style={{
        border: '1px solid black',
        borderRadius: '5px',
      }}
    >
      <h3 className='mb-0'>{task.title}</h3>
      <small className='text-secondary'>
        Due {dueDateString} ({nextReviewDate.toString().substring(0, 15)})
      </small>
      <p className='mt-3'>Description...</p>
      {timePosition <= 0 && <>
        <hr />
        How did you do?
        <ButtonGroup className='ml-3'>
        <Button
              onClick={buttonIntervalWrapper(1)}
              className={'mx-1' + (interval1.interval === -1 ? ' d-none' : '')}
              variant='danger'
            >
              Again {interval1.interval.toString() + (interval1.isMinute ? 'm' : 'd')}
            </Button>
            <Button
              onClick={buttonIntervalWrapper(2)}
              className={'mx-1' + (interval2.interval === -1 ? ' d-none' : '')}
              variant='warning'
            >
              Hard {interval2.interval.toString() + (interval2.isMinute ? 'm' : 'd')}
            </Button>
            <Button
              onClick={buttonIntervalWrapper(3)}
              className={'mx-1' + (interval3.interval === -1 ? ' d-none' : '')}
              variant='success'
            >
              Good {interval3.interval.toString() + (interval3.isMinute ? 'm' : 'd')}
            </Button>
            <Button
              onClick={buttonIntervalWrapper(4)}
              className={'mx-1' + (interval4.interval === -1 ? ' d-none' : '')}
              variant='primary'
            >
              Easy {interval4.interval.toString() + (interval4.isMinute ? 'm' : 'd')}
            </Button>
        </ButtonGroup>
      </>}
    </div>
    <br />
  </>);
};