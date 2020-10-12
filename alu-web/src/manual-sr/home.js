import React, {useState, useEffect} from 'react';
import { Button } from 'react-bootstrap';
import { apiManualSRTaskList } from '../lookup';
import { errorHandler, timeUntil } from '../utils';


export function ManualSRHome(props) {
  const [manualSRTasks, setManualSRTasks] = useState(null);
  const [manualSRTasksDidSet, setManualSRTasksDidSet] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);
  const [loadingNext, setLoadingNext] = useState(false);

  useEffect(() => {
    if (manualSRTasksDidSet === false) {
      setManualSRTasksDidSet(true);
      apiManualSRTaskList((response, status) => {
        if (status === 200) {
          setManualSRTasks(response.results);
          setNextUrl(response.next);
        } else {
          // Error getting list of manual sr tasks
          errorHandler(response, status, 7000);
        };
      });
    };
  }, [manualSRTasks, manualSRTasksDidSet]);

  const handleLoadNext = (event) => {
    event.preventDefault();
    if (nextUrl !== null && !loadingNext) {
      setLoadingNext(true);
      apiManualSRTaskList((response, status) => {
        if (status === 200) {
          setNextUrl(response.next);
          const newTasks = [...manualSRTasks].concat(response.results);
          setManualSRTasks(newTasks);
        } else {
          // Error handling next set of manual sr tasks (pagination)
          errorHandler(response, status, 7001);
        };
        setLoadingNext(false);
      }, nextUrl);
    };
  };

  return (<>
    <h1 className='text-center'>Manual Spaced Repetition</h1>
    <h2>Tasks</h2>
    {manualSRTasks ? manualSRTasks.map((task, index) => {
      const nextReviewDate = new Date(task.next_review);

      return (<React.Fragment key={`task-${index}`}>
        <div
          className='py-5 px-3'
          style={{
            border: '1px solid black',
            borderRadius: '5px',
          }}
        >
          <h3 className='mb-0'>{task.title}</h3>
          <small className='text-secondary'>
            Due {timeUntil(nextReviewDate)} ({nextReviewDate.toString().substring(0, 15)})
          </small>
          <p className='mt-3'>Description...</p>
        </div>
        <br />
      </React.Fragment>)
    }) : 'Loading...'}
    {nextUrl && <Button variant='outline-primary' onClick={handleLoadNext}>
      {loadingNext ? 'Loading...' : 'Load More'}
    </Button>}
  </>);
};