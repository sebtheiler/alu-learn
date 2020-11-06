import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { apiFlashCardSearch, apiSSMCreate, apiDeckPrivateList } from '../../lookup';
import { FlashCardsList} from '.';
import RangeSlider from 'react-bootstrap-range-slider';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import { errorHandler } from '../../utils';

// Does some magic with SlateJS that prevents weird errors
// DO NOT REMOVE
// @refresh reset

export function SearchForm(props) {
  const {decks, minEaseValue, setMinEaseValue, maxEaseValue, setMaxEaseValue, showRangeSlider, defaultContains, defaultTags, defaultLeech, defaultLearningStatus, defaultMinEase, defaultMaxEase, as, hideSuspend} = props;

  return (<>
    {decks && <Form.Group>
      <Form.Label htmlFor='deckSelect' as={as}>
        Search in the following decks (use control/command to select multiple)
      </Form.Label>
      <Form.Control as='select' multiple name='deckSelect'>
        {
          decks.map((deck, index) => {
            return <option className='deck-selection' value={deck.id} key={`deck-#${index}`}>{deck.title}</option>
          })
        }
      </Form.Control>
    </Form.Group>}
    <hr />
    <Form.Group>
      <Form.Label htmlFor='contains' as={as}>Front or back text contains...</Form.Label>
      <Form.Control
        type='text'
        placeholder='Roman Empire...'
        name='contains'
        defaultValue={defaultContains}
      />
    </Form.Group>
    <hr />
    <Form.Group>
      <Form.Label htmlFor='tags' as={as}>List of tags to search in (separate with commas)</Form.Label>
      <Form.Control
        type='text'
        placeholder='Calculus, Integrals, Exponentials, ...'
        name='tags'
        defaultValue={defaultTags}
      />
    </Form.Group>
    <hr />
    {!hideSuspend && <Form.Group>
      <Form.Label as={as} htmlFor='isSuspended'>Is the card suspended?</Form.Label>
      <Form.Control as='select' name='isSuspended'>
        <option value='ANY'>---------</option>
        <option value='SUSPENDED'>Suspended</option>
        <option value='NOTSUSPENDED'>Not suspended</option>
      </Form.Control>
    </Form.Group>}
    <hr />
    <Form.Group>
      <Form.Label htmlFor='isLeech' as={as}>Is the card a leech?</Form.Label>
      <Form.Control as='select' name='isLeech' defaultValue={defaultLeech}>
        <option value='ANY'>---------</option>
        <option value='LEECH'>Leech</option>
        <option value='NOTLEECH'>Not a leech</option>
      </Form.Control>
    </Form.Group>
    <hr />
    <Form.Group>
      <Form.Label htmlFor='learningStatus' as={as}>What is the card's learning status?</Form.Label>
      <Form.Control as='select' name='learningStatus' defaultValue={defaultLearningStatus}>
        <option value='ANY'>---------</option>
        <option value='UNSEEN'>Unseen/New</option>
        <option value='LEARNED'>Learned</option>
        <option value='LEARNING'>Learning</option>
        <option value='RELEARNING'>Re-learning</option>
      </Form.Control>
    </Form.Group>
    <hr />
    {showRangeSlider ? <>
      <Form.Group>
        <Form.Label htmlFor='minEase' as={as}>Minimum Ease Factor</Form.Label>
        <RangeSlider
          value={minEaseValue}
          onChange={changeEvent => setMinEaseValue(changeEvent.target.value)}
          min={130}
          max={350}
          step={5}
          tooltipLabel={value => parseInt(value) === 130 ? '-∞' : value + '%'}
          name='minEase'
          />
      </Form.Group>
      <hr />
      <Form.Group>
        <Form.Label htmlFor='maxEase' as={as}>Maximum Ease Factor</Form.Label>
        <RangeSlider
          value={maxEaseValue}
          onChange={changeEvent => setMaxEaseValue(changeEvent.target.value)}
          min={130}
          max={350}
          step={5}
          tooltipLabel={value => parseInt(value) === 350 ? '∞' : value + '%'}
          name='maxEase'
        />
      </Form.Group>
    </> : <>
    <Form.Group>
      <Form.Label>Minimum Ease Factor</Form.Label>
      <Form.Control
        type='number'
        name='minEase'
        min={130}
        max={350}
        defaultValue={defaultMinEase}
      />
    </Form.Group>
    <Form.Group>
      <Form.Label>Maximum Ease Factor</Form.Label>
      <Form.Control
        type='number'
        name='maxEase'
        id='maxEase'
        min={130}
        max={350}
        defaultValue={defaultMaxEase}
      />
    </Form.Group>
    </>}
  </>)
};

// Renders the form for searching for flashcards
export function FlashCardSearchComponent(props) {
  const {username} = props;
  const [decks, setDecks] = useState([]);
  const [searchedFlashcards, setSearchedFlashcards] = useState([]);
  const [didSearch, setDidSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [decksDidSet, setDecksDidSet] = useState(false);
  const [minEaseValue, setMinEaseValue] = useState(130);
  const [maxEaseValue, setMaxEaseValue] = useState(350);
  const [creatingCSSM, setCreatingCSSM] = useState(false);

  // Get the user's decks
  useEffect(() => {
    if (decksDidSet === false) {
      apiDeckPrivateList((response, status) => {
        if (status === 200) {
          setDecksDidSet(true);
          setDecks(response);
        } else {
          // Error getting list of private decks for searching
          errorHandler(response, status, 1025);
        };
      });
    };
  }, [username, setDecks, decksDidSet, setDecksDidSet]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    if (searchLoading === false) {
      setSearchLoading(true);
      // Get all of the needed information in the correct format
      const options = document.querySelectorAll('.deck-selection');
      const deckIds = Array.from(options).filter(option => option.selected).map(deck => parseInt(deck.value));

      apiFlashCardSearch(
        deckIds.length > 0 ? deckIds : null,
        form.elements.tags.value ? form.elements.tags.value.split(',').map(tag => tag.trim()) : null,
        form.elements.contains.value ? form.elements.contains.value : null,
        form.elements.isSuspended.value !== 'ANY' ? form.elements.isSuspended.value === 'SUSPENDED' : null,
        form.elements.isLeech.value !== 'ANY' ? form.elements.isLeech.value === 'LEECH' : null,
        form.elements.learningStatus.value !== 'ANY' ? form.elements.learningStatus.value : null,
        parseInt(minEaseValue),
        parseInt(maxEaseValue),
        (response, status) => {
          if (status === 200) {
            setSearchedFlashcards(response);
            setDidSearch(true);
          } else {
            // Error searching for flashcards
            errorHandler(response, status, 2005);
          };
          setSearchLoading(false);
      });
    };
  };

  const createCSSM = (event) => {
    event.preventDefault();

    if (creatingCSSM === false) {
      setCreatingCSSM(true);
      const form = document.getElementById('searchForm');
      apiSSMCreate(
        '', // currently not using deck IDS
        form.elements.tags.value,
        form.elements.contains.value,
        form.elements.isLeech.value !== 'ANY' ? form.elements.isLeech.value === 'LEECH' : null,
        form.elements.learningStatus.value !== 'ANY' ? form.elements.learningStatus.value : null,
        parseInt(minEaseValue),
        parseInt(maxEaseValue),
        (response, status) => {
          if (status === 201) {
            window.location.href = `/customstudy/${response.id}/study/`;
          } else {
            // Error creating new SSM
            errorHandler(response, status, 5005);
          };
          setCreatingCSSM(false);
        },
      );
    };
  };

  return (
    <>
      <Form className='text-center mx-auto w-75' onSubmit={handleSubmit} id='searchForm'>
        <SearchForm
          decks={decks}
          minEaseValue={minEaseValue}
          setMinEaseValue={setMinEaseValue}
          maxEaseValue={maxEaseValue}
          setMaxEaseValue={setMaxEaseValue}
          showRangeSlider={true}
          as='h5'
        />
        <Form.Group>
          <Button type='submit' block>{searchLoading ? 'Loading...' : 'Search!'}</Button>
        </Form.Group>
      </Form>
      <div className='text-center'>
        {searchedFlashcards.length !== 0 &&
          <div>
            <hr />
            <h1>Results</h1>
            <Button id='custom-study-link' onClick={createCSSM}>
              {creatingCSSM ? 'Loading...' : 'Study these flashcards (Custom Study)'}
            </Button>
          </div>
        }
        {didSearch && (
          searchedFlashcards.length > 0 ?
            <FlashCardsList flashcardList={searchedFlashcards} showParentDeckTitle={true} artificialPaginationNumFlashcards={250} /> 
          : <h5>No results! Maybe try a less specific search, or check your parameters?</h5>
        )}
      </div>
    </>
  );
};