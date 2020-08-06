import React, {useState, useEffect} from 'react';
import {apiDeckList} from '../lookup';
import {Deck} from './detail';

export function DecksList(props) {
    const [decksInit, setDecksInit] = useState([props.newDecks ? props.newDecks : []]);
    const [decks, setDecks] = useState([]);
    const [nextUrl, setNextUrl] = useState(null);
    const [decksDidSet, setDecksDidSet] = useState(false);
  
    useEffect(() => {
      const final = [...props.newDecks].concat(decksInit);
      if (final.length !== decks.length) {
        setDecks(final);
      };
    }, [props.newDecks, decksInit, decks.length]);
  
    useEffect(() => {
      if (decksDidSet === false) {
        const handleDeckListLookup = (response, status) => {
          if (status === 200) {
            setNextUrl(response.next);
            setDecksInit(response.results);
            setDecksDidSet(true);
          } else {
              alert('There was an error');
          };
        };
        apiDeckList(props.username, handleDeckListLookup);
      };
    }, [decksInit, decksDidSet, setDecksDidSet, props.username]);
  
    const handleLoadNext = (event) => {
      event.preventDefault();
      if (nextUrl !== null) {
        apiDeckList(props.username, (response, status) => {
          if (status === 200) {
            setNextUrl(response.next);
            const newDecks = [...decks].concat(response.results)
            setDecksInit(newDecks);
            setDecks(newDecks);
          } else {
              alert('There was an error');
          };
        }, nextUrl);
      };
    };

    return <React.Fragment>{decks.map((deck, index) => {
      return <Deck deck={deck} key={`${index}-${deck.id}`} className='my-5 py-5 border bg-white text-dark'/>;
    })}
    { nextUrl !== null && <button onClick={handleLoadNext} className='btn btn-outline-primary'>Load more decks</button>}
    </React.Fragment>;
  };