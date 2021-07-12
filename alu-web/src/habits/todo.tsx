import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import { Todo } from './types';
import { apiTodoCreate, apiTodoList, apiTodoDelete } from '../lookup';
import { errorHandler, useApiObjectHook } from '../utils';
import './main.css';


export function TodoList() {
  const [todos, setTodos] = useApiObjectHook<Todo[]>(apiTodoList, [200], 9010);

  const addTodo = event => {
    event.preventDefault();
    if (!todos) return;
    const form = event.target;

    apiTodoCreate(form.elements.todoText.value, (response, status) => {
      if (status === 200) {
        setTodos([...todos, response]);
        form.elements.todoText.value = '';
      } else {
        errorHandler(response, status, 9009);
      }
    });
  }

  if (todos === undefined) return <p>Loading...</p>
  return (<div className='text-center'>
    <h3>Todo</h3>
    <hr />
    {todos.length === 0 && <p>You have no todos</p>}
    <ul className='text-left pl-3' style={{  }}>
      {todos.map((todo, i) =>
        <li
          onClick={() => {
            // Delete the todo
            let todoId = todo.id;
            setTodos([...todos.slice(0, i), ...todos.slice(i + 1)]);
            apiTodoDelete(todoId, (response, status) => {
              if (status !== 200) errorHandler(response, status, 9011);
            })
          }}
          className='todo-element'
          key={i}
        >
          {todo.text}
        </li>
      )}
    </ul>
    <Form onSubmit={addTodo}>
      <FormControl
        placeholder='New todo'
        aria-label='New todo'
        name='todoText'
        required
      />
      <Button
        type='submit'
        className='mt-1'
        id='create-todo-btn'
        block
      >
        Add Todo
      </Button>
    </Form>
  </div>);
}
