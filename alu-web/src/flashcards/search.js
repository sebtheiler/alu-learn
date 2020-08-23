import React, {useState, useEffect} from 'react';
import {Form, Button} from 'react-bootstrap';
import {apiDeckSharedList, apiFlashCardSearch} from '../lookup';
import {FlashCardsList} from '.';
import RangeSlider from 'react-bootstrap-range-slider';
import 'bootstrap/dist/css/bootstrap.css'; // or include from a CDN
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';

// TODO: split this component in multiple components
// It is a horrible piece of code
export function FlashCardSearchComponent(props) {
  const {username} = props;
  const [decks, setDecks] = useState([]);
  const [searchedFlashcards, setSearchedFlashcards] = useState([]);
  const [didSearch, setDidSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [decksDidSet, setDecksDidSet] = useState(false);
  const [minEaseValue, setMinEaseValue] = useState(130);
  const [maxEaseValue, setMaxEaseValue] = useState(350);
  const [customStudyLink, setCustomStudyLink] = useState('#');

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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (searchLoading === false) {
      setSearchLoading(true);
      // Get all of the needed information in the correct format
      const options = document.querySelectorAll('.deck-selection');
      const deckIds = Array.from(options).filter(option => option.selected).map(deck => parseInt(deck.value));

      const tagSelectRefCurrentValue = tagSelectRef.current.value;
      const containsSelectRefCurrentValue = containsSelectRef.current.value;
      const suspendedSelectRefCurrentValue = suspendedSelectRef.current.value;
      const leechSelectRefCurrentValue = leechSelectRef.current.value;
      const graduatedSelectRefCurrentValue = graduatedSelectRef.current.value;
      const minEaseSelectRefCurrentValue = minEaseSelectRef.current.value;
      const maxEaseSelectRefCurrentValue = maxEaseSelectRef.current.value;
      apiFlashCardSearch(
        deckIds.length > 0 ? deckIds : null,
        tagSelectRefCurrentValue ? tagSelectRefCurrentValue.split(',').map(tag => tag.trim()) : null,
        containsSelectRefCurrentValue ? containsSelectRefCurrentValue : null,
        suspendedSelectRefCurrentValue !== 'ANY' ? suspendedSelectRefCurrentValue === 'SUSPENDED' : null,
        leechSelectRefCurrentValue !== 'ANY' ? leechSelectRefCurrentValue === 'LEECH' : null,
        graduatedSelectRefCurrentValue !== 'ANY' ? graduatedSelectRefCurrentValue === 'GRADUATED' : null,
        parseInt(minEaseSelectRefCurrentValue),
        parseInt(maxEaseSelectRefCurrentValue),
        (response, status) => {
          if (status === 200) {
            setSearchedFlashcards(response);
            setDidSearch(true);

            // Update link for custom study button
            setCustomStudyLink(generateCustomStudyLink(
              tagSelectRefCurrentValue,
              containsSelectRefCurrentValue,
              suspendedSelectRefCurrentValue,
              leechSelectRefCurrentValue,
              graduatedSelectRefCurrentValue,
              minEaseSelectRefCurrentValue,
              maxEaseSelectRefCurrentValue,
            ));
          } else {
            console.log(response, status);
            alert('Error searching!');
          };
          setSearchLoading(false);
      });
    };
  };

  const generateCustomStudyLink = (
      tagSelectRefCurrentValue,
      containsSelectRefCurrentValue,
      suspendedSelectRefCurrentValue,
      leechSelectRefCurrentValue,
      graduatedSelectRefCurrentValue,
      minEaseSelectRefCurrentValue,
      maxEaseSelectRefCurrentValue,
    ) => {
    const options = document.querySelectorAll('.deck-selection');
    const deckIds = Array.from(options).filter(option => option.selected).map(deck => parseInt(deck.value)).toString();
    const tags = (tagSelectRefCurrentValue ? tagSelectRefCurrentValue.split(',').map(tag => tag.trim()) : '').toString();
    const suspended = suspendedSelectRefCurrentValue !== 'ANY' ? (suspendedSelectRefCurrentValue === 'SUSPENDED').toString() : '';
    const leech = leechSelectRefCurrentValue !== 'ANY' ? (leechSelectRefCurrentValue === 'LEECH').toString() : '';
    const graduated = graduatedSelectRefCurrentValue !== 'ANY' ? (graduatedSelectRefCurrentValue === 'GRADUATED').toString() : '';

    const returnUrl = (
      '/customstudy/?' +
      (deckIds ? '&deckIds=' + deckIds : '') +
      (tags ? '&tags=' + tags : '') +
      (containsSelectRefCurrentValue ? '&contains=' + containsSelectRefCurrentValue : '') +
      (suspended ? '&suspended=' + suspended : '') +
      (leech ? '&leech=' + leech : '') +
      (graduated ? '&graduated=' + graduated : '') +
      (minEaseSelectRefCurrentValue ? '&minEase=' + minEaseSelectRefCurrentValue : '') +
      (maxEaseSelectRefCurrentValue ? '&maxEase=' + maxEaseSelectRefCurrentValue : '')
    ).replace('&', ''); // removes first, arbitrary '&'

    return returnUrl;
  };

  return (
    <>
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
        <hr />
        <Form.Group>
          <Form.Label as='h5'>Front or back text contains...</Form.Label>
          <Form.Control type='text' ref={containsSelectRef} placeholder='When was the Roman Empire...'></Form.Control>
        </Form.Group>
        <hr />
        <Form.Group>
          <Form.Label as='h5'>List of tags to search in (seperate with commas)</Form.Label>
          <Form.Control type='text' ref={tagSelectRef} placeholder='Calculus, Integrals, Exponentials, ...'></Form.Control>
        </Form.Group>
        <hr />
        <Form.Group>
          <Form.Label as='h5'>Is the card suspended?</Form.Label>
          <Form.Control as='select' ref={suspendedSelectRef}>
            <option value='ANY'>Any</option>
            <option value='SUSPENDED'>Suspended</option>
            <option value='NOTSUSPENDED'>Not suspended</option>
          </Form.Control>
        </Form.Group>
        <hr />
        <Form.Group>
          <Form.Label as='h5'>Is the card a leech?</Form.Label>
          <Form.Control as='select' ref={leechSelectRef}>
            <option value='ANY'>Any</option>
            <option value='LEECH'>Leech</option>
            <option value='NOTLEECH'>Not a leech</option>
          </Form.Control>
        </Form.Group>
        <hr />
        <Form.Group>
          <Form.Label as='h5'>Is the card graduated?</Form.Label>
          <Form.Control as='select' ref={graduatedSelectRef}>
            <option value='ANY'>Any</option>
            <option value='GRADUATED'>Graduated</option>
            <option value='NOTGRADUATED'>Not graduated</option>
          </Form.Control>
        </Form.Group>
        <hr />
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
        <hr />
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
          <Button type='submit' block>{searchLoading ? 'Loading...' : 'Search!'}</Button>
        </Form.Group>
      </Form>
      <div className='text-center'>
        {searchedFlashcards.length === 0 ? null : 
          <div>
            <hr />
            <h1>Results</h1>
            <Button href={customStudyLink} id='custom-study-link' target='_blank'>
              Study these flashcards (Custom Study)
            </Button>
          </div>
        }
        {didSearch ? (
          searchedFlashcards.length > 0 ?
            <FlashCardsList flashcardList={searchedFlashcards} /> 
          : <h5>No results! Maybe try a less specific search, or check your parameters?</h5>
        ) : null}
      </div>
    </>
  );
};