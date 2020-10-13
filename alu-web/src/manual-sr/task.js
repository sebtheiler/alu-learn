import React from 'react';
import { Button, ButtonGroup, Popover, OverlayTrigger } from 'react-bootstrap';
import { getAnkiInterval } from '../decks/study/algorithm';
import { apiManualSRTaskDelete, apiManualSRTaskUpdate } from '../lookup';
import {errorHandler, timeUntil} from '../utils';

export function ManualSRTask(props) {
  const {task, sortListCallback, deleteCallback} = props;
  const nextReviewDate = new Date(task.next_review);
  
  const [dueDateString, timePosition] = timeUntil(nextReviewDate);
  const interval1 = getAnkiInterval(task, 1);
  const interval2 = getAnkiInterval(task, 2);
  const interval3 = getAnkiInterval(task, 3);
  const interval4 = getAnkiInterval(task, 4);

  const buttonIntervalWrapper = (grade) => {
    const reviewInfo = {
      1: interval1,
      2: interval2,
      3: interval3,
      4: interval4,
    }[grade];

    return (event) => {
      event.preventDefault();
      console.log(reviewInfo)
      apiManualSRTaskUpdate(
        task.id,
        (new Date(reviewInfo.nextReviewDate)).toISOString().substring(0, 10),
        reviewInfo.learningStatus,
        reviewInfo.easeFactor,
        reviewInfo.interval,
        (response, status) => {
          if (status === 200) {
            task.next_review = (new Date(response.next_review)).toISOString().substring(0, 10);
            sortListCallback();
          } else {
            // Error updating manual SR task's review information
            errorHandler(response, status, 7003);
          };
        },
      );
    };
  };

  const deleteHandler = (event) => {
    event.preventDefault();
    apiManualSRTaskDelete(task.id, (response, status) => {
      if (status === 200) {
        deleteCallback(task.id);
      } else {
        // Error deleting manual SR task
        errorHandler(response, status, 7004);
      };
    });
  };

  const deletePopover = (
    <Popover>
      <Popover.Title as='h3'>Delete Task</Popover.Title>
      <Popover.Content>
        Please confirm that you want to delete this task. This action is IRREVERSIBLE.
        Only continue if you are absolutely sure you do not want this task.
        <Button
          variant='danger'
          className='mt-2'
          onClick={deleteHandler}
          block
        >
          Permanently Delete Task
        </Button>
      </Popover.Content>
    </Popover>
  );

  return (<>
    <div
      className='p-3'
      style={{
        border: '1px solid black',
        borderRadius: '5px',
      }}
    >
      <OverlayTrigger trigger='click' placement='bottom' overlay={deletePopover} rootClose>
        <Button
          style={{
            background: 'none',
            border: 'none',
            float: 'right'
          }}
          tabIndex='-1'
        >
          <i className='far fa-trash-alt fa-sm' style={{ padding: '0', color: '#dc3545' }} />
        </Button>
      </OverlayTrigger>
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