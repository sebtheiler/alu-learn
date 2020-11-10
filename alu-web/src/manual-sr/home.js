import React, {useState, useEffect, useMemo} from 'react';
import { Button, Form } from 'react-bootstrap';
import { apiManualSRTaskCreate, apiManualSRTaskList } from '../lookup';
import { errorHandler } from '../utils';
import {Slate, ReactEditor} from 'slate-react';
import {Transforms} from 'slate';
import {createFullEditor, EditorButtons, FullEditor} from '../notes/editor-components';
import { emptyValue } from '../notes/autonote/autonote';
import { ManualSRTask } from './task';


export function ManualSRHome(props) {
  const [manualSRTasks, setManualSRTasks] = useState(null);
  const [manualSRTasksDidSet, setManualSRTasksDidSet] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);
  const [loadingNext, setLoadingNext] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [value, setValue] = useState(emptyValue);
  const editor = useMemo(
    () => createFullEditor(),
    []
  );

  // Get the list of tasks
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

  // Load the next set of tasks (pagination)
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

  // Creates a new task
  const handleCreate = (event) => {
    event.preventDefault();
    if (isCreating === false) {
      const form = event.target;
      setIsCreating(true);

      apiManualSRTaskCreate(form.elements.title.value, value, (response, status) => {
        if (status === 201) {
          // Move the cursor to the beginning to avoid crash
          Transforms.move(editor, { edge: 'anchor', distance: 9999999, reverse: true });
          Transforms.move(editor, { edge: 'focus', distance: 9999999, reverse: true });
          ReactEditor.focus(editor);
      
          // Clear editor
          setValue(emptyValue);
          form.elements.title.value = '';

          // Add to list
          const newTasks = [response, ...manualSRTasks];
          setManualSRTasks(newTasks);
        } else {
          // Error creating manual SR task
          errorHandler(response, status, 7002);
        };
        setIsCreating(false);
      });
    };
  };

  // Sorts the tasks by their due date
  const sortListCallback = () => {
    const newTasks = [...manualSRTasks].sort((a, b) => (b.next_review < a.next_review) ? 1 : -1);
    setManualSRTasks(newTasks);
  };

  // Deletes the task in the frontend
  const deleteCallback = (id) => {
    const newTasks = [...manualSRTasks].filter(task => task.id !== id);
    setManualSRTasks(newTasks);
    document.body.click();
  };

  return (<div className='container'>
    <h1 className='text-center'>Tasks</h1>
    <h2>Create new Task</h2>
    <Form onSubmit={handleCreate}>
      <Form.Group>
        <Form.Label as='h3'>Title</Form.Label>
        <Form.Control
          type='text'
          placeholder='Review Integrals'
          name='title'
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label as='h3'>Description</Form.Label>
        <div style={{ borderStyle: 'solid', borderWidth: '1px', paddingTop: '5px', paddingLeft: '5px' }}>
          <Slate
            editor={editor}
            value={value}
            onChange={newValue => {
              setValue(newValue);
            }}
          >
            <EditorButtons
              editor={editor}
            />
            <FullEditor
              editor={editor}
              styleOptions={{ minHeight: '200px' }}
            />
          </Slate>
        </div>
      </Form.Group>
      <Button type='submit'>
        {isCreating ? 'Creating...' : 'Create'}
      </Button>
    </Form>
    <hr />
    <h2>Your Tasks</h2>
    {manualSRTasks ? (manualSRTasks.length > 0 ?
      manualSRTasks.map((task, index) => (
        <ManualSRTask
          key={index}
          task={task}
          sortListCallback={sortListCallback}
          deleteCallback={deleteCallback}
        />
    )) : <>
        <p>You don't have any tasks yet</p>
        <div>
          <iframe
            width="100%" height="400px"
            title='Introduction to Tasks'
            allowFullScreen='allowFullScreen'
            src="https://www.youtube.com/embed/15jt-oQSJ8c"
            className='mx-auto'
          />
        </div>
      </>
    ) : 'Loading...'}
    {nextUrl && <Button variant='outline-primary' onClick={handleLoadNext}>
      {loadingNext ? 'Loading...' : 'Load More'}
    </Button>}
  </div>);
};