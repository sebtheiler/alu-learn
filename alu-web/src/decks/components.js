import React, {useEffect, useState} from 'react';
import {apiDeckCreate, apiDeckList} from '../lookup';

export function DecksComponent(props) {
  const inputTextRef = React.createRef();
  const [newDecks, setNewDecks] = useState([]);

  const handleBackendUpdate = (response, status) => {
    let tempNewDecks = [...newDecks];
    if (status === 201) {
      tempNewDecks.unshift(response);
      setNewDecks(tempNewDecks);
    } else {
      console.log(response);
      alert('A server error occured');
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const textVal = inputTextRef.current.value;
    apiDeckCreate(textVal, handleBackendUpdate);
    inputTextRef.current.value = '';
  };
  
  return <div className={props.className}>
    <div className='col-12 mb-3'>
      <form onSubmit={handleSubmit}>
        <input type='text' required='required' className='form-control text-center' name='title' placeholder='My deck' ref={inputTextRef} />
        <div className='text-center mt-1'><button type='submit' className='btn btn-primary my-3'>Create</button></div>
      </form>
    </div>
  <DecksList newDecks={newDecks} />
  </div>;
};

export function EditButton(props) {
  const {deck} = props;
  const className = props.className ? props.className : 'btn btn-primary mb-4 mr-1';

  const handleClick = (event) => {
    event.preventDefault();
    console.log('TODO: Implement editing')
  };

  return <button onClick={handleClick} className={className}>Edit</button>;
};

export function RedirectButton(props) {
  const {deck, link} = props;
  const className = props.className ? props.className : 'btn btn-primary mb-4 mr-1';
  const target = props.target ? props.target : '_blank';

  return <a href={link.href} target={target} rel='noopener noreferrer'><button className={className}>{link.display}</button></a>;
};

export function Deck(props) {
  const {deck} = props;
  const className = props.className ? props.className : 'col-10 mx-auto col-md-6';
  return <div className={className}>
    <p>{deck.id} - {deck.title}</p>
    <div className='btn btn-group'>
      <EditButton deck={deck} />
      <RedirectButton deck={deck} link={{href: 'https://www.google.com', display: 'Add Cards', target: '_blank'}} />
      <RedirectButton deck={deck} link={{href: 'https://www.google.com', display: 'Browse', target: '_blank'}} />
    </div>
  </div>;
};

export function DecksList(props) {
  const [decksInit, setDecksInit] = useState([props.newDecks ? props.newDecks : []]);
  const [decks, setDecks] = useState([]);
  const [decksDidSet, setDecksDidSet] = useState(false);

  useEffect(() => {
    const final = [...props.newDecks].concat(decksInit);
    if (final.length !== decks.length) {
      setDecks(final);
    };
  }, [props.newDecks, decksInit]);

  useEffect(() => {
    if (decksDidSet === false) {
      const handleDeckListLookup = (response, status) => {
        const finalDecksInit = [...response].concat(decksInit);
        if (status === 200) {
          setDecksInit(response);
          setDecksDidSet(true);
        };
      };
      apiDeckList(handleDeckListLookup);
    };
  }, [decksInit, decksDidSet, setDecksDidSet]);

  return decks.map((deck, index) => {
    return <Deck deck={deck} key={`${index}-${deck.id}`} className='my-5 py-5 border bg-white text-dark'/>;
  });
};