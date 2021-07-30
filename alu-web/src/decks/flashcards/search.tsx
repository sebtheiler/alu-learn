import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton';
import { apiFlashCardSearch, apiDeckPrivateList, apiFlashcardReviewInstanceEdit } from '../../lookup';
// import { FlashCardsList } from '.';
import { errorHandler, useApiObjectHook } from '../../utils';
import RangeSlider from 'react-bootstrap-range-slider';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import { Deck, ReviewInstance } from '../types';

// Does some magic with SlateJS that prevents weird errors
// DO NOT REMOVE
// @refresh reset

interface SearchFormProps {
  decks: Deck[] | any;
  minEaseValue?: number;
  setMinEaseValue?: Function;
  maxEaseValue?: number;
  setMaxEaseValue?: Function;
  showRangeSlider?: boolean;
  defaultContains?: string; /** Default value for the 'contains' field */
  defaultTags?: string;
  defaultLeech?: 'ANY' | 'LEECH' | 'NOTLEECH';
  defaultLearningStatus?: 'UNSEEN' | 'LEARNING' | 'LEARNED' | 'RELEARNING';
  defaultMinEase?: number;
  defaultMaxEase?: number;
  as?: any;
  hideSuspend?: boolean;
  defaultSelectedDecks?: string[]; /** Ids of the selected decks */
}
export function SearchForm(props: SearchFormProps) {
  const {decks, minEaseValue, setMinEaseValue, maxEaseValue, setMaxEaseValue, showRangeSlider, defaultContains, defaultTags, defaultLeech, defaultLearningStatus, defaultMinEase, defaultMaxEase, as, hideSuspend, defaultSelectedDecks} = props;

  return (<>
    {decks && <Form.Group>
      <Form.Label htmlFor='deckSelect' as={as}>
        Search in the following decks (use control/command to select multiple)
      </Form.Label>
      <Form.Control as='select' multiple name='deckSelect' defaultValue={defaultSelectedDecks}>
        {
          decks.map((deck: Deck, index: number) => (
            <option
              className='deck-selection'
              value={deck.id}
              key={`deck-#${index}`}
            >
              {deck.title}
            </option>
          ))
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
      <Form.Label htmlFor='tags' as={as}>
        List of tags to search in (use AND/OR/NOT for advanced searches)
      </Form.Label>
      <Form.Control
        type='text'
        placeholder='unit 3 AND essential'
        name='tags'
        defaultValue={defaultTags}
      />
    </Form.Group>
    <hr />
    {!hideSuspend && <>
      <Form.Group>
        <Form.Label as={as} htmlFor='isSuspended'>Is the card suspended?</Form.Label>
        <Form.Control as='select' name='isSuspended'>
          <option value='ANY'>---------</option>
          <option value='SUSPENDED'>Suspended</option>
          <option value='NOTSUSPENDED'>Not suspended</option>
        </Form.Control>
      </Form.Group>
      <hr />
    </>}
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
    {(showRangeSlider && setMinEaseValue && setMaxEaseValue) ? <>
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
}

// Renders the form for searching for flashcards
export function FlashCardSearchComponent(props) {
  const [decks] = useApiObjectHook<Deck[]>(apiDeckPrivateList, 200, 1025);
  const [searchedFlashcards, setSearchedFlashcards] = useState<ReviewInstance[]>();
  const [didSearch, setDidSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [minEaseValue, setMinEaseValue] = useState(130);
  const [maxEaseValue, setMaxEaseValue] = useState(350);
  const [showCSSMModal, setShowCSSMModal] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    if (searchLoading === false) {
      setSearchLoading(true);
      // Get all of the needed information in the correct format
      const options = document.querySelectorAll('.deck-selection') as NodeListOf<HTMLOptionElement>;
      const deckIds = Array.from(options).filter(option => option.selected).map(deck => parseInt(deck.value));

      apiFlashCardSearch(
        deckIds.length > 0 ? deckIds : null,
        form.elements.tags.value ? form.elements.tags.value.split(',').map(tag => tag.trim()) : null,
        form.elements.contains.value ? form.elements.contains.value : null,
        form.elements.isSuspended.value !== 'ANY' ? form.elements.isSuspended.value === 'SUSPENDED' : null,
        form.elements.isLeech.value !== 'ANY' ? form.elements.isLeech.value === 'LEECH' : null,
        form.elements.learningStatus.value !== 'ANY' ? form.elements.learningStatus.value : null,
        minEaseValue,
        maxEaseValue,
        (response, status) => {
          if (status === 200) {
            setSearchedFlashcards(response);
            setDidSearch(true);
          } else {
            // Error searching for flashcards
            errorHandler(response, status, 2005);
          }
          setSearchLoading(false);
      });
    }
  }

  // const createCSSM = (event) => {
  //   event.preventDefault();
    
  //   if (!creatingCSSM) {
  //     setCreatingCSSM(true);
  //     const form = document.getElementById('searchForm') as HTMLFormElement;
  //     const elements = form.elements as FlashCardSearchFormElements;

  //     if (form) {
  //       const deckSelectElement = elements.deckSelect;
  //       const selectedDecks = Array.from(
  //         deckSelectElement.querySelectorAll("option:checked"),
  //         e => parseInt((e as HTMLOptionElement).value),
  //       );
  
  //       apiSSMCreate(
  //         event.target.elements.cssmTitle.value,
  //         selectedDecks,
  //         elements.tags.value,
  //         elements.contains.value,
  //         elements.isLeech.value !== 'ANY' ? elements.isLeech.value === 'LEECH' : undefined,
  //         elements.learningStatus.value !== 'ANY' ? elements.learningStatus.value as LearningStatus : undefined,
  //         minEaseValue,
  //         maxEaseValue,
  //         (response, status) => {
  //           if (status === 201) {
  //             window.location.href = `/customstudy/${response.id}/study/`;
  //           } else {
  //             // Error creating new SSM
  //             errorHandler(response, status, 5005);
  //           }
  //           setCreatingCSSM(false);
  //         },
  //       );
  //     }
  //   }
  // }

  const actionAllFlashcards = action => {
    return event => {
      event.preventDefault();

      if (!searchedFlashcards) return;
      if (action === 'DELETE') {
        if (window.prompt(`
Are you sure you want to delete ${searchedFlashcards.length} flashcards?  This action is instant and irreversible.
If you wish to continue, please type "DELETE", without the quotes.
        `) !== 'DELETE') return;
      }

      apiFlashcardReviewInstanceEdit(searchedFlashcards.map(flashcard => flashcard.id), action, (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else {
          // Error bulk editing flashcard review instances
          errorHandler(response, status, 2011);
        }
      });
    }
  }

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
        {searchedFlashcards && searchedFlashcards.length !== 0 &&
          <div>
            <hr />
            <h1>Results</h1>
            {/* <Button id='custom-study-link' onClick={() => setShowCSSMModal(true)}>
              {creatingCSSM ? 'Loading...' : 'Study these flashcards (Custom Study)'}
            </Button> */}
            {/* TODO: re add custom study */}
            <Modal show={showCSSMModal} onHide={() => setShowCSSMModal(false)}>
              <Modal.Header>
                <Modal.Title>
                  Creating Filtered Deck
                </Modal.Title>
              </Modal.Header>
              {/* <Form onSubmit={createCSSM}>
                <Modal.Body>
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type='text'
                    name='cssmTitle'
                    required
                  />
                </Modal.Body>
                <Modal.Footer>
                  <Button variant='secondary' onClick={() => setShowCSSMModal(false)}>Cancel</Button>
                  <Button type='submit'>Create</Button>
                </Modal.Footer>
              </Form> */}
            </Modal>
            <DropdownButton id='dropdown-basic-button' title='Actions' className='mt-1'>
              <Dropdown.Item as={Button} onClick={actionAllFlashcards('SUSPEND')}>Suspend All</Dropdown.Item>
              <Dropdown.Item as={Button} onClick={actionAllFlashcards('UNSUSPEND')}>Unsuspend All</Dropdown.Item>
              <Dropdown.Item as={Button} onClick={actionAllFlashcards('DELETE')}>Delete All</Dropdown.Item>
            </DropdownButton>
          </div>
        }
        {didSearch && searchedFlashcards && (
          searchedFlashcards.length > 0 ?
            // <FlashCardsList flashcardList={searchedFlashcards} showParentDeckTitle={true} artificialPaginationNumFlashcards={250} fixSlateLazy={true} /> 
            <p>Disabled for now</p>
          : <h5>No results! Maybe try a less specific search, or check your parameters?</h5>
        )}
      </div>
    </>
  );
}