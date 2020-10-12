import React, {useState, useEffect} from 'react';
import { apiManualSRTaskList } from '../lookup';
import { errorHandler, timeSince } from '../utils';


export function ManualSRHome(props) {
  const [manualSRTasks, setManualSRTasks] = useState(null);
  const [manualSRTasksDidSet, setManualSRTasksDidSet] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);

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

  return (<>
    <h1 className='text-center'>Manual Spaced Repetition</h1>
    <h2>Tasks</h2>
    {manualSRTasks ? manualSRTasks.map(task => {
      const nextReviewDate = new Date(task.next_review);
      console.log(timeSince(nextReviewDate))
      console.log(task.next_review)
      console.log(nextReviewDate)

      return (<>
        <div
          className='py-5 px-3'
          style={{
            border: '1px solid black',
          }}
        >
          <h3 className='mb-0'>{task.title}</h3>
          <small className='text-secondary'>
            Due {nextReviewDate.toString().substring(0, 15)}
          </small>
          <p className='mt-3'>Description...</p>
        </div>
        <br />
      </>)
    }) : 'Loading...'}
  </>);
};