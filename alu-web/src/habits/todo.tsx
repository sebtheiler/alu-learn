import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import { Todo } from './types';
import { apiTodoCreate, apiTodoList, apiTodoDelete, apiTodoComplete } from '../lookup';
import { errorHandler, useApiObjectHook, FormCheckbox } from '../utils';
import './main.scss';


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
    <h3>To-do</h3>
    <hr />
    {todos.length === 0 && <p>You have no to-dos</p>}
    <ul className='text-left pl-0' style={{ listStyle: 'none' }}>
      {todos.map((todo, i) =>
        <li
          className={'todo-element' + (todo.completed ? ' todo-completed' : '')}
          key={`todo-${todo.id}`}
        >
          <FormCheckbox
            defaultChecked={todo.completed}
            onChange={() => {
              // Toggle whether or not the todo is completed
              let newTodo = todo;
              newTodo.completed = !newTodo.completed;
              setTodos([...todos.slice(0, i), newTodo, ...todos.slice(i + 1)]);
              apiTodoComplete(newTodo.id, newTodo.completed, (response, status) => {
                if (status !== 200) errorHandler(response, status, 9012);
              })
            }}
          >
            {todo.text}
            {' '}{todo.completed && <i
              className='fas fa-trash text-danger'
              onClick={() => {
                // Delete the todo when the trash icon is clicked
                if (!window.confirm('Are you sure you want to delete this todo? ')) return;
                setTodos([...todos.slice(0, i), ...todos.slice(i + 1)]);
                apiTodoDelete(todo.id, (response, status) => {
                  if (status !== 200) errorHandler(response, status, 9011);
                });
              }}
            />}
          </FormCheckbox>
        </li>
      )}
    </ul>
    <Form onSubmit={addTodo}>
      <FormControl
        placeholder='New to-do'
        aria-label='New to-do'
        name='todoText'
        required
      />
      <Button
        type='submit'
        className='mt-1'
        id='create-todo-btn'
        block
      >
        Add To-do
      </Button>
    </Form>
  </div>);
}
