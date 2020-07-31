import React, {useEffect, useState, useCallback} from 'react';
import logo from './logo.svg';
import './App.css';

function EditButton(props) {
  const {deck} = props;
  const className = props.className ? props.className : 'btn btn-primary mb-4 mr-1';
  return <button className={className}>Edit</button>;
};

function RedirectButton(props) {
  const {deck, link} = props;
  const className = props.className ? props.className : 'btn btn-primary mb-4 mr-1';
  return <button className={className}>{link}</button>
};

function Deck(props) {
  const {deck} = props;
  const className = props.className ? props.className : 'col-10 mx-auto col-md-6';
  return <div className={className}>
    <p>{deck.id} - {deck.title}</p>
    <div className='btn btn-group'>
      <EditButton deck={deck} />
      <RedirectButton deck={deck} link={'https://www.google.com'} />
    </div>
  </div>;
};

function loadDecks(callback) {
  const xhr = new XMLHttpRequest();
  const method = 'GET';
  const endpoint = 'http://127.0.0.1:8000/api/decks/decklist/';
  const responseType = 'json';

  xhr.responseType = responseType;
  xhr.open(method, endpoint);
  xhr.onload = function() {
      callback(xhr.response, xhr.status);
  };
  xhr.onerror = function(e) {
    console.log(e);
    callback({'message': 'The request was an error'}, 400);
  };
  xhr.send();
};

function App() {
  const [decks, setDecks] = useState([]);
  
  useEffect(() => {
    const myCallback = (response, status) => {
      console.log(response, status)
      if (status === 200) {
        setDecks(response);
      };
    };
    loadDecks(myCallback);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <div>
          {decks.map((deck, index) => {
            return <Deck deck={deck} key={`${index}-${deck.id}`} className='my-5 py-5 border bg-white text-dark'/>;
          })}
        </div>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
};

export default App;
