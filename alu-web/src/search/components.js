import React, {useState, useEffect} from 'react';
import {Form, Button} from 'react-bootstrap';
import {apiDeckSharedList} from '../lookup';
import RangeSlider from 'react-bootstrap-range-slider';
import 'bootstrap/dist/css/bootstrap.css'; // or include from a CDN
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';

export function SearchComponent(props) {
  const {username} = props;
  const [decks, setDecks] = useState([]);
  const [decksDidSet, setDecksDidSet] = useState(false);
  const [minEaseValue, setMinEaseValue] = useState(130);
  const [maxEaseValue, setMaxEaseValue] = useState(350);

  // Get the user's decks
  useEffect(() => {
    if (decksDidSet === false) {
      apiDeckSharedList(username, (response, status) => {
        if (status === 200) {
          setDecksDidSet(true);
          setDecks(response);
        };
      });
    };
  }, [username, setDecks, decksDidSet, setDecksDidSet]);

  // Needed refs
  const deckSelectRef = React.createRef();
  const tagSelectRef = React.createRef();
  const containsSelectRef = React.createRef();
  const suspendedSelectRef = React.createRef();
  const leechSelectRef = React.createRef();
  const graduatedSelectRef = React.createRef();
  const minEaseSelectRef = React.createRef();
  const maxEaseSelectRef = React.createRef();

  // Get all of the needed information in the correct format
  const handleSubmit = (event) => {
    event.preventDefault();
    const options = document.querySelectorAll('.deck-selection');
    const deckIds = Array.from(options).filter(option => option.selected).map(deck => parseInt(deck.value));
    console.log(
      deckIds.length > 0 ? deckIds : null,
      tagSelectRef.current.value ? tagSelectRef.current.value.split(',').map(tag => tag.trim()) : null,
      containsSelectRef.current.value ? containsSelectRef.current.value : null,
      suspendedSelectRef.current.value !== 'ANY' ? suspendedSelectRef.current.value === 'SUSPENDED' : null,
      leechSelectRef.current.value !== 'ANY' ? leechSelectRef.current.value === 'LEECH' : null,
      graduatedSelectRef.current.value !== 'ANY' ? graduatedSelectRef.current.value === 'GRADUATED' : null,
      parseInt(minEaseSelectRef.current.value),
      parseInt(maxEaseSelectRef.current.value),
    );
  };

  return (
    <div>
      <Form className='text-center mx-auto w-75' onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label as='h5'>Search in the following decks (use control/command to select multiple)</Form.Label>
          <Form.Control as='select' multiple ref={deckSelectRef}>
            {
              decks.map((deck, index) => {
                return <option className='deck-selection' value={deck.id} key={`deck-#${index}`}>{deck.title}</option>
              })
            }
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label as='h5'>List of tags to search in (seperate with commas)</Form.Label>
          <Form.Control type='text' ref={tagSelectRef} placeholder='Calculus, Integrals, Exponentials, ...'></Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label as='h5'>Front or back text contains...</Form.Label>
          <Form.Control type='text' ref={containsSelectRef} placeholder='When was the Roman Empire...'></Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label as='h5'>Is the card suspended?</Form.Label>
          <Form.Control as='select' ref={suspendedSelectRef}>
            <option value='ANY'>Any</option>
            <option value='SUSPENDED'>Suspended</option>
            <option value='NOTSUSPENDED'>Not suspended</option>
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label as='h5'>Is the card a leech?</Form.Label>
          <Form.Control as='select' ref={leechSelectRef}>
            <option value='ANY'>Any</option>
            <option value='LEECH'>Leech</option>
            <option value='NOTLEECH'>Not a leech</option>
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label as='h5'>Is the card graduated?</Form.Label>
          <Form.Control as='select' ref={graduatedSelectRef}>
            <option value='ANY'>Any</option>
            <option value='GRADUATED'>Graduated</option>
            <option value='NOTGRADUATED'>Not graduated</option>
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label as='h5'>Minimum Ease Factor</Form.Label>
          <RangeSlider
            value={minEaseValue}
            onChange={changeEvent => setMinEaseValue(changeEvent.target.value)}
            min={130}
            max={350}
            step={5}
            ref={minEaseSelectRef}
            />
        </Form.Group>
        <Form.Group>
          <Form.Label as='h5'>Maximum Ease Factor</Form.Label>
          <RangeSlider
            value={maxEaseValue}
            onChange={changeEvent => setMaxEaseValue(changeEvent.target.value)}
            min={130}
            max={350}
            step={5}
            ref={maxEaseSelectRef}
          />
        </Form.Group>
        <Form.Group>
          <Button type='submit' block>Search!</Button>
        </Form.Group>
      </Form>
    </div>
  );
};