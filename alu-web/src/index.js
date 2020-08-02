import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {DecksComponent, DecksList, Deck} from './decks';

const decksEl = document.getElementById('user_decks');
if (decksEl) {
  console.log(decksEl.dataset)
  ReactDOM.render(
    <React.StrictMode>
      <DecksComponent />
    </React.StrictMode>,
    decksEl
  );
};


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
